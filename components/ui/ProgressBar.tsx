import { useEffect, useRef } from 'react';
import { Animated, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';

type ProgressBarProps = {
  progress: number; // 0–1
  height?: number;
  color?: string;
  trackColor?: string;
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ProgressBar({
  progress,
  height = 6,
  color = colors.brand.primary,
  trackColor = colors.border.default,
  animated = true,
  style,
}: ProgressBarProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const clampedProgress = Math.min(1, Math.max(0, progress));
    if (animated) {
      Animated.timing(widthAnim, {
        toValue: clampedProgress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      widthAnim.setValue(clampedProgress);
    }
  }, [progress, animated, widthAnim]);

  const widthInterp = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={[
        {
          height,
          borderRadius: radii.pill,
          backgroundColor: trackColor,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          height: '100%',
          borderRadius: radii.pill,
          backgroundColor: color,
          width: widthInterp,
        }}
      />
    </View>
  );
}
