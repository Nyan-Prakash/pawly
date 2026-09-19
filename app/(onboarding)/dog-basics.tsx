import { useEffect, useRef, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { MascotLoader } from '@/components/ui/MascotLoader';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { QuestionScreen } from '@/components/onboarding/QuestionScreen';
import { ScheduleSelector } from '@/components/onboarding/ScheduleSelector';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { BREEDS_LIST } from '@/constants/breeds';
import { haptics } from '@/lib/haptics';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { Weekday, TimeWindow, SessionStyle } from '@/types';

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  'dogName',         // 0
  'dogAge',          // 1
  'dogBreed',        // 2
  'dogSexNeutered',  // 3
  'primaryGoal',     // 4  (dog-photo returns here via ?step=4)
  'trickGoal',       // 5
  'severity',        // 6
  'experienceLevel', // 7
  'homeSetup',       // 8
  'household',       // 9
  'daysPerWeek',     // 10
  'sessionLength',   // 11
  'preferredDays',   // 12
  'timeOfDay',       // 13
  'sessionStyle',    // 14
  'summary',         // 15
  'generatingPlan',  // 16
] as const;

type StepId = (typeof STEPS)[number];

// Steps 0–15 show progress; generatingPlan does not.
const PROGRESS_STEP_COUNT = 16;
const getProgressStep = (index: number) => Math.min(PROGRESS_STEP_COUNT, index + 1);

// ─── Static data ──────────────────────────────────────────────────────────────

type Option<V extends string | number = string> = {
  value: V;
  label: string;
  icon: AppIconName;
  description?: string;
};

const ISSUE_OPTIONS: Option[] = [
  { value: 'leash_pulling', label: 'Pulls on leash', icon: 'walk', description: 'Pulls toward triggers or scents' },
  { value: 'jumping_up', label: 'Jumps on people', icon: 'arrow-up-circle', description: 'Excited greetings' },
  { value: 'barking', label: 'Barking', icon: 'volume-high', description: 'Reacts to sounds or people' },
  { value: 'recall', label: "Won't come", icon: 'return-down-back', description: 'Ignores you when called' },
  { value: 'puppy_biting', label: 'Puppy biting', icon: 'flash', description: 'Nipping and mouthing' },
  { value: 'crate_anxiety', label: 'Crate anxiety', icon: 'home', description: "Stressed or won't settle in the crate" },
  { value: 'potty_training', label: 'Potty training', icon: 'water', description: 'Accidents indoors' },
  { value: 'separation_anxiety', label: 'Separation anxiety', icon: 'sad', description: 'Distressed when left alone' },
  { value: 'leash_reactivity', label: 'Leash reactivity', icon: 'alert-circle', description: 'Lunges or barks at dogs or people' },
  { value: 'door_manners', label: 'Door manners', icon: 'exit', description: 'Bolts out the door' },
  { value: 'settling', label: 'Settling', icon: 'moon', description: 'Struggles to calm down' },
  { value: 'leave_it', label: 'Leave it', icon: 'hand-left', description: 'Grabs or steals things' },
  { value: 'impulse_control', label: 'Impulse control', icon: 'pause-circle', description: 'Impulsive and reactive' },
  { value: 'cooperative_care', label: 'Cooperative care', icon: 'medkit', description: 'Resists handling or grooming' },
];

const TRICK_OPTIONS: Option[] = [
  { value: 'sit', label: 'Sit', icon: 'chevron-down-circle', description: 'Sit on cue' },
  { value: 'down', label: 'Down', icon: 'arrow-down-circle', description: 'Lie down on cue' },
  { value: 'stay', label: 'Stay', icon: 'pause-circle', description: 'Hold position until released' },
  { value: 'heel', label: 'Heel', icon: 'footsteps', description: 'Walk in formal heel position' },
  { value: 'wait_and_stay', label: 'Wait', icon: 'time', description: 'Pause before moving forward' },
  { value: 'basic_obedience', label: 'Basic obedience', icon: 'school', description: 'Sit, down and stay together' },
  { value: 'shake', label: 'Shake', icon: 'hand-right', description: 'Offer a paw on cue' },
  { value: 'spin', label: 'Spin', icon: 'refresh-circle', description: 'Turn in a circle' },
  { value: 'roll_over', label: 'Roll over', icon: 'sync-circle', description: 'Roll from side to side' },
  { value: 'play_dead', label: 'Play dead', icon: 'skull', description: 'Drop and lie still on cue' },
  { value: 'fetch', label: 'Fetch', icon: 'baseball', description: 'Retrieve and return an object' },
  { value: 'high_five', label: 'High five', icon: 'hand-left', description: 'Tap your hand up high' },
  { value: 'speak', label: 'Speak', icon: 'chatbubble', description: 'Bark on cue' },
  { value: 'leave_it_trick', label: 'Leave it', icon: 'ban', description: 'Ignore and move away from items' },
  { value: 'touch', label: 'Touch', icon: 'finger-print', description: 'Nose-target your hand' },
  { value: 'place', label: 'Place', icon: 'bed', description: 'Go to a designated spot' },
];

