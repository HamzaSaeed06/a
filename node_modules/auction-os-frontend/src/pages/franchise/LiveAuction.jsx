import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
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
  UsersThree,
} from "@phosphor-icons/react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  SectionCard,
  useToast,
  Button,
  Toast,
  Spinner,
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

  return (
    <DashboardLayout allowedRoles={["Franchise"]}>
      <div className="flex flex-col gap-6">
        {!currentPlayer ? (
          <div className="surface bg-white py-16 px-10 flex flex-col items-center justify-center text-center border border-slate-100 shadow-sm rounded-lg relative overflow-hidden">
            <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center mb-5">
              <Broadcast
                size={28}
                weight="duotone"
                className="text-slate-400"
              />
            </div>
            <h2 className="text-ui-semibold text-slate-900 capitalize mb-1.5">
              Auction floor is currently idle
            </h2>
            <p className="text-slate-400 max-w-sm mx-auto text-[11px] leading-relaxed">
              The session is waiting for the administrator to introduce the next
              player. Live bid updates will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12 items-stretch min-h-[580px]">
            <div className="lg:col-span-4">
              <SectionCard
                padded={false}
                className="surface h-full flex flex-col bg-white overflow-hidden shadow-sm group"
              >
                <div className="flex-1 p-8 pb-4 flex flex-col items-center">
                  <div className="h-44 w-44 rounded-full border border-slate-100 bg-slate-50/50 shadow-sm overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-500">
                    {currentPlayer.image_url ? (
                      <motion.img
                        key={currentPlayer.player_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        src={currentPlayer.image_url}
                        alt={currentPlayer.name}
                        className="h-full w-full object-contain drop-shadow-xl"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-300">
                        <User size={64} weight="light" />
                      </div>
                    )}
                  </div>
                  <div className="mt-8 text-center">
                    <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase mb-1.5">
                      CURRENT DRAFT
                    </p>
                    <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-1 uppercase tracking-tight">
                      {currentPlayer.name}
                    </h2>
                    <p className="text-ui font-medium text-slate-500 capitalize">
                      {currentPlayer.role}
                    </p>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-4 border border-slate-100 rounded-lg overflow-hidden bg-white divide-x divide-slate-100">
                    {[
                      { label: "M", val: currentPlayer.matches },
                      { label: "W", val: currentPlayer.wickets },
                      { label: "EC", val: currentPlayer.economy },
                      { label: "B", val: currentPlayer.best_bowling },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="py-3 px-1 flex flex-col items-center justify-center"
                      >
                        <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                          {stat.label}
                        </span>
                        <span className="text-ui-xs font-bold text-slate-900">
                          {stat.val || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex items-center justify-between mt-auto">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    BASE
                  </span>
                  <span className="text-ui-semibold text-slate-950 font-bold">
                    {formatCurrency(currentPlayer.base_price)}
                  </span>
                </div>
              </SectionCard>
            </div>
            <div className="lg:col-span-8">
              <SectionCard className="surface h-full bg-white flex flex-col items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-[0.02]">
                  <MonitorPlay size={280} weight="fill" />
                </div>
                <div className="text-center relative z-10 w-full max-w-md">
                  <h1 className="text-[6rem] font-bold text-slate-950 tracking-tighter leading-none mb-2 tabular-nums">
                    {formatCurrency(highestBid)}
                  </h1>
                  <p className="text-sub text-slate-400 tracking-[0.2em] mb-12 uppercase">
                    Highest Floor Bid
                  </p>
                  <div className="flex items-center justify-center gap-3 mb-12">
                    <div
                      className={cn(
                        "h-11 w-11 rounded-full flex items-center justify-center shadow-sm border transition-all duration-500",
                        highestBidder?.team_id === myTeam?.team_id
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-slate-950 border-slate-800 text-white",
                      )}
                    >
                      {highestBidder?.team_id === myTeam?.team_id ? (
                        <CheckCircle size={22} weight="fill" />
                      ) : (
                        <MonitorPlay size={22} weight="fill" />
                      )}
                    </div>
                    <span className="text-xl font-bold text-slate-900 tracking-tight">
                      {highestBidder
                        ? highestBidder.team_id === myTeam?.team_id
                          ? "Your Bid is Leading"
                          : `Leading: ${highestBidder.team_name}`
                        : "Awaiting First Bid"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mb-10 px-4">
                    <button
                      onClick={() => adjustBid(false)}
                      className="h-14 w-14 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                    >
                      <Minus size={24} weight="bold" />
                    </button>
                    <div className="flex-1 h-14 rounded-xl border border-slate-900 bg-white flex items-center justify-center">
                      <span className="text-xl font-bold text-slate-900 tabular-nums">
                        {formatCurrency(bidAmount)}
                      </span>
                    </div>
                    <button
                      onClick={() => adjustBid(true)}
                      className="h-14 w-14 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                    >
                      <Plus size={24} weight="bold" />
                    </button>
                  </div>
                  <div className="w-full relative h-1.5 bg-slate-100 rounded-full mb-6 overflow-hidden">
                    <motion.div
                      className={cn(
                        "absolute top-0 left-0 h-full transition-colors duration-500",
                        isUrgent
                          ? "bg-red-500"
                          : isWarning
                            ? "bg-amber-500"
                            : "bg-slate-950",
                      )}
                      initial={{ width: "100%" }}
                      animate={{ width: `${(timeLeft / 60) * 100}%` }}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <Clock
                      size={20}
                      weight="bold"
                      className={cn(isUrgent && "text-red-500 animate-pulse")}
                    />
                    <span
                      className={cn(
                        "text-xs font-bold uppercase tracking-[0.2em]",
                        isUrgent && "text-red-500 font-black",
                      )}
                    >
                      DRAFT CLOSES IN {timeLeft}S
                    </span>
                  </div>
                  <div className="mt-12 w-full px-4">
                    <Button
                      variant="primary"
                      className={cn(
                        "w-full h-20 text-xl tracking-[0.1em] uppercase rounded-xl shadow-xl transition-all active:scale-[0.98]",
                        highestBidder?.team_id === myTeam?.team_id
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-slate-950 hover:bg-slate-900 text-white",
                      )}
                      onClick={handlePlaceBid}
                      disabled={
                        highestBidder?.team_id === myTeam?.team_id ||
                        timeLeft <= 0
                      }
                    >
                      {highestBidder?.team_id === myTeam?.team_id
                        ? "YOU ARE LEADING"
                        : `CONFIRM BID ${formatCurrency(bidAmount)}`}
                      <Gavel
                        size={28}
                        weight="fill"
                        className="ml-3 opacity-40"
                      />
                    </Button>
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-12 items-stretch mb-10">
          <div className="lg:col-span-3">
            <SectionCard
              title="Recently Sold"
              padded={false}
              className="surface h-full"
            >
              <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto no-scrollbar">
                {recentlySold.length > 0 ? (
                  recentlySold.map((p, i) => (
                    <div
                      key={i}
                      className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center border border-slate-100 shadow-sm bg-slate-950 text-white text-[11px] font-bold overflow-hidden">
                        {p.team_logo ? (
                          <img
                            src={
                              p.team_logo.startsWith("/")
                                ? p.team_logo
                                : `/uploads/${p.team_logo}`
                            }
                            alt="logo"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>{p.name?.substring(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-ui-xs font-bold text-slate-900 truncate capitalize leading-tight">
                          {p.name}
                        </p>
                        <p className="text-[10px] font-medium text-slate-500 truncate capitalize">
                          {p.team_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">
                          Price
                        </p>
                        <p className="text-ui-xs font-bold text-slate-900">
                          {formatCurrency(p.amount)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-16 text-center text-slate-400 italic text-[11px] flex flex-col items-center gap-2">
                    <Handbag size={24} />
                    No players sold yet.
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
          <div className="lg:col-span-9">
            <SectionCard
              title="Franchise Squad Tracker"
              sub="Real-time roster distribution"
              className="surface h-full bg-white"
            >
              {teamStats.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {teamStats.map((team, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-md border border-slate-200 p-5 transition-all flex flex-col hover:shadow-md"
                    >
                      <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 shrink-0 rounded-full bg-slate-950 flex items-center justify-center text-[9px] font-bold text-white shadow-sm border border-slate-100 overflow-hidden">
                            {team.logo_url ? (
                              <img
                                src={
                                  team.logo_url.startsWith("/")
                                    ? team.logo_url
                                    : `/uploads/${team.logo_url}`
                                }
                                alt="logo"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              team.team_name?.substring(0, 2)
                            )}
                          </div>
                          <h4 className="text-[11px] font-bold text-slate-900 capitalize">
                            {team.team_name}
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold text-slate-900 border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50">
                          {team.count || 0}/16
                        </span>
                      </div>
                      <div className="space-y-2.5 flex-1">
                        <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase mb-1 border-b border-slate-50 pb-1">
                          <div className="col-span-8">Draft Role</div>
                          <div className="col-span-2 text-center">Int</div>
                          <div className="col-span-2 text-right">Tot</div>
                        </div>
                        {[
                          {
                            label: "Batsman",
                            int: team.batsman_os || 0,
                            tot: team.batsman || 0,
                          },
                          {
                            label: "Keepers",
                            int: team.keepers_os || 0,
                            tot: team.keepers || 0,
                          },
                          {
                            label: "All Rounders",
                            int: team.ar_os || 0,
                            tot: team.ar || 0,
                          },
                          {
                            label: "Bowlers",
                            int: team.bowlers_os || 0,
                            tot: team.bowlers || 0,
                          },
                        ].map((role, ridx) => (
                          <div
                            key={ridx}
                            className="grid grid-cols-12 text-[11px] font-semibold capitalize py-0.5"
                          >
                            <div className="col-span-8 text-slate-600">
                              {role.label}
                            </div>
                            <div className="col-span-2 text-center text-slate-900 font-bold">
                              {role.int}
                            </div>
                            <div className="col-span-2 text-right text-slate-900 font-bold">
                              {role.tot}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-20 text-center text-slate-400 italic text-[11px] flex flex-col items-center justify-center gap-3">
                  <UsersThree size={32} />
                  Awaiting team registration and drafting activity...
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
