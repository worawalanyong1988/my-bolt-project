import type { Story } from '@/types';
import { Cover } from './Cover';
import { Badge } from './Badge';
import { useRouter } from '@/router';
import { Eye } from 'lucide-react';

interface NovelCardProps {
  story: Story;
}

export function NovelCard({ story }: NovelCardProps) {
  const { navigate } = useRouter();
  const publishedChapters = story.chapters.filter((c) => c.status === 'published');

  return (
    <button
      onClick={() => navigate({ name: 'story', storyId: story.id })}
      className="flex flex-col text-left group shrink-0 w-36"
    >
      <div className="relative w-36 h-52 overflow-visible rounded-xl shadow-md group-hover:shadow-xl transition-shadow group-active:scale-95 duration-200">
        <Cover story={story} rounded="rounded-xl" />
        {story.isFree && (
          <div className="absolute -top-1 -right-1">
            <Badge variant="free" className="shadow">FREE</Badge>
          </div>
        )}
        {story.ageRating === '18+' && (
          <div className="absolute -top-1 -left-1">
            <Badge variant="18+" className="shadow">18+</Badge>
          </div>
        )}
      </div>
      <div className="mt-2 w-36">
        <h3 className="text-sm font-semibold text-charcoal line-clamp-2 leading-tight">
          {story.title}
        </h3>
        <p className="text-xs text-charcoal-muted mt-0.5">{story.penName}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-charcoal-muted truncate">
            {story.category}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[10px] text-charcoal-muted">
            {publishedChapters.length} ตอน
          </span>
          <span className="text-[10px] text-charcoal-muted">·</span>
          <span className="text-[10px] text-charcoal-muted flex items-center gap-0.5">
            <Eye size={10} />
            {formatCount(story.readCount)}
          </span>
        </div>
      </div>
    </button>
  );
}

export function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}
