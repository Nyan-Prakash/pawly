export interface ProtocolStep {
  order: number
  instruction: string
  durationSeconds: number | null
  reps: number | null
  tip: string | null
  successLook: string
}

export interface Protocol {
  id: string
  behavior: string
  stage: 1 | 2 | 3 | 4
  title: string
  objective: string
  durationMinutes: number
  repCount: number
  steps: ProtocolStep[]
  successCriteria: string
  commonMistakes: string[]
  equipmentNeeded: string[]
  ageMinMonths: number
  ageMaxMonths: number
  difficulty: 1 | 2 | 3 | 4 | 5
  nextProtocolId: string | null
  trainerNote: string
}

// ─────────────────────────────────────────────────────────────────────────────
// LOOSE LEASH WALKING
// ─────────────────────────────────────────────────────────────────────────────

const llw_stage1: Protocol = {
  id: 'llw_s1',
  behavior: 'leash_pulling',
  stage: 1,
  title: 'Focus & Attention at Heel',
  objective: 'Teach your dog to respond to their name and offer eye contact while standing still at your side — the foundation of all leash work.',
  durationMinutes: 8,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Stand still in a low-distraction room with your dog on leash. Hold 5–6 high-value treats (small chicken or cheese pieces, pea-sized) in your hand. Let the leash hang slack.',
      durationSeconds: null,
      reps: null,
      tip: 'The leash should never be tight at any point during this exercise. If your dog pulls, simply wait.',
      successLook: 'Dog stands near you, leash loose.'
    },
    {
      order: 2,
      instruction: 'Say your dog\'s name once in a calm, clear tone. The moment they turn their head toward you or make eye contact, immediately mark with "yes!" and deliver a treat at your hip height.',
      durationSeconds: null,
      reps: 10,
      tip: 'Only say the name once. Repeating it ("Max! Max! MAX!") teaches your dog the name means nothing. Wait up to 10 seconds for a response.',
      successLook: 'Dog turns head toward you within 3 seconds of hearing their name.'
    },
    {
      order: 3,
      instruction: 'After 5 successful name responses, raise the criteria: wait for your dog to make direct eye contact (not just a head turn). Mark "yes!" the instant their eyes meet yours, treat at hip.',
      durationSeconds: null,
      reps: 10,
      tip: 'Deliver the treat at your hip — not in front of you — so your dog learns the reward zone is beside your leg.',
      successLook: 'Dog looks up at your face, not just toward you.'
    },
    {
      order: 4,
      instruction: 'Take 2–3 steps forward. Stop. Say your dog\'s name. Wait for eye contact. Mark and treat. Repeat 5 times.',
      durationSeconds: null,
      reps: 5,
      tip: 'Move slowly and casually. You are not luring the dog — you are waiting for them to make the choice to check in.',
      successLook: 'Dog checks in within 5 seconds of you stopping.'
    },
    {
      order: 5,
      instruction: 'End the session. Let your dog sniff around freely for 60 seconds as a reward. This "sniff break" is a powerful reinforcer — allow it.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Dog relaxed and engaged throughout session.'
    }
  ],
  successCriteria: 'Dog responds to name with eye contact 8 out of 10 attempts in a low-distraction environment.',
  commonMistakes: [
    'Repeating the dog\'s name multiple times — say it once and wait',
    'Giving the treat in front of your body instead of at your hip',
    'Moving too fast before the name response is solid',
    'Practicing when the dog is over-excited or under-stimulated'
  ],
  equipmentNeeded: ['4–6 foot flat leash', 'High-value treats (chicken, cheese, hot dog)'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'llw_s2',
  trainerNote: 'This exercise looks boring but it is the single most important foundation for leash manners. Dogs that check in reliably are dogs that can be guided through distractions. Spend at least 3 sessions here before advancing.'
}

const llw_stage2: Protocol = {
  id: 'llw_s2',
  behavior: 'leash_pulling',
  stage: 2,
  title: 'Stop-and-Wait: Tension Off, Forward On',
  objective: 'Teach your dog that leash tension makes you stop and leash slack makes you move. This is the core mechanical rule of loose leash walking.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Start in a hallway or low-traffic area. Begin walking at a normal pace with your dog on a 4–6 foot leash. Hold the leash with both hands — one near your hip, one holding the end.',
      durationSeconds: null,
      reps: null,
      tip: 'Wear comfortable shoes. You will be stopping and starting frequently. This is normal — stick with it.',
      successLook: 'You are moving, dog is at your side.'
    },
    {
      order: 2,
      instruction: 'The moment the leash becomes taut — any tension at all — STOP walking. Become a statue. Do not yank, do not say anything, do not repeat their name. Just stop.',
      durationSeconds: null,
      reps: null,
      tip: 'The stop must happen the instant you feel tension, not a few steps later. Timing is everything here.',
      successLook: 'You are frozen, leash is tight, dog notices something changed.'
    },
    {
      order: 3,
      instruction: 'Wait. Your dog will eventually turn to look at you or take a step back, creating slack in the leash. The moment there is ANY slack, say "yes!" and immediately start walking forward again as the reward.',
      durationSeconds: null,
      reps: null,
      tip: 'Movement forward IS the reward. Your dog wants to go forward — use that. Only treat every 3rd–4th successful slack moment to avoid the dog expecting food.',
      successLook: 'Dog takes one step toward you or pauses, leash goes slack.'
    },
    {
      order: 4,
      instruction: 'Repeat: walk → tension → stop → wait → slack → "yes!" → walk. Do 15 cycles within your session. Keep moving in a consistent direction so the dog understands forward progress is available.',
      durationSeconds: null,
      reps: 15,
      tip: 'Do not do this on a route with lots of interesting smells yet — a quiet street or parking lot is ideal for week 1.',
      successLook: 'Dog begins to self-correct before you stop, slowing down near tension.'
    },
    {
      order: 5,
      instruction: 'After 10 successful slack responses, try adding a treat scatter: every 20–30 steps of loose leash walking, toss 3 tiny treats on the ground near your feet. Let the dog sniff them up. This reinforces the loose-leash zone.',
      durationSeconds: null,
      reps: null,
      tip: 'Scatter the treats near your feet — not ahead of you. You want the dog to come back to your position to get them.',
      successLook: 'Dog walks beside you, checks in naturally, leash hangs in a J-shape.'
    }
  ],
  successCriteria: 'Dog self-corrects by releasing tension within 5 seconds of you stopping, 10 out of 15 repetitions.',
  commonMistakes: [
    'Stopping too late — the stop must happen instantly when tension starts',
    'Saying the dog\'s name or "no" when they pull — silence is correct',
    'Giving up and walking forward with a tight leash — this rewards the pull',
    'Practicing on a route that is too interesting for the dog\'s current skill level'
  ],
  equipmentNeeded: ['4–6 foot flat leash', 'Front-clip harness or flat collar (no retractable)', 'High-value treats'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'llw_s3',
  trainerNote: 'Most owners see improvement within 3–5 sessions. The hard part is consistency: every single walk, every single person in the household must follow the same rule. One person walking forward on tension undoes a week of training.'
}

