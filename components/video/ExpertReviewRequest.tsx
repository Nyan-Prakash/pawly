import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useAuthStore } from '@/stores/authStore';
import { useVideoStore } from '@/stores/videoStore';

interface Props {
  visible: boolean;
  videoId: string;
  onClose: () => void;
  onConfirmed: () => void;
}

const WHAT_IS_INCLUDED = [
  'Timestamped feedback on your video',
  'One follow-up question answered by your trainer',
  'Reviews usually come back within 48 hours',
  'Next steps tailored to your dog',
];

export function ExpertReviewRequest({ visible, videoId, onClose, onConfirmed }: Props) {
  const userId = useAuthStore((s) => s.user?.id);
  const requestExpertReview = useVideoStore((s) => s.requestExpertReview);
  const getReviewCredits = useVideoStore((s) => s.getReviewCredits);

  const [credits, setCredits] = useState<number | null>(null);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (visible && userId) {
      getReviewCredits(userId).then(setCredits);
    }
  }, [visible, userId]);

  const handleConfirm = async () => {
    if (!userId) return;
    setRequesting(true);
    try {
      await requestExpertReview(videoId, userId);
      onConfirmed();
    } catch {
      Alert.alert('Review not requested', "Couldn't request the review. Check your connection and try again.");
    } finally {
      setRequesting(false);
    }
  };

  const hasCredits = credits !== null && credits > 0;

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Request a trainer review">
      <View style={{ flex: 1, gap: spacing.xl }}>
        <Text variant="body" color={colors.text.secondary}>
          A certified trainer will watch your video and send back personalized feedback.
        </Text>

        <ListGroup>
          {WHAT_IS_INCLUDED.map((item) => (
            <ListRow key={item} icon="checkmark-circle-outline" title={item} />
          ))}
        </ListGroup>

        <ListGroup>
          <ListRow
            icon="ticket-outline"
            iconTone="secondary"
            title="Review credits"
            subtitle={credits === 0 ? 'You have none yet' : undefined}
            trailing={credits === null ? <ActivityIndicator color={colors.text.secondary} /> : String(credits)}
          />
        </ListGroup>

        <View style={{ gap: spacing.sm }}>
          {hasCredits ? (
            <Button label="Use 1 credit for this video" onPress={handleConfirm} loading={requesting} />
          ) : (
            <Button
              label="Get review credits"
              disabled={credits === null}
              onPress={() => {
                onClose();
                // TODO: navigate to paywall / add-on purchase screen (future PR)
                Alert.alert('Review credits', "Review credits aren't available yet.", [{ text: 'OK' }]);
              }}
            />
          )}
          <Button label="Cancel" variant="ghost" size="md" onPress={onClose} disabled={requesting} />
        </View>
      </View>
    </BottomSheet>
  );
}
