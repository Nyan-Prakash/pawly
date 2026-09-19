import { Image, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';

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

// The icon's dog with its background keyed out (assets/mascot.png, 600px,
// generated from assets/app-icon.png). Using the real artwork means the
// in-app mascot is exactly the dog on the home screen.
const MASCOT = require('@/assets/mascot.png');

/**
 * The Pawly mascot. The artwork is a bitmap, so the dog itself never changes;
 * a state adds something around it: thought dots when thinking, confetti when
 * celebrating. The other states exist so call sites can name the moment.
 */
function Mascot({ state, size }: { state: MascotState; size: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <Image source={MASCOT} style={{ width: size, height: size }} resizeMode="contain" accessibilityIgnoresInvertColors />
      {state === 'thinking' || state === 'celebrating' ? (
        <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
          {state === 'thinking' ? (
            <>
              <Circle cx={86} cy={22} r={5} fill={colors.bg.fill} />
              <Circle cx={93} cy={12} r={3.2} fill={colors.bg.fill} />
              <Circle cx={97} cy={5} r={1.8} fill={colors.bg.fill} />
            </>
          ) : (
            <>
              <Rect x={4} y={10} width={6} height={6} rx={1.5} fill={colors.status.warning} transform="rotate(20 7 13)" />
              <Rect x={88} y={4} width={5} height={5} rx={1} fill={colors.accent} transform="rotate(-18 90 6)" />
              <Rect x={10} y={28} width={4} height={4} rx={1} fill={colors.accent} transform="rotate(35 12 30)" />
              <Rect x={90} y={26} width={5} height={5} rx={1.5} fill={colors.status.warning} transform="rotate(-25 92 28)" />
              <Circle cx={50} cy={4} r={2.5} fill={colors.accent} />
            </>
          )}
        </Svg>
      ) : null}
    </View>
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
        <Mascot state={state} size={size} />
        <View style={{ flex: 1, paddingBottom: size * 0.2 }}>
          <Bubble text={callout} placement="right" />
        </View>
      </View>
    );
  }
  return (
    <View style={[{ alignItems: 'center', gap: spacing.sm }, style]}>
      <Mascot state={state} size={size} />
      {callout ? (
        <View style={{ maxWidth: size * 2 }}>
          <Bubble text={callout} placement="below" />
        </View>
      ) : null}
    </View>
  );
}