const llw_stage3: Protocol = {
  id: 'llw_s3',
  behavior: 'leash_pulling',
  stage: 3,
  title: 'Direction Changes & Real-World Engagement',
  objective: 'Proof loose leash walking with unexpected direction changes and increase engagement during actual neighborhood walks.',
  durationMinutes: 12,
  repCount: 12,
  steps: [
    {
      order: 1,
      instruction: 'Begin your walk. When your dog is slightly ahead of you (not pulling yet), make a sudden, cheerful U-turn in the opposite direction. Say "this way!" as you turn and walk briskly in the new direction.',
      durationSeconds: null,
      reps: null,
      tip: 'Be energetic when you turn — your body language signals something exciting is happening. Do not pull the leash; your movement leads.',
      successLook: 'Dog trots to catch up with you, checking in as they reach your side.'
    },
    {
      order: 2,
      instruction: 'When the dog catches up and walks beside you with a loose leash, mark "yes!" and give a treat at your hip. Continue walking.',
      durationSeconds: null,
      reps: null,
      tip: null,
      successLook: 'Leash in J-shape, dog at hip level.'
    },
    {
      order: 3,
      instruction: 'Vary your direction changes unpredictably: left, right, U-turn, slow down, speed up. Do at least 12 direction changes in a 10-minute walk. Your dog should start watching you to predict your next move.',
      durationSeconds: null,
      reps: 12,
      tip: 'This is called making yourself "more interesting than the environment." Be unpredictable — your dog should feel like they need to keep an eye on you.',
      successLook: 'Dog glances at you frequently without being cued, anticipating direction changes.'
    },
    {
      order: 4,
      instruction: 'Introduce controlled exposure to one mild distraction (a parked car, a trash bin, a hedge). Approach to your dog\'s threshold distance — close enough to notice but not react. Practice 3 direction changes near the distraction.',
      durationSeconds: null,
      reps: 3,
      tip: 'If your dog lunges or fixates on the distraction, you are too close. Back up 5 steps and try from farther away.',
      successLook: 'Dog notices distraction, looks at it briefly, then checks back with you.'
    },
    {
      order: 5,
      instruction: 'At the end of the walk, do a 2-minute "free sniff" period — drop the criteria completely and let the dog sniff whatever they want. This is crucial for mental health and reduces frustration from the structured session.',
      durationSeconds: 120,
      reps: null,
      tip: 'A sniff walk is not "giving up" — it is a calculated reward that makes the structured portions more tolerable.',
      successLook: 'Dog relaxed, sniffing freely, decompress after structured work.'
    }
  ],
  successCriteria: 'Dog responds to 10 of 12 direction changes by catching up and checking in without tension. Can walk past one mild distraction with a loose leash.',
  commonMistakes: [
    'Turning too slowly — the direction change must be sudden and cheerful to be effective',
    'Not reinforcing the catch-up — the moment the dog reaches your side is the golden moment to reward',
    'Skipping the free sniff — it is not optional; it is part of the protocol',
    'Advancing to busy environments too quickly'
  ],
  equipmentNeeded: ['4–6 foot flat leash', 'Front-clip harness', 'High-value treats', 'Treat pouch'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'By Stage 3, your dog should walk nicely on quiet streets. Busy streets, other dogs, and high-distraction environments require months of practice and are a separate advanced module.'
}

// ─────────────────────────────────────────────────────────────────────────────
// RECALL
// ─────────────────────────────────────────────────────────────────────────────

const recall_stage1: Protocol = {
  id: 'recall_s1',
  behavior: 'recall',
  stage: 1,
  title: 'Name Response at Close Distance Indoors',
  objective: 'Build a rock-solid, automatic response to the dog\'s name at close range in a distraction-free environment — the prerequisite for all recall work.',
  durationMinutes: 8,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Prepare 20 tiny, high-value treats (smaller than a fingernail). Sit on the floor in a quiet room with no TV, no other pets, no distractions. Have your dog nearby but not looking at you.',
      durationSeconds: null,
      reps: null,
      tip: 'The floor puts you at the dog\'s level, which is naturally more inviting. This matters.',
      successLook: 'Dog is calm and nearby, but attention is elsewhere.'
    },
    {
      order: 2,
      instruction: 'Say your dog\'s name once in a bright, happy tone. The millisecond they look at you — even a glance — say "yes!" and immediately toss a treat toward them (so they have to come toward you slightly to get it). Do 10 reps.',
      durationSeconds: null,
      reps: 10,
      tip: 'Toss the treat toward you so the dog takes 1–2 steps in your direction. This begins the muscle memory of "name = move toward the human."',
      successLook: 'Dog immediately orients toward you when their name is called.'
    },
    {
      order: 3,
      instruction: 'After 10 reps, increase the duration: say the name, wait for the look, but this time wait 2–3 seconds before treating. The dog should hold their gaze on you. If they look away, say "yes!" anyway — we are just building duration slowly.',
      durationSeconds: null,
      reps: 5,
      tip: null,
      successLook: 'Dog looks at you and holds eye contact for 2 seconds.'
    },
    {
      order: 4,
      instruction: 'Stand up. Move to the other side of the room. Call the dog\'s name. When they look at you, pat your legs excitedly and say "yes!" as they walk toward you. Give a jackpot of 3–4 treats when they arrive at your feet.',
      durationSeconds: null,
      reps: 5,
      tip: 'The jackpot (multiple treats) teaches the dog that COMING to you after name response is incredibly valuable. Save jackpots for this moment.',
      successLook: 'Dog trots across the room to reach you after hearing their name.'
    }
  ],
  successCriteria: 'Dog looks at handler and begins moving toward them within 2 seconds of name being called, 9 out of 10 trials indoors.',
  commonMistakes: [
    'Calling the name too often — it becomes background noise',
    'Calling the name when about to do something unpleasant (bath, nail trim) — poisons the cue',
    'Rewarding a slow or hesitant response the same as a fast, enthusiastic one',
    'Practicing when the dog is asleep or deeply distracted'
  ],
  equipmentNeeded: ['High-value treats (chicken, freeze-dried liver)', 'Quiet indoor space'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'recall_s2',
  trainerNote: 'Never call your dog\'s name to do something they dislike until the recall is bombproof. Every time you call and they come to something bad, you lose a little reliability. Protect the name cue like it is gold.'
}

const recall_stage2: Protocol = {
  id: 'recall_s2',
  behavior: 'recall',
  stage: 2,
  title: 'Recall with Light Distraction Indoors',
  objective: 'Proof the recall cue with mild distractions present and increase distance to 15–20 feet inside the home.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Introduce your recall cue word (separate from the dog\'s name) — common choices: "here," "come," or a whistle. Say the dog\'s name first, then immediately your cue: "[Name], come!" Say it once. Do not repeat.',
      durationSeconds: null,
      reps: null,
      tip: 'The name grabs attention, the recall cue means "run to me." Keep them paired for now.',
      successLook: 'Dog looks up immediately at their name before "come."'
    },
    {
      order: 2,
      instruction: 'Practice recall from different rooms. Call from the kitchen while dog is in the living room. Call from upstairs. Each successful recall earns a jackpot (3–4 treats) delivered at your feet. Do 8 reps across different rooms.',
      durationSeconds: null,
      reps: 8,
      tip: 'Vary your location — this teaches the dog that "come" works everywhere, not just in front of you.',
      successLook: 'Dog comes running from another room within 5 seconds.'
    },
    {
      order: 3,
      instruction: 'Add a mild distraction: turn on the TV. Scatter a few boring kibble pieces on the floor for the dog to sniff. Let them sniff for 10 seconds, then call. If they come, huge jackpot. If they do not come within 5 seconds, clap your hands and run in the opposite direction — most dogs will chase.',
      durationSeconds: null,
      reps: 5,
      tip: 'Running away from the dog is one of the most powerful recall tools. Dogs naturally chase movement. Use it.',
      successLook: 'Dog leaves the kibble on the floor and comes to you when called.'
    },
    {
      order: 4,
      instruction: 'Practice a "run to me" game: crouch down, open your arms, say "come!" enthusiastically when the dog is 15+ feet away and looking at you. Make coming to you feel like the best thing that has ever happened. Give a full handful of treats and verbal praise.',
      durationSeconds: null,
      reps: 2,
      tip: null,
      successLook: 'Dog sprints toward you and pushes into your hands for treats.'
    }
  ],
  successCriteria: 'Dog recalls reliably from another room and away from mild distractions (kibble on floor, TV on) 8 out of 10 times.',
  commonMistakes: [
    'Calling "come" when you cannot enforce it — only call when you can guarantee success or follow through',
    'Punishing a slow recall — the dog must be rewarded every time they come, no matter how long it took',
    'Practicing too many reps in one session — quality beats quantity',
    'Not varying locations enough'
  ],
  equipmentNeeded: ['High-value treats', 'Quiet indoor space with mild distractions'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'recall_s3',
  trainerNote: 'The recall cue must be "charged" with many more positive reps than you think before going outdoors. Ten indoor sessions is a minimum before attempting outdoor recall.'
}

