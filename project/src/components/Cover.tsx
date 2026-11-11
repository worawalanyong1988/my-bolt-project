import { useState } from 'react';
import type { Story } from '@/types';

interface CoverProps {
  story: Story;
  className?: string;
  rounded?: string;
}

export function Cover({ story, className = '', rounded = 'rounded-lg' }: CoverProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const imgUrl = story.coverAiUrl || story.coverImage;

  if (imgUrl && failedUrl !== imgUrl) {
    return (
      <div className={`relative w-full h-full overflow-hidden ${rounded} ${className}`}>
        <img
          src={imgUrl}
          alt={story.title}
          onError={() => setFailedUrl(imgUrl)}
          className="object-cover w-full h-full"
        />
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

  return (
    <div className={`flex items-center justify-center bg-cream-200 ${rounded} ${className}`}>
      <div className="px-2 text-center text-[10px] text-charcoal-muted">ยังไม่มีภาพปก</div>
    </div>
  );
}
