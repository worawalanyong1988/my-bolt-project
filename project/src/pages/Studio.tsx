import { useState, useRef } from 'react';
import { useApp } from '@/useApp';
import { useRouter } from '@/router';
import { Cover } from '@/components/Cover';
import { generateNovelCover } from '@/services/imagen';
import { Modal } from '@/components/Modal';
import { StudioErrorBoundary } from '@/components/StudioErrorBoundary';
import { Toggle } from '@/components/Toggle';
import { Badge } from '@/components/Badge';
import { CATEGORIES, COVER_STYLES } from '@/mockData';
import type { Story, Category, AgeRating, StoryStatus } from '@/types';
import { COVER_TEMPLATE_CATEGORIES, getCoverTemplates, type CoverTemplateCategory } from '@/data/coverTemplates';
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Sparkles,
  Upload,
  X,
  ChevronRight,
  Wand2,
  Globe2,
  ChartNoAxesColumnIncreasing,
  Bell,
  MessageCircle,
  Heart,
  Crown,
  Coins,
} from 'lucide-react';

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function Studio({ onStatisticsOpen }: { onStatisticsOpen: () => void }) {
  const { state, saveStory, deleteStory } = useApp();
  const { navigate } = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [storyFilter, setStoryFilter] = useState<'all' | 'published' | 'draft'>('all');

  const publishedCount = state.stories.filter((story) => story.status === 'published').length;
  const draftCount = state.stories.length - publishedCount;
  const visibleStories = state.stories.filter(
    (story) => storyFilter === 'all' || story.status === storyFilter,
  );

  const openNew = () => {
    setEditingStory(null);
    setShowForm(true);
  };

  const openEdit = (story: Story) => {
    setEditingStory(story);
    setShowForm(true);
  };

  const handleSave = (story: Story) => {
    saveStory(story);
    setShowForm(false);
    setEditingStory(null);
    if (story.status === 'published') {
      navigate({ name: 'home' });
    }
  };

  const handleDelete = (storyId: string) => {
    deleteStory(storyId);
    setDeleteConfirm(null);
  };

  const togglePublished = (story: Story) => {
    const nextStatus = story.status === 'published' ? 'draft' : 'published';
    saveStory({ ...story, status: nextStatus });
    if (nextStatus === 'published') navigate({ name: 'home' });
  };

  const handleOpenStatistics = () => {
    onStatisticsOpen();
    navigate({ name: 'studio-statistics' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-charcoal">แดชบอร์ดนักเขียน</h1>
          <p className="text-sm text-charcoal-muted">จัดการนิยายและตอนของคุณ</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNotifications(true)}
            aria-label={`การแจ้งเตือน ${state.writerNotifications.length} รายการ`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-cream-200 bg-white text-charcoal transition hover:bg-cream-100"
          >
            <Bell size={18} />
            {state.writerNotifications.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta-500 px-1 text-[10px] font-bold text-white">
                {Math.min(state.writerNotifications.length, 99)}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={handleOpenStatistics}
            className="flex items-center gap-1.5 rounded-full border border-cream-200 bg-white px-3 py-2 text-xs font-semibold text-charcoal transition hover:bg-cream-100 sm:px-4 sm:text-sm"
          >
            <ChartNoAxesColumnIncreasing size={16} />
            สถิติผลงาน
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 rounded-full bg-terracotta-500 px-3 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-terracotta-600 active:scale-95 sm:px-4 sm:text-sm"
          >
            <Plus size={18} />
            สร้างนิยาย
          </button>
        </div>
      </div>

      <section className="grid grid-cols-3 gap-2 mb-5" aria-label="สรุปผลงาน">
        {[
          { label: 'นิยายทั้งหมด', value: state.stories.length },
          { label: 'เผยแพร่แล้ว', value: publishedCount },
          { label: 'ฉบับร่าง', value: draftCount },
        ].map((item) => (
          <div key={item.label} className="bg-cream-100 rounded-xl px-3 py-3">
            <p className="text-lg font-bold text-charcoal">{item.value}</p>
            <p className="text-[11px] text-charcoal-muted">{item.label}</p>
          </div>
        ))}
      </section>

      <div className="flex items-center gap-2 mb-3" role="group" aria-label="กรองนิยาย">
        {([
          ['all', 'ทั้งหมด'],
          ['published', 'เผยแพร่แล้ว'],
          ['draft', 'ฉบับร่าง'],
        ] as const).map(([filter, label]) => (
          <button
            key={filter}
            type="button"
            onClick={() => setStoryFilter(filter)}
            aria-pressed={storyFilter === filter}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              storyFilter === filter
                ? 'bg-charcoal text-white'
                : 'bg-cream-100 text-charcoal-muted hover:bg-cream-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visibleStories.map((story) => (
          <div
            key={story.id}
            className="flex gap-3 bg-cream-100 rounded-2xl p-3 hover:shadow-md transition"
          >
            <button
              onClick={() => navigate({ name: 'studio-story', storyId: story.id })}
              className="w-16 h-22 rounded-lg overflow-hidden shrink-0"
            >
              <Cover story={story} rounded="rounded-lg" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <button
                  onClick={() => navigate({ name: 'studio-story', storyId: story.id })}
                  className="text-left min-w-0 flex-1"
                >
                  <h3 className="text-sm font-semibold text-charcoal line-clamp-1">
                    {story.title}
                  </h3>
                  <p className="text-xs text-charcoal-muted mt-0.5">{story.penName}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {story.status === 'published' ? (
                      <Badge variant="published">เผยแพร่</Badge>
                    ) : (
                      <Badge variant="draft">แบบร่าง</Badge>
                    )}
                    {story.isFree && <Badge variant="free">FREE</Badge>}
                    {story.ageRating === '18+' && <Badge variant="18+">18+</Badge>}
                  </div>
                  <p className="text-[10px] text-charcoal-muted mt-1">
                    {story.chapters.length} ตอน
                  </p>
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => navigate({ name: 'studio-story', storyId: story.id })}
                  className="flex items-center gap-1 text-xs font-medium text-terracotta-600 hover:text-terracotta-700"
                >
                  <BookOpen size={14} />
                  จัดการตอน
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => openEdit(story)}
                  className="flex items-center gap-1 text-xs font-medium text-charcoal-muted hover:text-charcoal"
                >
                  <Pencil size={14} />
                  แก้ไข
                </button>
                <button
                  onClick={() => togglePublished(story)}
                  className={`flex items-center gap-1 text-xs font-medium transition ${
                    story.status === 'published'
                      ? 'text-charcoal-muted hover:text-charcoal'
                      : 'text-emerald-600 hover:text-emerald-700'
                  }`}
                >
                  <Globe2 size={14} />
                  {story.status === 'published' ? 'เก็บแบบร่าง' : 'เผยแพร่'}
                </button>
                <button
                  onClick={() => setDeleteConfirm(story.id)}
                  className="flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-600"
                >
                  <Trash2 size={14} />
                  ลบ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleStories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BookOpen size={48} className="text-cream-200 mb-4" />
          <p className="text-charcoal-muted">
            {state.stories.length === 0
              ? 'ยังไม่มีนิยาย เริ่มสร้างเรื่องแรกของคุณ!'
              : 'ไม่มีนิยายในสถานะนี้'}
          </p>
        </div>
      )}

      {showForm && (
        <StudioErrorBoundary onClose={() => {
          setShowForm(false);
          setEditingStory(null);
        }}>
          <StoryForm
            story={editingStory}
            onSave={handleSave}
            onClose={() => {
              setShowForm(false);
              setEditingStory(null);
            }}
          />
        </StudioErrorBoundary>
      )}

      {/* Delete confirmation */}
      <Modal
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
        title="การแจ้งเตือนล่าสุด"
        maxWidth="max-w-lg"
      >
        {state.writerNotifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-charcoal-muted">
            ยังไม่มีการแจ้งเตือน
          </div>
        ) : (
          <div className="max-h-[60vh] space-y-2 overflow-y-auto">
            {state.writerNotifications.slice(0, 50).map((notification) => {
              const story = state.stories.find((item) => item.id === notification.storyId);
              const chapter = story?.chapters.find((item) => item.id === notification.chapterId);
              const Icon =
                notification.kind === 'comment'
                  ? MessageCircle
                  : notification.kind === 'like'
                    ? Heart
                    : notification.kind === 'vip'
                      ? Crown
                      : Coins;
              return (
                <article key={notification.id} className="flex gap-3 rounded-xl bg-cream-100 p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-terracotta-600">
                    <Icon size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-charcoal">{notification.message}</p>
                    <p className="mt-0.5 truncate text-xs text-charcoal-muted">
                      {[story?.title, chapter?.title].filter(Boolean).join(' · ') || 'สมาชิก VIP'}
                    </p>
                    <time className="mt-1 block text-[10px] text-charcoal-muted">
                      {new Date(notification.createdAt).toLocaleString('th-TH')}
                    </time>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Modal>

      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        maxWidth="max-w-xs"
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} className="text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-charcoal">ลบนิยาย?</h2>
          <p className="text-sm text-charcoal-muted mt-2">
            การลบจะไม่สามารถกู้คืนได้ ตอนและความคิดเห็นทั้งหมดจะถูกลบด้วย
          </p>
          <div className="mt-5 flex gap-2">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 py-2.5 rounded-xl bg-cream-100 text-charcoal text-sm font-medium hover:bg-cream-200 transition"
            >
              ยกเลิก
            </button>
            <button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition"
            >
              ลบ
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ============ Story Form ============

export function StoryForm({
  story,
  onSave,
  onClose,
}: {
  story: Story | null;
  onSave: (s: Story) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(story?.title || '');
  const [penName, setPenName] = useState(story?.penName || 'Aksara');
  const [synopsis, setSynopsis] = useState(story?.synopsis || '');
  const [intro, setIntro] = useState(story?.intro || '');
  const [category, setCategory] = useState<Category>(
    story?.category || 'นิยายวาย (Boy Love / BL)',
  );
  const [ageRating, setAgeRating] = useState<AgeRating>(story?.ageRating || 'ทุกวัย');
  const [tagsInput, setTagsInput] = useState(story?.tags.join(', ') || '');
  const parsedTags = Array.from(
    new Map(
      tagsInput
        .split(/[,\n]/)
        .map((tag) => tag.trim().replace(/^#/, ''))
        .filter(Boolean)
        .map((tag) => [tag.toLocaleLowerCase('th-TH'), tag]),
    ).values(),
  );
  const [status, setStatus] = useState<StoryStatus>(story?.status || 'draft');
  const [isFree, setIsFree] = useState(story?.isFree || false);
  const coverColor = story?.coverColor || '#E07A5F';
  const coverPattern = story?.coverPattern || 'stars';
  const [coverImage, setCoverImage] = useState<string | undefined>(story?.coverImage);
  const [horizontalCoverUrl, setHorizontalCoverUrl] = useState<string | undefined>(story?.horizontalCoverUrl);
  const [coverAiUrl, setCoverAiUrl] = useState<string | undefined>(story?.coverAiUrl);
  const [coverPrompt, setCoverPrompt] = useState(story?.coverPrompt || '');
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<string | null>(null);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [coverStyle, setCoverStyle] = useState<string>('anime');
  const [showAiStudio, setShowAiStudio] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const horizontalFileRef = useRef<HTMLInputElement>(null);
  const [templateCategory, setTemplateCategory] = useState<CoverTemplateCategory>('romance');
  const [templateOrientation, setTemplateOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [coverError, setCoverError] = useState<string | null>(null);
  const templateCategoryLabel = COVER_TEMPLATE_CATEGORIES.find((item) => item.id === templateCategory)?.label
    ?? COVER_TEMPLATE_CATEGORIES[0].label;

  const previewStory: Story = {
    id: story?.id || 'preview',
    title: title || 'ชื่อนิยาย',
    penName,
    synopsis,
    intro,
    category,
    ageRating,
    tags: parsedTags,
    coverColor,
    coverPattern,
    coverImage,
    horizontalCoverUrl,
    coverAiUrl,
    status,
    isFree,
    readCount: story?.readCount || 0,
    likeCount: story?.likeCount || 0,
    bookmarkCount: story?.bookmarkCount || 0,
    chapters: story?.chapters || [],
    createdAt: story?.createdAt || Date.now(),
  };

  const handleGenerateAiCover = async () => {
    setAiError(null);
    setAiStatus(null);
    const stylePreset = COVER_STYLES.find((s) => s.id === coverStyle);
    const styleSuffix = stylePreset?.promptSuffix || COVER_STYLES[0].promptSuffix;
    const promptText = [
      coverPrompt.trim(),
      title.trim() && `Novel title: ${title.trim()}`,
      synopsis.trim() && `Story concept: ${synopsis.trim()}`,
      `Category: ${category}`,
      styleSuffix,
      'Create a polished vertical portrait illustrated novel book cover. Do not include text or lettering.',
    ]
      .filter(Boolean)
      .join(', ');
    setIsGeneratingCover(true);
    try {
      const imageUrl = await generateNovelCover(promptText);
      setCoverAiUrl(imageUrl);
      setCoverImage(undefined);
      setAiStatus('สร้างภาพปกเรียบร้อยแล้ว');
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดระหว่างสร้างภาพ กรุณาลองอีกครั้ง');
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, orientation: 'portrait' | 'landscape') => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setCoverError(null);
    if (!file.type.startsWith('image/')) {
      setCoverError('กรุณาเลือกไฟล์รูปภาพ');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setCoverError('ขนาดไฟล์ต้องไม่เกิน 8 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setCoverError('อ่านไฟล์รูปภาพไม่สำเร็จ กรุณาลองอีกครั้ง');
        return;
      }
      if (orientation === 'portrait') {
        setCoverImage(reader.result);
        setCoverAiUrl(undefined);
      } else {
        setHorizontalCoverUrl(reader.result);
      }
    };
    reader.onerror = () => setCoverError('อ่านไฟล์รูปภาพไม่สำเร็จ กรุณาลองอีกครั้ง');
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    const newStory: Story = {
      id: story?.id || uid(),
      title: title.trim(),
      penName: penName.trim() || 'Aksara',
      synopsis: synopsis.trim(),
      intro: intro.trim(),
      category,
      ageRating,
      tags: parsedTags,
      coverColor,
      coverPattern,
      coverImage,
      horizontalCoverUrl,
      coverAiUrl,
      coverPrompt: coverPrompt.trim(),
      status,
      isFree,
      readCount: story?.readCount || 0,
      likeCount: story?.likeCount || 0,
      bookmarkCount: story?.bookmarkCount || 0,
      chapters: story?.chapters || [],
      createdAt: story?.createdAt || Date.now(),
    };
    onSave(newStory);
  };

  return (
    <Modal open={true} onClose={onClose} title={story ? 'แก้ไขนิยาย' : 'สร้างนิยายใหม่'} maxWidth="max-w-lg">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Cover preview + studio */}
        <div className="flex gap-4">
          <div className="w-24 h-36 rounded-xl overflow-hidden shadow-md shrink-0 relative">
            <Cover story={previewStory} rounded="rounded-xl" />
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-xs font-semibold text-charcoal">Cover Studio</p>
            <button
              onClick={() => setShowAiStudio(!showAiStudio)}
              className="w-full flex items-center gap-2 bg-terracotta-100 text-terracotta-600 px-3 py-2 rounded-xl text-xs font-medium hover:bg-terracotta-200 transition"
            >
              <Sparkles size={14} />
              สร้างภาพปกด้วย AI
            </button>
            {showAiStudio && (
              <div className="bg-cream-100 rounded-xl p-2.5 space-y-2 animate-slide-down">
                <p className="text-[10px] font-semibold text-charcoal-muted">เลือกสไตล์</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {COVER_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setCoverStyle(style.id)}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-medium transition ${
                        coverStyle === style.id
                          ? 'bg-terracotta-500 text-white'
                          : 'bg-cream-200 text-charcoal hover:bg-cream-100'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
                <label className="block text-[10px] font-semibold text-charcoal-muted" htmlFor="cover-prompt">
                  รายละเอียดภาพที่ต้องการ
                </label>
                <textarea
                  id="cover-prompt"
                  value={coverPrompt}
                  onChange={(event) => setCoverPrompt(event.target.value)}
                  placeholder="เช่น ปราสาทลอยฟ้าท่ามกลางหมู่เมฆยามพลบค่ำ โทนสีเขียวมรกตและทอง"
                  maxLength={1000}
                  rows={3}
                  className="w-full resize-y rounded-lg bg-white px-2.5 py-2 text-xs text-charcoal placeholder:text-charcoal-muted/70 focus:outline-none focus:ring-2 focus:ring-terracotta-300"
                />
                <button
                  onClick={handleGenerateAiCover}
                  disabled={!title.trim() && !synopsis.trim() && !coverPrompt.trim()}
                  aria-busy={isGeneratingCover}
                  className="w-full flex items-center justify-center gap-1.5 bg-terracotta-500 text-white py-2 rounded-lg text-xs font-bold transition hover:bg-terracotta-600 disabled:opacity-40 active:scale-95"
                >
                  <Wand2 size={14} />
                  {isGeneratingCover ? 'กำลังสร้างภาพ...' : 'สร้างภาพ'}
                </button>
                {aiStatus && (
                  <p className="text-[10px] leading-relaxed text-emerald-700" role="status">
                    {aiStatus}
                  </p>
                )}
                {aiError && (
                  <p className="text-[10px] leading-relaxed text-red-500" role="alert">
                    {aiError}
                  </p>
                )}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center gap-2 bg-cream-200 text-charcoal px-3 py-2 rounded-xl text-xs font-medium hover:bg-cream-100 transition"
            >
              <Upload size={14} />
              อัปโหลดภาพปก
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(event) => handleUpload(event, 'portrait')}
              className="hidden"
            />
            {(coverImage || coverAiUrl) && (
              <button
                onClick={() => {
                  setCoverImage(undefined);
                  setCoverAiUrl(undefined);
                }}
                className="w-full flex items-center gap-1 text-xs text-red-400 hover:text-red-600"
              >
                <X size={12} />
                ลบภาพปก
              </button>
            )}
          </div>
        </div>

        <section className="rounded-xl border border-cream-200 bg-white p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-charcoal">ปกแนวนอนสำหรับแบนเนอร์</p>
              <p className="mt-0.5 text-[10px] text-charcoal-muted">แสดงในแบนเนอร์แนะนำบนหน้าแรก</p>
            </div>
            <button
              type="button"
              onClick={() => horizontalFileRef.current?.click()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-cream-100 px-3 py-2 text-[10px] font-semibold text-charcoal hover:bg-cream-200"
            >
              <Upload size={13} />
              อัปโหลดภาพแนวนอน
            </button>
            <input
              ref={horizontalFileRef}
              type="file"
              accept="image/*"
              onChange={(event) => handleUpload(event, 'landscape')}
              className="hidden"
            />
          </div>
          <div className="mt-3 aspect-[16/7] overflow-hidden rounded-lg bg-cream-100">
            <Cover story={previewStory} variant="landscape" rounded="rounded-lg" />
          </div>
          {horizontalCoverUrl && (
            <button
              type="button"
              onClick={() => setHorizontalCoverUrl(undefined)}
              className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-red-500 hover:text-red-700"
            >
              <X size={12} />
              ลบภาพแนวนอน
            </button>
          )}
          {coverError && <p className="mt-2 text-[10px] text-red-600" role="alert">{coverError}</p>}
        </section>

        <section className="rounded-xl border border-cream-200 bg-cream-50 p-3">
          <div>
            <h3 className="text-xs font-bold text-charcoal">คลังรูปปกสำเร็จรูป</h3>
            <p className="mt-0.5 text-[10px] text-charcoal-muted">เลือกภาพได้ทันที มี 5 แบบต่อหมวดหมู่ ทั้งแนวตั้งและแนวนอน</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {COVER_TEMPLATE_CATEGORIES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTemplateCategory(item.id)}
                aria-pressed={templateCategory === item.id}
                className={`rounded-full px-3 py-1.5 text-[10px] font-semibold ${
                  templateCategory === item.id ? 'bg-terracotta-500 text-white' : 'bg-white text-charcoal hover:bg-cream-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2" role="group" aria-label="เลือกรูปแบบปก">
            {(['portrait', 'landscape'] as const).map((orientation) => (
              <button
                key={orientation}
                type="button"
                onClick={() => setTemplateOrientation(orientation)}
                aria-pressed={templateOrientation === orientation}
                className={`rounded-lg px-3 py-1.5 text-[10px] font-semibold ${
                  templateOrientation === orientation ? 'bg-charcoal text-white' : 'bg-white text-charcoal'
                }`}
              >
                {orientation === 'portrait' ? 'แนวตั้ง' : 'แนวนอน'}
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {getCoverTemplates(templateCategory).map((template, index) => (
              <button
                key={template.id}
                type="button"
                onClick={() => {
                  if (templateOrientation === 'portrait') {
                    setCoverImage(template.portraitUrl);
                    setCoverAiUrl(undefined);
                  } else {
                    setHorizontalCoverUrl(template.landscapeUrl);
                  }
                }}
                aria-label={`เลือกภาพปกสำเร็จรูป ${index + 1} ${templateOrientation === 'portrait' ? 'แนวตั้ง' : 'แนวนอน'}`}
                className={`overflow-hidden rounded-lg border-2 bg-white transition hover:border-terracotta-400 ${
                  templateOrientation === 'portrait' ? 'aspect-[2/3]' : 'aspect-[16/9]'
                }`}
              >
                <img
                  src={templateOrientation === 'portrait' ? template.portraitUrl : template.landscapeUrl}
                  alt={`ภาพปก ${templateCategoryLabel} แบบที่ ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </section>

        <FormField label="ชื่อเรื่อง">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ตั้งชื่อนิยายของคุณ"
            className="w-full px-3 py-2.5 rounded-xl bg-cream-100 border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300"
          />
        </FormField>

        <FormField label="นามปากกา">
          <input
            type="text"
            value={penName}
            onChange={(e) => setPenName(e.target.value)}
            placeholder="Aksara"
            className="w-full px-3 py-2.5 rounded-xl bg-cream-100 border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300"
          />
        </FormField>

        <FormField label="เรื่องย่อ">
          <textarea
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            placeholder="เขียนเรื่องย่อสั้นๆ เพื่อดึงดูดผู้อ่าน"
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl bg-cream-100 border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300 resize-none"
          />
          <p className="text-[10px] text-charcoal-muted mt-1 text-right">
            {synopsis.length} ตัวอักษร
          </p>
        </FormField>

        <FormField label="แนะนำเรื่อง (เช่น ตัวละคร, เกร็ดเรื่อง, จุดที่น่าสนใจ)">
          <textarea
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            placeholder={'## แนะนำตัวละคร\n\n**ชื่อตัวละคร** — คำอธิบาย\n\n## เกร็ดเรื่อง\nเกร็ดเรื่องหรือภาพพื้นหลัง\n\n> คำคมหรือความสำคัญ'}
            rows={5}
            className="w-full px-3 py-2.5 rounded-xl bg-cream-100 border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300 resize-y"
          />
          <p className="text-[10px] text-charcoal-muted mt-1">
            รองรับ Markdown: ## หัวข้อ, **ตัวหนา**, - รายการ, &gt; คำคม
          </p>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="หมวดหมู่">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-3 py-2.5 rounded-xl bg-cream-100 border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="การจัดอายุ">
            <select
              value={ageRating}
              onChange={(e) => setAgeRating(e.target.value as AgeRating)}
              className="w-full px-3 py-2.5 rounded-xl bg-cream-100 border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300"
            >
              <option value="ทุกวัย">ทุกวัย</option>
              <option value="18+">18+</option>
            </select>
          </FormField>
        </div>

        <FormField label="แท็ก (คั่นด้วยจุลภาคหรือขึ้นบรรทัดใหม่)">
          <textarea
            rows={2}
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="#โรแมนติก, #แฟนตาซี, #สุขนิยม"
            className="w-full px-3 py-2.5 rounded-xl bg-cream-100 border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300"
          />
          {parsedTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {parsedTags.map((tag) => (
                <span key={tag} className="rounded-full bg-terracotta-50 px-2.5 py-1 text-[11px] font-medium text-terracotta-700">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </FormField>

        <div className="flex items-center justify-between bg-cream-100 rounded-xl p-3">
          <div>
            <p className="text-sm font-semibold text-charcoal">สถานะการเผยแพร่</p>
            <p className="text-xs text-charcoal-muted mt-0.5">
              {status === 'published' ? 'เผยแพร่ — ผู้อ่านเห็นได้' : 'แบบร่าง — ยังไม่เผยแพร่'}
            </p>
          </div>
          <Toggle
            checked={status === 'published'}
            onChange={(val) => setStatus(val ? 'published' : 'draft')}
          />
        </div>

        <div className="flex items-center justify-between bg-cream-100 rounded-xl p-3">
          <div>
            <p className="text-sm font-semibold text-charcoal">อ่านฟรีจบเรื่อง</p>
            <p className="text-xs text-charcoal-muted mt-0.5">
              {isFree ? 'ทุกตอนฟรี' : 'มีตอน VIP'}
            </p>
          </div>
          <Toggle checked={isFree} onChange={setIsFree} />
        </div>

        <div className="flex gap-2 pt-2 sticky bottom-0 bg-cream-50 -mx-1 px-1 py-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-cream-100 text-charcoal text-sm font-medium hover:bg-cream-200 transition"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="flex-1 py-3 rounded-xl bg-terracotta-500 text-white text-sm font-bold hover:bg-terracotta-600 transition disabled:opacity-40 active:scale-95"
          >
            {story
              ? status === 'published' && story.status !== 'published'
                ? 'บันทึกและเผยแพร่'
                : 'บันทึก'
              : status === 'published'
                ? 'สร้างและเผยแพร่'
                : 'สร้างนิยาย'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-charcoal mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
