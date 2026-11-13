import { supabaseClient } from './supabaseClient';
import { createUuid } from '@/utils/uuid';

export async function uploadProfileAvatar(userId: string, file: File): Promise<string> {
  if (!supabaseClient) throw new Error('Supabase ยังไม่ได้ตั้งค่า');
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'image';
  const path = `${userId}/${createUuid()}.${extension}`;
  const { error } = await supabaseClient.storage.from('profile-avatars').upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  return supabaseClient.storage.from('profile-avatars').getPublicUrl(path).data.publicUrl;
}
