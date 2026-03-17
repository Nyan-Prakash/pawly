import { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { SessionChangeBadge } from '@/components/adaptive/SessionChangeBadge';
import { WhyThisChangedSheet } from '@/components/adaptive/WhyThisChangedSheet';
import { colors } from '@/constants/colors';
import { getCourseUiColors } from '@/constants/courseColors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { useDogStore } from '@/stores/dogStore';
import { usePlanStore, selectPlanSummaries } from '@/stores/planStore';
import { formatScheduleLabel, getPlanCompletion, getBehaviorLabel } from '@/lib/scheduleEngine';
import type { Plan, PlanAdaptation, PlanSession } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Completion ring (SVG-free, drawn with Views)
// ─────────────────────────────────────────────────────────────────────────────

function CompletionRing({ percentage, color }: { percentage: number; color: string }) {
  const size = 72;
  const strokeWidth = 7;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: colors.border.default,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: percentage > 0 ? color : 'transparent',
          borderTopColor: percentage >= 25 ? color : 'transparent',
          borderRightColor: percentage >= 50 ? color : 'transparent',
          borderBottomColor: percentage >= 75 ? color : 'transparent',
          borderLeftColor: percentage >= 100 ? color : 'transparent',
          transform: [{ rotate: '-90deg' }],
        }}
      />
      <Text style={{ fontSize: 15, fontWeight: '700', color: color }}>
        {percentage}%
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Course Switcher — pill tabs for switching between active plans
// ─────────────────────────────────────────────────────────────────────────────

interface CourseSwitcherProps {
  plans: Array<{ id: string; label: string; isPrimary: boolean }>;
  selectedId: string;
  onSelect: (id: string) => void;
}

