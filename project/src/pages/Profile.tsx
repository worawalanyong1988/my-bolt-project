import { useRef, useState } from 'react';
import { useApp } from '@/useApp';
import { useRouter } from '@/router';
import { Modal } from '@/components/Modal';
import { Toggle } from '@/components/Toggle';
import type { FontFamily, ReadingTheme } from '@/types';
import {
  Crown,
  PenTool,
  Settings,
  LogOut,
  Check,
  Bell,
  Moon,
  HelpCircle,
  ImagePlus,
  Save,
} from 'lucide-react';

export function Profile() {
  const {
    state,
    setVIP,
    setAutoRenew,
    setReadingTheme,
    setFontFamily,
    setFontSize,
    updateProfile,
  } = useApp();
  const { navigate } = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [showManageSub, setShowManageSub] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [activePanel, setActivePanel] = useState<'notifications' | 'settings' | 'help' | 'logout' | null>(null);
  const [displayName, setDisplayName] = useState(state.profile.displayName);
  const [bio, setBio] = useState(state.profile.bio);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const notifications = [
    ...state.comments.flatMap((comment) => {
      const story = state.stories.find((item) => item.chapters.some((chapter) => chapter.id === comment.chapterId));
      if (!story) return [];
      const chapter = story.chapters.find((item) => item.id === comment.chapterId);
      return [{
        id: `comment-${comment.id}`,
        title: 'มีความคิดเห็นใหม่',
        detail: `${story.title} · ${chapter?.title || 'ตอน'}`,
        createdAt: comment.createdAt,
      }];
    }),
    ...state.tips.flatMap((tip) => {
      const story = state.stories.find((item) => item.chapters.some((chapter) => chapter.id === tip.chapterId));
      if (!story) return [];
      const chapter = story.chapters.find((item) => item.id === tip.chapterId);
      return [{
        id: `tip-${tip.id}`,
        title: `ได้รับ ${tip.label} ${tip.amount} บาท`,
        detail: `${story.title} · ${chapter?.title || 'ตอน'}`,
        createdAt: tip.createdAt,
      }];
    }),
  ].sort((a, b) => b.createdAt - a.createdAt).slice(0, 20);

  const handleSubscribe = () => {
    setVIP(true);
    setAutoRenew(true);
    setShowPaywall(false);
  };

  const handleSaveProfile = () => {
    updateProfile({
      ...state.profile,
      displayName: displayName.trim() || 'คุณ',
      bio: bio.trim(),
    });
    setDisplayName(displayName.trim() || 'คุณ');
    setBio(bio.trim());
    setProfileError(null);
    setProfileMessage('บันทึกข้อมูลโปรไฟล์แล้ว');
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setProfileError(null);
    setProfileMessage(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileError('กรุณาเลือกไฟล์รูปภาพ');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setProfileError('ขนาดไฟล์ต้องไม่เกิน 8 MB');
      return;
    }

    try {
      const avatarUrl = await resizeAvatar(file);
      updateProfile({ ...state.profile, avatarUrl });
      setProfileMessage('เปลี่ยนรูปโปรไฟล์แล้ว');
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'อ่านรูปภาพไม่สำเร็จ กรุณาลองอีกครั้ง');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 pb-6">
      <section
        className={`relative mb-4 overflow-hidden rounded-3xl p-5 shadow-lg ${
          state.isVIP
            ? 'border border-amber-300/70 bg-gradient-to-br from-[#31251D] via-[#61421F] to-[#9A6B28] text-white'
            : 'border border-cream-200 bg-cream-100 text-charcoal'
        }`}
      >
        {state.isVIP && (
          <>
            <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-amber-300/20 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 left-1/3 h-32 w-32 rounded-full bg-yellow-200/10 blur-2xl" />
          </>
        )}
        <div className="relative flex items-center gap-4">
          <div
            className={`h-20 w-20 shrink-0 rounded-full p-1 ${
              state.isVIP
                ? 'bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-700 shadow-[0_0_22px_rgba(251,191,36,0.65)]'
                : 'bg-cream-200'
            }`}
          >
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-cream-50 text-2xl font-bold text-terracotta-600">
              {state.profile.avatarUrl ? (
                <img src={state.profile.avatarUrl} alt="รูปโปรไฟล์" className="h-full w-full object-cover" />
              ) : (
                (displayName.trim()[0] || 'ค')
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-bold">{displayName || 'คุณ'}</h1>
              {state.isVIP ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/60 bg-amber-200/20 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-amber-100 shadow-sm">
                  <Crown size={12} fill="currentColor" />
                  VIP
                </span>
              ) : (
                <span className="rounded-full bg-black/5 px-2.5 py-1 text-[10px] font-semibold text-charcoal-muted">
                  สมาชิกทั่วไป
                </span>
              )}
            </div>
            <p className={`mt-1 text-sm ${state.isVIP ? 'text-amber-50/80' : 'text-charcoal-muted'}`}>
              {bio || 'ยังไม่ได้เพิ่มข้อมูลแนะนำตัว'}
            </p>
          </div>
        </div>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="hidden"
          aria-label="เลือกรูปโปรไฟล์"
        />
        <button
          type="button"
          onClick={() => avatarInputRef.current?.click()}
          className={`relative mt-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${
            state.isVIP
              ? 'bg-white/15 text-amber-50 hover:bg-white/25'
              : 'bg-white text-charcoal hover:bg-cream-50'
          }`}
        >
          <ImagePlus size={15} />
          เปลี่ยนรูปโปรไฟล์
        </button>
        {state.isVIP && (
          <div className="relative mt-4 flex items-center justify-between border-t border-amber-100/20 pt-3">
            <div>
              <p className="text-sm font-bold text-amber-100">Early Bird VIP Member</p>
              <p className="mt-0.5 text-xs text-white/75">
                อ่านไม่อั้นทุกเรื่อง · ต่ออายุอัตโนมัติ{state.autoRenew ? ' (เปิด)' : ' (ปิด)'}
              </p>
            </div>
            <Crown size={22} className="text-amber-200" />
          </div>
        )}
        {state.isVIP && (
          <button
            type="button"
            onClick={() => setShowManageSub(true)}
            className="relative mt-3 w-full rounded-xl bg-white/15 py-2.5 text-sm font-medium text-white transition hover:bg-white/25"
          >
            จัดการการสมัครสมาชิก
          </button>
        )}
      </section>

      <section className="mb-4 rounded-2xl border border-cream-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-bold text-charcoal">ข้อมูลโปรไฟล์</h2>
        <label htmlFor="profile-display-name" className="mb-1.5 block text-xs font-semibold text-charcoal">
          ชื่อที่แสดง
        </label>
        <input
          id="profile-display-name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={40}
          className="mb-3 w-full rounded-xl border border-cream-200 bg-cream-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300"
          placeholder="ชื่อที่ผู้อื่นจะเห็น"
        />
        <label htmlFor="profile-bio" className="mb-1.5 block text-xs font-semibold text-charcoal">
          แนะนำตัว
        </label>
        <textarea
          id="profile-bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          maxLength={160}
          rows={2}
          className="w-full resize-none rounded-xl border border-cream-200 bg-cream-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300"
          placeholder="เขียนแนะนำตัวสั้น ๆ"
        />
        <button
          type="button"
          onClick={handleSaveProfile}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-terracotta-500 py-2.5 text-sm font-bold text-white transition hover:bg-terracotta-600"
        >
          <Save size={16} />
          บันทึกข้อมูล
        </button>
        {profileMessage && <p className="mt-2 text-xs text-emerald-700" role="status">{profileMessage}</p>}
        {profileError && <p className="mt-2 text-xs text-red-600" role="alert">{profileError}</p>}
        <p className="mt-2 text-[10px] text-charcoal-muted">รองรับไฟล์รูปภาพขนาดไม่เกิน 8 MB</p>
      </section>

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
        <MenuItem
          icon={<Bell size={20} />}
          label="การแจ้งเตือน"
          subtitle={`${notifications.length} รายการล่าสุด`}
          onClick={() => setActivePanel('notifications')}
        />
        <MenuItem
          icon={<Moon size={20} />}
          label="โหมดกลางคืน"
          subtitle={state.readingTheme === 'night' ? 'เปิดอยู่' : 'ปิดอยู่'}
          onClick={() => setReadingTheme(state.readingTheme === 'night' ? 'paper' : 'night')}
        />
        <MenuItem
          icon={<HelpCircle size={20} />}
          label="ช่วยเหลือและสนับสนุน"
          onClick={() => setActivePanel('help')}
        />
        <MenuItem
          icon={<Settings size={20} />}
          label="ตั้งค่า"
          onClick={() => setActivePanel('settings')}
        />
        <MenuItem
          icon={<LogOut size={20} />}
          label="ออกจากระบบ"
          onClick={() => setActivePanel('logout')}
          danger
        />
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

      <Modal
        open={activePanel !== null}
        onClose={() => setActivePanel(null)}
        title={
          activePanel === 'notifications' ? 'การแจ้งเตือน' :
          activePanel === 'settings' ? 'ตั้งค่า' :
          activePanel === 'help' ? 'ช่วยเหลือและสนับสนุน' : 'ออกจากระบบ'
        }
        maxWidth="max-w-sm"
      >
        {activePanel === 'notifications' && (
          <div className="space-y-3">
            {notifications.length ? notifications.map((notification) => (
              <div key={notification.id} className="border-b border-cream-200 pb-3 last:border-0">
                <p className="text-sm font-semibold text-charcoal">{notification.title}</p>
                <p className="text-xs text-charcoal-muted mt-0.5">{notification.detail}</p>
                <p className="text-[10px] text-charcoal-muted mt-1">
                  {new Date(notification.createdAt).toLocaleString('th-TH')}
                </p>
              </div>
            )) : (
              <p className="py-8 text-center text-sm text-charcoal-muted">ยังไม่มีการแจ้งเตือน</p>
            )}
          </div>
        )}

        {activePanel === 'settings' && (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-charcoal mb-2">ธีมการอ่าน</p>
              <div className="flex gap-2">
                {([
                  ['paper', 'กระดาษ'],
                  ['sepia', 'ซีเปีย'],
                  ['night', 'กลางคืน'],
                ] as const satisfies readonly (readonly [ReadingTheme, string])[]).map(([theme, label]) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setReadingTheme(theme)}
                    aria-pressed={state.readingTheme === theme}
                    className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium ${
                      state.readingTheme === theme ? 'bg-terracotta-500 text-white' : 'bg-cream-100 text-charcoal'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-charcoal mb-2">แบบตัวอักษร</p>
              <div className="flex gap-2">
                {(['plex', 'sarabun'] as const satisfies readonly FontFamily[]).map((font) => (
                  <button
                    key={font}
                    type="button"
                    onClick={() => setFontFamily(font)}
                    aria-pressed={state.fontFamily === font}
                    className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium ${
                      state.fontFamily === font ? 'bg-terracotta-500 text-white' : 'bg-cream-100 text-charcoal'
                    }`}
                  >
                    {font === 'plex' ? 'IBM Plex' : 'Sarabun'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-charcoal">ขนาดตัวอักษร</p>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setFontSize(state.fontSize - 2)} className="h-9 w-9 rounded-full bg-cream-100" aria-label="ลดขนาดตัวอักษร">−</button>
                <span className="w-8 text-center text-sm font-bold">{state.fontSize}</span>
                <button type="button" onClick={() => setFontSize(state.fontSize + 2)} className="h-9 w-9 rounded-full bg-cream-100" aria-label="เพิ่มขนาดตัวอักษร">+</button>
              </div>
            </div>
          </div>
        )}

        {activePanel === 'help' && (
          <div className="space-y-4 text-sm text-charcoal">
            <div>
              <p className="font-semibold">ข้อมูลถูกบันทึกที่ไหน?</p>
              <p className="mt-1 text-charcoal-muted">ข้อมูลตัวอย่างและการตั้งค่าจัดเก็บในเบราว์เซอร์เครื่องนี้</p>
            </div>
            <div>
              <p className="font-semibold">สร้างหรือแก้ไขนิยายได้อย่างไร?</p>
              <p className="mt-1 text-charcoal-muted">เลือก “พื้นที่นักเขียน” เพื่อจัดการนิยายและตอนของคุณ</p>
            </div>
            <div>
              <p className="font-semibold">ปก AI ใช้บริการภายนอกหรือไม่?</p>
              <p className="mt-1 text-charcoal-muted">ระบบส่ง Prompt ไปยัง Google Gemini image generation เพื่อสร้างภาพปก</p>
            </div>
          </div>
        )}

        {activePanel === 'logout' && (
          <div className="space-y-4">
            <p className="text-sm text-charcoal-muted">
              แอปตัวอย่างนี้ยังไม่มีระบบบัญชี จึงไม่มีเซสชันให้ยกเลิก และข้อมูลในเบราว์เซอร์จะไม่ถูกลบ
            </p>
            <button
              type="button"
              onClick={() => {
                setActivePanel(null);
                navigate({ name: 'home' });
              }}
              className="w-full rounded-xl bg-terracotta-500 py-2.5 text-sm font-semibold text-white hover:bg-terracotta-600"
            >
              กลับหน้าแรกในโหมดผู้เยี่ยมชม
            </button>
          </div>
        )}
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
  onClick: () => void;
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

async function resizeAvatar(file: File): Promise<string> {
  const image = await createImageBitmap(file);
  try {
    const size = 512;
    const cropSize = Math.min(image.width, image.height);
    const sourceX = (image.width - cropSize) / 2;
    const sourceY = (image.height - cropSize) / 2;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('เตรียมรูปภาพไม่สำเร็จ กรุณาลองอีกครั้ง');
    context.drawImage(image, sourceX, sourceY, cropSize, cropSize, 0, 0, size, size);
    return canvas.toDataURL('image/jpeg', 0.82);
  } finally {
    image.close();
  }
}

function ChevronRightSmall() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-charcoal-muted">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
