import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { MascotCallout, type MascotState } from '@/components/ui/MascotCallout';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { Text } from '@/components/ui/Text';
import { WalkLogModal } from '@/components/shared/WalkLogModal';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ActiveCourseCard } from '@/components/train/ActiveCourseCard';
import { HeroSessionCard, type HeroVariant } from '@/components/train/HeroSessionCard';
import { QuickWinCard } from '@/components/train/QuickWinCard';
import { WalkGoalRow } from '@/components/train/WalkGoalRow';
import { StatRow, WeekStrip, type WeekDay, type WeekDayState } from '@/components/train/WeekStrip';
import { colors } from '@/constants/colors';
import { getCourseUiColors } from '@/constants/courseColors';
import { QUICK_WINS, QUICK_WIN_CATEGORIES, mixHex, type QuickWin } from '@/constants/quickWins';
import { radii } from '@/constants/radii';
import { softShadows, tintedShadow } from '@/constants/shadows';
import { spacing } from '@/constants/spacing';
import { useAuthStore } from '@/stores/authStore';
import { useDogStore } from '@/stores/dogStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { usePlanStore, selectPlanSummaries } from '@/stores/planStore';
import { useProgressStore } from '@/stores/progressStore';
import {
  clearSessionSnapshot,
  isSnapshotResumable,
  loadSessionSnapshot,
  type SessionSnapshot,
} from '@/lib/sessionPersistence';
import {
  formatScheduleLabel,
  getBehaviorLabel,
  getPlanCompletion,
  getWalkGoal,
  isRoundStreakNumber,
} from '@/lib/scheduleEngine';
import type { EnrichedPlanSession, Milestone, Plan, PlanSession } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Date helpers (local time — session.scheduledDate is a local YYYY-MM-DD)
// ─────────────────────────────────────────────────────────────────────────────

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Builds Mon–Sun for the current week with a state per day. */
function buildWeek(plans: Plan[], todayKey: string): { days: WeekDay[]; done: number; planned: number } {
  const byDate: Record<string, PlanSession[]> = {};
  for (const plan of plans) {
    for (const s of plan.sessions) {
      if (!s.scheduledDate) continue;
      (byDate[s.scheduledDate] ??= []).push(s);
    }
  }

  const today = new Date();
  const offsetToMonday = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - offsetToMonday);

  let done = 0;
  let planned = 0;
  const days: WeekDay[] = [];

  for (let i = 0; i < 7; i += 1) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = toDateKey(d);
    const sessions = byDate[key] ?? [];
    const isToday = key === todayKey;
    const isPast = key < todayKey;

    let state: WeekDayState = 'none';
    if (sessions.length > 0) {
      planned += sessions.length;
      const completed = sessions.filter((s) => s.isCompleted).length;
      done += completed;
      const allDone = completed === sessions.length;
      if (isToday) state = allDone ? 'todayDone' : 'today';
      else if (isPast) state = allDone ? 'done' : 'missed';
      else state = 'scheduled';
    } else if (isToday) {
      state = 'today';
    }

    days.push({ key, label: WEEKDAY_LETTERS[i], dayNumber: d.getDate(), state });
  }

  return { days, done, planned };
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton — mirrors the real layout so the swap doesn't jump
// ─────────────────────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md, gap: spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ gap: spacing.sm }}>
          <SkeletonBlock height={14} width={120} />
          <SkeletonBlock height={28} width={180} />
        </View>
        <SkeletonBlock height={44} width={44} style={{ borderRadius: 22 }} />
      </View>
      <SkeletonBlock height={248} style={{ borderRadius: radii.lg }} />
      <SkeletonBlock height={164} style={{ borderRadius: radii.lg }} />
      <SkeletonBlock height={76} style={{ borderRadius: radii.lg }} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick Win sheet
// ─────────────────────────────────────────────────────────────────────────────

