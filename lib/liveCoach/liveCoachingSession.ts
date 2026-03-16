// ─────────────────────────────────────────────────────────────────────────────
// Live Coaching Session
//
// Session-level wrapper around the coaching engine.
// Owns mutable engine state; exposes a clean per-frame API and read-only
// accessors so callers never touch internals directly.
//
// Typical usage (inside a React hook or plain TS):
//
//   const session = createCoachingSession(protocol, dogName);
//
//   // Each camera frame:
//   const decision = stepCoachingSession(session, frameInput);
//
//   // Read aggregate metrics at end of session:
//   const metrics = getCoachingMetrics(session);
//
// ─────────────────────────────────────────────────────────────────────────────

import type { LiveCoachingConfig } from '../../constants/protocols.ts';
import type { CoachingFrameInput, CoachingDecision, CoachingSessionMetrics, ResolvedCoachingConfig } from './liveCoachingTypes.ts';
import {
  resolveCoachingConfig,
} from './liveCoachingTypes.ts';
import {
  createCoachingEngine,
  resetCoachingEngine,
  stepCoachingEngine,
} from './liveCoachingEngine.ts';
import type { CoachingEngineInternalState } from './liveCoachingEngine.ts';

// ── Public session handle ─────────────────────────────────────────────────────

/**
 * Opaque session handle returned by createCoachingSession.
 * Consumers should treat this as a black box — use the provided functions
 * instead of accessing fields directly.
 */
export interface CoachingSession {
  /** Resolved config (read-only access for diagnostics). */
  readonly config: ResolvedCoachingConfig;
  /** Internal engine state — exposed for testing / debugging only. */
  readonly _engine: CoachingEngineInternalState;
}

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Create a new coaching session from a protocol's LiveCoachingConfig.
 *
 * @param liveCoachingConfig  The protocol's live_coaching_config field.
 *                            Caller must ensure this is non-null (i.e. the
 *                            protocol supports live pose coaching).
 * @param protocolRepCount    The protocol's repCount — used as the fallback
 *                            requiredRepCount when config doesn't override it.
 * @param dogName             Dog's name for feedback template rendering.
 * @param startMs             Wall-clock ms when the session starts.
 *                            Defaults to Date.now() if omitted.
 */
export function createCoachingSession(
  liveCoachingConfig: LiveCoachingConfig,
  protocolRepCount: number,
  dogName: string,
  startMs: number = Date.now()
): CoachingSession {
  const config = resolveCoachingConfig(liveCoachingConfig, protocolRepCount);
  const engine = createCoachingEngine(config, dogName, startMs);

  return {
    config,
    _engine: engine,
  };
}

// ── Per-frame step ────────────────────────────────────────────────────────────

/**
 * Feed one camera frame into the coaching session.
 * Returns an immutable CoachingDecision for this frame.
 * Mutates the session's internal engine state.
 *
 * @param session  The session handle returned by createCoachingSession.
 * @param input    Per-frame signals from the pose pipeline.
 */
export function stepCoachingSession(
  session: CoachingSession,
  input: CoachingFrameInput
): CoachingDecision {
  return stepCoachingEngine(session._engine, input);
}

// ── Accessors ─────────────────────────────────────────────────────────────────

/**
 * Returns a snapshot of the current session metrics.
 * Safe to call at any time — does not modify engine state.
 */
export function getCoachingMetrics(session: CoachingSession): CoachingSessionMetrics {
  return { ...session._engine.metrics };
}

/**
 * Returns the number of reps completed so far.
 */
export function getCompletedReps(session: CoachingSession): number {
  return session._engine.completedReps;
}

/**
 * Returns true if the coaching session has reached the complete state.
 */
export function isCoachingComplete(session: CoachingSession): boolean {
  return session._engine.engineState === 'complete';
}

// ── Reset ─────────────────────────────────────────────────────────────────────

/**
 * Reset the session engine back to the initial waiting state.
 * Useful if the user wants to retry the session without creating a new one.
 *
 * @param session  The session handle to reset.
 * @param nowMs    Current timestamp in ms. Defaults to Date.now().
 */
export function resetCoachingSession(
  session: CoachingSession,
  nowMs: number = Date.now()
): void {
  resetCoachingEngine(session._engine, nowMs);
}
