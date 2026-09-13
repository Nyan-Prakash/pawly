import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
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
      <View style={{ alignItems: 'flex-end', marginBottom: spacing.md }} accessibilityLabel={`You: ${message.content}`}>
        <View
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
    <View style={{ alignItems: 'flex-start', marginBottom: spacing.md }} accessibilityLabel={`Coach: ${message.content}`}>
      <View
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
    </View>
  );
}
