import React from 'react';
import { AlertCircle, BatteryLow, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

export default function Alerts() {
  const alerts = [
    {
      id: 1,
      title: "Low Battery Warning: Sophia Chen's Band",
      desc: "Sophia's GPS Band battery has dropped to 12%. Connect charger soon.",
      time: "5 minutes ago",
      type: "warning",
      icon: BatteryLow,
      child: "Sophia Chen",
      badge: "Critical",
    },
    {
      id: 2,
      title: "Geofence Exit: Sophia Chen exited Home zone",
      desc: "Child exited 'Home' safe zone heading towards Lincoln Elementary School.",
      time: "32 minutes ago",
      type: "info",
      icon: ShieldAlert,
      child: "Sophia Chen",
      badge: "Safe Zone",
    },
  ];

  return (
    <div className="px-6 md:px-8 pb-10 space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Live safety triggers, SOS reports, and geofence events</p>
        <button className="text-xs font-semibold text-slate-600 hover:text-slate-900">
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <div
              key={alert.id}
              className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm flex items-start gap-4 transition-all hover:border-rose-200"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm text-slate-900">{alert.title}</h3>
                  <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 shrink-0">
                    {alert.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{alert.desc}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{alert.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

