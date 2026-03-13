import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text as RNText, View, Vibration } from 'react-native';

import { colors } from '@/constants/colors';
import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';

interface RepCounterProps {
  count: number;
  target: number | null;
  onIncrement: () => void;
  onReset: () => void;
}

export function RepCounter({ count, target, onIncrement, onReset }: RepCounterProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const targetReached = target !== null && count >= target;

  useEffect(() => {
    if (count === 0) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.25, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  }, [count]);

  const handlePress = () => {
    Vibration.vibrate(30);
    onIncrement();
  };

  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      {/* Large tap zone */}
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => ({
          flex: 1,
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: pressed
            ? targetReached
              ? '#FEF9C3'
              : '#DCFCE7'
            : targetReached
            ? '#FEFCE8'
            : 'transparent',
          borderRadius: 24,
        })}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
          <RNText
            style={{
              fontSize: 96,
              fontWeight: '700',
              // Gold when target reached (reward feel), green while counting
              color: targetReached ? colors.brand.secondary : colors.brand.primary,
              lineHeight: 110,
            }}
          >
            {count}
          </RNText>
          {target !== null && (
            <Text
              style={{
                fontSize: 18,
                color: targetReached ? colors.brand.secondary : colors.text.secondary,
                fontWeight: '600',
              }}
            >
              {targetReached ? 'Target reached!' : `of ${target} reps`}
            </Text>
          )}
        </Animated.View>
        {targetReached && (
          <View style={{ marginTop: 8 }}>
            <AppIcon name="trophy" size={22} color={colors.brand.secondary} />
          </View>
        )}

        <Text
          style={{
            marginTop: 16,
            fontSize: 14,
            color: colors.text.secondary,
            opacity: 0.6,
          }}
        >
          Tap anywhere to count
        </Text>
      </Pressable>

      {/* Reset link */}
      <Pressable onPress={onReset} style={{ paddingVertical: 12, minHeight: 44 }}>
        <Text style={{ fontSize: 14, color: colors.text.secondary, textDecorationLine: 'underline' }}>
          Reset
        </Text>
      </Pressable>
    </View>
  );
}
