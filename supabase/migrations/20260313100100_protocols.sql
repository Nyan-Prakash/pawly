-- ─────────────────────────────────────────────────────────────────────────────
-- PR 04: Protocol Content Engine
-- Creates the protocols table and seeds all 21 v1 protocols
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS protocols (
  id                TEXT PRIMARY KEY,
  behavior          TEXT NOT NULL,
  stage             SMALLINT NOT NULL CHECK (stage BETWEEN 1 AND 4),
  title             TEXT NOT NULL,
  objective         TEXT NOT NULL,
  duration_minutes  SMALLINT NOT NULL,
  rep_count         SMALLINT NOT NULL,
  steps             JSONB NOT NULL DEFAULT '[]',
  success_criteria  TEXT NOT NULL,
  common_mistakes   TEXT[] NOT NULL DEFAULT '{}',
  equipment_needed  TEXT[] NOT NULL DEFAULT '{}',
  age_min_months    SMALLINT NOT NULL DEFAULT 8,
  age_max_months    SMALLINT NOT NULL DEFAULT 999,
  difficulty        SMALLINT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  next_protocol_id  TEXT REFERENCES protocols(id),
  trainer_note      TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS (protocols are public read, admin write)
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "protocols_public_read"
  ON protocols FOR SELECT
  USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: Loose Leash Walking
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO protocols (id, behavior, stage, title, objective, duration_minutes, rep_count, steps, success_criteria, common_mistakes, equipment_needed, age_min_months, age_max_months, difficulty, next_protocol_id, trainer_note) VALUES

('llw_s1', 'leash_pulling', 1, 'Focus & Attention at Heel',
 'Teach your dog to respond to their name and offer eye contact while standing still at your side — the foundation of all leash work.',
 8, 20,
 '[
   {"order":1,"instruction":"Stand still in a low-distraction room with your dog on leash. Hold 5–6 high-value treats in your hand. Let the leash hang slack.","durationSeconds":null,"reps":null,"tip":"The leash should never be tight at any point during this exercise.","successLook":"Dog stands near you, leash loose."},
   {"order":2,"instruction":"Say your dog''s name once in a calm, clear tone. The moment they turn their head toward you or make eye contact, immediately mark with ''yes!'' and deliver a treat at your hip height.","durationSeconds":null,"reps":10,"tip":"Only say the name once. Repeating it teaches your dog the name means nothing.","successLook":"Dog turns head toward you within 3 seconds of hearing their name."},
   {"order":3,"instruction":"After 5 successful name responses, raise the criteria: wait for direct eye contact. Mark ''yes!'' the instant their eyes meet yours, treat at hip.","durationSeconds":null,"reps":10,"tip":"Deliver the treat at your hip — not in front of you — so your dog learns the reward zone is beside your leg.","successLook":"Dog looks up at your face, not just toward you."},
   {"order":4,"instruction":"Take 2–3 steps forward. Stop. Say your dog''s name. Wait for eye contact. Mark and treat. Repeat 5 times.","durationSeconds":null,"reps":5,"tip":"Move slowly and casually. You are waiting for the dog to check in.","successLook":"Dog checks in within 5 seconds of you stopping."},
   {"order":5,"instruction":"End the session. Let your dog sniff around freely for 60 seconds as a reward.","durationSeconds":60,"reps":null,"tip":null,"successLook":"Dog relaxed and engaged throughout session."}
 ]'::jsonb,
 'Dog responds to name with eye contact 8 out of 10 attempts in a low-distraction environment.',
 ARRAY['Repeating the dog''s name multiple times','Giving the treat in front of your body instead of at your hip','Moving too fast before the name response is solid'],
 ARRAY['4–6 foot flat leash','High-value treats (chicken, cheese, hot dog)'],
 8, 999, 1, 'llw_s2',
 'This exercise looks boring but it is the single most important foundation for leash manners. Dogs that check in reliably are dogs that can be guided through distractions.'),

('llw_s2', 'leash_pulling', 2, 'Stop-and-Wait: Tension Off, Forward On',
 'Teach your dog that leash tension makes you stop and leash slack makes you move.',
 10, 15,
 '[
   {"order":1,"instruction":"Start in a hallway or low-traffic area. Begin walking at a normal pace with your dog on a 4–6 foot leash.","durationSeconds":null,"reps":null,"tip":"You will be stopping and starting frequently. This is normal — stick with it.","successLook":"You are moving, dog is at your side."},
   {"order":2,"instruction":"The moment the leash becomes taut — any tension at all — STOP walking. Become a statue. Do not yank, say anything, or repeat their name.","durationSeconds":null,"reps":null,"tip":"The stop must happen the instant you feel tension, not a few steps later.","successLook":"You are frozen, leash is tight, dog notices something changed."},
   {"order":3,"instruction":"Wait. Your dog will eventually turn to look at you or take a step back, creating slack. The moment there is ANY slack, say ''yes!'' and immediately start walking forward again as the reward.","durationSeconds":null,"reps":null,"tip":"Movement forward IS the reward. Your dog wants to go forward — use that.","successLook":"Dog takes one step toward you or pauses, leash goes slack."},
   {"order":4,"instruction":"Repeat: walk → tension → stop → wait → slack → ''yes!'' → walk. Do 15 cycles within your session.","durationSeconds":null,"reps":15,"tip":"Do not do this on a route with lots of interesting smells yet.","successLook":"Dog begins to self-correct before you stop, slowing down near tension."},
   {"order":5,"instruction":"After 10 successful slack responses, try a treat scatter every 20–30 steps of loose leash: toss 3 tiny treats near your feet.","durationSeconds":null,"reps":null,"tip":"Scatter the treats near your feet — not ahead of you.","successLook":"Dog walks beside you, checks in naturally, leash hangs in a J-shape."}
 ]'::jsonb,
 'Dog self-corrects by releasing tension within 5 seconds of you stopping, 10 out of 15 repetitions.',
 ARRAY['Stopping too late — the stop must happen instantly','Saying the dog''s name or "no" when they pull','Walking forward on a tight leash'],
 ARRAY['4–6 foot flat leash','Front-clip harness or flat collar (no retractable)','High-value treats'],
 8, 999, 2, 'llw_s3',
 'Most owners see improvement within 3–5 sessions. Consistency across all household members is essential.'),

