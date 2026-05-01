"use client";

import { useEffect, useState } from "react";
import { Eye, IdentificationBadge, PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import DashboardLayout from "../../components/DashboardLayout";
import PlayerStatsOverlay from "../../components/PlayerStatsOverlay";
import {
  ConfirmModal,
  EmptyState,
  Field,
  Modal,
  PageHeader,
  SearchInput,
  SectionCard,
  Toast,
  useToast,
} from "../../components/UI";
import { apiFetch } from "../../lib/api";
import { formatCurrency } from "../../lib/format";

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
  const { toasts, toast, removeToast } = useToast();

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
      <PageHeader
        title="Player Registry"
        subtitle="Maintain player records, identity media, price bands, and role metadata before auction day."
        action={<button className="btn-primary" onClick={openAdd}><Plus size={18} />Add Player</button>}
      />

      <SearchInput
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search players by name, role, country, or category"
      />

      <div className="mt-6">
        <SectionCard padded={false}>
          {filtered.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Role</th>
                    <th>Country</th>
                    <th>Category</th>
                    <th>Base Price</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((player) => (
                    <tr key={player.player_id}>
                      <td className="font-semibold text-slate-950">{player.name}</td>
                      <td>{player.role || "-"}</td>
                      <td>{player.country_name || "-"}</td>
                      <td>{player.category_name || "-"}</td>
                      <td>{formatCurrency(player.base_price)}</td>
                      <td>
                        <span className={`badge ${player.status === "sold" ? "badge-success" : player.status === "withdrawn" ? "badge-danger" : "badge-neutral"}`}>
                          {player.status || "unsold"}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button className="btn-ghost !p-2 !text-[var(--accent)]" onClick={() => setPreview(player)}>
                            <Eye size={16} />
                          </button>
                          <button className="btn-ghost !p-2" onClick={() => openEdit(player)}>
                            <PencilSimple size={16} />
                          </button>
                          <button className="btn-ghost !p-2 !text-[var(--danger)]" onClick={() => setConfirm(player.player_id)}>
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
          <Field label="Full Name">
            <input className="input" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          </Field>
          <Field label="Age">
            <input className="input" type="number" value={form.age} onChange={(event) => setForm((current) => ({ ...current, age: event.target.value }))} />
          </Field>
          <Field label="Role">
            <select className="select" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}>
              {ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </Field>
          <Field label="Base Price">
            <input className="input" type="number" value={form.base_price} onChange={(event) => setForm((current) => ({ ...current, base_price: event.target.value }))} />
          </Field>
          <Field label="Batting Style">
            <select className="select" value={form.batting_style} onChange={(event) => setForm((current) => ({ ...current, batting_style: event.target.value }))}>
              {BATTING.map((style) => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </Field>
          <Field label="Bowling Style">
            <select className="select" value={form.bowling_style} onChange={(event) => setForm((current) => ({ ...current, bowling_style: event.target.value }))}>
              {BOWLING.map((style) => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </Field>
          <Field label="Category">
            <select className="select" value={form.category_id} onChange={(event) => setForm((current) => ({ ...current, category_id: event.target.value }))}>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>{category.category_name}</option>
              ))}
            </select>
          </Field>
          <Field label="Country">
            <select className="select" value={form.country_id} onChange={(event) => setForm((current) => ({ ...current, country_id: event.target.value }))}>
              <option value="">Select country</option>
              {countries.map((country) => (
                <option key={country.country_id} value={country.country_id}>{country.country_name}</option>
              ))}
            </select>
          </Field>
          <Field label="Player Photo">
            <input className="input" type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
          </Field>
          <Field label="Player Video">
            <input className="input" type="file" accept="video/*" onChange={(event) => setVideoFile(event.target.files?.[0] || null)} />
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
