// ─────────────────────────────────────────────────────────────────────────────
// SessionModePicker
//
// Shown after SETUP when the protocol supports live pose coaching.
// The user picks "Do Normally" or "Use Live Camera Coach".
//
// Props:
//   onNormal  — start session in normal (manual) mode
//   onCamera  — start session in live camera coaching mode
//   dogName   — used in the description copy
// ─────────────────────────────────────────────────────────────────────────────

import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

interface SessionModePickerProps {
  dogName: string;
  onNormal: () => void;
  onCamera: () => void;
}

export function SessionModePicker({ dogName, onNormal, onCamera }: SessionModePickerProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top + spacing.xl,
        paddingHorizontal: spacing.lg,
        paddingBottom: insets.bottom + spacing.lg,
      }}
    >
      {/* Header */}
      <View style={{ alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl }}>
        <AppIcon name="videocam" size={40} color={colors.primary} />
        <Text
          style={{
            fontSize: 24,
            fontWeight: '700',
            color: colors.textPrimary,
            textAlign: 'center',
          }}
        >
          How do you want to train?
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 22,
          }}
        >
          Live Camera Coach tracks {dogName}'s posture automatically and counts reps for you.
        </Text>
      </View>

      {/* Options */}
      <View style={{ gap: spacing.md, flex: 1 }}>
        {/* Camera mode */}
        <Pressable
          onPress={onCamera}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#E6F4F1' : colors.surface,
            borderRadius: 20,
            padding: spacing.lg,
            borderWidth: 2,
            borderColor: colors.primary,
            gap: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 96,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.10,
            shadowRadius: 8,
            elevation: 2,
          })}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: '#E6F4F1',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppIcon name="videocam" size={26} color={colors.primary} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary }}>
                Use Live Camera Coach
              </Text>
              <View
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 99,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>NEW</Text>
              </View>
            </View>
            <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
              Point your camera at {dogName}. The app coaches in real time.
            </Text>
          </View>
          <AppIcon name="chevron-forward" size={18} color={colors.primary} />
        </Pressable>

        {/* Normal mode */}
        <Pressable
          onPress={onNormal}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#F5F5F5' : colors.surface,
            borderRadius: 20,
            padding: spacing.lg,
            borderWidth: 1.5,
            borderColor: colors.border.default,
            gap: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 96,
          })}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: colors.secondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppIcon name="list" size={26} color={colors.textSecondary} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary }}>
              Do Normally
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
              Follow the step-by-step guide and mark reps manually.
            </Text>
          </View>
          <AppIcon name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}
