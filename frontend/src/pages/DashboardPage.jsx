import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Users, Wifi, Battery, MapPin, Clock, ChevronRight } from 'lucide-react';
import InteractiveMap from '../components/InteractiveMap';

export default function DashboardPage() {
  const { children, alerts, activeAlertCount, navigateTo, safeZones } = useApp();
  const connectedBands = children.filter((c) => c.status !== 'offline').length;
  const avgBattery = children.length > 0
    ? Math.round(children.reduce((sum, c) => sum + (c.batteryPct || 90), 0) / children.length)
    : 90;

  const childMarkers = children.map((c) => ({
    id: c.id,
    name: c.name,
    status: c.status || 'safe',
    lat: c.coordinates?.lat || 37.7749,
    lng: c.coordinates?.lng || -122.4194,
    batteryPct: c.batteryPct || 90,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">Dashboard</h1>
          <p className="text-xs text-[#64748B] mt-1">Live Child Safety Overview connected to MongoDB Atlas backend</p>
        </div>
        {activeAlertCount > 0 && (
          <span className="bg-[#FEE2E2] text-[#DC2626] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#DC2626] rounded-full" />
            {activeAlertCount} Active Alerts
          </span>
        )}
      </div>

      {/* Alert Banner */}
      {activeAlertCount > 0 && (
        <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-4 flex items-center gap-4">
          <div className="bg-[#FEE2E2] p-2.5 rounded-lg flex-shrink-0">
            <Bell size={20} className="text-[#DC2626]" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-[#991B1B]">{activeAlertCount} Active Alerts Require Attention</h3>
            <p className="text-xs text-[#DC2626]">Review and take action on pending safety alerts</p>
          </div>
          <button onClick={() => navigateTo('alerts')} className="text-xs font-bold text-[#DC2626] hover:underline flex items-center gap-1 flex-shrink-0">
            View Alerts <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL CHILDREN', value: children.length, sub: 'Monitored bands', Icon: Users, iconBg: 'bg-[#F1F5F9]', iconColor: 'text-[#64748B]' },
          { label: 'ACTIVE ALERTS', value: activeAlertCount, sub: 'Needs attention', Icon: Bell, iconBg: 'bg-[#FEF2F2]', iconColor: 'text-[#DC2626]' },
          { label: 'BAND STATUS', value: `${connectedBands}/${children.length}`, sub: 'Connected bands', Icon: Wifi, iconBg: 'bg-[#DCFCE7]', iconColor: 'text-[#16A34A]' },
          { label: 'AVG BATTERY', value: `${avgBattery}%`, sub: 'Battery health', Icon: Battery, iconBg: 'bg-[#DCFCE7]', iconColor: 'text-[#16A34A]' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">{card.label}</p>
              <p className="text-3xl font-bold text-[#0F172A] mt-1">{card.value}</p>
              <p className="text-xs text-[#64748B] mt-1">{card.sub}</p>
            </div>
            <div className={`${card.iconBg} p-2.5 rounded-lg`}>
              <card.Icon size={20} className={card.iconColor} />
            </div>
          </div>
        ))}
      </div>

      {/* Map + Child Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* OpenStreetMap Tile Map Overview */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
          <div className="flex items-center justify-between pb-3">
            <h2 className="text-lg font-semibold text-[#0F172A]">OpenStreetMap Overview</h2>
            <button onClick={() => navigateTo('live-location')} className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
              Full map <ChevronRight size={14} />
            </button>
          </div>
          <InteractiveMap
            center={[37.7749, -122.4194]}
            markers={childMarkers}
            safeZones={safeZones}
          />
        </div>

        {/* Child Cards */}
        <div className="space-y-4">
          {children.map((child) => (
            <div key={child.id} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
              <div className="flex items-start gap-3 mb-3">
                <img src={child.photo || child.avatar} alt={child.name} className="w-12 h-12 rounded-full object-cover border border-[#E2E8F0]" />
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-[#0F172A]">{child.name}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#DBEAFE] text-[#2563EB]">
                      Age {child.age || 8}
                    </span>
                    {child.status === 'danger' && (
                      <span className="bg-[#FEE2E2] text-[#DC2626] text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#DC2626] rounded-full" /> Alert Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-xs text-[#64748B]">
                <div className="flex items-center gap-2">
                  <MapPin size={14} /> <span>{child.location || 'Live Telemetry Active'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#16A34A]">
                  <Wifi size={14} /> <span>GPS Band Online</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-[#334155]">{child.batteryPct || 90}% Battery</span>
                  <div className="flex-1 ml-3 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all bg-[#16A34A]"
                      style={{ width: `${child.batteryPct || 90}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
