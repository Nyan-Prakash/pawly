import type { AdaptivePlanFeatureFlags } from '../../types';

function envFlag(key: string): boolean {
  const value = process.env[key];
  return value === 'true' || value === '1';
}

export function getAdaptiveFeatureFlags(): AdaptivePlanFeatureFlags {
  return {
    enableAdaptivePlanner: envFlag('EXPO_PUBLIC_ENABLE_ADAPTIVE_PLANNER'),
    enableAdaptivePlanPreview: envFlag('EXPO_PUBLIC_ENABLE_ADAPTIVE_PLAN_PREVIEW'),
    enableAdaptationEngine: envFlag('EXPO_PUBLIC_ENABLE_ADAPTATION_ENGINE'),
    enableCoachAdaptationExplanations: envFlag('EXPO_PUBLIC_ENABLE_COACH_ADAPTATION_EXPLANATIONS'),
    enableLearningStateUpdates: envFlag('EXPO_PUBLIC_ENABLE_LEARNING_STATE_UPDATES'),
  };
}

export function isAdaptivePlanningEnabled(): boolean {
  return getAdaptiveFeatureFlags().enableAdaptivePlanner;
}
