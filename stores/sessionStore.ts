import { create } from 'zustand';
import type { Protocol, ProtocolStep } from '@/constants/protocols';
import type { StepOutcome } from '@/lib/sessionScoring';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Session state machine.
 *
 *   LOADING → INTRO → STEP_ACTIVE ⇄ STEP_COMPLETE → … → SESSION_REVIEW → COMPLETE
 *                                                                   ↘ ABANDONED
 *
 * The old SETUP state was folded into INTRO: the checklist never gated
 * anything and cost an extra screen before the dog was involved.
 */
export type SessionState =
  | 'LOADING'
  | 'INTRO'
  | 'STEP_ACTIVE'
  | 'STEP_COMPLETE'
  | 'SESSION_REVIEW'
  | 'COMPLETE'
  | 'ABANDONED';

export interface StepResult {
  stepOrder: number;
  /** Kept for older readers; false only when the step was skipped. */
  completed: boolean;
  /** What actually happened. This is the signal the review + engine use. */
  outcome: StepOutcome;
  durationSeconds: number;
  repCount: number;
}

export interface ActiveSession {
  sessionId: string;
  exerciseId: string;
  protocol: Protocol;
  /** When the screen opened (intro included). */
  startedAt: Date;
  /** When the first step began — "time trained" is measured from here. */
  trainingStartedAt: Date | null;
  /** Frozen when the last step finishes so the review/complete screens don't keep counting. */
  trainingEndedAt: Date | null;
  currentStepIndex: number;
  stepResults: StepResult[];
  timerSeconds: number;
  repCount: number;
  isTimerRunning: boolean;
  state: SessionState;
}

export interface SessionRestoreData {
  startedAt: Date;
  trainingStartedAt: Date | null;
  /** When the snapshot was taken — used to freeze "time trained" on a resumed review. */
  savedAt: Date | null;
  currentStepIndex: number;
  stepResults: StepResult[];
  repCount: number;
  state: SessionState;
}

interface SessionStore {
  activeSession: ActiveSession | null;

