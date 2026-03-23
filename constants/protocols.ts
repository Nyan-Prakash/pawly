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
  objective: 'Teach your dog to respond to their name and offer eye contact while standing still at your side.',
  durationMinutes: 8,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Stand still in a low-distraction room with your dog on leash. Let the leash hang completely slack.',
      durationSeconds: null,
      reps: null,
      tip: 'If your dog pulls at any point, simply wait — do not move forward.',
      successLook: 'Dog stands near you, leash loose.'
    },
    {
      order: 2,
      instruction: 'Say your dog\'s name once. The moment they look at you, mark "yes!" and deliver a treat at your hip. Do 10 reps.',
      durationSeconds: null,
      reps: 10,
      tip: 'Say the name once and wait up to 10 seconds — repeating it teaches them to ignore it.',
      successLook: 'Dog turns toward you within 3 seconds of hearing their name.'
    },
    {
      order: 3,
      instruction: 'After 5 good name responses, wait for direct eye contact before marking. Treat at your hip every time.',
      durationSeconds: null,
      reps: 10,
      tip: 'Treat at your hip, not in front of you — the reward zone is beside your leg.',
      successLook: 'Dog looks up at your face, not just toward you.'
    },
    {
      order: 4,
      instruction: 'Take 2–3 steps, stop, say your dog\'s name, wait for eye contact, mark and treat. Do 5 reps.',
      durationSeconds: null,
      reps: 5,
      tip: 'You are waiting for the dog to choose to check in — not luring them.',
      successLook: 'Dog checks in within 5 seconds of you stopping.'
    },
    {
      order: 5,
      instruction: 'End the session with a 60-second free sniff break.',
      durationSeconds: 60,
      reps: null,
      tip: 'The sniff break is a reward, not downtime — it makes the structured portions more tolerable.',
      successLook: 'Dog is relaxed and engaged throughout session.'
    }
  ],
  successCriteria: 'Dog responds to name with eye contact 8 out of 10 attempts in a low-distraction environment.',
  commonMistakes: [
    'Repeating the dog\'s name — say it once and wait',
    'Giving the treat in front of your body instead of at your hip',
    'Moving too fast before the name response is solid',
    'Practicing when the dog is over-excited or under-stimulated'
  ],
  equipmentNeeded: ['4–6 foot flat leash', 'High-value treats (chicken, cheese, hot dog)'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'llw_s2',
  trainerNote: 'This looks boring but it is the single most important foundation for leash manners. Spend at least 3 sessions here before advancing.',
  supportsLiveAiTrainer: false,
}

const llw_stage2: Protocol = {
  id: 'llw_s2',
  behavior: 'leash_pulling',
  stage: 2,
  title: 'Stop-and-Wait: Tension Off, Forward On',
  objective: 'Teach your dog that leash tension makes you stop and leash slack makes you move.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Start walking in a low-traffic area with your dog on a 4–6 foot leash, one hand near your hip, one at the end.',
      durationSeconds: null,
      reps: null,
      tip: 'You will stop and start frequently — that is exactly what this exercise is supposed to feel like.',
      successLook: 'You are moving, dog is at your side.'
    },
    {
      order: 2,
      instruction: 'The moment the leash goes taut, stop completely. Say nothing, do nothing — just freeze.',
      durationSeconds: null,
      reps: null,
      tip: 'The stop must happen the instant you feel tension — not a few steps later.',
      successLook: 'You are frozen, leash is tight, dog notices something changed.'
    },
    {
      order: 3,
      instruction: 'Wait for the dog to create any slack — a step back, a turn toward you. The instant there is slack, say "yes!" and walk forward.',
      durationSeconds: null,
      reps: null,
      tip: 'Forward movement is the reward. Only treat every 3rd–4th successful slack moment.',
      successLook: 'Dog takes a step toward you, leash goes slack.'
    },
    {
      order: 4,
      instruction: 'Repeat the walk → tension → stop → slack → forward cycle 15 times.',
      durationSeconds: null,
      reps: 15,
      tip: 'Use a quiet street or parking lot — not a route with heavy smells or distractions.',
      successLook: 'Dog begins self-correcting before you fully stop.'
    },
    {
      order: 5,
      instruction: 'After 10 successful reps, add treat scatters: every 20–30 steps of loose leash, toss 3 tiny treats near your feet.',
      durationSeconds: null,
      reps: null,
      tip: 'Scatter near your feet, not ahead of you — the dog should come back to your zone to collect.',
      successLook: 'Dog walks beside you with the leash in a J-shape.'
    }
  ],
  successCriteria: 'Dog self-corrects by releasing tension within 5 seconds of you stopping, 10 out of 15 repetitions.',
  commonMistakes: [
    'Stopping too late — the stop must happen the instant tension starts',
    'Saying the dog\'s name or "no" when they pull — silence is correct',
    'Walking forward with a tight leash — this rewards the pull',
    'Practicing on a route too interesting for the dog\'s skill level'
  ],
  equipmentNeeded: ['4–6 foot flat leash', 'Front-clip harness or flat collar (no retractable)', 'High-value treats'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'llw_s3',
  trainerNote: 'Most owners see improvement within 3–5 sessions. The critical variable is consistency — every person in the household must follow the same rule every single walk.',
  supportsLiveAiTrainer: false,
}

const llw_stage3: Protocol = {
  id: 'llw_s3',
  behavior: 'leash_pulling',
  stage: 3,
  title: 'Direction Changes & Real-World Engagement',
  objective: 'Proof loose leash walking with unexpected direction changes and mild outdoor distractions.',
  durationMinutes: 12,
  repCount: 12,
  steps: [
    {
      order: 1,
      instruction: 'When your dog moves slightly ahead, make a sudden, cheerful U-turn and say "this way!" Walk briskly in the new direction.',
      durationSeconds: null,
      reps: null,
      tip: 'Be energetic on the turn — your body language should signal that something exciting just happened.',
      successLook: 'Dog trots to catch up, checking in as they reach your side.'
    },
    {
      order: 2,
      instruction: 'When the dog catches up beside you with a loose leash, mark "yes!" and treat at your hip.',
      durationSeconds: null,
      reps: null,
      tip: 'The moment the dog reaches your hip is the exact moment to reward — not before, not after.',
      successLook: 'Leash in J-shape, dog at hip level.'
    },
    {
      order: 3,
      instruction: 'Do at least 12 unpredictable direction changes — left, right, U-turn, slow, fast — in a 10-minute walk.',
      durationSeconds: null,
      reps: 12,
      tip: 'Unpredictability makes you more interesting than the environment — the dog has to watch you.',
      successLook: 'Dog glances at you frequently, anticipating the next change.'
    },
    {
      order: 4,
      instruction: 'Approach one mild distraction (a parked car, hedge, trash bin) at the dog\'s threshold distance. Do 3 direction changes near it.',
      durationSeconds: null,
      reps: 3,
      tip: 'If the dog lunges or fixates, back up 5 steps — you are over threshold.',
      successLook: 'Dog notices the distraction, glances at it, then checks back with you.'
    },
    {
      order: 5,
      instruction: 'Finish with a 2-minute free sniff break — drop all criteria and let the dog sniff freely.',
      durationSeconds: 120,
      reps: null,
      tip: 'The free sniff is not optional — it reduces frustration and makes the structured portions more sustainable.',
      successLook: 'Dog relaxed, sniffing freely.'
    }
  ],
  successCriteria: 'Dog responds to 10 of 12 direction changes by catching up and checking in. Can walk past one mild distraction with a loose leash.',
  commonMistakes: [
    'Turning too slowly — the change must be sudden and cheerful',
    'Not rewarding the catch-up moment — that is the golden rep',
    'Skipping the free sniff at the end',
    'Advancing to busy environments too quickly'
  ],
  equipmentNeeded: ['4–6 foot flat leash', 'Front-clip harness', 'High-value treats', 'Treat pouch'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'By Stage 3 your dog should walk nicely on quiet streets. Busy streets and other dogs are a separate advanced module — do not rush there.',
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
  objective: 'Build a rock-solid, automatic response to the dog\'s name at close range in a distraction-free environment.',
  durationMinutes: 8,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Prepare 20 tiny high-value treats. Sit on the floor in a quiet room with your dog nearby but not looking at you.',
      durationSeconds: null,
      reps: null,
      tip: 'Sitting on the floor puts you at the dog\'s level and makes you naturally more inviting.',
      successLook: 'Dog is calm and nearby, attention elsewhere.'
    },
    {
      order: 2,
      instruction: 'Say your dog\'s name once. The instant they glance at you, say "yes!" and toss a treat toward you so they take a step in your direction. Do 10 reps.',
      durationSeconds: null,
      reps: 10,
      tip: 'Toss the treat toward yourself — this begins the muscle memory of "name = move toward the human."',
      successLook: 'Dog orients toward you immediately when their name is called.'
    },
    {
      order: 3,
      instruction: 'After 10 reps, wait 2–3 seconds after the name response before treating to build brief eye contact duration.',
      durationSeconds: null,
      reps: 5,
      tip: 'Even one extra second of held eye contact is worth marking — you\'re building a habit, not a performance.',
      successLook: 'Dog holds eye contact for 2 seconds.'
    },
    {
      order: 4,
      instruction: 'Stand up, move across the room, call the name, and pat your legs excitedly as they walk toward you. Give a jackpot of 3–4 treats on arrival.',
      durationSeconds: null,
      reps: 5,
      tip: 'The jackpot teaches the dog that physically coming to you after name response is the most valuable thing.',
      successLook: 'Dog trots across the room to reach you.'
    }
  ],
  successCriteria: 'Dog looks at handler and begins moving toward them within 2 seconds of name, 9 out of 10 trials indoors.',
  commonMistakes: [
    'Calling the name too often — it becomes background noise',
    'Calling the name before something the dog dislikes (bath, nail trim)',
    'Rewarding a slow response the same as a fast one',
    'Practicing when the dog is asleep or deeply distracted'
  ],
  equipmentNeeded: ['High-value treats (chicken, freeze-dried liver)', 'Quiet indoor space'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'recall_s2',
  trainerNote: 'Never call your dog\'s name to do something they dislike until the recall is bombproof. Protect this cue — every poisoned rep costs you five good ones to recover.',
  supportsLiveAiTrainer: true,
}

const recall_stage2: Protocol = {
  id: 'recall_s2',
  behavior: 'recall',
  stage: 2,
  title: 'Recall with Light Distraction Indoors',
  objective: 'Proof the recall cue with mild distractions and increase distance to 15–20 feet inside the home.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Introduce your recall cue word — "here," "come," or a whistle. Always pair it with the name first: "[Name], come!" Say it once.',
      durationSeconds: null,
      reps: null,
      tip: 'The name grabs attention; the cue means "run to me." Keep them paired for now.',
      successLook: 'Dog looks up immediately at their name before "come."'
    },
    {
      order: 2,
      instruction: 'Practice from different rooms — call from the kitchen while the dog is in the living room, from upstairs, etc. Each successful recall earns a jackpot of 3–4 treats at your feet. Do 8 reps.',
      durationSeconds: null,
      reps: 8,
      tip: 'Varying your location teaches the dog that "come" works everywhere, not just when you\'re facing them.',
      successLook: 'Dog comes running from another room within 5 seconds.'
    },
    {
      order: 3,
      instruction: 'Add mild distraction: turn on the TV and scatter some kibble on the floor. Let the dog sniff for 10 seconds, then call. If no response in 5 seconds, clap and run the opposite direction.',
      durationSeconds: null,
      reps: 5,
      tip: 'Running away from the dog is one of the strongest recall tools — dogs instinctively chase movement.',
      successLook: 'Dog leaves the kibble and comes to you when called.'
    },
    {
      order: 4,
      instruction: 'Crouch down, open your arms, and call "come!" enthusiastically when the dog is 15+ feet away. Deliver a full handful of treats and verbal praise on arrival.',
      durationSeconds: null,
      reps: 2,
      tip: 'The arrival celebration determines how fast they run next time — make it worth sprinting for.',
      successLook: 'Dog sprints toward you and pushes into your hands for treats.'
    }
  ],
  successCriteria: 'Dog recalls from another room and away from mild distraction (kibble on floor, TV on) 8 out of 10 times.',
  commonMistakes: [
    'Calling "come" when you cannot follow through — only call when you can guarantee success',
    'Punishing a slow recall — always reward every recall, no matter how long it took',
    'Too many reps in one session — quality over quantity',
    'Not varying locations enough'
  ],
  equipmentNeeded: ['High-value treats', 'Indoor space with mild distractions'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'recall_s3',
  trainerNote: 'Do a minimum of 10 indoor sessions before attempting outdoor recall — the cue needs to be emotionally charged before the real world competes with it.',
  supportsLiveAiTrainer: true,
}

const recall_stage3: Protocol = {
  id: 'recall_s3',
  behavior: 'recall',
  stage: 3,
  title: 'Recall in Low-Distraction Outdoor Environments',
  objective: 'Transfer the recall cue to a controlled outdoor environment on a long line.',
  durationMinutes: 12,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Clip a 15–20 foot long line to a harness. Go to a quiet outdoor space and give the dog 3 minutes to sniff and decompress before any training.',
      durationSeconds: 180,
      reps: null,
      tip: 'The long line is a safety net, not a tool for pulling the dog to you — never reel it in.',
      successLook: 'Dog is relaxed and sniffing, not anxious or over-excited.'
    },
    {
      order: 2,
      instruction: 'When the dog is 10–15 feet away and mildly engaged, call their name then your recall cue. If no response in 3 seconds, clap and turn and run away.',
      durationSeconds: null,
      reps: 5,
      tip: 'If the dog is deeply fixated on something, do not call — move closer first.',
      successLook: 'Dog disengages and trots toward you.'
    },
    {
      order: 3,
      instruction: 'When the dog arrives, deliver 5+ treats one at a time while praising for a full 10 seconds.',
      durationSeconds: 10,
      reps: null,
      tip: 'Outdoor arrivals need bigger celebrations than indoor ones — the competition is stronger.',
      successLook: 'Dog presses into you, tail wagging, staying close for treats.'
    },
    {
      order: 4,
      instruction: 'After treating, release with "go sniff!" and let the dog return to exploring. Repeat 4 more times.',
      durationSeconds: null,
      reps: 4,
      tip: 'Recall then freedom teaches the dog that coming to you does not always mean the fun ends.',
      successLook: 'Dog comes readily on subsequent recalls without avoidance.'
    },
    {
      order: 5,
      instruction: 'End before the dog loses interest. Always finish on a successful rep.',
      durationSeconds: null,
      reps: null,
      tip: 'The last rep is the one they remember most — make it a win.',
      successLook: 'Final recall is as fast as the first.'
    }
  ],
  successCriteria: 'Dog recalls outdoors on a long line from 15 feet in a low-distraction environment, 8 out of 10 trials.',
  commonMistakes: [
    'Going off-leash before long-line recall is reliable at 20+ feet',
    'Only recalling to end the walk or go home',
    'Under-rewarding outdoor recalls',
    'Using the long line to drag the dog toward you'
  ],
  equipmentNeeded: ['15–20 foot long line', 'Back-clip harness', 'High-value treats', 'Treat pouch'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'True off-leash recall in unfenced areas takes 6–12 months. This stage builds the foundation safely. Only go off-leash in fully enclosed areas.',
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
  objective: 'Teach the dog that four paws on the floor earns attention, pets, and treats — jumping earns nothing.',
  durationMinutes: 8,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Stand with treats at your chest. The moment any paw leaves the floor to jump, turn your back and fold your arms. Say nothing.',
      durationSeconds: null,
      reps: null,
      tip: 'No verbal response at all — even "no" is attention and can reinforce jumping.',
      successLook: 'Dog\'s four paws hit the floor after you turn away.'
    },
    {
      order: 2,
      instruction: 'The instant all four paws are on the floor, turn back, crouch down, and deliver a treat with calm praise.',
      durationSeconds: null,
      reps: null,
      tip: 'Keep your energy at 50% — excitement triggers another jump cycle.',
      successLook: 'Dog receives treat while standing calmly on all fours.'
    },
    {
      order: 3,
      instruction: 'Repeat 20 times. Goal: the dog starts approaching with all four paws on the floor instead of jumping first.',
      durationSeconds: null,
      reps: 20,
      tip: 'Every person in the household must follow identical rules — one person who allows jumping undoes weeks of work.',
      successLook: 'Dog approaches and looks up expectantly without leaving the floor.'
    },
    {
      order: 4,
      instruction: 'For the last 5 reps, wait 3 seconds of four-paws contact before marking and treating.',
      durationSeconds: null,
      reps: 5,
      tip: 'Count silently to three before marking — you are building duration, not just a brief touch-and-go.',
      successLook: 'Dog waits calmly on all fours for 3 seconds before the treat arrives.'
    }
  ],
  successCriteria: 'Dog approaches handler with four paws on floor (no jumping) in 15 out of 20 reps in a calm indoor environment.',
  commonMistakes: [
    'Pushing the dog off — physical contact reinforces jumping for attention-seeking dogs',
    'Kneeing the dog — creates anxiety without teaching the alternative',
    'Inconsistency between family members',
    'Allowing brief jumps ("just one is fine")'
  ],
  equipmentNeeded: ['High-value treats'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'jumping_s2',
  trainerNote: 'This fails most often because one household member allows the jumping. Address this directly before starting — universal buy-in is non-negotiable.',
  supportsLiveAiTrainer: true,
}

