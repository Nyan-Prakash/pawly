import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { BottomTabBar } from '@react-navigation/bottom-tabs';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { typography } from '@/constants/typography';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/authStore';

type TabName = 'train' | 'progress' | 'coach' | 'know' | 'profile';

const tabConfig: Record<TabName, { label: string; active: AppIconName; inactive: AppIconName }> = {
  train:    { label: 'Train',    active: 'paw',         inactive: 'paw-outline' },
  progress: { label: 'Progress', active: 'stats-chart', inactive: 'stats-chart-outline' },
  coach:    { label: 'Coach',    active: 'chatbubbles', inactive: 'chatbubbles-outline' },
  know:     { label: 'Learn',    active: 'book',        inactive: 'book-outline' },
  profile:  { label: 'Profile',  active: 'person',      inactive: 'person-outline' },
};

/** The platform tab bar, tinted with the accent. Nothing custom. */
export default function TabsLayout() {
  const router = useRouter();
  const { colors } = useTheme();
  const session = useAuthStore((s) => s.session);
  const hasDogProfile = useAuthStore((s) => s.hasDogProfile);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  // Defense-in-depth guard: the root layout handles the primary redirect;
  // this catches deep links and stale navigation state.
  useEffect(() => {
    if (!isInitialized) return;
    if (!session) {
      router.replace('/(auth)/welcome');
      return;
    }
    if (!hasDogProfile) {
      router.replace('/(onboarding)/dog-basics');
    }
  }, [isInitialized, session, hasDogProfile, router]);

  return (
    <Tabs
      // Still the platform tab bar. The offline line rides on top of it, in the
      // layout, so it shows on every tab without covering the bar or a header.
      tabBar={(props) => (
        <>
          <OfflineBanner />
          <BottomTabBar {...props} />
        </>
      )}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: { backgroundColor: colors.bg.surface, borderTopColor: colors.border.hairline },
        tabBarLabelStyle: { fontSize: typography.label.fontSize, fontWeight: typography.label.fontWeight },
      }}
    >
      {(Object.keys(tabConfig) as TabName[]).map((name) => {
        const config = tabConfig[name];
        return (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title: config.label,
              tabBarIcon: ({ focused, color }) => (
                <AppIcon name={focused ? config.active : config.inactive} size={24} color={color} />
              ),
            }}
          />
        );
      })}
    </Tabs>
  );
}
