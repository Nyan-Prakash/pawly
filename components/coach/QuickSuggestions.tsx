import { ScrollView, Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';

interface QuickSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function QuickSuggestions({ suggestions, onSelect }: QuickSuggestionsProps) {
  const styles = createStyles();

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
          style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
          onPress={() => onSelect(suggestion)}
        >
          <Text style={styles.chipText}>{suggestion}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function createStyles() {
  return StyleSheet.create({
    scroll: {
      flexGrow: 0,
    },
    container: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      gap: spacing.xs,
    },
    chip: {
      backgroundColor: colors.bg.surface,
      borderRadius: radii.pill,
      borderWidth: 1.5,
      borderColor: colors.brand.primary,
      paddingVertical: 7,
      paddingHorizontal: spacing.md,
    },
    chipPressed: {
      backgroundColor: colors.status.successBg,
    },
    chipText: {
      fontSize: 13,
      color: colors.brand.primary,
      fontWeight: '600',
    },
  });
}
