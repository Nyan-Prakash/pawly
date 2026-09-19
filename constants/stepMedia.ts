import type { ImageSourcePropType } from 'react-native';

export interface StepMediaClip {
  /** Bundled mp4, muted. */
  video: number;
  /** width / height of the clip; the frame is sized to it. */
  aspectRatio: number;
  /** First frame, shown when reduced motion is on and before the video is ready. */
  poster: ImageSourcePropType;
  /** What the clip shows, for VoiceOver. */
  label: string;
}

/**
 * Demonstration clips, keyed by protocol id then step index. A clip shows the
 * dog doing the exercise and takes the place of the step's control; it is the
 * one place the app loops motion on its own (see DESIGN.md, Motion). Only the
 * steps listed here get one.
 */
export const STEP_MEDIA: Record<string, Record<number, StepMediaClip>> = {
  crate_s1: {
    0: {
      video: require('@/assets/video/crate_s1_1.mp4'),
      aspectRatio: 1,
      poster: require('@/assets/video/crate_s1_1_poster.jpg'),
      label: 'A puppy sniffs at the open door of its crate.',
    },
    1: {
      video: require('@/assets/video/crate_s1_2.mp4'),
      aspectRatio: 1,
      poster: require('@/assets/video/crate_s1_2_poster.jpg'),
      label: 'A puppy steps into the crate for a treat and backs out again.',
    },
    2: {
      video: require('@/assets/video/crate_s1_3.mp4'),
      aspectRatio: 1,
      poster: require('@/assets/video/crate_s1_3_poster.jpg'),
      label: 'A puppy eats from a bowl inside the crate with the door open.',
    },
    3: {
      video: require('@/assets/video/crate_s1_4.mp4'),
      aspectRatio: 1,
      poster: require('@/assets/video/crate_s1_4_poster.jpg'),
      label: 'A puppy eats calmly inside the crate with the door closed.',
    },
    4: {
      video: require('@/assets/video/crate_s1_5.mp4'),
      aspectRatio: 1,
      poster: require('@/assets/video/crate_s1_5_poster.jpg'),
      label: 'A puppy gets up and walks calmly out of the open crate.',
    },
  },
};

export function getStepMedia(protocolId: string, stepIndex: number): StepMediaClip | null {
  return STEP_MEDIA[protocolId]?.[stepIndex] ?? null;
}
