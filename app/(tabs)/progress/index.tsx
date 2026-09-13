import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Share, View } from 'react-native';
import { router } from 'expo-router';

import { LearningInsightCard } from '@/components/adaptive/LearningInsightCard';
import type { AppIconName } from '@/components/ui/AppIcon';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { MascotCallout } from '@/components/ui/MascotCallout';
import { Tag } from '@/components/ui/PillTag';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { haptics } from '@/lib/haptics';
import { MILESTONE_DEFINITIONS } from '@/lib/milestoneEngine';
import { useAuthStore } from '@/stores/authStore';
import { useDogStore } from '@/stores/dogStore';
import { useProgressStore } from '@/stores/progressStore';
import type { BehaviorScore, Milestone, MilestoneDefinition } from '@/types';

const CHART_HEIGHT = 120;

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton (mirrors the loaded layout)
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonGroup({ rows }: { rows: number }) {
  return (
    <View style={{ backgroundColor: colors.bg.surface, borderRadius: radii.md, overflow: 'hidden' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <View
          key={i}
          style={{
            minHeight: 52,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.lg,
            borderTopWidth: i === 0 ? 0 : 1,
            borderTopColor: colors.border.hairline,
          }}
        >
          <SkeletonBlock height={16} width="45%" />
          <SkeletonBlock height={16} width={40} />
        </View>
      ))}
    </View>
  );
}

function ProgressSkeleton() {
  return (
    <>
      <View>
        <SkeletonBlock height={26} width="35%" style={{ marginBottom: spacing.sm }} />
        <SkeletonGroup rows={4} />
      </View>
      <View>
        <SkeletonBlock height={26} width="55%" style={{ marginBottom: spacing.sm }} />
        <SkeletonBlock height={CHART_HEIGHT + spacing.lg * 2 + spacing.xl} borderRadius={radii.md} />
      </View>
      <View>
        <SkeletonBlock height={26} width="35%" style={{ marginBottom: spacing.sm }} />
        <SkeletonGroup rows={3} />
      </View>
      <View>
        <SkeletonBlock height={26} width="35%" style={{ marginBottom: spacing.sm }} />
        <SkeletonGroup rows={3} />
      </View>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bar chart (plain Views on tokens)
// ─────────────────────────────────────────────────────────────────────────────

type Bar = { key: string; label: string; value: number; description: string };

function BarChart({ bars, max, showEveryLabel }: { bars: Bar[]; max: number; showEveryLabel: boolean }) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const selected = bars.find((b) => b.key === selectedKey) ?? null;
  const safeMax = Math.max(max, 1);

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: CHART_HEIGHT, gap: spacing.xs }}>
        {bars.map((bar) => {
          const isSelected = bar.key === selectedKey;
          const barHeight = bar.value > 0 ? Math.max((bar.value / safeMax) * CHART_HEIGHT, spacing.xs) : spacing.xs;
          return (
            <Pressable
              key={bar.key}
              accessibilityRole="button"
              accessibilityLabel={bar.description}
              accessibilityState={{ selected: isSelected }}
              onPress={() => setSelectedKey(isSelected ? null : bar.key)}
              style={{ flex: 1, maxWidth: spacing.xxxl, height: CHART_HEIGHT, justifyContent: 'flex-end', minWidth: spacing.sm }}
            >
              <View
                style={{
                  height: barHeight,
                  borderRadius: radii.sm,
                  backgroundColor: bar.value > 0 ? colors.accent : colors.bg.fill,
                  opacity: selectedKey && !isSelected ? 0.5 : 1,
                }}
              />
            </Pressable>
          );
        })}
      </View>
      {showEveryLabel ? (
        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
          {bars.map((bar) => (
            <Text key={bar.key} variant="caption" numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>
              {bar.label}
            </Text>
          ))}
        </View>
      ) : (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="caption">{bars[0]?.label}</Text>
          <Text variant="caption">{bars[bars.length - 1]?.label}</Text>
        </View>
      )}
      <Text variant="caption" accessibilityLiveRegion="polite">
        {selected ? selected.description : bars[bars.length - 1]?.description ?? ''}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Behaviors
// ─────────────────────────────────────────────────────────────────────────────

const BEHAVIOR_LABELS: Record<string, string> = {
  loose_leash_walking: 'Leash walking',
  recall: 'Recall',
  impulse_control: 'Impulse control',
  positions: 'Sit, down and stay',
  door_manners: 'Door manners',
  focus: 'Focus and attention',
  puppy_biting: 'Puppy biting',
  settling: 'Settling',
  socialization: 'Socialization',
  crate_training: 'Crate training',
  separation_anxiety: 'Separation anxiety',
  jumping_up: 'Jumping up',
  barking: 'Barking',
  reactivity: 'Reactivity',
  resource_guarding: 'Resource guarding',
};

