import { View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
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

function Fact({ icon, children, tone = 'secondary' }: { icon: AppIconName; children: string; tone?: 'secondary' | 'warning' }) {
  const color = tone === 'warning' ? colors.status.warning : colors.text.secondary;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      <AppIcon name={icon} size={16} color={color} />
      <Text variant="caption" color={color}>
        {children}
      </Text>
    </View>
  );
}

/**
 * The one card on the Today screen. Reads top to bottom in the order the
 * owner needs it: what state we are in, what the session is, when and how
 * long, how far the course has come, and the single action that matters.
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

  const stateLabel = {
    today: "Today's session",
    overdue: 'Missed session',
    upcoming: 'Next session',
    resume: 'In progress',
  }[variant];

  const whenText = (() => {
    if (variant === 'resume') return resumeLabel ?? 'Picked up where you left off';
    if (variant === 'today') {
      return session.scheduledTime ? `Today at ${formatDisplayTime(session.scheduledTime)}` : 'Today';
    }
    return formatScheduleLabel(session);
  })();

  const primaryLabel =
    variant === 'resume' ? 'Resume session' : variant === 'upcoming' ? 'View plan' : 'Start session';
  const primaryAction = variant === 'upcoming' ? onViewPlan : onStart;

  const secondary = [
    variant !== 'upcoming' ? { label: 'View plan', onPress: onViewPlan } : null,
    variant === 'overdue' && canReschedule && onReschedule ? { label: rescheduleLabel, onPress: onReschedule } : null,
    variant === 'resume' && onDiscard
      ? { label: 'Discard', onPress: onDiscard, accessibilityLabel: 'Discard unfinished session' }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <Card accessibilityRole="summary" style={{ gap: spacing.xl }}>
      <View style={{ gap: spacing.md }}>
        <View style={{ gap: spacing.xs }}>
          <Text variant="captionStrong" color={variant === 'overdue' ? colors.status.warning : colors.accent}>
            {stateLabel}
          </Text>
          <Text variant="h1">{session.title}</Text>
        </View>
        <View style={{ gap: spacing.xs }}>
          <Fact icon={variant === 'resume' ? 'play-outline' : 'calendar-outline'} tone={variant === 'overdue' ? 'warning' : 'secondary'}>
            {whenText}
          </Fact>
          <Fact icon="time-outline">{`${session.durationMinutes} min`}</Fact>
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text variant="caption">{courseLabel}</Text>
          <Text variant="caption">
            {completed} of {total} sessions
          </Text>
        </View>
        <ProgressBar
          progress={total > 0 ? completed / total : 0}
          accessibilityLabel={`${courseLabel}: ${completed} of ${total} sessions complete`}
        />
      </View>

      <View style={{ gap: spacing.xs }}>
        <Button label={primaryLabel} onPress={primaryAction} />
        {secondary.length ? (
          <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
            {secondary.map((item) => (
              <Button
                key={item.label}
                label={item.label}
                variant="ghost"
                size="md"
                onPress={item.onPress}
                accessibilityLabel={item.accessibilityLabel}
              />
            ))}
          </View>
        ) : null}
      </View>
    </Card>
  );
}
