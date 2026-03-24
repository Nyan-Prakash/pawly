/**
 * app/(tabs)/train/add-course.tsx
 *
 * "Add another course" flow for an existing dog.
 * Two-step UI:
 *   Step 1 — goal selection (choose a new behavior/issue)
 *   Step 2 — generating… → plan preview with primary toggle + confirm
 *
 * Does NOT touch onboarding or dog profile.
 * Relies on lib/addCourse.ts for all business logic.
 */

import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  Switch,
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
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';
import { useDogStore } from '@/stores/dogStore';
import { usePlanStore } from '@/stores/planStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { getBehaviorLabel } from '@/lib/scheduleEngine';
import { getPlanBullets } from '@/lib/planGenerator';
import {
  addCourse,
  buildCourseTitle,
  normalizeGoalKey,
  MAX_ACTIVE_COURSES,
} from '@/lib/addCourse';
import type { Plan } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Goal options — same 8 goals as onboarding
// ─────────────────────────────────────────────────────────────────────────────

interface GoalOption {
  key: string;
  label: string;
  description: string;
  icon: string;
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    key: 'leash_pulling',
    label: 'Leash Pulling',
    description: 'Build a reliable loose leash habit on walks',
    icon: 'walk',
  },
  {
    key: 'jumping_up',
    label: 'Jumping Up',
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
    label: "Won't Come (Recall)",
    description: 'Reliable recall at distance and with distractions',
    icon: 'return-down-back',
  },
  {
    key: 'potty_training',
    label: 'Potty Training',
    description: 'Establish a consistent schedule and reward zone',
    icon: 'sunny',
  },
  {
    key: 'crate_anxiety',
    label: 'Crate Anxiety',
    description: 'Build calm confidence in the crate step by step',
    icon: 'home',
  },
  {
    key: 'puppy_biting',
    label: 'Puppy Biting',
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
    label: 'Leave It',
    description: 'Rock-solid leave it and drop it in any situation',
    icon: 'hand-left',
  },
  {
    key: 'basic_obedience',
    label: 'Basic Obedience',
    description: 'Sit, down, and stay as reliable cued behaviors',
    icon: 'school',
  },
  {
    key: 'separation_anxiety',
    label: 'Separation Anxiety',
    description: 'Build calm independence from seconds to hours',
    icon: 'sad',
  },
  {
    key: 'door_manners',
    label: 'Door Manners',
    description: 'Sit and wait at every threshold, no bolting',
    icon: 'exit',
  },
  {
    key: 'impulse_control',
    label: 'Impulse Control',
    description: 'Calm self-control around food, toys, and arousal',
    icon: 'pause-circle',
  },
  {
    key: 'cooperative_care',
    label: 'Cooperative Care',
    description: 'Calm acceptance of handling, grooming, and vet visits',
    icon: 'medkit',
  },
  {
    key: 'wait_and_stay',
    label: 'Wait & Stay',
    description: 'Reliable wait at doors, kerbs, and before meals',
    icon: 'time',
  },
  {
    key: 'leash_reactivity',
    label: 'Leash Reactivity',
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
];

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Goal Selection
// ─────────────────────────────────────────────────────────────────────────────

