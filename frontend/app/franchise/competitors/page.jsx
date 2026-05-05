"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, CoinVertical, UsersThree } from "@phosphor-icons/react";
import DashboardLayout from "../../components/DashboardLayout";
import { SectionCard, EmptyState, Spinner } from "../../components/UI";
import { apiFetch } from "../../lib/api";
import { formatCurrency, cn } from "../../lib/format";

const IDEAL = { Batsman: 6, Bowler: 5, "All-rounder": 3, Wicketkeeper: 2 };

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/franchise/competitors")
      .then((data) => {
        setCompetitors(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatCr = (val) => {
    if (!val) return "—";
    if (val >= 10000000) return (val / 10000000).toFixed(1) + " Cr";
    if (val >= 100000) return (val / 100000).toFixed(1) + " L";
    return val.toLocaleString();
  };

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["Franchise"]}>
        <div className="flex h-full items-center justify-center min-h-[400px]">
          <Spinner size={32} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={["Franchise"]}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h1 text-slate-900">War Room (Competitor Analysis)</h1>
          <p className="text-sub text-slate-900">Monitor other franchises' remaining purses, squad sizes, and strategic gaps in real-time.</p>
        </div>
      </div>

      {competitors.length === 0 ? (
        <SectionCard>
          <EmptyState icon={Shield} title="No competitors found" sub="Other franchises have not been configured yet." />
        </SectionCard>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {competitors.map((team, idx) => {
            const spent = Number(team.total_budget) - Number(team.remaining_budget);
            const spentPct = Math.round((spent / Number(team.total_budget)) * 100) || 0;

            const gapAnalysis = Object.entries(IDEAL).map(([role, target]) => {
              const current = team.squadByRole[role] || 0;
              const gap = Math.max(0, target - current);
              return { role, current, target, gap, pct: Math.min(100, Math.round((current / target) * 100)) };
            });
            const totalGap = gapAnalysis.reduce((s, g) => s + g.gap, 0);

            return (
              <motion.div
                key={team.team_id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <SectionCard padded={false} className="h-full border-slate-200 transition-shadow hover:shadow-md">
                  <div className="p-5 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-4">
                      <div className={cn("h-12 w-12 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center shrink-0", !team.logo_url && "bg-white")}>
                        {team.logo_url ? (
                          <img src={team.logo_url} className="w-full h-full object-contain" alt={team.team_name} />
                        ) : (
                          <Shield size={24} className="text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-h3 text-slate-900 truncate">{team.team_name}</h3>
                        <p className="text-ui-xs font-semibold text-slate-500 mt-0.5">
                          {team.squadSize} / 18 Players
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="flex items-center gap-1.5 text-slate-600 mb-1">
                        <CoinVertical size={16} />
                        <span className="text-[11px] font-bold capitalize">Purse Left</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">{formatCr(team.remaining_budget)}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="flex items-center gap-1.5 text-slate-600 mb-1">
                        <UsersThree size={16} />
                        <span className="text-[11px] font-bold capitalize">Missing</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">{totalGap} Players</p>
                    </div>
                  </div>

                  <div className="px-5 pb-5">
                    <p className="text-ui-xs font-bold text-slate-500 capitalize mb-3">Squad Gaps</p>
                    <div className="space-y-3">
                      {gapAnalysis.map((item) => (
                        <div key={item.role}>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="font-semibold text-slate-700">{item.role}</span>
                            <span className="font-bold text-slate-900">
                              {item.current} / {item.target}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-slate-900"
                              style={{ width: `${item.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </SectionCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
