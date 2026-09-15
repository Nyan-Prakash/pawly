import test from 'node:test';
import assert from 'node:assert';
import { darkColors, lightColors, setColorScheme } from '../constants/colors.ts';
import {
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

test('course color utility: every goal resolves to the single accent', () => {
  setColorScheme('light');
  assert.strictEqual(getGoalColor('leash_pulling'), lightColors.accent);
  assert.strictEqual(getGoalColor("Won't Come"), lightColors.accent);
  assert.strictEqual(getCourseColor({ id: 'plan-alpha', goal: 'recall' }), lightColors.accent);
  assert.strictEqual(getCourseColor({ id: 'plan-delta', goal: 'barking' }), lightColors.accent);
  assert.ok(isValidHexColor(getCourseColor({ goal: 'Unknown Goal', courseTitle: 'New Course' })));
});

test('course color utility: follows the colour scheme', () => {
  setColorScheme('dark');
  assert.strictEqual(getGoalColor('recall'), darkColors.accent);
  assert.strictEqual(getContrastTextColor(darkColors.accent), darkColors.text.onAccent);
  setColorScheme('light');
  assert.strictEqual(getContrastTextColor(lightColors.accent), lightColors.text.onAccent);
});

test('course color utility: hexToRgba converts correctly', () => {
  assert.strictEqual(hexToRgba('#4F46E5', 0.5), 'rgba(79, 70, 229, 0.5)');
  assert.strictEqual(hexToRgba('#000000', 1), 'rgba(0, 0, 0, 1)');
  assert.strictEqual(hexToRgba('#FFFFFF', 0), 'rgba(255, 255, 255, 0)');
});

test('course color utility: getCourseUiColors returns the accent set', () => {
  setColorScheme('light');
  const ui = getCourseUiColors({ id: 'plan-123', goal: 'leash_pulling' });
  assert.strictEqual(ui.solid, lightColors.accent);
  assert.strictEqual(ui.text, lightColors.accent);
  assert.strictEqual(ui.tint, lightColors.accentSoft);
  assert.strictEqual(ui.selectedSurface, lightColors.accentSoft);
  assert.strictEqual(ui.contrastText, lightColors.text.onAccent);
});

test('course color utility: pill tokens reflect selected and unselected states', () => {
  setColorScheme('light');
  const selected = getCoursePillColors({ id: 'plan-alpha', goal: 'recall' }, true);
  const unselected = getCoursePillColors({ id: 'plan-alpha', goal: 'recall' }, false);

  assert.strictEqual(selected.backgroundColor, selected.borderColor);
  assert.strictEqual(selected.textColor, lightColors.text.onAccent);
  assert.strictEqual(unselected.backgroundColor, lightColors.bg.fill);
  assert.strictEqual(unselected.textColor, lightColors.text.primary);
});
