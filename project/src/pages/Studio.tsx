import { useState, useRef } from 'react';
import { useApp } from '@/store';
import { useRouter } from '@/router';
import { Cover, generateAICover } from '@/components/Cover';
import { Modal } from '@/components/Modal';
import { Toggle } from '@/components/Toggle';
import { Badge } from '@/components/Badge';
import { CATEGORIES, COVER_STYLES, FALLBACK_COVERS } from '@/mockData';
import type { Story, Category, AgeRating, StoryStatus } from '@/types';
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
  Loader2,
  Image as ImageIcon,
  Globe2,
} from 'lucide-react';

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function Studio() {
  const { state, saveStory, deleteStory } = useApp();
  const { navigate } = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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
      navigate({ name: 'story', storyId: story.id });
    }
  };

  const handleDelete = (storyId: string) => {
    deleteStory(storyId);
    setDeleteConfirm(null);
  };

  const togglePublished = (story: Story) => {
    saveStory({ ...story, status: story.status === 'published' ? 'draft' : 'published' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-charcoal">พื้นที่นักเขียน</h1>
          <p className="text-sm text-charcoal-muted">จัดการนิยายและตอนของคุณ</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 bg-terracotta-500 hover:bg-terracotta-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition shadow-md active:scale-95"
        >
          <Plus size={18} />
          สร้างนิยาย
        </button>
      </div>

      {/* Story list */}
      <div className="space-y-3">
        {state.stories.map((story) => (
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

      {state.stories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BookOpen size={48} className="text-cream-200 mb-4" />
          <p className="text-charcoal-muted">ยังไม่มีนิยาย เริ่มสร้างเรื่องแรกของคุณ!</p>
        </div>
      )}

      {showForm && (
        <StoryForm
          story={editingStory}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingStory(null);
          }}
        />
      )}

      {/* Delete confirmation */}
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
  const [status, setStatus] = useState<StoryStatus>(story?.status || 'draft');
  const [isFree, setIsFree] = useState(story?.isFree || false);
  const [coverColor, setCoverColor] = useState(story?.coverColor || '#E07A5F');
  const [coverPattern, setCoverPattern] = useState(story?.coverPattern || 'stars');
  const [coverImage, setCoverImage] = useState<string | undefined>(story?.coverImage);
  const [coverAiUrl, setCoverAiUrl] = useState<string | undefined>(story?.coverAiUrl);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [coverStyle, setCoverStyle] = useState<string>('anime');
  const [showAiStudio, setShowAiStudio] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const previewStory: Story = {
    id: story?.id || 'preview',
    title: title || 'ชื่อนิยาย',
    penName,
    synopsis,
    intro,
    category,
    ageRating,
    tags: [],
    coverColor,
    coverPattern,
    coverImage,
    coverAiUrl,
    status,
    isFree,
    readCount: story?.readCount || 0,
    likeCount: story?.likeCount || 0,
    bookmarkCount: story?.bookmarkCount || 0,
    chapters: story?.chapters || [],
    createdAt: story?.createdAt || Date.now(),
  };

  const handleAICover = () => {
    const result = generateAICover(synopsis, category);
    setCoverColor(result.color);
    setCoverPattern(result.pattern);
    setCoverImage(undefined);
  };

  const handleGenerateAiCover = async () => {
    setAiLoading(true);
    setAiError(null);
    const stylePreset = COVER_STYLES.find((s) => s.id === coverStyle);
    const styleSuffix = stylePreset?.promptSuffix || COVER_STYLES[0].promptSuffix;
    const promptText = `${title || synopsis || 'novel cover'} ${styleSuffix}`;
    const encoded = encodeURIComponent(promptText);
    const baseSeed = Math.floor(Math.random() * 1000000);
    const candidateUrls = [0, 1, 2].map(
      (attempt) =>
        `https://image.pollinations.ai/prompt/${encoded}?width=600&height=900&nologo=true&enhance=true&seed=${baseSeed + attempt}`,
    );

    for (const url of candidateUrls) {
      const loaded = await loadImage(url, 25000);
      if (loaded) {
        setCoverAiUrl(url);
        setCoverImage(undefined);
        setAiLoading(false);
        return;
      }
    }

    setAiError('สร้างภาพไม่สำเร็จในขณะนี้ ลองอีกครั้งหรือเลือกภาพตัวอย่างได้เลย');
    setAiLoading(false);
  };

  const handlePickFallback = (url: string) => {
    setCoverAiUrl(url);
    setCoverImage(undefined);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCoverImage(reader.result as string);
      setCoverAiUrl(undefined);
    };
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
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      coverColor,
      coverPattern,
      coverImage,
      coverAiUrl,
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
            {aiLoading && (
              <div className="absolute inset-0 bg-cream-200 flex items-center justify-center z-10">
                <Loader2 size={24} className="text-terracotta-500 animate-spin" />
              </div>
            )}
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
                <button
                  onClick={handleGenerateAiCover}
                  disabled={aiLoading || !title.trim()}
                  className="w-full flex items-center justify-center gap-1.5 bg-terracotta-500 text-white py-2 rounded-lg text-xs font-bold transition hover:bg-terracotta-600 disabled:opacity-40 active:scale-95"
                >
                  {aiLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Wand2 size={14} />
                  )}
                  สร้างภาพ
                </button>
                {aiError && (
                  <p className="text-[10px] leading-relaxed text-red-500" role="alert">
                    {aiError}
                  </p>
                )}
                <div className="pt-1">
                  <p className="text-[10px] text-charcoal-muted mb-1.5">หรือเลือกจากตัวอย่าง</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {FALLBACK_COVERS.slice(0, 6).map((url, i) => (
                      <button
                        key={i}
                        onClick={() => handlePickFallback(url)}
                        className="aspect-[2/3] rounded-md overflow-hidden border-2 border-transparent hover:border-terracotta-400 transition"
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleAICover}
              className="w-full flex items-center gap-2 bg-cream-200 text-charcoal px-3 py-2 rounded-xl text-xs font-medium hover:bg-cream-100 transition"
            >
              <ImageIcon size={14} />
              สร้างลายปกอัตโนมัติ
            </button>
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
              onChange={handleUpload}
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

        <FormField label="แท็ก (คั่นด้วยจุลภาค)">
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="BL, School, Drama"
            className="w-full px-3 py-2.5 rounded-xl bg-cream-100 border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300"
          />
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
            {story ? 'บันทึก' : 'สร้างนิยาย'}
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

function loadImage(url: string, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const image = new Image();
    const timer = window.setTimeout(() => {
      image.src = '';
      resolve(false);
    }, timeoutMs);
    image.onload = () => {
      window.clearTimeout(timer);
      resolve(image.naturalWidth > 0 && image.naturalHeight > 0);
    };
    image.onerror = () => {
      window.clearTimeout(timer);
      resolve(false);
    };
    image.src = url;
  });
}
