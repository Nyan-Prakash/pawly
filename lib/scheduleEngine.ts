import type {
  Dog,
  NotificationPrefs,
  Plan,
  PlanMetadata,
  PlanSession,
  ScheduleFlexibility,
  ScheduleIntensity,
  SessionStyle,
  TimeWindow,
  TrainingSchedulePrefs,
  Weekday,
} from '../types';

const WEEKDAY_ORDER: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const JS_DAY_TO_WEEKDAY: Weekday[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

const WINDOW_DEFAULT_TIMES: Record<TimeWindow, string> = {
  early_morning: '07:00',
  morning: '09:00',
  midday: '12:00',
  afternoon: '16:00',
  evening: '19:00',
  late_evening: '21:00',
};

const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  dailyReminder: true,
  dailyReminderTime: '19:00',
  walkReminders: true,
  postWalkCheckIn: true,
  streakAlerts: true,
  milestoneAlerts: true,
  insights: true,
  expertReview: true,
  lifecycle: true,
  weeklySummary: true,
  scheduledSessionReminders: true,
  reminderLeadMinutes: 15,
  fallbackMissedSessionReminders: true,
};

const DEFAULT_PREFS: TrainingSchedulePrefs = {
  preferredTrainingDays: ['tuesday', 'thursday', 'saturday'],
  preferredTrainingWindows: {},
  preferredTrainingTimes: {},
  usualWalkTimes: [],
  sessionStyle: 'balanced',
  scheduleFlexibility: 'move_next_slot',
  scheduleIntensity: 'balanced',
  blockedDays: [],
  blockedDates: [],
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
};

const OUTDOOR_GOALS = new Set(['Leash Pulling', "Won't Come", 'Barking']);

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1, 12, 0, 0, 0);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function compareTime(a: string, b: string): number {
  return a.localeCompare(b);
}

function isWeekend(day: Weekday): boolean {
  return day === 'saturday' || day === 'sunday';
}

export function getWeekdayFromDate(date: Date): Weekday {
  return JS_DAY_TO_WEEKDAY[date.getDay()] ?? 'monday';
}

export function normalizeNotificationPrefs(
  prefs?: Partial<NotificationPrefs> | null
): NotificationPrefs {
  return { ...DEFAULT_NOTIFICATION_PREFS, ...(prefs ?? {}) };
}

export function normalizeTrainingSchedulePrefs(
  prefs?: Partial<TrainingSchedulePrefs> | null,
  fallback?: Partial<Dog> | null
): TrainingSchedulePrefs {
  const preferredTrainingDays =
    prefs?.preferredTrainingDays?.length
      ? prefs.preferredTrainingDays
      : fallback?.preferredTrainingDays?.length
      ? fallback.preferredTrainingDays
      : DEFAULT_PREFS.preferredTrainingDays.slice(
          0,
          Math.max(1, Math.min(fallback?.availableDaysPerWeek ?? 3, 3))
        );

  return {
    preferredTrainingDays,
    preferredTrainingWindows:
      prefs?.preferredTrainingWindows ?? fallback?.preferredTrainingWindows ?? {},
    preferredTrainingTimes:
      prefs?.preferredTrainingTimes ?? fallback?.preferredTrainingTimes ?? {},
    usualWalkTimes: prefs?.usualWalkTimes ?? fallback?.usualWalkTimes ?? [],
    sessionStyle: prefs?.sessionStyle ?? fallback?.sessionStyle ?? DEFAULT_PREFS.sessionStyle,
    scheduleFlexibility:
      prefs?.scheduleFlexibility ??
      fallback?.scheduleFlexibility ??
      DEFAULT_PREFS.scheduleFlexibility,
    scheduleIntensity:
      prefs?.scheduleIntensity ?? fallback?.scheduleIntensity ?? DEFAULT_PREFS.scheduleIntensity,
    blockedDays: prefs?.blockedDays ?? fallback?.blockedDays ?? [],
    blockedDates: prefs?.blockedDates ?? fallback?.blockedDates ?? [],
    timezone: prefs?.timezone ?? fallback?.timezone ?? DEFAULT_PREFS.timezone,
  };
}

