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
      <PageHeader title="Auction Control Center" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard title="Teams" value={stats?.total_teams ?? "—"} icon={UsersThree} tone="accent" />
        <StatCard title="Players" value={stats?.total_players ?? "—"} icon={Warehouse} />
        <StatCard title="Sold" value={stats?.sold_players ?? "—"} icon={FlagBanner} tone="success" />
        <StatCard title="Unsold" value={stats?.unsold_players ?? "—"} icon={Broadcast} tone="warning" />
        <StatCard title="Total Bids" value={stats?.total_bids ?? "—"} icon={TrendUp} tone="accent" />
        <StatCard title="Total Spend" value={formatCurrency(stats?.total_spent)} icon={CurrencyCircleDollar} tone="success" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Live Auction Feed" padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th>S.No</th>
                  <th>Time</th>
                  <th>Player</th>
                  <th>Team</th>
                  <th>Action</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {log.length ? (
                  log.map((item, index) => (
                    <motion.tr
                      key={`${item.log_time}-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-slate-50 transition"
                    >
                      <td>{index + 1}</td>
                      <td className="text-sm text-slate-500 whitespace-nowrap">{formatTime(item.log_time)}</td>
                      <td className="text-sm font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          {item.country_code && (
                            <img
                              src={`https://flagcdn.com/w40/${item.country_code.toLowerCase()}.png`}
                              alt=""
                              className="country-flag"
                            />
                          )}
                          {item.player_name || "—"}
                        </div>
                      </td>
                      <td className="text-sm text-slate-600">{item.team_name || "—"}</td>
                      <td className="text-sm">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold tracking-widest uppercase ${
                            item.action === "SOLD"
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : item.action === "UNSOLD"
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {item.action}
                        </span>
                      </td>
                      <td className="text-sm font-semibold text-blue-600">
                        {item.amount ? formatCurrency(item.amount) : "—"}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-400 text-sm">
                      No activity logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Operational Guidelines">
          <div className="grid gap-4">
            {[
              { text: "Ensure the player pool is correctly ordered before initiating the auction.", icon: "01" },
              { text: "Monitor franchise budgets after each successful bid.", icon: "02" },
              { text: "Activate the Broadcast View to display player statistics during bidding.", icon: "03" },
            ].map((item) => (
              <div
                key={item.icon}
                className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <span className="shrink-0 rounded-lg bg-white border border-slate-200 px-2 py-1 text-xs font-bold text-slate-500 shadow-sm">
                  {item.icon}
                </span>
                <p className="text-sm leading-6 text-slate-600 font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}
