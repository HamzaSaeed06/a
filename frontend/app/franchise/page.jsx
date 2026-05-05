"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CoinVertical,
  Cricket,
  UsersThree,
  Person,
  Pulse,
  Broadcast,
} from "@phosphor-icons/react";
import DashboardLayout from "../components/DashboardLayout";
import {
  EmptyState,
  SectionCard,
  StatCard,
  ViewToggle,
  LineChart,
} from "../components/UI";
import { apiFetch } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatCurrency } from "../lib/format";

export default function FranchisePage() {
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [squad, setSquad] = useState([]);
  const [bidLog, setBidLog] = useState([]);
  const [viewMode, setViewMode] = useState("table");

  useEffect(() => {
    apiFetch("/franchise/my-team").then(setTeam).catch(() => {});
    apiFetch("/franchise/my-squad").then(setSquad).catch(() => {});
    apiFetch("/franchise/bid-log").then(setBidLog).catch(() => {});
  }, []);

  const totalSpent = useMemo(
    () => squad.reduce((sum, p) => sum + Number(p.final_price || 0), 0),
    [squad]
  );

  const squadByRole = useMemo(() => {
    return squad.reduce((grouped, player) => {
      const role = player.role || "Unassigned";
      grouped[role] = grouped[role] || [];
      grouped[role].push(player);
      return grouped;
    }, {});
  }, [squad]);

  const budgetUsedPct = team?.total_budget
    ? Math.round((totalSpent / Number(team.total_budget)) * 100)
    : 0;

  const overseasCount = useMemo(
    () => squad.filter((p) => p.country_name !== "Pakistan").length,
    [squad]
  );

  // Role breakdown for Market Density
  const roleStats = useMemo(() => {
    const roles = ["Batsman", "Bowler", "All-rounder", "Wicketkeeper"];
    const colors = ["bg-slate-900", "bg-blue-600", "bg-amber-500", "bg-slate-400"];
    return roles.map((r, i) => ({
      label: r,
      count: squadByRole[r]?.length || 0,
      val: ((squadByRole[r]?.length || 0) / (squad.length || 1)) * 100,
      color: colors[i],
    }));
  }, [squadByRole, squad.length]);

  // Budget chart data (per-player spend)
  const budgetChartData = useMemo(
    () => squad.map((p) => Math.round(Number(p.final_price || 0) / 1000000)),
    [squad]
  );

  // Squad Gap Analyzer — ideal squad: 6 Bat, 5 Bowl, 3 AR, 2 WK = 16 total
  const IDEAL = { Batsman: 6, Bowler: 5, "All-rounder": 3, Wicketkeeper: 2 };
  const gapAnalysis = useMemo(() =>
    Object.entries(IDEAL).map(([role, target]) => {
      const current = squadByRole[role]?.length || 0;
      const gap     = Math.max(0, target - current);
      return { role, current, target, gap, pct: Math.min(100, Math.round((current / target) * 100)) };
    }),
    [squadByRole]
  );
  const totalGap = gapAnalysis.reduce((s, g) => s + g.gap, 0);

  const formatCr = (val) => {
    if (!val) return "—";
    if (val >= 10000000) return (val / 10000000).toFixed(1) + " Cr";
    if (val >= 100000) return (val / 100000).toFixed(1) + " L";
    return val.toLocaleString();
  };

  return (
    <DashboardLayout allowedRoles={["Franchise"]}>
      {/* ── Header (exact Super Admin pattern) ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h1 text-slate-900">
            {team?.team_name || "Franchise Dashboard"}
          </h1>
          <p className="text-sub text-slate-900">
            Squad overview, budget utilization, and bid activity.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-ui-semibold text-emerald-700 text-xs">
              System Live
            </span>
          </div>
        </div>
      </div>

      {/* ── Stat Cards (exact Super Admin grid) ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Squad Size"       value={squad.length}                      icon={UsersThree}  />
        <StatCard title="Overseas Players" value={`${overseasCount} / 8`}            icon={Pulse}       />
        <StatCard title="Remaining Purse"  value={formatCr(team?.remaining_budget)}  icon={Cricket}     />
        <StatCard title="Total Spent"      value={formatCr(totalSpent)}              icon={CoinVertical}/>
      </div>

      {/* ── Analytics Grid (exact Super Admin 2-col layout) ── */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">

        {/* Financial Velocity */}
        <SectionCard title="Financial Velocity" sub="Purse utilization across acquired players.">
          <div className="h-[220px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-h2 text-slate-950">{formatCr(totalSpent)}</h4>
                <p className="text-sub text-slate-900 tracking-tight">Utilized liquidity</p>
              </div>
              <div className="text-right">
                <p className="text-h3 text-blue-600">{budgetUsedPct}%</p>
                <p className="text-sub text-slate-900 tracking-tight">Purse cap</p>
              </div>
            </div>
            <div className="mt-auto">
              <LineChart
                data={budgetChartData}
                color="#2563eb"
                height={130}
                prefix="Rs."
                suffix="M"
              />
            </div>
          </div>
        </SectionCard>

        {/* Market Density */}
        <SectionCard title="Market Density" sub="Player distribution across tactical roles.">
          <div className="h-[220px] overflow-y-auto pr-2 custom-scrollbar space-y-6">
            {roleStats.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-ui-semibold text-slate-800">{item.label}</span>
                  <span className="text-ui text-slate-500 font-bold">{item.count} Players</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.val}%` }}
                    className={`h-full ${item.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Overseas vs Local breakdown */}
        <SectionCard title="Roster Composition" sub="Local vs overseas player ratio.">
          <div className="h-[260px] flex flex-col justify-center space-y-6">
            {[
              { label: "Pakistan", count: squad.length - overseasCount, color: "bg-slate-900" },
              { label: "Overseas", count: overseasCount, color: overseasCount > 8 ? "bg-red-500" : "bg-blue-600" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-ui-semibold text-slate-800">{item.label}</span>
                  <span className="text-ui text-slate-500 font-bold">
                    {item.count} Players
                    {item.label === "Overseas" && overseasCount > 8 && (
                      <span className="ml-2 text-red-500 text-[10px] font-bold">⚠ Over limit</span>
                    )}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / (squad.length || 1)) * 100}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full ${item.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Bid Activity Feed (exact Super Admin Live Audit Feed pattern) */}
        <SectionCard title="Bid Activity" sub="Recent bids placed by your franchise.">
          <div className="h-[260px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
            <AnimatePresence mode="popLayout">
              {bidLog.length ? bidLog.map((log, i) => (
                <motion.div
                  key={log.bid_id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
                >
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors overflow-hidden", !log.image_url ? "bg-slate-100 group-hover:bg-white" : "")}>
                    {log.image_url
                      ? <img src={log.image_url} className="w-full h-full object-contain" />
                      : <Pulse size={16} className="text-slate-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-ui-semibold text-slate-900 truncate">{log.player_name}</p>
                    <p className="text-ui-xs text-slate-500">Bid: {formatCurrency(log.bid_amount)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-ui-xs font-bold text-slate-400 tracking-tighter">
                      {new Date(log.bid_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              )) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <Broadcast size={28} className="text-slate-200 mb-3" />
                  <p className="text-ui-xs text-slate-400">No bids placed yet.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </SectionCard>
      </div>

      {/* ── Squad Gap Analyzer ── */}
      <div className="mt-6">
        <SectionCard
          title="Squad Gap Analyzer"
          sub={totalGap === 0 ? "✅ Squad composition is complete." : `⚠ ${totalGap} more player${totalGap > 1 ? "s" : ""} needed to complete ideal squad.`}
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {gapAnalysis.map((item) => (
              <div key={item.role}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-ui-semibold text-slate-800">{item.role}</span>
                  <span className={`text-sub font-bold ${item.gap > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                    {item.current} / {item.target}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 0.7 }}
                    className={`h-full rounded-full ${item.gap === 0 ? "bg-emerald-500" : item.pct >= 50 ? "bg-amber-500" : "bg-red-400"}`}
                  />
                </div>
                {item.gap > 0 && (
                  <p className="text-ui-xs text-slate-400 mt-1.5">Need {item.gap} more</p>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── Squad Roster ── */}
      <div className="mt-8">
        {Object.keys(squadByRole).length ? (
          <div className="space-y-6">
            <div className="flex justify-end">
              <ViewToggle mode={viewMode} onChange={setViewMode} />
            </div>
            {Object.entries(squadByRole).map(([role, players], groupIndex) => (
              <motion.div
                key={role}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.07 }}
              >
                <SectionCard title={role} padded={false}>
                  {viewMode === "table" ? (
                    <div className="overflow-x-auto table-wrap">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th>S.No</th>
                            <th>Player</th>
                            <th>Country</th>
                            <th>Batting</th>
                            <th>Bowling</th>
                            <th>Acquired For</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {players.map((player, index) => (
                            <tr key={player.player_id} className="hover:bg-slate-50 transition">
                              <td>{index + 1}</td>
                              <td>
                                <div className="flex items-center gap-3">
                                  <div className={cn("h-8 w-8 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-medium shrink-0", !player.image_url && "bg-slate-900 text-white")}>
                                    {player.image_url
                                      ? <img src={player.image_url} className="w-full h-full object-contain" />
                                      : player.name?.substring(0, 2).toUpperCase()}
                                  </div>
                                  <span className="font-semibold text-slate-900">{player.name}</span>
                                </div>
                              </td>
                              <td className="text-slate-600">
                                <div className="flex items-center gap-2">
                                  {player.country_code && (
                                    <img src={`https://flagcdn.com/w40/${player.country_code.toLowerCase()}.png`} alt="" className="country-flag" />
                                  )}
                                  {player.country_name || "—"}
                                </div>
                              </td>
                              <td className="text-slate-600">{player.batting_style || "—"}</td>
                              <td className="text-slate-600">{player.bowling_style || "—"}</td>
                              <td className="font-bold text-emerald-600">{formatCurrency(player.final_price)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8 bg-slate-50/50">
                      {players.map((player) => (
                        <div key={player.player_id} className="surface flex flex-col border border-slate-200 hover:border-slate-900 transition-all duration-300 overflow-hidden relative group bg-white shadow-sm hover:shadow-md rounded-xl">
                          <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center gap-4 mb-5">
                              <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full overflow-hidden border border-slate-100", !player.image_url && "bg-slate-900")}>
                                {player.image_url
                                  ? <img src={player.image_url} className="w-full h-full object-contain" />
                                  : <Person size={22} className="text-white" />}
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-base font-bold text-slate-950 truncate leading-tight">{player.name}</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  {player.country_code && (
                                    <img src={`https://flagcdn.com/w20/${player.country_code.toLowerCase()}.png`} alt="" className="w-3.5 h-2.5 object-contain rounded-[1px]" />
                                  )}
                                  <span className="text-[11px] font-bold text-slate-400">{player.country_name || "-"}</span>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2.5 mb-5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-400 font-bold tracking-tight">BATTING</span>
                                <span className="font-bold text-slate-700">{player.batting_style || "N/A"}</span>
                              </div>
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-400 font-bold tracking-tight">BOWLING</span>
                                <span className="font-bold text-slate-700">{player.bowling_style || "N/A"}</span>
                              </div>
                            </div>
                            <div className="mt-auto pt-4 border-t border-slate-50">
                              <div className="flex flex-col items-center justify-center py-2 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-[10px] text-slate-400 font-bold tracking-tighter uppercase mb-0.5">ACQUIRED FOR</span>
                                <span className="text-base font-black text-slate-950">{formatCurrency(player.final_price)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <SectionCard padded={false}>
            <EmptyState icon={UsersThree} title="No players acquired yet" sub="No players acquired yet." />
          </SectionCard>
        )}
      </div>
    </DashboardLayout>
  );
}
