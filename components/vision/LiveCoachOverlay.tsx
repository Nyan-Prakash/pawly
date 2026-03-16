// ─────────────────────────────────────────────────────────────────────────────
// LiveCoachOverlay
//
// Full-screen camera view + coaching HUD for live pose coaching sessions.
//
// Layout:
//   ┌─────────────────────────────────────────────────────────┐
//   │  [← Exit]                    [Tracking quality badge]  │
//   │                                                         │
//   │           Camera preview + keypoint skeleton            │
//   │                                                         │
//   │  ┌─────────────────────────────────────────────────┐   │
//   │  │  Coaching message                               │   │
//   │  │  [Hold ring]   Rep count   Posture label        │   │
//   │  └─────────────────────────────────────────────────┘   │
//   └─────────────────────────────────────────────────────────┘
//
// All coaching states are handled inline:
//   initializing / no_dog / waiting / hold_in_progress /
//   good_rep / reset / lost_tracking / complete
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { DogKeypointOverlay } from '@/components/vision/DogKeypointOverlay';
import { TrackingQualityBadge } from '@/components/vision/TrackingQualityBadge';
import { TimerRing } from '@/components/session/TimerRing';

import type { CoachingDecision } from '@/lib/liveCoach/liveCoachingTypes';
import type { LiveCoachingSessionState } from '@/hooks/useLiveCoachingSession';
import type { PoseObservation, StabilizedPoseObservation, TrackingQuality } from '@/types/pose';

// ── Layout constants ──────────────────────────────────────────────────────────

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── Coaching state display config ─────────────────────────────────────────────

const STATE_CONFIG = {
  waiting:          { color: 'rgba(0,0,0,0.60)', bg: 'rgba(0,0,0,0.30)' },
  hold_in_progress: { color: '#22C55E',           bg: 'rgba(34,197,94,0.15)' },
  good_rep:         { color: '#22C55E',           bg: 'rgba(34,197,94,0.20)' },
  reset:            { color: '#F59E0B',           bg: 'rgba(245,158,11,0.18)' },
  lost_tracking:    { color: '#EF4444',           bg: 'rgba(239,68,68,0.18)' },
  complete:         { color: '#22C55E',           bg: 'rgba(34,197,94,0.20)' },
} as const;

// ── Props ─────────────────────────────────────────────────────────────────────

interface LiveCoachOverlayProps {
  // From useLiveCoachingSession
  coaching: LiveCoachingSessionState;
  /**
   * Stabilized observation for skeleton rendering.
   * Preferred over rawObservation — keypoints are smoothed and held on dropout.
   * Falls back to rawObservation when not yet available.
   */
  stabilizedObservation: StabilizedPoseObservation | null;
  /** Raw observation retained for cases where stabilization is not yet ready. */
  rawObservation: PoseObservation | null;
  // Tracking quality for badge (from stabilized obs — passed in by parent)
  trackingQuality: TrackingQuality | null;
  // Called when user taps Exit (mid-session abandon)
  onExit: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function LiveCoachOverlay({
  coaching,
  stabilizedObservation,
  rawObservation,
  trackingQuality,
  onExit,
}: LiveCoachOverlayProps) {
  const insets = useSafeAreaInsets();
  const { coachingDecision, cameraRef, frameProcessor, isModelLoaded, cameraError } = coaching;

  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  // Request permission on first mount if not yet granted
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  // ── Flash animation for good_rep / reset ────────────────────────────────────
  const flashAnim = useRef(new Animated.Value(0)).current;
  const prevState = useRef<string | null>(null);

  useEffect(() => {
    const state = coachingDecision?.state;
    if (!state) return;
    if (state !== prevState.current && (state === 'good_rep' || state === 'reset')) {
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }
    prevState.current = state;
  }, [coachingDecision?.state]);

  const state    = coachingDecision?.state ?? 'waiting';
  const stateCfg = STATE_CONFIG[state] ?? STATE_CONFIG.waiting;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* ── Camera preview ── */}
      {isModelLoaded && !cameraError && hasPermission && device ? (
        <Camera
          ref={cameraRef}
          style={{ flex: 1 }}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
        />
      ) : (
        <InitializingOverlay
          error={
            !hasPermission
              ? 'Camera permission required. Please allow access in Settings.'
              : !device
              ? 'No back camera found on this device.'
              : cameraError
          }
          isModelLoaded={isModelLoaded && hasPermission && !!device}
          insets={insets}
          onExit={onExit}
        />
      )}

