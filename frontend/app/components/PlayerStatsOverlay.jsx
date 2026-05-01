"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Broadcast,
  Cricket,
  GlobeHemisphereWest,
  Pulse,
  ShieldStar,
  Target,
  Trophy,
  X,
} from "@phosphor-icons/react";
import { formatCurrency } from "../lib/format";

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-3.5">
      <div className="mb-2 flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.18em] text-white/35">
        <Icon size={12} />
        {label}
      </div>
      <div className="text-sm font-semibold text-white/85">{value || "—"}</div>
    </div>
  );
}

export default function PlayerStatsOverlay({ player, visible, onClose, bidAmount, bidder }) {
  return (
    <AnimatePresence>
      {visible && player ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/[0.09] bg-[#090912] shadow-[0_48px_120px_rgba(0,0,0,0.7)]"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-400/5 blur-3xl pointer-events-none" />

            {onClose && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-xl border border-white/[0.08] bg-white/[0.05] p-2 text-white/40 transition hover:bg-white/[0.09] hover:text-white/75"
              >
                <X size={16} />
              </button>
            )}

            <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
              <div className="relative overflow-hidden border-b border-white/[0.07] p-7 lg:border-b-0 lg:border-r lg:border-r-white/[0.07]">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/8 px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-amber-400">
                  <Broadcast size={12} />
                  Broadcast View
                </div>

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06]">
                    {player.image_url ? (
                      <img
                        src={player.image_url.startsWith("/") ? player.image_url : `/uploads/${player.image_url}`}
                        alt={player.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-amber-400/50">
                        <ShieldStar size={36} weight="duotone" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold tracking-[-0.05em] text-white">
                      {player.name}
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="badge badge-neutral">{player.role || "Player"}</span>
                      {player.country_name && (
                        <span className="badge badge-neutral">{player.country_name}</span>
                      )}
                      {player.category_name && (
                        <span className="badge badge-gold">{player.category_name}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-4">
                    <div className="mb-1.5 text-[0.62rem] uppercase tracking-[0.18em] text-white/30 flex items-center gap-1.5">
                      <Cricket size={12} />
                      Base Price
                    </div>
                    <p className="text-base font-bold text-amber-400">{formatCurrency(player.base_price)}</p>
                  </div>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-400/[0.06] p-4">
                    <div className="mb-1.5 text-[0.62rem] uppercase tracking-[0.18em] text-amber-400/60 flex items-center gap-1.5">
                      <Target size={12} />
                      Current Bid
                    </div>
                    <p className="text-base font-bold text-amber-400">{formatCurrency(bidAmount || player.base_price)}</p>
                  </div>
                  <div className={`rounded-xl border p-4 ${bidder ? "border-emerald-500/20 bg-emerald-400/[0.05]" : "border-white/[0.07] bg-white/[0.04]"}`}>
                    <div className="mb-1.5 text-[0.62rem] uppercase tracking-[0.18em] text-white/30 flex items-center gap-1.5">
                      <Trophy size={12} />
                      Leader
                    </div>
                    <p className={`text-sm font-bold truncate ${bidder ? "text-emerald-400" : "text-white/40"}`}>
                      {bidder?.team_name || "Awaiting bids"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-white/[0.02] p-7">
                <p className="text-[0.62rem] uppercase tracking-[0.2em] text-white/28 mb-4">
                  Player Profile
                </p>
                <Metric label="Batting Style" value={player.batting_style} icon={Cricket} />
                <Metric label="Bowling Style" value={player.bowling_style} icon={Target} />
                <Metric label="Matches" value={player.matches ? String(player.matches) : "—"} icon={Pulse} />
                <Metric label="Runs Scored" value={player.runs_scored ? String(player.runs_scored) : "—"} icon={ShieldStar} />
                <Metric label="Wickets" value={player.wickets ? String(player.wickets) : "—"} icon={Target} />
                <Metric label="Strike Rate" value={player.strike_rate ? String(player.strike_rate) : "—"} icon={GlobeHemisphereWest} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
