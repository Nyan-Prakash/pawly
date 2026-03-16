export type AdaptationType =
  | 'repeat'
  | 'regress'
  | 'advance'
  | 'detour'
  | 'difficulty_adjustment'
  | 'schedule_adjustment'
  | 'environment_adjustment';

export type AdaptationStatus = 'applied' | 'skipped' | 'rolled_back';

export type SkillNodeKind = 'foundation' | 'core' | 'proofing' | 'recovery' | 'diagnostic';

export type SkillEdgeType = 'prerequisite' | 'advance' | 'regress' | 'detour' | 'proofing';
