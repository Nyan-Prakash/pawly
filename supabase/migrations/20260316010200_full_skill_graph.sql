-- PR 12: Full skill graph for all 8 behavior goals
-- Replaces the partial PR 11 seed with complete coverage

-- Clear PR 11 seed data (edges first due to FK constraints)
delete from skill_edges;
delete from skill_nodes;

-- ─── LEASH PULLING ───────────────────────────────────────────────────────────

insert into skill_nodes (id, behavior, skill_code, title, description, stage, difficulty, kind, protocol_id) values
  ('llw-attn-1',       'leash_pulling', 'llw_handler_attention',       'Handler Attention',                 'Teach eye contact and name response while on leash',                        1, 1, 'foundation', 'llw_s1'),
  ('llw-slack-2',      'leash_pulling', 'llw_leash_slack_foundation',  'Leash Slack Foundation',            'Reward any moment the leash goes slack near handler',                       1, 2, 'foundation', 'llw_s1'),
  ('llw-stop-3',       'leash_pulling', 'llw_stop_and_wait',           'Stop and Wait',                     'Stop walking when leash tightens; reward when dog returns to slack',        2, 2, 'core',       'llw_s2'),
  ('llw-dir-4',        'leash_pulling', 'llw_direction_change',        'Direction Change Engagement',       'Change direction smoothly; reward dog for following',                       2, 3, 'core',       'llw_s2'),
  ('llw-outdoor-5',    'leash_pulling', 'llw_outdoor_low_distraction', 'Outdoor Low Distraction Walk',      'Walk on loose leash in quiet outdoor area',                                3, 3, 'core',       'llw_s3'),
  ('llw-cross-6',      'leash_pulling', 'llw_crossing_focus',          'Crossing Focus',                    'Maintain leash manners at road crossings and intersections',                3, 4, 'core',       'llw_s3'),
  ('llw-proof-7',      'leash_pulling', 'llw_distraction_proofing',    'Distraction Proofing',              'Loose leash walking near dogs, people, and urban distractions',            4, 4, 'proofing',   null),
  ('llw-busy-8',       'leash_pulling', 'llw_busy_street',             'Busy Street Walk',                  'Full-distance walk on a busy street with minimal pulling',                 4, 5, 'proofing',   null),
  ('llw-arousal-r1',   'leash_pulling', 'llw_arousal_recovery',        'Arousal Recovery',                  'Calm the dog and re-engage after an arousal spike on leash',               2, 2, 'recovery',   null),
  ('llw-engage-r2',    'leash_pulling', 'llw_engagement_reset',        'Engagement Reset',                  'Rebuild handler focus after a pulling regression',                         1, 1, 'recovery',   'llw_s1');

insert into skill_edges (from_skill_id, to_skill_id, edge_type, condition_summary) values
  ('llw-attn-1',     'llw-slack-2',    'advance',      'Dog responds to name 8/10 times on leash'),
  ('llw-slack-2',    'llw-stop-3',     'advance',      'Dog offers slack leash for 10+ seconds unprompted'),
  ('llw-stop-3',     'llw-dir-4',      'advance',      'Dog returns to heel within 3 seconds of stop'),
  ('llw-dir-4',      'llw-outdoor-5',  'advance',      'Dog follows direction changes indoors reliably'),
  ('llw-outdoor-5',  'llw-cross-6',    'advance',      'Dog walks on loose leash for 2+ minutes outdoors'),
  ('llw-cross-6',    'llw-proof-7',    'advance',      'Dog maintains focus at crossings'),
  ('llw-proof-7',    'llw-busy-8',     'advance',      'Dog handles moderate distractions on loose leash'),
  ('llw-stop-3',     'llw-arousal-r1', 'regress',      'Dog pulls intensely after initial stop-and-wait success'),
  ('llw-arousal-r1', 'llw-stop-3',     'advance',      'Recovery exercises restore calm leash behavior'),
  ('llw-dir-4',      'llw-engage-r2',  'regress',      'Dog disengages from handler completely'),
  ('llw-engage-r2',  'llw-slack-2',    'advance',      'Handler attention rebuilt through foundation work');

