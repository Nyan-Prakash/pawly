import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables.');
}

/**
 * Auth tokens live in the Keychain, not in plain AsyncStorage. SecureStore
 * caps a value at about 2 KB and a session is larger, so it is split across
 * numbered keys. Sessions saved by older builds are moved over on first read.
 */
const CHUNK_SIZE = 1800;
const secureOptions: SecureStore.SecureStoreOptions = {
  // Token refresh can run while the phone is locked.
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

async function removeSecureItem(key: string) {
  const count = Number((await SecureStore.getItemAsync(`${key}.chunks`, secureOptions)) ?? 0);
  for (let i = 0; i < count; i++) {
    await SecureStore.deleteItemAsync(`${key}.${i}`, secureOptions);
  }
  await SecureStore.deleteItemAsync(`${key}.chunks`, secureOptions);
}

async function setSecureItem(key: string, value: string) {
  await removeSecureItem(key);
  const count = Math.ceil(value.length / CHUNK_SIZE);
  for (let i = 0; i < count; i++) {
    await SecureStore.setItemAsync(`${key}.${i}`, value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE), secureOptions);
  }
  // Written last, so a half-written value is never read back as complete.
  await SecureStore.setItemAsync(`${key}.chunks`, String(count), secureOptions);
}

const secureStorageAdapter = {
  getItem: async (key: string) => {
    const count = Number((await SecureStore.getItemAsync(`${key}.chunks`, secureOptions)) ?? 0);
    if (count > 0) {
      const parts: string[] = [];
      for (let i = 0; i < count; i++) {
        const part = await SecureStore.getItemAsync(`${key}.${i}`, secureOptions);
        if (part == null) return null;
        parts.push(part);
      }
      return parts.join('');
    }

    const legacy = await AsyncStorage.getItem(key);
    if (legacy != null) {
      await setSecureItem(key, legacy);
      await AsyncStorage.removeItem(key);
    }
    return legacy;
  },
  setItem: (key: string, value: string) => setSecureItem(key, value),
  removeItem: async (key: string) => {
    await removeSecureItem(key);
    await AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStorageAdapter,
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
