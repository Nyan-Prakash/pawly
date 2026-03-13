import { useEffect, useState, useRef, useCallback } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import Animated, { FadeIn, FadeInDown, useSharedValue, withRepeat, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { AppIcon } from '@/components/ui/AppIcon';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useDogStore } from '@/stores/dogStore';
import { useAuthStore } from '@/stores/authStore';
import { getPlanTitle, getPlanBullets } from '@/lib/planGenerator';

const LOADING_MESSAGES = [
  'Analyzing your dog\'s profile…',
  'Selecting the right exercises…',
  'Building your personalized plan…',
];

export default function PlanPreviewScreen() {
  const router = useRouter();
  const submitOnboarding = useOnboardingStore((s) => s.submitOnboarding);
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const dogName = useOnboardingStore((s) => s.dogName);
  const primaryGoal = useOnboardingStore((s) => s.primaryGoal);
  const equipment = useOnboardingStore((s) => s.equipment);
  const availableMinutesPerDay = useOnboardingStore((s) => s.availableMinutesPerDay);
  const setDog = useDogStore((s) => s.setDog);
  const setActivePlan = useDogStore((s) => s.setActivePlan);
  const setDogProfile = useAuthStore((s) => s.setDogProfile);
  const user = useAuthStore((s) => s.user);
  const subscriptionTier = useAuthStore((s) => s.subscriptionTier);

  const [loading, setLoading] = useState(true);
  const [msgIndex, setMsgIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dogId, setDogId] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);

  const opacity = useSharedValue(1);
  const logoScale = useSharedValue(1);

  const logoStyle = useAnimatedStyle(() => ({ transform: [{ scale: logoScale.value }] }));
  const msgStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  useEffect(() => {
    logoScale.value = withRepeat(withTiming(1.05, { duration: 900 }), -1, true);
  }, [logoScale]);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      opacity.value = withTiming(0, { duration: 200 }, () => {
        opacity.value = withTiming(1, { duration: 200 });
      });
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [loading, opacity]);

  // Capture these in refs so the one-time effect doesn't need them as deps
  const submitRef = useRef(submitOnboarding);
  const dogNameRef = useRef(dogName);
  const setDogProfileRef = useRef(setDogProfile);
  submitRef.current = submitOnboarding;
  dogNameRef.current = dogName;
  setDogProfileRef.current = setDogProfile;

  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (!user?.id) return;
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;

    const userId = user.id;
    const startTime = Date.now();

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), 15000)
    );

    Promise.race([submitRef.current(userId), timeout])
      .then(({ dogId: dId, planId: pId }) => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 2500 - elapsed);
        setTimeout(() => {
          setDogId(dId);
          setPlanId(pId);
          setDogProfileRef.current({ id: dId, name: dogNameRef.current });
          setLoading(false);
        }, remaining);
      })
      .catch((err) => {
        console.error('submitOnboarding failed:', err);
        hasSubmitted.current = false; // allow retry
        setError(
          err?.message === 'Request timed out'
            ? 'This is taking too long. Check your connection and try again.'
            : 'Something went wrong building your plan. Please try again.'
        );
        setLoading(false);
      });
  }, [user?.id]);

  const handleStart = () => {
    resetOnboarding();
    router.replace('/(tabs)/train');
  };

  const handleUnlock = () => {
    router.push('/(tabs)/profile');
  };

  const isPaid = subscriptionTier !== 'free';
  const planTitle = getPlanTitle(dogName, primaryGoal);
  const bullets = getPlanBullets(primaryGoal);

  if (loading) {
    return (
      <SafeScreen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
          <Animated.View style={logoStyle}>
            <AppIcon name="paw" size={72} color={colors.primary} />
          </Animated.View>
          <Animated.View style={[msgStyle, { marginTop: spacing.xl }]}>
            <Text variant="body" style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 16 }}>
              {LOADING_MESSAGES[msgIndex]}
            </Text>
          </Animated.View>
        </View>
      </SafeScreen>
    );
  }

  if (error) {
    return (
      <SafeScreen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
          <View style={{ marginBottom: spacing.lg }}>
            <AppIcon name="help-circle" size={48} color={colors.textSecondary} />
          </View>
          <Text variant="body" style={{ textAlign: 'center', color: colors.textSecondary, marginBottom: spacing.xl }}>
            {error}
          </Text>
          <Button label="Try again" onPress={() => router.replace('/(onboarding)/dog-basics')} />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <Animated.View entering={FadeIn.duration(400)} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 120 }}>
          {/* Dog avatar */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ alignItems: 'center', marginBottom: spacing.xl }}>
            <View style={{
              width: 100, height: 100, borderRadius: 50,
              backgroundColor: `${colors.primary}20`,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 3, borderColor: colors.primary,
              marginBottom: spacing.md,
            }}>
              <AppIcon name="paw" size={52} color={colors.primary} />
            </View>
            <Text variant="title" style={{ color: colors.textPrimary, textAlign: 'center' }}>
              {dogName}
            </Text>
          </Animated.View>

          {/* Behavior badge */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ alignItems: 'center', marginBottom: spacing.lg }}>
            <View style={{
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.xs,
              backgroundColor: `${colors.primary}15`,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.primary,
            }}>
              <Text variant="caption" style={{ color: colors.primary, fontWeight: '700' }}>
                {primaryGoal} · Stage 1
              </Text>
            </View>
          </Animated.View>

          {/* Plan title */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ marginBottom: spacing.xl }}>
            <Text variant="title" style={{ textAlign: 'center', color: colors.textPrimary }}>
              {planTitle}
            </Text>
          </Animated.View>

          {/* Bullets */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: spacing.lg,
            marginBottom: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border.default,
          }}>
            <Text variant="body" style={{ fontWeight: '700', marginBottom: spacing.md, color: colors.textPrimary }}>
              {"What you'll work on:"}
            </Text>
            {bullets.map((b, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm }}>
                <AppIcon name="checkmark-circle" size={16} color={colors.primary} />
                <Text variant="body" style={{ flex: 1, color: colors.textSecondary }}>{b}</Text>
              </View>
            ))}
          </Animated.View>

          {/* Equipment & session stat */}
          <Animated.View entering={FadeInDown.delay(500).duration(400)} style={{ marginBottom: spacing.xl }}>
            {equipment.length > 0 && (
              <View style={{ marginBottom: spacing.md }}>
                <Text variant="body" style={{ fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs }}>
                  {"What you'll need:"}
                </Text>
                <Text variant="body" style={{ color: colors.textSecondary }}>
                  {equipment.join(', ')}
                </Text>
              </View>
            )}
            <View style={{
              flexDirection: 'row',
              backgroundColor: `${colors.success}15`,
              borderRadius: 12,
              padding: spacing.md,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: `${colors.success}40`,
            }}>
              <AppIcon name="flash" size={20} color={colors.success} />
              <Text variant="body" style={{ color: colors.success, fontWeight: '600' }}>
                First session: {availableMinutesPerDay} minutes
              </Text>
            </View>
          </Animated.View>

          {/* Paywall gate for free users */}
          {!isPaid && (
            <Animated.View entering={FadeInDown.delay(600).duration(400)} style={{
              borderRadius: 16,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: colors.border.default,
              marginBottom: spacing.xl,
            }}>
              <View style={{ padding: spacing.lg, backgroundColor: colors.secondary }}>
                <Text variant="body" style={{ fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs }}>
                  Full plan preview
                </Text>
                {[1, 2, 3].map((w) => (
                  <View key={w} style={{
                    height: 48,
                    backgroundColor: colors.border.default,
                    borderRadius: 8,
                    marginBottom: spacing.xs,
                    opacity: 0.5,
                  }} />
                ))}
              </View>
              <View style={{ backgroundColor: `${colors.primary}08`, padding: spacing.lg, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border.default }}>
                <View style={{ marginBottom: spacing.sm }}>
                  <AppIcon name="lock-closed" size={24} color={colors.primary} />
                </View>
                <Text variant="body" style={{ fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.xs }}>
                  Unlock your full plan
                </Text>
                <Text variant="caption" style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md }}>
                  Get all 4 weeks, session-by-session guidance, and progress tracking.
                </Text>
              </View>
            </Animated.View>
          )}
        </ScrollView>

        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: spacing.xl,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border.default,
        }}>
          {isPaid ? (
            <Button label="Start my first session →" onPress={handleStart} />
          ) : (
            <>
              <Button label="Unlock plan →" onPress={handleUnlock} />
              <Pressable onPress={handleStart} style={{ alignItems: 'center', paddingTop: spacing.sm }}>
                <Text variant="caption" style={{ color: colors.textSecondary }}>Continue with free plan</Text>
              </Pressable>
            </>
          )}
        </View>
      </Animated.View>
    </SafeScreen>
  );
}
