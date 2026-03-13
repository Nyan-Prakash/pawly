import { useEffect, useRef } from 'react';
import { Animated, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  Path,
  Rect,
} from 'react-native-svg';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';

export type MascotState = 'happy' | 'encouraging' | 'thinking' | 'celebrating' | 'waiting';

type MascotCalloutProps = {
  state?: MascotState;
  size?: number;
  callout?: string;
  style?: StyleProp<ViewStyle>;
};

function MascotSvg({ state = 'happy', size }: { state: MascotState; size: number }) {
  const fur = colors.mascot.fur;
  const furDark = colors.mascot.furDark;
  const earInner = colors.mascot.earInner;
  const collar = colors.mascot.collar;
  const nose = '#3A3A3A';
  const eyeColor = '#111827';

  // Eye positions vary by state
  const leftEyeX = state === 'thinking' ? 28 : 27;
  const rightEyeX = state === 'thinking' ? 50 : 53;
  const eyeY = state === 'encouraging' ? 32 : 34;
  const eyeRY = state === 'waiting' ? 2.5 : 5;
  const eyeRX = 4.5;

  // Mouth paths by state
  const mouthPaths: Record<MascotState, string> = {
    happy:       'M 33 46 Q 40 52 47 46',
    encouraging: 'M 33 45 Q 40 51 47 45',
    thinking:    'M 35 47 L 45 47',
    celebrating: 'M 31 45 Q 40 54 49 45',
    waiting:     'M 35 46 L 45 46',
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Defs>
        {state === 'waiting' && (
          <ClipPath id="halfEyeL">
            <Rect x="20" y="30" width="15" height="10" />
          </ClipPath>
        )}
        {state === 'waiting' && (
          <ClipPath id="halfEyeR">
            <Rect x="46" y="30" width="15" height="10" />
          </ClipPath>
        )}
      </Defs>

      {/* Thought bubbles for thinking */}
      {state === 'thinking' && (
        <>
          <Circle cx={52} cy={10} r={4} fill={colors.bg.surfaceAlt} />
          <Circle cx={60} cy={6}  r={3} fill={colors.bg.surfaceAlt} />
          <Circle cx={66} cy={3}  r={2} fill={colors.bg.surfaceAlt} />
        </>
      )}

      {/* Confetti for celebrating */}
      {state === 'celebrating' && (
        <>
          <Rect x={8}  y={8}  width={5} height={5} rx={1} fill={colors.brand.secondary} transform="rotate(20 10 10)" />
          <Rect x={62} y={6}  width={4} height={4} rx={1} fill={colors.brand.primary}   transform="rotate(-15 64 8)" />
          <Rect x={15} y={18} width={4} height={4} rx={1} fill="#EC4899"                transform="rotate(35 17 20)" />
          <Rect x={60} y={18} width={5} height={5} rx={1} fill={colors.brand.coach}     transform="rotate(-25 62 20)" />
          <Rect x={40} y={5}  width={4} height={4} rx={1} fill="#8B5CF6"                transform="rotate(10 42 7)" />
        </>
      )}

      {/* Left ear (outer) */}
      <Ellipse cx={18} cy={20} rx={11} ry={14} fill={furDark} />
      {/* Left ear (inner) */}
      <Ellipse cx={18} cy={21} rx={7}  ry={9}  fill={earInner} />

      {/* Right ear (outer) */}
      <Ellipse cx={62} cy={20} rx={11} ry={14} fill={furDark} />
      {/* Right ear (inner) */}
      <Ellipse cx={62} cy={21} rx={7}  ry={9}  fill={earInner} />

      {/* Head */}
      <Ellipse cx={40} cy={40} rx={27} ry={25} fill={fur} />

      {/* Left eye */}
      {state === 'waiting' ? (
        <Ellipse cx={leftEyeX} cy={eyeY} rx={eyeRX} ry={eyeRY} fill={eyeColor} clipPath="url(#halfEyeL)" />
      ) : (
        <Ellipse cx={leftEyeX} cy={eyeY} rx={eyeRX} ry={5} fill={eyeColor} />
      )}
      {/* Right eye */}
      {state === 'waiting' ? (
        <Ellipse cx={rightEyeX} cy={eyeY} rx={eyeRX} ry={eyeRY} fill={eyeColor} clipPath="url(#halfEyeR)" />
      ) : (
        <Ellipse cx={rightEyeX} cy={eyeY} rx={eyeRX} ry={5} fill={eyeColor} />
      )}

      {/* Eye shines */}
      {state !== 'waiting' && (
        <>
          <Circle cx={leftEyeX  + 1.5} cy={eyeY - 2} r={1.2} fill="white" />
          <Circle cx={rightEyeX + 1.5} cy={eyeY - 2} r={1.2} fill="white" />
        </>
      )}

      {/* Nose */}
      <Ellipse cx={40} cy={44} rx={4} ry={3} fill={nose} />
      <Circle  cx={38.5} cy={43} r={1} fill="white" opacity={0.5} />

      {/* Mouth */}
      <Path
        d={mouthPaths[state]}
        stroke={nose}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />

      {/* Cheek blush */}
      <Ellipse cx={20} cy={46} rx={6} ry={3} fill="#F9A8D4" opacity={0.35} />
      <Ellipse cx={60} cy={46} rx={6} ry={3} fill="#F9A8D4" opacity={0.35} />

      {/* Collar */}
      <Rect x={22} y={60} width={36} height={7} rx={3.5} fill={collar} />
      {/* Collar tag */}
      <Circle cx={40} cy={67} r={3} fill={colors.brand.secondary} />

      {/* Paw for encouraging state */}
      {state === 'encouraging' && (
        <G transform="translate(62, 44)">
          <Ellipse cx={0} cy={0} rx={5} ry={7} fill={fur} />
          <Circle cx={-3} cy={-6} r={2.5} fill={fur} />
          <Circle cx={0}  cy={-7} r={2.5} fill={fur} />
          <Circle cx={3}  cy={-6} r={2.5} fill={fur} />
        </G>
      )}
    </Svg>
  );
}

export function MascotCallout({ state = 'happy', size = 120, callout, style }: MascotCalloutProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 80,
    }).start();
  }, [scaleAnim]);

  return (
    <View style={[{ alignItems: 'center', gap: 8 }, style]}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <MascotSvg state={state} size={size} />
      </Animated.View>
      {callout && (
        <View
          style={{
            backgroundColor: colors.bg.surface,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.border.default,
            paddingHorizontal: 14,
            paddingVertical: 8,
            maxWidth: size * 1.8,
          }}
        >
          <Text variant="caption" style={{ textAlign: 'center', lineHeight: 20 }}>
            {callout}
          </Text>
        </View>
      )}
    </View>
  );
}