const AGE_OPTIONS: Option<number>[] = [
  { value: 4, label: 'Puppy', description: 'Under 6 months', icon: 'paw' },
  { value: 12, label: 'Young', description: '6 to 18 months', icon: 'flash' },
  { value: 24, label: 'Adult', description: '1 to 3 years', icon: 'fitness' },
  { value: 48, label: 'Senior', description: 'Over 3 years', icon: 'leaf' },
];

const SESSION_LENGTH_OPTIONS: Option<number>[] = [
  { value: 5, label: '5 minutes', description: 'Quick wins', icon: 'flash' },
  { value: 10, label: '10 minutes', description: 'Steady progress', icon: 'time' },
  { value: 15, label: '15 minutes', description: 'Solid sessions', icon: 'trending-up' },
  { value: 20, label: '20 minutes or more', description: 'Deep training', icon: 'fitness' },
];

const DAYS_PER_WEEK_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

const DAY_ABBR: Record<Weekday, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

const SEVERITY_OPTIONS: Option[] = [
  { value: 'mild', label: 'Mild', description: 'Happens now and then', icon: 'happy' },
  { value: 'moderate', label: 'Moderate', description: 'Happens often', icon: 'alert-circle' },
  { value: 'severe', label: 'Severe', description: 'A daily struggle', icon: 'warning' },
];

const EXPERIENCE_OPTIONS: Option[] = [
  { value: 'none', label: 'New to this', description: 'First dog or first time training', icon: 'paw' },
  { value: 'some', label: 'Tried some things', description: 'You know a few basics already', icon: 'book' },
  { value: 'experienced', label: 'Experienced', description: "You've trained dogs before", icon: 'school' },
];

const HOME_OPTIONS: Option[] = [
  { value: 'apartment', label: 'Apartment', icon: 'business' },
  { value: 'house_no_yard', label: 'House, no yard', icon: 'home' },
  { value: 'house_yard', label: 'House with yard', icon: 'leaf' },
];

