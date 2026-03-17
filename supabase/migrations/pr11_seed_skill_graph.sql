-- PR 11: Seed initial skill graph for leash_pulling, recall, settling

-- ─── skill_nodes ─────────────────────────────────────────────────────────────

insert into skill_nodes (id, behavior, skill_code, title, description, stage, difficulty, kind, protocol_id) values
  -- Leash pulling
  ('llw-foundation-1', 'leash_pulling', 'llw_engage_walk', 'Engagement on Leash', 'Teach the dog to check in with handler while on leash', 1, 1, 'foundation', 'llw_s1'),
  ('llw-core-2', 'leash_pulling', 'llw_loose_leash', 'Loose Leash Walking', 'Walk without pulling on a standard leash', 2, 2, 'core', 'llw_s2'),
  ('llw-core-3', 'leash_pulling', 'llw_direction_changes', 'Direction Changes', 'Respond to handler direction changes without tension', 3, 3, 'core', 'llw_s3'),
  ('llw-proofing-4', 'leash_pulling', 'llw_distraction_proof', 'Distraction Proofing', 'Maintain loose leash near distractions', 4, 4, 'proofing', null),
  ('llw-recovery-1', 'leash_pulling', 'llw_recovery_reset', 'Leash Reset Recovery', 'Re-engage after a pulling episode', 2, 2, 'recovery', null),

  -- Recall
  ('recall-foundation-1', 'recall', 'recall_name_response', 'Name Response', 'Respond to name by looking at handler', 1, 1, 'foundation', 'recall_s1'),
  ('recall-core-2', 'recall', 'recall_short_distance', 'Short Distance Recall', 'Come when called from short distances indoors', 2, 2, 'core', 'recall_s2'),
  ('recall-core-3', 'recall', 'recall_medium_distance', 'Medium Distance Recall', 'Come when called from medium distances outdoors', 3, 3, 'core', 'recall_s3'),
  ('recall-proofing-4', 'recall', 'recall_distraction_proof', 'Distraction Recall', 'Recall reliably near distractions', 4, 4, 'proofing', null),
  ('recall-recovery-1', 'recall', 'recall_recovery_reset', 'Recall Recovery', 'Re-establish recall after a failure', 2, 2, 'recovery', null),

  -- Settling
  ('settling-foundation-1', 'settling', 'settle_mat_intro', 'Mat Introduction', 'Go to a mat and lie down on cue', 1, 1, 'foundation', 'settle_s1'),
  ('settling-core-2', 'settling', 'settle_duration', 'Duration Settling', 'Stay settled on mat for increasing durations', 2, 2, 'core', 'settle_s2'),
  ('settling-core-3', 'settling', 'settle_real_world', 'Real-World Settling', 'Settle in everyday contexts like cafes or vet waiting rooms', 3, 3, 'core', 'settle_s3'),
  ('settling-proofing-4', 'settling', 'settle_distraction_proof', 'Distraction Settling', 'Remain settled near movement and noise', 4, 4, 'proofing', null),
  ('settling-diagnostic-1', 'settling', 'settle_arousal_check', 'Arousal Level Check', 'Diagnostic to assess baseline arousal before settling work', 1, 1, 'diagnostic', null);

-- ─── skill_edges ─────────────────────────────────────────────────────────────

insert into skill_edges (from_skill_id, to_skill_id, edge_type, condition_summary) values
  -- Leash pulling progression
  ('llw-foundation-1', 'llw-core-2', 'advance', 'Dog consistently checks in on leash'),
  ('llw-core-2', 'llw-core-3', 'advance', 'Dog walks on loose leash for 30+ seconds'),
  ('llw-core-3', 'llw-proofing-4', 'advance', 'Dog handles direction changes without pulling'),
  ('llw-core-2', 'llw-recovery-1', 'regress', 'Dog reverts to pulling after initial success'),
  ('llw-recovery-1', 'llw-core-2', 'advance', 'Recovery exercises restore loose leash behavior'),

  -- Recall progression
  ('recall-foundation-1', 'recall-core-2', 'advance', 'Dog reliably orients to name'),
  ('recall-core-2', 'recall-core-3', 'advance', 'Dog recalls from 10+ feet indoors'),
  ('recall-core-3', 'recall-proofing-4', 'advance', 'Dog recalls from 20+ feet outdoors'),
  ('recall-core-2', 'recall-recovery-1', 'regress', 'Dog stops responding to recall cue'),
  ('recall-recovery-1', 'recall-core-2', 'advance', 'Recovery rebuilds recall response'),

  -- Settling progression
  ('settling-diagnostic-1', 'settling-foundation-1', 'prerequisite', 'Arousal check completed'),
  ('settling-foundation-1', 'settling-core-2', 'advance', 'Dog lies on mat on cue within 5 seconds'),
  ('settling-core-2', 'settling-core-3', 'advance', 'Dog settles for 5+ minutes at home'),
  ('settling-core-3', 'settling-proofing-4', 'advance', 'Dog settles in 2+ real-world locations'),

  -- Cross-behavior edges
  ('settling-foundation-1', 'llw-foundation-1', 'prerequisite', 'Basic impulse control from settling helps leash work'),
  ('recall-foundation-1', 'llw-core-2', 'detour', 'Name response supports leash engagement');
