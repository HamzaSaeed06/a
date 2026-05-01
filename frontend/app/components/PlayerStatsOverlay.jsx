"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Broadcast,
  Cricket,
  GlobeHemisphereWest,
  Pulse,
  ShieldStar,
  Target,
} from "@phosphor-icons/react";
import { formatCurrency } from "../lib/format";

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/8 p-4 text-white/90 backdrop-blur-sm">
      <div className="mb-2 flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.18em] text-white/45">
        <Icon size={14} />
        {label}
      </div>
      <div className="text-lg font-semibold">{value || "-"}</div>
    </div>
  );
}

export default function PlayerStatsOverlay({ player, visible, bidAmount, bidder }) {
  return (
    <AnimatePresence>
      {visible && player ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[600] flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.18),rgba(15,23,42,0.94))] px-4 py-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 34, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            className="w-full max-w-5xl overflow-hidden rounded-[36px] border border-white/10 bg-[rgba(15,23,42,0.82)] shadow-[0_40px_100px_rgba(2,6,23,0.55)]"
          >
            <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
              <div className="relative overflow-hidden border-b border-white/10 p-7 lg:border-b-0 lg:border-r">
                <div className="ambient-ring -left-10 -top-10 h-28 w-28" />
                <div className="ambient-ring bottom-10 right-10 h-44 w-44" />
                <div className="relative">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/55">
                    <Broadcast size={14} />
                    Broadcast View
                  </div>
                  <div className="flex flex-col gap-6 md:flex-row md:items-center">
                    <div className="h-28 w-28 overflow-hidden rounded-[28px] border border-white/10 bg-white/10">
                      {player.image_url ? (
                        <img
                          src={player.image_url.startsWith("/") ? player.image_url : `/uploads/${player.image_url}`}
                          alt={player.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-white/60">
                          <ShieldStar size={40} weight="duotone" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h2 className="font-[var(--font-display)] text-4xl font-bold tracking-[-0.06em] text-white">
                        {player.name}
                      </h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
                          {player.role || "Player"}
                        </span>
                        {player.country_name ? (
                          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
                            {player.country_name}
                          </span>
                        ) : null}
                        {player.category_name ? (
                          <span className="rounded-full bg-[rgba(15,118,110,0.18)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#99f6e4]">
                            {player.category_name}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 md:grid-cols-3">
                    <Metric label="Base Price" value={formatCurrency(player.base_price)} icon={Cricket} />
                    <Metric label="Current Bid" value={formatCurrency(bidAmount || player.base_price)} icon={Target} />
                    <Metric label="Leader" value={bidder?.team_name || "Awaiting bids"} icon={Activity} />
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-[rgba(255,255,255,0.03)] p-7">
                <Metric label="Batting Style" value={player.batting_style || "-"} icon={Cricket} />
                <Metric label="Bowling Style" value={player.bowling_style || "-"} icon={Target} />
                <Metric label="Matches" value={player.matches || 0} icon={Pulse} />
                <Metric label="Runs Scored" value={player.runs_scored || 0} icon={ShieldStar} />
                <Metric label="Wickets" value={player.wickets || 0} icon={Target} />
                <Metric label="Strike Rate" value={player.strike_rate || 0} icon={GlobeHemisphereWest} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
