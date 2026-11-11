import type { Story } from '@/types';
import { Cover } from './Cover';
import { Badge } from './Badge';
import { useRouter } from '@/router';
import { Bookmark, Eye, Heart } from 'lucide-react';
import { formatCount } from '@/utils/formatCount';

interface NovelCardProps {
  story: Story;
  onTagClick?: (tag: string) => void;
}

export function NovelCard({ story, onTagClick }: NovelCardProps) {
  const { navigate } = useRouter();
  const publishedChapters = story.chapters.filter((c) => c.status === 'published');

  return (
    <div className="flex w-36 shrink-0 flex-col">
      <button
        type="button"
        onClick={() => navigate({ name: 'story', storyId: story.id })}
        className="group flex flex-col text-left"
      >
        <div className="relative h-52 w-36 overflow-visible rounded-xl shadow-md transition-shadow duration-200 group-hover:shadow-xl group-active:scale-95">
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
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-charcoal">{story.title}</h3>
          <p className="mt-0.5 text-xs text-charcoal-muted">{story.penName}</p>
          <div className="mt-1 flex items-center justify-between">
            <span className="truncate text-[10px] text-charcoal-muted">{story.category}</span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-1">
            <span className="text-[10px] text-charcoal-muted">{publishedChapters.length} ตอน</span>
            <span className="text-[10px] text-charcoal-muted">·</span>
            <span className="flex items-center gap-0.5 text-[10px] text-charcoal-muted"><Eye size={10} />{formatCount(story.readCount)}</span>
            <span className="flex items-center gap-0.5 text-[10px] text-charcoal-muted"><Heart size={10} />{formatCount(story.likeCount)}</span>
            <span className="flex items-center gap-0.5 text-[10px] text-charcoal-muted"><Bookmark size={10} />{formatCount(story.bookmarkCount)}</span>
          </div>
        </div>
      </button>
      {onTagClick && story.tags.length > 0 && (
        <div className="mt-2 flex max-h-14 flex-wrap gap-1 overflow-hidden">
          {story.tags.slice(0, 3).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick(tag)}
              className="rounded-full bg-terracotta-50 px-2 py-0.5 text-[9px] font-medium text-terracotta-700 transition hover:bg-terracotta-100"
            >
              #{tag.replace(/^#/, '')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
