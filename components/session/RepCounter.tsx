import { useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
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
  onDecrement: () => void;
}

/** Big enough to hit while watching the dog, not the phone. */
const DIAL = 220;
const EDGE = 6;

/**
 * The hero of a rep step: the counter is the button. Tap the dial to count a
 * rep; it presses down on its edge, the number bounces once, a selection
 * haptic confirms it, and the dial fills when the target is reached.
 */
export function RepCounter({ count, target, onIncrement, onDecrement }: RepCounterProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const reducedMotion = useReducedMotion();
  const targetReached = target !== null && count >= target;
  const previousCount = useRef(count);

  useEffect(() => {
    const wentUp = count > previousCount.current;
    previousCount.current = count;
    if (!wentUp) return;
    if (target !== null && count === target) haptics.success();
    if (reducedMotion) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.12, duration: durations.fast, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: durations.fast, useNativeDriver: true }),
    ]).start();
  }, [count, target, reducedMotion, scaleAnim]);

  const handleRep = () => {
    haptics.selection();
    onIncrement();
  };

  const fill = targetReached ? colors.accent : colors.bg.surface;
  const edge = targetReached ? colors.accentEdge : colors.bg.fill;
  const numberColor = targetReached ? colors.text.onAccent : colors.text.primary;
  const captionColor = targetReached ? colors.text.onAccent : colors.text.secondary;
  const countLabel =
    target !== null ? `${count} of ${target} reps${targetReached ? ', target reached' : ''}` : `${count} reps`;

  return (
    <View style={{ alignItems: 'center', gap: spacing.md }}>
      <Pressable
        onPress={handleRep}
        accessibilityRole="button"
        accessibilityLabel="Add one rep"
        accessibilityValue={{ text: countLabel }}
        style={({ pressed }) => ({
          width: DIAL,
          height: DIAL + EDGE,
          borderRadius: radii.full,
          backgroundColor: edge,
          paddingTop: pressed ? EDGE : 0,
        })}
      >
        {({ pressed }) => (
          <View
            style={{
              width: DIAL,
              height: DIAL,
              borderRadius: radii.full,
              backgroundColor: fill,
              borderWidth: targetReached ? 0 : 2,
              borderColor: colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.92 : 1,
            }}
          >
            <Animated.View
              style={{ transform: [{ scale: scaleAnim }] }}
              accessibilityLiveRegion="polite"
              accessibilityLabel={countLabel}
            >
              <Text variant="numeral" color={numberColor} style={{ textAlign: 'center' }}>
                {count}
              </Text>
            </Animated.View>
            {target !== null ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                {targetReached ? <AppIcon name="checkmark-circle" size={16} color={captionColor} /> : null}
                <Text variant="captionStrong" color={captionColor}>
                  of {target}
                </Text>
              </View>
            ) : (
              <Text variant="captionStrong" color={captionColor}>
                reps
              </Text>
            )}
          </View>
        )}
      </Pressable>

      <Text variant="caption">{targetReached ? 'Target reached. Finish on this one.' : 'Tap the dial for every rep'}</Text>

      <Button
        label="Undo"
        accessibilityLabel="Remove one rep"
        variant="ghost"
        size="md"
        onPress={onDecrement}
        disabled={count === 0}
      />
    </View>
  );
}
