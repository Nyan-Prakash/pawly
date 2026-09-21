import { Image, View, useWindowDimensions } from 'react-native';
import { ResizeMode, Video } from 'expo-av';

import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import type { StepMediaClip } from '@/constants/stepMedia';
import { useReducedMotion } from '@/lib/motion';

interface StepMediaProps {
  clip: StepMediaClip;
}

/**
 * Tall enough to read, short enough that the step's text, the clip and
 * "Why this step" all fit above the two-button footer on a 6.1" phone.
 */
const MAX_HEIGHT = 280;

/**
 * The step's demonstration clip, muted and looping. With reduced motion on it
 * is the poster frame and nothing moves.
 *
 * The frame is sized in points up front (content width, capped in height)
 * rather than with percentage + aspectRatio + maxHeight: that combination
 * lays out twice, and the video visibly re-fits between passes. The poster is
 * our own Image under the player, so both fit the same way and nothing jumps
 * when the first frame arrives.
 */
export function StepMedia({ clip }: StepMediaProps) {
  const reducedMotion = useReducedMotion();
  const { width: windowWidth } = useWindowDimensions();

  const contentWidth = windowWidth - spacing.lg * 2;
  const height = Math.min(MAX_HEIGHT, contentWidth / clip.aspectRatio);
  const width = Math.round(height * clip.aspectRatio);

  return (
    <View
      style={{ width, height, borderRadius: radii.md, overflow: 'hidden' }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={clip.label}
    >
      <Image
        source={clip.poster}
        style={{ position: 'absolute', width, height }}
        resizeMode="contain"
        accessible={false}
        accessibilityIgnoresInvertColors
      />
      {reducedMotion ? null : (
        <Video
          source={clip.video}
          shouldPlay
          isLooping
          isMuted
          resizeMode={ResizeMode.CONTAIN}
          style={{ width, height }}
        />
      )}
    </View>
  );
}
