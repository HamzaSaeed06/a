import React from 'react';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Header({ title = 'Dashboard', onOpenSidebar }) {
  const { activeAlertCount, setMobileMenuOpen } = useApp();
  const handleOpen = onOpenSidebar || (() => setMobileMenuOpen(true));

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-header">
        <button 
          className="mobile-menu-btn" 
          onClick={handleOpen}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <span style={{ fontWeight: 700, fontSize: '16px' }}>SafeWatch</span>
        <Link 
          to="/alerts"
          style={{ 
            background: '#FEF2F2', 
            color: '#DC2626', 
            borderRadius: '9999px', 
            padding: '4px 10px', 
            fontSize: '11px', 
            fontWeight: 700 
          }}
        >
          {activeAlertCount} Alerts
        </Link>
      </div>

      {/* Main dashboard title row */}
      <div className="dashboard-header-row" style={{ padding: '4px 0 16px' }}>
        <h1 className="dashboard-title">{title}</h1>
        {activeAlertCount > 0 && (
          <Link 
            to="/alerts"
            className="header-alert-pill"
            id="header-alert-badge"
            title="Click to view all active alerts"
          >
            <span className="alert-dot" />
            <span>{activeAlertCount} Active Alerts</span>
          </Link>
        )}
      </div>
    </>
  );
}
export { Header };
