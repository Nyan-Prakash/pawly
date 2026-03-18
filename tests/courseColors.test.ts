import test from 'node:test';
import assert from 'node:assert';
import {
  COURSE_COLOR_PALETTE,
  getContrastTextColor,
  getCourseColor,
  getCoursePillColors,
  getCourseUiColors,
  getGoalColor,
  hexToRgba,
  isValidHexColor,
  normalizeGoalKey,
} from '../constants/courseColors.ts';

test('course color utility: goal normalization', () => {
  assert.strictEqual(normalizeGoalKey('Leash Pulling'), 'leash_pulling');
  assert.strictEqual(normalizeGoalKey('Jumping Up'), 'jumping_up');
  assert.strictEqual(normalizeGoalKey("Won't Come"), 'recall');
  assert.strictEqual(normalizeGoalKey('Barking'), 'barking');
  assert.strictEqual(normalizeGoalKey('Unknown Goal'), 'fallback');
});

test('course color utility: getGoalColor returns stable hex codes', () => {
  const indigo = '#4F46E5';
  assert.strictEqual(getGoalColor('leash_pulling'), indigo);
  assert.strictEqual(getGoalColor('Leash Pulling'), indigo);

  const recall = '#15803D';
  assert.strictEqual(getGoalColor('recall'), recall);
  assert.strictEqual(getGoalColor("Won't Come"), recall);
});

test('course color utility: hexToRgba converts correctly', () => {
  // #4F46E5 -> r:79, g:70, b:229
  assert.strictEqual(hexToRgba('#4F46E5', 0.5), 'rgba(79, 70, 229, 0.5)');
  assert.strictEqual(hexToRgba('#000000', 1), 'rgba(0, 0, 0, 1)');
  assert.strictEqual(hexToRgba('#FFFFFF', 0), 'rgba(255, 255, 255, 0)');
});

test('course color utility: getCourseUiColors returns full set', () => {
  const colors = getCourseUiColors({ id: 'plan-123', goal: 'leash_pulling' });
  assert.ok(COURSE_COLOR_PALETTE.includes(colors.solid as (typeof COURSE_COLOR_PALETTE)[number]));
  assert.ok(colors.tint.startsWith('rgba('));
  assert.ok(colors.soft.startsWith('rgba('));
  assert.ok(colors.border.startsWith('rgba('));
  assert.strictEqual(colors.text, colors.solid);
  assert.ok(colors.contrastText === '#FFFFFF' || colors.contrastText === '#0F172A');
});

test('course color utility: deterministic assignment is stable for the same plan id', () => {
  const first = getCourseColor({ id: 'plan-alpha', goal: 'recall' });
  const second = getCourseColor({ id: 'plan-alpha', goal: 'barking' });

  assert.strictEqual(first, second);
  assert.ok(isValidHexColor(first));
});

test('course color utility: different plan ids can resolve to different colors', () => {
  const first = getCourseColor({ id: 'plan-alpha', goal: 'recall' });
  const second = getCourseColor({ id: 'plan-delta', goal: 'recall' });

  assert.notStrictEqual(first, second);
});

test('course color utility: missing identifier edge case still returns a safe color', () => {
  const color = getCourseColor({ goal: 'Unknown Goal', courseTitle: 'New Course' });
  assert.ok(isValidHexColor(color));
});

test('course color utility: pill tokens reflect selected and unselected course states', () => {
  const selected = getCoursePillColors({ id: 'plan-alpha', goal: 'recall' }, true);
  const unselected = getCoursePillColors({ id: 'plan-alpha', goal: 'recall' }, false);

  assert.strictEqual(selected.backgroundColor, selected.borderColor);
  assert.ok(selected.textColor === '#FFFFFF' || selected.textColor === '#0F172A');
  assert.strictEqual(unselected.backgroundColor, '#F5F7F9');
  assert.strictEqual(unselected.textColor, '#111827');
  assert.notStrictEqual(unselected.borderColor, '#F5F7F9');
});

test('course color utility: contrast helper stays deterministic', () => {
  assert.strictEqual(getContrastTextColor('#2563EB'), '#FFFFFF');
  assert.strictEqual(getContrastTextColor('#CA8A04'), '#0F172A');
  assert.strictEqual(getContrastTextColor('#FACC15'), '#0F172A');
});
