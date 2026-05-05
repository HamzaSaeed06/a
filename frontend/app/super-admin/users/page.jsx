"use client";

import { useEffect, useState } from "react";
import {
  EnvelopeSimple,
  Key,
  PencilSimple,
  Plus,
  ShieldCheck,
  ShieldSlash,
  Trash,
  User,
  UserCircleGear,
  UserList,
} from "@phosphor-icons/react";
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
  Toast,
  useToast,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Badge,
  Button,
  Input,
  Select,
  TableDropdown,
} from "../../components/UI";
import { apiFetch } from "../../lib/api";
import { formatDate } from "../../lib/format";

const ROLES = ["Super Admin", "Admin", "Franchise"];

const emptyForm = {
  username: "",
  email: "",
  password: "",
  role: "Admin",
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editUser, setEditUser] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const { toasts, toast, removeToast } = useToast();
  
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(null); // stores user_id being toggled
  const [deleting, setDeleting] = useState(false);
  
  const PAGE_SIZE = 7;

  const fetchUsers = () => 
    apiFetch("/super-admin/users")
      .then(setUsers)
      .catch((err) => toast("Failed to load platform users: " + err.message, "error"));

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((user) =>
    [user.username, user.email, user.role_name]
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
    setEditUser(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role_name,
    });
    setModal(true);
  };

  const save = async () => {
    if (!form.username) return toast("Username is required.", "error");
    setSaving(true);
    try {
      if (editUser) {
        await apiFetch(`/super-admin/users/${editUser.user_id}`, {
          method: "PUT",
          body: JSON.stringify({
            username: form.username,
            email: form.email,
            password: form.password || undefined,
            role_name: form.role,
          }),
        });
        toast("User profile updated successfully.", "success");
      } else {
        await apiFetch("/super-admin/users", {
          method: "POST",
          body: JSON.stringify({
            username: form.username,
            email: form.email,
            password: form.password,
            role_name: form.role,
          }),
        });
        toast("New administrative account created.", "success");
      }
      setModal(false);
      fetchUsers();
    } catch (error) {
      toast("Error saving user: " + error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (user) => {
    setToggling(user.user_id);
    try {
      await apiFetch(`/super-admin/users/${user.user_id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: user.is_active ? 0 : 1 }),
      });
      toast(`User account has been ${user.is_active ? "deactivated" : "activated"}.`, "success");
      fetchUsers();
    } catch (error) {
      toast("Error toggling user status: " + error.message, "error");
    } finally {
      setToggling(null);
    }
  };

  const remove = async (id) => {
    setDeleting(true);
    try {
      await apiFetch(`/super-admin/users/${id}`, { method: "DELETE" });
      toast("User account has been permanently deleted.", "success");
      setConfirm(null);
      fetchUsers();
    } catch (error) {
      toast("Error deleting user: " + error.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={["Super Admin"]}>
      <Toast toasts={toasts} removeToast={removeToast} />
      <PageHeader 
        title="Users and Roles" 
        subtitle="View and search system accounts" 
        action={
          <Button variant="primary" onClick={openAdd}>
            <Plus size={18} />
            Create User
          </Button>
        }
      />
      <div className="mb-6">
        <SearchInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by username, email, or role"
        />
      </div>

      <div className="mt-6">
        <SectionCard padded={false} fullHeight={true}>
          {filtered.length ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S.No</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-16">Options</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((user, index) => (
                    <TableRow key={user.user_id}>
                      <TableCell>{(page - 1) * PAGE_SIZE + index + 1}</TableCell>
                      <TableCell className="font-semibold text-slate-950">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role_name === "Super Admin" ? "accent" : user.role_name === "Admin" ? "neutral" : "success"}>
                          {user.role_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <button 
                          className="hover:opacity-80 transition-opacity"
                          onClick={() => toggleActive(user)}
                          disabled={toggling === user.user_id}
                        >
                          {toggling === user.user_id ? (
                            <Badge variant="neutral">Updating...</Badge>
                          ) : (
                            <Badge variant={user.is_active ? "success" : "danger"}>
                              {user.is_active ? "Active" : "Inactive"}
                            </Badge>
                          )}
                        </button>
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        <TableDropdown
                          options={[
                            { label: "Edit Role", icon: UserCircleGear, onClick: () => openEdit(user) },
                            { label: "Change Password", icon: Key, onClick: () => openEdit(user) },
                            { label: "Delete", icon: Trash, danger: true, onClick: () => setConfirm(user.user_id) }
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <EmptyState
              icon={UserList}
              title="No users found"
              sub="Create your first managed account to start operating the platform."
            />
          )}
        </SectionCard>
        <div className="mt-2">
          <Pagination current={page} total={totalPages} onChange={setPage} />
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editUser ? "Edit User Account" : "Create Managed Account"} width={420}>
        <div className="space-y-4">
          <Field label="Username" icon={User}>
            <Input
              placeholder="e.g. jameel_admin"
              value={form.username}
              onChange={(e) => setForm((c) => ({ ...c, username: e.target.value }))}
            />
          </Field>
          <Field label="Email Address" icon={EnvelopeSimple}>
            <Input
              placeholder="e.g. jameel@auction.com"
              value={form.email}
              onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
            />
          </Field>
          <Field label="Account Role" icon={ShieldCheck}>
            <Select
              value={form.role}
              onChange={(val) => setForm((c) => ({ ...c, role: val }))}
              options={ROLES.map(r => ({ label: r, value: r }))}
            />
          </Field>
          <Field label={editUser ? "Reset Password" : "Secure Password"} icon={Key}>
            <Input
              type="password"
              placeholder={editUser ? "Leave blank to keep current" : "••••••••"}
              value={form.password}
              onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
            />
          </Field>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setModal(false)}>Cancel</Button>
          <Button 
            variant="primary" 
            onClick={save}
            loading={saving}
            loadingText={editUser ? "Updating..." : "Creating..."}
          >
            {editUser ? "Update Account" : "Create Account"}
          </Button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove(confirm)}
        title="Delete User Account"
        message="This will permanently remove this user's access to the platform."
        danger
        loading={deleting}
      />
    </DashboardLayout>
  );
}
