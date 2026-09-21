import type { Dog, Plan, PlanSession } from '../types';
import { getGoalColor } from '../constants/courseColors.ts';
import {
  buildPlanMetadata,
  buildWeeklySchedule,
  chooseTrainingDays,
  normalizeTrainingSchedulePrefs,
} from './scheduleEngine.ts';

export type GoalKey =
  | 'leash_pulling'
  | 'jumping_up'
  | 'barking'
  | 'recall'
  | 'potty_training'
  | 'crate_anxiety'
  | 'puppy_biting'
  | 'settling'
  | 'leave_it'
  | 'basic_obedience'
  | 'separation_anxiety'
  | 'door_manners'
  | 'impulse_control'
  | 'cooperative_care'
  | 'wait_and_stay'
  | 'leash_reactivity'
  | 'sit'
  | 'down'
  | 'heel'
  | 'touch'
  | 'spin'
  | 'high_five'
  | 'bow'
  | 'roll_over'
  | 'leg_weave';

export const GOAL_MAP: Record<string, GoalKey> = {
  leash_pulling: 'leash_pulling',
  jumping_up: 'jumping_up',
  barking: 'barking',
  recall: 'recall',
  potty_training: 'potty_training',
  crate_anxiety: 'crate_anxiety',
  puppy_biting: 'puppy_biting',
  settling: 'settling',
  leave_it: 'leave_it',
  basic_obedience: 'basic_obedience',
  separation_anxiety: 'separation_anxiety',
  door_manners: 'door_manners',
  impulse_control: 'impulse_control',
  cooperative_care: 'cooperative_care',
  wait_and_stay: 'wait_and_stay',
  leash_reactivity: 'leash_reactivity',
  sit: 'sit',
  down: 'down',
  heel: 'heel',
  touch: 'touch',
  spin: 'spin',
  high_five: 'high_five',
  bow: 'bow',
  roll_over: 'roll_over',
  leg_weave: 'leg_weave',
  'Leash Pulling': 'leash_pulling',
  'Jumping Up': 'jumping_up',
  'Barking': 'barking',
  "Won't Come": 'recall',
  'Potty Training': 'potty_training',
  'Crate Anxiety': 'crate_anxiety',
  'Puppy Biting': 'puppy_biting',
  'Settling': 'settling',
  'Leave It': 'leave_it',
  'Basic Obedience': 'basic_obedience',
  'Separation Anxiety': 'separation_anxiety',
  'Door Manners': 'door_manners',
  'Impulse Control': 'impulse_control',
  'Cooperative Care': 'cooperative_care',
  'Wait & Stay': 'wait_and_stay',
  'Leash Reactivity': 'leash_reactivity',
  'Sit': 'sit',
  'Down': 'down',
  'Heel': 'heel',
  'Touch': 'touch',
  'Spin': 'spin',
  'High Five': 'high_five',
  'Bow': 'bow',
  'Roll Over': 'roll_over',
  'Leg Weave': 'leg_weave',
};

const FALLBACK_GOAL: GoalKey = 'leash_pulling';
const warnedGoals = new Set<string>();

/**
 * Resolve a stored goal string to a course key.
 *
 * Unknown goals still fall back to loose leash so that old persisted data keeps
 * producing a plan, but the fallback is no longer silent: a goal that is offered
 * in the UI and missing from GOAL_MAP builds the wrong course, and this warning
 * is how that gets noticed. Own-property check so 'constructor' and friends do
 * not resolve through the prototype. No react-native imports here: the node test
 * runner loads this module directly.
 */
export function resolveGoalKey(goal: string | null | undefined): GoalKey {
  if (typeof goal === 'string' && Object.hasOwn(GOAL_MAP, goal)) return GOAL_MAP[goal];
  const label = String(goal);
  if (!warnedGoals.has(label)) {
    warnedGoals.add(label);
    console.warn(
      `[planGenerator] Unknown goal "${label}" is not in GOAL_MAP. Falling back to "${FALLBACK_GOAL}".`,
    );
  }
  return FALLBACK_GOAL;
}

export const GOAL_TITLES: Record<GoalKey, string> = {
  leash_pulling: 'loose leash plan',
  jumping_up: 'polite greetings plan',
  barking: 'quiet plan',
  recall: 'recall plan',
  potty_training: 'potty training plan',
  crate_anxiety: 'crate training plan',
  puppy_biting: 'gentle mouth plan',
  settling: 'settle plan',
  leave_it: 'leave it plan',
  basic_obedience: 'basic cues plan',
  separation_anxiety: 'home alone plan',
  door_manners: 'door manners plan',
  impulse_control: 'self-control plan',
  cooperative_care: 'handling plan',
  wait_and_stay: 'wait and stay plan',
  leash_reactivity: 'calm on leash plan',
  sit: 'sit plan',
  down: 'down plan',
  heel: 'heel plan',
  touch: 'hand touch plan',
  spin: 'spin plan',
  high_five: 'high five plan',
  bow: 'bow plan',
  roll_over: 'roll over plan',
  leg_weave: 'leg weave plan',
};

