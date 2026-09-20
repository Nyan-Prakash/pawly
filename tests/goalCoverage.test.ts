import test from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

import { GOAL_KEYS } from '../constants/courseColors.ts';
import { ISSUE_OPTIONS, TRICK_OPTIONS } from '../constants/onboardingGoals.ts';
import { EXERCISE_TO_PROTOCOL, PROTOCOLS_BY_BEHAVIOR, PROTOCOLS_BY_ID } from '../constants/protocols.ts';
import { TRICK_EXERCISE_TO_PROTOCOL, TRICK_PROTOCOLS } from '../constants/trickProtocols.ts';
import { buildCourseTitle } from '../lib/addCourseUtils.ts';
import {
  GOAL_MAP,
  GOAL_TITLES,
  SEQUENCES,
  generatePlan,
  getPlanBullets,
  getPlanTitle,
  resolveGoalKey,
} from '../lib/planGenerator.ts';
import { getBehaviorLabel } from '../lib/scheduleEngine.ts';
import type { Dog } from '../types/index.ts';

const COURSE_KEYS = [...new Set(Object.values(GOAL_MAP))];
const TRICK_KEYS = ['touch', 'spin', 'high_five', 'bow', 'roll_over', 'leg_weave'];

function makeDog(goal: string): Dog {
  return {
    id: 'dog-1',
    ownerId: 'owner-1',
    name: 'Milo',
    breed: 'Mixed',
    breedGroup: 'mixed',
    ageMonths: 12,
    sex: 'male',
    neutered: true,
    environmentType: 'house_yard',
    behaviorGoals: [goal],
    trainingExperience: 'none',
    equipment: [],
    availableDaysPerWeek: 3,
    availableMinutesPerDay: 10,
    lifecycleStage: 'adolescent',
    createdAt: '2026-01-01T00:00:00.000Z',
  } as unknown as Dog;
}

/** Capture console.warn calls made while `fn` runs. */
function captureWarnings(fn: () => void): string[] {
  const original = console.warn;
  const seen: string[] = [];
  console.warn = (...args: unknown[]) => { seen.push(args.map(String).join(' ')); };
  try {
    fn();
  } finally {
    console.warn = original;
  }
  return seen;
}

test('goal coverage: every GOAL_MAP course has sequences, a title and bullets', () => {
  assert.ok(COURSE_KEYS.length >= 25, `expected at least 25 courses, got ${COURSE_KEYS.length}`);
  for (const key of COURSE_KEYS) {
    assert.ok(Object.hasOwn(GOAL_MAP, key), `${key}: course key must map to itself in GOAL_MAP`);
    assert.strictEqual(GOAL_MAP[key], key);
    assert.ok(Array.isArray(SEQUENCES[key]) && SEQUENCES[key].length > 0, `${key}: missing SEQUENCES`);
    assert.ok(typeof GOAL_TITLES[key] === 'string' && GOAL_TITLES[key].length > 0, `${key}: missing GOAL_TITLES`);
    assert.ok(getPlanTitle('Milo', key).includes(GOAL_TITLES[key]), `${key}: plan title`);
    const bullets = getPlanBullets(key);
    assert.ok(Array.isArray(bullets) && bullets.length === 3, `${key}: expected 3 bullets`);
    for (const bullet of bullets) assert.ok(bullet.trim().length > 0, `${key}: empty bullet`);
  }
  assert.deepStrictEqual(Object.keys(SEQUENCES).sort(), [...COURSE_KEYS].sort());
  assert.deepStrictEqual(Object.keys(GOAL_TITLES).sort(), [...COURSE_KEYS].sort());
});

test('goal coverage: every sequence exercise resolves to a protocol of the same course', () => {
  for (const key of COURSE_KEYS) {
    for (const [exerciseId, title, minutes] of SEQUENCES[key]) {
      const protocolId = EXERCISE_TO_PROTOCOL[exerciseId];
      assert.ok(protocolId, `${key}/${exerciseId}: not in EXERCISE_TO_PROTOCOL`);
      const protocol = PROTOCOLS_BY_ID[protocolId];
      assert.ok(protocol, `${key}/${exerciseId}: protocol ${protocolId} not in PROTOCOLS_BY_ID`);
      assert.strictEqual(protocol.behavior, key, `${key}/${exerciseId}: resolves to a ${protocol.behavior} protocol`);
      assert.ok(title.trim().length > 0, `${key}/${exerciseId}: empty title`);
      assert.ok(minutes > 0, `${key}/${exerciseId}: duration`);
    }
  }
});

