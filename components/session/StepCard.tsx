import { View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import type { ProtocolStep } from '@/constants/protocols';

interface StepCardProps {
  step: ProtocolStep;
}

/**
 * The three lines of a step and nothing else: do (h1), then (body), and what
 * success looks like (caption). The reason lives behind "Why this step".
 */
export function StepCard({ step }: StepCardProps) {
  return (
    <View style={{ gap: spacing.md }}>
      <Text variant="h1" accessibilityRole="header">
        {step.instruction}
      </Text>
      {step.then ? <Text variant="body">{step.then}</Text> : null}
      {step.successLook ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs }}>
          {/* Sized to the caption's first line so the icon sits on it, not above it. */}
          <View style={{ height: 20, justifyContent: 'center' }}>
            <AppIcon name="checkmark-circle-outline" size={16} color={colors.text.secondary} />
          </View>
          <Text variant="caption" style={{ flex: 1 }}>
            {step.successLook}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
