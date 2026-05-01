"use client";

import { useEffect, useState } from "react";
import {
  Broadcast,
  CurrencyCircleDollar,
  FlagBanner,
  TrendUp,
  UsersThree,
  Warehouse,
} from "@phosphor-icons/react";
import DashboardLayout from "../components/DashboardLayout";
import { PageHeader, SectionCard, StatCard } from "../components/UI";
import { apiFetch } from "../lib/api";
import { formatCurrency, formatTime } from "../lib/format";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [log, setLog] = useState([]);

  useEffect(() => {
    Promise.all([
      apiFetch("/admin/dashboard-stats").catch(() => null),
      apiFetch("/admin/recent-log").catch(() => []),
    ]).then(([dashboardStats, recentLog]) => {
      setStats(dashboardStats);
      setLog(recentLog || []);
    });
  }, []);

  return (
    <DashboardLayout allowedRoles={["Admin", "Super Admin"]}>
      <PageHeader
        title="Auction Control Room"
        subtitle="Operations dashboard for managing teams, players, pool readiness, and the live sale floor."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard title="Teams" value={stats?.total_teams ?? "-"} icon={UsersThree} />
        <StatCard title="Players" value={stats?.total_players ?? "-"} icon={Warehouse} />
        <StatCard title="Sold Players" value={stats?.sold_players ?? "-"} icon={FlagBanner} tone="success" />
        <StatCard title="Unsold" value={stats?.unsold_players ?? "-"} icon={Broadcast} />
        <StatCard title="Total Bids" value={stats?.total_bids ?? "-"} icon={TrendUp} tone="accent" />
        <StatCard title="Spend" value={formatCurrency(stats?.total_spent)} icon={CurrencyCircleDollar} tone="accent" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Recent Auction Activity" sub="Latest operational events across bids and sale actions." padded={false}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Player</th>
                  <th>Team</th>
                  <th>Action</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {log.length ? (
                  log.map((item, index) => (
                    <tr key={`${item.log_time}-${index}`}>
                      <td className="text-[var(--muted)]">{formatTime(item.log_time)}</td>
                      <td className="font-semibold text-slate-900">{item.player_name || "-"}</td>
                      <td>{item.team_name || "-"}</td>
                      <td>
                        <span
                          className={`badge ${
                            item.action === "SOLD"
                              ? "badge-success"
                              : item.action === "UNSOLD"
                                ? "badge-danger"
                                : "badge-neutral"
                          }`}
                        >
                          {item.action}
                        </span>
                      </td>
                      <td className="font-semibold text-slate-900">
                        {item.amount ? formatCurrency(item.amount) : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[var(--muted)]">
                      No activity logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title="Execution Notes"
          sub="Operational priorities for the auction floor."
        >
          <div className="grid gap-4">
            {[
              "Verify player pool order before starting live bidding.",
              "Keep franchise budgets aligned with every sale event.",
              "Use broadcast overlay to present player context during bidding rounds.",
            ].map((item) => (
              <div key={item} className="rounded-[22px] border border-[var(--line)] bg-white/80 p-4 text-sm leading-7 text-[var(--muted)]">
                {item}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}