interface ExerciseSequence {
  exerciseId: string;
  title: string;
  durationMinutes: number;
  weekNumber: number;
  dayNumber: number;
}

function buildExercises(sequences: Array<[string, string, number]>, sessionsPerWeek: number, totalWeeks: number): ExerciseSequence[] {
  const result: ExerciseSequence[] = [];
  let idx = 0;
  for (let week = 1; week <= totalWeeks; week++) {
    for (let day = 1; day <= sessionsPerWeek; day++) {
      const [exerciseId, title, duration] = sequences[idx % sequences.length];
      result.push({ exerciseId, title, durationMinutes: duration, weekNumber: week, dayNumber: day });
      idx++;
    }
  }
  return result;
}

export const SEQUENCES: Record<GoalKey, Array<[string, string, number]>> = {
  leash_pulling: [
    ['ll_01', 'Look up at their name', 8],
    ['ll_02', 'Stop when it goes tight', 8],
    ['ll_03', 'One step, then stop', 10],
    ['ll_04', 'Turn and go', 10],
    ['ll_05', 'U-turn on cue', 12],
    ['ll_06', 'Short loose leash walks', 12],
    ['ll_07', 'Walk past other dogs', 15],
    ['ll_08', 'Walk a busy street', 15],
  ],
  jumping_up: [
    ['ju_01', 'Four paws for a hello', 8],
    ['ju_02', 'Sit to get attention', 8],
    ['ju_03', 'Greeting at the door', 10],
    ['ju_04', 'Say hi to new people', 10],
    ['ju_05', 'Keep paws down when excited', 12],
    ['ju_06', 'Off cue in new places', 12],
  ],
  barking: [
    ['bk_01', 'Teach a quiet cue', 8],
    ['bk_02', 'Look at that game', 8],
    ['bk_03', 'Find their comfortable distance', 10],
    ['bk_04', 'Mat time at a distance', 10],
    ['bk_05', 'Quiet with the trigger nearby', 12],
    ['bk_06', 'Quiet at the doorbell', 15],
  ],
  recall: [
    ['rc_01', 'Name game', 8],
    ['rc_02', 'Come from 3 feet', 8],
    ['rc_03', 'Come from 10 feet', 10],
    ['rc_04', 'Come past a small distraction', 10],
    ['rc_05', 'Long line, 20 feet', 12],
    ['rc_06', 'Emergency recall word', 12],
    ['rc_07', 'Off leash in a fenced area', 15],
  ],
  potty_training: [
    ['pt_01', 'Out every 2 hours', 5],
    ['pt_02', 'Treat at the potty spot', 5],
    ['pt_03', 'Crate between potty trips', 8],
    ['pt_04', 'Leashed to you indoors', 8],
    ['pt_05', 'Potty on cue', 10],
    ['pt_06', 'Stretch to 3 hours', 5],
  ],
  crate_anxiety: [
    ['ca_01', 'Explore the open crate', 8],
    ['ca_02', 'Meals in the crate', 5],
    ['ca_03', 'Door closed for 10 seconds', 8],
    ['ca_04', 'Door closed for 2 minutes', 8],
    ['ca_05', 'Out of sight for 5 minutes', 10],
    ['ca_06', 'Out of sight for 20 minutes', 10],
    ['ca_07', 'Practice leaving the house', 12],
  ],
  puppy_biting: [
    ['pb_01', 'Ouch, then pause', 5],
    ['pb_02', 'Swap hands for a toy', 5],
    ['pb_03', 'Short break for hard bites', 8],
    ['pb_04', 'Calm hellos, no teeth', 8],
    ['pb_05', 'Wind down on the mat', 10],
    ['pb_06', 'Soft mouth during play', 10],
  ],
  settling: [
    ['st_01', 'Meet the mat', 8],
    ['st_02', 'Lie down on the mat', 8],
    ['st_03', 'Mat for 30 seconds', 10],
    ['st_04', 'Mat for 3 minutes', 10],
    ['st_05', 'Settle in a busy house', 12],
    ['st_06', 'Settle with small distractions', 12],
    ['st_07', 'Settle at a cafe', 15],
  ],
  leave_it: [
    ['li_01', 'Nose to your hand', 8],
    ['li_02', 'Leave food on the floor', 8],
    ['li_03', 'Trade a toy for a treat', 10],
    ['li_04', 'Leave a rolling treat', 10],
    ['li_05', 'Leave it with distractions', 12],
    ['li_06', 'Leave it on the street', 12],
  ],
  basic_obedience: [
    ['ob_01', 'Lure a sit', 8],
    ['ob_02', 'Lure a down', 8],
    ['ob_03', 'Stay for 5 seconds', 10],
    ['ob_04', 'Come when called', 10],
    ['ob_05', 'Sit, down, then stay', 12],
    ['ob_06', 'All cues with distractions', 12],
  ],
  separation_anxiety: [
    ['sa_01', 'A calm 10-second goodbye', 8],
    ['sa_02', 'Grab your keys, stay home', 8],
    ['sa_03', 'Out of sight for 2 minutes', 10],
    ['sa_04', 'Out of sight for 10 minutes', 10],
    ['sa_05', 'Alone for 30 minutes', 12],
    ['sa_06', 'Leave at different times', 12],
  ],
  door_manners: [
    ['dm_01', 'Sit at the door', 8],
    ['dm_02', 'Wait at the doorway', 8],
    ['dm_03', 'Wait with the door open', 10],
    ['dm_04', 'Wait while a visitor comes in', 10],
    ['dm_05', 'Wait for the release word', 12],
    ['dm_06', 'Wait when the doorbell rings', 12],
  ],
  impulse_control: [
    ['ic_01', 'The closed-hand game', 8],
    ['ic_02', 'Ignore food on the floor', 8],
    ['ic_03', 'Sit before the bowl goes down', 10],
    ['ic_04', 'Wait, then get the toy', 10],
    ['ic_05', 'Stay calm near exciting things', 12],
    ['ic_06', 'Self-control on walks', 12],
  ],
  cooperative_care: [
    ['cc_01', 'Nose to your hand', 8],
    ['cc_02', 'Chin rest on your palm', 8],
    ['cc_03', 'Handle ears and paws', 10],
    ['cc_04', 'Nails, one tap at a time', 10],
    ['cc_05', 'Calm while held still', 12],
    ['cc_06', 'Practice a vet exam', 12],
  ],
  wait_and_stay: [
    ['ws_01', 'One step back, then return', 8],
    ['ws_02', 'Stay for 10 seconds', 8],
    ['ws_03', 'Stay for 30 seconds', 10],
    ['ws_04', 'Stay while you move around', 10],
    ['ws_05', 'Stay for 3 minutes', 12],
    ['ws_06', 'Stay with distractions', 12],
  ],
  leash_reactivity: [
    ['lr_01', 'Look at that, far away', 10],
    ['lr_02', 'U-turn away from the trigger', 10],
    ['lr_03', 'Parallel walk, far apart', 12],
    ['lr_04', 'Parallel walk, closer in', 12],
    ['lr_05', 'Pass a dog calmly', 15],
    ['lr_06', 'An everyday walk', 15],
  ],
  sit: [
    ['si_01', 'Lure a sit', 8],
    ['si_02', 'Hand signal only', 8],
    ['si_03', 'Voice cue only', 10],
    ['si_04', 'Sit from across the room', 10],
    ['si_05', 'Sit with distractions', 12],
    ['si_06', 'Sit in new places', 12],
  ],
  down: [
    ['dn_01', 'Lure all the way down', 8],
    ['dn_02', 'Hand signal only', 8],
    ['dn_03', 'Voice cue only', 10],
    ['dn_04', 'Down from across the room', 10],
    ['dn_05', 'Down with distractions', 12],
    ['dn_06', 'Down in new places', 12],
  ],
  heel: [
    ['hl_01', 'Find the spot at your side', 8],
    ['hl_02', '5 steps at your side', 8],
    ['hl_03', '20 steps with turns', 10],
    ['hl_04', 'Off leash in the yard', 10],
    ['hl_05', 'Heel past distractions', 12],
    ['hl_06', 'Heel on the sidewalk', 12],
  ],
  touch: [
    ['tc_01', 'Nose to your palm', 5],
    ['tc_02', 'Add the word touch', 5],
    ['tc_03', 'Touch from across the room', 6],
    ['tc_04', 'Follow a moving hand', 6],
    ['tc_05', 'Touch in new places', 6],
    ['tc_06', 'Touch past distractions', 6],
  ],
  spin: [
    ['sp_01', 'Lure a half circle', 5],
    ['sp_02', 'Lure a full circle', 5],
    ['sp_03', 'Spin on a hand signal', 6],
    ['sp_04', 'Spin on the word alone', 6],
    ['sp_05', 'Twirl the other way', 6],
    ['sp_06', 'Spin and twirl in new places', 6],
  ],
  high_five: [
    ['hf_01', 'Paw to your closed hand', 5],
    ['hf_02', 'Paw to your open palm', 5],
    ['hf_03', 'Raise your palm upright', 6],
    ['hf_04', 'High five on the word', 6],
    ['hf_05', 'High five with the other paw', 6],
    ['hf_06', 'High five in new places', 6],
  ],
  bow: [
    ['bw_01', 'Nose down between the paws', 5],
    ['bw_02', 'Elbows down, rear up', 5],
    ['bw_03', 'Add the word bow', 6],
    ['bw_04', 'Hold the bow for 2 seconds', 6],
    ['bw_05', 'Bow on the word alone', 6],
    ['bw_06', 'Bow for an audience', 6],
  ],
  roll_over: [
    ['ro_01', 'Down, then onto one side', 5],
    ['ro_02', 'Relax on one side', 5],
    ['ro_03', 'Lure the full roll', 5],
    ['ro_04', 'Roll with an empty hand', 5],
    ['ro_05', 'Roll over on the word alone', 6],
    ['ro_06', 'Roll over in a new place', 6],
  ],
  leg_weave: [
    ['lw_01', 'Through your legs', 5],
    ['lw_02', 'Around one leg', 5],
    ['lw_03', 'Figure eight with a lure', 6],
    ['lw_04', 'Figure eight, empty hand', 6],
    ['lw_05', 'Weave for 2 walking steps', 6],
    ['lw_06', 'Weave for 4 walking steps', 6],
  ],
};

