"use client";

import { useEffect, useMemo, useState } from "react";
import { ListChecks, Plus, Trash } from "@phosphor-icons/react";
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
import { formatCurrency } from "../../lib/format";

export default function PoolPage() {
  const [pool, setPool] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ player_id: "" });
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState("");
  const { toasts, toast, removeToast } = useToast();

  const fetchPool = () => {
    apiFetch("/admin/auction-pool").then(setPool).catch(() => {});
    apiFetch("/admin/players").then(setAllPlayers).catch(() => {});
  };

  useEffect(() => {
    fetchPool();
  }, []);

  const inPool = useMemo(() => new Set(pool.map((item) => String(item.player_id))), [pool]);
  const availablePlayers = useMemo(
    () => allPlayers.filter((player) => !inPool.has(String(player.player_id))),
    [allPlayers, inPool],
  );

  const filtered = pool.filter((item) =>
    [item.name, item.role, item.status]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const addToPool = async () => {
    try {
      const auctions = await apiFetch("/super-admin/auctions");
      if (!auctions.length) {
        throw new Error("Create an auction season first before populating the pool.");
      }
      await apiFetch("/admin/auction-pool", {
        method: "POST",
        body: JSON.stringify({
          player_id: form.player_id,
          auction_id: auctions[0].auction_id,
        }),
      });
      toast("Player added to pool.", "success");
      setModal(false);
      fetchPool();
    } catch (error) {
      toast(error.message, "error");
    }
  };

  const remove = async (id) => {
    try {
      await apiFetch(`/admin/auction-pool/${id}`, { method: "DELETE" });
      toast("Player removed from pool.", "success");
      fetchPool();
    } catch (error) {
      toast(error.message, "error");
    }
  };

  return (
    <DashboardLayout allowedRoles={["Admin", "Super Admin"]}>
      <Toast toasts={toasts} removeToast={removeToast} />
      <PageHeader
        title="Auction Pool"
        subtitle="Control player sequencing before they enter the live sale floor."
        action={
          <button
            className="btn-primary"
            onClick={() => {
              setForm({ player_id: availablePlayers[0]?.player_id || "" });
              setModal(true);
            }}
          >
            <Plus size={18} />
            Add Player
          </button>
        }
      />

      <SearchInput
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search queued players"
      />

      <div className="mt-6">
        <SectionCard padded={false}>
          {filtered.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Lot</th>
                    <th>Player</th>
                    <th>Role</th>
                    <th>Base Price</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.pool_id}>
                      <td className="font-semibold text-[var(--accent)]">#{item.lot_number}</td>
                      <td className="font-semibold text-slate-950">{item.name}</td>
                      <td>{item.role || "-"}</td>
                      <td>{formatCurrency(item.base_price)}</td>
                      <td>
                        <span className={`badge ${item.status === "active" ? "badge-accent" : item.status === "processed" ? "badge-neutral" : "badge-success"}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-end">
                          <button className="btn-ghost !p-2 !text-[var(--danger)]" onClick={() => setConfirm(item.pool_id)}>
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
              icon={ListChecks}
              title="Auction pool is empty"
              sub="Queue players here so they can be nominated in the live auction flow."
            />
          )}
        </SectionCard>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Player to Auction Pool" width={420}>
        <Field label="Select Player">
          <select
            className="select"
            value={form.player_id}
            onChange={(event) => setForm({ player_id: event.target.value })}
          >
            <option value="">Select player</option>
            {availablePlayers.map((player) => (
              <option key={player.player_id} value={player.player_id}>
                {player.name} · {player.role}
              </option>
            ))}
          </select>
        </Field>

        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-outline" onClick={() => setModal(false)}>
            Cancel
          </button>
          <button className="btn-primary" onClick={addToPool}>
            Add to Pool
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove(confirm)}
        title="Remove Player"
        message="This removes the player from the waiting pool."
        danger
      />
    </DashboardLayout>
  );
}
