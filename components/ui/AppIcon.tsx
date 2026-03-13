import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/colors';

export type AppIconName = keyof typeof Ionicons.glyphMap;

type AppIconProps = {
  name: AppIconName;
  size?: number;
  color?: string;
};

export function AppIcon({ name, size = 20, color = colors.text.primary }: AppIconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}
