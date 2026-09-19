-- Plain, sentence-case session titles for the skill graph.
-- Real plans take session titles from skill_nodes.title, so this is what owners see.
-- Descriptions are unchanged.

-- Keep the old titles so saved plans can be matched below.
create temp table _old_skill_titles as select id, title from skill_nodes;

-- leash_pulling
update skill_nodes set title = 'Look up at their name' where id = 'llw-attn-1';
update skill_nodes set title = 'Treat the slack leash' where id = 'llw-slack-2';
update skill_nodes set title = 'Stop when it goes tight' where id = 'llw-stop-3';
update skill_nodes set title = 'Turn and go' where id = 'llw-dir-4';
update skill_nodes set title = 'Walk a quiet street' where id = 'llw-outdoor-5';
update skill_nodes set title = 'Wait at crossings' where id = 'llw-cross-6';
update skill_nodes set title = 'Walk past dogs and people' where id = 'llw-proof-7';
update skill_nodes set title = 'Walk a busy street' where id = 'llw-busy-8';
update skill_nodes set title = 'Calm down, then walk on' where id = 'llw-arousal-r1';
update skill_nodes set title = 'Get their attention back' where id = 'llw-engage-r2';
-- recall
update skill_nodes set title = 'Name game' where id = 'rc-attn-1';
update skill_nodes set title = 'Turn to their name' where id = 'rc-name-2';
update skill_nodes set title = 'Come from 10 feet indoors' where id = 'rc-short-3';
update skill_nodes set title = 'Come with distractions indoors' where id = 'rc-distract-4';
update skill_nodes set title = 'Come outside on a long line' where id = 'rc-outdoor-5';
update skill_nodes set title = 'Come from 20 feet' where id = 'rc-longline-6';
update skill_nodes set title = 'Come away from other dogs' where id = 'rc-proof-7';
update skill_nodes set title = 'Emergency recall word' where id = 'rc-emergency-8';
update skill_nodes set title = 'Back to basics after a miss' where id = 'rc-recover-r1';
update skill_nodes set title = 'Make coming back worth it' where id = 'rc-engage-r2';
-- jumping_up
update skill_nodes set title = 'Four paws for a hello' where id = 'ju-4paw-1';
update skill_nodes set title = 'Sit to get attention' where id = 'ju-autosit-2';
update skill_nodes set title = 'Greeting at the door' where id = 'ju-door-3';
update skill_nodes set title = 'Say hi to new people' where id = 'ju-stranger-4';
update skill_nodes set title = 'Keep paws down when excited' where id = 'ju-impulse-5';
update skill_nodes set title = 'Off cue in new places' where id = 'ju-proof-6';
update skill_nodes set title = 'Greet a group of people' where id = 'ju-party-7';
update skill_nodes set title = 'Calm down after jumping' where id = 'ju-arousal-r1';
update skill_nodes set title = 'Tug instead of jumping' where id = 'ju-redirect-d1';
-- barking
update skill_nodes set title = 'Teach a quiet cue' where id = 'bk-quiet-1';
update skill_nodes set title = 'Look at that game' where id = 'bk-look-2';
update skill_nodes set title = 'Find their comfortable distance' where id = 'bk-threshold-3';
update skill_nodes set title = 'Mat time at a distance' where id = 'bk-place-4';
update skill_nodes set title = 'Quiet with the trigger nearby' where id = 'bk-trigger-5';
update skill_nodes set title = 'Quiet at the doorbell' where id = 'bk-proof-6';
update skill_nodes set title = 'Quiet at the window' where id = 'bk-window-7';
update skill_nodes set title = 'Break up a barking fit' where id = 'bk-deescalate-r1';
update skill_nodes set title = 'Settle on a mat first' where id = 'bk-settle-d1';
-- potty_training
update skill_nodes set title = 'Out every 2 hours' where id = 'pt-schedule-1';
update skill_nodes set title = 'Treat at the potty spot' where id = 'pt-reward-2';
update skill_nodes set title = 'Crate between potty trips' where id = 'pt-crate-3';
update skill_nodes set title = 'Leashed to you indoors' where id = 'pt-tether-4';
update skill_nodes set title = 'Potty on cue' where id = 'pt-oncue-5';
update skill_nodes set title = 'Stretch to 3 hours' where id = 'pt-extend-6';
update skill_nodes set title = 'Potty in new places' where id = 'pt-proof-7';
update skill_nodes set title = 'Shorter gaps after accidents' where id = 'pt-regression-r1';
update skill_nodes set title = 'Ring a bell to go out' where id = 'pt-signal-d1';
-- crate_anxiety
update skill_nodes set title = 'Explore the open crate' where id = 'ca-intro-1';
update skill_nodes set title = 'Meals in the crate' where id = 'ca-meals-2';
update skill_nodes set title = 'Door closed for 10 seconds' where id = 'ca-closed-3';
update skill_nodes set title = 'Door closed for 2 minutes' where id = 'ca-2min-4';
update skill_nodes set title = 'Out of sight for 5 minutes' where id = 'ca-sight-5';
update skill_nodes set title = 'Out of sight for 20 minutes' where id = 'ca-20min-6';
update skill_nodes set title = 'Practice leaving the house' where id = 'ca-depart-7';
update skill_nodes set title = 'Crated for 1 to 2 hours' where id = 'ca-extended-8';
update skill_nodes set title = 'Back to the open door' where id = 'ca-panic-r1';
update skill_nodes set title = 'Learn to relax first' where id = 'ca-relax-d1';
-- puppy_biting
update skill_nodes set title = 'Ouch, then pause' where id = 'pb-yelp-1';
update skill_nodes set title = 'Swap hands for a toy' where id = 'pb-redirect-2';
update skill_nodes set title = 'Short break for hard bites' where id = 'pb-timeout-3';
update skill_nodes set title = 'Calm hellos, no teeth' where id = 'pb-calm-4';
update skill_nodes set title = 'No teeth on skin' where id = 'pb-threshold-5';
update skill_nodes set title = 'Soft mouth during play' where id = 'pb-play-6';
update skill_nodes set title = 'Soft mouth around kids' where id = 'pb-children-7';
update skill_nodes set title = 'Calm down on the mat' where id = 'pb-arousal-r1';
update skill_nodes set title = 'Learn to settle on a mat' where id = 'pb-settle-d1';
-- settling
update skill_nodes set title = 'Mark and treat on the mat' where id = 'st-marker-1';
update skill_nodes set title = 'Lie down on the mat' where id = 'st-mat-2';
update skill_nodes set title = 'Stay on the mat longer' where id = 'st-duration-3';
update skill_nodes set title = 'Settle in a busy house' where id = 'st-household-4';
update skill_nodes set title = 'Mat from across the room' where id = 'st-distance-5';
update skill_nodes set title = 'Settle at a cafe' where id = 'st-realworld-6';
update skill_nodes set title = 'Settle with distractions' where id = 'st-proof-7';
update skill_nodes set title = 'Settle for 30 minutes' where id = 'st-extended-8';
update skill_nodes set title = 'Help them calm down' where id = 'st-downshift-r1';
update skill_nodes set title = 'Check how wound up they are' where id = 'st-arousal-diag';

