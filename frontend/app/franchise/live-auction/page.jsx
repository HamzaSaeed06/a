"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Broadcast,
  CoinVertical,
  MonitorPlay,
  Timer,
  TrendUp,
  Trophy,
} from "@phosphor-icons/react";
import DashboardLayout from "../../components/DashboardLayout";
import PlayerStatsOverlay from "../../components/PlayerStatsOverlay";
import { PageHeader, SectionCard, Toast, useToast } from "../../components/UI";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { formatCurrency, formatTime } from "../../lib/format";
import { getSocket } from "../../lib/socket";

const BID_INCREMENTS = [100000, 500000, 1000000, 2500000, 5000000];
const TIMER_MAX = 15;

function MiniTimer({ timeLeft, isActive }) {
  const progress = timeLeft / TIMER_MAX;
  const color =
    timeLeft > 10 ? "#22c55e" : timeLeft > 5 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ backgroundColor: color }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <div className="flex items-center justify-between w-full">
        <p className={`font-[var(--font-display)] text-2xl font-bold tabular-nums ${timeLeft > 10 ? "text-emerald-400" : timeLeft > 5 ? "text-amber-400" : "text-red-400"}`}>
          {timeLeft}
        </p>
        <p className="text-[0.6rem] uppercase tracking-[0.2em] text-white/30">
          {isActive ? "live" : "paused"}
        </p>
      </div>
    </div>
  );
}

