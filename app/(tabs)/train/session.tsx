import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  AppState,
  type AppStateStatus,
  Modal,
  Pressable,
  ScrollView,
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
import { LiveAiTrainerOverlay } from '@/components/vision/LiveAiTrainerOverlay';
import { colors } from '@/constants/colors';
import { getCourseUiColors, hexToRgba, type CourseUiColors } from '@/constants/courseColors';
import { spacing } from '@/constants/spacing';
import { useSessionStore } from '@/stores/sessionStore';
import { usePlanStore } from '@/stores/planStore';
import { useDogStore } from '@/stores/dogStore';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { saveSession, checkMilestones, updateStreak } from '@/lib/sessionManager';
import { EXERCISE_TO_PROTOCOL } from '@/constants/protocols';
import { didUpcomingScheduleChange } from '@/lib/notifications';
import { useLiveAiTrainerSession } from '@/hooks/useLiveAiTrainerSession';
import type { LiveAiTrainerSummary } from '@/lib/liveCoach/liveAiTrainerTypes';
import { buildPostSessionReflectionQuestions } from '@/lib/adaptivePlanning/reflectionQuestionEngine';
import type { ReflectionQuestionConfig } from '@/lib/adaptivePlanning/reflectionQuestionTypes';
import {
  PostSessionReflectionCard,
  applyReflectionAnswer,
  makeEmptyReflection,
} from '@/components/session/PostSessionReflectionCard';
import type { PostSessionReflection, ReflectionQuestionId } from '@/types';

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
  const { id: sessionId, planId } = useLocalSearchParams<{ id: string; planId?: string }>();
  const insets = useSafeAreaInsets();

  const { fetchProtocol, markSessionComplete, plansById } = usePlanStore();
  const { dog, fetchDogLearningState, dogLearningState, activePlans } = useDogStore();
  const { user } = useAuthStore();
  const ensureNotificationPermission = useNotificationStore((s) => s.ensurePermissionAfterMeaningfulAction);
  const refreshSchedulesForPlans = useNotificationStore((s) => s.refreshSchedulesForPlans);

  // Resolve the plan and session for this sessionId across ALL active plans.
  // This is the canonical multi-plan-safe lookup — avoids breaking when the
  // session belongs to a non-primary (secondary) plan.
  const resolvedPlan = planId && plansById[planId]
    ? plansById[planId]
    : sessionId
    ? Object.values(plansById).find((p) => p.sessions.some((s) => s.id === sessionId)) ?? null
    : null;
  const activePlan = resolvedPlan; // alias used throughout the component
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
    goToPreviousStep,
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

  // ── Post-session reflection state ──────────────────────────────────────────
  const [reflectionQuestions, setReflectionQuestions] = useState<ReflectionQuestionConfig[]>([]);
  const [reflectionAnswers, setReflectionAnswers] = useState<PostSessionReflection>(makeEmptyReflection());
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Live coaching local overlay state ──────────────────────────────────────
  // Kept local so normal session flow (store state machine) is never touched.
  const [overlayState, setOverlayState] = useState<LocalOverlayState>('NONE');
  // Metrics captured when live coaching completes; passed to saveSession.
  const liveAiSummaryRef = useRef<LiveAiTrainerSummary | null>(null);

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

  // ── Build reflection questions once when entering SESSION_REVIEW ──────────
  // Runs whenever the session state changes to SESSION_REVIEW.
  // Uses safe fallbacks for any context not yet available locally:
  //   - recentSessions: [] (session logs not held in local state)
  //   - learningState: mapped from dogLearningState if present
  // If question generation throws for any reason, we silently fall back to
  // an empty list — the review still shows difficulty + notes normally.
  useEffect(() => {
    if (activeSession?.state !== 'SESSION_REVIEW') return;

    try {
      const durationSeconds = Math.floor((Date.now() - activeSession.startedAt.getTime()) / 1000);
      const planSession = activePlan?.sessions.find((s) => s.id === activeSession.sessionId);

      const questions = buildPostSessionReflectionQuestions({
        difficulty: reviewDifficulty ?? 'okay',
        sessionStatus: 'completed',
        durationSeconds,
        protocolId: EXERCISE_TO_PROTOCOL[activeSession.exerciseId] ?? activeSession.exerciseId,
        skillId: planSession?.skillId ?? null,
        environmentTag: planSession?.environment ?? null,
        recentSessions: [],
        learningState: dogLearningState
          ? {
              distractionSensitivity: dogLearningState.distractionSensitivity,
              handlerConsistencyScore: dogLearningState.handlerConsistencyScore,
              confidenceScore: dogLearningState.confidenceScore,
              inconsistencyIndex:
                typeof (dogLearningState.behaviorSignals as Record<string, unknown>)?.inconsistencyIndex === 'number'
                  ? ((dogLearningState.behaviorSignals as Record<string, unknown>).inconsistencyIndex as number)
                  : null,
            }
          : null,
      });

      setReflectionQuestions(questions);
      setReflectionAnswers(makeEmptyReflection());
    } catch {
      // Graceful fallback: no questions shown, difficulty + notes still work.
      setReflectionQuestions([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession?.state]);

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
        // Mark session complete in plan store (planId required for multi-plan support)
        await markSessionComplete(activePlan.id, sid, {
          sessionId: sid,
          rating: reviewDifficulty === 'easy' ? 5 : reviewDifficulty === 'okay' ? 3 : 1,
          completedAt: new Date().toISOString(),
          notes: reviewNotes || undefined,
        });

        const planSession = activePlan.sessions.find((session) => session.id === sid);
        const protocolId = EXERCISE_TO_PROTOCOL[activeSession.exerciseId] ?? activeSession.exerciseId;
        const liveAiSummary = liveAiSummaryRef.current;
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
          // Live AI Trainer fields
          liveCoachingUsed: liveAiSummary !== null && liveAiSummary.used,
          liveAiTrainerSummary: liveAiSummary ?? undefined,
          // Post-session reflection — pass answered object or null when no
          // questions were shown (e.g. engine fallback or all skipped).
          postSessionReflection: reflectionQuestions.length > 0 ? reflectionAnswers : null,
        });

        // Update streak (non-blocking)
        updateStreak(user.id, dog.id).catch(() => {});

        // Check milestones (non-blocking)
        checkMilestones(user.id, dog.id, {
          sessionId: sid,
          dogId: dog.id,
          planId: activePlan.id,
        }).catch(() => {});

        // Refresh plans and notifications for all active plans (multi-plan safe).
        if (dog?.id) {
          const plansBefore = usePlanStore.getState().plansById;
          await usePlanStore.getState().refreshPlans(dog.id).catch(() => {});
          ensureNotificationPermission().catch(() => {});
          const plansAfter = usePlanStore.getState().plansById;
          const primaryBefore = Object.values(plansBefore).find((p) => p.isPrimary) ?? null;
          const primaryAfter = Object.values(plansAfter).find((p) => p.isPrimary) ?? null;
          if (didUpcomingScheduleChange(primaryBefore, primaryAfter) && activePlans.length > 0) {
            const refreshedPlans = usePlanStore.getState().activePlanIds
              .map((id) => usePlanStore.getState().plansById[id])
              .filter((p): p is NonNullable<typeof p> => p != null);
            refreshSchedulesForPlans(dog, refreshedPlans).catch(() => {});
          }
        }
        fetchDogLearningState(dog.id).catch(() => {});
      });
    } finally {
      setIsSaving(false);
    }
  }, [reviewDifficulty, reviewNotes, reflectionQuestions, reflectionAnswers, activeSession, user, dog, activePlan, activePlans, fetchDogLearningState, ensureNotificationPermission, refreshSchedulesForPlans]);

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
    router.replace('/(tabs)/train');
  }, [activeSession, activePlan, user, dog, reviewNotes, abandonSession, clearSession, fetchDogLearningState]);

  // ── Setup → mode decision ──────────────────────────────────────────────────
  // After the setup checklist, if the protocol supports live coaching and no
  // overlay is active yet, show the mode picker instead of jumping straight to
  // STEP_ACTIVE.  We keep the store state at 'SETUP' while the picker is shown.
  const handleSetupStart = useCallback(() => {
    if (activeSession?.protocol.supportsLiveAiTrainer) {
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
      router.replace('/(tabs)/train');
      return;
    }
    setShowAbandonSheet(true);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render states
  // ─────────────────────────────────────────────────────────────────────────

  const courseTheme = getCourseUiColors(activePlan ?? { id: sessionId ?? 'session-fallback' });

  if (!activeSession || activeSession.state === 'LOADING') {
    return <LoadingView insets={insets} error={loadError} onBack={() => router.back()} theme={courseTheme} />;
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
          accentColor={courseTheme.solid}
          accentTint={courseTheme.tint}
          contrastTextColor={courseTheme.contrastText}
          onBack={() => {
            setOverlayState('NONE');
            setState('SETUP');
          }}
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

  if (overlayState === 'LIVE_COACHING' && activeSession) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <StatusBar style="light" />
        <LiveAiTrainerScreen
          protocol={activeSession.protocol}
          dogId={dog?.id ?? ''}
          planId={activePlan?.id ?? ''}
          sessionId={activeSession.sessionId}
          currentStepIndex={activeSession.currentStepIndex}
          repCount={activeSession.repCount}
          timerSeconds={activeSession.timerSeconds ?? 0}
          isTimerRunning={activeSession.isTimerRunning}
          onComplete={(summary: LiveAiTrainerSummary) => {
            liveAiSummaryRef.current = summary;
            setOverlayState('NONE');
            setState('SESSION_REVIEW');
          }}
          onExit={() => {
            setOverlayState('NONE');
            setShowAbandonSheet(true);
          }}
          onManualSwitch={() => {
            setOverlayState('NONE');
            setState('STEP_ACTIVE');
          }}
          onStepDone={handleStepDone}
          onToggleTimer={() => {
            activeSession.isTimerRunning ? pauseTimer() : startTimer();
          }}
          onIncrementRep={incrementRep}
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
          theme={courseTheme}
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
          theme={courseTheme}
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
          theme={courseTheme}
          onBack={goToPreviousStep}
          onHome={handleBackPress}
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
          theme={courseTheme}
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
          reflectionQuestions={reflectionQuestions}
          reflectionAnswers={reflectionAnswers}
          onSelectDifficulty={setReviewDifficulty}
          onNotesChange={setReviewNotes}
          onReflectionAnswer={(qId, value) =>
            setReflectionAnswers((prev) => applyReflectionAnswer(prev, qId, value))
          }
          onSave={handleSubmitSession}
          insets={insets}
          theme={courseTheme}
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
          theme={courseTheme}
          onBack={() => {
            clearSession();
            router.replace('/(tabs)/train');
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
  theme,
}: {
  insets: ReturnType<typeof useSafeAreaInsets>;
  error?: string | null;
  onBack?: () => void;
  theme?: CourseUiColors;
}) {
  const accentColor = theme?.solid ?? colors.primary;
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
      <AppIcon name="paw" size={48} color={accentColor} />
      <ActivityIndicator size="large" color={accentColor} />
      <Text style={{ marginTop: spacing.lg, color: colors.textSecondary, fontSize: 16 }}>
        {error ?? 'Getting your session ready...'}
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
          <Text style={{ color: accentColor, fontSize: 16, fontWeight: '600' }}>
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
  theme: CourseUiColors;
  insets: ReturnType<typeof useSafeAreaInsets>;
  onBack: () => void;
  onReady: () => void;
}

function IntroView({ protocol, dogName, theme, insets, onBack, onReady }: IntroViewProps) {
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
          <Chip label={`${protocol.durationMinutes} minutes`} icon="time" color={theme.solid} textColor={theme.text} />
          <Chip label={`${protocol.steps.length} steps`} icon="list" color={theme.solid} textColor={theme.text} />
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
              backgroundColor: theme.tint,
              borderRadius: 14,
              padding: spacing.lg,
              borderLeftWidth: 4,
              borderLeftColor: theme.solid,
              gap: spacing.xs,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Trainer note
            </Text>
            <Text style={{ fontSize: 15, lineHeight: 22, color: colors.textPrimary }}>
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
            backgroundColor: theme.solid,
            borderColor: theme.solid,
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
  theme: CourseUiColors;
  onToggle: (i: number) => void;
  insets: ReturnType<typeof useSafeAreaInsets>;
  onBack: () => void;
  onStart: () => void;
}

function SetupView({ protocol, checkedItems, theme, onToggle, insets, onBack, onStart }: SetupViewProps) {
  const checklist = buildChecklist(protocol.equipmentNeeded);
  const allChecked = checkedItems.size === checklist.length;
  const checkedCount = checkedItems.size;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xl,
        }}
      >
        <BackButton onPress={onBack} />

        {/* Header */}
        <View style={{ marginTop: spacing.lg, marginBottom: spacing.xl, gap: spacing.sm }}>
          <Text
            style={{
              fontSize: 26,
              fontWeight: '700',
              lineHeight: 32, // 👈 ADD THIS
              color: colors.textPrimary,
              letterSpacing: -0.5,
            }}
              >
              Quick setup
            </Text>
          <Text style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 22 }}>
            Check off each item before you begin.
          </Text>
        </View>

        {/* Progress indicator */}
        <View style={{ marginBottom: spacing.lg, gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>
              {checkedCount} of {checklist.length} ready
            </Text>
            {allChecked && (
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text }}>
                All set!
              </Text>
            )}
          </View>
          <View style={{ height: 4, borderRadius: 99, backgroundColor: colors.border.soft, overflow: 'hidden' }}>
            <View
              style={{
                height: 4,
                borderRadius: 99,
                backgroundColor: theme.solid,
                width: `${(checkedCount / checklist.length) * 100}%`,
              }}
            />
          </View>
        </View>

        {/* Checklist */}
        <View style={{ gap: spacing.md }}>
          {checklist.map((item, i) => {
            const checked = checkedItems.has(i);
            return (
              <Pressable
                key={i}
                onPress={() => onToggle(i)}
                style={({ pressed }) => ({
                  borderRadius: 16,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.lg,
                  borderWidth: 1.5,
                  backgroundColor: checked ? colors.status.successBg : colors.surface,
                  borderColor: checked ? colors.status.successBorder : '#C5C9D0',
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      borderWidth: checked ? 0 : 2,
                      borderColor: '#C5C9D0',
                      backgroundColor: checked ? theme.solid : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {checked && <AppIcon name="checkmark" size={17} color="#fff" />}
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 17,
                      fontWeight: checked ? '400' : '500',
                      color: checked ? colors.textSecondary : colors.textPrimary,
                      textDecorationLine: checked ? 'line-through' : 'none',
                      lineHeight: 26,
                    }}
                  >
                    {item}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
          paddingTop: spacing.md,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border.soft,
          gap: spacing.sm,
        }}
      >
        <Pressable
          onPress={onStart}
          style={({ pressed }) => ({
            backgroundColor: pressed ? theme.selectedBorder : theme.solid,
            borderWidth: 1,
            borderColor: pressed ? theme.solid : theme.selectedBorder,
            borderRadius: 16,
            paddingVertical: spacing.lg,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: spacing.sm,
            minHeight: 54,
            shadowColor: theme.solid,
            shadowOffset: { width: 0, height: allChecked ? 6 : 4 },
            shadowOpacity: allChecked ? 0.28 : 0.18,
            shadowRadius: allChecked ? 16 : 12,
            elevation: allChecked ? 6 : 4,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text.primary }}>
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
  theme: CourseUiColors;
  onBack: () => void;
  onHome: () => void;
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
  theme,
  onBack,
  onHome,
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
            backgroundColor: theme.solid,
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
        {/* Back + step counter + home row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <BackButton onPress={onBack} />
          <View
            style={{
              backgroundColor: hexToRgba(theme.solid, 0.12),
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
              borderRadius: 99,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text, letterSpacing: 0.3 }}>
              Step {stepNumber} of {totalSteps}
            </Text>
          </View>
          <Pressable
            onPress={onHome}
            hitSlop={12}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
              minHeight: 44,
              minWidth: 44,
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <AppIcon name="home" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        <StepCard
          step={step}
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          commonMistake={commonMistake}
          accentColor={theme.solid}
        />

        {/* Timer */}
        {hasTimer && (
          <View
            style={{
              backgroundColor: hexToRgba(theme.solid, 0.06),
              borderRadius: 20,
              borderWidth: 1,
              borderColor: hexToRgba(theme.solid, 0.12),
              paddingVertical: spacing.xl,
              paddingHorizontal: spacing.lg,
              alignItems: 'center',
              gap: spacing.lg,
            }}
          >
            {/* Ring + time text */}
            <View
              style={{
                position: 'relative',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: spacing.sm,
              }}
            >
              <TimerRing
                totalSeconds={step.durationSeconds!}
                currentSeconds={activeSession.timerSeconds}
                size={200}
                color={timerDone ? colors.success : theme.solid}
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
                    lineHeight: 46,
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

            {/* Timer controls — reset always reserves space to avoid layout shift */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 24,
              }}
            >
              {/* Reset — invisible when not applicable, preserves layout */}
              <Pressable
                onPress={onResetTimer}
                disabled={!activeSession.isTimerRunning && activeSession.timerSeconds === step.durationSeconds}
                style={({ pressed }) => ({
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: pressed ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.04)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: (!activeSession.isTimerRunning && activeSession.timerSeconds === step.durationSeconds) ? 0 : 1,
                })}
              >
                <AppIcon name="refresh" size={20} color={colors.textSecondary} />
              </Pressable>

              {/* Play / Pause */}
              <Pressable
                onPress={onToggleTimer}
                style={({ pressed }) => ({
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: pressed
                    ? (timerDone ? hexToRgba(colors.success, 0.85) : theme.selectedBorder)
                    : (timerDone ? colors.success : theme.solid),
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: timerDone ? colors.success : theme.solid,
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

              {/* Spacer to balance the reset button */}
              <View style={{ width: 48, height: 48 }} />
            </View>

            {/* Status label */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: timerDone ? colors.success : colors.textSecondary,
                textAlign: 'center',
                letterSpacing: 0.3,
              }}
            >
              {activeSession.isTimerRunning
                ? 'Running...'
                : timerDone
                  ? 'Complete!'
                  : 'Tap to start'}
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
          accentColor={theme.solid}
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
            backgroundColor: pressed ? theme.selectedBorder : theme.solid,
            borderWidth: 1,
            borderColor: pressed ? theme.solid : theme.selectedBorder,
            borderRadius: 14,
            paddingVertical: spacing.lg,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: spacing.sm,
            minHeight: 54,
            shadowColor: theme.solid,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.14,
            shadowRadius: 10,
            elevation: 3,
          })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text.primary }}>Step done</Text>
            <AppIcon name="checkmark" size={16} color={colors.text.primary} />
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
  theme: CourseUiColors;
  onNext: () => void;
  insets: ReturnType<typeof useSafeAreaInsets>;
}

function StepCompleteView({ stepNumber, totalSteps, currentStep, nextStep, theme, onNext, insets }: StepCompleteViewProps) {
  const isLast = !nextStep;
  const ADVANCE_MS = 2500;

  // Animated countdown bar for auto-advance
  const countdownAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isLast) {
      countdownAnim.setValue(1);
      const anim = Animated.timing(countdownAnim, {
        toValue: 0,
        duration: ADVANCE_MS,
        useNativeDriver: false,
      });
      anim.start();
      const t = setTimeout(onNext, ADVANCE_MS);
      return () => {
        anim.stop();
        clearTimeout(t);
      };
    }
    return undefined;
  }, [isLast]);

  // Trim next step label cleanly at a word boundary
  const nextStepLabel = nextStep
    ? nextStep.instruction.length > 48
      ? nextStep.instruction.slice(0, 48).replace(/\s\S+$/, '') + '...'
      : nextStep.instruction
    : '';

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
        <Text style={{ fontSize: 26, fontWeight: '700', lineHeight: 32, color: colors.textPrimary, textAlign: 'center' }}>
          Step {stepNumber} complete!
        </Text>
        {currentStep && (
          <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', lineHeight: 24 }}>
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
              backgroundColor: pressed ? theme.selectedBorder : theme.solid,
              borderWidth: 1,
              borderColor: pressed ? theme.solid : theme.selectedBorder,
              borderRadius: 14,
              paddingVertical: spacing.lg,
              paddingHorizontal: spacing.xxl,
              minHeight: 54,
              shadowColor: theme.solid,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.14,
              shadowRadius: 10,
              elevation: 3,
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text.primary }}>Rate session</Text>
              <AppIcon name="arrow-forward" size={16} color={colors.text.primary} />
            </View>
          </Pressable>
        </View>
      ) : (
        <View style={{ alignItems: 'center', gap: spacing.md, width: '100%' }}>
          <Text style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center' }}>
            Next: {nextStepLabel}
          </Text>
          <Pressable
            onPress={onNext}
            style={({ pressed }) => ({
              backgroundColor: pressed ? theme.selectedBorder : theme.solid,
              borderWidth: 1,
              borderColor: pressed ? theme.solid : theme.selectedBorder,
              borderRadius: 14,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.xl,
              minHeight: 44,
              shadowColor: theme.solid,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 8,
              elevation: 2,
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text.primary }}>Next step</Text>
              <AppIcon name="arrow-forward" size={14} color={colors.text.primary} />
            </View>
          </Pressable>

          {/* Animated countdown bar */}
          <View style={{ width: '60%', height: 3, borderRadius: 99, backgroundColor: colors.border.soft, overflow: 'hidden' }}>
            <Animated.View
              style={{
                height: 3,
                borderRadius: 99,
                backgroundColor: theme.solid,
                width: countdownAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              }}
            />
          </View>
          <Text style={{ fontSize: 13, color: colors.textSecondary, opacity: 0.6 }}>
            Advancing automatically...
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
  reflectionQuestions: ReflectionQuestionConfig[];
  reflectionAnswers: PostSessionReflection;
  onSelectDifficulty: (d: 'easy' | 'okay' | 'hard') => void;
  onNotesChange: (s: string) => void;
  onReflectionAnswer: (qId: ReflectionQuestionId, value: string | number) => void;
  onSave: () => void;
  insets: ReturnType<typeof useSafeAreaInsets>;
  theme: CourseUiColors;
}

function SessionReviewView({
  activeSession,
  dogName,
  reviewDifficulty,
  reviewNotes,
  isSaving,
  reflectionQuestions,
  reflectionAnswers,
  onSelectDifficulty,
  onNotesChange,
  onReflectionAnswer,
  onSave,
  insets,
  theme,
}: SessionReviewViewProps) {
  const durationSeconds = Math.floor((Date.now() - activeSession.startedAt.getTime()) / 1000);
  const durationLabel = `Completed in ${formatDuration(durationSeconds)}`;

  return (
    <PostSessionReflectionCard
      dogName={dogName}
      durationLabel={durationLabel}
      questions={reflectionQuestions}
      answers={reflectionAnswers}
      difficulty={reviewDifficulty}
      notes={reviewNotes}
      onSelectDifficulty={onSelectDifficulty}
      onAnswer={onReflectionAnswer}
      onNotesChange={onNotesChange}
      onSubmit={onSave}
      isSaving={isSaving}
      insets={insets}
      theme={theme}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface CompleteViewProps {
  dogName: string;
  protocol: import('@/constants/protocols').Protocol;
  completedSessionCount: number;
  totalSessions: number;
  activeSession: import('@/stores/sessionStore').ActiveSession;
  theme: CourseUiColors;
  onBack: () => void;
  insets: ReturnType<typeof useSafeAreaInsets>;
}

function CompleteView({ dogName, protocol, completedSessionCount, totalSessions, activeSession, theme, onBack }: CompleteViewProps) {
  const nextProtocol = protocol.nextProtocolId;
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: spacing.xl,
        paddingTop: insets.top + spacing.xl * 2,
        paddingBottom: insets.bottom + spacing.xl,
        gap: spacing.xl,
        backgroundColor: theme.tint,
      }}
    >
      {/* Celebration */}
      <View style={{ alignItems: 'center', gap: spacing.md }}>
        <AppIcon name="ribbon" size={72} color={theme.solid} />
        <Text style={{ fontSize: 30, fontWeight: '800', color: theme.text, textAlign: 'center', lineHeight: 42 }}>
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
        <StatRow emoji="paw" label="Sessions completed" value={`${completedSessionCount} of ${totalSessions}`} color={theme.solid} />
        <StatRow
          emoji="time"
          label="Time trained"
          value={formatDuration(Math.floor((Date.now() - activeSession.startedAt.getTime()) / 1000))}
          color={theme.solid}
        />
        {nextProtocol && (
          <StatRow emoji="arrow-forward" label="Next up" value={`Stage ${(protocol.stage + 1)} session`} color={theme.solid} />
        )}
      </View>

      <Pressable
        onPress={onBack}
        style={({ pressed }) => ({
          backgroundColor: pressed ? theme.selectedBorder : theme.solid,
          borderRadius: 14,
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xxl,
          alignItems: 'center',
          minHeight: 54,
          width: '100%',
        })}
      >
        <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text.primary }}>Back to today</Text>
      </Pressable>
    </View>
  );
}

