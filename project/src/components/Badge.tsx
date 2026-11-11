interface BadgeProps {
  variant: 'free' | 'vip' | '18+' | 'draft' | 'published';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant, children, className = '' }: BadgeProps) {
  const styles = {
    free: 'bg-emerald-100 text-emerald-700',
    vip: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900',
    '18+': 'bg-red-100 text-red-600',
    draft: 'bg-gray-200 text-gray-600',
    published: 'bg-terracotta-100 text-terracotta-700',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
