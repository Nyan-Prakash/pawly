import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, AppState, type AppStateStatus, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppIcon } from '@/components/ui/AppIcon';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { MascotCallout } from '@/components/ui/MascotCallout';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { Text } from '@/components/ui/Text';
import { TimerRing } from '@/components/session/TimerRing';
import { RepCounter } from '@/components/session/RepCounter';
import { StepCard } from '@/components/session/StepCard';
import { StepHelpSheet } from '@/components/session/StepHelpSheet';
import { SessionModePicker } from '@/components/session/SessionModePicker';
import { LiveAiTrainerOverlay } from '@/components/vision/LiveAiTrainerOverlay';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { haptics } from '@/lib/haptics';
import { durations, useReducedMotion } from '@/lib/motion';
import { useTheme } from '@/lib/theme';
import { useSessionStore, type ActiveSession, type StepResult } from '@/stores/sessionStore';
import { usePlanStore } from '@/stores/planStore';
import { useDogStore } from '@/stores/dogStore';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import {
  saveSession,
  checkMilestones,
  updateStreak,
  fetchRecentSessionSummaries,
} from '@/lib/sessionManager';
import { EXERCISE_TO_PROTOCOL, type Protocol, type ProtocolStep } from '@/constants/protocols';
import { didUpcomingScheduleChange } from '@/lib/notifications';
import { useLiveAiTrainerSession } from '@/hooks/useLiveAiTrainerSession';
import type { LiveAiTrainerSummary } from '@/lib/liveCoach/liveAiTrainerTypes';
import { buildPostSessionReflectionQuestions } from '@/lib/adaptivePlanning/reflectionQuestionEngine';
import type {
  RecentSessionSummary,
  ReflectionQuestionConfig,
} from '@/lib/adaptivePlanning/reflectionQuestionTypes';
import {
  PostSessionReflectionCard,
  applyReflectionAnswer,
  makeEmptyReflection,
} from '@/components/session/PostSessionReflectionCard';
import {
  ABANDONED_SUCCESS_SCORE,
  formatDuration,
  formatTimer,
  isSetupStep,
  outcomeToDifficulty,
  outcomeToPlanRating,
  outcomeToSuccessScore,
  shouldLogAbandonedSession,
  summarizeStepOutcomes,
  type SessionOutcome,
  type StepOutcome,
} from '@/lib/sessionScoring';
import {
  clearSessionSnapshot,
  loadSessionSnapshot,
  saveSessionSnapshot,
} from '@/lib/sessionPersistence';
import type { PostSessionReflection, ReflectionQuestionId } from '@/types';

// ── Local UI state for live coaching (does not touch session store) ──────────
type LocalOverlayState = 'NONE' | 'MODE_PICKER' | 'LIVE_COACHING';

// ─────────────────────────────────────────────────────────────────────────────
// "Before you start" items derived from equipment
// ─────────────────────────────────────────────────────────────────────────────

const BASE_CHECKLIST = ['A low-distraction space', 'High-value treats within reach'];

