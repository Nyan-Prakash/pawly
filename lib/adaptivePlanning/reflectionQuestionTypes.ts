import type { ReflectionQuestionId } from '../../types/index.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Question config types
// ─────────────────────────────────────────────────────────────────────────────

export interface ReflectionAnswerOption {
  value: string;
  label: string;
}

/**
 * A single reflection question as rendered by the UI.
 * `single_select` renders a radio/chip list; `scale` renders a 1–N scale picker.
 */
export interface ReflectionQuestionConfig {
  id: ReflectionQuestionId;
  prompt: string;
  answerType: 'single_select' | 'scale';
  /** Present for single_select questions; absent for scale questions. */
  options?: ReflectionAnswerOption[];
  /** Present for scale questions. */
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  required: boolean;
  helperText?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Engine input types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compact representation of a single recent session used by the engine.
 * Keeps the engine decoupled from raw SessionLogInput rows.
 */
export interface RecentSessionSummary {
  /** Was the session completed or abandoned? */
  status: 'completed' | 'abandoned';
  /** Handler-rated difficulty. */
  difficulty: 'easy' | 'okay' | 'hard';
  /** 1–5 success score (lower = worse). */
  successScore: number;
  /** Environment context. Null when unknown. */
  environmentTag: string | null;
  /** Session kind, if available. */
  sessionKind: string | null;
  /** Skill or exercise identifier. */
  skillId: string | null;
}

/**
 * Compact learning-state snapshot consumed by the engine.
 * All scores on 1–5 scale matching DogLearningState.
 */
export interface ReflectionLearningStateSnapshot {
  distractionSensitivity: number;
  handlerConsistencyScore: number;
  confidenceScore: number;
  /** inconsistencyIndex from behaviorSignals (0–1). Null when unavailable. */
  inconsistencyIndex: number | null;
}

/**
 * Full input to the question-selection engine.
 */
export interface ReflectionQuestionEngineInput {
  // ── Current session ───────────────────────────────────────────────────────
  /** Handler-rated difficulty for the just-completed session. */
  difficulty: 'easy' | 'okay' | 'hard';
  /** Whether the session finished or was cut short. */
  sessionStatus: 'completed' | 'abandoned';
  /** How long the session ran in seconds. Null when not recorded. */
  durationSeconds: number | null;
  /** Protocol / skill / exercise identifier. Null when unavailable. */
  protocolId: string | null;
  skillId: string | null;
  /** Environment tag for the current session. Null when unknown. */
  environmentTag: string | null;

  // ── Recent history (last 3–5 sessions, newest first) ──────────────────────
  /** Up to 5 most recent sessions before this one. Empty array is valid. */
  recentSessions: RecentSessionSummary[];

  // ── Learning state (optional — safe to omit when unavailable) ─────────────
  learningState: ReflectionLearningStateSnapshot | null;
}
