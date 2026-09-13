/**
 * SessionChangeBadge
 *
 * Small inline tag shown on session rows in the Plan screen when a session
 * was placed or modified by the adaptation engine. Maps sessionKind to a
 * label and a Tag tone.
 */

import { Tag } from '@/components/ui/PillTag';

type SessionKind = 'core' | 'repeat' | 'regress' | 'advance' | 'detour' | 'proofing';

interface SessionChangeBadgeProps {
  kind: SessionKind;
}

type TagTone = 'neutral' | 'accent' | 'warning' | 'danger';

const BADGES: Record<SessionKind, { label: string; tone: TagTone }> = {
  core: { label: 'Core', tone: 'neutral' },
  repeat: { label: 'Repeat', tone: 'neutral' },
  regress: { label: 'Adjusted', tone: 'accent' },
  advance: { label: 'Adjusted', tone: 'accent' },
  detour: { label: 'Moved', tone: 'warning' },
  proofing: { label: 'Proofing', tone: 'neutral' },
};

export function SessionChangeBadge({ kind }: SessionChangeBadgeProps) {
  const badge = BADGES[kind] ?? BADGES.core;
  return <Tag label={badge.label} tone={badge.tone} />;
}
