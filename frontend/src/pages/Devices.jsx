import React from 'react';
import { Cpu, Wifi, Battery, RefreshCw } from 'lucide-react';

export default function Devices() {
  const devices = [
    {
      id: 'SB-9821',
      child: 'Sophia Chen',
      model: 'SafeBand Pro v2',
      status: 'Connected',
      battery: 12,
      signal: '4G LTE (Strong)',
      firmware: 'v2.4.1 (Up to date)',
    },
    {
      id: 'SB-4412',
      child: 'Liam Torres',
      model: 'SafeBand Pro v2',
      status: 'Connected',
      battery: 84,
      signal: '4G LTE (Strong)',
      firmware: 'v2.4.1 (Up to date)',
    },
  ];

  return (
    <div className="px-6 md:px-8 pb-10 space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Connected child tracker wristbands, cellular status and battery health</p>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync All</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {devices.map((dev) => (
          <div key={dev.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{dev.model}</h3>
                  <p className="text-xs text-slate-400">Assigned to: {dev.child}</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                ● {dev.status}
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Signal:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  {dev.signal}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Battery Level:</span>
                <span className={`font-bold ${dev.battery <= 20 ? 'text-rose-500' : 'text-slate-800'}`}>
                  {dev.battery}%
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Firmware:</span>
                <span className="font-semibold text-slate-800">{dev.firmware}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

