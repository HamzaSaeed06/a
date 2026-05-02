"use client";

import { useEffect, useMemo, useState } from "react";
import { ListChecks, Plus, Trash, Person, GlobeHemisphereWest, IdentificationBadge, Money, CheckCircle, Prohibit, Clock } from "@phosphor-icons/react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  ConfirmModal,
  EmptyState,
  Field,
  Modal,
  PageHeader,
  SearchInput,
  Select,
  SectionCard,
  TableDropdown,
  Toast,
  ViewToggle,
  useToast,
} from "../../components/UI";
import { UserCircle } from "@phosphor-icons/react";
import { apiFetch } from "../../lib/api";
import { formatCurrency, cn } from "../../lib/format";

export default function PoolPage() {
  const [pool, setPool] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ player_id: "" });
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const { toasts, toast, removeToast } = useToast();
  
  const PAGE_SIZE = 7;

  const fetchPool = () => {
    apiFetch("/admin/auction-pool").then(setPool).catch(() => {});
    apiFetch("/admin/players").then(setAllPlayers).catch(() => {});
  };

  useEffect(() => {
    fetchPool();
  }, []);

  const inPool = useMemo(() => new Set(pool.map((item) => String(item.player_id))), [pool]);
  const availablePlayers = useMemo(
    () => allPlayers.filter((player) => !inPool.has(String(player.player_id))),
    [allPlayers, inPool],
  );

  const filtered = pool.filter((item) =>
    [item.name, item.role, item.status]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const addToPool = async () => {
    try {
      const auctions = await apiFetch("/super-admin/auctions");
      if (!auctions.length) {
        throw new Error("Create an auction season first before populating the pool.");
      }
      await apiFetch("/admin/auction-pool", {
        method: "POST",
        body: JSON.stringify({
          player_id: form.player_id,
          auction_id: auctions[0].auction_id,
        }),
      });
      toast("Player added to pool.", "success");
      setModal(false);
      fetchPool();
    } catch (error) {
      toast(error.message, "error");
    }
  };

  const remove = async (id) => {
    try {
      await apiFetch(`/admin/auction-pool/${id}`, { method: "DELETE" });
      toast("Player removed from pool.", "success");
      fetchPool();
    } catch (error) {
      toast(error.message, "error");
    }
  };

  return (
    <DashboardLayout allowedRoles={["Admin", "Super Admin"]}>
      <Toast toasts={toasts} removeToast={removeToast} />
      <PageHeader title="Auction Pool" subtitle="Queue players for the live auction flow" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={(event) => { setSearch(event.target.value); setPage(1); }}
          placeholder="Search queued players..."
        />
        <div className="flex items-center gap-3">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          <button
            className="btn-primary shrink-0"
            onClick={() => {
              setForm({ player_id: availablePlayers[0]?.player_id || "" });
              setModal(true);
            }}
          >
            <Plus size={18} />
            Add Player
          </button>
        </div>
      </div>

      <div className="mt-6">
        <SectionCard padded={false}>
          {filtered.length ? (
            <div className="overflow-auto h-[calc(100vh-200px)] relative border-t border-slate-100 no-scrollbar">
              {viewMode === "table" ? (
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-10 bg-white border-b border-slate-200">
                      <tr>
                        <th>Lot</th>
                        <th>Player</th>
                        <th>Role</th>
                        <th>Base Price</th>
                        <th>Status</th>
                        <th className="w-16">Options</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((item) => (
                        <tr key={item.player_id} className="border-b border-slate-200 hover:bg-slate-50/50 transition-colors">
                          <td className="font-bold text-slate-400">#{item.lot_number}</td>
                          <td className="font-semibold text-slate-950">
                            <div className="flex items-center gap-2">
                              {item.country_code && (
                                <img
                                  src={`https://flagcdn.com/w40/${item.country_code.toLowerCase()}.png`}
                                  alt=""
                                  className="country-flag"
                                />
                              )}
                              {item.name}
                            </div>
                          </td>
                          <td className="text-slate-500">{item.role || "-"}</td>
                          <td className="font-bold text-slate-900">{formatCurrency(item.base_price)}</td>
                          <td>
                            <span className={`badge gap-1.5 ${item.status === "active" ? "badge-accent" : item.status === "processed" ? "badge-neutral" : "badge-success"}`}>
                              {item.status === "active" ? <Clock size={14} weight="bold" /> : item.status === "processed" ? <Prohibit size={14} weight="bold" /> : <CheckCircle size={14} weight="bold" />}
                              {item.status}
                            </span>
                          </td>
                          <td>
                            <TableDropdown
                              options={[
                                { label: "Remove", icon: Trash, danger: true, onClick: () => setConfirm(item.pool_id) }
                              ]}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                </table>
              ) : (
                <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 bg-slate-50/50">
                    {paginated.map((item) => (
                      <div key={item.pool_id} className="surface group hover:border-slate-900 transition-all duration-300">
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 shrink-0 rounded-full bg-slate-950 text-white flex items-center justify-center overflow-hidden">
                                 {item.image ? (
                                   <img src={item.image} alt="" className="w-full h-full object-cover" />
                                 ) : (
                                   <span className="text-sm font-bold">{item.name?.substring(0, 2).toUpperCase()}</span>
                                 )}
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-slate-950 truncate leading-none mb-1">{item.name}</h3>
                                <div className="flex items-center gap-1.5">
                                   <div className="h-1 w-1 rounded-full bg-slate-300" />
                                   <p className="text-[10px] font-medium text-slate-400 capitalize">{item.role || "Role"}</p>
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-300">#{item.lot_number}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                             <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-medium text-slate-400 capitalize tracking-tight">Base Price</span>
                                <span className="text-sm font-semibold text-slate-900">{formatCurrency(item.base_price)}</span>
                             </div>
                             <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-medium text-slate-400 capitalize tracking-tight">Origin</span>
                                <span className="text-[11px] font-semibold text-slate-600">{item.country_name || "N/A"}</span>
                             </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                             <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest", 
                               item.status === "active" ? "bg-blue-50 text-blue-700" : 
                               item.status === "processed" ? "bg-slate-50 text-slate-500" : 
                               "bg-emerald-50 text-emerald-700"
                             )}>
                                <div className={cn("h-1 w-1 rounded-full", 
                                  item.status === "active" ? "bg-blue-500" : 
                                  item.status === "processed" ? "bg-slate-400" : 
                                  "bg-emerald-500"
                                )} />
                                <span className="capitalize">{item.status}</span>
                             </div>
                             
                             <button 
                               className="text-[10px] font-semibold text-slate-400 hover:text-red-600 transition-colors capitalize"
                               onClick={() => setConfirm(item.pool_id)}
                             >
                               Remove
                             </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={ListChecks}
              title="Auction pool is empty"
              sub="Queue players here so they can be nominated in the live auction flow."
            />
          )}
        </SectionCard>
        <div className="mt-2">
          <Pagination current={page} total={totalPages} onChange={setPage} />
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Player to Auction Pool" width={420}>
        <Field label="Select Player" icon={UserCircle}>
          <Select
            value={form.player_id}
            onChange={(val) => setForm({ player_id: val })}
            options={availablePlayers.map(p => ({
              label: `${p.name} · ${p.role}`,
              value: p.player_id
            }))}
            placeholder="Select player"
          />
        </Field>

        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-outline" onClick={() => setModal(false)}>
            Cancel
          </button>
          <button className="btn-primary" onClick={addToPool}>
            Add to Pool
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove(confirm)}
        title="Remove Player"
        message="This removes the player from the waiting pool."
        danger
      />
    </DashboardLayout>
  );
}
