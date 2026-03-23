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
  const fur      = colors.mascot.fur;      // #F6B66E warm amber
  const furDark  = colors.mascot.furDark;  // #E19A53 dark amber
  const earInner = colors.mascot.earInner; // #FFD9B3 peach
  const collar   = colors.mascot.collar;   // brand green
  const tag      = colors.brand.secondary;
  const nose     = '#2A2A2A';
  const eyeCol   = '#111827';

  // ── Mouth per state ─────────────────────────────────────────────────────
  const mouthPaths: Record<MascotState, string> = {
    happy:       'M 39 64 Q 50 72 61 64',
    encouraging: 'M 40 63 Q 50 70 60 63',
    thinking:    'M 42 65 L 58 65',
    celebrating: 'M 37 63 Q 50 75 63 63',
    waiting:     'M 42 65 Q 50 68 58 65',
  };

  // ── Eye shape per state ──────────────────────────────────────────────────
  // waiting = sleepy half-closed, celebrating = wide
  const eyeRY: Record<MascotState, number> = {
    happy: 5.5, encouraging: 4.5, thinking: 4.5, celebrating: 6.5, waiting: 2.5,
  };

  const isWaiting     = state === 'waiting';
  const isCelebrating = state === 'celebrating';
  const isThinking    = state === 'thinking';
  const isEncouraging = state === 'encouraging';

  // Eye y-position — sit above the snout
  const eyeY = 38;
  const leftEyeX  = 35;
  const rightEyeX = 65;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {/* Clip for half-closed sleepy eyes */}
        <ClipPath id="sleepL">
          <Rect x={leftEyeX  - 8} y={eyeY} width={16} height={12} />
        </ClipPath>
        <ClipPath id="sleepR">
          <Rect x={rightEyeX - 8} y={eyeY} width={16} height={12} />
        </ClipPath>
      </Defs>

      {/* ── Thought bubbles ── */}
      {isThinking && (
        <>
          <Circle cx={72} cy={14} r={5}   fill={colors.bg.surfaceAlt} opacity={0.9} />
          <Circle cx={81} cy={8}  r={3.5} fill={colors.bg.surfaceAlt} opacity={0.9} />
          <Circle cx={88} cy={4}  r={2.5} fill={colors.bg.surfaceAlt} opacity={0.9} />
        </>
      )}

      {/* ── Confetti ── */}
      {isCelebrating && (
        <>
          <Rect x={6}  y={10} width={6} height={6} rx={1.5} fill={tag}                  transform="rotate(20 9 13)" />
          <Rect x={82} y={8}  width={5} height={5} rx={1}   fill={colors.brand.primary} transform="rotate(-18 84 10)" />
          <Rect x={14} y={22} width={5} height={5} rx={1}   fill="#EC4899"              transform="rotate(35 16 24)" />
          <Rect x={78} y={24} width={6} height={6} rx={1.5} fill={colors.brand.coach}   transform="rotate(-25 81 27)" />
          <Rect x={46} y={4}  width={5} height={5} rx={1}   fill="#8B5CF6"              transform="rotate(12 48 6)" />
        </>
      )}

      {/* ── FLOPPY EARS — hang DOWN from sides of head ──────────────────────
          These are the key feature that makes this read as a dog.
          Each ear is a large teardrop/rounded-rect that droops below the head.
      ────────────────────────────────────────────────────────────────────── */}

      {/* Left ear — outer dark fur */}
      <Path
        d="M 18 36 C 4 36 2 58 6 72 C 10 84 22 88 28 80 C 32 74 30 52 26 40 Z"
        fill={furDark}
      />
      {/* Left ear — inner peach */}
      <Path
        d="M 20 40 C 10 42 9 60 12 70 C 15 78 23 80 26 74 C 28 68 27 50 23 42 Z"
        fill={earInner}
      />

      {/* Right ear — outer dark fur */}
      <Path
        d="M 82 36 C 96 36 98 58 94 72 C 90 84 78 88 72 80 C 68 74 70 52 74 40 Z"
        fill={furDark}
      />
      {/* Right ear — inner peach */}
      <Path
        d="M 80 40 C 90 42 91 60 88 70 C 85 78 77 80 74 74 C 72 68 73 50 77 42 Z"
        fill={earInner}
      />

      {/* ── HEAD (drawn on top of ear roots) ── */}
      <Ellipse cx={50} cy={44} rx={30} ry={27} fill={fur} />

      {/* ── SNOUT — elongated muzzle that protrudes forward ── */}
      {/* Snout base — slightly darker to separate from head */}
      <Ellipse cx={50} cy={62} rx={17} ry={13} fill={earInner} />
      {/* Snout highlight — top lighter area */}
      <Ellipse cx={50} cy={57} rx={13} ry={8}  fill="#FFE8C8" opacity={0.6} />

      {/* ── EYES — high on face, wide-set ── */}
      {isWaiting ? (
        <>
          {/* Sleepy half-closed */}
          <Ellipse cx={leftEyeX}  cy={eyeY} rx={6} ry={eyeRY[state]} fill={eyeCol} clipPath="url(#sleepL)" />
          <Ellipse cx={rightEyeX} cy={eyeY} rx={6} ry={eyeRY[state]} fill={eyeCol} clipPath="url(#sleepR)" />
          {/* Droopy eyelid lines */}
          <Path d={`M ${leftEyeX - 6} ${eyeY} Q ${leftEyeX} ${eyeY - 3} ${leftEyeX + 6} ${eyeY}`}
            stroke={furDark} strokeWidth={2} strokeLinecap="round" fill="none" />
          <Path d={`M ${rightEyeX - 6} ${eyeY} Q ${rightEyeX} ${eyeY - 3} ${rightEyeX + 6} ${eyeY}`}
            stroke={furDark} strokeWidth={2} strokeLinecap="round" fill="none" />
        </>
      ) : isEncouraging ? (
        <>
          {/* Left eye normal */}
          <Ellipse cx={leftEyeX}  cy={eyeY} rx={6} ry={eyeRY[state]} fill={eyeCol} />
          {/* Right eye = wink (closed arc) */}
          <Path
            d={`M ${rightEyeX - 6} ${eyeY} Q ${rightEyeX} ${eyeY - 6} ${rightEyeX + 6} ${eyeY}`}
            stroke={eyeCol} strokeWidth={3} strokeLinecap="round" fill="none"
          />
        </>
      ) : (
        <>
          <Ellipse cx={leftEyeX}  cy={eyeY} rx={6} ry={eyeRY[state]} fill={eyeCol} />
          <Ellipse cx={rightEyeX} cy={eyeY} rx={6} ry={eyeRY[state]} fill={eyeCol} />
        </>
      )}

      {/* Eye shines */}
      {!isWaiting && !isEncouraging && (
        <>
          <Circle cx={leftEyeX  + 2.5} cy={eyeY - 2} r={1.8} fill="white" />
          <Circle cx={leftEyeX  - 0.5} cy={eyeY + 2} r={0.9} fill="white" opacity={0.5} />
          <Circle cx={rightEyeX + 2.5} cy={eyeY - 2} r={1.8} fill="white" />
          <Circle cx={rightEyeX - 0.5} cy={eyeY + 2} r={0.9} fill="white" opacity={0.5} />
        </>
      )}
      {isEncouraging && (
        <>
          <Circle cx={leftEyeX + 2.5} cy={eyeY - 2} r={1.8} fill="white" />
          <Circle cx={leftEyeX - 0.5} cy={eyeY + 2} r={0.9} fill="white" opacity={0.5} />
        </>
      )}

      {/* ── NOSE — big wet oval on snout ── */}
      <Ellipse cx={50} cy={56} rx={6.5} ry={4.5} fill={nose} />
      {/* Nose shine */}
      <Ellipse cx={47.5} cy={54.5} rx={2.2} ry={1.4} fill="white" opacity={0.45} />
      {/* Nose-to-mouth line */}
      <Path d="M 50 60.5 L 50 63" stroke={nose} strokeWidth={1.5} strokeLinecap="round" />

      {/* ── MOUTH ── */}
      <Path
        d={mouthPaths[state]}
        stroke={nose}
        strokeWidth={2.2}
        strokeLinecap="round"
        fill="none"
      />

      {/* ── TONGUE — happy & celebrating ── */}
      {(state === 'happy' || isCelebrating) && (
        <G>
          <Ellipse cx={50} cy={70} rx={5.5} ry={6.5} fill="#F87171" />
          <Path d="M 44.5 70 Q 50 76 55.5 70" fill="#EF4444" opacity={0.4} />
          <Ellipse cx={48} cy={68} rx={1.8} ry={1.2} fill="white" opacity={0.35} />
        </G>
      )}

      {/* ── CHEEK BLUSH ── */}
      <Ellipse cx={24} cy={52} rx={7} ry={4} fill="#FDA4AF" opacity={0.28} />
      <Ellipse cx={76} cy={52} rx={7} ry={4} fill="#FDA4AF" opacity={0.28} />

      {/* ── COLLAR ── */}
      <Rect x={28} y={68} width={44} height={8} rx={4} fill={collar} />
      {/* Collar stitch detail */}
      <Rect x={28} y={68} width={44} height={2.5} rx={1.2} fill="white" opacity={0.15} />
      {/* Collar tag */}
      <Circle cx={50} cy={76} r={5}   fill={tag} />
      <Circle cx={50} cy={76} r={2.5} fill={furDark} opacity={0.2} />

      {/* ── ENCOURAGING PAW ── */}
      {isEncouraging && (
        <G transform="translate(80, 50)">
          <Ellipse cx={0} cy={0}  rx={5.5} ry={8} fill={fur} />
          <Circle  cx={-4} cy={-7} r={3}   fill={fur} />
          <Circle  cx={0}  cy={-8} r={3}   fill={fur} />
          <Circle  cx={4}  cy={-7} r={3}   fill={fur} />
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
  const wiggleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 80,
    }).start();
  }, [scaleAnim]);

  useEffect(() => {
    if (state === 'celebrating' || state === 'happy') {
      Animated.sequence([
        Animated.timing(wiggleAnim, { toValue: 5,  duration: 90,  useNativeDriver: true }),
        Animated.timing(wiggleAnim, { toValue: -5, duration: 90,  useNativeDriver: true }),
        Animated.timing(wiggleAnim, { toValue: 3,  duration: 90,  useNativeDriver: true }),
        Animated.timing(wiggleAnim, { toValue: -3, duration: 90,  useNativeDriver: true }),
        Animated.timing(wiggleAnim, { toValue: 0,  duration: 90,  useNativeDriver: true }),
      ]).start();
    }
  }, [state, wiggleAnim]);

  return (
    <View style={[{ alignItems: 'center', gap: 8 }, style]}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }, { translateX: wiggleAnim }] }}>
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
