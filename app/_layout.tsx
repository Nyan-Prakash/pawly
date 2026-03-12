import '../global.css';
import { useEffect, useMemo, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/constants/colors';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function RootNavigationGate() {
  const [session, setSession] = useState<Session | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const hasDogProfile = useAuthStore((state) => state.hasDogProfile);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const bootstrapSession = async () => {
      const {
        data: { session: initialSession }
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      setSession(initialSession);
      setIsBootstrapping(false);
    };

    bootstrapSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
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

  return <Slot />;
}

export default function RootLayout() {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
        <RootNavigationGate />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
