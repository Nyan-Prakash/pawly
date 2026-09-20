import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { OnboardingProgressBar } from '@/components/onboarding/ProgressBar';
import { spacing } from '@/constants/spacing';

type QuestionScreenProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /**
   * The footer's primary action. Name the step ("Add a photo", "Build the
   * plan"); use "Next" only when the next step is unknown to the user.
   * Omit to draw no primary button (pass `footerExtra` instead).
   */
  continueLabel?: string;
  onContinue?: () => void;
  canContinue?: boolean;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  scrollable?: boolean;
  /** Extra footer content under (or instead of) the primary button. */
  footerExtra?: ReactNode;
};

/**
 * One onboarding step: stepper header, title block, content, and a footer
 * that sits in the same flex column as the content (no absolute footer, no
 * magic bottom padding).
 */
export function QuestionScreen({
  title,
  subtitle,
  children,
  continueLabel,
  onContinue,
  canContinue = true,
  onBack,
  currentStep,
  totalSteps,
  scrollable = true,
  footerExtra,
}: QuestionScreenProps) {
  const showProgress = typeof currentStep === 'number' && typeof totalSteps === 'number';
  const showHeader = showProgress || Boolean(onBack);

  const titleBlock = (
    <View style={{ gap: spacing.xs }}>
      <Text variant="h1" accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? <Text variant="body">{subtitle}</Text> : null}
    </View>
  );

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {showHeader ? (
          <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm }}>
            {showProgress ? (
              <OnboardingProgressBar currentStep={currentStep} totalSteps={totalSteps} />
            ) : null}
            {onBack ? (
              <IconButton
                icon="chevron-back"
                accessibilityLabel="Back"
                tone="primary"
                onPress={onBack}
                style={{ alignSelf: 'flex-start', marginLeft: -spacing.md }}
              />
            ) : null}
          </View>
        ) : null}

        {scrollable ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xl, gap: spacing.xl }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            {titleBlock}
            {children}
          </ScrollView>
        ) : (
          <View style={{ flex: 1, padding: spacing.lg, paddingTop: spacing.xl, gap: spacing.xl }}>
            {titleBlock}
            {children}
          </View>
        )}

        {continueLabel || footerExtra ? (
          <View
            style={{
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.sm,
              paddingBottom: spacing.lg,
              gap: spacing.sm,
            }}
          >
            {continueLabel && onContinue ? (
              <Button label={continueLabel} onPress={onContinue} disabled={!canContinue} />
            ) : null}
            {footerExtra}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
