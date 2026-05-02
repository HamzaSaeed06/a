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
import { formatCurrency } from "../../lib/format";
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
  
  const PAGE_SIZE = 10;

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
            <>
              {viewMode === "table" ? (
                <div className="table-wrap">
                  <table>
                    <thead>
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
                        <tr key={player.player_id}>
                          <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                          <td className="font-semibold text-slate-950">{player.name}</td>
                          <td>{player.role || "-"}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              {player.country_code && (
                                <img
                                  src={
                                    countriesData.find(c => c.code.toLowerCase() === player.country_code.toLowerCase())?.flagUrl 
                                    || `https://flagcdn.com/w40/${player.country_code.toLowerCase()}.png`
                                  }
                                  alt=""
                                  className="country-flag"
                                  style={{ objectFit: 'contain' }}
                                />
                              )}
                              <span className="text-slate-600">{player.country_name || "-"}</span>
                              {player.country_code && <span className="text-[0.65rem] font-bold text-slate-400 bg-slate-100 px-1 rounded uppercase tracking-wider">{player.country_code}</span>}
                            </div>
                          </td>
                          <td className="text-slate-500 font-medium">{player.category_name || "-"}</td>
                          <td className="font-bold text-slate-900">{formatCurrency(player.base_price)}</td>
                          <td>
                            <span className={`badge ${player.status === "sold" ? "badge-success" : player.status === "withdrawn" ? "badge-danger" : "badge-neutral"}`}>
                              {player.status || "unsold"}
                            </span>
                          </td>
                          <td>
                            <TableDropdown
                              options={[
                                { label: "View Profile", icon: Eye, onClick: () => setPreview(player) },
                                { label: "Edit", icon: PencilSimple, onClick: () => openEdit(player) },
                                { label: "Delete", icon: Trash, danger: true, onClick: () => setConfirm(player.player_id) }
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
                  {paginated.map((player) => (
                    <div key={player.player_id} className="surface flex flex-col border border-slate-200 hover:border-slate-900 transition-all duration-300 overflow-hidden relative group bg-white shadow-sm hover:shadow-md rounded-xl">
                      <div className="absolute top-4 right-4 z-10">
                        <TableDropdown
                          options={[
                            { label: "View Profile", icon: Eye, onClick: () => setPreview(player) },
                            { label: "Edit", icon: PencilSimple, onClick: () => openEdit(player) },
                            { label: "Delete", icon: Trash, danger: true, onClick: () => setConfirm(player.player_id) }
                          ]}
                        />
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-4 mb-5">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-50 border border-slate-100">
                            <Person size={24} className="text-slate-400" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-slate-950 truncate leading-tight">{player.name}</h3>
                            <p className="text-xs font-semibold text-slate-400 mt-0.5">{player.role || "Player"}</p>
                          </div>
                        </div>
                        
                        <div className="mt-auto space-y-3.5 pt-4 border-t border-slate-50">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-400 font-bold tracking-tight">BASE PRICE</span>
                            <span className="text-sm font-black text-slate-950">{formatCurrency(player.base_price)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-400 font-bold tracking-tight">CATEGORY</span>
                            <span className="text-[11px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{player.category_name || "-"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-400 font-bold tracking-tight">COUNTRY</span>
                            <div className="flex items-center gap-1.5">
                              {player.country_code && (
                                <img
                                  src={
                                    countriesData.find(c => c.code.toLowerCase() === player.country_code.toLowerCase())?.flagUrl 
                                    || `https://flagcdn.com/w20/${player.country_code.toLowerCase()}.png`
                                  }
                                  alt=""
                                  className="w-4 h-3 object-contain rounded-sm"
                                />
                              )}
                              <span className="text-xs font-bold text-slate-700">{player.country_name || "-"}</span>
                            </div>
                          </div>
                          <div className="pt-2">
                             <span className={cn(
                               "inline-flex w-full justify-center rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-widest border",
                               player.status === "sold" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : 
                               player.status === "withdrawn" ? "bg-red-50 text-red-700 border-red-100" : 
                               "bg-slate-50 text-slate-600 border-slate-100"
                             )}>
                                {player.status || "unsold"}
                             </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Pagination 
                current={page} 
                total={totalPages} 
                onPageChange={setPage} 
              />
            </>
          ) : (
            <EmptyState
              icon={IdentificationBadge}
              title="No players registered"
              sub="Add the first player profile to start building the auction pool."
            />
          )}
        </SectionCard>
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
