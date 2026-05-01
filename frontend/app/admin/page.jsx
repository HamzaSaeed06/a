"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
        subtitle="Operations dashboard — teams, players, pool readiness, and live sale floor."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard title="Teams" value={stats?.total_teams ?? "—"} icon={UsersThree} />
        <StatCard title="Players" value={stats?.total_players ?? "—"} icon={Warehouse} />
        <StatCard title="Sold" value={stats?.sold_players ?? "—"} icon={FlagBanner} tone="success" />
        <StatCard title="Unsold" value={stats?.unsold_players ?? "—"} icon={Broadcast} />
        <StatCard title="Total Bids" value={stats?.total_bids ?? "—"} icon={TrendUp} tone="accent" />
        <StatCard title="Total Spend" value={formatCurrency(stats?.total_spent)} icon={CurrencyCircleDollar} tone="accent" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Recent Auction Activity"
          sub="Latest bid events and sale actions across the floor."
          padded={false}
        >
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
                    <motion.tr
                      key={`${item.log_time}-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <td className="text-white/35 text-xs">{formatTime(item.log_time)}</td>
                      <td className="font-semibold text-white/90">{item.player_name || "—"}</td>
                      <td className="text-white/55">{item.team_name || "—"}</td>
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
                      <td className="font-semibold text-amber-400">
                        {item.amount ? formatCurrency(item.amount) : "—"}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-white/30">
                      No activity logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Execution Notes" sub="Operational priorities for the auction floor.">
          <div className="grid gap-3">
            {[
              { text: "Verify player pool order before starting live bidding.", icon: "01" },
              { text: "Keep franchise budgets aligned with every sale event.", icon: "02" },
              { text: "Use broadcast overlay to present player context during rounds.", icon: "03" },
            ].map((item) => (
              <div
                key={item.icon}
                className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4"
              >
                <span className="shrink-0 rounded-lg border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[0.6rem] font-bold text-white/30 tracking-widest">
                  {item.icon}
                </span>
                <p className="text-sm leading-6 text-white/48">{item.text}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}
