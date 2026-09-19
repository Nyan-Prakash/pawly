import { Image, View, type StyleProp, type ViewStyle } from 'react-native';
import { ResizeMode, Video } from 'expo-av';

import { MascotCallout } from '@/components/ui/MascotCallout';
import { MASCOT_LOADERS, type MascotActivity } from '@/constants/mascotLoaders';
import { useReducedMotion } from '@/lib/motion';
import { useTheme } from '@/lib/theme';

type MascotLoaderProps = {
  /** What the dog is busy doing while the user waits. */
  activity: MascotActivity;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * The mascot doing something while a screen loads: a short muted loop, one
 * clip per colour scheme so its baked background matches `colors.bg.app`
 * exactly. Loading indicators are the one loop DESIGN.md allows. With reduced
 * motion on it is the usual thinking mascot and nothing moves.
 */
export function MascotLoader({ activity, size = 160, style }: MascotLoaderProps) {
  const { isDark } = useTheme();
  const reducedMotion = useReducedMotion();
  const clip = MASCOT_LOADERS[activity][isDark ? 'dark' : 'light'];

  if (reducedMotion) {
    return <MascotCallout state="thinking" size={Math.round(size * 0.6)} style={style} />;
  }

  return (
    <View style={[{ width: size, height: size }, style]} accessible accessibilityRole="image" accessibilityLabel={clip.label}>
      <Image source={clip.poster} style={{ position: 'absolute', width: size, height: size }} resizeMode="cover" />
      <Video
        source={clip.video}
        shouldPlay
        isLooping
        isMuted
        resizeMode={ResizeMode.COVER}
        style={{ width: size, height: size }}
      />
    </View>
  );
}
