import type { User } from '@supabase/supabase-js';
import type { AppState, Chapter, Comment, PaymentMethod, ReadingProgress, Story, Tip, Transaction, UserProfile } from '@/types';
import { getInitialState } from '@/mockData';
import { supabaseClient } from './supabaseClient';

type StoryRow = {
  id: string;
  author_id: string;
  title: string;
  status: Story['status'];
  tags: string[];
  category: Story['category'];
  horizontal_cover_url: string | null;
  read_count: number;
  like_count: number;
  bookmark_count: number;
  data: Omit<Story, 'chapters' | 'readCount' | 'likeCount' | 'bookmarkCount'>;
  created_at: number;
  updated_at: number;
};

type ChapterRow = {
  id: string;
  story_id: string;
  number: number;
  status: Chapter['status'];
  access: Chapter['access'];
  read_count: number;
  data: Omit<Chapter, 'readCount' | 'content'>;
  created_at: number;
};

type ProfileRow = {
  id: string;
  role: 'reader' | 'writer';
  display_name: string;
  bio: string;
  avatar_url: string | null;
  is_vip: boolean;
  auto_renew: boolean;
  reading_theme: AppState['readingTheme'];
  font_family: AppState['fontFamily'];
  font_size: number;
  coins: number;
  has_next_month_discount: boolean;
};

function getChapterMetadata(chapter: Chapter): Omit<Chapter, 'content' | 'readCount'> {
  const text = chapter.content.replace(/<[^>]+>/g, ' ').trim();
  return {
    id: chapter.id,
    number: chapter.number,
    title: chapter.title,
    access: chapter.access,
    status: chapter.status,
    wordCount: text ? text.split(/\s+/).filter(Boolean).length : 0,
    createdAt: chapter.createdAt,
  };
}

type CommentRow = {
  id: string;
  chapter_id: string;
  author_id: string;
  author: string;
  avatar_color: string;
  avatar_url: string | null;
  is_vip: boolean;
  text: string;
  is_sticker: boolean;
  sticker: Comment['sticker'] | null;
  donation: Comment['donation'] | null;
  created_at: number;
};

type TipRow = {
  id: string;
  story_id: string;
  chapter_id: string;
  amount: number;
  label: string;
  donor: string;
  sticker_id: string | null;
  sticker_emoji: string | null;
  payment_method: PaymentMethod;
  payment_status: Tip['paymentStatus'];
  created_at: number;
};

type TransactionRow = {
  id: string;
  type: Transaction['type'];
  amount: number;
  coins: number;
  status: Transaction['status'];
  details: Record<string, unknown> | null;
  created_at: string;
};

