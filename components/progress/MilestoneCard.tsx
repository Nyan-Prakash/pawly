import { Pressable, Share, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/PillTag';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import type { Milestone, MilestoneDefinition } from '@/types';

interface MilestoneCardProps {
  /** A reached milestone. */
  milestone?: Milestone;
  /** A milestone that has not been reached yet. */
  definition?: MilestoneDefinition;
  /** Reached cards open the share sheet; pass your own handler to override. */
  onShare?: () => void;
  style?: StyleProp<ViewStyle>;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * A flat card for the milestone grid. The `emoji` field on the data model
 * carries an icon name. Reached: accent icon and a "Reached" tag; not
 * yet: secondary icon and "Not yet".
 */
export function MilestoneCard({ milestone, definition, onShare, style }: MilestoneCardProps) {
  const icon = (milestone?.emoji ?? definition?.emoji ?? 'trophy-outline') as AppIconName;
  const title = milestone?.title ?? definition?.title ?? '';
  const description = milestone?.description ?? definition?.description ?? '';
  const isReached = !!milestone;

  async function handleShare() {
    if (onShare) {
      onShare();
      return;
    }
    if (!milestone) return;
    try {
      await Share.share({ message: `${title}\n\nTrained with Pawly`, title });
    } catch {
      // user cancelled
    }
  }

  const content = (
    <Card style={[{ gap: spacing.sm, minHeight: 132 }, isReached ? { flex: 1 } : style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AppIcon name={icon} size={28} color={isReached ? colors.accent : colors.text.secondary} />
        {isReached ? <Tag label="Reached" tone="accent" /> : null}
      </View>
      <Text variant="bodyStrong" numberOfLines={2}>
        {title}
      </Text>
      <Text variant="caption" numberOfLines={2}>
        {milestone ? formatDate(milestone.achievedAt) : 'Not yet'}
      </Text>
      {!milestone && description ? (
        <Text variant="caption" numberOfLines={2}>
          {description}
        </Text>
      ) : null}
    </Card>
  );

  if (!isReached) return content;

  return (
    <Pressable
      onPress={handleShare}
      accessibilityRole="button"
      accessibilityLabel={`${title}, reached ${formatDate(milestone.achievedAt)}`}
      accessibilityHint="Shares this milestone"
      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }, style]}
    >
      {content}
    </Pressable>
  );
}
