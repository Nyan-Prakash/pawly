// ─────────────────────────────────────────────────────────────────────────────
// Pose Debug Screen  —  DEV ONLY
//
// Full-screen camera view with professional floating HUD overlay.
// Not connected to AI coach, session scoring, or plan adaptation.
//
// REQUIRES a native dev build (not Expo Go).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { DogKeypointOverlay } from '@/components/vision/DogKeypointOverlay';
import { Text } from '@/components/ui/Text';
import { spacing } from '@/constants/spacing';
import { radii } from '@/constants/radii';
import { usePoseSession } from '@/hooks/usePoseSession';
import { getPoseDebugUnavailableReason } from '@/lib/vision/nativeSupport';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── Scanning pulse animation ───────────────────────────────────────────────────

function ScanPulse({ detected }: { detected: boolean }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulse, { toValue: 1.18, duration: 900, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.15, duration: 900, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.7, duration: 900, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, opacity]);

  const color = detected ? '#4ADE80' : '#94A3B8';

  return (
    <View style={hudStyles.pulseWrap}>
      <Animated.View
        style={[
          hudStyles.pulseRing,
          { borderColor: color, transform: [{ scale: pulse }], opacity },
        ]}
      />
      <View style={[hudStyles.pulseDot, { backgroundColor: color }]} />
    </View>
  );
}

// ── Confidence bar ─────────────────────────────────────────────────────────────

