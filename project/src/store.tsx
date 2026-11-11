import {
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  AppState,
  Story,
  Chapter,
  Comment,
  PaymentMethod,
  UserProfile,
} from './types';
import { getInitialState, AVATAR_COLORS } from './mockData';
import { AppContext, type AppContextType } from './storeContext';

const STORAGE_KEY = 'aksara-app-state-v1';
const STATS_RESET_KEY = 'aksara-stats-reset-v1';
const VIEW_SESSION_PREFIX = 'aksara-view-session-v1:';
const viewsClaimedInMemory = new Set<string>();

function claimSessionView(key: string): boolean {
  if (viewsClaimedInMemory.has(key)) return false;
  try {
    if (sessionStorage.getItem(key) === '1') {
      viewsClaimedInMemory.add(key);
      return false;
    }
    sessionStorage.setItem(key, '1');
  } catch (error) {
    console.warn('Unable to persist view deduplication for this browser session.', error);
  }
  viewsClaimedInMemory.add(key);
  return true;
}

function clearSessionViews(): void {
  viewsClaimedInMemory.clear();
  try {
    for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = sessionStorage.key(index);
      if (key?.startsWith(VIEW_SESSION_PREFIX)) sessionStorage.removeItem(key);
    }
  } catch (error) {
    console.warn('Unable to clear session view history.', error);
  }
}

function resetStoredStatistics(state: AppState): AppState {
  return {
    ...state,
    stories: state.stories.map((story) => ({
      ...story,
      readCount: 0,
      likeCount: 0,
      bookmarkCount: 0,
      chapters: story.chapters.map((chapter) => ({ ...chapter, readCount: 0 })),
    })),
    bookmarks: [],
    likedStories: [],
    comments: [],
    tips: [],
    progress: [],
    vipSubscriptions: [],
    writerNotifications: [],
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const initial = getInitialState();
    let loadedState = initial;
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      // Ensure all fields exist (forward compat)
      const stories = (parsed.stories?.length ? parsed.stories : initial.stories).map((s) => ({
        ...initial.stories[0],
        ...s,
        intro: s.intro || '',
        likeCount: s.likeCount || 0,
        bookmarkCount: s.bookmarkCount || 0,
        readCount: typeof s.readCount === 'number' ? s.readCount : 0,
        coverAiUrl: s.coverAiUrl,
        chapters: (s.chapters || []).map((chapter) => ({
          ...chapter,
          readCount: typeof chapter.readCount === 'number' ? chapter.readCount : 0,
        })),
      }));
      loadedState = {
        ...initial,
        ...parsed,
        bookmarks: parsed.bookmarks || [],
        likedStories: parsed.likedStories || [],
        comments: parsed.comments || [],
        vipSubscriptions: parsed.vipSubscriptions || [],
        writerNotifications: parsed.writerNotifications || [],
        tips: (parsed.tips || []).map((tip) => ({
          ...tip,
          storyId:
            tip.storyId ||
            stories.find((story) => story.chapters.some((chapter) => chapter.id === tip.chapterId))?.id,
        })),
        profile: { ...initial.profile, ...parsed.profile },
        stories,
      };
    }
    if (localStorage.getItem(STATS_RESET_KEY) !== '1') {
      loadedState = resetStoredStatistics(loadedState);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loadedState));
      localStorage.setItem(STATS_RESET_KEY, '1');
    }
    return loadedState;
  } catch (error) {
    console.error('Unable to load saved application state; using initial data.', error);
  }
  return getInitialState();
}

