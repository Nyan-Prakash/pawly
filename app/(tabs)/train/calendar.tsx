import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';

import { DaySessionList } from '@/components/train/DaySessionList';
import { TrainingCalendar } from '@/components/train/TrainingCalendar';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { toDateKey } from '@/lib/calendarSessions';
import { useDogStore } from '@/stores/dogStore';
import { usePlanStore } from '@/stores/planStore';
import type { EnrichedPlanSession } from '@/types';

/** Mirrors the month grid so the swap to real data doesn't jump. */
function CalendarSkeleton() {
  return (
    <View style={{ gap: spacing.xl }}>
      <View style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <SkeletonBlock height={26} width={160} />
          <SkeletonBlock height={44} width={88} borderRadius={radii.full} />
        </View>
        {Array.from({ length: 6 }, (_, row) => (
          <View key={row} style={{ flexDirection: 'row' }}>
            {Array.from({ length: 7 }, (_, col) => (
              <View key={col} style={{ flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}>
                <SkeletonBlock height={44} width={44} borderRadius={radii.full} />
              </View>
            ))}
          </View>
        ))}
      </View>
      <View style={{ gap: spacing.sm }}>
        <SkeletonBlock height={26} width={200} />
        <SkeletonBlock height={2 * 64} borderRadius={radii.md} />
      </View>
    </View>
  );
}

export default function CalendarScreen() {
  const { isLoading, fetchActivePlans, getGroupedSessionsForCalendar, activePlanIds } = usePlanStore();
  const { dog } = useDogStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

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
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl, flexGrow: 1 }}
    >
      {isLoading && !hasPlans ? (
        <CalendarSkeleton />
      ) : !hasPlans ? (
        <EmptyState
          icon="calendar-outline"
          title="No active plan"
          subtitle="Add a course to see your sessions on the calendar."
          action={{ label: 'Add a course', onPress: () => router.push('/(tabs)/train/add-course' as never) }}
          style={{ flex: 1, justifyContent: 'center' }}
        />
      ) : (
        <>
          <TrainingCalendar
            groupedSessions={groupedSessions}
            selectedDate={selectedDate}
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
  );
}
