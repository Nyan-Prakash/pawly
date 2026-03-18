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
import { getCoursePillColors, getCourseUiColors } from '@/constants/courseColors';
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
  plans: Array<{ id: string; label: string; isPrimary: boolean; goal: string; createdAt?: string }>;
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
        const theme = getCourseUiColors({
          id: plan.id,
          goal: plan.goal,
          courseTitle: plan.label,
          createdAt: plan.createdAt,
        });
        const pillColors = getCoursePillColors(
          {
            id: plan.id,
            goal: plan.goal,
            courseTitle: plan.label,
            createdAt: plan.createdAt,
          },
          isSelected
        );
        return (
          <TouchableOpacity
            key={plan.id}
            activeOpacity={0.75}
            onPress={() => onSelect(plan.id)}
            style={{
              paddingHorizontal: spacing.md,
              borderRadius: radii.pill,
              backgroundColor: pillColors.backgroundColor,
              borderWidth: 1,
              borderColor: pillColors.borderColor,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 6,
              minHeight: 36,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: pillColors.textColor,
              }}
            >
              {plan.label}
            </Text>
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
  accentColor,
}: {
  session: PlanSession | null;
  visible: boolean;
  onClose: () => void;
  onStart: () => void;
  dogName: string;
  recentAdaptations: PlanAdaptation[];
  accentColor: string;
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
                  style={{
                    backgroundColor: accentColor,
                    borderColor: accentColor,
                  }}
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
}: {
  session: PlanSession;
  isToday: boolean;
  isFuture: boolean;
  onPress: () => void;
  planColor: string;
}) {
  const kind = session.sessionKind ?? 'core';
  const isAdapted = session.adaptationSource === 'adaptation_engine';
  const iconBackgroundColor = session.isCompleted ? `${planColor}18` : colors.bg.surfaceAlt;
  const iconColor = session.isCompleted ? planColor : colors.text.secondary;
  const titleColor = session.isCompleted || isFuture ? colors.text.secondary : colors.text.primary;

  return (
    <TouchableOpacity
      activeOpacity={isFuture ? 0.6 : 0.8}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.border.default,
        padding: spacing.md,
        gap: spacing.md,
        minHeight: 92,
        opacity: isFuture ? 0.72 : 1,
        shadowColor: colors.shadow.strong,
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 1,
      }}
    >
      {/* Status icon */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: iconBackgroundColor,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 2,
        }}
      >
        {session.isCompleted ? (
          <Ionicons name="checkmark" size={18} color={iconColor} />
        ) : isToday ? (
          <Ionicons name="lock-closed" size={16} color={colors.text.secondary} />
        ) : (
          <Ionicons name="calendar-outline" size={18} color={iconColor} />
        )}
      </View>

      {/* Session info */}
      <View style={{ flex: 1, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs }}>
          <View style={{ flex: 1, gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' }}>
              {isAdapted && (
                <SessionChangeBadge kind={kind} />
              )}
              {session.autoRescheduledFrom ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: colors.status.warningBg,
                    borderRadius: radii.pill,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  }}
                >
                  <Ionicons name="refresh" size={11} color={colors.warning} />
                  <Text style={{ fontSize: 11, color: colors.warning, fontWeight: '400', letterSpacing: 0.2 }}>
                    Rescheduled
                  </Text>
                </View>
              ) : null}
            </View>
            <Text
              style={{
                fontSize: 19,
                fontWeight: '700',
                color: titleColor,
                lineHeight: 24,
              }}
              numberOfLines={2}
            >
              {session.title}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Ionicons name="time-outline" size={14} color={colors.text.secondary} />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: colors.text.secondary,
                }}
                numberOfLines={1}
              >
                {formatScheduleLabel(session)} · {session.durationMinutes} min
              </Text>
            </View>
          </View>
          {!isFuture && (
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.bg.surfaceAlt,
              }}
            >
              <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
            </View>
          )}
        </View>
      </View>
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
    goal: s.goal,
    createdAt: s.createdAt,
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

  const uiColors = getCourseUiColors(displayPlan);
  const planColor = uiColors.solid;
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
              backgroundColor: uiColors.tint,
              borderWidth: 1,
              borderColor: uiColors.selectedBorder,
              minHeight: 36,
            }}
          >
            <AppIcon name="add-circle" size={14} color={planColor} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: planColor }}>
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
                        backgroundColor: uiColors.tint,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 99,
                      }}
                    >
                      <Text style={{ fontSize: 11, color: planColor, fontWeight: '600' }}>
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
            router.push(`/(tabs)/train/session?id=${selectedSession.id}&planId=${displayPlanId ?? ''}`);
          } else {
            setSelectedSession(null);
          }
        }}
        dogName={dog?.name ?? 'your dog'}
        recentAdaptations={recentAdaptations}
        accentColor={planColor}
      />
    </SafeScreen>
  );
}
