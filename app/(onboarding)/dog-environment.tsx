import { useState } from 'react';
import { View, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
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

const ENV_OPTIONS = [
  { id: 'apartment', icon: 'business', label: 'Apartment' },
  { id: 'house_no_yard', icon: 'home', label: 'House (no yard)' },
  { id: 'house_yard', icon: 'leaf', label: 'House with yard' },
] as const;

const MINUTES_OPTIONS = [
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '20+ min', value: 20 },
];

const EXPERIENCE_OPTIONS = [
  { id: 'none', icon: 'paw', label: 'New to this', description: 'First dog or first time training' },
  { id: 'some', icon: 'book', label: 'Tried some things', description: "Watched videos, know the basics" },
  { id: 'experienced', icon: 'school', label: 'Experienced trainer', description: 'Have trained dogs before' },
] as const;

const EQUIPMENT_OPTIONS = [
  'Flat collar', 'Harness (front clip)', 'Harness (back clip)',
  'Martingale', 'Head halter', 'Retractable leash',
  'Standard leash', 'Long line', 'Clicker', 'Treat pouch',
];

export default function DogEnvironmentScreen() {
  const router = useRouter();
  const setField = useOnboardingStore((s) => s.setField);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const storedEnvironmentType = useOnboardingStore((s) => s.environmentType);
  const storedHasKids = useOnboardingStore((s) => s.hasKids);
  const storedHasOtherPets = useOnboardingStore((s) => s.hasOtherPets);
  const storedDaysPerWeek = useOnboardingStore((s) => s.availableDaysPerWeek);
  const storedMinutesPerDay = useOnboardingStore((s) => s.availableMinutesPerDay);
  const storedExperience = useOnboardingStore((s) => s.trainingExperience);
  const storedEquipment = useOnboardingStore((s) => s.equipment);

  const [envType, setEnvType] = useState(storedEnvironmentType);
  const [hasKids, setHasKids] = useState(storedHasKids);
  const [hasOtherPets, setHasOtherPets] = useState(storedHasOtherPets);
  const [daysPerWeek, setDaysPerWeek] = useState(storedDaysPerWeek);
  const [minutesPerDay, setMinutesPerDay] = useState(storedMinutesPerDay);
  const [experience, setExperience] = useState(storedExperience);
  const [equipment, setEquipment] = useState<string[]>(storedEquipment);

  const toggleEquipment = (item: string) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const handleNext = () => {
    setField('environmentType', envType);
    setField('hasKids', hasKids);
    setField('hasOtherPets', hasOtherPets);
    setField('availableDaysPerWeek', daysPerWeek);
    setField('availableMinutesPerDay', minutesPerDay);
    setField('trainingExperience', experience);
    setField('equipment', equipment);
    nextStep();
    router.push('/(onboarding)/video-upload');
  };

  const FieldLabel = ({ title }: { title: string }) => (
    <Text
      variant="bodyStrong"
      style={{ marginBottom: spacing.sm, marginTop: spacing.lg }}
    >
      {title}
    </Text>
  );

  return (
    <SafeScreen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Animated.View entering={FadeInRight.duration(300)} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}>
            <Text variant="h2" style={{ marginBottom: spacing.xs }}>
              Tell us about your setup
            </Text>
            <Text variant="body" color={colors.text.secondary} style={{ marginBottom: spacing.xs }}>
              {"This helps us pick exercises that fit your real life."}
            </Text>

            {/* Where you live */}
            <FieldLabel title="Where you live" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {ENV_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.id}
                  onPress={() => setEnvType(opt.id)}
                  style={({ pressed }) => ({
                    flex: 1,
                    padding: spacing.sm,
                    borderRadius: radii.md,
                    borderWidth: 1.5,
                    borderColor: envType === opt.id ? colors.brand.primary : colors.border.default,
                    backgroundColor: envType === opt.id ? '#DCFCE7' : colors.bg.surface,
                    alignItems: 'center',
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                    ...shadows.card,
                  })}
                >
                  <View style={{ marginBottom: 4 }}>
                    <AppIcon
                      name={opt.icon as AppIconName}
                      size={22}
                      color={envType === opt.id ? colors.brand.primary : colors.text.secondary}
                    />
                  </View>
                  <Text
                    variant="caption"
                    style={{
                      color: envType === opt.id ? colors.brand.primary : colors.text.secondary,
                      fontWeight: '600',
                      textAlign: 'center',
                    }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Who else is home */}
            <FieldLabel title="Who else is home" />
            <View style={{ gap: 10 }}>
              {[
                { key: 'kids', label: 'Kids at home', icon: 'people', value: hasKids, toggle: () => setHasKids((v) => !v) },
                { key: 'pets', label: 'Other pets', icon: 'paw', value: hasOtherPets, toggle: () => setHasOtherPets((v) => !v) },
              ].map((item) => (
                <Pressable
                  key={item.key}
                  onPress={item.toggle}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: spacing.md,
                    borderRadius: radii.md,
                    borderWidth: 1.5,
                    borderColor: item.value ? colors.brand.primary : colors.border.default,
                    backgroundColor: item.value ? '#DCFCE7' : colors.bg.surface,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <AppIcon
                      name={item.icon as AppIconName}
                      size={18}
                      color={item.value ? colors.brand.primary : colors.text.secondary}
                    />
                    <Text variant="body" color={colors.text.primary}>{item.label}</Text>
                  </View>
                  <View style={{
                    width: 24, height: 24, borderRadius: 12,
                    backgroundColor: item.value ? colors.brand.primary : colors.border.default,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {item.value && <AppIcon name="checkmark" size={14} color="#fff" />}
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Training time */}
            <FieldLabel title="Training time" />
            <Text variant="caption" color={colors.text.secondary} style={{ marginBottom: spacing.sm }}>
              Days per week I can train
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: spacing.md }}>
              <Pressable
                onPress={() => setDaysPerWeek((d) => Math.max(1, d - 1))}
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: colors.bg.surfaceAlt,
                  alignItems: 'center', justifyContent: 'center',
                  borderWidth: 1, borderColor: colors.border.default,
                }}
              >
                <Text variant="body" style={{ color: colors.text.primary, fontWeight: '700', fontSize: 20 }}>−</Text>
              </Pressable>
              <Text variant="h3" style={{ color: colors.brand.primary, minWidth: 30, textAlign: 'center' }}>{daysPerWeek}</Text>
              <Pressable
                onPress={() => setDaysPerWeek((d) => Math.min(7, d + 1))}
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: colors.bg.surfaceAlt,
                  alignItems: 'center', justifyContent: 'center',
                  borderWidth: 1, borderColor: colors.border.default,
                }}
              >
                <Text variant="body" style={{ color: colors.text.primary, fontWeight: '700', fontSize: 20 }}>+</Text>
              </Pressable>
            </View>

            <Text variant="caption" color={colors.text.secondary} style={{ marginBottom: spacing.sm }}>
              Minutes per session
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {MINUTES_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setMinutesPerDay(opt.value)}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: radii.pill,
                    borderWidth: 1.5,
                    borderColor: minutesPerDay === opt.value ? colors.brand.primary : colors.border.default,
                    backgroundColor: minutesPerDay === opt.value ? '#DCFCE7' : colors.bg.surface,
                    alignItems: 'center',
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  })}
                >
                  <Text
                    variant="caption"
                    style={{
                      color: minutesPerDay === opt.value ? colors.brand.primary : colors.text.secondary,
                      fontWeight: '600',
                    }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Experience */}
            <FieldLabel title="Your experience" />
            <View style={{ gap: 10 }}>
              {EXPERIENCE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.id}
                  onPress={() => setExperience(opt.id)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: spacing.md,
                    borderRadius: radii.md,
                    borderWidth: 1.5,
                    borderColor: experience === opt.id ? colors.brand.primary : colors.border.default,
                    backgroundColor: experience === opt.id ? '#DCFCE7' : colors.bg.surface,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                    ...shadows.card,
                  })}
                >
                  <View style={{ marginRight: spacing.md }}>
                    <AppIcon
                      name={opt.icon as AppIconName}
                      size={22}
                      color={experience === opt.id ? colors.brand.primary : colors.text.secondary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      variant="bodyStrong"
                      style={{ color: experience === opt.id ? colors.brand.primary : colors.text.primary }}
                    >
                      {opt.label}
                    </Text>
                    <Text variant="caption" color={colors.text.secondary}>{opt.description}</Text>
                  </View>
                  {experience === opt.id && (
                    <View style={{
                      width: 20, height: 20, borderRadius: 10,
                      backgroundColor: colors.brand.primary,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <AppIcon name="checkmark" size={12} color="#fff" />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>

            {/* Equipment */}
            <FieldLabel title="Equipment you have" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {EQUIPMENT_OPTIONS.map((item) => {
                const selected = equipment.includes(item);
                const isRetractable = item === 'Retractable leash';
                return (
                  <Pressable
                    key={item}
                    onPress={() => toggleEquipment(item)}
                    style={({ pressed }) => ({
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: radii.pill,
                      borderWidth: 1.5,
                      borderColor: isRetractable && selected ? colors.warning : selected ? colors.brand.primary : colors.border.default,
                      backgroundColor: isRetractable && selected ? '#FEF3C7' : selected ? '#DCFCE7' : colors.bg.surface,
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                    })}
                  >
                    <Text
                      variant="caption"
                      style={{
                        color: isRetractable && selected ? '#B45309' : selected ? colors.brand.primary : colors.text.secondary,
                        fontWeight: selected ? '600' : '400',
                      }}
                    >
                      {item}
                    </Text>
                    {isRetractable && (
                      <AppIcon
                        name="warning"
                        size={13}
                        color={selected ? '#B45309' : colors.warning}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
            {equipment.includes('Retractable leash') && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm }}>
                <AppIcon name="warning" size={14} color={colors.warning} />
                <Text variant="caption" style={{ color: colors.warning }}>
                  Retractable leashes make leash training harder. We'll note this in your plan.
                </Text>
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
            <Button label="Next" rightIcon="arrow-forward" onPress={handleNext} />
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
