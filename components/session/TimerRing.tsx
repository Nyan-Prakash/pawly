import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/constants/colors';

interface TimerRingProps {
  totalSeconds: number;
  currentSeconds: number;
  size?: number;
  color?: string;
  trackColor?: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function TimerRing({
  totalSeconds,
  currentSeconds,
  size = 180,
  color = colors.brand.primary,
  trackColor = colors.border.default,
}: TimerRingProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  const animatedValue = useRef(new Animated.Value(currentSeconds / Math.max(totalSeconds, 1))).current;

  useEffect(() => {
    const ratio = totalSeconds > 0 ? currentSeconds / totalSeconds : 0;
    Animated.timing(animatedValue, {
      toValue: ratio,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentSeconds, totalSeconds]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
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
