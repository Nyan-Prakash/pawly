import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  type AppStateStatus,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
  Vibration,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { TimerRing } from '@/components/session/TimerRing';
import { RepCounter } from '@/components/session/RepCounter';
import { StepCard } from '@/components/session/StepCard';
import { SessionModePicker } from '@/components/session/SessionModePicker';
import { LiveCoachOverlay } from '@/components/vision/LiveCoachOverlay';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useSessionStore } from '@/stores/sessionStore';
import { usePlanStore } from '@/stores/planStore';
import { useDogStore } from '@/stores/dogStore';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { saveSession, checkMilestones, updateStreak } from '@/lib/sessionManager';
import type { LiveCoachingSummary, PoseMetrics } from '@/lib/sessionManager';
import { EXERCISE_TO_PROTOCOL } from '@/constants/protocols';
import { didUpcomingScheduleChange } from '@/lib/notifications';
import { useLiveCoachingSession } from '@/hooks/useLiveCoachingSession';
import type { CoachingSessionMetrics } from '@/lib/liveCoach/liveCoachingTypes';

// ── Local UI state for live coaching (does not touch session store) ──────────
// These two extra states sit on top of the store's SessionState and are
// managed with a separate local useState to avoid any regression.
type LocalOverlayState = 'NONE' | 'MODE_PICKER' | 'LIVE_COACHING';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} sec`;
  return `${m} min ${s > 0 ? `${s} sec` : ''}`.trim();
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Setup checklist items derived from equipment
// ─────────────────────────────────────────────────────────────────────────────

const BASE_CHECKLIST = [
  'Find a low-distraction space',
  'Have high-value treats ready',
];

function buildChecklist(equipment: string[]): string[] {
  const items = [...BASE_CHECKLIST];
  if (equipment.some((e) => e.toLowerCase().includes('leash'))) {
    items.push('Leash attached');
  }
  if (equipment.some((e) => e.toLowerCase().includes('clicker'))) {
    items.push('Clicker in hand');
  }
  if (equipment.some((e) => e.toLowerCase().includes('mat') || e.toLowerCase().includes('bed'))) {
    items.push('Mat or bed in place');
  }
  return items;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function SessionScreen() {
  const { id: sessionId } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const { activePlan, fetchProtocol, markSessionComplete, refreshPlan } = usePlanStore();
  const { dog, fetchDogLearningState } = useDogStore();
  const { user } = useAuthStore();
  const ensureNotificationPermission = useNotificationStore((s) => s.ensurePermissionAfterMeaningfulAction);
  const refreshNotificationSchedules = useNotificationStore((s) => s.refreshSchedules);
  const {
    activeSession,
    startSession,
    setState,
    completeStep,
    startTimer,
    pauseTimer,
    resetTimer,
    incrementRep,
    resetReps,
    advanceToNextStep,
    submitSession,
    abandonSession,
    tick,
    clearSession,
  } = useSessionStore();

  const [showAbandonSheet, setShowAbandonSheet] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [reviewDifficulty, setReviewDifficulty] = useState<'easy' | 'okay' | 'hard' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [completedSessionCount, setCompletedSessionCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Live coaching local overlay state ──────────────────────────────────────
  // Kept local so normal session flow (store state machine) is never touched.
  const [overlayState, setOverlayState] = useState<LocalOverlayState>('NONE');
  // Metrics captured when live coaching completes; passed to saveSession.
  const liveMetricsRef = useRef<CoachingSessionMetrics | null>(null);

  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const backgroundTimeRef = useRef<number | null>(null);
  const stepStartTimeRef = useRef<number>(Date.now());
  const startedSessionIdRef = useRef<string | null>(null);

  // ── Load protocol & start session ──────────────────────────────────────────

  useEffect(() => {
    if (!sessionId) return;
    if (activeSession?.sessionId === sessionId || startedSessionIdRef.current === sessionId) return;
    if (!activePlan) return;

    const planSession = activePlan.sessions.find((s) => s.id === sessionId);
    if (!planSession) {
      setLoadError('This session was not found in your active plan.');
      return;
    }

    let isCancelled = false;
    setLoadError(null);

    fetchProtocol(planSession.exerciseId).then((protocol) => {
      if (isCancelled) return;
      if (!protocol) {
        setLoadError('We could not load this session protocol.');
        return;
      }
      startedSessionIdRef.current = sessionId;
      startSession(sessionId, planSession.exerciseId, protocol);
    });

    const completedCount = activePlan.sessions.filter((s) => s.isCompleted).length;
    setCompletedSessionCount(completedCount + 1); // +1 for this session

    return () => {
      isCancelled = true;
    };
  }, [sessionId, activePlan, activeSession?.sessionId, fetchProtocol, startSession, clearSession]);

  useEffect(() => {
    return () => {
      startedSessionIdRef.current = null;
      clearSession();
    };
  }, [clearSession]);

  // ── Tick interval ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (activeSession?.isTimerRunning) {
      tickIntervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    }
    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    };
  }, [activeSession?.isTimerRunning]);

  // ── Timer reaches zero ─────────────────────────────────────────────────────

  useEffect(() => {
    if (
      activeSession?.state === 'STEP_ACTIVE' &&
      activeSession.timerSeconds === 0 &&
      !activeSession.isTimerRunning
    ) {
      const step = activeSession.protocol.steps[activeSession.currentStepIndex];
      if (step?.durationSeconds && step.durationSeconds > 0) {
        Vibration.vibrate([0, 100, 50, 100]);
      }
    }
  }, [activeSession?.timerSeconds, activeSession?.isTimerRunning]);

  // ── AppState — track background time for timer ─────────────────────────────

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'background') {
        backgroundTimeRef.current = Date.now();
      } else if (nextState === 'active' && backgroundTimeRef.current !== null) {
        const elapsed = Math.floor((Date.now() - backgroundTimeRef.current) / 1000);
        backgroundTimeRef.current = null;

        if (activeSession?.isTimerRunning) {
          const remaining = Math.max(0, (activeSession.timerSeconds ?? 0) - elapsed);
          resetTimer(remaining);
          if (remaining > 0) startTimer();
        }
      }
    });
    return () => sub.remove();
  }, [activeSession?.isTimerRunning, activeSession?.timerSeconds]);

  // ── Step active: auto-start timer and track step start time ───────────────

  useEffect(() => {
    if (activeSession?.state === 'STEP_ACTIVE') {
      stepStartTimeRef.current = Date.now();
      const step = activeSession.protocol.steps[activeSession.currentStepIndex];
      if (step?.durationSeconds) {
        startTimer();
      }
    }
  }, [activeSession?.currentStepIndex, activeSession?.state]);

  // ─────────────────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────────────────

  const handleStepDone = useCallback(() => {
    if (!activeSession) return;
    const step = activeSession.protocol.steps[activeSession.currentStepIndex];
    const durationSeconds = Math.floor((Date.now() - stepStartTimeRef.current) / 1000);

    Vibration.vibrate([0, 60, 40, 120]);

    completeStep({
      stepOrder: step.order,
      completed: true,
      durationSeconds,
      repCount: activeSession.repCount,
    });
    setState('STEP_COMPLETE');
  }, [activeSession]);

  const handleNextStep = useCallback(() => {
    advanceToNextStep();
  }, [advanceToNextStep]);

  const handleSubmitSession = useCallback(async () => {
    if (!reviewDifficulty || !activeSession || !user || !dog || !activePlan) return;
    setIsSaving(true);

    try {
      await submitSession(reviewDifficulty, reviewNotes, async (sid, durationSeconds) => {
        // Mark session complete in plan store
        await markSessionComplete(sid, {
          sessionId: sid,
          rating: reviewDifficulty === 'easy' ? 5 : reviewDifficulty === 'okay' ? 3 : 1,
          completedAt: new Date().toISOString(),
          notes: reviewNotes || undefined,
        });

        const planSession = activePlan.sessions.find((session) => session.id === sid);
        const protocolId = EXERCISE_TO_PROTOCOL[activeSession.exerciseId] ?? activeSession.exerciseId;
        const liveMetrics = liveMetricsRef.current;
        await saveSession({
          userId: user.id,
          dogId: dog.id,
          planId: activePlan.id,
          sessionId: sid,
          exerciseId: activeSession.exerciseId,
          protocolId,
          durationSeconds,
          difficulty: reviewDifficulty,
          notes: reviewNotes,
          completedAt: new Date().toISOString(),
          successScore: reviewDifficulty === 'easy' ? 5 : reviewDifficulty === 'okay' ? 3 : 2,
          stepResults: activeSession.stepResults,
          sessionStatus: 'completed',
          skillId: planSession?.skillId ?? null,
          sessionKind: planSession?.sessionKind ?? null,
          environmentTag: planSession?.environment ?? null,
          // Live coaching fields — only populated when camera mode was used
          liveCoachingUsed: liveMetrics !== null,
          liveCoachingSummary: liveMetrics
            ? ((): LiveCoachingSummary => {
                const totalFrames =
                  liveMetrics.trackingQualityBreakdown.good +
                  liveMetrics.trackingQualityBreakdown.fair +
                  liveMetrics.trackingQualityBreakdown.poor;
                const avgTrackingQuality = totalFrames > 0
                  ? (liveMetrics.trackingQualityBreakdown.good * 1.0 +
                     liveMetrics.trackingQualityBreakdown.fair * 0.5) / totalFrames
                  : 0;
                const sessionAssessment: LiveCoachingSummary['sessionAssessment'] =
                  liveMetrics.repCountDetected >= (protocol.liveCoachingConfig?.requiredRepCount ?? protocol.repCount)
                    ? 'completed'
                    : liveMetrics.repCountDetected > 0
                    ? 'partial'
                    : 'abandoned';
                return {
                  coachingMode:           protocol.liveCoachingConfig?.mode ?? 'stationary_hold',
                  protocolId,
                  targetPostures:         (protocol.liveCoachingConfig?.targetPostures ?? []) as LiveCoachingSummary['targetPostures'],
                  successCount:           liveMetrics.repCountDetected,
                  resetCount:             liveMetrics.resetCount,
                  averageTrackingQuality: Math.round(avgTrackingQuality * 100) / 100,
                  sessionAssessment,
                };
              })()
            : undefined,
          poseMetrics: liveMetrics
            ? ((): PoseMetrics => {
                const totalFrames =
                  liveMetrics.trackingQualityBreakdown.good +
                  liveMetrics.trackingQualityBreakdown.fair +
                  liveMetrics.trackingQualityBreakdown.poor;
                // Approximate average confidence from quality breakdown
                const avgConfidence = totalFrames > 0
                  ? (liveMetrics.trackingQualityBreakdown.good * 0.80 +
                     liveMetrics.trackingQualityBreakdown.fair * 0.55 +
                     liveMetrics.trackingQualityBreakdown.poor * 0.20) / totalFrames
                  : 0;
                return {
                  averageTrackingConfidence: Math.round(avgConfidence * 100) / 100,
                  trackingQualityBreakdown:  liveMetrics.trackingQualityBreakdown,
                  postureDurations:          liveMetrics.postureDurations,
                  holdDurations:             liveMetrics.holdDurations,
                  repCountDetected:          liveMetrics.repCountDetected,
                  lostTrackingEvents:        liveMetrics.lostTrackingEvents,
                  significantMotionEvents:   liveMetrics.significantMotionEvents,
                };
              })()
            : undefined,
        });

        // Update streak (non-blocking)
        updateStreak(user.id, dog.id).catch(() => {});

        // Check milestones (non-blocking)
        checkMilestones(user.id, dog.id, {
          sessionId: sid,
          dogId: dog.id,
          planId: activePlan.id,
        }).catch(() => {});

        const planBeforeRefresh = usePlanStore.getState().activePlan;
        await refreshPlan().catch(() => {});
        ensureNotificationPermission().catch(() => {});
        const latestPlan = usePlanStore.getState().activePlan;
        if (dog && latestPlan && didUpcomingScheduleChange(planBeforeRefresh, latestPlan)) {
          refreshNotificationSchedules(dog, latestPlan).catch(() => {});
        }
        fetchDogLearningState(dog.id).catch(() => {});
      });
    } finally {
      setIsSaving(false);
    }
  }, [reviewDifficulty, reviewNotes, activeSession, user, dog, activePlan, fetchDogLearningState, refreshPlan]);

  const handleAbandonConfirm = useCallback(async () => {
    if (activeSession && user && dog && activePlan) {
      const planSession = activePlan.sessions.find((session) => session.id === activeSession.sessionId);
      const protocolId = EXERCISE_TO_PROTOCOL[activeSession.exerciseId] ?? activeSession.exerciseId;
      const durationSeconds = Math.floor(
        (Date.now() - activeSession.startedAt.getTime()) / 1000
      );

      await saveSession({
        userId: user.id,
        dogId: dog.id,
        planId: activePlan.id,
        sessionId: activeSession.sessionId,
        exerciseId: activeSession.exerciseId,
        protocolId,
        durationSeconds,
        difficulty: 'hard',
        notes: reviewNotes,
        completedAt: new Date().toISOString(),
        successScore: 1,
        stepResults: activeSession.stepResults,
        sessionStatus: 'abandoned',
        skillId: planSession?.skillId ?? null,
        sessionKind: planSession?.sessionKind ?? null,
        environmentTag: planSession?.environment ?? null,
      }).catch(() => {});
      fetchDogLearningState(dog.id).catch(() => {});
    }

    abandonSession();
    setShowAbandonSheet(false);
    clearSession();
    router.back();
  }, [activeSession, activePlan, user, dog, reviewNotes, abandonSession, clearSession, fetchDogLearningState]);

  // ── Setup → mode decision ──────────────────────────────────────────────────
  // After the setup checklist, if the protocol supports live coaching and no
  // overlay is active yet, show the mode picker instead of jumping straight to
  // STEP_ACTIVE.  We keep the store state at 'SETUP' while the picker is shown.
  const handleSetupStart = useCallback(() => {
    if (activeSession?.protocol.supportsLivePoseCoaching && activeSession?.protocol.liveCoachingConfig) {
      setOverlayState('MODE_PICKER');
    } else {
      setState('STEP_ACTIVE');
    }
  }, [activeSession?.protocol, setState]);

  // ─────────────────────────────────────────────────────────────────────────
  // Back press guard
  // ─────────────────────────────────────────────────────────────────────────

  const handleBackPress = () => {
    if (activeSession?.state === 'COMPLETE') {
      clearSession();
      router.back();
      return;
    }
    setShowAbandonSheet(true);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render states
  // ─────────────────────────────────────────────────────────────────────────

  if (!activeSession || activeSession.state === 'LOADING') {
    return <LoadingView insets={insets} error={loadError} onBack={() => router.back()} />;
  }

  const { state, protocol, currentStepIndex } = activeSession;
  const currentStep = protocol.steps[currentStepIndex];
  const totalSteps = protocol.steps.length;
  const dogName = dog?.name ?? 'your dog';

  // ── Live coaching screen renders as a full-screen replacement ────────────
  // While MODE_PICKER or LIVE_COACHING is active we return early so the normal
  // session JSX is never mounted.  This avoids any stacking / display issues.

  if (overlayState === 'MODE_PICKER') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style="dark" />
        <SessionModePicker
          dogName={dogName}
          onNormal={() => {
            setOverlayState('NONE');
            setState('STEP_ACTIVE');
          }}
          onCamera={() => {
            setOverlayState('LIVE_COACHING');
          }}
        />
      </View>
    );
  }

  if (overlayState === 'LIVE_COACHING' && protocol.liveCoachingConfig) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <StatusBar style="light" />
        <LiveCoachingScreen
          protocol={protocol}
          dogName={dogName}
          onComplete={(metrics: CoachingSessionMetrics) => {
            liveMetricsRef.current = metrics;
            setOverlayState('NONE');
            setState('SESSION_REVIEW');
          }}
          onExit={() => {
            setOverlayState('NONE');
            setShowAbandonSheet(true);
          }}
        />
        {/* Abandon sheet is accessible from live coaching too */}
        <AbandonSheet
          visible={showAbandonSheet}
          onKeepGoing={() => setShowAbandonSheet(false)}
          onLeave={handleAbandonConfirm}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />

      {/* ── INTRO ── */}
      {state === 'INTRO' && (
        <IntroView
          protocol={protocol}
          dogName={dogName}
          insets={insets}
          onBack={handleBackPress}
          onReady={() => setState('SETUP')}
        />
      )}

      {/* ── SETUP ── */}
      {state === 'SETUP' && (
        <SetupView
          protocol={protocol}
          checkedItems={checkedItems}
          onToggle={(i) => {
            setCheckedItems((prev) => {
              const next = new Set(prev);
              next.has(i) ? next.delete(i) : next.add(i);
              return next;
            });
          }}
          insets={insets}
          onBack={handleBackPress}
          onStart={handleSetupStart}
        />
      )}

      {/* ── STEP_ACTIVE ── */}
      {state === 'STEP_ACTIVE' && currentStep && (
        <StepActiveView
          step={currentStep}
          stepNumber={currentStepIndex + 1}
          totalSteps={totalSteps}
          protocol={protocol}
          activeSession={activeSession}
          onBack={handleBackPress}
          onToggleTimer={() => {
            activeSession.isTimerRunning ? pauseTimer() : startTimer();
          }}
          onResetTimer={() => {
            const step = protocol.steps[activeSession.currentStepIndex];
            if (step?.durationSeconds) resetTimer(step.durationSeconds);
          }}
          onIncrementRep={incrementRep}
          onResetReps={resetReps}
          onStepDone={handleStepDone}
          insets={insets}
        />
      )}

      {/* ── STEP_COMPLETE ── */}
      {state === 'STEP_COMPLETE' && (
        <StepCompleteView
          stepNumber={currentStepIndex + 1}
          totalSteps={totalSteps}
          currentStep={currentStep}
          nextStep={protocol.steps[currentStepIndex + 1]}
          onNext={handleNextStep}
          insets={insets}
        />
      )}

      {/* ── SESSION_REVIEW ── */}
      {state === 'SESSION_REVIEW' && (
        <SessionReviewView
          activeSession={activeSession}
          dogName={dogName}
          reviewDifficulty={reviewDifficulty}
          reviewNotes={reviewNotes}
          isSaving={isSaving}
          onSelectDifficulty={setReviewDifficulty}
          onNotesChange={setReviewNotes}
          onSave={handleSubmitSession}
          insets={insets}
        />
      )}

      {/* ── COMPLETE ── */}
      {state === 'COMPLETE' && (
        <CompleteView
          dogName={dogName}
          protocol={protocol}
          completedSessionCount={completedSessionCount}
          totalSessions={activePlan?.sessions.length ?? 0}
          activeSession={activeSession}
          onBack={() => {
            clearSession();
            router.back();
          }}
          insets={insets}
        />
      )}

      {/* ── Abandon Bottom Sheet ── */}
      <AbandonSheet
        visible={showAbandonSheet}
        onKeepGoing={() => setShowAbandonSheet(false)}
        onLeave={handleAbandonConfirm}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-views
// ─────────────────────────────────────────────────────────────────────────────

function LoadingView({
  insets,
  error,
  onBack,
}: {
  insets: ReturnType<typeof useSafeAreaInsets>;
  error?: string | null;
  onBack?: () => void;
}) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        paddingTop: insets.top,
      }}
    >
      <AppIcon name="paw" size={48} color={colors.primary} />
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ marginTop: spacing.lg, color: colors.textSecondary, fontSize: 16 }}>
        {error ?? 'Getting your session ready…'}
      </Text>
      {error && onBack ? (
        <Pressable
          onPress={onBack}
          style={({ pressed }) => ({
            marginTop: spacing.lg,
            opacity: pressed ? 0.7 : 1,
            minHeight: 44,
            justifyContent: 'center',
          })}
        >
          <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>
            Back
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface IntroViewProps {
  protocol: import('@/constants/protocols').Protocol;
  dogName: string;
  insets: ReturnType<typeof useSafeAreaInsets>;
  onBack: () => void;
  onReady: () => void;
}

function IntroView({ protocol, dogName, insets, onBack, onReady }: IntroViewProps) {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + 140,
          gap: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <BackButton onPress={onBack} />

        {/* Title */}
        <View style={{ gap: spacing.sm }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary, lineHeight: 36 }}>
            {protocol.title}
          </Text>
          <Text style={{ fontSize: 16, lineHeight: 24, color: colors.textSecondary }}>
            {protocol.objective}
          </Text>
        </View>

        {/* Chips row */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          <Chip label={`${protocol.durationMinutes} minutes`} icon="time" />
          <Chip label={`${protocol.steps.length} steps`} icon="list" />
        </View>

        {/* Equipment */}
        {protocol.equipmentNeeded.length > 0 && (
          <View style={{ gap: spacing.sm }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              You'll need
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {protocol.equipmentNeeded.map((item) => (
                <Chip key={item} label={item} color={colors.secondary} textColor={colors.textPrimary} />
              ))}
            </View>
          </View>
        )}

        {/* Trainer note */}
        {protocol.trainerNote ? (
          <View
            style={{
              backgroundColor: '#E6F4F1',
              borderRadius: 14,
              padding: spacing.lg,
              borderLeftWidth: 4,
              borderLeftColor: colors.primary,
              gap: spacing.xs,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Trainer note
            </Text>
            <Text style={{ fontSize: 15, lineHeight: 22, color: '#1A4A42' }}>
              {protocol.trainerNote}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* CTA */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.md,
          paddingTop: spacing.md,
        }}
      >
        <Button
          label="I'm ready"
          rightIcon="arrow-forward"
          onPress={onReady}
          size="lg"
          style={{
            minHeight: 58,
            borderRadius: 16,
            backgroundColor: colors.brand.primary,
            borderColor: colors.brand.primary,
            borderWidth: 1,
          }}
        />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface SetupViewProps {
  protocol: import('@/constants/protocols').Protocol;
  checkedItems: Set<number>;
  onToggle: (i: number) => void;
  insets: ReturnType<typeof useSafeAreaInsets>;
  onBack: () => void;
  onStart: () => void;
}

function SetupView({ protocol, checkedItems, onToggle, insets, onBack, onStart }: SetupViewProps) {
  const checklist = buildChecklist(protocol.equipmentNeeded);
  const allChecked = checkedItems.size === checklist.length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xl,
          gap: spacing.xl,
        }}
      >
        <BackButton onPress={onBack} />

        <Text style={{ fontSize: 26, fontWeight: '700', color: colors.textPrimary }}>
          Quick setup
        </Text>

        <View style={{ gap: spacing.md }}>
          {checklist.map((item, i) => (
            <Pressable
              key={i}
              onPress={() => onToggle(i)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                backgroundColor: pressed ? '#F0FDF8' : colors.surface,
                borderRadius: 12,
                padding: spacing.lg,
                borderWidth: 1.5,
                borderColor: checkedItems.has(i) ? colors.primary : colors.border.default,
                minHeight: 56,
              })}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: checkedItems.has(i) ? colors.primary : colors.border.default,
                  backgroundColor: checkedItems.has(i) ? colors.primary : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {checkedItems.has(i) && (
                  <AppIcon name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: checkedItems.has(i) ? colors.textSecondary : colors.textPrimary,
                  textDecorationLine: checkedItems.has(i) ? 'line-through' : 'none',
                }}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
          paddingTop: spacing.md,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border.default,
        }}
      >
        <Pressable
          onPress={onStart}
          disabled={!allChecked}
          style={({ pressed }) => ({
            backgroundColor: allChecked
              ? pressed
                ? '#1aab50'
                : colors.primary
              : '#D1D5DB',
            borderRadius: 14,
            paddingVertical: spacing.lg,
            alignItems: 'center',
            minHeight: 54,
          })}
        >
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#6B7280' }}>
            Start session
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface StepActiveViewProps {
  step: import('@/constants/protocols').ProtocolStep;
  stepNumber: number;
  totalSteps: number;
  protocol: import('@/constants/protocols').Protocol;
  activeSession: import('@/stores/sessionStore').ActiveSession;
  onBack: () => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onIncrementRep: () => void;
  onResetReps: () => void;
  onStepDone: () => void;
  insets: ReturnType<typeof useSafeAreaInsets>;
}

function StepActiveView({
  step,
  stepNumber,
  totalSteps,
  protocol,
  activeSession,
  onBack,
  onToggleTimer,
  onResetTimer,
  onIncrementRep,
  onResetReps,
  onStepDone,
  insets,
}: StepActiveViewProps) {
  const hasTimer = !!step.durationSeconds;
  const hasReps = !!step.reps;
  const timerDone = hasTimer && activeSession.timerSeconds === 0 && !activeSession.isTimerRunning;
  const progressRatio = (stepNumber - 1) / totalSteps;

  const commonMistake = protocol.commonMistakes[stepNumber - 1] ?? protocol.commonMistakes[0];

  return (
    <View style={{ flex: 1 }}>
      {/* Progress bar */}
      <View
        style={{
          height: 4,
          backgroundColor: colors.border.default,
          marginTop: insets.top,
        }}
      >
        <View
          style={{
            height: 4,
            width: `${progressRatio * 100}%`,
            backgroundColor: colors.primary,
          }}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + 140,
          gap: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <BackButton onPress={onBack} />

        <StepCard
          step={step}
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          commonMistake={commonMistake}
        />

        {/* Timer */}
        {hasTimer && (
          <View
        style={{
          alignItems: 'center',
          gap: spacing.lg,
          marginTop: spacing.lg,
        }}
          >
        <View
          style={{
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'center',
            // Extra padding so the text is never clipped by the ScrollView
            paddingVertical: spacing.md,
          }}
        >
          <TimerRing
            totalSeconds={step.durationSeconds!}
            currentSeconds={activeSession.timerSeconds}
            size={200} // a bit bigger so text has more room
            color={timerDone ? colors.success : colors.primary}
          />
          <View
            style={{
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
            }}
          >
            <Text
          style={{
            fontSize: 40,
            fontWeight: '700',
            lineHeight: 46, // make sure top isn’t cut
            color: timerDone ? colors.success : colors.textPrimary,
          }}
            >
          {formatTimer(activeSession.timerSeconds)}
            </Text>
            {timerDone && (
          <Text
            style={{
              fontSize: 13,
              color: colors.success,
              fontWeight: '600',
              marginTop: 4,
            }}
          >
            Done!
          </Text>
            )}
          </View>
        </View>

        {/* Timer controls */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            marginTop: spacing.md,
          }}
        >
          {/* Reset button */}
          {(activeSession.isTimerRunning || activeSession.timerSeconds !== step.durationSeconds) && (
            <Pressable
              onPress={onResetTimer}
              style={({ pressed }) => ({
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: pressed ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.04)',
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <AppIcon name="refresh" size={20} color={colors.textSecondary} />
            </Pressable>
          )}

          {/* Play / Pause button */}
          <Pressable
            onPress={onToggleTimer}
            style={({ pressed }) => ({
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: pressed
                ? (timerDone ? '#3DAD9A' : '#2D8A7C')
                : (timerDone ? colors.success : colors.primary),
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: timerDone ? colors.success : colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            })}
          >
            <AppIcon
              name={activeSession.isTimerRunning ? 'pause' : 'play'}
              size={28}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        {/* Status label */}
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: timerDone ? colors.success : colors.textSecondary,
            textAlign: 'center',
            marginTop: 12,
            letterSpacing: 0.3,
          }}
        >
          {activeSession.isTimerRunning
            ? 'Running'
            : timerDone
              ? 'Complete!'
              : 'Ready'}
        </Text>
          </View>
        )}

        {/* Rep counter */}
        {hasReps && (
          <View style={{ height: 300 }}>
        <RepCounter
          count={activeSession.repCount}
          target={step.reps}
          onIncrement={onIncrementRep}
          onReset={onResetReps}
        />
          </View>
        )}
      </ScrollView>

      {/* Step done CTA */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
          paddingTop: spacing.md,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border.default,
        }}
      >
        <Pressable
          onPress={onStepDone}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#246158' : colors.primary,
            borderRadius: 14,
            paddingVertical: spacing.lg,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: spacing.sm,
            minHeight: 54,
          })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: '#6B7280' }}>Step done</Text>
            <AppIcon name="checkmark" size={16} color="#fff" />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface StepCompleteViewProps {
  stepNumber: number;
  totalSteps: number;
  currentStep: import('@/constants/protocols').ProtocolStep | undefined;
  nextStep: import('@/constants/protocols').ProtocolStep | undefined;
  onNext: () => void;
  insets: ReturnType<typeof useSafeAreaInsets>;
}

function StepCompleteView({ stepNumber, totalSteps, currentStep, nextStep, onNext, insets }: StepCompleteViewProps) {
  const isLast = !nextStep;

  useEffect(() => {
    if (!isLast) {
      const t = setTimeout(onNext, 2500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [isLast]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        gap: spacing.xl,
        backgroundColor: colors.background,
      }}
    >
      <AppIcon name="checkmark-circle" size={64} color={colors.success} />

      <View style={{ alignItems: 'center', gap: spacing.sm }}>
        <Text style={{ fontSize: 26, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' }}>
          Step {stepNumber} complete!
        </Text>
        {currentStep && (
          <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 }}>
            Great work on step {stepNumber} of {totalSteps}
          </Text>
        )}
      </View>

      {isLast ? (
        <View style={{ alignItems: 'center', gap: spacing.lg }}>
          <Text style={{ fontSize: 17, color: colors.textSecondary, textAlign: 'center' }}>
            All steps done! How did it go?
          </Text>
          <Pressable
            onPress={onNext}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#246158' : colors.primary,
              borderRadius: 14,
              paddingVertical: spacing.lg,
              paddingHorizontal: spacing.xxl,
              minHeight: 54,
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: '#6B7280' }}>Rate session</Text>
              <AppIcon name="arrow-forward" size={16} color="#fff" />
            </View>
          </Pressable>
        </View>
      ) : (
        <View style={{ alignItems: 'center', gap: spacing.md }}>
          <Text style={{ fontSize: 15, color: colors.textSecondary }}>
            Next: {nextStep?.instruction.slice(0, 50)}…
          </Text>
          <Pressable
            onPress={onNext}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#246158' : colors.primary,
              borderRadius: 14,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.xl,
              minHeight: 44,
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#6B7280' }}>Next step</Text>
              <AppIcon name="arrow-forward" size={14} color="#fff" />
            </View>
          </Pressable>
          <Text style={{ fontSize: 13, color: colors.textSecondary, opacity: 0.6 }}>
            Auto-advancing in 2 seconds…
          </Text>
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface SessionReviewViewProps {
  activeSession: import('@/stores/sessionStore').ActiveSession;
  dogName: string;
  reviewDifficulty: 'easy' | 'okay' | 'hard' | null;
  reviewNotes: string;
  isSaving: boolean;
  onSelectDifficulty: (d: 'easy' | 'okay' | 'hard') => void;
  onNotesChange: (s: string) => void;
  onSave: () => void;
  insets: ReturnType<typeof useSafeAreaInsets>;
}

function SessionReviewView({
  activeSession,
  dogName,
  reviewDifficulty,
  reviewNotes,
  isSaving,
  onSelectDifficulty,
  onNotesChange,
  onSave,
  insets,
}: SessionReviewViewProps) {
  const durationSeconds = Math.floor((Date.now() - activeSession.startedAt.getTime()) / 1000);

  const options: Array<{ value: 'easy' | 'okay' | 'hard'; emoji: AppIconName; label: string; sub: string }> = [
    { value: 'easy', emoji: 'thumbs-up', label: 'Easy', sub: `${dogName} was a superstar` },
    { value: 'okay', emoji: 'remove-circle', label: 'Okay', sub: 'Some good moments, some struggles' },
    { value: 'hard', emoji: 'warning', label: 'Hard', sub: 'Tough session today' },
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.xl,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + 140,
          gap: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <AppIcon name="ribbon" size={40} color={colors.primary} />
          <Text style={{ fontSize: 26, fontWeight: '700', color: colors.textPrimary }}>
            Session complete!
          </Text>
          <Text style={{ fontSize: 16, color: colors.textSecondary }}>
            Completed in {formatDuration(durationSeconds)}
          </Text>
        </View>

        <Text style={{ fontSize: 20, fontWeight: '600', color: colors.textPrimary, textAlign: 'center' }}>
          How did it go?
        </Text>

        <View style={{ gap: spacing.md }}>
          {options.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => onSelectDifficulty(opt.value)}
              style={({ pressed }) => ({
                backgroundColor: reviewDifficulty === opt.value
                  ? '#E6F4F1'
                  : pressed ? '#f5f5f5' : colors.surface,
                borderRadius: 16,
                padding: spacing.lg,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                borderWidth: 2,
                borderColor: reviewDifficulty === opt.value ? colors.primary : colors.border.default,
                minHeight: 72,
              })}
            >
              <AppIcon
                name={opt.emoji}
                size={32}
                color={reviewDifficulty === opt.value ? colors.primary : colors.textSecondary}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '600', color: colors.textPrimary }}>
                  {opt.label}
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>{opt.sub}</Text>
              </View>
              {reviewDifficulty === opt.value && (
                <AppIcon name="checkmark" size={20} color={colors.primary} />
              )}
            </Pressable>
          ))}
        </View>

        {/* Notes */}
        <TextInput
          value={reviewNotes}
          onChangeText={onNotesChange}
          placeholder="Anything to note? (optional)"
          placeholderTextColor={colors.textSecondary}
          multiline
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border.default,
            padding: spacing.lg,
            fontSize: 15,
            color: colors.textPrimary,
            minHeight: 80,
            textAlignVertical: 'top',
          }}
        />
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
          paddingTop: spacing.md,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border.default,
        }}
      >
        <Pressable
          onPress={onSave}
          disabled={!reviewDifficulty || isSaving}
          style={({ pressed }) => ({
            backgroundColor: !reviewDifficulty || isSaving
              ? colors.border.default
              : pressed
              ? '#246158'
              : colors.primary,
            borderRadius: 14,
            paddingVertical: spacing.lg,
            alignItems: 'center',
            minHeight: 54,
          })}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ fontSize: 17, fontWeight: '700', color: !reviewDifficulty ? colors.textSecondary : '#fff' }}>
              Save session
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface CompleteViewProps {
  dogName: string;
  protocol: import('@/constants/protocols').Protocol;
  completedSessionCount: number;
  totalSessions: number;
  activeSession: import('@/stores/sessionStore').ActiveSession;
  onBack: () => void;
  insets: ReturnType<typeof useSafeAreaInsets>;
}

function CompleteView({ dogName, protocol, completedSessionCount, totalSessions, activeSession, onBack, insets }: CompleteViewProps) {
  const nextProtocol = protocol.nextProtocolId;

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: insets.top,
        paddingBottom: insets.bottom + spacing.xl,
        gap: spacing.xl,
        backgroundColor: '#F0FDF8',
      }}
    >
      {/* Celebration */}
      <View style={{ alignItems: 'center', gap: spacing.md }}>
        <AppIcon name="ribbon" size={72} color={colors.primary} />
        <Text style={{ fontSize: 30, fontWeight: '800', color: colors.primary, textAlign: 'center' }}>
          {dogName} crushed it!
        </Text>
      </View>

      {/* Stats */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          padding: spacing.xl,
          gap: spacing.lg,
          width: '100%',
          borderWidth: 1,
          borderColor: colors.border.default,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <StatRow emoji="analytics" label="Sessions completed" value={`${completedSessionCount} of ${totalSessions}`} />
        <StatRow
          emoji="time"
          label="Time trained"
          value={formatDuration(Math.floor((Date.now() - activeSession.startedAt.getTime()) / 1000))}
        />
        {nextProtocol && (
          <StatRow emoji="arrow-forward" label="Next up" value={`Stage ${(protocol.stage + 1)} session`} />
        )}
      </View>

      <Pressable
        onPress={onBack}
        style={({ pressed }) => ({
          backgroundColor: pressed ? '#246158' : colors.primary,
          borderRadius: 14,
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xxl,
          alignItems: 'center',
          minHeight: 54,
          width: '100%',
        })}
      >
        <Text style={{ fontSize: 17, fontWeight: '700', color: '#fff' }}>Back to today</Text>
      </Pressable>
    </View>
  );
}

function StatRow({ emoji, label, value }: { emoji: AppIconName; label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <AppIcon name={emoji} size={20} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, color: colors.textSecondary }}>{label}</Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>{value}</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function AbandonSheet({
  visible,
  onKeepGoing,
  onLeave,
}: {
  visible: boolean;
  onKeepGoing: () => void;
  onLeave: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(12,18,28,0.36)',
        }}
        onPress={onKeepGoing}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingTop: spacing.md,
            paddingHorizontal: spacing.xl,
            paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.lg,
            gap: spacing.md,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -6 },
            shadowOpacity: 0.12,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              width: 44,
              height: 5,
              borderRadius: 999,
              backgroundColor: '#D1D5DB',
              marginBottom: spacing.xs,
            }}
          />

          <View style={{ alignItems: 'center', gap: spacing.sm }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>
              Leave this session?
            </Text>
            <Text style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center' }}>
              Your progress won't be saved.
            </Text>
          </View>

          <Pressable
            onPress={onKeepGoing}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#246158' : colors.primary,
              borderRadius: 14,
              paddingVertical: spacing.lg,
              alignItems: 'center',
              minHeight: 54,
            })}
          >
            <Text style={{ fontSize: 17, fontWeight: '700', color: '#fff' }}>Keep going</Text>
          </Pressable>

          <Pressable
            onPress={onLeave}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#FEF2F2' : colors.surface,
              borderRadius: 14,
              paddingVertical: spacing.md + 2,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#F5C2C7',
              minHeight: 50,
            })}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#B42318' }}>
              Leave session
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared tiny components
// ─────────────────────────────────────────────────────────────────────────────

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      style={({ pressed }) => ({
        alignSelf: 'flex-start',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        opacity: pressed ? 0.6 : 1,
        minHeight: 44,
        justifyContent: 'center',
      })}
    >
      <Text style={{ fontSize: 16, color: colors.textSecondary }}>← Back</Text>
    </Pressable>
  );
}

function Chip({
  label,
  icon,
  color = colors.primary,
  textColor = '#fff',
}: {
  label: string;
  icon?: AppIconName;
  color?: string;
  textColor?: string;
}) {
  return (
    <View
      style={{
        backgroundColor: color === colors.primary ? '#E6F4F1' : color,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        borderRadius: 99,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
      }}
    >
      {icon ? (
        <AppIcon
          name={icon}
          size={14}
          color={color === colors.primary ? colors.primary : textColor}
        />
      ) : null}
      <Text style={{ fontSize: 14, color: color === colors.primary ? colors.primary : textColor, fontWeight: '500' }}>
        {label}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LiveCoachingScreen
//
// Self-contained sub-screen that mounts useLiveCoachingSession, feeds frames
// into the coaching engine, and delegates UI to LiveCoachOverlay.
//
// Intentionally kept as a local component (not exported) — it only makes sense
// inside session.tsx where protocol + dogName are already resolved.
// ─────────────────────────────────────────────────────────────────────────────

interface LiveCoachingScreenProps {
  protocol: import('@/constants/protocols').Protocol;
  dogName: string;
  onComplete: (metrics: CoachingSessionMetrics) => void;
  onExit: () => void;
}

function LiveCoachingScreen({
  protocol,
  dogName,
  onComplete,
  onExit,
}: LiveCoachingScreenProps) {
  const coaching = useLiveCoachingSession({ protocol, dogName });

  // Start camera pipeline on mount; stop on unmount
  useEffect(() => {
    coaching.start();
    return () => {
      coaching.stop();
    };
  }, []);

  // Watch for session completion
  useEffect(() => {
    if (coaching.isComplete && coaching.metrics) {
      onComplete(coaching.metrics);
    }
  }, [coaching.isComplete]);

  // ── Haptic feedback on meaningful state transitions ─────────────────────────
  // Only fire once per transition; never on every frame.
  const prevCoachingStateRef = useRef<string | null>(null);
  useEffect(() => {
    const state = coaching.coachingDecision?.state;
    if (!state || state === prevCoachingStateRef.current) return;
    prevCoachingStateRef.current = state;

    if (state === 'good_rep' || state === 'complete') {
      // Two short pulses — success feel
      Vibration.vibrate([0, 60, 60, 120]);
    } else if (state === 'reset') {
      // Single soft pulse — prompt attention without alarm
      Vibration.vibrate(80);
    } else if (state === 'hold_in_progress') {
      // Gentle single tick — "hold started"
      Vibration.vibrate(40);
    }
  }, [coaching.coachingDecision?.state]);

  return (
    <LiveCoachOverlay
      coaching={coaching}
      stabilizedObservation={coaching.stabilizedObservation}
      rawObservation={coaching.rawObservation}
      trackingQuality={coaching.trackingQuality}
      onExit={onExit}
    />
  );
}
