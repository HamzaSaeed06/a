"use client";

import { useEffect, useState } from "react";
import { GlobeHemisphereWest, PencilSimple, Plus, Trash } from "@phosphor-icons/react";
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

export default function CountriesPage() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ country_name: "", country_code: "" });
  const [editItem, setEditItem] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const { toasts, toast, removeToast } = useToast();

  const fetchItems = () => apiFetch("/super-admin/countries").then(setItems).catch(() => {});

  useEffect(() => {
    fetchItems();
  }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm({ country_name: "", country_code: "" });
    setModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ country_name: item.country_name, country_code: item.country_code || "" });
    setModal(true);
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
      <PageHeader
        title="Countries"
        subtitle="Manage standardized country and code references for player records."
        action={<button className="btn-primary" onClick={openAdd}><Plus size={18} />Add Country</button>}
      />

      <SectionCard padded={false}>
        {items.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Country</th>
                  <th>Code</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.country_id}>
                    <td>{index + 1}</td>
                    <td className="font-semibold text-slate-950">{item.country_name}</td>
                    <td>
                      <span className="badge badge-neutral">{item.country_code || "—"}</span>
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button className="btn-ghost !p-2" onClick={() => openEdit(item)}>
                          <PencilSimple size={16} />
                        </button>
                        <button className="btn-ghost !p-2 !text-[var(--danger)]" onClick={() => setConfirm(item.country_id)}>
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
            icon={GlobeHemisphereWest}
            title="No countries yet"
            sub="Add country references before importing or creating players."
          />
        )}
      </SectionCard>

      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? "Edit Country" : "Add Country"} width={420}>
        <div className="grid gap-4">
          <Field label="Country Name">
            <input className="input" value={form.country_name} onChange={(event) => setForm((current) => ({ ...current, country_name: event.target.value }))} />
          </Field>
          <Field label="Country Code">
            <input className="input" maxLength={5} value={form.country_code} onChange={(event) => setForm((current) => ({ ...current, country_code: event.target.value.toUpperCase() }))} />
          </Field>
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
