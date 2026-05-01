"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import { useAuth } from "../lib/auth";
import { Spinner } from "./UI";

function redirectByRole(role) {
  if (role === "Super Admin") return "/super-admin";
  if (role === "Admin") return "/admin";
  if (role === "Franchise") return "/franchise";
  return "/";
}

export default function DashboardLayout({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push(redirectByRole(user.role));
    }
  }, [allowedRoles, loading, router, user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return (
    <div className="app-shell lg:flex">
      <Sidebar />
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="min-h-screen flex-1 p-4 lg:pl-0"
      >
        <div className="min-h-[calc(100vh-2rem)] rounded-2xl border border-white/[0.07] bg-[rgba(255,255,255,0.025)] p-5 md:p-6 lg:p-7 backdrop-blur-sm">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
