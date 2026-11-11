export type Category =
  | 'นิยายรักชาย-หญิง (BG / โรแมนติก)'
  | 'นิยายวาย (Boy Love / BL)'
  | 'นิยายยูริ (Girl Love / GL)'
  | 'จีนโบราณ / ย้อนยุค / ทะลุมิติ / เทพเซียน'
  | 'แฟนตาซี / ต่างโลก / ระบบ'
  | 'วันสิ้นโลก / เอาชีวิตรอด / ไซไฟ'
  | 'สืบสวน / ลึกลับ / สยองขวัญ'
  | 'ดราม่า / สะท้อนสังคม'
  | 'กำลังภายใน / แอ็กชัน'
  // Legacy values for backward compat with existing localStorage data
  | 'นิยายวาย'
  | 'แฟนตาซี'
  | 'เอาชีวิตรอด/ภัยพิบัติ'
  | 'ย้อนยุค/ทะลุมิติ'
  | 'โรแมนติก';

export type AgeRating = 'ทุกวัย' | '18+';

export type ChapterAccess = 'free' | 'vip';

export type StoryStatus = 'published' | 'draft';

export type ReadingTheme = 'paper' | 'sepia' | 'night';

export type FontFamily = 'plex' | 'sarabun';

export interface Chapter {
  id: string;
  number: number;
  title: string;
  content: string; // HTML
  access: ChapterAccess;
  status: StoryStatus;
  createdAt: number;
}

export interface Story {
  id: string;
  title: string;
  penName: string;
  synopsis: string;
  intro: string; // rich story introduction / character profiles / hooks
  category: Category;
  ageRating: AgeRating;
  tags: string[];
  coverColor: string; // gradient seed color
  coverPattern: string; // pattern type for AI-generated covers
  coverImage?: string; // data URL or remote URL for covers
  coverAiUrl?: string; // AI-generated cover URL
  status: StoryStatus;
  isFree: boolean; // fully free novel
  readCount: number;
  likeCount: number;
  bookmarkCount: number;
  chapters: Chapter[];
  createdAt: number;
}

export interface Comment {
  id: string;
  chapterId: string;
  author: string;
  avatarColor: string;
  text: string;
  isSticker: boolean;
  stickerType?: 'emoji' | 'art';
  createdAt: number;
}

export interface Tip {
  id: string;
  chapterId: string;
  amount: number;
  label: string;
  donor: string;
  createdAt: number;
}

export interface ReadingProgress {
  storyId: string;
  chapterId: string;
  percent: number;
  updatedAt: number;
}

export interface AppState {
  stories: Story[];
  bookmarks: string[]; // story IDs
  comments: Comment[];
  tips: Tip[];
  progress: ReadingProgress[];
  isVIP: boolean;
  autoRenew: boolean;
  readingTheme: ReadingTheme;
  fontFamily: FontFamily;
  fontSize: number;
}
