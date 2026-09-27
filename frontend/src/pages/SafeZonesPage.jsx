import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Home, School, MapPin, Pencil, Trash2, Loader2 } from 'lucide-react';
import InteractiveMap from '../components/InteractiveMap';

const ZONE_ICONS = { home: Home, school: School, park: MapPin, custom: MapPin };

export default function SafeZonesPage() {
  const { safeZones, activeAlertCount, toggleSafeZone, createSafeZone, children } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [zoneName, setZoneName] = useState('');
  const [radiusM, setRadiusM] = useState(200);
  const [loading, setLoading] = useState(false);

  const activeCount = safeZones.filter((z) => z.status === 'active').length;

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!zoneName.trim()) return;
    setLoading(true);
    await createSafeZone(zoneName, 37.7749, -122.4194, Number(radiusM));
    setLoading(false);
    setZoneName('');
    setShowAddModal(false);
  };

  const childMarkers = children.map((c) => ({
    id: c.id,
    name: c.name,
    status: c.status || 'safe',
    lat: c.coordinates?.lat || 37.7749,
    lng: c.coordinates?.lng || -122.4194,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">Safe Zones</h1>
          <p className="text-sm text-[#64748B] mt-1">{safeZones.length} zones defined · {activeCount} active</p>
        </div>
        <div className="flex items-center gap-3">
          {activeAlertCount > 0 && (
            <span className="bg-[#FEE2E2] text-[#DC2626] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#DC2626] rounded-full" />{activeAlertCount} Active Alerts
            </span>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#0F172A] text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#1E293B] transition-colors"
          >
            <Plus size={16} /> Add Safe Zone
          </button>
        </div>
      </div>

      {/* Add Safe Zone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-[#0F172A] mb-1">Create New Safe Zone</h2>
            <p className="text-xs text-[#64748B] mb-4">Define a geofenced safe boundary for your child's band.</p>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">Zone Name</label>
                <input
                  type="text"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="e.g. Central Park Playground"
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">Safe Radius (meters)</label>
                <input
                  type="number"
                  value={radiusM}
                  onChange={(e) => setRadiusM(e.target.value)}
                  min="50"
                  max="5000"
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !zoneName.trim()}
                  className="bg-[#0F172A] text-white px-4 py-2 text-xs font-semibold rounded-lg hover:bg-[#1E293B] disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="animate-spin" size={14} />} Create Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* Interactive Map */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
          <div className="pb-3">
            <h2 className="text-lg font-semibold text-[#0F172A]">OpenStreetMap Geofence Map</h2>
          </div>
          <InteractiveMap
            center={[37.7749, -122.4194]}
            markers={childMarkers}
            safeZones={safeZones}
          />
        </div>

        {/* Zone List */}
        <div className="space-y-4">
          {safeZones.map((zone) => {
            const Icon = ZONE_ICONS[zone.icon] || MapPin;
            const isActive = zone.status === 'active';
            return (
              <div key={zone.id} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#DCFCE7] p-2.5 rounded-lg">
                      <Icon size={18} className="text-[#16A34A]" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#0F172A]">{zone.name}</h3>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSafeZone(zone.id)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${isActive ? 'bg-[#16A34A]' : 'bg-[#CBD5E1]'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                <div className="flex gap-2 mb-3">
                  <span className="bg-[#DCFCE7] text-[#16A34A] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {zone.radiusM || zone.radiusMeters || 150}m radius
                  </span>
                </div>

                <p className="text-xs text-[#16A34A] mb-3 flex items-center gap-1 font-medium">
                  ✓ Child is inside safe geofence boundary
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
