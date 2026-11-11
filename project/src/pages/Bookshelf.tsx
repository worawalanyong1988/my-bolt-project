import { useApp } from '@/store';
import { useRouter } from '@/router';
import { Cover } from '@/components/Cover';
import { Badge } from '@/components/Badge';
import { BackButton } from '@/components/BackButton';
import { Bookmark, Play, Library } from 'lucide-react';

export function Bookshelf() {
  const { state, getStory, getProgress } = useApp();
  const { navigate } = useRouter();

  const bookmarked = state.bookmarks
    .map((id) => getStory(id))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Library size={22} className="text-terracotta-500" />
          <h1 className="text-xl font-bold text-charcoal">ชั้นหนังสือ</h1>
        </div>
        <span className="text-sm text-charcoal-muted">{bookmarked.length} เรื่อง</span>
      </div>

      {bookmarked.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Bookmark size={48} className="text-cream-200 mb-4" />
          <p className="text-charcoal-muted">ยังไม่มีนิยายในชั้นหนังสือ</p>
          <p className="text-sm text-charcoal-muted mt-1">
            กด "เพิ่มเข้าชั้น" จากหน้านิยายเพื่อบันทึกไว้อ่านต่อ
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarked.map((story) => {
            const progress = getProgress(story.id);
            const lastChapter = progress
              ? story.chapters.find((c) => c.id === progress.chapterId)
              : story.chapters.find((c) => c.status === 'published');
            return (
              <div
                key={story.id}
                className="flex gap-3 bg-cream-100 rounded-2xl p-3 hover:shadow-md transition"
              >
                <button
                  onClick={() => navigate({ name: 'story', storyId: story.id })}
                  className="w-16 h-22 rounded-lg overflow-hidden shrink-0"
                >
                  <Cover story={story} rounded="rounded-lg" />
                </button>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <button
                      onClick={() => navigate({ name: 'story', storyId: story.id })}
                      className="text-left"
                    >
                      <h3 className="text-sm font-semibold text-charcoal line-clamp-1">
                        {story.title}
                      </h3>
                    </button>
                    <p className="text-xs text-charcoal-muted mt-0.5">{story.penName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {story.isFree && <Badge variant="free">FREE</Badge>}
                      {story.ageRating === '18+' && <Badge variant="18+">18+</Badge>}
                      <span className="text-[10px] text-charcoal-muted">
                        {story.chapters.filter((c) => c.status === 'published').length} ตอน
                      </span>
                    </div>
                    {progress && (
                      <div className="mt-2 h-1.5 bg-cream-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-terracotta-500 rounded-full"
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      lastChapter &&
                      navigate({ name: 'reader', storyId: story.id, chapterId: lastChapter.id })
                    }
                    className="inline-flex items-center gap-1.5 bg-terracotta-500 hover:bg-terracotta-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold transition self-start mt-2 active:scale-95"
                  >
                    <Play size={12} fill="white" />
                    อ่านต่อ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
