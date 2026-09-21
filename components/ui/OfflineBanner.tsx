import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useIsOffline } from '@/hooks/useIsOffline';
import { durations, useReducedMotion } from '@/lib/motion';

// Reads are served from the last snapshot, but writes are not queued: a walk
// or a session saved offline fails and asks for a retry. So the line promises
// nothing about saving.
const MESSAGE = "You're offline. Some things won't load until you reconnect.";

/**
 * One slim line that sits in the layout directly above the tab bar, so it
 * never covers the bar, a header, or the content. The tab bar below it owns
 * the bottom safe area; this only keeps clear of the side insets. It fades
 * with the state change and is instant under reduced motion.
 */
export function OfflineBanner() {
  const offline = useIsOffline();
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  // Stays mounted through the fade-out.
  const [mounted, setMounted] = useState(false);

  // Android announces through the live region below; iOS needs the call.
  useEffect(() => {
    if (offline && Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(MESSAGE);
  }, [offline]);

  useEffect(() => {
    if (offline) setMounted(true);
    if (reducedMotion) {
      opacity.setValue(offline ? 1 : 0);
      if (!offline) setMounted(false);
      return;
    }
    const anim = Animated.timing(opacity, {
      toValue: offline ? 1 : 0,
      duration: durations.base,
      useNativeDriver: true,
    });
    anim.start(({ finished }) => {
      if (finished && !offline) setMounted(false);
    });
    return () => anim.stop();
  }, [offline, reducedMotion, opacity]);

  if (!mounted) return null;

  return (
    <Animated.View
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={MESSAGE}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        paddingLeft: spacing.lg + insets.left,
        paddingRight: spacing.lg + insets.right,
        backgroundColor: colors.bg.fill,
        opacity,
      }}
    >
      <AppIcon name="cloud-offline-outline" size={16} color={colors.text.secondary} />
      <Text variant="caption" color={colors.text.primary} style={{ flex: 1 }}>
        {MESSAGE}
      </Text>
    </Animated.View>
  );
}
