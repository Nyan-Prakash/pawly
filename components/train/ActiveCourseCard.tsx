import type { AppIconName } from '@/components/ui/AppIcon';
import { ListRow } from '@/components/ui/ListRow';
import { Tag } from '@/components/ui/PillTag';
import { getBehaviorLabel } from '@/lib/scheduleEngine';
import type { PlanSummary } from '@/types';

interface ActiveCourseCardProps {
  plan: PlanSummary;
  onPress: () => void;
}

/** Same icon per goal as the add-course picker. */
const GOAL_ICONS: Record<string, AppIconName> = {
  leash_pulling: 'walk',
  leash: 'walk',
  jumping_up: 'arrow-up-circle',
  jumping: 'arrow-up-circle',
  barking: 'volume-high',
  recall: 'return-down-back',
  "won't_come": 'return-down-back',
  potty_training: 'sunny',
  potty: 'sunny',
  crate_anxiety: 'home',
  crate: 'home',
  puppy_biting: 'happy',
  biting: 'happy',
  settling: 'bed',
  leave_it: 'hand-left',
  basic_obedience: 'school',
  separation_anxiety: 'sad',
  door_manners: 'exit',
  impulse_control: 'pause-circle',
  cooperative_care: 'medkit',
  wait_and_stay: 'time',
  leash_reactivity: 'alert-circle',
  sit: 'chevron-down-circle',
  down: 'arrow-down-circle',
  heel: 'footsteps',
};

export function getCourseIcon(goal: string): AppIconName {
  const normalized = goal.toLowerCase().replace(/ /g, '_');
  return GOAL_ICONS[normalized] ?? GOAL_ICONS[goal.toLowerCase()] ?? 'school';
}

/** One course as a list row: icon, name, "3 of 12 sessions", a Paused tag when paused. */
export function ActiveCourseCard({ plan, onPress }: ActiveCourseCardProps) {
  const courseLabel = plan.courseTitle ?? getBehaviorLabel(plan.goal);
  const totalSessions = plan.durationWeeks * plan.sessionsPerWeek;
  const completedSessions = Math.round((plan.completionPercentage / 100) * totalSessions);
  const isPaused = plan.status === 'paused';

  return (
    <ListRow
      icon={getCourseIcon(plan.goal)}
      iconTone={isPaused ? 'secondary' : 'accent'}
      title={courseLabel}
      subtitle={`${completedSessions} of ${totalSessions} sessions`}
      trailing={isPaused ? <Tag label="Paused" /> : 'chevron'}
      onPress={onPress}
      accessibilityHint="Opens the plan for this course"
    />
  );
}
