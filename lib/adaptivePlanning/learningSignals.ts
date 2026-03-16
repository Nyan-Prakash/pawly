import type { Plan, PlanEnvironment, PlanSession } from '../../types/index.ts';

export type SessionStatus = 'completed' | 'abandoned';

export interface StepResultInput {
  stepOrder?: number;
  completed?: boolean;
  durationSeconds?: number;
  repCount?: number;
}

export interface SessionLogInput {
  id?: string;
  dog_id?: string;
  plan_id?: string | null;
  session_id?: string | null;
  exercise_id?: string | null;
  protocol_id?: string | null;
  success_score?: number | null;
  difficulty?: 'easy' | 'okay' | 'hard' | null;
  notes?: string | null;
  duration_seconds?: number | null;
  step_results?: StepResultInput[] | null;
  session_status?: SessionStatus | null;
  skill_id?: string | null;
  session_kind?: PlanSession['sessionKind'] | null;
  environment_tag?: string | null;
  completed_at?: string | null;
  created_at?: string | null;
}

export interface WalkLogInput {
  id?: string;
  dog_id?: string;
  quality?: 1 | 2 | 3 | null;
  duration_minutes?: number | null;
  notes?: string | null;
  goal_achieved?: boolean | null;
  logged_at?: string | null;
  created_at?: string | null;
}

export interface SessionLearningSignal {
  sourceId: string | null;
  dogId: string | null;
  planId: string | null;
  exerciseId: string | null;
  protocolId: string | null;
  skillId: string | null;
  sessionKind: PlanSession['sessionKind'] | null;
  occurredAt: string;
  durationSeconds: number;
  successScore: number;
  completed: boolean;
  abandoned: boolean;
  difficulty: 'easy' | 'okay' | 'hard';
  environmentTag: string;
  stepCompletionRate: number;
  repCountAverage: number;
  focusDemand: 'low' | 'moderate' | 'high';
  notesFlags: {
    distracted: boolean;
    tired: boolean;
    confident: boolean;
    frustrated: boolean;
    handlerTimingIssue: boolean;
    motivated: boolean;
    outdoors: boolean;
  };
  similarityKey: string;
  isRecoverySession: boolean;
}

export interface WalkLearningSignal {
  sourceId: string | null;
  dogId: string | null;
  occurredAt: string;
  quality: 1 | 2 | 3;
  qualityScore: number;
  durationMinutes: number;
  goalAchieved: boolean | null;
  notesFlags: {
    distracted: boolean;
    tired: boolean;
    calm: boolean;
    outdoors: boolean;
  };
}

export interface AggregatedRecentSignals {
  asOf: string;
  sessions: SessionLearningSignal[];
  walks: WalkLearningSignal[];
  plan: {
    id: string | null;
    behaviorGoal: string | null;
    currentStage: number | null;
    scheduleIntensity: string | null;
  };
  summary: {
    sessionCount: number;
    completedCount: number;
    abandonedCount: number;
    hardSessionCount: number;
    hardOutdoorCount: number;
    proofingCount: number;
    easySuccessStreak: number;
    avgSessionSuccess: number | null;
    avgSessionDurationMinutes: number | null;
    longSessionCount: number;
    abandonmentRate: number;
    indoorSuccessRate: number | null;
    outdoorSuccessRate: number | null;
    lowDistractionSuccessRate: number | null;
    inconsistencyIndex: number;
    recoverySessionCount: number;
    recoveryBounceRate: number | null;
    poorWalkCount: number;
    goodWalkCount: number;
    walkQualityAvg: number | null;
    walkQualityDelta: number;
    motivationDropInLongSessions: boolean;
    notableEnvironmentDeltas: Record<string, number>;
    warnings: string[];
  };
}

const DEFAULT_OCCURRENCE = new Date(0).toISOString();
const SESSION_WINDOW = 12;
const WALK_WINDOW = 10;

function clampScore(score: number): number {
  return Math.max(1, Math.min(5, Math.round(score)));
}

function difficultyToSuccess(
  difficulty: SessionLogInput['difficulty'],
  successScore: number | null | undefined,
): number {
  if (typeof successScore === 'number') return clampScore(successScore);
  if (difficulty === 'easy') return 5;
  if (difficulty === 'hard') return 2;
  return 3;
}

