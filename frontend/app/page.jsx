"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeSlash, LockKey, User } from "@phosphor-icons/react";
import { useAuth } from "./lib/auth";
import { apiFetch } from "./lib/api";
import { Spinner } from "./components/UI";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Please fill in both fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      login(data.token, data.user);
    } catch (err) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070709]">
      {/* Background beams */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(245,158,11,0.09)_0%,transparent_65%)] blur-3xl" />
        <div className="absolute left-1/2 top-[-80px] h-[200px] w-[1px] -translate-x-1/2 bg-gradient-to-b from-transparent via-amber-400/40 to-transparent" />
      </div>

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)",
        }}
      />

      {/* Top line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[380px] px-4"
      >
        {/* Logo mark */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M9 12l2 2 4-4" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-[0.95rem] font-bold tracking-[-0.02em] text-white">Auction OS</p>
            <p className="text-[0.72rem] text-white/35">Cricket Auction Platform</p>
          </div>
        </div>

        {/* Form card */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-[0_0_80px_rgba(0,0,0,0.5)]">
          <div className="p-6">
            <h1 className="mb-1 text-[1.1rem] font-bold tracking-[-0.025em] text-white">
              Sign in
            </h1>
            <p className="mb-6 text-[0.78rem] text-white/38">
              Enter your credentials to access the platform.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <User size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  className="login-input pl-9 text-sm"
                  placeholder="Username"
                  autoComplete="username"
                  value={form.username}
                  onChange={(e) => setForm((c) => ({ ...c, username: e.target.value }))}
                />
              </div>

              <div className="relative">
                <LockKey size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  className="login-input pl-9 pr-10 text-sm"
                  type={showPwd ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/25 transition hover:text-white/55"
                  onClick={() => setShowPwd((v) => !v)}
                >
                  {showPwd ? <EyeSlash size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-[0.78rem] text-red-400"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="login-button mt-1 w-full"
              >
                {loading ? <Spinner size={16} /> : "Continue"}
              </button>
            </form>
          </div>

          <div className="border-t border-white/[0.06] px-6 py-3">
            <p className="text-center text-[0.7rem] text-white/20">
              Restricted access · Authorized users only
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
