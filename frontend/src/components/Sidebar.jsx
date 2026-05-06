import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import Lenis from "lenis";
import {
  ArrowsLeftRight, Broadcast, ChartLineUp, GlobeHemisphereWest,
  HouseLine, IdentificationBadge, ListChecks, ShieldCheck, SignOut,
  Sparkle, Stack, UserList, UsersThree, UserCircle, Target,
  CaretRight, Gavel,
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
  { href: "/franchise", label: "Dashboard", icon: HouseLine },
  { href: "/franchise/competitors", label: "War Room", icon: Target },
  { href: "/franchise/pool", label: "Auction Pool", icon: ListChecks },
  { href: "/franchise/live-auction", label: "Live Bidding", icon: ArrowsLeftRight },
  { href: "/franchise/profile", label: "My Profile", icon: UserCircle },
];

function NavLink({ href, label, icon: Icon, active }) {
  return (
    <Link href={href}>
      <motion.div 
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 group cursor-pointer",
          active 
            ? "bg-teal-50 text-teal-700" 
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        )}
      >
        <Icon 
          size={20} 
          weight={active ? "duotone" : "regular"} 
          className={cn(
            "shrink-0 transition-colors",
            active ? "text-teal-600" : "text-slate-400 group-hover:text-slate-600"
          )} 
        />
        <span className="text-sm font-medium">{label}</span>
        {active && (
          <motion.div 
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-teal-600 rounded-full"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </motion.div>
    </Link>
  );
}

function NavGroup({ title, links, pathname }) {
  return (
    <div className="flex flex-col">
      <p className="mb-2 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
      <div className="flex flex-col gap-0.5">
        {links.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
          return <NavLink key={href} href={href} label={label} icon={icon} active={active} />;
        })}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [pathname] = useLocation();
  const groups = useMemo(() => {
    if (user?.role === "Super Admin") return [{ title: "Governance", links: SUPER_ADMIN_LINKS }, { title: "Operations", links: ADMIN_LINKS }];
    if (user?.role === "Admin") return [{ title: "Operations", links: ADMIN_LINKS }];
    return [{ title: "Franchise", links: FRANCHISE_LINKS }];
  }, [user?.role]);
  const scrollRef = useRef(null);
  
  useEffect(() => {
    if (!scrollRef.current) return;
    const lenis = new Lenis({ 
      wrapper: scrollRef.current, 
      content: scrollRef.current.querySelector(".sidebar-content"), 
      duration: 1.2, 
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      orientation: "vertical", 
      gestureOrientation: "vertical", 
      smoothWheel: true, 
      wheelMultiplier: 1, 
      lerp: 0.1 
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);
  
  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 h-screen bg-white border-r border-slate-200 flex-col hidden lg:flex">
      {/* Logo Section */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
            <Gavel size={20} weight="fill" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold tracking-tight text-slate-900">Auction OS</p>
            <p className="text-[11px] font-medium text-slate-500">Command Layer</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div ref={scrollRef} data-lenis-prevent className="flex-1 overflow-y-auto no-scrollbar">
        <div className="sidebar-content px-3 py-5 space-y-6">
          {groups.map((group) => (
            <NavGroup key={group.title} title={group.title} links={group.links} pathname={pathname} />
          ))}
        </div>
      </div>
      
      {/* User Section */}
      <div className="p-3 border-t border-slate-100">
        <UserMenu user={user} logout={logout} />
      </div>
    </aside>
  );
}

function UserMenu({ user, logout }) {
  const [open, setOpen] = useState(false);
  const roleColors = {
    "Super Admin": "bg-purple-100 text-purple-700",
    "Admin": "bg-slate-100 text-slate-700", 
    "Franchise": "bg-teal-100 text-teal-700"
  };
  
  return (
    <div className="relative">
      <motion.div 
        whileHover={{ backgroundColor: "rgb(248, 250, 252)" }}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className={cn(
          "shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm",
          roleColors[user?.role] || roleColors.Franchise
        )}>
          {(user?.username || "U").charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{user?.username || "User"}</p>
          <p className="text-[11px] font-medium text-slate-500 truncate">{user?.role || ""}</p>
        </div>
        <CaretRight 
          size={16} 
          className={cn("text-slate-400 transition-transform", open && "rotate-90")} 
        />
      </motion.div>
      
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 5 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 5 }} 
              transition={{ duration: 0.15 }} 
              className="absolute bottom-full mb-2 left-0 right-0 z-20 rounded-xl border border-slate-200 bg-white shadow-lg py-1.5 px-1.5"
            >
              <button 
                onClick={() => { setOpen(false); logout(); }} 
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <SignOut size={18} weight="duotone" />
                Sign out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
