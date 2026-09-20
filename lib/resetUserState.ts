/**
 * Everything held in memory or on disk for the signed-in user. Runs on every
 * sign-out so the next account on this device starts clean.
 */

import * as Notifications from 'expo-notifications';
import type { QueryClient } from '@tanstack/react-query';

import { clearOfflineCache } from '@/lib/offlineCache';
import { clearSessionSnapshot } from '@/lib/sessionPersistence';
import { useAuthStore } from '@/stores/authStore';
import { useCoachStore } from '@/stores/coachStore';
import { useDogStore } from '@/stores/dogStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { usePlanStore } from '@/stores/planStore';
import { useProgressStore } from '@/stores/progressStore';
import { useSessionStore } from '@/stores/sessionStore';

let queryClientRef: QueryClient | null = null;

/** The root layout registers its client so the cache is cleared with the stores. */
export function registerQueryClient(client: QueryClient) {
  queryClientRef = client;
}

export function resetUserState() {
  const stores = [
    useDogStore,
    usePlanStore,
    useProgressStore,
    useCoachStore,
    useNotificationStore,
    useSessionStore,
  ];
  for (const store of stores) {
    // The initial state includes the actions, so a full replace is safe.
    (store as { setState: (s: unknown, replace: true) => void }).setState(store.getInitialState(), true);
  }

  useAuthStore.setState({ hasDogProfile: false, dogProfile: null });
  queryClientRef?.clear();
  clearSessionSnapshot().catch(() => {});
  clearOfflineCache();
  // Reminders name the previous user's dog.
  Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
}
