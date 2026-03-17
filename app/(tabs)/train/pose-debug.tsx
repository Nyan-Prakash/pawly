// ─────────────────────────────────────────────────────────────────────────────
// Pose Debug — guard wrapper
//
// This file must NOT import react-native-fast-tflite or anything that does,
// because TensorflowLite.ts calls TensorflowModule.install() at parse time,
// which causes a native crash if the module isn't linked.
//
// The real implementation lives in pose-debug-impl.tsx and is loaded lazily.
// ─────────────────────────────────────────────────────────────────────────────

import React, { Suspense } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radii } from '@/constants/radii';
import { getPoseDebugUnavailableReason } from '@/lib/vision/nativeSupport';

const PoseDebugImpl = React.lazy(() => import('./pose-debug-impl'));

export default function PoseDebugScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const unavailableReason = getPoseDebugUnavailableReason();

  if (unavailableReason) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg.app, paddingTop: insets.top }}>
        <Pressable
          style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, gap: 4 }}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          <Text variant="bodyStrong">Back</Text>
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: colors.bg.surface, borderRadius: radii.md, padding: spacing.lg, marginHorizontal: spacing.lg, borderWidth: 1, borderColor: colors.border.soft }}>
            <Text variant="h3" style={{ marginBottom: spacing.sm }}>Pose Debug Unavailable</Text>
            <Text variant="body" color={colors.text.secondary}>{unavailableReason}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <Suspense fallback={
      <View style={{ flex: 1, backgroundColor: colors.bg.app, alignItems: 'center', justifyContent: 'center' }}>
        <Text variant="body" color={colors.text.secondary}>Loading…</Text>
      </View>
    }>
      <PoseDebugImpl />
    </Suspense>
  );
}
