import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import * as AppleAuthentication from 'expo-apple-authentication';

import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { MascotCallout } from '@/components/ui/MascotCallout';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { captureEvent } from '@/lib/analytics';
import { storeAppleAuthorizationCode } from '@/lib/appleAuth';
import { EMAIL_CONFIRM_REDIRECT } from '@/lib/authLinks';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';

const NETWORK_ERROR = "Couldn't reach Pawly. Check your connection and try again.";

export default function LoginScreen() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const { isDark } = useTheme();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleLogin = async () => {
    setAuthError('');
    setGeneralError('');
    setNeedsConfirmation(false);
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.code === 'email_not_confirmed') {
          setNeedsConfirmation(true);
          setResendState('idle');
          setGeneralError('Confirm your email first. Open the link we sent when you created the account.');
        } else if (error.status === 429 || error.code === 'over_request_rate_limit') {
          setGeneralError('Too many attempts. Wait a minute, then try again.');
        } else if (error.code === 'invalid_credentials' || error.status === 400) {
          setAuthError("That email and password don't match. Try again or reset your password.");
        } else {
          setGeneralError(NETWORK_ERROR);
        }
        return;
      }
      captureEvent('login_completed', { method: 'email' });
      // Root layout auth listener handles redirect
    } catch {
      setGeneralError(NETWORK_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setResendState('sending');
    const { error } = await supabase.auth
      .resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: EMAIL_CONFIRM_REDIRECT } })
      .catch(() => ({ error: true }));
    if (error) {
      setResendState('idle');
      setGeneralError("Couldn't send the email. Wait a minute, then try again.");
      return;
    }
    setResendState('sent');
  };

  const handleAppleSignIn = async () => {
    if (Platform.OS !== 'ios') return;
    setAuthError('');
    setGeneralError('');
    setIsLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        setGeneralError("Apple didn't return a login token. Try again.");
        return;
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) {
        setGeneralError("Couldn't log in with Apple. Try again or use your email.");
      } else {
        storeAppleAuthorizationCode(credential.authorizationCode);
        captureEvent('login_completed', { method: 'apple' });
      }
    } catch (err: unknown) {
      if ((err as { code?: string }).code !== 'ERR_REQUEST_CANCELED') {
        setGeneralError(NETWORK_ERROR);
      }
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
        <View style={{ gap: spacing.lg }}>
          <Text variant="h1" accessibilityRole="header">Welcome back</Text>
          <MascotCallout state="happy" size={64} calloutPlacement="right" callout="Your dog's plan is right where you left it." />
        </View>

        {Platform.OS === 'ios' ? (
          <View style={{ gap: spacing.lg }}>
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={
                isDark
                  ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                  : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
              }
              cornerRadius={radii.md}
              style={{ height: 52 }}
              onPress={handleAppleSignIn}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border.hairline }} />
              <Text variant="caption">or with email</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border.hairline }} />
            </View>
          </View>
        ) : null}

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
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            blurOnSubmit={false}
            placeholder="you@example.com"
          />
          <Input
            ref={passwordRef}
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            textContentType="password"
            autoComplete="password"
            returnKeyType="go"
            onSubmitEditing={handleLogin}
            placeholder="Your password"
            error={authError || undefined}
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
          {needsConfirmation ? (
            <Button
              label={resendState === 'sent' ? 'Confirmation email sent' : 'Resend confirmation email'}
              variant="secondary"
              size="md"
              onPress={handleResendConfirmation}
              loading={resendState === 'sending'}
              disabled={resendState === 'sent'}
            />
          ) : null}
          <Button label="Log in" onPress={handleLogin} loading={isLoading} />
          <Button
            label="Forgot password?"
            variant="ghost"
            size="md"
            onPress={() => router.push('/(auth)/forgot-password')}
            style={{ alignSelf: 'center' }}
          />
        </View>

        {/* Account creation routes to onboarding: dog profile and plan come before the account. */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Text variant="caption">Don't have an account?</Text>
          <Button
            label="Create account"
            variant="ghost"
            size="md"
            onPress={() => router.replace('/(onboarding)/dog-basics')}
            style={{ paddingHorizontal: 0 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
