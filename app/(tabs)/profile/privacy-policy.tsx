import { Linking, Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';

const LAST_UPDATED = 'September 21, 2026';
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
        This privacy policy explains what information Pawly ("we", "us" or "our") collects when you use the Pawly mobile
        app, why we collect it, who processes it for us and the choices you have. If you do not agree with it, please
        stop using the app.
      </Body>

      <Section title="1. Information we collect">
        <Body>Information you give us:</Body>
        <Bullet>Account information: your email address and password, or your Apple ID sign-in if you use Sign in with Apple. Passwords are stored only in hashed form by our authentication provider.</Bullet>
        <Bullet>
          Dog profile: your dog's name, breed, age, sex, neutered status, training goals, training environment and
          schedule preferences.
        </Bullet>
        <Bullet>Training activity: plans and courses, completed sessions, step results, reflections after a session, walk logs, streaks and milestones reached.</Bullet>
        <Bullet>Coach conversations: the messages you send to the coach and the answers it gives.</Bullet>
        <Bullet>A photo of your dog, if you choose to create an avatar. The photo is used to draw the avatar and is not kept by us. The finished avatar, a drawing of your dog, is stored with your dog's profile at a web address that is not listed anywhere but can be opened by anyone who has the link.</Bullet>
        <Bullet>Camera frames, only while you train with the live coach. See section 3.</Bullet>
        <Bullet>Feedback and reports you send us, including a coach answer you choose to report.</Bullet>
        <Body>Information collected automatically:</Body>
        <Bullet>Purchase status: whether you have an active Pawly Pro subscription, the product, and its renewal or expiry dates. We never see your payment card details; Apple handles payment.</Bullet>
        <Bullet>Usage analytics: screens opened and actions taken in the app, tied to your account id, with device type, operating system version, app version, language and time zone. Our analytics provider may derive an approximate region from your IP address. We do not send your email, your name or your dog's details to analytics.</Bullet>
        <Bullet>Crash reports: error details, device model, operating system version, app version and your account id.</Bullet>
        <Bullet>AI usage counts: how many AI requests your account has made, to enforce limits and prevent abuse. For avatar creation before you have an account, we count requests against a one-way hash of your IP address.</Bullet>
        <Body>We do not collect your precise location, your contacts or audio. The app does not record sound.</Body>
      </Section>

      <Section title="2. How we use your information">
        <Body>We use the information we collect to:</Body>
        <Bullet>Create and manage your account and your dog's profile.</Bullet>
        <Bullet>Build a personalized plan and adapt it to your dog's progress.</Bullet>
        <Bullet>Answer your questions through the coach, using your dog's profile and training history as context.</Bullet>
        <Bullet>Give feedback during live coach sessions.</Bullet>
        <Bullet>Track streaks, milestones and progress over time.</Bullet>
        <Bullet>Schedule training reminders on your device, if you allow notifications.</Bullet>
        <Bullet>Provide Pawly Pro and check whether your subscription is active.</Bullet>
        <Bullet>Understand how the app is used, fix crashes and improve features.</Bullet>
        <Bullet>Respond to support requests, feedback and reports.</Bullet>
        <Body>We do not sell your personal information, and we do not use it for advertising.</Body>
      </Section>

      <Section title="3. AI features">
        <Body>
          The coach, plan building, avatar creation and the live coach are powered by AI models provided by OpenAI. To
          make them work, we send OpenAI:
        </Body>
        <Bullet>Coach: the text of your messages, plus your dog's profile and recent training history (plan, sessions, walks and progress) so answers fit your dog.</Bullet>
        <Bullet>Plans: your dog's profile and goals.</Bullet>
        <Bullet>Avatar: the photo of your dog that you choose. We do not keep the photo; we store only the finished avatar.</Bullet>
        <Bullet>
          Live coach: still frames from your camera, taken while a live coach session is running, together with the
          current step, any question you type to the live coach, and your dog's name, breed and age. The frames are analyzed to count reps and give feedback. Pawly
          processes them in memory and does not store them. Only a short summary of the session, such as how many times
          the live coach responded, is saved with your session log. No audio is recorded.
        </Bullet>
        <Body>
          OpenAI processes this data on our behalf under its API terms. Under those terms, data sent through the API is
          not used to train OpenAI's models by default, and OpenAI may keep it for a limited period to monitor for abuse
          before deleting it.
        </Body>
        <Body>
          Camera frames can include whatever is in view, including people and your home. Point the camera at your dog
          and keep other people out of frame where you can. You can always train manually without the camera.
        </Body>
        <Body>
          AI answers can be wrong. They are not veterinary or behavioral-medicine advice. See the terms of service.
        </Body>
      </Section>

      <Section title="4. Service providers">
        <Body>We share information only with the providers that run the app for us. Each one processes it on our behalf:</Body>
        <Bullet>Supabase: authentication, our database and file storage. Supabase hosts your account, dog profile, training data, coach conversations and avatar.</Bullet>
        <Bullet>OpenAI: the AI features described in section 3.</Bullet>
        <Bullet>RevenueCat: subscription status. RevenueCat receives your account id as an app user id, and your purchase and renewal information from Apple. It does not receive your email or name from us.</Bullet>
        <Bullet>PostHog: usage analytics tied to your account id. No email or name.</Bullet>
        <Bullet>Sentry: crash and error reports tied to your account id. No email, name or dog details.</Bullet>
        <Bullet>Apple: Sign in with Apple, if you use it, and in-app purchases through the App Store.</Bullet>
        <Body>We may also disclose information if the law requires it, or to protect the rights, property or safety of Pawly, our users or the public. If Pawly is acquired or merged, your information may transfer as part of that transaction, and we will tell you before it becomes subject to a different privacy policy.</Body>
        <Body>These providers may process data in countries other than the one you live in.</Body>
      </Section>

      <Section title="5. Device permissions">
        <Bullet>Camera: to take a photo of your dog for the avatar, and to run the live coach. The camera is on only while you are taking the photo or a live coach session is running.</Bullet>
        <Bullet>Photos: to choose an existing photo of your dog for the avatar. We access only the photo you pick.</Bullet>
        <Bullet>Notifications: to remind you about sessions, walks, streaks and milestones. Reminders are scheduled on your device.</Bullet>
        <Body>Each permission is optional. You can change them at any time in your device's Settings, and manage reminders in Profile, under Notifications.</Body>
      </Section>

      <Section title="6. Analytics choices">
        <Body>
          You can turn usage analytics off at any time: open Profile and, under Settings, turn off Share usage data.
          When it is off, the app stops sending usage events. Crash reports are still sent so we can fix problems that stop the app from working.
        </Body>
      </Section>

      <Section title="7. Data retention">
        <Body>
          We keep your information for as long as your account exists. When you start a new chat with the coach, the
          current conversation is archived and the one archived before it is deleted. Analytics events and crash reports are kept by those providers for their
          standard retention periods and carry only your account id.
        </Body>
      </Section>

      <Section title="8. Deleting your account">
        <Body>
          You can delete your account in the app at any time: open Profile, then choose Delete account. This permanently
          deletes your account, your dog's profile and avatar, plans, session and walk logs, coach conversations and
          feedback from our database and storage. It cannot be undone.
        </Body>
        <Body>
          Deleting your account does not cancel a subscription, because Apple bills it. Cancel it in your App Store
          account settings. Purchase records kept by Apple and RevenueCat, and analytics or crash records that carry only
          your account id, are not removed automatically. Email us if you want those removed too.
        </Body>
      </Section>

      <Section title="9. Children's privacy">
        <Body>
          Pawly is not directed to children under 13, and we do not knowingly collect personal information from children
          under 13. If we learn that we have, we delete it. If you believe a child has given us personal information,
          contact us at the address below.
        </Body>
      </Section>

      <Section title="10. Security">
        <Body>
          Data is encrypted in transit, access to your data in our database is restricted to your account, and AI
          requests go through our servers so that provider keys never reach your device. No method of transmission or
          storage is fully secure, so we cannot guarantee absolute security.
        </Body>
      </Section>

      <Section title="11. Your rights">
        <Body>Depending on where you live, you may have these rights over your personal information:</Body>
        <Bullet>Access: ask for a copy of the information we hold about you.</Bullet>
        <Bullet>Correction: fix inaccurate information. You can edit your dog's profile in the app.</Bullet>
        <Bullet>Deletion: delete your account and its data in the app, or ask us to do it.</Bullet>
        <Bullet>Portability: ask for a machine-readable export of your information.</Bullet>
        <Bullet>Objection: object to certain processing. You can turn off Share usage data in Profile.</Bullet>
        <Bullet>Complaint: contact your local data protection authority if you think we have handled your information unlawfully.</Bullet>
        <Body>To use any of these rights, email us. We aim to reply within 30 days.</Body>
      </Section>

      <Section title="12. Changes to this policy">
        <Body>
          We may update this policy from time to time. When we make a material change we show the updated policy in the
          app and change the date above. If you keep using the app after a change, the updated policy applies.
        </Body>
      </Section>

      <Section title="13. Contact us">
        <Body>Questions, concerns or requests about this policy or your information: email Pawly support.</Body>
        <SupportEmail />
      </Section>
    </ScrollView>
  );
}
