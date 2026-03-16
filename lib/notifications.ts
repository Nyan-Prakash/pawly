import * as Notifications from 'expo-notifications';

import { captureEvent } from '@/lib/analytics';
import {
  formatDisplayTime,
  getScheduledReminderTime,
  normalizeNotificationPrefs,
} from '@/lib/scheduleEngine';
import type { Dog, NotificationPrefs, Plan, PlanSession } from '@/types';

export { didUpcomingScheduleChange } from '@/lib/planScheduleDiff';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type ScheduledNotification = {
  id: string;
  type: 'scheduled_session' | 'walk_reminder' | 'post_walk_check_in' | 'weekly_summary';
  title: string;
  body: string;
};

function parseLocalDateTime(dateString: string, timeString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  const [hour, minute] = timeString.split(':').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1, hour ?? 19, minute ?? 0, 0, 0);
}

function subtractMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() - minutes * 60 * 1000);
}

function sessionReminderBody(dog: Dog, session: PlanSession): string {
  return `${dog.name}'s ${session.title} starts at ${formatDisplayTime(
    session.scheduledTime ?? '19:00'
  )}. ${session.durationMinutes} minutes today.`;
}

async function scheduleNotification(params: {
  identifier: string;
  title: string;
  body: string;
  date: Date;
  data: Record<string, string>;
}): Promise<string | null> {
  if (params.date.getTime() <= Date.now()) return null;

  return Notifications.scheduleNotificationAsync({
    identifier: params.identifier,
    content: {
      title: params.title,
      body: params.body,
      data: params.data,
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: params.date,
    } as Notifications.NotificationTriggerInput,
  });
}

export async function getNotificationPermissionStatus() {
  return Notifications.getPermissionsAsync();
}

export async function requestNotificationPermissionIfNeeded() {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted || existing.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return existing;
  }
  return Notifications.requestPermissionsAsync();
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleUserNotifications(params: {
  dog: Dog;
  plan: Plan;
  prefs?: Partial<NotificationPrefs> | null;
}): Promise<ScheduledNotification[]> {
  const prefs = normalizeNotificationPrefs(params.prefs);
  const scheduled: ScheduledNotification[] = [];

  await cancelAllNotifications();

  if (prefs.scheduledSessionReminders) {
    const sessions = params.plan.sessions
      .filter((session) => !session.isCompleted && session.scheduledDate)
      .slice(0, 12);

    for (const session of sessions) {
      const scheduledTime = getScheduledReminderTime(session, prefs);
      const sessionDate = parseLocalDateTime(session.scheduledDate!, scheduledTime);
      const reminderDate = subtractMinutes(sessionDate, prefs.reminderLeadMinutes);
      const id = `scheduled-session-${session.id}`;

      const result = await scheduleNotification({
        identifier: id,
        title: 'Training reminder',
        body: sessionReminderBody(params.dog, session),
        date: reminderDate,
        data: {
          type: 'scheduled_session',
          path: '/(tabs)/train',
          sessionId: session.id,
        },
      });

      if (result) {
        scheduled.push({
          id,
          type: 'scheduled_session',
          title: 'Training reminder',
          body: sessionReminderBody(params.dog, session),
        });
      }
    }
  }

  if (prefs.walkReminders) {
    for (const [index, walkTime] of params.dog.usualWalkTimes.entries()) {
      const date = new Date();
      const [hour, minute] = walkTime.split(':').map(Number);
      date.setHours(hour ?? 8, minute ?? 0, 0, 0);
      if (date.getTime() <= Date.now()) {
        date.setDate(date.getDate() + 1);
      }

      const id = `walk-reminder-${index}`;
      const body = `Time for ${params.dog.name}'s walk. Keep an eye out for a quick training win.`;
      const result = await scheduleNotification({
        identifier: id,
        title: 'Walk reminder',
        body,
        date,
        data: {
          type: 'walk_reminder',
          path: '/(tabs)/train',
        },
      });

      if (result) {
        scheduled.push({ id, type: 'walk_reminder', title: 'Walk reminder', body });
      }

      if (prefs.postWalkCheckIn) {
        const checkInDate = new Date(date.getTime() + 45 * 60 * 1000);
        const checkInId = `walk-check-in-${index}`;
        const checkInBody = `How did that walk go with ${params.dog.name}? Log it while it’s fresh.`;
        const checkInResult = await scheduleNotification({
          identifier: checkInId,
          title: 'Post-walk check-in',
          body: checkInBody,
          date: checkInDate,
          data: {
            type: 'post_walk_check_in',
            path: '/(tabs)/train',
          },
        });

        if (checkInResult) {
          scheduled.push({
            id: checkInId,
            type: 'post_walk_check_in',
            title: 'Post-walk check-in',
            body: checkInBody,
          });
        }
      }
    }
  }

  captureEvent('plan_schedule_generated', {
    scheduledNotifications: scheduled.length,
    scheduledSessions: params.plan.sessions.filter((session) => session.scheduledDate).length,
  });

  return scheduled;
}

export function getRouteFromNotification(data: Record<string, any> | undefined): string {
  return typeof data?.path === 'string' ? data.path : '/(tabs)/train';
}

export function trackNotificationOpened(type?: string) {
  captureEvent('notification_opened', { type: type ?? 'unknown' });
}
