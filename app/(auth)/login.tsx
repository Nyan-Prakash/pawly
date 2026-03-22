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
import { useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';

import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { supabase } from '@/lib/supabase';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setAuthError('');
    setGeneralError('');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        setAuthError('Incorrect email or password.');
        return;
      }
      // Root layout auth listener handles redirect
    } catch {
      setGeneralError('Something went wrong. Please try again.');
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

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken
      });

      if (error) {
        setGeneralError('Something went wrong. Please try again.');
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
            <Text
              style={{
                fontSize: 34,
                fontWeight: '800',
                color: colors.textPrimary,
                letterSpacing: -0.5,
                lineHeight: 40,
                marginBottom: spacing.xs,
              }}
            >
              Welcome back
            </Text>
            <Text
              variant="body"
              style={{ marginBottom: spacing.xxl, color: colors.textSecondary }}
            >
              Log in to continue with your dog's training.
            </Text>

            {/* Email */}
            <Text
              style={{
                marginBottom: spacing.xs,
                fontWeight: '600',
                fontSize: typography.sizes.sm,
                color: colors.textPrimary,
              }}
            >
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
              style={inputStyle(!!authError)}
            />

            {/* Password */}
            <Text
              style={{
                marginTop: spacing.md,
                marginBottom: spacing.xs,
                fontWeight: '600',
                fontSize: typography.sizes.sm,
                color: colors.textPrimary,
              }}
            >
              Password
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              placeholder="Your password"
              placeholderTextColor={colors.textSecondary}
              style={inputStyle(!!authError)}
            />

            {!!authError && (
              <Text variant="caption" style={{ color: colors.error, marginTop: spacing.xs }}>
                {authError}
              </Text>
            )}
            {!!generalError && (
              <Text variant="caption" style={{ color: colors.error, marginTop: spacing.xs }}>
                {generalError}
              </Text>
            )}

            {/* Forgot password */}
            <Pressable onPress={() => router.push('/(auth)/forgot-password')} style={{ alignSelf: 'flex-end', marginTop: spacing.sm }}>
              <Text variant="caption" style={{ color: colors.primary, fontWeight: typography.weights.medium }}>
                Forgot password?
              </Text>
            </Pressable>

            {/* Submit */}
            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              style={[primaryButtonStyle, { marginTop: spacing.xl, opacity: isLoading ? 0.7 : 1 }]}
            >
              {isLoading
                ? <ActivityIndicator color={colors.surface} />
                : <Text style={{ color: colors.surface, fontWeight: '700', fontSize: typography.sizes.md }}>Log in</Text>
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

            {/* Sign up link — routes to onboarding, not directly to signup.
                Per product contract: onboarding (dog profile + goal + plan) must
                happen before account creation. */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 'auto' }}>
              <Text variant="caption" style={{ color: colors.textSecondary }}>Don't have an account? </Text>
              <Pressable onPress={() => router.replace('/(onboarding)/dog-basics')}>
                <Text variant="caption" style={{ color: colors.primary, fontWeight: typography.weights.semibold }}>Sign up</Text>
              </Pressable>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const inputStyle = (hasError: boolean) => ({
  borderWidth: 1.5,
  borderColor: hasError ? colors.error : colors.border.soft,
  borderRadius: 16,
  paddingVertical: spacing.lg,
  paddingHorizontal: spacing.lg,
  fontSize: typography.sizes.md,
  color: colors.textPrimary,
  backgroundColor: colors.surface,
  minHeight: 58,
});

const primaryButtonStyle = {
  backgroundColor: colors.primary,
  borderRadius: 16,
  paddingVertical: spacing.lg,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  minHeight: 58,
};

const appleButtonStyle = {
  backgroundColor: '#000000',
  borderRadius: 16,
  paddingVertical: spacing.lg,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  minHeight: 58,
};

