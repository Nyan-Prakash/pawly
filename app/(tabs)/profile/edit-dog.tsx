import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { router } from 'expo-router';

import type { AppIconName } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { BREEDS_LIST } from '@/constants/breeds';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useDogStore } from '@/stores/dogStore';

type EnvironmentType = 'apartment' | 'house_no_yard' | 'house_yard';

const AGE_OPTIONS: { label: string; description: string; icon: AppIconName; ageMonths: number }[] = [
  { label: 'Puppy', description: 'Under 6 months', icon: 'paw-outline', ageMonths: 4 },
  { label: 'Young', description: '6 to 18 months', icon: 'flash-outline', ageMonths: 12 },
  { label: 'Adult', description: '1 to 3 years', icon: 'ribbon-outline', ageMonths: 24 },
  { label: 'Senior', description: '3 years and up', icon: 'star-outline', ageMonths: 48 },
];

const HOME_OPTIONS: { value: EnvironmentType; label: string; icon: AppIconName }[] = [
  { value: 'apartment', label: 'Apartment', icon: 'business-outline' },
  { value: 'house_no_yard', label: 'House, no yard', icon: 'home-outline' },
  { value: 'house_yard', label: 'House with yard', icon: 'leaf-outline' },
];

export default function EditDogScreen() {
  const dog = useDogStore((s) => s.dog);
  const headerHeight = useHeaderHeight();
  const breedRef = useRef<TextInput>(null);

  const [name, setName] = useState(dog?.name ?? '');
  const [ageMonths, setAgeMonths] = useState(dog?.ageMonths ?? 12);
  const [breed, setBreed] = useState(dog?.breed ?? '');
  const [breedQuery, setBreedQuery] = useState(dog?.breed ?? '');
  const [breedFocused, setBreedFocused] = useState(false);
  const [sex, setSex] = useState<'male' | 'female'>(dog?.sex ?? 'male');
  const [neutered, setNeutered] = useState(dog?.neutered ?? false);
  const [environmentType, setEnvironmentType] = useState<EnvironmentType>(dog?.environmentType ?? 'house_yard');

  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Keep the form in sync if the store dog changes while the screen is open
  useEffect(() => {
    if (dog) {
      setName(dog.name);
      setAgeMonths(dog.ageMonths);
      setBreed(dog.breed);
      setBreedQuery(dog.breed);
      setSex(dog.sex);
      setNeutered(dog.neutered);
      setEnvironmentType(dog.environmentType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const breedResults =
    breedFocused && breedQuery.length > 0 && breedQuery !== breed
      ? BREEDS_LIST.filter((b) => b.toLowerCase().startsWith(breedQuery.toLowerCase())).slice(0, 8)
      : [];

  function chooseBreed(value: string) {
    setBreed(value);
    setBreedQuery(value);
    setBreedFocused(false);
    breedRef.current?.blur();
  }

  async function handleSave() {
    if (!dog) return;
    if (!name.trim()) {
      setNameError("Enter your dog's name.");
      return;
    }

    setNameError('');
    setErrorMsg('');
    setSaving(true);

    try {
      await useDogStore.getState().updateDog({
        name: name.trim(),
        breed: breed || dog.breed,
        ageMonths,
        sex,
        neutered,
        environmentType,
      });
      router.back();
    } catch {
      setErrorMsg("Couldn't save the changes. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Input
          label="Name"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (nameError) setNameError('');
          }}
          placeholder="Your dog's name"
          autoCapitalize="words"
          autoComplete="off"
          textContentType="none"
          returnKeyType="next"
          onSubmitEditing={() => breedRef.current?.focus()}
          error={nameError || undefined}
        />

        <View style={{ gap: spacing.sm }}>
          <Input
            ref={breedRef}
            label="Breed"
            value={breedQuery}
            onChangeText={(text) => {
              setBreedQuery(text);
              if (!text) setBreed('');
            }}
            onFocus={() => setBreedFocused(true)}
            onBlur={() => setBreedFocused(false)}
            placeholder="Search breeds"
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
          />
          {breedResults.length > 0 ? (
            <ListGroup>
              {breedResults.map((b) => (
                <ListRow key={b} title={b} onPress={() => chooseBreed(b)} accessibilityHint="Sets this as the breed" />
              ))}
            </ListGroup>
          ) : null}
        </View>

        <View>
          <SectionHeader title="Age" />
          <View accessibilityRole="radiogroup" accessibilityLabel="Age">
            <ListGroup>
              {AGE_OPTIONS.map((opt) => (
                <ListRow
                  key={opt.ageMonths}
                  icon={opt.icon}
                  title={opt.label}
                  subtitle={opt.description}
                  selected={ageMonths === opt.ageMonths}
                  onPress={() => setAgeMonths(opt.ageMonths)}
                />
              ))}
            </ListGroup>
          </View>
        </View>

        <View>
          <SectionHeader title="Sex" />
          <View accessibilityRole="radiogroup" accessibilityLabel="Sex">
            <ListGroup>
              <ListRow icon="male-outline" title="Male" selected={sex === 'male'} onPress={() => setSex('male')} />
              <ListRow icon="female-outline" title="Female" selected={sex === 'female'} onPress={() => setSex('female')} />
            </ListGroup>
          </View>
        </View>

        <View>
          <SectionHeader title={sex === 'male' ? 'Neutered' : 'Spayed'} />
          <View accessibilityRole="radiogroup" accessibilityLabel={sex === 'male' ? 'Neutered' : 'Spayed'}>
            <ListGroup>
              <ListRow icon="checkmark-circle-outline" title="Yes" selected={neutered} onPress={() => setNeutered(true)} />
              <ListRow icon="close-circle-outline" title="No" selected={!neutered} onPress={() => setNeutered(false)} />
            </ListGroup>
          </View>
        </View>

        <View>
          <SectionHeader title="Home" />
          <View accessibilityRole="radiogroup" accessibilityLabel="Home">
            <ListGroup>
              {HOME_OPTIONS.map((opt) => (
                <ListRow
                  key={opt.value}
                  icon={opt.icon}
                  title={opt.label}
                  selected={environmentType === opt.value}
                  onPress={() => setEnvironmentType(opt.value)}
                />
              ))}
            </ListGroup>
          </View>
        </View>

        <View style={{ gap: spacing.md }}>
          {errorMsg ? (
            <Text variant="caption" color={colors.status.danger} accessibilityLiveRegion="polite">
              {errorMsg}
            </Text>
          ) : null}
          <Button label="Save changes" loading={saving} onPress={handleSave} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
