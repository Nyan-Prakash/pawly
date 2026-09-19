/**
 * Crash-safe snapshot of an in-progress training session.
 *
 * Sessions with a dog get interrupted constantly (phone calls, the dog bolting,
 * the app being killed in the background). The session store is in-memory, so
 * without this a killed app loses the whole session. We write a small
 * snapshot on every state change and offer to resume it for a few hours.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SessionState, StepResult } from '@/stores/sessionStore';

const STORAGE_KEY = 'pawly:active-session:v1';

/** How long a snapshot stays resumable. */
export const SESSION_SNAPSHOT_TTL_MS = 3 * 60 * 60 * 1000;

export interface SessionSnapshot {
  sessionId: string;
  planId: string | null;
  exerciseId: string;
  protocolId: string;
  protocolTitle: string;
  totalSteps: number;
  startedAt: string;
  trainingStartedAt: string | null;
  currentStepIndex: number;
  stepResults: StepResult[];
  repCount: number;
  state: SessionState;
  savedAt: string;
}

export function isSnapshotFresh(snapshot: SessionSnapshot, now: Date = new Date()): boolean {
  const saved = Date.parse(snapshot.savedAt);
  if (Number.isNaN(saved)) return false;
  return now.getTime() - saved <= SESSION_SNAPSHOT_TTL_MS;
}

/** Only mid-training states are worth resuming. */
export function isSnapshotResumable(snapshot: SessionSnapshot): boolean {
  return (
    isSnapshotFresh(snapshot) &&
    (snapshot.state === 'STEP_ACTIVE' ||
      snapshot.state === 'STEP_COMPLETE' ||
      snapshot.state === 'SESSION_REVIEW')
  );
}

export async function saveSessionSnapshot(snapshot: SessionSnapshot): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (e) {
    if (__DEV__) console.warn('[sessionPersistence] save failed', e);
  }
}

export async function loadSessionSnapshot(): Promise<SessionSnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionSnapshot;
    if (!parsed || typeof parsed.sessionId !== 'string') return null;
    if (!isSnapshotFresh(parsed)) {
      await clearSessionSnapshot();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function clearSessionSnapshot(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing useful to do; the snapshot will expire on its own.
  }
}
