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
  // The dog fills the width like it fills the icon. The artwork carries about
  // a fifth of empty sky above the ears, so the image is pulled up by that
  // much and the hero is only as tall as the dog itself plus the status bar.
  const HEADROOM = 0.19;
  const mascotSize = Math.round(Math.min(width * 0.98, height * 0.5));
  const heroHeight = Math.round(insets.top + spacing.md + mascotSize * (1 - HEADROOM));

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
          style={{ width: mascotSize, height: mascotSize, marginBottom: 0 }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
          accessible
          accessibilityRole="image"
          accessibilityLabel="The Pawly dog"
        />
      </View>

      <View style={{ flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: Math.max(insets.bottom, spacing.lg) }}>
        <View style={{ gap: spacing.sm }}>
          <Text variant="display" accessibilityRole="header">
            Pawly
          </Text>
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
