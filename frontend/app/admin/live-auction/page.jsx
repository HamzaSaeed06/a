"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

const TIMER_MAX = 15;

function TimerRing({ timeLeft, isActive }) {
  const size = 160;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const progress = Math.max(0, timeLeft / TIMER_MAX);
  const dash = circ * progress;

  const color =
    timeLeft > 10 ? "#22c55e" : timeLeft > 5 ? "#f59e0b" : "#ef4444";
  const glowClass =
    timeLeft > 10 ? "timer-ring-green" : timeLeft > 5 ? "timer-ring-amber" : "timer-ring-red";
  const textColor =
    timeLeft > 10 ? "text-emerald-400" : timeLeft > 5 ? "text-amber-400" : "text-red-400";
  const ringPulse =
    timeLeft <= 5 && isActive ? "animate-pulse-ring" : timeLeft <= 10 && isActive ? "animate-pulse-ring-amber" : "";

  return (
    <div className={`relative flex items-center justify-center ${ringPulse}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - dash}
          className={glowClass}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 0.4 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.p
          key={timeLeft}
          initial={{ scale: 1.18 }}
          animate={{ scale: 1 }}
          className={`text-4xl font-bold tabular-nums ${textColor}`}
        >
          {timeLeft}
        </motion.p>
        <p className="text-[0.6rem] uppercase tracking-[0.22em] text-white/30 mt-0.5">seconds</p>
      </div>
    </div>
  );
}

export default function LiveAuctionPage() {
  const [auction, setAuction] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [pool, setPool] = useState([]);
  const [timeLeft, setTimeLeft] = useState(TIMER_MAX);
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
    Promise.all([fetchStatus(), fetchPool(), fetchLog()]);
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
    socket.on("auction_timeout", () => { setIsActive(false); setTimeLeft(0); });
    socket.on("player_changed", (player) => {
      setCurrentPlayer(player);
      setHighestBid(Number(player.base_price));
      setHighestBidder(null);
      setTimeLeft(TIMER_MAX);
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
        setTimeLeft(TIMER_MAX);
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
      setTimeLeft(TIMER_MAX);
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
      setTimeLeft(TIMER_MAX);
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={["Admin", "Super Admin"]}>
      <Toast toasts={toasts} removeToast={removeToast} />
      <PlayerStatsOverlay
        player={currentPlayer}
        visible={showOverlay}
        onClose={() => setShowOverlay(false)}
        bidAmount={highestBid}
        bidder={highestBidder}
      />

      <PageHeader
        title="Live Auction Floor"
        subtitle={
          auction
            ? `${auction.auction_name} · Season ${auction.season}`
            : "No auction season active. Create one from Governance."
        }
        action={
          <>
            <button className="btn-outline" onClick={nextPlayer} disabled={loading}>
              <CaretRight size={16} />
              Next Player
            </button>
            {currentPlayer ? (
              <button className="btn-primary" onClick={() => setShowOverlay(true)}>
                <MonitorPlay size={16} />
                Broadcast View
              </button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="space-y-5">
          <SectionCard
            title="Current Nomination"
            sub="Focus card with live bid pressure and countdown state."
          >
            <AnimatePresence mode="wait">
              {currentPlayer ? (
                <motion.div
                  key={currentPlayer.player_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
                    <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[linear-gradient(135deg,rgba(245,158,11,0.07),rgba(255,255,255,0.025))] p-5">
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.06]">
                          {currentPlayer.image_url ? (
                            <img
                              src={currentPlayer.image_url.startsWith("/") ? currentPlayer.image_url : `/uploads/${currentPlayer.image_url}`}
                              alt={currentPlayer.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-amber-400/60">
                              <Trophy size={32} weight="duotone" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-3xl font-bold tracking-[-0.05em] text-white leading-tight">
                            {currentPlayer.name}
                          </h2>
                          <p className="mt-1.5 text-sm text-white/45">
                            {currentPlayer.role || "Player"} · {currentPlayer.country_name || "Unknown"}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="badge badge-neutral">{currentPlayer.category_name || "Open"}</span>
                            <span className="badge badge-gold">Base {formatCurrency(currentPlayer.base_price)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center lg:py-0">
                      <div className="flex flex-col items-center">
                        <TimerRing timeLeft={timeLeft} isActive={isActive} />
                        <p className="mt-3 text-[0.65rem] uppercase tracking-[0.2em] text-white/30">
                          {isActive ? "Counting down" : "Clock stopped"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <motion.div
                      key={highestBid}
                      initial={{ scale: 1.04 }}
                      animate={{ scale: 1 }}
                      className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.03] p-5"
                    >
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
                      <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                        Current Bid
                      </p>
                      <p className="kpi-value mt-3 text-4xl font-bold text-amber-400">
                        {formatCurrency(highestBid || currentPlayer.base_price)}
                      </p>
                      <p className="mt-2 text-xs text-white/40">
                        {highestBidder
                          ? `Leading: ${highestBidder.team_name}`
                          : "No bids placed yet"}
                      </p>
                    </motion.div>

                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
                      <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                        Lot Status
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-white/20"}`} />
                        <p className="text-sm font-semibold text-white/75">
                          {isActive ? "Bidding live" : "Awaiting start"}
                        </p>
                      </div>
                      <p className="mt-2 text-xs text-white/40">
                        Pool waiting: {pool.length} players
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] py-14 text-center">
                  <Timer size={28} className="text-white/20 mb-3" weight="duotone" />
                  <p className="text-sm text-white/35">
                    Press <span className="font-semibold text-white/60">Next Player</span> to begin nominations.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </SectionCard>

          <AnimatePresence>
            {currentPlayer ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <SectionCard
                  title="Auction Controls"
                  sub="Drive timer state and final player outcome."
                >
                  <div className="flex flex-wrap gap-2.5">
                    <button className="btn-primary" onClick={startClock} disabled={isActive || loading}>
                      <Timer size={16} />
                      Start Clock
                    </button>
                    <button className="btn-primary" onClick={sellPlayer} disabled={loading}>
                      <CheckCircle size={16} />
                      Mark Sold
                    </button>
                    <button className="btn-outline" onClick={reAuction} disabled={loading}>
                      <ArrowClockwise size={16} />
                      Re-auction
                    </button>
                    <button className="btn-danger" onClick={nextPlayer} disabled={loading}>
                      <SkipForward size={16} />
                      Skip as Unsold
                    </button>
                  </div>
                </SectionCard>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="space-y-5">
          <SectionCard title={`Waiting Pool · ${pool.length}`} padded={false}>
            <div className="max-h-[400px] overflow-y-auto">
              {pool.length ? (
                pool.map((item, index) => (
                  <motion.div
                    key={item.pool_id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5 last:border-b-0 hover:bg-white/[0.025] transition"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white/85">{item.name}</p>
                      <p className="mt-0.5 text-xs text-white/35">
                        Lot #{item.lot_number} · {item.role}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-amber-400">
                      {formatCurrency(item.base_price)}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="px-5 py-10 text-center text-sm text-white/28">
                  No waiting players remain.
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Auction Log" padded={false}>
            <div className="max-h-[400px] overflow-y-auto">
              {log.length ? (
                log.map((item, index) => (
                  <div
                    key={`${item.log_time}-${index}`}
                    className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5 last:border-b-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white/80">{item.player_name || "System event"}</p>
                      <p className="mt-0.5 text-xs text-white/32">
                        {item.team_name || "—"} · {formatTime(item.log_time)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${item.action === "SOLD" ? "badge-success" : item.action === "UNSOLD" ? "badge-danger" : "badge-neutral"}`}>
                        {item.action}
                      </span>
                      {item.amount ? (
                        <p className="mt-1.5 text-xs font-semibold text-amber-400">
                          {formatCurrency(item.amount)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-10 text-center text-sm text-white/28">
                  No activity recorded yet.
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