const jumping_stage2: Protocol = {
  id: 'jumping_s2',
  behavior: 'jumping_up',
  stage: 2,
  title: 'Auto-Sit for Greeting',
  objective: 'Teach the dog to automatically offer a sit whenever a person approaches.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Drill the sit cue for 3 minutes until the dog sits within 2 seconds, 9 out of 10 times.',
      durationSeconds: 180,
      reps: 10,
      tip: 'If the sit is shaky, fix it here before adding the approach challenge.',
      successLook: 'Dog sits within 2 seconds of cue, 9 out of 10 times.'
    },
    {
      order: 2,
      instruction: 'Stand 5 feet from your dog and walk toward them. If they sit without being cued, say "yes!" and drop a treat between their front paws.',
      durationSeconds: null,
      reps: null,
      tip: 'Drop the treat between the paws — overhead delivery encourages jumping.',
      successLook: 'Dog holds sit as you approach, nose reaching down for the treat.'
    },
    {
      order: 3,
      instruction: 'If the dog jumps on your approach, turn your back immediately. Wait for a sit, then approach again — more slowly this time.',
      durationSeconds: null,
      reps: null,
      tip: 'Reduce your approach speed or try approaching from the side — your energy is triggering the jump.',
      successLook: 'Dog holds a sit during a calm, slow approach.'
    },
    {
      order: 4,
      instruction: 'Gradually increase approach energy over 10 reps: walk → walk fast → jog → reach toward them. Each successful sit earns a treat between the paws.',
      durationSeconds: null,
      reps: 10,
      tip: 'Each energy increase is a new level of difficulty — if the dog fails, drop back one level.',
      successLook: 'Dog holds sit even when you\'re jogging and reaching toward them.'
    },
    {
      order: 5,
      instruction: 'Doorbell drill: knock on the wall or have someone ring the bell, cue sit, then open the door to a calm helper who drops a treat for the sitting dog. Do 5 reps.',
      durationSeconds: null,
      reps: 5,
      tip: 'Practice this 2–3 times before real visitors arrive — the habit needs to exist before the adrenaline does.',
      successLook: 'Dog holds sit when door opens to helper.'
    }
  ],
  successCriteria: 'Dog auto-sits in 12 out of 15 greeting trials without verbal cue when a person calmly approaches.',
  commonMistakes: [
    'Only practicing with family — the dog needs rehearsal with helpers and strangers',
    'Skipping treat-between-paws — overhead delivery breaks the sit',
    'Over-exciting the dog during practice',
    'Skipping doorbell drills before real visitors'
  ],
  equipmentNeeded: ['High-value treats', 'Optional: training partner'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'jumping_s3',
  trainerNote: 'The auto-sit is one of the most practical behaviors you can teach. A dog that automatically sits for greetings needs no management — they manage themselves.',
  supportsLiveAiTrainer: true,
}

const jumping_stage3: Protocol = {
  id: 'jumping_s3',
  behavior: 'jumping_up',
  stage: 3,
  title: 'Calm Greeting with Strangers',
  objective: 'Generalize four-paws-on-floor and auto-sit to greetings with unfamiliar people in real-world contexts.',
  durationMinutes: 12,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Brief a helper (neighbor, friend unfamiliar to your dog): "Ignore any jumping and turn away. The moment my dog sits, drop this treat and calmly pet them." Give them 5 treats.',
      durationSeconds: null,
      reps: null,
      tip: 'An unprepared helper who greets a jumping dog is the most common reason this protocol fails.',
      successLook: 'Helper understands the protocol and remains calm and neutral.'
    },
    {
      order: 2,
      instruction: 'Put your dog on a short leash. Have the helper approach from 20 feet. Cue sit at 10 feet. If the dog sits, the helper approaches, drops a treat, and pets them calmly. If the dog jumps, helper turns away.',
      durationSeconds: null,
      reps: 5,
      tip: 'Keep the leash loose — it is a safety backup, not a restraint.',
      successLook: 'Dog holds sit while the stranger approaches and pets them.'
    },
    {
      order: 3,
      instruction: 'Once 5 calm approaches are solid, raise the challenge: have the helper be more enthusiastic ("Oh, what a cute dog!") and reach out more eagerly.',
      durationSeconds: null,
      reps: 3,
      tip: 'This step often causes regression — be ready to drop back to Step 2.',
      successLook: 'Dog stays on all four paws or sits when the helper is excited.'
    },
    {
      order: 4,
      instruction: 'Practice in a new environment: a sidewalk, pet-friendly store, or park. Start easy — the new context will feel like starting over.',
      durationSeconds: null,
      reps: 2,
      tip: 'New environment = start at Step 1 difficulty. The behavior generalizes faster each time.',
      successLook: 'Dog holds greeting behavior in at least one novel outdoor setting.'
    }
  ],
  successCriteria: 'Dog greets unfamiliar person with four paws on floor (or auto-sit) in 8 out of 10 real-world greeting trials.',
  commonMistakes: [
    'Skipping the helper briefing',
    'Practicing at peak excitement (just woken up, first person through the door)',
    'Too tight a leash during jumps',
    'Expecting perfection — this takes weeks of real-world reps'
  ],
  equipmentNeeded: ['Short leash (3–4 feet)', 'Treats for the helper', 'Willing helper'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'Real-world generalization requires dozens of rehearsed interactions. Carry treats on every walk for 4 weeks and ask strangers to participate — the reps compound quickly.',
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
  objective: 'Establish a consistent potty schedule and a powerful reward system so the dog learns outdoor elimination = jackpot.',
  durationMinutes: 5,
  repCount: 8,
  steps: [
    {
      order: 1,
      instruction: 'Write your dog\'s potty schedule and post it somewhere visible. Set phone alarms. Puppies under 4 months: every 1–2 hours. 4–6 months: every 2–3 hours. Adults in training: every 3 hours. Always add: after waking, 15 minutes after eating, and after play.',
      durationSeconds: null,
      reps: null,
      tip: 'Follow the schedule even when nothing happens — the routine itself is the training.',
      successLook: 'Schedule is written and alarms are set.'
    },
    {
      order: 2,
      instruction: 'At each trip, leash the dog and take them to the same spot via the same route. Stand still and silent for up to 5 minutes.',
      durationSeconds: 300,
      reps: null,
      tip: 'This is not a walk — movement and excitement distract from the task.',
      successLook: 'Dog sniffs the spot and shows circling or intense sniffing.'
    },
    {
      order: 3,
      instruction: 'While the dog is eliminating (not after — during), say your chosen cue word softly once: "go potty," "outside," or "hurry up."',
      durationSeconds: null,
      reps: null,
      tip: 'You are pairing the cue with the act — over weeks it begins to trigger the behavior.',
      successLook: 'Dog continues eliminating without stopping at your voice.'
    },
    {
      order: 4,
      instruction: 'The instant they finish, have a party — excited voice, 3–5 treats delivered one at a time, then a 5-minute walk as a bonus reward.',
      durationSeconds: null,
      reps: null,
      tip: 'The jackpot must happen within 2 seconds of the final squat — a 10-second delay breaks the association.',
      successLook: 'Dog is clearly happy, tail wagging, eating treats enthusiastically.'
    },
    {
      order: 5,
      instruction: 'If nothing happens after 5 minutes, go back inside and immediately tether the dog to you or crate them. Try again in 15 minutes.',
      durationSeconds: null,
      reps: null,
      tip: 'Tethering prevents the dog from sneaking away to eliminate while you are not watching.',
      successLook: 'Dog has not had an accident because they were under constant supervision.'
    }
  ],
  successCriteria: 'Dog eliminates outdoors on 6 of 8 scheduled trips over a 2-day period with no unsupervised indoor access.',
  commonMistakes: [
    'Rewarding after coming back inside — the jackpot must happen outside, immediately',
    'Punishing accidents after the fact — the dog cannot make the connection',
    'Giving too much indoor freedom too soon',
    'Skipping trips when the dog "seems fine"'
  ],
  equipmentNeeded: ['Short leash', 'High-value treats kept by the door', 'Crate or tether'],
  ageMinMonths: 8,
  ageMaxMonths: 36,
  difficulty: 1,
  nextProtocolId: 'potty_s2',
  trainerNote: 'Potty training is 90% management. Every unsupervised accident is a practice rep of the wrong behavior. Zero indoor accidents for 4 consecutive weeks is the goal.',
  supportsLiveAiTrainer: false,
}

const potty_stage2: Protocol = {
  id: 'potty_s2',
  behavior: 'potty_training',
  stage: 2,
  title: 'Signal Training for Outside Request',
  objective: 'Teach the dog to signal to you when they need to go out.',
  durationMinutes: 8,
  repCount: 6,
  steps: [
    {
      order: 1,
      instruction: 'Hang a bell at nose height on the door you use for potty trips.',
      durationSeconds: null,
      reps: null,
      tip: 'Nose height is critical — if the dog can\'t reach it easily, the behavior won\'t stick.',
      successLook: 'Bell is hung at the correct height.'
    },
    {
      order: 2,
      instruction: 'Before every potty trip for one week, hold a treat near the bell. When the dog noses the bell and rings it, say "yes!" and open the door immediately.',
      durationSeconds: null,
      reps: 6,
      tip: 'You are pairing bell = door opens. Do this at every single trip for a full week — no exceptions.',
      successLook: 'Dog touches the bell before going out at every scheduled trip.'
    },
    {
      order: 3,
      instruction: 'After 5–7 days, stop initiating trips yourself. Wait near the door. When the dog rings the bell spontaneously, open the door immediately and go to the spot. Jackpot if they eliminate.',
      durationSeconds: null,
      reps: null,
      tip: 'The spontaneous ring is the breakthrough — some dogs get it in days, others take 2–3 weeks.',
      successLook: 'Dog approaches the door and rings the bell without being prompted.'
    },
    {
      order: 4,
      instruction: 'Watch for bell abuse — dogs that ring for play, not potty. If no elimination within 2 minutes, bring them straight back in. Only walks and play follow real elimination.',
      durationSeconds: null,
      reps: null,
      tip: 'Fix bell abuse immediately — if you reward it once by taking the dog out, you have set back the protocol.',
      successLook: 'Dog rings bell only when they need to eliminate.'
    }
  ],
  successCriteria: 'Dog signals at the door independently at least 4 out of 6 times across 3 days.',
  commonMistakes: [
    'Bell too high for the dog to reach comfortably',
    'Delaying door opening after a bell ring — the response must be immediate',
    'Allowing play after the bell without elimination — creates bell abuse',
    'Removing the bell too early'
  ],
  equipmentNeeded: ['Dog training bell or jingle bell', 'High-value treats', 'Consistent potty spot'],
  ageMinMonths: 8,
  ageMaxMonths: 36,
  difficulty: 2,
  nextProtocolId: 'potty_s3',
  trainerNote: 'The bell is a tool, not a permanent fixture. Most dogs transition to sitting at the door naturally once the signal behavior is established.',
  supportsLiveAiTrainer: false,
}

const potty_stage3: Protocol = {
  id: 'potty_s3',
  behavior: 'potty_training',
  stage: 3,
  title: 'Independence & Accident-Free Living',
  objective: 'Achieve consistent accident-free living through graduated indoor freedom.',
  durationMinutes: 5,
  repCount: 4,
  steps: [
    {
      order: 1,
      instruction: 'Expand indoor freedom one room at a time. Start with one small, supervised room. After 2 accident-free weeks, add the next room.',
      durationSeconds: null,
      reps: null,
      tip: 'Every accident sets you back 2 weeks — expand slowly.',
      successLook: 'Dog roams their area without circling or sniffing corners.'
    },
    {
      order: 2,
      instruction: 'Learn your dog\'s pre-elimination signals: circling, intense floor sniffing, suddenly leaving the room. The moment you see any of these, say "outside!" cheerfully and take them out immediately.',
      durationSeconds: null,
      reps: null,
      tip: 'Every dog has a tell — learning yours lets you redirect before the accident happens.',
      successLook: 'Dog redirected outside before any accident occurs.'
    },
    {
      order: 3,
      instruction: 'If an accident happens: no reaction, no scolding. Clean it with enzymatic cleaner and tighten management for 48 hours.',
      durationSeconds: null,
      reps: null,
      tip: 'Regular cleaners leave scent markers the dog can still detect — enzymatic cleaner is essential.',
      successLook: 'Accident cleaned properly, management tightened, no emotional reaction from handler.'
    },
    {
      order: 4,
      instruction: 'Build on-command elimination: say "go potty" consistently at the spot. Over 4 weeks this becomes reliable enough to use before car trips, bedtime, or travel.',
      durationSeconds: null,
      reps: 4,
      tip: 'On-command elimination is one of the most underrated skills — essential for travel and vet visits.',
      successLook: 'Dog eliminates within 2 minutes of arriving at the spot when cued.'
    }
  ],
  successCriteria: 'Dog has zero accidents for 4 consecutive weeks with graduated indoor freedom and signals reliably to go out.',
  commonMistakes: [
    'Treating accidents as moral failures rather than management errors',
    'Using non-enzymatic cleaners',
    'Expanding indoor freedom too quickly after a clean streak',
    'Stopping the reward system before the behavior is fully automatic'
  ],
  equipmentNeeded: ['Enzymatic cleaner', 'Treat pouch', 'Baby gates for room management'],
  ageMinMonths: 8,
  ageMaxMonths: 36,
  difficulty: 2,
  nextProtocolId: null,
  trainerNote: 'Full reliability takes 3–6 months, not 3 weeks. If regression happens at any point, go back to Stage 1 management for one week — the foundation is always there.',
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
  objective: 'Build a strong positive association with the crate so the dog enters voluntarily and rests inside without anxiety.',
  durationMinutes: 10,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Place the crate in the main living area with the door removed or propped open. Put a worn T-shirt inside and scatter a few kibble pieces. Let the dog investigate freely — do not push or lure them in.',
      durationSeconds: null,
      reps: null,
      tip: 'Pressure at this stage creates avoidance that takes weeks to undo — initial exposure must be on the dog\'s terms.',
      successLook: 'Dog sniffs the entrance and possibly steps one paw inside.'
    },
    {
      order: 2,
      instruction: 'Over 5 sessions, toss treats progressively further inside — 6 inches, 12 inches, all the way to the back wall. Never push. Let the dog choose to go in.',
      durationSeconds: null,
      reps: 10,
      tip: 'If the dog won\'t go past the entrance, meet them there and work gradually — forcing it now costs you weeks later.',
      successLook: 'Dog walks fully in, collects the treat, and walks back out calmly.'
    },
    {
      order: 3,
      instruction: 'Feed all meals inside the crate. Place the bowl just inside the entrance for days 1–3, then at the back from day 4 onward. Do not close the door yet.',
      durationSeconds: null,
      reps: null,
      tip: 'Every meal inside is a positive rep with zero extra effort from you.',
      successLook: 'Dog walks into the crate for meals without hesitation.'
    },
    {
      order: 4,
      instruction: 'Once the dog enters willingly for meals, close the door for 10 seconds while they eat, then open. Build to 30 seconds, then 1 minute. Stay in the room.',
      durationSeconds: 60,
      reps: null,
      tip: 'Keep door closure completely anticlimactic — no big production opening or closing it.',
      successLook: 'Dog continues eating calmly with door closed, no scratching or whining.'
    }
  ],
  successCriteria: 'Dog enters crate voluntarily 8 out of 10 times when a treat is tossed inside. Eats a full meal with door closed for 2 minutes without stress signals.',
  commonMistakes: [
    'Moving too fast — each step needs 2–3 days minimum',
    'Using the crate as punishment',
    'Letting the dog out when they whine — teaches whining opens the door',
    'Crating for long durations before the association is solid'
  ],
  equipmentNeeded: ['Appropriately sized crate', 'High-value treats', 'Worn T-shirt or familiar scent item', 'Food bowl'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'crate_s2',
  trainerNote: 'The goal is a dog that puts themselves to bed voluntarily. That is achievable, but it cannot be rushed. Allow at least 1–2 weeks at this stage.',
  supportsLiveAiTrainer: false,
}

