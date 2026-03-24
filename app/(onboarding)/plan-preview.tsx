import { useEffect, useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { AppIcon } from '@/components/ui/AppIcon';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { PlanReasonCard } from '@/components/adaptive/PlanReasonCard';
import { PlanPersonalizationBadge } from '@/components/shared/PlanPersonalizationBadge';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radii } from '@/constants/radii';
import { shadows } from '@/constants/shadows';
import { hexToRgba } from '@/constants/courseColors';
import { captureEvent } from '@/lib/analytics';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useAuthStore } from '@/stores/authStore';
import { useDogStore } from '@/stores/dogStore';
import { getPlanTitle, getPlanBullets } from '@/lib/planGenerator';
import { formatDisplayTime, getBehaviorLabel } from '@/lib/scheduleEngine';
import { mapPlanRowToPlan } from '@/lib/modelMappers';
import { supabase } from '@/lib/supabase';
import { usePlanStore } from '@/stores/planStore';
import type { AdaptivePlanMetadata, Plan } from '@/types';

const LOADING_MESSAGES = [
  "Analyzing your dog's profile…",
  'Selecting the right exercises…',
  'Building your personalized plan…',
];

export default function PlanPreviewScreen() {
  const router = useRouter();
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const dogName = useOnboardingStore((s) => s.dogName);
  const primaryGoal = useOnboardingStore((s) => s.primaryGoal);
  const trainingExperience = useOnboardingStore((s) => s.trainingExperience);
  const equipment = useOnboardingStore((s) => s.equipment);
  const availableMinutesPerDay = useOnboardingStore((s) => s.availableMinutesPerDay);
  const secondaryGoals = useOnboardingStore((s) => s.secondaryGoals);
  const scheduleSummary = useOnboardingStore((s) => s.buildScheduleSummary());
  const isSubmittingOnboarding = useOnboardingStore((s) => s.isSubmitting);
  const setOnboardingField = useOnboardingStore((s) => s.setField);
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
    logoScale.value = withRepeat(withTiming(1.1, { duration: 1100 }), -1, true);
  }, [logoScale]);

  useEffect(() => {
    if (!loading) {
      captureEvent('plan_personalization_line_shown', {
        surface: 'plan_preview',
        dogName,
        primaryGoal,
        trainingExperience,
      });
    }
  }, [loading, dogName, primaryGoal, trainingExperience]);

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
    if (!user?.id) { setLoading(false); return; }
    if (existingActivePlan) { setCreatedPlan(existingActivePlan); setLoading(false); return; }
    if (isSubmittingOnboarding) { setLoading(true); return; }

    let cancelled = false;
    setLoading(true);

    const submit = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { if (!cancelled) setError('Session expired. Please log in again.'); return; }

        await supabase.from('dogs').select('id').eq('owner_id', user.id).limit(1);

        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.warn('[plan-preview] Session invalid, signing out:', refreshError.message);
          await supabase.auth.signOut();
          if (!cancelled) setError('Your session was invalid. Please sign up again.');
          return;
        }

        const { data: existingDog } = await supabase
          .from('dogs').select('id').eq('owner_id', user.id).limit(1).maybeSingle();

        if (existingDog?.id) {
          const { data: existingDogRow } = await supabase
            .from('dogs').select('*').eq('id', existingDog.id).single();
          if (existingDogRow) {
            const { mapDogRowToDog } = await import('@/lib/modelMappers');
            useDogStore.getState().setDog(mapDogRowToDog(existingDogRow));
          }

          const { data: existingPlanRow } = await supabase
            .from('plans').select('*').eq('dog_id', existingDog.id).eq('status', 'active').limit(1).maybeSingle();
          if (existingPlanRow) {
            const plan = mapPlanRowToPlan(existingPlanRow);
            useDogStore.getState().setActivePlan(plan);
            usePlanStore.getState().setActivePlan(plan);
            useAuthStore.getState().setDogProfile({ id: existingDog.id, name: dogName });
            if (!cancelled) setCreatedPlan(plan);
            return;
          }
        }

        const submitOnboarding = useOnboardingStore.getState().submitOnboarding;
        setOnboardingField('submissionIntent', 'onboarding');
        const { dogId, dog, plan } = await submitOnboarding(user.id);
        if (cancelled) return;
        useDogStore.getState().setDog(dog);
        useDogStore.getState().setActivePlan(plan);
        usePlanStore.getState().setActivePlan(plan);
        useAuthStore.getState().setDogProfile({ id: dogId, name: dog.name });
        setCreatedPlan(plan);
      } catch (err) {
        console.error('[plan-preview] submitOnboarding failed:', err);
        if (!cancelled)
          setError(`Something went wrong: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    submit();
    return () => { cancelled = true; };
  }, [user?.id, existingActivePlan]);

  const handleStart = () => {
    setOnboardingField('submissionIntent', null);
    resetOnboarding();
    router.replace('/(tabs)/train');
  };
  const handleUnlock = () => router.push('/(tabs)/profile');

  const isPaid = subscriptionTier !== 'free';
  const planTitle = getPlanTitle(dogName, primaryGoal);
  const bullets = getPlanBullets(primaryGoal);
  const goalLabel = getBehaviorLabel(primaryGoal);

  const firstScheduledSession = useMemo(
    () => createdPlan?.sessions.find((s) => !s.isCompleted) ?? null,
    [createdPlan]
  );
  const explanationBullets = createdPlan?.metadata?.explanation ?? [];
  const adaptiveMetadata = createdPlan?.metadata as AdaptivePlanMetadata | undefined;
  const isAdaptivePlan = adaptiveMetadata?.plannerMode === 'adaptive_ai';
  const adaptiveSummary = adaptiveMetadata?.planningSummary;

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeScreen>
        <LinearGradient
          colors={[hexToRgba(colors.brand.primary, 0.1), colors.bg.app]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.7 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          pointerEvents="none"
        />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl }}>
          <Animated.View
            style={[
              logoStyle,
              {
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: hexToRgba(colors.brand.primary, 0.12),
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.xl,
              },
            ]}
          >
            <AppIcon name="paw" size={44} color={colors.brand.primary} />
          </Animated.View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text.primary, letterSpacing: -0.4, marginBottom: spacing.sm }}>
            Building your plan…
          </Text>
          <Animated.View style={msgStyle}>
            <Text style={{ fontSize: 15, color: colors.text.secondary, textAlign: 'center', lineHeight: 22 }}>
              {LOADING_MESSAGES[msgIndex]}
            </Text>
          </Animated.View>
        </View>
      </SafeScreen>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <SafeScreen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl }}>
          <AppIcon name="help-circle" size={40} color={colors.text.secondary} />
          <Text style={{ textAlign: 'center', color: colors.text.secondary, marginTop: spacing.md, marginBottom: spacing.xl, lineHeight: 22 }}>
            {error}
          </Text>
          <Button label="Try again" onPress={() => router.replace('/(onboarding)/dog-basics')} />
        </View>
      </SafeScreen>
    );
  }

  // ─── Main ──────────────────────────────────────────────────────────────────
  return (
    <SafeScreen>
      <Animated.View entering={FadeIn.duration(500)} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >

          {/* ══════════════════════════════════════════════════════
              HERO — calm, focused, uncluttered
          ══════════════════════════════════════════════════════ */}
          <LinearGradient
            colors={[colors.brand.primary, '#16A34A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingTop: spacing.xl + spacing.lg, paddingBottom: spacing.xxl, paddingHorizontal: spacing.lg }}
          >
            {/* Course chip — small, quiet */}
            <Animated.View entering={FadeInDown.delay(60).duration(350)}>
              <View style={{
                flexDirection: 'row',
                alignSelf: 'flex-start',
                backgroundColor: 'rgba(255,255,255,0.2)',
                paddingHorizontal: spacing.md,
                paddingVertical: 5,
                borderRadius: radii.pill,
                marginBottom: spacing.md,
              }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.95)', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                  {goalLabel} · Stage 1
                </Text>
              </View>
            </Animated.View>

            {/* Dog name — the hero moment */}
            <Animated.View entering={FadeInDown.delay(120).duration(350)}>
              <Text style={{ fontSize: 40, fontWeight: '800', color: '#fff', letterSpacing: -1.5, lineHeight: 46, marginBottom: spacing.xs }}>
                {dogName}'s plan
              </Text>
            </Animated.View>

            {/* Personalization Line */}
            <PlanPersonalizationBadge
              dogName={dogName}
              primaryGoal={primaryGoal}
              trainingExperience={trainingExperience}
              variant="preview"
            />

            {/* Plan subtitle — one line, secondary */}
            <Animated.View entering={FadeInDown.delay(180).duration(350)}>
              <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 24, marginBottom: spacing.xl }}>
                {planTitle}
              </Text>
            </Animated.View>

            {/* 3 stats — clean row */}
            <Animated.View entering={FadeInDown.delay(240).duration(350)}>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {[
                  { label: 'Duration', value: '4 weeks' },
                  { label: 'Per session', value: `${availableMinutesPerDay} min` },
                  { label: 'Sessions/wk', value: '3–5 days' },
                ].map((stat, i) => (
                  <View
                    key={i}
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      borderRadius: radii.md,
                      padding: spacing.sm + 2,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.5 }}>
                      {stat.value}
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginTop: 3 }}>
                      {stat.label}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          </LinearGradient>

          {/* ══════════════════════════════════════════════════════
              CONTENT — cards float below hero
          ══════════════════════════════════════════════════════ */}
          <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md, gap: spacing.sm }}>

            {/* ── WHAT YOU'LL WORK ON ── */}
            <Animated.View
              entering={FadeInDown.delay(300).duration(380)}
              style={{
                backgroundColor: colors.bg.surface,
                borderRadius: radii.lg,
                padding: spacing.lg,
                borderWidth: 1,
                borderColor: colors.border.soft,
                ...shadows.card,
              }}
            >
              <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text.primary, marginBottom: spacing.md }}>
                What you'll work on
              </Text>
              <View style={{ gap: spacing.md }}>
                {bullets.map((b, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.brand.primary, marginTop: 9, flexShrink: 0 }} />
                    <Text style={{ flex: 1, fontSize: 17, color: colors.text.primary, lineHeight: 26 }}>
                      {b}
                    </Text>
                  </View>
                ))}
              </View>

              {equipment.length > 0 && (
                <View style={{ marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border.soft }}>
                  <Text style={{ fontSize: 15, color: colors.text.primary, lineHeight: 22 }}>
                    <Text style={{ fontWeight: '700' }}>You'll need: </Text>
                    {equipment.join(', ')}
                  </Text>
                </View>
              )}
            </Animated.View>

            {/* ── YOUR SCHEDULE ── */}
            <Animated.View
              entering={FadeInDown.delay(360).duration(380)}
              style={{
                backgroundColor: colors.bg.surface,
                borderRadius: radii.lg,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: colors.border.soft,
                ...shadows.card,
              }}
            >
              {/* Amber accent bar */}
              <View style={{ height: 4, backgroundColor: colors.brand.secondary }} />

              <View style={{ padding: spacing.lg }}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text.primary, marginBottom: spacing.sm }}>
                  Your schedule
                </Text>
                <Text style={{ fontSize: 17, color: colors.text.primary, lineHeight: 26 }}>
                  {scheduleSummary}
                </Text>

                {firstScheduledSession && (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    marginTop: spacing.md,
                    paddingTop: spacing.md,
                    borderTopWidth: 1,
                    borderTopColor: colors.border.soft,
                  }}>
                    <View style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      backgroundColor: hexToRgba(colors.brand.secondary, 0.12),
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <AppIcon name="play" size={16} color={colors.brand.secondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>
                        First session
                      </Text>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary }} numberOfLines={1}>
                        {firstScheduledSession.title}
                      </Text>
                      <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 2 }}>
                        {firstScheduledSession.scheduledDay
                          ? firstScheduledSession.scheduledDay.slice(0, 3)
                          : `Week ${firstScheduledSession.weekNumber}`}
                        {firstScheduledSession.scheduledTime
                          ? ` at ${formatDisplayTime(firstScheduledSession.scheduledTime)}`
                          : ''}
                        {` · ${firstScheduledSession.durationMinutes} min`}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </Animated.View>

            {/* ── WHY THIS PLAN (AI explanation) ── */}
            {explanationBullets.length > 0 && (
              <Animated.View
                entering={FadeInDown.delay(420).duration(380)}
                style={{
                  backgroundColor: colors.bg.surface,
                  borderRadius: radii.lg,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: colors.border.soft,
                  ...shadows.card,
                }}
              >
                <View style={{ height: 4, backgroundColor: colors.brand.coach }} />
                <View style={{ padding: spacing.lg }}>
                  <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text.primary, marginBottom: spacing.md }}>
                    Why this plan?
                  </Text>
                  <View style={{ gap: spacing.md }}>
                    {explanationBullets.map((bullet, i) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
                        <View style={{ marginTop: 4 }}><AppIcon name="sparkles" size={15} color={colors.brand.coach} /></View>
                        <Text style={{ flex: 1, fontSize: 17, color: colors.text.primary, lineHeight: 26 }}>
                          {bullet}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </Animated.View>
            )}

            {/* ── ADAPTIVE SUMMARY ── */}
            {isAdaptivePlan && adaptiveSummary && (
              <Animated.View entering={FadeInDown.delay(460).duration(380)}>
                <PlanReasonCard
                  dogName={dogName}
                  summary={adaptiveSummary}
                  profileCaption={[
                    adaptiveMetadata?.selectedSkillIds?.length
                      ? `${adaptiveMetadata.selectedSkillIds.length} skills`
                      : null,
                    scheduleSummary,
                  ].filter(Boolean).join(' · ')}
                  delay={0}
                />
              </Animated.View>
            )}

            {isAdaptivePlan && !adaptiveSummary && (
              <Animated.View
                entering={FadeInDown.delay(460).duration(380)}
                style={{
                  backgroundColor: colors.bg.surface,
                  borderRadius: radii.lg,
                  padding: spacing.lg,
                  borderWidth: 1,
                  borderColor: colors.border.soft,
                  ...shadows.card,
                }}
              >
                <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text.primary, marginBottom: spacing.sm }}>
                  Built for {dogName}
                </Text>
                <Text style={{ fontSize: 17, color: colors.text.primary, lineHeight: 26 }}>
                  {"This plan was tailored to " + dogName + "'s age, environment, and current training goal."}
                </Text>
              </Animated.View>
            )}

            {/* ── BONUS COURSES ── */}
            {secondaryGoals.length > 0 && (
              <Animated.View
                entering={FadeInDown.delay(500).duration(380)}
                style={{
                  backgroundColor: colors.bg.surface,
                  borderRadius: radii.lg,
                  padding: spacing.lg,
                  borderWidth: 1,
                  borderColor: colors.border.soft,
                  ...shadows.card,
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text.primary, marginBottom: spacing.md }}>
                  {secondaryGoals.length === 1 ? 'Also included' : `${secondaryGoals.length} courses also included`}
                </Text>

                <View style={{ gap: spacing.sm }}>
                  {secondaryGoals.map((goal) => (
                    <View
                      key={goal}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.sm,
                        paddingVertical: spacing.sm,
                        paddingHorizontal: spacing.md,
                        backgroundColor: colors.bg.surfaceAlt,
                        borderRadius: radii.sm,
                      }}
                    >
                      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.brand.primary, flexShrink: 0 }} />
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>
                        {getBehaviorLabel(goal)}
                      </Text>
                    </View>
                  ))}
                </View>

                <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: spacing.md, lineHeight: 21 }}>
                  These run alongside your main plan. Switch between courses anytime from the Train tab.
                </Text>
              </Animated.View>
            )}

            {/* ── PAYWALL (free users) ── */}
            {!isPaid && (
              <Animated.View
                entering={FadeInDown.delay(540).duration(380)}
                style={{
                  borderRadius: radii.lg,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: colors.border.soft,
                  ...shadows.card,
                }}
              >
                {/* Blurred preview */}
                <View style={{ padding: spacing.lg, backgroundColor: colors.bg.surfaceAlt, gap: spacing.xs }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text.secondary, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: spacing.xs }}>
                    Full plan preview
                  </Text>
                  {[0.5, 0.35, 0.2].map((op, i) => (
                    <View key={i} style={{ height: 42, backgroundColor: colors.border.default, borderRadius: radii.sm, opacity: op }} />
                  ))}
                </View>

                {/* Unlock section */}
                <View style={{ padding: spacing.lg, alignItems: 'center', backgroundColor: colors.bg.surface, borderTopWidth: 1, borderTopColor: colors.border.soft }}>
                  <AppIcon name="lock-closed" size={24} color={colors.brand.primary} />
                  <Text style={{ fontSize: 19, fontWeight: '800', color: colors.text.primary, marginTop: spacing.sm, marginBottom: spacing.xs, textAlign: 'center', letterSpacing: -0.3 }}>
                    Unlock your full plan
                  </Text>
                  <Text style={{ fontSize: 15, color: colors.text.secondary, textAlign: 'center', lineHeight: 22 }}>
                    All 4 weeks, session-by-session guidance, and progress tracking.
                  </Text>
                </View>
              </Animated.View>
            )}

          </View>
        </ScrollView>

        {/* ── STICKY FOOTER CTA ── */}
        <View style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          paddingHorizontal: spacing.md,
          paddingTop: spacing.md,
          paddingBottom: spacing.lg,
          backgroundColor: colors.bg.elevated,
          borderTopWidth: 1,
          borderTopColor: colors.border.soft,
          ...shadows.modal,
        }}>
          {!user ? (
            <>
              <Button
                label="Save my plan — Create account"
                onPress={() => router.push('/(auth)/signup?from=onboarding')}
                style={{ marginBottom: spacing.sm }}
              />
              <Text style={{ textAlign: 'center', fontSize: 14, color: colors.text.secondary }}>
                Your plan is ready. Create a free account to save it.
              </Text>
            </>
          ) : isPaid ? (
            <Button label="Start my first session →" onPress={handleStart} />
          ) : (
            <>
              <Button label="Unlock full plan →" onPress={handleUnlock} style={{ marginBottom: spacing.sm }} />
              <TouchableOpacity onPress={handleStart} activeOpacity={0.7} style={{ alignItems: 'center', paddingVertical: spacing.xs }}>
                <Text style={{ fontSize: 15, color: colors.text.secondary }}>Continue with free plan</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Animated.View>
    </SafeScreen>
  );
}
