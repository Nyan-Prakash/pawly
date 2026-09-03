import { TouchableOpacity, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { hexToRgba } from '@/constants/courseColors';
import { radii } from '@/constants/radii';
import { softShadows } from '@/constants/shadows';
import { spacing } from '@/constants/spacing';

type WalkGoalRowProps = {
  goalText: string;
  logged: boolean;
  onLog: () => void;
};

/** Today's walk focus with a single, obvious "Log" action. */
export function WalkGoalRow({ goalText, logged, onLog }: WalkGoalRowProps) {
  const amber = colors.brand.secondary;
  const green = colors.brand.primary;

  return (
    <View
      style={{
        backgroundColor: colors.bg.surface,
        borderRadius: radii.lg,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        ...softShadows.card,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: hexToRgba(logged ? green : amber, 0.14),
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppIcon name="walk" size={22} color={logged ? green : amber} />
      </View>

      <View style={{ flex: 1, gap: spacing.xs }}>
        <Text variant="micro" style={{ color: colors.text.secondary, fontWeight: '600' }}>
          Today's walk
        </Text>
        <Text variant="body" style={{ fontWeight: '600', lineHeight: 22 }} numberOfLines={2}>
          {goalText}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onLog}
        disabled={logged}
        activeOpacity={0.7}
        hitSlop={8}
        style={{
          minHeight: 40,
          paddingHorizontal: spacing.md,
          borderRadius: radii.pill,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          backgroundColor: logged ? hexToRgba(green, 0.12) : colors.bg.sand,
        }}
      >
        {logged ? <AppIcon name="checkmark" size={16} color={green} /> : null}
        <Text
          variant="caption"
          style={{ fontWeight: '700', color: logged ? green : colors.text.primary }}
        >
          {logged ? 'Logged' : 'Log'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
