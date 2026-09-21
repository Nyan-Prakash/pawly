import * as Sentry from '@sentry/react-native';

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

/** False until a DSN is set; every call below is then a no-op. */
export const isSentryAvailable = !!DSN && DSN.startsWith('https://');

export function initSentry() {
  if (!isSentryAvailable) return;
  Sentry.init({
    dsn: DSN,
    enabled: !__DEV__,
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: 0.1,
    // Only the Supabase user id is attached, never email, IP or dog details.
    sendDefaultPii: false,
  });
}

export function setSentryUser(userId: string | null) {
  if (!isSentryAvailable) return;
  Sentry.setUser(userId ? { id: userId } : null);
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (__DEV__) console.warn('[sentry]', error, context ?? {});
  if (!isSentryAvailable) return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}

export const wrapRootComponent: <T extends React.ComponentType<any>>(component: T) => T = (component) =>
  isSentryAvailable ? (Sentry.wrap(component) as typeof component) : component;
