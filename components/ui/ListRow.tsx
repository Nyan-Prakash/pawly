import { Children, isValidElement, type PropsWithChildren, type ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';

/**
 * The layout primitive (DESIGN.md): an inset grouped list.
 *
 *   <ListGroup>
 *     <ListRow icon="paw" title="Loose-leash walking" subtitle="12 min" onPress={…} />
 *   </ListGroup>
 */
export function ListGroup({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <View
      style={[
        { backgroundColor: colors.bg.surface, borderRadius: radii.md, overflow: 'hidden' },
        style,
      ]}
    >
      {items.map((child, index) => (
        <View key={child.key ?? index}>
          {child}
          {index < items.length - 1 ? <Separator /> : null}
        </View>
      ))}
    </View>
  );
}

function Separator() {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: colors.border.hairline,
        marginLeft: spacing.lg,
      }}
    />
  );
}

type ListRowProps = {
  title: string;
  subtitle?: string;
  /** 22-pt Ionicon in `accent` (default) or `secondary`. */
  icon?: AppIconName;
  iconTone?: 'accent' | 'secondary' | 'danger';
  /** Trailing content: a value string, a `chevron`, or any node (Switch, Tag). */
  trailing?: ReactNode | 'chevron';
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  /** Use for destructive rows: title in danger colour. */
  destructive?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

export function ListRow({
  title,
  subtitle,
  icon,
  iconTone = 'accent',
  trailing,
  onPress,
  disabled,
  selected,
  destructive,
  accessibilityLabel,
  accessibilityHint,
  style,
}: ListRowProps) {
  const iconColor = {
    accent: colors.accent,
    secondary: colors.text.secondary,
    danger: colors.status.danger,
  }[iconTone];

  const content = (
    <View
      style={[
        {
          minHeight: 52,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          backgroundColor: selected ? colors.accentSoft : 'transparent',
        },
        style,
      ]}
    >
      {icon ? <AppIcon name={icon} size={22} color={destructive ? colors.status.danger : iconColor} /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong" color={destructive ? colors.status.danger : undefined} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing === 'chevron' ? (
        <AppIcon name="chevron-forward" size={20} color={colors.text.secondary} />
      ) : typeof trailing === 'string' ? (
        <Text variant="body" color={colors.text.secondary}>
          {trailing}
        </Text>
      ) : (
        trailing ?? null
      )}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled, selected: !!selected }}
      style={({ pressed }) => ({ opacity: disabled ? 0.4 : pressed ? 0.6 : 1 })}
    >
      {content}
    </Pressable>
  );
}
