"use client";

import { useEffect, useState } from "react";
import { Money, PencilSimple, Plus, Stack, Tag, TextAlignLeft, Trash } from "@phosphor-icons/react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  ConfirmModal,
  EmptyState,
  Field,
  Modal,
  PageHeader,
  SearchInput,
  Select,
  SectionCard,
  TableDropdown,
  Toast,
  useToast,
} from "../../components/UI";
import { formatCurrency } from "../../lib/format";
import { apiFetch } from "../../lib/api";

export default function CategoriesPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ category_name: "", description: "", base_price: "" });
  const [editItem, setEditItem] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const { toasts, toast, removeToast } = useToast();

  const SUGGESTIONS = ["Platinum", "Diamond", "Gold", "Silver", "Emerging", "Supplementary"];

  const fetchItems = () => apiFetch("/super-admin/categories").then(setItems).catch(() => {});

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = items.filter((item) =>
    [item.category_name, item.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditItem(null);
    setForm({ category_name: "", description: "", base_price: "" });
    setModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ 
      category_name: item.category_name, 
      description: item.description || "", 
      base_price: item.base_price || "" 
    });
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
      <PageHeader title="Player Categories" subtitle="Define tiers and draft order" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by category name..."
        />
        <button className="btn-primary shrink-0" onClick={openAdd}>
          <Plus size={18} />
          Add Category
        </button>
      </div>

      <SectionCard padded={false}>
        {items.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Category Name</th>
                    <th>Base Price</th>
                    <th>Description</th>
                    <th className="w-16">Options</th>
                  </tr>
              </thead>
              <tbody>
                {filtered.map((item, index) => (
                  <tr key={item.category_id}>
                    <td>{index + 1}</td>
                    <td className="font-semibold text-slate-950">{item.category_name}</td>
                    <td className="font-bold text-slate-900">{formatCurrency(item.base_price)}</td>
                    <td className="text-slate-500">{item.description || "—"}</td>
                    <td>
                      <TableDropdown
                        options={[
                          { label: "Edit", icon: PencilSimple, onClick: () => openEdit(item) },
                          { label: "Delete", icon: Trash, danger: true, onClick: () => setConfirm(item.category_id) }
                        ]}
                      />
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
        <div className="grid gap-6">
          <Field label="Category Name" icon={Tag}>
            <Select 
              value={form.category_name}
              onChange={(val) => setForm(c => ({ ...c, category_name: val }))}
              options={[
                ...SUGGESTIONS.map(s => ({ label: s, value: s })),
                { label: "Custom...", value: "Custom" }
              ]}
              placeholder="Select a category"
            />
          </Field>
          {form.category_name === "Custom" && (
            <Field label="Custom Category Name" icon={Tag}>
              <input 
                className="input" 
                placeholder="Enter custom category name" 
                onChange={(event) => setForm((current) => ({ ...current, category_name: event.target.value }))} 
              />
            </Field>
          )}
          <Field label="Description" icon={TextAlignLeft}>
            <input className="input" placeholder="Short description of the category" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          </Field>
          <Field label="Default Base Price" icon={Money}>
            <input 
              className="input" 
              type="number" 
              placeholder="e.g. 2000000" 
              value={form.base_price} 
              onChange={(event) => setForm((current) => ({ ...current, base_price: event.target.value }))} 
            />
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
