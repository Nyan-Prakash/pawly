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
  title: 'Check in at your side',
  objective: 'Your dog looks up at you when you say their name, standing at your side.',
  durationMinutes: 8,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Say their name once.',
      then: 'The instant they look at you, mark and treat at your hip.',
      durationSeconds: null,
      reps: 10,
      tip: 'Say it once, then wait up to 10 seconds. Repeating it teaches them to tune out.',
      successLook: 'They turn toward you within 3 seconds.'
    },
    {
      order: 2,
      instruction: 'Say their name, then wait for eye contact.',
      then: 'When they look at your face, mark and treat at your hip.',
      durationSeconds: null,
      reps: 10,
      tip: 'Treat at your hip, not in front. Beside your leg is where you want them.',
      successLook: 'They look up at your face, not only toward you.'
    },
    {
      order: 3,
      instruction: 'Take 3 steps, stop, and say their name once.',
      then: 'When they make eye contact, mark and treat at your hip.',
      durationSeconds: null,
      reps: 5,
      tip: 'If the leash tightens, stop and wait. You want them to choose to check in.',
      successLook: 'They check in within 5 seconds of you stopping.'
    },
    {
      order: 4,
      instruction: 'Let them sniff freely for a minute.',
      then: 'Say "free" and follow them. No cues, no treats.',
      durationSeconds: 60,
      reps: null,
      tip: 'The sniff break is the reward. It makes the focused part easier to take.',
      successLook: 'They wander and sniff, relaxed.'
    },
  ],
  setup: [
    'Quiet room',
    'Leash on, hanging loose',
    '20 tiny treats in hand',
  ],
  successCriteria: 'Move on when they look up at your face 8 times out of 10 in a quiet room.',
  commonMistakes: [
    'Saying their name twice. Say it once, then wait.',
    'Treating in front of you. Treat at your hip, where you want them.',
    'Adding steps too soon. Wait until they look up every time.',
    'Training when they are wound up or sleepy. Pick a calm, alert moment.',
  ],
  equipmentNeeded: [
    '4 to 6-foot flat leash',
    'Soft treats they love (chicken, cheese)',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'llw_s2',
  trainerNote: 'This looks boring. Everything else on the leash builds on it, so give it 3 sessions.',
  supportsLiveAiTrainer: false,
}

const llw_stage2: Protocol = {
  id: 'llw_s2',
  behavior: 'leash_pulling',
  stage: 2,
  title: 'Stop when it goes tight',
  objective: 'Your dog learns a tight leash means you stop and a loose one means you go.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Walk forward with the leash loose.',
      then: 'Keep going as long as the leash stays slack.',
      durationSeconds: null,
      reps: null,
      tip: 'You will stop and start a lot. That is the whole idea.',
      successLook: 'You are moving, dog at your side.'
    },
    {
      order: 2,
      instruction: 'The instant the leash goes tight, freeze.',
      then: 'Say nothing and wait.',
      durationSeconds: null,
      reps: null,
      tip: 'Stop the moment you feel tension, not a few steps later.',
      successLook: 'Leash tight, you still, dog notices.'
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
      instruction: 'Repeat: walk, stop, slack, forward.',
      then: 'Each slack earns forward motion. Treat every third or fourth.',
      durationSeconds: null,
      reps: 15,
      tip: 'Stay quiet when they pull. No name, no "no".',
      successLook: 'Dog eases off before you fully stop.'
    },
    {
      order: 5,
      instruction: 'Every 20 to 30 loose steps, scatter 3 treats.',
      then: 'Drop them at your feet and let them collect.',
      durationSeconds: null,
      reps: null,
      tip: 'Scatter at your feet, not ahead, so they come back to your side.',
      successLook: 'Leash hangs in a J shape beside you.'
    },
    {
      order: 6,
      instruction: 'Let them sniff freely on a loose leash.',
      then: 'Walk with them. No rules for this part.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Dog relaxed, nose down.'
    },
  ],
  setup: [
    'Quiet street or parking lot',
    '4 to 6-foot leash',
    'One hand near your hip',
    'Treats in pocket',
  ],
  successCriteria: 'Move on when they loosen the leash within 5 seconds of you stopping, 10 times out of 15.',
  commonMistakes: [
    'Stopping a few steps late. Stop the moment you feel tension.',
    'Saying their name or "no" when they pull. Stay quiet and wait.',
    'Walking on while the leash is tight. That pays them for pulling.',
    'Picking a route with too much going on. Start somewhere dull.',
  ],
  equipmentNeeded: [
    '4 to 6-foot flat leash',
    'Front-clip harness or flat collar, no retractable leash',
    'Soft treats they love',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'llw_s3',
  trainerNote: 'Expect a change in 3 to 5 sessions, if everyone stops for a tight leash on every walk.',
  supportsLiveAiTrainer: false,
}

const llw_stage3: Protocol = {
  id: 'llw_s3',
  behavior: 'leash_pulling',
  stage: 3,
  title: 'Turn and go',
  objective: 'Your dog keeps up with you when you turn, even with a few things to sniff.',
  durationMinutes: 12,
  repCount: 12,
  steps: [
    {
      order: 1,
      instruction: 'The moment they drift ahead, U-turn and say "this way".',
      then: 'Walk briskly the new way. They trot to catch up.',
      durationSeconds: null,
      reps: null,
      tip: 'Turn with energy. A slow turn teaches nothing.',
      successLook: 'They catch up and check in at your side.'
    },
    {
      order: 2,
      instruction: 'Watch for the loose leash as they reach your hip.',
      then: 'That instant, mark and treat at your hip.',
      durationSeconds: null,
      reps: null,
      tip: 'Pay the moment they catch up, not before or after.',
      successLook: 'Leash hangs in a J, dog at hip.'
    },
    {
      order: 3,
      instruction: 'Change direction without warning: left, right, U-turn.',
      then: 'Each time they catch up on a loose leash, mark and treat.',
      durationSeconds: null,
      reps: 12,
      tip: 'If they cannot predict you, they have to watch you instead of the street.',
      successLook: 'They glance at you, waiting for the next turn.'
    },
    {
      order: 4,
      instruction: 'Walk toward one mild distraction, stopping while they can still eat.',
      then: 'Turn and go near it, paying each catch-up.',
      durationSeconds: null,
      reps: 3,
      tip: 'If they lunge or stare, back up 5 steps. You are too close.',
      successLook: 'They glance at it, then check back with you.'
    },
    {
      order: 5,
      instruction: 'Drop all rules and let them sniff.',
      then: 'Follow along. No cues, no leash pressure.',
      durationSeconds: 120,
      reps: null,
      tip: 'A free sniff takes the edge off and keeps walks something they enjoy.',
      successLook: 'Dog relaxed, nose down, sniffing freely.'
    },
  ],
  setup: [
    'Quiet street',
    'Front-clip harness, 6-foot leash',
    'Treat pouch, well stocked',
  ],
  successCriteria: 'Move on when they catch up on 10 of 12 turns and pass one mild distraction on a loose leash.',
  commonMistakes: [
    'Turning slowly. Turn fast and sound cheerful about it.',
    'Forgetting to treat when they catch up. That moment is the one to pay.',
    'Skipping the free sniff at the end. It keeps walks from feeling like work.',
    'Moving to busy places too soon. Stay on quiet streets for now.',
  ],
  equipmentNeeded: [
    '4 to 6-foot flat leash',
    'Front-clip harness',
    'Soft treats they love',
    'Treat pouch',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'Aim for quiet streets here. Busy streets and other dogs are a separate course.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// RECALL
// ─────────────────────────────────────────────────────────────────────────────

const recall_stage1: Protocol = {
  id: 'recall_s1',
  behavior: 'recall',
  stage: 1,
  title: 'Turn to their name',
  objective: 'Your dog turns and comes toward you when you say their name in a quiet room.',
  durationMinutes: 8,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Say their name once.',
      then: 'The instant they glance, mark and toss a treat toward you.',
      durationSeconds: null,
      reps: 10,
      tip: 'Tossing it toward you teaches that their name means move toward you.',
      successLook: 'They turn to you and step your way.'
    },
    {
      order: 2,
      instruction: 'Say their name, then wait for 2 seconds of eye contact.',
      then: 'After 2 seconds, mark and treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Even one extra second of eye contact is worth marking.',
      successLook: 'They hold eye contact for 2 seconds.'
    },
    {
      order: 3,
      instruction: 'Stand up, cross the room, then say their name.',
      then: 'Pat your legs as they come. Give 3 treats on arrival.',
      durationSeconds: null,
      reps: 5,
      tip: 'The bigger payout teaches that coming all the way to you pays best.',
      successLook: 'They trot across the room to you.'
    },
    {
      order: 4,
      instruction: 'Play or let them sniff for a minute.',
      then: 'No cues, no treats. End on a good note.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'They are relaxed and happy.'
    },
  ],
  setup: [
    'Quiet room',
    '20 tiny treats they love',
    'Sit on the floor',
  ],
  successCriteria: 'Move on when they look and start toward you within 2 seconds, 9 times out of 10, indoors.',
  commonMistakes: [
    'Saying their name all day. It turns into background noise.',
    'Calling them for a bath or nail trim. Go get them instead.',
    'Paying a slow response like a fast one. Give fast ones more.',
    'Calling when they are asleep or busy. Wait for an easy moment.',
  ],
  equipmentNeeded: [
    'Soft treats they love (chicken, freeze-dried liver)',
    'Quiet room indoors',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'recall_s2',
  trainerNote: 'Never use their name before something they dislike. One bad name costs you 5 good ones.',
  supportsLiveAiTrainer: true,
}

const recall_stage2: Protocol = {
  id: 'recall_s2',
  behavior: 'recall',
  stage: 2,
  title: 'Come from the next room',
  objective: 'Your dog comes when called from another room, even with food on the floor.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Say their name, then your recall cue, once.',
      then: 'When they arrive, mark and treat at your feet.',
      durationSeconds: null,
      reps: null,
      tip: 'The name gets their attention. The cue means run to me. Keep them paired.',
      successLook: 'Head lifts at the name before the cue.'
    },
    {
      order: 2,
      instruction: 'Call from a different room each time.',
      then: 'When they arrive, give 3 or 4 treats at your feet.',
      durationSeconds: null,
      reps: 8,
      tip: 'Changing rooms teaches that the cue works when they cannot see you.',
      successLook: 'Dog comes running within 5 seconds.'
    },
    {
      order: 3,
      instruction: 'With kibble down and TV on, wait 10 seconds, then call.',
      then: 'No response in 5 seconds? Clap and run away.',
      durationSeconds: null,
      reps: 5,
      tip: 'Running away works because dogs chase movement.',
      successLook: 'Dog leaves the kibble and comes.'
    },
    {
      order: 4,
      instruction: 'From 15 feet, crouch, open your arms, and call.',
      then: 'On arrival, a full handful of treats and praise.',
      durationSeconds: null,
      reps: 2,
      tip: 'How good the arrival is sets how fast they run next time.',
      successLook: 'Dog sprints and pushes into your hands.'
    },
    {
      order: 5,
      instruction: 'Play with them for a minute.',
      then: 'No cues, only fun.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Dog is loose and happy.'
    },
  ],
  setup: [
    'Treats in hand',
    'Kibble ready to scatter',
    'TV within reach',
  ],
  successCriteria: 'Move on when they come from another room or leave the kibble 8 times out of 10.',
  commonMistakes: [
    'Calling when they probably will not come. Call only when you expect a yes.',
    'Scolding a slow recall. Pay every arrival, however long it took.',
    'Doing too many in one session. Stop while they still run to you.',
    'Always calling from the same spot. Change rooms often.',
  ],
  equipmentNeeded: [
    'Soft treats they love',
    'A few rooms with mild distractions',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'recall_s3',
  trainerNote: 'Do at least 10 indoor sessions before going outside. Home is easy, outside is not.',
  supportsLiveAiTrainer: true,
}

const recall_stage3: Protocol = {
  id: 'recall_s3',
  behavior: 'recall',
  stage: 3,
  title: 'Come on a long line',
  objective: 'Your dog comes when called outside, on a long line, in a quiet spot.',
  durationMinutes: 12,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Let them sniff and settle before any training.',
      then: 'Hold the line loosely and follow. No cues.',
      durationSeconds: 180,
      reps: null,
      tip: 'The long line is a safety net. Never reel them in.',
      successLook: 'Relaxed, sniffing, not frantic.'
    },
    {
      order: 2,
      instruction: 'At 10 to 15 feet, say their name, then your cue.',
      then: 'No response in 3 seconds? Clap, turn, and run away.',
      durationSeconds: null,
      reps: 5,
      tip: 'If they are locked on to something, move closer before you call.',
      successLook: 'They look away from it and trot toward you.'
    },
    {
      order: 3,
      instruction: 'When they arrive, feed 5 treats one at a time.',
      then: 'Praise the whole time. Keep them close for 10 seconds.',
      durationSeconds: 10,
      reps: null,
      tip: 'Outside there is more competing for them, so arrivals need to pay more.',
      successLook: 'They press in, tail wagging, staying close.'
    },
    {
      order: 4,
      instruction: 'Say "go sniff" and let them wander off.',
      then: 'Once they are away again, call and pay again.',
      durationSeconds: null,
      reps: 4,
      tip: 'Coming back, then going free, teaches that a recall does not end the fun.',
      successLook: 'They come each time, no dodging.'
    },
    {
      order: 5,
      instruction: 'After the fastest recall, stop and let them sniff.',
      then: 'Nothing more asked. Let them explore.',
      durationSeconds: 60,
      reps: null,
      tip: 'The last rep is the one they remember. End on a good one.',
      successLook: 'Final recall was as fast as the first.'
    },
  ],
  setup: [
    'Quiet outdoor space',
    'Long line on back-clip harness',
    'Treat pouch, well stocked',
  ],
  successCriteria: 'Move on when they come from 15 feet on the long line, 8 times out of 10, somewhere quiet.',
  commonMistakes: [
    'Dropping the line too soon. Wait until they come from 20 feet every time.',
    'Calling only to end the walk. Call, pay, and let them go again.',
    'Paying outdoor recalls like indoor ones. Outside needs more treats.',
    'Reeling them in on the line. It is there for safety only.',
  ],
  equipmentNeeded: [
    '15 to 20-foot long line',
    'Back-clip harness',
    'Soft treats they love',
    'Treat pouch',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'Off-leash recall in open spaces takes 6 to 12 months. Until then, drop the line only in fenced areas.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// CALM GREETINGS / STOP JUMPING
// ─────────────────────────────────────────────────────────────────────────────

const jumping_stage1: Protocol = {
  id: 'jumping_s1',
  behavior: 'jumping_up',
  stage: 1,
  title: 'Four paws for a hello',
  objective: 'Your dog learns that four paws on the floor gets attention and jumping gets none.',
  durationMinutes: 8,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'When any paw leaves the floor, turn your back.',
      then: 'Say nothing and fold your arms until four paws land.',
      durationSeconds: null,
      reps: null,
      tip: 'Even "no" is attention. Silence is the only response to a jump.',
      successLook: 'Four paws hit the floor after you turn.'
    },
    {
      order: 2,
      instruction: 'The instant four paws are down, turn back and crouch.',
      then: 'Treat with calm praise, then stand and let them try again.',
      durationSeconds: null,
      reps: 20,
      tip: 'Keep your energy at half. Getting excited starts another jump.',
      successLook: 'They come up and look at you, paws down.'
    },
    {
      order: 3,
      instruction: 'Wait for 3 seconds of four paws down.',
      then: 'Count silently to 3, then mark and treat low.',
      durationSeconds: null,
      reps: 5,
      tip: 'Now you are asking them to hold it, not touch down and bounce.',
      successLook: 'They wait on all fours for 3 seconds.'
    },
    {
      order: 4,
      instruction: 'Let them sniff or play for a minute.',
      then: 'Keep it calm. No rough play that invites jumping.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'They are calm and on the floor.'
    },
  ],
  setup: [
    'Calm room indoors',
    'Treats held at your chest',
    'Whole household on the same rules',
  ],
  guide: 'Everyone in the house follows the same rules: jumping gets nothing, four paws get attention. One person who allows jumping undoes weeks of work. Never push them off or knee them. Pushing is still attention, kneeing scares them, and neither shows them what to do instead.',
  successCriteria: 'Move on when they come to you without jumping in 15 of 20 tries, indoors and calm.',
  commonMistakes: [
    'Pushing them off. Touch is attention, so it pays the jump.',
    'Kneeing them. It scares them and teaches nothing to do instead.',
    'Different rules from different people. Everyone turns away, every time.',
    'Allowing "just one" jump. One jump that pays keeps them trying.',
  ],
  equipmentNeeded: [
    'Soft treats they love',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'jumping_s2',
  trainerNote: 'This fails when one person in the house allows jumping. Get everyone to agree before you start.',
  supportsLiveAiTrainer: true,
}

