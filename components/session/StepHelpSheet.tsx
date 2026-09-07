import { ScrollView, Pressable, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import type { Protocol, ProtocolStep } from '@/constants/protocols';

interface StepHelpSheetProps {
  visible: boolean;
  onClose: () => void;
  protocol: Protocol;
  step: ProtocolStep;
  dogName: string;
  accentColor: string;
  /** Records the step as skipped and moves on. */
  onSkipStep: () => void;
}

/**
 * Mid-session help. Manual mode previously had no way to ask "he won't do
 * this" — the coach lives in another tab and leaving the modal loses the
 * session. This sheet surfaces the guidance the protocol already contains and
 * offers an honest "skip" that is recorded as such.
 */
export function StepHelpSheet({
  visible,
  onClose,
  protocol,
  step,
  dogName,
  accentColor,
  onSkipStep,
}: StepHelpSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} padded={false}>
      <View style={{ maxHeight: 560 }}>
        <View style={{ alignItems: 'center', paddingTop: spacing.sm }}>
          <View style={{ width: 40, height: 4, borderRadius: 999, backgroundColor: colors.border.strong }} />
        </View>

        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: spacing.xs }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary, lineHeight: 28 }}>
              {dogName} isn't getting it?
            </Text>
            <Text style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 22 }}>
              That's normal. Try one of these before moving on.
            </Text>
          </View>

          <Section icon="checkmark-circle" title="What you're looking for" color={accentColor}>
            <Text style={{ fontSize: 15, lineHeight: 22, color: colors.textPrimary }}>{step.successLook}</Text>
          </Section>

          {step.tip ? (
            <Section icon="bulb" title="Try this" color="#B45309">
              <Text style={{ fontSize: 15, lineHeight: 22, color: colors.textPrimary }}>{step.tip}</Text>
            </Section>
          ) : null}

          {protocol.commonMistakes.length > 0 ? (
            <Section icon="warning" title="Common mistakes" color="#B91C1C">
              <View style={{ gap: spacing.sm }}>
                {protocol.commonMistakes.map((m) => (
                  <View key={m} style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
                    <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>•</Text>
                    <Text style={{ flex: 1, fontSize: 15, lineHeight: 22, color: colors.textPrimary }}>{m}</Text>
                  </View>
                ))}
              </View>
            </Section>
          ) : null}

          {protocol.trainerNote ? (
            <Section icon="paw" title="From the trainer" color={accentColor}>
              <Text style={{ fontSize: 15, lineHeight: 22, color: colors.textPrimary }}>{protocol.trainerNote}</Text>
            </Section>
          ) : null}

          <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              style={({ pressed }) => ({
                backgroundColor: accentColor,
                borderRadius: radii.md,
                minHeight: 54,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text.primary }}>Try again</Text>
            </Pressable>
            <Pressable
              onPress={onSkipStep}
              accessibilityRole="button"
              style={({ pressed }) => ({
                minHeight: 48,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textSecondary }}>
                Skip this step for today
              </Text>
            </Pressable>
            <Text style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center', lineHeight: 18 }}>
              Skipping is recorded so your plan can adjust. It's better than guessing.
            </Text>
          </View>
        </ScrollView>
      </View>
    </BottomSheet>
  );
}

function Section({
  icon,
  title,
  color,
  children,
}: {
  icon: React.ComponentProps<typeof AppIcon>['name'];
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
        <AppIcon name={icon} size={16} color={color} />
        <Text style={{ fontSize: 12, fontWeight: '700', color, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}
