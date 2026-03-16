/**
 * WhyThisChangedSheet
 *
 * Bottom sheet that explains what changed, why, and what success looks like next.
 * Opened from AdaptationNotice on the Today screen or from the Plan screen session drawer.
 */

import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import type { PlanAdaptation } from '@/types';

interface WhyThisChangedSheetProps {
  visible: boolean;
  onClose: () => void;
  dogName: string;
  adaptation: PlanAdaptation;
}

function adaptationKindLabel(type: PlanAdaptation['adaptationType']): string {
  switch (type) {
    case 'regress':        return 'Stepped back';
    case 'advance':        return 'Moved forward';
    case 'detour':         return 'Changed focus';
    case 'repeat':         return 'Reinforcing';
    case 'difficulty_adjustment': return 'Adjusted difficulty';
    case 'schedule_adjustment':   return 'Schedule change';
    default:               return 'Plan updated';
  }
}

function successLookLike(type: PlanAdaptation['adaptationType'], dogName: string): string {
  switch (type) {
    case 'regress':
      return `${dogName} getting 80% or better on the easier version, at least twice in a row, before moving forward.`;
    case 'advance':
      return `${dogName} handling the new challenge with good focus and fewer than 2 mistakes per session.`;
    case 'detour':
      return `Completing this session with calm engagement — no signs of frustration or shutdown.`;
    case 'repeat':
      return `${dogName} responding faster and more reliably than in the last session.`;
    case 'difficulty_adjustment':
      return `${dogName} finishing with a comfortable rating — not too easy, not too hard.`;
    default:
      return `${dogName} staying engaged and finishing the session feeling good.`;
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function WhyThisChangedSheet({
  visible,
  onClose,
  dogName,
  adaptation,
}: WhyThisChangedSheetProps) {
  const insets = useSafeAreaInsets();
  const kindLabel = adaptationKindLabel(adaptation.adaptationType);
  const successText = successLookLike(adaptation.adaptationType, dogName);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <Pressable onPress={() => {}} style={{ width: '100%' }}>
          <View
            style={{
              backgroundColor: colors.bg.surface,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              width: '100%',
              overflow: 'hidden',
            }}
          >
            {/* Drag handle */}
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.border.default,
                alignSelf: 'center',
                marginTop: spacing.md,
                marginBottom: spacing.sm,
              }}
            />

            <ScrollView
              style={{ flexGrow: 0, paddingHorizontal: spacing.lg }}
              contentContainerStyle={{ paddingBottom: spacing.xl}}
              showsVerticalScrollIndicator={false}
            >
              {/* Kind badge + title */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  marginBottom: spacing.sm,
                }}
              >
                <View
                  style={{
                    backgroundColor: `${colors.brand.coach}14`,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: 4,
                    borderRadius: radii.pill,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.brand.coach, letterSpacing: 0.5 }}>
                    {kindLabel.toUpperCase()}
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: colors.text.secondary }}>
                  {formatDate(adaptation.createdAt)}
                </Text>
              </View>

              {/* What changed */}
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text.primary, lineHeight: 28, marginBottom: spacing.md }}>
                What changed
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 22, color: colors.text.secondary, marginBottom: spacing.lg }}>
                {adaptation.reasonSummary || 'The plan was adjusted based on recent training patterns.'}
              </Text>

              {/* Why it changed */}
              <View
                style={{
                  backgroundColor: colors.bg.surfaceAlt,
                  borderRadius: radii.md,
                  padding: spacing.md,
                  gap: spacing.xs,
                  marginBottom: spacing.lg,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <AppIcon name="bulb" size={15} color={colors.brand.secondary} />
                  <Text style={{ fontWeight: '700', fontSize: 13, color: colors.text.primary }}>
                    Why Pawly made this change
                  </Text>
                </View>
                <Text style={{ fontSize: 13, lineHeight: 20, color: colors.text.secondary }}>
                  {adaptation.reasonCode === 'low_success_rate'
                    ? `${dogName} has been finding sessions harder lately. Stepping back helps rebuild confidence before moving forward again.`
                    : adaptation.reasonCode === 'high_success_rate'
                    ? `${dogName} has been doing really well — it's a good time to move to the next challenge.`
                    : adaptation.reasonCode === 'distraction_sensitivity'
                    ? `${dogName} has been struggling with distractions. Today's session is set up to reduce that pressure.`
                    : adaptation.reasonCode === 'fatigue'
                    ? `Recent sessions suggest ${dogName} may be getting mentally tired. Today is shorter and more familiar.`
                    : `Training patterns suggested a change would help ${dogName} stay on a good path.`}
                </Text>
              </View>

              {/* What success looks like */}
              <View
                style={{
                  backgroundColor: `${colors.success}10`,
                  borderRadius: radii.md,
                  padding: spacing.md,
                  gap: spacing.xs,
                  borderWidth: 1,
                  borderColor: `${colors.success}25`,
                  marginBottom: spacing.lg,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <AppIcon name="checkmark-circle" size={15} color={colors.success} />
                  <Text style={{ fontWeight: '700', fontSize: 13, color: colors.text.primary }}>
                    What success looks like next
                  </Text>
                </View>
                <Text style={{ fontSize: 13, lineHeight: 20, color: colors.text.secondary }}>
                  {successText}
                </Text>
              </View>

            </ScrollView>

            {/* Fixed footer — paddingBottom accounts for home indicator */}
            <View
              style={{
                paddingHorizontal: spacing.lg,
                paddingTop: spacing.md,
                paddingBottom: insets.bottom > 0 ? insets.bottom + spacing.md : spacing.lg,
                borderTopWidth: 1,
                borderTopColor: colors.border.soft,
                backgroundColor: colors.bg.surface,
              }}
            >
              <Button label="Got it" onPress={onClose} />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
