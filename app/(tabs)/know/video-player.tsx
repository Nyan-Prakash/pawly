import { useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppIcon } from '@/components/ui/AppIcon';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ExpertReviewRequest } from '@/components/video/ExpertReviewRequest';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useVideoStore } from '@/stores/videoStore';
import { useAuthStore } from '@/stores/authStore';
import type { VideoRecord, TimestampMarker } from '@/types';

// ─── Timestamp chapter row ─────────────────────────────────────────────────

function ChapterRow({
  marker,
  onSeek,
}: {
  marker: TimestampMarker;
  onSeek: (timeSecs: number) => void;
}) {
  const m = Math.floor(marker.time / 60);
  const s = marker.time % 60;
  const label = `${m}:${s.toString().padStart(2, '0')}`;

  return (
    <Pressable
      onPress={() => onSeek(marker.time)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        backgroundColor: pressed ? `${colors.primary}08` : 'transparent',
        borderRadius: 8,
      })}
    >
      <View
        style={{
          backgroundColor: `${colors.primary}20`,
          borderRadius: 6,
          paddingHorizontal: 8,
          paddingVertical: 3,
          minWidth: 44,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>
          {label}
        </Text>
      </View>
      <Text variant="body" style={{ flex: 1, color: colors.textPrimary }}>
        {marker.note}
      </Text>
    </Pressable>
  );
}

// ─── Review status badge ───────────────────────────────────────────────────

