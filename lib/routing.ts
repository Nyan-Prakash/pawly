export interface RoutingState {
  session: boolean;
  isDataLoaded: boolean;
  hasDogProfile: boolean;
  hasActivePlan: boolean;
  dogName: string;
  submissionIntent: 'onboarding' | null;
  segments: string[];
}

export type RedirectTarget =
  | '/(auth)/welcome'
  | '/(onboarding)/plan-preview'
  | '/(onboarding)/dog-basics'
  | '/(tabs)/train'
  | 'none';

/**
 * Centralized routing decision logic for Pawly.
 * Decides where to redirect the user based on their auth and onboarding state.
 */
export function getRedirectTarget(state: RoutingState): RedirectTarget {
  const {
    session,
    isDataLoaded,
    hasDogProfile,
    hasActivePlan,
    dogName,
    submissionIntent,
    segments
  } = state;

  // Wait for dog + plan fetch to complete before routing
  // to avoid redirecting to onboarding due to stale profile/plan state
  if (session && !isDataLoaded) {
    return 'none';
  }

  const inAuthGroup = segments[0] === '(auth)';
  const inOnboardingGroup = segments[0] === '(onboarding)';
  const inTabsGroup = segments[0] === '(tabs)';

  if (!session) {
    // Unauthenticated users may browse onboarding freely before creating an account.
    // Only redirect to welcome if they try to access the tabs (protected) area.
    if (inTabsGroup) {
      return '/(auth)/welcome';
    }
    return 'none';
  }

  // --- Authenticated Routing Logic ---

  // Case 1: Authenticated but no dog profile yet
  if (!hasDogProfile) {
    // Allow them to be in (onboarding) or (auth) groups (auth handles its own nav after profile creation)
    if (!inOnboardingGroup && !inAuthGroup) {
      if (dogName) {
        return '/(onboarding)/plan-preview';
      } else {
        return '/(onboarding)/dog-basics';
      }
    }
    return 'none';
  }

  // Case 2: Authenticated with dog but no active plan (failed or skipped plan generation)
  if (!hasActivePlan) {
    // Must be forced to plan-preview to complete the setup
    const currentRoute = segments.length > 1 ? segments[1] : undefined;
    if (!inOnboardingGroup || (currentRoute !== 'plan-preview')) {
      // Only redirect if not already in (auth) or already on plan-preview
      if (!inAuthGroup) {
        return '/(onboarding)/plan-preview';
      }
    }
    return 'none';
  }

  // Case 3: Fully set up (Dog + Plan)
  if (!inTabsGroup && !inOnboardingGroup) {
    // Allow (auth) if onboarding just finished (submissionIntent logic)
    if (inAuthGroup && submissionIntent === 'onboarding') {
      return 'none';
    }
    return '/(tabs)/train';
  }

  return 'none';
}
