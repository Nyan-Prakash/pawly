import assert from 'node:assert/strict';
import test from 'node:test';

import {
  annualSavingsPercent,
  canAccess,
  freeTrialLength,
  tierFromCustomerInfo,
} from '../lib/subscription.ts';

test('tier follows the pro entitlement', () => {
  assert.equal(tierFromCustomerInfo(null), 'free');
  assert.equal(tierFromCustomerInfo({ entitlements: { active: {} } }), 'free');
  assert.equal(tierFromCustomerInfo({ entitlements: { active: { other: {} } } }), 'free');
  assert.equal(tierFromCustomerInfo({ entitlements: { active: { pro: {} } } }), 'pro');
});

test('pro features are closed on free and open on pro', () => {
  assert.equal(canAccess('full_plan', 'free'), false);
  assert.equal(canAccess('coach_unlimited', 'free'), false);
  assert.equal(canAccess('full_plan', 'pro'), true);
});

test('annual savings is a whole percent against twelve months', () => {
  assert.equal(annualSavingsPercent(14.99, 89.99), 50);
  assert.equal(annualSavingsPercent(10, 120), null);
  assert.equal(annualSavingsPercent(10, 130), null);
  assert.equal(annualSavingsPercent(0, 89.99), null);
});

test('free trial length only for a zero-price intro offer', () => {
  assert.equal(freeTrialLength(null), null);
  assert.equal(freeTrialLength({ price: 0, periodUnit: 'DAY', periodNumberOfUnits: 7 }), '7-day');
  assert.equal(freeTrialLength({ price: 0, periodUnit: 'WEEK', periodNumberOfUnits: 1 }), '7-day');
  assert.equal(freeTrialLength({ price: 0, periodUnit: 'MONTH', periodNumberOfUnits: 1 }), '1-month');
  assert.equal(freeTrialLength({ price: 1.99, periodUnit: 'WEEK', periodNumberOfUnits: 1 }), null);
});
