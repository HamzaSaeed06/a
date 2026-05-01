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
      title: "Identity & Roles",
      sub: "Create, suspend, and govern access across the platform.",
      icon: UserList,
    },
    {
      href: "/super-admin/seasons",
      title: "Auction Seasons",
      sub: "Control active windows, venues, and season lifecycle.",
      icon: Broadcast,
    },
    {
      href: "/super-admin/categories",
      title: "Player Taxonomy",
      sub: "Maintain categories and price bands for auction planning.",
      icon: Stack,
    },
    {
      href: "/super-admin/countries",
      title: "Geography Registry",
      sub: "Curate origin data for player and reporting consistency.",
      icon: GlobeHemisphereWest,
    },
  ];

  return (
    <DashboardLayout allowedRoles={["Super Admin"]}>
      <PageHeader
        title="Platform Governance"
        subtitle="Super admin workspace — access control, taxonomy, season governance, and full operational oversight."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Users" value={stats?.total_users ?? "—"} icon={UserList} tone="accent" />
        <StatCard title="Active Users" value={stats?.active_users ?? "—"} icon={ShieldCheck} tone="success" />
        <StatCard title="Teams" value={stats?.total_teams ?? "—"} icon={UsersThree} />
        <StatCard title="Live Auctions" value={stats?.live_auctions ?? "—"} icon={Broadcast} tone="accent" />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Players" value={stats?.total_players ?? "—"} icon={Stack} />
        <StatCard title="Countries" value={stats?.total_countries ?? "—"} icon={GlobeHemisphereWest} />
        <StatCard title="Categories" value={stats?.total_categories ?? "—"} icon={Stack} />
        <StatCard title="Seasons" value={stats?.total_seasons ?? "—"} icon={Broadcast} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="Governance Shortcuts" sub="High-impact areas for super admin decisions.">
          <div className="grid gap-3 sm:grid-cols-2">
            {quickLinks.map(({ href, title, sub, icon: Icon }, index) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <Link
                  href={href}
                  className="group block rounded-xl border border-white/[0.07] bg-white/[0.03] p-5 transition hover:border-amber-400/20 hover:bg-amber-400/[0.04]"
                >
                  <div className="mb-4 inline-flex rounded-xl border border-amber-400/20 bg-amber-400/10 p-2.5 text-amber-400 transition group-hover:bg-amber-400/15">
                    <Icon size={18} weight="duotone" />
                  </div>
                  <h3 className="text-[0.9rem] font-bold tracking-[-0.025em] text-white/85 group-hover:text-white transition">{title}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-white/38">{sub}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Privilege Model" sub="How super admin access is structured.">
          <div className="grid gap-3">
            {[
              "All admin operations remain available to super admin users.",
              "Super admin can additionally govern users, countries, categories, and seasons.",
              "This keeps operational control centralized without splitting platform ownership.",
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4"
              >
                <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/60" />
                <p className="text-sm leading-6 text-white/45">{item}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}
