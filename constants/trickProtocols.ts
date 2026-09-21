/**
 * Trick courses.
 *
 * Six tricks x three stages, in the exact `Protocol` shape used by
 * constants/protocols.ts and written to docs/EXERCISE-DESIGN.md:
 *   - Do (instruction) <= 12 words, Then <= 12, Why (tip) <= 16, Success <= 10
 *   - one criterion raised per step
 *   - reps, not minutes, as the unit; every rep is a reward
 *   - 80 percent rule in successCriteria
 *   - every session ends on a free sniff or play release
 *   - sessions of 5 to 6 minutes
 *
 * Merged into PROTOCOLS and EXERCISE_TO_PROTOCOL by constants/protocols.ts.
 * This file imports only the `Protocol` type from there (`import type`), so the
 * two modules do not form a runtime cycle. See docs/TRICKS-DRAFT.md for the
 * list of places a course is registered, and for the content a certified
 * trainer should still review.
 *
 * Physical safety: bow, roll over, leg weave and high five load joints or the
 * spine. Their setup lists, trainer notes and common mistakes carry the
 * cautions; keep them if the copy is edited.
 */

import type { Protocol } from './protocols.ts'

// ─────────────────────────────────────────────────────────────────────────────
// TOUCH (HAND TARGET)
// ─────────────────────────────────────────────────────────────────────────────

