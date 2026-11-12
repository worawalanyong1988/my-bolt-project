import { Coins, Crown } from 'lucide-react';

const COIN_REDEMPTION_GOAL = 100;

export function VipLoyaltyBanner({ coins }: { coins: number }) {
  const progress = Math.min(coins, COIN_REDEMPTION_GOAL);
  const remaining = Math.max(0, COIN_REDEMPTION_GOAL - coins);
  const progressPercent = (progress / COIN_REDEMPTION_GOAL) * 100;

  return (
    <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 text-charcoal">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
          <Crown size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-extrabold text-amber-950">สิทธิพิเศษสมาชิก VIP</h3>
          <p className="mt-1 text-xs leading-relaxed text-charcoal">
            เติมเงินสมัครหรือต่ออายุสมาชิก 1 ครั้ง รับทันที 5 คอยน์! สะสมครบ 100 คอยน์ รับส่วนลดค่าสมาชิก 20% ทันที
          </p>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 font-bold text-amber-900">
            <Coins size={15} />
            สะสมแล้ว {coins} / {COIN_REDEMPTION_GOAL} คอยน์
          </span>
          <span className="shrink-0 text-charcoal-muted">
            {remaining ? `ขาดอีก ${remaining} คอยน์` : 'รับส่วนลด 20% ได้แล้ว'}
          </span>
        </div>
        <div
          className="h-2.5 overflow-hidden rounded-full bg-amber-100"
          role="progressbar"
          aria-label="ความคืบหน้าการสะสมคอยน์เพื่อแลกส่วนลด 20%"
          aria-valuemin={0}
          aria-valuemax={COIN_REDEMPTION_GOAL}
          aria-valuenow={progress}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-2 text-[10px] text-charcoal-muted">
          {remaining
            ? `อีก ${remaining} คอยน์เพื่อแลกส่วนลดค่าสมาชิก 20%`
            : 'สะสมครบแล้ว สามารถแลกส่วนลดค่าสมาชิก 20% ได้'}
        </p>
      </div>
    </section>
  );
}
