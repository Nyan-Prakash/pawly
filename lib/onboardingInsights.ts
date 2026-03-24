type ProblemKey =
  | 'pulls_on_leash'
  | 'jumps_on_people'
  | 'barking'
  | 'recall'
  | 'puppy_biting'
  | 'crate_anxiety';

interface OnboardingInsight {
  title: string;
  summary: string;
  focusAreas: string[];
}

export function buildOnboardingInsight(params: {
  dogName: string;
  primaryProblem: string;
  severity: 'mild' | 'moderate' | 'severe';
  environmentType: 'apartment' | 'house_no_yard' | 'house_yard';
  hasKids: boolean;
  hasOtherPets: boolean;
}): OnboardingInsight {
  const { dogName, primaryProblem, severity, environmentType, hasKids, hasOtherPets } = params;

  const problem = primaryProblem as ProblemKey;

  const insights: Record<ProblemKey, OnboardingInsight> = {
    pulls_on_leash: {
      title: "We understand what's going on",
      summary: `${dogName} is likely struggling with impulse control and overstimulation, especially in distracting environments. Pulling is often a sign that the world is moving faster than their focus.`,
      focusAreas: ["Calm behavior first", "Clear communication", "Gradual exposure"],
    },
    jumps_on_people: {
      title: "The greeting challenge",
      summary: `${dogName} is likely overly excited during social interactions and hasn't learned that 'four paws on the floor' is the best way to get your attention.`,
      focusAreas: ["Impulse control", "Alternative behaviors", "Consistent boundaries"],
    },
    barking: {
      title: "Finding their quiet",
      summary: `${dogName} may be reacting to environmental triggers or seeking attention. In ${environmentType === 'apartment' ? 'an apartment' : 'your home'}, these sounds can feel amplified for both of you.`,
      focusAreas: ["Threshold management", "Focus exercises", "Desensitisation"],
    },
    recall: {
      title: "Building a reliable bond",
      summary: `${dogName} finds the environment more rewarding than the 'come' cue right now. We need to make you the most interesting thing in their world.`,
      focusAreas: ["High-value engagement", "Whistle foundation", "Distraction proofing"],
    },
    puppy_biting: {
      title: "Navigating the puppy phase",
      summary: `${dogName} is using their mouth to explore and communicate, which is natural but needs clear redirection to protect your hands ${hasKids ? 'and children' : 'and furniture'}.`,
      focusAreas: ["Bite inhibition", "Appropriate redirection", "Enforced rest"],
    },
    crate_anxiety: {
      title: "Creating a safe haven",
      summary: `${dogName} associates the crate with isolation or negative experiences. We'll work on making it their favorite, most secure spot in the house.`,
      focusAreas: ["Positive association", "Incremental duration", "Relaxation protocols"],
    },
  };

  // Default fallback
  const baseInsight = insights[problem] || {
    title: "A personalised path for " + dogName,
    summary: `${dogName} has unique needs based on their environment and behavior. We've designed a starting point that builds confidence and clarity.`,
    focusAreas: ["Foundation skills", "Consistent routine", "Positive reinforcement"],
  };

  // Subtle severity adjustments
  if (severity === 'severe') {
    baseInsight.summary = baseInsight.summary.replace("is likely", "is clearly") + " Given the severity, we'll start with very low-distraction environments to ensure success.";
  }

  // Environment adjustments
  if (environmentType === 'apartment' && problem === 'barking') {
    baseInsight.focusAreas[0] = "Quiet apartment protocols";
  }

  // Household adjustments
  if (hasOtherPets && problem === 'recall') {
    baseInsight.focusAreas[2] = "Multi-pet distractions";
  }

  return baseInsight;
}
