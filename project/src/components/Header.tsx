import { Search, User } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { useRouter } from '@/router';
import { useApp } from '@/useApp';
import { CATEGORY_FILTERS } from '@/mockData';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchPanelOpen: boolean;
  onSearchFocus: () => void;
  onSearchPanelClose: () => void;
  activeCategory: string;
  onCategorySelect: (category: string) => void;
  onProfileClick?: () => void;
}

export function Header({
  searchQuery,
  onSearchChange,
  searchPanelOpen,
  onSearchFocus,
  onSearchPanelClose,
  activeCategory,
  onCategorySelect,
  onProfileClick,
}: HeaderProps) {
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
            onFocus={onSearchFocus}
            onKeyDown={(event) => {
              if (event.key === 'Escape') onSearchPanelClose();
            }}
            placeholder="ค้นหานิยาย, แท็ก..."
            className="w-full h-10 pl-10 pr-4 rounded-full bg-cream-100 border border-cream-200 text-sm text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-terracotta-300 transition"
            aria-expanded={searchPanelOpen}
            aria-controls="search-category-panel"
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
      {searchPanelOpen && (
        <div id="search-category-panel" className="border-t border-cream-200 bg-white/95 shadow-lg">
          <div className="max-w-5xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-charcoal">เลือกหมวดหมู่นิยาย</p>
              <button
                type="button"
                onClick={onSearchPanelClose}
                className="text-xs font-medium text-charcoal-muted hover:text-charcoal"
              >
                ปิด
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORY_FILTERS.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => onCategorySelect(category.value)}
                  aria-pressed={activeCategory === category.value}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    activeCategory === category.value
                      ? 'bg-terracotta-500 text-white shadow-sm'
                      : 'bg-cream-100 text-charcoal hover:bg-cream-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-charcoal-muted">
              พิมพ์ชื่อเรื่องหรือ #แท็ก เพื่อใช้ค้นหาร่วมกับหมวดหมู่
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
