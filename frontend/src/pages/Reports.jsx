import React from 'react';
import { BarChart2, Calendar, Download } from 'lucide-react';

export default function Reports() {
  const reports = [
    { title: 'Weekly Movement & SafeZone Compliance', period: 'Sep 16 - Sep 22, 2026', size: '1.2 MB' },
    { title: 'Battery Health & Signal Diagnostics', period: 'Sep 01 - Sep 15, 2026', size: '850 KB' },
    { title: 'SOS & Geofence Incident Log', period: 'August 2026', size: '2.4 MB' },
  ];

  return (
    <div className="px-6 md:px-8 pb-10 space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Download telemetry summaries, geofence compliance, and route histories</p>
      </div>

      <div className="space-y-3">
        {reports.map((rep) => (
          <div key={rep.title} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">{rep.title}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{rep.period}</span> · <span>{rep.size}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => alert(`Downloading ${rep.title}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

