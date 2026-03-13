import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { formatDisplayTime } from '@/lib/scheduleEngine';
import { useAuthStore } from '@/stores/authStore';
import { useDogStore } from '@/stores/dogStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { usePlanStore } from '@/stores/planStore';

function ToggleRow({
  label,
  description,
  value,
  onPress,
}: {
  label: string;
  description: string;
  value: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: colors.bg.surface,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border.default,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flex: 1, paddingRight: spacing.md }}>
        <Text variant="bodyStrong">{label}</Text>
        <Text variant="caption">{description}</Text>
      </View>
      <View
        style={{
          width: 52,
          padding: 4,
          borderRadius: 999,
          backgroundColor: value ? colors.brand.primary : colors.border.default,
          alignItems: value ? 'flex-end' : 'flex-start',
        }}
      >
        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' }} />
      </View>
    </Pressable>
  );
}

export default function NotificationSettingsScreen() {
  const { user } = useAuthStore();
  const { dog } = useDogStore();
  const { activePlan } = usePlanStore();
  const { prefs, permissionStatus, loadPrefs, updatePrefs, refreshSchedules } = useNotificationStore();
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadPrefs(user.id);
    }
  }, [loadPrefs, user?.id]);

  const handleTimeChange = async (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'dismissed' || !date || !user?.id) {
      setShowTimePicker(false);
      return;
    }

    const time = `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
    await updatePrefs(user.id, { dailyReminderTime: time });
    if (dog && activePlan) {
      await refreshSchedules(dog, activePlan);
    }
    if (Platform.OS !== 'ios') {
      setShowTimePicker(false);
    }
  };

  async function toggle<K extends keyof typeof prefs>(key: K) {
    if (!user?.id) return;
    await updatePrefs(user.id, { [key]: !prefs[key] } as Partial<typeof prefs>);
    if (dog && activePlan) {
      await refreshSchedules(dog, activePlan);
    }
  }

  return (
    <SafeScreen>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          paddingHorizontal: spacing.md,
          paddingTop: spacing.md,
          paddingBottom: spacing.sm,
        }}
      >
        <Pressable onPress={() => router.back()} style={{ minHeight: 44, minWidth: 44, justifyContent: 'center' }}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </Pressable>
        <Text variant="title">Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl * 2 }}>
        <View
          style={{
            backgroundColor: colors.bg.surface,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.border.default,
            padding: spacing.md,
          }}
        >
          <Text variant="micro" color={colors.text.secondary}>
            Permission status
          </Text>
          <Text variant="bodyStrong" style={{ marginTop: 4, textTransform: 'capitalize' }}>
            {permissionStatus}
          </Text>
        </View>

        <ToggleRow
          label="Training reminders"
          description="Remind me when a scheduled session is coming up."
          value={prefs.scheduledSessionReminders}
          onPress={() => toggle('scheduledSessionReminders')}
        />

        <Pressable
          onPress={() => setShowTimePicker(true)}
          style={{
            backgroundColor: colors.bg.surface,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.border.default,
            padding: spacing.md,
          }}
        >
          <Text variant="bodyStrong">Fallback reminder time</Text>
          <Text variant="caption">Used when a plan day has no exact scheduled time.</Text>
          <Text variant="bodyStrong" style={{ marginTop: spacing.sm, color: colors.brand.primary }}>
            {formatDisplayTime(prefs.dailyReminderTime)}
          </Text>
        </Pressable>

        <Pressable
          onPress={async () => {
            if (!user?.id) return;
            const nextLead = prefs.reminderLeadMinutes === 15 ? 30 : prefs.reminderLeadMinutes === 30 ? 5 : 15;
            await updatePrefs(user.id, { reminderLeadMinutes: nextLead });
            if (dog && activePlan) {
              await refreshSchedules(dog, activePlan);
            }
          }}
          style={{
            backgroundColor: colors.bg.surface,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.border.default,
            padding: spacing.md,
          }}
        >
          <Text variant="bodyStrong">Reminder lead time</Text>
          <Text variant="caption">Cycles through 5, 15, and 30 minutes.</Text>
          <Text variant="bodyStrong" style={{ marginTop: spacing.sm, color: colors.brand.primary }}>
            {prefs.reminderLeadMinutes} minutes
          </Text>
        </Pressable>

        <ToggleRow
          label="Walk reminders"
          description="Remind me around my usual walk times."
          value={prefs.walkReminders}
          onPress={() => toggle('walkReminders')}
        />
        <ToggleRow
          label="Post-walk check-in"
          description="Ask how the walk went while it’s still fresh."
          value={prefs.postWalkCheckIn}
          onPress={() => toggle('postWalkCheckIn')}
        />
        <ToggleRow
          label="Streak alerts"
          description="Warn me when my streak is about to slip."
          value={prefs.streakAlerts}
          onPress={() => toggle('streakAlerts')}
        />
        <ToggleRow
          label="Milestone alerts"
          description="Celebrate milestones and plan progress."
          value={prefs.milestoneAlerts}
          onPress={() => toggle('milestoneAlerts')}
        />
        <ToggleRow
          label="Insights"
          description="Receive weekly insight and progress nudges."
          value={prefs.insights}
          onPress={() => toggle('insights')}
        />
        <ToggleRow
          label="Lifecycle"
          description="Get age and routine-based reminders."
          value={prefs.lifecycle}
          onPress={() => toggle('lifecycle')}
        />
        <ToggleRow
          label="Expert review"
          description="Notify me when review feedback is ready."
          value={prefs.expertReview}
          onPress={() => toggle('expertReview')}
        />
      </ScrollView>

      {showTimePicker ? (
        <DateTimePicker
          value={(() => {
            const [hour, minute] = prefs.dailyReminderTime.split(':').map(Number);
            const date = new Date();
            date.setHours(hour ?? 19, minute ?? 0, 0, 0);
            return date;
          })()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      ) : null}
    </SafeScreen>
  );
}
