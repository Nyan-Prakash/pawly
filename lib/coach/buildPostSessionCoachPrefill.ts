import type { PostSessionReflection, Protocol } from '@/types';

export interface PrefillInput {
  dogName: string;
  protocolTitle: string;
  difficulty: 'easy' | 'okay' | 'hard' | null;
  sessionStatus: 'completed' | 'abandoned';
  postSessionReflection: PostSessionReflection | null;
  notes: string | null;
}

/**
 * Builds a natural language coach prefill message based on session context.
 * Map enums to human-readable language and keep it concise.
 */
export function buildPostSessionCoachPrefill(input: PrefillInput): string {
  const { dogName, protocolTitle, difficulty, sessionStatus, postSessionReflection, notes } = input;

  let message = `Today’s session on ${protocolTitle} with ${dogName} felt `;

  if (sessionStatus === 'abandoned') {
    message += 'especially challenging, and I ended it early.';
  } else if (difficulty === 'hard') {
    message += 'hard.';
  } else {
    message += 'tougher than usual.';
  }

  const issues: string[] = [];
  if (postSessionReflection?.mainIssue) {
    const issueMap: Record<string, string> = {
      did_not_understand: 'appeared not to understand the instructions',
      broke_position: 'kept breaking position',
      distracted: 'was easily distracted',
      over_excited: 'seemed over-excited',
      tired_done: 'seemed tired or disinterested',
      handler_inconsistent: 'I struggled with consistent timing or cues',
    };
    const mapped = issueMap[postSessionReflection.mainIssue];
    if (mapped) issues.push(mapped);
  }

  if (postSessionReflection?.distractionType) {
    const distractionMap: Record<string, string> = {
      dogs: 'other dogs',
      people: 'people',
      smells: 'interesting smells',
      noise_movement: 'noises and movement',
      other: 'distractions',
    };
    const mapped = distractionMap[postSessionReflection.distractionType];
    if (mapped) issues.push(`struggled specifically with ${mapped}`);
  }

  if (issues.length > 0) {
    message += ` ${dogName} ${issues.join(' and ')}.`;
  }

  if (postSessionReflection?.arousalLevel === 'very_up') {
    message += ` ${dogName} seemed more overstimulated than usual.`;
  }

  if (notes && notes.trim().length > 0) {
    message += ` My notes: "${notes.trim()}"`;
  }

  message += ' Can you help me understand what likely went wrong and what I should do differently next time?';

  return message;
}
