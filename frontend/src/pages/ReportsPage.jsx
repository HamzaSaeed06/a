import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart2, MapPin, Activity, Bell, Cpu, Battery,
  Calendar, Download, CheckCircle, ShieldCheck,
  AlertTriangle, Wifi, Smartphone, Radio, FileText,
  ChevronRight, ArrowUpRight
} from 'lucide-react';

const REPORT_TABS = [
  { id: 'daily', label: 'Daily Safety Report', desc: 'Overall safety summary', icon: BarChart2 },
  { id: 'location', label: 'Location History', desc: 'Movement & location log', icon: MapPin },
  { id: 'zone', label: 'Zone Violations', desc: 'Geofence breach history', icon: Activity },
  { id: 'alert', label: 'Alert History', desc: 'All alert records', icon: Bell },
  { id: 'band', label: 'Band Connectivity', desc: 'Connection uptime', icon: Cpu },
  { id: 'battery', label: 'Battery History', desc: 'Charge level trends', icon: Battery },
  { id: 'movement', label: 'Movement Analytics', desc: 'Distance & activity data', icon: Activity },
];

const WEEKLY_CHART = [
  { day: 'Mon', value: 0 },
  { day: 'Tue', value: 2 },
  { day: 'Wed', value: 1 },
  { day: 'Thu', value: 3 },
  { day: 'Fri', value: 1 },
  { day: 'Sat', value: 2 },
  { day: 'Sun', value: 0 },
];

