import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function createFallbackStorage() {
  const memory = new Map<string, string>();
  return {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
  };
}

function getAuthStorage() {
  const memoryStorage = createFallbackStorage();
  const browserStorages = () => {
    if (typeof window === 'undefined') return [];
    return (['localStorage', 'sessionStorage'] as const).flatMap((storageName) => {
      try {
        return [window[storageName]];
      } catch {
        return [];
      }
    });
  };

  return {
    getItem(key: string) {
      for (const storage of browserStorages()) {
        try {
          const value = storage.getItem(key);
          if (value !== null) {
            memoryStorage.setItem(key, value);
            return value;
          }
        } catch {
          // Continue to session or in-memory storage if browser storage is unavailable.
        }
      }
      return memoryStorage.getItem(key);
    },
    setItem(key: string, value: string) {
      memoryStorage.setItem(key, value);
      for (const storage of browserStorages()) {
        try {
          storage.setItem(key, value);
          return;
        } catch {
          // Continue to session or in-memory storage if browser storage is unavailable.
        }
      }
    },
    removeItem(key: string) {
      memoryStorage.removeItem(key);
      for (const storage of browserStorages()) {
        try {
          storage.removeItem(key);
        } catch {
          // Best-effort cleanup; the stored value is no longer available in memory.
        }
      }
    },
  };
}

export const supabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
          storage: getAuthStorage(),
        },
        realtime: {
          params: { eventsPerSecond: 10 },
        },
      })
    : null;

export const supabaseConfigError =
  supabaseClient === null
    ? 'กรุณาตั้งค่า VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY ในไฟล์ .env แล้วเริ่มแอปใหม่'
    : null;
