import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { AppProvider } from '@/store';
import { useApp } from '@/useApp';
import { useRouter, type Route } from '@/router';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { StudioBackButton } from '@/components/BackButton';
import { Home } from '@/pages/Home';
import { Bookshelf } from '@/pages/Bookshelf';
import { StoryDetail } from '@/pages/StoryDetail';
import { Reader } from '@/pages/Reader';
import { Profile } from '@/pages/Profile';
import { Studio } from '@/pages/Studio';
import { StudioStory } from '@/pages/StudioStory';
import { WriterStatistics } from '@/pages/WriterStatistics';
import { Modal } from '@/components/Modal';

function AppContent() {
  const { route, navigate } = useRouter();
  const { state, persistenceError, authLoading, isWriter, authUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด');
  const [statisticsAccess, setStatisticsAccess] = useState(false);
  const previousRoute = useRef<Route['name'] | null>(null);
  const transactionSnapshot = useRef<{ userId: string; ids: Set<string> } | null>(null);
  const [vipSuccessOpen, setVipSuccessOpen] = useState(false);
  const handleTagSelect = useCallback((tag: string) => {
    setActiveTag(tag.replace(/^#/, ''));
    setSearchQuery('');
    navigate({ name: 'home' });
  }, [navigate]);

  useEffect(() => {
    if (
      !authLoading &&
      !isWriter &&
      (route.name === 'studio' || route.name === 'studio-story' || route.name === 'studio-statistics')
    ) {
      navigate({ name: 'profile' });
    }
    if (route.name === 'studio-statistics') {
      if (!statisticsAccess) navigate({ name: 'studio' });
    } else if (previousRoute.current === 'studio-statistics') {
      setStatisticsAccess(false);
    }
    previousRoute.current = route.name;
  }, [route, statisticsAccess, navigate, authLoading, isWriter]);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      transactionSnapshot.current = null;
      return;
    }

    const currentIds = new Set(state.transactions.map((transaction) => transaction.id));
    if (transactionSnapshot.current?.userId !== authUser.id) {
      transactionSnapshot.current = { userId: authUser.id, ids: currentIds };
      return;
    }

    const newVipTransaction = state.transactions.find((transaction) =>
      !transactionSnapshot.current?.ids.has(transaction.id)
      && transaction.type === 'vip_subscription'
      && transaction.status === 'completed'
      && transaction.coins === 5,
    );
    transactionSnapshot.current = { userId: authUser.id, ids: currentIds };
    if (newVipTransaction) setVipSuccessOpen(true);
  }, [authLoading, authUser, state.transactions]);

  const isReader = route.name === 'reader';
  const isStudio =
    route.name === 'studio' ||
    route.name === 'studio-story' ||
    route.name === 'studio-statistics';

  const showHeader = !isReader && !isStudio;
  const showBottomNav = !isReader && !isStudio;

  const content = useMemo(() => {
    switch (route.name) {
      case 'home':
        return (
          <Home
            searchQuery={searchQuery}
            activeTag={activeTag}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onTagSelect={handleTagSelect}
            onTagClear={() => setActiveTag(null)}
            onSearchClear={() => setSearchQuery('')}
          />
        );
      case 'bookshelf':
        return <Bookshelf />;
      case 'story':
        return <StoryDetail storyId={route.storyId} onTagSelect={handleTagSelect} />;
      case 'reader':
        return <Reader key={`${route.storyId}:${route.chapterId}`} storyId={route.storyId} chapterId={route.chapterId} />;
      case 'profile':
        return <Profile />;
      case 'studio':
        return <Studio onStatisticsOpen={() => setStatisticsAccess(true)} />;
      case 'studio-statistics':
        return statisticsAccess ? <WriterStatistics /> : <Studio onStatisticsOpen={() => setStatisticsAccess(true)} />;
      case 'studio-story':
        return <StudioStory storyId={route.storyId} />;
      default:
        return (
          <Home
            searchQuery={searchQuery}
            activeTag={activeTag}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onTagSelect={handleTagSelect}
            onTagClear={() => setActiveTag(null)}
            onSearchClear={() => setSearchQuery('')}
          />
        );
    }
  }, [route, searchQuery, activeTag, activeCategory, statisticsAccess, handleTagSelect]);

  return (
    <div className="min-h-screen bg-cream-50">
      {showHeader && (
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPanelOpen={searchPanelOpen}
          onSearchFocus={() => setSearchPanelOpen(true)}
          onSearchPanelClose={() => setSearchPanelOpen(false)}
          activeCategory={activeCategory}
          onCategorySelect={setActiveCategory}
          onProfileClick={() => navigate({ name: 'profile' })}
        />
      )}

      {/* Studio top bar */}
      {isStudio && (
        <div className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-md border-b border-cream-200">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <StudioBackButton />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-terracotta-500 bg-terracotta-50 px-3 py-1 rounded-full">
                Author Studio
              </span>
              {state.isVIP && (
                <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                  VIP
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {persistenceError && (
        <div role="alert" className="fixed bottom-20 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-center text-xs font-medium text-red-800 shadow-lg">
          {persistenceError}
        </div>
      )}
      <Modal open={vipSuccessOpen} onClose={() => setVipSuccessOpen(false)} title="สมัครสมาชิก VIP สำเร็จ">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <span className="text-2xl" aria-hidden="true">🎉</span>
          </div>
          <p className="mt-4 text-base font-bold text-charcoal">
            สมัครสมาชิก VIP สำเร็จ! คุณได้รับโบนัสสะสมเพิ่ม 5 คอยน์
          </p>
          <p className="mt-2 text-sm text-charcoal-muted">ยอดคอยน์สะสมของคุณตอนนี้ {state.coins} คอยน์</p>
          <button
            type="button"
            onClick={() => setVipSuccessOpen(false)}
            className="mt-5 w-full rounded-xl bg-terracotta-500 py-3 text-sm font-bold text-white hover:bg-terracotta-600"
          >
            รับทราบ
          </button>
        </div>
      </Modal>
      <main className={showBottomNav ? 'pb-20' : ''}>
        {authLoading ? (
          <div className="mx-auto max-w-lg px-4 py-20 text-center text-sm text-charcoal-muted">
            กำลังเชื่อมต่อฐานข้อมูล...
          </div>
        ) : content}
      </main>

      {showBottomNav && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
