import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  Pressable,
  StatusBar,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const APP_LOGO = require('../../assets/app-icon.png');
const HERO_GREEN = '#8CC63F';
const HERO_GREEN_DEEP = '#76B82A';
const HERO_GREEN_SHADOW = '#5F9E22';

// ─────────────────────────────────────────────────────────────────────────────
// Feature pill
// ─────────────────────────────────────────────────────────────────────────────

function FeaturePill({
  icon,
  label,
  delay,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  delay: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay, useNativeDriver: true, friction: 8 }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: 'rgba(255,255,255,0.15)',
          paddingHorizontal: 12,
          paddingVertical: 7,
          borderRadius: radii.pill,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.22)',
        }}
      >
        <Ionicons name={icon} size={14} color="rgba(255,255,255,0.95)" />
        <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.95)' }}>
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Floating paw
// ─────────────────────────────────────────────────────────────────────────────

function FloatingPaw({
  x, y, size, opacity: opacityVal, delay,
}: {
  x: number; y: number; size: number; opacity: number; delay: number;
}) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: opacityVal, duration: 800, delay, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 2400, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{ position: 'absolute', left: x, top: y, opacity: fadeAnim, transform: [{ translateY: floatAnim }] }}
    >
      <Ionicons name="paw" size={size} color="rgba(255,255,255,0.3)" />
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Value row
// ─────────────────────────────────────────────────────────────────────────────

function ValueRow({
  icon,
  title,
  subtitle,
  delay,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  delay: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.spring(translateX, { toValue: 0, delay, useNativeDriver: true, friction: 9 }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: colors.status.successBg,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Ionicons name={icon} size={20} color={colors.brand.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text.primary }}>{title}</Text>
          <Text style={{ fontSize: 12, color: colors.text.secondary, marginTop: 1 }}>{subtitle}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const logoScale = useRef(new Animated.Value(0.75)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslate = useRef(new Animated.Value(10)).current;
  const cardTranslate = useRef(new Animated.Value(50)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
    }
    StatusBar.setBarStyle('light-content');

    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 60 }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(taglineTranslate, { toValue: 0, useNativeDriver: true, friction: 8 }),
      ]),
    ]).start();

    Animated.parallel([
      Animated.spring(cardTranslate, { toValue: 0, delay: 250, useNativeDriver: true, friction: 9, tension: 40 }),
      Animated.timing(cardOpacity, { toValue: 1, delay: 250, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  // Bottom safe area for CTAs
  const bottomPad = Math.max(insets.bottom, spacing.lg);

  return (
    <View style={{ flex: 1, backgroundColor: HERO_GREEN }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── HERO — fills all space above the card ── */}
      <LinearGradient
        colors={[HERO_GREEN, HERO_GREEN_DEEP, HERO_GREEN_SHADOW]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ flex: 1 }}
      >
        {/* Radial glow */}
        <View
          style={{
            position: 'absolute',
            top: -80,
            left: SCREEN_WIDTH * 0.1,
            width: SCREEN_WIDTH * 0.8,
            height: SCREEN_WIDTH * 0.8,
            borderRadius: SCREEN_WIDTH * 0.4,
            backgroundColor: 'rgba(255,255,255,0.16)',
          }}
        />

        {/* Floating paws */}
        <FloatingPaw x={SCREEN_WIDTH * 0.05} y={insets.top + 24} size={26} opacity={0.3} delay={800} />
        <FloatingPaw x={SCREEN_WIDTH * 0.78} y={insets.top + 12} size={16} opacity={0.22} delay={1200} />

        {/* Hero content */}
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: insets.top + spacing.md,
            paddingHorizontal: spacing.xl,
            paddingBottom: spacing.xxl,
          }}
        >
          {/* Logo */}
          <Animated.View style={{ alignItems: 'center', opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
            <View
              style={{
                width: 126,
                height: 126,
                borderRadius: 34,
                backgroundColor: 'rgba(255,255,255,0.18)',
                borderWidth: 1.5,
                borderColor: 'rgba(255,255,255,0.28)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.md,
                overflow: 'hidden',
                ...Platform.select({
                  ios: {
                    shadowColor: '#315F12',
                    shadowOffset: { width: 0, height: 14 },
                    shadowOpacity: 0.34,
                    shadowRadius: 24,
                  },
                  android: { elevation: 14 },
                }),
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  right: 10,
                  height: 28,
                  borderRadius: 18,
                  backgroundColor: 'rgba(255,255,255,0.18)',
                }}
              />
              <Image
                source={APP_LOGO}
                style={{ width: 112, height: 112, borderRadius: 28 }}
                resizeMode="cover"
              />
            </View>
            <Text style={{ fontSize: 50, fontWeight: '800', color: '#FFFFFF', letterSpacing: -1.5, lineHeight: 54 }}>
              Pawly
            </Text>
          </Animated.View>

          {/* Tagline */}
          <Animated.View
            style={{ opacity: taglineOpacity, transform: [{ translateY: taglineTranslate }], alignItems: 'center', marginTop: spacing.sm }}
          >
            <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontWeight: '500', lineHeight: 23 }}>
              A trainer who finally knows your dog.
            </Text>
          </Animated.View>

          {/* Pills */}
          <View style={{ flexDirection: 'row', gap: spacing.xs, justifyContent: 'center', marginTop: spacing.lg, flexWrap: 'wrap' }}>
            <FeaturePill icon="sparkles" label="AI-personalized" delay={550} />
            <FeaturePill icon="trending-up" label="Tracks progress" delay={700} />
          </View>
        </View>
      </LinearGradient>

      {/* ── BOTTOM CARD — fixed height, never flex ── */}
      <Animated.View style={{ opacity: cardOpacity, transform: [{ translateY: cardTranslate }] }}>
        <View
          style={{
            backgroundColor: colors.bg.app,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            marginTop: -32,
            paddingTop: spacing.md,
            paddingHorizontal: spacing.lg,
            paddingBottom: bottomPad,
            ...Platform.select({
              ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.07, shadowRadius: 14 },
              android: { elevation: 8 },
            }),
          }}
        >
          {/* Handle */}
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border.default, alignSelf: 'center', marginBottom: spacing.lg }} />

          {/* Value rows */}
          <View style={{ gap: spacing.md, marginBottom: spacing.xl }}>
            <ValueRow icon="fitness" title="Plans built for your dog" subtitle="Personalised to breed, age & goals" delay={400} />
            <ValueRow icon="chatbubble-ellipses" title="AI Coach available 24/7" subtitle="Instant expert advice, any time" delay={520} />
            <ValueRow icon="ribbon" title="Track real progress" subtitle="Streaks, milestones & behaviour scores" delay={640} />
          </View>

          {/* CTAs */}
          <View style={{ gap: spacing.sm }}>
            <Button label="Get started free" variant="primary" size="lg" style={{ height: 64 }} onPress={() => router.push('/(onboarding)/dog-basics')} />
            <Pressable onPress={() => router.push('/(auth)/login')} style={{ alignItems: 'center', paddingVertical: spacing.sm }}>
                <Text style={{ fontSize: 14, color: colors.text.secondary, fontWeight: '500' }}>
                Already have an account? Sign in
                </Text>
            </Pressable>
            <Text style={{ textAlign: 'center', fontSize: 11, color: colors.text.secondary, lineHeight: 16, marginTop: 2 }}>
              No credit card required · Cancel anytime
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
