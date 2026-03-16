import type {
  AIPlannerOutput,
  AIPlanningSummary,
  AdaptivePlanMetadata,
  Dog,
  Plan,
  PlanSession,
  PlannerMode,
} from '../../types';
import type { SkillGraph } from './skillGraph';
import {
  buildWeeklySchedule,
  chooseTrainingDays,
  normalizeTrainingSchedulePrefs,
} from '../scheduleEngine';

const PLANNER_VERSION = '1.0.0';

export function compilePlan(
  output: AIPlannerOutput,
  dog: Dog,
  graph: SkillGraph,
  plannerMode: PlannerMode,
  validationWarnings: string[] = [],
): Plan {
  const sessionsPerWeek = output.sessionsPerWeek;
  const totalWeeks = output.planHorizonWeeks;

  // Flatten weekly structure into PlanSession records
  const rawSessions: PlanSession[] = [];
  let sessionIndex = 0;

  for (const week of output.weeklyStructure) {
    let dayInWeek = 0;
    for (const sel of week.skillSequence) {
      const node = graph.nodes.get(sel.skillId);
      const protocolId = node?.protocolId ?? sel.skillId;

      for (let rep = 0; rep < sel.sessionCount; rep++) {
        dayInWeek++;
        sessionIndex++;
        rawSessions.push({
          id: `session_${sessionIndex}`,
          exerciseId: protocolId,
          weekNumber: week.weekNumber,
          dayNumber: dayInWeek,
          title: node?.title ?? sel.skillId,
          durationMinutes: getDurationForSkill(node, dog.availableMinutesPerDay),
          isCompleted: false,
          skillId: sel.skillId,
          parentSkillId: null,
          environment: sel.environment,
          sessionKind: sel.sessionKind,
          adaptationSource: 'initial_plan',
          reasoningLabel: sel.reasoningLabel,
        });
      }
    }
  }

  // Apply schedule engine
  const prefs = normalizeTrainingSchedulePrefs(undefined, dog);
  const trainingDays = chooseTrainingDays({
    sessionsPerWeek,
    availableDaysPerWeek: dog.availableDaysPerWeek,
    prefs,
  });
  const scheduledSessions = buildWeeklySchedule({
    sessions: rawSessions,
    sessionsPerWeek,
    durationWeeks: totalWeeks,
    availableDaysPerWeek: dog.availableDaysPerWeek,
    availableMinutesPerDay: dog.availableMinutesPerDay,
    prefs,
    goal: dog.behaviorGoals[0],
  });

  const selectedSkillIds = [
    ...new Set(output.weeklyStructure.flatMap((w) => w.skillSequence.map((s) => s.skillId))),
  ];

  const metadata: AdaptivePlanMetadata = {
    plannerVersion: PLANNER_VERSION,
    plannerMode,
    planningSummary: output.planningSummary,
    selectedSkillIds,
    validationWarnings,
    scheduleExplanation: output.planningSummary.whyThisStart,
    scheduleVersion: dog.scheduleVersion,
    preferredDays: prefs.preferredTrainingDays,
    preferredWindows: prefs.preferredTrainingWindows,
    flexibility: prefs.scheduleFlexibility,
    intensity: prefs.scheduleIntensity,
    timezone: prefs.timezone,
  };

  // Determine starting stage from first skill
  const startingNode = graph.nodes.get(output.startingSkillId);
  const currentStage = startingNode
    ? `Stage ${startingNode.stage} — ${capitalize(startingNode.kind)}`
    : 'Stage 1 — Foundation';

  return {
    id: '',
    dogId: dog.id,
    goal: dog.behaviorGoals[0] ?? 'General Training',
    status: 'active',
    durationWeeks: totalWeeks,
    sessionsPerWeek,
    currentWeek: 1,
    currentStage,
    sessions: scheduledSessions,
    metadata,
    createdAt: new Date().toISOString(),
  };
}

function getDurationForSkill(node: { stage?: number } | undefined | null, availableMinutes: number): number {
  if (!node) return Math.min(availableMinutes, 10);
  const stage = node.stage ?? 1;
  // Foundation skills are shorter, proofing skills are longer
  const baseDuration = stage <= 1 ? 8 : stage <= 2 ? 10 : stage <= 3 ? 12 : 15;
  return Math.min(baseDuration, availableMinutes);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
