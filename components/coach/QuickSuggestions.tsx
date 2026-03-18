import { ScrollView, Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { spacing } from '@/constants/spacing';
import { useTheme } from '@/lib/theme';

interface QuickSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function QuickSuggestions({ suggestions, onSelect }: QuickSuggestionsProps) {
  const { isDark } = useTheme();
  const styles = createStyles(isDark);

  if (suggestions.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {suggestions.map((suggestion, i) => (
        <Pressable
          key={i}
          style={({ pressed }) => [styles.chipOuter, pressed && styles.chipOuterPressed]}
          onPress={() => onSelect(suggestion)}
        >
          <View style={styles.cardInner}>
            <RNText numberOfLines={3} style={styles.chipText}>
              {suggestion}
            </RNText>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function createStyles(isDark: boolean) {
  return StyleSheet.create({
    scroll: {
      flexGrow: 0,
      height: 108,
    },
    container: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.lg,
      gap: 12,
    },
    chipOuter: {
      width: 220,
      minHeight: 90,
      borderRadius: 22,
      shadowColor: isDark ? '#020617' : '#94A3B8',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.5 : 0.14,
      shadowRadius: 16,
      elevation: 5,
    },
    chipOuterPressed: {
      transform: [{ scale: 0.97 }],
      opacity: 0.88,
    },
    cardInner: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: isDark ? '#1A2436' : '#FFFFFF',
      borderRadius: 22,
      borderWidth: 1.5,
      borderColor: isDark ? '#243042' : '#E5E7EB',
      paddingTop: spacing.sm + 4,
      paddingBottom: spacing.sm + 4,
      paddingHorizontal: spacing.md,
    },
    iconBadge: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(74,222,128,0.15)' : 'rgba(22,163,74,0.1)',
    },
    chipEyebrow: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: isDark ? '#4ADE80' : '#16A34A',
    },
    chipText: {
      fontSize: 15,
      lineHeight: 21,
      color: isDark ? '#F1F5F9' : '#111827',
      fontWeight: '600',
    },
  });
}
