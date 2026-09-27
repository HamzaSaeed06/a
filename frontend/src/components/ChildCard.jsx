import React from 'react';
import { MapPin, Clock, Wifi } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ChildCard = ({ child }) => {
  const { openModal, pingBand, navigateTo } = useApp();

  const handleCardClick = () => {
    openModal({
      title: `${child.name} Status & Controls`,
      body: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img 
              src={child.avatar} 
              alt={child.name} 
              style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover' }} 
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '17px' }}>{child.name}</h3>
                <span 
                  style={{ 
                    fontSize: '11px', 
                    padding: '2px 8px', 
                    borderRadius: '9999px',
                    backgroundColor: child.ageBg,
                    color: child.ageColor,
                    fontWeight: 600
                  }}
                >
                  Age {child.age}
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B' }}>{child.location}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '13px' }}>
            <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>GPS Band Model</span>
              <strong>{child.device.name}</strong>
            </div>
            <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>Signal Strength</span>
              <strong style={{ color: '#16A34A' }}>{child.device.signal}</strong>
            </div>
            <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>Battery Status</span>
              <strong style={{ color: child.battery < 20 ? '#DC2626' : '#2563EB' }}>
                {child.battery}% {child.battery < 20 ? '(Low Battery)' : ''}
              </strong>
            </div>
            <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>Sensor Clasp</span>
              <strong style={{ color: '#16A34A' }}>{child.device.tamperStatus}</strong>
            </div>
          </div>
        </div>
      ),
      confirmText: 'Ping Band Buzzer',
      onConfirm: () => pingBand(child.name, child.device.id),
      secondaryText: 'Track on Live Map',
      onSecondary: () => navigateTo('live-location')
    });
  };

  return (
    <div 
      className="child-card" 
      onClick={handleCardClick}
      id={`child-card-${child.id}`}
      title={`Click to view details for ${child.name}`}
    >
      <div className="child-card-header">
        <div className="child-header-left">
          <img src={child.avatar} alt={child.name} className="child-avatar" />
          <div className="child-name-badges">
            <div className="child-name-row">
              <span className="child-name">{child.name}</span>
              <span 
                className="child-age-pill"
                style={{ backgroundColor: child.ageBg, color: child.ageColor }}
              >
                Age {child.age}
              </span>
            </div>
            {child.alertActive && (
              <span className="child-alert-pill">
                <span className="badge-dot" style={{ backgroundColor: '#DC2626' }} />
                <span>{child.alertText}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="child-details-list">
        <div className="child-detail-row">
          <MapPin size={14} className="child-detail-icon" />
          <span>{child.location}</span>
        </div>
        <div className="child-detail-row">
          <Clock size={14} className="child-detail-icon" />
          <span>{child.lastUpdated}</span>
        </div>
        <div className="child-detail-row">
          <Wifi size={14} className="child-detail-icon conn-green" />
          <span style={{ color: '#16A34A', fontWeight: 500 }}>{child.bandStatus}</span>
        </div>
      </div>

      <div className="child-battery-row">
        <div className="battery-header">
          <span className="battery-label">Battery</span>
          <span className="battery-percent" style={{ color: child.batteryColor }}>
            {child.battery}%
          </span>
        </div>
        <div className="battery-bar-track">
          <div 
            className="battery-bar-fill" 
            style={{ 
              width: `${child.battery}%`, 
              backgroundColor: child.batteryColor 
            }} 
          />
        </div>
      </div>
    </div>
  );
};
