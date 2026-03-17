import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { AppIcon } from '@/components/ui/AppIcon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
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

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        backgroundColor: colors.bg.surface,
        borderRadius: radii.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border.default,
        gap: spacing.xs,
        ...shadows.card,
      }}
    >
      {/* Top row: course label + badge */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 14, fontWeight: '700', color: colors.text.primary }}
            numberOfLines={1}
          >
            {courseLabel}
          </Text>
          <Text variant="micro" color={colors.text.secondary} style={{ marginTop: 1 }}>
            Week {plan.currentWeek} of {plan.durationWeeks}
          </Text>
        </View>

        {plan.isPrimary && (
          <View
            style={{
              backgroundColor: colors.brand.primary + '18',
              borderRadius: radii.pill,
              paddingHorizontal: 7,
              paddingVertical: 2,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.brand.primary, letterSpacing: 0.3 }}>
              Primary
            </Text>
          </View>
        )}
        {plan.status === 'paused' && (
          <View
            style={{
              backgroundColor: colors.status.warningBg,
              borderRadius: radii.pill,
              paddingHorizontal: 7,
              paddingVertical: 2,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.warning, letterSpacing: 0.3 }}>
              Paused
            </Text>
          </View>
        )}
        {nextSession && !nextSession.isCompleted && (
          <View
            style={{
              backgroundColor: colors.status.successBg,
              borderRadius: radii.pill,
              paddingHorizontal: 7,
              paddingVertical: 2,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.brand.primary, letterSpacing: 0.3 }}>
              Today
            </Text>
          </View>
        )}
      </View>

      {/* Progress bar */}
      <View style={{ gap: 3 }}>
        <ProgressBar
          progress={completionPct / 100}
          height={4}
          color={colors.brand.primary}
          trackColor={colors.border.soft}
        />
        <Text variant="micro" color={colors.text.secondary}>
          {completionPct}% complete
        </Text>
      </View>

      {/* Next session label */}
      {nextSession ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <AppIcon name="time" size={11} color={colors.text.secondary} />
          <Text variant="micro" color={colors.text.secondary} numberOfLines={1}>
            {nextSession.isCompleted
              ? 'All sessions done'
              : `Next: ${nextSession.title} · ${formatScheduleLabel(nextSession)}`}
          </Text>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <AppIcon name="checkmark-circle" size={11} color={colors.brand.primary} />
          <Text variant="micro" color={colors.brand.primary}>
            Plan complete
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
