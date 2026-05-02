"use client";

import { useEffect, useMemo, useState } from "react";
import { ListChecks, Plus, Trash, Person } from "@phosphor-icons/react";
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
import { formatCurrency } from "../../lib/format";

export default function PoolPage() {
  const [pool, setPool] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ player_id: "" });
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const { toasts, toast, removeToast } = useToast();

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
          onChange={(event) => setSearch(event.target.value)}
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
            <>
              {viewMode === "table" ? (
                <div className="table-wrap">
                  <table>
                    <thead>
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
                      {filtered.map((item) => (
                        <tr key={item.pool_id}>
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
                            <span className={`badge ${item.status === "active" ? "badge-accent" : item.status === "processed" ? "badge-neutral" : "badge-success"}`}>
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
                </div>
              ) : (
                <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8 bg-slate-50/50">
                  {filtered.map((item) => (
                    <div key={item.pool_id} className="surface flex flex-col border border-slate-200 hover:border-slate-900 transition-all duration-300 overflow-hidden relative group bg-white shadow-sm hover:shadow-md rounded-xl">
                      <div className="absolute top-4 right-4 z-10">
                        <TableDropdown
                          options={[
                            { label: "Remove", icon: Trash, danger: true, onClick: () => setConfirm(item.pool_id) }
                          ]}
                        />
                      </div>
                      <div className="absolute top-4 left-4 z-10">
                         <span className="text-[10px] font-black text-slate-300 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">LOT #{item.lot_number}</span>
                      </div>
                      <div className="p-6 flex-1 flex flex-col mt-4">
                        <div className="flex items-center gap-4 mb-5">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-50 border border-slate-100">
                            <Person size={24} className="text-slate-400" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-slate-950 truncate leading-tight">{item.name}</h3>
                            <p className="text-xs font-semibold text-slate-400 mt-0.5">{item.role || "Player"}</p>
                          </div>
                        </div>
                        
                        <div className="mt-auto space-y-3.5 pt-4 border-t border-slate-50">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-400 font-bold tracking-tight">BASE PRICE</span>
                            <span className="text-sm font-black text-slate-950">{formatCurrency(item.base_price)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-400 font-bold tracking-tight">COUNTRY</span>
                            <div className="flex items-center gap-1.5">
                              {item.country_code && (
                                <img
                                  src={`https://flagcdn.com/w20/${item.country_code.toLowerCase()}.png`}
                                  alt=""
                                  className="w-4 h-3 object-contain rounded-sm"
                                />
                              )}
                            </div>
                          </div>
                          <div className="pt-2">
                             <span className={cn(
                               "inline-flex w-full justify-center rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-widest border",
                               item.status === "active" ? "bg-blue-50 text-blue-700 border-blue-100" : 
                               item.status === "processed" ? "bg-slate-50 text-slate-600 border-slate-100" : 
                               "bg-emerald-50 text-emerald-700 border-emerald-100"
                             )}>
                                {item.status}
                             </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={ListChecks}
              title="Auction pool is empty"
              sub="Queue players here so they can be nominated in the live auction flow."
            />
          )}
        </SectionCard>
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
