import { Linking, Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';

const LAST_UPDATED = 'April 16, 2025';
const SUPPORT_EMAIL = 'support@pawly.app';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="h2" selectable accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <Text variant="body" selectable>
      {children}
    </Text>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
      <View
        style={{
          width: spacing.xs,
          height: spacing.xs,
          borderRadius: radii.full,
          backgroundColor: colors.text.secondary,
          marginTop: spacing.sm,
          marginHorizontal: spacing.sm,
        }}
      />
      <Text variant="body" selectable style={{ flex: 1 }}>
        {children}
      </Text>
    </View>
  );
}

function SupportEmail() {
  return (
    <Pressable
      onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
      accessibilityRole="link"
      accessibilityLabel={`Email ${SUPPORT_EMAIL}`}
      hitSlop={8}
      style={({ pressed }) => ({ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
    >
      <Text variant="bodyStrong" color={colors.accent}>
        {SUPPORT_EMAIL}
      </Text>
    </Pressable>
  );
}

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
      <Text variant="caption">Last updated {LAST_UPDATED}</Text>

      <Body>
        Pawly ("we", "us" or "our") is committed to protecting your privacy. This privacy policy explains how we
        collect, use, disclose and safeguard your information when you use our mobile application. Please read it
        carefully. If you disagree with its terms, please stop using the app.
      </Body>

      <Section title="1. Information we collect">
        <Body>We collect the following types of information:</Body>
        <Bullet>Account information: email address and password, or Apple ID credentials if you use Sign in with Apple.</Bullet>
        <Bullet>
          Dog profile data: your dog's name, breed, age, sex, neutered status, behavior goals, training environment and
          schedule preferences.
        </Bullet>
        <Bullet>Training activity: completed session logs, walk logs, milestones reached and behavior progress scores.</Bullet>
        <Bullet>Coach conversations: messages you send to and receive from the coach.</Bullet>
        <Bullet>Photos: a photo of your dog that you choose to upload to create an avatar.</Bullet>
        <Bullet>Device information: device type, operating system version and app version, for diagnostics.</Bullet>
        <Bullet>Usage data: features used, screens visited and in-app actions taken, to improve the app.</Bullet>
      </Section>

      <Section title="2. How we use your information">
        <Body>We use the information we collect to:</Body>
        <Bullet>Create and manage your account and dog profile.</Bullet>
        <Bullet>Generate personalized plans and adapt them based on your dog's progress.</Bullet>
        <Bullet>Provide coach responses tailored to your dog's needs.</Bullet>
        <Bullet>Track streaks, milestones and behavior learning over time.</Bullet>
        <Bullet>Send training reminders and milestone notifications, if enabled.</Bullet>
        <Bullet>Analyze usage to improve app features and content.</Bullet>
        <Bullet>Respond to your support requests and feedback.</Bullet>
      </Section>

      <Section title="3. Information sharing and disclosure">
        <Body>We do not sell your personal information. We may share your information in these limited circumstances:</Body>
        <Bullet>
          Service providers: we use Supabase for database and authentication services, and third-party AI providers to
          power the coach. These providers process data only on our behalf and are bound by confidentiality obligations.
        </Bullet>
        <Bullet>
          Legal requirements: we may disclose information if required by law or court order, or to protect the rights,
          property or safety of Pawly, our users or the public.
        </Bullet>
        <Bullet>
          Business transfers: if Pawly is acquired or merged, your information may transfer as part of that transaction.
          We will notify you before your information becomes subject to a different privacy policy.
        </Bullet>
      </Section>

      <Section title="4. Data retention">
        <Body>
          We keep your personal data for as long as your account is active or as needed to provide the service. You can
          delete your account and all associated data at any time from Profile, under Account, by choosing Delete
          account. After deletion we remove your data within 30 days, except where the law requires us to keep it.
        </Body>
      </Section>

      <Section title="5. Photos">
        <Body>
          Photos you upload are stored securely and used only to create your dog's avatar in the app.
          We do not use your pet photos for advertising or share them with third parties beyond the service providers
          needed to deliver the feature. Your avatar is deleted when you delete your account.
        </Body>
      </Section>

      <Section title="6. Children's privacy">
        <Body>
          Pawly is not directed to children under 13. We do not knowingly collect personal information from children
          under 13. If we learn that we have, we delete it promptly. If you believe a child has given us personal
          information, contact us at the address below.
        </Body>
      </Section>

      <Section title="7. Security">
        <Body>
          We use industry-standard security measures, including encrypted data transmission (TLS), secure cloud storage
          and access controls. No method of transmission over the internet or of electronic storage is fully secure, so
          we cannot guarantee absolute security of your data.
        </Body>
      </Section>

      <Section title="8. Your rights">
        <Body>Depending on where you live, you may have these rights regarding your personal data:</Body>
        <Bullet>Access: request a copy of the personal data we hold about you.</Bullet>
        <Bullet>Correction: ask us to correct inaccurate or incomplete data.</Bullet>
        <Bullet>Deletion: ask us to delete your account and associated personal data.</Bullet>
        <Bullet>Portability: request a machine-readable export of your personal data (GDPR).</Bullet>
        <Bullet>Objection: object to certain processing of your data, such as analytics.</Bullet>
        <Body>To exercise these rights, use the controls under Account in Profile, or contact us directly.</Body>
      </Section>

      <Section title="9. Push notifications">
        <Body>
          We send push notifications for training reminders, walk check-ins and milestones, only with your permission.
          You can manage or turn off notifications at any time from Profile, under Settings, or in your device's
          notification settings.
        </Body>
      </Section>

      <Section title="10. Changes to this policy">
        <Body>
          We may update this privacy policy from time to time. We notify you of material changes by showing the updated
          policy in the app and updating the date above. Continued use of the app after changes means you accept the
          revised policy.
        </Body>
      </Section>

      <Section title="11. Contact us">
        <Body>If you have questions, concerns or requests about this privacy policy or your personal data, email Pawly support.</Body>
        <SupportEmail />
      </Section>
    </ScrollView>
  );
}
