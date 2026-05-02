"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Broadcast,
  GlobeHemisphereWest,
  ShieldCheck,
  Stack,
  UserList,
  UsersThree,
} from "@phosphor-icons/react";
import DashboardLayout from "../components/DashboardLayout";
import { PageHeader, SectionCard, StatCard } from "../components/UI";
import { apiFetch } from "../lib/api";

export default function SuperAdminPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      apiFetch("/super-admin/overview-stats").catch(() => null),
      apiFetch("/admin/dashboard-stats").catch(() => null),
    ]).then(([platformStats, adminStats]) => {
      setStats({ ...platformStats, ...adminStats });
    });
  }, []);

  const quickLinks = [
    {
      href: "/super-admin/users",
      title: "User Management",
      sub: "Manage administrator and franchise accounts.",
      icon: UserList,
    },
    {
      href: "/super-admin/seasons",
      title: "Season Management",
      sub: "Create and manage auction events and schedules.",
      icon: Broadcast,
    },
    {
      href: "/super-admin/categories",
      title: "Player Categories",
      sub: "Define player roles and base price bands.",
      icon: Stack,
    },
    {
      href: "/super-admin/countries",
      title: "Country Registry",
      sub: "Manage player nationalities and regions.",
      icon: GlobeHemisphereWest,
    },
  ];

  return (
    <DashboardLayout allowedRoles={["Super Admin"]}>
      <PageHeader title="Platform Governance" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Users" value={stats?.total_users ?? "—"} icon={UserList} tone="accent" />
        <StatCard title="Active Users" value={stats?.active_users ?? "—"} icon={ShieldCheck} tone="success" />
        <StatCard title="Teams" value={stats?.total_teams ?? "—"} icon={UsersThree} tone="warning" />
        <StatCard title="Live Auctions" value={stats?.live_auctions ?? "—"} icon={Broadcast} tone="accent" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Players" value={stats?.total_players ?? "—"} icon={Stack} tone="default" />
        <StatCard title="Countries" value={stats?.total_countries ?? "—"} icon={GlobeHemisphereWest} tone="accent" />
        <StatCard title="Categories" value={stats?.total_categories ?? "—"} icon={Stack} tone="success" />
        <StatCard title="Seasons" value={stats?.total_seasons ?? "—"} icon={Broadcast} tone="warning" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="Quick Actions">
          <div className="grid gap-4 sm:grid-cols-2">
            {quickLinks.map(({ href, title, sub, icon: Icon }, index) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <Link
                  href={href}
                  className="group block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-md"
                >
                  <div className="mb-4 inline-flex rounded-xl border border-blue-100 bg-blue-50 p-2.5 text-blue-600 transition group-hover:bg-blue-100 group-hover:scale-105">
                    <Icon size={20} weight="regular" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{sub}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="System Roles & Permissions">
          <div className="grid gap-3">
            {[
              "Super Administrators have full access to all platform features.",
              "This includes managing users, settings, and auction configurations.",
              "Administrators can only manage teams, players, and run the live auction.",
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                <p className="text-sm leading-6 text-slate-600 font-medium">{item}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}
