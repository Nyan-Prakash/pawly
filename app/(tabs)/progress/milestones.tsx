import { useEffect, useState } from 'react';
import { FlatList, Platform, Share, View } from 'react-native';
import { router } from 'expo-router';

import { MilestoneCard } from '@/components/progress/MilestoneCard';
import { MilestoneShareSheet } from '@/components/progress/MilestoneShareSheet';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { Text } from '@/components/ui/Text';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { captureEvent } from '@/lib/analytics';
import { MILESTONE_DEFINITIONS } from '@/lib/milestoneEngine';
import { useAuthStore } from '@/stores/authStore';
import { useDogStore } from '@/stores/dogStore';
import { useProgressStore } from '@/stores/progressStore';
import type { Milestone, MilestoneDefinition } from '@/types';

type GridItem =
  | { kind: 'reached'; id: string; milestone: Milestone }
  | { kind: 'upcoming'; id: string; definition: MilestoneDefinition };

const CARD_HEIGHT = 132;

function MilestonesSkeleton() {
  return (
    <View style={{ padding: spacing.lg, gap: spacing.xl }}>
      <View style={{ gap: spacing.sm }}>
        <SkeletonBlock height={20} width="40%" />
        <SkeletonBlock height={4} borderRadius={radii.full} />
      </View>
      {[0, 1, 2].map((row) => (
        <View key={row} style={{ flexDirection: 'row', gap: spacing.md }}>
          <SkeletonBlock height={CARD_HEIGHT} borderRadius={radii.md} style={{ flex: 1, maxWidth: '50%' }} />
          <SkeletonBlock height={CARD_HEIGHT} borderRadius={radii.md} style={{ flex: 1, maxWidth: '50%' }} />
        </View>
      ))}
    </View>
  );
}

export default function MilestonesScreen() {
  const { user } = useAuthStore();
  const { dog } = useDogStore();
  const { milestones, fetchMilestones, sessionStreak, totalSessionsCompleted } = useProgressStore();
  const [loading, setLoading] = useState(milestones.length === 0);
  const [sharing, setSharing] = useState<Milestone | null>(null);

  useEffect(() => {
    if (!dog?.id || !user?.id) {
      setLoading(false);
      return;
    }
    let active = true;
    fetchMilestones(dog.id, user.id).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [dog?.id, user?.id]);

  const reachedIds = new Set(milestones.map((m) => m.milestoneId));
  const items: GridItem[] = [
    ...milestones.map((m) => ({ kind: 'reached' as const, id: m.id, milestone: m })),
    ...MILESTONE_DEFINITIONS.filter((def) => !reachedIds.has(def.id)).map((def) => ({
      kind: 'upcoming' as const,
      id: def.id,
      definition: def,
    })),
  ];

  async function shareAsText(milestone: Milestone) {
    try {
      const result = await Share.share({
        message: `${milestone.title}. ${milestone.description}\n\nTrained with Pawly`,
      });
      if (result.action === Share.sharedAction) {
        captureEvent('milestone_shared', { milestoneId: milestone.milestoneId, format: 'text' });
      }
    } catch {
      // cancelled
    }
  }

  function handleShare(milestone: Milestone) {
    // Share.share only takes a file url on iOS; elsewhere the milestone goes out as text.
    if (Platform.OS === 'ios') {
      setSharing(milestone);
    } else {
      shareAsText(milestone);
    }
  }

  if (loading && milestones.length === 0) {
    return <MilestonesSkeleton />;
  }

  const total = MILESTONE_DEFINITIONS.length;
  const reachedCount = milestones.length;

  return (
    <>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.md }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        ListHeaderComponent={
          <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
            <Text variant="caption">
              {reachedCount} of {total} reached
            </Text>
            <ProgressBar
              progress={total > 0 ? reachedCount / total : 0}
              accessibilityLabel={`${reachedCount} of ${total} milestones reached`}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            mascotState="encouraging"
            title="No milestones yet"
            subtitle="Finish a session and the first milestone will show here."
            action={{ label: 'Start a session', onPress: () => router.push('/(tabs)/train') }}
          />
        }
        renderItem={({ item }) =>
          item.kind === 'reached' ? (
            <MilestoneCard milestone={item.milestone} onShare={() => handleShare(item.milestone)} style={{ flex: 1, maxWidth: '50%' }} />
          ) : (
            <MilestoneCard definition={item.definition} style={{ flex: 1, maxWidth: '50%' }} />
          )
        }
      />
      <MilestoneShareSheet
        milestone={sharing}
        dogName={dog?.name ?? 'My dog'}
        avatarUrl={dog?.avatarUrl}
        streakDays={sessionStreak}
        totalSessions={totalSessionsCompleted}
        onShareText={shareAsText}
        onClose={() => setSharing(null)}
      />
    </>
  );
}