('llw_s3', 'leash_pulling', 3, 'Direction Changes & Real-World Engagement',
 'Proof loose leash walking with unexpected direction changes and increase engagement during actual neighborhood walks.',
 12, 12,
 '[
   {"order":1,"instruction":"When your dog is slightly ahead of you (not pulling yet), make a sudden, cheerful U-turn in the opposite direction. Say ''this way!'' as you turn and walk briskly in the new direction.","durationSeconds":null,"reps":null,"tip":"Be energetic when you turn — your body language signals something exciting.","successLook":"Dog trots to catch up with you, checking in as they reach your side."},
   {"order":2,"instruction":"When the dog catches up and walks beside you with a loose leash, mark ''yes!'' and give a treat at your hip.","durationSeconds":null,"reps":null,"tip":null,"successLook":"Leash in J-shape, dog at hip level."},
   {"order":3,"instruction":"Vary your direction changes unpredictably: left, right, U-turn, slow down, speed up. Do at least 12 direction changes in a 10-minute walk.","durationSeconds":null,"reps":12,"tip":"Be unpredictable — your dog should feel like they need to keep an eye on you.","successLook":"Dog glances at you frequently without being cued, anticipating direction changes."},
   {"order":4,"instruction":"Introduce one mild distraction. Approach to your dog''s threshold distance. Practice 3 direction changes near the distraction.","durationSeconds":null,"reps":3,"tip":"If your dog lunges or fixates, back up 5 steps and try from farther away.","successLook":"Dog notices distraction, looks at it briefly, then checks back with you."},
   {"order":5,"instruction":"End the walk with a 2-minute free sniff period — drop criteria completely and let the dog sniff whatever they want.","durationSeconds":120,"reps":null,"tip":"A sniff walk is not giving up — it is a calculated reward.","successLook":"Dog relaxed, sniffing freely, decompress after structured work."}
 ]'::jsonb,
 'Dog responds to 10 of 12 direction changes by catching up and checking in without tension.',
 ARRAY['Turning too slowly','Not reinforcing the catch-up moment','Skipping the free sniff','Advancing to busy environments too quickly'],
 ARRAY['4–6 foot flat leash','Front-clip harness','High-value treats','Treat pouch'],
 8, 999, 3, NULL,
 'By Stage 3, your dog should walk nicely on quiet streets. Busy streets require months of additional practice.');

-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: Recall
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO protocols (id, behavior, stage, title, objective, duration_minutes, rep_count, steps, success_criteria, common_mistakes, equipment_needed, age_min_months, age_max_months, difficulty, next_protocol_id, trainer_note) VALUES

('recall_s1', 'recall', 1, 'Name Response at Close Distance Indoors',
 'Build a rock-solid, automatic response to the dog''s name at close range in a distraction-free environment.',
 8, 20,
 '[
   {"order":1,"instruction":"Prepare 20 tiny high-value treats. Sit on the floor in a quiet room. Have your dog nearby but not looking at you.","durationSeconds":null,"reps":null,"tip":"The floor puts you at the dog''s level, which is more inviting.","successLook":"Dog is calm and nearby, attention elsewhere."},
   {"order":2,"instruction":"Say your dog''s name once in a bright, happy tone. The millisecond they look at you, say ''yes!'' and immediately toss a treat toward them so they take 1–2 steps in your direction. Do 10 reps.","durationSeconds":null,"reps":10,"tip":"Toss the treat toward you so the dog takes steps in your direction.","successLook":"Dog immediately orients toward you when their name is called."},
   {"order":3,"instruction":"Raise criteria: say the name, wait for the look, then wait 2–3 seconds before treating so the dog holds their gaze.","durationSeconds":null,"reps":5,"tip":null,"successLook":"Dog looks at you and holds eye contact for 2 seconds."},
   {"order":4,"instruction":"Stand up. Move to the other side of the room. Call the dog''s name. When they look, pat your legs and say ''yes!'' as they walk toward you. Give a jackpot of 3–4 treats when they arrive.","durationSeconds":null,"reps":5,"tip":"Save jackpots for the moment of arrival — it teaches that COMING to you is incredibly valuable.","successLook":"Dog trots across the room to reach you after hearing their name."}
 ]'::jsonb,
 'Dog looks at handler and begins moving toward them within 2 seconds of name, 9 out of 10 trials indoors.',
 ARRAY['Calling the name too often — it becomes background noise','Calling before something unpleasant (bath, nail trim)','Under-rewarding a slow but correct response'],
 ARRAY['High-value treats (chicken, freeze-dried liver)','Quiet indoor space'],
 8, 999, 1, 'recall_s2',
 'Never call your dog''s name to do something they dislike until the recall is bombproof. Protect the name cue like it is gold.'),

('recall_s2', 'recall', 2, 'Recall with Light Distraction Indoors',
 'Proof the recall cue with mild distractions present and increase distance to 15–20 feet inside the home.',
 10, 15,
 '[
   {"order":1,"instruction":"Introduce your recall cue word: say the dog''s name first, then your cue: ''[Name], come!'' Say it once. Do not repeat.","durationSeconds":null,"reps":null,"tip":"The name grabs attention, the recall cue means run to me.","successLook":"Dog looks up immediately at their name before ''come''."},
   {"order":2,"instruction":"Practice recall from different rooms. Call from the kitchen while dog is in the living room. Each successful recall earns a jackpot. Do 8 reps.","durationSeconds":null,"reps":8,"tip":"Vary your location — this teaches the dog that ''come'' works everywhere.","successLook":"Dog comes running from another room within 5 seconds."},
   {"order":3,"instruction":"Add a mild distraction: turn on the TV. Scatter a few boring kibble pieces for the dog to sniff. After 10 seconds, call. Huge jackpot if they come. If not, clap and run away.","durationSeconds":null,"reps":5,"tip":"Running away from the dog is one of the most powerful recall tools.","successLook":"Dog leaves the kibble and comes to you when called."},
   {"order":4,"instruction":"Practice a run-to-me game: crouch down, open arms, say ''come!'' when the dog is 15+ feet away. Make coming to you feel like the best thing ever.","durationSeconds":null,"reps":2,"tip":null,"successLook":"Dog sprints toward you and pushes into your hands for treats."}
 ]'::jsonb,
 'Dog recalls from another room and away from mild distractions 8 out of 10 times.',
 ARRAY['Calling ''come'' when you cannot enforce it','Punishing a slow recall','Not varying locations enough'],
 ARRAY['High-value treats','Quiet indoor space with mild distractions'],
 8, 999, 2, 'recall_s3',
 'Ten indoor sessions is a minimum before attempting outdoor recall.'),

