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
  Toast,
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
  const { toasts, toast, removeToast } = useToast();

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
      <PageHeader
        title="Teams and Franchises"
        subtitle="Manage team identity, budgets, and the linked franchise login accounts."
        action={<button className="btn-primary" onClick={openAdd}><Plus size={18} />Add Team</button>}
      />

      <SearchInput
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search teams, cities, or owners"
      />

      <div className="mt-6">
        <SectionCard padded={false}>
          {filtered.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>City</th>
                    <th>Owner</th>
                    <th>Total Budget</th>
                    <th>Remaining</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((team) => (
                    <tr key={team.team_id}>
                      <td className="font-semibold text-slate-950">{team.team_name}</td>
                      <td>{team.city || "-"}</td>
                      <td>{team.owner_name || "-"}</td>
                      <td>{formatCurrency(team.total_budget)}</td>
                      <td className="font-semibold text-[var(--accent)]">
                        {formatCurrency(team.remaining_budget)}
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button className="btn-ghost !p-2" onClick={() => openEdit(team)}>
                            <PencilSimple size={16} />
                          </button>
                          <button className="btn-ghost !p-2 !text-[var(--danger)]" onClick={() => setConfirm(team.team_id)}>
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
            <input className="input" value={form.team_name} onChange={(event) => setForm((current) => ({ ...current, team_name: event.target.value }))} />
          </Field>
          <Field label="City">
            <input className="input" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />
          </Field>
          <Field label="Home Ground">
            <input className="input" value={form.home_ground} onChange={(event) => setForm((current) => ({ ...current, home_ground: event.target.value }))} />
          </Field>
          <Field label="Total Budget">
            <input className="input" type="number" value={form.total_budget} onChange={(event) => setForm((current) => ({ ...current, total_budget: event.target.value }))} />
          </Field>
          <Field label="Owner Name">
            <input className="input" value={form.owner_name} onChange={(event) => setForm((current) => ({ ...current, owner_name: event.target.value }))} />
          </Field>
        </div>

        {!editTeam ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label="Franchise Username">
              <input className="input" value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} />
            </Field>
            <Field label="Franchise Email">
              <input className="input" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
            </Field>
            <Field label="Franchise Password">
              <input className="input" type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
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