export default function FranchiseLiveAuction() {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [team, setTeam] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_MAX);
  const [isActive, setIsActive] = useState(false);
  const [highestBid, setHighestBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState(null);
  const [bidLog, setBidLog] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [bidding, setBidding] = useState(false);
  const socketRef = useRef(null);
  const { toasts, toast, removeToast } = useToast();

  useEffect(() => {
    apiFetch("/super-admin/auctions")
      .then((items) => {
        setAuctions(items);
        setSelectedAuction(items[0] || null);
      })
      .catch(() => {});
    apiFetch("/franchise/my-team").then(setTeam).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedAuction) return;
    const socket = getSocket();
    socketRef.current = socket;
    socket.emit("join_auction", selectedAuction.auction_id);

    socket.on("auction_sync", (data) => {
      setTimeLeft(data.timeLeft);
      setIsActive(data.isActive);
      setCurrentPlayer(data.currentPlayer);
      setHighestBid(data.highestBid || 0);
      setHighestBidder(data.highestBidder);
    });
    socket.on("bid_updated", (data) => {
      setHighestBid(Number(data.amount || data.bid_amount));
      setHighestBidder({ team_id: data.team_id, team_name: data.team_name });
      setBidLog((current) => [{ ...data, time: new Date() }, ...current].slice(0, 30));
    });
    socket.on("timer_update", setTimeLeft);
    socket.on("auction_started", () => setIsActive(true));
    socket.on("auction_timeout", () => { setIsActive(false); setTimeLeft(0); });
    socket.on("player_changed", (player) => {
      setCurrentPlayer(player);
      setHighestBid(Number(player.base_price || 0));
      setHighestBidder(null);
      setTimeLeft(TIMER_MAX);
      setIsActive(false);
    });

    return () => {
      socket.off("auction_sync");
      socket.off("bid_updated");
      socket.off("timer_update");
      socket.off("auction_started");
      socket.off("auction_timeout");
      socket.off("player_changed");
    };
  }, [selectedAuction]);

  const placeBid = async (amount) => {
    if (!team || !currentPlayer || !selectedAuction || bidding) return;
    if (amount > Number(team.remaining_budget || 0)) {
      toast("Insufficient budget for this bid.", "error");
      return;
    }
    setBidding(true);
    try {
      await apiFetch("/franchise/bid", {
        method: "POST",
        body: JSON.stringify({
          player_id: currentPlayer.player_id,
          auction_id: selectedAuction.auction_id,
          bid_amount: amount,
        }),
      });
      socketRef.current?.emit("franchise_bid", {
        auction_id: selectedAuction.auction_id,
        player_id: currentPlayer.player_id,
        team_id: team.team_id,
        team_name: team.team_name,
        amount,
      });
      toast(`Bid placed: ${formatCurrency(amount)}`, "success");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setBidding(false);
    }
  };

  const isMyBid = highestBidder?.team_id === team?.team_id;
  const nextBase = Number(highestBid || currentPlayer?.base_price || 0);

  return (
    <DashboardLayout allowedRoles={["Franchise"]}>
      <Toast toasts={toasts} removeToast={removeToast} />
      <PlayerStatsOverlay
        player={currentPlayer}
        visible={showOverlay}
        onClose={() => setShowOverlay(false)}
        bidAmount={highestBid}
        bidder={highestBidder}
      />

      <PageHeader
        title="Live Bidding Desk"
        subtitle={`${team?.team_name || user?.username || "Franchise"} · Budget remaining: ${formatCurrency(team?.remaining_budget)}`}
        action={
          <select
            className="select min-w-[200px]"
            value={selectedAuction?.auction_id || ""}
            onChange={(e) =>
              setSelectedAuction(
                auctions.find((a) => String(a.auction_id) === e.target.value) || null,
              )
            }
          >
            <option value="">Select auction</option>
            {auctions.map((a) => (
              <option key={a.auction_id} value={a.auction_id}>
                {a.auction_name} · {a.season}
              </option>
            ))}
          </select>
        }
      />

      {selectedAuction ? (
        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <SectionCard
              title="On Screen Player"
              sub="Live nomination with broadcast context and bid actions."
            >
              <AnimatePresence mode="wait">
                {currentPlayer ? (
                  <motion.div
                    key={currentPlayer.player_id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-5"
                  >
                    <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[linear-gradient(135deg,rgba(245,158,11,0.07),rgba(255,255,255,0.025))] p-5">
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="h-22 w-22 h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.06]">
                          {currentPlayer.image_url ? (
                            <img
                              src={currentPlayer.image_url.startsWith("/") ? currentPlayer.image_url : `/uploads/${currentPlayer.image_url}`}
                              alt={currentPlayer.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-amber-400/50">
                              <Trophy size={28} weight="duotone" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h2 className="font-[var(--font-display)] text-2xl font-bold tracking-[-0.04em] text-white">
                            {currentPlayer.name}
                          </h2>
                          <p className="mt-1 text-sm text-white/42">
                            {currentPlayer.role || "Player"} · {currentPlayer.country_name || "Unknown"}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="badge badge-neutral">{currentPlayer.category_name || "Open"}</span>
                            <button className="btn-outline !py-1 !px-3 !text-xs" onClick={() => setShowOverlay(true)}>
                              <MonitorPlay size={14} />
                              Full Stats
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <motion.div
                        key={highestBid}
                        initial={{ scale: 1.05 }}
                        animate={{ scale: 1 }}
                        className={`relative overflow-hidden rounded-xl border p-5 ${isMyBid ? "border-emerald-500/25 bg-emerald-400/[0.05]" : "border-white/[0.07] bg-white/[0.03]"}`}
                      >
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
                          Current Bid
                        </p>
                        <p className={`kpi-value mt-2 text-3xl font-bold ${isMyBid ? "text-emerald-400" : "text-amber-400"}`}>
                          {formatCurrency(highestBid || currentPlayer.base_price)}
                        </p>
                        <p className={`mt-1.5 text-xs font-semibold ${isMyBid ? "text-emerald-400" : "text-white/40"}`}>
                          {highestBidder
                            ? isMyBid
                              ? "You are currently leading"
                              : `Leading: ${highestBidder.team_name}`
                            : "No bids yet"}
                        </p>
                      </motion.div>

                      <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30 mb-3">
                          Countdown
                        </p>
                        <MiniTimer timeLeft={timeLeft} isActive={isActive} />
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
                      <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30 mb-4">
                        Place Incremental Bid
                      </p>
                      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                        {BID_INCREMENTS.map((increment) => {
                          const bidAmount = nextBase + increment;
                          const canAfford = bidAmount <= Number(team?.remaining_budget || 0);
                          const active = canAfford && isActive;
                          return (
                            <motion.button
                              key={increment}
                              whileHover={active ? { scale: 1.02 } : {}}
                              whileTap={active ? { scale: 0.98 } : {}}
                              className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                active
                                  ? "bg-amber-400/10 border border-amber-400/25 text-amber-400 hover:bg-amber-400/15"
                                  : "border border-white/[0.06] bg-white/[0.02] text-white/25 cursor-not-allowed"
                              }`}
                              disabled={!isActive || !canAfford || bidding}
                              onClick={() => placeBid(bidAmount)}
                            >
                              <span className="text-xs text-white/50">+{formatCurrency(increment)}</span>
                              <span>{formatCurrency(bidAmount)}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                      {!isActive ? (
                        <p className="mt-4 text-xs text-white/32">
                          Waiting for admin to start the live bidding clock.
                        </p>
                      ) : null}
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] py-14 text-center">
                    <Timer size={28} className="text-white/20 mb-3" weight="duotone" />
                    <p className="text-sm text-white/32">
                      Waiting for the next player nomination.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </SectionCard>
          </div>

          <div className="space-y-5">
            <SectionCard title="Bid Pressure" sub="Your live franchise context.">
              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white/50">
                    <CoinVertical size={15} className="text-amber-400" />
                    Remaining Budget
                  </div>
                  <p className="kpi-value mt-2.5 text-2xl font-bold text-white/90">
                    {formatCurrency(team?.remaining_budget)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white/50">
                    <TrendUp size={15} className="text-amber-400" />
                    Bid Status
                  </div>
                  <p className={`mt-2.5 text-base font-bold ${isMyBid ? "text-emerald-400" : highestBidder ? "text-red-400" : "text-white/55"}`}>
                    {isMyBid ? "Leading" : highestBidder ? "Chasing" : "Open"}
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white/50">
                    <Broadcast size={15} className="text-amber-400" />
                    Auction
                  </div>
                  <p className="mt-2.5 text-base font-semibold text-white/75 truncate">
                    {selectedAuction.auction_name}
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Bid History" padded={false}>
              <div className="max-h-[440px] overflow-y-auto">
                <AnimatePresence>
                  {bidLog.length ? (
                    bidLog.map((item, index) => (
                      <motion.div
                        key={`${item.team_id}-${item.amount || item.bid_amount}-${index}`}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="border-b border-white/[0.05] px-5 py-3.5 last:border-b-0"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className={`text-sm font-semibold ${item.team_id === team?.team_id ? "text-emerald-400" : "text-white/80"}`}>
                              {item.team_name}
                            </p>
                            <p className="mt-0.5 text-xs text-white/28">{formatTime(item.time)}</p>
                          </div>
                          <p className="text-sm font-semibold text-amber-400">
                            {formatCurrency(item.amount || item.bid_amount)}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="px-5 py-10 text-center text-sm text-white/28">
                      No bids placed yet.
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </SectionCard>
          </div>
        </div>
      ) : (
        <SectionCard padded={false}>
          <div className="px-6 py-14 text-center text-sm text-white/30">
            No auction season available for live bidding yet.
          </div>
        </SectionCard>
      )}
    </DashboardLayout>
  );
}
