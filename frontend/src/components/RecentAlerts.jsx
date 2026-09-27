import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RecentAlerts = () => {
  const { alerts, navigateTo, openModal, resolveAlert, pingBand } = useApp();

  const handleAlertClick = (alert) => {
    openModal({
      title: `Alert: ${alert.type} (${alert.childName})`,
      body: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src={alert.avatar} 
              alt={alert.childName} 
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} 
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>{alert.childName}</div>
              <div style={{ fontSize: '13px', color: '#64748B' }}>{alert.location} • {alert.timestamp}</div>
            </div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '13.5px' }}>
            <div style={{ marginBottom: '6px' }}>
              <strong>Alert Type:</strong>{' '}
              <span 
                style={{ 
                  background: alert.typeBg, 
                  color: alert.typeColor, 
                  padding: '2px 8px', 
                  borderRadius: '9999px',
                  fontWeight: 600,
                  fontSize: '11px'
                }}
              >
                {alert.type}
              </span>
            </div>
            <div><strong>Status:</strong> {alert.status === 'resolved' ? 'Resolved by Guardian' : 'Pending Action'}</div>
            <p style={{ marginTop: '8px', color: '#475569' }}>{alert.details}</p>
          </div>
        </div>
      ),
      confirmText: alert.status === 'resolved' ? 'Close' : 'Mark as Resolved',
      onConfirm: () => {
        if (alert.status !== 'resolved') {
          resolveAlert(alert.id);
        }
      },
      secondaryText: 'Locate on Map',
      onSecondary: () => navigateTo('live-location')
    });
  };

  return (
    <div className="recent-alerts-card">
      <div className="section-card-header">
        <h3 className="section-card-title">Recent Alerts</h3>
        <button 
          className="section-link"
          onClick={() => navigateTo('alerts')}
          id="btn-view-all-alerts"
        >
          <span>View all</span>
        </button>
      </div>

      <div className="alerts-list">
        {alerts.slice(0, 4).map((alert) => (
          <div 
            key={alert.id} 
            className="alert-item-row"
            onClick={() => handleAlertClick(alert)}
            id={`alert-row-${alert.id}`}
            title="Click to view alert details and take action"
          >
            <div className="alert-item-left">
              <img src={alert.avatar} alt={alert.childName} className="alert-avatar" />
              <div className="alert-info">
                <div className="alert-title-badges">
                  <span className="alert-child-name">{alert.childName}</span>
                  
                  {/* Type Badge */}
                  <span 
                    className="alert-type-badge"
                    style={{ backgroundColor: alert.typeBg, color: alert.typeColor }}
                  >
                    <span className="badge-dot" style={{ backgroundColor: alert.typeColor }} />
                    <span>{alert.type}</span>
                  </span>

                  {/* Resolved Badge if resolved */}
                  {alert.isResolved && (
                    <span className="alert-resolved-badge">
                      Resolved
                    </span>
                  )}
                </div>

                <div className="alert-meta">
                  {alert.location} • {alert.timestamp}
                </div>
              </div>
            </div>

            <div className="alert-item-right">
              <ChevronRight size={18} strokeWidth={2} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
