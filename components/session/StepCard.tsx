import { View } from 'react-native';

import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { shadows } from '@/constants/shadows';
import { spacing } from '@/constants/spacing';
import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import type { ProtocolStep } from '@/constants/protocols';

interface StepCardProps {
  step: ProtocolStep;
  stepNumber: number;
  totalSteps: number;
  accentColor?: string;
}

/**
 * Instruction, what success looks like, and the step's own tip.
 * Protocol-level content (common mistakes, trainer note) lives in the help
 * sheet — it is not per step and was misleading when shown as if it were.
 */
export function StepCard({
  step,
  accentColor = colors.brand.primary,
}: StepCardProps) {

  return (
    <View style={{ gap: spacing.md }}>
      {/* Instruction card */}
      <View
        style={{
          backgroundColor: colors.bg.surface,
          borderRadius: radii.lg,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: colors.border.soft,
          gap: spacing.md,
          ...shadows.card,
        }}
      >
        {/* Primary instruction */}
        <Text
          style={{
            fontSize: 20,
            lineHeight: 30,
            color: colors.text.primary,
            fontWeight: '500',
          }}
        >
          {step.instruction}
        </Text>

        {/* Success look */}
        {step.successLook ? (
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs }}>
            <AppIcon name="checkmark-circle" size={16} color={accentColor} />
            <Text
              style={{
                flex: 1,
                fontSize: 14,
                lineHeight: 22,
                color: colors.text.secondary,
                fontStyle: 'italic',
              }}
            >
              {step.successLook}
            </Text>
          </View>
        ) : null}

        {/* Tip */}
        {step.tip ? (
          <View
            style={{
              backgroundColor: '#FFFBEB',
              borderRadius: radii.sm,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm + 2,
              borderLeftWidth: 3,
              borderLeftColor: '#F59E0B',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs }}>
              <AppIcon name="bulb" size={16} color="#78350F" />
              <Text style={{ flex: 1, fontSize: 14, lineHeight: 22, color: '#78350F' }}>
                {step.tip}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

    </View>
  );
}
