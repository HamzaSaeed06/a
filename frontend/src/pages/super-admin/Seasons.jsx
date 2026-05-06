import { useEffect, useState } from "react";
import { Calendar, CalendarDots, Clock, MapPin, PencilSimple, Plus, Trash, Trophy } from "@phosphor-icons/react";
import DashboardLayout from "../../components/DashboardLayout";
import { ConfirmModal, EmptyState, Field, Modal, PageHeader, SearchInput, Select, SectionCard, TableDropdown, Pagination, Toast, useToast, Button, Input, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge } from "../../components/UI";
import { apiFetch } from "../../lib/api";
import { formatDate } from "../../lib/format";

const defaultForm = { auction_name: "", season: new Date().getFullYear().toString(), auction_date: "", location: "", status: "upcoming" };

export default function SeasonsPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editItem, setEditItem] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toasts, toast, removeToast } = useToast();
  const PAGE_SIZE = 6;

  const fetchItems = () => apiFetch("/super-admin/auctions").then(setItems).catch((err) => toast("Failed to fetch auction seasons: " + err.message, "error"));
  useEffect(() => { fetchItems(); }, []);
  useEffect(() => { setPage(1); }, [search]);

  const filtered = items.filter((item) => [item.auction_name, item.season, item.location, item.status].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => { setEditItem(null); setForm(defaultForm); setModal(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ auction_name: item.auction_name || "", season: String(item.season || ""), auction_date: item.auction_date ? new Date(item.auction_date).toISOString().slice(0, 10) : "", location: item.location || "", status: item.status || "upcoming" }); setModal(true); };

  const save = async () => {
    if (!form.auction_name) return toast("Auction name is required.", "error");
    setSaving(true);
    try {
      if (editItem) { await apiFetch(`/super-admin/auctions/${editItem.auction_id}`, { method: "PUT", body: JSON.stringify(form) }); toast("Auction season has been successfully updated.", "success"); }
      else { await apiFetch("/super-admin/auctions", { method: "POST", body: JSON.stringify(form) }); toast("A new auction season has been successfully created.", "success"); }
      setModal(false); fetchItems();
    } catch (error) { toast("Error saving auction season: " + error.message, "error"); } finally { setSaving(false); }
  };

  const remove = async (id) => {
    setDeleting(true);
    try { await apiFetch(`/super-admin/auctions/${id}`, { method: "DELETE" }); toast("Auction season has been successfully deleted.", "success"); setConfirm(null); fetchItems(); }
    catch (error) { toast("Error deleting auction season: " + error.message, "error"); } finally { setDeleting(false); }
  };

  return (
    <DashboardLayout allowedRoles={["Super Admin"]}>
      <Toast toasts={toasts} removeToast={removeToast} />
      <PageHeader title="Auction Seasons" subtitle="Manage seasonal auction events" />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search seasons, venues, or status" />
        <Button variant="primary" className="shrink-0" onClick={openAdd}><Plus size={18} />Create Season</Button>
      </div>
      <div className="mt-6">
        <SectionCard padded={false} fullHeight={true}>
          {filtered.length ? (
            <>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>S.No</TableHead><TableHead>Auction</TableHead><TableHead>Season</TableHead>
                  <TableHead>Date</TableHead><TableHead>Location</TableHead><TableHead>Status</TableHead><TableHead className="w-16">Options</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {paginated.map((item, index) => (
                    <TableRow key={item.auction_id}>
                      <TableCell>{(page - 1) * PAGE_SIZE + index + 1}</TableCell>
                      <TableCell className="font-semibold text-slate-950">{item.auction_name}</TableCell>
                      <TableCell>{item.season}</TableCell>
                      <TableCell>{formatDate(item.auction_date)}</TableCell>
                      <TableCell>{item.location || "-"}</TableCell>
                      <TableCell><Badge variant={item.status === "live" ? "success" : item.status === "completed" ? "neutral" : "gold"}>{item.status}</Badge></TableCell>
                      <TableCell><TableDropdown options={[{ label: "Edit", icon: PencilSimple, onClick: () => openEdit(item) }, { label: "Delete", icon: Trash, danger: true, onClick: () => setConfirm(item.auction_id) }]} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="px-6"><Pagination current={page} total={totalPages} onChange={setPage} /></div>
            </>
          ) : (
            <EmptyState icon={CalendarDots} title="No auction seasons yet" sub="Create the first season to start building the live auction workflow." />
          )}
        </SectionCard>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? "Edit Auction Season" : "Create Auction Season"}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Auction Name" icon={Trophy}><Input placeholder="e.g. PSL Season 8 Auction" value={form.auction_name} onChange={(e) => setForm((c) => ({ ...c, auction_name: e.target.value }))} /></Field>
          <Field label="Season" icon={Calendar}><Input placeholder="e.g. 2024" value={form.season} onChange={(e) => setForm((c) => ({ ...c, season: e.target.value }))} /></Field>
          <Field label="Auction Date" icon={CalendarDots}><Input type="date" value={form.auction_date} onChange={(e) => setForm((c) => ({ ...c, auction_date: e.target.value }))} /></Field>
          <Field label="Location" icon={MapPin}><Input placeholder="e.g. PC Hotel, Karachi" value={form.location} onChange={(e) => setForm((c) => ({ ...c, location: e.target.value }))} /></Field>
          <div className="md:col-span-2">
            <Field label="Status" icon={Clock}><Select value={form.status} onChange={(val) => setForm((c) => ({ ...c, status: val }))} options={[{ label: "Upcoming", value: "upcoming" }, { label: "Live", value: "live" }, { label: "Completed", value: "completed" }]} /></Field>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={save} loading={saving} loadingText={editItem ? "Updating..." : "Creating..."}>{editItem ? "Update Season" : "Create Season"}</Button>
        </div>
      </Modal>
      <ConfirmModal open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => remove(confirm)} title="Delete Auction Season" message="This will permanently remove the auction season and linked pool records." danger loading={deleting} />
    </DashboardLayout>
  );
}