function labelForBehavior(behavior: string): string {
  const key = behavior.toLowerCase().replace(/ /g, '_');
  return BEHAVIOR_LABELS[key] ?? key.replace(/_/g, ' ');
}

const TREND: Record<BehaviorScore['trend'], { sentence: string; tag: string; tone: 'accent' | 'neutral' | 'warning' }> = {
  improving: { sentence: 'Improving since last week', tag: 'Improving', tone: 'accent' },
  stable: { sentence: 'Steady since last week', tag: 'Steady', tone: 'neutral' },
  declining: { sentence: 'Needs work since last week', tag: 'Needs work', tone: 'warning' },
};

function BehaviorRow({ score }: { score: BehaviorScore }) {
  const trend = TREND[score.trend];
  return (
    <ListRow
      title={labelForBehavior(score.behavior)}
      subtitle={`${trend.sentence}. Stage ${score.currentStage} of ${score.totalStages}, ${pluralize(score.sessionCount, 'session')}.`}
      trailing={<Tag label={trend.tag} tone={trend.tone} />}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Milestone celebration sheet
// ─────────────────────────────────────────────────────────────────────────────

function MilestoneSheet({
  milestone,
  onClose,
  onShare,
}: {
  milestone: Milestone | null;
  onClose: () => void;
  onShare: () => void;
}) {
  return (
    <BottomSheet visible={milestone !== null} onClose={onClose} title="Milestone reached">
      {milestone ? (
        <View style={{ flex: 1, gap: spacing.xl }}>
          <View style={{ alignItems: 'center', gap: spacing.lg }}>
            <MascotCallout state="celebrating" size={120} />
            <View style={{ alignItems: 'center', gap: spacing.xs }}>
              <Text variant="h2" style={{ textAlign: 'center' }}>
                {milestone.title}
              </Text>
              <Text variant="body" color={colors.text.secondary} style={{ textAlign: 'center' }}>
                {milestone.description}
              </Text>
              <Text variant="caption" style={{ textAlign: 'center' }}>
                Reached {formatLongDate(milestone.achievedAt)}
              </Text>
            </View>
          </View>
          <View style={{ gap: spacing.md }}>
            <Button label="Share milestone" variant="secondary" icon="share-outline" onPress={onShare} />
            <Button label="Close" onPress={onClose} />
          </View>
        </View>
      ) : null}
    </BottomSheet>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function ProgressScreen() {
  const { user } = useAuthStore();
  const { dog, dogLearningState, fetchDogLearningState } = useDogStore();
  const {
    sessionStreak,
    walkStreak,
    longestSessionStreak,
    totalSessionsCompleted,
    sessionsByWeek,
    walkQualityByWeek,
    behaviorScores,
    milestones,
    isLoading,
    fetchProgressData,
    fetchMilestones,
  } = useProgressStore();

  const [refreshing, setRefreshing] = useState(false);
  const [celebrationMilestone, setCelebrationMilestone] = useState<Milestone | null>(null);

  useEffect(() => {
    if (dog?.id && user?.id) {
      fetchProgressData(dog.id, user.id);
      fetchMilestones(dog.id, user.id);
      fetchDogLearningState(dog.id).catch(() => {});
    }
  }, [dog?.id, user?.id, fetchDogLearningState]);

  const onRefresh = useCallback(async () => {
    if (!dog?.id || !user?.id) return;
    setRefreshing(true);
    await Promise.all([
      fetchProgressData(dog.id, user.id),
      fetchMilestones(dog.id, user.id),
      fetchDogLearningState(dog.id),
    ]);
    setRefreshing(false);
  }, [dog?.id, user?.id, fetchDogLearningState]);

  function openCelebration(milestone: Milestone) {
    haptics.success();
    setCelebrationMilestone(milestone);
  }

  async function handleShareMilestone(milestone: Milestone) {
    try {
      await Share.share({
        message: `${milestone.title}. ${milestone.description}\n\nTrained with Pawly`,
      });
    } catch {
      // user cancelled
    }
    setCelebrationMilestone(null);
  }

  const reachedIds = milestones.map((m) => m.milestoneId);
  const recentReached = [...milestones]
    .sort((a, b) => b.achievedAt.localeCompare(a.achievedAt))
    .slice(0, 3);
  const upcoming: MilestoneDefinition[] = MILESTONE_DEFINITIONS.filter((def) => !reachedIds.includes(def.id)).slice(0, 3);

  // Always show the last eight weeks so one session is a bar, not a block.
  const WEEKS_SHOWN = 8;
  const weekBuckets = (() => {
    const byStart = new Map(sessionsByWeek.map((w) => [w.weekStart, w.sessionsCompleted]));
    const latest = sessionsByWeek.length ? new Date(sessionsByWeek[sessionsByWeek.length - 1].weekStart) : new Date();
    return Array.from({ length: WEEKS_SHOWN }, (_, i) => {
      const d = new Date(latest);
      d.setDate(d.getDate() - (WEEKS_SHOWN - 1 - i) * 7);
      const key = d.toISOString().slice(0, 10);
      return { weekStart: key, sessionsCompleted: byStart.get(key) ?? 0 };
    });
  })();
  const sessionBars: Bar[] = weekBuckets.map((week) => ({
    key: week.weekStart,
    label: formatShortDate(week.weekStart),
    value: week.sessionsCompleted,
    description: `Week of ${formatShortDate(week.weekStart)}: ${pluralize(week.sessionsCompleted, 'session')}`,
  }));
  const sessionMax = Math.max(...sessionBars.map((b) => b.value), 1);

  const walkQualityWords = ['Harder', 'Same', 'Better'];
  const walkBars: Bar[] = walkQualityByWeek.map((day) => ({
    key: day.date,
    label: formatShortDate(day.date),
    value: day.quality ?? 0,
    description: day.quality
      ? `${formatShortDate(day.date)}: ${walkQualityWords[day.quality - 1].toLowerCase()} than the walk before`
      : `${formatShortDate(day.date)}: no walk logged`,
  }));
  const hasWalks = walkBars.some((b) => b.value > 0);

  const showSkeleton = isLoading && totalSessionsCompleted === 0;
  const isNewUser = !isLoading && totalSessionsCompleted === 0;

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text.secondary} />
        }
      >
        {showSkeleton ? (
          <ProgressSkeleton />
        ) : isNewUser ? (
          <EmptyState
            mascotState="encouraging"
            title={dog?.name ? `${dog.name}'s progress will show here` : 'Your progress will show here'}
            subtitle="Finish your first session to start tracking streaks, behaviors and milestones."
            action={{ label: 'Start first session', onPress: () => router.push('/(tabs)/train') }}
          />
        ) : (
          <>
            <View>
              <SectionHeader title="Overall" />
              <ListGroup>
                <ListRow title="Sessions completed" trailing={String(totalSessionsCompleted)} />
                <ListRow title="Training streak" trailing={pluralize(sessionStreak, 'day')} />
                <ListRow title="Longest training streak" trailing={pluralize(longestSessionStreak, 'day')} />
                <ListRow title="Walk streak" trailing={pluralize(walkStreak, 'day')} />
              </ListGroup>
            </View>

            <View>
              <SectionHeader title="Sessions by week" />
              <Card>
                {sessionBars.length > 0 ? (
                  <BarChart bars={sessionBars} max={sessionMax} showEveryLabel={false} />
                ) : (
                  <EmptyState
                    icon="stats-chart-outline"
                    title="No sessions yet"
                    subtitle="Finish a session and it will show here."
                    style={{ paddingVertical: spacing.lg }}
                  />
                )}
              </Card>
            </View>

            <View>
              <SectionHeader title="Walk quality" />
              <Card>
                {hasWalks ? (
                  <BarChart bars={walkBars} max={3} showEveryLabel={false} />
                ) : (
                  <EmptyState
                    icon="walk-outline"
                    title="No walks logged yet"
                    subtitle="Log a walk from the Train tab to track how walks are going."
                    style={{ paddingVertical: spacing.lg }}
                  />
                )}
              </Card>
            </View>

            {behaviorScores.length > 0 ? (
              <View>
                <SectionHeader title="Behaviors" />
                <ListGroup>
                  {behaviorScores.map((score) => (
                    <BehaviorRow key={score.behavior} score={score} />
                  ))}
                </ListGroup>
              </View>
            ) : null}

            <LearningInsightCard dogName={dog?.name ?? 'your dog'} learningState={dogLearningState} />

            <View>
              <SectionHeader
                title="Milestones"
                action={{ label: 'See all', onPress: () => router.push('/(tabs)/progress/milestones') }}
              />
              <ListGroup>
                {recentReached.map((m) => (
                  <ListRow
                    key={m.id}
                    icon={m.emoji as AppIconName}
                    title={m.title}
                    subtitle={`Reached ${formatLongDate(m.achievedAt)}`}
                    trailing={<Tag label="Reached" tone="accent" />}
                    onPress={() => openCelebration(m)}
                    accessibilityHint="Opens the milestone"
                  />
                ))}
                {upcoming.map((def) => (
                  <ListRow
                    key={def.id}
                    icon={def.emoji as AppIconName}
                    iconTone="secondary"
                    title={def.title}
                    subtitle={def.description}
                  />
                ))}
              </ListGroup>
            </View>
          </>
        )}
      </ScrollView>

      <MilestoneSheet
        milestone={celebrationMilestone}
        onClose={() => setCelebrationMilestone(null)}
        onShare={() => {
          if (celebrationMilestone) handleShareMilestone(celebrationMilestone);
        }}
      />
    </>
  );
}
