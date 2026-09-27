import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Battery, Shield, Plus } from 'lucide-react';

export default function Children() {
  const children = [
    {
      id: 'sophia',
      name: 'Sophia Chen',
      age: 8,
      battery: 12,
      bandModel: 'SafeBand Pro v2 (ID: #SB-9821)',
      status: 'In Safe Zone (School)',
      avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=200&h=200&q=80',
    },
    {
      id: 'liam',
      name: 'Liam Torres',
      age: 10,
      battery: 84,
      bandModel: 'SafeBand Pro v2 (ID: #SB-4412)',
      status: 'In Safe Zone (Sports Complex)',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&h=200&q=80',
    },
  ];

  return (
    <div className="px-6 md:px-8 pb-10 space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Manage monitored profiles and assigned GPS bands</p>
        <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Child</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={c.avatar}
                alt={c.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-rose-200"
              />
              <div>
                <h3 className="font-bold text-base text-slate-900">{c.name}</h3>
                <p className="text-xs text-slate-400">Age {c.age} · {c.bandModel}</p>
                <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {c.status}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Battery className="w-4 h-4 text-slate-400" />
                <span>Battery: <strong className={c.battery <= 20 ? 'text-rose-500' : 'text-slate-800'}>{c.battery}%</strong></span>
              </div>

              <Link
                to="/live-location"
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Track Live</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

