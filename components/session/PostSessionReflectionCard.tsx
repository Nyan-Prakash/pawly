import { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';

import { Text } from '@/components/ui/Text';
import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { colors } from '@/constants/colors';
import type { CourseUiColors } from '@/constants/courseColors';
import { spacing } from '@/constants/spacing';
import type { ReflectionQuestionConfig, ReflectionAnswerOption } from '@/lib/adaptivePlanning/reflectionQuestionTypes';
import type { PostSessionReflection, ReflectionQuestionId } from '@/types';
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
  /** Dog name — used in difficulty step subtitle. */
  dogName: string;
  /** Duration string already formatted — shown in the header. */
  durationLabel: string;
  questions: ReflectionQuestionConfig[];
  answers: PostSessionReflection;
  difficulty: 'easy' | 'okay' | 'hard' | null;
  notes: string;
  onSelectDifficulty: (d: 'easy' | 'okay' | 'hard') => void;
  onAnswer: (questionId: ReflectionQuestionId, value: string | number) => void;
  onNotesChange: (text: string) => void;
  onSubmit: () => void;
  isSaving: boolean;
  insets: { top: number; bottom: number };
  theme: CourseUiColors;
}

// Step indices:
//   0            → difficulty step ("How did it go?")
//   1 … Q        → reflection questions
//   Q + 1        → notes + submit

