import { View, type StyleProp, type ViewStyle } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { MascotCallout, type MascotState } from '@/components/ui/MascotCallout';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

type EmptyStateProps = {
  title: string;
  subtitle?: string;
  mascotState?: MascotState;
  icon?: AppIconName;
  action?: {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary';
    icon?: AppIconName;
  };
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({
  title,
  subtitle,
  mascotState,
  icon,
  action,
  style,
}: EmptyStateProps) {
  return (
    <View
      style={[
        {
          alignItems: 'center',
          gap: spacing.md,
          padding: spacing.xl,
        },
        style,
      ]}
    >
      {mascotState ? (
        <MascotCallout state={mascotState} size={100} />
      ) : icon ? (
        <View style={{ minHeight: 64, alignItems: 'center', justifyContent: 'center' }}>
          <AppIcon name={icon} size={52} color={colors.text.secondary} />
        </View>
      ) : null}

      <View style={{ alignItems: 'center', gap: 8 }}>
        <Text variant="h3" style={{ textAlign: 'center' }}>
          {title}
        </Text>
        {subtitle && (
          <Text
            variant="body"
            color={colors.text.secondary}
            style={{ textAlign: 'center', lineHeight: 24 }}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {action && (
        <Button
          label={action.label}
          onPress={action.onPress}
          variant={action.variant ?? 'primary'}
          leftIcon={action.icon}
          size="md"
          style={{ minWidth: 160 }}
        />
      )}
    </View>
  );
}
