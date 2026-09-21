import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/constants/colors';
import { durations, useReducedMotion } from '@/lib/motion';

interface TimerRingProps {
  totalSeconds: number;
  currentSeconds: number;
  size?: number;
  color?: string;
  trackColor?: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * State-driven ring: the arc follows `currentSeconds`. Accent on fill.
 * Decorative for screen readers: the screen that overlays the time on the
 * ring owns the timer role and its remaining-time value.
 */
export function TimerRing({
  totalSeconds,
  currentSeconds,
  size = 180,
  color = colors.accent,
  trackColor = colors.bg.fill,
}: TimerRingProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;
  const reducedMotion = useReducedMotion();

  const animatedValue = useRef(new Animated.Value(currentSeconds / Math.max(totalSeconds, 1))).current;

  useEffect(() => {
    const ratio = totalSeconds > 0 ? currentSeconds / totalSeconds : 0;
    if (reducedMotion) {
      animatedValue.setValue(ratio);
      return;
    }
    Animated.timing(animatedValue, {
      toValue: ratio,
      duration: durations.base,
      useNativeDriver: false,
    }).start();
  }, [currentSeconds, totalSeconds, reducedMotion, animatedValue]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View
      style={{ width: size, height: size }}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          originX={cx}
          originY={cy}
        />
      </Svg>
    </View>
  );
}
