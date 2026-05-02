"use client";

import { useEffect, useState } from "react";
import { GlobeHemisphereWest, Hash, IdentificationCard, PencilSimple, Plus, Phone, Trash } from "@phosphor-icons/react";
import { countriesData } from "../../lib/countries";
import DashboardLayout from "../../components/DashboardLayout";
import {
  ConfirmModal,
  EmptyState,
  Field,
  Modal,
  PageHeader,
  SearchInput,
  SectionCard,
  TableDropdown,
  Toast,
  useToast,
} from "../../components/UI";
import { apiFetch } from "../../lib/api";

export default function CountriesPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ country_name: "", country_code: "", dial_code: "" });
  const [suggestions, setSuggestions] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const { toasts, toast, removeToast } = useToast();

  const fetchItems = () => apiFetch("/super-admin/countries").then(setItems).catch(() => {});

  useEffect(() => {
    fetchItems();
  }, []);
  
  const filtered = items.filter((item) =>
    [item.country_name, item.country_code]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditItem(null);
    setForm({ country_name: "", country_code: "", dial_code: "" });
    setSuggestions([]);
    setModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ 
      country_name: item.country_name, 
      country_code: item.country_code || "",
      dial_code: item.dial_code || ""
    });
    setSuggestions([]);
    setModal(true);
  };

  const handleCountryNameChange = (val) => {
    setForm(c => ({ ...c, country_name: val }));
    if (val.trim().length > 1) {
      const filtered = countriesData.filter(c => 
        c.name.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (country) => {
    setForm({
      country_name: country.name,
      country_code: country.code.toUpperCase(),
      dial_code: country.dial
    });
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && suggestions.length > 0) {
      e.preventDefault();
      selectSuggestion(suggestions[0]);
    }
  };

  const save = async () => {
    try {
      if (editItem) {
        await apiFetch(`/super-admin/countries/${editItem.country_id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        toast("Country updated.", "success");
      } else {
        await apiFetch("/super-admin/countries", {
          method: "POST",
          body: JSON.stringify(form),
        });
        toast("Country added.", "success");
      }
      setModal(false);
      fetchItems();
    } catch (error) {
      toast(error.message, "error");
    }
  };

  const remove = async (id) => {
    try {
      await apiFetch(`/super-admin/countries/${id}`, { method: "DELETE" });
      toast("Country deleted.", "success");
      fetchItems();
    } catch (error) {
      toast(error.message, "error");
    }
  };

  return (
    <DashboardLayout allowedRoles={["Super Admin"]}>
      <Toast toasts={toasts} removeToast={removeToast} />
      <PageHeader title="Countries" subtitle="Manage player origin references" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by country name or code"
        />
        <button className="btn-primary shrink-0" onClick={openAdd}>
          <Plus size={18} />
          Add Country
        </button>
      </div>

      <SectionCard padded={false}>
        {items.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Country</th>
                  <th>ISO Code</th>
                  <th>Dial Code</th>
                  <th className="w-16">Options</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, index) => (
                  <tr key={item.country_id}>
                    <td>{index + 1}</td>
                    <td className="font-semibold text-slate-950">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-5 w-8 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-50 border border-slate-200/60 shadow-sm">
                          {item.country_code ? (
                            <img
                              src={
                                countriesData.find(c => c.code.toLowerCase() === item.country_code.toLowerCase())?.flagUrl 
                                || `https://flagcdn.com/${item.country_code.toLowerCase()}.svg`
                              }
                              alt=""
                              className="h-full w-full object-contain"
                              onError={(e) => { 
                                e.target.style.display = 'none'; 
                                e.target.nextSibling.style.display = 'block'; 
                              }}
                            />
                          ) : null}
                          <GlobeHemisphereWest size={12} className="text-slate-400 hidden" />
                        </div>
                        {item.country_name}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{item.country_code || "—"}</span>
                    </td>
                    <td className="text-sm font-medium text-slate-500">
                      {item.dial_code || "—"}
                    </td>
                    <td>
                      <TableDropdown
                        options={[
                          { label: "Edit", icon: PencilSimple, onClick: () => openEdit(item) },
                          { label: "Delete", icon: Trash, danger: true, onClick: () => setConfirm(item.country_id) }
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
            icon={GlobeHemisphereWest}
            title="No countries yet"
            sub="Add country references before importing or creating players."
          />
        )}
      </SectionCard>

      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? "Edit Country" : "Add Country"} width={420}>
        <div className="grid gap-4">
          <div className="relative">
            <Field label="Country Name" icon={GlobeHemisphereWest}>
              <input 
                className="input" 
                placeholder="Start typing country name..." 
                value={form.country_name} 
                onChange={(e) => handleCountryNameChange(e.target.value)} 
                onKeyDown={handleKeyDown}
              />
            </Field>
            {suggestions.length > 0 && (
              <div 
                data-lenis-prevent
                className="absolute top-full left-0 right-0 z-[60] mt-1 max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg shadow-slate-200/40 animate-in fade-in slide-in-from-top-2 duration-200 scrollbar-hide flex flex-col gap-0.5"
              >
                  {suggestions.map((c) => (
                    <button
                      key={c.name}
                      style={{ fontSize: '12px' }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-75"
                      onClick={() => selectSuggestion(c)}
                    >
                      <div className="flex h-[14px] w-[22px] shrink-0 items-center justify-center overflow-hidden rounded-[2px] bg-slate-50 border border-slate-200 shadow-sm">
                        <img 
                          src={c.flagUrl || `https://flagcdn.com/${c.code.toLowerCase()}.svg`} 
                          alt="" 
                          className="h-full w-full object-contain" 
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                        />
                        <GlobeHemisphereWest size={10} className="text-slate-400 hidden" />
                      </div>
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Field label="ISO Code" icon={Hash}>
              <input 
                className="input" 
                placeholder="e.g. PK" 
                maxLength={5} 
                value={form.country_code} 
                onChange={(event) => setForm((current) => ({ ...current, country_code: event.target.value.toUpperCase() }))} 
              />
            </Field>
            <Field label="Dial Code" icon={Phone}>
              <input 
                className="input" 
                placeholder="e.g. +92" 
                value={form.dial_code} 
                onChange={(event) => {
                  let val = event.target.value;
                  if (val && !val.startsWith('+')) val = '+' + val;
                  setForm((current) => ({ ...current, dial_code: val }));
                }} 
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-outline" onClick={() => setModal(false)}>
            Cancel
          </button>
          <button className="btn-primary" onClick={save}>
            Save Country
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove(confirm)}
        title="Delete Country"
        message="This permanently removes the country record."
        danger
      />
    </DashboardLayout>
  );
}