const recall_stage3: Protocol = {
  id: 'recall_s3',
  behavior: 'recall',
  stage: 3,
  title: 'Recall in Low-Distraction Outdoor Environments',
  objective: 'Transfer the recall cue to a controlled outdoor environment using a long line for safety.',
  durationMinutes: 12,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Attach a 15–20 foot long line to a harness (not a collar). Go to a quiet outdoor space: a fenced yard, an empty parking lot, or a quiet trail at an off-peak time. Allow the dog to sniff and decompress for 3 minutes before any training.',
      durationSeconds: 180,
      reps: null,
      tip: 'The long line is a safety net, not a tool for pulling the dog to you. Never reel in the long line — it removes the dog\'s choice and poisons the recall.',
      successLook: 'Dog is relaxed and sniffing, not anxious or over-excited.'
    },
    {
      order: 2,
      instruction: 'When the dog is 10–15 feet away and mildly engaged with the environment (sniffing, looking around but not fixated), call their name once then your recall cue. Wait 3 seconds. If no response, clap and turn and run the opposite direction.',
      durationSeconds: null,
      reps: 5,
      tip: 'If the dog is deeply fixated on something (squirrel, another dog), do NOT call — you will fail and practice failure. Move closer first.',
      successLook: 'Dog disengages from the environment and trots toward you.'
    },
    {
      order: 3,
      instruction: 'When the dog arrives, give a jackpot of 5+ treats, delivered one at a time at chest height, while ruffling their ears and saying "yes! yes! good!" Make the arrival celebration last 10 full seconds.',
      durationSeconds: 10,
      reps: null,
      tip: 'The celebration must be bigger outdoors than indoors. The competition (squirrels, smells) is stronger, so the reward must be proportionally larger.',
      successLook: 'Dog presses into you, tail wagging, staying close to collect treats.'
    },
    {
      order: 4,
      instruction: 'After treating, release the dog with "go sniff" or "free!" and let them return to exploring. Repeat 4 more times. The dog should learn that recall does NOT always mean going home — it just means touching base.',
      durationSeconds: null,
      reps: 4,
      tip: 'Owners who always recall the dog to leave the park teach their dog to ignore recalls at the park. Recall = treats, then freedom again.',
      successLook: 'Dog comes readily on subsequent recalls, not running away after first treat.'
    },
    {
      order: 5,
      instruction: 'End the session before the dog gets bored or tired. 10 successful outdoor recalls over 2–3 sessions builds excellent outdoor foundation. Always end on a successful rep.',
      durationSeconds: null,
      reps: null,
      tip: null,
      successLook: 'Final recall is as fast as the first one — dog is not showing fatigue or disinterest.'
    }
  ],
  successCriteria: 'Dog recalls outdoors on a long line from 15 feet away, in a low-distraction environment, 8 out of 10 trials.',
  commonMistakes: [
    'Going off-leash before the long-line recall is reliable at 20+ feet',
    'Only recalling to end the walk or go home',
    'Under-rewarding outdoor recalls — outdoor jackpots must be bigger than indoor rewards',
    'Using the long line to drag the dog toward you'
  ],
  equipmentNeeded: ['15–20 foot long line', 'Back-clip harness', 'High-value treats (5+ pieces)', 'Treat pouch'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'True off-leash recall in an unfenced area takes 6–12 months of consistent work and is outside the scope of this plan. The long-line protocol here builds the foundation safely. Only practice off-leash in fully enclosed, secure areas.'
}

// ─────────────────────────────────────────────────────────────────────────────
// CALM GREETINGS / STOP JUMPING
// ─────────────────────────────────────────────────────────────────────────────

const jumping_stage1: Protocol = {
  id: 'jumping_s1',
  behavior: 'jumping_up',
  stage: 1,
  title: 'Four Paws on Floor for Attention',
  objective: 'Teach the dog that four paws on the floor — not jumping — is what earns attention, pets, and treats from all humans.',
  durationMinutes: 8,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Stand with a handful of treats held at your chest (not in a treat pouch yet). Your dog will likely jump up to investigate. The moment ANY paw comes off the floor to jump, turn your back completely and fold your arms. Say nothing.',
      durationSeconds: null,
      reps: null,
      tip: 'Do not say "off," "down," or "no." Any verbal response is attention, and attention reinforces jumping. Silence and removal of eye contact is the only response.',
      successLook: 'Dog\'s four paws hit the floor after you turn away.'
    },
    {
      order: 2,
      instruction: 'The instant all four paws are on the floor, turn back toward the dog, crouch down to their level, and deliver a treat with calm praise ("good dog, yes"). Keep your energy neutral — not excited, which triggers jumping again.',
      durationSeconds: null,
      reps: null,
      tip: 'Calm praise is key. If you excitedly say "GOOD BOY!" you will trigger another jump cycle. Keep your voice at 50% energy.',
      successLook: 'Dog receives treat while standing calmly on all fours.'
    },
    {
      order: 3,
      instruction: 'Repeat the sequence 20 times in a 5-minute session. Your goal: the dog should begin approaching you with all four paws on the floor instead of jumping first.',
      durationSeconds: null,
      reps: 20,
      tip: 'If you have a helper, practice the same sequence. Every person in the household must follow identical rules — one person who lets the dog jump undoes weeks of training.',
      successLook: 'Dog approaches you and looks up expectantly without leaving the floor.'
    },
    {
      order: 4,
      instruction: 'For the last 5 reps, begin withholding the treat until the dog has held four paws on the floor for 3 seconds. Mark "yes!" at 3 seconds and treat. This begins building duration.',
      durationSeconds: null,
      reps: 5,
      tip: null,
      successLook: 'Dog waits calmly on all fours for 3 seconds before treat is delivered.'
    }
  ],
  successCriteria: 'Dog approaches handler with four paws on floor (no jumping) in 15 out of 20 repetitions in a calm indoor environment.',
  commonMistakes: [
    'Pushing the dog off — this is interactive and can reinforce jumping for attention-seeking dogs',
    'Kneeing the dog — creates anxiety without teaching the alternative behavior',
    'Inconsistency between family members — everyone must follow the same rule',
    'Giving attention after jumping even if the jump was brief ("just one little jump is fine")'
  ],
  equipmentNeeded: ['High-value treats', 'Optional: leash to limit the dog\'s ability to jump on guests'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'jumping_s2',
  trainerNote: 'This protocol requires household-wide buy-in. The #1 reason it fails is one family member who "doesn\'t mind" the jumping. Address this directly with everyone in the home.'
}

const jumping_stage2: Protocol = {
  id: 'jumping_s2',
  behavior: 'jumping_up',
  stage: 2,
  title: 'Auto-Sit for Greeting',
  objective: 'Teach the dog to automatically offer a sit whenever a person approaches, replacing jumping with a polite default behavior.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Practice the sit cue independently until the dog can sit within 2 seconds of a verbal or hand cue. If your dog\'s sit is not solid, spend 3 minutes drilling it with kibble before this session.',
      durationSeconds: 180,
      reps: 10,
      tip: null,
      successLook: 'Dog sits within 2 seconds of cue, 9 out of 10 attempts.'
    },
    {
      order: 2,
      instruction: 'Stand 5 feet from your dog. Begin walking toward them. If they sit as you approach — even without a cue — immediately say "yes!" and drop a treat between their front paws. The treat placement reinforces staying in position.',
      durationSeconds: null,
      reps: null,
      tip: 'Dropping the treat between the paws keeps the dog\'s head down and body in the sit position. Handing a treat from above encourages jumping.',
      successLook: 'Dog holds sit as you approach and reaches their nose down for the dropped treat.'
    },
    {
      order: 3,
      instruction: 'If the dog jumps as you approach, immediately turn your back. Wait for four paws on the floor and a sit (cue it if needed), then try the approach again from further away. Reduce your approach speed. Your enthusiasm is triggering the jump.',
      durationSeconds: null,
      reps: null,
      tip: 'Match your excitement level to what the dog can handle. If a slow, calm approach triggers jumping, try approaching sideways.',
      successLook: 'Dog holds a sit during a calm, slow approach.'
    },
    {
      order: 4,
      instruction: 'Gradually increase the energy of your approach over 10 reps: walk normally → walk quickly → jog slightly → reach out to pet while approaching. Each successful sit earns a treat dropped between their paws.',
      durationSeconds: null,
      reps: 10,
      tip: null,
      successLook: 'Dog holds sit even when you are jogging and reaching toward them.'
    },
    {
      order: 5,
      instruction: 'Rehearse a "doorbell drill": knock on the wall (or have someone ring the doorbell), wait for your dog to sit or be cued to sit, then open the door to a calm helper who immediately drops a treat for the sitting dog.',
      durationSeconds: null,
      reps: 5,
      tip: 'Practice this drill 2–3 times before actual visitors arrive. Repetition builds the habit before adrenaline is involved.',
      successLook: 'Dog holds sit when door opens to helper.'
    }
  ],
  successCriteria: 'Dog auto-sits in 12 out of 15 greeting trials without verbal cue when a person calmly approaches.',
  commonMistakes: [
    'Only practicing with family members — the dog needs rehearsal with helpers and eventually strangers',
    'Skipping the treat-between-paws technique — overhead treat delivery breaks the sit',
    'Over-exciting the dog during practice, making jumping more likely',
    'Not doing doorbell drills before real visitors arrive'
  ],
  equipmentNeeded: ['High-value treats', 'Optional: training partner/helper'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'jumping_s3',
  trainerNote: 'The auto-sit is one of the most practical behaviors you can teach. A dog that automatically sits for greetings is a social superstar. Celebrate this with your guests — it makes training feel real.'
}

