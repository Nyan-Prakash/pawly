import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import { colors } from '@/constants/colors';

export type BehaviorIllustration = 'sit' | 'down' | 'stay' | 'recall' | 'heel';

type IllustrationPanelProps = {
  behavior: BehaviorIllustration;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

const fur = colors.mascot.fur;
const furDark = colors.mascot.furDark;
const green = colors.brand.primary;

function SitIllustration({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 0.75} viewBox="0 0 160 120">
      {/* Body (seated) */}
      <Ellipse cx={80} cy={85} rx={22} ry={18} fill={fur} />
      {/* Rear haunches */}
      <Ellipse cx={68} cy={95} rx={14} ry={10} fill={furDark} />
      <Ellipse cx={92} cy={95} rx={14} ry={10} fill={furDark} />
      {/* Chest / front legs */}
      <Rect x={72} y={75} width={16} height={22} rx={8} fill={fur} />
      {/* Head */}
      <Ellipse cx={80} cy={55} rx={22} ry={20} fill={fur} />
      {/* Ears */}
      <Ellipse cx={64} cy={44} rx={9} ry={12} fill={furDark} />
      <Ellipse cx={96} cy={44} rx={9} ry={12} fill={furDark} />
      {/* Eyes */}
      <Circle cx={74} cy={52} r={4} fill="#111827" />
      <Circle cx={86} cy={52} r={4} fill="#111827" />
      <Circle cx={75} cy={51} r={1.5} fill="white" />
      <Circle cx={87} cy={51} r={1.5} fill="white" />
      {/* Nose */}
      <Ellipse cx={80} cy={60} rx={3.5} ry={2.5} fill="#3A3A3A" />
      {/* Tail up */}
      <Path d="M 98 80 Q 115 70 112 58" stroke={furDark} strokeWidth={6} strokeLinecap="round" fill="none" />
      {/* Ground line */}
      <Path d="M 40 108 L 120 108" stroke={colors.border.default} strokeWidth={2} strokeLinecap="round" />
      {/* Paw prints */}
      <Circle cx={62} cy={108} r={3} fill={green} opacity={0.5} />
      <Circle cx={98} cy={108} r={3} fill={green} opacity={0.5} />
    </Svg>
  );
}