const crate_stage2: Protocol = {
  id: 'crate_s2',
  behavior: 'crate_anxiety',
  stage: 2,
  title: 'Building Duration with Door Closed',
  objective: 'Extend crate time to 30–60 minutes with the handler present, then introduce brief departures from the room.',
  durationMinutes: 12,
  repCount: 6,
  steps: [
    {
      order: 1,
      instruction: 'Give the dog a Chew Toy inside the crate, close the door, and sit in the same room ignoring the crate entirely. When the dog finishes, wait 2 more minutes, then quietly let them out.',
      durationSeconds: 600,
      reps: null,
      tip: 'Load the Chew Toy with peanut butter and freeze it overnight — it does the work for you.',
      successLook: 'Dog works the Chew Toy contentedly and eventually settles.'
    },
    {
      order: 2,
      instruction: 'Once the dog is settled with you in the room, stand up and walk to the doorway. Pause 10 seconds. Return to your seat. No eye contact with the crate. Repeat 5 times.',
      durationSeconds: null,
      reps: 5,
      tip: 'You are desensitizing your movement as a departure signal — keep it mundane.',
      successLook: 'Dog remains lying down when you move to the doorway.'
    },
    {
      order: 3,
      instruction: 'Walk out of the room for 30 seconds. Return before any stress response. Build to 1 min → 2 min → 5 min. Always return before the dog shows distress.',
      durationSeconds: 300,
      reps: null,
      tip: 'Always come back before the dog panics — you are building a history of "they always return."',
      successLook: 'Dog lifts head at your return, then settles back down — no frantic greeting.'
    },
    {
      order: 4,
      instruction: 'When releasing, open the door and wait for the dog to be calm before any greeting — don\'t allow bursting out.',
      durationSeconds: null,
      reps: 3,
      tip: 'Calm exits matter as much as calm entries — a hysterical exit teaches high arousal around crate time.',
      successLook: 'Dog steps out calmly and receives a low-key greeting.'
    }
  ],
  successCriteria: 'Dog settles in crate for 30 minutes with handler absent, no stress signals, 4 out of 6 sessions.',
  commonMistakes: [
    'Returning when the dog is whining — only return during quiet moments',
    'Skipping the in-room phase and jumping straight to departures',
    'Overly excited greetings on return',
    'Crating before the dog has been exercised'
  ],
  equipmentNeeded: ['Crate', 'Chew Toy or bully stick', 'Timer'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'crate_s3',
  trainerNote: 'Exercise the dog before every crate session. A tired dog crates easily. A bored, under-stimulated dog has nothing to do but stress.',
  supportsLiveAiTrainer: false,
}

const crate_stage3: Protocol = {
  id: 'crate_s3',
  behavior: 'crate_anxiety',
  stage: 3,
  title: 'Extended Alone Time & Independence',
  objective: 'Build tolerance for 3–4 hour crating with the handler fully absent, and establish the crate as the dog\'s preferred resting space.',
  durationMinutes: 10,
  repCount: 5,
  steps: [
    {
      order: 1,
      instruction: 'Establish a consistent pre-crate ritual: 20 minutes of exercise → cue word ("crate up" or "bedtime") → Chew Toy placed inside → dog enters. Do this every time, without variation.',
      durationSeconds: null,
      reps: null,
      tip: 'Predictability is calming — a dog that knows exactly what is coming develops far less anticipatory anxiety.',
      successLook: 'Dog hears the cue word and walks toward the crate unprompted.'
    },
    {
      order: 2,
      instruction: 'Extend alone time gradually: 30 min → 1 hr → 90 min → 2 hrs → 3 hrs over 2–3 weeks. Never increase by more than one step per day.',
      durationSeconds: null,
      reps: null,
      tip: 'A white noise machine near the crate masks external sounds that can trigger anxiety.',
      successLook: 'Dog is asleep or resting calmly on camera after handler leaves.'
    },
    {
      order: 3,
      instruction: 'Set up a camera to observe the dog during alone time. Review footage after every session — look for panting, drooling, pawing, or vocalizing after the first 5 minutes. Any of these means the duration was too long.',
      durationSeconds: null,
      reps: null,
      tip: 'Quiet at return does not mean calm the whole time — the camera shows you the truth.',
      successLook: 'Dog visible on camera resting or sleeping for the majority of the session.'
    },
    {
      order: 4,
      instruction: 'Leave the crate door open in the evenings. Don\'t prompt the dog to use it — wait for them to choose it voluntarily.',
      durationSeconds: null,
      reps: null,
      tip: 'A dog that chooses the open crate on their own is genuinely comfortable in it, not just tolerating confinement.',
      successLook: 'Dog enters and rests in crate on their own without prompting.'
    },
    {
      order: 5,
      instruction: 'Run a "surprise crating" once a week — randomly crate for 30 minutes with a Chew Toy in the middle of the day to maintain the skill.',
      durationSeconds: 1800,
      reps: null,
      tip: 'Skills that are not maintained fade — monthly practice keeps the behavior intact.',
      successLook: 'Dog enters on cue mid-day with no resistance.'
    }
  ],
  successCriteria: 'Dog rests calmly in crate for 3 hours with handler absent, no distress on camera, 4 out of 5 sessions.',
  commonMistakes: [
    'Skipping camera review — you cannot know the dog is calm without watching',
    'No exercise before long sessions',
    'Crating for more than 4 hours for an adult dog',
    'Abandoning crate practice entirely once the dog sleeps through the night'
  ],
  equipmentNeeded: ['Crate with familiar bedding', 'Pet camera', 'Chew Toy', 'White noise machine (optional)'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'Maximum recommended crating for an adult dog is 4–5 hours during waking hours. A dog crated for 9 hours is being managed, not cared for.',
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
  objective: 'Teach the puppy that even moderate pressure on human skin causes interaction to stop immediately.',
  durationMinutes: 8,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Allow gentle mouthing during play. The moment pressure is uncomfortable, say "ouch!" in a sharp, surprised tone and go limp and freeze for 3 seconds.',
      durationSeconds: 3,
      reps: null,
      tip: 'Think how another puppy would yelp — sharp and brief, not screaming. Overreacting excites them further.',
      successLook: 'Puppy pauses mouthing and pulls back slightly.'
    },
    {
      order: 2,
      instruction: 'After 3 seconds frozen, resume play. After 3 hard bites in one session, end all play for 30 seconds by standing up and turning away.',
      durationSeconds: 30,
      reps: null,
      tip: 'The time-out is information, not punishment — hard biting = play ends.',
      successLook: 'Puppy softens bite pressure over the session.'
    },
    {
      order: 3,
      instruction: 'After any interruption, immediately offer a toy and wiggle it. Say "get the toy!" Mark and engage enthusiastically when the puppy bites the toy instead.',
      durationSeconds: null,
      reps: 10,
      tip: 'The toy must be more exciting than skin — wiggle it, toss it, make it prey.',
      successLook: 'Puppy transfers bite from your hand to the toy willingly.'
    },
    {
      order: 4,
      instruction: 'Practice "hand as signal": hold your open hand still near the puppy and reward any gentle sniff or lick with a treat from the other hand.',
      durationSeconds: null,
      reps: 5,
      tip: 'This resets the association from "hands = target" to "still hands = treats."',
      successLook: 'Puppy sniffs or licks an outstretched hand gently, looking for the reward.'
    }
  ],
  successCriteria: 'Puppy reduces bite pressure to soft mouthing only in 12 out of 15 interactions.',
  commonMistakes: [
    'Yelling or pulling your hand away fast — both increase excitement',
    'Inconsistency across family members',
    'Waiting more than 2 seconds to redirect to a toy',
    'Suppressing all mouthing — gentle mouthing during development is normal'
  ],
  equipmentNeeded: ['Tug toy or rope toy', 'High-value treats'],
  ageMinMonths: 2,
  ageMaxMonths: 18,
  difficulty: 1,
  nextProtocolId: 'biting_s2',
  trainerNote: 'Bite inhibition is the most important thing a puppy learns before 18 weeks. The goal is not zero mouthing — it is zero hard biting. A puppy with soft, inhibited bite pressure is fundamentally safer than one who has never mouthed at all.',
  supportsLiveAiTrainer: true,
}

const biting_stage2: Protocol = {
  id: 'biting_s2',
  behavior: 'puppy_biting',
  stage: 2,
  title: 'Zero Skin Contact Rule',
  objective: 'Eliminate all mouthing on skin and transfer all bite energy to appropriate toys.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Raise the standard: any tooth contact with skin — even gentle — results in an immediate silent freeze for 5 seconds. No "ouch" anymore.',
      durationSeconds: 5,
      reps: null,
      tip: 'The shift from "no hard biting" to "no teeth on skin at all" is the most important transition in the protocol.',
      successLook: 'Puppy notices the freeze and pauses without continuing to mouth.'
    },
    {
      order: 2,
      instruction: 'Offer a toy before play begins every time. Hold it out and let the puppy grab it first, before you touch them.',
      durationSeconds: null,
      reps: null,
      tip: 'Having the toy already in play eliminates the moment when the puppy defaults to skin.',
      successLook: 'Puppy grabs the toy rather than hands when play starts.'
    },
    {
      order: 3,
      instruction: '"Calm hands" exercise: sit with your hands in your lap. Any calm sniff or lick earns a treat. Any mouthing = stand up and turn away for 30 seconds. Do 10 reps.',
      durationSeconds: 30,
      reps: 10,
      tip: 'After 10 reps, most puppies stop mouthing and start offering eye contact instead.',
      successLook: 'Puppy sniffs hands without using teeth, offers eye contact.'
    },
    {
      order: 4,
      instruction: 'Practice handling exercises: gently hold the collar, touch paws, look in ears. Treat continuously throughout. This builds comfort with physical touch alongside the no-bite rule.',
      durationSeconds: null,
      reps: 5,
      tip: 'A puppy that accepts handling becomes a dog that tolerates vet exams and grooming.',
      successLook: 'Puppy holds still during brief ear, paw, and collar handling while eating treats.'
    }
  ],
  successCriteria: 'Puppy initiates zero tooth-on-skin contact in 12 out of 15 play interactions.',
  commonMistakes: [
    'Inconsistent standard — some days allowing mouthing, other days not',
    'Not having a toy ready when play starts',
    'Any roughhousing with hands, even briefly',
    'Not practicing calm handling separately from play'
  ],
  equipmentNeeded: ['Multiple toys stationed around the home', 'Treat pouch'],
  ageMinMonths: 3,
  ageMaxMonths: 18,
  difficulty: 2,
  nextProtocolId: 'biting_s3',
  trainerNote: 'Puppies in the 4–6 month teething window need more appropriate chewing, not less. Increase Chew Toys and bully sticks alongside this protocol.',
  supportsLiveAiTrainer: true,
}

const biting_stage3: Protocol = {
  id: 'biting_s3',
  behavior: 'puppy_biting',
  stage: 3,
  title: 'Impulse Control Around Hands & Strangers',
  objective: 'Generalize the no-bite rule to all humans including strangers and children, in all environments.',
  durationMinutes: 10,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Hold a treat in a closed fist. When the puppy stops pawing or mouthing and backs off or sits, open your fist and deliver. Do 10 reps.',
      durationSeconds: null,
      reps: 10,
      tip: 'Keep the fist completely still — any movement signals the biting is working.',
      successLook: 'Puppy backs away from the fist and offers a sit or eye contact.'
    },
    {
      order: 2,
      instruction: 'Have a friend or family member the puppy doesn\'t know well practice calm interaction: closed fist to sniff, freeze if mouthing, treat and pet if calm. Give them 5 treats.',
      durationSeconds: null,
      reps: 5,
      tip: 'Three stranger-interaction sessions are worth more than thirty owner-only sessions for generalization.',
      successLook: 'Puppy greets the helper with calm sniffing, no mouthing or jumping.'
    },
    {
      order: 3,
      instruction: 'Practice in at least two different environments. New locations often cause regression — start with lower-energy interactions in each new place.',
      durationSeconds: null,
      reps: null,
      tip: 'A dog that behaves at home but bites strangers is a liability — generalization is the final step.',
      successLook: 'Puppy maintains calm mouth in at least one novel environment.'
    },
    {
      order: 4,
      instruction: 'If children are in the home, teach them "statue" — stand still, offer a closed fist, then treat calmly if the puppy sniffs without mouthing. Supervise all child-dog interaction.',
      durationSeconds: null,
      reps: null,
      tip: 'No unsupervised child-dog interaction at this age — no exceptions.',
      successLook: 'Puppy approaches a still child calmly, sniffs, does not jump or mouth.'
    }
  ],
  successCriteria: 'Puppy greets unfamiliar people with zero tooth contact in 8 out of 10 encounters in at least 2 different environments.',
  commonMistakes: [
    'Practicing only with the owner',
    'Allowing children to interact without supervision',
    'No management (leash) during greetings until the behavior is reliable',
    'Assuming the behavior is complete before practicing in novel environments'
  ],
  equipmentNeeded: ['Treats for helpers', 'Leash for management during greetings', 'Toys for redirection'],
  ageMinMonths: 4,
  ageMaxMonths: 18,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'A puppy that reaches 6 months with solid bite inhibition and zero skin contact is set up for life. This window is critical — take it seriously.',
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
  objective: 'Build a strong positive association with a designated mat so the dog goes to it voluntarily and lies down.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Place a mat in the main living area. The moment the dog puts any paw on it — even accidentally — say "yes!" and toss 3 treats onto the mat.',
      durationSeconds: null,
      reps: null,
      tip: 'Do not lure the dog onto the mat — wait for natural contact and mark it.',
      successLook: 'Dog steps on the mat, hears the mark, and eats the treats while standing on it.'
    },
    {
      order: 2,
      instruction: 'Move 3 steps away. When the dog returns to the mat and makes contact, mark "yes!" and scatter 3 treats on it. Do 10 reps.',
      durationSeconds: null,
      reps: 10,
      tip: 'When the dog starts walking to the mat deliberately and looking at you from it, jackpot 5 treats.',
      successLook: 'Dog walks to the mat independently and looks at you from on top of it.'
    },
    {
      order: 3,
      instruction: 'Once the dog reliably steps on the mat, wait for a down before marking. Drop a treat between their front paws to encourage elbows down if needed — but only use this lure 2–3 times.',
      durationSeconds: null,
      reps: null,
      tip: 'After 2–3 lure reps, stop and wait for the dog to offer the down independently.',
      successLook: 'Dog walks to mat and lies down without being asked.'
    },
    {
      order: 4,
      instruction: 'Add the verbal cue "place" or "settle" just as the dog begins walking toward the mat. Say it once.',
      durationSeconds: null,
      reps: 5,
      tip: 'Add the cue after the behavior exists — labeling confusion teaches nothing.',
      successLook: 'Dog begins walking toward the mat when they hear the cue.'
    }
  ],
  successCriteria: 'Dog goes to mat and lies down on verbal cue 12 out of 15 reps in a low-distraction room.',
  commonMistakes: [
    'Luring onto the mat repeatedly — prevents independent choice',
    'Adding the cue before the behavior is fluent',
    'Using a mat too small or uncomfortable to lie on',
    'Practicing in too many locations before the behavior is solid in one'
  ],
  equipmentNeeded: ['Dog mat or orthopedic bed', 'High-value treats', 'Treat pouch'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'settle_s2',
  trainerNote: 'The mat is one of the most versatile tools in dog training — it becomes a calming station, a boundary during mealtimes, and a reset button when the dog is overstimulated.',
  supportsLiveAiTrainer: true,
}

const settle_stage2: Protocol = {
  id: 'settle_s2',
  behavior: 'settling',
  stage: 2,
  title: 'Duration & Mild Distraction on Mat',
  objective: 'Build the ability to remain on the mat for 5 minutes with mild household distractions present.',
  durationMinutes: 10,
  repCount: 8,
  steps: [
    {
      order: 1,
      instruction: 'Cue "place." Once the dog is lying down, deliver a treat to the mat every 15 seconds for 2 minutes, then stretch to every 30 seconds. Walk to the dog to deliver — never call them off.',
      durationSeconds: 120,
      reps: 3,
      tip: 'Going to the dog to treat is critical — calling them off rewards leaving the mat.',
      successLook: 'Dog holds position while you walk over to deliver treats.'
    },
    {
      order: 2,
      instruction: 'Cue settle, turn on the TV, and deliver treats to the mat every 30 seconds for 3 minutes, then every 60 seconds, then every 2 minutes.',
      durationSeconds: 300,
      reps: null,
      tip: 'Fade reinforcement gradually — jumping from every 30 seconds to nothing causes the dog to leave.',
      successLook: 'Dog stays on mat for 5 minutes with TV on.'
    },
    {
      order: 3,
      instruction: '"Walk-past" proofing: cue settle, then walk casually past the mat every 30 seconds as part of normal household activity. Any time the dog stays, toss a treat to the mat.',
      durationSeconds: null,
      reps: 5,
      tip: 'This proofs against the dog following you — the biggest challenge with settle.',
      successLook: 'Dog stays on mat when you walk past without getting up to follow.'
    },
    {
      order: 4,
      instruction: 'Have a household member enter the room, move around normally, and sit down. Deliver a treat to the mat every 60 seconds the dog stays. Build to 5 minutes of settled behavior.',
      durationSeconds: 300,
      reps: null,
      tip: 'Always release the dog from the settle with a clear verbal cue — "free!" or "okay."',
      successLook: 'Dog stays relaxed on mat for 5 minutes while people move around normally.'
    }
  ],
  successCriteria: 'Dog holds settle for 5 minutes with mild household distractions and treats every 60 seconds, 6 out of 8 sessions.',
  commonMistakes: [
    'Fading reinforcement too quickly',
    'Calling the dog off the mat between trials — always release formally',
    'Starting with distractions too strong before basics are solid'
  ],
  equipmentNeeded: ['Mat', 'Treats', 'Treat pouch'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'settle_s3',
  trainerNote: 'The settle cue is self-reinforcing once the dog understands it — a settled dog gets ignored, which is what many dogs want. Treats can fade dramatically once the habit is established.',
  supportsLiveAiTrainer: true,
}

const settle_stage3: Protocol = {
  id: 'settle_s3',
  behavior: 'settling',
  stage: 3,
  title: 'Go to Place from Any Room',
  objective: 'The dog goes to their mat from any room on a single verbal cue and holds it for 10 minutes.',
  durationMinutes: 12,
  repCount: 8,
  steps: [
    {
      order: 1,
      instruction: 'From 10 feet away, cue "place." Build from 10 to 20 to 30 feet across the room over 5 reps, treating on arrival each time.',
      durationSeconds: null,
      reps: 5,
      tip: 'At greater distances the dog is doing independent problem-solving — celebrate every attempt.',
      successLook: 'Dog moves purposefully to mat from across the room and lies down.'
    },
    {
      order: 2,
      instruction: 'Move to the adjacent room. Cue "place" without pointing. If the dog hesitates for 5 seconds, walk toward the mat and point once.',
      durationSeconds: null,
      reps: 3,
      tip: 'If the mat is new to a room, let the dog explore the layout before cuing.',
      successLook: 'Dog leaves your room and goes to the mat in the other room.'
    },
    {
      order: 3,
      instruction: 'Build to a 10-minute hold: cue place, deliver a Chew Toy, set a timer. Drop a treat on the mat every 2 minutes without making eye contact. Release with "free!" at 10 minutes.',
      durationSeconds: 600,
      reps: null,
      tip: 'Deliver the treat without eye contact — it keeps the dog in the down rather than popping up to look at you.',
      successLook: 'Dog holds settle with Chew Toy for 10 minutes before release.'
    },
    {
      order: 4,
      instruction: 'Introduce a novel location: take the mat to a friend\'s home, hotel room, or outdoor café. Cue "place." Do 1–2 warm-up reps before expecting full duration.',
      durationSeconds: null,
      reps: 3,
      tip: 'Bring the same mat — the familiar scent and texture help generalize the cue in a new setting.',
      successLook: 'Dog lies on mat in a novel environment for 3+ minutes.'
    }
  ],
  successCriteria: 'Dog goes to mat from another room on voice cue in 6 of 8 trials and holds for 10 minutes in a familiar environment.',
  commonMistakes: [
    'Not releasing formally — always "free!" to end the settle',
    'Punishing the dog for getting up during long holds — reduce duration and rebuild',
    'Skipping the novel environment step — a settle that only works at home is not fully trained'
  ],
  equipmentNeeded: ['Mat (portable)', 'Chew Toy', 'High-value treats', 'Timer'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'A dog that can place from another room and hold for 10+ minutes transforms your household — guests, calls, mealtimes, all become manageable without physical restraint.',
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
  objective: 'Teach the dog that ignoring food in your hand earns something better — the foundation of impulse control.',
  durationMinutes: 8,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Place a low-value treat in your closed fist and hold it at nose height. Say nothing and do not open your fist no matter what the dog does.',
      durationSeconds: null,
      reps: null,
      tip: 'Your fist must stay completely closed through sniffing, licking, and pawing — movement rewards persistence.',
      successLook: 'Dog sniffs the fist, then backs their nose away.'
    },
    {
      order: 2,
      instruction: 'The instant the dog backs away from your fist, say "yes!" and deliver a high-value treat from your OTHER hand. The kibble in the fist is never given.',
      durationSeconds: null,
      reps: 10,
      tip: 'Always reward from the opposite hand — "leave the inferior thing, get the superior thing."',
      successLook: 'Dog pulls back from the fist and receives a better treat from the other hand.'
    },
    {
      order: 3,
      instruction: 'Once the dog backs off within 2 seconds for 5 consecutive reps, add the cue "leave it" just as you present the fist. Mark and reward the backing-off as before.',
      durationSeconds: null,
      reps: 10,
      tip: 'Add the cue only once the behavior is reliable — too early and you label the wrong moment.',
      successLook: 'Dog hears "leave it," glances at the fist, and looks back to you.'
    },
    {
      order: 4,
      instruction: 'Open your fist flat with the treat visible on your palm. Say "leave it." Reward the pull-back from your other hand. Never let the dog eat the treat from your palm.',
      durationSeconds: null,
      reps: 5,
      tip: 'If the dog eats the palm treat, close your hand, reset, and try again — no correction needed.',
      successLook: 'Dog looks at the treat on the open palm, then looks away toward you.'
    }
  ],
  successCriteria: 'Dog backs away from a treat on an open palm within 2 seconds of "leave it," 15 out of 20 reps.',
  commonMistakes: [
    'Moving the fist away when the dog touches it',
    'Giving the treat from the fist as the reward — it must always come from the other hand',
    'Adding the cue before backing-off is reliable',
    'Using high-value food before the basic version is solid'
  ],
  equipmentNeeded: ['Low-value treats (kibble) for the bait fist', 'High-value treats for reward hand', 'Treat pouch'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'leave_it_s2',
  trainerNote: 'Leave it is a safety behavior. A reliable leave it redirects dogs away from chicken bones, dropped medication, and dangerous objects. Build it like the dog\'s life depends on it — because occasionally it will.',
  supportsLiveAiTrainer: false,
}

const leave_it_stage2: Protocol = {
  id: 'leave_it_s2',
  behavior: 'leave_it',
  stage: 2,
  title: 'Floor Leave It & Drop It',
  objective: 'Transfer leave it to items on the floor, and teach drop it for releasing objects already in the dog\'s mouth.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Place kibble on the floor and cover it with your foot. Say "leave it." When the dog backs off, mark and deliver a high-value treat from your hand. Do 8 reps.',
      durationSeconds: null,
      reps: 8,
      tip: 'Your foot is the barrier — stand still and wait for disengagement.',
      successLook: 'Dog sniffs around your foot, then backs away and looks at your face.'
    },
    {
      order: 2,
      instruction: 'Remove your foot. Place kibble uncovered. Say "leave it" from 1 foot away. If the dog goes for it, cover it with your foot. If they hold for 3 seconds, mark and reward from your hand.',
      durationSeconds: null,
      reps: 7,
      tip: 'You must be faster than the dog at covering the treat — if you can\'t be, use slower or less interesting food.',
      successLook: 'Dog glances at the floor treat, then looks up at you without going for it.'
    },
    {
      order: 3,
      instruction: 'Teach "drop it": let the dog grab a toy, then hold a high-value treat directly under their nose. The moment their jaw opens and the toy drops, say "yes, drop it!" and give the treat. Then give the toy back immediately.',
      durationSeconds: null,
      reps: 5,
      tip: 'Always return the toy — a dog that learns "drop it = toy disappears" will refuse to drop anything.',
      successLook: 'Dog opens mouth and releases the toy when the treat appears.'
    },
    {
      order: 4,
      instruction: 'Once drop it is reliable with toys, practice with higher-value items: a bully stick or Chew Toy. Offer the treat under the nose. Wait — do not yank.',
      durationSeconds: null,
      reps: 3,
      tip: 'Build a perfect trade history first. Only in real emergencies should you take without returning.',
      successLook: 'Dog releases the high-value chew when a trade treat is offered.'
    }
  ],
  successCriteria: 'Dog leaves an uncovered floor treat for 5 seconds on cue, 10 out of 15 reps. Dog drops a toy on "drop it" cue, 8 out of 10 reps.',
  commonMistakes: [
    'Letting the dog win the floor treat even once',
    'Taking items without offering a trade — teaches resource guarding',
    'Only practicing with low-value items',
    'Confusing drop it and leave it — keep them separate until both are solid'
  ],
  equipmentNeeded: ['Kibble for floor leave it', 'High-value treats for rewards', 'Toy', 'Bully stick or Chew Toy'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'leave_it_s3',
  trainerNote: 'Leave it means "don\'t touch that." Drop it means "release what you have." Keep them separate in training until both are solid, then use them in sequence.',
  supportsLiveAiTrainer: false,
}

