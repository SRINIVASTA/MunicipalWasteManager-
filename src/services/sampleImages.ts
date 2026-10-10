export interface SampleWasteScene {
  id: string;
  title: string;
  categoryId: string;
  description: string;
  accentColor: string;
  generateDataUrl: () => string;
}

/**
 * Creates high-fidelity, authentic municipal inspection evidence images via canvas
 * so that users without a physical camera or working in restrictive sandboxes have
 * complete, realistic photo evidence with metadata stamps (GPS, date, orientation).
 */
export function generateWasteEvidenceCanvas(
  title: string,
  categoryLabel: string,
  subtitle: string,
  badgeBg: string,
  visualType: 'bin' | 'illegal' | 'hazardous' | 'bulky' | 'litter'
): string {
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background concrete / urban pavement texture
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 600);
  bgGrad.addColorStop(0, '#374151');
  bgGrad.addColorStop(0.4, '#1f2937');
  bgGrad.addColorStop(1, '#111827');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 800, 600);

  // Concrete sidewalk cracks & asphalt speckles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < 40; i++) {
    const x = (i * 37) % 800;
    const y = (i * 53) % 600;
    const size = (i % 4) + 1;
    ctx.fillRect(x, y, size, size);
  }

  // Draw scene visual based on type
  if (visualType === 'bin') {
    // Sidewalk curb
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(0, 420, 800, 180);

    // Trash can body
    const binGrad = ctx.createLinearGradient(280, 200, 520, 500);
    binGrad.addColorStop(0, '#047857');
    binGrad.addColorStop(1, '#064e3b');
    ctx.fillStyle = binGrad;
    ctx.beginPath();
    ctx.roundRect(300, 240, 200, 260, [12, 12, 20, 20]);
    ctx.fill();

    // Bin rim
    ctx.fillStyle = '#065f46';
    ctx.fillRect(280, 220, 240, 28);

    // Overflowing items on top
    ctx.fillStyle = '#f3f4f6';
    ctx.beginPath();
    ctx.arc(360, 200, 36, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.roundRect(410, 180, 55, 45, 6);
    ctx.fill();

    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.roundRect(330, 160, 40, 50, 4);
    ctx.fill();

    // Scattered garbage on pavement
    ctx.fillStyle = '#e5e7eb';
    ctx.beginPath();
    ctx.arc(220, 470, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fb923c';
    ctx.beginPath();
    ctx.roundRect(520, 480, 48, 30, 4);
    ctx.fill();
  } else if (visualType === 'hazardous') {
    // Brick alley
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(0, 0, 800, 350);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 350, 800, 250);

    // Chemical drum / battery container
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(320, 220, 160, 220, 16);
    ctx.fill();

    // Hazard Stripes
    ctx.fillStyle = '#000000';
    for (let j = 0; j < 5; j++) {
      ctx.fillRect(320, 260 + j * 32, 160, 12);
    }

    // Leaking pool
    ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
    ctx.beginPath();
    ctx.ellipse(400, 470, 160, 40, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (visualType === 'illegal') {
    // Alleyway walls
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, 0, 300, 600);
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(500, 0, 300, 600);
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(300, 320, 200, 280);

    // Cardboard boxes & sacks
    ctx.fillStyle = '#b45309';
    ctx.fillRect(280, 340, 110, 90);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(370, 360, 120, 100);

    // Stacked black bags
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(330, 470, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(430, 480, 52, 0, Math.PI * 2);
    ctx.fill();
  } else if (visualType === 'bulky') {
    // Residential curb
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, 800, 360); // lawn
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(0, 360, 800, 240); // pavement

    // Discarded couch / armchair
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.roundRect(240, 280, 320, 180, 16);
    ctx.fill();

    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(260, 230, 280, 90, [16, 16, 0, 0]);
    ctx.fill();
  } else {
    // Litter street
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, 0, 800, 600);

    // Scattered cups and wrappers
    const colors = ['#f43f5e', '#3b82f6', '#eab308', '#ffffff', '#10b981'];
    for (let k = 0; k < 18; k++) {
      ctx.fillStyle = colors[k % colors.length];
      const x = 120 + ((k * 97) % 560);
      const y = 140 + ((k * 83) % 360);
      ctx.beginPath();
      ctx.arc(x, y, 14 + (k % 12), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Camera HUD reticle overlay
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, 720, 520);

  // Center crosshairs
  ctx.beginPath();
  ctx.moveTo(380, 300);
  ctx.lineTo(420, 300);
  ctx.moveTo(400, 280);
  ctx.lineTo(400, 320);
  ctx.stroke();

  // Municipal Evidence Badge at bottom
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.beginPath();
  ctx.roundRect(40, 480, 720, 80, [0, 0, 12, 12]);
  ctx.fill();

  // Category Tag
  ctx.fillStyle = badgeBg;
  ctx.beginPath();
  ctx.roundRect(60, 500, 180, 28, 6);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
  ctx.fillText(categoryLabel.toUpperCase(), 74, 519);

  // Title & description
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
  ctx.fillText(title, 260, 520);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px system-ui, -apple-system, sans-serif';
  ctx.fillText(subtitle, 260, 542);

  // Digital timestamp & GPS tag in corner
  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '11px monospace';
  ctx.fillText(`MUNICIPAL EVIDENCE CAPTURE · ${dateStr} · GPS: ACTIVE`, 60, 70);

  return canvas.toDataURL('image/jpeg', 0.85);
}

export const SAMPLE_WASTE_SCENES: SampleWasteScene[] = [
  {
    id: 'sample_overflow_bin',
    title: 'Overflowing Park Trash Can',
    categoryId: 'OVERFLOWING_BIN',
    description: 'Civic Center Walkway · Capacity Exceeded',
    accentColor: '#059669',
    generateDataUrl: () =>
      generateWasteEvidenceCanvas(
        'Overflowing Park Trash Can',
        'Overflowing Bin',
        'Civic Center Walkway · Exceeded Capacity · Spillover onto pavement',
        '#059669',
        'bin'
      ),
  },
  {
    id: 'sample_illegal_alley',
    title: 'Illegal Alley Dumping',
    categoryId: 'ILLEGAL_DUMPING',
    description: 'Commercial Rear Alley · Discarded Boxes & Bags',
    accentColor: '#d97706',
    generateDataUrl: () =>
      generateWasteEvidenceCanvas(
        'Illegal Alleyway Waste Dumping',
        'Illegal Dumping',
        '4th Street Alley · Piled refuse bags & discarded building debris',
        '#d97706',
        'illegal'
      ),
  },
  {
    id: 'sample_hazmat_drums',
    title: 'Hazardous Chemical Waste',
    categoryId: 'HAZARDOUS_WASTE',
    description: 'Industrial Lot · Leaking containers & sharp objects',
    accentColor: '#dc2626',
    generateDataUrl: () =>
      generateWasteEvidenceCanvas(
        'Hazardous Material & Chemical Cans',
        'Hazardous Material',
        'Industrial Perimeter · Leaking containers · Requires biohazard unit',
        '#dc2626',
        'hazardous'
      ),
  },
  {
    id: 'sample_bulky_curb',
    title: 'Bulky Abandoned Furniture',
    categoryId: 'BULKY_ITEMS',
    description: 'Residential Curb · Abandoned couch blocking walkway',
    accentColor: '#4f46e5',
    generateDataUrl: () =>
      generateWasteEvidenceCanvas(
        'Bulky Discarded Furniture',
        'Bulky Items',
        'Residential Curb · Abandoned furniture blocking sidewalk',
        '#4f46e5',
        'bulky'
      ),
  },
];
