import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';

import { AppIcon } from '@/components/ui/AppIcon';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';
import { TouchableOpacity } from 'react-native';

// ─── Last updated date ────────────────────────────────────────────────────────
const LAST_UPDATED = 'April 16, 2025';

// ─────────────────────────────────────────────────────────────────────────────
// Section component
// ─────────────────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.xs }}>
      <Text
        style={{
          fontSize: 15,
          fontWeight: '700',
          color: colors.text.primary,
          letterSpacing: -0.2,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function Body({ children }: { children: string }) {
  return (
    <Text
      style={{
        fontSize: 14,
        lineHeight: 22,
        color: colors.text.secondary,
      }}
    >
      {children}
    </Text>
  );
}

function Bullet({ children }: { children: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm, paddingLeft: spacing.xs }}>
      <Text style={{ color: colors.text.secondary, fontSize: 14, lineHeight: 22 }}>{'\u2022'}</Text>
      <Text style={{ flex: 1, fontSize: 14, lineHeight: 22, color: colors.text.secondary }}>
        {children}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function PrivacyPolicyScreen() {
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
          Privacy Policy
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.xxl * 2,
          gap: spacing.lg,
        }}
      >
        {/* Last updated */}
        <Text variant="micro" color={colors.text.secondary}>
          Last updated: {LAST_UPDATED}
        </Text>

        <Body>
          Pawly ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy
          explains how we collect, use, disclose, and safeguard your information when you use our
          mobile application. Please read this policy carefully. If you disagree with its terms,
          please discontinue use of the app.
        </Body>

        <Section title="1. Information We Collect">
          <Body>We collect the following types of information:</Body>
          <Bullet>
            Account information: email address and password (or Apple ID credentials if you sign in
            with Apple).
          </Bullet>
          <Bullet>
            Dog profile data: your dog's name, breed, age, sex, neutered status, behavior goals,
            training environment, and schedule preferences.
          </Bullet>
          <Bullet>
            Training activity: completed session logs, walk logs, milestone achievements, and
            behavioral progress scores.
          </Bullet>
          <Bullet>
            AI Coach conversations: messages you send to and receive from the AI training coach.
          </Bullet>
          <Bullet>
            Photos and videos: images or video clips of your dog that you voluntarily upload for
            session review.
          </Bullet>
          <Bullet>
            Device information: device type, operating system version, and app version for
            diagnostic purposes.
          </Bullet>
          <Bullet>
            Usage data: features used, screens visited, and in-app actions taken to improve the app
            experience.
          </Bullet>
        </Section>

        <Section title="2. How We Use Your Information">
          <Body>We use the information we collect to:</Body>
          <Bullet>Create and manage your account and dog profile.</Bullet>
          <Bullet>
            Generate personalized training plans and adapt them based on your dog's progress.
          </Bullet>
          <Bullet>Provide AI coaching responses tailored to your dog's specific needs.</Bullet>
          <Bullet>Track streaks, milestones, and behavioral learning over time.</Bullet>
          <Bullet>Send training reminders and milestone notifications (if enabled).</Bullet>
          <Bullet>Analyze usage to improve app features and content.</Bullet>
          <Bullet>Respond to your support requests and feedback.</Bullet>
        </Section>

        <Section title="3. Information Sharing and Disclosure">
          <Body>
            We do not sell your personal information. We may share your information in the following
            limited circumstances:
          </Body>
          <Bullet>
            Service providers: we use Supabase for database and authentication services, and
            third-party AI providers to power coaching features. These providers process data only
            on our behalf and are bound by confidentiality obligations.
          </Bullet>
          <Bullet>
            Legal requirements: we may disclose information if required by law, court order, or to
            protect the rights, property, or safety of Pawly, our users, or the public.
          </Bullet>
          <Bullet>
            Business transfers: if Pawly is acquired or merged, your information may transfer as
            part of that transaction. We will notify you before your information becomes subject to a
            different privacy policy.
          </Bullet>
        </Section>

        <Section title="4. Data Retention">
          <Body>
            We retain your personal data for as long as your account is active or as needed to
            provide services. You may request deletion of your account and all associated data at
            any time through Settings {'>'} Account {'>'} Delete Account. Upon deletion, we will
            remove your data within 30 days, except where we are required to retain it by law.
          </Body>
        </Section>

        <Section title="5. Photos and Videos">
          <Body>
            Photos and videos you upload are stored securely and used only to provide session
            review features within the app. We do not use your pet photos for advertising or share
            them with third parties outside of service providers necessary to deliver the feature.
            You may delete uploaded media at any time.
          </Body>
        </Section>

        <Section title="6. Children's Privacy">
          <Body>
            Pawly is not directed to children under the age of 13. We do not knowingly collect
            personal information from children under 13. If we learn that we have collected such
            information, we will delete it promptly. If you believe a child has provided us with
            personal information, please contact us at the address below.
          </Body>
        </Section>

        <Section title="7. Security">
          <Body>
            We implement industry-standard security measures including encrypted data transmission
            (TLS), secure cloud storage, and access controls. However, no method of transmission
            over the internet or electronic storage is 100% secure. We cannot guarantee absolute
            security of your data.
          </Body>
        </Section>

        <Section title="8. Your Rights">
          <Body>
            Depending on your location, you may have the following rights regarding your personal
            data:
          </Body>
          <Bullet>Access: request a copy of the personal data we hold about you.</Bullet>
          <Bullet>Correction: request that we correct inaccurate or incomplete data.</Bullet>
          <Bullet>
            Deletion: request that we delete your account and associated personal data.
          </Bullet>
          <Bullet>
            Portability: request a machine-readable export of your personal data (GDPR).
          </Bullet>
          <Bullet>
            Objection: object to certain processing of your data, such as for analytics.
          </Bullet>
          <Body>
            To exercise these rights, use the in-app Settings {'>'} Account controls or contact us
            directly.
          </Body>
        </Section>

        <Section title="9. Push Notifications">
          <Body>
            We send push notifications for training reminders, walk check-ins, and milestone
            celebrations, but only with your permission. You can manage or disable notifications at
            any time through Settings {'>'} Notifications or your device's system notification
            settings.
          </Body>
        </Section>

        <Section title="10. Changes to This Policy">
          <Body>
            We may update this Privacy Policy from time to time. We will notify you of material
            changes by displaying the updated policy in the app and updating the "Last updated" date
            above. Continued use of the app after changes constitutes acceptance of the revised
            policy.
          </Body>
        </Section>

        <Section title="11. Contact Us">
          <Body>
            If you have questions, concerns, or requests regarding this Privacy Policy or your
            personal data, please contact us at:
          </Body>
          <Body>Pawly Support{'\n'}Email: support@pawly.app</Body>
        </Section>
      </ScrollView>
    </SafeScreen>
  );
}