const jumping_stage3: Protocol = {
  id: 'jumping_s3',
  behavior: 'jumping_up',
  stage: 3,
  title: 'Calm Greeting with Strangers',
  objective: 'Generalize the four-paws-on-floor and auto-sit behaviors to greetings with unfamiliar people in real-world contexts.',
  durationMinutes: 12,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Arrange for a helper (neighbor, friend) who has NOT practiced this with your dog. Brief them: "When you approach, ignore any jumping completely — turn your back. The moment my dog sits, drop this treat and calmly pet them." Give them 5 pre-loaded treats.',
      durationSeconds: null,
      reps: null,
      tip: 'Brief your helper in detail. An unprepared helper who greets the jumping dog enthusiastically is the most common protocol failure point.',
      successLook: 'Helper understands the protocol and is calm and neutral in demeanor.'
    },
    {
      order: 2,
      instruction: 'Have your dog on a short leash (3–4 feet). Have the helper approach from 20 feet away. At 10 feet, cue your dog to sit. If they sit, let the helper approach fully, drop the treat, and calmly pet the dog. If the dog jumps, helper turns away, you wait for sit.',
      durationSeconds: null,
      reps: 5,
      tip: 'The leash is not for stopping jumps — it is for preventing the dog from running toward the helper. Keep the leash loose.',
      successLook: 'Dog holds sit while stranger approaches and pets them.'
    },
    {
      order: 3,
      instruction: 'Once the dog is reliably sitting for 5 helper approaches, increase the challenge: have the helper be more excited ("Oh, what a cute dog!") and reach out more enthusiastically. This is closer to real-world conditions.',
      durationSeconds: null,
      reps: 3,
      tip: 'This step often causes regression — be ready to step back to Step 2 if needed. That is normal progress.',
      successLook: 'Dog remains on all four paws or sits when helper is excited.'
    },
    {
      order: 4,
      instruction: 'Practice in a different environment: outside on the sidewalk, at a pet-friendly store entrance, or in a park. Familiar behaviors in new places often need to be reintroduced — start easy and build back up.',
      durationSeconds: null,
      reps: 2,
      tip: null,
      successLook: 'Dog holds greeting behavior in at least one novel outdoor environment.'
    }
  ],
  successCriteria: 'Dog greets unfamiliar person with four paws on floor (or auto-sit) in 8 out of 10 real-world greeting trials.',
  commonMistakes: [
    'Skipping the helper briefing — unprepared people reinforce jumping',
    'Doing this exercise when the dog is at peak excitement (just woken up, first person in the door)',
    'Using too tight a leash and accidentally straining the dog\'s neck during jumps',
    'Expecting perfection — this takes weeks of real-world reps'
  ],
  equipmentNeeded: ['Short leash (3–4 feet)', 'High-value treats (for helper to carry)', 'Willing helper'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'Real-world generalization requires dozens of rehearsed interactions. Consider carrying treats on every walk for 4 weeks and asking strangers to participate in greeting rehearsals. This effort compounds — the dog gets better every single repetition.'
}

// ─────────────────────────────────────────────────────────────────────────────
// POTTY TRAINING
// ─────────────────────────────────────────────────────────────────────────────

const potty_stage1: Protocol = {
  id: 'potty_s1',
  behavior: 'potty_training',
  stage: 1,
  title: 'Timed Outdoor Trips & Reward System',
  objective: 'Establish a consistent potty schedule and a powerful reward system so the dog learns that outdoor elimination = jackpot.',
  durationMinutes: 5,
  repCount: 8,
  steps: [
    {
      order: 1,
      instruction: 'Print or write out your dog\'s potty schedule and post it on the fridge. Puppies under 4 months need outdoor trips every 1–2 hours. Dogs 4–6 months: every 2–3 hours. Adult dogs in training: every 3 hours minimum. Add: immediately after waking, within 15 minutes of eating, and after play sessions.',
      durationSeconds: null,
      reps: null,
      tip: 'Set phone alarms for every scheduled trip. The schedule must be followed even when nothing happens — the act of going outside at regular intervals builds the habit.',
      successLook: 'Schedule is written and alarms are set for the day.'
    },
    {
      order: 2,
      instruction: 'At each scheduled trip, leash your dog and take them to the same designated spot outside (a consistent patch of grass, a specific corner). Use the same route each time. Stand still and silent for up to 5 minutes.',
      durationSeconds: 300,
      reps: null,
      tip: 'Do NOT walk around or entertain the dog. This is a potty trip, not a walk. Excitement and movement distract from the task.',
      successLook: 'Dog sniffs the designated area and shows pre-elimination behavior (circling, sniffing intensely).'
    },
    {
      order: 3,
      instruction: 'The moment your dog begins eliminating (not after — during), say your chosen cue word softly: "go potty," "outside," or "hurry up." Say it once, calmly, so it does not interrupt the act.',
      durationSeconds: null,
      reps: null,
      tip: 'You are pairing the cue word with the act, not asking the dog to do it. Over weeks, the word begins to trigger the behavior.',
      successLook: 'Dog continues eliminating — they did not stop when you spoke.'
    },
    {
      order: 4,
      instruction: 'The instant your dog finishes — the VERY second — have a party. Say "yes! GOOD OUTSIDE!" in your most excited voice and deliver 3–5 high-value treats one at a time while they are still in position. Then give them a 5-minute walk as an additional reward.',
      durationSeconds: null,
      reps: null,
      tip: 'The timing is critical. The jackpot must happen within 2 seconds of the final squat. A delay of even 10 seconds makes the reward disconnected from the behavior.',
      successLook: 'Dog is clearly happy, tail wagging, eating treats enthusiastically.'
    },
    {
      order: 5,
      instruction: 'If no elimination happens after 5 minutes outside, calmly take the dog back inside and immediately tether them to you with a 4-foot leash (or put in the crate). Try again in 15 minutes. Repeat until success.',
      durationSeconds: null,
      reps: null,
      tip: 'Tethering to you keeps the dog from sneaking away to eliminate. You want to catch accidents before they happen, not after.',
      successLook: 'Dog has not had an accident because they were under constant supervision.'
    }
  ],
  successCriteria: 'Dog eliminates outdoors on 6 of 8 scheduled trips over a 2-day period with no unsupervised indoor access.',
  commonMistakes: [
    'Rewarding after coming back inside — reward must happen outside, immediately',
    'Punishing accidents after the fact — the dog cannot connect a punishment to something that happened minutes ago',
    'Giving too much indoor freedom too soon',
    'Skipping trips when the dog "seems fine" — the schedule is the training'
  ],
  equipmentNeeded: ['Short leash for outdoor trips', 'High-value treats kept by the door', 'Crate or tether for indoor supervision'],
  ageMinMonths: 8,
  ageMaxMonths: 36,
  difficulty: 1,
  nextProtocolId: 'potty_s2',
  trainerNote: 'Potty training is 90% management, 10% training. The most important tool is preventing accidents through supervision. Every accident that happens unsupervised is a practice of the wrong behavior. Your goal is zero indoor accidents for 4 consecutive weeks.'
}

const potty_stage2: Protocol = {
  id: 'potty_s2',
  behavior: 'potty_training',
  stage: 2,
  title: 'Signal Training for Outside Request',
  objective: 'Teach the dog to signal to you when they need to go out, rather than eliminating without warning.',
  durationMinutes: 8,
  repCount: 6,
  steps: [
    {
      order: 1,
      instruction: 'Choose a signal method: bell hanging on the door (most common), touching the door with a paw, or going to sit by the door. This protocol uses the bell method. Hang a bell at nose height on the door you use for potty trips.',
      durationSeconds: null,
      reps: null,
      tip: 'The bell method works because it is audible from any room. You will hear it even when you are not watching the dog.',
      successLook: 'Bell is hung at the correct height (dog can reach it with nose).'
    },
    {
      order: 2,
      instruction: 'Before each scheduled potty trip, hold a treat near the bell. When the dog investigates the bell with their nose (even a sniff), the bell will ring. Say "yes!" immediately and open the door for a potty trip. Do this before EVERY outdoor trip for one week.',
      durationSeconds: null,
      reps: 6,
      tip: 'You are pairing bell-ringing with going outside. Eventually the dog makes the connection: bell = door opens.',
      successLook: 'Dog touches the bell before going out at every scheduled trip.'
    },
    {
      order: 3,
      instruction: 'After 5–7 days of bell-prompted trips, start waiting 10 seconds at the door before each trip. Watch if the dog goes to the bell on their own or looks toward it. Any movement toward the bell earns the door opening.',
      durationSeconds: null,
      reps: null,
      tip: null,
      successLook: 'Dog approaches bell area without being prompted with a treat.'
    },
    {
      order: 4,
      instruction: 'When the dog rings the bell spontaneously for the first time — celebrate IMMEDIATELY. Open the door, run outside with them, and if they eliminate, give the biggest jackpot of the entire training process. This moment is critical.',
      durationSeconds: null,
      reps: null,
      tip: 'The first spontaneous bell ring is a major training milestone. Mark it on your calendar. The dog has understood the system.',
      successLook: 'Dog rings bell independently, goes outside, and eliminates.'
    }
  ],
  successCriteria: 'Dog rings bell on 4 of 6 potty trips over a 3-day period, at least 2 of which are spontaneous (without human prompting).',
  commonMistakes: [
    'Not responding fast enough when the dog signals — the dog must see the door open within seconds of the bell ring',
    'Ignoring a bell ring because "we just went out" — always open the door; you can return immediately if nothing happens',
    'Placing the bell too high for the dog to reach comfortably',
    'Letting the bell become a demand for going outside to play, not just to eliminate — only reinforce actual elimination'
  ],
  equipmentNeeded: ['Hanging bells (available at pet stores)', 'High-value treats', 'Consistent potty door'],
  ageMinMonths: 12,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'potty_s3',
  trainerNote: 'Some dogs will ring the bell obsessively for attention or to go play outside. If this happens, only reward the bell ring if it is followed by actual elimination outdoors. Ignore bell rings that result in no elimination after 2 minutes outside.'
}

