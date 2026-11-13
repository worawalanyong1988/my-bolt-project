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

export type StoryStatus = 'published' | 'draft' | 'private';

export type ReadingTheme = 'paper' | 'sepia' | 'night';

export type FontFamily = 'plex' | 'sarabun';

export interface Chapter {
  id: string;
  number: number;
  title: string;
  content: string; // HTML
  authorNote?: string;
  access: ChapterAccess;
  status: StoryStatus;
  readCount: number;
  wordCount?: number;
  createdAt: number;
}

export interface Story {
  id: string;
  title: string;
  penName: string;
  synopsis: string;
  intro: string; // rich story introduction / character profiles / hooks
  category: Category | '';
  ageRating: AgeRating;
  tags: string[];
  coverColor: string; // gradient seed color
  coverPattern: string; // pattern type for AI-generated covers
  coverImage?: string; // data URL or remote URL for covers
  horizontalCoverUrl?: string;
  coverAiUrl?: string; // AI-generated cover URL
  coverPrompt?: string;
  status: StoryStatus;
  isFree: boolean; // fully free novel
  readCount: number;
  likeCount: number;
  bookmarkCount: number;
  chapters: Chapter[];
  createdAt: number;
  updatedAt?: number;
}

export interface Comment {
  id: string;
  chapterId: string;
  author: string;
  avatarColor: string;
  avatarUrl?: string;
  isVIP?: boolean;
  isOwn?: boolean;
  text: string;
  isSticker: boolean;
  stickerType?: 'emoji' | 'art';
  sticker?: {
    id: string;
    type: 'emoji' | 'art';
  };
  donation?: {
    stickerId: string;
    stickerEmoji: string;
    label: string;
    amount: number;
    paymentMethod: PaymentMethod;
  };
  createdAt: number;
}

export interface UserProfile {
  displayName: string;
  bio: string;
  avatarUrl?: string;
}

export interface Tip {
  id: string;
  storyId?: string;
  chapterId: string;
  amount: number;
  label: string;
  donor: string;
  stickerId?: string;
  stickerEmoji?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: 'simulated' | 'paid';
  createdAt: number;
}

export type PaymentMethod = 'card' | 'promptpay' | 'wallet';

export interface ReadingProgress {
  storyId: string;
  chapterId: string;
  percent: number;
  updatedAt: number;
}

export interface VipSubscription {
  id: string;
  storyId?: string;
  createdAt: number;
}

export type TransactionType = 'vip_subscription' | 'donation' | 'coin_redemption';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  coins: number;
  status: 'pending' | 'completed' | 'failed';
  details: Record<string, unknown>;
  createdAt: number;
}

export type WriterNotificationKind = 'comment' | 'like' | 'vip' | 'donation';

export interface WriterNotification {
  id: string;
  kind: WriterNotificationKind;
  storyId?: string;
  chapterId?: string;
  message: string;
  createdAt: number;
}

export interface AppState {
  stories: Story[];
  bookmarks: string[]; // story IDs
  likedStories: string[];
  comments: Comment[];
  tips: Tip[];
  progress: ReadingProgress[];
  vipSubscriptions: VipSubscription[];
  writerNotifications: WriterNotification[];
  profile: UserProfile;
  isVIP: boolean;
  autoRenew: boolean;
  coins: number;
  hasNextMonthDiscount: boolean;
  transactions: Transaction[];
  readingTheme: ReadingTheme;
  fontFamily: FontFamily;
  fontSize: number;
}
