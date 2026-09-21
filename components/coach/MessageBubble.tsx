import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { COACH_REPORT_REASONS, type CoachReportReason } from '@/constants/safety';
import { spacing } from '@/constants/spacing';
import { submitUserFeedback } from '@/lib/feedback';
import type { ChatMessage } from '@/types';

import { FormattedCoachMessage } from './FormattedCoachMessage';

interface MessageBubbleProps {
  message: ChatMessage;
}

/**
 * One chat message. The owner's messages sit on the right on the accent; the
 * coach's sit on the left on the surface. Alignment tells the roles apart, so
 * there is no avatar and no role label.
 */
export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <View style={{ alignItems: 'flex-end', marginBottom: spacing.md }}>
        <View
          accessible
          accessibilityLabel={`You: ${message.content}`}
          style={{
            maxWidth: '82%',
            backgroundColor: colors.accent,
            borderRadius: radii.md,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
          }}
        >
          <Text variant="body" color={colors.text.onAccent} selectable>
            {message.content}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ alignItems: 'flex-start', marginBottom: spacing.md }}>
      {/* The bubble is one element; the Report control under it stays separately focusable. */}
      <View
        accessible
        accessibilityLabel={`Coach: ${spokenCoachText(message.content)}`}
        style={{
          maxWidth: '92%',
          backgroundColor: colors.bg.surface,
          borderRadius: radii.md,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
        }}
      >
        <FormattedCoachMessage message={message.content} />
      </View>
      <ReportAnswer message={message} />
    </View>
  );
}

/**
 * The answer as a screen reader should say it: without the bold markers, list
 * dashes and callout emoji that FormattedCoachMessage turns into layout.
 */
export function spokenCoachText(content: string): string {
  return content
    .replace(/\*\*/g, '')
    .replace(/^\s*[-\u2022]\s+/gm, '')
    .replace(/[\u{1F4A1}\u26A0\uFE0F\u2705\u{1F436}]/gu, '')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

/** Longest slice of the answer stored with a report. */
const REPORT_EXCERPT_CHARS = 4000;

type ReportState = 'idle' | 'sending' | 'sent';

/**
 * The small "Report" control under a coach answer. Confirms with a reason,
 * then stores the report through the existing feedback path (`user_feedback`,
 * source_screen "coach_report").
 */
function ReportAnswer({ message }: { message: ChatMessage }) {
  const [state, setState] = useState<ReportState>('idle');

  async function submit(reason: CoachReportReason) {
    setState('sending');
    try {
      await submitUserFeedback({
        feedback_type: 'general',
        source_screen: 'coach_report',
        message: [
          `Reported coach answer. Reason: ${reason}`,
          `Message id: ${message.id}`,
          `Sent: ${message.createdAt}`,
          '',
          message.content.slice(0, REPORT_EXCERPT_CHARS),
        ].join('\n'),
      });
      setState('sent');
    } catch {
      setState('idle');
      Alert.alert("Couldn't send the report", 'Check your connection and try again.');
    }
  }

  function confirm() {
    Alert.alert(
      'Report this answer?',
      'The answer is sent to Pawly so we can review it. What is wrong with it?',
      [
        ...COACH_REPORT_REASONS.map((reason) => ({ text: reason.label, onPress: () => void submit(reason.key) })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    );
  }

  if (state === 'sent') {
    return (
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingTop: spacing.xs, paddingLeft: spacing.xs }}
        accessible
        accessibilityLiveRegion="polite"
        accessibilityLabel="Reported. We'll review this answer."
      >
        <AppIcon name="checkmark" size={16} color={colors.text.secondary} />
        <Text variant="label">Reported. We'll review this answer.</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={confirm}
      disabled={state === 'sending'}
      hitSlop={{ top: spacing.md, bottom: spacing.md, left: spacing.md, right: spacing.xl }}
      accessibilityRole="button"
      accessibilityLabel={state === 'sending' ? 'Sending report' : 'Report this answer'}
      accessibilityHint="Asks what is wrong, then sends the answer to Pawly for review"
      accessibilityState={{ disabled: state === 'sending', busy: state === 'sending' }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingTop: spacing.xs,
        paddingLeft: spacing.xs,
        opacity: state === 'sending' ? 0.4 : pressed ? 0.6 : 1,
      })}
    >
      <AppIcon name="flag-outline" size={16} color={colors.text.secondary} />
      <Text variant="label">{state === 'sending' ? 'Sending report' : 'Report'}</Text>
    </Pressable>
  );
}
