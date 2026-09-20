import { create } from 'zustand';
import type { RealtimeChannel } from '@supabase/supabase-js';

import { captureEvent } from '@/lib/analytics';
import { isDuplicatePlanUpdateNotification } from '@/lib/inAppNotifications';
import { mapInAppNotificationRowToModel } from '@/lib/modelMappers';
import {
  getNotificationPermissionStatus,
  requestNotificationPermissionIfNeeded,
  scheduleStreakReminder,
  scheduleUserNotifications,
  scheduleUserNotificationsForPlans,
  type ScheduledNotification,
} from '@/lib/notifications';
import { normalizeNotificationPrefs } from '@/lib/scheduleEngine';
import { supabase } from '@/lib/supabase';
import { useDogStore } from '@/stores/dogStore';
import type { Dog, InAppNotification, InAppNotificationType, NotificationPrefs, Plan } from '@/types';

interface NotificationStore {
  prefs: NotificationPrefs;
  pendingNotifications: ScheduledNotification[];
  permissionStatus: string;
  hasRequestedPermission: boolean;
  /** False until loadPrefs has read the saved prefs; `prefs` holds the defaults until then. */
  hasLoadedPrefs: boolean;
  isLoading: boolean;
  items: InAppNotification[];
  unreadCount: number;
  isLoadingInbox: boolean;

  loadPrefs: (userId: string) => Promise<void>;
  updatePrefs: (userId: string, updates: Partial<NotificationPrefs>) => Promise<void>;
  refreshSchedules: (dog: Dog, plan: Plan) => Promise<void>;
  /** Multi-plan variant — prefers this over refreshSchedules when multiple courses are active. */
  refreshSchedulesForPlans: (dog: Dog, plans: Plan[]) => Promise<void>;
  /**
   * Re-plan the evening streak reminder from the streaks row: tonight if the
   * streak is still open, tomorrow night once today's session is saved. Runs
   * after every schedule refresh and every saved session.
   */
  syncStreakReminder: (dog: Dog) => Promise<void>;
  ensurePermissionAfterMeaningfulAction: () => Promise<void>;
  fetchInbox: (userId: string) => Promise<void>;
  addNotification: (input: {
    userId: string;
    dogId?: string | null;
    type: InAppNotificationType;
    title: string;
    body: string;
    metadata?: Record<string, unknown>;
  }) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  hydrateRealtime: (userId: string) => (() => void);
}

/** user_profiles.notification_prefs is stored snake_case (see updatePrefs). */
const PREF_COLUMNS: Record<keyof NotificationPrefs, string> = {
  dailyReminder: 'daily_reminder',
  dailyReminderTime: 'daily_reminder_time',
  walkReminders: 'walk_reminders',
  postWalkCheckIn: 'post_walk_check_in',
  streakAlerts: 'streak_alerts',
  milestoneAlerts: 'milestone_alerts',
  insights: 'insights',
  lifecycle: 'lifecycle',
  weeklySummary: 'weekly_summary',
  scheduledSessionReminders: 'scheduled_session_reminders',
  reminderLeadMinutes: 'reminder_lead_minutes',
  fallbackMissedSessionReminders: 'fallback_missed_session_reminders',
};

function prefsFromRow(row: Record<string, unknown> | null | undefined): Partial<NotificationPrefs> {
  const prefs: Record<string, unknown> = {};
  for (const [key, column] of Object.entries(PREF_COLUMNS)) {
    const value = row?.[column] ?? row?.[key];
    if (value !== undefined && value !== null) prefs[key] = value;
  }
  return prefs as Partial<NotificationPrefs>;
}

function deriveUnreadCount(items: InAppNotification[]): number {
  return items.reduce((count, item) => count + (item.isRead ? 0 : 1), 0);
}

function withDerivedInboxState(items: InAppNotification[]) {
  return {
    items,
    unreadCount: deriveUnreadCount(items),
  };
}