('recall_s3', 'recall', 3, 'Recall in Low-Distraction Outdoor Environments',
 'Transfer the recall cue to a controlled outdoor environment using a long line for safety.',
 12, 10,
 '[
   {"order":1,"instruction":"Attach a 15–20 foot long line to a harness. Go to a quiet outdoor space. Allow the dog to sniff and decompress for 3 minutes before any training.","durationSeconds":180,"reps":null,"tip":"The long line is a safety net, not a tool for pulling the dog to you.","successLook":"Dog is relaxed and sniffing, not anxious or over-excited."},
   {"order":2,"instruction":"When the dog is 10–15 feet away and mildly engaged with the environment, call their name then recall cue. Wait 3 seconds. If no response, clap and run opposite direction.","durationSeconds":null,"reps":5,"tip":"If the dog is fixated on something, do NOT call — move closer first.","successLook":"Dog disengages from the environment and trots toward you."},
   {"order":3,"instruction":"When the dog arrives, give a jackpot of 5+ treats delivered one at a time at chest height while praising for 10 full seconds.","durationSeconds":10,"reps":null,"tip":"The celebration must be bigger outdoors than indoors.","successLook":"Dog presses into you, tail wagging, staying close to collect treats."},
   {"order":4,"instruction":"After treating, release with ''go sniff!'' and let them return to exploring. Repeat 4 more times.","durationSeconds":null,"reps":4,"tip":"Recall does not always mean going home — just touching base.","successLook":"Dog comes readily on subsequent recalls."},
   {"order":5,"instruction":"End the session before the dog gets bored. 10 successful outdoor recalls over 2–3 sessions builds excellent foundation.","durationSeconds":null,"reps":null,"tip":null,"successLook":"Final recall is as fast as the first one."}
 ]'::jsonb,
 'Dog recalls outdoors on a long line from 15 feet away, low-distraction environment, 8 out of 10 trials.',
 ARRAY['Going off-leash before long-line recall is reliable at 20+ feet','Only recalling to end the walk','Under-rewarding outdoor recalls'],
 ARRAY['15–20 foot long line','Back-clip harness','High-value treats (5+ pieces)','Treat pouch'],
 8, 999, 3, NULL,
 'True off-leash recall in an unfenced area takes 6–12 months. Only practice off-leash in fully enclosed, secure areas.');

-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: Calm Greetings / Stop Jumping
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO protocols (id, behavior, stage, title, objective, duration_minutes, rep_count, steps, success_criteria, common_mistakes, equipment_needed, age_min_months, age_max_months, difficulty, next_protocol_id, trainer_note) VALUES

('jumping_s1', 'jumping_up', 1, 'Four Paws on Floor for Attention',
 'Teach the dog that four paws on the floor — not jumping — is what earns attention, pets, and treats from all humans.',
 8, 20,
 '[
   {"order":1,"instruction":"Stand with a handful of treats held at your chest. When any paw comes off the floor to jump, turn your back completely and fold your arms. Say nothing.","durationSeconds":null,"reps":null,"tip":"Do not say ''off,'' ''down,'' or ''no.'' Any verbal response is attention.","successLook":"Dog''s four paws hit the floor after you turn away."},
   {"order":2,"instruction":"The instant all four paws are on the floor, turn back, crouch down, and deliver a treat with calm praise. Keep your energy neutral — not excited.","durationSeconds":null,"reps":null,"tip":"Calm praise is key. Over-excitement triggers another jump cycle.","successLook":"Dog receives treat while standing calmly on all fours."},
   {"order":3,"instruction":"Repeat 20 times in a 5-minute session. Every person in the household must follow identical rules.","durationSeconds":null,"reps":20,"tip":"One person who lets the dog jump undoes weeks of training.","successLook":"Dog approaches you with all four paws on the floor."},
   {"order":4,"instruction":"For the last 5 reps, withhold the treat until the dog has held four paws on the floor for 3 seconds. Mark ''yes!'' at 3 seconds.","durationSeconds":null,"reps":5,"tip":null,"successLook":"Dog waits calmly on all fours for 3 seconds before treat is delivered."}
 ]'::jsonb,
 'Dog approaches handler with four paws on floor (no jumping) in 15 out of 20 repetitions in a calm indoor environment.',
 ARRAY['Pushing the dog off — this can reinforce jumping','Kneeing the dog — creates anxiety','Inconsistency between family members'],
 ARRAY['High-value treats','Optional: leash to limit the dog''s ability to jump on guests'],
 8, 999, 1, 'jumping_s2',
 'The #1 reason this fails is one family member who "doesn''t mind" the jumping. Address this directly with everyone in the home.'),

