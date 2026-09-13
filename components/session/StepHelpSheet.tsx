import { ScrollView, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import type { Protocol, ProtocolStep } from '@/constants/protocols';

interface StepHelpSheetProps {
  visible: boolean;
  onClose: () => void;
  protocol: Protocol;
  step: ProtocolStep;
  stepNumber: number;
  dogName: string;
  /** Records the step as skipped and moves on. Omit to hide the skip (quick reps). */
  onSkipStep?: () => void;
}

/**
 * "Why this step": the reason behind the step first, then the course guidance
 * the handler may need mid-session, and an honest skip that is recorded as such.
 */
export function StepHelpSheet({
  visible,
  onClose,
  protocol,
  step,
  stepNumber,
  dogName,
  onSkipStep,
}: StepHelpSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Why this step" padded={false}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <SectionHeader title="Why" />
          <Text variant="body">
            {step.tip ?? `Step ${stepNumber} raises one thing at a time so ${dogName} keeps winning.`}
          </Text>
        </View>

        <View>
          <SectionHeader title="What you're looking for" />
          <Text variant="body">{step.successLook}</Text>
        </View>

        {protocol.commonMistakes.length > 0 ? (
          <View>
            <SectionHeader title="Common mistakes" />
            <View style={{ gap: spacing.sm }}>
              {protocol.commonMistakes.map((m) => (
                <View key={m} style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
                  <AppIcon name="alert-circle-outline" size={20} color={colors.text.secondary} />
                  <Text variant="body" style={{ flex: 1 }}>
                    {m}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {protocol.trainerNote ? (
          <View>
            <SectionHeader title="From the coach" />
            <Text variant="body">{protocol.trainerNote}</Text>
          </View>
        ) : null}

        <View style={{ gap: spacing.sm }}>
          <Button label="Back to the step" onPress={onClose} />
          {onSkipStep ? (
            <>
              <Button label="Skip this step today" variant="secondary" onPress={onSkipStep} />
              <Text variant="caption">Skipping is recorded so your plan can adjust. It's better than guessing.</Text>
            </>
          ) : null}
        </View>
      </ScrollView>
    </BottomSheet>
  );
}
