import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { MascotCallout } from '@/components/ui/MascotCallout';
import { Text } from '@/components/ui/Text';
import { FeedbackModal } from '@/components/profile/FeedbackModal';
import { colors } from '@/constants/colors';
import { hexToRgba } from '@/constants/courseColors';
import { radii } from '@/constants/radii';
import { shadows } from '@/constants/shadows';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/authStore';
import { useDogStore } from '@/stores/dogStore';
import { useProgressStore } from '@/stores/progressStore';
import { supabase } from '@/lib/supabase';
import type { ThemePreference } from '@/stores/themeStore';

// ─────────────────────────────────────────────────────────────────────────────
// Settings row
// ─────────────────────────────────────────────────────────────────────────────

function SettingsRow({
  icon,
  iconColor,
  iconBg,
  label,
  subtitle,
  onPress,
}: {
  icon: string;
  iconColor?: string;
  iconBg?: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
}) {
  const ic = iconColor ?? colors.brand.primary;
  const bg = iconBg ?? hexToRgba(ic, 0.1);
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={{
        backgroundColor: colors.bg.surface,
        borderRadius: radii.lg,
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.md,
        borderWidth: 1.5,
        borderColor: colors.border.soft,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        ...shadows.card,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppIcon name={icon as any} size={18} color={ic} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">{label}</Text>
        {subtitle && (
          <Text variant="micro" color={colors.text.secondary} style={{ marginTop: 1 }}>
            {subtitle}
          </Text>
        )}
      </View>
      <AppIcon name="chevron-forward" size={16} color={colors.text.secondary} />
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat pill
// ─────────────────────────────────────────────────────────────────────────────

function StatPill({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: hexToRgba(color, 0.08),
        borderRadius: radii.pill,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        borderWidth: 1,
        borderColor: hexToRgba(color, 0.18),
      }}
    >
      <AppIcon name={icon as any} size={16} color={color} />
      <Text style={{ fontSize: 16, fontWeight: '800', color, letterSpacing: -0.3 }}>
        {value}
      </Text>
      <Text variant="micro" color={color} style={{ opacity: 0.75 }}>
        {label}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { dog } = useDogStore();
  const { sessionStreak, totalSessionsCompleted } = useProgressStore();
  const { preference, setPreference } = useTheme();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const themeOptions: ThemePreference[] = ['system', 'light', 'dark'];
  const ageLabel = dog
    ? dog.ageMonths < 12
      ? `${dog.ageMonths}mo`
      : `${Math.floor(dog.ageMonths / 12)}y`
    : '';

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <SafeScreen>
      {/* Soft gradient wash at top */}
      <LinearGradient
        colors={[hexToRgba(colors.brand.primary, 0.07), 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 320 }}
        pointerEvents="none"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}
      >
        {/* ── Profile header ── */}
        <View
          style={{
            alignItems: 'center',
            paddingTop: spacing.xl,
            paddingBottom: spacing.lg,
            paddingHorizontal: spacing.md,
            gap: spacing.sm,
          }}
        >
          {/* Avatar ring */}
          <View style={{ position: 'relative' }}>
            <View
              style={{
                width: 108,
                height: 108,
                borderRadius: 54,
                backgroundColor: hexToRgba(colors.brand.primary, 0.12),
                borderWidth: 3,
                borderColor: hexToRgba(colors.brand.primary, 0.3),
                alignItems: 'center',
                justifyContent: 'center',
                overflow: dog?.avatarUrl ? 'hidden' : 'visible',
              }}
            >
              {dog?.avatarUrl ? (
                <Image
                  source={{ uri: dog.avatarUrl }}
                  style={{ width: 108, height: 108, borderRadius: 54 }}
                />
              ) : (
                <MascotCallout state="happy" size={96} style={{ marginBottom: -8 }} />
              )}
            </View>
            {/* Edit badge */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile/edit-dog')}
              activeOpacity={0.8}
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: colors.brand.primary,
                borderWidth: 2,
                borderColor: colors.bg.app,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppIcon name="pencil" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Dog name */}
          <Text
            style={{
              fontSize: 28,
              fontWeight: '800',
              color: colors.text.primary,
              letterSpacing: -0.5,
              textAlign: 'center',
              marginTop: spacing.xs,
            }}
          >
            {dog?.name ?? 'Your Dog'}
          </Text>

          {/* Breed · age */}
          {dog && dog.breed && (
            <Text variant="caption" color={colors.text.secondary} style={{ textAlign: 'center' }}>
              {dog.breed}
              {ageLabel ? `  ·  ${ageLabel}` : ''}
            </Text>
          )}

          {/* Stat pills */}
          <View
            style={{
              flexDirection: 'row',
              gap: spacing.sm,
              marginTop: spacing.xs,
              width: '100%',
            }}
          >
            <StatPill
              icon="trophy"
              value={totalSessionsCompleted}
              label="sessions"
              color={colors.brand.primary}
            />
            <StatPill
              icon="flame"
              value={sessionStreak}
              label="day streak"
              color={colors.brand.secondary}
            />
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing.md, gap: 20 }}>

          {/* ── Appearance ── */}
          <View style={{ gap: spacing.sm }}>
            <SectionHeader title="Appearance" />
            <View
              style={{
                backgroundColor: colors.bg.surface,
                borderRadius: radii.lg,
                padding: spacing.md,
                borderWidth: 1.5,
                borderColor: colors.border.soft,
                ...shadows.card,
              }}
            >
              <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                {themeOptions.map((option) => {
                  const selected = preference === option;
                  const themeIcon =
                    option === 'light' ? 'sunny' : option === 'dark' ? 'moon' : 'phone-portrait';
                  return (
                    <TouchableOpacity
                      key={option}
                      activeOpacity={0.75}
                      onPress={() => setPreference(option)}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: radii.pill,
                        borderWidth: 1.5,
                        borderColor: selected ? colors.brand.primary : colors.border.default,
                        backgroundColor: selected
                          ? hexToRgba(colors.brand.primary, 0.1)
                          : colors.bg.surfaceAlt,
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <AppIcon
                        name={themeIcon as any}
                        size={15}
                        color={selected ? colors.brand.primary : colors.text.secondary}
                      />
                      <Text
                        variant="micro"
                        color={selected ? colors.brand.primary : colors.text.secondary}
                        style={{ fontWeight: '700', textTransform: 'capitalize' }}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* ── Account ── */}
          <View style={{ gap: spacing.sm }}>
            <SectionHeader title="Account" />

            {/* Email row (non-tappable) */}
            <View
              style={{
                backgroundColor: colors.bg.surface,
                borderRadius: radii.lg,
                paddingVertical: spacing.sm + 2,
                paddingHorizontal: spacing.md,
                borderWidth: 1.5,
                borderColor: colors.border.soft,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                ...shadows.card,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: hexToRgba(colors.brand.coach, 0.1),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppIcon name="person" size={18} color={colors.brand.coach} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="micro" color={colors.text.secondary}>
                  Email
                </Text>
                <Text variant="bodyStrong" numberOfLines={1}>
                  {user?.email ?? '—'}
                </Text>
              </View>
            </View>

            <SettingsRow
              icon="notifications-outline"
              label="Notifications"
              subtitle="Training reminders, walk check-ins, milestones"
              onPress={() => router.push('/(tabs)/profile/notification-settings')}
            />

            <SettingsRow
              icon="chatbubble-outline"
              iconColor={colors.brand.coach}
              label="Send Feedback"
              subtitle="Bugs, feature requests, or general thoughts"
              onPress={() => setShowFeedbackModal(true)}
            />
          </View>

          {/* Sign out */}
          <Button
            label="Sign out"
            variant="ghost"
            onPress={handleSignOut}
          />
        </View>
      </ScrollView>

      <FeedbackModal
        visible={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </SafeScreen>
  );
}