function getLifecycleStage(ageMonths: number): string {
  if (ageMonths <= 6) return 'puppy';
  if (ageMonths <= 18) return 'adolescent';
  if (ageMonths <= 36) return 'adult';
  return 'senior';
}

function getStartingStage(goal: GoalKey, lifecycleStage: string): string {
  if (lifecycleStage === 'puppy') return 'Stage 1, the basics';
  if (lifecycleStage === 'adolescent') return 'Stage 1, the basics';
  return 'Stage 2, building on it';
}

/** Rules-based plan generator. Also used as fallback when adaptive planner fails. */
export function generatePlan(dog: Dog): Plan {
  const goalKey = resolveGoalKey(dog.behaviorGoals[0]);
  const lifecycleStage = getLifecycleStage(dog.ageMonths);
  const sessionsPerWeek = Math.min(dog.availableDaysPerWeek, 5);
  const totalWeeks = 4;
  const currentStage = getStartingStage(goalKey, lifecycleStage);

  const sequences = buildExercises(SEQUENCES[goalKey], sessionsPerWeek, totalWeeks);

  const sessions: PlanSession[] = sequences.map((s, i) => ({
    id: `session_${i + 1}`,
    exerciseId: s.exerciseId,
    weekNumber: s.weekNumber,
    dayNumber: s.dayNumber,
    title: s.title,
    durationMinutes: s.durationMinutes,
    isCompleted: false,
  }));

  const prefs = normalizeTrainingSchedulePrefs(undefined, dog);
  const trainingDays = chooseTrainingDays({
    sessionsPerWeek,
    availableDaysPerWeek: dog.availableDaysPerWeek,
    prefs,
  });
  const scheduledSessions = buildWeeklySchedule({
    sessions,
    sessionsPerWeek,
    durationWeeks: totalWeeks,
    availableDaysPerWeek: dog.availableDaysPerWeek,
    availableMinutesPerDay: dog.availableMinutesPerDay,
    prefs,
    goal: dog.behaviorGoals[0],
  });

  const goal = dog.behaviorGoals[0] ?? 'General Training';

  return {
    id: '',
    dogId: dog.id,
    goal,
    status: 'active',
    color: getGoalColor(goal),
    durationWeeks: totalWeeks,
    sessionsPerWeek,
    currentWeek: 1,
    currentStage,
    sessions: scheduledSessions,
    metadata: buildPlanMetadata({
      goal: dog.behaviorGoals[0] ?? 'General Training',
      sessionsPerWeek,
      prefs,
      trainingDays,
    }),
    createdAt: new Date().toISOString(),
    // PR-18 multi-course defaults for newly generated plans
    courseTitle: null,
    priority: 0,
    isPrimary: false,
  };
}

