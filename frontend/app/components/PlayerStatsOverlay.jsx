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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-1.5 text-[0.65rem] font-bold text-slate-400">
        <Icon size={14} />
        {label}
      </div>
      <div className="text-sm font-bold text-slate-800">{value || "—"}</div>
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
          className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 px-4 py-8 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            {onClose && (
              <button
                onClick={onClose}
                className="absolute right-6 top-6 z-10 rounded-full border border-slate-200 bg-slate-50 p-2.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            )}

            <div className="grid lg:grid-cols-[1.3fr_0.7fr]">
              <div className="relative overflow-hidden border-b border-slate-100 p-8 lg:border-b-0 lg:border-r">
                <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-[0.65rem] font-bold text-blue-700">
                  <Broadcast size={14} weight="bold" />
                  Broadcast View
                </div>

                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-50 shadow-sm">
                    {player.action_image_url || player.image_url ? (
                      <img
                        src={(player.action_image_url || player.image_url).startsWith("/") ? (player.action_image_url || player.image_url) : `/uploads/${player.action_image_url || player.image_url}`}
                        alt={player.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <ShieldStar size={48} weight="light" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900">
                      {player.name}
                    </h2>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold text-slate-600 border border-slate-200 bg-slate-100">{player.role || "Player"}</span>
                      {player.country_name && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold text-slate-600 border border-slate-200 bg-slate-100">{player.country_name}</span>
                      )}
                      {player.category_name && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold text-amber-700 border border-amber-200 bg-amber-50">{player.category_name}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-5 shadow-sm">
                    <div className="mb-2 text-[0.65rem] font-bold text-slate-500 flex items-center gap-1.5">
                      <Cricket size={14} />
                      Base Price
                    </div>
                    <p className="text-lg font-black text-slate-900">{formatCurrency(player.base_price)}</p>
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
                    <div className="mb-2 text-[0.65rem] font-bold text-blue-600 flex items-center gap-1.5">
                      <Target size={14} />
                      Current Bid
                    </div>
                    <p className="text-lg font-black text-blue-700">{formatCurrency(bidAmount || player.base_price)}</p>
                  </div>
                  <div className={`rounded-xl border p-5 shadow-sm ${bidder ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                    <div className={`mb-2 text-[0.65rem] font-bold flex items-center gap-1.5 ${bidder ? "text-emerald-600" : "text-slate-500"}`}>
                      <Trophy size={14} />
                      Leader
                    </div>
                    <p className={`text-sm font-black truncate ${bidder ? "text-emerald-700" : "text-slate-400"}`}>
                      {bidder?.team_name || "Awaiting bids"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-slate-50 p-8">
                <p className="text-[0.65rem] font-bold text-slate-400 mb-5">
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
