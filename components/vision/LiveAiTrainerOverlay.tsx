// ─────────────────────────────────────────────────────────────────────────────
// LiveAiTrainerOverlay
//
// Full-screen camera view with the coaching HUD layered on top.
// Owns: camera permission flow, no-device handling, error banner, speech
// toggle, fallback panel.  All orchestration lives in useLiveAiTrainerSession.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getThemeColors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { haptics } from '@/lib/haptics';
import { durations, useReducedMotion } from '@/lib/motion';
import type { LiveAiTrainerStatus, LiveAiTrainerResponse } from '@/lib/liveCoach/liveAiTrainerTypes';
import type { FallbackReason } from '@/lib/liveCoach/liveAiTrainerLogic';
import type { LiveAiTrainerError } from '@/hooks/useLiveAiTrainerSession';

/**
 * The overlay sits on a live camera feed, which is dark and busy regardless
 * of the user's colour scheme. It therefore always uses the DARK palette:
 * dark scrim panels with light text stay readable over any footage, and the
 * screen does not flip when the system theme changes mid-session.
 */
const dark = getThemeColors('dark');

interface StepInfo {
  instruction: string;
  successLook: string;
  stepNumber: number;
  totalSteps: number;
  reps: number | null;
  durationSeconds: number | null;
}

interface LiveAiTrainerOverlayProps {
  status: LiveAiTrainerStatus;
  lastResponse: LiveAiTrainerResponse | null;
  error: LiveAiTrainerError | null;
  fallbackReason: FallbackReason | null;
  speechEnabled: boolean;
  onToggleSpeech: () => void;
  onExit: () => void;
  onAskCoach: (text: string) => void;
  onAnalyzeFrame: () => void;
  onManualSwitch: () => void;
  onKeepTrying: () => void;
  onStepDone: () => void;
  cameraRef: React.RefObject<Camera>;
  step: StepInfo;
  repCount: number;
  /** Increments whenever the coach auto-counts a rep; drives the "coach counted" notice. */
  autoRepPulse: number;
  timerSeconds: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onIncrementRep: () => void;
}

const BUSY_STATES: LiveAiTrainerStatus[] = ['sampling', 'thinking', 'listening'];