const jumping_stage2: Protocol = {
  id: 'jumping_s2',
  behavior: 'jumping_up',
  stage: 2,
  title: 'Sit when people come close',
  objective: 'Your dog sits on their own when someone walks up to them.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Cue sit.',
      then: 'Mark the instant they sit. Treat between the front paws.',
      durationSeconds: null,
      reps: 10,
      tip: 'If the sit is shaky, fix it here before adding people walking up.',
      successLook: 'Sits within 2 seconds, 9 of 10.'
    },
    {
      order: 2,
      instruction: 'From 5 feet, walk toward them.',
      then: 'If they sit uncued, mark and drop a treat between their paws.',
      durationSeconds: null,
      reps: null,
      tip: 'Treat between the paws. Handing it down from above invites a jump.',
      successLook: 'Dog holds the sit as you walk up.'
    },
    {
      order: 3,
      instruction: 'If they jump, turn your back.',
      then: 'Wait for a sit, then walk up again, slower.',
      durationSeconds: null,
      reps: null,
      tip: 'Your energy set off the jump. Try walking up from the side.',
      successLook: 'Dog holds the sit as you walk up slowly.'
    },
    {
      order: 4,
      instruction: 'Walk up with a little more energy each rep.',
      then: 'Walk, then fast, then jog, then reach. Treat each held sit.',
      durationSeconds: null,
      reps: 10,
      tip: 'Each energy level is a new test. If they jump, drop back one.',
      successLook: 'Sit holds while you jog and reach.'
    },
    {
      order: 5,
      instruction: 'Knock, cue sit, then open the door to a helper.',
      then: 'The helper drops a treat for the sitting dog.',
      durationSeconds: null,
      reps: 5,
      tip: 'Practice before real visitors. The habit has to be there before the excitement.',
      successLook: 'Dog holds the sit as the door opens.'
    },
    {
      order: 6,
      instruction: 'Take a play or sniff break.',
      then: 'Nothing to do. Let them shake it off.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose body, relaxed dog.'
    },
  ],
  setup: [
    'Treats in hand',
    'Helper for the door practice',
  ],
  successCriteria: 'Move on when they sit without a cue in 12 of 15 calm approaches.',
  commonMistakes: [
    'Practicing only with family. Bring in friends and neighbors too.',
    'Handing treats down from above. Drop them between their front paws.',
    'Getting them wound up while practicing. Keep your voice and moves low-key.',
    'Skipping the door practice. Do it before real visitors arrive.',
  ],
  equipmentNeeded: [
    'Soft treats they love',
    'A helper, if you have one',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'jumping_s3',
  trainerNote: 'Once they sit for greetings on their own, you stop having to manage every hello.',
  supportsLiveAiTrainer: true,
}

