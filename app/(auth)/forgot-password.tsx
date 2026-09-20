import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { PASSWORD_RESET_REDIRECT } from '@/lib/authLinks';
import { supabase } from '@/lib/supabase';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    setEmailError('');
    setGeneralError('');
    if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError('Enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: PASSWORD_RESET_REDIRECT,
      });
      if (error) {
        setGeneralError("Couldn't send the reset link. Check the address and try again.");
        return;
      }
      setIsSuccess(true);
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
        {isSuccess ? (
          <>
            <View style={{ gap: spacing.sm }}>
              <Text variant="h1" accessibilityRole="header">Check your email</Text>
              <Text variant="body">
                We sent a reset link to {email.trim()}. Open it on this phone to choose a new
                password.
              </Text>
            </View>
            <Button label="Back to log in" onPress={() => router.back()} />
          </>
        ) : (
          <>
            <View style={{ gap: spacing.sm }}>
              <Text variant="h1" accessibilityRole="header">Reset password</Text>
              <Text variant="body">Enter your email and we'll send you a link to set a new one.</Text>
            </View>

            <View style={{ gap: spacing.lg }}>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                returnKeyType="send"
                onSubmitEditing={handleSubmit}
                placeholder="you@example.com"
                error={emailError || undefined}
              />
              {generalError ? (
                <Text variant="caption" color={colors.status.danger} accessibilityLiveRegion="polite">
                  {generalError}
                </Text>
              ) : null}
            </View>

            <Button label="Send reset link" onPress={handleSubmit} loading={isLoading} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
