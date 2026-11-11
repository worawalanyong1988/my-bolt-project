import { useState, useMemo } from 'react';
import { AppProvider, useApp } from '@/store';
import { useRouter } from '@/router';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { BackButton, StudioBackButton } from '@/components/BackButton';
import { Home } from '@/pages/Home';
import { Bookshelf } from '@/pages/Bookshelf';
import { StoryDetail } from '@/pages/StoryDetail';
import { Reader } from '@/pages/Reader';
import { Profile } from '@/pages/Profile';
import { Studio } from '@/pages/Studio';
import { StudioStory } from '@/pages/StudioStory';

function AppContent() {
  const { route, navigate } = useRouter();
  const { state } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const isReader = route.name === 'reader';
  const isStudio = route.name === 'studio' || route.name === 'studio-story';

  const showHeader = !isReader && !isStudio;
  const showBottomNav = !isReader && !isStudio;

  const content = useMemo(() => {
    switch (route.name) {
      case 'home':
        return <Home searchQuery={searchQuery} />;
      case 'bookshelf':
        return <Bookshelf />;
      case 'story':
        return <StoryDetail storyId={route.storyId} />;
      case 'reader':
        return <Reader storyId={route.storyId} chapterId={route.chapterId} />;
      case 'profile':
        return <Profile />;
      case 'studio':
        return <Studio />;
      case 'studio-story':
        return <StudioStory storyId={route.storyId} />;
      default:
        return <Home searchQuery={searchQuery} />;
    }
  }, [route, searchQuery]);

  return (
    <div className="min-h-screen bg-cream-50">
      {showHeader && (
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
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

      <main className={showBottomNav ? 'pb-20' : ''}>{content}</main>

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
