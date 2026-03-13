import { useState, useEffect } from 'react';
import {
  View,
  Modal,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useVideoStore } from '@/stores/videoStore';
import { useAuthStore } from '@/stores/authStore';

interface Props {
  visible: boolean;
  videoId: string;
  onClose: () => void;
  onConfirmed: () => void;
}

const WHAT_IS_INCLUDED = [
  { icon: 'flag', text: 'Timestamped feedback on your specific video' },
  { icon: 'chatbubble-ellipses', text: 'One follow-up question answered by your trainer' },
  { icon: 'time', text: '48-hour turnaround guaranteed' },
  { icon: 'list', text: 'Actionable next steps tailored to your dog' },
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      Alert.alert('Could not request review', message);
    } finally {
      setRequesting(false);
    }
  };

  const hasCredits = credits !== null && credits > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
        onPress={onClose}
      >
        <View style={{ flex: 1 }} />
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Animated.View
            entering={FadeInUp.duration(300)}
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingTop: spacing.lg,
              paddingHorizontal: spacing.xl,
              paddingBottom: spacing.xl + 16,
            }}
          >
            {/* Handle bar */}
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: colors.border.default,
                borderRadius: 2,
                alignSelf: 'center',
                marginBottom: spacing.lg,
              }}
            />

            <Text variant="title" style={{ color: colors.textPrimary, marginBottom: spacing.xs }}>
              Get a trainer's eyes on this
            </Text>
            <Text variant="body" style={{ color: colors.textSecondary, marginBottom: spacing.lg }}>
              A certified trainer will watch your video and send back personalized feedback.
            </Text>

            {/* What's included */}
            <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
              {WHAT_IS_INCLUDED.map((item) => (
                <View key={item.text} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
                  <AppIcon
                    name={item.icon as AppIconName}
                    size={18}
                    color={colors.primary}
                  />
                  <Text variant="body" style={{ color: colors.textPrimary, flex: 1 }}>
                    {item.text}
                  </Text>
                </View>
              ))}
            </View>

            {/* Credits display */}
            <View
              style={{
                backgroundColor: colors.secondary,
                borderRadius: 14,
                padding: spacing.md,
                marginBottom: spacing.lg,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
              }}
            >
              <AppIcon name="ticket" size={22} color={colors.primary} />
              {credits === null ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : hasCredits ? (
                <Text variant="body" style={{ color: colors.textPrimary }}>
                  You have{' '}
                  <Text style={{ fontWeight: '700', color: colors.primary }}>
                    {credits} review credit{credits !== 1 ? 's' : ''}
                  </Text>{' '}
                  remaining
                </Text>
              ) : (
                <Text variant="body" style={{ color: colors.textPrimary }}>
                  You have{' '}
                  <Text style={{ fontWeight: '700', color: colors.error }}>
                    no review credits
                  </Text>
                </Text>
              )}
            </View>

            {/* CTA */}
            {hasCredits ? (
              <Button
                label={requesting ? 'Requesting…' : 'Use 1 credit for this video'}
                onPress={handleConfirm}
                disabled={requesting}
              />
            ) : (
              <Button
                label="Get review credits"
                onPress={() => {
                  onClose();
                  // TODO: navigate to paywall / add-on purchase screen (future PR)
                  Alert.alert('Coming soon', 'Purchase credits coming in a future update.');
                }}
              />
            )}

            <Pressable
              onPress={onClose}
              style={{ alignItems: 'center', paddingTop: spacing.md }}
            >
              <Text variant="caption" style={{ color: colors.textSecondary }}>
                Cancel
              </Text>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
