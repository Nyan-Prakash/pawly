import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/colors';

export type AppIconName = keyof typeof Ionicons.glyphMap;

type AppIconProps = {
  name: AppIconName;
  /** 22 in rows and buttons, 24 in the tab bar, 16 inline with captions. */
  size?: 16 | 20 | 22 | 24 | 28 | 32 | 40 | 48;
  color?: string;
  /** Only when the icon carries meaning nothing next to it says. Otherwise it is decorative. */
  accessibilityLabel?: string;
};

/**
 * The only icon set (Ionicons). No emoji, no glyphs. Decorative by default:
 * the glyph is a private-use character, so screen readers skip it unless a
 * label is passed.
 */
export function AppIcon({ name, size = 22, color = colors.text.primary, accessibilityLabel }: AppIconProps) {
  if (accessibilityLabel) {
    return (
      <Ionicons
        name={name}
        size={size}
        color={color}
        accessible
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
      />
    );
  }
  return (
    <Ionicons
      name={name}
      size={size}
      color={color}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
