import 'react-native-url-polyfill/auto';

import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables.');
}

// SecureStore has a 2048-byte value limit per key. Supabase session tokens can
// exceed this, so we chunk large values across multiple keys.
const CHUNK_SIZE = 1800; // bytes, safely under the 2048 limit

const secureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    const chunkCount = await SecureStore.getItemAsync(`${key}_chunks`);
    if (chunkCount !== null) {
      const count = parseInt(chunkCount, 10);
      const chunks: string[] = [];
      for (let i = 0; i < count; i++) {
        const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
        if (chunk === null) return null;
        chunks.push(chunk);
      }
      return chunks.join('');
    }
    return SecureStore.getItemAsync(key);
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (value.length <= CHUNK_SIZE) {
      // Clean up any previous chunked version, then store directly
      await cleanChunks(key);
      await SecureStore.setItemAsync(key, value);
    } else {
      // Remove any previous unchunked version, then store in chunks
      await SecureStore.deleteItemAsync(key).catch(() => {});
      const chunks = chunkString(value, CHUNK_SIZE);
      for (let i = 0; i < chunks.length; i++) {
        await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunks[i]);
      }
      await SecureStore.setItemAsync(`${key}_chunks`, String(chunks.length));
    }
  },

  removeItem: async (key: string): Promise<void> => {
    await cleanChunks(key);
    await SecureStore.deleteItemAsync(key).catch(() => {});
  },
};

function chunkString(str: string, size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.slice(i, i + size));
  }
  return chunks;
}

async function cleanChunks(key: string): Promise<void> {
  const chunkCount = await SecureStore.getItemAsync(`${key}_chunks`);
  if (chunkCount !== null) {
    const count = parseInt(chunkCount, 10);
    for (let i = 0; i < count; i++) {
      await SecureStore.deleteItemAsync(`${key}_chunk_${i}`).catch(() => {});
    }
    await SecureStore.deleteItemAsync(`${key}_chunks`).catch(() => {});
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export async function createUserRecord(userId: string, _email?: string): Promise<void> {
  const { error } = await supabase.from('user_profiles').upsert(
    { id: userId },
    { onConflict: 'id', ignoreDuplicates: true }
  );

  if (error) {
    throw error;
  }
}
