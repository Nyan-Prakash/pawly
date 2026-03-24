export interface ProtocolStep {
  order: number
  action: string
  detail: string | null
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
      action: 'Stand still and let the leash hang slack.',
      detail: 'Practice in a low-distraction room.',
      durationSeconds: null,
      reps: null,
      tip: 'If your dog pulls at any point, simply wait — do not move forward.',
      successLook: 'Dog stands near you, leash loose.'
    },
    {
      order: 2,
      action: 'Say your dog\'s name once and wait.',
      detail: 'Mark "yes!" and deliver a treat at your hip when they look.',
      durationSeconds: null,
      reps: 10,
      tip: 'Say the name once and wait up to 10 seconds — repeating it teaches them to ignore it.',
      successLook: 'Dog turns toward you within 3 seconds of hearing their name.'
    },
    {
      order: 3,
      action: 'Wait for direct eye contact before marking.',
      detail: 'Treat at your hip every time.',
      durationSeconds: null,
      reps: 10,
      tip: 'Treat at your hip, not in front of you — the reward zone is beside your leg.',
      successLook: 'Dog looks up at your face, not just toward you.'
    },
    {
      order: 4,
      action: 'Take steps, stop, and say your dog\'s name.',
      detail: 'Wait for eye contact, then mark and treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'You are waiting for the dog to choose to check in — not luring them.',
      successLook: 'Dog checks in within 5 seconds of you stopping.'
    },
    {
      order: 5,
      action: 'End the session with a free sniff break.',
      detail: null,
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
      action: 'Start walking with your dog on a short leash.',
      detail: 'Keep one hand near your hip and one at the end.',
      durationSeconds: null,
      reps: null,
      tip: 'You will stop and start frequently — that is exactly what this exercise is supposed to feel like.',
      successLook: 'You are moving, dog is at your side.'
    },
    {
      order: 2,
      action: 'Stop completely the moment the leash goes taut.',
      detail: 'Say nothing and do nothing — just freeze.',
      durationSeconds: null,
      reps: null,
      tip: 'The stop must happen the instant you feel tension — not a few steps later.',
      successLook: 'You are frozen, leash is tight, dog notices something changed.'
    },
    {
      order: 3,
      action: 'Wait for the dog to create any slack.',
      detail: 'Mark "yes!" and walk forward the instant there is slack.',
      durationSeconds: null,
      reps: null,
      tip: 'Forward movement is the reward. Only treat every 3rd–4th successful slack moment.',
      successLook: 'Dog takes a step toward you, leash goes slack.'
    },
    {
      order: 4,
      action: 'Repeat the walk, stop, and slack cycle.',
      detail: null,
      durationSeconds: null,
      reps: 15,
      tip: 'Use a quiet street or parking lot — not a route with heavy smells or distractions.',
      successLook: 'Dog begins self-correcting before you fully stop.'
    },
    {
      order: 5,
      action: 'Toss treats near your feet during the walk.',
      detail: 'Scatter treats every few steps of loose leash.',
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
      action: 'Perform a sudden U-turn when your dog moves ahead.',
      detail: 'Say "this way!" and walk briskly in the new direction.',
      durationSeconds: null,
      reps: null,
      tip: 'Be energetic on the turn — your body language should signal that something exciting just happened.',
      successLook: 'Dog trots to catch up, checking in as they reach your side.'
    },
    {
      order: 2,
      action: 'Mark and treat when the dog catches up beside you.',
      detail: 'Ensure the leash is loose and treat at your hip.',
      durationSeconds: null,
      reps: null,
      tip: 'The moment the dog reaches your hip is the exact moment to reward — not before, not after.',
      successLook: 'Leash in J-shape, dog at hip level.'
    },
    {
      order: 3,
      action: 'Perform unpredictable direction changes during the walk.',
      detail: 'Vary between left, right, U-turns, slow, and fast paces.',
      durationSeconds: null,
      reps: 12,
      tip: 'Unpredictability makes you more interesting than the environment — the dog has to watch you.',
      successLook: 'Dog glances at you frequently, anticipating the next change.'
    },
    {
      order: 4,
      action: 'Perform direction changes near a mild distraction.',
      detail: 'Approach the distraction at the dog\'s threshold distance.',
      durationSeconds: null,
      reps: 3,
      tip: 'If the dog lunges or fixates, back up 5 steps — you are over threshold.',
      successLook: 'Dog notices the distraction, glances at it, then checks back with you.'
    },
    {
      order: 5,
      action: 'Finish with a free sniff break.',
      detail: 'Drop all criteria and let the dog sniff freely.',
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
      action: 'Sit on the floor in a quiet room with treats.',
      detail: 'Ensure your dog is nearby but not looking at you.',
      durationSeconds: null,
      reps: null,
      tip: 'Sitting on the floor puts you at the dog\'s level and makes you naturally more inviting.',
      successLook: 'Dog is calm and nearby, attention elsewhere.'
    },
    {
      order: 2,
      action: 'Say your dog\'s name once and wait.',
      detail: 'Mark "yes!" and toss a treat toward you when they glance up.',
      durationSeconds: null,
      reps: 10,
      tip: 'Toss the treat toward yourself — this begins the muscle memory of "name = move toward the human."',
      successLook: 'Dog orients toward you immediately when their name is called.'
    },
    {
      order: 3,
      action: 'Wait for brief eye contact after the name response.',
      detail: 'Build up duration before treating.',
      durationSeconds: null,
      reps: 5,
      tip: 'Even one extra second of held eye contact is worth marking — you\'re building a habit, not a performance.',
      successLook: 'Dog holds eye contact for 2 seconds.'
    },
    {
      order: 4,
      action: 'Move across the room and call their name.',
      detail: 'Pat your legs excitedly and give a jackpot of treats.',
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
      action: 'Say your recall cue paired with your dog\'s name.',
      detail: 'Use "here," "come," or a whistle.',
      durationSeconds: null,
      reps: null,
      tip: 'The name grabs attention; the cue means "run to me." Keep them paired for now.',
      successLook: 'Dog looks up immediately at their name before "come."'
    },
    {
      order: 2,
      action: 'Recall your dog from different rooms.',
      detail: 'Give a jackpot of treats at your feet for each success.',
      durationSeconds: null,
      reps: 8,
      tip: 'Varying your location teaches the dog that "come" works everywhere, not just when you\'re facing them.',
      successLook: 'Dog comes running from another room within 5 seconds.'
    },
    {
      order: 3,
      action: 'Recall your dog away from a mild distraction.',
      detail: 'If they don\'t respond, clap and run in the opposite direction.',
      durationSeconds: null,
      reps: 5,
      tip: 'Running away from the dog is one of the strongest recall tools — dogs instinctively chase movement.',
      successLook: 'Dog leaves the kibble and comes to you when called.'
    },
    {
      order: 4,
      action: 'Crouch and call your dog enthusiastically.',
      detail: 'Deliver a full handful of treats and praise on arrival.',
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
      action: 'Clip on a long line and let your dog sniff.',
      detail: 'Allow your dog to decompress before training.',
      durationSeconds: 180,
      reps: null,
      tip: 'The long line is a safety net, not a tool for pulling the dog to you — never reel it in.',
      successLook: 'Dog is relaxed and sniffing, not anxious or over-excited.'
    },
    {
      order: 2,
      action: 'Call their name and recall cue.',
      detail: 'If they don\'t respond, clap and run in the opposite direction.',
      durationSeconds: null,
      reps: 5,
      tip: 'If the dog is deeply fixated on something, do not call — move closer first.',
      successLook: 'Dog disengages and trots toward you.'
    },
    {
      order: 3,
      action: 'Deliver a jackpot of treats and praise upon arrival.',
      detail: 'Give treats one at a time while praising.',
      durationSeconds: 10,
      reps: null,
      tip: 'Outdoor arrivals need bigger celebrations than indoor ones — the competition is stronger.',
      successLook: 'Dog presses into you, tail wagging, staying close for treats.'
    },
    {
      order: 4,
      action: 'Release your dog with "go sniff!" after treating.',
      detail: 'Allow them to return to exploring.',
      durationSeconds: null,
      reps: 4,
      tip: 'Recall then freedom teaches the dog that coming to you does not always mean the fun ends.',
      successLook: 'Dog comes readily on subsequent recalls without avoidance.'
    },
    {
      order: 5,
      action: 'End the session while the dog is still interested.',
      detail: 'Always finish on a successful repetition.',
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
      action: 'Turn your back and fold your arms if they jump.',
      detail: 'Stand with treats at your chest and say nothing.',
      durationSeconds: null,
      reps: null,
      tip: 'No verbal response at all — even "no" is attention and can reinforce jumping.',
      successLook: 'Dog\'s four paws hit the floor after you turn away.'
    },
    {
      order: 2,
      action: 'Turn back and treat when all four paws are down.',
      detail: 'Crouch down and offer calm praise.',
      durationSeconds: null,
      reps: null,
      tip: 'Keep your energy at 50% — excitement triggers another jump cycle.',
      successLook: 'Dog receives treat while standing calmly on all fours.'
    },
    {
      order: 3,
      action: 'Repeat until they approach without jumping.',
      detail: null,
      durationSeconds: null,
      reps: 20,
      tip: 'Every person in the household must follow identical rules — one person who allows jumping undoes weeks of work.',
      successLook: 'Dog approaches and looks up expectantly without leaving the floor.'
    },
    {
      order: 4,
      action: 'Wait for sustained four-paws contact before marking.',
      detail: 'Wait for the dog to remain calm before rewarding.',
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
      action: 'Drill the sit cue until the response is immediate.',
      detail: null,
      durationSeconds: 180,
      reps: 10,
      tip: 'If the sit is shaky, fix it here before adding the approach challenge.',
      successLook: 'Dog sits within 2 seconds of cue, 9 out of 10 times.'
    },
    {
      order: 2,
      action: 'Walk toward your dog and reward an unprompted sit.',
      detail: 'Drop the treat between their front paws.',
      durationSeconds: null,
      reps: null,
      tip: 'Drop the treat between the paws — overhead delivery encourages jumping.',
      successLook: 'Dog holds sit as you approach, nose reaching down for the treat.'
    },
    {
      order: 3,
      action: 'Turn your back if the dog jumps on approach.',
      detail: 'Wait for a sit, then try approaching again more slowly.',
      durationSeconds: null,
      reps: null,
      tip: 'Reduce your approach speed or try approaching from the side — your energy is triggering the jump.',
      successLook: 'Dog holds a sit during a calm, slow approach.'
    },
    {
      order: 4,
      action: 'Gradually increase your approach energy.',
      detail: 'Move from walking to jogging and reaching while rewarding sits.',
      durationSeconds: null,
      reps: 10,
      tip: 'Each energy increase is a new level of difficulty — if the dog fails, drop back one level.',
      successLook: 'Dog holds sit even when you\'re jogging and reaching toward them.'
    },
    {
      order: 5,
      action: 'Practice sitting when you hear a knock or bell.',
      detail: 'Open the door to a helper who rewards the sitting dog.',
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
      action: 'Brief a helper to ignore jumping and reward sitting.',
      detail: 'Give them treats and explain the turn-away rule.',
      durationSeconds: null,
      reps: null,
      tip: 'An unprepared helper who greets a jumping dog is the most common reason this protocol fails.',
      successLook: 'Helper understands the protocol and remains calm and neutral.'
    },
    {
      order: 2,
      action: 'Have a helper approach your leashed dog.',
      detail: 'Helper rewards the sit or turns away if the dog jumps.',
      durationSeconds: null,
      reps: 5,
      tip: 'Keep the leash loose — it is a safety backup, not a restraint.',
      successLook: 'Dog holds sit while the stranger approaches and pets them.'
    },
    {
      order: 3,
      action: 'Increase the helper\'s enthusiasm during approach.',
      detail: 'Have them use an excited voice and reach out eagerly.',
      durationSeconds: null,
      reps: 3,
      tip: 'This step often causes regression — be ready to drop back to Step 2.',
      successLook: 'Dog stays on all four paws or sits when the helper is excited.'
    },
    {
      order: 4,
      action: 'Practice greetings in a new outdoor environment.',
      detail: 'Start with easy reps as the new context will be challenging.',
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
      action: 'Write a potty schedule and set alarms.',
      detail: 'Include trips after waking, eating, and play.',
      durationSeconds: null,
      reps: null,
      tip: 'Follow the schedule even when nothing happens — the routine itself is the training.',
      successLook: 'Schedule is written and alarms are set.'
    },
    {
      order: 2,
      action: 'Leash your dog and go to the same spot.',
      detail: 'Stand still and silent and wait.',
      durationSeconds: 300,
      reps: null,
      tip: 'This is not a walk — movement and excitement distract from the task.',
      successLook: 'Dog sniffs the spot and shows circling or intense sniffing.'
    },
    {
      order: 3,
      action: 'Say your potty cue word while the dog eliminates.',
      detail: 'Use a soft voice and say it only once.',
      durationSeconds: null,
      reps: null,
      tip: 'You are pairing the cue with the act — over weeks it begins to trigger the behavior.',
      successLook: 'Dog continues eliminating without stopping at your voice.'
    },
    {
      order: 4,
      action: 'Celebrate and reward immediately after they finish.',
      detail: 'Use an excited voice and give multiple treats.',
      durationSeconds: null,
      reps: null,
      tip: 'The jackpot must happen within 2 seconds of the final squat — a 10-second delay breaks the association.',
      successLook: 'Dog is clearly happy, tail wagging, eating treats enthusiastically.'
    },
    {
      order: 5,
      action: 'Tether or crate the dog if they don\'t potty.',
      detail: 'Go back inside and try again shortly.',
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
      action: 'Hang a bell at nose height on the door.',
      detail: null,
      durationSeconds: null,
      reps: null,
      tip: 'Nose height is critical — if the dog can\'t reach it easily, the behavior won\'t stick.',
      successLook: 'Bell is hung at the correct height.'
    },
    {
      order: 2,
      action: 'Have your dog ring the bell before potty trips.',
      detail: 'Lure them to the bell with a treat and open the door.',
      durationSeconds: null,
      reps: 6,
      tip: 'You are pairing bell = door opens. Do this at every single trip for a full week — no exceptions.',
      successLook: 'Dog touches the bell before going out at every scheduled trip.'
    },
    {
      order: 3,
      action: 'Wait for your dog to ring the bell spontaneously.',
      detail: 'Open the door immediately and reward if they eliminate outside.',
      durationSeconds: null,
      reps: null,
      tip: 'The spontaneous ring is the breakthrough — some dogs get it in days, others take 2–3 weeks.',
      successLook: 'Dog approaches the door and rings the bell without being prompted.'
    },
    {
      order: 4,
      action: 'End the trip if they don\'t potty quickly.',
      detail: 'This prevents bell abuse for play instead of potty.',
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
      action: 'Gradually expand indoor freedom room by room.',
      detail: 'Wait for several accident-free weeks before adding a new room.',
      durationSeconds: null,
      reps: null,
      tip: 'Every accident sets you back 2 weeks — expand slowly.',
      successLook: 'Dog roams their area without circling or sniffing corners.'
    },
    {
      order: 2,
      action: 'Watch for pre-elimination signals.',
      detail: 'Say "outside!" and take them out the moment you see a signal.',
      durationSeconds: null,
      reps: null,
      tip: 'Every dog has a tell — learning yours lets you redirect before the accident happens.',
      successLook: 'Dog redirected outside before any accident occurs.'
    },
    {
      order: 3,
      action: 'Clean accidents with enzymatic cleaner and do not scold.',
      detail: 'Tighten management for a while after an indoor accident.',
      durationSeconds: null,
      reps: null,
      tip: 'Regular cleaners leave scent markers the dog can still detect — enzymatic cleaner is essential.',
      successLook: 'Accident cleaned properly, management tightened, no emotional reaction from handler.'
    },
    {
      order: 4,
      action: 'Use your potty cue consistently at the spot.',
      detail: 'This builds reliable on-command elimination over time.',
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
  behavior: 'crate_training',
  stage: 1,
  title: 'Crate Introduction & Positive Association',
  objective: 'Build a strong positive association with the crate so the dog enters voluntarily and rests inside without anxiety.',
  durationMinutes: 10,
  repCount: 10,
  steps: [
    {
      order: 1,
      action: 'Place the open crate in the living area.',
      detail: 'Let the dog investigate freely without any pressure.',
      durationSeconds: null,
      reps: null,
      tip: 'Pressure at this stage creates avoidance that takes weeks to undo — initial exposure must be on the dog\'s terms.',
      successLook: 'Dog sniffs the entrance and possibly steps one paw inside.'
    },
    {
      order: 2,
      action: 'Toss treats progressively further into the crate.',
      detail: 'Let the dog choose to enter and never push them in.',
      durationSeconds: null,
      reps: 10,
      tip: 'If the dog won\'t go past the entrance, meet them there and work gradually — forcing it now costs you weeks later.',
      successLook: 'Dog walks fully in, collects the treat, and walks back out calmly.'
    },
    {
      order: 3,
      action: 'Feed all meals inside the crate with the door open.',
      detail: 'Move the bowl from the entrance to the back over several days.',
      durationSeconds: null,
      reps: null,
      tip: 'Every meal inside is a positive rep with zero extra effort from you.',
      successLook: 'Dog walks into the crate for meals without hesitation.'
    },
    {
      order: 4,
      action: 'Close the crate door briefly while they eat.',
      detail: 'Stay in the room and build duration gradually.',
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
  behavior: 'crate_training',
  stage: 2,
  title: 'Building Duration with Door Closed',
  objective: 'Extend crate time to 30–60 minutes with the handler present, then introduce brief departures from the room.',
  durationMinutes: 12,
  repCount: 6,
  steps: [
    {
      order: 1,
      action: 'Give a Chew Toy in the crate and sit nearby.',
      detail: 'Ignore the crate and wait for a while after they finish.',
      durationSeconds: 600,
      reps: null,
      tip: 'Load the Chew Toy with peanut butter and freeze it overnight — it does the work for you.',
      successLook: 'Dog works the Chew Toy contentedly and eventually settles.'
    },
    {
      order: 2,
      action: 'Practice walking to the doorway while they are crated.',
      detail: 'Return to your seat without making eye contact with the crate.',
      durationSeconds: null,
      reps: 5,
      tip: 'You are desensitizing your movement as a departure signal — keep it mundane.',
      successLook: 'Dog remains lying down when you move to the doorway.'
    },
    {
      order: 3,
      action: 'Leave the room for short, increasing durations.',
      detail: 'Always return before your dog shows any signs of distress.',
      durationSeconds: 300,
      reps: null,
      tip: 'Always come back before the dog panics — you are building a history of "they always return."',
      successLook: 'Dog lifts head at your return, then settles back down — no frantic greeting.'
    },
    {
      order: 4,
      action: 'Wait for calm behavior before opening the door.',
      detail: 'Do not allow the dog to burst out of the crate.',
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
  behavior: 'crate_training',
  stage: 3,
  title: 'Extended Alone Time & Independence',
  objective: 'Build tolerance for 3–4 hour crating with the handler fully absent, and establish the crate as the dog\'s preferred resting space.',
  durationMinutes: 10,
  repCount: 5,
  steps: [
    {
      order: 1,
      action: 'Establish a consistent pre-crate ritual.',
      detail: 'Exercise, use a cue word, and provide a Chew Toy every time.',
      durationSeconds: null,
      reps: null,
      tip: 'Predictability is calming — a dog that knows exactly what is coming develops far less anticipatory anxiety.',
      successLook: 'Dog hears the cue word and walks toward the crate unprompted.'
    },
    {
      order: 2,
      action: 'Gradually increase alone time over several weeks.',
      detail: 'Add duration in small increments.',
      durationSeconds: null,
      reps: null,
      tip: 'A white noise machine near the crate masks external sounds that can trigger anxiety.',
      successLook: 'Dog is asleep or resting calmly on camera after handler leaves.'
    },
    {
      order: 3,
      action: 'Use a camera to monitor your dog during alone time.',
      detail: 'Review footage for signs of stress and adjust duration if needed.',
      durationSeconds: null,
      reps: null,
      tip: 'Quiet at return does not mean calm the whole time — the camera shows you the truth.',
      successLook: 'Dog visible on camera resting or sleeping for the majority of the session.'
    },
    {
      order: 4,
      action: 'Leave the crate door open during the evening.',
      detail: 'Wait for your dog to choose to use it voluntarily.',
      durationSeconds: null,
      reps: null,
      tip: 'A dog that chooses the open crate on their own is genuinely comfortable in it, not just tolerating confinement.',
      successLook: 'Dog enters and rests in crate on their own without prompting.'
    },
    {
      order: 5,
      action: 'Perform a random surprise crating once a week.',
      detail: 'Crate with a Chew Toy to maintain the skill.',
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
      action: 'Say "ouch!" and freeze if they bite.',
      detail: 'Go limp to signal that play has stopped.',
      durationSeconds: 3,
      reps: null,
      tip: 'Think how another puppy would yelp — sharp and brief, not screaming. Overreacting excites them further.',
      successLook: 'Puppy pauses mouthing and pulls back slightly.'
    },
    {
      order: 2,
      action: 'End play briefly after several hard bites.',
      detail: 'Stand up and turn away to signal a time-out.',
      durationSeconds: 30,
      reps: null,
      tip: 'The time-out is information, not punishment — hard biting = play ends.',
      successLook: 'Puppy softens bite pressure over the session.'
    },
    {
      order: 3,
      action: 'Redirect your puppy to a toy after any interruption.',
      detail: 'Wiggle the toy and praise them for biting it instead of skin.',
      durationSeconds: null,
      reps: 10,
      tip: 'The toy must be more exciting than skin — wiggle it, toss it, make it prey.',
      successLook: 'Puppy transfers bite from your hand to the toy willingly.'
    },
    {
      order: 4,
      action: 'Reward your puppy for sniffing your still hand.',
      detail: 'This teaches them that still hands are for treats, not biting.',
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
      action: 'Freeze silently if any teeth touch skin.',
      detail: 'Stop all interaction immediately, even for gentle mouthing.',
      durationSeconds: 5,
      reps: null,
      tip: 'The shift from "no hard biting" to "no teeth on skin at all" is the most important transition in the protocol.',
      successLook: 'Puppy notices the freeze and pauses without continuing to mouth.'
    },
    {
      order: 2,
      action: 'Offer a toy before starting any play.',
      detail: 'Let the puppy grab the toy before you initiate contact.',
      durationSeconds: null,
      reps: null,
      tip: 'Having the toy already in play eliminates the moment when the puppy defaults to skin.',
      successLook: 'Puppy grabs the toy rather than hands when play starts.'
    },
    {
      order: 3,
      action: 'Reward calm hand sniffs and time-out any mouthing.',
      detail: 'Stand up and turn away if they mouth your hands.',
      durationSeconds: 30,
      reps: 10,
      tip: 'After 10 reps, most puppies stop mouthing and start offering eye contact instead.',
      successLook: 'Puppy sniffs hands without using teeth, offers eye contact.'
    },
    {
      order: 4,
      action: 'Practice handling your puppy\'s paws, ears, and collar.',
      detail: 'Treat continuously to build comfort with physical touch.',
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
      action: 'Hold a treat in a closed fist and wait.',
      detail: 'Only open your hand when the puppy stops pawing or mouthing.',
      durationSeconds: null,
      reps: 10,
      tip: 'Keep the fist completely still — any movement signals the biting is working.',
      successLook: 'Puppy backs away from the fist and offers a sit or eye contact.'
    },
    {
      order: 2,
      action: 'Have a helper practice calm interaction.',
      detail: 'Helper should freeze if mouthed and reward calm behavior.',
      durationSeconds: null,
      reps: 5,
      tip: 'Three stranger-interaction sessions are worth more than thirty owner-only sessions for generalization.',
      successLook: 'Puppy greets the helper with calm sniffing, no mouthing or jumping.'
    },
    {
      order: 3,
      action: 'Practice the no-bite rule in different environments.',
      detail: 'Start with low-energy interactions in each new location.',
      durationSeconds: null,
      reps: null,
      tip: 'A dog that behaves at home but bites strangers is a liability — generalization is the final step.',
      successLook: 'Puppy maintains calm mouth in at least one novel environment.'
    },
    {
      order: 4,
      action: 'Teach children to stand still and offer a fist.',
      detail: 'Supervise all interactions and have them reward calm sniffing.',
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
      action: 'Mark and treat when your dog steps on the mat.',
      detail: 'Toss treats onto the mat the moment any paw makes contact.',
      durationSeconds: null,
      reps: null,
      tip: 'Do not lure the dog onto the mat — wait for natural contact and mark it.',
      successLook: 'Dog steps on the mat, hears the mark, and eats the treats while standing on it.'
    },
    {
      order: 2,
      action: 'Move away and reward returns to the mat.',
      detail: 'Scatter treats on the mat for each successful return.',
      durationSeconds: null,
      reps: 10,
      tip: 'When the dog starts walking to the mat deliberately and looking at you from it, jackpot 5 treats.',
      successLook: 'Dog walks to the mat independently and looks at you from on top of it.'
    },
    {
      order: 3,
      action: 'Wait for your dog to lie down on the mat.',
      detail: 'Drop a treat between their paws to encourage the down position.',
      durationSeconds: null,
      reps: null,
      tip: 'After 2–3 lure reps, stop and wait for the dog to offer the down independently.',
      successLook: 'Dog walks to mat and lies down without being asked.'
    },
    {
      order: 4,
      action: 'Add a verbal cue as they move to the mat.',
      detail: 'Say the cue once just as they begin walking toward it.',
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
      action: 'Deliver treats to the mat at increasing intervals.',
      detail: 'Walk to your dog to deliver treats while they hold position.',
      durationSeconds: 120,
      reps: 3,
      tip: 'Going to the dog to treat is critical — calling them off rewards leaving the mat.',
      successLook: 'Dog holds position while you walk over to deliver treats.'
    },
    {
      order: 2,
      action: 'Build duration on the mat with the TV on.',
      detail: 'Gradually increase the time between treats.',
      durationSeconds: 300,
      reps: null,
      tip: 'Fade reinforcement gradually — jumping from every 30 seconds to nothing causes the dog to leave.',
      successLook: 'Dog stays on mat for 5 minutes with TV on.'
    },
    {
      order: 3,
      action: 'Walk casually past the mat while your dog settles.',
      detail: 'Toss a treat to the mat every time they stay in position.',
      durationSeconds: null,
      reps: 5,
      tip: 'This proofs against the dog following you — the biggest challenge with settle.',
      successLook: 'Dog stays on mat when you walk past without getting up to follow.'
    },
    {
      order: 4,
      action: 'Practice settling while others move around the room.',
      detail: 'Reward with a treat periodically.',
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
      action: 'Cue "place" from across the room.',
      detail: 'Reward on the mat for each successful arrival.',
      durationSeconds: null,
      reps: 5,
      tip: 'At greater distances the dog is doing independent problem-solving — celebrate every attempt.',
      successLook: 'Dog moves purposefully to mat from across the room and lies down.'
    },
    {
      order: 2,
      action: 'Cue "place" from an adjacent room.',
      detail: 'Walk toward the mat and point only if they hesitate.',
      durationSeconds: null,
      reps: 3,
      tip: 'If the mat is new to a room, let the dog explore the layout before cuing.',
      successLook: 'Dog leaves your room and goes to the mat in the other room.'
    },
    {
      order: 3,
      action: 'Build up duration with a Chew Toy.',
      detail: 'Drop treats periodically without eye contact and release formally.',
      durationSeconds: 600,
      reps: null,
      tip: 'Deliver the treat without eye contact — it keeps the dog in the down rather than popping up to look at you.',
      successLook: 'Dog holds settle with Chew Toy for 10 minutes before release.'
    },
    {
      order: 4,
      action: 'Practice the "place" cue in a novel location.',
      detail: 'Perform easy warm-up reps before expecting a long hold.',
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
      action: 'Hold a treat in a closed fist at nose height.',
      detail: 'Say nothing and keep your fist closed despite any sniffing.',
      durationSeconds: null,
      reps: null,
      tip: 'Your fist must stay completely closed through sniffing, licking, and pawing — movement rewards persistence.',
      successLook: 'Dog sniffs the fist, then backs their nose away.'
    },
    {
      order: 2,
      action: 'Reward from your other hand when they back away.',
      detail: 'Never give the dog the treat that was inside your fist.',
      durationSeconds: null,
      reps: 10,
      tip: 'Always reward from the opposite hand — "leave the inferior thing, get the superior thing."',
      successLook: 'Dog pulls back from the fist and receives a better treat from the other hand.'
    },
    {
      order: 3,
      action: 'Add the "leave it" cue as you present your fist.',
      detail: 'Mark and reward from the other hand when they back off.',
      durationSeconds: null,
      reps: 10,
      tip: 'Add the cue only once the behavior is reliable — too early and you label the wrong moment.',
      successLook: 'Dog hears "leave it," glances at the fist, and looks back to you.'
    },
    {
      order: 4,
      action: 'Open your palm and cue "leave it."',
      detail: 'Reward from your other hand when they ignore the visible treat.',
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
      action: 'Cover kibble on the floor and cue "leave it."',
      detail: 'Reward from your hand when the dog backs away.',
      durationSeconds: null,
      reps: 8,
      tip: 'Your foot is the barrier — stand still and wait for disengagement.',
      successLook: 'Dog sniffs around your foot, then backs away and looks at your face.'
    },
    {
      order: 2,
      action: 'Practice "leave it" with uncovered kibble.',
      detail: 'Be ready to cover it with your foot if they dive for it.',
      durationSeconds: null,
      reps: 7,
      tip: 'You must be faster than the dog at covering the treat — if you can\'t be, use slower or less interesting food.',
      successLook: 'Dog glances at the floor treat, then looks up at you without going for it.'
    },
    {
      order: 3,
      action: 'Trade a toy for a treat to teach "drop it."',
      detail: 'Give the toy back immediately after they take the treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Always return the toy — a dog that learns "drop it = toy disappears" will refuse to drop anything.',
      successLook: 'Dog opens mouth and releases the toy when the treat appears.'
    },
    {
      order: 4,
      action: 'Practice "drop it" with high-value chews.',
      detail: 'Offer a treat under their nose and wait for them to release.',
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
      action: 'Cue "leave it" before your dog reaches dropped food.',
      detail: 'Reward from your pouch when they divert their attention.',
      durationSeconds: null,
      reps: 5,
      tip: 'Cue before contact, not after — cuing too late is damage control, not training.',
      successLook: 'Dog notices the food, hears "leave it," and looks to you instead.'
    },
    {
      order: 2,
      action: 'Walk past ground food without any cues.',
      detail: 'Reward if they ignore it naturally, or cue "leave it" if needed.',
      durationSeconds: null,
      reps: 5,
      tip: 'The goal is a dog that leaves ground food silently — the cue is a backup, not the primary behavior.',
      successLook: 'Dog walks past ground food without stopping, checking in with you.'
    },
    {
      order: 3,
      action: 'Cue "leave it" for a high-value item.',
      detail: 'Reward with a superior treat after they wait.',
      durationSeconds: null,
      reps: 3,
      tip: 'The reward must be clearly better than the chicken — kibble against chicken will fail every time.',
      successLook: 'Dog looks at the chicken, holds for 3 seconds, receives a jackpot.'
    },
    {
      order: 4,
      action: 'Cue "leave it" when your dog sees an animal.',
      detail: 'Hold a treat at your face and reward when they look at you.',
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
      action: 'Lure your dog into a sit with a treat.',
      detail: 'Move the treat up and back over their head.',
      durationSeconds: null,
      reps: 5,
      tip: 'Keep the lure at nose height — too high and they jump instead of sitting.',
      successLook: 'Dog follows the lure into a clean sit without jumping or backing up.'
    },
    {
      order: 2,
      action: 'Use an empty hand signal to cue a sit.',
      detail: 'Reward from your other hand once they sit.',
      durationSeconds: null,
      reps: 10,
      tip: 'A dog that only sits when food is visible in your hand has not learned to sit on cue.',
      successLook: 'Dog sits following the empty hand signal.'
    },
    {
      order: 3,
      action: 'Transition to using the verbal "sit" cue alone.',
      detail: 'Keep your hands at your sides and jackpot if they comply.',
      durationSeconds: null,
      reps: 10,
      tip: 'Say "sit" once and wait — repeating it teaches the first cue is optional.',
      successLook: 'Dog sits on verbal "sit" alone with handler hands at sides.'
    },
    {
      order: 4,
      action: 'Lure your dog into a down from a sit.',
      detail: 'Fade the lure and transition to a verbal cue as they improve.',
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
      action: 'Cue "stay" and wait.',
      detail: 'Use a flat palm signal and reward while they are still seated.',
      durationSeconds: null,
      reps: 5,
      tip: 'Mark while the dog is still seated — the mark tells them exactly what earned the treat.',
      successLook: 'Dog holds sit for 2 seconds without shuffling forward.'
    },
    {
      order: 2,
      action: 'Vary the duration of the stay.',
      detail: 'Always use a formal release cue like "free!"',
      durationSeconds: null,
      reps: 8,
      tip: 'Variable duration prevents anticipation — a dog that always gets released at 10 seconds will break at 11.',
      successLook: 'Dog holds stay for 20 seconds with handler standing in front.'
    },
    {
      order: 3,
      action: 'Step away from your dog during the stay.',
      detail: 'Walk back to them to deliver the reward rather than calling them.',
      durationSeconds: null,
      reps: 5,
      tip: 'Returning to reward (not calling them) is the most critical detail of stay training.',
      successLook: 'Dog holds sit-stay while handler moves to 5 feet and returns.'
    },
    {
      order: 4,
      action: 'Practice "stay" in the down position.',
      detail: 'Build up duration and distance gradually.',
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
      action: 'Practice obedience with normal household activity.',
      detail: 'Move to outdoor proofing once they are reliable at home.',
      durationSeconds: null,
      reps: 5,
      tip: 'Home with household activity is a genuine distraction level — don\'t skip straight to the park.',
      successLook: 'Dog responds to sit, down, and stay in a normal home environment.'
    },
    {
      order: 2,
      action: 'Practice obedience in your driveway or front yard.',
      detail: 'Start with short stays and reward generously for outdoor success.',
      durationSeconds: null,
      reps: 5,
      tip: 'Outdoor obedience feels like a new task to the dog — start easier than you think necessary.',
      successLook: 'Dog performs sit and down on verbal cue outdoors within 3 seconds.'
    },
    {
      order: 3,
      action: 'Practice stays while a helper walks or jogs past.',
      detail: 'Start with the helper at a distance and gradually move closer.',
      durationSeconds: null,
      reps: 5,
      tip: 'A person walking past is the most common real-world challenge — mastering this transfers to the vet, sidewalk, and anywhere else.',
      successLook: 'Dog holds sit while a person walks past at 5 feet.'
    },
    {
      order: 4,
      action: 'Integrate obedience cues into your daily routine.',
      detail: 'Use real-life rewards like meals and walks to reinforce behavior.',
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
      action: 'Teach your dog to "speak" on cue.',
      detail: 'Use a doorbell or knock to trigger the bark and reward it.',
      durationSeconds: null,
      reps: 5,
      tip: 'You cannot reliably teach "quiet" without first controlling when the bark starts.',
      successLook: 'Dog barks in response to the trigger and receives a reward.'
    },
    {
      order: 2,
      action: 'Hold a treat at their nose to stop barking.',
      detail: 'Cue "quiet!" the moment they stop barking and deliver the treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Dogs cannot bark and sniff simultaneously — the treat interrupts the behavior and creates the quiet moment to mark.',
      successLook: 'Dog pauses barking when treat appears, hears "quiet!" and receives it.'
    },
    {
      order: 3,
      action: 'Wait for longer periods of silence before rewarding.',
      detail: 'Gradually build up duration of quiet after the cue.',
      durationSeconds: null,
      reps: 8,
      tip: 'You want quiet as a sustained behavior, not just a brief pause.',
      successLook: 'Dog stops barking for 5 seconds when "quiet" is cued.'
    },
    {
      order: 4,
      action: 'Transition to using the verbal "quiet" cue alone.',
      detail: 'Reach for your treat pouch only after they have gone quiet.',
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
      action: 'Block access to windows when your dog is unsupervised.',
      detail: 'Use furniture, gates, or film to prevent alert barking.',
      durationSeconds: null,
      reps: null,
      tip: 'Management is not cheating — it cuts daily bark rehearsal dramatically while you train the replacement behavior.',
      successLook: 'Dog cannot access the window during unsupervised time.'
    },
    {
      order: 2,
      action: 'Redirect your dog to their mat when the doorbell rings.',
      detail: 'Ask for a down-stay and reward silence.',
      durationSeconds: null,
      reps: 5,
      tip: 'You are building a chain: doorbell → brief bark → mat → quiet → reward. The mat becomes the alternative to sustained barking.',
      successLook: 'Dog barks at the doorbell, then follows to the mat and settles within 15 seconds.'
    },
    {
      order: 3,
      action: 'Cue "place" immediately after the doorbell rings.',
      detail: 'This helps your dog learn to go to their mat instead of barking.',
      durationSeconds: null,
      reps: 5,
      tip: 'The dog self-directing to the mat at the sound of the doorbell takes 30–50 deliberate rehearsals — schedule them.',
      successLook: 'Dog hears doorbell and begins walking toward the mat without being prompted.'
    },
    {
      order: 4,
      action: 'Ignore all demand barking until they go quiet.',
      detail: 'Do not provide eye contact or verbal corrections during the barking.',
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
      action: 'Practice calm behavior near triggers at a distance.',
      detail: 'Reward continuously while the dog remains below their barking threshold.',
      durationSeconds: null,
      reps: null,
      tip: 'Every session at sub-threshold builds calm — every session over threshold rehearses the bark.',
      successLook: 'Dog notices trigger at distance, looks at it, then looks at you. No barking.'
    },
    {
      order: 2,
      action: 'Crate or mat your dog with a chew before guests arrive.',
      detail: 'Have guests wait until the dog is settled before they approach.',
      durationSeconds: null,
      reps: 3,
      tip: 'Text guests instructions before they arrive — "Please wait outside until I text you." Most people will cooperate.',
      successLook: 'Dog stays on mat while guest enters, receives a treat, is released after 2 calm minutes.'
    },
    {
      order: 3,
      action: 'Cue "quiet" and move away from triggers on walks.',
      detail: 'Deliver treats while increasing distance.',
      durationSeconds: null,
      reps: 5,
      tip: 'You are building "trigger = treats from my person," not waiting for the dog to stop barking before rewarding.',
      successLook: 'Dog hears "quiet," orients to handler, accepts treats while moving away from trigger.'
    },
    {
      order: 4,
      action: 'Call your dog\'s name when they spot a trigger.',
      detail: 'Jackpot when they look at you instead of barking at the trigger.',
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
      action: 'Identify every step of your pre-departure routine.',
      detail: 'Include actions like picking up keys or putting on a coat.',
      durationSeconds: null,
      reps: null,
      tip: 'For many anxious dogs, anxiety peaks before departure, not after — the cues are more powerful than the act itself.',
      successLook: 'You have identified your top 3–5 departure cues.'
    },
    {
      order: 2,
      action: 'Perform departure cues without leaving the house.',
      detail: 'Pick up your keys and sit on the couch.',
      durationSeconds: 300,
      reps: 5,
      tip: 'You are diluting the statistical prediction: if keys happen 15 times a day and departure only happens once, the prediction breaks.',
      successLook: 'Dog watches you pick up keys but relaxes back down within 30 seconds.'
    },
    {
      order: 3,
      action: 'Put on your departure shoes while staying home.',
      detail: 'Perform this cue independently for several days.',
      durationSeconds: null,
      reps: null,
      tip: 'Desensitize one cue at a time — shoes one week, coat another. Do not rush to combine them.',
      successLook: 'Dog remains settled or shows only mild interest when shoes go on.'
    },
    {
      order: 4,
      action: 'Perform your full departure sequence without leaving.',
      detail: 'Provide a Chew Toy to pair the sequence with a positive experience.',
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
      action: 'Set up a camera to monitor your dog.',
      detail: 'Review every session to check for signs of stress or anxiety.',
      durationSeconds: null,
      reps: null,
      tip: 'Silent at your return does not mean calm the whole time — the camera shows you the truth.',
      successLook: 'Camera is positioned and recording the dog\'s full resting area.'
    },
    {
      order: 2,
      action: 'Leave the house briefly after using a cue word.',
      detail: 'Provide a Chew Toy and return calmly without an excited greeting.',
      durationSeconds: 30,
      reps: 3,
      tip: 'Return before any stress response — you are building a history of "the door always opens again before anything bad happens."',
      successLook: 'Dog eats from the Chew Toy for 30 seconds, door opens, dog looks up calmly.'
    },
    {
      order: 3,
      action: 'Gradually increase your absence duration.',
      detail: 'Only advance when your dog remains calm on camera.',
      durationSeconds: null,
      reps: null,
      tip: 'The progression must be dictated by footage, not your schedule. If you need to leave for work before this is built, use a sitter or daycare.',
      successLook: 'Dog rests or works on Chew Toy for the full duration with no distress signals on camera.'
    },
    {
      order: 4,
      action: 'Reduce absence time if your dog shows distress.',
      detail: 'Drop back to half the previous successful duration and rebuild slowly.',
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
      action: 'Follow a strict pre-departure ritual.',
      detail: 'Include exercise, a Chew Toy, and a consistent cue word.',
      durationSeconds: null,
      reps: null,
      tip: 'Predictability is calming — "I know what this is. It ends. I have done it before."',
      successLook: 'Dog accepts the Chew Toy and settles without following you to the door.'
    },
    {
      order: 2,
      action: 'Gradually increase alone time.',
      detail: 'Add duration in small, camera-verified increments.',
      durationSeconds: null,
      reps: null,
      tip: 'The jump from 60 minutes to 3 hours is 6–8 incremental steps — plan for it.',
      successLook: 'Dog is asleep or resting on camera for the majority of a 90-minute session.'
    },
    {
      order: 3,
      action: 'Provide varied enrichment items for longer absences.',
      detail: 'Rotate items like snuffle mats or frozen bones to keep them engaged.',
      durationSeconds: null,
      reps: null,
      tip: 'After the first 20 minutes, most dogs settle and sleep — enrichment just covers that window.',
      successLook: 'Dog engages with enrichment for 15+ minutes before lying down.'
    },
    {
      order: 4,
      action: 'Wait before greeting your dog upon return.',
      detail: 'Keep greetings calm and low-energy to avoid over-excitement.',
      durationSeconds: 120,
      reps: null,
      tip: 'A calm return prevents the reunion becoming a hyper-arousal event the dog anticipates and stresses toward.',
      successLook: 'Dog waits calmly, receives a gentle greeting, does not escalate into spinning or jumping.'
    },
    {
      order: 5,
      action: 'Continue practice sessions twice a week.',
      detail: 'Return to early stages if any major life changes occur.',
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
      action: 'Touch the doorknob and reward staying back.',
      detail: 'Wait for them to sit or back up before marking and treating.',
      durationSeconds: null,
      reps: null,
      tip: 'You are teaching: stillness = door opens, surging forward = door does not open.',
      successLook: 'Dog backs up or stands still when you touch the doorknob.'
    },
    {
      order: 2,
      action: 'Open the door incrementally while your dog stays still.',
      detail: 'Immediately close the door if they surge forward.',
      durationSeconds: null,
      reps: 10,
      tip: 'The closing door is information, not punishment — keep it mechanical and emotionless.',
      successLook: 'Dog holds still while door opens 6 inches.'
    },
    {
      order: 3,
      action: 'Cue "wait" as you reach for the door.',
      detail: 'Mark and treat when they stay still, then open the door.',
      durationSeconds: null,
      reps: 8,
      tip: '"Wait" means "hold your position until I release you" — use "free!" or "okay" to release every time.',
      successLook: 'Dog hears "wait," pauses, receives treat, holds while door opens fully.'
    },
    {
      order: 4,
      action: 'Hold the "wait" with the door open.',
      detail: 'Use a formal release cue like "free!" before they pass through.',
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
      action: 'Practice the "wait" cue at the front door on a leash.',
      detail: 'Follow the incremental opening steps and release with "free!"',
      durationSeconds: null,
      reps: 5,
      tip: 'Keep the leash loose — it is a safety backup, not a restraint.',
      successLook: 'Dog holds wait at open front door for 5 seconds before release.'
    },
    {
      order: 2,
      action: 'Practice the door wait with a helper walking outside.',
      detail: 'Treat rapidly while the door is open and distractions are visible.',
      durationSeconds: null,
      reps: 5,
      tip: 'This is the hardest step — the whole world is visible and the dog cannot go to it. Frequent treats help sustain the hold.',
      successLook: 'Dog holds wait with open front door and a person walking past.'
    },
    {
      order: 3,
      action: 'Practice "wait" or "place" during a helper\'s arrival.',
      detail: 'Release your dog to greet only after a period of calm.',
      durationSeconds: 30,
      reps: 3,
      tip: 'Brief your guests — a guest who immediately greets the jumping dog breaks the protocol.',
      successLook: 'Dog holds wait or mat while guest enters and sits down.'
    },
    {
      order: 4,
      action: 'Practice the "wait" cue before entering from outdoors.',
      detail: 'Wait for stillness before releasing them inside.',
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
      action: 'Practice the front door "wait" without a leash.',
      detail: 'If they bolt, calmly reset and start again without scolding.',
      durationSeconds: null,
      reps: 5,
      tip: 'The absence of the leash reveals whether the behavior is real or leash-dependent.',
      successLook: 'Dog holds wait at open front door with no leash for 5 seconds.'
    },
    {
      order: 2,
      action: 'Practice the door wait during high excitement.',
      detail: 'Play for a few minutes before asking for a "wait" at the door.',
      durationSeconds: null,
      reps: 3,
      tip: 'Most door accidents happen when the dog is excited — train at high arousal because that is when it matters.',
      successLook: 'Dog holds wait at open door even when physically excited.'
    },
    {
      order: 3,
      action: 'Release your dog outside and immediately recall them back.',
      detail: 'Jackpot for a fast response at the threshold.',
      durationSeconds: null,
      reps: 4,
      tip: 'If the dog bolts and you are at the door, your recall must work at the threshold — build it here deliberately.',
      successLook: 'Dog steps outside, hears recall cue, turns and re-enters.'
    },
    {
      order: 4,
      action: 'Generalize the "wait" cue to all gates and car doors.',
      detail: null,
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
      action: 'Open your palm with treats and close it if they dive.',
      detail: 'Wait for them to back away before opening your hand again.',
      durationSeconds: null,
      reps: null,
      tip: 'Say nothing — complete silence. Let the dog solve it: "What makes the fist open?" Answer: not pushing.',
      successLook: 'Dog backs away from the closed fist and the fist opens. Dog waits for permission before taking.'
    },
    {
      order: 2,
      action: 'Reward the dog for waiting and making eye contact.',
      detail: 'Only let them take a treat when they look at your face.',
      durationSeconds: null,
      reps: 10,
      tip: 'Close before nose contact — you must be faster than the dog.',
      successLook: 'Dog looks at the open palm, glances at your face, and waits.'
    },
    {
      order: 3,
      action: 'Place a treat on your knee and wait for eye contact.',
      detail: 'Cover the treat if they try to grab it.',
      durationSeconds: null,
      reps: 10,
      tip: 'The eye contact is the behavior — "I don\'t grab, I check in with my person" is the entire habit.',
      successLook: 'Dog looks at the treat, then makes eye contact with you before you mark.'
    },
    {
      order: 4,
      action: 'Lower the food bowl and lift it if they dive.',
      detail: 'Only place it down and release when they step back calmly.',
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
      action: 'Place a treat on a table and cover it if they dive.',
      detail: 'Reward from your pouch once they back up and look at you.',
      durationSeconds: null,
      reps: 5,
      tip: 'The reward always comes from you — "things on surfaces are not for dogs."',
      successLook: 'Dog backs away from the table treat and looks at you.'
    },
    {
      order: 2,
      action: 'Wiggle a toy and stop moving it if they dive.',
      detail: 'Only start the game when the dog sits or pauses.',
      durationSeconds: null,
      reps: 5,
      tip: '"Calm behavior launches exciting things" — this principle transfers to every exciting moment.',
      successLook: 'Dog pauses or sits. You initiate play.'
    },
    {
      order: 3,
      action: 'Have your dog wait before jumping into the car.',
      detail: 'Restart if they jump in without permission and jackpot on success.',
      durationSeconds: null,
      reps: 5,
      tip: 'A dog that bolts into traffic because a car door opened is in real danger — train this seriously.',
      successLook: 'Dog waits at open car door until released, then jumps in and settles.'
    },
    {
      order: 4,
      action: 'Put the leash away if your dog jumps or spins.',
      detail: 'Only clip the leash once they are standing or sitting calmly.',
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
      action: 'Require a sit before anyone pets your dog.',
      detail: 'Have the person turn away if the dog jumps or lunges.',
      durationSeconds: null,
      reps: 4,
      tip: 'Brief the greeter: "Could you wait until he sits?" Most people are happy to help.',
      successLook: 'Dog sits while the stranger approaches and receives a calm greeting.'
    },
    {
      order: 2,
      action: 'Reward your dog when another dog passes.',
      detail: 'Ask for a sit or focus and stop treating once the dog is gone.',
      durationSeconds: null,
      reps: 3,
      tip: '"Other dog visible = treats from my person" is the association you are building.',
      successLook: 'Dog notices the other dog, glances at it, then orients to handler for treats.'
    },
    {
      order: 3,
      action: 'Require a sit before approaching something exciting.',
      detail: 'Release with "free!" once they have held the position.',
      durationSeconds: null,
      reps: 3,
      tip: 'Calm = access. Frantic = delay. This principle, applied to exciting stimuli, teaches self-regulation.',
      successLook: 'Dog sits with an exciting stimulus visible, holds 5 seconds, released calmly.'
    },
    {
      order: 4,
      action: 'Practice an "off-switch" after play.',
      detail: 'Stop play and ask for a down. The dog must settle before play resumes.',
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
      action: 'Treat your dog for allowing touches on their body.',
      detail: 'Move incrementally from shoulder to paw and restart if they pull away.',
      durationSeconds: null,
      reps: 5,
      tip: 'Work from least sensitive to most sensitive: body → legs → paws → between toes.',
      successLook: 'Dog holds still while you move from shoulder to paw with light pressure.'
    },
    {
      order: 2,
      action: 'Hold each paw while treating continuously.',
      detail: 'Give treats throughout the hold to build comfort.',
      durationSeconds: null,
      reps: 5,
      tip: 'Treating during the hold (not after) tells the dog the hold itself is not threatening.',
      successLook: 'Dog rests paw in your cupped hand for 3 seconds while eating continuously.'
    },
    {
      order: 3,
      action: 'Gently lift and hold the ear flap.',
      detail: 'Treat continuously and stop if they show any signs of stress.',
      durationSeconds: null,
      reps: 5,
      tip: 'Stop if you see stress signals — pulling away, whale eye, shaking. Reduce and rebuild.',
      successLook: 'Dog allows ear flap lifted and held for 2 seconds without pulling.'
    },
    {
      order: 4,
      action: 'Practice lifting lips and briefly opening the mouth.',
      detail: 'Treat at each step to build comfort with dental exams.',
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
      action: 'Reward your dog for investigating the nail clippers.',
      detail: 'Spend several sessions building a positive association.',
      durationSeconds: null,
      reps: null,
      tip: 'If the dog shows fear at the sight of clippers, place them on the floor at a distance and treat for looking at them from there.',
      successLook: 'Dog approaches clippers and sniffs them, looking for the treat.'
    },
    {
      order: 2,
      action: 'Touch the clippers to each toe and around one nail.',
      detail: 'Do not cut yet; just build comfort with the contact.',
      durationSeconds: null,
      reps: 5,
      tip: 'Each step may take multiple sessions. This protocol typically takes 2–4 weeks done correctly.',
      successLook: 'Dog holds still while clipper opening is placed around one nail.'
    },
    {
      order: 3,
      action: 'Trim only one nail and provide a jackpot reward.',
      detail: 'Clip just the tip and stop after one success.',
      durationSeconds: null,
      reps: null,
      tip: 'One nail and done is not weakness — it is the strategy that builds a dog who tolerates a full trim.',
      successLook: 'Dog holds still through the click of the clipper on one nail, receives jackpot.'
    },
    {
      order: 4,
      action: 'Maintain rewards throughout a full nail trim.',
      detail: 'Use high-value treats even if the dog is experienced.',
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
      action: 'Practice standing on a table or raised platform.',
      detail: 'Treat continuously while they are on the surface.',
      durationSeconds: 30,
      reps: 5,
      tip: 'The vet table is cold, metal, and unfamiliar — simulate this with a folding table before the real thing.',
      successLook: 'Dog stands on the raised surface, eating treats, without trying to jump off.'
    },
    {
      order: 2,
      action: 'Perform a full-body physical exam simulation weekly.',
      detail: 'Check ears, mouth, and paws while treating continuously.',
      durationSeconds: null,
      reps: 3,
      tip: 'This weekly home exam also functions as early health detection — you will notice lumps or pain that would otherwise go undetected.',
      successLook: 'Dog stands or lies calmly through a 3-minute full-body exam.'
    },
    {
      order: 3,
      action: 'Take your dog to the vet for a "happy visit."',
      detail: 'Get treats from staff and sit in the waiting room for a few minutes.',
      durationSeconds: null,
      reps: null,
      tip: 'Call ahead — most clinics welcome happy visits. 10 minutes transforms the dog\'s relationship with the clinic.',
      successLook: 'Dog enters the clinic without pulling backward and accepts a treat from staff.'
    },
    {
      order: 4,
      action: 'Practice holding your dog in a firm standing position.',
      detail: 'Treat continuously to build restraint tolerance.',
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
      action: 'Cue "wait" while walking and reward a pause.',
      detail: 'Mark "yes!" and continue walking once they pause.',
      durationSeconds: null,
      reps: 8,
      tip: '"Wait" is a positional pause, not a sit. Mark any paused movement, regardless of body position.',
      successLook: 'Dog pauses movement when "wait" is said, regardless of position.'
    },
    {
      order: 2,
      action: 'Practice a formal sit-stay.',
      detail: 'Return to the dog and release with "free!"',
      durationSeconds: null,
      reps: 7,
      tip: '"Stay" requires a specific position held until released — that is what makes it different from wait.',
      successLook: 'Dog holds sit for 5 seconds, released formally with "free!"'
    },
    {
      order: 3,
      action: 'Alternate between "wait" and "stay" cues.',
      detail: 'This helps the dog learn the difference between a pause and a stay.',
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
      action: 'Step in different directions during a stay.',
      detail: 'Step left, right, and behind. Return and treat after each direction.',
      durationSeconds: null,
      reps: 5,
      tip: 'Moving behind the dog (out of their sight line) is the hardest step — build to it gradually.',
      successLook: 'Dog holds stay while handler moves to all sides including briefly behind them.'
    },
    {
      order: 2,
      action: 'Increase stay distance gradually.',
      detail: 'Always walk back to the dog to deliver the reward.',
      durationSeconds: null,
      reps: 7,
      tip: 'Use variable distance — sometimes 3 feet, sometimes 8. The dog should not be able to predict the difficulty.',
      successLook: 'Dog holds stay while handler backs up to 10 feet and pauses for 5 seconds.'
    },
    {
      order: 3,
      action: 'Perform unpredictable movements while they hold the stay.',
      detail: 'Sidestep and move back and forth at a distance.',
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
      action: 'Practice a sit-stay with the food bowl on the floor.',
      detail: 'Hold the stay before releasing with "free!"',
      durationSeconds: null,
      reps: null,
      tip: 'Mealtime stay is twice-daily free practice — it takes 30 seconds and keeps the stay sharp without formal sessions.',
      successLook: 'Dog holds sit-stay 3 feet from bowl until "free!"'
    },
    {
      order: 2,
      action: 'Practice a stay while a helper enters the house.',
      detail: 'The dog must hold position while the guest walks into the room.',
      durationSeconds: null,
      reps: 4,
      tip: 'The dog on a stay-mat during guest arrival is the most socially elegant dog possible to live with.',
      successLook: 'Dog holds stay while guest enters and walks to the couch.'
    },
    {
      order: 3,
      action: 'Cue "wait" at every curb during your walk.',
      detail: 'Check for traffic and release with "free!" before crossing.',
      durationSeconds: null,
      reps: null,
      tip: 'Done consistently on every walk, the dog begins sitting at curbs automatically within 2–3 weeks.',
      successLook: 'Dog pauses naturally at the curb edge and looks up before crossing.'
    },
    {
      order: 4,
      action: 'Practice a down-stay on a mat in an outdoor park.',
      detail: 'Have a helper walk past with various distractions.',
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
      action: 'Find your dog\'s reaction threshold distance.',
      detail: 'Stop when they notice the other dog but before they react.',
      durationSeconds: null,
      reps: null,
      tip: 'Threshold is the distance at which the dog can notice the trigger but still take a treat and respond to you.',
      successLook: 'Dog notices the other dog at distance, takes a treat, maintains contact with you.'
    },
    {
      order: 2,
      action: 'Feed treats continuously while another dog is in view.',
      detail: 'Stay beyond their threshold and treat frequently.',
      durationSeconds: null,
      reps: 5,
      tip: '"Open bar when trigger is visible, closed bar when gone" — this pairs the trigger with treats at the emotional level.',
      successLook: 'Dog sniffs and eats treats while the other dog is visible.'
    },
    {
      order: 3,
      action: 'Turn and walk away if your dog reacts.',
      detail: 'Increase your starting distance for the next session.',
      durationSeconds: null,
      reps: null,
      tip: 'A reacting dog is over threshold, not misbehaving. Correction at this moment makes reactivity worse — more distance is always the answer.',
      successLook: 'Dog recovers within 30 seconds of moving away and can take treats again.'
    },
    {
      order: 4,
      action: 'Watch for your dog to look at you when a trigger appears.',
      detail: 'Reward this spontaneous check-in with a jackpot.',
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
      action: 'Move closer to the trigger after successful reps.',
      detail: 'Back up if your dog becomes reactive at the new distance.',
      durationSeconds: null,
      reps: 5,
      tip: 'Move closer in 5-foot increments only — slow shrinking is permanent, fast shrinking regresses.',
      successLook: 'Dog handles the 5-foot-closer distance with the same calm as before.'
    },
    {
      order: 2,
      action: 'Play the "Look at That" game when a trigger is visible.',
      detail: 'Reward when they look at the trigger and then back at you.',
      durationSeconds: null,
      reps: 5,
      tip: 'LAT gives the dog a job when they see a trigger — "notice it, then check in" instead of "notice it, then react."',
      successLook: 'Dog looks at other dog, then immediately looks back to handler.'
    },
    {
      order: 3,
      action: 'Walk parallel to another dog at a distance.',
      detail: 'Treat continuously while walking in the same direction.',
      durationSeconds: 180,
      reps: null,
      tip: 'Dogs are less reactive when walking alongside another dog than when facing them — use direction to your advantage.',
      successLook: 'Dog walks beside you with another dog visible 20 feet away for 3 minutes, no reaction.'
    },
    {
      order: 4,
      action: 'Practice threshold work in a new location.',
      detail: 'Expect regression and start at a greater distance initially.',
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
      action: 'Practice calm passes and parallel walks.',
      detail: 'Gradually reduce the lateral distance over several sessions.',
      durationSeconds: null,
      reps: 4,
      tip: 'For many reactive dogs, passing at 6 feet without incident is the real-world goal — not every dog needs or should have on-leash greetings.',
      successLook: 'Dog walks past another dog at 6 feet, no reaction, treats flowing.'
    },
    {
      order: 2,
      action: 'Approach another dog in an arc for a brief greeting.',
      detail: 'Allow a brief sniff and then walk away while treating.',
      durationSeconds: null,
      reps: 3,
      tip: 'Head-on approaches are confrontational in dog body language — always arc in from the side.',
      successLook: 'Dog sniffs the stooge briefly via arc approach, then walks away without lunging.'
    },
    {
      order: 3,
      action: 'Limit greetings and walk away cheerfully.',
      detail: 'End the interaction before any tension builds.',
      durationSeconds: null,
      reps: 3,
      tip: '"Say hi, then go" — always end on a positive note by leaving before either dog becomes uncomfortable.',
      successLook: 'Both dogs sniff briefly, both handlers move on with loose leashes.'
    },
    {
      order: 4,
      action: 'Practice walking past other dogs without greeting.',
      detail: 'Maintain a polite pass as the default behavior.',
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
      action: 'Lure your dog into a sit with a treat.',
      detail: 'Move the treat up and back over their head.',
      durationSeconds: null,
      reps: 5,
      tip: 'Keep the lure at nose height — too high and they jump instead of sitting.',
      successLook: 'Dog follows the lure into a clean sit without jumping or backing up.'
    },
    {
      order: 2,
      action: 'Use an empty hand signal to cue a sit.',
      detail: 'Reward from your pouch once they sit.',
      durationSeconds: null,
      reps: 10,
      tip: 'A dog that only sits when food is visible has not learned to sit — they have learned to follow food.',
      successLook: 'Dog sits following the empty hand signal.'
    },
    {
      order: 3,
      action: 'Transition to using the verbal "sit" cue alone.',
      detail: 'Keep your hands at your sides and jackpot if they comply.',
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
      action: 'Cue "stay" from a sit and wait.',
      detail: 'Reward while they are still in position.',
      durationSeconds: null,
      reps: 5,
      tip: 'Mark while seated — the mark communicates exactly what earned the treat.',
      successLook: 'Dog holds sit for 3 seconds without shuffling forward.'
    },
    {
      order: 2,
      action: 'Vary the duration of the sit-stay.',
      detail: 'Always release formally with "free!"',
      durationSeconds: null,
      reps: 8,
      tip: 'Variable duration prevents anticipation — a dog expecting release at 10 seconds always breaks at 11.',
      successLook: 'Dog holds sit-stay for 20 seconds with handler in front.'
    },
    {
      order: 3,
      action: 'Step back during the sit-stay.',
      detail: 'Always return to the dog to deliver the reward.',
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
      action: 'Practice the verbal "sit" cue outdoors.',
      detail: 'Use high-value treats and allow a brief response window.',
      durationSeconds: null,
      reps: 5,
      tip: 'Every new environment resets difficulty to beginner — start easy and rebuild.',
      successLook: 'Dog sits on verbal cue outdoors within 3 seconds.'
    },
    {
      order: 2,
      action: 'Practice sit-stays while a person walks or jogs past.',
      detail: 'Start with the person at a distance and gradually move closer.',
      durationSeconds: null,
      reps: 5,
      tip: 'Introduce distractions at the lowest intensity first — calm person far away, then increase.',
      successLook: 'Dog holds sit while a person walks past at 5 feet.'
    },
    {
      order: 3,
      action: 'Integrate sit cues into your daily routines.',
      detail: 'Use sit before meals, walks, greetings, and curb crossings.',
      durationSeconds: null,
      reps: null,
      tip: 'Real-life sit opportunities are more valuable than formal sessions — reinforce them with the actual real-world reward.',
      successLook: 'Dog begins offering sits spontaneously before exciting events without being asked.'
    },
    {
      order: 4,
      action: 'Track compliance for the next few days.',
      detail: 'Record every cue and note if they respond quickly on the first try.',
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
      action: 'Lure your dog into a down from a sit.',
      detail: 'Slide the treat along the floor away from them.',
      durationSeconds: null,
      reps: 5,
      tip: 'Slow is critical — move the lure too fast and the dog stands up to follow.',
      successLook: 'Dog lowers front elbows to the floor, hips follow into a full down.'
    },
    {
      order: 2,
      action: 'Use an empty hand signal to cue a down.',
      detail: 'Reward from your pouch once their elbows hit the floor.',
      durationSeconds: null,
      reps: 10,
      tip: 'Reward down with 2–3 treats rather than one — it is a more vulnerable position and earns more.',
      successLook: 'Dog lowers into down following the empty hand signal.'
    },
    {
      order: 3,
      action: 'Transition to using the verbal "down" cue alone.',
      detail: 'Keep hands at your sides and jackpot for a successful down.',
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
      action: 'Practice a down-stay with treats.',
      detail: 'Walk back to deliver treats and release with "free!"',
      durationSeconds: null,
      reps: 5,
      tip: 'Go to the dog to treat — calling them to you rewards leaving the down.',
      successLook: 'Dog holds down-stay for 30 seconds, treats delivered in position.'
    },
    {
      order: 2,
      action: 'Encourage a relaxed down with hips rolled over.',
      detail: 'Deliver treats to the side to encourage a hip shift.',
      durationSeconds: null,
      reps: 5,
      tip: 'A hip-rolled down is physically sustainable — a tense sphinx-hold is not genuinely settled.',
      successLook: 'Dog lies with hips rolled to one side, fully relaxed.'
    },
    {
      order: 3,
      action: 'Build the down-stay with variable intervals.',
      detail: 'Always use a formal release cue like "free!"',
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
      action: 'Cue "down" from a distance.',
      detail: 'Always walk back to the dog to deliver the reward.',
      durationSeconds: null,
      reps: 5,
      tip: 'A dog that downs from 8 feet on a verbal cue has genuinely understood the cue — not just responded to a hand in their face.',
      successLook: 'Dog lies down on verbal cue with handler 8 feet away.'
    },
    {
      order: 2,
      action: 'Practice "down" in different outdoor locations.',
      detail: 'Perform easy warm-up reps before asking for duration.',
      durationSeconds: null,
      reps: 3,
      tip: '2 easy reps in a new place prime the behavior reliably — never skip them.',
      successLook: 'Dog lies down on verbal cue in 3 different environments outside the home.'
    },
    {
      order: 3,
      action: 'Practice down-stays while a helper walks or jogs past.',
      detail: 'Start with the helper at a distance and gradually move closer.',
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
      action: 'Reward your dog for standing at your left hip.',
      detail: 'Deliver the treat at your hip with fingers pointing down.',
      durationSeconds: null,
      reps: 8,
      tip: 'Deliver the treat at your left hip every single time — the dog is learning that the reward zone lives here.',
      successLook: 'Dog stands at your left side, head near your hip, receiving the treat from hip height.'
    },
    {
      order: 2,
      action: 'Take steps and reward the dog at your hip.',
      detail: 'Reposition yourself if the dog overshoots the heel position.',
      durationSeconds: null,
      reps: 8,
      tip: 'You are establishing the geometry of the position before worrying about sustained walking.',
      successLook: 'Dog finishes at your left hip after 2 steps.'
    },
    {
      order: 3,
      action: 'Cue "heel" and wait for the dog to move to your hip.',
      detail: 'Only add the cue once they are consistently finding the position.',
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
      action: 'Walk forward in heel.',
      detail: 'Stop and reward at your hip if they stay in position.',
      durationSeconds: null,
      reps: 6,
      tip: '5 reps of 5-step heeling with treats beats one long unrewarded walk every time.',
      successLook: 'Dog maintains shoulder-at-hip position through 10 steps and stops when you stop.'
    },
    {
      order: 2,
      action: 'Change your walking pace while heeling.',
      detail: 'Vary between fast and slow and reward pace matching.',
      durationSeconds: null,
      reps: 5,
      tip: 'Pace changes keep the dog\'s attention on you — an unpredictable handler is an interesting handler.',
      successLook: 'Dog matches your pace immediately when you speed up or slow down.'
    },
    {
      order: 3,
      action: 'Perform left, right, and U-turns while heeling.',
      detail: 'Reward when the dog maintains their position through the turn.',
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
      action: 'Build up continuous steps in heel.',
      detail: 'Use variable reinforcement for rewards every several steps.',
      durationSeconds: null,
      reps: 5,
      tip: 'Variable reinforcement creates the most persistent behavior — the dog never knows when the next treat is coming, so they keep heeling.',
      successLook: 'Dog heels continuously for 60 steps, treats every 15–20 steps, never breaking position.'
    },
    {
      order: 2,
      action: 'Practice heeling in your driveway and on sidewalks.',
      detail: 'Use high-value treats and return to short segments initially.',
      durationSeconds: null,
      reps: 5,
      tip: 'Outdoor heel needs higher-value treats than indoor heel — the competition is real.',
      successLook: 'Dog holds heel for 20 consecutive steps outdoors on a quiet street.'
    },
    {
      order: 3,
      action: 'Heel while a helper walks parallel to you.',
      detail: 'Start with the helper at a distance and gradually move closer.',
      durationSeconds: null,
      reps: 3,
      tip: 'A person walking alongside is the most common real-world heel challenge — mastering this means the dog can navigate any crowded sidewalk.',
      successLook: 'Dog maintains heel for 20 steps while another person walks 10 feet away.'
    },
    {
      order: 4,
      action: 'Practice starting the heel with your left foot.',
      detail: 'Step off simultaneously with your dog from a sitting position.',
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
