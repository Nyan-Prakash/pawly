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

export default function TermsOfServiceScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
      <Text variant="caption">Last updated {LAST_UPDATED}</Text>

      <Body>
        Welcome to Pawly. By downloading or using this app, you agree to be bound by these terms of service ("Terms").
        Please read them carefully before using Pawly. If you do not agree to these Terms, do not use the app.
      </Body>

      <Section title="1. Acceptance of terms">
        <Body>
          By creating an account or using any feature of Pawly, you confirm that you are at least 13 years old, have the
          legal capacity to enter into these Terms and agree to comply with them. If you use Pawly on behalf of an
          organization, you represent that you have authority to bind that organization to these Terms.
        </Body>
      </Section>

      <Section title="2. Description of service">
        <Body>
          Pawly is a dog training app that provides personalized plans, a coach, progress tracking and guides. It is
          designed to help dog owners train their dogs. Pawly does not replace professional veterinary care or certified
          dog training services.
        </Body>
      </Section>

      <Section title="3. Not professional advice">
        <Body>
          The plans, coach responses and content in Pawly are for informational and educational purposes only. They do
          not constitute professional veterinary, behavioral or certified dog training advice.
        </Body>
        <Body>
          Dogs with aggression, severe anxiety or complex behavioral issues should be evaluated by a licensed
          veterinarian or certified professional dog trainer. Pawly is not liable for any injury, harm or damage to you,
          your dog, third parties or property arising from reliance on app content or training suggestions.
        </Body>
      </Section>

      <Section title="4. User accounts">
        <Body>
          You are responsible for keeping your account credentials confidential and for all activity under your account.
          You agree to:
        </Body>
        <Bullet>Provide accurate and complete registration information.</Bullet>
        <Bullet>Keep your password secure and tell us immediately about unauthorized access.</Bullet>
        <Bullet>Not share your account with others or create accounts on behalf of third parties.</Bullet>
        <Body>
          We may suspend or terminate accounts that violate these Terms or that we reasonably believe have been
          compromised.
        </Body>
      </Section>

      <Section title="5. User content">
        <Body>
          You may upload photos, videos and other content ("User Content") to Pawly. By uploading content, you grant
          Pawly a non-exclusive, royalty-free, worldwide license to store and display that content solely to provide the
          service to you.
        </Body>
        <Body>You agree not to upload content that:</Body>
        <Bullet>Depicts animal abuse, cruelty or illegal activity.</Bullet>
        <Bullet>Contains personal information of third parties without their consent.</Bullet>
        <Bullet>Infringes third-party intellectual property rights.</Bullet>
        <Bullet>Is obscene, defamatory or otherwise objectionable.</Bullet>
        <Body>We may remove content that violates these Terms without prior notice.</Body>
      </Section>

      <Section title="6. Acceptable use">
        <Body>You agree to use Pawly only for lawful purposes, and you will not:</Body>
        <Bullet>Attempt to reverse-engineer, decompile or disassemble any part of the app.</Bullet>
        <Bullet>Use automated tools to scrape, crawl or extract data from the app.</Bullet>
        <Bullet>Circumvent security or authentication measures.</Bullet>
        <Bullet>Transmit malware, spam or any harmful code.</Bullet>
        <Bullet>Use the app in any way that could damage, disable or impair the service.</Bullet>
      </Section>

      <Section title="7. Intellectual property">
        <Body>
          All content, design, code, logos and materials in Pawly, other than User Content, are owned by or licensed to
          Pawly and protected by intellectual property laws. You may not copy, reproduce, distribute or create derivative
          works from Pawly's content without our express written permission.
        </Body>
      </Section>

      <Section title="8. Subscriptions and payments">
        <Body>
          Certain features of Pawly may require a paid subscription. Subscription terms, pricing and billing cycles are
          shown to you before purchase. All payments are processed through the Apple App Store or Google Play and are
          subject to their terms. Subscriptions renew automatically unless cancelled at least 24 hours before the end of
          the current period. We do not offer refunds except as required by applicable law or platform policies.
        </Body>
      </Section>

      <Section title="9. Termination">
        <Body>
          You can delete your account at any time from Profile, under Account, by choosing Delete account. We may
          suspend or terminate your account at any time for violations of these Terms, without notice and without
          liability to you.
        </Body>
        <Body>
          On termination, your right to use the app ends immediately. Sections that by their nature should survive
          (Not professional advice, Limitation of liability, Governing law) survive termination.
        </Body>
      </Section>

      <Section title="10. Limitation of liability">
        <Body>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, PAWLY AND ITS AFFILIATES, OFFICERS, EMPLOYEES AND AGENTS SHALL NOT BE
          LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OR
          INABILITY TO USE THE APP, INCLUDING ANY INJURY OR DAMAGE TO YOU, YOUR DOG OR THIRD PARTIES.
        </Body>
        <Body>
          IN JURISDICTIONS THAT DO NOT ALLOW EXCLUSION OF CERTAIN WARRANTIES OR LIMITATION OF LIABILITY, OUR LIABILITY IS
          LIMITED TO THE FULLEST EXTENT PERMITTED BY LAW.
        </Body>
      </Section>

      <Section title="11. Disclaimer of warranties">
        <Body>
          PAWLY IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED,
          INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE OR
          NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, ERROR-FREE OR FREE OF VIRUSES OR OTHER
          HARMFUL COMPONENTS.
        </Body>
      </Section>

      <Section title="12. Governing law">
        <Body>
          These Terms are governed by the laws of the State of California, United States, without regard to its conflict
          of law provisions. Any dispute arising under these Terms is subject to the exclusive jurisdiction of the courts
          located in California.
        </Body>
      </Section>

      <Section title="13. Changes to these terms">
        <Body>
          We may update these Terms from time to time. We notify you of material changes by showing a notice in the app
          and updating the date above. Continued use of the app after changes means you accept the revised Terms.
        </Body>
      </Section>

      <Section title="14. Contact">
        <Body>If you have questions about these Terms, email Pawly support.</Body>
        <SupportEmail />
      </Section>
    </ScrollView>
  );
}