      {/* ── Keypoint skeleton overlay — uses stabilized keypoints by default ── */}
      {(stabilizedObservation ?? rawObservation) && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: SCREEN_W,
            height: SCREEN_H,
            pointerEvents: 'none',
          }}
        >
          <DogKeypointOverlay
            observation={
              stabilizedObservation
                // StabilizedKeypoint is a structural superset of PoseKeypoint;
                // cast is safe — DogKeypointOverlay only reads name/x/y/score.
                ? (stabilizedObservation as unknown as PoseObservation)
                : rawObservation
            }
            containerWidth={SCREEN_W}
            containerHeight={SCREEN_H}
          />
        </View>
      )}

      {/* ── Flash feedback (good_rep = green, reset = amber) ── */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor:
            state === 'good_rep' ? 'rgba(34,197,94,0.18)' : 'rgba(245,158,11,0.18)',
          opacity: flashAnim,
        }}
      />

      {/* ── Top HUD row ── */}
      {isModelLoaded && (
        <View
          style={{
            position: 'absolute',
            top: insets.top + 8,
            left: 16,
            right: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Exit button */}
          <Pressable
            onPress={onExit}
            hitSlop={12}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'rgba(0,0,0,0.55)',
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 99,
              opacity: pressed ? 0.7 : 1,
              minHeight: 44,
            })}
          >
            <AppIcon name="close" size={16} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Exit</Text>
          </Pressable>

          {/* Tracking quality */}
          <TrackingQualityBadge quality={trackingQuality} />
        </View>
      )}

      {/* ── Bottom coaching HUD ── */}
      {isModelLoaded && (
        <BottomHUD
          decision={coachingDecision}
          insets={insets}
          stateCfg={stateCfg}
        />
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bottom HUD
// ─────────────────────────────────────────────────────────────────────────────

function BottomHUD({
  decision,
  insets,
  stateCfg,
}: {
  decision: CoachingDecision | null;
  insets: ReturnType<typeof useSafeAreaInsets>;
  stateCfg: { color: string; bg: string };
}) {
  const state      = decision?.state ?? 'waiting';
  const message    = decision?.message ?? 'Initializing…';
  const holdMs     = decision?.holdTimerMs ?? 0;
  const targetMs   = decision?.targetHoldMs ?? 1;
  const repCount   = decision?.completedReps ?? 0;
  const reqReps    = decision?.requiredReps ?? 1;
  const activePost = decision?.activePosture ?? 'unknown';
  const cue        = decision?.cue;

  // Normalised hold progress 0→1 (used as a "fill timer" — counts UP)
  const holdProgress = Math.min(holdMs / Math.max(targetMs, 1), 1);
  // We repurpose TimerRing (which counts down) by setting currentSeconds to
  // targetMs-holdMs so it fills clockwise as hold progresses.
  const holdRingCurrent  = Math.max(0, targetMs - holdMs);
  const holdRingTotal    = targetMs;

  const isHolding    = state === 'hold_in_progress';
  const isGoodRep    = state === 'good_rep';
  const isReset      = state === 'reset';
  const isLost       = state === 'lost_tracking';
  const isComplete   = state === 'complete';
  const isWaiting    = state === 'waiting';

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(10,15,25,0.82)',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: Math.max(insets.bottom, 16) + 8,
        gap: 16,
      }}
    >
      {/* Coaching message */}
      <View
        style={{
          backgroundColor: stateCfg.bg,
          borderRadius: 14,
          paddingVertical: 12,
          paddingHorizontal: 16,
          alignItems: 'center',
          gap: 4,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: isLost ? '#F87171' : isReset ? '#FBBF24' : (isGoodRep || isComplete) ? '#4ADE80' : '#fff',
            textAlign: 'center',
          }}
        >
          {message}
        </Text>
        {/* Optional secondary cue (feedback template) */}
        {cue && cue !== 'Stay' && (
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.70)', textAlign: 'center' }}>
            {cue}
          </Text>
        )}
      </View>

      {/* Stats row: hold ring | rep counter | posture */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        {/* Hold timer ring */}
        <View style={{ alignItems: 'center', gap: 4 }}>
          <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
            <TimerRing
              totalSeconds={holdRingTotal / 1000}
              currentSeconds={holdRingCurrent / 1000}
              size={76}
              color={isHolding ? '#22C55E' : isGoodRep ? '#4ADE80' : 'rgba(255,255,255,0.20)'}
              trackColor="rgba(255,255,255,0.12)"
            />
            <View
              style={{
                position: 'absolute',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>
                {isHolding || isGoodRep
                  ? `${(holdMs / 1000).toFixed(1)}s`
                  : '—'}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '600' }}>
            HOLD
          </Text>
        </View>

        {/* Rep counter */}
        <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
            <Text style={{ fontSize: 48, fontWeight: '800', color: isComplete ? '#4ADE80' : '#fff', lineHeight: 52 }}>
              {repCount}
            </Text>
            <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.50)', fontWeight: '600' }}>
              / {reqReps}
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '600' }}>
            REPS
          </Text>
        </View>

        {/* Posture label */}
        <View style={{ alignItems: 'center', gap: 4, minWidth: 64 }}>
          <View
            style={{
              backgroundColor:
                activePost === 'unknown'
                  ? 'rgba(255,255,255,0.10)'
                  : 'rgba(34,197,94,0.25)',
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 8,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: activePost === 'unknown' ? 'rgba(255,255,255,0.40)' : '#4ADE80',
                textTransform: 'capitalize',
              }}
            >
              {activePost === 'unknown' ? '?' : activePost}
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '600' }}>
            POSTURE
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Initializing / error placeholder (before model loads)
// ─────────────────────────────────────────────────────────────────────────────

function InitializingOverlay({
  error,
  isModelLoaded,
  insets,
  onExit,
}: {
  error: string | null;
  isModelLoaded: boolean;
  insets: ReturnType<typeof useSafeAreaInsets>;
  onExit: () => void;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0B1220',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        paddingHorizontal: 32,
      }}
    >
      {/* Exit */}
      <Pressable
        onPress={onExit}
        style={{
          position: 'absolute',
          top: insets.top + 8,
          left: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: 'rgba(255,255,255,0.10)',
          paddingHorizontal: 12,
          paddingVertical: 7,
          borderRadius: 99,
        }}
      >
        <AppIcon name="close" size={16} color="#fff" />
        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Exit</Text>
      </Pressable>

      {error ? (
        <>
          <AppIcon name="warning" size={48} color="#F87171" />
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', textAlign: 'center' }}>
            Camera unavailable
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', textAlign: 'center' }}>
            {error}
          </Text>
        </>
      ) : (
        <>
          <AppIcon name="paw" size={48} color="#4ADE80" />
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', textAlign: 'center' }}>
            Loading pose model…
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', textAlign: 'center' }}>
            This only takes a moment
          </Text>
        </>
      )}
    </View>
  );
}