test('goal coverage: every course key is registered in the hand-maintained label lists', () => {
  for (const key of COURSE_KEYS) {
    assert.ok((GOAL_KEYS as readonly string[]).includes(key), `${key}: missing from courseColors GOAL_KEYS`);
    assert.notStrictEqual(buildCourseTitle(key), key, `${key}: missing from addCourseUtils GOAL_TITLES`);
    assert.notStrictEqual(getBehaviorLabel(key), key, `${key}: missing from scheduleEngine getBehaviorLabel`);
    assert.ok(PROTOCOLS_BY_BEHAVIOR[key]?.length, `${key}: no protocols with this behavior`);
  }
});

test('goal coverage: the six trick courses are wired in', () => {
  assert.strictEqual(TRICK_PROTOCOLS.length, 18);
  for (const protocol of TRICK_PROTOCOLS) {
    assert.strictEqual(PROTOCOLS_BY_ID[protocol.id], protocol, `${protocol.id}: not merged into PROTOCOLS`);
    if (protocol.nextProtocolId) {
      assert.ok(PROTOCOLS_BY_ID[protocol.nextProtocolId], `${protocol.id}: dangling nextProtocolId`);
    }
  }
  for (const [exerciseId, protocolId] of Object.entries(TRICK_EXERCISE_TO_PROTOCOL)) {
    assert.strictEqual(EXERCISE_TO_PROTOCOL[exerciseId], protocolId);
  }
  for (const key of TRICK_KEYS) {
    assert.strictEqual(GOAL_MAP[key], key);
    assert.strictEqual(PROTOCOLS_BY_BEHAVIOR[key].length, 3);
    const plan = generatePlan(makeDog(key));
    assert.strictEqual(plan.goal, key);
    assert.ok(plan.sessions.length > 0);
    for (const session of plan.sessions) {
      const protocol = PROTOCOLS_BY_ID[EXERCISE_TO_PROTOCOL[session.exerciseId]];
      assert.strictEqual(protocol?.behavior, key, `${key}: plan session ${session.exerciseId} is a ${protocol?.behavior} session`);
    }
  }
});

test('goal coverage: every onboarding goal option is a key of GOAL_MAP', () => {
  for (const option of [...ISSUE_OPTIONS, ...TRICK_OPTIONS]) {
    assert.ok(Object.hasOwn(GOAL_MAP, option.value), `onboarding option "${option.label}" (${option.value}) is not in GOAL_MAP`);
    const warnings = captureWarnings(() => resolveGoalKey(option.value));
    assert.deepStrictEqual(warnings, [], `${option.value}: resolved with a fallback warning`);
  }
  for (const options of [ISSUE_OPTIONS, TRICK_OPTIONS]) {
    const values = options.map((o) => o.value);
    assert.strictEqual(new Set(values).size, values.length, 'duplicate option value within one list');
  }
  for (const removed of ['stay', 'shake', 'play_dead', 'fetch', 'speak', 'leave_it_trick', 'place']) {
    assert.ok(!TRICK_OPTIONS.some((o) => o.value === removed), `${removed} has no course and must not be offered`);
  }
});

test('goal coverage: the onboarding screen takes its goal options from constants/onboardingGoals', () => {
  const source = readFileSync(new URL('../app/(onboarding)/dog-basics.tsx', import.meta.url), 'utf8');
  assert.match(source, /from '@\/constants\/onboardingGoals'/);
  assert.doesNotMatch(source, /const (ISSUE|TRICK)_OPTIONS\b/, 'goal options must not be redefined in the screen');
});

test('goal coverage: an unknown goal falls back to loose leash, loudly', () => {
  const warnings = captureWarnings(() => {
    assert.strictEqual(resolveGoalKey('play_dead_unknown'), 'leash_pulling');
    assert.strictEqual(resolveGoalKey('constructor'), 'leash_pulling');
    assert.strictEqual(resolveGoalKey(undefined), 'leash_pulling');
  });
  assert.strictEqual(warnings.length, 3);
  assert.match(warnings[0], /play_dead_unknown/);
  assert.match(warnings[0], /GOAL_MAP/);

  const planWarnings = captureWarnings(() => {
    const plan = generatePlan(makeDog('some_goal_from_old_data'));
    assert.strictEqual(plan.sessions[0].exerciseId, 'll_01');
  });
  assert.ok(planWarnings.some((w) => w.includes('some_goal_from_old_data')));
});

test('goal coverage: the edge function GOAL_MAP and SEQUENCES match the client', () => {
  const source = readFileSync(
    new URL('../supabase/functions/generate-adaptive-plan/index.ts', import.meta.url),
    'utf8',
  );
  const extract = (name: string): unknown => {
    const match = source.match(new RegExp(`const ${name}: [^=]+= (\\{[\\s\\S]*?\\n\\});`));
    assert.ok(match, `could not find ${name} in the edge function`);
    return new Function(`return (${match[1]});`)();
  };
  assert.deepStrictEqual(extract('GOAL_MAP'), { ...GOAL_MAP });
  assert.deepStrictEqual(extract('SEQUENCES'), { ...SEQUENCES });
});
