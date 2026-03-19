import assert from 'node:assert/strict';
import test from 'node:test';

interface GateState {
  session: boolean;
  hasDogProfile: boolean;
  dogName: string;
  submissionIntent: string | null;
  segments: string[];
}

function getRedirect(state: GateState): string | 'none' {
  const { session, hasDogProfile, dogName, submissionIntent, segments } = state;

  const inAuthGroup = segments[0] === '(auth)';
  const inOnboardingGroup = segments[0] === '(onboarding)';
  const inTabsGroup = segments[0] === '(tabs)';

  if (!session) {
    if (inTabsGroup) return '/(auth)/welcome';
    return 'none';
  }

  if (!hasDogProfile) {
    if (!inOnboardingGroup && !inAuthGroup) {
      if (dogName) return '/(onboarding)/plan-preview';
      return '/(onboarding)/dog-basics';
    }
    return 'none';
  }

  if (!inTabsGroup && !inOnboardingGroup) {
    if (inAuthGroup && submissionIntent === 'onboarding') {
      return 'none';
    }
    return '/(tabs)/train';
  }

  return 'none';
}

test('redirect logic: unauthenticated user accessing tabs goes to welcome', () => {
  const res = getRedirect({ session: false, hasDogProfile: false, dogName: '', submissionIntent: null, segments: ['(tabs)', 'train'] });
  assert.equal(res, '/(auth)/welcome');
});

test('redirect logic: authenticated user without profile goes to dog-basics', () => {
  const res = getRedirect({ session: true, hasDogProfile: false, dogName: '', submissionIntent: null, segments: ['(auth)', 'login'] });
  // inAuthGroup is true, so it returns 'none' (allowing screen logic)
  assert.equal(res, 'none');

  const res2 = getRedirect({ session: true, hasDogProfile: false, dogName: '', submissionIntent: null, segments: ['some-other'] });
  assert.equal(res2, '/(onboarding)/dog-basics');
});

test('redirect logic: authenticated user with pending onboarding goes to plan-preview', () => {
  const res = getRedirect({ session: true, hasDogProfile: false, dogName: 'Rex', submissionIntent: 'onboarding', segments: ['some-other'] });
  assert.equal(res, '/(onboarding)/plan-preview');
});

test('redirect logic: authenticated user with profile goes to train', () => {
  const res = getRedirect({ session: true, hasDogProfile: true, dogName: 'Rex', submissionIntent: null, segments: ['(auth)', 'login'] });
  assert.equal(res, '/(tabs)/train');
});

test('redirect logic: onboarding signup user stays on signup until transition', () => {
  const res = getRedirect({ session: true, hasDogProfile: true, dogName: 'Rex', submissionIntent: 'onboarding', segments: ['(auth)', 'signup'] });
  // Crucial: should NOT redirect to train yet
  assert.equal(res, 'none');
});

test('redirect logic: returning user with old intent is NOT blocked (if not in auth group)', () => {
  // Even if submissionIntent was leaked/not cleared, if they are not in auth group it should redirect normally
  const res = getRedirect({ session: true, hasDogProfile: true, dogName: 'Rex', submissionIntent: 'onboarding', segments: ['some-random'] });
  assert.equal(res, '/(tabs)/train');
});

test('redirect logic: user already in tabs/onboarding does not get redirected', () => {
  assert.equal(getRedirect({ session: true, hasDogProfile: true, dogName: 'Rex', submissionIntent: null, segments: ['(tabs)'] }), 'none');
  assert.equal(getRedirect({ session: true, hasDogProfile: false, dogName: 'Rex', submissionIntent: null, segments: ['(onboarding)'] }), 'none');
});
