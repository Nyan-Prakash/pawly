import { describe, it } from 'node:test';
import assert from 'node:assert';

import { LIVE_AI_TRAINER_CONFIG } from '../lib/liveCoach/liveAiTrainerTypes.ts';
import {
  UNCLEAR_RESPONSE,
  MAX_COACH_MESSAGE_CHARS,
  parseLiveAiTrainerResponse,
  createRateLimiter,
  createFallbackTracker,
  createSummaryAggregator,
  pushHistory,
  describeError,
} from '../lib/liveCoach/liveAiTrainerLogic.ts';

const good = () =>
  parseLiveAiTrainerResponse({
    dogVisible: true,
    framingQuality: 'good',
    observedBehavior: 'sit',
    behaviorConfidence: 0.9,
    repStatus: 'completed',
    holdStatus: 'not_applicable',
    mainIssue: 'none',
    coachMessage: 'Nice sit!',
    shouldSpeak: true,
    suggestedUiAction: 'mark_success',
    fallbackToManual: false,
    needsCameraAdjustment: false,
    latencyCategory: 'good',
    confidenceCategory: 'high',
  });

describe('LIVE_AI_TRAINER_CONFIG', () => {
  it('keeps the tuned thresholds', () => {
    assert.strictEqual(LIVE_AI_TRAINER_CONFIG.SAMPLE_INTERVAL_IDLE, 2000);
    assert.strictEqual(LIVE_AI_TRAINER_CONFIG.BURST_FRAME_COUNT, 3);
    assert.strictEqual(LIVE_AI_TRAINER_CONFIG.FALLBACK_CONSECUTIVE_LOW_CONFIDENCE, 3);
    assert.strictEqual(LIVE_AI_TRAINER_CONFIG.FALLBACK_CONSECUTIVE_ERRORS, 3);
    assert.ok(LIVE_AI_TRAINER_CONFIG.AUTO_REP_COOLDOWN_MS > LIVE_AI_TRAINER_CONFIG.SAMPLE_INTERVAL_IDLE);
  });
});

describe('parseLiveAiTrainerResponse', () => {
  it('passes a well-formed response through unchanged', () => {
    const r = good();
    assert.strictEqual(r.observedBehavior, 'sit');
    assert.strictEqual(r.suggestedUiAction, 'mark_success');
    assert.strictEqual(r.coachMessage, 'Nice sit!');
  });

  it('returns the neutral response for garbage input', () => {
    assert.deepStrictEqual(parseLiveAiTrainerResponse(null), UNCLEAR_RESPONSE);
    assert.deepStrictEqual(parseLiveAiTrainerResponse('nope'), UNCLEAR_RESPONSE);
    assert.deepStrictEqual(parseLiveAiTrainerResponse(42), UNCLEAR_RESPONSE);
  });

  it('coerces unknown enum values to safe defaults', () => {
    const r = parseLiveAiTrainerResponse({
      framingQuality: 'excellent',
      observedBehavior: 'flying',
      suggestedUiAction: 'launch_rockets',
      mainIssue: 'zoomies',
      dogVisible: 'yes',
    });
    assert.strictEqual(r.framingQuality, 'poor'); // dogVisible coerced to false
    assert.strictEqual(r.observedBehavior, 'unclear');
    assert.strictEqual(r.suggestedUiAction, 'continue_live');
    assert.strictEqual(r.mainIssue, 'none');
    assert.strictEqual(r.dogVisible, false);
  });

  it('clamps confidence and derives the category when missing', () => {
    assert.strictEqual(parseLiveAiTrainerResponse({ behaviorConfidence: 5 }).behaviorConfidence, 1);
    assert.strictEqual(parseLiveAiTrainerResponse({ behaviorConfidence: -1 }).behaviorConfidence, 0);
    assert.strictEqual(parseLiveAiTrainerResponse({ behaviorConfidence: 0.8 }).confidenceCategory, 'high');
    assert.strictEqual(parseLiveAiTrainerResponse({ behaviorConfidence: 0.5 }).confidenceCategory, 'medium');
    assert.strictEqual(parseLiveAiTrainerResponse({ behaviorConfidence: 0.1 }).confidenceCategory, 'low');
    assert.strictEqual(parseLiveAiTrainerResponse({ behaviorConfidence: 'high' }).behaviorConfidence, 0);
  });

  it('never auto-marks a rep below high confidence', () => {
    const r = parseLiveAiTrainerResponse({ suggestedUiAction: 'mark_success', confidenceCategory: 'medium' });
    assert.strictEqual(r.suggestedUiAction, 'continue_live');
    const r2 = parseLiveAiTrainerResponse({ suggestedUiAction: 'mark_success', behaviorConfidence: 0.95 });
    assert.strictEqual(r2.suggestedUiAction, 'mark_success');
  });

  it('derives fallback and reframe flags from the suggested action', () => {
    assert.strictEqual(parseLiveAiTrainerResponse({ suggestedUiAction: 'fallback_manual' }).fallbackToManual, true);
    assert.strictEqual(parseLiveAiTrainerResponse({ suggestedUiAction: 'ask_reframe' }).needsCameraAdjustment, true);
  });

  it('substitutes and truncates coach messages', () => {
    assert.strictEqual(parseLiveAiTrainerResponse({ coachMessage: '   ' }).coachMessage, UNCLEAR_RESPONSE.coachMessage);
    const long = 'x'.repeat(500);
    const r = parseLiveAiTrainerResponse({ coachMessage: long });
    assert.ok(r.coachMessage.length <= MAX_COACH_MESSAGE_CHARS);
    assert.ok(r.coachMessage.endsWith('…'));
  });
});

