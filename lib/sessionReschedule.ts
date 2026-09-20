/**
 * sessionReschedule.ts
 *
 * Owner-initiated schedule changes from the calendar: move one session to a
 * chosen day, or skip it for now. Pure, deterministic date logic; no side
 * effects, no Supabase, no Zustand.
 *
 * Sessions live in the plan's `sessions` JSON and have no "skipped" state:
 * every reader (today, missed, upcoming, plan completion) only knows
 * completed or not. So a skip does not drop the session. It pushes it to the
 * plan's next training day, and the sessions after it shift back one slot
 * each so the course keeps its order.
 *
 * Neither change touches `autoRescheduledFrom`; that field belongs to the
 * automatic missed-session reschedule in scheduleEngine.
 */

import { getWeekdayFromDate } from './scheduleEngine.ts';
import type { Plan, PlanSession, Weekday } from '../types/index.ts';

export interface MoveDateOption {
  dateKey: string;
  date: Date;
  isToday: boolean;
}

interface Slot {
  scheduledDate: string;
  scheduledDay: Weekday;
  scheduledTime?: string;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Noon, so adding days never lands on the wrong date across a DST change. */
export function parseDateKey(dateKey: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0, 0);
  return toDateKey(date) === dateKey ? date : null;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function bySchedule(a: PlanSession, b: PlanSession): number {
  const dateCompare = (a.scheduledDate ?? '').localeCompare(b.scheduledDate ?? '');
  if (dateCompare !== 0) return dateCompare;
  return (a.scheduledTime ?? '').localeCompare(b.scheduledTime ?? '');
}

/**
 * The days a session can be moved to: the next `count` days starting today,
 * leaving out the day it is already on.
 */
export function getMoveDateOptions(
  session: Pick<PlanSession, 'scheduledDate'>,
  now: Date = new Date(),
  count = 7
): MoveDateOption[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
  const todayKey = toDateKey(today);
  const options: MoveDateOption[] = [];

  for (let offset = 0; options.length < count; offset++) {
    const date = addDays(today, offset);
    const dateKey = toDateKey(date);
    if (dateKey === session.scheduledDate) continue;
    options.push({ dateKey, date, isToday: dateKey === todayKey });
  }

  return options;
}

/**
 * Move one session to `dateKey`, keeping its time of day. Returns the same
 * plan object when there is nothing to change.
 */
export function moveSessionToDate(plan: Plan, sessionId: string, dateKey: string): Plan {
  const session = plan.sessions.find((item) => item.id === sessionId);
  const date = parseDateKey(dateKey);
  if (!session || session.isCompleted || !date || session.scheduledDate === dateKey) {
    return plan;
  }

  return {
    ...plan,
    sessions: plan.sessions.map((item) =>
      item.id === sessionId
        ? {
            ...item,
            scheduledDate: dateKey,
            scheduledDay: getWeekdayFromDate(date),
            isMissed: false,
            schedulingReason: 'moved_by_owner',
          }
        : item
    ),
  };
}

/** The weekdays this plan trains on: its metadata, else the days its sessions sit on. */
function getTrainingDays(plan: Plan): Weekday[] {
  if (plan.metadata?.preferredDays?.length) return plan.metadata.preferredDays;
  const days = new Set<Weekday>();
  for (const session of plan.sessions) {
    if (session.scheduledDay) days.add(session.scheduledDay);
  }
  return [...days];
}

function nextTrainingDateAfter(dateKey: string, trainingDays: Weekday[]): Date | null {
  const start = parseDateKey(dateKey);
  if (!start) return null;
  for (let offset = 1; offset <= 7; offset++) {
    const date = addDays(start, offset);
    if (trainingDays.length === 0 || trainingDays.includes(getWeekdayFromDate(date))) return date;
  }
  return null;
}

/**
 * Skip a session for now. It takes the slot of the plan's next session, each
 * later session takes the slot after it, and the last one moves to the next
 * training day past the end. With nothing scheduled after it, the session
 * itself moves to the next training day.
 *
 * A missed session is pushed from today, not from the day it was missed, so
 * it never lands in the past.
 */
export function skipSessionToNextTrainingDay(plan: Plan, sessionId: string, now: Date = new Date()): Plan {
  const target = plan.sessions.find((item) => item.id === sessionId);
  if (!target || target.isCompleted || !target.scheduledDate) return plan;

  const todayKey = toDateKey(now);
  const fromKey = target.scheduledDate > todayKey ? target.scheduledDate : todayKey;
  const trainingDays = getTrainingDays(plan);

  const later = plan.sessions
    .filter((item) => item.id !== sessionId && !item.isCompleted && (item.scheduledDate ?? '') > fromKey)
    .sort(bySchedule);

  const chain = [target, ...later];
  const lastKey = later.length > 0 ? later[later.length - 1]!.scheduledDate! : fromKey;
  const tailDate = nextTrainingDateAfter(lastKey, trainingDays);
  if (!tailDate) return plan;

  const slots: Slot[] = [
    ...later.map((item) => ({
      scheduledDate: item.scheduledDate!,
      scheduledDay: item.scheduledDay ?? getWeekdayFromDate(parseDateKey(item.scheduledDate!) ?? tailDate),
      scheduledTime: item.scheduledTime,
    })),
    {
      scheduledDate: toDateKey(tailDate),
      scheduledDay: getWeekdayFromDate(tailDate),
      scheduledTime: chain[chain.length - 1]!.scheduledTime,
    },
  ];

  const nextSlotById = new Map(chain.map((item, index) => [item.id, slots[index]!]));

  return {
    ...plan,
    sessions: plan.sessions.map((item) => {
      const slot = nextSlotById.get(item.id);
      if (!slot) return item;
      return {
        ...item,
        scheduledDate: slot.scheduledDate,
        scheduledDay: slot.scheduledDay,
        scheduledTime: slot.scheduledTime ?? item.scheduledTime,
        isMissed: false,
        ...(item.id === sessionId ? { schedulingReason: 'skipped_by_owner' } : {}),
      };
    }),
  };
}
