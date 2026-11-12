import { useState, useEffect, useCallback } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'bookshelf' }
  | { name: 'profile' }
  | { name: 'story'; storyId: string; chapterId?: string }
  | { name: 'reader'; storyId: string; chapterId: string }
  | { name: 'studio' }
  | { name: 'studio-statistics' }
  | { name: 'studio-story'; storyId: string };

function parseHash(): Route {
  const [path, query = ''] = window.location.hash.replace(/^#/, '').split('?');
  const parts = path.split('/').filter(Boolean);
  const params = new URLSearchParams(query);

  if (parts.length === 0) return { name: 'home' };
  if (parts[0] === 'bookshelf') return { name: 'bookshelf' };
  if (parts[0] === 'profile') return { name: 'profile' };
  if (parts[0] === 'studio' && parts.length === 1) return { name: 'studio' };
  if (parts[0] === 'studio' && parts[1] === 'statistics' && parts.length === 2)
    return { name: 'studio-statistics' };
  if (parts[0] === 'studio' && parts[1] === 'story' && parts[2])
    return { name: 'studio-story', storyId: parts[2] };
  if (parts[0] === 'story' && parts[1]) {
    const chapterId = params.get('chapter');
    return { name: 'story', storyId: parts[1], ...(chapterId ? { chapterId } : {}) };
  }
  if (parts[0] === 'reader' && parts[1] && parts[2])
    return { name: 'reader', storyId: parts[1], chapterId: parts[2] };
  return { name: 'home' };
}

function routeToHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'bookshelf':
      return '#/bookshelf';
    case 'profile':
      return '#/profile';
    case 'studio':
      return '#/studio';
    case 'studio-statistics':
      return '#/studio/statistics';
    case 'studio-story':
      return `#/studio/story/${route.storyId}`;
    case 'story':
      return route.chapterId
        ? `#/story/${route.storyId}?chapter=${encodeURIComponent(route.chapterId)}`
        : `#/story/${route.storyId}`;
    case 'reader':
      return `#/reader/${route.storyId}/${route.chapterId}`;
  }
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(parseHash);

  useEffect(() => {
    const handler = () => {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = useCallback((r: Route) => {
    window.location.hash = routeToHash(r);
  }, []);

  const back = useCallback(() => {
    window.history.back();
  }, []);

  return { route, navigate, back };
}