-- ─── RECALL ──────────────────────────────────────────────────────────────────

insert into skill_nodes (id, behavior, skill_code, title, description, stage, difficulty, kind, protocol_id) values
  ('rc-attn-1',       'recall', 'rc_attention_foundation',       'Attention Foundation',              'Build name response and treat delivery mechanics',                          1, 1, 'foundation', 'recall_s1'),
  ('rc-name-2',       'recall', 'rc_name_response',              'Name Response',                     'Dog reliably orients to name from short distance',                          1, 2, 'foundation', 'recall_s1'),
  ('rc-short-3',      'recall', 'rc_indoor_short',               'Indoor Short Recall',               'Come when called from 10 feet indoors',                                     2, 2, 'core',       'recall_s2'),
  ('rc-distract-4',   'recall', 'rc_indoor_distraction',         'Indoor Distraction Recall',         'Recall with mild distractions present indoors',                             2, 3, 'core',       'recall_s2'),
  ('rc-outdoor-5',    'recall', 'rc_outdoor_low_distraction',    'Outdoor Low Distraction Recall',    'Recall in quiet outdoor environment on long line',                          3, 3, 'core',       'recall_s3'),
  ('rc-longline-6',   'recall', 'rc_proofing_long_line',         'Long Line Proofing',                'Reliable recall at 20+ feet on long line with distractions',                3, 4, 'core',       'recall_s3'),
  ('rc-proof-7',      'recall', 'rc_distraction_proofing',       'Distraction Proofing',              'Recall near other dogs, wildlife, and high-value distractions',             4, 4, 'proofing',   null),
  ('rc-emergency-8',  'recall', 'rc_emergency_recall',           'Emergency Recall',                  'Install a distinct emergency recall cue for safety-critical situations',    4, 5, 'proofing',   null),
  ('rc-recover-r1',   'recall', 'rc_distraction_recovery',       'Distraction Recovery',              'Rebuild recall after a blown recall event',                                 2, 2, 'recovery',   null),
  ('rc-engage-r2',    'recall', 'rc_engagement_rebuild',         'Engagement Rebuild',                'Restore handler value after a disengagement regression',                    1, 1, 'recovery',   'recall_s1');

insert into skill_edges (from_skill_id, to_skill_id, edge_type, condition_summary) values
  ('rc-attn-1',      'rc-name-2',      'advance',      'Dog orients to name 8/10 times'),
  ('rc-name-2',      'rc-short-3',     'advance',      'Dog comes to handler from 3 feet reliably'),
  ('rc-short-3',     'rc-distract-4',  'advance',      'Dog recalls from 10 feet indoors 8/10'),
  ('rc-distract-4',  'rc-outdoor-5',   'advance',      'Dog recalls with mild distractions indoors'),
  ('rc-outdoor-5',   'rc-longline-6',  'advance',      'Dog recalls outdoors in quiet environment'),
  ('rc-longline-6',  'rc-proof-7',     'advance',      'Dog recalls at 20+ feet on long line'),
  ('rc-proof-7',     'rc-emergency-8', 'advance',      'Dog handles moderate distractions on recall'),
  ('rc-short-3',     'rc-recover-r1',  'regress',      'Dog stops coming when called after initial success'),
  ('rc-recover-r1',  'rc-short-3',     'advance',      'Recovery rebuilds recall response'),
  ('rc-distract-4',  'rc-engage-r2',   'regress',      'Dog fully disengages from handler outdoors'),
  ('rc-engage-r2',   'rc-name-2',      'advance',      'Engagement exercises restore name response');

-- ─── JUMPING UP ──────────────────────────────────────────────────────────────

