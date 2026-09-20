import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppIcon } from '@/components/ui/AppIcon';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { isHighRiskGoal, PROFESSIONAL_HELP_NOTICE } from '@/constants/safety';
import { spacing } from '@/constants/spacing';
import { useDogStore } from '@/stores/dogStore';

// ─────────────────────────────────────────────────────────────────────────────
// Acknowledgement: once per dog and course, kept on the device. Not synced; the
// worst case after a reinstall is that the notice shows one more time.
// ─────────────────────────────────────────────────────────────────────────────

const ackKey = (dogId: string, goalKey: string) => `pawly.professionalHelpAck.${dogId}.${goalKey}`;

export async function hasAcknowledgedProfessionalHelp(dogId: string, goalKey: string): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ackKey(dogId, goalKey))) !== null;
  } catch {
    return false;
  }
}

export async function acknowledgeProfessionalHelp(dogId: string, goalKey: string): Promise<void> {
  try {
    await AsyncStorage.setItem(ackKey(dogId, goalKey), new Date().toISOString());
  } catch {
    // Not worth interrupting the owner over; the notice shows again next time.
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared body
// ─────────────────────────────────────────────────────────────────────────────

function RedFlags() {
  return (
    <View style={{ gap: spacing.md }}>
      <Text variant="body">{PROFESSIONAL_HELP_NOTICE.body}</Text>
      <View style={{ gap: spacing.sm }}>
        {PROFESSIONAL_HELP_NOTICE.redFlags.map((flag) => (
          <View key={flag} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
            <View
              style={{
                width: spacing.xs,
                height: spacing.xs,
                borderRadius: radii.full,
                backgroundColor: colors.text.secondary,
                marginTop: spacing.sm,
                marginHorizontal: spacing.sm,
              }}
            />
            <Text variant="body" style={{ flex: 1 }}>
              {flag}
            </Text>
          </View>
        ))}
      </View>
      <Text variant="caption">{PROFESSIONAL_HELP_NOTICE.footer}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sheet: shown before a high-risk course is added
// ─────────────────────────────────────────────────────────────────────────────

interface ProfessionalHelpSheetProps {
  visible: boolean;
  /** "Got it": the owner has read it and goes on. */
  onAcknowledge: () => void;
  /** Closed without acknowledging: nothing is added. */
  onClose: () => void;
}

export function ProfessionalHelpSheet({ visible, onAcknowledge, onClose }: ProfessionalHelpSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title={PROFESSIONAL_HELP_NOTICE.title} padded={false}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        <RedFlags />
      </ScrollView>
      <View style={{ paddingHorizontal: spacing.xl, paddingVertical: spacing.lg }}>
        <Button label={PROFESSIONAL_HELP_NOTICE.acknowledge} onPress={onAcknowledge} />
      </View>
    </BottomSheet>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Card: shown on the session overview until acknowledged. Covers courses that
// were chosen during onboarding and so never went through the add-course sheet.
// Renders nothing for other courses, or once it has been acknowledged.
// ─────────────────────────────────────────────────────────────────────────────

export function ProfessionalHelpCard({ goalKey }: { goalKey: string }) {
  const dogId = useDogStore((s) => s.dog?.id ?? null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!dogId || !isHighRiskGoal(goalKey)) {
      setShow(false);
      return;
    }
    let active = true;
    hasAcknowledgedProfessionalHelp(dogId, goalKey).then((acknowledged) => {
      if (active) setShow(!acknowledged);
    });
    return () => {
      active = false;
    };
  }, [dogId, goalKey]);

  if (!show || !dogId) return null;

  return (
    <Card style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <AppIcon name="medkit-outline" size={22} color={colors.status.warning} />
        <Text variant="h2" accessibilityRole="header" style={{ flex: 1 }}>
          {PROFESSIONAL_HELP_NOTICE.title}
        </Text>
      </View>
      <RedFlags />
      <Button
        label={PROFESSIONAL_HELP_NOTICE.acknowledge}
        variant="secondary"
        size="md"
        accessibilityHint="Hides this notice for this course"
        onPress={() => {
          setShow(false);
          void acknowledgeProfessionalHelp(dogId, goalKey);
        }}
      />
    </Card>
  );
}
