import React, { useState } from 'react';
import {
  X,
  Trash2,
  MapPin,
  Clock,
  Filter,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { SubmittedReportRecord } from '../types';

interface MunicipalLedgerModalProps {
  reports: SubmittedReportRecord[];
  onClose: () => void;
  onSelectReport?: (report: SubmittedReportRecord) => void;
}

export const MunicipalLedgerModal: React.FC<MunicipalLedgerModalProps> = ({
  reports,
  onClose,
  onSelectReport,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'DISPATCHED' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');

  const filteredReports = reports.filter((r) => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Municipal Sanitation Dispatch Ledger
          </h3>
          <p className="text-[11px] text-slate-400">
            {reports.length} total incident reports logged
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto">
        {(['ALL', 'DISPATCHED', 'IN_PROGRESS', 'RESOLVED'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === tab
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Report List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {filteredReports.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
            <Trash2 className="w-10 h-10 text-slate-600 mb-2" />
            <p className="text-xs">No reports found matching this filter.</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.trackingId}
              className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {report.trackingId}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    report.status === 'RESOLVED'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/30'
                      : report.status === 'IN_PROGRESS'
                      ? 'bg-sky-950 text-sky-400 border border-sky-600/30'
                      : 'bg-amber-950 text-amber-300 border border-amber-600/30'
                  }`}
                >
                  {report.status}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {report.photoDataUrl && (
                  <img
                    src={report.photoDataUrl}
                    alt="Waste Evidence"
                    className="w-12 h-12 rounded-lg object-cover border border-slate-800 shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-white block">
                    {report.category.displayName}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{report.coordinates.streetAddress}</span>
                  </div>
                </div>
              </div>

              {report.comments && (
                <p className="text-[11px] text-slate-400 italic line-clamp-1 bg-slate-950/60 p-2 rounded-lg">
                  "{report.comments}"
                </p>
              )}

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                <span>{report.district}</span>
                <span>Est: &lt; {report.estimatedHours}h</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
