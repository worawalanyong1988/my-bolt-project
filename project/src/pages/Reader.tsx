import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/store';
import { useRouter } from '@/router';
import { Modal } from '@/components/Modal';
import { STICKERS, ART_STICKERS, TIPS } from '@/mockData';
import { translateText } from '@/utils/translate';
import type { ReadingTheme, FontFamily, Comment } from '@/types';
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Type,
  Sun,
  Moon,
  Coffee,
  Trash2,
  Send,
  Heart,
  Crown,
  Check,
  Lock,
  Languages,
  Loader2,
  Smile,
  Palette,
} from 'lucide-react';

interface ReaderProps {
  storyId: string;
  chapterId: string;
}

const THEME_CONFIG: { value: ReadingTheme; label: string; icon: typeof Sun; bg: string }[] = [
  { value: 'paper', label: 'กระดาษขาวนวล', icon: Sun, bg: 'bg-white' },
  { value: 'sepia', label: 'ซีเปีย', icon: Coffee, bg: 'bg-amber-100' },
  { value: 'night', label: 'กลางคืน', icon: Moon, bg: 'bg-gray-800' },
];

export function Reader({ storyId, chapterId }: ReaderProps) {
  const {
    getStory,
    getChapter,
    state,
    setReadingTheme,
    setFontFamily,
    setFontSize,
    updateProgress,
    getComments,
    addComment,
    deleteComment,
    getTips,
    addTip,
  } = useApp();
  const { navigate, back } = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [stickerTab, setStickerTab] = useState<'emoji' | 'art'>('emoji');
  const [showStickers, setShowStickers] = useState(false);
  const [showTipJar, setShowTipJar] = useState(false);
  const [tipSuccess, setTipSuccess] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [translating, setTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const story = getStory(storyId);
  const chapter = getChapter(storyId, chapterId);

  useEffect(() => {
    if (story && chapter) {
      updateProgress(story.id, chapter.id, 100);
    }
  }, [storyId, chapterId, story, chapter, updateProgress]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    // Reset translation on chapter change
    setTranslatedContent(null);
    setTranslatedTitle(null);
  }, [chapterId]);

  if (!story || !chapter) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-charcoal-muted">ไม่พบตอนนี้</p>
        <button onClick={back} className="mt-4 text-terracotta-500 font-medium">
          ย้อนกลับ
        </button>
      </div>
    );
  }

  const publishedChapters = story.chapters
    .filter((c) => c.status === 'published')
    .sort((a, b) => a.number - b.number);
  const currentIdx = publishedChapters.findIndex((c) => c.id === chapterId);
  const prevChapter = currentIdx > 0 ? publishedChapters[currentIdx - 1] : null;
  const nextChapter =
    currentIdx < publishedChapters.length - 1 ? publishedChapters[currentIdx + 1] : null;

  const isVIPChapter = chapter.access === 'vip' && !story.isFree;
  const locked = isVIPChapter && !state.isVIP;

  const themeClass =
    state.readingTheme === 'sepia'
      ? 'theme-sepia'
      : state.readingTheme === 'night'
        ? 'theme-night'
        : '';

  const fontClass = state.fontFamily === 'sarabun' ? 'font-sarabun' : 'font-plex';
  const isAuthor = true;
  const isEn = !!translatedContent;

  const comments = getComments(chapter.id);
  const tips = getTips(chapter.id);

  const handleSendComment = () => {
    if (commentText.trim()) {
      addComment(chapter.id, commentText.trim(), false);
      setCommentText('');
    }
  };

  const handleStickerClick = (emoji: string) => {
    addComment(chapter.id, emoji, true);
    setShowStickers(false);
  };

  const handleArtStickerClick = (sticker: { id: string; label: string; svg: string }) => {
    addComment(chapter.id, sticker.svg, true);
    setShowStickers(false);
  };

  const handleTip = (amount: number, label: string) => {
    addTip(chapter.id, amount, label);
    setTipSuccess(`${label} ${amount}฿ ส่งถึงนักเขียนแล้ว!`);
    setTimeout(() => {
      setTipSuccess(null);
      setShowTipJar(false);
    }, 2000);
  };

  const handleTranslate = async () => {
    if (isEn) {
      setTranslatedContent(null);
      setTranslatedTitle(null);
      return;
    }
    setTranslating(true);
    try {
      const [content, title] = await Promise.all([
        translateText(chapter.content, 'th', 'en'),
        translateText(chapter.title, 'th', 'en'),
      ]);
      setTranslatedContent(content);
      setTranslatedTitle(title);
    } catch {
      // keep original
    }
    setTranslating(false);
  };

  const displayTitle = translatedTitle || chapter.title;
  const displayContent = translatedContent || chapter.content;

  return (
    <div className={`min-h-screen ${themeClass} ${themeClass ? '' : 'bg-cream-50'}`}>
      {/* Top bar */}
      <div
        className={`sticky top-0 z-40 border-b ${
          state.readingTheme === 'night'
            ? 'bg-gray-900/95 border-gray-700'
            : state.readingTheme === 'sepia'
              ? 'bg-[#f4ecd8]/95 border-amber-200'
              : 'bg-cream-50/95 border-cream-200'
        } backdrop-blur-md`}
      >
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={back}
            className="flex items-center gap-1 text-sm font-medium hover:text-terracotta-500 transition"
          >
            <ChevronLeft size={20} />
            ย้อนกลับ
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={handleTranslate}
              disabled={translating}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition disabled:opacity-50"
              title="แปลภาษา"
            >
              {translating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Languages size={18} />
              )}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition"
            >
              <Type size={18} />
            </button>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div
            className={`border-t px-4 py-3 space-y-3 animate-slide-down ${
              state.readingTheme === 'night' ? 'border-gray-700' : 'border-cream-200'
            }`}
          >
            {/* Font size */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">ขนาดตัวอักษร</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFontSize(state.fontSize - 2)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition"
                >
                  <Minus size={16} />
                </button>
                <span className="text-sm font-bold w-8 text-center">{state.fontSize}</span>
                <button
                  onClick={() => setFontSize(state.fontSize + 2)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Font family */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">แบบตัวอักษร</span>
              <div className="flex gap-2">
                {(['plex', 'sarabun'] as FontFamily[]).map((font) => (
                  <button
                    key={font}
                    onClick={() => setFontFamily(font)}
                    className={`px-4 py-1.5 rounded-full text-sm transition ${
                      state.fontFamily === font
                        ? 'bg-terracotta-500 text-white'
                        : 'bg-black/5 hover:bg-black/10'
                    } ${font === 'sarabun' ? 'font-sarabun' : 'font-plex'}`}
                  >
                    {font === 'plex' ? 'IBM Plex' : 'Sarabun'}
                  </button>
                ))}
              </div>
            </div>

            {/* Reading themes */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">ธีมการอ่าน</span>
              <div className="flex gap-2">
                {THEME_CONFIG.map((theme) => {
                  const Icon = theme.icon;
                  return (
                    <button
                      key={theme.value}
                      onClick={() => setReadingTheme(theme.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                        state.readingTheme === theme.value
                          ? 'bg-terracotta-500 text-white'
                          : 'bg-black/5 hover:bg-black/10'
                      }`}
                    >
                      <Icon size={14} />
                      {theme.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reader content */}
      <div ref={scrollRef} className="max-w-2xl mx-auto px-5 py-6">
        {locked ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Lock size={48} className="text-charcoal-muted mb-4" />
            <h2 className="text-xl font-bold mb-2">ตอนนี้สำหรับสมาชิก VIP</h2>
            <p className="text-sm text-charcoal-muted mb-6">
              สมัครสมาชิกพรีเมียมเพื่ออ่านตอนนี้และทุกตอนที่เหลือ
            </p>
            <button
              onClick={() => navigate({ name: 'story', storyId: story.id })}
              className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-6 py-3 rounded-2xl font-bold text-sm transition shadow-lg active:scale-95"
            >
              <Crown size={16} className="inline mr-1" />
              สมัคร VIP 59฿/เดือน
            </button>
          </div>
        ) : (
          <>
            <h1 className={`text-2xl font-bold mb-1 ${fontClass}`}>{displayTitle}</h1>
            <p className="text-xs text-charcoal-muted mb-6">
              {story.title} · โดย {story.penName}
              {isEn && <span className="ml-2 text-terracotta-500">EN</span>}
            </p>
            <div
              className={`prose-reader ${fontClass}`}
              style={{ fontSize: `${state.fontSize}px`, lineHeight: 2 }}
              dangerouslySetInnerHTML={{ __html: displayContent }}
            />

            {/* Chapter navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-current/10">
              <button
                disabled={!prevChapter}
                onClick={() =>
                  prevChapter &&
                  navigate({ name: 'reader', storyId: story.id, chapterId: prevChapter.id })
                }
                className={`flex items-center gap-1 px-4 py-2.5 rounded-full text-sm font-medium transition ${
                  prevChapter
                    ? 'bg-terracotta-100 text-terracotta-600 hover:bg-terracotta-200 active:scale-95'
                    : 'opacity-30 cursor-not-allowed'
                }`}
              >
                <ChevronLeft size={16} />
                ตอนก่อนหน้า
              </button>
              <button
                disabled={!nextChapter}
                onClick={() =>
                  nextChapter &&
                  navigate({ name: 'reader', storyId: story.id, chapterId: nextChapter.id })
                }
                className={`flex items-center gap-1 px-4 py-2.5 rounded-full text-sm font-medium transition ${
                  nextChapter
                    ? 'bg-terracotta-500 text-white hover:bg-terracotta-600 active:scale-95'
                    : 'opacity-30 cursor-not-allowed'
                }`}
              >
                ตอนถัดไป
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Tip Jar */}
            <div className="mt-8 bg-terracotta-50 rounded-2xl p-4 text-center">
              <h3 className="text-sm font-bold text-charcoal mb-1">โดเนทให้นักเขียน</h3>
              <p className="text-xs text-charcoal-muted mb-3">
                ส่งกำลังใจให้นักเขียนที่เขียนเรื่องที่คุณชอบ
              </p>
              <div className="flex gap-2 justify-center">
                {TIPS.map((tip) => (
                  <button
                    key={tip.amount}
                    onClick={() => handleTip(tip.amount, tip.label)}
                    className="flex flex-col items-center gap-0.5 bg-white px-3 py-2 rounded-xl shadow-sm hover:shadow-md transition active:scale-95 border border-terracotta-100"
                  >
                    <span className="text-lg">{tip.emoji}</span>
                    <span className="text-xs font-semibold text-charcoal">{tip.label}</span>
                    <span className="text-[10px] text-terracotta-500">{tip.amount}฿</span>
                  </button>
                ))}
              </div>
              {tips.length > 0 && (
                <p className="text-[10px] text-charcoal-muted mt-2">
                  ได้รับ {tips.length} รางวัลจากผู้อ่านแล้ว
                </p>
              )}
            </div>

            {/* Comments */}
            <div className="mt-8">
              <h3 className="text-sm font-bold text-charcoal mb-4">
                ความคิดเห็น ({comments.length})
              </h3>

              {/* Comment input */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                  placeholder="แสดงความคิดเห็น..."
                  className="flex-1 px-4 py-2.5 rounded-full bg-black/5 border border-transparent focus:border-terracotta-300 focus:outline-none text-sm"
                />
                <button
                  onClick={() => {
                    setShowStickers(!showStickers);
                    setStickerTab('emoji');
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition shrink-0"
                >
                  <Smile size={18} />
                </button>
                <button
                  onClick={() => {
                    setShowStickers(!showStickers);
                    setStickerTab('art');
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition shrink-0"
                >
                  <Palette size={18} />
                </button>
                <button
                  onClick={handleSendComment}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-terracotta-500 text-white hover:bg-terracotta-600 transition shrink-0 active:scale-90"
                >
                  <Send size={16} />
                </button>
              </div>

              {/* Sticker tray with tabs */}
              {showStickers && (
                <div className="mb-4 bg-black/5 rounded-2xl p-3 animate-slide-down">
                  {/* Tab switcher */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setStickerTab('emoji')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                        stickerTab === 'emoji'
                          ? 'bg-terracotta-500 text-white'
                          : 'bg-white/50 text-charcoal hover:bg-white'
                      }`}
                    >
                      <Smile size={14} />
                      อิโมจิ
                    </button>
                    <button
                      onClick={() => setStickerTab('art')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                        stickerTab === 'art'
                          ? 'bg-terracotta-500 text-white'
                          : 'bg-white/50 text-charcoal hover:bg-white'
                      }`}
                    >
                      <Palette size={14} />
                      สติกเกอร์การ์ตูน
                    </button>
                  </div>

                  {stickerTab === 'emoji' ? (
                    <div className="grid grid-cols-9 gap-1">
                      {STICKERS.map((sticker) => (
                        <button
                          key={sticker.id}
                          onClick={() => handleStickerClick(sticker.emoji)}
                          title={sticker.label}
                          className="aspect-square flex items-center justify-center rounded-lg hover:bg-white/50 transition text-lg active:scale-90"
                        >
                          {sticker.emoji}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {ART_STICKERS.map((sticker) => (
                        <button
                          key={sticker.id}
                          onClick={() => handleArtStickerClick(sticker)}
                          title={sticker.label}
                          className="bg-white rounded-xl p-1.5 hover:shadow-md transition active:scale-95 flex flex-col items-center"
                        >
                          <div
                            className="w-full aspect-square"
                            dangerouslySetInnerHTML={{ __html: sticker.svg }}
                          />
                          <span className="text-[8px] text-charcoal-muted mt-0.5 line-clamp-1">
                            {sticker.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Comment list */}
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-sm text-charcoal-muted text-center py-8">
                    ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความเห็น!
                  </p>
                ) : (
                  comments.map((comment) => <CommentItem key={comment.id} comment={comment} isAuthor={isAuthor} onDelete={deleteComment} />)
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tip success toast */}
      {tipSuccess && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-charcoal text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-slide-up">
          <Heart size={18} className="text-terracotta-400" fill="currentColor" />
          <span className="text-sm font-medium">{tipSuccess}</span>
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  isAuthor,
  onDelete,
}: {
  comment: Comment;
  isAuthor: boolean;
  onDelete: (id: string) => void;
}) {
  const isArtSticker = comment.isSticker && comment.text.includes('<svg');

  return (
    <div className="flex gap-3 group">
      <div
        className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
        style={{ backgroundColor: comment.avatarColor }}
      >
        {comment.author[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-charcoal">
            {comment.author}
          </span>
          <span className="text-[10px] text-charcoal-muted">
            {timeAgo(comment.createdAt)}
          </span>
          {isAuthor && (
            <button
              onClick={() => onDelete(comment.id)}
              className="opacity-0 group-hover:opacity-100 transition text-charcoal-muted hover:text-red-500"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
        {isArtSticker ? (
          <div
            className="mt-1 inline-block w-20 h-20"
            dangerouslySetInnerHTML={{ __html: comment.text }}
          />
        ) : (
          <div
            className={`mt-1 inline-block ${
              comment.isSticker
                ? 'text-2xl'
                : 'text-sm bg-black/5 rounded-2xl px-3 py-2'
            }`}
          >
            {comment.text}
          </div>
        )}
      </div>
    </div>
  );
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'เมื่อสักครู่';
  if (min < 60) return `${min} นาทีที่แล้ว`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ชม.ที่แล้ว`;
  const day = Math.floor(hr / 24);
  return `${day} วันที่แล้ว`;
}
