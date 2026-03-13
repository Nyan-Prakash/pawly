import { forwardRef } from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import type { Milestone } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// ShareCard
// Renders a 1:1 square shareable milestone card.
// Wrap in a ref and capture with react-native-view-shot.
// ─────────────────────────────────────────────────────────────────────────────

interface ShareCardProps {
  milestone: Milestone;
  dogName: string;
}

export const ShareCard = forwardRef<View, ShareCardProps>(({ milestone, dogName }, ref) => {
  function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return (
    <View
      ref={ref}
      style={{
        width: 360,
        height: 360,
        overflow: 'hidden',
        borderRadius: 24,
      }}
    >
      <LinearGradient
        colors={['#2D7D6F', '#1A5C52', '#0F3D36']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}
      >
        {/* Subtle confetti dots overlay */}
        <ConfettiPattern />

        {/* Dog name */}
        <Text
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: 15,
            fontWeight: '600',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          {dogName}
        </Text>

        {/* Milestone emoji */}
        <View style={{ marginBottom: 12 }}>
          <AppIcon name={milestone.emoji as AppIconName} size={72} color="#FFFFFF" />
        </View>

        {/* Title */}
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 26,
            fontWeight: '800',
            textAlign: 'center',
            lineHeight: 32,
            marginBottom: 8,
          }}
        >
          {milestone.title}
        </Text>

        {/* Description */}
        <Text
          style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: 14,
            textAlign: 'center',
            lineHeight: 20,
            marginBottom: 24,
          }}
        >
          {milestone.description}
        </Text>

        {/* Date achieved */}
        <Text
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 12,
            marginBottom: 28,
          }}
        >
          {formatDate(milestone.achievedAt)}
        </Text>

        {/* Pawly wordmark */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <AppIcon name="paw" size={16} color="rgba(255,255,255,0.6)" />
          <Text
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 14,
              fontWeight: '700',
              letterSpacing: 1,
            }}
          >
            Pawly
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
});

ShareCard.displayName = 'ShareCard';

// ─────────────────────────────────────────────────────────────────────────────
// Confetti dot pattern overlay
// ─────────────────────────────────────────────────────────────────────────────

function ConfettiPattern() {
  const dots = [
    { top: 20, left: 30, size: 6, opacity: 0.15 },
    { top: 40, left: 320, size: 4, opacity: 0.12 },
    { top: 80, left: 10, size: 8, opacity: 0.1 },
    { top: 100, left: 340, size: 5, opacity: 0.15 },
    { top: 280, left: 20, size: 7, opacity: 0.12 },
    { top: 300, left: 330, size: 5, opacity: 0.1 },
    { top: 320, left: 60, size: 4, opacity: 0.15 },
    { top: 60, left: 180, size: 3, opacity: 0.08 },
    { top: 200, left: 10, size: 5, opacity: 0.1 },
    { top: 180, left: 350, size: 4, opacity: 0.12 },
  ];

  return (
    <>
      {dots.map((dot, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: dot.top,
            left: dot.left,
            width: dot.size,
            height: dot.size,
            borderRadius: dot.size / 2,
            backgroundColor: `rgba(255,255,255,${dot.opacity})`,
          }}
        />
      ))}
    </>
  );
}
