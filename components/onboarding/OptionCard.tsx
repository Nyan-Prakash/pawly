import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { Tag } from '@/components/ui/PillTag';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { haptics } from '@/lib/haptics';

type OptionCardLayout = 'vertical' | 'horizontal';
type OptionCardSize = 'sm' | 'md' | 'lg';

type OptionCardProps = {
  icon?: AppIconName;
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  layout?: OptionCardLayout;
  /** Kept for callers; only affects inner padding. */
  size?: OptionCardSize;
  /** Shown as a trailing tag, never as a corner overlay. */
  badge?: string;
  disabled?: boolean;
  /**
   * How the card is announced: `radio` when one option can be picked (wrap
   * the set in a View with accessibilityRole="radiogroup"), `checkbox` when
   * several can.
   */
  selectionRole?: 'radio' | 'checkbox';
  style?: StyleProp<ViewStyle>;
};

const PADDING: Record<OptionCardSize, number> = {
  sm: spacing.md,
  md: spacing.lg,
  lg: spacing.xl,
};

/**
 * A standalone selectable option: surface fill, accent-soft when selected,
 * with a checkmark so selection is never colour-only. Prefer ListGroup +
 * ListRow when options are a list.
 */
export function OptionCard({
  icon,
  label,
  description,
  selected,
  onPress,
  layout = 'horizontal',
  size = 'md',
  badge,
  disabled = false,
  selectionRole = 'radio',
  style,
}: OptionCardProps) {
  const isVertical = layout === 'vertical';
  const iconColor = selected ? colors.accent : colors.text.secondary;

  const handlePress = () => {
    haptics.selection();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole={selectionRole}
      accessibilityLabel={[label, description, badge].filter(Boolean).join(', ')}
      accessibilityState={{ selected, checked: selected, disabled }}
      style={({ pressed }) => [
        {
          flex: 1,
          minHeight: 52,
          borderRadius: radii.md,
          backgroundColor: selected ? colors.accentSoft : colors.bg.surface,
          padding: PADDING[size],
          opacity: disabled ? 0.4 : pressed ? 0.6 : 1,
        },
        isVertical
          ? { alignItems: 'center', justifyContent: 'center', gap: spacing.sm }
          : { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
        style,
      ]}
    >
      {icon ? <AppIcon name={icon} size={22} color={iconColor} /> : null}

      <View style={isVertical ? { alignItems: 'center' } : { flex: 1 }}>
        <Text
          variant="bodyStrong"
          color={selected ? colors.accent : colors.text.primary}
          style={isVertical ? { textAlign: 'center' } : undefined}
        >
          {label}
        </Text>
        {description ? (
          <Text variant="caption" style={isVertical ? { textAlign: 'center' } : undefined}>
            {description}
          </Text>
        ) : null}
      </View>

      {badge ? <Tag label={badge} tone="accent" /> : null}

      {!isVertical && selected ? <AppIcon name="checkmark" size={20} color={colors.accent} /> : null}
    </Pressable>
  );
}
