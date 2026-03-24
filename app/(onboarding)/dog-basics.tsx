import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  TextInput,
  View,
  Platform,
} from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  runOnJS,
} from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { QuestionScreen } from '@/components/onboarding/QuestionScreen';
import { ScheduleSelector } from '@/components/onboarding/ScheduleSelector';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radii } from '@/constants/radii';
import { shadows } from '@/constants/shadows';
import { getGoalColor, hexToRgba, getContrastTextColor } from '@/constants/courseColors';
import { BREEDS_LIST } from '@/constants/breeds';
import { buildOnboardingInsight } from '@/lib/onboardingInsights';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { Weekday, TimeWindow, SessionStyle } from '@/types';

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  'welcome',         // 0
  'dogName',         // 1
  'primaryGoal',     // 2
  'severity',        // 3
  'environment',     // 4
  'analyzing',       // 5
  'insightReveal',   // 6
  'firstWin',        // 7
  'trainingTime',    // 8
  'experienceLevel', // 9
  'trainingDays',    // 10
  'scheduleStyle',   // 11
  'generatingPlan',  // 12
] as const;

type StepId = (typeof STEPS)[number];

// Screens 1-11 show progress
const PROGRESS_STEP_COUNT = 11;
const getProgressStep = (index: number) => {
  if (index === 0) return 0; // welcome
  if (index >= 12) return PROGRESS_STEP_COUNT; // generating
  return index;
};

// ─── Static data ──────────────────────────────────────────────────────────────

const PRIMARY_PROBLEM_OPTIONS = [
  { value: 'pulls_on_leash', label: 'Pulls on Leash', icon: 'walk' as const, description: 'Pulls towards triggers or scents' },
  { value: 'jumps_on_people', label: 'Jumps on People', icon: 'arrow-up-circle' as const, description: 'Excited greetings' },
  { value: 'barking', label: 'Barking', icon: 'volume-high' as const, description: 'Reacting to sounds or people' },
  { value: 'recall', label: "Won't Come", icon: 'return-down-back' as const, description: 'Ignores you when called' },
  { value: 'puppy_biting', label: 'Puppy Biting', icon: 'flash' as const, description: 'Nipping and mouthing' },
  { value: 'crate_anxiety', label: 'Crate Anxiety', icon: 'home' as const, description: 'Stressed when confined' },
];

const BEHAVIOR_OPTIONS = [
  { value: 'leash_pulling', label: 'Leash Pulling', icon: 'walk' as const, description: 'Pulls on walks' },
  { value: 'jumping_up', label: 'Jumping Up', icon: 'arrow-up-circle' as const, description: 'Jumps on people' },
  { value: 'barking', label: 'Barking', icon: 'volume-high' as const, description: 'Excessive barking' },
  { value: 'recall', label: "Won't Come", icon: 'return-down-back' as const, description: 'Ignores recall' },
  { value: 'potty_training', label: 'Potty Training', icon: 'water' as const, description: 'Accidents indoors' },
  { value: 'crate_anxiety', label: 'Crate Anxiety', icon: 'home' as const, description: 'Stressed in crate' },
  { value: 'puppy_biting', label: 'Puppy Biting', icon: 'flash' as const, description: 'Nipping/mouthing' },
  { value: 'settling', label: 'Settling', icon: 'moon' as const, description: 'Struggles to calm down' },
  { value: 'leave_it', label: 'Leave It', icon: 'hand-left' as const, description: 'Grabs or steals things' },
  { value: 'basic_obedience', label: 'Basic Obedience', icon: 'school' as const, description: 'Sit, down, stay' },
  { value: 'separation_anxiety', label: 'Separation Anxiety', icon: 'sad' as const, description: 'Distressed alone' },
  { value: 'door_manners', label: 'Door Manners', icon: 'exit' as const, description: 'Bolts out the door' },
  { value: 'impulse_control', label: 'Impulse Control', icon: 'pause-circle' as const, description: 'Impulsive & reactive' },
  { value: 'cooperative_care', label: 'Cooperative Care', icon: 'medkit' as const, description: 'Resists handling' },
  { value: 'wait_and_stay', label: 'Wait & Stay', icon: 'time' as const, description: 'Won\'t wait or stay' },
  { value: 'leash_reactivity', label: 'Leash Reactivity', icon: 'alert-circle' as const, description: 'Lunges on leash' },
  { value: 'sit', label: 'Sit', icon: 'chevron-down-circle' as const, description: 'Learning to sit' },
  { value: 'down', label: 'Down', icon: 'arrow-down-circle' as const, description: 'Learning to lie down' },
  { value: 'heel', label: 'Heel', icon: 'footsteps' as const, description: 'Formal heel position' },
];

