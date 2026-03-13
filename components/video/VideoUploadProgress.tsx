import { useEffect, useRef } from 'react';
import { View, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';

import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

interface Props {
  visible: boolean;
  percent: number; // 0–100
}

export function VideoUploadProgress({ visible, percent }: Props) {
  const rotation = useSharedValue(0);
  const iconScale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1800, easing: Easing.linear }),
      -1,
      false,
    );
    iconScale.value = withRepeat(
      withTiming(1.12, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  // Estimated time remaining (rough: assume 500 KB/s average)
  const remaining = percent < 100 ? Math.max(1, Math.round(((100 - percent) / 100) * 15)) : 0;
  const etaLabel = remaining > 0 ? `~${remaining}s remaining` : 'Finishing up…';

  return (
    <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.75)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xl,
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 24,
            padding: spacing.xl,
            width: '100%',
            maxWidth: 320,
            alignItems: 'center',
            gap: spacing.lg,
          }}
        >
          {/* Animated upload icon */}
          <Animated.View style={scaleStyle}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: `${colors.primary}15`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Animated.View style={rotateStyle}>
                <AppIcon name="cloud-upload" size={36} color={colors.primary} />
              </Animated.View>
            </View>
          </Animated.View>

          <Text variant="title" style={{ color: colors.textPrimary, textAlign: 'center' }}>
            Uploading video
          </Text>

          {/* Progress bar */}
          <View style={{ width: '100%', gap: spacing.xs }}>
            <View
              style={{
                height: 8,
                backgroundColor: colors.secondary,
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: 8,
                  backgroundColor: colors.primary,
                  borderRadius: 4,
                  width: `${percent}%`,
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="caption" style={{ color: colors.textSecondary }}>
                {etaLabel}
              </Text>
              <Text variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>
                {percent}%
              </Text>
            </View>
          </View>

          {/* Warning */}
          <View
            style={{
              backgroundColor: `${colors.warning}15`,
              borderRadius: 12,
              padding: spacing.md,
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: spacing.sm,
            }}
          >
            <AppIcon name="warning" size={16} color={colors.warning} />
            <Text variant="caption" style={{ color: colors.textSecondary, flex: 1 }}>
              {"Don't close the app while your video is uploading."}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
