import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CoinVertical, Cricket, UsersThree, Person, Pulse, Broadcast, TrendUp, ArrowUpRight } from "@phosphor-icons/react";
import DashboardLayout from "../../components/DashboardLayout";
import { EmptyState, SectionCard, StatCard, ViewToggle, LineChart, Skeleton } from "../../components/UI";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { formatCurrency, cn } from "../../lib/format";

export default function FranchisePage() {
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [squad, setSquad] = useState([]);
  const [bidLog, setBidLog] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/franchise/my-team").catch(() => null),
      apiFetch("/franchise/my-squad").catch(() => []),
      apiFetch("/franchise/bid-log").catch(() => []),
    ]).then(([teamData, squadData, bidData]) => {
      setTeam(teamData);
      setSquad(squadData || []);
      setBidLog(bidData || []);
      setLoading(false);
    });
  }, []);

  const totalSpent = useMemo(() => squad.reduce((sum, p) => sum + Number(p.final_price || 0), 0), [squad]);
  const squadByRole = useMemo(() => squad.reduce((grouped, player) => { 
    const role = player.role || "Unassigned"; 
    grouped[role] = grouped[role] || []; 
    grouped[role].push(player); 
    return grouped; 
  }, {}), [squad]);
  const budgetUsedPct = team?.total_budget ? Math.round((totalSpent / Number(team.total_budget)) * 100) : 0;
  const overseasCount = useMemo(() => squad.filter((p) => p.country_name !== "Pakistan").length, [squad]);
  
  const roleStats = useMemo(() => {
    const roles = ["Batsman", "Bowler", "All-rounder", "Wicketkeeper"];
    const colors = ["bg-slate-800", "bg-teal-600", "bg-amber-500", "bg-sky-500"];
    return roles.map((r, i) => ({ 
      label: r, 
      count: squadByRole[r]?.length || 0, 
      val: ((squadByRole[r]?.length || 0) / (squad.length || 1)) * 100, 
      color: colors[i] 
    }));
  }, [squadByRole, squad.length]);
  
  const budgetChartData = useMemo(() => squad.map((p) => Math.round(Number(p.final_price || 0) / 1000000)), [squad]);
  
  const IDEAL = { Batsman: 6, Bowler: 5, "All-rounder": 3, Wicketkeeper: 2 };
  const gapAnalysis = useMemo(() => Object.entries(IDEAL).map(([role, target]) => { 
    const current = squadByRole[role]?.length || 0; 
    const gap = Math.max(0, target - current); 
    return { role, current, target, gap, pct: Math.min(100, Math.round((current / target) * 100)) }; 
  }), [squadByRole]);
  const totalGap = gapAnalysis.reduce((s, g) => s + g.gap, 0);
  
  const formatCr = (val) => { 
    if (!val) return "-"; 
    if (val >= 10000000) return (val / 10000000).toFixed(1) + " Cr"; 
    if (val >= 100000) return (val / 100000).toFixed(1) + " L"; 
    return val.toLocaleString(); 
  };

  return (
    <DashboardLayout allowedRoles={["Franchise"]}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{team?.team_name || "Franchise Dashboard"}</h1>
              <p className="text-sm text-slate-500 mt-1">Squad overview, budget utilization, and bid activity</p>
            </>
          )}
        </div>
        <div className="live-indicator">
          <span>System Live</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            </div>
          ))
        ) : (
          <>
            <StatCard title="Squad Size" value={squad.length} icon={UsersThree} tone="default" />
            <StatCard title="Overseas Players" value={`${overseasCount} / 8`} icon={Pulse} tone={overseasCount > 8 ? "danger" : "accent"} />
            <StatCard title="Remaining Purse" value={formatCr(team?.remaining_budget)} icon={Cricket} tone="success" />
            <StatCard title="Total Spent" value={formatCr(totalSpent)} icon={CoinVertical} tone="warning" />
          </>
        )}
      </div>

      {/* Analytics Grid */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Financial Velocity */}
        <SectionCard title="Financial Velocity" sub="Purse utilization across acquired players">
          {loading ? (
            <div className="h-[220px] flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="h-6 w-12 ml-auto" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <Skeleton className="h-[130px] w-full rounded-lg" />
            </div>
          ) : (
            <div className="h-[220px] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-2xl font-bold text-slate-900">{formatCr(totalSpent)}</h4>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Utilized liquidity</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-teal-600">{budgetUsedPct}%</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Purse cap</p>
                </div>
              </div>
              <div className="mt-auto">
                <LineChart data={budgetChartData} color="#0d9488" height={130} prefix="Rs." suffix="M" />
              </div>
            </div>
          )}
        </SectionCard>

        {/* Market Density */}
        <SectionCard title="Market Density" sub="Player distribution across tactical roles">
          {loading ? (
            <div className="h-[220px] space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[220px] overflow-y-auto pr-2 custom-scrollbar space-y-5">
              {roleStats.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                    <span className="text-xs font-bold text-slate-500">{item.count} Players</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${item.val}%` }} 
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className={`h-full ${item.color} rounded-full`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Roster Composition */}
        <SectionCard title="Roster Composition" sub="Local vs overseas player ratio">
          <div className="h-[260px] flex flex-col justify-center space-y-6">
            {[
              { label: "Pakistan", count: squad.length - overseasCount, color: "bg-slate-800" }, 
              { label: "Overseas", count: overseasCount, color: overseasCount > 8 ? "bg-red-500" : "bg-teal-600" }
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                  <span className="text-xs font-bold text-slate-500">
                    {item.count} Players
                    {item.label === "Overseas" && overseasCount > 8 && (
                      <span className="ml-2 text-red-500 text-[10px] font-bold">Over limit</span>
                    )}
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
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

        {/* Bid Activity */}
        <SectionCard title="Bid Activity" sub="Recent bids placed by your franchise">
          <div className="h-[260px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
            <AnimatePresence mode="popLayout">
              {bidLog.length ? bidLog.map((log, i) => (
                <motion.div 
                  key={log.bid_id || i} 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
                >
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors overflow-hidden", 
                    !log.image_url ? "bg-slate-100 group-hover:bg-white" : ""
                  )}>
                    {log.image_url ? (
                      <img src={log.image_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <Pulse size={18} className="text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">{log.player_name}</p>
                    <p className="text-xs text-slate-500">Bid: {formatCurrency(log.bid_amount)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-bold text-slate-400">
                      {new Date(log.bid_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              )) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <Broadcast size={28} className="text-slate-300 mb-3" />
                  <p className="text-sm text-slate-400">No bids placed yet.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </SectionCard>
      </div>

      {/* Gap Analyzer */}
      <div className="mb-8">
        <SectionCard 
          title="Squad Gap Analyzer" 
          sub={totalGap === 0 ? "Squad composition is complete" : `${totalGap} more player${totalGap > 1 ? "s" : ""} needed to complete ideal squad`}
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {gapAnalysis.map((item) => (
              <div key={item.role}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">{item.role}</span>
                  <span className={`text-xs font-bold ${item.gap > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                    {item.current} / {item.target}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${item.pct}%` }} 
                    transition={{ duration: 0.7 }} 
                    className={`h-full rounded-full ${item.gap === 0 ? "bg-emerald-500" : item.pct >= 50 ? "bg-amber-500" : "bg-red-400"}`} 
                  />
                </div>
                {item.gap > 0 && <p className="text-xs text-slate-400 mt-1.5">Need {item.gap} more</p>}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Squad List */}
      <div>
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
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Player</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Country</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Batting</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bowling</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acquired For</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {players.map((player, index) => (
                            <tr key={player.player_id} className="hover:bg-slate-50 transition">
                              <td className="px-4 py-3 text-sm text-slate-500">{index + 1}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "h-9 w-9 rounded-full overflow-hidden flex items-center justify-center text-xs font-semibold shrink-0", 
                                    !player.image_url && "bg-slate-900 text-white"
                                  )}>
                                    {player.image_url ? (
                                      <img src={player.image_url} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                      player.name?.substring(0, 2).toUpperCase()
                                    )}
                                  </div>
                                  <span className="font-semibold text-slate-900">{player.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                  {player.country_code && (
                                    <img 
                                      src={`https://flagcdn.com/w40/${player.country_code.toLowerCase()}.png`} 
                                      alt="" 
                                      className="country-flag" 
                                    />
                                  )}
                                  {player.country_name || "-"}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600">{player.batting_style || "-"}</td>
                              <td className="px-4 py-3 text-sm text-slate-600">{player.bowling_style || "-"}</td>
                              <td className="px-4 py-3 font-bold text-teal-600">{formatCurrency(player.final_price)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 bg-slate-50/50">
                      {players.map((player) => (
                        <motion.div 
                          key={player.player_id} 
                          whileHover={{ y: -4 }}
                          className="surface flex flex-col border border-slate-200 hover:border-slate-300 transition-all overflow-hidden bg-white shadow-sm hover:shadow-md rounded-xl"
                        >
                          <div className="p-5 flex-1 flex flex-col">
                            <div className="flex items-center gap-4 mb-4">
                              <div className={cn(
                                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full overflow-hidden border border-slate-100", 
                                !player.image_url && "bg-slate-900"
                              )}>
                                {player.image_url ? (
                                  <img src={player.image_url} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  <Person size={22} className="text-white" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-base font-bold text-slate-900 truncate leading-tight">{player.name}</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  {player.country_code && (
                                    <img 
                                      src={`https://flagcdn.com/w20/${player.country_code.toLowerCase()}.png`} 
                                      alt="" 
                                      className="w-4 h-3 object-cover rounded-[2px]" 
                                    />
                                  )}
                                  <span className="text-xs font-medium text-slate-500">{player.country_name || "-"}</span>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-medium">Batting</span>
                                <span className="font-semibold text-slate-700">{player.batting_style || "N/A"}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-medium">Bowling</span>
                                <span className="font-semibold text-slate-700">{player.bowling_style || "N/A"}</span>
                              </div>
                            </div>
                            <div className="mt-auto pt-4 border-t border-slate-100">
                              <div className="flex flex-col items-center justify-center py-2 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-[10px] text-slate-400 font-semibold uppercase mb-0.5">Acquired For</span>
                                <span className="text-base font-bold text-slate-900">{formatCurrency(player.final_price)}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </SectionCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <SectionCard padded={false}>
            <EmptyState icon={UsersThree} title="No players acquired yet" sub="Start bidding to build your squad." />
          </SectionCard>
        )}
      </div>
    </DashboardLayout>
  );
}
