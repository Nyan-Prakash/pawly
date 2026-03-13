import { Share, TouchableOpacity, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import type { Milestone, MilestoneDefinition } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type MilestoneCardVariant = 'achieved' | 'locked' | 'next';

interface MilestoneCardProps {
  milestone?: Milestone;
  definition?: MilestoneDefinition;
  variant: MilestoneCardVariant;
  onShare?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Horizontal Card (used in progress screen scroll)
// ─────────────────────────────────────────────────────────────────────────────

export function MilestoneCard({ milestone, definition, variant, onShare }: MilestoneCardProps) {
  const icon = (milestone?.emoji ?? definition?.emoji ?? 'trophy') as AppIconName;
  const title = milestone?.title ?? definition?.title ?? '';
  const achievedAt = milestone?.achievedAt;

  const isAchieved = variant === 'achieved';
  const isNext = variant === 'next';
  const isLocked = variant === 'locked';

  function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  async function handleShare() {
    if (onShare) {
      onShare();
      return;
    }
    if (!milestone) return;
    try {
      await Share.share({
        message: `${title}\n\nTrained with Pawly`,
        title,
      });
    } catch {
      // user cancelled
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={isAchieved ? 0.75 : 1}
      onPress={isAchieved ? handleShare : undefined}
      style={{
        width: 160,
        backgroundColor: isLocked ? '#F3F4F6' : colors.bg.surface,
        borderRadius: radii.lg,
        padding: spacing.md,
        borderWidth: isNext ? 2 : 1,
        borderColor: isNext
          ? colors.brand.primary
          : isAchieved
          ? '#FDE68A'       // gold border for achieved
          : colors.border.default,
        opacity: isLocked ? 0.55 : 1,
        alignItems: 'center',
        gap: spacing.xs,
        minHeight: 148,
        justifyContent: 'center',
      }}
    >
      {/* Lock icon for locked */}
      {isLocked && (
        <View style={{ position: 'absolute', top: spacing.sm, right: spacing.sm }}>
          <AppIcon name="lock-closed" size={12} color={colors.text.secondary} />
        </View>
      )}

      {/* Gold star for achieved */}
      {isAchieved && (
        <View style={{ position: 'absolute', top: spacing.sm, right: spacing.sm }}>
          <AppIcon name="star" size={12} color="#B45309" />
        </View>
      )}

      {/* "Almost there" badge */}
      {isNext && (
        <View
          style={{
            backgroundColor: '#DCFCE7',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: radii.pill,
            marginBottom: 2,
          }}
        >
          <Text style={{ fontSize: 10, color: colors.brand.primary, fontWeight: '700' }}>
            ALMOST THERE
          </Text>
        </View>
      )}

      <AppIcon name={icon} size={36} color={isLocked ? colors.text.secondary : colors.text.primary} />

      <Text
        style={{
          fontSize: 13,
          fontWeight: '700',
          textAlign: 'center',
          color: isLocked ? colors.text.secondary : colors.text.primary,
        }}
        numberOfLines={2}
      >
        {title}
      </Text>

      {isAchieved && achievedAt && (
        <Text
          style={{
            fontSize: 11,
            color: colors.text.secondary,
            textAlign: 'center',
          }}
        >
          {formatDate(achievedAt)}
        </Text>
      )}

      {isAchieved && (
        <View
          style={{
            backgroundColor: '#FEF3C7',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: radii.pill,
            marginTop: 2,
          }}
        >
          <Text style={{ fontSize: 10, color: '#92400E', fontWeight: '700' }}>
            TAP TO SHARE
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Grid Card (used in milestones.tsx full-screen grid)
// ─────────────────────────────────────────────────────────────────────────────

export function MilestoneGridCard({
  milestone,
  definition,
  variant,
  onShare,
}: MilestoneCardProps) {
  const icon = (milestone?.emoji ?? definition?.emoji ?? 'trophy') as AppIconName;
  const title = milestone?.title ?? definition?.title ?? '';
  const achievedAt = milestone?.achievedAt;

  const isAchieved = variant === 'achieved';
  const isLocked = variant === 'locked';

  function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  async function handleShare() {
    if (onShare) {
      onShare();
      return;
    }
    if (!milestone) return;
    try {
      await Share.share({
        message: `${title}\n\nTrained with Pawly`,
      });
    } catch {
      // user cancelled
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={isAchieved ? 0.75 : 1}
      onPress={isAchieved ? handleShare : undefined}
      style={{
        flex: 1,
        backgroundColor: isLocked ? '#F9FAFB' : colors.bg.surface,
        borderRadius: radii.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: isAchieved ? '#FDE68A' : colors.border.default,
        opacity: isLocked ? 0.5 : 1,
        alignItems: 'center',
        gap: spacing.xs,
        minHeight: 130,
        justifyContent: 'center',
        margin: spacing.xs,
      }}
    >
      {isLocked && (
        <View style={{ position: 'absolute', top: spacing.sm, right: spacing.sm }}>
          <AppIcon name="lock-closed" size={12} color={colors.text.secondary} />
        </View>
      )}

      <View style={{ opacity: isLocked ? 0.4 : 1 }}>
        <AppIcon name={icon} size={32} color={colors.text.primary} />
      </View>

      <Text
        style={{
          fontSize: 12,
          fontWeight: '700',
          textAlign: 'center',
          color: isLocked ? colors.text.secondary : colors.text.primary,
        }}
        numberOfLines={2}
      >
        {title}
      </Text>

      {isAchieved && achievedAt && (
        <Text style={{ fontSize: 10, color: colors.text.secondary }}>
          {formatDate(achievedAt)}
        </Text>
      )}
    </TouchableOpacity>
  );
}
