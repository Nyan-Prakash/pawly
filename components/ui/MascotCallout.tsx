import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';

export type MascotState = 'happy' | 'encouraging' | 'thinking' | 'celebrating' | 'waiting';

type MascotCalloutProps = {
  state?: MascotState;
  size?: number;
  /** A short line the mascot says, in a speech bubble. */
  callout?: string;
  /** `below` (default, for empty states) or `right` (for a greeting row). */
  calloutPlacement?: 'below' | 'right';
  style?: StyleProp<ViewStyle>;
};

/**
 * The Pawly mascot, drawn from the app icon: cream face, brown patch over
 * the right eye, big floppy ears, brown body with a cream belly. Expressions
 * change only the eyes, mouth and head tilt so it always reads as the same dog.
 */
function MascotSvg({ state, size }: { state: MascotState; size: number }) {
  const m = colors.mascot;
  const isWaiting = state === 'waiting';
  const isCelebrating = state === 'celebrating';
  const isThinking = state === 'thinking';
  const isEncouraging = state === 'encouraging';

  const tilt: Record<MascotState, number> = { happy: -6, encouraging: -8, thinking: 4, celebrating: -4, waiting: 0 };
  const eyeY = 47;
  const lx = 38;
  const rx = 62;

  const mouth: Record<MascotState, string> = {
    happy: 'M 43 63 Q 50 69 57 63',
    encouraging: 'M 43 63 Q 50 70 57 63',
    thinking: 'M 45 65 Q 50 66 55 65',
    celebrating: 'M 41 62 Q 50 73 59 62',
    waiting: 'M 45 64 Q 50 67 55 64',
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id="head">
          <Ellipse cx={50} cy={48} rx={30} ry={27} />
        </ClipPath>
        <ClipPath id="frame">
          <Rect x={0} y={0} width={100} height={100} />
        </ClipPath>
      </Defs>

      {isThinking ? (
        <>
          <Circle cx={84} cy={20} r={5} fill={colors.bg.fill} />
          <Circle cx={91} cy={11} r={3.2} fill={colors.bg.fill} />
          <Circle cx={95} cy={4} r={1.8} fill={colors.bg.fill} />
        </>
      ) : null}

      {isCelebrating ? (
        <>
          <Rect x={8} y={14} width={6} height={6} rx={1.5} fill={colors.status.warning} transform="rotate(20 11 17)" />
          <Rect x={86} y={8} width={5} height={5} rx={1} fill={colors.accent} transform="rotate(-18 88 10)" />
          <Rect x={14} y={30} width={4} height={4} rx={1} fill={colors.accent} transform="rotate(35 16 32)" />
          <Rect x={82} y={28} width={5} height={5} rx={1.5} fill={colors.status.warning} transform="rotate(-25 84 30)" />
          <Circle cx={50} cy={6} r={2.5} fill={colors.accent} />
        </>
      ) : null}

      {/* Body sits behind the head and runs off the bottom of the frame. */}
      <G clipPath="url(#frame)">
        <Ellipse cx={54} cy={100} rx={34} ry={30} fill={m.brown} />
        <Ellipse cx={56} cy={104} rx={13} ry={14} fill={m.cream} />
      </G>

      <G transform={`rotate(${tilt[state]} 50 50)`}>
        {/* Ears: one hangs down on the left, one sweeps up to the right, as in the icon. */}
        <Path d="M 30 30 C 14 34 8 58 16 70 C 20 76 30 74 33 66 C 36 56 34 42 30 30 Z" fill={m.brown} />
        <Path d="M 66 26 C 78 18 96 26 95 42 C 94 52 84 56 76 50 C 70 45 66 36 66 26 Z" fill={m.brown} />

        {/* Head */}
        <Ellipse cx={50} cy={48} rx={30} ry={27} fill={m.cream} />
        {/* Patch over the right eye */}
        <Ellipse cx={66} cy={42} rx={15} ry={17} fill={m.patch} clipPath="url(#head)" />

        {/* Eyes */}
        {isWaiting ? (
          <>
            <Path d={`M ${lx - 5} ${eyeY} Q ${lx} ${eyeY + 3} ${lx + 5} ${eyeY}`} stroke={m.eye} strokeWidth={2.4} strokeLinecap="round" fill="none" />
            <Path d={`M ${rx - 5} ${eyeY} Q ${rx} ${eyeY + 3} ${rx + 5} ${eyeY}`} stroke={m.eye} strokeWidth={2.4} strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <Ellipse cx={lx} cy={eyeY} rx={5.2} ry={6} fill={m.eye} />
            <Circle cx={lx - 1.6} cy={eyeY - 2.4} r={1.8} fill={m.highlight} />
            {isEncouraging ? (
              <Path d={`M ${rx - 5} ${eyeY + 1} Q ${rx} ${eyeY - 4} ${rx + 5} ${eyeY + 1}`} stroke={m.eye} strokeWidth={2.8} strokeLinecap="round" fill="none" />
            ) : (
              <>
                <Ellipse cx={rx} cy={eyeY} rx={5.2} ry={6} fill={m.eye} />
                <Circle cx={rx - 1.6} cy={eyeY - 2.4} r={1.8} fill={m.highlight} />
              </>
            )}
          </>
        )}

        {/* Cheeks, nose, mouth */}
        <Ellipse cx={30} cy={58} rx={4.5} ry={2.6} fill={m.blush} opacity={0.5} />
        <Ellipse cx={70} cy={58} rx={4.5} ry={2.6} fill={m.blush} opacity={0.5} />
        <Ellipse cx={50} cy={57.5} rx={4.6} ry={3.4} fill={m.nose} />
        <Path d={mouth[state]} stroke={m.nose} strokeWidth={2.4} strokeLinecap="round" fill="none" />
        {isCelebrating ? (
          <Path d="M 46 66 L 54 66 L 54 70 C 54 74 46 74 46 70 Z" fill={m.tongue} />
        ) : null}
      </G>
    </Svg>
  );
}

function Bubble({ text, placement }: { text: string; placement: 'below' | 'right' }) {
  return (
    <View
      style={{
        backgroundColor: colors.bg.surface,
        borderRadius: radii.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        flexShrink: 1,
        ...(placement === 'right' ? { borderBottomLeftRadius: spacing.xs } : { borderTopLeftRadius: spacing.xs }),
      }}
    >
      <Text variant="body" style={{ textAlign: placement === 'below' ? 'center' : 'left' }}>
        {text}
      </Text>
    </View>
  );
}

export function MascotCallout({ state = 'happy', size = 120, callout, calloutPlacement = 'below', style }: MascotCalloutProps) {
  if (callout && calloutPlacement === 'right') {
    return (
      <View style={[{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm }, style]}>
        <MascotSvg state={state} size={size} />
        <View style={{ flex: 1, paddingBottom: size * 0.2 }}>
          <Bubble text={callout} placement="right" />
        </View>
      </View>
    );
  }
  return (
    <View style={[{ alignItems: 'center', gap: spacing.sm }, style]}>
      <MascotSvg state={state} size={size} />
      {callout ? (
        <View style={{ maxWidth: size * 2 }}>
          <Bubble text={callout} placement="below" />
        </View>
      ) : null}
    </View>
  );
}
