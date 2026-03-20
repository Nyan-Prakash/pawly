import assert from 'node:assert/strict';
import test from 'node:test';
import { getRedirectTarget } from '../lib/routing.ts';

test('redirect logic: unauthenticated user accessing tabs goes to welcome', () => {
  const res = getRedirectTarget({
    session: false,
    isDataLoaded: true,
    hasDogProfile: false,
    hasActivePlan: false,
    dogName: '',
    submissionIntent: null,
    segments: ['(tabs)', 'train']
  });
  assert.equal(res, '/(auth)/welcome');
});

test('redirect logic: unauthenticated user on onboarding stays there', () => {
  const res = getRedirectTarget({
    session: false,
    isDataLoaded: true,
    hasDogProfile: false,
    hasActivePlan: false,
    dogName: '',
    submissionIntent: null,
    segments: ['(onboarding)', 'dog-basics']
  });
  assert.equal(res, 'none');
});

test('redirect logic: authenticated but data not loaded waits', () => {
  const res = getRedirectTarget({
    session: true,
    isDataLoaded: false,
    hasDogProfile: false,
    hasActivePlan: false,
    dogName: '',
    submissionIntent: null,
    segments: ['(auth)', 'login']
  });
  assert.equal(res, 'none');
});

test('redirect logic: authenticated user without profile goes to dog-basics', () => {
  const res = getRedirectTarget({
    session: true,
    isDataLoaded: true,
    hasDogProfile: false,
    hasActivePlan: false,
    dogName: '',
    submissionIntent: null,
    segments: ['some-other']
  });
  assert.equal(res, '/(onboarding)/dog-basics');
});

test('redirect logic: authenticated user with pending onboarding goes to plan-preview', () => {
  const res = getRedirectTarget({
    session: true,
    isDataLoaded: true,
    hasDogProfile: false,
    hasActivePlan: false,
    dogName: 'Rex',
    submissionIntent: 'onboarding',
    segments: ['some-other']
  });
  assert.equal(res, '/(onboarding)/plan-preview');
});

test('redirect logic: authenticated with profile but NO plan goes to plan-preview', () => {
  const res = getRedirectTarget({
    session: true,
    isDataLoaded: true,
    hasDogProfile: true,
    hasActivePlan: false,
    dogName: 'Rex',
    submissionIntent: null,
    segments: ['(tabs)', 'train']
  });
  assert.equal(res, '/(onboarding)/plan-preview');
});

test('redirect logic: authenticated with profile and plan goes to train', () => {
  const res = getRedirectTarget({
    session: true,
    isDataLoaded: true,
    hasDogProfile: true,
    hasActivePlan: true,
    dogName: 'Rex',
    submissionIntent: null,
    segments: ['(auth)', 'login']
  });
  assert.equal(res, '/(tabs)/train');
});

test('redirect logic: onboarding signup user stays on signup until transition', () => {
  const res = getRedirectTarget({
    session: true,
    isDataLoaded: true,
    hasDogProfile: true,
    hasActivePlan: true,
    dogName: 'Rex',
    submissionIntent: 'onboarding',
    segments: ['(auth)', 'signup']
  });
  // Crucial: should NOT redirect to train yet
  assert.equal(res, 'none');
});

test('redirect logic: user already in tabs/onboarding does not get redirected', () => {
  assert.equal(getRedirectTarget({
    session: true,
    isDataLoaded: true,
    hasDogProfile: true,
    hasActivePlan: true,
    dogName: 'Rex',
    submissionIntent: null,
    segments: ['(tabs)', 'train']
  }), 'none');

  assert.equal(getRedirectTarget({
    session: true,
    isDataLoaded: true,
    hasDogProfile: false,
    hasActivePlan: false,
    dogName: 'Rex',
    submissionIntent: null,
    segments: ['(onboarding)', 'dog-basics']
  }), 'none');
});
