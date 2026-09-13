import { useEffect, useState } from 'react';
import { Platform, ScrollView, Switch, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { AppIcon } from '@/components/ui/AppIcon';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { haptics } from '@/lib/haptics';
import { formatDisplayTime } from '@/lib/scheduleEngine';
import { useAuthStore } from '@/stores/authStore';
import { useDogStore } from '@/stores/dogStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { usePlanStore } from '@/stores/planStore';
import type { NotificationPrefs } from '@/types';

type BooleanPrefKey = {
  [K in keyof NotificationPrefs]: NotificationPrefs[K] extends boolean ? K : never;
}[keyof NotificationPrefs];

const LEAD_OPTIONS = [5, 15, 30] as const;

const PERMISSION_LABELS: Record<string, string> = {
  granted: 'Allowed',
  denied: 'Not allowed',
  undetermined: 'Not asked yet',
};

const TOGGLES: { key: BooleanPrefKey; title: string; subtitle: string }[] = [
  { key: 'walkReminders', title: 'Walk reminders', subtitle: 'Around your usual walk times' },
  { key: 'postWalkCheckIn', title: 'Post-walk check-in', subtitle: 'Ask how the walk went while it is fresh' },
  { key: 'streakAlerts', title: 'Streak alerts', subtitle: 'When your streak is about to slip' },
  { key: 'milestoneAlerts', title: 'Milestone alerts', subtitle: 'When a milestone is reached or the plan moves on' },
  { key: 'insights', title: 'Weekly insights', subtitle: 'A weekly note on progress' },
  { key: 'lifecycle', title: 'Age and routine reminders', subtitle: 'Tips as your dog grows and routines change' },
  { key: 'expertReview', title: 'Expert review', subtitle: 'When review feedback is ready' },
];

function timeFromPref(value: string): Date {
  const [hour, minute] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(Number.isFinite(hour) ? hour : 19, Number.isFinite(minute) ? minute : 0, 0, 0);
  return date;
}

function prefFromTime(date: Date): string {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function SettingsSkeleton() {
  return (
    <>
      {[2, 3, 7].map((rows, group) => (
        <View key={group}>
          <SkeletonBlock height={26} width="40%" style={{ marginBottom: spacing.sm }} />
          <View style={{ backgroundColor: colors.bg.surface, borderRadius: radii.md, overflow: 'hidden' }}>
            {Array.from({ length: rows }).map((_, i) => (
              <View
                key={i}
                style={{
                  minHeight: 60,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: spacing.lg,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: colors.border.hairline,
                }}
              >
                <View style={{ gap: spacing.xs }}>
                  <SkeletonBlock height={16} width={160} />
                  <SkeletonBlock height={14} width={220} />
                </View>
                <SkeletonBlock height={31} width={51} borderRadius={radii.full} />
              </View>
            ))}
          </View>
        </View>
      ))}
    </>
  );
}

export default function NotificationSettingsScreen() {
  const { user } = useAuthStore();
  const { dog } = useDogStore();
  const { activePlan } = usePlanStore();
  const { prefs, permissionStatus, isLoading, loadPrefs, updatePrefs, refreshSchedules } = useNotificationStore();

  const [hasLoaded, setHasLoaded] = useState(false);
  const [optimistic, setOptimistic] = useState<Partial<NotificationPrefs>>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [showLeadSheet, setShowLeadSheet] = useState(false);
  const [showTimeSheet, setShowTimeSheet] = useState(false);
  const [pendingTime, setPendingTime] = useState<Date>(() => timeFromPref(prefs.dailyReminderTime));
  const [savingTime, setSavingTime] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    loadPrefs(user.id).finally(() => setHasLoaded(true));
  }, [loadPrefs, user?.id]);

  const shown: NotificationPrefs = { ...prefs, ...optimistic };

  async function save(updates: Partial<NotificationPrefs>, failureMessage: string) {
    if (!user?.id) return;
    setErrorMsg('');
    setOptimistic((current) => ({ ...current, ...updates }));
    try {
      await updatePrefs(user.id, updates);
      if (dog && activePlan) {
        await refreshSchedules(dog, activePlan);
      }
    } catch {
      setErrorMsg(failureMessage);
    } finally {
      setOptimistic((current) => {
        const next = { ...current };
        for (const key of Object.keys(updates) as (keyof NotificationPrefs)[]) delete next[key];
        return next;
      });
    }
  }

  function toggle(key: BooleanPrefKey, value: boolean) {
    save({ [key]: value } as Partial<NotificationPrefs>, "Couldn't save that setting. Check your connection and try again.");
  }

  function chooseLead(minutes: (typeof LEAD_OPTIONS)[number]) {
    haptics.selection();
    setShowLeadSheet(false);
    save({ reminderLeadMinutes: minutes }, "Couldn't save the lead time. Check your connection and try again.");
  }

  function openTimeSheet() {
    setPendingTime(timeFromPref(shown.dailyReminderTime));
    setShowTimeSheet(true);
  }

  function handleTimeChange(event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === 'android') {
      setShowTimeSheet(false);
      if (event.type === 'dismissed' || !date) return;
      commitTime(date);
      return;
    }
    if (date) setPendingTime(date);
  }

  async function commitTime(date: Date) {
    setSavingTime(true);
    await save({ dailyReminderTime: prefFromTime(date) }, "Couldn't save the reminder time. Check your connection and try again.");
    setSavingTime(false);
    setShowTimeSheet(false);
  }

  const showSkeleton = !hasLoaded && isLoading;

  return (
    <>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
        {showSkeleton ? (
          <SettingsSkeleton />
        ) : (
          <>
            {errorMsg ? (
              <Text variant="caption" color={colors.status.danger} accessibilityLiveRegion="polite">
                {errorMsg}
              </Text>
            ) : null}

            <View>
              <SectionHeader title="Device" />
              <ListGroup>
                <ListRow
                  icon="notifications-outline"
                  iconTone="secondary"
                  title="Permission"
                  trailing={PERMISSION_LABELS[permissionStatus] ?? permissionStatus}
                />
              </ListGroup>
            </View>

            <View>
              <SectionHeader title="Sessions" />
              <ListGroup>
                <ListRow
                  title="Session reminders"
                  subtitle="Before a scheduled session"
                  trailing={
                    <Switch
                      value={shown.scheduledSessionReminders}
                      onValueChange={(value) => toggle('scheduledSessionReminders', value)}
                      trackColor={{ true: colors.accent }}
                      accessibilityLabel="Session reminders"
                    />
                  }
                />
                <ListRow
                  title="Remind me"
                  subtitle="How long before the session"
                  trailing={`${shown.reminderLeadMinutes} minutes`}
                  onPress={() => setShowLeadSheet(true)}
                  accessibilityHint="Opens the lead time picker"
                />
                <ListRow
                  title="Reminder time"
                  subtitle="Used when a plan day has no set time"
                  trailing={formatDisplayTime(shown.dailyReminderTime)}
                  onPress={openTimeSheet}
                  accessibilityHint="Opens the time picker"
                />
              </ListGroup>
            </View>

            <View>
              <SectionHeader title="Updates" />
              <ListGroup>
                {TOGGLES.map((item) => (
                  <ListRow
                    key={item.key}
                    title={item.title}
                    subtitle={item.subtitle}
                    trailing={
                      <Switch
                        value={shown[item.key]}
                        onValueChange={(value) => toggle(item.key, value)}
                        trackColor={{ true: colors.accent }}
                        accessibilityLabel={item.title}
                      />
                    }
                  />
                ))}
              </ListGroup>
            </View>
          </>
        )}
      </ScrollView>

      <BottomSheet visible={showLeadSheet} onClose={() => setShowLeadSheet(false)} title="Remind me">
        <ListGroup>
          {LEAD_OPTIONS.map((minutes) => (
            <ListRow
              key={minutes}
              title={`${minutes} minutes before`}
              selected={shown.reminderLeadMinutes === minutes}
              trailing={shown.reminderLeadMinutes === minutes ? <AppIcon name="checkmark" color={colors.accent} /> : undefined}
              onPress={() => chooseLead(minutes)}
            />
          ))}
        </ListGroup>
      </BottomSheet>

      {Platform.OS === 'ios' ? (
        <BottomSheet visible={showTimeSheet} onClose={() => setShowTimeSheet(false)} title="Reminder time">
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            <DateTimePicker value={pendingTime} mode="time" display="spinner" onChange={handleTimeChange} />
            <Button label="Set time" loading={savingTime} onPress={() => commitTime(pendingTime)} />
          </View>
        </BottomSheet>
      ) : showTimeSheet ? (
        <DateTimePicker value={pendingTime} mode="time" display="default" onChange={handleTimeChange} />
      ) : null}
    </>
  );
}
