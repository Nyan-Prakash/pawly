import React from 'react';
import { TouchableOpacity, View, StyleSheet, Animated } from 'react-native';
import { AppIcon, AppIconName } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { shadows } from '@/constants/shadows';

interface TrainingToolCardProps {
  title: string;
  subtitle: string;
  icon: AppIconName;
  onPress?: () => void;
  onPressIn?: () => void;
  onLongPress?: () => void;
  onPressOut?: () => void;
  disabled?: boolean;
  accentColor?: string;
}

export function TrainingToolCard({
  title,
  subtitle,
  icon,
  onPress,
  onPressIn,
  onLongPress,
  onPressOut,
  disabled = false,
  accentColor = colors.brand.primary,
}: TrainingToolCardProps) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressInInternal = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
    onPressIn?.();
  };

  const handlePressOutInternal = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
    onPressOut?.();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, styles.container, disabled && styles.disabled]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressInInternal}
        onPressOut={handlePressOutInternal}
        disabled={disabled}
        style={styles.touchable}
      >
        <View style={[styles.iconContainer, { backgroundColor: accentColor + '15' }]}>
          <AppIcon name={icon} size={32} color={accentColor} />
        </View>
        <View style={styles.content}>
          <Text variant="h3" style={styles.title}>{title}</Text>
          <Text variant="caption" color={colors.text.secondary}>{subtitle}</Text>
        </View>
        <AppIcon name="chevron-forward" size={20} color={colors.text.secondary} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.soft,
    ...shadows.card,
  },
  disabled: {
    opacity: 0.5,
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: 2,
  },
});
