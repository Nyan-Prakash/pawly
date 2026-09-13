import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Motion policy (DESIGN.md): motion answers an action or shows a state
 * change. Every animation checks this hook and becomes an instant change
 * when the user has asked for reduced motion.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (mounted) setReduced(value);
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduced;
}

/** Durations, in ms. Short enough to read as a response, not a performance. */
export const durations = {
  fast: 150,
  base: 220,
} as const;
