import { describe, it } from 'node:test';
import assert from 'node:assert';
import { LIVE_AI_TRAINER_CONFIG } from '../lib/liveCoach/liveAiTrainerTypes.ts';

describe('Live AI Trainer Config', () => {
  it('should have correct default thresholds', () => {
    assert.strictEqual(LIVE_AI_TRAINER_CONFIG.SAMPLE_INTERVAL_IDLE, 2000);
    assert.strictEqual(LIVE_AI_TRAINER_CONFIG.BURST_FRAME_COUNT, 3);
    assert.strictEqual(LIVE_AI_TRAINER_CONFIG.FALLBACK_CONSECUTIVE_LOW_CONFIDENCE, 3);
  });
});

// Since we don't have a separate parsing module yet (it's inside the hook),
// and the hook depends on native modules (Camera, ImageManipulator, FileSystem),
// we'll focus on testing the pure config and logic if extracted.
// For now, I'll add a placeholder for future logic tests.
