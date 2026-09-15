import { useEffect, useRef } from 'react';
import { Animated, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { useReducedMotion } from '@/lib/motion';

type SkeletonBlockProps = {
  height: number;
  width?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

/** Loading placeholder that matches the shape of the content it stands in for. */
export function SkeletonBlock({ height, width, borderRadius = radii.sm, style }: SkeletonBlockProps) {
  const opacity = useRef(new Animated.Value(0.6)).current;
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      opacity.setValue(0.8);
      return;
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.6, duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity, reducedMotion]);

  return (
    <Animated.View
      style={[{ height, width, borderRadius, backgroundColor: colors.bg.fill, opacity }, style]}
    />
  );
}
