import { View, type StyleProp, type ViewStyle } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { MascotCallout, type MascotState } from '@/components/ui/MascotCallout';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

type EmptyStateProps = {
  /** What is missing, plainly: "No sessions yet". */
  title: string;
  /** One sentence on what to do about it. */
  subtitle?: string;
  mascotState?: MascotState;
  icon?: AppIconName;
  /** The action that fills the empty state. Label names the action. */
  action?: { label: string; onPress: () => void; icon?: AppIconName };
  style?: StyleProp<ViewStyle>;
};

/**
 * Centred by design: it fills a screen or a group that has no content.
 * This is the one place text is centre-aligned.
 */
export function EmptyState({ title, subtitle, mascotState, icon, action, style }: EmptyStateProps) {
  return (
    <View style={[{ alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl }, style]}>
      {mascotState ? (
        <MascotCallout state={mascotState} size={96} />
      ) : icon ? (
        <AppIcon name={icon} size={40} color={colors.text.secondary} />
      ) : null}
      <View style={{ alignItems: 'center', gap: spacing.xs }}>
        <Text variant="h2" style={{ textAlign: 'center' }}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="body" color={colors.text.secondary} style={{ textAlign: 'center' }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action ? <Button label={action.label} onPress={action.onPress} icon={action.icon} size="md" /> : null}
    </View>
  );
}
