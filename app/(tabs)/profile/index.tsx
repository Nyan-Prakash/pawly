import { useState } from 'react';
import { Alert, Image, Linking, Platform, Pressable, ScrollView, Switch, View } from 'react-native';
import { router } from 'expo-router';

import { FeedbackModal } from '@/components/profile/FeedbackModal';
import { AppIcon } from '@/components/ui/AppIcon';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Card } from '@/components/ui/Card';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { MascotCallout } from '@/components/ui/MascotCallout';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { isAnalyticsAvailable, isAnalyticsOptedOut, setAnalyticsOptedOut } from '@/lib/analytics';
import { haptics } from '@/lib/haptics';
import { PRO_ENTITLEMENT } from '@/lib/subscription';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/authStore';
import { useDogStore } from '@/stores/dogStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useProgressStore } from '@/stores/progressStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
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

const STORE_SUBSCRIPTIONS_URL = Platform.select({
  ios: 'https://apps.apple.com/account/subscriptions',
  default: 'https://play.google.com/store/account/subscriptions',
});

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { dog } = useDogStore();
  const { sessionStreak, totalSessionsCompleted } = useProgressStore();
  const { preference, setPreference } = useTheme();
  const tier = useSubscriptionStore((s) => s.tier);
  const customerInfo = useSubscriptionStore((s) => s.customerInfo);
  const openPaywall = useSubscriptionStore((s) => s.openPaywall);
  const restore = useSubscriptionStore((s) => s.restore);
  const isRestoring = useSubscriptionStore((s) => s.isRestoring);
  const [shareUsage, setShareUsage] = useState(() => !isAnalyticsOptedOut());
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showThemeSheet, setShowThemeSheet] = useState(false);

  const themeLabel = THEME_OPTIONS.find((option) => option.value === preference)?.label ?? 'Match device';
  const pro = customerInfo?.entitlements.active[PRO_ENTITLEMENT];
  const proStatus = pro?.expirationDate
    ? `${pro.willRenew ? 'Renews' : 'Ends'} ${formatDay(pro.expirationDate)}`
    : 'Active';
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
          // The root layout clears the stores on SIGNED_OUT. Half-finished
          // onboarding answers belong to this person, so they go too.
          useOnboardingStore.getState().reset();
          supabase.auth.signOut({ scope: 'local' });
        },
      },
    ]);
  }

  async function handleRestore() {
    const restored = await restore();
    const { error } = useSubscriptionStore.getState();
    Alert.alert(
      restored ? 'Pro is back on' : 'Nothing to restore',
      restored ? 'Your subscription was restored on this device.' : error ?? "We couldn't find a Pro subscription for this store account.",
    );
  }

  function toggleShareUsage(value: boolean) {
    setShareUsage(value);
    setAnalyticsOptedOut(!value);
  }

  function choosePreference(value: ThemePreference) {
    haptics.selection();
    setPreference(value);
    setShowThemeSheet(false);
  }

  return (
    <>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
        {/* No mascot line here: the dog's own avatar sits right below, and two dogs on one screen is one too many. */}
        <PageHeader title="Profile" />
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
                accessible
                accessibilityRole="image"
                accessibilityLabel={`${dog.name}'s avatar`}
                accessibilityIgnoresInvertColors
              />
            ) : (
              <MascotCallout state="happy" size={AVATAR_SIZE} />
            )}
          </View>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Text variant="h2" numberOfLines={1} accessibilityRole="header">
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
            accessibilityLabel={dog?.name ? `Edit ${dog.name}'s profile` : 'Edit dog profile'}
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
          <SectionHeader title="Subscription" />
          <ListGroup>
            {tier === 'pro' ? (
              <ListRow icon="ribbon-outline" title="Pawly Pro" trailing={proStatus} />
            ) : (
              <ListRow
                icon="ribbon-outline"
                title="Pawly Pro"
                subtitle="Every session, the coach without a limit"
                trailing="chevron"
                onPress={() => openPaywall('profile')}
              />
            )}
            {tier === 'pro' ? (
              <ListRow
                icon="card-outline"
                title="Manage subscription"
                trailing="chevron"
                onPress={() => Linking.openURL(customerInfo?.managementURL ?? STORE_SUBSCRIPTIONS_URL)}
                accessibilityHint="Opens your store subscription settings"
              />
            ) : null}
            <ListRow
              icon="refresh-outline"
              title={isRestoring ? 'Restoring' : 'Restore purchases'}
              disabled={isRestoring}
              onPress={handleRestore}
            />
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
            {isAnalyticsAvailable ? (
              <ListRow
                icon="analytics-outline"
                title="Share usage data"
                subtitle="Anonymous stats that help improve Pawly"
                trailing={
                  <Switch
                    value={shareUsage}
                    onValueChange={toggleShareUsage}
                    trackColor={{ true: colors.accent }}
                    accessibilityLabel="Share usage data"
                    accessibilityHint="Anonymous stats that help improve Pawly"
                  />
                }
              />
            ) : null}
          </ListGroup>
        </View>

        <View>
          <SectionHeader title="Help" />
          <ListGroup>
            <ListRow
              icon="help-circle-outline"
              title="Help and FAQ"
              trailing="chevron"
              onPress={() => router.push('/(tabs)/profile/faq' as never)}
            />
            <ListRow
              icon="mail-outline"
              title="Contact support"
              trailing="chevron"
              onPress={() => router.push('/(tabs)/profile/support' as never)}
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
        <View accessibilityRole="radiogroup" accessibilityLabel="Appearance">
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
        </View>
      </BottomSheet>

      <FeedbackModal visible={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
    </>
  );
}
