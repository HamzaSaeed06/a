import React from 'react';
import { Bell, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AlertBanner = () => {
  const { activeAlertCount, navigateTo } = useApp();

  if (activeAlertCount === 0) return null;

  return (
    <div 
      className="alert-banner"
      onClick={() => navigateTo('alerts')}
      role="button"
      tabIndex={0}
      id="alert-banner-box"
    >
      <div className="alert-banner-left">
        <div className="alert-banner-icon-box">
          <Bell size={20} strokeWidth={2.2} />
        </div>
        <div className="alert-banner-text">
          <span className="alert-banner-title">
            {activeAlertCount} Active Alerts Require Attention
          </span>
          <span className="alert-banner-desc">
            Review and take action on pending alerts
          </span>
        </div>
      </div>
      <div className="alert-banner-action">
        <span>View Alerts</span>
        <ChevronRight size={16} strokeWidth={2.2} />
      </div>
    </div>
  );
};
