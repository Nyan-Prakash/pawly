/**
 * app/(tabs)/train/add-course.tsx
 *
 * "Add a course" flow for an existing dog. Native modal, title set in the
 * stack layout.
 *   Step 1: pick a goal
 *   Step 2: building, then a preview with the primary toggle and confirm
 *
 * Does NOT touch onboarding or dog profile.
 * Relies on lib/addCourse.ts for all business logic.
 */

import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Switch, View } from 'react-native';
import { router } from 'expo-router';

import { acknowledgeProfessionalHelp, ProfessionalHelpSheet } from '@/components/safety/ProfessionalHelpNotice';
import type { AppIconName } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { Tag } from '@/components/ui/PillTag';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { MascotLoader } from '@/components/ui/MascotLoader';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { isHighRiskGoal } from '@/constants/safety';
import { spacing } from '@/constants/spacing';
import { haptics } from '@/lib/haptics';
import { formatDisplayTime } from '@/lib/scheduleEngine';
import { getPlanBullets } from '@/lib/planGenerator';
import {
  addCourse,
  buildCourseTitle,
  confirmDraftCourse,
  discardDraftCourse,
  normalizeGoalKey,
  MAX_ACTIVE_COURSES,
} from '@/lib/addCourse';
import { useDogStore } from '@/stores/dogStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { usePlanStore } from '@/stores/planStore';
import type { Plan } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Goal options — the same goals as onboarding
// ─────────────────────────────────────────────────────────────────────────────

