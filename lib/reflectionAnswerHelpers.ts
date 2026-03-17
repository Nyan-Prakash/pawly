/**
 * Pure helpers for mapping PostSessionReflection answers to/from
 * ReflectionQuestionId. Extracted here so they can be tested with Node's
 * --experimental-strip-types without importing React Native modules.
 *
 * The UI component (PostSessionReflectionCard.tsx) re-exports these from here.
 */

import type { PostSessionReflection, ReflectionQuestionId } from '../types/index.ts';
import type { ReflectionQuestionConfig } from './adaptivePlanning/reflectionQuestionTypes.ts';

/**
 * Reads the PostSessionReflection field that corresponds to the given
 * question ID. Returns null when the field has not been answered.
 */
export function getAnswerValue(
  answers: PostSessionReflection,
  questionId: ReflectionQuestionId,
): string | number | null {
  switch (questionId) {
    case 'overallExpectation':   return answers.overallExpectation;
    case 'mainIssue':            return answers.mainIssue;
    case 'failureTiming':        return answers.failureTiming;
    case 'distractionType':      return answers.distractionType;
    case 'cueUnderstanding':     return answers.cueUnderstanding;
    case 'arousalLevel':         return answers.arousalLevel;
    case 'handlerIssue':         return answers.handlerIssue;
    case 'confidenceInAnswers':  return answers.confidenceInAnswers;
    case 'freeformNote':         return answers.freeformNote;
    default:                     return null;
  }
}

/**
 * Returns a new PostSessionReflection with the given field updated.
 * Does not mutate the current object.
 */
export function applyReflectionAnswer(
  current: PostSessionReflection,
  questionId: ReflectionQuestionId,
  value: string | number,
): PostSessionReflection {
  switch (questionId) {
    case 'overallExpectation':
      return { ...current, overallExpectation: value as PostSessionReflection['overallExpectation'] };
    case 'mainIssue':
      return { ...current, mainIssue: value as PostSessionReflection['mainIssue'] };
    case 'failureTiming':
      return { ...current, failureTiming: value as PostSessionReflection['failureTiming'] };
    case 'distractionType':
      return { ...current, distractionType: value as PostSessionReflection['distractionType'] };
    case 'cueUnderstanding':
      return { ...current, cueUnderstanding: value as PostSessionReflection['cueUnderstanding'] };
    case 'arousalLevel':
      return { ...current, arousalLevel: value as PostSessionReflection['arousalLevel'] };
    case 'handlerIssue':
      return { ...current, handlerIssue: value as PostSessionReflection['handlerIssue'] };
    case 'confidenceInAnswers':
      return { ...current, confidenceInAnswers: value as PostSessionReflection['confidenceInAnswers'] };
    case 'freeformNote':
      return { ...current, freeformNote: typeof value === 'string' ? value : null };
    default:
      return current;
  }
}

/**
 * Returns true if all required questions in the list have been answered.
 */
export function areRequiredQuestionsAnswered(
  questions: ReflectionQuestionConfig[],
  answers: PostSessionReflection,
): boolean {
  return questions
    .filter((q) => q.required)
    .every((q) => getAnswerValue(answers, q.id) !== null);
}

/**
 * Returns a blank PostSessionReflection with every field null.
 */
export function makeEmptyReflection(): PostSessionReflection {
  return {
    overallExpectation:  null,
    mainIssue:           null,
    failureTiming:       null,
    distractionType:     null,
    cueUnderstanding:    null,
    arousalLevel:        null,
    handlerIssue:        null,
    confidenceInAnswers: null,
    freeformNote:        null,
  };
}
