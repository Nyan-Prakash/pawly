import { View, StyleSheet } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import type { ChatMessage } from '@/types';

import { FormattedCoachMessage } from './FormattedCoachMessage';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const styles = createStyles();

  if (isUser) {
    return (
      <View style={styles.userWrap}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.assistantWrap}>
      <View style={styles.assistantRow}>
        <View style={styles.avatar}>
          <Ionicons name="paw" size={20} color={colors.brand.primary} />
        </View>

        <View style={styles.assistantContent}>
          <Text variant="micro" color={colors.text.secondary} style={styles.roleLabel}>
            Pawly Coach
          </Text>
          <View style={styles.assistantBubble}>
            <FormattedCoachMessage message={message.content} />
          </View>
        </View>
      </View>
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
    userWrap: {
      alignItems: 'flex-end',
      marginBottom: spacing.md,
    },
    userBubble: {
      maxWidth: '82%',
      backgroundColor: colors.brand.primary,
      borderRadius: 24,
      borderBottomRightRadius: 8,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      shadowColor: colors.shadow.success,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 14,
      elevation: 6,
    },
    userText: {
      color: '#FFFFFF',
      fontSize: 15,
      lineHeight: 22,
    },
    assistantWrap: {
      marginBottom: spacing.md,
    },
    assistantRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.status.successBg,
      borderWidth: 1,
      borderColor: colors.status.successBorder,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    assistantContent: {
      flex: 1,
    },
    roleLabel: {
      marginBottom: 6,
      marginLeft: spacing.xs,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    assistantBubble: {
      borderRadius: 26,
      borderTopLeftRadius: 10,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: colors.bg.elevated,
      borderWidth: 1,
      borderColor: colors.border.soft,
    },
    assistantText: {
      color: colors.text.primary,
      fontSize: 15,
      lineHeight: 22,
    },
  });
}
