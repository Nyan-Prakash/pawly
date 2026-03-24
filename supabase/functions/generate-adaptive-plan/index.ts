import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4';

// ─────────────────────────────────────────────────────────────────────────────
// Types (server-side duplicates — Edge Functions are standalone)
// ─────────────────────────────────────────────────────────────────────────────

interface DogRow {
  id: string;
  name: string;
  breed: string | null;
  breed_group: string | null;
  age_months: number;
  sex: string | null;
  neutered: boolean;
  environment_type: string;
  behavior_goals: string[];
  training_experience: string;
  equipment: string[];
  lifecycle_stage: string;
  available_days_per_week: number;
  available_minutes_per_day: number;
  preferred_training_days: string[];
  preferred_training_windows: Record<string, string[]>;
  preferred_training_times: Record<string, string[]>;
  usual_walk_times: string[];
  session_style: string;
  schedule_flexibility: string;
  schedule_intensity: string;
  blocked_days: string[];
  blocked_dates: string[];
  schedule_notes: string | null;
  schedule_version: number;
  timezone: string;
}

interface SkillNodeRow {
  id: string;
  behavior: string;
  skill_code: string;
  title: string;
  description: string | null;
  stage: number;
  difficulty: number;
  kind: string;
  protocol_id: string | null;
  metadata: Record<string, unknown>;
  is_active: boolean;
}

interface SkillEdgeRow {
  id: string;
  from_skill_id: string;
  to_skill_id: string;
  edge_type: string;
  condition_summary: string | null;
  metadata: Record<string, unknown>;
}

interface AISkillSelection {
  skillId: string;
  sessionCount: number;
  environment: string;
  sessionKind: string;
  reasoningLabel: string;
}

interface AIWeekStructure {
  weekNumber: number;
  focus: string;
  skillSequence: AISkillSelection[];
}

