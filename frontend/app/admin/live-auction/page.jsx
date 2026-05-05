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
  Money,
  Broadcast,
  User,
  GlobeHemisphereWest,
  IdentificationBadge,
  ChartBar,
  Target,
} from "@phosphor-icons/react";
import DashboardLayout from "../../components/DashboardLayout";
import PlayerStatsOverlay from "../../components/PlayerStatsOverlay";
import { PageHeader, SectionCard, Button, Table, TableHeader, TableBody, TableRow, TableCell, TableHead, Badge, RoleBadge } from "../../components/UI";
import { cn } from "../../lib/format";
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
    timeLeft > 10 ? "#3b82f6" : timeLeft > 5 ? "#f59e0b" : "#ef4444";
  const glowClass =
    timeLeft > 10 ? "text-blue-500" : timeLeft > 5 ? "text-amber-500" : "text-red-500";
  const textColor =
    timeLeft > 10 ? "text-blue-600" : timeLeft > 5 ? "text-amber-600" : "text-red-600";
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
        <p className="text-[0.6rem] capitalize font-bold tracking-[0.2em] text-slate-400 mt-1">seconds</p>
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

        if (status.current_player && status.auction && socketRef.current) {
          socketRef.current.emit("admin_set_player", {
            auction_id: status.auction.auction_id,
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
            <Button 
              variant="outline" 
              onClick={nextPlayer} 
              loading={loading}
              loadingText="Loading..."
            >
              <CaretRight size={16} />
              Next Player
            </Button>
            {currentPlayer ? (
              <Button variant="primary" onClick={() => setShowOverlay(true)}>
                <MonitorPlay size={16} />
                Broadcast View
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr] min-w-0">
        <div className="flex flex-col gap-8 min-w-0">
          <SectionCard title="Active Nomination" className="flex-1 overflow-visible border-none shadow-xl bg-white/80 backdrop-blur-md">
            <AnimatePresence mode="wait">
              {currentPlayer ? (
                <motion.div
                  key={currentPlayer.player_id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex flex-col h-full"
                >
                  <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
                    <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/50 p-8 shadow-inner">
                      <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
                        <div className={cn("relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl border-2 border-white shadow-2xl ring-8 ring-slate-50/50", !(currentPlayer.action_image_url || currentPlayer.image_url) && "bg-slate-100")}>
                          {currentPlayer.action_image_url || currentPlayer.image_url ? (
                            <img
                              src={(currentPlayer.action_image_url || currentPlayer.image_url).startsWith("/") ? (currentPlayer.action_image_url || currentPlayer.image_url) : `/uploads/${currentPlayer.action_image_url || currentPlayer.image_url}`}
                              alt={currentPlayer.name}
                              className="h-full w-full object-contain transform hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-200">
                              <Trophy size={64} weight="light" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                             <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600/70">Live Nomination</span>
                          </div>
                          <h2 className="text-5xl font-black tracking-tight text-slate-900 leading-none drop-shadow-sm">
                            {currentPlayer.name}
                          </h2>
                          <div className="mt-4 flex items-center gap-3 text-sm font-bold text-slate-500">
                            <RoleBadge role={currentPlayer.role} /> 
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <div className="flex items-center gap-2">
                                {currentPlayer.country_code && (
                                  <img
                                    src={`https://flagcdn.com/w40/${currentPlayer.country_code.toLowerCase()}.png`}
                                    alt=""
                                    className="country-flag !mr-0 !h-3.5 !w-5"
                                  />
                                )}
                                <span>{currentPlayer.country_name || "Unknown"}</span>
                            </div>
                          </div>
                          <div className="mt-6 flex flex-wrap gap-3">
                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white shadow-md">
                              {currentPlayer.category_name || "Open"}
                            </span>
                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
                              Base {formatCurrency(currentPlayer.base_price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="flex flex-col items-center bg-white p-8 rounded-3xl border border-slate-100 shadow-xl min-w-[220px]">
                        <TimerRing timeLeft={timeLeft} isActive={isActive} />
                        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                          {isActive ? "Bidding In Progress" : "System Standby"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 mt-8 sm:grid-cols-2">
                    <motion.div
                      key={highestBid}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-xl"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                         <Money size={120} weight="fill" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                        Leading Bid Amount
                      </p>
                      <p className="text-6xl font-black tracking-tighter text-slate-950 tabular-nums drop-shadow-sm">
                        {formatCurrency(highestBid || currentPlayer.base_price)}
                      </p>
                      <div className="mt-6 flex items-center gap-3 py-3 px-4 bg-slate-50 rounded-xl border border-slate-100">
                         <div className={`h-3 w-3 rounded-full ${highestBidder ? "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)] animate-pulse" : "bg-slate-300"}`} />
                         <p className="text-sm font-black text-slate-900">
                           {highestBidder
                             ? <span className="text-blue-600 tracking-tight">Leader: {highestBidder.team_name}</span>
                             : <span className="text-slate-400">Awaiting first franchise bid...</span>}
                         </p>
                      </div>
                    </motion.div>

                    <div className="rounded-3xl border border-slate-100 bg-slate-950 p-8 shadow-2xl flex flex-col justify-between text-white">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">
                          Auction Room Status
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="relative flex h-4 w-4">
                            {isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-4 w-4 ${isActive ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]' : 'bg-white/20'}`}></span>
                          </div>
                          <p className="text-2xl font-black text-white uppercase tracking-tight">
                            {isActive ? "Live Session" : "Paused"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Nomination Queue</span>
                         <span className="text-xl font-black text-white tabular-nums">{pool.length} Players</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-32 text-center">
                  <div className="h-20 w-20 rounded-full bg-white shadow-xl flex items-center justify-center mb-6">
                     <Timer size={40} className="text-slate-300" weight="duotone" />
                  </div>
                  <h3 className="text-slate-900 font-black text-2xl mb-2">No Active Nomination</h3>
                  <p className="text-sm text-slate-500 max-w-[320px] font-medium leading-relaxed">
                    Ready to start the auction? Press <span className="font-bold text-slate-900">Next Player</span> in the top header.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </SectionCard>

          <AnimatePresence>
            {currentPlayer ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <SectionCard title="Auctioneer Controls" className="border-none shadow-xl">
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      variant="primary" 
                      onClick={startClock} 
                      disabled={isActive || loading} 
                      className="h-14 px-8 text-lg shadow-xl shadow-blue-500/20 active:scale-95"
                    >
                      <Timer size={24} weight="bold" />
                      Start Clock
                    </Button>
                    <Button 
                      variant="primary" 
                      className="h-14 px-8 text-lg bg-emerald-600 hover:bg-emerald-700 border-transparent shadow-xl shadow-emerald-600/20 active:scale-95" 
                      onClick={sellPlayer} 
                      loading={loading}
                      loadingText="Marking..."
                    >
                      <CheckCircle size={24} weight="bold" />
                      Sell Player
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={reAuction} 
                      loading={loading}
                      loadingText="Moving..."
                      className="h-14 px-8 text-lg font-black active:scale-95"
                    >
                      <ArrowClockwise size={24} weight="bold" />
                      Re-auction
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-14 px-8 text-lg text-red-600 hover:bg-red-50 hover:border-red-200 border-slate-200 font-black active:scale-95" 
                      onClick={nextPlayer} 
                      loading={loading}
                      loadingText="Skipping..."
                    >
                      <SkipForward size={24} weight="bold" />
                      Unsold
                    </Button>
                  </div>
                </SectionCard>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-6 min-w-0">
          <SectionCard title="Upcoming Pool" sub={`${pool.length} players waiting.`} padded={false}>
            <div className="max-h-[300px] overflow-auto no-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Player</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right pr-6">Base Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pool.length ? (
                    pool.map((item) => (
                      <TableRow key={item.pool_id}>
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <div className={cn("h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold border border-slate-100 shadow-sm overflow-hidden", !item.image_url && "bg-slate-900 text-white")}>
                              {item.image_url ? (
                                <img src={item.image_url} alt="" className="w-full h-full object-contain" />
                              ) : (
                                item.name?.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 truncate">{item.name}</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">LOT #{item.lot_number}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {item.country_code && (
                              <img
                                src={`https://flagcdn.com/w40/${item.country_code.toLowerCase()}.png`}
                                alt=""
                                className="country-flag"
                              />
                            )}
                            <RoleBadge role={item.role} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6 font-bold text-slate-950">
                          {formatCurrency(item.base_price)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-32 text-center text-sm font-medium text-slate-900">
                        Auction pool is empty
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </SectionCard>

          <SectionCard title="Auction Activity" padded={false} className="flex-1">
            <div className="max-h-[300px] overflow-auto no-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Log</TableHead>
                    <TableHead className="text-right pr-6">Action / Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {log.length ? (
                    log.map((item, index) => (
                      <TableRow key={`${item.log_time}-${index}`}>
                        <TableCell className="pl-6">
                          <div className="font-semibold text-slate-900">{item.player_name || "System"}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-blue-600">@{item.team_name || "platform"}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{formatTime(item.log_time)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant={item.action === "SOLD" ? "neutral" : item.action === "UNSOLD" ? "danger" : "neutral"} className={cn(
                              item.action === "SOLD" && "!bg-blue-50 !text-blue-700 !border-blue-100"
                            )}>
                              {item.action}
                            </Badge>
                            {item.amount ? (
                              <div className="text-ui-semibold text-slate-950">{formatCurrency(item.amount)}</div>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="h-32 text-center text-sm font-medium text-slate-900">
                        Activity log is empty
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
