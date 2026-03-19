import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { IconButton } from '@/components/ui/IconButton';
import { TrainingToolCard } from '@/components/training/TrainingToolCard';
import { useTrainingToolAudio } from '@/hooks/useTrainingToolAudio';
import { spacing } from '@/constants/spacing';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';

const CLICKER_GRADIENT = ['#F0FDF4', '#DCFCE7', '#F0FDF4'] as const;
const WHISTLE_GRADIENT = ['#FFFBEB', '#FEF3C7', '#FFFBEB'] as const;

const TIPS = [
  {
    icon: 'checkmark-circle-outline' as const,
    text: 'Click the instant your dog does the right thing — timing is everything.',
  },
  {
    icon: 'musical-notes-outline' as const,
    text: 'Short whistle = attention. Long whistle = recall from a distance.',
  },
  {
    icon: 'star-outline' as const,
    text: 'Always follow a click or whistle with a treat reward.',
  },
];

export default function TrainingToolsScreen() {
  const { isReady, error, playClicker, playWhistle, stopWhistle } = useTrainingToolAudio();

  return (
    <LinearGradient
      colors={colors.gradient.app}
      style={styles.root}
    >
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <IconButton
            icon={<AppIcon name="chevron-back" size={22} color={colors.text.primary} />}
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          />
          <View style={styles.headerCenter}>
            <Text variant="h2">Training Tools</Text>
            <View style={styles.headerBadge}>
              <AppIcon name="volume-high-outline" size={11} color={colors.brand.primary} />
              <Text variant="micro" color={colors.brand.primary} style={styles.headerBadgeText}>
                Sound + Haptic
              </Text>
            </View>
          </View>
          {/* spacer to balance back button */}
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Error banner ── */}
          {error && (
            <View style={styles.errorBanner}>
              <AppIcon name="alert-circle-outline" size={16} color={colors.error} />
              <Text variant="caption" color={colors.error} style={{ flex: 1 }}>{error}</Text>
            </View>
          )}

          {/* ── Loading state ── */}
          {!isReady && !error && (
            <View style={styles.loadingRow}>
              <AppIcon name="sync-outline" size={14} color={colors.text.secondary} />
              <Text variant="micro" color={colors.text.secondary}>Loading audio…</Text>
            </View>
          )}

          {/* ── Cards ── */}
          <View style={styles.cards}>
            <TrainingToolCard
              title="Clicker"
              subtitle="Mark the exact moment of good behavior"
              hint="Press + hold"
              icon="radio-button-on"
              onPressIn={playClicker}
              disabled={!isReady}
              accentColor={colors.brand.primary}
              gradientColors={CLICKER_GRADIENT}
            />

            <TrainingToolCard
              title="Whistle"
              subtitle="Distance commands and recall"
              hint="Tap · Long-press"
              icon="musical-notes"
              onPressIn={() => playWhistle(false)}
              onLongPress={() => playWhistle(true)}
              onPressOut={stopWhistle}
              disabled={!isReady}
              accentColor={colors.brand.secondary}
              gradientColors={WHISTLE_GRADIENT}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  backButton: {
    marginLeft: -spacing.xs,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.brand.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  headerBadgeText: {
    letterSpacing: 0.3,
  },
  headerSpacer: {
    width: 36,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.status.dangerBg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.status.dangerBorder,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  cards: {
    gap: spacing.md,
  },
  tipsPanel: {
    backgroundColor: colors.bg.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.soft,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  tipsPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  tipsPanelTitle: {
    fontSize: 15,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  tipIconWrap: {
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    lineHeight: 20,
  },
});
