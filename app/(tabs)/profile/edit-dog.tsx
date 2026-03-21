import { useState, useEffect } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { BREEDS_LIST } from '@/constants/breeds';
import { useDogStore } from '@/stores/dogStore';

// ─── Static data (mirrored from dog-basics.tsx) ──────────────────────────────

const AGE_OPTIONS = [
  { label: 'Puppy', description: '< 6 months', emoji: '🐾', ageMonths: 4 },
  { label: 'Young', description: '6–18 months', emoji: '⚡', ageMonths: 12 },
  { label: 'Adult', description: '1–3 years', emoji: '🎯', ageMonths: 24 },
  { label: 'Senior', description: '3+ years', emoji: '⭐', ageMonths: 48 },
];

const HOME_OPTIONS = [
  { value: 'apartment', label: 'Apartment', icon: 'business' as const },
  { value: 'house_no_yard', label: 'House, no yard', icon: 'home' as const },
  { value: 'house_yard', label: 'House with yard', icon: 'leaf' as const },
];

// ─── Section header ───────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <Text variant="micro" color={colors.text.secondary} style={styles.sectionLabel}>
      {label.toUpperCase()}
    </Text>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function EditDogScreen() {
  const dog = useDogStore((s) => s.dog);

  // Form state — pre-populated from store on mount
  const [name, setName] = useState(dog?.name ?? '');
  const [ageMonths, setAgeMonths] = useState(dog?.ageMonths ?? 12);
  const [breed, setBreed] = useState(dog?.breed ?? '');
  const [breedQuery, setBreedQuery] = useState(dog?.breed ?? '');
  const [breedFocused, setBreedFocused] = useState(false);
  const [sex, setSex] = useState<'male' | 'female'>(dog?.sex ?? 'male');
  const [neutered, setNeutered] = useState(dog?.neutered ?? false);
  const [environmentType, setEnvironmentType] = useState<'apartment' | 'house_no_yard' | 'house_yard'>(
    dog?.environmentType ?? 'house_yard',
  );

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Keep form in sync if the store dog changes while the screen is open
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
    breedQuery.length > 0
      ? BREEDS_LIST.filter((b) => b.toLowerCase().startsWith(breedQuery.toLowerCase())).slice(0, 8)
      : [];

  async function handleSave() {
    if (!dog) return;
    if (!name.trim()) {
      setErrorMsg("Dog name can't be empty.");
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
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

      setSuccessMsg('Changes saved!');
      setTimeout(() => {
        router.back();
      }, 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setErrorMsg(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeScreen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <AppIcon name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h3" style={styles.headerTitle}>Edit Dog Profile</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Dog name ─────────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <SectionLabel label="Name" />
          <Input
            value={name}
            onChangeText={setName}
            placeholder="e.g. Buddy"
            autoCapitalize="words"
            returnKeyType="done"
          />
        </View>

        {/* ── Breed ────────────────────────────────────────────────────────── */}
        <View style={[styles.card, { zIndex: 10 }]}>
          <SectionLabel label="Breed" />
          <View style={{ zIndex: 10 }}>
            <TextInput
              value={breedQuery}
              onChangeText={(t) => {
                setBreedQuery(t);
                if (!t) setBreed('');
              }}
              onFocus={() => setBreedFocused(true)}
              onBlur={() => setTimeout(() => setBreedFocused(false), 150)}
              placeholder="Search breed…"
              placeholderTextColor={`${colors.text.secondary}80`}
              autoCapitalize="words"
              style={[
                styles.breedInput,
                { borderColor: breedFocused ? colors.brand.primary : colors.border.default },
              ]}
            />
            {breedFocused && breedResults.length > 0 && (
              <View style={[styles.breedDropdown, Platform.OS === 'android' ? { elevation: 10 } : styles.breedShadow]}>
                {breedResults.map((b) => (
                  <Pressable
                    key={b}
                    onPress={() => {
                      setBreed(b);
                      setBreedQuery(b);
                      setBreedFocused(false);
                    }}
                    style={styles.breedRow}
                  >
                    <Text variant="body" color={colors.text.primary}>{b}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* ── Age ──────────────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <SectionLabel label="Age" />
          <View style={styles.ageGrid}>
            {AGE_OPTIONS.map((opt) => (
              <View key={opt.ageMonths} style={styles.ageCell}>
                <OptionCard
                  emoji={opt.emoji}
                  label={opt.label}
                  description={opt.description}
                  selected={ageMonths === opt.ageMonths}
                  onPress={() => setAgeMonths(opt.ageMonths)}
                  layout="vertical"
                  size="lg"
                />
              </View>
            ))}
          </View>
        </View>

        {/* ── Sex + neutered ────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <SectionLabel label="Sex" />
          <View style={styles.twoCol}>
            <OptionCard
              icon="male-sharp"
              label="Male"
              selected={sex === 'male'}
              onPress={() => setSex('male')}
              layout="vertical"
            />
            <OptionCard
              icon="female-sharp"
              label="Female"
              selected={sex === 'female'}
              onPress={() => setSex('female')}
              layout="vertical"
            />
          </View>

          <SectionLabel label={sex === 'male' ? 'Neutered?' : 'Spayed?'} />
          <View style={styles.twoCol}>
            <OptionCard
              label="Yes"
              icon="checkmark-circle"
              selected={neutered}
              onPress={() => setNeutered(true)}
              layout="vertical"
            />
            <OptionCard
              label="No"
              icon="close-circle"
              selected={!neutered}
              onPress={() => setNeutered(false)}
              layout="vertical"
            />
          </View>
        </View>

        {/* ── Environment ──────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <SectionLabel label="Home Environment" />
          <View style={{ gap: spacing.sm }}>
            {HOME_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                icon={opt.icon}
                label={opt.label}
                selected={environmentType === opt.value}
                onPress={() => setEnvironmentType(opt.value as typeof environmentType)}
                layout="horizontal"
                size="md"
              />
            ))}
          </View>
        </View>

        {/* ── Status messages ───────────────────────────────────────────────── */}
        {errorMsg ? (
          <View style={styles.errorBanner}>
            <AppIcon name="alert-circle" size={16} color={colors.error} />
            <Text variant="caption" color={colors.error} style={{ flex: 1 }}>
              {errorMsg}
            </Text>
          </View>
        ) : null}

        {successMsg ? (
          <View style={styles.successBanner}>
            <AppIcon name="checkmark-circle" size={16} color={colors.success} />
            <Text variant="caption" color={colors.success} style={{ flex: 1 }}>
              {successMsg}
            </Text>
          </View>
        ) : null}

        {/* ── Save button ───────────────────────────────────────────────────── */}
        <Button
          label="Save Changes"
          variant="primary"
          loading={saving}
          onPress={handleSave}
          style={styles.saveButton}
        />
      </ScrollView>
    </SafeScreen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'space-between',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.soft,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionLabel: {
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  breedInput: {
    backgroundColor: colors.bg.surfaceAlt,
    borderRadius: radii.md,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 16,
    color: colors.text.primary,
  },
  breedDropdown: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: colors.bg.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    zIndex: 100,
  },
  breedShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  breedRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.soft,
  },
  ageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  ageCell: {
    width: '47.5%',
  },
  twoCol: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.status.dangerBg,
    borderWidth: 1,
    borderColor: colors.status.dangerBorder,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.status.successBg,
    borderWidth: 1,
    borderColor: colors.status.successBorder,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
});
