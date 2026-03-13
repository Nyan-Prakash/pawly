import { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppIcon } from '@/components/ui/AppIcon';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useVideoStore } from '@/stores/videoStore';
import { useAuthStore } from '@/stores/authStore';
import { useDogStore } from '@/stores/dogStore';
import type { VideoRecord, VideoContext } from '@/types';

// ─── Filter chips ──────────────────────────────────────────────────────────

type FilterKey = 'all' | VideoContext | 'reviewed';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'session', label: 'Training' },
  { key: 'behavior', label: 'Behavior' },
  { key: 'reviewed', label: 'Expert Reviewed' },
];

// ─── Review status badge ───────────────────────────────────────────────────

function ReviewBadge({ status }: { status: 'queued' | 'in_review' | 'complete' }) {
  const config = {
    queued: { label: 'Queued', color: colors.textSecondary, bg: colors.secondary },
    in_review: { label: 'In Review', color: '#B45309', bg: '#FEF3C7' },
    complete: { label: 'Reviewed', color: '#166534', bg: '#DCFCE7' },
  }[status];

  return (
    <View
      style={{
        backgroundColor: config.bg,
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: '600', color: config.color }}>
        {config.label}
      </Text>
    </View>
  );
}

// ─── Video thumbnail card ──────────────────────────────────────────────────

function VideoCard({ video, onPress }: { video: VideoRecord; onPress: () => void }) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const getSignedUrl = useVideoStore((s) => s.getSignedVideoUrl);

  useEffect(() => {
    if (video.thumbnailPath) {
      getSignedUrl(video.thumbnailPath)
        .then(setThumbUrl)
        .catch(() => setThumbUrl(null));
    }
  }, [video.thumbnailPath]);

  const date = new Date(video.uploadedAt);
  const dateLabel = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  const contextLabel = {
    onboarding: 'Onboarding',
    session: 'Training Session',
    behavior: video.behaviorContext
      ? video.behaviorContext
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Behavior',
  }[video.context] ?? video.context;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: pressed ? `${colors.primary}08` : colors.surface,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border.default,
      })}
    >
      {/* Thumbnail */}
      <View style={{ position: 'relative', aspectRatio: 16 / 9 }}>
        {thumbUrl ? (
          <Image
            source={{ uri: thumbUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              flex: 1,
              backgroundColor: colors.secondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppIcon name="film" size={28} color={colors.textSecondary} />
          </View>
        )}
        {/* Duration badge */}
        {video.durationSeconds > 0 && (
          <View
            style={{
              position: 'absolute',
              bottom: 6,
              right: 6,
              backgroundColor: 'rgba(0,0,0,0.65)',
              borderRadius: 5,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>
              {formatDuration(video.durationSeconds)}
            </Text>
          </View>
        )}
      </View>

      {/* Info row */}
      <View style={{ padding: 10, gap: 4 }}>
        <Text
          style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }}
          numberOfLines={1}
        >
          {contextLabel}
        </Text>
        <Text style={{ fontSize: 11, color: colors.textSecondary }}>{dateLabel}</Text>
        {video.expertReview && (
          <ReviewBadge status={video.expertReview.status} />
        )}
      </View>
    </Pressable>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────

export default function VideosScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const dog = useDogStore((s) => s.dog);
  const { videos, isLoading, fetchVideos } = useVideoStore();

  const [filter, setFilter] = useState<FilterKey>('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (user?.id && dog?.id) {
      await fetchVideos(user.id, dog.id);
    }
  };

  useEffect(() => { load(); }, [user?.id, dog?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = videos.filter((v) => {
    if (filter === 'all') return true;
    if (filter === 'reviewed') return v.expertReview?.status === 'complete';
    return v.context === filter;
  });

  const totalSize = videos.length; // actual byte size stored in DB in V2

  const navigateToVideo = (video: VideoRecord) => {
    router.push({ pathname: '/(tabs)/know/video-player', params: { videoId: video.id } });
  };

  return (
    <SafeScreen>
      <View style={{ height: spacing.xs, backgroundColor: colors.primary }} />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.default,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: colors.primary, fontSize: 28, lineHeight: 32 }}>‹</Text>
          </Pressable>
          <Text variant="title" style={{ color: colors.textPrimary }}>
            {dog?.name ? `${dog.name}'s Videos` : 'My Videos'}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/(tabs)/train/upload-video')}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 22, lineHeight: 26 }}>+</Text>
        </Pressable>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ borderBottomWidth: 1, borderBottomColor: colors.border.default }}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingVertical: 10, gap: 8 }}
      >
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
              backgroundColor: filter === f.key ? colors.primary : colors.surface,
              borderWidth: 1.5,
              borderColor: filter === f.key ? colors.primary : colors.border.default,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: filter === f.key ? '600' : '400',
                color: filter === f.key ? '#fff' : colors.textSecondary,
              }}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Content */}
      {isLoading && videos.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <Animated.View
          entering={FadeIn}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}
        >
          <View style={{ marginBottom: spacing.md }}>
            <AppIcon name="videocam" size={52} color={colors.textSecondary} />
          </View>
          <Text variant="title" style={{ color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.xs }}>
            No videos yet
          </Text>
          <Text variant="body" style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl }}>
            Upload a clip from your next training session to start your video library.
          </Text>
          <Pressable
            onPress={() => router.push('/(tabs)/train/upload-video')}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.md,
              borderRadius: 14,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Upload first video</Text>
          </Pressable>
        </Animated.View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(v) => v.id}
          numColumns={2}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
          columnWrapperStyle={{ gap: spacing.sm }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
          renderItem={({ item }) => (
            <VideoCard video={item} onPress={() => navigateToVideo(item)} />
          )}
          ListFooterComponent={
            videos.length > 0 ? (
              <Text
                variant="caption"
                style={{ color: colors.textSecondary, textAlign: 'center', paddingTop: spacing.md }}
              >
                {videos.length} video{videos.length !== 1 ? 's' : ''}
              </Text>
            ) : null
          }
        />
      )}
    </SafeScreen>
  );
}
