import { Search, User } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { useRouter } from '@/router';
import { useApp } from '@/useApp';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onProfileClick?: () => void;
}

export function Header({ searchQuery, onSearchChange, onProfileClick }: HeaderProps) {
  const { navigate } = useRouter();
  const { state } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-cream-50/90 backdrop-blur-md border-b border-cream-200">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-3">
        <button
          onClick={() => navigate({ name: 'home' })}
          className="flex items-center gap-2 shrink-0"
        >
          <BrandLogo />
        </button>

        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-muted"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ค้นหานิยาย, แท็ก..."
            className="w-full h-10 pl-10 pr-4 rounded-full bg-cream-100 border border-cream-200 text-sm text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-terracotta-300 transition"
          />
        </div>

        <button
          onClick={onProfileClick || (() => navigate({ name: 'profile' }))}
          className="shrink-0 w-10 h-10 rounded-full bg-terracotta-100 flex items-center justify-center hover:ring-2 hover:ring-terracotta-300 transition"
        >
          {state.isVIP ? (
            <span className="text-xs font-bold text-terracotta-600">VIP</span>
          ) : (
            <User size={20} className="text-terracotta-600" />
          )}
        </button>
      </div>
    </header>
  );
}
