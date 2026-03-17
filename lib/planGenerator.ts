import type { Dog, Plan, PlanSession } from '../types';
import {
  buildPlanMetadata,
  buildWeeklySchedule,
  chooseTrainingDays,
  normalizeTrainingSchedulePrefs,
} from './scheduleEngine';

type GoalKey =
  | 'leash_pulling'
  | 'jumping_up'
  | 'barking'
  | 'recall'
  | 'potty_training'
  | 'crate_anxiety'
  | 'puppy_biting'
  | 'settling';

export const GOAL_MAP: Record<string, GoalKey> = {
  leash_pulling: 'leash_pulling',
  jumping_up: 'jumping_up',
  barking: 'barking',
  recall: 'recall',
  potty_training: 'potty_training',
  crate_anxiety: 'crate_anxiety',
  puppy_biting: 'puppy_biting',
  settling: 'settling',
  'Leash Pulling': 'leash_pulling',
  'Jumping Up': 'jumping_up',
  'Barking': 'barking',
  "Won't Come": 'recall',
  'Potty Training': 'potty_training',
  'Crate Anxiety': 'crate_anxiety',
  'Puppy Biting': 'puppy_biting',
  'Settling': 'settling',
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
    ['ca_01', 'Crate introduction — door open', 8],
    ['ca_02', 'Feeding meals in crate', 5],
    ['ca_03', 'Door closed — 10 seconds', 8],
    ['ca_04', 'Door closed — 2 minutes', 8],
    ['ca_05', 'Crate — out of sight 5 minutes', 10],
    ['ca_06', 'Crate — out of sight 20 minutes', 10],
    ['ca_07', 'Crate — full departure routine', 12],
  ],
  puppy_biting: [
    ['pb_01', 'Bite inhibition — yelp & pause', 5],
    ['pb_02', 'Redirect to toy', 5],
    ['pb_03', 'Time-out protocol', 8],
    ['pb_04', 'Calm greeting routine', 8],
    ['pb_05', 'Arousal down — settle on mat', 10],
    ['pb_06', 'Proofing with excited play', 10],
  ],
  settling: [
    ['st_01', 'Mat introduction', 8],
    ['st_02', 'Down on mat on cue', 8],
    ['st_03', 'Stay on mat — 30 seconds', 10],
    ['st_04', 'Stay on mat — 3 minutes', 10],
    ['st_05', 'Settle during human activity', 12],
    ['st_06', 'Settle with mild distractions', 12],
    ['st_07', 'Settle — real-world cafe / visit', 15],
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

  return {
    id: '',
    dogId: dog.id,
    goal: dog.behaviorGoals[0] ?? 'General Training',
    status: 'active',
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
  };
  return bullets[goalKey];
}
