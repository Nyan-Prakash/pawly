/**
 * streakReminder.ts
 *
 * Decides when the evening "streak at risk" reminder should fire. Pure: no
 * Expo, Supabase or store imports, so it runs under node --test.
 *
 * A local notification cannot look at app state when it fires, so the decision
 * is made when it is scheduled:
 *   - Trained today     → the streak is safe today; remind tomorrow evening.
 *   - Trained yesterday → the streak ends tonight; remind this evening.
 *   - Anything older    → the streak is already over; no reminder.
 * Saving a session re-runs this, which replaces tonight's reminder with
 * tomorrow's.
 */

/** Local HH:mm. There is no quiet-hours preference to derive this from. */
export const STREAK_REMINDER_TIME = '19:30';

/** A one-day streak is not worth a nudge. */
export const STREAK_REMINDER_MIN_DAYS = 2;

export interface StreakReminderPlan {
  fireAt: Date;
  /** The streak length the reminder names. */
  streakDays: number;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function atLocalTime(day: Date, time: string): Date {
  const [hour, minute] = time.split(':').map(Number);
  return new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    Number.isFinite(hour) ? hour! : 19,
    Number.isFinite(minute) ? minute! : 30,
    0,
    0
  );
}

export function resolveStreakReminder(params: {
  currentStreak: number;
  /** streaks.last_session_date, YYYY-MM-DD. */
  lastSessionDate: string | null | undefined;
  now?: Date;
  reminderTime?: string;
}): StreakReminderPlan | null {
  const { currentStreak, lastSessionDate } = params;
  if (!lastSessionDate || currentStreak < STREAK_REMINDER_MIN_DAYS) return null;

  const now = params.now ?? new Date();
  const time = params.reminderTime ?? STREAK_REMINDER_TIME;
  const todayKey = toDateKey(now);
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  // ">=" also covers a dog whose timezone is ahead of the device.
  if (lastSessionDate >= todayKey) {
    return { fireAt: atLocalTime(tomorrow, time), streakDays: currentStreak };
  }

  if (lastSessionDate === toDateKey(yesterday)) {
    const fireAt = atLocalTime(now, time);
    return fireAt.getTime() > now.getTime() ? { fireAt, streakDays: currentStreak } : null;
  }

  return null;
}

export function buildStreakReminderCopy(dogName: string, streakDays: number): { title: string; body: string } {
  return {
    title: `Keep ${dogName}'s streak going`,
    body: `${streakDays} days in a row. A five-minute session tonight keeps it.`,
  };
}
