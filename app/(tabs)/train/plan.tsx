import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';

import { WhyThisChangedSheet } from '@/components/adaptive/WhyThisChangedSheet';
import { buildStageGroups, resolveProtocol, StagePath } from '@/components/train/CoursePath';
import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { Tag } from '@/components/ui/PillTag';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import type { ProtocolStep } from '@/constants/protocols';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { MAX_ACTIVE_COURSES } from '@/lib/addCourse';
import { formatDisplayTime, formatScheduleLabel, getBehaviorLabel, getPlanCompletion } from '@/lib/scheduleEngine';
import { useDogStore } from '@/stores/dogStore';
import { usePlanStore, selectPlanSummaries } from '@/stores/planStore';
import type { PlanAdaptation, PlanSession } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

type SessionKind = NonNullable<PlanSession['sessionKind']>;

const KIND_LABELS: Record<SessionKind, string> = {
  core: 'Core',
  repeat: 'Repeat',
  regress: 'Easier',
  advance: 'Advance',
  detour: 'Reset focus',
  proofing: 'Proofing',
};

function parseLocalDate(key: string): Date | null {
  const [y, m, d] = key.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/** "Monday at 9:00 AM, 15 min" */
function sessionSubtitle(session: PlanSession): string {
  const date = session.scheduledDate ? parseLocalDate(session.scheduledDate) : null;
  const day = date
    ? date.toLocaleDateString('en-US', { weekday: 'long' })
    : session.scheduledDay ?? null;
  const time = session.scheduledTime ? ` at ${formatDisplayTime(session.scheduledTime)}` : '';
  const when = day ? `${day}${time}` : formatScheduleLabel(session);
  return `${when}, ${session.durationMinutes} min`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Course switcher — a row of 44pt chips
// ─────────────────────────────────────────────────────────────────────────────

interface CourseSwitcherProps {
  plans: Array<{ id: string; label: string }>;
  selectedId: string;
  onSelect: (id: string) => void;
}

function CourseSwitcher({ plans, selectedId, onSelect }: CourseSwitcherProps) {
  if (plans.length <= 1) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -spacing.lg }}
      contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
    >
      {plans.map((plan) => {
        const isSelected = plan.id === selectedId;
        return (
          <Pressable
            key={plan.id}
            onPress={() => onSelect(plan.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            style={({ pressed }) => ({
              minHeight: 44,
              paddingHorizontal: spacing.lg,
              borderRadius: radii.sm,
              backgroundColor: isSelected ? colors.accentSoft : colors.bg.fill,
              justifyContent: 'center',
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text variant="bodyStrong" color={isSelected ? colors.accent : colors.text.primary}>
              {plan.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Session detail sheet
// ─────────────────────────────────────────────────────────────────────────────

function stepMeta(step: ProtocolStep): string | null {
  if (step.reps) return `${step.reps} reps`;
  if (step.durationSeconds) {
    const m = Math.round(step.durationSeconds / 60);
    return m >= 1 ? `${m} min` : `${step.durationSeconds} sec`;
  }
  return null;
}

function Fact({ icon, children }: { icon: AppIconName; children: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
      <View style={{ paddingTop: 2 }}>
        <AppIcon name={icon} size={16} color={colors.text.secondary} />
      </View>
      <Text variant="caption" style={{ flex: 1 }}>
        {children}
      </Text>
    </View>
  );
}

function SessionDetailSheet({
  session,
  visible,
  onClose,
  onStart,
  canStart,
  dogName,
  recentAdaptations,
}: {
  session: PlanSession | null;
  visible: boolean;
  onClose: () => void;
  onStart: () => void;
  /** Only the course's next session can be started; locked ones explain why. */
  canStart: boolean;
  dogName: string;
  recentAdaptations: PlanAdaptation[];
}) {
  const [showWhySheet, setShowWhySheet] = useState(false);

  if (!session) return null;

  const protocol = resolveProtocol(session);

  // Find the adaptation that changed this session (if any)
  const relatedAdaptation = session.adaptationSource === 'adaptation_engine'
    ? recentAdaptations.find((a) =>
        a.status === 'applied' && a.changedSessionIds.includes(session.id)
      ) ?? recentAdaptations.find((a) => a.status === 'applied') ?? null
    : null;

  const isAdapted = session.adaptationSource === 'adaptation_engine';
  const kind: SessionKind = session.sessionKind ?? 'core';

  function skillPathLabel(): string | null {
    switch (kind) {
      case 'regress':  return 'Stepped back from the previous skill to rebuild confidence.';
      case 'advance':  return 'Moving to a harder version. Recent sessions have been strong.';
      case 'detour':   return 'Taking a different angle on the same skill to reduce frustration.';
      case 'repeat':   return 'Repeating this skill to deepen the habit before moving on.';
      case 'proofing': return 'Testing this skill in a more challenging setting.';
      default:         return null;
    }
  }
  const whyLine = skillPathLabel();
  const environmentLabel = session.environment ? String(session.environment).replace(/_/g, ' ') : null;

  return (
    <>
      <BottomSheet visible={visible} onClose={onClose} title={session.title} padded={false}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, gap: spacing.xl }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: spacing.md }}>
            {session.isCompleted || session.isMissed || isAdapted ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                {session.isCompleted ? <Tag label="Completed" tone="accent" /> : null}
                {session.isMissed && !session.isCompleted ? <Tag label="Missed" tone="warning" /> : null}
                {isAdapted ? <Tag label={KIND_LABELS[kind]} tone="neutral" /> : null}
              </View>
            ) : null}
            <View style={{ gap: spacing.xs }}>
              <Fact icon="calendar-outline">{sessionSubtitle(session).replace(/, \d+ min$/, '')}</Fact>
              <Fact icon="time-outline">{`${session.durationMinutes} min`}</Fact>
              {environmentLabel ? <Fact icon="location-outline">{environmentLabel}</Fact> : null}
            </View>
            {protocol?.objective ? <Text variant="body">{protocol.objective}</Text> : null}
          </View>

          {protocol?.steps.length ? (
            <View>
              <SectionHeader title={`What you'll do`} />
              <ListGroup>
                {protocol.steps.map((step, index) => (
                  <View
                    key={step.order}
                    style={{ flexDirection: 'row', gap: spacing.md, paddingLeft: spacing.lg, paddingRight: spacing.xl, paddingVertical: spacing.lg }}
                  >
                    <Text variant="captionStrong" color={colors.accent} style={{ width: spacing.xl }}>
                      {index + 1}
                    </Text>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text variant="body">{step.instruction}</Text>
                      {stepMeta(step) ? <Text variant="caption">{stepMeta(step)}</Text> : null}
                    </View>
                  </View>
                ))}
              </ListGroup>
            </View>
          ) : null}

          {protocol && (protocol.setup?.length || protocol.equipmentNeeded.length) ? (
            <View>
              <SectionHeader title="You'll need" />
              <ListGroup>
                {[...(protocol.setup ?? []), ...protocol.equipmentNeeded].map((item) => (
                  <ListRow key={item} icon="checkmark-circle-outline" iconTone="secondary" title={item} />
                ))}
              </ListGroup>
            </View>
          ) : null}

          {whyLine || session.reasoningLabel || isAdapted ? (
            <View>
              <SectionHeader title="Why this session" />
              <Card style={{ gap: spacing.sm }}>
                {whyLine ? <Text variant="body">{whyLine}</Text> : null}
                {session.reasoningLabel ? <Text variant="caption">{session.reasoningLabel}</Text> : null}
                {isAdapted ? (
                  <Text variant="body">
                    {relatedAdaptation?.reasonSummary || 'The coach adjusted this session after recent results.'}
                  </Text>
                ) : null}
                {relatedAdaptation ? (
                  <View style={{ alignItems: 'flex-start' }}>
                    <Button label="Full explanation" variant="ghost" size="md" onPress={() => setShowWhySheet(true)} style={{ paddingHorizontal: 0 }} />
                  </View>
                ) : null}
              </Card>
            </View>
          ) : null}

          {protocol?.guide ? (
            <Card style={{ gap: spacing.xs }}>
              <Text variant="captionStrong">Between sessions</Text>
              <Text variant="body">{protocol.guide}</Text>
            </Card>
          ) : null}

          {protocol?.trainerNote ? (
            <Card style={{ gap: spacing.xs }}>
              <Text variant="captionStrong">From the coach</Text>
              <Text variant="body">{protocol.trainerNote}</Text>
            </Card>
          ) : null}
        </ScrollView>

        {!session.isCompleted ? (
          <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, paddingTop: spacing.sm, backgroundColor: colors.bg.app }}>
            {canStart ? (
              <Button label="Start session" onPress={onStart} />
            ) : (
              <Text variant="caption">Unlocks after the sessions before it</Text>
            )}
          </View>
        ) : null}
      </BottomSheet>

      {relatedAdaptation ? (
        <WhyThisChangedSheet
          visible={showWhySheet}
          onClose={() => setShowWhySheet(false)}
          dogName={dogName}
          adaptation={relatedAdaptation}
        />
      ) : null}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton — mirrors progress bar + three stage cards
// ─────────────────────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <View style={{ gap: spacing.xl }}>
      <View style={{ gap: spacing.sm }}>
        <SkeletonBlock height={spacing.sm} borderRadius={radii.full} />
        <SkeletonBlock height={spacing.lg} width={140} />
      </View>
      {[0, 1, 2].map((stage) => (
        <View key={stage} style={{ gap: spacing.sm }}>
          <SkeletonBlock height={spacing.xl} width={96} />
          <SkeletonBlock height={spacing.lg} width={200} />
          <SkeletonBlock height={spacing.xxxl + spacing.xxl + spacing.xxl} borderRadius={radii.md} />
        </View>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Plan screen
// ─────────────────────────────────────────────────────────────────────────────

export default function PlanScreen() {
  const { dog } = useDogStore();
  const planStoreState = usePlanStore();
  const {
    plansById,
    activePlanIds,
    selectedPlanId,
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

  // Resolve which plan to display: selectedPlanId, then primary, then first
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
  }));

  const noPlans = !isLoading && activePlanIds.length === 0;
  const goToAddCourse = () => router.push('/(tabs)/train/add-course' as never);

  if (noPlans || (!isLoading && !displayPlan)) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: spacing.lg, flexGrow: 1, justifyContent: 'center' }}
      >
        <EmptyState
          mascotState="waiting"
          title="No active plan"
          subtitle="Add a course and the coach will build sessions around your dog."
          action={{ label: 'Add a course', onPress: goToAddCourse }}
        />
      </ScrollView>
    );
  }

  if (!displayPlan) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
      >
        <LoadingSkeleton />
      </ScrollView>
    );
  }

  const completionPct = getPlanCompletion(displayPlan);
  const completedCount = displayPlan.sessions.filter((s) => s.isCompleted).length;
  const totalCount = displayPlan.sessions.length;
  const adaptedCount = displayPlan.sessions.filter((s) => s.adaptationSource === 'adaptation_engine').length;
  const stages = buildStageGroups(displayPlan.sessions);
  const nextSessionId = stages.flatMap((g) => g.nodes).find((n) => n.state === 'next')?.session.id ?? null;
  const courseTitle = displayPlan.courseTitle ?? getBehaviorLabel(displayPlan.goal);
  const nextSession = displayPlan.sessions.find((session) => session.id === nextSessionId) ?? null;
  const currentStage = (() => {
    const group = nextSession ? stages.find((g) => g.nodes.some((n) => n.session.id === nextSession.id)) : null;
    if (!group) return null;
    return { stage: group.stage, protocol: resolveProtocol(nextSession!) };
  })();

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
      >
        <View style={{ gap: spacing.lg }}>
          <CourseSwitcher
            plans={switcherPlans}
            selectedId={displayPlanId ?? ''}
            onSelect={(id) => setSelectedPlan(id)}
          />

          <Card style={{ gap: spacing.lg }}>
            <View style={{ gap: spacing.xs }}>
              <Text variant="h1">{courseTitle}</Text>
              {currentStage?.protocol?.objective ? (
                <Text variant="body" color={colors.text.secondary}>
                  {currentStage.protocol.objective}
                </Text>
              ) : null}
            </View>

            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Text variant="captionStrong">Course progress</Text>
                <Text variant="caption">
                  {completedCount} of {totalCount} sessions
                </Text>
              </View>
              <ProgressBar
                progress={completionPct / 100}
                height={8}
                accessibilityLabel={`${completedCount} of ${totalCount} sessions complete`}
              />
            </View>

            <View style={{ gap: spacing.xs }}>
              <Fact icon="flag-outline">
                {currentStage
                  ? `Stage ${currentStage.stage} of ${stages.length}${currentStage.protocol ? `: ${currentStage.protocol.title}` : ''}`
                  : 'All stages complete'}
              </Fact>
              <Fact icon="calendar-outline">
                {`${displayPlan.sessionsPerWeek} sessions a week, about ${Math.max(1, Math.ceil((totalCount - completedCount) / Math.max(1, displayPlan.sessionsPerWeek)))} weeks to go`}
              </Fact>
              {nextSession ? (
                <Fact icon="play-outline">{`Next: ${nextSession.title}, ${sessionSubtitle(nextSession)}`}</Fact>
              ) : null}
              {adaptedCount > 0 ? (
                <Fact icon="sync-outline">
                  {adaptedCount === 1 ? '1 session adjusted by the coach' : `${adaptedCount} sessions adjusted by the coach`}
                </Fact>
              ) : null}
            </View>

            {nextSession ? (
              <Button
                label="Start next session"
                onPress={() => router.push(`/(tabs)/train/session?id=${nextSession.id}&planId=${displayPlanId ?? ''}`)}
              />
            ) : null}
          </Card>

          {activePlanIds.length < MAX_ACTIVE_COURSES ? (
            <Button
              label="Add course"
              variant="ghost"
              size="md"
              icon="add"
              onPress={goToAddCourse}
              style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }}
            />
          ) : null}
        </View>

        {stages.map((group) => (
          <StagePath key={group.stage} group={group} onSelectSession={setSelectedSession} />
        ))}
      </ScrollView>

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
        canStart={!!selectedSession && selectedSession.id === nextSessionId}
        dogName={dog?.name ?? 'your dog'}
        recentAdaptations={recentAdaptations}
      />
    </>
  );
}
