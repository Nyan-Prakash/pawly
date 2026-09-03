import { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { MascotCallout, type MascotState } from '@/components/ui/MascotCallout';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { getCourseUiColors } from '@/constants/courseColors';
import { radii } from '@/constants/radii';
import { softShadows, tintedShadow } from '@/constants/shadows';
import { spacing } from '@/constants/spacing';
import { formatDisplayTime, formatScheduleLabel, getBehaviorLabel } from '@/lib/scheduleEngine';
import type { EnrichedPlanSession, Plan } from '@/types';

export type HeroVariant = 'today' | 'overdue' | 'upcoming';

type HeroSessionCardProps = {
  session: EnrichedPlanSession;
  plan: Plan;
  variant: HeroVariant;
  completion: number; // 0–100
  mascotState: MascotState;
  canReschedule?: boolean;
  onStart: () => void;
  onViewPlan: () => void;
  onReschedule?: () => void;
};

/**
 * The one focal surface on the Today screen.
 *
 * Deliberately a plain white card, not a gradient: the brand green is spent on
 * a single CTA, the course color appears only as a small chip, and the mascot
 * supplies warmth instead of decorative shapes.
 */
export function HeroSessionCard({
  session,
  plan,
  variant,
  completion,
  mascotState,
  canReschedule = false,
  onStart,
  onViewPlan,
  onReschedule,
}: HeroSessionCardProps) {
  const theme = getCourseUiColors(plan);
  const courseLabel = session.planCourseTitle ?? getBehaviorLabel(plan.goal);
  const stage = parseInt(plan.currentStage?.match(/\d/)?.[0] ?? '1', 10);

  // Single soft entrance — no looping motion on a screen people open daily.
  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(enter, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 6 }).start();
  }, [enter]);

  const eyebrow = (() => {
    if (variant === 'overdue') {
      return { text: `Missed · ${formatScheduleLabel(session)}`, color: colors.brand.secondary };
    }
    if (variant === 'upcoming') {
      return { text: `Next · ${formatScheduleLabel(session)}`, color: colors.text.secondary };
    }
    return {
      text: session.scheduledTime ? `Today · ${formatDisplayTime(session.scheduledTime)}` : 'Today',
      color: colors.text.secondary,
    };
  })();

  return (
    <Animated.View
      style={{
        backgroundColor: colors.bg.surface,
        borderRadius: radii.lg,
        padding: spacing.lg,
        ...softShadows.float,
        opacity: enter,
        transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
      }}
    >
      {/* Row 1 — course chip · when */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            backgroundColor: theme.tint,
            paddingHorizontal: 12,
            paddingVertical: spacing.xs + 2,
            borderRadius: radii.pill,
          }}
        >
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.solid }} />
          <Text variant="caption" numberOfLines={1} style={{ fontWeight: '700', color: theme.text }}>
            {courseLabel}
          </Text>
        </View>
        <Text variant="caption" style={{ fontWeight: '600', color: eyebrow.color }}>
          {eyebrow.text}
        </Text>
      </View>

      {/* Row 2 — title + meta, mascot on the right */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text variant="h2" style={{ letterSpacing: -0.4, lineHeight: 28 }}>
            {session.title}
          </Text>
          <Text variant="caption" style={{ color: colors.text.secondary, marginTop: spacing.xs }}>
            {session.durationMinutes} min · Week {session.weekNumber} · Stage {stage}
          </Text>
        </View>
        <MascotCallout state={mascotState} size={80} />
      </View>

      {/* Row 3 — course progress */}
      <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
        <ProgressBar
          progress={completion / 100}
          height={6}
          color={theme.solid}
          trackColor={theme.tint}
        />
        <Text variant="micro" style={{ color: colors.text.secondary, fontWeight: '600' }}>
          {completion}% of course complete
        </Text>
      </View>

      {/* Row 4 — CTA */}
      <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        {variant === 'upcoming' ? (
          <Button
            label="View plan"
            variant="secondary"
            size="lg"
            rightIcon="chevron-forward"
            onPress={onViewPlan}
          />
        ) : (
          <View style={{ borderRadius: radii.pill, ...tintedShadow(colors.brand.primary, 'float') }}>
            <Button
              label={variant === 'overdue' ? 'Start now' : 'Start session'}
              size="lg"
              leftIcon="play"
              onPress={onStart}
            />
          </View>
        )}

        {variant !== 'upcoming' ? (
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.xs }}>
            <TextLink label="View plan" onPress={onViewPlan} />
            {variant === 'overdue' && canReschedule && onReschedule ? (
              <TextLink label="Move to next slot" onPress={onReschedule} />
            ) : null}
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

function TextLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      hitSlop={8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        minHeight: 44,
        paddingHorizontal: spacing.sm,
      }}
    >
      <Text variant="caption" style={{ fontWeight: '700', color: colors.text.secondary }}>
        {label}
      </Text>
      <AppIcon name="chevron-forward" size={14} color={colors.text.secondary} />
    </TouchableOpacity>
  );
}