function ReviewStatusBadge({ status }: { status: 'queued' | 'in_review' | 'complete' }) {
  const config = {
    queued: { label: 'Queued — waiting for a trainer', color: colors.textSecondary, bg: colors.secondary },
    in_review: { label: 'In Review — trainer is watching your video', color: '#92400E', bg: '#FEF3C7' },
    complete: { label: 'Review complete', color: '#166534', bg: '#DCFCE7' },
  }[status];

  return (
    <View style={{ backgroundColor: config.bg, borderRadius: 10, padding: spacing.sm }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: config.color }}>
        {config.label}
      </Text>
    </View>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────

export default function VideoPlayerScreen() {
  const router = useRouter();
  const { videoId } = useLocalSearchParams<{ videoId: string }>();

  const user = useAuthStore((s) => s.user);
  const { videos, getSignedVideoUrl, deleteVideo } = useVideoStore();

  const video = videos.find((v) => v.id === videoId);

  const playerRef = useRef<Video>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const [reviewRequested, setReviewRequested] = useState(false);

  useEffect(() => {
    if (video?.storagePath) {
      getSignedVideoUrl(video.storagePath)
        .then(setSignedUrl)
        .catch(() => setSignedUrl(null));
    }
  }, [video?.storagePath]);

  const handlePlaybackStatus = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      setBuffering(true);
      return;
    }
    setIsPlaying(status.isPlaying);
    setPositionMs(status.positionMillis);
    setDurationMs(status.durationMillis ?? 0);
    setBuffering(status.isBuffering);
  };

  const togglePlay = async () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      await playerRef.current.pauseAsync();
    } else {
      await playerRef.current.playAsync();
    }
  };

  const seekTo = async (secs: number) => {
    if (!playerRef.current) return;
    await playerRef.current.setPositionAsync(secs * 1000);
    await playerRef.current.playAsync();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete video?',
      'This will permanently delete this video and any expert review.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!videoId) return;
            try {
              await deleteVideo(videoId);
              router.back();
            } catch {
              Alert.alert('Error', 'Failed to delete video. Please try again.');
            }
          },
        },
      ],
    );
  };

  const formatTime = (ms: number) => {
    const secs = Math.floor(ms / 1000);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressFraction = durationMs > 0 ? positionMs / durationMs : 0;

  const contextLabel = video
    ? {
        onboarding: 'Onboarding',
        session: 'Training Session',
        behavior: video.behaviorContext
          ? video.behaviorContext
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase())
          : 'Behavior Clip',
      }[video.context]
    : '';

  const dateLabel = video
    ? new Date(video.uploadedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  if (!video) {
    return (
      <SafeScreen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <ExpertReviewRequest
        visible={showReviewSheet}
        videoId={video.id}
        onClose={() => setShowReviewSheet(false)}
        onConfirmed={() => {
          setShowReviewSheet(false);
          setReviewRequested(true);
        }}
      />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.default,
        }}
      >
        <Pressable onPress={() => router.back()} style={{ marginRight: spacing.md }}>
          <Text style={{ color: colors.primary, fontSize: 28, lineHeight: 32 }}>‹</Text>
        </Pressable>
        <Text variant="title" style={{ color: colors.textPrimary, fontSize: 17, flex: 1 }} numberOfLines={1}>
          {contextLabel}
        </Text>
        <Pressable onPress={handleDelete}>
          <AppIcon name="trash" size={22} color={colors.error} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Video player */}
        <View style={{ backgroundColor: '#000', position: 'relative' }}>
          {signedUrl ? (
            <Video
              ref={playerRef}
              source={{ uri: signedUrl }}
              style={{ width: '100%', aspectRatio: 16 / 9 }}
              resizeMode={ResizeMode.CONTAIN}
              onPlaybackStatusUpdate={handlePlaybackStatus}
              useNativeControls={false}
            />
          ) : (
            <View
              style={{
                width: '100%',
                aspectRatio: 16 / 9,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ActivityIndicator color="#fff" size="large" />
            </View>
          )}

          {/* Buffering indicator */}
          {buffering && signedUrl && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ActivityIndicator color="#fff" size="large" />
            </View>
          )}

          {/* Play/pause overlay */}
          <Pressable
            onPress={togglePlay}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {!isPlaying && !buffering && (
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: 'rgba(0,0,0,0.55)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 26, color: '#fff' }}>▶</Text>
              </View>
            )}
          </Pressable>

          {/* Scrub bar */}
          <View style={{ padding: 10 }}>
            <View
              style={{
                height: 4,
                backgroundColor: 'rgba(255,255,255,0.3)',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: 4,
                  backgroundColor: colors.primary,
                  borderRadius: 2,
                  width: `${progressFraction * 100}%`,
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
                {formatTime(positionMs)}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
                {formatTime(durationMs)}
              </Text>
            </View>
          </View>
        </View>

        {/* Metadata */}
        <View style={{ padding: spacing.xl, gap: spacing.md }}>
          <View>
            <Text variant="title" style={{ color: colors.textPrimary }}>
              {contextLabel}
            </Text>
            <Text variant="caption" style={{ color: colors.textSecondary }}>
              {dateLabel}
              {video.durationSeconds > 0 ? ` · ${formatTime(video.durationSeconds * 1000)}` : ''}
            </Text>
          </View>

          {/* Context notes */}
          {video.beforeContext && (
            <View style={{ gap: 4 }}>
              <Text variant="caption" style={{ fontWeight: '600', color: colors.textSecondary }}>
                WHAT HAPPENED BEFORE
              </Text>
              <Text variant="body" style={{ color: colors.textPrimary }}>
                {video.beforeContext}
              </Text>
            </View>
          )}
          {video.goalContext && (
            <View style={{ gap: 4 }}>
              <Text variant="caption" style={{ fontWeight: '600', color: colors.textSecondary }}>
                WHAT YOU WERE HOPING FOR
              </Text>
              <Text variant="body" style={{ color: colors.textPrimary }}>
                {video.goalContext}
              </Text>
            </View>
          )}

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: colors.border.default }} />

          {/* Expert review section */}
          {video.expertReview ? (
            <Animated.View entering={FadeIn} style={{ gap: spacing.md }}>
              <Text variant="title" style={{ color: colors.textPrimary, fontSize: 17 }}>
                Expert Review
              </Text>

              <ReviewStatusBadge status={video.expertReview.status} />

              {reviewRequested && (
                <Animated.View
                  entering={FadeIn}
                  style={{
                    backgroundColor: `${colors.success}15`,
                    borderRadius: 12,
                    padding: spacing.md,
                    flexDirection: 'row',
                    gap: spacing.sm,
                  }}
                >
                  <AppIcon name="checkmark-circle" size={18} color={colors.success} />
                  <Text variant="body" style={{ color: colors.textPrimary, flex: 1 }}>
                    {"Review requested! You'll be notified within 48 hours."}
                  </Text>
                </Animated.View>
              )}

              {/* Trainer info */}
              {video.expertReview.trainerName && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: `${colors.primary}20`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                      <AppIcon name="person" size={20} color={colors.primary} />
                  </View>
                  <Text variant="body" style={{ fontWeight: '600', color: colors.textPrimary }}>
                    {video.expertReview.trainerName}
                  </Text>
                </View>
              )}

              {/* Feedback text */}
              {video.expertReview.feedback && (
                <View
                  style={{
                    backgroundColor: colors.secondary,
                    borderRadius: 14,
                    padding: spacing.md,
                  }}
                >
                  <Text variant="body" style={{ color: colors.textPrimary, lineHeight: 22 }}>
                    {video.expertReview.feedback}
                  </Text>
                </View>
              )}

              {/* Timestamp markers */}
              {video.expertReview.timestamps?.length > 0 && (
                <View style={{ gap: spacing.xs }}>
                  <Text variant="caption" style={{ fontWeight: '700', color: colors.textSecondary }}>
                    TIMESTAMP NOTES
                  </Text>
                  {video.expertReview.timestamps.map((marker, idx) => (
                    <ChapterRow key={idx} marker={marker} onSeek={seekTo} />
                  ))}
                </View>
              )}
            </Animated.View>
          ) : (
            /* No review yet — CTA */
            <View style={{ gap: spacing.md }}>
              <Text variant="title" style={{ color: colors.textPrimary, fontSize: 17 }}>
                Expert Review
              </Text>
              {reviewRequested ? (
                <Animated.View
                  entering={FadeIn}
                  style={{
                    backgroundColor: `${colors.success}15`,
                    borderRadius: 12,
                    padding: spacing.md,
                    flexDirection: 'row',
                    gap: spacing.sm,
                  }}
                >
                  <AppIcon name="checkmark-circle" size={18} color={colors.success} />
                  <Text variant="body" style={{ color: colors.textPrimary, flex: 1 }}>
                    {"Review requested! You'll be notified within 48 hours."}
                  </Text>
                </Animated.View>
              ) : (
                <>
                  <Text variant="body" style={{ color: colors.textSecondary }}>
                    Get personalized timestamped feedback from a certified trainer within 48 hours.
                  </Text>
                  <Button
                    label="Request expert review"
                    onPress={() => setShowReviewSheet(true)}
                  />
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
