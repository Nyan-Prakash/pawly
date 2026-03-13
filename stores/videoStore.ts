import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { VideoRecord, ExpertReview, TimestampMarker } from '@/types';

// ─── State shape ───────────────────────────────────────────────────────────

interface VideoStore {
  videos: VideoRecord[];
  isLoading: boolean;
  storageUsedBytes: number;

  // Actions
  fetchVideos: (userId: string, dogId: string) => Promise<void>;
  deleteVideo: (videoId: string) => Promise<void>;
  requestExpertReview: (videoId: string, userId: string) => Promise<void>;
  getReviewCredits: (userId: string) => Promise<number>;
  getSignedVideoUrl: (storagePath: string) => Promise<string>;
}

// ─── Store ─────────────────────────────────────────────────────────────────

export const useVideoStore = create<VideoStore>((set, get) => ({
  videos: [],
  isLoading: false,
  storageUsedBytes: 0,

  fetchVideos: async (userId: string, dogId: string) => {
    set({ isLoading: true });
    try {
      // Fetch videos with their expert reviews via join
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          expert_reviews (
            id,
            video_id,
            user_id,
            status,
            trainer_name,
            trainer_photo_url,
            feedback,
            timestamps,
            requested_at,
            completed_at
          )
        `)
        .eq('user_id', userId)
        .eq('dog_id', dogId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      const videos: VideoRecord[] = (data ?? []).map((row) => {
        const review = row.expert_reviews?.[0];
        return {
          id: row.id,
          userId: row.user_id,
          dogId: row.dog_id,
          storagePath: row.storage_path,
          thumbnailPath: row.thumbnail_path,
          durationSeconds: row.duration_seconds ?? 0,
          context: row.context,
          behaviorContext: row.behavior_context,
          beforeContext: row.before_context,
          goalContext: row.goal_context,
          uploadedAt: row.uploaded_at,
          expertReview: review
            ? {
                id: review.id,
                videoId: review.video_id,
                userId: review.user_id,
                status: review.status,
                trainerName: review.trainer_name,
                trainerPhotoUrl: review.trainer_photo_url,
                feedback: review.feedback,
                timestamps: (review.timestamps ?? []) as TimestampMarker[],
                requestedAt: review.requested_at,
                completedAt: review.completed_at,
              }
            : undefined,
        };
      });

      // Estimate storage usage (sum of video file sizes is not stored; approximate from count)
      // In V2 we can store file size in the DB. For now track count-based estimation.
      set({ videos });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteVideo: async (videoId: string) => {
    const video = get().videos.find((v) => v.id === videoId);
    if (!video) return;

    // Delete storage objects (non-fatal if they fail)
    await supabase.storage.from('pawly-videos').remove([video.storagePath]);
    if (video.thumbnailPath) {
      await supabase.storage.from('pawly-videos').remove([video.thumbnailPath]);
    }

    // Delete the DB record (cascade deletes expert_reviews via FK)
    const { error } = await supabase.from('videos').delete().eq('id', videoId);
    if (error) throw error;

    set((state) => ({ videos: state.videos.filter((v) => v.id !== videoId) }));
  },

  requestExpertReview: async (videoId: string, userId: string) => {
    // Check credits
    const credits = await get().getReviewCredits(userId);
    if (credits <= 0) throw new Error('No review credits remaining');

    // Create review record
    const { error: reviewError } = await supabase.from('expert_reviews').insert({
      video_id: videoId,
      user_id: userId,
      status: 'queued',
    });
    if (reviewError) throw reviewError;

    // Deduct one credit
    const { error: creditError } = await supabase
      .from('review_credits')
      .update({ credits_remaining: credits - 1 })
      .eq('user_id', userId);
    if (creditError) throw creditError;

    // Trigger Edge Function to notify admin (fire-and-forget)
    supabase.functions.invoke('notify-expert-review', { body: { videoId, userId } }).catch(
      (err) => console.warn('notify-expert-review invoke failed (non-fatal):', err),
    );

    // Refresh the video list so the review badge appears
    const videos = get().videos;
    const updatedVideos = videos.map((v) => {
      if (v.id !== videoId) return v;
      return {
        ...v,
        expertReview: {
          id: 'pending',
          videoId,
          userId,
          status: 'queued' as const,
          trainerName: null,
          trainerPhotoUrl: null,
          feedback: null,
          timestamps: [],
          requestedAt: new Date().toISOString(),
          completedAt: null,
        },
      };
    });
    set({ videos: updatedVideos });
  },

  getReviewCredits: async (userId: string): Promise<number> => {
    const { data } = await supabase
      .from('review_credits')
      .select('credits_remaining')
      .eq('user_id', userId)
      .single();
    return data?.credits_remaining ?? 0;
  },

  getSignedVideoUrl: async (storagePath: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('pawly-videos')
      .createSignedUrl(storagePath, 3600); // 1 hour
    if (error) throw error;
    return data.signedUrl;
  },
}));
