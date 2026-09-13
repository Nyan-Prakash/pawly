import { router } from 'expo-router';

import { ListRow } from '@/components/ui/ListRow';
import { EXERCISE_TO_PROTOCOL, PROTOCOLS_BY_ID, type ProtocolStep } from '@/constants/protocols';
import type { Plan, PlanSession } from '@/types';

/** Quick reps never run more than this many reps of a step. */
export const QUICK_REP_TARGET = 5;

export type QuickRep = {
  planId: string;
  sessionId: string;
  stepIndex: number;
  step: ProtocolStep;
  protocolTitle: string;
};

/** Later session first: scheduledDate when both have one, else week then day. */
function isLater(a: PlanSession, b: PlanSession): boolean {
  if (a.scheduledDate && b.scheduledDate && a.scheduledDate !== b.scheduledDate) {
    return a.scheduledDate > b.scheduledDate;
  }
  if (a.weekNumber !== b.weekNumber) return a.weekNumber > b.weekNumber;
  return a.dayNumber > b.dayNumber;
}

/**
 * The step to rerun between sessions: from the most recently completed
 * session across the active plans, the step with the most reps. Null when no
 * completed session has a rep-based step.
 */
export function pickQuickRep(plans: Plan[]): QuickRep | null {
  const completed: { plan: Plan; session: PlanSession }[] = [];
  for (const plan of plans) {
    if (plan.status !== 'active') continue;
    for (const session of plan.sessions) {
      if (session.isCompleted) completed.push({ plan, session });
    }
  }
  completed.sort((a, b) => (isLater(a.session, b.session) ? -1 : isLater(b.session, a.session) ? 1 : 0));

  for (const { plan, session } of completed) {
    const protocol = PROTOCOLS_BY_ID[EXERCISE_TO_PROTOCOL[session.exerciseId] ?? session.exerciseId];
    if (!protocol) continue;

    let best: { index: number; step: ProtocolStep } | null = null;
    protocol.steps.forEach((step, index) => {
      if (step.reps == null || step.reps <= 0) return;
      if (!best || step.reps > (best.step.reps ?? 0)) best = { index, step };
    });
    if (!best) continue;

    const { index, step } = best as { index: number; step: ProtocolStep };
    return { planId: plan.id, sessionId: session.id, stepIndex: index, step, protocolTitle: protocol.title };
  }
  return null;
}

/** One-minute rerun of a step the dog already succeeded at. */
export function QuickRepsRow({ quickRep }: { quickRep: QuickRep }) {
  const { planId, sessionId, stepIndex, step } = quickRep;
  const target = Math.min(QUICK_REP_TARGET, step.reps ?? QUICK_REP_TARGET);

  return (
    <ListRow
      icon="repeat-outline"
      iconTone="accent"
      title={`Quick reps: ${step.instruction}`}
      subtitle={`${target} reps, about a minute`}
      trailing="chevron"
      accessibilityHint="Runs this one step and comes back here"
      onPress={() =>
        router.push(
          `/(tabs)/train/session?id=${sessionId}&planId=${planId}&mode=quick&step=${stepIndex}` as never,
        )
      }
    />
  );
}
