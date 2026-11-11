import { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '@/useApp';
import { useRouter } from '@/router';
import { Modal } from '@/components/Modal';
import { Badge } from '@/components/Badge';
import { Cover } from '@/components/Cover';
import { StoryForm } from '@/pages/Studio';
import type { Chapter, ChapterAccess, StoryStatus, ReadingTheme, FontFamily, Story } from '@/types';
import {
  Plus,
  Trash2,
  Pencil,
  ChevronUp,
  ChevronDown,
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link as LinkIcon,
  Eye,
  Sun,
  Coffee,
  Moon,
  BookOpen,
  Indent,
  Pilcrow,
  Globe2,
} from 'lucide-react';

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function StudioStory({ storyId }: { storyId: string }) {
  const { getStory, saveStory, saveChapter, deleteChapter, reorderChapters, state } = useApp();
  const { navigate, back } = useRouter();
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showStoryForm, setShowStoryForm] = useState(false);

  const story = getStory(storyId);

  if (!story) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-charcoal-muted">ไม่พบนิยายเรื่องนี้</p>
        <button onClick={back} className="mt-4 text-terracotta-500 font-medium">
          ย้อนกลับ
        </button>
      </div>
    );
  }

  const chapters = [...story.chapters].sort((a, b) => a.number - b.number);

  const openNewChapter = () => {
    setEditingChapter(null);
    setShowEditor(true);
  };

  const openEditChapter = (ch: Chapter) => {
    setEditingChapter(ch);
    setShowEditor(true);
  };

  const handleSaveChapter = (ch: Chapter) => {
    saveChapter(story.id, ch);
    setShowEditor(false);
    setEditingChapter(null);
    if (ch.status === 'published' && editingChapter?.status !== 'published') {
      navigate({ name: 'home' });
    }
  };

  const handleDeleteChapter = (chId: string) => {
    deleteChapter(story.id, chId);
    setDeleteConfirm(null);
  };

  const handleReorder = (chId: string, direction: 'up' | 'down') => {
    const ids = chapters.map((c) => c.id);
    const idx = ids.indexOf(chId);
    if (direction === 'up' && idx > 0) {
      [ids[idx], ids[idx - 1]] = [ids[idx - 1], ids[idx]];
    } else if (direction === 'down' && idx < ids.length - 1) {
      [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    }
    reorderChapters(story.id, ids);
  };

  const handleSaveStory = (updatedStory: Story) => {
    saveStory(updatedStory);
    setShowStoryForm(false);
    if (updatedStory.status === 'published') {
      navigate({ name: 'home' });
    }
  };

  const toggleStoryPublished = () => {
    const nextStatus = story.status === 'published' ? 'draft' : 'published';
    saveStory({ ...story, status: nextStatus });
    if (nextStatus === 'published') {
      navigate({ name: 'home' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      {/* Story details and publishing controls */}
      <div className="flex gap-4 mb-5 bg-cream-100 rounded-2xl p-4">
        <button
          type="button"
          onClick={() => setShowStoryForm(true)}
          className="w-16 h-22 rounded-lg overflow-hidden shrink-0 ring-2 ring-transparent hover:ring-terracotta-300 transition"
          title="แก้ไขปกและรายละเอียดนิยาย"
        >
          <Cover story={story} rounded="rounded-lg" />
        </button>
        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setShowStoryForm(true)}
            className="text-left group"
            title="แก้ไขรายละเอียดนิยาย"
          >
            <h1 className="text-lg font-bold text-charcoal line-clamp-1 group-hover:text-terracotta-600 transition">
              {story.title}
            </h1>
            <p className="text-sm text-charcoal-muted">{story.penName}</p>
          </button>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {story.status === 'published' ? (
              <Badge variant="published">เผยแพร่แล้ว</Badge>
            ) : (
              <Badge variant="draft">แบบร่าง</Badge>
            )}
            <span className="text-xs text-charcoal-muted">{chapters.length} ตอน</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowStoryForm(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-white text-charcoal text-xs font-semibold hover:bg-cream-200 transition"
          >
            <Pencil size={14} />
            แก้ไขนิยาย
          </button>
          <button
            type="button"
            onClick={toggleStoryPublished}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition active:scale-95 ${
              story.status === 'published'
                ? 'bg-cream-200 text-charcoal hover:bg-cream-300'
                : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
            }`}
          >
            <Globe2 size={14} />
            {story.status === 'published' ? 'เก็บแบบร่าง' : 'เผยแพร่เรื่อง'}
          </button>
        </div>
      </div>

      {/* Chapter section */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-charcoal">ตอนทั้งหมด</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 bg-cream-100 text-charcoal px-3 py-2 rounded-full text-xs font-semibold hover:bg-cream-200 transition"
          >
            <Eye size={14} />
            มุมมองนักอ่าน
          </button>
          <button
            onClick={openNewChapter}
            className="flex items-center gap-1.5 bg-terracotta-500 hover:bg-terracotta-600 text-white px-4 py-2 rounded-full text-xs font-semibold transition shadow-md active:scale-95"
          >
            <Plus size={16} />
            เพิ่มตอน
          </button>
        </div>
      </div>

      {/* Chapter list */}
      <div className="space-y-2">
        {chapters.map((chapter, idx) => (
          <div
            key={chapter.id}
            className="flex items-center gap-3 bg-cream-100 rounded-xl p-3 group"
          >
            <div className="w-8 h-8 rounded-full bg-terracotta-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-terracotta-600">{chapter.number}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-charcoal line-clamp-1">{chapter.title}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                {chapter.status === 'published' ? (
                  <Badge variant="published">เผยแพร่</Badge>
                ) : (
                  <Badge variant="draft">แบบร่าง</Badge>
                )}
                {chapter.access === 'free' ? (
                  <Badge variant="free">ฟรี</Badge>
                ) : (
                  <Badge variant="vip">VIP</Badge>
                )}
                <span className="text-[10px] text-charcoal-muted">
                  {wordCount(chapter.content)} คำ
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => handleReorder(chapter.id, 'up')}
                disabled={idx === 0}
                className="text-charcoal-muted hover:text-charcoal disabled:opacity-20 transition"
              >
                <ChevronUp size={16} />
              </button>
              <button
                onClick={() => handleReorder(chapter.id, 'down')}
                disabled={idx === chapters.length - 1}
                className="text-charcoal-muted hover:text-charcoal disabled:opacity-20 transition"
              >
                <ChevronDown size={16} />
              </button>
            </div>
            <button
              onClick={() => openEditChapter(chapter)}
              className="text-charcoal-muted hover:text-terracotta-500 transition"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => setDeleteConfirm(chapter.id)}
              className="text-charcoal-muted hover:text-red-500 transition"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {chapters.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen size={40} className="text-cream-200 mb-3" />
          <p className="text-charcoal-muted text-sm">ยังไม่มีตอน เพิ่มตอนแรกของคุณ!</p>
        </div>
      )}

      {/* Story editor */}
      {showStoryForm && (
        <StoryForm
          story={story}
          onSave={handleSaveStory}
          onClose={() => setShowStoryForm(false)}
        />
      )}

      {/* Chapter editor */}
      {showEditor && (
        <ChapterEditor
          chapter={editingChapter}
          nextNumber={chapters.length + 1}
          onSave={handleSaveChapter}
          onClose={() => {
            setShowEditor(false);
            setEditingChapter(null);
          }}
        />
      )}

      {/* Reader preview */}
      {showPreview && (
        <ReaderPreview
          story={story}
          onClose={() => setShowPreview(false)}
          readingTheme={state.readingTheme}
          fontFamily={state.fontFamily}
          fontSize={state.fontSize}
        />
      )}

      {/* Delete confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="max-w-xs">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} className="text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-charcoal">ลบตอนนี้?</h2>
          <p className="text-sm text-charcoal-muted mt-2">การลบจะไม่สามารถกู้คืนได้</p>
          <div className="mt-5 flex gap-2">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 py-2.5 rounded-xl bg-cream-100 text-charcoal text-sm font-medium hover:bg-cream-200 transition"
            >
              ยกเลิก
            </button>
            <button
              onClick={() => deleteConfirm && handleDeleteChapter(deleteConfirm)}
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

// ============ Chapter Editor ============

function ChapterEditor({
  chapter,
  nextNumber,
  onSave,
  onClose,
}: {
  chapter: Chapter | null;
  nextNumber: number;
  onSave: (c: Chapter) => void;
  onClose: () => void;
}) {
  const [number, setNumber] = useState(chapter?.number || nextNumber);
  const [title, setTitle] = useState(chapter?.title || '');
  const [access, setAccess] = useState<ChapterAccess>(chapter?.access || 'free');
  const [status, setStatus] = useState<StoryStatus>(chapter?.status || 'draft');
  const editorRef = useRef<HTMLDivElement>(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const savedLinkRange = useRef<Range | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [contentVersion, setContentVersion] = useState(0);

  // Initialize contenteditable content
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = chapter?.content || '<p><br></p>';
    }
  }, [chapter]);

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    setContentVersion((v) => v + 1);
  }, []);

  // Auto-paragraph: ensure content is wrapped in <p> blocks on Enter
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Let the browser handle Enter, then ensure we're in a <p> block
      // formatBlock with <p> ensures proper paragraph wrapping
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const node = sel.anchorNode;
        if (node && node.nodeType === Node.TEXT_NODE) {
          const parent = node.parentElement;
          if (parent && parent.tagName !== 'P' && parent.tagName !== 'H1' && parent.tagName !== 'H2' && parent.tagName !== 'LI') {
            e.preventDefault();
            document.execCommand('formatBlock', false, '<p>');
            document.execCommand('insertHTML', false, '<br>');
            setContentVersion((v) => v + 1);
          }
        }
      }
    }
  }, []);

  // Auto-indent: wraps current paragraph with text-indent style for Thai novel style
  const handleIndent = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const node = sel.anchorNode;
    if (!node) return;
    // Find the current block element
    let block: HTMLElement | null = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
    while (block && block !== editorRef.current) {
      if (block.tagName === 'P') {
        const currentIndent = block.style.textIndent;
        if (currentIndent) {
          block.style.textIndent = '';
        } else {
          block.style.textIndent = '2em';
        }
        setContentVersion((v) => v + 1);
        return;
      }
      block = block.parentElement;
    }
    // If no <p> found, format as <p> first then indent
    document.execCommand('formatBlock', false, '<p>');
    if (block) {
      block.style.textIndent = '2em';
      setContentVersion((v) => v + 1);
    }
  }, []);

  // Auto-format: wrap all loose text nodes in <p> tags
  const handleAutoFormat = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    // Wrap loose text nodes in <p> tags
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
    const textNodes: Text[] = [];
    let current: Node | null;
    while ((current = walker.nextNode())) {
      const text = current.textContent?.trim();
      if (text && current.parentElement === editor) {
        textNodes.push(current as Text);
      }
    }
    textNodes.forEach((tn) => {
      const p = document.createElement('p');
      p.textContent = tn.textContent;
      p.style.textIndent = '2em';
      editor.replaceChild(p, tn);
    });
    setContentVersion((v) => v + 1);
  }, []);

  const handleLink = () => {
    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    const selectionIsInEditor = !!range && !!editorRef.current?.contains(range.commonAncestorContainer);
    savedLinkRange.current = selectionIsInEditor ? range!.cloneRange() : null;
    const selectedText = selectionIsInEditor ? selection?.toString() || '' : '';
    setLinkText(selectedText);
    setLinkUrl('');
    setLinkError(null);
    setLinkModalOpen(true);
  };

  const insertLink = () => {
    const enteredUrl = linkUrl.trim();
    if (!enteredUrl) return;

    let url: URL;
    try {
      url = new URL(/^https?:\/\//i.test(enteredUrl) ? enteredUrl : `https://${enteredUrl}`);
    } catch {
      setLinkError('กรุณาตรวจสอบ URL แล้วลองอีกครั้ง');
      return;
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      setLinkError('รองรับเฉพาะลิงก์ http และ https');
      return;
    }

    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection) return;

    selection.removeAllRanges();
    if (savedLinkRange.current && editor.contains(savedLinkRange.current.commonAncestorContainer)) {
      selection.addRange(savedLinkRange.current);
    } else {
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      selection.addRange(range);
    }

    const anchor = document.createElement('a');
    anchor.href = url.href;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.textContent = linkText.trim() || url.host;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(anchor);
    range.setStartAfter(anchor);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    setContentVersion((v) => v + 1);
    setLinkModalOpen(false);
    setLinkUrl('');
    setLinkText('');
    setLinkError(null);
    savedLinkRange.current = null;
    editorRef.current?.focus();
  };

  const currentContent = editorRef.current?.innerHTML || '';
  const wc = wordCount(currentContent);
  const cc = charCount(currentContent);
  const readTime = Math.max(1, Math.ceil(wc / 200));

  const handleSave = () => {
    if (!title.trim()) return;
    const content = editorRef.current?.innerHTML || '<p><br></p>';
    const newChapter: Chapter = {
      id: chapter?.id || uid(),
      number,
      title: title.trim(),
      content,
      access,
      status,
      readCount: chapter?.readCount ?? 0,
      createdAt: chapter?.createdAt || Date.now(),
    };
    onSave(newChapter);
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={chapter ? 'แก้ไขตอน' : 'เพิ่มตอนใหม่'}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <FormField label="ตอนที่">
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2.5 rounded-xl bg-cream-100 border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300"
            />
          </FormField>
          <div className="col-span-2">
            <FormField label="ชื่อตอน">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="บทที่ 1: จุดเริ่มต้น"
                className="w-full px-3 py-2.5 rounded-xl bg-cream-100 border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300"
              />
            </FormField>
          </div>
        </div>

        {/* Formatting toolbar */}
        <div className="bg-cream-100 rounded-xl p-2">
          <div className="flex flex-wrap items-center gap-1">
            <ToolbarBtn onClick={() => exec('bold')} title="Bold">
              <Bold size={16} />
            </ToolbarBtn>
            <ToolbarBtn onClick={() => exec('italic')} title="Italic">
              <Italic size={16} />
            </ToolbarBtn>
            <ToolbarBtn onClick={() => exec('strikeThrough')} title="Strikethrough">
              <Strikethrough size={16} />
            </ToolbarBtn>
            <Divider />
            <ToolbarBtn onClick={() => exec('formatBlock', '<h1>')} title="Heading 1">
              <Heading1 size={16} />
            </ToolbarBtn>
            <ToolbarBtn onClick={() => exec('formatBlock', '<h2>')} title="Heading 2">
              <Heading2 size={16} />
            </ToolbarBtn>
            <Divider />
            <ToolbarBtn onClick={() => exec('justifyLeft')} title="Align left">
              <AlignLeft size={16} />
            </ToolbarBtn>
            <ToolbarBtn onClick={() => exec('justifyCenter')} title="Align center">
              <AlignCenter size={16} />
            </ToolbarBtn>
            <ToolbarBtn onClick={() => exec('justifyRight')} title="Align right">
              <AlignRight size={16} />
            </ToolbarBtn>
            <Divider />
            <ToolbarBtn onClick={() => exec('insertUnorderedList')} title="Bullet list">
              <List size={16} />
            </ToolbarBtn>
            <ToolbarBtn onClick={() => exec('insertOrderedList')} title="Numbered list">
              <ListOrdered size={16} />
            </ToolbarBtn>
            <Divider />
            <ToolbarBtn onClick={handleLink} title="Insert link">
              <LinkIcon size={16} />
            </ToolbarBtn>
            <Divider />
            <ToolbarBtn onClick={handleIndent} title="ย่อหน้า (Indent)">
              <Indent size={16} />
            </ToolbarBtn>
            <ToolbarBtn onClick={handleAutoFormat} title="จัดย่อหน้าอัตโนมัติ">
              <Pilcrow size={16} />
            </ToolbarBtn>
          </div>
        </div>

        {/* Editor area */}
        <div>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            data-placeholder="เริ่มเขียนเนื้อเรื่องที่นี่... (กด Enter สร้างย่อหน้าใหม่อัตโนมัติ)"
            onInput={() => setContentVersion((v) => v + 1)}
            onKeyDown={handleKeyDown}
            className="w-full min-h-[300px] max-h-[400px] overflow-y-auto px-4 py-3 rounded-xl bg-cream-100 border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300 prose-reader font-plex"
            style={{ lineHeight: 1.8 }}
          />
        </div>

        {/* Live counters */}
        <div className="flex items-center gap-4 text-xs text-charcoal-muted bg-cream-100 rounded-xl px-4 py-2.5" key={contentVersion}>
          <span>{wc} คำ</span>
          <span>·</span>
          <span>{cc} ตัวอักษร</span>
          <span>·</span>
          <span>≈ {readTime} นาทีอ่าน</span>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="ml-auto flex items-center gap-1 text-terracotta-600 font-medium hover:text-terracotta-700"
          >
            <Eye size={14} />
            {showPreview ? 'ซ่อนตัวอย่าง' : 'ดูตัวอย่าง'}
          </button>
        </div>

        {/* Live preview */}
        {showPreview && (
          <div className="bg-white rounded-xl p-4 border border-cream-200 max-h-60 overflow-y-auto">
            <div
              className="prose-reader font-plex text-sm"
              style={{ lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: currentContent }}
            />
          </div>
        )}

        {/* Access & Status toggles */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-cream-100 rounded-xl p-3">
            <p className="text-xs font-semibold text-charcoal mb-2">สิทธิ์การอ่าน</p>
            <div className="flex gap-2">
              <button
                onClick={() => setAccess('free')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                  access === 'free' ? 'bg-emerald-500 text-white' : 'bg-cream-200 text-charcoal'
                }`}
              >
                อ่านฟรี
              </button>
              <button
                onClick={() => setAccess('vip')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                  access === 'vip' ? 'bg-amber-500 text-white' : 'bg-cream-200 text-charcoal'
                }`}
              >
                VIP เท่านั้น
              </button>
            </div>
          </div>
          <div className="bg-cream-100 rounded-xl p-3">
            <p className="text-xs font-semibold text-charcoal mb-2">สถานะ</p>
            <div className="flex gap-2">
              <button
                onClick={() => setStatus('draft')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                  status === 'draft' ? 'bg-gray-500 text-white' : 'bg-cream-200 text-charcoal'
                }`}
              >
                แบบร่าง
              </button>
              <button
                onClick={() => setStatus('published')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                  status === 'published' ? 'bg-terracotta-500 text-white' : 'bg-cream-200 text-charcoal'
                }`}
              >
                เผยแพร่
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-cream-100 text-charcoal text-sm font-medium hover:bg-cream-200 transition"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 py-3 rounded-xl bg-terracotta-500 text-white text-sm font-bold hover:bg-terracotta-600 transition disabled:opacity-40 active:scale-95"
          >
            บันทึกตอน
          </button>
        </div>
      </div>

      {/* Link modal */}
      <Modal open={linkModalOpen} onClose={() => setLinkModalOpen(false)} title="แทรกลิงก์" maxWidth="max-w-sm">
        <div className="space-y-3">
          <FormField label="ข้อความลิงก์">
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="คลิกที่นี่..."
              className="w-full px-3 py-2.5 rounded-xl bg-cream-100 border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300"
            />
          </FormField>
          <FormField label="URL">
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => {
                setLinkUrl(e.target.value);
                setLinkError(null);
              }}
              placeholder="https://..."
              className="w-full px-3 py-2.5 rounded-xl bg-cream-100 border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300"
            />
          </FormField>
          {linkError && <p className="text-xs text-red-500" role="alert">{linkError}</p>}
          <button
            onClick={insertLink}
            disabled={!linkUrl}
            className="w-full py-2.5 rounded-xl bg-terracotta-500 text-white text-sm font-bold hover:bg-terracotta-600 transition disabled:opacity-40"
          >
            แทรกลิงก์
          </button>
        </div>
      </Modal>
    </Modal>
  );
}

