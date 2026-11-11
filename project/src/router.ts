import { useState, useEffect, useCallback } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'bookshelf' }
  | { name: 'profile' }
  | { name: 'story'; storyId: string }
  | { name: 'reader'; storyId: string; chapterId: string }
  | { name: 'studio' }
  | { name: 'studio-story'; storyId: string };

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#/, '');
  const parts = hash.split('/').filter(Boolean);

  if (parts.length === 0) return { name: 'home' };
  if (parts[0] === 'bookshelf') return { name: 'bookshelf' };
  if (parts[0] === 'profile') return { name: 'profile' };
  if (parts[0] === 'studio' && parts.length === 1) return { name: 'studio' };
  if (parts[0] === 'studio' && parts[1] === 'story' && parts[2])
    return { name: 'studio-story', storyId: parts[2] };
  if (parts[0] === 'story' && parts[1]) return { name: 'story', storyId: parts[1] };
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
    case 'studio-story':
      return `#/studio/story/${route.storyId}`;
    case 'story':
      return `#/story/${route.storyId}`;
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
