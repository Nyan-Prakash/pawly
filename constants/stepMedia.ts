import type { ImageSourcePropType } from 'react-native';

export interface StepMediaClip {
  /** Bundled mp4, muted. */
  video: number;
  /** width / height of the clip; the frame is sized to it. */
  aspectRatio: number;
  /** First frame, shown when reduced motion is on and before the video is ready. */
  poster: ImageSourcePropType;
  /** What the clip shows, for VoiceOver. */
  label: string;
}

const crateS1Step1: StepMediaClip = {
  video: require('@/assets/video/crate_s1_1.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/crate_s1_1_poster.jpg'),
  label: 'A puppy sniffs at the open door of its crate.',
};

const crateS1Step2: StepMediaClip = {
  video: require('@/assets/video/crate_s1_2.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/crate_s1_2_poster.jpg'),
  label: 'A puppy steps into the crate for a treat and backs out again.',
};

const crateS1Step3: StepMediaClip = {
  video: require('@/assets/video/crate_s1_3.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/crate_s1_3_poster.jpg'),
  label: 'A puppy eats from a bowl inside the crate with the door open.',
};

const crateS1Step4: StepMediaClip = {
  video: require('@/assets/video/crate_s1_4.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/crate_s1_4_poster.jpg'),
  label: 'A puppy eats calmly inside the crate with the door closed.',
};

const crateS1Step5: StepMediaClip = {
  video: require('@/assets/video/crate_s1_5.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/crate_s1_5_poster.jpg'),
  label: 'A puppy gets up and walks calmly out of the open crate.',
};

const sitLure: StepMediaClip = {
  video: require('@/assets/video/sit_lure.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/sit_lure_poster.jpg'),
  label: 'A treat held at the puppy’s nose lifts up and back, and the puppy sits.',
};

const downLure: StepMediaClip = {
  video: require('@/assets/video/down_lure.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/down_lure_poster.jpg'),
  label: 'From a sit, a treat is lowered to the floor and slid forward, and the puppy lies down.',
};

const stayPalm: StepMediaClip = {
  video: require('@/assets/video/stay_palm.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/stay_palm_poster.jpg'),
  label: 'The puppy sits while a flat palm is held toward it, then gets a treat without moving.',
};

const closedFist: StepMediaClip = {
  video: require('@/assets/video/closed_fist.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/closed_fist_poster.jpg'),
  label: 'The puppy licks and paws at a closed fist, backs off, and gets a treat from the other hand.',
};

const turnBack: StepMediaClip = {
  video: require('@/assets/video/turn_back.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/turn_back_poster.jpg'),
  label: 'The puppy jumps up on the owner’s legs, the owner turns away, and once four paws land the owner crouches and treats.',
};

const stepBack: StepMediaClip = {
  video: require('@/assets/video/step_back.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/step_back_poster.jpg'),
  label: 'The puppy holds a sit while the owner steps back one pace and returns to give a treat.',
};

const nameLookHip: StepMediaClip = {
  video: require('@/assets/video/name_look_hip.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/name_look_hip_poster.jpg'),
  label: 'The puppy stands beside the owner’s leg, looks up, and gets a treat delivered at the owner’s hip.',
};

const uTurn: StepMediaClip = {
  video: require('@/assets/video/u_turn.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/u_turn_poster.jpg'),
  label: 'The puppy drifts ahead, the owner turns briskly the other way, and the puppy trots to catch up at the hip.',
};

const heelPosition: StepMediaClip = {
  video: require('@/assets/video/heel_position.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/heel_position_poster.jpg'),
  label: 'The owner stands with a treat hand at the left hip, fingers pointing down, and the puppy’s shoulder lines up with the leg.',
};

const treatTossSelf: StepMediaClip = {
  video: require('@/assets/video/treat_toss_self.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/treat_toss_self_poster.jpg'),
  label: 'The puppy glances at the owner and a treat lands by the owner’s feet, so the puppy steps in to get it.',
};

const crouchOpenArms: StepMediaClip = {
  video: require('@/assets/video/crouch_open_arms.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/crouch_open_arms_poster.jpg'),
  label: 'The owner crouches with arms wide, the puppy runs in, and gets a handful of treats on arrival.',
};

const clapRunAway: StepMediaClip = {
  video: require('@/assets/video/clap_run_away.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/clap_run_away_poster.jpg'),
  label: 'The puppy ignores the call, so the owner claps, turns, and runs off, and the puppy chases.',
};

const footOverKibble: StepMediaClip = {
  video: require('@/assets/video/foot_over_kibble.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/foot_over_kibble_poster.jpg'),
  label: 'Kibble on the floor is covered by the owner’s foot as the puppy dives, then the puppy backs off and gets a treat from the hand.',
};

const dropItTrade: StepMediaClip = {
  video: require('@/assets/video/drop_it_trade.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/drop_it_trade_poster.jpg'),
  label: 'The puppy holds a toy, a treat is held under its nose, the toy drops, the puppy eats, and the toy is handed back.',
};

