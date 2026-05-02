"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Eye,
  GlobeHemisphereWest,
  IdentificationBadge,
  Image as ImageIcon,
  Money,
  PencilSimple,
  Person,
  Plus,
  Shield,
  Star,
  Tag,
  Trash,
  UserCircleGear,
  Video,
  CheckCircle,
  Prohibit,
  Clock,
  CaretRight
} from "@phosphor-icons/react";
import DashboardLayout from "../../components/DashboardLayout";
import PlayerStatsOverlay from "../../components/PlayerStatsOverlay";
import {
  ConfirmModal,
  EmptyState,
  Field,
  Modal,
  PageHeader,
  SearchInput,
  Select,
  SectionCard,
  Pagination,
  TableDropdown,
  Toast,
  ViewToggle,
  useToast,
} from "../../components/UI";
import { apiFetch } from "../../lib/api";
import { formatCurrency, cn } from "../../lib/format";
import { countriesData } from "../../lib/countries";

const BATTING = ["Right-hand bat", "Left-hand bat"];
const BOWLING = [
  "Right-arm fast",
  "Right-arm medium",
  "Right-arm off break",
  "Left-arm fast",
  "Left-arm medium",
  "Left-arm orthodox",
  "Left-arm wrist spin",
  "Leg-break",
  "N/A",
];
const ROLES = ["Batsman", "Bowler", "All-rounder", "Wicket-keeper"];

