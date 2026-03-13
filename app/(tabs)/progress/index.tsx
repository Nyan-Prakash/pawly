import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { Text } from '@/components/ui/Text';
import { MilestoneCard } from '@/components/progress/MilestoneCard';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { shadows } from '@/constants/shadows';
import { spacing } from '@/constants/spacing';
import { useAuthStore } from '@/stores/authStore';
import { useDogStore } from '@/stores/dogStore';
import { useProgressStore } from '@/stores/progressStore';
import { MILESTONE_DEFINITIONS, getNextMilestoneDefinition } from '@/lib/milestoneEngine';
import type { Milestone } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────

function ProgressSkeleton() {
  return (
    <View style={{ padding: spacing.md, gap: spacing.md }}>
      <SkeletonBlock height={32} width="55%" />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <SkeletonBlock height={120} style={{ flex: 1 }} />
        <SkeletonBlock height={120} style={{ flex: 1 }} />
      </View>
      <SkeletonBlock height={170} />
      <SkeletonBlock height={200} />
      <SkeletonBlock height={120} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Streak Card
// ─────────────────────────────────────────────────────────────────────────────

function StreakCard({
  emoji,
  label,
  current,
  longest,
  activityDots,
  accentColor,
}: {
  emoji: AppIconName;
  label: string;
  current: number;
  longest: number;
  activityDots: boolean[];
  accentColor?: string;
}) {
  const dot = accentColor ?? colors.brand.primary;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg.surface,
        borderRadius: radii.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border.soft,
        gap: spacing.xs,
        ...shadows.card,
      }}
    >
      <AppIcon name={emoji} size={22} color={accentColor ?? colors.brand.primary} />
      <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text.primary, lineHeight: 34 }}>
        {current}
      </Text>
      <Text style={{ fontSize: 12, color: colors.text.secondary, fontWeight: '600' }}>
        {label}
      </Text>
      <Text variant="micro" color={colors.text.secondary}>
        Best: {longest} days
      </Text>
      <View style={{ flexDirection: 'row', gap: 4, marginTop: spacing.xs }}>
        {activityDots.map((active, i) => (
          <View
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: active ? dot : colors.border.default,
            }}
          />
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bar Chart
// ─────────────────────────────────────────────────────────────────────────────

function SessionBarChart({ data }: { data: { weekStart: string; sessionsCompleted: number }[] }) {
  const [tooltip, setTooltip] = useState<{ index: number } | null>(null);
  const maxSessions = Math.max(...data.map((d) => d.sessionsCompleted), 1);
  const chartHeight = 120;
  const barWidth = 36;

  function formatWeekLabel(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon="analytics"
        title="No sessions yet"
        subtitle="Complete your first session to see your chart"
      />
    );
  }

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-around',
          height: chartHeight,
          paddingHorizontal: spacing.sm,
        }}
      >
        {data.map((week, i) => {
          const barH = Math.max((week.sessionsCompleted / maxSessions) * chartHeight, 4);
          const isSelected = tooltip?.index === i;
          return (
            <TouchableOpacity
              key={week.weekStart}
              activeOpacity={0.8}
              onPress={() => setTooltip(isSelected ? null : { index: i })}
              style={{ alignItems: 'center', gap: 6 }}
            >
              {isSelected && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: barH + 8,
                    backgroundColor: colors.text.primary,
                    borderRadius: radii.sm,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    zIndex: 10,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                    {week.sessionsCompleted} session{week.sessionsCompleted !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
              <View
                style={{
                  width: barWidth,
                  height: barH,
                  backgroundColor: isSelected ? colors.brand.secondary : colors.brand.primary,
                  borderRadius: 8,
                  opacity: week.sessionsCompleted === 0 ? 0.2 : 1,
                }}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingHorizontal: spacing.sm,
          marginTop: 6,
        }}
      >
        {data.map((week) => (
          <Text
            key={week.weekStart}
            style={{ fontSize: 10, color: colors.text.secondary, textAlign: 'center', width: barWidth }}
          >
            {formatWeekLabel(week.weekStart)}
          </Text>
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Walk Quality Chart
// ─────────────────────────────────────────────────────────────────────────────

function WalkQualityChart({ data }: { data: { date: string; quality: 1 | 2 | 3 | null }[] }) {
  const chartHeight = 80;
  const chartWidth = SCREEN_WIDTH - spacing.md * 4 - spacing.md * 2;
  const pointSpacing = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;
  const qualityLabels = ['Harder', 'Same', 'Better'];
  const lineColor = colors.brand.secondary;

  const points: { x: number; y: number; quality: number }[] = [];
  data.forEach((d, i) => {
    if (d.quality !== null) {
      const x = i * pointSpacing;
      const y = chartHeight - ((d.quality - 1) / 2) * chartHeight;
      points.push({ x, y, quality: d.quality });
    }
  });

  if (points.length === 0) {
    return (
      <EmptyState
        icon="walk"
        title="No walks logged yet"
        subtitle="Log your first walk to track quality trends"
      />
    );
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ height: chartHeight, justifyContent: 'space-between', marginRight: 6 }}>
          {[...qualityLabels].reverse().map((l) => (
            <Text key={l} style={{ fontSize: 9, color: colors.text.secondary }}>
              {l}
            </Text>
          ))}
        </View>

        <View style={{ flex: 1, height: chartHeight, position: 'relative' }}>
          {[0, 0.5, 1].map((frac) => (
            <View
              key={frac}
              style={{
                position: 'absolute',
                top: frac * chartHeight,
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: colors.border.default,
                opacity: 0.5,
              }}
            />
          ))}

          {points.slice(0, -1).map((pt, i) => {
            const next = points[i + 1];
            const dx = next.x - pt.x;
            const dy = next.y - pt.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
            return (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  left: pt.x,
                  top: pt.y - 1,
                  width: length,
                  height: 2.5,
                  backgroundColor: lineColor,
                  transformOrigin: '0% 50%',
                  transform: [{ rotate: `${angle}deg` }],
                }}
              />
            );
          })}

          {points.map((pt, i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: pt.x - 5,
                top: pt.y - 5,
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: lineColor,
                borderWidth: 2,
                borderColor: colors.bg.surface,
              }}
            />
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingLeft: 32 }}>
        <Text style={{ fontSize: 9, color: colors.text.secondary }}>
          {new Date(data[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Text>
        <Text style={{ fontSize: 9, color: colors.text.secondary }}>
          {new Date(data[data.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Behavior Scorecard
// ─────────────────────────────────────────────────────────────────────────────

function BehaviorScoreCard({ score }: { score: import('@/types').BehaviorScore }) {
  const pct = ((score.currentStage - 1) / (score.totalStages - 1)) * 100;
  const trendConfig = {
    improving: { arrow: '↑', color: colors.success,          label: 'Improving' },
    stable:    { arrow: '→', color: colors.text.secondary,   label: 'Stable' },
    declining: { arrow: '↓', color: colors.error,            label: 'Needs work' },
  };
  const trend = trendConfig[score.trend];

  function labelForBehavior(b: string): string {
    const map: Record<string, string> = {
      loose_leash_walking: 'Leash Walking',
      recall: 'Recall / Come',
      impulse_control: 'Impulse Control',
      positions: 'Sit / Down / Stay',
      door_manners: 'Door Manners',
      focus: 'Focus & Attention',
    };
    return map[b.toLowerCase().replace(/ /g, '_')] ?? b;
  }

  return (
    <View
      style={{
        backgroundColor: colors.bg.surface,
        borderRadius: radii.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border.soft,
        gap: spacing.sm,
        ...shadows.card,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontWeight: '700', fontSize: 15, color: colors.text.primary }}>
          {labelForBehavior(score.behavior)}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 16, color: trend.color }}>{trend.arrow}</Text>
          <Text style={{ fontSize: 12, color: trend.color, fontWeight: '600' }}>{trend.label}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
        <Text variant="caption" color={colors.text.secondary}>
          Stage {score.currentStage} of {score.totalStages}
        </Text>
        <View style={{ flexDirection: 'row', gap: 4, marginLeft: spacing.xs }}>
          {Array.from({ length: score.totalStages }).map((_, i) => (
            <View
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: i < score.currentStage ? colors.brand.primary : colors.border.default,
              }}
            />
          ))}
        </View>
      </View>

      <ProgressBar progress={Math.min(pct / 100, 1)} height={6} />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="caption" color={colors.text.secondary}>
          {score.sessionCount} sessions completed
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/train')}
          style={{
            backgroundColor: '#DCFCE7',
            paddingHorizontal: spacing.sm,
            paddingVertical: 5,
            borderRadius: radii.pill,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.brand.primary, fontWeight: '700' }}>
            Continue →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Milestone Celebration Modal
// ─────────────────────────────────────────────────────────────────────────────

function MilestoneCelebration({
  milestone,
  onClose,
  onShare,
}: {
  milestone: Milestone;
  onClose: () => void;
  onShare: () => void;
}) {
  const scale = useRef(new Animated.Value(0.4)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={onClose}
      >
        <Animated.View
          style={{
            opacity,
            transform: [{ scale }],
            backgroundColor: colors.bg.surface,
            borderRadius: radii.lg,
            padding: spacing.xl,
            marginHorizontal: spacing.lg,
            alignItems: 'center',
            gap: spacing.md,
            ...shadows.modal,
          }}
        >
          <AppIcon name={milestone.emoji as AppIconName} size={64} color={colors.brand.primary} />
          <Text variant="h2" style={{ textAlign: 'center' }}>
            {milestone.title}
          </Text>
          <Text
            variant="body"
            color={colors.text.secondary}
            style={{ textAlign: 'center', lineHeight: 24 }}
          >
            {milestone.description}
          </Text>

          <Button
            label="Share this milestone"
            leftIcon="share-social"
            onPress={onShare}
            style={{ width: '100%' }}
          />

          <TouchableOpacity activeOpacity={0.7} onPress={onClose}>
            <Text style={{ color: colors.text.secondary, fontSize: 14 }}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Progress Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function ProgressScreen() {
  const { user } = useAuthStore();
  const { dog } = useDogStore();
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
    }
  }, [dog?.id, user?.id]);

  const onRefresh = useCallback(async () => {
    if (!dog?.id || !user?.id) return;
    setRefreshing(true);
    await Promise.all([fetchProgressData(dog.id, user.id), fetchMilestones(dog.id, user.id)]);
    setRefreshing(false);
  }, [dog?.id, user?.id]);

  function build7DayActivityDots(type: 'session' | 'walk'): boolean[] {
    const streak = type === 'session' ? sessionStreak : walkStreak;
    return Array.from({ length: 7 }, (_, i) => i < Math.min(streak, 7));
  }

  function getWeekRange(): string {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${fmt(start)} – ${fmt(end)}`;
  }

  async function handleShareMilestone(milestone: Milestone) {
    try {
      await Share.share({
        message: `${milestone.title} — ${milestone.description}\n\nTrained with Pawly`,
      });
    } catch {
      // user cancelled
    }
    setCelebrationMilestone(null);
  }

  const achievedIds = milestones.map((m) => m.milestoneId);
  const nextMilestoneDef = getNextMilestoneDefinition(achievedIds);

  if (isLoading && totalSessionsCompleted === 0) {
    return (
      <SafeScreen>
        <ProgressSkeleton />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}
      >
        {/* ── Header ── */}
        <View
          style={{
            paddingHorizontal: spacing.md,
            paddingTop: spacing.md,
            paddingBottom: spacing.sm,
          }}
        >
          <Text variant="h2">
            {dog?.name ? `${dog.name}'s Progress` : 'Progress'}
          </Text>
          <Text variant="micro" color={colors.text.secondary} style={{ marginTop: 2 }}>
            {getWeekRange()}
          </Text>
        </View>

        <View style={{ paddingHorizontal: spacing.md, gap: spacing.lg }}>

          {/* ── Streak Cards ── */}
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <StreakCard
              emoji="flame"
              label="Training streak"
              current={sessionStreak}
              longest={longestSessionStreak}
              activityDots={build7DayActivityDots('session')}
              accentColor={colors.brand.primary}
            />
            <StreakCard
              emoji="walk"
              label="Walk streak"
              current={walkStreak}
              longest={walkStreak}
              activityDots={build7DayActivityDots('walk')}
              accentColor={colors.brand.secondary}
            />
          </View>

          {/* ── Behavior Scorecard ── */}
          {behaviorScores.length > 0 && (
            <View style={{ gap: spacing.sm }}>
              <SectionHeader title="Behavior Progress" />
              {behaviorScores.map((score, i) => (
                <BehaviorScoreCard key={i} score={score} />
              ))}
            </View>
          )}

          {/* ── Sessions Chart ── */}
          <View
            style={{
              backgroundColor: colors.bg.surface,
              borderRadius: radii.lg,
              padding: spacing.md,
              borderWidth: 1,
              borderColor: colors.border.soft,
              gap: spacing.sm,
              ...shadows.card,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700', fontSize: 15, color: colors.text.primary }}>
                Sessions this month
              </Text>
              <Text variant="caption" color={colors.text.secondary}>
                {totalSessionsCompleted} total
              </Text>
            </View>
            <SessionBarChart data={sessionsByWeek} />
          </View>

          {/* ── Walk Quality Chart ── */}
          <View
            style={{
              backgroundColor: colors.bg.surface,
              borderRadius: radii.lg,
              padding: spacing.md,
              borderWidth: 1,
              borderColor: colors.border.soft,
              gap: spacing.sm,
              ...shadows.card,
            }}
          >
            <Text style={{ fontWeight: '700', fontSize: 15, color: colors.text.primary }}>
              Walk quality trend
            </Text>
            <WalkQualityChart data={walkQualityByWeek} />
          </View>

          {/* ── Milestones ── */}
          <View style={{ gap: spacing.sm }}>
            <SectionHeader
              title="Milestones"
              action={{ label: 'See all', onPress: () => router.push('/(tabs)/progress/milestones') }}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.md }}
            >
              {milestones.map((m) => (
                <MilestoneCard
                  key={m.id}
                  milestone={m}
                  variant="achieved"
                  onShare={() => setCelebrationMilestone(m)}
                />
              ))}

              {nextMilestoneDef && (
                <MilestoneCard definition={nextMilestoneDef} variant="next" />
              )}

              {MILESTONE_DEFINITIONS.filter(
                (def) => !achievedIds.includes(def.id) && def.id !== nextMilestoneDef?.id
              )
                .slice(0, 3)
                .map((def) => (
                  <MilestoneCard key={def.id} definition={def} variant="locked" />
                ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {celebrationMilestone && (
        <MilestoneCelebration
          milestone={celebrationMilestone}
          onClose={() => setCelebrationMilestone(null)}
          onShare={() => handleShareMilestone(celebrationMilestone)}
        />
      )}
    </SafeScreen>
  );
}
