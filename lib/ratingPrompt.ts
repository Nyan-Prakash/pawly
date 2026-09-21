/**
 * Asks for an App Store rating at a good moment: right after a session that
 * went well, once the owner has a few sessions behind them. iOS decides
 * whether the sheet actually appears (at most three times a year), so this
 * only picks the moment and avoids asking again too soon.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

import { captureEvent } from '@/lib/analytics';

const STORAGE_KEY = 'pawly:rating-prompt:last-asked';
const MIN_SESSIONS = 3;
const MIN_DAYS_BETWEEN = 120;

export async function maybeAskForRating(input: { totalSessionsCompleted: number; sessionWentWell: boolean }) {
  try {
    if (!input.sessionWentWell || input.totalSessionsCompleted < MIN_SESSIONS) return;

    const lastAsked = await AsyncStorage.getItem(STORAGE_KEY);
    if (lastAsked) {
      const days = (Date.now() - Date.parse(lastAsked)) / (24 * 60 * 60 * 1000);
      if (days < MIN_DAYS_BETWEEN) return;
    }

    if (!(await StoreReview.isAvailableAsync())) return;
    await AsyncStorage.setItem(STORAGE_KEY, new Date().toISOString());
    captureEvent('rating_prompt_requested', { totalSessionsCompleted: input.totalSessionsCompleted });
    await StoreReview.requestReview();
  } catch {
    // Never worth interrupting the owner over.
  }
}
