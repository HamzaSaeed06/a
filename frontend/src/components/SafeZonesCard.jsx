import React from 'react';

export default function SafeZonesCard({ zones }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3.5">
      <h3 className="font-bold text-sm text-slate-800">
        Active Safe Zones
      </h3>

      <div className="space-y-3">
        {zones.map((zone) => {
          const isInside = zone.status.toLowerCase() === 'inside';

          return (
            <div
              key={zone.name}
              className={`p-3.5 rounded-xl border transition-all duration-200 ${
                isInside
                  ? 'bg-emerald-50/40 border-emerald-100/80'
                  : 'bg-amber-50/60 border-amber-100/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-800">
                  {zone.name}
                </span>

                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    isInside
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {zone.status}
                </span>
              </div>

              <p className="text-[11px] text-slate-500">
                Radius: {zone.radius} · Distance: {zone.distance}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

