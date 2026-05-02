"use client";

import { useEffect, useState } from "react";
import { Buildings, PencilSimple, Plus, Trash, MapPin, UsersThree, Wallet, CheckCircle, CaretRight } from "@phosphor-icons/react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  ConfirmModal,
  EmptyState,
  Field,
  Modal,
  PageHeader,
  SearchInput,
  SectionCard,
  Pagination,
  TableDropdown,
  Toast,
  ViewToggle,
  useToast,
} from "../../components/UI";
import { apiFetch } from "../../lib/api";
import { formatCurrency, cn } from "../../lib/format";

const emptyForm = {
  team_name: "",
  city: "",
  home_ground: "",
  total_budget: 95000000,
  owner_name: "",
  username: "",
  email: "",
  password: "",
};

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editTeam, setEditTeam] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirm, setConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const { toasts, toast, removeToast } = useToast();
  
  const PAGE_SIZE = 7;

  const fetchTeams = () => apiFetch("/admin/teams").then(setTeams).catch(() => {});

  useEffect(() => {
    fetchTeams();
  }, []);

  const filtered = teams.filter((team) =>
    [team.team_name, team.city, team.owner_name]
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
    setEditTeam(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (team) => {
    setEditTeam(team);
    setForm({
      team_name: team.team_name,
      city: team.city || "",
      home_ground: team.home_ground || "",
      total_budget: team.total_budget,
      owner_name: team.owner_name || "",
      username: team.username || "",
      email: team.email || "",
      password: "",
    });
    setModal(true);
  };

  const save = async () => {
    try {
      if (editTeam) {
        await apiFetch(`/admin/teams/${editTeam.team_id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        toast("Team updated.", "success");
      } else {
        await apiFetch("/admin/teams", {
          method: "POST",
          body: JSON.stringify(form),
        });
        toast("Team created.", "success");
      }
      setModal(false);
      fetchTeams();
    } catch (error) {
      toast(error.message, "error");
    }
  };

  const remove = async (id) => {
    try {
      await apiFetch(`/admin/teams/${id}`, { method: "DELETE" });
      toast("Team deleted.", "success");
      fetchTeams();
    } catch (error) {
      toast(error.message, "error");
    }
  };

  return (
    <DashboardLayout allowedRoles={["Admin", "Super Admin"]}>
      <Toast toasts={toasts} removeToast={removeToast} />
      <PageHeader title="Franchises and Teams" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search teams by name, city, or owner..."
        />
        <div className="flex items-center gap-3">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          <button className="btn-primary shrink-0" onClick={openAdd}>
            <Plus size={18} />
            Add Team
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
                        <th>Team</th>
                        <th>Franchise Account</th>
                        <th>Owner</th>
                        <th>Total Budget</th>
                        <th>Remaining</th>
                        <th className="w-16">Options</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((team, index) => (
                        <tr key={team.team_id} className="border-b border-slate-200 hover:bg-slate-50/50 transition-colors">
                          <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                          <td>
                            <div className="font-semibold text-slate-950">{team.team_name}</div>
                            <div className="text-[10px] text-slate-400 font-medium tracking-wider">{team.city || "No City"}</div>
                          </td>
                          <td>
                            <div className="text-sm text-slate-600">{team.username || "—"}</div>
                            <div className="text-[11px] text-slate-400">{team.email || "—"}</div>
                          </td>
                          <td>
                            <div className="text-sm font-semibold text-slate-800">{team.owner_name || "—"}</div>
                          </td>
                          <td>
                            <div className="text-sm font-bold text-slate-900">{formatCurrency(team.total_budget)}</div>
                          </td>
                          <td>
                            <div className="text-sm font-bold text-emerald-600">{formatCurrency(team.remaining_budget)}</div>
                          </td>
                          <td>
                            <TableDropdown
                              options={[
                                { label: "Edit", icon: PencilSimple, onClick: () => openEdit(team) },
                                { label: "Delete", icon: Trash, danger: true, onClick: () => setConfirm(team.team_id) }
                              ]}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 bg-slate-50/50">
                  {paginated.map((team) => (
                    <div key={team.team_id} className="surface group hover:border-slate-900 transition-all duration-300">
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-5">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 shrink-0 rounded-full bg-slate-950 text-white flex items-center justify-center overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
                               {team.logo_url ? (
                                 <img src={team.logo_url} alt="" className="w-full h-full object-cover" />
                               ) : (
                                 <span className="text-[15px] font-black tracking-tighter">{team.team_name?.substring(0, 2).toUpperCase()}</span>
                               )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-slate-950 truncate leading-none mb-1">{team.team_name}</h3>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{team.city || "No City"}</p>
                            </div>
                          </div>
                          <TableDropdown
                            options={[
                              { label: "Edit", icon: PencilSimple, onClick: () => openEdit(team) },
                              { label: "Delete", icon: Trash, danger: true, onClick: () => setConfirm(team.team_id) }
                            ]}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                           <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-medium text-slate-400 capitalize tracking-tight">Total Budget</span>
                              <span className="text-sm font-semibold text-slate-900">{formatCurrency(team.total_budget)}</span>
                           </div>
                           <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-medium text-emerald-600/70 capitalize tracking-tight">Remaining</span>
                              <span className="text-sm font-semibold text-emerald-700">{formatCurrency(team.remaining_budget)}</span>
                           </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                           <div className="flex items-center gap-2 px-2 py-0.5 rounded-md bg-slate-950 text-white text-[9px] font-semibold capitalize tracking-widest">
                              Active
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
              icon={Buildings}
              title="No teams registered"
              sub="Create the first team and its franchise login to start the auction."
            />
          )}
        </SectionCard>
        <div className="mt-2">
          <Pagination current={page} total={totalPages} onChange={setPage} />
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editTeam ? "Edit Team" : "Create Team"}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Team Name">
            <input className="input" placeholder="e.g. Karachi Kings" value={form.team_name} onChange={(event) => setForm((current) => ({ ...current, team_name: event.target.value }))} />
          </Field>
          <Field label="City">
            <input className="input" placeholder="e.g. Karachi" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />
          </Field>
          <Field label="Home Ground">
            <input className="input" placeholder="e.g. National Stadium" value={form.home_ground} onChange={(event) => setForm((current) => ({ ...current, home_ground: event.target.value }))} />
          </Field>
          <Field label="Total Budget">
            <input className="input" type="number" placeholder="e.g. 95000000" value={form.total_budget} onChange={(event) => setForm((current) => ({ ...current, total_budget: event.target.value }))} />
          </Field>
          <Field label="Owner Name">
            <input className="input" placeholder="e.g. Ali Khan" value={form.owner_name} onChange={(event) => setForm((current) => ({ ...current, owner_name: event.target.value }))} />
          </Field>
        </div>

        {!editTeam ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label="Franchise Username">
              <input className="input" placeholder="e.g. franchise_user" value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} />
            </Field>
            <Field label="Franchise Email">
              <input className="input" type="email" placeholder="e.g. team@auction.com" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
            </Field>
            <Field label="Franchise Password">
              <input className="input" type="password" placeholder="Set a strong password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
            </Field>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-outline" onClick={() => setModal(false)}>
            Cancel
          </button>
          <button className="btn-primary" onClick={save}>
            Save Team
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove(confirm)}
        title="Delete Team"
        message="This will delete the team and its linked franchise account."
        danger
      />
    </DashboardLayout>
  );
}
