import { ScrollView, TouchableOpacity, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { StreakBadge } from '@/components/ui/StreakBadge';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { shadows } from '@/constants/shadows';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/authStore';
import { useDogStore } from '@/stores/dogStore';
import { useProgressStore } from '@/stores/progressStore';
import { supabase } from '@/lib/supabase';
import type { ThemePreference } from '@/stores/themeStore';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { dog } = useDogStore();
  const { sessionStreak, totalSessionsCompleted } = useProgressStore();
  const { preference, setPreference } = useTheme();

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}
      >
        {/* Dog profile header */}
        <View
          style={{
            alignItems: 'center',
            paddingTop: spacing.xl,
            paddingBottom: spacing.lg,
            paddingHorizontal: spacing.md,
            gap: spacing.md,
          }}
        >
          {/* Dog avatar */}
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: colors.mascot.fur + '33',
              borderWidth: 3,
              borderColor: colors.mascot.fur,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppIcon name="paw" size={48} color={colors.mascot.fur} />
          </View>

          {/* Dog name */}
          <Text variant="h1" style={{ textAlign: 'center' }}>
            {dog?.name ?? 'Your Dog'}
          </Text>

          {/* Breed / age */}
          {dog && (
            <Text variant="caption" color={colors.text.secondary} style={{ textAlign: 'center' }}>
              {dog.breed ? `${dog.breed} · ` : ''}{ageLabel}
            </Text>
          )}

          {/* Streak badge */}
          <StreakBadge count={sessionStreak} size="md" />
        </View>

        {/* Stats row */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: spacing.md,
            gap: spacing.sm,
            marginBottom: spacing.lg,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: colors.bg.surface,
              borderRadius: radii.md,
              padding: spacing.md,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border.soft,
              ...shadows.card,
            }}
          >
            <Text style={{ fontSize: 26, fontWeight: '800', color: colors.brand.primary }}>
              {totalSessionsCompleted}
            </Text>
            <Text variant="micro" color={colors.text.secondary} style={{ textAlign: 'center' }}>
              Sessions
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.bg.surface,
              borderRadius: radii.md,
              padding: spacing.md,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border.soft,
              ...shadows.card,
            }}
          >
            <Text style={{ fontSize: 26, fontWeight: '800', color: colors.brand.secondary }}>
              {sessionStreak}
            </Text>
            <Text variant="micro" color={colors.text.secondary} style={{ textAlign: 'center' }}>
              Day Streak
            </Text>
          </View>
        </View>

        {/* Account info */}
        <View style={{ paddingHorizontal: spacing.md, gap: spacing.sm }}>
          <View
            style={{
              backgroundColor: colors.bg.surface,
              borderRadius: radii.md,
              padding: spacing.md,
              borderWidth: 1,
              borderColor: colors.border.soft,
              gap: spacing.sm,
            }}
          >
            <Text variant="micro" color={colors.text.secondary}>Appearance</Text>
            <View style={{ flexDirection: 'row', gap: spacing.xs }}>
              {themeOptions.map((option) => {
                const selected = preference === option;

                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setPreference(option)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: radii.pill,
                      borderWidth: 1,
                      borderColor: selected ? colors.brand.primary : colors.border.default,
                      backgroundColor: selected ? `${colors.brand.primary}20` : colors.bg.surfaceAlt,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      variant="caption"
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

          <View
            style={{
              backgroundColor: colors.bg.surface,
              borderRadius: radii.md,
              padding: spacing.md,
              borderWidth: 1,
              borderColor: colors.border.soft,
              gap: spacing.xs,
            }}
          >
            <Text variant="micro" color={colors.text.secondary}>Account</Text>
            <Text variant="body" color={colors.text.primary}>{user?.email ?? '—'}</Text>
          </View>

          <Button
            label="Sign out"
            variant="ghost"
            onPress={handleSignOut}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
