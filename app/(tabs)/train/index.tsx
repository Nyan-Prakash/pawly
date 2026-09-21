import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { Tag } from '@/components/ui/PillTag';
import { MascotCallout } from '@/components/ui/MascotCallout';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { StreakBadge } from '@/components/ui/StreakBadge';
import { Text } from '@/components/ui/Text';
import { WalkLogModal } from '@/components/shared/WalkLogModal';
import { ActiveCourseCard } from '@/components/train/ActiveCourseCard';
import { HeroSessionCard } from '@/components/train/HeroSessionCard';
import { QuickRepsRow, pickQuickRep } from '@/components/train/QuickRepsRow';
import { QuickWinCard } from '@/components/train/QuickWinCard';
import { WalkGoalRow } from '@/components/train/WalkGoalRow';
import { WeekStrip, type WeekDay, type WeekDayState } from '@/components/train/WeekStrip';
import { colors } from '@/constants/colors';
import { QUICK_WINS, QUICK_WIN_CATEGORIES, type QuickWin } from '@/constants/quickWins';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { haptics } from '@/lib/haptics';
import { MAX_ACTIVE_COURSES } from '@/lib/addCourse';
import {
  clearSessionSnapshot,
  isSnapshotResumable,
  loadSessionSnapshot,
  type SessionSnapshot,
} from '@/lib/sessionPersistence';
import { formatScheduleLabel, getBehaviorLabel, getWalkGoal } from '@/lib/scheduleEngine';
import { useAuthStore } from '@/stores/authStore';
import { useDogStore } from '@/stores/dogStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { usePlanStore, selectPlanSummaries } from '@/stores/planStore';
import { useProgressStore } from '@/stores/progressStore';
import type { Milestone, Plan, PlanSession } from '@/types';
import { guardSessionStart } from '@/lib/proGate';
import { PRO_LOCK_HINT, PRO_LOCK_LABEL, useSessionLock } from '@/hooks/useSessionLock';

// ─────────────────────────────────────────────────────────────────────────────
// Date helpers (local time — session.scheduledDate is a local YYYY-MM-DD)
// ─────────────────────────────────────────────────────────────────────────────

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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

/**
 * Three quick wins for the day. The pick rotates with the calendar date so it
 * is stable across every visit today and different tomorrow.
 */
