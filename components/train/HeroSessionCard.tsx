import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { formatDisplayTime, formatScheduleLabel, getBehaviorLabel } from '@/lib/scheduleEngine';
import type { Plan, PlanSession } from '@/types';

export type HeroVariant = 'today' | 'overdue' | 'upcoming' | 'resume';

type HeroSessionCardProps = {
  session: PlanSession;
  plan: Plan;
  variant: HeroVariant;
  /** For `resume`: "Step 3 of 6" or a review note. */
  resumeLabel?: string;
  canReschedule?: boolean;
  rescheduleLabel?: string;
  onStart: () => void;
  onViewPlan: () => void;
  onReschedule?: () => void;
  onDiscard?: () => void;
};

/**
 * The one card on the Today screen: today's session, its course, where the
 * course stands, and the single action that matters.
 */
export function HeroSessionCard({
  session,
  plan,
  variant,
  resumeLabel,
  canReschedule = false,
  rescheduleLabel = 'Move to next slot',
  onStart,
  onViewPlan,
  onReschedule,
  onDiscard,
}: HeroSessionCardProps) {
  const courseLabel = plan.courseTitle ?? getBehaviorLabel(plan.goal);
  const completed = plan.sessions.filter((s) => s.isCompleted).length;
  const total = plan.sessions.length;

  const whenLine = (() => {
    if (variant === 'resume') return resumeLabel ?? 'Picked up where you left off';
    if (variant === 'overdue') return `Was scheduled for ${formatScheduleLabel(session)}`;
    if (variant === 'upcoming') return `Scheduled for ${formatScheduleLabel(session)}`;
    return session.scheduledTime ? `Today at ${formatDisplayTime(session.scheduledTime)}` : 'Today';
  })();
  const whenColor = variant === 'overdue' ? colors.status.warning : colors.text.secondary;

  const primaryLabel =
    variant === 'resume' ? 'Resume session' : variant === 'upcoming' ? 'View plan' : 'Start session';
  const primaryAction = variant === 'upcoming' ? onViewPlan : onStart;

  return (
    <Card accessibilityRole="summary">
      <View style={{ gap: spacing.xs }}>
        <Text variant="caption">{courseLabel}</Text>
        <Text variant="h2">{session.title}</Text>
        <Text variant="caption">
          {session.durationMinutes} min, week {session.weekNumber}
        </Text>
        <Text variant="caption" color={whenColor}>
          {whenLine}
        </Text>
      </View>

      <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
        <ProgressBar
          progress={total > 0 ? completed / total : 0}
          accessibilityLabel={`${completed} of ${total} sessions complete`}
        />
        <Text variant="caption">
          {completed} of {total} sessions
        </Text>
      </View>

      <View style={{ gap: spacing.sm, marginTop: spacing.xl }}>
        <Button label={primaryLabel} onPress={primaryAction} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {variant !== 'upcoming' ? (
            <Button label="View plan" variant="ghost" size="md" onPress={onViewPlan} />
          ) : null}
          {variant === 'overdue' && canReschedule && onReschedule ? (
            <Button label={rescheduleLabel} variant="ghost" size="md" onPress={onReschedule} />
          ) : null}
          {variant === 'resume' && onDiscard ? (
            <Button
              label="Discard"
              variant="ghost"
              size="md"
              onPress={onDiscard}
              accessibilityLabel="Discard unfinished session"
            />
          ) : null}
        </View>
      </View>
    </Card>
  );
}
