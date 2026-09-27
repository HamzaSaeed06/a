import React from 'react';
import { Check } from 'lucide-react';

export default function StatusCard({ child }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
      {/* Child Profile Header */}
      <div className="flex items-center gap-3.5 p-3 rounded-xl bg-pink-50/50 border border-pink-100/60">
        <img
          src={child.avatar}
          alt={child.name}
          className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-xs"
        />
        <div>
          <h3 className="font-bold text-base text-slate-900 leading-tight">
            {child.name}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Age {child.age}
          </p>
        </div>
      </div>

      {/* Status Details */}
      <div className="space-y-3 pt-1">
        {/* Safety Status */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Safety Status</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Safe
          </span>
        </div>

        {/* Safe Zone */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Safe Zone</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold border border-emerald-100">
            Within zone
          </span>
        </div>

        {/* Band */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Band</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold border border-emerald-100">
            <Check className="w-3 h-3 stroke-[2.5]" />
            connected
          </span>
        </div>

        {/* Battery */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-500">Battery</span>
            <span className="font-bold text-red-500">{child.battery}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-red-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${child.battery}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

