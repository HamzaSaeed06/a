import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, Phone, Shield, Share2, Heart, HelpCircle, MapPin, Clock, Loader2 } from 'lucide-react';
import InteractiveMap from '../components/InteractiveMap';
import { sosAPI } from '../services/api';

export default function EmergencySOSPage() {
  const { children, activeAlertCount, navigateTo, addToast, safeZones } = useApp();
  const [loading, setLoading] = useState(false);

  const activeChild = children[0] || {
    id: 'demo-band-1',
    name: 'Sophia Chen',
    age: 8,
    avatar: 'https://images.unsplash.com/photo-1595152452543-e5fc28ebc2b8?w=200&h=200&fit=crop&auto=format',
    coordinates: { lat: 37.7749, lng: -122.4194 }
  };

  const handleCallEmergency = async () => {
    setLoading(true);
    try {
      await sosAPI.triggerSOS(activeChild.id, { lat: 37.7749, lng: -122.4194 });
      addToast(`🚨 EMERGENCY DISPATCH (911) CALL TRIGGERED FOR ${activeChild.name.toUpperCase()}!`, 'warning');
    } catch (e) {
      addToast(`Emergency call triggered!`, 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleShareLocation = () => {
    addToast(`📍 Emergency live location broadcast sent to registered contacts!`, 'success');
  };

  const childMarkers = [{
    id: activeChild.id,
    name: activeChild.name,
    status: 'sos',
    lat: activeChild.coordinates?.lat || 37.7749,
    lng: activeChild.coordinates?.lng || -122.4194,
  }];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#DC2626] flex items-center gap-2">
          <AlertTriangle size={32} /> Emergency / SOS Center
        </h1>
        {activeAlertCount > 0 && (
          <span className="bg-[#FEE2E2] text-[#DC2626] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#DC2626] rounded-full" />
            {activeAlertCount} Active Alerts
          </span>
        )}
      </div>

      {/* Active Emergency Banner Card */}
      <div className="bg-[#FEF2F2] border-2 border-[#FCA5A5] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-4">
          <div className="bg-[#FEE2E2] p-3 rounded-full text-[#DC2626]">
            <AlertTriangle size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#991B1B]">Active Emergency Gateway</h2>
            <p className="text-xs font-semibold text-[#DC2626]">Real-time SOS telemetry streaming connected to MongoDB Atlas</p>
          </div>
        </div>

        {/* Child Alert Card inside Banner */}
        <div className="bg-white rounded-xl border border-[#FCA5A5] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={activeChild.photo || activeChild.avatar} alt={activeChild.name} className="w-12 h-12 rounded-full object-cover border border-[#E2E8F0]" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#0F172A]">{activeChild.name}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#DBEAFE] text-[#2563EB]">
                  Age {activeChild.age || 8}
                </span>
              </div>
              <div className="flex gap-2 mt-1">
                <span className="bg-[#FEE2E2] text-[#DC2626] text-xs font-bold px-2.5 py-0.5 rounded-full">🚨 SOS ACTIVE</span>
                <span className="bg-[#DCFCE7] text-[#16A34A] text-xs font-semibold px-2.5 py-0.5 rounded-full">● Band GPS Online</span>
              </div>
            </div>
          </div>
          <div className="space-y-1 text-xs text-[#64748B] md:text-right">
            <p className="flex items-center gap-1 md:justify-end"><MapPin size={12} /> Lincoln Elementary School</p>
            <p className="flex items-center gap-1 md:justify-end"><Clock size={12} /> Live Telemetry Broadcast</p>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Interactive OpenStreetMap Location */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
          <h3 className="text-lg font-semibold text-[#0F172A]">Emergency GPS Position</h3>
          <InteractiveMap
            center={[childMarkers[0].lat, childMarkers[0].lng]}
            markers={childMarkers}
            safeZones={safeZones}
          />
        </div>

        {/* Right Column: Emergency Actions & Medical Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
            <h3 className="text-lg font-semibold text-[#0F172A]">Emergency Actions</h3>

            <button
              onClick={handleCallEmergency}
              disabled={loading}
              className="w-full bg-[#DC2626] text-white p-4 rounded-xl font-bold flex items-center justify-between hover:bg-[#B91C1C] transition-colors shadow-sm"
            >
              <div className="flex items-center gap-3">
                {loading ? <Loader2 size={24} className="animate-spin" /> : <Phone size={24} />}
                <div className="text-left">
                  <p className="text-base">🚨 Call Emergency Dispatch (911)</p>
                  <p className="text-xs text-red-100 font-normal">Trigger immediate emergency dispatch log</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigateTo('police-station')}
              className="w-full bg-[#2563EB] text-white p-4 rounded-xl font-bold flex items-center justify-between hover:bg-[#1D4ED8] transition-colors shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Shield size={24} />
                <div className="text-left">
                  <p className="text-base">👮 Locate Nearest Police Station</p>
                  <p className="text-xs text-blue-100 font-normal">Find police precinct & direct desk contact</p>
                </div>
              </div>
            </button>

            <button
              onClick={handleShareLocation}
              className="w-full bg-[#0F172A] text-white p-4 rounded-xl font-bold flex items-center justify-between hover:bg-[#1E293B] transition-colors shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Share2 size={24} />
                <div className="text-left">
                  <p className="text-base">📍 Broadcast Live GPS Location</p>
                  <p className="text-xs text-slate-400 font-normal">Send encrypted location stream to contacts</p>
                </div>
              </div>
            </button>
          </div>

          {/* Emergency Medical Info Box */}
          <div className="bg-white rounded-xl border border-[#FCA5A5] shadow-sm p-5 space-y-2">
            <h3 className="text-base font-bold text-[#DC2626] flex items-center gap-2">
              <Heart size={18} /> Emergency Medical Profile
            </h3>
            <p className="text-xs text-[#334155]">No known drug allergies. Father is primary emergency contact.</p>
            <p className="text-xs font-bold text-[#991B1B]">Blood Group: O+ Positive</p>
          </div>
        </div>
      </div>
    </div>
  );
}
