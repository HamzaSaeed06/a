"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
      title: "Identity and Roles",
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
        subtitle="Super admin workspace for access control, taxonomy, season governance, and full operational oversight."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Users" value={stats?.total_users ?? "-"} icon={UserList} tone="accent" />
        <StatCard title="Active Users" value={stats?.active_users ?? "-"} icon={ShieldCheck} tone="success" />
        <StatCard title="Teams" value={stats?.total_teams ?? "-"} icon={UsersThree} />
        <StatCard title="Live Auctions" value={stats?.live_auctions ?? "-"} icon={Broadcast} tone="accent" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Players" value={stats?.total_players ?? "-"} icon={Stack} />
        <StatCard title="Countries" value={stats?.total_countries ?? "-"} icon={GlobeHemisphereWest} />
        <StatCard title="Categories" value={stats?.total_categories ?? "-"} icon={Stack} />
        <StatCard title="Seasons" value={stats?.total_seasons ?? "-"} icon={Broadcast} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard
          title="Governance Shortcuts"
          sub="High-impact areas for super admin decision making."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {quickLinks.map(({ href, title, sub, icon: Icon }) => (
              <Link key={href} href={href} className="group rounded-[26px] border border-[var(--line)] bg-white/80 p-5 transition hover:border-[rgba(15,118,110,0.22)] hover:bg-white">
                <div className="mb-4 inline-flex rounded-2xl bg-[rgba(15,118,110,0.1)] p-3 text-[var(--accent)]">
                  <Icon size={22} weight="duotone" />
                </div>
                <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{sub}</p>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Privilege Model"
          sub="Super admin now inherits the full admin control surface as well."
        >
          <div className="grid gap-4">
            {[
              "All admin operations remain available to super admin users.",
              "Super admin can additionally govern users, countries, categories, and seasons.",
              "This keeps operational control centralized without splitting platform ownership.",
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
