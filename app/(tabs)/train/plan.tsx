import { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { SessionChangeBadge } from '@/components/adaptive/SessionChangeBadge';
import { WhyThisChangedSheet } from '@/components/adaptive/WhyThisChangedSheet';
import { colors } from '@/constants/colors';
import { getCoursePillColors, getCourseUiColors, hexToRgba } from '@/constants/courseColors';
import { radii } from '@/constants/radii';
import { shadows } from '@/constants/shadows';
import { spacing } from '@/constants/spacing';
import { useDogStore } from '@/stores/dogStore';
import { usePlanStore, selectPlanSummaries } from '@/stores/planStore';
import { formatScheduleLabel, getPlanCompletion, getBehaviorLabel } from '@/lib/scheduleEngine';
import type { Plan, PlanAdaptation, PlanSession } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Plan Summary Hero Card
// ─────────────────────────────────────────────────────────────────────────────

function PlanHeroCard({
  courseTitle,
  completionPct,
  durationWeeks,
  stageNumber,
  completedCount,
  totalCount,
  planColor,
  adaptedCount,
}: {
  courseTitle: string;
  completionPct: number;
  durationWeeks: number;
  stageNumber: number;
  completedCount: number;
  totalCount: number;
  planColor: string;
  adaptedCount: number;
}) {
  return (
    <LinearGradient
      colors={[planColor, hexToRgba(planColor, 0.78)]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: radii.lg,
        overflow: 'hidden',
        marginBottom: spacing.md,
        ...shadows.card,
      }}
    >
      <View style={{ padding: spacing.lg, gap: spacing.sm }}>
        {/* Title */}
        <Text
          style={{
            color: '#fff',
            fontSize: 26,
            fontWeight: '800',
            lineHeight: 32,
            letterSpacing: -0.5,
          }}
          numberOfLines={2}
        >
          {courseTitle}
        </Text>

        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: '500' }}>
          Stage {stageNumber} · {durationWeeks} weeks · {completedCount}/{totalCount} done
        </Text>

        {/* Progress bar + % */}
        <View style={{ marginTop: spacing.xs, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <ProgressBar
              progress={completionPct / 100}
              height={10}
              color="rgba(255,255,255,0.95)"
              trackColor="rgba(255,255,255,0.28)"
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.5 }}>
              {completionPct}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '700' }}>
              %
            </Text>
          </View>
        </View>

      </View>

      {/* Adaptation strip inside card */}
      {adaptedCount > 0 && (
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.15)',
            paddingHorizontal: spacing.lg,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <AppIcon name="sparkles" size={13} color="rgba(255,255,255,0.85)" />
          <Text
            style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}
            numberOfLines={1}
          >
            <Text style={{ fontWeight: '700', color: '#fff' }}>{adaptedCount}</Text>
            {' '}session{adaptedCount !== 1 ? 's' : ''} adjusted by Pawly
          </Text>
        </View>
      )}
    </LinearGradient>
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
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md }}>
                  <View style={{ flex: 1, gap: 4 }}>
                    {isAdapted && <SessionChangeBadge kind={kind} />}
                    <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text.primary, lineHeight: 32, letterSpacing: -0.3 }}>
                      {session.title}
                    </Text>
                    <Text style={{ fontSize: 15, color: colors.text.secondary }}>
                      {formatScheduleLabel(session)} · {session.durationMinutes} min
                    </Text>
                  </View>
                </View>

                {/* Skill path context */}
                <View
                  style={{
                    backgroundColor: colors.bg.surfaceAlt,
                    borderRadius: radii.md,
                    padding: spacing.md,
                    marginBottom: spacing.md,
                  }}
                >
                  <Text style={{ fontSize: 15, lineHeight: 22, color: colors.text.primary }}>
                    {skillPathLabel()}
                  </Text>
                  {session.reasoningLabel ? (
                    <Text style={{ fontSize: 14, color: colors.text.secondary, lineHeight: 20, marginTop: 6 }}>
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
                      gap: spacing.sm,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                      <AppIcon name="sparkles" size={15} color={colors.brand.coach} />
                      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.brand.coach }}>
                        Why this changed
                      </Text>
                    </View>
                    <Text style={{ fontSize: 15, lineHeight: 22, color: colors.text.primary }}>
                      {relatedAdaptation.reasonSummary || 'Adjusted based on recent training patterns.'}
                    </Text>
                    <Pressable
                      onPress={() => setShowWhySheet(true)}
                      style={({ pressed }) => ({
                        alignSelf: 'flex-start',
                        paddingHorizontal: spacing.md,
                        paddingVertical: 8,
                        borderRadius: radii.pill,
                        backgroundColor: pressed ? `${colors.brand.coach}22` : `${colors.brand.coach}14`,
                      })}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.brand.coach }}>
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
                    <Text style={{ fontSize: 14, color: colors.text.secondary, lineHeight: 20 }}>
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
  const iconBg = session.isCompleted ? hexToRgba(planColor, 0.12) : colors.bg.surfaceAlt;
  const iconColor = session.isCompleted ? planColor : colors.text.secondary;
  const titleColor = isFuture ? colors.text.secondary : colors.text.primary;
  const barColor = session.isCompleted ? planColor : isFuture ? colors.border.strong : planColor;

  return (
    <TouchableOpacity
      activeOpacity={isFuture ? 0.6 : 0.8}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bg.surface,
        borderRadius: radii.lg,
        borderWidth: 1.5,
        borderColor: isToday ? hexToRgba(planColor, 0.35) : colors.border.default,
        overflow: 'hidden',
        opacity: isFuture ? 0.7 : 1,
        ...shadows.card,
      }}
    >
      {/* Colored left bar */}
      <View style={{ width: 4, alignSelf: 'stretch', backgroundColor: barColor }} />

      {/* Status icon */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: spacing.md,
          marginVertical: spacing.md,
        }}
      >
        {session.isCompleted ? (
          <AppIcon name="checkmark" size={18} color={iconColor} />
        ) : isToday ? (
          <AppIcon name="play" size={15} color={planColor} />
        ) : (
          <AppIcon name="calendar-outline" size={17} color={iconColor} />
        )}
      </View>

      {/* Session info */}
      <View style={{ flex: 1, paddingVertical: spacing.md, paddingLeft: spacing.sm, paddingRight: spacing.md, gap: 5 }}>
        <Text
          style={{ fontSize: 18, fontWeight: '700', color: titleColor, lineHeight: 24 }}
          numberOfLines={2}
        >
          {session.title}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <AppIcon name="time" size={14} color={colors.text.secondary} />
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text.secondary }} numberOfLines={1}>
            {formatScheduleLabel(session)} · {session.durationMinutes} min
          </Text>
        </View>

      </View>

      {/* Chevron */}
      {!isFuture && (
        <View style={{ paddingRight: spacing.md }}>
          <AppIcon name="chevron-forward" size={16} color={colors.text.secondary} />
        </View>
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
        paddingBottom: spacing.sm,
        paddingTop: weekNumber > 1 ? spacing.lg : spacing.xs,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: '800',
          color: isCurrentWeek ? color : colors.text.secondary,
          textTransform: 'uppercase',
          letterSpacing: 1.2,
        }}
      >
        Week {weekNumber}
      </Text>
      {isCurrentWeek && (
        <View
          style={{
            backgroundColor: hexToRgba(color, 0.14),
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: radii.pill,
            borderWidth: 1,
            borderColor: hexToRgba(color, 0.25),
          }}
        >
          <Text style={{ color, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>Current</Text>
        </View>
      )}
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border.soft }} />
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
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.bg.surface,
              borderWidth: 1.5,
              borderColor: colors.border.soft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppIcon name="arrow-back" size={17} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text.primary, letterSpacing: -0.4 }}>
            My Plan
          </Text>
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
      {/* Warm gradient blush */}
      <LinearGradient
        colors={[hexToRgba(planColor, 0.07), 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}
        pointerEvents="none"
      />

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
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.bg.surface,
            borderWidth: 1.5,
            borderColor: colors.border.soft,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadows.card,
          }}
        >
          <AppIcon name="arrow-back" size={17} color={colors.text.primary} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 22,
            fontWeight: '800',
            color: colors.text.primary,
            letterSpacing: -0.4,
            flex: 1,
          }}
        >
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
            <PlanHeroCard
              courseTitle={courseTitle}
              completionPct={completionPct}
              durationWeeks={displayPlan.durationWeeks}
              stageNumber={stageNumber}
              completedCount={displayPlan.sessions.filter((s) => s.isCompleted).length}
              totalCount={displayPlan.sessions.length}
              planColor={planColor}
              adaptedCount={adaptedCount}
            />
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
