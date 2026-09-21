import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';

import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

/** Reached from the reset email (`pawly://reset-password`); see lib/authLinks.ts. */
export default function ResetPasswordScreen() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const session = useAuthStore((s) => s.session);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setPasswordError('');
    setGeneralError('');
    if (password.length < 8) {
      setPasswordError('Use at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setGeneralError(
          error.code === 'same_password'
            ? 'Choose a password you have not used before.'
            : "Couldn't save the new password. Request a new reset link and try again.",
        );
        return;
      }
      // The root layout routes on from here (tabs, or onboarding without a dog).
      useAuthStore.setState({ isPasswordRecovery: false });
    } catch {
      setGeneralError("Couldn't reach Pawly. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {session ? (
          <>
            <View style={{ gap: spacing.sm }}>
              <Text variant="h1" accessibilityRole="header">Choose a new password</Text>
              <Text variant="body">You'll use it the next time you log in.</Text>
            </View>

            <View style={{ gap: spacing.lg }}>
              <Input
                label="New password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textContentType="newPassword"
                autoComplete="new-password"
                returnKeyType="go"
                onSubmitEditing={handleSubmit}
                placeholder="At least 8 characters"
                error={passwordError || undefined}
                trailing={
                  <IconButton
                    icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    tone="secondary"
                    onPress={() => setShowPassword((v) => !v)}
                  />
                }
              />
              {generalError ? (
                <Text variant="caption" color={colors.status.danger} accessibilityLiveRegion="polite">
                  {generalError}
                </Text>
              ) : null}
            </View>

            <Button label="Save password" onPress={handleSubmit} loading={isLoading} />
          </>
        ) : (
          <>
            <View style={{ gap: spacing.sm }}>
              <Text variant="h1" accessibilityRole="header">This link has expired</Text>
              <Text variant="body">Reset links work once and only for a short time. Request a new one.</Text>
            </View>
            <Button label="Send a new link" onPress={() => router.replace('/(auth)/forgot-password')} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
