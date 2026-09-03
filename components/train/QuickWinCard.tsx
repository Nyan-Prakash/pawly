import { memo, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { hexToRgba } from '@/constants/courseColors';
import { QUICK_WIN_CATEGORIES, mixHex, type QuickWin } from '@/constants/quickWins';
import { radii } from '@/constants/radii';
import { tintedShadow } from '@/constants/shadows';
import { spacing } from '@/constants/spacing';

type QuickWinCardProps = {
  win: QuickWin;
  onPress: () => void;
};

export const TILE_WIDTH = 160;
export const TILE_HEIGHT = 184;

/**
 * Solid pastel tile, coloured by family (calm / focus / play / manners).
 *
 * The pastel is a real blend into the surface colour — not an rgba wash — so
 * it reads clearly on the warm app background and inverts sensibly in dark
 * mode. Static styles only: NativeWind can drop Pressable style functions.
 */
function QuickWinCardBase({ win, onPress }: QuickWinCardProps) {
  const cat = QUICK_WIN_CATEGORIES[win.category];
  const surface = colors.bg.surface;
  const pastel = mixHex(surface, cat.color, 0.16);
  const pastelEdge = mixHex(surface, cat.color, 0.30);

  const scale = useRef(new Animated.Value(1)).current;
  const press = (to: number) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 0 }).start();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => press(0.97)}
      onPressOut={() => press(1)}
      accessibilityRole="button"
      accessibilityLabel={`${win.title}, ${win.duration}, ${cat.label}`}
    >
      <Animated.View
        style={[
          {
            width: TILE_WIDTH,
            height: TILE_HEIGHT,
            borderRadius: radii.lg,
            backgroundColor: pastel,
            borderWidth: 1,
            borderColor: pastelEdge,
            padding: spacing.md,
            justifyContent: 'space-between',
            overflow: 'hidden',
            transform: [{ scale }],
          },
          tintedShadow(cat.color, 'card'),
        ]}
      >
        {/* Soft glow in the corner — gives the flat pastel a little depth */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: -40,
            top: -40,
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: hexToRgba(cat.color, 0.10),
          }}
        />

        {/* Top — icon well · duration */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 18,
              backgroundColor: surface,
              alignItems: 'center',
              justifyContent: 'center',
              ...tintedShadow(cat.color, 'card'),
            }}
          >
            <AppIcon name={win.icon} size={26} color={cat.color} />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              backgroundColor: surface,
              paddingHorizontal: spacing.sm + 2,
              paddingVertical: spacing.xs + 1,
              borderRadius: radii.pill,
            }}
          >
            <AppIcon name="time-outline" size={12} color={colors.text.secondary} />
            <Text variant="micro" style={{ fontWeight: '700', color: colors.text.primary }}>
              {win.duration}
            </Text>
          </View>
        </View>

        {/* Bottom — title · family */}
        <View style={{ gap: spacing.xs }}>
          <Text
            variant="bodyStrong"
            numberOfLines={2}
            style={{ fontWeight: '800', lineHeight: 21, letterSpacing: -0.2 }}
          >
            {win.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: cat.color }} />
            <Text variant="micro" style={{ fontWeight: '700', color: cat.color }}>
              {cat.label}
            </Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export const QuickWinCard = memo(QuickWinCardBase);