describe('createRateLimiter', () => {
  it('allows up to max requests in the window then blocks', () => {
    const rl = createRateLimiter(3, 1000);
    assert.ok(rl.tryAcquire(0));
    assert.ok(rl.tryAcquire(10));
    assert.ok(rl.tryAcquire(20));
    assert.strictEqual(rl.tryAcquire(30), false);
    assert.strictEqual(rl.retryAfterMs(30), 970);
  });

  it('frees slots as the window slides', () => {
    const rl = createRateLimiter(2, 1000);
    rl.tryAcquire(0);
    rl.tryAcquire(500);
    assert.strictEqual(rl.tryAcquire(999), false);
    assert.strictEqual(rl.retryAfterMs(999), 1);
    assert.strictEqual(rl.retryAfterMs(1000), 0);
    assert.ok(rl.tryAcquire(1000));
  });

  it('reset clears the window', () => {
    const rl = createRateLimiter(1, 1000);
    rl.tryAcquire(0);
    rl.reset();
    assert.ok(rl.tryAcquire(1));
  });

  it('defaults to the configured per-minute cap', () => {
    const rl = createRateLimiter();
    for (let i = 0; i < LIVE_AI_TRAINER_CONFIG.MAX_REQUESTS_PER_MINUTE; i++) assert.ok(rl.tryAcquire(i));
    assert.strictEqual(rl.tryAcquire(999), false);
  });
});

describe('createFallbackTracker', () => {
  const low = () => parseLiveAiTrainerResponse({ confidenceCategory: 'low', framingQuality: 'good', dogVisible: true });
  const poor = () => parseLiveAiTrainerResponse({ confidenceCategory: 'high', framingQuality: 'poor' });

  it('triggers after N consecutive low-confidence responses', () => {
    const t = createFallbackTracker({ lowConfidence: 3 });
    assert.strictEqual(t.observe(low()), null);
    assert.strictEqual(t.observe(low()), null);
    assert.strictEqual(t.observe(low()), 'low_confidence');
  });

  it('a good response resets the streak', () => {
    const t = createFallbackTracker({ lowConfidence: 2 });
    t.observe(low());
    t.observe(good());
    assert.strictEqual(t.observe(low()), null);
  });

  it('triggers on poor framing streaks independently', () => {
    const t = createFallbackTracker({ poorFraming: 2, lowConfidence: 99 });
    assert.strictEqual(t.observe(poor()), null);
    assert.strictEqual(t.observe(poor()), 'poor_framing');
  });

  it('honours an explicit model request immediately', () => {
    const t = createFallbackTracker();
    assert.strictEqual(t.observe(parseLiveAiTrainerResponse({ fallbackToManual: true })), 'model_requested');
  });

  it('triggers on consecutive transport errors and resets on success', () => {
    const t = createFallbackTracker({ errors: 2 });
    assert.strictEqual(t.observeError(), null);
    t.observe(good());
    assert.strictEqual(t.observeError(), null);
    assert.strictEqual(t.observeError(), 'errors');
  });
});

describe('createSummaryAggregator', () => {
  it('reports unused when nothing was recorded', () => {
    const s = createSummaryAggregator().build();
    assert.strictEqual(s.used, false);
    assert.strictEqual(s.interactionCount, 0);
    assert.strictEqual(s.autoRepCount, 0);
    assert.strictEqual(s.finalCoachMessage, undefined);
  });

  it('aggregates counts, confidence, and flags', () => {
    const agg = createSummaryAggregator();
    agg.recordResponse(good(), 3, false);
    agg.recordResponse(parseLiveAiTrainerResponse({ confidenceCategory: 'low', framingQuality: 'poor', coachMessage: 'Move closer' }), 1, true);
    agg.recordAutoRep();
    agg.markFallback();
    const s = agg.build();
    assert.strictEqual(s.used, true);
    assert.strictEqual(s.interactionCount, 2);
    assert.strictEqual(s.evaluationCount, 4);
    assert.strictEqual(s.framingIssueCount, 1);
    assert.strictEqual(s.audioInteractionOccurred, true);
    assert.strictEqual(s.fallbackOccurred, true);
    assert.strictEqual(s.autoRepCount, 1);
    assert.strictEqual(s.averageConfidence, 'medium'); // (2 + 0) / 2 = 1
    assert.strictEqual(s.finalCoachMessage, 'Move closer');
  });

  it('classifies average confidence at the boundaries', () => {
    const hi = createSummaryAggregator();
    hi.recordResponse(good(), 1, false);
    assert.strictEqual(hi.build().averageConfidence, 'high');

    const lo = createSummaryAggregator();
    lo.recordResponse(parseLiveAiTrainerResponse({ confidenceCategory: 'low' }), 1, false);
    assert.strictEqual(lo.build().averageConfidence, 'low');
  });
});

describe('pushHistory', () => {
  it('keeps only the most recent entries', () => {
    let h = pushHistory([], { timestamp: 1, observedBehavior: 'sit', coachMessage: 'a' }, 2);
    h = pushHistory(h, { timestamp: 2, observedBehavior: 'down', coachMessage: 'b' }, 2);
    h = pushHistory(h, { timestamp: 3, observedBehavior: 'stand', coachMessage: 'c' }, 2);
    assert.deepStrictEqual(h.map((e) => e.timestamp), [2, 3]);
  });

  it('does not mutate the input array', () => {
    const original = [{ timestamp: 1, observedBehavior: 'sit', coachMessage: 'a' }];
    pushHistory(original, { timestamp: 2, observedBehavior: 'sit', coachMessage: 'b' });
    assert.strictEqual(original.length, 1);
  });
});

describe('describeError', () => {
  it('has copy for every error kind', () => {
    for (const kind of ['timeout', 'network', 'rate_limited', 'unauthorized', 'server', 'capture'] as const) {
      assert.ok(describeError(kind).length > 10, kind);
    }
  });
});
