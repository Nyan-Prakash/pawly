import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/colors';
import { IconButton } from '@/components/ui/IconButton';
import { useOnboardingStore } from '@/stores/onboardingStore';

const STEP_ROUTES = [
  '/(onboarding)/dog-basics',
  '/(onboarding)/dog-problem',
  '/(onboarding)/dog-environment',
  '/(onboarding)/video-upload',
  '/(onboarding)/plan-preview',
];

function OnboardingHeader() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const currentStep = useOnboardingStore((s) => s.currentStep);
  const prevStep = useOnboardingStore((s) => s.prevStep);

  const progress = useSharedValue(currentStep / 5);

  useEffect(() => {
    progress.value = withTiming(currentStep / 5, { duration: 300 });
  }, [currentStep, progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const showBack = currentStep >= 2 && currentStep <= 4;

  const handleBack = () => {
    prevStep();
    router.back();
  };

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: colors.bg.app }}>
      {/* Progress bar — 6px height */}
      <View style={{ height: 6, backgroundColor: colors.border.default }}>
        <Animated.View
          style={[barStyle, { height: 6, backgroundColor: colors.brand.primary, borderRadius: 3 }]}
        />
      </View>
      <View style={{ height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
        {showBack && (
          <IconButton
            icon={<Ionicons name="chevron-back" size={22} color={colors.text.primary} />}
            onPress={handleBack}
            variant="ghost"
            size={40}
          />
        )}
        <View style={{ flex: 1 }} />
      </View>
    </View>
  );
}

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.bg.app },
      }}
    >
      <Stack.Screen name="dog-basics" options={{ gestureEnabled: false }} />
      <Stack.Screen name="dog-problem" />
      <Stack.Screen name="dog-environment" />
      <Stack.Screen name="video-upload" />
      <Stack.Screen name="plan-preview" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
