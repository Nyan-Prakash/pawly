import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { StepHelpSheet } from '@/components/session/StepHelpSheet';
import { SessionModePicker } from '@/components/session/SessionModePicker';
import { LiveAiTrainerOverlay } from '@/components/vision/LiveAiTrainerOverlay';
import { colors } from '@/constants/colors';
import { getCourseUiColors, hexToRgba, type CourseUiColors } from '@/constants/courseColors';
import { spacing } from '@/constants/spacing';
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
  const insets = useSafeAreaInsets();

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
  const [completedSessionCount, setCompletedSessionCount] = useState(0);
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
      setLoadError('This session was not found in your active plan.');
      return;
    }

    let isCancelled = false;
    setLoadError(null);

    Promise.all([fetchProtocol(planSession.exerciseId), loadSessionSnapshot()]).then(
      ([protocol, snapshot]) => {
        if (isCancelled) return;
        if (!protocol) {
          setLoadError('We could not load this session protocol.');
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

    const completedCount = activePlan.sessions.filter((s) => s.isCompleted).length;
    setCompletedSessionCount(completedCount + 1); // +1 for this session

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
  // The old code built them on entering review, before the handler had
  // answered anything, so the engine always saw "okay".

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

  /** Manual mode: record the outcome, then either celebrate or move straight on. */
  const handleStepDone = useCallback(
    (outcome: StepOutcome) => {
      const recorded = recordStep(outcome);
      if (!recorded) return;
      setShowHelpSheet(false);

      // Setup-style steps and skips don't get a celebration — there is nothing
      // to celebrate, and the interstitial only slows the handler down.
      if (isSetupStep(recorded.step) || outcome === 'skipped') {
        Vibration.vibrate(40);
        advanceToNextStep();
        return;
      }

      Vibration.vibrate(outcome === 'success' ? [0, 60, 40, 120] : [0, 60]);
      setLastStepOutcome(outcome);
      setState('STEP_COMPLETE');
    },
    [recordStep, advanceToNextStep, setState],
  );

  const handleNextStep = useCallback(() => advanceToNextStep(), [advanceToNextStep]);

  const handleUndoStep = useCallback(() => {
    Vibration.vibrate(30);
    undoLastStep();
  }, [undoLastStep]);

  // Live AI Trainer: no interstitial; record + advance immediately.
  const handleLiveStepDone = useCallback(() => {
    const recorded = recordStep('success');
    if (!recorded) return;
    Vibration.vibrate(recorded.isLast ? [0, 60, 40, 120, 40, 200] : [0, 60, 40, 120]);
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
      const message = e instanceof Error ? e.message : 'Something went wrong while saving.';
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

  // ── Intro → training (or mode picker) ─────────────────────────────────────

  const handleStart = useCallback(() => {
    if (activeSession?.protocol.supportsLiveAiTrainer) {
      setOverlayState('MODE_PICKER');
    } else {
      beginTraining();
    }
  }, [activeSession?.protocol, beginTraining]);

  // ─────────────────────────────────────────────────────────────────────────
  // Back press guard
  // ─────────────────────────────────────────────────────────────────────────

  const handleExit = () => {
    if (!activeSession || activeSession.state === 'COMPLETE') {
      clearSession();
      router.replace('/(tabs)/train');
      return;
    }
    // Nothing recorded yet → just leave. No guilt, no bogus log.
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

  const courseTheme = getCourseUiColors(activePlan ?? { id: sessionId ?? 'session-fallback' });

  if (!activeSession || activeSession.state === 'LOADING') {
    return <LoadingView insets={insets} error={loadError} onBack={() => router.back()} theme={courseTheme} />;
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
      </View>
    );
  }

  if (overlayState === 'LIVE_COACHING') {
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
        <AbandonSheet
          visible={showAbandonSheet}
          willRecord={abandonWouldLog}
          stepsDone={stepSummary.total}
          totalSteps={totalSteps}
          onKeepGoing={() => setShowAbandonSheet(false)}
          onLeave={handleAbandonConfirm}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />

      {state === 'INTRO' && (
        <IntroView
          protocol={protocol}
          dogName={dogName}
          theme={courseTheme}
          insets={insets}
          onBack={handleExit}
          onStart={handleStart}
        />
      )}

      {state === 'STEP_ACTIVE' && currentStep && (
        <StepActiveView
          step={currentStep}
          stepNumber={currentStepIndex + 1}
          totalSteps={totalSteps}
          activeSession={activeSession}
          theme={courseTheme}
          resumedNotice={resumedNotice}
          onBack={goToPreviousStep}
          onExit={handleExit}
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
          insets={insets}
        />
      )}

      {state === 'STEP_COMPLETE' && (
        <StepCompleteView
          stepNumber={currentStepIndex + 1}
          totalSteps={totalSteps}
          outcome={lastStepOutcome}
          nextStep={protocol.steps[currentStepIndex + 1]}
          theme={courseTheme}
          onNext={handleNextStep}
          onUndo={handleUndoStep}
          insets={insets}
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
          insets={insets}
          theme={courseTheme}
        />
      )}

      {state === 'COMPLETE' && (
        <CompleteView
          dogName={dogName}
          outcome={reviewOutcome ?? 'met'}
          completedSessionCount={completedSessionCount}
          totalSessions={activePlan?.sessions.length ?? 0}
          trainingSeconds={getTrainingSeconds()}
          nextSessionTitle={findNextSessionTitle(activePlan?.sessions ?? [], activeSession.sessionId)}
          theme={courseTheme}
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
          dogName={dogName}
          accentColor={courseTheme.solid}
          onSkipStep={() => handleStepDone('skipped')}
        />
      )}

      <AbandonSheet
        visible={showAbandonSheet}
        willRecord={abandonWouldLog}
        stepsDone={stepSummary.total}
        totalSteps={totalSteps}
        onKeepGoing={() => setShowAbandonSheet(false)}
        onLeave={handleAbandonConfirm}
      />
    </View>
  );
}

function findNextSessionTitle(
  sessions: { id: string; title: string; isCompleted: boolean }[],
  currentId: string,
): string | null {
  const idx = sessions.findIndex((s) => s.id === currentId);
  const after = idx >= 0 ? sessions.slice(idx + 1) : sessions;
  return after.find((s) => !s.isCompleted && s.id !== currentId)?.title ?? null;
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
        gap: spacing.md,
      }}
    >
      <AppIcon name="paw" size={48} color={accentColor} />
      {!error && <ActivityIndicator size="large" color={accentColor} />}
      <Text style={{ marginTop: spacing.sm, color: colors.textSecondary, fontSize: 16, textAlign: 'center', paddingHorizontal: spacing.xl }}>
        {error ?? 'Getting your session ready...'}
      </Text>
      {error && onBack ? (
        <Pressable
          onPress={onBack}
          style={({ pressed }) => ({
            marginTop: spacing.sm,
            opacity: pressed ? 0.7 : 1,
            minHeight: 44,
            justifyContent: 'center',
          })}
        >
          <Text style={{ color: accentColor, fontSize: 16, fontWeight: '600' }}>Back</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INTRO — overview + "before you start" in one screen
// ─────────────────────────────────────────────────────────────────────────────

interface IntroViewProps {
  protocol: Protocol;
  dogName: string;
  theme: CourseUiColors;
  insets: ReturnType<typeof useSafeAreaInsets>;
  onBack: () => void;
  onStart: () => void;
}

function IntroView({ protocol, dogName, theme, insets, onBack, onStart }: IntroViewProps) {
  const checklist = buildChecklist(protocol.equipmentNeeded);
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
        <BackButton onPress={onBack} label="Close" icon="close" />

        <View style={{ gap: spacing.sm }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary, lineHeight: 36 }}>
            {protocol.title}
          </Text>
          <Text style={{ fontSize: 16, lineHeight: 24, color: colors.textSecondary }}>{protocol.objective}</Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          <Chip label={`${protocol.durationMinutes} min`} icon="time" color={theme.solid} textColor={theme.text} />
          <Chip label={`${protocol.steps.length} steps`} icon="list" color={theme.solid} textColor={theme.text} />
        </View>

        {/* Goal — the same criterion the review will ask about */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border.default,
            gap: spacing.xs,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <AppIcon name="flag" size={14} color={theme.text} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Today's goal for {dogName}
            </Text>
          </View>
          <Text style={{ fontSize: 15, lineHeight: 22, color: colors.textPrimary }}>{protocol.successCriteria}</Text>
        </View>

        {/* Before you start */}
        <View style={{ gap: spacing.sm }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Before you start
          </Text>
          <View style={{ gap: spacing.sm }}>
            {checklist.map((item) => (
              <View key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <AppIcon name="checkmark-circle" size={18} color={theme.solid} />
                <Text style={{ fontSize: 15, color: colors.textPrimary, lineHeight: 22 }}>{item}</Text>
              </View>
            ))}
          </View>
          {protocol.equipmentNeeded.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs }}>
              {protocol.equipmentNeeded.map((item) => (
                <Chip key={item} label={item} color={colors.secondary} textColor={colors.textPrimary} />
              ))}
            </View>
          )}
        </View>

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
            <Text style={{ fontSize: 15, lineHeight: 22, color: colors.textPrimary }}>{protocol.trainerNote}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.md,
          paddingTop: spacing.md,
          backgroundColor: colors.background,
        }}
      >
        <Button
          label="Start session"
          leftIcon="play"
          onPress={onStart}
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
// STEP_ACTIVE
// ─────────────────────────────────────────────────────────────────────────────

interface StepActiveViewProps {
  step: ProtocolStep;
  stepNumber: number;
  totalSteps: number;
  activeSession: ActiveSession;
  theme: CourseUiColors;
  resumedNotice: boolean;
  onBack: () => void;
  onExit: () => void;
  onHelp: () => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onIncrementRep: () => void;
  onResetReps: () => void;
  onStepDone: (outcome: StepOutcome) => void;
  insets: ReturnType<typeof useSafeAreaInsets>;
}

function StepActiveView({
  step,
  stepNumber,
  totalSteps,
  activeSession,
  theme,
  resumedNotice,
  onBack,
  onExit,
  onHelp,
  onToggleTimer,
  onResetTimer,
  onIncrementRep,
  onResetReps,
  onStepDone,
  insets,
}: StepActiveViewProps) {
  const hasTimer = !!step.durationSeconds;
  const hasReps = !!step.reps;
  const setupStep = isSetupStep(step);
  const timerDone = hasTimer && activeSession.timerSeconds === 0 && !activeSession.isTimerRunning;
  const timerUntouched = !activeSession.isTimerRunning && activeSession.timerSeconds === step.durationSeconds;
  const progressRatio = (stepNumber - 1) / totalSteps;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 4, backgroundColor: colors.border.default, marginTop: insets.top }}>
        <View style={{ height: 4, width: `${progressRatio * 100}%`, backgroundColor: theme.solid }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + 160,
          gap: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header row: back · step counter · help · exit */}
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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconTap name="help-circle-outline" label="Help with this step" onPress={onHelp} color={theme.text} />
            <IconTap name="close" label="Leave session" onPress={onExit} color={colors.textSecondary} />
          </View>
        </View>

        {resumedNotice ? (
          <View
            style={{
              backgroundColor: colors.status.infoBg,
              borderColor: colors.status.infoBorder,
              borderWidth: 1,
              borderRadius: 12,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
            }}
          >
            <AppIcon name="refresh" size={16} color={colors.textPrimary} />
            <Text style={{ fontSize: 14, color: colors.textPrimary }}>Picked up where you left off.</Text>
          </View>
        ) : null}

        <StepCard step={step} stepNumber={stepNumber} totalSteps={totalSteps} accentColor={theme.solid} />

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
            <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm }}>
              <TimerRing
                totalSeconds={step.durationSeconds!}
                currentSeconds={activeSession.timerSeconds}
                size={200}
                color={timerDone ? colors.success : theme.solid}
              />
              <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 40, fontWeight: '700', lineHeight: 46, color: timerDone ? colors.success : colors.textPrimary }}>
                  {formatTimer(activeSession.timerSeconds)}
                </Text>
                {timerDone && (
                  <Text style={{ fontSize: 13, color: colors.success, fontWeight: '600', marginTop: 4 }}>Done!</Text>
                )}
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
              <Pressable
                onPress={onResetTimer}
                disabled={timerUntouched}
                accessibilityLabel="Reset timer"
                style={({ pressed }) => ({
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: pressed ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.04)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: timerUntouched ? 0 : 1,
                })}
              >
                <AppIcon name="refresh" size={20} color={colors.textSecondary} />
              </Pressable>
              <Pressable
                onPress={onToggleTimer}
                accessibilityLabel={activeSession.isTimerRunning ? 'Pause timer' : 'Start timer'}
                style={({ pressed }) => ({
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: pressed
                    ? timerDone ? hexToRgba(colors.success, 0.85) : theme.selectedBorder
                    : timerDone ? colors.success : theme.solid,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: timerDone ? colors.success : theme.solid,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                })}
              >
                <AppIcon name={activeSession.isTimerRunning ? 'pause' : 'play'} size={28} color="#FFFFFF" />
              </Pressable>
              <View style={{ width: 48, height: 48 }} />
            </View>

            <Text style={{ fontSize: 14, fontWeight: '600', color: timerDone ? colors.success : colors.textSecondary, textAlign: 'center', letterSpacing: 0.3 }}>
              {activeSession.isTimerRunning ? 'Running…' : timerDone ? 'Time’s up' : 'Tap play when you’re ready'}
            </Text>
          </View>
        )}

        {hasReps && (
          <View style={{ gap: spacing.xs }}>
            <View style={{ height: 300 }}>
              <RepCounter
                count={activeSession.repCount}
                target={step.reps}
                onIncrement={onIncrementRep}
                onReset={onResetReps}
                accentColor={theme.solid}
              />
            </View>
            <Text style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center', lineHeight: 18 }}>
              Counting is optional — what matters is whether it worked.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Outcome CTA */}
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
          gap: spacing.sm,
        }}
      >
        {setupStep ? (
          <PrimaryCta label="Next" icon="arrow-forward" theme={theme} onPress={() => onStepDone('success')} />
        ) : (
          <>
            <PrimaryCta label="It worked" icon="checkmark" theme={theme} onPress={() => onStepDone('success')} />
            <Pressable
              onPress={() => onStepDone('struggled')}
              accessibilityRole="button"
              style={({ pressed }) => ({
                borderWidth: 1.5,
                borderColor: colors.border.strong,
                borderRadius: 14,
                minHeight: 50,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: pressed ? colors.bg.surfaceAlt : 'transparent',
              })}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>Didn’t quite work</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

function PrimaryCta({
  label,
  icon,
  theme,
  onPress,
}: {
  label: string;
  icon: AppIconName;
  theme: CourseUiColors;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
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
      <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text.primary }}>{label}</Text>
      <AppIcon name={icon} size={16} color={colors.text.primary} />
    </Pressable>
  );
}

