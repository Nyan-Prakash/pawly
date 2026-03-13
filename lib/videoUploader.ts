import * as VideoThumbnails from 'expo-video-thumbnails';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/lib/supabase';
import type { VideoContext } from '@/types';

// ─── Public interfaces ─────────────────────────────────────────────────────

export interface UploadOptions {
  uri: string;
  userId: string;
  dogId: string;
  context: VideoContext;
  behaviorContext?: string;
  beforeContext?: string;
  goalContext?: string;
  onProgress?: (percent: number) => void;
}

export interface UploadResult {
  videoId: string;
  storagePath: string;
  thumbnailUrl: string;
  durationSeconds: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const MAX_DURATION_SECONDS = 300; // 5 minutes

// ─── Thumbnail generation ──────────────────────────────────────────────────

export async function generateThumbnail(uri: string): Promise<string> {
  const { uri: thumbUri } = await VideoThumbnails.getThumbnailAsync(uri, {
    time: 1000, // 1 second in
    quality: 0.7,
  });
  return thumbUri;
}

// ─── Duration check ────────────────────────────────────────────────────────

export async function getVideoDuration(uri: string): Promise<number> {
  // Use FileSystem to check the file exists, then rely on thumbnail metadata
  // expo-av is not available, so we approximate via file size
  // The actual duration is enforced at the picker level (videoMaxDuration)
  // For videos already on disk, we use expo-video-thumbnails which returns metadata
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri, { size: true });
    if (!fileInfo.exists) throw new Error('Video file not found');

    // Try to extract duration from thumbnail metadata (expo-video-thumbnails 4.x)
    // Fall back to 0 if unavailable — the UI enforces max duration at record time
    const result = await VideoThumbnails.getThumbnailAsync(uri, { time: 0 });
    // expo-video-thumbnails does not expose duration directly
    // Return 0 as sentinel; caller should validate at picker level
    return (result as unknown as { duration?: number }).duration ?? 0;
  } catch {
    return 0;
  }
}

// ─── Video compression ─────────────────────────────────────────────────────

// Note: Full H.264 720p compression requires expo-video or a native module.
// expo-image-manipulator only handles images. For V1, we upload the original
// file as-is (expo-image-picker already applies quality:0.7 at record time).
// A post-processing compression step can be added in V2 with ffmpeg-kit-react-native.
export async function compressVideo(uri: string): Promise<string> {
  // Validate the file exists
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) throw new Error('Video file not found at ' + uri);

  // Check approximate duration via thumbnail — reject > 5 minutes
  const duration = await getVideoDuration(uri);
  if (duration > 0 && duration > MAX_DURATION_SECONDS) {
    throw new Error(`Video too long: ${Math.round(duration / 60)} min. Maximum is 5 minutes.`);
  }

  // Return original URI — compression is deferred to V2
  return uri;
}

// ─── Upload orchestrator ───────────────────────────────────────────────────

export async function uploadVideo(options: UploadOptions): Promise<UploadResult> {
  const { uri, userId, dogId, context, behaviorContext, beforeContext, goalContext, onProgress } = options;

  // Step 1 — compress (validate + return URI for now)
  onProgress?.(5);
  const compressedUri = await compressVideo(uri);

  // Step 2 — generate thumbnail
  onProgress?.(15);
  const thumbUri = await generateThumbnail(compressedUri);

  // Step 3 — get duration (best-effort)
  const durationSeconds = await getVideoDuration(compressedUri);

  const timestamp = Date.now();

  // Step 4 — upload video to Supabase Storage
  onProgress?.(20);
  const videoPath = `videos/${userId}/${dogId}/${context}_${timestamp}.mp4`;

  const videoResponse = await fetch(compressedUri);
  const videoBlob = await videoResponse.blob();

  // Upload in one shot; we simulate progress increments around it
  onProgress?.(35);
  const { error: videoUploadError } = await supabase.storage
    .from('pawly-videos')
    .upload(videoPath, videoBlob, {
      contentType: 'video/mp4',
      upsert: false,
    });

  if (videoUploadError) throw new Error('Video upload failed: ' + videoUploadError.message);
  onProgress?.(70);

  // Step 5 — upload thumbnail
  const thumbPath = `thumbnails/${userId}/${dogId}/${timestamp}.jpg`;
  const thumbResponse = await fetch(thumbUri);
  const thumbBlob = await thumbResponse.blob();

  const { error: thumbUploadError } = await supabase.storage
    .from('pawly-videos')
    .upload(thumbPath, thumbBlob, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  // Thumbnail failure is non-fatal
  if (thumbUploadError) {
    console.warn('Thumbnail upload failed (non-fatal):', thumbUploadError.message);
  }
  onProgress?.(85);

  // Get public thumbnail URL (the bucket has signed URLs for videos; thumbs use the same)
  const { data: thumbUrlData } = supabase.storage
    .from('pawly-videos')
    .getPublicUrl(thumbPath);
  const thumbnailUrl = thumbUrlData.publicUrl;

  // Step 6 — insert video record
  const { data: videoRow, error: dbError } = await supabase
    .from('videos')
    .insert({
      user_id: userId,
      dog_id: dogId,
      storage_path: videoPath,
      thumbnail_path: thumbPath,
      duration_seconds: durationSeconds,
      context,
      behavior_context: behaviorContext ?? null,
      before_context: beforeContext ?? null,
      goal_context: goalContext ?? null,
    })
    .select('id')
    .single();

  if (dbError) throw new Error('Failed to save video record: ' + dbError.message);
  onProgress?.(100);

  return {
    videoId: videoRow.id,
    storagePath: videoPath,
    thumbnailUrl,
    durationSeconds,
  };
}
