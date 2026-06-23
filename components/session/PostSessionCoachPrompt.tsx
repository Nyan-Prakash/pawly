import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { hexToRgba } from '@/constants/courseColors';

interface PostSessionCoachPromptProps {
  onPress: () => void;
  accentColor: string;
}

export function PostSessionCoachPrompt({ onPress, accentColor }: PostSessionCoachPromptProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.card, { borderColor: hexToRgba(accentColor, 0.2) }]}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: hexToRgba(accentColor, 0.1) }]}>
            <Ionicons name="sparkles" size={20} color={accentColor} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              That looked challenging — ask the coach about it.
            </Text>
            <Text style={styles.subtitle}>
              Get help understanding what happened and what to try next.
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onPress}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: accentColor, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Text style={styles.ctaText}>Ask the Coach</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: 14,
    minHeight: 48,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