const leave_it_stage3: Protocol = {
  id: 'leave_it_s3',
  behavior: 'leave_it',
  stage: 3,
  title: 'Real-World Leave It: Sidewalk, Food & Animals',
  objective: 'Proof leave it outdoors with dropped food, ground temptations, and animal movement triggers.',
  durationMinutes: 12,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'On leash outdoors, drop a piece of kibble ahead and walk toward it. Say "leave it" 2–3 steps before the dog reaches it. Mark and reward from your pouch when they divert their attention.',
      durationSeconds: null,
      reps: 5,
      tip: 'Cue before contact, not after — cuing too late is damage control, not training.',
      successLook: 'Dog notices the food, hears "leave it," and looks to you instead.'
    },
    {
      order: 2,
      instruction: 'Walk-past version: leave food on the ground and walk past it without cueing. Jackpot if the dog ignores it naturally. If they go for it, say "leave it" once and keep walking.',
      durationSeconds: null,
      reps: 5,
      tip: 'The goal is a dog that leaves ground food silently — the cue is a backup, not the primary behavior.',
      successLook: 'Dog walks past ground food without stopping, checking in with you.'
    },
    {
      order: 3,
      instruction: 'High-value challenge: drop a piece of chicken on the floor indoors, say "leave it," and reward with your best treat after a 3-second hold. Maximum 3 reps per session.',
      durationSeconds: null,
      reps: 3,
      tip: 'The reward must be clearly better than the chicken — kibble against chicken will fail every time.',
      successLook: 'Dog looks at the chicken, holds for 3 seconds, receives a jackpot.'
    },
    {
      order: 4,
      instruction: 'Near animal triggers (squirrel, cat, bird): at threshold distance, say "leave it" and hold a treat at your face. Mark "yes!" when the dog looks at you instead of the animal.',
      durationSeconds: null,
      reps: 3,
      tip: 'Threshold for a prey-driven dog near a squirrel may be 30+ feet — start where the dog can actually hear you.',
      successLook: 'Dog notices the animal, hears "leave it," and orients to you.'
    }
  ],
  successCriteria: 'Dog leaves food on the ground on cue in 8 out of 10 outdoor trials. Redirects from a moving animal at distance in 6 out of 10 attempts.',
  commonMistakes: [
    'Only practicing leave it indoors — outdoor is a completely different difficulty level',
    'Using an angry tone — "leave it" must stay neutral or cheerful',
    'Under-rewarding relative to the distraction value',
    'Jumping to squirrels before ground food is solid'
  ],
  equipmentNeeded: ['Treat pouch with high-value rewards', '6-foot leash', 'Kibble or chicken for planting on ground'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'A leave it that holds near squirrels in a park is a 6–12 month project. Every failure in the real world takes 5 successful reps to undo — do not rush.',
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
  objective: 'Build reliable sit and down on verbal cue, responding within 2 seconds with no lure.',
  durationMinutes: 8,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Teach sit with a lure: hold a treat at the dog\'s nose and move it up and back over their head. The instant their rear touches the floor, mark "yes!" and treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Keep the lure at nose height — too high and they jump instead of sitting.',
      successLook: 'Dog follows the lure into a clean sit without jumping or backing up.'
    },
    {
      order: 2,
      instruction: 'Fade the lure: use the same hand motion with no treat in that hand. Mark and reward from your other hand when they sit. Do 10 reps.',
      durationSeconds: null,
      reps: 10,
      tip: 'A dog that only sits when food is visible in your hand has not learned to sit on cue.',
      successLook: 'Dog sits following the empty hand signal.'
    },
    {
      order: 3,
      instruction: 'Add "sit" verbally before the hand signal. After 5 paired reps, try the word alone with hands at your sides. If they sit, jackpot.',
      durationSeconds: null,
      reps: 10,
      tip: 'Say "sit" once and wait — repeating it teaches the first cue is optional.',
      successLook: 'Dog sits on verbal "sit" alone with handler hands at sides.'
    },
    {
      order: 4,
      instruction: 'Teach down with the same lure-fade progression: nose to floor, then slide the treat along the floor away from them. Mark the instant elbows touch. Add "down" verbal cue and fade the lure.',
      durationSeconds: null,
      reps: 5,
      tip: 'Reward down with 2–3 treats rather than one — it is a more vulnerable position and worth more.',
      successLook: 'Dog lies fully down on verbal "down" cue with handler hands at sides.'
    }
  ],
  successCriteria: 'Dog sits on "sit" alone 9 out of 10 reps. Dog downs on "down" alone 8 out of 10 reps.',
  commonMistakes: [
    'Keeping food in the lure hand past rep 5',
    'Repeating the cue multiple times',
    'Accepting a partial sit or hover',
    'Proofing before the cue response is reliable'
  ],
  equipmentNeeded: ['High-value small treats', 'Treat pouch', 'Low-distraction room'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'obedience_s2',
  trainerNote: 'Sit and down are prerequisites for almost everything else in this app. A sit that "sometimes works" is not a trained sit — hold the 9/10 standard before moving on.',
  supportsLiveAiTrainer: true,
}

const obedience_stage2: Protocol = {
  id: 'obedience_s2',
  behavior: 'basic_obedience',
  stage: 2,
  title: 'Stay: Duration & Distance',
  objective: 'Teach stay — holding sit or down until released — building to 20 seconds at 5-foot distance.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Cue sit, say "stay" with a flat palm toward the dog, count 2 seconds silently, mark "yes!" while they are still in position, then treat. Do 5 reps.',
      durationSeconds: null,
      reps: 5,
      tip: 'Mark while the dog is still seated — the mark tells them exactly what earned the treat.',
      successLook: 'Dog holds sit for 2 seconds without shuffling forward.'
    },
    {
      order: 2,
      instruction: 'Build duration variably: 2 sec → 5 sec → 3 sec → 10 sec → 7 sec → 15 sec → 20 sec. Always release with "free!" and vary the durations — never always increase.',
      durationSeconds: null,
      reps: 8,
      tip: 'Variable duration prevents anticipation — a dog that always gets released at 10 seconds will break at 11.',
      successLook: 'Dog holds stay for 20 seconds with handler standing in front.'
    },
    {
      order: 3,
      instruction: 'Add distance: take one step back, return, treat. Build to 5 feet over 5 reps. Always walk back to the dog to deliver — never call them to you.',
      durationSeconds: null,
      reps: 5,
      tip: 'Returning to reward (not calling them) is the most critical detail of stay training.',
      successLook: 'Dog holds sit-stay while handler moves to 5 feet and returns.'
    },
    {
      order: 4,
      instruction: 'Practice down-stay with the same progression. Build to 30 seconds at 5 feet. For longer holds, return every 10 seconds to drop a treat in position.',
      durationSeconds: 30,
      reps: 3,
      tip: 'Down-stay is more stable than sit-stay for long durations — it is physically more comfortable.',
      successLook: 'Dog holds down-stay for 30 seconds at 5 feet.'
    }
  ],
  successCriteria: 'Dog holds sit-stay for 20 seconds at 5 feet, 10 out of 15 trials. Down-stay for 30 seconds at 5 feet, 10 out of 15 trials.',
  commonMistakes: [
    'Calling the dog to you to reward during stay',
    'Building duration AND distance simultaneously',
    'No formal release cue',
    'Practicing in distracting environments before the stay is solid'
  ],
  equipmentNeeded: ['High-value treats', 'Treat pouch'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'obedience_s3',
  trainerNote: 'Build one "D" at a time — Duration, then Distance, then Distraction. Adding all three simultaneously is the most common reason stay training fails.',
  supportsLiveAiTrainer: true,
}

const obedience_stage3: Protocol = {
  id: 'obedience_s3',
  behavior: 'basic_obedience',
  stage: 3,
  title: 'Proofed Obedience with Distractions',
  objective: 'Proof sit, down, and stay in moderate-distraction environments so the behavior holds in real-life situations.',
  durationMinutes: 12,
  repCount: 12,
  steps: [
    {
      order: 1,
      instruction: 'Test at home with TV on and household movement. If sit, down, and stay hold reliably, move to outdoor proofing. If not, reduce the distraction and rebuild.',
      durationSeconds: null,
      reps: 5,
      tip: 'Home with household activity is a genuine distraction level — don\'t skip straight to the park.',
      successLook: 'Dog responds to sit, down, and stay in a normal home environment.'
    },
    {
      order: 2,
      instruction: 'Take to the driveway or front yard. Start with 5-second stays — expect regression and reward generously for any success.',
      durationSeconds: null,
      reps: 5,
      tip: 'Outdoor obedience feels like a new task to the dog — start easier than you think necessary.',
      successLook: 'Dog performs sit and down on verbal cue outdoors within 3 seconds.'
    },
    {
      order: 3,
      instruction: 'With a helper walking past at 10 feet, ask for sit-stay. Build to: helper at 5 feet, helper jogging. Dog must hold through all of them.',
      durationSeconds: null,
      reps: 5,
      tip: 'A person walking past is the most common real-world challenge — mastering this transfers to the vet, sidewalk, and anywhere else.',
      successLook: 'Dog holds sit while a person walks past at 5 feet.'
    },
    {
      order: 4,
      instruction: 'Integrate into daily life: ask for sit before meals, down before going outside, stay before crossing a curb. Use real-life rewards — access and events — not just treats.',
      durationSeconds: null,
      reps: null,
      tip: 'Real-life rewards are more powerful long-term because they are always available and always meaningful.',
      successLook: 'Dog responds to obedience cues in daily life contexts without training session framing.'
    }
  ],
  successCriteria: 'Dog sits and downs on verbal cue outdoors in 10 out of 12 attempts. Holds a 15-second sit-stay with a person walking past at 5 feet, 8 out of 12 trials.',
  commonMistakes: [
    'Expecting indoor reliability outdoors immediately',
    'Using lower-value treats outdoors than indoors',
    'Skipping the driveway phase and going directly to a busy park',
    'Only cueing obedience during formal training sessions'
  ],
  equipmentNeeded: ['Treat pouch', 'High-value treats', 'Leash', 'Helper for distraction work'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'Proofed sit, down, and stay are the platform for everything else. The time invested here pays dividends for the dog\'s entire life.',
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
  objective: 'Install a reliable "quiet" cue that interrupts barking within 3 seconds using controlled bark-and-quiet repetitions.',
  durationMinutes: 8,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'First teach "speak" using a reliable trigger (doorbell, knock). The moment your dog barks, say "speak!" and reward with a treat. Do 5 reps.',
      durationSeconds: null,
      reps: 5,
      tip: 'You cannot reliably teach "quiet" without first controlling when the bark starts.',
      successLook: 'Dog barks in response to the trigger and receives a reward.'
    },
    {
      order: 2,
      instruction: 'After 1–2 barks, hold a high-value treat at the dog\'s nose. The moment barking stops — even for 1 second — say "quiet!" and deliver.',
      durationSeconds: null,
      reps: 5,
      tip: 'Dogs cannot bark and sniff simultaneously — the treat interrupts the behavior and creates the quiet moment to mark.',
      successLook: 'Dog pauses barking when treat appears, hears "quiet!" and receives it.'
    },
    {
      order: 3,
      instruction: 'Build duration of quiet before rewarding: trigger bark → "quiet" → hold treat at nose → wait 2 seconds → mark → treat. Build to 5 seconds of silence. Do 8 reps.',
      durationSeconds: null,
      reps: 8,
      tip: 'You want quiet as a sustained behavior, not just a brief pause.',
      successLook: 'Dog stops barking for 5 seconds when "quiet" is cued.'
    },
    {
      order: 4,
      instruction: 'Fade the nose treat: say "quiet" without food at the dog\'s face. If they quiet, mark and immediately reach for your treat pouch. Use the nose treat as a fallback only if needed.',
      durationSeconds: null,
      reps: 5,
      tip: 'Reward immediately when the verbal cue alone works — that moment is worth a jackpot.',
      successLook: 'Dog quiets on verbal cue alone for 3+ seconds, 3 out of 5 attempts.'
    }
  ],
  successCriteria: 'Dog quiets within 3 seconds of "quiet" cue in a controlled session, 10 out of 15 reps.',
  commonMistakes: [
    'Repeating "quiet" loudly — escalating your volume increases arousal',
    'Skipping the "speak" cue step',
    'Rewarding a 1-second pause rather than holding for real duration',
    'Practicing at peak arousal before the cue is installed'
  ],
  equipmentNeeded: ['High-value treats', 'Bark trigger (doorbell sound or knock)', 'Treat pouch'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'barking_s2',
  trainerNote: 'The most common mistake is yelling "QUIET!" repeatedly — to the dog it sounds like you are barking along. A calm, single cue combined with the food interruption is worth more than 100 shouted commands.',
  supportsLiveAiTrainer: false,
}

