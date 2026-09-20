/**
 * Goal options offered in onboarding (app/(onboarding)/dog-basics.tsx).
 *
 * Every `value` here MUST be a key of GOAL_MAP in lib/planGenerator.ts. A value
 * that is not builds the wrong course: the generators fall back to loose leash.
 * tests/goalCoverage.test.ts enforces this, which is why the lists live here and
 * not in the screen. Keep this file free of runtime imports so the node test
 * runner can load it.
 */

import type { AppIconName } from '@/components/ui/AppIcon';

export type OnboardingGoalOption = {
  value: string;
  label: string;
  icon: AppIconName;
  description?: string;
};

/** "What do you want to work on first?" */
export const ISSUE_OPTIONS: OnboardingGoalOption[] = [
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

/**
 * "Teach a trick instead". Stay and wait share the wait_and_stay course, shake
 * is stage 1 of high_five, place is the settling course and leave it is the
 * leave_it course, so those options carry the real course keys.
 */
export const TRICK_OPTIONS: OnboardingGoalOption[] = [
  { value: 'sit', label: 'Sit', icon: 'chevron-down-circle', description: 'Sit on cue' },
  { value: 'down', label: 'Down', icon: 'arrow-down-circle', description: 'Lie down on cue' },
  { value: 'wait_and_stay', label: 'Wait and stay', icon: 'time', description: 'Hold position until released' },
  { value: 'heel', label: 'Heel', icon: 'footsteps', description: 'Walk in formal heel position' },
  { value: 'basic_obedience', label: 'Basic obedience', icon: 'school', description: 'Sit, down and stay together' },
  { value: 'touch', label: 'Touch', icon: 'finger-print', description: 'Nose-target your hand' },
  { value: 'high_five', label: 'Shake and high five', icon: 'hand-right', description: 'Offer a paw, then tap your hand up high' },
  { value: 'spin', label: 'Spin', icon: 'refresh-circle', description: 'Turn in a circle' },
  { value: 'bow', label: 'Take a bow', icon: 'ribbon', description: 'Elbows down, rear up' },
  { value: 'roll_over', label: 'Roll over', icon: 'sync-circle', description: 'Roll from side to side' },
  { value: 'leg_weave', label: 'Leg weave', icon: 'infinite', description: 'Figure eight through your legs' },
  { value: 'leave_it', label: 'Leave it', icon: 'ban', description: 'Ignore and move away from items' },
  { value: 'settling', label: 'Place', icon: 'bed', description: 'Go to a mat and settle there' },
];
