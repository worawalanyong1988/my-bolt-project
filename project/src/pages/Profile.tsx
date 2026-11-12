import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/useApp';
import { useRouter } from '@/router';
import { Modal } from '@/components/Modal';
import { VipLoyaltyBanner } from '@/components/VipLoyaltyBanner';
import type { FontFamily, ReadingTheme } from '@/types';
import { uploadProfileAvatar } from '@/services/profileStorage';
import {
  Crown,
  PenTool,
  Settings,
  LogOut,
  Bell,
  Moon,
  HelpCircle,
  ImagePlus,
  Save,
  Coins,
  ReceiptText,
} from 'lucide-react';

export function Profile() {
  const {
    state,
    setReadingTheme,
    setFontFamily,
    setFontSize,
    updateProfile,
      authUser,
      authLoading,
      isWriter,
      signIn,
      signUp,
      signOut,
      redeemVipDiscount,
    } = useApp();
  const { navigate } = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [activePanel, setActivePanel] = useState<'notifications' | 'transactions' | 'settings' | 'help' | 'logout' | null>(null);
  const [displayName, setDisplayName] = useState(state.profile.displayName);
  const [bio, setBio] = useState(state.profile.bio);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [redeemBusy, setRedeemBusy] = useState(false);

  useEffect(() => {
    setDisplayName(state.profile.displayName);
    setBio(state.profile.bio);
  }, [state.profile.displayName, state.profile.bio]);

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

  const handleSaveProfile = async () => {
    if (!authUser) {
      setProfileError('กรุณาเข้าสู่ระบบก่อนบันทึกโปรไฟล์');
      return;
    }
    try {
      await updateProfile({
        ...state.profile,
        displayName: displayName.trim() || 'คุณ',
        bio: bio.trim(),
      });
      setDisplayName(displayName.trim() || 'คุณ');
      setBio(bio.trim());
      setProfileError(null);
      setProfileMessage('บันทึกข้อมูลโปรไฟล์แล้ว');
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'บันทึกโปรไฟล์ไม่สำเร็จ');
    }
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
      if (!authUser) throw new Error('กรุณาเข้าสู่ระบบก่อนเปลี่ยนรูปโปรไฟล์');
      const resizedFile = await resizeAvatar(file);
      const avatarUrl = await uploadProfileAvatar(authUser.id, resizedFile);
      await updateProfile({ ...state.profile, avatarUrl });
      setProfileMessage('เปลี่ยนรูปโปรไฟล์แล้ว');
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'อ่านรูปภาพไม่สำเร็จ กรุณาลองอีกครั้ง');
    }
  };

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthBusy(true);
    setProfileError(null);
    setProfileMessage(null);
    try {
      if (authMode === 'sign-up') {
        const result = await signUp(authEmail.trim(), authPassword, displayName);
        setAuthPassword('');
        setProfileMessage(result === 'email-confirmation-required'
          ? 'สมัครบัญชีแล้ว กรุณาเปิดอีเมลและกดลิงก์ยืนยันก่อนเข้าสู่ระบบ หากไม่พบให้ตรวจสอบโฟลเดอร์สแปม'
          : 'สมัครสมาชิกและเข้าสู่ระบบสำเร็จ');
      } else {
        await signIn(authEmail.trim(), authPassword);
        setAuthPassword('');
        setProfileMessage('เข้าสู่ระบบสำเร็จ');
      }
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'ยืนยันตัวตนไม่สำเร็จ');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setActivePanel(null);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'ออกจากระบบไม่สำเร็จ');
    }
  };

  const handleRedeemDiscount = async () => {
    setRedeemBusy(true);
    setProfileError(null);
    setProfileMessage(null);
    try {
      await redeemVipDiscount();
      setProfileMessage('แลกสำเร็จแล้ว ส่วนลด 20% จะใช้กับรอบ VIP เดือนถัดไป');
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'แลกส่วนลดไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      setRedeemBusy(false);
    }
  };

  const transactionLabel = (type: string) => {
    if (type === 'vip_subscription') return 'สมัคร / ต่ออายุสมาชิก VIP';
    if (type === 'donation') return 'ส่งสติกเกอร์โดเนทให้นักเขียน';
    if (type === 'coin_redemption') return 'แลก Coins เป็นส่วนลด VIP';
    return 'รายการธุรกรรม';
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 pb-6">
      <section className="mb-4 rounded-2xl border border-cream-200 bg-white p-4">
        {authUser ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-charcoal">{authUser.email}</p>
              <p className="mt-1 text-xs text-charcoal-muted">
                {isWriter ? 'บัญชีนักเขียนที่ได้รับอนุญาต' : 'บัญชีผู้อ่าน'} · ข้อมูลซิงก์ผ่าน Supabase
              </p>
            </div>
            <button type="button" onClick={handleSignOut} className="rounded-full bg-cream-100 px-4 py-2 text-xs font-semibold text-charcoal hover:bg-cream-200">
              ออกจากระบบ
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuthSubmit} className="space-y-3">
            <div>
              <h2 className="text-sm font-bold text-charcoal">
                {authMode === 'sign-in' ? 'เข้าสู่ระบบเพื่อซิงก์ข้อมูล' : 'สร้างบัญชีผู้อ่าน'}
              </h2>
              <p className="mt-1 text-xs text-charcoal-muted">ต้องเข้าสู่ระบบเพื่อบันทึกโปรไฟล์ ชั้นหนังสือ ความคืบหน้า และส่งคอมเมนต์</p>
            </div>
            {authMode === 'sign-up' && (
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={40}
                required
                placeholder="ชื่อที่แสดง"
                className="w-full rounded-xl border border-cream-200 bg-cream-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300"
              />
            )}
            <input
              type="email"
              autoComplete="email"
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
              required
              placeholder="อีเมล"
              className="w-full rounded-xl border border-cream-200 bg-cream-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300"
            />
            <input
              type="password"
              autoComplete={authMode === 'sign-in' ? 'current-password' : 'new-password'}
              value={authPassword}
              onChange={(event) => setAuthPassword(event.target.value)}
              minLength={8}
              required
              placeholder="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
              className="w-full rounded-xl border border-cream-200 bg-cream-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300"
            />
            <div className="flex items-center gap-2">
              <button type="submit" disabled={authBusy || authLoading} className="flex-1 rounded-xl bg-terracotta-500 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                {authBusy ? 'กำลังดำเนินการ...' : authMode === 'sign-in' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
              </button>
              <button type="button" onClick={() => setAuthMode(authMode === 'sign-in' ? 'sign-up' : 'sign-in')} className="rounded-xl bg-cream-100 px-3 py-2.5 text-xs font-semibold text-charcoal">
                {authMode === 'sign-in' ? 'สร้างบัญชี' : 'มีบัญชีแล้ว'}
              </button>
            </div>
          </form>
        )}
        {profileMessage && <p className="mt-2 text-xs text-emerald-700" role="status">{profileMessage}</p>}
        {profileError && <p className="mt-2 text-xs text-red-600" role="alert">{profileError}</p>}
      </section>

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
          disabled={!authUser}
          className="hidden"
          aria-label="เลือกรูปโปรไฟล์"
        />
        <button
          type="button"
          onClick={() => avatarInputRef.current?.click()}
          disabled={!authUser}
          className={`relative mt-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${
            state.isVIP
              ? 'bg-white/15 text-amber-50 hover:bg-white/25'
              : 'bg-white text-charcoal hover:bg-cream-50'
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <ImagePlus size={15} />
          เปลี่ยนรูปโปรไฟล์
        </button>
        {state.isVIP && (
          <div className="relative mt-4 flex items-center justify-between border-t border-amber-100/20 pt-3">
            <div>
              <p className="text-sm font-bold text-amber-100">Early Bird VIP Member</p>
              <p className="mt-0.5 text-xs text-white/75">
                อ่านตอนที่สงวนสิทธิ์ VIP ได้ตามสถานะสมาชิก
              </p>
            </div>
            <Crown size={22} className="text-amber-200" />
          </div>
        )}
        <div className={`relative mt-4 flex items-center justify-between gap-3 rounded-xl p-3 ${
          state.isVIP ? 'bg-black/15 text-amber-50' : 'bg-white/70 text-charcoal'
        }`}>
          <div className="flex items-center gap-2">
            <Coins size={18} className={state.isVIP ? 'text-amber-200' : 'text-amber-600'} />
            <div>
              <p className="text-sm font-bold">{state.coins} Coins</p>
              <p className={`text-[10px] ${state.isVIP ? 'text-white/70' : 'text-charcoal-muted'}`}>
                Coins สะสมจากการสมัครหรือต่ออายุสมาชิก VIP ที่ชำระเงินสำเร็จ
              </p>
            </div>
          </div>
          {state.isVIP && (
            <button
              type="button"
              onClick={() => void handleRedeemDiscount()}
              disabled={!authUser || redeemBusy || state.coins < 100 || state.hasNextMonthDiscount}
              className="shrink-0 rounded-lg bg-amber-300 px-3 py-2 text-[10px] font-bold text-amber-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {state.hasNextMonthDiscount ? 'มีส่วนลดรอบถัดไปแล้ว' : redeemBusy ? 'กำลังแลก...' : 'แลก 100 Coins'}
            </button>
          )}
        </div>
        <div className="relative mt-3">
          <VipLoyaltyBanner coins={state.coins} />
        </div>
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
          disabled={!authUser}
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
          disabled={!authUser}
          className="w-full resize-none rounded-xl border border-cream-200 bg-cream-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300"
          placeholder="เขียนแนะนำตัวสั้น ๆ"
        />
        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={!authUser}
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
              อ่านไม่อั้นทุกเรื่อง เพียง {state.hasNextMonthDiscount ? '47.20' : '59'} บาท/เดือน
            </p>
            <p className="text-xs text-white/70 mt-0.5 line-through">
              {state.hasNextMonthDiscount ? '59 บาท (ใช้ส่วนลด 20%)' : 'จากปกติ 99 บาท'}
            </p>
            <p className="mt-3 rounded-xl bg-white/15 p-3 text-xs leading-relaxed text-white">
              สมาชิก VIP สะสม Coins ได้ เมื่อครบ 100 Coins แลกส่วนลดค่าสมาชิก 20% สำหรับรอบบิลเดือนถัดไป
            </p>
            {state.hasNextMonthDiscount && (
              <p className="mt-2 rounded-xl bg-emerald-100/20 p-3 text-xs font-semibold text-white" role="status">
                คุณมีส่วนลด VIP 20% สำหรับรอบบิลเดือนถัดไปแล้ว
              </p>
            )}
            <p className="mt-2 text-[10px] text-white/75">
              การสมัครและต่ออายุ VIP จะมีผลเมื่อระบบหลังบ้านยืนยันรายการชำระเงินแล้ว
            </p>
          </div>
        </div>
      )}

      {/* Menu items */}
      <div className="bg-cream-100 rounded-2xl divide-y divide-cream-200 overflow-hidden">
        {isWriter && (
          <MenuItem
            icon={<PenTool size={20} />}
            label="พื้นที่นักเขียน"
            subtitle="จัดการนิยายและตอนของคุณ"
            onClick={() => navigate({ name: 'studio' })}
            highlight
          />
        )}
        <MenuItem
          icon={<Bell size={20} />}
          label="การแจ้งเตือน"
          subtitle={`${notifications.length} รายการล่าสุด`}
          onClick={() => setActivePanel('notifications')}
        />
        {authUser && (
          <MenuItem
            icon={<ReceiptText size={20} />}
            label="ประวัติการทำธุรกรรม"
            subtitle={`${state.transactions.length} รายการ`}
            onClick={() => setActivePanel('transactions')}
          />
        )}
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

      <Modal
        open={activePanel !== null}
        onClose={() => setActivePanel(null)}
        title={
          activePanel === 'notifications' ? 'การแจ้งเตือน' :
          activePanel === 'transactions' ? 'ประวัติการทำธุรกรรม' :
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

        {activePanel === 'transactions' && (
          <div className="max-h-[65vh] space-y-3 overflow-y-auto">
            {state.transactions.length ? state.transactions.map((transaction) => {
              const details = transaction.details;
              const detail = typeof details.description === 'string'
                ? details.description
                : typeof details.label === 'string'
                ? details.label
                : typeof details.story_title === 'string'
                  ? details.story_title
                  : typeof details.storyTitle === 'string'
                    ? details.storyTitle
                    : null;
              const statusLabel = transaction.status === 'completed'
                ? 'สำเร็จ'
                : transaction.status === 'pending' ? 'รอตรวจสอบ' : 'ไม่สำเร็จ';
              return (
                <div key={transaction.id} className="rounded-xl border border-cream-200 bg-cream-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-charcoal">{transactionLabel(transaction.type)}</p>
                      {detail && <p className="mt-0.5 truncate text-xs text-charcoal-muted">{detail}</p>}
                      <p className="mt-1 text-[10px] text-charcoal-muted">
                        {new Date(transaction.createdAt).toLocaleString('th-TH')}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
                      transaction.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        transaction.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {statusLabel}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-charcoal">
                    {transaction.amount > 0 && <span>ยอดเงิน ฿{transaction.amount.toLocaleString('th-TH')}</span>}
                    {transaction.coins !== 0 && (
                      <span className="text-amber-700">{transaction.coins > 0 ? '+' : ''}{transaction.coins} Coins</span>
                    )}
                  </div>
                </div>
              );
            }) : (
              <p className="py-8 text-center text-sm text-charcoal-muted">ยังไม่มีประวัติการทำธุรกรรม</p>
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
              <p className="mt-1 text-charcoal-muted">ข้อมูลนิยาย คอมเมนต์ และโปรไฟล์ที่เข้าสู่ระบบจะจัดเก็บและซิงก์ผ่าน Supabase</p>
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
              ออกจากระบบบัญชี Supabase บนอุปกรณ์นี้
            </p>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="w-full rounded-xl bg-terracotta-500 py-2.5 text-sm font-semibold text-white hover:bg-terracotta-600"
            >
              ยืนยันออกจากระบบ
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

async function resizeAvatar(file: File): Promise<File> {
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
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error('ปรับขนาดรูปภาพไม่สำเร็จ'));
      }, 'image/jpeg', 0.82);
    });
    return new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
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
