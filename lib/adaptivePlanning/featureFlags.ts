// Expo only inlines static `process.env.EXPO_PUBLIC_*` references. A dynamic
// `process.env[key]` lookup is undefined in a release build, which silently
// turned the adaptive planner off outside dev.
function isOn(value: string | undefined): boolean {
  return value === 'true' || value === '1';
}

export function isAdaptivePlanningEnabled(): boolean {
  return isOn(process.env.EXPO_PUBLIC_ENABLE_ADAPTIVE_PLANNER);
}
