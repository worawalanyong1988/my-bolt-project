import { useState } from 'react';
import type { Story } from '@/types';

interface CoverProps {
  story: Story;
  className?: string;
  rounded?: string;
}

// Deterministic AI-cover simulator: generates a styled cover from story metadata
export function Cover({ story, className = '', rounded = 'rounded-lg' }: CoverProps) {
  const [imageFailed, setImageFailed] = useState(false);
  // AI-generated or uploaded cover image — render with stylish title/author overlay
  if ((story.coverImage || story.coverAiUrl) && !imageFailed) {
    const imgUrl = story.coverAiUrl || story.coverImage;
    return (
      <div className={`relative w-full h-full overflow-hidden ${rounded} ${className}`}>
        <img
          src={imgUrl}
          alt={story.title}
          onError={() => setImageFailed(true)}
          className="object-cover w-full h-full"
        />
        {/* Stylish title + author overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
          <div className="text-white font-plex font-bold text-sm leading-tight line-clamp-2 drop-shadow-lg">
            {story.title}
          </div>
          <div className="text-white/80 text-[10px] font-plex mt-0.5 drop-shadow">
            {story.penName}
          </div>
        </div>
      </div>
    );
  }

  const pattern = story.coverPattern || 'stars';
  const baseColor = story.coverColor || '#E07A5F';

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${rounded} ${className}`}
      style={{ background: gradientFor(baseColor) }}
    >
      <Pattern pattern={pattern} color={baseColor} />
      <div className="absolute inset-0 flex flex-col justify-between p-3">
        <div className="text-white/80 text-[10px] font-plex tracking-wider uppercase">
          {story.category}
        </div>
        <div>
          <div className="text-white font-plex font-bold text-sm leading-tight line-clamp-3 drop-shadow-md">
            {story.title}
          </div>
          <div className="text-white/70 text-[10px] font-plex mt-1">
            {story.penName}
          </div>
        </div>
      </div>
    </div>
  );
}

function gradientFor(color: string): string {
  return `linear-gradient(135deg, ${color} 0%, ${darken(color, 30)} 100%)`;
}

function darken(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const factor = 1 - amount / 100;
  return `#${Math.round(r * factor).toString(16).padStart(2, '0')}${Math.round(g * factor)
    .toString(16)
    .padStart(2, '0')}${Math.round(b * factor).toString(16).padStart(2, '0')}`;
}

function Pattern({ pattern, color }: { pattern: string; color: string }) {
  const lightColor = lighten(color, 40);

  if (pattern === 'stars') {
    const stars = Array.from({ length: 20 }, (_, i) => ({
      cx: (i * 37) % 100,
      cy: (i * 53) % 100,
      r: (i % 3) * 0.5 + 0.5,
    }));
    return (
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
        {stars.map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={lightColor} />
        ))}
      </svg>
    );
  }

  if (pattern === 'waves') {
    return (
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
        {[0, 20, 40, 60, 80].map((y, i) => (
          <path
            key={i}
            d={`M0,${y} Q25,${y - 5} 50,${y} T100,${y} L100,100 L0,100 Z`}
            fill={lightColor}
            opacity={0.3 + i * 0.1}
          />
        ))}
      </svg>
    );
  }

  if (pattern === 'palace') {
    return (
      <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points="50,10 30,35 70,35" fill={lightColor} />
        <rect x="25" y="35" width="50" height="50" fill={lightColor} opacity="0.6" />
        <rect x="35" y="50" width="30" height="35" fill={color} opacity="0.4" />
        <polygon points="20,35 50,15 80,35" fill={lightColor} opacity="0.5" />
      </svg>
    );
  }

  if (pattern === 'flowers') {
    const flowers = Array.from({ length: 8 }, (_, i) => ({
      cx: (i * 41 + 15) % 100,
      cy: (i * 29 + 20) % 100,
    }));
    return (
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
        {flowers.map((f, i) => (
          <g key={i} transform={`translate(${f.cx}, ${f.cy})`}>
            {[0, 72, 144, 216, 288].map((rot) => (
              <ellipse
                key={rot}
                cx="0"
                cy="-3"
                rx="2"
                ry="4"
                fill={lightColor}
                transform={`rotate(${rot})`}
              />
            ))}
            <circle cx="0" cy="0" r="1.5" fill={lightColor} />
          </g>
        ))}
      </svg>
    );
  }

  // default: geometric
  return (
    <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 100" preserveAspectRatio="none">
      {[10, 30, 50, 70, 90].map((y, i) => (
        <line key={i} x1="0" y1={y} x2="100" y2={y} stroke={lightColor} strokeWidth="0.3" />
      ))}
    </svg>
  );
}

function lighten(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const factor = 1 + amount / 100;
  return `#${Math.min(255, Math.round(r * factor)).toString(16).padStart(2, '0')}${Math.min(
    255,
    Math.round(g * factor),
  )
    .toString(16)
    .padStart(2, '0')}${Math.min(255, Math.round(b * factor)).toString(16).padStart(2, '0')}`;
}

// AI cover simulator: picks a pattern and color based on synopsis keywords
export function generateAICover(synopsis: string, category: string): { color: string; pattern: string } {
  const text = (synopsis + ' ' + category).toLowerCase();

  if (text.includes('ทะเล') || text.includes('น้ำ') || text.includes('สึนามิ') || text.includes('มหาสมุทร')) {
    return { color: '#2C5F7C', pattern: 'waves' };
  }
  if (text.includes('วัง') || text.includes('ย้อนยุค') || text.includes('ทะลุมิติ') || text.includes('ประวัติศาสตร์')) {
    return { color: '#7C5E3C', pattern: 'palace' };
  }
  if (text.includes('ดอกไม้') || text.includes('รัก') || text.includes('โรแมนติก')) {
    return { color: '#8E9B6E', pattern: 'flowers' };
  }
  if (text.includes('ดาว') || text.includes('ความรัก') || text.includes('วาย') || text.includes('bl')) {
    return { color: '#E07A5F', pattern: 'stars' };
  }
  return { color: '#9B6A6C', pattern: 'geometric' };
}