const SESSION_LENGTH_OPTIONS = [
  { label: '5 min/day', description: 'Quick wins', icon: 'flash' as const, value: 5 },
  { label: '10 min/day', description: 'Steady progress', icon: 'time' as const, value: 10 },
  { label: '15 min/day', description: 'Solid sessions', icon: 'trending-up' as const, value: 15 },
  { label: 'Flexible', description: 'Varies by day', icon: 'fitness' as const, value: 20 },
];

const SEVERITY_OPTIONS = [
  { value: 'mild', label: 'Mild', description: 'Occasional issue', icon: 'happy' as const },
  { value: 'moderate', label: 'Moderate', description: 'Happens often', icon: 'alert-circle' as const },
  { value: 'severe', label: 'Severe', description: 'Daily struggle', icon: 'warning' as const },
];

const EXPERIENCE_OPTIONS = [
  { value: 'none', label: 'New to this', description: 'First dog or first time training', icon: 'paw' as const },
  { value: 'some', label: 'Tried some things', description: 'You know a few basics already', icon: 'book' as const },
  { value: 'experienced', label: 'Experienced', description: "You've trained dogs before", icon: 'school' as const },
];

const HOME_OPTIONS = [
  { value: 'apartment', label: 'Apartment', icon: 'business' as const },
  { value: 'house_no_yard', label: 'House, no yard', icon: 'home' as const },
  { value: 'house_yard', label: 'House with yard', icon: 'leaf' as const },
];

const SESSION_STYLE_OPTIONS = [
  { value: 'micro', label: 'Micro', description: 'Short, frequent bursts', icon: 'flash' as const },
  { value: 'balanced', label: 'Balanced', description: 'A steady, realistic mix', icon: 'git-branch' as const },
  { value: 'focused', label: 'Focused', description: 'Longer, deeper sessions', icon: 'bookmark' as const },
];

