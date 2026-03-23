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
  /** Whether this protocol supports the server-side Live AI Trainer flow. */
  supportsLiveAiTrainer: boolean
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
      tip: 'A sniff walk is not a failure — it is a calculated reward that makes structured work more tolerable and mentally refreshing for the dog.',
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
  trainerNote: 'This exercise looks boring but it is the single most important foundation for leash manners. Dogs that check in reliably are dogs that can be guided through distractions. Spend at least 3 sessions here before advancing.',
  supportsLiveAiTrainer: false,
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
      tip: 'You will be stopping and starting frequently. This is normal — stick with it.',
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
  trainerNote: 'Most owners see improvement within 3–5 sessions. The hard part is consistency: every single walk, every single person in the household must follow the same rule. One person walking forward on tension undoes a week of training.',
  supportsLiveAiTrainer: false,
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
      tip: 'The moment the dog reaches your hip is the golden moment to reward — not when they were ahead, not after they\'ve been beside you for several steps.',
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
      successLook: 'Dog relaxed, sniffing freely, decompressing after structured work.'
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
  trainerNote: 'By Stage 3, your dog should walk nicely on quiet streets. Busy streets, other dogs, and high-distraction environments require months of practice and are a separate advanced module.',
  supportsLiveAiTrainer: false,
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
      tip: 'Don\'t rush the duration increase. Even one extra second of sustained eye contact is worth marking. You are building a habit of checking in, not a performance.',
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
  trainerNote: 'Never call your dog\'s name to do something they dislike until the recall is bombproof. Every time you call and they come to something bad, you lose a little reliability. Protect the name cue like it is gold.',
  supportsLiveAiTrainer: true,
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
      tip: 'This game builds emotional momentum around the recall cue. The dog should arrive at a near-sprint, not a casual trot. Enthusiasm from you breeds enthusiasm in the dog.',
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
  trainerNote: 'The recall cue must be "charged" with many more positive reps than you think before going outdoors. Ten indoor sessions is a minimum before attempting outdoor recall.',
  supportsLiveAiTrainer: true,
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
      tip: 'Ending on a success means the last memory the dog has of this session is a win. That positive association makes the next session start stronger.',
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
  trainerNote: 'True off-leash recall in an unfenced area takes 6–12 months of consistent work and is outside the scope of this plan. The long-line protocol here builds the foundation safely. Only practice off-leash in fully enclosed, secure areas.',
  supportsLiveAiTrainer: false,
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
      tip: 'Count silently: one Mississippi, two Mississippi, three — then mark. The pause teaches the dog that staying grounded is what earns the reward, not just briefly landing.',
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
  trainerNote: 'This protocol requires household-wide buy-in. The #1 reason it fails is one family member who "doesn\'t mind" the jumping. Address this directly with everyone in the home.',
  supportsLiveAiTrainer: true,
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
      tip: 'A sit that only works sometimes is not ready to be used as a greeting behavior. You need 9 out of 10 before moving on.',
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
      tip: 'Each increase in approach energy is a new challenge. If the dog fails, drop back one level of energy and rebuild from there.',
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
  trainerNote: 'The auto-sit is one of the most practical behaviors you can teach. A dog that automatically sits for greetings is a social superstar. Celebrate this with your guests — it makes training feel real.',
  supportsLiveAiTrainer: true,
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
      tip: 'New environment = start over at Step 1 difficulty. The behavior will generalize faster each time, but always begin with controlled, easy reps.',
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
  trainerNote: 'Real-world generalization requires dozens of rehearsed interactions. Consider carrying treats on every walk for 4 weeks and asking strangers to participate in greeting rehearsals. This effort compounds — the dog gets better every single repetition.',
  supportsLiveAiTrainer: true,
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
  trainerNote: 'Potty training is 90% management, 10% training. The most important tool is preventing accidents through supervision. Every accident that happens unsupervised is a practice of the wrong behavior. Your goal is zero indoor accidents for 4 consecutive weeks.',
  supportsLiveAiTrainer: false,
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
      instruction: 'After 5–7 days, stop initiating the trip yourself. Stand near the door and wait. If the dog approaches and rings the bell spontaneously, open the door immediately and go to the potty spot. Jackpot if they eliminate.',
      durationSeconds: null,
      reps: null,
      tip: 'Some dogs figure this out in days. Others take 2–3 weeks. Do not rush or prompt — the spontaneous ring is the breakthrough moment.',
      successLook: 'Dog approaches the door and rings the bell without being led there.'
    },
    {
      order: 4,
      instruction: 'Watch for bell-ringing that is NOT followed by elimination. Some dogs learn the bell = go outside and ring it for play. If the dog goes out and does not eliminate within 2 minutes, bring them straight back in. Only walks and play follow real elimination.',
      durationSeconds: null,
      reps: null,
      tip: 'This is the most common "abuse" of the bell system. Fixing it requires being consistent: no outdoor fun unless real potty happens first.',
      successLook: 'Dog rings bell only when they need to eliminate, not for recreational outings.'
    }
  ],
  successCriteria: 'Dog rings bell or signals at the door independently to request outdoor potty trip at least 4 out of 6 times across 3 days.',
  commonMistakes: [
    'Hanging the bell too high for the dog\'s nose to reach',
    'Rewarding the bell ring without following through with outdoor access every time',
    'Allowing play after bell rings without elimination — creates bell abuse',
    'Removing the bell before the behavior is truly reliable'
  ],
  equipmentNeeded: ['Dog training bell or jingle bell (hung at door)', 'High-value treats', 'Consistent potty spot outside'],
  ageMinMonths: 8,
  ageMaxMonths: 36,
  difficulty: 2,
  nextProtocolId: 'potty_s3',
  trainerNote: 'The bell is a tool, not a long-term fixture. Once the dog has a reliable signal, most owners find the bell unnecessary and the dog defaults to sitting at the door or making eye contact. The behavior transfers naturally.',
  supportsLiveAiTrainer: false,
}

const potty_stage3: Protocol = {
  id: 'potty_s3',
  behavior: 'potty_training',
  stage: 3,
  title: 'Independence & Accident-Free Living',
  objective: 'Achieve consistent accident-free living through graduated indoor freedom and strong environmental understanding.',
  durationMinutes: 5,
  repCount: 4,
  steps: [
    {
      order: 1,
      instruction: 'Expand indoor freedom gradually. Start with one small, fully supervised room with no rugs or carpets. After 2 accident-free weeks in that room, expand to the next room. Expand the dog\'s territory in stages — not all at once.',
      durationSeconds: null,
      reps: null,
      tip: 'The biggest mistake is giving too much freedom too soon after a winning streak. Earned freedom is kept freedom. Every accident sets you back 2 weeks.',
      successLook: 'Dog roams their allowed area without sniffing corners or circling — no pre-accident behaviors.'
    },
    {
      order: 2,
      instruction: 'Learn your dog\'s pre-elimination signals: circling, sniffing the floor intensely, suddenly leaving the room, or squatting suddenly. The moment you see any of these, say "outside!" cheerfully and immediately take them out.',
      durationSeconds: null,
      reps: null,
      tip: 'Every dog has a "tell." Once you know yours, you can interrupt before the accident happens. Catching the signal is a skill that takes observation.',
      successLook: 'Dog redirected to outside before any accident occurs.'
    },
    {
      order: 3,
      instruction: 'If an accident happens: do not react. No scolding, no rubbing nose in it. Quietly clean it up with an enzymatic cleaner to fully neutralize the scent. Tighten management — shrink freedom for 48 hours and go back to timed trips.',
      durationSeconds: null,
      reps: null,
      tip: 'Enzymatic cleaners are essential. Regular cleaners mask the smell to humans but not to the dog. The dog will return to spots that still smell like waste.',
      successLook: 'Accident cleaned properly, management tightened, no emotional reaction from handler.'
    },
    {
      order: 4,
      instruction: 'Introduce a verbal cue on command: say "go potty" when you take the dog to the spot. Over 4 weeks, this becomes reliable enough that you can ask the dog to eliminate before car trips, bedtime, or going to a new environment.',
      durationSeconds: null,
      reps: 4,
      tip: 'On-command elimination is one of the most underrated skills you can teach. It becomes essential for travel, vet visits, and any time you need to ensure the dog is empty.',
      successLook: 'Dog eliminates within 2 minutes of arriving at the potty spot when cued.'
    }
  ],
  successCriteria: 'Dog has zero accidents for 4 consecutive weeks with graduated indoor freedom and signals reliably to go out.',
  commonMistakes: [
    'Treating accidents as moral failures rather than management errors',
    'Using non-enzymatic cleaners that leave scent markers for the dog',
    'Expanding indoor freedom too quickly after a clean streak',
    'Stopping the reward system before the behavior is truly automatic — keep rewarding outdoor elimination for at least 3 months'
  ],
  equipmentNeeded: ['Enzymatic cleaner', 'Treat pouch with high-value treats', 'Baby gates for room management'],
  ageMinMonths: 8,
  ageMaxMonths: 36,
  difficulty: 2,
  nextProtocolId: null,
  trainerNote: 'Full potty reliability typically takes 3–6 months, not 3 weeks. Dogs that appear trained can regress with changes in schedule, environment, or stress. If regression occurs at any point, go back to Stage 1 management for one week. The foundation is always there — you are just reinforcing it.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// CRATE TRAINING
// ─────────────────────────────────────────────────────────────────────────────

const crate_stage1: Protocol = {
  id: 'crate_s1',
  behavior: 'crate_anxiety',
  stage: 1,
  title: 'Crate Introduction & Positive Association',
  objective: 'Build a strong positive association with the crate so the dog enters and rests inside voluntarily, without anxiety or resistance.',
  durationMinutes: 10,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Place the crate in the main living area with the door removed or propped open. Put a worn T-shirt inside and a few scattered kibble pieces. Let the dog investigate freely. Do not push them in or lure them inside yet.',
      durationSeconds: null,
      reps: null,
      tip: 'Initial exposure should be entirely on the dog\'s terms. Pressure at this stage creates avoidance that takes weeks to undo.',
      successLook: 'Dog sniffs the crate entrance, possibly steps one paw inside to get kibble.'
    },
    {
      order: 2,
      instruction: 'Over 5 sessions, toss high-value treats just inside the entrance, then progressively further in — 6 inches, 12 inches, all the way to the back wall. Never push. Let the dog choose to go in to get the treat.',
      durationSeconds: null,
      reps: 10,
      tip: 'If the dog will not go further than the entrance, that is okay. Meet them where they are and work gradually. Forcing it now costs you weeks later.',
      successLook: 'Dog walks fully into the crate, collects the treat, and walks back out calmly.'
    },
    {
      order: 3,
      instruction: 'Begin feeding all meals inside the crate. Place the food bowl just inside the entrance for days 1–3, then at the back of the crate from day 4 onward. Do not close the door during meals yet.',
      durationSeconds: null,
      reps: null,
      tip: 'Meals are the most powerful daily association-builder. Every meal inside the crate is a crate-positive rep with zero effort from you.',
      successLook: 'Dog walks confidently into the crate for meals without hesitation.'
    },
    {
      order: 4,
      instruction: 'Once the dog enters willingly for meals, begin briefly closing the door for 10 seconds while they eat, then open it. Extend to 30 seconds, 1 minute. Stay in the room. Do not leave yet.',
      durationSeconds: 60,
      reps: null,
      tip: 'The door closure must be anticlimactic. No big production when you close it or open it. Mundane is the goal.',
      successLook: 'Dog continues eating calmly with door closed, no scratching or whining.'
    }
  ],
  successCriteria: 'Dog enters crate voluntarily 8 out of 10 times when a treat is tossed inside. Eats full meal with door closed for 2 minutes without stress signals.',
  commonMistakes: [
    'Moving too fast — each step should be practiced for 2–3 days minimum',
    'Using the crate as punishment — the crate must always be a good place',
    'Letting the dog out when they whine — teaches whining opens the door',
    'Crating for too long before the association is solid'
  ],
  equipmentNeeded: ['Appropriately sized crate (dog can stand, turn, lie down)', 'High-value treats', 'Worn T-shirt or familiar scent item', 'Food bowl'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'crate_s2',
  trainerNote: 'The crate is not a cage — it is a den. Dogs are naturally den animals. The goal is a dog that puts themselves to bed in the crate voluntarily. That is achievable with patience, but it cannot be rushed. Allow at least 1–2 weeks at this stage before any door-closed sessions longer than 5 minutes.',
  supportsLiveAiTrainer: false,
}

const crate_stage2: Protocol = {
  id: 'crate_s2',
  behavior: 'crate_anxiety',
  stage: 2,
  title: 'Building Duration with Door Closed',
  objective: 'Extend crate time to 30–60 minutes with the handler present, and introduce brief departures from the room.',
  durationMinutes: 12,
  repCount: 6,
  steps: [
    {
      order: 1,
      instruction: 'Give the dog a frozen KONG or long-lasting chew inside the crate. Close and latch the door. Sit in the same room, reading or on your phone. Ignore the crate entirely. When the dog finishes the chew, wait 2 more minutes, then quietly let them out.',
      durationSeconds: 600,
      reps: null,
      tip: 'The KONG is doing the work for you. Loading it with peanut butter and freezing it overnight extends the session naturally.',
      successLook: 'Dog works on the KONG contentedly, eventually settles with it between their paws.'
    },
    {
      order: 2,
      instruction: 'Once the dog is settled in the crate with you in the room, stand up and walk to the doorway of the room — just the threshold. Pause 10 seconds. Return to your seat. Do not make eye contact with the dog. Repeat 5 times.',
      durationSeconds: null,
      reps: 5,
      tip: 'You are desensitizing your movement as a trigger. Dogs often track handler movement and begin to anticipate departure. Keep your movements mundane.',
      successLook: 'Dog remains lying down when you move toward the doorway.'
    },
    {
      order: 3,
      instruction: 'Walk out of the room for 30 seconds. Return calmly before any stress response occurs. Extend: 1 minute, 2 minutes, 5 minutes. Always return before the dog shows distress (whining, pawing). If they distress, you have moved too fast.',
      durationSeconds: 300,
      reps: null,
      tip: 'The rule is simple: always come back before the dog panics. You are building a history of "they always come back." One bad experience at this stage can set back weeks of progress.',
      successLook: 'Dog hears your return, lifts head, then settles back down — no frantic greeting.'
    },
    {
      order: 4,
      instruction: 'Practice "crate, then calm exit." When time is up, open the crate door but wait for the dog to be calm before greeting them. If they burst out and jump, simply hold the door open and wait for a settled posture before any affection.',
      durationSeconds: null,
      reps: 3,
      tip: 'Calm exits matter as much as calm entries. A hysterical exit teaches the dog that crate time creates high arousal.',
      successLook: 'Dog steps out calmly, receives a low-key greeting, does not race around the room.'
    }
  ],
  successCriteria: 'Dog settles in crate for 30 minutes with handler absent, with no distress signals (whining, digging, panting, drooling), 4 out of 6 sessions.',
  commonMistakes: [
    'Returning when the dog is whining — only return during quiet moments',
    'Skipping the in-room phase and jumping to departures — the graduated approach matters',
    'Giving overly excited greetings when returning — this elevates crate departure into an event',
    'Crating when the dog is still at high energy — exercise first, then crate'
  ],
  equipmentNeeded: ['Crate', 'Frozen KONG or bully stick', 'Timer'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'crate_s3',
  trainerNote: 'Dogs should be exercised before crating. A tired dog crates easily. A bored, under-stimulated dog has nothing to do but stress. This is not negotiable — a 20-minute walk before a 4-hour crating is a fundamentally different experience than crating a dog who just woke up.',
  supportsLiveAiTrainer: false,
}

const crate_stage3: Protocol = {
  id: 'crate_s3',
  behavior: 'crate_anxiety',
  stage: 3,
  title: 'Extended Alone Time & Independence',
  objective: 'Build tolerance for 3–4 hour crating with handler fully absent, and establish the crate as the dog\'s preferred resting space.',
  durationMinutes: 10,
  repCount: 5,
  steps: [
    {
      order: 1,
      instruction: 'Establish a pre-crate ritual: 20 minutes of exercise, then a specific verbal cue ("crate up" or "bedtime"), a KONG placed inside, and the dog enters. The ritual signals what is coming and reduces anticipatory anxiety.',
      durationSeconds: null,
      reps: null,
      tip: 'Predictability is calming. Dogs that know exactly what to expect develop far less anxiety than dogs who are randomly crated.',
      successLook: 'Dog hears the cue word and walks toward the crate without being prompted.'
    },
    {
      order: 2,
      instruction: 'Begin using a white noise machine or calming music near the crate. Leave a worn item with your scent. Gradually extend alone time: 30 min → 1 hr → 90 min → 2 hrs → 3 hrs over 2–3 weeks. Never jump more than one level per day.',
      durationSeconds: null,
      reps: null,
      tip: 'White noise masks external sounds that can trigger anxiety — footsteps in hallways, outdoor noises, other animals.',
      successLook: 'Dog is asleep or resting calmly on camera review after handler leaves.'
    },
    {
      order: 3,
      instruction: 'Set up a phone camera (or pet camera) to observe the dog during alone time. Review footage. Look for: panting, drooling, pawing, vocalizing after the first 5 minutes. Any of these means the duration was too long — reduce by 50% next session.',
      durationSeconds: null,
      reps: null,
      tip: 'What you cannot see is happening. Many owners believe their dog is fine because the dog is quiet when they return — but quiet at return does not mean calm the whole time.',
      successLook: 'Dog visible on camera resting, sleeping, or chewing calmly for the majority of the session.'
    },
    {
      order: 4,
      instruction: 'Leave the crate door open during evenings when you are home. Do not force the dog in. Many dogs will begin resting inside on their own once the crate is associated with calm and comfort. This is the goal state.',
      durationSeconds: null,
      reps: null,
      tip: 'A dog that voluntarily rests in their open crate is a dog who finds it genuinely comfortable — not a dog who tolerates confinement. That distinction matters for long-term wellbeing.',
      successLook: 'Dog chooses to enter and rest in crate on their own without any prompting.'
    },
    {
      order: 5,
      instruction: 'Practice "surprise crating" once a week: randomly ask the dog to crate for 30 minutes in the middle of the day, give a KONG, return. This maintains the skill even when the dog is not being crated regularly.',
      durationSeconds: 1800,
      reps: null,
      tip: 'Skills that are not maintained fade. Even a dog with a solid crate history can regress after a few weeks of no crating. Monthly practice keeps the behavior intact.',
      successLook: 'Dog enters on cue during a random mid-day session with no resistance.'
    }
  ],
  successCriteria: 'Dog rests calmly in crate for 3 hours with handler absent, no distress signals on camera review, 4 out of 5 sessions.',
  commonMistakes: [
    'Skipping camera review — you cannot know your dog is calm without observing them',
    'Not exercising the dog before long crating sessions',
    'Crating for more than 4 hours for an adult dog or more than 2 hours for a puppy',
    'Abandoning the crate entirely once the dog sleeps through the night — maintain the skill'
  ],
  equipmentNeeded: ['Crate with familiar bedding', 'Pet camera or phone camera', 'Frozen KONG', 'White noise machine (optional)', 'Calming music (optional)'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'The maximum recommended crating time for an adult dog is 4–5 hours during waking hours. Dogs have real physical and psychological needs that crating does not meet. A dog that can handle 4 hours is well-trained; a dog crated for 9 hours is being managed, not cared for. This distinction is important.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// PUPPY BITING
// ─────────────────────────────────────────────────────────────────────────────

const biting_stage1: Protocol = {
  id: 'biting_s1',
  behavior: 'puppy_biting',
  stage: 1,
  title: 'Bite Inhibition: Pressure Sensitivity Training',
  objective: 'Teach the puppy that human skin is extremely sensitive — that even moderate pressure causes interaction to stop immediately.',
  durationMinutes: 8,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Allow gentle mouthing during play. The moment the puppy applies pressure that would be uncomfortable (you decide the threshold — start with moderate, tighten over time), say "ouch!" in a sharp, surprised tone and immediately go limp and freeze for 3 seconds.',
      durationSeconds: 3,
      reps: null,
      tip: 'The "ouch" should startle, not terrify. Think of how another puppy would yelp — sharp and brief, not screaming. This mimics natural puppy communication.',
      successLook: 'Puppy pauses their mouthing and pulls back slightly at the sound.'
    },
    {
      order: 2,
      instruction: 'After 3 seconds of being frozen, resume play normally. If the puppy bites hard again immediately, repeat the "ouch" and freeze. After 3 hard bites in one session, end all play for 30 seconds by standing up and turning away.',
      durationSeconds: 30,
      reps: null,
      tip: 'The time-out is not punishment — it is information. The puppy is learning: hard biting = play ends. You are giving data, not correction.',
      successLook: 'Puppy softens the pressure of their mouthing over the session, not harder bites.'
    },
    {
      order: 3,
      instruction: 'Redirect immediately after any bite interruption: present a toy and wiggle it invitingly. Say "get the toy!" When the puppy bites the toy instead of skin, mark "yes!" and engage enthusiastically in tug or chase.',
      durationSeconds: null,
      reps: 10,
      tip: 'Redirection must be more exciting than skin. A limp, uninteresting toy teaches nothing. Wiggle it, toss it, make it prey.',
      successLook: 'Puppy transfers bite from your hand to the toy willingly.'
    },
    {
      order: 4,
      instruction: 'Practice "hand as signal, not prey": hold your open hand near the puppy. Reward any gentle sniff or lick with a treat from the other hand. Build the association that an open, still hand = good things happen, not a target.',
      durationSeconds: null,
      reps: 5,
      tip: 'Many puppies have learned that hands are the most interesting toys in the house. This exercise resets that association to "calm hands = treats."',
      successLook: 'Puppy sniffs or licks an outstretched hand gently, looking for the reward.'
    }
  ],
  successCriteria: 'Puppy reduces bite pressure to "soft mouthing only" in 12 out of 15 interactions. Hard bites trigger self-interruption or redirect to toy.',
  commonMistakes: [
    'Yelling loudly or pulling your hand away fast — both excite the puppy further',
    'Inconsistency — if one person allows hard biting, the puppy cannot generalize the rule',
    'Not redirecting quickly enough — the toy must appear within 2 seconds of the "ouch"',
    'Ending all interaction too aggressively — the puppy needs play, not suppression'
  ],
  equipmentNeeded: ['Tug toy or rope toy (kept in hand during play)', 'High-value treats'],
  ageMinMonths: 8,
  ageMaxMonths: 18,
  difficulty: 1,
  nextProtocolId: 'biting_s2',
  trainerNote: 'Bite inhibition is the most important thing a puppy learns before 18 weeks. A puppy that bites hard but has learned inhibition is far less dangerous than a dog with a hard bite and no threshold. The goal is not zero mouthing — it is zero hard biting. Gentle mouthing during development is normal and should be allowed while pressure training is happening.',
  supportsLiveAiTrainer: true,
}

const biting_stage2: Protocol = {
  id: 'biting_s2',
  behavior: 'puppy_biting',
  stage: 2,
  title: 'Zero Skin Contact Rule',
  objective: 'Eliminate all mouthing on skin and transfer all bite energy to appropriate toys and outlets.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Raise the threshold from "no hard biting" to "no teeth on skin at all." Any tooth contact with skin — even gentle — results in immediate play pause. Freeze for 5 seconds. Do not say "ouch" anymore — silent freeze signals no engagement.',
      durationSeconds: 5,
      reps: null,
      tip: 'You have already taught pressure sensitivity. Now you are removing ALL skin contact as the standard. The shift from "no hard biting" to "no teeth on skin" is the most important transition in the protocol.',
      successLook: 'Puppy notices the freeze and pauses, does not continue mouthing.'
    },
    {
      order: 2,
      instruction: 'Proactively offer a toy before play begins every time. Hold the toy out and let the puppy grab it before you touch them. Make all physical interaction happen through the toy — tug, chase, fetch. This reduces skin contact opportunities.',
      durationSeconds: null,
      reps: null,
      tip: 'Having the toy already in play eliminates the moment when the puppy defaults to skin. You are managing the environment to set the puppy up for success.',
      successLook: 'Puppy grabs the toy first instead of hands when play starts.'
    },
    {
      order: 3,
      instruction: 'Teach a "calm hands" exercise: sit on the floor, hands in your lap. Puppy will sniff and investigate. Any calm sniff or lick earns a treat. Any mouthing = you stand up and turn away for 30 seconds. After 10 reps, most puppies stop mouthing and start offering eye contact instead.',
      durationSeconds: 30,
      reps: 10,
      tip: 'This exercise teaches the puppy that calm behavior around human hands is the most rewarding option. It is the alternative behavior you are building.',
      successLook: 'Puppy sniffs hands without using teeth, offers eye contact, receives treat.'
    },
    {
      order: 4,
      instruction: 'Practice handling exercises: gently hold the puppy\'s collar, touch their paws, look in their ears. Treat continuously during all handling. This builds the association that physical touch from humans = good things, and teaches the puppy to accept contact without resisting or biting.',
      durationSeconds: null,
      reps: 5,
      tip: 'Handling builds cooperative care behavior. A puppy that accepts collar grabs and ear checks becomes a dog that tolerates vet exams.',
      successLook: 'Puppy holds still during brief ear, paw, and collar handling while eating treats.'
    }
  ],
  successCriteria: 'Puppy initiates zero tooth-on-skin contact in 12 out of 15 play interactions. Redirects to toy within 3 seconds of any reminder.',
  commonMistakes: [
    'Inconsistent standard — some days allowing mouthing and others not',
    'Not having a toy ready every time play starts',
    'Using hands to roughhouse even briefly — any hand-as-toy moment undermines the protocol',
    'Not practicing calm handling separately from play'
  ],
  equipmentNeeded: ['Multiple toys (tug, rope, squeaky) stationed around the home', 'Treat pouch', 'Leash for management if needed'],
  ageMinMonths: 8,
  ageMaxMonths: 18,
  difficulty: 2,
  nextProtocolId: 'biting_s3',
  trainerNote: 'By this stage, the puppy\'s adult teeth are coming in and bite pressure will increase significantly. Puppies in the 4–6 month teething window need MORE appropriate chewing, not less. Increase the supply of frozen KONGs, bully sticks, and appropriate chews alongside this protocol.',
  supportsLiveAiTrainer: true,
}