('jumping_s2', 'jumping_up', 2, 'Auto-Sit for Greeting',
 'Teach the dog to automatically offer a sit whenever a person approaches, replacing jumping with a polite default behavior.',
 10, 15,
 '[
   {"order":1,"instruction":"Drill the sit cue for 3 minutes before this session — dog should sit within 2 seconds of the verbal or hand cue.","durationSeconds":180,"reps":10,"tip":null,"successLook":"Dog sits within 2 seconds of cue, 9 out of 10 attempts."},
   {"order":2,"instruction":"Stand 5 feet from your dog. Begin walking toward them. If they sit as you approach — even without a cue — say ''yes!'' and drop a treat between their front paws.","durationSeconds":null,"reps":null,"tip":"Dropping the treat between the paws keeps the dog''s head down and body in the sit position.","successLook":"Dog holds sit as you approach and reaches nose down for the dropped treat."},
   {"order":3,"instruction":"If the dog jumps as you approach, immediately turn your back. Wait for four paws on floor and a sit, then try from further away.","durationSeconds":null,"reps":null,"tip":"Match your excitement level to what the dog can handle.","successLook":"Dog holds a sit during a calm, slow approach."},
   {"order":4,"instruction":"Gradually increase approach energy over 10 reps: walk normally → quickly → jog → reach out to pet. Each successful sit earns a treat dropped between paws.","durationSeconds":null,"reps":10,"tip":null,"successLook":"Dog holds sit even when you are jogging and reaching toward them."},
   {"order":5,"instruction":"Rehearse a doorbell drill: knock on the wall, wait for sit, then open the door to a calm helper who drops a treat for the sitting dog.","durationSeconds":null,"reps":5,"tip":"Practice this drill 2–3 times before actual visitors arrive.","successLook":"Dog holds sit when door opens to helper."}
 ]'::jsonb,
 'Dog auto-sits in 12 out of 15 greeting trials without verbal cue when a person calmly approaches.',
 ARRAY['Only practicing with family members','Skipping the treat-between-paws technique','Over-exciting the dog during practice'],
 ARRAY['High-value treats','Optional: training partner/helper'],
 8, 999, 2, 'jumping_s3',
 'The auto-sit is one of the most practical behaviors you can teach. A dog that automatically sits for greetings is a social superstar.'),

('jumping_s3', 'jumping_up', 3, 'Calm Greeting with Strangers',
 'Generalize the four-paws-on-floor and auto-sit behaviors to greetings with unfamiliar people in real-world contexts.',
 12, 10,
 '[
   {"order":1,"instruction":"Brief your helper: ''When you approach, ignore any jumping — turn your back. The moment my dog sits, drop this treat and calmly pet them.'' Give them 5 pre-loaded treats.","durationSeconds":null,"reps":null,"tip":"Brief your helper in detail. An unprepared helper is the most common protocol failure point.","successLook":"Helper understands the protocol and is calm and neutral."},
   {"order":2,"instruction":"Have your dog on a short leash. Have the helper approach from 20 feet. At 10 feet, cue your dog to sit. Let helper approach fully, drop the treat, and pet calmly.","durationSeconds":null,"reps":5,"tip":"The leash is for preventing the dog from running toward the helper.","successLook":"Dog holds sit while stranger approaches and pets them."},
   {"order":3,"instruction":"Increase the challenge: have the helper be more excited. This is closer to real-world conditions.","durationSeconds":null,"reps":3,"tip":"This step often causes regression — be ready to step back to Step 2. That is normal progress.","successLook":"Dog remains on all four paws or sits when helper is excited."},
   {"order":4,"instruction":"Practice in a different environment: outside on the sidewalk, at a pet-friendly store, or in a park.","durationSeconds":null,"reps":2,"tip":null,"successLook":"Dog holds greeting behavior in at least one novel outdoor environment."}
 ]'::jsonb,
 'Dog greets unfamiliar person with four paws on floor or auto-sit in 8 out of 10 real-world greeting trials.',
 ARRAY['Skipping the helper briefing','Doing this when the dog is at peak excitement','Using too tight a leash'],
 ARRAY['Short leash (3–4 feet)','High-value treats (for helper to carry)','Willing helper'],
 8, 999, 3, NULL,
 'Real-world generalization requires dozens of rehearsed interactions. Ask strangers to participate in greeting rehearsals on every walk for 4 weeks.');

-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: Potty Training
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO protocols (id, behavior, stage, title, objective, duration_minutes, rep_count, steps, success_criteria, common_mistakes, equipment_needed, age_min_months, age_max_months, difficulty, next_protocol_id, trainer_note) VALUES

('potty_s1', 'potty_training', 1, 'Timed Outdoor Trips & Reward System',
 'Establish a consistent potty schedule and a powerful reward system so the dog learns that outdoor elimination = jackpot.',
 5, 8,
 '[
   {"order":1,"instruction":"Write out your dog''s potty schedule and post it on the fridge. Puppies under 4 months: every 1–2 hours. Dogs 4–6 months: every 2–3 hours. Add trips immediately after waking, within 15 minutes of eating, and after play.","durationSeconds":null,"reps":null,"tip":"Set phone alarms for every scheduled trip.","successLook":"Schedule is written and alarms are set."},
   {"order":2,"instruction":"At each scheduled trip, leash your dog and take them to the same designated spot outside. Use the same route each time. Stand still and silent for up to 5 minutes.","durationSeconds":300,"reps":null,"tip":"Do NOT walk around or entertain the dog. This is a potty trip, not a walk.","successLook":"Dog sniffs the designated area and shows pre-elimination behavior."},
   {"order":3,"instruction":"The moment your dog begins eliminating, say your chosen cue word softly once: ''go potty'' or ''hurry up.'' Say it once, calmly, so it does not interrupt the act.","durationSeconds":null,"reps":null,"tip":"You are pairing the cue word with the act, not commanding it.","successLook":"Dog continues eliminating — they did not stop when you spoke."},
   {"order":4,"instruction":"The instant your dog finishes, have a party: say ''yes! GOOD OUTSIDE!'' in your most excited voice and deliver 3–5 high-value treats one at a time. Then give a 5-minute walk as an additional reward.","durationSeconds":null,"reps":null,"tip":"Timing is critical — the jackpot must happen within 2 seconds of the final squat.","successLook":"Dog is clearly happy, tail wagging, eating treats enthusiastically."},
   {"order":5,"instruction":"If no elimination after 5 minutes outside, calmly take the dog inside and immediately tether them to you. Try again in 15 minutes.","durationSeconds":null,"reps":null,"tip":"Tethering to you prevents sneaking away to eliminate indoors.","successLook":"Dog has not had an accident because they were under constant supervision."}
 ]'::jsonb,
 'Dog eliminates outdoors on 6 of 8 scheduled trips over a 2-day period with no unsupervised indoor access.',
 ARRAY['Rewarding after coming back inside — reward must happen outside immediately','Punishing accidents after the fact','Giving too much indoor freedom too soon'],
 ARRAY['Short leash for outdoor trips','High-value treats kept by the door','Crate or tether for indoor supervision'],
 8, 36, 1, 'potty_s2',
 'Potty training is 90% management. Every accident that happens unsupervised is a practice of the wrong behavior.'),

