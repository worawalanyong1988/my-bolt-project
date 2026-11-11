interface GeminiImagePart {
  inlineData?: {
    mimeType?: string;
    data?: string;
  };
}

interface GeminiImageResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiImagePart[];
    };
  }>;
  error?: {
    message?: string;
  };
}

const GEMINI_IMAGE_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent';

export async function generateNovelCover(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('ไม่พบ VITE_GEMINI_API_KEY กรุณาตั้งค่า API key ก่อนสร้างภาพ');
  }

  const response = await fetch(GEMINI_IMAGE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: { aspectRatio: '3:4' },
      },
    }),
  });
  const result = (await response.json()) as GeminiImageResponse;

  if (!response.ok) {
    throw new Error(result.error?.message || `สร้างภาพไม่สำเร็จ (HTTP ${response.status})`);
  }

  const imagePart = result.candidates
    ?.flatMap((candidate) => candidate.content?.parts || [])
    .find((part) => part.inlineData?.data);
  if (!imagePart?.inlineData?.data) {
    throw new Error('Gemini ไม่ได้ส่งข้อมูลภาพกลับมา กรุณาลองใหม่อีกครั้ง');
  }

  const mimeType = imagePart.inlineData.mimeType?.startsWith('image/')
    ? imagePart.inlineData.mimeType
    : 'image/png';
  return `data:${mimeType};base64,${imagePart.inlineData.data}`;
}
