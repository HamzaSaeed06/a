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

function NavLink({ href, label, icon: Icon, active, collapsed }) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ x: collapsed ? 0 : 2 }}
        className={cn(
          "relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150",
          collapsed ? "justify-center" : "",
          active
            ? "bg-amber-400/10 text-amber-400"
            : "text-white/40 hover:bg-white/[0.05] hover:text-white/75",
        )}
      >
        {active && (
          <motion.div
            layoutId="sidebar-active-indicator"
            className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-amber-400"
          />
        )}
        <Icon size={18} weight={active ? "fill" : "duotone"} className="shrink-0" />
        <AnimatePresence>
          {!collapsed ? (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.15 }}
              className="text-[0.825rem] font-medium"
            >
              {label}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
}

function NavGroup({ title, links, pathname, collapsed }) {
  return (
    <div className="space-y-0.5">
      <AnimatePresence>
        {!collapsed ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-2 px-3 text-[0.6rem] font-bold uppercase tracking-[0.22em] text-white/20"
          >
            {title}
          </motion.p>
        ) : null}
      </AnimatePresence>
      {links.map(({ href, label, icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
        return (
          <NavLink
            key={href}
            href={href}
            label={label}
            icon={icon}
            active={active}
            collapsed={collapsed}
          />
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

  const roleColor =
    user?.role === "Super Admin"
      ? "text-purple-400 bg-purple-400/10 border-purple-400/20"
      : user?.role === "Admin"
        ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
        : "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 260 }}
      transition={{ type: "spring", stiffness: 240, damping: 28 }}
      className="sticky top-4 m-4 hidden h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0a0a12] shadow-[0_4px_40px_rgba(0,0,0,0.6)] lg:flex"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(245,158,11,0.04),transparent_60%)] pointer-events-none" />

      <div className="relative p-4 pb-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <ShieldCheck size={18} weight="fill" />
          </div>
          <AnimatePresence>
            {!collapsed ? (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="min-w-0"
              >
                <p className="text-[0.9rem] font-bold tracking-[-0.03em] text-white truncate">
                  Auction OS
                </p>
                <p className="text-[0.62rem] uppercase tracking-[0.2em] text-white/30">
                  Command Layer
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <div className="mx-4 h-px bg-white/[0.06]" />

      <AnimatePresence>
        {!collapsed ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3"
          >
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
              <p className="truncate text-[0.8rem] font-semibold text-white/80">{user?.username}</p>
              <span
                className={cn(
                  "mt-1.5 inline-block rounded-md border px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.14em]",
                  roleColor,
                )}
              >
                {user?.role}
              </span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
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

      <div className="mx-4 h-px bg-white/[0.06]" />

      <div className="p-3 space-y-1">
        <button
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.825rem] font-medium text-white/35 transition hover:bg-white/[0.05] hover:text-white/60"
          onClick={() => setCollapsed((v) => !v)}
        >
          <motion.svg
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0"
          >
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
          <AnimatePresence>
            {!collapsed ? (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Collapse
              </motion.span>
            ) : null}
          </AnimatePresence>
        </button>

        <button
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.825rem] font-medium text-white/35 transition hover:bg-red-500/[0.07] hover:text-red-400"
          onClick={logout}
        >
          <SignOut size={16} className="shrink-0" />
          <AnimatePresence>
            {!collapsed ? (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Sign out
              </motion.span>
            ) : null}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
