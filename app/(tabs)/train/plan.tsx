import { useEffect } from 'react';
import {
  FlatList,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useDogStore } from '@/stores/dogStore';
import { usePlanStore } from '@/stores/planStore';
import { getPlanCompletion, getBehaviorLabel } from '@/lib/scheduleEngine';
import type { PlanSession } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Completion ring (SVG-free, drawn with Views)
// ─────────────────────────────────────────────────────────────────────────────

function CompletionRing({ percentage }: { percentage: number }) {
  const size = 72;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arc = (percentage / 100) * circumference;

  // We approximate the ring with a tinted background circle + foreground arc overlay
  // using a simple View-based approach that works without SVG
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: colors.border.default,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Filled arc using an overlay — approximated with a colored border segment */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: percentage > 0 ? colors.primary : 'transparent',
          borderTopColor: percentage >= 25 ? colors.primary : 'transparent',
          borderRightColor: percentage >= 50 ? colors.primary : 'transparent',
          borderBottomColor: percentage >= 75 ? colors.primary : 'transparent',
          borderLeftColor: percentage >= 100 ? colors.primary : 'transparent',
          transform: [{ rotate: '-90deg' }],
        }}
      />
      <Text style={{ fontSize: 15, fontWeight: '700', color: colors.primary }}>
        {percentage}%
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Row
// ─────────────────────────────────────────────────────────────────────────────

function SessionRow({
  session,
  isToday,
  isFuture,
  onPress,
}: {
  session: PlanSession;
  isToday: boolean;
  isFuture: boolean;
  onPress: () => void;
}) {
  const bgColor = isToday
    ? '#EBF5F3'
    : session.isCompleted
    ? colors.surface
    : colors.surface;

  const borderColor = isToday ? colors.primary : colors.border.default;

  return (
    <TouchableOpacity
      activeOpacity={isFuture ? 0.6 : 0.8}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: bgColor,
        borderRadius: 14,
        borderWidth: 1,
        borderColor,
        padding: spacing.md,
        gap: spacing.sm,
        minHeight: 68,
        opacity: isFuture ? 0.55 : 1,
      }}
    >
      {/* Status icon */}
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: session.isCompleted
            ? colors.success
            : isToday
            ? colors.primary
            : colors.secondary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {session.isCompleted ? (
          <Ionicons name="checkmark" size={18} color="#fff" />
        ) : isToday ? (
          <Ionicons name="play" size={14} color="#fff" />
        ) : (
          <Ionicons name="lock-closed" size={14} color={colors.textSecondary} />
        )}
      </View>

      {/* Session info */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          {isToday && (
            <View
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 6,
                paddingVertical: 1,
                borderRadius: 4,
              }}
            >
              <Text
                style={{ color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 }}
              >
                TODAY
              </Text>
            </View>
          )}
          <Text
            style={{
              fontSize: 14,
              fontWeight: session.isCompleted || isToday ? '600' : '400',
              color: session.isCompleted
                ? colors.textSecondary
                : colors.textPrimary,
              flex: 1,
            }}
            numberOfLines={2}
          >
            {session.title}
          </Text>
        </View>
        <Text variant="caption" style={{ marginTop: 2 }}>
          Week {session.weekNumber} · Day {session.dayNumber} · {session.durationMinutes} min
        </Text>
      </View>

      {/* Chevron */}
      {!isFuture && (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.textSecondary}
        />
      )}
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Week Section Header
// ─────────────────────────────────────────────────────────────────────────────