const potty_stage3: Protocol = {
  id: 'potty_s3',
  behavior: 'potty_training',
  stage: 3,
  title: 'Reliable Indoor/Outdoor Schedule with Extended Intervals',
  objective: 'Extend the interval between potty trips to 4+ hours and build full household reliability with supervised indoor freedom.',
  durationMinutes: 5,
  repCount: 4,
  steps: [
    {
      order: 1,
      instruction: 'Track your dog\'s accidents and successes for 1 week. Calculate your current accident rate. Only extend intervals when the dog has had 7 consecutive days with no accidents. Do not rush this — premature freedom is the #1 relapse cause.',
      durationSeconds: null,
      reps: null,
      tip: 'Use a simple calendar. Mark a ✓ for clean days and an ✗ for accident days. Seven consecutive ✓ days = ready to extend.',
      successLook: 'Calendar shows 7 consecutive clean days.'
    },
    {
      order: 2,
      instruction: 'Extend your first interval from 3 hours to 3.5 hours. Hold at this interval for 3 clean days. Then extend to 4 hours. Never skip more than one step at a time.',
      durationSeconds: null,
      reps: null,
      tip: 'Half-hour increments sound small but prevent the regression that comes from jumping too fast. The goal is to extend bladder control gradually.',
      successLook: 'Dog holds bladder for new interval without accident.'
    },
    {
      order: 3,
      instruction: 'Begin giving supervised indoor freedom: one room at a time. Watch the dog closely for pre-elimination signals (circling, sniffing the floor, going to a corner, suddenly leaving your side). If you see any signal, take them out immediately.',
      durationSeconds: null,
      reps: null,
      tip: 'Pre-elimination signals appear 30–60 seconds before elimination. Learn your dog\'s specific signals — they are consistent for each individual dog.',
      successLook: 'Dog has learned to seek you out or go to the door when they need to eliminate.'
    },
    {
      order: 4,
      instruction: 'For the next 2 weeks, continue rewarding outdoor elimination every single time — even when the dog is "trained." Intermittent reinforcement builds extreme reliability. The dog that gets occasional jackpots outdoors is more reliable than one who gets nothing.',
      durationSeconds: null,
      reps: 4,
      tip: null,
      successLook: 'Dog goes immediately to the designated spot and eliminates within 2 minutes of going outside.'
    }
  ],
  successCriteria: 'Dog has zero accidents indoors for 14 consecutive days and can hold bladder for 4+ hours during the day.',
  commonMistakes: [
    'Extending intervals too quickly after a setback',
    'Stopping food rewards for outdoor elimination — continue indefinitely with intermittent treats',
    'Granting full-house freedom before earning it room by room',
    'Stopping tethering/crating before the dog has demonstrated consistent signaling behavior'
  ],
  equipmentNeeded: ['Calendar or app for tracking', 'Treats kept by the door for outdoor rewards'],
  ageMinMonths: 12,
  ageMaxMonths: 36,
  difficulty: 2,
  nextProtocolId: null,
  trainerNote: 'Potty training is considered "complete" when the dog has had zero accidents for 30 consecutive days with supervised indoor freedom. Some dogs achieve this at 5 months; others at 12 months. Individual variation is normal and not a sign of a slow learner.'
}

// ─────────────────────────────────────────────────────────────────────────────
// CRATE TRAINING
// ─────────────────────────────────────────────────────────────────────────────

const crate_stage1: Protocol = {
  id: 'crate_s1',
  behavior: 'crate_anxiety',
  stage: 1,
  title: 'Positive Crate Introduction',
  objective: 'Build a positive emotional association with the crate through feeding, exploration, and choice-based entry — before the door is ever closed.',
  durationMinutes: 8,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Place the crate in the room where your family spends the most time. Remove the door initially or prop it fully open. Throw 5–6 high-value treats just inside the entrance. Let the dog investigate on their own. Do not lure, push, or coax.',
      durationSeconds: null,
      reps: null,
      tip: 'The dog must choose to enter. Forced entry creates anxiety. If they will not go in even for high-value treats, the crate may need to be introduced at even smaller increments.',
      successLook: 'Dog walks into the crate entrance to retrieve treats without hesitation.'
    },
    {
      order: 2,
      instruction: 'Once the dog enters freely for treats at the entrance, begin tossing treats to the middle of the crate, then to the back. Every time the dog goes in to get a treat, say "yes!" warmly. Do 10 reps.',
      durationSeconds: null,
      reps: 10,
      tip: 'Keep your own body posture neutral — do not crowd the crate or hover. Give the dog space.',
      successLook: 'Dog walks all the way to the back of the crate to retrieve treats.'
    },
    {
      order: 3,
      instruction: 'Feed your dog\'s next full meal inside the crate with the door open. Place the bowl at the back. Let them eat, then walk out freely when done. Repeat for 3 consecutive meals.',
      durationSeconds: null,
      reps: 3,
      tip: 'Meal feeding in the crate creates the strongest possible association because hunger is a primary motivator.',
      successLook: 'Dog walks into the crate, eats the full meal, and walks out calmly without stress.'
    },
    {
      order: 4,
      instruction: 'Introduce a chew (bully stick, frozen KONG, or LickiMat) inside the open crate. Let the dog settle in the crate with the chew for 5–10 minutes while you sit nearby reading or working.',
      durationSeconds: 600,
      reps: null,
      tip: 'A frozen KONG stuffed with peanut butter or plain yogurt is ideal here. The licking motion is naturally calming for dogs.',
      successLook: 'Dog stays in the crate with the chew, fully relaxed, not watching you anxiously.'
    }
  ],
  successCriteria: 'Dog enters the open crate willingly within 5 seconds when a treat or chew is placed inside, 9 out of 10 times.',
  commonMistakes: [
    'Closing the door too soon — introduction should take 3–5 days before the door is closed',
    'Using the crate as punishment',
    'Placing the crate in an isolated room instead of a family area',
    'Forcing the dog in or placing them inside physically'
  ],
  equipmentNeeded: ['Crate (appropriately sized — dog can stand, turn, lie down)', 'High-value treats', 'Frozen KONG or chew'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'crate_s2',
  trainerNote: 'The right crate size is critical. The crate should be just large enough for the dog to stand fully, turn around, and lie down stretched out. A crate that is too large allows the dog to eliminate in one corner and sleep in another — undermining potty training.'
}

