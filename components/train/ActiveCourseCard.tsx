import React from 'react';
import { TouchableOpacity, View, Platform } from 'react-native';
import { AppIcon } from '@/components/ui/AppIcon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { getCourseUiColors, hexToRgba } from '@/constants/courseColors';
import { spacing } from '@/constants/spacing';
import { getBehaviorLabel } from '@/lib/scheduleEngine';
import type { PlanSummary } from '@/types';

interface ActiveCourseCardProps {
  plan: PlanSummary;
  onPress: () => void;
}

const GOAL_ICONS: Record<string, string> = {
  leash_pulling: 'walk',
  leash: 'walk',
  jumping_up: 'arrow-up-circle',
  jumping: 'arrow-up-circle',
  barking: 'volume-high',
  recall: 'return-down-back',
  potty_training: 'water',
  potty: 'water',
  crate_anxiety: 'home',
  crate: 'home',
  puppy_biting: 'flash',
  biting: 'flash',
  settling: 'moon',
};

function getCourseIcon(goal: string): string {
  const normalized = goal.toLowerCase().replace(/ /g, '_');
  return GOAL_ICONS[normalized] ?? GOAL_ICONS[goal.toLowerCase()] ?? 'school';
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#1A2436',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
  },
  android: { elevation: 4 },
});

const activeCardShadow = Platform.select({
  ios: {
    shadowColor: '#1A2436',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
  },
  android: { elevation: 6 },
});

/**
 * Single-row course card.
 * Layout: [ stripe ] [ icon ] [ title + progress bar ] [ chevron ]
 */
export const ActiveCourseCard: React.FC<ActiveCourseCardProps> = ({ plan, onPress }) => {
  const courseLabel = plan.courseTitle ?? getBehaviorLabel(plan.goal);
  const completionPct = plan.completionPercentage;
  const nextSession = plan.todaySession;
  const theme = getCourseUiColors(plan);
  const totalSessions = plan.durationWeeks * plan.sessionsPerWeek;
  const completedSessions = Math.round((completionPct / 100) * totalSessions);
  const isActive = nextSession != null && !nextSession.isCompleted;
  const isPaused = plan.status === 'paused';
  const iconName = getCourseIcon(plan.goal);

  const shadow = isActive ? activeCardShadow : cardShadow;
  const borderColor = isActive ? hexToRgba(theme.solid, 0.28) : colors.border.default;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={{
        backgroundColor: colors.bg.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: spacing.md + 8, // compensate for stripe
        paddingRight: spacing.md,
        paddingVertical: 20,
        gap: 14,
        ...shadow,
      }}
    >
      {/* ── Left accent stripe ── */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 8,
          backgroundColor: theme.solid,
        }}
      />

      {/* ── Icon tile ── */}
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 15,
          backgroundColor: hexToRgba(theme.solid, 0.13),
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <AppIcon name={iconName as any} size={26} color={theme.solid} />
      </View>

      {/* ── Title + progress bar ── */}
      <View style={{ flex: 1, gap: 6 }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 19,
            fontWeight: '800',
            color: colors.text.primary,
            letterSpacing: -0.4,
            lineHeight: 23,
          }}
        >
          {courseLabel}
        </Text>
        <ProgressBar
          progress={completionPct / 100}
          height={7}
          color={theme.solid}
          trackColor={hexToRgba(theme.solid, 0.15)}
        />
        <Text
          numberOfLines={1}
          style={{
            fontSize: 13,
            fontWeight: '400',
            color: colors.text.secondary,
            lineHeight: 17,
          }}
        >
          {isPaused ? 'Paused · ' : ''}{completedSessions} of {totalSessions} sessions
        </Text>
      </View>

      {/* ── Chevron ── */}
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: hexToRgba(theme.solid, 0.1),
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <AppIcon name="chevron-forward" size={16} color={theme.solid} />
      </View>
    </TouchableOpacity>
  );
};