const ouchFreeze: StepMediaClip = {
  video: require('@/assets/video/ouch_freeze.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/ouch_freeze_poster.jpg'),
  label: 'A puppy mouths a hand during play, the hand goes completely still, and the puppy lets go.',
};

const redirectToy: StepMediaClip = {
  video: require('@/assets/video/redirect_toy.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/redirect_toy_poster.jpg'),
  label: 'A toy is wiggled along the floor and the puppy bites the toy instead of the hand, and play resumes.',
};

const underThreshold: StepMediaClip = {
  video: require('@/assets/video/under_threshold.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/under_threshold_poster.jpg'),
  label: 'Another dog is small in the far distance; this puppy notices it, stays relaxed, and eats a steady stream of treats.',
};

const lookBack: StepMediaClip = {
  video: require('@/assets/video/look_back.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/look_back_poster.jpg'),
  label: 'The puppy looks at the distant dog, then turns its head back to the owner and gets a treat.',
};

const openFlatHand: StepMediaClip = {
  video: require('@/assets/video/open_flat_hand.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/open_flat_hand_poster.jpg'),
  label: 'A treat sits visible on an open palm, the puppy pulls its head back, and a treat comes from the other hand.',
};

const pawOnMat: StepMediaClip = {
  video: require('@/assets/video/paw_on_mat.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/paw_on_mat_poster.jpg'),
  label: 'The puppy wanders, one paw touches the mat, and treats land on the mat.',
};

const downOnMat: StepMediaClip = {
  video: require('@/assets/video/down_on_mat.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/down_on_mat_poster.jpg'),
  label: 'The puppy lies down on the mat and a treat is placed between its front paws.',
};

const hipRoll: StepMediaClip = {
  video: require('@/assets/video/hip_roll.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/hip_roll_poster.jpg'),
  label: 'From a sphinx down, a treat held low to one side turns the puppy’s head and its hip rolls over into a relaxed down.',
};

const doorOneInch: StepMediaClip = {
  video: require('@/assets/video/door_one_inch.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/door_one_inch_poster.jpg'),
  label: 'The door opens a crack, the puppy surges, the door closes, the puppy backs up, and the door opens wider.',
};

const frozenToy: StepMediaClip = {
  video: require('@/assets/video/frozen_toy.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/frozen_toy_poster.jpg'),
  label: 'A toy wiggles, the puppy lunges and the toy goes dead still, the puppy sits, and the toy comes alive again.',
};

const treatBetweenPaws: StepMediaClip = {
  video: require('@/assets/video/treat_between_paws.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/treat_between_paws_poster.jpg'),
  label: 'The owner walks toward the sitting puppy and drops a treat low between its front paws, not held high.',
};

const touchGradient: StepMediaClip = {
  video: require('@/assets/video/touch_gradient.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/touch_gradient_poster.jpg'),
  label: 'A hand touches the puppy’s shoulder, then elbow, then lower leg, then paw, with a treat after each touch.',
};

const pawCup: StepMediaClip = {
  video: require('@/assets/video/paw_cup.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/paw_cup_poster.jpg'),
  label: 'A paw is held gently in an open hand while treats are fed one per second.',
};

const clippers: StepMediaClip = {
  video: require('@/assets/video/clippers.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/clippers_poster.jpg'),
  label: 'The clipper opening is placed around one nail and removed without cutting, and treats follow.',
};

const ringBell: StepMediaClip = {
  video: require('@/assets/video/ring_bell.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/ring_bell_poster.jpg'),
  label: 'A treat is held beside a hanging bell, the puppy’s nose bumps the bell, and the door opens at once.',
};

const quietAtNose: StepMediaClip = {
  video: require('@/assets/video/quiet_at_nose.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/quiet_at_nose_poster.jpg'),
  label: 'The puppy barks twice, a treat is held at its nose, the barking stops, and the treat is given.',
};

const crateIgnoring: StepMediaClip = {
  video: require('@/assets/video/crate_ignoring.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/crate_ignoring_poster.jpg'),
  label: 'The puppy chews a toy in a closed crate while the owner sits across the room reading, not looking.',
};

const tightLeashFreeze: StepMediaClip = {
  video: require('@/assets/video/tight_leash_freeze.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/tight_leash_freeze_poster.jpg'),
  label: 'The puppy pulls ahead, the leash goes tight, and the owner stops dead.',
};

const slackThenGo: StepMediaClip = {
  video: require('@/assets/video/slack_then_go.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/slack_then_go_poster.jpg'),
  label: 'The puppy turns back, the leash drops into a slack J, and the owner walks on.',
};

const reactionWalkAway: StepMediaClip = {
  video: require('@/assets/video/reaction_walk_away.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/reaction_walk_away_poster.jpg'),
  label: 'The puppy stiffens and barks at the distant dog, the owner silently turns and walks the other way, and the puppy eats again.',
};

const curvedGreeting: StepMediaClip = {
  video: require('@/assets/video/curved_greeting.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/curved_greeting_poster.jpg'),
  label: 'Two leashed dogs approach on a curve, not head-on, sniff for three seconds, and both walk off.',
};