function IconTap({
  name,
  label,
  onPress,
  color,
}: {
  name: AppIconName;
  label: string;
  onPress: () => void;
  color: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        opacity: pressed ? 0.6 : 1,
        minHeight: 44,
        minWidth: 44,
        alignItems: 'center',
        justifyContent: 'center',
      })}
    >
      <AppIcon name={name} size={24} color={color} />
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP_COMPLETE — brief, undoable, outcome-aware
// ─────────────────────────────────────────────────────────────────────────────

interface StepCompleteViewProps {
  stepNumber: number;
  totalSteps: number;
  outcome: StepOutcome;
  nextStep: ProtocolStep | undefined;
  theme: CourseUiColors;
  onNext: () => void;
  onUndo: () => void;
  insets: ReturnType<typeof useSafeAreaInsets>;
}

const ADVANCE_MS = 2500;

function StepCompleteView({ stepNumber, totalSteps, outcome, nextStep, theme, onNext, onUndo, insets }: StepCompleteViewProps) {
  const isLast = !nextStep;
  const struggled = outcome === 'struggled';
  const countdownAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isLast) return undefined;
    countdownAnim.setValue(1);
    const anim = Animated.timing(countdownAnim, { toValue: 0, duration: ADVANCE_MS, useNativeDriver: false });
    anim.start();
    const t = setTimeout(onNext, ADVANCE_MS);
    return () => {
      anim.stop();
      clearTimeout(t);
    };
  }, [isLast]);

  const nextStepLabel = nextStep
    ? nextStep.instruction.length > 48
      ? nextStep.instruction.slice(0, 48).replace(/\s\S+$/, '') + '…'
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
      <AppIcon
        name={struggled ? 'bookmark' : 'checkmark-circle'}
        size={64}
        color={struggled ? colors.accent : colors.success}
      />
      <View style={{ alignItems: 'center', gap: spacing.sm }}>
        <Text style={{ fontSize: 26, fontWeight: '700', lineHeight: 32, color: colors.textPrimary, textAlign: 'center' }}>
          {struggled ? `Step ${stepNumber} noted` : `Step ${stepNumber} done`}
        </Text>
        <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', lineHeight: 24 }}>
          {struggled
            ? 'Struggles are useful data. Your plan will factor it in.'
            : isLast
              ? 'That was the last step.'
              : `${totalSteps - stepNumber} to go.`}
        </Text>
      </View>

      {isLast ? (
        <PrimaryCta label="Wrap up" icon="arrow-forward" theme={theme} onPress={onNext} />
      ) : (
        <View style={{ alignItems: 'center', gap: spacing.md, width: '100%' }}>
          <Text style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center' }}>Next: {nextStepLabel}</Text>
          <PrimaryCta label="Next step" icon="arrow-forward" theme={theme} onPress={onNext} />
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
        </View>
      )}

      <Pressable
        onPress={onUndo}
        accessibilityRole="button"
        accessibilityLabel="Undo, go back to this step"
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          minHeight: 44,
          paddingHorizontal: spacing.md,
          opacity: pressed ? 0.5 : 1,
        })}
      >
        <AppIcon name="arrow-undo" size={16} color={colors.textSecondary} />
        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textSecondary }}>Oops, undo</Text>
      </Pressable>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE
