import React, { useState } from 'react';
import { RotateCw, Navigation, Home, School, User } from 'lucide-react';

export default function MapView({ childName = "Sophia Chen" }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState("just now");

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshed("just now");
    }, 600);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 flex flex-col justify-between">
      {/* Top Map Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            {childName}'s Location
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Last refreshed: {lastRefreshed}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RotateCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => alert(`Starting navigation to ${childName}'s location`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5 text-slate-500" />
            <span>Navigate</span>
          </button>
        </div>
      </div>

      {/* Map View Canvas */}
      <div className="relative w-full aspect-[4/3] md:aspect-[16/10] rounded-2xl overflow-hidden bg-[#eef4ee] border border-[#d6e5d8] select-none">
        {/* Subtle Map Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(180, 205, 185, 0.45) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(180, 205, 185, 0.45) 1px, transparent 1px)
            `,
            backgroundSize: '36px 36px',
          }}
        />

        {/* Major Roads / Grid Lines matching the Figma layout */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Main vertical boulevard */}
          <div className="absolute top-0 bottom-0 left-[51%] w-7 bg-white/70 border-x border-[#cde0d1]" />
          
          {/* Main horizontal avenue */}
          <div className="absolute left-0 right-0 top-[56%] h-7 bg-white/70 border-y border-[#cde0d1]" />

          {/* Secondary streets */}
          <div className="absolute top-0 bottom-0 left-[26%] w-4 bg-white/50 border-x border-[#dbe8de]" />
          <div className="absolute top-0 bottom-0 left-[78%] w-4 bg-white/50 border-x border-[#dbe8de]" />
          <div className="absolute left-0 right-0 top-[31%] h-4 bg-white/50 border-y border-[#dbe8de]" />
          <div className="absolute left-0 right-0 top-[77%] h-4 bg-white/50 border-y border-[#dbe8de]" />
        </div>

        {/* Map Elements Layer */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Safe Zone Circle: Lincoln Elementary */}
          <div className="absolute top-[46%] left-[45%] w-36 h-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-emerald-400 bg-emerald-100/25 flex items-center justify-center">
            <span className="absolute bottom-2 text-[10px] font-semibold text-emerald-800 bg-white/75 px-1.5 py-0.5 rounded shadow-xs">
              Lincoln Elementary
            </span>
          </div>

          {/* Safe Zone Circle: Home */}
          <div className="absolute top-[51%] left-[58%] w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-emerald-500 bg-emerald-200/20 flex flex-col items-center justify-center">
            <Home className="w-3.5 h-3.5 text-emerald-600 mb-0.5 opacity-80" />
            <span className="text-[9px] font-semibold text-emerald-700 leading-none">Home</span>
          </div>

          {/* Child Location Marker: Sophia Chen */}
          <div className="absolute top-[48%] left-[46%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 pointer-events-auto group cursor-pointer">
            {/* Pulsing Aura */}
            <div className="relative flex items-center justify-center">
              <span className="absolute w-12 h-12 rounded-full bg-pink-400/40 animate-ping opacity-75" />
              <span className="absolute w-10 h-10 rounded-full bg-rose-500/25 ring-2 ring-pink-500/60" />
              
              {/* Center Navy Pin */}
              <div className="w-8 h-8 rounded-full bg-slate-950 border-2 border-white shadow-md flex items-center justify-center text-white transition-transform group-hover:scale-110">
                <Home className="w-4 h-4 fill-white" />
              </div>
            </div>

            {/* Pointer / Tag */}
            <div className="mt-1 px-2 py-0.5 rounded-full bg-white/95 border border-pink-200 shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
              <span className="text-[10px] font-bold text-slate-800">{childName}</span>
            </div>
          </div>

          {/* Parent Location Marker: "You" */}
          <div className="absolute top-[55%] left-[46%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center pointer-events-auto">
            <div className="w-5 h-5 rounded-full bg-slate-900 border-2 border-white shadow-sm flex items-center justify-center text-white">
              <User className="w-2.5 h-2.5" />
            </div>
            <span className="text-[9px] font-bold text-slate-700 bg-white/90 px-1 rounded shadow-xs mt-0.5 border border-slate-200">
              You
            </span>
          </div>
        </div>

        {/* Demo Map View Badge */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-md px-2.5 py-1 text-[11px] font-medium text-slate-500 shadow-xs">
          Demo Map View
        </div>
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-950 inline-block" />
          <span>Your location</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" />
          <span>{childName}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border-2 border-dashed border-emerald-500 inline-block" />
          <span>Safe zone</span>
        </div>
      </div>
    </div>
  );
}

