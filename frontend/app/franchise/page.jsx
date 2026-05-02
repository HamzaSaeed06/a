"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CoinVertical, Cricket, UsersThree, Person } from "@phosphor-icons/react";
import DashboardLayout from "../components/DashboardLayout";
import { EmptyState, PageHeader, SectionCard, StatCard, ViewToggle } from "../components/UI";
import { apiFetch } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatCurrency } from "../lib/format";

export default function FranchisePage() {
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [squad, setSquad] = useState([]);
  const [viewMode, setViewMode] = useState("table");

  useEffect(() => {
    apiFetch("/franchise/my-team").then(setTeam).catch(() => {});
    apiFetch("/franchise/my-squad").then(setSquad).catch(() => {});
  }, []);

  const totalSpent = useMemo(
    () => squad.reduce((sum, player) => sum + Number(player.final_price || 0), 0),
    [squad],
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

  return (
    <DashboardLayout allowedRoles={["Franchise"]}>
      <PageHeader title={team?.team_name || "Franchise Dashboard"} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Squad Size" value={squad.length} icon={UsersThree} tone="warning" />
        <StatCard title="Total Spent" value={formatCurrency(totalSpent)} icon={CoinVertical} tone="accent" />
        <StatCard title="Remaining Budget" value={formatCurrency(team?.remaining_budget)} icon={Cricket} tone="success" />
        <StatCard title="Total Budget" value={formatCurrency(team?.total_budget)} icon={CoinVertical} tone="default" />
      </div>

      {team?.total_budget ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[0.65rem] font-bold text-slate-400">
              Auction History
            </p>
            <p className="text-sm font-bold text-blue-600">{budgetUsedPct}% used</p>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${budgetUsedPct}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className={`h-full rounded-full ${budgetUsedPct > 80 ? "bg-red-500" : budgetUsedPct > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
            />
          </div>
        </motion.div>
      ) : null}

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
                              <td className="font-semibold text-slate-900">{player.name}</td>
                              <td className="text-slate-600">
                                <div className="flex items-center gap-2">
                                  {player.country_code && (
                                    <img
                                      src={`https://flagcdn.com/w40/${player.country_code.toLowerCase()}.png`}
                                      alt=""
                                      className="country-flag"
                                    />
                                  )}
                                  {player.country_name || "—"}
                                </div>
                              </td>
                              <td className="text-slate-600">{player.batting_style || "—"}</td>
                              <td className="text-slate-600">{player.bowling_style || "—"}</td>
                              <td className="font-bold text-emerald-600">
                                {formatCurrency(player.final_price)}
                              </td>
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
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-50 border border-slate-100">
                                <Person size={24} className="text-slate-400" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-base font-bold text-slate-950 truncate leading-tight">{player.name}</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  {player.country_code && (
                                    <img
                                      src={`https://flagcdn.com/w20/${player.country_code.toLowerCase()}.png`}
                                      alt=""
                                      className="w-3.5 h-2.5 object-contain rounded-[1px]"
                                    />
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
            <EmptyState
              icon={UsersThree}
              title="No players acquired yet"
              sub="No players acquired yet."
            />
          </SectionCard>
        )}
      </div>
    </DashboardLayout>
  );
}
