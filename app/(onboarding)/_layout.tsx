import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/lib/navigationTheme';
import { useTheme } from '@/lib/theme';

/**
 * Onboarding draws its own progress header (a stepper is not a stack), so the
 * native header is hidden, but the native transition and back-swipe stay on.
 */
export default function OnboardingLayout() {
  const { colorScheme } = useTheme();
  return (
    <Stack screenOptions={{ ...stackScreenOptions(colorScheme), headerShown: false }}>
      <Stack.Screen name="dog-basics" />
      <Stack.Screen name="dog-photo" />
      <Stack.Screen name="plan-preview" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
