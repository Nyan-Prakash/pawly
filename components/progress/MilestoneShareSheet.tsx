import { useRef, useState } from 'react';
import { PixelRatio, Platform, Share, useWindowDimensions, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import {
  MilestoneShareCard,
  SHARE_CARD_HEIGHT,
  SHARE_CARD_WIDTH,
  SHARE_IMAGE_HEIGHT,
  SHARE_IMAGE_WIDTH,
} from '@/components/progress/MilestoneShareCard';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { captureEvent } from '@/lib/analytics';
import type { Milestone } from '@/types';

interface MilestoneShareSheetProps {
  /** The milestone being shared. The sheet is open while this is set. */
  milestone: Milestone | null;
  dogName: string;
  avatarUrl?: string | null;
  streakDays: number;
  totalSessions: number;
  /** The text share, used when the image cannot be captured. */
  onShareText: (milestone: Milestone) => Promise<void>;
  onClose: () => void;
}

// view-shot sizes the output in points on iOS and in pixels on Android.
function captureSize() {
  const ratio = Platform.OS === 'ios' ? PixelRatio.get() : 1;
  return { width: SHARE_IMAGE_WIDTH / ratio, height: SHARE_IMAGE_HEIGHT / ratio };
}

/** Preview of the share image with the one action that sends it. */
export function MilestoneShareSheet({
  milestone: openMilestone,
  dogName,
  avatarUrl,
  streakDays,
  totalSessions,
  onShareText,
  onClose,
}: MilestoneShareSheetProps) {
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const { width: windowWidth } = useWindowDimensions();

  // Keep the last milestone on screen while the sheet slides away.
  const lastMilestone = useRef<Milestone | null>(null);
  if (openMilestone) lastMilestone.current = openMilestone;
  const milestone = openMilestone ?? lastMilestone.current;

  // The card is laid out at a fixed size so every capture matches; on a
  // narrow phone the preview is scaled down around it.
  const scale = Math.min(1, (windowWidth - spacing.xl * 2) / SHARE_CARD_WIDTH);

  async function handleShare() {
    if (!milestone || isSharing) return;
    setIsSharing(true);
    try {
      let url: string | null = null;
      try {
        const uri = await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile', ...captureSize() });
        url = uri.startsWith('file://') ? uri : `file://${uri}`;
      } catch (error) {
        console.warn('[MilestoneShareSheet] capture failed:', error);
      }

      if (!url) {
        await onShareText(milestone);
        return;
      }

      const result = await Share.share({ url });
      if (result.action === Share.sharedAction) {
        captureEvent('milestone_shared', { milestoneId: milestone.milestoneId, format: 'image' });
        onClose();
      }
    } catch {
      // cancelled
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <BottomSheet visible={!!openMilestone} onClose={onClose} title="Share milestone">
      <View style={{ flex: 1, justifyContent: 'space-between', gap: spacing.xl }}>
        <View
          style={{
            alignSelf: 'center',
            width: SHARE_CARD_WIDTH * scale,
            height: SHARE_CARD_HEIGHT * scale,
            borderRadius: radii.md,
            overflow: 'hidden',
          }}
        >
          {milestone ? (
            <View style={{ transform: [{ scale }], transformOrigin: 'top left' }}>
              <MilestoneShareCard
                ref={cardRef}
                milestone={milestone}
                dogName={dogName}
                avatarUrl={avatarUrl}
                streakDays={streakDays}
                totalSessions={totalSessions}
              />
            </View>
          ) : null}
        </View>
        <Button label="Share image" icon="share-outline" loading={isSharing} onPress={handleShare} />
      </View>
    </BottomSheet>
  );
}
