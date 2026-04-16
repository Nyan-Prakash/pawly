import { useState } from 'react';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { hexToRgba } from '@/constants/courseColors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

// ─── What gets deleted list ───────────────────────────────────────────────────
const DELETION_LIST = [
  'Your account and login credentials',
  'Your dog profile, photos, and avatar',
  'All training plans and session history',
  'Walk logs and milestone achievements',
  'AI Coach conversation history',
  'Uploaded training videos',
  'All notifications and preferences',
];

const CONFIRM_PHRASE = 'delete my account';

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function DeleteAccountScreen() {
  const { user } = useAuthStore();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmed = confirmText.trim().toLowerCase() === CONFIRM_PHRASE;

  async function handleDelete() {
    if (!confirmed || isDeleting) return;

    Alert.alert(
      'Delete Account',
      'This is permanent and cannot be undone. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: performDeletion,
        },
      ],
    );
  }

  async function performDeletion() {
    setIsDeleting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('No active session.');
      }

      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Deletion failed. Please try again.');
      }

      // Sign out locally after successful server-side deletion
      await supabase.auth.signOut();
      // Router will navigate to auth via the root layout's auth listener
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <SafeScreen>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          paddingTop: spacing.md,
          paddingBottom: spacing.sm,
          gap: spacing.sm,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.bg.surface,
            borderWidth: 1.5,
            borderColor: colors.border.soft,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadows.card,
          }}
        >
          <AppIcon name="chevron-back" size={18} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text.primary, letterSpacing: -0.3 }}>
          Delete Account
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.xxl * 2,
          gap: spacing.lg,
        }}
      >
        {/* Warning banner */}
        <View
          style={{
            backgroundColor: hexToRgba(colors.error, 0.08),
            borderWidth: 1.5,
            borderColor: hexToRgba(colors.error, 0.25),
            borderRadius: radii.lg,
            padding: spacing.md,
            flexDirection: 'row',
            gap: spacing.sm,
            alignItems: 'flex-start',
          }}
        >
          <AppIcon name="warning" size={20} color={colors.error} style={{ marginTop: 1 }} />
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Text
              style={{ fontSize: 14, fontWeight: '700', color: colors.error, letterSpacing: -0.1 }}
            >
              This action is permanent
            </Text>
            <Text style={{ fontSize: 13, lineHeight: 19, color: colors.error, opacity: 0.85 }}>
              Deleting your account cannot be undone. All your data will be permanently removed
              from our servers within 30 days.
            </Text>
          </View>
        </View>

        {/* What will be deleted */}
        <View style={{ gap: spacing.sm }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text.primary, letterSpacing: -0.2 }}>
            What will be deleted
          </Text>
          <View
            style={{
              backgroundColor: colors.bg.surface,
              borderRadius: radii.lg,
              borderWidth: 1.5,
              borderColor: colors.border.soft,
              padding: spacing.md,
              gap: spacing.sm,
              ...shadows.card,
            }}
          >
            {DELETION_LIST.map((item) => (
              <View key={item} style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
                <AppIcon name="close-circle" size={16} color={colors.error} style={{ marginTop: 2 }} />
                <Text style={{ flex: 1, fontSize: 14, lineHeight: 20, color: colors.text.secondary }}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Account being deleted */}
        {user?.email && (
          <View
            style={{
              backgroundColor: colors.bg.surface,
              borderRadius: radii.lg,
              borderWidth: 1.5,
              borderColor: colors.border.soft,
              paddingVertical: spacing.sm + 2,
              paddingHorizontal: spacing.md,
              ...shadows.card,
            }}
          >
            <Text variant="micro" color={colors.text.secondary}>
              Account to be deleted
            </Text>
            <Text variant="bodyStrong" style={{ marginTop: 2 }}>
              {user.email}
            </Text>
          </View>
        )}

        {/* Confirmation input */}
        <View style={{ gap: spacing.xs }}>
          <Input
            label={`TYPE "${CONFIRM_PHRASE.toUpperCase()}" TO CONFIRM`}
            placeholder={CONFIRM_PHRASE}
            value={confirmText}
            onChangeText={setConfirmText}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {confirmText.length > 0 && !confirmed && (
            <Text variant="micro" color={colors.error} style={{ marginTop: 2 }}>
              Text does not match. Type exactly: {CONFIRM_PHRASE}
            </Text>
          )}
        </View>

        {/* Delete button */}
        <Button
          label={isDeleting ? 'Deleting account...' : 'Delete My Account'}
          variant="primary"
          loading={isDeleting}
          disabled={!confirmed || isDeleting}
          onPress={handleDelete}
          style={{
            backgroundColor: confirmed ? colors.error : hexToRgba(colors.error, 0.4),
            borderColor: confirmed ? colors.error : 'transparent',
          }}
        />

        <Button
          label="Cancel"
          variant="ghost"
          onPress={() => router.back()}
          disabled={isDeleting}
        />
      </ScrollView>
    </SafeScreen>
  );
}
