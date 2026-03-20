import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { shadows } from '@/constants/shadows';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/authStore';

type TabName = 'train' | 'progress' | 'coach' | 'know' | 'profile';

const tabConfig: Record<
  TabName,
  { label: string; iconActive: keyof typeof Ionicons.glyphMap; iconInactive: keyof typeof Ionicons.glyphMap }
> = {
  train:    { label: 'Train',    iconActive: 'paw',         iconInactive: 'paw-outline' },
  progress: { label: 'Progress', iconActive: 'stats-chart', iconInactive: 'stats-chart-outline' },
  coach:    { label: 'Coach',    iconActive: 'chatbubbles', iconInactive: 'chatbubbles-outline' },
  know:     { label: 'Know',     iconActive: 'library',     iconInactive: 'library-outline' },
  profile:  { label: 'Profile',  iconActive: 'person',      iconInactive: 'person-outline' },
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const currentRoute = state.routes[state.index]?.name as TabName | undefined;

  if (currentRoute === 'coach') {
    return null;
  }

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: Math.max(insets.bottom, 8) + 4,
        paddingTop: 8,
        paddingHorizontal: spacing.md,
        backgroundColor: 'transparent',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.bg.surface,
          borderWidth: 1,
          borderColor: colors.border.soft,
          borderRadius: radii.pill,
          padding: 5,
          ...shadows.float,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const name = route.name as TabName;
          const config = tabConfig[name] ?? {
            label: options.title ?? name,
            iconActive: 'ellipse' as const,
            iconInactive: 'ellipse-outline' as const,
          };

          function onPress() {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          }

          function onLongPress() {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
                borderRadius: radii.pill,
                backgroundColor: isFocused
                  ? isDark
                    ? 'rgba(74,222,128,0.18)'
                    : colors.status.successBg
                  : 'transparent',
                gap: 3,
              }}
            >
              <Ionicons
                name={isFocused ? config.iconActive : config.iconInactive}
                size={22}
                color={isFocused ? colors.brand.primary : colors.text.secondary}
              />
              <Text
                variant="micro"
                color={isFocused ? colors.brand.primary : colors.text.secondary}
                style={{ fontWeight: isFocused ? '700' : '500', fontSize: 10, lineHeight: 14 }}
              >
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const hasDogProfile = useAuthStore((s) => s.hasDogProfile);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  // Defense-in-depth guard: block access to tabs if the user is not
  // authenticated or has not completed onboarding. The root layout handles
  // the primary redirect, but this catches any edge cases (deep links,
  // hot-reload, stale navigation state) that bypass it.
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
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="train"    options={{ title: 'Train' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
      <Tabs.Screen name="coach"    options={{ title: 'Coach' }} />
      <Tabs.Screen name="know"     options={{ title: 'Know' }} />
      <Tabs.Screen name="profile"  options={{ title: 'Profile' }} />
    </Tabs>
  );
}
