import { useState } from 'react';
import {
  View,
  TextInput,
  ActivityIndicator,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Pressable
} from 'react-native';
import { useRouter } from 'expo-router';

import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { supabase } from '@/lib/supabase';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    setEmailError('');
    if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        setEmailError('Something went wrong. Please try again.');
        return;
      }
      setIsSuccess(true);
    } catch {
      setEmailError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxl }}>
            {/* Back link */}
            <Pressable onPress={() => router.back()} style={{ marginBottom: spacing.xl }}>
              <Text variant="caption" style={{ color: colors.primary, fontWeight: typography.weights.medium }}>
                ← Back
              </Text>
            </Pressable>

            <Text variant="title" style={{ marginBottom: spacing.sm }}>Reset password</Text>
            <Text variant="caption" style={{ marginBottom: spacing.xl, color: colors.textSecondary }}>
              Enter your email and we'll send you a reset link.
            </Text>

            {isSuccess ? (
              <View
                style={{
                  backgroundColor: '#EDF7F5',
                  borderRadius: 12,
                  padding: spacing.lg,
                  borderWidth: 1,
                  borderColor: colors.primary
                }}
              >
                <Text style={{ color: colors.primary, fontWeight: typography.weights.medium, fontSize: typography.sizes.md }}>
                  Check your email for a reset link.
                </Text>
              </View>
            ) : (
              <>
                <Text variant="caption" style={{ marginBottom: spacing.xs, fontWeight: typography.weights.medium, color: colors.textPrimary }}>
                  Email
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textSecondary}
                  style={{
                    borderWidth: 1,
                    borderColor: emailError ? colors.error : colors.border,
                    borderRadius: 12,
                    paddingVertical: spacing.lg,
                    paddingHorizontal: spacing.lg,
                    fontSize: typography.sizes.md,
                    color: colors.textPrimary,
                    backgroundColor: colors.surface
                  }}
                />
                {!!emailError && (
                  <Text variant="caption" style={{ color: colors.error, marginTop: spacing.xs }}>
                    {emailError}
                  </Text>
                )}

                <Pressable
                  onPress={handleSubmit}
                  disabled={isLoading}
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    paddingVertical: spacing.lg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 52,
                    marginTop: spacing.xl,
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  {isLoading
                    ? <ActivityIndicator color={colors.surface} />
                    : <Text style={{ color: colors.surface, fontWeight: typography.weights.semibold, fontSize: typography.sizes.md }}>Send reset link</Text>
                  }
                </Pressable>
              </>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
