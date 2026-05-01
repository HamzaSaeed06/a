"use client";

import { useEffect, useMemo, useState } from "react";
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

  return (
    <DashboardLayout allowedRoles={["Franchise"]}>
      <PageHeader
        title={team?.team_name || "Franchise Desk"}
        subtitle={`Welcome ${user?.username || ""}. Track budget health, squad balance, and auction readiness from one place.`}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Squad Size" value={squad.length} icon={UsersThree} />
        <StatCard title="Total Spent" value={formatCurrency(totalSpent)} icon={CoinVertical} tone="accent" />
        <StatCard title="Remaining Budget" value={formatCurrency(team?.remaining_budget)} icon={Cricket} tone="success" />
        <StatCard title="Total Budget" value={formatCurrency(team?.total_budget)} icon={CoinVertical} />
      </div>

      <div className="mt-8">
        {Object.keys(squadByRole).length ? (
          <div className="space-y-6">
            {Object.entries(squadByRole).map(([role, players]) => (
              <SectionCard
                key={role}
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
                          <td className="font-semibold text-slate-950">{player.name}</td>
                          <td>{player.country_name || "-"}</td>
                          <td>{player.batting_style || "-"}</td>
                          <td>{player.bowling_style || "-"}</td>
                          <td className="font-semibold text-[var(--accent)]">
                            {formatCurrency(player.final_price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
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
