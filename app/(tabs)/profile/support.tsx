import { Alert, Linking, Platform, ScrollView, View } from 'react-native';
import Constants from 'expo-constants';
import { router } from 'expo-router';

import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { SUPPORT_EMAIL } from '@/constants/safety';
import { spacing } from '@/constants/spacing';

const APP_VERSION = Constants.expoConfig?.version ?? 'unknown';

const STORE_SUBSCRIPTIONS_URL =
  Platform.select({
    ios: 'https://apps.apple.com/account/subscriptions',
    default: 'https://play.google.com/store/account/subscriptions',
  }) ?? 'https://apps.apple.com/account/subscriptions';

function supportMailto(): string {
  const subject = `Pawly support (version ${APP_VERSION})`;
  const body = [
    '',
    '',
    'Tell us what happened above this line.',
    `App version: ${APP_VERSION}`,
    `Device: ${Platform.OS} ${Platform.Version}`,
  ].join('\n');
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

async function emailSupport() {
  try {
    await Linking.openURL(supportMailto());
  } catch {
    // No mail app set up (or the simulator): give them the address instead.
    Alert.alert("Couldn't open your mail app", `Email us at ${SUPPORT_EMAIL} from any mail app.`);
  }
}

export default function SupportScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
      <View>
        <SectionHeader title="Get help" />
        <ListGroup>
          <ListRow
            icon="mail-outline"
            title="Email support"
            subtitle={SUPPORT_EMAIL}
            trailing="chevron"
            onPress={emailSupport}
            accessibilityHint="Opens your mail app with a new message to Pawly support"
          />
          <ListRow
            icon="help-circle-outline"
            title="Help and FAQ"
            subtitle="Billing, the live coach, plans and your account"
            trailing="chevron"
            onPress={() => router.push('/(tabs)/profile/faq' as never)}
          />
        </ListGroup>
        <Text variant="caption" style={{ paddingTop: spacing.sm }}>
          The message includes your app version and device type so we can help faster.
        </Text>
      </View>

      <View>
        <SectionHeader title="Manage subscription" />
        <View style={{ gap: spacing.md }}>
          <Text variant="body">
            Pawly Pro is billed by Apple, so you change or cancel it with Apple, not in Pawly. On your iPhone, open the
            App Store, tap your picture at the top, then Subscriptions, then Pawly.
          </Text>
          <Text variant="body">
            Cancel at least 24 hours before the renewal date to avoid the next charge. Pro stays on until the end of the
            period you paid for. Refunds are handled by Apple at reportaproblem.apple.com.
          </Text>
          <ListGroup>
            <ListRow
              icon="card-outline"
              title="Open subscriptions"
              trailing="chevron"
              onPress={() => Linking.openURL(STORE_SUBSCRIPTIONS_URL)}
              accessibilityHint="Opens your App Store subscriptions"
            />
          </ListGroup>
          <Text variant="caption">
            New phone or a fresh install: open Pawly Pro from Profile and choose Restore purchases.
          </Text>
        </View>
      </View>

      <View>
        <SectionHeader title="Legal" />
        <ListGroup>
          <ListRow
            icon="document-text-outline"
            iconTone="secondary"
            title="Terms of service"
            trailing="chevron"
            onPress={() => router.push('/(tabs)/profile/terms-of-service')}
          />
          <ListRow
            icon="lock-closed-outline"
            iconTone="secondary"
            title="Privacy policy"
            trailing="chevron"
            onPress={() => router.push('/(tabs)/profile/privacy-policy')}
          />
        </ListGroup>
      </View>

      <Text variant="caption">
        Pawly can't help in an emergency. If your dog is hurt or unwell, call your vet.
      </Text>
    </ScrollView>
  );
}
