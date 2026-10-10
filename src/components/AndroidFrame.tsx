import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  showFrame?: boolean;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  showFrame = true,
}) => {
  const [currentTime, setCurrentTime] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!showFrame) {
    return (
      <div className="w-full max-w-md mx-auto bg-slate-950 text-slate-100 min-h-[780px] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border border-slate-800">
        {/* Status Bar */}
        <div className="h-9 px-6 pt-2 flex items-center justify-between text-xs font-medium text-slate-400 select-none bg-slate-950/80 backdrop-blur-xs z-30 shrink-0">
          <span>{currentTime}</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>

        {/* Gesture Nav Bar */}
        <div className="h-5 flex items-center justify-center bg-slate-950 shrink-0">
          <div className="w-32 h-1 bg-slate-700 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-[385px] sm:w-[400px] h-[820px] bg-slate-950 rounded-[48px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border-[6px] border-slate-800 flex flex-col overflow-hidden transition-all duration-300 ring-1 ring-slate-700/50">
      {/* Speaker ear piece & camera punch hole */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center">
        <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700 shadow-inner flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-950/70" />
        </div>
      </div>

      {/* Screen Container */}
      <div className="w-full h-full bg-slate-950 rounded-[38px] flex flex-col overflow-hidden relative border border-slate-900">
        {/* Android Status Bar */}
        <div className="h-9 px-6 pt-2 flex items-center justify-between text-xs font-semibold text-slate-400 select-none bg-slate-950/90 backdrop-blur-xs z-30 shrink-0">
          <span className="tracking-tight">{currentTime}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-emerald-500 font-bold">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Active Android Screen Body */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>

        {/* Android 15 Gesture Bar */}
        <div className="h-5 flex items-center justify-center bg-slate-950 shrink-0 select-none">
          <div className="w-32 h-1 bg-slate-600/70 hover:bg-slate-400 rounded-full transition-colors" />
        </div>
      </div>
    </div>
  );
};
