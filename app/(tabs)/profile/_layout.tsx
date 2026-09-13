import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/lib/navigationTheme';
import { useTheme } from '@/lib/theme';

export default function ProfileLayout() {
  const { colorScheme } = useTheme();
  return (
    <Stack screenOptions={stackScreenOptions(colorScheme)}>
      <Stack.Screen name="index" options={{ title: 'Profile', headerLargeTitle: true }} />
      <Stack.Screen name="notification-settings" options={{ title: 'Notifications' }} />
      <Stack.Screen name="edit-dog" options={{ title: 'Edit dog' }} />
      <Stack.Screen name="privacy-policy" options={{ title: 'Privacy policy' }} />
      <Stack.Screen name="terms-of-service" options={{ title: 'Terms of service' }} />
      <Stack.Screen name="delete-account" options={{ title: 'Delete account' }} />
    </Stack>
  );
}