insert into skill_nodes (id, behavior, skill_code, title, description, stage, difficulty, kind, protocol_id) values
  ('ju-4paw-1',       'jumping_up', 'ju_four_paws_floor',          'Four Paws on Floor',                'Reward standing with all four paws on the ground for attention',            1, 1, 'foundation', 'jumping_s1'),
  ('ju-autosit-2',    'jumping_up', 'ju_auto_sit_attention',       'Auto-Sit for Attention',            'Dog sits automatically when handler approaches',                            1, 2, 'foundation', 'jumping_s1'),
  ('ju-door-3',       'jumping_up', 'ju_door_greeting',            'Door Greeting Protocol',            'Sit-stay when door opens; greet calmly',                                    2, 2, 'core',       'jumping_s2'),
  ('ju-stranger-4',   'jumping_up', 'ju_stranger_greeting',        'Stranger Greeting Practice',        'Calm four-on-floor greeting with unfamiliar people',                        2, 3, 'core',       'jumping_s2'),
  ('ju-impulse-5',    'jumping_up', 'ju_impulse_control',          'Impulse Control at Threshold',      'Maintain self-control during excitement spikes',                            3, 3, 'core',       'jumping_s3'),
  ('ju-proof-6',      'jumping_up', 'ju_off_cue_proofing',         'Off Cue Proofing',                  'Reliable response to off cue in novel environments',                        3, 4, 'proofing',   'jumping_s3'),
  ('ju-party-7',      'jumping_up', 'ju_party_proofing',           'Party/Group Proofing',              'Calm behavior with multiple people and high excitement',                    4, 4, 'proofing',   null),
  ('ju-arousal-r1',   'jumping_up', 'ju_arousal_recovery',         'Arousal Down Recovery',             'Calm down from an excited jumping episode',                                 2, 2, 'recovery',   null),
  ('ju-redirect-d1',  'jumping_up', 'ju_redirect_detour',          'Redirect to Toy Detour',            'Channel jumping energy into toy fetch or tug',                              1, 1, 'recovery',   null);

insert into skill_edges (from_skill_id, to_skill_id, edge_type, condition_summary) values
  ('ju-4paw-1',      'ju-autosit-2',   'advance',      'Dog keeps four paws down for 5+ seconds'),
  ('ju-autosit-2',   'ju-door-3',      'advance',      'Dog auto-sits when handler stands still'),
  ('ju-door-3',      'ju-stranger-4',  'advance',      'Dog sits at door for familiar people'),
  ('ju-stranger-4',  'ju-impulse-5',   'advance',      'Dog greets strangers without jumping 7/10'),
  ('ju-impulse-5',   'ju-proof-6',     'advance',      'Dog handles excitement without jumping'),
  ('ju-proof-6',     'ju-party-7',     'advance',      'Off cue works in 2+ new environments'),
  ('ju-door-3',      'ju-arousal-r1',  'regress',      'Dog jumps uncontrollably at door after progress'),
  ('ju-arousal-r1',  'ju-door-3',      'advance',      'Recovery restores calm at door'),
  ('ju-4paw-1',      'ju-redirect-d1', 'detour',       'Dog needs physical outlet before impulse work');

-- ─── BARKING ─────────────────────────────────────────────────────────────────

insert into skill_nodes (id, behavior, skill_code, title, description, stage, difficulty, kind, protocol_id) values
  ('bk-quiet-1',      'barking', 'bk_quiet_cue_foundation',     'Quiet Cue Foundation',              'Build association between quiet moment and reward',                         1, 1, 'foundation', 'settle_s1'),
  ('bk-look-2',       'barking', 'bk_look_at_that',             'Look at That',                      'Desensitize to triggers by rewarding calm observation',                     1, 2, 'foundation', 'settle_s1'),
  ('bk-threshold-3',  'barking', 'bk_threshold_mapping',        'Threshold Mapping',                 'Identify the distance at which the dog begins reacting',                    2, 2, 'core',       'settle_s2'),
  ('bk-place-4',      'barking', 'bk_place_at_threshold',       'Place Cue at Threshold',            'Settle on mat at threshold distance from trigger',                          2, 3, 'core',       'settle_s2'),
  ('bk-trigger-5',    'barking', 'bk_quiet_with_trigger',       'Quiet with Trigger Present',        'Hold quiet cue while trigger is visible at manageable distance',            3, 3, 'core',       'settle_s3'),
  ('bk-proof-6',      'barking', 'bk_real_world_proofing',      'Real-World Proofing',               'Manage barking in everyday contexts: doorbell, walks, windows',             3, 4, 'proofing',   'settle_s3'),
  ('bk-window-7',     'barking', 'bk_window_management',        'Window/Territorial Proofing',       'Reduce territorial barking at windows and boundaries',                      4, 4, 'proofing',   null),
  ('bk-deescalate-r1','barking', 'bk_deescalation_recovery',    'De-escalation Recovery',            'Interrupt a barking chain and redirect to calm behavior',                   2, 2, 'recovery',   null),
  ('bk-settle-d1',    'barking', 'bk_settle_detour',            'Settle Detour',                     'Use settling skills to manage arousal that drives barking',                 1, 2, 'recovery',   'settle_s1');