-- Saved plans store sessions as a jsonb array on plans.sessions.
-- Rename a session only when its skillId matches a node and its title is still
-- exactly the old node title, so derived or edited titles are left alone.
update plans p
set sessions = (
  select jsonb_agg(
    case when o.id is not null
      then jsonb_set(e, '{title}', to_jsonb(n.title))
      else e
    end
    order by t.ord
  )
  from jsonb_array_elements(p.sessions) with ordinality as t(e, ord)
  left join _old_skill_titles o
    on o.id = t.e->>'skillId' and o.title = t.e->>'title'
  left join skill_nodes n on n.id = o.id
)
where jsonb_typeof(p.sessions) = 'array'
  and exists (
    select 1
    from jsonb_array_elements(p.sessions) e
    join _old_skill_titles o on o.id = e->>'skillId' and o.title = e->>'title'
    join skill_nodes n on n.id = o.id
    where n.title <> o.title
  );

-- Rules-based plans (no skillId) take titles from the fixed sequences in
-- lib/planGenerator.ts. Match on exerciseId and the exact old title.
create temp table _sequence_titles (exercise_id text, old_title text, new_title text);
insert into _sequence_titles (exercise_id, old_title, new_title) values
  ('ll_01', 'Name recognition & eye contact', 'Look up at their name'),
  ('ll_02', 'Stand still — pressure off', 'Stop when it goes tight'),
  ('ll_03', 'One step & stop', 'One step, then stop'),
  ('ll_04', 'Change of direction', 'Turn and go'),
  ('ll_06', 'Walking on a loose leash — short distance', 'Short loose leash walks'),
  ('ll_07', 'Distraction proofing — other dogs', 'Walk past other dogs'),
  ('ll_08', 'Loose leash on busy street', 'Walk a busy street'),
  ('ju_01', 'Four-on-floor for greetings', 'Four paws for a hello'),
  ('ju_02', 'Auto-sit for attention', 'Sit to get attention'),
  ('ju_03', 'Door greeting protocol', 'Greeting at the door'),
  ('ju_04', 'Stranger greeting practice', 'Say hi to new people'),
  ('ju_05', 'Impulse control — excitement threshold', 'Keep paws down when excited'),
  ('ju_06', 'Off cue proofing', 'Off cue in new places'),
  ('bk_01', 'Quiet cue foundation', 'Teach a quiet cue'),
  ('bk_02', 'Look at That — desensitisation', 'Look at that game'),
  ('bk_03', 'Threshold mapping', 'Find their comfortable distance'),
  ('bk_04', 'Place cue at threshold', 'Mat time at a distance'),
  ('bk_05', 'Quiet cue with trigger present', 'Quiet with the trigger nearby'),
  ('bk_06', 'Real-world proofing', 'Quiet at the doorbell'),
  ('rc_01', 'Name game — high value rewards', 'Name game'),
  ('rc_02', 'Recall from 3 feet', 'Come from 3 feet'),
  ('rc_03', 'Recall from 10 feet', 'Come from 10 feet'),
  ('rc_04', 'Recall with mild distraction', 'Come past a small distraction'),
  ('rc_05', 'Long-line recall — 20 feet', 'Long line, 20 feet'),
  ('rc_06', 'Emergency recall cue', 'Emergency recall word'),
  ('rc_07', 'Off-leash recall in enclosed area', 'Off leash in a fenced area'),
  ('pt_01', 'Establish schedule — every 2 hours', 'Out every 2 hours'),
  ('pt_02', 'Reward zone protocol', 'Treat at the potty spot'),
  ('pt_03', 'Crate introduction for potty rhythm', 'Crate between potty trips'),
  ('pt_04', 'Tether training indoors', 'Leashed to you indoors'),
  ('pt_06', 'Extend interval to 3 hours', 'Stretch to 3 hours'),
  ('ca_01', 'Open door exploration', 'Explore the open crate'),
  ('ca_02', 'Meals inside — building love', 'Meals in the crate'),
  ('ca_03', 'Door closed, 10 seconds', 'Door closed for 10 seconds'),
  ('ca_04', 'Door closed, 2 minutes', 'Door closed for 2 minutes'),
  ('ca_05', 'Out of sight, 5 minutes', 'Out of sight for 5 minutes'),
  ('ca_06', 'Out of sight, 20 minutes', 'Out of sight for 20 minutes'),
  ('ca_07', 'Full departure routine', 'Practice leaving the house'),
  ('pb_01', 'Yelp & pause — pressure off', 'Ouch, then pause'),
  ('pb_02', 'Toy redirect on contact', 'Swap hands for a toy'),
  ('pb_03', 'Time-out for hard bites', 'Short break for hard bites'),
  ('pb_04', 'Calm four-paws greeting', 'Calm hellos, no teeth'),
  ('pb_05', 'Mat settle to wind down', 'Wind down on the mat'),
  ('pb_06', 'Stay soft in excited play', 'Soft mouth during play'),
  ('st_01', 'Mat introduction', 'Meet the mat'),
  ('st_02', 'Down on mat on cue', 'Lie down on the mat'),
  ('st_03', '30-second hold', 'Mat for 30 seconds'),
  ('st_04', '3-minute hold', 'Mat for 3 minutes'),
  ('st_05', 'Calm during household activity', 'Settle in a busy house'),
  ('st_06', 'Hold with mild distractions', 'Settle with small distractions'),
  ('st_07', 'Real-world café or visit', 'Settle at a cafe'),
  ('li_01', 'Hand targeting foundation', 'Nose to your hand'),
  ('li_02', 'Floor drop on cue', 'Leave food on the floor'),
  ('li_03', 'Trade up — toy for treat', 'Trade a toy for a treat'),
  ('li_04', 'Moving object self-control', 'Leave a rolling treat'),
  ('li_05', 'High-distraction proofing', 'Leave it with distractions'),
  ('li_06', 'Real-world street & park', 'Leave it on the street'),
  ('ob_01', 'Sit on cue from a lure', 'Lure a sit'),
  ('ob_02', 'Down on cue from a lure', 'Lure a down'),
  ('ob_03', '5-second stay', 'Stay for 5 seconds'),
  ('ob_04', 'Name recall foundation', 'Come when called'),
  ('ob_05', 'Sit → down → stay chain', 'Sit, down, then stay'),
  ('sa_01', '10-second calm goodbye', 'A calm 10-second goodbye'),
  ('sa_02', 'Keys & coat — no big deal', 'Grab your keys, stay home'),
  ('sa_03', 'Out of sight, 2 minutes', 'Out of sight for 2 minutes'),
  ('sa_04', 'Out of sight, 10 minutes', 'Out of sight for 10 minutes'),
  ('sa_05', 'Full 30-minute alone stretch', 'Alone for 30 minutes'),
  ('sa_06', 'Random departure times', 'Leave at different times'),
  ('dm_01', 'Automatic sit at the door', 'Sit at the door'),
  ('dm_02', 'Hold at the threshold', 'Wait at the doorway'),
  ('dm_03', 'Hold with door fully open', 'Wait with the door open'),
  ('dm_04', 'Hold while a visitor arrives', 'Wait while a visitor comes in'),
  ('dm_05', 'Release on cue — proofing', 'Wait for the release word'),
  ('dm_06', 'Front door in real life', 'Wait when the doorbell rings'),
  ('ic_01', 'It''s Your Choice foundation', 'The closed-hand game'),
  ('ic_03', 'Sit calmly before meals', 'Sit before the bowl goes down'),
  ('ic_04', 'Wait for the toy — then release', 'Wait, then get the toy'),
  ('ic_05', 'Hold it together near triggers', 'Stay calm near exciting things'),
  ('ic_06', 'Real-world self-control', 'Self-control on walks'),
  ('cc_01', 'Nose-to-hand touch target', 'Nose to your hand'),
  ('cc_03', 'Ears, paws — no big deal', 'Handle ears and paws'),
  ('cc_04', 'Nail touching & clippers near', 'Nails, one tap at a time'),
  ('cc_05', 'Calm under gentle restraint', 'Calm while held still'),
  ('cc_06', 'Mock vet table & exam', 'Practice a vet exam'),
  ('ws_01', 'One step back & return', 'One step back, then return'),
  ('ws_02', '10-second hold', 'Stay for 10 seconds'),
  ('ws_03', '30-second hold', 'Stay for 30 seconds'),
  ('ws_04', 'Hold while you move around', 'Stay while you move around'),
  ('ws_05', '3-minute hold', 'Stay for 3 minutes'),
  ('ws_06', 'Hold with distractions', 'Stay with distractions'),
  ('lr_01', 'Look at That — below threshold', 'Look at that, far away'),
  ('lr_02', 'U-turn on trigger', 'U-turn away from the trigger'),
  ('lr_03', 'Parallel walking — far distance', 'Parallel walk, far apart'),
  ('lr_04', 'Parallel walking — close distance', 'Parallel walk, closer in'),
  ('lr_05', 'Threshold approach — calm passes', 'Pass a dog calmly'),
  ('lr_06', 'Real-world reactive walk', 'An everyday walk'),
  ('si_01', 'Lure into position', 'Lure a sit'),
  ('si_05', 'Hold it with distractions', 'Sit with distractions'),
  ('si_06', 'New places, same response', 'Sit in new places'),
  ('dn_05', 'Hold it with distractions', 'Down with distractions'),
  ('dn_06', 'New places, same response', 'Down in new places'),
  ('hl_01', 'Find the sweet spot position', 'Find the spot at your side'),
  ('hl_02', '5 steps clean beside you', '5 steps at your side'),
  ('hl_04', 'Off-leash in the yard', 'Off leash in the yard'),
  ('hl_05', 'Hold form near distractions', 'Heel past distractions'),
  ('hl_06', 'Real-world sidewalk', 'Heel on the sidewalk');