const SCHEDULE_FLEXIBILITY_OPTIONS = [
  { value: 'skip', label: 'Skip if missed', description: 'Just move on', icon: 'play-skip-forward' as const },
  { value: 'move_next_slot', label: 'Catch up later', description: 'Move to next slot', icon: 'repeat' as const },
  { value: 'move_tomorrow', label: 'Push to tomorrow', description: 'Try again next day', icon: 'calendar' as const },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ageLabel(ageMonths: number): string {
  const opt = AGE_OPTIONS.find((o) => o.ageMonths === ageMonths);
  if (opt) return `${opt.label} (${opt.description})`;
  if (ageMonths < 6) return 'Puppy';
  if (ageMonths <= 18) return 'Young dog';
  if (ageMonths <= 36) return 'Adult';
  return 'Senior';
}

function goalLabel(goal: string): string {
  return BEHAVIOR_OPTIONS.find((o) => o.value === goal)?.label ?? goal;
}

function timeWindowLabel(tw: string | null): string {
  if (!tw || tw === 'flexible') return 'Flexible timing';
  const map: Record<string, string> = {
    morning: 'Mornings',
    afternoon: 'Afternoons',
    evening: 'Evenings',
  };
  return map[tw] ?? tw;
}

// ─── GoalChip ─────────────────────────────────────────────────────────────────


// ─── Main component ───────────────────────────────────────────────────────────

export default function DogBasicsScreen() {
  const router = useRouter();
  const { step } = useLocalSearchParams<{ step?: string }>();
  const setField = useOnboardingStore((s) => s.setField);
  const stored = useOnboardingStore((s) => s);

  const [currentStepIndex, setCurrentStepIndex] = useState(step ? parseInt(step, 10) : 0);

  useEffect(() => {
    if (step) {
      const idx = parseInt(step, 10);
      if (!isNaN(idx)) {
        setCurrentStepIndex(idx);
      }
    }
  }, [step]);

  // Local form state — seeded from store so returning mid-flow preserves values
  // Written back to store in batch at step 12 (generatingPlan)
  const [dogName, setDogName] = useState(stored.dogName || '');
  const [primaryGoal, setPrimaryGoal] = useState(stored.primaryGoal || '');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>(stored.severity || 'moderate');
  const [trainingExperience, setTrainingExperience] = useState<'none' | 'some' | 'experienced'>(stored.trainingExperience || 'none');
  const [environmentType, setEnvironmentType] = useState<'apartment' | 'house_no_yard' | 'house_yard'>(stored.environmentType || 'house_yard');
  const [hasKids, setHasKids] = useState(stored.hasKids ?? false);
  const [hasOtherPets, setHasOtherPets] = useState(stored.hasOtherPets ?? false);
  const [availableDaysPerWeek, setAvailableDaysPerWeek] = useState(stored.availableDaysPerWeek || 3);
  const [availableMinutesPerDay, setAvailableMinutesPerDay] = useState(stored.availableMinutesPerDay || 10);
  const [preferredDays, setPreferredDays] = useState<Weekday[]>(stored.preferredTrainingDays || []);
  const [timeWindow, setTimeWindow] = useState<string | null>(null);
  const [sessionStyle, setSessionStyle] = useState<SessionStyle>(stored.sessionStyle || 'balanced');
  const [scheduleFlexibility, setScheduleFlexibility] = useState(stored.scheduleFlexibility || 'move_next_slot');

  // Breed search
  const breedResults =
    breedQuery.length > 0
      ? BREEDS_LIST.filter((b) =>
          b.toLowerCase().startsWith(breedQuery.toLowerCase())
        ).slice(0, 8)
      : [];

  // ─── Slide + fade transition ────────────────────────────────────────────

  const translateX = useSharedValue(0);
  const animOpacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: animOpacity.value,
  }));

  const navigateTo = (nextIndex: number, dir: 'forward' | 'back') => {
    const exitX = dir === 'forward' ? -30 : 30;
    const enterX = dir === 'forward' ? 30 : -30;
    translateX.value = withTiming(exitX, { duration: 180 });
    animOpacity.value = withTiming(0, { duration: 180 }, () => {
      translateX.value = enterX;
      runOnJS(setCurrentStepIndex)(nextIndex);
      translateX.value = withTiming(0, { duration: 220 });
      animOpacity.value = withTiming(1, { duration: 220 });
    });
  };

  const goForward = () => { navigateTo(currentStepIndex + 1, 'forward'); };
  const goBack = () => { navigateTo(currentStepIndex - 1, 'back'); };

  // ─── Batch write + push to plan-preview ──────────────────────────────────

  const hasWritten = useRef(false);

  useEffect(() => {
    const stepId = STEPS[currentStepIndex];
    if (stepId !== 'generatingPlan' || hasWritten.current) return;
    hasWritten.current = true;

    const windows: Partial<Record<Weekday, TimeWindow[]>> = {};
    if (timeWindow && timeWindow !== 'flexible') {
      for (const day of preferredDays) {
        windows[day] = [timeWindow as TimeWindow];
      }
    }

    setField('dogName', dogName.trim());
    setField('ageMonths', 18); // Default to adolescent/adult for safety
    setField('breed', 'Mixed Breed'); // Default for high-conversion flow
    setField('sex', 'male'); // Internal default
    setField('neutered', true); // Safe default for training expectations
    setField('primaryGoal', primaryGoal);
    setField('secondaryGoals', []); // Remove secondary goals from primary flow
    setField('severity', severity);
    setField('trainingExperience', trainingExperience);
    setField('environmentType', environmentType);
    setField('hasKids', hasKids);
    setField('hasOtherPets', hasOtherPets);
    setField('availableDaysPerWeek', availableDaysPerWeek);
    setField('availableMinutesPerDay', availableMinutesPerDay);
    setField('preferredTrainingDays', preferredDays);
    setField('preferredTrainingWindows', windows);
    setField('preferredTrainingTimes', {});
    setField('sessionStyle', sessionStyle);
    setField('scheduleFlexibility', scheduleFlexibility as any);
    setField('scheduleIntensity', 'balanced');
    setField('blockedDays', []);
    setField('blockedDates', []);
    setField('usualWalkTimes', []);
    setField('scheduleNotes', '');
    setField('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
    setField('equipment', []);
    setField('videoUri', null);
    setField('videoUploadPath', null);
    setField('videoContext', '');

    router.push('/(onboarding)/plan-preview');
  }, [currentStepIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Render ───────────────────────────────────────────────────────────────

  const stepId = STEPS[currentStepIndex] as StepId;
  const progressStep = getProgressStep(currentStepIndex);

  return (
    <Animated.View style={[{ flex: 1, backgroundColor: colors.bg.app }, animatedStyle]}>
      {stepId === 'welcome' && <WelcomeStep onStart={goForward} onBack={() => router.replace('/(auth)/welcome')} />}

      {stepId === 'dogName' && (
        <QuestionScreen
          title="What's your dog's name?"
          subtitle="We'll use this to personalize your experience."
          canContinue={dogName.trim().length > 0}
          onContinue={() => {
            setField('dogName', dogName.trim());
            goForward();
          }}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <Input
            value={dogName}
            onChangeText={setDogName}
            placeholder="e.g. Buddy"
            autoFocus
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={() => dogName.trim().length > 0 && goForward()}
            inputStyle={{ fontSize: 22, height: 64 }}
          />
        </QuestionScreen>
      )}

      {stepId === 'primaryGoal' && (
        <QuestionScreen
          title={`What's the main issue with ${dogName}?`}
          canContinue={primaryGoal !== ''}
          onContinue={goForward}
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <View style={{ gap: spacing.sm }}>
            {PRIMARY_PROBLEM_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                icon={opt.icon}
                label={opt.label}
                description={opt.description}
                selected={primaryGoal === opt.value}
                onPress={() => {
                  setPrimaryGoal(opt.value);
                }}
                layout="horizontal"
                size="md"
              />
            ))}
          </View>
        </QuestionScreen>
      )}

      {stepId === 'analyzing' && (
        <AnalyzingStep dogName={dogName} onComplete={goForward} />
      )}

      {stepId === 'insightReveal' && (
        <InsightRevealStep
          params={{
            dogName,
            primaryProblem: primaryGoal,
            severity,
            environmentType,
            hasKids,
            hasOtherPets,
          }}
          onContinue={goForward}
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        />
      )}

      {stepId === 'firstWin' && (
        <FirstWinStep
          dogName={dogName}
          primaryGoal={primaryGoal}
          onContinue={goForward}
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        />
      )}

      {stepId === 'severity' && (
        <QuestionScreen
          title="How bad is it?"
          canContinue
          onContinue={goForward}
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <View style={{ gap: spacing.sm }}>
            {SEVERITY_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                icon={opt.icon}
                label={opt.label}
                description={opt.description}
                selected={severity === opt.value}
                onPress={() => setSeverity(opt.value as typeof severity)}
                layout="horizontal"
                size="md"
              />
            ))}
          </View>
        </QuestionScreen>
      )}

      {stepId === 'environment' && (
        <QuestionScreen
          title={`Tell us about ${dogName}'s world`}
          canContinue
          onContinue={goForward}
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <View style={{ gap: spacing.xl }}>
            <View style={{ gap: spacing.sm }}>
              <Text variant="h3" style={{ color: colors.text.primary }}>Home Type</Text>
              <View style={{ gap: spacing.sm }}>
                {HOME_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    icon={opt.icon}
                    label={opt.label}
                    selected={environmentType === opt.value}
                    onPress={() => setEnvironmentType(opt.value as typeof environmentType)}
                    layout="horizontal"
                    size="md"
                  />
                ))}
              </View>
            </View>

            <View style={{ gap: spacing.sm }}>
              <Text variant="h3" style={{ color: colors.text.primary }}>Household</Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <OptionCard
                  icon="people"
                  label="Kids"
                  selected={hasKids}
                  onPress={() => setHasKids((v) => !v)}
                  layout="vertical"
                />
                <OptionCard
                  icon="paw"
                  label="Other Pets"
                  selected={hasOtherPets}
                  onPress={() => setHasOtherPets((v) => !v)}
                  layout="vertical"
                />
              </View>
            </View>
          </View>
        </QuestionScreen>
      )}

      {stepId === 'trainingTime' && (
        <QuestionScreen
          title="How much time can you realistically train?"
          canContinue
          onContinue={goForward}
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <View style={{ gap: spacing.sm }}>
            {SESSION_LENGTH_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                icon={opt.icon}
                label={opt.label}
                description={opt.description}
                selected={availableMinutesPerDay === opt.value}
                onPress={() => setAvailableMinutesPerDay(opt.value)}
                layout="horizontal"
                size="md"
              />
            ))}
          </View>
        </QuestionScreen>
      )}

      {stepId === 'experienceLevel' && (
        <QuestionScreen
          title="What's your experience level?"
          canContinue
          onContinue={goForward}
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <View style={{ gap: spacing.sm }}>
            {EXPERIENCE_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                icon={opt.icon}
                label={opt.label}
                description={opt.description}
                selected={trainingExperience === opt.value}
                onPress={() => setTrainingExperience(opt.value as typeof trainingExperience)}
                layout="horizontal"
                size="md"
              />
            ))}
          </View>
        </QuestionScreen>
      )}

      {stepId === 'trainingDays' && (
        <QuestionScreen
          title="When would you like to train?"
          subtitle="Choose the frequency and days that work for you."
          canContinue={availableDaysPerWeek > 0}
          onContinue={goForward}
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <View style={{ gap: spacing.xl }}>
            <View style={{ gap: spacing.md }}>
              <Text variant="bodyStrong" style={{ color: colors.text.secondary }}>Days per week</Text>
              <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between' }}>
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <Pressable
                    key={num}
                    onPress={() => setAvailableDaysPerWeek(num)}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      backgroundColor: availableDaysPerWeek === num ? colors.brand.primary : colors.bg.surfaceAlt,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: availableDaysPerWeek === num ? colors.brand.primary : colors.border.soft,
                    }}
                  >
                    <Text
                      variant="bodyStrong"
                      style={{ color: availableDaysPerWeek === num ? '#fff' : colors.text.primary }}
                    >
                      {num}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={{ gap: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="bodyStrong" style={{ color: colors.text.secondary }}>Preferred days</Text>
                <Text variant="caption" style={{ color: colors.text.secondary }}>Optional</Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as Weekday[]).map((day) => (
                  <Pressable
                    key={day}
                    onPress={() => setPreferredDays(prev =>
                      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                    )}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: preferredDays.includes(day) ? `${colors.brand.primary}15` : colors.bg.surface,
                      borderWidth: 1,
                      borderColor: preferredDays.includes(day) ? colors.brand.primary : colors.border.soft,
                    }}
                  >
                    <Text
                      variant="caption"
                      style={{
                        color: preferredDays.includes(day) ? colors.brand.primary : colors.text.primary,
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}
                    >
                      {day.slice(0, 3)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </QuestionScreen>
      )}

      {stepId === 'scheduleStyle' && (
        <QuestionScreen
          title="Finalizing your schedule"
          canContinue
          onContinue={goForward}
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <View style={{ gap: spacing.xl }}>
            <View style={{ gap: spacing.sm }}>
              <Text variant="h3" style={{ color: colors.text.primary }}>Session Style</Text>
              <View style={{ gap: spacing.sm }}>
                {SESSION_STYLE_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    icon={opt.icon}
                    label={opt.label}
                    description={opt.description}
                    selected={sessionStyle === opt.value}
                    onPress={() => setSessionStyle(opt.value as SessionStyle)}
                    layout="horizontal"
                    size="md"
                  />
                ))}
              </View>
            </View>

            <View style={{ gap: spacing.sm }}>
              <Text variant="h3" style={{ color: colors.text.primary }}>If you miss a session</Text>
              <View style={{ gap: spacing.sm }}>
                {SCHEDULE_FLEXIBILITY_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    icon={opt.icon}
                    label={opt.label}
                    description={opt.description}
                    selected={scheduleFlexibility === opt.value}
                    onPress={() => setScheduleFlexibility(opt.value as any)}
                    layout="horizontal"
                    size="md"
                  />
                ))}
              </View>
            </View>
          </View>
        </QuestionScreen>
      )}


      {stepId === 'generatingPlan' && <GeneratingStep />}
    </Animated.View>
  );
}

