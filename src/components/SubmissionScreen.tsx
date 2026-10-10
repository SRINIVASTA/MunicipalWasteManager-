import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  RefreshCw,
  Send,
  AlertCircle,
  FileText,
  Clock,
  Layers,
  CheckCircle,
  Loader2,
  Trash2,
  AlertTriangle,
  Biohazard,
  PackageOpen,
  Sparkles,
} from 'lucide-react';
import { LocationCoordinates, WasteCategory, WASTE_CATEGORIES } from '../types';

interface SubmissionScreenProps {
  photoDataUrl: string;
  location: LocationCoordinates;
  selectedCategory: WasteCategory;
  comments: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  onCategoryChange: (category: WasteCategory) => void;
  onCommentsChange: (comments: string) => void;
  onRetakePhoto: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const SubmissionScreen: React.FC<SubmissionScreenProps> = ({
  photoDataUrl,
  location,
  selectedCategory,
  comments,
  isSubmitting,
  errorMessage,
  onCategoryChange,
  onCommentsChange,
  onRetakePhoto,
  onSubmit,
  onCancel,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trash2':
        return <Trash2 className="w-4 h-4" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'Biohazard':
        return <Biohazard className="w-4 h-4 text-rose-400" />;
      case 'PackageOpen':
        return <PackageOpen className="w-4 h-4 text-indigo-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
    }
  };

  const formattedTimestamp = new Date(location.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col overflow-y-auto select-none relative">
      {/* Top App Bar */}
      <header className="sticky top-0 z-20 px-4 py-3 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Review Waste Report
            </h2>
            <p className="text-[11px] text-slate-400">Step 2 of 2 · Municipal Inspection</p>
          </div>
        </div>
      </header>

      {/* Form Content */}
      <div className="p-4 flex flex-col gap-4 pb-28">
        {/* Photo Preview Card */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md">
          <div className="relative h-52 w-full bg-slate-950">
            {photoDataUrl ? (
              <img
                src={photoDataUrl}
                alt="Captured Waste Evidence"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                No photo captured
              </div>
            )}

            {/* Retake button overlay */}
            <button
              type="button"
              onClick={onRetakePhoto}
              disabled={isSubmitting}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-xs border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retake Photo</span>
            </button>

            {/* Badge overlay on bottom */}
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-xs text-[11px] font-medium text-emerald-300 flex items-center gap-1.5 border border-emerald-500/30">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>Photo Evidence Locked</span>
            </div>
          </div>
        </div>

        {/* GPS Location & Address Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Google Play Services GPS
              </span>
            </div>

            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
              ±{Math.round(location.accuracyMeters)}m High Accuracy
            </span>
          </div>

          {/* Reverse Geocoded Address Box */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850">
            <span className="text-[10px] text-slate-400 font-semibold block">
              DETECTED MUNICIPAL ADDRESS
            </span>
            <p className="text-sm font-semibold text-white mt-0.5 leading-snug">
              {location.streetAddress}
            </p>
          </div>

          {/* Raw Coordinates and Timestamp */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <div>
              <span className="text-slate-400 block text-[10px]">COORDINATES</span>
              <span className="font-mono text-slate-300 font-medium">
                {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">TIME ACQUIRED</span>
              <span className="text-slate-300">{formattedTimestamp}</span>
            </div>
          </div>
        </div>

        {/* Waste Category Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Waste Classification</span>
          </label>

          <div className="relative">
            <button
              type="button"
              onClick={() => !isSubmitting && setDropdownOpen(!dropdownOpen)}
              className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                  {getCategoryIcon(selectedCategory.iconName)}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    {selectedCategory.displayName}
                  </span>
                  <span className="text-[10px] text-slate-400 block line-clamp-1">
                    {selectedCategory.description}
                  </span>
                </div>
              </div>
              <span className="text-xs text-slate-400">Change</span>
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-slate-900 border border-slate-700 rounded-2xl p-1.5 shadow-2xl flex flex-col gap-1">
                {WASTE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      onCategoryChange(cat);
                      setDropdownOpen(false);
                    }}
                    className={`p-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${
                      cat.id === selectedCategory.id
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                      {getCategoryIcon(cat.iconName)}
                    </div>
                    <div>
                      <span className="text-xs font-bold block">{cat.displayName}</span>
                      <span className="text-[10px] text-slate-400 block line-clamp-1">
                        {cat.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Optional Additional Comments */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Additional Comments</span>
            </label>
            <span className="text-[10px] text-slate-400">Optional</span>
          </div>

          <textarea
            value={comments}
            onChange={(e) => onCommentsChange(e.target.value)}
            disabled={isSubmitting}
            placeholder="Specify landmarks, access notes (e.g. alleyway gate, near fire hydrant), or special hazards..."
            rows={3}
            maxLength={250}
            className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-xs text-white placeholder-slate-500 focus:outline-hidden transition-colors resize-none leading-relaxed"
          />
          <div className="flex justify-end text-[10px] text-slate-400">
            {comments.length}/250 characters
          </div>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Fixed Sticky Submission CTA Bar at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent z-30">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-900 active:scale-[0.98] text-slate-950 font-bold text-sm transition-all shadow-xl shadow-emerald-950 flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
              <span>Transmitting to Municipality API...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-slate-950" />
              <span>Submit Report to Municipality</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
