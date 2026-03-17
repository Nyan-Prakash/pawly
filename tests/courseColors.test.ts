import test from 'node:test';
import assert from 'node:assert';
import { getGoalColor, normalizeGoalKey, hexToRgba, getCourseUiColors } from '../constants/courseColors.ts';

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

  const emerald = '#059669';
  assert.strictEqual(getGoalColor('recall'), emerald);
  assert.strictEqual(getGoalColor("Won't Come"), emerald);
});

test('course color utility: hexToRgba converts correctly', () => {
  // #4F46E5 -> r:79, g:70, b:229
  assert.strictEqual(hexToRgba('#4F46E5', 0.5), 'rgba(79, 70, 229, 0.5)');
  assert.strictEqual(hexToRgba('#000000', 1), 'rgba(0, 0, 0, 1)');
  assert.strictEqual(hexToRgba('#FFFFFF', 0), 'rgba(255, 255, 255, 0)');
});

test('course color utility: getCourseUiColors returns full set', () => {
  const colors = getCourseUiColors('leash_pulling');
  assert.strictEqual(colors.solid, '#4F46E5');
  assert.ok(colors.tint.includes('rgba(79, 70, 229, 0.08)'));
  assert.ok(colors.border.includes('rgba(79, 70, 229, 0.2)'));
  assert.strictEqual(colors.text, '#4F46E5');
});