function QuickWinSheet({ win, onClose }: { win: QuickWin | null; onClose: () => void }) {
  // Keep the last drill rendered during the close animation so the panel
  // doesn't blank out while it slides away.
  const [shown, setShown] = useState<QuickWin | null>(win);
  useEffect(() => {
    if (win) setShown(win);
  }, [win]);

  const cat = shown ? QUICK_WIN_CATEGORIES[shown.category] : null;

  return (
    <BottomSheet visible={!!win} onClose={onClose}>
      {shown && cat ? (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: mixHex(colors.bg.surface, cat.color, 0.16),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppIcon name={shown.icon} size={26} color={cat.color} />
            </View>
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Text variant="h2" style={{ letterSpacing: -0.4 }}>{shown.title}</Text>
              <Text variant="caption" style={{ fontWeight: '700', color: cat.color }}>
                {cat.label} · {shown.duration}
              </Text>
            </View>
          </View>
          <Text
            variant="body"
            style={{ color: colors.text.secondary, lineHeight: 26, marginTop: spacing.lg }}
          >
            {shown.instructions}
          </Text>
          <Button label="Got it" size="lg" onPress={onClose} style={{ marginTop: spacing.lg }} />
        </>
      ) : null}
    </BottomSheet>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Small pieces
// ─────────────────────────────────────────────────────────────────────────────

function SectionTitle({
  title,
  meta,
  action,
}: {
  title: string;
  meta?: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
      }}
    >
      <Text variant="h2" style={{ letterSpacing: -0.4 }}>{title}</Text>
      {action ? (
        <Pressable onPress={action.onPress} hitSlop={12}>
          <Text variant="caption" style={{ fontWeight: '700', color: colors.brand.primary }}>
            {action.label}
          </Text>
        </Pressable>
      ) : meta ? (
        <Text variant="caption" style={{ color: colors.text.secondary }}>{meta}</Text>
      ) : null}
    </View>
  );
}

function Card({ children, padded = true }: { children: React.ReactNode; padded?: boolean }) {
  return (
    <View
      style={{
        backgroundColor: colors.bg.surface,
        borderRadius: radii.lg,
        padding: padded ? spacing.lg : 0,
        ...softShadows.card,
      }}
    >
      {children}
    </View>
  );
}

/** Quiet, borderless surface for notes that shouldn't compete with cards. */
function SoftNote({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: colors.bg.sand, borderRadius: radii.lg, padding: spacing.lg }}>
      {children}
    </View>
  );
}