('potty_s2', 'potty_training', 2, 'Signal Training for Outside Request',
 'Teach the dog to signal to you when they need to go out, rather than eliminating without warning.',
 8, 6,
 '[
   {"order":1,"instruction":"Hang a bell at nose height on the door you use for potty trips.","durationSeconds":null,"reps":null,"tip":"The bell method works because it is audible from any room.","successLook":"Bell is hung at the correct height."},
   {"order":2,"instruction":"Before each scheduled potty trip, hold a treat near the bell. When the dog investigates the bell with their nose — causing it to ring — say ''yes!'' and open the door for a potty trip. Do this before EVERY outdoor trip for one week.","durationSeconds":null,"reps":6,"tip":"You are pairing bell-ringing with going outside.","successLook":"Dog touches the bell before going out at every scheduled trip."},
   {"order":3,"instruction":"After 5–7 days of bell-prompted trips, wait 10 seconds at the door before each trip. Watch if the dog goes to the bell on their own or looks toward it.","durationSeconds":null,"reps":null,"tip":null,"successLook":"Dog approaches bell area without being prompted with a treat."},
   {"order":4,"instruction":"When the dog rings the bell spontaneously for the first time, celebrate IMMEDIATELY. Open the door, run outside, and if they eliminate, give the biggest jackpot of the entire training process.","durationSeconds":null,"reps":null,"tip":"The first spontaneous bell ring is a major training milestone.","successLook":"Dog rings bell independently, goes outside, and eliminates."}
 ]'::jsonb,
 'Dog rings bell on 4 of 6 potty trips over a 3-day period, at least 2 spontaneous.',
 ARRAY['Not responding fast enough when the dog signals','Ignoring a bell ring because you just went out','Placing the bell too high'],
 ARRAY['Hanging bells (available at pet stores)','High-value treats','Consistent potty door'],
 12, 999, 2, 'potty_s3',
 'Only reward bell rings followed by actual elimination. Ignore bell rings that result in no elimination after 2 minutes outside.'),

('potty_s3', 'potty_training', 3, 'Reliable Indoor/Outdoor Schedule with Extended Intervals',
 'Extend the interval between potty trips to 4+ hours and build full household reliability.',
 5, 4,
 '[
   {"order":1,"instruction":"Track accidents and successes for 1 week. Only extend intervals when the dog has had 7 consecutive clean days. Do not rush.","durationSeconds":null,"reps":null,"tip":"Use a calendar. Mark ✓ for clean days and ✗ for accident days.","successLook":"Calendar shows 7 consecutive clean days."},
   {"order":2,"instruction":"Extend your first interval from 3 hours to 3.5 hours. Hold for 3 clean days. Then extend to 4 hours. Never skip more than one step.","durationSeconds":null,"reps":null,"tip":"Half-hour increments prevent regression from jumping too fast.","successLook":"Dog holds bladder for new interval without accident."},
   {"order":3,"instruction":"Begin giving supervised indoor freedom: one room at a time. Watch closely for pre-elimination signals (circling, sniffing floor, going to a corner).","durationSeconds":null,"reps":null,"tip":"Pre-elimination signals appear 30–60 seconds before elimination.","successLook":"Dog seeks you out or goes to the door when they need to eliminate."},
   {"order":4,"instruction":"For the next 2 weeks, continue rewarding outdoor elimination every single time. Intermittent reinforcement builds extreme reliability.","durationSeconds":null,"reps":4,"tip":null,"successLook":"Dog goes immediately to the designated spot and eliminates within 2 minutes."}
 ]'::jsonb,
 'Dog has zero accidents indoors for 14 consecutive days and can hold bladder for 4+ hours during the day.',
 ARRAY['Extending intervals too quickly after a setback','Stopping food rewards for outdoor elimination','Granting full-house freedom before earning it room by room'],
 ARRAY['Calendar or app for tracking','Treats kept by the door for outdoor rewards'],
 12, 36, 2, NULL,
 'Potty training is considered complete when the dog has had zero accidents for 30 consecutive days with supervised indoor freedom.');

-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: Crate Training
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO protocols (id, behavior, stage, title, objective, duration_minutes, rep_count, steps, success_criteria, common_mistakes, equipment_needed, age_min_months, age_max_months, difficulty, next_protocol_id, trainer_note) VALUES

('crate_s1', 'crate_anxiety', 1, 'Positive Crate Introduction',
 'Build a positive emotional association with the crate through feeding, exploration, and choice-based entry — before the door is ever closed.',
 8, 10,
 '[
   {"order":1,"instruction":"Place the crate in the room where your family spends the most time. Remove the door or prop it fully open. Throw 5–6 high-value treats just inside the entrance. Let the dog investigate on their own.","durationSeconds":null,"reps":null,"tip":"The dog must choose to enter. Forced entry creates anxiety.","successLook":"Dog walks into the crate entrance to retrieve treats without hesitation."},
   {"order":2,"instruction":"Once the dog enters freely for entrance treats, begin tossing treats to the middle, then to the back. Every time the dog goes in, say ''yes!'' Do 10 reps.","durationSeconds":null,"reps":10,"tip":"Keep your own body posture neutral — do not crowd the crate or hover.","successLook":"Dog walks all the way to the back of the crate to retrieve treats."},
   {"order":3,"instruction":"Feed your dog''s next full meal inside the crate with the door open. Place the bowl at the back. Repeat for 3 consecutive meals.","durationSeconds":null,"reps":3,"tip":"Meal feeding in the crate creates the strongest possible association.","successLook":"Dog walks into crate, eats the full meal, walks out calmly."},
   {"order":4,"instruction":"Introduce a chew (frozen KONG or LickiMat) inside the open crate. Let the dog settle in the crate with the chew for 5–10 minutes while you sit nearby.","durationSeconds":600,"reps":null,"tip":"A frozen KONG stuffed with peanut butter is ideal. The licking motion is naturally calming.","successLook":"Dog stays in the crate with the chew, fully relaxed, not watching you anxiously."}
 ]'::jsonb,
 'Dog enters the open crate willingly within 5 seconds when a treat or chew is placed inside, 9 out of 10 times.',
 ARRAY['Closing the door too soon — introduction should take 3–5 days','Using the crate as punishment','Placing the crate in an isolated room'],
 ARRAY['Crate (appropriately sized)','High-value treats','Frozen KONG or chew'],
 8, 999, 1, 'crate_s2',
 'The crate should be just large enough for the dog to stand fully, turn around, and lie down stretched out.'),