// ============ Reader Preview ============

function ReaderPreview({
  story,
  onClose,
  readingTheme,
  fontFamily,
  fontSize,
}: {
  story: import('@/types').Story;
  onClose: () => void;
  readingTheme: ReadingTheme;
  fontFamily: FontFamily;
  fontSize: number;
}) {
  const { setReadingTheme, setFontFamily, setFontSize } = useApp();
  const [selectedChapterId, setSelectedChapterId] = useState(
    story.chapters.sort((a, b) => a.number - b.number)[0]?.id,
  );
  const chapter = story.chapters.find((c) => c.id === selectedChapterId);

  const themeClass =
    readingTheme === 'sepia' ? 'theme-sepia' : readingTheme === 'night' ? 'theme-night' : '';
  const fontClass = fontFamily === 'sarabun' ? 'font-sarabun' : 'font-plex';

  const themes: { value: ReadingTheme; icon: typeof Sun; label: string }[] = [
    { value: 'paper', icon: Sun, label: 'กระดาษ' },
    { value: 'sepia', icon: Coffee, label: 'ซีเปีย' },
    { value: 'night', icon: Moon, label: 'กลางคืน' },
  ];

  return (
    <Modal open={true} onClose={onClose} title="มุมมองนักอ่าน" maxWidth="max-w-2xl">
      {/* Theme controls */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex gap-1">
          {themes.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.value}
                onClick={() => setReadingTheme(t.value)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  readingTheme === t.value ? 'bg-terracotta-500 text-white' : 'bg-cream-200 text-charcoal'
                }`}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-1">
          {(['plex', 'sarabun'] as FontFamily[]).map((f) => (
            <button
              key={f}
              onClick={() => setFontFamily(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                fontFamily === f ? 'bg-terracotta-500 text-white' : 'bg-cream-200 text-charcoal'
              } ${f === 'sarabun' ? 'font-sarabun' : 'font-plex'}`}
            >
              {f === 'plex' ? 'IBM Plex' : 'Sarabun'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFontSize(fontSize - 2)}
            className="w-8 h-8 rounded-full bg-cream-200 text-charcoal flex items-center justify-center text-xs"
          >
            A-
          </button>
          <span className="text-xs font-bold w-6 text-center">{fontSize}</span>
          <button
            onClick={() => setFontSize(fontSize + 2)}
            className="w-8 h-8 rounded-full bg-cream-200 text-charcoal flex items-center justify-center text-xs"
          >
            A+
          </button>
        </div>
      </div>

      {/* Full-width reader preview */}
      <div className={`rounded-2xl overflow-hidden shadow-lg border border-cream-200 ${themeClass} ${themeClass ? '' : 'bg-cream-50'}`}>
        <div className="h-[500px] overflow-y-auto">
          {chapter ? (
            <div className="px-5 py-4">
              <h2 className={`text-lg font-bold mb-1 ${fontClass}`}>{chapter.title}</h2>
              <p className="text-xs text-charcoal-muted mb-4">
                {story.title} · โดย {story.penName}
              </p>
              <div
                className={`prose-reader ${fontClass}`}
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
                dangerouslySetInnerHTML={{ __html: chapter.content }}
              />
            </div>
          ) : (
            <p className="text-sm text-charcoal-muted text-center py-20">ยังไม่มีตอน</p>
          )}
        </div>
      </div>

      {/* Chapter selector */}
      <div className="mt-3">
        <select
          value={selectedChapterId || ''}
          onChange={(e) => setSelectedChapterId(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-cream-100 border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300"
        >
          {story.chapters
            .sort((a, b) => a.number - b.number)
            .map((ch) => (
              <option key={ch.id} value={ch.id}>
                ตอนที่ {ch.number}: {ch.title}
              </option>
            ))}
        </select>
      </div>
    </Modal>
  );
}

// ============ Helpers ============

function wordCount(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

function charCount(html: string): number {
  return html.replace(/<[^>]+>/g, '').length;
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-charcoal mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function ToolbarBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cream-200 text-charcoal transition active:scale-90"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-cream-200 mx-0.5" />;
}
