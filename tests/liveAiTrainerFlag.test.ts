import test from 'node:test';
import assert from 'node:assert';
import { isLiveAiTrainerEnabled } from '../lib/liveCoach/featureFlags.ts';

test('live AI trainer flag: off unless explicitly enabled', () => {
  const prev = process.env.EXPO_PUBLIC_ENABLE_LIVE_AI_TRAINER;
  try {
    delete process.env.EXPO_PUBLIC_ENABLE_LIVE_AI_TRAINER;
    assert.strictEqual(isLiveAiTrainerEnabled(), false);
    process.env.EXPO_PUBLIC_ENABLE_LIVE_AI_TRAINER = 'false';
    assert.strictEqual(isLiveAiTrainerEnabled(), false);
    process.env.EXPO_PUBLIC_ENABLE_LIVE_AI_TRAINER = 'true';
    assert.strictEqual(isLiveAiTrainerEnabled(), true);
    process.env.EXPO_PUBLIC_ENABLE_LIVE_AI_TRAINER = '1';
    assert.strictEqual(isLiveAiTrainerEnabled(), true);
  } finally {
    if (prev === undefined) delete process.env.EXPO_PUBLIC_ENABLE_LIVE_AI_TRAINER;
    else process.env.EXPO_PUBLIC_ENABLE_LIVE_AI_TRAINER = prev;
  }
});