interface GoalOption {
  key: string;
  label: string;
  description: string;
  icon: AppIconName;
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    key: 'leash_pulling',
    label: 'Leash pulling',
    description: 'Build a reliable loose leash habit on walks',
    icon: 'walk',
  },
  {
    key: 'jumping_up',
    label: 'Jumping up',
    description: 'Teach four-on-floor as the default greeting',
    icon: 'arrow-up-circle',
  },
  {
    key: 'barking',
    label: 'Barking',
    description: 'Quiet cue and threshold management',
    icon: 'volume-high',
  },
  {
    key: 'recall',
    label: 'Recall',
    description: 'Reliable recall at distance and with distractions',
    icon: 'return-down-back',
  },
  {
    key: 'potty_training',
    label: 'Potty training',
    description: 'Establish a consistent schedule and reward zone',
    icon: 'sunny',
  },
  {
    key: 'crate_anxiety',
    label: 'Crate anxiety',
    description: 'Build calm confidence in the crate step by step',
    icon: 'home',
  },
  {
    key: 'puppy_biting',
    label: 'Puppy biting',
    description: 'Teach bite inhibition and redirect mouthing',
    icon: 'happy',
  },
  {
    key: 'settling',
    label: 'Settling',
    description: 'Reliable down-stay on a mat in any environment',
    icon: 'bed',
  },
  {
    key: 'leave_it',
    label: 'Leave it',
    description: 'Rock-solid leave it and drop it in any situation',
    icon: 'hand-left',
  },
  {
    key: 'basic_obedience',
    label: 'Basic obedience',
    description: 'Sit, down, and stay as reliable cued behaviors',
    icon: 'school',
  },
  {
    key: 'separation_anxiety',
    label: 'Separation anxiety',
    description: 'Build calm independence from seconds to hours',
    icon: 'sad',
  },
  {
    key: 'door_manners',
    label: 'Door manners',
    description: 'Sit and wait at every threshold, no bolting',
    icon: 'exit',
  },
  {
    key: 'impulse_control',
    label: 'Impulse control',
    description: 'Calm self-control around food, toys, and arousal',
    icon: 'pause-circle',
  },
  {
    key: 'cooperative_care',
    label: 'Cooperative care',
    description: 'Calm acceptance of handling, grooming, and vet visits',
    icon: 'medkit',
  },
  {
    key: 'wait_and_stay',
    label: 'Wait and stay',
    description: 'Reliable wait at doors, curbs, and before meals',
    icon: 'time',
  },
  {
    key: 'leash_reactivity',
    label: 'Leash reactivity',
    description: 'Stay calm when passing dogs and other triggers',
    icon: 'alert-circle',
  },
  {
    key: 'sit',
    label: 'Sit',
    description: 'Solid sit from lure to verbal cue in any environment',
    icon: 'chevron-down-circle',
  },
  {
    key: 'down',
    label: 'Down',
    description: 'Reliable down from lure to verbal cue anywhere',
    icon: 'arrow-down-circle',
  },
  {
    key: 'heel',
    label: 'Heel',
    description: 'Formal heel position on and off leash',
    icon: 'footsteps',
  },
  {
    key: 'touch',
    label: 'Hand touch',
    description: 'Nose to your palm, the base for many other tricks',
    icon: 'finger-print',
  },
  {
    key: 'spin',
    label: 'Spin',
    description: 'A full circle on cue, then a twirl the other way',
    icon: 'refresh-circle',
  },
  {
    key: 'high_five',
    label: 'Shake and high five',
    description: 'A paw to your hand, from a low shake to a high five',
    icon: 'hand-right',
  },
  {
    key: 'bow',
    label: 'Take a bow',
    description: 'Elbows down, rear up, held for 2 seconds',
    icon: 'ribbon',
  },
  {
    key: 'roll_over',
    label: 'Roll over',
    description: 'A full roll from a down, built up gently on soft ground',
    icon: 'sync-circle',
  },
  {
    key: 'leg_weave',
    label: 'Leg weave',
    description: 'A figure eight through your legs, then while you walk',
    icon: 'infinite',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — pick a goal
// ─────────────────────────────────────────────────────────────────────────────

function GoalSelectionStep({
  activeGoalKeys,
  activePlanCount,
  onSelect,
}: {
  activeGoalKeys: string[];
  activePlanCount: number;
  onSelect: (goalKey: string) => void;
}) {
  const atLimit = activePlanCount >= MAX_ACTIVE_COURSES;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
    >
      {atLimit ? (
        <View style={{ gap: spacing.xs }}>
          <Text variant="bodyStrong" color={colors.status.warning}>
            Course limit reached
          </Text>
          <Text variant="body">
            You can have {MAX_ACTIVE_COURSES} active courses at once. Finish one before adding another.
          </Text>
        </View>
      ) : (
        <Text variant="body" color={colors.text.secondary}>
          Choose what to work on next. Courses you are already training are marked active.
        </Text>
      )}

      <ListGroup>
        {GOAL_OPTIONS.map((option) => {
          const isActive = activeGoalKeys.includes(option.key);
          const isDisabled = isActive || atLimit;
          return (
            <ListRow
              key={option.key}
              icon={option.icon}
              iconTone={isActive ? 'secondary' : 'accent'}
              title={option.label}
              subtitle={option.description}
              trailing={isActive ? <Tag label="Active" /> : atLimit ? undefined : 'chevron'}
              disabled={isDisabled}
              onPress={() => onSelect(option.key)}
              accessibilityHint={isActive ? 'Already an active course' : 'Builds a course for this goal'}
            />
          );
        })}
      </ListGroup>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — building, then preview
// ─────────────────────────────────────────────────────────────────────────────

function GeneratingView() {
  return (
    <View style={{ padding: spacing.lg, gap: spacing.md, flexDirection: 'row', alignItems: 'center' }}>
      <MascotLoader activity="wake" size={64} />
      <Text variant="caption">Building the course</Text>
    </View>
  );
}

interface PlanPreviewStepProps {
  goalKey: string;
  plan: Plan;
  makePrimary: boolean;
  onTogglePrimary: (val: boolean) => void;
  onConfirm: () => void;
  onChooseAnother: () => void;
  confirming: boolean;
}

function PlanPreviewStep({
  goalKey,
  plan,
  makePrimary,
  onTogglePrimary,
  onConfirm,
  onChooseAnother,
  confirming,
}: PlanPreviewStepProps) {
  const courseTitle = plan.courseTitle ?? buildCourseTitle(goalKey);
  const bullets = getPlanBullets(goalKey);
  const firstSession = plan.sessions.find((s) => !s.isCompleted) ?? null;
  const sessionsPerWeek =
    plan.sessionsPerWeek === 1 ? '1 session a week' : `${plan.sessionsPerWeek} sessions a week`;

  const firstSessionSubtitle = firstSession
    ? [
        firstSession.scheduledDay ?? `Week ${firstSession.weekNumber}`,
        firstSession.scheduledTime ? formatDisplayTime(firstSession.scheduledTime) : null,
        `${firstSession.durationMinutes} min`,
      ]
        .filter(Boolean)
        .join(', ')
    : null;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
      >
        <View style={{ gap: spacing.xs }}>
          <Text variant="h2">{courseTitle}</Text>
          <Text variant="caption">
            {plan.durationWeeks} weeks, {sessionsPerWeek}
          </Text>
        </View>

        {bullets && bullets.length > 0 ? (
          <View>
            <SectionHeader title="What the course covers" />
            <ListGroup>
              {bullets.map((bullet, i) => (
                <ListRow key={i} icon="checkmark-circle-outline" title={bullet} />
              ))}
            </ListGroup>
          </View>
        ) : null}

        {firstSession ? (
          <View>
            <SectionHeader title="First session" />
            <ListGroup>
              <ListRow
                icon="play-circle-outline"
                iconTone="secondary"
                title={firstSession.title}
                subtitle={firstSessionSubtitle ?? undefined}
              />
            </ListGroup>
          </View>
        ) : null}

        <ListGroup>
          <ListRow
            title="Make this the primary course"
            subtitle="The primary course comes first on Train and Calendar."
            trailing={
              <Switch
                value={makePrimary}
                onValueChange={onTogglePrimary}
                trackColor={{ false: colors.bg.fill, true: colors.accent }}
                accessibilityLabel="Make this the primary course"
              />
            }
          />
        </ListGroup>

        <Button
          label="Choose a different course"
          variant="ghost"
          size="md"
          onPress={onChooseAnother}
          style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }}
        />
      </ScrollView>

      <View style={{ padding: spacing.lg, paddingTop: spacing.sm, backgroundColor: colors.bg.app }}>
        <Button label="Add course" onPress={onConfirm} loading={confirming} />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────────────────

type ScreenStep = 'select' | 'generating' | 'preview' | 'error';

export default function AddCourseScreen() {
  const { dog, activePlans } = useDogStore();
  const { refreshPlans } = usePlanStore();
  const refreshSchedulesForPlans = useNotificationStore((s) => s.refreshSchedulesForPlans);

  const [step, setStep] = useState<ScreenStep>('select');
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<Plan | null>(null);
  const [makePrimary, setMakePrimary] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // A high-risk goal waits here until the "when to see a professional" sheet is acknowledged.
  const [pendingHighRiskGoal, setPendingHighRiskGoal] = useState<string | null>(null);

  // The previewed plan is a hidden draft until "Add course" is tapped. Track it
  // so backing out (or leaving the screen) deletes it instead of enrolling it.
  const draftPlanIdRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(
    () => () => {
      isMountedRef.current = false;
      if (draftPlanIdRef.current) {
        discardDraftCourse(draftPlanIdRef.current).catch(() => {});
        draftPlanIdRef.current = null;
      }
    },
    [],
  );

  // Keys of goals that already have active courses — used for duplicate display
  const activeGoalKeys = activePlans.map((p) => normalizeGoalKey(p.goal));

  function handleGoalPress(goalKey: string) {
    if (!dog) return;
    haptics.selection();
    if (isHighRiskGoal(goalKey)) {
      setPendingHighRiskGoal(goalKey);
      return;
    }
    void handleGoalSelect(goalKey);
  }

  function handleAcknowledgeHighRisk() {
    const goalKey = pendingHighRiskGoal;
    if (!dog || !goalKey) return;
    setPendingHighRiskGoal(null);
    // Acknowledged here, so the session overview does not show it again.
    void acknowledgeProfessionalHelp(dog.id, goalKey);
    void handleGoalSelect(goalKey);
  }

  async function handleGoalSelect(goalKey: string) {
    if (!dog) return;

    setSelectedGoal(goalKey);
    setStep('generating');

    // Pre-generate the plan as a draft so the user sees a real preview.
    // Nothing is enrolled until handleConfirm.
    const result = await addCourse({
      dog,
      goal: goalKey,
      accessToken: null,
      draft: true,
    });

    // The user left while the plan was building — don't keep the draft.
    if (!isMountedRef.current) {
      if (result.ok) discardDraftCourse(result.plan.id).catch(() => {});
      return;
    }

    if (!result.ok) {
      // Raw store/network text stays in the console; the screen says what to do.
      console.warn('[add-course] addCourse failed:', result.reason, result.message);
      setErrorMessage(
        result.reason === 'duplicate_goal'
          ? `${dog.name} already has an active course for this goal. Pick a different one.`
          : result.reason === 'limit_reached'
            ? `${dog.name} already has ${MAX_ACTIVE_COURSES} active courses. Finish one before adding another.`
            : 'Check your connection and try again.',
      );
      setStep('error');
      return;
    }

    draftPlanIdRef.current = result.plan.id;
    setGeneratedPlan(result.plan);
    setStep('preview');
  }

  async function handleConfirm() {
    if (!dog || !generatedPlan || !selectedGoal) return;

    // This is the moment the draft becomes a course.
    setConfirming(true);
    try {
      const failure = await confirmDraftCourse(dog, generatedPlan, makePrimary);
      if (failure) {
        if (failure === 'limit_reached') {
          discardDraftCourse(generatedPlan.id).catch(() => {});
          draftPlanIdRef.current = null;
          setErrorMessage(
            `${dog.name} already has ${MAX_ACTIVE_COURSES} active courses. Finish one before adding another.`,
          );
          setStep('error');
          return;
        }
        // Keep the draft and the preview so "Add course" can be tried again.
        Alert.alert("Couldn't add the course", 'Check your connection and try again.');
        return;
      }
      draftPlanIdRef.current = null;

      // Refresh stores so Today / Plan / Calendar update immediately
      await refreshPlans(dog.id);

      // Reschedule notifications for the updated multi-plan set
      if (dog?.id) {
        try {
          // Get the latest plans from the store after refresh
          const latestPlans = usePlanStore.getState().activePlanIds
            .map(id => usePlanStore.getState().plansById[id])
            .filter((p): p is NonNullable<typeof p> => p != null);
          await refreshSchedulesForPlans(dog, latestPlans);
        } catch {
          // Non-fatal — notifications may not be available
        }
      }

      // Navigate back to Today
      router.replace('/(tabs)/train');
    } finally {
      setConfirming(false);
    }
  }

  function handleBackToSelect() {
    if (draftPlanIdRef.current) {
      discardDraftCourse(draftPlanIdRef.current).catch(() => {});
      draftPlanIdRef.current = null;
    }
    setStep('select');
    setSelectedGoal(null);
    setGeneratedPlan(null);
    setMakePrimary(false);
    setErrorMessage(null);
  }

  // The sheet stays mounted across steps so it slides away instead of being
  // torn down when "Got it" moves the screen on to building the course.
  const professionalHelpSheet = (
    <ProfessionalHelpSheet
      visible={pendingHighRiskGoal !== null}
      onAcknowledge={handleAcknowledgeHighRisk}
      onClose={() => setPendingHighRiskGoal(null)}
    />
  );

  if (step === 'error') {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
      >
        <View style={{ gap: spacing.xs }}>
          <Text variant="h2">Couldn't build the course</Text>
          <Text variant="body">
            {errorMessage ?? 'Check your connection and try again.'}
          </Text>
        </View>
        <Button label="Try again" onPress={handleBackToSelect} />
      </ScrollView>
    );
  }

  if (step === 'generating') {
    return (
      <>
        <GeneratingView />
        {professionalHelpSheet}
      </>
    );
  }

  if (step === 'preview' && generatedPlan && selectedGoal) {
    return (
      <PlanPreviewStep
        goalKey={selectedGoal}
        plan={generatedPlan}
        makePrimary={makePrimary}
        onTogglePrimary={setMakePrimary}
        onConfirm={handleConfirm}
        onChooseAnother={handleBackToSelect}
        confirming={confirming}
      />
    );
  }

  return (
    <>
      <GoalSelectionStep
        activeGoalKeys={activeGoalKeys}
        activePlanCount={activePlans.length}
        onSelect={handleGoalPress}
      />
      {professionalHelpSheet}
    </>
  );
}
