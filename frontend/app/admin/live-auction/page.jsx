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
  ListChecks,
  Stack,
} from "@phosphor-icons/react";
import DashboardLayout from "../../components/DashboardLayout";
import PlayerStatsOverlay from "../../components/PlayerStatsOverlay";
import { PageHeader, SectionCard, Button, Table, TableHeader, TableBody, TableRow, TableCell, TableHead, Badge, RoleBadge } from "../../components/UI";
import { cn } from "../../lib/format";
import { toast } from "react-hot-toast";
import { apiFetch } from "../../lib/api";
import { formatCurrency, formatTime } from "../../lib/format";
import { getSocket } from "../../lib/socket";

const TIMER_MAX = 60;

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
  const [liveBids, setLiveBids] = useState([]); // Real-time socket bids
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);
  const tenSecAlerted = useRef(false); // prevent duplicate 10s toast

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
      setHighestBidder({ team_id: data.team_id, team_name: data.team_name, team_logo: data.team_logo });
      // Live bid log entry
      setLiveBids(prev => [{
        team_name: data.team_name,
        team_logo: data.team_logo,
        amount: data.amount,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }, ...prev].slice(0, 20));
      toast(`🔵 ${data.team_name} bid ${formatCurrency(data.amount)}!`);
    });

    socket.on("timer_update", (t) => {
      setTimeLeft(t);
      if (t === 10 && !tenSecAlerted.current) {
        tenSecAlerted.current = true;
        toast("10 seconds remaining!");
      }
      if (t > 10) tenSecAlerted.current = false;
    });

    socket.on("auction_started", () => {
      setIsActive(true);
      toast.success("Bidding clock started — 60 seconds!");
    });

    socket.on("auction_timeout", () => {
      setIsActive(false);
      setTimeLeft(0);
      toast("Time expired — no bids placed.");
    });

    socket.on("player_changed", (player) => {
      setCurrentPlayer(player);
      setHighestBid(Number(player.base_price));
      setHighestBidder(null);
      setTimeLeft(TIMER_MAX);
      setIsActive(false);
      setLiveBids([]);
      tenSecAlerted.current = false;
      toast(`${player.name} is now on the floor!`);
    });

    socket.on("player_sold", (data) => {
      setIsActive(false);
      setTimeLeft(0);
      setLiveBids([]);
      toast.success(`${data.player?.name || 'Player'} SOLD to ${data.team_name} for ${formatCurrency(data.amount)}!`);
      setTimeout(() => {
        fetchPool();
        fetchLog();
        fetchStatus();
      }, 1000);
    });

    return () => {
      socket.off("bid_updated");
      socket.off("timer_update");
      socket.off("auction_started");
      socket.off("auction_timeout");
      socket.off("player_changed");
      socket.off("player_sold");
    };
  }, [auction]);

  const nextPlayer = async () => {
    setLoading(true);
    try {
      const response = await apiFetch("/admin/next-player", { method: "POST" });
      if (response.done) {
        toast("All players processed — auction complete!");
      } else {
        const status = await apiFetch("/admin/live-status");
        await fetchPool();
        await fetchLog();
        setAuction(status.auction);
        setCurrentPlayer(status.current_player);
        setHighestBid(Number(status.current_player?.base_price || 0));
        setHighestBidder(null);
        setTimeLeft(TIMER_MAX);
        setIsActive(false);
        setLiveBids([]);
        tenSecAlerted.current = false;
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const startClock = () => {
    if (!auction || !socketRef.current || isActive) return;
    socketRef.current.emit("admin_start_clock", auction.auction_id);
    setIsActive(true);
  };

  const sellPlayer = async () => {
    if (!highestBidder) { toast.error("No bids placed yet!"); return; }
    setLoading(true);
    try {
      await apiFetch("/admin/sell-player", { method: "POST" });
      toast.success(`${currentPlayer?.name} SOLD to ${highestBidder?.team_name}!`);
      await fetchStatus();
      await fetchPool();
      await fetchLog();
      setHighestBidder(null);
      setIsActive(false);
      setTimeLeft(TIMER_MAX);
      setLiveBids([]);
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
      toast(`🔁 ${currentPlayer.name} moved back for re-auction.`);
      await fetchStatus();
      await fetchPool();
      await fetchLog();
      setHighestBidder(null);
      setIsActive(false);
      setTimeLeft(TIMER_MAX);
      setLiveBids([]);
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
        <div className="flex flex-col gap-6 min-w-0">
          <SectionCard title="Active Nomination">
            <AnimatePresence mode="wait">
              {currentPlayer ? (
                <motion.div
                  key={currentPlayer.player_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-6"
                >
                  <div className="grid gap-6 lg:grid-cols-12 items-stretch">
                    {/* LEFT: PLAYER CARD */}
                    <div className="lg:col-span-4">
                      <div className="surface bg-white p-0 overflow-hidden flex flex-col h-full border-slate-200 shadow-sm group">
                        {/* Image Container */}
                        <div className="p-8 pb-4 flex flex-col items-center">
                          <div className="h-44 w-44 rounded-full border border-slate-100 bg-slate-50/50 shadow-sm overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-500">
                            {currentPlayer.action_image_url || currentPlayer.image_url ? (
                              <img
                                src={(currentPlayer.action_image_url || currentPlayer.image_url).startsWith("/") ? (currentPlayer.action_image_url || currentPlayer.image_url) : `/uploads/${currentPlayer.action_image_url || currentPlayer.image_url}`}
                                alt={currentPlayer.name}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-200">
                                <Trophy size={64} weight="light" />
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-8 text-center">
                            <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase mb-1.5">CURRENT DRAFT</p>
                            <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-1 uppercase tracking-tight">
                              {currentPlayer.name}
                            </h2>
                            <p className="text-ui font-medium text-slate-500">{currentPlayer.role || "Player"}</p>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="px-6 pb-6">
                          <div className="grid grid-cols-4 border border-slate-100 rounded-lg overflow-hidden bg-white divide-x divide-slate-100">
                            {[
                              { label: 'M', val: currentPlayer.matches },
                              { label: 'W', val: currentPlayer.wickets },
                              { label: 'EC', val: currentPlayer.economy },
                              { label: 'B', val: currentPlayer.best_bowling }
                            ].map((stat) => (
                              <div key={stat.label} className="py-3 px-1 flex flex-col items-center justify-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">{stat.label}</span>
                                <span className="text-ui-xs font-bold text-slate-900">{stat.val || 0}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex items-center justify-between mt-auto">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">BASE</span>
                          <span className="text-ui-semibold text-slate-950 font-bold">{formatCurrency(currentPlayer.base_price)}</span>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: BIDDING STATION */}
                    <div className="lg:col-span-8">
                      <div className="surface bg-white p-12 flex flex-col items-center justify-center h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
                          <Money size={240} weight="fill" />
                        </div>

                        <div className="text-center relative z-10 w-full max-w-sm">
                          <h1 className="text-[5rem] font-bold text-slate-950 tracking-tighter leading-none mb-2 tabular-nums">
                            {formatCurrency(highestBid || currentPlayer.base_price)}
                          </h1>
                          <p className="text-sub text-slate-400 tracking-[0.2em] mb-12">HIGHEST FLOOR BID</p>

                          {/* Status Badge */}
                          <div className="flex items-center justify-center gap-3 mb-12">
                            <div className={cn(
                              "h-10 w-10 rounded-full flex items-center justify-center shadow-sm border",
                              highestBidder ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-950 border-slate-800 text-white"
                            )}>
                              {highestBidder ? <CheckCircle size={20} weight="fill" /> : <MonitorPlay size={20} weight="fill" />}
                            </div>
                            <span className="text-lg font-bold text-slate-900 tracking-tight">
                              {highestBidder ? `Leading: ${highestBidder.team_name}` : "Awaiting First Bid"}
                            </span>
                          </div>

                          {/* Bidding Controls (Simulator View for Admin) */}
                          <div className="flex items-center gap-4 mb-10">
                            <div className="h-12 w-12 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                              <span className="text-2xl">−</span>
                            </div>
                            <div className="flex-1 h-12 rounded-lg border border-slate-200 flex items-center justify-center bg-white">
                              <span className="text-ui-semibold text-slate-900 font-bold">{formatCurrency(highestBid)}</span>
                            </div>
                            <div className="h-12 w-12 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                              <span className="text-2xl">+</span>
                            </div>
                          </div>

                          {/* Timer & Divider */}
                          <div className="w-full relative h-1 bg-slate-100 rounded-full mb-6 overflow-hidden">
                            <motion.div 
                              className="absolute top-0 left-0 h-full bg-blue-600"
                              initial={{ width: "100%" }}
                              animate={{ width: `${(timeLeft / TIMER_MAX) * 100}%` }}
                              transition={{ duration: 1, ease: "linear" }}
                            />
                          </div>

                          <div className="flex items-center justify-center gap-2 text-slate-500">
                            <Timer size={18} weight="bold" />
                            <span className="text-xs font-bold uppercase tracking-widest">DRAFT CLOSES IN {timeLeft}S</span>
                          </div>

                          <div className="mt-12 w-full">
                            <Button 
                              variant="primary" 
                              className="w-full h-16 text-lg tracking-widest uppercase rounded-xl bg-slate-950 hover:bg-slate-900"
                              onClick={sellPlayer}
                              disabled={!highestBidder}
                            >
                              CONFIRM SALE {formatCurrency(highestBid)}
                              <Trophy size={20} weight="fill" className="ml-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-slate-50/50 py-24 text-center rounded-xl">
                  <div className="h-16 w-16 rounded-full flex items-center justify-center mb-5 bg-slate-50">
                    <Timer size={32} className="text-slate-300" weight="duotone" />
                  </div>
                  <h3 className="text-h3 text-slate-900 mb-2">No Active Nomination</h3>
                  <p className="text-ui text-slate-500 max-w-[300px] leading-relaxed">
                    Ready to start? Press <span className="font-semibold text-slate-900">Next Player</span> in the header.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </SectionCard>

          <AnimatePresence>
            {currentPlayer ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SectionCard title="Auctioneer Controls">
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="primary" 
                      onClick={startClock} 
                      disabled={isActive || loading} 
                      className="h-12 px-6 text-base active:scale-95"
                    >
                      <Timer size={20} weight="bold" />
                      Start Clock
                    </Button>
                    <Button 
                      variant="primary" 
                      className="h-12 px-6 text-base bg-emerald-600 hover:bg-emerald-700 border-transparent active:scale-95" 
                      onClick={sellPlayer} 
                      loading={loading}
                      loadingText="Marking..."
                    >
                      <CheckCircle size={20} weight="bold" />
                      Sell Player
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={reAuction} 
                      loading={loading}
                      loadingText="Moving..."
                      className="h-12 px-6 text-base active:scale-95"
                    >
                      <ArrowClockwise size={20} weight="bold" />
                      Re-auction
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-12 px-6 text-base text-red-600 hover:bg-red-50 hover:border-red-200 active:scale-95" 
                      onClick={nextPlayer} 
                      loading={loading}
                      loadingText="Skipping..."
                    >
                      <SkipForward size={20} weight="bold" />
                      Unsold
                    </Button>
                  </div>
                </SectionCard>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-6 min-w-0">
          <SectionCard title="Upcoming Pool" sub={`${pool.length} players in queue`} padded={false}>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">PLAYER</TableHead>
                    <TableHead>ROLE</TableHead>
                    <TableHead className="text-right pr-6">BASE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pool.length ? (
                    pool.map((item) => (
                      <TableRow key={item.pool_id} className="group">
                        <TableCell className="pl-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn("h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold border border-slate-100 shadow-sm overflow-hidden transition-transform group-hover:scale-105", !item.image_url && "bg-slate-900 text-white")}>
                              {item.image_url ? (
                                <img src={item.image_url.startsWith("/") ? item.image_url : `/uploads/${item.image_url}`} alt="" className="w-full h-full object-contain" />
                              ) : (
                                item.name?.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-ui-semibold text-slate-900 truncate leading-tight">{item.name}</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">LOT #{item.lot_number}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.country_code && (
                              <img
                                src={`https://flagcdn.com/w40/${item.country_code.toLowerCase()}.png`}
                                alt=""
                                className="country-flag !h-3 !w-4 opacity-80"
                              />
                            )}
                            <span className="text-ui text-slate-600">{item.role}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6 font-bold text-slate-900 text-ui">
                          {formatCurrency(item.base_price)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-40 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 opacity-30">
                           <ListChecks size={32} weight="light" />
                           <p className="text-ui font-medium">Pool is empty</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </SectionCard>

          <SectionCard title="Auction Activity" padded={false} className="flex-1">
            <div className="flex flex-col h-full overflow-hidden">
              {/* Live Bid Stream (socket) */}
              {liveBids.length > 0 && (
                <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sub text-slate-400">BID MONITORING STREAM</p>
                    <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
                      <div className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[9px] font-bold text-blue-600 uppercase">{liveBids.length} ACTIVE</span>
                    </div>
                  </div>
                  <div className="max-h-[160px] overflow-y-auto no-scrollbar space-y-2 pr-1">
                    {liveBids.map((bid, i) => (
                      <div key={i} className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-500", 
                        i === 0 ? "bg-white border-blue-100 shadow-md ring-1 ring-blue-50" : "bg-white/50 border-slate-100 opacity-80"
                      )}>
                        <div className="h-8 w-8 shrink-0 rounded-full bg-slate-900 text-white flex items-center justify-center overflow-hidden border border-slate-200">
                          {bid.team_logo ? <img src={bid.team_logo.startsWith("/") ? bid.team_logo : `/uploads/${bid.team_logo}`} alt="" className="h-full w-full object-contain" /> : bid.team_name?.substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                             <span className={cn("text-ui-semibold truncate", i === 0 ? "text-blue-600" : "text-slate-900")}>
                               {bid.team_name}
                             </span>
                             <span className="text-ui-semibold text-slate-900 tabular-nums">
                               {formatCurrency(bid.bid_amount || bid.amount)}
                             </span>
                          </div>
                          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                             <span>{i === 0 ? "Highest Bid" : "Outbid"}</span>
                             <span>{bid.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              {/* DB Activity Log */}
              <div className="flex-1 overflow-y-auto p-6 no-scrollbar max-h-[400px]">
                <p className="text-sub text-slate-400 mb-4">SYSTEM ACTIVITY LOG</p>
                <div className="space-y-4">
                  {log.length ? (
                    log.map((item, index) => (
                      <div key={`${item.log_time}-${index}`} className="relative pl-6 pb-4 border-l border-slate-100 last:border-0 last:pb-0">
                        <div className="absolute left-[-5px] top-1 h-2.5 w-2.5 rounded-full bg-slate-200 border-2 border-white" />
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-ui text-slate-900 font-medium">
                              {item.player_name || "System"}: <span className="text-slate-500">{item.action}</span>
                            </p>
                            <p className="text-[10px] text-blue-600 mt-0.5 font-bold tracking-tight uppercase">
                              @{item.team_name || "platform"} {item.amount ? `• ${formatCurrency(item.amount)}` : ''}
                            </p>
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 tabular-nums shrink-0 mt-0.5">
                            {formatTime(item.log_time)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center opacity-20">
                      <p className="text-ui">No activity recorded yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
