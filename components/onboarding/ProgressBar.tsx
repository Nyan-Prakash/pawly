import { View } from 'react-native';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { Text } from '@/components/ui/Text';
import { spacing } from '@/constants/spacing';

type OnboardingProgressBarProps = {
  currentStep: number;
  totalSteps: number;
};

/** Stepper header: a token progress bar plus "N of M". Animates only on step change. */
export function OnboardingProgressBar({ currentStep, totalSteps }: OnboardingProgressBarProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <ProgressBar
        progress={totalSteps > 0 ? currentStep / totalSteps : 0}
        accessibilityLabel={`Step ${currentStep} of ${totalSteps}`}
        style={{ flex: 1 }}
      />
      <Text variant="caption">
        {currentStep} of {totalSteps}
      </Text>
    </View>
  );
}
