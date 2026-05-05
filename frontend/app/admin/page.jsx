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
import { 
  PageHeader, 
  SectionCard, 
  StatCard,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../components/UI";
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S.No</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {log.length ? (
                log.map((item, index) => (
                  <TableRow
                    key={`${item.log_time}-${index}`}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="text-slate-500 whitespace-nowrap">{formatTime(item.log_time)}</TableCell>
                    <TableCell className="font-semibold text-slate-900">
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
                    </TableCell>
                    <TableCell className="text-slate-600">{item.team_name || "—"}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold tracking-widest capitalize ${
                          item.action === "SOLD"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : item.action === "UNSOLD"
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {item.action}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-blue-600">
                      {item.amount ? formatCurrency(item.amount) : "—"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400 text-sm py-8">
                    No activity logged yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
                className="flex items-start gap-4 rounded-xl bg-slate-50 p-4"
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
