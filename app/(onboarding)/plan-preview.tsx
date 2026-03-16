import { useEffect, useState, useMemo } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import Animated, { FadeIn, FadeInDown, useSharedValue, withRepeat, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { AppIcon } from '@/components/ui/AppIcon';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { PlanReasonCard } from '@/components/adaptive/PlanReasonCard';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useAuthStore } from '@/stores/authStore';
import { useDogStore } from '@/stores/dogStore';
import { getPlanTitle, getPlanBullets } from '@/lib/planGenerator';
import { formatDisplayTime } from '@/lib/scheduleEngine';
import { mapPlanRowToPlan } from '@/lib/modelMappers';
import { supabase } from '@/lib/supabase';
import { usePlanStore } from '@/stores/planStore';
import type { AdaptivePlanMetadata, Plan } from '@/types';

const LOADING_MESSAGES = [
  'Analyzing your dog\'s profile…',
  'Selecting the right exercises…',
  'Building your personalized plan…',
];

export default function PlanPreviewScreen() {
  const router = useRouter();
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const dogName = useOnboardingStore((s) => s.dogName);
  const primaryGoal = useOnboardingStore((s) => s.primaryGoal);
  const equipment = useOnboardingStore((s) => s.equipment);
  const availableMinutesPerDay = useOnboardingStore((s) => s.availableMinutesPerDay);
  const scheduleSummary = useOnboardingStore((s) => s.buildScheduleSummary());
  const user = useAuthStore((s) => s.user);
  const subscriptionTier = useAuthStore((s) => s.subscriptionTier);
  const existingActivePlan = usePlanStore((s) => s.activePlan);

  const [loading, setLoading] = useState(true);
  const [msgIndex, setMsgIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [createdPlan, setCreatedPlan] = useState<Plan | null>(null);

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

  useEffect(() => {
    // No user yet — waiting for account creation
    if (!user?.id) {
      setLoading(false);
      return;
    }
    // Plan was submitted in signup — show it
    if (existingActivePlan) {
      setCreatedPlan(existingActivePlan);
      setLoading(false);
      return;
    }
    // User exists but plan hasn't been created yet — try fetching from DB first,
    // then fall back to creating via submitOnboarding
    let cancelled = false;
    setLoading(true);
    const submit = async () => {
      try {
        // Ensure supabase client has a valid session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (!cancelled) setError('Session expired. Please log in again.');
          return;
        }

        // Verify the session user actually exists in the database
        // (catches stale JWTs from a DB reset)
        const { data: profileCheck, error: profileError } = await supabase
          .from('dogs')
          .select('id')
          .eq('owner_id', user.id)
          .limit(1);

        // If we get a non-RLS error, the user may be invalid
        // Try a simple auth check by refreshing the session
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.warn('[plan-preview] Session invalid, signing out:', refreshError.message);
          await supabase.auth.signOut();
          if (!cancelled) setError('Your session was invalid. Please sign up again.');
          return;
        }

        // Try fetching existing dog + plan first (may exist from a prior attempt)
        const { data: existingDog } = await supabase
          .from('dogs')
          .select('id')
          .eq('owner_id', user.id)
          .limit(1)
          .maybeSingle();

        if (existingDog?.id) {
          // Dog exists — check for plan
          const { data: existingPlanRow } = await supabase
            .from('plans')
            .select('*')
            .eq('dog_id', existingDog.id)
            .eq('status', 'active')
            .limit(1)
            .maybeSingle();

          if (existingPlanRow) {
            const plan = mapPlanRowToPlan(existingPlanRow);
            useDogStore.getState().setActivePlan(plan);
            usePlanStore.getState().setActivePlan(plan);
            useAuthStore.getState().setDogProfile({ id: existingDog.id, name: dogName });
            if (!cancelled) setCreatedPlan(plan);
            return;
          }
        }

        // No dog or plan found — create from scratch
        const submitOnboarding = useOnboardingStore.getState().submitOnboarding;
        const { dogId, dog, plan } = await submitOnboarding(user.id);
        if (cancelled) return;
        useDogStore.getState().setDog(dog);
        useDogStore.getState().setActivePlan(plan);
        usePlanStore.getState().setActivePlan(plan);
        useAuthStore.getState().setDogProfile({ id: dogId, name: dog.name });
        setCreatedPlan(plan);
      } catch (err) {
        console.error('[plan-preview] submitOnboarding failed:', err);
        if (!cancelled) {
          setError(
            `Something went wrong building your plan: ${err instanceof Error ? err.message : JSON.stringify(err)}`
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    submit();
    return () => { cancelled = true; };
  }, [user?.id, existingActivePlan]);

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
  const firstScheduledSession = useMemo(
    () => createdPlan?.sessions.find((session) => !session.isCompleted) ?? null,
    [createdPlan]
  );
  const explanationBullets = createdPlan?.metadata?.explanation ?? [];
  const adaptiveMetadata = createdPlan?.metadata as AdaptivePlanMetadata | undefined;
  const isAdaptivePlan = adaptiveMetadata?.plannerMode === 'adaptive_ai';
  const adaptiveSummary = adaptiveMetadata?.planningSummary;

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

          <Animated.View
            entering={FadeInDown.delay(540).duration(400)}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: spacing.lg,
              marginBottom: spacing.lg,
              borderWidth: 1,
              borderColor: colors.border.default,
            }}
          >
            <Text variant="body" style={{ fontWeight: '700', color: colors.textPrimary }}>
              Weekly rhythm
            </Text>
            <Text variant="body" style={{ color: colors.textSecondary, marginTop: spacing.xs }}>
              {scheduleSummary}
            </Text>
            {firstScheduledSession ? (
              <View
                style={{
                  marginTop: spacing.md,
                  padding: spacing.md,
                  borderRadius: 12,
                  backgroundColor: colors.bg.surfaceAlt,
                }}
              >
                <Text variant="micro" color={colors.text.secondary}>
                  First scheduled session
                </Text>
                <Text variant="bodyStrong" style={{ marginTop: 4 }}>
                  {firstScheduledSession.title}
                </Text>
                <Text variant="caption">
                  {firstScheduledSession.scheduledDay
                    ? `${firstScheduledSession.scheduledDay.slice(0, 3)}`
                    : `Week ${firstScheduledSession.weekNumber}`}
                  {firstScheduledSession.scheduledTime
                    ? ` at ${formatDisplayTime(firstScheduledSession.scheduledTime)}`
                    : ''}
                  {` · ${firstScheduledSession.durationMinutes} min`}
                </Text>
              </View>
            ) : null}
          </Animated.View>

          {explanationBullets.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(560).duration(400)}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: spacing.lg,
                marginBottom: spacing.xl,
                borderWidth: 1,
                borderColor: colors.border.default,
              }}
            >
              <Text variant="body" style={{ fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
                Why this schedule?
              </Text>
              {explanationBullets.map((bullet, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm }}>
                  <AppIcon name="sparkles" size={16} color={colors.brand.primary} />
                  <Text variant="body" style={{ flex: 1, color: colors.textSecondary }}>
                    {bullet}
                  </Text>
                </View>
              ))}
            </Animated.View>
          )}

          {/* Adaptive plan tailored message */}
          {isAdaptivePlan && adaptiveSummary && (
            <View style={{ marginBottom: spacing.lg }}>
              <PlanReasonCard
                dogName={dogName}
                summary={adaptiveSummary}
                profileCaption={[
                  adaptiveMetadata?.selectedSkillIds?.length
                    ? `${adaptiveMetadata.selectedSkillIds.length} skills`
                    : null,
                  scheduleSummary,
                ].filter(Boolean).join(' · ')}
                delay={570}
              />
            </View>
          )}
          {/* Fallback: show generic "tailored to" message for adaptive plan without full summary */}
          {isAdaptivePlan && !adaptiveSummary && (
            <Animated.View
              entering={FadeInDown.delay(570).duration(400)}
              style={{
                backgroundColor: `${colors.primary}08`,
                borderRadius: 16,
                padding: spacing.lg,
                marginBottom: spacing.lg,
                borderWidth: 1,
                borderColor: `${colors.primary}30`,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                <AppIcon name="sparkles" size={18} color={colors.primary} />
                <Text variant="body" style={{ fontWeight: '700', color: colors.primary, marginLeft: spacing.xs }}>
                  Built for {dogName}
                </Text>
              </View>
              <Text variant="body" style={{ color: colors.textSecondary }}>
                {"This plan was tailored to " + dogName + "'s age, environment, and current training goal."}
              </Text>
            </Animated.View>
          )}

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
          {!user ? (
            <>
              <Button label="Save my plan — Create account" onPress={() => router.push('/(auth)/signup?from=onboarding')} style={{ marginBottom: spacing.sm }} />
              <Text variant="caption" style={{ textAlign: 'center', color: colors.textSecondary }}>
                Your plan is ready. Create a free account to save it.
              </Text>
            </>
          ) : isPaid ? (
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
