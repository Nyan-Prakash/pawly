import { create } from 'zustand';

import { captureEvent } from '@/lib/analytics';
import {
  getNotificationPermissionStatus,
  requestNotificationPermissionIfNeeded,
  scheduleUserNotifications,
  type ScheduledNotification,
} from '@/lib/notifications';
import { normalizeNotificationPrefs } from '@/lib/scheduleEngine';
import { supabase } from '@/lib/supabase';
import type { Dog, NotificationPrefs, Plan } from '@/types';

interface NotificationStore {
  prefs: NotificationPrefs;
  pendingNotifications: ScheduledNotification[];
  permissionStatus: string;
  hasRequestedPermission: boolean;
  isLoading: boolean;

  loadPrefs: (userId: string) => Promise<void>;
  updatePrefs: (userId: string, updates: Partial<NotificationPrefs>) => Promise<void>;
  refreshSchedules: (dog: Dog, plan: Plan) => Promise<void>;
  ensurePermissionAfterMeaningfulAction: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  prefs: normalizeNotificationPrefs(),
  pendingNotifications: [],
  permissionStatus: 'undetermined',
  hasRequestedPermission: false,
  isLoading: false,

  loadPrefs: async (userId) => {
    set({ isLoading: true });
    try {
      const [{ data }, permission] = await Promise.all([
        supabase.from('user_profiles').select('notification_prefs').eq('id', userId).single(),
        getNotificationPermissionStatus(),
      ]);

      const prefs = normalizeNotificationPrefs(data?.notification_prefs ?? {});
      set({
        prefs,
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
          expert_review: nextPrefs.expertReview,
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
  },

  ensurePermissionAfterMeaningfulAction: async () => {
    const { hasRequestedPermission } = get();
    if (hasRequestedPermission) return;

    const result = await requestNotificationPermissionIfNeeded();
    set({
      permissionStatus: result.status,
      hasRequestedPermission: true,
    });
  },
}));
