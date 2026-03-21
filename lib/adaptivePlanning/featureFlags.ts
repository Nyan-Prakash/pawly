function envFlag(key: string): boolean {
  const value = process.env[key];
  return value === 'true' || value === '1';
}

export function isAdaptivePlanningEnabled(): boolean {
  return envFlag('EXPO_PUBLIC_ENABLE_ADAPTIVE_PLANNER');
}
