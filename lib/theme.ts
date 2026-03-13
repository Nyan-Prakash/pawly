import { useColorScheme } from 'react-native';

import { getThemeColors, setColorScheme, type AppColorScheme } from '@/constants/colors';
import { useThemeStore } from '@/stores/themeStore';

export function useTheme() {
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);
  const systemScheme = useColorScheme();

  const colorScheme: AppColorScheme =
    preference === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : preference;

  // Keep the palette in sync during render so screens update immediately.
  setColorScheme(colorScheme);

  return {
    preference,
    setPreference,
    colorScheme,
    isDark: colorScheme === 'dark',
    colors: getThemeColors(colorScheme),
  };
}
