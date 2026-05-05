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
  Minus,
  Plus,
  ArrowUpRight,
  ChartBar,
  Target,
  User,
  Lightning,
  ShieldCheck,
  TrendDown
} from "@phosphor-icons/react";
import DashboardLayout from "../../components/DashboardLayout";
import PlayerStatsOverlay from "../../components/PlayerStatsOverlay";
import { PageHeader, SectionCard, Select, useToast, Spinner, Button, Toast } from "../../components/UI";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { formatCurrency, formatTime, cn } from "../../lib/format";
import { getSocket } from "../../lib/socket";

const BID_INCREMENTS = [100000, 500000, 1000000, 2500000, 5000000];
const TIMER_MAX = 15;

export default function FranchiseLiveAuction() {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [team, setTeam] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_MAX);
  const [incrementIndex, setIncrementIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [highestBid, setHighestBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState(null);
  const [bidLog, setBidLog] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [bidding, setBidding] = useState(false);
  const socketRef = useRef(null);
  const { toasts, toast, removeToast } = useToast();
  const [squadSize, setSquadSize] = useState(0);

  useEffect(() => {
    apiFetch("/franchise/auctions").then(setAuctions).catch(() => {});
    apiFetch("/franchise/my-team").then(setTeam).catch(() => {});
    apiFetch("/franchise/my-squad").then((sq) => setSquadSize(sq.length)).catch(() => {});
    apiFetch("/franchise/competitors").then(setCompetitors).catch(() => {});
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
      toast(`Bid Success: ${formatCurrency(amount)}`, "success");
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
      {/* GLOBAL THEME OVERRIDE WRAPPER */}
      <div className="fixed inset-0 z-0 bg-[#020617]" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_-20%,_#1e3a8a_0%,_transparent_50%)] opacity-40" />
      
      <div className="relative z-10 -m-4 lg:-m-8 p-4 lg:p-12 min-h-screen text-slate-100 font-sans">
        <Toast toasts={toasts} removeToast={removeToast} />
        
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-12">
           <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.2)]">
                 <Lightning size={32} weight="fill" className="text-blue-400" />
              </div>
              <div>
                 <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">Live Floor</h1>
                 <p className="text-slate-400 font-bold tracking-widest text-xs mt-1 uppercase flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                    {selectedAuction?.auction_name || "Establishing Connection..." }
                 </p>
              </div>
           </div>

           <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-3xl p-3 rounded-[2rem] border border-white/10 shadow-2xl">
              <div className="px-8 py-3 border-r border-white/5">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Available Purse</p>
                 <p className="text-2xl font-black text-emerald-400 tabular-nums">{formatCurrency(team?.remaining_budget)}</p>
              </div>
              <div className="px-8 py-3 border-r border-white/5">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Squad Slots</p>
                 <p className="text-2xl font-black text-white tabular-nums">{squadSize} / 16</p>
              </div>
              <div className="pl-4">
                 <Select
                  value={selectedAuction?.auction_id || ""}
                  onChange={(val) => setSelectedAuction(auctions.find((a) => String(a.auction_id) === val) || null)}
                  options={auctions.map((a) => ({ label: a.auction_name, value: a.auction_id }))}
                  placeholder="Switch Session"
                  className="bg-slate-800 border-none w-[200px] text-xs font-bold"
                />
              </div>
           </div>
        </div>

        {selectedAuction ? (
          <div className="grid gap-10 xl:grid-cols-[400px_1fr_400px]">
            {/* LEFT: PLAYER PROFILE */}
            <div className="flex flex-col gap-8">
               <div className="rounded-[3rem] bg-slate-900/60 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl group">
                  <div className="relative aspect-[3/4] bg-slate-950">
                     {currentPlayer?.image_url ? (
                        <img 
                          src={currentPlayer.image_url.startsWith("/") ? currentPlayer.image_url : `/uploads/${currentPlayer.image_url}`} 
                          className="h-full w-full object-contain" 
                          alt={currentPlayer.name} 
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-white/5">
                          <User size={140} weight="fill" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                      <div className="absolute bottom-0 inset-x-0 p-10">
                         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 mb-4 backdrop-blur-md">
                            <ShieldCheck size={14} className="text-blue-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">Nominated</span>
                         </div>
                         <h2 className="text-5xl font-black text-white tracking-tighter leading-none mb-6">{currentPlayer?.name || "Awaiting..."}</h2>
                         <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                               <p className="text-[9px] font-black text-slate-500 uppercase">Matches</p>
                               <p className="text-xl font-black text-white">{currentPlayer?.matches || "0"}</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                               <p className="text-[9px] font-black text-slate-500 uppercase">Wickets</p>
                               <p className="text-xl font-black text-white">{currentPlayer?.wickets || "0"}</p>
                            </div>
                         </div>
                      </div>
                  </div>
                  <div className="p-10 bg-slate-900/40 border-t border-white/10 text-center">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Opening Base Price</p>
                     <p className="text-3xl font-black text-amber-500">{formatCurrency(currentPlayer?.base_price)}</p>
                  </div>
               </div>

               <div className="rounded-[2.5rem] bg-slate-900/60 border border-white/10 p-8 shadow-2xl backdrop-blur-xl">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Performance View</h3>
                  <div className="space-y-4">
                     <button className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group" onClick={() => setShowOverlay(true)}>
                        <span className="font-bold text-slate-300 group-hover:text-white">Detailed Bio & Stats</span>
                        <ArrowUpRight size={20} className="text-blue-500" />
                     </button>
                     <button className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                        <span className="font-bold text-slate-300 group-hover:text-white">Auction Player Pool</span>
                        <MonitorPlay size={20} className="text-amber-500" />
                     </button>
                  </div>
               </div>
            </div>

            {/* CENTER: BIDDING ARENA */}
            <div className="flex flex-col gap-8">
               <div className="flex-1 rounded-[4rem] bg-slate-900/40 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] p-12 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-3xl">
                  <div className="text-center z-10 w-full mb-12">
                     <p className="text-sm font-black text-blue-400/40 uppercase tracking-[0.5em] mb-10">Current Standing Bid</p>
                     
                     <div className="relative inline-block mb-12">
                        <AnimatePresence mode="wait">
                           <motion.h1 
                            key={highestBid}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-[12rem] font-black text-white tracking-tighter leading-none tabular-nums drop-shadow-[0_0_60px_rgba(255,255,255,0.15)]"
                           >
                              {formatCurrency(highestBid || currentPlayer?.base_price)}
                           </motion.h1>
                        </AnimatePresence>
                        <div className="absolute -inset-20 bg-blue-600/10 blur-[120px] rounded-full -z-10" />
                     </div>

                     <div className="flex items-center justify-center">
                        <div className={cn(
                           "px-12 py-6 rounded-[2rem] border-2 flex items-center gap-6 transition-all duration-500 shadow-2xl backdrop-blur-2xl",
                           isMyBid ? "bg-emerald-500/20 border-emerald-500" : "bg-slate-900/80 border-white/10"
                        )}>
                           <div className={cn("h-4 w-4 rounded-full", isMyBid ? "bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" : "bg-amber-500")} />
                           <span className={cn("text-3xl font-black tracking-tight", isMyBid ? "text-emerald-400" : "text-white/80 uppercase italic")}>
                              {highestBidder ? (
                                 <span className="flex items-center gap-3">
                                    {isMyBid ? "Your Franchise Leading" : `Held by ${highestBidder.team_name}`}
                                 </span>
                              ) : "Floor Open For Bids"}
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className="mt-auto w-full max-w-2xl bg-slate-800/60 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-12 shadow-3xl">
                     <div className="flex items-center justify-between gap-10 mb-12">
                        <button 
                           onClick={() => setIncrementIndex(i => Math.max(0, i - 1))}
                           disabled={incrementIndex === 0}
                           className="h-20 w-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-5 active:scale-90"
                        >
                           <Minus size={32} weight="bold" />
                        </button>

                        <div className="flex-1 text-center">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Raise Bid Amount</p>
                           <p className="text-5xl font-black text-blue-400">+{formatCurrency(BID_INCREMENTS[incrementIndex])}</p>
                        </div>

                        <button 
                           onClick={() => setIncrementIndex(i => Math.min(BID_INCREMENTS.length - 1, i + 1))}
                           disabled={incrementIndex === BID_INCREMENTS.length - 1}
                           className="h-20 w-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-5 active:scale-90"
                        >
                           <Plus size={32} weight="bold" />
                        </button>
                     </div>

                     <div className="mb-12">
                        <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-1">
                           <motion.div 
                              className={cn(
                                 "h-full rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)]",
                                 timeLeft > 10 ? "bg-emerald-500" : timeLeft > 5 ? "bg-amber-500" : "bg-red-600 animate-pulse"
                              )}
                              initial={{ width: "100%" }}
                              animate={{ width: `${(timeLeft / TIMER_MAX) * 100}%` }}
                              transition={{ duration: 1, ease: "linear" }}
                           />
                        </div>
                        <div className="flex justify-center mt-5">
                           <span className={cn("text-xs font-black tracking-[0.4em]", timeLeft <= 5 ? "text-red-500" : "text-slate-500 uppercase")}>
                              Closing in {timeLeft} Seconds
                           </span>
                        </div>
                     </div>

                     <Button
                        disabled={!isActive || bidding || (nextBase + BID_INCREMENTS[incrementIndex]) > Number(team?.remaining_budget || 0)}
                        onClick={() => placeBid(nextBase + BID_INCREMENTS[incrementIndex])}
                        className={cn(
                           "h-32 w-full rounded-[2.5rem] text-4xl font-black transition-all shadow-2xl relative overflow-hidden group",
                           isActive ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40" : "bg-white/5 text-white/10 border-none"
                        )}
                     >
                        {bidding ? <Spinner size={40} color="white" /> : (
                           <div className="flex flex-col items-center">
                              <span className="text-[10px] opacity-40 uppercase tracking-[0.5em] mb-2 font-bold group-hover:text-white transition-colors">Confirm New Bid</span>
                              <span className="flex items-center gap-4">
                                 {formatCurrency(nextBase + BID_INCREMENTS[incrementIndex])}
                                 <TrendUp size={36} weight="bold" />
                              </span>
                           </div>
                        )}
                     </Button>
                  </div>
               </div>

               {/* QUICK RIVAL STATS */}
               <div className="rounded-[2.5rem] bg-slate-900/60 border border-white/10 p-10 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-10">
                     <h3 className="text-sm font-black text-white tracking-[0.3em] uppercase">Rival Squad Strength</h3>
                     <div className="h-px flex-1 mx-10 bg-white/5" />
                  </div>
                  <div className="grid grid-cols-4 gap-8">
                     {competitors.slice(0, 4).map(comp => (
                        <div key={comp.team_id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
                           <p className="text-[10px] font-black text-slate-500 truncate mb-3 uppercase tracking-tighter">{comp.team_name}</p>
                           <div className="flex flex-col">
                              <span className="text-sm font-black text-emerald-400">{formatCurrency(comp.remaining_budget)}</span>
                              <span className="text-[10px] font-bold text-white/30 uppercase mt-1">{comp.squadSize || 0} Players</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* RIGHT: ACTIVITY TIMELINE */}
            <div className="flex flex-col gap-8">
               <div className="flex-1 rounded-[3rem] bg-slate-900/60 border border-white/10 overflow-hidden flex flex-col shadow-2xl backdrop-blur-xl">
                  <div className="p-10 border-b border-white/10 bg-slate-800/20">
                     <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.5em]">Live Bid Feed</h3>
                        <div className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                     </div>
                  </div>
                  <div className="flex-1 overflow-y-auto no-scrollbar">
                     <AnimatePresence initial={false}>
                        {bidLog.length ? (
                           bidLog.map((log, i) => (
                              <motion.div
                                 key={`${log.team_id}-${log.time}-${i}`}
                                 initial={{ opacity: 0, x: 30 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 className={cn(
                                    "p-8 border-b border-white/5 flex items-center gap-6 transition-all",
                                    i === 0 ? "bg-white/[0.04]" : "opacity-40"
                                 )}
                              >
                                 <div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center font-black text-xs text-blue-400 shadow-xl">
                                    #{bidLog.length - i}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1.5">
                                       <p className="text-lg font-black text-white truncate leading-none tracking-tight">{log.team_name}</p>
                                       <p className="text-[10px] font-bold text-slate-500 tabular-nums">{formatTime(log.time)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <TrendUp size={14} className="text-emerald-500" />
                                       <p className="text-sm font-black text-emerald-400">{formatCurrency(log.amount || log.bid_amount)}</p>
                                    </div>
                                 </div>
                              </motion.div>
                           ))
                        ) : (
                           <div className="flex flex-col items-center justify-center py-48 opacity-10 grayscale">
                              <Broadcast size={80} weight="thin" className="mb-6" />
                              <p className="text-[10px] font-black uppercase tracking-[0.5em]">Floor Activity Pending</p>
                           </div>
                        )}
                     </AnimatePresence>
                  </div>
               </div>

               <div className="rounded-[3rem] bg-slate-900/60 border border-white/10 p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 text-white/[0.03] rotate-12">
                     <Trophy size={200} weight="fill" />
                  </div>
                  <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.5em] mb-10">Squad Breakdown</p>
                  <div className="grid grid-cols-2 gap-6 relative z-10">
                     {['Batsman', 'Keeper', 'All Rounder', 'Bowler'].map(role => (
                        <div key={role} className="bg-white/5 rounded-[1.5rem] p-6 border border-white/5">
                           <p className="text-[10px] font-black text-slate-600 uppercase tracking-tighter mb-1.5">{role}s</p>
                           <p className="text-3xl font-black text-white">0</p>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-64 rounded-[5rem] bg-slate-900/40 border border-white/5 shadow-2xl backdrop-blur-3xl">
             <Trophy size={180} weight="thin" className="text-white/5 mb-10" />
             <h3 className="text-4xl font-black text-white/20 tracking-[0.4em] uppercase italic">Awaiting Master Feed</h3>
             <p className="text-lg text-slate-600 mt-6 max-w-sm text-center font-bold tracking-tight uppercase">Select an active auction session to synchronize with the live floor data.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