function pickQuickWins(todayKey: string, count = 3): QuickWin[] {
  const sorted = [...QUICK_WINS].sort((a, b) => a.title.localeCompare(b.title));
  if (sorted.length <= count) return sorted;
  const dayNumber = Number(todayKey.replace(/-/g, ''));
  const offset = dayNumber % sorted.length;
  return Array.from({ length: count }, (_, i) => sorted[(offset + i) % sorted.length]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton — mirrors the real layout so the swap doesn't jump
// ─────────────────────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <View style={{ gap: spacing.xl }}>
      <SkeletonBlock height={296} borderRadius={radii.md} />
      <View style={{ gap: spacing.sm }}>
        <SkeletonBlock height={26} width={120} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {WEEKDAY_LETTERS.map((_, i) => (
            <SkeletonBlock key={i} height={40} width={40} borderRadius={radii.full} />
          ))}
        </View>
      </View>
      <View style={{ gap: spacing.sm }}>
        <SkeletonBlock height={26} width={120} />
        <SkeletonBlock height={156} borderRadius={radii.md} />
      </View>
      <View style={{ gap: spacing.sm }}>
        <SkeletonBlock height={26} width={120} />
        <SkeletonBlock height={104} borderRadius={radii.md} />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick win sheet
// ─────────────────────────────────────────────────────────────────────────────

function QuickWinSheet({ win, onClose }: { win: QuickWin | null; onClose: () => void }) {
  // Keep the last quick win rendered during the close animation so the sheet
  // doesn't blank out while it slides away.
  const [shown, setShown] = useState<QuickWin | null>(win);
  useEffect(() => {
    if (win) setShown(win);
  }, [win]);

  const cat = shown ? QUICK_WIN_CATEGORIES[shown.category] : null;

  return (
    <BottomSheet visible={!!win} onClose={onClose} title={shown?.title}>
      {shown && cat ? (
        <ScrollView contentContainerStyle={{ gap: spacing.xl, paddingBottom: spacing.xl }}>
          <Text variant="caption">
            {cat.label}, {shown.duration}
          </Text>
          <Text variant="body">{shown.instructions}</Text>
          <Button label="Close" onPress={onClose} />
        </ScrollView>
      ) : null}
    </BottomSheet>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Milestone sheet
// ─────────────────────────────────────────────────────────────────────────────

function MilestoneSheet({ milestone, onClose }: { milestone: Milestone | null; onClose: () => void }) {
  const [shown, setShown] = useState<Milestone | null>(milestone);
  useEffect(() => {
    if (milestone) {
      setShown(milestone);
      haptics.success();
    }
  }, [milestone]);

  return (
    <BottomSheet visible={!!milestone} onClose={onClose} title="Milestone reached">
      {shown ? (
        <View style={{ gap: spacing.xl }}>
          <MascotCallout state="celebrating" size={96} style={{ alignSelf: 'flex-start' }} />
          <View style={{ gap: spacing.xs }}>
            <Text variant="h2">{shown.title}</Text>
            <Text variant="body">{shown.description}</Text>
          </View>
          <Button label="Close" onPress={onClose} />
        </View>
      ) : null}
    </BottomSheet>
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
    loadError,
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

  const { sessionStreak, walkLoggedToday, logWalk, fetchProgressData } = useProgressStore();
  const isLocked = useSessionLock();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const fetchInbox = useNotificationStore((s) => s.fetchInbox);
  const hydrateRealtime = useNotificationStore((s) => s.hydrateRealtime);

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

  const hasPlans = activePlanIds.length > 0;
  // A failed fetch with nothing to fall back on. With plans already in the
  // store we keep showing them; the offline line covers the rest.
  const planLoadFailed = !!loadError && !hasPlans;
  const needsDogProfile = !hasDogProfile || !dog?.id;
  const activePlans = activePlanIds.map((id) => plansById[id]).filter((p): p is Plan => p != null);

  const primaryPlan = planSummaries.find((s) => s.isPrimary) ?? planSummaries[0] ?? null;
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
  const heroVariant = heroIsToday ? 'today' : heroIsOverdue ? 'overdue' : 'upcoming';
  const showHero = !!heroSession && !!heroPlan && heroPlan.status === 'active';
  const heroLocked = heroSession ? isLocked(heroSession.planId, heroSession.id) : false;

  // The resumable session takes the card; the recommended session, if it is a
  // different one, drops into "Also today" so it stays one tap away.
  const cardSessionId = resumeTarget?.session.id ?? (showHero ? heroSession?.id : undefined);
  const otherTodaySessions = todaySessions.filter((s) => s.id !== cardSessionId);
  const heroInAlsoToday =
    showHero && heroSession && resumeTarget && heroSession.id !== resumeTarget.session.id
      ? [heroSession, ...otherTodaySessions.filter((s) => s.id !== heroSession.id)]
      : otherTodaySessions;

  const missedSessions = getMissedSessionsAcrossPlans();
  const firstMissed = missedSessions[0] ?? null;
  const nextUpcoming =
    getUpcomingSessionsAcrossPlans(3).find((s) => s.id !== heroSession?.id) ?? null;

  const week = useMemo(() => buildWeek(activePlans, todayKey), [activePlans, todayKey]);
  const quickWins = useMemo(() => pickQuickWins(todayKey), [todayKey]);
  const quickRep = useMemo(() => pickQuickRep(activePlans), [activePlans]);

  const flexibility = primaryPlanFull?.metadata?.flexibility;
  const canReschedule = flexibility !== 'skip';
  const rescheduleLabel = flexibility === 'move_tomorrow' ? 'Move to tomorrow' : 'Move to next slot';

  const resumeLabel = resumable
    ? resumable.state === 'SESSION_REVIEW'
      ? 'All steps done, just needs a quick review'
      : `Step ${Math.min(resumable.currentStepIndex + 1, resumable.totalSteps)} of ${resumable.totalSteps}`
    : undefined;

  const openPlan = (planId: string) => {
    setSelectedPlan(planId);
    router.push('/(tabs)/train/plan');
  };

  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const greeting = (() => {
    const name = dog?.name ?? 'your dog';
    if (planLoadFailed) return `We couldn't fetch the plan. Let's try that again.`;
    if (resumeTarget) return `We left a session half done. Shall we finish it?`;
    if (heroVariant === 'today' && heroSession) return `${heroSession.durationMinutes} minutes with ${name} today. Ready when you are.`;
    if (heroVariant === 'overdue') return `We missed one. No big deal, let's pick it back up.`;
    if (firstMissed) return `One session slipped. Move it and the week is back on track.`;
    if (!hasPlans) return `Let's set up a plan for ${name}.`;
    if (quickRep) return `Nothing due today. A minute of quick reps with ${name} keeps it fresh.`;
    return `Nothing due today. A short walk still counts.`;
  })();

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading && !hasPlans) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
      >
        <PageHeader eyebrow={dateLabel} title={dog?.name ? `${dog.name}'s day` : 'Today'} line="One sec, fetching the plan." mascotState="thinking" />
        <LoadingSkeleton />
      </ScrollView>
    );
  }

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text.secondary} />
        }
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
      >
        <PageHeader
          eyebrow={dateLabel}
          title={dog?.name ? `${dog.name}'s day` : 'Today'}
          line={greeting}
          mascotState={planLoadFailed || resumeTarget || heroVariant === 'overdue' || firstMissed ? 'encouraging' : 'happy'}
        />

        {/* ── Plan didn't load (not the same as having no plan) ── */}
        {planLoadFailed ? (
          <EmptyState
            icon="cloud-offline-outline"
            title="Your plan didn't load"
            subtitle={loadError ?? undefined}
            action={{
              label: 'Try again',
              onPress: () => {
                if (dog?.id) fetchActivePlans(dog.id);
              },
            }}
          />
        ) : null}

        {/* ── No plan ── */}
        {!hasPlans && !planLoadFailed ? (
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
        ) : null}

        {/* ── Today's session (one card) ── */}
        {resumeTarget ? (
          <HeroSessionCard
            session={resumeTarget.session}
            plan={resumeTarget.plan}
            variant="resume"
            resumeLabel={resumeLabel}
            onStart={() =>
              router.push(`/(tabs)/train/session?id=${resumeTarget.session.id}&planId=${resumeTarget.plan.id}`)
            }
            onViewPlan={() => openPlan(resumeTarget.plan.id)}
            onDiscard={() => {
              clearSessionSnapshot().catch(() => {});
              setResumable(null);
            }}
          />
        ) : showHero && heroSession && heroPlan ? (
          <HeroSessionCard
            session={heroSession}
            plan={heroPlan}
            variant={heroVariant}
            canReschedule={canReschedule}
            rescheduleLabel={rescheduleLabel}
            locked={heroLocked}
            onStart={() => {
              if (!guardSessionStart(heroSession.planId, heroSession.id)) return;
              router.push(`/(tabs)/train/session?id=${heroSession.id}&planId=${heroSession.planId}`);
            }}
            onViewPlan={() => openPlan(heroSession.planId)}
            onReschedule={() => rescheduleMissedSession(heroSession.planId, heroSession.id)}
          />
        ) : hasPlans ? (
          <Card>
            <View style={{ gap: spacing.xs }}>
              <Text variant="h2">{firstMissed ? 'One to catch up on' : "You're all caught up"}</Text>
              <Text variant="body" color={colors.text.secondary}>
                {firstMissed
                  ? `${firstMissed.title} was scheduled for ${formatScheduleLabel(firstMissed)}. Move it to keep the week on track.`
                  : 'Nothing due today. Rest is part of the plan.'}
              </Text>
            </View>
            {firstMissed && canReschedule ? (
              <Button
                label={rescheduleLabel}
                onPress={() => rescheduleMissedSession(firstMissed.planId, firstMissed.id)}
                style={{ marginTop: spacing.xl }}
              />
            ) : null}
            {!firstMissed && nextUpcoming ? (
              <View style={{ gap: spacing.xs, marginTop: spacing.lg }}>
                <Text variant="captionStrong">Next session</Text>
                <Text variant="body">{nextUpcoming.title}</Text>
                <Text variant="caption">
                  {formatScheduleLabel(nextUpcoming)}, {nextUpcoming.durationMinutes} min
                </Text>
              </View>
            ) : null}
          </Card>
        ) : null}

        {/* ── This week ── */}
        {hasPlans ? (
          <View>
            <SectionHeader title="This week" />
            <View style={{ gap: spacing.md }}>
              <WeekStrip days={week.days} />
              {sessionStreak > 0 ? (
                <StreakBadge count={sessionStreak} />
              ) : (
                <Text variant="caption">
                  {week.planned > 0 ? `${week.done} of ${week.planned} sessions done this week` : 'No sessions planned this week'}
                </Text>
              )}
            </View>
          </View>
        ) : null}

        {/* ── Also today ── */}
        {heroInAlsoToday.length > 0 || quickRep || walkGoalText || quickWins.length > 0 ? (
          <View>
            <SectionHeader title="Also today" />
            <ListGroup>
              {quickRep ? <QuickRepsRow quickRep={quickRep} /> : null}
              {heroInAlsoToday.map((session) => {
                const locked = isLocked(session.planId, session.id);
                const subtitle = `${session.planCourseTitle ?? getBehaviorLabel(session.planGoal)}, ${session.durationMinutes} min`;
                return (
                  <ListRow
                    key={`${session.planId}_${session.id}`}
                    icon="play-circle-outline"
                    title={session.title}
                    subtitle={subtitle}
                    trailing={locked ? <Tag label="Pro" icon="lock-closed" tone="accent" /> : 'chevron'}
                    accessibilityLabel={locked ? `${session.title}, ${subtitle}, ${PRO_LOCK_LABEL}` : undefined}
                    accessibilityHint={locked ? PRO_LOCK_HINT : 'Starts this session'}
                    onPress={() => {
                      if (!guardSessionStart(session.planId, session.id)) return;
                      router.push(`/(tabs)/train/session?id=${session.id}&planId=${session.planId}`);
                    }}
                  />
                );
              })}
              {walkGoalText ? (
                <WalkGoalRow goalText={walkGoalText} logged={walkLoggedToday} onLog={() => setShowWalkModal(true)} />
              ) : null}
              {quickWins.map((win) => (
                <QuickWinCard key={win.id} win={win} onPress={() => setSelectedWin(win)} />
              ))}
            </ListGroup>
          </View>
        ) : null}

        {/* ── Your courses ── */}
        {hasPlans ? (
          <View>
            <SectionHeader
              title="Your courses"
              action={
                activePlanIds.length < MAX_ACTIVE_COURSES
                  ? { label: 'Add course', onPress: () => router.push('/(tabs)/train/add-course' as never) }
                  : undefined
              }
            />
            <ListGroup>
              {planSummaries.map((summary) => (
                <ActiveCourseCard key={summary.id} plan={summary} onPress={() => openPlan(summary.id)} />
              ))}
            </ListGroup>
          </View>
        ) : null}

        {/* ── Why this schedule (single plan) ── */}
        {activePlanIds.length === 1 && primaryPlanFull?.metadata?.explanation?.length ? (
          <View>
            <SectionHeader title="Why this schedule" />
            <View style={{ gap: spacing.sm }}>
              {primaryPlanFull.metadata.explanation.map((bullet, index) => (
                <Text key={index} variant="body" color={colors.text.secondary}>
                  {bullet}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        {/* ── Tools ── */}
        <View>
          <SectionHeader title="Tools" />
          <ListGroup>
            <ListRow
              icon="calendar-outline"
              iconTone="secondary"
              title="Calendar"
              trailing="chevron"
              onPress={() => router.push('/(tabs)/train/calendar')}
            />
            <ListRow
              icon="radio-button-on-outline"
              iconTone="secondary"
              title="Training tools"
              subtitle="Clicker and whistle"
              trailing="chevron"
              onPress={() => router.push('/(tabs)/train/tools')}
            />
            <ListRow
              icon="notifications-outline"
              iconTone="secondary"
              title="Notifications"
              trailing={unreadCount > 0 ? `${unreadCount} unread` : 'chevron'}
              onPress={() => router.push('/(tabs)/train/notifications')}
            />
          </ListGroup>
        </View>
      </ScrollView>

      {/* ── Sheets ── */}
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

      <MilestoneSheet milestone={newMilestone} onClose={() => setNewMilestone(null)} />
    </>
  );
}
