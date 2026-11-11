// Real Thai ⇄ English translation using Google Translate's public endpoint
// Chunks by paragraph to handle long texts

export async function translateText(
  text: string,
  sourceLang: 'th' | 'en' = 'th',
  targetLang: 'en' | 'th' = 'en',
): Promise<string> {
  if (!text.trim()) return text;

  // Extract HTML tags vs text content for chapter content translation
  const isHtml = /<[a-z][\s\S]*?>/i.test(text);

  if (isHtml) {
    return translateHtml(text, sourceLang, targetLang);
  }

  // For markdown content (intro field), translate paragraph by paragraph
  const paragraphs = text.split(/\n\n+/);
  const translated = await Promise.all(
    paragraphs.map((p) => translateChunk(p, sourceLang, targetLang)),
  );
  return translated.join('\n\n');
}

async function translateHtml(
  html: string,
  sourceLang: string,
  targetLang: string,
): Promise<string> {
  // Split by block-level tags and translate text nodes
  const blockRegex = /(<(?:p|h[12]|li|blockquote|div)[^>]*>)([\s\S]*?)(<\/(?:p|h[12]|li|blockquote|div)>)/gi;
  const parts: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(html)) !== null) {
    // Add any text before this block
    if (match.index > lastIndex) {
      parts.push(html.slice(lastIndex, match.index));
    }
    const openTag = match[1];
    const innerContent = match[2];
    const closeTag = match[3];
    // Translate the inner text (strip inline tags, translate, re-insert)
    const translatedInner = await translateInlineContent(innerContent, sourceLang, targetLang);
    parts.push(openTag + translatedInner + closeTag);
    lastIndex = blockRegex.lastIndex;
  }
  // Add remaining
  if (lastIndex < html.length) {
    parts.push(html.slice(lastIndex));
  }
  return parts.join('');
}

async function translateInlineContent(
  content: string,
  sourceLang: string,
  targetLang: string,
): Promise<string> {
  // Split by inline tags (a, strong, em, etc.)
  const inlineRegex = /(<[^>]+>)/g;
  const segments = content.split(inlineRegex);
  const textSegments: { index: number; text: string }[] = [];

  segments.forEach((seg, idx) => {
    if (seg && !seg.startsWith('<') && seg.trim()) {
      textSegments.push({ index: idx, text: seg });
    }
  });

  if (textSegments.length === 0) return content;

  // Batch translate all text segments
  const allText = textSegments.map((s) => s.text).join('\n@@SEP@@\n');
  const translatedAll = await translateChunk(allText, sourceLang, targetLang);
  const translatedParts = translatedAll.split(/\n?@@\s*SEP\s*@@\n?/);

  textSegments.forEach((s, i) => {
    if (translatedParts[i]) {
      segments[s.index] = translatedParts[i];
    }
  });

  return segments.join('');
}

async function translateChunk(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<string> {
  // Google Translate public endpoint (chunked to stay under URL length limits)
  const maxLen = 1000;
  const chunks: string[] = [];

  for (let i = 0; i < text.length; i += maxLen) {
    chunks.push(text.slice(i, i + maxLen));
  }

  const results = await Promise.all(chunks.map((chunk) => fetchTranslation(chunk, sourceLang, targetLang)));
  return results.join('');
}

async function fetchTranslation(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return text;

    const data = await res.json();
    if (!Array.isArray(data) || !Array.isArray(data[0])) return text;

    // data[0] is an array of [translatedText, originalText, ...] pairs
    const translated = data[0]
      .map((item: unknown) => (Array.isArray(item) ? String(item[0]) : ''))
      .join('');

    return translated || text;
  } catch {
    return text;
  }
}

// Translate plain text (for titles, synopsis - no HTML)
export async function translatePlainText(
  text: string,
  sourceLang: 'th' | 'en' = 'th',
  targetLang: 'en' | 'th' = 'en',
): Promise<string> {
  return translateChunk(text, sourceLang, targetLang);
}
