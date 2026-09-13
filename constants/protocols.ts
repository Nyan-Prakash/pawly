export interface ProtocolStep {
  order: number
  /** Do: one action, imperative, <= 12 words, the number first. */
  instruction: string
  /** Then: what happens next and the reward, <= 12 words. */
  then?: string | null
  durationSeconds: number | null
  reps: number | null
  /** Why: the reason or the one mistake to avoid, <= 16 words. Shown behind "Why this step". */
  tip: string | null
  /** Success looks like: <= 10 words. */
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
  /** Checklist shown before step 1: "Quiet room", "Leash on, hanging loose". */
  setup?: string[]
  /** Procedural advice that is not an in-session action; shown in the course guide. */
  guide?: string | null
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
      instruction: 'Say the name once.',
      then: 'The instant they look at you, mark and treat at your hip.',
      durationSeconds: null,
      reps: 10,
      tip: 'Say it once and wait up to 10 seconds; repeating teaches them to ignore it.',
      successLook: 'They turn toward you within 3 seconds.'
    },
    {
      order: 2,
      instruction: 'Say the name, then wait for full eye contact.',
      then: 'When they look at your face, mark and treat at your hip.',
      durationSeconds: null,
      reps: 10,
      tip: 'Treat at your hip, not in front of you; the reward zone is beside your leg.',
      successLook: 'They look up at your face, not just toward you.'
    },
    {
      order: 3,
      instruction: 'Take 3 steps, stop, and say the name once.',
      then: 'When they make eye contact, mark and treat at your hip.',
      durationSeconds: null,
      reps: 5,
      tip: 'If the leash tightens, stop and wait; you want them to choose to check in.',
      successLook: 'They check in within 5 seconds of you stopping.'
    },
    {
      order: 4,
      instruction: 'Let them sniff freely for a minute.',
      then: 'Say \'free\' and follow them; no cues, no treats.',
      durationSeconds: 60,
      reps: null,
      tip: 'The sniff break is the reward; it makes the structured work easier to take.',
      successLook: 'They wander and sniff, relaxed.'
    },
  ],
  setup: ['Quiet room', 'Leash on, hanging loose', '20 tiny treats in hand'],
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
  trainerNote: 'This looks boring. It is the whole foundation of leash manners; give it three sessions.',
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
      instruction: 'Walk forward with the leash loose.',
      then: 'Keep going as long as the leash stays slack.',
      durationSeconds: null,
      reps: null,
      tip: 'You will stop and start a lot. That is the exercise.',
      successLook: 'You are moving, dog at your side.'
    },
    {
      order: 2,
      instruction: 'The instant the leash goes taut, freeze.',
      then: 'Say nothing and wait.',
      durationSeconds: null,
      reps: null,
      tip: 'Stop the moment you feel tension, not a few steps later.',
      successLook: 'Leash tight, you frozen, dog notices.'
    },
    {
      order: 3,
      instruction: 'Wait for any slack.',
      then: 'The instant the leash loosens, mark and walk forward.',
      durationSeconds: null,
      reps: null,
      tip: 'Walking forward is the reward. Treat only every third or fourth slack.',
      successLook: 'Dog steps toward you, leash goes slack.'
    },
    {
      order: 4,
      instruction: 'Repeat the walk, stop, slack, forward cycle.',
      then: 'Each slack earns forward motion; treat every third or fourth.',
      durationSeconds: null,
      reps: 15,
      tip: 'Silence when they pull. No name, no saying no.',
      successLook: 'Dog self-corrects before you fully stop.'
    },
    {
      order: 5,
      instruction: 'Every 20 to 30 loose steps, scatter 3 treats.',
      then: 'Drop them at your feet and let them collect.',
      durationSeconds: null,
      reps: null,
      tip: 'Scatter at your feet, not ahead, so they come back to your zone.',
      successLook: 'Leash hangs in a J shape beside you.'
    },
    {
      order: 6,
      instruction: 'Let them sniff freely on a loose leash.',
      then: 'Just walk with them; no rules for this bit.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Dog relaxed, nose down.'
    },
  ],
  setup: ['Quiet street or parking lot', '4 to 6 foot leash', 'One hand near your hip', 'Treats in pocket'],
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
  trainerNote: 'Improvement comes in three to five sessions if everyone in the house follows the same rule on every walk.',
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
      instruction: 'The moment they drift ahead, U-turn and say "this way."',
      then: 'Walk briskly the new way; they trot to catch up.',
      durationSeconds: null,
      reps: null,
      tip: 'Turn with energy; a slow turn teaches nothing.',
      successLook: 'They catch up and check in at your side.'
    },
    {
      order: 2,
      instruction: 'Watch for the loose leash as they reach your hip.',
      then: 'That instant, mark and treat at your hip.',
      durationSeconds: null,
      reps: null,
      tip: 'The catch-up moment is the golden rep; pay it, not before or after.',
      successLook: 'Leash hangs in a J, dog at hip.'
    },
    {
      order: 3,
      instruction: 'Change direction unpredictably: left, right, U-turn, slow, fast.',
      then: 'Each time they catch up loose, mark and treat.',
      durationSeconds: null,
      reps: 12,
      tip: 'Unpredictable means they have to watch you, not the street.',
      successLook: 'They glance at you, anticipating the next change.'
    },
    {
      order: 4,
      instruction: 'Approach one mild distraction at their threshold distance.',
      then: 'Do direction changes near it, paying each catch-up.',
      durationSeconds: null,
      reps: 3,
      tip: 'If they lunge or fixate, back up five steps; you are over threshold.',
      successLook: 'They glance at it, then check back with you.'
    },
    {
      order: 5,
      instruction: 'Drop all criteria and let them sniff.',
      then: 'Follow along; no cues, no leash pressure.',
      durationSeconds: 120,
      reps: null,
      tip: 'The free sniff lowers frustration and keeps structured walking sustainable.',
      successLook: 'Dog relaxed, nose down, sniffing freely.'
    },
  ],
  setup: ['Quiet street', 'Front-clip harness, 6-foot leash', 'High-value treats in pouch'],
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
  trainerNote: 'Quiet streets are the goal here; busy streets and other dogs are a separate module.',
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
      instruction: 'Say the name once.',
      then: 'The instant they glance, mark and toss a treat toward you.',
      durationSeconds: null,
      reps: 10,
      tip: 'Toss the treat toward yourself; the name starts to mean move toward the human.',
      successLook: 'They orient to you and step your way.'
    },
    {
      order: 2,
      instruction: 'Say the name, then hold their gaze 2 seconds.',
      then: 'After 2 seconds of eye contact, mark and treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Even one extra second of held eye contact is worth marking.',
      successLook: 'They hold eye contact for 2 seconds.'
    },
    {
      order: 3,
      instruction: 'Stand up, cross the room, then call the name.',
      then: 'Pat your legs as they come; jackpot 3 treats on arrival.',
      durationSeconds: null,
      reps: 5,
      tip: 'The jackpot teaches that coming all the way to you pays best.',
      successLook: 'They trot across the room to you.'
    },
    {
      order: 4,
      instruction: 'Play or let them sniff for a minute.',
      then: 'No cues, no treats; just end on a good note.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'They are relaxed and happy.'
    },
  ],
  setup: ['Quiet room', '20 tiny high-value treats', 'Sit on the floor'],
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
  trainerNote: 'Never call the name for something they dislike; every poisoned rep costs five good ones.',
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
      instruction: 'Say the name, then the cue, once.',
      then: 'When they arrive, mark and treat at your feet.',
      durationSeconds: null,
      reps: null,
      tip: 'The name gets attention; the cue means run to me. Keep them paired.',
      successLook: 'Head lifts at the name before the cue.'
    },
    {
      order: 2,
      instruction: 'Call from a different room each time.',
      then: 'When they arrive, jackpot 3 or 4 treats at your feet.',
      durationSeconds: null,
      reps: 8,
      tip: 'Changing rooms teaches that come works everywhere, not only face to face.',
      successLook: 'Dog comes running within 5 seconds.'
    },
    {
      order: 3,
      instruction: 'With kibble down and TV on, wait 10 seconds, then call.',
      then: 'No response in 5 seconds? Clap and run away.',
      durationSeconds: null,
      reps: 5,
      tip: 'Running away is one of the strongest recall tools; dogs chase movement.',
      successLook: 'Dog leaves the kibble and comes.'
    },
    {
      order: 4,
      instruction: 'From 15 feet, crouch, open your arms, and call.',
      then: 'On arrival, a full handful of treats and praise.',
      durationSeconds: null,
      reps: 2,
      tip: 'The arrival party sets how fast they run next time.',
      successLook: 'Dog sprints and pushes into your hands.'
    },
    {
      order: 5,
      instruction: 'Play with them for a minute.',
      then: 'No cues, just fun.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Dog is loose and happy.'
    },
  ],
  setup: ['Treats in hand', 'Kibble ready to scatter', 'TV within reach'],
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
  trainerNote: 'Do at least ten indoor sessions before going outside; the cue needs to matter before the world competes.',
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
      instruction: 'Let them sniff and decompress before any training.',
      then: 'Hold the line loosely and follow; no cues.',
      durationSeconds: 180,
      reps: null,
      tip: 'The long line is a safety net; never reel them in.',
      successLook: 'Relaxed, sniffing, not frantic or anxious.'
    },
    {
      order: 2,
      instruction: 'At 10 to 15 feet, say their name, then your cue.',
      then: 'No response in 3 seconds? Clap, turn, and run away.',
      durationSeconds: null,
      reps: 5,
      tip: 'If they are deeply fixated, move closer first instead of calling.',
      successLook: 'They disengage and trot toward you.'
    },
    {
      order: 3,
      instruction: 'When they arrive, feed 5 treats one at a time.',
      then: 'Praise the whole time; keep them close for 10 seconds.',
      durationSeconds: 10,
      reps: null,
      tip: 'Outdoor arrivals need bigger parties; the competition is stronger out here.',
      successLook: 'They press in, tail wagging, staying close.'
    },
    {
      order: 4,
      instruction: 'Say "go sniff" and let them wander off.',
      then: 'Once they are away again, call and party again.',
      durationSeconds: null,
      reps: 4,
      tip: 'Recall then freedom teaches that coming never ends the fun.',
      successLook: 'They come readily each time, no dodging.'
    },
    {
      order: 5,
      instruction: 'After the fastest recall, stop and let them sniff.',
      then: 'Nothing more asked; let them explore.',
      durationSeconds: 60,
      reps: null,
      tip: 'The last rep is the one they remember; make it a win.',
      successLook: 'Final recall was as fast as the first.'
    },
  ],
  setup: ['Quiet outdoor space', 'Long line on back-clip harness', 'High-value treats in pouch'],
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
  trainerNote: 'Off-leash recall in open spaces takes 6 to 12 months; only drop the line in fenced areas.',
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
      instruction: 'When any paw leaves the floor, turn your back.',
      then: 'Say nothing and fold your arms until four paws land.',
      durationSeconds: null,
      reps: null,
      tip: 'Even \'no\' is attention; silence is the only response to a jump.',
      successLook: 'Four paws hit the floor after you turn.'
    },
    {
      order: 2,
      instruction: 'The instant four paws are down, turn back and crouch.',
      then: 'Treat with calm praise, then stand and let them try again.',
      durationSeconds: null,
      reps: 20,
      tip: 'Keep your energy at half; excitement starts another jump cycle.',
      successLook: 'They approach and look up without leaving the floor.'
    },
    {
      order: 3,
      instruction: 'Wait 3 seconds of four paws before marking.',
      then: 'Count silently to three, then mark and treat low.',
      durationSeconds: null,
      reps: 5,
      tip: 'You are building duration now, not a quick touch-and-go.',
      successLook: 'They wait on all fours for 3 seconds.'
    },
    {
      order: 4,
      instruction: 'Let them sniff or play for a minute.',
      then: 'Keep it calm; no rough play that invites jumping.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'They are calm and on the floor.'
    },
  ],
  setup: ['Calm indoor room', 'Treats held at your chest', 'Whole household on the same rules'],
  guide: 'Everyone in the house follows the same rules: jumping earns nothing, four paws earn attention. One person who allows jumping undoes weeks of work. Never push the dog off or knee them; pushing is attention and kneeing is fear, and neither teaches the alternative.',
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
  trainerNote: 'This fails when one person in the house allows jumping. Get everyone on board before you start.',
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
      instruction: 'Cue sit.',
      then: 'Mark the instant they sit; treat between the front paws.',
      durationSeconds: null,
      reps: 10,
      tip: 'If the sit is shaky, fix it here before adding approaches.',
      successLook: 'Sits within 2 seconds, 9 of 10.'
    },
    {
      order: 2,
      instruction: 'From 5 feet, walk toward them.',
      then: 'If they sit uncued, mark and drop a treat between their paws.',
      durationSeconds: null,
      reps: null,
      tip: 'Treat between the paws; overhead delivery invites jumping.',
      successLook: 'Dog holds sit as you approach.'
    },
    {
      order: 3,
      instruction: 'If they jump, turn your back.',
      then: 'Wait for a sit, then approach again, slower.',
      durationSeconds: null,
      reps: null,
      tip: 'Try approaching from the side; your energy is triggering the jump.',
      successLook: 'Dog holds sit during a slow approach.'
    },
    {
      order: 4,
      instruction: 'Approach with a little more energy each rep.',
      then: 'Walk, then fast, then jog, then reach; treat each held sit.',
      durationSeconds: null,
      reps: 10,
      tip: 'Each energy level is a new test; if they fail, drop back one.',
      successLook: 'Sit holds while you jog and reach.'
    },
    {
      order: 5,
      instruction: 'Knock, cue sit, then open the door to a helper.',
      then: 'The helper drops a treat for the sitting dog.',
      durationSeconds: null,
      reps: 5,
      tip: 'Rehearse before real visitors; the habit must exist before the adrenaline.',
      successLook: 'Dog holds sit as the door opens.'
    },
    {
      order: 6,
      instruction: 'Play or sniff break.',
      then: 'Nothing to do; let them shake it off.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose body, relaxed dog.'
    },
  ],
  setup: ['Treats in hand', 'Helper for the doorbell drill'],
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
  trainerNote: 'A dog that sits for greetings on their own needs no management; they manage themselves.',
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
      instruction: 'Helper approaches from 20 feet; cue sit at 10 feet.',
      then: 'If they sit, helper drops a treat and pets calmly.',
      durationSeconds: null,
      reps: 5,
      tip: 'If they jump, the helper turns away. Keep the leash loose; it is backup only.',
      successLook: 'They hold the sit while the stranger pets them.'
    },
    {
      order: 2,
      instruction: 'Ask the helper to arrive excited, gushing and reaching.',
      then: 'Same rule: sit earns the greeting, jumping earns a turn away.',
      durationSeconds: null,
      reps: 3,
      tip: 'This step often causes regression; drop back a step if needed.',
      successLook: 'Four paws down or a sit despite the excitement.'
    },
    {
      order: 3,
      instruction: 'Repeat the greeting somewhere new: sidewalk, store, or park.',
      then: 'Start easy again; pay the first calm sit generously.',
      durationSeconds: null,
      reps: 2,
      tip: 'A new place feels like starting over; it generalizes faster each time.',
      successLook: 'Calm greeting holds in one new place.'
    },
    {
      order: 4,
      instruction: 'Release with play or a sniff break.',
      then: 'The helper can join if the dog stays calm.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Dog relaxed, engaged with you or the ground.'
    },
  ],
  setup: ['Helper the dog barely knows', 'Short 3 to 4 foot leash', '5 treats for the helper', 'Helper briefed on the plan'],
  guide: 'Before you start, brief your helper: ignore any jumping and turn away; the moment the dog sits, drop a treat and pet calmly. Give them five treats. An unprepared helper who greets a jumping dog is the most common reason this stage fails.',
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
  trainerNote: 'Carry treats on every walk for four weeks and recruit strangers; the reps compound quickly.',
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
      instruction: 'Leash up and walk to the potty spot.',
      then: 'Stand still and silent for up to 5 minutes.',
      durationSeconds: 300,
      reps: null,
      tip: 'This is not a walk; movement and excitement distract from the job.',
      successLook: 'They sniff, circle, or squat.'
    },
    {
      order: 2,
      instruction: 'While they are going, say your cue once, softly.',
      then: 'Keep quiet and still until they finish.',
      durationSeconds: null,
      reps: null,
      tip: 'Say it during the act, not after; over weeks the word starts to trigger it.',
      successLook: 'They keep going without stopping at your voice.'
    },
    {
      order: 3,
      instruction: 'The instant they finish, throw a party.',
      then: 'Excited voice, 3 to 5 treats one at a time.',
      durationSeconds: null,
      reps: null,
      tip: 'The jackpot must land within 2 seconds of the last squat.',
      successLook: 'Tail wagging, eating treats happily.'
    },
    {
      order: 4,
      instruction: 'Take a 5-minute bonus walk.',
      then: 'Let them sniff and explore; this is the reward for going.',
      durationSeconds: 300,
      reps: null,
      tip: 'Reward outside, right away; a treat back indoors teaches nothing.',
      successLook: 'They enjoy a relaxed walk.'
    },
  ],
  setup: ['Short leash by the door', 'Treats by the door', 'Same spot, same route'],
  guide: 'Post a potty schedule and set alarms. Puppies under 4 months: every 1 to 2 hours; 4 to 6 months: every 2 to 3 hours; adults: every 3 hours. Add a trip after waking, eating, and play. If nothing happens in 5 minutes, come inside, tether or crate them, and try again in 15 minutes.',
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
  trainerNote: 'Potty training is 90 percent management; every unsupervised accident is a rep of the wrong thing.',
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
      instruction: 'Before a potty trip, hold a treat by the bell.',
      then: 'Nose rings it: mark and open the door right away.',
      durationSeconds: null,
      reps: 6,
      tip: 'Every trip, for a full week, no exceptions.',
      successLook: 'Bell rings, door opens.'
    },
    {
      order: 2,
      instruction: 'Wait near the door instead of starting the trip.',
      then: 'When they ring on their own, open the door immediately.',
      durationSeconds: null,
      reps: null,
      tip: 'Only after 5 to 7 days of pairing. Some dogs take weeks.',
      successLook: 'Dog rings the bell unprompted.'
    },
    {
      order: 3,
      instruction: 'Go to the spot and wait up to 2 minutes.',
      then: 'Jackpot the instant they finish.',
      durationSeconds: 120,
      reps: null,
      tip: null,
      successLook: 'Dog eliminates at the spot.'
    },
    {
      order: 4,
      instruction: 'Nothing within 2 minutes? Go straight back inside.',
      then: 'No play, no walk. Try again later.',
      durationSeconds: null,
      reps: null,
      tip: 'Reward a fake ring once and the whole protocol slides back.',
      successLook: 'Dog rings only when they need to go.'
    },
    {
      order: 5,
      instruction: 'After a real potty, take a one-minute sniff walk.',
      then: 'This is the reward for a real ring.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Dog sniffs happily, then back in.'
    },
  ],
  setup: ['Bell hung at nose height', 'Treats in pocket', 'Potty spot picked'],
  guide: 'Hang the bell at nose height on the potty door. For one week, every trip starts with the bell. After 5 to 7 days, stop starting trips yourself and wait for the ring. A ring with no elimination inside 2 minutes means straight back in; walks and play only follow a real potty.',
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
  trainerNote: 'The bell is a tool, not a fixture; most dogs move to sitting at the door on their own.',
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
      instruction: 'Let them roam their current room while you supervise.',
      then: 'Any circling or corner sniffing? Redirect outside right away.',
      durationSeconds: null,
      reps: null,
      tip: 'Every accident sets you back two weeks; expand freedom slowly.',
      successLook: 'They roam without circling or sniffing corners.'
    },
    {
      order: 2,
      instruction: 'Watch for their tell: circling, floor sniffing, leaving the room.',
      then: 'See one? Say "outside" cheerfully and go straight out.',
      durationSeconds: null,
      reps: null,
      tip: 'Every dog has a tell; spotting yours beats cleaning up.',
      successLook: 'They get outside before anything happens.'
    },
    {
      order: 3,
      instruction: 'At the spot, say "go potty" once and wait.',
      then: 'When they go, mark and treat right there.',
      durationSeconds: null,
      reps: 4,
      tip: 'A potty cue pays off before car trips, bedtime, and travel.',
      successLook: 'They go within 2 minutes of arriving.'
    },
    {
      order: 4,
      instruction: 'After they go, let them sniff around outside.',
      then: 'Going potty earns the fun part of being out.',
      durationSeconds: 60,
      reps: null,
      tip: 'If you go in right after, they learn to hold it longer.',
      successLook: 'Relaxed sniffing, no rushing back in.'
    },
  ],
  setup: ['Baby gates set for one room', 'Treat pouch', 'Enzymatic cleaner on hand'],
  guide: 'Expand indoor freedom one room at a time: one small supervised room, then add the next after two accident-free weeks. If an accident happens, no reaction and no scolding; clean with enzymatic cleaner and tighten management for 48 hours. Regular cleaners leave scent the dog can still find.',
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
  trainerNote: 'Full reliability takes months, not weeks; after any regression, return to Stage 1 for a week.',
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
      instruction: 'Scatter a few kibble pieces inside the crate.',
      then: 'Step back and let them investigate on their own.',
      durationSeconds: null,
      reps: null,
      tip: 'Pressure now creates avoidance that takes weeks to undo; never push or lure.',
      successLook: 'They sniff the entrance, maybe one paw in.'
    },
    {
      order: 2,
      instruction: 'Toss a treat just inside the door.',
      then: 'When they take it and step out, toss the next slightly deeper.',
      durationSeconds: null,
      reps: 10,
      tip: 'Work toward the back wall over several sessions; meet them where they stop.',
      successLook: 'They walk in, collect the treat, walk out calmly.'
    },
    {
      order: 3,
      instruction: 'Feed the next meal inside the crate, door open.',
      then: 'Bowl just inside for 3 days, then at the back.',
      durationSeconds: null,
      reps: null,
      tip: 'Every meal inside is a free positive rep.',
      successLook: 'They walk in for meals without hesitation.'
    },
    {
      order: 4,
      instruction: 'Close the door for 10 seconds while they eat.',
      then: 'Stay in the room; open it quietly and build to 60 seconds.',
      durationSeconds: 60,
      reps: null,
      tip: 'Keep the door completely anticlimactic; no big production opening or closing.',
      successLook: 'They keep eating, no scratching or whining.'
    },
    {
      order: 5,
      instruction: 'Open the crate and let them wander out.',
      then: 'No fuss; a short sniff or play break ends the session.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'They leave calmly and relax.'
    },
  ],
  setup: ['Crate in the living room', 'Door off or propped open', 'Worn T-shirt inside', 'Handful of kibble'],
  guide: 'Each step needs 2 to 3 days minimum; allow 1 to 2 weeks for this stage. Never use the crate as punishment, and never open the door for whining; wait for a quiet moment first.',
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
  trainerNote: 'The goal is a dog that puts themselves to bed. It cannot be rushed; give it two weeks.',
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
      instruction: 'Give the chew toy in the crate and close the door.',
      then: 'Sit in the room and ignore the crate completely.',
      durationSeconds: 600,
      reps: null,
      tip: 'Frozen peanut butter does the work. Chew done? Wait 2 quiet minutes first.',
      successLook: 'Dog works the chew and settles.'
    },
    {
      order: 2,
      instruction: 'Stand, walk to the doorway, pause 10 seconds.',
      then: 'Return to your seat. No eye contact with the crate.',
      durationSeconds: null,
      reps: 5,
      tip: 'Your movement should mean nothing; keep it boring.',
      successLook: 'Dog stays lying down as you move.'
    },
    {
      order: 3,
      instruction: 'Leave the room for 30 seconds.',
      then: 'Come back before any fuss, sit down, ignore the crate.',
      durationSeconds: 30,
      reps: null,
      tip: 'You are building a history of you always coming back.',
      successLook: 'Head lifts at your return, then settles again.'
    },
    {
      order: 4,
      instruction: 'Leave again, a little longer each time.',
      then: '30 seconds, 1, 2, then 5 minutes; always return before distress.',
      durationSeconds: 300,
      reps: null,
      tip: 'Return only during quiet moments, never while they whine.',
      successLook: 'No frantic greeting when you come back.'
    },
    {
      order: 5,
      instruction: 'Open the crate door and wait for calm.',
      then: 'Only then a low-key hello.',
      durationSeconds: null,
      reps: 3,
      tip: 'A wild exit teaches high arousal around crate time.',
      successLook: 'Dog steps out calmly.'
    },
    {
      order: 6,
      instruction: 'Let them sniff or stretch out for a minute.',
      then: 'Stay low-key; the session is over.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Dog wanders calmly, no zoomies.'
    },
  ],
  setup: ['Dog exercised first', 'Frozen stuffed chew toy', 'Crate door open', 'A seat in the same room'],
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
  trainerNote: 'Exercise the dog before every crate session; a tired dog crates easily and a bored one only stresses.',
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
      instruction: 'Run the ritual: exercise, cue word, chew toy in, dog enters.',
      then: 'Same order every time, no variation.',
      durationSeconds: null,
      reps: null,
      tip: 'Predictability is calming; a dog who knows what is coming worries less.',
      successLook: 'They hear the cue and walk to the crate.'
    },
    {
      order: 2,
      instruction: 'Leave for today\'s step on the schedule; no fuss.',
      then: 'Check the camera when back; look for stress after 5 minutes.',
      durationSeconds: null,
      reps: null,
      tip: 'Quiet at return does not mean calm throughout; the camera tells the truth.',
      successLook: 'Asleep or resting calmly on camera.'
    },
    {
      order: 3,
      instruction: 'Leave the crate door open in the evening; do not prompt.',
      then: 'Wait for them to choose it on their own.',
      durationSeconds: null,
      reps: null,
      tip: 'A dog who chooses the crate is comfortable, not just tolerating it.',
      successLook: 'They walk in and rest, unprompted.'
    },
    {
      order: 4,
      instruction: 'Once a week, crate them mid-day with a chew toy.',
      then: 'Go about your day; let them out calmly after.',
      durationSeconds: 1800,
      reps: null,
      tip: 'Unmaintained skills fade; a weekly surprise keeps it intact.',
      successLook: 'They enter on cue with no resistance.'
    },
    {
      order: 5,
      instruction: 'Open the crate and let them out calmly.',
      then: 'Straight outside for a short sniff, no big greeting.',
      durationSeconds: 60,
      reps: null,
      tip: 'A low-key exit keeps the crate from predicting a party.',
      successLook: 'Calm exit, loose body, sniffing.'
    },
  ],
  setup: ['Crate with familiar bedding', 'Pet camera running', 'Chew toy ready', 'White noise on, optional'],
  guide: 'Extend alone time in steps: 30 minutes, 1 hour, 90 minutes, 2 hours, 3 hours over 2 to 3 weeks, never more than one step a day. Review the camera after every session; panting, drooling, pawing, or vocalizing after the first 5 minutes means it was too long.',
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
  trainerNote: 'Four to five waking hours is the maximum for an adult; nine hours is management, not care.',
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
      instruction: 'Play, and let gentle mouthing happen.',
      then: 'When a bite hurts, say \'ouch\' sharply and freeze for 3 seconds.',
      durationSeconds: null,
      reps: null,
      tip: 'Think of a puppy\'s yelp: sharp and brief. Overreacting excites them more.',
      successLook: 'They pause and pull back a little.'
    },
    {
      order: 2,
      instruction: 'After 3 seconds, resume play.',
      then: 'After 3 hard bites, stand up and turn away for 30 seconds.',
      durationSeconds: 30,
      reps: null,
      tip: 'The time-out is information, not punishment: hard biting ends play.',
      successLook: 'Bite pressure softens over the session.'
    },
    {
      order: 3,
      instruction: 'After any freeze, wiggle a toy and say \'get the toy\'.',
      then: 'When they bite the toy instead, mark and play hard.',
      durationSeconds: null,
      reps: 10,
      tip: 'The toy must beat skin: wiggle it, toss it, make it prey.',
      successLook: 'They move from your hand to the toy.'
    },
    {
      order: 4,
      instruction: 'Hold your open hand still near their face.',
      then: 'Any gentle sniff or lick earns a treat from your other hand.',
      durationSeconds: null,
      reps: 5,
      tip: 'This turns \'hands are a target\' into \'still hands mean treats\'.',
      successLook: 'They sniff or lick your hand gently.'
    },
    {
      order: 5,
      instruction: 'End with a minute of calm toy play.',
      then: 'Keep it low key; stop before they get wild again.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'They play with the toy, not you.'
    },
  ],
  setup: ['Tug or rope toy within reach', 'Tiny treats in your pocket', 'Puppy rested, not overtired'],
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
  trainerNote: 'The goal is not zero mouthing; it is zero hard biting. A soft mouth is a safer dog.',
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
      instruction: 'Any tooth on skin: freeze silently for 5 seconds.',
      then: 'No ouch. Then resume play with a toy.',
      durationSeconds: 5,
      reps: null,
      tip: 'The shift from no hard biting to no teeth at all is the key.',
      successLook: 'Puppy pauses when you freeze.'
    },
    {
      order: 2,
      instruction: 'Hold out a toy before you touch them.',
      then: 'Let them grab it first, then play.',
      durationSeconds: null,
      reps: null,
      tip: 'A toy already in play removes the moment they default to skin.',
      successLook: 'Puppy grabs the toy, not hands.'
    },
    {
      order: 3,
      instruction: 'Sit with your hands still in your lap.',
      then: 'Sniff or lick: treat. Teeth: stand and turn away 30 seconds.',
      durationSeconds: null,
      reps: 10,
      tip: 'After 10 reps most puppies stop mouthing and start looking at you.',
      successLook: 'Puppy sniffs hands, then offers eye contact.'
    },
    {
      order: 4,
      instruction: 'Gently hold the collar, touch a paw, look in an ear.',
      then: 'Feed treats the whole time.',
      durationSeconds: null,
      reps: 5,
      tip: 'A puppy that accepts handling becomes a dog who tolerates the vet.',
      successLook: 'Puppy holds still while eating.'
    },
    {
      order: 5,
      instruction: 'Play tug with a toy.',
      then: 'Keep your hands behind the toy.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Teeth on the toy only.'
    },
  ],
  setup: ['Toys stationed around the room', 'Treat pouch on'],
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
  trainerNote: 'Teething puppies need more to chew, not less; add chew toys and bully sticks alongside this.',
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
      instruction: 'Hold a treat in a closed, still fist.',
      then: 'When they back off or sit, open and feed.',
      durationSeconds: null,
      reps: 10,
      tip: 'Keep the fist completely still; any movement says biting works.',
      successLook: 'They back away and offer a sit or eye contact.'
    },
    {
      order: 2,
      instruction: 'Have your helper offer a closed fist to sniff.',
      then: 'Freeze if teeth touch; treat and pet if calm.',
      durationSeconds: null,
      reps: 5,
      tip: 'Three sessions with strangers beat thirty with only you.',
      successLook: 'Calm sniff, no mouthing, no jumping.'
    },
    {
      order: 3,
      instruction: 'Repeat the fist greeting in a new place.',
      then: 'Start calmer than at home; pay early wins.',
      durationSeconds: null,
      reps: 3,
      tip: 'New places cause regression; start with lower-energy interactions.',
      successLook: 'Calm mouth holds in a new place.'
    },
    {
      order: 4,
      instruction: 'Teach kids "statue": stand still, closed fist out.',
      then: 'If the puppy sniffs without mouthing, you treat calmly.',
      durationSeconds: null,
      reps: 3,
      tip: 'Never leave a child and puppy unsupervised, no exceptions.',
      successLook: 'Puppy sniffs a still child, no jumping or mouthing.'
    },
    {
      order: 5,
      instruction: 'End with a toy game to burn off the rest.',
      then: 'Toy in mouth, not hands; stop if teeth find skin.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Puppy bites the toy, not you.'
    },
  ],
  setup: ['Helper the puppy barely knows', 'Leash on for greetings', 'Treats for you and helper', 'Toy for redirection'],
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
  trainerNote: 'A puppy with solid bite inhibition by six months is set up for life; take this window seriously.',
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
      instruction: 'Wait for any paw to touch the mat.',
      then: 'Mark and toss 3 treats onto the mat.',
      durationSeconds: null,
      reps: null,
      tip: 'Do not lure them onto it; wait for natural contact and mark it.',
      successLook: 'They step on, hear the mark, eat on the mat.'
    },
    {
      order: 2,
      instruction: 'Move 3 steps away and wait.',
      then: 'When they return and touch the mat, mark and scatter 3 treats.',
      durationSeconds: null,
      reps: 10,
      tip: 'When they go deliberately and look at you from it, jackpot 5 treats.',
      successLook: 'They walk to the mat and look at you.'
    },
    {
      order: 3,
      instruction: 'Wait for a down on the mat before marking.',
      then: 'Drop a treat between their front paws to help, twice at most.',
      durationSeconds: null,
      reps: 5,
      tip: 'After 2 or 3 lure reps, stop and wait for them to offer it.',
      successLook: 'They lie down on the mat unasked.'
    },
    {
      order: 4,
      instruction: 'Say \'settle\' once as they start toward the mat.',
      then: 'When they lie down on it, mark and treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Add the word only after the behavior exists; naming confusion teaches nothing.',
      successLook: 'They head to the mat on hearing the cue.'
    },
    {
      order: 5,
      instruction: 'Say \'free\' and let them off the mat.',
      then: 'A minute of sniffing or play ends the session.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'They leave the mat and relax.'
    },
  ],
  setup: ['Mat in the living room', 'Treat pouch on', 'Plenty of tiny treats'],
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
  trainerNote: 'The mat becomes a calming station, a mealtime boundary, and a reset button. Build it well.',
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
      instruction: 'Cue place.',
      then: 'Every 15 seconds, walk a treat to the mat.',
      durationSeconds: 120,
      reps: null,
      tip: 'Always go to the dog; calling them off rewards leaving.',
      successLook: 'Dog holds position as you walk over.'
    },
    {
      order: 2,
      instruction: 'Turn on the TV, then cue place.',
      then: 'Walk a treat to the mat every 30 seconds.',
      durationSeconds: 180,
      reps: null,
      tip: null,
      successLook: 'Dog stays on the mat with the TV on.'
    },
    {
      order: 3,
      instruction: 'Stretch the gaps: 60 seconds, then 2 minutes.',
      then: 'Still walk every treat to the mat.',
      durationSeconds: 180,
      reps: null,
      tip: 'Fade gradually; jumping from 30 seconds to nothing makes them leave.',
      successLook: 'Dog stays 5 minutes with the TV on.'
    },
    {
      order: 4,
      instruction: 'Walk casually past the mat every 30 seconds.',
      then: 'Each time they stay, toss a treat to the mat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Following you is the biggest settle challenge; this proofs it.',
      successLook: 'Dog stays as you pass, does not follow.'
    },
    {
      order: 5,
      instruction: 'Have a helper walk in, move around, and sit.',
      then: 'Walk a treat to the mat every 60 seconds.',
      durationSeconds: 300,
      reps: null,
      tip: 'Release with a clear word, free or okay, every time.',
      successLook: 'Dog stays relaxed for 5 minutes.'
    },
    {
      order: 6,
      instruction: 'Say free, then a sniff or play break.',
      then: 'Off the mat, no rules.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Dog gets up only on the release.'
    },
  ],
  setup: ['Mat down', 'Treat pouch on', 'TV within reach', 'A household helper nearby'],
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
  trainerNote: 'Settle rewards itself once learned; a settled dog gets left alone, and treats can fade fast.',
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
      instruction: 'From 10 feet, cue "place" once.',
      then: 'Treat on arrival; add distance each rep, up to 30 feet.',
      durationSeconds: null,
      reps: 5,
      tip: 'At distance they are problem-solving; celebrate every attempt.',
      successLook: 'They cross the room and lie down on the mat.'
    },
    {
      order: 2,
      instruction: 'From the next room, cue "place" without pointing.',
      then: 'If they hesitate 5 seconds, walk toward the mat and point once.',
      durationSeconds: null,
      reps: 3,
      tip: 'If the mat is new to that room, let them explore first.',
      successLook: 'They leave your room and settle on the mat.'
    },
    {
      order: 3,
      instruction: 'Cue place, hand over the chew toy, start the timer.',
      then: 'Drop a treat on the mat every 2 minutes, no eye contact.',
      durationSeconds: 600,
      reps: null,
      tip: 'No eye contact keeps them down instead of popping up to look.',
      successLook: 'They hold for 10 minutes until "free."'
    },
    {
      order: 4,
      instruction: 'Take the mat somewhere new and cue "place."',
      then: 'Treat on arrival; release quickly with "free."',
      durationSeconds: null,
      reps: 3,
      tip: 'Bring the same mat; familiar scent and texture carry the cue.',
      successLook: 'They go to the mat in the new place.'
    },
    {
      order: 5,
      instruction: 'In the new place, cue place and wait.',
      then: 'Treat on the mat every minute; release with "free" at 3.',
      durationSeconds: 180,
      reps: null,
      tip: 'A settle that only works at home is not trained yet.',
      successLook: 'They hold 3 minutes somewhere new.'
    },
    {
      order: 6,
      instruction: 'Say "free" and let them get up and sniff.',
      then: 'Play or sniff; no more cues.',
      durationSeconds: 60,
      reps: null,
      tip: 'Always release formally; "free" is the only way a settle ends.',
      successLook: 'They leave the mat relaxed.'
    },
  ],
  setup: ['Portable mat', 'Chew toy', 'High-value treats', 'Timer'],
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
  trainerNote: 'Place from another room and a 10-minute hold makes guests, calls, and mealtimes manageable.',
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
      instruction: 'Hold your closed fist at nose height.',
      then: 'Say nothing; do not open it, whatever they try.',
      durationSeconds: null,
      reps: null,
      tip: 'Your fist stays closed through licking and pawing; any movement rewards persistence.',
      successLook: 'They sniff, then back their nose away.'
    },
    {
      order: 2,
      instruction: 'The instant they back off, mark.',
      then: 'Treat from the other hand; the fist kibble is never given.',
      durationSeconds: null,
      reps: 10,
      tip: 'Reward from the opposite hand: leave the lesser thing, get the better thing.',
      successLook: 'They pull back and take the better treat.'
    },
    {
      order: 3,
      instruction: 'Say \'leave it\' as you present the fist.',
      then: 'When they back off, mark and treat from the other hand.',
      durationSeconds: null,
      reps: 10,
      tip: 'Add the cue only after 5 quick back-offs in a row.',
      successLook: 'They glance at the fist, then back to you.'
    },
    {
      order: 4,
      instruction: 'Open your hand flat, treat visible, and say \'leave it\'.',
      then: 'Mark the pull-back; treat from your other hand.',
      durationSeconds: null,
      reps: 5,
      tip: 'If they eat it, close your hand and reset; no correction needed.',
      successLook: 'They look at the palm treat, then at you.'
    },
    {
      order: 5,
      instruction: 'Let them sniff freely for a minute.',
      then: 'Say \'free\' and follow them; no cues, no treats.',
      durationSeconds: 60,
      reps: null,
      tip: 'The sniff break is the reward; it makes the structured work easier to take.',
      successLook: 'They wander and sniff, relaxed.'
    },
  ],
  setup: ['Kibble in one closed fist', 'High-value treats in the other', 'Quiet room'],
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
  trainerNote: 'Leave it is a safety cue. Build it like their life depends on it; one day it will.',
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
      instruction: 'Put kibble on the floor under your foot, say leave it.',
      then: 'When they back off, mark and treat from your hand.',
      durationSeconds: null,
      reps: 8,
      tip: 'Your foot is the barrier. Stand still and wait.',
      successLook: 'Dog sniffs, backs away, looks at your face.'
    },
    {
      order: 2,
      instruction: 'Uncover the kibble and say leave it from 1 foot.',
      then: 'Hold 3 seconds: mark and treat from your hand. Lunge: cover it.',
      durationSeconds: null,
      reps: 7,
      tip: 'Be faster than the dog; if you cannot, use duller food.',
      successLook: 'Dog glances at the kibble, then at you.'
    },
    {
      order: 3,
      instruction: 'Let them grab a toy, then hold a treat under their nose.',
      then: 'Toy drops: say yes, drop it, treat, hand the toy back.',
      durationSeconds: null,
      reps: 5,
      tip: 'A dog who learns drop it means losing the toy stops dropping.',
      successLook: 'Jaw opens, toy falls.'
    },
    {
      order: 4,
      instruction: 'Repeat with a bully stick or chew.',
      then: 'Treat under the nose, wait, trade, then give it back.',
      durationSeconds: null,
      reps: 3,
      tip: 'Never yank. Build a perfect trade history before any emergency grab.',
      successLook: 'Dog releases the chew for the trade.'
    },
    {
      order: 5,
      instruction: 'Play with the toy for a minute.',
      then: 'Let them keep it at the end.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Dog relaxed, toy in mouth.'
    },
  ],
  setup: ['Kibble for the floor', 'High-value treats in pouch', 'A toy', 'A bully stick or chew'],
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
  trainerNote: 'Leave it means do not touch that; drop it means release what you have. Keep them separate for now.',
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
      instruction: 'Drop kibble ahead and walk toward it.',
      then: 'Say "leave it" 2 steps before; mark and pay from pouch.',
      durationSeconds: null,
      reps: 5,
      tip: 'Cue before contact; cuing after is damage control, not training.',
      successLook: 'They see the food, hear the cue, look to you.'
    },
    {
      order: 2,
      instruction: 'Walk past food on the ground without cuing.',
      then: 'Jackpot if they ignore it; if not, "leave it" once, keep walking.',
      durationSeconds: null,
      reps: 5,
      tip: 'The goal is silent leaving; the cue is only a backup.',
      successLook: 'They pass ground food and check in with you.'
    },
    {
      order: 3,
      instruction: 'Indoors, drop chicken and say "leave it."',
      then: 'After a 3-second hold, pay with your very best treat.',
      durationSeconds: null,
      reps: 3,
      tip: 'The reward must beat the chicken; kibble against chicken fails every time.',
      successLook: 'They look at it, hold 3 seconds, get a jackpot.'
    },
    {
      order: 4,
      instruction: 'At threshold distance from an animal, say "leave it."',
      then: 'Hold a treat at your face; mark when they look at you.',
      durationSeconds: null,
      reps: 3,
      tip: 'Threshold near a squirrel may be 30 feet; start where they can hear you.',
      successLook: 'They notice the animal, then orient to you.'
    },
    {
      order: 5,
      instruction: 'Pick up the planted food, then let them sniff.',
      then: 'No cues; just a walk with a loose leash.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Relaxed sniffing, nothing scavenged.'
    },
  ],
  setup: ['Leash on, outdoors', 'Kibble and chicken to plant', 'Best treats in pouch'],
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
  trainerNote: 'Leave it near squirrels is a 6 to 12 month project; every real-world failure costs five good reps.',
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
      instruction: 'Hold a treat at their nose and lift it back.',
      then: 'The instant their rear touches the floor, mark and treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Keep the lure at nose height; too high and they jump.',
      successLook: 'A clean sit, no jumping or backing up.'
    },
    {
      order: 2,
      instruction: 'Same hand motion, no treat in that hand.',
      then: 'When they sit, mark and treat from the other hand.',
      durationSeconds: null,
      reps: 10,
      tip: 'A dog that sits only for visible food has not learned sit.',
      successLook: 'They sit for the empty hand signal.'
    },
    {
      order: 3,
      instruction: 'Say \'sit\' once, then give the hand signal.',
      then: 'After 5 pairs, try the word alone; jackpot if they sit.',
      durationSeconds: null,
      reps: 10,
      tip: 'Say it once and wait; repeating teaches the first cue is optional.',
      successLook: 'They sit on the word, hands at your sides.'
    },
    {
      order: 4,
      instruction: 'From a sit, lure to the floor, then slide it away.',
      then: 'The instant elbows touch, mark and give 3 treats.',
      durationSeconds: null,
      reps: 5,
      tip: 'Down is a vulnerable position; pay it more than a sit.',
      successLook: 'Elbows down, hips follow into a full down.'
    },
    {
      order: 5,
      instruction: 'Same floor motion, no treat in that hand.',
      then: 'When elbows land, mark and treat from the other hand.',
      durationSeconds: null,
      reps: 5,
      tip: 'Move the lure slowly, or they stand up to follow it.',
      successLook: 'They lie down for the empty hand signal.'
    },
    {
      order: 6,
      instruction: 'Say \'down\' once, then give the hand signal.',
      then: 'After 5 pairs, try the word alone; jackpot if they down.',
      durationSeconds: null,
      reps: 5,
      tip: null,
      successLook: 'They lie down on the word, hands at sides.'
    },
    {
      order: 7,
      instruction: 'Let them sniff freely for a minute.',
      then: 'Say \'free\' and follow them; no cues, no treats.',
      durationSeconds: 60,
      reps: null,
      tip: 'The sniff break is the reward; it makes the structured work easier to take.',
      successLook: 'They wander and sniff, relaxed.'
    },
  ],
  setup: ['Low-distraction room', 'Tiny treats in a pouch'],
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
  trainerNote: 'Sit and down underpin almost everything else here. A sit that sometimes works is not trained.',
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
      instruction: 'Cue sit, then say stay with a flat palm.',
      then: 'Count 2 seconds, mark while they still sit, then treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Mark while seated so the mark says exactly what earned the treat.',
      successLook: 'Sit holds 2 seconds, no shuffling.'
    },
    {
      order: 2,
      instruction: 'Vary the count: 2, 5, 3, 10, 7, 15, 20 seconds.',
      then: 'Mark, treat, then release with free every rep.',
      durationSeconds: null,
      reps: 8,
      tip: 'Never only increase; a dog released at 10 every time breaks at 11.',
      successLook: 'Stay holds 20 seconds with you in front.'
    },
    {
      order: 3,
      instruction: 'Take one step back, then return.',
      then: 'Treat in position. Add a step each rep, to 5 feet.',
      durationSeconds: null,
      reps: 5,
      tip: 'Always walk back to reward. Never call them to you.',
      successLook: 'Sit-stay holds while you go 5 feet and back.'
    },
    {
      order: 4,
      instruction: 'Cue down, then stay, and hold 30 seconds.',
      then: 'Return every 10 seconds to drop a treat in position.',
      durationSeconds: 30,
      reps: null,
      tip: 'Down is more comfortable, so it holds longer than sit.',
      successLook: 'Down-stay holds 30 seconds.'
    },
    {
      order: 5,
      instruction: 'Step back to 5 feet during the down-stay.',
      then: 'Return to treat every 10 seconds, then release.',
      durationSeconds: null,
      reps: 3,
      tip: null,
      successLook: 'Down-stay holds 30 seconds at 5 feet.'
    },
    {
      order: 6,
      instruction: 'Say free and take a play break.',
      then: 'No cues; let them move.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Dog loose and happy.'
    },
  ],
  setup: ['Quiet room', 'Treat pouch on', 'Room to step back'],
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
  trainerNote: 'One D at a time: duration, then distance, then distraction. Stacking them is why stays fail.',
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
      instruction: 'At home with the TV on, cue sit, down, and stay.',
      then: 'Pay each response; if it falls apart, lower the distraction.',
      durationSeconds: null,
      reps: 5,
      tip: 'Household activity is real distraction; do not skip straight to the park.',
      successLook: 'All three hold with normal household noise.'
    },
    {
      order: 2,
      instruction: 'In the driveway, cue sit and down.',
      then: 'Pay generously for any response within 3 seconds.',
      durationSeconds: null,
      reps: 5,
      tip: 'Outdoors feels like a new task; start easier than you think.',
      successLook: 'Sit and down outdoors within 3 seconds.'
    },
    {
      order: 3,
      instruction: 'Cue stay outdoors and wait 5 seconds.',
      then: 'Return and treat; release with "free."',
      durationSeconds: null,
      reps: 3,
      tip: 'Expect regression outdoors; reward generously for any success.',
      successLook: 'They hold 5 seconds in the driveway.'
    },
    {
      order: 4,
      instruction: 'Cue sit-stay; helper walks past at 10 feet.',
      then: 'Treat for holding; over the reps bring the helper to 5 feet.',
      durationSeconds: null,
      reps: 5,
      tip: 'A passing person is the most common real-world challenge.',
      successLook: 'They hold while a person passes at 5 feet.'
    },
    {
      order: 5,
      instruction: 'Cue sit-stay; helper jogs past at 5 feet.',
      then: 'Treat for holding; release with "free."',
      durationSeconds: null,
      reps: 3,
      tip: 'If they break, slow the helper down or add distance.',
      successLook: 'Sit holds through a jogger.'
    },
    {
      order: 6,
      instruction: 'Release with "free" and a sniff break.',
      then: 'Nothing more asked; let them decompress.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose body, nose down.'
    },
  ],
  setup: ['Treat pouch, high-value treats', 'Leash', 'Helper for the passing steps'],
  guide: 'Ask for sit before meals, down before going outside, stay before crossing a curb. Pay with real life: the meal, the door, the walk. Real-life rewards are always available and always meaningful, so they hold up long after the treat pouch goes away.',
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
  trainerNote: 'Proofed sit, down, and stay are the platform for everything else; the time here pays for life.',
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
      instruction: 'Trigger a bark, then say \'speak\'.',
      then: 'The moment they bark, mark and treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'You cannot teach quiet until you control when the bark starts.',
      successLook: 'They bark at the trigger and get paid.'
    },
    {
      order: 2,
      instruction: 'After 1 or 2 barks, hold a treat at their nose.',
      then: 'The moment barking stops, say \'quiet\' and give it.',
      durationSeconds: null,
      reps: 5,
      tip: 'Dogs cannot bark and sniff at once; the treat makes the quiet moment.',
      successLook: 'They pause, hear \'quiet\', and eat.'
    },
    {
      order: 3,
      instruction: 'Say \'quiet\', hold the treat, and wait 2 seconds.',
      then: 'Mark and treat after the silence; build to 5 seconds.',
      durationSeconds: null,
      reps: 8,
      tip: 'You want quiet as a sustained behavior, not a brief pause.',
      successLook: '5 seconds of silence after \'quiet\'.'
    },
    {
      order: 4,
      instruction: 'Say \'quiet\' with no food at their face.',
      then: 'If they hush, mark and reach for your pouch fast.',
      durationSeconds: null,
      reps: 5,
      tip: 'Use the nose treat only as a fallback; the word alone earns a jackpot.',
      successLook: 'They quiet on the word alone for 3 seconds.'
    },
    {
      order: 5,
      instruction: 'Let them sniff or chew for a minute.',
      then: 'No triggers; let arousal come all the way down.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'They are calm and quiet.'
    },
  ],
  setup: ['Bark trigger ready (doorbell, knock)', 'High-value treats in a pouch', 'Dog calm, not already worked up'],
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
  trainerNote: 'Shouting \'quiet\' sounds like you barking along. One calm cue plus food beats a hundred shouts.',
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
      instruction: 'Ring the bell, allow two barks, then say place.',
      then: 'Lead them to the mat and cue down.',
      durationSeconds: null,
      reps: 5,
      tip: 'Bell, brief bark, mat, quiet, reward. The mat replaces sustained barking.',
      successLook: 'On the mat within 15 seconds.'
    },
    {
      order: 2,
      instruction: 'Say quiet, then count 5 silent seconds.',
      then: 'Mark and treat on the mat.',
      durationSeconds: null,
      reps: null,
      tip: 'Each doorbell rep ends here before you ring again.',
      successLook: '5 quiet seconds on the mat.'
    },
    {
      order: 3,
      instruction: 'Ring the bell and say place before any bark.',
      then: 'Reward on the mat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Self-directing takes 30 to 50 rehearsals; schedule them.',
      successLook: 'Dog heads for the mat on the bell.'
    },
    {
      order: 4,
      instruction: 'Demand barking: give nothing, not even eye contact.',
      then: 'The instant it stops, mark and give what they wanted.',
      durationSeconds: null,
      reps: null,
      tip: 'It gets louder first. Hold on; answering louder barks teaches escalation.',
      successLook: 'Dog offers quiet before getting attention.'
    },
    {
      order: 5,
      instruction: 'Say free and take a sniff or play break.',
      then: 'Helper can say a calm hello now.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Dog relaxed, off the mat.'
    },
  ],
  setup: ['Mat down', 'Treat pouch on', 'Helper at the door', 'Window blocked or covered'],
  guide: 'Block the window when you are not watching: move furniture, add a baby gate, or frost the lower pane. Every unsupervised bark at the window is practice. Management is not cheating; it cuts daily rehearsal while you build the mat habit.',
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
  trainerNote: 'The goal is not silence; it is a dog who barks twice, hears your cue, and settles.',
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
      instruction: 'Present the mildest trigger where they notice but stay quiet.',
      then: 'Feed continuously while it is in view; stop when it goes.',
      durationSeconds: null,
      reps: null,
      tip: 'Closer only across sessions; a bark means you are over threshold.',
      successLook: 'They look at it, then look at you, no bark.'
    },
    {
      order: 2,
      instruction: 'Before the knock, settle them on the mat with a chew.',
      then: 'Guest enters and waits; if they bark, calmly return them.',
      durationSeconds: null,
      reps: 3,
      tip: 'The guest approaches only once they settle; calm earns the greeting.',
      successLook: 'Stays on mat through the entry, calm for 2 minutes.'
    },
    {
      order: 3,
      instruction: 'On a walk, the moment barking starts, say "quiet" once.',
      then: 'Treat at your hip every 2 seconds while walking away.',
      durationSeconds: null,
      reps: 5,
      tip: 'You are building trigger equals treats, not waiting for silence first.',
      successLook: 'They orient to you and eat while moving away.'
    },
    {
      order: 4,
      instruction: 'When they spot a trigger before barking, say their name cheerfully.',
      then: 'Jackpot the instant they look at you.',
      durationSeconds: null,
      reps: null,
      tip: 'Redirected before the bark starts is the long-term goal.',
      successLook: 'They spot it, turn to you, no bark.'
    },
    {
      order: 5,
      instruction: 'Walk away from triggers and let them sniff.',
      then: 'No cues; loose leash, quiet spot.',
      durationSeconds: 60,
      reps: null,
      tip: 'End every trigger session with decompression; sniffing lowers arousal.',
      successLook: 'Loose body, nose down, quiet.'
    },
  ],
  setup: ['Mat and chew toy', 'High-value treats, pouch', 'Helper for the guest drill'],
  guide: 'Rank your dog\'s top three triggers by intensity and always work the mildest first, at a distance where they notice but do not bark. Text guests before they arrive: "Please wait outside until I text you." Most people cooperate. Expect results in weeks, not days; the emotion underneath changes slowly.',
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
  trainerNote: 'Barking is emotion; the protocol changes the behavior and the treats change the feeling. Do both.',
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
      instruction: 'Pick up your keys and go sit on the couch.',
      then: 'Sit for 5 minutes, then put the keys back.',
      durationSeconds: 300,
      reps: null,
      tip: 'Keys 15 times a day and one departure breaks the prediction.',
      successLook: 'They watch, then relax within 30 seconds.'
    },
    {
      order: 2,
      instruction: 'Put your shoes on and stay home.',
      then: 'Wear them for an hour of normal life, then take them off.',
      durationSeconds: null,
      reps: null,
      tip: 'One cue at a time; shoes one week, coat another.',
      successLook: 'They stay settled or show only mild interest.'
    },
    {
      order: 3,
      instruction: 'Give the chew toy, then run the full routine without leaving.',
      then: 'Shoes, keys, coat, open the door, stand 10 seconds, undo it all.',
      durationSeconds: null,
      reps: 3,
      tip: 'The chew toy makes the whole sequence a non-event.',
      successLook: 'They lick the toy and stay calm throughout.'
    },
    {
      order: 4,
      instruction: 'Sit on the couch and hang out for a minute.',
      then: 'Nothing happens; the routine ends with you at home.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'They settle or keep chewing.'
    },
  ],
  setup: ['Keys, shoes, coat within reach', 'Chew toy ready', 'Your top 3 departure cues listed'],
  guide: 'List your departure routine in order: shoes, keys, coat. Each one predicts being alone, so desensitize them one at a time, never together. Keys: pick them up and sit down 5 times a day for 3 days. Shoes: put them on, work an hour at home, take them off, for 3 days. Then combine.',
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
  trainerNote: 'Separation anxiety is an anxiety disorder, not disobedience. Severe cases need a veterinary behaviorist too.',
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
      instruction: 'Give the chew, say your departure word, step outside.',
      then: 'Wait outside for today\'s time, then come back calmly.',
      durationSeconds: null,
      reps: 3,
      tip: 'Start at 30 seconds. No big hello; return before any stress shows.',
      successLook: 'Dog stays calm on the chew while you are gone.'
    },
    {
      order: 2,
      instruction: 'Watch the camera footage from all three absences.',
      then: 'Calm the whole time? Next session goes one rung longer.',
      durationSeconds: null,
      reps: null,
      tip: 'Silent at your return does not mean calm the whole time.',
      successLook: 'No pacing, howling, or drooling on camera.'
    },
    {
      order: 3,
      instruction: 'Sit nearby while they finish the chew.',
      then: 'Low-key company, no fuss.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Dog settled, chewing or resting.'
    },
  ],
  setup: ['Camera on, covering the resting spot', 'Stuffed chew toy ready', 'Timer ready'],
  guide: 'Build duration across separate sessions: 30 seconds, 1, 2, 3, 5, 8, then 10 minutes. Advance only when footage confirms calm at the previous rung. Any distress (howling, pacing, drooling, destruction) means the next session drops to half the last calm duration and rebuilds. If you must leave for work first, use a sitter or daycare.',
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
  trainerNote: 'Most plans fail because owners rush duration; the dog must be calm for the full time before you advance.',
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
      instruction: 'Run the ritual: exercise, chew toy ready, cue word, leave.',
      then: 'Same order every time; no drawn-out goodbye.',
      durationSeconds: null,
      reps: null,
      tip: 'Predictability is calming: I know this, it ends, I have done it.',
      successLook: 'They take the chew and do not follow you.'
    },
    {
      order: 2,
      instruction: 'Set out a fresh enrichment item before leaving.',
      then: 'Rotate items so each absence starts with something novel.',
      durationSeconds: null,
      reps: null,
      tip: 'Most dogs settle after 20 minutes; enrichment just covers that window.',
      successLook: 'They work on it 15+ minutes before lying down.'
    },
    {
      order: 3,
      instruction: 'Leave for today\'s step on your schedule.',
      then: 'Watch the camera; come back early if stress shows.',
      durationSeconds: null,
      reps: null,
      tip: 'Sixty minutes to three hours is six to eight small steps; plan for it.',
      successLook: 'Asleep or resting for most of the absence.'
    },
    {
      order: 4,
      instruction: 'On return, ignore them for 2 minutes.',
      then: 'Then greet calmly with low-energy affection.',
      durationSeconds: 120,
      reps: null,
      tip: 'A calm return keeps reunion from becoming an event they stress toward.',
      successLook: 'They wait calmly, no spinning or jumping.'
    },
    {
      order: 5,
      instruction: 'After the calm greeting, take a short sniff walk.',
      then: 'Let them decompress; nothing asked.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose body, normal sniffing.'
    },
  ],
  setup: ['Pet camera running', 'Enrichment item prepared', 'Timer'],
  guide: 'Extend absences from 10 minutes toward 30, 60, 90 and then 2 to 3 hours, each step confirmed on camera; past an hour add only 15 minutes at a time. Rotate enrichment (chew toy, snuffle mat, lick mat, frozen bone). Keep two practice absences a week once reliable, and return to Stage 1 after any big life change.',
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
  trainerNote: 'No real improvement by now? See a veterinary behaviorist; medication can make the behavior work possible.',
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
      instruction: 'Touch the doorknob.',
      then: 'When they back up or sit, mark and treat.',
      durationSeconds: null,
      reps: null,
      tip: 'If they surge, take your hand off and wait; stillness opens doors.',
      successLook: 'They back up or stand still at the knob.'
    },
    {
      order: 2,
      instruction: 'Open the door 1 inch.',
      then: 'Still means treat and open a little more; surge means close.',
      durationSeconds: null,
      reps: 10,
      tip: 'The closing door is information, not punishment; keep it mechanical.',
      successLook: 'They hold still while the door opens 6 inches.'
    },
    {
      order: 3,
      instruction: 'Say \'wait\' as you reach for the knob.',
      then: 'When they still, mark, treat, and open the door.',
      durationSeconds: null,
      reps: 8,
      tip: 'Wait means hold until released; use \'free\' every time.',
      successLook: 'They pause on \'wait\' and hold while it opens.'
    },
    {
      order: 4,
      instruction: 'Open the door fully and hold the wait 3 seconds.',
      then: 'Say \'free\' and let them through.',
      durationSeconds: null,
      reps: 5,
      tip: 'A dog who knows the release is coming waits confidently, not anxiously.',
      successLook: 'They hold at the open door, then go calmly.'
    },
    {
      order: 5,
      instruction: 'Say \'free\' and let them explore for a minute.',
      then: 'Let them wander through the door and sniff around.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'They move through calmly and relax.'
    },
  ],
  setup: ['An interior door', 'Treat pouch on', 'Leash off or hanging loose'],
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
  trainerNote: 'Door bolting is a safety emergency in waiting. Interior doors must be 10 for 10 before the front door.',
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
      instruction: 'Touch the knob, then open the door bit by bit.',
      then: 'Treat each hold, then 5 seconds fully open, then free.',
      durationSeconds: null,
      reps: 5,
      tip: 'Leash loose; it is a safety backup, not a restraint.',
      successLook: 'Dog holds at the open front door.'
    },
    {
      order: 2,
      instruction: 'Open the door while a helper walks across the driveway.',
      then: 'Treat every 2 seconds while the door is open.',
      durationSeconds: null,
      reps: 5,
      tip: 'The hardest step; the whole world is visible. Pay fast.',
      successLook: 'Dog holds with a person walking past.'
    },
    {
      order: 3,
      instruction: 'Have the helper ring the bell, then cue wait or place.',
      then: 'Open the door; the helper walks in, ignores them, sits.',
      durationSeconds: null,
      reps: 3,
      tip: 'Brief guests first; one who greets a jumping dog breaks it.',
      successLook: 'Dog holds while the guest sits down.'
    },
    {
      order: 4,
      instruction: 'Count 30 calm seconds, then say free.',
      then: 'Now they may go say hello.',
      durationSeconds: 30,
      reps: null,
      tip: null,
      successLook: 'Dog waits the full 30 seconds.'
    },
    {
      order: 5,
      instruction: 'Coming in from outside, cue wait at the door.',
      then: 'After 3 seconds, treat and release.',
      durationSeconds: null,
      reps: 4,
      tip: 'Waiting both ways generalizes the behavior in both directions.',
      successLook: 'Dog pauses at the door before entering.'
    },
    {
      order: 6,
      instruction: 'Back out for a minute of free sniffing.',
      then: 'Loose leash, no cues.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Dog relaxed, nose down.'
    },
  ],
  setup: ['Leash on, hanging loose', 'Treat pouch on', 'Helper outside', 'Mat by the door'],
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
  trainerNote: 'Everyone in the house and every regular visitor must know the rule; one bolt undoes weeks.',
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
      instruction: 'No leash. Cue "wait" and open the front door.',
      then: '5 seconds held? Mark, treat, release with "free."',
      durationSeconds: null,
      reps: 5,
      tip: 'If they bolt, calmly bring them back, close the door, reset. No reaction.',
      successLook: 'They hold at the open door, no leash, 5 seconds.'
    },
    {
      order: 2,
      instruction: 'Play hard for 5 minutes, then cue "wait" at the door.',
      then: 'Same rule: hold earns the release, bolting earns a reset.',
      durationSeconds: null,
      reps: 3,
      tip: 'Most door accidents happen when excited; train where it matters.',
      successLook: 'Wait holds even when they are fizzing.'
    },
    {
      order: 3,
      instruction: 'Say "free," let them out, then call them back in.',
      then: 'Jackpot a fast turn back through the door.',
      durationSeconds: null,
      reps: 4,
      tip: 'If they ever bolt, recall at the threshold is what saves them.',
      successLook: 'They step out, hear the cue, turn and re-enter.'
    },
    {
      order: 4,
      instruction: 'Repeat the wait at another entrance: gate, garage, car door.',
      then: 'Same rule; expect it to transfer within a couple of reps.',
      durationSeconds: null,
      reps: 3,
      tip: 'Generalization is fast once the foundation is solid.',
      successLook: 'Wait holds at gate, car, and garage.'
    },
    {
      order: 5,
      instruction: 'Release through the door and let them sniff outside.',
      then: 'Nothing asked; they earned it.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Relaxed sniffing outside.'
    },
  ],
  setup: ['High-value treats', 'Long line as optional backup', 'Front door, ready to open'],
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
  trainerNote: 'Reliable door manners could prevent a tragedy; fifteen sessions total is a bargain.',
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
      instruction: 'Hold treats on your open palm.',
      then: 'Close your fist as they move in; open when they back off.',
      durationSeconds: null,
      reps: null,
      tip: 'Silence. Let them work out what opens the fist: not pushing.',
      successLook: 'They back off and the fist opens.'
    },
    {
      order: 2,
      instruction: 'Open your palm, treats visible.',
      then: 'If they hold back and look at you, mark; they take one.',
      durationSeconds: null,
      reps: 10,
      tip: 'Close before nose contact; you must be faster than the dog.',
      successLook: 'They see the treats, glance at you, and wait.'
    },
    {
      order: 3,
      instruction: 'Sit down and place one treat on your knee.',
      then: 'When they back off and meet your eyes, mark; they take it.',
      durationSeconds: null,
      reps: 10,
      tip: 'The eye contact is the behavior: I don\'t grab, I check in.',
      successLook: 'They look at the treat, then at you.'
    },
    {
      order: 4,
      instruction: 'Hold the food bowl and lower it slowly.',
      then: 'Dive means lift it; a calm step back means down and \'free\'.',
      durationSeconds: null,
      reps: null,
      tip: 'Every meal is free practice; never skip it.',
      successLook: 'They wait for \'free\' before eating.'
    },
    {
      order: 5,
      instruction: 'Play or let them sniff for a minute.',
      then: 'No cues, no treats; just end on a good note.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'They are relaxed and happy.'
    },
  ],
  setup: ['Kibble in your hand', 'Food bowl for later', 'Quiet room, say nothing'],
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
  trainerNote: 'Impulse control is the meta-skill; every other course gets easier for a dog who has it.',
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
      instruction: 'Put a boring treat on the table edge and stand beside it.',
      then: 'Cover it if they move in; mark eye contact, pay from pouch.',
      durationSeconds: null,
      reps: 5,
      tip: 'The reward always comes from you; things on surfaces are not for dogs.',
      successLook: 'Dog backs off the table and looks at you.'
    },
    {
      order: 2,
      instruction: 'Wiggle an exciting toy.',
      then: 'They lunge: freeze the toy. They sit or pause: mark, play.',
      durationSeconds: null,
      reps: 5,
      tip: 'Calm launches exciting things. This rule transfers everywhere.',
      successLook: 'Dog pauses or sits; you start the game.'
    },
    {
      order: 3,
      instruction: 'Open the car door and wait.',
      then: 'Jump in uninvited: calmly ask them out. Wait: say free, jackpot.',
      durationSeconds: null,
      reps: 5,
      tip: 'A dog who bolts through a car door is in real danger.',
      successLook: 'Dog waits at the open door until released.'
    },
    {
      order: 4,
      instruction: 'Pick up the leash.',
      then: 'Spinning or jumping: put it down. Calm: clip it on.',
      durationSeconds: null,
      reps: null,
      tip: 'Practice this apart from real walks, never in a hurry.',
      successLook: 'Dog sits calmly while you clip the leash.'
    },
    {
      order: 5,
      instruction: 'Say free and go for a one-minute sniff walk.',
      then: 'They wait for the release before heading to the door.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Dog walks out on the release, not before.'
    },
  ],
  setup: ['Treat pouch on', 'A boring treat for the table', 'An exciting toy', 'Leash and car nearby'],
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
  trainerNote: 'The rule is universal: calm first, then the exciting thing. Done consistently it becomes their default.',
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
      instruction: 'When someone wants to pet them, cue sit first.',
      then: 'Sit earns the approach; a lunge means the person turns away.',
      durationSeconds: null,
      reps: 4,
      tip: 'Brief the greeter: "Could you wait until they sit?" Most people help.',
      successLook: 'They sit while the stranger approaches and pets.'
    },
    {
      order: 2,
      instruction: 'Another dog in view? Cue sit or focus.',
      then: 'Treat every 2 seconds while it passes; stop when it is gone.',
      durationSeconds: null,
      reps: 3,
      tip: 'Other dog visible means treats from my person; that is the association.',
      successLook: 'They glance at the dog, then orient to you.'
    },
    {
      order: 3,
      instruction: 'Something exciting appears? Cue sit and hold 5 seconds.',
      then: 'Say "free" and walk together toward the exciting thing.',
      durationSeconds: null,
      reps: 3,
      tip: 'Calm earns access, frantic earns delay; that is self-regulation.',
      successLook: 'Sit holds 5 seconds with the ball in view.'
    },
    {
      order: 4,
      instruction: 'Tug for 30 seconds, say "done" and go still.',
      then: 'Cue down; pay it when they settle, then play again.',
      durationSeconds: null,
      reps: 3,
      tip: 'Play to down in 10 seconds is real emotional self-regulation.',
      successLook: 'Play to down within 10 seconds of "done."'
    },
    {
      order: 5,
      instruction: 'Finish with free tug, no "done" this time.',
      then: 'Let them win the toy.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose, happy play.'
    },
  ],
  setup: ['Leash on, treat pouch', 'Tug toy', 'Willing greeter'],
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
  trainerNote: 'A dog with real-world impulse control is welcome everywhere; this pays every day for life.',
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
      instruction: 'Touch the shoulder and treat, then elbow, lower leg, paw.',
      then: 'A treat at every zone; pulling away means restart at the shoulder.',
      durationSeconds: null,
      reps: 5,
      tip: 'Work from least to most sensitive: body, legs, paws, toes.',
      successLook: 'They hold still from shoulder to paw.'
    },
    {
      order: 2,
      instruction: 'Cup one paw gently for 2 seconds.',
      then: 'Feed a treat every second during the hold; 5 holds per paw.',
      durationSeconds: null,
      reps: 20,
      tip: 'Treating during the hold, not after, says the hold itself is safe.',
      successLook: 'The paw rests in your hand while they eat.'
    },
    {
      order: 3,
      instruction: 'Touch the ear base, slide to the flap, lift 3 seconds.',
      then: 'Treat continuously; if they pull away or shake, go lighter.',
      durationSeconds: null,
      reps: 5,
      tip: 'Stop at stress signs like whale eye or shaking; reduce and rebuild.',
      successLook: 'Ear flap lifted and held without pulling.'
    },
    {
      order: 4,
      instruction: 'Touch the muzzle, lift the lip, then open the mouth briefly.',
      then: 'Treat at each step; press gently on the lower jaw to open.',
      durationSeconds: null,
      reps: 5,
      tip: 'Mouth comfort means dental care and oral meds later; a life-extending skill.',
      successLook: 'Lips lifted and mouth opened without pulling away.'
    },
    {
      order: 5,
      instruction: 'Stop handling and let them shake it off.',
      then: 'A minute of sniffing or gentle play ends the session.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'They relax and stay near you.'
    },
  ],
  setup: ['Tiniest treats possible', 'Quiet room', 'Dog relaxed, not tired or hungry'],
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
  trainerNote: 'A dog that accepts handling is safer everywhere. Run a five-minute refresher every month for life.',
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
      instruction: 'Show the clippers.',
      then: 'Any calm look or sniff earns a treat.',
      durationSeconds: null,
      reps: null,
      tip: 'Scared? Put them on the floor at a distance and treat for looking.',
      successLook: 'Dog sniffs the clippers looking for a treat.'
    },
    {
      order: 2,
      instruction: 'Touch the closed clippers to a paw, then each toe.',
      then: 'Treat after every touch.',
      durationSeconds: null,
      reps: 5,
      tip: null,
      successLook: 'Paw stays still for the touch.'
    },
    {
      order: 3,
      instruction: 'Hold a paw and place the clipper opening around one nail.',
      then: 'Do not cut. Treat richly, then let go.',
      durationSeconds: null,
      reps: null,
      tip: 'Each stage may take several sessions; the whole thing takes weeks.',
      successLook: 'Dog holds still with the clipper around a nail.'
    },
    {
      order: 4,
      instruction: 'Clip the tip of one nail.',
      then: 'Jackpot 5 treats immediately, then stop for the day.',
      durationSeconds: null,
      reps: null,
      tip: 'Stay well clear of the quick. Next session, 2 nails.',
      successLook: 'Dog holds still through the snip.'
    },
    {
      order: 5,
      instruction: 'Play or sniff break.',
      then: 'Clippers away; nothing more today.',
      durationSeconds: 60,
      reps: null,
      tip: 'One nail and done is the strategy, not weakness.',
      successLook: 'Dog relaxed and happy.'
    },
  ],
  setup: ['Sharp nail clippers', 'Best treats you have', 'Styptic powder within reach', 'Quiet spot, dog relaxed'],
  guide: 'Pace this across sessions: three sessions of just seeing the clippers, then touch, then placement, then one nail, then two. Two to four weeks is normal. Once a full trim is easy, keep the high-value treats flowing at every trim for life; a calm dog stays calm because the trim keeps paying. Trim monthly.',
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
  trainerNote: 'Nail fear is a top reason dogs get sedated at the vet; four weeks here saves years.',
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
      instruction: 'Lift them onto the table and feed continuously.',
      then: 'After 30 seconds, lift them off; that is one rep.',
      durationSeconds: null,
      reps: 5,
      tip: 'The vet table is cold and strange; rehearse on a folding table first.',
      successLook: 'They stand on the surface eating, not jumping off.'
    },
    {
      order: 2,
      instruction: 'Run firm hands over the whole body, nose to tail.',
      then: 'Check ears, mouth, and squeeze each toe; treat throughout.',
      durationSeconds: null,
      reps: 3,
      tip: 'A weekly home exam also catches lumps and pain early.',
      successLook: 'Calm standing or lying through a 3-minute exam.'
    },
    {
      order: 3,
      instruction: 'Hold them firmly in a stand while treating.',
      then: 'Release after 30 seconds; if they struggle, ease off and shorten.',
      durationSeconds: null,
      reps: 3,
      tip: 'Vet techs hold exactly like this; a dog with no practice may panic.',
      successLook: 'Firm hold accepted with minimal resistance.'
    },
    {
      order: 4,
      instruction: 'Release with play or a sniff break.',
      then: 'Handling ends, fun begins; that is the lesson.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Relaxed, shaking off, ready to play.'
    },
  ],
  setup: ['Raised surface or folding table', 'High-value treats', 'Happy visit booked with clinic'],
  guide: 'Once a month, book a happy visit: walk into the clinic, let staff feed treats, sit in the waiting room for five minutes, and leave. No exam, no shots. Call ahead; most clinics welcome it. Do the home exam weekly too; it doubles as early health detection.',
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
  trainerNote: 'A calm dog gets a better exam and earlier catches; cooperative care is health care.',
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
      instruction: 'While walking, say \'wait\' and stop.',
      then: 'The moment they pause in any position, mark and keep walking.',
      durationSeconds: null,
      reps: 8,
      tip: 'Wait is a pause, not a sit; mark any stop in movement.',
      successLook: 'They pause on \'wait\', whatever their position.'
    },
    {
      order: 2,
      instruction: 'Ask for a sit, then say \'stay\' with palm out.',
      then: 'Count 5 seconds, return, treat in position, say \'free\'.',
      durationSeconds: null,
      reps: 7,
      tip: 'Stay means one position held until released; that is what makes it different.',
      successLook: 'They hold the sit 5 seconds until \'free\'.'
    },
    {
      order: 3,
      instruction: 'Ask for a sit and say \'stay\' for 10 seconds.',
      then: 'Return, treat in position, say \'free\'.',
      durationSeconds: null,
      reps: 5,
      tip: 'If they break, go back to 5 seconds; never scold.',
      successLook: 'They hold 10 seconds until released.'
    },
    {
      order: 4,
      instruction: 'Alternate: walk, \'wait\', walk on, then sit, \'stay\', \'free\'.',
      then: 'Mark the wait pause; treat the 10-second stay, then release.',
      durationSeconds: null,
      reps: 5,
      tip: 'Alternating forces them to listen to the actual word.',
      successLook: 'A brief pause for wait, a held sit for stay.'
    },
    {
      order: 5,
      instruction: 'Let them sniff freely for a minute.',
      then: 'Say \'free\' and follow them; no cues, no treats.',
      durationSeconds: 60,
      reps: null,
      tip: 'The sniff break is the reward; it makes the structured work easier to take.',
      successLook: 'They wander and sniff, relaxed.'
    },
  ],
  setup: ['Low-distraction room', 'Treat pouch on', 'Space to walk a few steps'],
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
  trainerNote: 'Wait at the curb, stay on the mat with guests: different problems, so build both.',
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
      instruction: 'Cue stay, then step to one side.',
      then: 'Return and treat. Alternate left and right.',
      durationSeconds: null,
      reps: 5,
      tip: 'Start from a 15-second stay they already hold.',
      successLook: 'Stay holds as you step sideways.'
    },
    {
      order: 2,
      instruction: 'Cue stay, then step behind the dog.',
      then: 'Return to the front and treat.',
      durationSeconds: null,
      reps: 3,
      tip: 'Behind them is the hardest direction; build to it gradually.',
      successLook: 'Stay holds while you are out of sight.'
    },
    {
      order: 3,
      instruction: 'Step back one step, then return and treat.',
      then: 'Add steps each rep: 2, then 5 feet, then 10 feet.',
      durationSeconds: null,
      reps: 7,
      tip: 'Three clean reps at each distance. Mix distances so they cannot predict.',
      successLook: 'Stay holds at 10 feet for 5 seconds.'
    },
    {
      order: 4,
      instruction: 'Walk to 8 feet, then move sideways and back.',
      then: 'Step away again, return, then treat.',
      durationSeconds: null,
      reps: null,
      tip: 'A stay that only works when you stand frozen is not trained.',
      successLook: 'Stay holds through unpredictable movement.'
    },
    {
      order: 5,
      instruction: 'Say free and take a play break.',
      then: 'Walk back, pause, then release. No running.',
      durationSeconds: 60,
      reps: null,
      tip: 'Running back excites them and breaks the stay.',
      successLook: 'Dog waits for the word, then plays.'
    },
  ],
  setup: ['Treat pouch on', 'Room with space to move'],
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
  trainerNote: 'A stay that holds while you move is a stay that holds in real life.',
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
      instruction: 'Cue sit-stay 3 feet from the bowl on the floor.',
      then: 'Hold 5 seconds, say "free" and let them eat.',
      durationSeconds: null,
      reps: null,
      tip: 'If they break toward the bowl, pick it up and reset. Free daily practice.',
      successLook: 'They hold until "free."'
    },
    {
      order: 2,
      instruction: 'Cue stay on the mat; helper opens the door and enters.',
      then: 'Guest walks into the room; treat for holding, then release.',
      durationSeconds: null,
      reps: 4,
      tip: 'A dog on the mat during arrivals is the easiest dog to live with.',
      successLook: 'Stay holds until the guest reaches the couch.'
    },
    {
      order: 3,
      instruction: 'At the curb, cue "wait" and check traffic.',
      then: 'Say "free" and cross together.',
      durationSeconds: null,
      reps: null,
      tip: 'Done every walk, curbs become automatic in 2 to 3 weeks.',
      successLook: 'They pause at the edge and look up.'
    },
    {
      order: 4,
      instruction: 'Outdoors, cue down-stay; helper walks past at 5 feet.',
      then: 'Treat for holding 30 seconds; release with "free."',
      durationSeconds: null,
      reps: 3,
      tip: 'One new element at a time; 3 clean reps before raising it.',
      successLook: 'Down-stay holds 30 seconds with a person at 5 feet.'
    },
    {
      order: 5,
      instruction: 'Same down-stay; helper passes with a squeaky toy.',
      then: 'Treat for holding; release with "free."',
      durationSeconds: null,
      reps: 3,
      tip: 'If they break, the toy was too loud or too close.',
      successLook: 'Stay holds through the squeak.'
    },
    {
      order: 6,
      instruction: 'Same down-stay; helper passes with a dog on leash.',
      then: 'Treat for holding; release with "free."',
      durationSeconds: null,
      reps: 3,
      tip: 'This is the hardest one; add distance if needed.',
      successLook: 'Stay holds as the other dog passes.'
    },
    {
      order: 7,
      instruction: 'Release with "free" and a sniff break.',
      then: 'Nothing more asked; let them decompress.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose body, nose down.'
    },
  ],
  setup: ['Portable mat', 'Treat pouch', 'Helper', 'Leash'],
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
  trainerNote: 'A proofed stay is safety-critical; build it to a reflex, then maintain it forever.',
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
      instruction: 'Walk toward the helper dog until yours notices it.',
      then: 'Stop there; that distance is threshold, your starting point.',
      durationSeconds: null,
      reps: null,
      tip: 'Threshold: they see the trigger but can still eat and respond to you.',
      successLook: 'They notice, take a treat, stay with you.'
    },
    {
      order: 2,
      instruction: 'Stand 5 feet beyond threshold.',
      then: 'When the other dog appears, feed every 2 seconds until it leaves.',
      durationSeconds: null,
      reps: 5,
      tip: 'Open bar when the trigger is visible, closed when it is gone.',
      successLook: 'They eat treats while the other dog is visible.'
    },
    {
      order: 3,
      instruction: 'If they react, say nothing; turn and walk away.',
      then: 'Stop when they can take a treat again.',
      durationSeconds: null,
      reps: null,
      tip: 'A reacting dog is over threshold, not naughty; add 10 feet next time.',
      successLook: 'They recover within 30 seconds and eat.'
    },
    {
      order: 4,
      instruction: 'Stay at threshold and watch for a look back to you.',
      then: 'The instant they glance from the dog to you, mark and treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'The spontaneous head turn is the breakthrough; counter-conditioning is working.',
      successLook: 'They see the dog, then turn to you.'
    },
    {
      order: 5,
      instruction: 'Walk away from the helper and let them sniff.',
      then: 'A minute of decompression sniffing ends the session.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose body, nose down.'
    },
  ],
  setup: ['Calm helper dog 100 feet away', 'Front-clip harness, 6-foot leash', 'Chicken or hot dog, lots'],
  guide: 'Repeat this session 2 to 3 times at the same distance before moving closer. Use the best food you have; the competition is a real dog. Never correct a reaction; distance is always the answer.',
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
  trainerNote: 'Corrections make reactivity worse. Under threshold, good food, more distance: that is the whole method.',
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
      instruction: 'Run 5 reps at your current threshold distance.',
      then: 'Mark each calm look at the other dog and treat.',
      durationSeconds: null,
      reps: 5,
      tip: null,
      successLook: 'Dog stays calm and orients to you.'
    },
    {
      order: 2,
      instruction: 'Move 5 feet closer.',
      then: 'Calm and orienting: this is the new threshold. Reactive: back up 10.',
      durationSeconds: null,
      reps: null,
      tip: '5 feet at a time only. Slow shrinking lasts; fast shrinking regresses.',
      successLook: 'Same calm at the closer distance.'
    },
    {
      order: 3,
      instruction: 'When the other dog appears, say look, happily.',
      then: 'They look at it and back at you: mark, jackpot.',
      durationSeconds: null,
      reps: 5,
      tip: 'Look at That gives them a job: notice it, then check in.',
      successLook: 'Dog looks at the dog, then at you.'
    },
    {
      order: 4,
      instruction: 'Walk parallel to the other dog, 20 feet apart.',
      then: 'Treat continuously for 3 minutes.',
      durationSeconds: 180,
      reps: null,
      tip: 'Dogs are calmer walking alongside than facing. Close the gap over 3 sessions.',
      successLook: '3 minutes beside another dog, no reaction.'
    },
    {
      order: 5,
      instruction: 'In a new place, start farther away and rebuild.',
      then: 'Two or three warm-up reps, then work as usual.',
      durationSeconds: null,
      reps: null,
      tip: 'A new spot resets the threshold; that is normal, not failure.',
      successLook: 'Calm orientation after a few warm-up reps.'
    },
    {
      order: 6,
      instruction: 'Walk away from the other dog for a sniff break.',
      then: 'Let them decompress; no more triggers today.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose body, nose down.'
    },
  ],
  setup: ['Helper with a calm dog', 'Front-clip harness on', 'Treat pouch full', 'Start at your known threshold'],
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
  trainerNote: 'Progress is measured in months; compare your dog to their own baseline, never to other dogs.',
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
      instruction: 'Pass the stooge dog at 10 feet, treating as you go.',
      then: 'Both handlers feed through the pass; keep walking.',
      durationSeconds: null,
      reps: 4,
      tip: 'Close the gap to 6 feet over sessions, never within one.',
      successLook: 'Loose leash, no reaction, eating through the pass.'
    },
    {
      order: 2,
      instruction: 'Walk parallel to the stooge dog at 10 feet.',
      then: 'Both dogs moving, both handlers treating steadily.',
      durationSeconds: 60,
      reps: null,
      tip: 'Passing at 6 feet is the real goal; greetings are optional.',
      successLook: 'They walk, eat, and glance calmly at the other dog.'
    },
    {
      order: 3,
      instruction: 'If greeting fits your dog, approach on an arc, never head-on.',
      then: 'Allow a 3-second sniff, say "let\'s go" and walk off treating.',
      durationSeconds: null,
      reps: 3,
      tip: 'Head-on is confrontational in dog language; always curve in from the side.',
      successLook: 'Brief sniff, then walks away without lunging.'
    },
    {
      order: 4,
      instruction: 'Count the sniff: 1, 2, 3, then "let\'s go."',
      then: 'Leave sooner if leashes tangle or either dog stiffens.',
      durationSeconds: null,
      reps: 3,
      tip: 'Say hi, then go; leave before anyone gets uncomfortable.',
      successLook: 'Both dogs move on with loose leashes.'
    },
    {
      order: 5,
      instruction: 'Pass the stooge dog at 6 feet with no greeting.',
      then: 'Treat through the pass and keep walking.',
      durationSeconds: null,
      reps: 3,
      tip: 'Dogs who expect to greet every dog get frustrated when denied.',
      successLook: 'No reaction and no attempt to greet.'
    },
    {
      order: 6,
      instruction: 'Walk away from the stooge dog and let them sniff.',
      then: 'No cues; loose leash, quiet spot.',
      durationSeconds: 60,
      reps: null,
      tip: 'Decompress after every dog session; sniffing lowers arousal.',
      successLook: 'Loose body, nose down.'
    },
  ],
  setup: ['Calm stooge dog and handler', 'Front-clip harness, 6-foot leash', 'High-value treats in pouch'],
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
  trainerNote: 'A reactive dog who passes calmly, with a handler who reads threshold, lives a full life. That is the goal.',
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
      instruction: 'Hold a treat at their nose and lift it back.',
      then: 'The instant their rear touches the floor, mark and treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Keep the lure at nose height; too high and they jump.',
      successLook: 'A clean sit, no jumping or backing up.'
    },
    {
      order: 2,
      instruction: 'Same hand motion, no treat in that hand.',
      then: 'When they sit, mark and treat from your pouch.',
      durationSeconds: null,
      reps: 10,
      tip: 'A dog that sits only for visible food has learned to follow food.',
      successLook: 'They sit for the empty hand signal.'
    },
    {
      order: 3,
      instruction: 'Say \'sit\' once, then give the hand signal.',
      then: 'After 5 pairs, try the word alone; jackpot if they sit.',
      durationSeconds: null,
      reps: 5,
      tip: 'Say it once and wait; repeating teaches the first cue is optional.',
      successLook: 'They sit on the word, hands at your sides.'
    },
    {
      order: 4,
      instruction: 'Let them sniff freely for a minute.',
      then: 'Say \'free\' and follow them; no cues, no treats.',
      durationSeconds: 60,
      reps: null,
      tip: 'The sniff break is the reward; it makes the structured work easier to take.',
      successLook: 'They wander and sniff, relaxed.'
    },
  ],
  setup: ['Low-distraction room', 'Tiny treats in a pouch'],
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
  trainerNote: 'A sit that sometimes works is not trained. Hold the 15 of 20 standard before moving on.',
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
      instruction: 'Cue sit, then say stay with your palm out.',
      then: 'Count 3 seconds, mark while they still sit, then treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Mark while seated; the mark says exactly what earned the treat.',
      successLook: 'Sit holds 3 seconds, no shuffling.'
    },
    {
      order: 2,
      instruction: 'Vary the count: 3, 6, 4, 10, 15, 20 seconds.',
      then: 'Mark, treat, then release with free every rep.',
      durationSeconds: null,
      reps: 8,
      tip: 'Mix short and long; a dog expecting release at 10 breaks at 11.',
      successLook: 'Sit-stay holds 20 seconds with you in front.'
    },
    {
      order: 3,
      instruction: 'Take one step back, then return.',
      then: 'Treat in position. Add a step each rep, to 6 feet.',
      durationSeconds: null,
      reps: 5,
      tip: 'Always return to reward; calling them teaches leaving the sit.',
      successLook: 'Sit-stay holds while you go 6 feet and back.'
    },
    {
      order: 4,
      instruction: 'Say free and take a play break.',
      then: 'No cues; let them move.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Dog loose and happy.'
    },
  ],
  setup: ['Quiet room', 'Treat pouch on', 'Space to step back'],
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
  trainerNote: 'Duration first, distance second, distraction third. Never all three at once.',
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
      instruction: 'In the driveway, say "sit" once, hands at your sides.',
      then: 'Sit within 3 seconds? Mark and treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'A new place resets difficulty to beginner; start easy.',
      successLook: 'Sit on verbal cue outdoors within 3 seconds.'
    },
    {
      order: 2,
      instruction: 'Cue sit-stay; helper walks past at 10 feet.',
      then: 'Treat for holding; over the reps bring the helper to 5 feet.',
      durationSeconds: null,
      reps: 5,
      tip: 'Lowest intensity first: calm person far away, then closer.',
      successLook: 'They hold while a person passes at 5 feet.'
    },
    {
      order: 3,
      instruction: 'Cue sit-stay; helper jogs past at 5 feet.',
      then: 'Treat for holding; release with "free."',
      durationSeconds: null,
      reps: 3,
      tip: 'If they break, slow the helper down or add distance.',
      successLook: 'Sit holds through a jogger.'
    },
    {
      order: 4,
      instruction: 'Cue sit-stay; helper passes with a squeaky toy.',
      then: 'Treat for holding; release with "free."',
      durationSeconds: null,
      reps: 3,
      tip: 'If they break, the toy was too loud or too close.',
      successLook: 'Sit holds through the squeak.'
    },
    {
      order: 5,
      instruction: 'Release with "free" and a sniff break.',
      then: 'Nothing more asked; let them decompress.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose body, nose down.'
    },
  ],
  setup: ['Driveway', 'High-value treats, pouch', 'Helper for the passing steps'],
  guide: 'Ask for sit in five daily routines: before the leash goes on, before the bowl goes down, before greeting a visitor, before crossing a curb, before getting in or out of the car. Pay with the real reward. For three days, note every sit cue; aim for 90 percent first-cue response within 2 seconds.',
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
  trainerNote: 'Sit before every exciting thing, every curb, every greeting; two weeks of that changes the dog.',
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
      instruction: 'From a sit, lure to the floor, then slide it away.',
      then: 'The instant elbows touch, mark and treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Slow is critical; move the lure too fast and they stand up.',
      successLook: 'Elbows down, hips follow into a full down.'
    },
    {
      order: 2,
      instruction: 'Same floor motion, no treat in that hand.',
      then: 'When elbows land, mark and give 3 treats from your pouch.',
      durationSeconds: null,
      reps: 10,
      tip: 'Pay down with 2 or 3 treats; it is a vulnerable position.',
      successLook: 'They lie down for the empty hand signal.'
    },
    {
      order: 3,
      instruction: 'Say \'down\' once, then give the hand signal.',
      then: 'After 5 pairs, try the word alone; jackpot if they down.',
      durationSeconds: null,
      reps: 5,
      tip: 'Down must mean one thing; use a different word for \'off the couch\'.',
      successLook: 'They lie down on the word, hands at sides.'
    },
    {
      order: 4,
      instruction: 'Let them sniff freely for a minute.',
      then: 'Say \'free\' and follow them; no cues, no treats.',
      durationSeconds: 60,
      reps: null,
      tip: 'The sniff break is the reward; it makes the structured work easier to take.',
      successLook: 'They wander and sniff, relaxed.'
    },
  ],
  setup: ['Non-slip surface or rug', 'Tiny treats in a pouch', 'Quiet room'],
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
  trainerNote: 'Down is harder than sit because it is vulnerable. Go slower and pay any downward movement.',
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
      instruction: 'Cue down, then say stay.',
      then: 'Walk a treat to them every 10 seconds, then release with free.',
      durationSeconds: null,
      reps: 5,
      tip: 'Build from 10 to 30 seconds over the reps. Never call them to you.',
      successLook: 'Down-stay holds 30 seconds, treats in position.'
    },
    {
      order: 2,
      instruction: 'Deliver the treat slightly to one side of their body.',
      then: 'They turn their head; jackpot any hip roll.',
      durationSeconds: null,
      reps: 5,
      tip: 'A hip-rolled down is sustainable; a tense sphinx is not settled.',
      successLook: 'Hips rolled to one side, fully relaxed.'
    },
    {
      order: 3,
      instruction: 'Hold the down-stay for 45 seconds.',
      then: 'Treat at random gaps, 8 to 20 seconds, then free.',
      durationSeconds: 45,
      reps: null,
      tip: 'Random gaps keep them waiting; they cannot predict the next treat.',
      successLook: 'Relaxed down-stay for 45 seconds.'
    },
    {
      order: 4,
      instruction: 'Say free and take a sniff or play break.',
      then: 'Off the mat, no rules.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Dog gets up only on the release.'
    },
  ],
  setup: ['Mat or soft surface', 'Treat pouch on', 'Timer ready'],
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
  trainerNote: 'A dog who holds a relaxed down on cue can go anywhere: a café, a waiting room, a dinner.',
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
      instruction: 'From 3 feet, say "down" once.',
      then: 'Walk back to them to treat; add distance each rep, to 8.',
      durationSeconds: null,
      reps: 5,
      tip: 'Down from 8 feet on voice means they understand the word, not your hand.',
      successLook: 'They lie down with you 8 feet away.'
    },
    {
      order: 2,
      instruction: 'In a new place, do 2 easy warm-up downs.',
      then: 'Treat each; then cue down for real.',
      durationSeconds: null,
      reps: 3,
      tip: 'Two easy reps in a new place prime the behavior; never skip them.',
      successLook: 'Down on verbal cue in a place outside home.'
    },
    {
      order: 3,
      instruction: 'In that new place, cue down and wait 30 seconds.',
      then: 'Treat at the end; release with "free."',
      durationSeconds: 30,
      reps: null,
      tip: 'Backyard, porch, cafe: three new places before moving on.',
      successLook: '30-second down-stay away from home.'
    },
    {
      order: 4,
      instruction: 'Cue down-stay; helper walks past at 10 feet.',
      then: 'Treat for holding 20 seconds; bring them to 5 feet over reps.',
      durationSeconds: null,
      reps: 5,
      tip: 'Lowest intensity first; 3 clean reps before raising it.',
      successLook: '20-second down-stay while a person passes at 5 feet.'
    },
    {
      order: 5,
      instruction: 'Cue down-stay; helper jogs past at 5 feet.',
      then: 'Treat for holding; release with "free."',
      durationSeconds: null,
      reps: 3,
      tip: 'If they break, slow the helper down or add distance.',
      successLook: 'Down holds through a jogger.'
    },
    {
      order: 6,
      instruction: 'Cue down-stay; helper passes with another dog.',
      then: 'Treat for holding; release with "free."',
      durationSeconds: null,
      reps: 3,
      tip: 'This is the hardest one; add distance if needed.',
      successLook: 'Down holds as the other dog passes.'
    },
    {
      order: 7,
      instruction: 'Release with "free" and a sniff break.',
      then: 'Nothing more asked; let them decompress.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose body, nose down.'
    },
  ],
  setup: ['Treat pouch, high-value treats', 'Helper for the passing steps', 'Mat, optional'],
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
  trainerNote: 'A proofed down is your reset button; anywhere they need to settle now, down-stay does it.',
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
      instruction: 'Stand still, treat at your left hip, fingers down.',
      then: 'When their shoulder is by your leg, mark and treat there.',
      durationSeconds: null,
      reps: 8,
      tip: 'Treat at the left hip every time; the reward zone lives there.',
      successLook: 'They stand at your left, head near your hip.'
    },
    {
      order: 2,
      instruction: 'Take 2 steps forward and stop.',
      then: 'If they land at your left hip, mark and treat there.',
      durationSeconds: null,
      reps: 8,
      tip: 'If they overshoot, take another step to line up beside them.',
      successLook: 'They finish at your left hip after 2 steps.'
    },
    {
      order: 3,
      instruction: 'Say \'heel\' as they move into position.',
      then: 'Mark and treat at the hip.',
      durationSeconds: null,
      reps: 5,
      tip: 'Heel means left side, shoulder at your hip, facing forward; keep it precise.',
      successLook: 'They hear the word as they arrive at your hip.'
    },
    {
      order: 4,
      instruction: 'Stand still and say \'heel\' once.',
      then: 'Wait; when they move to your left hip, mark and treat.',
      durationSeconds: null,
      reps: 5,
      tip: null,
      successLook: 'They find heel position without a lure.'
    },
    {
      order: 5,
      instruction: 'Let them sniff freely for a minute.',
      then: 'Say \'free\' and follow them; no cues, no treats.',
      durationSeconds: 60,
      reps: null,
      tip: 'The sniff break is the reward; it makes the structured work easier to take.',
      successLook: 'They wander and sniff, relaxed.'
    },
  ],
  setup: ['Treat pouch on your left hip', 'Flat collar or front-clip harness', '6-foot leash, loose'],
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
  trainerNote: 'Heel is precision: left side, shoulder at your hip. Loose leash walking is a different behavior; never mix them.',
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
      instruction: 'From heel, walk 3 steps and stop.',
      then: 'Still in position: mark and treat at your hip.',
      durationSeconds: null,
      reps: 6,
      tip: 'Add steps each rep, 3 to 10. Drift means stop, reset, restart.',
      successLook: 'Shoulder at your hip through 10 steps.'
    },
    {
      order: 2,
      instruction: 'Walk 5 steps, then speed up.',
      then: 'Mark when they match you; then slow to a crawl and mark.',
      durationSeconds: null,
      reps: 5,
      tip: 'An unpredictable handler is an interesting handler.',
      successLook: 'Dog matches every pace change at once.'
    },
    {
      order: 3,
      instruction: 'Make a right turn, then a U-turn.',
      then: 'Mark each turn finished with them still at your hip.',
      durationSeconds: null,
      reps: 3,
      tip: 'U-turns are your strongest engagement tool.',
      successLook: 'Dog stays at your hip through both turns.'
    },
    {
      order: 4,
      instruction: 'Make a small, deliberate left turn.',
      then: 'Mark generously when they shift their rear to make room.',
      durationSeconds: null,
      reps: 3,
      tip: 'Hardest turn; you turn into the dog. Do not step on them.',
      successLook: 'Dog adjusts and stays in position on a left turn.'
    },
    {
      order: 5,
      instruction: 'Say free and let them sniff on a loose leash.',
      then: 'No heel, no cues.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Dog relaxed, nose down.'
    },
  ],
  setup: ['Treat pouch on your left hip', 'Flat collar or front-clip harness', 'Quiet space'],
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
  trainerNote: 'Heeling is a conversation: they watch you for changes, you pay them for tracking you.',
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
      instruction: 'Heel indoors; start at 10 steps, add 5 each session.',
      then: 'Treat at random intervals, sometimes 10 steps, sometimes 25.',
      durationSeconds: null,
      reps: 5,
      tip: 'Variable payment keeps them heeling; they never know when the next comes.',
      successLook: 'Position held the whole stretch, no breaking.'
    },
    {
      order: 2,
      instruction: 'Driveway, then quiet sidewalk: heel in 5-step segments.',
      then: 'Treat each segment; your biggest praise when they check in.',
      durationSeconds: null,
      reps: 5,
      tip: 'Expect regression outdoors; use better treats than indoors.',
      successLook: '20 steps of heel on a quiet street.'
    },
    {
      order: 3,
      instruction: 'Heel while a helper walks the same way across the street.',
      then: 'Treat every few steps for holding position.',
      durationSeconds: null,
      reps: 3,
      tip: 'A person alongside is the most common real-world heel challenge.',
      successLook: '20 steps of heel with a person across the street.'
    },
    {
      order: 4,
      instruction: 'Same walk; helper now 10 feet away, same direction.',
      then: 'Treat every few steps for holding position.',
      durationSeconds: null,
      reps: 3,
      tip: 'Closer is harder; if position breaks, widen the gap.',
      successLook: '20 steps of heel with a person 10 feet away.'
    },
    {
      order: 5,
      instruction: 'Same walk; helper now has a dog with them.',
      then: 'Treat every few steps for holding position.',
      durationSeconds: null,
      reps: 3,
      tip: 'Add distance if they fixate on the other dog.',
      successLook: 'Heel holds with another dog 10 feet away.'
    },
    {
      order: 6,
      instruction: 'Same walk; helper moves erratically, stops, jogs, turns.',
      then: 'Treat every few steps for holding position.',
      durationSeconds: null,
      reps: 3,
      tip: 'Erratic movement mimics a crowded sidewalk.',
      successLook: 'Heel holds through an unpredictable passerby.'
    },
    {
      order: 7,
      instruction: 'From a sit at heel, say "heel" and step off left foot.',
      then: 'Mark when they move with you; treat after 3 steps.',
      durationSeconds: null,
      reps: 3,
      tip: 'Left foot means move with me; right foot means stay.',
      successLook: 'They step off the instant your left foot moves.'
    },
    {
      order: 8,
      instruction: 'Release with "free" and a sniff break.',
      then: 'Nothing more asked; let them decompress.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose body, nose down.'
    },
  ],
  setup: ['Pouch on left hip, best treats', 'Collar or front-clip harness', '6-foot leash', 'Open outdoor space'],
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
  trainerNote: 'Reliable outdoor heel gets you through crowds and tight spaces without restraint; worth every rep.',
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