insert into skill_edges (from_skill_id, to_skill_id, edge_type, condition_summary) values
  ('bk-quiet-1',       'bk-look-2',        'advance',      'Dog offers 2 seconds of quiet on cue'),
  ('bk-look-2',        'bk-threshold-3',   'advance',      'Dog looks at trigger calmly at distance'),
  ('bk-threshold-3',   'bk-place-4',       'advance',      'Threshold distance identified and consistent'),
  ('bk-place-4',       'bk-trigger-5',     'advance',      'Dog settles at threshold 7/10 times'),
  ('bk-trigger-5',     'bk-proof-6',       'advance',      'Quiet cue holds for 10+ seconds near trigger'),
  ('bk-proof-6',       'bk-window-7',      'advance',      'Dog handles 2+ real-world triggers calmly'),
  ('bk-threshold-3',   'bk-deescalate-r1', 'regress',      'Dog barks intensely below previous threshold'),
  ('bk-deescalate-r1', 'bk-threshold-3',   'advance',      'Recovery restores threshold distance'),
  ('bk-quiet-1',       'bk-settle-d1',     'detour',       'Dog too aroused for quiet cue; needs settling first');

-- ─── POTTY TRAINING ──────────────────────────────────────────────────────────

insert into skill_nodes (id, behavior, skill_code, title, description, stage, difficulty, kind, protocol_id) values
  ('pt-schedule-1',    'potty_training', 'pt_schedule_foundation',    'Schedule Foundation',               'Establish consistent outdoor trips every 2 hours',                          1, 1, 'foundation', 'potty_s1'),
  ('pt-reward-2',      'potty_training', 'pt_reward_zone',            'Reward Zone Protocol',              'Immediately reward elimination in the correct spot',                        1, 2, 'foundation', 'potty_s1'),
  ('pt-crate-3',       'potty_training', 'pt_crate_rhythm',           'Crate for Potty Rhythm',            'Use crate to prevent accidents and build bladder control',                  2, 2, 'core',       'potty_s2'),
  ('pt-tether-4',      'potty_training', 'pt_tether_training',        'Tether Training Indoors',           'Supervise with tether to catch signals early',                              2, 3, 'core',       'potty_s2'),
  ('pt-oncue-5',       'potty_training', 'pt_potty_on_cue',           'Potty on Cue',                     'Dog eliminates on verbal cue at designated spot',                           3, 3, 'core',       'potty_s3'),
  ('pt-extend-6',      'potty_training', 'pt_extend_interval',        'Extend Interval',                  'Gradually extend time between outdoor trips to 3+ hours',                   3, 4, 'core',       'potty_s3'),
  ('pt-proof-7',       'potty_training', 'pt_novel_location',         'Novel Location Proofing',          'Potty on cue at new locations and surfaces',                                4, 4, 'proofing',   null),
  ('pt-regression-r1', 'potty_training', 'pt_regression_recovery',    'Regression Recovery',              'Return to shorter intervals after an accident pattern',                     1, 1, 'recovery',   'potty_s1'),
  ('pt-signal-d1',     'potty_training', 'pt_signal_training_detour', 'Signal Training Detour',           'Teach dog to signal when they need to go out (bell, bark, sit at door)',    2, 2, 'recovery',   'potty_s2');