const biting_stage3: Protocol = {
  id: 'biting_s3',
  behavior: 'puppy_biting',
  stage: 3,
  title: 'Impulse Control Around Hands & Strangers',
  objective: 'Generalize the no-bite rule to all humans, including strangers and children, and in all environments.',
  durationMinutes: 10,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Practice "treat delivery tolerance": hold a treat in your closed fist. Present it to the puppy. The moment they stop pawing or mouthing and back off or sit, open your fist and deliver. This teaches the puppy that pressure never works — patience does.',
      durationSeconds: null,
      reps: 10,
      tip: 'Keep the fist completely still. If the puppy bites hard, let it be uncomfortable for them without moving. Any movement from you signals the biting is working.',
      successLook: 'Puppy backs away from the fist and offers a sit or eye contact. Fist opens.'
    },
    {
      order: 2,
      instruction: 'Invite a friend or family member who the puppy does not know well to practice calm interaction. Brief them: "Offer your closed fist for the puppy to sniff. If they mouth or jump, freeze and cross your arms. If they sit or are calm, open your hand and give this treat." Give them 5 treats.',
      durationSeconds: null,
      reps: 5,
      tip: 'The puppy must generalize that the no-bite rule applies to ALL humans, not just you. Three stranger-interaction sessions are worth more than thirty owner-only sessions.',
      successLook: 'Puppy greets the helper with sniffing and calm interest, no mouthing or jumping.'
    },
    {
      order: 3,
      instruction: 'Practice in at least two different environments: the backyard, a friend\'s home, a pet-friendly store. New environments often cause a regression in bite inhibition due to elevated arousal. Start with lower-energy interactions in new places.',
      durationSeconds: null,
      reps: null,
      tip: 'Any behavior that is not practiced in multiple contexts only "works" in the original context. A dog that behaves at home but bites strangers is a liability.',
      successLook: 'Puppy maintains calm mouth in at least one novel environment after 2–3 sessions.'
    },
    {
      order: 4,
      instruction: 'If children will be in the household: practice "statue" — teach the puppy that children who stand still like a statue receive zero attention from the dog, and children who offer a fist to sniff and then treat earn the most interaction. Supervise all child–dog interaction at this age.',
      durationSeconds: null,
      reps: null,
      tip: 'Children are the highest-risk population for dog bites. Invest in supervised rehearsal before any unsupervised interaction. No exceptions.',
      successLook: 'Puppy approaches a still child calmly, sniffs, does not jump or mouth.'
    }
  ],
  successCriteria: 'Puppy greets unfamiliar people with zero tooth contact in 8 out of 10 encounters. Maintains calm mouth in at least 2 different environments.',
  commonMistakes: [
    'Practicing only with the owner — generalization to strangers is the critical last step',
    'Not managing the environment when visitors arrive — always have a leash on the puppy during greetings until reliable',
    'Allowing children to interact without supervision during this stage',
    'Assuming the behavior is complete before practicing in novel environments'
  ],
  equipmentNeeded: ['Treats for helper to carry', 'Leash for management during greetings', 'Toys in multiple rooms for redirection'],
  ageMinMonths: 8,
  ageMaxMonths: 18,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'A puppy that reaches 6 months with solid bite inhibition and zero skin contact is set up for life. These months are a critical window. The dog that bites during play at 10 weeks and is never corrected is the dog that sends someone to the ER at 18 months. Take this seriously.',
  supportsLiveAiTrainer: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTLING / PLACE
// ─────────────────────────────────────────────────────────────────────────────

const settle_stage1: Protocol = {
  id: 'settle_s1',
  behavior: 'settling',
  stage: 1,
  title: 'Mat Introduction & Reward Zone',
  objective: 'Build a strong positive association with a designated mat so the dog goes to it voluntarily and offers a down position.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Place a mat or dog bed in the main living area. Walk toward the mat with your dog nearby. The moment the dog puts any paw on the mat — even accidentally — say "yes!" and toss 3 treats onto the mat. Let the dog eat them on the mat.',
      durationSeconds: null,
      reps: null,
      tip: 'Do not lure the dog onto the mat. Luring teaches the dog to follow your hand, not to offer the behavior independently. Wait for natural mat contact.',
      successLook: 'Dog steps on the mat, hears the mark, and eats the treats while standing on it.'
    },
    {
      order: 2,
      instruction: 'Move 3 steps away from the mat. Wait. When the dog returns to the mat and makes any contact, immediately say "yes!" and scatter 3 treats on the mat surface. Do 10 reps. The dog should start offering mat contact to earn the click.',
      durationSeconds: null,
      reps: 10,
      tip: 'The dog will eventually start offering the mat voluntarily — stepping on it and looking at you. That moment of deliberate choice is worth a jackpot of 5 treats.',
      successLook: 'Dog walks to the mat independently and looks at you from on it.'
    },
    {
      order: 3,
      instruction: 'Once the dog is reliably stepping on the mat for the mark, raise criteria: wait for a down position before marking. If needed, drop a treat between the front paws on the mat to lure the elbows down. Mark the instant elbows hit the mat.',
      durationSeconds: null,
      reps: null,
      tip: 'Only use the treat lure for elbows-down 2–3 times maximum. After that, wait for the dog to offer it independently. Lure dependency kills the spontaneous behavior.',
      successLook: 'Dog walks to mat and lies down without being asked.'
    },
    {
      order: 4,
      instruction: 'Add the verbal cue "place" or "settle" just as the dog is beginning to walk toward the mat. Say it once, quietly. Over 10 reps, the word becomes predictive of the behavior and will eventually trigger it.',
      durationSeconds: null,
      reps: 5,
      tip: 'The cue is added after the behavior exists, not before. Adding a cue too early means you are labeling confusion, not behavior.',
      successLook: 'Dog begins walking toward the mat when they hear "place," before reaching it.'
    }
  ],
  successCriteria: 'Dog goes to mat and lies down on verbal cue 12 out of 15 reps in a low-distraction room.',
  commonMistakes: [
    'Luring the dog onto the mat repeatedly — this prevents independent choice',
    'Adding the cue word too early before the behavior is fluent',
    'Using a mat that is too small or uncomfortable — the dog must find it genuinely pleasant to lie on',
    'Practicing in too many locations before the behavior is solid in one'
  ],
  equipmentNeeded: ['Dog mat or orthopedic bed (consistent, portable)', 'High-value treats', 'Treat pouch'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'settle_s2',
  trainerNote: 'The mat is one of the most versatile tools in dog training. Everything else you teach your dog can be anchored to the mat. Once solid, it becomes a calming station, a boundary during mealtimes, and a "reset" button when the dog is overstimulated.',
  supportsLiveAiTrainer: true,
}

const settle_stage2: Protocol = {
  id: 'settle_s2',
  behavior: 'settling',
  stage: 2,
  title: 'Duration & Mild Distraction on Mat',
  objective: 'Build the dog\'s ability to remain on the mat for 5 minutes with mild household distractions present.',
  durationMinutes: 10,
  repCount: 8,
  steps: [
    {
      order: 1,
      instruction: 'Cue "place." Once the dog is lying down on the mat, begin treating every 15 seconds for the first 2 minutes. Then stretch to every 30 seconds. Deliver treats to the mat — go to the dog, do not call them to you.',
      durationSeconds: 120,
      reps: 3,
      tip: 'Going to the dog to deliver the treat is critical. If you call them off to treat, you are teaching them to leave the mat for rewards.',
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
      tip: 'Always release the dog from the settle with a clear verbal cue — "free!" or "okay" — so they understand the duration has an official end point.',
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
  trainerNote: 'The settle cue is naturally self-reinforcing once the dog understands it — a settled dog gets ignored, which is exactly what many dogs want. Over time the treat schedule can fade dramatically for many dogs once the habit is established.',
  supportsLiveAiTrainer: true,
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
      tip: 'Bring the same mat the dog has been trained on. The familiar scent and texture help the dog generalize the cue in a new environment.',
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
  trainerNote: 'A dog that can place on cue from another room and hold for 10+ minutes is genuinely life-changing for most owners. It allows you to have guests, dinner parties, work calls, and veterinary visits without constant management. This is one of the highest-ROI behaviors in this entire program.',
  supportsLiveAiTrainer: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE IT / DROP IT
// ─────────────────────────────────────────────────────────────────────────────

const leave_it_stage1: Protocol = {
  id: 'leave_it_s1',
  behavior: 'leave_it',
  stage: 1,
  title: 'Hand Leave It',
  objective: 'Teach the dog that ignoring food or objects in your closed hand earns them something even better — building the foundation of impulse control.',
  durationMinutes: 8,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Place a low-value treat (kibble) in your closed fist. Present your fist to the dog at nose height. The dog will likely sniff, lick, or paw at your hand. Say nothing. Do not open your fist.',
      durationSeconds: null,
      reps: null,
      tip: 'Your fist must stay completely closed no matter what the dog does. Movement, pawing, even hard biting — your fist does not open. The dog must learn that effort against your fist yields nothing.',
      successLook: 'Dog sniffs the fist, then backs their nose away from it.'
    },
    {
      order: 2,
      instruction: 'The instant the dog backs away from your fist — even slightly — say "yes!" and immediately open your other hand to deliver a HIGH-value treat (chicken, cheese). The kibble in the fist is never given. The better treat comes from elsewhere.',
      durationSeconds: null,
      reps: 10,
      tip: 'The kibble in the fist is bait, not reward. Always reward from the opposite hand with a better treat. This teaches "leave the inferior thing, get the superior thing."',
      successLook: 'Dog pulls back from the fist, receives a jackpot from the opposite hand.'
    },
    {
      order: 3,
      instruction: 'Once the dog backs off your fist within 2 seconds for 5 consecutive reps, add the cue "leave it" just as you present the fist. Say it once, quietly. Mark and reward the backing-off as before.',
      durationSeconds: null,
      reps: 10,
      tip: 'The cue is added once the behavior is reliable. If you add it too early, "leave it" becomes associated with sniffing and trying, not with backing off.',
      successLook: 'Dog hears "leave it," glances at the fist, and looks back to you immediately.'
    },
    {
      order: 4,
      instruction: 'Open your fist flat with the treat visible on your palm. Say "leave it." The moment the dog pulls back from the open palm, say "yes!" and deliver the better treat from your other hand. This is significantly harder — go slowly.',
      durationSeconds: null,
      reps: 5,
      tip: 'If the dog eats the treat off your palm, close your hand, reset, and try again. No correction — just try again. The dog is learning, not disobeying.',
      successLook: 'Dog looks at the treat on the open palm, then looks away from it toward you.'
    }
  ],
  successCriteria: 'Dog backs away from a treat on an open palm within 2 seconds of "leave it" cue, 15 out of 20 reps.',
  commonMistakes: [
    'Moving the fist away when the dog touches it — this rewards persistence',
    'Giving the treat FROM the fist as a reward — the reward must always come from the opposite hand',
    'Adding the cue before the backing-off behavior is reliable',
    'Practicing with food the dog finds extremely high-value before the basic version is solid'
  ],
  equipmentNeeded: ['Low-value treats (kibble) for the "bait" fist', 'High-value treats (chicken, cheese) for reward hand', 'Treat pouch'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'leave_it_s2',
  trainerNote: 'Leave it is a safety behavior, not just a manners behavior. A dog with a reliable leave it can be directed away from chicken bones on the sidewalk, medications dropped on the floor, or aggressive interactions. Build this behavior like your dog\'s life depends on it — because occasionally, it will.',
  supportsLiveAiTrainer: false,
}

const leave_it_stage2: Protocol = {
  id: 'leave_it_s2',
  behavior: 'leave_it',
  stage: 2,
  title: 'Floor Leave It & Drop It',
  objective: 'Transfer leave it to items on the floor, and teach the drop it cue for releasing objects already in the dog\'s mouth.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Place a kibble treat on the floor and cover it with your foot. Say "leave it." The dog will sniff and paw around your foot. The moment they back off — look away or take a step back — say "yes!" and deliver a high-value treat from your hand. Repeat 8 times.',
      durationSeconds: null,
      reps: 8,
      tip: 'Your foot is the barrier, not a lure. Do not wave treats. Stand still and wait for disengagement.',
      successLook: 'Dog sniffs around your foot, then backs away or sits, eyes moving to your face.'
    },
    {
      order: 2,
      instruction: 'Remove your foot. Place the kibble on the floor uncovered. Say "leave it" and stand 1 foot away. If the dog goes for it, quickly cover it with your foot. If they leave it for 3 seconds, say "yes!" and reward from your hand. Never let them eat the kibble on the floor.',
      durationSeconds: null,
      reps: 7,
      tip: 'Speed matters here. You must be faster than the dog at covering the treat. If you can\'t cover it in time, you weren\'t ready. Use slower, easier treats to start.',
      successLook: 'Dog glances at the floor treat, then looks up at you without going for it.'
    },
    {
      order: 3,
      instruction: 'Teach "drop it" separately from leave it. Offer a toy and let the dog grab it. Then hold a high-value treat directly under their nose — close enough to smell. The moment their jaw opens to sniff the treat and the toy drops, say "yes, drop it!" and deliver the treat. Give the toy back.',
      durationSeconds: null,
      reps: 5,
      tip: 'Always give the toy back after drop it. A dog that learns "drop it = toy disappears" will refuse to drop anything. Keep the exchange positive and immediately return the item.',
      successLook: 'Dog opens mouth and releases the toy when the treat is presented nearby.'
    },
    {
      order: 4,
      instruction: 'Once drop it is reliable with a toy, practice with items they are more possessive of: a bully stick, a food-stuffed KONG. Offer the treat-under-nose exchange. If they do not drop, do not yank — simply wait with the treat millimeters from their nose. Patience wins.',
      durationSeconds: null,
      reps: 3,
      tip: 'Never use drop it and then take the item without returning it during training. Build a perfect trade history first. Only in real emergencies should you take without returning.',
      successLook: 'Dog releases the high-value chew when the trade treat is offered.'
    }
  ],
  successCriteria: 'Dog leaves an uncovered treat on the floor for 5 seconds on cue, 10 out of 15 reps. Dog drops a toy on "drop it" cue, 8 out of 10 reps.',
  commonMistakes: [
    'Allowing the dog to "win" the floor treat even once — consistency is absolute',
    'Taking items without offering a trade — teaches the dog to resource guard',
    'Adding the verbal cue before the behavior is reliable',
    'Only practicing with low-value items — generalize across different objects progressively'
  ],
  equipmentNeeded: ['Kibble for floor leave it', 'High-value treat for rewards and trades', 'Toy (tug or rope)', 'Long bully stick or KONG (for advanced reps)'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'leave_it_s3',
  trainerNote: 'Drop it and leave it are complementary behaviors but mechanically distinct: leave it means "don\'t touch that," drop it means "release what you have." Many owners confuse them. Keep them separate in training until both are solid, then they can be used in sequence.',
  supportsLiveAiTrainer: false,
}

const leave_it_stage3: Protocol = {
  id: 'leave_it_s3',
  behavior: 'leave_it',
  stage: 3,
  title: 'Real-World Leave It: Sidewalk, Food & Animals',
  objective: 'Proof leave it in high-distraction real-world contexts: dropped food, dead animals, food wrappers on the sidewalk, and small animals.',
  durationMinutes: 12,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'On leash in the yard or a quiet outdoor space, drop a piece of kibble on the ground in front of you. Walk toward it with your dog on leash. Say "leave it" before the dog reaches it. The moment they divert their gaze or slow, say "yes!" and reward from your treat pouch.',
      durationSeconds: null,
      reps: 5,
      tip: 'Cue "leave it" 2–3 steps before the dog reaches the food — not when they are already eating it. Timing before contact teaches self-control. Timing after is damage control.',
      successLook: 'Dog notices the food on the ground, hears "leave it," and looks to you instead.'
    },
    {
      order: 2,
      instruction: 'Practice the "walk-past" version: leave food on the ground and walk past it on leash without cueing. If the dog ignores it naturally, jackpot. If they go for it, say "leave it" once and keep walking. The leash continues the walk — forward movement is the consequence of leaving it.',
      durationSeconds: null,
      reps: 5,
      tip: 'Eventually the dog should leave ground food without any cue — just walking on. That proofed silence is the goal. The cue is a backup.',
      successLook: 'Dog walks past ground food without stopping, checking in with handler.'
    },
    {
      order: 3,
      instruction: 'Set up a high-value challenge: drop a piece of chicken (high-value, extra-tempting) on the floor indoors. Say "leave it." Have your best treat hidden behind your back. Reward with the hidden treat if the dog holds for 3 seconds. Do 3 reps maximum in one session.',
      durationSeconds: null,
      reps: 3,
      tip: 'High-value leave it requires extra-high-value rewards. The reward must be clearly better than what they left. If you are rewarding with kibble and the floor has chicken, you will fail.',
      successLook: 'Dog looks at the chicken, holds for 3 seconds without going for it, receives jackpot.'
    },
    {
      order: 4,
      instruction: 'Practice near movement-based triggers: a squirrel in the yard, a cat across the street, a bird on the sidewalk. At threshold distance, say "leave it" and redirect the dog\'s attention to you with a treat held at your face. Mark "yes!" when the dog looks at you instead.',
      durationSeconds: null,
      reps: 3,
      tip: 'Threshold distance for a prey-driven dog near a squirrel may be 30+ feet. Start at the distance where the dog can actually hear and respond to you, not where instinct takes over.',
      successLook: 'Dog notices the animal, hears "leave it," looks at you and stays oriented to handler.'
    }
  ],
  successCriteria: 'Dog leaves food on the ground on "leave it" cue in 8 out of 10 outdoor trials. Redirects attention from a moving animal trigger at distance in 6 out of 10 attempts.',
  commonMistakes: [
    'Practicing only indoors — outdoor leave it is a completely different skill in terms of difficulty',
    'Using the cue as a scolding tone — "leave it" must stay neutral or happy, never angry',
    'Not rewarding leave it with a high enough value treat to compete with the distraction',
    'Attempting leave it on a squirrel without building through food first — skip levels and you build nothing'
  ],
  equipmentNeeded: ['Treat pouch with high-value rewards', '6-foot leash', 'Kibble or chicken for planting on ground', 'Open outdoor space with some distractions'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'A leave it that holds in a park with squirrels present is a 6–12 month project, not a 6-session project. Do not rush to real-world distractions. Build the behavior until it is a reflex indoors, then gradually introduce the real world. Every failure in the real world takes 5 successful reps to undo.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// BASIC OBEDIENCE (SIT / DOWN / STAY)
// ─────────────────────────────────────────────────────────────────────────────

const obedience_stage1: Protocol = {
  id: 'obedience_s1',
  behavior: 'basic_obedience',
  stage: 1,
  title: 'Sit & Down on Cue',
  objective: 'Build reliable sit and down behaviors on verbal cue in low-distraction environments, with the dog responding within 2 seconds.',
  durationMinutes: 8,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Teach sit with a lure: hold a treat at the dog\'s nose. Slowly move your hand up and back over their head. As their nose follows the treat upward, their rear naturally drops. The instant their bottom touches the floor, say "yes!" and deliver the treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'The lure should be at nose height, not above the head. Too high and they jump. Too far back and they walk backward.',
      successLook: 'Dog follows the treat lure into a clean sit without jumping or backing up.'
    },
    {
      order: 2,
      instruction: 'After 5 lure reps, begin fading the lure: use the same hand motion but with no treat in that hand. Mark "yes!" the moment they sit, then deliver a treat from your other hand or treat pouch. Repeat 10 times.',
      durationSeconds: null,
      reps: 10,
      tip: 'Fading the lure is the most important step. A dog that only sits when food is visible in your hand has not learned to sit — they have learned to follow food.',
      successLook: 'Dog sits in response to the hand motion with no visible treat in the hand.'
    },
    {
      order: 3,
      instruction: 'Add the verbal cue "sit" just before the hand signal. Say it once, calmly. Over 10 reps, fade the hand signal until the dog responds to the word alone. Test: say "sit" with your hands at your sides. If they sit, the cue is installed.',
      durationSeconds: null,
      reps: 10,
      tip: 'Do not say "sit, sit, sit" — say it once and wait. A dog trained with repeated cues learns that the first one means nothing.',
      successLook: 'Dog sits on verbal cue "sit" with handler standing still, hands at sides.'
    },
    {
      order: 4,
      instruction: 'Teach down using the same progression: lure from the dog\'s nose straight down to the floor between their front paws, then out along the floor. Their elbows should lower onto the ground. Mark the instant elbows touch. Fade lure and add "down" verbal cue over 10 reps.',
      durationSeconds: null,
      reps: 5,
      tip: 'Down is harder than sit for most dogs because it is a more vulnerable position. Reward generously with 2–3 treats for down, not just one.',
      successLook: 'Dog lies down fully with elbows and hips on the floor on verbal "down" cue.'
    }
  ],
  successCriteria: 'Dog sits on "sit" cue 9 out of 10 reps with hands at sides. Dog downs on "down" cue 8 out of 10 reps, in low-distraction room.',
  commonMistakes: [
    'Keeping food visible in the lure hand too long — fade it by rep 6',
    'Repeating the cue multiple times before the dog responds — one cue, then wait',
    'Accepting a sloppy half-sit (butt barely touching) — hold criteria for a clean, full sit',
    'Moving to proofing before the cue response is truly reliable'
  ],
  equipmentNeeded: ['High-value small treats', 'Treat pouch', 'Low-distraction room'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'obedience_s2',
  trainerNote: 'Sit and down are prerequisites for nearly everything else in this app. If your dog cannot sit on cue reliably, every other protocol that assumes sit will be harder than it needs to be. Build this until it is automatic — not just "sometimes works" but truly reliable under moderate distraction.',
  supportsLiveAiTrainer: true,
}

