import { test } from 'node:test';
import assert from 'node:assert';
import { buildPlanPersonalizationLine } from '../lib/personalization/buildPlanPersonalizationLine.ts';

test('buildPlanPersonalizationLine maps goals correctly', () => {
  const line = buildPlanPersonalizationLine('Luna', 'leash_pulling');
  assert.strictEqual(line, 'Built for Luna based on leash pulling.');
});

test('buildPlanPersonalizationLine handles case-insensitive goals', () => {
  const line = buildPlanPersonalizationLine('Luna', 'Leash Pulling');
  assert.strictEqual(line, 'Built for Luna based on leash pulling.');
});

test('buildPlanPersonalizationLine maps training experience correctly', () => {
  const line = buildPlanPersonalizationLine('Luna', undefined, 'none');
  assert.strictEqual(line, 'Built for Luna based on beginner-level experience.');
});

test('buildPlanPersonalizationLine combines goal and experience', () => {
  const line = buildPlanPersonalizationLine('Max', 'barking', 'some');
  assert.strictEqual(line, 'Built for Max based on barking and some prior training experience.');
});

test('buildPlanPersonalizationLine handles experienced variant', () => {
  const line = buildPlanPersonalizationLine('Max', 'recall', 'experienced');
  assert.strictEqual(line, 'Built for Max based on recall and years of training experience.');
});

test('buildPlanPersonalizationLine handles missing data with fallback', () => {
  const line = buildPlanPersonalizationLine('Daisy');
  assert.strictEqual(line, 'Built for Daisy based on your onboarding answers.');
});

test('buildPlanPersonalizationLine handles missing dog name', () => {
  const line = buildPlanPersonalizationLine('', 'jumping_up');
  assert.strictEqual(line, 'Built for your dog based on jumping up.');
});

test('buildPlanPersonalizationLine handles won\'t come goal mapping', () => {
  const line = buildPlanPersonalizationLine('Buddy', "won't come");
  assert.strictEqual(line, 'Built for Buddy based on recall.');
});
