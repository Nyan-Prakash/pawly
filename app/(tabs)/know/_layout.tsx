import { Stack } from 'expo-router';

export default function KnowLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="article/[slug]" />
    </Stack>
  );
}
