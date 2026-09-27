import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Phone,
  Shield,
  Share2,
  MapPin,
  Clock,
  ChevronRight,
  HeartPulse,
  User,
  AlertCircle,
  Radio
} from 'lucide-react';

export default function Emergency() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(
      "EMERGENCY ALERT: Liam Torres (Age 10) triggered an alert at Elm Street & 5th Ave at 3:42 PM. Live Coordinates: https://safewatch.app/track/liam-sos"
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const emergencyTypes = [
    {
      title: 'Safe Range Exceeded',
      desc: 'Child has moved outside designated safe area.',
      dotColor: 'bg-amber-400',
      isTriangle: false,
    },
    {
      title: 'Band Removed / Tampered',
      desc: 'Band strap sensor detected removal or tampering.',
      dotColor: 'bg-orange-500',
      isTriangle: false,
    },
    {
      title: 'SOS Pressed',
      desc: 'Child has pressed the emergency SOS button.',
      dotColor: 'bg-red-500',
      isTriangle: false,
    },
    {
      title: 'Suspicious Contact',
      desc: 'Prolonged contact with unknown individual detected.',
      dotColor: 'text-amber-500',
      isTriangle: true,
    },
    {
      title: 'Connection Lost',
      desc: 'Band signal lost for extended period.',
      dotColor: 'bg-blue-500',
      isTriangle: false,
    },
  ];

  return (
    <div className="px-6 md:px-8 pb-10 space-y-6">
      {/* 1. Active Emergency Top Banner */}
      <div className="bg-rose-50/40 border border-rose-200/90 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
        {/* Banner Header */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-rose-100/80 flex items-center justify-center text-rose-500">
            <AlertTriangle className="w-4 h-4 fill-rose-500 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              Active Emergency
            </h2>
            <p className="text-xs font-semibold text-rose-500 leading-tight mt-0.5">
              2 alerts require immediate attention
            </p>
          </div>
        </div>

        {/* Liam Torres Inner Profile Box */}
        <div className="bg-white rounded-xl p-3.5 border border-rose-100/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80"
              alt="Liam Torres"
              className="w-11 h-11 rounded-xl object-cover ring-2 ring-rose-100"
            />
            <div>
              <h3 className="font-bold text-sm text-slate-900 leading-tight">
                Liam Torres
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Age 10
              </p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-amber-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Zone Exceeded
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Connected
            </span>
          </div>
        </div>

        {/* Bottom Details Strip */}
        <div className="pt-2 flex flex-wrap items-center gap-8 md:gap-16 text-xs border-t border-rose-100/70">
          {/* Location */}
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-slate-400 text-[11px] leading-tight">Location</p>
              <p className="text-xs font-bold text-slate-800 leading-tight mt-0.5">
                Elm Street & 5th Ave
              </p>
            </div>
          </div>

          {/* Alert Time */}
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-slate-400 text-[11px] leading-tight">Alert Time</p>
              <p className="text-xs font-bold text-slate-800 leading-tight mt-0.5">
                Today, 3:42 PM
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle Section: Map + Emergency Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Last Known Location Map Card */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3.5">
          <h3 className="font-bold text-sm text-slate-900">
            Last Known Location
          </h3>

          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#eef4ee] border border-[#d6e5d8] select-none">
            {/* Grid Pattern */}
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

            {/* Roads */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 bottom-0 left-[49%] w-7 bg-white/70 border-x border-[#cde0d1]" />
              <div className="absolute left-0 right-0 top-[45%] h-7 bg-white/70 border-y border-[#cde0d1]" />
              <div className="absolute top-0 bottom-0 left-[22%] w-4 bg-white/50 border-x border-[#dbe8de]" />
              <div className="absolute top-0 bottom-0 left-[76%] w-4 bg-white/50 border-x border-[#dbe8de]" />
            </div>

            {/* Marker & Zone */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Outer faint zone circle */}
              <div className="absolute top-[48%] left-[50%] w-36 h-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-rose-300 bg-rose-100/15" />

              {/* Liam Pin Marker */}
              <div className="absolute top-[45%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 pointer-events-auto">
                <div className="relative flex items-center justify-center">
                  <span className="absolute w-12 h-12 rounded-full bg-rose-400/40 animate-ping opacity-75" />
                  <span className="absolute w-10 h-10 rounded-full bg-rose-500/20 ring-2 ring-rose-500/60" />
                  <div className="w-8 h-8 rounded-full bg-slate-950 border-2 border-white shadow-md flex items-center justify-center text-white">
                    <User className="w-4 h-4 fill-white" />
                  </div>
                </div>

                <div className="mt-1 px-2 py-0.5 rounded-full bg-white/95 border border-rose-200 shadow-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span className="text-[10px] font-bold text-slate-800">You</span>
                </div>
              </div>
            </div>

            {/* Demo Map View Badge */}
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-md px-2.5 py-1 text-[11px] font-medium text-slate-500 shadow-xs">
              Demo Map View
            </div>
          </div>
        </div>

        {/* Right: Emergency Actions & Medical Info */}
        <div className="lg:col-span-6 space-y-4">
          {/* Actions Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3.5">
            <h3 className="font-bold text-sm text-slate-900">
              Emergency Actions
            </h3>

            <div className="space-y-2.5">
              {/* Button 1: Call Emergency Services (Red) */}
              <a
                href="tel:911"
                className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white rounded-xl p-3.5 flex items-center justify-between transition-all shadow-xs group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-red-700/80 flex items-center justify-center text-white shrink-0">
                    <Phone className="w-4 h-4 fill-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm leading-tight">
                      Call Emergency Services
                    </p>
                    <p className="text-[11px] text-red-100 leading-tight mt-0.5">
                      Dial 911 immediately
                    </p>
                  </div>
                </div>
              </a>

              {/* Button 2: Locate Nearest Police (Blue) */}
              <button
                type="button"
                onClick={() => navigate('/police-station')}
                className="w-full bg-[#1d5ce5] hover:bg-blue-600 active:scale-[0.99] text-white rounded-xl p-3.5 flex items-center justify-between transition-all shadow-xs group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-700/80 flex items-center justify-center text-white shrink-0">
                    <Shield className="w-4 h-4 fill-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm leading-tight">
                      Locate Nearest Police
                    </p>
                    <p className="text-[11px] text-blue-100 leading-tight mt-0.5">
                      Find police station nearby
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Button 3: Share Location & Details (Dark Navy) */}
              <button
                type="button"
                onClick={handleShare}
                className="w-full bg-[#1b263b] hover:bg-slate-900 active:scale-[0.99] text-white rounded-xl p-3.5 flex items-center justify-between transition-all shadow-xs group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-slate-700/80 flex items-center justify-center text-white shrink-0">
                    <Share2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm leading-tight">
                      Share Location & Details
                    </p>
                    <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                      {copied ? "Copied alert details to clipboard!" : "Share with emergency contacts"}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Emergency Medical Info Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-1.5">
            <div className="flex items-center gap-2 text-rose-500">
              <HeartPulse className="w-4 h-4 stroke-[2.5]" />
              <h4 className="font-bold text-xs text-slate-800">
                Emergency Medical Info
              </h4>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              No known allergies. Father is primary contact.
            </p>
            <p className="text-xs text-slate-700">
              Blood type: <strong className="text-slate-900 font-bold">O+</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 3. Bottom Card: Emergency Types Reference */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900">
          Emergency Types Reference
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {emergencyTypes.map((item) => (
            <div key={item.title} className="flex items-start gap-2.5">
              {item.isTriangle ? (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0 mt-0.5" />
              ) : (
                <span className={`w-2.5 h-2.5 rounded-full ${item.dotColor} shrink-0 mt-1`} />
              )}
              <div>
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {item.title}
                </p>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
