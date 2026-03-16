// ─────────────────────────────────────────────────────────────────────────────
// DogKeypointOverlay
//
// Absolute-positioned SVG overlay that renders a professional, color-coded
// skeleton with glowing joints and segmented bone colors.
//
// Coordinates:
//   Normalized [0,1] keypoints are mapped to pixel space via:
//     px = offsetX + x * containerWidth
//     py = offsetY + y * containerHeight
// ─────────────────────────────────────────────────────────────────────────────

import Svg, { Circle, Defs, Line, RadialGradient, Stop } from 'react-native-svg';

import type { DogKeypointName, PoseObservation } from '@/types/pose';

// ── Visibility threshold ──────────────────────────────────────────────────────

const VISIBILITY_CUTOFF = 0.3;

// ── Segment color palette ─────────────────────────────────────────────────────
// Each body region has a distinct accent color for instant readability.

const COLOR = {
  head:   '#38BDF8', // sky blue   — nose, eyes, ears, chin, throat
  spine:  '#FACC15', // amber gold — withers → tail
  legFL:  '#4ADE80', // green      — front-left leg
  legFR:  '#A78BFA', // purple     — front-right leg
  legRL:  '#F472B6', // pink       — rear-left leg
  legRR:  '#FB923C', // orange     — rear-right leg
} as const;

// ── Skeleton definition with per-edge color ───────────────────────────────────

type SkeletonEdge = { from: DogKeypointName; to: DogKeypointName; color: string };

const SKELETON_EDGES: SkeletonEdge[] = [
  // Front-left leg
  { from: 'front_left_paw',   to: 'front_left_knee',   color: COLOR.legFL },
  { from: 'front_left_knee',  to: 'front_left_elbow',  color: COLOR.legFL },
  // Front-right leg
  { from: 'front_right_paw',  to: 'front_right_knee',  color: COLOR.legFR },
  { from: 'front_right_knee', to: 'front_right_elbow', color: COLOR.legFR },
  // Rear-left leg
  { from: 'rear_left_paw',    to: 'rear_left_knee',    color: COLOR.legRL },
  { from: 'rear_left_knee',   to: 'rear_left_elbow',   color: COLOR.legRL },
  // Rear-right leg
  { from: 'rear_right_paw',   to: 'rear_right_knee',   color: COLOR.legRR },
  { from: 'rear_right_knee',  to: 'rear_right_elbow',  color: COLOR.legRR },
  // Torso spine
  { from: 'front_left_elbow',  to: 'withers',      color: COLOR.spine },
  { from: 'front_right_elbow', to: 'withers',      color: COLOR.spine },
  { from: 'rear_left_elbow',   to: 'withers',      color: COLOR.spine },
  { from: 'rear_right_elbow',  to: 'withers',      color: COLOR.spine },
  { from: 'withers',           to: 'tail_start',   color: COLOR.spine },
  { from: 'tail_start',        to: 'tail_end',     color: COLOR.spine },
  // Neck / head
  { from: 'withers', to: 'throat', color: COLOR.head },
  { from: 'throat',  to: 'chin',   color: COLOR.head },
  { from: 'chin',    to: 'nose',   color: COLOR.head },
  // Eyes → nose
  { from: 'left_eye',  to: 'nose', color: COLOR.head },
  { from: 'right_eye', to: 'nose', color: COLOR.head },
  // Ears
  { from: 'left_ear_base',  to: 'left_ear_tip',  color: COLOR.head },
  { from: 'right_ear_base', to: 'right_ear_tip', color: COLOR.head },
];

// ── Joint style by group ──────────────────────────────────────────────────────

// Joints that represent a paw get a larger dot; head landmarks are medium.
const JOINT_RADIUS: Partial<Record<DogKeypointName, number>> = {
  nose:              7,
  left_eye:          5,
  right_eye:         5,
  left_ear_tip:      4,
  right_ear_tip:     4,
  withers:           7,
  tail_end:          5,
  front_left_paw:    6,
  front_right_paw:   6,
  rear_left_paw:     6,
  rear_right_paw:    6,
};
const DEFAULT_RADIUS = 4.5;

