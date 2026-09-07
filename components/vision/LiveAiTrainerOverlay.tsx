// ─────────────────────────────────────────────────────────────────────────────
// LiveAiTrainerOverlay
//
// Full-screen camera view with the coaching HUD layered on top.
// Owns: camera permission flow, no-device handling, error banner, speech
// toggle, fallback sheet.  All orchestration lives in useLiveAiTrainerSession.
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
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import type { LiveAiTrainerStatus, LiveAiTrainerResponse } from '@/lib/liveCoach/liveAiTrainerTypes';
import type { FallbackReason } from '@/lib/liveCoach/liveAiTrainerLogic';
import type { LiveAiTrainerError } from '@/hooks/useLiveAiTrainerSession';

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
  /** Increments whenever the AI auto-counts a rep; drives the "AI counted" pulse. */
  autoRepPulse: number;
  timerSeconds: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onIncrementRep: () => void;
}

const GREEN = '#4ADE80';
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

  // Ask for camera permission once on mount.
  useEffect(() => {
    if (hasPermission || permissionAsked) return;
    setPermissionAsked(true);
    void requestPermission();
  }, [hasPermission, permissionAsked, requestPermission]);

  // "AI counted a rep" pulse
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (autoRepPulse === 0) return;
    pulse.setValue(0);
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(pulse, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [autoRepPulse, pulse]);

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
        body="We couldn't find a back camera on this device. You can still run the session manually."
        primaryLabel="Train manually"
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

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={onExit}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Exit live trainer"
          hitSlop={8}
        >
          <AppIcon name="close" size={24} color="#fff" />
        </Pressable>

        <View style={styles.statusPill} accessibilityLiveRegion="polite">
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
          <Text style={styles.statusText}>{getStatusLabel(status)}</Text>
        </View>

        <View style={styles.topRight}>
          <Pressable
            onPress={onToggleSpeech}
            style={styles.iconButton}
            accessibilityRole="switch"
            accessibilityState={{ checked: speechEnabled }}
            accessibilityLabel={speechEnabled ? 'Mute coach voice' : 'Unmute coach voice'}
            hitSlop={8}
          >
            <AppIcon name={speechEnabled ? 'volume-high' : 'volume-mute'} size={20} color="#fff" />
          </Pressable>
          <Pressable
            onPress={onManualSwitch}
            style={styles.manualButton}
            accessibilityRole="button"
            accessibilityLabel="Switch to manual mode"
          >
            <Text style={styles.manualButtonText}>Manual</Text>
          </Pressable>
        </View>
      </View>

      {/* Step Instruction Card */}
      <View style={styles.stepCardContainer}>
        <BlurView intensity={70} tint="dark" style={styles.stepCardBlur}>
          <View style={styles.stepCounterRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>
                Step {step.stepNumber} of {step.totalSteps}
              </Text>
            </View>
          </View>
          <Text style={styles.instructionText}>{step.instruction}</Text>
          {!!step.successLook && (
            <View style={styles.successRow}>
              <AppIcon name="checkmark-circle" size={14} color={GREEN} />
              <Text style={styles.successText}>{step.successLook}</Text>
            </View>
          )}
        </BlurView>
      </View>

      {/* Rep Counter or Timer */}
      {(hasReps || hasTimer) && (
        <View style={styles.trackingContainer}>
          <BlurView intensity={65} tint="dark" style={styles.trackingBlur}>
            {hasReps && (
              <Pressable
                style={styles.repRow}
                onPress={onIncrementRep}
                disabled={repsHit}
                accessibilityRole="button"
                accessibilityLabel={`${repCount} of ${step.reps} reps. Tap to count a rep.`}
              >
                <View style={styles.repCountBlock}>
                  <Text style={[styles.repCount, repsHit && styles.repCountDone]}>{repCount}</Text>
                  <Text style={styles.repTarget}>/ {step.reps} reps</Text>
                </View>
                <View style={[styles.repTapHint, repsHit && styles.repTapHintDone]}>
                  <AppIcon name={repsHit ? 'checkmark' : 'add'} size={18} color={repsHit ? GREEN : '#fff'} />
                  <Text style={[styles.repTapText, repsHit && styles.repTapTextDone]}>
                    {repsHit ? 'Done!' : 'Tap to count'}
                  </Text>
                </View>
              </Pressable>
            )}

            {hasTimer && (
              <Pressable
                style={styles.timerRow}
                onPress={onToggleTimer}
                accessibilityRole="button"
                accessibilityLabel={`Timer ${formatTimer(timerSeconds)}. ${isTimerRunning ? 'Pause' : 'Start'}.`}
              >
                <Text style={[styles.timerText, timerDone && styles.timerTextDone]}>
                  {formatTimer(timerSeconds)}
                </Text>
                <View style={styles.timerControls}>
                  <AppIcon
                    name={isTimerRunning ? 'pause' : timerDone ? 'checkmark-circle' : 'play'}
                    size={22}
                    color={timerDone ? GREEN : '#fff'}
                  />
                  <Text style={[styles.timerLabel, timerDone && styles.timerLabelDone]}>
                    {isTimerRunning ? 'Running' : timerDone ? 'Done!' : 'Tap to start'}
                  </Text>
                </View>
              </Pressable>
            )}
          </BlurView>

          {/* AI auto-count pulse */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.autoRepBadge,
              { opacity: pulse, transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] },
            ]}
          >
            <AppIcon name="sparkles" size={14} color="#000" />
            <Text style={styles.autoRepText}>Coach counted that rep</Text>
          </Animated.View>
        </View>
      )}

      {/* Reframe hint */}
      {showReframeHint && (
        <View style={styles.reframeHint} pointerEvents="none">
          <AppIcon name="scan-outline" size={16} color="#FBBF24" />
          <Text style={styles.reframeText}>Move so {step.reps ? 'the whole dog' : 'your dog'} is in frame</Text>
        </View>
      )}

      {/* Coach Message */}
      {lastResponse?.coachMessage && status !== 'fallback' && (
        <View style={[styles.messageContainer, { bottom: insets.bottom + 120 }]} accessibilityLiveRegion="polite">
          <BlurView intensity={80} tint="dark" style={styles.messageBlur}>
            <AppIcon
              name={status === 'speaking' ? 'volume-high' : 'chatbubble'}
              size={14}
              color={status === 'speaking' ? colors.brand.primary : 'rgba(255,255,255,0.5)'}
            />
            <Text style={styles.messageText}>{lastResponse.coachMessage}</Text>
          </BlurView>
        </View>
      )}

      {/* Error banner */}
      {error && status !== 'fallback' && (
        <View style={[styles.errorBanner, { top: insets.top + 64 }]} accessibilityLiveRegion="assertive">
          <AppIcon name="alert-circle" size={14} color="#FCA5A5" />
          <Text style={styles.errorText}>{error.message}</Text>
        </View>
      )}

      {/* Bottom Controls */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.bottomControls, { bottom: insets.bottom + spacing.md }]}
      >
        {showInput ? (
          <View style={styles.inputRow}>
            <Input
              value={question}
              onChangeText={setQuestion}
              placeholder="Ask the coach…"
              style={{ flex: 1 }}
              inputStyle={styles.input}
              placeholderTextColor="rgba(255,255,255,0.5)"
              autoFocus
              returnKeyType="send"
              onSubmitEditing={submitQuestion}
              maxLength={200}
            />
            <Button label="Send" onPress={submitQuestion} size="sm" disabled={!question.trim()} />
            <Pressable
              onPress={() => {
                setShowInput(false);
                setQuestion('');
              }}
              style={styles.iconButtonSmall}
              accessibilityRole="button"
              accessibilityLabel="Cancel question"
            >
              <AppIcon name="close" size={18} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <ActionButton icon="chatbubble" label="Ask Coach" onPress={() => setShowInput(true)} disabled={isBusy} />
            <ActionButton icon="scan" label={isBusy ? 'Analyzing…' : 'Analyze'} onPress={onAnalyzeFrame} disabled={isBusy} busy={isBusy} />
            <ActionButton
              icon={isLastStep ? 'ribbon' : 'checkmark'}
              label={isLastStep ? 'Finish' : 'Step done'}
              onPress={onStepDone}
              emphasized
            />
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Fallback sheet */}
      {status === 'fallback' && (
        <View style={styles.fallbackOverlay}>
          <AppIcon name="eye-off-outline" size={40} color="#fff" />
          <Text style={styles.fallbackTitle}>I'm having trouble seeing clearly</Text>
          <Text style={styles.fallbackBody}>{fallbackCopy(fallbackReason)}</Text>
          <Button label="Switch to Manual" onPress={onManualSwitch} style={{ marginTop: spacing.lg, alignSelf: 'stretch' }} />
          <Button label="Keep trying" variant="ghost" onPress={onKeepTrying} style={{ marginTop: spacing.sm, alignSelf: 'stretch' }} />
        </View>
      )}
    </View>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

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
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionButton,
        emphasized && styles.stepDoneButton,
        (disabled || pressed) && { opacity: disabled ? 0.5 : 0.8 },
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, busy: !!busy }}
    >
      {busy ? <ActivityIndicator color="#fff" /> : <AppIcon name={icon} size={22} color="#fff" />}
      <Text style={styles.actionButtonText}>{label}</Text>
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
    <View style={[styles.container, styles.gate, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]}>
      <Pressable onPress={onExit} style={[styles.iconButton, { alignSelf: 'flex-start' }]} accessibilityRole="button" accessibilityLabel="Exit">
        <AppIcon name="close" size={24} color="#fff" />
      </Pressable>
      <View style={styles.gateBody}>
        <AppIcon name={icon} size={48} color="#fff" />
        <Text style={styles.fallbackTitle}>{title}</Text>
        <Text style={styles.fallbackBody}>{body}</Text>
        <Button label={primaryLabel} onPress={onPrimary} style={{ marginTop: spacing.lg, alignSelf: 'stretch' }} />
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
      return "I can't read what's happening confidently. A steadier angle usually fixes this.";
    case 'errors':
      return 'The connection keeps dropping. You can keep going manually and I’ll still save your session.';
    case 'model_requested':
    default:
      return 'Manual mode keeps everything else the same: steps, reps, timer, and your session record.';
  }
}

