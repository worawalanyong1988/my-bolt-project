import { ChevronLeft } from 'lucide-react';
import { useRouter } from '@/router';

interface BackButtonProps {
  label?: string;
  onBack?: () => void;
}

export function BackButton({ label = 'ย้อนกลับ', onBack }: BackButtonProps) {
  const { back, navigate } = useRouter();
  return (
    <button
      onClick={onBack || back}
      className="flex items-center gap-1 text-sm font-medium text-charcoal hover:text-terracotta-500 transition-colors py-1"
    >
      <ChevronLeft size={20} />
      {label}
    </button>
  );
}

export function StudioBackButton() {
  const { navigate } = useRouter();
  return (
    <button
      onClick={() => navigate({ name: 'profile' })}
      className="flex items-center gap-1 text-sm font-medium text-charcoal hover:text-terracotta-500 transition-colors py-1"
    >
      <ChevronLeft size={20} />
      กลับสู่หน้านักอ่าน
    </button>
  );
}