// Which color group each joint belongs to (for dot fill)
const JOINT_COLOR: Partial<Record<DogKeypointName, string>> = {
  nose:               COLOR.head,
  chin:               COLOR.head,
  throat:             COLOR.head,
  left_eye:           COLOR.head,
  right_eye:          COLOR.head,
  left_ear_base:      COLOR.head,
  left_ear_tip:       COLOR.head,
  right_ear_base:     COLOR.head,
  right_ear_tip:      COLOR.head,
  withers:            COLOR.spine,
  tail_start:         COLOR.spine,
  tail_end:           COLOR.spine,
  front_left_paw:     COLOR.legFL,
  front_left_knee:    COLOR.legFL,
  front_left_elbow:   COLOR.legFL,
  front_right_paw:    COLOR.legFR,
  front_right_knee:   COLOR.legFR,
  front_right_elbow:  COLOR.legFR,
  rear_left_paw:      COLOR.legRL,
  rear_left_knee:     COLOR.legRL,
  rear_left_elbow:    COLOR.legRL,
  rear_right_paw:     COLOR.legRR,
  rear_right_knee:    COLOR.legRR,
  rear_right_elbow:   COLOR.legRR,
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface DogKeypointOverlayProps {
  observation: PoseObservation | null;
  containerWidth: number;
  containerHeight: number;
  offsetX?: number;
  offsetY?: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DogKeypointOverlay({
  observation,
  containerWidth,
  containerHeight,
  offsetX = 0,
  offsetY = 0,
}: DogKeypointOverlayProps) {
  if (!observation || containerWidth === 0 || containerHeight === 0) {
    return null;
  }

  // Build a lookup: name → pixel coords (only for visible keypoints).
  const visible = new Map<DogKeypointName, { px: number; py: number; score: number }>();
  for (const kp of observation.keypoints) {
    if (kp.score >= VISIBILITY_CUTOFF) {
      visible.set(kp.name, {
        px: offsetX + kp.x * containerWidth,
        py: offsetY + kp.y * containerHeight,
        score: kp.score,
      });
    }
  }

  return (
    <Svg
      style={{ position: 'absolute', top: 0, left: 0 }}
      width={containerWidth + offsetX}
      height={containerHeight + offsetY}
      pointerEvents="none"
    >
      <Defs>
        {/* Radial gradient for glowing joint rings */}
        <RadialGradient id="glow_green" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor={COLOR.legFL} stopOpacity="0.9" />
          <Stop offset="100%" stopColor={COLOR.legFL} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* ── Bone glow pass (thick, semi-transparent) ── */}
      {SKELETON_EDGES.map(({ from, to, color }) => {
        const a = visible.get(from);
        const b = visible.get(to);
        if (!a || !b) return null;
        return (
          <Line
            key={`glow-${from}-${to}`}
            x1={a.px} y1={a.py}
            x2={b.px} y2={b.py}
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeOpacity={0.18}
          />
        );
      })}

      {/* ── Bone core pass (crisp, bright) ── */}
      {SKELETON_EDGES.map(({ from, to, color }) => {
        const a = visible.get(from);
        const b = visible.get(to);
        if (!a || !b) return null;
        return (
          <Line
            key={`core-${from}-${to}`}
            x1={a.px} y1={a.py}
            x2={b.px} y2={b.py}
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeOpacity={0.92}
          />
        );
      })}

      {/* ── Joint dots: outer glow ring ── */}
      {Array.from(visible.entries()).map(([name, { px, py, score }]) => {
        const r = JOINT_RADIUS[name] ?? DEFAULT_RADIUS;
        const fill = JOINT_COLOR[name] ?? '#FFFFFF';
        // Fade the glow ring with confidence score
        const glowOpacity = Math.min(score * 0.55, 0.45);
        return (
          <Circle
            key={`glow-dot-${name}`}
            cx={px} cy={py}
            r={r + 5}
            fill={fill}
            fillOpacity={glowOpacity}
          />
        );
      })}

      {/* ── Joint dots: dark outline ring ── */}
      {Array.from(visible.entries()).map(([name, { px, py }]) => {
        const r = JOINT_RADIUS[name] ?? DEFAULT_RADIUS;
        const fill = JOINT_COLOR[name] ?? '#FFFFFF';
        return (
          <Circle
            key={`outline-${name}`}
            cx={px} cy={py}
            r={r + 1.5}
            fill="rgba(0,0,0,0.55)"
          />
        );
      })}

      {/* ── Joint dots: filled core ── */}
      {Array.from(visible.entries()).map(([name, { px, py }]) => {
        const r = JOINT_RADIUS[name] ?? DEFAULT_RADIUS;
        const fill = JOINT_COLOR[name] ?? '#FFFFFF';
        return (
          <Circle
            key={`dot-${name}`}
            cx={px} cy={py}
            r={r}
            fill={fill}
            fillOpacity={0.95}
          />
        );
      })}

      {/* ── Joint dots: bright specular highlight ── */}
      {Array.from(visible.entries()).map(([name, { px, py }]) => {
        const r = JOINT_RADIUS[name] ?? DEFAULT_RADIUS;
        return (
          <Circle
            key={`spec-${name}`}
            cx={px - r * 0.25}
            cy={py - r * 0.25}
            r={r * 0.35}
            fill="rgba(255,255,255,0.75)"
          />
        );
      })}
    </Svg>
  );
}