const barking_stage2: Protocol = {
  id: 'barking_s2',
  behavior: 'barking',
  stage: 2,
  title: 'Alert Barking Management: Door & Window',
  objective: 'Reduce alert barking at the door and windows by teaching a behavioral replacement and limiting unsupervised rehearsal.',
  durationMinutes: 10,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Block window access when unsupervised using furniture rearrangement, baby gates, or frosted lower-pane film. Every unrehearsed bark at the window reinforces the behavior.',
      durationSeconds: null,
      reps: null,
      tip: 'Management is not cheating — it cuts daily bark rehearsal dramatically while you train the replacement behavior.',
      successLook: 'Dog cannot access the window during unsupervised time.'
    },
    {
      order: 2,
      instruction: 'Doorbell drill: ring the bell, let the dog bark 1–2 times, then calmly say "place" and lead them to their mat. Ask for a down. Once settled, say "quiet" and reward after 5 seconds of silence.',
      durationSeconds: null,
      reps: 5,
      tip: 'You are building a chain: doorbell → brief bark → mat → quiet → reward. The mat becomes the alternative to sustained barking.',
      successLook: 'Dog barks at the doorbell, then follows to the mat and settles within 15 seconds.'
    },
    {
      order: 3,
      instruction: 'Practice without the bark: ring the doorbell and say "place" before the dog barks. Reward on the mat. Over 10 reps, the dog may begin self-directing to the mat.',
      durationSeconds: null,
      reps: 5,
      tip: 'The dog self-directing to the mat at the sound of the doorbell takes 30–50 deliberate rehearsals — schedule them.',
      successLook: 'Dog hears doorbell and begins walking toward the mat without being prompted.'
    },
    {
      order: 4,
      instruction: 'For demand barking: do not respond in any way — no eye contact, no "no." The instant barking stops, even briefly, mark "yes!" and give what they were asking for. Stay consistent through any initial increase in barking intensity.',
      durationSeconds: null,
      reps: null,
      tip: 'An initial increase in barking when you first ignore it is normal — hold through it consistently, as responding to louder barking teaches that escalation works.',
      successLook: 'Dog stops barking and offers quiet before receiving attention or resources.'
    }
  ],
  successCriteria: 'Dog goes to mat within 15 seconds of doorbell trigger in 7 out of 10 rehearsed trials.',
  commonMistakes: [
    'Responding to demand barking in any way — even negative attention maintains it',
    'Waiting for perfect silence before the mat redirect — use the mat after 1–2 barks',
    'Skipping window management',
    'Responding during an escalation of barking intensity'
  ],
  equipmentNeeded: ['Baby gate or window barrier', 'Training mat', 'High-value treats', 'Helper for doorbell drills'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'barking_s3',
  trainerNote: 'The goal is not a dog that never barks — it is a dog that barks once or twice, hears your cue, and settles. That is a realistic and excellent outcome.',
  supportsLiveAiTrainer: false,
}

const barking_stage3: Protocol = {
  id: 'barking_s3',
  behavior: 'barking',
  stage: 3,
  title: 'Threshold Management & Real-World Quiet',
  objective: 'Maintain quiet in high-trigger situations through sub-threshold exposure and strong replacement behaviors.',
  durationMinutes: 12,
  repCount: 8,
  steps: [
    {
      order: 1,
      instruction: 'Rank your dog\'s top 3 triggers by intensity. For the mildest, present it at a distance where the dog notices but does not bark. Deliver treats continuously. Increase proximity over sessions — if the dog barks, you are over threshold.',
      durationSeconds: null,
      reps: null,
      tip: 'Every session at sub-threshold builds calm — every session over threshold rehearses the bark.',
      successLook: 'Dog notices trigger at distance, looks at it, then looks at you. No barking.'
    },
    {
      order: 2,
      instruction: 'Guest arrival protocol: before they knock, put the dog on the mat with a Chew Toy. Let the guest enter. If the dog leaves the mat and barks, calmly return them. The guest waits. When the dog settles, the guest approaches.',
      durationSeconds: null,
      reps: 3,
      tip: 'Text guests instructions before they arrive — "Please wait outside until I text you." Most people will cooperate.',
      successLook: 'Dog stays on mat while guest enters, receives a treat, is released after 2 calm minutes.'
    },
    {
      order: 3,
      instruction: 'On walks: when the dog begins to bark at a trigger, say "quiet" once and immediately deliver treats at your hip every 2 seconds while creating distance. Keep moving — do not stop.',
      durationSeconds: null,
      reps: 5,
      tip: 'You are building "trigger = treats from my person," not waiting for the dog to stop barking before rewarding.',
      successLook: 'Dog hears "quiet," orients to handler, accepts treats while moving away from trigger.'
    },
    {
      order: 4,
      instruction: 'Build a name-response reflex: every time your dog spots a known trigger before barking, call their name cheerfully and jackpot when they look at you. Over weeks this becomes automatic.',
      durationSeconds: null,
      reps: null,
      tip: 'The dog that looks to you when they see a trigger has been redirected before the bark ever starts — that is the long-term goal.',
      successLook: 'Dog spots trigger, turns to handler without barking, receives jackpot.'
    }
  ],
  successCriteria: 'Dog remains quiet or quiets within 5 seconds in 6 out of 8 real-world trigger exposures. Holds mat during guest arrival in 5 out of 8 rehearsed sessions.',
  commonMistakes: [
    'Working over threshold — this achieves nothing except rehearsing the bark',
    'Matching the dog\'s arousal level when they bark',
    'Managing barking without building the replacement behavior',
    'Expecting results in under 4 weeks'
  ],
  equipmentNeeded: ['Chew Toy', 'Training mat', 'High-value treats', 'Helper for guest arrival drills', 'Treat pouch'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'Barking is driven by emotion. The protocol addresses the behavior; the counter-conditioning addresses the emotion underneath. Do both or the behavior change will not hold under stress.',
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
  objective: 'Neutralize the departure cues (keys, coat, shoes) that trigger anxiety before you even leave.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'List your pre-departure routine in order. Each step — putting on shoes, picking up keys, putting on your coat — is a departure cue the dog has learned predicts being alone. You will desensitize each one separately.',
      durationSeconds: null,
      reps: null,
      tip: 'For many anxious dogs, anxiety peaks before departure, not after — the cues are more powerful than the act itself.',
      successLook: 'You have identified your top 3–5 departure cues.'
    },
    {
      order: 2,
      instruction: 'Pick up your keys — nothing else — walk to the couch, sit for 5 minutes, and put them back. Repeat 5 times per day for 3 days.',
      durationSeconds: 300,
      reps: 5,
      tip: 'You are diluting the statistical prediction: if keys happen 15 times a day and departure only happens once, the prediction breaks.',
      successLook: 'Dog watches you pick up keys but relaxes back down within 30 seconds.'
    },
    {
      order: 3,
      instruction: 'Put your shoes on in the morning, sit at your desk for an hour, then take them off. No departure. Do this for 3 days. Tackle each cue independently before combining.',
      durationSeconds: null,
      reps: null,
      tip: 'Desensitize one cue at a time — shoes one week, coat another. Do not rush to combine them.',
      successLook: 'Dog remains settled or shows only mild interest when shoes go on.'
    },
    {
      order: 4,
      instruction: 'Run the full departure sequence without leaving: shoes → keys → coat → walk to door → open it → stand in doorway 10 seconds → close it → remove coat → put keys down → sit on couch. Give the dog a Chew Toy throughout.',
      durationSeconds: null,
      reps: 3,
      tip: 'The Chew Toy pairs the departure routine with something pleasant — you are making the whole sequence a non-event.',
      successLook: 'Dog licks the Chew Toy and remains calm through the full departure routine.'
    }
  ],
  successCriteria: 'Dog shows no panting, pacing, or whining during the full departure cue sequence in 10 out of 15 repetitions.',
  commonMistakes: [
    'Rushing through cue desensitization to get to real departures',
    'Making departures emotionally dramatic at the door',
    'Skipping the Chew Toy pairing',
    'Desensitizing all cues simultaneously'
  ],
  equipmentNeeded: ['Chew Toy', 'Your keys, shoes, coat', 'Pet camera (optional but recommended)'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'separation_s2',
  trainerNote: 'Separation anxiety is a genuine anxiety disorder — not disobedience. If the dog is severely affected (howling for hours, injuring themselves), consult a veterinary behaviorist. Medication may be appropriate alongside behavior modification.',
  supportsLiveAiTrainer: false,
}

const separation_stage2: Protocol = {
  id: 'separation_s2',
  behavior: 'separation_anxiety',
  stage: 2,
  title: 'Short Absences: 30 Seconds to 10 Minutes',
  objective: 'Build a history of successful calm short departures that teach the dog: being alone is temporary and always ends with your return.',
  durationMinutes: 15,
  repCount: 8,
  steps: [
    {
      order: 1,
      instruction: 'Set up a camera before any departures. You cannot know how the dog behaves alone without watching — review every session.',
      durationSeconds: null,
      reps: null,
      tip: 'Silent at your return does not mean calm the whole time — the camera shows you the truth.',
      successLook: 'Camera is positioned and recording the dog\'s full resting area.'
    },
    {
      order: 2,
      instruction: 'Give the dog a Chew Toy, say your departure cue word ("I\'ll be back"), step outside, close the door, wait 30 seconds, and return calmly. No big hello.',
      durationSeconds: 30,
      reps: 3,
      tip: 'Return before any stress response — you are building a history of "the door always opens again before anything bad happens."',
      successLook: 'Dog eats from the Chew Toy for 30 seconds, door opens, dog looks up calmly.'
    },
    {
      order: 3,
      instruction: 'Build duration in small steps across separate sessions: 30 sec → 1 min → 2 min → 3 min → 5 min → 8 min → 10 min. Only advance when camera footage confirms calm at the previous duration.',
      durationSeconds: null,
      reps: null,
      tip: 'The progression must be dictated by footage, not your schedule. If you need to leave for work before this is built, use a sitter or daycare.',
      successLook: 'Dog rests or works on Chew Toy for the full duration with no distress signals on camera.'
    },
    {
      order: 4,
      instruction: 'If the dog shows distress (howling, pacing, drooling, destruction) at any duration, reduce the next session to 50% of the last successful one and rebuild.',
      durationSeconds: null,
      reps: null,
      tip: 'Regression is not failure — it is data telling you where the real threshold is.',
      successLook: 'After reduction, dog returns to calm behavior at the lower duration.'
    }
  ],
  successCriteria: 'Dog remains calm on camera for 10 minutes, no distress signals, 6 out of 8 sessions.',
  commonMistakes: [
    'Advancing duration based on your schedule rather than footage',
    'Emotional homecomings — return calmly, greet after the dog has settled',
    'No Chew Toy during early departures',
    'Long departures before short ones are consistently calm'
  ],
  equipmentNeeded: ['Chew Toy', 'Pet camera', 'Timer'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: 'separation_s3',
  trainerNote: 'Most protocols fail because owners rush duration. The dog must be calm for the full duration before you advance. This takes weeks. If you cannot commit to a gradual schedule, manage with a sitter while practicing in evenings.',
  supportsLiveAiTrainer: false,
}

const separation_stage3: Protocol = {
  id: 'separation_s3',
  behavior: 'separation_anxiety',
  stage: 3,
  title: 'Extended Alone Time & Full Independence',
  objective: 'Build calm, independent alone time up to 3–4 hours through graduated departures and consistent pre-departure routines.',
  durationMinutes: 15,
  repCount: 6,
  steps: [
    {
      order: 1,
      instruction: 'Establish a consistent pre-departure ritual every time: 20 min exercise → Chew Toy prepared → departure cue word → leave. No variation.',
      durationSeconds: null,
      reps: null,
      tip: 'Predictability is calming — "I know what this is. It ends. I have done it before."',
      successLook: 'Dog accepts the Chew Toy and settles without following you to the door.'
    },
    {
      order: 2,
      instruction: 'Extend from 10 minutes toward 30, 60, 90 minutes, and 2–3 hours using camera-confirmed steps. Add only 15 minutes at a time once past 60 minutes.',
      durationSeconds: null,
      reps: null,
      tip: 'The jump from 60 minutes to 3 hours is 6–8 incremental steps — plan for it.',
      successLook: 'Dog is asleep or resting on camera for the majority of a 90-minute session.'
    },
    {
      order: 3,
      instruction: 'For longer absences, rotate enrichment items: Chew Toy tower, snuffle mat, Licki Mat, frozen marrow bone. Novelty extends calm engagement through the highest-risk first 20 minutes.',
      durationSeconds: null,
      reps: null,
      tip: 'After the first 20 minutes, most dogs settle and sleep — enrichment just covers that window.',
      successLook: 'Dog engages with enrichment for 15+ minutes before lying down.'
    },
    {
      order: 4,
      instruction: 'On return: ignore the dog for 2 minutes before greeting. Greet calmly with low-energy affection.',
      durationSeconds: 120,
      reps: null,
      tip: 'A calm return prevents the reunion becoming a hyper-arousal event the dog anticipates and stresses toward.',
      successLook: 'Dog waits calmly, receives a gentle greeting, does not escalate into spinning or jumping.'
    },
    {
      order: 5,
      instruction: 'Maintain with two practice sessions per week even once reliable. If a major life change occurs (move, new pet, new schedule), proactively return to Stage 1 as a preventive measure.',
      durationSeconds: null,
      reps: null,
      tip: 'A "cured" separation anxiety dog still has an anxiety history — maintained skills hold; abandoned skills fade.',
      successLook: 'Dog settles quickly and rests on camera during routine 3-hour sessions.'
    }
  ],
  successCriteria: 'Dog remains calm on camera for 3 hours, no stress signals, 5 out of 6 sessions.',
  commonMistakes: [
    'Declaring success before 3-hour sessions have been camera-verified',
    'Abandoning the pre-departure routine once things seem reliable',
    'Not accounting for life-change triggers',
    'Any punishment for anxiety-related destruction — this worsens anxiety'
  ],
  equipmentNeeded: ['Pet camera', 'Enrichment variety (Chew Toy, Licki Mat, snuffle mat, marrow bone)', 'Timer'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 4,
  nextProtocolId: null,
  trainerNote: 'If there is no meaningful improvement by Stage 3, seek a veterinary behaviorist evaluation. For genuinely anxious dogs, medication alongside behavior modification is not a crutch — it makes the behavior work possible.',
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
  objective: 'Teach the dog to sit and wait at any door until released, never bolting through.',
  durationMinutes: 8,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Approach an interior door with your dog. Touch the doorknob. If the dog moves toward the door, remove your hand and wait. When they back up or sit, say "yes!" and treat.',
      durationSeconds: null,
      reps: null,
      tip: 'You are teaching: stillness = door opens, surging forward = door does not open.',
      successLook: 'Dog backs up or stands still when you touch the doorknob.'
    },
    {
      order: 2,
      instruction: 'Begin opening the door 1 inch. If the dog surges, close it immediately. If they hold still, open 2 inches, then 3. Treat at each pause.',
      durationSeconds: null,
      reps: 10,
      tip: 'The closing door is information, not punishment — keep it mechanical and emotionless.',
      successLook: 'Dog holds still while door opens 6 inches.'
    },
    {
      order: 3,
      instruction: 'Add the cue "wait" as you reach for the doorknob. Once the dog stills, say "yes!" and treat. Open the door. Do 8 reps.',
      durationSeconds: null,
      reps: 8,
      tip: '"Wait" means "hold your position until I release you" — use "free!" or "okay" to release every time.',
      successLook: 'Dog hears "wait," pauses, receives treat, holds while door opens fully.'
    },
    {
      order: 4,
      instruction: 'Open the door fully. Hold the wait for 3 seconds. Say "free!" and let them go through. Do 5 reps.',
      durationSeconds: null,
      reps: 5,
      tip: 'A dog that knows the release is always coming learns to wait confidently, not anxiously.',
      successLook: 'Dog holds wait with door wide open until released, then passes through calmly.'
    }
  ],
  successCriteria: 'Dog holds wait at an open interior door for 5 seconds before release, 12 out of 15 reps.',
  commonMistakes: [
    'Opening the door too fast before the behavior is solid at each width',
    'No verbal release — the dog should never self-release',
    'Practicing only on the front door — interior doors first',
    'Allowing even one bolt-through'
  ],
  equipmentNeeded: ['High-value treats', 'Treat pouch'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'door_manners_s2',
  trainerNote: 'Door bolting is a safety emergency waiting to happen. Do not advance to front door practice until interior door wait is absolutely reliable — 10 out of 10.',
  supportsLiveAiTrainer: true,
}

const door_manners_stage2: Protocol = {
  id: 'door_manners_s2',
  behavior: 'door_manners',
  stage: 2,
  title: 'Front Door & Exterior Wait',
  objective: 'Transfer the wait behavior to the front door and exterior entrances with distractions.',
  durationMinutes: 10,
  repCount: 12,
  steps: [
    {
      order: 1,
      instruction: 'Transfer to the front door with the dog on leash for safety. Use the exact same procedure: touch knob → dog holds → open incrementally → treat → fully open → 5-second hold → "free!"',
      durationSeconds: null,
      reps: 5,
      tip: 'Keep the leash loose — it is a safety backup, not a restraint.',
      successLook: 'Dog holds wait at open front door for 5 seconds before release.'
    },
    {
      order: 2,
      instruction: 'Add outdoor distractions: have a helper walk across the driveway while the door is open. Treat rapidly (every 2 seconds) while the door is open and distractions are present.',
      durationSeconds: null,
      reps: 5,
      tip: 'This is the hardest step — the whole world is visible and the dog cannot go to it. Frequent treats help sustain the hold.',
      successLook: 'Dog holds wait with open front door and a person walking past.'
    },
    {
      order: 3,
      instruction: 'Guest arrival: doorbell rings → dog goes to mat or waits → door opens to a helper → helper enters, ignores the dog, sits down → dog released to greet after 30 calm seconds.',
      durationSeconds: 30,
      reps: 3,
      tip: 'Brief your guests — a guest who immediately greets the jumping dog breaks the protocol.',
      successLook: 'Dog holds wait or mat while guest enters and sits down.'
    },
    {
      order: 4,
      instruction: 'Practice coming-in wait: after a walk or yard time, ask for wait at the exterior door before entering. Treat and release after 3 seconds.',
      durationSeconds: null,
      reps: 4,
      tip: 'Door wait both ways generalizes the behavior in both directions simultaneously.',
      successLook: 'Dog pauses at the exterior door before entering on "wait."'
    }
  ],
  successCriteria: 'Dog holds wait at open front door for 5 seconds with a person visible outside, 9 out of 12 reps.',
  commonMistakes: [
    'Advancing to the front door before interior wait is reliable',
    'Using the leash to hold the dog rather than the cue',
    'Guests who immediately greet the dog',
    'Testing with real guests before distraction-proofing is complete'
  ],
  equipmentNeeded: ['Leash', 'High-value treats', 'Treat pouch', 'Helper'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'door_manners_s3',
  trainerNote: 'Every household member and regular visitor must know the protocol. One person who lets the dog fly out without a wait undoes weeks of training.',
  supportsLiveAiTrainer: true,
}

const door_manners_stage3: Protocol = {
  id: 'door_manners_s3',
  behavior: 'door_manners',
  stage: 3,
  title: 'Off-Leash Door Wait & Reliability Under Pressure',
  objective: 'Proof the door wait off-leash and in high-excitement conditions.',
  durationMinutes: 10,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Remove the leash and ask for "wait" at the front door. If the dog bolts, calmly bring them back inside, close the door, and restart. No emotional reaction — just reset.',
      durationSeconds: null,
      reps: 5,
      tip: 'The absence of the leash reveals whether the behavior is real or leash-dependent.',
      successLook: 'Dog holds wait at open front door with no leash for 5 seconds.'
    },
    {
      order: 2,
      instruction: 'Test under arousal: play for 5 minutes to get the dog excited, then ask for wait at the door. If they cannot hold it, the behavior is not reliable under real-world conditions.',
      durationSeconds: null,
      reps: 3,
      tip: 'Most door accidents happen when the dog is excited — train at high arousal because that is when it matters.',
      successLook: 'Dog holds wait at open door even when physically excited.'
    },
    {
      order: 3,
      instruction: '"Emergency recall through door": say "free!" and let the dog go out, then immediately call them back inside. Jackpot for a fast response.',
      durationSeconds: null,
      reps: 4,
      tip: 'If the dog bolts and you are at the door, your recall must work at the threshold — build it here deliberately.',
      successLook: 'Dog steps outside, hears recall cue, turns and re-enters.'
    },
    {
      order: 4,
      instruction: 'Generalize to all entrances: back gate, garage door, car door. Each needs 2–3 reps to transfer.',
      durationSeconds: null,
      reps: null,
      tip: 'The generalization builds fast once the foundation is solid — most dogs transfer within 2 reps at a new location.',
      successLook: 'Dog holds wait at gate, car door, and garage on "wait" cue.'
    }
  ],
  successCriteria: 'Dog holds off-leash wait at open front door for 5 seconds in 8 out of 10 trials, including 3 at elevated arousal.',
  commonMistakes: [
    'Only testing in calm conditions',
    'Not proofing at other doorways',
    'Dropping the practice once reliability seems good',
    'Not building the recall-at-threshold as a safety behavior'
  ],
  equipmentNeeded: ['High-value treats', 'Long line as optional safety backup for early off-leash trials'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'A dog with reliable door manners is safe. The 3-stage investment — perhaps 15 sessions total — could prevent a tragedy. Every rep matters.',
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
  objective: 'Build the core understanding that restraint earns access and grabbing earns nothing.',
  durationMinutes: 8,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Hold treats in your open palm. Close your fist the instant the dog moves toward them. The moment the dog backs away, open your fist. If they wait without diving in, say "yes!" and let them take one treat.',
      durationSeconds: null,
      reps: null,
      tip: 'Say nothing — complete silence. Let the dog solve it: "What makes the fist open?" Answer: not pushing.',
      successLook: 'Dog backs away from the closed fist and the fist opens. Dog waits for permission before taking.'
    },
    {
      order: 2,
      instruction: 'Open palm, treats visible. If the dog moves toward them, close your fist. If they hold back and look at you, say "yes!" and let them take one.',
      durationSeconds: null,
      reps: 10,
      tip: 'Close before nose contact — you must be faster than the dog.',
      successLook: 'Dog looks at the open palm, glances at your face, and waits.'
    },
    {
      order: 3,
      instruction: 'Sitting down, place one treat on your knee. Say nothing. Cover it if needed. When the dog backs away and makes eye contact with you, say "yes!" and let them take it.',
      durationSeconds: null,
      reps: 10,
      tip: 'The eye contact is the behavior — "I don\'t grab, I check in with my person" is the entire habit.',
      successLook: 'Dog looks at the treat, then makes eye contact with you before you mark.'
    },
    {
      order: 4,
      instruction: 'Practice before every meal: hold the food bowl and lower it. If the dog dives, lift it back. When the dog steps back calmly, place it down and say "free!"',
      durationSeconds: null,
      reps: null,
      tip: 'Mealtime is free daily practice — never skip it.',
      successLook: 'Dog waits for "free!" before eating, every meal.'
    }
  ],
  successCriteria: 'Dog waits with treats on open palm for 3 seconds without grabbing, 15 out of 20 reps. Dog waits for bowl to be placed and "free!" before eating, 7 consecutive meals.',
  commonMistakes: [
    'Using verbal cues during the game — silence teaches self-regulation',
    'Letting the dog succeed at grabbing even once',
    'Skipping mealtime practice',
    'Moving to distractions before the palm game is reliable'
  ],
  equipmentNeeded: ['Kibble or low-value treats', 'Dog\'s regular food bowl'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'impulse_s2',
  trainerNote: 'Impulse control is the meta-behavior — every other protocol in this app is easier for a dog who has it. Invest here heavily.',
  supportsLiveAiTrainer: false,
}

