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
      <div className="app-shell flex min-h-screen items-center justify-center">
        <Spinner size={34} />
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
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex-1 px-4 py-4 lg:px-0 lg:py-4 lg:pr-4"
      >
        <div className="glass-card min-h-[calc(100vh-2rem)] rounded-[32px] p-5 md:p-7 lg:p-8">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
