export interface SharePayload {
  title: string;
  text: string;
  url: string;
}

export async function shareLink(payload: SharePayload): Promise<'shared' | 'copied'> {
  if (navigator.share) {
    await navigator.share(payload);
    return 'shared';
  }

  if (!navigator.clipboard?.writeText) {
    throw new Error('เบราว์เซอร์นี้ไม่รองรับการแชร์หรือคัดลอกลิงก์');
  }

  await navigator.clipboard.writeText(`${payload.text}\n${payload.url}`);
  return 'copied';
}
