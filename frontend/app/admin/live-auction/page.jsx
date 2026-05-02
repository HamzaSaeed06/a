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
import { PageHeader, SectionCard } from "../../components/UI";
import { toast } from "react-hot-toast";
import { apiFetch } from "../../lib/api";
import { formatCurrency, formatTime } from "../../lib/format";
import { getSocket } from "../../lib/socket";

const TIMER_MAX = 15;

function TimerRing({ timeLeft, isActive }) {
  const size = 160;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const progress = Math.max(0, timeLeft / TIMER_MAX);
  const dash = circ * progress;

  const color =
    timeLeft > 10 ? "#10b981" : timeLeft > 5 ? "#f59e0b" : "#ef4444";
  const glowClass =
    timeLeft > 10 ? "text-emerald-500" : timeLeft > 5 ? "text-amber-500" : "text-red-500";
  const textColor =
    timeLeft > 10 ? "text-emerald-600" : timeLeft > 5 ? "text-amber-600" : "text-red-600";
  const ringPulse =
    timeLeft <= 5 && isActive ? "animate-pulse" : "";

  return (
    <div className={`relative flex items-center justify-center ${ringPulse}`}>
      <svg width={size} height={size} className="-rotate-90 drop-shadow-sm">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - dash}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 0.4 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.p
          key={timeLeft}
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          className={`text-5xl font-black tabular-nums tracking-tight ${textColor}`}
        >
          {timeLeft}
        </motion.p>
        <p className="text-[0.6rem] uppercase font-bold tracking-[0.2em] text-slate-400 mt-1">seconds</p>
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
        toast("All waiting players have been processed.", { icon: "ℹ️" });
      } else {
        toast.success("Next player loaded.");
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
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const startClock = () => {
    if (!auction || !socketRef.current) return;
    socketRef.current.emit("admin_start_clock", auction.auction_id);
    setIsActive(true);
    toast.success("Auction timer started.");
  };

  const sellPlayer = async () => {
    setLoading(true);
    try {
      await apiFetch("/admin/sell-player", { method: "POST" });
      toast.success("Player marked as sold.");
      await fetchStatus();
      await fetchPool();
      await fetchLog();
      setHighestBidder(null);
      setIsActive(false);
      setTimeLeft(TIMER_MAX);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const reAuction = async () => {
    if (!currentPlayer) return;
    setLoading(true);
    try {
      await apiFetch(`/admin/reauction/${currentPlayer.player_id}`, { method: "POST" });
      toast("Player moved back for re-auction.", { icon: "ℹ️" });
      await fetchStatus();
      await fetchPool();
      await fetchLog();
      setHighestBidder(null);
      setIsActive(false);
      setTimeLeft(TIMER_MAX);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={["Admin", "Super Admin"]}>
      <PlayerStatsOverlay
        player={currentPlayer}
        visible={showOverlay}
        onClose={() => setShowOverlay(false)}
        bidAmount={highestBid}
        bidder={highestBidder}
      />

      <PageHeader
        title="Live Bidding Room"
        subtitle={
          auction
            ? `${auction.auction_name} · Season ${auction.season}`
            : "No active auction season. Create one in Season Management."
        }
        action={
          <>
            <button className="btn btn-outline" onClick={nextPlayer} disabled={loading}>
              <CaretRight size={16} />
              Next Player
            </button>
            {currentPlayer ? (
              <button className="btn btn-primary" onClick={() => setShowOverlay(true)}>
                <MonitorPlay size={16} />
                Broadcast View
              </button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <SectionCard title="Current Player">
            <AnimatePresence mode="wait">
              {currentPlayer ? (
                <motion.div
                  key={currentPlayer.player_id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
                      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                          {currentPlayer.image_url ? (
                            <img
                              src={currentPlayer.image_url.startsWith("/") ? currentPlayer.image_url : `/uploads/${currentPlayer.image_url}`}
                              alt={currentPlayer.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-300">
                              <Trophy size={40} weight="light" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-4xl font-black tracking-tight text-slate-900 leading-none">
                            {currentPlayer.name}
                          </h2>
                          <p className="mt-2 text-sm font-medium text-slate-500 flex items-center">
                            {currentPlayer.role || "Player"} <span className="mx-2 text-slate-300">•</span> 
                            {currentPlayer.country_code && (
                              <img
                                src={`https://flagcdn.com/w40/${currentPlayer.country_code.toLowerCase()}.png`}
                                alt=""
                                className="country-flag !mr-2"
                              />
                            )}
                            {currentPlayer.country_name || "Unknown"}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2.5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                              {currentPlayer.category_name || "Open"}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                              Base {formatCurrency(currentPlayer.base_price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center lg:py-0">
                      <div className="flex flex-col items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <TimerRing timeLeft={timeLeft} isActive={isActive} />
                        <p className="mt-4 text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">
                          {isActive ? "Bidding in Progress" : "Clock Paused"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <motion.div
                      key={highestBid}
                      initial={{ scale: 1.02 }}
                      animate={{ scale: 1 }}
                      className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Current Bid
                      </p>
                      <p className="mt-3 text-5xl font-black tracking-tighter text-slate-900">
                        {formatCurrency(highestBid || currentPlayer.base_price)}
                      </p>
                      <p className="mt-3 text-sm font-medium text-slate-500">
                        {highestBidder
                          ? <span className="text-blue-600">Leading: {highestBidder.team_name}</span>
                          : "No bids placed yet"}
                      </p>
                    </motion.div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Lot Status
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                          <div className="relative flex h-3 w-3">
                            {isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                          </div>
                          <p className="text-lg font-bold text-slate-900">
                            {isActive ? "Live" : "Awaiting"}
                          </p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm font-medium text-slate-500">
                        Pool waiting: {pool.length} players
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-20 text-center">
                  <Timer size={40} className="text-slate-300 mb-4" weight="light" />
                  <p className="text-slate-500 font-medium">
                    Press <span className="font-bold text-slate-700">Next Player</span> to begin nominations.
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
                <SectionCard title="Auction Controls">
                  <div className="flex flex-wrap gap-3">
                    <button className="btn btn-primary" onClick={startClock} disabled={isActive || loading}>
                      <Timer size={18} />
                      Start Clock
                    </button>
                    <button className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 text-white" onClick={sellPlayer} disabled={loading}>
                      <CheckCircle size={18} />
                      Mark Sold
                    </button>
                    <button className="btn btn-outline" onClick={reAuction} disabled={loading}>
                      <ArrowClockwise size={18} />
                      Re-auction
                    </button>
                    <button className="btn btn-outline text-red-600 hover:bg-red-50 hover:border-red-200" onClick={nextPlayer} disabled={loading}>
                      <SkipForward size={18} />
                      Skip as Unsold
                    </button>
                  </div>
                </SectionCard>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <SectionCard title={`Upcoming Players · ${pool.length}`} padded={false}>
            <div className="max-h-[420px] overflow-y-auto">
              {pool.length ? (
                pool.map((item, index) => (
                  <motion.div
                    key={item.pool_id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center justify-between border-b border-slate-100 px-6 py-4 last:border-b-0 hover:bg-slate-50 transition"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.name}</p>
                      <p className="mt-1 text-xs font-medium text-slate-500 flex items-center gap-2">
                        Lot #{item.lot_number} <span className="mx-1 text-slate-300">•</span> 
                        {item.country_code && (
                          <img
                            src={`https://flagcdn.com/w40/${item.country_code.toLowerCase()}.png`}
                            alt=""
                            className="country-flag !w-4 !h-3 !mr-0"
                          />
                        )}
                        {item.role}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      {formatCurrency(item.base_price)}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="px-6 py-12 text-center text-sm font-medium text-slate-400">
                  No more upcoming players.
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Auction Log" padded={false}>
            <div className="max-h-[420px] overflow-y-auto">
              {log.length ? (
                log.map((item, index) => (
                  <div
                    key={`${item.log_time}-${index}`}
                    className="flex items-center justify-between border-b border-slate-100 px-6 py-4 last:border-b-0"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.player_name || "System event"}</p>
                      <p className="mt-1 text-xs font-medium text-slate-500 flex items-center gap-2">
                        {item.team_name || "—"} <span className="mx-1 text-slate-300">•</span> 
                        {item.country_code && (
                          <img
                            src={`https://flagcdn.com/w40/${item.country_code.toLowerCase()}.png`}
                            alt=""
                            className="country-flag !w-4 !h-3 !mr-0"
                          />
                        )}
                        {formatTime(item.log_time)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.65rem] font-bold tracking-widest uppercase ${
                        item.action === "SOLD"
                          ? "bg-emerald-100 text-emerald-700"
                          : item.action === "UNSOLD"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-600"
                      }`}>
                        {item.action}
                      </span>
                      {item.amount ? (
                        <p className="mt-2 text-sm font-bold text-blue-600">
                          {formatCurrency(item.amount)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center text-sm font-medium text-slate-400">
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
