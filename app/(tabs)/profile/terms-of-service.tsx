import { ScrollView, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import { AppIcon } from '@/components/ui/AppIcon';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';

// ─── Last updated date ────────────────────────────────────────────────────────
const LAST_UPDATED = 'April 16, 2025';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
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
    <Text style={{ fontSize: 14, lineHeight: 22, color: colors.text.secondary }}>
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

export default function TermsOfServiceScreen() {
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
          Terms of Service
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
          Welcome to Pawly. By downloading or using this app, you agree to be bound by these Terms
          of Service ("Terms"). Please read them carefully before using Pawly. If you do not agree
          to these Terms, do not use the app.
        </Body>

        <Section title="1. Acceptance of Terms">
          <Body>
            By creating an account or using any feature of Pawly, you confirm that you are at least
            13 years of age, have the legal capacity to enter into these Terms, and agree to comply
            with them. If you are using Pawly on behalf of an organization, you represent that you
            have authority to bind that organization to these Terms.
          </Body>
        </Section>

        <Section title="2. Description of Service">
          <Body>
            Pawly is a dog training app that provides personalized training plans, AI-powered
            coaching, progress tracking, and educational content. The service is designed to assist
            dog owners in training their pets. Pawly does not replace professional veterinary care
            or certified dog training services.
          </Body>
        </Section>

        <Section title="3. Important Disclaimer — Not Professional Advice">
          <Body>
            The training plans, AI coaching responses, and content provided in Pawly are for
            informational and educational purposes only. They do not constitute professional
            veterinary, behavioral, or certified dog training advice.
          </Body>
          <Body>
            Dogs with aggression, severe anxiety, or complex behavioral issues should be evaluated
            by a licensed veterinarian or certified professional dog trainer. Pawly is not liable
            for any injury, harm, or damage to you, your dog, third parties, or property arising
            from reliance on app content or training suggestions.
          </Body>
        </Section>

        <Section title="4. User Accounts">
          <Body>
            You are responsible for maintaining the confidentiality of your account credentials and
            for all activity that occurs under your account. You agree to:
          </Body>
          <Bullet>Provide accurate and complete registration information.</Bullet>
          <Bullet>Keep your password secure and notify us immediately of unauthorized access.</Bullet>
          <Bullet>Not share your account with others or create accounts on behalf of third parties.</Bullet>
          <Body>
            We reserve the right to suspend or terminate accounts that violate these Terms or that
            we reasonably believe have been compromised.
          </Body>
        </Section>

        <Section title="5. User Content">
          <Body>
            You may upload photos, videos, and other content ("User Content") to Pawly. By
            uploading content, you grant Pawly a non-exclusive, royalty-free, worldwide license to
            store and display that content solely for the purpose of providing the service to you.
          </Body>
          <Body>You agree not to upload content that:</Body>
          <Bullet>Depicts animal abuse, cruelty, or illegal activity.</Bullet>
          <Bullet>Contains personal information of third parties without their consent.</Bullet>
          <Bullet>Infringes third-party intellectual property rights.</Bullet>
          <Bullet>Is obscene, defamatory, or otherwise objectionable.</Bullet>
          <Body>
            We reserve the right to remove content that violates these Terms without prior notice.
          </Body>
        </Section>

        <Section title="6. Acceptable Use">
          <Body>You agree to use Pawly only for lawful purposes and you will not:</Body>
          <Bullet>Attempt to reverse-engineer, decompile, or disassemble any part of the app.</Bullet>
          <Bullet>Use automated tools to scrape, crawl, or extract data from the app.</Bullet>
          <Bullet>Circumvent security or authentication measures.</Bullet>
          <Bullet>Transmit malware, spam, or any harmful code.</Bullet>
          <Bullet>Use the app in any way that could damage, disable, or impair the service.</Bullet>
        </Section>

        <Section title="7. Intellectual Property">
          <Body>
            All content, design, code, logos, and materials in Pawly — other than User Content —
            are owned by or licensed to Pawly and are protected by intellectual property laws. You
            may not copy, reproduce, distribute, or create derivative works from Pawly's content
            without our express written permission.
          </Body>
        </Section>

        <Section title="8. Subscriptions and Payments">
          <Body>
            Certain features of Pawly may require a paid subscription. Subscription terms, pricing,
            and billing cycles will be presented to you before purchase. All payments are processed
            through Apple App Store or Google Play and are subject to their respective terms.
            Subscriptions automatically renew unless cancelled at least 24 hours before the end of
            the current period. We do not offer refunds except as required by applicable law or
            platform policies.
          </Body>
        </Section>

        <Section title="9. Termination">
          <Body>
            You may delete your account at any time through Settings {'>'} Account {'>'} Delete
            Account. We reserve the right to suspend or terminate your account at any time for
            violations of these Terms, without notice, and without liability to you.
          </Body>
          <Body>
            Upon termination, your right to use the app ceases immediately. Sections that by their
            nature should survive (Disclaimer, Limitation of Liability, Governing Law) will survive
            termination.
          </Body>
        </Section>

        <Section title="10. Limitation of Liability">
          <Body>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, PAWLY AND ITS AFFILIATES, OFFICERS, EMPLOYEES,
            AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
            PUNITIVE DAMAGES ARISING FROM YOUR USE OF OR INABILITY TO USE THE APP, INCLUDING ANY
            INJURY OR DAMAGE TO YOU, YOUR DOG, OR THIRD PARTIES.
          </Body>
          <Body>
            IN JURISDICTIONS THAT DO NOT ALLOW EXCLUSION OF CERTAIN WARRANTIES OR LIMITATION OF
            LIABILITY, OUR LIABILITY IS LIMITED TO THE FULLEST EXTENT PERMITTED BY LAW.
          </Body>
        </Section>

        <Section title="11. Disclaimer of Warranties">
          <Body>
            PAWLY IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER
            EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS
            FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE APP WILL BE
            UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
          </Body>
        </Section>

        <Section title="12. Governing Law">
          <Body>
            These Terms are governed by the laws of the State of California, United States, without
            regard to its conflict of law provisions. Any dispute arising under these Terms shall be
            subject to the exclusive jurisdiction of the courts located in California.
          </Body>
        </Section>

        <Section title="13. Changes to These Terms">
          <Body>
            We may update these Terms from time to time. We will notify you of material changes by
            displaying a notice in the app and updating the "Last updated" date above. Continued use
            of the app after changes constitutes acceptance of the revised Terms.
          </Body>
        </Section>

        <Section title="14. Contact">
          <Body>
            If you have questions about these Terms, please contact us at:
          </Body>
          <Body>Pawly Support{'\n'}Email: support@pawly.app</Body>
        </Section>
      </ScrollView>
    </SafeScreen>
  );
}
