// ─────────────────────────────────────────────────────────────────────────────
// Pose Event Detector
//
// Translates posture state transitions and feature signals into discrete pose
// events.  Events are emitted by the state machine and collected here to be
// passed up to consumers (session screen, AI coach, rep counter, etc.).
//
// Events are immutable value objects with a timestamp and optional metadata.
// This file also owns the event type definitions.
// ─────────────────────────────────────────────────────────────────────────────

import type { PostureLabel } from './postureClassifier.ts';
import type { TrackingQuality } from '../../types/pose.ts';

// ── Event types ───────────────────────────────────────────────────────────────

/** All possible pose events. */
export type PoseEventType =
  // ── Posture transitions ──────────────────────────────────────────────────
  | 'entered_sit'
  | 'broke_sit'
  | 'entered_down'
  | 'broke_down'
  | 'entered_stand'
  | 'broke_stand'
  // ── Hold events ──────────────────────────────────────────────────────────
  | 'held_posture'          // emitted periodically while holding a target posture
  // ── Unknown / ambiguous ──────────────────────────────────────────────────
  | 'posture_unknown'       // classifier became uncertain
  // ── Motion ───────────────────────────────────────────────────────────────
  | 'significant_motion'    // dog moved significantly while expected to be still
  // ── Tracking ─────────────────────────────────────────────────────────────
  | 'tracking_lost'
  | 'tracking_recovered';

/** Base event structure. All events carry at least these fields. */
export interface PoseEventBase {
  type:       PoseEventType;
  timestamp:  number;
}

/** Emitted when a posture is entered or broken. */
export interface PostureTransitionEvent extends PoseEventBase {
  type:       'entered_sit' | 'broke_sit' | 'entered_down' | 'broke_down' | 'entered_stand' | 'broke_stand';
  posture:    PostureLabel;
  confidence: number;
}

/** Emitted periodically while a posture is being held. */
export interface HeldPostureEvent extends PoseEventBase {
  type:          'held_posture';
  posture:       PostureLabel;
  holdDurationMs: number;
  confidence:    number;
}

/** Emitted when classifier becomes uncertain. */
export interface PostureUnknownEvent extends PoseEventBase {
  type:            'posture_unknown';
  previousPosture: PostureLabel | null;
}

/** Emitted when significant motion is detected. */
export interface SignificantMotionEvent extends PoseEventBase {
  type:        'significant_motion';
  motionScore: number;
}

/** Emitted when tracking is lost or recovered. */
export interface TrackingStatusEvent extends PoseEventBase {
  type:    'tracking_lost' | 'tracking_recovered';
  quality: TrackingQuality;
}

/** Discriminated union of all event shapes. */
export type PoseEvent =
  | PostureTransitionEvent
  | HeldPostureEvent
  | PostureUnknownEvent
  | SignificantMotionEvent
  | TrackingStatusEvent;

// ── Thresholds ─────────────────────────────────────────────────────────────

/** motionScore above this while in a hold posture triggers significant_motion. */
export const SIGNIFICANT_MOTION_THRESHOLD = 0.45;

/** Emit held_posture every N ms while maintaining a posture. */
export const HOLD_EMIT_INTERVAL_MS = 1000;

// ── Event factory helpers ─────────────────────────────────────────────────────

export function makeEnteredEvent(
  posture: Exclude<PostureLabel, 'unknown'>,
  confidence: number,
  timestamp: number
): PostureTransitionEvent {
  const type = `entered_${posture}` as PostureTransitionEvent['type'];
  return { type, posture, confidence, timestamp };
}

export function makeBrokeEvent(
  posture: Exclude<PostureLabel, 'unknown'>,
  confidence: number,
  timestamp: number
): PostureTransitionEvent {
  const type = `broke_${posture}` as PostureTransitionEvent['type'];
  return { type, posture, confidence, timestamp };
}

export function makeHeldEvent(
  posture: PostureLabel,
  holdDurationMs: number,
  confidence: number,
  timestamp: number
): HeldPostureEvent {
  return { type: 'held_posture', posture, holdDurationMs, confidence, timestamp };
}

export function makeUnknownEvent(
  previousPosture: PostureLabel | null,
  timestamp: number
): PostureUnknownEvent {
  return { type: 'posture_unknown', previousPosture, timestamp };
}

export function makeMotionEvent(motionScore: number, timestamp: number): SignificantMotionEvent {
  return { type: 'significant_motion', motionScore, timestamp };
}

export function makeTrackingLostEvent(quality: TrackingQuality, timestamp: number): TrackingStatusEvent {
  return { type: 'tracking_lost', quality, timestamp };
}

export function makeTrackingRecoveredEvent(quality: TrackingQuality, timestamp: number): TrackingStatusEvent {
  return { type: 'tracking_recovered', quality, timestamp };
}
