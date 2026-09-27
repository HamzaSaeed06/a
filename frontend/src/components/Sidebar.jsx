import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield, LayoutDashboard, Users, MapPin, Bell, Watch,
  AlertTriangle, Building2, FileText, BarChart3, Settings,
  X, LogOut
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: '/' },
  { id: 'children', label: 'Children', icon: Users, route: '/children' },
  { id: 'live-location', label: 'Live Location', icon: MapPin, route: '/live-location' },
  { id: 'alerts', label: 'Alerts', icon: Bell, route: '/alerts', showBadge: true },
  { id: 'safe-zones', label: 'Safe Zones', icon: Shield, route: '/safe-zones' },
  { id: 'devices', label: 'Devices', icon: Watch, route: '/devices' },
  { id: 'emergency', label: 'Emergency / SOS', icon: AlertTriangle, route: '/emergency' },
  { id: 'police-station', label: 'Police Station', icon: Building2, route: '/police-station' },
  { id: 'reports', label: 'Reports', icon: FileText, route: '/reports' },
  { id: 'safety-analytics', label: 'Safety Analytics', icon: BarChart3, route: '/safety-analytics' },
  { id: 'settings', label: 'Settings', icon: Settings, route: '/settings' },
];

export default function Sidebar() {
  const { activeTab, navigateTo, activeAlertCount, currentUser, mobileMenuOpen, setMobileMenuOpen, logout } = useApp();

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside className={`
        fixed top-0 left-0 h-screen w-60 bg-white border-r border-[#E2E8F0]
        flex flex-col z-50 transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-4 border-b border-[#F1F5F9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#0F172A] p-2 rounded-xl shadow-sm">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#0F172A] tracking-tight leading-tight">SafeWatch</h1>
              <p className="text-xs text-[#64748B]">Child Safety System</p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9]"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'dashboard' && activeTab === 'dashboard');
            const isEmergency = item.id === 'emergency';

            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? isEmergency
                      ? 'bg-[#DC2626] text-white shadow-sm font-semibold'
                      : 'bg-[#0F172A] text-white shadow-sm font-semibold'
                    : isEmergency
                      ? 'text-[#DC2626] hover:bg-[#FEF2F2]'
                      : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : isEmergency ? 'text-[#DC2626]' : 'text-[#64748B]'} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.showBadge && activeAlertCount > 0 && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-[#DC2626]' : 'bg-[#FEE2E2] text-[#DC2626]'
                  }`}>
                    {activeAlertCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Logout Footer */}
        <div className="border-t border-[#E2E8F0] p-3.5 flex items-center justify-between gap-2">
          <button
            onClick={() => navigateTo('settings')}
            className="flex-1 flex items-center gap-2.5 hover:bg-[#F8FAFC] rounded-xl p-1.5 transition-colors text-left min-w-0"
          >
            <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#0F172A] truncate leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-[#64748B] truncate">{currentUser.email || 'Parent Account'}</p>
            </div>
          </button>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors flex-shrink-0"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}
