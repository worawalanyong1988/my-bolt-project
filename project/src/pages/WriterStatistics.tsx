import { useMemo, useState } from 'react';
import { useApp } from '@/useApp';
import { useRouter } from '@/router';
import { Cover } from '@/components/Cover';
import { Modal } from '@/components/Modal';
import {
  BookOpen,
  Eye,
  Heart,
  ArrowLeft,
  Coins,
  Crown,
  RotateCcw,
  TriangleAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export function WriterStatistics() {
  const { state, resetStatistics } = useApp();
  const { navigate } = useRouter();
  const [confirmReset, setConfirmReset] = useState(false);
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);

  const statistics = useMemo(() => {
    const publishedStories = state.stories.filter((story) => story.status === 'published');

    const perStory = publishedStories.map((story) => {
      const storyTips = state.tips.filter((tip) => tip.storyId === story.id);
      const chapters = story.chapters
        .filter((chapter) => chapter.status === 'published')
        .sort((a, b) => a.number - b.number)
        .map((chapter) => {
          const chapterTips = storyTips.filter((tip) => tip.chapterId === chapter.id);
          return {
            chapter,
            donationAmount: chapterTips.reduce((total, tip) => total + tip.amount, 0),
            donationCount: chapterTips.length,
          };
        });
      return {
        story,
        chapters,
        views: story.readCount,
        donationAmount: storyTips.reduce((total, tip) => total + tip.amount, 0),
        donationCount: storyTips.length,
      };
    });

    return {
      perStory,
      totalViews: perStory.reduce((total, item) => total + item.views, 0),
      totalVipSubscriptions: state.vipSubscriptions.length,
      totalDonations: perStory.reduce((total, item) => total + item.donationAmount, 0),
    };
  }, [state.stories, state.tips, state.vipSubscriptions]);

  const summary = [
    { label: 'ยอดคนอ่านรวม', value: statistics.totalViews.toLocaleString('th-TH'), icon: Eye, tone: 'bg-sky-100 text-sky-700' },
    { label: 'สมัครสมาชิก VIP รายเดือน', value: statistics.totalVipSubscriptions.toLocaleString('th-TH'), icon: Crown, tone: 'bg-violet-100 text-violet-700' },
    { label: 'ยอดโดเนทรวม', value: `฿${statistics.totalDonations.toLocaleString('th-TH')}`, icon: Coins, tone: 'bg-amber-100 text-amber-800' },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-5">
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate({ name: 'studio' })}
          aria-label="กลับหน้าแดชบอร์ดนักเขียน"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-100 text-charcoal transition hover:bg-cream-200"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-charcoal">สถิติผลงาน</h1>
          <p className="text-xs text-charcoal-muted">ภาพรวมผลงานนิยายที่เผยแพร่</p>
        </div>
      </div>

      <section className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="สถิติรวม">
        {summary.map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className="rounded-2xl border border-cream-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-charcoal-muted">{label}</span>
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
                <Icon size={18} />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-charcoal">{value}</p>
          </article>
        ))}
      </section>

      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
        >
          <RotateCcw size={15} />
          รีเซ็ตข้อมูลทดสอบเป็น 0
        </button>
      </div>

      <section aria-label="สถิติแยกตามนิยาย">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen size={18} className="text-terracotta-500" />
          <h2 className="text-base font-bold text-charcoal">แยกตามเรื่อง</h2>
        </div>

        {statistics.perStory.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-cream-200 bg-white py-14 text-center">
            <BookOpen size={36} className="mx-auto mb-3 text-cream-200" />
            <p className="text-sm text-charcoal-muted">ยังไม่มีนิยายที่เผยแพร่</p>
          </div>
        ) : (
          <div className="space-y-3">
            {statistics.perStory.map(({ story, chapters, views, donationAmount, donationCount }) => (
              <article key={story.id} className="rounded-2xl border border-cream-200 bg-white p-3 shadow-sm sm:p-4">
                <div className="flex gap-3 sm:gap-4">
                <div className="h-24 w-16 shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-[4.75rem]">
                  <Cover story={story} rounded="rounded-lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => navigate({ name: 'studio-story', storyId: story.id })}
                    className="mb-2 block max-w-full truncate text-left text-sm font-bold text-charcoal hover:text-terracotta-600"
                    title={story.title}
                  >
                    {story.title}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <Metric icon={Eye} label="อ่าน" value={views.toLocaleString('th-TH')} />
                    <Metric
                      icon={Heart}
                      label={`${donationCount.toLocaleString('th-TH')} ครั้ง`}
                      value={`฿${donationAmount.toLocaleString('th-TH')}`}
                    />
                  </div>
                </div>
                </div>
                <button
                  type="button"
                  aria-expanded={expandedStoryId === story.id}
                  onClick={() => setExpandedStoryId(expandedStoryId === story.id ? null : story.id)}
                  className="mt-3 flex w-full items-center justify-between rounded-xl bg-cream-50 px-3 py-2 text-xs font-semibold text-charcoal transition hover:bg-cream-100"
                >
                  <span>ดูสถิติรายตอน ({chapters.length} ตอน)</span>
                  {expandedStoryId === story.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {expandedStoryId === story.id && (
                  <div className="mt-2 space-y-2">
                    {chapters.length === 0 ? (
                      <p className="rounded-xl bg-cream-50 px-3 py-4 text-center text-xs text-charcoal-muted">
                        ยังไม่มีตอนที่เผยแพร่
                      </p>
                    ) : (
                      chapters.map(({ chapter, donationAmount: chapterDonationAmount, donationCount: chapterDonationCount }) => (
                        <div key={chapter.id} className="rounded-xl border border-cream-100 bg-cream-50 p-3">
                          <p className="mb-2 truncate text-xs font-semibold text-charcoal">
                            ตอนที่ {chapter.number}: {chapter.title}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <Metric icon={Eye} label="อ่าน" value={chapter.readCount.toLocaleString('th-TH')} />
                            <Metric
                              icon={Heart}
                              label={`${chapterDonationCount.toLocaleString('th-TH')} ครั้ง`}
                              value={`฿${chapterDonationAmount.toLocaleString('th-TH')}`}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="mt-5 text-[10px] leading-relaxed text-charcoal-muted">
        ยอดอ่านเริ่มเพิ่มเมื่อเปิดหน้าอ่าน จำนวนสมาชิก VIP เป็นประวัติการสมัครรายเดือนในโหมดจำลอง
        และยอดโดเนทคำนวณจากประวัติที่บันทึกในอุปกรณ์นี้ การจำกัดหน้านี้เป็นเพียงการควบคุมเส้นทางฝั่งเบราว์เซอร์
        ไม่สามารถปกป้องข้อมูลจริงได้หากยังไม่มีระบบยืนยันตัวตนและสิทธิ์ฝั่งเซิร์ฟเวอร์
      </p>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="ยืนยันการรีเซ็ตข้อมูล"
        maxWidth="max-w-sm"
      >
        <div className="text-center">
          <TriangleAlert size={36} className="mx-auto text-red-500" />
          <p className="mt-3 text-sm font-semibold text-charcoal">
            ต้องการตั้งยอดอ่าน ยอดซื้อ และยอดโดเนทกลับเป็น 0 หรือไม่?
          </p>
          <p className="mt-2 text-xs leading-relaxed text-charcoal-muted">
            การดำเนินการนี้จะรีเซ็ตยอดอ่าน ยอดถูกใจ ยอดเก็บ ยอดซื้อ และยอดโดเนท พร้อมลบคอมเมนต์ ประวัติการซื้อ และความคืบหน้าการอ่านในเบราว์เซอร์นี้ ไม่สามารถย้อนกลับได้
          </p>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="flex-1 rounded-xl bg-cream-100 px-4 py-2.5 text-sm font-semibold text-charcoal transition hover:bg-cream-200"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={() => {
                resetStatistics();
                setConfirmReset(false);
              }}
              className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              รีเซ็ตข้อมูล
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-cream-50 px-2 py-2">
      <div className="flex items-center gap-1 text-[9px] text-charcoal-muted sm:text-[10px]">
        <Icon size={11} />
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1 truncate text-xs font-bold text-charcoal sm:text-sm">{value}</p>
    </div>
  );
}