function StatRow({ emoji, label, value, color }: { emoji: AppIconName; label: string; value: string; color: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <AppIcon name={emoji} size={20} color={color} />
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
          backgroundColor: 'rgba(6,10,18,0.72)',
        }}
        onPress={onKeepGoing}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingTop: spacing.sm,
            paddingHorizontal: spacing.xl,
            paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.lg,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: 0.22,
            shadowRadius: 28,
            elevation: 16,
            overflow: 'hidden',
          }}
        >
          {/* Drag handle */}
          <View
            style={{
              alignSelf: 'center',
              width: 40,
              height: 4,
              borderRadius: 999,
              backgroundColor: colors.borderColor,
              marginBottom: spacing.lg,
            }}
          />

          {/* Icon badge */}
          <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: '#FEF3C7',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#F59E0B',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <AppIcon name="paw" size={32} color="#D97706" />
            </View>
          </View>

          {/* Text content */}
          <View style={{ alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: '800',
                lineHeight: 30,
                color: colors.textPrimary,
                textAlign: 'center',
                letterSpacing: -0.3,
              }}
            >
              Leave this session?
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: colors.textSecondary,
                textAlign: 'center',
                lineHeight: 23,
                maxWidth: 280,
              }}
            >
              Your pup is counting on you! Progress from this session won't be saved.
            </Text>
          </View>

          {/* Buttons */}
          <View style={{ gap: spacing.sm }}>
            {/* Primary: Keep Going */}
            <Pressable
              onPress={onKeepGoing}
              style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
            >
              <View
                style={{
                  backgroundColor: colors.brand.primary,
                  borderRadius: 18,
                  paddingVertical: 17,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: spacing.sm,
                  shadowColor: colors.brand.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <AppIcon name="paw" size={18} color="#fff" />
                <Text style={{ fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.1 }}>
                  Keep going!
                </Text>
              </View>
            </Pressable>

            {/* Secondary: Leave session */}
            <Pressable
              onPress={onLeave}
              style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
            >
              <View
                style={{
                  borderWidth: 1.5,
                  borderColor: colors.error,
                  borderRadius: 18,
                  paddingVertical: 15,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: spacing.sm,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.error }}>
                  Leave session
                </Text>
              </View>
            </Pressable>
          </View>
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
        opacity: pressed ? 0.6 : 1,
        minHeight: 44,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        justifyContent: 'center',
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <AppIcon name="chevron-back" size={18} color={colors.textSecondary} />
        <Text style={{ fontSize: 16, color: colors.textSecondary }}>Back</Text>
      </View>
    </Pressable>
  );
}