const crate_stage2: Protocol = {
  id: 'crate_s2',
  behavior: 'crate_anxiety',
  stage: 2,
  title: 'Short Duration Comfort (5–30 Minutes)',
  objective: 'Build comfort with the door closed, starting at 5 seconds and systematically extending to 30 minutes with you present.',
  durationMinutes: 10,
  repCount: 8,
  steps: [
    {
      order: 1,
      instruction: 'Send the dog into the crate with a cue ("crate up," "kennel," or "bed"). Once all four paws are inside, gently close the door. Wait 5 seconds. Open the door before the dog shows any stress. Mark "yes!" and treat.',
      durationSeconds: 5,
      reps: 3,
      tip: 'Open the door BEFORE the dog becomes stressed. The goal is to end each rep while the dog is calm. Ending while stressed teaches "stress eventually opens the door."',
      successLook: 'Dog stands or sits calmly in the closed crate for 5 seconds, no pawing or whining.'
    },
    {
      order: 2,
      instruction: 'Increase duration: 5 seconds → 15 seconds → 30 seconds → 1 minute → 3 minutes. Only advance when the dog is fully calm at the current duration. If stress occurs, go back one step.',
      durationSeconds: null,
      reps: 5,
      tip: 'There is no timeline. Some dogs are ready to extend in one session; others take a week at each step. Follow the dog, not the schedule.',
      successLook: 'Dog is lying down, soft eyes, not panting anxiously.'
    },
    {
      order: 3,
      instruction: 'Work up to 10 minutes with a frozen KONG inside. Give the KONG when the door closes. The dog should be engaged with the KONG for most of the duration. When the KONG is finished, open the door while the dog is still calm.',
      durationSeconds: 600,
      reps: null,
      tip: 'A frozen KONG (frozen overnight) lasts longer and keeps the dog busy longer. This is worth the preparation time.',
      successLook: 'Dog licks KONG contentedly in closed crate for 10+ minutes.'
    },
    {
      order: 4,
      instruction: 'Build to 30 minutes with you in the room but not interacting. Sit at your desk or on the sofa. Ignore the dog. Only give treats if they are lying down and quiet — not if they are whining or pawing.',
      durationSeconds: 1800,
      reps: null,
      tip: 'Responding to whining with attention or treats — even to "calm them down" — teaches whining is how to get released. Wait for 3 seconds of quiet before any interaction.',
      successLook: 'Dog naps or rests quietly in crate for 30 minutes with no distress vocalizations.'
    }
  ],
  successCriteria: 'Dog can remain in closed crate for 30 minutes with handler present, displaying calm behavior (lying down, no continuous whining).',
  commonMistakes: [
    'Advancing too fast — skipping durations to save time',
    'Releasing the dog when they whine (even once teaches that whining works)',
    'Leaving the dog too long before they are ready and creating a traumatic experience',
    'Not using a food-stuffed toy to occupy the dog during the session'
  ],
  equipmentNeeded: ['Crate', 'Frozen KONG or long-lasting chew', 'High-value treats'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'crate_s3',
  trainerNote: 'Puppies under 4 months should not be crated for more than 1–2 hours at a time (not including overnight). Their bladders physically cannot hold longer. Adjust expectations based on age.'
}

const crate_stage3: Protocol = {
  id: 'crate_s3',
  behavior: 'crate_anxiety',
  stage: 3,
  title: 'Building Duration to 2+ Hours',
  objective: 'Build out-of-sight crate comfort to 2+ hours, including a full pre-departure routine for alone-time preparation.',
  durationMinutes: 12,
  repCount: 5,
  steps: [
    {
      order: 1,
      instruction: 'With the dog comfortable in the crate for 30 minutes, begin adding distance: close the crate, then walk to the other side of the room. Return after 2 minutes. Build to leaving the room entirely for 5 minutes.',
      durationSeconds: 300,
      reps: 3,
      tip: 'Leave and return casually — no big hellos or goodbyes. Dramatic departures and arrivals signal that your absence is a big deal.',
      successLook: 'Dog shows no visible stress when you leave the room for 5 minutes.'
    },
    {
      order: 2,
      instruction: 'Establish a departure routine: 10 minutes before crating, take the dog for a 10-minute walk (burns energy). Then give them a 15-minute settle period. Then crate with a frozen KONG. This routine signals what is coming and reduces anticipatory anxiety.',
      durationSeconds: null,
      reps: null,
      tip: 'The routine must be consistent. Dogs learn the sequence and begin to anticipate the crate positively because they know what comes next.',
      successLook: 'Dog voluntarily walks to the crate after the departure routine is completed.'
    },
    {
      order: 3,
      instruction: 'Extend out-of-sight duration in 15-minute increments: 5 minutes → 20 minutes → 35 minutes → 60 minutes → 90 minutes → 2 hours. Spend 2–3 sessions at each step before advancing.',
      durationSeconds: null,
      reps: 5,
      tip: 'Set up a phone camera pointed at the crate so you can monitor on your phone while in another room. This lets you return before panic, not after.',
      successLook: 'Dog is lying or sitting calmly, not vocalizing continuously, for the target duration.'
    },
    {
      order: 4,
      instruction: 'For the 2-hour session: use a higher-value KONG (frozen with food, not just peanut butter), and give it when you close the crate. Return after 2 hours using the same calm, neutral arrival energy.',
      durationSeconds: 7200,
      reps: null,
      tip: null,
      successLook: 'Dog is calm or asleep when you return. May get up and wag, but not frantic.'
    }
  ],
  successCriteria: 'Dog can remain in crate for 2 hours out of sight without continuous distress vocalizations on 3 consecutive sessions.',
  commonMistakes: [
    'Leaving for long durations before building to them incrementally',
    'Dramatic departure rituals (long goodbyes, excessive reassurance) that increase separation anxiety',
    'Not monitoring remotely during longer sessions',
    'Over-using the crate — maximum daytime crating for adult dogs is 4–5 hours'
  ],
  equipmentNeeded: ['Crate', 'Phone/camera for remote monitoring', 'Frozen KONG with high-value filling', '4-foot leash for pre-crate walk'],
  ageMinMonths: 12,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'The goal of crate training is always a dog who chooses the crate voluntarily for naps and rest. Once this happens — and it will — the crate has become a true safe space. Many dogs continue to use their crate throughout their lives even when the door is left open.'
}

// ─────────────────────────────────────────────────────────────────────────────
// PUPPY BITING
// ─────────────────────────────────────────────────────────────────────────────

const biting_stage1: Protocol = {
  id: 'biting_s1',
  behavior: 'puppy_biting',
  stage: 1,
  title: 'Yelp & Redirect Technique',
  objective: 'Teach the puppy that biting human skin causes play to pause, and redirect all mouthing to appropriate toys.',
  durationMinutes: 5,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Begin a normal play session with your hands. When the puppy\'s teeth make contact with your skin — any pressure at all — immediately say "OW!" or "YIP!" in a sharp, high-pitched tone (not angry — surprised). Let your hand go limp. Do NOT pull your hand away quickly.',
      durationSeconds: null,
      reps: null,
      tip: 'Do not pull your hand away fast — fast movement triggers prey drive and makes the game more exciting. Go limp instead.',
      successLook: 'Puppy pauses or pulls back slightly when they hear the yelp.'
    },
    {
      order: 2,
      instruction: 'After the yelp, freeze for 3 seconds. If the puppy backs off or looks confused, calmly offer a toy immediately. When they grab the toy, say "yes!" and continue playing with the toy energetically.',
      durationSeconds: 3,
      reps: null,
      tip: 'The toy must become more interesting than your hands. Use toys that move: rope toys, tug toys, crinkle toys. Static toys are boring.',
      successLook: 'Puppy redirects mouth from skin to toy.'
    },
    {
      order: 3,
      instruction: 'If the puppy bites again immediately after the yelp, give a second yelp + freeze. If a third bite happens in the same session, calmly stand up, cross your arms, and turn away completely for 10 seconds. This is a mini time-out.',
      durationSeconds: 10,
      reps: null,
      tip: 'Three bites = time-out. This teaches that excessive biting ends the play session entirely.',
      successLook: 'Puppy follows you and looks up at your face, offering softer behavior.'
    },
    {
      order: 4,
      instruction: 'After the 10-second pause, re-engage with a toy. If the puppy stays engaged with the toy for 30 seconds, give a treat. You are reinforcing toy-directed play.',
      durationSeconds: 30,
      reps: null,
      tip: null,
      successLook: 'Puppy plays with toy for 30+ seconds without redirecting to hands.'
    },
    {
      order: 5,
      instruction: 'Practice this sequence 15 times across the day (keep each session under 5 minutes). Track your progress: count how many yelps you give per session. The number should decrease over days.',
      durationSeconds: null,
      reps: 15,
      tip: 'If you\'re giving more than 5 yelps per 5-minute session after a week, the puppy may need more exercise and mental stimulation before training — a tired puppy bites less.',
      successLook: 'Fewer than 3 bites per 5-minute play session by the end of the week.'
    }
  ],
  successCriteria: 'Puppy redirects from skin to toy within 5 seconds of the yelp cue in 10 of 15 repetitions.',
  commonMistakes: [
    'Pulling the hand away quickly — triggers chase instinct',
    'Using an angry or threatening tone instead of a surprised yelp',
    'Inconsistency — some family members allow mouthing and others don\'t',
    'Playing with hands as toys (roughhousing, letting puppy gnaw on fingers "because it\'s cute")'
  ],
  equipmentNeeded: ['Tug toy or rope toy', 'Treat pouch', 'Patience — this takes 2–4 weeks of consistent practice'],
  ageMinMonths: 8,
  ageMaxMonths: 18,
  difficulty: 1,
  nextProtocolId: 'biting_s2',
  trainerNote: 'Puppy biting peaks between 10 and 16 weeks and typically improves significantly by 5–6 months when adult teeth come in. Consistency in the next 8 weeks is what separates dogs with reliable bite inhibition from those who continue to mouth as adults.'
}

