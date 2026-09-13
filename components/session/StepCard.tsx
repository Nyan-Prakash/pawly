import { View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import type { ProtocolStep } from '@/constants/protocols';

interface StepCardProps {
  step: ProtocolStep;
  stepNumber: number;
  totalSteps: number;
}

/**
 * The current step: where it sits, what to do, what success looks like, and
 * the step's own tip. Course-level guidance lives in the help sheet.
 */
export function StepCard({ step, stepNumber, totalSteps }: StepCardProps) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="caption">
        Step {stepNumber} of {totalSteps}
      </Text>
      <Text variant="h2">{step.instruction}</Text>
      {step.successLook ? <Text variant="body">{step.successLook}</Text> : null}
      {step.tip ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, marginTop: spacing.xs }}>
          <AppIcon name="bulb-outline" size={16} color={colors.text.secondary} />
          <Text variant="caption" style={{ flex: 1 }}>
            {step.tip}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