function inferEnvironmentTag(value?: string | null): string {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return 'unknown';
  if (normalized.includes('outdoors_high')) return 'outdoors_high_distraction';
  if (normalized.includes('outdoors_moderate')) return 'outdoors_moderate_distraction';
  if (normalized.includes('outdoor')) return 'outdoors_low_distraction';
  if (normalized.includes('indoors_moderate')) return 'indoors_moderate_distraction';
  if (normalized.includes('indoor')) return 'indoors_low_distraction';
  return normalized;
}

function parseNotesFlags(notes?: string | null) {
  const text = notes?.toLowerCase() ?? '';
  return {
    distracted: /\bdistract|\bpull|\blung|\bbark|\breact/.test(text),
    tired: /\btired|\bfatigue|\bover it|\btoo long|\bexhaust/.test(text),
    confident: /\bconfident|\bbrave|\bsettled|\bcalm/.test(text),
    frustrated: /\bfrustrat|\bstuck|\bquit|\bwouldn('|’)t engage/.test(text),
    handlerTimingIssue: /\bmy timing|\btoo slow|\binconsistent|\bi missed|\blate reward/.test(text),
    motivated: /\bmotivated|\beager|\bexcited|\bloved|\bengaged/.test(text),
    outdoors: /\boutdoor|\bpark|\bstreet|\bsidewalk|\byard/.test(text),
  };
}

function parseWalkNotesFlags(notes?: string | null) {
  const text = notes?.toLowerCase() ?? '';
  return {
    distracted: /\bdistract|\bpull|\blung|\breact|\bbark/.test(text),
    tired: /\btired|\bfatigue|\bslow/.test(text),
    calm: /\bcalm|\bsettled|\beasy|\bsmooth/.test(text),
    outdoors: /\boutdoor|\bpark|\bstreet|\bsidewalk|\byard/.test(text),
  };
}

function deriveFocusDemand(environmentTag: string, sessionKind: PlanSession['sessionKind'] | null): 'low' | 'moderate' | 'high' {
  if (sessionKind === 'proofing' || sessionKind === 'advance') return 'high';
  if (environmentTag.includes('high') || environmentTag.includes('moderate')) return 'high';
  if (environmentTag.includes('outdoors')) return 'moderate';
  return 'low';
}

function isRecoverySession(sessionKind: PlanSession['sessionKind'] | null, skillId?: string | null) {
  return sessionKind === 'regress'
    || sessionKind === 'detour'
    || Boolean(skillId?.includes('-r'))
    || Boolean(skillId?.includes('-d'));
}

function average(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function variance(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = average(values) ?? 0;
  return values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
}

function parseStage(currentStage?: string | null): number | null {
  if (!currentStage) return null;
  const match = currentStage.match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

export function extractSessionSignals(
  sessionLog: SessionLogInput,
  protocol?: { steps?: Array<{ order?: number }> } | null,
  planSessionContext?: Partial<PlanSession> | null,
): SessionLearningSignal {
  const status = sessionLog.session_status ?? 'completed';
  const stepResults = Array.isArray(sessionLog.step_results) ? sessionLog.step_results : [];
  const expectedSteps = Math.max(protocol?.steps?.length ?? stepResults.length, 1);
  const completedSteps = stepResults.filter((step) => step.completed !== false).length;
  const repCountAverage = average(stepResults.map((step) => step.repCount ?? 0).filter((value) => value > 0)) ?? 0;
  const notesFlags = parseNotesFlags(sessionLog.notes);
  const environmentTag = inferEnvironmentTag(
    sessionLog.environment_tag
      ?? planSessionContext?.environment
      ?? (notesFlags.outdoors ? 'outdoors_low_distraction' : 'indoors_low_distraction'),
  );
  const difficulty = sessionLog.difficulty ?? 'okay';

  return {
    sourceId: sessionLog.id ?? null,
    dogId: sessionLog.dog_id ?? null,
    planId: sessionLog.plan_id ?? null,
    exerciseId: sessionLog.exercise_id ?? null,
    protocolId: sessionLog.protocol_id ?? null,
    skillId: sessionLog.skill_id ?? planSessionContext?.skillId ?? null,
    sessionKind: sessionLog.session_kind ?? planSessionContext?.sessionKind ?? null,
    occurredAt: sessionLog.completed_at ?? sessionLog.created_at ?? DEFAULT_OCCURRENCE,
    durationSeconds: Math.max(sessionLog.duration_seconds ?? 0, 0),
    successScore: status === 'abandoned'
      ? 1
      : difficultyToSuccess(difficulty, sessionLog.success_score),
    completed: status === 'completed',
    abandoned: status === 'abandoned',
    difficulty,
    environmentTag,
    stepCompletionRate: Math.max(0, Math.min(1, completedSteps / expectedSteps)),
    repCountAverage,
    focusDemand: deriveFocusDemand(environmentTag, sessionLog.session_kind ?? planSessionContext?.sessionKind ?? null),
    notesFlags,
    similarityKey: `${sessionLog.skill_id ?? planSessionContext?.skillId ?? sessionLog.protocol_id ?? sessionLog.exercise_id ?? 'unknown'}:${environmentTag}`,
    isRecoverySession: isRecoverySession(sessionLog.session_kind ?? planSessionContext?.sessionKind ?? null, sessionLog.skill_id ?? planSessionContext?.skillId),
  };
}

export function extractWalkSignals(walkLog: WalkLogInput): WalkLearningSignal {
  const quality = walkLog.quality ?? 2;
  return {
    sourceId: walkLog.id ?? null,
    dogId: walkLog.dog_id ?? null,
    occurredAt: walkLog.logged_at ?? walkLog.created_at ?? DEFAULT_OCCURRENCE,
    quality,
    qualityScore: quality === 3 ? 5 : quality === 2 ? 3 : 1,
    durationMinutes: Math.max(walkLog.duration_minutes ?? 0, 0),
    goalAchieved: walkLog.goal_achieved ?? null,
    notesFlags: parseWalkNotesFlags(walkLog.notes),
  };
}

export function aggregateRecentSignals({
  sessions,
  walks,
  plan,
}: {
  sessions: SessionLogInput[];
  walks: WalkLogInput[];
  plan?: Plan | null;
}): AggregatedRecentSignals {
  const sessionSignals = sessions
    .map((session) => extractSessionSignals(session, null, findPlanSessionContext(plan, session.session_id ?? null)))
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, SESSION_WINDOW);
  const walkSignals = walks
    .map(extractWalkSignals)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, WALK_WINDOW);

  const completedSessions = sessionSignals.filter((session) => session.completed);
  const outdoorSessions = completedSessions.filter((session) => session.environmentTag.includes('outdoors'));
  const indoorSessions = completedSessions.filter((session) => session.environmentTag.includes('indoors'));
  const lowDistractionSessions = completedSessions.filter((session) => session.environmentTag.includes('low_distraction'));
  const hardOutdoorCount = sessionSignals.filter(
    (session) => session.environmentTag.includes('outdoors') && session.successScore <= 2,
  ).length;
  const longSessionCount = sessionSignals.filter((session) => session.durationSeconds >= 12 * 60).length;
  const proofingCount = sessionSignals.filter(
    (session) => session.sessionKind === 'proofing' || session.focusDemand === 'high',
  ).length;

  let easySuccessStreak = 0;
  for (const session of sessionSignals) {
    if (session.completed && session.successScore >= 4) easySuccessStreak += 1;
    else break;
  }

  const grouped = new Map<string, number[]>();
  for (const session of completedSessions) {
    const values = grouped.get(session.similarityKey) ?? [];
    values.push(session.successScore);
    grouped.set(session.similarityKey, values);
  }
  const inconsistencySamples = [...grouped.values()]
    .filter((values) => values.length >= 2)
    .map((values) => Math.min(1, variance(values) / 4));
  const inconsistencyIndex = average(inconsistencySamples) ?? 0;

  const environmentScores = new Map<string, number[]>();
  for (const session of completedSessions) {
    const scores = environmentScores.get(session.environmentTag) ?? [];
    scores.push(session.successScore);
    environmentScores.set(session.environmentTag, scores);
  }
  const baselineSuccess = average(completedSessions.map((session) => session.successScore)) ?? 3;
  const notableEnvironmentDeltas: Record<string, number> = {};
  for (const [environment, scores] of environmentScores.entries()) {
    const delta = (average(scores) ?? baselineSuccess) - baselineSuccess;
    if (Math.abs(delta) >= 0.35) notableEnvironmentDeltas[environment] = Number(delta.toFixed(2));
  }

  const recoverySessions = sessionSignals.filter((session) => session.isRecoverySession);
  const recoveryBounceRate = average(
    recoverySessions.map((session) => (session.completed && session.successScore >= 4 ? 1 : 0)),
  );
  const walkQualityAvg = average(walkSignals.map((walk) => walk.quality));
  const recentWalkAvg = average(walkSignals.slice(0, 3).map((walk) => walk.quality)) ?? walkQualityAvg ?? 2;
  const olderWalkAvg = average(walkSignals.slice(3, 6).map((walk) => walk.quality)) ?? walkQualityAvg ?? 2;
  const walkQualityDelta = Number((recentWalkAvg - olderWalkAvg).toFixed(2));
  const avgSessionDurationMinutes = average(sessionSignals.map((session) => session.durationSeconds / 60));
  const longSessionScores = sessionSignals
    .filter((session) => session.durationSeconds >= 12 * 60)
    .map((session) => session.successScore);
  const shortSessionScores = sessionSignals
    .filter((session) => session.durationSeconds > 0 && session.durationSeconds < 12 * 60)
    .map((session) => session.successScore);
  const motivationDropInLongSessions = (average(longSessionScores) ?? 3) + 0.75 < (average(shortSessionScores) ?? 3);

  const warnings: string[] = [];
  if (hardOutdoorCount >= 2) warnings.push('Recent outdoor sessions were substantially harder than indoor work.');
  if (longSessionCount >= 2 || sessionSignals.some((session) => session.abandoned)) {
    warnings.push('Recent sessions may be running a bit long for current stamina.');
  }
  if ((walkQualityAvg ?? 2) <= 1.5) warnings.push('Walk quality has been choppy, especially around distractions.');

  return {
    asOf: sessionSignals[0]?.occurredAt ?? walkSignals[0]?.occurredAt ?? new Date().toISOString(),
    sessions: sessionSignals,
    walks: walkSignals,
    plan: {
      id: plan?.id ?? null,
      behaviorGoal: plan?.goal ?? null,
      currentStage: parseStage(plan?.currentStage),
      scheduleIntensity: plan?.metadata?.intensity ?? null,
    },
    summary: {
      sessionCount: sessionSignals.length,
      completedCount: completedSessions.length,
      abandonedCount: sessionSignals.filter((session) => session.abandoned).length,
      hardSessionCount: sessionSignals.filter((session) => session.successScore <= 2).length,
      hardOutdoorCount,
      proofingCount,
      easySuccessStreak,
      avgSessionSuccess: average(completedSessions.map((session) => session.successScore)),
      avgSessionDurationMinutes,
      longSessionCount,
      abandonmentRate: sessionSignals.length
        ? sessionSignals.filter((session) => session.abandoned).length / sessionSignals.length
        : 0,
      indoorSuccessRate: average(indoorSessions.map((session) => (session.successScore >= 4 ? 1 : 0))),
      outdoorSuccessRate: average(outdoorSessions.map((session) => (session.successScore >= 4 ? 1 : 0))),
      lowDistractionSuccessRate: average(lowDistractionSessions.map((session) => (session.successScore >= 4 ? 1 : 0))),
      inconsistencyIndex: Number(inconsistencyIndex.toFixed(2)),
      recoverySessionCount: recoverySessions.length,
      recoveryBounceRate,
      poorWalkCount: walkSignals.filter((walk) => walk.quality === 1).length,
      goodWalkCount: walkSignals.filter((walk) => walk.quality === 3).length,
      walkQualityAvg,
      walkQualityDelta,
      motivationDropInLongSessions,
      notableEnvironmentDeltas,
      warnings,
    },
  };
}

function findPlanSessionContext(plan?: Plan | null, sessionId?: string | null): Partial<PlanSession> | null {
  if (!plan || !sessionId) return null;
  return plan.sessions.find((session) => session.id === sessionId) ?? null;
}

export function trimSignalsForWindow(
  sessions: SessionLogInput[],
  walks: WalkLogInput[],
  asOf: string,
) {
  return {
    sessions: sessions
      .filter((session) => (session.completed_at ?? session.created_at ?? DEFAULT_OCCURRENCE) <= asOf)
      .sort((a, b) => (b.completed_at ?? b.created_at ?? DEFAULT_OCCURRENCE).localeCompare(a.completed_at ?? a.created_at ?? DEFAULT_OCCURRENCE))
      .slice(0, SESSION_WINDOW),
    walks: walks
      .filter((walk) => (walk.logged_at ?? walk.created_at ?? DEFAULT_OCCURRENCE) <= asOf)
      .sort((a, b) => (b.logged_at ?? b.created_at ?? DEFAULT_OCCURRENCE).localeCompare(a.logged_at ?? a.created_at ?? DEFAULT_OCCURRENCE))
      .slice(0, WALK_WINDOW),
  };
}

export function planEnvironmentToTag(environment?: PlanEnvironment): string | null {
  return environment ? inferEnvironmentTag(environment) : null;
}
