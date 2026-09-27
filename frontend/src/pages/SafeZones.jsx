import React from 'react';
import { Map, Plus, MapPin } from 'lucide-react';

export default function SafeZones() {
  const zones = [
    { name: 'Home', radius: '150m', address: '742 Evergreen Terrace', type: 'Residential', activeFor: 'Sophia, Liam' },
    { name: 'Lincoln Elementary', radius: '200m', address: '123 Oak St', type: 'School', activeFor: 'Sophia' },
    { name: 'Central Sports Complex', radius: '250m', address: '456 Elm St', type: 'Recreation', activeFor: 'Liam' },
    { name: 'Grandparents House', radius: '100m', address: '88 Maple Ave', type: 'Residential', activeFor: 'Sophia, Liam' },
  ];

  return (
    <div className="px-6 md:px-8 pb-10 space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Configure geofencing safe zones for automated notifications</p>
        <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Safe Zone</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones.map((zone) => (
          <div key={zone.name} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{zone.name}</h3>
                  <p className="text-[11px] text-slate-400">{zone.address}</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {zone.type}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Radius: <strong>{zone.radius}</strong></span>
              <span>Active for: <strong>{zone.activeFor}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

