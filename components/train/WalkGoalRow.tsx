import { Button } from '@/components/ui/Button';
import { ListRow } from '@/components/ui/ListRow';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';

type WalkGoalRowProps = {
  goalText: string;
  logged: boolean;
  onLog: () => void;
};

/** Today's walk focus as a list row with a single "Log" action. */
export function WalkGoalRow({ goalText, logged, onLog }: WalkGoalRowProps) {
  return (
    <ListRow
      icon="walk"
      iconTone={logged ? 'accent' : 'secondary'}
      title="Today's walk"
      subtitle={goalText}
      onPress={logged ? undefined : onLog}
      accessibilityLabel={logged ? `Today's walk, logged. ${goalText}` : `Log today's walk. ${goalText}`}
      trailing={
        logged ? (
          <Text variant="caption" color={colors.accent}>
            Logged
          </Text>
        ) : (
          <Button label="Log" variant="ghost" size="md" onPress={onLog} />
        )
      }
    />
  );
}