function Chip({
  label,
  icon,
  color,
  textColor,
}: {
  label: string;
  icon?: AppIconName;
  color?: string;
  textColor?: string;
}) {
  const chipColor = color ?? colors.primary;
  const chipTextColor = textColor ?? chipColor;
  return (
    <View
      style={{
        backgroundColor: hexToRgba(chipColor, 0.12),
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
          color={chipTextColor}
        />
      ) : null}
      <Text style={{ fontSize: 14, color: chipTextColor, fontWeight: '500' }}>
        {label}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LiveAiTrainerScreen
//
// Self-contained sub-screen that mounts useLiveAiTrainerSession and
// delegates UI to LiveAiTrainerOverlay.
// ─────────────────────────────────────────────────────────────────────────────

interface LiveAiTrainerScreenProps {
  protocol: import('@/constants/protocols').Protocol;
  dogId: string;
  planId: string;
  sessionId: string;
  currentStepIndex: number;
  repCount: number;
  timerSeconds: number;
  isTimerRunning: boolean;
  onComplete: (summary: LiveAiTrainerSummary) => void;
  onExit: () => void;
  onManualSwitch: () => void;
  onStepDone: () => void;
  onToggleTimer: () => void;
  onIncrementRep: () => void;
}

function LiveAiTrainerScreen({
  protocol,
  dogId,
  planId,
  sessionId,
  currentStepIndex,
  repCount,
  timerSeconds,
  isTimerRunning,
  onComplete,
  onExit,
  onManualSwitch,
  onStepDone,
  onToggleTimer,
  onIncrementRep,
}: LiveAiTrainerScreenProps) {
  const coaching = useLiveAiTrainerSession({ protocol, dogId, planId, sessionId, currentStepIndex });

  // Start coaching on mount; stop on unmount
  useEffect(() => {
    coaching.start();
    return () => {
      coaching.stop();
    };
  }, []);

  // Watch for session completion
  useEffect(() => {
    if (coaching.isComplete) {
      onComplete(coaching.getSummary());
    }
  }, [coaching.isComplete]);

  // Haptic feedback on coach messages
  useEffect(() => {
    if (coaching.lastResponse?.coachMessage) {
      Vibration.vibrate(60);
    }
  }, [coaching.lastResponse?.coachMessage]);

  const currentStep = protocol.steps[currentStepIndex];
  const stepInfo = {
    instruction: currentStep?.instruction ?? '',
    successLook: currentStep?.successLook ?? '',
    stepNumber: currentStepIndex + 1,
    totalSteps: protocol.steps.length,
    reps: currentStep?.reps ?? null,
    durationSeconds: currentStep?.durationSeconds ?? null,
  };

  return (
    <LiveAiTrainerOverlay
      status={coaching.status}
      lastResponse={coaching.lastResponse}
      cameraRef={coaching.cameraRef}
      onExit={onExit}
      onAskCoach={coaching.askCoach}
      onAnalyzeFrame={coaching.analyzeFrame}
      onManualSwitch={onManualSwitch}
      onStepDone={onStepDone}
      step={stepInfo}
      repCount={repCount}
      timerSeconds={timerSeconds}
      isTimerRunning={isTimerRunning}
      onToggleTimer={onToggleTimer}
      onIncrementRep={onIncrementRep}
    />
  );
}