const impulse_control_stage2: Protocol = {
  id: 'impulse_s2',
  behavior: 'impulse_control',
  stage: 2,
  title: 'Threshold Control: Food, Toys & Doors',
  objective: 'Apply impulse control to the most common real-life trigger points: counters, exciting toys, car doors, and leash time.',
  durationMinutes: 10,
  repCount: 12,
  steps: [
    {
      order: 1,
      instruction: 'Place a boring treat on the edge of a coffee table. Stand beside it. If the dog moves toward it, cover it with your hand. When they back up and make eye contact, mark and reward from your pouch — not from the table.',
      durationSeconds: null,
      reps: 5,
      tip: 'The reward always comes from you — "things on surfaces are not for dogs."',
      successLook: 'Dog backs away from the table treat and looks at you.'
    },
    {
      order: 2,
      instruction: 'Toy threshold: hold an exciting toy and wiggle it. The moment the dog reaches for it, stop moving the toy. When the dog sits or pauses, say "yes!" and immediately start the game.',
      durationSeconds: null,
      reps: 5,
      tip: '"Calm behavior launches exciting things" — this principle transfers to every exciting moment.',
      successLook: 'Dog pauses or sits. You initiate play.'
    },
    {
      order: 3,
      instruction: 'Car door: open the car door, dog must wait before jumping in. If they jump in without permission, calmly ask them out and restart. Say "free!" and jackpot immediately when they wait and jump in on cue.',
      durationSeconds: null,
      reps: 5,
      tip: 'A dog that bolts into traffic because a car door opened is in real danger — train this seriously.',
      successLook: 'Dog waits at open car door until released, then jumps in and settles.'
    },
    {
      order: 4,
      instruction: 'Leash excitement: pick up the leash. If the dog spins or jumps, put it back down. When they stand or sit calmly, clip the leash. Repeat until calm is the default.',
      durationSeconds: null,
      reps: null,
      tip: 'Practice the leash ritual separately from actual walks — do not do this when you are in a hurry.',
      successLook: 'Dog sits calmly while leash is clipped, waits for release before walking to the door.'
    }
  ],
  successCriteria: 'Dog ignores table treat and looks to handler in 8 out of 12 reps. Dog waits at car door in 8 out of 10 trials.',
  commonMistakes: [
    'Rewarding from the surface — always from your hand or pouch',
    'Starting play before the dog has fully paused',
    'Practicing car door in a rush',
    'Putting the leash away when the dog is still frantic'
  ],
  equipmentNeeded: ['Treats in pouch', 'Exciting toy', 'Leash', 'Car access'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'impulse_s3',
  trainerNote: 'The threshold control principle is universal: the dog must offer calm before exciting things happen. Applied consistently, this becomes the dog\'s default operating mode.',
  supportsLiveAiTrainer: false,
}

const impulse_control_stage3: Protocol = {
  id: 'impulse_s3',
  behavior: 'impulse_control',
  stage: 3,
  title: 'Real-World Restraint: Strangers, Other Dogs & Distractions',
  objective: 'Apply impulse control to outdoor and social contexts — greetings, other dogs, and exciting stimuli on walks.',
  durationMinutes: 12,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: '"Sit before greeting": when a person wants to pet the dog, ask for sit. If they sit, the person approaches. If they lunge or jump, the person turns away and you re-cue the sit.',
      durationSeconds: null,
      reps: 4,
      tip: 'Brief the greeter: "Could you wait until he sits?" Most people are happy to help.',
      successLook: 'Dog sits while the stranger approaches and receives a calm greeting.'
    },
    {
      order: 2,
      instruction: 'On-leash dog passing: when another dog is visible, ask for sit or focus and deliver treats every 2 seconds while the dog is in view. Stop treating when the dog passes.',
      durationSeconds: null,
      reps: 3,
      tip: '"Other dog visible = treats from my person" is the association you are building.',
      successLook: 'Dog notices the other dog, glances at it, then orients to handler for treats.'
    },
    {
      order: 3,
      instruction: '"Deferred excitement": dog sees something exciting (ball, child running). Ask for sit and hold it for 5 seconds. Release with "free!" and move toward the exciting thing.',
      durationSeconds: null,
      reps: 3,
      tip: 'Calm = access. Frantic = delay. This principle, applied to exciting stimuli, teaches self-regulation.',
      successLook: 'Dog sits with an exciting stimulus visible, holds 5 seconds, released calmly.'
    },
    {
      order: 4,
      instruction: '"Off-switch" game: play tug for 30 seconds, say "done" and stop. Ask for down. Dog must settle within 10 seconds. Reward the down, then restart play.',
      durationSeconds: 30,
      reps: 3,
      tip: 'A dog that can go from active play to a down in 10 seconds has genuine emotional self-regulation.',
      successLook: 'Dog transitions from play to down within 10 seconds of "done."'
    }
  ],
  successCriteria: 'Dog sits for stranger greeting in 7 out of 10 trials. Orients to handler when another dog passes in 6 out of 10 outdoor encounters.',
  commonMistakes: [
    'Allowing the greeting without the sit even once',
    'Starting dog-passing work when the other dog is too close',
    'Correction for lunging — the answer is more distance, not punishment',
    'Not maintaining the off-switch game regularly'
  ],
  equipmentNeeded: ['Treat pouch', 'High-value treats', 'Leash', 'Tug toy'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'A dog with strong real-world impulse control is welcome everywhere. The training investment here pays every single day for the rest of the dog\'s life.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// COOPERATIVE CARE
// ─────────────────────────────────────────────────────────────────────────────

const coop_care_stage1: Protocol = {
  id: 'coop_care_s1',
  behavior: 'cooperative_care',
  stage: 1,
  title: 'Touch Acceptance: Paws, Ears & Mouth',
  objective: 'Build genuine comfort with handling of the paws, ears, and mouth for routine care.',
  durationMinutes: 8,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Touch the dog\'s shoulder and treat. Move to the elbow, lower leg, then briefly touch the paw. Treat at every new zone. If the dog pulls away, reduce pressure and restart from the shoulder.',
      durationSeconds: null,
      reps: 5,
      tip: 'Work from least sensitive to most sensitive: body → legs → paws → between toes.',
      successLook: 'Dog holds still while you move from shoulder to paw with light pressure.'
    },
    {
      order: 2,
      instruction: 'Cup each paw gently for 2 seconds while treating continuously — one treat every 1–2 seconds throughout the hold. Do 5 reps per paw.',
      durationSeconds: null,
      reps: 5,
      tip: 'Treating during the hold (not after) tells the dog the hold itself is not threatening.',
      successLook: 'Dog rests paw in your cupped hand for 3 seconds while eating continuously.'
    },
    {
      order: 3,
      instruction: 'Ear handling: touch the base, slide to the flap, gently lift and hold for 3 seconds. Treat continuously. If the dog pulls away or shakes, reduce intensity.',
      durationSeconds: null,
      reps: 5,
      tip: 'Stop if you see stress signals — pulling away, whale eye, shaking. Reduce and rebuild.',
      successLook: 'Dog allows ear flap lifted and held for 2 seconds without pulling.'
    },
    {
      order: 4,
      instruction: 'Mouth handling: touch the muzzle, lift the lip to see gum line, briefly open the mouth by pressing gently on the lower jaw. Treat at each step.',
      durationSeconds: null,
      reps: 5,
      tip: 'A dog comfortable with mouth handling will accept dental care and oral medication — these are life-extending skills.',
      successLook: 'Dog allows lips lifted and mouth briefly opened without pulling away.'
    }
  ],
  successCriteria: 'Dog accepts 3-second paw hold, ear flap lift, and lip exam without resistance in 10 out of 15 sessions.',
  commonMistakes: [
    'Moving to a new body zone before the current one is calm',
    'Treating after handling ends rather than during',
    'Practicing when the dog is tired or hungry',
    'Restraining when the dog resists — reduce intensity instead'
  ],
  equipmentNeeded: ['High-value treats (tiniest possible pieces)', 'Treat pouch', 'Quiet room'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'coop_care_s2',
  trainerNote: 'A dog that accepts handling is safer around children, easier to groom, and less likely to bite during pain or injury. Run a monthly 5-minute handling refresher for life.',
  supportsLiveAiTrainer: false,
}

const coop_care_stage2: Protocol = {
  id: 'coop_care_s2',
  behavior: 'cooperative_care',
  stage: 2,
  title: 'Nail Trim Desensitization',
  objective: 'Build step-by-step acceptance of nail trimming from first sight of clippers to completing a full trim.',
  durationMinutes: 10,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Show the nail clippers to the dog. Any calm investigation earns a treat. Do this for 3 sessions — clippers should become a treat-predicting object.',
      durationSeconds: null,
      reps: null,
      tip: 'If the dog shows fear at the sight of clippers, place them on the floor at a distance and treat for looking at them from there.',
      successLook: 'Dog approaches clippers and sniffs them, looking for the treat.'
    },
    {
      order: 2,
      instruction: 'Touch the closed clippers to the paw, then to each toe. Build to: holding a paw with clippers in hand, then placing the clipper opening around one nail without cutting. Treat richly at every step.',
      durationSeconds: null,
      reps: 5,
      tip: 'Each step may take multiple sessions. This protocol typically takes 2–4 weeks done correctly.',
      successLook: 'Dog holds still while clipper opening is placed around one nail.'
    },
    {
      order: 3,
      instruction: 'Trim one nail only. Use sharp clippers. Clip just the tip — stay well clear of the quick. Give a jackpot of 5 treats immediately. Stop. Next session: 2 nails.',
      durationSeconds: null,
      reps: null,
      tip: 'One nail and done is not weakness — it is the strategy that builds a dog who tolerates a full trim.',
      successLook: 'Dog holds still through the click of the clipper on one nail, receives jackpot.'
    },
    {
      order: 4,
      instruction: 'Once the dog accepts a full trim, maintain the positive association — always use high-value treats throughout every trim, even for a calm experienced dog.',
      durationSeconds: null,
      reps: null,
      tip: 'Monthly trimming keeps nails short and the dog comfortable. Overgrown nails cause gait changes and joint pain.',
      successLook: 'Dog holds still through a full trim with only mild interest in the treats.'
    }
  ],
  successCriteria: 'Dog accepts clipper placement on 3 different nails without resistance, 7 out of 10 sessions. Full trim completed with treat support in 3 consecutive sessions.',
  commonMistakes: [
    'Rushing to a full trim before each step is calm',
    'Dull clippers — replace annually at minimum',
    'Gripping the paw harder when the dog resists — release and reduce',
    'Stopping treats once the dog "knows" nail trim'
  ],
  equipmentNeeded: ['Sharp nail clippers', 'Best available treats', 'Styptic powder in case of quick strike'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'coop_care_s3',
  trainerNote: 'Nail trimming anxiety is among the top reasons dogs are sedated at the vet. The 4 weeks of this protocol can save years of vet stress and dog suffering — it is worth every session.',
  supportsLiveAiTrainer: false,
}

