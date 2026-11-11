import { createContext } from 'react';
import type {
  AppState,
  Chapter,
  Comment,
  PaymentMethod,
  ReadingProgress,
  Story,
  Tip,
  UserProfile,
} from './types';

export interface AppContextType {
  state: AppState;
  toggleBookmark: (storyId: string) => void;
  toggleLike: (storyId: string) => void;
  isBookmarked: (storyId: string) => boolean;
  updateProgress: (storyId: string, chapterId: string, percent: number) => void;
  recordStoryView: (storyId: string) => void;
  recordChapterView: (storyId: string, chapterId: string) => void;
  resetStatistics: () => void;
  getProgress: (storyId: string) => ReadingProgress | undefined;
  addComment: (storyId: string, chapterId: string, text: string, sticker?: Comment['sticker']) => void;
  deleteComment: (commentId: string) => void;
  getComments: (chapterId: string) => Comment[];
  updateProfile: (profile: UserProfile) => void;
  addDonation: (
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
  ) => void;
  getTips: (chapterId: string) => Tip[];
  setVIP: (vip: boolean, storyId?: string) => void;
  setAutoRenew: (val: boolean) => void;
  setReadingTheme: (theme: AppState['readingTheme']) => void;
  setFontFamily: (font: AppState['fontFamily']) => void;
  setFontSize: (size: number) => void;
  saveStory: (story: Story) => void;
  deleteStory: (storyId: string) => void;
  getStory: (storyId: string) => Story | undefined;
  saveChapter: (storyId: string, chapter: Chapter) => void;
  deleteChapter: (storyId: string, chapterId: string) => void;
  reorderChapters: (storyId: string, chapterIds: string[]) => void;
  getChapter: (storyId: string, chapterId: string) => Chapter | undefined;
  persistenceError: string | null;
}

export const AppContext = createContext<AppContextType | null>(null);
