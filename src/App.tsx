/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Code2,
  Columns2,
  Trash2,
  Camera,
  MapPin,
  CheckCircle2,
  Truck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { AndroidFrame } from './components/AndroidFrame';
import { AndroidPermissionDialog } from './components/AndroidPermissionDialog';
import { HomeScreen } from './components/HomeScreen';
import { CameraView } from './components/CameraView';
import { SubmissionScreen } from './components/SubmissionScreen';
import { SuccessScreen } from './components/SuccessScreen';
import { CodeInspector } from './components/CodeInspector';
import { MunicipalLedgerModal } from './components/MunicipalLedgerModal';
import {
  AndroidPermissionState,
  LocationCoordinates,
  MunicipalitySubmissionResult,
  ScreenState,
  SubmittedReportRecord,
  WasteCategory,
  WASTE_CATEGORIES,
} from './types';
import { acquireCurrentLocation } from './services/reverseGeocoding';
import {
  getSubmittedReportsLedger,
  submitReportToMunicipality,
} from './services/mockMunicipalityApi';

export default function App() {
  // Navigation / View modes for the desktop workspace
  const [workspaceMode, setWorkspaceMode] = useState<'split' | 'device' | 'code'>('split');
  const [showLedgerModal, setShowLedgerModal] = useState(false);

  // Android Simulation State
  const [screenState, setScreenState] = useState<ScreenState>('home');
  const [cameraPermission, setCameraPermission] = useState<AndroidPermissionState>('prompt');
  const [locationPermission, setLocationPermission] = useState<AndroidPermissionState>('prompt');
  const [activePermissionDialog, setActivePermissionDialog] = useState<'camera' | 'location' | null>(null);

  // Active Report Package Data
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates>({
    latitude: 37.774929,
    longitude: -122.419416,
    accuracyMeters: 4.2,
    streetAddress: '1088 Market Street, Downtown Sanitation Zone',
    timestamp: Date.now(),
  });
  const [selectedCategory, setSelectedCategory] = useState<WasteCategory>(WASTE_CATEGORIES[0]);
  const [additionalComments, setAdditionalComments] = useState<string>('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<MunicipalitySubmissionResult | null>(null);
  const [submittedReports, setSubmittedReports] = useState<SubmittedReportRecord[]>([]);

  // Load initial demo reports
  useEffect(() => {
    setSubmittedReports(getSubmittedReportsLedger());
  }, []);

  /**
   * Step 1: User taps "Report Garbage"
   * Android runtime permissions for Camera and Location are verified.
   */
  const handleStartReport = () => {
    if (cameraPermission !== 'granted') {
      setActivePermissionDialog('camera');
      return;
    }

    if (locationPermission !== 'granted') {
      setActivePermissionDialog('location');
      return;
    }

    // Both granted, launch camera
    setScreenState('camera');
  };

  /**
   * Step 2: Handle Camera permission dialog response
   */
  const handleCameraPermissionResponse = (allowed: boolean) => {
    if (allowed) {
      setCameraPermission('granted');
      setActivePermissionDialog(null);

      // Check if location permission also needed
      if (locationPermission !== 'granted') {
        setTimeout(() => setActivePermissionDialog('location'), 150);
      } else {
        setScreenState('camera');
      }
    } else {
      setCameraPermission('denied');
      setActivePermissionDialog(null);
    }
  };

  /**
   * Step 3: Handle Location permission dialog response
   */
  const handleLocationPermissionResponse = (allowed: boolean) => {
    if (allowed) {
      setLocationPermission('granted');
      setActivePermissionDialog(null);
      setScreenState('camera');
    } else {
      setLocationPermission('denied');
      setActivePermissionDialog(null);
    }
  };

  /**
   * Step 4: Photo captured by Camera
   * Automatically triggers background GPS retrieval using Google Play Services Location
   */
  const handlePhotoCaptured = async (
    photoDataUrl: string,
    sampleCategorySuggestion?: string
  ) => {
    setCapturedPhotoUrl(photoDataUrl);

    if (sampleCategorySuggestion) {
      const match = WASTE_CATEGORIES.find((c) => c.id === sampleCategorySuggestion);
      if (match) setSelectedCategory(match);
    }

    // Switch to background location fetching state
    setScreenState('location_fetching');

    try {
      // Automatic background retrieval of user's precise GPS location
      const coords = await acquireCurrentLocation();
      setCurrentLocation(coords);
    } catch {
      // Fallback
    }

    // Move to Submission verification screen
    setScreenState('submission');
  };

  /**
   * Step 5: User submits the complete report package to the municipality backend API
   */
  const handleSubmitReport = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const result = await submitReportToMunicipality({
        photoDataUrl: capturedPhotoUrl,
        coordinates: currentLocation,
        categoryId: selectedCategory.id,
        additionalComments: additionalComments.trim() || undefined,
        timestamp: Date.now(),
        deviceModel: 'Pixel 9 Pro (Android 15)',
      });

      setSubmissionResult(result);
      setSubmittedReports(getSubmittedReportsLedger());
      setScreenState('success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Submission failed. Please retry.';
      setSubmissionError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetHome = () => {
    setScreenState('home');
    setCapturedPhotoUrl('');
    setAdditionalComments('');
    setSubmissionResult(null);
    setSubmissionError(null);
  };

  const handleRetakePhoto = () => {
    setScreenState('camera');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Universal Top Bar Contract: [Brand title] — [4-5 single-line nav links] — [1 primary action] */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-950">
            <Trash2 className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            EcoClean Municipal
          </span>
        </div>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            type="button"
            onClick={() => setWorkspaceMode('device')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              workspaceMode === 'device' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Android Simulator
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceMode('split')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              workspaceMode === 'split' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Split View
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceMode('code')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              workspaceMode === 'code' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Kotlin Jetpack Compose
          </button>
          <button
            type="button"
            onClick={() => setShowLedgerModal(true)}
            className="transition-colors whitespace-nowrap shrink-0 hover:text-white"
          >
            City Dispatch Ledger
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (workspaceMode === 'code') setWorkspaceMode('split');
              handleStartReport();
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/60 flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Report Garbage</span>
          </button>
        </div>
      </header>

      {/* Mode Selector Strip for Mobile / Tablet */}
      <div className="md:hidden px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">Workspace View:</span>
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setWorkspaceMode('device')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              workspaceMode === 'device' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            Simulator
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceMode('code')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              workspaceMode === 'code' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            Kotlin Code
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Workspace Mode Subhead / Status Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/60 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-semibold text-slate-200">Jetpack Compose Architecture:</span>
            <span>CameraX</span>
            <span>·</span>
            <span>Google Play Services Location</span>
            <span>·</span>
            <span>StateFlow ViewModel</span>
            <span>·</span>
            <span>Material 3</span>
          </div>

          <div className="hidden md:flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setWorkspaceMode('device')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                workspaceMode === 'device'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android Device</span>
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceMode('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                workspaceMode === 'split'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceMode('code')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                workspaceMode === 'code'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Kotlin Project</span>
            </button>
          </div>
        </div>

        {/* Dynamic Multi-Column Workspace Grid */}
        <div
          className={`grid gap-8 items-start ${
            workspaceMode === 'split'
              ? 'grid-cols-1 lg:grid-cols-12'
              : workspaceMode === 'device'
              ? 'grid-cols-1 max-w-md mx-auto w-full'
              : 'grid-cols-1'
          }`}
        >
          {/* Column A: Interactive Android Phone Simulator */}
          {(workspaceMode === 'split' || workspaceMode === 'device') && (
            <div
              className={`flex flex-col items-center ${
                workspaceMode === 'split' ? 'lg:col-span-5' : 'w-full'
              }`}
            >
              <AndroidFrame showFrame={true}>
                {/* Simulated Android Screen State Routing */}
                {screenState === 'home' && (
                  <HomeScreen
                    onStartReport={handleStartReport}
                    recentReports={submittedReports}
                    onOpenLedger={() => setShowLedgerModal(true)}
                  />
                )}

                {screenState === 'camera' && (
                  <CameraView
                    cameraGranted={cameraPermission === 'granted'}
                    onPhotoCaptured={handlePhotoCaptured}
                    onBack={handleResetHome}
                  />
                )}

                {screenState === 'location_fetching' && (
                  <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-8 text-center text-white">
                    <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 animate-spin">
                      <MapPin className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold mb-1">
                      Acquiring GPS Location
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                      Google Play Services Location is fetching high-precision coordinates and resolving the municipal street address in background...
                    </p>
                  </div>
                )}

                {screenState === 'submission' && (
                  <SubmissionScreen
                    photoDataUrl={capturedPhotoUrl}
                    location={currentLocation}
                    selectedCategory={selectedCategory}
                    comments={additionalComments}
                    isSubmitting={isSubmitting}
                    errorMessage={submissionError}
                    onCategoryChange={setSelectedCategory}
                    onCommentsChange={setAdditionalComments}
                    onRetakePhoto={handleRetakePhoto}
                    onSubmit={handleSubmitReport}
                    onCancel={handleResetHome}
                  />
                )}

                {screenState === 'success' && submissionResult && (
                  <SuccessScreen
                    result={submissionResult}
                    location={currentLocation}
                    category={selectedCategory}
                    comments={additionalComments}
                    photoDataUrl={capturedPhotoUrl}
                    onDone={handleResetHome}
                    onReportAnother={handleStartReport}
                  />
                )}

                {/* Permission Dialog Overlay */}
                {activePermissionDialog && (
                  <AndroidPermissionDialog
                    type={activePermissionDialog}
                    onAllow={
                      activePermissionDialog === 'camera'
                        ? () => handleCameraPermissionResponse(true)
                        : () => handleLocationPermissionResponse(true)
                    }
                    onDeny={
                      activePermissionDialog === 'camera'
                        ? () => handleCameraPermissionResponse(false)
                        : () => handleLocationPermissionResponse(false)
                    }
                  />
                )}
              </AndroidFrame>

              {/* Device helper caption */}
              <div className="mt-3 text-center text-[11px] text-slate-400">
                <span>Google Pixel 9 Pro · Android 15 · Touch Target $\ge 48$dp</span>
              </div>
            </div>
          )}

          {/* Column B: Android Kotlin Source Code Inspector */}
          {(workspaceMode === 'split' || workspaceMode === 'code') && (
            <div
              className={`flex flex-col gap-4 ${
                workspaceMode === 'split' ? 'lg:col-span-7' : 'w-full'
              }`}
            >
              <CodeInspector />
            </div>
          )}
        </div>
      </main>

      {/* Municipal Dispatch Ledger Modal */}
      {showLedgerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg h-[640px] rounded-3xl overflow-hidden shadow-2xl relative">
            <MunicipalLedgerModal
              reports={submittedReports}
              onClose={() => setShowLedgerModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
