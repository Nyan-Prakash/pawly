import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { AppIcon } from '@/components/ui/AppIcon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { getCourseUiColors, hexToRgba } from '@/constants/courseColors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';
import { getBehaviorLabel, formatScheduleLabel } from '@/lib/scheduleEngine';
import type { PlanSummary } from '@/types';

interface ActiveCourseCardProps {
  plan: PlanSummary;
  onPress: () => void;
}

/**
 * Compact card shown in the "Active Courses" section of the Today screen.
 * Shows course title, week/phase, completion %, and next session label.
 */
export const ActiveCourseCard: React.FC<ActiveCourseCardProps> = ({ plan, onPress }) => {
  const courseLabel = plan.courseTitle ?? getBehaviorLabel(plan.goal);
  const completionPct = plan.completionPercentage;
  const nextSession = plan.todaySession;
  const courseColors = getCourseUiColors(plan);
  const totalSessions = plan.durationWeeks * plan.sessionsPerWeek;
  const completedSessions = Math.round((completionPct / 100) * totalSessions);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        backgroundColor: courseColors.solid,
        borderRadius: radii.lg,
        borderWidth: 0,
        padding: spacing.md,
        gap: spacing.xs,
        ...shadows.card,
      }}
    >
      {/* Top row: course label + badge */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 18, fontWeight: '700', color: courseColors.contrastText }}
            numberOfLines={1}
          >
            {courseLabel}
          </Text>
        </View>

        {plan.status === 'paused' && (
          <View
            style={{
              backgroundColor: hexToRgba(courseColors.contrastText, 0.18),
              borderRadius: radii.pill,
              paddingHorizontal: 7,
              paddingVertical: 2,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '700', color: courseColors.contrastText, letterSpacing: 0.3 }}>
              Paused
            </Text>
          </View>
        )}
        {nextSession && !nextSession.isCompleted && (
          <View
            style={{
              backgroundColor: hexToRgba(courseColors.contrastText, 0.18),
              borderRadius: radii.pill,
              paddingHorizontal: 7,
              paddingVertical: 2,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '700', color: courseColors.contrastText, letterSpacing: 0.3 }}>
              Today
            </Text>
          </View>
        )}
      </View>

      {/* Progress bar */}
      <View style={{ gap: 6, marginTop: spacing.xs }}>
        <ProgressBar
          progress={completionPct / 100}
          height={5}
          color={courseColors.contrastText}
          trackColor={hexToRgba(courseColors.contrastText, 0.25)}
        />
        <Text variant="caption" color={hexToRgba(courseColors.contrastText, 0.8)}>
          Session {completedSessions} of {totalSessions}
        </Text>
      </View>

      {/* Next session label */}
      {nextSession ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <AppIcon name="time" size={11} color={hexToRgba(courseColors.contrastText, 0.7)} />
          <Text variant="micro" color={hexToRgba(courseColors.contrastText, 0.7)} numberOfLines={1}>
            {nextSession.isCompleted
              ? 'All sessions done'
              : `Next: ${nextSession.title} · ${formatScheduleLabel(nextSession)}`}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};