const biting_stage2: Protocol = {
  id: 'biting_s2',
  behavior: 'puppy_biting',
  stage: 2,
  title: 'Turn Away & Timeout Method',
  objective: 'Upgrade from yelp-and-redirect to a complete interaction withdrawal, teaching the puppy that biting removes all access to the human entirely.',
  durationMinutes: 8,
  repCount: 12,
  steps: [
    {
      order: 1,
      instruction: 'Establish a clear rule: any tooth-on-skin contact during this phase results in immediate disengagement — no yelp, no warning. Simply stop all interaction, stand up, cross your arms, and turn your back completely.',
      durationSeconds: null,
      reps: null,
      tip: 'This is stricter than Stage 1 and should only be introduced once the puppy is consistently responding to the yelp. If the yelp is still teaching the boundary, continue Stage 1.',
      successLook: 'You are turned away, arms crossed, no eye contact with puppy.'
    },
    {
      order: 2,
      instruction: 'Wait in the turned-away position for 10–15 seconds of calm from the puppy. If they jump on you or paw at you, wait it out — do not respond. The moment they have been quiet and calm for 10 consecutive seconds, turn back and calmly resume interaction.',
      durationSeconds: 15,
      reps: null,
      tip: 'Restart the 10-second clock if they vocalize, paw, or jump. They must earn re-engagement with quiet, calm behavior.',
      successLook: 'Puppy sits or stands quietly, waiting — not demanding.'
    },
    {
      order: 3,
      instruction: 'When you turn back to re-engage, immediately offer a toy and begin toy-directed play. Reward 30 seconds of toy-only play with a treat. You are building the habit: human = toy play, not skin biting.',
      durationSeconds: 30,
      reps: null,
      tip: null,
      successLook: 'Puppy grabs toy enthusiastically and plays without mouthing hands.'
    },
    {
      order: 4,
      instruction: 'Repeat 12 times over the session. You should notice the puppy offering softer mouth pressure or going directly to toys to initiate play rather than mouthing hands.',
      durationSeconds: null,
      reps: 12,
      tip: 'Track progress: write down the number of timeouts per day. By day 5, you should see a clear downward trend.',
      successLook: 'Puppy approaches with a toy in their mouth to initiate play — not mouthing your hands.'
    }
  ],
  successCriteria: 'Puppy\'s bite frequency drops by 50% over 5 sessions compared to Stage 1 baseline. Puppy approaches for play with a toy in 6 of 12 trials without prompting.',
  commonMistakes: [
    'Introducing this stage before the puppy has any understanding of the yelp — progression must be earned',
    'Making the timeout dramatic (scolding, staring) — calm and boring is the goal',
    'Inconsistency between family members',
    'Continuing to play with hands even briefly after tooth contact'
  ],
  equipmentNeeded: ['Tug toy', 'Optional: pen or baby gate to step behind for more complete separation'],
  ageMinMonths: 10,
  ageMaxMonths: 18,
  difficulty: 2,
  nextProtocolId: 'biting_s3',
  trainerNote: 'At this stage, you want to be decreasing the overall intensity of biting — both frequency and pressure. A puppy who bites hard 5 times a day is worse than one who bites softly 15 times. Track both metrics.'
}

const biting_stage3: Protocol = {
  id: 'biting_s3',
  behavior: 'puppy_biting',
  stage: 3,
  title: 'Bite Inhibition with Consistent Thresholds',
  objective: 'Finalize bite inhibition by establishing consistent thresholds, proofing with high-arousal play, and building default calm behavior.',
  durationMinutes: 10,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Set your current threshold explicitly: the rule is now "even light tooth pressure on skin = immediate disengagement." There is zero tolerance. This is different from Stage 1 where hard bites were the trigger. Now the standard is higher.',
      durationSeconds: null,
      reps: null,
      tip: 'The threshold gets tighter over time. By adulthood, the standard should be that a dog who mouths a person — even gently — disengages immediately when the person says "ouch."',
      successLook: 'You have communicated the rule to all household members and helpers.'
    },
    {
      order: 2,
      instruction: 'Practice "arousal threshold" management: play tug with your dog for 30 seconds. Pause play. Ask for a "sit." Wait. The dog should be able to shift from play to calm behavior within 5 seconds. Mark "yes!" and treat the sit, then resume tug.',
      durationSeconds: 30,
      reps: 5,
      tip: 'This exercise teaches the dog to move between arousal states — high energy play ↔ calm self-control. This is the skill that prevents bite accidents from happening during exciting moments.',
      successLook: 'Dog transitions from active tug to sitting in under 5 seconds when play pauses.'
    },
    {
      order: 3,
      instruction: 'Introduce a "hands" exercise: hold out your hand, palm facing the dog. If the dog sniffs or licks it without biting, say "yes!" and treat. Practice until the dog can sniff your hand, your face approaching them, and your hands petting their head without any mouthing.',
      durationSeconds: null,
      reps: 5,
      tip: 'Start with the back of your hand (less triggering than the palm). Build to the palm, then to touching the dog\'s face and body.',
      successLook: 'Dog sniffs and licks extended hand with zero tooth pressure.'
    },
    {
      order: 4,
      instruction: 'Proof with helpers: have a friend the dog does not know practice the same hand-offering exercise. If the dog mouths the helper\'s hand, the helper turns away. Reward every no-bite interaction lavishly.',
      durationSeconds: null,
      reps: 5,
      tip: null,
      successLook: 'Dog greets unfamiliar person\'s hand with sniff/lick, no mouthing.'
    }
  ],
  successCriteria: 'Dog can transition from active play to a calm sit in under 5 seconds 8 of 10 attempts. Zero bite incidents with strangers over 5 practice sessions.',
  commonMistakes: [
    'Not proofing with other people — the dog may have perfect bite inhibition with family and none with strangers',
    'Letting high-arousal play escalate without breaks — more excitement = more biting risk',
    'Inconsistency from one week to the next — bite inhibition requires months of consistent standards'
  ],
  equipmentNeeded: ['Tug toy', 'Treats', 'A willing helper (friend or family member)'],
  ageMinMonths: 12,
  ageMaxMonths: 24,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'True bite inhibition — where a dog can put their mouth on skin but will not apply pressure — is built through all three stages. A dog that has never learned to control bite pressure is a liability. A dog with excellent bite inhibition is a safe companion for children, strangers, and veterinary care.'
}

// ─────────────────────────────────────────────────────────────────────────────
// BARKING & SETTLING
// ─────────────────────────────────────────────────────────────────────────────

const settle_stage1: Protocol = {
  id: 'settle_s1',
  behavior: 'settling',
  stage: 1,
  title: 'Settle Cue on Mat — Foundation',
  objective: 'Teach the dog that their designated mat means "go lie down and relax here," using luring and duration building from 5 seconds to 2 minutes.',
  durationMinutes: 8,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Place a non-slip mat or dog bed in a consistent location. Keep it in the same spot throughout training. Stand next to the mat with treats. Lure your dog onto the mat by moving a treat from in front of their nose to just past the mat\'s edge.',
      durationSeconds: null,
      reps: null,
      tip: 'Use a mat that is clearly distinct from the floor — the dog needs to be able to identify it visually. A bathmat or yoga mat works well.',
      successLook: 'Dog steps onto the mat to follow the treat lure.'
    },
    {
      order: 2,
      instruction: 'Once all four paws are on the mat, lure the dog into a down position by moving the treat from between their eyes, slowly toward the floor between their front paws. The moment elbows touch the mat, say "yes!" and deliver the treat. Do 8 reps.',
      durationSeconds: null,
      reps: 8,
      tip: 'If the dog pops back up immediately after the treat, that is fine at this stage. We are not asking for duration yet — just the down on the mat.',
      successLook: 'Dog lies down with elbows on mat in a relaxed position.'
    },
    {
      order: 3,
      instruction: 'Add the verbal cue: just before the dog reaches the mat, say "settle" or "place." Say it once, calmly. Then lure into the down. The cue begins to predict the sequence.',
      durationSeconds: null,
      reps: 5,
      tip: null,
      successLook: 'Dog walks toward mat when "settle" is said and begins to lie down.'
    },
    {
      order: 4,
      instruction: 'Begin building duration: after the down, wait 5 seconds before marking "yes!" and treating. Then 10 seconds, 20 seconds, 30 seconds. Deliver treats to the mat (between paws) so the dog stays in position. If the dog gets up, calmly lure back to the down — do not scold.',
      durationSeconds: null,
      reps: 7,
      tip: 'Rain treats onto the mat every few seconds during the duration period — frequent reinforcement for staying is more effective than one big reward at the end.',
      successLook: 'Dog stays in down on mat for 30 seconds, relaxed, not staring at you anxiously.'
    }
  ],
  successCriteria: 'Dog goes to the mat and lies down in response to the "settle" cue and holds the position for 60 seconds with treat reinforcement in 10 of 15 repetitions.',
  commonMistakes: [
    'Using the mat for timeouts or putting the dog there when you are frustrated — the mat must always be positive',
    'Building duration too fast before the mat = good thing association is solid',
    'Scolding the dog for getting off the mat — always lure back calmly',
    'Using the mat as a management tool before the cue is trained (carrying dog to mat, physically placing them there)'
  ],
  equipmentNeeded: ['Non-slip mat or dog bed', 'High-value treats', 'Treat pouch'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'settle_s2',
  trainerNote: 'The settle cue is one of the most practical and versatile cues in training. A dog that can settle on cue can be managed in virtually any environment — restaurants, offices, friends\' homes, waiting rooms. Invest in building this cue solidly.'
}

