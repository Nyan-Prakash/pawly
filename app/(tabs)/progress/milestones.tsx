import { useEffect } from 'react';
import { FlatList, Share, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { MilestoneGridCard } from '@/components/progress/MilestoneCard';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useAuthStore } from '@/stores/authStore';
import { useDogStore } from '@/stores/dogStore';
import { useProgressStore } from '@/stores/progressStore';
import { MILESTONE_DEFINITIONS } from '@/lib/milestoneEngine';
import type { Milestone, MilestoneDefinition } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Grid item type
// ─────────────────────────────────────────────────────────────────────────────

type GridItem =
  | { kind: 'achieved'; milestone: Milestone }
  | { kind: 'next'; definition: MilestoneDefinition }
  | { kind: 'locked'; definition: MilestoneDefinition };

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function MilestonesScreen() {
  const { user } = useAuthStore();
  const { dog } = useDogStore();
  const { milestones, fetchMilestones } = useProgressStore();

  useEffect(() => {
    if (dog?.id && user?.id) {
      fetchMilestones(dog.id, user.id);
    }
  }, [dog?.id, user?.id]);

  const achievedIds = new Set(milestones.map((m) => m.milestoneId));

  // Build sorted grid: achieved first, then next, then locked
  const achievedItems: GridItem[] = milestones.map((m) => ({
    kind: 'achieved',
    milestone: m,
  }));

  const unachievedDefs = MILESTONE_DEFINITIONS.filter((def) => !achievedIds.has(def.id));
  const nextDef = unachievedDefs[0];
  const lockedDefs = unachievedDefs.slice(1);

  const gridItems: GridItem[] = [
    ...achievedItems,
    ...(nextDef ? [{ kind: 'next' as const, definition: nextDef }] : []),
    ...lockedDefs.map((def) => ({ kind: 'locked' as const, definition: def })),
  ];

  // FlatList requires even number of items for 2-col grid — pad if needed
  const paddedItems: (GridItem | null)[] =
    gridItems.length % 2 === 1 ? [...gridItems, null] : gridItems;

  async function handleShare(milestone: Milestone) {
    try {
      await Share.share({
        message: `${milestone.title} — ${milestone.description}\n\nTrained with Pawly`,
      });
    } catch {
      // cancelled
    }
  }

  function renderItem({ item, index }: { item: GridItem | null; index: number }) {
    // Every two items form a row
    if (index % 2 !== 0) return null; // skip odd indices — handled by even
    const left = paddedItems[index];
    const right = paddedItems[index + 1] ?? null;

    function renderCard(gridItem: GridItem | null) {
      if (!gridItem) {
        return <View style={{ flex: 1, margin: spacing.xs }} />;
      }
      if (gridItem.kind === 'achieved') {
        return (
          <MilestoneGridCard
            milestone={gridItem.milestone}
            variant="achieved"
            onShare={() => handleShare(gridItem.milestone)}
          />
        );
      }
      if (gridItem.kind === 'next') {
        return (
          <MilestoneGridCard
            definition={gridItem.definition}
            variant="next"
          />
        );
      }
      return (
        <MilestoneGridCard
          definition={gridItem.definition}
          variant="locked"
        />
      );
    }

    return (
      <View style={{ flexDirection: 'row' }}>
        {renderCard(left)}
        {renderCard(right)}
      </View>
    );
  }

  return (
    <SafeScreen>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          paddingTop: spacing.md,
          paddingBottom: spacing.sm,
          gap: spacing.sm,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.secondary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <View>
          <Text variant="title" style={{ fontSize: 20 }}>
            All Milestones
          </Text>
          <Text variant="caption" style={{ color: colors.textSecondary }}>
            {milestones.length} of {MILESTONE_DEFINITIONS.length} earned
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.md }}>
        <View style={{ height: 6, backgroundColor: colors.border.default, borderRadius: 99 }}>
          <View
            style={{
              height: 6,
              width: `${Math.round((milestones.length / MILESTONE_DEFINITIONS.length) * 100)}%`,
              backgroundColor: colors.primary,
              borderRadius: 99,
            }}
          />
        </View>
      </View>

      <FlatList
        data={paddedItems}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xl * 2 }}
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({ length: 150, offset: 150 * index, index })}
      />
    </SafeScreen>
  );
}
