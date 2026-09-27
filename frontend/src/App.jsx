import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ChildrenPage from './pages/ChildrenPage';
import LiveLocationPage from './pages/LiveLocationPage';
import AlertsPage from './pages/AlertsPage';
import SafeZonesPage from './pages/SafeZonesPage';
import DevicesPage from './pages/DevicesPage';
import EmergencySOSPage from './pages/EmergencySOSPage';
import PoliceStationPage from './pages/PoliceStationPage';
import ReportsPage from './pages/ReportsPage';
import SafetyAnalyticsPage from './pages/SafetyAnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import { Modal } from './components/Modal';
import { ToastNotification } from './components/ToastNotification';
import { Shield, Menu, Bell, Loader2 } from 'lucide-react';
import './styles/layout.css';
import './styles/dashboard.css';
import './styles/pages.css';

export default function App() {
  const location = useLocation();
  const { setMobileMenuOpen, activeAlertCount, isAuthenticated, authLoading } = useApp();

  // Show loading spinner while validating initial auth token
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin text-[#2563EB] mb-3" size={36} />
        <p className="text-sm font-medium text-[#94A3B8]">Validating SafeWatch session...</p>
      </div>
    );
  }

  // Strict Auth Guard: If unauthenticated, render ONLY LoginPage
  if (!isAuthenticated) {
    return (
      <>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Modal />
        <ToastNotification />
      </>
    );
  }

  // If authenticated and user navigates to /login, redirect to /
  if (location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* 1. Desktop & Mobile Sidebar */}
      <Sidebar />

      {/* 2. Main Wrapper with Desktop Sidebar Offset (w-60 = 240px -> lg:pl-60) */}
      <div className="lg:pl-60 flex flex-col min-h-screen">

        {/* Mobile Top Navigation Bar (shows only on < lg screens) */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-[#334155] hover:bg-[#F1F5F9] focus:outline-none"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-[#0F172A] p-1.5 rounded-lg">
                <Shield size={18} className="text-white" />
              </div>
              <span className="font-bold text-[#0F172A] text-lg">SafeWatch</span>
            </div>
          </div>

          {activeAlertCount > 0 && (
            <span className="bg-[#FEE2E2] text-[#DC2626] text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Bell size={12} /> {activeAlertCount}
            </span>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/children" element={<ChildrenPage />} />
            <Route path="/live-location" element={<LiveLocationPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/safe-zones" element={<SafeZonesPage />} />
            <Route path="/devices" element={<DevicesPage />} />
            <Route path="/emergency" element={<EmergencySOSPage />} />
            <Route path="/police-station" element={<PoliceStationPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/safety-analytics" element={<SafetyAnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* Fallback to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* 3. Global Interactive Modals & Toast Notifications */}
      <Modal />
      <ToastNotification />
    </div>
  );
}
