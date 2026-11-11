import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/store';
import { useRouter } from '@/router';
import { NovelCard, formatCount } from '@/components/NovelCard';
import { Cover } from '@/components/Cover';
import { Badge } from '@/components/Badge';
import { ChevronRight, Play, Eye } from 'lucide-react';
import { CATEGORY_FILTERS as CAT_FILTERS } from '@/mockData';

interface HomeProps {
  searchQuery: string;
}

export function Home({ searchQuery }: HomeProps) {
  const { state, getProgress, getStory } = useApp();
  const { navigate } = useRouter();
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('ทั้งหมด');

  const publishedStories = useMemo(
    () => state.stories.filter((s) => s.status === 'published'),
    [state.stories],
  );

  // Search filtering
  const filteredStories = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return publishedStories.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)) ||
        s.category.toLowerCase().includes(q) ||
        s.synopsis.toLowerCase().includes(q),
    );
  }, [searchQuery, publishedStories]);

  // Auto-sliding carousel
  const featured = useMemo(() => publishedStories.slice(0, 3), [publishedStories]);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setCarouselIdx((i) => (i + 1) % featured.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featured.length]);

  const freeNovels = publishedStories.filter((s) => s.isFree);
  const trending = [...publishedStories].sort((a, b) => b.readCount - a.readCount);
  const continueReading = state.progress
    .map((p) => ({ progress: p, story: getStory(p.storyId) }))
    .filter((x) => x.story && x.story.status === 'published')
    .sort((a, b) => b.progress.updatedAt - a.progress.updatedAt)
    .slice(0, 6);

  const categoryStories =
    activeCategory === 'ทั้งหมด'
      ? publishedStories
      : publishedStories.filter((s) => s.category === activeCategory);

  // Search results override everything
  if (filteredStories) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-4">
        <h2 className="text-lg font-bold text-charcoal mb-3">
          ผลการค้นหา "{searchQuery}" ({filteredStories.length})
        </h2>
        {filteredStories.length === 0 ? (
          <p className="text-charcoal-muted text-center py-20">ไม่พบนิยายที่ตรงกับการค้นหา</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredStories.map((story) => (
              <NovelCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-4">
      {/* Hero Carousel */}
      {featured.length > 0 && (
        <div className="relative h-64 sm:h-80 overflow-hidden rounded-b-3xl sm:mx-4 sm:rounded-3xl sm:mt-4">
          {featured.map((story, idx) => (
            <div
              key={story.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                idx === carouselIdx ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="relative w-full h-full">
                <div className="absolute inset-0 overflow-hidden">
                  <Cover story={story} rounded="rounded-none" className="scale-110" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 pb-6">
                  <div className="flex items-end gap-4">
                    <div className="w-20 h-28 rounded-lg overflow-hidden shadow-xl shrink-0 hidden sm:block">
                      <Cover story={story} rounded="rounded-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="published">แนะนำ</Badge>
                        {story.isFree && <Badge variant="free">FREE</Badge>}
                      </div>
                      <h2 className="text-white font-bold text-xl sm:text-2xl font-plex line-clamp-1 drop-shadow">
                        {story.title}
                      </h2>
                      <p className="text-white/80 text-sm line-clamp-2 mt-1 hidden sm:block">
                        {story.synopsis}
                      </p>
                      <button
                        onClick={() => {
                          const firstChapter = story.chapters.find((c) => c.status === 'published');
                          if (firstChapter) {
                            navigate({ name: 'reader', storyId: story.id, chapterId: firstChapter.id });
                          } else {
                            navigate({ name: 'story', storyId: story.id });
                          }
                        }}
                        className="mt-3 inline-flex items-center gap-1.5 bg-terracotta-500 hover:bg-terracotta-600 text-white px-5 py-2 rounded-full text-sm font-semibold transition shadow-lg active:scale-95"
                      >
                        <Play size={16} fill="white" />
                        อ่านเลย
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* Dots */}
          <div className="absolute top-3 right-4 flex gap-1.5">
            {featured.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCarouselIdx(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === carouselIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Continue Reading */}
      {continueReading.length > 0 && (
        <Section title="อ่านต่อ" icon={<Play size={18} className="text-terracotta-500" />}>
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
            {continueReading.map(({ progress, story }) => {
              if (!story) return null;
              const chapter = story.chapters.find((c) => c.id === progress.chapterId);
              return (
                <button
                  key={progress.storyId}
                  onClick={() =>
                    navigate({ name: 'reader', storyId: story.id, chapterId: progress.chapterId })
                  }
                  className="flex gap-3 bg-cream-100 rounded-2xl p-3 w-72 shrink-0 items-center hover:shadow-md transition text-left"
                >
                  <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0">
                    <Cover story={story} rounded="rounded-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-charcoal line-clamp-1">{story.title}</h4>
                    <p className="text-xs text-charcoal-muted line-clamp-1 mt-0.5">
                      {chapter ? `ตอนที่ ${chapter.number}: ${chapter.title}` : ''}
                    </p>
                    <div className="mt-2 h-1.5 bg-cream-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-terracotta-500 rounded-full transition-all"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-charcoal-muted mt-1">{progress.percent}%</p>
                  </div>
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {/* Free Novels */}
      {freeNovels.length > 0 && (
        <Section title="อ่านฟรีจบเรื่อง" badge={<Badge variant="free">FREE</Badge>}>
          <ScrollRow stories={freeNovels} />
        </Section>
      )}

      {/* Trending */}
      <Section title="มาแรงประจำสัปดาห์" icon={<span className="text-base">🔥</span>}>
        <ScrollRow stories={trending} showReadCount />
      </Section>

      {/* Category Filter */}
      <div className="mt-6">
        <div className="px-4">
          <h3 className="text-base font-bold text-charcoal mb-3">หมวดหมู่</h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {CAT_FILTERS.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  activeCategory === cat.value
                    ? 'bg-terracotta-500 text-white shadow-md'
                    : 'bg-cream-100 text-charcoal hover:bg-cream-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-4 mt-4">
          {categoryStories.map((story) => (
            <NovelCard key={story.id} story={story} />
          ))}
        </div>
        {categoryStories.length === 0 && (
          <p className="text-charcoal-muted text-center py-12">ยังไม่มีนิยายในหมวดนี้</p>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  badge,
  icon,
  children,
}: {
  title: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between px-4 mb-3">
        <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
          {icon}
          {title}
          {badge}
        </h3>
      </div>
      {children}
    </div>
  );
}

function ScrollRow({
  stories,
  showReadCount,
}: {
  stories: import('@/types').Story[];
  showReadCount?: boolean;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
      {stories.map((story) => (
        <div key={story.id} className="flex flex-col">
          <NovelCard story={story} />
          {showReadCount && (
            <div className="flex items-center gap-1 mt-1 text-[10px] text-charcoal-muted">
              <Eye size={10} />
              {formatCount(story.readCount)} ครั้ง
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