const leftTurnHeel: StepMediaClip = {
  video: require('@/assets/video/left_turn_heel.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/left_turn_heel_poster.jpg'),
  label: 'The owner turns left into the puppy, and the puppy swings its rear out to make room.',
};

const loweringBowl: StepMediaClip = {
  video: require('@/assets/video/lowering_bowl.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/lowering_bowl_poster.jpg'),
  label: 'A food bowl lowers, the puppy dives and the bowl lifts, the puppy steps back and the bowl reaches the floor.',
};

const stepBehind: StepMediaClip = {
  video: require('@/assets/video/step_behind.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/step_behind_poster.jpg'),
  label: 'The puppy holds a sit-stay while the owner walks a circle around it; its head follows but its body holds.',
};

const walkTreatToMat: StepMediaClip = {
  video: require('@/assets/video/walk_treat_to_mat.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/walk_treat_to_mat_poster.jpg'),
  label: 'The puppy lies on the mat while the owner walks over, places a treat, and walks away; the puppy stays down.',
};

const pottyTell: StepMediaClip = {
  video: require('@/assets/video/potty_tell.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/potty_tell_poster.jpg'),
  label: 'The puppy circles and sniffs the floor in a corner, and the owner scoops up the leash and heads out.',
};

const doorbellToMat: StepMediaClip = {
  video: require('@/assets/video/doorbell_to_mat.mp4'),
  aspectRatio: 1,
  poster: require('@/assets/video/doorbell_to_mat_poster.jpg'),
  label: 'The bell rings, the owner leads the puppy to the mat, the puppy lies down, and a treat lands on the mat.',
};

/**
 * Demonstration clips, keyed by protocol id then step index. A clip shows the
 * dog doing the exercise and takes the place of the step's control; it is the
 * one place the app loops motion on its own (see DESIGN.md, Motion). Only the
 * steps listed here get one. Several steps share a clip when they teach the
 * same mechanic.
 */
export const STEP_MEDIA: Record<string, Record<number, StepMediaClip>> = {
  barking_s1: { 1: quietAtNose, 2: quietAtNose },
  barking_s2: { 0: doorbellToMat, 2: doorbellToMat },
  biting_s1: { 0: ouchFreeze, 2: redirectToy },
  biting_s2: { 0: ouchFreeze, 1: redirectToy },
  biting_s3: { 0: closedFist },
  coop_care_s1: { 0: touchGradient, 1: pawCup },
  coop_care_s2: { 1: clippers, 2: clippers },
  crate_s1: { 0: crateS1Step1, 1: crateS1Step2, 2: crateS1Step3, 3: crateS1Step4, 4: crateS1Step5 },
  crate_s2: { 0: crateIgnoring },
  door_manners_s1: { 1: doorOneInch },
  door_manners_s2: { 0: doorOneInch },
  down_s1: { 0: downLure },
  down_s2: { 0: walkTreatToMat, 1: hipRoll },
  heel_s1: { 0: heelPosition, 3: heelPosition },
  heel_s2: { 3: leftTurnHeel },
  impulse_s1: { 1: openFlatHand, 3: loweringBowl },
  impulse_s2: { 1: frozenToy },
  impulse_s3: { 1: underThreshold },
  jumping_s1: { 0: turnBack, 1: turnBack },
  jumping_s2: { 0: treatBetweenPaws, 1: treatBetweenPaws, 2: turnBack },
  leave_it_s1: { 0: closedFist, 1: closedFist, 3: openFlatHand },
  leave_it_s2: { 0: footOverKibble, 1: footOverKibble, 2: dropItTrade, 3: dropItTrade },
  llw_s1: { 0: nameLookHip, 1: nameLookHip },
  llw_s2: { 1: tightLeashFreeze, 2: slackThenGo, 3: slackThenGo },
  llw_s3: { 0: uTurn, 1: uTurn },
  obedience_s1: { 0: sitLure, 3: downLure },
  obedience_s2: { 0: stayPalm, 2: stepBack },
  potty_s2: { 0: ringBell },
  potty_s3: { 0: pottyTell, 1: pottyTell },
  reactivity_s1: { 1: underThreshold, 2: reactionWalkAway, 3: lookBack },
  reactivity_s2: { 0: underThreshold, 2: lookBack },
  reactivity_s3: { 2: curvedGreeting, 3: curvedGreeting },
  recall_s1: { 0: treatTossSelf },
  recall_s2: { 2: clapRunAway, 3: crouchOpenArms },
  recall_s3: { 1: clapRunAway, 2: crouchOpenArms },
  settle_s1: { 0: pawOnMat, 1: pawOnMat, 2: downOnMat, 3: downOnMat },
  settle_s2: { 0: walkTreatToMat },
  sit_s1: { 0: sitLure },
  sit_s2: { 0: stayPalm, 2: stepBack },
  wait_stay_s1: { 1: stayPalm },
  wait_stay_s2: { 0: stepBehind, 1: stepBehind, 2: stepBack },
};

export function getStepMedia(protocolId: string, stepIndex: number): StepMediaClip | null {
  return STEP_MEDIA[protocolId]?.[stepIndex] ?? null;
}
