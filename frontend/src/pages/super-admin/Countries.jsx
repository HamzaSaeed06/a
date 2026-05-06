import { useEffect, useState } from "react";
import { GlobeHemisphereWest, Hash, PencilSimple, Phone, Plus, Trash } from "@phosphor-icons/react";
import { countriesData } from "../../lib/countries";
import DashboardLayout from "../../components/DashboardLayout";
import { ConfirmModal, EmptyState, Field, Modal, PageHeader, SearchInput, Pagination, SectionCard, TableDropdown, Toast, useToast, Button, Input, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge } from "../../components/UI";
import { apiFetch } from "../../lib/api";

export default function CountriesPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ country_name: "", country_code: "", dial_code: "" });
  const [suggestions, setSuggestions] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toasts, toast, removeToast } = useToast();
  const PAGE_SIZE = 7;

  const fetchItems = () => apiFetch("/super-admin/countries").then(setItems).catch((err) => toast("Failed to load country data: " + err.message, "error"));
  useEffect(() => { fetchItems(); }, []);

  const filtered = items.filter((item) => [item.country_name, item.country_code].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [search]);

  const openAdd = () => { setEditItem(null); setForm({ country_name: "", country_code: "", dial_code: "" }); setSuggestions([]); setModal(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ country_name: item.country_name, country_code: item.country_code || "", dial_code: item.dial_code || "" }); setSuggestions([]); setModal(true); };

  const handleCountryNameChange = (val) => {
    setForm(c => ({ ...c, country_name: val }));
    if (val.trim().length > 1) setSuggestions(countriesData.filter(c => c.name.toLowerCase().includes(val.toLowerCase())).slice(0, 5));
    else setSuggestions([]);
  };

  const selectSuggestion = (country) => { setForm({ country_name: country.name, country_code: country.code.toUpperCase(), dial_code: country.dial }); setSuggestions([]); };

  const save = async () => {
    if (!form.country_name) return toast("Country name is required.", "error");
    setSaving(true);
    try {
      if (editItem) { await apiFetch(`/super-admin/countries/${editItem.country_id}`, { method: "PUT", body: JSON.stringify(form) }); toast("Country updated successfully.", "success"); }
      else { await apiFetch("/super-admin/countries", { method: "POST", body: JSON.stringify(form) }); toast("New country added successfully.", "success"); }
      setModal(false); fetchItems();
    } catch (error) { toast(error.message || "Failed to save country details.", "error"); } finally { setSaving(false); }
  };

  const remove = async (id) => {
    setDeleting(true);
    try { await apiFetch(`/super-admin/countries/${id}`, { method: "DELETE" }); toast("Country record removed successfully.", "success"); setConfirm(null); fetchItems(); }
    catch (error) { toast(error.message || "Failed to remove the country record.", "error"); } finally { setDeleting(false); }
  };

  return (
    <DashboardLayout allowedRoles={["Super Admin"]}>
      <Toast toasts={toasts} removeToast={removeToast} />
      <PageHeader title="Countries" subtitle="Manage player origin references" />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by country name or code" />
        <Button variant="primary" className="shrink-0" onClick={openAdd}><Plus size={18} />Add Country</Button>
      </div>
      <SectionCard padded={false} fullHeight={true}>
        {items.length ? (
          <Table>
            <TableHeader><TableRow><TableHead>S.No</TableHead><TableHead>Country</TableHead><TableHead>ISO Code</TableHead><TableHead>Dial Code</TableHead><TableHead className="w-16">Options</TableHead></TableRow></TableHeader>
            <TableBody>
              {paginated.map((item, index) => (
                <TableRow key={item.country_id}>
                  <TableCell>{(page - 1) * PAGE_SIZE + index + 1}</TableCell>
                  <TableCell className="font-semibold text-slate-950">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-5 w-8 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-50 border border-slate-200/60 shadow-sm">
                        {item.country_code ? <img src={`https://flagcdn.com/${item.country_code.toLowerCase()}.svg`} alt="" className="h-full w-full object-contain" /> : null}
                        <GlobeHemisphereWest size={12} className="text-slate-400 hidden" />
                      </div>
                      {item.country_name}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="neutral">{item.country_code || "—"}</Badge></TableCell>
                  <TableCell className="text-slate-500">{item.dial_code || "—"}</TableCell>
                  <TableCell><TableDropdown options={[{ label: "Edit", icon: PencilSimple, onClick: () => openEdit(item) }, { label: "Delete", icon: Trash, danger: true, onClick: () => setConfirm(item.country_id) }]} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState icon={GlobeHemisphereWest} title="No countries yet" sub="Add country references before importing or creating players." />
        )}
      </SectionCard>
      <div className="mt-2"><Pagination current={page} total={totalPages} onChange={setPage} /></div>

      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? "Edit Country" : "Add Country"} width={420}>
        <div className="grid gap-4">
          <div className="relative">
            <Field label="Country Name" icon={GlobeHemisphereWest}>
              <Input placeholder="Start typing country name..." value={form.country_name} onChange={(e) => handleCountryNameChange(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && suggestions.length > 0) { e.preventDefault(); selectSuggestion(suggestions[0]); } }} />
            </Field>
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-[60] mt-1 max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg shadow-slate-200/40 flex flex-col gap-0.5">
                {suggestions.map((c) => (
                  <button key={c.name} style={{ fontSize: "12px" }} className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left font-semibold text-slate-600 hover:bg-slate-100 transition-colors" onClick={() => selectSuggestion(c)}>
                    <div className="flex h-[14px] w-[22px] shrink-0 items-center justify-center overflow-hidden rounded-[2px] bg-slate-50 border border-slate-200 shadow-sm">
                      <img src={c.flagUrl || `https://flagcdn.com/${c.code.toLowerCase()}.svg`} alt="" className="h-full w-full object-contain" />
                    </div>
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="ISO Code" icon={Hash}><Input placeholder="e.g. PK" maxLength={5} value={form.country_code} onChange={(e) => setForm((c) => ({ ...c, country_code: e.target.value.toUpperCase() }))} /></Field>
            <Field label="Dial Code" icon={Phone}><Input placeholder="e.g. +92" value={form.dial_code} onChange={(e) => { let val = e.target.value; if (val && !val.startsWith("+")) val = "+" + val; setForm((c) => ({ ...c, dial_code: val })); }} /></Field>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={save} loading={saving} loadingText="Saving Details...">Save Country</Button>
        </div>
      </Modal>
      <ConfirmModal open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => remove(confirm)} title="Delete Country" message="This permanently removes the country record." danger loading={deleting} />
    </DashboardLayout>
  );
}