  startSession: (
    sessionId: string,
    exerciseId: string,
    protocol: Protocol,
    restore?: SessionRestoreData,
  ) => void;
  setState: (state: SessionState) => void;
  beginTraining: () => void;
  completeStep: (result: StepResult) => void;
  /** Reverts the most recent completeStep and returns to that step. */
  undoLastStep: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (seconds: number) => void;
  incrementRep: () => void;
  resetReps: () => void;
  advanceToNextStep: () => void;
  goToPreviousStep: () => void;
  /**
   * Runs `onComplete` and only then moves to COMPLETE. If `onComplete`
   * throws, the state is left untouched so the review can show a retry.
   */
  submitSession: (onComplete: (sessionId: string, durationSeconds: number) => Promise<void>) => Promise<void>;
  abandonSession: () => void;
  tick: () => void;
  clearSession: () => void;
  /** Seconds actually spent training (first step → last step, or now). */
  getTrainingSeconds: () => number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

function trainingSeconds(s: ActiveSession, now: number = Date.now()): number {
  const start = (s.trainingStartedAt ?? s.startedAt).getTime();
  const end = s.trainingEndedAt?.getTime() ?? now;
  return Math.max(0, Math.floor((end - start) / 1000));
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  activeSession: null,

  startSession: (sessionId, exerciseId, protocol, restore) => {
    const lastIndex = Math.max(protocol.steps.length - 1, 0);
    let stepIndex = restore ? Math.min(Math.max(restore.currentStepIndex, 0), lastIndex) : 0;
    let restoredState: SessionState = restore ? restore.state : 'INTRO';

    // A snapshot taken on the celebration screen already holds that step's
    // result, so resume on the NEXT step (or the review if it was the last).
    if (restore && restore.state === 'STEP_COMPLETE') {
      if (stepIndex < lastIndex) {
        stepIndex += 1;
        restoredState = 'STEP_ACTIVE';
      } else {
        restoredState = 'SESSION_REVIEW';
      }
    }

    const step: ProtocolStep | undefined = protocol.steps[stepIndex];
    const trainingEndedAt =
      restore && restoredState === 'SESSION_REVIEW' ? restore.savedAt ?? new Date() : null;

    set({
      activeSession: {
        sessionId,
        exerciseId,
        protocol,
        startedAt: restore?.startedAt ?? new Date(),
        trainingStartedAt: restore?.trainingStartedAt ?? null,
        trainingEndedAt,
        currentStepIndex: stepIndex,
        stepResults: restore?.stepResults ?? [],
        timerSeconds: step?.durationSeconds ?? 0,
        repCount: restore?.repCount ?? 0,
        isTimerRunning: false,
        state: restoredState,
      },
    });
  },

  setState: (state) => {
    set((s) => {
      if (!s.activeSession) return s;
      return { activeSession: { ...s.activeSession, state } };
    });
  },

  beginTraining: () => {
    set((s) => {
      if (!s.activeSession) return s;
      return {
        activeSession: {
          ...s.activeSession,
          trainingStartedAt: s.activeSession.trainingStartedAt ?? new Date(),
          state: 'STEP_ACTIVE',
        },
      };
    });
  },

  completeStep: (result) => {
    set((s) => {
      if (!s.activeSession) return s;
      // Replace any existing result for the same step (e.g. after undo) so
      // going back and forth never produces duplicates.
      const others = s.activeSession.stepResults.filter((r) => r.stepOrder !== result.stepOrder);
      return {
        activeSession: {
          ...s.activeSession,
          stepResults: [...others, result].sort((a, b) => a.stepOrder - b.stepOrder),
        },
      };
    });
  },

  undoLastStep: () => {
    set((s) => {
      if (!s.activeSession) return s;
      const { protocol, currentStepIndex, stepResults } = s.activeSession;
      const step = protocol.steps[currentStepIndex];
      return {
        activeSession: {
          ...s.activeSession,
          stepResults: stepResults.filter((r) => r.stepOrder !== step?.order),
          timerSeconds: step?.durationSeconds ?? 0,
          isTimerRunning: false,
          state: 'STEP_ACTIVE',
        },
      };
    });
  },

  startTimer: () => {
    set((s) => {
      if (!s.activeSession) return s;
      return { activeSession: { ...s.activeSession, isTimerRunning: true } };
    });
  },

  pauseTimer: () => {
    set((s) => {
      if (!s.activeSession) return s;
      return { activeSession: { ...s.activeSession, isTimerRunning: false } };
    });
  },

  resetTimer: (seconds) => {
    set((s) => {
      if (!s.activeSession) return s;
      return {
        activeSession: {
          ...s.activeSession,
          timerSeconds: seconds,
          isTimerRunning: false,
        },
      };
    });
  },

  incrementRep: () => {
    set((s) => {
      if (!s.activeSession) return s;
      return { activeSession: { ...s.activeSession, repCount: s.activeSession.repCount + 1 } };
    });
  },

  resetReps: () => {
    set((s) => {
      if (!s.activeSession) return s;
      return { activeSession: { ...s.activeSession, repCount: 0 } };
    });
  },

  advanceToNextStep: () => {
    set((s) => {
      if (!s.activeSession) return s;
      const { protocol, currentStepIndex } = s.activeSession;
      const nextIndex = currentStepIndex + 1;
      const nextStep: ProtocolStep | undefined = protocol.steps[nextIndex];

      if (!nextStep) {
        return {
          activeSession: {
            ...s.activeSession,
            state: 'SESSION_REVIEW',
            isTimerRunning: false,
            trainingEndedAt: s.activeSession.trainingEndedAt ?? new Date(),
          },
        };
      }

      return {
        activeSession: {
          ...s.activeSession,
          currentStepIndex: nextIndex,
          timerSeconds: nextStep.durationSeconds ?? 0,
          repCount: 0,
          isTimerRunning: false,
          state: 'STEP_ACTIVE',
        },
      };
    });
  },

  goToPreviousStep: () => {
    set((s) => {
      if (!s.activeSession) return s;
      const { currentStepIndex, protocol } = s.activeSession;
      if (currentStepIndex <= 0) {
        return {
          activeSession: {
            ...s.activeSession,
            state: 'INTRO',
            isTimerRunning: false,
          },
        };
      }
      const prevIndex = currentStepIndex - 1;
      const prevStep = protocol.steps[prevIndex];
      return {
        activeSession: {
          ...s.activeSession,
          currentStepIndex: prevIndex,
          timerSeconds: prevStep?.durationSeconds ?? 0,
          repCount: 0,
          isTimerRunning: false,
          state: 'STEP_ACTIVE',
          // Drop the result for the step we're returning to so it can be redone.
          stepResults: s.activeSession.stepResults.filter((r) => r.stepOrder !== prevStep?.order),
        },
      };
    });
  },

  submitSession: async (onComplete) => {
    const { activeSession } = get();
    if (!activeSession) return;

    await onComplete(activeSession.sessionId, trainingSeconds(activeSession));

    set((s) => {
      if (!s.activeSession) return s;
      return { activeSession: { ...s.activeSession, state: 'COMPLETE', isTimerRunning: false } };
    });
  },

  abandonSession: () => {
    set((s) => {
      if (!s.activeSession) return s;
      return { activeSession: { ...s.activeSession, state: 'ABANDONED', isTimerRunning: false } };
    });
  },

  tick: () => {
    set((s) => {
      if (!s.activeSession) return s;
      if (!s.activeSession.isTimerRunning) return s;
      if (s.activeSession.timerSeconds <= 0) {
        return {
          activeSession: { ...s.activeSession, isTimerRunning: false, timerSeconds: 0 },
        };
      }
      return {
        activeSession: {
          ...s.activeSession,
          timerSeconds: s.activeSession.timerSeconds - 1,
        },
      };
    });
  },

  clearSession: () => {
    set({ activeSession: null });
  },

  getTrainingSeconds: () => {
    const { activeSession } = get();
    return activeSession ? trainingSeconds(activeSession) : 0;
  },
}));
