import React from 'react';
import {
  Trash2,
  Camera,
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
  ShieldAlert,
  ChevronRight,
  Info,
  ListFilter,
} from 'lucide-react';
import { SubmittedReportRecord } from '../types';

interface HomeScreenProps {
  onStartReport: () => void;
  recentReports: SubmittedReportRecord[];
  onOpenLedger: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartReport,
  recentReports,
  onOpenLedger,
}) => {
  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col overflow-y-auto select-none relative">
      {/* Top App Bar */}
      <header className="sticky top-0 z-20 px-5 py-3.5 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-950">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight tracking-tight">
              City Clean Municipal
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Department of Public Sanitation
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenLedger}
          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
          title="View Municipal Dispatch Ledger"
        >
          <ListFilter className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ledger</span>
        </button>
      </header>

      {/* Main Content Area */}
      <div className="p-5 flex flex-col gap-5 pb-24">
        {/* Prominent Hero Action Card */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/90 via-emerald-950 to-slate-900 border border-emerald-500/30 p-6 shadow-xl shadow-emerald-950/30 flex flex-col gap-4">
          <div className="relative z-10 flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-emerald-300 tracking-wider uppercase">
              Rapid Municipal Reporting
            </span>
            <h2 className="text-xl font-extrabold text-white leading-snug">
              Spotted Waste or Illegal Dumping?
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Capture photo evidence. Our system locks precise GPS coordinates and automatically dispatches local sanitation crews.
            </p>
          </div>

          {/* Prominent "Report Garbage" Button */}
          <button
            type="button"
            onClick={onStartReport}
            className="w-full py-4 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-base transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Camera className="w-5 h-5 text-slate-950" />
            <span>Report Garbage Now</span>
          </button>

          {/* Quick Capability Indicators */}
          <div className="flex items-center justify-between pt-2 border-t border-emerald-800/40 text-[11px] text-emerald-300/90">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Auto-GPS Lock</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct Dispatch</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ticket Tracking</span>
            </div>
          </div>
        </section>

        {/* Municipal Service Live Metrics */}
        <section className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center text-center">
            <span className="text-lg font-bold text-emerald-400 font-mono">24/7</span>
            <span className="text-[10px] text-slate-400 mt-0.5">City Dispatch</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center text-center">
            <span className="text-lg font-bold text-emerald-400 font-mono">&lt; 4h</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Avg Response</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center text-center">
            <span className="text-lg font-bold text-emerald-400 font-mono">98.2%</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Cleanliness</span>
          </div>
        </section>

        {/* How It Works 3-Step Guide */}
        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
            How Reporting Works
          </h3>
          <div className="flex flex-col gap-2.5">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-semibold text-white">
                  1. Capture Waste Photo
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Take a photo of overflowing bins, piles, or bulky junk.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-semibold text-white">
                  2. Automatic Background GPS
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Google Play Services acquires meter-precise coordinates and address.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-semibold text-white">
                  3. Municipal Truck Dispatched
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Route assigned to zone cleanup crew with live tracking ticket.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Reports in Your District */}
        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
              Recent Municipal Dispatches
            </h3>
            <button
              type="button"
              onClick={onOpenLedger}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {recentReports.slice(0, 2).map((report) => (
              <div
                key={report.trackingId}
                className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-emerald-400">
                        {report.trackingId}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        · {report.category.displayName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate max-w-[180px]">
                      {report.coordinates.streetAddress}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      report.status === 'RESOLVED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/30'
                        : 'bg-amber-950 text-amber-300 border border-amber-600/30'
                    }`}
                  >
                    {report.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Floating Action Button (Extended FAB at Bottom) */}
      <div className="fixed bottom-6 left-0 right-0 max-w-md mx-auto px-5 pointer-events-none z-30">
        <button
          type="button"
          onClick={onStartReport}
          className="pointer-events-auto w-full h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-sm shadow-2xl shadow-emerald-950/80 flex items-center justify-center gap-2.5 transition-all border border-emerald-400/30"
        >
          <Camera className="w-5 h-5 text-white" />
          <span>Report Garbage</span>
        </button>
      </div>
    </div>
  );
};