// ─── Welcome screen ───────────────────────────────────────────────────────────

function WelcomeStep({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const pawScale = useSharedValue(1);

  useEffect(() => {
    pawScale.value = withRepeat(withTiming(1.08, { duration: 1000 }), -1, true);
  }, [pawScale]);

  const pawStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pawScale.value }],
  }));

  return (
    <LinearGradient
      colors={[`${colors.brand.primary}10`, colors.bg.app, colors.bg.app]}
      locations={[0, 0.45, 1]}
      style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom + spacing.xl }}
    >
      {/* Subtle bottom-left green wash */}
      <LinearGradient
        colors={['transparent', `${colors.brand.primary}08`]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', inset: 0 }}
        pointerEvents="none"
      />

      <Pressable
        onPress={onBack}
        hitSlop={12}
        style={{ position: 'absolute', top: insets.top + spacing.sm, left: spacing.lg, zIndex: 10, padding: spacing.xs }}
      >
        <AppIcon name="chevron-back" size={26} color={colors.text.secondary} />
      </Pressable>

      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.xl,
          gap: spacing.lg,
        }}
      >
        {/* Hero icon — layered rings like train screen hero cards */}
        <Animated.View style={pawStyle}>
          <View
            style={{
              width: 116,
              height: 116,
              borderRadius: 58,
              backgroundColor: `${colors.brand.primary}10`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: `${colors.brand.primary}1A`,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: `${colors.brand.primary}25`,
              }}
            >
              <AppIcon name="paw" size={44} color={colors.brand.primary} />
            </View>
          </View>
        </Animated.View>

        <View style={{ alignItems: 'center', gap: 6 }}>
          <Text
            style={{
              fontSize: 34,
              lineHeight: 42,
              fontWeight: '800',
              color: colors.text.primary,
              letterSpacing: -1,
              textAlign: 'center',
            }}
          >
            Let's fix your dog's behavior
          </Text>
          <Text
            style={{
              fontSize: 18,
              color: colors.text.secondary,
              fontWeight: '500',
              textAlign: 'center',
              letterSpacing: 0.1,
            }}
          >
            Personalized training in minutes
          </Text>
        </View>

        {/* Feature list — icon style matches train screen icon circles */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={{
            gap: 12,
            marginTop: spacing.sm,
            backgroundColor: colors.bg.surface,
            borderRadius: 20,
            padding: spacing.lg,
            borderWidth: 1.5,
            borderColor: colors.border.soft,
            alignSelf: 'stretch',
          }}
        >
          {[
            { icon: 'sparkles' as const, text: 'Custom plan for your dog' },
            { icon: 'calendar' as const, text: 'Fits into your daily routine' },
            { icon: 'trending-up' as const, text: 'See results in just 5 mins/day' },
          ].map((item, i) => (
            <View
              key={item.text}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                paddingBottom: i < 2 ? 12 : 0,
                borderBottomWidth: i < 2 ? 1 : 0,
                borderBottomColor: colors.border.soft,
              }}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: `${colors.brand.primary}15`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppIcon name={item.icon} size={18} color={colors.brand.primary} />
              </View>
              <Text variant="body" color={colors.text.primary} style={{ fontWeight: '500', flex: 1 }}>
                {item.text}
              </Text>
            </View>
          ))}
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInDown.delay(600).duration(400)}
        style={{ paddingHorizontal: spacing.xl, gap: spacing.xs }}
      >
        <Button label="Get Started →" onPress={onStart} size="lg" />
        <Text
          variant="caption"
          color={colors.text.secondary}
          style={{ textAlign: 'center', marginTop: 4 }}
        >
          Takes about 60 seconds
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}