const obedience_stage2: Protocol = {
  id: 'obedience_s2',
  behavior: 'basic_obedience',
  stage: 2,
  title: 'Stay: Building Duration & Distance',
  objective: 'Teach the stay cue — holding a sit or down position until released, with increasing duration and handler distance.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Cue sit. The instant the dog sits, say "stay" in a calm, flat tone and hold your palm out toward the dog (stop-sign hand). Count 2 seconds silently. Say "yes!" and deliver the treat. This is duration = 2 seconds. Do 5 reps.',
      durationSeconds: null,
      reps: 5,
      tip: 'Mark the stay with "yes!" while the dog is still in position, then deliver the treat. If you wait until after they break to reward, you have rewarded breaking.',
      successLook: 'Dog holds sit position for 2 seconds without moving toward you.'
    },
    {
      order: 2,
      instruction: 'Build duration in this pattern: 2 sec → 5 sec → 3 sec → 8 sec → 5 sec → 10 sec → 5 sec → 15 sec. Vary the duration — sometimes easier, sometimes harder. Never add more than 5 seconds to the previous longest stay. Always release with "free!" or "okay."',
      durationSeconds: null,
      reps: 8,
      tip: 'Variable duration prevents the dog from anticipating release time. A dog that knows "stay always ends at 10 seconds" breaks at 10 seconds. Keep them guessing.',
      successLook: 'Dog holds stay for 15 seconds with handler standing directly in front of them.'
    },
    {
      order: 3,
      instruction: 'Add distance: with a 10-second stay established, take one step back. Return. Reward. Take two steps back. Return. Reward. Build to 5 feet away over 5 reps. Always return to the dog to reward — do not call them to you during stay practice.',
      durationSeconds: null,
      reps: 5,
      tip: 'Returning to the dog to reward (instead of calling them) is the single most important mechanical detail of stay training. Calling them to you rewards breaking the stay.',
      successLook: 'Dog holds sit-stay while handler moves 5 feet away and returns.'
    },
    {
      order: 4,
      instruction: 'Practice down-stay using the same progression. Down-stay is typically more stable than sit-stay for longer durations because it is physically more comfortable. Build to 30 seconds of down-stay with handler 5 feet away.',
      durationSeconds: 30,
      reps: 3,
      tip: 'For long stays (30+ seconds), add intermittent reinforcement: walk back to the dog every 10 seconds to drop a treat, then step away again. The dog learns that staying is continuously rewarding.',
      successLook: 'Dog holds down-stay for 30 seconds with handler at 5 feet.'
    }
  ],
  successCriteria: 'Dog holds sit-stay for 20 seconds with handler at 5 feet, 10 out of 15 trials. Dog holds down-stay for 30 seconds at 5 feet, 10 out of 15 trials.',
  commonMistakes: [
    'Calling the dog to you to reward during stay — this teaches breaking',
    'Building duration AND distance at the same time — always add one variable at a time',
    'Not releasing with a clear verbal cue — the dog should not self-release',
    'Asking for stay in high-distraction environments before it is solid in low-distraction'
  ],
  equipmentNeeded: ['High-value treats', 'Treat pouch', 'Timer or count method'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'obedience_s3',
  trainerNote: '"3D training" — Duration, Distance, Distraction — is the framework for every stay. Build one D at a time, never all three simultaneously. Most training failures happen because handlers layer complexity too fast. Patience at the 2D stage (duration + distance, no distraction) is what makes the 3D stage possible.',
  supportsLiveAiTrainer: true,
}

const obedience_stage3: Protocol = {
  id: 'obedience_s3',
  behavior: 'basic_obedience',
  stage: 3,
  title: 'Proofed Obedience with Distractions',
  objective: 'Proof sit, down, and stay in moderate-distraction environments so the behavior holds during real-life situations.',
  durationMinutes: 12,
  repCount: 12,
  steps: [
    {
      order: 1,
      instruction: 'In your home with TV on and household activity present, ask for sit, down, and stay in sequence. If the dog performs reliably, they are ready for outdoor proofing. If not, the distraction is already too high — reduce it and rebuild.',
      durationSeconds: null,
      reps: 5,
      tip: 'Home with moderate household activity (TV, another person moving around) is a meaningful distraction level. Do not skip straight to the park.',
      successLook: 'Dog responds to sit, down, and stay in a normal home environment with distractions.'
    },
    {
      order: 2,
      instruction: 'Take to the driveway or front yard. Practice sit, down, and a 15-second stay with mild outdoor distractions (traffic sounds, birds, wind). Start easier than you think — regress to 5-second stays if needed. Reward generously.',
      durationSeconds: null,
      reps: 5,
      tip: 'Outdoor obedience feels like a completely new task to the dog. Do not be surprised or frustrated by regression. It is normal. Be the patient teacher who starts from the beginning in each new location.',
      successLook: 'Dog performs sit and down on verbal cue outdoors within 3 seconds.'
    },
    {
      order: 3,
      instruction: 'Practice sit and stay while a helper walks past at 10 feet. The dog should hold the sit while the person walks by. If they break, ask for sit again and have the person repeat. Build to: helper walking past at 5 feet without the dog breaking.',
      durationSeconds: null,
      reps: 5,
      tip: 'A person walking past is one of the most common real-world distraction challenges. Mastering this translates directly to calm behavior at the vet, on the sidewalk, and in pet-friendly stores.',
      successLook: 'Dog holds sit while person walks past at 5 feet, checking in with handler.'
    },
    {
      order: 4,
      instruction: 'Practice "random cue" sessions: go about your normal day and ask for sit, down, or stay at unexpected moments — before meals, before going outside, before crossing the street. Reinforce each compliance with real-life rewards (access, food, petting).',
      durationSeconds: null,
      reps: null,
      tip: 'Real-life rewards (doors opening, dinner happening, leash going on) are more powerful long-term than treats because they are always available and always meaningful.',
      successLook: 'Dog responds to sit or down cue in daily life contexts without training session framing.'
    }
  ],
  successCriteria: 'Dog sits and downs on verbal cue outdoors in 10 out of 12 attempts. Holds a 15-second sit-stay with a person walking past at 5 feet, 8 out of 12 trials.',
  commonMistakes: [
    'Expecting indoor-level reliability outdoors immediately',
    'Using the same treat value outdoors as indoors — outdoor distractions require higher-value rewards',
    'Skipping the driveway/yard phase and going directly to a busy park',
    'Only asking for obedience behaviors during "training sessions" — integrate into daily life'
  ],
  equipmentNeeded: ['Treat pouch', 'High-value treats', 'Leash for outdoor safety', 'Optional: helper for distraction work'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'A proofed sit, down, and stay are the platform for everything else. Dogs with solid obedience under distraction are easier to manage in every situation — at the vet, on walks, with guests, during emergencies. The time invested here pays dividends for the dog\'s entire life.',
  supportsLiveAiTrainer: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// BARKING
// ─────────────────────────────────────────────────────────────────────────────

const barking_stage1: Protocol = {
  id: 'barking_s1',
  behavior: 'barking',
  stage: 1,
  title: 'Teaching "Quiet" on Cue',
  objective: 'Install a reliable "quiet" cue that interrupts barking within 3 seconds, using controlled bark-and-quiet repetitions.',
  durationMinutes: 8,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'First, teach "speak" on cue — yes, intentionally. Identify what reliably makes your dog bark (doorbell sound, knocking, a specific toy). Trigger the bark. The moment they bark once, say "speak!" and reward with a high-value treat. Repeat 5 times.',
      durationSeconds: null,
      reps: 5,
      tip: 'You cannot teach "quiet" without control over "speak." Control the bark on cue, then you can turn it off on cue. This feels counterintuitive but is how professional trainers work.',
      successLook: 'Dog barks in response to the trigger, hears "speak!" and receives a reward.'
    },
    {
      order: 2,
      instruction: 'Now, after 1–2 barks, hold a treat directly in front of the dog\'s nose. They cannot bark and sniff simultaneously. The moment barking stops — even for 1 second — say "quiet!" and deliver the treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Hold the treat at nose level, not above. You are interrupting the bark with the scent, then marking the silence. The treat is a bridge — you are not bribing; you are timing.',
      successLook: 'Dog pauses barking when treat appears at nose, hears "quiet!" and receives treat.'
    },
    {
      order: 3,
      instruction: 'Build the duration of quiet before treating: trigger bark → say "quiet" → hold treat at nose → wait 2 seconds of silence → say "yes!" → treat. Build to 5 seconds of silence before rewarding. Do 8 reps.',
      durationSeconds: null,
      reps: 8,
      tip: 'Duration of quiet is the goal, not just a momentary pause. Build to 5 seconds, then 10, then 20. The dog should hold quiet as a behavior, not just briefly stop.',
      successLook: 'Dog stops barking for 5 seconds when "quiet" is cued and a treat is presented.'
    },
    {
      order: 4,
      instruction: 'Begin fading the treat at the nose: say "quiet" without holding food near their face. Wait for silence. If the dog quiets, mark "yes!" and immediately reach into your pouch for the treat. If they do not quiet, produce the treat at nose level as a bridge.',
      durationSeconds: null,
      reps: 5,
      tip: 'The long-term goal is "quiet" working without a treat appearing at the nose. This step starts that process. Reward immediately when it works without the food bridge.',
      successLook: 'Dog quiets on verbal cue alone for 3+ seconds, 3 out of 5 attempts.'
    }
  ],
  successCriteria: 'Dog quiets within 3 seconds of "quiet" cue in a controlled triggering session, 10 out of 15 reps.',
  commonMistakes: [
    'Saying "quiet, quiet, QUIET!" louder and louder — the dog is already worked up; escalating your volume makes it worse',
    'Skipping the "speak" cue — without controlled onset, you cannot control offset',
    'Rewarding the very first moment of quiet even if the dog is already barking again — hold for the full duration',
    'Practicing when the dog is at peak arousal from a real trigger before the cue is established'
  ],
  equipmentNeeded: ['High-value treats (chicken, cheese)', 'Doorbell sound or knock trigger', 'Treat pouch'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'barking_s2',
  trainerNote: 'The #1 mistake owners make with barking dogs is yelling "QUIET!" repeatedly. To the dog, this sounds like you are barking along. A calm, single "quiet" cue combined with a brief food interruption is worth more than 100 shouted commands. Lower your energy first, then use the cue.',
  supportsLiveAiTrainer: false,
}

const barking_stage2: Protocol = {
  id: 'barking_s2',
  behavior: 'barking',
  stage: 2,
  title: 'Alert Barking Management: Door & Window',
  objective: 'Manage and reduce alert barking at the door and windows by teaching a behavioral replacement and limiting rehearsal of the bark.',
  durationMinutes: 10,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Install a physical barrier to prevent window access if window barking is the primary trigger. Use furniture rearrangement, baby gates, or frosted window film on the lower panes. Every unsupervised bark at the window is a practice rep — your goal is zero free reps.',
      durationSeconds: null,
      reps: null,
      tip: 'Management is not cheating. It is smart training. Every bark that happens unrehearsed reinforces the behavior. Cutting off window access reduces daily bark reps dramatically while you train the replacement.',
      successLook: 'Dog does not have access to the window during unsupervised time.'
    },
    {
      order: 2,
      instruction: 'Set up a controlled doorbell drill: have a helper ring the doorbell. The moment the dog begins to bark, calmly say "place" (or recall them to you) and lead them to their mat. Ask for a down. Once settled, say "quiet" and wait 5 seconds. Reward the quiet on the mat with a treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'You are teaching a behavioral chain: doorbell → bark once or twice → "place" → quiet on mat → reward. The mat becomes the alternative response to doorbell triggers.',
      successLook: 'Dog barks at doorbell, then follows handler to mat and settles within 15 seconds.'
    },
    {
      order: 3,
      instruction: 'Practice "go to mat at the sound" without the bark happening: ring the doorbell and immediately say "place" before the dog barks. Reward at the mat. Over 10 reps, begin letting the dog choose to go to the mat without being asked.',
      durationSeconds: null,
      reps: 5,
      tip: 'The goal is a dog that hears the doorbell and self-directs to the mat. That auto-behavior takes 30–50 doorbell rehearsals. Schedule them deliberately.',
      successLook: 'Dog hears doorbell and begins walking toward mat without handler prompting.'
    },
    {
      order: 4,
      instruction: 'Address demand barking separately: if your dog barks to get attention, meals, or play, apply extinction — do not respond in any way (including eye contact or "no"). The moment the barking stops, even briefly, say "yes!" and give what they were asking for. Over 5–7 days, demand barking extinguishes.',
      durationSeconds: null,
      reps: null,
      tip: 'Extinction initially causes an "extinction burst" — barking gets louder and more frantic before it goes away. This is normal. Hold through it. If you give attention during the burst, you have now taught them that intense barking works.',
      successLook: 'Dog stops demand barking and sits quietly before receiving attention or resources.'
    }
  ],
  successCriteria: 'Dog goes to mat within 15 seconds of doorbell trigger in 7 out of 10 rehearsed trials. Demand barking reduced to fewer than 3 barks per day within 7 days of extinction protocol.',
  commonMistakes: [
    'Giving any attention during demand barking — even negative attention maintains the behavior',
    'Waiting for perfect quiet before the mat redirect — use the mat immediately after 1–2 barks',
    'Skipping window management — free rehearsal undoes all formal training',
    'Reacting emotionally to the extinction burst — outlasting it is the entire challenge'
  ],
  equipmentNeeded: ['Baby gate or furniture barrier (for window access)', 'Training mat', 'High-value treats', 'Helper for doorbell drills'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'barking_s3',
  trainerNote: 'Alert barking is a natural behavior. Your goal is not a dog that never barks — it is a dog that barks 1–2 times, hears your cue, and settles. "Zero barking forever" is an unrealistic goal. "One bark, then quiet on cue" is a realistic, excellent outcome.',
  supportsLiveAiTrainer: false,
}

