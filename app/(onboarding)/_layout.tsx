import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        contentStyle: { backgroundColor: colors.bg.app },
        animation: 'none',
      }}
    >
      <Stack.Screen name="dog-basics" />
      <Stack.Screen name="dog-problem" />
      <Stack.Screen name="dog-environment" />
      <Stack.Screen name="video-upload" />
      <Stack.Screen name="plan-preview" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