export function LiveAiTrainerOverlay({
  status,
  lastResponse,
  error,
  fallbackReason,
  speechEnabled,
  onToggleSpeech,
  onExit,
  onAskCoach,
  onAnalyzeFrame,
  onManualSwitch,
  onKeepTrying,
  onStepDone,
  cameraRef,
  step,
  repCount,
  autoRepPulse,
  timerSeconds,
  isTimerRunning,
  onToggleTimer,
  onIncrementRep,
}: LiveAiTrainerOverlayProps) {
  const insets = useSafeAreaInsets();
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [permissionAsked, setPermissionAsked] = useState(false);
  const [question, setQuestion] = useState('');
  const [showInput, setShowInput] = useState(false);
  const reducedMotion = useReducedMotion();

  // Ask for camera permission once on mount.
  useEffect(() => {
    if (hasPermission || permissionAsked) return;
    setPermissionAsked(true);
    void requestPermission();
  }, [hasPermission, permissionAsked, requestPermission]);

  // "Coach counted a rep" notice: state-driven by autoRepPulse.
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (autoRepPulse === 0) return;
    if (reducedMotion) {
      pulse.setValue(1);
      const t = setTimeout(() => pulse.setValue(0), 1500);
      return () => clearTimeout(t);
    }
    pulse.setValue(0);
    const anim = Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: durations.fast, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(pulse, { toValue: 0, duration: durations.base, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [autoRepPulse, pulse, reducedMotion]);

  // ── Permission / device gates ─────────────────────────────────────────────

  if (!hasPermission) {
    return (
      <GateScreen
        insets={insets}
        icon="camera-outline"
        title="Camera access needed"
        body="Pawly uses your camera to watch the training and give live feedback. Frames are analyzed in real time and never stored."
        primaryLabel={permissionAsked ? 'Open Settings' : 'Allow camera'}
        onPrimary={() => (permissionAsked ? Linking.openSettings() : requestPermission())}
        secondaryLabel="Train manually instead"
        onSecondary={onManualSwitch}
        onExit={onExit}
      />
    );
  }

  if (!device) {
    return (
      <GateScreen
        insets={insets}
        icon="videocam-off-outline"
        title="No camera available"
        body="Couldn't find a back camera on this device. You can still run the session manually."
        primaryLabel="Train manually instead"
        onPrimary={onManualSwitch}
        onExit={onExit}
      />
    );
  }

  // ── Derived UI state ──────────────────────────────────────────────────────

  const isLastStep = step.stepNumber === step.totalSteps;
  const hasReps = !!step.reps;
  const hasTimer = !!step.durationSeconds;
  const timerDone = hasTimer && timerSeconds === 0 && !isTimerRunning;
  const repsHit = hasReps && repCount >= (step.reps ?? 0);
  const isBusy = BUSY_STATES.includes(status);
  const showReframeHint = lastResponse?.needsCameraAdjustment && status !== 'fallback';

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const submitQuestion = () => {
    const q = question.trim();
    if (!q) return;
    onAskCoach(q);
    setQuestion('');
    setShowInput(false);
  };

  const countRep = () => {
    haptics.selection();
    onIncrementRep();
  };

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={status !== 'paused'}
        photo={true}
        enableZoomGesture={true}
      />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <OverlayIconButton icon="close" label="Leave session" onPress={onExit} />

        <View style={styles.statusPanel} accessibilityLiveRegion="polite">
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
          <Text variant="label" color={dark.text.primary}>
            {getStatusLabel(status)}
          </Text>
        </View>

        <View style={styles.topRight}>
          <Pressable
            onPress={onToggleSpeech}
            style={styles.iconButton}
            accessibilityRole="switch"
            accessibilityState={{ checked: speechEnabled }}
            accessibilityLabel={speechEnabled ? 'Mute coach voice' : 'Unmute coach voice'}
            hitSlop={4}
          >
            <AppIcon name={speechEnabled ? 'volume-high' : 'volume-mute'} size={22} color={dark.text.primary} />
          </Pressable>
          <Pressable
            onPress={onManualSwitch}
            style={styles.manualButton}
            accessibilityRole="button"
            accessibilityLabel="Train manually instead"
          >
            <Text variant="captionStrong" color={dark.text.primary}>
              Manual
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Step instruction */}
      <View style={styles.stepPanel}>
        <Text variant="caption" color={dark.text.secondary}>
          Step {step.stepNumber} of {step.totalSteps}
        </Text>
        <Text variant="bodyStrong" color={dark.text.primary}>
          {step.instruction}
        </Text>
        {!!step.successLook && (
          <View style={styles.successRow}>
            <AppIcon name="checkmark-circle-outline" size={16} color={dark.accent} />
            <Text variant="caption" color={dark.text.secondary} style={{ flex: 1 }}>
              {step.successLook}
            </Text>
          </View>
        )}
      </View>

      {/* Rep counter or timer */}
      {(hasReps || hasTimer) && (
        <View style={styles.trackingContainer}>
          <View style={styles.trackingPanel}>
            {hasReps && (
              <Pressable
                style={styles.trackingRow}
                onPress={countRep}
                disabled={repsHit}
                accessibilityRole="button"
                accessibilityLabel={`${repCount} of ${step.reps} reps. Tap to count a rep.`}
              >
                <View style={styles.valueBlock}>
                  <Text variant="display" color={repsHit ? dark.accent : dark.text.primary}>
                    {repCount}
                  </Text>
                  <Text variant="caption" color={dark.text.secondary}>
                    of {step.reps} reps
                  </Text>
                </View>
                <View style={[styles.hintChip, repsHit && styles.hintChipDone]}>
                  <AppIcon name={repsHit ? 'checkmark' : 'add'} size={20} color={repsHit ? dark.accent : dark.text.primary} />
                  <Text variant="captionStrong" color={repsHit ? dark.accent : dark.text.primary}>
                    {repsHit ? 'Done' : 'Tap to count'}
                  </Text>
                </View>
              </Pressable>
            )}

            {hasTimer && (
              <Pressable
                style={styles.trackingRow}
                onPress={onToggleTimer}
                accessibilityRole="button"
                accessibilityLabel={`Timer ${formatTimer(timerSeconds)}. ${isTimerRunning ? 'Pause' : 'Start'}.`}
              >
                <Text variant="display" color={timerDone ? dark.accent : dark.text.primary}>
                  {formatTimer(timerSeconds)}
                </Text>
                <View style={[styles.hintChip, timerDone && styles.hintChipDone]}>
                  <AppIcon
                    name={isTimerRunning ? 'pause' : timerDone ? 'checkmark-circle' : 'play'}
                    size={20}
                    color={timerDone ? dark.accent : dark.text.primary}
                  />
                  <Text variant="captionStrong" color={timerDone ? dark.accent : dark.text.primary}>
                    {isTimerRunning ? 'Running' : timerDone ? 'Done' : 'Tap to start'}
                  </Text>
                </View>
              </Pressable>
            )}
          </View>

          {/* Coach auto-count notice */}
          <Animated.View
            pointerEvents="none"
            style={[styles.autoRepNotice, { opacity: pulse }]}
          >
            <AppIcon name="checkmark" size={16} color={dark.text.onAccent} />
            <Text variant="label" color={dark.text.onAccent}>
              The coach counted that rep
            </Text>
          </Animated.View>
        </View>
      )}

      {/* Reframe hint */}
      {showReframeHint && (
        <View style={styles.reframeHint} pointerEvents="none">
          <AppIcon name="scan-outline" size={16} color={dark.status.warning} />
          <Text variant="captionStrong" color={dark.status.warning}>
            Move so {step.reps ? 'the whole dog' : 'your dog'} is in frame
          </Text>
        </View>
      )}

      {/* Coach message */}
      {lastResponse?.coachMessage && status !== 'fallback' && (
        <View style={[styles.messagePanel, { bottom: insets.bottom + spacing.xxxl + spacing.xxxl + spacing.xl }]} accessibilityLiveRegion="polite">
          <AppIcon
            name={status === 'speaking' ? 'volume-high' : 'chatbubble-outline'}
            size={16}
            color={status === 'speaking' ? dark.accent : dark.text.secondary}
          />
          <Text variant="body" color={dark.text.primary} style={{ flex: 1 }}>
            {lastResponse.coachMessage}
          </Text>
        </View>
      )}

      {/* Error banner */}
      {error && status !== 'fallback' && (
        <View style={[styles.errorBanner, { top: insets.top + spacing.xxxl + spacing.lg }]} accessibilityLiveRegion="assertive">
          <AppIcon name="alert-circle" size={16} color={dark.status.danger} />
          <Text variant="captionStrong" color={dark.status.danger} style={{ flex: 1 }}>
            {error.message}
          </Text>
        </View>
      )}

      {/* Bottom controls */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.bottomControls, { bottom: insets.bottom + spacing.lg }]}
      >
        {showInput ? (
          <View style={styles.inputRow}>
            <Input
              value={question}
              onChangeText={setQuestion}
              placeholder="Ask the coach"
              style={{ flex: 1 }}
              autoFocus
              returnKeyType="send"
              onSubmitEditing={submitQuestion}
              maxLength={200}
              accessibilityLabel="Question for the coach"
            />
            <Button label="Send" size="md" onPress={submitQuestion} disabled={!question.trim()} />
            <OverlayIconButton
              icon="close"
              label="Cancel question"
              onPress={() => {
                setShowInput(false);
                setQuestion('');
              }}
            />
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <ActionButton icon="chatbubble-outline" label="Ask the coach" onPress={() => setShowInput(true)} disabled={isBusy} />
            <ActionButton icon="scan-outline" label={isBusy ? 'Analyzing' : 'Analyze'} onPress={onAnalyzeFrame} disabled={isBusy} busy={isBusy} />
            <ActionButton
              icon="checkmark"
              label={isLastStep ? 'Finish session' : 'Step done'}
              onPress={onStepDone}
              emphasized
            />
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Fallback panel */}
      {status === 'fallback' && (
        <View style={styles.fallbackOverlay}>
          <AppIcon name="eye-off-outline" size={40} color={dark.text.primary} />
          <Text variant="h1" color={dark.text.primary}>
            The coach can't see clearly
          </Text>
          <Text variant="body" color={dark.text.secondary}>
            {fallbackCopy(fallbackReason)}
          </Text>
          <Button label="Train manually instead" onPress={onManualSwitch} style={{ marginTop: spacing.xl, alignSelf: 'stretch' }} />
          <Button label="Keep trying" variant="ghost" onPress={onKeepTrying} style={{ marginTop: spacing.sm, alignSelf: 'stretch' }} />
        </View>
      )}
    </View>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function OverlayIconButton({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof AppIcon>['name'];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
    >
      <AppIcon name={icon} size={22} color={dark.text.primary} />
    </Pressable>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  disabled,
  busy,
  emphasized,
}: {
  icon: React.ComponentProps<typeof AppIcon>['name'];
  label: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
  emphasized?: boolean;
}) {
  const color = emphasized ? dark.text.onAccent : dark.text.primary;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionButton,
        emphasized && styles.actionButtonEmphasized,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, busy: !!busy }}
    >
      {busy ? <ActivityIndicator color={color} /> : <AppIcon name={icon} size={22} color={color} />}
      <Text variant="label" color={color}>
        {label}
      </Text>
    </Pressable>
  );
}

