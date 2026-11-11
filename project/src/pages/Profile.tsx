import { useState } from 'react';
import { useApp } from '@/store';
import { useRouter } from '@/router';
import { Modal } from '@/components/Modal';
import { Toggle } from '@/components/Toggle';
import {
  Crown,
  PenTool,
  Settings,
  LogOut,
  Check,
  Sparkles,
  Bell,
  Moon,
  HelpCircle,
} from 'lucide-react';

export function Profile() {
  const { state, setVIP, setAutoRenew } = useApp();
  const { navigate } = useRouter();
  const [showManageSub, setShowManageSub] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleSubscribe = () => {
    setVIP(true);
    setAutoRenew(true);
    setShowPaywall(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 pb-6">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-terracotta-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
          ค
        </div>
        <div>
          <h1 className="text-lg font-bold text-charcoal">คุณ</h1>
          <p className="text-sm text-charcoal-muted">นักอ่านและนักเขียน</p>
        </div>
      </div>

      {/* Membership card */}
      <div
        className={`rounded-3xl p-5 mb-4 shadow-lg transition ${
          state.isVIP
            ? 'bg-gradient-to-br from-terracotta-500 to-terracotta-700 text-white'
            : 'bg-cream-100 border border-cream-200'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {state.isVIP ? (
                <Crown size={18} className="text-amber-200" />
              ) : (
                <Crown size={18} className="text-charcoal-muted" />
              )}
              <span
                className={`text-xs font-semibold ${
                  state.isVIP ? 'text-amber-200' : 'text-charcoal-muted'
                }`}
              >
                สถานะสมาชิก
              </span>
            </div>
            <h2 className={`text-xl font-bold ${state.isVIP ? 'text-white' : 'text-charcoal'}`}>
              {state.isVIP ? 'Early Bird VIP Member' : 'ผู้อ่านทั่วไป'}
            </h2>
            {state.isVIP && (
              <p className="text-sm text-white/80 mt-1">
                อ่านไม่อั้นทุกเรื่อง · ต่ออายุอัตโนมัติ{state.autoRenew ? ' (เปิด)' : ' (ปิด)'}
              </p>
            )}
          </div>
          {state.isVIP && <Sparkles size={24} className="text-amber-200" />}
        </div>
        {state.isVIP && (
          <button
            onClick={() => setShowManageSub(true)}
            className="mt-4 w-full bg-white/20 backdrop-blur-sm text-white py-2.5 rounded-xl text-sm font-medium hover:bg-white/30 transition"
          >
            จัดการการสมัครสมาชิก
          </button>
        )}
      </div>

      {/* Promo banner (non-VIP only) */}
      {!state.isVIP && (
        <div
          className="rounded-3xl p-5 mb-4 bg-gradient-to-br from-amber-400 to-terracotta-500 text-white shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-12 -mt-12" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Crown size={20} className="text-white" />
              <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                Early Bird
              </span>
            </div>
            <h3 className="text-lg font-bold">สมัครสมาชิกพรีเมียม</h3>
            <p className="text-sm text-white/90 mt-1">
              อ่านไม่อั้นทุกเรื่อง เพียง 59 บาท/เดือน
            </p>
            <p className="text-xs text-white/70 mt-0.5 line-through">จากปกติ 99 บาท</p>
            <button
              onClick={() => setShowPaywall(true)}
              className="mt-3 bg-white text-terracotta-600 px-5 py-2 rounded-full text-sm font-bold hover:bg-cream-50 transition shadow active:scale-95"
            >
              สมัครเลย
            </button>
          </div>
        </div>
      )}

      {/* Dev/Test Toggle */}
      <div className="bg-cream-100 rounded-2xl p-4 mb-4 border-2 border-dashed border-terracotta-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-charcoal">สลับสถานะ (ทดสอบ)</p>
            <p className="text-xs text-charcoal-muted mt-0.5">
              {state.isVIP ? 'สมาชิก VIP' : 'ผู้อ่านทั่วไป'}
            </p>
          </div>
          <Toggle
            checked={state.isVIP}
            onChange={(val) => setVIP(val)}
            activeColor="#E07A5F"
          />
        </div>
      </div>

      {/* Menu items */}
      <div className="bg-cream-100 rounded-2xl divide-y divide-cream-200 overflow-hidden">
        <MenuItem
          icon={<PenTool size={20} />}
          label="พื้นที่นักเขียน"
          subtitle="จัดการนิยายและตอนของคุณ"
          onClick={() => navigate({ name: 'studio' })}
          highlight
        />
        <MenuItem icon={<Bell size={20} />} label="การแจ้งเตือน" />
        <MenuItem icon={<Moon size={20} />} label="โหมดกลางคืน" />
        <MenuItem icon={<HelpCircle size={20} />} label="ช่วยเหลือและสนับสนุน" />
        <MenuItem icon={<Settings size={20} />} label="ตั้งค่า" />
        <MenuItem icon={<LogOut size={20} />} label="ออกจากระบบ" danger />
      </div>

      <p className="text-center text-xs text-charcoal-muted mt-6">Aksara v1.0 · แพลตฟอร์มนิยายออนไลน์</p>

      {/* Paywall modal */}
      <Modal open={showPaywall} onClose={() => setShowPaywall(false)} maxWidth="max-w-sm">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Crown size={32} className="text-amber-900" />
          </div>
          <h2 className="text-xl font-bold text-charcoal">สมาชิกพรีเมียม VIP</h2>
          <p className="text-sm text-charcoal-muted mt-2">อ่านไม่อั้นทุกเรื่อง ทุกตอน ไม่มีโฆษณา</p>
          <div className="mt-5 bg-cream-100 rounded-2xl p-4">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-3xl font-bold text-terracotta-500">59</span>
              <span className="text-sm text-charcoal-muted">บาท/เดือน</span>
            </div>
            <p className="text-xs text-charcoal-muted line-through mt-1">ปกติ 99 บาท</p>
            <div className="mt-3 space-y-2 text-left">
              {['อ่านทุกตอนไม่จำกัด', 'ไม่มีโฆษณารบกวน', 'รองรับทุกแนวนิยาย', 'ยกเลิกได้ทุกเมื่อ'].map(
                (feat) => (
                  <div key={feat} className="flex items-center gap-2 text-sm text-charcoal">
                    <Check size={16} className="text-emerald-500 shrink-0" />
                    {feat}
                  </div>
                ),
              )}
            </div>
          </div>
          <button
            onClick={handleSubscribe}
            className="mt-5 w-full bg-terracotta-500 hover:bg-terracotta-600 text-white py-3 rounded-2xl font-bold text-sm transition shadow-lg active:scale-95"
          >
            สมัครเลย — 59 บาท/เดือน
          </button>
        </div>
      </Modal>

      {/* Manage subscription modal */}
      <Modal
        open={showManageSub}
        onClose={() => setShowManageSub(false)}
        title="จัดการการสมัครสมาชิก"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-terracotta-500 to-terracotta-700 text-white rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Crown size={18} className="text-amber-200" />
              <span className="text-xs font-semibold text-amber-200">Early Bird VIP</span>
            </div>
            <p className="text-lg font-bold">สมาชิกพรีเมียม</p>
            <p className="text-sm text-white/80 mt-1">59 บาท/เดือน</p>
          </div>

          <div className="flex items-center justify-between bg-cream-100 rounded-xl p-3">
            <div>
              <p className="text-sm font-semibold text-charcoal">ต่ออายุอัตโนมัติ</p>
              <p className="text-xs text-charcoal-muted mt-0.5">
                {state.autoRenew ? 'เปิดอยู่ — ต่ออายุทุกเดือน' : 'ปิดอยู่ — จะหมดอายุสิ้นเดือน'}
              </p>
            </div>
            <Toggle checked={state.autoRenew} onChange={setAutoRenew} />
          </div>

          <button
            onClick={() => {
              setAutoRenew(false);
              setShowManageSub(false);
            }}
            className="w-full text-red-500 hover:bg-red-50 py-3 rounded-xl text-sm font-semibold transition"
          >
            ยกเลิกการต่ออายุอัตโนมัติ
          </button>
        </div>
      </Modal>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  subtitle,
  onClick,
  danger,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onClick?: () => void;
  danger?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-cream-200 transition text-left ${
        highlight ? 'bg-terracotta-50' : ''
      }`}
    >
      <span
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          danger ? 'bg-red-100 text-red-500' : highlight ? 'bg-terracotta-100 text-terracotta-600' : 'bg-cream-200 text-charcoal-muted'
        }`}
      >
        {icon}
      </span>
      <div className="flex-1">
        <p className={`text-sm font-medium ${danger ? 'text-red-500' : 'text-charcoal'}`}>
          {label}
        </p>
        {subtitle && <p className="text-xs text-charcoal-muted">{subtitle}</p>}
      </div>
      {!danger && <ChevronRightSmall />}
    </button>
  );
}

function ChevronRightSmall() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-charcoal-muted">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