function SecondaryRow({
  session,
  onPress,
}: {
  session: EnrichedPlanSession;
  onPress: () => void;
}) {
  const theme = getCourseUiColors({
    id: session.planId,
    goal: session.planGoal,
    courseTitle: session.planCourseTitle,
  });
  const courseLabel = session.planCourseTitle ?? getBehaviorLabel(session.planGoal);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: colors.bg.surface,
        borderRadius: radii.lg,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        ...softShadows.card,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: theme.tint,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppIcon name="play" size={18} color={theme.solid} />
      </View>
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Text variant="bodyStrong" numberOfLines={1} style={{ fontWeight: '700' }}>
          {session.title}
        </Text>
        <Text variant="caption" style={{ color: colors.text.secondary }}>
          {courseLabel} · {session.durationMinutes} min
        </Text>
      </View>
      <AppIcon name="chevron-forward" size={18} color={colors.text.secondary} />
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Resume card
// ─────────────────────────────────────────────────────────────────────────────

function ResumeSessionCard({
  snapshot,
  planSession,
  plan,
  onResume,
  onDiscard,
}: {
  snapshot: SessionSnapshot;
  planSession: PlanSession;
  plan: Plan;
  onResume: () => void;
  onDiscard: () => void;
}) {
  const theme = getCourseUiColors(plan);
  const stepLabel =
    snapshot.state === 'SESSION_REVIEW'
      ? 'All steps done — just needs a quick review'
      : `Step ${Math.min(snapshot.currentStepIndex + 1, snapshot.totalSteps)} of ${snapshot.totalSteps}`;

  return (
    <View
      style={{
        backgroundColor: theme.tint,
        borderRadius: radii.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: theme.selectedBorder,
        gap: spacing.md,
      }}
      accessibilityRole="summary"
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <AppIcon name="play-circle" size={20} color={theme.text} />
        <Text variant="caption" style={{ fontWeight: '700', color: theme.text }}>
          Pick up where you left off
        </Text>
      </View>
      <View>
        <Text variant="h3" numberOfLines={2}>{planSession.title || snapshot.protocolTitle}</Text>
        <Text variant="caption" style={{ color: colors.text.secondary, marginTop: spacing.xs }}>
          {stepLabel}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Button label="Resume" size="md" leftIcon="play" onPress={onResume} />
        </View>
        <TouchableOpacity onPress={onDiscard} hitSlop={8} accessibilityRole="button" accessibilityLabel="Discard unfinished session">
          <Text variant="caption" style={{ color: colors.text.secondary, fontWeight: '600' }}>Discard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Today screen
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
  const planSummaries = selectPlanSummaries(planStoreState);

  const { sessionStreak, totalSessionsCompleted, walkLoggedToday, logWalk, fetchProgressData } =
    useProgressStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const fetchInbox = useNotificationStore((s) => s.fetchInbox);
  const hydrateRealtime = useNotificationStore((s) => s.hydrateRealtime);

  const shuffledWins = useMemo(() => [...QUICK_WINS].sort(() => Math.random() - 0.5), []);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedWin, setSelectedWin] = useState<QuickWin | null>(null);
  const [showWalkModal, setShowWalkModal] = useState(false);
  const [newMilestone, setNewMilestone] = useState<Milestone | null>(null);
  const [resumable, setResumable] = useState<SessionSnapshot | null>(null);

  // An interrupted session (app killed mid-training) can be picked back up.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      loadSessionSnapshot().then((snap) => {
        if (cancelled) return;
        setResumable(snap && isSnapshotResumable(snap) ? snap : null);
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  useEffect(() => {
    if (dog?.id) fetchActivePlans(dog.id);
    if (dog?.id && user?.id) fetchProgressData(dog.id, user.id);
  }, [dog?.id, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    fetchInbox(user.id).catch((error) => console.warn('[train] fetchInbox error:', error));
    return hydrateRealtime(user.id);
  }, [fetchInbox, hydrateRealtime, user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (dog?.id) await refreshPlans(dog.id);
    if (dog?.id && user?.id) await fetchProgressData(dog.id, user.id);
    setRefreshing(false);
  }, [refreshPlans, fetchProgressData, dog?.id, user?.id]);

  async function handleWalkSave(quality: 1 | 2 | 3, notes?: string, durationMinutes?: number) {
    if (!user?.id || !dog?.id) return;
    const milestone = await logWalk(user.id, dog.id, quality, notes, durationMinutes);
    setShowWalkModal(false);
    if (milestone) setNewMilestone(milestone);
  }

  // ── Derived state ──────────────────────────────────────────────────────────

  const todayKey = toDateKey(new Date());
  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const hasPlans = activePlanIds.length > 0;
  const needsDogProfile = !hasDogProfile || !dog?.id;
  const multiplePlans = activePlanIds.length > 1;
  const activePlans = activePlanIds.map((id) => plansById[id]).filter((p): p is Plan => p != null);

  const primaryPlan =
    planSummaries.find((s) => s.isPrimary) ?? planSummaries[0] ?? null;
  const primaryPlanFull = primaryPlan ? plansById[primaryPlan.id] ?? null : null;

  const stageNumber = primaryPlanFull
    ? parseInt(primaryPlanFull.currentStage?.match(/\d/)?.[0] ?? '1', 10)
    : 1;
  const walkGoalText = primaryPlanFull
    ? getWalkGoal(
        primaryPlanFull.goal.toLowerCase().replace(/ /g, '_').replace("won't_come", 'recall'),
        stageNumber,
      )
    : null;

  const streak = sessionStreak;
  const isCelebration = isRoundStreakNumber(streak);
  const mascotState: MascotState = isCelebration
    ? 'celebrating'
    : streak >= 3
      ? 'encouraging'
      : 'happy';

  // Only offer resume when the snapshot still points at a live, unfinished session.
  const resumeTarget = useMemo(() => {
    if (!resumable) return null;
    for (const plan of activePlans) {
      const session = plan.sessions.find((s) => s.id === resumable.sessionId);
      if (session && !session.isCompleted) return { plan, session };
    }
    return null;
  }, [resumable, activePlans]);

  const heroSession = recommendedTodaySession;
  const heroPlan = heroSession ? plansById[heroSession.planId] ?? null : null;
  const heroIsToday = heroSession ? todaySessions.some((s) => s.id === heroSession.id) : false;
  const heroIsOverdue =
    !!heroSession && !heroIsToday && !heroSession.isCompleted && !!heroSession.scheduledDate
      ? heroSession.scheduledDate < todayKey
      : false;
  const heroVariant: HeroVariant = heroIsToday ? 'today' : heroIsOverdue ? 'overdue' : 'upcoming';
  const heroCompletion = heroPlan ? getPlanCompletion(heroPlan) : 0;

  const otherTodaySessions = todaySessions.filter((s) => s.id !== heroSession?.id);
  const missedSessions = getMissedSessionsAcrossPlans();
  const firstMissed = missedSessions[0] ?? null;
  const nextUpcoming =
    getUpcomingSessionsAcrossPlans(3).find((s) => s.id !== heroSession?.id) ?? null;

  const week = useMemo(() => buildWeek(activePlans, todayKey), [activePlans, todayKey]);

  const flexibility = primaryPlanFull?.metadata?.flexibility;
  const canReschedule = flexibility !== 'skip';
  const rescheduleLabel = flexibility === 'move_tomorrow' ? 'Move to tomorrow' : 'Move to next slot';

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading && !hasPlans) {
    return (
      <SafeScreen>
        <LoadingSkeleton />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand.primary} />
        }
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingTop: spacing.md,
          paddingBottom: spacing.xxl * 2 + spacing.lg, // clears the floating tab bar
          gap: spacing.lg,
        }}
      >
        {/* ── Header ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Text variant="caption" style={{ color: colors.text.secondary, fontWeight: '600' }}>
              {dateLabel}
            </Text>
            <Text variant="h1" style={{ letterSpacing: -0.6, lineHeight: 34 }} numberOfLines={1}>
              {getTimeGreeting()}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <NotificationBell
              size={44}
              unreadCount={unreadCount}
              onPress={() => router.push('/(tabs)/train/notifications')}
            />
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile')}
              hitSlop={4}
              activeOpacity={0.8}
            >
              {dog?.avatarUrl ? (
                <Image
                  source={{ uri: dog.avatarUrl }}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    borderWidth: 2,
                    borderColor: colors.bg.surface,
                    ...softShadows.card,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: colors.bg.sand,
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <MascotCallout state="happy" size={40} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── No plan ── */}
        {!hasPlans ? (
          <Card>
            <EmptyState
              mascotState="waiting"
              title={needsDogProfile ? 'Your plan is waiting' : 'No active plan right now'}
              subtitle={
                needsDogProfile
                  ? "Finish your dog's profile and we'll build a training plan around them."
                  : "Your dog's profile is set up, but there isn't an active plan yet."
              }
              action={{
                label: needsDogProfile ? "Set up my dog's profile" : 'View profile',
                onPress: () =>
                  needsDogProfile
                    ? router.push('/(onboarding)/dog-basics')
                    : router.push('/(tabs)/profile'),
              }}
            />
          </Card>
        ) : null}

        {/* ── Resume interrupted session ── */}
        {resumable && resumeTarget ? (
          <ResumeSessionCard
            snapshot={resumable}
            planSession={resumeTarget.session}
            plan={resumeTarget.plan}
            onResume={() =>
              router.push(`/(tabs)/train/session?id=${resumable.sessionId}&planId=${resumeTarget.plan.id}`)
            }
            onDiscard={() => {
              clearSessionSnapshot().catch(() => {});
              setResumable(null);
            }}
          />
        ) : null}

        {/* ── Hero ── */}
        {heroSession && heroPlan && heroPlan.status === 'active' ? (
          <HeroSessionCard
            session={heroSession}
            plan={heroPlan}
            variant={heroVariant}
            completion={heroCompletion}
            mascotState={mascotState}
            canReschedule={canReschedule}
            onStart={() =>
              router.push(`/(tabs)/train/session?id=${heroSession.id}&planId=${heroSession.planId}`)
            }
            onViewPlan={() => {
              setSelectedPlan(heroSession.planId);
              router.push('/(tabs)/train/plan');
            }}
            onReschedule={() => rescheduleMissedSession(heroSession.planId, heroSession.id)}
          />
        ) : null}

        {/* ── All done / nothing due ── */}
        {hasPlans && !heroSession ? (
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Text variant="h2" style={{ letterSpacing: -0.4 }}>
                  {firstMissed ? 'One to catch up on' : "You're all caught up"}
                </Text>
                <Text variant="body" style={{ color: colors.text.secondary, lineHeight: 22 }}>
                  {firstMissed
                    ? `${firstMissed.title} slipped past its slot — move it and keep the streak alive.`
                    : 'Nothing due today. Rest is part of the plan.'}
                </Text>
              </View>
              <MascotCallout state={firstMissed ? 'thinking' : 'celebrating'} size={72} />
            </View>

            {firstMissed ? (
              <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
                <View style={{ backgroundColor: colors.bg.sand, borderRadius: radii.md, padding: spacing.md }}>
                  <Text variant="micro" style={{ color: colors.text.secondary, fontWeight: '600' }}>
                    Missed
                  </Text>
                  <Text variant="bodyStrong" style={{ marginTop: spacing.xs, fontWeight: '700' }}>
                    {firstMissed.title}
                  </Text>
                  <Text variant="caption" style={{ color: colors.text.secondary }}>
                    {formatScheduleLabel(firstMissed)}
                  </Text>
                </View>
                {canReschedule ? (
                  <Button
                    label={rescheduleLabel}
                    size="lg"
                    onPress={() => rescheduleMissedSession(firstMissed.planId, firstMissed.id)}
                  />
                ) : null}
              </View>
            ) : nextUpcoming ? (
              <View
                style={{
                  marginTop: spacing.lg,
                  backgroundColor: colors.bg.sand,
                  borderRadius: radii.md,
                  padding: spacing.md,
                }}
              >
                <Text variant="micro" style={{ color: colors.text.secondary, fontWeight: '600' }}>
                  Next up
                </Text>
                <Text variant="bodyStrong" style={{ marginTop: spacing.xs, fontWeight: '700' }}>
                  {nextUpcoming.title}
                </Text>
                <Text variant="caption" style={{ color: colors.text.secondary }}>
                  {formatScheduleLabel(nextUpcoming)} · {nextUpcoming.durationMinutes} min
                </Text>
              </View>
            ) : null}
          </Card>
        ) : null}

        {/* ── This week ── */}
        {hasPlans ? (
          <View>
            <SectionTitle
              title="This week"
              action={{ label: 'Calendar', onPress: () => router.push('/(tabs)/train/calendar') }}
            />
            <Card>
              <WeekStrip days={week.days} />
              <StatRow
                streak={streak}
                thisWeekDone={week.done}
                thisWeekPlanned={week.planned}
                total={totalSessionsCompleted}
              />
            </Card>
          </View>
        ) : null}

        {/* ── Also today ── */}
        {otherTodaySessions.length > 0 ? (
          <View>
            <SectionTitle title="Also today" />
            <View style={{ gap: spacing.sm }}>
              {otherTodaySessions.map((session) => (
                <SecondaryRow
                  key={`${session.planId}_${session.id}`}
                  session={session}
                  onPress={() =>
                    router.push(`/(tabs)/train/session?id=${session.id}&planId=${session.planId}`)
                  }
                />
              ))}
            </View>
          </View>
        ) : null}

        {/* ── Walk ── */}
        {walkGoalText ? (
          <WalkGoalRow goalText={walkGoalText} logged={walkLoggedToday} onLog={() => setShowWalkModal(true)} />
        ) : null}

        {/* ── Quick wins ── */}
        <View>
          <SectionTitle
            title="Quick wins"
            action={{ label: 'All tools', onPress: () => router.push('/(tabs)/train/tools') }}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.md, paddingVertical: spacing.xs }}
            style={{ marginHorizontal: -spacing.md, paddingLeft: spacing.md }}
          >
            {shuffledWins.map((win) => (
              <QuickWinCard key={win.id} win={win} onPress={() => setSelectedWin(win)} />
            ))}
          </ScrollView>
        </View>

        {/* ── Courses (multi-plan) ── */}
        {multiplePlans ? (
          <View>
            <SectionTitle
              title="Your courses"
              action={
                activePlanIds.length < 2
                  ? { label: 'Add goal', onPress: () => router.push('/(tabs)/train/add-course' as never) }
                  : undefined
              }
            />
            <View style={{ gap: spacing.sm }}>
              {planSummaries.map((summary) => (
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
        ) : null}

        {/* ── Why this schedule (single plan) ── */}
        {!multiplePlans && primaryPlanFull?.metadata?.explanation?.length ? (
          <SoftNote>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
              <AppIcon name="sparkles" size={16} color={colors.brand.primary} />
              <Text variant="bodyStrong" style={{ fontWeight: '700' }}>Why this schedule</Text>
            </View>
            <View style={{ gap: spacing.sm }}>
              {primaryPlanFull.metadata.explanation.map((bullet, index) => (
                <View key={index} style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <Text variant="caption" style={{ color: colors.text.secondary, lineHeight: 22 }}>·</Text>
                  <Text variant="caption" style={{ flex: 1, color: colors.text.secondary, lineHeight: 22 }}>
                    {bullet}
                  </Text>
                </View>
              ))}
            </View>
          </SoftNote>
        ) : null}
      </ScrollView>

      {/* ── Sheets & modals ── */}
      <QuickWinSheet win={selectedWin} onClose={() => setSelectedWin(null)} />

      {dog && walkGoalText ? (
        <WalkLogModal
          visible={showWalkModal}
          dogName={dog.name}
          walkGoalText={walkGoalText}
          onSave={handleWalkSave}
          onSkip={() => setShowWalkModal(false)}
          onClose={() => setShowWalkModal(false)}
        />
      ) : null}

      {newMilestone ? (
        <Modal transparent animationType="fade" onRequestClose={() => setNewMilestone(null)}>
          <Pressable
            style={{
              flex: 1,
              backgroundColor: 'rgba(15,23,42,0.55)',
              alignItems: 'center',
              justifyContent: 'center',
              padding: spacing.lg,
            }}
            onPress={() => setNewMilestone(null)}
          >
            <Pressable onPress={() => {}} style={{ width: '100%' }}>
              <View
                style={{
                  backgroundColor: colors.bg.surface,
                  borderRadius: radii.lg,
                  padding: spacing.xl,
                  alignItems: 'center',
                  gap: spacing.md,
                  ...tintedShadow('#0F172A', 'lifted'),
                }}
              >
                <MascotCallout state="celebrating" size={96} />
                <AppIcon name={newMilestone.emoji as AppIconName} size={32} color={colors.brand.secondary} />
                <Text variant="h2" style={{ textAlign: 'center', letterSpacing: -0.4 }}>
                  {newMilestone.title}
                </Text>
                <Text
                  variant="body"
                  style={{ textAlign: 'center', lineHeight: 24, color: colors.text.secondary }}
                >
                  {newMilestone.description}
                </Text>
                <Button
                  label="Amazing"
                  size="lg"
                  leftIcon="ribbon"
                  onPress={() => setNewMilestone(null)}
                  style={{ width: '100%', marginTop: spacing.sm }}
                />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </SafeScreen>
  );
}