update plans p
set sessions = (
  select jsonb_agg(
    case when st.exercise_id is not null
      then jsonb_set(e, '{title}', to_jsonb(st.new_title))
      else e
    end
    order by t.ord
  )
  from jsonb_array_elements(p.sessions) with ordinality as t(e, ord)
  left join _sequence_titles st
    on st.exercise_id = t.e->>'exerciseId'
   and st.old_title = t.e->>'title'
   and t.e->>'skillId' is null
)
where jsonb_typeof(p.sessions) = 'array'
  and exists (
    select 1
    from jsonb_array_elements(p.sessions) e
    join _sequence_titles st
      on st.exercise_id = e->>'exerciseId' and st.old_title = e->>'title'
    where e->>'skillId' is null
  );

-- Course names saved on multi-course plans (lib/addCourseUtils.ts).
update plans set course_title = case course_title
  when 'Loose Leash Walking' then 'Loose leash walking'
  when 'Jumping Up' then 'Polite greetings'
  when 'Calm Barking' then 'Quiet on cue'
  when 'Reliable Recall' then 'Coming when called'
  when 'Potty Training' then 'Potty training'
  when 'Crate Confidence' then 'Crate training'
  when 'Bite Inhibition' then 'Gentle mouth'
  when 'Calm Settling' then 'Settle on a mat'
  when 'Leave It' then 'Leave it'
  when 'Basic Obedience' then 'Basic cues'
  when 'Separation Anxiety' then 'Home alone'
  when 'Door Manners' then 'Door manners'
  when 'Impulse Control' then 'Self-control'
  when 'Cooperative Care' then 'Handling and vet visits'
  when 'Wait & Stay' then 'Wait and stay'
  when 'Leash Reactivity' then 'Calm on leash'
  else course_title end
where course_title in ('Loose Leash Walking', 'Jumping Up', 'Calm Barking', 'Reliable Recall', 'Potty Training', 'Crate Confidence', 'Bite Inhibition', 'Calm Settling', 'Leave It', 'Basic Obedience', 'Separation Anxiety', 'Door Manners', 'Impulse Control', 'Cooperative Care', 'Wait & Stay', 'Leash Reactivity');

drop table _old_skill_titles;
drop table _sequence_titles;
