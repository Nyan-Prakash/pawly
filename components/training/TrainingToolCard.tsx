import React from 'react';
import { View, StyleSheet, Animated, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon, AppIconName } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';

interface TrainingToolCardProps {
  title: string;
  subtitle: string;
  hint: string;
  icon: AppIconName;
  onPressIn?: () => void;
  onLongPress?: () => void;
  onPressOut?: () => void;
  disabled?: boolean;
  accentColor: string;
  gradientColors: readonly [string, string, ...string[]];
}

export function TrainingToolCard({
  title,
  subtitle,
  hint,
  icon,
  onPressIn,
  onLongPress,
  onPressOut,
  disabled = false,
  accentColor,
  gradientColors,
}: TrainingToolCardProps) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const glow = React.useRef(new Animated.Value(0)).current;
  const pulse = React.useRef(new Animated.Value(1)).current;
  const pulseLoop = React.useRef<Animated.CompositeAnimation | null>(null);

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
    Animated.timing(glow, { toValue: 1, duration: 120, useNativeDriver: false }).start();

    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.18, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
    onPressIn?.();
  };

  const handlePressOut = () => {
    pulseLoop.current?.stop();
    Animated.spring(scale, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }).start();
    Animated.timing(glow, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    Animated.spring(pulse, { toValue: 1, useNativeDriver: true }).start();
    onPressOut?.();
  };

  const borderColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [accentColor + '30', accentColor + 'AA'],
  });

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }, disabled && styles.disabled]}>
      <Animated.View style={[styles.borderShell, { borderColor }]}>
        <Pressable
          onPressIn={disabled ? undefined : handlePressIn}
          onPressOut={disabled ? undefined : handlePressOut}
          onLongPress={disabled ? undefined : onLongPress}
          style={styles.pressable}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {/* Pulse ring behind icon */}
            <View style={styles.iconArea}>
              <Animated.View
                style={[
                  styles.pulseRing,
                  { borderColor: accentColor + '50', transform: [{ scale: pulse }] },
                ]}
              />
              <View style={[styles.iconCircle, { backgroundColor: accentColor + '22' }]}>
                <AppIcon name={icon} size={36} color={accentColor} />
              </View>
            </View>

            {/* Text */}
            <View style={styles.textBlock}>
              <Text variant="h2" style={styles.title}>{title}</Text>
              <Text variant="caption" color={colors.text.secondary} style={styles.subtitle}>
                {subtitle}
              </Text>
            </View>

            {/* Hint chip */}
            <View style={[styles.hintChip, { backgroundColor: accentColor + '18', borderColor: accentColor + '40' }]}>
              <AppIcon name="finger-print-outline" size={13} color={accentColor} />
              <Text variant="micro" color={accentColor} style={styles.hintText}>{hint}</Text>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radii.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.10,
        shadowRadius: 16,
      },
      android: { elevation: 5 },
    }),
  },
  disabled: {
    opacity: 0.45,
  },
  borderShell: {
    borderRadius: radii.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  pressable: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: radii.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  iconArea: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: 90,
  },
  pulseRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    alignItems: 'center',
    gap: 4,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  hintChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  hintText: {
    letterSpacing: 0.2,
  },
});
