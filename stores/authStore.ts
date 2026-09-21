import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

import type { DogProfile } from '@/types';

/**
 * Mirror of the Supabase session plus the routing flags derived from it. The
 * root layout owns the auth listener and writes into this store; screens call
 * `supabase.auth` directly for sign-in and sign-out.
 */
interface AuthStore {
  user: User | null;
  session: Session | null;
  isInitialized: boolean;

  /** Set when the app was opened from a password reset email; holds the user on the new-password screen. */
  isPasswordRecovery: boolean;

  // Retained from PR 01 for onboarding
  hasDogProfile: boolean;
  dogProfile: DogProfile | null;
  setDogProfile: (profile: DogProfile | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  isInitialized: false,
  isPasswordRecovery: false,

  hasDogProfile: false,
  dogProfile: null,
  setDogProfile: (profile) =>
    set({ dogProfile: profile, hasDogProfile: profile !== null }),
}));
