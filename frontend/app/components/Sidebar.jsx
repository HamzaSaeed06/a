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
  { href: "/super-admin/users", label: "System Users", icon: UserList },
  { href: "/super-admin/categories", label: "Categories", icon: Stack },
  { href: "/super-admin/countries", label: "Countries", icon: GlobeHemisphereWest },
  { href: "/super-admin/seasons", label: "Seasons", icon: Sparkle },
];

const ADMIN_LINKS = [
  { href: "/admin", label: "Auction Center", icon: ChartLineUp },
  { href: "/admin/teams", label: "Franchises", icon: UsersThree },
  { href: "/admin/players", label: "Players", icon: IdentificationBadge },
  { href: "/admin/pool", label: "Auction Pool", icon: ListChecks },
  { href: "/admin/live-auction", label: "Live Bidding", icon: Broadcast },
];

const FRANCHISE_LINKS = [
  { href: "/franchise", label: "Franchise Dashboard", icon: HouseLine },
  { href: "/franchise/live-auction", label: "Live Bidding", icon: ArrowsLeftRight },
];

function NavLink({ href, label, icon: Icon, active }) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "relative flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-150",
          active
            ? "bg-slate-100 text-slate-900 font-semibold"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
        )}
      >
        <Icon size={18} weight={active ? "fill" : "regular"} className="shrink-0" />
        <span className="text-sm">{label}</span>
      </div>
    </Link>
  );
}

function NavGroup({ title, links, pathname }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="mb-2 px-3 text-[0.7rem] font-medium text-slate-400">
        {title}
      </p>
      {links.map(({ href, label, icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
        return (
          <NavLink
            key={href}
            href={href}
            label={label}
            icon={icon}
            active={active}
          />
        );
      })}
    </div>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

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
      ? "text-purple-700 bg-purple-50 border-purple-200"
      : user?.role === "Admin"
        ? "text-blue-700 bg-blue-50 border-blue-200"
        : "text-emerald-700 bg-emerald-50 border-emerald-200";

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 h-screen bg-white border-r border-slate-200 flex flex-col hidden lg:flex">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-900 text-white">
            <ShieldCheck size={20} weight="fill" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold tracking-tight text-slate-900 truncate">
              Auction OS
            </p>
            <p className="text-[0.65rem] text-slate-500">
              Command Layer
            </p>
          </div>
        </div>
      </div>


      <div data-lenis-prevent className="flex-1 overflow-y-auto px-4 py-4 space-y-8 scrollbar-hide">
        {groups.map((group) => (
          <NavGroup
            key={group.title}
            title={group.title}
            links={group.links}
            pathname={pathname}
          />
        ))}
      </div>

      {/* Bottom User Card */}
      <div className="p-3 border-t border-slate-100">
        <UserMenu user={user} logout={logout} />
      </div>
    </aside>
  );
}

function UserMenu({ user, logout }) {
  const [open, setOpen] = useState(false);

  const avatarBg =
    user?.role === "Super Admin" ? "bg-purple-600"
    : user?.role === "Admin" ? "bg-slate-900"
    : "bg-emerald-600";

  return (
    <div className="relative">
      <div className="flex items-center gap-3 rounded-md px-3 py-2">
        {/* Name left */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {user?.username || "User"}
          </p>
          <p className="text-[0.6rem] font-medium text-slate-400 truncate mt-0.5">
            {user?.role || ""}
          </p>
        </div>

        {/* Avatar right - clickable */}
        <button
          onClick={() => setOpen((v) => !v)}
          className={`shrink-0 h-7 w-7 rounded-md flex items-center justify-center text-white text-xs font-bold transition hover:opacity-80 ${avatarBg}`}
        >
          {(user?.username || "U").charAt(0).toUpperCase()}
        </button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-12 right-0 z-20 w-40 rounded-md border border-slate-200 bg-white shadow-md py-1"
            >
              <button
                onClick={() => { setOpen(false); logout(); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <SignOut size={15} />
                Sign out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
