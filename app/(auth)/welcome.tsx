import { View, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={[]}>
      {/* Top 40% — gradient hero */}
      <LinearGradient
        colors={['#2D7D6F', '#1A5C52']}
        style={{ height: height * 0.4, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl }}
      >
        <Text
          style={{
            fontSize: 48,
            fontWeight: typography.weights.bold,
            color: '#FFFFFF',
            letterSpacing: -1
          }}
        >
          Pawly
        </Text>
        <Text
          style={{
            fontSize: typography.sizes.md,
            color: 'rgba(255,255,255,0.8)',
            marginTop: spacing.sm,
            textAlign: 'center'
          }}
        >
          Finally. A trainer who knows your dog.
        </Text>
      </LinearGradient>

      {/* Bottom 60% — white card */}
      <View
        style={{
          flex: 1,
          backgroundColor: colors.surface,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          marginTop: -32,
          paddingTop: spacing.xxl,
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing.xl
        }}
      >
        <Button
          label="Get started free"
          variant="primary"
          onPress={() => router.push('/(auth)/signup')}
          style={{ marginBottom: spacing.lg }}
        />

        <Button
          label="I already have an account"
          variant="ghost"
          onPress={() => router.push('/(auth)/login')}
          style={{ marginBottom: spacing.xl }}
        />

        <Text
          variant="caption"
          style={{ textAlign: 'center', color: colors.textSecondary }}
        >
          No credit card required to start.
        </Text>
      </View>
    </SafeAreaView>
  );
}
