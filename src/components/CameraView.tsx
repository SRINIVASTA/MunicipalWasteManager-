import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  ArrowLeft,
  RotateCw,
  Image as ImageIcon,
  Sparkles,
  Zap,
  ZapOff,
  Upload,
} from 'lucide-react';
import { SAMPLE_WASTE_SCENES } from '../services/sampleImages';

interface CameraViewProps {
  onPhotoCaptured: (photoDataUrl: string, sampleCategorySuggestion?: string) => void;
  onBack: () => void;
  cameraGranted: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onPhotoCaptured,
  onBack,
  cameraGranted,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [flashOn, setFlashOn] = useState(false);
  const [isShutterActive, setIsShutterActive] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  // Initialize camera stream if permitted
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (cameraGranted && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })
        .then((mediaStream) => {
          stream = mediaStream;
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.play().catch(() => {});
            setStreamActive(true);
          }
        })
        .catch(() => {
          setStreamActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraGranted, facingMode]);

  const handleCapture = () => {
    setIsShutterActive(true);

    setTimeout(() => {
      setIsShutterActive(false);

      if (streamActive && videoRef.current) {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 800;
        canvas.height = video.videoHeight || 600;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onPhotoCaptured(dataUrl);
          return;
        }
      }

      // If camera stream not active, use selected sample or default sample
      const sample =
        SAMPLE_WASTE_SCENES.find((s) => s.id === selectedSampleId) || SAMPLE_WASTE_SCENES[0];
      const sampleUrl = sample.generateDataUrl();
      onPhotoCaptured(sampleUrl, sample.categoryId);
    }, 200);
  };

  const handleSelectSample = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    const sample = SAMPLE_WASTE_SCENES.find((s) => s.id === sampleId);
    if (sample) {
      const dataUrl = sample.generateDataUrl();
      onPhotoCaptured(dataUrl, sample.categoryId);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onPhotoCaptured(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative flex-1 bg-black flex flex-col justify-between overflow-hidden text-white select-none">
      {/* Shutter flash animation */}
      {isShutterActive && (
        <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-150" />
      )}

      {/* Top Controls Overlay */}
      <div className="relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/30 to-transparent">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-slate-900/70 border border-slate-700/60 flex items-center justify-center text-white hover:bg-slate-800 transition-colors"
          title="Back to Home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs font-medium text-emerald-300">
          <Camera className="w-3.5 h-3.5 text-emerald-400" />
          <span>Waste Inspection View</span>
        </div>

        <button
          type="button"
          onClick={() => setFlashOn(!flashOn)}
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
            flashOn
              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
              : 'bg-slate-900/70 border-slate-700/60 text-slate-300 hover:text-white'
          }`}
          title="Toggle Flash"
        >
          {flashOn ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
        </button>
      </div>

      {/* Camera Viewport Area */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-slate-950">
        {streamActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
            {/* Fallback Graphic */}
            <div className="w-20 h-20 rounded-3xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
              <Camera className="w-10 h-10 animate-pulse" />
            </div>

            <h4 className="text-base font-semibold text-white mb-1">
              Inspection Viewfinder Active
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mb-6">
              Frame the garbage area clearly. Tap shutter to snap evidence, or pick a municipal test scene below.
            </p>

            {/* Quick Test Sample Grid */}
            <div className="w-full max-w-xs flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-left">
                Test Evidence Samples:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_WASTE_SCENES.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample.id)}
                    className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group flex flex-col justify-between"
                  >
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 line-clamp-1">
                      {sample.title}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                      {sample.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Viewfinder Target Reticle Overlay */}
        <div className="absolute inset-8 pointer-events-none flex flex-col justify-between">
          <div className="flex justify-between">
            <div className="w-8 h-8 border-t-2 border-l-2 border-emerald-400/80 rounded-tl-lg" />
            <div className="w-8 h-8 border-t-2 border-r-2 border-emerald-400/80 rounded-tr-lg" />
          </div>
          <div className="flex justify-between">
            <div className="w-8 h-8 border-b-2 border-l-2 border-emerald-400/80 rounded-bl-lg" />
            <div className="w-8 h-8 border-b-2 border-r-2 border-emerald-400/80 rounded-br-lg" />
          </div>
        </div>

        {/* Center reticle mark */}
        <div className="absolute w-6 h-6 pointer-events-none flex items-center justify-center">
          <div className="w-2 h-0.5 bg-emerald-400/70" />
          <div className="h-2 w-0.5 bg-emerald-400/70" />
        </div>
      </div>

      {/* Bottom Shutter Controls */}
      <div className="relative z-20 p-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex flex-col items-center gap-4">
        <div className="flex items-center justify-around w-full max-w-xs">
          {/* Upload from file / photo library */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 rounded-full bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Upload Photo Evidence"
          >
            <Upload className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Shutter Button */}
          <button
            type="button"
            onClick={handleCapture}
            className="w-20 h-20 rounded-full p-1 bg-white/20 border-2 border-white flex items-center justify-center transition-transform active:scale-95 shadow-lg shadow-emerald-950/50"
            title="Capture Photo"
          >
            <div className="w-full h-full rounded-full bg-emerald-500 hover:bg-emerald-400 transition-colors flex items-center justify-center">
              <Camera className="w-8 h-8 text-slate-950" />
            </div>
          </button>

          {/* Flip Lens button */}
          <button
            type="button"
            onClick={() =>
              setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
            }
            className="w-12 h-12 rounded-full bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Switch Lens"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        <span className="text-[11px] text-slate-400 text-center">
          Tap shutter to capture photo evidence & trigger background GPS lock
        </span>
      </div>
    </div>
  );
};
