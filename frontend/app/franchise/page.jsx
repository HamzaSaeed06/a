"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CoinVertical, Cricket, UsersThree } from "@phosphor-icons/react";
import DashboardLayout from "../components/DashboardLayout";
import { EmptyState, PageHeader, SectionCard, StatCard } from "../components/UI";
import { apiFetch } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatCurrency } from "../lib/format";

export default function FranchisePage() {
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [squad, setSquad] = useState([]);

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
      <PageHeader
        title={team?.team_name || "Franchise Desk"}
        subtitle={`Welcome back, ${user?.username || ""}. Track budget health, squad balance, and auction readiness.`}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Squad Size" value={squad.length} icon={UsersThree} />
        <StatCard title="Total Spent" value={formatCurrency(totalSpent)} icon={CoinVertical} tone="accent" />
        <StatCard title="Remaining Budget" value={formatCurrency(team?.remaining_budget)} icon={Cricket} tone="success" />
        <StatCard title="Total Budget" value={formatCurrency(team?.total_budget)} icon={CoinVertical} />
      </div>

      {team?.total_budget ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5"
        >
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/30">
              Budget Utilisation
            </p>
            <p className="text-sm font-semibold text-amber-400">{budgetUsedPct}% used</p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.07]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${budgetUsedPct}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className={`h-full rounded-full ${budgetUsedPct > 80 ? "bg-red-400" : budgetUsedPct > 60 ? "bg-amber-400" : "bg-emerald-400"}`}
            />
          </div>
        </motion.div>
      ) : null}

      <div className="mt-6">
        {Object.keys(squadByRole).length ? (
          <div className="space-y-5">
            {Object.entries(squadByRole).map(([role, players], groupIndex) => (
              <motion.div
                key={role}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.07 }}
              >
                <SectionCard
                  title={role}
                  sub={`${players.length} player${players.length > 1 ? "s" : ""} in this role group.`}
                  padded={false}
                >
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th>Country</th>
                          <th>Batting</th>
                          <th>Bowling</th>
                          <th>Acquired For</th>
                        </tr>
                      </thead>
                      <tbody>
                        {players.map((player) => (
                          <tr key={player.player_id}>
                            <td className="font-semibold text-white/90">{player.name}</td>
                            <td className="text-white/50">{player.country_name || "—"}</td>
                            <td className="text-white/50">{player.batting_style || "—"}</td>
                            <td className="text-white/50">{player.bowling_style || "—"}</td>
                            <td className="font-semibold text-amber-400">
                              {formatCurrency(player.final_price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <SectionCard padded={false}>
            <EmptyState
              icon={UsersThree}
              title="No players acquired yet"
              sub="Win bids during the live auction to build your squad."
            />
          </SectionCard>
        )}
      </div>
    </DashboardLayout>
  );
}
