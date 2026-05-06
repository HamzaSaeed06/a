import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowClockwise, CaretRight, CheckCircle, MonitorPlay, SkipForward, Timer, Trophy, Money, Broadcast } from "@phosphor-icons/react";
import DashboardLayout from "../../components/DashboardLayout";
import PlayerStatsOverlay from "../../components/PlayerStatsOverlay";
import { PageHeader, SectionCard, Button, Table, TableHeader, TableBody, TableRow, TableCell, TableHead, Badge } from "../../components/UI";
import { cn, formatCurrency, formatTime } from "../../lib/format";
import { toast } from "react-hot-toast";
import { apiFetch } from "../../lib/api";
import { getSocket } from "../../lib/socket";

const TIMER_MAX = 60;

function TimerRing({ timeLeft, isActive }) {
  const size = 160, stroke = 6, r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  const progress = Math.max(0, timeLeft / TIMER_MAX), dash = circ * progress;
  const color = timeLeft > 10 ? "#0d9488" : timeLeft > 5 ? "#d97706" : "#dc2626";
  const glowColor = timeLeft > 10 ? "rgba(13, 148, 136, 0.2)" : timeLeft > 5 ? "rgba(217, 119, 6, 0.2)" : "rgba(220, 38, 38, 0.2)";
  const textColor = timeLeft > 10 ? "text-teal-600" : timeLeft > 5 ? "text-amber-600" : "text-red-600";
  
  return (
    <div className={cn("relative flex items-center justify-center")}>
      <svg width={size} height={size} className="-rotate-90 drop-shadow-lg" style={{
        filter: isActive ? `drop-shadow(0 0 20px ${glowColor})` : "drop-shadow(0 2px 8px rgba(0,0,0,0.08))"
      }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} opacity={0.5} />
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
        <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">seconds</p>
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
      toast.success(`${bidder.team_name} bid ${formatCurrency(amount)}!`);
    });
    socket.on("timer_update", (payload) => {
      setTimeLeft(payload.time_left);
      setIsActive(payload.is_active);
      if (payload.time_left === 10) toast('10 seconds remaining!');
    });
    socket.on("player_sold", (data) => {
      setCurrentPlayer(data.player);
      setHighestBid(0);
      setHighestBidder(null);
      setTimeLeft(TIMER_MAX);
      setLiveBids([]);
      fetchPool();
      fetchLog();
    });
    socket.on("player_unsold", () => {
      setCurrentPlayer(null);
      setHighestBid(0);
      setHighestBidder(null);
      setTimeLeft(TIMER_MAX);
      setLiveBids([]);
      fetchPool();
      fetchLog();
    });
    socket.on("auction_ended", () => {
      toast.success('Auction has ended!');
      setAuction(null);
    });
    return () => socket.emit("leave_auction", auction.auction_id);
  }, [auction]);

  const handleSkipPlayer = async () => {
    setLoading(true);
    try {
      await apiFetch("/admin/skip-player", { method: "POST" });
      toast.success('Player skipped!');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleSellPlayer = async () => {
    setLoading(true);
    try {
      await apiFetch("/admin/sell-player", { method: "POST" });
      toast.success('Player sold!');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleUnsellPlayer = async () => {
    setLoading(true);
    try {
      await apiFetch("/admin/unsell-player", { method: "POST" });
      toast.success('Player unsold!');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  if (!auction) return <DashboardLayout><div className="flex items-center justify-center h-96"><p className="text-slate-500">No active auction</p></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader 
        title="Live Auction Control" 
        subtitle={`Auction: ${auction.auction_name}`}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Current Player */}
        <div className="lg:col-span-2">
          <SectionCard title="Current Player" padded={false}>
            {currentPlayer ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 flex flex-col gap-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <img src={currentPlayer.player_photo} alt={currentPlayer.player_name} className="w-24 h-24 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">{currentPlayer.player_name}</h3>
                    <p className="text-sm text-slate-500">{currentPlayer.playing_role} • {currentPlayer.nationality}</p>
                    <p className="text-xs text-slate-400 mt-2">Base Price: {formatCurrency(currentPlayer.base_price)}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="primary" onClick={() => setShowOverlay(true)} className="flex-1" size="lg">
                    <MonitorPlay size={16} /> View Stats
                  </Button>
                  <Button variant="danger" onClick={handleUnsellPlayer} loading={loading} size="lg" className="flex-1">
                    <ArrowClockwise size={16} /> Unsold
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="p-12 text-center text-slate-500">No player selected</div>
            )}
          </SectionCard>
        </div>

        {/* Timer */}
        <SectionCard title="Auction Timer" className="flex flex-col items-center justify-center relative">
          <TimerRing timeLeft={timeLeft} isActive={isActive} />
          <div className="mt-6 flex gap-2 w-full">
            <Button variant="outline" onClick={handleSkipPlayer} loading={loading} className="flex-1">
              <SkipForward size={16} /> Skip
            </Button>
            <Button variant="primary" onClick={handleSellPlayer} loading={loading} className="flex-1">
              <CheckCircle size={16} /> Sell
            </Button>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Bids */}
        <SectionCard title="Live Bids" sub="Real-time bidding activity" fullHeight>
          {liveBids.length > 0 ? (
            <div className="space-y-2">
              {liveBids.map((bid, i) => (
                <motion.div 
                  key={i} 
                  initial={{ x: 20, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center justify-between p-3 bg-teal-50 border border-teal-100 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{bid.team_name}</p>
                    <p className="text-xs text-slate-500">{bid.time}</p>
                  </div>
                  <p className="text-lg font-bold text-teal-600">{formatCurrency(bid.amount)}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">No bids yet</div>
          )}
        </SectionCard>

        {/* Upcoming Players */}
        <SectionCard title="Auction Pool" sub={`${pool.length} players waiting`} fullHeight>
          {pool.length > 0 ? (
            <div className="space-y-2 overflow-y-auto max-h-96">
              {pool.map(player => (
                <motion.div 
                  key={player.player_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg hover:border-teal-200 transition"
                >
                  <img src={player.player_photo} alt={player.player_name} className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{player.player_name}</p>
                    <p className="text-xs text-slate-500">{player.playing_role}</p>
                  </div>
                  <p className="text-sm font-semibold text-teal-600">{formatCurrency(player.base_price)}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">Pool empty</div>
          )}
        </SectionCard>
      </div>

      {/* Auction Log */}
      <SectionCard title="Auction Log" sub="Recent transactions" className="mt-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Final Bid</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {log.map((entry, i) => (
                <TableRow key={i}>
                  <TableCell className="font-semibold">{entry.player_name}</TableCell>
                  <TableCell>{entry.winning_team}</TableCell>
                  <TableCell className="font-bold text-teal-600">{formatCurrency(entry.final_bid)}</TableCell>
                  <TableCell><Badge variant={entry.status === 'sold' ? 'success' : 'warning'}>{entry.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      {showOverlay && currentPlayer && (
        <PlayerStatsOverlay player={currentPlayer} onClose={() => setShowOverlay(false)} />
      )}
    </DashboardLayout>
  );
}
