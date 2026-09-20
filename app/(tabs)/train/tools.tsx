import { ScrollView } from 'react-native';

import { TrainingToolCard } from '@/components/training/TrainingToolCard';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useTrainingToolAudio } from '@/hooks/useTrainingToolAudio';
import { haptics } from '@/lib/haptics';

export default function TrainingToolsScreen() {
  const { isReady, error, playClicker, playWhistle, stopWhistle } = useTrainingToolAudio();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
    >
      {error ? (
        <Text variant="body" color={colors.status.danger} accessibilityRole="alert" accessibilityLiveRegion="polite">
          Couldn't load the sounds. Check the volume switch and reopen this screen.
        </Text>
      ) : null}

      {!isReady && !error ? (
        <Text variant="caption" accessibilityLiveRegion="polite">
          Loading sounds
        </Text>
      ) : null}

      <TrainingToolCard
        title="Clicker"
        subtitle="Marks the exact moment your dog does the right thing."
        actionLabel="Play clicker"
        icon="radio-button-on"
        onPressIn={() => {
          haptics.impact();
          playClicker();
        }}
        disabled={!isReady}
      />

      <TrainingToolCard
        title="Whistle"
        subtitle="Recall and attention at a distance."
        actionLabel="Blow whistle"
        hint="Hold the button for a long whistle."
        icon="musical-notes"
        onPressIn={() => {
          haptics.impact();
          playWhistle(false);
        }}
        onLongPress={() => playWhistle(true)}
        onPressOut={stopWhistle}
        disabled={!isReady}
      />
    </ScrollView>
  );
}