insert into skill_edges (from_skill_id, to_skill_id, edge_type, condition_summary) values
  ('pt-schedule-1',    'pt-reward-2',       'advance',      '3 consecutive days with zero accidents on schedule'),
  ('pt-reward-2',      'pt-crate-3',        'advance',      'Dog eliminates outdoors consistently when taken out'),
  ('pt-crate-3',       'pt-tether-4',       'advance',      'Dog holds bladder in crate for 1+ hours'),
  ('pt-tether-4',      'pt-oncue-5',        'advance',      'Dog signals or waits at door to go out'),
  ('pt-oncue-5',       'pt-extend-6',       'advance',      'Dog eliminates on cue 8/10 times'),
  ('pt-extend-6',      'pt-proof-7',        'advance',      'Dog holds for 3+ hours reliably'),
  ('pt-crate-3',       'pt-regression-r1',  'regress',      'Multiple indoor accidents after previous success'),
  ('pt-regression-r1', 'pt-schedule-1',     'advance',      'Schedule reset restores clean record'),
  ('pt-tether-4',      'pt-signal-d1',      'detour',       'Dog does not signal need to go out');

-- ─── CRATE ANXIETY ───────────────────────────────────────────────────────────

insert into skill_nodes (id, behavior, skill_code, title, description, stage, difficulty, kind, protocol_id) values
  ('ca-intro-1',       'crate_anxiety', 'ca_crate_introduction',     'Crate Introduction',               'Positive association with crate - door open, treats inside',                1, 1, 'foundation', 'crate_s1'),
  ('ca-meals-2',       'crate_anxiety', 'ca_feeding_in_crate',       'Feeding in Crate',                 'Feed all meals inside the crate with door open',                            1, 2, 'foundation', 'crate_s1'),
  ('ca-closed-3',      'crate_anxiety', 'ca_door_closed_short',      'Door Closed - Short',              'Close door for 10-30 seconds while dog eats',                              2, 2, 'core',       'crate_s2'),
  ('ca-2min-4',        'crate_anxiety', 'ca_door_closed_2min',       'Door Closed - 2 Minutes',          'Dog relaxes in closed crate for 2 minutes',                                2, 3, 'core',       'crate_s2'),
  ('ca-sight-5',       'crate_anxiety', 'ca_out_of_sight_5min',      'Out of Sight - 5 Minutes',         'Leave room for 5 minutes while dog is crated',                             3, 3, 'core',       'crate_s3'),
  ('ca-20min-6',       'crate_anxiety', 'ca_out_of_sight_20min',     'Out of Sight - 20 Minutes',        'Dog rests calmly for 20 minutes alone in crate',                           3, 4, 'core',       'crate_s3'),
  ('ca-depart-7',      'crate_anxiety', 'ca_full_departure',         'Full Departure Routine',           'Complete departure: shoes, keys, leave — dog stays calm in crate',          4, 4, 'proofing',   null),
  ('ca-extended-8',    'crate_anxiety', 'ca_extended_duration',       'Extended Duration',                'Dog crates calmly for 1-2 hours during real absence',                       4, 5, 'proofing',   null),
  ('ca-panic-r1',      'crate_anxiety', 'ca_panic_recovery',         'Panic Recovery',                   'Return to open-door positive association after a panic event',              1, 1, 'recovery',   'crate_s1'),
  ('ca-relax-d1',      'crate_anxiety', 'ca_relaxation_detour',      'Relaxation Protocol Detour',       'Teach general relaxation skills before advancing crate duration',           1, 2, 'recovery',   null);

insert into skill_edges (from_skill_id, to_skill_id, edge_type, condition_summary) values
  ('ca-intro-1',    'ca-meals-2',     'advance',      'Dog enters crate voluntarily for treats'),
  ('ca-meals-2',    'ca-closed-3',    'advance',      'Dog eats full meal inside crate calmly'),
  ('ca-closed-3',   'ca-2min-4',      'advance',      'Dog relaxes with door closed for 30 seconds'),
  ('ca-2min-4',     'ca-sight-5',     'advance',      'Dog stays calm for 2 minutes in closed crate'),
  ('ca-sight-5',    'ca-20min-6',     'advance',      'Dog stays calm for 5 minutes out of sight'),
  ('ca-20min-6',    'ca-depart-7',    'advance',      'Dog rests 20 minutes alone without distress'),
  ('ca-depart-7',   'ca-extended-8',  'advance',      'Dog handles full departure routine calmly'),
  ('ca-closed-3',   'ca-panic-r1',    'regress',      'Dog panics when crate door closes'),
  ('ca-panic-r1',   'ca-intro-1',     'advance',      'Recovery restores positive crate association'),
  ('ca-2min-4',     'ca-relax-d1',    'detour',       'Dog shows stress signals; needs relaxation skills first'),
  ('ca-relax-d1',   'ca-2min-4',      'advance',      'Relaxation protocol improves crate tolerance');

