import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { AppState, Story, Chapter, Comment, Tip, ReadingProgress } from './types';
import { getInitialState, AVATAR_COLORS } from './mockData';

const STORAGE_KEY = 'aksara-app-state-v1';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      // Ensure all fields exist (forward compat)
      const initial = getInitialState();
      const stories = (parsed.stories?.length ? parsed.stories : initial.stories).map((s) => ({
        ...initial.stories[0],
        ...s,
        intro: s.intro || '',
        likeCount: s.likeCount || 0,
        bookmarkCount: s.bookmarkCount || 0,
        coverAiUrl: s.coverAiUrl,
      }));
      return {
        ...initial,
        ...parsed,
        stories,
      };
    }
  } catch {
    // ignore
  }
  return getInitialState();
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface AppContextType {
  state: AppState;
  // bookmarks
  toggleBookmark: (storyId: string) => void;
  isBookmarked: (storyId: string) => boolean;
  // progress
  updateProgress: (storyId: string, chapterId: string, percent: number) => void;
  getProgress: (storyId: string) => ReadingProgress | undefined;
  // comments
  addComment: (chapterId: string, text: string, isSticker: boolean) => void;
  deleteComment: (commentId: string) => void;
  getComments: (chapterId: string) => Comment[];
  // tips
  addTip: (chapterId: string, amount: number, label: string) => void;
  getTips: (chapterId: string) => Tip[];
  // VIP
  setVIP: (vip: boolean) => void;
  setAutoRenew: (val: boolean) => void;
  // reader prefs
  setReadingTheme: (theme: AppState['readingTheme']) => void;
  setFontFamily: (font: AppState['fontFamily']) => void;
  setFontSize: (size: number) => void;
  // stories
  saveStory: (story: Story) => void;
  deleteStory: (storyId: string) => void;
  getStory: (storyId: string) => Story | undefined;
  // chapters
  saveChapter: (storyId: string, chapter: Chapter) => void;
  deleteChapter: (storyId: string, chapterId: string) => void;
  reorderChapters: (storyId: string, chapterIds: string[]) => void;
  getChapter: (storyId: string, chapterId: string) => Chapter | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const toggleBookmark = useCallback((storyId: string) => {
    setState((s) => ({
      ...s,
      bookmarks: s.bookmarks.includes(storyId)
        ? s.bookmarks.filter((id) => id !== storyId)
        : [...s.bookmarks, storyId],
    }));
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

  const getProgress = useCallback(
    (storyId: string) => state.progress.find((p) => p.storyId === storyId),
    [state.progress],
  );

  const addComment = useCallback((chapterId: string, text: string, isSticker: boolean) => {
    setState((s) => ({
      ...s,
      comments: [
        ...s.comments,
        {
          id: uid(),
          chapterId,
          author: 'คุณ',
          avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
          text,
          isSticker,
          createdAt: Date.now(),
        },
      ],
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

  const addTip = useCallback((chapterId: string, amount: number, label: string) => {
    setState((s) => ({
      ...s,
      tips: [
        ...s.tips,
        { id: uid(), chapterId, amount, label, donor: 'คุณ', createdAt: Date.now() },
      ],
    }));
  }, []);

  const getTips = useCallback(
    (chapterId: string) => state.tips.filter((t) => t.chapterId === chapterId),
    [state.tips],
  );

  const setVIP = useCallback((vip: boolean) => {
    setState((s) => ({ ...s, isVIP: vip }));
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
      if (exists) {
        return { ...s, stories: s.stories.map((st) => (st.id === story.id ? story : st)) };
      }
      return { ...s, stories: [story, ...s.stories] };
    });
  }, []);

  const deleteStory = useCallback((storyId: string) => {
    setState((s) => ({
      ...s,
      stories: s.stories.filter((st) => st.id !== storyId),
      bookmarks: s.bookmarks.filter((id) => id !== storyId),
      progress: s.progress.filter((p) => p.storyId !== storyId),
      comments: s.comments.filter((c) => {
        const story = s.stories.find((st) => st.id === storyId);
        return !story?.chapters.some((ch) => ch.id === c.chapterId);
      }),
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
          return { ...st, chapters: st.chapters.map((c) => (c.id === chapter.id ? chapter : c)) };
        }
        const chapters = [...st.chapters, chapter].sort((a, b) => a.number - b.number);
        return { ...st, chapters };
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
    toggleBookmark,
    isBookmarked,
    updateProgress,
    getProgress,
    addComment,
    deleteComment,
    getComments,
    addTip,
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

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
