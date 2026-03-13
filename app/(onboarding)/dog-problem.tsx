import { useState } from 'react';
import { View, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { FadeInRight, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { SafeScreen } from '@/components/ui/SafeScreen';
import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radii } from '@/constants/radii';
import { shadows } from '@/constants/shadows';
import { useOnboardingStore } from '@/stores/onboardingStore';

const BEHAVIOR_OPTIONS = [
  { id: 'Leash Pulling', icon: 'walk', label: 'Leash Pulling', description: 'Drags me everywhere' },
  { id: 'Jumping Up', icon: 'arrow-up-circle', label: 'Jumping Up', description: 'On everyone and everything' },
  { id: 'Barking', icon: 'megaphone', label: 'Barking', description: "Won't stop barking" },
  { id: "Won't Come", icon: 'navigate', label: "Won't Come", description: 'Ignores recall completely' },
  { id: 'Potty Training', icon: 'home', label: 'Potty Training', description: 'Still having accidents' },
  { id: 'Crate Anxiety', icon: 'bed', label: 'Crate Anxiety', description: 'Hates being alone' },
  { id: 'Puppy Biting', icon: 'warning', label: 'Puppy Biting', description: 'Nipping and mouthing' },
  { id: 'Settling', icon: 'fitness', label: 'Settling', description: "Can't calm down" },
];

const SEVERITY_OPTIONS = [
  { id: 'mild', label: 'Mild' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'severe', label: 'Severe' },
] as const;

function BehaviorCard({ option, selected, onPress }: {
  option: typeof BEHAVIOR_OPTIONS[0];
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPressIn={() => { scale.value = withTiming(0.97, { duration: 80 }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 120 }); }}
      onPress={onPress}
      style={{ width: '48%' }}
    >
      <Animated.View style={[animStyle, {
        padding: spacing.md,
        borderRadius: radii.md,
        borderWidth: 2,
        borderColor: selected ? colors.brand.primary : colors.border.soft,
        backgroundColor: selected ? '#DCFCE7' : colors.bg.surface,
        alignItems: 'center',
        minHeight: 100,
        justifyContent: 'center',
        ...shadows.card,
      }]}>
        <View style={{ marginBottom: 6 }}>
          <AppIcon
            name={option.icon as AppIconName}
            size={30}
            color={selected ? colors.brand.primary : colors.text.secondary}
          />
        </View>
        <Text
          variant="bodyStrong"
          style={{
            color: selected ? colors.brand.primary : colors.text.primary,
            textAlign: 'center',
            marginBottom: 2,
          }}
        >
          {option.label}
        </Text>
        <Text variant="caption" color={colors.text.secondary} style={{ textAlign: 'center' }}>
          {option.description}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function DogProblemScreen() {
  const router = useRouter();
  const setField = useOnboardingStore((s) => s.setField);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const storedPrimaryGoal = useOnboardingStore((s) => s.primaryGoal);
  const storedSecondaryGoals = useOnboardingStore((s) => s.secondaryGoals);
  const storedSeverity = useOnboardingStore((s) => s.severity);

  const [selected, setSelected] = useState<string[]>(
    storedPrimaryGoal ? [storedPrimaryGoal, ...storedSecondaryGoals] : []
  );
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>(storedSeverity);

  const toggleOption = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const canProceed = selected.length > 0;

  const handleNext = () => {
    setField('primaryGoal', selected[0]);
    setField('secondaryGoals', selected.slice(1));
    setField('severity', severity);
    nextStep();
    router.push('/(onboarding)/dog-environment');
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Animated.View entering={FadeInRight.duration(300)} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}>
            <Text variant="h2" style={{ marginBottom: spacing.xs }}>
              {"What's the biggest challenge?"}
            </Text>
            <Text variant="body" color={colors.text.secondary} style={{ marginBottom: spacing.lg }}>
              Pick the one thing driving you most crazy right now. You can add up to 3.
            </Text>

            {/* 2-column grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: spacing.lg }}>
              {BEHAVIOR_OPTIONS.map((opt) => (
                <BehaviorCard
                  key={opt.id}
                  option={opt}
                  selected={selected.includes(opt.id)}
                  onPress={() => toggleOption(opt.id)}
                />
              ))}
            </View>

            {/* Severity — only show if something selected */}
            {selected.length > 0 && (
              <View style={{ marginBottom: spacing.lg }}>
                <Text variant="bodyStrong" style={{ marginBottom: spacing.sm }}>
                  {"How bad is it?"}
                </Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {SEVERITY_OPTIONS.map((s) => (
                    <Pressable
                      key={s.id}
                      onPress={() => setSeverity(s.id)}
                      style={({ pressed }) => ({
                        flex: 1,
                        paddingVertical: spacing.sm,
                        borderRadius: radii.pill,
                        borderWidth: 1.5,
                        borderColor: severity === s.id ? colors.brand.primary : colors.border.default,
                        backgroundColor: severity === s.id ? '#DCFCE7' : colors.bg.surface,
                        alignItems: 'center',
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                      })}
                    >
                      <Text
                        variant="body"
                        style={{
                          color: severity === s.id ? colors.brand.primary : colors.text.secondary,
                          fontWeight: severity === s.id ? '600' : '400',
                        }}
                      >
                        {s.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: spacing.lg,
            backgroundColor: colors.bg.app,
            borderTopWidth: 1,
            borderTopColor: colors.border.soft,
          }}>
            <Button
              label="Next"
              onPress={handleNext}
              rightIcon="arrow-forward"
              disabled={!canProceed}
              style={{ opacity: canProceed ? 1 : 0.4 }}
            />
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
