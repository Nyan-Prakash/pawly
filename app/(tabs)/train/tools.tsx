import { View, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { IconButton } from '@/components/ui/IconButton';
import { TrainingToolCard } from '@/components/training/TrainingToolCard';
import { useTrainingToolAudio } from '@/hooks/useTrainingToolAudio';
import { spacing } from '@/constants/spacing';
import { colors } from '@/constants/colors';

export default function TrainingToolsScreen() {
  const { isReady, error, playClicker, playWhistle, stopWhistle } = useTrainingToolAudio();

  return (
    <SafeScreen>
      <View style={styles.header}>
        <IconButton
          icon="chevron-back"
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <View style={styles.headerText}>
          <Text variant="h2">Training Tools</Text>
          <Text variant="caption" color={colors.text.secondary}>
            Quick sound tools for real-time training
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {error && (
          <View style={styles.errorContainer}>
            <Text variant="body" color={colors.status.error}>
              {error}
            </Text>
          </View>
        )}

        <View style={styles.toolsList}>
          <TrainingToolCard
            title="Clicker"
            subtitle="Immediate feedback for your dog"
            icon="radio-button-on"
            onPressIn={playClicker}
            disabled={!isReady}
            accentColor={colors.brand.primary}
          />

          <TrainingToolCard
            title="Whistle"
            subtitle="Tap for short, hold for long"
            icon="musical-notes"
            onPressIn={() => playWhistle(false)}
            onLongPress={() => playWhistle(true)}
            onPressOut={stopWhistle}
            disabled={!isReady}
            accentColor={colors.brand.secondary}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text variant="micro" color={colors.text.secondary} style={styles.infoText}>
            Clicker: Use the "yes" marker sound to pinpoint the exact moment your dog performs the desired behavior.
          </Text>
          <Text variant="micro" color={colors.text.secondary} style={styles.infoText}>
            Whistle: Use distinct whistle patterns for distance commands or recall reinforcement.
          </Text>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  backButton: {
    marginLeft: -spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  toolsList: {
    gap: spacing.md,
  },
  errorContainer: {
    padding: spacing.md,
    backgroundColor: colors.status.errorBg,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  infoContainer: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  infoText: {
    lineHeight: 18,
  },
});
