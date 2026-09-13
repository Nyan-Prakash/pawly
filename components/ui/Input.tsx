import { forwardRef, useState } from 'react';
import { TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

type InputProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  /** Says what is wrong and what to do: "Enter a valid email address." */
  error?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * The only text field. Fill background, sm radius, 48 pt tall, accent focus
 * border. Pass keyboardType / textContentType / returnKeyType / onSubmitEditing
 * so the keyboard is right and the return key does something.
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, style, multiline, numberOfLines, onFocus, onBlur, ...props },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.status.danger : focused ? colors.accent : 'transparent';

  return (
    <View style={[{ gap: spacing.xs }, style]}>
      {label ? <Text variant="captionStrong">{label}</Text> : null}
      <TextInput
        ref={ref}
        multiline={multiline}
        numberOfLines={numberOfLines}
        placeholderTextColor={colors.text.secondary}
        selectionColor={colors.accent}
        accessibilityLabel={label}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={{
          backgroundColor: colors.bg.fill,
          borderRadius: radii.sm,
          borderWidth: 2,
          borderColor,
          paddingHorizontal: spacing.md,
          paddingVertical: multiline ? spacing.md : 0,
          height: multiline ? undefined : 48,
          minHeight: multiline ? 24 * (numberOfLines ?? 3) + spacing.md * 2 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
          fontSize: typography.body.fontSize,
          lineHeight: multiline ? typography.body.lineHeight : undefined,
          color: colors.text.primary,
        }}
        {...props}
      />
      {error ? (
        <Text variant="caption" color={colors.status.danger} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
});