('crate_s2', 'crate_anxiety', 2, 'Short Duration Comfort (5–30 Minutes)',
 'Build comfort with the door closed, starting at 5 seconds and systematically extending to 30 minutes with you present.',
 10, 8,
 '[
   {"order":1,"instruction":"Send the dog into the crate with a cue. Once all four paws are inside, gently close the door. Wait 5 seconds. Open the door before the dog shows any stress. Mark ''yes!'' and treat.","durationSeconds":5,"reps":3,"tip":"Open the door BEFORE the dog becomes stressed. Ending while stressed teaches stress eventually opens the door.","successLook":"Dog stands or sits calmly in the closed crate for 5 seconds, no pawing or whining."},
   {"order":2,"instruction":"Increase duration: 5 seconds → 15 → 30 → 1 minute → 3 minutes. Only advance when the dog is fully calm at the current duration.","durationSeconds":null,"reps":5,"tip":"There is no timeline. Follow the dog, not the schedule.","successLook":"Dog is lying down, soft eyes, not panting anxiously."},
   {"order":3,"instruction":"Work up to 10 minutes with a frozen KONG inside. Give the KONG when the door closes. Open the door while the dog is still calm.","durationSeconds":600,"reps":null,"tip":"A frozen KONG (frozen overnight) lasts longer.","successLook":"Dog licks KONG contentedly in closed crate for 10+ minutes."},
   {"order":4,"instruction":"Build to 30 minutes with you in the room but not interacting. Only give treats if the dog is lying down and quiet — not if they are whining.","durationSeconds":1800,"reps":null,"tip":"Wait for 3 seconds of quiet before any interaction after whining.","successLook":"Dog naps or rests quietly in crate for 30 minutes with no distress vocalizations."}
 ]'::jsonb,
 'Dog can remain in closed crate for 30 minutes with handler present, displaying calm behavior.',
 ARRAY['Advancing too fast','Releasing the dog when they whine','Leaving the dog too long before they are ready'],
 ARRAY['Crate','Frozen KONG or long-lasting chew','High-value treats'],
 8, 999, 2, 'crate_s3',
 'Puppies under 4 months should not be crated for more than 1–2 hours at a time. Their bladders physically cannot hold longer.'),

('crate_s3', 'crate_anxiety', 3, 'Building Duration to 2+ Hours',
 'Build out-of-sight crate comfort to 2+ hours, including a full pre-departure routine.',
 12, 5,
 '[
   {"order":1,"instruction":"With the dog comfortable for 30 minutes, begin adding distance: close the crate, then walk to the other side of the room. Return after 2 minutes. Build to leaving the room entirely for 5 minutes.","durationSeconds":300,"reps":3,"tip":"Leave and return casually — no big hellos or goodbyes.","successLook":"Dog shows no visible stress when you leave the room for 5 minutes."},
   {"order":2,"instruction":"Establish a departure routine: 10 min walk → 15 min settle period → crate with frozen KONG. This routine signals what is coming and reduces anticipatory anxiety.","durationSeconds":null,"reps":null,"tip":"The routine must be consistent. Dogs learn the sequence and begin to anticipate positively.","successLook":"Dog voluntarily walks to the crate after the departure routine."},
   {"order":3,"instruction":"Extend out-of-sight duration in 15-minute increments: 5 min → 20 → 35 → 60 → 90 → 120 minutes. Spend 2–3 sessions at each step.","durationSeconds":null,"reps":5,"tip":"Set up a phone camera pointed at the crate so you can monitor remotely.","successLook":"Dog is lying or sitting calmly, not vocalizing continuously, for target duration."},
   {"order":4,"instruction":"For the 2-hour session: use a higher-value KONG and give it when you close the crate. Return after 2 hours with the same calm, neutral arrival energy.","durationSeconds":7200,"reps":null,"tip":null,"successLook":"Dog is calm or asleep when you return. May get up and wag, but not frantic."}
 ]'::jsonb,
 'Dog can remain in crate for 2 hours out of sight without continuous distress vocalizations on 3 consecutive sessions.',
 ARRAY['Leaving for long durations before building incrementally','Dramatic departure rituals','Not monitoring remotely during longer sessions'],
 ARRAY['Crate','Phone/camera for remote monitoring','Frozen KONG with high-value filling'],
 12, 999, 3, NULL,
 'The goal of crate training is a dog who chooses the crate voluntarily for naps and rest. Once this happens, the crate has become a true safe space.');

-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: Puppy Biting
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO protocols (id, behavior, stage, title, objective, duration_minutes, rep_count, steps, success_criteria, common_mistakes, equipment_needed, age_min_months, age_max_months, difficulty, next_protocol_id, trainer_note) VALUES

('biting_s1', 'puppy_biting', 1, 'Yelp & Redirect Technique',
 'Teach the puppy that biting human skin causes play to pause, and redirect all mouthing to appropriate toys.',
 5, 15,
 '[
   {"order":1,"instruction":"When the puppy''s teeth make contact with your skin, immediately say ''OW!'' or ''YIP!'' in a sharp, high-pitched tone. Let your hand go limp. Do NOT pull your hand away quickly.","durationSeconds":null,"reps":null,"tip":"Do not pull away fast — fast movement triggers prey drive.","successLook":"Puppy pauses or pulls back slightly when they hear the yelp."},
   {"order":2,"instruction":"After the yelp, freeze for 3 seconds. If the puppy backs off or looks confused, calmly offer a toy immediately. When they grab the toy, say ''yes!'' and continue playing energetically.","durationSeconds":3,"reps":null,"tip":"The toy must become more interesting than your hands. Use toys that move.","successLook":"Puppy redirects mouth from skin to toy."},
   {"order":3,"instruction":"If the puppy bites again immediately after the yelp, give a second yelp + freeze. Third bite = calmly stand up, cross arms, turn away completely for 10 seconds.","durationSeconds":10,"reps":null,"tip":"Three bites = time-out. This teaches that excessive biting ends the play session.","successLook":"Puppy follows you and looks up at your face, offering softer behavior."},
   {"order":4,"instruction":"After the 10-second pause, re-engage with a toy. If the puppy stays engaged for 30 seconds, give a treat.","durationSeconds":30,"reps":null,"tip":null,"successLook":"Puppy plays with toy for 30+ seconds without redirecting to hands."},
   {"order":5,"instruction":"Practice this sequence 15 times across the day (keep each session under 5 minutes). Track how many yelps you give per session — the number should decrease over days.","durationSeconds":null,"reps":15,"tip":"More than 5 yelps per 5-minute session after a week = puppy needs more exercise.","successLook":"Fewer than 3 bites per 5-minute play session by the end of the week."}
 ]'::jsonb,
 'Puppy redirects from skin to toy within 5 seconds of the yelp cue in 10 of 15 repetitions.',
 ARRAY['Pulling the hand away quickly','Using angry tone instead of surprised yelp','Playing with hands as toys (roughhousing)'],
 ARRAY['Tug toy or rope toy','Treat pouch','Patience — this takes 2–4 weeks'],
 8, 18, 1, 'biting_s2',
 'Puppy biting peaks between 10–16 weeks and improves significantly by 5–6 months. Consistency in the next 8 weeks is critical.'),

