import { useEffect, useRef } from 'react';
import { Animated, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { durations, useReducedMotion } from '@/lib/motion';

type ProgressBarProps = {
  /** 0–1 */
  progress: number;
  height?: 4 | 8;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function ProgressBar({ progress, height = 4, accessibilityLabel, style }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const width = useRef(new Animated.Value(clamped)).current;
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      width.setValue(clamped);
      return;
    }
    Animated.timing(width, { toValue: clamped, duration: durations.base, useNativeDriver: false }).start();
  }, [clamped, reducedMotion, width]);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[{ height, borderRadius: radii.full, backgroundColor: colors.bg.fill, overflow: 'hidden' }, style]}
    >
      <Animated.View
        style={{
          height: '100%',
          borderRadius: radii.full,
          backgroundColor: colors.accent,
          width: width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }}
      />
    </View>
  );
}
