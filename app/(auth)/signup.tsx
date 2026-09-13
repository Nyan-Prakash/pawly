import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, ScrollView, TextInput, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import * as AppleAuthentication from 'expo-apple-authentication';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { supabase, createUserRecord } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useDogStore } from '@/stores/dogStore';
import { usePlanStore } from '@/stores/planStore';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NETWORK_ERROR = "Couldn't reach Pawly. Check your connection and try again.";

/** Opens the Mail inbox on iOS; falls back to the default mail handler. */
function openMail() {
  Linking.openURL('message:')
    .catch(() => Linking.openURL('mailto:'))
    .catch(() => {});
}

export default function SignUpScreen() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const { isDark } = useTheme();
  const passwordRef = useRef<TextInput>(null);
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromOnboarding = from === 'onboarding';
  const submitOnboarding = useOnboardingStore((s) => s.submitOnboarding);
  const setOnboardingField = useOnboardingStore((s) => s.setField);
  const setDog = useDogStore((s) => s.setDog);
  const setActiveDogPlan = useDogStore((s) => s.setActivePlan);
  const setActivePlan = usePlanStore((s) => s.setActivePlan);
  const setDogProfile = useAuthStore((s) => s.setDogProfile);
  const dogName = useOnboardingStore((s) => s.dogName);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<string | null>(null);

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError('Enter a valid email address.');
      valid = false;
    }
    if (password.length < 8) {
      setPasswordError('Use at least 8 characters.');
      valid = false;
    }
    return valid;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const trimmedEmail = email.trim();
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
      });

      if (error) {
        const message = error.message.toLowerCase();
        if (message.includes('already registered') || message.includes('already in use')) {
          setEmailError('An account already uses this email. Log in instead.');
        } else {
          setGeneralError("Couldn't create your account. Check the details and try again.");
        }
        return;
      }

      if (data.user) {
        await createUserRecord(data.user.id, data.user.email ?? trimmedEmail).catch(() => {});
      }

      if (data.user && !data.session) {
        setPendingConfirmationEmail(data.user.email ?? trimmedEmail);
        return;
      }

      // If coming from onboarding flow, submit the plan now while session is guaranteed active
      if (fromOnboarding && data.session) {
        setOnboardingField('submissionIntent', 'onboarding');
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        const { dogId, dog, plan } = await submitOnboarding(data.session.user.id, {
          accessToken: data.session.access_token,
        });
        setDog(dog);
        setActivePlan(plan);
        setActiveDogPlan(plan);
        setDogProfile({ id: dogId, name: dogName });
        router.replace('/(onboarding)/plan-preview');
        return;
      }

      // Otherwise root layout auth listener handles redirect
    } catch (err) {
      console.error('[signup] handleSignUp failed:', err);
      setGeneralError(NETWORK_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (Platform.OS !== 'ios') return;
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

      const { data: appleData, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) {
        setGeneralError("Couldn't create your account with Apple. Try again or use your email.");
      } else if (fromOnboarding && appleData.session) {
        setOnboardingField('submissionIntent', 'onboarding');
        router.replace('/(onboarding)/plan-preview');
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
        {pendingConfirmationEmail ? (
          <>
            <View style={{ gap: spacing.sm }}>
              <Text variant="h1">Check your email</Text>
              <Text variant="body">
                We sent a confirmation link to {pendingConfirmationEmail}. Open it, then log in with
                the same email and password.
              </Text>
            </View>

            <View style={{ gap: spacing.sm }}>
              <Button label="Open Mail" onPress={openMail} />
              <Button
                label="Go to log in"
                variant="secondary"
                onPress={() => router.replace('/(auth)/login')}
              />
              <Button
                label="Use a different email"
                variant="ghost"
                onPress={() => setPendingConfirmationEmail(null)}
              />
            </View>
          </>
        ) : (
          <>
            <Text variant="h1">Create account</Text>

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
                error={emailError || undefined}
              />
              <Input
                ref={passwordRef}
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="newPassword"
                autoComplete="password-new"
                passwordRules="minlength: 8;"
                returnKeyType="go"
                onSubmitEditing={handleSignUp}
                placeholder="At least 8 characters"
                error={passwordError || undefined}
              />
              {generalError ? (
                <Text variant="caption" color={colors.status.danger} accessibilityLiveRegion="polite">
                  {generalError}
                </Text>
              ) : null}
            </View>

            <View style={{ gap: spacing.lg }}>
              <Button label="Create account" onPress={handleSignUp} loading={isLoading} />

              {Platform.OS === 'ios' ? (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <View style={{ flex: 1, height: 1, backgroundColor: colors.border.hairline }} />
                    <Text variant="caption">or</Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: colors.border.hairline }} />
                  </View>
                  <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
                    buttonStyle={
                      isDark
                        ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                        : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                    }
                    cornerRadius={radii.md}
                    style={{ height: 50 }}
                    onPress={handleAppleSignIn}
                  />
                </>
              ) : null}
            </View>
          </>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Text variant="caption">Already have an account?</Text>
          <Button
            label="Log in"
            variant="ghost"
            size="md"
            onPress={() => router.replace('/(auth)/login')}
            style={{ paddingHorizontal: 0 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
