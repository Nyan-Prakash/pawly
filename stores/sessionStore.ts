import { create } from 'zustand';
import type { Protocol, ProtocolStep } from '@/constants/protocols';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type SessionState =
  | 'LOADING'
  | 'INTRO'
  | 'SETUP'
  | 'STEP_ACTIVE'
  | 'STEP_COMPLETE'
  | 'SESSION_REVIEW'
  | 'COMPLETE'
  | 'ABANDONED';

export interface StepResult {
  stepOrder: number;
  completed: boolean;
  durationSeconds: number;
  repCount: number;
}

export interface ActiveSession {
  sessionId: string;
  exerciseId: string;
  protocol: Protocol;
  startedAt: Date;
  currentStepIndex: number;
  stepResults: StepResult[];
  timerSeconds: number;
  repCount: number;
  isTimerRunning: boolean;
  state: SessionState;
}

interface SessionStore {
  activeSession: ActiveSession | null;

  startSession: (sessionId: string, exerciseId: string, protocol: Protocol) => void;
  setState: (state: SessionState) => void;
  completeStep: (result: StepResult) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (seconds: number) => void;
  incrementRep: () => void;
  resetReps: () => void;
  advanceToNextStep: () => void;
  submitSession: (
    difficulty: 'easy' | 'okay' | 'hard',
    notes: string,
    onComplete: (sessionId: string, durationSeconds: number) => Promise<void>
  ) => Promise<void>;
  abandonSession: () => void;
  tick: () => void;
  clearSession: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

export const useSessionStore = create<SessionStore>((set, get) => ({
  activeSession: null,

  startSession: (sessionId, exerciseId, protocol) => {
    set({
      activeSession: {
        sessionId,
        exerciseId,
        protocol,
        startedAt: new Date(),
        currentStepIndex: 0,
        stepResults: [],
        timerSeconds: protocol.steps[0]?.durationSeconds ?? 0,
        repCount: 0,
        isTimerRunning: false,
        state: 'INTRO',
      },
    });
  },

  setState: (state) => {
    set((s) => {
      if (!s.activeSession) return s;
      return { activeSession: { ...s.activeSession, state } };
    });
  },

  completeStep: (result) => {
    set((s) => {
      if (!s.activeSession) return s;
      return {
        activeSession: {
          ...s.activeSession,
          stepResults: [...s.activeSession.stepResults, result],
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

  submitSession: async (difficulty, notes, onComplete) => {
    const { activeSession } = get();
    if (!activeSession) return;

    const durationSeconds = Math.floor(
      (Date.now() - activeSession.startedAt.getTime()) / 1000
    );

    set((s) => {
      if (!s.activeSession) return s;
      return { activeSession: { ...s.activeSession, state: 'COMPLETE' } };
    });

    await onComplete(activeSession.sessionId, durationSeconds);
  },

  abandonSession: () => {
    set((s) => {
      if (!s.activeSession) return s;
      return { activeSession: { ...s.activeSession, state: 'ABANDONED' } };
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
}));
