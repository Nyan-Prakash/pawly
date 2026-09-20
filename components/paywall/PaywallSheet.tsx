import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import type { PurchasesPackage } from 'react-native-purchases';

import { AppIcon } from '@/components/ui/AppIcon';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { isRevenueCatAvailable } from '@/lib/revenuecat';
import { FREE_LIMITS, annualSavingsPercent, freeTrialLength } from '@/lib/subscription';
import { useDogStore } from '@/stores/dogStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

type Period = 'annual' | 'monthly';

const STORE_NAME = Platform.OS === 'ios' ? 'App Store' : 'Google Play';

function planSubtitle(period: Period, pkg: PurchasesPackage, monthly: PurchasesPackage | null): string {
  const { priceString, pricePerMonthString, price } = pkg.product;
  if (period === 'monthly') return `${priceString} a month`;

  const parts = [`${priceString} a year`];
  if (pricePerMonthString) parts.push(`${pricePerMonthString} a month`);
  const savings = monthly ? annualSavingsPercent(monthly.product.price, price) : null;
  if (savings) parts.push(`${savings}% less than monthly`);
  return parts.join(' · ');
}

/**
 * The one paywall. Mounted once in the root layout and opened from anywhere
 * with `useSubscriptionStore.getState().openPaywall(source)`. Prices always
 * come from the RevenueCat offering, never from this file.
 */
