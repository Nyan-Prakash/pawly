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
import { BREEDS_LIST } from '@/constants/breeds';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { Weekday, TimeWindow, SessionStyle } from '@/types';

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  'welcome',         // 0
  'dogName',         // 1
  'dogAge',          // 2
  'dogBreed',        // 3
  'dogSexNeutered',  // 4
  'primaryGoal',     // 5
  'secondaryGoals',  // 6
  'severity',        // 7
  'experienceLevel', // 8
  'homeSetup',       // 9
  'household',       // 10
  'daysPerWeek',     // 11
  'sessionLength',   // 12
  'preferredDays',   // 13
  'timeOfDay',       // 14
  'sessionStyle',    // 15
  'summary',         // 16
  'generatingPlan',  // 17
] as const;

type StepId = (typeof STEPS)[number];

// Steps 1–16 show progress; welcome (0) and generating (17) do not
const PROGRESS_STEP_COUNT = 16;
const getProgressStep = (index: number) => Math.max(0, index - 1);

// ─── Static data ──────────────────────────────────────────────────────────────

const BEHAVIOR_OPTIONS = [
  { value: 'leash_pulling', label: 'Leash Pulling', icon: 'walk' as const, description: 'Pulls on walks' },
  { value: 'jumping_up', label: 'Jumping Up', icon: 'arrow-up-circle' as const, description: 'Jumps on people' },
  { value: 'barking', label: 'Barking', icon: 'volume-high' as const, description: 'Excessive barking' },
  { value: 'recall', label: "Won't Come", icon: 'return-down-back' as const, description: 'Ignores recall' },
  { value: 'potty_training', label: 'Potty Training', icon: 'water' as const, description: 'Accidents indoors' },
  { value: 'crate_anxiety', label: 'Crate Anxiety', icon: 'home' as const, description: 'Stressed in crate' },
  { value: 'puppy_biting', label: 'Puppy Biting', icon: 'flash' as const, description: 'Nipping/mouthing' },
  { value: 'settling', label: 'Settling', icon: 'moon' as const, description: 'Struggles to calm down' },
];

const AGE_OPTIONS = [
  { label: 'Puppy', description: '< 6 months', emoji: '🐾', ageMonths: 4 },
  { label: 'Young', description: '6–18 months', emoji: '⚡', ageMonths: 12 },
  { label: 'Adult', description: '1–3 years', emoji: '🎯', ageMonths: 24 },
  { label: 'Senior', description: '3+ years', emoji: '⭐', ageMonths: 48 },
];