// ─── Phase 1.5 screens ────────────────────────────────────────────────────────

function AnalyzingStep({ dogName, onComplete }: { dogName: string; onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(withTiming(1.15, { duration: 800 }), -1, true);
  }, [scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.app, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.xl }}>
      <Animated.View style={animStyle}>
        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: `${colors.brand.primary}15`, alignItems: 'center', justifyContent: 'center' }}>
          <AppIcon name="sparkles" size={48} color={colors.brand.primary} />
        </View>
      </Animated.View>
      <View style={{ gap: spacing.sm, alignItems: 'center' }}>
        <Text variant="h2" style={{ textAlign: 'center', fontWeight: '700' }}>
          Analyzing {dogName}…
        </Text>
        <Text variant="body" style={{ textAlign: 'center', color: colors.text.secondary, lineHeight: 24 }}>
          Building a training starting point based on your dog’s behavior and environment.
        </Text>
      </View>
    </View>
  );
}

function InsightRevealStep({
  params,
  onContinue,
  onBack,
  currentStep,
  totalSteps,
}: {
  params: Parameters<typeof buildOnboardingInsight>[0];
  onContinue: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}) {
  const insight = buildOnboardingInsight(params);

  return (
    <QuestionScreen
      title={insight.title}
      canContinue
      onContinue={onContinue}
      onBack={onBack}
      currentStep={currentStep}
      totalSteps={totalSteps}
      continueLabel="See Your Plan"
    >
      <View style={{ gap: spacing.lg }}>
        <Text variant="body" style={{ fontSize: 17, lineHeight: 26, color: colors.text.primary }}>
          {insight.summary}
        </Text>

        <View style={{ gap: spacing.md }}>
          <Text variant="bodyStrong" style={{ color: colors.text.secondary, textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 }}>
            Focus Areas
          </Text>
          <View style={{ gap: spacing.sm }}>
            {insight.focusAreas.map((area, i) => (
              <Animated.View
                key={area}
                entering={FadeInDown.delay(i * 150).duration(400)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: colors.bg.surface,
                  padding: spacing.md,
                  borderRadius: radii.md,
                  borderWidth: 1,
                  borderColor: colors.border.soft,
                  ...shadows.card,
                }}
              >
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: `${colors.brand.primary}10`, alignItems: 'center', justifyContent: 'center' }}>
                  <AppIcon name="checkmark" size={16} color={colors.brand.primary} />
                </View>
                <Text variant="bodyStrong" style={{ color: colors.text.primary }}>{area}</Text>
              </Animated.View>
            ))}
          </View>
        </View>
      </View>
    </QuestionScreen>
  );
}