const jumping_stage3: Protocol = {
  id: 'jumping_s3',
  behavior: 'jumping_up',
  stage: 3,
  title: 'Greeting new people',
  objective: 'Your dog keeps four paws down or sits when greeting people they do not know.',
  durationMinutes: 12,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Helper walks up from 20 feet. Cue sit at 10 feet.',
      then: 'If they sit, the helper drops a treat and pets calmly.',
      durationSeconds: null,
      reps: 5,
      tip: 'If they jump, the helper turns away. Keep the leash loose. It is only backup.',
      successLook: 'They hold the sit while the stranger pets them.'
    },
    {
      order: 2,
      instruction: 'Ask the helper to arrive excited, gushing and reaching.',
      then: 'Same rule: sit gets the hello, jumping gets a turned back.',
      durationSeconds: null,
      reps: 3,
      tip: 'Expect some slipping here. Drop back a step if you need to.',
      successLook: 'Four paws down or a sit despite the excitement.'
    },
    {
      order: 3,
      instruction: 'Repeat the greeting somewhere new: sidewalk, store, or park.',
      then: 'Start easy again. Pay the first calm sit well.',
      durationSeconds: null,
      reps: 2,
      tip: 'A new place can feel like starting over. It gets quicker each time.',
      successLook: 'Calm greeting holds in one new place.'
    },
    {
      order: 4,
      instruction: 'Release them to play or sniff.',
      then: 'The helper can join if your dog stays calm.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Dog relaxed, sniffing or checking in with you.'
    },
  ],
  setup: [
    'Helper your dog barely knows',
    'Short 3 to 4-foot leash',
    '5 treats for the helper',
    'Helper knows the rules',
  ],
  guide: 'Before you start, tell your helper the rules: if your dog jumps, turn away and say nothing. The moment they sit, drop a treat and pet calmly. Give the helper 5 treats. A helper who greets a jumping dog is the most common reason this stage fails.',
  successCriteria: 'Move on when they greet a new person without jumping 8 times out of 10, out and about.',
  commonMistakes: [
    'Skipping the talk with your helper. Tell them the rules first.',
    'Practicing at their most excited, like right after waking. Wait for a calmer time.',
    'Holding the leash tight during jumps. Keep it loose. It is only backup.',
    'Expecting it to be perfect soon. This takes weeks of greetings.',
  ],
  equipmentNeeded: [
    '3 to 4-foot leash',
    'Treats for the helper',
    'A willing helper',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'Carry treats on every walk for 4 weeks and ask friendly strangers to help. It adds up fast.',
  supportsLiveAiTrainer: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// POTTY TRAINING
// ─────────────────────────────────────────────────────────────────────────────

const potty_stage1: Protocol = {
  id: 'potty_s1',
  behavior: 'potty_training',
  stage: 1,
  title: 'Trips out on a schedule',
  objective: 'Your dog goes outside on a set schedule and gets paid well for going there.',
  durationMinutes: 5,
  repCount: 8,
  steps: [
    {
      order: 1,
      instruction: 'Leash up and walk to the potty spot.',
      then: 'Stand still and quiet for up to 5 minutes.',
      durationSeconds: 300,
      reps: null,
      tip: 'This is not a walk. Moving around and chatting distract them from going.',
      successLook: 'They sniff, circle, or squat.'
    },
    {
      order: 2,
      instruction: 'While they are going, say your cue once, softly.',
      then: 'Stay quiet and still until they finish.',
      durationSeconds: null,
      reps: null,
      tip: 'Say it while they go, not after. Over weeks, the word starts to prompt it.',
      successLook: 'They keep going without stopping at your voice.'
    },
    {
      order: 3,
      instruction: 'The instant they finish, praise and treat.',
      then: 'Happy voice, 3 to 5 treats one at a time.',
      durationSeconds: null,
      reps: null,
      tip: 'Treats need to land within 2 seconds of them finishing.',
      successLook: 'Tail wagging, eating treats happily.'
    },
    {
      order: 4,
      instruction: 'Take a 5-minute bonus walk.',
      then: 'Let them sniff and explore. This is the reward for going.',
      durationSeconds: 300,
      reps: null,
      tip: 'Reward outside, right away. A treat back indoors teaches nothing.',
      successLook: 'They enjoy a relaxed walk.'
    },
  ],
  setup: [
    'Short leash by the door',
    'Treats by the door',
    'Same spot, same route',
  ],
  guide: 'Write out a schedule and set alarms. Puppies under 4 months: every 1 to 2 hours. 4 to 6 months: every 2 to 3 hours. Adults: every 3 hours. Add a trip after waking, eating, and play. If nothing happens in 5 minutes, go back in, crate or tether them, and try again in 15 minutes.',
  successCriteria: 'Move on when they go outside on 6 of 8 scheduled trips over 2 days, never loose indoors unwatched.',
  commonMistakes: [
    'Treating once you are back inside. Pay outside, the second they finish.',
    'Scolding accidents after the fact. They cannot connect it to what they did.',
    'Too much of the house too soon. Keep them where you can see them.',
    'Skipping a trip because they seem fine. Stick to the schedule.',
  ],
  equipmentNeeded: [
    'Short leash',
    'Soft treats kept by the door',
    'Crate or tether',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 36,
  difficulty: 1,
  nextProtocolId: 'potty_s2',
  trainerNote: 'Most of this is management. Every accident you did not see is practice going indoors.',
  supportsLiveAiTrainer: false,
}

const potty_stage2: Protocol = {
  id: 'potty_s2',
  behavior: 'potty_training',
  stage: 2,
  title: 'Ring the bell to go out',
  objective: 'Your dog rings a bell at the door when they need to go out.',
  durationMinutes: 8,
  repCount: 6,
  steps: [
    {
      order: 1,
      instruction: 'Before a potty trip, hold a treat by the bell.',
      then: 'When their nose rings it, mark and open the door right away.',
      durationSeconds: null,
      reps: 6,
      tip: 'Do this on every trip for a full week.',
      successLook: 'Bell rings, door opens.'
    },
    {
      order: 2,
      instruction: 'Wait near the door instead of starting the trip.',
      then: 'When they ring on their own, open the door immediately.',
      durationSeconds: null,
      reps: null,
      tip: 'Start after 5 to 7 days of ringing before every trip. Some dogs take weeks.',
      successLook: 'Dog rings the bell without a prompt.'
    },
    {
      order: 3,
      instruction: 'Go to the spot and wait up to 2 minutes.',
      then: 'Give several treats the instant they finish.',
      durationSeconds: 120,
      reps: null,
      tip: null,
      successLook: 'Dog goes at the spot.'
    },
    {
      order: 4,
      instruction: 'Nothing within 2 minutes? Go straight back inside.',
      then: 'No play, no walk. Try again later.',
      durationSeconds: null,
      reps: null,
      tip: 'Pay a fake ring once and they will start ringing for fun.',
      successLook: 'Dog rings only when they need to go.'
    },
    {
      order: 5,
      instruction: 'After a real potty, take a 1-minute sniff walk.',
      then: 'This is the reward for a real ring.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Dog sniffs happily, then back in.'
    },
  ],
  setup: [
    'Bell hung at nose height',
    'Treats in pocket',
    'Potty spot picked',
  ],
  guide: 'Hang the bell at nose height on the door you use for potty trips. For one week, start every trip with the bell. After 5 to 7 days, stop starting trips yourself and wait for them to ring. If they ring and do not go within 2 minutes, go straight back in. Walks and play only come after a real potty.',
  successCriteria: 'Move on when they ring the bell on their own at least 4 times out of 6 over 3 days.',
  commonMistakes: [
    'Hanging the bell too high. Put it at nose height.',
    'Taking a while to open the door. Open it the moment it rings.',
    'Playing outside after a ring with no potty. They will ring for fun.',
    'Taking the bell down too soon. Leave it up for months.',
  ],
  equipmentNeeded: [
    'Door bell for dogs, or any jingle bell',
    'Soft treats they love',
    'The same potty spot',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 36,
  difficulty: 2,
  nextProtocolId: 'potty_s3',
  trainerNote: 'The bell is temporary. Many dogs switch to sitting by the door on their own.',
  supportsLiveAiTrainer: false,
}

const potty_stage3: Protocol = {
  id: 'potty_s3',
  behavior: 'potty_training',
  stage: 3,
  title: 'One more room at a time',
  objective: 'Your dog stays accident-free as you slowly give them more of the house.',
  durationMinutes: 5,
  repCount: 4,
  steps: [
    {
      order: 1,
      instruction: 'Let them roam their current room while you watch.',
      then: 'Any circling or corner sniffing? Take them outside right away.',
      durationSeconds: null,
      reps: null,
      tip: 'Each accident is practice going indoors, so add space slowly.',
      successLook: 'They roam without circling or sniffing corners.'
    },
    {
      order: 2,
      instruction: 'Watch for their tell: circling, floor sniffing, leaving the room.',
      then: 'See one? Say "outside" cheerfully and go straight out.',
      durationSeconds: null,
      reps: null,
      tip: 'Every dog has a tell. Learning theirs beats cleaning up.',
      successLook: 'They get outside before anything happens.'
    },
    {
      order: 3,
      instruction: 'At the spot, say "go potty" once and wait.',
      then: 'When they go, mark and treat right there.',
      durationSeconds: null,
      reps: 4,
      tip: 'A potty cue is handy before car trips, bedtime, and travel.',
      successLook: 'They go within 2 minutes of arriving.'
    },
    {
      order: 4,
      instruction: 'After they go, let them sniff around outside.',
      then: 'Going potty earns the fun part of being out.',
      durationSeconds: 60,
      reps: null,
      tip: 'If you always go in right after, they learn to hold it longer.',
      successLook: 'Relaxed sniffing, no rushing back in.'
    },
  ],
  setup: [
    'Baby gates set for one room',
    'Treat pouch',
    'Enzyme cleaner on hand',
  ],
  guide: 'Give them more of the house one room at a time. Start with one small room you can watch, and add the next after 2 accident-free weeks. If there is an accident, do not react or scold. Clean it with enzyme cleaner and go back to closer supervision for 48 hours. Regular cleaners leave scent your dog can still find.',
  successCriteria: 'Move on when they have no accidents for 4 weeks in a row and ask to go out.',
  commonMistakes: [
    'Treating an accident as bad behavior. It means they had too much freedom.',
    'Cleaning with regular cleaner. Use an enzyme cleaner so no scent is left.',
    'Opening up the house after a few good days. Wait 2 accident-free weeks.',
    'Stopping treats too soon. Keep paying until they go outside without thinking.',
  ],
  equipmentNeeded: [
    'Enzyme cleaner',
    'Treat pouch',
    'Baby gates',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 36,
  difficulty: 2,
  nextProtocolId: null,
  trainerNote: 'Getting there takes months, not weeks. After a setback, go back to stage 1 for a week.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// CRATE TRAINING
// ─────────────────────────────────────────────────────────────────────────────

const crate_stage1: Protocol = {
  id: 'crate_s1',
  behavior: 'crate_anxiety',
  stage: 1,
  title: 'Treats in the crate',
  objective: 'Your dog walks into the crate on their own and rests there calmly.',
  durationMinutes: 10,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Scatter a few kibble pieces inside the crate.',
      then: 'Step back and let them check it out on their own.',
      durationSeconds: null,
      reps: null,
      tip: 'Never push or lure them in. Pressure now can take weeks to undo.',
      successLook: 'They sniff the entrance, maybe one paw in.'
    },
    {
      order: 2,
      instruction: 'Toss a treat just inside the door.',
      then: 'When they step back out, toss the next one a bit deeper.',
      durationSeconds: null,
      reps: 10,
      tip: 'Work toward the back wall over several sessions. Start from wherever they stop.',
      successLook: 'They walk in, get the treat, walk out calmly.'
    },
    {
      order: 3,
      instruction: 'Feed the next meal inside the crate, door open.',
      then: 'Bowl just inside for 3 days, then at the back.',
      durationSeconds: null,
      reps: null,
      tip: 'Every meal in the crate is a free good experience.',
      successLook: 'They walk in for meals without hesitating.'
    },
    {
      order: 4,
      instruction: 'Close the door for 10 seconds while they eat.',
      then: 'Stay in the room. Open it quietly. Build to 60 seconds.',
      durationSeconds: 60,
      reps: null,
      tip: 'Make the door boring. No fuss when it opens or closes.',
      successLook: 'They keep eating, no scratching or whining.'
    },
    {
      order: 5,
      instruction: 'Open the crate and let them wander out.',
      then: 'No fuss. A short sniff or play break ends the session.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'They leave calmly and relax.'
    },
  ],
  setup: [
    'Crate in the living room',
    'Door off or propped open',
    'Worn T-shirt inside',
    'Handful of kibble',
  ],
  guide: 'Give each step at least 2 to 3 days, and 1 to 2 weeks for this stage. Never use the crate as punishment. Do not open the door while they whine. Wait for a quiet moment, and treat any whining as a sign you went too fast: make the next rep shorter.',
  successCriteria: 'Move on when they walk in for a tossed treat 8 of 10 times and eat calmly, door closed.',
  commonMistakes: [
    'Moving too fast. Each step needs 2 to 3 days at least.',
    'Using the crate as a punishment. It should only mean good things.',
    'Opening the door for whining. Wait for quiet, then make the next rep shorter.',
    'Long crate stays too early. Keep it to minutes for now.',
  ],
  equipmentNeeded: [
    'Crate they can stand and turn in',
    'Soft treats they love',
    'Worn T-shirt or something that smells of home',
    'Food bowl',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'crate_s2',
  trainerNote: 'You want a dog who puts themselves to bed. It cannot be rushed. Give it 2 weeks.',
  supportsLiveAiTrainer: false,
}

const crate_stage2: Protocol = {
  id: 'crate_s2',
  behavior: 'crate_anxiety',
  stage: 2,
  title: 'Door closed, you nearby',
  objective: 'Your dog stays settled in the closed crate while you sit nearby, then leave briefly.',
  durationMinutes: 12,
  repCount: 6,
  steps: [
    {
      order: 1,
      instruction: 'Put the chew toy in the crate and close the door.',
      then: 'Sit in the room and ignore the crate completely.',
      durationSeconds: 600,
      reps: null,
      tip: 'Frozen peanut butter keeps them busy. Once the chew is done, wait for 2 quiet minutes.',
      successLook: 'Dog works the chew and settles.'
    },
    {
      order: 2,
      instruction: 'Stand, walk to the doorway, pause 10 seconds.',
      then: 'Return to your seat. Do not look at the crate.',
      durationSeconds: null,
      reps: 5,
      tip: 'Your moving around should mean nothing. Keep it boring.',
      successLook: 'Dog stays lying down as you move.'
    },
    {
      order: 3,
      instruction: 'Leave the room for 30 seconds.',
      then: 'Come back before any fuss, sit down, ignore the crate.',
      durationSeconds: 30,
      reps: null,
      tip: 'Each short trip adds to their sense that you always come back.',
      successLook: 'Head lifts when you return, then settles again.'
    },
    {
      order: 4,
      instruction: 'Leave again, a little longer each time.',
      then: '30 seconds, 1, 2, then 5 minutes. Return before they get upset.',
      durationSeconds: 300,
      reps: null,
      tip: 'Come back during a quiet moment, not while they whine.',
      successLook: 'No frantic greeting when you come back.'
    },
    {
      order: 5,
      instruction: 'Open the crate door and wait for calm.',
      then: 'Only then a low-key hello.',
      durationSeconds: null,
      reps: 3,
      tip: 'A wild exit makes crate time something to get wound up about.',
      successLook: 'Dog steps out calmly.'
    },
    {
      order: 6,
      instruction: 'Let them sniff or stretch out for a minute.',
      then: 'Stay low-key. The session is over.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Dog wanders calmly, no zoomies.'
    },
  ],
  setup: [
    'Walk or play first',
    'Frozen stuffed chew toy',
    'Crate door open',
    'A seat in the same room',
  ],
  successCriteria: 'Move on when they settle 30 minutes with you there and stay calm through 5-minute absences, 4 of 6 sessions.',
  commonMistakes: [
    'Coming back while they whine. Wait for a quiet moment, then return.',
    'Skipping the time with you in the room. Do that part first.',
    'Big hellos when you return. Keep it quiet and dull.',
    'Crating before a walk or play. Tire them out first.',
  ],
  equipmentNeeded: [
    'Crate',
    'Chew toy or bully stick',
    'Timer',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'crate_s3',
  trainerNote: 'Tire them out before every crate session. A tired dog settles. A bored one frets.',
  supportsLiveAiTrainer: false,
}

const crate_stage3: Protocol = {
  id: 'crate_s3',
  behavior: 'crate_anxiety',
  stage: 3,
  title: 'Longer stretches alone',
  objective: 'Your dog rests calmly in the crate for up to 3 hours while you are out.',
  durationMinutes: 10,
  repCount: 5,
  steps: [
    {
      order: 1,
      instruction: 'Do the routine: walk, cue word, chew toy in, dog enters.',
      then: 'Same order every time.',
      durationSeconds: null,
      reps: null,
      tip: 'A dog who knows what is coming worries less.',
      successLook: 'They hear the cue and walk to the crate.'
    },
    {
      order: 2,
      instruction: 'Leave for today\'s length of time, with no goodbye.',
      then: 'Back home, check the camera for stress after the first 5 minutes.',
      durationSeconds: null,
      reps: null,
      tip: 'Quiet when you return does not mean calm the whole time. Check the video.',
      successLook: 'Asleep or resting calmly on camera.'
    },
    {
      order: 3,
      instruction: 'Leave the crate door open in the evening. Do not prompt.',
      then: 'Wait for them to choose it on their own.',
      durationSeconds: null,
      reps: null,
      tip: 'A dog who picks the crate is comfortable there, not putting up with it.',
      successLook: 'They walk in and rest without a prompt.'
    },
    {
      order: 4,
      instruction: 'Once a week, crate them midday with a chew toy.',
      then: 'Go about your day. Let them out calmly after.',
      durationSeconds: 1800,
      reps: null,
      tip: 'Skip the crate for months and it feels strange again. Weekly use keeps it normal.',
      successLook: 'They go in on cue with no fuss.'
    },
    {
      order: 5,
      instruction: 'Open the crate and let them out calmly.',
      then: 'Straight outside for a short sniff, no big greeting.',
      durationSeconds: 60,
      reps: null,
      tip: 'A quiet exit keeps the crate from meaning a party is coming.',
      successLook: 'Calm exit, loose body, sniffing.'
    },
  ],
  setup: [
    'Crate with familiar bedding',
    'Pet camera running',
    'Chew toy ready',
    'White noise on, if you like',
  ],
  guide: 'Stretch alone time in steps: 30 minutes, 1 hour, 90 minutes, 2 hours, 3 hours, over 2 to 3 weeks. Never move up more than one step a day. Watch the camera after every session. Panting, drooling, pawing, or barking after the first 5 minutes means it was too long, so go back a step.',
  successCriteria: 'Move on when the camera shows them resting calmly for 3 hours alone, 4 of 5 sessions.',
  commonMistakes: [
    'Skipping the camera. Quiet when you get home does not mean calm throughout.',
    'No walk or play before long sessions. Tire them out first.',
    'Crating an adult for more than 4 hours. Get help for longer days.',
    'Dropping the crate once they sleep through the night. Keep using it weekly.',
  ],
  equipmentNeeded: [
    'Crate with familiar bedding',
    'Pet camera',
    'Chew toy',
    'White noise machine, if you like',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: '4 hours is the most for an adult dog during the day. Past that, find a walker or sitter.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// PUPPY BITING
// ─────────────────────────────────────────────────────────────────────────────

const biting_stage1: Protocol = {
  id: 'biting_s1',
  behavior: 'puppy_biting',
  stage: 1,
  title: 'Soft mouth first',
  objective: 'Your puppy keeps their mouth soft on skin during play.',
  durationMinutes: 8,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Play, and let gentle mouthing happen.',
      then: 'When a bite hurts, say \'ouch\' once and freeze for 3 seconds.',
      durationSeconds: null,
      reps: null,
      tip: 'Keep it short and flat. If ouch winds them up, skip it and freeze.',
      successLook: 'They pause and pull back a little.'
    },
    {
      order: 2,
      instruction: 'After 3 seconds, resume play.',
      then: 'After 3 hard bites, stand up and turn away for 30 seconds.',
      durationSeconds: 30,
      reps: null,
      tip: 'Hard biting ends the fun. Keep the time-out calm and short.',
      successLook: 'Bite pressure softens over the session.'
    },
    {
      order: 3,
      instruction: 'After any freeze, wiggle a toy and say \'get the toy\'.',
      then: 'When they bite the toy instead, mark and play hard.',
      durationSeconds: null,
      reps: 10,
      tip: 'Make the toy more fun than your hand. Drag it along the floor.',
      successLook: 'They move from your hand to the toy.'
    },
    {
      order: 4,
      instruction: 'Hold your open hand still near their face.',
      then: 'Any gentle sniff or lick earns a treat from your other hand.',
      durationSeconds: null,
      reps: 5,
      tip: 'They learn that still hands mean treats, not play.',
      successLook: 'They sniff or lick your hand gently.'
    },
    {
      order: 5,
      instruction: 'End with a minute of calm toy play.',
      then: 'Keep it calm; stop before they get wild again.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'They play with the toy, not you.'
    },
  ],
  setup: [
    'Tug toy within reach',
    'Tiny treats in pocket',
    'Puppy rested, not overtired',
  ],
  successCriteria: 'Move on when bites stay soft in 12 of 15 play moments.',
  commonMistakes: [
    'Yanking your hand away. Freeze instead, since movement invites more biting.',
    'Different rules from different people. Agree on one plan as a household.',
    'Waiting too long to offer the toy. Have it out within 2 seconds.',
    'Stopping all mouthing. Soft mouthing is normal at this age.',
  ],
  equipmentNeeded: [
    'Tug or rope toy',
    'Soft treats, pea-sized',
  ],
  ageMinMonths: 2,
  ageMaxMonths: 18,
  difficulty: 1,
  nextProtocolId: 'biting_s2',
  trainerNote: 'Aim for zero hard bites, not zero mouthing. A dog with a soft mouth is safer.',
  supportsLiveAiTrainer: true,
}

const biting_stage2: Protocol = {
  id: 'biting_s2',
  behavior: 'puppy_biting',
  stage: 2,
  title: 'Teeth on toys only',
  objective: 'Your puppy keeps teeth off skin and puts them on toys instead.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Any tooth on skin: freeze silently for 5 seconds.',
      then: 'No ouch. Then resume play with a toy.',
      durationSeconds: 5,
      reps: null,
      tip: 'This stage raises the bar from no hard bites to no teeth.',
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
      instruction: 'Touch their collar, paws, and ears in turn.',
      then: 'Feed treats the whole time.',
      durationSeconds: null,
      reps: 5,
      tip: 'This makes vet visits and nail trims easier later.',
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
  setup: [
    'Toys around the room',
    'Treat pouch on',
  ],
  successCriteria: 'Move on when teeth stay off skin in 12 of 15 play bouts.',
  commonMistakes: [
    'Allowing mouthing some days. Keep the same rule every day.',
    'Starting play without a toy. Have one in hand first.',
    'Wrestling with bare hands, even briefly. Play through a toy.',
    'Only handling them during play. Practice calm handling as its own session.',
  ],
  equipmentNeeded: [
    'Several toys around the house',
    'Treat pouch',
  ],
  ageMinMonths: 3,
  ageMaxMonths: 18,
  difficulty: 2,
  nextProtocolId: 'biting_s3',
  trainerNote: 'Teething puppies need more to chew. Add chew toys and bully sticks alongside this.',
  supportsLiveAiTrainer: true,
}

const biting_stage3: Protocol = {
  id: 'biting_s3',
  behavior: 'puppy_biting',
  stage: 3,
  title: 'Gentle with new people',
  objective: 'Your puppy greets new people, kids included, without putting teeth on them.',
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
      tip: 'Expect a slip somewhere new. Keep greetings short and calm.',
      successLook: 'Calm mouth holds in a new place.'
    },
    {
      order: 4,
      instruction: 'Teach kids "statue": stand still, closed fist out.',
      then: 'If the puppy sniffs without mouthing, you give the treat.',
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
  setup: [
    'Helper puppy barely knows',
    'Leash on for greetings',
    'Treats for you and helper',
    'Toy for redirecting',
  ],
  successCriteria: 'Move on when they greet strangers with no teeth 8 of 10 times, in 2 places.',
  commonMistakes: [
    'Practicing only with yourself. Ask friends and neighbors to help.',
    'Letting kids play with the puppy alone. An adult is always there.',
    'Greeting off leash too soon. Keep the leash on until greetings stay calm.',
    'Stopping once home is going well. Practice in at least 2 new places.',
  ],
  equipmentNeeded: [
    'Treats for helpers',
    'Leash for greetings',
    'Toys for redirecting',
  ],
  ageMinMonths: 4,
  ageMaxMonths: 18,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'Keep at it through teething. Most puppies mouth far less by 6 or 7 months.',
  supportsLiveAiTrainer: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTLING / PLACE
// ─────────────────────────────────────────────────────────────────────────────

const settle_stage1: Protocol = {
  id: 'settle_s1',
  behavior: 'settling',
  stage: 1,
  title: 'Mat means treats',
  objective: 'Your dog walks to their mat on their own and lies down.',
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
      instruction: 'Say \'place\' once as they start toward the mat.',
      then: 'When they lie down on it, mark and treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Add the word only once they already do it without one.',
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
  setup: [
    'Mat in the living room',
    'Treat pouch on',
    'Plenty of tiny treats',
  ],
  successCriteria: 'Move on when they go to the mat and lie down on cue 12 of 15 times, in a quiet room.',
  commonMistakes: [
    'Luring onto the mat every time. Wait for them to choose it.',
    'Adding the cue too early. Wait until they head there on their own.',
    'A mat too small to lie on. Pick one they can stretch out on.',
    'Moving the mat around too soon. Get it right in one room first.',
  ],
  equipmentNeeded: [
    'Dog mat or flat bed',
    'Soft treats, pea-sized',
    'Treat pouch',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'settle_s2',
  trainerNote: 'Some dogs get this in one session, others take a week. Wait them out.',
  supportsLiveAiTrainer: true,
}

const settle_stage2: Protocol = {
  id: 'settle_s2',
  behavior: 'settling',
  stage: 2,
  title: 'Stay on the mat longer',
  objective: 'Your dog stays on their mat for 5 minutes while the house carries on.',
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
      tip: 'Stretch slowly; jumping from 30 seconds to nothing makes them leave.',
      successLook: 'Dog stays 5 minutes with the TV on.'
    },
    {
      order: 4,
      instruction: 'Walk casually past the mat every 30 seconds.',
      then: 'Each time they stay, toss a treat to the mat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Following you is the hardest part of settling. Pay well here.',
      successLook: 'Dog stays as you pass, does not follow.'
    },
    {
      order: 5,
      instruction: 'Have a helper walk in and sit down.',
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
  setup: [
    'Mat down',
    'Treat pouch on',
    'TV remote nearby',
    'A helper at home',
  ],
  successCriteria: 'Move on when they hold the mat 5 minutes with household noise, treats every 60 seconds, 6 of 8 sessions.',
  commonMistakes: [
    'Spacing out treats too fast. Stretch the gaps a little at a time.',
    'Calling them off the mat. Walk over and release with free.',
    'Adding a helper too soon. Get 5 quiet minutes with the TV first.',
  ],
  equipmentNeeded: [
    'Mat',
    'Soft treats',
    'Treat pouch',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'settle_s3',
  trainerNote: 'Once settling clicks, you can cut back on treats fairly fast.',
  supportsLiveAiTrainer: true,
}

const settle_stage3: Protocol = {
  id: 'settle_s3',
  behavior: 'settling',
  stage: 3,
  title: 'Place from any room',
  objective: 'Your dog goes to their mat from any room on one cue and stays 10 minutes.',
  durationMinutes: 12,
  repCount: 8,
  steps: [
    {
      order: 1,
      instruction: 'From 10 feet, cue "place" once.',
      then: 'Treat on arrival; add distance each rep, up to 30 feet.',
      durationSeconds: null,
      reps: 5,
      tip: 'Farther away is harder. Pay any honest try.',
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
      instruction: 'Cue place, then hand over the chew and start timing.',
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
      tip: 'Always release out loud; "free" is the only way a settle ends.',
      successLook: 'They leave the mat relaxed.'
    },
  ],
  setup: [
    'Portable mat',
    'Chew toy',
    'Best treats',
    'Timer',
  ],
  successCriteria: 'Move on when they go to the mat from another room 6 of 8 times and hold 10 minutes.',
  commonMistakes: [
    'Letting the settle end on its own. Always finish with free.',
    'Scolding them for getting up. Shorten the hold and build back up.',
    'Skipping the new place. Practice away from home too.',
  ],
  equipmentNeeded: [
    'Portable mat',
    'Chew toy',
    'Best treats',
    'Timer',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'This is the version you will use most, when guests arrive or dinner is on.',
  supportsLiveAiTrainer: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE IT / DROP IT
// ─────────────────────────────────────────────────────────────────────────────

const leave_it_stage1: Protocol = {
  id: 'leave_it_s1',
  behavior: 'leave_it',
  stage: 1,
  title: 'Leave the fist',
  objective: 'Your dog backs away from food in your hand and waits for a better treat.',
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
      tip: 'The sniff break is the reward. It helps them come down after focused work.',
      successLook: 'They wander and sniff, relaxed.'
    },
  ],
  setup: [
    'Kibble in one fist',
    'Better treats in other hand',
    'Quiet room',
  ],
  successCriteria: 'Move on when they back off an open-palm treat within 2 seconds of leave it, 15 of 20 reps.',
  commonMistakes: [
    'Pulling the fist away when they nose it. Keep it still.',
    'Paying from the fist. The reward always comes from the other hand.',
    'Adding the cue too early. Wait for 5 quick back-offs in a row.',
    'Putting tasty food in the fist too soon. Start with kibble.',
  ],
  equipmentNeeded: [
    'Kibble for the closed fist',
    'Better treats for the other hand',
    'Treat pouch',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'leave_it_s2',
  trainerNote: 'This is the cue that keeps dropped pills and chicken bones out of their mouth.',
  supportsLiveAiTrainer: false,
}

const leave_it_stage2: Protocol = {
  id: 'leave_it_s2',
  behavior: 'leave_it',
  stage: 2,
  title: 'Floor food and drop it',
  objective: 'Your dog leaves food on the floor and lets go of things on cue.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Cover kibble on the floor with your foot.',
      then: 'Say leave it. When they back off, mark and treat.',
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
      then: 'As the toy falls, say drop it. Treat, then give it back.',
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
      tip: 'Never yank it away. Many easy trades now make the emergency one work.',
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
  setup: [
    'Kibble for the floor',
    'Better treats in pouch',
    'A toy',
    'A bully stick or chew',
  ],
  successCriteria: 'Move on when they leave an uncovered floor treat 5 seconds, 10 of 15, and drop a toy 8 of 10.',
  commonMistakes: [
    'Letting them win the floor treat, even once. Cover it faster.',
    'Taking things without a trade. That can teach guarding, so always swap.',
    'Only practicing with boring items. Work up to chews they love.',
    'Mixing up leave it and drop it. Keep the two words separate.',
  ],
  equipmentNeeded: [
    'Kibble',
    'Better treats for rewards',
    'Toy',
    'Bully stick or chew',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'leave_it_s3',
  trainerNote: 'Leave it means don\'t touch. Drop it means let go of what you have.',
  supportsLiveAiTrainer: false,
}

const leave_it_stage3: Protocol = {
  id: 'leave_it_s3',
  behavior: 'leave_it',
  stage: 3,
  title: 'Leave it outside',
  objective: 'Your dog leaves dropped food and passing animals alone outside when you say leave it.',
  durationMinutes: 12,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Drop kibble ahead and walk toward it.',
      then: 'Say "leave it" 2 steps before; mark and pay from pouch.',
      durationSeconds: null,
      reps: 5,
      tip: 'Cue before they reach it. Once it\'s in their mouth, you\'re too late.',
      successLook: 'They see the food, hear the cue, look to you.'
    },
    {
      order: 2,
      instruction: 'Walk past food on the ground without cuing.',
      then: 'Jackpot if they ignore it; if not, "leave it" once, keep walking.',
      durationSeconds: null,
      reps: 5,
      tip: 'The goal is leaving it without a word; the cue is a backup.',
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
      instruction: 'Stand where they see an animal but can still eat.',
      then: 'Say leave it, treat at your face. Mark when they look.',
      durationSeconds: null,
      reps: 3,
      tip: 'For squirrels that might be 30 feet. Start where they can hear you.',
      successLook: 'They notice the animal, then orient to you.'
    },
    {
      order: 5,
      instruction: 'Pick up the planted food, then let them sniff.',
      then: 'No cues, a loose-leash walk.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Relaxed sniffing, nothing scavenged.'
    },
  ],
  setup: [
    'Leash on, outdoors',
    'Kibble and chicken to drop',
    'Best treats in pouch',
  ],
  successCriteria: 'Move on when they leave ground food 8 of 10 times outside, and turn from animals 6 of 10.',
  commonMistakes: [
    'Only practicing indoors. Outside is much harder, so start easy.',
    'Using a sharp tone. Keep leave it calm or cheerful.',
    'Paying too little for a big temptation. Bring your best treats.',
    'Trying squirrels before ground food is easy. Do food first.',
  ],
  equipmentNeeded: [
    'Treat pouch, best treats',
    '6-foot leash',
    'Kibble or chicken to drop',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'Leaving squirrels alone can take 6 to 12 months. Keep the leash on meanwhile.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// BASIC OBEDIENCE (SIT / DOWN / STAY)
// ─────────────────────────────────────────────────────────────────────────────

const obedience_stage1: Protocol = {
  id: 'obedience_s1',
  behavior: 'basic_obedience',
  stage: 1,
  title: 'Sit and down',
  objective: 'Your dog sits and lies down on the word alone within 2 seconds.',
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
      tip: 'The sniff break is the reward. It helps them come down after focused work.',
      successLook: 'They wander and sniff, relaxed.'
    },
  ],
  setup: [
    'Quiet room',
    'Tiny treats in a pouch',
  ],
  successCriteria: 'Move on when they sit on the word alone 9 of 10 times and down 8 of 10.',
  commonMistakes: [
    'Keeping food in the lure hand past rep 5. Empty it early.',
    'Repeating the cue. Say it once, then wait.',
    'Paying a half sit or hover. Wait for their rear on the floor.',
    'Adding distractions too early. Get it right in a quiet room first.',
  ],
  equipmentNeeded: [
    'Soft treats, pea-sized',
    'Treat pouch',
    'Quiet room',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'obedience_s2',
  trainerNote: 'Most other courses build on sit and down, so get them clean before moving on.',
  supportsLiveAiTrainer: true,
}

const obedience_stage2: Protocol = {
  id: 'obedience_s2',
  behavior: 'basic_obedience',
  stage: 2,
  title: 'Stay put',
  objective: 'Your dog holds a sit or down until you release them, with you 5 feet away.',
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
  setup: [
    'Quiet room',
    'Treat pouch on',
    'Room to step back',
  ],
  successCriteria: 'Move on when sit-stay holds 20 seconds and down-stay 30 seconds, both at 5 feet, 10 of 15.',
  commonMistakes: [
    'Calling them to you for the treat. Walk back and pay in place.',
    'Adding time and distance together. Change one at a time.',
    'No clear release. End every stay with free.',
    'Taking it somewhere busy too soon. Stay in a quiet room for now.',
  ],
  equipmentNeeded: [
    'Soft treats',
    'Treat pouch',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'obedience_s3',
  trainerNote: 'Add time, then distance, then distractions, one at a time. Stacking them is why stays break.',
  supportsLiveAiTrainer: true,
}

const obedience_stage3: Protocol = {
  id: 'obedience_s3',
  behavior: 'basic_obedience',
  stage: 3,
  title: 'Outside with people passing',
  objective: 'Your dog sits, lies down, and stays outside while people walk past.',
  durationMinutes: 12,
  repCount: 12,
  steps: [
    {
      order: 1,
      instruction: 'At home with the TV on, cue sit, down, and stay.',
      then: 'Pay each response; if it falls apart, lower the distraction.',
      durationSeconds: null,
      reps: 5,
      tip: 'Household noise counts as a distraction; do not skip straight to the park.',
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
      tip: 'Expect them to slip outside. Pay well for every hold.',
      successLook: 'They hold 5 seconds in the driveway.'
    },
    {
      order: 4,
      instruction: 'Cue sit-stay; helper walks past at 10 feet.',
      then: 'Treat for holding; over the reps bring the helper to 5 feet.',
      durationSeconds: null,
      reps: 5,
      tip: 'People walking by is what you will meet most often.',
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
      then: 'Nothing more asked; let them unwind.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose body, nose down.'
    },
  ],
  setup: [
    'Treat pouch, best treats',
    'Leash',
    'Helper for passing steps',
  ],
  guide: 'Use these cues through the day. Ask for a sit before meals, a down before the door opens, a stay at the curb. Then the meal, the door, or the walk is the reward. These rewards are always on hand, so the cues keep working after the treat pouch goes away.',
  successCriteria: 'Move on when they sit and down outside 10 of 12 times, and hold 15 seconds as someone passes 5 feet away, 8 of 12.',
  commonMistakes: [
    'Expecting indoor results outside right away. Start easier outdoors.',
    'Using worse treats outside. Bring better ones than you use indoors.',
    'Going straight to a busy park. Start in the driveway.',
    'Only asking during sessions. Use the cues through the day too.',
  ],
  equipmentNeeded: [
    'Treat pouch',
    'Best treats',
    'Leash',
    'A helper to walk past',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'Outside can look like starting over. It comes back faster than it did indoors.',
  supportsLiveAiTrainer: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// BARKING
// ─────────────────────────────────────────────────────────────────────────────

const barking_stage1: Protocol = {
  id: 'barking_s1',
  behavior: 'barking',
  stage: 1,
  title: 'Speak, then quiet',
  objective: 'Your dog stops barking within 3 seconds when you say quiet.',
  durationMinutes: 8,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Say \'speak\', then knock to set off a bark.',
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
      tip: 'You want a few seconds of quiet, not a gap between barks.',
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
      then: 'No triggers; let them wind all the way down.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'They are calm and quiet.'
    },
  ],
  setup: [
    'Knock or doorbell ready',
    'Best treats in a pouch',
    'Dog calm, not worked up',
  ],
  successCriteria: 'Move on when they go quiet within 3 seconds of the cue, 10 of 15 reps, at home.',
  commonMistakes: [
    'Saying quiet louder each time. Say it once, calmly.',
    'Skipping speak. You need to start the bark before you can stop it.',
    'Paying a 1-second pause. Wait for a few seconds of quiet.',
    'Practicing when they\'re already wound up. Start while they\'re calm.',
  ],
  equipmentNeeded: [
    'Best treats',
    'Knock or doorbell sound',
    'Treat pouch',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'barking_s2',
  trainerNote: 'Shouting quiet sounds like you are barking along. One calm cue and a treat works better.',
  supportsLiveAiTrainer: false,
}

const barking_stage2: Protocol = {
  id: 'barking_s2',
  behavior: 'barking',
  stage: 2,
  title: 'Doorbell means mat',
  objective: 'Your dog goes to their mat after a bark or two at the door.',
  durationMinutes: 10,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Ring the bell, allow 2 barks, then say place.',
      then: 'Lead them to the mat and cue down.',
      durationSeconds: null,
      reps: 5,
      tip: 'Bell, a bark, mat, quiet, treat. The mat replaces the long barking.',
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
      tip: 'Going there on their own takes 30 to 50 reps. Plan them in.',
      successLook: 'Dog heads for the mat on the bell.'
    },
    {
      order: 4,
      instruction: 'Demand barking: give nothing, not even eye contact.',
      then: 'The instant it stops, mark and give what they wanted.',
      durationSeconds: null,
      reps: null,
      tip: 'It gets louder before it stops. Answering the loud barks teaches louder barking.',
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
  setup: [
    'Mat down',
    'Treat pouch on',
    'Helper at the door',
    'Window blocked or covered',
  ],
  guide: 'When you are not watching, block the window. Move the couch, add a baby gate, or put frosted film on the lower pane. Every bark at the window is practice at barking. Blocking the view is fair, and it cuts that practice while you build the mat habit.',
  successCriteria: 'Move on when they reach the mat within 15 seconds of the bell, 7 of 10 practice runs.',
  commonMistakes: [
    'Answering demand barks at all. Even scolding counts as attention.',
    'Waiting for silence before sending them to the mat. Send after 1 or 2 barks.',
    'Leaving the window open to watch. Block it when you\'re not there.',
    'Giving in when barking gets louder. Wait for a pause, then answer.',
  ],
  equipmentNeeded: [
    'Baby gate or window film',
    'Mat',
    'Best treats',
    'A helper to ring the bell',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'barking_s3',
  trainerNote: 'You are not aiming for silence. You want 2 barks, then the mat.',
  supportsLiveAiTrainer: false,
}

const barking_stage3: Protocol = {
  id: 'barking_s3',
  behavior: 'barking',
  stage: 3,
  title: 'Quiet on walks and visits',
  objective: 'Your dog stays quiet, or quiets fast, around their biggest triggers.',
  durationMinutes: 12,
  repCount: 8,
  steps: [
    {
      order: 1,
      instruction: 'Present the mildest trigger where they notice but stay quiet.',
      then: 'Feed continuously while it is in view; stop when it goes.',
      durationSeconds: null,
      reps: null,
      tip: 'Get closer only across sessions. A bark means you are too close.',
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
      tip: 'Treat before they are fully quiet. Seeing the trigger should mean food.',
      successLook: 'They orient to you and eat while moving away.'
    },
    {
      order: 4,
      instruction: 'When they spot a trigger before barking, say their name cheerfully.',
      then: 'Jackpot the instant they look at you.',
      durationSeconds: null,
      reps: null,
      tip: 'Catching it before the bark is where you are headed.',
      successLook: 'They spot it, turn to you, no bark.'
    },
    {
      order: 5,
      instruction: 'Walk away from triggers and let them sniff.',
      then: 'No cues; loose leash, quiet spot.',
      durationSeconds: 60,
      reps: null,
      tip: 'End every trigger session with sniffing. It helps them calm down.',
      successLook: 'Loose body, nose down, quiet.'
    },
  ],
  setup: [
    'Mat and chew toy',
    'Best treats, pouch',
    'Helper to play guest',
  ],
  guide: 'List your dog\'s top 3 triggers from mildest to worst. Always work the mildest first, far enough away that they notice it but do not bark. Text guests before they come: "Please wait outside until I text you." Most people are happy to. Expect progress in weeks, not days. How your dog feels about the trigger changes slowly.',
  successCriteria: 'Move on when they quiet within 5 seconds 6 of 8 times, and hold the mat for guests 5 of 8.',
  commonMistakes: [
    'Working too close. If they bark, back up until they can eat.',
    'Getting loud when they bark. Stay calm and move away.',
    'Only blocking triggers. Also teach the mat and the name turn.',
    'Expecting change in under 4 weeks. Give it a month or more.',
  ],
  equipmentNeeded: [
    'Chew toy',
    'Mat',
    'Best treats',
    'Helper to play a guest',
    'Treat pouch',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'Barking comes from a feeling. The steps change what they do; the treats change how they feel.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// SEPARATION ANXIETY
// ─────────────────────────────────────────────────────────────────────────────

const separation_stage1: Protocol = {
  id: 'separation_s1',
  behavior: 'separation_anxiety',
  stage: 1,
  title: 'Keys and shoes mean nothing',
  objective: 'Your dog stays relaxed when you pick up your keys or put on your coat.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Pick up your keys and go sit on the couch.',
      then: 'Sit for 5 minutes, then put the keys back.',
      durationSeconds: 300,
      reps: null,
      tip: 'Pick up keys 15 times a day without leaving, and they stop meaning much.',
      successLook: 'They watch, then relax within 30 seconds.'
    },
    {
      order: 2,
      instruction: 'Put your shoes on and stay home.',
      then: 'Wear them for an hour of normal life, then take them off.',
      durationSeconds: null,
      reps: null,
      tip: 'One cue at a time: shoes one week, coat the next.',
      successLook: 'They stay settled or show only mild interest.'
    },
    {
      order: 3,
      instruction: 'Hand over the chew toy.',
      then: 'Do shoes, keys, coat, door open 10 seconds, then undo it all.',
      durationSeconds: null,
      reps: 3,
      tip: 'With a chew toy going, the whole routine turns into background noise.',
      successLook: 'They lick the toy and stay calm throughout.'
    },
    {
      order: 4,
      instruction: 'Sit on the couch and hang out for a minute.',
      then: 'Nothing happens. The routine ends with you still home.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'They settle or keep chewing.'
    },
  ],
  setup: [
    'Keys, shoes, coat nearby',
    'Chew toy ready',
    'Your 3 leaving cues listed',
  ],
  guide: 'Write down your leaving routine in order: shoes, keys, coat. Each one tells your dog they\'re about to be alone. Work on one at a time, never together. Keys: pick them up and sit down, 5 times a day for 3 days. Shoes: put them on, stay home an hour, take them off, for 3 days. Then combine.',
  successCriteria: 'Move on when they show no panting, pacing, or whining through the full routine, 10 of 15 times.',
  commonMistakes: [
    'Rushing to real departures. Stay on the cues until they stop reacting.',
    'Big emotional goodbyes at the door. Leave like it\'s nothing.',
    'Skipping the chew toy. Hand it over before every routine.',
    'Working on every cue at once. Do one cue at a time.',
  ],
  equipmentNeeded: [
    'Chew toy',
    'Your keys, shoes, coat',
    'Pet camera, if you have one',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'separation_s2',
  trainerNote: 'This is anxiety, not bad behavior. If your dog panics hard, bring in a veterinary behaviorist.',
  supportsLiveAiTrainer: false,
}

const separation_stage2: Protocol = {
  id: 'separation_s2',
  behavior: 'separation_anxiety',
  stage: 2,
  title: 'Short trips out the door',
  objective: 'Your dog stays calm alone for up to 10 minutes and expects you back.',
  durationMinutes: 15,
  repCount: 8,
  steps: [
    {
      order: 1,
      instruction: 'Hand over the chew, say your leaving word, step out.',
      then: 'Wait outside for today\'s time, then come back calmly.',
      durationSeconds: null,
      reps: 3,
      tip: 'Start at 30 seconds. Come back before any stress shows, with no big hello.',
      successLook: 'Dog stays calm on the chew while you are gone.'
    },
    {
      order: 2,
      instruction: 'Watch the camera footage from all 3 absences.',
      then: 'Calm the whole time? Next session goes one step longer.',
      durationSeconds: null,
      reps: null,
      tip: 'Quiet when you walk in does not mean calm the whole time.',
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
  setup: [
    'Camera aimed at their bed',
    'Stuffed chew toy ready',
    'Timer ready',
  ],
  guide: 'Add time across sessions: 30 seconds, then 1, 2, 3, 5, 8, and 10 minutes. Move up only when the footage shows calm at the last step. Any howling, pacing, drooling, or chewing things up means next time you drop to half the last calm time. If work means leaving sooner, use a sitter or daycare.',
  successCriteria: 'Move on when they stay calm on camera for 10 minutes, with no distress, 6 of 8 sessions.',
  commonMistakes: [
    'Adding time because your schedule needs it. Let the footage decide.',
    'Big homecomings. Come in calm and greet once they settle.',
    'Leaving without a chew toy early on. Give one every time.',
    'Trying long absences too soon. Short ones must be calm first.',
  ],
  equipmentNeeded: [
    'Chew toy',
    'Pet camera',
    'Timer',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: 'separation_s3',
  trainerNote: 'Most people stall here by going longer too soon. Calm for the full time, then add more.',
  supportsLiveAiTrainer: false,
}

const separation_stage3: Protocol = {
  id: 'separation_s3',
  behavior: 'separation_anxiety',
  stage: 3,
  title: 'Longer stretches alone',
  objective: 'Your dog rests calmly alone for 3 to 4 hours while you\'re out.',
  durationMinutes: 15,
  repCount: 6,
  steps: [
    {
      order: 1,
      instruction: 'Run the same routine: walk, chew toy, leaving word, go.',
      then: 'Same order every time, no long goodbye.',
      durationSeconds: null,
      reps: null,
      tip: 'The same routine every time tells them this ends, like it always does.',
      successLook: 'They take the chew and do not follow you.'
    },
    {
      order: 2,
      instruction: 'Set out a fresh chew or puzzle before leaving.',
      then: 'Rotate so each absence starts with something new.',
      durationSeconds: null,
      reps: null,
      tip: 'Most dogs settle within 20 minutes. The chew covers that stretch.',
      successLook: 'They work on it 15 minutes, then lie down.'
    },
    {
      order: 3,
      instruction: 'Leave for today\'s planned time.',
      then: 'Watch the camera; come back early if stress shows.',
      durationSeconds: null,
      reps: null,
      tip: 'Going from 60 minutes to 3 hours takes 6 to 8 steps. Plan for it.',
      successLook: 'Asleep or resting for most of the absence.'
    },
    {
      order: 4,
      instruction: 'On return, ignore them for 2 minutes.',
      then: 'Then greet them quietly.',
      durationSeconds: 120,
      reps: null,
      tip: 'A quiet return keeps coming home from turning into a big event.',
      successLook: 'They wait calmly, no spinning or jumping.'
    },
    {
      order: 5,
      instruction: 'After the greeting, take a short sniff walk.',
      then: 'Let them unwind. Nothing asked.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose body, normal sniffing.'
    },
  ],
  setup: [
    'Camera running',
    'Chew or puzzle ready',
    'Timer',
  ],
  guide: 'Stretch absences from 10 minutes to 30, 60, 90, then 2 to 3 hours, checking each on camera. Past an hour, add only 15 minutes at a time. Rotate chews: stuffed toy, snuffle mat, lick mat, frozen bone. Once it holds, keep 2 practice absences a week. After a big life change, start again at stage 1.',
  successCriteria: 'Move on when they stay calm on camera for 3 hours, with no stress signs, 5 of 6 sessions.',
  commonMistakes: [
    'Calling it done before 3 hours on camera. Check the footage first.',
    'Dropping the leaving routine once things look good. Keep it the same.',
    'Forgetting big life changes, like a move. Go back a stage afterward.',
    'Punishing chewed-up things. That makes the anxiety worse.',
  ],
  equipmentNeeded: [
    'Pet camera',
    'A rotation of chews: lick mat, snuffle mat, bone',
    'Timer',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 4,
  nextProtocolId: null,
  trainerNote: 'No real change by now? See a veterinary behaviorist. Medication can make the training possible.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// DOOR MANNERS
// ─────────────────────────────────────────────────────────────────────────────

const door_manners_stage1: Protocol = {
  id: 'door_manners_s1',
  behavior: 'door_manners',
  stage: 1,
  title: 'Wait at an inside door',
  objective: 'Your dog holds still at a door until you say \'free\'.',
  durationMinutes: 8,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Touch the doorknob.',
      then: 'When they back up or sit, mark and treat.',
      durationSeconds: null,
      reps: null,
      tip: 'If they surge, take your hand off and wait. Holding still is what opens doors.',
      successLook: 'They back up or stand still at the knob.'
    },
    {
      order: 2,
      instruction: 'Open the door 1 inch.',
      then: 'Still means treat and open a little more; surge means close.',
      durationSeconds: null,
      reps: 10,
      tip: 'Closing the door isn\'t a punishment. Keep it matter-of-fact.',
      successLook: 'They hold still while the door opens 6 inches.'
    },
    {
      order: 3,
      instruction: 'Say \'wait\' as you reach for the knob.',
      then: 'When they hold still, mark, treat, and open the door.',
      durationSeconds: null,
      reps: 8,
      tip: '\'Wait\' means hold until released. End it with \'free\' every time.',
      successLook: 'They pause on \'wait\' and hold while it opens.'
    },
    {
      order: 4,
      instruction: 'Open the door fully and hold the wait 3 seconds.',
      then: 'Say \'free\' and let them through.',
      durationSeconds: null,
      reps: 5,
      tip: 'When they know \'free\' is coming, they wait without fretting.',
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
  setup: [
    'An inside door',
    'Treat pouch on',
    'Leash off or loose',
  ],
  successCriteria: 'Move on when they hold at an open inside door for 5 seconds, 12 of 15 reps.',
  commonMistakes: [
    'Opening too fast. Only widen the gap while they hold still.',
    'Letting them release themselves. Always end it with \'free\'.',
    'Starting at the front door. Practice on inside doors first.',
    'Letting even one bolt through happen. Close the door sooner.',
  ],
  equipmentNeeded: [
    'High-value treats',
    'Treat pouch',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'door_manners_s2',
  trainerNote: 'A dog who bolts can end up in traffic. Get inside doors to 10 for 10 first.',
  supportsLiveAiTrainer: true,
}

const door_manners_stage2: Protocol = {
  id: 'door_manners_s2',
  behavior: 'door_manners',
  stage: 2,
  title: 'Wait at the front door',
  objective: 'Your dog waits at the front door, even with people outside.',
  durationMinutes: 10,
  repCount: 12,
  steps: [
    {
      order: 1,
      instruction: 'Touch the knob, then open the door bit by bit.',
      then: 'Treat each hold, then 5 seconds fully open, then free.',
      durationSeconds: null,
      reps: 5,
      tip: 'Keep the leash loose. It\'s a backup, not a brake.',
      successLook: 'Dog holds at the open front door.'
    },
    {
      order: 2,
      instruction: 'Open the door while a helper walks across the driveway.',
      then: 'Treat every 2 seconds while the door is open.',
      durationSeconds: null,
      reps: 5,
      tip: 'Hardest step, with the whole street in view. Pay fast.',
      successLook: 'Dog holds with a person walking past.'
    },
    {
      order: 3,
      instruction: 'Have the helper ring the bell, then cue wait or place.',
      then: 'Open the door; the helper walks in, ignores them, sits.',
      durationSeconds: null,
      reps: 3,
      tip: 'Brief guests first. One who greets a jumping dog undoes it.',
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
      tip: 'Practice going out and coming in, so it works both ways.',
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
  setup: [
    'Leash on, hanging loose',
    'Treat pouch on',
    'Helper outside',
    'Mat by the door',
  ],
  successCriteria: 'Move on when they hold at the open front door 5 seconds with someone outside, 9 of 12.',
  commonMistakes: [
    'Moving to the front door too soon. Inside doors should be easy first.',
    'Holding them back with the leash. The cue does the work.',
    'Guests who greet right away. Ask them to ignore your dog until released.',
    'Trying real guests too early. Practice with a helper first.',
  ],
  equipmentNeeded: [
    'Leash',
    'High-value treats',
    'Treat pouch',
    'A helper',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'door_manners_s3',
  trainerNote: 'Everyone in the house and every regular visitor needs the rule. One bolt undoes weeks.',
  supportsLiveAiTrainer: true,
}

const door_manners_stage3: Protocol = {
  id: 'door_manners_s3',
  behavior: 'door_manners',
  stage: 3,
  title: 'Wait with no leash',
  objective: 'Your dog waits at the front door with no leash, even when wound up.',
  durationMinutes: 10,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'No leash. Cue "wait" and open the front door.',
      then: '5 seconds held? Mark, treat, release with "free."',
      durationSeconds: null,
      reps: 5,
      tip: 'If they bolt, bring them back calmly, close the door, and reset. No fuss.',
      successLook: 'They hold at the open door, no leash, 5 seconds.'
    },
    {
      order: 2,
      instruction: 'Play hard for 5 minutes, then cue "wait" at the door.',
      then: 'Same rule: hold earns the release, bolting earns a reset.',
      durationSeconds: null,
      reps: 3,
      tip: 'Most door escapes happen when they\'re excited, so practice then.',
      successLook: 'Wait holds even when they are fizzing.'
    },
    {
      order: 3,
      instruction: 'Say "free," let them out, then call them back in.',
      then: 'Jackpot a fast turn back through the door.',
      durationSeconds: null,
      reps: 4,
      tip: 'If they ever get out, calling them back through the door is your backup.',
      successLook: 'They step out, hear the cue, and come back in.'
    },
    {
      order: 4,
      instruction: 'Repeat the wait at another entrance: gate, garage, car door.',
      then: 'Same rule; expect it to carry over within a couple of reps.',
      durationSeconds: null,
      reps: 3,
      tip: 'Once the front door is easy, other doors come fast.',
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
  setup: [
    'High-value treats',
    'Long line for early reps',
    'Front door, ready to open',
  ],
  successCriteria: 'Move on when they hold 5 seconds off leash at the open front door, 8 of 10, 3 after play.',
  commonMistakes: [
    'Only practicing when your dog is calm. Practice right after play too.',
    'Only using the front door. Try the gate, garage, and car.',
    'Stopping practice once it looks good. Keep a few reps a week.',
    'Skipping the call back through the door. It\'s your backup if they bolt.',
  ],
  equipmentNeeded: [
    'High-value treats',
    'Long line for the first off-leash reps',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'Plan on about 15 sessions in total. After that, a few reps a week keeps it going.',
  supportsLiveAiTrainer: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPULSE CONTROL
// ─────────────────────────────────────────────────────────────────────────────

const impulse_control_stage1: Protocol = {
  id: 'impulse_s1',
  behavior: 'impulse_control',
  stage: 1,
  title: 'The open hand game',
  objective: 'Your dog learns that backing off gets the treat and grabbing gets nothing.',
  durationMinutes: 8,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Hold treats on your open palm.',
      then: 'Close your fist as they move in; open when they back off.',
      durationSeconds: null,
      reps: null,
      tip: 'Say nothing. Let them work out that backing off opens your hand.',
      successLook: 'They back off and the fist opens.'
    },
    {
      order: 2,
      instruction: 'Open your palm, treats visible.',
      then: 'If they hold back and look at you, mark; they take one.',
      durationSeconds: null,
      reps: 10,
      tip: 'Close before their nose gets there. You have to be faster.',
      successLook: 'They see the treats, glance at you, and wait.'
    },
    {
      order: 3,
      instruction: 'Sit down and place one treat on your knee.',
      then: 'When they back off and meet your eyes, mark; they take it.',
      durationSeconds: null,
      reps: 10,
      tip: 'The look at you is the point: don\'t grab, check in.',
      successLook: 'They look at the treat, then at you.'
    },
    {
      order: 4,
      instruction: 'Hold the food bowl and lower it slowly.',
      then: 'Dive means lift it; a calm step back means down and \'free\'.',
      durationSeconds: null,
      reps: null,
      tip: 'Every meal is free practice. Don\'t skip it.',
      successLook: 'They wait for \'free\' before eating.'
    },
    {
      order: 5,
      instruction: 'Play or let them sniff for a minute.',
      then: 'No cues, no treats. End on a good note.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'They are relaxed and happy.'
    },
  ],
  setup: [
    'Kibble in your hand',
    'Food bowl for later',
    'Quiet room, say nothing',
  ],
  successCriteria: 'Move on when they wait 3 seconds at your open palm, 15 of 20, and for \'free\' 7 meals running.',
  commonMistakes: [
    'Talking during the game. Stay quiet and let them figure it out.',
    'Letting a grab pay off even once. Be quicker with your fist.',
    'Skipping mealtimes. Every meal is a free practice round.',
    'Adding distractions too soon. Get the palm game easy first.',
  ],
  equipmentNeeded: [
    'Kibble or plain treats',
    'Your dog\'s food bowl',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'impulse_s2',
  trainerNote: 'Once your dog gets this, most other courses go faster. Expect a week of short sessions.',
  supportsLiveAiTrainer: false,
}

const impulse_control_stage2: Protocol = {
  id: 'impulse_s2',
  behavior: 'impulse_control',
  stage: 2,
  title: 'Calm first, then the fun',
  objective: 'Your dog stays calm around food on tables, toys, car doors, and the leash.',
  durationMinutes: 10,
  repCount: 12,
  steps: [
    {
      order: 1,
      instruction: 'Put a boring treat on the table edge and stand beside it.',
      then: 'Cover it if they move in; mark eye contact, pay from pouch.',
      durationSeconds: null,
      reps: 5,
      tip: 'Rewards come from you. Food on surfaces is never for dogs.',
      successLook: 'Dog backs off the table and looks at you.'
    },
    {
      order: 2,
      instruction: 'Wiggle an exciting toy.',
      then: 'They lunge: freeze the toy. They sit or pause: mark, play.',
      durationSeconds: null,
      reps: 5,
      tip: 'Calm makes the fun start. That rule carries over everywhere.',
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
  setup: [
    'Treat pouch on',
    'Boring treat for the table',
    'An exciting toy',
    'Leash and car nearby',
  ],
  successCriteria: 'Move on when they leave the table treat 8 of 12 times and wait at the car 8 of 10.',
  commonMistakes: [
    'Letting them have the table treat. Pay from your hand or pouch.',
    'Starting play before they\'ve fully paused. Wait for the pause.',
    'Practicing the car door when you\'re rushed. Do it on a slow day.',
    'Quitting leash practice while they\'re still frantic. End on a calm moment.',
  ],
  equipmentNeeded: [
    'Treat pouch with treats',
    'Exciting toy',
    'Leash',
    'Access to a car',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'impulse_s3',
  trainerNote: 'Same rule everywhere: calm first, then the good thing. Keep it up and it becomes habit.',
  supportsLiveAiTrainer: false,
}

const impulse_control_stage3: Protocol = {
  id: 'impulse_s3',
  behavior: 'impulse_control',
  stage: 3,
  title: 'Calm with people and dogs',
  objective: 'Your dog sits for greetings and stays calm when other dogs pass.',
  durationMinutes: 12,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'When someone wants to pet them, cue sit first.',
      then: 'Sit earns the approach; a lunge means the person turns away.',
      durationSeconds: null,
      reps: 4,
      tip: 'Ask the person: "Could you wait until they sit?" Most people will.',
      successLook: 'They sit while the stranger approaches and pets.'
    },
    {
      order: 2,
      instruction: 'Another dog in view? Cue sit or focus.',
      then: 'Treat every 2 seconds while it passes; stop when it is gone.',
      durationSeconds: null,
      reps: 3,
      tip: 'They learn that other dogs showing up means treats from you.',
      successLook: 'They glance at the dog, then turn to you.'
    },
    {
      order: 3,
      instruction: 'Something exciting appears? Cue sit and hold 5 seconds.',
      then: 'Say "free" and walk together toward the exciting thing.',
      durationSeconds: null,
      reps: 3,
      tip: 'Calm gets them closer. Frantic makes them wait.',
      successLook: 'Sit holds 5 seconds with the ball in view.'
    },
    {
      order: 4,
      instruction: 'Tug for 30 seconds, say "done" and go still.',
      then: 'Cue down; pay it when they settle, then play again.',
      durationSeconds: null,
      reps: 3,
      tip: 'Going from play to down in 10 seconds takes real self-control.',
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
  setup: [
    'Leash on, treat pouch',
    'Tug toy',
    'Willing greeter',
  ],
  successCriteria: 'Move on when they sit for greetings 7 of 10 and look to you when dogs pass, 6 of 10.',
  commonMistakes: [
    'Allowing a greeting without the sit. Every greeting starts with a sit.',
    'Working too close to other dogs. Back up until they can still eat.',
    'Correcting a lunge. Add distance instead.',
    'Dropping the tug and settle game. Play it every week.',
  ],
  equipmentNeeded: [
    'Treat pouch',
    'High-value treats',
    'Leash',
    'Tug toy',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'Most dogs get this at home in a week. Outside takes longer, and that is normal.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// COOPERATIVE CARE
// ─────────────────────────────────────────────────────────────────────────────

const coop_care_stage1: Protocol = {
  id: 'coop_care_s1',
  behavior: 'cooperative_care',
  stage: 1,
  title: 'Paws, ears, and mouth',
  objective: 'Your dog stays relaxed while you handle their paws, ears, and mouth.',
  durationMinutes: 8,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Touch the shoulder and treat, then elbow, lower leg, paw.',
      then: 'A treat at every spot; pulling away means restart at the shoulder.',
      durationSeconds: null,
      reps: 5,
      tip: 'Go from least to most sensitive: body, legs, paws, toes.',
      successLook: 'They hold still from shoulder to paw.'
    },
    {
      order: 2,
      instruction: 'Cup one paw gently for 2 seconds.',
      then: 'Feed a treat every second during the hold; 5 holds per paw.',
      durationSeconds: null,
      reps: 20,
      tip: 'Treating during the hold tells them the hold itself is safe.',
      successLook: 'The paw rests in your hand while they eat.'
    },
    {
      order: 3,
      instruction: 'Touch the ear base, slide to the flap, lift 3 seconds.',
      then: 'Treat the whole time; if they pull away or shake, go lighter.',
      durationSeconds: null,
      reps: 5,
      tip: 'Stop at stress signs like whale eye or shaking. Go lighter and rebuild.',
      successLook: 'Ear flap lifted and held without pulling.'
    },
    {
      order: 4,
      instruction: 'Touch the muzzle, lift the lip, then open the mouth briefly.',
      then: 'Treat at each step; press lightly on the lower jaw to open.',
      durationSeconds: null,
      reps: 5,
      tip: 'An easy mouth now means easier tooth brushing and pills later.',
      successLook: 'Lips lifted and mouth opened without pulling away.'
    },
    {
      order: 5,
      instruction: 'Stop handling and let them shake it off.',
      then: 'A minute of sniffing or easy play ends the session.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'They relax and stay near you.'
    },
  ],
  setup: [
    'Tiny treats',
    'Quiet room',
    'Relaxed, not tired or hungry',
  ],
  successCriteria: 'Move on when they accept a 3-second paw hold, ear lift, and lip check in 10 of 15 sessions.',
  commonMistakes: [
    'Moving to a new spot too soon. Wait until the current one is calm.',
    'Treating after you let go. Treat during the handling.',
    'Practicing when they\'re tired or hungry. Pick a relaxed moment.',
    'Holding tighter when they pull away. Go lighter instead.',
  ],
  equipmentNeeded: [
    'High-value treats, tiny pieces',
    'Treat pouch',
    'Quiet room',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'coop_care_s2',
  trainerNote: 'Keep it up with a 5-minute refresher once a month, even after it\'s easy.',
  supportsLiveAiTrainer: false,
}

const coop_care_stage2: Protocol = {
  id: 'coop_care_s2',
  behavior: 'cooperative_care',
  stage: 2,
  title: 'Nails, one tap at a time',
  objective: 'Your dog stays still for nail trims, from seeing the clippers to a full trim.',
  durationMinutes: 10,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Show the clippers.',
      then: 'Any calm look or sniff earns a treat.',
      durationSeconds: null,
      reps: null,
      tip: 'Scared? Put them on the floor a few feet away and treat for looking.',
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
      then: 'Do not cut. Treat well, then let go.',
      durationSeconds: null,
      reps: null,
      tip: 'Each step may take several sessions. The whole thing takes weeks.',
      successLook: 'Dog holds still with the clipper around a nail.'
    },
    {
      order: 4,
      instruction: 'Clip the tip of one nail.',
      then: 'Give 5 treats right away, then stop for the day.',
      durationSeconds: null,
      reps: null,
      tip: 'Stay well clear of the quick. Next session, 2 nails.',
      successLook: 'Dog holds still through the snip.'
    },
    {
      order: 5,
      instruction: 'Play or sniff break.',
      then: 'Clippers away. Nothing more today.',
      durationSeconds: 60,
      reps: null,
      tip: 'Stopping after 1 nail is the plan, not giving up.',
      successLook: 'Dog relaxed and happy.'
    },
  ],
  setup: [
    'Sharp nail clippers',
    'Best treats you have',
    'Styptic powder nearby',
    'Quiet spot, dog relaxed',
  ],
  guide: 'Spread this over many sessions: 3 sessions of just seeing the clippers, then touching, then placing, then 1 nail, then 2. Two to four weeks is normal. Once full trims are easy, keep the good treats coming at every trim. That\'s what keeps a calm dog calm. Trim once a month.',
  successCriteria: 'Move on when they accept clippers on 3 nails in 7 of 10 sessions, then 3 full trims running.',
  commonMistakes: [
    'Rushing to a full trim. Each step should be calm first.',
    'Dull clippers. Replace them at least once a year.',
    'Gripping harder when they pull back. Let go and make it easier.',
    'Stopping treats once they seem fine. Keep paying at every trim.',
  ],
  equipmentNeeded: [
    'Sharp nail clippers',
    'Your best treats',
    'Styptic powder, in case you nick the quick',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'coop_care_s3',
  trainerNote: 'Expect 2 to 4 weeks. Nail fear is a common reason dogs get sedated at the vet.',
  supportsLiveAiTrainer: false,
}

const coop_care_stage3: Protocol = {
  id: 'coop_care_s3',
  behavior: 'cooperative_care',
  stage: 3,
  title: 'Practice vet visits',
  objective: 'Your dog walks into the vet calm and stands still for a full exam.',
  durationMinutes: 12,
  repCount: 8,
  steps: [
    {
      order: 1,
      instruction: 'Lift them onto the table and feed continuously.',
      then: 'After 30 seconds, lift them off; that is one rep.',
      durationSeconds: null,
      reps: 5,
      tip: 'The vet table is cold and strange. Rehearse on a folding table first.',
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
      tip: 'Vet techs hold dogs just like this. Practice now so it isn\'t new.',
      successLook: 'Firm hold accepted with little resistance.'
    },
    {
      order: 4,
      instruction: 'Release with play or a sniff break.',
      then: 'Handling ends and fun starts. That\'s what they remember.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Relaxed, shaking off, ready to play.'
    },
  ],
  setup: [
    'Raised surface or folding table',
    'High-value treats',
    'Happy visit booked',
  ],
  guide: 'Once a month, book a happy visit: walk in, let staff hand out treats, sit in the waiting room for 5 minutes, and leave. No exam, no shots. Call ahead first. Most clinics are glad to do it. Do the home exam weekly too. It also helps you spot lumps and sore spots early.',
  successCriteria: 'Move on when they accept a 3-minute home exam 6 of 8 sessions and enter the clinic calmly twice running.',
  commonMistakes: [
    'Practicing only at home. Book happy visits at the clinic too.',
    'Doing home exams only when something\'s wrong. Do one every week.',
    'Holding tighter when they struggle. Let go and make it easier.',
    'Staying quiet at the vet. Ask for a slow exam with treats.',
  ],
  equipmentNeeded: [
    'Raised surface or folding table',
    'High-value treats',
    'A clinic that allows happy visits',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: null,
  trainerNote: 'A calm dog gets a more thorough exam, so problems get caught earlier.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// WAIT & STAY
// ─────────────────────────────────────────────────────────────────────────────

const wait_stay_stage1: Protocol = {
  id: 'wait_stay_s1',
  behavior: 'wait_and_stay',
  stage: 1,
  title: 'Wait versus stay',
  objective: 'Your dog knows \'wait\' means pause and \'stay\' means hold until \'free\'.',
  durationMinutes: 8,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'While walking, say \'wait\' and stop.',
      then: 'The moment they pause in any position, mark, treat, walk on.',
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
      tip: 'Stay is one position, held until you release them.',
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
      tip: 'Mixing the two makes your dog listen to the actual word.',
      successLook: 'A brief pause for wait, a held sit for stay.'
    },
    {
      order: 5,
      instruction: 'Let them sniff freely for a minute.',
      then: 'Say \'free\' and follow them. No cues, no treats.',
      durationSeconds: 60,
      reps: null,
      tip: 'Sniffing is the reward for the work they just did.',
      successLook: 'They wander and sniff, relaxed.'
    },
  ],
  setup: [
    'Quiet room',
    'Treat pouch on',
    'Room to walk a few steps',
  ],
  successCriteria: 'Move on when they pause on \'wait\' without sitting, and hold a 10-second stay, 10 of 15 each.',
  commonMistakes: [
    'Using \'wait\' and \'stay\' for the same thing. Give each word one meaning.',
    'Asking for a sit with every \'wait\'. Any pause counts.',
    'Letting stay end on its own. Always release with \'free\'.',
    'Adding time before they know which word is which. Get the difference first.',
  ],
  equipmentNeeded: [
    'High-value treats',
    'Treat pouch',
    'Quiet room',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'wait_stay_s2',
  trainerNote: 'Wait is for curbs and doors. Stay is for the mat when guests come. You need both.',
  supportsLiveAiTrainer: true,
}

const wait_stay_stage2: Protocol = {
  id: 'wait_stay_s2',
  behavior: 'wait_and_stay',
  stage: 2,
  title: 'Stay while you move',
  objective: 'Your dog holds a 20-second stay while you move around 10 feet away.',
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
      tip: 'Behind them is the hardest spot. Work up to it.',
      successLook: 'Stay holds while you stand behind them.'
    },
    {
      order: 3,
      instruction: 'Step back one step, then return and treat.',
      then: 'Add steps each rep: 2, then 5 feet, then 10 feet.',
      durationSeconds: null,
      reps: 7,
      tip: '3 clean reps at each distance. Mix distances so they can\'t predict.',
      successLook: 'Stay holds at 10 feet for 5 seconds.'
    },
    {
      order: 4,
      instruction: 'Walk to 8 feet, then move sideways and back.',
      then: 'Step away again, return, then treat.',
      durationSeconds: null,
      reps: null,
      tip: 'If a stay only works while you stand frozen, it isn\'t done yet.',
      successLook: 'Stay holds through unpredictable movement.'
    },
    {
      order: 5,
      instruction: 'Walk back, pause, then say free.',
      then: 'Take a minute-long play break together.',
      durationSeconds: 60,
      reps: null,
      tip: 'Running back excites them and breaks the stay.',
      successLook: 'Dog waits for the word, then plays.'
    },
  ],
  setup: [
    'Treat pouch on',
    'Room to move around',
  ],
  successCriteria: 'Move on when they hold a 20-second sit-stay with you moving 10 feet away, 8 of 12.',
  commonMistakes: [
    'Adding distance before time is easy. Build time first.',
    'Running back to them. Walk back calmly so they don\'t break.',
    'Always using the same distance. Mix it up so they can\'t guess.',
    'Releasing the moment you get back. Pause, then say \'free\'.',
  ],
  equipmentNeeded: [
    'High-value treats',
    'Treat pouch',
    'Room to move around',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'wait_stay_s3',
  trainerNote: 'Most dogs break the first time you step behind them. That\'s normal. Make it easier and rebuild.',
  supportsLiveAiTrainer: true,
}

const wait_stay_stage3: Protocol = {
  id: 'wait_stay_s3',
  behavior: 'wait_and_stay',
  stage: 3,
  title: 'Stay with distractions',
  objective: 'Your dog holds a stay at meals, when guests arrive, and at curbs.',
  durationMinutes: 12,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Cue sit-stay 3 feet from the bowl on the floor.',
      then: 'Hold 5 seconds, say "free" and let them eat.',
      durationSeconds: null,
      reps: null,
      tip: 'If they break for the bowl, pick it up and reset. Free daily practice.',
      successLook: 'They hold until "free."'
    },
    {
      order: 2,
      instruction: 'Cue stay on the mat; helper opens the door and enters.',
      then: 'Guest walks into the room; treat for holding, then release.',
      durationSeconds: null,
      reps: 4,
      tip: 'A dog on the mat when guests arrive is the easiest dog to live with.',
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
      tip: 'One new thing at a time; 3 clean reps before making it harder.',
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
      then: 'Nothing more asked. Let them unwind.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose body, nose down.'
    },
  ],
  setup: [
    'Portable mat',
    'Treat pouch',
    'Helper',
    'Leash',
  ],
  successCriteria: 'Move on when they hold the mat stay for guests 7 of 10 and stop at curbs 8 walks running.',
  commonMistakes: [
    'Skipping the mealtime stay. It\'s free practice every day.',
    'Counting on it outside before practicing outside. Practice there first.',
    'Adding several distractions at once. Add one at a time.',
    'Letting stay slide in daily life. Ask for it and mean it.',
  ],
  equipmentNeeded: [
    'Portable mat',
    'Treat pouch',
    'A helper',
    'Leash',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'Keep using it every day, at meals and curbs, and it stays sharp for years.',
  supportsLiveAiTrainer: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// LEASH REACTIVITY
// ─────────────────────────────────────────────────────────────────────────────

const reactivity_stage1: Protocol = {
  id: 'reactivity_s1',
  behavior: 'leash_reactivity',
  stage: 1,
  title: 'Find their comfortable distance',
  objective: 'Your dog sees another dog, stays calm, and keeps taking treats from you.',
  durationMinutes: 10,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Walk toward the helper dog until yours notices it.',
      then: 'Stop there. This is your starting distance.',
      durationSeconds: null,
      reps: null,
      tip: 'The right distance: they see the other dog but can still eat and listen.',
      successLook: 'They notice, take a treat, stay with you.'
    },
    {
      order: 2,
      instruction: 'Stand 5 feet farther back than that.',
      then: 'When the other dog appears, feed every 2 seconds until it leaves.',
      durationSeconds: null,
      reps: 5,
      tip: 'Food flows while the other dog is in sight and stops when it\'s gone.',
      successLook: 'They eat treats while the other dog is visible.'
    },
    {
      order: 3,
      instruction: 'If they react, say nothing. Turn and walk away.',
      then: 'Stop when they can take a treat again.',
      durationSeconds: null,
      reps: null,
      tip: 'They aren\'t being naughty; you were too close. Add 10 feet next time.',
      successLook: 'They recover within 30 seconds and eat.'
    },
    {
      order: 4,
      instruction: 'Stay at that distance and wait for a look back.',
      then: 'The moment they glance from the dog to you, mark and treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'That head turn on their own means the food is doing its work.',
      successLook: 'They see the dog, then turn to you.'
    },
    {
      order: 5,
      instruction: 'Walk away from the helper dog and let them sniff.',
      then: 'A minute of sniffing ends the session.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose body, nose down.'
    },
  ],
  setup: [
    'Helper dog 100 feet away',
    'Front-clip harness, 6-foot leash',
    'Chicken or hot dog, lots',
  ],
  guide: 'Your starting distance is where they can see the other dog and still eat. Repeat this session 2 or 3 times at that distance before moving closer. Use the best food you have. If they react, never correct it. Add distance instead.',
  successCriteria: 'Move on when they eat calmly in 7 of 10 sightings and turn to you on their own in 4.',
  commonMistakes: [
    'Starting too close. If they can\'t eat, you are too close, so back up.',
    'Correcting a lunge or bark. Say nothing, turn, and add distance.',
    'Using kibble. Bring chicken or hot dog; kibble loses to a real dog.',
    'Surprise dogs on regular walks. Pick quiet routes and times for now.',
  ],
  equipmentNeeded: [
    'Chicken, hot dog, or cheese',
    'Treat pouch',
    'Front-clip harness',
    '6-foot leash',
    'A calm helper dog',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'reactivity_s2',
  trainerNote: 'Never correct a reaction. It makes reactivity worse. More distance and better food fix it.',
  supportsLiveAiTrainer: false,
}

const reactivity_stage2: Protocol = {
  id: 'reactivity_s2',
  behavior: 'leash_reactivity',
  stage: 2,
  title: 'Move closer, 5 feet at a time',
  objective: 'Your dog stays calm with another dog in sight, closer than before.',
  durationMinutes: 12,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Do 5 reps at your current comfortable distance.',
      then: 'Mark each calm look at the other dog, then treat.',
      durationSeconds: null,
      reps: 5,
      tip: null,
      successLook: 'Calm, and checking in with you.'
    },
    {
      order: 2,
      instruction: 'Move 5 feet closer.',
      then: 'Calm and checking in? New distance. Reacting? Back up 10 feet.',
      durationSeconds: null,
      reps: null,
      tip: 'Only 5 feet at a time. Go slow and it sticks; rush it and it slips.',
      successLook: 'Same calm at the closer distance.'
    },
    {
      order: 3,
      instruction: 'When the other dog appears, say "look" in a happy voice.',
      then: 'They look at it, then back at you: mark and treat big.',
      durationSeconds: null,
      reps: 5,
      tip: 'This gives them a job: notice the dog, then check in with you.',
      successLook: 'They look at the dog, then at you.'
    },
    {
      order: 4,
      instruction: 'Walk parallel to the other dog at your comfortable distance.',
      then: 'Treat steadily for 3 minutes.',
      durationSeconds: 180,
      reps: null,
      tip: 'Side by side is easier than facing. Work toward 20 feet over 3 sessions.',
      successLook: '3 minutes beside another dog, no reaction.'
    },
    {
      order: 5,
      instruction: 'In a new place, start farther away than usual.',
      then: 'Do 2 or 3 warm-up reps, then work as usual.',
      durationSeconds: null,
      reps: null,
      tip: 'A new spot means more distance at first. That is normal.',
      successLook: 'Calm and checking in after a few warm-ups.'
    },
    {
      order: 6,
      instruction: 'Walk away from the other dog for a sniff break.',
      then: 'Let them unwind. No more dogs today.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose body, nose down.'
    },
  ],
  setup: [
    'Helper with a calm dog',
    'Front-clip harness on',
    'Treat pouch full',
    'Start at your known distance',
  ],
  successCriteria: 'Move on when they stay calm with a dog 20 feet away, 7 of 10 times, in 2 places.',
  commonMistakes: [
    'Moving closer fast after a good day. Stick to 5 feet per step.',
    'Surprise meetings on everyday walks. Pick quiet routes until this is further along.',
    'Dropping the treats once they seem fine. Keep feeding when dogs appear.',
    'Practicing with only one helper dog. Borrow a few different calm dogs.',
  ],
  equipmentNeeded: [
    'Chicken, hot dog, or cheese',
    'Treat pouch',
    'Front-clip harness or head halter',
    'A calm helper dog and owner',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: 'reactivity_s3',
  trainerNote: 'This takes months. Compare your dog to where they started, not to other dogs.',
  supportsLiveAiTrainer: false,
}

const reactivity_stage3: Protocol = {
  id: 'reactivity_s3',
  behavior: 'leash_reactivity',
  stage: 3,
  title: 'Pass other dogs calmly',
  objective: 'Your dog walks past another dog calmly and, if it suits them, says a short hello.',
  durationMinutes: 12,
  repCount: 8,
  steps: [
    {
      order: 1,
      instruction: 'Pass the helper dog at 10 feet, treating as you go.',
      then: 'Both handlers feed through the pass and keep walking.',
      durationSeconds: null,
      reps: 4,
      tip: 'Close the gap to 6 feet over several sessions, never within one.',
      successLook: 'Loose leash, no reaction, eating through the pass.'
    },
    {
      order: 2,
      instruction: 'Walk parallel to the helper dog at 10 feet.',
      then: 'Both dogs moving, both handlers treating steadily.',
      durationSeconds: 60,
      reps: null,
      tip: 'Calm passing at 6 feet is the goal. Greetings are optional.',
      successLook: 'They walk, eat, and glance calmly at the other dog.'
    },
    {
      order: 3,
      instruction: 'If greeting suits your dog, curve in; never approach head-on.',
      then: 'Allow a 3-second sniff, say "let\'s go", walk off treating.',
      durationSeconds: null,
      reps: 3,
      tip: 'To a dog, walking straight at them is rude. Curve in from the side.',
      successLook: 'Brief sniff, then walks away without lunging.'
    },
    {
      order: 4,
      instruction: 'Count the sniff: 1, 2, 3, then "let\'s go."',
      then: 'Leave sooner if leashes tangle or either dog goes stiff.',
      durationSeconds: null,
      reps: 3,
      tip: 'Say hi, then go. Leave before anyone gets uncomfortable.',
      successLook: 'Both dogs move on with loose leashes.'
    },
    {
      order: 5,
      instruction: 'Pass the helper dog at 6 feet, no greeting.',
      then: 'Treat through the pass and keep walking.',
      durationSeconds: null,
      reps: 3,
      tip: 'Dogs who expect to greet every dog get frustrated when they can\'t.',
      successLook: 'No reaction and no attempt to greet.'
    },
    {
      order: 6,
      instruction: 'Walk away from the helper dog and let them sniff.',
      then: 'No cues. Loose leash, quiet spot.',
      durationSeconds: 60,
      reps: null,
      tip: 'Sniffing after every dog session helps them wind down.',
      successLook: 'Loose body, nose down.'
    },
  ],
  setup: [
    'Calm helper dog and handler',
    'Front-clip harness, 6-foot leash',
    'Best treats in pouch',
  ],
  successCriteria: 'Move on when they pass calmly at 6 feet 6 of 8 times and greet without lunging 4 of 8.',
  commonMistakes: [
    'Walking straight at the other dog. Curve in from the side.',
    'Letting greetings run past 3 seconds. Count it out, then walk away.',
    'Thinking every dog must be greeted. Passing calmly is enough.',
    'Dropping the treats once passing goes well. Keep feeding through every pass.',
  ],
  equipmentNeeded: [
    'Chicken, hot dog, or cheese',
    'Treat pouch',
    'Front-clip harness',
    '6-foot leash',
    'A calm helper dog',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 4,
  nextProtocolId: null,
  trainerNote: 'Plenty of reactive dogs never greet on leash, and that\'s fine. Calm passing is the goal.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// SIT
// ─────────────────────────────────────────────────────────────────────────────

const sit_stage1: Protocol = {
  id: 'sit_s1',
  behavior: 'sit',
  stage: 1,
  title: 'Sit on the word',
  objective: 'Your dog sits the first time you say "sit", within 2 seconds, no food showing.',
  durationMinutes: 7,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Hold a treat at their nose and lift it back.',
      then: 'The instant their rear touches the floor, mark and treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Keep the treat at nose height. Too high and they jump.',
      successLook: 'A clean sit, no jumping or backing up.'
    },
    {
      order: 2,
      instruction: 'Same hand motion, no treat in that hand.',
      then: 'When they sit, mark and treat from your pouch.',
      durationSeconds: null,
      reps: 10,
      tip: 'If they only sit when they see food, they\'re following food, not your hand.',
      successLook: 'They sit for the empty hand signal.'
    },
    {
      order: 3,
      instruction: 'Say "sit" once, then give the hand signal.',
      then: 'After 5 pairs, try the word alone. Pay big if they sit.',
      durationSeconds: null,
      reps: 5,
      tip: 'Say it once and wait. Repeating teaches them the first one doesn\'t count.',
      successLook: 'They sit on the word, hands at your sides.'
    },
    {
      order: 4,
      instruction: 'Let them sniff freely for a minute.',
      then: 'Say "free" and follow them. No cues, no treats.',
      durationSeconds: 60,
      reps: null,
      tip: 'The sniff break is a reward, and it makes the next session easier.',
      successLook: 'They wander and sniff, relaxed.'
    },
  ],
  setup: [
    'Quiet room',
    'Tiny treats in a pouch',
  ],
  successCriteria: 'Move on when they sit on the word alone within 2 seconds, 15 of 20 reps.',
  commonMistakes: [
    'Keeping food in the luring hand too long. Empty it after rep 5.',
    'Saying sit twice. Say it once, then wait.',
    'Pushing their rear down. Let them work it out, and mark when they do.',
    'Paying a half-sit hover. Wait for their rear on the floor.',
  ],
  equipmentNeeded: [
    'Small, soft treats',
    'Treat pouch',
    'Quiet room',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'sit_s2',
  trainerNote: 'Most dogs get this in a few short sessions. Hold out for 15 of 20 before moving on.',
  supportsLiveAiTrainer: true,
}

const sit_stage2: Protocol = {
  id: 'sit_s2',
  behavior: 'sit',
  stage: 2,
  title: 'Sit and stay put',
  objective: 'Your dog holds a sit for 20 seconds, or with you 6 feet away, until released.',
  durationMinutes: 9,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'Cue sit, then say "stay" with your palm out.',
      then: 'Count 3 seconds, mark while they\'re still sitting, then treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Marking while they sit tells them the sit earned the treat.',
      successLook: 'Holds the sit 3 seconds, no shuffling.'
    },
    {
      order: 2,
      instruction: 'Vary the count: 3, 6, 4, 10, 15, 20 seconds.',
      then: 'Mark, treat, then release with "free" every rep.',
      durationSeconds: null,
      reps: 8,
      tip: 'Mix short and long. A dog expecting release at 10 breaks at 11.',
      successLook: 'Holds a sit-stay 20 seconds, you in front.'
    },
    {
      order: 3,
      instruction: 'Take one step back, then return.',
      then: 'Treat in position. Add a step each rep, up to 6 feet.',
      durationSeconds: null,
      reps: 5,
      tip: 'Always walk back to treat. Calling them teaches them to leave the sit.',
      successLook: 'Sit-stay holds while you go 6 feet and back.'
    },
    {
      order: 4,
      instruction: 'Say "free" and take a play break.',
      then: 'No cues. Let them move.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose and happy.'
    },
  ],
  setup: [
    'Quiet room',
    'Treat pouch on',
    'Space to step back',
  ],
  successCriteria: 'Move on when they hold 20 seconds close, 10 of 15, and 10 seconds at 6 feet, 8 of 15.',
  commonMistakes: [
    'Adding time and distance in the same rep. Build one, then the other.',
    'Calling them to you for the treat. Walk back and treat in the sit.',
    'Letting them decide when it\'s over. End every stay with "free".',
  ],
  equipmentNeeded: [
    'Small, soft treats',
    'Treat pouch',
    'Room to step back',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'sit_s3',
  trainerNote: 'Time first, then distance, then distractions. Add one at a time.',
  supportsLiveAiTrainer: true,
}

const sit_stage3: Protocol = {
  id: 'sit_s3',
  behavior: 'sit',
  stage: 3,
  title: 'Sit with distractions around',
  objective: 'Your dog sits on one cue outdoors and before the everyday things they want.',
  durationMinutes: 10,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'In the driveway, say "sit" once, hands at your sides.',
      then: 'Sit within 3 seconds? Mark and treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'A new place makes it harder again. Start easy.',
      successLook: 'Sits on the word outdoors within 3 seconds.'
    },
    {
      order: 2,
      instruction: 'Cue sit-stay. A helper walks past 10 feet away.',
      then: 'Treat for holding. Over the reps, bring the helper to 5 feet.',
      durationSeconds: null,
      reps: 5,
      tip: 'Start easy: a calm person far away, then closer.',
      successLook: 'They hold while a person passes at 5 feet.'
    },
    {
      order: 3,
      instruction: 'Cue sit-stay. The helper jogs past at 5 feet.',
      then: 'Treat for holding, then release with "free".',
      durationSeconds: null,
      reps: 3,
      tip: 'If they break, slow the helper down or add distance.',
      successLook: 'Sit holds as a jogger goes by.'
    },
    {
      order: 4,
      instruction: 'Cue sit-stay. The helper passes, squeaking a toy.',
      then: 'Treat for holding, then release with "free".',
      durationSeconds: null,
      reps: 3,
      tip: 'If they break, the toy was too loud or too close.',
      successLook: 'Sit holds through the squeak.'
    },
    {
      order: 5,
      instruction: 'Release with "free" and a sniff break.',
      then: 'Nothing more asked. Let them unwind.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose body, nose down.'
    },
  ],
  setup: [
    'Driveway or front walk',
    'Best treats, in a pouch',
    'Helper for the passing steps',
  ],
  guide: 'Ask for a sit at five moments each day: leash on, bowl down, greeting a visitor, at the curb, and at the car door. The reward is whatever they wanted next. For three days, note each sit cue. Aim for 9 of 10 on the first cue, within 2 seconds.',
  successCriteria: 'Move on when they sit on first cue outside 12 of 15 times and unasked at 4 of 5 routines.',
  commonMistakes: [
    'Only asking for sit during sessions. Use it all day, before things they want.',
    'Letting a slow sit slide once they know it. Keep the 3-second standard.',
    'Practicing in one place. Try the driveway, the sidewalk, a friend\'s yard.',
    'Asking for sit constantly for nothing. Make each sit earn something.',
  ],
  equipmentNeeded: [
    'Treat pouch',
    'Small, soft treats',
    'A helper',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: null,
  trainerNote: 'Ask for a sit before meals and doorways for two weeks. It turns into their habit.',
  supportsLiveAiTrainer: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// DOWN (LIE DOWN)
// ─────────────────────────────────────────────────────────────────────────────

const down_stage1: Protocol = {
  id: 'down_s1',
  behavior: 'down',
  stage: 1,
  title: 'Down on the word',
  objective: 'Your dog lies all the way down the first time you say "down", within 3 seconds.',
  durationMinutes: 8,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'From a sit, lure to the floor, then slide it out.',
      then: 'The instant elbows touch, mark and treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Go slow. Move the treat too fast and they stand up.',
      successLook: 'Elbows down, hips follow into a full down.'
    },
    {
      order: 2,
      instruction: 'Same floor motion, no treat in that hand.',
      then: 'When elbows land, mark and give 3 treats from your pouch.',
      durationSeconds: null,
      reps: 10,
      tip: 'Pay the down with 2 or 3 treats. It\'s a big ask for many dogs.',
      successLook: 'They lie down for the empty hand signal.'
    },
    {
      order: 3,
      instruction: 'Say "down" once, then give the hand signal.',
      then: 'After 5 pairs, try the word alone. Pay big if they do.',
      durationSeconds: null,
      reps: 5,
      tip: 'Down should mean one thing. Use another word for off the couch.',
      successLook: 'They lie down on the word, hands at your sides.'
    },
    {
      order: 4,
      instruction: 'Let them sniff freely for a minute.',
      then: 'Say "free" and follow them. No cues, no treats.',
      durationSeconds: 60,
      reps: null,
      tip: 'The sniff break is a reward, and it makes the next session easier.',
      successLook: 'They wander and sniff, relaxed.'
    },
  ],
  setup: [
    'Rug or non-slip floor',
    'Tiny treats in a pouch',
    'Quiet room',
  ],
  successCriteria: 'Move on when they lie fully down on the word alone within 3 seconds, 15 of 20 reps.',
  commonMistakes: [
    'Luring from standing. Start from a sit; it\'s an easier path down.',
    'Marking before the elbows touch. Wait for elbows on the floor.',
    'Using "down" for off the couch too. Pick another word, like "off".',
    'Sliding the treat along the floor too fast. Go slow so they follow.',
  ],
  equipmentNeeded: [
    'Small, soft treats',
    'Treat pouch',
    'A rug, for hesitant dogs',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'down_s2',
  trainerNote: 'Down is harder than sit because lying down feels exposed. Go slower and pay any downward move.',
  supportsLiveAiTrainer: true,
}

const down_stage2: Protocol = {
  id: 'down_s2',
  behavior: 'down',
  stage: 2,
  title: 'Stay down and relax',
  objective: 'Your dog holds a relaxed down for 45 seconds, hips rolled to one side.',
  durationMinutes: 10,
  repCount: 12,
  steps: [
    {
      order: 1,
      instruction: 'Cue down, then say "stay".',
      then: 'Walk a treat to them every 10 seconds, then release with "free".',
      durationSeconds: null,
      reps: 5,
      tip: 'Build from 10 to 30 seconds over the reps. Never call them to you.',
      successLook: 'Down-stay holds 30 seconds, treats in position.'
    },
    {
      order: 2,
      instruction: 'Hold the treat low, off to one side of them.',
      then: 'They turn their head. Pay big for any hip roll.',
      durationSeconds: null,
      reps: 5,
      tip: 'A hip-rolled down is comfortable to hold. A tense sphinx isn\'t settled yet.',
      successLook: 'Hips rolled to one side, fully relaxed.'
    },
    {
      order: 3,
      instruction: 'Hold the down-stay for 45 seconds.',
      then: 'Treat at random gaps, 8 to 20 seconds, then "free".',
      durationSeconds: 45,
      reps: null,
      tip: 'Random gaps keep them waiting, since they can\'t guess the next treat.',
      successLook: 'Relaxed down-stay for 45 seconds.'
    },
    {
      order: 4,
      instruction: 'Say "free" and take a sniff or play break.',
      then: 'Off the mat, no rules.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Dog gets up only on the release.'
    },
  ],
  setup: [
    'Mat or soft surface',
    'Treat pouch on',
    'Timer ready',
  ],
  successCriteria: 'Move on when they hold a relaxed down for 45 seconds, you walking treats to them, 9 of 12.',
  commonMistakes: [
    'Accepting a tense, alert down. Wait for the hips to roll over.',
    'Calling them to you for the treat. Walk the treat to them.',
    'Adding time too fast. Go up 5 or 10 seconds at a time.',
    'Letting them get up on their own. End every stay with "free".',
  ],
  equipmentNeeded: [
    'Small, soft treats',
    'Treat pouch',
    'Mat or soft surface',
    'Timer',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'down_s3',
  trainerNote: 'Once they can relax in a down on cue, cafes and vet waiting rooms get much easier.',
  supportsLiveAiTrainer: true,
}

const down_stage3: Protocol = {
  id: 'down_s3',
  behavior: 'down',
  stage: 3,
  title: 'Down from farther away',
  objective: 'Your dog lies down on the word from 8 feet away, in new places too.',
  durationMinutes: 12,
  repCount: 12,
  steps: [
    {
      order: 1,
      instruction: 'From 3 feet, say "down" once.',
      then: 'Walk back to treat. Add distance each rep, up to 8 feet.',
      durationSeconds: null,
      reps: 5,
      tip: 'Down from 8 feet on voice means they know the word, not your hand.',
      successLook: 'They lie down with you 8 feet away.'
    },
    {
      order: 2,
      instruction: 'In a new place, do 2 easy warm-up downs.',
      then: 'Treat both, then start the real reps.',
      durationSeconds: null,
      reps: 3,
      tip: 'Two easy reps get them going in a new place. Don\'t skip them.',
      successLook: 'Down on the word, away from home.'
    },
    {
      order: 3,
      instruction: 'In that new place, cue down and wait 30 seconds.',
      then: 'Treat at the end, then release with "free".',
      durationSeconds: 30,
      reps: null,
      tip: 'Backyard, porch, cafe patio: 3 new places before moving on.',
      successLook: '30-second down-stay away from home.'
    },
    {
      order: 4,
      instruction: 'Cue down-stay. A helper walks past 10 feet away.',
      then: 'Treat after 20 seconds. Move the helper to 5 feet over reps.',
      durationSeconds: null,
      reps: 5,
      tip: 'Start easy. 3 clean reps before making it harder.',
      successLook: '20-second down while someone passes at 5 feet.'
    },
    {
      order: 5,
      instruction: 'Cue down-stay. The helper jogs past at 5 feet.',
      then: 'Treat for holding, then release with "free".',
      durationSeconds: null,
      reps: 3,
      tip: 'If they break, slow the helper down or add distance.',
      successLook: 'Down holds as a jogger goes by.'
    },
    {
      order: 6,
      instruction: 'Cue down-stay. The helper walks past with a dog.',
      then: 'Treat for holding, then release with "free".',
      durationSeconds: null,
      reps: 3,
      tip: 'This is the hardest one. Add distance if they get up.',
      successLook: 'Down holds as the other dog passes.'
    },
    {
      order: 7,
      instruction: 'Release with "free" and a sniff break.',
      then: 'Nothing more asked. Let them unwind.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose body, nose down.'
    },
  ],
  setup: [
    'Pouch with your best treats',
    'Helper for the passing steps',
    'Mat, optional',
  ],
  successCriteria: 'Move on when they down from 8 feet, 9 of 12, and hold 20 seconds near passers-by in 3 places.',
  commonMistakes: [
    'Only practicing up close. Add a step of distance each rep.',
    'Skipping warm-up reps in a new place. Do 2 easy ones first.',
    'Adding distractions before distance and time are steady. One at a time.',
    'Only practicing indoors. Try the yard, the porch, a cafe patio.',
  ],
  equipmentNeeded: [
    'Treat pouch',
    'Small, soft treats',
    'Mat (optional)',
    'A helper',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'Once this holds up in new places, a down is how you get your dog to settle anywhere.',
  supportsLiveAiTrainer: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// HEEL
// ─────────────────────────────────────────────────────────────────────────────

const heel_stage1: Protocol = {
  id: 'heel_s1',
  behavior: 'heel',
  stage: 1,
  title: 'Find the spot by your hip',
  objective: 'Your dog comes to your left side, shoulder at your hip, when you say "heel".',
  durationMinutes: 8,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Stand still, treat at your left hip, fingers down.',
      then: 'When their shoulder is by your leg, mark and treat there.',
      durationSeconds: null,
      reps: 8,
      tip: 'Treat at your left hip every time. That\'s where the good stuff happens.',
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
      instruction: 'Say "heel" as they move into position.',
      then: 'Mark and treat at the hip.',
      durationSeconds: null,
      reps: 5,
      tip: 'Heel means left side, shoulder at your hip, facing forward. Keep it exact.',
      successLook: 'They hear the word as they arrive at your hip.'
    },
    {
      order: 4,
      instruction: 'Stand still and say "heel" once.',
      then: 'Wait. When they move to your left hip, mark and treat.',
      durationSeconds: null,
      reps: 5,
      tip: null,
      successLook: 'They find the spot without a lure.'
    },
    {
      order: 5,
      instruction: 'Let them sniff freely for a minute.',
      then: 'Say "free" and follow them. No cues, no treats.',
      durationSeconds: 60,
      reps: null,
      tip: 'The sniff break is a reward, and it makes the next session easier.',
      successLook: 'They wander and sniff, relaxed.'
    },
  ],
  setup: [
    'Pouch on your left hip',
    'Flat collar or front-clip harness',
    '6-foot leash, loose',
  ],
  successCriteria: 'Move on when they get into heel within 3 seconds of the cue, 15 of 20, you standing still.',
  commonMistakes: [
    'Treating in front of you. Treat at your left hip, where you want them.',
    'Paying when they\'re ahead of or behind your leg. Wait for shoulder at hip.',
    'Adding steps too soon. Get the standing position first.',
    'Mixing heel with loose leash walking. Heel is exact; a loose leash walk isn\'t.',
  ],
  equipmentNeeded: [
    'Small, soft treats',
    'Treat pouch on your left hip',
    'Flat collar or front-clip harness',
    '6-foot leash',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'heel_s2',
  trainerNote: 'Heel means left side, shoulder at your hip. Loose leash walking is a separate skill; keep them apart.',
  supportsLiveAiTrainer: true,
}

const heel_stage2: Protocol = {
  id: 'heel_s2',
  behavior: 'heel',
  stage: 2,
  title: 'Heel on the move',
  objective: 'Your dog stays at your hip as you speed up, slow down, turn, and stop.',
  durationMinutes: 10,
  repCount: 12,
  steps: [
    {
      order: 1,
      instruction: 'From heel, walk 3 steps and stop.',
      then: 'Still in position? Mark and treat at your hip.',
      durationSeconds: null,
      reps: 6,
      tip: 'Add steps each rep, 3 to 10. If they drift, stop and start over.',
      successLook: 'Shoulder at your hip through 10 steps.'
    },
    {
      order: 2,
      instruction: 'Walk 5 steps, then speed up.',
      then: 'Mark when they match you. Then slow to a crawl and mark.',
      durationSeconds: null,
      reps: 5,
      tip: 'Changing speed keeps them watching you.',
      successLook: 'They match every speed change right away.'
    },
    {
      order: 3,
      instruction: 'Make a right turn, then a U-turn.',
      then: 'Mark each turn finished with them still at your hip.',
      durationSeconds: null,
      reps: 3,
      tip: 'U-turns are the quickest way to get their attention back.',
      successLook: 'Dog stays at your hip through both turns.'
    },
    {
      order: 4,
      instruction: 'Make a small, deliberate left turn.',
      then: 'Mark and treat well when they shift their rear to make room.',
      durationSeconds: null,
      reps: 3,
      tip: 'This is the hardest turn because you turn into them. Don\'t step on them.',
      successLook: 'They shift and stay in position on a left turn.'
    },
    {
      order: 5,
      instruction: 'Say "free" and let them sniff on a loose leash.',
      then: 'No heel, no cues.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Dog relaxed, nose down.'
    },
  ],
  setup: [
    'Pouch on your left hip',
    'Flat collar or front-clip harness',
    'Quiet space',
  ],
  successCriteria: 'Move on when they hold heel for 20 steps with one speed change and one turn, 8 of 12.',
  commonMistakes: [
    'Walking too many steps between treats. Keep stretches short and treat often.',
    'Walking on when they drift. Stop, reset, and start again.',
    'Always walking the same speed. Change pace; it keeps them watching you.',
    'Stepping on them in left turns. Turn small and slow.',
  ],
  equipmentNeeded: [
    'Small, soft treats',
    'Treat pouch on your left hip',
    'Flat collar or front-clip harness',
    'Quiet space',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: 'heel_s3',
  trainerNote: 'Heeling works when they watch you for what\'s next. Treat often while you build it.',
  supportsLiveAiTrainer: true,
}

const heel_stage3: Protocol = {
  id: 'heel_s3',
  behavior: 'heel',
  stage: 3,
  title: 'Heel on the street',
  objective: 'Your dog heels 60 steps indoors and holds heel outside with people and dogs nearby.',
  durationMinutes: 12,
  repCount: 10,
  steps: [
    {
      order: 1,
      instruction: 'Heel indoors: start at 10 steps, add 5 each session.',
      then: 'Treat at random, sometimes after 10 steps, sometimes after 25.',
      durationSeconds: null,
      reps: 5,
      tip: 'Random treats keep them heeling. They never know when the next one comes.',
      successLook: 'Holds position the whole way, no breaking.'
    },
    {
      order: 2,
      instruction: 'Heel in 5-step stretches, driveway first, then a quiet sidewalk.',
      then: 'Treat each stretch. Praise big when they look up at you.',
      durationSeconds: null,
      reps: 5,
      tip: 'Expect it to slip outdoors. Bring better treats than indoors.',
      successLook: '20 steps of heel on a quiet street.'
    },
    {
      order: 3,
      instruction: 'Heel while a helper walks the same way across the street.',
      then: 'Treat every few steps for holding position.',
      durationSeconds: null,
      reps: 3,
      tip: 'Someone walking alongside is the most common heel test on a street.',
      successLook: '20 steps of heel with a person across the street.'
    },
    {
      order: 4,
      instruction: 'Same walk. The helper is now 10 feet away.',
      then: 'Treat every few steps for holding position.',
      durationSeconds: null,
      reps: 3,
      tip: 'Closer is harder. If they lose position, widen the gap.',
      successLook: '20 steps of heel with a person 10 feet away.'
    },
    {
      order: 5,
      instruction: 'Same walk. The helper now has a dog with them.',
      then: 'Treat every few steps for holding position.',
      durationSeconds: null,
      reps: 3,
      tip: 'Add distance if they fixate on the other dog.',
      successLook: 'Heel holds with another dog 10 feet away.'
    },
    {
      order: 6,
      instruction: 'Same walk. The helper stops, jogs, and turns at random.',
      then: 'Treat every few steps for holding position.',
      durationSeconds: null,
      reps: 3,
      tip: 'It\'s like walking down a busy sidewalk.',
      successLook: 'Heel holds as someone moves unpredictably.'
    },
    {
      order: 7,
      instruction: 'From a sit at heel, say "heel", then step off left.',
      then: 'Mark when they move with you. Treat after 3 steps.',
      durationSeconds: null,
      reps: 3,
      tip: 'Left foot first means come with me. Right foot first means stay.',
      successLook: 'They step off the moment your left foot moves.'
    },
    {
      order: 8,
      instruction: 'Release with "free" and a sniff break.',
      then: 'Nothing more asked. Let them unwind.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose body, nose down.'
    },
  ],
  setup: [
    'Best treats in a pouch',
    'Collar or front-clip harness',
    '6-foot leash',
    'Open outdoor space',
  ],
  successCriteria: 'Move on when they heel 60 steps indoors, then 20 outside with a person 10 feet away, 7 of 10.',
  commonMistakes: [
    'Adding length and going outside in the same session. Change one at a time.',
    'Treating as rarely outside as you do indoors. Treat more often outdoors.',
    'Walking on when they drift out of heel. Stop, reset, start again.',
    'Expecting show-ring precision from a pet. Close to your hip is good enough.',
  ],
  equipmentNeeded: [
    'Treat pouch on your left hip',
    'Your best treats',
    'Flat collar or front-clip harness',
    '6-foot leash',
    'Open outdoor space',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 4,
  nextProtocolId: null,
  trainerNote: 'Outside, expect heel to fall apart at first. Use better treats and shorter stretches.',
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
