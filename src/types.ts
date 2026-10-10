export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  streetAddress: string;
  timestamp: number;
}

export interface WasteCategory {
  id: string;
  displayName: string;
  description: string;
  iconName: string;
  estimatedResolutionHours: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface WasteReportPayload {
  photoDataUrl: string;
  coordinates: LocationCoordinates;
  categoryId: string;
  additionalComments?: string;
  timestamp: number;
  deviceModel: string;
}

export interface MunicipalitySubmissionResult {
  trackingId: string;
  confirmationStatus: string;
  assignedDistrict: string;
  estimatedResolutionHours: number;
  timestamp: number;
  crewVehicleId: string;
}

export interface SubmittedReportRecord {
  id: string;
  trackingId: string;
  photoDataUrl: string;
  category: WasteCategory;
  coordinates: LocationCoordinates;
  comments?: string;
  submittedAt: number;
  status: 'QUEUED' | 'DISPATCHED' | 'IN_PROGRESS' | 'RESOLVED';
  district: string;
  estimatedHours: number;
}

export type AndroidPermissionState = 'prompt' | 'granted' | 'denied';

export type ScreenState = 'home' | 'camera' | 'location_fetching' | 'submission' | 'success';

export const WASTE_CATEGORIES: WasteCategory[] = [
  {
    id: 'OVERFLOWING_BIN',
    displayName: 'Overflowing Bin',
    description: 'Public trash receptacle or recycling dumpster exceeded volume',
    iconName: 'Trash2',
    estimatedResolutionHours: 12,
    priority: 'medium',
  },
  {
    id: 'ILLEGAL_DUMPING',
    displayName: 'Illegal Dumping',
    description: 'Piles of unauthorized debris, trash sacks, or waste on public property',
    iconName: 'AlertTriangle',
    estimatedResolutionHours: 24,
    priority: 'high',
  },
  {
    id: 'HAZARDOUS_WASTE',
    displayName: 'Hazardous Material',
    description: 'Chemicals, batteries, bio-hazards, broken glass, or sharp objects',
    iconName: 'Biohazard',
    estimatedResolutionHours: 4,
    priority: 'urgent',
  },
  {
    id: 'BULKY_ITEMS',
    displayName: 'Bulky Furniture / Appliances',
    description: 'Abandoned mattresses, sofas, appliances, or blocking tree limbs',
    iconName: 'PackageOpen',
    estimatedResolutionHours: 48,
    priority: 'low',
  },
  {
    id: 'LITTER_STREET',
    displayName: 'Street / Sidewalk Litter',
    description: 'Scattered cups, wrappers, or debris across public walkways',
    iconName: 'Sparkles',
    estimatedResolutionHours: 24,
    priority: 'medium',
  },
];
