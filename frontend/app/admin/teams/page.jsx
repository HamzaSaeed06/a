"use client";

import { useEffect, useState } from "react";
import { Buildings, PencilSimple, Plus, Trash, MapPin, UsersThree, Wallet, CheckCircle, CaretRight } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../lib/auth";
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
  ViewToggle,
  Toast,
  useToast,
  Button,
  Input,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Drawer,
  MiniChart,
  LineChart,
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
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSearch, setDrawerSearch] = useState("");
  const [squad, setSquad] = useState([]);
  const [saving, setSaving] = useState(false);
  const { user: currentUser } = useAuth();
  const { toasts, toast, removeToast } = useToast();
  
  const PAGE_SIZE = 7;

  const fetchTeams = () => 
    apiFetch("/admin/teams")
      .then(setTeams)
      .catch((err) => toast("Failed to load franchise teams: " + err.message, "error"));

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      apiFetch(`/admin/team-squad/${selectedTeam.team_id}`)
        .then(setSquad)
        .catch(() => setSquad([]));
    }
  }, [selectedTeam]);

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
    if (!form.team_name) return toast("Team name is required.", "error");
    if (!editTeam && (!form.username || !form.password)) return toast("Username and password are required for new accounts.", "error");
    
    setSaving(true);
    try {
      if (editTeam) {
        await apiFetch(`/admin/teams/${editTeam.team_id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        toast("Franchise team updated successfully.", "success");
      } else {
        await apiFetch("/admin/teams", {
          method: "POST",
          body: JSON.stringify(form),
        });
        toast("New franchise team registered successfully.", "success");
      }
      setModal(false);
      fetchTeams();
    } catch (error) {
      toast(error.message || "Failed to save team details.", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await apiFetch(`/admin/teams/${id}`, { method: "DELETE" });
      toast("Franchise team and linked account deleted successfully.", "success");
      fetchTeams();
    } catch (error) {
      toast("Error deleting franchise team: " + error.message, "error");
    }
  };

  return (
    <DashboardLayout allowedRoles={["Admin", "Super Admin"]}>
      <Toast toasts={toasts} removeToast={removeToast} />
      <PageHeader title="Franchises and Teams" subtitle="Manage tournament participants and budgets" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search teams by name, city, or owner..."
        />
        <div className="flex items-center gap-3">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
          <Button variant="primary" className="shrink-0" onClick={openAdd}>
            <Plus size={18} />
            Add Team
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <SectionCard padded={false} fullHeight={true}>
          {filtered.length ? (
            <>
              {viewMode === "table" ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">S.No</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Franchise Account</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Total Budget</TableHead>
                        <TableHead>Remaining</TableHead>
                        <TableHead className="w-16">Options</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.map((team, index) => (
                        <TableRow 
                          key={team.team_id} 
                          className="hover:bg-slate-50/80"
                        >
                          <TableCell className="font-medium text-slate-500">{(page - 1) * PAGE_SIZE + index + 1}</TableCell>
                          <TableCell>
                             <div className="flex items-center gap-3">
                                 <div className={cn("h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold border border-slate-100 shadow-sm overflow-hidden", !team.logo_url && "bg-slate-900 text-white")}>
                                    {team.logo_url ? (
                                       <img src={team.logo_url} className="w-full h-full object-contain" alt="" />
                                    ) : team.team_name?.substring(0, 2).toUpperCase()}
                                 </div>
                                <div className="font-semibold text-slate-950">{team.team_name}</div>
                             </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-slate-600 leading-tight">{team.username || "—"}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{team.email || "—"}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                                <div className={cn("h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold border border-slate-200 overflow-hidden", !team.owner_image_url && "bg-slate-100 text-slate-600")}>
                                   {team.owner_image_url ? (
                                      <img src={team.owner_image_url} className="w-full h-full object-contain" alt="" />
                                   ) : team.owner_name?.substring(0, 2).toUpperCase()}
                                </div>
                               <div className="text-sm font-semibold text-slate-800">{team.owner_name || "—"}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-bold text-slate-900">{formatCurrency(team.total_budget)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-bold text-slate-950">{formatCurrency(team.remaining_budget)}</div>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <TableDropdown
                              options={[
                                { label: "Edit", icon: PencilSimple, onClick: () => openEdit(team) },
                                { label: "Delete", icon: Trash, danger: true, onClick: () => setConfirm(team.team_id) }
                              ]}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="overflow-auto relative border-t border-slate-100 no-scrollbar">
                    <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 bg-slate-50/50">
                  {paginated.map((team) => (
                    <div 
                      key={team.team_id} 
                      className="surface group hover:border-slate-900 transition-all duration-300 cursor-pointer"
                      onClick={() => {
                        setSelectedTeam(team);
                        setDrawerOpen(true);
                      }}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                             <div className={cn("h-12 w-12 shrink-0 rounded-full flex items-center justify-center text-sm font-bold border border-slate-100 shadow-sm overflow-hidden", !team.logo_url && "bg-slate-900 text-white")}>
                                {team.logo_url ? (
                                   <img src={team.logo_url} className="w-full h-full object-contain" alt="" />
                                ) : team.team_name?.substring(0, 2).toUpperCase()}
                             </div>
                            <div className="min-w-0">
                               <h3 className="text-sm font-bold text-slate-950 truncate leading-none mb-1">{team.team_name}</h3>
                               <p className="text-ui-xs text-slate-400 font-medium truncate">{team.email || "No email"}</p>
                            </div>
                          </div>
                          <div onClick={(e) => e.stopPropagation()}>
                            <TableDropdown
                              options={[
                                { label: "Edit", icon: PencilSimple, onClick: () => openEdit(team) },
                                { label: "Delete", icon: Trash, danger: true, onClick: () => setConfirm(team.team_id) }
                              ]}
                            />
                          </div>
                        </div>

                        <div className="py-4 border-y border-slate-100 space-y-4">
                           <div>
                              <span className="block text-ui-xs font-medium text-slate-500 mb-1">Franchise owner</span>
                              <div className="flex items-center gap-2">
                                 <div className={cn("h-6 w-6 rounded-full flex items-center justify-center text-[8px] font-bold overflow-hidden shrink-0", !team.owner_image_url && "bg-slate-100 text-slate-600")}>
                                    {team.owner_image_url ? (
                                       <img src={team.owner_image_url} className="w-full h-full object-contain" alt="" />
                                    ) : team.owner_name?.substring(0, 2).toUpperCase()}
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-ui-semibold text-slate-900 leading-none mb-1">{team.owner_name || "—"}</span>
                                    <span className="text-[10px] text-slate-400 font-medium truncate">{team.email || "No email"}</span>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col">
                                 <span className="text-ui-xs font-medium text-slate-500 mb-1">Total purse</span>
                                 <span className="text-ui-semibold text-slate-900">{formatCurrency(team.total_budget)}</span>
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-ui-xs font-medium text-slate-500 mb-1">Remaining budget</span>
                                 <span className="text-ui-semibold text-slate-900">{formatCurrency(team.remaining_budget)}</span>
                              </div>
                           </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                           <div className="flex items-center gap-1.5 text-slate-400">
                              <MapPin size={14} />
                              <span className="text-ui-xs font-medium uppercase tracking-tight">
                                 {team.home_ground || "National Stadium"}, {team.city}
                              </span>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
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
            <Input placeholder="e.g. Karachi Kings" value={form.team_name} onChange={(event) => setForm((current) => ({ ...current, team_name: event.target.value }))} />
          </Field>
          <Field label="City">
            <Input placeholder="e.g. Karachi" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />
          </Field>
          <Field label="Home Ground">
            <Input placeholder="e.g. National Stadium" value={form.home_ground} onChange={(event) => setForm((current) => ({ ...current, home_ground: event.target.value }))} />
          </Field>
          <Field label="Total Budget">
            <Input type="number" placeholder="e.g. 95000000" value={form.total_budget} onChange={(event) => setForm((current) => ({ ...current, total_budget: event.target.value }))} />
          </Field>
          <Field label="Owner Name">
            <Input placeholder="e.g. Ali Khan" value={form.owner_name} onChange={(event) => setForm((current) => ({ ...current, owner_name: event.target.value }))} />
          </Field>
        </div>

        {(!editTeam || currentUser?.role === 'Super Admin') ? (
          <div className="mt-6 pt-6 border-t border-slate-100">
             <h4 className="text-ui-xs font-bold text-slate-500 uppercase mb-4">Franchise Login Account</h4>
             <div className="grid gap-4 md:grid-cols-2">
                <Field label="Franchise Username">
                  <Input 
                    placeholder="e.g. franchise_user" 
                    value={form.username} 
                    onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} 
                  />
                </Field>
                <Field label="Franchise Email">
                  <Input 
                    type="email" 
                    placeholder="e.g. team@auction.com" 
                    value={form.email} 
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} 
                  />
                </Field>
                <Field label={editTeam ? "Reset Password" : "Franchise Password"}>
                  <Input 
                    type="password" 
                    placeholder={editTeam ? "Leave blank to keep current" : "Set a strong password"} 
                    value={form.password} 
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} 
                  />
                </Field>
             </div>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={save}
            loading={saving}
            loadingText="Saving Details..."
          >
            Save Team
          </Button>
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
