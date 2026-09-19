import type { ImageSourcePropType } from 'react-native';

export type MascotActivity = 'wake';

export interface MascotLoaderClip {
  /** Bundled square clip, muted. */
  video: number;
  /** First frame, shown until the video is ready. */
  poster: ImageSourcePropType;
  /** What the dog is doing, for VoiceOver. */
  label: string;
}

/**
 * Loading-screen clips of the mascot, one per colour scheme because the
 * background is part of the video: light is baked onto #F7F2EC and dark onto
 * #151412, the two `colors.bg.app` values. Regenerate both if those change.
 *
 * Known gap: H.264 lands the background ~2 RGB units off the token, which
 * reads as a faint square on the page. Options are a `bg.surface` card behind
 * the clip, or calibrating the baked colour on-device. (expo-av draws
 * HEVC-alpha on an opaque layer, so transparency is not an option.)
 */
export const MASCOT_LOADERS: Record<MascotActivity, { light: MascotLoaderClip; dark: MascotLoaderClip }> = {
  wake: {
    light: {
      video: require('@/assets/video/mascot/wake_light.mp4'),
      poster: require('@/assets/video/mascot/wake_light_poster.jpg'),
      label: 'The Pawly puppy yawns, stretches and shakes itself awake.',
    },
    dark: {
      video: require('@/assets/video/mascot/wake_dark.mp4'),
      poster: require('@/assets/video/mascot/wake_dark_poster.jpg'),
      label: 'The Pawly puppy yawns, stretches and shakes itself awake.',
    },
  },
};
