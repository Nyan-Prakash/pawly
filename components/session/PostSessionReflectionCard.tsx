import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { haptics } from '@/lib/haptics';
import type { ReflectionQuestionConfig, ReflectionAnswerOption } from '@/lib/adaptivePlanning/reflectionQuestionTypes';
import type { PostSessionReflection, ReflectionQuestionId } from '@/types';
import type { SessionOutcome } from '@/lib/sessionScoring';
import {
  getAnswerValue,
  applyReflectionAnswer,
  areRequiredQuestionsAnswered,
  makeEmptyReflection,
} from '@/lib/reflectionAnswerHelpers';

// Re-export so callers can import everything from this one file.
export { getAnswerValue, applyReflectionAnswer, areRequiredQuestionsAnswered, makeEmptyReflection };

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export interface PostSessionReflectionCardProps {
  /** Dog name, used in the outcome step copy. */
  dogName: string;
  /** Duration string already formatted. */
  durationLabel: string;
  /** The course's own success criterion, the primary question. */
  successCriteria: string;
  /** Short per-step summary, e.g. "3 of 4 steps worked". Optional. */
  stepSummaryLabel?: string | null;
  questions: ReflectionQuestionConfig[];
  answers: PostSessionReflection;
  outcome: SessionOutcome | null;
  notes: string;
  onSelectOutcome: (o: SessionOutcome) => void;
  onAnswer: (questionId: ReflectionQuestionId, value: string | number) => void;
  onNotesChange: (text: string) => void;
  onSubmit: () => void;
  isSaving: boolean;
  /** Shown on the final step when the save failed. */
  saveError?: string | null;
}

// Step indices:
//   0            outcome step ("Did {dog} hit the goal?")
//   1 … Q        reflection questions
//   Q + 1        notes + save

