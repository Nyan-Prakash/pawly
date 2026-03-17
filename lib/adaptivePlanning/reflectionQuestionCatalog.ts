import type { ReflectionQuestionConfig } from './reflectionQuestionTypes.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Reflection question catalog
//
// Each entry is the full render config for one question.
// The engine selects a subset at runtime; UI consumes these objects directly.
// ─────────────────────────────────────────────────────────────────────────────

export const OVERALL_EXPECTATION_QUESTION: ReflectionQuestionConfig = {
  id: 'overallExpectation',
  prompt: 'How did the session go overall?',
  answerType: 'single_select',
  options: [
    { value: 'better_than_expected', label: 'Better than expected' },
    { value: 'as_expected',          label: 'About as expected' },
    { value: 'worse_than_expected',  label: 'Worse than expected' },
  ],
  required: true,
  helperText: null,
};

export const MAIN_ISSUE_QUESTION: ReflectionQuestionConfig = {
  id: 'mainIssue',
  prompt: 'What was the main challenge, if any?',
  answerType: 'single_select',
  options: [
    { value: 'no_major_issue',      label: 'No major issue' },
    { value: 'did_not_understand',  label: "Didn't understand the cue" },
    { value: 'broke_position',      label: "Broke position / couldn't hold" },
    { value: 'distracted',          label: 'Got distracted' },
    { value: 'over_excited',        label: 'Too excited / over threshold' },
    { value: 'tired_done',          label: 'Seemed tired or done' },
    { value: 'handler_inconsistent', label: 'I was inconsistent' },
  ],
  required: true,
  helperText: null,
};

export const FAILURE_TIMING_QUESTION: ReflectionQuestionConfig = {
  id: 'failureTiming',
  prompt: 'When did things start to break down?',
  answerType: 'single_select',
  options: [
    { value: 'immediately',       label: 'Immediately' },
    { value: 'midway',            label: 'Midway through' },
    { value: 'near_end',          label: 'Near the end' },
    { value: 'never_stabilized',  label: 'It never really stabilized' },
  ],
  required: false,
  helperText: 'This helps us understand whether it was a warm-up issue or stamina.',
};

export const DISTRACTION_TYPE_QUESTION: ReflectionQuestionConfig = {
  id: 'distractionType',
  prompt: 'What was the distraction?',
  answerType: 'single_select',
  options: [
    { value: 'dogs',             label: 'Other dogs' },
    { value: 'people',           label: 'People' },
    { value: 'smells',           label: 'Smells' },
    { value: 'noise_movement',   label: 'Movement / noise' },
    { value: 'other',            label: 'Something else' },
  ],
  required: false,
  helperText: 'Knowing the distraction type helps us pick the right environment for next time.',
};

export const CUE_UNDERSTANDING_QUESTION: ReflectionQuestionConfig = {
  id: 'cueUnderstanding',
  prompt: 'Did your dog seem to understand what you were asking?',
  answerType: 'single_select',
  options: [
    { value: 'yes',     label: 'Yes' },
    { value: 'not_yet', label: 'Not yet' },
    { value: 'unsure',  label: 'Unsure' },
  ],
  required: false,
  helperText: null,
};

export const AROUSAL_LEVEL_QUESTION: ReflectionQuestionConfig = {
  id: 'arousalLevel',
  prompt: "How was your dog's energy level going into the session?",
  answerType: 'single_select',
  options: [
    { value: 'calm',        label: 'Calm' },
    { value: 'slightly_up', label: 'A little amped up' },
    { value: 'very_up',     label: 'Very amped up' },
  ],
  required: false,
  helperText: null,
};

export const HANDLER_ISSUE_QUESTION: ReflectionQuestionConfig = {
  id: 'handlerIssue',
  prompt: 'What felt off on your end?',
  answerType: 'single_select',
  options: [
    { value: 'timing_rewards',   label: 'Timing rewards' },
    { value: 'cue_consistency',  label: 'Cue consistency' },
    { value: 'leash_setup',      label: 'Leash / setup' },
    { value: 'session_focus',    label: 'Keeping the session focused' },
    { value: 'other',            label: 'Something else' },
  ],
  required: false,
  helperText: null,
};

export const CONFIDENCE_IN_ANSWERS_QUESTION: ReflectionQuestionConfig = {
  id: 'confidenceInAnswers',
  prompt: 'How confident are you in your answers above?',
  answerType: 'scale',
  scaleMin: 1,
  scaleMax: 5,
  scaleMinLabel: 'Not sure at all',
  scaleMaxLabel: 'Very confident',
  required: false,
  helperText: 'Lower confidence is fine — it helps us weight your answers correctly.',
};

/**
 * Full ordered catalog: all questions indexed by ReflectionQuestionId.
 * Import individual exports above for direct access; use this map for lookups.
 */
export const REFLECTION_QUESTION_CATALOG = {
  overallExpectation:  OVERALL_EXPECTATION_QUESTION,
  mainIssue:           MAIN_ISSUE_QUESTION,
  failureTiming:       FAILURE_TIMING_QUESTION,
  distractionType:     DISTRACTION_TYPE_QUESTION,
  cueUnderstanding:    CUE_UNDERSTANDING_QUESTION,
  arousalLevel:        AROUSAL_LEVEL_QUESTION,
  handlerIssue:        HANDLER_ISSUE_QUESTION,
  confidenceInAnswers: CONFIDENCE_IN_ANSWERS_QUESTION,
} as const satisfies Record<string, ReflectionQuestionConfig>;
