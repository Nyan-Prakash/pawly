import PostHog from 'posthog-react-native';

const API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
// US cloud by default; set EXPO_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com for an EU project.
const HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

/**
 * False until a real project key (`phc_`) is in `.env`; every call below is
 * then a no-op apart from the dev console log. A personal API key (`phx_`)
 * must never be bundled into the client.
 */
export const isAnalyticsAvailable = !!API_KEY && API_KEY.startsWith('phc_');
if (__DEV__ && API_KEY?.startsWith('phx_')) {
  console.error('[analytics] EXPO_PUBLIC_POSTHOG_API_KEY is a PERSONAL key. Rotate it and use the project key (phc_).');
}

type Properties = Record<string, any>;

export const posthog: PostHog | null =
  isAnalyticsAvailable && API_KEY
    ? new PostHog(API_KEY, {
        host: HOST,
        captureNativeAppLifecycleEvents: true,
      })
    : null;

posthog?.register({ app_env: __DEV__ ? 'development' : 'production' });

if (__DEV__) {
  // 'flush' fires only after PostHog accepted the batch, so this confirms delivery.
  posthog?.on('flush', (batch: unknown[]) => console.log(`[analytics] delivered ${batch.length} event(s)`));
  posthog?.on('error', (error: unknown) => console.warn('[analytics] send failed', error));
}

export function captureEvent(event: string, properties?: Record<string, unknown>) {
  if (__DEV__) {
    console.log(`[analytics] ${event}`, properties ?? {});
  }
  posthog?.capture(event, properties as Properties | undefined);
}

export function captureScreen(name: string, properties?: Record<string, unknown>) {
  posthog?.screen(name, properties as Properties | undefined);
}

/** Tie events to the Supabase user. Only the id is sent, never email or name. */
export function identifyUser(userId: string) {
  if (!posthog || posthog.getDistinctId() === userId) return;
  posthog.identify(userId);
}

/** The Profile toggle. PostHog remembers the choice on the device. */
export function isAnalyticsOptedOut(): boolean {
  return posthog?.optedOut ?? false;
}

export function setAnalyticsOptedOut(optedOut: boolean) {
  if (!posthog) return;
  // Record the choice itself before going quiet, so opt-out rates are visible.
  if (optedOut) posthog.capture('analytics_opted_out');
  (optedOut ? posthog.optOut() : posthog.optIn()).catch(() => {});
}

/** Call on sign-out so the next user on this device gets a fresh anonymous id. */
export function resetAnalytics() {
  posthog?.reset();
}
