import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { spacing } from '@/constants/spacing';
import type { AppIconName } from '@/components/ui/AppIcon';

interface TrainingToolCardProps {
  /** The tool: "Clicker", "Whistle". */
  title: string;
  /** One line on what it does. */
  subtitle: string;
  /** Names the action: "Play clicker", "Blow whistle". */
  actionLabel: string;
  /** One line on how to use the control, e.g. "Hold for a long whistle". */
  hint?: string;
  icon: AppIconName;
  onPressIn?: () => void;
  onLongPress?: () => void;
  onPressOut?: () => void;
  disabled?: boolean;
}

/** One tool: its name, what it does, and one large button that plays it. */
export function TrainingToolCard({
  title,
  subtitle,
  actionLabel,
  hint,
  icon,
  onPressIn,
  onLongPress,
  onPressOut,
  disabled = false,
}: TrainingToolCardProps) {
  return (
    <Card>
      <View style={{ gap: spacing.xs }}>
        <Text variant="h2">{title}</Text>
        <Text variant="caption">{subtitle}</Text>
      </View>
      <Button
        label={actionLabel}
        icon={icon}
        disabled={disabled}
        onPressIn={onPressIn}
        onLongPress={onLongPress}
        onPressOut={onPressOut}
        style={{ marginTop: spacing.lg }}
      />
      {hint ? (
        <Text variant="caption" style={{ marginTop: spacing.sm }}>
          {hint}
        </Text>
      ) : null}
    </Card>
  );
}
