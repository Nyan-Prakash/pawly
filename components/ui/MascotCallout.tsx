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

// ─────────────────────────────────────────────────────────────────────────────
// MascotSvg — viewBox 0 0 100 100
//
// Key design decisions that make this read as a DOG not a bear:
//   1. Large floppy ears that HANG DOWN from sides of head (not sit on top)
//   2. Distinct elongated snout pushed forward from the face
//   3. Wet oval nose on snout tip
//   4. Wide-set eyes high on the face (above snout)
//   5. Droopy jowl cheeks framing the snout
// ─────────────────────────────────────────────────────────────────────────────

function MascotSvg({ state = 'happy', size }: { state: MascotState; size: number }) {
  const fur      = colors.mascot.fur;      // warm golden
  const furDark  = colors.mascot.furDark;  // ears, tuft, shading
  const cream    = colors.mascot.earInner; // muzzle + inner ear
  const collar   = colors.mascot.collar;   // brand green
  const tag      = colors.brand.secondary;
  const ink      = '#2B2523';              // nose + mouth
  const eyeCol   = '#1F2937';
  const blush    = '#F59A9A';

  const isWaiting     = state === 'waiting';
  const isCelebrating = state === 'celebrating';
  const isThinking    = state === 'thinking';
  const isEncouraging = state === 'encouraging';

  // Face geometry — head centred at (50,48), eyes on the upper third, muzzle
  // below. Kept in variables so expressions only move a few numbers.
  const eyeY = 45;
  const lx = 37;
  const rx = 63;
  const eyeRy: Record<MascotState, number> = {
    happy: 6.5, encouraging: 6, thinking: 6, celebrating: 7.2, waiting: 6.5,
  };

  // Mouth — a soft "w" built from two arcs meeting under the nose.
  const mouth: Record<MascotState, string> = {
    happy:       'M 43 67 Q 50 72.5 57 67',
    encouraging: 'M 42.5 67 Q 50 73 57.5 67',
    thinking:    'M 45 68.5 Q 50 69.5 55 68.5',
    celebrating: 'M 41 66 Q 50 76 59 66',
    waiting:     'M 45.5 68 Q 50 70.5 54.5 68',
  };


  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id="sleepL"><Rect x={lx - 8} y={eyeY} width={16} height={12} /></ClipPath>
        <ClipPath id="sleepR"><Rect x={rx - 8} y={eyeY} width={16} height={12} /></ClipPath>
        <ClipPath id="head"><Ellipse cx={50} cy={48} rx={31} ry={29} /></ClipPath>
      </Defs>

      {/* ── Thought bubbles ── */}
      {isThinking && (
        <>
          <Circle cx={80} cy={22} r={5.5} fill={colors.bg.surfaceAlt} />
          <Circle cx={88} cy={13} r={3.5} fill={colors.bg.surfaceAlt} />
          <Circle cx={93} cy={6}  r={2}   fill={colors.bg.surfaceAlt} />
        </>
      )}

      {/* ── Confetti ── */}
      {isCelebrating && (
        <>
          <Rect x={8}  y={12} width={6} height={6} rx={1.5} fill={tag}                  transform="rotate(20 11 15)" />
          <Rect x={84} y={10} width={5} height={5} rx={1}   fill={colors.brand.primary} transform="rotate(-18 86 12)" />
          <Rect x={16} y={26} width={4} height={4} rx={1}   fill="#F472B6"              transform="rotate(35 18 28)" />
          <Rect x={80} y={28} width={5} height={5} rx={1.5} fill={colors.brand.coach}   transform="rotate(-25 82 30)" />
          <Circle cx={50} cy={7} r={2.5} fill="#A78BFA" />
        </>
      )}

      {/* ── Ears — one outer shape + one solid inner shape, mirrored exactly ── */}
      <Path d="M 33 25 C 16 22 2 44 7 62 C 10 76 24 80 29 70 C 32 60 33 42 33 25 Z" fill={furDark} />
      <Path d="M 67 25 C 84 22 98 44 93 62 C 90 76 76 80 71 70 C 68 60 67 42 67 25 Z" fill={furDark} />
      <Path d="M 30 38 C 20 40 13 54 16 64 C 18 70 25 71 27 64 C 29 56 30 47 30 38 Z" fill={cream} />
      <Path d="M 70 38 C 80 40 87 54 84 64 C 82 70 75 71 73 64 C 71 56 70 47 70 38 Z" fill={cream} />

      {/* ── Head ── */}
      <Ellipse cx={50} cy={48} rx={31} ry={29} fill={fur} />
      {/* soft under-shadow, clipped to the head so it reads as form not a stain */}
      <Ellipse cx={50} cy={63} rx={34} ry={22} fill={furDark} opacity={0.12} clipPath="url(#head)" />

      {/* ── Muzzle — one clean shape ── */}
      <Path d="M 50 50 C 62 50 70 57 70 65 C 70 73 61 77 50 77 C 39 77 30 73 30 65 C 30 57 38 50 50 50 Z" fill={cream} />

      {/* ── Brows ── */}
      <Path d={`M ${lx - 6} ${eyeY - 10.5} Q ${lx} ${eyeY - (isThinking ? 15 : 13)} ${lx + 6} ${eyeY - 10.5}`}
        stroke={furDark} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.75} />
      <Path d={`M ${rx - 6} ${eyeY - 10.5} Q ${rx} ${eyeY - 13} ${rx + 6} ${eyeY - 10.5}`}
        stroke={furDark} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.75} />

      {/* ── Eyes ── */}
      {isWaiting ? (
        <>
          <Ellipse cx={lx} cy={eyeY} rx={5.5} ry={eyeRy[state]} fill={eyeCol} clipPath="url(#sleepL)" />
          <Ellipse cx={rx} cy={eyeY} rx={5.5} ry={eyeRy[state]} fill={eyeCol} clipPath="url(#sleepR)" />
          <Path d={`M ${lx - 6} ${eyeY} Q ${lx} ${eyeY - 3} ${lx + 6} ${eyeY}`} stroke={furDark} strokeWidth={2.2} strokeLinecap="round" fill="none" />
          <Path d={`M ${rx - 6} ${eyeY} Q ${rx} ${eyeY - 3} ${rx + 6} ${eyeY}`} stroke={furDark} strokeWidth={2.2} strokeLinecap="round" fill="none" />
        </>
      ) : isEncouraging ? (
        <>
          <Ellipse cx={lx} cy={eyeY} rx={5.5} ry={eyeRy[state]} fill={eyeCol} />
          <Circle cx={lx + 2} cy={eyeY - 2.4} r={2} fill="white" />
          <Circle cx={lx - 1.6} cy={eyeY + 2.2} r={1} fill="white" opacity={0.6} />
          {/* wink */}
          <Path d={`M ${rx - 6} ${eyeY + 1} Q ${rx} ${eyeY - 5} ${rx + 6} ${eyeY + 1}`} stroke={eyeCol} strokeWidth={3} strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <Ellipse cx={lx} cy={eyeY} rx={5.5} ry={eyeRy[state]} fill={eyeCol} />
          <Ellipse cx={rx} cy={eyeY} rx={5.5} ry={eyeRy[state]} fill={eyeCol} />
          <Circle cx={lx + 2} cy={eyeY - 2.4} r={2} fill="white" />
          <Circle cx={rx + 2} cy={eyeY - 2.4} r={2} fill="white" />
          <Circle cx={lx - 1.6} cy={eyeY + 2.2} r={1} fill="white" opacity={0.6} />
          <Circle cx={rx - 1.6} cy={eyeY + 2.2} r={1} fill="white" opacity={0.6} />
        </>
      )}

      {/* ── Cheeks ── */}
      <Ellipse cx={27} cy={59} rx={5} ry={3} fill={blush} opacity={0.35} />
      <Ellipse cx={73} cy={59} rx={5} ry={3} fill={blush} opacity={0.35} />

      {/* ── Nose — rounded heart ── */}
      <Path d="M 45 57 C 45 54 55 54 55 57 C 55 60.2 52 62.5 50 62.5 C 48 62.5 45 60.2 45 57 Z" fill={ink} />
      <Ellipse cx={48} cy={56.6} rx={1.7} ry={1} fill="white" opacity={0.45} />

      {/* ── Mouth ── */}
      <Path d={mouth[state]} stroke={ink} strokeWidth={1.8} strokeLinecap="round" fill="none" opacity={0.85} />

      {/* ── Tongue — celebrating only ── */}
      {isCelebrating && (
        <G>
          <Path d="M 45.5 69 L 54.5 69 L 54.5 73.5 C 54.5 77.5 45.5 77.5 45.5 73.5 Z" fill="#F26D6D" />
          <Path d="M 50 70 L 50 75.5" stroke="#DC4C4C" strokeWidth={1.2} strokeLinecap="round" opacity={0.7} />
        </G>
      )}

      {/* ── Collar — thin, slightly muted so the face keeps focus ── */}
      <Path d="M 25 73 C 35 82 65 82 75 73 L 75 77.5 C 65 86.5 35 86.5 25 77.5 Z" fill={collar} />
      <Path d="M 25 73 C 35 82 65 82 75 73 L 75 77.5 C 65 86.5 35 86.5 25 77.5 Z" fill="#000" opacity={0.14} />
      <Circle cx={50} cy={83} r={5.5} fill={tag} />

      {/* ── Encouraging paw ── */}
      {isEncouraging && (
        <G transform="translate(86, 62)">
          <Ellipse cx={0} cy={2} rx={6} ry={7.5} fill={fur} />
          <Circle cx={-4.5} cy={-5} r={2.8} fill={fur} />
          <Circle cx={0}    cy={-6.5} r={2.8} fill={fur} />
          <Circle cx={4.5}  cy={-5} r={2.8} fill={fur} />
          <Ellipse cx={0} cy={3} rx={3.2} ry={3.6} fill={cream} opacity={0.8} />
        </G>
      )}
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported component
// ─────────────────────────────────────────────────────────────────────────────

export function MascotCallout({ state = 'happy', size = 120, callout, style }: MascotCalloutProps) {
  const scaleAnim  = useRef(new Animated.Value(0.8)).current;

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
