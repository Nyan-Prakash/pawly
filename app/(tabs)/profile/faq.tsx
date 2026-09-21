import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { ListGroup } from '@/components/ui/ListRow';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { MAX_ACTIVE_COURSES } from '@/lib/addCourseUtils';
import { FREE_LIMITS, PRO_PROGRESS_WEEKS } from '@/lib/subscription';

interface Faq {
  question: string;
  /** One string per paragraph. */
  answer: string[];
}

interface FaqSection {
  title: string;
  items: Faq[];
}

const SECTIONS: FaqSection[] = [
  {
    title: 'Pawly Pro and billing',
    items: [
      {
        question: 'What do I get for free, and what needs Pro?',
        answer: [
          `Free includes your plan, ${FREE_LIMITS.sessions} completed sessions across all courses, ${FREE_LIMITS.coachMessagesPerDay} coach messages a day and the last ${FREE_LIMITS.progressWeeks} weeks on Progress. Sessions you have already completed stay open, so you can repeat them as often as you like.`,
          `Pro opens every session in every course, removes the daily coach limit and shows ${PRO_PROGRESS_WEEKS} weeks of progress history.`,
        ],
      },
      {
        question: 'How does the free trial work?',
        answer: [
          'If a free trial is offered, the Pawly Pro screen says how long it lasts before you confirm. You are not charged during the trial.',
          'When the trial ends it becomes a paid subscription at the price shown, unless you cancel at least 24 hours before it ends. You can cancel on day one and still use the rest of the trial.',
        ],
      },
      {
        question: 'How do I cancel or change my subscription?',
        answer: [
          'Apple bills Pawly Pro, so you manage it with Apple. Open the App Store, tap your picture at the top, then Subscriptions, then Pawly. You can also get there from Profile, under Manage subscription.',
          'Cancel at least 24 hours before the renewal date to avoid the next charge. Pro stays on until the end of the period you paid for. Deleting the app or your account does not cancel the subscription.',
        ],
      },
      {
        question: 'I paid, but the app still says free',
        answer: [
          'Open Pawly Pro from Profile and choose Restore purchases. Make sure you are logged in to the same Pawly account, and that the App Store is using the Apple Account you bought with.',
          'If that does not fix it, email support from Contact support and include the date of the purchase.',
        ],
      },
      {
        question: 'Can I get a refund?',
        answer: [
          'Apple handles all payments and refunds. Request one at reportaproblem.apple.com. We cannot issue refunds ourselves because we never receive your payment details.',
        ],
      },
    ],
  },
  {
    title: 'Plans and training',
    items: [
      {
        question: 'How does my plan adapt?',
        answer: [
          'After each session you tell us how it went: which steps worked, which did not, and a short reflection. Pawly uses that, along with skipped or unfinished sessions, to decide what comes next.',
          'If something is going well the plan moves on. If a step keeps being hard, the plan slows down, repeats it or goes back to an easier version. When a session changes, the plan view marks it and explains why, and you can ask the coach about it.',
        ],
      },
      {
        question: 'How many courses can I train at once?',
        answer: [
          `Up to ${MAX_ACTIVE_COURSES} active courses. Short, frequent sessions on one or two goals work better than spreading a dog across many. Finish a course to make room for another.`,
        ],
      },
      {
        question: 'Can I add a second dog?',
        answer: [
          'Not yet. Pawly supports one dog per account for now. Plans, the coach and progress are all built around that one dog, so sharing a profile between two dogs will give worse plans for both.',
        ],
      },
      {
        question: 'Reminders are not arriving',
        answer: [
          'Check Profile, then Notifications. Permission should say Allowed, and Session reminders should be on. If permission says Not allowed, turn notifications on for Pawly in your iPhone Settings.',
          'A Focus mode such as Do Not Disturb or Sleep silences reminders. Reminders are scheduled on your phone, so they follow the reminder time and the training days in your plan.',
        ],
      },
    ],
  },
  {
    title: 'The live coach and your privacy',
    items: [
      {
        question: 'What does the camera see, and where does it go?',
        answer: [
          'While a live coach session is running, Pawly takes still frames from the camera every second or two and sends them to our AI provider, OpenAI, to count reps and give feedback. No audio is recorded.',
          'Pawly does not save the frames. Only a short summary, such as how many times the live coach responded, is kept with your session log. The camera is off as soon as you leave the live coach.',
          'Frames include whatever is in view. Point the camera at your dog and keep other people out of frame where you can.',
        ],
      },
      {
        question: 'Do I have to use the camera?',
        answer: [
          'No. Choose Train manually when you start a session, or switch to manual at any point. Every course works without the camera.',
        ],
      },
      {
        question: 'How accurate are the coach and the live coach?',
        answer: [
          'Both are AI and can make mistakes. The live coach can miscount or misread what it sees, especially in low light or when your dog is partly out of frame. You can count a rep yourself at any time, or switch to manual.',
          'If a coach answer looks wrong or unsafe, tap Report under it so we can review it.',
        ],
      },
    ],
  },
  {
    title: 'Safety and your account',
    items: [
      {
        question: 'When should I see a professional instead?',
        answer: [
          'Get hands-on help if your dog has bitten or tried to bite a person or another dog, if anyone has been injured, or if your dog panics when left alone to the point of hurting themselves or breaking out.',
          'A sudden change in behavior is often pain or illness, so see your vet first. For bite risk or severe anxiety, work with a certified behaviorist or a veterinary behaviorist. In an emergency, call your vet. Pawly is not a substitute for any of them.',
        ],
      },
      {
        question: 'How do I delete my account?',
        answer: [
          'Open Profile and choose Delete account. This permanently deletes your account, your dog, plans, sessions, walks, coach conversations and avatar. It cannot be undone.',
          'Deleting your account does not cancel Pawly Pro. Cancel it with Apple first, or you will keep being charged.',
        ],
      },
    ],
  },
];

function FaqRow({ item, expanded, onToggle }: { item: Faq; expanded: boolean; onToggle: () => void }) {
  return (
    <View>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={item.question}
        accessibilityState={{ expanded }}
        accessibilityHint={expanded ? 'Hides the answer' : 'Shows the answer'}
        style={({ pressed }) => ({
          minHeight: 52,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Text variant="bodyStrong" style={{ flex: 1 }}>
          {item.question}
        </Text>
        <AppIcon name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.text.secondary} />
      </Pressable>
      {expanded ? (
        <View
          style={{ gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}
          accessibilityLiveRegion="polite"
        >
          {item.answer.map((paragraph) => (
            <Text key={paragraph} variant="body" selectable>
              {paragraph}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function FaqScreen() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
      {SECTIONS.map((section) => (
        <View key={section.title}>
          <SectionHeader title={section.title} />
          <ListGroup>
            {section.items.map((item) => (
              <FaqRow
                key={item.question}
                item={item}
                expanded={open === item.question}
                onToggle={() => setOpen((current) => (current === item.question ? null : item.question))}
              />
            ))}
          </ListGroup>
        </View>
      ))}

      <View style={{ gap: spacing.sm }}>
        <Text variant="body">Didn't find the answer?</Text>
        <Button
          label="Contact support"
          variant="secondary"
          icon="mail-outline"
          onPress={() => router.push('/(tabs)/profile/support' as never)}
        />
      </View>
    </ScrollView>
  );
}
