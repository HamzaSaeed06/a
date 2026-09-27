import React from 'react';
import { Shield, Phone, MapPin, Navigation } from 'lucide-react';

export default function PoliceStation() {
  const stations = [
    {
      name: 'Oak District Central Precinct',
      address: '220 Lincoln Way, Oak City',
      distance: '1.4 km',
      phone: '+1 (555) 911-0021',
      status: 'Open 24/7',
    },
    {
      name: 'Northwood Community Police Branch',
      address: '74 Elm Blvd, Northwood',
      distance: '3.1 km',
      phone: '+1 (555) 911-0089',
      status: 'Open 24/7',
    },
  ];

  return (
    <div className="px-6 md:px-8 pb-10 space-y-6">
      <p className="text-xs text-slate-500">Nearest police precincts and emergency response stations to your children</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stations.map((st) => (
          <div key={st.name} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{st.name}</h3>
                  <p className="text-xs text-slate-400">{st.address}</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                {st.status}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{st.distance} away</span>
              </div>
              <a
                href={`tel:${st.phone}`}
                className="flex items-center gap-1.5 font-semibold text-rose-600 hover:text-rose-700"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{st.phone}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