function GoalSelectionStep({
  activeGoalKeys: activeGoalKeys,
  activePlanCount,
  onSelect,
  onCancel,
}: {
  activeGoalKeys: string[];
  activePlanCount: number;
  onSelect: (goalKey: string) => void;
  onCancel: () => void;
}) {
  const atLimit = activePlanCount >= MAX_ACTIVE_COURSES;

  return (
    <SafeScreen>
      {/* Header */}
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
          onPress={onCancel}
          style={{ minHeight: 44, minWidth: 44, justifyContent: 'center' }}
        >
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" style={{ flex: 1 }}>
          Add Another Goal
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {atLimit ? (
          <View
            style={{
              backgroundColor: colors.status.warningBg,
              borderRadius: radii.md,
              padding: spacing.lg,
              borderWidth: 1,
              borderColor: colors.status.warningBorder ?? colors.warning,
              marginBottom: spacing.lg,
              flexDirection: 'row',
              gap: spacing.sm,
              alignItems: 'flex-start',
            }}
          >
            <AppIcon name="warning" size={20} color={colors.warning} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong" style={{ color: colors.warning }}>
                Course limit reached
              </Text>
              <Text variant="caption" style={{ color: colors.text.secondary, marginTop: 4 }}>
                You can have at most {MAX_ACTIVE_COURSES} active courses at once. Complete or finish one before adding another.
              </Text>
            </View>
          </View>
        ) : (
          <Text
            variant="body"
            color={colors.text.secondary}
            style={{ marginBottom: spacing.lg, lineHeight: 22 }}
          >
            Choose a new behavior to work on. Goals you're already training are shown below and cannot be duplicated.
          </Text>
        )}

        <View style={{ gap: spacing.sm }}>
          {GOAL_OPTIONS.map((option) => {
            const isActive = activeGoalKeys.includes(option.key);
            const isDisabled = isActive || atLimit;
            return (
              <TouchableOpacity
                key={option.key}
                activeOpacity={isDisabled ? 1 : 0.75}
                disabled={isDisabled}
                onPress={() => onSelect(option.key)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  backgroundColor: isActive
                    ? colors.bg.surfaceAlt
                    : colors.bg.surface,
                  borderRadius: radii.md,
                  padding: spacing.md,
                  borderWidth: 1,
                  borderColor: isActive
                    ? colors.border.soft
                    : colors.border.default,
                  opacity: isDisabled && !isActive ? 0.45 : 1,
                  ...shadows.card,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: isActive
                      ? colors.border.default
                      : colors.brand.primary + '18',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AppIcon
                    name={option.icon as any}
                    size={22}
                    color={isActive ? colors.text.secondary : colors.brand.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    variant="bodyStrong"
                    style={{
                      color: isActive ? colors.text.secondary : colors.text.primary,
                    }}
                  >
                    {option.label}
                  </Text>
                  <Text
                    variant="caption"
                    style={{ marginTop: 2, color: colors.text.secondary }}
                    numberOfLines={2}
                  >
                    {option.description}
                  </Text>
                </View>
                {isActive ? (
                  <View
                    style={{
                      backgroundColor: colors.border.default,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: radii.pill,
                    }}
                  >
                    <Text style={{ fontSize: 10, color: colors.text.secondary, fontWeight: '700' }}>
                      Active
                    </Text>
                  </View>
                ) : (
                  !atLimit && (
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={colors.text.secondary}
                    />
                  )
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Generating / Preview
// ─────────────────────────────────────────────────────────────────────────────

const GENERATING_MESSAGES = [
  'Building your new course…',
  'Selecting the right exercises…',
  'Scheduling your sessions…',
];

function GeneratingView() {
  const [msgIndex, setMsgIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, { toValue: 1.06, duration: 800, useNativeDriver: true }),
        Animated.timing(logoScale, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [logoScale]);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
      setMsgIndex((i) => (i + 1) % GENERATING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [opacity]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
      <Animated.View style={{ transform: [{ scale: logoScale }] }}>
        <AppIcon name="paw" size={72} color={colors.brand.primary} />
      </Animated.View>
      <Animated.View style={{ opacity, marginTop: spacing.xl }}>
        <Text
          variant="body"
          style={{ color: colors.text.secondary, textAlign: 'center', fontSize: 16 }}
        >
          {GENERATING_MESSAGES[msgIndex]}
        </Text>
      </Animated.View>
    </View>
  );
}

interface PlanPreviewStepProps {
  goalKey: string;
  plan: Plan;
  makePrimary: boolean;
  onTogglePrimary: (val: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  confirming: boolean;
}

function PlanPreviewStep({
  goalKey,
  plan,
  makePrimary,
  onTogglePrimary,
  onConfirm,
  onCancel,
  confirming,
}: PlanPreviewStepProps) {
  const insets = useSafeAreaInsets();
  const courseTitle = plan.courseTitle ?? buildCourseTitle(goalKey);
  const bullets = getPlanBullets(goalKey);
  const firstSession = plan.sessions.find((s) => !s.isCompleted) ?? null;

  return (
    <SafeScreen>
      {/* Header */}
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
          onPress={onCancel}
          style={{ minHeight: 44, minWidth: 44, justifyContent: 'center' }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h2" style={{ flex: 1 }}>
          New Course Preview
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: insets.bottom + 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Course header card */}
        <View
          style={{
            backgroundColor: colors.bg.surface,
            borderRadius: radii.lg,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border.default,
            marginBottom: spacing.md,
            alignItems: 'center',
            ...shadows.card,
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: colors.brand.primary + '18',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.md,
            }}
          >
            <AppIcon name="paw" size={36} color={colors.brand.primary} />
          </View>
          <Text variant="h2" style={{ textAlign: 'center', marginBottom: spacing.xs }}>
            {courseTitle}
          </Text>
          <View
            style={{
              backgroundColor: colors.brand.primary + '18',
              paddingHorizontal: spacing.md,
              paddingVertical: 4,
              borderRadius: radii.pill,
            }}
          >
            <Text style={{ color: colors.brand.primary, fontSize: 12, fontWeight: '700' }}>
              {plan.durationWeeks} weeks · {plan.sessionsPerWeek}×/week
            </Text>
          </View>
        </View>

        {/* What you'll work on */}
        {bullets && bullets.length > 0 && (
          <View
            style={{
              backgroundColor: colors.bg.surface,
              borderRadius: radii.lg,
              padding: spacing.lg,
              marginBottom: spacing.md,
              borderWidth: 1,
              borderColor: colors.border.default,
              ...shadows.card,
            }}
          >
            <Text variant="bodyStrong" style={{ marginBottom: spacing.sm }}>
              What you'll work on
            </Text>
            {bullets.map((b, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: spacing.xs,
                  marginBottom: spacing.sm,
                }}
              >
                <AppIcon name="checkmark-circle" size={16} color={colors.brand.primary} />
                <Text
                  variant="body"
                  style={{ flex: 1, color: colors.text.secondary, lineHeight: 22 }}
                >
                  {b}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* First session peek */}
        {firstSession && (
          <View
            style={{
              backgroundColor: colors.bg.surfaceAlt,
              borderRadius: radii.md,
              padding: spacing.md,
              marginBottom: spacing.md,
            }}
          >
            <Text variant="micro" color={colors.text.secondary}>
              First session
            </Text>
            <Text variant="bodyStrong" style={{ marginTop: 2 }}>
              {firstSession.title}
            </Text>
            <Text variant="caption">
              {firstSession.scheduledDay
                ? `${firstSession.scheduledDay.slice(0, 3)}`
                : `Week ${firstSession.weekNumber}`}
              {firstSession.scheduledTime
                ? ` · ${firstSession.scheduledTime}`
                : ''}
              {` · ${firstSession.durationMinutes} min`}
            </Text>
          </View>
        )}

        {/* Primary toggle */}
        <View
          style={{
            backgroundColor: colors.bg.surface,
            borderRadius: radii.md,
            padding: spacing.md,
            marginBottom: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border.default,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            ...shadows.card,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong">Make this my primary course</Text>
            <Text variant="caption" style={{ color: colors.text.secondary, marginTop: 2 }}>
              The primary course gets top priority in Today and Calendar views.
            </Text>
          </View>
          <Switch
            value={makePrimary}
            onValueChange={onTogglePrimary}
            trackColor={{ false: colors.border.default, true: colors.brand.primary + '80' }}
            thumbColor={makePrimary ? colors.brand.primary : colors.text.secondary}
          />
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: spacing.md,
          paddingBottom: insets.bottom > 0 ? insets.bottom + spacing.sm : spacing.md,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border.default,
        }}
      >
        <Button
          label="Add This Course"
          onPress={onConfirm}
          loading={confirming}
        />
      </View>
    </SafeScreen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
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

  // Keys of goals that already have active courses — used for duplicate display
  const activeGoalKeys = activePlans.map((p) => normalizeGoalKey(p.goal));

  async function handleGoalSelect(goalKey: string) {
    if (!dog) return;

    setSelectedGoal(goalKey);
    setStep('generating');

    // Pre-generate the plan so the user sees a real preview
    const result = await addCourse({
      dog,
      goal: goalKey,
      makePrimary: false, // generate first as secondary; user can toggle
      accessToken: null,
    });

    if (!result.ok) {
      setErrorMessage(result.message);
      setStep('error');
      return;
    }

    setGeneratedPlan(result.plan);
    setStep('preview');
  }

  async function handleConfirm() {
    if (!dog || !generatedPlan || !selectedGoal) return;

    // If the user changed the primary toggle, we need to re-apply primary
    // assignment. The plan was already inserted in handleGoalSelect.
    setConfirming(true);
    try {
      if (makePrimary && !generatedPlan.isPrimary) {
        // Import lazily to avoid circular dep
        const { setPrimaryPlanInDB } = await import('@/lib/addCourse');
        const err = await setPrimaryPlanInDB(dog.id, generatedPlan.id);
        if (err) {
          setErrorMessage(`Couldn't set primary course: ${err}`);
          setConfirming(false);
          return;
        }
      }

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

  function handleCancel() {
    router.back();
  }

  function handleBackToSelect() {
    setStep('select');
    setSelectedGoal(null);
    setGeneratedPlan(null);
    setMakePrimary(false);
    setErrorMessage(null);
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (step === 'error') {
    return (
      <SafeScreen>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.md,
            paddingTop: spacing.md,
            paddingBottom: spacing.sm,
          }}
        >
          <TouchableOpacity
            onPress={handleBackToSelect}
            style={{ minHeight: 44, minWidth: 44, justifyContent: 'center' }}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}
        >
          <AppIcon name="help-circle" size={48} color={colors.text.secondary} />
          <Text
            variant="body"
            style={{
              textAlign: 'center',
              color: colors.text.secondary,
              marginTop: spacing.md,
              lineHeight: 24,
            }}
          >
            {errorMessage ?? 'Something went wrong. Please try again.'}
          </Text>
          <Button
            label="Go Back"
            variant="secondary"
            size="md"
            onPress={handleBackToSelect}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </SafeScreen>
    );
  }

  // ── Generating state ─────────────────────────────────────────────────────
  if (step === 'generating') {
    return (
      <SafeScreen>
        <GeneratingView />
      </SafeScreen>
    );
  }

  // ── Preview state ────────────────────────────────────────────────────────
  if (step === 'preview' && generatedPlan && selectedGoal) {
    return (
      <PlanPreviewStep
        goalKey={selectedGoal}
        plan={generatedPlan}
        makePrimary={makePrimary}
        onTogglePrimary={setMakePrimary}
        onConfirm={handleConfirm}
        onCancel={handleBackToSelect}
        confirming={confirming}
      />
    );
  }

  // ── Select state (default) ───────────────────────────────────────────────
  return (
    <GoalSelectionStep
      activeGoalKeys={activeGoalKeys}
      activePlanCount={activePlans.length}
      onSelect={handleGoalSelect}
      onCancel={handleCancel}
    />
  );
}