function WeekHeader({ weekNumber, isCurrentWeek }: { weekNumber: number; isCurrentWeek: boolean }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        paddingTop: weekNumber > 1 ? spacing.md : 0,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: '700',
          color: isCurrentWeek ? colors.primary : colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
        }}
      >
        Week {weekNumber}
      </Text>
      {isCurrentWeek && (
        <View
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 99,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>Current</Text>
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Plan Screen
// ─────────────────────────────────────────────────────────────────────────────

type ListItem =
  | { type: 'header'; weekNumber: number; isCurrentWeek: boolean }
  | { type: 'session'; session: PlanSession; isToday: boolean; isFuture: boolean };

export default function PlanScreen() {
  const { dog } = useDogStore();
  const { activePlan, todaySession, fetchActivePlan } = usePlanStore();

  useEffect(() => {
    if (dog?.id && !activePlan) {
      fetchActivePlan(dog.id);
    }
  }, [dog?.id]);

  if (!activePlan) {
    return (
      <SafeScreen>
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
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text variant="title" style={{ fontSize: 20 }}>My Plan</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
          <Text variant="caption" style={{ textAlign: 'center' }}>
            No active plan found. Complete onboarding to get your personalized plan.
          </Text>
        </View>
      </SafeScreen>
    );
  }

  const completionPct = getPlanCompletion(activePlan);
  const behaviorLabel = getBehaviorLabel(activePlan.goal);
  const stageNumber = parseInt(activePlan.currentStage?.match(/\d/)?.[0] ?? '1', 10);

  // Find the first incomplete session (today's session)
  const todaySessionId = todaySession?.id ?? null;

  // Build flat list data with week section headers
  const listData: ListItem[] = [];
  let currentWeek = 0;

  for (const session of activePlan.sessions) {
    if (session.weekNumber !== currentWeek) {
      currentWeek = session.weekNumber;
      listData.push({
        type: 'header',
        weekNumber: currentWeek,
        isCurrentWeek: currentWeek === activePlan.currentWeek,
      });
    }

    const isToday = session.id === todaySessionId;
    // A session is "future" if it's not completed and it's not today's session
    // and there's a previous incomplete session (i.e., it's locked)
    const firstIncompleteIdx = activePlan.sessions.findIndex((s) => !s.isCompleted);
    const sessionIdx = activePlan.sessions.indexOf(session);
    const isFuture = !session.isCompleted && !isToday && sessionIdx > firstIncompleteIdx;

    listData.push({ type: 'session', session, isToday, isFuture });
  }

  return (
    <SafeScreen>
      {/* ── Nav Header ── */}
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
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text variant="title" style={{ fontSize: 20, flex: 1 }}>
          My Plan
        </Text>
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item, idx) =>
          item.type === 'header' ? `week-${item.weekNumber}` : `session-${item.session.id}-${idx}`
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.xl * 2,
        }}
        ListHeaderComponent={() => (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: spacing.lg,
              marginBottom: spacing.md,
              borderWidth: 1,
              borderColor: colors.border.default,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
            }}
          >
            <CompletionRing percentage={completionPct} />
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, lineHeight: 22 }}
                numberOfLines={2}
              >
                {dog?.name ? `${dog.name}'s ` : ''}{activePlan.goal} Plan
              </Text>
              <Text variant="caption" style={{ marginTop: 4 }}>
                {activePlan.durationWeeks} weeks · {activePlan.sessionsPerWeek}×/week
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs, flexWrap: 'wrap' }}>
                <View
                  style={{
                    backgroundColor: colors.secondary,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 99,
                  }}
                >
                  <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '600' }}>
                    {behaviorLabel}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: colors.secondary,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 99,
                  }}
                >
                  <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '600' }}>
                    Stage {stageNumber}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: colors.secondary,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 99,
                  }}
                >
                  <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '600' }}>
                    {activePlan.sessions.filter((s) => s.isCompleted).length}/{activePlan.sessions.length} done
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <WeekHeader
                weekNumber={item.weekNumber}
                isCurrentWeek={item.isCurrentWeek}
              />
            );
          }

          return (
            <View style={{ marginBottom: spacing.xs }}>
              <SessionRow
                session={item.session}
                isToday={item.isToday}
                isFuture={item.isFuture}
                onPress={() => {
                  if (!item.isFuture) {
                    router.push(`/(tabs)/train/session?id=${item.session.id}`);
                  }
                }}
              />
            </View>
          );
        }}
      />
    </SafeScreen>
  );
}