let inboxChannel: RealtimeChannel | null = null;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  prefs: normalizeNotificationPrefs(),
  pendingNotifications: [],
  permissionStatus: 'undetermined',
  hasRequestedPermission: false,
  hasLoadedPrefs: false,
  isLoading: false,
  items: [],
  unreadCount: 0,
  isLoadingInbox: false,

  loadPrefs: async (userId) => {
    set({ isLoading: true });
    try {
      const [{ data }, permission] = await Promise.all([
        supabase.from('user_profiles').select('notification_prefs').eq('id', userId).single(),
        getNotificationPermissionStatus(),
      ]);

      const prefs = normalizeNotificationPrefs(prefsFromRow(data?.notification_prefs));
      set({
        prefs,
        hasLoadedPrefs: true,
        permissionStatus: permission.status,
        hasRequestedPermission: permission.status !== 'undetermined',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  updatePrefs: async (userId, updates) => {
    const nextPrefs = normalizeNotificationPrefs({ ...get().prefs, ...updates });
    const { error } = await supabase
      .from('user_profiles')
      .update({
        notification_prefs: {
          daily_reminder: nextPrefs.dailyReminder,
          daily_reminder_time: nextPrefs.dailyReminderTime,
          walk_reminders: nextPrefs.walkReminders,
          post_walk_check_in: nextPrefs.postWalkCheckIn,
          streak_alerts: nextPrefs.streakAlerts,
          milestone_alerts: nextPrefs.milestoneAlerts,
          insights: nextPrefs.insights,
          lifecycle: nextPrefs.lifecycle,
          weekly_summary: nextPrefs.weeklySummary,
          scheduled_session_reminders: nextPrefs.scheduledSessionReminders,
          reminder_lead_minutes: nextPrefs.reminderLeadMinutes,
          fallback_missed_session_reminders: nextPrefs.fallbackMissedSessionReminders,
        },
      })
      .eq('id', userId);

    if (error) throw error;
    set({ prefs: nextPrefs });
    captureEvent('reminder_time_updated', updates);
  },

  refreshSchedules: async (dog, plan) => {
    const notifications = await scheduleUserNotifications({
      dog,
      plan,
      prefs: get().prefs,
    });
    set({ pendingNotifications: notifications });
    // The refresh cancels everything, the streak reminder included.
    await get().syncStreakReminder(dog).catch(() => {});
  },

  refreshSchedulesForPlans: async (dog, plans) => {
    const notifications = await scheduleUserNotificationsForPlans({
      dog,
      plans,
      prefs: get().prefs,
    });
    set({ pendingNotifications: notifications });
    await get().syncStreakReminder(dog).catch(() => {});
  },

  syncStreakReminder: async (dog) => {
    // Session completion can run before the settings screen has ever loaded the prefs.
    if (!get().hasLoadedPrefs) {
      await get().loadPrefs(dog.ownerId).catch(() => {});
    }

    const { data } = await supabase
      .from('streaks')
      .select('current_streak, last_session_date')
      .eq('user_id', dog.ownerId)
      .eq('dog_id', dog.id)
      .maybeSingle();

    const reminder = await scheduleStreakReminder({
      dog,
      currentStreak: data?.current_streak ?? 0,
      lastSessionDate: data?.last_session_date ?? null,
      prefs: get().prefs,
    });

    const others = get().pendingNotifications.filter((item) => item.type !== 'streak_at_risk');
    set({ pendingNotifications: reminder ? [...others, reminder] : others });
  },

  ensurePermissionAfterMeaningfulAction: async () => {
    if (!get().hasRequestedPermission) {
      const result = await requestNotificationPermissionIfNeeded();
      captureEvent('notification_permission_result', { status: result.status });
      set({
        permissionStatus: result.status,
        hasRequestedPermission: true,
      });
    }

    // The meaningful action is a saved session: tonight's streak reminder is
    // no longer needed and tomorrow's takes its place.
    const dog = useDogStore.getState().dog;
    if (dog) await get().syncStreakReminder(dog).catch(() => {});
  },

  fetchInbox: async (userId) => {
    set({ isLoadingInbox: true });
    try {
      const { data, error } = await supabase
        .from('in_app_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const items = (data ?? []).map((row) =>
        mapInAppNotificationRowToModel(row as unknown as Record<string, unknown>)
      );
      set({
        ...withDerivedInboxState(items),
        isLoadingInbox: false,
      });
    } catch (error) {
      console.warn('[notificationStore] fetchInbox error:', error);
      set({ isLoadingInbox: false });
    }
  },

  addNotification: async (input) => {
    const metadata = input.metadata ?? {};

    const existingDuplicate = get().items.some((item) =>
      isDuplicatePlanUpdateNotification(item, metadata)
    );
    if (existingDuplicate) return;

    const { data: existingRows, error: existingError } = await supabase
      .from('in_app_notifications')
      .select('*')
      .eq('user_id', input.userId)
      .eq('type', input.type)
      .order('created_at', { ascending: false })
      .limit(25);

    if (existingError) throw existingError;

    const duplicateInDb = (existingRows ?? [])
      .map((row) => mapInAppNotificationRowToModel(row as unknown as Record<string, unknown>))
      .some((item) => isDuplicatePlanUpdateNotification(item, metadata));

    if (duplicateInDb) return;

    const { data, error } = await supabase
      .from('in_app_notifications')
      .insert({
        user_id: input.userId,
        dog_id: input.dogId ?? null,
        type: input.type,
        title: input.title,
        body: input.body,
        metadata,
      })
      .select('*')
      .single();

    if (error) throw error;

    const nextItem = mapInAppNotificationRowToModel(data as unknown as Record<string, unknown>);
    const nextItems = [nextItem, ...get().items.filter((item) => item.id !== nextItem.id)];
    set(withDerivedInboxState(nextItems));
  },

  markAsRead: async (notificationId) => {
    const currentItems = get().items;
    const existing = currentItems.find((item) => item.id === notificationId);
    if (!existing || existing.isRead) return;

    const readAt = new Date().toISOString();
    const optimisticItems = currentItems.map((item) =>
      item.id === notificationId ? { ...item, isRead: true, readAt } : item
    );
    set(withDerivedInboxState(optimisticItems));

    const { error } = await supabase
      .from('in_app_notifications')
      .update({
        is_read: true,
        read_at: readAt,
      })
      .eq('id', notificationId);

    if (error) {
      console.warn('[notificationStore] markAsRead error:', error);
      set(withDerivedInboxState(currentItems));
    }
  },

  markAllAsRead: async (userId) => {
    const currentItems = get().items;
    if (currentItems.every((item) => item.isRead)) return;

    const readAt = new Date().toISOString();
    const optimisticItems = currentItems.map((item) =>
      item.isRead ? item : { ...item, isRead: true, readAt }
    );
    set(withDerivedInboxState(optimisticItems));

    const { error } = await supabase
      .from('in_app_notifications')
      .update({
        is_read: true,
        read_at: readAt,
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.warn('[notificationStore] markAllAsRead error:', error);
      set(withDerivedInboxState(currentItems));
    }
  },

  hydrateRealtime: (userId) => {
    if (inboxChannel) {
      supabase.removeChannel(inboxChannel);
      inboxChannel = null;
    }

    inboxChannel = supabase
      .channel(`in_app_notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'in_app_notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const nextItem = mapInAppNotificationRowToModel(
            payload.new as unknown as Record<string, unknown>
          );
          const items = get().items;
          if (items.some((item) => item.id === nextItem.id)) return;
          set(withDerivedInboxState([nextItem, ...items]));
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'in_app_notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedItem = mapInAppNotificationRowToModel(
            payload.new as unknown as Record<string, unknown>
          );
          const nextItems = get().items.map((item) =>
            item.id === updatedItem.id ? updatedItem : item
          );
          set(withDerivedInboxState(nextItems));
        },
      )
      .subscribe();

    return () => {
      if (inboxChannel) {
        supabase.removeChannel(inboxChannel);
        inboxChannel = null;
      }
    };
  },
}));
