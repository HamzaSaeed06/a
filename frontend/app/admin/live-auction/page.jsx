"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowClockwise,
  CaretRight,
  CheckCircle,
  MonitorPlay,
  SkipForward,
  Timer,
  Trophy,
} from "@phosphor-icons/react";
import DashboardLayout from "../../components/DashboardLayout";
import PlayerStatsOverlay from "../../components/PlayerStatsOverlay";
import { PageHeader, SectionCard, Toast, useToast } from "../../components/UI";
import { apiFetch } from "../../lib/api";
import { formatCurrency, formatTime } from "../../lib/format";
import { getSocket } from "../../lib/socket";

export default function LiveAuctionPage() {
  const [auction, setAuction] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [pool, setPool] = useState([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isActive, setIsActive] = useState(false);
  const [highestBid, setHighestBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);
  const { toasts, toast, removeToast } = useToast();

  const fetchStatus = async () => {
    try {
      const data = await apiFetch("/admin/live-status");
      setAuction(data.auction);
      setCurrentPlayer(data.current_player);
      if (data.current_player) {
        setHighestBid(Number(data.current_player.current_bid || data.current_player.base_price || 0));
      }
    } catch {}
  };

  const fetchPool = () =>
    apiFetch("/admin/auction-pool")
      .then((items) => setPool(items.filter((item) => item.status === "waiting")))
      .catch(() => {});

  const fetchLog = () =>
    apiFetch("/admin/auction-log")
      .then((items) => setLog(items.slice(0, 20)))
      .catch(() => {});

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchStatus(), fetchPool(), fetchLog()]);
    };

    load();
  }, []);

  useEffect(() => {
    if (!auction) return;

    const socket = getSocket();
    socketRef.current = socket;
    socket.emit("join_auction", auction.auction_id);

    socket.on("bid_updated", (data) => {
      setHighestBid(Number(data.amount));
      setHighestBidder({ team_id: data.team_id, team_name: data.team_name });
    });
    socket.on("timer_update", setTimeLeft);
    socket.on("auction_started", () => setIsActive(true));
    socket.on("auction_timeout", () => {
      setIsActive(false);
      setTimeLeft(0);
    });
    socket.on("player_changed", (player) => {
      setCurrentPlayer(player);
      setHighestBid(Number(player.base_price));
      setHighestBidder(null);
      setTimeLeft(15);
      setIsActive(false);
    });

    return () => {
      socket.off("bid_updated");
      socket.off("timer_update");
      socket.off("auction_started");
      socket.off("auction_timeout");
      socket.off("player_changed");
    };
  }, [auction]);

  const nextPlayer = async () => {
    setLoading(true);
    try {
      const response = await apiFetch("/admin/next-player", { method: "POST" });
      if (response.done) {
        toast("All waiting players have been processed.", "info");
      } else {
        toast("Next player loaded.", "success");
        const status = await apiFetch("/admin/live-status");
        await fetchPool();
        await fetchLog();
        setAuction(status.auction);
        setCurrentPlayer(status.current_player);
        setHighestBid(Number(status.current_player?.base_price || 0));
        setHighestBidder(null);
        setTimeLeft(15);
        setIsActive(false);

        if (status.current_player && auction && socketRef.current) {
          socketRef.current.emit("admin_set_player", {
            auction_id: auction.auction_id,
            player: status.current_player,
          });
        }
      }
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const startClock = () => {
    if (!auction || !socketRef.current) return;
    socketRef.current.emit("admin_start_clock", auction.auction_id);
    setIsActive(true);
    toast("Auction timer started.", "success");
  };

  const sellPlayer = async () => {
    setLoading(true);
    try {
      await apiFetch("/admin/sell-player", { method: "POST" });
      toast("Player marked as sold.", "success");
      await fetchStatus();
      await fetchPool();
      await fetchLog();
      setHighestBidder(null);
      setIsActive(false);
      setTimeLeft(15);
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const reAuction = async () => {
    if (!currentPlayer) return;
    setLoading(true);
    try {
      await apiFetch(`/admin/reauction/${currentPlayer.player_id}`, { method: "POST" });
      toast("Player moved back for re-auction.", "info");
      await fetchStatus();
      await fetchPool();
      await fetchLog();
      setHighestBidder(null);
      setIsActive(false);
      setTimeLeft(15);
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const timerTone =
    timeLeft > 10 ? "text-[var(--success)] border-[var(--success)]" : timeLeft > 5 ? "text-[var(--accent)] border-[var(--accent)]" : "text-[var(--danger)] border-[var(--danger)]";

  return (
    <DashboardLayout allowedRoles={["Admin", "Super Admin"]}>
      <Toast toasts={toasts} removeToast={removeToast} />
      <PlayerStatsOverlay
        player={currentPlayer}
        visible={showOverlay}
        bidAmount={highestBid}
        bidder={highestBidder}
      />

      <PageHeader
        title="Live Auction Floor"
        subtitle={
          auction
            ? `${auction.auction_name} · Season ${auction.season}`
            : "No auction season is active yet. Create one from the governance area."
        }
        action={
          <>
            <button className="btn-outline" onClick={nextPlayer} disabled={loading}>
              <CaretRight size={18} />
              Next Player
            </button>
            {currentPlayer ? (
              <button className="btn-primary" onClick={() => setShowOverlay(true)}>
                <MonitorPlay size={18} />
                Broadcast View
              </button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <SectionCard title="Current Nomination" sub="Auctioneer focus card with live bid pressure and timer state.">
            {currentPlayer ? (
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[28px] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(15,118,110,0.1),rgba(255,255,255,0.88))] p-6">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center">
                    <div className="h-28 w-28 overflow-hidden rounded-[26px] border border-[var(--line)] bg-white">
                      {currentPlayer.image_url ? (
                        <img
                          src={currentPlayer.image_url.startsWith("/") ? currentPlayer.image_url : `/uploads/${currentPlayer.image_url}`}
                          alt={currentPlayer.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[var(--accent)]">
                          <Trophy size={36} weight="duotone" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h2 className="font-[var(--font-display)] text-4xl font-bold tracking-[-0.06em] text-slate-950">
                        {currentPlayer.name}
                      </h2>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        {currentPlayer.role || "Player"} · {currentPlayer.country_name || "Unassigned country"}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="badge badge-neutral">{currentPlayer.category_name || "Open category"}</span>
                        <span className="badge badge-accent">Base {formatCurrency(currentPlayer.base_price)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[28px] border border-[var(--line)] bg-white p-6">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Current Bid
                    </p>
                    <p className="kpi-value mt-3 text-5xl font-bold text-slate-950">
                      {formatCurrency(highestBid || currentPlayer.base_price)}
                    </p>
                    <p className="mt-3 text-sm text-[var(--muted)]">
                      {highestBidder ? `Leading team: ${highestBidder.team_name}` : "No bid leader yet"}
                    </p>
                  </div>

                  <div className={`rounded-full border-4 bg-white p-6 text-center ${timerTone}`}>
                    <Timer size={24} className="mx-auto" />
                    <p className="kpi-value mt-3 text-5xl font-bold">{timeLeft}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">seconds left</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-[var(--line-strong)] bg-white/70 px-6 py-16 text-center text-[var(--muted)]">
                Use <span className="font-semibold text-slate-950">Next Player</span> to start the next nomination.
              </div>
            )}
          </SectionCard>

          {currentPlayer ? (
            <SectionCard
              title="Auction Controls"
              sub="Drive timer state and final player outcome from here."
            >
              <div className="flex flex-wrap gap-3">
                <button className="btn-primary" onClick={startClock} disabled={isActive || loading}>
                  <Timer size={18} />
                  Start Clock
                </button>
                <button className="btn-primary" onClick={sellPlayer} disabled={loading}>
                  <CheckCircle size={18} />
                  Mark Sold
                </button>
                <button className="btn-outline" onClick={reAuction} disabled={loading}>
                  <ArrowClockwise size={18} />
                  Re-auction
                </button>
                <button className="btn-danger" onClick={nextPlayer} disabled={loading}>
                  <SkipForward size={18} />
                  Skip as Unsold
                </button>
              </div>
            </SectionCard>
          ) : null}
        </div>

        <div className="space-y-6">
          <SectionCard title={`Waiting Pool (${pool.length})`} padded={false}>
            <div className="max-h-[420px] overflow-y-auto">
              {pool.length ? (
                pool.map((item) => (
                  <div
                    key={item.pool_id}
                    className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4 last:border-b-0"
                  >
                    <div>
                      <p className="font-semibold text-slate-950">{item.name}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Lot #{item.lot_number} · {item.role}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-[var(--accent)]">
                      {formatCurrency(item.base_price)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center text-[var(--muted)]">No waiting players remain.</div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Auction Log" padded={false}>
            <div className="max-h-[420px] overflow-y-auto">
              {log.length ? (
                log.map((item, index) => (
                  <div
                    key={`${item.log_time}-${index}`}
                    className="border-b border-[var(--line)] px-6 py-4 last:border-b-0"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-950">{item.player_name || "System event"}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {item.team_name || "No team"} · {formatTime(item.log_time)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="badge badge-neutral">{item.action}</span>
                        <p className="mt-2 text-sm font-semibold text-[var(--accent)]">
                          {item.amount ? formatCurrency(item.amount) : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center text-[var(--muted)]">No activity recorded yet.</div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
