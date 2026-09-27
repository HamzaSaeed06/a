import React from 'react';
import { Activity, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

export default function Analytics() {
  return (
    <div className="px-6 md:px-8 pb-10 space-y-6">
      <p className="text-xs text-slate-500">Real-time risk evaluation and safety metrics analysis</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-2">
          <span className="text-xs font-medium text-slate-400">Safety Index</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">98.4%</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +1.2%
            </span>
          </div>
          <p className="text-xs text-slate-400">High compliance across school and home zones</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-2">
          <span className="text-xs font-medium text-slate-400">Avg Time in Safe Zones</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">7.8 hrs</span>
            <span className="text-xs text-slate-400">/ day</span>
          </div>
          <p className="text-xs text-slate-400">Typical weekday schedule adhered to</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-2">
          <span className="text-xs font-medium text-slate-400">SOS Incident Count</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">0</span>
            <span className="text-xs text-emerald-600 font-semibold">Zero incidents</span>
          </div>
          <p className="text-xs text-slate-400">Past 30 days incident record</p>
        </div>
      </div>
    </div>
  );
}