function CourseSwitcher({ plans, selectedId, onSelect }: CourseSwitcherProps) {
  if (plans.length <= 1) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm+10,
        gap: spacing.xs,
      }}
    >
      {plans.map((plan) => {
        const isSelected = plan.id === selectedId;
        return (
          <TouchableOpacity
            key={plan.id}
            activeOpacity={0.75}
            onPress={() => onSelect(plan.id)}
            style={{
              paddingHorizontal: spacing.md,
              borderRadius: radii.pill,
              backgroundColor: isSelected ? colors.brand.primary : colors.bg.surfaceAlt,
              borderWidth: 1,
              borderColor: isSelected ? colors.brand.primary : colors.border.default,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 36,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: isSelected ? '#fff' : colors.text.primary,
              }}
            >
              {plan.label}
            </Text>
            {plan.isPrimary && !isSelected && (
              <View
                style={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: colors.brand.primary,
                }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Detail Sheet
// ─────────────────────────────────────────────────────────────────────────────

function SessionDetailSheet({
  session,
  visible,
  onClose,
  onStart,
  dogName,
  recentAdaptations,
}: {
  session: PlanSession | null;
  visible: boolean;
  onClose: () => void;
  onStart: () => void;
  dogName: string;
  recentAdaptations: PlanAdaptation[];
}) {
  const [showWhySheet, setShowWhySheet] = useState(false);
  const insets = useSafeAreaInsets();

  if (!session) return null;

  // Find the adaptation that changed this session (if any)
  const relatedAdaptation = session.adaptationSource === 'adaptation_engine'
    ? recentAdaptations.find((a) =>
        a.status === 'applied' && a.changedSessionIds.includes(session.id)
      ) ?? recentAdaptations.find((a) => a.status === 'applied') ?? null
    : null;

  const isAdapted = session.adaptationSource === 'adaptation_engine';
  const kind = session.sessionKind ?? 'core';

  function skillPathLabel(): string {
    switch (kind) {
      case 'regress':  return 'Stepped back from the previous skill to rebuild confidence.';
      case 'advance':  return 'Moving to a harder version — recent sessions have been strong.';
      case 'detour':   return 'Taking a different angle on the same skill to reduce frustration.';
      case 'repeat':   return 'Repeating this skill to deepen the habit before moving on.';
      case 'proofing': return 'Testing this skill in a more challenging setting.';
      default:         return 'Following the core progression for this training goal.';
    }
  }

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}
          onPress={onClose}
        >
          <Pressable onPress={() => {}} style={{ width: '100%' }}>
            <View
              style={{
                backgroundColor: colors.bg.surface,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                width: '100%',
                overflow: 'hidden',
              }}
            >
              {/* Drag handle */}
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.border.default,
                  alignSelf: 'center',
                  marginTop: spacing.md,
                  marginBottom: spacing.sm,
                }}
              />

              <ScrollView
                style={{ flexGrow: 0, paddingHorizontal: spacing.lg }}
                contentContainerStyle={{ paddingBottom: spacing.xl}}
                showsVerticalScrollIndicator={false}
              >
                {/* Title + badge row */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text.primary, lineHeight: 28 }}>
                      {session.title}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.text.secondary, marginTop: 2 }}>
                      {formatScheduleLabel(session)} · {session.durationMinutes} min
                    </Text>
                  </View>
                  {isAdapted && (
                    <View style={{ marginTop: 4 }}>
                      <SessionChangeBadge kind={kind} />
                    </View>
                  )}
                </View>

                {/* Skill path context */}
                <View
                  style={{
                    backgroundColor: colors.bg.surfaceAlt,
                    borderRadius: radii.md,
                    padding: spacing.md,
                    marginBottom: spacing.md,
                    gap: spacing.xs,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <AppIcon name="git-branch" size={14} color={colors.text.secondary} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Skill path
                    </Text>
                  </View>
                  <Text style={{ fontSize: 14, lineHeight: 20, color: colors.text.primary }}>
                    {skillPathLabel()}
                  </Text>
                  {session.reasoningLabel ? (
                    <Text style={{ fontSize: 12, color: colors.text.secondary, lineHeight: 18 }}>
                      {session.reasoningLabel}
                    </Text>
                  ) : null}
                </View>

                {/* Adaptation explanation (if adapted) */}
                {isAdapted && relatedAdaptation && (
                  <View
                    style={{
                      backgroundColor: colors.status.infoBg,
                      borderRadius: radii.md,
                      padding: spacing.md,
                      marginBottom: spacing.md,
                      borderWidth: 1,
                      borderColor: colors.status.infoBorder,
                      gap: spacing.xs,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                      <AppIcon name="sparkles" size={14} color={colors.brand.coach} />
                      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.brand.coach, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Why this changed
                      </Text>
                    </View>
                    <Text style={{ fontSize: 14, lineHeight: 20, color: colors.text.primary }}>
                      {relatedAdaptation.reasonSummary || 'Adjusted based on recent training patterns.'}
                    </Text>
                    <Pressable
                      onPress={() => setShowWhySheet(true)}
                      style={({ pressed }) => ({
                        alignSelf: 'flex-start',
                        marginTop: 4,
                        paddingHorizontal: spacing.md,
                        paddingVertical: 6,
                        borderRadius: radii.pill,
                        backgroundColor: pressed ? `${colors.brand.coach}22` : `${colors.brand.coach}14`,
                      })}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.brand.coach }}>
                        Full explanation →
                      </Text>
                    </Pressable>
                  </View>
                )}

                {/* Adapted but no matching adaptation record — generic note */}
                {isAdapted && !relatedAdaptation && (
                  <View
                    style={{
                      backgroundColor: colors.status.infoBg,
                      borderRadius: radii.md,
                      padding: spacing.md,
                      marginBottom: spacing.md,
                      borderWidth: 1,
                      borderColor: colors.status.infoBorder,
                    }}
                  >
                    <Text style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 19 }}>
                      This session was adjusted by Pawly based on recent training results.
                    </Text>
                  </View>
                )}

              </ScrollView>

              {/* Fixed footer button */}
              <View
                style={{
                  paddingHorizontal: spacing.lg,
                  paddingTop: spacing.md,
                  paddingBottom: insets.bottom > 0 ? insets.bottom + 4 : spacing.lg,
                  borderTopWidth: 1,
                  borderTopColor: colors.border.soft,
                  backgroundColor: colors.bg.surface,
                }}
              >
                <Button
                  label={session.isCompleted ? 'Session completed' : 'Start this session'}
                  onPress={onStart}
                />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Full why-this-changed sheet */}
      {relatedAdaptation && (
        <WhyThisChangedSheet
          visible={showWhySheet}
          onClose={() => setShowWhySheet(false)}
          dogName={dogName}
          adaptation={relatedAdaptation}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Row
// ─────────────────────────────────────────────────────────────────────────────

function SessionRow({
  session,
  isToday,
  isFuture,
  onPress,
  planColor,
  tintColor,
}: {
  session: PlanSession;
  isToday: boolean;
  isFuture: boolean;
  onPress: () => void;
  planColor: string;
  tintColor: string;
}) {
  const bgColor = isToday ? tintColor : colors.surface;
  const borderColor = isToday ? planColor : colors.border.default;
  const kind = session.sessionKind ?? 'core';
  const isAdapted = session.adaptationSource === 'adaptation_engine';

  return (
    <TouchableOpacity
      activeOpacity={isFuture ? 0.6 : 0.8}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: bgColor,
        borderRadius: 14,
        borderWidth: 1,
        borderColor,
        padding: spacing.md,
        gap: spacing.sm,
        minHeight: 68,
        opacity: isFuture ? 0.55 : 1,
      }}
    >
      {/* Status icon */}
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: session.isCompleted
            ? colors.success
            : isToday
            ? planColor
            : colors.bg.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {session.isCompleted ? (
          <Ionicons name="checkmark" size={18} color="#fff" />
        ) : isToday ? (
          <Ionicons name="play" size={14} color="#fff" />
        ) : (
          <Ionicons name="lock-closed" size={14} color={colors.textSecondary} />
        )}
      </View>

      {/* Session info */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' }}>
          {isToday && (
            <View
              style={{
                backgroundColor: planColor,
                paddingHorizontal: 6,
                paddingVertical: 1,
                borderRadius: 4,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 }}>
                TODAY
              </Text>
            </View>
          )}
          <Text
            style={{
              fontSize: 14,
              fontWeight: session.isCompleted || isToday ? '600' : '400',
              color: session.isCompleted ? colors.textSecondary : colors.textPrimary,
              flex: 1,
            }}
            numberOfLines={2}
          >
            {session.title}
          </Text>
        </View>

        {/* Adaptation badge */}
        {isAdapted && (
          <View style={{ marginTop: 6 }}>
            <SessionChangeBadge kind={kind} />
          </View>
        )}

        <Text variant="caption" style={{ marginTop: 4 }}>
          {formatScheduleLabel(session)} · {session.durationMinutes} min
        </Text>

        {session.autoRescheduledFrom ? (
          <View
            style={{
              marginTop: 6,
              alignSelf: 'flex-start',
              backgroundColor: colors.status.warningBg,
              borderRadius: radii.pill,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontSize: 10, color: colors.warning, fontWeight: '700' }}>
              Rescheduled
            </Text>
          </View>
        ) : null}
      </View>

      {/* Chevron */}
      {!isFuture && (
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Week Section Header
// ─────────────────────────────────────────────────────────────────────────────

function WeekHeader({
  weekNumber,
  isCurrentWeek,
  color,
}: {
  weekNumber: number;
  isCurrentWeek: boolean;
  color: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        paddingTop: weekNumber > 1 ? spacing.md : 0,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: '700',
          color: isCurrentWeek ? color : colors.text.secondary,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
        }}
      >
        Week {weekNumber}
      </Text>
      {isCurrentWeek && (
        <View
          style={{
            backgroundColor: color,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 99,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>Current</Text>
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Plan Screen
// ─────────────────────────────────────────────────────────────────────────────

type ListItem =
  | { type: 'header'; weekNumber: number; isCurrentWeek: boolean }
  | { type: 'session'; session: PlanSession; isToday: boolean; isFuture: boolean };

function buildListData(plan: Plan, todaySessionId: string | null): ListItem[] {
  const items: ListItem[] = [];
  let currentWeek = 0;

  for (const session of plan.sessions) {
    if (session.weekNumber !== currentWeek) {
      currentWeek = session.weekNumber;
      items.push({
        type: 'header',
        weekNumber: currentWeek,
        isCurrentWeek: currentWeek === plan.currentWeek,
      });
    }

    const isToday = session.id === todaySessionId;
    const firstIncompleteIdx = plan.sessions.findIndex((s) => !s.isCompleted);
    const sessionIdx = plan.sessions.indexOf(session);
    const isFuture = !session.isCompleted && !isToday && sessionIdx > firstIncompleteIdx;

    items.push({ type: 'session', session, isToday, isFuture });
  }
  return items;
}

export default function PlanScreen() {
  const { dog } = useDogStore();
  const planStoreState = usePlanStore();
  const {
    plansById,
    activePlanIds,
    selectedPlanId,
    recommendedTodaySession,
    recentAdaptations,
    isLoading,
    fetchActivePlans,
    setSelectedPlan,
    fetchRecentAdaptations,
  } = planStoreState;

  const [selectedSession, setSelectedSession] = useState<PlanSession | null>(null);

  useEffect(() => {
    if (dog?.id && activePlanIds.length === 0) {
      fetchActivePlans(dog.id);
    }
  }, [dog?.id, activePlanIds.length, fetchActivePlans]);

  // Resolve which plan to display: selectedPlanId → primary → first
  const displayPlanId =
    selectedPlanId ??
    activePlanIds.find((id) => plansById[id]?.isPrimary) ??
    activePlanIds[0] ??
    null;

  const displayPlan = displayPlanId ? (plansById[displayPlanId] ?? null) : null;

  // When the displayed plan changes, fetch its adaptations
  useEffect(() => {
    if (displayPlanId) {
      fetchRecentAdaptations(displayPlanId);
    }
  }, [displayPlanId, fetchRecentAdaptations]);

  // Build switcher entries from all active plans
  const planSummaries = selectPlanSummaries(planStoreState);
  const switcherPlans = planSummaries.map((s) => ({
    id: s.id,
    label: s.courseTitle ?? getBehaviorLabel(s.goal),
    isPrimary: s.isPrimary,
  }));

  const todaySessionId = recommendedTodaySession?.planId === displayPlanId
    ? recommendedTodaySession?.id ?? null
    : null;

  const noPlans = !isLoading && activePlanIds.length === 0;

  if (noPlans || (!isLoading && !displayPlan)) {
    return (
      <SafeScreen>
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
            onPress={() => router.back()}
            style={{ minHeight: 44, minWidth: 44, justifyContent: 'center' }}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text variant="title" style={{ fontSize: 20 }}>My Plan</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
          <Text variant="caption" style={{ textAlign: 'center' }}>
            No active plan found. Complete onboarding to get your personalized plan.
          </Text>
        </View>
      </SafeScreen>
    );
  }

  if (!displayPlan) return null;

  const uiColors = getCourseUiColors(displayPlan.goal);
  const planColor = displayPlan.color || uiColors.solid;
  const completionPct = getPlanCompletion(displayPlan);
  const behaviorLabel = getBehaviorLabel(displayPlan.goal);
  const courseTitle = displayPlan.courseTitle ?? behaviorLabel;
  const stageNumber = parseInt(displayPlan.currentStage?.match(/\d/)?.[0] ?? '1', 10);
  const adaptedCount = displayPlan.sessions.filter((s) => s.adaptationSource === 'adaptation_engine').length;
  const listData = buildListData(displayPlan, todaySessionId);

  return (
    <SafeScreen>
      {/* ── Nav Header ── */}
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
          onPress={() => router.back()}
          style={{ minHeight: 44, minWidth: 44, justifyContent: 'center' }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text variant="title" style={{ fontSize: 20, flex: 1 }}>
          {switcherPlans.length > 1 ? 'My Courses' : 'My Plan'}
        </Text>
        {switcherPlans.length < 2 && (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.push('/(tabs)/train/add-course' as never)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: spacing.sm,
              paddingVertical: 8,
              borderRadius: radii.pill,
              backgroundColor: colors.brand.primary + '12',
              borderWidth: 1,
              borderColor: colors.brand.primary + '30',
              minHeight: 36,
            }}
          >
            <AppIcon name="add-circle" size={14} color={colors.brand.primary} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.brand.primary }}>
              Add goal
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Course Switcher (only when multiple plans) ── */}
      <CourseSwitcher
        plans={switcherPlans}
        selectedId={displayPlanId ?? ''}
        onSelect={(id) => setSelectedPlan(id)}
      />

      <FlatList
        data={listData}
        keyExtractor={(item, idx) =>
          item.type === 'header' ? `week-${item.weekNumber}` : `session-${item.session.id}-${idx}`
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.xl * 2,
        }}
        ListHeaderComponent={() => (
          <View>
            {/* Plan summary card */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 20,
                padding: spacing.lg,
                marginBottom: spacing.md,
                borderWidth: 1,
                borderColor: colors.border.default,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
              }}
            >
              <CompletionRing percentage={completionPct} color={planColor} />
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary, lineHeight: 22 }}
                  numberOfLines={2}
                >
                  {dog?.name ? `${dog.name}'s ` : ''}{courseTitle} Plan
                </Text>
                <Text variant="caption" style={{ marginTop: 4 }}>
                  {displayPlan.durationWeeks} weeks · {displayPlan.sessionsPerWeek}×/week
                </Text>
                {displayPlan.metadata?.scheduleSummary ? (
                  <Text variant="caption" style={{ marginTop: 4 }}>
                    {displayPlan.metadata.scheduleSummary}
                  </Text>
                ) : null}
                <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs, flexWrap: 'wrap' }}>
                  <View
                    style={{
                      backgroundColor: uiColors.tint,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 99,
                    }}
                  >
                    <Text style={{ fontSize: 11, color: planColor, fontWeight: '600' }}>
                      {behaviorLabel}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: uiColors.tint,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 99,
                    }}
                  >
                    <Text style={{ fontSize: 11, color: planColor, fontWeight: '600' }}>
                      Stage {stageNumber}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: uiColors.tint,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 99,
                    }}
                  >
                    <Text style={{ fontSize: 11, color: planColor, fontWeight: '600' }}>
                      {displayPlan.sessions.filter((s) => s.isCompleted).length}/{displayPlan.sessions.length} done
                    </Text>
                  </View>
                  {displayPlan.isPrimary && switcherPlans.length > 1 && (
                    <View
                      style={{
                        backgroundColor: colors.brand.primary + '18',
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 99,
                      }}
                    >
                      <Text style={{ fontSize: 11, color: colors.brand.primary, fontWeight: '600' }}>
                        Primary
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Adaptation summary strip */}
            {adaptedCount > 0 && (
              <View
                style={{
                  backgroundColor: colors.status.infoBg,
                  borderRadius: radii.md,
                  borderWidth: 1,
                  borderColor: colors.status.infoBorder,
                  padding: spacing.md,
                  marginBottom: spacing.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                }}
              >
                <AppIcon name="sparkles" size={16} color={colors.brand.coach} />
                <Text style={{ flex: 1, fontSize: 13, color: colors.text.primary, lineHeight: 19 }}>
                  <Text style={{ fontWeight: '700' }}>{adaptedCount} session{adaptedCount !== 1 ? 's' : ''}</Text>
                  {' '}in this plan {adaptedCount === 1 ? 'was' : 'were'} adjusted by Pawly. Tap a session to see why.
                </Text>
              </View>
            )}
          </View>
        )}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <WeekHeader
                weekNumber={item.weekNumber}
                isCurrentWeek={item.isCurrentWeek}
                color={planColor}
              />
            );
          }

          return (
            <View style={{ marginBottom: spacing.xs }}>
              <SessionRow
                session={item.session}
                isToday={item.isToday}
                isFuture={item.isFuture}
                planColor={planColor}
                tintColor={uiColors.tint}
                onPress={() => {
                  if (!item.isFuture) {
                    setSelectedSession(item.session);
                  }
                }}
              />
            </View>
          );
        }}
      />

      {/* Session detail sheet */}
      <SessionDetailSheet
        session={selectedSession}
        visible={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        onStart={() => {
          if (selectedSession && !selectedSession.isCompleted) {
            setSelectedSession(null);
            router.push(`/(tabs)/train/session?id=${selectedSession.id}`);
          } else {
            setSelectedSession(null);
          }
        }}
        dogName={dog?.name ?? 'your dog'}
        recentAdaptations={recentAdaptations}
      />
    </SafeScreen>
  );
}
