export const COVER_TEMPLATE_CATEGORIES = [
  { id: 'romance', label: 'โรแมนติก' },
  { id: 'fantasy', label: 'แฟนตาซี' },
  { id: 'drama', label: 'ดราม่า' },
  { id: 'mystery', label: 'สืบสวน / ระทึกขวัญ' },
  { id: 'bl', label: 'วาย / BL' },
] as const;

export type CoverTemplateCategory = (typeof COVER_TEMPLATE_CATEGORIES)[number]['id'];

const templates: Record<CoverTemplateCategory, string[]> = {
  romance: [
    'photo-1490750967868-88aa4486c946',
    'photo-1518199266791-5375a83190b7',
    'photo-1516589178581-6cd7833ae3b2',
    'photo-1523438885200-e635ba2c371e',
    'photo-1470252649378-9c29740c9fa8',
  ],
  fantasy: [
    'photo-1518709268805-4e9042af9f23',
    'photo-1519681393784-d120267933ba',
    'photo-1462331940025-496dfbfc7564',
    'photo-1470770841072-f978cf4d019e',
    'photo-1500530855697-b586d89ba3ee',
  ],
  drama: [
    'photo-1518837695005-2083093ee35b',
    'photo-1500534623283-312aade485b7',
    'photo-1519608487953-e999c86e7455',
    'photo-1507525428034-b723cf961d3e',
    'photo-1497250681960-ef046c08a56e',
  ],
  mystery: [
    'photo-1519501025264-65ba15a82390',
    'photo-1514565131-fce0801e5785',
    'photo-1511818966892-d7d671e672a2',
    'photo-1518005020951-eccb494ad742',
    'photo-1519608487953-e999c86e7455',
  ],
  bl: [
    'photo-1529636798458-92182e662485',
    'photo-1529333166437-7750a6dd5a70',
    'photo-1522673607200-164d1b6ce486',
    'photo-1511988617509-a57c8a288659',
    'photo-1516589178581-6cd7833ae3b2',
  ],
};

function unsplashImage(photoId: string, orientation: 'portrait' | 'landscape'): string {
  const dimensions = orientation === 'portrait'
    ? 'w=600&h=900'
    : 'w=1200&h=630';
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&crop=entropy&${dimensions}&q=80`;
}

export function getCoverTemplates(category: CoverTemplateCategory) {
  return templates[category].map((photoId, index) => ({
    id: `${category}-${index + 1}`,
    portraitUrl: unsplashImage(photoId, 'portrait'),
    landscapeUrl: unsplashImage(photoId, 'landscape'),
  }));
}
