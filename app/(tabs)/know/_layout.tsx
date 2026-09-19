import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/lib/navigationTheme';
import { useTheme } from '@/lib/theme';

export default function KnowLayout() {
  const { colorScheme } = useTheme();
  return (
    <Stack screenOptions={stackScreenOptions(colorScheme)}>
      <Stack.Screen name="index" options={{ title: 'Learn', headerShown: false }} />
      <Stack.Screen name="article/[slug]" options={{ title: '' }} />
    </Stack>
  );
}