function buildChecklist(equipment: string[]): string[] {
  const items = [...BASE_CHECKLIST];
  const lower = equipment.map((e) => e.toLowerCase());
  if (lower.some((e) => e.includes('leash'))) items.push('Leash clipped on');
  if (lower.some((e) => e.includes('clicker'))) items.push('Clicker in hand');
  if (lower.some((e) => e.includes('mat') || e.includes('bed'))) items.push('Mat or bed in place');
  if (lower.some((e) => e.includes('crate'))) items.push('Crate door open');
  return items;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function SessionScreen() {
  const { id: sessionId, planId } = useLocalSearchParams<{ id: string; planId?: string }>();
  const { colorScheme } = useTheme();

  const { fetchProtocol, markSessionComplete, plansById } = usePlanStore();
  const { dog, fetchDogLearningState, dogLearningState, activePlans } = useDogStore();
  const { user } = useAuthStore();
  const ensureNotificationPermission = useNotificationStore((s) => s.ensurePermissionAfterMeaningfulAction);
  const refreshSchedulesForPlans = useNotificationStore((s) => s.refreshSchedulesForPlans);

  // Resolve the plan across ALL active plans so secondary-plan sessions work.
  const resolvedPlan = planId && plansById[planId]
    ? plansById[planId]
    : sessionId
    ? Object.values(plansById).find((p) => p.sessions.some((s) => s.id === sessionId)) ?? null
    : null;
  const activePlan = resolvedPlan;

  const {
    activeSession,
    startSession,
    setState,
    beginTraining,
    completeStep,
    undoLastStep,
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
    getTrainingSeconds,
  } = useSessionStore();

  const [showAbandonSheet, setShowAbandonSheet] = useState(false);
  const [showHelpSheet, setShowHelpSheet] = useState(false);
  const [reviewOutcome, setReviewOutcome] = useState<SessionOutcome | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastStepOutcome, setLastStepOutcome] = useState<StepOutcome>('success');
  const [resumedNotice, setResumedNotice] = useState(false);

  // ── Post-session reflection state ──────────────────────────────────────────
  const [reflectionQuestions, setReflectionQuestions] = useState<ReflectionQuestionConfig[]>([]);
  const [reflectionAnswers, setReflectionAnswers] = useState<PostSessionReflection>(makeEmptyReflection());
  const [recentSessions, setRecentSessions] = useState<RecentSessionSummary[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Live coaching local overlay state ──────────────────────────────────────
  const [overlayState, setOverlayState] = useState<LocalOverlayState>('NONE');
  const liveAiSummaryRef = useRef<LiveAiTrainerSummary | null>(null);

  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const backgroundTimeRef = useRef<number | null>(null);
  const stepStartTimeRef = useRef<number>(Date.now());
  const startedSessionIdRef = useRef<string | null>(null);
  /** Log id from a save that succeeded before a later step failed — lets retry skip the insert. */
  const savedLogIdRef = useRef<string | null>(null);

  // ── Load protocol & start (or resume) session ──────────────────────────────

  useEffect(() => {
    if (!sessionId) return;
    if (activeSession?.sessionId === sessionId || startedSessionIdRef.current === sessionId) return;
    if (!activePlan) return;

    const planSession = activePlan.sessions.find((s) => s.id === sessionId);
    if (!planSession) {
      setLoadError('This session is not in your active plan. Go back and pick a session from today.');
      return;
    }

    let isCancelled = false;
    setLoadError(null);

    Promise.all([fetchProtocol(planSession.exerciseId), loadSessionSnapshot()]).then(
      ([protocol, snapshot]) => {
        if (isCancelled) return;
        if (!protocol) {
          setLoadError("Couldn't load this session. Check your connection and try again.");
          return;
        }
        startedSessionIdRef.current = sessionId;

        const canResume =
          snapshot &&
          snapshot.sessionId === sessionId &&
          snapshot.exerciseId === planSession.exerciseId &&
          (snapshot.state === 'STEP_ACTIVE' ||
            snapshot.state === 'STEP_COMPLETE' ||
            snapshot.state === 'SESSION_REVIEW');

        if (canResume && snapshot) {
          startSession(sessionId, planSession.exerciseId, protocol, {
            startedAt: new Date(snapshot.startedAt),
            trainingStartedAt: snapshot.trainingStartedAt ? new Date(snapshot.trainingStartedAt) : null,
            savedAt: snapshot.savedAt ? new Date(snapshot.savedAt) : null,
            currentStepIndex: snapshot.currentStepIndex,
            stepResults: snapshot.stepResults,
            repCount: snapshot.repCount,
            state: snapshot.state,
          });
          setResumedNotice(true);
        } else {
          startSession(sessionId, planSession.exerciseId, protocol);
        }
      },
    );

    return () => {
      isCancelled = true;
    };
  }, [sessionId, activePlan, activeSession?.sessionId, fetchProtocol, startSession]);

  useEffect(() => {
    return () => {
      startedSessionIdRef.current = null;
      clearSession();
    };
  }, [clearSession]);

  useEffect(() => {
    if (!resumedNotice) return;
    const t = setTimeout(() => setResumedNotice(false), 4000);
    return () => clearTimeout(t);
  }, [resumedNotice]);

  // ── Crash-safe snapshot ────────────────────────────────────────────────────
  // Written on every meaningful change while training; cleared when the
  // session ends either way.

  useEffect(() => {
    if (!activeSession) return;
    const { state } = activeSession;
    if (state === 'COMPLETE' || state === 'ABANDONED') {
      void clearSessionSnapshot();
      return;
    }
    if (state === 'STEP_ACTIVE' || state === 'STEP_COMPLETE' || state === 'SESSION_REVIEW') {
      void saveSessionSnapshot({
        sessionId: activeSession.sessionId,
        planId: activePlan?.id ?? null,
        exerciseId: activeSession.exerciseId,
        protocolId: activeSession.protocol.id,
        protocolTitle: activeSession.protocol.title,
        totalSteps: activeSession.protocol.steps.length,
        startedAt: activeSession.startedAt.toISOString(),
        trainingStartedAt: activeSession.trainingStartedAt?.toISOString() ?? null,
        currentStepIndex: activeSession.currentStepIndex,
        stepResults: activeSession.stepResults,
        repCount: activeSession.repCount,
        state,
        savedAt: new Date().toISOString(),
      });
    }
  }, [
    activeSession?.state,
    activeSession?.currentStepIndex,
    activeSession?.stepResults,
    activeSession?.repCount,
  ]);

  // ── Tick interval ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (activeSession?.isTimerRunning) {
      tickIntervalRef.current = setInterval(() => tick(), 1000);
    } else if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
    return () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    };
  }, [activeSession?.isTimerRunning]);

  // ── Timer reaches zero ─────────────────────────────────────────────────────
  // The handler is usually looking at the dog, not the phone, so the end of a
  // timed step is announced with a haptic.

  useEffect(() => {
    if (
      activeSession?.state === 'STEP_ACTIVE' &&
      activeSession.timerSeconds === 0 &&
      !activeSession.isTimerRunning
    ) {
      const step = activeSession.protocol.steps[activeSession.currentStepIndex];
      if (step?.durationSeconds && step.durationSeconds > 0) {
        haptics.warning();
      }
    }
  }, [activeSession?.timerSeconds, activeSession?.isTimerRunning]);

  // ── Session complete: the one orchestrated moment ──────────────────────────

  useEffect(() => {
    if (activeSession?.state === 'COMPLETE') haptics.success();
  }, [activeSession?.state]);

  // ── AppState — keep a running timer honest across backgrounding ───────────

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

  // ── Step active: track when the step began. Timers are started by the user.

  useEffect(() => {
    if (activeSession?.state === 'STEP_ACTIVE') {
      stepStartTimeRef.current = Date.now();
    }
  }, [activeSession?.currentStepIndex, activeSession?.state]);

  // ── Entering review: fetch recent history for the question engine ─────────

  useEffect(() => {
    if (activeSession?.state !== 'SESSION_REVIEW') return;
    setReviewOutcome(null);
    setReflectionQuestions([]);
    setReflectionAnswers(makeEmptyReflection());
    setSaveError(null);
    if (!dog?.id) return;
    let cancelled = false;
    fetchRecentSessionSummaries(dog.id, 5)
      .then((rows) => {
        if (!cancelled) setRecentSessions(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession?.state]);

  // ── Reflection questions are built from the REAL outcome ──────────────────

  const buildQuestionsFor = useCallback(
    (outcome: SessionOutcome): ReflectionQuestionConfig[] => {
      if (!activeSession) return [];
      try {
        const planSession = activePlan?.sessions.find((s) => s.id === activeSession.sessionId);
        return buildPostSessionReflectionQuestions({
          difficulty: outcomeToDifficulty(outcome),
          sessionStatus: 'completed',
          durationSeconds: getTrainingSeconds(),
          protocolId: EXERCISE_TO_PROTOCOL[activeSession.exerciseId] ?? activeSession.exerciseId,
          skillId: planSession?.skillId ?? null,
          environmentTag: planSession?.environment ?? null,
          recentSessions,
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
      } catch {
        return [];
      }
    },
    [activeSession, activePlan, dogLearningState, recentSessions, getTrainingSeconds],
  );

  useEffect(() => {
    if (!reviewOutcome) return;
    const untouched = Object.values(reflectionAnswers).every((v) => v === null);
    if (untouched) setReflectionQuestions(buildQuestionsFor(reviewOutcome));
  // Only re-run when history arrives; buildQuestionsFor already closes over it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentSessions]);

  const handleSelectOutcome = useCallback(
    (outcome: SessionOutcome) => {
      if (outcome !== reviewOutcome) {
        // Changing the headline answer changes which follow-ups make sense.
        setReflectionQuestions(buildQuestionsFor(outcome));
        setReflectionAnswers(makeEmptyReflection());
      }
      setReviewOutcome(outcome);
    },
    [buildQuestionsFor, reviewOutcome],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────────────────

  const recordStep = useCallback(
    (outcome: StepOutcome): { step: ProtocolStep; isLast: boolean } | null => {
      if (!activeSession) return null;
      const { protocol, currentStepIndex, repCount } = activeSession;
      const step = protocol.steps[currentStepIndex];
      if (!step) return null;
      const durationSeconds = Math.floor((Date.now() - stepStartTimeRef.current) / 1000);
      const result: StepResult = {
        stepOrder: step.order,
        completed: outcome !== 'skipped',
        outcome,
        durationSeconds,
        repCount,
      };
      completeStep(result);
      return { step, isLast: currentStepIndex >= protocol.steps.length - 1 };
    },
    [activeSession, completeStep],
  );

  /** Manual mode: record the outcome, then either pause on it or move straight on. */
  const handleStepDone = useCallback(
    (outcome: StepOutcome) => {
      const recorded = recordStep(outcome);
      if (!recorded) return;
      setShowHelpSheet(false);

      // Setup-style steps and skips get no interstitial: there is nothing to
      // note, and it only slows the handler down.
      if (isSetupStep(recorded.step) || outcome === 'skipped') {
        advanceToNextStep();
        return;
      }

      setLastStepOutcome(outcome);
      setState('STEP_COMPLETE');
    },
    [recordStep, advanceToNextStep, setState],
  );

  const handleNextStep = useCallback(() => advanceToNextStep(), [advanceToNextStep]);

  const handleUndoStep = useCallback(() => undoLastStep(), [undoLastStep]);

  // Live coach: no interstitial; record + advance immediately.
  const handleLiveStepDone = useCallback(() => {
    const recorded = recordStep('success');
    if (!recorded) return;
    advanceToNextStep();
    if (recorded.isLast) setOverlayState('NONE');
  }, [recordStep, advanceToNextStep]);

  const handleSubmitSession = useCallback(async () => {
    if (!reviewOutcome || !activeSession || !user || !dog || !activePlan) return;
    setIsSaving(true);
    setSaveError(null);

    const outcome = reviewOutcome;
    const stepResults = activeSession.stepResults;
    const successScore = outcomeToSuccessScore(outcome, stepResults);

    try {
      await submitSession(async (sid, durationSeconds) => {
        const planSession = activePlan.sessions.find((session) => session.id === sid);
        const protocolId = EXERCISE_TO_PROTOCOL[activeSession.exerciseId] ?? activeSession.exerciseId;
        const liveAiSummary = liveAiSummaryRef.current;

        // 1. The log is the source of truth. Write it first; if it fails we
        //    stop here and let the handler retry with everything intact.
        if (!savedLogIdRef.current) {
          const result = await saveSession({
            userId: user.id,
            dogId: dog.id,
            planId: activePlan.id,
            sessionId: sid,
            exerciseId: activeSession.exerciseId,
            protocolId,
            durationSeconds,
            difficulty: outcomeToDifficulty(outcome),
            notes: reviewNotes,
            completedAt: new Date().toISOString(),
            successScore,
            stepResults,
            sessionStatus: 'completed',
            skillId: planSession?.skillId ?? null,
            sessionKind: planSession?.sessionKind ?? null,
            environmentTag: planSession?.environment ?? null,
            liveCoachingUsed: liveAiSummary !== null && liveAiSummary.used,
            liveAiTrainerSummary: liveAiSummary ?? undefined,
            postSessionReflection: reflectionQuestions.length > 0 ? reflectionAnswers : null,
          });
          if (result.error || !result.sessionLogId) {
            throw new Error(result.error ?? 'Could not save the session log.');
          }
          savedLogIdRef.current = result.sessionLogId;
        }

        // 2. Mark the plan session complete (idempotent — safe on retry).
        await markSessionComplete(activePlan.id, sid, {
          sessionId: sid,
          rating: outcomeToPlanRating(outcome, stepResults),
          completedAt: new Date().toISOString(),
          notes: reviewNotes || undefined,
        });

        // 3. Best-effort side effects.
        updateStreak(user.id, dog.id).catch(() => {});
        checkMilestones(user.id, dog.id, { sessionId: sid, dogId: dog.id, planId: activePlan.id }).catch(() => {});

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
        fetchDogLearningState(dog.id).catch(() => {});
      });
      await clearSessionSnapshot();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'The session could not be saved.';
      console.warn('[session] submit failed:', message);
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  }, [
    reviewOutcome,
    reviewNotes,
    reflectionQuestions,
    reflectionAnswers,
    activeSession,
    user,
    dog,
    activePlan,
    activePlans,
    submitSession,
    markSessionComplete,
    fetchDogLearningState,
    ensureNotificationPermission,
    refreshSchedulesForPlans,
  ]);

  const trainingSecondsNow = activeSession?.trainingStartedAt ? getTrainingSeconds() : null;
  const abandonWouldLog = activeSession
    ? shouldLogAbandonedSession({
        state: activeSession.state,
        stepResultCount: activeSession.stepResults.length,
        secondsTraining: trainingSecondsNow,
      })
    : false;

  const handleAbandonConfirm = useCallback(async () => {
    setShowAbandonSheet(false);

    // Only a real attempt is recorded. Backing out of the intro is not a
    // failed session and must not poison the learning state.
    if (activeSession && abandonWouldLog && user && dog && activePlan) {
      const planSession = activePlan.sessions.find((session) => session.id === activeSession.sessionId);
      const protocolId = EXERCISE_TO_PROTOCOL[activeSession.exerciseId] ?? activeSession.exerciseId;

      await saveSession({
        userId: user.id,
        dogId: dog.id,
        planId: activePlan.id,
        sessionId: activeSession.sessionId,
        exerciseId: activeSession.exerciseId,
        protocolId,
        durationSeconds: getTrainingSeconds(),
        difficulty: 'hard',
        notes: reviewNotes,
        completedAt: new Date().toISOString(),
        successScore: ABANDONED_SUCCESS_SCORE,
        stepResults: activeSession.stepResults,
        sessionStatus: 'abandoned',
        skillId: planSession?.skillId ?? null,
        sessionKind: planSession?.sessionKind ?? null,
        environmentTag: planSession?.environment ?? null,
        liveCoachingUsed: liveAiSummaryRef.current?.used ?? false,
        liveAiTrainerSummary: liveAiSummaryRef.current ?? undefined,
      }).catch(() => {});
      fetchDogLearningState(dog.id).catch(() => {});
    }

    abandonSession();
    await clearSessionSnapshot();
    clearSession();
    router.replace('/(tabs)/train');
  }, [
    activeSession,
    abandonWouldLog,
    activePlan,
    user,
    dog,
    reviewNotes,
    abandonSession,
    clearSession,
    fetchDogLearningState,
    getTrainingSeconds,
  ]);

  // ── Intro to training ───────────────────────────────────────────────────────

  const handleStart = useCallback(() => beginTraining(), [beginTraining]);
  const handleChooseMode = useCallback(() => setOverlayState('MODE_PICKER'), []);

  // ─────────────────────────────────────────────────────────────────────────
  // Leaving
  // ─────────────────────────────────────────────────────────────────────────

  const handleExit = () => {
    if (!activeSession || activeSession.state === 'COMPLETE') {
      clearSession();
      router.replace('/(tabs)/train');
      return;
    }
    // Nothing recorded yet: just leave. No guilt, no bogus log.
    if (activeSession.state === 'INTRO') {
      void clearSessionSnapshot();
      clearSession();
      router.back();
      return;
    }
    setShowAbandonSheet(true);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render states
  // ─────────────────────────────────────────────────────────────────────────

  const statusBarStyle = colorScheme === 'dark' ? 'light' : 'dark';

  if (!activeSession || activeSession.state === 'LOADING') {
    return (
      <SafeScreen edges={['top', 'bottom']}>
        <StatusBar style={statusBarStyle} />
        <TopBar onClose={() => router.back()} progress={0} />
        {loadError ? (
          <EmptyState
            icon="alert-circle-outline"
            title="Session unavailable"
            subtitle={loadError}
            action={{ label: 'Back to Train', onPress: () => router.back() }}
          />
        ) : (
          <LoadingSkeleton />
        )}
      </SafeScreen>
    );
  }

  const { state, protocol, currentStepIndex } = activeSession;
  const currentStep = protocol.steps[currentStepIndex];
  const totalSteps = protocol.steps.length;
  const dogName = dog?.name ?? 'your dog';
  const stepSummary = summarizeStepOutcomes(activeSession.stepResults);
  const scoredStepSummary = summarizeStepOutcomes(
    activeSession.stepResults.filter((r) => {
      const step = protocol.steps.find((st) => st.order === r.stepOrder);
      return step ? !isSetupStep(step) : true;
    }),
  );
  const totalReps = activeSession.stepResults.reduce((sum, r) => sum + r.repCount, 0);

  const abandonSheet = (
    <AbandonSheet
      visible={showAbandonSheet}
      willRecord={abandonWouldLog}
      stepsDone={stepSummary.total}
      totalSteps={totalSteps}
      onKeepGoing={() => setShowAbandonSheet(false)}
      onLeave={handleAbandonConfirm}
    />
  );

  if (overlayState === 'MODE_PICKER') {
    return (
      <SafeScreen edges={['top', 'bottom']}>
        <StatusBar style={statusBarStyle} />
        <SessionModePicker
          dogName={dogName}
          onBack={() => {
            setOverlayState('NONE');
            setState('INTRO');
          }}
          onNormal={() => {
            setOverlayState('NONE');
            beginTraining();
          }}
          onCamera={() => {
            setOverlayState('LIVE_COACHING');
            beginTraining();
          }}
        />
      </SafeScreen>
    );
  }

  if (overlayState === 'LIVE_COACHING') {
    return (
      <View style={{ flex: 1 }}>
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
          onSummary={(summary: LiveAiTrainerSummary) => {
            liveAiSummaryRef.current = summary;
          }}
          onExit={() => setShowAbandonSheet(true)}
          onManualSwitch={() => {
            setOverlayState('NONE');
            setState('STEP_ACTIVE');
          }}
          onStepDone={handleLiveStepDone}
          onToggleTimer={() => {
            activeSession.isTimerRunning ? pauseTimer() : startTimer();
          }}
          onIncrementRep={incrementRep}
        />
        {abandonSheet}
      </View>
    );
  }

  // Progress through the steps; the review and completion states are "done".
  const progress =
    state === 'INTRO'
      ? 0
      : state === 'SESSION_REVIEW' || state === 'COMPLETE'
        ? 1
        : state === 'STEP_COMPLETE'
          ? (currentStepIndex + 1) / totalSteps
          : currentStepIndex / totalSteps;

  return (
    <SafeScreen edges={['top', 'bottom']}>
      <StatusBar style={statusBarStyle} />
      <TopBar onClose={handleExit} progress={progress} />

      {state === 'INTRO' && (
        <IntroView
          protocol={protocol}
          courseTitle={activePlan?.courseTitle ?? null}
          dogName={dogName}
          showModeChoice={protocol.supportsLiveAiTrainer}
          onStart={handleStart}
          onChooseMode={handleChooseMode}
        />
      )}

      {state === 'STEP_ACTIVE' && currentStep && (
        <StepActiveView
          step={currentStep}
          stepNumber={currentStepIndex + 1}
          totalSteps={totalSteps}
          activeSession={activeSession}
          resumedNotice={resumedNotice}
          onBack={goToPreviousStep}
          onHelp={() => setShowHelpSheet(true)}
          onToggleTimer={() => {
            activeSession.isTimerRunning ? pauseTimer() : startTimer();
          }}
          onResetTimer={() => {
            if (currentStep.durationSeconds) resetTimer(currentStep.durationSeconds);
          }}
          onIncrementRep={incrementRep}
          onResetReps={resetReps}
          onStepDone={handleStepDone}
        />
      )}

      {state === 'STEP_COMPLETE' && (
        <StepCompleteView
          stepNumber={currentStepIndex + 1}
          totalSteps={totalSteps}
          outcome={lastStepOutcome}
          nextStep={protocol.steps[currentStepIndex + 1]}
          onNext={handleNextStep}
          onUndo={handleUndoStep}
        />
      )}

      {state === 'SESSION_REVIEW' && (
        <PostSessionReflectionCard
          dogName={dogName}
          durationLabel={`${formatDuration(getTrainingSeconds())} trained`}
          successCriteria={protocol.successCriteria}
          stepSummaryLabel={
            scoredStepSummary.total > 0
              ? `${scoredStepSummary.success} of ${scoredStepSummary.total} steps worked`
              : null
          }
          questions={reflectionQuestions}
          answers={reflectionAnswers}
          outcome={reviewOutcome}
          notes={reviewNotes}
          onSelectOutcome={handleSelectOutcome}
          onAnswer={(qId, value) => setReflectionAnswers((prev) => applyReflectionAnswer(prev, qId, value))}
          onNotesChange={setReviewNotes}
          onSubmit={handleSubmitSession}
          isSaving={isSaving}
          saveError={saveError}
        />
      )}

      {state === 'COMPLETE' && (
        <CompleteView
          outcome={reviewOutcome ?? 'met'}
          totalReps={totalReps}
          trainingSeconds={getTrainingSeconds()}
          onBack={() => {
            clearSession();
            router.replace('/(tabs)/train');
          }}
        />
      )}

      {currentStep && (
        <StepHelpSheet
          visible={showHelpSheet}
          onClose={() => setShowHelpSheet(false)}
          protocol={protocol}
          step={currentStep}
          stepNumber={currentStepIndex + 1}
          dogName={dogName}
          onSkipStep={() => handleStepDone('skipped')}
        />
      )}

      {abandonSheet}
    </SafeScreen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Top bar: leave + step progress. The screen is a fullScreenModal with no
// native header, so this is the only chrome it draws.
// ─────────────────────────────────────────────────────────────────────────────

function TopBar({ onClose, progress }: { onClose: () => void; progress: number }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingLeft: spacing.sm,
        paddingRight: spacing.lg,
      }}
    >
      <IconButton icon="close" accessibilityLabel="Leave session" tone="secondary" onPress={onClose} />
      <ProgressBar progress={progress} accessibilityLabel="Session progress" style={{ flex: 1 }} />
    </View>
  );
}

function LoadingSkeleton() {
  return (
    <View style={{ padding: spacing.lg, gap: spacing.xl }} accessibilityLabel="Loading session">
      <View style={{ gap: spacing.sm }}>
        <SkeletonBlock height={20} width="40%" />
        <SkeletonBlock height={30} width="80%" />
        <SkeletonBlock height={22} width="95%" />
        <SkeletonBlock height={22} width="70%" />
      </View>
      <SkeletonBlock height={156} borderRadius={radii.md} />
      <Text variant="caption">Loading session</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INTRO — overview + "before you start" in one screen
// ─────────────────────────────────────────────────────────────────────────────

interface IntroViewProps {
  protocol: Protocol;
  courseTitle: string | null;
  dogName: string;
  showModeChoice: boolean;
  onStart: () => void;
  onChooseMode: () => void;
}

function IntroView({ protocol, courseTitle, dogName, showModeChoice, onStart, onChooseMode }: IntroViewProps) {
  const checklist = buildChecklist(protocol.equipmentNeeded);
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: spacing.sm }}>
          {courseTitle ? <Text variant="caption">{courseTitle}</Text> : null}
          <Text variant="h1">{protocol.title}</Text>
          <Text variant="body">{protocol.objective}</Text>
          <Text variant="caption">
            {protocol.durationMinutes} min, {protocol.steps.length} steps
          </Text>
        </View>

        <View>
          <SectionHeader title={`Today's goal for ${dogName}`} />
          <Text variant="body">{protocol.successCriteria}</Text>
        </View>

        <View>
          <SectionHeader title="Before you start" />
          <ListGroup>
            {checklist.map((item) => (
              <ListRow key={item} icon="checkmark-circle-outline" title={item} />
            ))}
            {protocol.equipmentNeeded.map((item) => (
              <ListRow key={`equipment-${item}`} icon="cube-outline" iconTone="secondary" title={item} />
            ))}
          </ListGroup>
        </View>

        {protocol.trainerNote ? (
          <Card style={{ gap: spacing.xs }}>
            <Text variant="caption">From the coach</Text>
            <Text variant="body">{protocol.trainerNote}</Text>
          </Card>
        ) : null}
      </ScrollView>

      <View style={{ padding: spacing.lg, gap: spacing.sm }}>
        <Button label="Start session" icon="play" onPress={onStart} />
        {showModeChoice ? <Button label="Choose how to train" variant="secondary" onPress={onChooseMode} /> : null}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP_ACTIVE
// ─────────────────────────────────────────────────────────────────────────────

interface StepActiveViewProps {
  step: ProtocolStep;
  stepNumber: number;
  totalSteps: number;
  activeSession: ActiveSession;
  resumedNotice: boolean;
  onBack: () => void;
  onHelp: () => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onIncrementRep: () => void;
  onResetReps: () => void;
  onStepDone: (outcome: StepOutcome) => void;
}

function StepActiveView({
  step,
  stepNumber,
  totalSteps,
  activeSession,
  resumedNotice,
  onBack,
  onHelp,
  onToggleTimer,
  onResetTimer,
  onIncrementRep,
  onResetReps,
  onStepDone,
}: StepActiveViewProps) {
  const hasTimer = !!step.durationSeconds;
  const hasReps = !!step.reps;
  const setupStep = isSetupStep(step);
  const timerDone = hasTimer && activeSession.timerSeconds === 0 && !activeSession.isTimerRunning;
  const timerUntouched = !activeSession.isTimerRunning && activeSession.timerSeconds === step.durationSeconds;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {resumedNotice ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }} accessibilityLiveRegion="polite">
            <AppIcon name="refresh" size={16} color={colors.text.secondary} />
            <Text variant="caption">Picked up where you left off.</Text>
          </View>
        ) : null}

        <StepCard step={step} stepNumber={stepNumber} totalSteps={totalSteps} />

        {hasTimer && (
          <View style={{ gap: spacing.lg }}>
            <TimerRing totalSeconds={step.durationSeconds!} currentSeconds={activeSession.timerSeconds} size={160} />
            <View style={{ gap: spacing.xs }}>
              <Text
                variant="display"
                color={timerDone ? colors.accent : colors.text.primary}
                accessibilityLiveRegion={timerDone ? 'polite' : 'none'}
              >
                {formatTimer(activeSession.timerSeconds)}
              </Text>
              <Text variant="caption">
                {activeSession.isTimerRunning ? 'Running' : timerDone ? 'Time’s up' : 'Start the timer when you’re ready'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Button
                label={activeSession.isTimerRunning ? 'Pause timer' : timerDone ? 'Timer finished' : 'Start timer'}
                icon={activeSession.isTimerRunning ? 'pause' : 'play'}
                size="md"
                onPress={onToggleTimer}
                disabled={timerDone}
              />
              <Button label="Reset timer" variant="ghost" size="md" onPress={onResetTimer} disabled={timerUntouched} />
            </View>
          </View>
        )}

        {hasReps && (
          <View style={{ gap: spacing.sm }}>
            <RepCounter
              count={activeSession.repCount}
              target={step.reps}
              onIncrement={onIncrementRep}
              onReset={onResetReps}
            />
            <Text variant="caption">Counting is optional. What matters is whether it worked.</Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          <Button label="Help with this step" icon="help-circle-outline" variant="ghost" size="md" onPress={onHelp} />
          <Button
            label={stepNumber > 1 ? 'Previous step' : 'Back to overview'}
            icon="chevron-back"
            variant="ghost"
            size="md"
            onPress={onBack}
          />
        </View>
      </ScrollView>

      <View style={{ padding: spacing.lg, gap: spacing.sm }}>
        {setupStep ? (
          <Button label="Next step" onPress={() => onStepDone('success')} />
        ) : (
          <>
            <Button label="It worked" icon="checkmark" onPress={() => onStepDone('success')} />
            <Button label="Didn’t quite work" variant="secondary" onPress={() => onStepDone('struggled')} />
          </>
        )}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP_COMPLETE — brief, undoable, outcome-aware. The handler moves on.
// ─────────────────────────────────────────────────────────────────────────────

interface StepCompleteViewProps {
  stepNumber: number;
  totalSteps: number;
  outcome: StepOutcome;
  nextStep: ProtocolStep | undefined;
  onNext: () => void;
  onUndo: () => void;
}

function StepCompleteView({ stepNumber, totalSteps, outcome, nextStep, onNext, onUndo }: StepCompleteViewProps) {
  const isLast = !nextStep;
  const struggled = outcome === 'struggled';

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }} showsVerticalScrollIndicator={false}>
        <AppIcon
          name={struggled ? 'bookmark-outline' : 'checkmark-circle'}
          size={40}
          color={struggled ? colors.text.secondary : colors.accent}
        />
        <View style={{ gap: spacing.sm }}>
          <Text variant="h1">{struggled ? `Step ${stepNumber} noted` : `Step ${stepNumber} done`}</Text>
          <Text variant="body">
            {struggled
              ? 'Struggles are useful data. Your plan will factor it in.'
              : isLast
                ? 'That was the last step.'
                : `${totalSteps - stepNumber} to go.`}
          </Text>
        </View>

        {nextStep ? (
          <View>
            <SectionHeader title="Next step" />
            <Text variant="body">{nextStep.instruction}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={{ padding: spacing.lg, gap: spacing.sm }}>
        <Button label={isLast ? 'Review session' : 'Next step'} onPress={onNext} />
        <Button label="Undo" variant="ghost" onPress={onUndo} accessibilityLabel="Undo, go back to this step" />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE — the one orchestrated moment
// ─────────────────────────────────────────────────────────────────────────────

interface CompleteViewProps {
  outcome: SessionOutcome;
  totalReps: number;
  trainingSeconds: number;
  onBack: () => void;
}

const OUTCOME_LABEL: Record<SessionOutcome, string> = {
  met: 'Goal met',
  partial: 'Mostly met',
  not_met: 'Not yet',
};

function CompleteView({ outcome, totalReps, trainingSeconds, onBack }: CompleteViewProps) {
  const reducedMotion = useReducedMotion();
  const reveal = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;

  // Draws in once when the complete state is entered; instant under reduced motion.
  useEffect(() => {
    if (reducedMotion) {
      reveal.setValue(1);
      return;
    }
    Animated.timing(reveal, { toValue: 1, duration: durations.base, useNativeDriver: true }).start();
  }, [reducedMotion, reveal]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            alignItems: 'center',
            gap: spacing.lg,
            opacity: reveal,
            transform: [{ scale: reveal.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
          }}
        >
          <MascotCallout state="celebrating" size={120} />
          <View style={{ alignItems: 'center', gap: spacing.sm }}>
            <Text variant="display" style={{ textAlign: 'center' }} accessibilityRole="header">
              Session complete
            </Text>
            <Text variant="body" color={colors.text.secondary} style={{ textAlign: 'center' }}>
              Your plan will adjust from what happened today.
            </Text>
          </View>
        </Animated.View>

        <ListGroup>
          <ListRow title="Reps" trailing={`${totalReps}`} />
          <ListRow title="Time" trailing={formatDuration(trainingSeconds)} />
          <ListRow title="Outcome" trailing={OUTCOME_LABEL[outcome]} />
        </ListGroup>
      </ScrollView>

      <View style={{ padding: spacing.lg }}>
        <Button label="Back to today" onPress={onBack} />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Abandon sheet — honest about what happens
// ─────────────────────────────────────────────────────────────────────────────

function AbandonSheet({
  visible,
  willRecord,
  stepsDone,
  totalSteps,
  onKeepGoing,
  onLeave,
}: {
  visible: boolean;
  willRecord: boolean;
  stepsDone: number;
  totalSteps: number;
  onKeepGoing: () => void;
  onLeave: () => void;
}) {
  useEffect(() => {
    if (visible) haptics.warning();
  }, [visible]);

  const body = willRecord
    ? stepsDone > 0
      ? `You've done ${stepsDone} of ${totalSteps} steps. It will be saved as unfinished so your plan can adjust.`
      : 'This will be noted as an unfinished attempt so your plan can adjust.'
    : 'Nothing has been recorded yet. Come back whenever you and your dog are ready.';

  return (
    <BottomSheet visible={visible} onClose={onKeepGoing} title="Leave this session?">
      <View style={{ flex: 1, gap: spacing.xl }}>
        <Text variant="body">{body}</Text>
        <View style={{ gap: spacing.sm }}>
          <Button label="Leave session" variant="destructive" onPress={onLeave} />
          <Button label="Keep training" variant="ghost" onPress={onKeepGoing} />
        </View>
      </View>
    </BottomSheet>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LiveAiTrainerScreen
//
// Self-contained sub-screen that mounts useLiveAiTrainerSession and
// delegates UI to LiveAiTrainerOverlay.  Reports its usage summary to the
// parent on unmount so every exit path is recorded.
// ─────────────────────────────────────────────────────────────────────────────

interface LiveAiTrainerScreenProps {
  protocol: Protocol;
  dogId: string;
  planId: string;
  sessionId: string;
  currentStepIndex: number;
  repCount: number;
  timerSeconds: number;
  isTimerRunning: boolean;
  onSummary: (summary: LiveAiTrainerSummary) => void;
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
  onSummary,
  onExit,
  onManualSwitch,
  onStepDone,
  onToggleTimer,
  onIncrementRep,
}: LiveAiTrainerScreenProps) {
  const [autoRepPulse, setAutoRepPulse] = useState(0);

  const handleAutoRep = useCallback(() => {
    onIncrementRep();
    setAutoRepPulse((n) => n + 1);
    haptics.selection();
  }, [onIncrementRep]);

  const coaching = useLiveAiTrainerSession({
    protocol,
    dogId,
    planId,
    sessionId,
    currentStepIndex,
    repCount,
    onAutoRep: handleAutoRep,
    onFallback: () => haptics.warning(),
  });

  const onSummaryRef = useRef(onSummary);
  onSummaryRef.current = onSummary;
  const getSummaryRef = useRef(coaching.getSummary);
  getSummaryRef.current = coaching.getSummary;

  useEffect(() => {
    coaching.start();
    return () => {
      coaching.stop();
      onSummaryRef.current(getSummaryRef.current());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      error={coaching.error}
      fallbackReason={coaching.fallbackReason}
      speechEnabled={coaching.speechEnabled}
      onToggleSpeech={coaching.toggleSpeech}
      cameraRef={coaching.cameraRef}
      onExit={onExit}
      onAskCoach={coaching.askCoach}
      onAnalyzeFrame={coaching.analyzeFrame}
      onManualSwitch={onManualSwitch}
      onKeepTrying={coaching.resume}
      onStepDone={onStepDone}
      step={stepInfo}
      repCount={repCount}
      autoRepPulse={autoRepPulse}
      timerSeconds={timerSeconds}
      isTimerRunning={isTimerRunning}
      onToggleTimer={onToggleTimer}
      onIncrementRep={onIncrementRep}
    />
  );
}
