import { Image, View, useWindowDimensions } from 'react-native';
import { useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';

const MASCOT = require('@/assets/mascot.png');

/**
 * The front door is the app icon at full size: the dog on its blue, then the
 * name and one sentence on paper, then the two ways in. Nothing else.
 */
export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const heroHeight = Math.round(height * 0.52);
  const mascotSize = Math.min(width * 0.78, heroHeight - insets.top - spacing.xl);

  // Light status bar over the blue only while this screen is in front.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('auto');
    }, []),
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.app }}>
      {/* The icon, at the size of the screen. The dog stands on the hero's bottom
          edge exactly as it does on the home screen. */}
      <View
        style={{
          height: heroHeight,
          backgroundColor: colors.mascot.sky,
          borderBottomLeftRadius: radii.md * 2,
          borderBottomRightRadius: radii.md * 2,
          alignItems: 'center',
          justifyContent: 'flex-end',
          overflow: 'hidden',
        }}
      >
        <Image
          source={MASCOT}
          style={{ width: mascotSize, height: mascotSize }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
          accessible
          accessibilityLabel="The Pawly dog"
        />
      </View>

      <View style={{ flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: Math.max(insets.bottom, spacing.lg), gap: spacing.xl }}>
        <View style={{ gap: spacing.sm }}>
          <Text variant="display">Pawly</Text>
          <Text variant="body" color={colors.text.secondary}>
            Five minutes a day. One thing at a time. A coach that remembers every session.
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        {/* Account creation happens after onboarding: dog profile, goal, then plan. */}
        <View style={{ gap: spacing.sm }}>
          <Button label="Create account" onPress={() => router.push('/(onboarding)/dog-basics')} />
          <Button label="Log in" variant="ghost" onPress={() => router.push('/(auth)/login')} />
        </View>
      </View>
    </View>
  );
}
