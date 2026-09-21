import { forwardRef, useState } from 'react';
import { Image, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { lightColors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import type { Milestone } from '@/types';

/** 4:5, the portrait ratio feeds and stories both accept. Captured at 1080 x 1350. */
export const SHARE_CARD_WIDTH = 300;
export const SHARE_CARD_HEIGHT = 375;
export const SHARE_IMAGE_WIDTH = 1080;
export const SHARE_IMAGE_HEIGHT = 1350;

const AVATAR_SIZE = 88;

// The shared image always uses the light palette, whatever theme the app is
// in, so every card out in the world looks the same.
const palette = lightColors;

interface MilestoneShareCardProps {
  milestone: Milestone;
  dogName: string;
  avatarUrl?: string | null;
  /** Current session streak in days. Left out below two. */
  streakDays: number;
  totalSessions: number;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * The image a reached milestone is shared as. Square-cornered on purpose: the
 * capture is the whole rectangle, and the preview rounds it from outside.
 * Text does not scale with Dynamic Type because the canvas is a fixed size.
 * The ref goes on the root view for `captureRef`.
 */
export const MilestoneShareCard = forwardRef<View, MilestoneShareCardProps>(function MilestoneShareCard(
  { milestone, dogName, avatarUrl, streakDays, totalSessions },
  ref
) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const icon = (milestone.emoji || 'trophy-outline') as AppIconName;
  const showStreak = streakDays >= 2;
  const showSessions = totalSessions > 0;

  return (
    <View
      ref={ref}
      collapsable={false}
      style={{
        width: SHARE_CARD_WIDTH,
        height: SHARE_CARD_HEIGHT,
        backgroundColor: palette.bg.app,
        padding: spacing.xl,
        justifyContent: 'space-between',
      }}
    >
      <View style={{ gap: spacing.lg }}>
        <View
          style={{
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            borderRadius: radii.full,
            backgroundColor: palette.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {avatarUrl && !avatarFailed ? (
            <Image
              source={{ uri: avatarUrl }}
              onError={() => setAvatarFailed(true)}
              style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
              accessibilityIgnoresInvertColors
            />
          ) : (
            <AppIcon name={icon} size={40} color={palette.accent} />
          )}
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text variant="captionStrong" color={palette.accent} allowFontScaling={false}>
            Milestone reached
          </Text>
          <Text variant="display" color={palette.text.primary} numberOfLines={2} allowFontScaling={false}>
            {milestone.title}
          </Text>
          <Text variant="body" color={palette.text.secondary} numberOfLines={1} allowFontScaling={false}>
            {dogName}, {formatDate(milestone.achievedAt)}
          </Text>
        </View>
      </View>

      <View style={{ gap: spacing.lg }}>
        {showStreak || showSessions ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: spacing.md,
              minHeight: 44,
              paddingHorizontal: spacing.lg,
              backgroundColor: palette.bg.surface,
              borderRadius: radii.md,
            }}
          >
            {showStreak ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <AppIcon name="flame" size={16} color={palette.status.warning} />
                <Text variant="captionStrong" color={palette.status.warning} allowFontScaling={false}>
                  {streakDays}-day streak
                </Text>
              </View>
            ) : null}
            {showSessions ? (
              <Text
                variant="captionStrong"
                color={palette.text.secondary}
                numberOfLines={1}
                allowFontScaling={false}
                style={{ flexShrink: 1 }}
              >
                {totalSessions} {totalSessions === 1 ? 'session' : 'sessions'}
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <AppIcon name="paw" size={20} color={palette.accent} />
          <Text variant="h2" color={palette.accent} allowFontScaling={false}>
            Pawly
          </Text>
        </View>
      </View>
    </View>
  );
});