interface AIPlannerOutput {
  primaryGoal: string;
  startingSkillId: string;
  planHorizonWeeks: number;
  sessionsPerWeek: number;
  weeklyStructure: AIWeekStructure[];
  planningSummary: {
    whyThisStart: string;
    keyAssumptions: string[];
    risksToWatch: string[];
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Schedule engine (server-side port of lib/scheduleEngine.ts)
// ─────────────────────────────────────────────────────────────────────────────

type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
type TimeWindow = 'early_morning' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'late_evening';
type ScheduleIntensity = 'gentle' | 'balanced' | 'aggressive';

interface TrainingSchedulePrefs {
  preferredTrainingDays: Weekday[];
  preferredTrainingWindows: Partial<Record<Weekday, TimeWindow[]>>;
  preferredTrainingTimes: Partial<Record<Weekday, string[]>>;
  usualWalkTimes: string[];
  sessionStyle: string;
  scheduleFlexibility: string;
  scheduleIntensity: ScheduleIntensity;
  blockedDays: Weekday[];
  blockedDates: string[];
  timezone: string;
}

const WEEKDAY_ORDER: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const JS_DAY_TO_WEEKDAY: Weekday[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const OUTDOOR_GOALS_SERVER = new Set(['leash_pulling', 'recall', 'leash_reactivity', 'heel']);
const WINDOW_DEFAULT_TIMES: Record<TimeWindow, string> = {
  early_morning: '07:00', morning: '09:00', midday: '12:00',
  afternoon: '16:00', evening: '19:00', late_evening: '21:00',
};
const DEFAULT_PREFS_SERVER: TrainingSchedulePrefs = {
  preferredTrainingDays: ['tuesday', 'thursday', 'saturday'],
  preferredTrainingWindows: {},
  preferredTrainingTimes: {},
  usualWalkTimes: [],
  sessionStyle: 'balanced',
  scheduleFlexibility: 'move_next_slot',
  scheduleIntensity: 'balanced',
  blockedDays: [],
  blockedDates: [],
  timezone: 'UTC',
};

function padTwo(n: number): string { return n.toString().padStart(2, '0'); }
function toDateKeyServer(date: Date): string {
  return `${date.getFullYear()}-${padTwo(date.getMonth() + 1)}-${padTwo(date.getDate())}`;
}
function parseDateServer(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0, 0);
}
function addDaysServer(date: Date, days: number): Date {
  const next = new Date(date); next.setDate(next.getDate() + days); return next;
}
function weekdayFromDate(date: Date): Weekday {
  return JS_DAY_TO_WEEKDAY[date.getDay()] ?? 'monday';
}
function weekdayIdx(day: Weekday): number { return WEEKDAY_ORDER.indexOf(day); }
function isWeekendDay(day: Weekday): boolean { return day === 'saturday' || day === 'sunday'; }

function buildPrefsFromDog(dog: DogRow): TrainingSchedulePrefs {
  const preferred = (dog.preferred_training_days ?? []) as Weekday[];
  const blocked = (dog.blocked_days ?? []) as Weekday[];
  return {
    preferredTrainingDays: preferred.length ? preferred : DEFAULT_PREFS_SERVER.preferredTrainingDays.slice(0, Math.max(1, Math.min(dog.available_days_per_week ?? 3, 3))),
    preferredTrainingWindows: (dog.preferred_training_windows ?? {}) as Partial<Record<Weekday, TimeWindow[]>>,
    preferredTrainingTimes: (dog.preferred_training_times ?? {}) as Partial<Record<Weekday, string[]>>,
    usualWalkTimes: dog.usual_walk_times ?? [],
    sessionStyle: dog.session_style ?? 'balanced',
    scheduleFlexibility: dog.schedule_flexibility ?? 'move_next_slot',
    scheduleIntensity: (dog.schedule_intensity ?? 'balanced') as ScheduleIntensity,
    blockedDays: blocked,
    blockedDates: dog.blocked_dates ?? [],
    timezone: dog.timezone ?? 'UTC',
  };
}

function gapScoreServer(days: Weekday[]): number {
  if (days.length <= 1) return 10;
  const indexes = days.map(weekdayIdx).sort((a, b) => a - b);
  let score = 0;
  for (let i = 0; i < indexes.length; i++) {
    const current = indexes[i]!;
    const next = indexes[(i + 1) % indexes.length]!;
    const gap = i === indexes.length - 1 ? 7 - current + next : next - current;
    score += gap;
    if (gap >= 2) score += 4;
    if (gap === 1) score -= 3;
  }
  return score;
}

function intensitySpacingScoreServer(days: Weekday[], intensity: ScheduleIntensity): number {
  const gaps = days.map(weekdayIdx).sort((a, b) => a - b).map((cur, i, all) => {
    const next = all[(i + 1) % all.length]!;
    return i === all.length - 1 ? 7 - cur + next : next - cur;
  });
  if (intensity === 'gentle') return gaps.reduce((s, g) => s + g * 2 - (g === 1 ? 8 : 0), 0);
  if (intensity === 'aggressive') return gaps.reduce((s, g) => s + (g === 1 ? 12 : -g * 2), 0);
  return gaps.reduce((s, g) => s + (g === 1 ? -2 : g + 1), 0);
}

function chooseBestCombinationServer(candidates: Weekday[], count: number, preferredSet: Set<Weekday>, intensity: ScheduleIntensity): Weekday[] {
  const combos: Weekday[][] = [];
  function visit(start: number, current: Weekday[]) {
    if (current.length === count) { combos.push([...current]); return; }
    for (let i = start; i < candidates.length; i++) { current.push(candidates[i]!); visit(i + 1, current); current.pop(); }
  }
  visit(0, []);
  const defaultPriority: Record<Weekday, number> = { monday: 2, tuesday: 5, wednesday: 3, thursday: 5, friday: 2, saturday: 4, sunday: 3 };
  const scored = combos.map((combo) => ({
    combo,
    score: combo.filter((d) => preferredSet.has(d)).length * 100
      + (combo.some(isWeekendDay) ? 4 : 0)
      + combo.reduce((s, d) => s + defaultPriority[d], 0)
      + gapScoreServer(combo) + intensitySpacingScoreServer(combo, intensity),
  }));
  scored.sort((a, b) => b.score - a.score || a.combo.join(',').localeCompare(b.combo.join(',')));
  return scored[0]?.combo.sort((a, b) => weekdayIdx(a) - weekdayIdx(b)) ?? candidates.slice(0, count);
}

function chooseTrainingDaysServer(sessionsPerWeek: number, availableDaysPerWeek: number, prefs: TrainingSchedulePrefs): Weekday[] {
  const desiredCount = Math.max(1, Math.min(sessionsPerWeek || availableDaysPerWeek || 3, 7));
  const blocked = new Set(prefs.blockedDays);
  const preferred = prefs.preferredTrainingDays.filter((d) => !blocked.has(d));
  const preferredSet = new Set(preferred);
  const candidates = WEEKDAY_ORDER.filter((d) => !blocked.has(d));
  if (candidates.length <= desiredCount) return candidates;
  if (preferred.length >= desiredCount) return chooseBestCombinationServer(candidates.filter((d) => preferredSet.has(d)), desiredCount, preferredSet, prefs.scheduleIntensity);
  return chooseBestCombinationServer(candidates, desiredCount, preferredSet, prefs.scheduleIntensity);
}

function chooseTimeForDayServer(day: Weekday, prefs: TrainingSchedulePrefs, goal?: string): string {
  const exactTimes = prefs.preferredTrainingTimes[day];
  if (exactTimes?.length) return [...exactTimes].sort()[0]!;
  if (goal && OUTDOOR_GOALS_SERVER.has(goal) && prefs.usualWalkTimes.length > 0) {
    const windows = prefs.preferredTrainingWindows[day];
    const walkTimes = [...prefs.usualWalkTimes].sort();
    const linked = windows?.length
      ? walkTimes.find((t) => {
          const h = Number(t.split(':')[0] ?? '0');
          return windows.some((w) => {
            if (w === 'early_morning') return h < 8;
            if (w === 'morning') return h >= 8 && h < 11;
            if (w === 'midday') return h >= 11 && h < 14;
            if (w === 'afternoon') return h >= 14 && h < 18;
            if (w === 'evening') return h >= 18 && h < 21;
            if (w === 'late_evening') return h >= 21;
            return false;
          });
        }) ?? null
      : walkTimes[0] ?? null;
    if (linked) return linked;
  }
  const windows = prefs.preferredTrainingWindows[day];
  if (windows?.length) return WINDOW_DEFAULT_TIMES[windows[0]!] ?? '19:00';
  return '19:00';
}

function findDateForWeekdayServer(startDate: Date, weekday: Weekday, allowToday = false): Date {
  let offset = (weekdayIdx(weekday) - weekdayIdx(weekdayFromDate(startDate)) + 7) % 7;
  if (offset === 0 && !allowToday) offset = 7;
  return addDaysServer(startDate, offset);
}

function isBlockedDateServer(date: Date, prefs: TrainingSchedulePrefs): boolean {
  return prefs.blockedDates.includes(toDateKeyServer(date)) || prefs.blockedDays.includes(weekdayFromDate(date));
}

function findNextAvailableDateServer(startDate: Date, day: Weekday, prefs: TrainingSchedulePrefs, occupied: Set<string>, allowToday = false): Date {
  let candidate = findDateForWeekdayServer(startDate, day, allowToday);
  while (isBlockedDateServer(candidate, prefs) || occupied.has(toDateKeyServer(candidate))) {
    candidate = addDaysServer(candidate, 7);
  }
  return candidate;
}

function applySpacingServer(sessions: Record<string, unknown>[], intensity: ScheduleIntensity): Record<string, unknown>[] {
  if (sessions.length < 2) return sessions;
  const adjusted = sessions.map((s) => ({ ...s }));
  const minGap = intensity === 'gentle' ? 2 : 1;
  for (let i = 1; i < adjusted.length; i++) {
    const prev = adjusted[i - 1]!;
    const cur = adjusted[i]!;
    if (!prev.scheduledDate || !cur.scheduledDate) continue;
    const prevDate = parseDateServer(prev.scheduledDate as string);
    const curDate = parseDateServer(cur.scheduledDate as string);
    const gapDays = Math.round((curDate.getTime() - prevDate.getTime()) / 86400000);
    const bothLong = (prev.durationMinutes as number) >= 12 && (cur.durationMinutes as number) >= 12;
    if (bothLong || gapDays < minGap) {
      const shifted = addDaysServer(curDate, minGap - gapDays + (bothLong ? 1 : 0));
      cur.scheduledDate = toDateKeyServer(shifted);
      cur.scheduledDay = weekdayFromDate(shifted);
    }
  }
  return adjusted;
}

function buildWeeklyScheduleServer(sessions: Record<string, unknown>[], sessionsPerWeek: number, availableDaysPerWeek: number, prefs: TrainingSchedulePrefs, goal?: string): Record<string, unknown>[] {
  const rawDays = chooseTrainingDaysServer(sessionsPerWeek, availableDaysPerWeek, prefs);
  const todayWeekday = weekdayFromDate(new Date());
  const todayIdx = weekdayIdx(todayWeekday);
  const startIdx = rawDays.findIndex((d) => weekdayIdx(d) >= todayIdx);
  const trainingDays = startIdx === -1 ? rawDays : [...rawDays.slice(startIdx), ...rawDays.slice(0, startIdx)];

  const occupied = new Set<string>();
  const startDate = new Date();
  startDate.setHours(12, 0, 0, 0);

  const scheduled = sessions.map((session, index) => {
    const day = trainingDays[index % trainingDays.length]!;
    const weekOffset = Math.floor(index / trainingDays.length) * 7;
    const base = addDaysServer(startDate, weekOffset);
    const scheduledDate = findNextAvailableDateServer(base, day, prefs, occupied, index === 0);
    const dateKey = toDateKeyServer(scheduledDate);
    occupied.add(dateKey);
    return {
      ...session,
      scheduledDay: weekdayFromDate(scheduledDate),
      scheduledDate: dateKey,
      scheduledTime: chooseTimeForDayServer(day, prefs, goal),
      isReschedulable: prefs.scheduleFlexibility !== 'skip',
      autoRescheduledFrom: null,
    };
  });

  return applySpacingServer(scheduled, prefs.scheduleIntensity).sort((a, b) => {
    const dc = ((a.scheduledDate as string) ?? '').localeCompare((b.scheduledDate as string) ?? '');
    return dc !== 0 ? dc : ((a.scheduledTime as string) ?? '').localeCompare((b.scheduledTime as string) ?? '');
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const GOAL_MAP: Record<string, string> = {
  leash_pulling: 'leash_pulling',
  jumping_up: 'jumping_up',
  barking: 'barking',
  recall: 'recall',
  potty_training: 'potty_training',
  crate_anxiety: 'crate_anxiety',
  puppy_biting: 'puppy_biting',
  settling: 'settling',
  leave_it: 'leave_it',
  basic_obedience: 'basic_obedience',
  separation_anxiety: 'separation_anxiety',
  door_manners: 'door_manners',
  impulse_control: 'impulse_control',
  cooperative_care: 'cooperative_care',
  wait_and_stay: 'wait_and_stay',
  leash_reactivity: 'leash_reactivity',
  sit: 'sit',
  down: 'down',
  heel: 'heel',
  'Leash Pulling': 'leash_pulling',
  'Jumping Up': 'jumping_up',
  Barking: 'barking',
  "Won't Come": 'recall',
  'Potty Training': 'potty_training',
  'Crate Anxiety': 'crate_anxiety',
  'Puppy Biting': 'puppy_biting',
  Settling: 'settling',
  'Leave It': 'leave_it',
  'Basic Obedience': 'basic_obedience',
  'Separation Anxiety': 'separation_anxiety',
  'Door Manners': 'door_manners',
  'Impulse Control': 'impulse_control',
  'Cooperative Care': 'cooperative_care',
  'Wait & Stay': 'wait_and_stay',
  'Leash Reactivity': 'leash_reactivity',
  Sit: 'sit',
  Down: 'down',
  Heel: 'heel',
};

const VALID_ENVIRONMENTS = new Set([
  'indoors_low_distraction',
  'indoors_moderate_distraction',
  'outdoors_low_distraction',
  'outdoors_moderate_distraction',
  'outdoors_high_distraction',
]);

const VALID_SESSION_KINDS = new Set(['core', 'repeat', 'proofing']);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompt builder
// ─────────────────────────────────────────────────────────────────────────────

function buildPrompt(dog: DogRow, nodes: SkillNodeRow[], goalKey: string): string {
  const skillList = nodes
    .map(
      (n) =>
        `- id: "${n.id}" | title: "${n.title}" | stage: ${n.stage} | difficulty: ${n.difficulty} | kind: ${n.kind} | protocolId: ${n.protocol_id ?? 'none'}`,
    )
    .join('\n');

  const sessionsPerWeek = Math.min(dog.available_days_per_week, 5);
  const lifecycle = dog.lifecycle_stage || 'adult';
  const startLevel =
    lifecycle === 'puppy' || lifecycle === 'adolescent'
      ? 'beginners — always start at stage 1'
      : 'intermediate — may start at stage 1 or 2';

  return `You are a professional dog training planner. You select from APPROVED skill graph nodes ONLY to build safe, effective training plans.

## CRITICAL RULES
- ONLY use skill IDs from the approved list below. NEVER invent exercises or skill IDs.
- Always prioritize safe, positive reinforcement methods.
- Build early success — keep the first week conservative with foundation skills.
- Prefer foundation skills before core skills before proofing.
- Respect the dog's schedule constraints.
- Output VALID JSON ONLY matching the exact schema below. No markdown, no explanation, no commentary.

## Dog Profile
Name: ${dog.name}
Breed: ${dog.breed ?? 'Unknown'}
Age: ${dog.age_months} months (${lifecycle})
Environment: ${dog.environment_type}
Training experience: ${dog.training_experience}
Equipment: ${dog.equipment?.join(', ') || 'standard leash and collar'}
Available days/week: ${dog.available_days_per_week}
Available minutes/day: ${dog.available_minutes_per_day}
Behavior goal: ${goalKey}

## Approved Skill Nodes for "${goalKey}"
${skillList}

## Environment Options
- indoors_low_distraction
- indoors_moderate_distraction
- outdoors_low_distraction
- outdoors_moderate_distraction
- outdoors_high_distraction

## Session Kind Options
- core
- repeat
- proofing

## Constraints
- Plan horizon: maximum 4 weeks
- Sessions per week: must equal ${sessionsPerWeek}
- Only use skills with kind "foundation", "core", or "proofing" (not "recovery" or "diagnostic")
- Only use skills that have a protocolId (not null/none) unless kind is "proofing"
- Start with the lowest stage skills for ${startLevel}
- Each skill's sessionCount must be between 1 and 4
- Total sessions across a week must equal sessionsPerWeek
- Progress from lower difficulty to higher difficulty across weeks
- Do not skip prerequisite skills for foundation/core skills

## Output Schema (JSON only, no markdown fences)
{
  "primaryGoal": "${goalKey}",
  "startingSkillId": "<first skill id>",
  "planHorizonWeeks": <1-4>,
  "sessionsPerWeek": ${sessionsPerWeek},
  "weeklyStructure": [
    {
      "weekNumber": 1,
      "focus": "<short focus label>",
      "skillSequence": [
        {
          "skillId": "<approved skill id>",
          "sessionCount": <1-4>,
          "environment": "<environment>",
          "sessionKind": "<core|repeat|proofing>",
          "reasoningLabel": "<1-sentence reasoning>"
        }
      ]
    }
  ],
  "planningSummary": {
    "whyThisStart": "<why this starting skill>",
    "keyAssumptions": ["<assumption 1>", "<assumption 2>"],
    "risksToWatch": ["<risk 1>", "<risk 2>"]
  }
}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

function validateOutput(
  output: AIPlannerOutput,
  nodeMap: Map<string, SkillNodeRow>,
  edgesArr: SkillEdgeRow[],
  expectedSessionsPerWeek: number,
): string[] {
  const errors: string[] = [];

  if (!output.primaryGoal) errors.push('Missing primaryGoal');
  if (!output.startingSkillId) errors.push('Missing startingSkillId');
  if (
    typeof output.planHorizonWeeks !== 'number' ||
    output.planHorizonWeeks < 1 ||
    output.planHorizonWeeks > 4
  ) {
    errors.push('planHorizonWeeks must be 1-4');
  }
  if (output.sessionsPerWeek !== expectedSessionsPerWeek) {
    errors.push(`sessionsPerWeek must be ${expectedSessionsPerWeek}, got ${output.sessionsPerWeek}`);
  }
  if (!Array.isArray(output.weeklyStructure)) {
    errors.push('weeklyStructure must be an array');
    return errors;
  }

  if (!output.startingSkillId || !nodeMap.has(output.startingSkillId)) {
    errors.push(`startingSkillId "${output.startingSkillId}" not in skill graph`);
  }

  // Validate planningSummary
  if (!output.planningSummary || typeof output.planningSummary !== 'object') {
    errors.push('planningSummary is required');
  }

  // Build prerequisite map
  const prereqMap = new Map<string, string[]>();
  for (const edge of edgesArr) {
    if (edge.edge_type === 'prerequisite') {
      const existing = prereqMap.get(edge.to_skill_id) ?? [];
      existing.push(edge.from_skill_id);
      prereqMap.set(edge.to_skill_id, existing);
    }
  }

  const scheduledOrder: string[] = [];

  for (let i = 0; i < output.weeklyStructure.length; i++) {
    const week = output.weeklyStructure[i];
    if (typeof week.weekNumber !== 'number') {
      errors.push(`Week ${i}: missing weekNumber`);
      continue;
    }

    if (!Array.isArray(week.skillSequence)) {
      errors.push(`Week ${week.weekNumber}: skillSequence must be an array`);
      continue;
    }

    const weekTotal = week.skillSequence.reduce((s, sel) => s + (sel.sessionCount ?? 0), 0);
    if (weekTotal !== expectedSessionsPerWeek) {
      errors.push(
        `Week ${week.weekNumber}: ${weekTotal} sessions, expected ${expectedSessionsPerWeek}`,
      );
    }

    for (const sel of week.skillSequence) {
      const node = nodeMap.get(sel.skillId);
      if (!node) {
        errors.push(`Skill "${sel.skillId}" not in skill graph`);
        continue;
      }
      if (!node.is_active) {
        errors.push(`Skill "${sel.skillId}" is inactive`);
      }
      if (node.kind === 'recovery' || node.kind === 'diagnostic') {
        errors.push(`Skill "${sel.skillId}" is ${node.kind}, not allowed in initial plans`);
      }
      if (node.kind !== 'proofing' && !node.protocol_id) {
        errors.push(`Skill "${sel.skillId}" has no protocol`);
      }
      if (!VALID_ENVIRONMENTS.has(sel.environment)) {
        errors.push(`Invalid environment: "${sel.environment}"`);
      }
      if (!VALID_SESSION_KINDS.has(sel.sessionKind)) {
        errors.push(`Invalid sessionKind: "${sel.sessionKind}"`);
      }
      if (typeof sel.sessionCount !== 'number' || sel.sessionCount < 1 || sel.sessionCount > 4) {
        errors.push(`sessionCount for "${sel.skillId}" must be 1-4`);
      }

      scheduledOrder.push(sel.skillId);
    }
  }

  // Prerequisite ordering
  const seen = new Set<string>();
  for (const skillId of scheduledOrder) {
    const prereqs = prereqMap.get(skillId) ?? [];
    for (const prereq of prereqs) {
      if (scheduledOrder.includes(prereq) && !seen.has(prereq)) {
        errors.push(`"${skillId}" scheduled before prerequisite "${prereq}"`);
      }
    }
    seen.add(skillId);
  }

  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// Plan compiler (server-side)
// ─────────────────────────────────────────────────────────────────────────────

function compilePlanServer(
  output: AIPlannerOutput,
  dog: DogRow,
  nodeMap: Map<string, SkillNodeRow>,
): { sessions: unknown[]; metadata: Record<string, unknown>; currentStage: string } {
  const rawSessions: Record<string, unknown>[] = [];
  let idx = 0;

  for (const week of output.weeklyStructure) {
    let dayInWeek = 0;
    for (const sel of week.skillSequence) {
      const node = nodeMap.get(sel.skillId);
      const protocolId = node?.protocol_id ?? sel.skillId;
      const stage = node?.stage ?? 1;
      const baseDuration = stage <= 1 ? 8 : stage <= 2 ? 10 : stage <= 3 ? 12 : 15;
      const duration = Math.min(baseDuration, dog.available_minutes_per_day);

      for (let rep = 0; rep < sel.sessionCount; rep++) {
        dayInWeek++;
        idx++;
        rawSessions.push({
          id: `session_${idx}`,
          exerciseId: protocolId,
          weekNumber: week.weekNumber,
          dayNumber: dayInWeek,
          title: node?.title ?? sel.skillId,
          durationMinutes: duration,
          isCompleted: false,
          skillId: sel.skillId,
          parentSkillId: null,
          sessionKind: sel.sessionKind,
          adaptationSource: 'initial_plan',
          reasoningLabel: sel.reasoningLabel,
        });
      }
    }
  }

  const prefs = buildPrefsFromDog(dog);
  const sessions = buildWeeklyScheduleServer(
    rawSessions,
    output.sessionsPerWeek,
    dog.available_days_per_week,
    prefs,
    dog.behavior_goals[0],
  );

  const startNode = nodeMap.get(output.startingSkillId);
  const currentStage = startNode
    ? `Stage ${startNode.stage} — ${startNode.kind.charAt(0).toUpperCase() + startNode.kind.slice(1)}`
    : 'Stage 1 — Foundation';

  const selectedSkillIds = [
    ...new Set(output.weeklyStructure.flatMap((w) => w.skillSequence.map((s) => s.skillId))),
  ];

  const metadata = {
    plannerVersion: '1.0.0',
    plannerMode: 'adaptive_ai',
    planningSummary: output.planningSummary,
    selectedSkillIds,
    validationWarnings: [],
    scheduleExplanation: output.planningSummary.whyThisStart,
    scheduleVersion: dog.schedule_version,
    timezone: dog.timezone,
  };

  return { sessions, metadata, currentStage };
}

// ─────────────────────────────────────────────────────────────────────────────
// Rules-based fallback (server-side)
// ─────────────────────────────────────────────────────────────────────────────

const SEQUENCES: Record<string, Array<[string, string, number]>> = {
  leash_pulling: [
    ['ll_01', 'Name recognition & eye contact', 8],
    ['ll_02', 'Stand still — pressure off', 8],
    ['ll_03', 'One step & stop', 10],
    ['ll_04', 'Change of direction', 10],
    ['ll_05', 'U-turn on cue', 12],
    ['ll_06', 'Walking on a loose leash — short distance', 12],
    ['ll_07', 'Distraction proofing — other dogs', 15],
    ['ll_08', 'Loose leash on busy street', 15],
  ],
  jumping_up: [
    ['ju_01', 'Four-on-floor for greetings', 8],
    ['ju_02', 'Auto-sit for attention', 8],
    ['ju_03', 'Door greeting protocol', 10],
    ['ju_04', 'Stranger greeting practice', 10],
    ['ju_05', 'Impulse control — excitement threshold', 12],
    ['ju_06', 'Off cue proofing', 12],
  ],
  barking: [
    ['bk_01', 'Quiet cue foundation', 8],
    ['bk_02', 'Look at That — desensitisation', 8],
    ['bk_03', 'Threshold mapping', 10],
    ['bk_04', 'Place cue at threshold', 10],
    ['bk_05', 'Quiet cue with trigger present', 12],
    ['bk_06', 'Real-world proofing', 15],
  ],
  recall: [
    ['rc_01', 'Name game — high value rewards', 8],
    ['rc_02', 'Recall from 3 feet', 8],
    ['rc_03', 'Recall from 10 feet', 10],
    ['rc_04', 'Recall with mild distraction', 10],
    ['rc_05', 'Long-line recall — 20 feet', 12],
    ['rc_06', 'Emergency recall cue', 12],
    ['rc_07', 'Off-leash recall in enclosed area', 15],
  ],
  potty_training: [
    ['pt_01', 'Establish schedule — every 2 hours', 5],
    ['pt_02', 'Reward zone protocol', 5],
    ['pt_03', 'Crate introduction for potty rhythm', 8],
    ['pt_04', 'Tether training indoors', 8],
    ['pt_05', 'Potty on cue', 10],
    ['pt_06', 'Extend interval to 3 hours', 5],
  ],
  crate_anxiety: [
    ['ca_01', 'Open door exploration', 8],
    ['ca_02', 'Meals inside — building love', 5],
    ['ca_03', 'Door closed, 10 seconds', 8],
    ['ca_04', 'Door closed, 2 minutes', 8],
    ['ca_05', 'Out of sight, 5 minutes', 10],
    ['ca_06', 'Out of sight, 20 minutes', 10],
    ['ca_07', 'Full departure routine', 12],
  ],
  puppy_biting: [
    ['pb_01', 'Yelp & pause — pressure off', 5],
    ['pb_02', 'Toy redirect on contact', 5],
    ['pb_03', 'Time-out for hard bites', 8],
    ['pb_04', 'Calm four-paws greeting', 8],
    ['pb_05', 'Mat settle to wind down', 10],
    ['pb_06', 'Stay soft in excited play', 10],
  ],
  settling: [
    ['st_01', 'Mat introduction', 8],
    ['st_02', 'Down on mat on cue', 8],
    ['st_03', '30-second hold', 10],
    ['st_04', '3-minute hold', 10],
    ['st_05', 'Calm during household activity', 12],
    ['st_06', 'Hold with mild distractions', 12],
    ['st_07', 'Real-world café or visit', 15],
  ],
  leave_it: [
    ['li_01', 'Hand targeting foundation', 8],
    ['li_02', 'Floor drop on cue', 8],
    ['li_03', 'Trade up — toy for treat', 10],
    ['li_04', 'Moving object self-control', 10],
    ['li_05', 'High-distraction proofing', 12],
    ['li_06', 'Real-world street & park', 12],
  ],
  basic_obedience: [
    ['ob_01', 'Sit on cue from a lure', 8],
    ['ob_02', 'Down on cue from a lure', 8],
    ['ob_03', '5-second stay', 10],
    ['ob_04', 'Name recall foundation', 10],
    ['ob_05', 'Sit → down → stay chain', 12],
    ['ob_06', 'All cues with distractions', 12],
  ],
  separation_anxiety: [
    ['sa_01', '10-second calm goodbye', 8],
    ['sa_02', 'Keys & coat — no big deal', 8],
    ['sa_03', 'Out of sight, 2 minutes', 10],
    ['sa_04', 'Out of sight, 10 minutes', 10],
    ['sa_05', 'Full 30-minute alone stretch', 12],
    ['sa_06', 'Random departure times', 12],
  ],
  door_manners: [
    ['dm_01', 'Automatic sit at the door', 8],
    ['dm_02', 'Hold at the threshold', 8],
    ['dm_03', 'Hold with door fully open', 10],
    ['dm_04', 'Hold while a visitor arrives', 10],
    ['dm_05', 'Release on cue — proofing', 12],
    ['dm_06', 'Front door in real life', 12],
  ],
  impulse_control: [
    ['ic_01', "It's Your Choice foundation", 8],
    ['ic_02', 'Ignore food on the floor', 8],
    ['ic_03', 'Sit calmly before meals', 10],
    ['ic_04', 'Wait for the toy — then release', 10],
    ['ic_05', 'Hold it together near triggers', 12],
    ['ic_06', 'Real-world self-control', 12],
  ],
  cooperative_care: [
    ['cc_01', 'Nose-to-hand touch target', 8],
    ['cc_02', 'Chin rest on your palm', 8],
    ['cc_03', 'Ears, paws — no big deal', 10],
    ['cc_04', 'Nail touching & clippers near', 10],
    ['cc_05', 'Calm under gentle restraint', 12],
    ['cc_06', 'Mock vet table & exam', 12],
  ],
  wait_and_stay: [
    ['ws_01', 'One step back & return', 8],
    ['ws_02', '10-second hold', 8],
    ['ws_03', '30-second hold', 10],
    ['ws_04', 'Hold while you move around', 10],
    ['ws_05', '3-minute hold', 12],
    ['ws_06', 'Hold with distractions', 12],
  ],
  leash_reactivity: [
    ['lr_01', 'Look at That — below threshold', 10],
    ['lr_02', 'U-turn on trigger', 10],
    ['lr_03', 'Parallel walking — far distance', 12],
    ['lr_04', 'Parallel walking — close distance', 12],
    ['lr_05', 'Threshold approach — calm passes', 15],
    ['lr_06', 'Real-world reactive walk', 15],
  ],
  sit: [
    ['si_01', 'Lure into position', 8],
    ['si_02', 'Hand signal only', 8],
    ['si_03', 'Voice cue only', 10],
    ['si_04', 'Sit from across the room', 10],
    ['si_05', 'Hold it with distractions', 12],
    ['si_06', 'New places, same response', 12],
  ],
  down: [
    ['dn_01', 'Lure all the way down', 8],
    ['dn_02', 'Hand signal only', 8],
    ['dn_03', 'Voice cue only', 10],
    ['dn_04', 'Down from across the room', 10],
    ['dn_05', 'Hold it with distractions', 12],
    ['dn_06', 'New places, same response', 12],
  ],
  heel: [
    ['hl_01', 'Find the sweet spot position', 8],
    ['hl_02', '5 steps clean beside you', 8],
    ['hl_03', '20 steps with turns', 10],
    ['hl_04', 'Off-leash in the yard', 10],
    ['hl_05', 'Hold form near distractions', 12],
    ['hl_06', 'Real-world sidewalk', 12],
  ],
};

function generateFallbackPlan(dog: DogRow, goalOverride?: string) {
  const goalKey = GOAL_MAP[goalOverride ?? dog.behavior_goals[0]] ?? 'leash_pulling';
  const sessionsPerWeek = Math.min(dog.available_days_per_week, 5);
  const totalWeeks = 4;
  const sequences = SEQUENCES[goalKey] ?? SEQUENCES.leash_pulling;

  const rawSessions: Record<string, unknown>[] = [];
  let idx = 0;
  for (let week = 1; week <= totalWeeks; week++) {
    for (let day = 1; day <= sessionsPerWeek; day++) {
      const [exerciseId, title, duration] = sequences[idx % sequences.length];
      idx++;
      rawSessions.push({
        id: `session_${idx}`,
        exerciseId,
        weekNumber: week,
        dayNumber: day,
        title,
        durationMinutes: Math.min(duration, dog.available_minutes_per_day),
        isCompleted: false,
      });
    }
  }

  const prefs = buildPrefsFromDog(dog);
  const sessions = buildWeeklyScheduleServer(rawSessions, sessionsPerWeek, dog.available_days_per_week, prefs, goalKey);

  const lifecycle = dog.lifecycle_stage || 'adult';
  const currentStage =
    lifecycle === 'puppy' || lifecycle === 'adolescent'
      ? 'Stage 1 — Foundation'
      : 'Stage 2 — Building';

  return {
    sessions,
    currentStage,
    sessionsPerWeek,
    totalWeeks,
    metadata: {
      plannerVersion: '1.0.0',
      plannerMode: 'rules_fallback',
      validationWarnings: [],
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main handler
// ─────────────────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  // ── 1. Auth ─────────────────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Missing authorization header' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const token = authHeader.replace('Bearer ', '');
  const {
    data: { user },
    error: authError,
  } = await adminClient.auth.getUser(token);
  if (authError || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  // ── 2. Parse request ────────────────────────────────────────────────────────
  let body: { dogId: string; goalOverride?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.dogId) {
    return jsonResponse({ error: 'dogId is required' }, 400);
  }

  // ── 3. Fetch context ────────────────────────────────────────────────────────
  const [dogResult, nodesResult, edgesResult] = await Promise.all([
    adminClient
      .from('dogs')
      .select('*')
      .eq('id', body.dogId)
      .eq('owner_id', user.id)
      .single(),
    adminClient
      .from('skill_nodes')
      .select('*')
      .eq('is_active', true),
    adminClient.from('skill_edges').select('*'),
  ]);

  if (dogResult.error || !dogResult.data) {
    return jsonResponse({ error: 'Dog not found or access denied' }, 404);
  }

  const dog = dogResult.data as DogRow;
  const allNodes = (nodesResult.data ?? []) as SkillNodeRow[];
  const allEdges = (edgesResult.data ?? []) as SkillEdgeRow[];

  const effectiveGoal = body.goalOverride ?? dog.behavior_goals[0];
  const goalKey = GOAL_MAP[effectiveGoal] ?? 'leash_pulling';
  const behaviorNodes = allNodes.filter(
    (n) =>
      n.behavior === goalKey &&
      n.is_active &&
      n.kind !== 'recovery' &&
      n.kind !== 'diagnostic',
  );

  if (behaviorNodes.length === 0) {
    // Fallback
    const fallback = generateFallbackPlan(dog, effectiveGoal);
    const { data: planData, error: planError } = await adminClient.from('plans').insert({
      dog_id: dog.id,
      goal: effectiveGoal ?? 'General Training',
      status: 'active',
      duration_weeks: fallback.totalWeeks,
      sessions_per_week: fallback.sessionsPerWeek,
      current_week: 1,
      current_stage: fallback.currentStage,
      sessions: fallback.sessions,
      metadata: { ...fallback.metadata, fallbackReason: 'No skill nodes for behavior' },
    }).select('*').single();

    if (planError) {
      return jsonResponse({ error: 'Failed to create plan' }, 500);
    }

    return jsonResponse({
      plan: planData,
      plannerMode: 'rules_fallback',
      fallbackReason: 'No skill nodes for behavior',
    });
  }

  // ── 4. Call AI ──────────────────────────────────────────────────────────────
  const sessionsPerWeek = Math.min(dog.available_days_per_week, 5);
  const systemPrompt = buildPrompt(dog, behaviorNodes, goalKey);

  const openai = new OpenAI({ apiKey: openaiApiKey });
  let aiOutput: AIPlannerOutput;
  let fallbackReason: string | undefined;
  const startTime = Date.now();

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1500,
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Create a training plan for ${dog.name}. Output JSON only.`,
        },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? '';
    let cleaned = raw.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }

    aiOutput = JSON.parse(cleaned);
  } catch (err) {
    console.error('[generate-adaptive-plan] AI call failed:', err);
    fallbackReason = `AI call failed: ${err instanceof Error ? err.message : String(err)}`;
    aiOutput = null as unknown as AIPlannerOutput;
  }

  const latencyMs = Date.now() - startTime;

  // ── 5. Validate ─────────────────────────────────────────────────────────────
  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));

