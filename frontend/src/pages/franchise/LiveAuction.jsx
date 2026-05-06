import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Gavel,
  Minus,
  Plus,
  Broadcast,
  Handbag,
  MonitorPlay,
  User,
  TrendUp,
} from "@phosphor-icons/react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  SectionCard,
  useToast,
  Button,
  Spinner,
  Skeleton,
} from "../../components/UI";
import { formatCurrency, cn } from "../../lib/format";
import { getSocket } from "../../lib/socket";
import { apiFetch } from "../../lib/api";

export default function FranchiseLiveAuction() {
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [highestBid, setHighestBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [myTeam, setMyTeam] = useState(null);
  const [teamStats, setTeamStats] = useState([]);
  const [recentlySold, setRecentlySold] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { toast } = useToast();
  const socketRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
    const socket = getSocket();
    socketRef.current = socket;

    socket.on("auction_sync", (data) => {
      setCurrentPlayer(data.currentPlayer);
      setHighestBid(data.highestBid || data.currentPlayer?.base_price || 0);
      setHighestBidder(data.highestBidder);
      setBidAmount(
        (data.highestBid || data.currentPlayer?.base_price || 0) +
          (data.currentPlayer?.bid_increment || 50000),
      );
      setTimeLeft(data.timeLeft);
      setIsActive(data.isActive);
    });
    socket.on("bid_updated", (data) => {
      setHighestBid(data.highestBid);
      setHighestBidder(data.highestBidder);
      setBidAmount(data.highestBid + (currentPlayer?.bid_increment || 50000));
      if (data.highestBidder?.team_id === myTeam?.team_id)
        toast("Your bid is currently leading!", "success");
    });
    socket.on("timer_update", (data) => {
      setTimeLeft(data.timeLeft);
      setIsActive(data.isActive);
    });
    socket.on("player_sold", (data) => {
      const teamName = data.team?.team_name || data.team_name || "a team";
      const playerName = data.player?.name || "Player";
      toast(`${playerName} sold to ${teamName} for ${formatCurrency(data.amount)}`, "success");
      fetchInitialData();
    });
    socket.on("player_unsold", (data) => {
      toast(`${data.player.name} went unsold`, "info");
      fetchInitialData();
    });

    return () => {
      socket.off("auction_sync");
      socket.off("bid_updated");
      socket.off("timer_update");
      socket.off("player_sold");
      socket.off("player_unsold");
    };
  }, [myTeam, currentPlayer]);

  const fetchInitialData = async () => {
    try {
      const [statsRes, soldRes, teamRes] = await Promise.all([
        apiFetch("/franchise/squad-stats"),
        apiFetch("/franchise/recently-sold"),
        apiFetch("/franchise/my-team"),
      ]);
      setTeamStats(statsRes?.data || statsRes || []);
      setRecentlySold(soldRes?.data || soldRes || []);
      setMyTeam(teamRes?.data || teamRes);
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handlePlaceBid = async () => {
    if (!currentPlayer || loading) return;
    setLoading(true);
    try {
      const res = await apiFetch("/franchise/bid", {
        method: "POST",
        body: JSON.stringify({
          player_id: currentPlayer.player_id,
          auction_id: currentPlayer.auction_id,
          bid_amount: bidAmount,
        }),
      });
      if (res.success) toast("Bid placed successfully", "success");
      else toast(res.error || res.message || "Failed to place bid", "error");
    } catch (err) {
      toast(err.message || "Connection error", "error");
    } finally {
      setLoading(false);
    }
  };

  const adjustBid = (increment) => {
    const step = currentPlayer?.bid_increment || 50000;
    setBidAmount(
      increment
        ? bidAmount + step
        : Math.max(highestBid + step, bidAmount - step),
    );
  };
  
  const isUrgent = timeLeft <= 10 && isActive;
  const isWarning = timeLeft <= 30 && isActive;
  const isLeading = highestBidder?.team_id === myTeam?.team_id;

  return (
    <DashboardLayout allowedRoles={["Franchise"]}>
      <div className="flex flex-col gap-6">
        {/* Main Auction Area */}
        {!currentPlayer ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-2xl py-20 px-10 flex flex-col items-center justify-center text-center shadow-sm"
          >
            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
              <Broadcast size={32} weight="duotone" className="text-slate-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Auction floor is currently idle
            </h2>
            <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
              The session is waiting for the administrator to introduce the next
              player. Live bid updates will appear here automatically.
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-12 items-stretch">
            {/* Player Card */}
            <div className="lg:col-span-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden h-full flex flex-col shadow-sm"
              >
                {/* Player Image */}
                <div className="p-8 pb-4 flex flex-col items-center">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="h-40 w-40 rounded-full border-4 border-slate-100 bg-slate-50 overflow-hidden relative shadow-lg"
                  >
                    {currentPlayer.image_url ? (
                      <motion.img
                        key={currentPlayer.player_id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={currentPlayer.image_url}
                        alt={currentPlayer.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-300">
                        <User size={64} weight="duotone" />
                      </div>
                    )}
                  </motion.div>
                  
                  <div className="mt-6 text-center">
                    <p className="text-[10px] font-bold text-teal-600 tracking-[0.2em] uppercase mb-1.5">
                      Current Draft
                    </p>
                    <h2 className="text-xl font-bold text-slate-900 leading-tight mb-1 tracking-tight">
                      {currentPlayer.name}
                    </h2>
                    <p className="text-sm font-medium text-slate-500 capitalize">
                      {currentPlayer.role}
                    </p>
                  </div>
                </div>
                
                {/* Stats Grid */}
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-4 border border-slate-100 rounded-xl overflow-hidden bg-slate-50 divide-x divide-slate-100">
                    {[
                      { label: "M", val: currentPlayer.matches },
                      { label: "W", val: currentPlayer.wickets },
                      { label: "EC", val: currentPlayer.economy },
                      { label: "B", val: currentPlayer.best_bowling },
                    ].map((stat) => (
                      <div key={stat.label} className="py-4 px-2 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                          {stat.label}
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          {stat.val || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Base Price */}
                <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between mt-auto">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Base Price
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    {formatCurrency(currentPlayer.base_price)}
                  </span>
                </div>
              </motion.div>
            </div>
            
            {/* Bidding Panel */}
            <div className="lg:col-span-8">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "bg-white border rounded-2xl h-full flex flex-col items-center justify-center p-10 relative overflow-hidden shadow-sm transition-colors duration-300",
                  isLeading ? "border-teal-200 bg-teal-50/30" : "border-slate-200"
                )}
              >
                {/* Subtle pattern */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                  <MonitorPlay size={240} weight="fill" />
                </div>
                
                <div className="text-center relative z-10 w-full max-w-lg">
                  {/* Current Bid Display */}
                  <motion.h1 
                    key={highestBid}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-none mb-2 tabular-nums"
                  >
                    {formatCurrency(highestBid)}
                  </motion.h1>
                  <p className="text-xs font-bold text-slate-400 tracking-[0.2em] mb-10 uppercase">
                    Highest Floor Bid
                  </p>
                  
                  {/* Leading Indicator */}
                  <div className="flex items-center justify-center gap-3 mb-10">
                    <motion.div
                      animate={isLeading ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300",
                        isLeading
                          ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
                          : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {isLeading ? (
                        <CheckCircle size={24} weight="fill" />
                      ) : (
                        <TrendUp size={24} weight="bold" />
                      )}
                    </motion.div>
                    <span className={cn(
                      "text-lg font-bold tracking-tight",
                      isLeading ? "text-teal-700" : "text-slate-700"
                    )}>
                      {highestBidder
                        ? isLeading
                          ? "Your Bid is Leading"
                          : `Leading: ${highestBidder.team_name}`
                        : "Awaiting First Bid"}
                    </span>
                  </div>
                  
                  {/* Bid Controls */}
                  <div className="flex items-center gap-4 mb-8 px-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => adjustBid(false)}
                      className="h-14 w-14 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-all bg-white shadow-sm"
                    >
                      <Minus size={24} weight="bold" />
                    </motion.button>
                    <div className="flex-1 h-14 rounded-xl border-2 border-slate-900 bg-white flex items-center justify-center shadow-sm">
                      <span className="text-xl font-bold text-slate-900 tabular-nums">
                        {formatCurrency(bidAmount)}
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => adjustBid(true)}
                      className="h-14 w-14 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-all bg-white shadow-sm"
                    >
                      <Plus size={24} weight="bold" />
                    </motion.button>
                  </div>
                  
                  {/* Timer Progress */}
                  <div className="w-full relative h-2 bg-slate-100 rounded-full mb-4 overflow-hidden">
                    <motion.div
                      className={cn(
                        "absolute top-0 left-0 h-full rounded-full transition-colors duration-500",
                        isUrgent
                          ? "bg-red-500"
                          : isWarning
                            ? "bg-amber-500"
                            : "bg-teal-600",
                      )}
                      initial={{ width: "100%" }}
                      animate={{ width: `${(timeLeft / 60) * 100}%` }}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                  </div>
                  
                  {/* Timer Display */}
                  <div className="flex items-center justify-center gap-2 mb-10">
                    <Clock
                      size={18}
                      weight="bold"
                      className={cn(
                        "transition-colors",
                        isUrgent ? "text-red-500 animate-pulse" : "text-slate-400"
                      )}
                    />
                    <span className={cn(
                      "text-sm font-bold uppercase tracking-[0.15em]",
                      isUrgent ? "text-red-500" : "text-slate-500",
                    )}>
                      Draft Closes in {timeLeft}s
                    </span>
                  </div>
                  
                  {/* Bid Button */}
                  <div className="w-full px-4">
                    <Button
                      variant={isLeading ? "secondary" : "primary"}
                      className={cn(
                        "w-full h-16 text-lg tracking-wide rounded-xl shadow-lg transition-all",
                        isLeading 
                          ? "bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200" 
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      )}
                      onClick={handlePlaceBid}
                      disabled={isLeading || timeLeft <= 0 || loading}
                      loading={loading}
                    >
                      {isLeading ? (
                        <>
                          <CheckCircle size={24} weight="fill" />
                          You Are Leading
                        </>
                      ) : (
                        <>
                          <Gavel size={24} weight="fill" />
                          Confirm Bid {formatCurrency(bidAmount)}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Bottom Section */}
        <div className="grid gap-6 lg:grid-cols-12 items-stretch">
          {/* Recently Sold */}
          <div className="lg:col-span-3">
            <SectionCard title="Recently Sold" padded={false} className="h-full">
              <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto no-scrollbar">
                {initialLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-4 flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-2 w-16" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))
                ) : recentlySold.length > 0 ? (
                  recentlySold.map((p, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center border border-slate-100 shadow-sm bg-slate-900 text-white text-xs font-bold overflow-hidden">
                        {p.team_logo ? (
                          <img
                            src={p.team_logo.startsWith("/") ? p.team_logo : `/uploads/${p.team_logo}`}
                            alt="logo"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>{p.name?.substring(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate capitalize">
                          {p.name}
                        </p>
                        <p className="text-xs font-medium text-slate-500 truncate capitalize">
                          {p.team_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-teal-600">
                          {formatCurrency(p.amount)}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                    <Handbag size={28} weight="duotone" />
                    <p className="text-sm">No players sold yet.</p>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
          
          {/* Squad Tracker */}
          <div className="lg:col-span-9">
            <SectionCard
              title="Franchise Squad Tracker"
              sub="Real-time roster distribution"
              className="h-full"
            >
              {initialLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : teamStats.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {teamStats.map((team, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="bg-white rounded-xl border border-slate-200 p-5 transition-all hover:shadow-md"
                    >
                      {/* Team Header */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-900 flex items-center justify-center text-[9px] font-bold text-white overflow-hidden">
                            {team.logo_url ? (
                              <img
                                src={team.logo_url.startsWith("/") ? team.logo_url : `/uploads/${team.logo_url}`}
                                alt="logo"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              team.team_name?.substring(0, 2)
                            )}
                          </div>
                          <h4 className="text-sm font-semibold text-slate-900 capitalize truncate">
                            {team.team_name}
                          </h4>
                        </div>
                        <span className="text-xs font-bold text-slate-600 border border-slate-200 rounded-full px-2 py-0.5 bg-slate-50">
                          {team.count || 0}/16
                        </span>
                      </div>
                      
                      {/* Role Stats */}
                      <div className="space-y-2">
                        {[
                          { label: "Batsman", val: team.batsman || 0 },
                          { label: "Bowler", val: team.bowler || 0 },
                          { label: "All-rounder", val: team.allrounder || 0 },
                          { label: "Wicketkeeper", val: team.wicketkeeper || 0 },
                        ].map((role) => (
                          <div key={role.label} className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">{role.label}</span>
                            <span className="font-semibold text-slate-700">{role.val}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Broadcast size={32} className="text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500">No team data available.</p>
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
