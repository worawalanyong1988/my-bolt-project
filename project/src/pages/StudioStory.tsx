import { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '@/useApp';
import { useRouter } from '@/router';
import { Modal } from '@/components/Modal';
import { Badge } from '@/components/Badge';
import { Cover } from '@/components/Cover';
import { StoryForm } from '@/pages/Studio';
import { loadChapterContentRemote } from '@/services/supabaseData';
import type { Chapter, ChapterAccess, StoryStatus, ReadingTheme, FontFamily, Story } from '@/types';
import {
  Plus,
  Trash2,
  Pencil,
  ChevronUp,
  ChevronDown,
  Bold,
  Italic,
  Underline,
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
  Type,
  BookOpen,
  Indent,
  Pilcrow,
  Globe2,
  Minus,
  X,
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
  const [chapterLoadError, setChapterLoadError] = useState<string | null>(null);
  const [loadingChapterId, setLoadingChapterId] = useState<string | null>(null);

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

  const openEditChapter = async (ch: Chapter) => {
    setChapterLoadError(null);
    setLoadingChapterId(ch.id);
    try {
      const loaded = ch.content
        ? { content: ch.content, authorNote: ch.authorNote ?? '' }
        : await loadChapterContentRemote(ch.id);
      setEditingChapter({
        ...ch,
        ...loaded,
        number: Number.isFinite(ch.number) ? ch.number : chapters.length + 1,
        title: ch.title ?? '',
        status: ch.status === 'draft' ? 'draft' : 'published',
        access: ch.access === 'vip' ? 'vip' : 'free',
        authorNote: loaded.authorNote ?? ch.authorNote ?? '',
        content: loaded.content ?? ch.content ?? '',
        readCount: ch.readCount ?? 0,
        createdAt: ch.createdAt ?? Date.now(),
      });
      setShowEditor(true);
    } catch (error) {
      setChapterLoadError(error instanceof Error ? error.message : 'โหลดเนื้อหาตอนไม่สำเร็จ');
    } finally {
      setLoadingChapterId(null);
    }
  };

  const handleSaveChapter = async (ch: Chapter) => {
    await saveChapter(story.id, ch);
    setEditingChapter(ch);
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
                {(chapter.wordCount !== undefined || chapter.content) && (
                  <span className="text-[10px] text-charcoal-muted">
                    {chapter.wordCount ?? wordCount(chapter.content)} คำ
                  </span>
                )}
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
              type="button"
              onClick={() => void openEditChapter(chapter)}
              disabled={loadingChapterId !== null}
              className="text-charcoal-muted hover:text-terracotta-500 transition disabled:opacity-50"
              aria-label={`แก้ไข ${chapter.title}`}
            >
              {loadingChapterId === chapter.id ? 'กำลังโหลด...' : <Pencil size={16} />}
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

      {chapterLoadError && (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
          โหลดเนื้อหาตอนไม่สำเร็จ: {chapterLoadError}
        </p>
      )}

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
  onSave: (c: Chapter) => Promise<void>;
  onClose: () => void;
}) {
  const [number, setNumber] = useState(chapter?.number ?? nextNumber);
  const [title, setTitle] = useState(chapter?.title ?? '');
  const [access, setAccess] = useState<ChapterAccess>(chapter?.access ?? 'free');
  const [authorNote, setAuthorNote] = useState(chapter?.authorNote ?? '');
  const editorRef = useRef<HTMLDivElement>(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const savedLinkRange = useRef<Range | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [, setContentVersion] = useState(0);
  const [saveState, setSaveState] = useState<'idle' | 'unsaved' | 'saving' | 'draft-saved' | 'published' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const editRevision = useRef(0);
  const [editorFontSize, setEditorFontSize] = useState(16);
  const [toolbarFontSize, setToolbarFontSize] = useState(16);
  const [autoIndent, setAutoIndent] = useState(true);
  const savedEditorSelection = useRef<Range | null>(null);

  const markUnsaved = useCallback(() => {
    editRevision.current += 1;
    setSaveState('unsaved');
    setSaveError(null);
  }, []);

  const markContentChanged = useCallback(() => {
    setContentVersion((version) => version + 1);
    markUnsaved();
  }, [markUnsaved]);

  // Initialize contenteditable content
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = cleanChapterContent(chapter?.content || '<p><br></p>');
      normalizeEditorParagraphs(editorRef.current);
    }
  }, [chapter]);

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    markContentChanged();
  }, [markContentChanged]);

  const captureEditorSelection = useCallback(() => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (
      editor &&
      selection?.rangeCount &&
      selection.anchorNode &&
      selection.focusNode &&
      editor.contains(selection.anchorNode) &&
      editor.contains(selection.focusNode)
    ) {
      savedEditorSelection.current = selection.getRangeAt(0).cloneRange();
    } else {
      savedEditorSelection.current = null;
    }
  }, []);

  const applyEditorFontSize = (fontSize: number) => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    const range = savedEditorSelection.current?.cloneRange() ??
      (selection?.rangeCount ? selection.getRangeAt(0).cloneRange() : null);

    if (!editor || !range || range.collapsed || !editor.contains(range.commonAncestorContainer)) {
      setEditorFontSize(fontSize);
      setToolbarFontSize(fontSize);
      return;
    }

    const comparePoints = (
      firstNode: Node,
      firstOffset: number,
      secondNode: Node,
      secondOffset: number,
    ) => {
      const first = document.createRange();
      first.setStart(firstNode, firstOffset);
      first.collapse(true);
      const second = document.createRange();
      second.setStart(secondNode, secondOffset);
      second.collapse(true);
      return first.compareBoundaryPoints(Range.START_TO_START, second);
    };

    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let node = walker.nextNode();
    while (node) {
      if (node.textContent) textNodes.push(node as Text);
      node = walker.nextNode();
    }

    const selectedSegments = textNodes.flatMap((textNode) => {
      const length = textNode.length;
      if (
        comparePoints(range.endContainer, range.endOffset, textNode, 0) <= 0 ||
        comparePoints(range.startContainer, range.startOffset, textNode, length) >= 0
      ) {
        return [];
      }
      const startOffset = range.startContainer === textNode ? range.startOffset : 0;
      const endOffset = range.endContainer === textNode ? range.endOffset : length;
      return startOffset < endOffset ? [{ textNode, startOffset, endOffset }] : [];
    });

    const wrapped: HTMLSpanElement[] = [];
    for (const { textNode, startOffset, endOffset } of selectedSegments.reverse()) {
      const textRange = document.createRange();
      textRange.setStart(textNode, startOffset);
      textRange.setEnd(textNode, endOffset);
      const span = document.createElement('span');
      span.dataset.editorFontSize = 'true';
      span.style.fontSize = `${(fontSize / editorFontSize) * 100}%`;
      span.append(textRange.extractContents());
      textRange.insertNode(span);
      wrapped.unshift(span);
    }

    if (wrapped.length) {
      const updatedRange = document.createRange();
      updatedRange.setStartBefore(wrapped[0]);
      updatedRange.setEndAfter(wrapped[wrapped.length - 1]);
      selection?.removeAllRanges();
      selection?.addRange(updatedRange);
      savedEditorSelection.current = updatedRange.cloneRange();
      setToolbarFontSize(fontSize);
      markContentChanged();
      editor.focus();
    } else {
      setEditorFontSize(fontSize);
      setToolbarFontSize(fontSize);
    }
  };

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
            markContentChanged();
          }
        }
      }
    }
  }, [markContentChanged]);

  // Auto-indent: wraps current paragraph with text-indent style for Thai novel style
  const handleIndent = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const node = sel.anchorNode;
    if (!node) return;
    let block: HTMLElement | null = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
    while (block && block !== editorRef.current) {
      if (block.tagName === 'P') {
        const currentlyIndented = block.dataset.manualIndent
          ? block.dataset.manualIndent === 'on'
          : autoIndent;
        block.dataset.manualIndent = currentlyIndented ? 'off' : 'on';
        markContentChanged();
        return;
      }
      block = block.parentElement;
    }
    document.execCommand('formatBlock', false, '<p>');
    const formattedNode = sel.anchorNode;
    let formattedBlock: HTMLElement | null = formattedNode?.nodeType === Node.ELEMENT_NODE
      ? formattedNode as HTMLElement
      : formattedNode?.parentElement ?? null;
    while (formattedBlock && formattedBlock !== editorRef.current) {
      if (formattedBlock.tagName === 'P') {
        formattedBlock.dataset.manualIndent = autoIndent ? 'off' : 'on';
        markContentChanged();
        return;
      }
      formattedBlock = formattedBlock.parentElement;
    }
    if (editorRef.current) {
      normalizeEditorParagraphs(editorRef.current);
      markContentChanged();
    }
  }, [autoIndent, markContentChanged]);

  // Auto-format: wrap all loose text nodes in <p> tags
  const handleAutoFormat = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    normalizeEditorParagraphs(editor);
    markContentChanged();
  }, [markContentChanged]);

  const handleEditorInput = () => {
    const editor = editorRef.current;
    if (editor) normalizeEditorParagraphs(editor);
    markContentChanged();
    captureEditorSelection();
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const editor = editorRef.current;
    const pastedText = event.clipboardData.getData('text/plain');
    if (!editor || !pastedText) return;
    event.preventDefault();
    const paragraphs = pastedText
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map((line) => `<p>${escapeHtml(line) || '<br>'}</p>`)
      .join('');
    document.execCommand('insertHTML', false, paragraphs);
    normalizeEditorParagraphs(editor);
    markContentChanged();
    captureEditorSelection();
  };

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

    markContentChanged();
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

  const handleSceneBreak = () => {
    document.execCommand('insertHTML', false, '<p style="text-align: center;">***</p><p><br></p>');
    editorRef.current?.focus();
    markContentChanged();
  };

  const handleSave = async (nextStatus: StoryStatus) => {
    if (!title.trim() || saveState === 'saving') return;
    const content = editorRef.current
      ? cleanChapterContent(editorRef.current.innerHTML)
      : '<p><br></p>';
    const revisionAtSave = editRevision.current;
    const newChapter: Chapter = {
      id: chapter?.id || uid(),
      number,
      title: title.trim(),
      content,
      authorNote: authorNote.trim(),
      access,
      status: nextStatus,
      readCount: chapter?.readCount ?? 0,
      createdAt: chapter?.createdAt || Date.now(),
    };
    setSaveState('saving');
    setSaveError(null);
    try {
      await onSave(newChapter);
      setSaveState(editRevision.current === revisionAtSave
        ? nextStatus === 'published' ? 'published' : 'draft-saved'
        : 'unsaved');
    } catch (error) {
      setSaveState('error');
      setSaveError(error instanceof Error ? error.message : 'บันทึกตอนไม่สำเร็จ กรุณาลองอีกครั้ง');
    }
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      maxWidth="max-w-5xl"
    >
      <div className="-mx-5 -mt-5 sticky top-0 z-30 mb-5 border-b border-cream-200 bg-cream-50/95 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between px-4 pt-3 pb-2 sm:px-6">
          <div>
            <h2 className="text-base font-bold text-charcoal">{chapter ? 'แก้ไขตอน' : 'เพิ่มตอนใหม่'}</h2>
            <p className="text-[11px] text-charcoal-muted">พื้นที่เขียนสำหรับนักเขียน Aksara</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่างเขียนตอน"
            className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal-muted transition hover:bg-cream-200"
          >
            <X size={19} />
          </button>
        </div>

        {/* Formatting toolbar */}
        <div className="px-3 pb-3 sm:px-6">
          <div className="rounded-xl border border-cream-200 bg-white/90 p-2">
            <div className="flex flex-wrap items-center gap-1">
              <ToolbarBtn onClick={() => exec('bold')} title="ตัวหนา">
                <Bold size={16} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => exec('italic')} title="ตัวเอียง">
                <Italic size={16} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => exec('underline')} title="ขีดเส้นใต้">
                <Underline size={16} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => exec('strikeThrough')} title="ขีดฆ่า">
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
              <ToolbarBtn onClick={() => exec('justifyLeft')} title="จัดชิดซ้าย">
                <AlignLeft size={16} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => exec('justifyCenter')} title="จัดกึ่งกลาง">
                <AlignCenter size={16} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => exec('justifyRight')} title="จัดชิดขวา">
                <AlignRight size={16} />
              </ToolbarBtn>
              <Divider />
              <ToolbarBtn onClick={() => exec('insertUnorderedList')} title="รายการหัวข้อ">
                <List size={16} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => exec('insertOrderedList')} title="รายการลำดับเลข">
                <ListOrdered size={16} />
              </ToolbarBtn>
              <ToolbarBtn onClick={handleSceneBreak} title="แทรกเส้นคั่นฉาก ***">
                <Minus size={16} />
              </ToolbarBtn>
              <Divider />
              <ToolbarBtn onClick={handleLink} title="แทรกลิงก์">
                <LinkIcon size={16} />
              </ToolbarBtn>
              <ToolbarBtn onClick={handleIndent} title="ย่อหน้า">
                <Indent size={16} />
              </ToolbarBtn>
              <ToolbarBtn onClick={handleAutoFormat} title="จัดย่อหน้าอัตโนมัติ">
                <Pilcrow size={16} />
              </ToolbarBtn>
              <button
                type="button"
                onClick={() => setAutoIndent((enabled) => !enabled)}
                aria-pressed={autoIndent}
                title="เปิดหรือปิดการเยื้องบรรทัดแรกอัตโนมัติ"
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                  autoIndent
                    ? 'border-terracotta-300 bg-terracotta-50 text-terracotta-700'
                    : 'border-cream-200 bg-white text-charcoal-muted hover:bg-cream-50'
                }`}
              >
                <Indent size={14} />
                เยื้องอัตโนมัติ {autoIndent ? 'เปิด' : 'ปิด'}
              </button>
              <label className="flex items-center gap-2 rounded-lg border border-terracotta-300 bg-white px-3 py-1.5 text-xs font-bold text-charcoal shadow-sm">
                <Type size={15} className="text-terracotta-600" />
                ขนาดตัวอักษร
                <select
                  value={toolbarFontSize}
                  onPointerDown={captureEditorSelection}
                  onChange={(event) => applyEditorFontSize(Number(event.target.value))}
                  aria-label="ขนาดตัวอักษรในช่องเขียน"
                  className="rounded-md border border-cream-200 bg-cream-50 px-2 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-terracotta-300"
                >
                  <option value={14}>เล็ก · 14px</option>
                  <option value={16}>ปกติ · 16px</option>
                  <option value={18}>ใหญ่ · 18px</option>
                  <option value={20}>ใหญ่มาก · 20px</option>
                  <option value={24}>ใหญ่พิเศษ · 24px</option>
                </select>
              </label>
            </div>
            <p className="mt-2 px-2 text-[10px] leading-relaxed text-charcoal-muted">
              คลุมดำข้อความก่อนเลือกขนาดเพื่อปรับเฉพาะส่วนนั้น หรือวางเคอร์เซอร์ไว้ในช่องเพื่อปรับทั้งช่อง
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-cream-200 bg-[#fffefa] p-4 shadow-sm sm:p-8">
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FormField label="ตอนที่">
            <input
              type="number"
              value={number}
              onChange={(e) => {
                setNumber(parseInt(e.target.value) || 1);
                markUnsaved();
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-cream-100 border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300"
            />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="ชื่อตอน">
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  markUnsaved();
                }}
                placeholder="บทที่ 1: จุดเริ่มต้น"
                className="w-full px-3 py-2.5 rounded-xl bg-cream-100 border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300"
              />
            </FormField>
          </div>
        </div>

        {/* Editor area */}
        <div>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            data-placeholder="เริ่มเขียนเนื้อเรื่องที่นี่... (กด Enter สร้างย่อหน้าใหม่อัตโนมัติ)"
            onInput={handleEditorInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onMouseUp={captureEditorSelection}
            onKeyUp={captureEditorSelection}
            onTouchEnd={captureEditorSelection}
            className={`chapter-editor prose-reader w-full min-h-[55vh] px-4 py-5 rounded-xl bg-white border border-cream-200 focus:outline-none focus:ring-2 focus:ring-terracotta-300 font-plex ${autoIndent ? 'auto-indent' : ''}`}
            style={{ fontSize: `${editorFontSize}px`, lineHeight: 1.8 }}
          />
        </div>

        {/* Live counters */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-muted bg-cream-100 rounded-xl px-4 py-2.5">
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
            {showPreview ? 'ซ่อนตัวอย่าง' : 'ดูตัวอย่างมุมมองนักอ่าน'}
          </button>
        </div>

        {/* Live preview */}
        {showPreview && (
          <div className="rounded-xl border border-cream-200 bg-white p-5 shadow-inner">
            <div
              className={`chapter-editor prose-reader font-plex ${autoIndent ? 'auto-indent' : ''}`}
              style={{ fontSize: `${editorFontSize}px`, lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: currentContent }}
            />
            {authorNote.trim() && (
              <aside className="mt-6 border-t border-cream-200 pt-4">
                <h3 className="mb-2 text-sm font-bold text-terracotta-700">พูดคุยกับนักอ่าน</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-charcoal-light">{authorNote}</p>
              </aside>
            )}
          </div>
        )}

        {/* Author note */}
        <div className="rounded-xl border border-cream-200 bg-white p-4">
          <label htmlFor="chapter-author-note" className="mb-2 block text-sm font-bold text-charcoal">
            พูดคุยกับนักอ่าน <span className="font-normal text-charcoal-muted">(Author&apos;s Note)</span>
          </label>
          <textarea
            id="chapter-author-note"
            value={authorNote}
            onChange={(event) => {
              setAuthorNote(event.target.value);
              markUnsaved();
            }}
            rows={4}
            placeholder="เขียนข้อความทักทายหรือพูดคุยกับนักอ่านท้ายตอน..."
            className="w-full resize-y rounded-xl border border-cream-200 bg-cream-50 px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-terracotta-300"
          />
        </div>

        {/* Chapter access */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="bg-cream-100 rounded-xl p-3">
            <p className="text-xs font-semibold text-charcoal mb-2">สิทธิ์การอ่าน</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setAccess('free');
                  markUnsaved();
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                  access === 'free' ? 'bg-emerald-500 text-white' : 'bg-cream-200 text-charcoal'
                }`}
              >
                อ่านฟรี
              </button>
              <button
                onClick={() => {
                  setAccess('vip');
                  markUnsaved();
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                  access === 'vip' ? 'bg-amber-500 text-white' : 'bg-cream-200 text-charcoal'
                }`}
              >
                VIP เท่านั้น
              </button>
            </div>
          </div>
          <div className="flex items-center rounded-xl bg-cream-100 px-4 py-3 text-xs text-charcoal-muted">
            เลือกสถานะได้จากปุ่มบันทึกร่างหรือเผยแพร่ด้านล่าง
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-cream-200 pt-4 sm:flex-row">
          <button
            onClick={onClose}
            disabled={saveState === 'saving'}
            className="order-3 flex-1 rounded-xl bg-cream-100 py-3 text-sm font-medium text-charcoal transition hover:bg-cream-200 disabled:opacity-50 sm:order-1"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => void handleSave('draft')}
            disabled={!title.trim() || saveState === 'saving'}
            className="order-2 flex-1 rounded-xl border border-terracotta-300 bg-white py-3 text-sm font-bold text-terracotta-700 transition hover:bg-terracotta-50 disabled:opacity-40"
          >
            บันทึกแบบร่าง
          </button>
          <button
            onClick={() => void handleSave('published')}
            disabled={!title.trim() || saveState === 'saving'}
            className="order-1 flex-1 rounded-xl bg-terracotta-500 py-3 text-sm font-bold text-white transition hover:bg-terracotta-600 disabled:opacity-40 active:scale-95 sm:order-3"
          >
            เผยแพร่ตอน
          </button>
        </div>
        <p className="min-h-5 text-xs" role="status" aria-live="polite">
          {saveState === 'saving' && <span className="text-terracotta-700">กำลังบันทึกตอน...</span>}
          {saveState === 'unsaved' && <span className="text-amber-700">มีการแก้ไขที่ยังไม่ได้บันทึก</span>}
          {saveState === 'draft-saved' && <span className="text-emerald-700">บันทึกฉบับร่างแล้ว</span>}
          {saveState === 'published' && <span className="text-emerald-700">เผยแพร่ตอนเรียบร้อยแล้ว</span>}
          {saveState === 'error' && <span className="text-red-600">บันทึกไม่สำเร็จ: {saveError}</span>}
        </p>
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
    [...story.chapters].sort((a, b) => a.number - b.number)[0]?.id,
  );
  const chapter = story.chapters.find((c) => c.id === selectedChapterId);
  const [previewState, setPreviewState] = useState<{
    chapterId: string;
    content: string;
    authorNote: string;
    loading: boolean;
    error: string | null;
  }>({ chapterId: '', content: '', authorNote: '', loading: false, error: null });

  useEffect(() => {
    let active = true;
    if (!selectedChapterId) {
      setPreviewState({ chapterId: '', content: '', authorNote: '', loading: false, error: null });
      return () => {
        active = false;
      };
    }

    if (chapter?.content) {
      setPreviewState({
        chapterId: selectedChapterId,
        content: chapter.content,
        authorNote: chapter.authorNote ?? '',
        loading: false,
        error: null,
      });
      return () => {
        active = false;
      };
    }

    setPreviewState({ chapterId: selectedChapterId, content: '', authorNote: '', loading: true, error: null });
    void loadChapterContentRemote(selectedChapterId)
      .then(({ content, authorNote }) => {
        if (active) setPreviewState({ chapterId: selectedChapterId, content, authorNote, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (active) {
          setPreviewState({
            chapterId: selectedChapterId,
            content: '',
            authorNote: '',
            loading: false,
            error: error instanceof Error ? error.message : 'โหลดเนื้อหาตอนไม่สำเร็จ',
          });
        }
      });

    return () => {
      active = false;
    };
  }, [chapter?.authorNote, chapter?.content, selectedChapterId]);

  const previewContent = previewState.chapterId === selectedChapterId ? previewState.content : '';
  const previewAuthorNote = previewState.chapterId === selectedChapterId ? previewState.authorNote : '';
  const previewLoading = previewState.chapterId === selectedChapterId && previewState.loading;
  const previewError = previewState.chapterId === selectedChapterId ? previewState.error : null;

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
            disabled={fontSize <= 14}
            aria-label="ลดขนาดตัวอักษรตัวอย่าง"
            className="w-8 h-8 rounded-full bg-cream-200 text-charcoal flex items-center justify-center text-xs"
          >
            A-
          </button>
          <span className="text-xs font-bold w-6 text-center">{fontSize}</span>
          <button
            onClick={() => setFontSize(fontSize + 2)}
            disabled={fontSize >= 28}
            aria-label="เพิ่มขนาดตัวอักษรตัวอย่าง"
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
              {previewLoading && <p className="py-12 text-center text-sm text-charcoal-muted">กำลังโหลดเนื้อหาตอน...</p>}
              {previewError && <p role="alert" className="py-12 text-center text-sm text-red-600">โหลดเนื้อหาตอนไม่สำเร็จ: {previewError}</p>}
              {!previewLoading && !previewError && (
                <div
                  className={`prose-reader ${fontClass}`}
                  style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
                  dangerouslySetInnerHTML={{ __html: previewContent }}
                />
              )}
              {!previewLoading && !previewError && previewAuthorNote && (
                <aside className="mt-8 rounded-2xl border border-terracotta-100 bg-white/80 p-5 shadow-sm">
                  <h3 className="mb-2 text-sm font-bold text-terracotta-700">พูดคุยกับนักอ่าน</h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-charcoal-light">{previewAuthorNote}</p>
                </aside>
              )}
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
          {[...story.chapters]
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
  const text = editorText(html).trim();
  if (!text) return 0;
  if (typeof Intl.Segmenter === 'function') {
    return [...new Intl.Segmenter('th', { granularity: 'word' }).segment(text)]
      .filter((segment) => segment.isWordLike).length;
  }
  return text.split(/\s+/).filter(Boolean).length;
}

function charCount(html: string): number {
  const text = editorText(html);
  if (typeof Intl.Segmenter === 'function') {
    return [...new Intl.Segmenter('th', { granularity: 'grapheme' }).segment(text)].length;
  }
  return Array.from(text).length;
}

function editorText(html: string): string {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container.textContent || '';
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeEditorParagraphs(editor: HTMLElement): void {
  const blockTags = new Set(['BLOCKQUOTE', 'H1', 'H2', 'H3', 'H4', 'HR', 'OL', 'P', 'PRE', 'TABLE', 'UL']);
  for (const child of Array.from(editor.children)) {
    if (child.tagName !== 'DIV') continue;
    if (Array.from(child.children).some((nested) => blockTags.has(nested.tagName) || nested.tagName === 'DIV')) {
      child.replaceWith(...Array.from(child.childNodes));
      normalizeEditorParagraphs(editor);
      return;
    }
    const paragraph = document.createElement('p');
    while (child.firstChild) paragraph.append(child.firstChild);
    if (!paragraph.childNodes.length) paragraph.append(document.createElement('br'));
    child.replaceWith(paragraph);
  }

  const inlineNodes: Node[] = [];
  const wrapInlineNodes = () => {
    if (!inlineNodes.length) return;
    const paragraph = document.createElement('p');
    editor.insertBefore(paragraph, inlineNodes[0]);
    inlineNodes.forEach((node) => paragraph.append(node));
    inlineNodes.length = 0;
  };

  for (const child of Array.from(editor.childNodes)) {
    const isBlock = child.nodeType === Node.ELEMENT_NODE &&
      blockTags.has((child as HTMLElement).tagName);
    if (isBlock) {
      wrapInlineNodes();
    } else if (child.nodeType === Node.TEXT_NODE && !child.textContent?.trim()) {
      child.remove();
    } else {
      inlineNodes.push(child);
    }
  }
  wrapInlineNodes();
}

function cleanChapterContent(html: string): string {
  const container = document.createElement('div');
  container.innerHTML = html;
  container.querySelectorAll('span[data-editor-font-size], span[data-reader-font-scale]').forEach((span) => {
    span.replaceWith(...Array.from(span.childNodes));
  });
  container.querySelectorAll<HTMLElement>('*').forEach((element) => {
    element.style.removeProperty('font-size');
    element.style.removeProperty('text-indent');
    element.removeAttribute('data-editor-font-size');
    element.removeAttribute('data-reader-font-scale');
    if (element.tagName === 'FONT') element.removeAttribute('size');
    if (!element.style.cssText) element.removeAttribute('style');
  });
  return container.innerHTML || '<p><br></p>';
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
