import { Home, Library, User } from 'lucide-react';
import { useRouter, type Route } from '@/router';

const items: { label: string; icon: typeof Home; route: Route }[] = [
  { label: 'หน้าแรก', icon: Home, route: { name: 'home' } },
  { label: 'ชั้นหนังสือ', icon: Library, route: { name: 'bookshelf' } },
  { label: 'โปรไฟล์', icon: User, route: { name: 'profile' } },
];

export function BottomNav() {
  const { route, navigate } = useRouter();

  const activeName = route.name;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-cream-50/95 backdrop-blur-md border-t border-cream-200 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-5xl mx-auto flex items-center justify-around h-16">
        {items.map((item) => {
          const isActive =
            (item.route.name === 'home' && (activeName === 'home' || activeName === 'story' || activeName === 'reader')) ||
            (item.route.name === 'bookshelf' && activeName === 'bookshelf') ||
            (item.route.name === 'profile' && (activeName === 'profile' || activeName === 'studio' || activeName === 'studio-story'));
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              className="flex flex-col items-center gap-1 px-6 py-2 transition-all"
            >
              <Icon
                size={22}
                className={isActive ? 'text-terracotta-500' : 'text-charcoal-muted'}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[11px] font-medium ${
                  isActive ? 'text-terracotta-500' : 'text-charcoal-muted'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
