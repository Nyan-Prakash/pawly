import '../global.css';
import { useEffect, useMemo, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Session } from '@supabase/supabase-js';

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
  const hasDogProfile = useAuthStore((state) => state.hasDogProfile);
  const segments = useSegments();
  const router = useRouter();
  const fetchDog = useDogStore((s) => s.fetchDog);
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

      // If user is logged in, fetch their dog & plan so Today screen has data
      if (initialSession?.user?.id) {
        fetchDog(initialSession.user.id).then(() => {
          const dog = useDogStore.getState().dog;
          useAuthStore.setState({ hasDogProfile: Boolean(dog?.id) });

          if (dog?.id) {
            fetchActivePlan(dog.id);
          }
        });
      }

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

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!session) {
      if (!inAuthGroup) {
        router.replace('/(auth)/welcome');
      }
      return;
    }

    if (!hasDogProfile) {
      if (!inOnboardingGroup) {
        router.replace('/(onboarding)/dog-basics');
      }
      return;
    }

    if (!inTabsGroup) {
      router.replace('/(tabs)/train');
    }
  }, [hasDogProfile, isBootstrapping, router, segments, session]);

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
