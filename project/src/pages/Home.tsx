import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/useApp';
import { useRouter } from '@/router';
import { NovelCard } from '@/components/NovelCard';
import { formatCount } from '@/utils/formatCount';
import { Cover } from '@/components/Cover';
import { Badge } from '@/components/Badge';
import { Play, Eye, X } from 'lucide-react';
import { CATEGORY_FILTERS as CAT_FILTERS } from '@/mockData';

interface HomeProps {
  searchQuery: string;
  activeTag: string | null;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onTagSelect: (tag: string) => void;
  onTagClear: () => void;
  onSearchClear: () => void;
}

type StorySort = 'recent' | 'views' | 'likes';

export function Home({
  searchQuery,
  activeTag,
  activeCategory,
  onCategoryChange,
  onTagSelect,
  onTagClear,
  onSearchClear,
}: HomeProps) {
  const { state, getStory } = useApp();
  const { navigate } = useRouter();
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [sortBy, setSortBy] = useState<StorySort>('recent');

  const publishedStories = useMemo(
    () => state.stories.filter((s) => s.status === 'published'),
    [state.stories],
  );

  const filteredStories = useMemo(() => {
    const rawQuery = searchQuery.trim().toLocaleLowerCase('th-TH');
    const isTagSearch = rawQuery.startsWith('#');
    const query = rawQuery.replace(/^#/, '');
    const tagQuery = activeTag?.replace(/^#/, '').toLocaleLowerCase('th-TH');
    const matches = publishedStories.filter((story) => {
      const tags = story.tags.map((tag) => tag.replace(/^#/, '').toLocaleLowerCase('th-TH'));
      const matchesSearch = !query || (isTagSearch
        ? tags.some((tag) => tag.includes(query))
        : story.title.toLocaleLowerCase('th-TH').includes(query) ||
          story.synopsis.toLocaleLowerCase('th-TH').includes(query) ||
          story.category.toLocaleLowerCase('th-TH').includes(query) ||
          tags.some((tag) => tag.includes(query)));
      const matchesCategory = activeCategory === 'ทั้งหมด' || story.category === activeCategory;
      return matchesSearch && matchesCategory && (!tagQuery || tags.some((tag) => tag === tagQuery));
    });

    return matches.sort((a, b) => {
      if (sortBy === 'views') return b.readCount - a.readCount;
      if (sortBy === 'likes') return b.likeCount - a.likeCount;
      return (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt);
    });
  }, [activeCategory, activeTag, publishedStories, searchQuery, sortBy]);

  // Auto-sliding carousel
  const featured = useMemo(() => publishedStories.slice(0, 3), [publishedStories]);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setCarouselIdx((i) => (i + 1) % featured.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featured.length]);

  const sortStories = (stories: typeof publishedStories) =>
    [...stories].sort((a, b) => {
      if (sortBy === 'views') return b.readCount - a.readCount;
      if (sortBy === 'likes') return b.likeCount - a.likeCount;
      return (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt);
    });
  const freeNovels = sortStories(publishedStories.filter((s) => s.isFree));
  const trending = [...publishedStories].sort((a, b) => b.readCount - a.readCount);
  const continueReading = state.progress
    .map((p) => ({ progress: p, story: getStory(p.storyId) }))
    .filter((x) => x.story && x.story.status === 'published')
    .sort((a, b) => b.progress.updatedAt - a.progress.updatedAt)
    .slice(0, 6);

  const categoryStories = sortStories(
    activeCategory === 'ทั้งหมด'
      ? publishedStories
      : publishedStories.filter((s) => s.category === activeCategory),
  );

  const isFiltering = Boolean(searchQuery.trim() || activeTag || activeCategory !== 'ทั้งหมด');
  const sortControl = (
    <label className="flex items-center gap-2 text-xs font-medium text-charcoal-muted">
      เรียงตาม
      <select
        value={sortBy}
        onChange={(event) => setSortBy(event.target.value as StorySort)}
        className="rounded-lg border border-cream-200 bg-white px-2.5 py-2 text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta-300"
      >
        <option value="recent">อัปเดตล่าสุด</option>
        <option value="views">ยอดเข้าชมสูงสุด</option>
        <option value="likes">ยอดถูกใจสูงสุด</option>
      </select>
    </label>
  );

  if (isFiltering) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-charcoal">
              {activeTag && !searchQuery.trim() ? 'นิยายตามแท็ก' : 'ผลการค้นหา'} ({filteredStories.length})
            </h2>
            {activeTag && (
              <span className="inline-flex items-center gap-1 rounded-full bg-terracotta-50 px-3 py-1 text-xs font-semibold text-terracotta-700">
                #{activeTag.replace(/^#/, '')}
                <button type="button" onClick={onTagClear} aria-label="ล้างตัวกรองแท็ก" className="rounded-full hover:bg-terracotta-100">
                  <X size={14} />
                </button>
              </span>
            )}
            {activeCategory !== 'ทั้งหมด' && (
              <button
                type="button"
                onClick={() => onCategoryChange('ทั้งหมด')}
                className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-3 py-1 text-xs font-semibold text-charcoal hover:bg-cream-200"
              >
                {CAT_FILTERS.find((category) => category.value === activeCategory)?.label ?? activeCategory}
                <X size={14} />
              </button>
            )}
          </div>
          {sortControl}
        </div>
        {filteredStories.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-charcoal-muted">ขออภัย ไม่พบนิยายที่ตรงกับคำค้นหาหรือแท็กนี้</p>
            <div className="mt-4 flex justify-center gap-2">
              {searchQuery.trim() && <button type="button" onClick={onSearchClear} className="rounded-full bg-terracotta-500 px-4 py-2 text-xs font-semibold text-white hover:bg-terracotta-600">ล้างคำค้นหา</button>}
              {activeTag && <button type="button" onClick={onTagClear} className="rounded-full bg-cream-200 px-4 py-2 text-xs font-semibold text-charcoal hover:bg-cream-300">ล้างตัวกรองแท็ก</button>}
              {activeCategory !== 'ทั้งหมด' && <button type="button" onClick={() => onCategoryChange('ทั้งหมด')} className="rounded-full bg-cream-200 px-4 py-2 text-xs font-semibold text-charcoal hover:bg-cream-300">ล้างหมวดหมู่</button>}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredStories.map((story) => (
              <NovelCard key={story.id} story={story} onTagClick={onTagSelect} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-4">
      <div className="flex justify-end px-4 pt-4">{sortControl}</div>
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
                  <Cover story={story} variant="landscape" rounded="rounded-none" className="scale-110" />
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
                      {story.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {story.tags.slice(0, 3).map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => onTagSelect(tag)}
                              className="rounded-full bg-white/20 px-2 py-1 text-[10px] font-medium text-white hover:bg-white/30"
                            >
                              #{tag.replace(/^#/, '')}
                            </button>
                          ))}
                        </div>
                      )}
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
              const savedChapter = story.chapters.find((c) => c.id === progress.chapterId);
              const chapter = savedChapter?.status === 'published'
                ? savedChapter
                : story.chapters
                    .filter((c) => c.status === 'published' && (!savedChapter || c.number <= savedChapter.number))
                    .sort((a, b) => b.number - a.number)[0] ??
                  story.chapters.find((c) => c.status === 'published');
              return (
                <button
                  key={progress.storyId}
                  onClick={() =>
                    chapter
                      ? navigate({ name: 'reader', storyId: story.id, chapterId: chapter.id })
                      : navigate({ name: 'story', storyId: story.id })
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
                    <p className="mt-1 text-[10px] font-medium text-terracotta-700">
                      {chapter ? `อ่านถึงตอนที่ ${chapter.number}` : 'ยังไม่มีประวัติการอ่าน'}
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
          <ScrollRow stories={freeNovels} onTagClick={onTagSelect} />
        </Section>
      )}

      {/* Trending */}
      <Section title="มาแรงประจำสัปดาห์" icon={<span className="text-base">🔥</span>}>
        <ScrollRow stories={trending} showReadCount onTagClick={onTagSelect} />
      </Section>

      {/* Category Filter */}
      <div className="mt-6">
        <div className="px-4">
          <h3 className="text-base font-bold text-charcoal mb-3">หมวดหมู่</h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {CAT_FILTERS.map((cat) => (
              <button
                key={cat.value}
                onClick={() => onCategoryChange(cat.value)}
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
            <NovelCard key={story.id} story={story} onTagClick={onTagSelect} />
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
  onTagClick,
}: {
  stories: import('@/types').Story[];
  showReadCount?: boolean;
  onTagClick?: (tag: string) => void;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
      {stories.map((story) => (
        <div key={story.id} className="flex flex-col">
          <NovelCard story={story} onTagClick={onTagClick} />
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
