/**
 * Personalization helpers to generate polished, user-facing copy
 * from existing onboarding, dog, and plan data.
 */

export function buildPlanPersonalizationLine(
  dogName: string,
  primaryGoal?: string,
  trainingExperience?: string
): string {
  const goalMap: Record<string, string> = {
    'leash_pulling': 'leash pulling',
    'leash pulling': 'leash pulling',
    'jumping_up': 'jumping up',
    'jumping up': 'jumping up',
    'barking': 'barking',
    "won't come": 'recall',
    'recall': 'recall',
    'potty_training': 'potty training',
    'potty training': 'potty training',
    'crate_anxiety': 'crate anxiety',
    'crate anxiety': 'crate anxiety',
    'puppy_biting': 'puppy biting',
    'puppy biting': 'puppy biting',
    'settling': 'settling',
    'leave_it': 'leave it',
    'basic_obedience': 'basic obedience',
    'separation_anxiety': 'separation anxiety',
    'door_manners': 'door manners',
    'impulse_control': 'impulse control',
    'cooperative_care': 'cooperative care',
    'wait_and_stay': 'wait & stay',
    'leash_reactivity': 'leash reactivity',
    'sit': 'sit',
    'down': 'down',
    'heel': 'heel',
  };

  const experienceMap: Record<string, string> = {
    'none': 'beginner-level experience',
    'some': 'some prior training experience',
    'experienced': 'years of training experience',
  };

  const dog = dogName || 'your dog';
  const goalPhrase = primaryGoal ? goalMap[primaryGoal.toLowerCase()] : null;
  const expPhrase = trainingExperience ? experienceMap[trainingExperience] : null;

  if (goalPhrase && expPhrase) {
    return `Built for ${dog} based on ${goalPhrase} and ${expPhrase}.`;
  }

  if (goalPhrase) {
    return `Built for ${dog} based on ${goalPhrase}.`;
  }

  if (expPhrase) {
    return `Built for ${dog} based on ${expPhrase}.`;
  }

  return `Built for ${dog} based on your onboarding answers.`;
}