function ConfidenceBar({ value }: { value: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: value,
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start();
  }, [value, anim]);

  const color = value > 0.7 ? '#4ADE80' : value > 0.4 ? '#FACC15' : '#F87171';

  return (
    <View style={hudStyles.barTrack}>
      <Animated.View
        style={[
          hudStyles.barFill,
          {
            width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

// ── HUD pill ───────────────────────────────────────────────────────────────────

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <View style={[hudStyles.pill, { borderColor: ok ? 'rgba(74,222,128,0.4)' : 'rgba(148,163,184,0.25)' }]}>
      <View style={[hudStyles.pillDot, { backgroundColor: ok ? '#4ADE80' : '#64748B' }]} />
      <Text variant="micro" style={{ color: ok ? '#E2E8F0' : '#64748B', letterSpacing: 0.3 }}>
        {label}
      </Text>
    </View>
  );
}

// ── Corner brackets (scan frame decoration) ────────────────────────────────────

function ScanFrame({ detected }: { detected: boolean }) {
  const color = detected ? 'rgba(74,222,128,0.8)' : 'rgba(148,163,184,0.4)';
  const size = 28;
  const thickness = 3;
  const corner = { width: size, height: size, borderColor: color, borderWidth: 0 };

  return (
    <>
      {/* Top-left */}
      <View style={[scanStyles.corner, { top: 0, left: 0, borderTopWidth: thickness, borderLeftWidth: thickness, borderColor: color }]} />
      {/* Top-right */}
      <View style={[scanStyles.corner, { top: 0, right: 0, borderTopWidth: thickness, borderRightWidth: thickness, borderColor: color }]} />
      {/* Bottom-left */}
      <View style={[scanStyles.corner, { bottom: 0, left: 0, borderBottomWidth: thickness, borderLeftWidth: thickness, borderColor: color }]} />
      {/* Bottom-right */}
      <View style={[scanStyles.corner, { bottom: 0, right: 0, borderBottomWidth: thickness, borderRightWidth: thickness, borderColor: color }]} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root export
// ─────────────────────────────────────────────────────────────────────────────

export default function PoseDebugScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const { observation, cameraRef, isModelLoaded, isRunning, error, startSession, stopSession } =
    usePoseSession();
  const [cameraReady, setCameraReady] = useState(false);

  const unavailableReason = getPoseDebugUnavailableReason();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission().catch(() => {});
    }
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    if (!unavailableReason && cameraReady && isModelLoaded && !isRunning) {
      startSession();
    }
  }, [unavailableReason, cameraReady, isModelLoaded, isRunning, startSession]);

  useEffect(() => {
    return () => stopSession();
  }, [stopSession]);

  function handleBack() {
    stopSession();
    router.back();
  }

  // ── Native modules missing ─────────────────────────────────────────────────
  if (unavailableReason) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Pressable style={styles.backBtn} onPress={handleBack} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color="#F8FAFC" />
          <Text variant="bodyStrong" style={{ color: '#F8FAFC' }}>Back</Text>
        </Pressable>
        <View style={styles.center}>
          <View style={styles.errorCard}>
            <Ionicons name="warning-outline" size={32} color="#FBBF24" style={{ marginBottom: spacing.sm }} />
            <Text variant="h3" style={{ color: '#F8FAFC', marginBottom: spacing.xs }}>Unavailable</Text>
            <Text variant="body" style={{ color: '#94A3B8', textAlign: 'center' }}>{unavailableReason}</Text>
          </View>
        </View>
      </View>
    );
  }

  // ── Camera permission missing ──────────────────────────────────────────────
  if (!hasPermission) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Pressable style={styles.backBtn} onPress={handleBack} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color="#F8FAFC" />
          <Text variant="bodyStrong" style={{ color: '#F8FAFC' }}>Back</Text>
        </Pressable>
        <View style={styles.center}>
          <View style={styles.errorCard}>
            <Ionicons name="camera-outline" size={36} color="#60A5FA" style={{ marginBottom: spacing.sm }} />
            <Text variant="h3" style={{ color: '#F8FAFC', marginBottom: spacing.xs }}>Camera Access</Text>
            <Text variant="body" style={{ color: '#94A3B8', textAlign: 'center', marginBottom: spacing.md }}>
              Camera permission is required to run pose detection.
            </Text>
            <Pressable style={styles.permBtn} onPress={() => requestPermission().catch(() => {})}>
              <Text variant="bodyStrong" style={{ color: '#0B1220' }}>Grant Permission</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // ── No back camera ─────────────────────────────────────────────────────────
  if (!device) {
    return (
      <View style={[styles.root, styles.center]}>
        <Text variant="body" style={{ color: '#94A3B8' }}>Back camera not available.</Text>
      </View>
    );
  }

  // ── Main ───────────────────────────────────────────────────────────────────
  const detected = observation !== null;
  const confidence = observation?.confidence ?? 0;
  const keypointCount = observation?.keypoints.length ?? 0;

  return (
    <View style={styles.root}>
      {/* Full-screen camera */}
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        onInitialized={() => setCameraReady(true)}
        onError={(e: unknown) => console.warn('[PoseDebug] camera error', e)}
      />

      {/* Dark gradient vignette at top and bottom */}
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0)']}
        style={styles.vignetteTop}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.75)']}
        style={styles.vignetteBottom}
        pointerEvents="none"
      />

      {/* Skeleton overlay — full screen */}
      <DogKeypointOverlay
        observation={observation}
        containerWidth={SCREEN_WIDTH}
        containerHeight={SCREEN_HEIGHT}
      />

      {/* ── Top bar ── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 4 }]}>
        <Pressable style={styles.backBtn} onPress={handleBack} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color="#F8FAFC" />
          <Text variant="bodyStrong" style={{ color: '#F8FAFC' }}>Back</Text>
        </Pressable>

        <View style={styles.titleRow}>
          <ScanPulse detected={detected} />
          <Text variant="bodyStrong" style={styles.titleText}>
            {detected ? 'Dog Detected' : 'Scanning…'}
          </Text>
        </View>
      </View>

      {/* ── Scan frame around the dog area (center of screen) ── */}
      <View style={styles.scanFrameWrap} pointerEvents="none">
        <ScanFrame detected={detected} />
      </View>

      {/* ── Bottom HUD ── */}
      <View style={[styles.hud, { paddingBottom: insets.bottom + spacing.md }]}>
        {/* Status pills row */}
        <View style={styles.pillRow}>
          <StatusPill ok={isModelLoaded} label="Model" />
          <StatusPill ok={isRunning}     label="Running" />
          <StatusPill ok={detected}      label="Detected" />
        </View>

        {/* Confidence + keypoints */}
        {detected && (
          <View style={styles.metricsCard}>
            <View style={styles.metricRow}>
              <Text variant="micro" style={styles.metricLabel}>Confidence</Text>
              <Text variant="micro" style={[styles.metricValue, { color: confidence > 0.7 ? '#4ADE80' : '#FACC15' }]}>
                {(confidence * 100).toFixed(1)}%
              </Text>
            </View>
            <ConfidenceBar value={confidence} />

            <View style={[styles.metricRow, { marginTop: spacing.sm }]}>
              <Text variant="micro" style={styles.metricLabel}>Keypoints visible</Text>
              <Text variant="micro" style={styles.metricValue}>{keypointCount} / 24</Text>
            </View>
          </View>
        )}

        {/* Error */}
        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={14} color="#F87171" />
            <Text variant="micro" style={{ color: '#F87171', flex: 1 }} numberOfLines={2}>
              {error}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  vignetteTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 160,
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 240,
  },
  topBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: radii.pill,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  titleText: {
    color: '#F8FAFC',
    letterSpacing: 0.3,
  },
  scanFrameWrap: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.22,
    left: SCREEN_WIDTH * 0.12,
    right: SCREEN_WIDTH * 0.12,
    bottom: SCREEN_HEIGHT * 0.32,
  },
  hud: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  metricsCard: {
    backgroundColor: 'rgba(11,18,32,0.72)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: spacing.md,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricLabel: {
    color: '#94A3B8',
    letterSpacing: 0.3,
  },
  metricValue: {
    color: '#E2E8F0',
    fontVariant: ['tabular-nums'],
  },
  errorBanner: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    padding: spacing.sm,
  },
  errorCard: {
    backgroundColor: 'rgba(18,26,41,0.92)',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: spacing.xl,
    alignItems: 'center',
    maxWidth: 320,
  },
  permBtn: {
    backgroundColor: '#4ADE80',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
});

const hudStyles = StyleSheet.create({
  pulseWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(11,18,32,0.65)',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  barTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
});

const scanStyles = StyleSheet.create({
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 2,
  },
});
