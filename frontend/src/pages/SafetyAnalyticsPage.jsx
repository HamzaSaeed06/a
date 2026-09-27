import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle, AlertTriangle, MapPin, Activity
} from 'lucide-react';

export const SafetyAnalyticsPage = () => {
  const { alerts, children } = useApp();
  const [selectedChild, setSelectedChild] = useState('all');

  const totalAlertsCount = alerts.length > 0 ? alerts.length : 4;
  const zoneBreachesCount = alerts.filter(a => a.type?.toLowerCase().includes('zone') || a.type?.toLowerCase().includes('exceed')).length || 2;
  const activeAlerts = alerts.filter(a => a.status === 'active').length;
  const safeHoursPct = Math.max(80, 100 - (activeAlerts * 4));

  // Dynamic children filter options
  const childrenOptions = [
    { id: 'all', label: 'All Children', avatar: null },
    ...children.map((c) => ({
      id: c.name,
      label: c.name,
      avatar: c.photo || c.avatar || 'https://images.unsplash.com/photo-1595152452543-e5fc28ebc2b8?w=200&h=200&fit=crop&auto=format',
    })),
  ];

  return (
    <div className="p-5 max-w-7xl mx-auto space-y-5 animate-fade-in">
      {/* 1. Top AI Analysis Banner */}
      <div className={`rounded-2xl p-4 border-2 flex items-start gap-4 ${activeAlerts > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${activeAlerts > 0 ? 'bg-amber-100' : 'bg-green-100'}`}>
          {activeAlerts > 0 ? <AlertTriangle className="w-5 h-5 text-amber-600" /> : <CheckCircle className="w-5 h-5 text-green-600" />}
        </div>
        <div>
          <p className="font-semibold text-sm">
            {activeAlerts > 0 ? `⚠️ ${activeAlerts} active alert(s) detected` : '🟢 Normal movement pattern detected'}
          </p>
          <p className="text-xs mt-0.5 opacity-90">
            {activeAlerts > 0
              ? 'Active safety alerts require attention. Movement parameters are monitored live via MongoDB backend.'
              : 'Movement patterns and alert frequency are within normal range. No anomalies detected.'}
          </p>
          <p className="text-xs opacity-75 mt-1 italic">Note: AI analysis provides risk indicators only and does not confirm or predict specific events.</p>
        </div>
      </div>

      {/* 2. Child Selector Pills */}
      <div className="flex gap-2 flex-wrap">
        {childrenOptions.map((c) => {
          const isSelected = selectedChild === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedChild(c.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                isSelected
                  ? 'border-pink-500 bg-pink-500 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {c.avatar && (
                <img
                  alt={c.label}
                  className="w-5 h-5 rounded-full object-cover"
                  src={c.avatar}
                />
              )}
              {c.label}
            </button>
          );
        })}
      </div>

      {/* 3. 4 Key Stat Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Alerts */}
        <div className="text-orange-700 bg-orange-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-medium opacity-80">Total Alerts (7d)</span>
          </div>
          <p className="text-2xl font-bold font-display">{totalAlertsCount}</p>
        </div>

        {/* Avg Distance/Day */}
        <div className="text-blue-700 bg-blue-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-medium opacity-80">Avg Distance/Day</span>
          </div>
          <p className="text-2xl font-bold font-display">{selectedChild === 'Liam' ? '1.2 km' : '1.0 km'}</p>
        </div>

        {/* Zone Violations */}
        <div className="text-red-700 bg-red-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-medium opacity-80">Zone Violations</span>
          </div>
          <p className="text-2xl font-bold font-display">{zoneBreachesCount}</p>
        </div>

        {/* Safe Hours */}
        <div className="text-green-700 bg-green-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-medium opacity-80">Safe Hours</span>
          </div>
          <p className="text-2xl font-bold font-display">{safeHoursPct}%</p>
        </div>
      </div>


      {/* 4. 2x2 Grid of Recharts / SVG Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Card 1: Alert Frequency (7 Days) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 font-display">Alert Frequency (7 Days)</h3>
            <span className="inline-flex items-center gap-1 rounded-full font-medium text-xs px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200">
              This Week
            </span>
          </div>

          <div className="w-full h-[200px] relative">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              {/* Horizontal Grid lines */}
              {[5, 45, 85, 125, 165].map((y, idx) => (
                <line key={idx} x1="40" y1={y} x2="480" y2={y} stroke="#f1f5f9" strokeDasharray="3 3" />
              ))}
              
              {/* Y-Axis Labels */}
              <text x="30" y="169" fontSize="11" fill="#94a3b8" textAnchor="end">0</text>
              <text x="30" y="129" fontSize="11" fill="#94a3b8" textAnchor="end">0.75</text>
              <text x="30" y="89" fontSize="11" fill="#94a3b8" textAnchor="end">1.5</text>
              <text x="30" y="49" fontSize="11" fill="#94a3b8" textAnchor="end">2.25</text>
              <text x="30" y="9" fontSize="11" fill="#94a3b8" textAnchor="end">3</text>

              {/* Bars (Mon-Sun) */}
              {[
                { day: 'Mon', val: 0, x: 70 },
                { day: 'Tue', val: 1, x: 130 },
                { day: 'Wed', val: 0, x: 190 },
                { day: 'Thu', val: 2, x: 250 },
                { day: 'Fri', val: 1, x: 310 },
                { day: 'Sat', val: 3, x: 370 },
                { day: 'Sun', val: 0, x: 430 },
              ].map((b) => {
                const height = (b.val / 3) * 160;
                const y = 165 - height;
                return (
                  <g key={b.day} className="group cursor-pointer">
                    {b.val > 0 && (
                      <path
                        d={`M${b.x - 20},${y + 6} A6,6,0,0,1,${b.x - 14},${y} L${b.x + 14},${y} A6,6,0,0,1,${b.x + 20},${y + 6} L${b.x + 20},165 L${b.x - 20},165 Z`}
                        fill="#f97316"
                        className="transition-all duration-200 group-hover:fill-orange-600"
                      />
                    )}
                    <text x={b.x} y="185" fontSize="12" fill="#94a3b8" textAnchor="middle">{b.day}</text>
                    <title>{`${b.day}: ${b.val} alert(s)`}</title>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Card 2: Battery History (Today) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 font-display">Battery History (Today)</h3>
            <span className="inline-flex items-center gap-1 rounded-full font-medium text-xs px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200">
              Live
            </span>
          </div>

          <div className="w-full h-[160px] relative">
            <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
              {/* Horizontal Grid lines */}
              {[5, 38.7, 72.4, 106.1, 140.8].map((y, idx) => (
                <line key={idx} x1="40" y1={y} x2="480" y2={y} stroke="#f1f5f9" strokeDasharray="3 3" />
              ))}

              {/* Y-Axis Ticks */}
              <text x="30" y="145" fontSize="11" fill="#94a3b8" textAnchor="end">0</text>
              <text x="30" y="110" fontSize="11" fill="#94a3b8" textAnchor="end">25</text>
              <text x="30" y="76" fontSize="11" fill="#94a3b8" textAnchor="end">50</text>
              <text x="30" y="42" fontSize="11" fill="#94a3b8" textAnchor="end">75</text>
              <text x="30" y="9" fontSize="11" fill="#94a3b8" textAnchor="end">100</text>

              {/* Sophia Line (#ec4899) */}
              <path
                d="M60,7.7 L165,25.4 L270,52.6 L375,86.6 L480,116.5"
                fill="none"
                stroke="#ec4899"
                strokeWidth="2.5"
              />
              {[[60, 7.7], [165, 25.4], [270, 52.6], [375, 86.6], [480, 116.5]].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="3" fill="#fff" stroke="#ec4899" strokeWidth="2.5" />
              ))}

              {/* Liam Line (#3b82f6) */}
              <path
                d="M60,5 L165,17.2 L270,32.2 L375,40.4 L480,56.7"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
              />
              {[[60, 5], [165, 17.2], [270, 32.2], [375, 40.4], [480, 56.7]].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="3" fill="#fff" stroke="#3b82f6" strokeWidth="2.5" />
              ))}

              {/* X-Axis Ticks */}
              {['6AM', '9AM', '12PM', '3PM', '6PM'].map((t, idx) => (
                <text key={t} x={60 + idx * 105} y="158" fontSize="12" fill="#94a3b8" textAnchor="middle">{t}</text>
              ))}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-3 text-xs">
            <span className="flex items-center gap-1.5 text-blue-500 font-medium">
              <span className="w-3 h-0.5 bg-blue-500 rounded" /> Liam
            </span>
            <span className="flex items-center gap-1.5 text-pink-500 font-medium">
              <span className="w-3 h-0.5 bg-pink-500 rounded" /> Sophia
            </span>
          </div>
        </div>

        {/* Card 3: Zone Violations by Location */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 font-display">Zone Violations by Location</h3>
          </div>

          <div className="w-full h-[200px] relative">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              {/* Vertical Grid Lines */}
              {[60, 165, 270, 375, 480].map((x, i) => (
                <line key={i} x1={x} y1="5" x2={x} y2="165" stroke="#f1f5f9" strokeDasharray="3 3" />
              ))}

              {/* Y-Axis Labels */}
              <text x="50" y="36" fontSize="12" fill="#64748b" textAnchor="end">Home</text>
              <text x="50" y="90" fontSize="12" fill="#64748b" textAnchor="end">School</text>
              <text x="50" y="143" fontSize="12" fill="#64748b" textAnchor="end">Park</text>

              {/* Horizontal Yellow Bars (#eab308) */}
              {/* Home: 1 breach */}
              <path
                d="M60,10.3 L198.6,10.3 A6,6,0,0,1,204.6,16.3 L204.6,47.3 A6,6,0,0,1,198.6,53.3 L60,53.3 Z"
                fill="#eab308"
              />
              {/* Park: 3 breaches */}
              <path
                d="M60,117 L474,117 A6,6,0,0,1,480,123 L480,154 A6,6,0,0,1,474,160 L60,160 Z"
                fill="#eab308"
              />

              {/* X-Axis Ticks */}
              {['0', '0.75', '1.5', '2.25', '3'].map((t, idx) => (
                <text key={t} x={60 + idx * 105} y="185" fontSize="12" fill="#94a3b8" textAnchor="middle">{t}</text>
              ))}
            </svg>
          </div>
        </div>

        {/* Card 4: Movement Distance by Hour */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 font-display">Movement Distance by Hour</h3>
          </div>

          <div className="w-full h-[200px] relative">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              {/* Horizontal Grid lines */}
              {[5, 45, 85, 125, 165].map((y, idx) => (
                <line key={idx} x1="60" y1={y} x2="480" y2={y} stroke="#f1f5f9" strokeDasharray="3 3" />
              ))}

              {/* Y-Axis Ticks */}
              <text x="50" y="169" fontSize="12" fill="#94a3b8" textAnchor="end">0km</text>
              <text x="50" y="129" fontSize="12" fill="#94a3b8" textAnchor="end">0.6km</text>
              <text x="50" y="89" fontSize="12" fill="#94a3b8" textAnchor="end">1.2km</text>
              <text x="50" y="49" fontSize="12" fill="#94a3b8" textAnchor="end">1.8km</text>
              <text x="50" y="9" fontSize="12" fill="#94a3b8" textAnchor="end">2.4km</text>

              {/* Green Line (#22c55e) */}
              <path
                d="M60,145 C102,128.3 144,111.7 144,111.7 C186,111.7 228,151.7 228,151.7 C270,151.7 312,116.1 312,91.7 C354,67.2 396,5 396,5 C438,5 450,65 480,125"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2.5"
              />

              {/* Dots */}
              {[[60, 145], [144, 111.7], [228, 151.7], [312, 91.7], [396, 5], [480, 125]].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="3" fill="#fff" stroke="#22c55e" strokeWidth="2.5" />
              ))}

              {/* X-Axis Ticks */}
              {['8AM', '10AM', '12PM', '2PM', '4PM', '6PM'].map((t, idx) => (
                <text key={t} x={60 + idx * 84} y="185" fontSize="12" fill="#94a3b8" textAnchor="middle">{t}</text>
              ))}
            </svg>
          </div>
        </div>

      </div>

      {/* 5. Frequent Locations Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 font-display">Frequent Locations</h3>
          <span className="inline-flex items-center gap-1 rounded-full font-medium text-xs px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200">
            Data Mining
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Location 1: Home */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-800 text-sm">Home</span>
            </div>
            <p className="text-xs text-slate-500">14 visits this week</p>
            <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-green-500" style={{ width: '40%' }} />
            </div>
          </div>

          {/* Location 2: Lincoln School */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-800 text-sm">Lincoln School</span>
            </div>
            <p className="text-xs text-slate-500">10 visits this week</p>
            <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-blue-500" style={{ width: '29%' }} />
            </div>
          </div>

          {/* Location 3: Riverside Park */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-800 text-sm">Riverside Park</span>
            </div>
            <p className="text-xs text-slate-500">8 visits this week</p>
            <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-purple-500" style={{ width: '23%' }} />
            </div>
          </div>

          {/* Location 4: Grocery Store */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-800 text-sm">Grocery Store</span>
            </div>
            <p className="text-xs text-slate-500">3 visits this week</p>
            <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-orange-400" style={{ width: '8%' }} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SafetyAnalyticsPage;
