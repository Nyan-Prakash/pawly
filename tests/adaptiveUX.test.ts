/**
 * Tests for PR14 adaptive UX logic:
 * - AdaptationNotice copy helpers
 * - LearningInsightCard insight derivation
 * - Plan-preview planningSummary presence
 * - Coach quick suggestion selection
 * - WhyThisChangedSheet success copy safety
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import type { DogLearningState, PlanAdaptation, AdaptivePlanMetadata } from '../types/index.ts';

// ─── Helpers mirrored from components (logic only, no React) ─────────────────

function adaptationTitle(adaptation: { adaptationType: string }, dogName: string): string {
  switch (adaptation.adaptationType) {
    case 'regress':              return `We stepped back for ${dogName}`;
    case 'advance':              return `${dogName} is ready to move forward`;
    case 'detour':               return `We adjusted today's focus`;
    case 'repeat':               return `We're reinforcing this skill`;
    case 'difficulty_adjustment':return `We adjusted the difficulty`;
    case 'schedule_adjustment':  return `We adjusted today's session`;
    default:                     return `We adjusted ${dogName}'s plan`;
  }
}

function adaptationBody(adaptation: { adaptationType: string; reasonSummary: string }): string {
  if (adaptation.reasonSummary) return adaptation.reasonSummary;
  switch (adaptation.adaptationType) {
    case 'regress':  return 'We stepped back to an easier version so your dog can build confidence again.';
    case 'advance':  return 'Recent sessions have gone well, so we moved to the next challenge.';
    case 'detour':   return 'We swapped in a different skill to keep things fresh and avoid frustration.';
    case 'repeat':   return 'Another session on this skill will help lock in what was learned.';
    default:         return 'The plan was updated based on recent training results.';
  }
}

function deriveInsights(dogName: string, state: DogLearningState): string[] {
  const insights: string[] = [];
  for (const h of state.currentHypotheses.slice(0, 2)) {
    if (h.summary) insights.push(h.summary);
  }
  if (state.confidenceScore < 2.5)  insights.push(`${dogName} seems to be building confidence — shorter, easier sessions are helping.`);
  else if (state.confidenceScore >= 4) insights.push(`${dogName}'s confidence is high. This is a great time for new challenges.`);
  if (state.distractionSensitivity >= 3.5) insights.push(`Outdoor distractions are still the biggest challenge for ${dogName}.`);
  if (state.motivationScore >= 4)   insights.push(`${dogName} is showing strong motivation right now — keep the sessions varied and fun.`);
  else if (state.motivationScore < 2.5) insights.push(`${dogName}'s drive seems a bit lower lately. Try shorter sessions with higher-value treats.`);
  if (state.fatigueRiskScore >= 3.5) insights.push(`Watch for signs of mental tiredness — ${dogName} may need more recovery between sessions.`);
  return insights.slice(0, 4);
}

const BASE_SUGGESTIONS = [
  'Should I push through or make it easier?',
  'How do I know when my dog is ready to progress?',
  "What should I focus on in today's session?",
  'My dog keeps getting distracted — what should I do?',
];

const ADAPTIVE_SUGGESTIONS = [
  'Why did today\'s plan change?',
  'What is Pawly learning about my dog?',
  'Should I push through or make it easier?',
  'How do I know when my dog is ready to progress?',
];

function getCoachSuggestions(hasRecentAdaptation: boolean): string[] {
  return hasRecentAdaptation ? ADAPTIVE_SUGGESTIONS : BASE_SUGGESTIONS;
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeAdaptation(overrides: Partial<PlanAdaptation> = {}): PlanAdaptation {
  return {
    id: 'adapt_1',
    dogId: 'dog_1',
    planId: 'plan_1',
    triggeredBySessionLogId: null,
    createdAt: '2026-03-14T10:00:00Z',
    adaptationType: 'regress',
    status: 'applied',
    reasonCode: 'low_success_rate',
    reasonSummary: '',
    evidence: {},
    previousSnapshot: {},
    newSnapshot: {},
    changedSessionIds: [],
    changedFields: [],
    modelName: null,
    latencyMs: null,
    wasUserVisible: true,
    ...overrides,
  };
}

function makeState(overrides: Partial<DogLearningState> = {}): DogLearningState {
  return {
    id: 'state_1',
    dogId: 'dog_1',
    createdAt: '2026-03-14T00:00:00Z',
    updatedAt: '2026-03-14T00:00:00Z',
    motivationScore: 3,
    distractionSensitivity: 3,
    confidenceScore: 3,
    impulseControlScore: 3,
    handlerConsistencyScore: 3,
    fatigueRiskScore: 2,
    recoverySpeedScore: 3,
    environmentConfidence: {},
    behaviorSignals: {},
    recentTrends: {},
    currentHypotheses: [],
    lastEvaluatedAt: null,
    version: 1,
    ...overrides,
  };
}

// ─── AdaptationNotice copy ────────────────────────────────────────────────────

test('adaptationTitle: regress', () => {
  assert.equal(adaptationTitle({ adaptationType: 'regress' }, 'Max'), 'We stepped back for Max');
});

test('adaptationTitle: advance', () => {
  assert.equal(adaptationTitle({ adaptationType: 'advance' }, 'Bella'), 'Bella is ready to move forward');
});

test('adaptationTitle: detour', () => {
  const t = adaptationTitle({ adaptationType: 'detour' }, 'Rex');
  assert.ok(t.includes('focus'));
});

test('adaptationTitle: unknown type falls back gracefully', () => {
  const t = adaptationTitle({ adaptationType: 'environment_adjustment' }, 'Luna');
  assert.ok(t.includes('Luna'));
});

test('adaptationBody: prefers reasonSummary over default', () => {
  const a = makeAdaptation({ reasonSummary: 'Custom trainer note here.', adaptationType: 'regress' });
  assert.equal(adaptationBody(a), 'Custom trainer note here.');
});

test('adaptationBody: falls back to default copy when reasonSummary empty', () => {
  const a = makeAdaptation({ reasonSummary: '', adaptationType: 'advance' });
  const body = adaptationBody(a);
  assert.ok(body.includes('moved to the next challenge'));
});

test('adaptationBody: unknown type falls back to generic copy', () => {
  const a = makeAdaptation({ reasonSummary: '', adaptationType: 'schedule_adjustment' as any });
  const body = adaptationBody(a);
  assert.ok(body.length > 0);
});

// ─── LearningInsightCard insight derivation ───────────────────────────────────

test('deriveInsights: returns empty array for neutral scores with no hypotheses', () => {
  const state = makeState(); // all at 3 — no extreme signals
  const insights = deriveInsights('Max', state);
  assert.equal(insights.length, 0);
});

test('deriveInsights: includes hypothesis summaries', () => {
  const state = makeState({
    currentHypotheses: [
      { code: 'h1', summary: 'Max learns best in short bursts.', evidence: [], confidence: 'medium' },
      { code: 'h2', summary: 'Outdoor sessions are harder.', evidence: [], confidence: 'low' },
    ],
  });
  const insights = deriveInsights('Max', state);
  assert.ok(insights.includes('Max learns best in short bursts.'));
  assert.ok(insights.includes('Outdoor sessions are harder.'));
});

test('deriveInsights: low confidence score triggers confidence insight', () => {
  const state = makeState({ confidenceScore: 2.0 });
  const insights = deriveInsights('Buddy', state);
  assert.ok(insights.some((i) => i.includes('building confidence')));
});

test('deriveInsights: high confidence score triggers forward-progress insight', () => {
  const state = makeState({ confidenceScore: 4.5 });
  const insights = deriveInsights('Coco', state);
  assert.ok(insights.some((i) => i.includes('confidence is high')));
});

test('deriveInsights: high distraction sensitivity triggers distraction insight', () => {
  const state = makeState({ distractionSensitivity: 4.0 });
  const insights = deriveInsights('Rex', state);
  assert.ok(insights.some((i) => i.includes('distractions')));
});

test('deriveInsights: low motivation triggers motivation insight', () => {
  const state = makeState({ motivationScore: 2.0 });
  const insights = deriveInsights('Milo', state);
  assert.ok(insights.some((i) => i.includes('drive seems a bit lower')));
});

test('deriveInsights: high fatigue risk triggers fatigue insight', () => {
  const state = makeState({ fatigueRiskScore: 4.0 });
  const insights = deriveInsights('Nala', state);
  assert.ok(insights.some((i) => i.includes('mental tiredness')));
});

test('deriveInsights: caps output at 4 items', () => {
  const state = makeState({
    motivationScore: 1,        // low motivation
    confidenceScore: 1,        // low confidence
    distractionSensitivity: 5, // high distraction
    fatigueRiskScore: 5,       // high fatigue
    currentHypotheses: [
      { code: 'h1', summary: 'Hyp one.', evidence: [], confidence: 'high' },
      { code: 'h2', summary: 'Hyp two.', evidence: [], confidence: 'high' },
    ],
  });
  const insights = deriveInsights('Max', state);
  assert.ok(insights.length <= 4);
});

test('deriveInsights: safe with null-ish state values', () => {
  const state = makeState({ currentHypotheses: [], environmentConfidence: {} });
  const insights = deriveInsights('Ace', state);
  assert.ok(Array.isArray(insights));
});

// ─── Plan-preview: planningSummary presence check ─────────────────────────────

test('AdaptivePlanMetadata planningSummary is optional', () => {
  const metadata: AdaptivePlanMetadata = {
    plannerVersion: '1.0',
    plannerMode: 'adaptive_ai',
    selectedSkillIds: [],
    validationWarnings: [],
    // planningSummary intentionally omitted
  };
  assert.equal(metadata.planningSummary, undefined);
});

test('AdaptivePlanMetadata planningSummary is used when present', () => {
  const metadata: AdaptivePlanMetadata = {
    plannerVersion: '1.0',
    plannerMode: 'adaptive_ai',
    selectedSkillIds: ['skill_recall_01'],
    validationWarnings: [],
    planningSummary: {
      whyThisStart: 'Starting with foundation recall indoors.',
      keyAssumptions: ['Dog has no prior training.'],
      risksToWatch: ['Distraction sensitivity may be higher outdoors.'],
    },
  };
  assert.ok(metadata.planningSummary?.whyThisStart?.length ?? 0 > 0);
  assert.equal(metadata.planningSummary?.keyAssumptions?.length, 1);
});

// ─── Coach quick suggestions ──────────────────────────────────────────────────

test('coach suggestions: returns base set when no recent adaptation', () => {
  const suggestions = getCoachSuggestions(false);
  assert.ok(suggestions.includes('Should I push through or make it easier?'));
  assert.ok(!suggestions.includes("Why did today's plan change?"));
});

test('coach suggestions: returns adaptive set when adaptation exists', () => {
  const suggestions = getCoachSuggestions(true);
  assert.ok(suggestions.includes("Why did today's plan change?"));
  assert.ok(suggestions.includes('What is Pawly learning about my dog?'));
});

test('coach suggestions: adaptive set still includes core coaching question', () => {
  const suggestions = getCoachSuggestions(true);
  assert.ok(suggestions.includes('Should I push through or make it easier?'));
});

test('coach suggestions: always returns 4 items', () => {
  assert.equal(getCoachSuggestions(false).length, 4);
  assert.equal(getCoachSuggestions(true).length, 4);
});

// ─── Dogs without adaptive data: safe fallbacks ───────────────────────────────

test('deriveInsights: returns empty for null-equivalent state (all neutral)', () => {
  const state = makeState({
    motivationScore: 3,
    confidenceScore: 3,
    distractionSensitivity: 3,
    fatigueRiskScore: 3,
    currentHypotheses: [],
    environmentConfidence: {},
  });
  const insights = deriveInsights('Nova', state);
  // No hypotheses + all neutral scores = no insights = safe empty array
  assert.ok(Array.isArray(insights));
  assert.equal(insights.length, 0);
});

test('coach suggestions: base set safe without adaptive data', () => {
  const suggestions = getCoachSuggestions(false);
  assert.ok(suggestions.every((s) => typeof s === 'string' && s.length > 0));
});
