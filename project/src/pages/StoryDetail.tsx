import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/useApp';
import { useRouter } from '@/router';
import { Cover } from '@/components/Cover';
import { Badge } from '@/components/Badge';
import { Modal } from '@/components/Modal';
import { VipLoyaltyBanner } from '@/components/VipLoyaltyBanner';
import { TermsModal } from '@/components/TermsModal';
import { formatCount } from '@/utils/formatCount';
import { shareLink } from '@/utils/shareLink';
import { translateText } from '@/utils/translate';
import {
  Bookmark,
  BookmarkCheck,
  Eye,
  Heart,
  Crown,
  Check,
  Lock,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Play,
  Share2,
  Languages,
  Loader2,
} from 'lucide-react';

interface StoryDetailProps {
  storyId: string;
  chapterId?: string;
  onTagSelect: (tag: string) => void;
}

export function StoryDetail({ storyId, chapterId, onTagSelect }: StoryDetailProps) {
  const { getStory, isBookmarked, toggleBookmark, toggleLike, state, recordStoryView, authUser } = useApp();
  const { navigate, back } = useRouter();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showVipTerms, setShowVipTerms] = useState(false);
  const [acceptedVipTerms, setAcceptedVipTerms] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [translatedSynopsis, setTranslatedSynopsis] = useState<string | null>(null);
  const [translatedIntro, setTranslatedIntro] = useState<string | null>(null);
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const viewedStoryIdRef = useRef<string | null>(null);
  const handledChapterLinkRef = useRef<string | null>(null);
  const vipCheckoutAvailable = false;

  const story = getStory(storyId);

  useEffect(() => {
    if (story?.status === 'published' && viewedStoryIdRef.current !== story.id) {
      viewedStoryIdRef.current = story.id;
      recordStoryView(story.id);
    }
  }, [story, recordStoryView]);

  useEffect(() => {
    if (!chapterId || !story || story.status !== 'published') return;
    const targetChapter = story.chapters.find((chapter) => chapter.id === chapterId);
    if (!targetChapter || targetChapter.status !== 'published') return;
    if (targetChapter.access === 'vip' && !state.isVIP) {
      setAcceptedVipTerms(false);
      setShowPaywall(true);
      return;
    }

    const linkKey = `${story.id}:${targetChapter.id}`;
    if (handledChapterLinkRef.current === linkKey) return;
    handledChapterLinkRef.current = linkKey;
    navigate({ name: 'reader', storyId: story.id, chapterId: targetChapter.id });
  }, [chapterId, navigate, state.isVIP, story]);

  const handleShare = async () => {
    if (!story) return;
    setShareMessage(null);
    setShareError(null);
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = `#/story/${encodeURIComponent(story.id)}`;
    try {
      const result = await shareLink({
        title: story.title,
        text: `อ่านเรื่อง ${story.title} โดย ${story.penName} บน Aksara`,
        url: url.href,
      });
      setShareMessage(result === 'shared' ? 'เปิดเมนูแชร์แล้ว' : 'คัดลอกข้อความและลิงก์นิยายแล้ว');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setShareError(error instanceof Error ? error.message : 'แชร์ลิงก์นิยายไม่สำเร็จ');
    }
  };

  const isEn = !!translatedSynopsis;

  const handleTranslate = async () => {
    setTranslationError(null);
    if (isEn) {
      setTranslatedSynopsis(null);
      setTranslatedIntro(null);
      setTranslatedTitle(null);
      return;
    }
    setTranslating(true);
    try {
      const [syn, intro, title] = await Promise.all([
        translateText(story!.synopsis, 'th', 'en'),
        translateText(story!.intro, 'th', 'en'),
        translateText(story!.title, 'th', 'en'),
      ]);
      if (syn === story!.synopsis && title === story!.title) {
        setTranslationError('แปลภาษาไม่สำเร็จในขณะนี้ ลองอีกครั้งภายหลัง');
        return;
      }
      setTranslatedSynopsis(syn);
      setTranslatedIntro(intro);
      setTranslatedTitle(title);
    } catch {
      setTranslationError('แปลภาษาไม่สำเร็จในขณะนี้ ลองอีกครั้งภายหลัง');
    } finally {
      setTranslating(false);
    }
  };

  const displayTitle = translatedTitle || story?.title || '';
  const displaySynopsis = translatedSynopsis || story?.synopsis || '';
  const displayIntro = translatedIntro || story?.intro || '';

  if (!story) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <p className="text-charcoal-muted">ไม่พบนิยายเรื่องนี้</p>
        <button onClick={back} className="mt-4 text-terracotta-500 font-medium">
          ย้อนกลับ
        </button>
      </div>
    );
  }

  const publishedChapters = story.chapters
    .filter((c) => c.status === 'published')
    .sort((a, b) => a.number - b.number);
  const bookmarked = isBookmarked(story.id);
  const synopsisLong = story.synopsis.length > 200;

  const handleChapterClick = (chapterId: string, isVIP: boolean) => {
    if (isVIP && !state.isVIP) {
      setAcceptedVipTerms(false);
      setShowPaywall(true);
      return;
    }
    navigate({ name: 'reader', storyId: story.id, chapterId });
  };

  const firstChapter = publishedChapters[0];

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* Cinematic cover hero */}
      <div className="relative h-72 sm:h-80 overflow-hidden">
        <div className="absolute inset-0">
          <Cover story={story} variant="landscape" rounded="rounded-none" className="scale-110" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-cream-50 via-cream-50/30 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={back}
            className="flex items-center gap-1 text-sm font-medium text-white bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full hover:bg-black/60 transition"
          >
            <ChevronLeft size={16} />
            ย้อนกลับ
          </button>
        </div>

        {/* Translate toggle */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleTranslate}
            disabled={translating}
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full hover:bg-black/60 transition disabled:opacity-50"
          >
            {translating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Languages size={14} />
            )}
            {isEn ? 'TH' : 'EN'}
          </button>
        </div>
      </div>

      <div className="px-4 -mt-24 relative">
        {translationError && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600" role="alert">
            {translationError}
          </p>
        )}
        {/* Title + cover + author */}
        <div className="flex gap-4">
          <div className="w-32 h-44 rounded-xl overflow-hidden shadow-2xl shrink-0 ring-4 ring-cream-50">
            <Cover story={story} rounded="rounded-xl" />
          </div>
          <div className="flex-1 pt-16 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
              {story.isFree && <Badge variant="free">FREE</Badge>}
              {story.ageRating === '18+' && <Badge variant="18+">18+</Badge>}
              <span className="text-[10px] text-charcoal-muted bg-cream-200 px-2 py-0.5 rounded-full truncate max-w-[140px]">
                {story.category}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-charcoal font-plex leading-tight">
              {displayTitle}
            </h1>
            <p className="text-sm text-charcoal-muted mt-1">โดย {story.penName}</p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-4 grid grid-cols-4 gap-2 bg-cream-100 rounded-2xl p-3">
          <Stat icon={<Eye size={14} />} label="อ่าน" value={formatCount(story.readCount)} />
          <button
            type="button"
            onClick={() => authUser ? toggleLike(story.id) : navigate({ name: 'profile' })}
            aria-pressed={state.likedStories.includes(story.id)}
            className={`flex flex-col items-center text-center transition ${
              state.likedStories.includes(story.id) ? 'text-rose-600' : 'text-charcoal'
            }`}
          >
            <span className="mb-0.5 flex items-center gap-1 text-rose-500">
              <Heart size={14} fill={state.likedStories.includes(story.id) ? 'currentColor' : 'none'} />
            </span>
            <span className="text-sm font-bold">{formatCount(story.likeCount)}</span>
            <span className="text-[10px] text-charcoal-muted">ถูกใจ</span>
          </button>
          <Stat
            icon={<BookmarkCheck size={14} />}
            label="เก็บ"
            value={formatCount(story.bookmarkCount)}
          />
          <Stat icon={<BookIcon />} label="ตอน" value={String(publishedChapters.length)} />
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => authUser ? toggleBookmark(story.id) : navigate({ name: 'profile' })}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition active:scale-95 ${
              bookmarked
                ? 'bg-terracotta-100 text-terracotta-600 border border-terracotta-200'
                : 'bg-cream-100 text-charcoal hover:bg-cream-200 border border-cream-200'
            }`}
          >
            {bookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            {bookmarked ? 'เก็บแล้ว' : 'เก็บ'}
          </button>
          <button
            type="button"
            onClick={() => void handleShare()}
            aria-label="แชร์นิยาย"
            className="flex items-center justify-center gap-2 rounded-2xl border border-cream-200 bg-cream-100 px-4 py-3 text-sm font-semibold text-charcoal transition hover:bg-cream-200 active:scale-95"
          >
            <Share2 size={18} />
            แชร์
          </button>
          {firstChapter && (
            <button
              onClick={() => handleChapterClick(firstChapter.id, firstChapter.access === 'vip')}
              className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-2xl bg-terracotta-500 text-white font-bold text-sm hover:bg-terracotta-600 transition shadow-lg active:scale-95"
            >
              <Play size={18} fill="white" />
              {state.isVIP || story.isFree ? 'อ่านเลย' : 'เริ่มอ่านฟรี'}
            </button>
          )}
        </div>
        {shareMessage && <p className="mt-2 text-xs text-emerald-700" role="status">{shareMessage}</p>}
        {shareError && <p className="mt-2 text-xs text-red-600" role="alert">{shareError}</p>}

        {/* Synopsis */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-charcoal">
              {isEn ? 'Synopsis' : 'เรื่องย่อ'}
            </h2>
            {synopsisLong && (
              <button
                onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                className="text-xs text-terracotta-600 font-medium flex items-center gap-0.5"
              >
                {synopsisExpanded ? 'ย่อ' : 'อ่านต่อ'}
                {synopsisExpanded ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </button>
            )}
          </div>
          <p
            className={`text-sm text-charcoal-light leading-relaxed ${
              synopsisExpanded || !synopsisLong ? '' : 'line-clamp-3'
            }`}
          >
            {displaySynopsis}
          </p>
          <p className="text-[10px] text-charcoal-muted mt-2">
            {story.synopsis.length} ตัวอักษร
          </p>
        </div>

        {/* Intro / Story Introduction */}
        {displayIntro && (
          <div className="mt-6 bg-gradient-to-br from-cream-100 to-cream-50 rounded-2xl p-5 border border-cream-200">
            <h2 className="text-sm font-bold text-charcoal mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-terracotta-500 rounded-full" />
              {isEn ? 'Story Introduction' : 'แนะนำเรื่อง'}
            </h2>
            <div
              className="prose-intro text-sm text-charcoal-light leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(displayIntro) }}
            />
          </div>
        )}

        {/* Hashtags */}
        {story.tags.length > 0 && (
          <div className="mt-5">
            <div className="flex flex-wrap gap-2">
              {story.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagSelect(tag)}
                  className="text-xs text-terracotta-600 bg-terracotta-50 px-3 py-1.5 rounded-full font-medium hover:bg-terracotta-100 transition"
                >
                  #{tag.replace(/^#/, '')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chapter list */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-charcoal">
              {isEn ? 'Chapters' : 'ตอนทั้งหมด'}
              <span className="text-charcoal-muted font-normal ml-1">
                ({publishedChapters.length})
              </span>
            </h2>
          </div>
          <div className="space-y-2">
            {publishedChapters.map((chapter) => {
              const isVIPChapter = chapter.access === 'vip';
              const locked = isVIPChapter && !state.isVIP;
              return (
                <button
                  key={chapter.id}
                  onClick={() => handleChapterClick(chapter.id, isVIPChapter)}
                  className="w-full flex items-center gap-3 bg-cream-100 hover:bg-cream-200 rounded-xl p-3 transition text-left group"
                >
                  <div className="w-9 h-9 rounded-full bg-terracotta-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-terracotta-600">
                      {chapter.number}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-charcoal line-clamp-1">
                      {chapter.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {chapter.access === 'free' ? (
                        <Badge variant="free">ฟรี</Badge>
                      ) : (
                        <Badge variant="vip">
                          <Crown size={9} className="inline mr-0.5" />
                          VIP
                        </Badge>
                      )}
                      {(chapter.wordCount !== undefined || chapter.content) && (
                        <span className="text-[10px] text-charcoal-muted">
                          {chapter.wordCount ?? wordCount(chapter.content)} คำ
                        </span>
                      )}
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-charcoal-muted">
                        <Eye size={11} />
                        {formatCount(chapter.readCount)}
                      </span>
                    </div>
                  </div>
                  {locked ? (
                    <Lock size={18} className="text-charcoal-muted shrink-0" />
                  ) : (
                    <Play
                      size={16}
                      className="text-terracotta-500 shrink-0 opacity-0 group-hover:opacity-100 transition"
                      fill="currentColor"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Paywall modal */}
      <Modal open={showPaywall} onClose={() => setShowPaywall(false)} maxWidth="max-w-sm">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Crown size={32} className="text-amber-900" />
          </div>
          <h2 className="text-xl font-bold text-charcoal">สมาชิก VIP รายเดือน</h2>
          <p className="text-sm text-charcoal-muted mt-2">
            ปลดล็อกทุกตอน VIP ทุกเรื่องด้วยสมาชิกแบบรายเดือน ไม่มีการซื้อแยกเป็นรายตอน
          </p>

          <div className="mt-5 bg-cream-100 rounded-2xl p-4">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-3xl font-bold text-terracotta-500">
                {state.hasNextMonthDiscount ? '47.20' : '59'}
              </span>
              <span className="text-sm text-charcoal-muted">บาท/เดือน</span>
            </div>
            <p className="text-xs text-charcoal-muted line-through mt-1">
              {state.hasNextMonthDiscount ? '59 บาท (ส่วนลด 20%)' : 'ปกติ 99 บาท'}
            </p>
            <div className="mt-3 space-y-2 text-left">
              {[
                'อ่านทุกตอนไม่จำกัด',
                'ไม่มีโฆษณารบกวน',
                'รองรับทุกแนวนิยาย',
                'ยกเลิกได้ทุกเมื่อ',
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-2 text-sm text-charcoal">
                  <Check size={16} className="text-emerald-500 shrink-0" />
                  {feat}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 text-left">
            <VipLoyaltyBanner coins={state.coins} />
          </div>

          <div className="mt-5 text-left">
            <div className="flex items-start gap-2 rounded-xl border border-cream-200 bg-white p-3 text-xs leading-relaxed text-charcoal">
              <input
                id="accept-vip-terms"
                type="checkbox"
                checked={acceptedVipTerms}
                onChange={(event) => setAcceptedVipTerms(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-terracotta-500"
              />
              <div>
                <label htmlFor="accept-vip-terms">ข้าพเจ้าได้อ่านและยอมรับ </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaywall(false);
                    setShowVipTerms(true);
                  }}
                  className="font-semibold text-terracotta-600 underline underline-offset-2"
                >
                  เงื่อนไขการสมัครสมาชิก VIP นโยบายการคืนเงิน และกฎการใช้งาน
                </button>
                <label htmlFor="accept-vip-terms"> แอป Aksara เรียบร้อยแล้ว</label>
              </div>
            </div>
            <button
              type="button"
              disabled={!acceptedVipTerms || !vipCheckoutAvailable}
              className="mt-3 w-full rounded-2xl bg-terracotta-500 py-3 text-sm font-bold text-white transition hover:bg-terracotta-600 disabled:cursor-not-allowed disabled:bg-cream-200 disabled:text-charcoal-muted"
            >
              ยืนยันการชำระเงิน
            </button>
            {!vipCheckoutAvailable && (
              <p className="mt-2 text-center text-[10px] text-charcoal-muted" role="status">
                ระบบสมัคร VIP และชำระเงินจริงยังไม่เปิดใช้งาน
              </p>
            )}
          </div>
          <button
            onClick={() => setShowPaywall(false)}
            className="mt-2 w-full text-charcoal-muted text-sm py-2 hover:text-charcoal transition"
          >
            ไว้ทีหลัง
          </button>
        </div>
      </Modal>
      <TermsModal
        open={showVipTerms}
        onClose={() => {
          setShowVipTerms(false);
          setShowPaywall(true);
        }}
        initialTab="vip"
        onAccept={() => {
          setAcceptedVipTerms(true);
          setShowVipTerms(false);
          setShowPaywall(true);
        }}
      />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center gap-1 text-terracotta-500 mb-0.5">{icon}</div>
      <span className="text-sm font-bold text-charcoal">{value}</span>
      <span className="text-[10px] text-charcoal-muted">{label}</span>
    </div>
  );
}

function BookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function wordCount(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

// Simple markdown-to-HTML renderer for intro field
function renderMarkdown(md: string): string {
  const lines = md.split('\n');
  const html: string[] = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('## ')) {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push(`<h3 class="text-sm font-bold text-charcoal mt-3 mb-1">${trimmed.slice(3)}</h3>`);
    } else if (trimmed.startsWith('> ')) {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push(`<blockquote class="border-l-3 border-terracotta-300 pl-3 italic text-charcoal-muted my-2">${trimmed.slice(2)}</blockquote>`);
    } else if (trimmed.startsWith('- ')) {
      if (!inList) { html.push('<ul class="list-disc pl-5 my-1 space-y-0.5">'); inList = true; }
      html.push(`<li>${inlineFormat(trimmed.slice(2))}</li>`);
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push(`<p class="font-bold text-charcoal mt-2">${trimmed.slice(2, -2)}</p>`);
    } else if (trimmed === '') {
      if (inList) { html.push('</ul>'); inList = false; }
    } else {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push(`<p class="my-1">${inlineFormat(trimmed)}</p>`);
    }
  }
  if (inList) html.push('</ul>');
  return html.join('');
}

function inlineFormat(text: string): string {
  // **bold**
  return text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-charcoal">$1</strong>');
}
