import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { MascotCallout } from '@/components/ui/MascotCallout';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { spacing } from '@/constants/spacing';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeScreen>
      <View style={{ flex: 1, padding: spacing.lg, paddingTop: spacing.xxl, gap: spacing.xl }}>
        <MascotCallout state="happy" size={140} style={{ alignSelf: 'flex-start' }} />

        <View style={{ gap: spacing.sm }}>
          <Text variant="display">Pawly</Text>
          <Text variant="body">
            Short daily sessions that teach your dog one thing at a time, with a coach that knows
            their history.
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        {/* Account creation happens after onboarding: dog profile, goal, then plan. */}
        <View style={{ gap: spacing.sm }}>
          <Button label="Create account" onPress={() => router.push('/(onboarding)/dog-basics')} />
          <Button label="Log in" variant="ghost" onPress={() => router.push('/(auth)/login')} />
        </View>
      </View>
    </SafeScreen>
  );
}
