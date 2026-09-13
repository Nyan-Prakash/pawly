import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { useReducedMotion } from '@/lib/motion';

const DOT = 8;
const LIFT = -4;

/**
 * Shown while the coach is writing. State-driven (mounted only while typing),
 * loops only as a loading indicator, and becomes a static mark when reduced
 * motion is on.
 */
export function TypingIndicator() {
  const reducedMotion = useReducedMotion();
  const dots = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

  useEffect(() => {
    if (reducedMotion) {
      dots.forEach((dot) => dot.setValue(0));
      return;
    }
    let active = true;
    const bounce = Animated.sequence([
      Animated.stagger(
        150,
        dots.map((dot) =>
          Animated.sequence([
            Animated.timing(dot, { toValue: LIFT, duration: 300, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]),
        ),
      ),
      Animated.delay(600),
    ]);
    // Repeats only while mounted, i.e. only while the coach is writing.
    const run = () => {
      bounce.start(({ finished }) => {
        if (finished && active) run();
      });
    };
    run();
    return () => {
      active = false;
      bounce.stop();
    };
  }, [dots, reducedMotion]);

  return (
    <View style={{ alignItems: 'flex-start', marginBottom: spacing.md }} accessibilityLabel="The coach is writing">
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          backgroundColor: colors.bg.surface,
          borderRadius: radii.md,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          minHeight: 44,
        }}
      >
        {reducedMotion ? (
          <Text variant="body" color={colors.text.secondary}>
            ...
          </Text>
        ) : (
          dots.map((dot, i) => (
            <Animated.View
              key={i}
              style={{
                width: DOT,
                height: DOT,
                borderRadius: radii.full,
                backgroundColor: colors.text.secondary,
                transform: [{ translateY: dot }],
              }}
            />
          ))
        )}
      </View>
    </View>
  );
}
