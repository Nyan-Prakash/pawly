import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { getCourseUiColors } from '@/constants/courseColors';
import { spacing } from '@/constants/spacing';
import { selectSelectedPlanTheme, usePlanStore } from '@/stores/planStore';
import { useDogStore } from '@/stores/dogStore';
import { TrainingCalendar } from '@/components/train/TrainingCalendar';
import { DaySessionList } from '@/components/train/DaySessionList';
import { toDateKey } from '@/lib/calendarSessions';
import type { EnrichedPlanSession } from '@/types';

export default function CalendarScreen() {
  const planStore = usePlanStore();
  const { isLoading, fetchActivePlans, getGroupedSessionsForCalendar, activePlanIds } = planStore;
  const { dog } = useDogStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedPlanTheme = selectSelectedPlanTheme(planStore);
  const accentColor = selectedPlanTheme?.solid ?? getCourseUiColors('fallback').solid;

  useEffect(() => {
    if (dog?.id && activePlanIds.length === 0) {
      fetchActivePlans(dog.id);
    }
  }, [dog?.id, activePlanIds.length, fetchActivePlans]);

  // Merged sessions across all active plans, grouped by date
  const groupedSessions = useMemo(
    () => getGroupedSessionsForCalendar(),
    // Re-derive when plan data changes (activePlanIds is the reactive signal)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activePlanIds, getGroupedSessionsForCalendar]
  );

  useEffect(() => {
    const scheduledDates = Object.keys(groupedSessions).sort();
    if (scheduledDates.length === 0) return;

    const todayKey = toDateKey(new Date());
    const nextDateKey = scheduledDates.find((dateKey) => dateKey >= todayKey) ?? scheduledDates[0];
    const [year, month, day] = nextDateKey.split('-').map(Number);
    if (!year || !month || !day) return;

    setSelectedDate((current) => (
      toDateKey(current) === nextDateKey ? current : new Date(year, month - 1, day)
    ));
  }, [groupedSessions]);

  const selectedDateSessions: EnrichedPlanSession[] = useMemo(
    () => (groupedSessions[toDateKey(selectedDate)] ?? []) as EnrichedPlanSession[],
    [groupedSessions, selectedDate]
  );

  const hasPlans = activePlanIds.length > 0;
  const multiplePlans = activePlanIds.length > 1;

  return (
    <SafeScreen>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          paddingTop: spacing.md,
          paddingBottom: spacing.sm,
          gap: spacing.sm,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ minHeight: 44, minWidth: 44, justifyContent: 'center' }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text variant="title" style={{ fontSize: 20 }}>Training Calendar</Text>
          {dog?.name && (
            <Text variant="micro" color={colors.text.secondary}>
              {multiplePlans
                ? `All active courses · ${dog.name}`
                : `Stay on track with ${dog.name}`}
            </Text>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xxl }}
      >
        {isLoading && !hasPlans ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 }}>
            <LoadingSpinner />
          </View>
        ) : !hasPlans ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 }}>
            <Ionicons name="calendar-outline" size={64} color={colors.border.default} />
            <Text variant="h3" style={{ marginTop: spacing.md }}>No Active Plan</Text>
            <Text color={colors.text.secondary} style={{ textAlign: 'center', marginTop: spacing.xs }}>
              Start a training plan to see your sessions on the calendar.
            </Text>
          </View>
        ) : (
          <>
            <TrainingCalendar
              groupedSessions={groupedSessions}
              selectedDate={selectedDate}
              accentColor={accentColor}
              onDateSelect={setSelectedDate}
            />

            <DaySessionList
              date={selectedDate}
              sessions={selectedDateSessions}
              showCourseBadge={multiplePlans}
            />
          </>
        )}
      </ScrollView>
    </SafeScreen>
  );
}