const emptyForm = {
  name: "",
  age: "",
  role: "Batsman",
  batting_style: "Right-hand bat",
  bowling_style: "N/A",
  base_price: 500000,
  category_id: "",
  country_id: "",
};

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editPlayer, setEditPlayer] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [preview, setPreview] = useState(null);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const { toasts, toast, removeToast } = useToast();
  
  const PAGE_SIZE = 7;

  const fetchAll = () => {
    apiFetch("/admin/players").then(setPlayers).catch(() => {});
    apiFetch("/super-admin/categories").then(setCategories).catch(() => {});
    apiFetch("/super-admin/countries").then(setCountries).catch(() => {});
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = players.filter((player) =>
    [player.name, player.role, player.country_name, player.category_name]
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

  const openAdd = () => {
    setEditPlayer(null);
    setForm({
      ...emptyForm,
      category_id: categories[0]?.category_id || "",
      country_id: countries[0]?.country_id || "",
    });
    setImageFile(null);
    setVideoFile(null);
    setModal(true);
  };

  const openEdit = (player) => {
    setEditPlayer(player);
    setForm({
      name: player.name,
      age: player.age || "",
      role: player.role || "Batsman",
      batting_style: player.batting_style || "Right-hand bat",
      bowling_style: player.bowling_style || "N/A",
      base_price: player.base_price,
      category_id: player.category_id || "",
      country_id: player.country_id || "",
    });
    setImageFile(null);
    setVideoFile(null);
    setModal(true);
  };

  const save = async () => {
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      if (imageFile) payload.append("image", imageFile);
      if (videoFile) payload.append("video", videoFile);

      if (editPlayer) {
        await apiFetch(`/admin/players/${editPlayer.player_id}`, { method: "PUT", body: payload });
        toast("Player updated.", "success");
      } else {
        await apiFetch("/admin/players", { method: "POST", body: payload });
        toast("Player created.", "success");
      }

      setModal(false);
      fetchAll();
    } catch (error) {
      toast(error.message, "error");
    }
  };

  const remove = async (id) => {
    try {
      await apiFetch(`/admin/players/${id}`, { method: "DELETE" });
      toast("Player deleted.", "success");
      fetchAll();
    } catch (error) {
      toast(error.message, "error");
    }
  };

  return (
    <DashboardLayout allowedRoles={["Admin", "Super Admin"]}>
      <Toast toasts={toasts} removeToast={removeToast} />
      <PlayerStatsOverlay player={preview} visible={!!preview} bidAmount={preview?.base_price} />
      <PageHeader title="Player Registry" subtitle="Manage player pool and profiles" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, role, country, or category..."
        />
        <div className="flex items-center gap-3">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          <button className="btn-primary shrink-0" onClick={openAdd}>
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
                      <th>S.No</th>
                      <th>Player</th>
                      <th>Role</th>
                      <th>Country</th>
                      <th>Category</th>
                      <th>Base Price</th>
                      <th>Status</th>
                      <th className="w-16">Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((player, index) => (
                      <tr key={player.player_id} className="border-b border-slate-200 hover:bg-slate-50/50 transition-colors">
                        <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                        <td className="font-semibold text-slate-950">{player.name}</td>
                        <td>{player.role || "-"}</td>
                        <td className="text-slate-500">
                          <div className="flex items-center gap-2">
                            {player.country_code && (
                              <img
                                src={`https://flagcdn.com/w40/${player.country_code.toLowerCase()}.png`}
                                alt=""
                                className="country-flag"
                              />
                            )}
                            {player.country_name || "-"}
                          </div>
                        </td>
                        <td className="text-slate-500 uppercase">{player.category_name || "-"}</td>
                        <td className="font-bold text-slate-900">{formatCurrency(player.base_price)}</td>
                        <td>
                          <span className={`badge ${player.status === "sold" ? "badge-success" : player.status === "unsold" ? "badge-neutral" : "badge-accent"}`}>
                            {player.status}
                          </span>
                        </td>
                        <td>
                          <TableDropdown
                            options={[
                              { label: "Edit", icon: PencilSimple, onClick: () => openEdit(player) },
                              { label: "Delete", icon: Trash, danger: true, onClick: () => setConfirm(player.player_id) }
                            ]}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8 bg-slate-50/50">
                  {paginated.map((player) => (
                    <div key={player.player_id} className="surface group hover:border-slate-900 transition-all duration-300">
                       <div className="p-4">
                        <div className="flex items-start justify-between mb-5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-950 text-white flex items-center justify-center overflow-hidden">
                               {player.image ? (
                                 <img src={player.image} alt="" className="w-full h-full object-cover" />
                               ) : (
                                 <span className="text-sm font-bold">{player.name?.substring(0, 2).toUpperCase()}</span>
                               )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-slate-950 truncate leading-none mb-1">{player.name}</h3>
                              <div className="flex items-center gap-1.5">
                                 {player.country_code && (
                                   <img src={`https://flagcdn.com/w20/${player.country_code.toLowerCase()}.png`} alt="" className="h-2.5 w-4 object-contain rounded-[1px]" />
                                 )}
                                 <p className="text-[10px] font-medium text-slate-400 capitalize">{player.role || "Player"}</p>
                              </div>
                            </div>
                          </div>
                          <TableDropdown
                            options={[
                              { label: "Edit", icon: PencilSimple, onClick: () => openEdit(player) },
                              { label: "Delete", icon: Trash, danger: true, onClick: () => setConfirm(player.player_id) }
                            ]}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                           <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-medium text-slate-400 capitalize tracking-tight">Base Price</span>
                              <span className="text-sm font-semibold text-slate-900">{formatCurrency(player.base_price)}</span>
                           </div>
                           <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-medium text-slate-400 capitalize tracking-tight">Category</span>
                              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{player.category_name || "N/A"}</span>
                           </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                           <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50">
                              <div className={cn("h-1.5 w-1.5 rounded-full", 
                                player.status === "sold" ? "bg-emerald-500" : 
                                player.status === "withdrawn" ? "bg-red-500" : 
                                "bg-slate-300"
                              )} />
                              <span className="text-[10px] font-semibold text-slate-600 capitalize">{player.status || "unsold"}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={IdentificationBadge}
              title="No players registered"
              sub="Add the first player profile to start building the auction pool."
            />
          )}
        </SectionCard>
        <div className="mt-2">
          <Pagination current={page} total={totalPages} onChange={setPage} />
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editPlayer ? "Edit Player" : "Create Player"}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full Name" icon={Person}>
            <input className="input" placeholder="e.g. Babar Azam" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          </Field>
          <Field label="Age" icon={Calendar}>
            <input className="input" type="number" placeholder="e.g. 28" value={form.age} onChange={(event) => setForm((current) => ({ ...current, age: event.target.value }))} />
          </Field>
          <Field label="Role" icon={UserCircleGear}>
            <Select
              value={form.role}
              onChange={(val) => setForm((current) => ({ ...current, role: val }))}
              options={ROLES.map(r => ({ label: r, value: r }))}
            />
          </Field>
          <Field label="Base Price" icon={Money}>
            <input className="input" type="number" placeholder="e.g. 500000" value={form.base_price} onChange={(event) => setForm((current) => ({ ...current, base_price: event.target.value }))} />
          </Field>
          <Field label="Batting Style" icon={Star}>
            <Select
              value={form.batting_style}
              onChange={(val) => setForm((current) => ({ ...current, batting_style: val }))}
              options={BATTING.map(s => ({ label: s, value: s }))}
            />
          </Field>
          <Field label="Bowling Style" icon={Star}>
            <Select
              value={form.bowling_style}
              onChange={(val) => setForm((current) => ({ ...current, bowling_style: val }))}
              options={BOWLING.map(s => ({ label: s, value: s }))}
            />
          </Field>
          <Field label="Category" icon={Tag}>
            <Select
              value={form.category_id}
              onChange={(val) => {
                const cat = categories.find(c => String(c.category_id) === String(val));
                setForm((current) => ({ 
                  ...current, 
                  category_id: val,
                  base_price: cat?.base_price || current.base_price 
                }));
              }}
              options={categories.map(c => ({ label: c.category_name, value: c.category_id }))}
              placeholder="Select category"
            />
          </Field>
          <Field label="Country" icon={GlobeHemisphereWest}>
            <Select
              value={form.country_id}
              onChange={(val) => setForm((current) => ({ ...current, country_id: val }))}
              options={countries.map(c => ({ label: c.country_name, value: c.country_id }))}
              placeholder="Select country"
            />
          </Field>
          <Field label="Player Photo" icon={ImageIcon}>
            <input className="input !py-1.5" type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
          </Field>
          <Field label="Player Video" icon={Video}>
            <input className="input !py-1.5" type="file" accept="video/*" onChange={(event) => setVideoFile(event.target.files?.[0] || null)} />
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-outline" onClick={() => setModal(false)}>
            Cancel
          </button>
          <button className="btn-primary" onClick={save}>
            Save Player
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove(confirm)}
        title="Delete Player"
        message="This permanently removes the player and linked stat history."
        danger
      />
    </DashboardLayout>
  );
}