export function PostSessionReflectionCard({
  dogName,
  durationLabel,
  questions,
  answers,
  difficulty,
  notes,
  onSelectDifficulty,
  onAnswer,
  onNotesChange,
  onSubmit,
  isSaving,
  insets,
  theme,
}: PostSessionReflectionCardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // 1 difficulty step + N question steps + 1 notes step
  const totalSteps = 1 + questions.length + 1;
  const isDifficultyStep = currentStep === 0;
  const isNotesStep = currentStep === totalSteps - 1;
  const questionIndex = isDifficultyStep ? -1 : currentStep - 1; // 0-based index into questions[]
  const currentQuestion = (!isDifficultyStep && !isNotesStep) ? questions[questionIndex] : null;

  function animateTransition(forward: boolean) {
    const outX = forward ? -30 : 30;
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: outX, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      slideAnim.setValue(forward ? 30 : -30);
      setCurrentStep((s) => s + (forward ? 1 : -1));
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 28, bounciness: 3 }),
      ]).start();
    });
  }

  function goNext() {
    if (currentStep < totalSteps - 1) animateTransition(true);
  }

  function goBack() {
    if (currentStep > 0) animateTransition(false);
  }

  function handleDifficultySelect(d: 'easy' | 'okay' | 'hard') {
    onSelectDifficulty(d);
    setTimeout(() => goNext(), 180);
  }

  function handleAnswer(qId: ReflectionQuestionId, value: string | number) {
    onAnswer(qId, value);
    setTimeout(() => goNext(), 180);
  }

  const allRequiredAnswered = areRequiredQuestionsAnswered(questions, answers) && difficulty !== null;

  // Progress: step 0 = 1 segment filled (after selecting), step N = all filled
  // We treat each step as one segment. Current step is "active" (half-filled).
  const segmentCount = totalSteps;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Fixed header ─────────────────────────────────────────────────── */}
      <View
        style={{
          paddingTop: insets.top + spacing.sm,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.sm,
        }}
      >
        {/* Back button — top left, matches rest of app */}
        <Pressable
          onPress={goBack}
          hitSlop={12}
          style={({ pressed }) => ({
            alignSelf: 'flex-start',
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.sm,
            opacity: currentStep > 0 ? (pressed ? 0.4 : 1) : 0,
            minHeight: 44,
            justifyContent: 'center',
            pointerEvents: currentStep > 0 ? 'auto' : 'none',
          })}
          accessibilityLabel="Go back"
        >
          <Text style={{ fontSize: 16, color: colors.textSecondary }}>← Back</Text>
        </Pressable>

        {/* Session complete badge */}
        <View style={{ alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <AppIcon name="ribbon" size={22} color={theme.solid} />
            <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary }}>
              Session complete
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>
            {durationLabel}
          </Text>
        </View>
      </View>

      {/* ── Progress bar ─────────────────────────────────────────────────── */}
      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.xs, paddingBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
            }}
          >
            {isDifficultyStep
              ? 'Step 1 of ' + totalSteps
              : isNotesStep
              ? 'Notes'
              : `Step ${currentStep + 1} of ${totalSteps}`}
          </Text>
          {!isDifficultyStep && !isNotesStep && currentQuestion && !currentQuestion.required && (
            <Text style={{ fontSize: 11, color: colors.textSecondary, opacity: 0.7 }}>
              Optional
            </Text>
          )}
        </View>

        {/* Segmented bar */}
        <View style={{ flexDirection: 'row', gap: 3 }}>
          {Array.from({ length: segmentCount }).map((_, i) => {
            const completed = i < currentStep;
            const active = i === currentStep;
            return (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: completed || active ? theme.solid : colors.border.default,
                  opacity: active ? 0.45 : 1,
                }}
              />
            );
          })}
        </View>
      </View>

      {/* ── Scrollable step content ───────────────────────────────────────── */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.xxl,
          flexGrow: 1,
        }}
      >
        <Animated.View
          style={{
            opacity: opacityAnim,
            transform: [{ translateX: slideAnim }],
            gap: spacing.lg,
            flex: 1,
          }}
        >
          {isDifficultyStep ? (
            <DifficultyStep
              dogName={dogName}
              selected={difficulty}
              onSelect={handleDifficultySelect}
            />
          ) : isNotesStep ? (
            <NotesStep
              notes={notes}
              onNotesChange={onNotesChange}
              onSubmit={onSubmit}
              isSaving={isSaving}
              canSubmit={allRequiredAnswered && !isSaving}
              theme={theme}
            />
          ) : currentQuestion ? (
            <QuestionStep
              question={currentQuestion}
              answers={answers}
              onAnswer={handleAnswer}
            />
          ) : null}
        </Animated.View>
      </ScrollView>

      {/* ── Skip footer — optional questions only ────────────────────────── */}
      {!isDifficultyStep && !isNotesStep && currentQuestion && !currentQuestion.required && (
        <View
          style={{
            alignItems: 'flex-end',
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.sm,
            paddingBottom: insets.bottom + spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.border.soft,
          }}
        >
          <Pressable
            onPress={goNext}
            style={({ pressed }) => ({
              opacity: pressed ? 0.4 : 1,
              paddingVertical: spacing.sm,
              paddingLeft: spacing.md,
            })}
            accessibilityLabel="Skip this question"
          >
            <Text style={{ fontSize: 15, color: colors.textSecondary, fontWeight: '500' }}>
              Skip
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Difficulty step — "How did it go?"
// ─────────────────────────────────────────────────────────────────────────────

interface DifficultyStepProps {
  dogName: string;
  selected: 'easy' | 'okay' | 'hard' | null;
  onSelect: (d: 'easy' | 'okay' | 'hard') => void;
}

const DIFFICULTY_OPTIONS: Array<{
  value: 'easy' | 'okay' | 'hard';
  icon: AppIconName;
  label: string;
  sub: (dog: string) => string;
  color: string;
  bg: string;
}> = [
  {
    value: 'easy',
    icon: 'thumbs-up',
    label: 'Easy',
    sub: (dog) => `${dog} was a superstar`,
    color: '#16a34a',
    bg: '#dcfce7',
  },
  {
    value: 'okay',
    icon: 'remove-circle',
    label: 'Okay',
    sub: () => 'Some good moments, some struggles',
    color: '#d97706',
    bg: '#fef3c7',
  },
  {
    value: 'hard',
    icon: 'warning',
    label: 'Hard',
    sub: () => 'Tough session today',
    color: '#dc2626',
    bg: '#fee2e2',
  },
];

function DifficultyStep({ dogName, selected, onSelect }: DifficultyStepProps) {
  return (
    <View style={{ gap: spacing.xl }}>
      <Text
        style={{
          fontSize: 26,
          fontWeight: '700',
          color: colors.textPrimary,
          lineHeight: 34,
        }}
      >
        How did the session go?
      </Text>

      <View style={{ gap: spacing.md }}>
        {DIFFICULTY_OPTIONS.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onSelect(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              style={({ pressed }) => ({
                borderRadius: 16,
                borderWidth: 2,
                minHeight: 72,
                backgroundColor: isSelected ? opt.bg : pressed ? colors.bg.surfaceAlt : colors.surface,
                borderColor: isSelected ? opt.color : colors.border.default,
              })}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  padding: spacing.lg,
                  minHeight: 88,
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    backgroundColor: isSelected ? opt.color : colors.bg.surfaceAlt,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AppIcon name={opt.icon} size={28} color={isSelected ? '#fff' : colors.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: '600',
                      color: isSelected ? opt.color : colors.textPrimary,
                    }}
                  >
                    {opt.label}
                  </Text>
                  <Text style={{ fontSize: 15, color: colors.textSecondary, marginTop: 3 }}>
                    {opt.sub(dogName)}
                  </Text>
                </View>
                {isSelected && (
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: opt.color,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AppIcon name="checkmark" size={15} color="#fff" />
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
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
    <View style={{ gap: spacing.lg }}>
      <Text
        style={{
          fontSize: 26,
          fontWeight: '700',
          color: colors.textPrimary,
          lineHeight: 34,
        }}
      >
        {question.prompt}
      </Text>

      {question.answerType === 'single_select' && question.options ? (
        <SingleSelectInput
          questionId={question.id}
          options={question.options}
          selected={typeof currentValue === 'string' ? currentValue : null}
          onSelect={(value) => onAnswer(question.id, value)}
        />
      ) : question.answerType === 'scale' ? (
        <ScaleInput
          questionId={question.id}
          min={question.scaleMin ?? 1}
          max={question.scaleMax ?? 5}
          minLabel={question.scaleMinLabel ?? null}
          maxLabel={question.scaleMaxLabel ?? null}
          selected={typeof currentValue === 'number' ? currentValue : null}
          onSelect={(value) => onAnswer(question.id, value)}
        />
      ) : null}

      {question.helperText ? (
        <View
          style={{
            backgroundColor: colors.bg.surfaceAlt,
            borderRadius: 10,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          }}
        >
          <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>
            {question.helperText}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Notes + submit step
// ─────────────────────────────────────────────────────────────────────────────

interface NotesStepProps {
  notes: string;
  onNotesChange: (text: string) => void;
  onSubmit: () => void;
  isSaving: boolean;
  canSubmit: boolean;
  theme: CourseUiColors;
}

function NotesStep({ notes, onNotesChange, onSubmit, isSaving, canSubmit, theme }: NotesStepProps) {
  return (
    <View style={{ gap: spacing.xl }}>
      <View style={{ gap: spacing.xs }}>
        <Text style={{ fontSize: 26, fontWeight: '700', color: colors.textPrimary, lineHeight: 34 }}>
          Anything to note?
        </Text>
        <Text style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 22 }}>
          Optional — observations or reminders for next time.
        </Text>
      </View>

      <TextInput
        value={notes}
        onChangeText={onNotesChange}
        placeholder="e.g. Tried near the park gate, wind was an issue…"
        placeholderTextColor={colors.textSecondary}
        multiline
        style={{
          backgroundColor: colors.surface,
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: colors.border.default,
          padding: spacing.md,
          fontSize: 15,
          color: colors.textPrimary,
          minHeight: 110,
          textAlignVertical: 'top',
          lineHeight: 22,
        }}
      />

      <Pressable
        onPress={onSubmit}
        disabled={!canSubmit}
        style={({ pressed }) => ({
          backgroundColor: !canSubmit
            ? colors.border.default
            : pressed
            ? theme.selectedBorder
            : theme.solid,
          borderWidth: canSubmit ? 1 : 0,
          borderColor: canSubmit ? theme.selectedBorder : colors.border.default,
          borderRadius: 14,
          paddingVertical: spacing.md + 4,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 56,
          shadowColor: canSubmit ? theme.solid : 'transparent',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.18,
          shadowRadius: 10,
          elevation: canSubmit ? 4 : 0,
        })}
      >
        <Text
          style={{
            fontSize: 17,
            fontWeight: '700',
            color: canSubmit ? colors.text.primary : colors.textSecondary,
            letterSpacing: 0.2,
          }}
        >
          {isSaving ? 'Saving…' : 'Save session'}
        </Text>
      </Pressable>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Single-select chip group
// ─────────────────────────────────────────────────────────────────────────────

interface SingleSelectInputProps {
  questionId: ReflectionQuestionId;
  options: ReflectionAnswerOption[];
  selected: string | null;
  onSelect: (value: string) => void;
}

function SingleSelectInput({ options, selected, onSelect }: SingleSelectInputProps) {
  return (
    <View style={{ gap: spacing.sm }}>
      {options.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={opt.label}
            style={({ pressed }) => ({
              borderRadius: 14,
              borderWidth: 2,
              minHeight: 52,
              backgroundColor: isSelected
                ? '#E6F4F1'
                : pressed
                ? colors.bg.surfaceAlt
                : colors.surface,
              borderColor: isSelected ? colors.primary : colors.border.default,
            })}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                paddingVertical: spacing.md + 4,
                paddingHorizontal: spacing.md,
                minHeight: 62,
              }}
            >
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  borderWidth: 2,
                  borderColor: isSelected ? colors.primary : colors.border.default,
                  backgroundColor: isSelected ? colors.primary : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isSelected && <AppIcon name="checkmark" size={14} color="#fff" />}
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 17,
                  fontWeight: isSelected ? '600' : '400',
                  color: isSelected ? colors.primary : colors.textPrimary,
                }}
              >
                {opt.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scale input (1–N)
// ─────────────────────────────────────────────────────────────────────────────

interface ScaleInputProps {
  questionId: ReflectionQuestionId;
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
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {ticks.map((n) => {
          const isSelected = selected === n;
          return (
            <Pressable
              key={n}
              onPress={() => onSelect(n)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`${n}`}
              style={({ pressed }) => ({
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: spacing.md,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: isSelected ? colors.primary : colors.border.default,
                backgroundColor: isSelected
                  ? '#E6F4F1'
                  : pressed
                  ? colors.bg.surfaceAlt
                  : colors.surface,
                minHeight: 56,
              })}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: isSelected ? '700' : '500',
                  color: isSelected ? colors.primary : colors.textSecondary,
                }}
              >
                {n}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {(minLabel || maxLabel) && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {minLabel ? (
            <Text style={{ fontSize: 11, color: colors.textSecondary, maxWidth: '40%' }}>
              {minLabel}
            </Text>
          ) : (
            <View />
          )}
          {maxLabel ? (
            <Text style={{ fontSize: 11, color: colors.textSecondary, maxWidth: '40%', textAlign: 'right' }}>
              {maxLabel}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}
