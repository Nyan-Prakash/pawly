// ─────────────────────────────────────────────────────────────────────────────
// Live AI Trainer Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sampling modes for the Live AI Trainer.
 * - idle: regular periodic check-in
 * - burst: active evaluation (e.g. user performing a rep)
 * - question: user asked a direct question
 */
export type SamplingMode = 'idle' | 'burst' | 'question';

/**
 * Multimodal packet sent from the client to the Supabase Edge Function.
 */
export interface LiveAiTrainerRequest {
  dogId: string;
  planId: string;
  sessionId: string;
  exerciseId: string;
  stepContext: {
    currentStepIndex: number;
    stepTitle: string;
    stepInstruction: string;
    repGoal?: number;
    currentReps: number;
  };
  samplingMode: SamplingMode;
  userUtterance?: string;
  /** Base64 encoded JPEG frames. Minimal set for context. */
  frames: string[];
  /** Rolling window of recent AI decisions (brief history). */
  history?: {
    timestamp: number;
    observedBehavior: string;
    coachMessage: string;
  }[];
}

/**
 * Structured response from the Live AI Trainer Edge Function.
 */
export interface LiveAiTrainerResponse {
  dogVisible: boolean;
  framingQuality: 'good' | 'partial' | 'poor';
  observedBehavior: 'sit' | 'down' | 'stand' | 'moving' | 'unclear';
  behaviorConfidence: number;
  repStatus: 'not_started' | 'in_progress' | 'completed' | 'failed' | 'unclear';
  holdStatus: 'not_applicable' | 'holding' | 'broke_early' | 'held_long_enough' | 'unclear';
  mainIssue: 'none' | 'breaking_early' | 'distracted' | 'aroused' | 'unclear_cue' | 'poor_framing' | 'unclear';
  /** Short natural coach message to show/speak. */
  coachMessage: string;
  shouldSpeak: boolean;
  suggestedUiAction: 'continue_live' | 'ask_reframe' | 'fallback_manual' | 'mark_success' | 'mark_failed' | 'wait';
  fallbackToManual: boolean;
  needsCameraAdjustment: boolean;
  latencyCategory: 'good' | 'slow';
  confidenceCategory: 'high' | 'medium' | 'low';
}

/**
 * Local UI state for the Live AI Trainer orchestration.
 */
export type LiveAiTrainerStatus =
  | 'idle'
  | 'listening'
  | 'sampling'
  | 'thinking'
  | 'speaking'
  | 'fallback';

/**
 * Summary persisted to session_logs for Live AI Trainer sessions.
 */
export interface LiveAiTrainerSummary {
  used: boolean;
  interactionCount: number;
  evaluationCount: number;
  fallbackOccurred: boolean;
  averageConfidence: 'high' | 'medium' | 'low';
  framingIssueCount: number;
  audioInteractionOccurred: boolean;
  finalCoachMessage?: string;
}

/**
 * Config/Thresholds for the Live AI Trainer.
 */
export const LIVE_AI_TRAINER_CONFIG = {
  SAMPLE_INTERVAL_IDLE: 2000,
  SAMPLE_INTERVAL_BURST: 500,
  BURST_FRAME_COUNT: 3,
  MAX_IMAGE_DIM: 640,
  JPEG_QUALITY: 0.6,
  MAX_REQUESTS_PER_MINUTE: 15,
  TIMEOUT_MS: 8000,
  FALLBACK_CONSECUTIVE_LOW_CONFIDENCE: 3,
  FALLBACK_CONSECUTIVE_POOR_FRAMING: 3,
};
