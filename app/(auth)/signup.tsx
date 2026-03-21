import { useState } from 'react';
import {
  View,
  TextInput,
  ActivityIndicator,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Pressable
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';

import { SafeScreen } from '@/components/ui/SafeScreen';
import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { supabase, createUserRecord } from '@/lib/supabase';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useDogStore } from '@/stores/dogStore';
import { usePlanStore } from '@/stores/planStore';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromOnboarding = from === 'onboarding';
  const submitOnboarding = useOnboardingStore((s) => s.submitOnboarding);
  const resetOnboarding = useOnboardingStore((s) => s.reset);
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
      setEmailError('Please enter a valid email address.');
      valid = false;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
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
        password
      });

      if (error) {
        if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already in use')) {
          setEmailError('Email already in use. Try logging in instead.');
        } else {
          setGeneralError('Something went wrong. Please try again.');
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
      setGeneralError(
        `Something went wrong: ${err instanceof Error ? err.message : JSON.stringify(err)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (Platform.OS !== 'ios') return;
    setIsLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL
        ]
      });

      if (!credential.identityToken) {
        setGeneralError('Something went wrong. Please try again.');
        return;
      }

      const { data: appleData, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken
      });

      if (error) {
        setGeneralError('Something went wrong. Please try again.');
      } else if (fromOnboarding && appleData.session) {
        setOnboardingField('submissionIntent', 'onboarding');
        router.replace('/(onboarding)/plan-preview');
      }
    } catch (err: unknown) {
      if ((err as { code?: string }).code !== 'ERR_REQUEST_CANCELED') {
        setGeneralError('Something went wrong. Please try again.');
      }
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
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xl }}
            keyboardShouldPersistTaps="handled"
          >
            {pendingConfirmationEmail ? (
              <>
                <View
                  style={{
                    alignSelf: 'center',
                    width: 88,
                    height: 88,
                    borderRadius: 44,
                    backgroundColor: colors.status.successBg,
                    borderWidth: 1,
                    borderColor: colors.status.successBorder,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: spacing.lg
                  }}
                >
                  <AppIcon name="mail-open-outline" size={38} color={colors.success} />
                </View>

                <Text variant="title" style={{ marginBottom: spacing.sm, textAlign: 'center' }}>
                  Confirm your email
                </Text>
                <Text variant="caption" style={{ marginBottom: spacing.xl, color: colors.textSecondary, textAlign: 'center' }}>
                  We sent a confirmation link to {pendingConfirmationEmail}. Open that email and accept it before logging in.
                </Text>

                <View
                  style={{
                    backgroundColor: colors.status.successBg,
                    borderColor: colors.status.successBorder,
                    borderWidth: 1,
                    borderRadius: 20,
                    padding: spacing.lg,
                    marginBottom: spacing.xl
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                    <AppIcon name="checkmark-circle" size={18} color={colors.success} />
                    <Text style={{ marginLeft: spacing.sm, color: colors.textPrimary, fontWeight: typography.weights.semibold }}>
                      Your account was created
                    </Text>
                  </View>
                  <Text variant="caption" style={{ color: colors.textSecondary }}>
                    After you verify your email, return here and log in with the same address and password.
                  </Text>
                </View>

                <Pressable
                  onPress={() => router.replace('/(auth)/login')}
                  style={[primaryButtonStyle, { marginBottom: spacing.md }]}
                >
                  <Text style={{ color: colors.surface, fontWeight: typography.weights.semibold, fontSize: typography.sizes.md }}>
                    Go to log in
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setPendingConfirmationEmail(null)}
                  style={secondaryButtonStyle}
                >
                  <Text style={{ color: colors.textPrimary, fontWeight: typography.weights.semibold, fontSize: typography.sizes.md }}>
                    Use a different email
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text variant="title" style={{ marginBottom: spacing.sm }}>Create your account</Text>
                <Text variant="caption" style={{ marginBottom: spacing.xl, color: colors.textSecondary }}>
                  Start training smarter today.
                </Text>

                {/* Email */}
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
                  style={inputStyle(!!emailError)}
                />
                {!!emailError && (
                  <Text variant="caption" style={{ color: colors.error, marginTop: spacing.xs, marginBottom: spacing.sm }}>
                    {emailError}
                  </Text>
                )}

                {/* Password */}
                <Text variant="caption" style={{ marginTop: spacing.md, marginBottom: spacing.xs, fontWeight: typography.weights.medium, color: colors.textPrimary }}>
                  Password
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password-new"
                  placeholder="Min. 8 characters"
                  placeholderTextColor={colors.textSecondary}
                  style={inputStyle(!!passwordError)}
                />
                {!!passwordError && (
                  <Text variant="caption" style={{ color: colors.error, marginTop: spacing.xs, marginBottom: spacing.sm }}>
                    {passwordError}
                  </Text>
                )}

                {!!generalError && (
                  <Text variant="caption" style={{ color: colors.error, marginTop: spacing.sm }}>
                    {generalError}
                  </Text>
                )}

                {/* Submit */}
                <Pressable
                  onPress={handleSignUp}
                  disabled={isLoading}
                  style={[primaryButtonStyle, { marginTop: spacing.xl, opacity: isLoading ? 0.7 : 1 }]}
                >
                  {isLoading
                    ? <ActivityIndicator color={colors.surface} />
                    : <Text style={{ color: colors.surface, fontWeight: typography.weights.semibold, fontSize: typography.sizes.md }}>Create account</Text>
                  }
                </Pressable>

                {/* Apple Sign In — iOS only */}
                {Platform.OS === 'ios' && (
                  <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xl }}>
                    <View style={{ flex: 1, height: 1, backgroundColor: colors.border.default }} />
                    <Text variant="caption" style={{ marginHorizontal: spacing.md, color: colors.textSecondary }}>OR</Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: colors.border.default }} />
                  </View>
                  <Pressable
                    onPress={handleAppleSignIn}
                    disabled={isLoading}
                    style={[appleButtonStyle, { marginBottom: spacing.md, opacity: isLoading ? 0.7 : 1 }]}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: typography.weights.semibold, fontSize: typography.sizes.md }}>
                       Continue with Apple
                    </Text>
                  </Pressable>
                  </>
                )}
              </>
            )}

            {/* Login link */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 'auto' }}>
              <Text variant="caption" style={{ color: colors.textSecondary }}>Already have an account? </Text>
              <Pressable onPress={() => router.replace('/(auth)/login')}>
                <Text variant="caption" style={{ color: colors.primary, fontWeight: typography.weights.semibold }}>Log in</Text>
              </Pressable>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const inputStyle = (hasError: boolean) => ({
  borderWidth: 1,
  borderColor: hasError ? colors.error : colors.border.default,
  borderRadius: 12,
  paddingVertical: spacing.lg,
  paddingHorizontal: spacing.lg,
  fontSize: typography.sizes.md,
  color: colors.textPrimary,
  backgroundColor: colors.surface
});

const primaryButtonStyle = {
  backgroundColor: colors.primary,
  borderRadius: 12,
  paddingVertical: spacing.lg,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  minHeight: 52
};

const secondaryButtonStyle = {
  backgroundColor: colors.surface,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border.default,
  paddingVertical: spacing.lg,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  minHeight: 52
};

const appleButtonStyle = {
  backgroundColor: '#000000',
  borderRadius: 12,
  paddingVertical: spacing.lg,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  minHeight: 52
};

