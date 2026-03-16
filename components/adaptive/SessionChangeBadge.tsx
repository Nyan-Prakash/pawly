/**
 * SessionChangeBadge
 *
 * Small inline badge shown on session rows in the Plan screen
 * when a session was placed or modified by the adaptation engine.
 *
 * Maps sessionKind → human label + color.
 */

import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';

type SessionKind = 'core' | 'repeat' | 'regress' | 'advance' | 'detour' | 'proofing';

interface SessionChangeBadgeProps {
  kind: SessionKind;
}

interface BadgeStyle {
  label: string;
  bg: string;
  fg: string;
}

const BADGE_STYLES: Record<SessionKind, BadgeStyle> = {
  core:     { label: 'Core',         bg: `${colors.brand.primary}14`,  fg: colors.brand.primary },
  repeat:   { label: 'Repeat',       bg: `${colors.brand.primary}14`,  fg: colors.brand.primary },
  regress:  { label: 'Easier',       bg: `${colors.brand.coach}12`,    fg: colors.brand.coach },
  advance:  { label: 'Advance',      bg: `${colors.success}14`,        fg: colors.success },
  detour:   { label: 'Reset Focus',  bg: `${colors.brand.secondary}16`, fg: colors.brand.secondary },
  proofing: { label: 'Proofing',     bg: '#F3E8FF',                    fg: '#7C3AED' },
};

export function SessionChangeBadge({ kind }: SessionChangeBadgeProps) {
  const style = BADGE_STYLES[kind] ?? BADGE_STYLES.core;

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: style.bg,
        borderRadius: radii.pill,
        paddingHorizontal: 8,
        paddingVertical: 3,
      }}
    >
      <Text style={{ fontSize: 10, fontWeight: '700', color: style.fg }}>
        {style.label}
      </Text>
    </View>
  );
}
