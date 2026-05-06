import { useEffect } from "react";
import { useLocation } from "wouter";
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
  const [pathname, navigate] = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/"); return; }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      navigate(redirectByRole(user.role));
    }
  }, [allowedRoles, loading, navigate, user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Spinner size={32} color="teal" />
          <p className="text-sm font-medium text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <motion.main 
        key={pathname} 
        initial={{ opacity: 0, y: 8 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3, ease: "easeOut" }} 
        className="flex-1 ml-0 lg:ml-64"
      >
        <div className="p-5 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
