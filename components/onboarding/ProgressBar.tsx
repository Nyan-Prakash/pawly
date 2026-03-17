import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';

type OnboardingProgressBarProps = {
  currentStep: number;
  totalSteps: number;
};

export function OnboardingProgressBar({ currentStep, totalSteps }: OnboardingProgressBarProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(currentStep / totalSteps, { duration: 350 });
  }, [currentStep, totalSteps, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View
        style={{
          flex: 1,
          height: 4,
          backgroundColor: colors.border.soft,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[
            fillStyle,
            {
              height: 4,
              backgroundColor: colors.brand.primary,
              borderRadius: 2,
            },
          ]}
        />
      </View>
      <Text variant="micro" color={colors.text.secondary} style={{ minWidth: 38, textAlign: 'right' }}>
        {currentStep} of {totalSteps}
      </Text>
    </View>
  );
}