const SESSION_LENGTH_OPTIONS = [
  { label: '5 min', description: 'Quick wins', icon: 'flash' as const, value: 5 },
  { label: '10 min', description: 'Steady progress', icon: 'time' as const, value: 10 },
  { label: '15 min', description: 'Solid sessions', icon: 'trending-up' as const, value: 15 },
  { label: '20+ min', description: 'Deep training', icon: 'fitness' as const, value: 20 },
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
  { value: 'micro', label: 'Micro', description: 'Short bursts, high frequency', icon: 'flash' as const },
  { value: 'balanced', label: 'Balanced', description: 'A steady, realistic mix', icon: 'git-branch' as const },
  { value: 'focused', label: 'Focused', description: 'Fewer sessions, longer reps', icon: 'bookmark' as const },
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
  // Written back to store in batch at step 17 (generatingPlan)
  const [dogName, setDogName] = useState(stored.dogName || '');
  const [ageMonths, setAgeMonths] = useState(stored.ageMonths || 12);
  const [breed, setBreed] = useState(stored.breed || '');
  const [breedQuery, setBreedQuery] = useState(stored.breed || '');
  const [breedFocused, setBreedFocused] = useState(false);
  const [sex, setSex] = useState<'male' | 'female'>(stored.sex || 'male');
  const [neutered, setNeutered] = useState(stored.neutered ?? false);
  const [primaryGoal, setPrimaryGoal] = useState(stored.primaryGoal || '');
  const [secondaryGoals, setSecondaryGoals] = useState<string[]>(stored.secondaryGoals || []);
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

  const goForward = () => navigateTo(currentStepIndex + 1, 'forward');
  const goBack = () => navigateTo(currentStepIndex - 1, 'back');

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
    setField('ageMonths', ageMonths);
    setField('breed', breed);
    setField('sex', sex);
    setField('neutered', neutered);
    setField('primaryGoal', primaryGoal);
    setField('secondaryGoals', secondaryGoals);
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
    setField('scheduleFlexibility', 'move_next_slot');
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
          subtitle="This is how we'll refer to them throughout the app."
          canContinue={dogName.trim().length > 0}
          onContinue={goForward}
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

      {stepId === 'dogAge' && (
        <QuestionScreen
          title={dogName ? `How old is ${dogName}?` : 'How old is your dog?'}
          canContinue
          onContinue={goForward}
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {AGE_OPTIONS.map((opt) => (
              <View key={opt.ageMonths} style={{ width: '47.5%' }}>
                <OptionCard
                  emoji={opt.emoji}
                  label={opt.label}
                  description={opt.description}
                  selected={ageMonths === opt.ageMonths}
                  onPress={() => setAgeMonths(opt.ageMonths)}
                  layout="vertical"
                  size="lg"
                />
              </View>
            ))}
          </View>
        </QuestionScreen>
      )}

      {stepId === 'dogBreed' && (
        <QuestionScreen
          title="What breed is your dog?"
          subtitle="Optional — helps us tailor advice."
          canContinue
          onContinue={goForward}
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
          continueLabel={breed ? 'Continue' : 'Skip for now'}
          scrollable={false}
        >
          <View style={{ zIndex: 10 }}>
            <TextInput
              value={breedQuery}
              onChangeText={(t) => {
                setBreedQuery(t);
                if (!t) setBreed('');
              }}
              onFocus={() => setBreedFocused(true)}
              onBlur={() => setTimeout(() => setBreedFocused(false), 150)}
              placeholder="Search breed…"
              placeholderTextColor={`${colors.text.secondary}80`}
              autoCapitalize="words"
              style={{
                backgroundColor: colors.bg.surfaceAlt,
                borderRadius: radii.md,
                borderWidth: 1.5,
                borderColor: breedFocused ? colors.brand.primary : colors.border.default,
                paddingHorizontal: 16,
                height: 52,
                fontSize: 16,
                color: colors.text.primary,
              }}
            />
            {breedFocused && breedResults.length > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: 56,
                  left: 0,
                  right: 0,
                  backgroundColor: colors.bg.surface,
                  borderRadius: radii.md,
                  borderWidth: 1,
                  borderColor: colors.border.default,
                  zIndex: 100,
                  ...(Platform.OS === 'android'
                    ? { elevation: 10 }
                    : {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                      }),
                }}
              >
                {breedResults.map((b) => (
                  <Pressable
                    key={b}
                    onPress={() => {
                      setBreed(b);
                      setBreedQuery(b);
                      setBreedFocused(false);
                    }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border.soft,
                    }}
                  >
                    <Text variant="body" color={colors.text.primary}>{b}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </QuestionScreen>
      )}

      {stepId === 'dogSexNeutered' && (
        <QuestionScreen
          title="Tell us a bit more"
          canContinue
          onContinue={() => {
            // Save current form state to store before leaving
            setField('dogName', dogName.trim());
            setField('ageMonths', ageMonths);
            setField('breed', breed);
            setField('sex', sex);
            setField('neutered', neutered);
            router.push('/(onboarding)/dog-photo');
          }}
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <View style={{ gap: spacing.xl }}>
            <View style={{ gap: spacing.sm }}>
              <Text variant="h3" style={{ color: colors.text.primary }}>Sex</Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <OptionCard
                  icon="male-sharp"
                  label="Male"
                  selected={sex === 'male'}
                  onPress={() => setSex('male')}
                  layout="vertical"
                />
                <OptionCard
                  icon="female-sharp"
                  label="Female"
                  selected={sex === 'female'}
                  onPress={() => setSex('female')}
                  layout="vertical"
                />
              </View>
            </View>

            <View style={{ gap: spacing.sm }}>
              <Text variant="h3" style={{ color: colors.text.primary }}>
                {sex === 'male' ? 'Neutered?' : 'Spayed?'}
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <OptionCard
                  label="Yes"
                  icon="checkmark-circle"
                  selected={neutered}
                  onPress={() => setNeutered(true)}
                  layout="vertical"
                />
                <OptionCard
                  label="No"
                  icon="close-circle"
                  selected={!neutered}
                  onPress={() => setNeutered(false)}
                  layout="vertical"
                />
              </View>
            </View>
          </View>
        </QuestionScreen>
      )}

      {stepId === 'primaryGoal' && (
        <QuestionScreen
          title="What's the #1 thing you want to fix?"
          subtitle="Pick the most important challenge to tackle first."
          canContinue={primaryGoal !== ''}
          onContinue={goForward}
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {BEHAVIOR_OPTIONS.map((opt) => (
              <View key={opt.value} style={{ width: '47.5%' }}>
                <OptionCard
                  icon={opt.icon}
                  label={opt.label}
                  description={opt.description}
                  selected={primaryGoal === opt.value}
                  onPress={() => {
                    setPrimaryGoal(opt.value);
                    setSecondaryGoals((sg) => sg.filter((g) => g !== opt.value));
                  }}
                  layout="vertical"
                  size="md"
                />
              </View>
            ))}
          </View>
        </QuestionScreen>
      )}

      {stepId === 'secondaryGoals' && (
        <QuestionScreen
          title="Any other challenges?"
          subtitle={
            secondaryGoals.length > 0
              ? `${secondaryGoals.length} of 2 selected. Optional.`
              : 'Optional — pick up to 2 more.'
          }
          canContinue
          onContinue={goForward}
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {BEHAVIOR_OPTIONS.map((opt) => {
              const isPrimary = opt.value === primaryGoal;
              const isSelected = secondaryGoals.includes(opt.value);
              return (
                <View key={opt.value} style={{ width: '47.5%' }}>
                  <OptionCard
                    icon={opt.icon}
                    label={opt.label}
                    description={opt.description}
                    selected={isPrimary || isSelected}
                    disabled={isPrimary}
                    badge={isPrimary ? 'Primary' : undefined}
                    onPress={() => {
                      if (isPrimary) return;
                      setSecondaryGoals((sg) =>
                        sg.includes(opt.value)
                          ? sg.filter((g) => g !== opt.value)
                          : sg.length < 2
                          ? [...sg, opt.value]
                          : sg
                      );
                    }}
                    layout="vertical"
                    size="md"
                  />
                </View>
              );
            })}
          </View>
        </QuestionScreen>
      )}

      {stepId === 'severity' && (
        <QuestionScreen
          title={`How severe is ${dogName || 'your dog'}'s ${goalLabel(primaryGoal)}?`}
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

      {stepId === 'experienceLevel' && (
        <QuestionScreen
          title="How experienced are you with dog training?"
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

      {stepId === 'homeSetup' && (
        <QuestionScreen
          title={`Where does ${dogName || 'your dog'} live?`}
          canContinue
          onContinue={goForward}
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
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
        </QuestionScreen>
      )}

      {stepId === 'household' && (
        <QuestionScreen
          title="About your household"
          subtitle="This helps us personalise training advice."
          canContinue
          onContinue={goForward}
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <View style={{ gap: spacing.sm }}>
            <OptionCard
              icon="people"
              label="Kids at home"
              description="Young children live with you"
              selected={hasKids}
              onPress={() => setHasKids((v) => !v)}
              layout="horizontal"
              size="md"
            />
            <OptionCard
              icon="paw"
              label="Other pets"
              description="Other animals live with you"
              selected={hasOtherPets}
              onPress={() => setHasOtherPets((v) => !v)}
              layout="horizontal"
              size="md"
            />
          </View>
        </QuestionScreen>
      )}

      {stepId === 'daysPerWeek' && (
        <QuestionScreen
          title="How many days a week can you train?"
          subtitle="Be realistic — consistency beats intensity."
          canContinue
          onContinue={goForward}
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
          scrollable={false}
        >
          <View style={{ alignItems: 'center', gap: spacing.xl }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xl }}>
              <Pressable
                onPress={() => setAvailableDaysPerWeek((d) => Math.max(1, d - 1))}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  borderWidth: 1.5,
                  borderColor: colors.border.default,
                  backgroundColor: colors.bg.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppIcon name="remove" size={22} color={colors.text.primary} />
              </Pressable>

              <View style={{ alignItems: 'center', minWidth: 80 }}>
                <Text style={{ fontSize: 52, fontWeight: '800', color: colors.brand.primary, lineHeight: 60 }}>
                  {availableDaysPerWeek}
                </Text>
                <Text variant="caption" color={colors.text.secondary}>
                  {availableDaysPerWeek === 1 ? 'day' : 'days'} per week
                </Text>
              </View>

              <Pressable
                onPress={() => setAvailableDaysPerWeek((d) => Math.min(7, d + 1))}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  borderWidth: 1.5,
                  borderColor: colors.border.default,
                  backgroundColor: colors.bg.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppIcon name="add" size={22} color={colors.text.primary} />
              </Pressable>
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Pressable
                  key={i}
                  onPress={() => setAvailableDaysPerWeek(i)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor:
                      i <= availableDaysPerWeek ? colors.brand.primary : colors.border.soft,
                  }}
                />
              ))}
            </View>
          </View>
        </QuestionScreen>
      )}

      {stepId === 'sessionLength' && (
        <QuestionScreen
          title="How long per session?"
          subtitle="Short and consistent beats long and sporadic."
          canContinue
          onContinue={goForward}
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {SESSION_LENGTH_OPTIONS.map((opt) => (
              <View key={opt.value} style={{ width: '47.5%' }}>
                <OptionCard
                  icon={opt.icon}
                  label={opt.label}
                  description={opt.description}
                  selected={availableMinutesPerDay === opt.value}
                  onPress={() => setAvailableMinutesPerDay(opt.value)}
                  layout="vertical"
                  size="md"
                />
              </View>
            ))}
          </View>
        </QuestionScreen>
      )}

      {stepId === 'preferredDays' && (
        <QuestionScreen
          title="Which days work best?"
          subtitle="Pick the days you can actually show up."
          canContinue={preferredDays.length > 0}
          onContinue={goForward}
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <ScheduleSelector
            selectedDays={preferredDays}
            onToggleDay={(day) =>
              setPreferredDays((ds) =>
                ds.includes(day) ? ds.filter((d) => d !== day) : [...ds, day]
              )
            }
          />
        </QuestionScreen>
      )}

      {stepId === 'timeOfDay' && (
        <QuestionScreen
          title="What time of day works best?"
          subtitle="We'll schedule sessions around your routine."
          canContinue={timeWindow !== null}
          onContinue={goForward}
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <ScheduleSelector
            selectedDays={preferredDays}
            onToggleDay={(day) =>
              setPreferredDays((ds) =>
                ds.includes(day) ? ds.filter((d) => d !== day) : [...ds, day]
              )
            }
            selectedTimeWindow={timeWindow}
            onSelectTimeWindow={setTimeWindow}
          />
        </QuestionScreen>
      )}

      {stepId === 'sessionStyle' && (
        <QuestionScreen
          title="What training style fits your lifestyle?"
          canContinue
          onContinue={goForward}
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
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
        </QuestionScreen>
      )}

      {stepId === 'summary' && (
        <SummaryStep
          dogName={dogName}
          ageMonths={ageMonths}
          breed={breed}
          primaryGoal={primaryGoal}
          severity={severity}
          trainingExperience={trainingExperience}
          environmentType={environmentType}
          availableDaysPerWeek={availableDaysPerWeek}
          availableMinutesPerDay={availableMinutesPerDay}
          preferredDays={preferredDays}
          timeWindow={timeWindow}
          sessionStyle={sessionStyle}
          progressStep={progressStep}
          onBack={goBack}
          onContinue={goForward}
        />
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
              fontSize: 42,
              lineHeight: 50,
              fontWeight: '800',
              color: colors.brand.primary,
              letterSpacing: -1.5,
            }}
          >
            Pawly
          </Text>
          <Text
            style={{
              fontSize: 17,
              color: colors.text.secondary,
              fontWeight: '500',
              textAlign: 'center',
              letterSpacing: 0.1,
            }}
          >
            Train smarter. Bond deeper.
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
            { icon: 'sparkles' as const, text: 'Personalised AI training plan' },
            { icon: 'calendar' as const, text: 'Smart scheduling around your life' },
            { icon: 'trending-up' as const, text: 'Track progress week by week' },
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
        <Button label="Let's get started →" onPress={onStart} size="lg" />
        <Text
          variant="caption"
          color={colors.text.secondary}
          style={{ textAlign: 'center', marginTop: 4 }}
        >
          Takes about 2 minutes
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

// ─── Summary screen ───────────────────────────────────────────────────────────

type SummaryStepProps = {
  dogName: string;
  ageMonths: number;
  breed: string;
  primaryGoal: string;
  severity: string;
  trainingExperience: string;
  environmentType: string;
  availableDaysPerWeek: number;
  availableMinutesPerDay: number;
  preferredDays: Weekday[];
  timeWindow: string | null;
  sessionStyle: string;
  progressStep: number;
  onBack: () => void;
  onContinue: () => void;
};

function SummaryStep({
  dogName,
  ageMonths,
  breed,
  primaryGoal,
  severity,
  trainingExperience,
  environmentType,
  availableDaysPerWeek,
  availableMinutesPerDay,
  preferredDays,
  timeWindow,
  sessionStyle,
  progressStep,
  onBack,
  onContinue,
}: SummaryStepProps) {
  const insets = useSafeAreaInsets();

  const homeLabels: Record<string, string> = {
    apartment: 'Apartment',
    house_no_yard: 'House, no yard',
    house_yard: 'House with yard',
  };

  const expLabels: Record<string, string> = {
    none: 'New to training',
    some: 'Some experience',
    experienced: 'Experienced trainer',
  };

  const styleLabels: Record<string, string> = {
    micro: 'Micro (short & frequent)',
    balanced: 'Balanced',
    focused: 'Focused (longer sessions)',
  };

  const dayAbbr = (d: Weekday) =>
    d.slice(0, 3).charAt(0).toUpperCase() + d.slice(1, 3);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.app }}>
      {/* Warm gradient blush — matches train screen */}
      <LinearGradient
        colors={[`${colors.brand.primary}0A`, 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}
        pointerEvents="none"
      />
      {/* Header with progress */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: spacing.lg,
          paddingBottom: 4,
          gap: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ flex: 1, height: 4, backgroundColor: colors.border.soft, borderRadius: 2, overflow: 'hidden' }}>
            <View style={{ width: '100%', height: 4, backgroundColor: colors.brand.primary, borderRadius: 2 }} />
          </View>
          <Text variant="micro" color={colors.text.secondary} style={{ minWidth: 38, textAlign: 'right' }}>
            {progressStep} of {PROGRESS_STEP_COUNT}
          </Text>
        </View>
        <Pressable
          onPress={onBack}
          hitSlop={8}
          style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
        >
          <AppIcon name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: 140,
          gap: spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: spacing.xs, marginBottom: spacing.sm }}>
          <Text style={{ fontSize: 28, fontWeight: '800', letterSpacing: -0.5, color: colors.text.primary }}>
            Here's your profile
          </Text>
          <Text variant="body" color={colors.text.secondary} style={{ lineHeight: 22 }}>
            Looks good? Tap below to build your plan.
          </Text>
        </View>

        {/* Dog profile */}
        <Animated.View
          entering={FadeInDown.delay(0).duration(400)}
          style={{
            backgroundColor: colors.bg.surface,
            borderRadius: radii.lg,
            padding: spacing.lg,
            borderWidth: 1.5,
            borderColor: colors.border.soft,
            ...shadows.card,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 10 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: `${colors.brand.primary}15`, alignItems: 'center', justifyContent: 'center' }}>
              <AppIcon name="paw" size={16} color={colors.brand.primary} />
            </View>
            <Text variant="bodyStrong" color={colors.text.secondary} style={{ fontWeight: '600', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.8 }}>
              Your Dog
            </Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text.primary, marginBottom: 4 }}>
            {dogName || 'Your dog'}
          </Text>
          <Text variant="caption" color={colors.text.secondary}>
            {ageLabel(ageMonths)}{breed ? ` · ${breed}` : ''}
          </Text>
          <Text variant="caption" color={colors.text.secondary}>
            {homeLabels[environmentType] ?? environmentType}
          </Text>
        </Animated.View>

        {/* Goal */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={{
            backgroundColor: colors.bg.surface,
            borderRadius: radii.lg,
            padding: spacing.lg,
            borderWidth: 1.5,
            borderColor: colors.border.soft,
            ...shadows.card,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 10 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: `${colors.brand.primary}15`, alignItems: 'center', justifyContent: 'center' }}>
              <AppIcon name="flag" size={16} color={colors.brand.primary} />
            </View>
            <Text variant="bodyStrong" color={colors.text.secondary} style={{ fontWeight: '600', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.8 }}>
              Training Goal
            </Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary, marginBottom: 4 }}>
            {goalLabel(primaryGoal)}
          </Text>
          <Text variant="caption" color={colors.text.secondary}>
            {severity.charAt(0).toUpperCase() + severity.slice(1)} · {expLabels[trainingExperience] ?? trainingExperience}
          </Text>
        </Animated.View>

        {/* Schedule */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={{
            backgroundColor: colors.bg.surface,
            borderRadius: radii.lg,
            padding: spacing.lg,
            borderWidth: 1.5,
            borderColor: colors.border.soft,
            ...shadows.card,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 10 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: `${colors.brand.primary}15`, alignItems: 'center', justifyContent: 'center' }}>
              <AppIcon name="calendar" size={16} color={colors.brand.primary} />
            </View>
            <Text variant="bodyStrong" color={colors.text.secondary} style={{ fontWeight: '600', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.8 }}>
              Schedule
            </Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary, marginBottom: 4 }}>
            {availableDaysPerWeek}×/week · {availableMinutesPerDay} min
          </Text>
          {preferredDays.length > 0 && (
            <Text variant="caption" color={colors.text.secondary}>
              {preferredDays.map(dayAbbr).join(', ')}
            </Text>
          )}
          <Text variant="caption" color={colors.text.secondary}>
            {timeWindowLabel(timeWindow)} · {styleLabels[sessionStyle] ?? sessionStyle}
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Footer with gradient fade */}
      <View
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
        pointerEvents="box-none"
      >
        <LinearGradient
          colors={[`${colors.bg.app}00`, colors.bg.app]}
          style={{ height: 32 }}
          pointerEvents="none"
        />
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.sm,
            paddingBottom: insets.bottom + spacing.md,
            backgroundColor: colors.bg.app,
          }}
        >
          <Button label="Build my plan →" onPress={onContinue} />
        </View>
      </View>
    </View>
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
