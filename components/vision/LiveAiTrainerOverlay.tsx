import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { BlurView } from 'expo-blur';

import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { LiveAiTrainerStatus, LiveAiTrainerResponse } from '@/lib/liveCoach/liveAiTrainerTypes';

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
  onExit: () => void;
  onAskCoach: (text: string) => void;
  onAnalyzeFrame: () => void;
  onManualSwitch: () => void;
  onStepDone: () => void;
  cameraRef: React.RefObject<Camera>;
  step: StepInfo;
  repCount: number;
  timerSeconds: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onIncrementRep: () => void;
}

export function LiveAiTrainerOverlay({
  status,
  lastResponse,
  onExit,
  onAskCoach,
  onAnalyzeFrame,
  onManualSwitch,
  onStepDone,
  cameraRef,
  step,
  repCount,
  timerSeconds,
  isTimerRunning,
  onToggleTimer,
  onIncrementRep,
}: LiveAiTrainerOverlayProps) {
  const device = useCameraDevice('back');
  const [question, setQuestion] = useState('');
  const [showInput, setShowInput] = useState(false);

  if (!device) return <View style={styles.container}><ActivityIndicator /></View>;

  const isLastStep = step.stepNumber === step.totalSteps;
  const hasReps = !!step.reps;
  const hasTimer = !!step.durationSeconds;
  const timerDone = hasTimer && timerSeconds === 0 && !isTimerRunning;
  const repsHit = hasReps && repCount >= (step.reps ?? 0);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={onExit} style={styles.iconButton}>
          <AppIcon name="close" size={24} color="#fff" />
        </Pressable>

        <View style={styles.statusPill}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
          <Text style={styles.statusText}>{getStatusLabel(status)}</Text>
        </View>

        <Pressable onPress={onManualSwitch} style={styles.manualButton}>
          <Text style={styles.manualButtonText}>Manual</Text>
        </Pressable>
      </View>

      {/* Step Instruction Card */}
      <View style={styles.stepCardContainer}>
        <BlurView intensity={70} tint="dark" style={styles.stepCardBlur}>
          {/* Step counter */}
          <View style={styles.stepCounterRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>
                Step {step.stepNumber} of {step.totalSteps}
              </Text>
            </View>
          </View>

          {/* Instruction */}
          <Text style={styles.instructionText}>{step.instruction}</Text>

          {/* Success look */}
          <View style={styles.successRow}>
            <AppIcon name="checkmark-circle" size={14} color="#4ADE80" />
            <Text style={styles.successText}>{step.successLook}</Text>
          </View>
        </BlurView>
      </View>

      {/* Rep Counter or Timer — shown when step has one */}
      {(hasReps || hasTimer) && (
        <View style={styles.trackingContainer}>
          <BlurView intensity={65} tint="dark" style={styles.trackingBlur}>
            {hasReps && (
              <Pressable style={styles.repRow} onPress={onIncrementRep}>
                <View style={styles.repCountBlock}>
                  <Text style={[styles.repCount, repsHit && styles.repCountDone]}>
                    {repCount}
                  </Text>
                  <Text style={styles.repTarget}>/ {step.reps} reps</Text>
                </View>
                <View style={[styles.repTapHint, repsHit && styles.repTapHintDone]}>
                  <AppIcon name={repsHit ? 'checkmark' : 'add'} size={18} color={repsHit ? '#4ADE80' : '#fff'} />
                  <Text style={[styles.repTapText, repsHit && styles.repTapTextDone]}>
                    {repsHit ? 'Done!' : 'Tap to count'}
                  </Text>
                </View>
              </Pressable>
            )}

            {hasTimer && (
              <Pressable style={styles.timerRow} onPress={onToggleTimer}>
                <Text style={[styles.timerText, timerDone && styles.timerTextDone]}>
                  {formatTimer(timerSeconds)}
                </Text>
                <View style={styles.timerControls}>
                  <AppIcon
                    name={isTimerRunning ? 'pause' : timerDone ? 'checkmark-circle' : 'play'}
                    size={22}
                    color={timerDone ? '#4ADE80' : '#fff'}
                  />
                  <Text style={[styles.timerLabel, timerDone && styles.timerLabelDone]}>
                    {isTimerRunning ? 'Running' : timerDone ? 'Done!' : 'Tap to start'}
                  </Text>
                </View>
              </Pressable>
            )}
          </BlurView>
        </View>
      )}

      {/* Coach Message Area */}
      {lastResponse?.coachMessage && (
        <View style={styles.messageContainer}>
          <BlurView intensity={80} tint="dark" style={styles.messageBlur}>
            <AppIcon name="chatbubble" size={14} color="rgba(255,255,255,0.5)" />
            <Text style={styles.messageText}>{lastResponse.coachMessage}</Text>
          </BlurView>
        </View>
      )}

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {showInput ? (
          <View style={styles.inputRow}>
            <Input
              value={question}
              onChangeText={setQuestion}
              placeholder="Ask the coach..."
              style={{ flex: 1 }}
              inputStyle={styles.input}
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
            <Button
              label="Send"
              onPress={() => {
                onAskCoach(question);
                setQuestion('');
                setShowInput(false);
              }}
              size="sm"
            />
          </View>
        ) : (
          <View style={styles.buttonRow}>
            {/* Ask Coach */}
            <Pressable style={styles.actionButton} onPress={() => setShowInput(true)}>
              <AppIcon name="chatbubble" size={22} color="#fff" />
              <Text style={styles.actionButtonText}>Ask Coach</Text>
            </Pressable>

            {/* Analyze */}
            <Pressable style={styles.actionButton} onPress={onAnalyzeFrame}>
              <AppIcon name="scan" size={22} color="#fff" />
              <Text style={styles.actionButtonText}>Analyze</Text>
            </Pressable>

            {/* Step Done */}
            <Pressable style={[styles.actionButton, styles.stepDoneButton]} onPress={onStepDone}>
              <AppIcon name={isLastStep ? 'ribbon' : 'checkmark'} size={22} color="#fff" />
              <Text style={styles.actionButtonText}>{isLastStep ? 'Finish' : 'Step done'}</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Fallback Warning */}
      {status === 'fallback' && (
        <View style={styles.fallbackOverlay}>
          <Text style={styles.fallbackText}>I'm having trouble seeing clearly.</Text>
          <Button label="Switch to Manual" onPress={onManualSwitch} style={{ marginTop: spacing.md }} />
        </View>
      )}
    </View>
  );
}

function getStatusColor(status: LiveAiTrainerStatus) {
  switch (status) {
    case 'idle': return colors.status.successBorder;
    case 'thinking': return colors.status.warningBorder;
    case 'speaking': return colors.brand.primary;
    case 'listening': return colors.status.infoBorder;
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
    case 'fallback': return 'Poor View';
    default: return status.toUpperCase();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  manualButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  manualButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // Step instruction card
  stepCardContainer: {
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
  },
  stepCardBlur: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  stepCounterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
  },
  stepBadgeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 23,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 2,
  },
  successText: {
    color: '#4ADE80',
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
    fontWeight: '500',
  },

  // Rep / timer tracking block
  trackingContainer: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  trackingBlur: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  repRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  repCountBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  repCount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
  repCountDone: {
    color: '#4ADE80',
  },
  repTarget: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    fontWeight: '500',
  },
  repTapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  repTapHintDone: {
    backgroundColor: 'rgba(74,222,128,0.2)',
  },
  repTapText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  repTapTextDone: {
    color: '#4ADE80',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
  timerTextDone: {
    color: '#4ADE80',
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  timerLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  timerLabelDone: {
    color: '#4ADE80',
  },

  // Coach message
  messageContainer: {
    position: 'absolute',
    bottom: 150,
    left: spacing.lg,
    right: spacing.lg,
  },
  messageBlur: {
    padding: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  messageText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    flex: 1,
  },

  // Bottom controls
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.sm,
  },
  actionButton: {
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
    flex: 1,
  },
  stepDoneButton: {
    backgroundColor: 'rgba(34,197,94,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.5)',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: spacing.sm,
    borderRadius: 20,
  },
  input: {
    flex: 1,
    color: '#fff',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },

  // Fallback
  fallbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  fallbackText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
});
