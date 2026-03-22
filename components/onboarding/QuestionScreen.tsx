import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { OnboardingProgressBar } from '@/components/onboarding/ProgressBar';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

type QuestionScreenProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onContinue: () => void;
  canContinue: boolean;
  continueLabel?: string;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  scrollable?: boolean;
  footerExtra?: ReactNode;
};

export function QuestionScreen({
  title,
  subtitle,
  children,
  onContinue,
  canContinue,
  continueLabel = 'Continue',
  onBack,
  currentStep,
  totalSteps,
  scrollable = true,
  footerExtra,
}: QuestionScreenProps) {
  const insets = useSafeAreaInsets();
  const showProgress =
    typeof currentStep === 'number' && typeof totalSteps === 'number';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg.app }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Warm gradient blush — matches train screen */}
      <LinearGradient
        colors={[`${colors.brand.primary}0A`, 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}
        pointerEvents="none"
      />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: spacing.lg,
          paddingBottom: 4,
          gap: 10,
        }}
      >
        {showProgress && (
          <OnboardingProgressBar
            currentStep={currentStep!}
            totalSteps={totalSteps!}
          />
        )}
        {onBack && (
          <Pressable
            onPress={onBack}
            hitSlop={8}
            style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </Pressable>
        )}
      </View>

      {/* Body */}
      {scrollable ? (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: 140,
            gap: spacing.xl,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: spacing.xs }}>
            <Text
              variant="h1"
              style={{ fontSize: 28, fontWeight: '800', lineHeight: 36, letterSpacing: -0.5, color: colors.text.primary }}
            >
              {title}
            </Text>
            {subtitle && (
              <Text variant="body" color={colors.text.secondary} style={{ lineHeight: 22 }}>
                {subtitle}
              </Text>
            )}
          </View>
          {children}
        </ScrollView>
      ) : (
        <View
          style={{
            flex: 1,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: 140,
            gap: spacing.xl,
          }}
        >
          <View style={{ gap: spacing.xs }}>
            <Text
              variant="h1"
              style={{ fontSize: 28, fontWeight: '800', lineHeight: 36, letterSpacing: -0.5, color: colors.text.primary }}
            >
              {title}
            </Text>
            {subtitle && (
              <Text variant="body" color={colors.text.secondary} style={{ lineHeight: 22 }}>
                {subtitle}
              </Text>
            )}
          </View>
          {children}
        </View>
      )}

      {/* Fixed footer with gradient fade */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }}
        pointerEvents="box-none"
      >
        <LinearGradient
          colors={[`${colors.bg.app}00`, colors.bg.app]}
          style={{ height: 32 }}
          pointerEvents="none"
        />
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.sm,
            paddingBottom: insets.bottom + spacing.md,
            backgroundColor: colors.bg.app,
            gap: spacing.sm,
          }}
        >
          <Button
            label={continueLabel}
            onPress={onContinue}
            disabled={!canContinue}
            style={{ opacity: canContinue ? 1 : 0.4 }}
          />
          {footerExtra}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
