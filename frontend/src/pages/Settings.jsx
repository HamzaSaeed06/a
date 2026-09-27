import React, { useState } from 'react';
import { Bell, Shield, Smartphone, Lock } from 'lucide-react';

export default function Settings() {
  const [geofenceAlerts, setGeofenceAlerts] = useState(true);
  const [batteryAlerts, setBatteryAlerts] = useState(true);
  const [sosSms, setSosSms] = useState(true);

  return (
    <div className="px-6 md:px-8 pb-10 space-y-6 max-w-4xl">
      <p className="text-xs text-slate-500">Manage account security, tracking thresholds, and real-time push alerts</p>

      {/* Notifications card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-500" />
          <span>Notification Preferences</span>
        </h3>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Geofence Boundary Exit Alerts</p>
              <p className="text-slate-400">Receive instant push notifications when a child leaves designated zones</p>
            </div>
            <input
              type="checkbox"
              checked={geofenceAlerts}
              onChange={(e) => setGeofenceAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Critical Battery Level Warnings</p>
              <p className="text-slate-400">Alert parent when GPS band charge drops below 15%</p>
            </div>
            <input
              type="checkbox"
              checked={batteryAlerts}
              onChange={(e) => setBatteryAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Automated SOS SMS Broadcast</p>
              <p className="text-slate-400">Send instant emergency coordinates via SMS to all emergency contacts</p>
            </div>
            <input
              type="checkbox"
              checked={sosSms}
              onChange={(e) => setSosSms(e.target.checked)}
              className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

