import { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radii } from '@/constants/radii';
import { BREEDS_LIST } from '@/constants/breeds';
import { useOnboardingStore } from '@/stores/onboardingStore';

const AGE_OPTIONS = [
  { label: '8–12 weeks', months: 2 },
  { label: '3–6 months', months: 4 },
  { label: '6–12 months', months: 9 },
  { label: '1–2 years', months: 18 },
  { label: '2–4 years', months: 36 },
  { label: '4+ years', months: 60 },
];

export default function DogBasicsScreen() {
  const router = useRouter();
  const setField = useOnboardingStore((s) => s.setField);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const storedDogName = useOnboardingStore((s) => s.dogName);
  const storedBreed = useOnboardingStore((s) => s.breed);
  const storedAgeMonths = useOnboardingStore((s) => s.ageMonths);
  const storedSex = useOnboardingStore((s) => s.sex);
  const storedNeutered = useOnboardingStore((s) => s.neutered);

  const [dogName, setDogName] = useState(storedDogName);
  const [breed, setBreed] = useState(storedBreed);
  const [breedQuery, setBreedQuery] = useState(storedBreed);
  const [showBreedDrop, setShowBreedDrop] = useState(false);
  const [selectedAge, setSelectedAge] = useState(storedAgeMonths);
  const [sex, setSex] = useState<'male' | 'female'>(storedSex);
  const [neutered, setNeutered] = useState(storedNeutered);

  const filteredBreeds = breedQuery.length > 0
    ? BREEDS_LIST.filter((b) => b.toLowerCase().includes(breedQuery.toLowerCase())).slice(0, 8)
    : [];

  const canProceed = dogName.trim().length > 0 && breed.trim().length > 0;

  const handleNext = () => {
    setField('dogName', dogName.trim());
    setField('breed', breed);
    setField('ageMonths', selectedAge);
    setField('sex', sex);
    setField('neutered', neutered);
    nextStep();
    router.push('/(onboarding)/dog-problem');
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Animated.View entering={FadeInRight.duration(300)} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
            <Text variant="h2" style={{ marginBottom: spacing.xs }}>
              Tell us about your dog
            </Text>
            <Text variant="body" color={colors.text.secondary} style={{ marginBottom: spacing.lg }}>
              {"We'll build a training plan just for them."}
            </Text>

            {/* Dog name */}
            <Input
              label="Dog's name"
              value={dogName}
              onChangeText={setDogName}
              placeholder="e.g. Max"
              autoCapitalize="words"
              style={{ marginBottom: spacing.md }}
            />

            {/* Breed */}
            <Text variant="micro" color={colors.text.secondary} style={{ fontWeight: '600', marginBottom: spacing.xs }}>
              Breed
            </Text>
            <View style={{ position: 'relative', marginBottom: spacing.md }}>
              <Input
                value={breedQuery}
                onChangeText={(t) => { setBreedQuery(t); setBreed(''); setShowBreedDrop(true); }}
                placeholder="e.g. Golden Retriever"
                autoCapitalize="words"
              />
              {showBreedDrop && filteredBreeds.length > 0 && (
                <View style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: colors.bg.surface,
                  borderWidth: 1,
                  borderColor: colors.border.default,
                  borderRadius: radii.md,
                  zIndex: 100,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 4,
                }}>
                  {filteredBreeds.map((b) => (
                    <Pressable
                      key={b}
                      onPress={() => { setBreed(b); setBreedQuery(b); setShowBreedDrop(false); }}
                      style={({ pressed }) => ({
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                        backgroundColor: pressed ? '#DCFCE7' : colors.bg.surface,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border.soft,
                      })}
                    >
                      <Text variant="body" color={colors.text.primary}>{b}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Age */}
            <Text variant="micro" color={colors.text.secondary} style={{ fontWeight: '600', marginBottom: spacing.sm }}>
              Age
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md }}>
              {AGE_OPTIONS.map((opt) => {
                const selected = selectedAge === opt.months;
                return (
                  <Pressable
                    key={opt.months}
                    onPress={() => setSelectedAge(opt.months)}
                    style={({ pressed }) => ({
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: radii.pill,
                      borderWidth: 1.5,
                      borderColor: selected ? colors.brand.primary : colors.border.default,
                      backgroundColor: selected ? '#DCFCE7' : colors.bg.surface,
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                    })}
                  >
                    <Text
                      variant="caption"
                      style={{
                        color: selected ? colors.brand.primary : colors.text.secondary,
                        fontWeight: selected ? '600' : '400',
                      }}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Sex */}
            <Text variant="micro" color={colors.text.secondary} style={{ fontWeight: '600', marginBottom: spacing.sm }}>
              Sex
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: spacing.md }}>
              {(['male', 'female'] as const).map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setSex(s)}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: spacing.md,
                    borderRadius: radii.md,
                    borderWidth: 1.5,
                    borderColor: sex === s ? colors.brand.primary : colors.border.default,
                    backgroundColor: sex === s ? '#DCFCE7' : colors.bg.surface,
                    alignItems: 'center',
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  })}
                >
                  <Text
                    variant="body"
                    style={{
                      color: sex === s ? colors.brand.primary : colors.text.secondary,
                      fontWeight: '600',
                    }}
                  >
                    {s === 'male' ? 'Male' : 'Female'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Neutered */}
            <Text variant="micro" color={colors.text.secondary} style={{ fontWeight: '600', marginBottom: spacing.sm }}>
              {sex === 'female' ? 'Spayed' : 'Neutered'}
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {([true, false] as const).map((val) => (
                <Pressable
                  key={String(val)}
                  onPress={() => setNeutered(val)}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: spacing.md,
                    borderRadius: radii.md,
                    borderWidth: 1.5,
                    borderColor: neutered === val ? colors.brand.primary : colors.border.default,
                    backgroundColor: neutered === val ? '#DCFCE7' : colors.bg.surface,
                    alignItems: 'center',
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  })}
                >
                  <Text
                    variant="body"
                    style={{
                      color: neutered === val ? colors.brand.primary : colors.text.secondary,
                      fontWeight: '600',
                    }}
                  >
                    {val ? 'Yes' : 'No'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Pinned CTA */}
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
              label="Next →"
              onPress={handleNext}
              disabled={!canProceed}
              style={{ opacity: canProceed ? 1 : 0.4 }}
            />
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
