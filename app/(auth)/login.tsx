import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import * as AppleAuthentication from 'expo-apple-authentication';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
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

  const handleLogin = async () => {
    setAuthError('');
    setGeneralError('');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthError("That email and password don't match. Try again or reset your password.");
        return;
      }
      // Root layout auth listener handles redirect
    } catch {
      setGeneralError(NETWORK_ERROR);
    } finally {
      setIsLoading(false);
    }
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
        <Text variant="h1">Log in</Text>

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
            secureTextEntry
            textContentType="password"
            autoComplete="password"
            returnKeyType="go"
            onSubmitEditing={handleLogin}
            placeholder="Your password"
            error={authError || undefined}
          />
          {generalError ? (
            <Text variant="caption" color={colors.status.danger} accessibilityLiveRegion="polite">
              {generalError}
            </Text>
          ) : null}
          <Button
            label="Forgot password?"
            variant="ghost"
            size="md"
            onPress={() => router.push('/(auth)/forgot-password')}
            style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }}
          />
        </View>

        <View style={{ gap: spacing.lg }}>
          <Button label="Log in" onPress={handleLogin} loading={isLoading} />

          {Platform.OS === 'ios' ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.border.hairline }} />
                <Text variant="caption">or</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.border.hairline }} />
              </View>
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
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
