"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowsLeftRight,
  Broadcast,
  ChartLineUp,
  GlobeHemisphereWest,
  HouseLine,
  IdentificationBadge,
  ListChecks,
  ShieldCheck,
  SignOut,
  Sparkle,
  Stack,
  UserList,
  UsersThree,
} from "@phosphor-icons/react";
import { useAuth } from "../lib/auth";
import { cn } from "../lib/format";

const SUPER_ADMIN_LINKS = [
  { href: "/super-admin", label: "Overview", icon: HouseLine },
  { href: "/super-admin/users", label: "Users", icon: UserList },
  { href: "/super-admin/categories", label: "Categories", icon: Stack },
  { href: "/super-admin/countries", label: "Countries", icon: GlobeHemisphereWest },
  { href: "/super-admin/seasons", label: "Auctions", icon: Sparkle },
];

const ADMIN_LINKS = [
  { href: "/admin", label: "Control Room", icon: ChartLineUp },
  { href: "/admin/teams", label: "Teams", icon: UsersThree },
  { href: "/admin/players", label: "Players", icon: IdentificationBadge },
  { href: "/admin/pool", label: "Auction Pool", icon: ListChecks },
  { href: "/admin/live-auction", label: "Live Auction", icon: Broadcast },
];

const FRANCHISE_LINKS = [
  { href: "/franchise", label: "Franchise Desk", icon: HouseLine },
  { href: "/franchise/live-auction", label: "Live Bidding", icon: ArrowsLeftRight },
];

function NavGroup({ title, links, pathname, collapsed }) {
  return (
    <div className="space-y-2">
      {!collapsed ? (
        <p className="px-3 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-slate-400">
          {title}
        </p>
      ) : null}

      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

        return (
          <Link key={href} href={href}>
            <motion.div
              whileHover={{ x: 2 }}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all",
                collapsed ? "justify-center" : "justify-start",
                active
                  ? "border-[rgba(15,118,110,0.22)] bg-[rgba(15,118,110,0.1)] text-[var(--accent)]"
                  : "border-transparent text-slate-500 hover:border-[var(--line)] hover:bg-white/70 hover:text-slate-900",
              )}
            >
              <Icon size={20} weight={active ? "fill" : "duotone"} />
              <AnimatePresence>
                {!collapsed ? (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    className="text-sm font-medium"
                  >
                    {label}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const groups = useMemo(() => {
    if (user?.role === "Super Admin") {
      return [
        { title: "Governance", links: SUPER_ADMIN_LINKS },
        { title: "Operations", links: ADMIN_LINKS },
      ];
    }

    if (user?.role === "Admin") {
      return [{ title: "Operations", links: ADMIN_LINKS }];
    }

    return [{ title: "Franchise", links: FRANCHISE_LINKS }];
  }, [user?.role]);

  return (
    <motion.aside
      animate={{ width: collapsed ? 96 : 292 }}
      transition={{ type: "spring", stiffness: 220, damping: 25 }}
      className="glass-card sticky top-4 m-4 hidden h-[calc(100vh-2rem)] flex-col rounded-[32px] border border-white/70 p-4 lg:flex"
    >
      <div className="relative overflow-hidden rounded-[28px] border border-[rgba(15,118,110,0.14)] bg-[linear-gradient(135deg,rgba(15,118,110,0.18),rgba(15,23,42,0.08))] p-4 text-slate-950">
        <div className="ambient-ring -right-10 -top-10 h-24 w-24" />
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-950 p-2.5 text-white shadow-lg">
              <ShieldCheck size={22} weight="fill" />
            </div>
            {!collapsed ? (
              <div>
                <p className="font-[var(--font-display)] text-lg font-bold tracking-[-0.04em]">
                  Auction OS
                </p>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-600">
                  Formal command layer
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {!collapsed ? (
          <div className="rounded-2xl bg-white/75 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Signed in as
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-900">{user?.username}</p>
            <p className="mt-1 text-xs text-slate-600">{user?.role}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex-1 space-y-6 overflow-y-auto pr-1">
        {groups.map((group) => (
          <NavGroup
            key={group.title}
            title={group.title}
            links={group.links}
            pathname={pathname}
            collapsed={collapsed}
          />
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <button className="btn-outline w-full" onClick={() => setCollapsed((value) => !value)}>
          {collapsed ? "Expand" : "Compact"}
        </button>
        <button className="btn-ghost w-full justify-center text-slate-600" onClick={logout}>
          <SignOut size={18} />
          {!collapsed ? "Sign out" : null}
        </button>
      </div>
    </motion.aside>
  );
}
