export const COVER_TEMPLATE_CATEGORIES = [
  { id: 'romance', label: 'โรแมนติก' },
  { id: 'fantasy', label: 'แฟนตาซี' },
  { id: 'drama', label: 'ดราม่า' },
  { id: 'mystery', label: 'สืบสวน' },
  { id: 'bl', label: 'วาย / BL' },
] as const;

export type CoverTemplateCategory = (typeof COVER_TEMPLATE_CATEGORIES)[number]['id'];

const palettes: Record<CoverTemplateCategory, [string, string, string]> = {
  romance: ['#9F3F64', '#F3A58F', '#FFE2B8'],
  fantasy: ['#201B53', '#6955B6', '#9AF2E0'],
  drama: ['#263446', '#9A5966', '#E6B987'],
  mystery: ['#102F38', '#32766E', '#D6B77A'],
  bl: ['#394A78', '#B580C4', '#F4C5D8'],
};

function createCoverImage(category: CoverTemplateCategory, index: number, landscape: boolean): string {
  const [background, accent, highlight] = palettes[category];
  const width = landscape ? 1200 : 600;
  const height = landscape ? 630 : 900;
  const centerX = landscape ? 840 : 300;
  const centerY = landscape ? 315 : 390;
  const title = `${category}-${index + 1}-${landscape ? 'wide' : 'tall'}`;
  const stars = Array.from({ length: 10 }, (_, starIndex) => {
    const x = (starIndex * 83 + index * 47 + 29) % width;
    const y = (starIndex * 137 + index * 61 + 37) % height;
    const radius = 2 + ((starIndex + index) % 4);
    return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${highlight}" opacity=".72"/>`;
  }).join('');
  const geometry = [
    `<circle cx="${centerX}" cy="${centerY}" r="${landscape ? 190 : 170}" fill="url(#glow)" opacity=".92"/>`,
    `<path d="M0 ${height * 0.78} Q${width * 0.3} ${height * 0.55} ${width * 0.56} ${height} H0Z" fill="${accent}" opacity=".62"/>`,
    `<path d="M${width} ${height * 0.68} Q${width * 0.7} ${height * 0.46} ${width * 0.44} ${height} H${width}Z" fill="${highlight}" opacity=".24"/>`,
    `<path d="M${centerX - 30} ${centerY + 260} L${centerX} ${centerY + 40} L${centerX + 30} ${centerY + 260}Z" fill="#17152B" opacity=".8"/>`,
    `<path d="M${centerX - 95} ${centerY + 260} Q${centerX - 80} ${centerY + 130} ${centerX} ${centerY + 120} Q${centerX + 80} ${centerY + 130} ${centerX + 95} ${centerY + 260}Z" fill="#17152B" opacity=".72"/>`,
  ].join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="${background}"/><stop offset="1" stop-color="${accent}"/></linearGradient><radialGradient id="glow"><stop stop-color="${highlight}" stop-opacity=".95"/><stop offset="1" stop-color="${accent}" stop-opacity=".1"/></radialGradient><linearGradient id="shade" y2="1"><stop stop-color="#10121F" stop-opacity="0"/><stop offset="1" stop-color="#10121F" stop-opacity=".72"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#bg)"/><g>${stars}</g>${geometry}<rect width="100%" height="100%" fill="url(#shade)"/><path d="M${width * 0.08} ${height * 0.12} Q${width * 0.5} ${height * 0.05} ${width * 0.92} ${height * 0.12}" fill="none" stroke="${highlight}" stroke-opacity=".5" stroke-width="2"/><title>${title}</title></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function getCoverTemplates(category: CoverTemplateCategory) {
  return Array.from({ length: 5 }, (_, index) => ({
    id: `${category}-${index + 1}`,
    portraitUrl: createCoverImage(category, index, false),
    landscapeUrl: createCoverImage(category, index, true),
  }));
}
