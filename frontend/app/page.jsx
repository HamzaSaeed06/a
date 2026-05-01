"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Cricket,
  Eye,
  EyeSlash,
  LockKey,
  ShieldCheck,
  User,
} from "@phosphor-icons/react";
import { useAuth } from "./lib/auth";
import { apiFetch } from "./lib/api";
import { Spinner } from "./components/UI";

const FEATURES = [
  { label: "Live auction floor", dot: "bg-emerald-400" },
  { label: "Real-time bidding", dot: "bg-amber-400" },
  { label: "Role-based access", dot: "bg-purple-400" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.username || !form.password) {
      setError("Enter both username and password.");
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
      setError(err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06060a] text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(245,158,11,0.07),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(99,102,241,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_80%,rgba(245,158,11,0.04),transparent_45%)]" />
      </div>

      <div className="login-grid absolute inset-0 opacity-60" />

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">

          <section className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 rounded-full border border-amber-400/20 bg-amber-400/8 px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.25em] text-amber-400"
            >
              <Cricket size={14} weight="fill" />
              Cricket Auction Management
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.07 }}
              className="mt-7 font-[var(--font-display)] text-5xl font-bold leading-[0.96] tracking-[-0.05em] text-white sm:text-6xl lg:text-[4.5rem]"
            >
              The auction
              <br />
              <span className="text-amber-400">command room.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.13 }}
              className="mt-6 max-w-lg text-base leading-8 text-white/48 sm:text-lg"
            >
              Unified control for super admins, auction managers, and franchise
              operators. Real-time bids, live timers, squad tracking.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-9 flex flex-wrap gap-3"
            >
              {FEATURES.map((item) => (
                <span
                  key={item.label}
                  className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-sm text-white/55"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
                  {item.label}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="mt-12 hidden lg:flex items-end gap-4"
            >
              {[
                { num: "16", label: "Teams" },
                { num: "200+", label: "Players" },
                { num: "Live", label: "Real-time sync" },
              ].map((item) => (
                <div key={item.label} className="pr-4 border-r border-white/[0.08] last:border-r-0">
                  <p className="font-[var(--font-display)] text-2xl font-bold text-amber-400 tracking-[-0.04em]">
                    {item.num}
                  </p>
                  <p className="mt-0.5 text-[0.72rem] text-white/38 uppercase tracking-[0.16em]">
                    {item.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </section>

          <section className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 22, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/[0.09] bg-[linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-7 shadow-[0_32px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
            >
              <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
              <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-amber-400/6 blur-3xl pointer-events-none" />

              <div className="mb-7 flex items-center justify-between">
                <div>
                  <p className="font-[var(--font-display)] text-[1.05rem] font-bold tracking-[-0.03em] text-white">
                    Sign in
                  </p>
                  <p className="mt-0.5 text-xs text-white/38">Access your dashboard</p>
                </div>
                <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-2.5 text-amber-400">
                  <ShieldCheck size={18} weight="fill" />
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/38">
                    Username or Email
                  </span>
                  <div className="relative">
                    <User
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/28"
                    />
                    <input
                      className="login-input pl-10"
                      placeholder="Enter your username"
                      value={form.username}
                      onChange={(e) => setForm((c) => ({ ...c, username: e.target.value }))}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/38">
                    Password
                  </span>
                  <div className="relative">
                    <LockKey
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/28"
                    />
                    <input
                      className="login-input pl-10 pr-11"
                      type={showPwd ? "text" : "password"}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/30 transition hover:bg-white/[0.06] hover:text-white/60"
                      onClick={() => setShowPwd((v) => !v)}
                    >
                      {showPwd ? <EyeSlash size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>

                {error ? (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                  >
                    {error}
                  </motion.div>
                ) : null}

                <button className="login-button w-full mt-2" type="submit" disabled={loading}>
                  {loading ? <Spinner size={17} /> : "Enter Platform"}
                </button>
              </form>

              <p className="mt-5 text-center text-[0.7rem] text-white/25">
                Authorized personnel only
              </p>
            </motion.div>
          </section>
        </div>
      </div>
    </div>
  );
}