const SESSION_STYLE_OPTIONS: Option[] = [
  { value: 'micro', label: 'Micro', description: 'Short bursts, high frequency', icon: 'flash' },
  { value: 'balanced', label: 'Balanced', description: 'A steady, realistic mix', icon: 'git-branch' },
  { value: 'focused', label: 'Focused', description: 'Fewer sessions, longer reps', icon: 'bookmark' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ageLabel(ageMonths: number): string {
  const opt = AGE_OPTIONS.find((o) => o.value === ageMonths);
  if (opt) return `${opt.label} (${opt.description?.toLowerCase()})`;
  if (ageMonths < 6) return 'Puppy';
  if (ageMonths <= 18) return 'Young dog';
  if (ageMonths <= 36) return 'Adult';
  return 'Senior';
}

function goalLabel(goal: string): string {
  return (
    ISSUE_OPTIONS.find((o) => o.value === goal)?.label ??
    TRICK_OPTIONS.find((o) => o.value === goal)?.label ??
    goal
  );
}

function timeWindowLabel(tw: string | null): string {
  if (!tw || tw === 'flexible') return 'flexible timing';
  const map: Record<string, string> = {
    morning: 'mornings',
    afternoon: 'afternoons',
    evening: 'evenings',
  };
  return map[tw] ?? tw;
}

function SelectedCheck() {
  return <AppIcon name="checkmark" size={20} color={colors.accent} />;
}

/** A pickable row: selected fill, accent icon and a checkmark. */
function OptionRow<V extends string | number>({
  option,
  selected,
  onSelect,
}: {
  option: Option<V>;
  selected: boolean;
  onSelect: (value: V) => void;
}) {
  return (
    <ListRow
      icon={option.icon}
      iconTone={selected ? 'accent' : 'secondary'}
      title={option.label}
      subtitle={option.description}
      selected={selected}
      trailing={selected ? <SelectedCheck /> : undefined}
      onPress={() => {
        haptics.selection();
        onSelect(option.value);
      }}
    />
  );
}

function OptionList<V extends string | number>({
  options,
  value,
  onSelect,
}: {
  options: Option<V>[];
  value: V | null;
  onSelect: (value: V) => void;
}) {
  return (
    <ListGroup>
      {options.map((opt) => (
        <OptionRow key={String(opt.value)} option={opt} selected={value === opt.value} onSelect={onSelect} />
      ))}
    </ListGroup>
  );
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
  // Written back to store in batch at the generatingPlan step
  const [dogName, setDogName] = useState(stored.dogName || '');
  const [ageMonths, setAgeMonths] = useState(stored.ageMonths || 12);
  const [breed, setBreed] = useState(stored.breed || '');
  const [breedQuery, setBreedQuery] = useState(stored.breed || '');
  const [sex, setSex] = useState<'male' | 'female'>(stored.sex || 'male');
  const [neutered, setNeutered] = useState(stored.neutered ?? false);
  const [primaryGoal, setPrimaryGoal] = useState(stored.primaryGoal || '');
  const [secondaryGoals] = useState<string[]>([]);
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
      ? BREEDS_LIST.filter((b) => b.toLowerCase().startsWith(breedQuery.toLowerCase())).slice(0, 8)
      : [];

  // ─── Step navigation (the stack's own transition; no JS slide) ───────────

  const goTo = (nextIndex: number) => setCurrentStepIndex(nextIndex);
  const goForward = () => goTo(currentStepIndex + 1);
  const goBack = () => goTo(currentStepIndex - 1);
  const leaveOnboarding = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(auth)/welcome');
  };
  // From primaryGoal: skip trickGoal and go straight to severity
  const goForwardFromPrimaryGoal = () => goTo(STEPS.indexOf('severity'));
  // Jump into trickGoal from the primaryGoal page
  const goToTrickGoal = () => { setPrimaryGoal(''); goTo(STEPS.indexOf('trickGoal')); };
  // From trickGoal: skip severity and go straight to experienceLevel
  const goForwardFromTrickGoal = () => goTo(STEPS.indexOf('experienceLevel'));
  // Back from experienceLevel when reached via trickGoal
  const goBackFromExperienceToTrick = () => goTo(STEPS.indexOf('trickGoal'));
  const goToPrimaryGoal = () => goTo(STEPS.indexOf('primaryGoal'));

  const toggleDay = (day: Weekday) =>
    setPreferredDays((ds) => (ds.includes(day) ? ds.filter((d) => d !== day) : [...ds, day]));

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
  const nameOrDog = dogName || 'your dog';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.app }}>
      {stepId === 'dogName' && (
        <QuestionScreen
          title="What's your dog's name?"
          subtitle="This is what the coach will call them."
          canContinue={dogName.trim().length > 0}
          onContinue={goForward}
          continueLabel="Next"
          onBack={leaveOnboarding}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <Input
            label="Name"
            value={dogName}
            onChangeText={setDogName}
            placeholder="Buddy"
            autoFocus
            autoCapitalize="words"
            autoCorrect={false}
            textContentType="name"
            returnKeyType="next"
            onSubmitEditing={() => dogName.trim().length > 0 && goForward()}
          />
        </QuestionScreen>
      )}

      {stepId === 'dogAge' && (
        <QuestionScreen
          title={`How old is ${nameOrDog}?`}
          onContinue={goForward}
          continueLabel="Next"
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <OptionList options={AGE_OPTIONS} value={ageMonths} onSelect={setAgeMonths} />
        </QuestionScreen>
      )}

      {stepId === 'dogBreed' && (
        <QuestionScreen
          title={`What breed is ${nameOrDog}?`}
          subtitle="Optional. It helps the coach tailor advice."
          onContinue={goForward}
          continueLabel={breed ? 'Next' : 'Skip for now'}
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <View style={{ gap: spacing.lg }}>
            <Input
              label="Breed"
              value={breedQuery}
              onChangeText={(t) => {
                setBreedQuery(t);
                if (!t) setBreed('');
              }}
              placeholder="Search breeds"
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={() => {
                if (breedResults.length === 1) {
                  setBreed(breedResults[0]);
                  setBreedQuery(breedResults[0]);
                }
              }}
            />
            {breedQuery.length > 0 ? (
              breedResults.length > 0 ? (
                <ListGroup>
                  {breedResults.map((b) => (
                    <ListRow
                      key={b}
                      title={b}
                      selected={breed === b}
                      trailing={breed === b ? <SelectedCheck /> : undefined}
                      onPress={() => {
                        haptics.selection();
                        setBreed(b);
                        setBreedQuery(b);
                        Keyboard.dismiss();
                      }}
                    />
                  ))}
                </ListGroup>
              ) : (
                <ListGroup>
                  <ListRow
                    icon="search-outline"
                    iconTone="secondary"
                    title="No breeds match"
                    subtitle="Check the spelling, or skip this step."
                  />
                </ListGroup>
              )
            ) : null}
          </View>
        </QuestionScreen>
      )}

      {stepId === 'dogSexNeutered' && (
        <QuestionScreen
          title={`Is ${nameOrDog} male or female?`}
          onContinue={() => {
            // Save current form state to store before leaving
            setField('dogName', dogName.trim());
            setField('ageMonths', ageMonths);
            setField('breed', breed);
            setField('sex', sex);
            setField('neutered', neutered);
            router.push('/(onboarding)/dog-photo');
          }}
          continueLabel="Add a photo"
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <View>
            <SectionHeader title="Sex" />
            <OptionList
              options={[
                { value: 'male', label: 'Male', icon: 'male' },
                { value: 'female', label: 'Female', icon: 'female' },
              ]}
              value={sex}
              onSelect={(v) => setSex(v as 'male' | 'female')}
            />
          </View>
          <View>
            <SectionHeader title={sex === 'male' ? 'Neutered' : 'Spayed'} />
            <OptionList
              options={[
                { value: 'yes', label: 'Yes', icon: 'checkmark-circle-outline' },
                { value: 'no', label: 'No', icon: 'close-circle-outline' },
              ]}
              value={neutered ? 'yes' : 'no'}
              onSelect={(v) => setNeutered(v === 'yes')}
            />
          </View>
        </QuestionScreen>
      )}

      {stepId === 'primaryGoal' && (
        <QuestionScreen
          title={`What do you want to work on with ${nameOrDog} first?`}
          subtitle="Pick the one that matters most. You can add courses later."
          canContinue={primaryGoal !== ''}
          onContinue={goForwardFromPrimaryGoal}
          continueLabel="Next"
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <OptionList options={ISSUE_OPTIONS} value={primaryGoal} onSelect={setPrimaryGoal} />
          <Button
            label="Teach a trick instead"
            variant="ghost"
            size="md"
            onPress={goToTrickGoal}
            style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }}
          />
        </QuestionScreen>
      )}

      {stepId === 'trickGoal' && (
        <QuestionScreen
          title={`What do you want to teach ${nameOrDog}?`}
          subtitle="Pick the one to focus on first."
          canContinue={primaryGoal !== ''}
          onContinue={goForwardFromTrickGoal}
          continueLabel="Next"
          onBack={goToPrimaryGoal}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <OptionList options={TRICK_OPTIONS} value={primaryGoal} onSelect={setPrimaryGoal} />
          <Button
            label="Work on a behavior instead"
            variant="ghost"
            size="md"
            onPress={goToPrimaryGoal}
            style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }}
          />
        </QuestionScreen>
      )}

      {stepId === 'severity' && (
        <QuestionScreen
          title="How often does it happen?"
          subtitle={`${goalLabel(primaryGoal)} with ${nameOrDog}.`}
          onContinue={goForward}
          continueLabel="Next"
          onBack={goToPrimaryGoal}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <OptionList
            options={SEVERITY_OPTIONS}
            value={severity}
            onSelect={(v) => setSeverity(v as typeof severity)}
          />
        </QuestionScreen>
      )}

      {stepId === 'experienceLevel' && (
        <QuestionScreen
          title="How much dog training have you done?"
          onContinue={goForward}
          continueLabel="Next"
          onBack={TRICK_OPTIONS.some((o) => o.value === primaryGoal) ? goBackFromExperienceToTrick : goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <OptionList
            options={EXPERIENCE_OPTIONS}
            value={trainingExperience}
            onSelect={(v) => setTrainingExperience(v as typeof trainingExperience)}
          />
        </QuestionScreen>
      )}

      {stepId === 'homeSetup' && (
        <QuestionScreen
          title={`Where does ${nameOrDog} live?`}
          onContinue={goForward}
          continueLabel="Next"
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <OptionList
            options={HOME_OPTIONS}
            value={environmentType}
            onSelect={(v) => setEnvironmentType(v as typeof environmentType)}
          />
        </QuestionScreen>
      )}

      {stepId === 'household' && (
        <QuestionScreen
          title={`Who else lives with ${nameOrDog}?`}
          subtitle="Select any that apply. The coach adjusts its advice to your home."
          onContinue={goForward}
          continueLabel="Next"
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <ListGroup>
            <ListRow
              icon="people"
              iconTone={hasKids ? 'accent' : 'secondary'}
              title="Kids"
              subtitle="Young children live with you"
              selected={hasKids}
              trailing={hasKids ? <SelectedCheck /> : undefined}
              onPress={() => {
                haptics.selection();
                setHasKids((v) => !v);
              }}
            />
            <ListRow
              icon="paw"
              iconTone={hasOtherPets ? 'accent' : 'secondary'}
              title="Other pets"
              subtitle="Other animals live with you"
              selected={hasOtherPets}
              trailing={hasOtherPets ? <SelectedCheck /> : undefined}
              onPress={() => {
                haptics.selection();
                setHasOtherPets((v) => !v);
              }}
            />
          </ListGroup>
        </QuestionScreen>
      )}

      {stepId === 'daysPerWeek' && (
        <QuestionScreen
          title="How many days a week can you train?"
          subtitle="Be realistic. Consistency beats intensity."
          onContinue={goForward}
          continueLabel="Next"
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <ListGroup>
            {DAYS_PER_WEEK_OPTIONS.map((n) => {
              const selected = availableDaysPerWeek === n;
              return (
                <ListRow
                  key={n}
                  title={n === 1 ? '1 day a week' : `${n} days a week`}
                  selected={selected}
                  trailing={selected ? <SelectedCheck /> : undefined}
                  onPress={() => {
                    haptics.selection();
                    setAvailableDaysPerWeek(n);
                  }}
                />
              );
            })}
          </ListGroup>
        </QuestionScreen>
      )}

      {stepId === 'sessionLength' && (
        <QuestionScreen
          title="How long should each session be?"
          subtitle="Short and consistent beats long and occasional."
          onContinue={goForward}
          continueLabel="Next"
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <OptionList
            options={SESSION_LENGTH_OPTIONS}
            value={availableMinutesPerDay}
            onSelect={setAvailableMinutesPerDay}
          />
        </QuestionScreen>
      )}

      {stepId === 'preferredDays' && (
        <QuestionScreen
          title="Which days work best?"
          subtitle="Pick the days you can actually show up."
          canContinue={preferredDays.length > 0}
          onContinue={goForward}
          continueLabel="Next"
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <ScheduleSelector selectedDays={preferredDays} onToggleDay={toggleDay} />
        </QuestionScreen>
      )}

      {stepId === 'timeOfDay' && (
        <QuestionScreen
          title="What time of day works best?"
          subtitle="Sessions are scheduled around your routine."
          canContinue={timeWindow !== null}
          onContinue={goForward}
          continueLabel="Next"
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <ScheduleSelector
            selectedDays={preferredDays}
            onToggleDay={toggleDay}
            selectedTimeWindow={timeWindow}
            onSelectTimeWindow={setTimeWindow}
          />
        </QuestionScreen>
      )}

      {stepId === 'sessionStyle' && (
        <QuestionScreen
          title="Which training style fits your week?"
          onContinue={goForward}
          continueLabel="Review your answers"
          onBack={goBack}
          currentStep={progressStep}
          totalSteps={PROGRESS_STEP_COUNT}
        >
          <OptionList
            options={SESSION_STYLE_OPTIONS}
            value={sessionStyle}
            onSelect={(v) => setSessionStyle(v as SessionStyle)}
          />
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
          onEditDog={() => goTo(STEPS.indexOf('dogName'))}
          onEditGoal={goToPrimaryGoal}
          onEditSchedule={() => goTo(STEPS.indexOf('daysPerWeek'))}
        />
      )}

      {stepId === 'generatingPlan' && <GeneratingStep dogName={dogName} />}
    </View>
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
  onEditDog: () => void;
  onEditGoal: () => void;
  onEditSchedule: () => void;
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
  onEditDog,
  onEditGoal,
  onEditSchedule,
}: SummaryStepProps) {
  const homeLabels: Record<string, string> = {
    apartment: 'apartment',
    house_no_yard: 'house without a yard',
    house_yard: 'house with a yard',
  };

  const expLabels: Record<string, string> = {
    none: 'new to training',
    some: 'some experience',
    experienced: 'experienced',
  };

  const styleLabels: Record<string, string> = {
    micro: 'micro sessions',
    balanced: 'balanced sessions',
    focused: 'focused sessions',
  };

  const dayAbbr = (d: Weekday) => DAY_ABBR[d] ?? d;

  const dogSubtitle = [ageLabel(ageMonths), breed, homeLabels[environmentType] ?? environmentType]
    .filter(Boolean)
    .join(', ');
  const severityLabel = SEVERITY_OPTIONS.find((o) => o.value === severity)?.label ?? severity;
  const goalSubtitle = `${severityLabel}, ${expLabels[trainingExperience] ?? trainingExperience}`;
  const scheduleTitle = `${availableDaysPerWeek} ${availableDaysPerWeek === 1 ? 'day' : 'days'} a week, ${availableMinutesPerDay} min each`;
  const scheduleSubtitle = [
    preferredDays.length > 0 ? preferredDays.map(dayAbbr).join(', ') : null,
    `${timeWindowLabel(timeWindow)}, ${styleLabels[sessionStyle] ?? sessionStyle}`,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <QuestionScreen
      title="Check your answers"
      subtitle="Tap a row to change it."
      onContinue={onContinue}
      continueLabel="Build the plan"
      onBack={onBack}
      currentStep={progressStep}
      totalSteps={PROGRESS_STEP_COUNT}
    >
      <ListGroup>
        <ListRow
          icon="paw"
          title={dogName || 'Your dog'}
          subtitle={dogSubtitle}
          trailing="chevron"
          onPress={onEditDog}
          accessibilityLabel={`Dog: ${dogName || 'your dog'}, ${dogSubtitle}`}
          accessibilityHint="Edit"
        />
        <ListRow
          icon="flag"
          title={goalLabel(primaryGoal)}
          subtitle={goalSubtitle}
          trailing="chevron"
          onPress={onEditGoal}
          accessibilityLabel={`Goal: ${goalLabel(primaryGoal)}, ${goalSubtitle}`}
          accessibilityHint="Edit"
        />
        <ListRow
          icon="calendar"
          title={scheduleTitle}
          subtitle={scheduleSubtitle}
          trailing="chevron"
          onPress={onEditSchedule}
          accessibilityLabel={`Schedule: ${scheduleTitle}, ${scheduleSubtitle}`}
          accessibilityHint="Edit"
        />
      </ListGroup>
    </QuestionScreen>
  );
}

// ─── Generating screen ────────────────────────────────────────────────────────

function GeneratingStep({ dogName }: { dogName: string }) {
  return (
    <SafeScreen>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xxl,
          gap: spacing.lg,
        }}
      >
        <MascotLoader activity="wake" />
        <View style={{ alignItems: 'center', gap: spacing.xs }}>
          <Text variant="h2" style={{ textAlign: 'center' }}>
            Building {dogName || 'your dog'}'s plan
          </Text>
          <Text variant="caption" style={{ textAlign: 'center' }}>
            This takes a few seconds.
          </Text>
        </View>
      </View>
    </SafeScreen>
  );
}
