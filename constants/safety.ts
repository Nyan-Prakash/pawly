/**
 * AI-safety and "when to see a professional" copy, in one place so it can be
 * reviewed without reading screen code. US spelling, sentence case, no
 * exclamation marks (DESIGN.md).
 */

export const SUPPORT_EMAIL = 'support@pawly.app';

/** Shown under the coach chat, always visible at the end of the conversation. */
export const COACH_AI_DISCLAIMER =
  "Pawly's coach is AI and can make mistakes. It isn't a substitute for a vet or certified behaviorist.";

/** Shown where the owner chooses to train with the camera. */
export const LIVE_COACH_AI_DISCLAIMER =
  "The live coach is AI and can misread what the camera sees. It isn't a substitute for a vet or certified behaviorist.";

/**
 * Goal / behavior keys (the `behavior` field in constants/protocols*.ts and the
 * goal keys in the add-course flow) that get the notice before the course is
 * added, and before its first session if it was chosen during onboarding.
 *
 * There is no resource-guarding or aggression course in the library today. If
 * one is added, list its key here.
 */
export const HIGH_RISK_GOAL_KEYS: readonly string[] = [
  'leash_reactivity',
  'separation_anxiety',
  'crate_anxiety',
  'puppy_biting',
];

export function isHighRiskGoal(goalKey: string | null | undefined): boolean {
  return !!goalKey && HIGH_RISK_GOAL_KEYS.includes(goalKey);
}

export const PROFESSIONAL_HELP_NOTICE = {
  title: 'When to see a professional',
  body: 'This course is for everyday training. Some problems need hands-on help first. Pause the course and get help if you see any of these.',
  redFlags: [
    'Bites or bite attempts toward people or other dogs, including snaps that miss.',
    'An injury to a person, another animal or your dog.',
    'A sudden change in behavior. See your vet first, because pain and illness often look like a training problem.',
    'Panic when left alone: breaking out of a crate or room, hurting themselves, or nonstop distress.',
  ],
  footer:
    'For bite risk or severe anxiety, work with a certified behaviorist or a veterinary behaviorist. In an emergency, call your vet.',
  acknowledge: 'Got it',
} as const;

/** Reasons offered when an owner reports a coach answer. */
export const COACH_REPORT_REASONS = [
  { key: 'unsafe', label: 'Unsafe or harmful advice' },
  { key: 'wrong', label: 'Wrong or unhelpful' },
] as const;

export type CoachReportReason = (typeof COACH_REPORT_REASONS)[number]['key'];
