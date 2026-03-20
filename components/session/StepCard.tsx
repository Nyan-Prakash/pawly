import { useState } from 'react';
import { Pressable, View } from 'react-native';
import LottieView from 'lottie-react-native';

import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { shadows } from '@/constants/shadows';
import { spacing } from '@/constants/spacing';
import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import type { ProtocolStep } from '@/constants/protocols';

// Map of protocolId_stepOrder -> animation require()
const STEP_ANIMATIONS: Record<string, any> = {
  biting_s1_step1: require('@/assets/animations/steps/biting_s1_step1.json'),
  biting_s1_step2: require('@/assets/animations/steps/biting_s1_step2.json'),
  biting_s1_step3: require('@/assets/animations/steps/biting_s1_step3.json'),
  biting_s1_step4: require('@/assets/animations/steps/biting_s1_step4.json'),
  biting_s1_step5: require('@/assets/animations/steps/biting_s1_step5.json'),
  settle_s1_step1: require('@/assets/animations/steps/settle_s1_step1.json'),
  settle_s1_step2: require('@/assets/animations/steps/settle_s1_step2.json'),
  settle_s1_step3: require('@/assets/animations/steps/settle_s1_step3.json'),
  settle_s1_step4: require('@/assets/animations/steps/settle_s1_step4.json'),
};

interface StepCardProps {
  step: ProtocolStep;
  stepNumber: number;
  totalSteps: number;
  commonMistake?: string;
  accentColor?: string;
  protocolId?: string;
}

export function StepCard({
  step,
  stepNumber,
  totalSteps,
  commonMistake,
  accentColor = colors.brand.primary,
  protocolId,
}: StepCardProps) {
  const [mistakeExpanded, setMistakeExpanded] = useState(false);

  const animationKey = protocolId ? `${protocolId}_step${stepNumber}` : null;
  const animationSource = animationKey ? STEP_ANIMATIONS[animationKey] : null;

  return (
    <View style={{ gap: spacing.md }}>
      {/* Step animation */}
      {animationSource ? (
        <View
          style={{
            borderRadius: radii.lg,
            overflow: 'hidden',
            backgroundColor: colors.bg.surface,
            borderWidth: 1,
            borderColor: colors.border.soft,
            ...shadows.card,
          }}
        >
          <LottieView
            source={animationSource}
            autoPlay
            loop={stepNumber === totalSteps}
            style={{ width: '100%', height: 240 }}
            resizeMode="contain"
          />
        </View>
      ) : null}

      {/* Step label */}
      <Text
        style={{
          fontSize: 11,
          fontWeight: '700',
          color: accentColor,
          textTransform: 'uppercase',
          letterSpacing: 1.2,
        }}
      >
        Step {stepNumber} of {totalSteps}
      </Text>

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

      {/* Common mistake collapsible */}
      {commonMistake ? (
        <Pressable
          onPress={() => setMistakeExpanded((v) => !v)}
          style={{
            backgroundColor: mistakeExpanded ? '#FFF1F2' : colors.bg.surface,
            borderRadius: radii.md,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: mistakeExpanded ? '#FECACA' : colors.border.default,
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: spacing.sm,
            minHeight: 44,
          }}
        >
          <AppIcon name="warning" size={16} color="#B91C1C" />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#B91C1C' }}>
              Common mistake {mistakeExpanded ? '▲' : '▼'}
            </Text>
            {mistakeExpanded && (
              <Text style={{ fontSize: 14, lineHeight: 22, color: '#7F1D1D', marginTop: 4 }}>
                {commonMistake}
              </Text>
            )}
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}