const touch_stage1: Protocol = {
  id: 'touch_s1',
  behavior: 'touch',
  stage: 1,
  title: 'Nose to your palm',
  objective: 'Your dog bumps their nose against your open palm the moment you offer it.',
  durationMinutes: 5,
  repCount: 30,
  steps: [
    {
      order: 1,
      instruction: 'Hold your flat palm 2 inches from their nose.',
      then: 'The instant their nose bumps it, mark and treat.',
      durationSeconds: null,
      reps: 10,
      tip: 'Take the hand away between reps. A hand that reappears is worth checking.',
      successLook: 'Nose bumps your palm within 3 seconds.'
    },
    {
      order: 2,
      instruction: 'Hold your palm 6 inches away, off to one side.',
      then: 'Mark the nose bump. Treat from your other hand.',
      durationSeconds: null,
      reps: 10,
      tip: 'Pay from the other hand so the target hand never smells of food.',
      successLook: 'They reach or step over to touch it.'
    },
    {
      order: 3,
      instruction: 'Say "touch" once, then present your palm.',
      then: 'Mark the bump and treat from your other hand.',
      durationSeconds: null,
      reps: 10,
      tip: 'Add the word only once they already bump the hand every time.',
      successLook: 'They bump your palm right after the word.'
    },
    {
      order: 4,
      instruction: 'Let them sniff freely for a minute.',
      then: 'Say "free" and follow them. No cues, no treats.',
      durationSeconds: 60,
      reps: null,
      tip: 'Stopping while it is still fun makes them keen for the next session.',
      successLook: 'They wander and sniff, relaxed.'
    },
  ],
  setup: [
    'Quiet room',
    '30 tiny treats in a pouch or pocket',
    'One hand empty for the target',
  ],
  successCriteria: 'Move on when they bump your palm within 3 seconds of the word, 8 times out of 10.',
  commonMistakes: [
    'Pushing your hand into their nose. Hold still and let them come to it.',
    'Marking a sniff near the hand. Wait for real contact.',
    'Leaving the hand out between reps. Pull it back, then present it fresh.',
    'Holding the treat in the target hand. Pay from the other hand.',
  ],
  equipmentNeeded: [
    'Small, soft treats',
    'Treat pouch',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'touch_s2',
  trainerNote: 'Touch is the most useful trick there is. It turns into a recall, a way past distractions, and a gentle way to move your dog.',
  supportsLiveAiTrainer: false,
}

const touch_stage2: Protocol = {
  id: 'touch_s2',
  behavior: 'touch',
  stage: 2,
  title: 'Follow the hand',
  objective: 'Your dog crosses the room to touch either hand, even when the hand is moving.',
  durationMinutes: 6,
  repCount: 30,
  steps: [
    {
      order: 1,
      instruction: 'Say "touch" and present your palm 3 feet away.',
      then: 'Mark and treat when they walk over and bump it.',
      durationSeconds: null,
      reps: 10,
      tip: 'If they stare at the treat hand, put it behind your back.',
      successLook: 'They walk 3 feet to touch your palm.'
    },
    {
      order: 2,
      instruction: 'Say "touch" and present your palm 6 feet away.',
      then: 'Mark the bump and treat from your other hand.',
      durationSeconds: null,
      reps: 5,
      tip: 'Toss the treat away after each rep. It resets them at a distance.',
      successLook: 'They trot 6 feet to touch your palm.'
    },
    {
      order: 3,
      instruction: 'Walk backward 3 steps with your palm out.',
      then: 'Mark and treat when they catch up and touch.',
      durationSeconds: null,
      reps: 5,
      tip: 'Chasing a moving hand is how touch becomes a recall.',
      successLook: 'They follow and bump your moving hand.'
    },
    {
      order: 4,
      instruction: 'Stand still and offer your other hand as the target.',
      then: 'Mark and treat each bump. Start close again.',
      durationSeconds: null,
      reps: 10,
      tip: 'Dogs do not generalize well. To them, the other hand is a new game.',
      successLook: 'They touch either hand on the word.'
    },
    {
      order: 5,
      instruction: 'Say "free" and take a sniff or play break.',
      then: 'Nothing more asked. Let them unwind.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose body, nose down.'
    },
  ],
  setup: [
    'Room or hallway with 6 feet of clear floor',
    '30 tiny treats in a pouch',
    'Non-slip floor if they tend to run',
  ],
  successCriteria: 'Move on when they cross 6 feet to touch either hand on the word, 8 times out of 10.',
  commonMistakes: [
    'Jumping from 6 inches to 6 feet. Add distance a step at a time.',
    'Holding the target above their head. Keep it at nose height; no jumping.',
    'Waving the hand to get attention. Present it once and hold still.',
    'Forgetting the second hand. Teach both so either one works later.',
  ],
  equipmentNeeded: [
    'Small, soft treats',
    'Treat pouch',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'touch_s3',
  trainerNote: 'Keep the target at nose height. Asking a dog to leap for a hand is hard on joints and teaches jumping at people.',
  supportsLiveAiTrainer: false,
}

const touch_stage3: Protocol = {
  id: 'touch_s3',
  behavior: 'touch',
  stage: 3,
  title: 'Touch anywhere',
  objective: 'Your dog touches your hand on one cue in new places and past mild distractions.',
  durationMinutes: 6,
  repCount: 25,
  steps: [
    {
      order: 1,
      instruction: 'In a new room, present your palm close and say "touch".',
      then: 'Mark and treat. Start easy, as if it were day one.',
      durationSeconds: null,
      reps: 5,
      tip: 'A new place makes old skills feel new. Easy reps first.',
      successLook: 'They touch in the new room without hesitating.'
    },
    {
      order: 2,
      instruction: 'Outside on leash, in a quiet spot, say "touch" once.',
      then: 'Mark the bump and pay with your best treats.',
      durationSeconds: null,
      reps: 10,
      tip: 'The job is harder outside, so the pay should be better.',
      successLook: 'They turn from the ground to touch your hand.'
    },
    {
      order: 3,
      instruction: 'Put a toy on the floor 6 feet away. Say "touch".',
      then: 'Mark and treat for choosing your hand.',
      durationSeconds: null,
      reps: 5,
      tip: 'If they go to the toy, say nothing and move farther from it.',
      successLook: 'They glance at the toy, then touch your hand.'
    },
    {
      order: 4,
      instruction: 'Have a helper your dog likes offer a palm and say "touch".',
      then: 'The helper marks the bump. You deliver the treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Only with people they already like. Shy dogs can skip this step.',
      successLook: 'They walk over and bump the helper\'s hand.'
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
    'Your best treats in a pouch',
    'Leash for the outdoor step',
    'One toy they like but do not obsess over',
    'Helper, optional',
  ],
  successCriteria: 'Done when they touch on one cue outdoors and with a toy nearby, 8 times out of 10.',
  commonMistakes: [
    'Repeating "touch" when they are distracted. Say it once, then make it easier.',
    'Using indoor treats outdoors. Bring better pay for harder places.',
    'Putting the toy too close. Start 6 feet away or more.',
    'Asking a nervous dog to touch strangers. It is their choice, always.',
  ],
  equipmentNeeded: [
    'High-value treats',
    'Treat pouch',
    '4 to 6-foot leash',
    'A toy',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: null,
  trainerNote: 'Once touch works outside, use it on walks: past a dropped sandwich, onto the vet scale, back to your side.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// SPIN
// ─────────────────────────────────────────────────────────────────────────────

const spin_stage1: Protocol = {
  id: 'spin_s1',
  behavior: 'spin',
  stage: 1,
  title: 'Follow the treat around',
  objective: 'Your dog turns one full circle, following a treat held at nose height.',
  durationMinutes: 5,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'With them standing, lure their nose a quarter turn toward their tail.',
      then: 'Mark and treat the moment their head follows.',
      durationSeconds: null,
      reps: 5,
      tip: 'Keep the treat at nose height. Too high and they sit or jump.',
      successLook: 'Head and shoulders bend to follow the treat.'
    },
    {
      order: 2,
      instruction: 'Lure a half circle, so they face away from you.',
      then: 'Mark and treat at the halfway point.',
      durationSeconds: null,
      reps: 5,
      tip: 'Go slow enough that their nose stays glued to the treat.',
      successLook: 'Front feet step around to face backward.'
    },
    {
      order: 3,
      instruction: 'Lure the full circle, back to facing you.',
      then: 'Mark as they finish the circle, then treat.',
      durationSeconds: null,
      reps: 10,
      tip: 'Turn the same way every time for now. The other way comes later.',
      successLook: 'One smooth circle, all four feet moving.'
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
    'Space to turn without bumping furniture',
    '20 tiny treats',
  ],
  successCriteria: 'Move on when they follow the treat through a full circle, 8 times out of 10.',
  commonMistakes: [
    'Holding the treat too high. Keep it level with their nose.',
    'Circling too fast. Slow down until their nose stays on the treat.',
    'Spinning rep after rep with no pause. Wait a few seconds between circles.',
    'Working on a slippery floor. Use a rug so their feet grip.',
  ],
  equipmentNeeded: [
    'Small, soft treats',
    'Treat pouch',
    'A rug, on hard floors',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'spin_s2',
  trainerNote: 'Spin is easy on most bodies. For dogs with back, neck, or balance problems, ask your vet first and keep the circle wide.',
  supportsLiveAiTrainer: false,
}

const spin_stage2: Protocol = {
  id: 'spin_s2',
  behavior: 'spin',
  stage: 2,
  title: 'Spin on the word',
  objective: 'Your dog spins a full circle when you say "spin", with your hands still.',
  durationMinutes: 6,
  repCount: 30,
  steps: [
    {
      order: 1,
      instruction: 'Draw the same circle with an empty hand.',
      then: 'Mark the full circle, then treat from your other hand.',
      durationSeconds: null,
      reps: 10,
      tip: 'Going empty-handed early stops the treat becoming part of the cue.',
      successLook: 'They circle for the empty hand.'
    },
    {
      order: 2,
      instruction: 'Shrink the circle to a small flick of your finger.',
      then: 'Mark and treat each full spin.',
      durationSeconds: null,
      reps: 5,
      tip: 'Shrink a little each rep. If they stall, go back to a bigger circle.',
      successLook: 'They spin for a small finger circle.'
    },
    {
      order: 3,
      instruction: 'Say "spin" once, pause a second, then give the finger signal.',
      then: 'Mark and treat the full spin.',
      durationSeconds: null,
      reps: 10,
      tip: 'Word first, then signal. Given together, they only notice your hand.',
      successLook: 'They start turning before your hand moves.'
    },
    {
      order: 4,
      instruction: 'Say "spin" once and keep your hands still.',
      then: 'Wait 3 seconds. Pay big if they turn.',
      durationSeconds: null,
      reps: 5,
      tip: 'No spin? Help with the signal, then try the word alone again.',
      successLook: 'A full spin on the word, hands at your sides.'
    },
    {
      order: 5,
      instruction: 'Say "free" and take a sniff or play break.',
      then: 'Nothing more asked. Let them unwind.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose body, nose down.'
    },
  ],
  setup: [
    'Rug or non-slip floor',
    'Treats in a pouch, not in your hand',
    'Quiet room',
  ],
  successCriteria: 'Move on when they spin on the word alone, hands still, 8 times out of 10.',
  commonMistakes: [
    'Saying the word and moving your hand together. Word, pause, then signal.',
    'Repeating "spin" while they think. Say it once and wait 3 seconds.',
    'Dropping the signal all at once. Shrink it over several reps.',
    'Spinning rep after rep with no pause. Wait a few seconds between circles.',
  ],
  equipmentNeeded: [
    'Small, soft treats',
    'Treat pouch',
    'A rug, on hard floors',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'spin_s3',
  trainerNote: 'Excitable dogs can wind themselves up spinning. Keep reps spaced out, and pay with calm treats rather than wild praise.',
  supportsLiveAiTrainer: false,
}

const spin_stage3: Protocol = {
  id: 'spin_s3',
  behavior: 'spin',
  stage: 3,
  title: 'The other way, and anywhere',
  objective: 'Your dog spins one way on "spin", the other way on "twirl", in new places too.',
  durationMinutes: 6,
  repCount: 25,
  steps: [
    {
      order: 1,
      instruction: 'Lure a full circle in the opposite direction.',
      then: 'Mark as they finish the circle, then treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Most dogs have a stiffer side. Go slower and wider this way.',
      successLook: 'A full circle the new way, following the treat.'
    },
    {
      order: 2,
      instruction: 'Draw the opposite circle with an empty hand.',
      then: 'Mark the full circle, then treat from your other hand.',
      durationSeconds: null,
      reps: 5,
      tip: 'Use your other hand for this direction. It helps them tell the two apart.',
      successLook: 'They circle the new way for an empty hand.'
    },
    {
      order: 3,
      instruction: 'Say "twirl" once, pause, then signal the new direction.',
      then: 'Mark and treat the full circle.',
      durationSeconds: null,
      reps: 10,
      tip: 'One word per direction keeps both tricks clean.',
      successLook: 'They start the new direction before your hand moves.'
    },
    {
      order: 4,
      instruction: 'In a new room or the yard, say "spin" once.',
      then: 'Mark and treat. Help with a hand signal if needed.',
      durationSeconds: null,
      reps: 5,
      tip: 'A new place makes old skills wobbly. Helping is fine.',
      successLook: 'They spin on the word in a new place.'
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
    'Rug, grass, or non-slip floor',
    'Treats in a pouch',
    'A second location for the last step',
  ],
  successCriteria: 'Done when they spin and twirl on the word, each 8 times out of 10, in 2 places.',
  commonMistakes: [
    'Mixing both directions before the new one is solid. Finish one, then the other.',
    'Expecting the second side to be as quick. Give it its own sessions.',
    'Using "spin" for both directions. Pick a second word, like "twirl".',
    'Only ever practicing in the kitchen. Try the yard and the hallway.',
  ],
  equipmentNeeded: [
    'Small, soft treats',
    'Treat pouch',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: null,
  trainerNote: 'Turning both ways is a nice warm-up stretch before play. If one side stays clearly stiff or reluctant, mention it to your vet.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// HIGH FIVE (stage 1 is a shake)
// ─────────────────────────────────────────────────────────────────────────────

const high_five_stage1: Protocol = {
  id: 'high_five_s1',
  behavior: 'high_five',
  stage: 1,
  title: 'Paw to your hand',
  objective: 'Your dog places a front paw on your open palm when you offer it low.',
  durationMinutes: 5,
  repCount: 25,
  steps: [
    {
      order: 1,
      instruction: 'With them sitting, hold a treat in your closed fist, paw height.',
      then: 'Wait. Mark any paw lift, then open your hand.',
      durationSeconds: null,
      reps: 5,
      tip: 'Ignore sniffing and licking. Most dogs try a paw within half a minute.',
      successLook: 'A front paw lifts off the floor.'
    },
    {
      order: 2,
      instruction: 'Same closed fist. Wait for the paw to touch your hand.',
      then: 'Mark the touch and treat from your other hand.',
      durationSeconds: null,
      reps: 10,
      tip: 'Pay from the other hand now, so the paw is not just digging for food.',
      successLook: 'Paw lands on your fist within 3 seconds.'
    },
    {
      order: 3,
      instruction: 'Offer an open, empty palm, low and facing up.',
      then: 'Mark the paw landing on it. Treat from your other hand.',
      durationSeconds: null,
      reps: 10,
      tip: 'Let the paw rest on you. Many dogs dislike having paws gripped.',
      successLook: 'They place a paw on your open palm.'
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
    'Rug or non-slip floor to sit on',
    '25 tiny treats in a pouch',
    'Quiet room',
  ],
  successCriteria: 'Move on when they place a paw on your open palm within 3 seconds, 8 times out of 10.',
  commonMistakes: [
    'Grabbing or squeezing the paw. Let them place it and take it back.',
    'Lifting the paw for them. Wait for them to offer it.',
    'Holding your hand high too soon. Start at paw height.',
    'Paying for pawing at your leg between reps. Pay only a paw on the offered hand.',
  ],
  equipmentNeeded: [
    'Small, soft treats',
    'Treat pouch',
    'A rug, on hard floors',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 1,
  nextProtocolId: 'high_five_s2',
  trainerNote: 'This first stage is a shake. For dogs with sore shoulders, elbows, or wrists, keep your hand low and ask your vet if unsure.',
  supportsLiveAiTrainer: false,
}

const high_five_stage2: Protocol = {
  id: 'high_five_s2',
  behavior: 'high_five',
  stage: 2,
  title: 'Turn it into a high five',
  objective: 'Your dog taps your upright palm with a paw when you say "high five".',
  durationMinutes: 6,
  repCount: 30,
  steps: [
    {
      order: 1,
      instruction: 'Offer your palm tilted halfway up, at their chest height.',
      then: 'Mark the paw touch. Treat from your other hand.',
      durationSeconds: null,
      reps: 10,
      tip: 'Change the angle before the height. One thing at a time.',
      successLook: 'Paw meets your tilted palm.'
    },
    {
      order: 2,
      instruction: 'Hold your palm upright, facing them, at chest height.',
      then: 'Mark the tap. No holding the paw, only a tap.',
      durationSeconds: null,
      reps: 10,
      tip: 'Stay at chest height. Higher makes them rear up and strains the back.',
      successLook: 'A quick paw tap on your upright palm.'
    },
    {
      order: 3,
      instruction: 'Say "high five" once, then present your upright palm.',
      then: 'Mark the tap and treat from your other hand.',
      durationSeconds: null,
      reps: 10,
      tip: 'Only a cued tap gets paid from now on. That keeps pawing polite.',
      successLook: 'They tap right after the word.'
    },
    {
      order: 4,
      instruction: 'Say "free" and take a sniff or play break.',
      then: 'Nothing more asked. Let them unwind.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose body, nose down.'
    },
  ],
  setup: [
    'Rug or non-slip floor to sit on',
    'Treats in a pouch',
    'Nails trimmed, to save your wrist',
  ],
  successCriteria: 'Move on when they tap your upright palm on the word, 8 times out of 10.',
  commonMistakes: [
    'Raising the hand above their chest. Keep it level with their chest.',
    'Changing angle and height in the same rep. Change one at a time.',
    'Laughing at uncued pawing. Pay only the paw you asked for.',
    'Letting the paw rake down your arm. Present the palm, take the tap, withdraw.',
  ],
  equipmentNeeded: [
    'Small, soft treats',
    'Treat pouch',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'high_five_s3',
  trainerNote: 'If your dog already paws at people for attention, this helps: the paw now pays only when someone asks for it.',
  supportsLiveAiTrainer: false,
}

const high_five_stage3: Protocol = {
  id: 'high_five_s3',
  behavior: 'high_five',
  stage: 3,
  title: 'Either paw, anyone, anywhere',
  objective: 'Your dog high-fives with either paw, in new places, with people they like.',
  durationMinutes: 6,
  repCount: 25,
  steps: [
    {
      order: 1,
      instruction: 'Present your other hand, in front of their other paw.',
      then: 'Mark a tap from that paw. Treat from your free hand.',
      durationSeconds: null,
      reps: 10,
      tip: 'Your hand goes straight in front of the paw. Reaching across tips them over.',
      successLook: 'The other paw taps the other hand.'
    },
    {
      order: 2,
      instruction: 'Stand up and bend to present your palm at their chest.',
      then: 'Mark the tap and treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Bend down to them. Do not raise the target to suit your height.',
      successLook: 'They high-five a standing person, still seated.'
    },
    {
      order: 3,
      instruction: 'In a new room or outside, say "high five" once.',
      then: 'Mark the tap and pay well.',
      durationSeconds: null,
      reps: 5,
      tip: 'Pick a surface with grip. Wet grass or tile makes sitting dogs slide.',
      successLook: 'A tap on the word in a new place.'
    },
    {
      order: 4,
      instruction: 'Have a helper your dog likes present a palm and cue it.',
      then: 'The helper marks the tap. You deliver the treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Calm adults first. Children hold still, hand low, with you beside them.',
      successLook: 'They high-five the helper on the word.'
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
    'Non-slip surface',
    'Your best treats in a pouch',
    'Helper, optional',
  ],
  successCriteria: 'Done when they high-five with either paw on the word in 2 places, 8 times out of 10.',
  commonMistakes: [
    'Reaching across their body. Same-side hand goes to the same-side paw.',
    'Raising the target when you stand up. Bend down to chest height.',
    'Letting strangers ask for it. Only people your dog is already relaxed with.',
    'Doing 30 taps on one paw. Split the reps between both sides.',
  ],
  equipmentNeeded: [
    'High-value treats',
    'Treat pouch',
    'A helper (optional)',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: null,
  trainerNote: 'One paw is often much easier than the other. That is normal. A sudden reluctance to lift a paw is worth a vet visit.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// BOW
// ─────────────────────────────────────────────────────────────────────────────

const bow_stage1: Protocol = {
  id: 'bow_s1',
  behavior: 'bow',
  stage: 1,
  title: 'Elbows down, tail up',
  objective: 'Your dog lowers their elbows to the floor while their rear stays standing.',
  durationMinutes: 5,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'With them standing, lure their nose down between the front paws.',
      then: 'Mark any dip of the chest. Treat low.',
      durationSeconds: null,
      reps: 5,
      tip: 'Start from a stand. From a sit, the lure just produces a down.',
      successLook: 'Chest dips while the back legs stay straight.'
    },
    {
      order: 2,
      instruction: 'Lure a little lower and back, toward their chest.',
      then: 'Mark a deep elbow bend. Treat low, then let them stand.',
      durationSeconds: null,
      reps: 5,
      tip: 'Down and slightly back. A treat pulled forward walks them into a down.',
      successLook: 'Elbows bend deeply, rear still up.'
    },
    {
      order: 3,
      instruction: 'Lure until both elbows touch the floor.',
      then: 'Mark that instant, before the rear drops. Treat between the paws.',
      durationSeconds: null,
      reps: 10,
      tip: 'Mark fast. A second late and you are paying for a down.',
      successLook: 'Elbows on the floor, rear in the air.'
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
    'Dog standing, not sitting',
    '20 tiny treats',
    'At least an hour after a meal',
  ],
  successCriteria: 'Move on when elbows touch with the rear still up, 8 times out of 10.',
  commonMistakes: [
    'Starting from a sit. Begin with all four feet standing.',
    'Marking after the rear drops. Mark the moment elbows touch.',
    'Pushing on their shoulders or holding up the belly. Hands off; the treat does the work.',
    'Pulling the treat forward. Move it down and slightly back, toward their chest.',
  ],
  equipmentNeeded: [
    'Small, soft treats',
    'Treat pouch',
    'A rug, on hard floors',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'bow_s2',
  trainerNote: 'Skip bow for dogs with back, shoulder, or elbow problems unless your vet agrees. If the rear keeps dropping, pay smaller dips for a few sessions.',
  supportsLiveAiTrainer: false,
}

const bow_stage2: Protocol = {
  id: 'bow_s2',
  behavior: 'bow',
  stage: 2,
  title: 'Bow on the word',
  objective: 'Your dog bows when you say "bow" and holds it for 2 seconds.',
  durationMinutes: 6,
  repCount: 25,
  steps: [
    {
      order: 1,
      instruction: 'Make the same downward sweep with an empty hand.',
      then: 'Mark elbows down, then treat from your other hand.',
      durationSeconds: null,
      reps: 10,
      tip: 'Deliver the treat low. Feeding up high pulls them out of the bow.',
      successLook: 'They bow for the empty hand.'
    },
    {
      order: 2,
      instruction: 'Say "bow" once, pause a second, then give the hand signal.',
      then: 'Mark elbows down and treat low.',
      durationSeconds: null,
      reps: 10,
      tip: 'If "bow" sounds like "down" in your voice, use "ta-da" instead.',
      successLook: 'They start to fold before your hand moves.'
    },
    {
      order: 3,
      instruction: 'Cue the bow and count 2 seconds before marking.',
      then: 'Treat between the paws, then release with "free".',
      durationSeconds: null,
      reps: 5,
      tip: 'Two seconds is plenty. It is a stretch, not a stay.',
      successLook: 'They hold the bow until the marker.'
    },
    {
      order: 4,
      instruction: 'Say "free" and take a sniff or play break.',
      then: 'Nothing more asked. Let them unwind.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose body, nose down.'
    },
  ],
  setup: [
    'Rug or non-slip floor',
    'Treats in a pouch, not in your hand',
    'At least an hour after a meal',
  ],
  successCriteria: 'Move on when they bow on the word and hold 2 seconds, 8 times out of 10.',
  commonMistakes: [
    'Saying "bow" and "down" in the same tone. Make them sound different, or use "ta-da".',
    'Asking for long holds. Two seconds, then release.',
    'Treating up at head height. Pay low, between the front paws.',
    'Drilling after they start lying down. Take a break and come back fresh.',
  ],
  equipmentNeeded: [
    'Small, soft treats',
    'Treat pouch',
    'A rug, on hard floors',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'bow_s3',
  trainerNote: 'Dogs bow naturally when they stretch after a nap. You can also mark and treat that with the word, as a bonus rep.',
  supportsLiveAiTrainer: false,
}

const bow_stage3: Protocol = {
  id: 'bow_s3',
  behavior: 'bow',
  stage: 3,
  title: 'Take a bow anywhere',
  objective: 'Your dog bows on the word alone, from a step away, with people watching.',
  durationMinutes: 6,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Stand up straight and say "bow" with no hand signal.',
      then: 'Wait 3 seconds. Pay big if they fold.',
      durationSeconds: null,
      reps: 5,
      tip: 'If they stall, give a tiny signal, then fade it again next rep.',
      successLook: 'They bow while you stand tall, hands still.'
    },
    {
      order: 2,
      instruction: 'Take one step back, then say "bow".',
      then: 'Mark elbows down, then walk in and treat low.',
      durationSeconds: null,
      reps: 5,
      tip: 'Walk the treat to them. Calling them over pays for leaving the bow.',
      successLook: 'They bow with you a step away.'
    },
    {
      order: 3,
      instruction: 'On a rug or grass somewhere new, say "bow".',
      then: 'Mark and treat. Help with a signal if needed.',
      durationSeconds: null,
      reps: 5,
      tip: 'Check the footing first. Front feet slide on tile and wet decking.',
      successLook: 'They bow in a new place.'
    },
    {
      order: 4,
      instruction: 'With a helper watching from 6 feet, say "bow".',
      then: 'Mark and treat. The helper stays quiet.',
      durationSeconds: null,
      reps: 5,
      tip: 'Tricks get shown to people. An audience is a distraction worth practicing.',
      successLook: 'They bow with someone watching.'
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
    'Surface with grip: rug or dry grass',
    'Your best treats in a pouch',
    'Helper, optional',
  ],
  successCriteria: 'Done when they bow on the word alone in 2 places, 8 times out of 10.',
  commonMistakes: [
    'Bending over as you say it. Your bend becomes the cue. Stand tall.',
    'Adding distance and a new place together. Change one at a time.',
    'Asking on slippery floors. Front feet slide out and the bow gets scary.',
    'Showing it off 20 times at a party. Three good bows, then done.',
  ],
  equipmentNeeded: [
    'High-value treats',
    'Treat pouch',
    'A helper (optional)',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'A bow makes a good finish to any trick routine. Keep it to a few reps a day; it is a real stretch for the shoulders and back.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLL OVER
// ─────────────────────────────────────────────────────────────────────────────

const roll_over_stage1: Protocol = {
  id: 'roll_over_s1',
  behavior: 'roll_over',
  stage: 1,
  title: 'Onto one side',
  objective: 'Your dog follows a treat from a down onto their side and relaxes there.',
  durationMinutes: 5,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'From a down, lure their nose back toward one shoulder.',
      then: 'Mark when the hip rolls under. Treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Watch which hip they already lean on. Roll toward that side.',
      successLook: 'Weight shifts onto one hip.'
    },
    {
      order: 2,
      instruction: 'Lure from the shoulder on toward their spine.',
      then: 'Mark when they tip onto their side. Treat on the floor.',
      durationSeconds: null,
      reps: 5,
      tip: 'Feed with their head on the floor, so lying flat feels safe.',
      successLook: 'They lie flat on one side, head down.'
    },
    {
      order: 3,
      instruction: 'Lure onto the side, then feed 3 treats there, slowly.',
      then: 'Say "free" and let them get up.',
      durationSeconds: null,
      reps: 5,
      tip: 'Lying on the side is vulnerable. Some dogs need several sessions here.',
      successLook: 'They stay on their side, relaxed, while eating.'
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
    'Carpet, a thick rug, or grass. Never a hard floor',
    'At least 2 hours after a meal',
    'They already lie down on cue',
    '15 soft treats',
  ],
  successCriteria: 'Move on when they follow the treat onto their side and stay relaxed, 8 times out of 10.',
  commonMistakes: [
    'Rolling them over by hand. Hands off; let the treat lead.',
    'Luring too fast. Their nose should stay glued to the treat.',
    'Training on a hard or slippery floor. Use carpet or grass.',
    'Pushing on when they pop up. Go back to the hip roll and pay that.',
  ],
  equipmentNeeded: [
    'Small, soft treats',
    'Treat pouch',
    'Carpet, thick rug, or grass',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'roll_over_s2',
  trainerNote: 'Skip roll over for dogs with back, hip, or neck problems. Ask your vet first for long-backed or deep-chested breeds, and never train it after a meal.',
  supportsLiveAiTrainer: false,
}

const roll_over_stage2: Protocol = {
  id: 'roll_over_s2',
  behavior: 'roll_over',
  stage: 2,
  title: 'All the way over',
  objective: 'Your dog rolls from a down, over their back, to a down on the other side.',
  durationMinutes: 5,
  repCount: 15,
  steps: [
    {
      order: 1,
      instruction: 'From their side, lure the nose across toward the far shoulder.',
      then: 'Mark when the legs pass over the top. Treat as they land.',
      durationSeconds: null,
      reps: 5,
      tip: 'This is the hard part. Pay any extra inch of lean at first.',
      successLook: 'Legs swing over and they land on the other side.'
    },
    {
      order: 2,
      instruction: 'Lure the whole roll in one motion, down to down.',
      then: 'Mark as they finish, then give 3 treats.',
      durationSeconds: null,
      reps: 5,
      tip: 'Always roll the same way for now. Dogs have a preferred side.',
      successLook: 'One smooth roll, ending in a down.'
    },
    {
      order: 3,
      instruction: 'Draw the same arc with an empty hand.',
      then: 'Mark the finished roll. Treat from your other hand.',
      durationSeconds: null,
      reps: 5,
      tip: 'Keep the arc big and slow. You will shrink it in the next stage.',
      successLook: 'They roll for the empty hand.'
    },
    {
      order: 4,
      instruction: 'Say "free" and take a sniff or play break.',
      then: 'Nothing more asked. Let them unwind.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose body, nose down.'
    },
  ],
  setup: [
    'Carpet, a thick rug, or grass. Never a hard floor',
    'At least 2 hours after a meal',
    'Clear space on both sides of them',
    'Soft treats in a pouch',
  ],
  successCriteria: 'Move on when they roll all the way over for the empty hand, 8 times out of 10.',
  commonMistakes: [
    'Helping them over with a push. Hands off; pay smaller leans instead.',
    'Rushing the halfway point. Slow the lure as the legs come up.',
    'Doing more than 5 rolls in a row. Break it up with easy touches or sits.',
    'Training near furniture. Legs swing wide on the way over.',
  ],
  equipmentNeeded: [
    'Small, soft treats',
    'Treat pouch',
    'Carpet, thick rug, or grass',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: 'roll_over_s3',
  trainerNote: 'If they freeze on their back or scramble up, they are not comfortable yet. Go back to feeding on their side. Stiffness or yelping: stop and see your vet.',
  supportsLiveAiTrainer: false,
}

const roll_over_stage3: Protocol = {
  id: 'roll_over_s3',
  behavior: 'roll_over',
  stage: 3,
  title: 'Roll over on the word',
  objective: 'Your dog rolls over when you say "roll over", with your hand still.',
  durationMinutes: 6,
  repCount: 18,
  steps: [
    {
      order: 1,
      instruction: 'Shrink the arc to a small circle of your hand.',
      then: 'Mark the finished roll. Treat from your other hand.',
      durationSeconds: null,
      reps: 5,
      tip: 'Shrink a little each rep. If they stall, go back to the bigger arc.',
      successLook: 'They roll for a small hand circle.'
    },
    {
      order: 2,
      instruction: 'Say "roll over" once, pause a second, then give the small signal.',
      then: 'Mark the finished roll and treat.',
      durationSeconds: null,
      reps: 5,
      tip: 'Word first, then signal. Given together, they only notice your hand.',
      successLook: 'They start to tip before your hand moves.'
    },
    {
      order: 3,
      instruction: 'Say "roll over" once and keep your hand still.',
      then: 'Wait 3 seconds. Pay big if they roll.',
      durationSeconds: null,
      reps: 5,
      tip: 'No roll? Help with the signal, then try the word alone again.',
      successLook: 'A full roll on the word alone.'
    },
    {
      order: 4,
      instruction: 'On grass or a rug somewhere new, cue it once.',
      then: 'Mark and treat. Help with a signal if needed.',
      durationSeconds: null,
      reps: 3,
      tip: 'Check the ground first for stones, sticks, and slopes.',
      successLook: 'They roll over in a new place.'
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
    'Carpet, a thick rug, or grass. Never a hard floor',
    'At least 2 hours after a meal',
    'Your best treats in a pouch',
  ],
  successCriteria: 'Done when they roll over on the word alone, hand still, 8 times out of 10.',
  commonMistakes: [
    'Repeating the cue while they think. Say it once and wait 3 seconds.',
    'Asking on hard floors once they know it. Soft ground, every time.',
    'Asking right after dinner. Wait at least 2 hours.',
    'Showing it off again and again. Five rolls a session is plenty.',
  ],
  equipmentNeeded: [
    'High-value treats',
    'Treat pouch',
    'Carpet, thick rug, or grass',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'Cap it at about 5 rolls in a row. It is a big movement, and quality drops once they are tired or dizzy.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// LEG WEAVE
// (substituted for "go to mat / park it", which would duplicate settle_s1-s3)
// ─────────────────────────────────────────────────────────────────────────────

const leg_weave_stage1: Protocol = {
  id: 'leg_weave_s1',
  behavior: 'leg_weave',
  stage: 1,
  title: 'Through and around',
  objective: 'Your dog walks between your legs and loops around one leg, back to the front.',
  durationMinutes: 5,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Stand feet wide. From behind, show a treat between your knees.',
      then: 'Mark when their head comes through. Treat right there.',
      durationSeconds: null,
      reps: 5,
      tip: 'Some dogs dislike being stood over. Let them choose; never pull them through.',
      successLook: 'Head and shoulders come between your legs.'
    },
    {
      order: 2,
      instruction: 'Lure them all the way through, front to back.',
      then: 'Mark as the hips clear your legs. Treat behind you.',
      durationSeconds: null,
      reps: 5,
      tip: 'Stand still. Stepping over the dog to help is how toes get trodden.',
      successLook: 'They walk through without ducking or squeezing.'
    },
    {
      order: 3,
      instruction: 'Lure through, then around the outside of your right leg.',
      then: 'Mark and treat when they arrive back in front.',
      durationSeconds: null,
      reps: 10,
      tip: 'Same leg every time for now, so the pattern is predictable.',
      successLook: 'One loop: through, around, back to the front.'
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
    'Non-slip floor with clear space around you',
    'Feet wider apart than your dog',
    'Treats in both hands',
    'A chair back to hold, if your balance is unsure',
  ],
  successCriteria: 'Move on when they loop through and around one leg following the treat, 8 times out of 10.',
  commonMistakes: [
    'Standing too narrow. They should pass without ducking or squeezing.',
    'Stepping over the dog to help. Stand still and let them move.',
    'Bending so far you wobble. Hold a chair back at first.',
    'Pulling a worried dog through. Pay for a head through, and build from there.',
  ],
  equipmentNeeded: [
    'Small, soft treats',
    'Treat pouch',
    'A sturdy chair (optional)',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 2,
  nextProtocolId: 'leg_weave_s2',
  trainerNote: 'Best for dogs who fit under you without crouching. Skip it for giant breeds, or if your own balance, knees, or back are not up to it.',
  supportsLiveAiTrainer: false,
}

const leg_weave_stage2: Protocol = {
  id: 'leg_weave_s2',
  behavior: 'leg_weave',
  stage: 2,
  title: 'Figure eight',
  objective: 'Your dog weaves a figure eight around both of your legs while you stand still.',
  durationMinutes: 6,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Warm up: lure through and around your right leg.',
      then: 'Mark and treat when they arrive back in front.',
      durationSeconds: null,
      reps: 5,
      tip: 'Start with what they know. Easy reps first keep confidence up.',
      successLook: 'A smooth loop around the right leg.'
    },
    {
      order: 2,
      instruction: 'Swap hands. Lure through and around your left leg.',
      then: 'Mark and treat when they arrive back in front.',
      durationSeconds: null,
      reps: 5,
      tip: 'Right hand leads around the right leg, left hand around the left.',
      successLook: 'A smooth loop around the left leg.'
    },
    {
      order: 3,
      instruction: 'Link them: right-leg loop, then straight into the left-leg loop.',
      then: 'Mark and treat after the full figure eight.',
      durationSeconds: null,
      reps: 5,
      tip: 'If they stall in the middle, treat after the first loop for a few reps.',
      successLook: 'One full figure eight for one treat.'
    },
    {
      order: 4,
      instruction: 'Repeat the figure eight with empty hands pointing the way.',
      then: 'Mark the finish, then treat from your pouch.',
      durationSeconds: null,
      reps: 5,
      tip: 'Going empty-handed early stops the treat becoming part of the cue.',
      successLook: 'They follow your pointing hands through the eight.'
    },
    {
      order: 5,
      instruction: 'Say "free" and take a sniff or play break.',
      then: 'Nothing more asked. Let them unwind.',
      durationSeconds: 60,
      reps: null,
      tip: null,
      successLook: 'Loose body, nose down.'
    },
  ],
  setup: [
    'Non-slip floor with clear space around you',
    'Feet wider apart than your dog',
    'Treats in a pouch',
  ],
  successCriteria: 'Move on when they complete a figure eight for empty hands, 8 times out of 10.',
  commonMistakes: [
    'Using one hand for both legs. Switch hands as they pass through.',
    'Linking both loops before each is smooth. Practice them apart first.',
    'Shuffling your feet to help. Plant them and let your dog do the moving.',
    'Treating mid-weave forever. Move the treat to the end of the eight.',
  ],
  equipmentNeeded: [
    'Small, soft treats',
    'Treat pouch',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: 'leg_weave_s3',
  trainerNote: 'Small dogs fly through this. Longer dogs need a wider stance and slower hands so they can bend around your leg comfortably.',
  supportsLiveAiTrainer: false,
}

const leg_weave_stage3: Protocol = {
  id: 'leg_weave_s3',
  behavior: 'leg_weave',
  stage: 3,
  title: 'Weave while you walk',
  objective: 'Your dog weaves through your legs for 4 slow steps when you say "weave".',
  durationMinutes: 6,
  repCount: 20,
  steps: [
    {
      order: 1,
      instruction: 'Take one long, slow step and hold it. Point through the gap.',
      then: 'Mark and treat as they pass under your leg.',
      durationSeconds: null,
      reps: 5,
      tip: 'Hold each step still until they are through. A moving leg can clip them.',
      successLook: 'They pass under your held step.'
    },
    {
      order: 2,
      instruction: 'Step with the other leg, hold it, and point through.',
      then: 'Mark and treat as they pass under.',
      durationSeconds: null,
      reps: 5,
      tip: 'They enter from the outside of whichever leg is in front.',
      successLook: 'They pass under from the other side.'
    },
    {
      order: 3,
      instruction: 'Link 2 steps: through, step, through.',
      then: 'Mark and treat after the second pass.',
      durationSeconds: null,
      reps: 5,
      tip: 'Keep it slow. Speed comes on its own once they know the pattern.',
      successLook: 'Two passes in a row for one treat.'
    },
    {
      order: 4,
      instruction: 'Say "weave" once before your first step, then walk 4 steps.',
      then: 'Mark and treat after the fourth pass.',
      durationSeconds: null,
      reps: 5,
      tip: 'Add one step at a time. If they drop out, go back to 2.',
      successLook: 'Four passes in a row on the word.'
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
    'Non-slip floor or short grass, 10 feet of clear space',
    'Flat shoes',
    'Treats in a pouch',
  ],
  successCriteria: 'Done when they weave through 4 slow steps on the word, 8 times out of 10.',
  commonMistakes: [
    'Walking at normal speed. Take long, slow steps and hold each one.',
    'Swinging your leg while they are under it. Wait until they are through.',
    'Adding steps too fast. One more step per session is enough.',
    'Practicing on leash. The leash tangles; do this one off leash at home.',
  ],
  equipmentNeeded: [
    'Small, soft treats',
    'Treat pouch',
    'Clear floor space',
  ],
  ageMinMonths: 8,
  ageMaxMonths: 999,
  difficulty: 3,
  nextProtocolId: null,
  trainerNote: 'Do this off leash in a safe, enclosed space. If either of you keeps tripping, the figure eight on the spot is a fine place to stop.',
  supportsLiveAiTrainer: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS (spread into PROTOCOLS and EXERCISE_TO_PROTOCOL in protocols.ts)
// ─────────────────────────────────────────────────────────────────────────────

export const TRICK_PROTOCOLS: Protocol[] = [
  // Touch (hand target)
  touch_stage1, touch_stage2, touch_stage3,
  // Spin
  spin_stage1, spin_stage2, spin_stage3,
  // High five
  high_five_stage1, high_five_stage2, high_five_stage3,
  // Bow
  bow_stage1, bow_stage2, bow_stage3,
  // Roll over
  roll_over_stage1, roll_over_stage2, roll_over_stage3,
  // Leg weave
  leg_weave_stage1, leg_weave_stage2, leg_weave_stage3,
]

/**
 * Plan-exercise ids, in the same two-per-stage pattern as
 * EXERCISE_TO_PROTOCOL in constants/protocols.ts. Prefixes are unused there.
 */
export const TRICK_EXERCISE_TO_PROTOCOL: Record<string, string> = {
  // Touch
  tc_01: 'touch_s1', tc_02: 'touch_s1', tc_03: 'touch_s2',
  tc_04: 'touch_s2', tc_05: 'touch_s3', tc_06: 'touch_s3',
  // Spin
  sp_01: 'spin_s1', sp_02: 'spin_s1', sp_03: 'spin_s2',
  sp_04: 'spin_s2', sp_05: 'spin_s3', sp_06: 'spin_s3',
  // High five
  hf_01: 'high_five_s1', hf_02: 'high_five_s1', hf_03: 'high_five_s2',
  hf_04: 'high_five_s2', hf_05: 'high_five_s3', hf_06: 'high_five_s3',
  // Bow
  bw_01: 'bow_s1', bw_02: 'bow_s1', bw_03: 'bow_s2',
  bw_04: 'bow_s2', bw_05: 'bow_s3', bw_06: 'bow_s3',
  // Roll over
  ro_01: 'roll_over_s1', ro_02: 'roll_over_s1', ro_03: 'roll_over_s2',
  ro_04: 'roll_over_s2', ro_05: 'roll_over_s3', ro_06: 'roll_over_s3',
  // Leg weave
  lw_01: 'leg_weave_s1', lw_02: 'leg_weave_s1', lw_03: 'leg_weave_s2',
  lw_04: 'leg_weave_s2', lw_05: 'leg_weave_s3', lw_06: 'leg_weave_s3',
}