function GateScreen({
  insets,
  icon,
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  onExit,
}: {
  insets: { top: number; bottom: number };
  icon: React.ComponentProps<typeof AppIcon>['name'];
  title: string;
  body: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  onExit: () => void;
}) {
  return (
    <View style={[styles.container, styles.gate, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.lg }]}>
      <OverlayIconButton icon="close" label="Leave session" onPress={onExit} />
      <View style={styles.gateBody}>
        <AppIcon name={icon} size={40} color={dark.text.primary} />
        <Text variant="h1" color={dark.text.primary}>
          {title}
        </Text>
        <Text variant="body" color={dark.text.secondary}>
          {body}
        </Text>
        <Button label={primaryLabel} onPress={onPrimary} style={{ marginTop: spacing.xl, alignSelf: 'stretch' }} />
        {secondaryLabel && onSecondary && (
          <Button label={secondaryLabel} variant="ghost" onPress={onSecondary} style={{ marginTop: spacing.sm, alignSelf: 'stretch' }} />
        )}
      </View>
    </View>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fallbackCopy(reason: FallbackReason | null): string {
  switch (reason) {
    case 'poor_framing':
      return 'Your dog keeps slipping out of frame. Try more light, or prop the phone so the whole dog is visible.';
    case 'low_confidence':
      return "The coach can't read what's happening confidently. A steadier angle usually fixes this.";
    case 'errors':
      return 'The connection keeps dropping. You can keep going manually and the session is still saved.';
    case 'model_requested':
    default:
      return 'Manual mode keeps everything else the same: steps, reps, timer, and your session record.';
  }
}

function getStatusColor(status: LiveAiTrainerStatus) {
  switch (status) {
    case 'idle':
    case 'speaking':
      return dark.accent;
    case 'sampling':
    case 'thinking':
      return dark.status.warning;
    case 'listening':
      return dark.text.primary;
    case 'fallback':
      return dark.status.danger;
    case 'paused':
    default:
      return dark.text.secondary;
  }
}

function getStatusLabel(status: LiveAiTrainerStatus) {
  switch (status) {
    case 'idle': return 'Watching';
    case 'thinking': return 'Analyzing';
    case 'speaking': return 'Coaching';
    case 'listening': return 'Listening';
    case 'sampling': return 'Capturing';
    case 'paused': return 'Paused';
    case 'fallback': return 'Poor view';
    default: return status;
  }
}

// ── Styles (dark palette only; see note at the top of the file) ──────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: dark.bg.app },
  gate: { paddingHorizontal: spacing.lg },
  gateBody: { flex: 1, justifyContent: 'center', gap: spacing.lg },
  pressed: { opacity: 0.6 },
  disabled: { opacity: 0.4 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: dark.scrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: dark.scrim,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    borderRadius: radii.full,
    gap: spacing.sm,
  },
  statusDot: { width: 8, height: 8, borderRadius: radii.full },
  manualButton: {
    backgroundColor: dark.scrim,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
  },

  stepPanel: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: dark.scrim,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  successRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, marginTop: spacing.xs },

  trackingContainer: { marginTop: spacing.sm, marginHorizontal: spacing.lg },
  trackingPanel: {
    backgroundColor: dark.scrim,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  trackingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  valueBlock: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  hintChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: dark.bg.fill,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    borderRadius: radii.sm,
  },
  hintChipDone: { backgroundColor: dark.accentSoft },
  autoRepNotice: {
    position: 'absolute',
    right: spacing.lg,
    top: -spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: dark.accent,
    paddingHorizontal: spacing.sm,
    height: 24,
    borderRadius: radii.sm,
  },

  reframeHint: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: dark.scrim,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    borderRadius: radii.sm,
    alignSelf: 'flex-start',
  },

  messagePanel: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: dark.scrim,
    padding: spacing.lg,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },

  errorBanner: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: dark.scrim,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },

  bottomControls: { position: 'absolute', left: 0, right: 0, paddingHorizontal: spacing.lg },
  buttonRow: { flexDirection: 'row', gap: spacing.sm },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: dark.scrim,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    flex: 1,
    minHeight: 64,
  },
  actionButtonEmphasized: { backgroundColor: dark.accent },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: dark.scrim,
    padding: spacing.sm,
    borderRadius: radii.md,
  },

  fallbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: dark.bg.app,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
});
