import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, MapPin, Clock, X, CheckCircle, Wifi } from 'lucide-react';

export default function AlertsPage() {
  const { alerts, activeAlertCount, children, resolveAlert, dismissAlert } = useApp();
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const resolvedCount = alerts.filter(a => a.status === 'resolved').length;
  const dismissedCount = alerts.filter(a => a.status === 'dismissed').length;
  const filtered = alerts.filter(a => a.childName.toLowerCase().includes(searchTerm.toLowerCase()) || a.type.toLowerCase().includes(searchTerm.toLowerCase()));

  const statusBadge = (status) => {
    const styles = { active: 'bg-status-redBg text-status-redText', resolved: 'bg-status-greenBg text-status-greenText', dismissed: 'bg-surface-page text-txt-muted' };
    return styles[status] || styles.dismissed;
  };

  const selected = selectedAlert ? alerts.find(a => a.id === selectedAlert) : null;
  const selChild = selected ? children.find(c => c.id === selected.childId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-txt-primary">Alert Center</h1>
        {activeAlertCount > 0 && (
          <span className="bg-status-redBg text-status-redText text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-status-redText rounded-full" />{activeAlertCount} Active Alerts
          </span>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active', value: activeAlertCount, color: 'text-status-redText' },
          { label: 'Resolved', value: resolvedCount, color: 'text-status-greenText' },
          { label: 'Dismissed', value: dismissedCount, color: 'text-txt-muted' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-surface-border shadow-sm p-4 text-center">
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-sm text-txt-muted">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-light" />
          <input type="text" placeholder="Search alerts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-surface-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue" />
        </div>
        <select className="border border-surface-border rounded-lg px-3 py-2.5 text-sm bg-white text-txt-body focus:outline-none">
          <option>All types</option>
        </select>
      </div>

      {/* Alert List + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* List */}
        <div className="space-y-3">
          {filtered.map(alert => (
            <button key={alert.id} onClick={() => setSelectedAlert(alert.id)}
              className={`w-full text-left bg-white rounded-xl border shadow-sm p-4 transition-all hover:border-brand-blue ${selectedAlert === alert.id ? 'border-brand-blue ring-1 ring-brand-blue/20' : 'border-surface-border'}`}
            >
              <div className="flex items-start gap-3">
                <img src={alert.avatar} alt={alert.childName} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-txt-primary">{alert.childName}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: alert.typeBg, color: alert.typeColor }}>
                      ● {alert.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-txt-muted">
                    <span className="flex items-center gap-1"><Clock size={12} />{alert.timestamp}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} />{alert.location}</span>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${statusBadge(alert.status)}`}>
                  {alert.status}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        {selected && selChild ? (
          <div className="bg-white rounded-xl border border-surface-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-txt-secondary">Alert Details</h3>
              <button onClick={() => setSelectedAlert(null)} className="text-txt-muted hover:text-txt-primary"><X size={18} /></button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <img src={selChild.avatar} alt={selChild.name} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="text-base font-semibold text-txt-primary">{selChild.name}</p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: selChild.ageBg, color: selChild.ageColor }}>Age {selChild.age}</span>
              </div>
            </div>
            <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: selected.typeBg + '40', borderColor: selected.typeBg, borderWidth: 1 }}>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: selected.typeBg, color: selected.typeColor }}>● {selected.type}</span>
              <p className="text-sm text-txt-body mt-2">{selected.details}</p>
            </div>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2 text-txt-muted"><Clock size={14} />{selected.timestamp}</div>
              <div className="flex items-center gap-2 text-txt-muted"><MapPin size={14} />{selected.location}</div>
              <div className="flex items-center gap-2">
                <Wifi size={14} className="text-txt-muted" />
                <span className="bg-status-greenBg text-status-greenText text-xs font-semibold px-2 py-0.5 rounded-full">● Connected</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-txt-muted">Status:</span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusBadge(selected.status)}`}>{selected.status}</span>
            </div>
            {selected.status === 'active' && (
              <button onClick={() => resolveAlert(selected.id)}
                className="w-full bg-brand-blue text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors">
                <CheckCircle size={16} /> Mark as Resolved
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-surface-border shadow-sm p-6 flex items-center justify-center h-[200px]">
            <p className="text-sm text-txt-muted">Select an alert to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
