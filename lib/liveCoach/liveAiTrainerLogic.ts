// ─────────────────────────────────────────────────────────────────────────────
// Live AI Trainer — pure, platform-free logic
//
// Everything in this file is free of React / native imports so it can be
// unit-tested with plain `node --test`.  The hook composes these pieces.
// ─────────────────────────────────────────────────────────────────────────────

import {
  LIVE_AI_TRAINER_CONFIG,
  type LiveAiTrainerResponse,
  type LiveAiTrainerSummary,
} from './liveAiTrainerTypes.ts';

// ── Response parsing / validation ────────────────────────────────────────────

const FRAMING = ['good', 'partial', 'poor'] as const;
const BEHAVIOR = ['sit', 'down', 'stand', 'moving', 'unclear'] as const;
const REP = ['not_started', 'in_progress', 'completed', 'failed', 'unclear'] as const;
const HOLD = ['not_applicable', 'holding', 'broke_early', 'held_long_enough', 'unclear'] as const;
const ISSUE = ['none', 'breaking_early', 'distracted', 'aroused', 'unclear_cue', 'poor_framing', 'unclear'] as const;
const UI_ACTION = ['continue_live', 'ask_reframe', 'fallback_manual', 'mark_success', 'mark_failed', 'wait'] as const;
const LATENCY = ['good', 'slow'] as const;
const CONFIDENCE = ['high', 'medium', 'low'] as const;

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/** A safe, neutral response used when the model output is unusable. */
export const UNCLEAR_RESPONSE: LiveAiTrainerResponse = {
  dogVisible: false,
  framingQuality: 'poor',
  observedBehavior: 'unclear',
  behaviorConfidence: 0,
  repStatus: 'unclear',
  holdStatus: 'unclear',
  mainIssue: 'unclear',
  coachMessage: "I couldn't read that moment clearly. Keep going, I'm still watching.",
  shouldSpeak: false,
  suggestedUiAction: 'wait',
  fallbackToManual: false,
  needsCameraAdjustment: false,
  latencyCategory: 'good',
  confidenceCategory: 'low',
};

export const MAX_COACH_MESSAGE_CHARS = 200;

/**
 * Coerce an arbitrary JSON value into a well-formed LiveAiTrainerResponse.
 * Unknown enum values fall back to their safest option; never throws.
 */
export function parseLiveAiTrainerResponse(raw: unknown): LiveAiTrainerResponse {
  if (!raw || typeof raw !== 'object') return UNCLEAR_RESPONSE;
  const r = raw as Record<string, unknown>;

  const confidenceNum =
    typeof r.behaviorConfidence === 'number' && Number.isFinite(r.behaviorConfidence)
      ? Math.min(1, Math.max(0, r.behaviorConfidence))
      : 0;

  const messageRaw = typeof r.coachMessage === 'string' ? r.coachMessage.trim() : '';
  const coachMessage =
    messageRaw.length === 0
      ? UNCLEAR_RESPONSE.coachMessage
      : messageRaw.length > MAX_COACH_MESSAGE_CHARS
      ? `${messageRaw.slice(0, MAX_COACH_MESSAGE_CHARS - 1).trimEnd()}…`
      : messageRaw;

  const dogVisible = bool(r.dogVisible, false);
  const framingQuality = pick(r.framingQuality, FRAMING, dogVisible ? 'partial' : 'poor');

  // Derive confidence category from the numeric score when the model omits it.
  const derivedCategory: LiveAiTrainerResponse['confidenceCategory'] =
    confidenceNum >= 0.75 ? 'high' : confidenceNum >= 0.45 ? 'medium' : 'low';

  const suggestedUiAction = pick(r.suggestedUiAction, UI_ACTION, 'continue_live');
  const confidenceCategory = pick(r.confidenceCategory, CONFIDENCE, derivedCategory);

  return {
    dogVisible,
    framingQuality,
    observedBehavior: pick(r.observedBehavior, BEHAVIOR, 'unclear'),
    behaviorConfidence: confidenceNum,
    repStatus: pick(r.repStatus, REP, 'unclear'),
    holdStatus: pick(r.holdStatus, HOLD, 'not_applicable'),
    mainIssue: pick(r.mainIssue, ISSUE, 'none'),
    coachMessage,
    shouldSpeak: bool(r.shouldSpeak, false),
    // Never auto-mark a rep on anything but high confidence — the prompt says
    // the same, but we enforce it here so a chatty model can't inflate counts.
    suggestedUiAction:
      suggestedUiAction === 'mark_success' && confidenceCategory !== 'high'
        ? 'continue_live'
        : suggestedUiAction,
    fallbackToManual: bool(r.fallbackToManual, false) || suggestedUiAction === 'fallback_manual',
    needsCameraAdjustment:
      bool(r.needsCameraAdjustment, false) || suggestedUiAction === 'ask_reframe',
    latencyCategory: pick(r.latencyCategory, LATENCY, 'good'),
    confidenceCategory,
  };
}

// ── Rate limiting ────────────────────────────────────────────────────────────

export interface RateLimiter {
  /** Returns true and records the request if it is allowed. */
  tryAcquire(now?: number): boolean;
  /** Milliseconds until the next request would be allowed (0 if allowed now). */
  retryAfterMs(now?: number): number;
  reset(): void;
}

