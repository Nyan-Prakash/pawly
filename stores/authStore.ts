import { Platform } from 'react-native';
import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';

import { supabase } from '@/lib/supabase';
import type { SubscriptionTier, DogProfile } from '@/types';

interface AuthStore {
  user: User | null;
  session: Session | null;
  subscriptionTier: SubscriptionTier;
  isLoading: boolean;
  isInitialized: boolean;

  // Retained from PR 01 for onboarding
  hasDogProfile: boolean;
  dogProfile: DogProfile | null;
  setDogProfile: (profile: DogProfile | null) => void;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  subscriptionTier: 'free',
  isLoading: false,
  isInitialized: false,

  hasDogProfile: false,
  dogProfile: null,
  setDogProfile: (profile) =>
    set({ dogProfile: profile, hasDogProfile: profile !== null }),

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null });

    supabase.auth.onAuthStateChange((_event, nextSession) => {
      set({ session: nextSession, user: nextSession?.user ?? null });
    });

    set({ isInitialized: true });
  },

  signUp: async (email, password) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithApple: async () => {
    if (Platform.OS !== 'ios') return;
    set({ isLoading: true });
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL
        ]
      });

      if (!credential.identityToken) {
        throw new Error('No identity token returned from Apple.');
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken
      });

      if (error) throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, session: null, subscriptionTier: 'free', hasDogProfile: false, dogProfile: null });
    } finally {
      set({ isLoading: false });
    }
  },

  setSubscriptionTier: (tier) => set({ subscriptionTier: tier })
}));
