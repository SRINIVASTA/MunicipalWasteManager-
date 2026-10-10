import React, { useState } from 'react';
import { Camera, MapPin, ShieldCheck, Check } from 'lucide-react';

interface AndroidPermissionDialogProps {
  type: 'camera' | 'location';
  onAllow: (precise?: boolean) => void;
  onDeny: () => void;
}

export const AndroidPermissionDialog: React.FC<AndroidPermissionDialogProps> = ({
  type,
  onAllow,
  onDeny,
}) => {
  const [preciseLocation, setPreciseLocation] = useState(true);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[340px] bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col items-center text-center">
        {/* Android 14/15 Permission Icon */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
          {type === 'camera' ? (
            <Camera className="w-7 h-7" />
          ) : (
            <MapPin className="w-7 h-7" />
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white tracking-tight mb-2">
          {type === 'camera'
            ? 'Allow EcoClean to take pictures and record video?'
            : "Allow EcoClean to access this device's location?"}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {type === 'camera'
            ? 'Municipal waste management requires photographic evidence of the waste site to triage sanitation vehicles and dispatch cleanup teams.'
            : 'EcoClean uses Google Play Services Location to pin the exact GPS coordinates and dispatch the nearest district sanitation truck.'}
        </p>

        {/* Location Precision Switcher (Android 12+) */}
        {type === 'location' && (
          <div className="w-full grid grid-cols-2 gap-2 p-1.5 bg-slate-800/80 rounded-2xl mb-5 border border-slate-700/50">
            <button
              type="button"
              onClick={() => setPreciseLocation(true)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-medium transition-all ${
                preciseLocation
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1 font-semibold">
                {preciseLocation && <Check className="w-3.5 h-3.5" />}
                <span>Precise</span>
              </div>
              <span className="text-[10px] opacity-80 mt-0.5">Meters accuracy</span>
            </button>
            <button
              type="button"
              onClick={() => setPreciseLocation(false)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-medium transition-all ${
                !preciseLocation
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1 font-semibold">
                {!preciseLocation && <Check className="w-3.5 h-3.5" />}
                <span>Approximate</span>
              </div>
              <span className="text-[10px] opacity-80 mt-0.5">District zone only</span>
            </button>
          </div>
        )}

        {/* Android Material 3 Action Stack */}
        <div className="w-full flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onAllow(preciseLocation)}
            className="w-full py-3 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors shadow-md shadow-emerald-950/40"
          >
            While using the app
          </button>

          <button
            type="button"
            onClick={() => onAllow(preciseLocation)}
            className="w-full py-2.5 px-4 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors border border-slate-700"
          >
            Only this time
          </button>

          <button
            type="button"
            onClick={onDeny}
            className="w-full py-2 px-4 rounded-full text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            Don't allow
          </button>
        </div>

        <div className="flex items-center gap-1.5 mt-4 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Android 15 Permission Governance</span>
        </div>
      </div>
    </div>
  );
};
