/**
 * Last known dog, plans and progress, kept on the device so a launch with no
 * signal (yards, parks) still shows the plan instead of an empty screen. The
 * server stays the source of truth: a successful fetch always overwrites this.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { mergeActivePlanSchedules } from '@/lib/mergedSchedule';
import { useDogStore } from '@/stores/dogStore';
import { usePlanStore } from '@/stores/planStore';
import { useProgressStore } from '@/stores/progressStore';
import type { Plan } from '@/types';

const STORAGE_KEY = 'pawly:offline-cache:v1';
const SAVE_DEBOUNCE_MS = 1500;

/** Flags that describe a fetch in flight, not the user's data. */
const TRANSIENT_KEYS = new Set(['isLoading', 'error', 'loadError', 'protocols']);

interface CachedState {
  userId: string;
  savedAt: string;
  dog: Record<string, unknown>;
  plan: Record<string, unknown>;
  progress: Record<string, unknown>;
}

function dataOnly(state: object): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(state).filter(([key, value]) => typeof value !== 'function' && !TRANSIENT_KEYS.has(key)),
  );
}

let stopCaching: (() => void) | null = null;

/** Begin mirroring the stores to disk for this user. Safe to call repeatedly. */
export function startOfflineCache(userId: string) {
  stopOfflineCache();
  let timer: ReturnType<typeof setTimeout> | null = null;

  const save = () => {
    // An empty store means "not loaded yet" (or a failed fetch), never "the
    // user has nothing", so it must not replace a good snapshot.
    if (!useDogStore.getState().dog) return;
    // Same for a fetch that just failed: keep the last good snapshot.
    if (usePlanStore.getState().loadError || useProgressStore.getState().loadError) return;
    const snapshot: CachedState = {
      userId,
      savedAt: new Date().toISOString(),
      dog: dataOnly(useDogStore.getState()),
      plan: dataOnly(usePlanStore.getState()),
      progress: dataOnly(useProgressStore.getState()),
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)).catch(() => {});
  };
  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(save, SAVE_DEBOUNCE_MS);
  };

  const unsubscribers = [
    useDogStore.subscribe(schedule),
    usePlanStore.subscribe(schedule),
    useProgressStore.subscribe(schedule),
  ];
  stopCaching = () => {
    if (timer) clearTimeout(timer);
    unsubscribers.forEach((unsubscribe) => unsubscribe());
  };
}

export function stopOfflineCache() {
  stopCaching?.();
  stopCaching = null;
}

/**
 * Fill the stores from the last snapshot. Returns true when this user's data
 * was restored. "Today" is recomputed, since the snapshot may be days old.
 */
export async function hydrateFromOfflineCache(userId: string): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const cached = JSON.parse(raw) as CachedState;
    if (cached.userId !== userId || !cached.dog?.dog) return false;

    useDogStore.setState(cached.dog);
    useProgressStore.setState(cached.progress);

    const plansById = (cached.plan.plansById ?? {}) as Record<string, Plan>;
    const activePlanIds = (cached.plan.activePlanIds ?? []) as string[];
    const merged = mergeActivePlanSchedules(
      activePlanIds.map((id) => plansById[id]).filter((plan): plan is Plan => plan != null),
    );
    usePlanStore.setState({
      ...cached.plan,
      todaySessions: merged.todaySessions,
      missedSessions: merged.missedSessions,
      recommendedTodaySession: merged.recommendedTodaySession,
      todaySession: merged.recommendedTodaySession ?? null,
    });
    return true;
  } catch {
    return false;
  }
}

export async function clearOfflineCache() {
  stopOfflineCache();
  await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
}
