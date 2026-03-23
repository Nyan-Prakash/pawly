import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { MascotCallout } from '@/components/ui/MascotCallout';
import { PillTag } from '@/components/ui/PillTag';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { Text } from '@/components/ui/Text';
import { WalkLogModal } from '@/components/shared/WalkLogModal';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ActiveCourseCard } from '@/components/train/ActiveCourseCard';
import { colors } from '@/constants/colors';
import { getCourseUiColors, hexToRgba } from '@/constants/courseColors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';
import { useAuthStore } from '@/stores/authStore';
import { useDogStore } from '@/stores/dogStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { usePlanStore, selectPlanSummaries } from '@/stores/planStore';
import { useProgressStore } from '@/stores/progressStore';
import {
  formatDisplayTime,
  getGreeting,
  getWalkGoal,
  getBehaviorLabel,
  formatScheduleLabel,
  isRoundStreakNumber,
  getPlanCompletion,
} from '@/lib/scheduleEngine';
import type { EnrichedPlanSession, Milestone } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Quick Win data (v1 hardcoded)
// ─────────────────────────────────────────────────────────────────────────────

const QUICK_WINS = [
  {
    id: 'sniff_walk',
    emoji: 'search',
    title: 'Sniff Walk',
    duration: '5 min',
    accentColor: '#10B981',
    instructions:
      'Choose a route and let your dog fully lead — wherever their nose goes, you follow. Allow them to sniff every corner, post, and patch of grass for the full duration. No agenda, no cues, no pulling away from smells. This is pure mental enrichment. A 5-minute sniff walk tires a dog as much as a 20-minute regular walk.',
  },
  {
    id: 'find_it',
    emoji: 'search',
    title: 'Find It Game',
    duration: '2 min',
    accentColor: '#8B5CF6',
    instructions:
      'Grab 10 pieces of kibble or small treats. Have your dog sit-stay or have someone hold them. Scatter the treats across the floor (or grass) saying "find it!" in an excited voice. Let them sniff and hunt for every piece. Repeat 3 rounds. This nose work game is mentally exhausting and calming — great before a training session or bedtime.',
  },
  {
    id: 'name_drill',
    emoji: 'flag',
    title: 'Name Recognition',
    duration: '2 min',
    accentColor: '#F59E0B',
    instructions:
      'Grab 10 tiny treats. Stand in a low-distraction space. When your dog is not looking at you, say their name once in a bright tone. The instant they look at you, say "yes!" and toss a treat toward them. Do 10 reps. This 2-minute drill keeps your dog\'s name response sharp and adds daily reinforcement to one of the most critical behaviors in training.',
  },
  {
    id: 'hand_touch',
    emoji: 'hand-left',
    title: 'Hand Touch',
    duration: '3 min',
    accentColor: '#EC4899',
    instructions:
      'Hold your palm flat, facing your dog, about 6 inches from their nose. When they sniff or boop your palm, say "yes!" and treat. After 5 reps, add the cue "touch" just before extending your palm. Practice in 3 different spots in your home. Hand touch is useful for recall, re-direction, focus, and as an emergency interrupt behavior.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Loading Skeleton
// ─────────────────────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <View style={{ padding: spacing.md, gap: spacing.md }}>
      <SkeletonBlock height={32} width="55%" />
      <SkeletonBlock height={200} />
      <SkeletonBlock height={76} />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <SkeletonBlock height={110} style={{ flex: 1 }} />
        <SkeletonBlock height={110} style={{ flex: 1 }} />
        <SkeletonBlock height={110} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick Win Bottom Sheet
// ─────────────────────────────────────────────────────────────────────────────

function QuickWinSheet({
  win,
  visible,
  onClose,
}: {
  win: (typeof QUICK_WINS)[0] | null;
  visible: boolean;
  onClose: () => void;
}) {
  if (!win) return null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <Pressable onPress={() => {}}>
          <View
            style={{
              backgroundColor: colors.bg.surface,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: spacing.lg,
              paddingBottom: spacing.xl + spacing.md,
            }}
          >
            {/* Drag handle */}
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.border.default,
                alignSelf: 'center',
                marginBottom: spacing.md,
              }}
            />
            {/* Icon circle */}
            <View style={{ alignItems: 'center', marginBottom: spacing.sm }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: hexToRgba(win.accentColor, 0.12),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppIcon name={win.emoji as AppIconName} size={32} color={win.accentColor} />
              </View>
            </View>
            <Text variant="h2" style={{ textAlign: 'center', marginBottom: spacing.xs }}>
              {win.title}
            </Text>
            <View style={{ alignSelf: 'center', marginBottom: spacing.md }}>
              <PillTag label={win.duration} variant="gold" size="md" />
            </View>
            <Text
              variant="body"
              color={colors.text.secondary}
              style={{ lineHeight: 26 }}
            >
              {win.instructions}
            </Text>
            <Button
              label="Got it"
              onPress={onClose}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Other-Today Sessions — secondary sessions beyond the recommended one
// ─────────────────────────────────────────────────────────────────────────────

function OtherTodaySessionRow({
  session,
  onPress,
}: {
  session: EnrichedPlanSession;
  onPress: () => void;
}) {
  const courseLabel = session.planCourseTitle ?? getBehaviorLabel(session.planGoal);
  const sessionColors = getCourseUiColors({
    id: session.planId,
    goal: session.planGoal,
    courseTitle: session.planCourseTitle,
  });
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        backgroundColor: colors.bg.surface,
        borderRadius: radii.lg,
        borderWidth: 1.5,
        borderColor: colors.border.soft,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        ...shadows.card,
      }}
    >
      {/* Colored left bar */}
      <View style={{ width: 4, alignSelf: 'stretch', backgroundColor: sessionColors.solid }} />
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: sessionColors.tint,
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: spacing.md,
          marginVertical: spacing.md,
        }}
      >
        <AppIcon name="play" size={14} color={sessionColors.solid} />
      </View>
      <View style={{ flex: 1, paddingVertical: spacing.md, paddingLeft: spacing.sm }}>
        <Text variant="bodyStrong" numberOfLines={1}>{session.title}</Text>
        <Text variant="micro" color={colors.text.secondary}>
          {courseLabel} · {session.durationMinutes} min
        </Text>
      </View>
      <View style={{ paddingRight: spacing.md }}>
        <AppIcon name="chevron-forward" size={16} color={colors.text.secondary} />
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Paw print decoration — for hero card background texture
// ─────────────────────────────────────────────────────────────────────────────