export function PaywallSheet() {
  const {
    tier,
    packages,
    trialEligibility,
    isLoadingPackages,
    isPurchasing,
    isRestoring,
    error,
    isPaywallOpen,
    closePaywall,
    loadPackages,
    purchase,
    restore,
  } = useSubscriptionStore();
  const dogName = useDogStore((s) => s.dog?.name);
  const [period, setPeriod] = useState<Period>('annual');

  // Fall back to whichever plan the offering actually has.
  useEffect(() => {
    if (!packages[period]) {
      if (packages.annual) setPeriod('annual');
      else if (packages.monthly) setPeriod('monthly');
    }
  }, [packages, period]);

  const selected = packages[period];
  const trialAvailable = !!selected && trialEligibility[selected.product.identifier] === true;
  const trial = trialAvailable ? freeTrialLength(selected?.product.introPrice) : null;
  const busy = isPurchasing || isRestoring;
  const hasPlans = !!packages.annual || !!packages.monthly;

  function openLegal(path: '/(tabs)/profile/terms-of-service' | '/(tabs)/profile/privacy-policy') {
    closePaywall();
    router.push(path);
  }

  let body;
  if (tier === 'pro') {
    body = (
      <View style={{ flex: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, gap: spacing.xl }}>
        <View style={{ flex: 1, gap: spacing.sm, paddingTop: spacing.sm }}>
          <Text variant="h1" accessibilityRole="header">Pro is on</Text>
          <Text variant="body" color={colors.text.secondary}>
            {dogName ? `${dogName}'s whole plan is open.` : 'The whole plan is open.'} You can manage the
            subscription from Profile.
          </Text>
        </View>
        <Button label="Close" variant="secondary" onPress={closePaywall} />
      </View>
    );
  } else if (!hasPlans) {
    body = (
      <View style={{ flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.sm, gap: spacing.lg }}>
        {isLoadingPackages ? (
          <LoadingSpinner />
        ) : (
          <>
            <Text variant="body" color={colors.text.secondary}>
              {isRevenueCatAvailable
                ? "Couldn't load the plans. Check your connection and try again."
                : "Subscriptions aren't set up in this build yet."}
            </Text>
            {isRevenueCatAvailable ? (
              <Button label="Load plans again" variant="secondary" onPress={loadPackages} />
            ) : null}
            {error ? (
              <Text variant="caption" color={colors.status.danger} accessibilityLiveRegion="polite">
                {error}
              </Text>
            ) : null}
            {/* Restore and the legal links stay reachable even when the plans can't load. */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.xl }}>
              <TextLink
              label={isRestoring ? 'Restoring' : 'Restore purchases'}
              disabled={busy}
              busy={isRestoring}
              onPress={restore}
            />
              <TextLink label="Terms" accessibilityLabel="Terms of service" disabled={busy} onPress={() => openLegal('/(tabs)/profile/terms-of-service')} />
              <TextLink label="Privacy" accessibilityLabel="Privacy policy" disabled={busy} onPress={() => openLegal('/(tabs)/profile/privacy-policy')} />
            </View>
          </>
        )}
      </View>
    );
  } else {
    body = (
      <>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xl, gap: spacing.xl }}
        >
          <View style={{ gap: spacing.sm, paddingHorizontal: spacing.sm }}>
            <Text variant="h1" accessibilityRole="header">{dogName ? `All of ${dogName}'s plan` : 'The whole plan'}</Text>
            <Text variant="body" color={colors.text.secondary}>
              Free covers the first {FREE_LIMITS.sessions} sessions. Pro opens everything after them.
            </Text>
          </View>

          <ListGroup>
            <ListRow icon="calendar-outline" title="Every session in the plan" subtitle="All courses, start to finish" />
            <ListRow icon="chatbubbles-outline" title="The coach, without a daily limit" />
            <ListRow icon="stats-chart-outline" title="Full progress history" />
          </ListGroup>

          <View accessibilityRole="radiogroup" accessibilityLabel="Billing period">
          <ListGroup>
            {(['annual', 'monthly'] as const).map((option) => {
              const pkg = packages[option];
              if (!pkg) return null;
              const isSelected = option === period;
              return (
                <ListRow
                  key={option}
                  title={option === 'annual' ? 'Yearly' : 'Monthly'}
                  subtitle={planSubtitle(option, pkg, packages.monthly)}
                  selected={isSelected}
                  disabled={busy}
                  trailing={isSelected ? <AppIcon name="checkmark" color={colors.accent} /> : undefined}
                  onPress={() => setPeriod(option)}
                />
              );
            })}
          </ListGroup>
          </View>
        </ScrollView>

        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md }}>
          {error ? (
            <Text variant="caption" color={colors.status.danger} accessibilityLiveRegion="polite">
              {error}
            </Text>
          ) : null}
          <Button
            label={trial ? `Start ${trial} free trial` : 'Subscribe to Pro'}
            loading={isPurchasing}
            disabled={busy || !selected}
            onPress={() => selected && purchase(selected)}
          />
          {selected ? (
            <Text variant="caption">
              {trial ? `Free for the trial, then ` : ''}
              {selected.product.priceString} {period === 'annual' ? 'a year' : 'a month'}. Renews until you cancel
              in your {STORE_NAME} settings.
            </Text>
          ) : null}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.xl }}>
            <TextLink
              label={isRestoring ? 'Restoring' : 'Restore purchases'}
              disabled={busy}
              busy={isRestoring}
              onPress={restore}
            />
            <TextLink label="Terms" accessibilityLabel="Terms of service" disabled={busy} onPress={() => openLegal('/(tabs)/profile/terms-of-service')} />
            <TextLink label="Privacy" accessibilityLabel="Privacy policy" disabled={busy} onPress={() => openLegal('/(tabs)/profile/privacy-policy')} />
          </View>
        </View>
      </>
    );
  }

  return (
    <BottomSheet visible={isPaywallOpen} onClose={closePaywall} title="Pawly Pro" padded={false}>
      {body}
    </BottomSheet>
  );
}

function TextLink({
  label,
  onPress,
  disabled,
  busy,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled, busy: !!busy }}
      hitSlop={8}
      style={({ pressed }) => ({ minHeight: 44, justifyContent: 'center', opacity: disabled ? 0.4 : pressed ? 0.6 : 1 })}
    >
      <Text variant="captionStrong" color={colors.accent}>
        {label}
      </Text>
    </Pressable>
  );
}