export function PostSessionReflectionCard({
  dogName,
  durationLabel,
  successCriteria,
  stepSummaryLabel,
  questions,
  answers,
  outcome,
  notes,
  onSelectOutcome,
  onAnswer,
  onNotesChange,
  onSubmit,
  isSaving,
  saveError,
}: PostSessionReflectionCardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const totalSteps = 1 + questions.length + 1;
  const isOutcomeStep = currentStep === 0;
  const isNotesStep = currentStep === totalSteps - 1;
  const questionIndex = isOutcomeStep ? -1 : currentStep - 1;
  const currentQuestion = !isOutcomeStep && !isNotesStep ? questions[questionIndex] : null;

  function goNext() {
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  }

  function goBack() {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  function handleOutcomeSelect(o: SessionOutcome) {
    haptics.selection();
    onSelectOutcome(o);
    goNext();
  }

  function handleAnswer(qId: ReflectionQuestionId, value: string | number) {
    haptics.selection();
    onAnswer(qId, value);
    goNext();
  }

  const allRequiredAnswered = areRequiredQuestionsAnswered(questions, answers) && outcome !== null;

  const positionLabel = isNotesStep
    ? 'Notes'
    : currentQuestion && !currentQuestion.required
      ? `Question ${currentStep + 1} of ${totalSteps}, optional`
      : `Question ${currentStep + 1} of ${totalSteps}`;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
      >
        <View style={{ gap: spacing.xs }}>
          {currentStep > 0 ? (
            <IconButton
              icon="chevron-back"
              accessibilityLabel="Previous question"
              tone="secondary"
              onPress={goBack}
              style={{ marginLeft: -spacing.md }}
            />
          ) : null}
          <Text variant="caption">{durationLabel}</Text>
          {stepSummaryLabel ? <Text variant="caption">{stepSummaryLabel}</Text> : null}
          <Text variant="caption" accessibilityLiveRegion="polite">
            {positionLabel}
          </Text>
        </View>

        {isOutcomeStep ? (
          <OutcomeStep
            dogName={dogName}
            successCriteria={successCriteria}
            selected={outcome}
            onSelect={handleOutcomeSelect}
          />
        ) : isNotesStep ? (
          <NotesStep
            notes={notes}
            onNotesChange={onNotesChange}
            onSubmit={onSubmit}
            isSaving={isSaving}
            canSubmit={allRequiredAnswered && !isSaving}
            saveError={saveError ?? null}
          />
        ) : currentQuestion ? (
          <QuestionStep question={currentQuestion} answers={answers} onAnswer={handleAnswer} />
        ) : null}

        {currentQuestion && !currentQuestion.required ? (
          <Button
            label="Skip this question"
            variant="ghost"
            size="md"
            onPress={goNext}
            style={{ alignSelf: 'flex-start' }}
          />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Outcome step, the course's own success criterion
// ─────────────────────────────────────────────────────────────────────────────

interface OutcomeStepProps {
  dogName: string;
  successCriteria: string;
  selected: SessionOutcome | null;
  onSelect: (o: SessionOutcome) => void;
}

const OUTCOME_OPTIONS: Array<{
  value: SessionOutcome;
  icon: 'checkmark-circle-outline' | 'remove-circle-outline' | 'close-circle-outline';
  iconTone: 'accent' | 'secondary' | 'danger';
  label: string;
  sub: (dog: string) => string;
}> = [
  {
    value: 'met',
    icon: 'checkmark-circle-outline',
    iconTone: 'accent',
    label: 'Yes',
    sub: (dog) => `${dog} hit the goal. Ready to build on this.`,
  },
  {
    value: 'partial',
    icon: 'remove-circle-outline',
    iconTone: 'secondary',
    label: 'Mostly',
    sub: () => 'Got there some of the time.',
  },
  {
    value: 'not_met',
    icon: 'close-circle-outline',
    iconTone: 'danger',
    label: 'Not yet',
    sub: () => "Didn't get there today. That's useful to know.",
  },
];

function OutcomeStep({ dogName, successCriteria, selected, onSelect }: OutcomeStepProps) {
  return (
    <View style={{ gap: spacing.xl }}>
      <View style={{ gap: spacing.sm }}>
        <Text variant="h1" accessibilityRole="header">
          Did {dogName} hit the goal?
        </Text>
        <Text variant="body" color={colors.text.secondary}>
          {successCriteria}
        </Text>
      </View>

      <View accessibilityRole="radiogroup">
      <ListGroup>
        {OUTCOME_OPTIONS.map((opt) => (
          <ListRow
            key={opt.value}
            icon={opt.icon}
            iconTone={opt.iconTone}
            title={opt.label}
            subtitle={opt.sub(dogName)}
            selected={selected === opt.value}
            onPress={() => onSelect(opt.value)}
          />
        ))}
      </ListGroup>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Question step
// ─────────────────────────────────────────────────────────────────────────────

interface QuestionStepProps {
  question: ReflectionQuestionConfig;
  answers: PostSessionReflection;
  onAnswer: (questionId: ReflectionQuestionId, value: string | number) => void;
}

function QuestionStep({ question, answers, onAnswer }: QuestionStepProps) {
  const currentValue = getAnswerValue(answers, question.id);

  return (
    <View style={{ gap: spacing.xl }}>
      <View style={{ gap: spacing.sm }}>
        <Text variant="h1" accessibilityRole="header">
          {question.prompt}
        </Text>
        {question.helperText ? <Text variant="caption">{question.helperText}</Text> : null}
      </View>

      {question.answerType === 'single_select' && question.options ? (
        <SingleSelectInput
          options={question.options}
          selected={typeof currentValue === 'string' ? currentValue : null}
          onSelect={(value) => onAnswer(question.id, value)}
        />
      ) : question.answerType === 'scale' ? (
        <ScaleInput
          min={question.scaleMin ?? 1}
          max={question.scaleMax ?? 5}
          minLabel={question.scaleMinLabel ?? null}
          maxLabel={question.scaleMaxLabel ?? null}
          selected={typeof currentValue === 'number' ? currentValue : null}
          onSelect={(value) => onAnswer(question.id, value)}
        />
      ) : null}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Notes + save step
// ─────────────────────────────────────────────────────────────────────────────

interface NotesStepProps {
  notes: string;
  onNotesChange: (text: string) => void;
  onSubmit: () => void;
  isSaving: boolean;
  canSubmit: boolean;
  saveError: string | null;
}

function NotesStep({ notes, onNotesChange, onSubmit, isSaving, canSubmit, saveError }: NotesStepProps) {
  return (
    <View style={{ gap: spacing.xl }}>
      {saveError ? (
        <View
          accessible
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          accessibilityLabel="Couldn't save this session. Your answers are still here. Check your connection and try again."
          style={{
            backgroundColor: colors.status.dangerSoft,
            borderRadius: radii.md,
            padding: spacing.lg,
            gap: spacing.xs,
          }}
        >
          <Text variant="bodyStrong">Couldn't save this session</Text>
          <Text variant="caption">Your answers are still here. Check your connection and try again.</Text>
        </View>
      ) : null}

      <View style={{ gap: spacing.sm }}>
        <Text variant="h1" accessibilityRole="header">
          Anything to note?
        </Text>
        <Text variant="body" color={colors.text.secondary}>
          Optional. Observations or reminders for next time.
        </Text>
      </View>

      <Input
        label="Notes"
        value={notes}
        onChangeText={onNotesChange}
        placeholder="Tried near the park gate, wind was an issue"
        multiline
        numberOfLines={4}
        keyboardType="default"
        returnKeyType="default"
        textContentType="none"
        autoCapitalize="sentences"
      />

      <Button
        label="Save session"
        onPress={onSubmit}
        disabled={!canSubmit}
        loading={isSaving}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Single-select list
// ─────────────────────────────────────────────────────────────────────────────

interface SingleSelectInputProps {
  options: ReflectionAnswerOption[];
  selected: string | null;
  onSelect: (value: string) => void;
}

function SingleSelectInput({ options, selected, onSelect }: SingleSelectInputProps) {
  return (
    <View accessibilityRole="radiogroup">
    <ListGroup>
      {options.map((opt) => (
        <ListRow
          key={opt.value}
          title={opt.label}
          selected={selected === opt.value}
          onPress={() => onSelect(opt.value)}
          trailing={selected === opt.value ? <SelectedMark /> : undefined}
        />
      ))}
    </ListGroup>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scale input (1–N) as a list, so the end labels sit where they belong
// ─────────────────────────────────────────────────────────────────────────────

interface ScaleInputProps {
  min: number;
  max: number;
  minLabel: string | null;
  maxLabel: string | null;
  selected: number | null;
  onSelect: (value: number) => void;
}

function ScaleInput({ min, max, minLabel, maxLabel, selected, onSelect }: ScaleInputProps) {
  const ticks = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <View accessibilityRole="radiogroup">
    <ListGroup>
      {ticks.map((n) => {
        const endLabel = n === min ? minLabel : n === max ? maxLabel : null;
        return (
        <ListRow
          key={n}
          title={`${n}`}
          subtitle={n === min ? minLabel ?? undefined : n === max ? maxLabel ?? undefined : undefined}
          selected={selected === n}
          onPress={() => onSelect(n)}
          trailing={selected === n ? <SelectedMark /> : undefined}
          accessibilityLabel={`${n} out of ${max}${endLabel ? `, ${endLabel}` : ''}`}
        />
        );
      })}
    </ListGroup>
    </View>
  );
}

function SelectedMark() {
  return <Text variant="captionStrong" color={colors.accent}>Selected</Text>;
}