-- ─── PUPPY BITING ────────────────────────────────────────────────────────────

insert into skill_nodes (id, behavior, skill_code, title, description, stage, difficulty, kind, protocol_id) values
  ('pb-yelp-1',        'puppy_biting', 'pb_bite_inhibition_yelp',   'Bite Inhibition - Yelp & Pause',   'Yelp and withdraw attention when bite pressure is too hard',                1, 1, 'foundation', 'biting_s1'),
  ('pb-redirect-2',    'puppy_biting', 'pb_redirect_to_toy',        'Redirect to Toy',                  'Immediately offer appropriate chew toy after any mouthing',                 1, 2, 'foundation', 'biting_s1'),
  ('pb-timeout-3',     'puppy_biting', 'pb_timeout_protocol',       'Time-Out Protocol',                'Short 10-second removal of attention for persistent mouthing',              2, 2, 'core',       'biting_s2'),
  ('pb-calm-4',        'puppy_biting', 'pb_calm_greeting',          'Calm Greeting Routine',            'Greet without mouthing; redirect excitement to sit',                        2, 3, 'core',       'biting_s2'),
  ('pb-threshold-5',   'puppy_biting', 'pb_bite_threshold',         'Bite Threshold Consistency',       'Consistently mark any tooth-on-skin contact as too hard',                   3, 3, 'core',       'biting_s3'),
  ('pb-play-6',        'puppy_biting', 'pb_proofing_excited_play',  'Proofing with Excited Play',       'Maintain bite inhibition during high-energy play sessions',                 3, 4, 'proofing',   'biting_s3'),
  ('pb-children-7',    'puppy_biting', 'pb_children_proofing',      'Children Interaction Proofing',    'Gentle mouth around children and fast-moving hands',                        4, 4, 'proofing',   null),
  ('pb-arousal-r1',    'puppy_biting', 'pb_arousal_down_recovery',  'Arousal Down Recovery',            'Settle on mat to reduce arousal that drives biting',                        1, 1, 'recovery',   null),
  ('pb-settle-d1',     'puppy_biting', 'pb_settle_detour',          'Settle on Mat Detour',             'Teach settle skills to reduce arousal-driven biting',                       1, 2, 'recovery',   'settle_s1');

insert into skill_edges (from_skill_id, to_skill_id, edge_type, condition_summary) values
  ('pb-yelp-1',       'pb-redirect-2',   'advance',      'Dog reduces bite pressure after yelp 7/10 times'),
  ('pb-redirect-2',   'pb-timeout-3',    'advance',      'Dog takes toy redirect 8/10 times'),
  ('pb-timeout-3',    'pb-calm-4',       'advance',      'Mouthing stops within 2 repetitions of timeout'),
  ('pb-calm-4',       'pb-threshold-5',  'advance',      'Dog greets without mouthing 8/10 times'),
  ('pb-threshold-5',  'pb-play-6',       'advance',      'Zero tooth-on-skin contact for 3 consecutive sessions'),
  ('pb-play-6',       'pb-children-7',   'advance',      'Bite inhibition holds during excited play'),
  ('pb-timeout-3',    'pb-arousal-r1',   'regress',      'Dog escalates biting after timeout instead of calming'),
  ('pb-arousal-r1',   'pb-redirect-2',   'advance',      'Arousal management allows redirect to work again'),
  ('pb-yelp-1',       'pb-settle-d1',    'detour',       'Puppy too aroused for yelp to be effective');

-- ─── SETTLING ────────────────────────────────────────────────────────────────

