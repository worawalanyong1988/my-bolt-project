import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import type { AppState, Chapter, Comment, PaymentMethod, Story, UserProfile } from './types';
import { AppContext, type AppContextType } from './storeContext';
import { getEmptyAppState, loadRemoteState, saveChapterRemote, saveProfileRemote, saveStoryRemote } from './services/supabaseData';
import { supabaseClient, supabaseConfigError } from './services/supabaseClient';
import { createUuid } from './utils/uuid';

const VIEW_SESSION_PREFIX = 'aksara-view-session-v1:';
const viewsClaimedInMemory = new Set<string>();

function uid(): string {
  return createUuid();
}

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
      if (key?.startsWith(VIEW_SESSION_PREFIX) || key === 'aksara-view-session-id-v1') {
        sessionStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.warn('Unable to clear this session view history.', error);
  }
}

function getViewSessionId(): string {
  const key = 'aksara-view-session-id-v1';
  try {
    const stored = sessionStorage.getItem(key);
    if (stored) return stored;
    const generated = createUuid();
    sessionStorage.setItem(key, generated);
    return generated;
  } catch (error) {
    console.warn('Unable to persist the view session identifier.', error);
    return createUuid();
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(getEmptyAppState);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isWriter, setIsWriter] = useState(false);
  const [persistenceError, setPersistenceError] = useState<string | null>(supabaseConfigError);
  const userRef = useRef<User | null>(null);
  const refreshRef = useRef<(user: User | null) => Promise<void>>(async () => undefined);

  const refreshRemote = useCallback(async (user: User | null) => {
    if (!supabaseClient) throw new Error(supabaseConfigError ?? 'Supabase ยังไม่ได้ตั้งค่า');
    if (userRef.current?.id !== user?.id) return;
    const remote = await loadRemoteState(user);
    if (userRef.current?.id !== user?.id) return;
    userRef.current = user;
    setAuthUser(user);
    setState(remote.state);
    setIsWriter(remote.isWriter);
    setPersistenceError(null);
  }, []);

  useEffect(() => {
    refreshRef.current = refreshRemote;
  }, [refreshRemote]);

  useEffect(() => {
    const client = supabaseClient;
    if (!client) {
      setAuthLoading(false);
      return;
    }

    let active = true;
    const initialize = async () => {
      try {
        const { data, error } = await client.auth.getSession();
        if (error) throw error;
        if (active) {
          userRef.current = data.session?.user ?? null;
          await refreshRemote(userRef.current);
        }
      } catch (error) {
        if (active) setPersistenceError(`โหลดข้อมูลจาก Supabase ไม่สำเร็จ: ${errorMessage(error)}`);
      } finally {
        if (active) setAuthLoading(false);
      }
    };
    void initialize();

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      if (userRef.current?.id !== user?.id) {
        setState(getEmptyAppState());
        setIsWriter(false);
      }
      userRef.current = user;
      setAuthUser(user);
      setAuthLoading(true);
      window.setTimeout(() => {
        if (!active) return;
        void refreshRemote(user)
          .catch((error: unknown) => setPersistenceError(`โหลดข้อมูลจาก Supabase ไม่สำเร็จ: ${errorMessage(error)}`))
          .finally(() => {
            if (active) setAuthLoading(false);
          });
      }, 0);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [refreshRemote]);

  useEffect(() => {
    const client = supabaseClient;
    if (!client || authLoading || supabaseConfigError) return;
    let timeout: number | undefined;
    const channel = client
      .channel(`aksara-data-${authUser?.id ?? 'public'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, () => {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          void refreshRef.current(userRef.current).catch((error: unknown) => {
            setPersistenceError(`ซิงก์นิยายจาก Supabase ไม่สำเร็จ: ${errorMessage(error)}`);
          });
        }, 200);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chapters' }, () => {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          void refreshRef.current(userRef.current).catch((error: unknown) => {
            setPersistenceError(`ซิงก์ตอนนิยายจาก Supabase ไม่สำเร็จ: ${errorMessage(error)}`);
          });
        }, 200);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chapter_contents' }, () => {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          void refreshRef.current(userRef.current).catch((error: unknown) => {
            setPersistenceError(`ซิงก์เนื้อหาตอนจาก Supabase ไม่สำเร็จ: ${errorMessage(error)}`);
          });
        }, 200);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          void refreshRef.current(userRef.current).catch((error: unknown) => {
            setPersistenceError(`ซิงก์คอมเมนต์จาก Supabase ไม่สำเร็จ: ${errorMessage(error)}`);
          });
        }, 200);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tips' }, () => {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          void refreshRef.current(userRef.current).catch((error: unknown) => {
            setPersistenceError(`ซิงก์โดเนทจาก Supabase ไม่สำเร็จ: ${errorMessage(error)}`);
          });
        }, 200);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_bookmarks' }, () => {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          void refreshRef.current(userRef.current).catch((error: unknown) => {
            setPersistenceError(`ซิงก์ชั้นหนังสือจาก Supabase ไม่สำเร็จ: ${errorMessage(error)}`);
          });
        }, 200);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_likes' }, () => {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          void refreshRef.current(userRef.current).catch((error: unknown) => {
            setPersistenceError(`ซิงก์รายการถูกใจจาก Supabase ไม่สำเร็จ: ${errorMessage(error)}`);
          });
        }, 200);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reading_progress' }, () => {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          void refreshRef.current(userRef.current).catch((error: unknown) => {
            setPersistenceError(`ซิงก์ประวัติการอ่านจาก Supabase ไม่สำเร็จ: ${errorMessage(error)}`);
          });
        }, 200);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          void refreshRef.current(userRef.current).catch((error: unknown) => {
            setPersistenceError(`ซิงก์โปรไฟล์จาก Supabase ไม่สำเร็จ: ${errorMessage(error)}`);
          });
        }, 200);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          void refreshRef.current(userRef.current).catch((error: unknown) => {
            setPersistenceError(`ซิงก์ประวัติธุรกรรมจาก Supabase ไม่สำเร็จ: ${errorMessage(error)}`);
          });
        }, 200);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'writer_notifications' }, () => {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          void refreshRef.current(userRef.current).catch((error: unknown) => {
            setPersistenceError(`ซิงก์การแจ้งเตือนจาก Supabase ไม่สำเร็จ: ${errorMessage(error)}`);
          });
        }, 200);
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setPersistenceError(`เชื่อมต่อ Supabase Realtime ไม่สำเร็จ (${status})`);
        }
      });

    return () => {
      window.clearTimeout(timeout);
      void client.removeChannel(channel);
    };
  }, [authLoading, authUser?.id]);

  const persist = useCallback(async (operation: () => Promise<unknown>) => {
    try {
      await operation();
      setPersistenceError(null);
    } catch (error) {
      let message = `บันทึกข้อมูลไปยัง Supabase ไม่สำเร็จ: ${errorMessage(error)}`;
      try {
        await refreshRef.current(userRef.current);
      } catch (refreshError) {
        message = `บันทึก/โหลดข้อมูลจาก Supabase ไม่สำเร็จ: ${errorMessage(refreshError)}`;
      }
      setPersistenceError(message);
    }
  }, []);

  const toggleBookmark = useCallback((storyId: string) => {
    const user = userRef.current;
    if (!user) {
      setPersistenceError('กรุณาเข้าสู่ระบบก่อนบันทึกนิยายเข้าชั้นหนังสือ');
      return;
    }
    const wasBookmarked = state.bookmarks.includes(storyId);
    setState((current) => ({
      ...current,
      bookmarks: wasBookmarked
        ? current.bookmarks.filter((id) => id !== storyId)
        : [...current.bookmarks, storyId],
      stories: current.stories.map((story) =>
        story.id === storyId
          ? { ...story, bookmarkCount: Math.max(0, story.bookmarkCount + (wasBookmarked ? -1 : 1)) }
          : story,
      ),
    }));
    void persist(async () => {
      if (!supabaseClient) throw new Error('Supabase ยังไม่ได้ตั้งค่า');
      const result = wasBookmarked
        ? await supabaseClient.from('user_bookmarks').delete().eq('user_id', user.id).eq('story_id', storyId)
        : await supabaseClient.from('user_bookmarks').insert({ user_id: user.id, story_id: storyId });
      if (result.error) throw result.error;
    });
  }, [persist, state.bookmarks]);

  const toggleLike = useCallback((storyId: string) => {
    const user = userRef.current;
    if (!user) {
      setPersistenceError('กรุณาเข้าสู่ระบบก่อนกดถูกใจ');
      return;
    }
    const wasLiked = state.likedStories.includes(storyId);
    setState((current) => ({
      ...current,
      likedStories: wasLiked
        ? current.likedStories.filter((id) => id !== storyId)
        : [...current.likedStories, storyId],
      stories: current.stories.map((story) =>
        story.id === storyId
          ? { ...story, likeCount: Math.max(0, story.likeCount + (wasLiked ? -1 : 1)) }
          : story,
      ),
    }));
    void persist(async () => {
      if (!supabaseClient) throw new Error('Supabase ยังไม่ได้ตั้งค่า');
      const result = wasLiked
        ? await supabaseClient.from('user_likes').delete().eq('user_id', user.id).eq('story_id', storyId)
        : await supabaseClient.from('user_likes').insert({ user_id: user.id, story_id: storyId });
      if (result.error) throw result.error;
    });
  }, [persist, state.likedStories]);

  const isBookmarked = useCallback(
    (storyId: string) => state.bookmarks.includes(storyId),
    [state.bookmarks],
  );

  const updateProgress = useCallback((storyId: string, chapterId: string, percent: number) => {
    const user = userRef.current;
    const client = supabaseClient;
    if (!user) return;
    const updatedAt = Date.now();
    setState((current) => ({
      ...current,
      progress: [
        ...current.progress.filter((item) => item.storyId !== storyId),
        { storyId, chapterId, percent, updatedAt },
      ],
    }));
    if (user && client) {
      void persist(async () => {
        const result = await client
          .from('reading_progress')
          .upsert({ user_id: user.id, story_id: storyId, chapter_id: chapterId, percent, updated_at: updatedAt });
        if (result.error) throw result.error;
      });
    }
  }, [persist]);

  const recordStoryView = useCallback((storyId: string) => {
    if (!claimSessionView(`${VIEW_SESSION_PREFIX}story:${storyId}`)) return;
    void persist(async () => {
      if (!supabaseClient) throw new Error('Supabase ยังไม่ได้ตั้งค่า');
      const result = await supabaseClient.rpc('record_story_view', {
        p_story_id: storyId,
        p_session_id: getViewSessionId(),
      });
      if (result.error) throw result.error;
      await refreshRef.current(userRef.current);
    });
  }, [persist]);

  const recordChapterView = useCallback((storyId: string, chapterId: string) => {
    if (!claimSessionView(`${VIEW_SESSION_PREFIX}chapter:${storyId}:${chapterId}`)) return;
    void persist(async () => {
      if (!supabaseClient) throw new Error('Supabase ยังไม่ได้ตั้งค่า');
      const result = await supabaseClient.rpc('record_chapter_view', {
        p_story_id: storyId,
        p_chapter_id: chapterId,
        p_session_id: getViewSessionId(),
      });
      if (result.error) throw result.error;
      await refreshRef.current(userRef.current);
    });
  }, [persist]);

  const resetStatistics = useCallback(() => {
    clearSessionViews();
    void persist(async () => {
      if (!supabaseClient) throw new Error('Supabase ยังไม่ได้ตั้งค่า');
      const result = await supabaseClient.rpc('reset_aksara_statistics');
      if (result.error) throw result.error;
      await refreshRef.current(userRef.current);
    });
  }, [persist]);

  const getProgress = useCallback(
    (storyId: string) => state.progress.find((progress) => progress.storyId === storyId),
    [state.progress],
  );

  const addComment = useCallback(async (
    storyId: string,
    chapterId: string,
    text: string,
    sticker?: Comment['sticker'],
  ) => {
    const user = userRef.current;
    try {
      if (!supabaseClient || !user) throw new Error('กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น');
      const result = await supabaseClient.rpc('create_aksara_comment', {
        p_id: uid(),
        p_story_id: storyId,
        p_chapter_id: chapterId,
        p_text: text,
        p_is_sticker: !text.trim(),
        p_sticker: sticker ?? null,
      });
      if (result.error) throw result.error;
      await refreshRef.current(user);
      setPersistenceError(null);
    } catch (error) {
      setPersistenceError(`ส่งความคิดเห็นไปยัง Supabase ไม่สำเร็จ: ${errorMessage(error)}`);
      throw error;
    }
  }, []);

  const deleteComment = useCallback((commentId: string) => {
    void persist(async () => {
      if (!supabaseClient) throw new Error('Supabase ยังไม่ได้ตั้งค่า');
      const result = await supabaseClient.from('comments').delete().eq('id', commentId);
      if (result.error) throw result.error;
      await refreshRef.current(userRef.current);
    });
  }, [persist]);

  const getComments = useCallback(
    (chapterId: string) =>
      state.comments.filter((comment) => comment.chapterId === chapterId).sort((a, b) => b.createdAt - a.createdAt),
    [state.comments],
  );

  const updateProfile = useCallback(async (profile: UserProfile) => {
    const user = userRef.current;
    if (!user) {
      throw new Error('กรุณาเข้าสู่ระบบก่อนบันทึกโปรไฟล์');
    }
    try {
      await saveProfileRemote(user.id, profile);
      setState((current) => ({ ...current, profile }));
      setPersistenceError(null);
    } catch (error) {
      setPersistenceError(`บันทึกโปรไฟล์ใน Supabase ไม่สำเร็จ: ${errorMessage(error)}`);
      throw error;
    }
  }, []);

  const addDonation = useCallback(async (
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
    const user = userRef.current;
    if (!supabaseClient || !user) throw new Error('กรุณาเข้าสู่ระบบก่อนส่งสติกเกอร์โดเนท');
    const result = await supabaseClient.rpc('create_tip_records', {
      p_id: uid(),
      p_story_id: storyId,
      p_chapter_id: chapterId,
      p_amount: donation.amount,
      p_label: donation.label,
      p_sticker_id: donation.stickerId,
      p_sticker_emoji: donation.stickerEmoji,
      p_payment_method: donation.paymentMethod,
      p_message: donation.message,
      p_comment_id: uid(),
    });
    if (result.error) {
      setPersistenceError(`บันทึกโดเนทใน Supabase ไม่สำเร็จ: ${errorMessage(result.error)}`);
      throw result.error;
    }
    await refreshRef.current(user);
  }, []);

  const redeemVipDiscount = useCallback(async () => {
    const user = userRef.current;
    if (!supabaseClient || !user) throw new Error('กรุณาเข้าสู่ระบบก่อนแลกส่วนลด');
    const result = await supabaseClient.rpc('redeem_vip_discount');
    if (result.error) {
      setPersistenceError(`แลกส่วนลดไม่สำเร็จ: ${errorMessage(result.error)}`);
      throw result.error;
    }
    await refreshRef.current(user);
  }, []);

  const getTips = useCallback(
    (chapterId: string) => state.tips.filter((tip) => tip.chapterId === chapterId),
    [state.tips],
  );

  const updateReaderSetting = useCallback(async (
    updates: Partial<Pick<AppState, 'readingTheme' | 'fontFamily' | 'fontSize' | 'autoRenew'>>,
  ) => {
    const user = userRef.current;
    if (!user || !supabaseClient) return;
    const result = await supabaseClient.from('profiles').update({
      ...(updates.readingTheme !== undefined && { reading_theme: updates.readingTheme }),
      ...(updates.fontFamily !== undefined && { font_family: updates.fontFamily }),
      ...(updates.fontSize !== undefined && { font_size: updates.fontSize }),
      ...(updates.autoRenew !== undefined && { auto_renew: updates.autoRenew }),
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);
    if (result.error) throw result.error;
  }, []);

  const setAutoRenew = useCallback((value: boolean) => {
    setState((current) => ({ ...current, autoRenew: value }));
    void persist(() => updateReaderSetting({ autoRenew: value }));
  }, [persist, updateReaderSetting]);

  const setReadingTheme = useCallback((readingTheme: AppState['readingTheme']) => {
    setState((current) => ({ ...current, readingTheme }));
    void persist(() => updateReaderSetting({ readingTheme }));
  }, [persist, updateReaderSetting]);

  const setFontFamily = useCallback((fontFamily: AppState['fontFamily']) => {
    setState((current) => ({ ...current, fontFamily }));
    void persist(() => updateReaderSetting({ fontFamily }));
  }, [persist, updateReaderSetting]);

  const setFontSize = useCallback((fontSize: number) => {
    const boundedSize = Math.max(14, Math.min(28, fontSize));
    setState((current) => ({ ...current, fontSize: boundedSize }));
    void persist(() => updateReaderSetting({ fontSize: boundedSize }));
  }, [persist, updateReaderSetting]);

  const saveStory = useCallback((story: Story) => {
    const savedStory = { ...story, updatedAt: Date.now() };
    setState((current) => ({
      ...current,
      stories: current.stories.some((item) => item.id === story.id)
        ? current.stories.map((item) => item.id === story.id ? savedStory : item)
        : [savedStory, ...current.stories],
    }));
    const user = userRef.current;
    void persist(async () => {
      if (!user) throw new Error('กรุณาเข้าสู่ระบบด้วยบัญชีนักเขียนก่อนบันทึกนิยาย');
      await saveStoryRemote(savedStory, user.id);
      await refreshRef.current(user);
    });
  }, [persist]);

  const deleteStory = useCallback((storyId: string) => {
    setState((current) => ({
      ...current,
      stories: current.stories.filter((story) => story.id !== storyId),
      bookmarks: current.bookmarks.filter((id) => id !== storyId),
      likedStories: current.likedStories.filter((id) => id !== storyId),
      progress: current.progress.filter((item) => item.storyId !== storyId),
      comments: current.comments.filter((comment) => !current.stories.find((story) => story.id === storyId)?.chapters.some((chapter) => chapter.id === comment.chapterId)),
      tips: current.tips.filter((tip) => tip.storyId !== storyId),
    }));
    void persist(async () => {
      if (!supabaseClient) throw new Error('Supabase ยังไม่ได้ตั้งค่า');
      const result = await supabaseClient.from('stories').delete().eq('id', storyId);
      if (result.error) throw result.error;
      await refreshRef.current(userRef.current);
    });
  }, [persist]);

  const getStory = useCallback(
    (storyId: string) => state.stories.find((story) => story.id === storyId),
    [state.stories],
  );

  const saveChapter = useCallback(async (storyId: string, chapter: Chapter) => {
    setState((current) => ({
      ...current,
      stories: current.stories.map((story) => {
        if (story.id !== storyId) return story;
        const chapters = story.chapters.some((item) => item.id === chapter.id)
          ? story.chapters.map((item) => item.id === chapter.id ? chapter : item)
          : [...story.chapters, chapter];
        return {
          ...story,
          status: chapter.status === 'published' ? 'published' : story.status,
          chapters: chapters.sort((a, b) => a.number - b.number),
        };
      }),
    }));
    try {
      await saveChapterRemote(storyId, chapter);
      if (supabaseClient) {
        const publishResult = await supabaseClient
          .from('stories')
          .update({
            updated_at: Date.now(),
            ...(chapter.status === 'published' && { status: 'published' }),
          })
          .eq('id', storyId);
        if (publishResult.error) throw publishResult.error;
      }
      await refreshRef.current(userRef.current);
      setPersistenceError(null);
    } catch (error) {
      let message = `บันทึกตอนใน Supabase ไม่สำเร็จ: ${errorMessage(error)}`;
      try {
        await refreshRef.current(userRef.current);
      } catch (refreshError) {
        message = `บันทึก/โหลดตอนจาก Supabase ไม่สำเร็จ: ${errorMessage(refreshError)}`;
      }
      setPersistenceError(message);
      throw error;
    }
  }, []);

  const deleteChapter = useCallback((storyId: string, chapterId: string) => {
    setState((current) => ({
      ...current,
      stories: current.stories.map((story) =>
        story.id === storyId ? { ...story, chapters: story.chapters.filter((chapter) => chapter.id !== chapterId) } : story,
      ),
      comments: current.comments.filter((comment) => comment.chapterId !== chapterId),
      tips: current.tips.filter((tip) => tip.chapterId !== chapterId),
    }));
    void persist(async () => {
      if (!supabaseClient) throw new Error('Supabase ยังไม่ได้ตั้งค่า');
      const result = await supabaseClient.from('chapters').delete().eq('id', chapterId).eq('story_id', storyId);
      if (result.error) throw result.error;
      await refreshRef.current(userRef.current);
    });
  }, [persist]);

  const reorderChapters = useCallback((storyId: string, chapterIds: string[]) => {
    const reordered = state.stories.find((story) => story.id === storyId)?.chapters
      .map((chapter) => {
        const index = chapterIds.indexOf(chapter.id);
        return index >= 0 ? { ...chapter, number: index + 1 } : chapter;
      }) ?? [];
    setState((current) => ({
      ...current,
      stories: current.stories.map((story) => story.id === storyId ? { ...story, chapters: reordered } : story),
    }));
    void persist(async () => {
      if (!supabaseClient) throw new Error('Supabase ยังไม่ได้ตั้งค่า');
      const result = await supabaseClient.rpc('reorder_aksara_chapters', {
        p_story_id: storyId,
        p_chapter_ids: chapterIds,
      });
      if (result.error) throw result.error;
      await refreshRef.current(userRef.current);
    });
  }, [persist, state.stories]);

  const getChapter = useCallback(
    (storyId: string, chapterId: string) => state.stories.find((story) => story.id === storyId)?.chapters.find((chapter) => chapter.id === chapterId),
    [state.stories],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabaseClient) throw new Error(supabaseConfigError ?? 'Supabase ยังไม่ได้ตั้งค่า');
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw new Error(friendlyAuthError(error.message));
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    if (!supabaseClient) throw new Error(supabaseConfigError ?? 'Supabase ยังไม่ได้ตั้งค่า');
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName.trim() || 'คุณ' },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw new Error(friendlyAuthError(error.message));
    return data.session ? 'signed-in' as const : 'email-confirmation-required' as const;
  }, []);

  const signOut = useCallback(async () => {
    if (!supabaseClient) throw new Error(supabaseConfigError ?? 'Supabase ยังไม่ได้ตั้งค่า');
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
  }, []);

  const value: AppContextType = {
    state,
    authUser: authUser ? { id: authUser.id, email: authUser.email } : null,
    authLoading,
    isWriter,
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
    redeemVipDiscount,
    getTips,
    setAutoRenew,
    setReadingTheme,
    setFontFamily,
    setFontSize,
    signIn,
    signUp,
    signOut,
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

function friendlyAuthError(message: string): string {
  const normalized = message.toLocaleLowerCase('en');
  if (normalized.includes('invalid login credentials')) return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบแล้วลองอีกครั้ง';
  if (normalized.includes('email not confirmed')) return 'กรุณายืนยันอีเมลจากลิงก์ในกล่องจดหมายก่อนเข้าสู่ระบบ';
  if (normalized.includes('user already registered')) return 'อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบแทน';
  if (normalized.includes('password should be at least') || normalized.includes('weak password')) return 'รหัสผ่านไม่ปลอดภัยพอ กรุณาตั้งรหัสผ่านที่มีอย่างน้อย 8 ตัวอักษร';
  if (normalized.includes('invalid email')) return 'รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
  if (normalized.includes('rate limit')) return 'ส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่';
  if (normalized.includes('fetch') || normalized.includes('network')) return 'เชื่อมต่อไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง';
  return message;
}
