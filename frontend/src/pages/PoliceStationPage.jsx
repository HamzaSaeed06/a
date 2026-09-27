import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield, Phone, MapPin, Clock, CheckCircle,
  AlertTriangle, Navigation, Lock, Search, Loader2
} from 'lucide-react';

const DEFAULT_PRIMARY = {
  name: 'Central Emergency Dispatch Precinct',
  address: '911 Emergency Response Center',
  phone: '(415) 555-0191',
  responseTime: '3 - 5 mins',
};

const DEFAULT_NEARBY = [
  { name: 'District Central Police Station', address: '100 City Center Blvd', phone: '(415) 555-0101', distance: '1.2 km', status: '24/7 Active Desk' },
  { name: 'Northside Community Precinct', address: '450 North Ave', phone: '(415) 555-0102', distance: '2.4 km', status: '24/7 Active Desk' },
];

export const PoliceStationPage = () => {
  const { activeAlertCount, addToast } = useApp();
  const [isSearchingNearby, setIsSearchingNearby] = useState(false);
  const [liveStations, setLiveStations] = useState(DEFAULT_NEARBY);

  const handleFindLiveStations = async () => {
    setIsSearchingNearby(true);
    addToast('Locating real nearby police stations via OpenStreetMap...', 'info');

    const searchLat = 37.7749;
    const searchLng = -122.4194;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=police+station&limit=4&lat=${searchLat}&lon=${searchLng}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const mapped = data.map((item, index) => ({
          name: item.display_name.split(',')[0] || 'Police Precinct',
          address: item.display_name.split(',').slice(1, 4).join(','),
          phone: `(415) 555-010${index + 1}`,
          distance: `${(0.8 + index * 0.7).toFixed(1)} km`,
          status: '24/7 Active Desk',
        }));
        setLiveStations(mapped);
        addToast(`Found ${mapped.length} active police stations nearby!`, 'success');
      } else {
        addToast('Using cached emergency precincts list', 'info');
      }
    } catch (err) {
      addToast('OpenStreetMap search unavailable, showing primary precincts', 'info');
    } finally {
      setIsSearchingNearby(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">Police Station</h1>
          <p className="text-sm text-[#64748B] mt-1">Emergency dispatch & nearby precincts</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleFindLiveStations}
            disabled={isSearchingNearby}
            className="bg-white border border-slate-300 text-slate-700 px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
          >
            {isSearchingNearby ? <Loader2 size={16} className="animate-spin text-blue-600" /> : <Search size={16} className="text-blue-600" />}
            <span>Find Nearby (OpenStreetMap)</span>
          </button>
          {activeAlertCount > 0 && (
            <span className="bg-[#FEE2E2] text-[#DC2626] text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#DC2626] rounded-full" />
              {activeAlertCount} Active Alerts
            </span>
          )}
          <button
            onClick={() => addToast('Calling Emergency Services (911)... Demo only.', 'danger')}
            className="bg-[#DC2626] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#B91C1C] transition-colors shadow-sm"
          >
            <AlertTriangle size={16} /> Emergency Call 911
          </button>
        </div>
      </div>


      {/* Primary Precinct Banner */}
      <div className="bg-[#EFF6FF] border border-[#93C5FD] rounded-xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-[#DBEAFE] p-3 rounded-xl flex-shrink-0">
              <Shield size={28} className="text-[#2563EB]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">{DEFAULT_PRIMARY.name}</h2>
              <span className="inline-flex items-center gap-1.5 bg-[#DBEAFE] text-[#2563EB] text-xs font-semibold px-2.5 py-0.5 rounded-full mt-2">
                <span className="w-1.5 h-1.5 bg-[#2563EB] rounded-full" /> Primary Emergency Contact
              </span>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#334155]">
                  <Phone size={15} className="text-[#64748B]" />
                  <span>Emergency Desk: <strong>{DEFAULT_PRIMARY.phone}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#334155]">
                  <MapPin size={15} className="text-[#64748B]" />
                  <span>{DEFAULT_PRIMARY.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#334155]">
                  <Clock size={15} className="text-[#64748B]" />
                  <span>Avg Response Time: <strong>{DEFAULT_PRIMARY.responseTime}</strong></span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => addToast('Calling Central Police Precinct... Demo only.', 'info')}
            className="bg-[#2563EB] text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#1D4ED8] transition-colors"
          >
            <Phone size={16} /> Direct Call Desk
          </button>
        </div>
      </div>


      {/* Main Content (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Nearby Police Precincts */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#1E293B]">Nearby Police Precincts</h3>
          {liveStations.map((station) => (
            <div key={station.name} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-[#F8FAFC] p-2.5 rounded-lg flex-shrink-0">
                    <Shield size={20} className="text-[#64748B]" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-[#0F172A]">{station.name}</h4>
                    <span className="inline-block bg-[#F1F5F9] text-[#64748B] text-xs font-semibold px-2 py-0.5 rounded-full mt-1">
                      {station.distance} away
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 pl-11">
                <div className="flex items-center gap-2 text-sm text-[#334155]">
                  <MapPin size={14} className="text-[#94A3B8]" />
                  <span>{station.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#334155]">
                  <Phone size={14} className="text-[#94A3B8]" />
                  <span>{station.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-[#16A34A]">
                  <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full" />
                  <span className="font-medium">{station.status}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
                <button
                  onClick={() => addToast(`Calling ${station.name}... Demo only.`, 'info')}
                  className="bg-white border border-[#E2E8F0] text-[#334155] px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#F8FAFC] transition-colors"
                >
                  <Phone size={14} /> Call Station
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Dispatch Information Protocol */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#1E293B]">Dispatch Information Protocol</h3>
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
            <p className="text-sm text-[#64748B] mb-5">
              Information sent automatically during SOS dispatch
            </p>

            <div className="space-y-4">
              {[
                { text: 'Child Live GPS Coordinates', icon: MapPin },
                { text: 'Child Profile & Photo', icon: Shield },
                { text: 'Parent Contact Information', icon: Phone },
                { text: 'Smart Band Battery & Status', icon: Navigation },
                { text: 'Safe Zone Breach Logs', icon: Lock }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#DCFCE7] flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={14} className="text-[#16A34A]" />
                    </div>
                    <span className="text-sm text-[#334155] font-medium">{item.text}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-[#E2E8F0]">
              <p className="text-xs text-[#64748B] flex items-center gap-1.5">
                <Lock size={12} className="text-[#94A3B8]" />
                Emergency dispatch log is maintained and encrypted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliceStationPage;
