import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, AlertCircle, BatteryCharging, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: 'Monitored Children', value: '2', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Alerts', value: '2', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Active Safe Zones', value: '4', icon: MapPin, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Devices Connected', value: '2/2', icon: BatteryCharging, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="px-6 md:px-8 pb-10 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Welcome back, Sarah!</h2>
          <p className="text-xs text-slate-300 mt-1">
            All connected GPS bands are broadcasting live telemetry. Sophia is at school, and Liam is at soccer practice.
          </p>
        </div>

        <Link
          to="/live-location"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition-colors shadow-xs"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Go to Live Location</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{s.label}</span>
                <div className={`w-8 h-8 rounded-xl ${s.bg} ${s.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Child 1: Sophia */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=120&h=120&q=80"
                alt="Sophia"
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-rose-200"
              />
              <div>
                <h3 className="font-bold text-sm text-slate-900">Sophia Chen</h3>
                <p className="text-xs text-slate-400">Band: Active · Battery 12%</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              Safe (School)
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Lincoln Elementary School, 123 Oak St · 349m away
          </p>
          <Link
            to="/live-location"
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1.5"
          >
            <span>View on Live Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Child 2: Liam */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&h=120&q=80"
                alt="Liam"
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-200"
              />
              <div>
                <h3 className="font-bold text-sm text-slate-900">Liam Torres</h3>
                <p className="text-xs text-slate-400">Band: Active · Battery 84%</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              Safe (Sports Complex)
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Central Sports Complex, 456 Elm St · 1.2km away
          </p>
          <Link
            to="/live-location"
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1.5"
          >
            <span>View on Live Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