export function getPlanTitle(dogName: string, goal: string): string {
  const goalKey = resolveGoalKey(goal);
  return `${dogName}'s 4-week ${GOAL_TITLES[goalKey]}`;
}

export function getPlanBullets(goal: string): string[] {
  const goalKey = resolveGoalKey(goal);
  const bullets: Record<GoalKey, string[]> = {
    leash_pulling: [
      'Teach your dog to look up at you on walks',
      'Stop when the leash goes tight, walk on when it\'s loose',
      'Practice around other dogs and on busier streets',
    ],
    jumping_up: [
      'Greet your dog only when all four paws are down',
      'Teach a sit for attention and at the front door',
      'Practice greetings with visitors and people on walks',
    ],
    barking: [
      'Find how close a trigger can get before your dog barks',
      'Teach a quiet cue and reward the quiet moments',
      'Treat calm looks at triggers from a comfortable distance',
    ],
    recall: [
      'Make their name the best sound they hear all day',
      'Call them from farther away and past distractions',
      'Teach an emergency recall word for off-leash safety',
    ],
    potty_training: [
      'Take your dog out on a schedule tied to meals and naps',
      'Treat right away when they go in the right spot',
      'Use the crate and a leash indoors to stop accidents',
    ],
    crate_anxiety: [
      'Let your dog explore the crate at their own pace',
      'Feed meals and chews inside so the crate means good things',
      'Build alone time in the crate a little at a time',
    ],
    puppy_biting: [
      'Say ouch and pause play when teeth press too hard',
      'Give them a chew toy every time they mouth you',
      'Wind down on a mat when play gets too wild',
    ],
    settling: [
      'Teach your dog to lie down and stay on a mat',
      'Stretch time on the mat from 30 seconds to 10 minutes',
      'Practice settling while the house is busy and at a cafe',
    ],
    leave_it: [
      'Teach leave it with food in your hand and on the floor',
      'Trade toys for treats so drop it feels like a good deal',
      'Practice leave it on the street and at the park',
    ],
    basic_obedience: [
      'Teach sit, down, and stay with a treat lure',
      'Link them together: sit, then down, then stay',
      'Practice every cue with distractions around',
    ],
    separation_anxiety: [
      'Pick up your keys and coat until your dog stops caring',
      'Build alone time from seconds to 30 minutes, slowly',
      'Leave at different times of day so exits feel ordinary',
    ],
    door_manners: [
      'Teach your dog to sit and wait at the door',
      'Keep the wait going with the door open and visitors in',
      'Use a release word so they know when they can go',
    ],
    impulse_control: [
      'Play the closed-hand game: backing off earns the treat',
      'Practice waiting for food, toys, and open doors',
      'Practice staying calm near exciting things on walks',
    ],
    cooperative_care: [
      'Teach a nose touch and a chin rest for handling',
      'Handle ears, paws, and nails a little at a time',
      'Practice a pretend vet exam at home so real ones go easier',
    ],
    wait_and_stay: [
      'Teach a wait at doors, curbs, and before meals',
      'Stretch the stay from 10 seconds to 3 minutes',
      'Practice the stay while you move around and with distractions',
    ],
    leash_reactivity: [
      'Treat calm looks at other dogs from far enough away',
      'Practice U-turns and walking alongside dogs at a distance',
      'Close the distance slowly while your dog stays calm',
    ],
    sit: [
      'Teach sit with a treat lure, then a hand signal',
      'Move to a voice cue and sit from across the room',
      'Practice sit with distractions and in new places',
    ],
    down: [
      'Teach down with a treat lure, then a hand signal',
      'Move to a voice cue and down from across the room',
      'Practice down with distractions and in new places',
    ],
    heel: [
      'Show your dog the spot at your side with treats',
      'Build up to 20 steps together, with turns',
      'Practice heeling in the yard and on the sidewalk',
    ],
    touch: [
      'Teach a nose bump to your open palm',
      'Build it up to either hand, from across the room',
      'Practice touch in new places and past distractions',
    ],
    spin: [
      'Lure a full circle, then fade the treat',
      'Move to a hand signal, then the word alone',
      'Add twirl the other way and practice in new places',
    ],
    high_five: [
      'Start with a paw to your low palm, a shake',
      'Turn your palm upright and add the word',
      'Teach the other paw and practice in new places',
    ],
    bow: [
      'Lure elbows down while the rear stays up',
      'Add the word and build a 2-second hold',
      'Practice on the word alone, from a step away',
    ],
    roll_over: [
      'Start from a down and lure onto one side',
      'Build the full roll, then fade to an empty hand',
      'Practice on the word alone, always on soft ground',
    ],
    leg_weave: [
      'Lure your dog through and around one leg',
      'Link both legs into a figure eight',
      'Build up to weaving for 4 slow walking steps',
    ],
  };
  return bullets[goalKey];
}
