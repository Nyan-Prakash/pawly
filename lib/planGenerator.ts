import type { Dog, Plan, PlanSession } from '../types';
import { getGoalColor } from '../constants/courseColors.ts';
import {
  buildPlanMetadata,
  buildWeeklySchedule,
  chooseTrainingDays,
  normalizeTrainingSchedulePrefs,
} from './scheduleEngine.ts';

type GoalKey =
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
  | 'heel';

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
};

const GOAL_TITLES: Record<GoalKey, string> = {
  leash_pulling: 'Loose Leash Foundation Plan',
  jumping_up: 'Four Paws on the Floor Plan',
  barking: 'Quiet Cue & Threshold Plan',
  recall: 'Reliable Recall Plan',
  potty_training: 'Potty Training Bootcamp',
  crate_anxiety: 'Crate Confidence Plan',
  puppy_biting: 'Bite Inhibition Plan',
  settling: 'Calm Settle Plan',
  leave_it: 'Leave It & Drop It Plan',
  basic_obedience: 'Basic Obedience Foundation Plan',
  separation_anxiety: 'Separation Anxiety Plan',
  door_manners: 'Door Manners Plan',
  impulse_control: 'Impulse Control Plan',
  cooperative_care: 'Cooperative Care Plan',
  wait_and_stay: 'Wait & Stay Plan',
  leash_reactivity: 'Leash Reactivity Plan',
  sit: 'Sit Foundation Plan',
  down: 'Down Foundation Plan',
  heel: 'Heel Foundation Plan',
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

const SEQUENCES: Record<GoalKey, Array<[string, string, number]>> = {
  leash_pulling: [
    ['ll_01', 'Name recognition & eye contact', 8],
    ['ll_02', 'Stand still — pressure off', 8],
    ['ll_03', 'One step & stop', 10],
    ['ll_04', 'Change of direction', 10],
    ['ll_05', 'U-turn on cue', 12],
    ['ll_06', 'Walking on a loose leash — short distance', 12],
    ['ll_07', 'Distraction proofing — other dogs', 15],
    ['ll_08', 'Loose leash on busy street', 15],
  ],
  jumping_up: [
    ['ju_01', 'Four-on-floor for greetings', 8],
    ['ju_02', 'Auto-sit for attention', 8],
    ['ju_03', 'Door greeting protocol', 10],
    ['ju_04', 'Stranger greeting practice', 10],
    ['ju_05', 'Impulse control — excitement threshold', 12],
    ['ju_06', 'Off cue proofing', 12],
  ],
  barking: [
    ['bk_01', 'Quiet cue foundation', 8],
    ['bk_02', 'Look at That — desensitisation', 8],
    ['bk_03', 'Threshold mapping', 10],
    ['bk_04', 'Place cue at threshold', 10],
    ['bk_05', 'Quiet cue with trigger present', 12],
    ['bk_06', 'Real-world proofing', 15],
  ],
  recall: [
    ['rc_01', 'Name game — high value rewards', 8],
    ['rc_02', 'Recall from 3 feet', 8],
    ['rc_03', 'Recall from 10 feet', 10],
    ['rc_04', 'Recall with mild distraction', 10],
    ['rc_05', 'Long-line recall — 20 feet', 12],
    ['rc_06', 'Emergency recall cue', 12],
    ['rc_07', 'Off-leash recall in enclosed area', 15],
  ],
  potty_training: [
    ['pt_01', 'Establish schedule — every 2 hours', 5],
    ['pt_02', 'Reward zone protocol', 5],
    ['pt_03', 'Crate introduction for potty rhythm', 8],
    ['pt_04', 'Tether training indoors', 8],
    ['pt_05', 'Potty on cue', 10],
    ['pt_06', 'Extend interval to 3 hours', 5],
  ],
  crate_anxiety: [
    ['ca_01', 'Open door exploration', 8],
    ['ca_02', 'Meals inside — building love', 5],
    ['ca_03', 'Door closed, 10 seconds', 8],
    ['ca_04', 'Door closed, 2 minutes', 8],
    ['ca_05', 'Out of sight, 5 minutes', 10],
    ['ca_06', 'Out of sight, 20 minutes', 10],
    ['ca_07', 'Full departure routine', 12],
  ],
  puppy_biting: [
    ['pb_01', 'Yelp & pause — pressure off', 5],
    ['pb_02', 'Toy redirect on contact', 5],
    ['pb_03', 'Time-out for hard bites', 8],
    ['pb_04', 'Calm four-paws greeting', 8],
    ['pb_05', 'Mat settle to wind down', 10],
    ['pb_06', 'Stay soft in excited play', 10],
  ],
  settling: [
    ['st_01', 'Mat introduction', 8],
    ['st_02', 'Down on mat on cue', 8],
    ['st_03', '30-second hold', 10],
    ['st_04', '3-minute hold', 10],
    ['st_05', 'Calm during household activity', 12],
    ['st_06', 'Hold with mild distractions', 12],
    ['st_07', 'Real-world café or visit', 15],
  ],
  leave_it: [
    ['li_01', 'Hand targeting foundation', 8],
    ['li_02', 'Floor drop on cue', 8],
    ['li_03', 'Trade up — toy for treat', 10],
    ['li_04', 'Moving object self-control', 10],
    ['li_05', 'High-distraction proofing', 12],
    ['li_06', 'Real-world street & park', 12],
  ],
  basic_obedience: [
    ['ob_01', 'Sit on cue from a lure', 8],
    ['ob_02', 'Down on cue from a lure', 8],
    ['ob_03', '5-second stay', 10],
    ['ob_04', 'Name recall foundation', 10],
    ['ob_05', 'Sit → down → stay chain', 12],
    ['ob_06', 'All cues with distractions', 12],
  ],
  separation_anxiety: [
    ['sa_01', '10-second calm goodbye', 8],
    ['sa_02', 'Keys & coat — no big deal', 8],
    ['sa_03', 'Out of sight, 2 minutes', 10],
    ['sa_04', 'Out of sight, 10 minutes', 10],
    ['sa_05', 'Full 30-minute alone stretch', 12],
    ['sa_06', 'Random departure times', 12],
  ],
  door_manners: [
    ['dm_01', 'Automatic sit at the door', 8],
    ['dm_02', 'Hold at the threshold', 8],
    ['dm_03', 'Hold with door fully open', 10],
    ['dm_04', 'Hold while a visitor arrives', 10],
    ['dm_05', 'Release on cue — proofing', 12],
    ['dm_06', 'Front door in real life', 12],
  ],
  impulse_control: [
    ['ic_01', 'It\'s Your Choice foundation', 8],
    ['ic_02', 'Ignore food on the floor', 8],
    ['ic_03', 'Sit calmly before meals', 10],
    ['ic_04', 'Wait for the toy — then release', 10],
    ['ic_05', 'Hold it together near triggers', 12],
    ['ic_06', 'Real-world self-control', 12],
  ],
  cooperative_care: [
    ['cc_01', 'Nose-to-hand touch target', 8],
    ['cc_02', 'Chin rest on your palm', 8],
    ['cc_03', 'Ears, paws — no big deal', 10],
    ['cc_04', 'Nail touching & clippers near', 10],
    ['cc_05', 'Calm under gentle restraint', 12],
    ['cc_06', 'Mock vet table & exam', 12],
  ],
  wait_and_stay: [
    ['ws_01', 'One step back & return', 8],
    ['ws_02', '10-second hold', 8],
    ['ws_03', '30-second hold', 10],
    ['ws_04', 'Hold while you move around', 10],
    ['ws_05', '3-minute hold', 12],
    ['ws_06', 'Hold with distractions', 12],
  ],
  leash_reactivity: [
    ['lr_01', 'Look at That — below threshold', 10],
    ['lr_02', 'U-turn on trigger', 10],
    ['lr_03', 'Parallel walking — far distance', 12],
    ['lr_04', 'Parallel walking — close distance', 12],
    ['lr_05', 'Threshold approach — calm passes', 15],
    ['lr_06', 'Real-world reactive walk', 15],
  ],
  sit: [
    ['si_01', 'Lure into position', 8],
    ['si_02', 'Hand signal only', 8],
    ['si_03', 'Voice cue only', 10],
    ['si_04', 'Sit from across the room', 10],
    ['si_05', 'Hold it with distractions', 12],
    ['si_06', 'New places, same response', 12],
  ],
  down: [
    ['dn_01', 'Lure all the way down', 8],
    ['dn_02', 'Hand signal only', 8],
    ['dn_03', 'Voice cue only', 10],
    ['dn_04', 'Down from across the room', 10],
    ['dn_05', 'Hold it with distractions', 12],
    ['dn_06', 'New places, same response', 12],
  ],
  heel: [
    ['hl_01', 'Find the sweet spot position', 8],
    ['hl_02', '5 steps clean beside you', 8],
    ['hl_03', '20 steps with turns', 10],
    ['hl_04', 'Off-leash in the yard', 10],
    ['hl_05', 'Hold form near distractions', 12],
    ['hl_06', 'Real-world sidewalk', 12],
  ],
};

function getLifecycleStage(ageMonths: number): string {
  if (ageMonths <= 6) return 'puppy';
  if (ageMonths <= 18) return 'adolescent';
  if (ageMonths <= 36) return 'adult';
  return 'senior';
}

function getStartingStage(goal: GoalKey, lifecycleStage: string): string {
  if (lifecycleStage === 'puppy') return 'Stage 1 — Foundation';
  if (lifecycleStage === 'adolescent') return 'Stage 1 — Foundation';
  return 'Stage 2 — Building';
}

/** Rules-based plan generator. Also used as fallback when adaptive planner fails. */
export function generatePlan(dog: Dog): Plan {
  const goalKey: GoalKey = GOAL_MAP[dog.behaviorGoals[0]] ?? 'leash_pulling';
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
  const goalKey: GoalKey = GOAL_MAP[goal] ?? 'leash_pulling';
  return `${dogName}'s 4-Week ${GOAL_TITLES[goalKey]}`;
}

export function getPlanBullets(goal: string): string[] {
  const goalKey: GoalKey = GOAL_MAP[goal] ?? 'leash_pulling';
  const bullets: Record<GoalKey, string[]> = {
    leash_pulling: [
      'Build automatic eye contact so your dog checks in on walks',
      'Teach pressure-off: slack leash = forward, tension = stop',
      'Proof loose leash with distractions in real environments',
    ],
    jumping_up: [
      'Teach four-on-floor as the default greeting behavior',
      'Install an auto-sit for attention and at doors',
      'Proof with strangers and high excitement moments',
    ],
    barking: [
      'Identify triggers and map your dog\'s threshold distance',
      'Build a reliable quiet cue with reward history',
      'Desensitize to trigger with Look-at-That protocol',
    ],
    recall: [
      'Build a strong recall response with high-value rewards',
      'Proof recall at increasing distances and with distractions',
      'Install an emergency recall cue for off-leash safety',
    ],
    potty_training: [
      'Establish a consistent schedule tied to meals and naps',
      'Reward immediately in the correct spot every time',
      'Use crate and tether to prevent accidents and build habits',
    ],
    crate_anxiety: [
      'Introduce the crate at your dog\'s pace — never force',
      'Build positive associations with meals and chews inside',
      'Incrementally extend alone time in 5-step intervals',
    ],
    puppy_biting: [
      'Teach bite inhibition through consistent yelp-and-pause',
      'Redirect all mouthing to appropriate chew toys',
      'Reduce arousal spikes with a settle-on-mat routine',
    ],
    settling: [
      'Teach a reliable down-stay on a designated mat',
      'Build duration from 30 seconds to 10 minutes',
      'Proof settling in busy environments and during household activity',
    ],
    leave_it: [
      'Build a rock-solid leave it from hand, floor, and moving objects',
      'Teach drop it with a positive toy exchange',
      'Proof in high-distraction real-world environments',
    ],
    basic_obedience: [
      'Establish sit, down, and stay as reliable cued behaviors',
      'Chain sit-down-stay for real-world control',
      'Proof all cues with distractions',
    ],
    separation_anxiety: [
      'Desensitise departure cues so they no longer predict absence',
      'Build alone time from seconds to 30+ minutes incrementally',
      'Proof with varied departure times and routines',
    ],
    door_manners: [
      'Teach a reliable sit-and-wait at every threshold',
      'Build duration with the door wide open and visitors arriving',
      'Install a clear release cue so your dog knows when they can move',
    ],
    impulse_control: [
      'Teach "It\'s Your Choice" — calm attention earns access',
      'Build self-control around food, toys, and excitement',
      'Proof in high-arousal real-world situations',
    ],
    cooperative_care: [
      'Build a chin rest and touch target for calm handling',
      'Desensitise ears, paws, and nail touching',
      'Simulate vet visits so your dog accepts restraint calmly',
    ],
    wait_and_stay: [
      'Build a reliable wait at doors, kerbs, and before meals',
      'Extend stay duration from 10 seconds to 3 minutes',
      'Proof stay with movement and distractions',
    ],
    leash_reactivity: [
      'Keep your dog below threshold with Look at That',
      'Build U-turns and parallel walking at safe distances',
      'Gradually reduce distance to triggers with calm passes',
    ],
    sit: [
      'Teach sit from a lure to a verbal cue',
      'Build reliability at a distance and in new environments',
      'Proof sit in high-distraction settings',
    ],
    down: [
      'Teach down from a lure to a verbal cue',
      'Build reliability at a distance and in new environments',
      'Proof down with distractions and in novel places',
    ],
    heel: [
      'Establish the heel position with luring and marking',
      'Build clean heel work with turns over 20+ steps',
      'Proof heel off-leash and on real-world sidewalks',
    ],
  };
  return bullets[goalKey];
}
