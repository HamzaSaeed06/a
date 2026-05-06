import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Broadcast, ChartLineUp, Pulse, UserList, ArrowsCounterClockwise } from "@phosphor-icons/react";
import DashboardLayout from "../../components/DashboardLayout";
import { SectionCard, StatCard, LineChart, Button, ConfirmModal, useToast } from "../../components/UI";
import { apiFetch } from "../../lib/api";

export default function SuperAdminPage() {
  const [stats, setStats] = useState(null);
  const [budgetData, setBudgetData] = useState({ total: 0, spent: 0, chart: [] });
  const [categoryData, setCategoryData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [pStats, aStats, teams, players, logs, auctions] = await Promise.all([
        apiFetch("/super-admin/overview-stats"), apiFetch("/admin/dashboard-stats"), apiFetch("/admin/teams"),
        apiFetch("/admin/players"), apiFetch("/admin/auction-log"), apiFetch("/super-admin/auctions")
      ]);
      setStats({ ...pStats, ...aStats });
      setRecentLogs(logs.slice(0, 8));
      const totalBudget = teams.reduce((acc, t) => acc + Number(t.total_budget), 0);
      const remainingBudget = teams.reduce((acc, t) => acc + Number(t.remaining_budget), 0);
      const spent = totalBudget - remainingBudget;
      setBudgetData({ total: totalBudget, spent, chart: teams.map(t => Math.round((t.total_budget - t.remaining_budget) / 10000000)) });
      const allCategories = ["Platinum", "Diamond", "Gold", "Silver", "Emerging"];
      const catMap = {};
      allCategories.forEach(c => catMap[c] = 0);
      players.forEach(p => { if (catMap.hasOwnProperty(p.category_name)) catMap[p.category_name]++; });
      setCategoryData(allCategories.map(name => ({ label: name, count: catMap[name], val: (catMap[name] / (players.length || 1)) * 100, color: name === "Platinum" ? "bg-slate-900" : name === "Diamond" ? "bg-blue-600" : name === "Gold" ? "bg-amber-500" : name === "Silver" ? "bg-slate-400" : "bg-emerald-500" })));
      setActivityData(auctions.map(auction => ({ label: `S${auction.season}`, count: logs.filter(l => l.auction_id === auction.auction_id).length })).reverse());
    } catch (err) { console.error("Failed to fetch dashboard data:", err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleResetAuction = async () => {
    setIsResetting(true);
    try { await apiFetch("/admin/reset-auction", { method: "POST" }); toast("Auction database reset successfully", "success"); await fetchData(); }
    catch (err) { toast(err.message || "Failed to reset auction", "error"); }
    finally { setIsResetting(false); setShowResetConfirm(false); }
  };

  const formatCr = (val) => { if (!val) return "—"; if (val >= 10000000) return (val / 10000000).toFixed(1) + " Cr"; return val.toLocaleString(); };

  return (
    <DashboardLayout allowedRoles={["Super Admin"]}>
      <ConfirmModal open={showResetConfirm} onClose={() => setShowResetConfirm(false)} onConfirm={handleResetAuction} title="Reset Auction Session?" message="This will permanently delete all bids, logs, and sales. Team budgets will be restored to their original values. This action cannot be undone." danger />
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-h1 text-slate-900">Platform Governance</h1><p className="text-sub text-slate-900">Real-time oversight of auction ecosystem and financial velocity.</p></div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" loading={isResetting} onClick={() => setShowResetConfirm(true)} className="text-red-600 border-red-100 hover:bg-red-50"><ArrowsCounterClockwise size={16} />Reset Session</Button>
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-ui-semibold text-emerald-700 text-xs">System Live</span></div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Platform Users" value={stats?.total_users ?? "—"} icon={UserList} tone="accent" />
        <StatCard title="Active Session" value={stats?.active_users ?? "—"} icon={Pulse} tone="success" />
        <StatCard title="Global Purse" value={formatCr(budgetData.total)} icon={ChartLineUp} tone="warning" />
        <StatCard title="Live Events" value={stats?.live_auctions ?? "—"} icon={Broadcast} tone="accent" />
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <SectionCard title="Financial Velocity" sub="Cumulative franchise spending across teams.">
          <div className="h-[220px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div><h4 className="text-h2 text-slate-950">{formatCr(budgetData.spent)}</h4><p className="text-sub text-slate-900 tracking-tight">Utilized liquidity</p></div>
              <div className="text-right"><p className="text-h3 text-blue-600">{((budgetData.spent / budgetData.total) * 100 || 0).toFixed(1)}%</p><p className="text-sub text-slate-900 tracking-tight">Purse cap</p></div>
            </div>
            <div className="mt-auto"><LineChart data={budgetData.chart} color="#2563eb" height={130} prefix="Rs." suffix="Cr" /></div>
          </div>
        </SectionCard>
        <SectionCard title="System Activity" sub="Bidding and interaction volume per season.">
          <div className="h-[220px] flex flex-col justify-between">
            <div className="mt-auto">
              <LineChart data={activityData.map(d => d.count)} color="#0f172a" height={160} suffix=" Acts" />
              <div className="mt-4 flex justify-between px-2">{activityData.map((item, i) => <span key={i} className="text-ui-xs font-bold text-slate-400 tracking-tighter">{item.label}</span>)}</div>
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Market Density" sub="Player distribution across categories.">
          <div className="h-[260px] overflow-y-auto pr-2 custom-scrollbar space-y-6">
            {categoryData.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2"><span className="text-ui-semibold text-slate-800">{item.label}</span><span className="text-ui text-slate-500 font-bold">{item.count} Players</span></div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${item.val}%` }} className={`h-full ${item.color} rounded-full`} /></div>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Live Audit Feed" sub="Recent system-wide occurrences.">
          <div className="h-[260px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
            <AnimatePresence mode="popLayout">
              {recentLogs.map((log, i) => (
                <motion.div key={log.log_id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group">
                  <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors"><Pulse size={16} className="text-slate-400" /></div>
                  <div className="min-w-0 flex-1"><p className="text-ui-semibold text-slate-900 truncate">{log.player_name || "System"}</p><p className="text-ui-xs text-slate-500 line-clamp-1">{log.log_message}</p></div>
                  <div className="text-right shrink-0"><p className="text-ui-xs font-bold text-slate-400 tracking-tighter">{new Date(log.log_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p></div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}
