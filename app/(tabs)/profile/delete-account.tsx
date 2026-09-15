import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { haptics } from '@/lib/haptics';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

const DELETION_LIST = [
  'Your account and login details',
  'Your dog profile, photos and avatar',
  'All plans and session history',
  'Walk logs and milestones',
  'Conversations with the coach',
  'Uploaded training videos',
  'Notifications and settings',
];

const CONFIRM_PHRASE = 'delete';

export default function DeleteAccountScreen() {
  const { user } = useAuthStore();
  const headerHeight = useHeaderHeight();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const confirmed = confirmText.trim().toLowerCase() === CONFIRM_PHRASE;

  function handleDelete() {
    if (!confirmed || isDeleting) return;

    Alert.alert('Delete account?', 'This is permanent. Your data is removed within 30 days and cannot be recovered.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete account',
        style: 'destructive',
        onPress: () => {
          haptics.error();
          performDeletion();
        },
      },
    ]);
  }

  async function performDeletion() {
    setIsDeleting(true);
    setErrorMsg('');
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('no-session');
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
        throw new Error('request-failed');
      }

      // Log out locally after the server-side deletion. The root layout's
      // auth listener navigates to the auth stack.
      await supabase.auth.signOut();
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : '';
      setErrorMsg(
        reason === 'no-session'
          ? 'Your session has expired. Log in again, then try deleting your account.'
          : "Couldn't delete the account. Check your connection and try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="body">
          Deleting your account is permanent. Everything below is removed within 30 days and cannot be recovered.
        </Text>

        <View>
          <SectionHeader title="What will be deleted" />
          <ListGroup>
            {DELETION_LIST.map((item) => (
              <ListRow key={item} icon="trash-outline" iconTone="secondary" title={item} />
            ))}
          </ListGroup>
        </View>

        {user?.email ? (
          <View>
            <SectionHeader title="Account" />
            <ListGroup>
              <ListRow icon="mail-outline" iconTone="secondary" title="Email" trailing={user.email} />
            </ListGroup>
          </View>
        ) : null}

        <Input
          label={`Type ${CONFIRM_PHRASE} to confirm`}
          placeholder={CONFIRM_PHRASE}
          value={confirmText}
          onChangeText={setConfirmText}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          textContentType="none"
          returnKeyType="done"
          onSubmitEditing={handleDelete}
        />

        {errorMsg ? (
          <Text variant="caption" color={colors.status.danger} accessibilityLiveRegion="polite">
            {errorMsg}
          </Text>
        ) : null}

        <Button
          label="Delete account"
          variant="destructive"
          loading={isDeleting}
          disabled={!confirmed || isDeleting}
          onPress={handleDelete}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