function PawDecor({ x, y, size, opacity, rotate }: { x: number; y: number; size: number; opacity: number; rotate: number }) {
  const s = size;
  return (
    <View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity,
        transform: [{ rotate: `${rotate}deg` }],
      }}
      pointerEvents="none"
    >
      {/* Main pad */}
      <View style={{ width: s, height: s * 0.8, borderRadius: s * 0.4, backgroundColor: 'rgba(255,255,255,0.18)' }} />
      {/* Toe pads */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: -s * 0.1 }}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={{ width: s * 0.28, height: s * 0.28, borderRadius: s * 0.14, backgroundColor: 'rgba(255,255,255,0.18)' }} />
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Today Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function TrainScreen() {
  const { user } = useAuthStore();
  const { dog } = useDogStore();
  const hasDogProfile = useAuthStore((s) => s.hasDogProfile);

  const planStoreState = usePlanStore();
  const {
    isLoading,
    fetchActivePlans,
    refreshPlans,
    activePlanIds,
    plansById,
    todaySessions,
    recommendedTodaySession,
    getMissedSessionsAcrossPlans,
    getUpcomingSessionsAcrossPlans,
    rescheduleMissedSession,
    setSelectedPlan,
  } = planStoreState;

  const livePlanSummaries = selectPlanSummaries(planStoreState);

  const { sessionStreak, walkLoggedToday, logWalk, fetchProgressData } = useProgressStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const fetchInbox = useNotificationStore((s) => s.fetchInbox);
  const hydrateRealtime = useNotificationStore((s) => s.hydrateRealtime);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedWin, setSelectedWin] = useState<(typeof QUICK_WINS)[0] | null>(null);
  const [showWalkModal, setShowWalkModal] = useState(false);
  const [newMilestone, setNewMilestone] = useState<Milestone | null>(null);

  // Subtle bounce animation for mascot
  const mascotBounce = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(mascotBounce, { toValue: -4, duration: 1600, useNativeDriver: true }),
        Animated.timing(mascotBounce, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ])
    ).start();
  }, [mascotBounce]);

  useEffect(() => {
    if (dog?.id) {
      fetchActivePlans(dog.id);
    }
    if (dog?.id && user?.id) {
      fetchProgressData(dog.id, user.id);
    }
  }, [dog?.id, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    fetchInbox(user.id).catch((error) => {
      console.warn('[train] fetchInbox error:', error);
    });
    return hydrateRealtime(user.id);
  }, [fetchInbox, hydrateRealtime, user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (dog?.id) await refreshPlans(dog.id);
    if (dog?.id && user?.id) await fetchProgressData(dog.id, user.id);
    setRefreshing(false);
  }, [refreshPlans, dog?.id, user?.id]);

  async function handleWalkSave(
    quality: 1 | 2 | 3,
    notes?: string,
    durationMinutes?: number
  ) {
    if (!user?.id || !dog?.id) return;
    const milestone = await logWalk(user.id, dog.id, quality, notes, durationMinutes);
    setShowWalkModal(false);
    if (milestone) setNewMilestone(milestone);
  }

  const greeting = getGreeting();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const greetingName = dog?.name ?? 'there';

  const streak = sessionStreak;
  const hasPlans = activePlanIds.length > 0;
  const needsDogProfile = !hasDogProfile || !dog?.id;
  const multiplePlans = activePlanIds.length > 1;

  const primaryPlan = livePlanSummaries.find((s) => s.isPrimary) ?? livePlanSummaries[0] ?? null;
  const primaryPlanFull = primaryPlan ? plansById[primaryPlan.id] ?? null : null;
  const primaryPlanTheme = getCourseUiColors(primaryPlanFull ?? { id: 'primary-course-fallback' });

  const stageNumber = primaryPlanFull
    ? parseInt(primaryPlanFull.currentStage?.match(/\d/)?.[0] ?? '1', 10)
    : 1;

  const walkGoalText = primaryPlanFull
    ? getWalkGoal(
        primaryPlanFull.goal
          .toLowerCase()
          .replace(/ /g, '_')
          .replace("won't_come", 'recall'),
        stageNumber
      )
    : null;


  const isCelebration = isRoundStreakNumber(streak);

  const heroSession = recommendedTodaySession;
  const heroSessionIsToday = heroSession
    ? todaySessions.some((s) => s.id === heroSession.id)
    : false;
  const heroSessionIsOverdue = heroSession && !heroSessionIsToday && !heroSession.isCompleted
    && heroSession.scheduledDate
    ? heroSession.scheduledDate < new Date().toISOString().slice(0, 10)
    : false;
  const heroSessionIsUpcoming = heroSession && !heroSessionIsToday && !heroSessionIsOverdue;

  const otherTodaySessions = todaySessions.filter((s) => s.id !== heroSession?.id);

  const missedSessions = getMissedSessionsAcrossPlans();
  const firstMissedSession = missedSessions[0] ?? null;
  const upcomingSessions = getUpcomingSessionsAcrossPlans(3);
  const nextUpcomingSession = upcomingSessions.find((s) => s.id !== heroSession?.id) ?? upcomingSessions[0] ?? null;

  const heroCompletion = heroSession
    ? (() => {
        const plan = plansById[heroSession.planId];
        return plan ? getPlanCompletion(plan) : (primaryPlan?.completionPercentage ?? 0);
      })()
    : (primaryPlan?.completionPercentage ?? 0);
  const heroPlan = heroSession ? plansById[heroSession.planId] ?? null : null;

  const heroCourseLabel = heroSession
    ? (heroSession.planCourseTitle ?? getBehaviorLabel(heroSession.planGoal))
    : null;

  if (isLoading && !hasPlans) {
    return (
      <SafeScreen>
        <LoadingSkeleton />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      {/* Warm gradient blush behind everything */}
      <LinearGradient
        colors={[hexToRgba(colors.brand.primary, 0.06), 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.35 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 220 }}
        pointerEvents="none"
      />
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
        <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm }}>
          {/* Single row: mascot | greeting (flex) | icons */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Animated.View style={{ transform: [{ translateY: mascotBounce }] }}>
              <MascotCallout
                state={isCelebration ? 'celebrating' : streak >= 3 ? 'encouraging' : 'happy'}
                size={64}
              />
            </Animated.View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '800',
                  color: colors.text.primary,
                  letterSpacing: -0.5,
                  lineHeight: 34,
                }}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                Good {greeting},{' '}
                <Text style={{ fontSize: 28, fontWeight: '800', color: colors.brand.primary, letterSpacing: -0.5, lineHeight: 34 }}>
                  {greetingName}!
                </Text>
              </Text>
              <Text variant="caption" color={colors.text.secondary} style={{ marginTop: 2 }}>
                {today}
              </Text>
            </View>
            {/* Icons — right side */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/(tabs)/train/tools')}
                style={{
                  width: 36, height: 36, borderRadius: 18,
                  backgroundColor: colors.bg.surface,
                  borderWidth: 1.5, borderColor: colors.border.soft,
                  alignItems: 'center', justifyContent: 'center',
                  ...shadows.card,
                }}
              >
                <AppIcon name="flash-outline" size={17} color={colors.text.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/(tabs)/train/calendar')}
                style={{
                  width: 36, height: 36, borderRadius: 18,
                  backgroundColor: colors.bg.surface,
                  borderWidth: 1.5, borderColor: colors.border.soft,
                  alignItems: 'center', justifyContent: 'center',
                  ...shadows.card,
                }}
              >
                <AppIcon name="calendar-outline" size={17} color={colors.text.primary} />
              </TouchableOpacity>
              <NotificationBell
                size={36}
                unreadCount={unreadCount}
                onPress={() => router.push('/(tabs)/train/notifications')}
              />
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing.md, gap: 20 }}>

          {/* ── No plan state ── */}
          {!hasPlans && (
            <View
              style={{
                backgroundColor: colors.bg.surface,
                borderRadius: radii.lg,
                padding: spacing.lg,
                borderWidth: 1.5,
                borderColor: colors.border.soft,
                ...shadows.card,
              }}
            >
              <EmptyState
                icon="paw"
                title={needsDogProfile ? 'Your plan is waiting' : 'No active plan right now'}
                subtitle={
                  needsDogProfile
                    ? "Complete your dog's profile to get a personalized training plan built just for them."
                    : "Your dog's profile is set up, but there isn't an active training plan available right now."
                }
                action={{
                  label: needsDogProfile ? "Set up my dog's profile" : "View my dog's profile",
                  onPress: () =>
                    needsDogProfile
                      ? router.push('/(onboarding)/dog-basics')
                      : router.push('/(tabs)/profile'),
                }}
              />
            </View>
          )}

          {/* ── Nothing due today / all done state ── */}
          {hasPlans && !heroSession && (
            <View
              style={{
                backgroundColor: colors.bg.surface,
                borderRadius: radii.lg,
                borderWidth: 1.5,
                borderColor: colors.border.default,
                ...shadows.card,
              }}
            >
              <EmptyState
                icon="checkmark-circle"
                title="You're all caught up!"
                subtitle="No sessions due today. Come back tomorrow — consistency is how great dogs are made."
              />
              {nextUpcomingSession ? (
                <View
                  style={{
                    backgroundColor: colors.bg.surfaceAlt,
                    marginHorizontal: spacing.lg,
                    marginBottom: spacing.lg,
                    borderRadius: radii.md,
                    padding: spacing.md,
                  }}
                >
                  <Text variant="micro" color={colors.text.secondary}>Next up</Text>
                  <Text variant="bodyStrong" style={{ marginTop: 2 }}>
                    {nextUpcomingSession.title}
                  </Text>
                  <Text variant="caption">
                    {formatScheduleLabel(nextUpcomingSession)} · {nextUpcomingSession.durationMinutes} min
                    {multiplePlans && nextUpcomingSession.planCourseTitle
                      ? ` · ${nextUpcomingSession.planCourseTitle}`
                      : ''}
                  </Text>
                </View>
              ) : null}
            </View>
          )}

          {/* ── Today's session done ── */}
          {primaryPlanFull &&
            primaryPlanFull.status === 'active' &&
            !heroSession && (
              <View
                style={{
                  backgroundColor: colors.bg.surface,
                  borderRadius: radii.lg,
                  borderWidth: 1.5,
                  borderColor: colors.border.default,
                  ...shadows.card,
                }}
              >
                <EmptyState
                  icon="checkmark-circle"
                  title={firstMissedSession ? 'A session needs a new spot' : "You're done for today!"}
                  subtitle={
                    firstMissedSession
                      ? `${firstMissedSession.title} slipped past its scheduled time. You can keep it visible without rewriting the whole plan.`
                      : 'Come back tomorrow — consistency is how great dogs are made.'
                  }
                />
                {firstMissedSession ? (
                  <View style={{ marginHorizontal: spacing.lg, marginBottom: spacing.lg, gap: spacing.sm }}>
                    <View
                      style={{
                        backgroundColor: colors.bg.surfaceAlt,
                        borderRadius: radii.md,
                        padding: spacing.md,
                      }}
                    >
                      <Text variant="micro" color={colors.text.secondary}>Missed session</Text>
                      <Text variant="bodyStrong" style={{ marginTop: 2 }}>
                        {firstMissedSession.title}
                      </Text>
                      <Text variant="caption">{formatScheduleLabel(firstMissedSession)}</Text>
                    </View>
                    {primaryPlanFull.metadata?.flexibility !== 'skip' ? (
                      <Button
                        size="md"
                        label={
                          primaryPlanFull.metadata?.flexibility === 'move_tomorrow'
                            ? 'Move to tomorrow'
                            : 'Move to next slot'
                        }
                        onPress={() => rescheduleMissedSession(firstMissedSession.planId, firstMissedSession.id)}
                      />
                    ) : null}
                  </View>
                ) : nextUpcomingSession ? (
                  <View
                    style={{
                      backgroundColor: colors.bg.surfaceAlt,
                      marginHorizontal: spacing.lg,
                      marginBottom: spacing.lg,
                      borderRadius: radii.md,
                      padding: spacing.md,
                    }}
                  >
                    <Text variant="micro" color={colors.text.secondary}>Next up</Text>
                    <Text variant="bodyStrong" style={{ marginTop: 2 }}>
                      {nextUpcomingSession.title}
                    </Text>
                    <Text variant="caption">
                      {formatScheduleLabel(nextUpcomingSession)} · {nextUpcomingSession.durationMinutes} min
                    </Text>
                  </View>
                ) : null}
              </View>
            )}

          {/* ── TODAY CARD ── */}
          {heroPlan && heroPlan.status === 'active' && heroSession && (() => {
            const uiColors = getCourseUiColors(heroPlan);
            const planColor = uiColors.solid;
            const heroStageNumber = parseInt(heroPlan.currentStage?.match(/\d/)?.[0] ?? '1', 10);

            // ── Upcoming (next session, not due today) ──────────────────────
            if (heroSessionIsUpcoming) {
              return (
                <View
                  style={{
                    backgroundColor: colors.bg.surface,
                    borderRadius: radii.lg,
                    borderWidth: 1.5,
                    borderColor: uiColors.border,
                    overflow: 'hidden',
                    ...shadows.card,
                  }}
                >
                  {/* Top colored band */}
                  <View style={{ height: 4, backgroundColor: planColor }} />

                  <View style={{ padding: spacing.md, gap: spacing.sm }}>
                    {/* Label row */}
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '800',
                        letterSpacing: 1.4,
                        textTransform: 'uppercase',
                        color: planColor,
                      }}
                    >
                      Next Session
                    </Text>

                    {/* Date chip */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: uiColors.tint,
                        alignSelf: 'flex-start',
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: radii.pill,
                      }}
                    >
                      <AppIcon name="calendar-outline" size={13} color={planColor} />
                      <Text style={{ fontSize: 13, fontWeight: '600', color: planColor }}>
                        {formatScheduleLabel(heroSession)}
                      </Text>
                    </View>

                    {/* Title */}
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: '800',
                        color: colors.text.primary,
                        lineHeight: 28,
                        letterSpacing: -0.3,
                      }}
                    >
                      {heroSession.title}
                    </Text>

                    {/* Meta row */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <AppIcon name="time" size={13} color={colors.text.secondary} />
                        <Text style={{ fontSize: 13, color: colors.text.secondary, fontWeight: '500' }}>
                          {heroSession.durationMinutes} min
                        </Text>
                      </View>
                      {heroPlan && !multiplePlans ? (
                        <Text style={{ fontSize: 13, color: colors.text.secondary }}>
                          · {getBehaviorLabel(heroPlan.goal)} · Stage {heroStageNumber}
                        </Text>
                      ) : multiplePlans && heroCourseLabel ? (
                        <View
                          style={{
                            backgroundColor: uiColors.tint,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: radii.pill,
                          }}
                        >
                          <Text style={{ color: planColor, fontSize: 12, fontWeight: '600' }}>
                            {heroCourseLabel}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Progress bar */}
                    <View style={{ gap: 6 }}>
                      <ProgressBar
                        progress={heroCompletion / 100}
                        height={8}
                        color={planColor}
                        trackColor={uiColors.tint}
                      />
                      <Text style={{ fontSize: 12, color: colors.text.secondary, fontWeight: '500' }}>
                        {heroCompletion}% of plan complete
                      </Text>
                    </View>

                    {/* View plan CTA */}
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => {
                        if (heroSession.planId) setSelectedPlan(heroSession.planId);
                        router.push('/(tabs)/train/plan');
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        backgroundColor: uiColors.tint,
                        borderRadius: radii.pill,
                        paddingVertical: spacing.sm,
                        marginTop: spacing.xs,
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '700', color: planColor }}>
                        View full plan
                      </Text>
                      <AppIcon name="chevron-forward" size={14} color={planColor} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }

            // ── Today / Overdue (full gradient hero card) ───────────────────
            return (
              <LinearGradient
                colors={[planColor, hexToRgba(planColor, 0.78)]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: radii.lg, overflow: 'hidden' }}
              >
                {/* Decorative paw prints */}
                <PawDecor x={-10} y={10} size={40} opacity={0.35} rotate={-20} />
                <PawDecor x={260} y={-5} size={32} opacity={0.25} rotate={30} />
                <PawDecor x={220} y={60} size={24} opacity={0.2} rotate={-10} />

                <View style={{ padding: spacing.lg, gap: spacing.sm }}>
                  {/* Label row */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <View
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.22)',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: radii.pill,
                        flex: 0,
                      }}
                    >
                      <Text
                        style={{
                          color: 'rgba(255,255,255,0.95)',
                          fontSize: 11,
                          fontWeight: '800',
                          letterSpacing: 1.4,
                          textTransform: 'uppercase',
                        }}
                      >
                        {heroSessionIsOverdue ? 'Missed Session' : "Today's Session"}
                      </Text>
                    </View>
                  </View>

                  {/* Title */}
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 24,
                      fontWeight: '800',
                      lineHeight: 32,
                      letterSpacing: -0.4,
                    }}
                  >
                    {heroSession.title}
                  </Text>

                  {/* Badges row */}
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: spacing.sm,
                      flexWrap: 'wrap',
                      marginTop: 2,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: radii.pill,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <AppIcon name="time" size={12} color="#fff" />
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
                        {heroSession.durationMinutes} min
                      </Text>
                    </View>

                    {heroSession.scheduledTime ? (
                      <View
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: radii.pill,
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
                          {formatDisplayTime(heroSession.scheduledTime)}
                        </Text>
                      </View>
                    ) : null}

                    {heroPlan && !multiplePlans ? (
                      <View
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: radii.pill,
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
                          {getBehaviorLabel(heroPlan.goal)} · Stage {heroStageNumber}
                        </Text>
                      </View>
                    ) : multiplePlans && heroCourseLabel ? (
                      <View
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: radii.pill,
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
                          {heroCourseLabel}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Progress bar */}
                  <View style={{ marginTop: spacing.xs, gap: 6 }}>
                    <ProgressBar
                      progress={heroCompletion / 100}
                      height={8}
                      color="rgba(255,255,255,0.95)"
                      trackColor="rgba(255,255,255,0.28)"
                    />
                    <Text
                      style={{
                        color: 'rgba(255,255,255,0.85)',
                        fontSize: 12,
                        fontWeight: '600',
                      }}
                    >
                      {heroCompletion}% of plan complete
                    </Text>
                  </View>

                  {/* CTA Button */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push(`/(tabs)/train/session?id=${heroSession.id}&planId=${heroSession.planId}`)}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: radii.pill,
                      paddingVertical: 16,
                      paddingHorizontal: spacing.md,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      marginTop: spacing.sm,
                      minHeight: 56,
                    }}
                  >
                    <Text
                      style={{
                        color: planColor,
                        fontWeight: '800',
                        fontSize: 16,
                        letterSpacing: 0.1,
                      }}
                    >
                      {'Start Session'}
                    </Text>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: hexToRgba(planColor, 0.12),
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AppIcon name="arrow-forward" size={13} color={planColor} />
                    </View>
                  </TouchableOpacity>

                  {/* View full plan link */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      if (heroSession.planId) setSelectedPlan(heroSession.planId);
                      router.push('/(tabs)/train/plan');
                    }}
                    style={{
                      alignItems: 'center',
                      paddingVertical: spacing.xs,
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: 'rgba(255,255,255,0.85)',
                        fontSize: 15,
                        fontWeight: '700',
                      }}
                    >
                      View full plan
                    </Text>
                    <AppIcon name="chevron-forward" size={15} color="rgba(255,255,255,0.85)" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            );
          })()}

          {/* ── Missed session reschedule (when no hero and there are missed sessions) ── */}
          {hasPlans && !heroSession && firstMissedSession && primaryPlanFull?.metadata?.flexibility !== 'skip' && (
            <View style={{ marginHorizontal: spacing.lg, gap: spacing.sm }}>
              <View
                style={{
                  backgroundColor: colors.bg.surfaceAlt,
                  borderRadius: radii.md,
                  padding: spacing.md,
                }}
              >
                <Text variant="micro" color={colors.text.secondary}>Missed session</Text>
                <Text variant="bodyStrong" style={{ marginTop: 2 }}>
                  {firstMissedSession.title}
                </Text>
                <Text variant="caption">{formatScheduleLabel(firstMissedSession)}</Text>
              </View>
              <Button
                size="md"
                label={
                  primaryPlanFull?.metadata?.flexibility === 'move_tomorrow'
                    ? 'Move to tomorrow'
                    : 'Move to next slot'
                }
                onPress={() => rescheduleMissedSession(firstMissedSession.planId, firstMissedSession.id)}
              />
            </View>
          )}

          {/* ── Other sessions today (multi-plan: secondary courses also have sessions today) ── */}
          {hasPlans && otherTodaySessions.length > 0 && (
            <View>
              <SectionHeader title="Also today" style={{ marginBottom: spacing.sm }} />
              <View style={{ gap: spacing.sm }}>
                {otherTodaySessions.map((session) => (
                  <OtherTodaySessionRow
                    key={`${session.planId}_${session.id}`}
                    session={session}
                    onPress={() => router.push(`/(tabs)/train/session?id=${session.id}&planId=${session.planId}`)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* ── Active Courses section ── */}
          {multiplePlans && (
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: spacing.sm,
                }}
              >
                <SectionHeader title="Active Courses" />
                {activePlanIds.length < 2 && (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => router.push('/(tabs)/train/add-course' as never)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      paddingHorizontal: spacing.sm,
                      paddingVertical: 6,
                      borderRadius: radii.pill,
                      backgroundColor: primaryPlanTheme.tint,
                      borderWidth: 1,
                      borderColor: primaryPlanTheme.selectedBorder,
                    }}
                  >
                    <AppIcon name="add-circle" size={14} color={primaryPlanTheme.solid} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: primaryPlanTheme.text }}>
                      Add goal
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={{ gap: spacing.sm }}>
                {livePlanSummaries.map((summary) => (
                  <ActiveCourseCard
                    key={summary.id}
                    plan={summary}
                    onPress={() => {
                      setSelectedPlan(summary.id);
                      router.push('/(tabs)/train/plan');
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          {/* ── Plan explanation (single plan only) ── */}
          {!multiplePlans && primaryPlanFull?.metadata?.explanation?.length ? (
            <View
              style={{
                backgroundColor: colors.bg.surface,
                borderRadius: radii.lg,
                padding: spacing.lg,
                borderWidth: 1.5,
                borderColor: colors.border.soft,
                gap: spacing.xs,
                ...shadows.card,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xs }}>
                <AppIcon name="sparkles" size={15} color={colors.brand.primary} />
                <Text variant="bodyStrong">Why this schedule?</Text>
              </View>
              {primaryPlanFull.metadata.explanation.map((bullet, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, marginTop: spacing.xs }}>
                  <View
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: 3,
                      backgroundColor: colors.brand.primary,
                      marginTop: 8,
                    }}
                  />
                  <Text variant="caption" style={{ flex: 1, lineHeight: 22 }}>
                    {bullet}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* ── Walk Goal Strip ── */}
          {walkGoalText && (
            <View
              style={{
                backgroundColor: colors.bg.surface,
                borderRadius: radii.lg,
                borderWidth: 1.5,
                borderColor: colors.border.soft,
                padding: spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                ...shadows.card,
              }}
            >
              <AppIcon name="walk" size={22} color={colors.brand.secondary} />
              <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color: colors.text.primary, lineHeight: 22 }}>
                {walkGoalText}
              </Text>
              <TouchableOpacity
                activeOpacity={walkLoggedToday ? 1 : 0.8}
                onPress={walkLoggedToday ? undefined : () => setShowWalkModal(true)}
              >
                {walkLoggedToday ? (
                  <AppIcon name="checkmark-circle" size={24} color={colors.brand.primary} />
                ) : (
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.brand.secondary }}>Log</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* ── Quick Wins ── */}
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
              <SectionHeader title="Quick Wins" />
              <Text variant="micro" color={colors.text.secondary}>2–5 min</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.xs }}
            >
              {QUICK_WINS.map((win) => (
                <TouchableOpacity
                  key={win.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedWin(win)}
                  style={{
                    backgroundColor: colors.bg.surface,
                    borderRadius: radii.lg,
                    padding: spacing.md,
                    width: 120,
                    borderWidth: 1.5,
                    borderColor: hexToRgba(win.accentColor, 0.18),
                    alignItems: 'center',
                    gap: spacing.sm,
                    ...shadows.card,
                  }}
                >
                  {/* Icon circle with per-activity color */}
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: hexToRgba(win.accentColor, 0.12),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AppIcon name={win.emoji as AppIconName} size={24} color={win.accentColor} />
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '700',
                      textAlign: 'center',
                      color: colors.text.primary,
                      lineHeight: 18,
                    }}
                    numberOfLines={2}
                  >
                    {win.title}
                  </Text>
                  {/* Duration pill with activity color */}
                  <View
                    style={{
                      backgroundColor: hexToRgba(win.accentColor, 0.1),
                      borderRadius: radii.pill,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: win.accentColor }}>
                      {win.duration}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>


        </View>
      </ScrollView>

      {/* ── Quick Win Sheet ── */}
      <QuickWinSheet
        win={selectedWin}
        visible={!!selectedWin}
        onClose={() => setSelectedWin(null)}
      />

      {/* ── Walk Log Modal ── */}
      {dog && walkGoalText && (
        <WalkLogModal
          visible={showWalkModal}
          dogName={dog.name}
          walkGoalText={walkGoalText}
          onSave={handleWalkSave}
          onSkip={() => setShowWalkModal(false)}
          onClose={() => setShowWalkModal(false)}
        />
      )}

      {/* ── Milestone Celebration ── */}
      {newMilestone && (
        <Modal transparent animationType="fade" onRequestClose={() => setNewMilestone(null)}>
          <Pressable
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.6)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => setNewMilestone(null)}
          >
            <View
              style={{
                backgroundColor: colors.bg.surface,
                borderRadius: radii.lg,
                padding: spacing.xl,
                marginHorizontal: spacing.lg,
                alignItems: 'center',
                gap: spacing.md,
                ...shadows.modal,
              }}
            >
              <AppIcon name={newMilestone.emoji as AppIconName} size={64} color={colors.brand.primary} />
              <Text variant="h2" style={{ textAlign: 'center' }}>
                {newMilestone.title}
              </Text>
              <Text
                variant="body"
                color={colors.text.secondary}
                style={{ textAlign: 'center', lineHeight: 24 }}
              >
                {newMilestone.description}
              </Text>
              <Button
                label="Amazing"
                leftIcon="ribbon"
                onPress={() => setNewMilestone(null)}
                style={{ width: '100%', marginTop: spacing.sm }}
              />
            </View>
          </Pressable>
        </Modal>
      )}
    </SafeScreen>
  );
}