  if (aiOutput) {
    const validationErrors = validateOutput(aiOutput, nodeMap, allEdges, sessionsPerWeek);
    if (validationErrors.length > 0) {
      console.warn('[generate-adaptive-plan] Validation errors:', validationErrors);
      fallbackReason = `Validation failed: ${validationErrors.join('; ')}`;
      aiOutput = null as unknown as AIPlannerOutput;
    }
  }

  // ── 6. Compile or fallback ──────────────────────────────────────────────────
  let planSessions: unknown[];
  let planMetadata: Record<string, unknown>;
  let currentStage: string;
  let plannerMode: string;
  let planningSummary: unknown = undefined;

  if (aiOutput) {
    const compiled = compilePlanServer(aiOutput, dog, nodeMap);
    planSessions = compiled.sessions;
    planMetadata = compiled.metadata;
    currentStage = compiled.currentStage;
    plannerMode = 'adaptive_ai';
    planningSummary = aiOutput.planningSummary;

    // Add latency tracking
    planMetadata.modelName = 'gpt-4o';
    planMetadata.latencyMs = latencyMs;
  } else {
    const fallback = generateFallbackPlan(dog, effectiveGoal);
    planSessions = fallback.sessions;
    planMetadata = { ...fallback.metadata, fallbackReason };
    currentStage = fallback.currentStage;
    plannerMode = 'rules_fallback';
  }

  // ── 7. Insert plan ─────────────────────────────────────────────────────────
  const { data: planData, error: planError } = await adminClient
    .from('plans')
    .insert({
      dog_id: dog.id,
      goal: effectiveGoal ?? 'General Training',
      status: 'active',
      duration_weeks: aiOutput?.planHorizonWeeks ?? 4,
      sessions_per_week: sessionsPerWeek,
      current_week: 1,
      current_stage: currentStage,
      sessions: planSessions,
      metadata: planMetadata,
    })
    .select('*')
    .single();

  if (planError) {
    console.error('[generate-adaptive-plan] Plan insert failed:', planError);
    return jsonResponse({ error: 'Failed to create plan' }, 500);
  }

  // ── 8. Return ───────────────────────────────────────────────────────────────
  return jsonResponse({
    plan: planData,
    plannerMode,
    planningSummary,
    fallbackReason,
  });
});