function saveState(state: AppState): string | null {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return null;
  } catch (error) {
    console.error('Unable to persist application state.', error);
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      return 'พื้นที่จัดเก็บในอุปกรณ์เต็ม ข้อมูลล่าสุดอาจยังไม่ถูกบันทึก';
    }
    return 'บันทึกข้อมูลในอุปกรณ์ไม่สำเร็จ กรุณาตรวจสอบพื้นที่จัดเก็บและการตั้งค่าเบราว์เซอร์';
  }
}

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);

  useEffect(() => {
    setPersistenceError(saveState(state));
  }, [state]);

  const toggleBookmark = useCallback((storyId: string) => {
    setState((s) => {
      const isBookmarked = s.bookmarks.includes(storyId);
      return {
        ...s,
        bookmarks: isBookmarked
          ? s.bookmarks.filter((id) => id !== storyId)
          : [...s.bookmarks, storyId],
        stories: s.stories.map((story) =>
          story.id === storyId
            ? { ...story, bookmarkCount: Math.max(0, story.bookmarkCount + (isBookmarked ? -1 : 1)) }
            : story,
        ),
      };
    });
  }, []);

  const toggleLike = useCallback((storyId: string) => {
    setState((s) => {
      const isLiked = s.likedStories.includes(storyId);
      return {
        ...s,
        likedStories: isLiked
          ? s.likedStories.filter((id) => id !== storyId)
          : [...s.likedStories, storyId],
        stories: s.stories.map((story) =>
          story.id === storyId
            ? { ...story, likeCount: Math.max(0, story.likeCount + (isLiked ? -1 : 1)) }
            : story,
        ),
        writerNotifications: isLiked
          ? s.writerNotifications
          : [
              {
                id: uid(),
                kind: 'like' as const,
                storyId,
                message: `${s.profile.displayName.trim() || 'นักอ่าน'} กดถูกใจนิยาย`,
                createdAt: Date.now(),
              },
              ...s.writerNotifications,
            ].slice(0, 100),
      };
    });
  }, []);

  const isBookmarked = useCallback(
    (storyId: string) => state.bookmarks.includes(storyId),
    [state.bookmarks],
  );

  const updateProgress = useCallback((storyId: string, chapterId: string, percent: number) => {
    setState((s) => {
      const existing = s.progress.find((p) => p.storyId === storyId);
      if (existing) {
        return {
          ...s,
          progress: s.progress.map((p) =>
            p.storyId === storyId
              ? { ...p, chapterId, percent, updatedAt: Date.now() }
              : p,
          ),
        };
      }
      return {
        ...s,
        progress: [...s.progress, { storyId, chapterId, percent, updatedAt: Date.now() }],
      };
    });
  }, []);

  const recordStoryView = useCallback((storyId: string) => {
    if (!claimSessionView(`${VIEW_SESSION_PREFIX}story:${storyId}`)) return;
    setState((s) => ({
      ...s,
      stories: s.stories.map((story) =>
        story.id === storyId ? { ...story, readCount: story.readCount + 1 } : story,
      ),
    }));
  }, []);

  const recordChapterView = useCallback((storyId: string, chapterId: string) => {
    if (!claimSessionView(`${VIEW_SESSION_PREFIX}chapter:${storyId}:${chapterId}`)) return;
    setState((s) => ({
      ...s,
      stories: s.stories.map((story) =>
        story.id === storyId
          ? {
              ...story,
              chapters: story.chapters.map((chapter) =>
                chapter.id === chapterId
                  ? { ...chapter, readCount: chapter.readCount + 1 }
                  : chapter,
              ),
            }
          : story,
      ),
    }));
  }, []);

  const resetStatistics = useCallback(() => {
    clearSessionViews();
    setState((s) => ({
      ...s,
      stories: s.stories.map((story) => ({
        ...story,
        readCount: 0,
        likeCount: 0,
        bookmarkCount: 0,
        chapters: story.chapters.map((chapter) => ({ ...chapter, readCount: 0 })),
      })),
      bookmarks: [],
      likedStories: [],
      comments: [],
      tips: [],
      progress: [],
      vipSubscriptions: [],
      writerNotifications: [],
    }));
  }, []);

  const getProgress = useCallback(
    (storyId: string) => state.progress.find((p) => p.storyId === storyId),
    [state.progress],
  );

  const addComment = useCallback((
    storyId: string,
    chapterId: string,
    text: string,
    sticker?: Comment['sticker'],
  ) => {
    setState((s) => ({
      ...s,
      comments: [
        ...s.comments,
        {
          id: uid(),
          chapterId,
          author: s.profile.displayName.trim() || 'คุณ',
          avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
          avatarUrl: s.profile.avatarUrl,
          isVIP: s.isVIP,
          isOwn: true,
          text,
          isSticker: !text.trim(),
          sticker,
          createdAt: Date.now(),
        },
      ],
      writerNotifications: [
        {
          id: uid(),
          kind: 'comment' as const,
          storyId,
          chapterId,
          message: `${s.profile.displayName.trim() || 'นักอ่าน'} แสดงความคิดเห็น`,
          createdAt: Date.now(),
        },
        ...s.writerNotifications,
      ].slice(0, 100),
    }));
  }, []);

  const deleteComment = useCallback((commentId: string) => {
    setState((s) => ({
      ...s,
      comments: s.comments.filter((c) => c.id !== commentId),
    }));
  }, []);

  const getComments = useCallback(
    (chapterId: string) =>
      state.comments
        .filter((c) => c.chapterId === chapterId)
        .sort((a, b) => b.createdAt - a.createdAt),
    [state.comments],
  );

  const updateProfile = useCallback((profile: UserProfile) => {
    setState((s) => ({ ...s, profile }));
  }, []);

  const addDonation = useCallback((
    storyId: string,
    chapterId: string,
    donation: {
      stickerId: string;
      stickerEmoji: string;
      label: string;
      amount: number;
      paymentMethod: PaymentMethod;
      message: string;
    },
  ) => {
    setState((s) => {
      const createdAt = Date.now();
      const donor = s.profile.displayName.trim() || 'คุณ';
      const { stickerId, stickerEmoji, label, amount, paymentMethod, message } = donation;
      return {
        ...s,
        tips: [
          ...s.tips,
          {
            id: uid(),
            storyId,
            chapterId,
            amount,
            label,
            donor,
            stickerId,
            stickerEmoji,
            paymentMethod,
            createdAt,
          },
        ],
        writerNotifications: [
          {
            id: uid(),
            kind: 'donation' as const,
            storyId,
            chapterId,
            message: `${donor} ส่ง ${label} มูลค่า ฿${amount.toLocaleString('th-TH')}`,
            createdAt,
          },
          ...s.writerNotifications,
        ].slice(0, 100),
        comments: [
          ...s.comments,
          {
            id: uid(),
            chapterId,
            author: donor,
            avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
            avatarUrl: s.profile.avatarUrl,
            isVIP: s.isVIP,
            isOwn: true,
            text: message.trim(),
            isSticker: false,
            donation: { stickerId, stickerEmoji, label, amount, paymentMethod },
            createdAt,
          },
        ],
      };
    });
  }, []);

  const getTips = useCallback(
    (chapterId: string) => state.tips.filter((t) => t.chapterId === chapterId),
    [state.tips],
  );

  const setVIP = useCallback((vip: boolean, storyId?: string) => {
    setState((s) => {
      if (s.isVIP === vip) return s;
      const createdAt = Date.now();
      return {
        ...s,
        isVIP: vip,
        vipSubscriptions: vip
          ? [{ id: uid(), storyId, createdAt }, ...s.vipSubscriptions]
          : s.vipSubscriptions,
        writerNotifications: vip
          ? [
              {
                id: uid(),
                kind: 'vip' as const,
                storyId,
                message: `${s.profile.displayName.trim() || 'นักอ่าน'} สมัครสมาชิก VIP รายเดือน`,
                createdAt,
              },
              ...s.writerNotifications,
            ].slice(0, 100)
          : s.writerNotifications,
      };
    });
  }, []);

  const setAutoRenew = useCallback((val: boolean) => {
    setState((s) => ({ ...s, autoRenew: val }));
  }, []);

  const setReadingTheme = useCallback((theme: AppState['readingTheme']) => {
    setState((s) => ({ ...s, readingTheme: theme }));
  }, []);

  const setFontFamily = useCallback((font: AppState['fontFamily']) => {
    setState((s) => ({ ...s, fontFamily: font }));
  }, []);

  const setFontSize = useCallback((size: number) => {
    setState((s) => ({ ...s, fontSize: Math.max(14, Math.min(28, size)) }));
  }, []);

  const saveStory = useCallback((story: Story) => {
    setState((s) => {
      const exists = s.stories.find((st) => st.id === story.id);
      const savedStory = { ...story, updatedAt: Date.now() };
      if (exists) {
        return { ...s, stories: s.stories.map((st) => (st.id === story.id ? savedStory : st)) };
      }
      return { ...s, stories: [savedStory, ...s.stories] };
    });
  }, []);

  const deleteStory = useCallback((storyId: string) => {
    setState((s) => ({
      ...s,
      stories: s.stories.filter((st) => st.id !== storyId),
      bookmarks: s.bookmarks.filter((id) => id !== storyId),
      progress: s.progress.filter((p) => p.storyId !== storyId),
      writerNotifications: s.writerNotifications.filter((item) => item.storyId !== storyId),
      comments: s.comments.filter((c) => {
        const story = s.stories.find((st) => st.id === storyId);
        return !story?.chapters.some((ch) => ch.id === c.chapterId);
      }),
      tips: s.tips.filter((tip) => tip.storyId !== storyId),
    }));
  }, []);

  const getStory = useCallback(
    (storyId: string) => state.stories.find((st) => st.id === storyId),
    [state.stories],
  );

  const saveChapter = useCallback((storyId: string, chapter: Chapter) => {
    setState((s) => ({
      ...s,
      stories: s.stories.map((st) => {
        if (st.id !== storyId) return st;
        const exists = st.chapters.find((c) => c.id === chapter.id);
        if (exists) {
          return {
            ...st,
            status: chapter.status === 'published' ? 'published' : st.status,
            chapters: st.chapters.map((c) => (c.id === chapter.id ? chapter : c)),
          };
        }
        const chapters = [...st.chapters, chapter].sort((a, b) => a.number - b.number);
        return {
          ...st,
          status: chapter.status === 'published' ? 'published' : st.status,
          chapters,
        };
      }),
    }));
  }, []);

  const deleteChapter = useCallback((storyId: string, chapterId: string) => {
    setState((s) => ({
      ...s,
      stories: s.stories.map((st) =>
        st.id === storyId
          ? { ...st, chapters: st.chapters.filter((c) => c.id !== chapterId) }
          : st,
      ),
      comments: s.comments.filter((c) => c.chapterId !== chapterId),
      tips: s.tips.filter((tip) => tip.chapterId !== chapterId),
      writerNotifications: s.writerNotifications.filter((item) => item.chapterId !== chapterId),
    }));
  }, []);

  const reorderChapters = useCallback((storyId: string, chapterIds: string[]) => {
    setState((s) => ({
      ...s,
      stories: s.stories.map((st) => {
        if (st.id !== storyId) return st;
        const reordered = chapterIds
          .map((id, idx) => {
            const ch = st.chapters.find((c) => c.id === id);
            return ch ? { ...ch, number: idx + 1 } : null;
          })
          .filter((c): c is Chapter => c !== null);
        return { ...st, chapters: reordered };
      }),
    }));
  }, []);

  const getChapter = useCallback(
    (storyId: string, chapterId: string) => {
      const story = state.stories.find((st) => st.id === storyId);
      return story?.chapters.find((c) => c.id === chapterId);
    },
    [state.stories],
  );

  const value: AppContextType = {
    state,
    persistenceError,
    toggleBookmark,
    toggleLike,
    isBookmarked,
    updateProgress,
    recordStoryView,
    recordChapterView,
    resetStatistics,
    getProgress,
    addComment,
    deleteComment,
    getComments,
    updateProfile,
    addDonation,
    getTips,
    setVIP,
    setAutoRenew,
    setReadingTheme,
    setFontFamily,
    setFontSize,
    saveStory,
    deleteStory,
    getStory,
    saveChapter,
    deleteChapter,
    reorderChapters,
    getChapter,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
