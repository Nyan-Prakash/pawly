import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'lg' | 'md';

type ButtonProps = Omit<PressableProps, 'style'> & {
  /** Names the exact action: "Start session", "Save walk". Sentence case. */
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: AppIconName;
  style?: StyleProp<ViewStyle>;
};

const HEIGHT: Record<ButtonSize, number> = { lg: 52, md: 44 };
/** The tactile signature: filled buttons stand on a darker edge and press down into it. */
const EDGE = 4;

export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  loading = false,
  icon,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const palette: Record<ButtonVariant, { bg: string; edge: string; text: string }> = {
    primary: { bg: colors.accent, edge: colors.accentEdge, text: colors.text.onAccent },
    secondary: { bg: colors.bg.fill, edge: colors.border.hairline, text: colors.text.primary },
    ghost: { bg: 'transparent', edge: 'transparent', text: colors.accent },
    destructive: { bg: colors.status.danger, edge: colors.status.dangerSoft, text: colors.text.onDanger },
  };
  const { bg, edge, text } = palette[variant];
  const raised = variant !== 'ghost';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          height: HEIGHT[size] + (raised ? EDGE : 0),
          minWidth: 44,
          borderRadius: radii.md,
          paddingHorizontal: spacing.xl,
          paddingTop: raised && pressed ? EDGE : 0,
          backgroundColor: raised ? edge : 'transparent',
          alignItems: 'center',
          justifyContent: 'flex-start',
          opacity: isDisabled ? 0.4 : !raised && pressed ? 0.6 : 1,
        },
        style,
      ]}
      {...props}
    >
      {({ pressed }) => (
        <View
          style={{
            height: HEIGHT[size],
            alignSelf: 'stretch',
            borderRadius: radii.md,
            backgroundColor: bg,
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: -spacing.xl,
            paddingHorizontal: spacing.xl,
            opacity: raised && pressed ? 0.92 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color={text} />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              {icon ? <AppIcon name={icon} size={20} color={text} /> : null}
              <Text variant="action" color={text}>
                {label}
              </Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}
