import '../global.css';
import { useEffect, useMemo, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Session } from '@supabase/supabase-js';
import * as Notifications from 'expo-notifications';

import { getRouteFromNotification, trackNotificationOpened } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/authStore';
import { useDogStore } from '@/stores/dogStore';
import { usePlanStore } from '@/stores/planStore';
import { colors } from '@/constants/colors';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function RootNavigationGate({ themeKey }: { themeKey: string }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isDogFetched, setIsDogFetched] = useState(false);
  const hasDogProfile = useAuthStore((state) => state.hasDogProfile);
  const segments = useSegments();
  const router = useRouter();
  const fetchDog = useDogStore((s) => s.fetchDog);
  const fetchDogLearningState = useDogStore((s) => s.fetchDogLearningState);
  const fetchActivePlan = usePlanStore((s) => s.fetchActivePlan);

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
      return;
    }

    // Authenticated user with no dog profile → send to onboarding
    // Skip redirect when in (auth) group — signup handles its own navigation after creating the dog profile
    if (!hasDogProfile) {
      if (!inOnboardingGroup && !inAuthGroup) {
        router.replace('/(onboarding)/dog-basics');
      }
      return;
    }

    // Authenticated user with dog profile → send to dashboard
    // Allow onboarding group so user can see plan-preview after signup
    if (!inTabsGroup && !inOnboardingGroup) {
      router.replace('/(tabs)/train');
    }
  }, [hasDogProfile, isBootstrapping, isDogFetched, router, segments, session]);

  if (isBootstrapping) {
    return <LoadingSpinner />;
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
