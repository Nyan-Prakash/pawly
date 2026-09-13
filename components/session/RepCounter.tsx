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

/** The "+ Rep" button is taller than any other control on purpose: it is hit while watching the dog. */
const REP_BUTTON_HEIGHT = 72;
/** Same tactile edge as the Button primitive. */
const EDGE = 4;

/**
 * The hero of a rep step: the count, its target, and one big "+ Rep" button.
 * The count bounces once per rep (state driven), a selection haptic confirms
 * each rep, and a success haptic fires once when the target is reached.
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
      Animated.timing(scaleAnim, { toValue: 1.15, duration: durations.fast, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: durations.fast, useNativeDriver: true }),
    ]).start();
  }, [count, target, reducedMotion, scaleAnim]);

  const handleRep = () => {
    haptics.selection();
    onIncrement();
  };

  const countColor = targetReached ? colors.accent : colors.text.primary;
  const countLabel =
    target !== null ? `${count} of ${target} reps${targetReached ? ', target reached' : ''}` : `${count} reps`;

  return (
    <View style={{ gap: spacing.lg }}>
      <View
        accessible
        accessibilityRole="text"
        accessibilityLabel={countLabel}
        accessibilityLiveRegion="polite"
        style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm }}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Text variant="display" color={countColor}>
            {count}
          </Text>
        </Animated.View>
        {target !== null ? (
          <Text variant="caption" color={targetReached ? colors.accent : colors.text.secondary}>
            of {target}
          </Text>
        ) : null}
      </View>

      <View style={{ gap: spacing.xs }}>
        <Pressable
          onPress={handleRep}
          accessibilityRole="button"
          accessibilityLabel="Count a rep"
          style={({ pressed }) => ({
            height: REP_BUTTON_HEIGHT + EDGE,
            borderRadius: radii.md,
            backgroundColor: colors.accentEdge,
            paddingTop: pressed ? EDGE : 0,
          })}
        >
          {({ pressed }) => (
            <View
              style={{
                height: REP_BUTTON_HEIGHT,
                borderRadius: radii.md,
                backgroundColor: colors.accent,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
                opacity: pressed ? 0.92 : 1,
              }}
            >
              <AppIcon name="add" size={24} color={colors.text.onAccent} />
              <Text variant="action" color={colors.text.onAccent}>
                Rep
              </Text>
            </View>
          )}
        </Pressable>

        <Button
          label="Undo rep"
          variant="ghost"
          size="md"
          onPress={onDecrement}
          disabled={count === 0}
          style={{ alignSelf: 'flex-start' }}
        />
      </View>
    </View>
  );
}
