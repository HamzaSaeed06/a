"use client";

import { useEffect, useState } from "react";
import { PencilSimple, Plus, Stack, Trash } from "@phosphor-icons/react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  ConfirmModal,
  EmptyState,
  Field,
  Modal,
  PageHeader,
  SectionCard,
  Toast,
  useToast,
} from "../../components/UI";
import { apiFetch } from "../../lib/api";

export default function CategoriesPage() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ category_name: "", description: "" });
  const [editItem, setEditItem] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const { toasts, toast, removeToast } = useToast();

  const fetchItems = () => apiFetch("/super-admin/categories").then(setItems).catch(() => {});

  useEffect(() => {
    fetchItems();
  }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm({ category_name: "", description: "" });
    setModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ category_name: item.category_name, description: item.description || "" });
    setModal(true);
  };

  const save = async () => {
    try {
      if (editItem) {
        await apiFetch(`/super-admin/categories/${editItem.category_id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        toast("Category updated.", "success");
      } else {
        await apiFetch("/super-admin/categories", {
          method: "POST",
          body: JSON.stringify(form),
        });
        toast("Category created.", "success");
      }
      setModal(false);
      fetchItems();
    } catch (error) {
      toast(error.message, "error");
    }
  };

  const remove = async (id) => {
    try {
      await apiFetch(`/super-admin/categories/${id}`, { method: "DELETE" });
      toast("Category deleted.", "success");
      fetchItems();
    } catch (error) {
      toast(error.message, "error");
    }
  };

  return (
    <DashboardLayout allowedRoles={["Super Admin"]}>
      <Toast toasts={toasts} removeToast={removeToast} />
      <PageHeader
        title="Player Categories"
        subtitle="Define classification groups used in the player and auction workflow."
        action={<button className="btn-primary" onClick={openAdd}><Plus size={18} />Add Category</button>}
      />

      <SectionCard padded={false}>
        {items.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.category_id}>
                    <td>{index + 1}</td>
                    <td className="font-semibold text-slate-950">{item.category_name}</td>
                    <td>{item.description || "—"}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button className="btn-ghost !p-2" onClick={() => openEdit(item)}>
                          <PencilSimple size={16} />
                        </button>
                        <button className="btn-ghost !p-2 !text-[var(--danger)]" onClick={() => setConfirm(item.category_id)}>
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
            icon={Stack}
            title="No categories yet"
            sub="Create the first category to organize player pools and pricing."
          />
        )}
      </SectionCard>

      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? "Edit Category" : "Add Category"} width={420}>
        <div className="grid gap-4">
          <Field label="Category Name">
            <input className="input" value={form.category_name} onChange={(event) => setForm((current) => ({ ...current, category_name: event.target.value }))} />
          </Field>
          <Field label="Description">
            <input className="input" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-outline" onClick={() => setModal(false)}>
            Cancel
          </button>
          <button className="btn-primary" onClick={save}>
            Save Category
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove(confirm)}
        title="Delete Category"
        message="This permanently removes the category definition."
        danger
      />
    </DashboardLayout>
  );
}
