import { useState } from 'react';
import {
  View,
  TextInput,
  ActivityIndicator,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';

import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { supabase } from '@/lib/supabase';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { validatePassword, PASSWORD_PLACEHOLDER } from '@/lib/validation';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // By the time the user lands here, Supabase has already fired PASSWORD_RECOVERY
  // in onAuthStateChange (in _layout.tsx), which established the recovery session.
  // We just need to call updateUser with the new password.

  const handleSubmit = async () => {
    setError('');

    const pwResult = validatePassword(password);
    if (!pwResult.valid) {
      setError(pwResult.message);
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError('Failed to update password. The link may have expired — please request a new one.');
        return;
      }
      setIsSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
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
            <Pressable onPress={() => router.replace('/(auth)/login')} style={{ marginBottom: spacing.xl }}>
              <Text variant="caption" style={{ color: colors.primary, fontWeight: typography.weights.medium }}>
                ← Back to login
              </Text>
            </Pressable>

            <Text variant="title" style={{ marginBottom: spacing.sm }}>Set new password</Text>
            <Text variant="caption" style={{ marginBottom: spacing.xl, color: colors.textSecondary }}>
              Choose a new password for your account.
            </Text>

            {isSuccess ? (
              <>
                <View
                  style={{
                    backgroundColor: '#EDF7F5',
                    borderRadius: 12,
                    padding: spacing.lg,
                    borderWidth: 1,
                    borderColor: colors.primary,
                    marginBottom: spacing.xl,
                  }}
                >
                  <Text style={{ color: colors.primary, fontWeight: typography.weights.medium, fontSize: typography.sizes.md }}>
                    Password updated! You can now log in with your new password.
                  </Text>
                </View>
                <Pressable
                  onPress={() => router.replace('/(auth)/login')}
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    paddingVertical: spacing.lg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 52,
                  }}
                >
                  <Text style={{ color: colors.surface, fontWeight: typography.weights.semibold, fontSize: typography.sizes.md }}>
                    Go to login
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                {!!error && (
                  <View
                    style={{
                      backgroundColor: '#FEF2F2',
                      borderRadius: 12,
                      padding: spacing.md,
                      borderWidth: 1,
                      borderColor: colors.error,
                      marginBottom: spacing.lg,
                    }}
                  >
                    <Text variant="caption" style={{ color: colors.error }}>{error}</Text>
                  </View>
                )}

                <Text variant="caption" style={{ marginBottom: spacing.xs, fontWeight: typography.weights.medium, color: colors.textPrimary }}>
                  New password
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder={PASSWORD_PLACEHOLDER}
                  placeholderTextColor={colors.textSecondary}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border.default,
                    borderRadius: 12,
                    paddingVertical: spacing.lg,
                    paddingHorizontal: spacing.lg,
                    fontSize: typography.sizes.md,
                    color: colors.textPrimary,
                    backgroundColor: colors.surface,
                    marginBottom: spacing.lg,
                  }}
                />

                <Text variant="caption" style={{ marginBottom: spacing.xs, fontWeight: typography.weights.medium, color: colors.textPrimary }}>
                  Confirm password
                </Text>
                <TextInput
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="Re-enter password"
                  placeholderTextColor={colors.textSecondary}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border.default,
                    borderRadius: 12,
                    paddingVertical: spacing.lg,
                    paddingHorizontal: spacing.lg,
                    fontSize: typography.sizes.md,
                    color: colors.textPrimary,
                    backgroundColor: colors.surface,
                    marginBottom: spacing.xl,
                  }}
                />

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
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  {isLoading
                    ? <ActivityIndicator color={colors.surface} />
                    : <Text style={{ color: colors.surface, fontWeight: typography.weights.semibold, fontSize: typography.sizes.md }}>Update password</Text>
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