const coop_care_stage3: Protocol = {
  id: 'coop_care_s3',
  behavior: 'cooperative_care',
  stage: 3,
  title: 'Vet Visit Simulation & Table Confidence',
  objective: 'Simulate a full vet exam so the dog enters the clinic calm and tolerates a complete physical without stress.',
  durationMinutes: 12,
  repCount: 8,
  steps: [
    {
      order: 1,
      instruction: 'Table training: lift a small dog onto a table and feed treats continuously for 30 seconds. Lift them off. Repeat 5 times. For larger dogs, use a raised platform.',
      durationSeconds: 30,
      reps: 5,
      tip: 'The vet table is cold, metal, and unfamiliar — simulate this with a folding table before the real thing.',
      successLook: 'Dog stands on the raised surface, eating treats, without trying to jump off.'
    },
    {
      order: 2,
      instruction: 'Simulate a full exam weekly: run your hands firmly over the entire body — head, neck, chest, abdomen, back, legs, tail. Look in ears, mouth, squeeze each toe. Treat continuously throughout.',
      durationSeconds: null,
      reps: 3,
      tip: 'This weekly home exam also functions as early health detection — you will notice lumps or pain that would otherwise go undetected.',
      successLook: 'Dog stands or lies calmly through a 3-minute full-body exam.'
    },
    {
      order: 3,
      instruction: 'Visit the vet clinic for a "happy visit" — no exam, no shots. Walk in, let the dog get treats from staff, sit in the waiting room 5 minutes, and leave. Repeat monthly.',
      durationSeconds: null,
      reps: null,
      tip: 'Call ahead — most clinics welcome happy visits. 10 minutes transforms the dog\'s relationship with the clinic.',
      successLook: 'Dog enters the clinic without pulling backward and accepts a treat from staff.'
    },
    {
      order: 4,
      instruction: 'Practice restraint tolerance: firmly hold the dog in a standing position for 30 seconds while treating continuously. This is exactly what vet techs do.',
      durationSeconds: 30,
      reps: 3,
      tip: 'A dog with no restraint history who is suddenly held firmly will panic and may bite — practice makes this familiar.',
      successLook: 'Dog accepts firm hold in standing position for 30 seconds with minimal resistance.'
    }
  ],
  successCriteria: 'Dog accepts a 3-minute full-body home exam with continuous treats, 6 out of 8 sessions. Dog enters vet clinic without pulling backward on 2 consecutive happy visits.',
  commonMistakes: [
    'Practicing home handling only and skipping vet happy visits',
    'Doing the home exam only when something is wrong',
    'Restraining harder when the dog struggles — release and reduce',
    'Not advocating for slow, treat-supported exams at the vet'
  ],
  equipmentNeeded: ['Raised surface or folding table', 'High-value treats', 'Vet clinic access for happy visits'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: null,
  trainerNote: 'A calm dog receives better vet care — veterinarians can perform a more thorough exam and are more likely to catch problems early. Cooperative care is health care.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// WAIT & STAY
// ─────────────────────────────────────────────────────────────────────────────

const wait_stay_stage1: Protocol = {
  id: 'wait_stay_s1',
  behavior: 'wait_and_stay',
  stage: 1,
  title: 'Wait vs Stay: Teaching the Difference',
  objective: 'Install two distinct cues — "wait" (brief pause, any position) and "stay" (hold in position until released).',
  durationMinutes: 8,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: '"Wait" practice: while walking, say "wait" and stop. The moment the dog pauses — any position — mark "yes!" and continue walking. Do 8 reps.',
      durationSeconds: null,
      reps: 8,
      tip: '"Wait" is a positional pause, not a sit. Mark any paused movement, regardless of body position.',
      successLook: 'Dog pauses movement when "wait" is said, regardless of position.'
    },
    {
      order: 2,
      instruction: '"Stay" practice: ask for sit, say "stay" with palm out, count 5 seconds, return to the dog, treat in position, say "free!" to release. Do 7 reps.',
      durationSeconds: null,
      reps: 7,
      tip: '"Stay" requires a specific position held until released — that is what makes it different from wait.',
      successLook: 'Dog holds sit for 5 seconds, released formally with "free!"'
    },
    {
      order: 3,
      instruction: 'Alternate the two cues back-to-back: walk → "wait" → acknowledge → walk again → sit → "stay" → 10-second hold → "free!" Repeat 5 cycles.',
      durationSeconds: null,
      reps: 5,
      tip: 'The contrast between the two cues teaches the distinction — practicing them in alternation forces the dog to listen to the specific word.',
      successLook: 'Dog shows different responses to "wait" (brief positional pause) and "stay" (formal held position).'
    }
  ],
  successCriteria: 'Dog pauses on "wait" without sitting in 10 out of 15 reps. Dog holds sit-stay for 10 seconds in 10 out of 15 reps.',
  commonMistakes: [
    'Using "wait" and "stay" interchangeably — each word must have one meaning',
    'Asking for sit every time you say "wait"',
    'No formal release from stay',
    'Building duration before the cue distinction is clear'
  ],
  equipmentNeeded: ['High-value treats', 'Treat pouch', 'Low-distraction room'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'wait_stay_s2',
  trainerNote: 'Wait at the curb, stay on the mat during guests — both solve different real-life problems. Build both.',
  supportsLiveAiTrainer: true,
}

const wait_stay_stage2: Protocol = {
  id: 'wait_stay_s2',
  behavior: 'wait_and_stay',
  stage: 2,
  title: 'Stay with Distance & Handler Movement',
  objective: 'Build stay to 30 seconds at 10 feet with the handler moving laterally.',
  durationMinutes: 10,
  repCount: 12,
  steps: [
    {
      order: 1,
      instruction: 'From a 15-second stay directly in front, step left — return and treat. Step right — return and treat. Step behind the dog — return and treat. Each direction is a new challenge.',
      durationSeconds: null,
      reps: 5,
      tip: 'Moving behind the dog (out of their sight line) is the hardest step — build to it gradually.',
      successLook: 'Dog holds stay while handler moves to all sides including briefly behind them.'
    },
    {
      order: 2,
      instruction: 'Build to 10 feet: one step back → return → two steps → return → five feet → return → 10 feet → return. Three successful reps at each distance before extending.',
      durationSeconds: null,
      reps: 7,
      tip: 'Use variable distance — sometimes 3 feet, sometimes 8. The dog should not be able to predict the difficulty.',
      successLook: 'Dog holds stay while handler backs up to 10 feet and pauses for 5 seconds.'
    },
    {
      order: 3,
      instruction: 'Combine distance and movement: walk to 8 feet, step sideways, step back toward the dog, step away again, return. Dog must hold through all of it.',
      durationSeconds: null,
      reps: null,
      tip: 'Real-life stays involve moving handlers — a stay that only works when you stand frozen is not trained.',
      successLook: 'Dog holds stay while handler moves unpredictably within a 10-foot radius.'
    }
  ],
  successCriteria: 'Dog holds sit-stay for 20 seconds with handler at 10 feet moving laterally, 8 out of 12 trials.',
  commonMistakes: [
    'Building distance before duration is solid',
    'Running back to the dog — excites them and causes breaking',
    'Not varying distance to prevent anticipation',
    'Releasing the moment you return rather than pausing first'
  ],
  equipmentNeeded: ['High-value treats', 'Treat pouch', 'Room with space to move'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'wait_stay_s3',
  trainerNote: 'A stay that holds while you move is a stay that holds in real life. Train with movement from the beginning and your stay will be solid in every situation.',
  supportsLiveAiTrainer: true,
}

const wait_stay_stage3: Protocol = {
  id: 'wait_stay_s3',
  behavior: 'wait_and_stay',
  stage: 3,
  title: 'Stay Under Real-World Pressure',
  objective: 'Proof stay in high-distraction environments and during real-life situations: mealtimes, guests, and curb crossings.',
  durationMinutes: 12,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Mealtime stay: bowl on the floor with dog in sit-stay 3 feet away. If they break toward the bowl, pick it up and reset. Hold for 5 seconds, say "free!" and release to eat.',
      durationSeconds: null,
      reps: null,
      tip: 'Mealtime stay is twice-daily free practice — it takes 30 seconds and keeps the stay sharp without formal sessions.',
      successLook: 'Dog holds sit-stay 3 feet from bowl until "free!"'
    },
    {
      order: 2,
      instruction: 'Doorbell stay: combine with the settle protocol — dog holds a mat or sit-stay while the door opens and a guest enters and walks fully into the room.',
      durationSeconds: null,
      reps: 4,
      tip: 'The dog on a stay-mat during guest arrival is the most socially elegant dog possible to live with.',
      successLook: 'Dog holds stay while guest enters and walks to the couch.'
    },
    {
      order: 3,
      instruction: 'Curb wait: at every curb, ask for a brief "wait," check traffic, say "free!" and cross together. Build this as a lifelong habit on every single walk.',
      durationSeconds: null,
      reps: null,
      tip: 'Done consistently on every walk, the dog begins sitting at curbs automatically within 2–3 weeks.',
      successLook: 'Dog pauses naturally at the curb edge and looks up before crossing.'
    },
    {
      order: 4,
      instruction: 'Outdoor stay on mat: at a park or quiet outdoor space, ask for down-stay. Have a helper walk past at 5 feet, then with a squeaky toy, then with a dog on leash.',
      durationSeconds: null,
      reps: 3,
      tip: 'Build distraction systematically — one new element at a time, 3 successful reps before increasing.',
      successLook: 'Dog holds down-stay outdoors for 30 seconds with a person at 5 feet.'
    }
  ],
  successCriteria: 'Dog holds mat stay during guest arrival in 7 out of 10 rehearsed trials. Pauses at curbs automatically on 8 consecutive walks.',
  commonMistakes: [
    'Skipping mealtime stay — free daily practice is too valuable to skip',
    'Not proofing outdoors before relying on it in outdoor situations',
    'Multiple distraction types introduced at once',
    'Letting stay become optional in daily life'
  ],
  equipmentNeeded: ['Mat (portable)', 'Treat pouch', 'Helper', 'Leash'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'The fully proofed stay is one of the most safety-critical behaviors a dog can have. Build it until it is a reflex, then maintain it forever.',
  supportsLiveAiTrainer: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// LEASH REACTIVITY
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
      instruction: 'With a calm "stooge" dog 100 feet away, walk your dog toward it until they notice but don\'t react. That distance is their threshold. Note it — this is your starting point.',
      durationSeconds: null,
      reps: null,
      tip: 'Threshold is the distance at which the dog can notice the trigger but still take a treat and respond to you.',
      successLook: 'Dog notices the other dog at distance, takes a treat, maintains contact with you.'
    },
    {
      order: 2,
      instruction: 'Stay 5 feet beyond threshold. The moment the other dog comes into view, begin feeding treats continuously — one every 2 seconds — until the other dog is out of view or you turn away.',
      durationSeconds: null,
      reps: 5,
      tip: '"Open bar when trigger is visible, closed bar when gone" — this pairs the trigger with treats at the emotional level.',
      successLook: 'Dog sniffs and eats treats while the other dog is visible.'
    },
    {
      order: 3,
      instruction: 'If the dog reacts (lunges, barks): say nothing, turn and walk away until the dog can take a treat. You went over threshold. Add 10 feet next session.',
      durationSeconds: null,
      reps: null,
      tip: 'A reacting dog is over threshold, not misbehaving. Correction at this moment makes reactivity worse — more distance is always the answer.',
      successLook: 'Dog recovers within 30 seconds of moving away and can take treats again.'
    },
    {
      order: 4,
      instruction: 'Over 2–3 sessions at the same threshold distance, watch for the dog to spontaneously orient to you when the other dog appears — looking to you for treats rather than staring at the dog.',
      durationSeconds: null,
      reps: 5,
      tip: 'The spontaneous head-turn toward you is the breakthrough moment — it means counter-conditioning is working.',
      successLook: 'Dog sees the other dog, turns head toward handler immediately, waiting for treats.'
    }
  ],
  successCriteria: 'Dog takes treats and stays calm when the other dog is visible at threshold distance, 7 out of 10 exposures. Orients to handler spontaneously in 4 out of 10 exposures.',
  commonMistakes: [
    'Starting too close — working over threshold rehearses the reaction',
    'Correcting the dog for reacting',
    'Low-value treats — the competition is a real dog',
    'Practicing on regular walks without controlled threshold management'
  ],
  equipmentNeeded: ['High-value treats (chicken, hot dog, cheese)', 'Treat pouch', 'Front-clip harness', '6-foot leash', 'Calm neutral stooge dog'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'reactivity_s2',
  trainerNote: 'Corrections make leash reactivity worse — the dog learns that seeing other dogs predicts punishment, deepening the negative emotional state. Counter-conditioning below threshold is the only evidence-based approach.',
  supportsLiveAiTrainer: false,
}

const reactivity_stage2: Protocol = {
  id: 'reactivity_s2',
  behavior: 'leash_reactivity',
  stage: 2,
  title: 'Shrinking the Threshold Distance',
  objective: 'Systematically reduce the distance at which the dog remains calm around other dogs.',
  durationMinutes: 12,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Run 5 successful reps at your established threshold, then move 5 feet closer. If calm and orienting, this is the new threshold. If reactive, back up 10 feet and rebuild.',
      durationSeconds: null,
      reps: 5,
      tip: 'Move closer in 5-foot increments only — slow shrinking is permanent, fast shrinking regresses.',
      successLook: 'Dog handles the 5-foot-closer distance with the same calm as before.'
    },
    {
      order: 2,
      instruction: '"Look at That" game: when the other dog is visible and dog is sub-threshold, say "look!" in a happy tone. When they look at the dog and look back at you, say "yes!" and jackpot.',
      durationSeconds: null,
      reps: 5,
      tip: 'LAT gives the dog a job when they see a trigger — "notice it, then check in" instead of "notice it, then react."',
      successLook: 'Dog looks at other dog, then immediately looks back to handler.'
    },
    {
      order: 3,
      instruction: 'Parallel walking: walk in the same direction as the stooge dog at 20 feet lateral distance. Treat continuously for 3 minutes. Reduce the distance slightly over 3 sessions.',
      durationSeconds: 180,
      reps: null,
      tip: 'Dogs are less reactive when walking alongside another dog than when facing them — use direction to your advantage.',
      successLook: 'Dog walks beside you with another dog visible 20 feet away for 3 minutes, no reaction.'
    },
    {
      order: 4,
      instruction: 'Test in a new location. Threshold will likely be further in a new environment — start conservatively and rebuild.',
      durationSeconds: null,
      reps: null,
      tip: 'New environment regressions are normal — they mean the dog needs new-location reps, not that training has failed.',
      successLook: 'Dog shows calm orientation behavior in a new location after 2–3 warm-up reps.'
    }
  ],
  successCriteria: 'Dog stays calm and orients to handler with another dog visible at 20 feet, 7 out of 10 trials, in at least 2 different environments.',
  commonMistakes: [
    'Moving closer too fast when sessions go well',
    'Regular walks with unpredictable encounters before threshold is managed',
    'Stopping counter-conditioning when the dog "seems fine"',
    'Only working with one stooge dog'
  ],
  equipmentNeeded: ['High-value treats', 'Treat pouch', 'Front-clip harness or head halter', 'Calm neutral dog and cooperative owner'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: 'reactivity_s3',
  trainerNote: 'Progress is measured in months. A dog that goes from 80-foot threshold to 20-foot threshold over 8 weeks has made enormous progress — compare to your own dog\'s baseline, not to others.',
  supportsLiveAiTrainer: false,
}

const reactivity_stage3: Protocol = {
  id: 'reactivity_s3',
  behavior: 'leash_reactivity',
  stage: 3,
  title: 'Controlled On-Leash Passes & Greetings',
  objective: 'Build the ability to pass other dogs calmly at close range and, for appropriate dogs, a structured on-leash greeting.',
  durationMinutes: 12,
  repCount: 8,
  steps: [
    {
      order: 1,
      instruction: 'Establish calm passes at 10 feet, then parallel walk at 10 feet with the stooge dog. Both dogs walking, both handlers treating. Reduce to 6 feet over 3 sessions.',
      durationSeconds: null,
      reps: 4,
      tip: 'For many reactive dogs, passing at 6 feet without incident is the real-world goal — not every dog needs or should have on-leash greetings.',
      successLook: 'Dog walks past another dog at 6 feet, no reaction, treats flowing.'
    },
    {
      order: 2,
      instruction: 'If appropriate for greeting: approach the stooge dog at an arc (never head-on). Allow a 3-second sniff, then say "let\'s go" and walk away while treating.',
      durationSeconds: null,
      reps: 3,
      tip: 'Head-on approaches are confrontational in dog body language — always arc in from the side.',
      successLook: 'Dog sniffs the stooge briefly via arc approach, then walks away without lunging.'
    },
    {
      order: 3,
      instruction: 'Keep greeting duration to 3 seconds maximum for reactive dogs. The moment leashes begin tangling or either dog escalates, say "let\'s go" and walk away cheerfully.',
      durationSeconds: null,
      reps: 3,
      tip: '"Say hi, then go" — always end on a positive note by leaving before either dog becomes uncomfortable.',
      successLook: 'Both dogs sniff briefly, both handlers move on with loose leashes.'
    },
    {
      order: 4,
      instruction: 'Build "walk past without greeting" as the default. Most encounters should end in a polite pass, not a greeting. The dog learns: seeing a dog does not automatically mean interaction.',
      durationSeconds: null,
      reps: null,
      tip: 'Dogs who expect to greet every dog they see become reactive when denied a greeting — teach polite passing as the default.',
      successLook: 'Dog passes another dog at 6 feet with no reaction and no greeting attempt.'
    }
  ],
  successCriteria: 'Dog passes another dog at 6 feet with no reaction in 6 out of 8 encounters. Dog completes a 3-second arc greeting without lunging in 4 out of 8 rehearsals.',
  commonMistakes: [
    'Head-on approaches',
    'Greetings longer than 3 seconds for reactive dogs',
    'Treating on-leash greetings as required',
    'Stopping counter-conditioning because passing is working'
  ],
  equipmentNeeded: ['High-value treats', 'Treat pouch', 'Front-clip harness', '6-foot leash', 'Calm stooge dog'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 4,
  nextProtocolId: null,
  trainerNote: 'A well-managed reactive dog who can pass calmly and has a handler who understands threshold can live a full, rich life. That is the realistic goal — not perfection.',
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
  objective: 'Teach the dog to sit on a single verbal cue within 2 seconds, no lure, no repeated commands.',
  durationMinutes: 7,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Hold a treat at the dog\'s nose and move it up and back over their head. The instant their rear touches the floor, mark "yes!" and treat. Do 5 reps.',
      durationSeconds: null,
      reps: 5,
      tip: 'Keep the lure at nose height — too high and they jump instead of sitting.',
      successLook: 'Dog follows the lure into a clean sit without jumping or backing up.'
    },
    {
      order: 2,
      instruction: 'Fade the lure: use the same hand motion with no treat in that hand. Mark and reward from your pouch when they sit. Do 10 reps.',
      durationSeconds: null,
      reps: 10,
      tip: 'A dog that only sits when food is visible has not learned to sit — they have learned to follow food.',
      successLook: 'Dog sits following the empty hand signal.'
    },
    {
      order: 3,
      instruction: 'Say "sit" once before the hand signal. After 5 paired reps, try the word alone with hands at your sides. Jackpot if they sit.',
      durationSeconds: null,
      reps: 5,
      tip: 'Say it once and wait — repeating it teaches the first cue is optional.',
      successLook: 'Dog sits on verbal "sit" alone with handler hands at sides.'
    }
  ],
  successCriteria: 'Dog sits on verbal "sit" alone within 2 seconds, 15 out of 20 reps.',
  commonMistakes: [
    'Keeping food visible in the lure hand past rep 5',
    'Repeating the cue multiple times',
    'Pushing the dog\'s rear down',
    'Rewarding a partial hover rather than a full sit'
  ],
  equipmentNeeded: ['High-value small treats', 'Treat pouch', 'Low-distraction room'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'sit_s2',
  trainerNote: 'A sit that "sometimes works" is not a trained sit. Hold the 15/20 standard before advancing — a rock-solid sit is the foundation for greetings, crosswalk safety, and a dozen other daily situations.',
  supportsLiveAiTrainer: true,
}

