import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { MascotCallout } from '@/components/ui/MascotCallout';
import { MascotLoader } from '@/components/ui/MascotLoader';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkeletonBlock } from '@/components/ui/SkeletonBlock';
import { Text } from '@/components/ui/Text';
import { PlanReasonCard } from '@/components/adaptive/PlanReasonCard';
import { StagePath, buildStageGroups } from '@/components/train/CoursePath';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { buildDogFromState, useOnboardingStore } from '@/stores/onboardingStore';
import { useAuthStore } from '@/stores/authStore';
import { useDogStore } from '@/stores/dogStore';
import { generatePlan, getPlanBullets } from '@/lib/planGenerator';
import { formatDisplayTime, getBehaviorLabel } from '@/lib/scheduleEngine';
import { mapDogRowToDog, mapPlanRowToPlan } from '@/lib/modelMappers';
import { supabase } from '@/lib/supabase';
import { usePlanStore } from '@/stores/planStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import type { AdaptivePlanMetadata, Plan, Weekday } from '@/types';

const ROW_HEIGHT = 52;

const DAY_LABELS: Record<Weekday, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

/** Mirrors the loaded layout: title, caption, then two grouped lists. */
function PlanSkeleton({ dogName }: { dogName: string }) {
  return (
    <View style={{ gap: spacing.xl }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <MascotLoader activity="wake" size={64} />
        <Text variant="caption">Building {dogName ? `${dogName}'s` : 'the'} plan</Text>
      </View>
      <View style={{ gap: spacing.sm }}>
        <SkeletonBlock height={30} width="60%" />
        <SkeletonBlock height={20} width="80%" />
      </View>
      <View style={{ gap: spacing.sm }}>
        <SkeletonBlock height={26} width="45%" />
        <SkeletonBlock height={ROW_HEIGHT * 3} borderRadius={radii.md} />
      </View>
      <View style={{ gap: spacing.sm }}>
        <SkeletonBlock height={26} width="35%" />
        <SkeletonBlock height={ROW_HEIGHT} borderRadius={radii.md} />
      </View>
    </View>
  );
}

export default function PlanPreviewScreen() {
  const router = useRouter();
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const dogName = useOnboardingStore((s) => s.dogName);
  const primaryGoal = useOnboardingStore((s) => s.primaryGoal);
  const equipment = useOnboardingStore((s) => s.equipment);
  const availableDaysPerWeek = useOnboardingStore((s) => s.availableDaysPerWeek);
  const availableMinutesPerDay = useOnboardingStore((s) => s.availableMinutesPerDay);
  const secondaryGoals = useOnboardingStore((s) => s.secondaryGoals);
  const scheduleSummary = useOnboardingStore((s) => s.buildScheduleSummary());
  const isSubmittingOnboarding = useOnboardingStore((s) => s.isSubmitting);
  const setOnboardingField = useOnboardingStore((s) => s.setField);
  const user = useAuthStore((s) => s.user);
  const existingActivePlan = usePlanStore((s) => s.activePlan);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createdPlan, setCreatedPlan] = useState<Plan | null>(null);
  // Bumped by "Try again" so the same generation call runs again.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    if (existingActivePlan) { setCreatedPlan(existingActivePlan); setLoading(false); return; }
    if (isSubmittingOnboarding) { setLoading(true); return; }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const submit = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (!cancelled) setError('Your session expired. Log in again to save the plan.');
          return;
        }

        await supabase.from('dogs').select('id').eq('owner_id', user.id).limit(1);

        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.warn('[plan-preview] Session invalid, signing out:', refreshError.message);
          await supabase.auth.signOut();
          if (!cancelled) setError('Your session is no longer valid. Create your account again.');
          return;
        }

        const { data: existingDog } = await supabase
          .from('dogs').select('id').eq('owner_id', user.id).limit(1).maybeSingle();

        if (existingDog?.id) {
          const { data: existingDogRow } = await supabase
            .from('dogs').select('*').eq('id', existingDog.id).single();
          if (existingDogRow) {
            useDogStore.getState().setDog(mapDogRowToDog(existingDogRow));
          }

          const { data: existingPlanRow } = await supabase
            .from('plans').select('*').eq('dog_id', existingDog.id).eq('status', 'active').limit(1).maybeSingle();
          if (existingPlanRow) {
            const plan = mapPlanRowToPlan(existingPlanRow);
            useDogStore.getState().setActivePlan(plan);
            usePlanStore.getState().setActivePlan(plan);
            useAuthStore.getState().setDogProfile({ id: existingDog.id, name: dogName });
            if (!cancelled) setCreatedPlan(plan);
            return;
          }
        }

        const submitOnboarding = useOnboardingStore.getState().submitOnboarding;
        setOnboardingField('submissionIntent', 'onboarding');
        const { dogId, dog, plan } = await submitOnboarding(user.id);
        if (cancelled) return;
        useDogStore.getState().setDog(dog);
        useDogStore.getState().setActivePlan(plan);
        usePlanStore.getState().setActivePlan(plan);
        useAuthStore.getState().setDogProfile({ id: dogId, name: dog.name });
        setCreatedPlan(plan);
      } catch (err) {
        console.error('[plan-preview] submitOnboarding failed:', err);
        if (!cancelled) setError("Couldn't build the plan. Check your connection and try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    submit();
    return () => { cancelled = true; };
  }, [user?.id, existingActivePlan, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = () => {
    setOnboardingField('submissionIntent', null);
    resetOnboarding();
    router.replace('/(tabs)/train');
    // The one moment everyone sees the offer. Closing it lands on the free tier.
    const { tier, openPaywall } = useSubscriptionStore.getState();
    if (tier === 'free') openPaywall('plan_preview');
  };

  const bullets = getPlanBullets(primaryGoal);
  const goalLabel = getBehaviorLabel(primaryGoal);
  const sessionsPerWeek = createdPlan?.sessionsPerWeek ?? availableDaysPerWeek;

  // Before the account exists the plan is generated locally from the answers,
  // so the preview shows the real path, counts and first session. After
  // submission the created plan takes over.
  const onboardingState = useOnboardingStore();
  const previewPlan = useMemo(() => {
    if (createdPlan) return createdPlan;
    if (!onboardingState.primaryGoal) return null;
    try {
      return generatePlan(buildDogFromState(onboardingState, 'preview', 'preview', 'unknown'));
    } catch {
      return null;
    }
  }, [createdPlan, onboardingState]);
  const firstScheduledSession = useMemo(
    () => previewPlan?.sessions.find((s) => !s.isCompleted) ?? null,
    [previewPlan],
  );
  const stages = useMemo(() => (previewPlan ? buildStageGroups(previewPlan.sessions) : []), [previewPlan]);
  const totalSessions = previewPlan?.sessions.length ?? 0;
  const totalWeeks = Math.max(1, Math.ceil(totalSessions / Math.max(1, sessionsPerWeek)));
  const explanationBullets = createdPlan?.metadata?.explanation ?? [];
  const adaptiveMetadata = createdPlan?.metadata as AdaptivePlanMetadata | undefined;
  const isAdaptivePlan = adaptiveMetadata?.plannerMode === 'adaptive_ai';
  const adaptiveSummary = adaptiveMetadata?.planningSummary;
  const skillCount = adaptiveMetadata?.selectedSkillIds?.length ?? 0;

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeScreen>
        <View style={{ flex: 1, padding: spacing.lg, paddingTop: spacing.xl }}>
          <PlanSkeleton dogName={dogName} />
        </View>
      </SafeScreen>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <SafeScreen>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            title="Couldn't build the plan"
            subtitle={error}
            mascotState="waiting"
            action={{ label: 'Try again', onPress: () => setAttempt((a) => a + 1) }}
          />
        </View>
      </SafeScreen>
    );
  }

  // ─── Main ──────────────────────────────────────────────────────────────────
  const firstSessionWhen = firstScheduledSession
    ? [
        firstScheduledSession.scheduledDay
          ? DAY_LABELS[firstScheduledSession.scheduledDay] ?? firstScheduledSession.scheduledDay
          : `Week ${firstScheduledSession.weekNumber}`,
        firstScheduledSession.scheduledTime
          ? `at ${formatDisplayTime(firstScheduledSession.scheduledTime)}`
          : null,
      ]
        .filter(Boolean)
        .join(' ')
    : '';

  return (
    <SafeScreen>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xl, gap: spacing.xl }}
      >
        <View style={{ gap: spacing.lg }}>
          <View style={{ gap: spacing.xs }}>
            <Text variant="display">{dogName}'s plan</Text>
            <Text variant="caption">
              {goalLabel}. {totalSessions} sessions over {totalWeeks} {totalWeeks === 1 ? 'week' : 'weeks'},{' '}
              {availableMinutesPerDay} min each.
            </Text>
          </View>
          <MascotCallout
            state="celebrating"
            size={72}
            calloutPlacement="right"
            callout={`Built this one for ${dogName}. Stage by stage, nothing skipped.`}
          />
        </View>

        {stages.length > 0 ? (
          <View style={{ gap: spacing.xl }}>
            {stages.map((group) => (
              <StagePath key={group.stage} group={group} onSelectSession={() => {}} />
            ))}
          </View>
        ) : null}

        <View>
          <SectionHeader title={`By the end, ${dogName} will`} />
          <ListGroup>
            {bullets.map((b) => (
              <ListRow key={b} icon="checkmark-circle-outline" title={b} />
            ))}
            {equipment.length > 0 ? (
              <ListRow icon="bag-handle-outline" title="You'll need" subtitle={equipment.join(', ')} />
            ) : null}
          </ListGroup>
        </View>

        {firstScheduledSession ? (
          <View>
            <SectionHeader title="First session" />
            <ListGroup>
              <ListRow
                icon="play-circle-outline"
                title={firstScheduledSession.title}
                subtitle={`${firstSessionWhen}, ${firstScheduledSession.durationMinutes} min`}
              />
            </ListGroup>
          </View>
        ) : null}

        <View>
          <SectionHeader title="Why this plan" />
          {isAdaptivePlan && adaptiveSummary ? (
            <PlanReasonCard
              dogName={dogName}
              summary={adaptiveSummary}
              profileCaption={[skillCount > 0 ? `${skillCount} skills.` : null, scheduleSummary]
                .filter(Boolean)
                .join(' ')}
            />
          ) : (
            <Card>
              <View style={{ gap: spacing.sm }}>
                {explanationBullets.length > 0 ? (
                  explanationBullets.map((bullet) => (
                    <Text key={bullet} variant="body">
                      {bullet}
                    </Text>
                  ))
                ) : (
                  <Text variant="body">
                    It matches {dogName}'s age, home and goal. {scheduleSummary}
                  </Text>
                )}
              </View>
            </Card>
          )}
        </View>

        {secondaryGoals.length > 0 ? (
          <View>
            <SectionHeader title="Also included" />
            <ListGroup>
              {secondaryGoals.map((goal) => (
                <ListRow key={goal} icon="paw" title={getBehaviorLabel(goal)} />
              ))}
            </ListGroup>
            <Text variant="caption" style={{ marginTop: spacing.sm }}>
              These courses run alongside the main one. Switch between them from the Train tab.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          paddingBottom: spacing.lg,
          backgroundColor: colors.bg.app,
        }}
      >
        {!user ? (
          <Button
            label="Create account to save this plan"
            onPress={() => router.push('/(auth)/signup?from=onboarding')}
          />
        ) : (
          <Button label="Start first session" onPress={handleStart} />
        )}
      </View>
    </SafeScreen>
  );
}