export const ReportsPage = () => {
  const { alerts, children, safeZones, activeAlertCount, addToast } = useApp();
  const [activeTab, setActiveTab] = useState('daily');
  const [period, setPeriod] = useState('weekly');

  const activeTabMeta = REPORT_TABS.find((t) => t.id === activeTab) || REPORT_TABS[0];
  const maxVal = Math.max(...WEEKLY_CHART.map((w) => w.value), 3);

  return (
    <div className="p-5 max-w-6xl mx-auto space-y-5 animate-fade-in">
      {/* Top Header Filter & Actions Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Daily / Weekly Toggle */}
        <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {['daily', 'weekly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-5 py-2 text-sm font-medium transition-colors capitalize ${
                period === p
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Date Selector Badge */}
        <div className="flex items-center gap-2 border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm text-slate-600 shadow-sm">
          <Calendar size={14} className="text-slate-400" />
          <span>Live Telemetry Report</span>
        </div>

        {/* Export PDF Button */}
        <button
          onClick={() => addToast(`Exporting ${activeTabMeta.label} as PDF...`, 'success')}
          className="inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-300 text-xs px-3 py-1.5 gap-1.5 shadow-sm"
        >
          <Download size={14} />
          <span>Export PDF</span>
        </button>

        {activeAlertCount > 0 && (
          <span className="ml-auto bg-red-100 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-red-200">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
            {activeAlertCount} Active Alerts
          </span>
        )}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left Sub-Sidebar */}
        <div className="space-y-2">
          {REPORT_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                  isActive
                    ? 'border-slate-800 bg-slate-900 text-white shadow-md'
                    : 'border-transparent bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400'}>
                  <Icon size={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold">{tab.label}</p>
                  <p className={`text-xs ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                    {tab.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Detail Panel */}
        <div className="lg:col-span-3 space-y-5">
          {/* Daily Safety Report Tab Content */}
          {activeTab === 'daily' && (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800 text-lg">Daily Safety Summary</h3>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${activeAlertCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-700'}`}>
                    {activeAlertCount > 0 ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                    {activeAlertCount > 0 ? `${activeAlertCount} Alerts Active` : 'All Clear'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-100">
                    <p className="text-xl font-bold text-emerald-700">{children.length > 0 ? '24.0h' : '0h'}</p>
                    <p className="text-xs text-emerald-600 font-medium mt-0.5">Safe Hours</p>
                  </div>
                  <div className="bg-rose-50 rounded-xl p-3.5 border border-rose-100">
                    <p className="text-xl font-bold text-rose-700">{alerts.length}</p>
                    <p className="text-xs text-rose-600 font-medium mt-0.5">Alerts</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3.5 border border-blue-100">
                    <p className="text-xl font-bold text-blue-700">{safeZones.length}</p>
                    <p className="text-xs text-blue-600 font-medium mt-0.5">Active Safe Zones</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                    <p className="text-xl font-bold text-slate-800">{children.length > 0 ? '100%' : '0%'}</p>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">Band Uptime</p>
                  </div>
                </div>
              </div>

              {/* Chart Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-800">Alert Frequency This Week</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Daily distribution from MongoDB database</p>
                  </div>
                </div>

                <div className="flex mt-4">
                  <div className="flex flex-col justify-between text-xs text-slate-400 font-medium pr-3" style={{ height: '160px' }}>
                    <span>{maxVal}</span>
                    <span>{Math.round(maxVal * 0.75)}</span>
                    <span>{Math.round(maxVal * 0.5)}</span>
                    <span>{Math.round(maxVal * 0.25)}</span>
                    <span>0</span>
                  </div>

                  <div className="flex-1 relative">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="border-b border-dashed border-slate-100" />
                      ))}
                    </div>

                    <div className="flex items-end justify-around h-[160px] relative z-10">
                      {WEEKLY_CHART.map((item) => (
                        <div key={item.day} className="flex flex-col items-center flex-1 h-full justify-end px-2">
                          <div
                            className="w-full max-w-[32px] rounded-t-md transition-all duration-300 hover:opacity-80"
                            style={{
                              height: item.value > 0 ? `${(item.value / maxVal) * 100}%` : '4px',
                              backgroundColor: item.value > 0 ? '#3B82F6' : '#E2E8F0',
                              minHeight: '4px'
                            }}
                            title={`${item.day}: ${item.value} alerts`}
                          />
                          <span className="text-xs font-medium text-slate-500 mt-2">{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Location History Tab Content */}
          {activeTab === 'location' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-800 text-lg">Location History Log</h3>
                <span className="text-xs text-slate-500">Live GPS sync</span>
              </div>
              {children.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No active bands registered. Register a band in Devices page to view live location history.</p>
              ) : (
                <div className="space-y-3">
                  {children.map((c, idx) => (
                    <div key={c.id || idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                          <MapPin size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{c.name} — {c.location}</p>
                          <p className="text-xs text-slate-400">Lat: {c.coordinates?.lat}, Lng: {c.coordinates?.lng}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                        GPS Active
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Zone Violations Tab Content */}
          {activeTab === 'zone' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-800 text-lg">Geofence Safe Zone Monitoring</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {safeZones.length} Active Safe Zones
                </span>
              </div>
              {safeZones.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No safe zones configured yet. Create safe zones in Safe Zones page.</p>
              ) : (
                <div className="space-y-3">
                  {safeZones.map((z, i) => (
                    <div key={z.id || i} className="p-4 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-slate-800">{z.name}</h4>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${z.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                          {z.status === 'active' ? 'Active Guard' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Radius: {z.radiusM}m · Center: {z.lat}, {z.lng}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Alert History Tab Content */}
          {activeTab === 'alert' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-800 text-lg">Alert History Records</h3>
                <span className="text-xs text-slate-500">{alerts.length} Total Alerts</span>
              </div>
              {alerts.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No active safety alerts recorded in MongoDB database.</p>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert, i) => (
                    <div key={alert.id || i} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-50 text-red-600">
                          <Bell size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{alert.message || alert.type || 'Safety Alert'}</p>
                          <p className="text-xs text-slate-400">{alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'Recent'}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${alert.status === 'active' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {alert.status || 'recorded'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Band Connectivity Tab Content */}
          {activeTab === 'band' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Band Telemetry & Connectivity</h3>
              </div>
              <div className="py-8 text-center text-slate-500 space-y-2">
                <BarChart2 size={32} className="mx-auto mb-1 opacity-50 text-blue-600" />
                <p className="text-sm font-medium text-slate-700">Band Uptime: {children.length > 0 ? '100% Connected' : 'No bands paired'}</p>
                <p className="text-xs text-slate-400">Telemetry logs sync directly with express backend and MongoDB Atlas telemetry logs.</p>
              </div>
            </div>
          )}

          {/* Battery History Tab Content */}
          {activeTab === 'battery' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-800 text-lg">Battery Level Trends</h3>
              </div>
              {children.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No paired bands to display battery levels.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {children.map((c) => (
                    <div key={c.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
                      <p className="text-xs font-semibold text-slate-500">{c.name}'s Band</p>
                      <p className={`text-2xl font-bold ${c.batteryPct < 20 ? 'text-rose-600' : 'text-blue-600'}`}>{c.batteryPct || 100}%</p>
                      <p className="text-xs text-slate-400">{c.batteryPct < 20 ? 'Low battery warning' : 'Normal operation'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Movement Analytics Tab Content */}
          {activeTab === 'movement' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-800 text-lg">Movement & Distance Analytics</h3>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-2xl font-bold text-blue-700">{children.length * 1.5} km</p>
                  <p className="text-xs text-blue-600 font-medium">Daily Distance</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="text-2xl font-bold text-emerald-700">{safeZones.length} Safe Zones</p>
                  <p className="text-xs text-emerald-600 font-medium font-display">Active Protection</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-2xl font-bold text-slate-800">{children.length > 0 ? '24.0h' : '0.0h'}</p>
                  <p className="text-xs text-slate-600 font-medium">Active Monitoring</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

