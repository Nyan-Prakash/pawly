import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/lib/navigationTheme';
import { useTheme } from '@/lib/theme';

export default function TrainLayout() {
  const { colorScheme } = useTheme();
  return (
    <Stack screenOptions={stackScreenOptions(colorScheme)}>
      <Stack.Screen name="index" options={{ title: 'Train' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="tools" options={{ title: 'Training tools' }} />
      <Stack.Screen name="plan" options={{ title: 'Plan' }} />
      <Stack.Screen name="calendar" options={{ title: 'Calendar' }} />
      <Stack.Screen
        name="session"
        options={{ presentation: 'fullScreenModal', headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen name="upload-video" options={{ presentation: 'modal', title: 'Upload a video' }} />
      <Stack.Screen name="add-course" options={{ presentation: 'modal', title: 'Add a course' }} />
    </Stack>
  );
}
