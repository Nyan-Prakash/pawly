import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/lib/navigationTheme';
import { useTheme } from '@/lib/theme';

export default function AuthLayout() {
  const { colorScheme } = useTheme();
  return (
    <Stack screenOptions={{ ...stackScreenOptions(colorScheme), headerTransparent: true, title: '' }}>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
