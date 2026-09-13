import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { getThemeColors, type AppColorScheme } from '@/constants/colors';
import { typography } from '@/constants/typography';

/** React Navigation theme so native headers, tab bars and sheets use the tokens. */
export function navigationTheme(scheme: AppColorScheme): Theme {
  const c = getThemeColors(scheme);
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: c.accent,
      background: c.bg.app,
      card: c.bg.app,
      text: c.text.primary,
      border: c.border.hairline,
      notification: c.status.danger,
    },
  };
}

/**
 * Default native-stack header. Large title on tab roots (pass
 * `headerLargeTitle: true` per screen); plain back button everywhere else.
 */
export function stackScreenOptions(scheme: AppColorScheme): NativeStackNavigationOptions {
  const c = getThemeColors(scheme);
  return {
    headerShown: true,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: c.bg.app },
    headerLargeTitleStyle: { color: c.text.primary, fontWeight: String(typography.display.fontWeight) },
    headerTitleStyle: { color: c.text.primary, fontWeight: typography.bodyStrong.fontWeight },
    headerTintColor: c.accent,
    headerBackButtonDisplayMode: 'minimal',
    headerLargeTitleShadowVisible: false,
    contentStyle: { backgroundColor: c.bg.app },
  };
}
