import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/lib/navigationTheme';
import { useTheme } from '@/lib/theme';

export default function TrainLayout() {
  const { colorScheme } = useTheme();
  return (
    <Stack screenOptions={stackScreenOptions(colorScheme)}>
      {/* The Today screen draws its own title: native large titles do not render on
          react-native-screens 4.1 under iOS 26, and a small centred "Train" reads as a
          settings page, not the front door of the app. */}
      <Stack.Screen name="index" options={{ title: 'Train', headerShown: false }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="tools" options={{ title: 'Training tools' }} />
      <Stack.Screen name="plan" options={{ title: 'Plan' }} />
      <Stack.Screen name="calendar" options={{ title: 'Calendar' }} />
      <Stack.Screen
        name="session"
        options={{ presentation: 'fullScreenModal', headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen name="add-course" options={{ presentation: 'modal', title: 'Add a course' }} />
    </Stack>
  );
}
