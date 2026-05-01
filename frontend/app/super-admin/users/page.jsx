"use client";

import { useEffect, useState } from "react";
import {
  PencilSimple,
  Plus,
  ShieldCheck,
  ShieldSlash,
  Trash,
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
  Toast,
  useToast,
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
  const { toasts, toast, removeToast } = useToast();

  const fetchUsers = () => apiFetch("/super-admin/users").then(setUsers).catch(() => {});

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
    try {
      if (editUser) {
        await apiFetch(`/super-admin/users/${editUser.user_id}`, {
          method: "PUT",
          body: JSON.stringify({
            password: form.password || undefined,
            role_name: form.role,
          }),
        });
        toast("User updated.", "success");
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
        toast("User created.", "success");
      }
      setModal(false);
      fetchUsers();
    } catch (error) {
      toast(error.message, "error");
    }
  };

  const toggleActive = async (user) => {
    try {
      await apiFetch(`/super-admin/users/${user.user_id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: user.is_active ? 0 : 1 }),
      });
      toast(`User ${user.is_active ? "deactivated" : "activated"}.`, "success");
      fetchUsers();
    } catch (error) {
      toast(error.message, "error");
    }
  };

  const remove = async (id) => {
    try {
      await apiFetch(`/super-admin/users/${id}`, { method: "DELETE" });
      toast("User deleted.", "success");
      fetchUsers();
    } catch (error) {
      toast(error.message, "error");
    }
  };

  return (
    <DashboardLayout allowedRoles={["Super Admin"]}>
      <Toast toasts={toasts} removeToast={removeToast} />
      <PageHeader
        title="Users and Roles"
        subtitle="Govern access, suspend accounts, and control role ownership across the platform."
        action={<button className="btn-primary" onClick={openAdd}><Plus size={18} />Add User</button>}
      />

      <SearchInput
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by username, email, or role"
      />

      <div className="mt-6">
        <SectionCard padded={false}>
          {filtered.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.user_id}>
                      <td className="font-semibold text-slate-950">{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${user.role_name === "Super Admin" ? "badge-accent" : user.role_name === "Admin" ? "badge-neutral" : "badge-success"}`}>
                          {user.role_name}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${user.is_active ? "badge-success" : "badge-danger"}`}>
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>{formatDate(user.created_at)}</td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button className="btn-ghost !p-2" onClick={() => toggleActive(user)}>
                            {user.is_active ? <ShieldSlash size={16} /> : <ShieldCheck size={16} />}
                          </button>
                          <button className="btn-ghost !p-2" onClick={() => openEdit(user)}>
                            <PencilSimple size={16} />
                          </button>
                          <button className="btn-ghost !p-2 !text-[var(--danger)]" onClick={() => setConfirm(user.user_id)}>
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
              icon={UserList}
              title="No users found"
              sub="Create your first managed account to start operating the platform."
            />
          )}
        </SectionCard>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editUser ? "Edit User" : "Create User"}>
        <div className="grid gap-4 md:grid-cols-2">
          {!editUser ? (
            <>
              <Field label="Username">
                <input
                  className="input"
                  value={form.username}
                  onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                />
              </Field>
              <Field label="Email">
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                />
              </Field>
            </>
          ) : null}

          <Field label="Role">
            <select
              className="select"
              value={form.role}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </Field>

          <Field label={editUser ? "New Password" : "Password"}>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-outline" onClick={() => setModal(false)}>
            Cancel
          </button>
          <button className="btn-primary" onClick={save}>
            Save User
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove(confirm)}
        title="Delete User"
        message="This permanently removes the account from the system."
        danger
      />
    </DashboardLayout>
  );
}
