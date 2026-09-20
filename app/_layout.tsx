import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { Nunito_800ExtraBold, useFonts } from '@expo-google-fonts/nunito';
import { Slot, usePathname, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isAuthRetryableFetchError, type Session } from '@supabase/supabase-js';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';

import { handleAuthLink } from '@/lib/authLinks';
import { captureScreen, identifyUser, resetAnalytics } from '@/lib/analytics';
import { getRouteFromNotification, trackNotificationOpened } from '@/lib/notifications';
import { hydrateFromOfflineCache, startOfflineCache } from '@/lib/offlineCache';
import { registerQueryClient, resetUserState } from '@/lib/resetUserState';
import { captureError, initSentry, setSentryUser, wrapRootComponent } from '@/lib/sentry';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/authStore';
import { useDogStore } from '@/stores/dogStore';
import { usePlanStore } from '@/stores/planStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { navigationTheme } from '@/lib/navigationTheme';
import { Text } from '@/components/ui/Text';
import { MascotLoader } from '@/components/ui/MascotLoader';
import { PaywallSheet } from '@/components/paywall/PaywallSheet';
import { Button } from '@/components/ui/Button';

initSentry();

SplashScreen.preventAutoHideAsync().catch(() => {});

function PrepLoadingScreen({ message, subMessage }: { message: string; subMessage?: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg.app,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xxl,
        gap: spacing.lg,
      }}
    >
      <MascotLoader activity="wake" />
      <View style={{ alignItems: 'center', gap: spacing.xs }}>
        <Text variant="h2" style={{ textAlign: 'center' }}>
          {message}
        </Text>
        {subMessage ? (
          <Text variant="caption" style={{ textAlign: 'center' }}>
            {subMessage}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function RootNavigationGate({ themeKey }: { themeKey: string }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isDogFetched, setIsDogFetched] = useState(false);
  const [bootstrapFailed, setBootstrapFailed] = useState(false);
  const retryBootstrap = useRef<() => void>(() => {});
  const hasDogProfile = useAuthStore((state) => state.hasDogProfile);
  const isPasswordRecovery = useAuthStore((state) => state.isPasswordRecovery);
  const isSubmittingOnboarding = useOnboardingStore((s) => s.isSubmitting);
  const submissionIntent = useOnboardingStore((s) => s.submissionIntent);
  const dogName = useOnboardingStore((s) => s.dogName);
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const fetchDog = useDogStore((s) => s.fetchDog);
  const fetchDogLearningState = useDogStore((s) => s.fetchDogLearningState);
  const fetchActivePlan = usePlanStore((s) => s.fetchActivePlans);

  useEffect(() => {
    let mounted = true;

    const loadDogAndPlan = async (userId: string) => {
      try {
        await fetchDog(userId);
      } catch (error) {
        // No signal: fall back to what this phone last saw rather than failing the launch.
        if (!(await hydrateFromOfflineCache(userId))) throw error;
        useAuthStore.setState({ hasDogProfile: true });
        startOfflineCache(userId);
        return;
      }
      startOfflineCache(userId);
      const dog = useDogStore.getState().dog;
      useAuthStore.setState({ hasDogProfile: Boolean(dog?.id) });
      if (dog?.id) {
        fetchActivePlan(dog.id);
        fetchDogLearningState(dog.id).catch(() => {});
        // Tonight's streak reminder, without waiting for the next saved session.
        useNotificationStore.getState().syncStreakReminder(dog).catch(() => {});
      }
    };

    const bootstrapSession = async () => {
      let activeSession: Session | null = null;
      try {
        // Opened from a password reset or confirmation email: the link carries
        // the session, so consume it before reading the stored one.
        await handleAuthLink(await Linking.getInitialURL());

        const {
          data: { session: initialSession }
        } = await supabase.auth.getSession();
        activeSession = initialSession;

        if (!mounted) return;

        // Sync session into authStore so other screens can read user
        useAuthStore.setState({
          session: initialSession,
          user: initialSession?.user ?? null,
          isInitialized: true,
        });

        // Validate session is still valid (catches stale JWTs after DB reset).
        // A network failure is not a stale session: keep the user signed in and
        // let the client refresh the token once it is back online.
        if (initialSession) {
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError && !isAuthRetryableFetchError(refreshError)) {
            console.warn('[layout] Stale session detected, signing out:', refreshError.message);
            await supabase.auth.signOut({ scope: 'local' });
            activeSession = null;
            useAuthStore.setState({ session: null, user: null, isInitialized: true });
            return;
          }
        }

        // If user is logged in, fetch their dog & plan so Today screen has data
        if (initialSession?.user?.id) {
          await loadDogAndPlan(initialSession.user.id);
        }
      } catch (error) {
        // Signed in but the dog could not be loaded (offline, server error).
        // Routing on a guess would send an existing user back into onboarding.
        captureError(error, { where: 'bootstrapSession' });
        if (activeSession && mounted) setBootstrapFailed(true);
      } finally {
        if (mounted) {
          useAuthStore.setState({ isInitialized: true });
          setIsDogFetched(true);
          setSession(activeSession);
          setIsBootstrapping(false);
        }
      }
    };

    retryBootstrap.current = () => {
      setBootstrapFailed(false);
      setIsBootstrapping(true);
      bootstrapSession();
    };

    bootstrapSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      // The next account on this device must not see this one's dog or plan.
      if (event === 'SIGNED_OUT') {
        resetUserState();
        useAuthStore.setState({ isPasswordRecovery: false });
        setBootstrapFailed(false);
      }

      // Keep authStore in sync with session changes
      useAuthStore.setState({
        session: nextSession,
        user: nextSession?.user ?? null,
      });
      setSession(nextSession);

      // When a session arrives after email confirmation, the bootstrapSession
      // already ran without a user — fetch the dog now so hasDogProfile is set
      // and the routing gate can correctly route to plan-preview → submitOnboarding.
      if (nextSession?.user?.id && !useDogStore.getState().dog) {
        loadDogAndPlan(nextSession.user.id)
          .catch((error) => captureError(error, { where: 'authStateChange' }))
          .finally(() => setIsDogFetched(true));
      }
    });

    const linkSubscription = Linking.addEventListener('url', ({ url }) => {
      handleAuthLink(url).then((result) => {
        if (result === 'error') router.replace('/(auth)/reset-password');
      });
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, any> | undefined;
      trackNotificationOpened(typeof data?.type === 'string' ? data.type : undefined);
      router.push(getRouteFromNotification(data) as never);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      responseSubscription.remove();
      linkSubscription.remove();
    };
  }, [fetchActivePlan, fetchDog, fetchDogLearningState, router]);

  useEffect(() => {
    if (isBootstrapping || bootstrapFailed) {
      return;
    }

    // If authenticated, wait for dog fetch to complete before routing
    // to avoid redirecting to onboarding due to hasDogProfile being false initially
    if (session && !isDogFetched) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!session) {
      // Unauthenticated users may browse onboarding freely before creating an account.
      // Only redirect to welcome if they try to access the tabs (protected) area.
      if (inTabsGroup) {
        router.replace('/(auth)/welcome');
      }
      // Ensure stale intent is cleared when unauthenticated
      if (submissionIntent) {
        useOnboardingStore.setState({ submissionIntent: null });
      }
      return;
    }

    // Arrived from a reset email: hold on the new-password screen until it is saved.
    if (isPasswordRecovery) {
      if (segments[1] !== 'reset-password') router.replace('/(auth)/reset-password');
      return;
    }

    // Authenticated user with no dog profile → force to onboarding.
    //
    // Exception: if the user is in (auth) group AND there is an active
    // submissionIntent ('onboarding'), the signup screen is mid-flow and
    // will navigate itself — let it finish without interference.
    //
    // All other authenticated+no-dog cases (including plain signup with no
    // onboarding context) must be redirected to onboarding so the user
    // cannot end up in a broken state.
    if (!hasDogProfile) {
      const signupIsManagingOwnFlow = inAuthGroup && submissionIntent === 'onboarding';
      if (!inOnboardingGroup && !signupIsManagingOwnFlow) {
        // Resume at plan-preview if we already have onboarding data in store
        if (dogName) {
          router.replace('/(onboarding)/plan-preview');
        } else {
          router.replace('/(onboarding)/dog-basics');
        }
      }
      return;
    }

    // Authenticated user with dog profile → send to dashboard.
    // Allow onboarding group so the plan-preview screen remains reachable
    // after account creation (signup navigates there manually).
    if (!inTabsGroup && !inOnboardingGroup) {
      router.replace('/(tabs)/train');
    }
  }, [hasDogProfile, isPasswordRecovery, isBootstrapping, bootstrapFailed, isDogFetched, router, segments, session, dogName, submissionIntent]);

  useEffect(() => {
    if (!isBootstrapping) SplashScreen.hideAsync().catch(() => {});
  }, [isBootstrapping]);

  // Keep the RevenueCat user in step with the Supabase user. Never blocks routing.
  const userId = session?.user?.id;
  useEffect(() => {
    if (isBootstrapping) return;
    const { identify, reset } = useSubscriptionStore.getState();
    if (userId) identify(userId);
    else reset();
    setSentryUser(userId ?? null);
  }, [isBootstrapping, userId]);

  // Same for PostHog. Reset only on an actual sign-out, so an anonymous
  // visitor keeps one id through onboarding and is merged into it on signup.
  const identifiedUserId = useRef<string | null>(null);
  useEffect(() => {
    if (isBootstrapping) return;
    if (userId) {
      identifyUser(userId);
      identifiedUserId.current = userId;
    } else if (identifiedUserId.current) {
      resetAnalytics();
      identifiedUserId.current = null;
    }
  }, [isBootstrapping, userId]);

  // Screen views. The segments give the route pattern (`/session/[id]`), so
  // screens group together in PostHog instead of one entry per id.
  const screenName = `/${segments.filter((s) => !s.startsWith('(')).join('/')}`;
  useEffect(() => {
    if (isBootstrapping) return;
    captureScreen(screenName, { path: pathname });
  }, [isBootstrapping, screenName, pathname]);

  if (isBootstrapping || isSubmittingOnboarding) {
    if (isSubmittingOnboarding) {
      return (
        <PrepLoadingScreen
          message={`Building ${dogName}'s plan`}
          subMessage="This takes a few seconds."
        />
      );
    }
    return (
      <PrepLoadingScreen
        message="Loading your plan"
      />
    );
  }

  if (bootstrapFailed) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg.app,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.xxl,
          gap: spacing.lg,
        }}
      >
        <View style={{ alignItems: 'center', gap: spacing.xs }}>
          <Text variant="h2" style={{ textAlign: 'center' }}>
            Couldn't load your plan
          </Text>
          <Text variant="caption" style={{ textAlign: 'center' }}>
            Check your connection and try again. Your training history is safe.
          </Text>
        </View>
        <Button label="Try again" onPress={() => retryBootstrap.current()} />
      </View>
    );
  }

  return (
    <>
      <Slot key={themeKey} />
      <PaywallSheet />
    </>
  );
}

function RootLayout() {
  const queryClient = useMemo(() => {
    const client = new QueryClient();
    registerQueryClient(client);
    return client;
  }, []);
  const { colorScheme } = useTheme();
  const theme = useMemo(() => navigationTheme(colorScheme), [colorScheme]);
  // The heading face. If it fails to load, headings fall back to the system
  // font rather than blocking the app.
  const [fontsLoaded, fontError] = useFonts({ Nunito_800ExtraBold });

  if (!fontsLoaded && !fontError) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={theme}>
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg.app }}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <RootNavigationGate themeKey={colorScheme} />
        </GestureHandlerRootView>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default wrapRootComponent(RootLayout);

export { ErrorBoundary } from '@/components/RootErrorBoundary';
