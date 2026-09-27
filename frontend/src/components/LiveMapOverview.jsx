import React from 'react';
import { Home, ChevronRight, Navigation } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LiveMapOverview = () => {
  const { children, navigateTo, toggleDemoMode, isDemoPlaying, openModal, pingBand } = useApp();

  const handleChildPinClick = (child) => {
    openModal({
      title: `${child.name} - Real-time Location Details`,
      body: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img 
              src={child.avatar} 
              alt={child.name} 
              style={{ width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover' }} 
            />
            <div>
              <h4 style={{ margin: 0, fontSize: '16px' }}>{child.name} (Age {child.age})</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>{child.location}</p>
              <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>• {child.bandStatus}</span>
            </div>
          </div>
          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px' }}>
            <div><strong>Assigned Safe Zone:</strong> {child.safeZone}</div>
            <div><strong>Current Battery:</strong> {child.battery}%</div>
            <div><strong>Last GPS Refresh:</strong> {child.lastUpdated}</div>
          </div>
        </div>
      ),
      confirmText: 'Ping GPS Band',
      onConfirm: () => pingBand(child.name, child.device.id),
      secondaryText: 'Open Full Map',
      onSecondary: () => navigateTo('live-location')
    });
  };

  const handleYouClick = () => {
    openModal({
      title: 'Primary Guardian Location (You)',
      body: (
        <div>
          <p style={{ margin: 0, fontSize: '14px', color: '#0F172A' }}>
            <strong>Home Sanctuary:</strong> 742 Evergreen Terrace
          </p>
          <p style={{ marginTop: '8px', fontSize: '13px', color: '#64748B' }}>
            Your device is actively connected to the SafeWatch secure cloud gateway. Both bands report relative proximity to your position.
          </p>
        </div>
      ),
      confirmText: 'Close',
      onConfirm: () => {}
    });
  };

  // Coords offset for Sophia & Liam relative to map container
  const sophiaPos = { top: '56%', left: '46%' };
  const liamPos = { top: '64%', left: '49%' };

  return (
    <div className="map-overview-card">
      <div className="section-card-header">
        <h3 className="section-card-title">Live Map Overview</h3>
        <button 
          className="section-link"
          onClick={() => navigateTo('live-location')}
          id="btn-full-map"
        >
          <span>Full map</span>
          <ChevronRight size={15} strokeWidth={2.2} />
        </button>
      </div>

      <div className="map-canvas-container">
        {/* Stylized SVG Map Grid Roads & Parks matching Figma */}
        <svg className="map-bg-grid" viewBox="0 0 600 310" preserveAspectRatio="none">
          {/* Base terrain */}
          <rect width="600" height="310" fill="#E8EFE9" />
          
          {/* Park green zones */}
          <rect x="360" y="20" width="220" height="140" rx="8" fill="#D5E8D4" opacity="0.75" />
          <rect x="20" y="180" width="160" height="110" rx="8" fill="#D5E8D4" opacity="0.75" />
          <circle cx="280" cy="210" r="45" fill="#D5E8D4" opacity="0.6" />

          {/* Road grid lines */}
          <path d="M 0 90 L 600 90" stroke="#FFFFFF" strokeWidth="14" />
          <path d="M 0 160 L 600 160" stroke="#FFFFFF" strokeWidth="18" />
          <path d="M 0 230 L 600 230" stroke="#FFFFFF" strokeWidth="12" />
          
          <path d="M 120 0 L 120 310" stroke="#FFFFFF" strokeWidth="14" />
          <path d="M 240 0 L 240 310" stroke="#FFFFFF" strokeWidth="18" />
          <path d="M 380 0 L 380 310" stroke="#FFFFFF" strokeWidth="16" />
          <path d="M 500 0 L 500 310" stroke="#FFFFFF" strokeWidth="12" />

          {/* Subtle secondary streets */}
          <path d="M 0 40 L 600 40" stroke="#F1F5F9" strokeWidth="5" />
          <path d="M 0 280 L 600 280" stroke="#F1F5F9" strokeWidth="6" />
          <path d="M 300 0 L 300 310" stroke="#F1F5F9" strokeWidth="6" />
          <path d="M 440 0 L 440 310" stroke="#F1F5F9" strokeWidth="5" />

          {/* River / Water canal accent */}
          <path d="M 0 270 Q 200 250 350 280 T 600 260" fill="none" stroke="#BFDBFE" strokeWidth="8" opacity="0.7" />
        </svg>

        {/* Center Marker: YOU */}
        <div 
          className="map-pin-you" 
          onClick={handleYouClick}
          title="Your Home Sanctuary Location"
        >
          <div className="you-ring-outer">
            <div className="you-circle-inner">
              <Home size={15} strokeWidth={2.5} />
            </div>
          </div>
          <span className="you-pill-label">You</span>
        </div>

        {/* Sophia Chen Marker */}
        {children[0] && (
          <div 
            className="map-pin-child"
            style={{ 
              top: isDemoPlaying ? '52%' : sophiaPos.top, 
              left: isDemoPlaying ? '44%' : sophiaPos.left 
            }}
            onClick={() => handleChildPinClick(children[0])}
            title={`${children[0].name} - ${children[0].location}`}
          >
            <div className="child-safe-ring" />
            <div className="child-marker-badge" style={{ borderColor: '#EC4899' }}>
              <img src={children[0].avatar} alt={children[0].name} />
            </div>
            <span className="child-pin-tag">{children[0].name.split(' ')[0]}</span>
          </div>
        )}

        {/* Liam Torres Marker */}
        {children[1] && (
          <div 
            className="map-pin-child"
            style={{ 
              top: isDemoPlaying ? '68%' : liamPos.top, 
              left: isDemoPlaying ? '53%' : liamPos.left 
            }}
            onClick={() => handleChildPinClick(children[1])}
            title={`${children[1].name} - ${children[1].location}`}
          >
            <div className="child-safe-ring" />
            <div className="child-marker-badge" style={{ borderColor: '#3B82F6' }}>
              <img src={children[1].avatar} alt={children[1].name} />
            </div>
            <span className="child-pin-tag">{children[1].name.split(' ')[0]}</span>
          </div>
        )}

        {/* Bottom indicators matching Figma */}
        <div className="map-footer-bar">
          <div className="map-child-status-pills">
            {children.map((child) => (
              <div 
                key={child.id} 
                className="map-status-pill"
                onClick={() => handleChildPinClick(child)}
              >
                <img src={child.avatar} alt={child.name} className="pill-avatar" />
                <span className="pill-child-name">{child.name}</span>
                <span className="pill-child-loc">{child.location.split(',')[0]}</span>
              </div>
            ))}
          </div>

          <button 
            className="demo-map-btn"
            onClick={toggleDemoMode}
            id="btn-demo-map-view"
            title="Toggle Live GPS tracking movement simulation"
          >
            <Navigation size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            {isDemoPlaying ? 'Pause Simulation' : 'Demo Map View'}
          </button>
        </div>
      </div>
    </div>
  );
};