function weekdayIndex(day: Weekday): number {
  return WEEKDAY_ORDER.indexOf(day);
}

function defaultDayPriority(day: Weekday): number {
  const priority: Record<Weekday, number> = {
    monday: 2,
    tuesday: 5,
    wednesday: 3,
    thursday: 5,
    friday: 2,
    saturday: 4,
    sunday: 3,
  };
  return priority[day];
}

function gapScore(days: Weekday[]): number {
  if (days.length <= 1) return 10;
  const indexes = days.map(weekdayIndex).sort((a, b) => a - b);
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

function intensitySpacingScore(days: Weekday[], intensity: ScheduleIntensity): number {
  const gaps = days
    .map(weekdayIndex)
    .sort((a, b) => a - b)
    .map((current, index, all) => {
      const next = all[(index + 1) % all.length]!;
      return index === all.length - 1 ? 7 - current + next : next - current;
    });

  if (intensity === 'gentle') {
    return gaps.reduce((sum, gap) => sum + gap * 2 - (gap === 1 ? 8 : 0), 0);
  }

  if (intensity === 'aggressive') {
    return gaps.reduce((sum, gap) => sum + (gap === 1 ? 12 : -gap * 2), 0);
  }

  return gaps.reduce((sum, gap) => sum + (gap === 1 ? -2 : gap + 1), 0);
}

function chooseBestCombination(
  candidates: Weekday[],
  count: number,
  preferredSet: Set<Weekday>,
  intensity: ScheduleIntensity
): Weekday[] {
  const combos: Weekday[][] = [];

  function visit(start: number, current: Weekday[]) {
    if (current.length === count) {
      combos.push([...current]);
      return;
    }

    for (let i = start; i < candidates.length; i++) {
      current.push(candidates[i]!);
      visit(i + 1, current);
      current.pop();
    }
  }

  visit(0, []);

  const scored = combos.map((combo) => {
    const preferredHits = combo.filter((day) => preferredSet.has(day)).length * 100;
    const weekendMix = combo.some(isWeekend) ? 4 : 0;
    const defaultBias = combo.reduce((sum, day) => sum + defaultDayPriority(day), 0);
    const spacing = gapScore(combo) + intensitySpacingScore(combo, intensity);
    return { combo, score: preferredHits + weekendMix + defaultBias + spacing };
  });

  scored.sort((a, b) => b.score - a.score || a.combo.join(',').localeCompare(b.combo.join(',')));
  return scored[0]?.combo.sort((a, b) => weekdayIndex(a) - weekdayIndex(b)) ?? candidates.slice(0, count);
}

export function chooseTrainingDays(params: {
  sessionsPerWeek: number;
  availableDaysPerWeek: number;
  prefs: TrainingSchedulePrefs;
}): Weekday[] {
  const desiredCount = Math.max(
    1,
    Math.min(params.sessionsPerWeek || params.availableDaysPerWeek || 3, 7)
  );

  const blocked = new Set(params.prefs.blockedDays);
  const preferred = params.prefs.preferredTrainingDays.filter((day) => !blocked.has(day));
  const preferredSet = new Set(preferred);
  const candidates = WEEKDAY_ORDER.filter((day) => !blocked.has(day));

  if (candidates.length <= desiredCount) return candidates;
  if (preferred.length >= desiredCount) {
    return chooseBestCombination(candidates.filter((day) => preferredSet.has(day)), desiredCount, preferredSet, params.prefs.scheduleIntensity);
  }

  return chooseBestCombination(candidates, desiredCount, preferredSet, params.prefs.scheduleIntensity);
}

function matchesWindow(time: string, window: TimeWindow): boolean {
  const hour = Number(time.split(':')[0] ?? '0');
  switch (window) {
    case 'early_morning':
      return hour < 8;
    case 'morning':
      return hour >= 8 && hour < 11;
    case 'midday':
      return hour >= 11 && hour < 14;
    case 'afternoon':
      return hour >= 14 && hour < 18;
    case 'evening':
      return hour >= 18 && hour < 21;
    case 'late_evening':
      return hour >= 21;
  }
}

function chooseWalkLinkedTime(day: Weekday, prefs: TrainingSchedulePrefs): string | null {
  const windows = prefs.preferredTrainingWindows[day];
  const walkTimes = [...prefs.usualWalkTimes].sort(compareTime);
  if (walkTimes.length === 0) return null;
  if (!windows?.length) return walkTimes[0] ?? null;

  return walkTimes.find((time) => windows.some((window) => matchesWindow(time, window))) ?? null;
}

export function chooseTimeForDay(
  day: Weekday,
  prefs: TrainingSchedulePrefs,
  fallbackTime?: string,
  goal?: string
): string {
  const exactTimes = prefs.preferredTrainingTimes[day];
  if (exactTimes?.length) return [...exactTimes].sort(compareTime)[0]!;

  if (goal && OUTDOOR_GOALS.has(goal)) {
    const walkLinked = chooseWalkLinkedTime(day, prefs);
    if (walkLinked) return walkLinked;
  }

  const windows = prefs.preferredTrainingWindows[day];
  if (windows?.length) {
    return WINDOW_DEFAULT_TIMES[windows[0]!] ?? fallbackTime ?? '19:00';
  }

  return fallbackTime ?? '19:00';
}

export function chooseDurationForSession(params: {
  sessionStyle: SessionStyle;
  scheduleIntensity: ScheduleIntensity;
  availableMinutesPerDay: number;
  scheduledDay?: Weekday;
  sequenceIndex: number;
}): number {
  const baseRange: Record<SessionStyle, [number, number]> = {
    micro: [5, 8],
    balanced: [8, 12],
    focused: [12, 18],
  };

  const intensityDelta: Record<ScheduleIntensity, number> = {
    gentle: -1,
    balanced: 0,
    aggressive: 2,
  };

  const [minBase, maxBase] = baseRange[params.sessionStyle];
  const weekendBoost = params.scheduledDay && isWeekend(params.scheduledDay) ? 2 : 0;
  const cadenceBias = params.sequenceIndex % 3 === 2 ? 1 : 0;
  const target =
    minBase +
    Math.floor((maxBase - minBase) / 2) +
    intensityDelta[params.scheduleIntensity] +
    weekendBoost +
    cadenceBias;

  return Math.max(4, Math.min(params.availableMinutesPerDay, Math.max(minBase, target)));
}

function findDateForWeekday(startDate: Date, weekday: Weekday, allowToday = false): Date {
  const startWeekday = getWeekdayFromDate(startDate);
  let offset = (weekdayIndex(weekday) - weekdayIndex(startWeekday) + 7) % 7;
  // If offset is 0 and we don't allow today, jump to next week
  if (offset === 0 && !allowToday) offset = 7;
  return addDays(startDate, offset);
}

function isBlockedDate(date: Date, prefs: TrainingSchedulePrefs): boolean {
  const dateKey = toDateKey(date);
  return prefs.blockedDates.includes(dateKey) || prefs.blockedDays.includes(getWeekdayFromDate(date));
}

function findNextAvailableDate(params: {
  startDate: Date;
  day: Weekday;
  prefs: TrainingSchedulePrefs;
  occupiedDates: Set<string>;
  allowToday?: boolean;
}): Date {
  let candidate = findDateForWeekday(params.startDate, params.day, params.allowToday);
  while (
    isBlockedDate(candidate, params.prefs) ||
    params.occupiedDates.has(toDateKey(candidate))
  ) {
    candidate = addDays(candidate, 7);
  }
  return candidate;
}

function getSortedScheduleDates(sessions: PlanSession[]): string[] {
  return sessions
    .filter((session) => session.scheduledDate)
    .map((session) => session.scheduledDate!)
    .sort((a, b) => a.localeCompare(b));
}

function applySpacingAdjustments(sessions: PlanSession[], intensity: ScheduleIntensity): PlanSession[] {
  if (sessions.length < 2) return sessions;

  const adjusted = sessions.map((session) => ({ ...session }));
  const minGap = intensity === 'gentle' ? 2 : 1;

  for (let i = 1; i < adjusted.length; i++) {
    const previous = adjusted[i - 1]!;
    const current = adjusted[i]!;
    if (!previous.scheduledDate || !current.scheduledDate) continue;

    const prevDate = parseDate(previous.scheduledDate);
    const currentDate = parseDate(current.scheduledDate);
    const gapDays = Math.round((currentDate.getTime() - prevDate.getTime()) / 86400000);
    const bothLong = previous.durationMinutes >= 12 && current.durationMinutes >= 12;
    const needsShift = bothLong || gapDays < minGap;

    if (needsShift) {
      const shifted = addDays(currentDate, minGap - gapDays + (bothLong ? 1 : 0));
      current.scheduledDate = toDateKey(shifted);
      current.scheduledDay = getWeekdayFromDate(shifted);
    }
  }

  return adjusted;
}

export function summarizeScheduleExplanation(params: {
  goal: string;
  trainingDays: Weekday[];
  prefs: TrainingSchedulePrefs;
}): string[] {
  const bullets: string[] = [];

  bullets.push(
    params.prefs.sessionStyle === 'micro'
      ? 'We kept sessions short so the plan is easy to repeat on busy days.'
      : params.prefs.sessionStyle === 'focused'
      ? 'We saved a little more time for each session so you can practice without rushing.'
      : 'We balanced quick weekday sessions with enough time to practice well.'
  );

  if (params.trainingDays.some(isWeekend)) {
    bullets.push('Weekend sessions run a bit longer so you have room to focus.');
  }

  if (params.prefs.scheduleIntensity === 'gentle') {
    bullets.push('We left more recovery space between sessions to avoid overload.');
  } else if (params.prefs.scheduleIntensity === 'aggressive') {
    bullets.push('We used a denser cadence while still avoiding stacked hard days.');
  }

  if (OUTDOOR_GOALS.has(params.goal) && params.prefs.usualWalkTimes.length > 0) {
    bullets.push('Outdoor practice is placed close to your usual walk routine when possible.');
  }

  return bullets.slice(0, 4);
}

export function buildScheduleSummary(params: {
  sessionsPerWeek: number;
  prefs: TrainingSchedulePrefs;
  trainingDays?: Weekday[];
}): string {
  const days = params.trainingDays ?? chooseTrainingDays({
    sessionsPerWeek: params.sessionsPerWeek,
    availableDaysPerWeek: params.sessionsPerWeek,
    prefs: params.prefs,
  });

  const shortDays = days
    .slice(0, 3)
    .map((day) => day.slice(0, 3).replace(/^./, (letter) => letter.toUpperCase()));
  const styleLabel =
    params.prefs.sessionStyle === 'micro'
      ? 'short'
      : params.prefs.sessionStyle === 'focused'
      ? 'focused'
      : 'steady';
  const anchorDay = days[0] ? chooseTimeForDay(days[0], params.prefs) : '19:00';
  const period = Number(anchorDay.split(':')[0] ?? '19') >= 17 ? 'evening' : 'daytime';

  return `You’ll train ${params.sessionsPerWeek}x/week, mostly ${shortDays.join('/')}, with ${styleLabel} ${period} sessions.`;
}

export function buildPlanMetadata(params: {
  goal: string;
  sessionsPerWeek: number;
  prefs: TrainingSchedulePrefs;
  trainingDays: Weekday[];
}): PlanMetadata {
  return {
    scheduleVersion: 1,
    preferredDays: params.trainingDays,
    preferredWindows: params.prefs.preferredTrainingWindows,
    flexibility: params.prefs.scheduleFlexibility,
    intensity: params.prefs.scheduleIntensity,
    explanation: summarizeScheduleExplanation(params),
    scheduleSummary: buildScheduleSummary({
      sessionsPerWeek: params.sessionsPerWeek,
      prefs: params.prefs,
      trainingDays: params.trainingDays,
    }),
    timezone: params.prefs.timezone,
  };
}

export function buildWeeklySchedule(params: {
  sessions: PlanSession[];
  sessionsPerWeek: number;
  durationWeeks: number;
  availableDaysPerWeek: number;
  availableMinutesPerDay: number;
  prefs: TrainingSchedulePrefs;
  goal?: string;
}): PlanSession[] {
  const prefs = normalizeTrainingSchedulePrefs(params.prefs);
  const rawTrainingDays = chooseTrainingDays({
    sessionsPerWeek: params.sessionsPerWeek,
    availableDaysPerWeek: params.availableDaysPerWeek,
    prefs,
  });

  // Rotate training days so the first session lands on today (or the closest upcoming day)
  const todayWeekday = getWeekdayFromDate(new Date());
  const todayIndex = weekdayIndex(todayWeekday);
  const startIdx = rawTrainingDays.findIndex((d) => weekdayIndex(d) >= todayIndex);
  const trainingDays =
    startIdx === -1
      ? rawTrainingDays
      : [...rawTrainingDays.slice(startIdx), ...rawTrainingDays.slice(0, startIdx)];

  const occupiedDates = new Set<string>();
  const startDate = new Date();
  startDate.setHours(12, 0, 0, 0);

  const scheduled = params.sessions.map((session, index) => {
    const trainingDay = trainingDays[index % trainingDays.length]!;
    const weekOffset = Math.floor(index / trainingDays.length) * 7;
    const baseDate = addDays(startDate, weekOffset);
    const scheduledDate = findNextAvailableDate({
      startDate: baseDate,
      day: trainingDay,
      prefs,
      occupiedDates,
      allowToday: index === 0,
    });
    const dateKey = toDateKey(scheduledDate);
    occupiedDates.add(dateKey);

    return {
      ...session,
      scheduledDay: getWeekdayFromDate(scheduledDate),
      scheduledDate: dateKey,
      scheduledTime: chooseTimeForDay(trainingDay, prefs, undefined, params.goal),
      durationMinutes: chooseDurationForSession({
        sessionStyle: prefs.sessionStyle,
        scheduleIntensity: prefs.scheduleIntensity,
        availableMinutesPerDay: params.availableMinutesPerDay,
        scheduledDay: trainingDay,
        sequenceIndex: index,
      }),
      isReschedulable: prefs.scheduleFlexibility !== 'skip',
      autoRescheduledFrom: null,
      schedulingReason:
        OUTDOOR_GOALS.has(params.goal ?? '') && prefs.usualWalkTimes.length > 0
          ? 'linked_to_walk_routine'
          : prefs.preferredTrainingTimes[trainingDay]?.length
          ? 'exact_preference'
          : prefs.preferredTrainingWindows[trainingDay]?.length
          ? 'window_preference'
          : 'default_schedule',
    };
  });

  return applySpacingAdjustments(scheduled, prefs.scheduleIntensity).sort((a, b) => {
    const dateCompare = (a.scheduledDate ?? '').localeCompare(b.scheduledDate ?? '');
    if (dateCompare !== 0) return dateCompare;
    return (a.scheduledTime ?? '').localeCompare(b.scheduledTime ?? '');
  });
}

export function getTodaySession(plan: Plan, completedSessions: string[] = []): PlanSession | null {
  if (!plan || plan.sessions.length === 0) return null;

  const todayKey = toDateKey(new Date());
  const completedSet = new Set(completedSessions);
  const scheduledSessions = plan.sessions.filter((session) => session.scheduledDate || session.scheduledDay);

  if (scheduledSessions.length === 0) {
    return plan.sessions.find((session) => !session.isCompleted && !completedSet.has(session.id)) ?? null;
  }

  const todaysSession =
    scheduledSessions.find(
      (session) =>
        session.scheduledDate === todayKey &&
        !session.isCompleted &&
        !completedSet.has(session.id)
    ) ?? null;

  if (todaysSession) return todaysSession;

  return null;
}

export function getUpcomingSessions(plan: Plan, limit = 3): PlanSession[] {
  if (!plan) return [];
  const todayKey = toDateKey(new Date());
  const scheduled = plan.sessions.filter((session) => !session.isCompleted);
  const withDates = scheduled.filter((session) => session.scheduledDate);
  if (withDates.length === 0) {
    return scheduled.slice(0, limit);
  }

  return withDates
    .filter((session) => (session.scheduledDate ?? '') >= todayKey)
    .sort((a, b) => {
      const dateCompare = (a.scheduledDate ?? '').localeCompare(b.scheduledDate ?? '');
      if (dateCompare !== 0) return dateCompare;
      return (a.scheduledTime ?? '').localeCompare(b.scheduledTime ?? '');
    })
    .slice(0, limit);
}

export function getMissedScheduledSessions(plan: Plan): PlanSession[] {
  if (!plan) return [];
  const todayKey = toDateKey(new Date());
  return plan.sessions.filter(
    (session) =>
      !session.isCompleted &&
      Boolean(session.scheduledDate) &&
      (session.scheduledDate ?? '') < todayKey
  );
}

function findNextCompatibleSlot(
  sessions: PlanSession[],
  sessionId: string,
  prefs: TrainingSchedulePrefs
): { date: string; day: Weekday; time: string } | null {
  const target = sessions.find((session) => session.id === sessionId);
  if (!target) return null;

  const occupied = new Set(
    sessions
      .filter((session) => session.id !== sessionId && !session.isCompleted && session.scheduledDate)
      .map((session) => session.scheduledDate!)
  );

  const trainingDays = chooseTrainingDays({
    sessionsPerWeek: Math.max(1, new Set(sessions.map((session) => session.scheduledDay).filter(Boolean)).size),
    availableDaysPerWeek: Math.max(1, new Set(sessions.map((session) => session.scheduledDay).filter(Boolean)).size),
    prefs,
  });

  let probe = addDays(new Date(), 1);
  probe.setHours(12, 0, 0, 0);

  for (let i = 0; i < 21; i++) {
    const date = addDays(probe, i);
    const day = getWeekdayFromDate(date);
    const dateKey = toDateKey(date);
    if (
      trainingDays.includes(day) &&
      !prefs.blockedDays.includes(day) &&
      !prefs.blockedDates.includes(dateKey) &&
      !occupied.has(dateKey)
    ) {
      return {
        date: dateKey,
        day,
        time: chooseTimeForDay(day, prefs),
      };
    }
  }

  return null;
}

export function rescheduleMissedSession(
  plan: Plan,
  sessionId: string,
  prefs?: Partial<TrainingSchedulePrefs> | null
): Plan {
  const session = plan.sessions.find((item) => item.id === sessionId);
  if (!session || session.isCompleted || session.autoRescheduledFrom) {
    return plan;
  }

  const normalizedPrefs = normalizeTrainingSchedulePrefs(prefs ?? {
    preferredTrainingDays: plan.metadata?.preferredDays,
    preferredTrainingWindows: plan.metadata?.preferredWindows,
    scheduleFlexibility: plan.metadata?.flexibility,
    scheduleIntensity: plan.metadata?.intensity,
    timezone: plan.metadata?.timezone,
  });

  if (normalizedPrefs.scheduleFlexibility === 'skip') {
    return {
      ...plan,
      sessions: plan.sessions.map((item) =>
        item.id === sessionId ? { ...item, isMissed: true } : item
      ),
    };
  }

  const rescheduledSessions = plan.sessions.map((item) => ({ ...item }));
  const nextSlot =
    normalizedPrefs.scheduleFlexibility === 'move_tomorrow'
      ? (() => {
          let tomorrow = addDays(new Date(), 1);
          tomorrow.setHours(12, 0, 0, 0);
          for (let i = 0; i < 7; i++) {
            const day = getWeekdayFromDate(tomorrow);
            const dateKey = toDateKey(tomorrow);
            if (
              !normalizedPrefs.blockedDays.includes(day) &&
              !normalizedPrefs.blockedDates.includes(dateKey)
            ) {
              return { date: dateKey, day, time: chooseTimeForDay(day, normalizedPrefs) };
            }
            tomorrow = addDays(tomorrow, 1);
          }
          return null;
        })()
      : findNextCompatibleSlot(rescheduledSessions, sessionId, normalizedPrefs);

  if (!nextSlot) return plan;

  return {
    ...plan,
    sessions: rescheduledSessions.map((item) =>
      item.id === sessionId
        ? {
            ...item,
            scheduledDate: nextSlot.date,
            scheduledDay: nextSlot.day,
            scheduledTime: nextSlot.time,
            autoRescheduledFrom: item.scheduledDate ?? toDateKey(new Date()),
            isMissed: false,
          }
        : item
    ),
  };
}

export function resolvePlanMetadata(plan: Plan, dog?: Dog | null): PlanMetadata | undefined {
  if (plan.metadata) return plan.metadata;
  if (!dog) return undefined;

  const prefs = normalizeTrainingSchedulePrefs(undefined, dog);
  const trainingDays = chooseTrainingDays({
    sessionsPerWeek: plan.sessionsPerWeek,
    availableDaysPerWeek: dog.availableDaysPerWeek,
    prefs,
  });

  return buildPlanMetadata({
    goal: plan.goal,
    sessionsPerWeek: plan.sessionsPerWeek,
    prefs,
    trainingDays,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Existing helpers kept for compatibility
// ─────────────────────────────────────────────────────────────────────────────

export function isPlanComplete(plan: Plan, completedSessions: string[] = []): boolean {
  const completedSet = new Set(completedSessions);
  return plan.sessions.every((session) => session.isCompleted || completedSet.has(session.id));
}

type WalkGoalKey = `${string}_${number}`;

const WALK_GOALS: Record<string, string> = {
  leash_pulling_1: 'Practice stopping when tension builds — aim for 3 clean stops today',
  leash_pulling_2: 'Hold eye contact at 2 crossings before moving forward',
  leash_pulling_3: 'Try 8 direction changes — make yourself more interesting than the environment',
  recall_1: 'Call once, reward big — even at 5 feet counts as a win',
  recall_2: 'Practice 3 name responses on the walk — stop, call, jackpot when they come',
  recall_3: 'Work on one outdoor recall on the long line if you have it',
  jumping_up_1: 'Ask every person you meet to follow the four-paws-on-floor rule',
  jumping_up_2: 'Rehearse the auto-sit before entering and leaving the house',
  jumping_up_3: 'Find one stranger to practice a polite greeting — brief them first',
  potty_training_1: 'Take a trip to the designated spot immediately after this walk',
  potty_training_2: 'Use the potty cue word every time they squat today',
  potty_training_3: 'Track elimination times to spot your dog\'s natural schedule pattern',
  crate_anxiety_1: 'On return, practice walking calmly past the crate with treats nearby',
  crate_anxiety_2: 'End the walk with a short settle before the crate session',
  crate_anxiety_3: 'Practice the departure routine: walk → settle → crate',
  puppy_biting_1: 'Carry a tug toy on the walk — redirect any mouthing to the toy',
  puppy_biting_2: 'Practice 3 "arousal down" moments: stop, ask for sit, reward calm',
  puppy_biting_3: 'End the walk with a 2-minute calm-on-mat session',
  settling_1: 'End the walk with 2 minutes of mat time to practice the settle cue',
  settling_2: 'Find a bench or café and ask for a settle in a novel environment',
  settling_3: 'Practice "place" in a new spot on this walk — bring a portable mat',
  barking_1: 'Identify your dog\'s threshold distance to their trigger today',
  barking_2: 'Practice 3 "look at that" moments near a mild trigger',
  barking_3: 'Work one trigger exposure at threshold distance, 5 repetitions',
  default_1: 'Keep the walk calm and consistent — reward check-ins at your side',
  default_2: 'Practice 3 name responses and reward each with treats',
  default_3: 'End the walk with a 1-minute calm down before going inside',
};

export function getWalkGoal(behavior: string, stage: number): string {
  const key = `${behavior}_${stage}` as WalkGoalKey;
  return WALK_GOALS[key] ?? WALK_GOALS[`default_${Math.min(stage, 3)}`] ?? 'Have a great walk today!';
}

export function getPlanCompletion(plan: Plan): number {
  if (!plan || plan.sessions.length === 0) return 0;
  const completed = plan.sessions.filter((session) => session.isCompleted).length;
  return Math.round((completed / plan.sessions.length) * 100);
}

const MILESTONES = [1, 5, 10, 15, 20, 25, 30] as const;

export function getNextMilestone(completedCount: number): string {
  const next = MILESTONES.find((milestone) => milestone > completedCount);
  if (!next) return 'You\'ve hit every milestone — you\'re a training champion!';
  const remaining = next - completedCount;
  return remaining === 1
    ? '1 more session to reach your next milestone!'
    : `${remaining} more sessions to reach your ${next}-session milestone!`;
}

export function getLastMilestone(completedCount: number): number | null {
  const hit = [...MILESTONES].reverse().find((milestone) => milestone <= completedCount);
  return hit ?? null;
}

export function isRoundStreakNumber(streak: number): boolean {
  return streak > 0 && [7, 14, 21, 30, 60, 90].includes(streak);
}

export function getGreeting(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function getBehaviorLabel(goal: string): string {
  const map: Record<string, string> = {
    'Leash Pulling': 'Leash',
    'Jumping Up': 'Jumping',
    Barking: 'Barking',
    "Won't Come": 'Recall',
    'Potty Training': 'Potty',
    'Crate Anxiety': 'Crate',
    'Puppy Biting': 'Biting',
    Settling: 'Settling',
  };
  return map[goal] ?? goal;
}

export function formatScheduleLabel(session: PlanSession): string {
  if (session.scheduledDate && session.scheduledTime) {
    const date = parseDate(session.scheduledDate);
    const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return `${label} at ${formatDisplayTime(session.scheduledTime)}`;
  }

  if (session.scheduledDay && session.scheduledTime) {
    return `${session.scheduledDay.slice(0, 3)} at ${formatDisplayTime(session.scheduledTime)}`;
  }

  return `Week ${session.weekNumber} · Day ${session.dayNumber}`;
}

export function formatDisplayTime(time: string): string {
  const [hourString, minuteString] = time.split(':');
  const hour = Number(hourString ?? '0');
  const minute = Number(minuteString ?? '0');
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getScheduledReminderTime(session: PlanSession, prefs?: Partial<NotificationPrefs> | null): string {
  const normalized = normalizeNotificationPrefs(prefs);
  return session.scheduledTime ?? normalized.dailyReminderTime;
}

export function listScheduledDates(plan: Plan): string[] {
  return getSortedScheduleDates(plan.sessions);
}
