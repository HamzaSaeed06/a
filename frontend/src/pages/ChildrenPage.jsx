import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Cpu, UserPlus, User, Loader2 } from 'lucide-react';

export default function ChildrenPage() {
  const { children, activeAlertCount, navigateTo, registerBand } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [childName, setChildName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!childName.trim()) return;
    setLoading(true);
    await registerBand(childName);
    setLoading(false);
    setChildName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">Child Profile</h1>
          <p className="text-sm text-[#64748B] mt-1">{children.length} children registered</p>
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
            <UserPlus size={16} /> Add Child
          </button>
        </div>
      </div>

      {/* Add Child Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-[#0F172A] mb-1">Register New Child Band</h2>
            <p className="text-xs text-[#64748B] mb-4">Enter your child's nickname to register a new SafeWatch GPS Band to your MongoDB account.</p>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#334155] block mb-1">Child / Band Nickname</label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="e.g. Maya Chen"
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                  autoFocus
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
                  disabled={loading || !childName.trim()}
                  className="bg-[#0F172A] text-white px-4 py-2 text-xs font-semibold rounded-lg hover:bg-[#1E293B] disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="animate-spin" size={14} />} Register Band
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Children Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.map((child) => {
          return (
            <div key={child.id} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="h-1 w-full bg-[#2563EB]" />

              <div className="p-5 pb-3">
                <div className="flex items-start gap-4">
                  <img src={child.photo || child.avatar} alt={child.name} className="w-16 h-16 rounded-full object-cover border border-[#E2E8F0]" />
                  <div>
                    <h3 className="text-lg font-semibold text-[#0F172A]">{child.name}</h3>
                    <p className="text-sm text-[#64748B]">Age {child.age || 8}</p>
                  </div>
                </div>
              </div>

              <div className="px-5 flex gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#DBEAFE] text-[#2563EB]">
                  Registered GPS Band
                </span>
                {child.status === 'danger' && (
                  <span className="bg-[#FEE2E2] text-[#DC2626] text-xs font-semibold px-2.5 py-1 rounded-full">
                    ⚠ Warning
                  </span>
                )}
              </div>

              <div className="px-5 py-4 space-y-2.5">
                <div className="flex items-center gap-2 text-sm text-[#64748B]">
                  <MapPin size={15} className="flex-shrink-0" />
                  <span>{child.location || 'Live Telemetry Active'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#64748B]">
                  <Cpu size={15} className="flex-shrink-0" />
                  <span>SafeWatch Pro Band</span>
                  <span className="font-semibold text-[#334155]">
                    {child.batteryPct || 90}% Battery
                  </span>
                </div>
              </div>

              <div className="px-5 pb-5 flex gap-3">
                <button
                  onClick={() => navigateTo('live-location')}
                  className="flex-1 bg-[#0F172A] text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#1E293B] transition-colors"
                >
                  <MapPin size={15} /> Live Location Tracking
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