function throwOnError(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

async function loadAllRows<T>(
  fetchPage: (start: number, end: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const rows: T[] = [];
  const pageSize = 1000;
  for (let start = 0; ; start += pageSize) {
    const result = await fetchPage(start, start + pageSize - 1);
    throwOnError(result.error);
    const page = result.data ?? [];
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

export function getEmptyAppState(): AppState {
  const initial = getInitialState();
  return {
    ...initial,
    stories: [],
    bookmarks: [],
    likedStories: [],
    comments: [],
    tips: [],
    progress: [],
    vipSubscriptions: [],
    writerNotifications: [],
    profile: { displayName: 'คุณ', bio: '' },
    isVIP: false,
    autoRenew: false,
    coins: 0,
    hasNextMonthDiscount: false,
    transactions: [],
  };
}

export async function loadRemoteState(user: User | null): Promise<{ state: AppState; isWriter: boolean }> {
  if (!supabaseClient) throw new Error('Supabase ยังไม่ได้ตั้งค่า');
  const client = supabaseClient;
  const [storyRows, chapterRows, commentRows, tipRows] = await Promise.all([
    loadAllRows<StoryRow>((start, end) => client.from('stories').select('*').order('updated_at', { ascending: false }).range(start, end)),
    loadAllRows<ChapterRow>((start, end) => client.from('chapters').select('*').order('number', { ascending: true }).range(start, end)),
    loadAllRows<CommentRow>((start, end) => client.from('comments').select('*').order('created_at', { ascending: false }).range(start, end)),
    loadAllRows<TipRow>((start, end) => client.from('tips').select('*').order('created_at', { ascending: false }).range(start, end)),
  ]);

  const profileResult = user
    ? await client.from('profiles').select('*').eq('id', user.id).maybeSingle()
    : { data: null, error: null };
  throwOnError(profileResult.error);
  let profile = profileResult.data as ProfileRow | null;
  if (user && !profile) {
    const inserted = await client
      .from('profiles')
      .insert({ id: user.id, email: user.email ?? null, display_name: 'คุณ' })
      .select('*')
      .single();
    throwOnError(inserted.error);
    profile = inserted.data as ProfileRow;
  }

  if (user && profile?.role === 'writer') {
    const migrationResult = await client
      .from('legacy_migrations')
      .select('migration_key')
      .eq('user_id', user.id)
      .eq('migration_key', 'local-state-v1')
      .maybeSingle();
    throwOnError(migrationResult.error);
    if (!migrationResult.data) {
      const legacyRaw = window.localStorage.getItem('aksara-app-state-v1');
      if (legacyRaw) {
        const legacyState = JSON.parse(legacyRaw) as Partial<ReturnType<typeof getInitialState>>;
        const existingIds = new Set(storyRows.map((row) => row.id));
        for (const story of legacyState.stories ?? []) {
          if (existingIds.has(story.id)) continue;
          await saveStoryRemote({
            ...story,
            readCount: 0,
            likeCount: 0,
            bookmarkCount: 0,
            chapters: story.chapters.map((chapter) => ({ ...chapter, readCount: 0 })),
            updatedAt: story.updatedAt ?? Date.now(),
          }, user.id);
        }
        const availableStoryIds = new Set([...existingIds, ...(legacyState.stories ?? []).map((story) => story.id)]);
        const availableChapterIds = new Set(chapterRows.map((chapter) => chapter.id));
        for (const story of legacyState.stories ?? []) {
          if (!existingIds.has(story.id)) {
            story.chapters.forEach((chapter) => availableChapterIds.add(chapter.id));
          }
        }

        const existingBookmarks = await client.from('user_bookmarks').select('story_id').eq('user_id', user.id);
        throwOnError(existingBookmarks.error);
        const bookmarkedIds = new Set((existingBookmarks.data ?? []).map((row) => row.story_id));
        const bookmarksToImport = (legacyState.bookmarks ?? [])
          .filter((storyId) => availableStoryIds.has(storyId) && !bookmarkedIds.has(storyId))
          .map((storyId) => ({ user_id: user.id, story_id: storyId }));
        if (bookmarksToImport.length) {
          const result = await client.from('user_bookmarks').insert(bookmarksToImport);
          throwOnError(result.error);
        }

        const existingLikes = await client.from('user_likes').select('story_id').eq('user_id', user.id);
        throwOnError(existingLikes.error);
        const likedIds = new Set((existingLikes.data ?? []).map((row) => row.story_id));
        const likesToImport = (legacyState.likedStories ?? [])
          .filter((storyId) => availableStoryIds.has(storyId) && !likedIds.has(storyId))
          .map((storyId) => ({ user_id: user.id, story_id: storyId }));
        if (likesToImport.length) {
          const result = await client.from('user_likes').insert(likesToImport);
          throwOnError(result.error);
        }

        const progressToImport = (legacyState.progress ?? [])
          .filter((item) => availableStoryIds.has(item.storyId) && availableChapterIds.has(item.chapterId))
          .map((item) => ({
            user_id: user.id,
            story_id: item.storyId,
            chapter_id: item.chapterId,
            percent: item.percent,
            updated_at: item.updatedAt,
          }));
        if (progressToImport.length) {
          const result = await client.from('reading_progress').upsert(progressToImport);
          throwOnError(result.error);
        }

        if (legacyState.profile) {
          const profileImport = await client.from('profiles').update({
            display_name: legacyState.profile.displayName || 'คุณ',
            bio: legacyState.profile.bio || '',
            reading_theme: legacyState.readingTheme ?? 'paper',
            font_family: legacyState.fontFamily ?? 'plex',
            font_size: legacyState.fontSize ?? 18,
          }).eq('id', user.id);
          throwOnError(profileImport.error);
        }

        const markResult = await client.from('legacy_migrations').upsert({
          user_id: user.id,
          migration_key: 'local-state-v1',
        });
        throwOnError(markResult.error);
        window.localStorage.removeItem('aksara-app-state-v1');
        window.localStorage.removeItem('aksara-stats-reset-v1');
        return loadRemoteState(user);
      }
    }
  }

  const userResults = user
    ? await Promise.all([
        client.from('user_bookmarks').select('story_id').eq('user_id', user.id),
        client.from('user_likes').select('story_id').eq('user_id', user.id),
        client.from('reading_progress').select('*').eq('user_id', user.id),
        profile?.role === 'writer'
          ? client.from('vip_subscriptions').select('*').order('created_at', { ascending: false })
          : client.from('vip_subscriptions').select('*').eq('user_id', user.id),
        profile?.role === 'writer'
          ? client.from('writer_notifications').select('*').order('created_at', { ascending: false }).limit(100)
          : Promise.resolve({ data: [], error: null }),
      ])
    : [
        { data: [], error: null },
        { data: [], error: null },
        { data: [], error: null },
        { data: [], error: null },
        { data: [], error: null },
      ];
  userResults.forEach((result) => throwOnError(result.error));
  const transactionRows = user
    ? await loadAllRows<TransactionRow>((start, end) => client
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(start, end))
    : [];

  const chaptersByStory = new Map<string, Chapter[]>();
  for (const row of chapterRows) {
    const chapter = {
      ...row.data,
      id: row.id,
      number: row.number,
      status: row.status,
      access: row.access,
      readCount: row.read_count,
      content: '',
    };
    chaptersByStory.set(row.story_id, [...(chaptersByStory.get(row.story_id) ?? []), chapter]);
  }

  const stories = storyRows.map((row) => ({
    ...row.data,
    id: row.id,
    title: row.title,
    status: row.status,
    tags: row.tags ?? [],
    category: row.category,
    horizontalCoverUrl: row.horizontal_cover_url ?? row.data.horizontalCoverUrl,
    readCount: row.read_count,
    likeCount: row.like_count,
    bookmarkCount: row.bookmark_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    chapters: chaptersByStory.get(row.id) ?? [],
  }));
  const comments: Comment[] = commentRows.map((row) => ({
    id: row.id,
    chapterId: row.chapter_id,
    author: row.author,
    avatarColor: row.avatar_color,
    avatarUrl: row.avatar_url ?? undefined,
    isVIP: row.is_vip,
    isOwn: row.author_id === user?.id,
    text: row.text,
    isSticker: row.is_sticker,
    sticker: row.sticker ?? undefined,
    donation: row.donation ?? undefined,
    createdAt: row.created_at,
  }));
  const tips: Tip[] = tipRows.map((row) => ({
    id: row.id,
    storyId: row.story_id,
    chapterId: row.chapter_id,
    amount: row.amount,
    label: row.label,
    donor: row.donor,
    stickerId: row.sticker_id ?? undefined,
    stickerEmoji: row.sticker_emoji ?? undefined,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
  }));
  const progress: ReadingProgress[] = (userResults[2].data ?? []).map((row) => ({
    storyId: row.story_id,
    chapterId: row.chapter_id,
    percent: row.percent,
    updatedAt: row.updated_at,
  }));
  const initial = getEmptyAppState();
  return {
    isWriter: profile?.role === 'writer',
    state: {
      ...initial,
      stories,
      comments,
      tips,
      bookmarks: (userResults[0].data ?? []).map((row) => row.story_id),
      likedStories: (userResults[1].data ?? []).map((row) => row.story_id),
      progress,
      vipSubscriptions: (userResults[3].data ?? []).map((row) => ({
        id: row.id,
        storyId: row.story_id ?? undefined,
        createdAt: row.created_at,
      })),
      writerNotifications: (userResults[4].data ?? []).map((row) => ({
        id: row.id,
        kind: row.kind,
        storyId: row.story_id ?? undefined,
        chapterId: row.chapter_id ?? undefined,
        message: row.message,
        createdAt: row.created_at,
      })),
      transactions: transactionRows.map((row): Transaction => ({
        id: row.id,
        type: row.type,
        amount: Number(row.amount),
        coins: row.coins,
        status: row.status,
        details: row.details ?? {},
        createdAt: new Date(row.created_at).getTime(),
      })),
      profile: profile
        ? { displayName: profile.display_name, bio: profile.bio, avatarUrl: profile.avatar_url ?? undefined }
        : { displayName: 'คุณ', bio: '' },
      isVIP: profile?.is_vip ?? false,
      autoRenew: profile?.auto_renew ?? false,
      coins: profile?.coins ?? 0,
      hasNextMonthDiscount: profile?.has_next_month_discount ?? false,
      readingTheme: profile?.reading_theme ?? initial.readingTheme,
      fontFamily: profile?.font_family ?? initial.fontFamily,
      fontSize: profile?.font_size ?? initial.fontSize,
    },
  };
}

export async function loadChapterContentRemote(chapterId: string): Promise<{ content: string; authorNote: string }> {
  if (!supabaseClient) throw new Error('Supabase ยังไม่ได้ตั้งค่า');
  const result = await supabaseClient
    .from('chapter_contents')
    .select('content,author_note')
    .eq('chapter_id', chapterId)
    .maybeSingle();
  throwOnError(result.error);
  if (!result.data) throw new Error('ไม่พบเนื้อหาตอนนี้หรือไม่มีสิทธิ์อ่าน');
  return { content: result.data.content, authorNote: result.data.author_note };
}

export async function saveStoryRemote(story: Story, userId: string): Promise<void> {
  if (!supabaseClient) throw new Error('Supabase ยังไม่ได้ตั้งค่า');
  const { chapters, horizontalCoverUrl, ...data } = story;
  const storyResult = await supabaseClient.from('stories').upsert({
    id: story.id,
    author_id: userId,
    title: story.title,
    status: story.status,
    tags: story.tags,
    category: story.category,
    horizontal_cover_url: horizontalCoverUrl ?? null,
    data,
    created_at: story.createdAt,
    updated_at: story.updatedAt ?? Date.now(),
  });
  throwOnError(storyResult.error);
  if (chapters.length) {
    const result = await supabaseClient.from('chapters').upsert(
      chapters.map((chapter) => {
        return {
          id: chapter.id,
          story_id: story.id,
          number: chapter.number,
          status: chapter.status,
          access: chapter.access,
          read_count: chapter.readCount,
          data: getChapterMetadata(chapter),
          created_at: chapter.createdAt,
        };
      }),
    );
    throwOnError(result.error);
    const contentResult = await supabaseClient.from('chapter_contents').upsert(
      chapters.map((chapter) => ({
        chapter_id: chapter.id,
        story_id: story.id,
        content: chapter.content,
        author_note: chapter.authorNote ?? '',
      })),
    );
    throwOnError(contentResult.error);
  }
}

export async function saveChapterRemote(storyId: string, chapter: Chapter): Promise<void> {
  if (!supabaseClient) throw new Error('Supabase ยังไม่ได้ตั้งค่า');
  const { readCount, content, authorNote, ...data } = chapter;
  const text = content.replace(/<[^>]+>/g, ' ').trim();
  const result = await supabaseClient.from('chapters').upsert({
    id: chapter.id,
    story_id: storyId,
    number: chapter.number,
    status: chapter.status,
    access: chapter.access,
    read_count: readCount,
    data: { ...data, wordCount: text ? text.split(/\s+/).filter(Boolean).length : 0 },
    created_at: chapter.createdAt,
  });
  throwOnError(result.error);
  const contentResult = await supabaseClient
    .from('chapter_contents')
    .upsert({
      chapter_id: chapter.id,
      story_id: storyId,
      content,
      author_note: authorNote ?? '',
    });
  throwOnError(contentResult.error);
}

export async function saveProfileRemote(userId: string, profile: UserProfile): Promise<void> {
  if (!supabaseClient) throw new Error('Supabase ยังไม่ได้ตั้งค่า');
  const result = await supabaseClient
    .from('profiles')
    .update({
      display_name: profile.displayName,
      bio: profile.bio,
      avatar_url: profile.avatarUrl ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
  throwOnError(result.error);
}
