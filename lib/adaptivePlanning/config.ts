export const ADAPTIVE_PLANNING_CONFIG = {
  learningState: {
    defaultScore: 3,
    minScore: 1,
    maxScore: 5,
  },
  adaptations: {
    maxRecentToFetch: 20,
  },
  skillGraph: {
    maxStage: 5,
    maxDifficulty: 5,
  },
} as const;
