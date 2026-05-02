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
  
  const PAGE_SIZE = 10;

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
      <PageHeader title="Users and Roles" subtitle="View and search system accounts" />
      <div className="mb-6">
        <SearchInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by username, email, or role"
        />
      </div>

      <div className="mt-6">
        <SectionCard padded={false}>
          {filtered.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((user, index) => (
                    <tr key={user.user_id}>
                      <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination current={page} total={totalPages} onPageChange={setPage} />
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

    </DashboardLayout>
  );
}
