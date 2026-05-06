import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowClockwise, CaretRight, CheckCircle, MonitorPlay, SkipForward, Timer, Trophy, Money, Broadcast } from "@phosphor-icons/react";
import DashboardLayout from "../../components/DashboardLayout";
import PlayerStatsOverlay from "../../components/PlayerStatsOverlay";
import { PageHeader, SectionCard, Button, Table, TableHeader, TableBody, TableRow, TableCell, TableHead, RoleBadge } from "../../components/UI";
import { cn, formatCurrency, formatTime } from "../../lib/format";
import { toast } from "react-hot-toast";
import { apiFetch } from "../../lib/api";
import { getSocket } from "../../lib/socket";

const TIMER_MAX = 60;

function TimerRing({ timeLeft, isActive }) {
  const size = 160, stroke = 6, r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  const progress = Math.max(0, timeLeft / TIMER_MAX), dash = circ * progress;
  const color = timeLeft > 10 ? "#60a5fa" : timeLeft > 5 ? "#fbbf24" : "#ef4444";
  const glowColor = timeLeft > 10 ? "rgba(96, 165, 250, 0.4)" : timeLeft > 5 ? "rgba(251, 191, 36, 0.4)" : "rgba(239, 68, 68, 0.4)";
  const textColor = timeLeft > 10 ? "text-blue-400" : timeLeft > 5 ? "text-amber-400" : "text-red-400";
  const hasGlow = timeLeft <= 10 && isActive;
  
  return (
    <div className={cn("relative flex items-center justify-center", hasGlow && "animate-glow-blue")}>
      <svg width={size} height={size} className="-rotate-90 drop-shadow-lg" style={{
        filter: hasGlow ? `drop-shadow(0 0 20px ${glowColor})` : "drop-shadow(0 2px 8px rgba(0,0,0,0.3))"
      }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#374151" strokeWidth={stroke} opacity={0.3} />
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
          initial={{ scale: 1.2, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className={cn("text-5xl font-black tabular-nums tracking-tight", textColor)}
        >
          {timeLeft}
        </motion.p>
        <p className="text-[0.6rem] capitalize font-bold tracking-[0.2em] text-gray-400 mt-1">seconds</p>
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
  const [liveBids, setLiveBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);
  const tenSecAlerted = useRef(false);

  const fetchStatus = async () => {
    try {
      const data = await apiFetch("/admin/live-status");
      setAuction(data.auction);
      setCurrentPlayer(data.current_player);
      if (data.current_player) setHighestBid(Number(data.current_player.current_bid || data.current_player.base_price || 0));
    } catch {}
  };

  const fetchPool = () => apiFetch("/admin/auction-pool").then((items) => setPool(items.filter((item) => item.status === "waiting"))).catch(() => {});
  const fetchLog = () => apiFetch("/admin/auction-log").then((items) => setLog(items.slice(0, 20))).catch(() => {});

  useEffect(() => { Promise.all([fetchStatus(), fetchPool(), fetchLog()]); }, []);

  useEffect(() => {
    if (!auction) return;
    const socket = getSocket();
    socketRef.current = socket;
    socket.emit("join_auction", auction.auction_id);

    socket.on("bid_updated", (data) => {
      const bidder = data.highestBidder || { team_id: data.team_id, team_name: data.team_name, team_logo: data.team_logo };
      const amount = data.highestBid ?? data.amount;
      setHighestBid(Number(amount));
      setHighestBidder(bidder);
      setLiveBids(prev => [{ team_name: bidder.team_name, team_logo: bidder.team_logo, amount, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) }, ...prev].slice(0, 20));
      toast(`🔵 ${bidder.team_name} bid ${formatCurrency(amount)}!`);
    });
    socket.on("timer_update", (payload) => {
      const t = typeof payload === "object" ? payload.timeLeft : payload;
      const active = typeof payload === "object" ? payload.isActive : undefined;
      setTimeLeft(t);
      if (active !== undefined) setIsActive(active);
      if (t === 10 && !tenSecAlerted.current) { tenSecAlerted.current = true; toast("10 seconds remaining!"); }
      if (t > 10) tenSecAlerted.current = false;
    });
    socket.on("auction_started", () => { setIsActive(true); toast.success("Bidding clock started — 60 seconds!"); });
    socket.on("auction_timeout", () => { setIsActive(false); setTimeLeft(0); toast("Time expired — no bids placed."); });
    socket.on("player_changed", (player) => { setCurrentPlayer(player); setHighestBid(Number(player.base_price)); setHighestBidder(null); setTimeLeft(TIMER_MAX); setIsActive(false); setLiveBids([]); tenSecAlerted.current = false; toast(`${player.name} is now on the floor!`); });
    socket.on("player_sold", (data) => { setIsActive(false); setTimeLeft(0); setLiveBids([]); toast.success(`${data.player?.name || "Player"} SOLD to ${data.team_name} for ${formatCurrency(data.amount)}!`); setTimeout(() => { fetchPool(); fetchLog(); fetchStatus(); }, 1000); });

    return () => { socket.off("bid_updated"); socket.off("timer_update"); socket.off("auction_started"); socket.off("auction_timeout"); socket.off("player_changed"); socket.off("player_sold"); };
  }, [auction]);

  const nextPlayer = async () => {
    setLoading(true);
    try {
      const response = await apiFetch("/admin/next-player", { method: "POST" });
      if (response.done) { toast("All players processed — auction complete!"); }
      else {
        const status = await apiFetch("/admin/live-status");
        await fetchPool(); await fetchLog();
        setAuction(status.auction); setCurrentPlayer(status.current_player);
        setHighestBid(Number(status.current_player?.base_price || 0)); setHighestBidder(null);
        setTimeLeft(TIMER_MAX); setIsActive(false); setLiveBids([]); tenSecAlerted.current = false;
      }
    } catch (error) { toast.error(error.message); } finally { setLoading(false); }
  };

  const startClock = () => { if (!auction || !socketRef.current || isActive) return; socketRef.current.emit("admin_start_clock", auction.auction_id); setIsActive(true); };

  const sellPlayer = async () => {
    if (!highestBidder) { toast.error("No bids placed yet!"); return; }
    setLoading(true);
    try {
      await apiFetch("/admin/sell-player", { method: "POST" });
      toast.success(`${currentPlayer?.name} SOLD to ${highestBidder?.team_name}!`);
      await fetchStatus(); await fetchPool(); await fetchLog();
      setHighestBidder(null); setIsActive(false); setTimeLeft(TIMER_MAX); setLiveBids([]);
    } catch (error) { toast.error(error.message); } finally { setLoading(false); }
  };

  const reAuction = async () => {
    if (!currentPlayer) return;
    setLoading(true);
    try {
      await apiFetch(`/admin/reauction/${currentPlayer.player_id}`, { method: "POST" });
      toast(`🔁 ${currentPlayer.name} moved back for re-auction.`);
      await fetchStatus(); await fetchPool(); await fetchLog();
      setHighestBidder(null); setIsActive(false); setTimeLeft(TIMER_MAX); setLiveBids([]);
    } catch (error) { toast.error(error.message); } finally { setLoading(false); }
  };

  return (
    <DashboardLayout allowedRoles={["Admin", "Super Admin"]}>
      <PlayerStatsOverlay player={currentPlayer} visible={showOverlay} onClose={() => setShowOverlay(false)} bidAmount={highestBid} bidder={highestBidder} />
      <PageHeader title="Live Bidding Room" subtitle={auction ? `${auction.auction_name} · Season ${auction.season}` : "No active auction season. Create one in Season Management."}
        action={<>
          <Button variant="outline" onClick={nextPlayer} loading={loading} loadingText="Loading..."><CaretRight size={16} />Next Player</Button>
          {currentPlayer ? <Button variant="primary" onClick={() => setShowOverlay(true)}><MonitorPlay size={16} />Broadcast View</Button> : null}
        </>}
      />

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr] min-w-0">
        <div className="flex flex-col gap-6 min-w-0">
          <SectionCard title="Active Nomination">
            <AnimatePresence mode="wait">
              {currentPlayer ? (
                <motion.div key={currentPlayer.player_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                  <div className="grid gap-6 lg:grid-cols-12 items-stretch">
                    <div className="lg:col-span-4">
                      <div className="surface bg-white p-0 overflow-hidden flex flex-col h-full border-slate-200 shadow-sm group">
                        <div className="p-8 pb-4 flex flex-col items-center">
                          <div className="h-44 w-44 rounded-full border border-slate-100 bg-slate-50/50 shadow-sm overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-500">
                            {currentPlayer.action_image_url || currentPlayer.image_url ? (
                              <img src={(currentPlayer.action_image_url || currentPlayer.image_url).startsWith("/") ? (currentPlayer.action_image_url || currentPlayer.image_url) : `/uploads/${currentPlayer.action_image_url || currentPlayer.image_url}`} alt={currentPlayer.name} className="h-full w-full object-contain" />
                            ) : <div className="flex h-full w-full items-center justify-center text-slate-200"><Trophy size={64} weight="light" /></div>}
                          </div>
                          <div className="mt-8 text-center">
                            <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase mb-1.5">CURRENT DRAFT</p>
                            <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-1 uppercase tracking-tight">{currentPlayer.name}</h2>
                            <p className="text-ui font-medium text-slate-500">{currentPlayer.role || "Player"}</p>
                          </div>
                        </div>
                        <div className="px-6 pb-6">
                          <div className="grid grid-cols-4 border border-slate-100 rounded-lg overflow-hidden bg-white divide-x divide-slate-100">
                            {[{ label: "M", val: currentPlayer.matches }, { label: "W", val: currentPlayer.wickets }, { label: "EC", val: currentPlayer.economy }, { label: "B", val: currentPlayer.best_bowling }].map((stat) => (
                              <div key={stat.label} className="py-3 px-1 flex flex-col items-center justify-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">{stat.label}</span>
                                <span className="text-ui-xs font-bold text-slate-900">{stat.val || 0}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex items-center justify-between mt-auto">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">BASE</span>
                          <span className="text-ui-semibold text-slate-950 font-bold">{formatCurrency(currentPlayer.base_price)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="lg:col-span-8">
                      <div className="surface bg-gray-800 p-12 flex flex-col items-center justify-center h-full relative overflow-hidden border-gray-700">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.05] text-blue-400"><Money size={240} weight="fill" /></div>
                        <motion.div 
                          className="absolute inset-0 opacity-0"
                          animate={highestBidder ? { opacity: [0, 0.15, 0] } : {}}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          style={{
                            background: "radial-gradient(circle at center, rgba(59, 130, 246, 0.3) 0%, transparent 70%)"
                          }}
                        />
                        <div className="text-center relative z-10 w-full max-w-sm">
                          <motion.h1 
                            key={highestBid}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4 }}
                            className="text-[5rem] font-bold text-white tracking-tighter leading-none mb-2 tabular-nums drop-shadow-lg"
                          >
                            {formatCurrency(highestBid || currentPlayer.base_price)}
                          </motion.h1>
                          <p className="text-sub text-gray-400 tracking-[0.2em] mb-12">HIGHEST FLOOR BID</p>
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-center gap-3 mb-12"
                          >
                            <motion.div
                              animate={highestBidder ? { scale: [1, 1.1, 1] } : {}}
                              transition={{ duration: 1, repeat: Infinity }}
                              className={cn("h-10 w-10 rounded-full flex items-center justify-center shadow-lg border transition-all", highestBidder ? "bg-blue-600 border-blue-400 text-white shadow-blue-500/50" : "bg-gray-700 border-gray-600 text-gray-400")}
                            >
                              {highestBidder ? <CheckCircle size={20} weight="fill" /> : <MonitorPlay size={20} weight="fill" />}
                            </motion.div>
                            <motion.span 
                              key={highestBidder?.team_id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="text-lg font-bold text-white tracking-tight"
                            >
                              {highestBidder ? `Leading: ${highestBidder.team_name}` : "Awaiting First Bid"}
                            </motion.span>
                          </motion.div>
                          <div className="flex items-center gap-4 mb-10">
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="h-12 w-12 rounded-lg border border-gray-600 flex items-center justify-center text-gray-400 hover:bg-gray-700 bg-gray-900 transition-colors"
                            >
                              <span className="text-2xl">−</span>
                            </motion.button>
                            <motion.div 
                              className="flex-1 h-12 rounded-lg border border-gray-600 flex items-center justify-center bg-gray-900"
                            >
                              <motion.span 
                                key={highestBid}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-ui-semibold text-white font-bold"
                              >
                                {formatCurrency(highestBid)}
                              </motion.span>
                            </motion.div>
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="h-12 w-12 rounded-lg border border-gray-600 flex items-center justify-center text-gray-400 hover:bg-gray-700 bg-gray-900 transition-colors"
                            >
                              <span className="text-2xl">+</span>
                            </motion.button>
                          </div>
                          <div className="w-full relative h-1 bg-gray-700 rounded-full mb-6 overflow-hidden">
                            <motion.div 
                              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" 
                              initial={{ width: "100%" }} 
                              animate={{ width: `${(timeLeft / TIMER_MAX) * 100}%` }} 
                              transition={{ duration: 1, ease: "linear" }}
                            />
                          </div>
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-center gap-2 text-gray-400"
                          >
                            <Timer size={18} weight="bold" />
                            <span className="text-xs font-bold uppercase tracking-widest">DRAFT CLOSES IN {timeLeft}S</span>
                          </motion.div>
                          <div className="mt-12 w-full">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button 
                                variant="primary" 
                                className="w-full h-16 text-lg tracking-widest uppercase rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-500/30" 
                                onClick={sellPlayer} 
                                disabled={!highestBidder}
                              >
                                CONFIRM SALE {formatCurrency(highestBid)}
                                <Trophy size={20} weight="fill" className="ml-2" />
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-slate-50/50 py-24 text-center rounded-xl">
                  <div className="h-16 w-16 rounded-full flex items-center justify-center mb-5 bg-slate-50"><Timer size={32} className="text-slate-300" weight="duotone" /></div>
                  <h3 className="text-h3 text-slate-900 mb-2">No Active Nomination</h3>
                  <p className="text-ui text-slate-500 max-w-[300px] leading-relaxed">Ready to start? Press <span className="font-semibold text-slate-900">Next Player</span> in the header.</p>
                </div>
              )}
            </AnimatePresence>
          </SectionCard>
          <AnimatePresence>
            {currentPlayer && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SectionCard title="Auctioneer Controls">
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary" onClick={startClock} disabled={isActive || loading} className="h-12 px-6 text-base active:scale-95"><Timer size={20} weight="bold" />Start Clock</Button>
                    <Button variant="primary" className="h-12 px-6 text-base bg-emerald-600 hover:bg-emerald-700 border-transparent active:scale-95" onClick={sellPlayer} loading={loading} loadingText="Marking..."><CheckCircle size={20} weight="bold" />Sell Player</Button>
                    <Button variant="outline" onClick={reAuction} loading={loading} loadingText="Moving..." className="h-12 px-6 text-base active:scale-95"><ArrowClockwise size={20} weight="bold" />Re-auction</Button>
                    <Button variant="outline" className="h-12 px-6 text-base text-red-600 hover:bg-red-50 hover:border-red-200 active:scale-95" onClick={nextPlayer} loading={loading} loadingText="Skipping..."><SkipForward size={20} weight="bold" />Unsold</Button>
                  </div>
                </SectionCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex flex-col gap-6 min-w-0">
          <SectionCard title="Upcoming Pool" sub={`${pool.length} players in queue`} padded={false}>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader><TableRow><TableHead className="pl-6">PLAYER</TableHead><TableHead>ROLE</TableHead><TableHead className="text-right pr-6">BASE</TableHead></TableRow></TableHeader>
                <TableBody>
                  {pool.length ? pool.map((item) => (
                    <TableRow key={item.pool_id} className="group">
                      <TableCell className="pl-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className={cn("h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold border border-slate-100 shadow-sm overflow-hidden transition-transform group-hover:scale-105", !item.image_url && "bg-slate-900 text-white")}>
                            {item.image_url ? <img src={item.image_url.startsWith("/") ? item.image_url : `/uploads/${item.image_url}`} alt="" className="w-full h-full object-contain" /> : item.name?.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-ui-semibold text-slate-900 truncate leading-tight">{item.name}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">LOT #{item.lot_number}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><RoleBadge role={item.role} /></TableCell>
                      <TableCell className="text-right pr-6 font-bold text-slate-900">{formatCurrency(item.base_price)}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={3} className="text-center text-slate-400 py-8 text-sm">Pool is empty.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
          <SectionCard title="Live Bid Log" padded={false}>
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar divide-y divide-slate-100">
              {liveBids.length ? liveBids.map((bid, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-3">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold overflow-hidden">
                    {bid.team_logo ? <img src={bid.team_logo.startsWith("/") ? bid.team_logo : `/uploads/${bid.team_logo}`} alt="" className="w-full h-full object-contain" /> : bid.team_name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-ui-semibold text-slate-900 truncate">{bid.team_name}</p>
                    <p className="text-ui-xs text-slate-500">{bid.time}</p>
                  </div>
                  <p className="text-ui-semibold font-bold text-blue-600 shrink-0">{formatCurrency(bid.amount)}</p>
                </div>
              )) : <div className="text-center text-slate-400 py-8 text-sm">No bids yet.</div>}
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
