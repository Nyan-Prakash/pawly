// ─────────────────────────────────────────────────────────────────────────────
// TrackingQualityBadge
//
// Small pill that shows the current tracking quality level.
// Designed to sit in the top corner of the camera overlay — dark background
// so it's always readable against the camera feed.
// ─────────────────────────────────────────────────────────────────────────────

import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { TrackingQuality } from '@/types/pose';

interface TrackingQualityBadgeProps {
  quality: TrackingQuality | null;
}

const QUALITY_CONFIG: Record<
  TrackingQuality,
  { label: string; dot: string; bg: string; text: string }
> = {
  good: { label: 'Tracking good',    dot: '#4ADE80', bg: 'rgba(0,0,0,0.55)', text: '#fff' },
  fair: { label: 'Tracking fair',    dot: '#FBBF24', bg: 'rgba(0,0,0,0.55)', text: '#fff' },
  poor: { label: 'Tracking poor',    dot: '#F87171', bg: 'rgba(0,0,0,0.65)', text: '#fff' },
};

export function TrackingQualityBadge({ quality }: TrackingQualityBadgeProps) {
  if (!quality) return null;

  const cfg = QUALITY_CONFIG[quality];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: cfg.bg,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 99,
      }}
    >
      {/* Status dot */}
      <View
        style={{
          width: 7,
          height: 7,
          borderRadius: 99,
          backgroundColor: cfg.dot,
        }}
      />
      <Text style={{ fontSize: 12, fontWeight: '600', color: cfg.text }}>
        {cfg.label}
      </Text>
    </View>
  );
}
