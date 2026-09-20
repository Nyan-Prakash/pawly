import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';

import { DaySessionList } from '@/components/train/DaySessionList';
import { SessionScheduleSheet } from '@/components/train/SessionScheduleSheet';
import { TrainingCalendar } from '@/components/train/TrainingCalendar';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { toDateKey } from '@/lib/calendarSessions';
import { haptics } from '@/lib/haptics';
import { getBehaviorLabel } from '@/lib/scheduleEngine';
import { parseDateKey } from '@/lib/sessionReschedule';
import { useDogStore } from '@/stores/dogStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { usePlanStore } from '@/stores/planStore';
import type { EnrichedPlanSession, Plan } from '@/types';

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

function formatShortDay(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return date ? date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '';
}

export default function CalendarScreen() {
  const {
    isLoading,
    fetchActivePlans,
    getGroupedSessionsForCalendar,
    activePlanIds,
    plansById,
    missedSessions,
    moveSessionToDate,
    skipSession,
  } = usePlanStore();
  const { dog } = useDogStore();
  const refreshSchedulesForPlans = useNotificationStore((s) => s.refreshSchedulesForPlans);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sheetSession, setSheetSession] = useState<EnrichedPlanSession | null>(null);
  const [isSavingChange, setIsSavingChange] = useState(false);
  const [sheetError, setSheetError] = useState('');
  const [missedError, setMissedError] = useState('');
  const hasAutoSelected = useRef(false);

  useEffect(() => {
    if (dog?.id && activePlanIds.length === 0) {
      fetchActivePlans(dog.id);
    }
  }, [dog?.id, activePlanIds.length, fetchActivePlans]);

  // Merged sessions across all active plans, grouped by date
  const groupedSessions = useMemo(
    () => getGroupedSessionsForCalendar(),
    // Re-derive when plan data changes (plansById is replaced on every move or skip)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activePlanIds, plansById, getGroupedSessionsForCalendar]
  );

  // Land on the next scheduled day once. After that the selection is the
  // owner's, and a move or skip points it at the session's new day.
  useEffect(() => {
    if (hasAutoSelected.current) return;
    const scheduledDates = Object.keys(groupedSessions).sort();
    if (scheduledDates.length === 0) return;
    hasAutoSelected.current = true;

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
  const movableSessions = selectedDateSessions.filter((session) => !session.isCompleted);

  function openSheet(session: EnrichedPlanSession) {
    setSheetError('');
    setSheetSession(session);
  }

  /** Save a move or skip, then show the session's new day and re-plan reminders. */
  async function applyChange(change: () => Promise<string | null>): Promise<boolean> {
    if (isSavingChange) return false;
    setIsSavingChange(true);
    try {
      const newDateKey = await change();
      const newDate = newDateKey ? parseDateKey(newDateKey) : null;
      if (newDate) setSelectedDate(newDate);
      if (dog) {
        const state = usePlanStore.getState();
        const plans = state.activePlanIds
          .map((id) => state.plansById[id])
          .filter((plan): plan is Plan => plan != null);
        refreshSchedulesForPlans(dog, plans).catch(() => {});
      }
      return true;
    } catch {
      return false;
    } finally {
      setIsSavingChange(false);
    }
  }

  async function handleSheetChange(change: () => Promise<string | null>, failureMessage: string) {
    setSheetError('');
    if (await applyChange(change)) {
      setSheetSession(null);
    } else {
      setSheetError(failureMessage);
    }
  }

  async function handleDoToday(session: EnrichedPlanSession) {
    setMissedError('');
    const saved = await applyChange(() =>
      moveSessionToDate(session.planId, session.id, toDateKey(new Date()), 'do_today')
    );
    if (!saved) setMissedError("Couldn't move the session to today. Check your connection and try again.");
  }

  return (
    <>
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
            {missedSessions.length > 0 ? (
              <View>
                <SectionHeader title="Missed" />
                {missedError ? (
                  <Text
                    variant="caption"
                    color={colors.status.danger}
                    accessibilityLiveRegion="polite"
                    style={{ marginBottom: spacing.sm }}
                  >
                    {missedError}
                  </Text>
                ) : null}
                <ListGroup>
                  {missedSessions.map((session) => {
                    const courseLabel = session.planCourseTitle ?? getBehaviorLabel(session.planGoal);
                    const subtitle = [
                      multiplePlans ? courseLabel : null,
                      session.scheduledDate ? `Was ${formatShortDay(session.scheduledDate)}` : null,
                    ]
                      .filter(Boolean)
                      .join(', ');
                    return (
                      <ListRow
                        key={`${session.planId}_${session.id}`}
                        title={session.title}
                        subtitle={subtitle}
                        onPress={() => openSheet(session)}
                        accessibilityHint="Opens the days this session can move to"
                        trailing={
                          <Pressable
                            onPress={() => handleDoToday(session)}
                            disabled={isSavingChange}
                            accessibilityRole="button"
                            accessibilityLabel={`Do ${session.title} today`}
                            hitSlop={8}
                            style={({ pressed }) => ({
                              minHeight: 44,
                              justifyContent: 'center',
                              opacity: isSavingChange ? 0.4 : pressed ? 0.6 : 1,
                            })}
                          >
                            <Text variant="bodyStrong" color={colors.accent}>
                              Do it today
                            </Text>
                          </Pressable>
                        }
                      />
                    );
                  })}
                </ListGroup>
              </View>
            ) : null}
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
            {movableSessions.length > 0 ? (
              <ListGroup>
                {movableSessions.map((session) => (
                  <ListRow
                    key={`${session.planId}_${session.id}`}
                    icon="calendar-outline"
                    iconTone="secondary"
                    title="Move or skip"
                    subtitle={session.title}
                    trailing="chevron"
                    onPress={() => openSheet(session)}
                    accessibilityLabel={`Move or skip ${session.title}`}
                    accessibilityHint="Opens the days this session can move to"
                  />
                ))}
              </ListGroup>
            ) : null}
          </>
        )}
      </ScrollView>

      <SessionScheduleSheet
        session={sheetSession}
        groupedSessions={groupedSessions}
        busy={isSavingChange}
        error={sheetError}
        onClose={() => setSheetSession(null)}
        onMove={(dateKey) => {
          if (!sheetSession) return;
          const { planId, id } = sheetSession;
          haptics.selection();
          handleSheetChange(
            () => moveSessionToDate(planId, id, dateKey),
            "Couldn't move the session. Check your connection and try again."
          );
        }}
        onSkip={() => {
          if (!sheetSession) return;
          const { planId, id } = sheetSession;
          handleSheetChange(
            () => skipSession(planId, id),
            "Couldn't skip the session. Check your connection and try again."
          );
        }}
      />
    </>
  );
}