insert into skill_nodes (id, behavior, skill_code, title, description, stage, difficulty, kind, protocol_id) values
  ('st-marker-1',      'settling', 'st_marker_reward_foundation', 'Marker Reward Foundation',          'Teach marker word and reward delivery on mat',                              1, 1, 'foundation', 'settle_s1'),
  ('st-mat-2',         'settling', 'st_mat_introduction',         'Mat Introduction',                  'Go to mat and lie down on cue',                                             1, 2, 'foundation', 'settle_s1'),
  ('st-duration-3',    'settling', 'st_duration_on_mat',          'Duration on Mat',                   'Stay settled on mat for increasing durations (30s → 5min)',                  2, 2, 'core',       'settle_s2'),
  ('st-household-4',   'settling', 'st_household_distraction',    'Settle with Household Distraction', 'Remain settled while people move around and talk',                          2, 3, 'core',       'settle_s2'),
  ('st-distance-5',    'settling', 'st_place_from_distance',      'Place from Distance',               'Go to mat on cue from across the room',                                     3, 3, 'core',       'settle_s3'),
  ('st-realworld-6',   'settling', 'st_real_world_settle',        'Real-World Settle',                 'Settle in cafes, vet waiting rooms, and public spaces',                     3, 4, 'core',       'settle_s3'),
  ('st-proof-7',       'settling', 'st_distraction_proofing',     'Distraction Proofing',              'Maintain settle near movement, noise, and food distractions',               4, 4, 'proofing',   null),
  ('st-extended-8',    'settling', 'st_extended_settle',           'Extended Settle',                   'Settle for 30+ minutes in a real-world context',                            4, 5, 'proofing',   null),
  ('st-downshift-r1',  'settling', 'st_recovery_downshift',       'Recovery Downshift',                'Help an over-aroused dog return to calm settle state',                      1, 1, 'recovery',   null),
  ('st-arousal-diag',  'settling', 'st_arousal_check',            'Arousal Level Check',               'Diagnostic: assess baseline arousal before settling work',                  1, 1, 'diagnostic', null);

insert into skill_edges (from_skill_id, to_skill_id, edge_type, condition_summary) values
  ('st-arousal-diag', 'st-marker-1',     'prerequisite', 'Arousal check completed'),
  ('st-marker-1',     'st-mat-2',        'advance',      'Dog understands marker word and takes treats calmly'),
  ('st-mat-2',        'st-duration-3',   'advance',      'Dog goes to mat and lies down on cue within 5 seconds'),
  ('st-duration-3',   'st-household-4',  'advance',      'Dog stays on mat for 2+ minutes at home'),
  ('st-household-4',  'st-distance-5',   'advance',      'Dog settles with normal household activity'),
  ('st-distance-5',   'st-realworld-6',  'advance',      'Dog goes to mat on cue from 10+ feet away'),
  ('st-realworld-6',  'st-proof-7',      'advance',      'Dog settles in 2+ real-world locations'),
  ('st-proof-7',      'st-extended-8',   'advance',      'Dog handles moderate distractions while settled'),
  ('st-duration-3',   'st-downshift-r1', 'regress',      'Dog cannot settle for even 30 seconds after previous success'),
  ('st-downshift-r1', 'st-mat-2',        'advance',      'Recovery restores basic mat behavior');

-- ─── CROSS-BEHAVIOR EDGES ────────────────────────────────────────────────────

insert into skill_edges (from_skill_id, to_skill_id, edge_type, condition_summary) values
  -- Settling foundation supports leash work and barking management
  ('st-marker-1',   'llw-attn-1',   'prerequisite', 'Basic marker/reward skills needed for leash work'),
  ('st-mat-2',      'bk-quiet-1',   'prerequisite', 'Mat skills needed for barking threshold work'),
  -- Recall name response supports leash engagement
  ('rc-attn-1',     'llw-slack-2',   'detour',       'Name response helps build leash engagement'),
  -- Settling helps with puppy biting arousal
  ('st-marker-1',   'pb-settle-d1',  'prerequisite', 'Marker foundation needed for biting settle detour'),
  -- Crate training connects to settling
  ('st-duration-3', 'ca-closed-3',   'detour',       'Duration settle skills transfer to crate duration');
