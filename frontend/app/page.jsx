"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeSlash,
  LockKey,
  ShieldCheck,
  User,
} from "@phosphor-icons/react";
import { useAuth } from "./lib/auth";
import { apiFetch } from "./lib/api";
import { Spinner } from "./components/UI";

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
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_22%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_18%),linear-gradient(180deg,#0a0a0a_0%,#050505_45%,#020202_100%)]" />
      <div className="login-grid absolute inset-0 opacity-40" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/10" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-white/60 backdrop-blur"
            >
              <ShieldCheck size={16} weight="fill" />
              Auction Management System
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="mt-8 max-w-4xl font-[var(--font-display)] text-5xl font-semibold leading-[0.92] tracking-[-0.08em] text-white sm:text-6xl lg:text-7xl"
            >
              Sign in to the auction control room.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mt-6 max-w-xl text-base leading-8 text-white/58 sm:text-lg"
            >
              Focused access for super admin, admin, and franchise users. No
              noise, no filler, just a clean secure entry point.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mt-10 flex flex-wrap gap-3"
            >
              {["Secure login", "Role-based access", "Live auction workflow"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/68"
                >
                  {item}
                </span>
              ))}
            </motion.div>
          </section>

          <section className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="relative mx-auto w-full max-w-[460px] overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8"
            >
              <div className="absolute inset-x-8 top-0 h-px bg-white/25" />
              <div className="mb-8 flex justify-center">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-white/80">
                  <ShieldCheck size={22} weight="fill" />
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">
                    Username or Email
                  </span>
                  <div className="relative">
                    <User
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/34"
                    />
                    <input
                      className="login-input pl-12"
                      placeholder="Enter your username"
                      value={form.username}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, username: event.target.value }))
                      }
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">
                    Password
                  </span>
                  <div className="relative">
                    <LockKey
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/34"
                    />
                    <input
                      className="login-input pl-12 pr-12"
                      type={showPwd ? "text" : "password"}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, password: event.target.value }))
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/38 transition hover:bg-white/6 hover:text-white/72"
                      onClick={() => setShowPwd((value) => !value)}
                    >
                      {showPwd ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>

                {error ? (
                  <div className="rounded-[18px] border border-white/10 bg-[#171717] px-4 py-3 text-sm text-white/78">
                    {error}
                  </div>
                ) : null}

                <button className="login-button w-full" type="submit" disabled={loading}>
                  {loading ? <Spinner size={18} /> : "Enter Platform"}
                </button>
              </form>
            </motion.div>
          </section>
        </div>
      </div>
    </div>
  );
}
