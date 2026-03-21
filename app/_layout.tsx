import '../global.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Session } from '@supabase/supabase-js';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';

import { getRouteFromNotification, trackNotificationOpened } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/authStore';
import { useDogStore } from '@/stores/dogStore';
import { usePlanStore } from '@/stores/planStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { colors } from '@/constants/colors';
import { Text } from '@/components/ui/Text';
import { MascotCallout } from '@/components/ui/MascotCallout';

function BouncingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: -8,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(600),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay]);

  return (
    <Animated.View
      style={{
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: colors.brand.primary,
        marginHorizontal: 4,
        transform: [{ translateY: anim }],
      }}
    />
  );
}

function PrepLoadingScreen({ message, subMessage }: { message: string; subMessage?: string }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <LinearGradient
      colors={[colors.gradient.app[0], colors.gradient.app[1], colors.gradient.app[2]]}
      style={{ flex: 1 }}
    >
      <Animated.View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 40,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <MascotCallout state="thinking" size={110} style={{ marginBottom: 36 }} />

        <Text
          variant="h2"
          style={{ textAlign: 'center', fontWeight: '700', marginBottom: 8 }}
        >
          {message}
        </Text>

        {subMessage && (
          <Text
            variant="caption"
            style={{ textAlign: 'center', opacity: 0.65, marginBottom: 32 }}
          >
            {subMessage}
          </Text>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <BouncingDot delay={0} />
          <BouncingDot delay={150} />
          <BouncingDot delay={300} />
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

function RootNavigationGate({ themeKey }: { themeKey: string }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isDogFetched, setIsDogFetched] = useState(false);
  const hasDogProfile = useAuthStore((state) => state.hasDogProfile);
  const isSubmittingOnboarding = useOnboardingStore((s) => s.isSubmitting);
  const submissionIntent = useOnboardingStore((s) => s.submissionIntent);
  const dogName = useOnboardingStore((s) => s.dogName);
  const segments = useSegments();
  const router = useRouter();
  const fetchDog = useDogStore((s) => s.fetchDog);
  const fetchDogLearningState = useDogStore((s) => s.fetchDogLearningState);
  const fetchActivePlan = usePlanStore((s) => s.fetchActivePlans);

  useEffect(() => {
    let mounted = true;

    const bootstrapSession = async () => {
      const {
        data: { session: initialSession }
      } = await supabase.auth.getSession();

      if (!mounted) return;

      // Sync session into authStore so other screens can read user
      useAuthStore.setState({
        session: initialSession,
        user: initialSession?.user ?? null,
        isInitialized: true,
      });

      // Validate session is still valid (catches stale JWTs after DB reset)
      if (initialSession) {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.warn('[layout] Stale session detected, signing out:', refreshError.message);
          await supabase.auth.signOut();
          if (mounted) {
            useAuthStore.setState({ session: null, user: null, isInitialized: true });
            setSession(null);
            setIsBootstrapping(false);
          }
          return;
        }
      }

      // If user is logged in, fetch their dog & plan so Today screen has data
      if (initialSession?.user?.id) {
        await fetchDog(initialSession.user.id);
        const dog = useDogStore.getState().dog;
        useAuthStore.setState({ hasDogProfile: Boolean(dog?.id) });

        if (dog?.id) {
          fetchActivePlan(dog.id);
          fetchDogLearningState(dog.id).catch(() => {});
        }
      }

      if (mounted) setIsDogFetched(true);
      setSession(initialSession);
      setIsBootstrapping(false);
    };

    bootstrapSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
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
        fetchDog(nextSession.user.id).then(() => {
          const dog = useDogStore.getState().dog;
          useAuthStore.setState({ hasDogProfile: Boolean(dog?.id) });
          if (dog?.id) {
            fetchActivePlan(dog.id);
            fetchDogLearningState(dog.id).catch(() => {});
          }
          setIsDogFetched(true);
        }).catch(() => {
          setIsDogFetched(true);
        });
      }
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
    };
  }, [fetchActivePlan, fetchDog, fetchDogLearningState, router]);

  useEffect(() => {
    if (isBootstrapping) {
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
  }, [hasDogProfile, isBootstrapping, isDogFetched, router, segments, session, dogName, submissionIntent]);

  if (isBootstrapping || isSubmittingOnboarding) {
    if (isSubmittingOnboarding) {
      return (
        <PrepLoadingScreen
          message={`Building ${dogName}'s plan…`}
          subMessage="Crafting a training programme tailored just for them."
        />
      );
    }
    return (
      <PrepLoadingScreen
        message="Preparing things for you"
        subMessage="Just a moment while we get everything ready."
      />
    );
  }

  return <Slot key={themeKey} />;
}

export default function RootLayout() {
  const queryClient = useMemo(() => new QueryClient(), []);
  const { colorScheme } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg.app }}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <RootNavigationGate themeKey={colorScheme} />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
