import { useCallback, useEffect, useState } from 'react';
import {
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
import { PillTag } from '@/components/ui/PillTag';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { StreakBadge } from '@/components/ui/StreakBadge';
import { Text } from '@/components/ui/Text';
import { WalkLogModal } from '@/components/shared/WalkLogModal';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';
import { useAuthStore } from '@/stores/authStore';
import { useDogStore } from '@/stores/dogStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { usePlanStore } from '@/stores/planStore';
import { useProgressStore } from '@/stores/progressStore';
import {
  formatDisplayTime,
  getGreeting,
  getWalkGoal,
  getNextMilestone,
  getBehaviorLabel,
  formatScheduleLabel,
  isRoundStreakNumber,
} from '@/lib/scheduleEngine';
import type { Milestone } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Quick Win data (v1 hardcoded)
// ─────────────────────────────────────────────────────────────────────────────

const QUICK_WINS = [
  {
    id: 'sniff_walk',
    emoji: 'search',
    title: 'Sniff Walk',
    duration: '5 min',
    instructions:
      'Choose a route and let your dog fully lead — wherever their nose goes, you follow. Allow them to sniff every corner, post, and patch of grass for the full duration. No agenda, no cues, no pulling away from smells. This is pure mental enrichment. A 5-minute sniff walk tires a dog as much as a 20-minute regular walk.',
  },
  {
    id: 'find_it',
    emoji: 'search',
    title: 'Find It Game',
    duration: '2 min',
    instructions:
      'Grab 10 pieces of kibble or small treats. Have your dog sit-stay or have someone hold them. Scatter the treats across the floor (or grass) saying "find it!" in an excited voice. Let them sniff and hunt for every piece. Repeat 3 rounds. This nose work game is mentally exhausting and calming — great before a training session or bedtime.',
  },
  {
    id: 'name_drill',
    emoji: 'flag',
    title: 'Name Recognition',
    duration: '2 min',
    instructions:
      'Grab 10 tiny treats. Stand in a low-distraction space. When your dog is not looking at you, say their name once in a bright tone. The instant they look at you, say "yes!" and toss a treat toward them. Do 10 reps. This 2-minute drill keeps your dog\'s name response sharp and adds daily reinforcement to one of the most critical behaviors in training.',
  },
  {
    id: 'hand_touch',
    emoji: 'hand-left',
    title: 'Hand Touch',
    duration: '3 min',
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
              borderTopLeftRadius: radii.lg,
              borderTopRightRadius: radii.lg,
              padding: spacing.lg,
              paddingBottom: spacing.xl + spacing.md,
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
                marginBottom: spacing.md,
              }}
            />
            <View style={{ alignItems: 'center', marginBottom: spacing.sm }}>
              <AppIcon name={win.emoji as AppIconName} size={40} color={colors.brand.primary} />
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
              style={{ lineHeight: 24 }}
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
// Main Today Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function TrainScreen() {
  const { user } = useAuthStore();
  const { dog } = useDogStore();
  const hasDogProfile = useAuthStore((s) => s.hasDogProfile);
  const { activePlan, todaySession, completionPercentage, isLoading, fetchActivePlan, refreshPlan } =
    usePlanStore();
  const getUpcomingPlanSessions = usePlanStore((s) => s.getUpcomingSessions);
  const getMissedPlanSessions = usePlanStore((s) => s.getMissedScheduledSessions);
  const reschedulePlanSession = usePlanStore((s) => s.rescheduleMissedSession);
  const { sessionStreak, walkLoggedToday, logWalk, fetchProgressData } = useProgressStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const fetchInbox = useNotificationStore((s) => s.fetchInbox);
  const hydrateRealtime = useNotificationStore((s) => s.hydrateRealtime);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedWin, setSelectedWin] = useState<(typeof QUICK_WINS)[0] | null>(null);
  const [showWalkModal, setShowWalkModal] = useState(false);
  const [newMilestone, setNewMilestone] = useState<Milestone | null>(null);

  useEffect(() => {
    if (dog?.id) {
      fetchActivePlan(dog.id);
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
    await refreshPlan();
    if (dog?.id && user?.id) await fetchProgressData(dog.id, user.id);
    setRefreshing(false);
  }, [refreshPlan, dog?.id, user?.id]);

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
  const greetingText = `Good ${greeting}, ${dog?.name ?? 'there'}!`;

  const streak = sessionStreak;
  const completedCount = activePlan
    ? activePlan.sessions.filter((s) => s.isCompleted).length
    : 0;
  const needsDogProfile = !hasDogProfile || !dog?.id;

  const stageNumber = activePlan
    ? parseInt(activePlan.currentStage?.match(/\d/)?.[0] ?? '1', 10)
    : 1;

  const walkGoalText = activePlan
    ? getWalkGoal(
        activePlan.goal
          .toLowerCase()
          .replace(/ /g, '_')
          .replace("won't_come", 'recall'),
        stageNumber
      )
    : null;

  const milestoneText = getNextMilestone(completedCount);
  const isCelebration = isRoundStreakNumber(streak);
  const upcomingSessions = getUpcomingPlanSessions(3);
  const nextUpcomingSession = upcomingSessions[0] && upcomingSessions[0].id === todaySession?.id
    ? upcomingSessions[1] ?? null
    : upcomingSessions[0] ?? null;
  const missedSessions = getMissedPlanSessions();
  const firstMissedSession = missedSessions[0] ?? null;

  if (isLoading && !activePlan) {
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
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.md,
            paddingTop: spacing.md,
            paddingBottom: spacing.sm,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text variant="h2">{greetingText}</Text>
            <Text variant="micro" color={colors.text.secondary} style={{ marginTop: 2 }}>
              {today}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <NotificationBell
              unreadCount={unreadCount}
              onPress={() => router.push('/(tabs)/train/notifications')}
            />
            <StreakBadge count={streak} size="md" />

            {/* Dog avatar */}
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.mascot.fur + '33',
                borderWidth: 2,
                borderColor: colors.mascot.fur,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppIcon name="paw" size={22} color={colors.mascot.fur} />
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing.md, gap: spacing.md }}>

          {/* ── No plan state ── */}
          {!activePlan && (
            <View
              style={{
                backgroundColor: colors.bg.surface,
                borderRadius: radii.lg,
                padding: spacing.lg,
                borderWidth: 1,
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
                  label: needsDogProfile ? 'Set up my dog\'s profile' : 'View my dog\'s profile',
                  onPress: () =>
                    needsDogProfile
                      ? router.push('/(onboarding)/dog-basics')
                      : router.push('/(tabs)/profile'),
                }}
              />
            </View>
          )}

          {/* ── Plan complete state ── */}
          {activePlan && activePlan.status === 'completed' && (
            <View
              style={{
                backgroundColor: '#DCFCE7',
                borderRadius: radii.lg,
                borderWidth: 1,
                borderColor: colors.brand.primary + '40',
              }}
            >
              <EmptyState
                icon="ribbon"
                title="You've finished your plan!"
                subtitle={`Incredible work. ${dog?.name} is lucky to have such a dedicated owner.`}
                action={{
                  label: 'Ready for the next challenge',
                  onPress: () => {},
                }}
              />
            </View>
          )}

          {/* ── Today's session done ── */}
          {activePlan &&
            activePlan.status === 'active' &&
            !todaySession && (
              <View
                style={{
                  backgroundColor: colors.bg.surface,
                  borderRadius: radii.lg,
                  borderWidth: 1,
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
                    {activePlan.metadata?.flexibility !== 'skip' ? (
                      <Button
                        size="md"
                        label={
                          activePlan.metadata?.flexibility === 'move_tomorrow'
                            ? 'Move to tomorrow'
                            : 'Move to next slot'
                        }
                        onPress={() => reschedulePlanSession(firstMissedSession.id)}
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
          {activePlan && activePlan.status === 'active' && todaySession && (
            <LinearGradient
              colors={['#22C55E', '#16A34A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: radii.lg, overflow: 'hidden' }}
            >
              <View style={{ padding: spacing.lg, gap: spacing.sm }}>
                {/* Label */}
                <Text
                  style={{
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: 11,
                    fontWeight: '700',
                    letterSpacing: 1.4,
                    textTransform: 'uppercase',
                  }}
                >
                  Today's Session
                </Text>

                {/* Title */}
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 22,
                    fontWeight: '700',
                    lineHeight: 30,
                  }}
                >
                  {todaySession.title}
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
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                      {todaySession.durationMinutes} min
                    </Text>
                  </View>

                  {todaySession.scheduledTime ? (
                    <View
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: radii.pill,
                      }}
                    >
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                        {formatDisplayTime(todaySession.scheduledTime)}
                      </Text>
                    </View>
                  ) : null}

                  <View
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: radii.pill,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                      {getBehaviorLabel(activePlan.goal)} · Stage {stageNumber}
                    </Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={{ marginTop: spacing.xs, gap: 4 }}>
                  <ProgressBar
                    progress={completionPercentage / 100}
                    height={4}
                    color="rgba(255,255,255,0.9)"
                    trackColor="rgba(255,255,255,0.25)"
                  />
                  <Text
                    style={{
                      color: 'rgba(255,255,255,0.65)',
                      fontSize: 11,
                    }}
                  >
                    {completionPercentage}% of plan complete
                  </Text>
                </View>

                {/* CTA Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push(`/(tabs)/train/session?id=${todaySession.id}`)}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: radii.pill,
                    padding: spacing.md,
                    alignItems: 'center',
                    marginTop: spacing.sm,
                    minHeight: 56,
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: colors.brand.primary,
                      fontWeight: '700',
                      fontSize: 16,
                    }}
                  >
                    Start Session
                  </Text>
                </TouchableOpacity>

                {/* View full plan link */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push('/(tabs)/train/plan')}
                  style={{ alignItems: 'center', paddingVertical: spacing.xs }}
                >
                  <Text
                    style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: 13,
                      textDecorationLine: 'underline',
                    }}
                  >
                    View full plan
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          )}

          {activePlan?.metadata?.explanation?.length ? (
            <View
              style={{
                backgroundColor: colors.bg.surface,
                borderRadius: radii.lg,
                padding: spacing.lg,
                borderWidth: 1,
                borderColor: colors.border.default,
                ...shadows.card,
              }}
            >
              <Text variant="bodyStrong">Why this schedule?</Text>
              {activePlan.metadata.explanation.map((bullet, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, marginTop: spacing.sm }}>
                  <AppIcon name="sparkles" size={14} color={colors.brand.primary} />
                  <Text variant="caption" style={{ flex: 1 }}>
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
                borderRadius: radii.md,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: colors.border.soft,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                minHeight: 64,
                ...shadows.card,
              }}
            >
              <AppIcon name="walk" size={22} color={colors.brand.secondary} />
              <View style={{ flex: 1 }}>
                <Text
                  variant="micro"
                  color={colors.text.secondary}
                  style={{ textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }}
                >
                  Today's Walk Goal
                </Text>
                <Text style={{ fontSize: 14, lineHeight: 20, color: colors.text.primary }}>
                  {walkGoalText}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={walkLoggedToday ? 1 : 0.8}
                onPress={walkLoggedToday ? undefined : () => setShowWalkModal(true)}
                style={{
                  backgroundColor: walkLoggedToday ? '#DCFCE7' : colors.bg.surfaceAlt,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 8,
                  borderRadius: radii.md,
                  minHeight: 44,
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: walkLoggedToday ? colors.brand.primary : colors.border.default,
                }}
              >
                <Text
                  style={{
                    color: walkLoggedToday ? colors.brand.primary : colors.text.secondary,
                    fontSize: 13,
                    fontWeight: '600',
                  }}
                >
                  {walkLoggedToday ? 'Logged' : 'Log walk'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Quick Wins ── */}
          <View>
            <SectionHeader title="Quick Wins" style={{ marginBottom: spacing.sm }} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.sm }}
            >
              {QUICK_WINS.map((win) => (
                <TouchableOpacity
                  key={win.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedWin(win)}
                  style={{
                    backgroundColor: colors.bg.surface,
                    borderRadius: radii.md,
                    padding: spacing.md,
                    width: 116,
                    borderWidth: 1,
                    borderColor: colors.border.soft,
                    alignItems: 'center',
                    gap: 6,
                    minHeight: 44,
                    ...shadows.card,
                  }}
                >
                  <AppIcon name={win.emoji as AppIconName} size={28} color={colors.brand.primary} />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      textAlign: 'center',
                      color: colors.text.primary,
                      lineHeight: 18,
                    }}
                    numberOfLines={2}
                  >
                    {win.title}
                  </Text>
                  <PillTag label={win.duration} variant="green" size="sm" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* ── Progress Banner ── */}
          {activePlan && (
            <View
              style={{
                backgroundColor: isCelebration ? '#FEF3C7' : colors.bg.surfaceAlt,
                borderRadius: radii.md,
                padding: spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                borderWidth: 1,
                borderColor: isCelebration ? '#FDE68A' : colors.border.soft,
                minHeight: 52,
              }}
            >
              <AppIcon
                name={isCelebration ? 'ribbon' : completedCount > 0 ? 'star' : 'flag'}
                size={24}
                color={isCelebration ? '#B45309' : colors.brand.primary}
              />
              <Text style={{ flex: 1, fontSize: 14, lineHeight: 22, color: colors.text.primary }}>
                {isCelebration
                  ? `${streak}-day streak! You're on a roll.`
                  : milestoneText}
              </Text>
            </View>
          )}
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
