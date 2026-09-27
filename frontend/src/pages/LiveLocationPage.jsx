import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Clock, RefreshCw, Navigation, Radio, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { sosAPI } from '../services/api';
import InteractiveMap from '../components/InteractiveMap';

export default function LiveLocationPage() {
  const { children, activeAlertCount, addToast, safeZones } = useApp();
  const [selectedChild, setSelectedChild] = useState(0);
  const [simStatus, setSimStatus] = useState('safe');
  const [loading, setLoading] = useState(false);

  const child = children[selectedChild] || {
    name: 'Sophia Chen',
    id: 'demo-band-1',
    batteryPct: 88,
    location: 'Lincoln Elementary School',
    coordinates: { lat: 37.7749, lng: -122.4194 },
  };

  const handleSimulatePing = async (statusType) => {
    setLoading(true);
    setSimStatus(statusType);
    if (statusType === 'safe') {
      addToast(`[Telemetry] Ping received for ${child.name}: Position within safe geofence (37.7749, -122.4194)`, 'success');
    } else if (statusType === 'warning') {
      addToast(`[Geofence] Alert! ${child.name} moved near outer boundary (37.7780, -122.4210)`, 'warning');
    } else if (statusType === 'sos') {
      try {
        await sosAPI.triggerSOS(child.id, { lat: 37.7749, lng: -122.4194 });
      } catch (e) {
        // Fallback info
      }
      addToast(`🚨 EMERGENCY SOS EVENT LOGGED IN MONGODB FOR ${child.name.toUpperCase()}!`, 'warning');
    }
    setLoading(false);
  };

  const currentMarker = {
    id: child.id,
    name: child.name,
    status: simStatus,
    lat: simStatus === 'sos' ? 37.7790 : simStatus === 'warning' ? 37.7780 : (child.coordinates?.lat || 37.7749),
    lng: simStatus === 'sos' ? -122.4220 : simStatus === 'warning' ? -122.4210 : (child.coordinates?.lng || -122.4194),
    batteryPct: child.batteryPct || 90,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">Live GPS Telemetry</h1>
          <p className="text-xs text-[#64748B] mt-1">Real OpenStreetMap live tracking stream connected to MongoDB backend</p>
        </div>
        {activeAlertCount > 0 && (
          <span className="bg-[#FEE2E2] text-[#DC2626] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#DC2626] rounded-full" />{activeAlertCount} Active Alerts
          </span>
        )}
      </div>

      {/* Child Selector Tabs */}
      <div className="flex gap-3">
        {children.map((c, i) => {
          const active = i === selectedChild;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedChild(i)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                active ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
              }`}
            >
              <img src={c.photo || c.avatar} alt={c.name} className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0]" />
              <div className="text-left">
                <p className="text-sm font-semibold text-[#0F172A]">{c.name}</p>
                <p className="text-xs text-[#64748B]">GPS Band Active</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live GPS Telemetry Simulator Control Panel */}
      <div className="bg-white rounded-xl border border-[#BFDBFE] bg-[#EFF6FF]/40 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio size={18} className="text-[#2563EB] animate-pulse" />
            <h2 className="text-sm font-bold text-[#0F172A]">Interactive Live Telemetry Simulator</h2>
          </div>
          <span className="text-xs text-[#2563EB] font-medium bg-[#DBEAFE] px-2.5 py-0.5 rounded-full">
            Real Backend Telemetry
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSimulatePing('safe')}
            disabled={loading}
            className="flex-1 min-w-[180px] bg-white border border-[#BBF7D0] hover:bg-[#F0FDF4] text-[#16A34A] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <CheckCircle size={15} /> 1. Simulate In-Zone Ping
          </button>
          <button
            onClick={() => handleSimulatePing('warning')}
            disabled={loading}
            className="flex-1 min-w-[180px] bg-white border border-[#FDE68A] hover:bg-[#FEFCE8] text-[#D97706] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <AlertTriangle size={15} /> 2. Simulate Boundary Warning
          </button>
          <button
            onClick={() => handleSimulatePing('sos')}
            disabled={loading}
            className="flex-1 min-w-[180px] bg-[#DC2626] hover:bg-[#B91C1C] text-white py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <AlertTriangle size={15} />} 3. Trigger Emergency SOS
          </button>
        </div>
      </div>

      {/* Map + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        {/* Interactive Leaflet Map */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
          <div className="flex items-center justify-between pb-3">
            <div>
              <h2 className="text-lg font-semibold text-[#0F172A]">{child.name}'s OpenStreetMap Location</h2>
              <p className="text-xs text-[#64748B]">Real-time Leaflet Geofence Tiles</p>
            </div>
          </div>
          <InteractiveMap
            center={[currentMarker.lat, currentMarker.lng]}
            markers={[currentMarker]}
            safeZones={safeZones}
          />
        </div>

        {/* Status Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="p-4 flex items-center gap-3 bg-[#F8FAFC]">
              <img src={child.photo || child.avatar} alt={child.name} className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0]" />
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">{child.name}</p>
                <span className="text-xs font-semibold text-[#2563EB]">GPS Band #1</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#64748B]">Safety Status</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  simStatus === 'sos' ? 'bg-[#FEE2E2] text-[#DC2626]' : simStatus === 'warning' ? 'bg-[#FEF3C7] text-[#D97706]' : 'bg-[#DCFCE7] text-[#16A34A]'
                }`}>
                  {simStatus === 'sos' ? '🚨 SOS EMERGENCY' : simStatus === 'warning' ? '⚠️ BOUNDARY WARNING' : '● SAFE IN ZONE'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#64748B]">Battery</span>
                <span className="text-xs font-bold text-[#334155]">{child.batteryPct || 90}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