export function createRateLimiter(
  maxRequests: number = LIVE_AI_TRAINER_CONFIG.MAX_REQUESTS_PER_MINUTE,
  windowMs: number = 60_000
): RateLimiter {
  let timestamps: number[] = [];

  const prune = (now: number) => {
    timestamps = timestamps.filter((t) => now - t < windowMs);
  };

  return {
    tryAcquire(now = Date.now()) {
      prune(now);
      if (timestamps.length >= maxRequests) return false;
      timestamps.push(now);
      return true;
    },
    retryAfterMs(now = Date.now()) {
      prune(now);
      if (timestamps.length < maxRequests) return 0;
      return Math.max(0, windowMs - (now - timestamps[0]));
    },
    reset() {
      timestamps = [];
    },
  };
}

// ── Fallback detection ───────────────────────────────────────────────────────

export type FallbackReason = 'low_confidence' | 'poor_framing' | 'model_requested' | 'errors';

export interface FallbackTracker {
  /** Feed a successful response. Returns a reason when fallback should trigger. */
  observe(response: LiveAiTrainerResponse): FallbackReason | null;
  /** Feed a transport / server failure. Returns a reason when fallback should trigger. */
  observeError(): FallbackReason | null;
  reset(): void;
}

export function createFallbackTracker(
  thresholds: {
    lowConfidence?: number;
    poorFraming?: number;
    errors?: number;
  } = {}
): FallbackTracker {
  const lowMax = thresholds.lowConfidence ?? LIVE_AI_TRAINER_CONFIG.FALLBACK_CONSECUTIVE_LOW_CONFIDENCE;
  const framingMax = thresholds.poorFraming ?? LIVE_AI_TRAINER_CONFIG.FALLBACK_CONSECUTIVE_POOR_FRAMING;
  const errorMax = thresholds.errors ?? LIVE_AI_TRAINER_CONFIG.FALLBACK_CONSECUTIVE_ERRORS;

  let low = 0;
  let framing = 0;
  let errors = 0;

  return {
    observe(response) {
      errors = 0;
      low = response.confidenceCategory === 'low' ? low + 1 : 0;
      framing = response.framingQuality === 'poor' ? framing + 1 : 0;

      if (response.fallbackToManual) return 'model_requested';
      if (low >= lowMax) return 'low_confidence';
      if (framing >= framingMax) return 'poor_framing';
      return null;
    },
    observeError() {
      errors += 1;
      return errors >= errorMax ? 'errors' : null;
    },
    reset() {
      low = 0;
      framing = 0;
      errors = 0;
    },
  };
}

// ── Summary aggregation ──────────────────────────────────────────────────────

const CONFIDENCE_SCORE: Record<LiveAiTrainerResponse['confidenceCategory'], number> = {
  low: 0,
  medium: 1,
  high: 2,
};

export interface SummaryAggregator {
  recordResponse(response: LiveAiTrainerResponse, frameCount: number, viaUtterance: boolean): void;
  recordAutoRep(): void;
  markFallback(): void;
  build(): LiveAiTrainerSummary;
}

export function createSummaryAggregator(): SummaryAggregator {
  let interactions = 0;
  let evaluations = 0;
  let framingIssues = 0;
  let audio = false;
  let fallback = false;
  let autoReps = 0;
  let confidenceTotal = 0;
  let lastMessage: string | undefined;

  return {
    recordResponse(response, frameCount, viaUtterance) {
      interactions += 1;
      evaluations += frameCount;
      if (response.framingQuality === 'poor') framingIssues += 1;
      if (viaUtterance) audio = true;
      confidenceTotal += CONFIDENCE_SCORE[response.confidenceCategory];
      lastMessage = response.coachMessage;
    },
    recordAutoRep() {
      autoReps += 1;
    },
    markFallback() {
      fallback = true;
    },
    build() {
      const avg = interactions === 0 ? 1 : confidenceTotal / interactions;
      const averageConfidence: LiveAiTrainerSummary['averageConfidence'] =
        avg >= 1.5 ? 'high' : avg >= 0.75 ? 'medium' : 'low';
      return {
        used: interactions > 0,
        interactionCount: interactions,
        evaluationCount: evaluations,
        fallbackOccurred: fallback,
        averageConfidence,
        framingIssueCount: framingIssues,
        audioInteractionOccurred: audio,
        autoRepCount: autoReps,
        finalCoachMessage: lastMessage,
      };
    },
  };
}

// ── History window ───────────────────────────────────────────────────────────

export interface HistoryEntry {
  timestamp: number;
  observedBehavior: string;
  coachMessage: string;
}

export function pushHistory(
  history: HistoryEntry[],
  entry: HistoryEntry,
  max: number = LIVE_AI_TRAINER_CONFIG.HISTORY_WINDOW
): HistoryEntry[] {
  const next = [...history, entry];
  return next.length > max ? next.slice(next.length - max) : next;
}

// ── Human-friendly error copy ────────────────────────────────────────────────

export type LiveAiTrainerErrorKind = 'timeout' | 'network' | 'rate_limited' | 'unauthorized' | 'server' | 'capture';

export function describeError(kind: LiveAiTrainerErrorKind): string {
  switch (kind) {
    case 'timeout':
      return 'That took too long. I’ll try again in a moment.';
    case 'network':
      return 'Connection issue. Check your signal and I’ll keep trying.';
    case 'rate_limited':
      return 'Taking a short breather so I don’t overload. Keep training!';
    case 'unauthorized':
      return 'Your session expired. Please sign in again.';
    case 'server':
      return 'The coach hit a snag. Retrying shortly.';
    case 'capture':
      return 'I couldn’t grab a frame from the camera.';
  }
}