function getStatusColor(status: LiveAiTrainerStatus) {
  switch (status) {
    case 'idle': return colors.status.successBorder;
    case 'sampling':
    case 'thinking': return colors.status.warningBorder;
    case 'speaking': return colors.brand.primary;
    case 'listening': return colors.status.infoBorder;
    case 'paused': return '#9CA3AF';
    case 'fallback': return colors.status.dangerBorder;
    default: return '#ccc';
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

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  gate: { paddingHorizontal: spacing.lg },
  gateBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  manualButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minHeight: 32,
    justifyContent: 'center',
  },
  manualButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  stepCardContainer: { marginTop: spacing.md, marginHorizontal: spacing.lg, borderRadius: 20, overflow: 'hidden' },
  stepCardBlur: { padding: spacing.lg, gap: spacing.sm },
  stepCounterRow: { flexDirection: 'row', alignItems: 'center' },
  stepBadge: { backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
  stepBadgeText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  instructionText: { color: '#fff', fontSize: 16, fontWeight: '600', lineHeight: 23 },
  successRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 2 },
  successText: { color: GREEN, fontSize: 13, lineHeight: 19, flex: 1, fontWeight: '500' },

  trackingContainer: { marginTop: spacing.sm, marginHorizontal: spacing.lg, borderRadius: 16, overflow: 'visible' },
  trackingBlur: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: 16, overflow: 'hidden' },
  repRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  repCountBlock: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  repCount: { color: '#fff', fontSize: 32, fontWeight: '800', lineHeight: 38 },
  repCountDone: { color: GREEN },
  repTarget: { color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: '500' },
  repTapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  repTapHintDone: { backgroundColor: 'rgba(74,222,128,0.2)' },
  repTapText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  repTapTextDone: { color: GREEN },
  timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timerText: { color: '#fff', fontSize: 32, fontWeight: '800', lineHeight: 38 },
  timerTextDone: { color: GREEN },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  timerLabel: { color: '#fff', fontSize: 13, fontWeight: '600' },
  timerLabelDone: { color: GREEN },
  autoRepBadge: {
    position: 'absolute',
    right: spacing.md,
    top: -14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GREEN,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
  },
  autoRepText: { color: '#000', fontSize: 12, fontWeight: '700' },

  reframeHint: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  reframeText: { color: '#FBBF24', fontSize: 13, fontWeight: '600' },

  messageContainer: { position: 'absolute', left: spacing.lg, right: spacing.lg },
  messageBlur: {
    padding: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  messageText: { color: '#fff', fontSize: 15, fontWeight: '500', lineHeight: 22, flex: 1 },

  errorBanner: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(127,29,29,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  errorText: { color: '#FECACA', fontSize: 13, fontWeight: '600', flex: 1 },

  bottomControls: { position: 'absolute', left: 0, right: 0, paddingHorizontal: spacing.lg },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', gap: spacing.sm },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
    flex: 1,
    minHeight: 64,
  },
  stepDoneButton: {
    backgroundColor: 'rgba(34,197,94,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.5)',
  },
  actionButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: spacing.sm,
    borderRadius: 20,
  },
  input: { flex: 1, color: '#fff', backgroundColor: 'transparent', borderWidth: 0 },

  fallbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  fallbackTitle: { color: '#fff', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  fallbackBody: { color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 22, textAlign: 'center' },
});
