"use client";

import { useEffect, useState } from "react";
import { Buildings, PencilSimple, Plus, Trash } from "@phosphor-icons/react";
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
import { formatCurrency } from "../../lib/format";

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
  
  const PAGE_SIZE = 8;

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
            <>
              {viewMode === "table" ? (
                <div className="table-wrap">
                  <table>
                    <thead>
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
                        <tr key={team.team_id}>
                          <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                          <td>
                            <div className="font-semibold text-slate-950">{team.team_name}</div>
                            <div className="text-[10px] text-slate-400 font-medium tracking-wider">{team.city || "No City"}</div>
                          </td>
                          <td>
                            <div className="text-sm text-slate-600">{team.username || "—"}</div>
                            <div className="text-[11px] text-slate-400">{team.email || "—"}</div>
                          </td>
                          <td className="text-slate-600">{team.owner_name || "-"}</td>
                          <td className="text-slate-600">{formatCurrency(team.total_budget)}</td>
                          <td className="font-bold text-emerald-600">
                            {formatCurrency(team.remaining_budget)}
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
                </div>
              ) : (
                <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8 bg-slate-50/50">
                  {paginated.map((team) => (
                    <div key={team.team_id} className="surface flex flex-col border border-slate-200 hover:border-slate-900 transition-all duration-300 overflow-hidden relative group bg-white shadow-sm hover:shadow-md rounded-xl">
                      <div className="absolute top-4 right-4 z-10">
                        <TableDropdown
                          options={[
                            { label: "Edit", icon: PencilSimple, onClick: () => openEdit(team) },
                            { label: "Delete", icon: Trash, danger: true, onClick: () => setConfirm(team.team_id) }
                          ]}
                        />
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg">
                            <Buildings size={24} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-slate-950 truncate leading-tight">{team.team_name}</h3>
                            <p className="text-xs font-semibold text-slate-400 mt-0.5">{team.city || "Global Franchise"}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <div className="text-[11px] text-slate-400 font-bold tracking-tight mb-1">OWNER</div>
                            <div className="text-sm font-black text-slate-900">{team.owner_name || "Unassigned"}</div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                              <div className="text-[11px] text-slate-400 font-bold tracking-tight mb-1">BUDGET</div>
                              <div className="text-sm font-black text-slate-950">{formatCurrency(team.total_budget)}</div>
                            </div>
                            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                              <div className="text-[11px] text-emerald-600/60 font-bold tracking-tight mb-1">BALANCE</div>
                              <div className="text-sm font-black text-emerald-700">{formatCurrency(team.remaining_budget)}</div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto pt-5 flex items-center justify-between border-t border-slate-50 mt-5">
                           <div className="flex flex-col">
                              <span className="text-[11px] text-slate-400 font-bold tracking-tight">ACCOUNT</span>
                              <span className="text-xs font-bold text-slate-700 mt-0.5">{team.username || "—"}</span>
                           </div>
                           <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter">Active</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Pagination current={page} total={totalPages} onPageChange={setPage} />
            </>
          ) : (
            <EmptyState
              icon={Buildings}
              title="No teams registered"
              sub="Create the first team and its franchise login to start the auction."
            />
          )}
        </SectionCard>
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
