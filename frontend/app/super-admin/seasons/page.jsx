"use client";

import { useEffect, useState } from "react";
import { Calendar, CalendarDots, Clock, MapPin, PencilSimple, Plus, Selection, Trash, Trophy } from "@phosphor-icons/react";
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
import { apiFetch } from "../../lib/api";
import { formatDate } from "../../lib/format";

const defaultForm = {
  auction_name: "",
  season: new Date().getFullYear().toString(),
  auction_date: "",
  location: "",
  status: "upcoming",
};

export default function SeasonsPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editItem, setEditItem] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const { toasts, toast, removeToast } = useToast();

  const fetchItems = () => apiFetch("/super-admin/auctions").then(setItems).catch(() => {});

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = items.filter((item) =>
    [item.auction_name, item.season, item.location, item.status]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditItem(null);
    setForm(defaultForm);
    setModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      auction_name: item.auction_name || "",
      season: String(item.season || ""),
      auction_date: item.auction_date ? new Date(item.auction_date).toISOString().slice(0, 10) : "",
      location: item.location || "",
      status: item.status || "upcoming",
    });
    setModal(true);
  };

  const save = async () => {
    try {
      if (editItem) {
        await apiFetch(`/super-admin/auctions/${editItem.auction_id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        await apiFetch("/super-admin/auctions", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      toast(editItem ? "Auction season updated." : "Auction season created.", "success");
      setModal(false);
      fetchItems();
    } catch (error) {
      toast(error.message, "error");
    }
  };

  const remove = async (id) => {
    try {
      await apiFetch(`/super-admin/auctions/${id}`, { method: "DELETE" });
      toast("Auction season deleted.", "success");
      fetchItems();
    } catch (error) {
      toast(error.message, "error");
    }
  };

  return (
    <DashboardLayout allowedRoles={["Super Admin"]}>
      <Toast toasts={toasts} removeToast={removeToast} />
      <PageHeader title="Auction Seasons" subtitle="Manage seasonal auction events" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search seasons, venues, or status"
        />
        <button className="btn-primary shrink-0" onClick={openAdd}>
          <Plus size={18} />
          Create Season
        </button>
      </div>

      <div className="mt-6">
        <SectionCard padded={false}>
          {filtered.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Auction</th>
                      <th>Season</th>
                      <th>Date</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th className="w-16">Options</th>
                    </tr>
                </thead>
                <tbody>
                  {filtered.map((item, index) => (
                    <tr key={item.auction_id}>
                      <td>{index + 1}</td>
                      <td className="font-semibold text-slate-950">{item.auction_name}</td>
                      <td>{item.season}</td>
                      <td>{formatDate(item.auction_date)}</td>
                      <td>{item.location || "-"}</td>
                      <td>
                        <span className={`badge ${item.status === "live" ? "badge-success" : item.status === "completed" ? "badge-neutral" : "badge-accent"}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <TableDropdown
                          options={[
                            { label: "Edit", icon: PencilSimple, onClick: () => openEdit(item) },
                            { label: "Delete", icon: Trash, danger: true, onClick: () => setConfirm(item.auction_id) }
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
              icon={CalendarDots}
              title="No auction seasons yet"
              sub="Create the first season to start building the live auction workflow."
            />
          )}
        </SectionCard>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? "Edit Auction Season" : "Create Auction Season"}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Auction Name" icon={Trophy}>
            <input
              className="input"
              placeholder="e.g. PSL Season 8 Auction"
              value={form.auction_name}
              onChange={(event) => setForm((current) => ({ ...current, auction_name: event.target.value }))}
            />
          </Field>
          <Field label="Season" icon={Calendar}>
            <input
              className="input"
              placeholder="e.g. 2024"
              value={form.season}
              onChange={(event) => setForm((current) => ({ ...current, season: event.target.value }))}
            />
          </Field>
          <Field label="Auction Date" icon={CalendarDots}>
            <input
              className="input"
              type="date"
              value={form.auction_date}
              onChange={(event) => setForm((current) => ({ ...current, auction_date: event.target.value }))}
            />
          </Field>
          <Field label="Location" icon={MapPin}>
            <input
              className="input"
              placeholder="e.g. PC Hotel, Karachi"
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Status" icon={Clock}>
              <Select
                value={form.status}
                onChange={(val) => setForm((current) => ({ ...current, status: val }))}
                options={[
                  { label: "Upcoming", value: "upcoming" },
                  { label: "Live", value: "live" },
                  { label: "Completed", value: "completed" },
                ]}
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-outline" onClick={() => setModal(false)}>
            Cancel
          </button>
          <button className="btn-primary" onClick={save}>
            Save Season
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove(confirm)}
        title="Delete Auction Season"
        message="This will permanently remove the auction season and linked pool records."
        danger
      />
    </DashboardLayout>
  );
}