('biting_s2', 'puppy_biting', 2, 'Turn Away & Timeout Method',
 'Upgrade from yelp-and-redirect to a complete interaction withdrawal — biting removes all access to the human.',
 8, 12,
 '[
   {"order":1,"instruction":"Establish a clear rule: any tooth-on-skin contact results in immediate disengagement — no yelp, no warning. Stand up, cross arms, turn back completely.","durationSeconds":null,"reps":null,"tip":"Only introduce this stage once the puppy consistently responds to the yelp.","successLook":"You are turned away, arms crossed, no eye contact."},
   {"order":2,"instruction":"Wait in turned-away position for 10–15 seconds of calm. If they jump or paw at you, wait it out. The moment they have been quiet for 10 consecutive seconds, turn back and resume interaction.","durationSeconds":15,"reps":null,"tip":"Restart the 10-second clock if they vocalize or jump.","successLook":"Puppy sits or stands quietly, waiting — not demanding."},
   {"order":3,"instruction":"When you turn back, immediately offer a toy and begin toy-directed play. Reward 30 seconds of toy-only play with a treat.","durationSeconds":30,"reps":null,"tip":null,"successLook":"Puppy grabs toy enthusiastically and plays without mouthing hands."},
   {"order":4,"instruction":"Repeat 12 times. You should notice the puppy offering softer mouth pressure or going directly to toys to initiate play.","durationSeconds":null,"reps":12,"tip":"Track progress: write down the number of timeouts per day. By day 5, you should see a downward trend.","successLook":"Puppy approaches with a toy in their mouth to initiate play."}
 ]'::jsonb,
 'Puppy''s bite frequency drops by 50% over 5 sessions compared to Stage 1 baseline.',
 ARRAY['Introducing this before the puppy understands the yelp','Making the timeout dramatic','Continuing to play with hands even briefly after tooth contact'],
 ARRAY['Tug toy','Optional: baby gate to step behind for more complete separation'],
 10, 18, 2, 'biting_s3',
 'Track both frequency and pressure. A puppy who bites hard 5 times a day is worse than one who bites softly 15 times.'),

('biting_s3', 'puppy_biting', 3, 'Bite Inhibition with Consistent Thresholds',
 'Finalize bite inhibition by establishing consistent thresholds, proofing with high-arousal play, and building default calm behavior.',
 10, 10,
 '[
   {"order":1,"instruction":"Set your current threshold: even light tooth pressure on skin = immediate disengagement. Zero tolerance. Communicate this rule to all household members.","durationSeconds":null,"reps":null,"tip":"The threshold gets tighter over time.","successLook":"All household members understand and follow the same rule."},
   {"order":2,"instruction":"Play tug for 30 seconds. Pause play. Ask for a sit. Wait. The dog should shift from play to calm within 5 seconds. Mark ''yes!'' treat the sit, then resume tug.","durationSeconds":30,"reps":5,"tip":"This exercise teaches moving between arousal states — high energy play ↔ calm self-control.","successLook":"Dog transitions from active tug to sitting in under 5 seconds."},
   {"order":3,"instruction":"Hold out your hand, palm facing the dog. If the dog sniffs or licks without biting, say ''yes!'' and treat. Build to handing near face and petting without mouthing.","durationSeconds":null,"reps":5,"tip":"Start with the back of your hand (less triggering than the palm).","successLook":"Dog sniffs and licks extended hand with zero tooth pressure."},
   {"order":4,"instruction":"Proof with a helper: have a friend practice the same hand-offering exercise. Reward every no-bite interaction lavishly.","durationSeconds":null,"reps":5,"tip":null,"successLook":"Dog greets unfamiliar person''s hand with sniff/lick, no mouthing."}
 ]'::jsonb,
 'Dog transitions from active play to calm sit in under 5 seconds, 8 of 10 attempts. Zero bite incidents with strangers over 5 sessions.',
 ARRAY['Not proofing with other people','Letting high-arousal play escalate without breaks','Inconsistency from one week to the next'],
 ARRAY['Tug toy','Treats','A willing helper'],
 12, 24, 3, NULL,
 'A dog with excellent bite inhibition is a safe companion for children, strangers, and veterinary care.');

-- ─────────────────────────────────────────────────────────────────────────────
-- SEED: Barking & Settling
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO protocols (id, behavior, stage, title, objective, duration_minutes, rep_count, steps, success_criteria, common_mistakes, equipment_needed, age_min_months, age_max_months, difficulty, next_protocol_id, trainer_note) VALUES