const sit_stage2: Protocol = {
  id: 'sit_s2',
  behavior: 'sit',
  stage: 2,
  title: 'Sit with Duration & Distance',
  objective: 'Build sit-stay to 20 seconds and 6-foot distance, holding until explicitly released.',
  durationMinutes: 9,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Cue sit, say "stay" with palm out, count 3 seconds, mark while still in position, deliver treat. Do 5 reps.',
      durationSeconds: null,
      reps: 5,
      tip: 'Mark while seated — the mark communicates exactly what earned the treat.',
      successLook: 'Dog holds sit for 3 seconds without shuffling forward.'
    },
    {
      order: 2,
      instruction: 'Build duration variably: 3 sec → 6 sec → 4 sec → 10 sec → 15 sec → 20 sec. Mix shorter and longer. End each rep with "free!" to release.',
      durationSeconds: null,
      reps: 8,
      tip: 'Variable duration prevents anticipation — a dog expecting release at 10 seconds always breaks at 11.',
      successLook: 'Dog holds sit-stay for 20 seconds with handler in front.'
    },
    {
      order: 3,
      instruction: 'Add distance: one step back → return → treat. Two steps → return → treat. Build to 6 feet. Always return to the dog to reward — never call them to you.',
      durationSeconds: null,
      reps: 5,
      tip: 'Calling them to you teaches them to leave the sit for the reward.',
      successLook: 'Dog holds sit-stay while handler moves to 6 feet and returns.'
    }
  ],
  successCriteria: 'Dog holds sit-stay for 20 seconds with handler in front, 10 out of 15 trials. Holds at 6-foot distance for 10 seconds, 8 out of 15 trials.',
  commonMistakes: [
    'Building duration and distance simultaneously',
    'Calling the dog to reward during stay',
    'No formal release cue',
    'Rewarding a reluctant or slow sit the same as an enthusiastic one'
  ],
  equipmentNeeded: ['High-value treats', 'Treat pouch', 'Space to step back'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'sit_s3',
  trainerNote: 'Build duration first, distance second, distraction third — never all three at once.',
  supportsLiveAiTrainer: true,
}

const sit_stage3: Protocol = {
  id: 'sit_s3',
  behavior: 'sit',
  stage: 3,
  title: 'Sit Under Distraction & In Daily Life',
  objective: 'Proof sit in distracting environments and integrate it into daily routines.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Take sit outdoors to the driveway. Do 5 reps — verbal cue only, hands at sides, high-value treats. Accept a 3-second response window rather than 2.',
      durationSeconds: null,
      reps: 5,
      tip: 'Every new environment resets difficulty to beginner — start easy and rebuild.',
      successLook: 'Dog sits on verbal cue outdoors within 3 seconds.'
    },
    {
      order: 2,
      instruction: 'Add a person walking past at 10 feet while the dog holds a sit-stay. Build to: person at 5 feet, person jogging, person with a squeaky toy.',
      durationSeconds: null,
      reps: 5,
      tip: 'Introduce distractions at the lowest intensity first — calm person far away, then increase.',
      successLook: 'Dog holds sit while a person walks past at 5 feet.'
    },
    {
      order: 3,
      instruction: 'Integrate sit into 5 daily routines: before leash goes on, before the food bowl goes down, before greeting any visitor, before crossing a curb, before getting in or out of the car.',
      durationSeconds: null,
      reps: null,
      tip: 'Real-life sit opportunities are more valuable than formal sessions — reinforce them with the actual real-world reward.',
      successLook: 'Dog begins offering sits spontaneously before exciting events without being asked.'
    },
    {
      order: 4,
      instruction: 'Track compliance for 3 days: record every "sit" cue and whether the dog responds in under 2 seconds on the first cue. Goal: 90% first-cue compliance.',
      durationSeconds: null,
      reps: null,
      tip: '"He sits most of the time" is not reliable. 90% first-cue compliance is reliable.',
      successLook: 'Dog responds to first "sit" cue within 2 seconds in 9 out of 10 real-life situations.'
    }
  ],
  successCriteria: 'Dog sits on first verbal cue outdoors in 12 out of 15 trials with distraction. Sits automatically before 4 of 5 daily routine checkpoints.',
  commonMistakes: [
    'Only practicing sit during formal training sessions',
    'Letting the standard slip once it is learned',
    'Not proofing in multiple environments',
    'Over-cueing sit until the dog tunes it out'
  ],
  equipmentNeeded: ['Treat pouch', 'High-value treats', 'Helper for distraction work'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: null,
  trainerNote: 'Sit before every exciting event, at every curb, at every greeting — make it a habit and you will have a different dog within 2 weeks.',
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
  objective: 'Teach the dog to lie down fully on a single verbal cue within 3 seconds.',
  durationMinutes: 8,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'From a sit, hold a treat at the dog\'s nose, move it straight down to the floor between their front paws, then slide it slowly away from them. Mark the instant elbows touch. Do 5 reps.',
      durationSeconds: null,
      reps: 5,
      tip: 'Slow is critical — move the lure too fast and the dog stands up to follow.',
      successLook: 'Dog lowers front elbows to the floor, hips follow into a full down.'
    },
    {
      order: 2,
      instruction: 'Fade the lure: same hand motion, no treat in that hand. Mark and reward from your pouch when elbows hit the floor. Do 10 reps.',
      durationSeconds: null,
      reps: 10,
      tip: 'Reward down with 2–3 treats rather than one — it is a more vulnerable position and earns more.',
      successLook: 'Dog lowers into down following the empty hand signal.'
    },
    {
      order: 3,
      instruction: 'Add "down" before the hand signal. After 5 paired reps, try the verbal cue alone with hands at sides. Jackpot if they down.',
      durationSeconds: null,
      reps: 5,
      tip: '"Down" must mean only one thing — if you use it for "get off the couch" too, pick a different word for lie-down.',
      successLook: 'Dog lies down on verbal "down" with handler hands at sides.'
    }
  ],
  successCriteria: 'Dog lies fully down on verbal "down" alone within 3 seconds, 15 out of 20 reps.',
  commonMistakes: [
    'Luring from standing rather than from a sit — sit-to-down is mechanically easier',
    'Marking before elbows are fully on the floor',
    'Using "down" to mean multiple things',
    'Moving the lure too quickly along the floor'
  ],
  equipmentNeeded: ['High-value treats', 'Treat pouch', 'Non-slip surface helps for hesitant dogs'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'down_s2',
  trainerNote: 'Down is harder than sit for most dogs because lying down is a vulnerable position. Go slower, use softer surfaces, and reward any downward movement generously for hesitant dogs.',
  supportsLiveAiTrainer: true,
}

const down_stage2: Protocol = {
  id: 'down_s2',
  behavior: 'down',
  stage: 2,
  title: 'Down-Stay: Duration & Relaxed Body',
  objective: 'Build a down-stay to 45 seconds with a genuinely relaxed body — hips rolled to one side.',
  durationMinutes: 10,
  repCount: 12,
  steps: [
    {
      order: 1,
      instruction: 'Cue down, say "stay," and deliver a treat every 10 seconds while they hold position. Walk back to them each time. Build from 10 to 30 seconds over 5 reps. Release with "free!"',
      durationSeconds: null,
      reps: 5,
      tip: 'Go to the dog to treat — calling them to you rewards leaving the down.',
      successLook: 'Dog holds down-stay for 30 seconds, treats delivered in position.'
    },
    {
      order: 2,
      instruction: 'Encourage a "relaxed down" — hips rolled to one side. When the dog is down, deliver the treat slightly to the side of their body so they turn their head. Many dogs shift their hips naturally. Jackpot any hip roll.',
      durationSeconds: null,
      reps: 5,
      tip: 'A hip-rolled down is physically sustainable — a tense sphinx-hold is not genuinely settled.',
      successLook: 'Dog lies with hips rolled to one side, fully relaxed.'
    },
    {
      order: 3,
      instruction: 'Build to 45 seconds with variable intervals: sometimes 8 seconds between treats, sometimes 20. Always release with "free!" at the end.',
      durationSeconds: 45,
      reps: 5,
      tip: 'Variable intervals keep the dog holding and waiting — they cannot predict when the next treat comes.',
      successLook: 'Dog holds a relaxed down-stay for 45 seconds with treats at variable intervals.'
    }
  ],
  successCriteria: 'Dog holds a relaxed down-stay for 45 seconds with handler returning to deliver treats, 9 out of 12 trials.',
  commonMistakes: [
    'Accepting a tense, alert sphinx as "good enough"',
    'Calling the dog to reward during the stay',
    'Building duration too fast',
    'No formal release'
  ],
  equipmentNeeded: ['High-value treats', 'Treat pouch', 'Comfortable surface or mat', 'Timer'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'down_s3',
  trainerNote: 'A dog that offers a relaxed down on cue and holds it is a dog you can take anywhere — a café, a waiting room, a dinner party.',
  supportsLiveAiTrainer: true,
}

const down_stage3: Protocol = {
  id: 'down_s3',
  behavior: 'down',
  stage: 3,
  title: 'Down at a Distance & Under Distraction',
  objective: 'Proof down at 8-foot distance and in multiple novel environments with distractions.',
  durationMinutes: 12,
  repCount: 12,
  steps: [
    {
      order: 1,
      instruction: 'Stand 3 feet away and cue "down." When reliable, move to 5 feet, then 8 feet. Return to the dog to deliver the treat each time.',
      durationSeconds: null,
      reps: 5,
      tip: 'A dog that downs from 8 feet on a verbal cue has genuinely understood the cue — not just responded to a hand in their face.',
      successLook: 'Dog lies down on verbal cue with handler 8 feet away.'
    },
    {
      order: 2,
      instruction: 'Practice in 3 new locations: backyard, front porch, outdoor café space. Start with 2 easy warm-up reps in each new place before building to a 30-second down-stay.',
      durationSeconds: null,
      reps: 3,
      tip: '2 easy reps in a new place prime the behavior reliably — never skip them.',
      successLook: 'Dog lies down on verbal cue in 3 different environments outside the home.'
    },
    {
      order: 3,
      instruction: 'Add a moving distraction: helper walks past at 10 feet during a down-stay. Build to: helper at 5 feet, helper jogging, helper with another dog.',
      durationSeconds: null,
      reps: 5,
      tip: 'Introduce distractions at the lowest intensity first and require 3 successful reps before increasing.',
      successLook: 'Dog holds 20-second down-stay while a person walks past at 5 feet.'
    }
  ],
  successCriteria: 'Dog responds to verbal "down" at 8-foot distance in 9 out of 12 trials. Holds 20-second down-stay with moving person at 5 feet in 3 different environments.',
  commonMistakes: [
    'Only practicing down at close range',
    'Skipping warm-up reps in new environments',
    'Adding distraction before duration and distance are solid',
    'Only proofing indoors'
  ],
  equipmentNeeded: ['Treat pouch', 'High-value treats', 'Mat (optional)', 'Helper for distraction work'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'A proofed down is one of the most powerful management tools you have — in any situation where the dog needs to settle immediately, "down-stay" is your reset button.',
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
  objective: 'Teach the dog to find and hold the heel position — left hip, facing forward — and understand it as the reward zone.',
  durationMinutes: 8,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Stand still. Hold a treat at your left hip, fingers pointing down. When the dog is standing at your left side with their shoulder near your leg, mark "yes!" and deliver the treat from that hip. Do 8 reps.',
      durationSeconds: null,
      reps: 8,
      tip: 'Deliver the treat at your left hip every single time — the dog is learning that the reward zone lives here.',
      successLook: 'Dog stands at your left side, head near your hip, receiving the treat from hip height.'
    },
    {
      order: 2,
      instruction: 'Take 2 steps forward, stop. If the dog ends up at your left hip, mark and treat there. If they overshoot, take another step to reposition yourself next to them. Do 8 reps.',
      durationSeconds: null,
      reps: 8,
      tip: 'You are establishing the geometry of the position before worrying about sustained walking.',
      successLook: 'Dog finishes at your left hip after 2 steps.'
    },
    {
      order: 3,
      instruction: 'Add the cue "heel" just as the dog moves into position at your hip. After 5 reps, say "heel" from standing and wait for the dog to move to your left hip.',
      durationSeconds: null,
      reps: 5,
      tip: '"Heel" means left side, shoulder at your hip, facing forward. It is not "walk near me" — keep the definition precise.',
      successLook: 'Dog hears "heel" and moves to left-hip position without being lured.'
    }
  ],
  successCriteria: 'Dog moves to heel position on "heel" cue within 3 seconds, 15 out of 20 reps while handler is standing still.',
  commonMistakes: [
    'Delivering the treat in front of the body instead of at the hip',
    'Accepting a position too far forward (dog ahead of your leg) or too far back',
    'Adding movement before the position itself is solid',
    'Confusing heel with loose leash walking — they are different behaviors'
  ],
  equipmentNeeded: ['High-value treats', 'Treat pouch worn on left hip', 'Flat collar or front-clip harness', '6-foot leash'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'heel_s2',
  trainerNote: 'Heel is a precision behavior. Loose leash walking allows the dog anywhere in range without pulling. Heel means exactly left side, shoulder at your hip. Build them separately — never mix the two.',
  supportsLiveAiTrainer: true,
}

const heel_stage2: Protocol = {
  id: 'heel_s2',
  behavior: 'heel',
  stage: 2,
  title: 'Heeling in Motion: Pace, Turns & Stops',
  objective: 'Build heeling in motion through pace changes, left turns, right turns, and halts.',
  durationMinutes: 10,
  repCount: 12,
  steps: [
    {
      order: 1,
      instruction: 'Walk forward from heel. Take 3 steps, stop, mark and treat at your hip if the dog is still in position. Build from 3 steps to 10 over 6 reps. If the dog drifts, stop, reset to heel, and restart.',
      durationSeconds: null,
      reps: 6,
      tip: '5 reps of 5-step heeling with treats beats one long unrewarded walk every time.',
      successLook: 'Dog maintains shoulder-at-hip position through 10 steps and stops when you stop.'
    },
    {
      order: 2,
      instruction: 'Add pace changes: walk normally for 5 steps, then walk faster — dog must speed up with you. Then slow to a crawl — dog must slow down. Mark at each successful pace match.',
      durationSeconds: null,
      reps: 5,
      tip: 'Pace changes keep the dog\'s attention on you — an unpredictable handler is an interesting handler.',
      successLook: 'Dog matches your pace immediately when you speed up or slow down.'
    },
    {
      order: 3,
      instruction: 'Add turns: right turns (dog gives you space), left turns (dog adjusts their rear — the harder direction), and U-turns (your strongest engagement tool). Mark any turn completed with the dog still in position.',
      durationSeconds: null,
      reps: 5,
      tip: 'Left turns are the hardest — you turn into the dog. Use small deliberate left turns and reward generously when the dog adjusts correctly.',
      successLook: 'Dog completes a right turn, left turn, and U-turn while staying in heel position.'
    }
  ],
  successCriteria: 'Dog maintains heel position through 20 steps with one pace change and one turn, 8 out of 12 reps.',
  commonMistakes: [
    'Too many steps without rewarding — keep sessions short and heavily reinforced',
    'Continuing to walk while the dog is out of position — stop, reset, restart',
    'Skipping pace changes — they are the primary attention tool for heel',
    'Not protecting the dog during left turns'
  ],
  equipmentNeeded: ['High-value treats', 'Treat pouch on left hip', 'Flat collar or front-clip harness', 'Quiet space'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: 'heel_s3',
  trainerNote: 'Heeling is a physical conversation — the dog watches you for changes, you reward them for tracking you. When it works, handler and dog move as a single unit.',
  supportsLiveAiTrainer: true,
}

const heel_stage3: Protocol = {
  id: 'heel_s3',
  behavior: 'heel',
  stage: 3,
  title: 'Proofed Heel: Duration, Outdoors & Distractions',
  objective: 'Build heel to 60 continuous steps and maintain it in outdoor environments with real-world distractions.',
  durationMinutes: 12,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Build to 60 continuous steps: start at 10, add 5 per session. Treat every 15 steps using variable reinforcement — sometimes at 10, sometimes at 25. Never always the same interval.',
      durationSeconds: null,
      reps: 5,
      tip: 'Variable reinforcement creates the most persistent behavior — the dog never knows when the next treat is coming, so they keep heeling.',
      successLook: 'Dog heels continuously for 60 steps, treats every 15–20 steps, never breaking position.'
    },
    {
      order: 2,
      instruction: 'Take heel outdoors: start in the driveway, then a quiet sidewalk. Expect regression — return to 5-step segments with frequent treats. Use your most excited praise when the dog checks in.',
      durationSeconds: null,
      reps: 5,
      tip: 'Outdoor heel needs higher-value treats than indoor heel — the competition is real.',
      successLook: 'Dog holds heel for 20 consecutive steps outdoors on a quiet street.'
    },
    {
      order: 3,
      instruction: 'Add a parallel distraction: a helper walks on the opposite side of the street in the same direction while you heel. Build to: helper 10 feet away, helper with a dog, helper moving erratically.',
      durationSeconds: null,
      reps: 3,
      tip: 'A person walking alongside is the most common real-world heel challenge — mastering this means the dog can navigate any crowded sidewalk.',
      successLook: 'Dog maintains heel for 20 steps while another person walks 10 feet away.'
    },
    {
      order: 4,
      instruction: 'Practice the "heel start": from a sit at heel, say "heel" and step off with your left foot. The dog should step off with you simultaneously. Left foot = move with me. Right foot = stay.',
      durationSeconds: null,
      reps: 3,
      tip: 'The left-foot-start is used in formal obedience and is genuinely useful in daily life — build it as a habit from the beginning.',
      successLook: 'Dog steps off simultaneously with handler\'s left foot from a sitting heel position.'
    }
  ],
  successCriteria: 'Dog heels continuously for 60 steps indoors. Maintains heel for 20 steps outdoors with a person walking 10 feet away, 7 out of 10 trials.',
  commonMistakes: [
    'Adding duration and outdoor environments in the same session',
    'Not treating frequently enough outdoors',
    'Continuing to walk while the dog is out of heel',
    'Expecting competition-level precision from a pet dog'
  ],
  equipmentNeeded: ['Treat pouch on left hip', 'High-value treats', 'Flat collar or front-clip harness', '6-foot leash', 'Open outdoor space'],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 4,
  nextProtocolId: null,
  trainerNote: 'Reliable outdoor heel lets you walk through crowds, past other dogs, and in tight spaces without physical restraint. It is worth every repetition.',
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
  // Crate training
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
  // Heel
  hl_01: 'heel_s1', hl_02: 'heel_s1', hl_03: 'heel_s2',
  hl_04: 'heel_s2', hl_05: 'heel_s3', hl_06: 'heel_s3',
}
