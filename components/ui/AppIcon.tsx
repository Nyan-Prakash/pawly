import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/colors';

export type AppIconName = keyof typeof Ionicons.glyphMap;

type AppIconProps = {
  name: AppIconName;
  /** 22 in rows and buttons, 24 in the tab bar, 16 inline with captions. */
  size?: 16 | 20 | 22 | 24 | 28 | 32 | 40 | 48;
  color?: string;
};

/** The only icon set (Ionicons). No emoji, no glyphs. */
export function AppIcon({ name, size = 22, color = colors.text.primary }: AppIconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}
