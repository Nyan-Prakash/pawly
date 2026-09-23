// Expo only inlines static `process.env.EXPO_PUBLIC_*` references, so the
// variable must be named literally here (see adaptivePlanning/featureFlags).
function isOn(value: string | undefined): boolean {
  return value === 'true' || value === '1';
}

/**
 * Live AI camera coaching is gated off by default while the live-coach
 * redesign (docs/LIVE-COACH-REDESIGN.md) is decided. When off, the session
 * intro never offers "Choose how to train", so the mode picker and the
 * camera overlay are unreachable. Set EXPO_PUBLIC_ENABLE_LIVE_AI_TRAINER=true
 * to re-enable it for a build.
 */
export function isLiveAiTrainerEnabled(): boolean {
  return isOn(process.env.EXPO_PUBLIC_ENABLE_LIVE_AI_TRAINER);
}
