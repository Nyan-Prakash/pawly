// ─────────────────────────────────────────────────────────────────────────────
// SessionModePicker
//
// Shown after SETUP when the protocol supports the Live AI Trainer.
// The user picks "Do Normally" or "Use Live AI Trainer".
//
// Props:
//   onNormal  — start session in normal (manual) mode
//   onCamera  — start session in Live AI Trainer mode
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
  onBack: () => void;
  accentColor?: string;
  accentTint?: string;
  contrastTextColor?: string;
}

export function SessionModePicker({
  dogName,
  onNormal,
  onCamera,
  onBack,
  accentColor = colors.primary,
  accentTint = colors.status.successBg,
  contrastTextColor = '#fff',
}: SessionModePickerProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top + spacing.md,
        paddingHorizontal: spacing.lg,
        paddingBottom: insets.bottom + spacing.lg,
      }}
    >
      {/* Back button */}
      <Pressable
        onPress={onBack}
        hitSlop={12}
        style={({ pressed }) => ({
          alignSelf: 'flex-start',
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.sm,
          opacity: pressed ? 0.6 : 1,
          minHeight: 44,
          justifyContent: 'center',
          marginBottom: spacing.md,
        })}
      >
        <Text style={{ fontSize: 16, color: colors.textSecondary }}>← Back</Text>
      </Pressable>

      {/* Header */}
      <View style={{ alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl * 1.5 }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 24,
            backgroundColor: accentTint,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.xs,
          }}
        >
          <AppIcon name="videocam" size={36} color={accentColor} />
        </View>
        <Text
          style={{
            fontSize: 26,
            fontWeight: '700',
            color: colors.textPrimary,
            textAlign: 'center',
            letterSpacing: -0.5,
          }}
        >
          How do you want{'\n'}to train?
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 22,
            maxWidth: 300,
          }}
        >
          Our expert AI watches and listens to provide real-time coaching for {dogName}.
        </Text>
      </View>

      {/* Options */}
      <View style={{ gap: spacing.md}}>
        {/* Camera mode — primary/featured option */}
        <Pressable
          onPress={onCamera}
          style={({ pressed }) => ({
            backgroundColor: pressed ? accentTint : colors.surface,
            borderRadius: 20,
            padding: spacing.lg,
            shadowColor: colors.shadow.success,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.14,
            shadowRadius: 12,
            elevation: 4,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                backgroundColor: accentTint,
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AppIcon name="videocam" size={28} color={accentColor} />
            </View>

            <View style={{ flex: 1, gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary }}>
                  Live AI Trainer
                </Text>
                <View
                  style={{
                    backgroundColor: accentColor,
                    paddingHorizontal: 7,
                    paddingVertical: 2,
                    borderRadius: 99,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '800', color: contrastTextColor, letterSpacing: 0.5 }}>
                    NEW
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 19 }}>
                Point your camera at {dogName} and talk naturally. The AI gives live advice and judges progress.
              </Text>
            </View>

            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: accentColor,
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AppIcon name="chevron-forward" size={16} color={contrastTextColor} />
            </View>
          </View>

          {/* Feature pills */}
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' }}>
            {['Live Coaching', 'Voice Enabled', 'Hands-free'].map((label) => (
              <View
                key={label}
                style={{
                  backgroundColor: accentTint,
                  borderRadius: 99,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderWidth: 1,
                  borderColor: accentColor,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: accentColor }}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </Pressable>

        {/* Normal mode */}
        <Pressable
          onPress={onNormal}
          style={({ pressed }) => ({
            backgroundColor: pressed ? colors.bg.surfaceAlt : colors.surface,
            borderRadius: 20,
            padding: spacing.lg,
            borderWidth: 1.5,
            borderColor: colors.border.strong,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                backgroundColor: colors.bg.surfaceAlt,
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AppIcon name="list" size={28} color={colors.textSecondary} />
            </View>

            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary }}>
                Do Normally
              </Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 19 }}>
                Follow the step-by-step guide and mark reps manually.
              </Text>
            </View>

            <AppIcon name="chevron-forward" size={18} color={colors.textSecondary} />
          </View>
        </Pressable>
      </View>

      {/* Bottom note */}
      <View style={{ marginTop: spacing.xl, alignItems: 'center' }}>
        <Text style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center' }}>
          You can switch modes anytime from a session
        </Text>
      </View>
    </View>
  );
}
