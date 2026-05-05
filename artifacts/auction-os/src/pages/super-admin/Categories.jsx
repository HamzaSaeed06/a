import { useEffect, useState } from "react";
import { Money, PencilSimple, Plus, Stack, Tag, TextAlignLeft, Trash } from "@phosphor-icons/react";
import DashboardLayout from "../../components/DashboardLayout";
import { ConfirmModal, EmptyState, Field, Modal, PageHeader, SearchInput, Select, SectionCard, TableDropdown, Pagination, Toast, useToast, Button, Input, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/UI";
import { formatCurrency } from "../../lib/format";
import { apiFetch } from "../../lib/api";

const SUGGESTIONS = ["Platinum", "Diamond", "Gold", "Silver", "Emerging", "Supplementary"];

export default function CategoriesPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ category_name: "", description: "", base_price: "" });
  const [editItem, setEditItem] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const { toasts, toast, removeToast } = useToast();
  const PAGE_SIZE = 8;

  const fetchItems = () => apiFetch("/super-admin/categories").then(setItems).catch((err) => toast("Failed to fetch categories: " + err.message, "error"));
  useEffect(() => { fetchItems(); }, []);
  useEffect(() => { setPage(1); }, [search]);

  const filtered = items.filter((item) => [item.category_name, item.description].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => { setEditItem(null); setForm({ category_name: "", description: "", base_price: "" }); setModal(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ category_name: item.category_name, description: item.description || "", base_price: item.base_price || "" }); setModal(true); };

  const save = async () => {
    if (!form.category_name) return toast("Category name is required.", "error");
    setSaving(true);
    try {
      if (editItem) { await apiFetch(`/super-admin/categories/${editItem.category_id}`, { method: "PUT", body: JSON.stringify(form) }); toast("Category updated successfully.", "success"); }
      else { await apiFetch("/super-admin/categories", { method: "POST", body: JSON.stringify(form) }); toast("New category created successfully.", "success"); }
      setModal(false); fetchItems();
    } catch (error) { toast(error.message || "Failed to save category details.", "error"); } finally { setSaving(false); }
  };

  const remove = async (id) => {
    try { await apiFetch(`/super-admin/categories/${id}`, { method: "DELETE" }); toast("Category removed successfully.", "success"); fetchItems(); }
    catch (error) { toast(error.message || "Failed to remove the category.", "error"); }
  };

  return (
    <DashboardLayout allowedRoles={["Super Admin"]}>
      <Toast toasts={toasts} removeToast={removeToast} />
      <PageHeader title="Player Categories" subtitle="Define tiers and draft order" />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by category name..." />
        <Button variant="primary" className="shrink-0" onClick={openAdd}><Plus size={18} />Add Category</Button>
      </div>
      <SectionCard padded={false} fullHeight={true}>
        {items.length ? (
          <>
            <Table>
              <TableHeader><TableRow>
                <TableHead>S.No</TableHead><TableHead>Category Name</TableHead><TableHead>Base Price</TableHead><TableHead>Description</TableHead><TableHead className="w-16">Options</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {paginated.map((item, index) => (
                  <TableRow key={item.category_id}>
                    <TableCell>{(page - 1) * PAGE_SIZE + index + 1}</TableCell>
                    <TableCell className="font-semibold text-slate-950">{item.category_name}</TableCell>
                    <TableCell className="font-bold text-slate-900">{formatCurrency(item.base_price)}</TableCell>
                    <TableCell className="text-slate-500">{item.description || "—"}</TableCell>
                    <TableCell><TableDropdown options={[{ label: "Edit", icon: PencilSimple, onClick: () => openEdit(item) }, { label: "Delete", icon: Trash, danger: true, onClick: () => setConfirm(item.category_id) }]} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="px-6"><Pagination current={page} total={totalPages} onChange={setPage} /></div>
          </>
        ) : (
          <EmptyState icon={Stack} title="No categories yet" sub="Create the first category to organize player pools and pricing." />
        )}
      </SectionCard>
      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? "Edit Category" : "Add Category"} width={420}>
        <div className="grid gap-6">
          <Field label="Category Name" icon={Tag}>
            <Select value={form.category_name} onChange={(val) => setForm(c => ({ ...c, category_name: val }))} options={[...SUGGESTIONS.map(s => ({ label: s, value: s })), { label: "Custom...", value: "Custom" }]} placeholder="Select a category" />
          </Field>
          {form.category_name === "Custom" && <Field label="Custom Category Name" icon={Tag}><Input placeholder="Enter custom category name" onChange={(e) => setForm((c) => ({ ...c, category_name: e.target.value }))} /></Field>}
          <Field label="Description" icon={TextAlignLeft}><Input placeholder="Short description of the category" value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} /></Field>
          <Field label="Default Base Price" icon={Money}><Input type="number" placeholder="e.g. 2000000" value={form.base_price} onChange={(e) => setForm((c) => ({ ...c, base_price: e.target.value }))} /></Field>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={save} loading={saving} loadingText="Saving Details...">Save Category</Button>
        </div>
      </Modal>
      <ConfirmModal open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => remove(confirm)} title="Delete Category" message="This permanently removes the category definition." danger />
    </DashboardLayout>
  );
}
