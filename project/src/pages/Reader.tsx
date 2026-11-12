import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/useApp';
import { VipLoyaltyBanner } from '@/components/VipLoyaltyBanner';
import { TermsModal } from '@/components/TermsModal';
import { loadChapterContentRemote } from '@/services/supabaseData';
import { useRouter } from '@/router';
import { STICKERS, ART_STICKERS, DONATION_STICKERS } from '@/mockData';
import { translateText } from '@/utils/translate';
import { formatCount } from '@/utils/formatCount';
import { shareLink } from '@/utils/shareLink';
import type { ReadingTheme, FontFamily, Comment, PaymentMethod } from '@/types';
import { Modal } from '@/components/Modal';
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
  Lock,
  Languages,
  Loader2,
  Eye,
  Smile,
  Palette,
  X,
  CreditCard,
  QrCode,
  Wallet,
  List,
  Share2,
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

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: typeof CreditCard }[] = [
  { id: 'card', label: 'บัตรเครดิต/เดบิต', icon: CreditCard },
  { id: 'promptpay', label: 'พร้อมเพย์ QR Code', icon: QrCode },
  { id: 'wallet', label: 'หักจากวอลเล็ต', icon: Wallet },
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
    recordStoryView,
    recordChapterView,
    getComments,
    addComment,
    deleteComment,
    getTips,
    addDonation,
    authUser,
  } = useApp();
  const { navigate } = useRouter();
  const [showVipTerms, setShowVipTerms] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChapterList, setShowChapterList] = useState(false);
  const [stickerTab, setStickerTab] = useState<'emoji' | 'art'>('emoji');
  const [showStickers, setShowStickers] = useState(false);
  const [tipSuccess, setTipSuccess] = useState<string | null>(null);
  const [donationError, setDonationError] = useState<string | null>(null);
  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);
  const [pendingDonation, setPendingDonation] = useState<(typeof DONATION_STICKERS)[number] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [donationMessage, setDonationMessage] = useState('');
  const [commentText, setCommentText] = useState('');
  const [selectedSticker, setSelectedSticker] = useState<NonNullable<Comment['sticker']> | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const [chapterContent, setChapterContent] = useState('');
  const [chapterAuthorNote, setChapterAuthorNote] = useState('');
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const [windowFocused, setWindowFocused] = useState(true);
  const [protectionNotice, setProtectionNotice] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const protectionNoticeTimeout = useRef<number | null>(null);
  const viewedChapterKeyRef = useRef<string | null>(null);
  const viewedStoryIdRef = useRef<string | null>(null);

  const story = getStory(storyId);
  const chapter = getChapter(storyId, chapterId);
  const chapterIdToLoad = chapter?.id;
  const chapterAccess = chapter?.access;

  const showProtectionNotice = useCallback(() => {
    setProtectionNotice('ขออภัย เนื้อหานิยายนี้ได้รับการคุ้มครองลิขสิทธิ์ ไม่อนุญาตให้คัดลอกหรือทำซ้ำ');
    if (protectionNoticeTimeout.current !== null) {
      window.clearTimeout(protectionNoticeTimeout.current);
    }
    protectionNoticeTimeout.current = window.setTimeout(() => setProtectionNotice(null), 3000);
  }, []);

  const handleShare = async () => {
    setShareMessage(null);
    setShareError(null);
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = `#/story/${encodeURIComponent(storyId)}?chapter=${encodeURIComponent(chapterId)}`;
    try {
      const result = await shareLink({
        title: `${chapter?.title ?? 'ตอนนิยาย'} | ${story?.title ?? 'Aksara'}`,
        text: `อ่านตอน ${chapter?.title ?? ''} จากเรื่อง ${story?.title ?? ''} บน Aksara`,
        url: url.href,
      });
      setShareMessage(result === 'shared' ? 'เปิดเมนูแชร์แล้ว' : 'คัดลอกข้อความและลิงก์รายตอนแล้ว');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setShareError(error instanceof Error ? error.message : 'แชร์ลิงก์ตอนนิยายไม่สำเร็จ');
    }
  };

  useEffect(() => {
    let active = true;
    setChapterContent('');
    setChapterAuthorNote('');
    setContentError(null);
    setTranslatedContent(null);
    setTranslatedTitle(null);

    if (!chapterIdToLoad || (chapterAccess === 'vip' && !state.isVIP)) {
      setContentLoading(false);
      return () => {
        active = false;
      };
    }

    setContentLoading(true);
    void loadChapterContentRemote(chapterIdToLoad)
      .then(({ content, authorNote }) => {
        if (active) {
          setChapterContent(content);
          setChapterAuthorNote(authorNote);
        }
      })
      .catch((error: unknown) => {
        if (active) setContentError(error instanceof Error ? error.message : 'โหลดเนื้อหาตอนไม่สำเร็จ');
      })
      .finally(() => {
        if (active) setContentLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authUser?.id, chapterAccess, chapterIdToLoad, state.isVIP]);

  useEffect(() => {
    const handleBlur = () => setWindowFocused(false);
    const handleFocus = () => setWindowFocused(true);
    const handleVisibilityChange = () => setWindowFocused(document.visibilityState === 'visible');
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => () => {
    if (protectionNoticeTimeout.current !== null) {
      window.clearTimeout(protectionNoticeTimeout.current);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const hasModifier = event.ctrlKey || event.metaKey;
      const target = event.target;
      const isEditable = target instanceof HTMLElement
        && (target.isContentEditable || target.matches('input, textarea, select'));
      const copyShortcuts = ['c', 'x', 'a'];
      if (isEditable && hasModifier && copyShortcuts.includes(key)) return;

      const blockedShortcut =
        (hasModifier && ['c', 'x', 'a', 's', 'u', 'p'].includes(key))
        || event.key === 'F12'
        || (hasModifier && event.shiftKey && key === 'i')
        || (event.metaKey && event.altKey && key === 'i');
      if (!blockedShortcut) return;

      event.preventDefault();
      event.stopPropagation();
      if (hasModifier && copyShortcuts.includes(key)) showProtectionNotice();
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [showProtectionNotice]);

  useEffect(() => {
    const viewKey = story && chapter ? `${story.id}:${chapter.id}` : null;
    if (
      story?.status === 'published' &&
      chapter?.status === 'published' &&
      (chapter.access === 'free' || state.isVIP) &&
      viewKey !== viewedChapterKeyRef.current
    ) {
      viewedChapterKeyRef.current = viewKey;
      recordChapterView(story.id, chapter.id);
    }
    if (story?.status === 'published' && viewedStoryIdRef.current !== story.id) {
      viewedStoryIdRef.current = story.id;
      recordStoryView(story.id);
    }
  }, [story, chapter, state.isVIP, recordStoryView, recordChapterView]);

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
        <button
          onClick={() => navigate({ name: 'story', storyId })}
          className="mt-4 text-terracotta-500 font-medium"
        >
          กลับหน้ารายละเอียดนิยาย
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

  const isVIPChapter = chapter.access === 'vip';
  const locked = isVIPChapter && !state.isVIP;

  const themeClass =
    state.readingTheme === 'sepia'
      ? 'theme-sepia'
      : state.readingTheme === 'night'
        ? 'theme-night'
        : '';

  const fontClass = state.fontFamily === 'sarabun' ? 'font-sarabun' : 'font-plex';
  const isEn = !!translatedContent;

  const comments = getComments(chapter.id).map((comment) =>
    comment.isOwn
      ? {
          ...comment,
          author: state.profile.displayName.trim() || 'คุณ',
          avatarUrl: state.profile.avatarUrl,
          isVIP: state.isVIP,
        }
      : comment,
  );
  const tips = getTips(chapter.id);

  const handleSendComment = async () => {
    if (!authUser) {
      navigate({ name: 'profile' });
      return;
    }
    if (commentText.trim() || selectedSticker) {
      try {
        await addComment(story.id, chapter.id, commentText.trim(), selectedSticker || undefined);
        setCommentText('');
        setSelectedSticker(null);
      } catch {
        return;
      }
    }
  };

  const handleStickerClick = (stickerId: string, type: 'emoji' | 'art') => {
    if (!authUser) {
      navigate({ name: 'profile' });
      return;
    }
    const sticker = { id: stickerId, type };
    if (commentText.trim()) {
      setSelectedSticker(sticker);
    } else {
      void addComment(story.id, chapter.id, '', sticker).catch(() => undefined);
    }
    setShowStickers(false);
  };

  const handleConfirmDonation = async () => {
    if (!pendingDonation) return;
    if (!authUser) {
      setPendingDonation(null);
      navigate({ name: 'profile' });
      return;
    }
    setDonationError(null);
    setIsSubmittingDonation(true);
    try {
      await addDonation(story.id, chapter.id, {
        stickerId: pendingDonation.id,
        stickerEmoji: pendingDonation.emoji,
        label: pendingDonation.label,
        amount: pendingDonation.amount,
        paymentMethod,
        message: donationMessage.trim() || 'ขอบคุณสำหรับนิยายสนุกๆ นะคะ!',
      });
      setPendingDonation(null);
      setDonationMessage('');
      setTipSuccess('บันทึกการสนับสนุนลงฐานข้อมูลแล้ว (รายการชำระเงินยังเป็นโหมดจำลอง)');
      setTimeout(() => setTipSuccess(null), 3000);
    } catch (error) {
      setDonationError(error instanceof Error ? error.message : 'บันทึกโดเนทไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      setIsSubmittingDonation(false);
    }
  };

  const handleTranslate = async () => {
    setTranslationError(null);
    if (isEn) {
      setTranslatedContent(null);
      setTranslatedTitle(null);
      return;
    }
    if (!chapterContent) {
      setTranslationError('เนื้อหาตอนนี้ยังไม่พร้อมให้แปล');
      return;
    }
    setTranslating(true);
    try {
      const [content, title] = await Promise.all([
        translateText(chapterContent, 'th', 'en'),
        translateText(chapter.title, 'th', 'en'),
      ]);
      if (content === chapterContent && title === chapter.title) {
        setTranslationError('แปลภาษาไม่สำเร็จในขณะนี้ ลองอีกครั้งภายหลัง');
        return;
      }
      setTranslatedContent(content);
      setTranslatedTitle(title);
    } catch {
      setTranslationError('แปลภาษาไม่สำเร็จในขณะนี้ ลองอีกครั้งภายหลัง');
    } finally {
      setTranslating(false);
    }
  };

  const displayTitle = translatedTitle || chapter.title;
  const displayContent = translatedContent ?? chapterContent;

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
            onClick={() => navigate({ name: 'story', storyId: story.id })}
            className="flex items-center gap-1 text-sm font-medium hover:text-terracotta-500 transition"
            aria-label="กลับหน้ารายละเอียดนิยาย"
          >
            <ChevronLeft size={20} />
            กลับหน้ารายละเอียดเรื่อง
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => void handleShare()}
              aria-label="แชร์ลิงก์ตอนนี้"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={handleTranslate}
              disabled={translating || contentLoading || (!chapterContent && !translatedContent)}
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
        {(shareMessage || shareError) && (
          <p
            className={`mx-auto max-w-2xl px-4 pb-2 text-xs ${shareError ? 'text-red-600' : 'text-emerald-700'}`}
            role={shareError ? 'alert' : 'status'}
          >
            {shareError ?? shareMessage}
          </p>
        )}

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
                  disabled={state.fontSize <= 14}
                  aria-label="ลดขนาดตัวอักษร"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition"
                >
                  <Minus size={16} />
                </button>
                <span className="text-sm font-bold w-8 text-center">{state.fontSize}</span>
                <button
                  onClick={() => setFontSize(state.fontSize + 2)}
                  disabled={state.fontSize >= 28}
                  aria-label="เพิ่มขนาดตัวอักษร"
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
            <h2 className="text-xl font-bold mb-2">ตอนนี้สงวนสิทธิ์เฉพาะสมาชิก VIP รายเดือนเท่านั้น</h2>
            <p className="text-sm text-charcoal-muted mb-6">
              สมัครสมาชิก VIP รายเดือนเพื่อปลดล็อกทุกตอน VIP โดยไม่ต้องจ่ายเพิ่มเป็นรายตอน
            </p>
            <div className="mb-6 w-full">
              <VipLoyaltyBanner coins={state.coins} />
            </div>
            <button
              type="button"
              disabled
              className="rounded-2xl bg-cream-200 px-6 py-3 text-sm font-bold text-charcoal-muted"
            >
              <Crown size={16} className="inline mr-1" />
              สมัคร VIP ยังไม่เปิดใช้งาน
            </button>
            <p className="mt-3 text-xs">
              <button
                type="button"
                onClick={() => setShowVipTerms(true)}
                className="font-semibold text-terracotta-600 underline underline-offset-2"
              >
                เงื่อนไขการสมัคร VIP และนโยบายการคืนเงิน
              </button>
            </p>
            <p className="mt-3 text-[10px] text-charcoal-muted">สถานะ VIP ปรับได้หลังยืนยันการชำระเงินจริงผ่านระบบหลังบ้านเท่านั้น</p>
          </div>
        ) : (
          <>
            <h1 className={`text-2xl font-bold mb-1 ${fontClass}`}>{displayTitle}</h1>
            <p className="text-xs text-charcoal-muted mb-6">
              {story.title} · โดย {story.penName}
              {isEn && <span className="ml-2 text-terracotta-500">EN</span>}
            </p>
            <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-charcoal-muted" aria-label="ยอดเข้าชม">
              <span className="inline-flex items-center gap-1">
                <Eye size={13} />
                ยอดอ่านเรื่อง {formatCount(story.readCount)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye size={13} />
                ตอนนี้ {formatCount(chapter.readCount)}
              </span>
            </div>
            {translationError && (
              <p className="mb-4 text-xs text-red-500" role="alert">{translationError}</p>
            )}
            <div className="relative">
              {contentLoading && (
                <p className="py-12 text-center text-sm text-charcoal-muted" role="status">
                  กำลังโหลดเนื้อหาตอนนี้...
                </p>
              )}
              {contentError && (
                <p className="py-12 text-center text-sm text-red-600" role="alert">
                  โหลดเนื้อหาตอนไม่สำเร็จ: {contentError}
                </p>
              )}
              {!contentLoading && !contentError && chapterContent && (
                <div
                  className={`protected-story-content prose-reader ${fontClass} ${windowFocused ? '' : 'reader-content-hidden'}`}
                  style={{ fontSize: `${state.fontSize}px`, lineHeight: 2 }}
                  onCopy={(event) => {
                    event.preventDefault();
                    showProtectionNotice();
                  }}
                  onCut={(event) => {
                    event.preventDefault();
                    showProtectionNotice();
                  }}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    showProtectionNotice();
                  }}
                  onDragStart={(event) => event.preventDefault()}
                  dangerouslySetInnerHTML={{ __html: displayContent }}
                />
              )}
              {!windowFocused && !contentLoading && !contentError && chapterContent && (
                <div className="reader-focus-overlay" role="status">
                  เนื้อหาถูกซ่อนเมื่อหน้าต่างไม่อยู่ในโฟกัส
                </div>
              )}
              <p className="reader-print-notice" aria-hidden="true">
                เนื้อหานิยายนี้ได้รับการคุ้มครองลิขสิทธิ์ © Aksara
              </p>
            </div>
            {chapterAuthorNote && (
              <aside className="mt-8 rounded-2xl border border-terracotta-100 bg-white/80 p-5 shadow-sm">
                <h2 className="mb-2 text-sm font-bold text-terracotta-700">พูดคุยกับนักอ่าน</h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-charcoal-light">{chapterAuthorNote}</p>
              </aside>
            )}

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
                type="button"
                onClick={() => setShowChapterList(true)}
                className="flex items-center gap-1 rounded-full bg-cream-100 px-4 py-2.5 text-sm font-medium text-charcoal transition hover:bg-cream-200"
              >
                <List size={16} />
                สารบัญ
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

            {story.status === 'published' && (
              <section className="mt-8 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-rose-50 to-white p-4 shadow-sm sm:p-5" aria-label="สติกเกอร์โดเนท">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-charcoal">สติกเกอร์โดเนทสนับสนุนนักเขียน</h3>
                    <p className="mt-1 text-xs text-charcoal-muted">
                      เลือกของขวัญเพื่อส่งกำลังใจ ทุกครั้งต้องยืนยันก่อนบันทึก
                    </p>
                  </div>
                  <Heart size={20} className="shrink-0 text-rose-400" fill="currentColor" />
                </div>
                <div className="space-y-4">
                  {[
                    { title: 'กำลังใจเล็กๆ', range: [9, 19, 29] },
                    { title: 'เปย์ระดับกลาง', range: [59, 99, 199] },
                    { title: 'สายเปย์ตัวจริง', range: [499, 999, 1999] },
                  ].map((tier) => (
                    <div key={tier.title}>
                      <h4 className="mb-2 text-xs font-bold text-amber-900">{tier.title}</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {DONATION_STICKERS.filter((sticker) => tier.range.includes(sticker.amount)).map((sticker) => (
                          <button
                            key={sticker.id}
                            type="button"
                            onClick={() => {
                              if (!authUser) {
                                navigate({ name: 'profile' });
                                return;
                              }
                              setDonationError(null);
                              setPendingDonation(sticker);
                              setPaymentMethod('card');
                            }}
                            className="flex min-h-28 flex-col items-center justify-center rounded-2xl border border-white bg-white/90 p-2 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md active:scale-95"
                          >
                            <span className="text-4xl leading-none" aria-hidden="true">{sticker.emoji}</span>
                            <span className="mt-2 text-[10px] font-semibold leading-tight text-charcoal sm:text-xs">
                              {sticker.label}
                            </span>
                            <span className="mt-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-900">
                              ฿{sticker.amount.toLocaleString('th-TH')}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {tips.length > 0 && (
                  <p className="mt-3 text-center text-[10px] text-charcoal-muted">
                    มีประวัติการสนับสนุน {tips.length} รายการในตอนนี้
                  </p>
                )}
                <p className="mt-3 text-center text-[10px] text-charcoal-muted">
                    ข้อมูลโดเนทจะบันทึกใน Supabase แต่ช่องทางชำระเงินยังเป็นตัวอย่างและไม่มีการเรียกเก็บเงินจริง
                </p>
                  {!authUser && (
                    <button type="button" onClick={() => navigate({ name: 'profile' })} className="mt-3 w-full rounded-xl bg-terracotta-50 px-3 py-2 text-xs font-semibold text-terracotta-700">
                      เข้าสู่ระบบเพื่อส่งสติกเกอร์สนับสนุน
                    </button>
                  )}
              </section>
            )}

            {story.status === 'published' && (
            <section className="mt-8" aria-label="ความคิดเห็นใต้นิยาย">
              <h3 className="text-sm font-bold text-charcoal mb-4">
                ความคิดเห็น ({comments.length})
              </h3>

              {/* Comment input */}
              <div className="mb-3 rounded-2xl border border-cream-200 bg-white/70 p-3">
                {!authUser && (
                  <button type="button" onClick={() => navigate({ name: 'profile' })} className="mb-3 w-full rounded-xl bg-terracotta-50 px-3 py-2 text-xs font-semibold text-terracotta-700">
                    เข้าสู่ระบบเพื่อแสดงความคิดเห็นหรือส่งสติกเกอร์
                  </button>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    disabled={!authUser}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && void handleSendComment()}
                    placeholder="แสดงความคิดเห็น..."
                    className="min-w-0 flex-1 rounded-full border border-transparent bg-black/5 px-4 py-2.5 text-sm focus:border-terracotta-300 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowStickers(!showStickers);
                      setStickerTab('art');
                    }}
                    aria-label="เลือกสติกเกอร์แสดงอารมณ์"
                    aria-expanded={showStickers}
                    disabled={!authUser}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta-100 text-terracotta-700 transition hover:bg-terracotta-200"
                  >
                    <Palette size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSendComment()}
                    disabled={!authUser || (!commentText.trim() && !selectedSticker)}
                    aria-label="ส่งความคิดเห็น"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta-500 text-white transition hover:bg-terracotta-600 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send size={16} />
                  </button>
                </div>
                {selectedSticker && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-terracotta-50 px-3 py-2">
                    <ReactionStickerPreview sticker={selectedSticker} className="h-12 w-12" />
                    <span className="flex-1 text-xs font-medium text-charcoal">
                      แนบสติกเกอร์ {getStickerLabel(selectedSticker)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedSticker(null)}
                      aria-label="นำสติกเกอร์ที่เลือกออก"
                      className="rounded-full p-1 text-charcoal-muted hover:bg-terracotta-100 hover:text-charcoal"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}
              </div>

              {/* Sticker tray with tabs */}
              {showStickers && (
                <div className="mb-4 bg-black/5 rounded-2xl p-3 animate-slide-down">
                  <div className="mb-3">
                    <p className="text-xs font-bold text-charcoal">สติกเกอร์คอมเมนต์ฟรี</p>
                    <p className="mt-1 text-[10px] text-charcoal-muted">
                      แตะเพื่อส่งได้เลย หรือพิมพ์ข้อความก่อนเพื่อแนบสติกเกอร์
                    </p>
                  </div>
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
                      อารมณ์ฟรี
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
                      สติกเกอร์ฟรี
                    </button>
                  </div>

                  {stickerTab === 'emoji' ? (
                    <div className="grid grid-cols-9 gap-1">
                      {STICKERS.map((sticker) => (
                        <button
                          type="button"
                          key={sticker.id}
                          onClick={() => handleStickerClick(sticker.id, 'emoji')}
                          title={sticker.label}
                          aria-label={`ส่งสติกเกอร์ ${sticker.label}`}
                          className="aspect-square flex items-center justify-center rounded-lg hover:bg-white/50 transition text-2xl active:scale-90"
                        >
                          {sticker.emoji}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {ART_STICKERS.map((sticker) => (
                        <button
                          type="button"
                          key={sticker.id}
                          onClick={() => handleStickerClick(sticker.id, 'art')}
                          title={sticker.label}
                          aria-label={`ส่งสติกเกอร์ ${sticker.label}`}
                          className="bg-white rounded-xl p-1.5 hover:shadow-md transition active:scale-95 flex flex-col items-center"
                        >
                          <ReactionStickerPreview sticker={{ id: sticker.id, type: 'art' }} className="w-full aspect-square" />
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
                  comments.map((comment) => <CommentItem key={comment.id} comment={comment} onDelete={deleteComment} />)
                )}
              </div>
            </section>
            )}
          </>
        )}
      </div>

      {/* Tip success toast */}
      {tipSuccess && (
        <div role="status" className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-white shadow-xl animate-slide-up">
          <Heart size={18} className="text-emerald-100" fill="currentColor" />
          <span className="text-sm font-medium">{tipSuccess}</span>
        </div>
      )}
      <Modal
        open={showChapterList}
        onClose={() => setShowChapterList(false)}
        title={`สารบัญ · ${story.title}`}
        maxWidth="max-w-lg"
      >
        <div className="space-y-2">
          {publishedChapters.map((item) => {
            const itemLocked = item.access === 'vip' && !state.isVIP;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setShowChapterList(false);
                  navigate({ name: 'reader', storyId: story.id, chapterId: item.id });
                }}
                className="flex w-full items-center gap-3 rounded-xl bg-cream-100 p-3 text-left transition hover:bg-cream-200"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terracotta-100 text-xs font-bold text-terracotta-700">
                  {item.number}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-charcoal">{item.title}</span>
                {itemLocked && (
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">VIP</span>
                )}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setShowChapterList(false);
              navigate({ name: 'story', storyId: story.id });
            }}
            className="mt-3 w-full rounded-xl border border-cream-200 bg-white px-4 py-3 text-sm font-semibold text-terracotta-700 transition hover:bg-cream-50"
          >
            กลับหน้ารายละเอียดนิยาย
          </button>
        </div>
      </Modal>
      <Modal
        open={!!pendingDonation}
        onClose={() => setPendingDonation(null)}
        title="ยืนยันการโดเนท"
        maxWidth="max-w-md"
      >
        {pendingDonation && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-rose-50 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white text-5xl shadow-sm">
                  {pendingDonation.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-charcoal">{pendingDonation.label}</p>
                  <p className="mt-1 text-2xl font-extrabold text-amber-700">
                    ฿{pendingDonation.amount.toLocaleString('th-TH')}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm font-semibold leading-relaxed text-charcoal">
              {paymentMethod === 'card'
                ? 'ต้องการยืนยันการโดเนทและตัดชำระเงินผ่านบัตรเครดิต/เดบิต หรือไม่?'
                : `ต้องการยืนยันการโดเนทและชำระเงินผ่าน ${
                    paymentMethod === 'promptpay' ? 'พร้อมเพย์ QR Code' : 'วอลเล็ต'
                  } หรือไม่?`}
            </p>

            <fieldset>
              <legend className="mb-2 text-xs font-bold text-charcoal">เลือกช่องทางชำระเงินจำลอง</legend>
              <div className="space-y-2">
                {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
                  <label
                    key={id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                      paymentMethod === id
                        ? 'border-terracotta-400 bg-terracotta-50'
                        : 'border-cream-200 bg-white hover:bg-cream-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="donation-payment-method"
                      value={id}
                      checked={paymentMethod === id}
                      onChange={() => setPaymentMethod(id)}
                      className="accent-terracotta-500"
                    />
                    <Icon size={18} className="text-terracotta-600" />
                    <span className="text-sm font-medium text-charcoal">{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="donation-message" className="mb-1.5 block text-xs font-semibold text-charcoal">
                ข้อความส่งกำลังใจ
              </label>
              <textarea
                id="donation-message"
                value={donationMessage}
                onChange={(event) => setDonationMessage(event.target.value)}
                maxLength={240}
                rows={2}
                placeholder="ขอบคุณสำหรับนิยายสนุกๆ นะคะ!"
                className="w-full resize-none rounded-xl border border-cream-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300"
              />
            </div>

            <p className="rounded-lg bg-amber-50 px-3 py-2 text-[10px] leading-relaxed text-amber-900">
              โหมดทดลอง: การยืนยันจะบันทึกประวัติโดเนทและคอมเมนต์ลง Supabase แต่ไม่ได้เชื่อมผู้ให้บริการชำระเงิน จึงไม่มีการตัดเงินจริง
            </p>
            {donationError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{donationError}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPendingDonation(null)}
                disabled={isSubmittingDonation}
                className="flex-1 rounded-xl bg-cream-200 py-3 text-sm font-semibold text-charcoal transition hover:bg-cream-200/80"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDonation}
                disabled={isSubmittingDonation}
                className="flex-1 rounded-xl bg-terracotta-500 py-3 text-sm font-bold text-white transition hover:bg-terracotta-600 disabled:opacity-50"
              >
                {isSubmittingDonation ? 'กำลังบันทึก...' : paymentMethod === 'card'
                  ? 'ยืนยันชำระเงินผ่านบัตร'
                  : paymentMethod === 'promptpay'
                    ? 'ยืนยันชำระเงินผ่านพร้อมเพย์'
                    : 'ยืนยันชำระเงินผ่านวอลเล็ต'}
              </button>
            </div>
          </div>
        )}
      </Modal>
      <TermsModal
        open={showVipTerms}
        onClose={() => setShowVipTerms(false)}
        initialTab="vip"
      />
      {protectionNotice && (
        <div
          className="reader-protection-toast fixed bottom-6 left-1/2 z-[120] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-xl bg-charcoal px-4 py-3 text-center text-xs font-medium text-white shadow-xl"
          role="alert"
          aria-live="assertive"
        >
          {protectionNotice}
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  onDelete,
}: {
  comment: Comment;
  onDelete: (id: string) => void;
}) {
  const isLegacyArtSticker =
    !comment.sticker && comment.isSticker && comment.text.includes('<svg');

  return (
    <div className="flex gap-3 group">
      <div
        className={`h-10 w-10 rounded-full shrink-0 p-0.5 ${
          comment.isVIP
            ? 'bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-700 shadow-[0_0_12px_rgba(251,191,36,0.55)]'
            : 'bg-cream-200'
        }`}
      >
        <div
          className="flex h-full w-full items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: comment.avatarColor }}
        >
          {comment.avatarUrl ? (
            <img src={comment.avatarUrl} alt={`รูปโปรไฟล์ ${comment.author}`} className="h-full w-full object-cover" />
          ) : (
            comment.author[0]
          )}
        </div>
      </div>
      <div
        className={`flex-1 min-w-0 ${
          comment.donation
            ? 'rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50 via-rose-50 to-yellow-50 p-3 shadow-md'
            : ''
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs font-semibold ${comment.isVIP ? 'text-amber-700' : 'text-charcoal'}`}>
            {comment.author}
          </span>
          {comment.isVIP ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-300 to-yellow-500 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-amber-950">
              <Crown size={10} fill="currentColor" />
              VIP
            </span>
          ) : (
            <span className="rounded-full bg-cream-100 px-2 py-0.5 text-[9px] font-medium text-charcoal-muted">
              สมาชิกทั่วไป
            </span>
          )}
          <span className="text-[10px] text-charcoal-muted">
            {timeAgo(comment.createdAt)}
          </span>
          {comment.isOwn && (
            <button
              onClick={() => onDelete(comment.id)}
              aria-label="ลบความคิดเห็นของฉัน"
              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition text-charcoal-muted hover:text-red-500"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
        {comment.donation ? (
          <div className="mt-2">
            <div className="flex items-center gap-3">
              <span className="text-5xl leading-none" aria-label={comment.donation.label}>
                {comment.donation.stickerEmoji}
              </span>
              <div>
                <p className="text-xs font-bold text-amber-900">{comment.donation.label}</p>
                <span className="mt-1 inline-flex rounded-full border border-amber-300 bg-gradient-to-r from-amber-200 to-yellow-300 px-2.5 py-1 text-xs font-extrabold text-amber-950 shadow-sm">
                  สนับสนุน ฿{comment.donation.amount.toLocaleString('th-TH')}
                </span>
              </div>
            </div>
            {comment.text.trim() && (
              <p className="mt-2 border-t border-amber-200/80 pt-2 text-sm text-amber-950">
                {comment.text}
              </p>
            )}
          </div>
        ) : comment.sticker && (
          <div className="mt-1 inline-flex rounded-2xl border border-cream-200 bg-white/80 p-2 shadow-sm">
            <ReactionStickerPreview sticker={comment.sticker} className="h-24 w-24 sm:h-28 sm:w-28" />
          </div>
        )}
        {isLegacyArtSticker ? (
          <div
            className="mt-1 inline-block w-20 h-20"
            dangerouslySetInnerHTML={{ __html: comment.text }}
          />
        ) : !comment.donation && comment.text.trim() ? (
          <div
            className={`mt-1 inline-block ${
              comment.isSticker && !comment.sticker
                ? 'text-2xl'
                : comment.isVIP
                  ? 'border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-100 text-amber-950 shadow-sm rounded-2xl px-3 py-2 text-sm'
                  : 'text-sm bg-black/5 rounded-2xl px-3 py-2'
            }`}
          >
            {comment.text}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ReactionStickerPreview({
  sticker,
  className = '',
}: {
  sticker: NonNullable<Comment['sticker']>;
  className?: string;
}) {
  if (sticker.type === 'emoji') {
    const emoji = STICKERS.find((item) => item.id === sticker.id)?.emoji;
    return (
      <div className={`flex items-center justify-center text-5xl ${className}`} aria-hidden="true">
        {emoji || '✨'}
      </div>
    );
  }

  const artwork = ART_STICKERS.find((item) => item.id === sticker.id);
  if (!artwork) {
    return <div className={className} aria-label="สติกเกอร์" />;
  }

  return (
    <div
      className={className}
      role="img"
      aria-label={artwork.label}
      dangerouslySetInnerHTML={{ __html: artwork.svg }}
    />
  );
}

function getStickerLabel(sticker: NonNullable<Comment['sticker']>): string {
  return sticker.type === 'emoji'
    ? STICKERS.find((item) => item.id === sticker.id)?.label || 'อารมณ์'
    : ART_STICKERS.find((item) => item.id === sticker.id)?.label || 'อารมณ์';
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
