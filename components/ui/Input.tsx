import { useState } from 'react';
import {
  TextInput,
  View,
  type KeyboardTypeOptions,
  type ReturnKeyTypeOptions,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { typography } from '@/constants/typography';

type InputProps = {
  label?: string;
  error?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  editable?: boolean;
  secureTextEntry?: boolean;
  autoFocus?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  placeholderTextColor?: string;
};

export function Input({
  label,
  error,
  value,
  onChangeText,
  placeholder,
  multiline,
  numberOfLines,
  keyboardType,
  autoCapitalize,
  maxLength,
  editable = true,
  secureTextEntry,
  autoFocus,
  returnKeyType,
  onSubmitEditing,
  style,
  inputStyle,
  placeholderTextColor,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? colors.error
    : isFocused
    ? colors.brand.primary
    : colors.border.default;

  return (
    <View style={[{ gap: 6 }, style]}>
      {label && (
        <Text variant="micro" style={{ fontWeight: '600', color: colors.text.secondary }}>
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor ?? (colors.text.secondary + '80')}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        editable={editable}
        secureTextEntry={secureTextEntry}
        autoFocus={autoFocus}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          {
            backgroundColor: colors.bg.surfaceAlt,
            borderRadius: radii.md,
            borderWidth: 1.5,
            borderColor,
            paddingHorizontal: 16,
            paddingVertical: multiline ? 12 : 0,
            height: multiline ? undefined : 52,
            minHeight: multiline ? 52 * (numberOfLines ?? 3) / 3 : undefined,
            fontSize: typography.body.fontSize,
            fontWeight: typography.body.fontWeight,
            color: colors.text.primary,
          },
          inputStyle,
        ]}
      />
      {error && (
        <Text variant="micro" color={colors.error}>
          {error}
        </Text>
      )}
    </View>
  );
}