// ─────────────────────────────────────────────────────────────────────────────

interface CompleteViewProps {
  dogName: string;
  outcome: SessionOutcome;
  completedSessionCount: number;
  totalSessions: number;
  trainingSeconds: number;
  nextSessionTitle: string | null;
  theme: CourseUiColors;
  onBack: () => void;
}

function CompleteView({
  dogName,
  outcome,
  completedSessionCount,
  totalSessions,
  trainingSeconds,
  nextSessionTitle,
  theme,
  onBack,
}: CompleteViewProps) {
  const insets = useSafeAreaInsets();
  const headline =
    outcome === 'met'
      ? `${dogName} crushed it!`
      : outcome === 'partial'
        ? `Solid work, ${dogName}`
        : `Logged. ${dogName} will get there.`;
  const sub =
    outcome === 'met'
      ? 'Saved. Your plan will build on this.'
      : outcome === 'partial'
        ? 'Saved. Partial wins still count — your plan will adjust the next session.'
        : 'Saved. Sessions that don’t land are how the plan learns what to change.';

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
      <View style={{ alignItems: 'center', gap: spacing.md }}>
        <AppIcon name={outcome === 'not_met' ? 'bookmark' : 'ribbon'} size={72} color={theme.solid} />
        <Text style={{ fontSize: 30, fontWeight: '800', color: theme.text, textAlign: 'center', lineHeight: 40 }}>
          {headline}
        </Text>
        <Text style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 }}>{sub}</Text>
      </View>

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
        <StatRow emoji="time" label="Time trained" value={formatDuration(trainingSeconds)} color={theme.solid} />
        {nextSessionTitle && <StatRow emoji="arrow-forward" label="Next up" value={nextSessionTitle} color={theme.solid} />}
      </View>

      <Pressable
        onPress={onBack}
        accessibilityRole="button"
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
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }} numberOfLines={2}>{value}</Text>
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
  const insets = useSafeAreaInsets();
  const title = willRecord ? 'Leave this session?' : 'Leave for now?';
  const body = willRecord
    ? stepsDone > 0
      ? `You've done ${stepsDone} of ${totalSteps} steps. We'll save it as unfinished so your plan can adjust.`
      : "We'll note this as an unfinished attempt so your plan can adjust."
    : 'Nothing has been recorded yet. Come back whenever you and your dog are ready.';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onKeepGoing}>
      <Pressable style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(6,10,18,0.72)' }} onPress={onKeepGoing}>
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
          <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 999, backgroundColor: colors.borderColor, marginBottom: spacing.lg }} />

          <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: '#FEF3C7',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppIcon name="paw" size={32} color="#D97706" />
            </View>
          </View>

          <View style={{ alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl }}>
            <Text style={{ fontSize: 22, fontWeight: '800', lineHeight: 30, color: colors.textPrimary, textAlign: 'center', letterSpacing: -0.3 }}>
              {title}
            </Text>
            <Text style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 23, maxWidth: 300 }}>
              {body}
            </Text>
          </View>

          <View style={{ gap: spacing.sm }}>
            <Pressable onPress={onKeepGoing} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}>
              <View
                style={{
                  backgroundColor: colors.brand.primary,
                  borderRadius: 18,
                  paddingVertical: 17,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: spacing.sm,
                }}
              >
                <AppIcon name="paw" size={18} color="#fff" />
                <Text style={{ fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.1 }}>Keep going</Text>
              </View>
            </Pressable>

            <Pressable onPress={onLeave} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}>
              <View
                style={{
                  borderWidth: 1.5,
                  borderColor: willRecord ? colors.error : colors.border.strong,
                  borderRadius: 18,
                  paddingVertical: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: willRecord ? colors.error : colors.textPrimary }}>
                  {willRecord ? 'Leave and save as unfinished' : 'Leave'}
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

function BackButton({ onPress, label = 'Back', icon = 'chevron-back' }: { onPress: () => void; label?: string; icon?: AppIconName }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={label}
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
        <AppIcon name={icon} size={18} color={colors.textSecondary} />
        <Text style={{ fontSize: 16, color: colors.textSecondary }}>{label}</Text>
      </View>
    </Pressable>
  );
}

function Chip({ label, icon, color, textColor }: { label: string; icon?: AppIconName; color?: string; textColor?: string }) {
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
      {icon ? <AppIcon name={icon} size={14} color={chipTextColor} /> : null}
      <Text style={{ fontSize: 14, color: chipTextColor, fontWeight: '500' }}>{label}</Text>
    </View>
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
    Vibration.vibrate([0, 40, 30, 40]);
  }, [onIncrementRep]);

  const coaching = useLiveAiTrainerSession({
    protocol,
    dogId,
    planId,
    sessionId,
    currentStepIndex,
    repCount,
    onAutoRep: handleAutoRep,
    onFallback: () => Vibration.vibrate([0, 80, 60, 80]),
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

  useEffect(() => {
    if (coaching.lastResponse?.coachMessage) Vibration.vibrate(60);
  }, [coaching.lastResponse]);

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
