import React from 'react';
import { MapPin, Clock, Navigation2 } from 'lucide-react';

export default function LocationDetails({ location }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
      <h3 className="font-bold text-sm text-slate-800">
        Location Details
      </h3>

      <div className="space-y-3.5">
        {/* Current Location */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-slate-400">
            <MapPin className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800 leading-tight">
              {location.address}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Current location
            </p>
          </div>
        </div>

        {/* Last Updated */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-slate-400">
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800 leading-tight">
              {location.lastUpdated}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Last updated
            </p>
          </div>
        </div>

        {/* Distance From Parent */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-slate-400">
            <Navigation2 className="w-4 h-4 text-slate-400 rotate-45" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800 leading-tight">
              {location.distance}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Distance from parent
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

