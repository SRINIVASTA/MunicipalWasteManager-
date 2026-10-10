import {
  MunicipalitySubmissionResult,
  SubmittedReportRecord,
  WasteCategory,
  WasteReportPayload,
  WASTE_CATEGORIES,
} from '../types';

const STORAGE_KEY = 'ecoclean_submitted_reports_v1';

/**
 * Simulates a municipal public works dispatch REST API.
 * Endpoint: POST /api/v1/sanitation/reports
 */
export async function submitReportToMunicipality(
  payload: WasteReportPayload
): Promise<MunicipalitySubmissionResult> {
  // Simulate network latency (1.8s)
  await new Promise((resolve) => setTimeout(resolve, 1800));

  if (!payload.photoDataUrl) {
    throw new Error('Photo evidence is required for municipal dispatch inspection.');
  }

  if (payload.coordinates.latitude === 0 && payload.coordinates.longitude === 0) {
    throw new Error('Invalid GPS coordinates. Please ensure GPS location services are active.');
  }

  const currentYear = new Date().getFullYear();
  const randomSeq = Math.floor(10000 + Math.random() * 90000);
  const trackingId = `MUN-${currentYear}-${randomSeq}`;

  // Assign municipal sanitation sector based on coordinates
  const districtZone = (Math.abs(Math.floor(payload.coordinates.latitude * 100)) % 6) + 1;
  const assignedDistrict = `Zone ${districtZone} - Metro Sanitation Operations`;
  const crewVehicleId = `TRUCK-${districtZone}0${Math.floor(1 + Math.random() * 8)}`;

  const category = WASTE_CATEGORIES.find((c) => c.id === payload.categoryId) || WASTE_CATEGORIES[0];

  const result: MunicipalitySubmissionResult = {
    trackingId,
    confirmationStatus: 'DISPATCH_QUEUED',
    assignedDistrict,
    estimatedResolutionHours: category.estimatedResolutionHours,
    timestamp: Date.now(),
    crewVehicleId,
  };

  // Persist report into simulated municipal database (localStorage)
  const newRecord: SubmittedReportRecord = {
    id: trackingId,
    trackingId,
    photoDataUrl: payload.photoDataUrl,
    category,
    coordinates: payload.coordinates,
    comments: payload.additionalComments,
    submittedAt: Date.now(),
    status: 'DISPATCHED',
    district: assignedDistrict,
    estimatedHours: category.estimatedResolutionHours,
  };

  saveReportToLedger(newRecord);

  return result;
}

export function getSubmittedReportsLedger(): SubmittedReportRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialDemoReports();
    return JSON.parse(raw);
  } catch {
    return getInitialDemoReports();
  }
}

export function saveReportToLedger(record: SubmittedReportRecord): void {
  try {
    const existing = getSubmittedReportsLedger();
    const updated = [record, ...existing.filter((r) => r.trackingId !== record.trackingId)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 30)));
  } catch {
    // Ignore storage errors
  }
}

export function updateReportStatus(trackingId: string, newStatus: SubmittedReportRecord['status']): void {
  try {
    const existing = getSubmittedReportsLedger();
    const updated = existing.map((r) => (r.trackingId === trackingId ? { ...r, status: newStatus } : r));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

function getInitialDemoReports(): SubmittedReportRecord[] {
  return [
    {
      id: 'MUN-2026-10482',
      trackingId: 'MUN-2026-10482',
      photoDataUrl: '',
      category: WASTE_CATEGORIES[0],
      coordinates: {
        latitude: 37.7794,
        longitude: -122.4172,
        accuracyMeters: 3.5,
        streetAddress: 'Civic Center Plaza, 8th & Grove St',
        timestamp: Date.now() - 3600000 * 2,
      },
      comments: 'Trash can overflowing beside pedestrian walkway.',
      submittedAt: Date.now() - 3600000 * 2,
      status: 'IN_PROGRESS',
      district: 'Zone 1 - Metro Sanitation Operations',
      estimatedHours: 12,
    },
    {
      id: 'MUN-2026-09823',
      trackingId: 'MUN-2026-09823',
      photoDataUrl: '',
      category: WASTE_CATEGORIES[1],
      coordinates: {
        latitude: 37.7698,
        longitude: -122.4215,
        accuracyMeters: 4.8,
        streetAddress: 'Valencia & 18th St, Rear Alley',
        timestamp: Date.now() - 3600000 * 18,
      },
      comments: 'Cardboard boxes and construction drywall dumped.',
      submittedAt: Date.now() - 3600000 * 18,
      status: 'RESOLVED',
      district: 'Zone 4 - Metro Sanitation Operations',
      estimatedHours: 24,
    },
  ];
}