function FirstWinStep({
  dogName,
  primaryGoal,
  onContinue,
  onBack,
  currentStep,
  totalSteps,
}: {
  dogName: string;
  primaryGoal: string;
  onContinue: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}) {
  const goalLabel = PRIMARY_PROBLEM_OPTIONS.find(o => o.value === primaryGoal)?.label || "training";

  return (
    <QuestionScreen
      title="Your first win"
      canContinue
      onContinue={onContinue}
      onBack={onBack}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <View style={{ gap: spacing.lg }}>
        <Text variant="body" style={{ fontSize: 17, lineHeight: 26, color: colors.text.primary }}>
          We’ll start with a small, manageable success to build momentum.
        </Text>

        <View
          style={{
            backgroundColor: `${colors.brand.secondary}08`,
            borderRadius: radii.lg,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: `${colors.brand.secondary}20`,
            gap: spacing.md,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.brand.secondary, alignItems: 'center', justifyContent: 'center' }}>
              <AppIcon name="play" size={20} color="#fff" />
            </View>
            <View>
              <Text variant="caption" style={{ color: colors.brand.secondary, fontWeight: '700', textTransform: 'uppercase' }}>Session 1</Text>
              <Text variant="bodyStrong" style={{ fontSize: 18 }}>Foundation Focus</Text>
            </View>
          </View>
          <Text variant="body" style={{ color: colors.text.secondary, lineHeight: 22 }}>
            A short 3–5 minute exercise to help {dogName} stay calmer and build focus before we tackle {goalLabel.toLowerCase()}.
          </Text>
        </View>
      </View>
    </QuestionScreen>
  );
}

// ─── Generating screen ────────────────────────────────────────────────────────

function GeneratingStep() {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(withTiming(1.12, { duration: 800 }), -1, true);
  }, [scale]);

  const pawStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg.app,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.lg,
      }}
    >
      <Animated.View style={pawStyle}>
        <AppIcon name="paw" size={64} color={colors.brand.primary} />
      </Animated.View>
      <Text variant="body" color={colors.text.secondary} style={{ textAlign: 'center' }}>
        Building your plan…
      </Text>
    </View>
  );
}
