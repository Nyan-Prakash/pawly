import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';

import { FeedbackModal } from '@/components/profile/FeedbackModal';
import { AppIcon } from '@/components/ui/AppIcon';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Card } from '@/components/ui/Card';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { MascotCallout } from '@/components/ui/MascotCallout';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { haptics } from '@/lib/haptics';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/authStore';
import { useDogStore } from '@/stores/dogStore';
import { useProgressStore } from '@/stores/progressStore';
import type { ThemePreference } from '@/stores/themeStore';

const AVATAR_SIZE = 64;

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Match device' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

function formatAge(ageMonths: number): string {
  if (ageMonths < 12) return `${ageMonths} month${ageMonths === 1 ? '' : 's'}`;
  const years = Math.floor(ageMonths / 12);
  return `${years} year${years === 1 ? '' : 's'}`;
}

function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { dog } = useDogStore();
  const { sessionStreak, totalSessionsCompleted } = useProgressStore();
  const { preference, setPreference } = useTheme();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showThemeSheet, setShowThemeSheet] = useState(false);

  const themeLabel = THEME_OPTIONS.find((option) => option.value === preference)?.label ?? 'Match device';
  const dogSummary = dog
    ? [dog.breed, formatAge(dog.ageMonths)].filter((part) => !!part).join(', ')
    : '';

  function handleLogOut() {
    Alert.alert('Log out?', 'You can log back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          supabase.auth.signOut();
        },
      },
    ]);
  }

  function choosePreference(value: ThemePreference) {
    haptics.selection();
    setPreference(value);
    setShowThemeSheet(false);
  }

  return (
    <>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
          <View
            style={{
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              borderRadius: radii.full,
              backgroundColor: colors.bg.fill,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {dog?.avatarUrl ? (
              <Image
                source={{ uri: dog.avatarUrl }}
                style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
                accessibilityIgnoresInvertColors
              />
            ) : (
              <MascotCallout state="happy" size={AVATAR_SIZE} />
            )}
          </View>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Text variant="h2" numberOfLines={1}>
              {dog?.name ?? 'Your dog'}
            </Text>
            {dogSummary ? (
              <Text variant="caption" numberOfLines={1}>
                {dogSummary}
              </Text>
            ) : null}
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/profile/edit-dog')}
            accessibilityRole="button"
            accessibilityLabel="Edit dog"
            hitSlop={8}
            style={({ pressed }) => ({ minHeight: 44, minWidth: 44, justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
          >
            <Text variant="bodyStrong" color={colors.accent}>
              Edit
            </Text>
          </Pressable>
        </Card>

        <View>
          <SectionHeader title="Stats" />
          <ListGroup>
            <ListRow icon="paw-outline" title="Sessions" trailing={String(totalSessionsCompleted)} />
            <ListRow icon="calendar-outline" title="Streak" trailing={pluralize(sessionStreak, 'day')} />
          </ListGroup>
        </View>

        <View>
          <SectionHeader title="Settings" />
          <ListGroup>
            <ListRow
              icon="notifications-outline"
              title="Notifications"
              trailing="chevron"
              onPress={() => router.push('/(tabs)/profile/notification-settings')}
            />
            <ListRow
              icon="contrast-outline"
              title="Appearance"
              trailing={themeLabel}
              onPress={() => setShowThemeSheet(true)}
              accessibilityHint="Opens the appearance picker"
            />
            <ListRow
              icon="chatbubble-outline"
              title="Send feedback"
              trailing="chevron"
              onPress={() => setShowFeedbackModal(true)}
            />
            <ListRow
              icon="document-text-outline"
              title="Privacy policy"
              trailing="chevron"
              onPress={() => router.push('/(tabs)/profile/privacy-policy')}
            />
            <ListRow
              icon="reader-outline"
              title="Terms of service"
              trailing="chevron"
              onPress={() => router.push('/(tabs)/profile/terms-of-service')}
            />
          </ListGroup>
        </View>

        <View>
          <SectionHeader title="Account" />
          <ListGroup>
            <ListRow icon="mail-outline" iconTone="secondary" title="Email" trailing={user?.email ?? 'Not set'} />
            <ListRow icon="log-out-outline" title="Log out" destructive onPress={handleLogOut} />
            <ListRow
              icon="trash-outline"
              title="Delete account"
              destructive
              trailing="chevron"
              onPress={() => router.push('/(tabs)/profile/delete-account')}
            />
          </ListGroup>
        </View>
      </ScrollView>

      <BottomSheet visible={showThemeSheet} onClose={() => setShowThemeSheet(false)} title="Appearance">
        <ListGroup>
          {THEME_OPTIONS.map((option) => (
            <ListRow
              key={option.value}
              title={option.label}
              selected={preference === option.value}
              trailing={preference === option.value ? <AppIcon name="checkmark" color={colors.accent} /> : undefined}
              onPress={() => choosePreference(option.value)}
            />
          ))}
        </ListGroup>
      </BottomSheet>

      <FeedbackModal visible={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
    </>
  );
}