const settle_stage2: Protocol = {
  id: 'settle_s2',
  behavior: 'settling',
  stage: 2,
  title: 'Settle with Mild Household Distractions',
  objective: 'Proof the settle cue with the TV on, people walking past, and routine household activity while building duration to 5 minutes.',
  durationMinutes: 10,
  repCount: 8,
  steps: [
    {
      order: 1,
      instruction: 'Confirm your baseline: cue "settle" from 5 feet away. Dog should go to mat and lie down within 5 seconds without a lure. If they still need a lure, spend 2 more sessions on Stage 1 before advancing.',
      durationSeconds: null,
      reps: 3,
      tip: null,
      successLook: 'Dog walks to mat and downs without following a treat lure.'
    },
    {
      order: 2,
      instruction: 'Cue settle, then turn on the TV at normal volume. Deliver a treat to the mat every 30 seconds for the first 3 minutes. Gradually reduce the treat frequency to every 60 seconds, then every 2 minutes.',
      durationSeconds: 300,
      reps: null,
      tip: 'Fading reinforcement must be done gradually. Jump from every 30 seconds to "nothing" and the dog will leave the mat.',
      successLook: 'Dog remains on mat for 5 minutes with TV on and treats every 30–60 seconds.'
    },
    {
      order: 3,
      instruction: 'Practice "walk-past" proofing: cue settle, then walk casually past the mat every 30 seconds in a normal household activity pattern (walking to the kitchen, carrying laundry, opening the fridge). Any time the dog stays on the mat as you pass, toss a treat to the mat.',
      durationSeconds: null,
      reps: 5,
      tip: 'This is proofing against the dog following you — one of the biggest challenges with the settle cue.',
      successLook: 'Dog stays on mat when you walk past without getting up to follow.'
    },
    {
      order: 4,
      instruction: 'Have a household member enter the room and sit down, then another stand up and move to the kitchen. All normal activity. Deliver a treat to the mat every 60 seconds the dog stays down. Work up to 5 minutes of settled behavior during moderate household activity.',
      durationSeconds: 300,
      reps: null,
      tip: null,
      successLook: 'Dog stays relaxed on mat for 5 minutes while household members move around normally.'
    }
  ],
  successCriteria: 'Dog holds settle on mat for 5 minutes with mild household distractions (TV on, people moving through room) with treats every 60 seconds, 6 of 8 sessions.',
  commonMistakes: [
    'Fading treat reinforcement too quickly — keep reinforcing at the mat even during longer holds',
    'Calling the dog off the mat between distraction trials — release with "free!" or "okay" so they understand the session is officially over',
    'Starting with distractions that are too strong (guests, other animals, doorbell) before basics are solid'
  ],
  equipmentNeeded: ['Mat', 'Treats', 'Treat pouch', 'Household distractions (TV, people)'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'settle_s3',
  trainerNote: 'The settle cue is naturally self-reinforcing once the dog understands it — a settled dog gets ignored, which is exactly what many dogs want. Over time the treat schedule can fade dramatically for many dogs once the habit is established.'
}

const settle_stage3: Protocol = {
  id: 'settle_s3',
  behavior: 'settling',
  stage: 3,
  title: 'Go to Place from Any Room',
  objective: 'Build distance and generalization: the dog can go to their mat from any room in the home on a single verbal cue, and hold it for 10 minutes.',
  durationMinutes: 12,
  repCount: 8,
  steps: [
    {
      order: 1,
      instruction: 'From 10 feet away in the same room, cue "place." Dog should go directly to the mat and lie down without guidance. Treat on arrival. Build from 10 to 20 to 30 feet across the room over 5 reps.',
      durationSeconds: null,
      reps: 5,
      tip: 'At greater distances, the dog is doing more independent thinking to find and go to the mat. This is a big cognitive step — celebrate every attempt.',
      successLook: 'Dog moves purposefully to mat from across the room and lies down.'
    },
    {
      order: 2,
      instruction: 'Move to the adjacent room. Cue "place" without pointing. If the dog hesitates, wait 5 seconds, then walk toward the mat and point. Goal: the dog goes to the mat from another room on voice cue alone within 3 sessions.',
      durationSeconds: null,
      reps: 3,
      tip: 'The dog must physically know where the mat is. If the mat is new to a room, let the dog explore the new layout before cuing.',
      successLook: 'Dog leaves the room you are in and goes to the mat in the other room.'
    },
    {
      order: 3,
      instruction: 'Build to a 10-minute hold: cue place, deliver a frozen KONG, set a timer. Check in every 2 minutes and drop a treat on the mat without making eye contact (to avoid calling the dog to you). At 10 minutes, say "free!" and release.',
      durationSeconds: 600,
      reps: null,
      tip: 'Delivering the treat without eye contact is crucial — it keeps the dog in the down rather than popping up to look at you.',
      successLook: 'Dog holds settle with frozen KONG for 10 minutes before being formally released.'
    },
    {
      order: 4,
      instruction: 'Introduce a novel location: bring the mat to a friend\'s home, a hotel room, or an outdoor café space. Cue "place." The dog should go to the mat in any location with 1–2 reps of warm-up. This is the gold standard of the settle cue.',
      durationSeconds: null,
      reps: 3,
      tip: null,
      successLook: 'Dog lies on mat in a novel environment for 3+ minutes without excessive anxiety.'
    }
  ],
  successCriteria: 'Dog goes to mat from another room on voice cue in 6 of 8 trials and holds for 10 minutes in a familiar environment.',
  commonMistakes: [
    'Not releasing the dog formally — always say "free" or "okay" to end the settle',
    'Punishing the dog for getting up during long holds — lure back and reduce duration, then build again',
    'Skipping the novel environment step — a settle cue that only works at home is not a trained behavior'
  ],
  equipmentNeeded: ['Mat (portable, easy to carry)', 'Frozen KONG', 'High-value treats', 'Timer'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'A dog that can place on cue from another room and hold for 10+ minutes is genuinely life-changing for most owners. It allows you to have guests, dinner parties, work calls, and veterinary visits without constant management. This is one of the highest-ROI behaviors in this entire program.'
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export const PROTOCOLS: Protocol[] = [
  llw_stage1, llw_stage2, llw_stage3,
  recall_stage1, recall_stage2, recall_stage3,
  jumping_stage1, jumping_stage2, jumping_stage3,
  potty_stage1, potty_stage2, potty_stage3,
  crate_stage1, crate_stage2, crate_stage3,
  biting_stage1, biting_stage2, biting_stage3,
  settle_stage1, settle_stage2, settle_stage3,
]

export const PROTOCOLS_BY_ID: Record<string, Protocol> = Object.fromEntries(
  PROTOCOLS.map((p) => [p.id, p])
)

export const PROTOCOLS_BY_BEHAVIOR: Record<string, Protocol[]> = PROTOCOLS.reduce(
  (acc, p) => {
    if (!acc[p.behavior]) acc[p.behavior] = []
    acc[p.behavior].push(p)
    return acc
  },
  {} as Record<string, Protocol[]>
)

// Map from planGenerator exerciseId to protocol id
export const EXERCISE_TO_PROTOCOL: Record<string, string> = {
  // Leash pulling
  ll_01: 'llw_s1', ll_02: 'llw_s1', ll_03: 'llw_s2', ll_04: 'llw_s2',
  ll_05: 'llw_s3', ll_06: 'llw_s3', ll_07: 'llw_s3', ll_08: 'llw_s3',
  // Jumping
  ju_01: 'jumping_s1', ju_02: 'jumping_s2', ju_03: 'jumping_s2',
  ju_04: 'jumping_s3', ju_05: 'jumping_s3', ju_06: 'jumping_s3',
  // Barking (map to settle for v1 since barking uses same settle foundation)
  bk_01: 'settle_s1', bk_02: 'settle_s1', bk_03: 'settle_s2',
  bk_04: 'settle_s2', bk_05: 'settle_s3', bk_06: 'settle_s3',
  // Recall
  rc_01: 'recall_s1', rc_02: 'recall_s1', rc_03: 'recall_s2',
  rc_04: 'recall_s2', rc_05: 'recall_s3', rc_06: 'recall_s3', rc_07: 'recall_s3',
  // Potty
  pt_01: 'potty_s1', pt_02: 'potty_s1', pt_03: 'potty_s2',
  pt_04: 'potty_s2', pt_05: 'potty_s3', pt_06: 'potty_s3',
  // Crate
  ca_01: 'crate_s1', ca_02: 'crate_s1', ca_03: 'crate_s2',
  ca_04: 'crate_s2', ca_05: 'crate_s3', ca_06: 'crate_s3', ca_07: 'crate_s3',
  // Puppy biting
  pb_01: 'biting_s1', pb_02: 'biting_s1', pb_03: 'biting_s2',
  pb_04: 'biting_s2', pb_05: 'biting_s3', pb_06: 'biting_s3',
  // Settling
  st_01: 'settle_s1', st_02: 'settle_s1', st_03: 'settle_s2',
  st_04: 'settle_s2', st_05: 'settle_s3', st_06: 'settle_s3', st_07: 'settle_s3',
}