const barking_stage3: Protocol = {
  id: 'barking_s3',
  behavior: 'barking',
  stage: 3,
  title: 'Threshold Management & Real-World Quiet',
  objective: 'Maintain quiet in high-trigger situations (guests arriving, outdoor stimuli) through sub-threshold exposure and strong replacement behaviors.',
  durationMinutes: 12,
  repCount: 8,
  steps: [
    {
      order: 1,
      instruction: 'Identify your dog\'s top 3 bark triggers and rank them by intensity. For the mildest one, design a planned exposure: present the trigger at a distance where the dog notices but does not bark. Deliver treats continuously. Increase proximity over sessions.',
      durationSeconds: null,
      reps: null,
      tip: 'This is systematic desensitization. The rule: if the dog barks, you are over threshold. Move back until barking stops and restart. Every session at sub-threshold is a session building calm.',
      successLook: 'Dog notices the trigger, looks at it, then looks at you. No barking.'
    },
    {
      order: 2,
      instruction: 'Rehearse the "guest arrival" protocol: have a helper arrive at the door. Before they knock, put the dog on mat with a frozen KONG. Let the helper enter. If the dog leaves the mat and barks, calmly return them to the mat. The helper waits. When the dog settles, the guest can approach and greet.',
      durationSeconds: null,
      reps: 3,
      tip: 'Real guests will not follow your protocol unless briefed. Text them instructions before they arrive. "Please wait outside until I text you the dog is settled." Most guests are happy to help.',
      successLook: 'Dog stays on mat while guest enters, receives a treat, is calmly released after 2 minutes.'
    },
    {
      order: 3,
      instruction: 'Practice outdoor quiet: on walks, when the dog begins to bark at a trigger (person, dog, cyclist), say "quiet" once and immediately counter-condition with treats delivered at your hip every 2 seconds while you create distance. Do not stop walking — keep moving away.',
      durationSeconds: null,
      reps: 5,
      tip: 'Counter-conditioning means: trigger appears → immediately rain treats. You are building "trigger predicts treats" not "I bark to make the trigger go away." The distinction changes everything.',
      successLook: 'Dog sees trigger, hears "quiet," orients to handler, accepts treats while creating distance.'
    },
    {
      order: 4,
      instruction: 'Build a strong default "look at me" when triggers appear: every time the dog spots a known trigger before barking, say their name cheerfully. When they look at you, jackpot. Over weeks this becomes a self-reinforcing habit: dog sees trigger, dog looks to handler for treats.',
      durationSeconds: null,
      reps: null,
      tip: 'The "look at me" reflex is the long-term goal. A dog that looks to you when they see a trigger is a dog that has been redirected away from the bark before it starts.',
      successLook: 'Dog spots trigger, orients to handler without barking, receives treat.'
    }
  ],
  successCriteria: 'Dog remains quiet or quiets within 5 seconds in 6 out of 8 real-world trigger exposures. Holds mat during guest arrival in 5 out of 8 rehearsed sessions.',
  commonMistakes: [
    'Skipping sub-threshold work — presenting triggers at full intensity is not training, it is flooding',
    'Comforting the dog when they bark — this unintentionally reinforces the anxiety that drives barking',
    'Only managing barking without building the replacement behavior (mat, look-at-me)',
    'Expecting results in less than 4 weeks — threshold change takes consistent daily exposure'
  ],
  equipmentNeeded: ['Frozen KONG', 'Training mat', 'High-value treats', 'Helper for guest arrival drills', 'Treat pouch for outdoor sessions'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'Barking is almost always driven by emotion: arousal, anxiety, frustration, or excitement. The behavior protocol addresses the behavior. The emotion underneath requires counter-conditioning. Do both, or the behavior change will not hold under stress.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// SEPARATION ANXIETY
// ─────────────────────────────────────────────────────────────────────────────

const separation_stage1: Protocol = {
  id: 'separation_s1',
  behavior: 'separation_anxiety',
  stage: 1,
  title: 'Pre-Departure Cue Desensitization',
  objective: 'Neutralize the departure cues (keys, coat, shoes) that trigger anxiety before you even leave, by pairing them with calm, positive outcomes.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Make a list of your pre-departure routine in order: wake up → shower → get dressed → put on shoes → pick up keys → put on coat → go to door. Each of these is a departure cue your dog has learned predicts being alone. You will desensitize each one.',
      durationSeconds: null,
      reps: null,
      tip: 'Your dog\'s anxiety often peaks before you leave, not after. The cues are more powerful than the departure itself for many anxious dogs.',
      successLook: 'You have identified your top 3–5 departure cues your dog reacts to most.'
    },
    {
      order: 2,
      instruction: 'Pick up your keys. Just your keys — nothing else. Walk to the couch and sit down. Watch TV for 5 minutes. Put the keys back. Repeat 5 times per day for 3 days. No other departure cue. Keys = just another random thing that happens.',
      durationSeconds: 300,
      reps: 5,
      tip: 'Do this every day, multiple times. The goal is statistical dilution — keys happen 15 times a day, and most of the time nothing follows. The prediction breaks.',
      successLook: 'Dog watches you pick up keys but relaxes back down within 30 seconds — no pacing or panting.'
    },
    {
      order: 3,
      instruction: 'Add shoes to the desensitization: put your shoes on in the morning as if leaving, then sit at your desk and work for an hour. Take shoes off. No departure happened. Repeat for 3 days. Shoes become meaningless predictors.',
      durationSeconds: null,
      reps: null,
      tip: 'Rotate through each departure cue independently: shoes one week, coat another, bag the next. Tackle one at a time until that cue alone does not trigger stress.',
      successLook: 'Dog remains lying down or shows mild interest when shoes go on, then settles.'
    },
    {
      order: 4,
      instruction: 'Practice the full departure sequence without leaving: shoes, keys, coat, walk to door, open door, stand in doorway for 10 seconds, close door, take coat off, put keys down, sit on couch. Give the dog a KONG during this sequence. Make the whole routine a non-event.',
      durationSeconds: null,
      reps: 3,
      tip: 'The KONG gives the dog something to do during the sequence that is pleasant. You are pairing the departure routine with "KONG time" rather than "alone time."',
      successLook: 'Dog licks KONG and remains calm through the full departure routine without following you to the door.'
    }
  ],
  successCriteria: 'Dog shows no panting, pacing, or whining during the full departure cue sequence (shoes, keys, coat, door) in 10 out of 15 repetitions.',
  commonMistakes: [
    'Rushing through cue desensitization to get to "real" departures — this stage is not optional',
    'Making departures a big emotional event — no dramatic goodbyes or excessive affection at the door',
    'Skipping the KONG pairing — the dog needs something to do during the departure ritual',
    'Doing all cues simultaneously instead of one at a time'
  ],
  equipmentNeeded: ['Frozen KONG', 'Your keys, shoes, coat (real departure items)', 'Pet camera for monitoring (optional but recommended)'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'separation_s2',
  trainerNote: 'Separation anxiety is a genuine anxiety disorder — not disobedience, not spite. Dogs with separation anxiety are suffering, not misbehaving. This requires patience and a gradual systematic approach. If the dog is severely affected (howling for hours, destructive, injuring themselves at barriers), consult a veterinary behaviorist. Medication may be appropriate alongside behavior modification.',
  supportsLiveAiTrainer: false,
}

const separation_stage2: Protocol = {
  id: 'separation_s2',
  behavior: 'separation_anxiety',
  stage: 2,
  title: 'Short Absences: 30 Seconds to 10 Minutes',
  objective: 'Build a history of successful, calm short departures that teach the dog: being alone is temporary and always ends with your return.',
  durationMinutes: 15,
  repCount: 8,
  steps: [
    {
      order: 1,
      instruction: 'Set up a pet camera before doing any departures. You cannot know how your dog behaves alone without watching. Place the camera where the dog spends most of their time. Review every session.',
      durationSeconds: null,
      reps: null,
      tip: 'Camera footage is not optional for separation anxiety work. Many owners believe their dog is "fine" because they are quiet at return. Silent suffering is still suffering.',
      successLook: 'Camera is positioned and recording. You can see the dog\'s full resting area.'
    },
    {
      order: 2,
      instruction: 'Give the dog a frozen KONG, say your departure cue word ("I\'ll be back" or "see you soon" — pick one and use it always), and step outside the front door. Close it. Wait 30 seconds. Return before the dog shows any stress on camera. Enter calmly. No big hello.',
      durationSeconds: 30,
      reps: 3,
      tip: 'Return before stress begins. You are building a history: "every time the door closes, it opens again before anything bad happens." That history is the therapy.',
      successLook: 'Dog eats KONG for 30 seconds, door opens, dog looks up calmly. No stress signals.'
    },
    {
      order: 3,
      instruction: 'Build duration in small increments over days, not one session: 30 sec → 1 min → 2 min → 3 min → 5 min → 8 min → 10 min. Each increment is a separate session. Only advance when camera footage shows calm behavior for the full previous duration.',
      durationSeconds: null,
      reps: null,
      tip: 'The progression must be dictated by camera footage, not your schedule. If you need to go to work tomorrow, this protocol is not yet appropriate — management (pet sitter, daycare) is needed until the departure duration is work-length.',
      successLook: 'Dog rests or works on KONG for the full session duration with no distress signs on camera.'
    },
    {
      order: 4,
      instruction: 'If the dog shows stress at any duration level (howling, pacing, drooling, destructive behavior), reduce the next session to 50% of the previous successful duration and rebuild. One bad session requires 5 good sessions to recover from emotionally.',
      durationSeconds: null,
      reps: null,
      tip: 'Regression is not failure — it is data. You advanced too fast. The camera told you. Now you know where the dog\'s actual threshold is, and you can build from there honestly.',
      successLook: 'After regression and reduction, dog returns to calm behavior at the lower duration.'
    }
  ],
  successCriteria: 'Dog remains calm (no howling, pacing, or destructive behavior) on camera for 10 minutes, 6 out of 8 sessions.',
  commonMistakes: [
    'Advancing departure duration based on schedule rather than camera footage',
    'Making returns emotional — come home calmly, greet the dog after they have settled',
    'Skipping the KONG during early departures — the KONG is the bridge behavior',
    'Leaving for long periods before short departures are fully calm'
  ],
  equipmentNeeded: ['Frozen KONG (2–3 prepared ahead)', 'Pet camera', 'Timer'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: 'separation_s3',
  trainerNote: 'Most separation anxiety protocols fail because owners rush the departure duration. The dog must be calm for the FULL duration of each session before you advance. This takes weeks. If you cannot commit to a gradual schedule, use management (dog sitter, daycare) during work hours and practice the protocol in evenings and weekends.',
  supportsLiveAiTrainer: false,
}

const separation_stage3: Protocol = {
  id: 'separation_s3',
  behavior: 'separation_anxiety',
  stage: 3,
  title: 'Extended Alone Time & Full Independence',
  objective: 'Build calm, independent alone time up to 3–4 hours through graduated departures and strong pre-departure routines.',
  durationMinutes: 15,
  repCount: 6,
  steps: [
    {
      order: 1,
      instruction: 'Establish a consistent pre-departure routine that the dog learns predicts "alone time that ends": exercise for 20 minutes → KONG preparation → departure cue word → leave. Do this sequence every time, without variation. Predictability reduces anticipatory anxiety.',
      durationSeconds: null,
      reps: null,
      tip: 'The routine tells the dog what is happening. "I know what this is. It ends. I have done it before." That knowledge is calming for a dog with anxiety history.',
      successLook: 'Dog accepts the KONG and settles without following you to the door during the departure ritual.'
    },
    {
      order: 2,
      instruction: 'Continue extending alone time from 10 minutes toward 30, 60, 90 minutes using the camera footage protocol. Once 60 minutes is consistently calm, extend by 15-minute increments. Build toward 3 hours over 3–4 weeks minimum.',
      durationSeconds: null,
      reps: null,
      tip: 'The jump from 60 minutes to 3 hours is not a single step — it is 6–8 incremental steps. Plan for it. Do not leave the dog for 3 hours just because 60 minutes went well once.',
      successLook: 'Dog is asleep or resting on camera for the majority of a 90-minute session.'
    },
    {
      order: 3,
      instruction: 'Introduce "solo enrichment" items for longer absences: a KONG tower, a snuffle mat, a Licki Mat, or a frozen beef marrow bone. Rotate enrichment items so novelty is maintained. Enrichment extends calm engagement during the first 20–30 minutes of alone time.',
      durationSeconds: null,
      reps: null,
      tip: 'The first 20 minutes of alone time are the highest risk for anxiety. Enrichment occupies that window. After 20 minutes, most dogs settle and sleep.',
      successLook: 'Dog engages with enrichment item for 15+ minutes before lying down to rest.'
    },
    {
      order: 4,
      instruction: 'Once 3-hour alone time is stable, practice "re-entry calm": when you return home, ignore the dog for 2 minutes. No greeting until the dog is visibly calm. Then greet with calm, low-energy affection. This prevents the return becoming a hyper-arousal event the dog anticipates.',
      durationSeconds: 120,
      reps: null,
      tip: 'A calm return is as important as a calm departure. Dogs that receive high-energy homecomings become more agitated during alone time in anticipation of the reunion.',
      successLook: 'Dog waits calmly after you return, receives a gentle greeting, does not escalate into jumping or spinning.'
    },
    {
      order: 5,
      instruction: 'Maintain the protocol with two practice sessions per week even once the dog is reliable. A "cured" separation anxiety dog is still a dog with a history of anxiety. Skills maintained stay solid; skills abandoned fade. A monthly check-in with camera footage keeps you informed.',
      durationSeconds: null,
      reps: null,
      tip: 'If a life change occurs — move, new baby, new pet, change in schedule — proactively return to Stage 1 desensitization as a preventive measure. Do not wait for regression to treat regression.',
      successLook: 'Dog settles quickly and rests on camera during routine 3-hour alone time sessions.'
    }
  ],
  successCriteria: 'Dog remains calm on camera for 3 hours, with no stress signals, in 5 out of 6 sessions.',
  commonMistakes: [
    'Declaring success before 3-hour sessions have been tested with camera footage',
    'Abandoning the pre-departure routine once the dog seems reliable',
    'Not accounting for life-change triggers that can cause setbacks',
    'Using punishment for anxiety-related destruction — this increases anxiety and worsens the behavior'
  ],
  equipmentNeeded: ['Pet camera', 'Frozen KONG or enrichment variety (Licki Mat, snuffle mat, marrow bone)', 'Timer for graduated departures'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 4,
  nextProtocolId: null,
  trainerNote: 'If your dog has not improved meaningfully by Stage 3 of this protocol, seek a veterinary behaviorist evaluation. Severe separation anxiety often requires medication in combination with behavior modification. Medication is not a crutch — for genuinely anxious dogs, it makes the behavior work possible by reducing baseline anxiety to a trainable level.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// DOOR MANNERS
// ─────────────────────────────────────────────────────────────────────────────

const door_manners_stage1: Protocol = {
  id: 'door_manners_s1',
  behavior: 'door_manners',
  stage: 1,
  title: 'Wait at the Door — Sit and Hold',
  objective: 'Teach the dog to sit and wait at any door until released, never bolting through regardless of what is on the other side.',
  durationMinutes: 8,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Approach an interior door (closet, bedroom) with your dog beside you. Put your hand on the doorknob. If the dog moves toward the door, remove your hand and wait. The moment the dog backs up or sits, say "yes!" and deliver a treat.',
      durationSeconds: null,
      reps: null,
      tip: 'You are teaching: moving toward the door when the knob is touched = door does not open. Stillness = treats happen. Let the dog figure it out.',
      successLook: 'Dog backs up or stands still as you touch the doorknob.'
    },
    {
      order: 2,
      instruction: 'Once the dog holds still when you touch the knob, begin opening the door 1 inch. If the dog surges forward, close the door immediately. If they hold still, open 2 inches, then 3. Treat at each pause. The door opening is gated by the dog\'s stillness.',
      durationSeconds: null,
      reps: 10,
      tip: 'The door closing in the dog\'s face is not a punishment — it is simply information: "moving forward closes doors." Be mechanical, not emotional.',
      successLook: 'Dog holds still while door opens 6 inches.'
    },
    {
      order: 3,
      instruction: 'Add a formal cue: as you reach for the doorknob, say "wait" in a calm, flat tone. Once the dog is still, say "yes!" and treat. Open the door slightly. Repeat 8 times. Wait becomes the cue that predicts "hold your position while this door does whatever it does."',
      durationSeconds: null,
      reps: 8,
      tip: '"Wait" is a pause cue, not a permanent stay. It means "hold position until I release you." The release word is important — use "free!" or "okay" consistently.',
      successLook: 'Dog hears "wait," pauses, receives treat, door is opened fully while dog holds position.'
    },
    {
      order: 4,
      instruction: 'Open the door fully. Dog should hold the wait without going through. Pause 3 seconds. Say "free!" and let them go through. Do 5 reps. The release is as important as the hold — the dog learns they will always be given permission to go, they just need to wait for it.',
      durationSeconds: null,
      reps: 5,
      tip: 'A dog that knows the release is always coming learns to wait confidently rather than anxiously. The "free!" makes the wait feel safe, not punishing.',
      successLook: 'Dog holds wait with door wide open until "free!" is said, then passes through calmly.'
    }
  ],
  successCriteria: 'Dog sits or stands still at an open door on "wait" cue for 5 seconds before release, 12 out of 15 repetitions on interior doors.',
  commonMistakes: [
    'Opening the door too fast before the behavior is solid at each width increment',
    'Forgetting to release with a verbal cue — the dog should never self-release',
    'Practicing only on the front door — interior door practice first, then exterior',
    'Allowing even one bolt-through without consequence — consistency is absolute'
  ],
  equipmentNeeded: ['High-value treats', 'Interior door for practice', 'Treat pouch'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'door_manners_s2',
  trainerNote: 'Door bolting is a safety emergency waiting to happen. A dog that bolts through the front door is a dog that can be hit by a car. Treat this behavior with the seriousness it deserves. Do not advance to front door practice until interior door wait is absolutely reliable.',
  supportsLiveAiTrainer: true,
}

const door_manners_stage2: Protocol = {
  id: 'door_manners_s2',
  behavior: 'door_manners',
  stage: 2,
  title: 'Front Door & Exterior Wait',
  objective: 'Transfer the wait behavior to the front door and exterior entrances with high-distraction conditions — including guests arriving.',
  durationMinutes: 10,
  repCount: 12,
  steps: [
    {
      order: 1,
      instruction: 'Practice the interior door wait until it is reliable 10 out of 10 times. Then transfer to the front door with the dog on a leash for safety. Use exactly the same procedure: touch knob → dog holds still → open incrementally → treat → fully open → hold 5 seconds → "free!"',
      durationSeconds: null,
      reps: 5,
      tip: 'Keep the leash loose — it is a safety backup, not a restraint. If the dog bolts and the leash catches them, they have been accidentally taught that bolting is limited by the leash, not by the cue.',
      successLook: 'Dog holds wait at open front door for 5 seconds before release.'
    },
    {
      order: 2,
      instruction: 'Add outdoor distractions: have a helper walk across the driveway as the door is open. Practice wait while people, cyclists, or cars pass in view. The dog must hold the wait at the open front door regardless of what they can see outside.',
      durationSeconds: null,
      reps: 5,
      tip: 'This is the hardest step. The entire world is visible and the dog cannot go to it. High-value treats at a rapid rate (every 2 seconds) while the door is open help sustain the hold.',
      successLook: 'Dog holds wait with open front door and a person walking past at the end of the driveway.'
    },
    {
      order: 3,
      instruction: 'Practice the "guest arrival" version: doorbell rings, dog is asked to wait or go to mat. Door opens to a helper. Dog holds wait or mat position. Helper enters, ignores the dog, sits down. Dog released to greet after 30 seconds of calm.',
      durationSeconds: 30,
      reps: 3,
      tip: 'The guest ignoring the dog at entry is as important as the dog\'s behavior. A guest who immediately bends down to greet the dog breaks the wait. Brief your helpers.',
      successLook: 'Dog holds wait or mat position while guest enters and sits down before being released to greet.'
    },
    {
      order: 4,
      instruction: 'Practice "coming in from outside" wait: bring the dog in from a walk or yard and ask them to wait at the door before entering. Treat for waiting 3 seconds, then "free!" to enter. This teaches the behavior works both ways.',
      durationSeconds: null,
      reps: 4,
      tip: 'Dogs that wait at the door coming in also naturally slow down at the door going out. The behavior generalizes both directions once established.',
      successLook: 'Dog pauses at the exterior door before entering the home on "wait."'
    }
  ],
  successCriteria: 'Dog holds wait at open front door for 5 seconds with a person visible outside, 9 out of 12 reps. Holds mat or wait during guest arrival in 6 out of 8 rehearsals.',
  commonMistakes: [
    'Advancing to the front door before interior door wait is reliable',
    'Using the leash to hold the dog rather than the cue — leash as backup, cue as primary',
    'Guests who immediately greet the dog, breaking the protocol',
    'Skipping the distraction phase and testing with the real front door and real guests too soon'
  ],
  equipmentNeeded: ['Leash (safety backup)', 'High-value treats', 'Treat pouch', 'Helper for distraction practice'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'door_manners_s3',
  trainerNote: 'Every family member and regular visitor must know the protocol. One person who opens the door and lets the dog fly out without asking for a wait undoes weeks of training. A quick text to guests before arrival ("wait inside after ringing so I can set the dog up") solves 90% of this.',
  supportsLiveAiTrainer: true,
}

const door_manners_stage3: Protocol = {
  id: 'door_manners_s3',
  behavior: 'door_manners',
  stage: 3,
  title: 'Off-Leash Door Wait & Reliability Under Pressure',
  objective: 'Proof the door wait behavior off-leash and in high-excitement conditions so it holds even when the dog is highly aroused.',
  durationMinutes: 10,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'With the leash removed, ask for "wait" at the front door. Open the door fully. If the dog bolts, calmly bring them back inside, close the door, and restart. No emotional reaction. Simply reset and try again. Do 5 reps.',
      durationSeconds: null,
      reps: 5,
      tip: 'The absence of the leash reveals whether the behavior is real or leash-dependent. Many dogs that "wait" on leash have actually been restrained by the leash, not trained to wait. This step shows you the truth.',
      successLook: 'Dog holds wait at open front door with no leash attached for 5 seconds.'
    },
    {
      order: 2,
      instruction: 'Test under arousal: play with the dog for 5 minutes to get them excited, then approach the door. Ask for wait. The dog must be able to hold the wait even when physically excited. If they cannot, the behavior is not yet reliable under real-world conditions.',
      durationSeconds: null,
      reps: 3,
      tip: 'Most door accidents happen when the dog is excited — during a walk-up, when a guest arrives, when they hear something exciting outside. Test at high arousal because that is when the behavior matters most.',
      successLook: 'Dog holds wait at open door even when at 70% arousal level.'
    },
    {
      order: 3,
      instruction: 'Practice "emergency recall through door": open the door, say "free!" and let the dog go out. Then immediately call them back inside with their recall cue. Dog must respond to recall even when on the threshold of going out. Reward jackpot for a fast response.',
      durationSeconds: null,
      reps: 4,
      tip: 'This is the safety net behavior. If the dog ever bolts and you are at the door, your recall must work at the threshold. Build it here deliberately.',
      successLook: 'Dog steps outside, hears recall cue, turns around and re-enters the home.'
    },
    {
      order: 4,
      instruction: 'Generalize to all building entrances: practice wait at the back gate, the garage door, the car door, and at any barrier in your life. A dog with generalized door manners is a safe dog in any new situation involving entry and exit.',
      durationSeconds: null,
      reps: null,
      tip: 'Each new door type needs 2–3 training reps to transfer the behavior. The generalization builds quickly once the foundation is solid — most dogs "get it" within 2 reps at a new location.',
      successLook: 'Dog holds wait at gate, car door, and garage door on "wait" cue in first or second rep.'
    }
  ],
  successCriteria: 'Dog holds wait at open front door off-leash for 5 seconds in 8 out of 10 trials, including 3 trials at elevated arousal.',
  commonMistakes: [
    'Only testing in calm conditions — real bolting happens at high arousal, so train there',
    'Not proofing at other doorways and barriers beyond the front door',
    'Celebrating and dropping the wait practice once reliability seems good — maintain with periodic rehearsal',
    'Not building the recall-at-threshold as a safety behavior'
  ],
  equipmentNeeded: ['High-value treats', 'Long line (safety backup for early off-leash trials)', 'Helper optional'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'A dog with reliable door manners is safe. That is the bottom line. The investment in this protocol — 3 stages, maybe 15 total sessions — could prevent a tragedy. Every rep matters.',
  supportsLiveAiTrainer: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPULSE CONTROL
// ─────────────────────────────────────────────────────────────────────────────

const impulse_control_stage1: Protocol = {
  id: 'impulse_s1',
  behavior: 'impulse_control',
  stage: 1,
  title: 'Patience Games: It\'s Yer Choice',
  objective: 'Build the foundational understanding that restraint earns access and grabbing earns nothing — the core principle of impulse control.',
  durationMinutes: 8,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Hold a handful of treats in your open palm at the dog\'s nose height. Close your fist the instant the dog moves toward them. Wait. The moment the dog backs away — even slightly — open your fist. If they wait without diving in, say "yes!" and let them take ONE treat.',
      durationSeconds: null,
      reps: null,
      tip: 'Do not say anything. No "leave it," no "wait," no "no." Complete silence. You are letting the dog problem-solve: "What makes the fist open?" The answer is: not pushing.',
      successLook: 'Dog backs away from the closed fist and the fist opens. Dog waits for permission before taking.'
    },
    {
      order: 2,
      instruction: 'Once the dog backs off consistently, raise criteria: open palm with treats visible. Say nothing. If the dog moves toward the treats, close your fist. If they hold back and wait — even a brief hesitation — say "yes!" immediately and let them take one treat from the palm.',
      durationSeconds: null,
      reps: 10,
      tip: 'The speed of the fist matters. You must close before the dog\'s nose makes contact. This requires attention and anticipation on your part.',
      successLook: 'Dog looks at the open palm, glances up at your face, and waits.'
    },
    {
      order: 3,
      instruction: 'Place one treat on your knee (you are sitting). Say nothing. Dog will likely try to take it. Cover it if needed. When the dog backs away and makes eye contact with you, say "yes!" and let them take the treat. Build to 5 seconds of waiting before the marker.',
      durationSeconds: null,
      reps: 10,
      tip: 'The eye contact is the behavior you are looking for. "I don\'t grab — I check in with my person." That is the impulse control habit in a single look.',
      successLook: 'Dog looks at treat on knee, then makes eye contact with you before you say "yes!"'
    },
    {
      order: 4,
      instruction: 'Practice before every meal for one week: hold the food bowl. Put it toward the floor. If the dog dives toward it, lift it back up. When the dog sits or stands back calmly, place the bowl down and say "free!" This is real-life impulse control applied every single day.',
      durationSeconds: null,
      reps: null,
      tip: 'Mealtime is free daily practice that reinforces impulse control without any extra training sessions. Never skip it.',
      successLook: 'Dog sits or steps back as the bowl approaches the floor, waits for "free!" before eating.'
    }
  ],
  successCriteria: 'Dog waits with treats on open palm for 3 seconds without grabbing in 15 out of 20 reps. Dog waits for bowl to be placed and "free!" before eating, 7 consecutive meals.',
  commonMistakes: [
    'Using verbal cues during the game — silence teaches self-regulation better than commands',
    'Letting the dog succeed at grabbing even once — consistency is everything',
    'Not practicing before meals — free daily reps are too valuable to skip',
    'Moving to distractions before the basic palm game is reliable'
  ],
  equipmentNeeded: ['Kibble or low-value treats for practice', 'Dog\'s regular food bowl', 'Treat pouch for rewards'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'impulse_s2',
  trainerNote: 'Impulse control is the meta-behavior. Every other behavior in this app is easier for a dog with strong impulse control. The dog that can pause and check in before acting is a dog that can be trained for anything. Invest in this foundation heavily.',
  supportsLiveAiTrainer: false,
}

const impulse_control_stage2: Protocol = {
  id: 'impulse_s2',
  behavior: 'impulse_control',
  stage: 2,
  title: 'Threshold Control: Food, Toys & Doors',
  objective: 'Apply impulse control principles to the most common real-life trigger points: food on surfaces, exciting toys, and thresholds.',
  durationMinutes: 10,
  repCount: 12,
  steps: [
    {
      order: 1,
      instruction: 'Counter-surfing prevention: place a boring treat on the edge of a low coffee table while the dog watches. Say nothing. Stand beside the table. If the dog moves toward the treat, cover it with your hand. When the dog backs up and makes eye contact, say "yes!" and give a treat from your pouch — not the table treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'The reward always comes from you — not from the surface. You are teaching: "things on surfaces are not for dogs." The reward is your treat, not the table treat. Never let them eat the table treat.',
      successLook: 'Dog backs away from the table treat and looks at you for the reward.'
    },
    {
      order: 2,
      instruction: 'Toy excitement threshold: hold an exciting toy (squeaky, tug) and wiggle it. The moment the dog reaches for it, stop moving the toy and pull it back. When the dog sits or pauses, say "yes!" and immediately start the game. The dog must offer calm before play starts.',
      durationSeconds: null,
      reps: 5,
      tip: '"Control the start" teaches: calm behavior launches exciting things, frantic behavior ends them. This principle transfers to every exciting moment in the dog\'s life.',
      successLook: 'Dog pauses, sits, or backs off the toy. You initiate play.'
    },
    {
      order: 3,
      instruction: 'Car door impulse control: open the car door. Dog must wait before jumping in. If they jump in without permission, calmly ask them out and restart. When they wait, say "free!" and let them jump in. Give a jackpot treat immediately when seated in the car.',
      durationSeconds: null,
      reps: 5,
      tip: 'Car entries are a significant safety moment — a dog that bolts into traffic because a car door opened is in danger. Train this with the same seriousness as front door behavior.',
      successLook: 'Dog waits at open car door until "free!" is said, then jumps in and settles.'
    },
    {
      order: 4,
      instruction: 'Leash excitement threshold: most dogs bolt out of control when the leash comes out. Counter-condition: pick up the leash. If the dog spins or jumps, put it back down. Wait. When the dog sits or stands calmly, clip the leash. Over 10 days, the leash becomes associated with calm, not frantic energy.',
      durationSeconds: null,
      reps: null,
      tip: 'This is best done when you are NOT in a rush to go for a walk. Practice the leash-clipping ritual separately from actual walks several times per week.',
      successLook: 'Dog sits calmly while leash is clipped, waits for release before walking toward the door.'
    }
  ],
  successCriteria: 'Dog ignores treat on table edge and looks to handler in 8 out of 12 reps. Dog waits at car door before release in 8 out of 10 trials.',
  commonMistakes: [
    'Rewarding from the surface that is off-limits — always reward from your hand or pouch',
    'Starting toy play before the dog has fully paused — any residual frantic behavior is too much',
    'Practicing car door protocol in a rush before a real trip',
    'Putting the leash away when the dog is frantic — wait for calm, then put away. Don\'t reward the frenzy by stopping the session'
  ],
  equipmentNeeded: ['Boring treats for surface practice', 'High-value treats in pouch', 'Exciting toy', 'Leash', 'Car access'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'impulse_s3',
  trainerNote: 'The threshold control principle is universal: the dog must offer calm before exciting things happen. Applied consistently across feeding, play, walks, and car trips, this becomes the dog\'s default operating mode. You stop managing the dog — the dog manages themselves.',
  supportsLiveAiTrainer: false,
}

const impulse_control_stage3: Protocol = {
  id: 'impulse_s3',
  behavior: 'impulse_control',
  stage: 3,
  title: 'Real-World Restraint: Strangers, Other Dogs & Distractions',
  objective: 'Apply impulse control to outdoor and social contexts — greeting strangers, passing other dogs, and encountering exciting stimuli on walks.',
  durationMinutes: 12,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Practice "sit before greeting": when a person approaches on a walk and wants to pet the dog, ask for a sit before allowing the greeting. If the dog sits, the person can approach. If the dog lunges or jumps, the person turns away and you re-cue the sit. The dog earns access through calm.',
      durationSeconds: null,
      reps: 4,
      tip: 'Brief the greeter: "Could you wait until he sits? Then you can pet him." Most people are delighted to participate. Their patience is the reward the dog works toward.',
      successLook: 'Dog sits while stranger approaches and receives a calm greeting without jumping.'
    },
    {
      order: 2,
      instruction: 'On-leash dog passing: when another dog passes on the opposite side of the street, ask for a sit or focus. Deliver treats at a rapid pace (every 2 seconds) while the other dog is visible. When the other dog passes, stop treating. "Other dog visible = treats rain" is the association.',
      durationSeconds: null,
      reps: 3,
      tip: 'You are counter-conditioning and providing impulse control practice simultaneously. The dog learns: "I see another dog, I look at my handler, treats happen." Lunging and pulling produces nothing.',
      successLook: 'Dog notices other dog, glances at it, then orients back to handler for treats.'
    },
    {
      order: 3,
      instruction: 'Practice "deferred excitement": dog sees something exciting (a ball rolling by, a child running). Ask for a sit. Hold the sit for 5 seconds. Then release with "free!" and move toward the exciting thing. Calm = access. Frantic = delay.',
      durationSeconds: null,
      reps: 3,
      tip: 'Deferred excitement teaches a profound lesson: "I can want something intensely and still choose to wait." That ability underpins every piece of dog training.',
      successLook: 'Dog sits with an exciting stimulus visible, holds for 5 seconds, is released and moves toward it calmly.'
    },
    {
      order: 4,
      instruction: 'Practice the "off-switch" game: play an exciting tug or chase game for 30 seconds. Say "done" and stop all play. Ask for a sit or down. Dog must settle within 10 seconds. Reward the settle. Then restart play. Build the ability to go from 100% excitement to calm on cue.',
      durationSeconds: 30,
      reps: 3,
      tip: 'The off-switch is the most advanced impulse control skill. A dog that can go from frantic play to a down in 10 seconds has genuinely exceptional emotional self-regulation.',
      successLook: 'Dog transitions from active play to a down within 10 seconds of "done" cue.'
    }
  ],
  successCriteria: 'Dog sits for stranger greeting in 7 out of 10 trials. Orients to handler when another dog passes in 6 out of 10 outdoor encounters.',
  commonMistakes: [
    'Allowing the greeting without the sit even once — the sit is always the cost of entry',
    'Starting the other-dog work when the passing dog is too close — distance is everything',
    'Using a correction when the dog lunges — the answer is more distance, not punishment',
    'Not practicing the off-switch game regularly — it requires frequent maintenance'
  ],
  equipmentNeeded: ['Treat pouch', 'High-value treats', 'Leash', 'Tug toy for off-switch game'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'A dog with strong real-world impulse control is a joy to be with in public. They are welcome everywhere, trusted with strangers, and safe around children. The training investment at this stage pays every single day for the dog\'s entire life.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// COOPERATIVE CARE (VET PREP & HANDLING)
// ─────────────────────────────────────────────────────────────────────────────

const coop_care_stage1: Protocol = {
  id: 'coop_care_s1',
  behavior: 'cooperative_care',
  stage: 1,
  title: 'Touch Acceptance: Paws, Ears & Mouth',
  objective: 'Build genuine comfort with handling of the paws, ears, and mouth so the dog accepts routine care without stress, resistance, or biting.',
  durationMinutes: 8,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Start with paw handling. Touch the dog\'s shoulder lightly while delivering a treat. Move to the elbow, then the lower leg, then briefly touch the paw. Any moment of stillness and acceptance earns a treat. If the dog pulls away, reduce the pressure and restart from the shoulder.',
      durationSeconds: null,
      reps: 5,
      tip: 'Work in the direction of least sensitivity to most sensitivity. For most dogs: body → legs → paws → between toes. Respect the dog\'s communication — pulling away means you moved too fast.',
      successLook: 'Dog holds still while you touch from shoulder to paw with light pressure.'
    },
    {
      order: 2,
      instruction: 'Build to a full paw hold: cup the paw gently in your hand for 2 seconds while treating continuously. Release and treat once more. Do 5 reps per paw. Your goal over 3 sessions: holding each paw for 5 seconds with continuous treats, dog relaxed.',
      durationSeconds: null,
      reps: 5,
      tip: 'Continuous treating (every 1–2 seconds) during the hold tells the dog the hold itself is not a threat. You are not waiting for the hold to end to reward — you are rewarding the duration.',
      successLook: 'Dog rests paw in your cupped hand for 3 seconds while eating treats continuously.'
    },
    {
      order: 3,
      instruction: 'Move to ear handling: touch the base of the ear, then slide your hand up to the flap, then gently lift the flap to peek inside. Treat at each step. Work to being able to hold the ear flap up for 3 seconds. This is exactly what a vet does.',
      durationSeconds: null,
      reps: 5,
      tip: 'Ears are sensitive and many dogs find inner-ear examination particularly uncomfortable. Go slowly, treat richly, and stop if the dog shows stress (head shake, pulling away, whale eye).',
      successLook: 'Dog allows ear flap to be lifted and held for 2 seconds without pulling away.'
    },
    {
      order: 4,
      instruction: 'Practice mouth handling: touch the outside of the muzzle, then gently lift the lip to reveal the gum line, then briefly open the mouth by placing a finger on the lower jaw. Treat at each step. Work to being able to look at the full mouth in 3 sessions.',
      durationSeconds: null,
      reps: 5,
      tip: 'Brush-teeth training uses this same foundation. A dog comfortable with mouth handling is a dog that will accept dental care and oral medication — skills that extend their life.',
      successLook: 'Dog allows lips to be lifted and mouth briefly opened without pulling away or mouthing.'
    }
  ],
  successCriteria: 'Dog accepts 3-second paw hold, ear flap lift, and lip examination without pulling away or mouthing in 10 out of 15 sessions.',
  commonMistakes: [
    'Moving from one body zone to the next before the current zone is calm — each zone must be desensitized fully first',
    'Treating after the handling is over rather than during — continuous treating during the touch is the method',
    'Practicing when the dog is tired or hungry — cooperative care needs a calm, willing dog',
    'Using restraint when the dog resists — this creates negative associations; instead reduce intensity'
  ],
  equipmentNeeded: ['High-value treats (chicken, cheese — smallest possible pieces)', 'Treat pouch', 'Quiet room'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'coop_care_s2',
  trainerNote: 'Cooperative care is not just about vet visits. A dog that accepts handling without stress is safer around children, easier to groom, and less likely to bite during pain or injury. Build this early and maintain it. Run a "handling refresher" monthly — it takes 5 minutes and preserves years of trust.',
  supportsLiveAiTrainer: false,
}

const coop_care_stage2: Protocol = {
  id: 'coop_care_s2',
  behavior: 'cooperative_care',
  stage: 2,
  title: 'Nail Trim Desensitization',
  objective: 'Build step-by-step acceptance of nail trimming — from seeing the clippers to completing a full trim — using desensitization and counter-conditioning.',
  durationMinutes: 10,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Show the nail clippers to the dog. Any calm investigation (sniffing, looking) earns a treat. Do this for 3 sessions. The clippers should become a treat-predicting object, nothing more.',
      durationSeconds: null,
      reps: null,
      tip: 'If the dog shows fear at the sight of clippers (pulling away, shaking), place them on the floor at a distance and treat for looking at them. Move closer only when the dog is seeking the clippers for treats.',
      successLook: 'Dog approaches clippers and sniffs them, looking for the treat.'
    },
    {
      order: 2,
      instruction: 'Touch the clippers to the paw (closed, no cutting). Treat the moment the clippers make contact. Build: touch one toe → touch all toes → hold a paw with clippers in hand → place the clipper opening around one nail without cutting → treat richly at each step.',
      durationSeconds: null,
      reps: 5,
      tip: 'Each step on this progression may take multiple sessions. That is normal. The nail trim desensitization protocol typically takes 2–4 weeks done correctly.',
      successLook: 'Dog holds still while clipper opening is placed around one nail without flinching.'
    },
    {
      order: 3,
      instruction: 'Trim one nail only. Use sharp clippers (dull clippers crush rather than cut, which is painful). Clip just the very tip — no quick. Give a jackpot of 5 treats immediately. Stop. Let the dog move away. Next session: 2 nails. Build one nail at a time.',
      durationSeconds: null,
      reps: null,
      tip: 'One nail and done is not weakness — it is brilliant training strategy. A dog that accepts one nail ten times is a dog that will accept ten nails once that history is built. Rush it and you restart from scratch.',
      successLook: 'Dog holds still through the click-sound of the clipper on one nail, receives jackpot.'
    },
    {
      order: 4,
      instruction: 'Once the dog accepts a full trim (all 18 nails on 4 paws including dewclaws), maintain the positive association by trimming monthly with high-value treats throughout. A trim should never happen without treats — even for an experienced, calm dog.',
      durationSeconds: null,
      reps: null,
      tip: 'Monthly trimming is maintenance. Maintenance keeps nails short and keeps the dog comfortable. Overgrown nails alter gait and cause joint pain. Regular trimming is health care, not just aesthetics.',
      successLook: 'Dog holds still through a full 18-nail trim with only mild interest in the treats, no stress signals.'
    }
  ],
  successCriteria: 'Dog accepts clipper placement on 3 different nails without resistance in 7 out of 10 sessions. Full trim completed with mild treat support in 3 consecutive sessions.',
  commonMistakes: [
    'Rushing to a full trim before each individual step is calm',
    'Using dull clippers — replace them annually at minimum',
    'Holding the dog\'s paw too tightly when they resist — release, reduce intensity, rebuild',
    'Stopping treats once the dog "knows" nail trim — maintain the association always'
  ],
  equipmentNeeded: ['Sharp, high-quality nail clippers', 'High-value treats (the best you have)', 'Styptic powder in case of quick strike', 'Second person optional for early sessions'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'coop_care_s3',
  trainerNote: 'Nail trimming anxiety is among the top reasons dogs are sedated at the vet. A properly desensitized dog needs neither sedation nor restraint. The 4 weeks of this protocol can save years of vet stress, owner guilt, and dog suffering. It is worth every session.',
  supportsLiveAiTrainer: false,
}

const coop_care_stage3: Protocol = {
  id: 'coop_care_s3',
  behavior: 'cooperative_care',
  stage: 3,
  title: 'Vet Visit Simulation & Table Confidence',
  objective: 'Simulate a full vet examination so the dog enters the clinic calm, accepts being lifted onto a table, and tolerates a full physical exam without stress.',
  durationMinutes: 12,
  repCount: 8,
  steps: [
    {
      order: 1,
      instruction: 'Practice "table training" at home: lift a small dog onto a table and feed treats continuously for 30 seconds. Lift them off. Repeat 5 times. For larger dogs, use a platform or raised surface. The goal is comfort on a raised, unfamiliar surface.',
      durationSeconds: 30,
      reps: 5,
      tip: 'The vet exam table is cold, metal, slightly raised, and unfamiliar. Simulate these conditions at home with a folding table or raised platform before the real thing.',
      successLook: 'Dog stands on the raised surface, eating treats, without trying to jump off.'
    },
    {
      order: 2,
      instruction: 'Simulate a full physical exam: run your hands firmly over the dog\'s entire body — head, neck, chest, abdomen, back, legs, tail. Look in the ears. Look in the mouth. Squeeze each toe gently. Treat continuously throughout. Do this at least once per week.',
      durationSeconds: null,
      reps: 3,
      tip: 'This weekly "home exam" also serves as early detection — you will notice lumps, injuries, or sensitivities that would otherwise go undetected until a vet finds them.',
      successLook: 'Dog stands or lies calmly through a 3-minute full-body exam with continuous treats.'
    },
    {
      order: 3,
      instruction: 'Visit the vet clinic for a "happy visit" — no exam, no shots. Simply walk in, let the dog get treats from the staff, sit in the waiting room for 5 minutes, and leave. Repeat monthly. This breaks the "vet = bad things happen" association.',
      durationSeconds: null,
      reps: null,
      tip: 'Call ahead and ask if happy visits are available. Most clinics welcome them. It takes 10 minutes and transforms the dog\'s relationship with the clinic.',
      successLook: 'Dog enters the clinic without pulling backward. Accepts treat from staff member inside.'
    },
    {
      order: 4,
      instruction: 'Practice restraint tolerance: gently but firmly hold the dog in a standing position for 30 seconds (as a vet tech would during examination). Treat continuously. Practice "scruff hold" for large dogs. Practice being cradled on their back for small dogs.',
      durationSeconds: 30,
      reps: 3,
      tip: 'Vets and techs sometimes need to restrain dogs suddenly and firmly. A dog with no restraint training who is suddenly held tightly will panic and may bite. Practice makes this normal.',
      successLook: 'Dog accepts firm hold in standing position for 30 seconds with mild treats, no significant struggling.'
    }
  ],
  successCriteria: 'Dog accepts full simulated physical exam at home for 3 minutes with continuous treats in 6 out of 8 sessions. Dog enters vet clinic without pulling backward on 2 consecutive happy visits.',
  commonMistakes: [
    'Only practicing home handling and skipping happy vet visits',
    'Doing the home exam only when something is wrong — weekly regardless',
    'Restraining harder when the dog struggles — this escalates. Release and reduce intensity',
    'Allowing the vet to rush through an exam a dog is not comfortable with — advocate for slow, treat-supported exams'
  ],
  equipmentNeeded: ['Raised surface or folding table', 'High-value treats', 'Access to vet clinic for happy visits'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: null,
  trainerNote: 'A dog that is calm at the vet receives better care. Veterinarians can perform a more thorough exam on a relaxed dog and are more likely to catch problems early. Cooperative care is health care. The time you put into this protocol will be rewarded in better veterinary outcomes for your dog\'s entire life.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// WAIT & STAY (ADVANCED)
// ─────────────────────────────────────────────────────────────────────────────

const wait_stay_stage1: Protocol = {
  id: 'wait_stay_s1',
  behavior: 'wait_and_stay',
  stage: 1,
  title: 'Wait vs Stay: Understanding the Difference',
  objective: 'Install two distinct positional cues — "wait" (brief pause, any position) and "stay" (hold until released) — and teach the dog to differentiate them.',
  durationMinutes: 8,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: '"Wait" practice: as the dog is walking beside you, say "wait" in a flat tone and stop walking. Wait for the dog to pause. Mark "yes!" the instant they stop — even briefly — and continue walking. Do not ask for a sit. Wait = just stop forward movement.',
      durationSeconds: null,
      reps: 8,
      tip: '"Wait" is a temporary pause. The dog does not need to sit or lie down. Any position that results in paused movement is correct. Mark the pause, not the position.',
      successLook: 'Dog pauses movement when "wait" is said, regardless of body position.'
    },
    {
      order: 2,
      instruction: '"Stay" practice: ask for a sit. Say "stay" with your palm-out stop signal. Count 5 seconds. Return to the dog. Deliver treat at the dog\'s nose while still in sit. Say "free!" to release. Stay requires a specific position maintained until released — different from wait.',
      durationSeconds: null,
      reps: 7,
      tip: '"Stay" is a duration behavior in a specific position. The dog should not move until they hear "free." The distinction from "wait" is that wait is temporary and positionally loose; stay is formal and position-specific.',
      successLook: 'Dog holds sit position for 5 seconds while handler stands still in front of them.'
    },
    {
      order: 3,
      instruction: 'Practice the cues back-to-back to help the dog notice the difference: walk together → "wait" → pause acknowledged → walk again → stop → "sit" → "stay" → 10 second hold → "free!" → walk. Alternate 5 times each.',
      durationSeconds: null,
      reps: 5,
      tip: 'The contrast between the two cues is what teaches the distinction. Practicing them in alternation forces the dog to listen to the specific word rather than guessing from context.',
      successLook: 'Dog responds to "wait" with a brief pause and "stay" with a held positional stop — different responses to different words.'
    }
  ],
  successCriteria: 'Dog pauses on "wait" without sitting in 10 out of 15 reps. Dog holds sit-stay for 10 seconds in 10 out of 15 reps.',
  commonMistakes: [
    'Using "wait" and "stay" interchangeably — pick one meaning for each and hold it',
    'Asking for sit every time you say "wait" — wait is not a positional cue',
    'Not releasing formally from stay — always "free!" to end it',
    'Building duration on stay before the cue is clearly understood'
  ],
  equipmentNeeded: ['High-value treats', 'Treat pouch', 'Low-distraction room'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'wait_stay_s2',
  trainerNote: 'The wait/stay distinction is one of the most practically useful cue pairs in dog training. "Wait" at the curb before crossing. "Stay" on the mat while guests arrive. "Wait" before eating. "Stay" during a vet exam. Each solves a different real-life problem. Build both.',
  supportsLiveAiTrainer: true,
}

const wait_stay_stage2: Protocol = {
  id: 'wait_stay_s2',
  behavior: 'wait_and_stay',
  stage: 2,
  title: 'Stay with Distance & Handler Movement',
  objective: 'Build stay to 30 seconds with the handler at 10 feet away, moving around in the dog\'s field of vision.',
  durationMinutes: 10,
  repCount: 12,
  steps: [
    {
      order: 1,
      instruction: 'Establish a 15-second sit-stay with you standing directly in front of the dog. Then step to the left — one step. Return. Treat. Step to the right. Return. Treat. Step behind the dog (out of their sight line). Return. Treat. Handler movement is the new challenge.',
      durationSeconds: null,
      reps: 5,
      tip: 'Moving out of the dog\'s sight line is the hardest step. Most dogs break when they can no longer see you. Build to it gradually — step behind, immediately return, then progressively stay behind longer.',
      successLook: 'Dog holds sit-stay while handler circles around them and briefly disappears from view.'
    },
    {
      order: 2,
      instruction: 'Build to 10 feet: take one step back → return and treat → two steps back → return and treat → five steps → return → 10 feet → return. Each new distance needs 3 successful repetitions before extending. Total: 12 reps at various distances up to 10 feet.',
      durationSeconds: null,
      reps: 7,
      tip: 'Use variable distance — sometimes 3 feet, sometimes 8, sometimes 10. The dog should not be able to predict the difficulty. Variability keeps them alert and holding.',
      successLook: 'Dog holds stay while handler backs up to 10 feet and pauses for 5 seconds.'
    },
    {
      order: 3,
      instruction: 'Combine distance and movement: walk to 8 feet, step sideways, step back toward the dog, step away again, return. All while the dog holds the stay. This mirrors real-life situations where you need the dog to hold position while you move around a room.',
      durationSeconds: null,
      reps: null,
      tip: 'Real-life stay situations involve handlers who move. A stay that only works when the handler is frozen is not a trained stay — it is a paused dog waiting for you to signal it\'s okay to move.',
      successLook: 'Dog holds stay while handler moves unpredictably within a 10-foot radius.'
    }
  ],
  successCriteria: 'Dog holds sit-stay for 20 seconds with handler at 10 feet and moving laterally, 8 out of 12 trials.',
  commonMistakes: [
    'Building distance before duration is solid',
    'Returning to the dog at a run — this excites them and causes breaking',
    'Not varying distance to prevent anticipation of your return path',
    'Releasing the dog the moment you return rather than pausing briefly before releasing'
  ],
  equipmentNeeded: ['High-value treats', 'Treat pouch', 'Quiet room with space to move'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'wait_stay_s3',
  trainerNote: 'A stay that holds while you move around is a stay that holds in real life. Most stay failures happen because the handler moves — walks toward the kitchen, looks away, turns their back — and the dog self-releases. Train with movement from the beginning and your stay will be bulletproof.',
  supportsLiveAiTrainer: true,
}

const wait_stay_stage3: Protocol = {
  id: 'wait_stay_s3',
  behavior: 'wait_and_stay',
  stage: 3,
  title: 'Stay Under Real-World Pressure',
  objective: 'Proof stay in high-distraction environments and during real-life situations: mealtimes, greeting guests, crossing the street.',
  durationMinutes: 12,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Mealtime stay: place the food bowl on the floor with the dog in a sit-stay 3 feet away. If they break toward the bowl, pick it up and reset. When they hold for 5 seconds with bowl on the floor, say "free!" and release them to eat. This is daily real-life practice.',
      durationSeconds: null,
      reps: null,
      tip: 'Mealtime stay is the most sustainable daily practice you can do. It takes 30 seconds, it happens twice a day, and it keeps the stay sharp without formal training sessions.',
      successLook: 'Dog holds sit-stay 3 feet from bowl on the floor, released to eat after 5 seconds.'
    },
    {
      order: 2,
      instruction: 'Doorbell stay: practice the doorbell-stay drill from the jumping protocol combined with a formal "stay" at distance from the door. Dog must hold a mat or sit-stay while the door opens and a person enters. Build to holding the stay while the guest walks fully into the room.',
      durationSeconds: null,
      reps: 4,
      tip: 'Combine the stay with the mat from the settle protocol. The dog that can hold a "stay" on their mat while guests arrive is the most socially elegant dog possible to live with.',
      successLook: 'Dog holds stay on mat while guest enters and walks to the couch without breaking.'
    },
    {
      order: 3,
      instruction: 'Curb wait before street crossing: at every curb, ask for a brief "wait." Check traffic. Say "free!" and cross together. Build this as a lifelong habit — 2 seconds of wait at every curb, every single time. This habit, more than any other, prevents vehicle accidents.',
      durationSeconds: null,
      reps: null,
      tip: 'Curb waiting is a pattern-training behavior. Done consistently on every walk, it becomes completely automatic within 2–3 weeks. The dog will begin sitting at every curb without being asked.',
      successLook: 'Dog pauses naturally at curb edge and looks up before crossing.'
    },
    {
      order: 4,
      instruction: 'Outdoor stay proofing: at a park or quiet outdoor space, ask for a down-stay on a mat. Stand 10 feet away. Have a helper walk past at 5 feet. Practice 3 reps. Then have the helper carry a squeaky toy. Then have a neutral dog walk past on a leash. Each distraction increase is a new milestone.',
      durationSeconds: null,
      reps: 3,
      tip: 'Build the distraction level systematically. The first time a dog holds a stay when another dog walks past is a major achievement — celebrate it appropriately.',
      successLook: 'Dog holds down-stay outdoors for 30 seconds with a person walking past at 5 feet.'
    }
  ],
  successCriteria: 'Dog holds mat stay during guest arrival in 7 out of 10 rehearsed trials. Pauses automatically at curbs on 8 consecutive walks.',
  commonMistakes: [
    'Skipping the mealtime stay as "too easy" — free daily practice is too valuable to skip',
    'Not proofing outdoors before relying on stay in outdoor situations',
    'Introducing multiple distractions at once before the stay is solid with one',
    'Letting the stay become "optional" by not maintaining the standard in daily life'
  ],
  equipmentNeeded: ['Mat (portable)', 'Treat pouch', 'Helper for distraction work', 'Leash for outdoor sessions'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'The fully proofed stay is one of the most safety-critical behaviors a dog can have. A dog that holds a stay when told to can be stopped mid-chase, held at a distance from danger, and managed in any social situation without physical restraint. Build it until it is a reflex, then maintain it forever.',
  supportsLiveAiTrainer: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// LOOSE LEASH WITH DOGS (LEASH REACTIVITY)
// ─────────────────────────────────────────────────────────────────────────────

const reactivity_stage1: Protocol = {
  id: 'reactivity_s1',
  behavior: 'leash_reactivity',
  stage: 1,
  title: 'Finding Threshold & Building a Calm Baseline',
  objective: 'Identify the dog\'s reaction threshold distance to other dogs and establish calm, treat-responsive behavior at that distance.',
  durationMinutes: 10,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Identify a known, calm "stooge" dog (a friend\'s dog who does not react). Set up 100 feet away. Walk your dog toward the stooge dog until they notice but do not react — no lunging, no barking, no hard staring. That distance is their current threshold. Note it. This is your starting point.',
      durationSeconds: null,
      reps: null,
      tip: 'Threshold is the distance at which the dog can notice the trigger but still take a treat and respond to your voice. Above threshold = reactive. At threshold = trainable. Know the number.',
      successLook: 'Dog notices the other dog at distance, takes a treat from your hand, maintains contact with you.'
    },
    {
      order: 2,
      instruction: 'At 5 feet BEYOND threshold, begin the counter-conditioning protocol: the moment the other dog comes into view, begin feeding treats continuously — one every 2 seconds — until the other dog goes out of view or you turn away. Other dog visible = treat rain. Other dog gone = treats stop.',
      durationSeconds: null,
      reps: 5,
      tip: '"Open bar / closed bar" is the technique name. The bar is open when the trigger is present, closed when it is gone. This pairs the trigger with treats at the emotional level, not just behavior.',
      successLook: 'Dog sniffs and eats treats while other dog is visible at threshold distance.'
    },
    {
      order: 3,
      instruction: 'If the dog reacts (lunges, barks) during the counter-conditioning: say nothing, turn and walk in the opposite direction until the dog can take a treat. You went over threshold. Next session, add 10 feet to your starting distance. Never try to correct or "work through" the reaction.',
      durationSeconds: null,
      reps: null,
      tip: 'A reacting dog is not misbehaving — they are over threshold. Correction at this moment creates an association between other dogs and punishment, which worsens reactivity. The only correct response is more distance.',
      successLook: 'Dog recovers within 30 seconds of being moved away from the trigger and can take treats again.'
    },
    {
      order: 4,
      instruction: 'Over 2–3 sessions at the same threshold distance, the dog should begin orienting to you when the other dog appears — looking to you for treats rather than at the dog. This "dog appears → I look at my handler" response is the breakthrough moment of this protocol.',
      durationSeconds: null,
      reps: 5,
      tip: 'This shift happens without you asking for it. The dog starts to anticipate: "other dog = treats come from that person." Watch for the spontaneous head-turn toward you as the strongest signal that counter-conditioning is working.',
      successLook: 'Dog sees other dog, turns head toward handler immediately, waiting for treats.'
    }
  ],
  successCriteria: 'Dog remains calm and takes treats when other dog is visible at threshold distance in 7 out of 10 exposures. Dog orients to handler on 4 out of 10 spontaneous exposures without being prompted.',
  commonMistakes: [
    'Starting too close — working over threshold achieves nothing except rehearsing the reaction',
    'Correcting the dog for reacting — punishment worsens reactivity over time',
    'Using low-value treats — the competition is another dog, you need your best treats',
    'Practicing on regular walks without controlled threshold management'
  ],
  equipmentNeeded: ['High-value treats (chicken, hot dog, cheese)', 'Treat pouch', 'Front-clip harness', '6-foot leash', 'Friend with a calm neutral dog'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'reactivity_s2',
  trainerNote: 'Leash reactivity is the most common behavior problem in adult dogs and one of the most mismanaged. Corrections and punishment reliably make it worse — the dog learns that seeing other dogs predicts punishment, increasing their negative emotional state. The only evidence-based approach is systematic counter-conditioning below threshold. It takes time. It works.',
  supportsLiveAiTrainer: false,
}

const reactivity_stage2: Protocol = {
  id: 'reactivity_s2',
  behavior: 'leash_reactivity',
  stage: 2,
  title: 'Shrinking the Threshold Distance',
  objective: 'Systematically reduce the distance at which the dog remains calm around other dogs, from their starting threshold toward 15 feet.',
  durationMinutes: 12,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Return to your established threshold distance. Run 5 successful counter-conditioning reps at this distance until the dog is orienting to you reliably. Then move 5 feet closer. Run 5 reps. If calm and orienting: this is the new threshold. If reactive: back up 10 feet and rebuild.',
      durationSeconds: null,
      reps: 5,
      tip: 'Move closer in 5-foot increments only. Resist the temptation to jump 20 feet closer when things are going well. Slow shrinking is permanent; fast shrinking regresses.',
      successLook: 'Dog handles the 5-foot-closer distance with the same calm as the previous starting point.'
    },
    {
      order: 2,
      instruction: 'Introduce a "Look at That" (LAT) game: when the other dog is visible and your dog is below threshold, say "look!" in a happy tone and point toward the other dog. When your dog looks at the other dog and looks back at you, say "yes!" and jackpot. You are rewarding the calm observation.',
      durationSeconds: null,
      reps: 5,
      tip: 'LAT teaches the dog that noticing the trigger and returning their gaze to you is a trick that earns treats. It gives the dog a job at the sight of other dogs rather than a frustration response.',
      successLook: 'Dog looks at the other dog, then immediately looks back to handler. Handler marks and rewards.'
    },
    {
      order: 3,
      instruction: 'Practice parallel walking: walk your dog in the same direction as the stooge dog at 20 feet of lateral distance. Treat your dog continuously. After 3 minutes of parallel walking, both dogs have usually "settled" and the distance can be reduced slightly. Build over 3 sessions.',
      durationSeconds: 180,
      reps: null,
      tip: 'Parallel walking is one of the most powerful leash reactivity tools. Dogs are less reactive when walking alongside another dog than when facing them. Use direction to your advantage.',
      successLook: 'Dog walks at your side with another dog visible 20 feet away for 3 minutes, no reaction.'
    },
    {
      order: 4,
      instruction: 'Test in a new location. A different park, a different street, a different stooge dog. Threshold in a new environment may be 20 feet further than your current training distance. Start conservatively. The behavior will generalize faster than the initial learning, but it still needs reps.',
      durationSeconds: null,
      reps: null,
      tip: 'New environment regressions are normal and expected. They do not mean the training has failed — they mean the dog needs new-environment reps. Provide them.',
      successLook: 'Dog shows the same calm orientation behavior in a new location after 2–3 warm-up reps.'
    }
  ],
  successCriteria: 'Dog remains calm and orients to handler with another dog visible at 20 feet, in 7 out of 10 trials in at least two different environments.',
  commonMistakes: [
    'Moving closer too fast when sessions are going well',
    'Practicing on regular walks with unpredictable dog encounters before threshold is well-established',
    'Stopping counter-conditioning when the dog "seems fine" — maintain treats until below-threshold distance is fully consolidated',
    'Working only with one stooge dog — generalize to multiple dogs'
  ],
  equipmentNeeded: ['High-value treats', 'Treat pouch', 'Front-clip harness or head halter', 'Friend with a calm neutral dog (or multiple)', 'Open low-traffic training area'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: 'reactivity_s3',
  trainerNote: 'Progress with leash reactivity is measured in months, not sessions. A dog that goes from 80-foot threshold to 20-foot threshold over 8 weeks has made enormous progress. Do not compare to other dogs or to an arbitrary standard — compare to your dog\'s own baseline. Every foot of threshold reduction is a win.',
  supportsLiveAiTrainer: false,
}

const reactivity_stage3: Protocol = {
  id: 'reactivity_s3',
  behavior: 'leash_reactivity',
  stage: 3,
  title: 'Controlled On-Leash Greetings',
  objective: 'Build the ability for the dog to pass other dogs calmly at close range and, for appropriate dogs, participate in a structured on-leash greeting.',
  durationMinutes: 12,
  repCount: 8,
  steps: [
    {
      order: 1,
      instruction: 'Establish calm passes at 10 feet using counter-conditioning. Once reliable, begin "parallel walking at 10 feet" with the stooge dog. Treat continuously. Gradually reduce the parallel walking distance to 6 feet over 3 sessions. Both dogs walking, both handlers treating. This is the goal state for most reactive dogs on sidewalks.',
      durationSeconds: null,
      reps: 4,
      tip: 'For many reactive dogs, passing at 6 feet on a sidewalk without incident IS the goal. They do not need to greet. Not all dogs should greet on leash. Know your dog.',
      successLook: 'Dog walks past another dog at 6 feet while on leash, no reaction, treats flowing.'
    },
    {
      order: 2,
      instruction: 'If your dog is appropriate for on-leash greetings (not fearful, not aggressive, plays well off-leash): approach the stooge dog at an arc, not head-on. The arc removes the head-on confrontation that triggers reactions. Allow a 3-second sniff, then say "let\'s go" and walk away while treating.',
      durationSeconds: null,
      reps: 3,
      tip: 'Head-on approaches are confrontational in dog body language. Arcing in from the side is a calming signal. Train yourself to never approach another dog head-on.',
      successLook: 'Dog sniffs the stooge dog briefly via an arced approach, then walks away without lunging or pulling.'
    },
    {
      order: 3,
      instruction: 'Manage the greeting duration strictly: 3 seconds maximum for reactive dogs. The moment the leashes begin to tangle or either dog escalates, say "let\'s go" cheerfully and walk away. Short, positive greetings build a history of good interactions. Long greetings often go wrong.',
      durationSeconds: null,
      reps: 3,
      tip: '"Say hi, then go" is the mantra for on-leash greetings with reactive dogs. Always end the greeting on a positive note by leaving before either dog becomes uncomfortable.',
      successLook: 'Both dogs sniff briefly, both handlers say "let\'s go" at the same time, both dogs walk away loose-leash.'
    },
    {
      order: 4,
      instruction: 'Build a "walk past without any interaction" as the default behavior on all walks. Most dog encounters should end in a polite pass, not a greeting. Practice making controlled, non-greeting passes the majority of dog encounters. The dog learns: seeing a dog does not automatically mean greeting.',
      durationSeconds: null,
      reps: null,
      tip: 'Owners who allow their reactive dog to "say hi" to every dog they see create a dog that expects greeting every time and reacts when it is denied. "Not every dog is for greeting" is a lesson worth teaching.',
      successLook: 'Dog passes another dog on the sidewalk at 6 feet with no reaction and no greeting attempt.'
    }
  ],
  successCriteria: 'Dog passes another dog at 6 feet with no reaction in 6 out of 8 encounters. Dog completes a 3-second arc greeting with stooge dog without lunging in 4 out of 8 rehearsals.',
  commonMistakes: [
    'Allowing head-on approaches — always arc',
    'Letting greetings run longer than 3 seconds for reactive dogs',
    'Thinking on-leash greetings are required or healthy — they are not mandatory',
    'Stopping counter-conditioning because the dog can now pass at 6 feet — maintain the treats'
  ],
  equipmentNeeded: ['High-value treats', 'Treat pouch', 'Front-clip harness', '6-foot leash', 'Calm neutral stooge dog with cooperative owner'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 4,
  nextProtocolId: null,
  trainerNote: 'A truly "cured" reactive dog is rare. A well-managed reactive dog who can pass other dogs calmly and has a handler who understands threshold is a realistic, excellent outcome. That dog can live a full, rich life. Set this as the goal, not perfection.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// SIT
// ─────────────────────────────────────────────────────────────────────────────

const sit_stage1: Protocol = {
  id: 'sit_s1',
  behavior: 'sit',
  stage: 1,
  title: 'Sit on Verbal Cue',
  objective: 'Teach the dog to sit reliably on a single verbal cue within 2 seconds, with no lure and no repeated commands.',
  durationMinutes: 7,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Hold a pea-sized treat at your dog\'s nose. Slowly move your hand up and slightly back over their head. As their nose follows the treat upward, their rear will naturally drop toward the floor. The instant their bottom touches the ground, say "yes!" and deliver the treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Keep the treat close to the nose — not raised high above their head. Too high and the dog jumps. The motion is a slow arc, not a lift.',
      successLook: 'Dog follows the lure into a clean sit without jumping, backing up, or spinning.'
    },
    {
      order: 2,
      instruction: 'After 5 lure reps, fade the food from your hand: use the same upward hand motion but with no treat in that hand. When the dog sits, mark "yes!" and deliver a treat from your other hand or treat pouch. Repeat 10 times.',
      durationSeconds: null,
      reps: 10,
      tip: 'Fading the lure is the most important step. A dog that only sits when food is visible in your hand has not learned to sit on cue — they have learned to follow food.',
      successLook: 'Dog sits in response to the hand signal with no treat visible in the hand.'
    },
    {
      order: 3,
      instruction: 'Add the verbal cue: say "sit" in a calm, clear tone just before the hand signal. After 5 paired reps, drop the hand signal entirely — say "sit" with your hands at your sides and wait. If the dog sits, jackpot (3 treats). This confirms the verbal cue is installed.',
      durationSeconds: null,
      reps: 5,
      tip: 'Say "sit" once, then wait up to 5 seconds. If no response, reset (walk away, come back) and try again. Never repeat the cue — each repetition tells the dog the first one was optional.',
      successLook: 'Dog sits on the verbal cue "sit" with handler\'s hands at their sides.'
    }
  ],
  successCriteria: 'Dog sits on verbal "sit" cue alone (no hand signal, no lure) within 2 seconds, 15 out of 20 reps.',
  commonMistakes: [
    'Keeping food in the lure hand past rep 5 — fade the food early',
    'Saying "sit, sit, sit" — say it once and wait',
    'Pushing the dog\'s rear down — this creates resistance, not understanding',
    'Rewarding a partial sit (hovering, not fully seated) — hold criteria for a clean, full sit'
  ],
  equipmentNeeded: ['High-value small treats', 'Treat pouch', 'Low-distraction room'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'sit_s2',
  trainerNote: 'Sit is usually the first behavior owners teach and often the worst-trained one because it is taken for granted. A sit that "sometimes works" is not a trained sit. Hold yourself to the 15/20 standard before advancing. A rock-solid sit is the foundation for greeting manners, mealtime discipline, crosswalk safety, and a dozen other real-life situations.',
  supportsLiveAiTrainer: true,
}

const sit_stage2: Protocol = {
  id: 'sit_s2',
  behavior: 'sit',
  stage: 2,
  title: 'Sit with Duration & Distance',
  objective: 'Build sit duration to 20 seconds and distance to 6 feet, with the dog holding until explicitly released.',
  durationMinutes: 9,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Cue sit. Once seated, immediately say "stay" with a flat palm toward the dog. Count 3 seconds silently. Say "yes!" while the dog is still seated, then deliver the treat. This is the foundation of sit-stay. Do 5 reps at 3 seconds.',
      durationSeconds: null,
      reps: 5,
      tip: 'Mark while the dog is still in position, not after they move. The marker tells them exactly what earned the treat — staying in the sit, not getting up.',
      successLook: 'Dog holds sit for 3 seconds without shuffling forward or standing.'
    },
    {
      order: 2,
      instruction: 'Build duration in a variable pattern: 3 sec → 6 sec → 4 sec → 10 sec → 7 sec → 15 sec → 10 sec → 20 sec. Vary the duration rather than always increasing — variability prevents anticipation. End each repetition with "free!" to release.',
      durationSeconds: null,
      reps: 8,
      tip: 'Variable duration is essential. A dog that always gets released at 10 seconds will break at 11. Mixing shorter and longer durations keeps the dog attentive and waiting for the actual release word.',
      successLook: 'Dog holds sit for 20 seconds with handler standing directly in front of them.'
    },
    {
      order: 3,
      instruction: 'Add distance: once the 20-second sit-stay is solid, take one step back. Return to the dog. Treat. Take 2 steps back. Return. Treat. Build to 6 feet over 5 reps. Always walk back to the dog to deliver the treat — never call them to you during sit-stay practice.',
      durationSeconds: null,
      reps: 5,
      tip: 'Returning to the dog to reward (instead of calling them to you) is the most critical mechanical detail of sit-stay training. Calling them to you teaches them to leave the sit for the reward.',
      successLook: 'Dog holds sit-stay for 10 seconds with handler at 6 feet away.'
    }
  ],
  successCriteria: 'Dog holds sit-stay for 20 seconds with handler standing still in front, 10 out of 15 trials. Holds sit-stay for 10 seconds at 6-foot distance, 8 out of 15 trials.',
  commonMistakes: [
    'Building duration and distance at the same time — add one variable at a time',
    'Calling the dog to you as the reward — this teaches breaking the sit',
    'Not using a release word — the dog should never decide when the sit ends',
    'Accepting a slow, reluctant sit — cue sits during high-motivation moments and reward enthusiastically to keep the behavior sharp'
  ],
  equipmentNeeded: ['High-value treats', 'Treat pouch', 'Quiet space with room to back up'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'sit_s3',
  trainerNote: 'Duration and distance are two of the "3 Ds" of sit-stay training (duration, distance, distraction). Never add all three at once. Conquer duration first, then distance, then begin adding distraction at Stage 3. Each D is a separate challenge that takes independent reps.',
  supportsLiveAiTrainer: true,
}

const sit_stage3: Protocol = {
  id: 'sit_s3',
  behavior: 'sit',
  stage: 3,
  title: 'Sit Under Distraction & In Daily Life',
  objective: 'Proof sit in distraction-rich environments and integrate it into daily routines so it becomes an automatic, reflexive behavior.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Practice sit outdoors in the driveway or front yard. The change in environment will feel like a new task to the dog — start easy. Do 5 reps of sit with verbal cue only, hands at sides. Reward with high-value treats. Accept a 3-second response window rather than 2.',
      durationSeconds: null,
      reps: 5,
      tip: 'Every new environment resets the difficulty to beginner level. Do not be surprised or frustrated. Simply start easier and build back up. The behavior generalizes faster with each new location.',
      successLook: 'Dog sits on verbal cue outdoors within 3 seconds, without needing a hand signal.'
    },
    {
      order: 2,
      instruction: 'Add a moving distraction: have a helper walk past at 10 feet while the dog holds a sit. If the dog breaks, ask for sit again and repeat. Build to: helper walking past at 5 feet, jogging past at 10 feet, and a helper carrying a squeaky toy past at 10 feet.',
      durationSeconds: null,
      reps: 5,
      tip: 'Introduce distractions at the lowest intensity first (calm person far away) and build gradually. A sit that holds when a jogger passes at 5 feet is a behavior that will hold at the vet, on the sidewalk, and at any pet-friendly store.',
      successLook: 'Dog holds sit while a person walks past at 5 feet without getting up or spinning.'
    },
    {
      order: 3,
      instruction: 'Integrate sit into 5 daily routines: (1) before the leash goes on, (2) before the food bowl goes down, (3) before greeting any visitor, (4) before crossing a curb, (5) before getting in or out of the car. These become automatic checkpoints in the dog\'s daily life.',
      durationSeconds: null,
      reps: null,
      tip: 'Real-life sit opportunities are more valuable than formal training sessions. Five natural sit opportunities per day, reinforced with the actual real-life reward (walk happening, food appearing), builds the most durable behavior of all.',
      successLook: 'Dog begins offering sits spontaneously before exciting events — before the leash, before meals, at the curb — without being asked.'
    },
    {
      order: 4,
      instruction: 'Test reliability: go 3 days tracking every time you cue "sit." Record how many times the dog responds within 2 seconds versus takes longer or needs a second cue. Goal: 90% first-cue compliance within 2 seconds. If below 80%, do 3 more sessions of high-value sit practice.',
      durationSeconds: null,
      reps: null,
      tip: 'Tracking compliance data is not overthinking it — it is the only honest measure of whether the behavior is truly reliable. "He sits most of the time" is not reliable. 90% is reliable.',
      successLook: 'Dog responds to first "sit" cue within 2 seconds in 9 out of every 10 real-life situations tracked.'
    }
  ],
  successCriteria: 'Dog sits on first verbal cue within 2 seconds in 12 out of 15 outdoor trials with a person walking past as distraction. Sits automatically before 4 of 5 daily routine checkpoints without being asked.',
  commonMistakes: [
    'Only practicing sit during formal training sessions and never in daily life',
    'Letting the sit become sloppy ("close enough") once it is learned — hold the standard always',
    'Not proofing in multiple environments — a sit that only works inside is not a trained sit',
    'Over-cueing sit to the point where the dog tunes it out — keep cues meaningful by rewarding every correct response'
  ],
  equipmentNeeded: ['Treat pouch', 'High-value treats for distraction proofing', 'Helper for walking-past distraction'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: null,
  trainerNote: 'A dog that sits reliably in any environment is a dog you can manage in any situation without physical restraint. Sit before every exciting event, sit at every curb, sit at every greeting. Make it a habit and you will have a different dog within 2 weeks.',
  supportsLiveAiTrainer: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// DOWN (LIE DOWN)
// ─────────────────────────────────────────────────────────────────────────────

const down_stage1: Protocol = {
  id: 'down_s1',
  behavior: 'down',
  stage: 1,
  title: 'Down on Verbal Cue',
  objective: 'Teach the dog to lie down fully on a single verbal cue, with elbows and hips on the floor, within 3 seconds.',
  durationMinutes: 8,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Ask the dog to sit. Hold a treat at their nose, then slowly move your hand straight down to the floor between their front paws, then slide it along the floor away from them. Their elbows should follow the treat down. The instant both elbows touch the floor, say "yes!" and deliver the treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'The lure path is: nose → floor → out. Do not pull the treat away too fast or the dog will stand up to follow. Keep it slow — their elbows need time to lower.',
      successLook: 'Dog lowers front elbows to the floor, hips follow. Full lying-down position.'
    },
    {
      order: 2,
      instruction: 'After 5 reps with the food lure, fade it: use the same downward hand motion but with no treat in that hand. Mark and reward from your treat pouch when elbows hit the floor. Do 10 reps. The hand motion becomes a hand signal independent of food.',
      durationSeconds: null,
      reps: 10,
      tip: 'Down takes longer to lure-fade than sit because it is a more vulnerable position and dogs are naturally more cautious about offering it. Be patient — reward every attempt, even partial lowering.',
      successLook: 'Dog lowers into down position following the empty hand signal.'
    },
    {
      order: 3,
      instruction: 'Add the verbal cue "down": say it once just before the hand signal. After 5 paired reps, try the verbal cue alone with hands at your sides. If the dog downs, jackpot. If not, go back to the hand signal for 3 more sessions before trying verbal-only again.',
      durationSeconds: null,
      reps: 5,
      tip: '"Down" and "off" must mean different things. If you use "down" to mean "get off the couch" or "stop jumping," pick a different word for the lie-down cue ("drop," "floor," "lie down"). Consistency in language is the handler\'s job, not the dog\'s.',
      successLook: 'Dog lies down on verbal "down" cue with handler standing still, hands at sides.'
    }
  ],
  successCriteria: 'Dog lies fully down (elbows and hips on floor) on verbal "down" cue alone within 3 seconds, 15 out of 20 reps.',
  commonMistakes: [
    'Luring from a standing position instead of a sit — sit-to-down is mechanically easier',
    'Marking before the elbows are fully on the floor — mark the finished position, not the approach',
    'Using "down" to mean multiple things (lie down, get off, stop jumping) — one word, one meaning',
    'Moving the lure too quickly along the floor — slow is smooth, smooth is fast'
  ],
  equipmentNeeded: ['High-value treats', 'Treat pouch', 'Non-slip surface (carpet or yoga mat helps for hesitant dogs)'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'down_s2',
  trainerNote: 'Down is harder than sit for most dogs because lying down is a physically vulnerable position. Some dogs, especially those with a history of harsh corrections, will resist it. Go slower with these dogs, use softer surfaces, and reward any downward movement generously. Trust is built in these moments.',
  supportsLiveAiTrainer: true,
}

const down_stage2: Protocol = {
  id: 'down_s2',
  behavior: 'down',
  stage: 2,
  title: 'Down-Stay: Duration & Relaxed Body',
  objective: 'Build a down-stay to 45 seconds with a genuinely relaxed body — hips rolled to one side — rather than a tense, alert down.',
  durationMinutes: 10,
  repCount: 12,
  steps: [
    {
      order: 1,
      instruction: 'Cue down. Once the dog is down, say "stay" and deliver a treat every 10 seconds while they hold position. Walk back to them each time to deliver. Build from 10 seconds to 30 seconds over 5 reps. Release with "free!" each time.',
      durationSeconds: null,
      reps: 5,
      tip: 'Going to the dog to deliver the treat keeps them in the down position. If you call them to you for the treat, you are rewarding getting up.',
      successLook: 'Dog holds down-stay for 30 seconds while receiving treats delivered in position.'
    },
    {
      order: 2,
      instruction: 'Encourage a "relaxed down" — hips rolled to one side rather than weight held on elbows. To encourage this: deliver the treat to the side of their body while they are down, so they turn their head slightly. Many dogs naturally shift their hips when turning their head. Mark and jackpot any hip roll.',
      durationSeconds: null,
      reps: 5,
      tip: 'A relaxed down (sphinx or hip-rolled) is physically sustainable. A dog that "downs" but holds their weight tense on their elbows is not truly settled — they are ready to spring up. The hip roll signals genuine relaxation.',
      successLook: 'Dog lies with hips rolled to one side, fully relaxed body, not tense or alert.'
    },
    {
      order: 3,
      instruction: 'Build to 45 seconds of down-stay with intermittent reinforcement: deliver a treat every 10–15 seconds by walking back to the dog\'s position. Vary the intervals — sometimes 8 seconds, sometimes 20. Always release with "free!" at the end.',
      durationSeconds: 45,
      reps: 5,
      tip: 'Intermittent reinforcement (variable timing) during a stay is more powerful than regular reinforcement. The dog cannot predict when the next treat comes, so they keep holding and waiting.',
      successLook: 'Dog holds a relaxed down-stay for 45 seconds with treats delivered in position at variable intervals.'
    }
  ],
  successCriteria: 'Dog holds a relaxed (hip-rolled or sphinx) down-stay for 45 seconds with handler returning to deliver treats, 9 out of 12 trials.',
  commonMistakes: [
    'Accepting a tense, alert down as "good enough" — it is not genuinely relaxed',
    'Calling the dog to you to reward the down-stay — always return to them',
    'Building duration too fast — 10 seconds → 45 seconds in one session is too big a jump',
    'Not releasing formally with "free!" — the dog should never self-release'
  ],
  equipmentNeeded: ['High-value treats', 'Treat pouch', 'Comfortable surface — a mat helps', 'Timer'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'down_s3',
  trainerNote: 'The relaxed down — hips to one side, weight off the elbows — is the goal state for any duration behavior. A dog that can offer a relaxed down on cue and hold it is a dog you can take to a café, a waiting room, a dinner party. It is one of the highest social-value behaviors in this entire program.',
  supportsLiveAiTrainer: true,
}

const down_stage3: Protocol = {
  id: 'down_s3',
  behavior: 'down',
  stage: 3,
  title: 'Down at a Distance & Under Distraction',
  objective: 'Proof down in novel environments, at a distance from the handler, and with real-world distractions present.',
  durationMinutes: 12,
  repCount: 12,
  steps: [
    {
      order: 1,
      instruction: 'Practice distance down: stand 3 feet from the dog and cue "down." When reliable at 3 feet, move to 5 feet, then 8 feet. At greater distances the dog is doing more independent processing — the cue must be clear and the reward (when you return to deliver it) must be high-value.',
      durationSeconds: null,
      reps: 5,
      tip: 'A dog that will down from 8 feet away has genuinely understood the cue — not just responded to a hand in their face. Distance down is a meaningful test of comprehension.',
      successLook: 'Dog lies down from a verbal cue with handler standing 8 feet away.'
    },
    {
      order: 2,
      instruction: 'Practice down in 3 new locations: the backyard, the front porch, and a pet-friendly outdoor space. In each new place, start with 2 easy warm-up reps, then build to a 30-second down-stay. The behavior will generalize faster each time.',
      durationSeconds: null,
      reps: 3,
      tip: 'Each new environment requires starting over at the easy end. Not because the dog forgot — because the context is genuinely different to them. Two easy reps in a new place primes the behavior reliably.',
      successLook: 'Dog lies down on verbal cue in 3 different environments outside the home.'
    },
    {
      order: 3,
      instruction: 'Add a moving distraction: have a helper walk past at 10 feet while the dog holds a down-stay. Build to: helper at 5 feet, helper jogging, helper with another dog. Each increase in distraction intensity requires 3 successful reps before advancing.',
      durationSeconds: null,
      reps: 5,
      tip: 'The down-stay under distraction is where the real-world value lives. A dog that will hold a down while a child runs past or another dog walks by is a dog you can take anywhere.',
      successLook: 'Dog holds a 20-second down-stay while a person walks past at 5 feet.'
    }
  ],
  successCriteria: 'Dog responds to verbal "down" cue at 8-foot distance in 9 out of 12 trials. Dog holds 20-second down-stay with a moving person at 5 feet in 3 different environments.',
  commonMistakes: [
    'Only practicing down when the dog is already close — distance down is a separate skill',
    'Skipping the warm-up reps in new environments and going straight to the hardest version',
    'Adding distraction before duration and distance are both solid',
    'Only proofing indoors — outdoor down is a different level of challenge'
  ],
  equipmentNeeded: ['Treat pouch', 'High-value treats', 'Mat (optional but helpful outdoors)', 'Helper for distraction work'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'A proofed down is one of the most powerful management tools you have. In any situation where the dog needs to settle immediately and hold — a crowded sidewalk, a child approaching, a door opening — "down-stay" is your reset button. Build it until it is a reflex.',
  supportsLiveAiTrainer: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// SHAKE (HANDSHAKE / PAW)
// ─────────────────────────────────────────────────────────────────────────────

const shake_stage1: Protocol = {
  id: 'shake_s1',
  behavior: 'shake',
  stage: 1,
  title: 'Paw Targeting on Cue',
  objective: 'Teach the dog to lift one paw and place it in an open hand on a verbal "shake" cue, reliably and with a full paw placement.',
  durationMinutes: 7,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Ask the dog to sit. Hold a treat in your closed fist at the dog\'s chest height. Most dogs will first sniff, then paw at the fist to try to get the treat. The moment any paw lifts and touches your fist, say "yes!" open your fist and deliver the treat.',
      durationSeconds: null,
      reps: 8,
      tip: 'Do not lure the paw up — wait for the dog to offer it. Some dogs paw at things naturally; others are more nose-focused and need a few sessions before trying a paw. Patience here.',
      successLook: 'Dog lifts a front paw and makes contact with your closed fist.'
    },
    {
      order: 2,
      instruction: 'Once the dog is reliably pawing at the fist, transition to an open palm: hold your open palm flat at chest height, fingers pointing toward the dog. Wait. The moment they place any paw on your open palm, say "yes!" and treat with your other hand.',
      durationSeconds: null,
      reps: 7,
      tip: 'The open palm is the finished behavior position — like a handshake. Keep your palm still and low, not reaching toward the dog. Let them place their paw into your hand.',
      successLook: 'Dog places a front paw fully onto your open palm and holds briefly.'
    },
    {
      order: 3,
      instruction: 'Add the verbal cue "shake": as the dog begins lifting their paw (before it reaches your hand), say "shake" once. Mark and reward the placement. After 5 paired reps, present the open palm and say "shake" without prompting with the fist. Wait for the paw.',
      durationSeconds: null,
      reps: 5,
      tip: 'Add the cue word before the behavior completes, not after. The cue should predict the paw lift, not narrate it.',
      successLook: 'Dog hears "shake," lifts a front paw, and places it in your open palm.'
    }
  ],
  successCriteria: 'Dog places front paw in open palm within 3 seconds of "shake" cue, 15 out of 20 reps.',
  commonMistakes: [
    'Physically picking up the dog\'s paw — this teaches passive acceptance, not active offering',
    'Adding the verbal cue before the paw-to-palm behavior is reliable',
    'Holding the palm too high — it should be at the dog\'s natural elbow height',
    'Rewarding a paw hover (paw raised but not placed) — wait for full contact'
  ],
  equipmentNeeded: ['High-value treats', 'Treat pouch'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'shake_s2',
  trainerNote: 'Shake is the gateway trick. Dogs that have been taught to offer a paw on cue are more cooperative during nail trims, vet paw exams, and any handling of the lower legs. The trick has real-world cooperative care value beyond its charm as a party piece.',
  supportsLiveAiTrainer: true,
}

const shake_stage2: Protocol = {
  id: 'shake_s2',
  behavior: 'shake',
  stage: 2,
  title: 'Alternating Paws & Other Hand',
  objective: 'Generalize shake to both paws on cue and to any human\'s hand, including a stranger\'s.',
  durationMinutes: 8,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Once "shake" is reliable with one paw, teach "other paw": hold your other hand open. If the dog offers the same paw, gently move your hand slightly to the opposite side so the other paw is more naturally positioned to reach. Mark and jackpot the first time the other paw is offered.',
      durationSeconds: null,
      reps: 5,
      tip: 'Most dogs strongly prefer one paw. The "other paw" typically takes 2–3 sessions longer to reliably offer. Keep the criteria clear by presenting hands on distinct sides of the dog\'s body.',
      successLook: 'Dog alternates paws depending on which hand is presented and on which side.'
    },
    {
      order: 2,
      instruction: 'Practice differentiating the cues: say "shake" and present the right hand for the right paw, or say "other paw" (or "left") for the left. Alternate randomly across 10 reps. Mark only when the correct paw meets the cued hand.',
      durationSeconds: null,
      reps: 10,
      tip: 'Some owners use just one cue and let the hand position signal which paw. Others use two verbal cues. Either approach works — pick one and be consistent.',
      successLook: 'Dog responds correctly to 7 out of 10 alternating cues.'
    },
    {
      order: 3,
      instruction: 'Generalize to other people: have a helper sit in front of the dog, hold out an open palm, and say "shake." If the dog transfers the behavior to the helper\'s hand, jackpot. Practice with 3 different people. The goal: any person who holds out a palm and says "shake" gets a paw.',
      durationSeconds: null,
      reps: 5,
      tip: 'Stranger generalization is what makes shake genuinely impressive. A dog that shakes with anyone who asks is a socially charming dog. Practice with every willing visitor.',
      successLook: 'Dog places paw in a stranger\'s hand on "shake" cue on the first or second attempt.'
    }
  ],
  successCriteria: 'Dog correctly alternates paws on "shake" and "other paw" cues in 10 out of 15 trials. Shakes hands with at least 2 different people on first attempt.',
  commonMistakes: [
    'Presenting hands ambiguously in the center — position the hand clearly to one side for each paw',
    'Rushing to two paws before the first paw is completely reliable',
    'Not practicing with other people — generalization to strangers is the valuable skill',
    'Allowing the dog to paw repeatedly without marking — mark the first clean paw placement, not repeated attempts'
  ],
  equipmentNeeded: ['High-value treats', 'Willing helper or two'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'shake_s3',
  trainerNote: 'Shake is one of the behaviors most likely to be shown off to guests and strangers. It creates immediate positive interactions between the dog and new people, which builds the dog\'s social confidence and the owner\'s enjoyment of having a trained dog. Never underestimate the value of a crowd-pleasing behavior.',
  supportsLiveAiTrainer: true,
}

const shake_stage3: Protocol = {
  id: 'shake_s3',
  behavior: 'shake',
  stage: 3,
  title: 'Wave, High Five & Trick Chaining',
  objective: 'Build on the shake foundation to teach wave and high five, then chain shake + wave as a two-behavior trick sequence.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Teach "wave": hold your palm out for a shake, but as the dog lifts their paw, slowly pull your hand slightly away so they can\'t make contact. Their paw will hang in the air and wave slightly. Mark that waving motion with "yes!" and add the cue "wave." Do not let them shake — reward only the hang.',
      durationSeconds: null,
      reps: 5,
      tip: 'Wave is derived from shake by withholding the contact. The dog offers the paw, the hand moves away, the paw waves. Mark the wave immediately — do not wait for multiple waves.',
      successLook: 'Dog lifts paw and holds it in the air briefly when hand pulls away, making a wave-like motion.'
    },
    {
      order: 2,
      instruction: 'Teach "high five": hold your palm vertically (like a wall, fingers up) at nose height. Say "high five." When the dog lifts a paw and slaps or touches the vertical palm, mark and jackpot. This is naturally more energetic than shake — big paw contact earns a big reward.',
      durationSeconds: null,
      reps: 5,
      tip: 'High five is quicker and more enthusiastic than shake. Many dogs love it for the satisfying slap sensation. Use your most excited "yes!" for this one.',
      successLook: 'Dog makes firm palm contact with a vertical hand on "high five" cue.'
    },
    {
      order: 3,
      instruction: 'Chain shake + wave: ask for "shake" (paw placement → treat), then immediately say "wave" (paw hangs → treat). Practice the two-behavior chain 5 times. Then try asking for just "wave" without the shake warm-up. The wave should be available independently.',
      durationSeconds: null,
      reps: 5,
      tip: 'Behavior chains are powerful for mental engagement. The dog has to remember two separate cues in sequence. Keep sessions short — 5 chains maximum before the dog loses precision.',
      successLook: 'Dog performs shake followed by wave in sequence on consecutive cues with no additional prompting.'
    }
  ],
  successCriteria: 'Dog performs wave on "wave" cue independently in 10 out of 15 reps. Dog completes shake-then-wave chain in 8 out of 15 sequences.',
  commonMistakes: [
    'Letting the dog make contact during wave practice — pull the hand away before paw contact',
    'Mixing up the cues (asking for shake and rewarding wave, or vice versa) — be precise',
    'Chaining before each individual behavior is reliable on its own',
    'Practicing chains so long the dog starts guessing instead of listening — 5 reps maximum'
  ],
  equipmentNeeded: ['High-value treats', 'Treat pouch'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: null,
  trainerNote: 'Tricks like shake, wave, and high five are more than entertainment. They keep the dog\'s mind active, strengthen the training relationship, improve handler timing, and increase the dog\'s confidence in offering behaviors. Dogs that know tricks are dogs that have learned "trying things earns good things" — and that mindset makes every other behavior protocol easier.',
  supportsLiveAiTrainer: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// HEEL
// ─────────────────────────────────────────────────────────────────────────────

const heel_stage1: Protocol = {
  id: 'heel_s1',
  behavior: 'heel',
  stage: 1,
  title: 'Heel Position: Building the Pocket',
  objective: 'Teach the dog to find and hold the heel position — left hip, facing forward — and understand that this position earns continuous reinforcement.',
  durationMinutes: 8,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Stand still. Hold a treat at your left hip, fingers pointing down. Let the dog sniff it. When the dog is standing at your left side with their shoulder roughly aligned with your leg, say "yes!" and deliver the treat from that exact hip position. Repeat 8 times.',
      durationSeconds: null,
      reps: 8,
      tip: 'The treat is delivered at your left hip every single time. You are building the dog\'s understanding that the reward zone lives at your left hip. The dog will start gravitating to that spot.',
      successLook: 'Dog stands at your left side, head near your hip, receiving the treat from hip height.'
    },
    {
      order: 2,
      instruction: 'Take 2 steps forward. Stop. Dog should follow and end up at your left hip. If they do, mark "yes!" and treat at your hip. If they end up in front or behind, take another step to reposition yourself next to them and treat from the hip. Repeat 8 times.',
      durationSeconds: null,
      reps: 8,
      tip: 'You are moving to the dog as much as the dog is moving to you at this stage. That is fine — you are establishing the geometry of the position, not walking yet.',
      successLook: 'Dog finishes at your left hip after 2 steps with their head near your leg.'
    },
    {
      order: 3,
      instruction: 'Add the verbal cue "heel": say it as the dog is moving into position at your hip — just before they arrive. Over 5 reps, the word becomes associated with the position. Test: say "heel" from a standing position and wait for the dog to move to your left hip.',
      durationSeconds: null,
      reps: 5,
      tip: '"Heel" means a very specific thing: left side, shoulder at your hip, facing forward, matching your pace. It is not "walk near me." Keep the definition precise from the start.',
      successLook: 'Dog hears "heel" and moves to the left-hip position without being lured.'
    }
  ],
  successCriteria: 'Dog moves to heel position (left hip, facing forward) on "heel" cue within 3 seconds, 15 out of 20 reps, while handler is standing still.',
  commonMistakes: [
    'Delivering the treat in front of the body — the treat must always come from the hip to build correct position',
    'Accepting a heel position that is too far forward (dog in front of leg) or too far back (dog trailing)',
    'Adding movement before the position itself is solid and reliable',
    'Using "heel" to mean any version of walking near you — the position is specific'
  ],
  equipmentNeeded: ['High-value treats', 'Treat pouch worn on the left hip', 'Flat collar or front-clip harness', '6-foot leash'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'heel_s2',
  trainerNote: 'Heel is a precision behavior, not a loose leash behavior. Loose leash walking allows the dog anywhere within leash range without pulling. Heel means exactly: left side, shoulder at your hip. These are two different behaviors for two different situations. Build heel separately — do not confuse the dog by mixing the two.',
  supportsLiveAiTrainer: true,
}

const heel_stage2: Protocol = {
  id: 'heel_s2',
  behavior: 'heel',
  stage: 2,
  title: 'Heeling in Motion: Pace, Turns & Stops',
  objective: 'Build heeling in motion — the dog maintains the heel position through pace changes, left turns, right turns, and halts.',
  durationMinutes: 10,
  repCount: 12,
  steps: [
    {
      order: 1,
      instruction: 'Begin walking forward from the heel position. Take 3 steps, stop, mark "yes!" and treat at your hip if the dog is still in position. Build from 3 steps to 10 steps over 6 reps. Any time the dog drifts out of position, stop, reset by asking for heel, and restart.',
      durationSeconds: null,
      reps: 6,
      tip: 'Short, rewarded segments are more effective than long, unrewarded ones. 5 reps of 5-step heeling with treats is worth more than one long walk with no feedback.',
      successLook: 'Dog maintains shoulder-at-hip position through 10 steps, stops when handler stops.'
    },
    {
      order: 2,
      instruction: 'Add pace changes: walk at normal pace for 5 steps, then suddenly walk faster. Dog must speed up with you. Then slow to a very slow walk. Dog must slow down. Mark "yes!" at each pace change when the dog adjusts correctly. Do 5 reps of each pace change.',
      durationSeconds: null,
      reps: 5,
      tip: 'Pace changes are one of the best ways to keep the dog\'s attention during heel. An unpredictable handler is an interesting handler. The dog has to watch you rather than going on autopilot.',
      successLook: 'Dog matches your pace immediately when you speed up or slow down, staying at your hip.'
    },
    {
      order: 3,
      instruction: 'Add turns: right turns (dog needs to give you space and stay close), left turns (dog needs to move their rear to stay in position — the harder direction), and about-turns (U-turn, your most powerful engagement tool). Mark and treat any turn completed with the dog still in heel position.',
      durationSeconds: null,
      reps: 5,
      tip: 'Left turns are the hardest — you are turning into the dog. Many dogs get stepped on during left turns, which teaches them to drift away. Use small, deliberate left turns and treat generously when the dog successfully adjusts.',
      successLook: 'Dog completes a right turn, left turn, and about-turn in heel position without drifting.'
    }
  ],
  successCriteria: 'Dog maintains heel position through 20 consecutive steps with one pace change and one turn, 8 out of 12 repetitions.',
  commonMistakes: [
    'Trying to heel for too many steps without rewarding — keep sessions short and highly reinforced',
    'Letting the dog drift out of position and continuing to walk — stop, reset, restart',
    'Skipping pace changes — pace variation is the primary attentional tool for heel',
    'Practicing left turns without specific attention to protecting the dog from being stepped on'
  ],
  equipmentNeeded: ['High-value treats', 'Treat pouch on left hip', 'Flat collar or front-clip harness', 'Quiet space with room to walk'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: 'heel_s3',
  trainerNote: 'Heeling is a physical conversation between dog and handler. The dog watches you for pace changes and turns; you reward them for tracking you. When it works, it feels effortless and elegant — handler and dog moving as one unit. That feeling is achievable for any dog with consistent, short, rewarded sessions.',
  supportsLiveAiTrainer: true,
}

const heel_stage3: Protocol = {
  id: 'heel_s3',
  behavior: 'heel',
  stage: 3,
  title: 'Proofed Heel: Distance, Duration & Distractions',
  objective: 'Build a heel that holds for 2 minutes of continuous heeling and remains accurate in outdoor environments with real-world distractions.',
  durationMinutes: 12,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Build duration: start at 10 consecutive steps of heel and reward. Add 5 steps per session over 5 sessions. Goal: 60 continuous steps (approximately 1 minute of walking) in heel with treats delivered every 15 steps. Use variable reinforcement — sometimes 10 steps, sometimes 20, sometimes 30.',
      durationSeconds: null,
      reps: 5,
      tip: 'Variable reinforcement means the dog never knows when the next treat is coming. This is the schedule that creates the most persistent behavior. A dog that is sometimes treated at 5 steps and sometimes at 25 steps will keep heeling longer than one always treated at 10.',
      successLook: 'Dog heels continuously for 60 steps, receiving treats every 15–20 steps, never breaking position.'
    },
    {
      order: 2,
      instruction: 'Take heel outdoors: practice in the driveway, then a quiet sidewalk. Expect regression — the outdoor environment is more distracting. Return to 5-step segments with frequent treats. Rebuild distance over 3 outdoor sessions. Use your most excited praise when the dog checks in during outdoor heel.',
      durationSeconds: null,
      reps: 5,
      tip: 'Outdoor heel requires higher-value treats than indoor heel. The competition (smells, movement, sounds) is real. Match the reward value to the difficulty.',
      successLook: 'Dog holds heel for 20 consecutive steps outdoors on a quiet street.'
    },
    {
      order: 3,
      instruction: 'Proof with a parallel distraction: have a helper walk on the opposite side of the street in the same direction while you heel your dog. Dog must maintain heel position as the other person walks nearby. Build to: helper 10 feet away, helper with a dog, helper moving erratically.',
      durationSeconds: null,
      reps: 3,
      tip: 'A person walking alongside at a distance is the most common real-world heel challenge. Dogs that can maintain heel with a person nearby can navigate any crowded sidewalk.',
      successLook: 'Dog maintains heel position for 20 steps while another person walks 10 feet away on the same street.'
    },
    {
      order: 4,
      instruction: 'Practice the "heel start": from a stationary position with the dog sitting at heel, say "heel" and step off with your left foot. The dog should step off with you simultaneously. The left-foot start is the traditional heel cue — stepping off left predicts movement, stepping off right means "stay."',
      durationSeconds: null,
      reps: 3,
      tip: 'Left foot = move with me. Right foot = stay. This foot-signal system is used in formal obedience and is enormously useful in everyday life. Build it as a habit from the beginning.',
      successLook: 'Dog steps off simultaneously with handler\'s left foot from a sitting heel position.'
    }
  ],
  successCriteria: 'Dog heels continuously for 60 steps indoors. Maintains heel for 20 steps outdoors with a person walking 10 feet away, 7 out of 10 trials.',
  commonMistakes: [
    'Adding duration and outdoor environments in the same session — add one challenge at a time',
    'Not treating frequently enough outdoors — outdoor heel requires more reinforcement density',
    'Continuing to walk while the dog is out of heel position — stop, reset, restart always',
    'Expecting competition-level heel precision from a pet dog — practical, attentive heeling is the goal'
  ],
  equipmentNeeded: ['Treat pouch on left hip', 'High-value treats', 'Flat collar or front-clip harness', '6-foot leash', 'Open outdoor space'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 4,
  nextProtocolId: null,
  trainerNote: 'A dog that can heel reliably in a distracting outdoor environment is a dog that can navigate the world with grace. Heel is not just a competition skill — it is the behavior that lets you walk your dog safely through crowds, past other dogs, and in any tight environment where a loose-walking dog would be difficult. It is worth every repetition.',
  supportsLiveAiTrainer: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export const PROTOCOLS: Protocol[] = [
  // Loose leash walking
  llw_stage1, llw_stage2, llw_stage3,
  // Recall
  recall_stage1, recall_stage2, recall_stage3,
  // Jumping up
  jumping_stage1, jumping_stage2, jumping_stage3,
  // Potty training
  potty_stage1, potty_stage2, potty_stage3,
  // Crate anxiety
  crate_stage1, crate_stage2, crate_stage3,
  // Puppy biting
  biting_stage1, biting_stage2, biting_stage3,
  // Settling / place
  settle_stage1, settle_stage2, settle_stage3,
  // Leave it / drop it
  leave_it_stage1, leave_it_stage2, leave_it_stage3,
  // Basic obedience
  obedience_stage1, obedience_stage2, obedience_stage3,
  // Barking
  barking_stage1, barking_stage2, barking_stage3,
  // Separation anxiety
  separation_stage1, separation_stage2, separation_stage3,
  // Door manners
  door_manners_stage1, door_manners_stage2, door_manners_stage3,
  // Impulse control
  impulse_control_stage1, impulse_control_stage2, impulse_control_stage3,
  // Cooperative care
  coop_care_stage1, coop_care_stage2, coop_care_stage3,
  // Wait & stay
  wait_stay_stage1, wait_stay_stage2, wait_stay_stage3,
  // Leash reactivity
  reactivity_stage1, reactivity_stage2, reactivity_stage3,
  // Sit
  sit_stage1, sit_stage2, sit_stage3,
  // Down
  down_stage1, down_stage2, down_stage3,
  // Shake
  shake_stage1, shake_stage2, shake_stage3,
  // Heel
  heel_stage1, heel_stage2, heel_stage3,
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
  // Barking
  bk_01: 'barking_s1', bk_02: 'barking_s1', bk_03: 'barking_s2',
  bk_04: 'barking_s2', bk_05: 'barking_s3', bk_06: 'barking_s3',
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
  // Leave it
  li_01: 'leave_it_s1', li_02: 'leave_it_s1', li_03: 'leave_it_s2',
  li_04: 'leave_it_s2', li_05: 'leave_it_s3', li_06: 'leave_it_s3',
  // Basic obedience
  ob_01: 'obedience_s1', ob_02: 'obedience_s1', ob_03: 'obedience_s2',
  ob_04: 'obedience_s2', ob_05: 'obedience_s3', ob_06: 'obedience_s3',
  // Separation anxiety
  sa_01: 'separation_s1', sa_02: 'separation_s1', sa_03: 'separation_s2',
  sa_04: 'separation_s2', sa_05: 'separation_s3', sa_06: 'separation_s3',
  // Door manners
  dm_01: 'door_manners_s1', dm_02: 'door_manners_s1', dm_03: 'door_manners_s2',
  dm_04: 'door_manners_s2', dm_05: 'door_manners_s3', dm_06: 'door_manners_s3',
  // Impulse control
  ic_01: 'impulse_s1', ic_02: 'impulse_s1', ic_03: 'impulse_s2',
  ic_04: 'impulse_s2', ic_05: 'impulse_s3', ic_06: 'impulse_s3',
  // Cooperative care
  cc_01: 'coop_care_s1', cc_02: 'coop_care_s1', cc_03: 'coop_care_s2',
  cc_04: 'coop_care_s2', cc_05: 'coop_care_s3', cc_06: 'coop_care_s3',
  // Wait & stay
  ws_01: 'wait_stay_s1', ws_02: 'wait_stay_s1', ws_03: 'wait_stay_s2',
  ws_04: 'wait_stay_s2', ws_05: 'wait_stay_s3', ws_06: 'wait_stay_s3',
  // Leash reactivity
  lr_01: 'reactivity_s1', lr_02: 'reactivity_s1', lr_03: 'reactivity_s2',
  lr_04: 'reactivity_s2', lr_05: 'reactivity_s3', lr_06: 'reactivity_s3',
  // Sit
  si_01: 'sit_s1', si_02: 'sit_s1', si_03: 'sit_s2',
  si_04: 'sit_s2', si_05: 'sit_s3', si_06: 'sit_s3',
  // Down
  dn_01: 'down_s1', dn_02: 'down_s1', dn_03: 'down_s2',
  dn_04: 'down_s2', dn_05: 'down_s3', dn_06: 'down_s3',
  // Shake
  sh_01: 'shake_s1', sh_02: 'shake_s1', sh_03: 'shake_s2',
  sh_04: 'shake_s2', sh_05: 'shake_s3', sh_06: 'shake_s3',
  // Heel
  hl_01: 'heel_s1', hl_02: 'heel_s1', hl_03: 'heel_s2',
  hl_04: 'heel_s2', hl_05: 'heel_s3', hl_06: 'heel_s3',
}
