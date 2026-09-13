import { useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { haptics } from '@/lib/haptics';
import { durations, useReducedMotion } from '@/lib/motion';

interface RepCounterProps {
  count: number;
  target: number | null;
  onIncrement: () => void;
  onReset: () => void;
}

/**
 * A large tap zone that counts reps. The count bounces once per rep (state
 * driven) and a selection haptic confirms each count.
 */
export function RepCounter({ count, target, onIncrement, onReset }: RepCounterProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const reducedMotion = useReducedMotion();
  const targetReached = target !== null && count >= target;

  useEffect(() => {
    if (count === 0 || reducedMotion) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.15, duration: durations.fast, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: durations.fast, useNativeDriver: true }),
    ]).start();
  }, [count, reducedMotion, scaleAnim]);

  const handlePress = () => {
    haptics.selection();
    onIncrement();
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={
          target !== null ? `${count} of ${target} reps. Tap to count a rep.` : `${count} reps. Tap to count a rep.`
        }
        style={({ pressed }) => ({
          minHeight: 160,
          padding: spacing.lg,
          borderRadius: radii.md,
          backgroundColor: targetReached ? colors.accentSoft : pressed ? colors.bg.fill : colors.bg.surface,
          justifyContent: 'center',
          gap: spacing.xs,
        })}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }], alignSelf: 'flex-start' }}>
          <Text variant="display" color={targetReached ? colors.accent : colors.text.primary}>
            {count}
          </Text>
        </Animated.View>
        {target !== null ? (
          <Text variant="captionStrong" color={targetReached ? colors.accent : colors.text.secondary}>
            {targetReached ? 'Target reached' : `of ${target} reps`}
          </Text>
        ) : null}
        <Text variant="caption">Tap to count a rep</Text>
      </Pressable>

      <Button
        label="Reset count"
        variant="ghost"
        size="md"
        onPress={onReset}
        disabled={count === 0}
        style={{ alignSelf: 'flex-start' }}
      />
    </View>
  );
}
