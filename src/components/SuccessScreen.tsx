import React, { useState } from 'react';
import {
  CheckCircle,
  Copy,
  Check,
  Truck,
  Clock,
  MapPin,
  Camera,
  Share2,
  RotateCcw,
  Home,
  ShieldCheck,
} from 'lucide-react';
import {
  MunicipalitySubmissionResult,
  LocationCoordinates,
  WasteCategory,
} from '../types';

interface SuccessScreenProps {
  result: MunicipalitySubmissionResult;
  location: LocationCoordinates;
  category: WasteCategory;
  comments: string;
  photoDataUrl: string;
  onDone: () => void;
  onReportAnother: () => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  result,
  location,
  category,
  comments,
  photoDataUrl,
  onDone,
  onReportAnother,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(result.trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedDate = new Date(result.timestamp).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col overflow-y-auto select-none relative">
      <div className="p-5 flex flex-col items-center gap-5 pb-32">
        {/* Animated Checkmark Badge */}
        <div className="relative mt-4">
          <div className="w-20 h-20 rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950 animate-in zoom-in duration-300">
            <CheckCircle className="w-12 h-12 text-emerald-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Headline */}
        <div className="text-center flex flex-col gap-1">
          <h2 className="text-xl font-extrabold text-white">
            Report Dispatched to City!
          </h2>
          <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
            Your waste incident report has been securely logged into the Municipal Sanitation Dispatch ledger.
          </p>
        </div>

        {/* Tracking Card */}
        <div className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              MUNICIPAL TRACKING TICKET
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
              {result.confirmationStatus}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="font-mono text-base font-bold text-emerald-400 tracking-wider">
              {result.trackingId}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
              title="Copy Ticket ID"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">ASSIGNED SECTOR</span>
              <span className="font-semibold text-white block mt-0.5">
                {result.assignedDistrict}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">ESTIMATED RESOLUTION</span>
              <span className="font-semibold text-emerald-400 block mt-0.5">
                &lt; {result.estimatedResolutionHours} Hours
              </span>
            </div>
          </div>
        </div>

        {/* Incident Summary Card */}
        <div className="w-full p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex flex-col gap-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Report Package Summary
          </h3>

          <div className="flex items-center gap-3">
            {photoDataUrl && (
              <img
                src={photoDataUrl}
                alt="Thumbnail"
                className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                {category.displayName}
              </span>
              <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                {location.streetAddress}
              </span>
              <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </span>
            </div>
          </div>

          {comments && (
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-850 text-xs text-slate-300">
              <span className="text-[10px] text-slate-400 block font-medium">COMMENTS</span>
              <p className="mt-0.5 text-[11px] italic">"{comments}"</p>
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span>Submitted: {formattedDate}</span>
            <span>Unit: {result.crewVehicleId}</span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent z-30 flex flex-col gap-2">
        <button
          type="button"
          onClick={onReportAnother}
          className="w-full h-13 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Camera className="w-4 h-4 text-slate-950" />
          <span>Report Another Waste Area</span>
        </button>

        <button
          type="button"
          onClick={onDone}
          className="w-full h-11 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-slate-800"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
};