('settle_s1', 'settling', 1, 'Settle Cue on Mat — Foundation',
 'Teach the dog that their designated mat means "go lie down and relax here," using luring and duration building from 5 seconds to 2 minutes.',
 8, 15,
 '[
   {"order":1,"instruction":"Place a non-slip mat in a consistent location. Stand next to the mat with treats. Lure your dog onto the mat by moving a treat from in front of their nose to just past the mat''s edge.","durationSeconds":null,"reps":null,"tip":"Use a mat that is clearly distinct from the floor.","successLook":"Dog steps onto the mat to follow the treat lure."},
   {"order":2,"instruction":"Once all four paws are on the mat, lure into a down by moving the treat from between their eyes to the floor between their front paws. Mark ''yes!'' the moment elbows touch. Do 8 reps.","durationSeconds":null,"reps":8,"tip":"If the dog pops back up immediately, that is fine at this stage — we are not asking for duration yet.","successLook":"Dog lies down with elbows on mat in a relaxed position."},
   {"order":3,"instruction":"Add the verbal cue: just before the dog reaches the mat, say ''settle'' or ''place.'' Say it once, calmly.","durationSeconds":null,"reps":5,"tip":null,"successLook":"Dog walks toward mat when ''settle'' is said and begins to lie down."},
   {"order":4,"instruction":"Begin building duration: after the down, wait 5 seconds before marking. Then 10, 20, 30 seconds. Deliver treats to the mat between paws. If dog gets up, calmly lure back — do not scold.","durationSeconds":null,"reps":7,"tip":"Rain treats onto the mat every few seconds during the duration period.","successLook":"Dog stays in down on mat for 30 seconds, relaxed, not staring anxiously."}
 ]'::jsonb,
 'Dog goes to the mat and lies down in response to the "settle" cue and holds for 60 seconds with treat reinforcement, 10 of 15 repetitions.',
 ARRAY['Using the mat for timeouts or punishment','Building duration too fast','Scolding the dog for getting off the mat'],
 ARRAY['Non-slip mat or dog bed','High-value treats','Treat pouch'],
 8, 999, 1, 'settle_s2',
 'The settle cue is one of the most practical and versatile cues in training. Invest in building this cue solidly.'),

('settle_s2', 'settling', 2, 'Settle with Mild Household Distractions',
 'Proof the settle cue with the TV on, people walking past, and routine household activity while building duration to 5 minutes.',
 10, 8,
 '[
   {"order":1,"instruction":"Confirm baseline: cue ''settle'' from 5 feet away. Dog should go to mat and lie down within 5 seconds without a lure. If they still need a lure, spend 2 more sessions on Stage 1.","durationSeconds":null,"reps":3,"tip":null,"successLook":"Dog walks to mat and downs without following a treat lure."},
   {"order":2,"instruction":"Cue settle, then turn on the TV at normal volume. Deliver a treat to the mat every 30 seconds for the first 3 minutes. Gradually reduce to every 60 seconds, then every 2 minutes.","durationSeconds":300,"reps":null,"tip":"Fading reinforcement must be done gradually.","successLook":"Dog remains on mat for 5 minutes with TV on."},
   {"order":3,"instruction":"Practice walk-past proofing: cue settle, then walk casually past the mat every 30 seconds in a normal household activity pattern. Toss a treat to the mat any time the dog stays as you pass.","durationSeconds":null,"reps":5,"tip":"This is proofing against the dog following you.","successLook":"Dog stays on mat when you walk past without getting up to follow."},
   {"order":4,"instruction":"Have household members enter the room and move around normally. Deliver a treat to the mat every 60 seconds. Work up to 5 minutes of settled behavior.","durationSeconds":300,"reps":null,"tip":null,"successLook":"Dog stays relaxed on mat for 5 minutes while household members move around normally."}
 ]'::jsonb,
 'Dog holds settle on mat for 5 minutes with mild household distractions, treats every 60 seconds, 6 of 8 sessions.',
 ARRAY['Fading treat reinforcement too quickly','Not releasing the dog with a formal cue (''free!'')','Starting with distractions that are too strong'],
 ARRAY['Mat','Treats','Treat pouch','Household distractions (TV, people)'],
 8, 999, 2, 'settle_s3',
 'The settle cue is naturally self-reinforcing once the dog understands it. Over time the treat schedule can fade dramatically.'),

('settle_s3', 'settling', 3, 'Go to Place from Any Room',
 'Build distance and generalization: the dog can go to their mat from any room on a single verbal cue and hold it for 10 minutes.',
 12, 8,
 '[
   {"order":1,"instruction":"From 10 feet away in the same room, cue ''place.'' Dog should go directly to mat and lie down without guidance. Build from 10 to 20 to 30 feet over 5 reps.","durationSeconds":null,"reps":5,"tip":"At greater distances, the dog is doing more independent thinking. Celebrate every attempt.","successLook":"Dog moves purposefully to mat from across the room and lies down."},
   {"order":2,"instruction":"Move to the adjacent room. Cue ''place'' without pointing. If the dog hesitates, wait 5 seconds, then walk toward the mat and point.","durationSeconds":null,"reps":3,"tip":"The dog must physically know where the mat is. Let them explore the layout before cuing.","successLook":"Dog leaves the room you are in and goes to the mat in the other room."},
   {"order":3,"instruction":"Build to a 10-minute hold: cue place, deliver a frozen KONG, set a timer. Check in every 2 minutes and drop a treat on the mat without eye contact. At 10 minutes, say ''free!'' and release.","durationSeconds":600,"reps":null,"tip":"Delivering the treat without eye contact keeps the dog in the down.","successLook":"Dog holds settle with frozen KONG for 10 minutes before being formally released."},
   {"order":4,"instruction":"Introduce a novel location: bring the mat to a friend''s home, a hotel room, or an outdoor café space. Cue ''place.'' Do 1–2 warm-up reps first.","durationSeconds":null,"reps":3,"tip":null,"successLook":"Dog lies on mat in a novel environment for 3+ minutes."}
 ]'::jsonb,
 'Dog goes to mat from another room on voice cue in 6 of 8 trials and holds for 10 minutes in a familiar environment.',
 ARRAY['Not releasing the dog formally','Punishing the dog for getting up during long holds','Skipping the novel environment step'],
 ARRAY['Mat (portable)','Frozen KONG','High-value treats','Timer'],
 8, 999, 3, NULL,
 'A dog that can place on cue from another room and hold for 10+ minutes is genuinely life-changing for most owners.');

-- ─────────────────────────────────────────────────────────────────────────────
-- Index for fast behavior lookups
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS protocols_behavior_stage_idx ON protocols (behavior, stage);