function DownIllustration({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 0.75} viewBox="0 0 160 120">
      {/* Body lying flat */}
      <Ellipse cx={95} cy={90} rx={38} ry={14} fill={fur} />
      {/* Front legs extended */}
      <Ellipse cx={60} cy={92} rx={18} ry={8} fill={furDark} />
      {/* Head resting */}
      <Ellipse cx={48} cy={76} rx={20} ry={18} fill={fur} />
      {/* Ears drooped */}
      <Ellipse cx={36} cy={70} rx={8} ry={12} fill={furDark} transform="rotate(-15 36 70)" />
      <Ellipse cx={60} cy={68} rx={8} ry={12} fill={furDark} transform="rotate(15 60 68)" />
      {/* Eyes (looking forward) */}
      <Circle cx={44} cy={74} r={4} fill="#111827" />
      <Circle cx={56} cy={74} r={4} fill="#111827" />
      <Circle cx={45} cy={73} r={1.5} fill="white" />
      <Circle cx={57} cy={73} r={1.5} fill="white" />
      {/* Nose */}
      <Ellipse cx={50} cy={82} rx={3.5} ry={2.5} fill="#3A3A3A" />
      {/* Tail */}
      <Path d="M 132 85 Q 145 78 142 68" stroke={furDark} strokeWidth={6} strokeLinecap="round" fill="none" />
      {/* Ground line */}
      <Path d="M 20 104 L 150 104" stroke={colors.border.default} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function StayIllustration({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 0.75} viewBox="0 0 160 120">
      {/* Same as sit */}
      <Ellipse cx={95} cy={85} rx={22} ry={18} fill={fur} />
      <Ellipse cx={83} cy={95} rx={14} ry={10} fill={furDark} />
      <Ellipse cx={107} cy={95} rx={14} ry={10} fill={furDark} />
      <Rect x={87} y={75} width={16} height={22} rx={8} fill={fur} />
      <Ellipse cx={95} cy={55} rx={22} ry={20} fill={fur} />
      <Ellipse cx={79} cy={44} rx={9} ry={12} fill={furDark} />
      <Ellipse cx={111} cy={44} rx={9} ry={12} fill={furDark} />
      <Circle cx={89} cy={52} r={4} fill="#111827" />
      <Circle cx={101} cy={52} r={4} fill="#111827" />
      <Circle cx={90} cy={51} r={1.5} fill="white" />
      <Circle cx={102} cy={51} r={1.5} fill="white" />
      <Ellipse cx={95} cy={60} rx={3.5} ry={2.5} fill="#3A3A3A" />
      {/* Human hand "stay" signal */}
      <Rect x={30} y={40} width={22} height={30} rx={4} fill={green} opacity={0.85} />
      {/* Fingers */}
      <Rect x={32} y={28} width={5} height={16} rx={2.5} fill={green} opacity={0.85} />
      <Rect x={39} y={25} width={5} height={19} rx={2.5} fill={green} opacity={0.85} />
      <Rect x={46} y={28} width={5} height={16} rx={2.5} fill={green} opacity={0.85} />
      {/* Ground */}
      <Path d="M 55 108 L 140 108" stroke={colors.border.default} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function RecallIllustration({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 0.75} viewBox="0 0 160 120">
      {/* Dog running toward viewer */}
      <Ellipse cx={120} cy={78} rx={20} ry={15} fill={fur} />
      {/* Running legs */}
      <Path d="M 104 88 Q 98 100 92 96" stroke={furDark} strokeWidth={7} strokeLinecap="round" fill="none" />
      <Path d="M 112 90 Q 108 103 102 100" stroke={furDark} strokeWidth={7} strokeLinecap="round" fill="none" />
      <Path d="M 130 88 Q 136 100 142 96" stroke={furDark} strokeWidth={7} strokeLinecap="round" fill="none" />
      <Path d="M 122 90 Q 126 103 132 100" stroke={furDark} strokeWidth={7} strokeLinecap="round" fill="none" />
      {/* Head */}
      <Ellipse cx={105} cy={64} rx={18} ry={16} fill={fur} />
      <Ellipse cx={92}  cy={54} rx={8} ry={11} fill={furDark} />
      <Ellipse cx={116} cy={54} rx={8} ry={11} fill={furDark} />
      <Circle cx={101} cy={62} r={3.5} fill="#111827" />
      <Circle cx={110} cy={62} r={3.5} fill="#111827" />
      <Circle cx={102} cy={61} r={1.2} fill="white" />
      <Circle cx={111} cy={61} r={1.2} fill="white" />
      <Ellipse cx={105} cy={69} rx={3} ry={2} fill="#3A3A3A" />
      {/* Dashed arrow line pointing toward dog */}
      <Path
        d="M 20 80 L 85 80"
        stroke={green}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray="6,5"
        fill="none"
      />
      {/* Arrow head */}
      <Path d="M 82 74 L 90 80 L 82 86" stroke={green} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Ground */}
      <Path d="M 10 104 L 150 104" stroke={colors.border.default} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function HeelIllustration({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 0.75} viewBox="0 0 160 120">
      {/* Human legs (left side) */}
      <Rect x={40} y={50} width={14} height={50} rx={7} fill={colors.bg.surfaceAlt} />
      <Rect x={58} y={50} width={14} height={50} rx={7} fill={colors.bg.surfaceAlt} />
      {/* Shoes */}
      <Ellipse cx={47} cy={102} rx={10} ry={5} fill={colors.border.default} />
      <Ellipse cx={65} cy={102} rx={10} ry={5} fill={colors.border.default} />
      {/* Leash */}
      <Path d="M 52 58 Q 80 45 95 62" stroke={green} strokeWidth={2.5} strokeLinecap="round" fill="none" />
      {/* Dog body */}
      <Ellipse cx={105} cy={82} rx={20} ry={14} fill={fur} />
      {/* Dog head */}
      <Ellipse cx={92} cy={68} rx={18} ry={16} fill={fur} />
      <Ellipse cx={79} cy={58} rx={8} ry={11} fill={furDark} />
      <Ellipse cx={103} cy={58} rx={8} ry={11} fill={furDark} />
      <Circle cx={88} cy={66} r={3.5} fill="#111827" />
      <Circle cx={97} cy={66} r={3.5} fill="#111827" />
      <Circle cx={89} cy={65} r={1.2} fill="white" />
      <Circle cx={98} cy={65} r={1.2} fill="white" />
      <Ellipse cx={92} cy={73} rx={3} ry={2} fill="#3A3A3A" />
      {/* Dog legs */}
      <Rect x={96}  y={92} width={8} height={18} rx={4} fill={furDark} />
      <Rect x={110} y={92} width={8} height={18} rx={4} fill={furDark} />
      {/* Tail */}
      <Path d="M 125 78 Q 140 68 136 58" stroke={furDark} strokeWidth={6} strokeLinecap="round" fill="none" />
      {/* Leash collar attachment */}
      <Circle cx={95} cy={62} r={3} fill={green} />
      {/* Ground */}
      <Path d="M 25 108 L 150 108" stroke={colors.border.default} strokeWidth={2} strokeLinecap="round" />
      {/* Direction arrows */}
      <Path d="M 20 90 L 30 90" stroke={green} strokeWidth={2} strokeLinecap="round" />
      <Path d="M 28 86 L 34 90 L 28 94" stroke={green} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function IllustrationPanel({ behavior, size = 160, style }: IllustrationPanelProps) {
  const illustrations: Record<BehaviorIllustration, React.ReactNode> = {
    sit:    <SitIllustration    size={size} />,
    down:   <DownIllustration   size={size} />,
    stay:   <StayIllustration   size={size} />,
    recall: <RecallIllustration size={size} />,
    heel:   <HeelIllustration   size={size} />,
  };

  return (
    <View style={[{ alignItems: 'center' }, style]}>
      {illustrations[behavior]}
    </View>
  );
}
