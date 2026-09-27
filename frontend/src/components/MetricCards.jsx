import React from 'react';
import { Smile, Bell, Cpu, BatteryCharging } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MetricCards = () => {
  const { children, activeAlertCount, navigateTo, openModal } = useApp();

  const totalChildren = children.length;
  const connectedBands = children.filter((c) => c.bandConnected).length;
  const avgBattery = Math.round(
    children.reduce((acc, curr) => acc + curr.battery, 0) / (totalChildren || 1)
  );

  const handleBatteryClick = () => {
    openModal({
      title: 'Battery Diagnostics Breakdown',
      body: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {children.map((c) => (
            <div 
              key={c.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '12px',
                background: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={c.avatar} alt={c.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{c.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Band {c.device.id}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontWeight: 700, color: c.battery < 20 ? '#DC2626' : '#16A34A' }}>
                  {c.battery}%
                </span>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  {c.battery < 20 ? 'Low Battery Warning' : 'Healthy charge'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
      confirmText: 'Done',
      onConfirm: () => {}
    });
  };

  return (
    <div className="metrics-grid">
      {/* 1. Total Children */}
      <div 
        className="metric-card card-blue" 
        onClick={() => navigateTo('children')}
        id="metric-total-children"
      >
        <div className="metric-top">
          <span className="metric-label">TOTAL CHILDREN</span>
          <div className="metric-icon-circle icon-blue">
            <Smile size={16} strokeWidth={2} />
          </div>
        </div>
        <div className="metric-value val-dark">{totalChildren}</div>
        <div className="metric-subtitle">Monitored profiles</div>
      </div>

      {/* 2. Active Alerts */}
      <div 
        className="metric-card card-red" 
        onClick={() => navigateTo('alerts')}
        id="metric-active-alerts"
      >
        <div className="metric-top">
          <span className="metric-label">ACTIVE ALERTS</span>
          <div className="metric-icon-circle icon-red">
            <Bell size={16} strokeWidth={2} />
          </div>
        </div>
        <div className="metric-value val-red">{activeAlertCount}</div>
        <div className="metric-subtitle">Needs attention</div>
      </div>

      {/* 3. Band Status */}
      <div 
        className="metric-card card-green" 
        onClick={() => navigateTo('devices')}
        id="metric-band-status"
      >
        <div className="metric-top">
          <span className="metric-label">BAND STATUS</span>
          <div className="metric-icon-circle icon-green">
            <Cpu size={16} strokeWidth={2} />
          </div>
        </div>
        <div className="metric-value val-green">{connectedBands}/{totalChildren}</div>
        <div className="metric-subtitle">Bands connected</div>
      </div>

      {/* 4. Avg Battery */}
      <div 
        className="metric-card card-green" 
        onClick={handleBatteryClick}
        id="metric-avg-battery"
      >
        <div className="metric-top">
          <span className="metric-label">AVG BATTERY</span>
          <div className="metric-icon-circle icon-green">
            <BatteryCharging size={16} strokeWidth={2} />
          </div>
        </div>
        <div className="metric-value val-green">{avgBattery}%</div>
        <div className="metric-subtitle">Battery levels</div>
      </div>
    </div>
  );
};
