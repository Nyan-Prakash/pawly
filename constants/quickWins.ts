import type { AppIconName } from '@/components/ui/AppIcon';

export type QuickWinCategory = 'calm' | 'focus' | 'play' | 'manners';

/**
 * One colour per family — colour carries meaning, not decoration.
 * `color` is the saturated accent (icon, label); tiles blend it into the
 * current surface colour so the pastel works in both light and dark themes.
 */
export const QUICK_WIN_CATEGORIES: Record<QuickWinCategory, { label: string; color: string }> = {
  calm:    { label: 'Calm',    color: '#4F7DE8' },
  focus:   { label: 'Focus',   color: '#E8930C' },
  play:    { label: 'Play',    color: '#0FA593' },
  manners: { label: 'Manners', color: '#7C4DDB' },
};

/** Linear blend of two hex colours; t=0 → a, t=1 → b. */
export function mixHex(a: string, b: string, t: number): string {
  const pa = a.replace('#', '');
  const pb = b.replace('#', '');
  if (pa.length !== 6 || pb.length !== 6) return a;
  const ch = (i: number) => {
    const x = parseInt(pa.slice(i, i + 2), 16);
    const y = parseInt(pb.slice(i, i + 2), 16);
    return Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
  };
  return `#${ch(0)}${ch(2)}${ch(4)}`;
}

export type QuickWin = {
  id: string;
  category: QuickWinCategory;
  icon: AppIconName;
  title: string;
  duration: string;
  instructions: string;
};

// 2–5 minute drills that need no plan context. Shuffled on the Today screen so
// the rail feels fresh each visit.
export const QUICK_WINS: QuickWin[] = [
  {
    id: 'capture_calm',
    category: 'calm',
    icon: 'moon',
    title: 'Capture Calm',
    duration: '3 min',
    instructions:
      'Keep 10 small treats in your pocket. Wait for your dog to naturally offer calm behavior like lying down, sighing, softening their body, or settling quietly. Walk over, place a treat gently between their paws, and walk away without hyping them up. Repeat for 3 minutes. This teaches your dog that calm behavior makes good things happen and helps build an off-switch indoors.',
  },
  {
    id: 'treat_toss_reset',
    category: 'focus',
    icon: 'refresh',
    title: 'Treat Toss Reset',
    duration: '2 min',
    instructions:
      'Say "get it!" and toss a treat a few feet away from you. As your dog finishes and turns back toward you, mark "yes!" and toss another treat in the opposite direction. Repeat 10 to 15 times. This quick game builds engagement, creates easy repetitions of reorientation back to you, and is great for dogs that get stuck, frustrated, or over-aroused during training.',
  },
  {
    id: 'hallway_recall',
    category: 'play',
    icon: 'walk',
    title: 'Hallway Recall',
    duration: '3 min',
    instructions:
      'Use a hallway or narrow room with minimal distractions. Back away from your dog, crouch slightly, and say their recall cue once in an upbeat voice. When they come to you, mark and reward with 2 to 3 treats in a row. Then reset and repeat 8 to 10 reps. The hallway helps set your dog up for success because there are fewer options to drift away.',
  },
  {
    id: 'collar_grab_game',
    category: 'manners',
    icon: 'paw',
    title: 'Collar Grab Game',
    duration: '2 min',
    instructions:
      'Gently reach for your dog’s collar, touch it for one second, say "yes!" and give a treat. Repeat 10 times. If your dog stays relaxed, progress to lightly holding the collar for 1 to 2 seconds before rewarding. This builds positive feelings about being handled and can make real-life moments like clipping a leash or safely guiding your dog much easier.',
  },
  {
    id: 'default_check_in',
    category: 'focus',
    icon: 'eye',
    title: 'Default Check-In',
    duration: '3 min',
    instructions:
      'Stand quietly with treats ready but say nothing. The moment your dog looks at you on their own, mark "yes!" and reward. Take a few steps, wait again, and reward the next voluntary check-in. Do this for 3 minutes. This builds the habit of your dog choosing to reconnect with you without being nagged, which pays off hugely on walks and in distracting environments.',
  },
  {
    id: 'place_reps',
    category: 'calm',
    icon: 'home',
    title: 'Place Reps',
    duration: '4 min',
    instructions:
      'Use a bed, mat, or low platform. Toss a treat onto the place so your dog steps on it. The moment all four paws are on, mark and feed another treat on the mat. Then release them off and repeat. Do 8 to 12 reps. Keep it fast and easy. This builds value for going to a designated spot and creates a useful behavior for guests, meals, and calming the house down.',
  },
  {
    id: 'chin_rest',
    category: 'manners',
    icon: 'hand-left',
    title: 'Chin Rest',
    duration: '3 min',
    instructions:
      'Sit with your palm open just under your dog’s chin level. Wait for any movement toward your hand. Mark and reward. Shape until your dog gently rests their chin in your palm for 1 to 2 seconds. Feed while their chin stays there. This is a powerful calm cooperative-care skill that can help with grooming, cleaning, harnessing, and general handling.',
  },
  {
    id: 'up_down_pattern',
    category: 'focus',
    icon: 'swap-vertical',
    title: 'Up-Down Pattern',
    duration: '2 min',
    instructions:
      'Say your marker and give a treat near your leg. Then toss the next treat on the floor a few feet away. When your dog finishes and comes back, reward again by your leg. Repeat this up-down rhythm for 2 minutes. This pattern helps regulate excitement, keeps the dog moving in a predictable loop, and makes engagement with you feel very easy and rewarding.',
  },
  {
    id: 'leave_it_intro',
    category: 'manners',
    icon: 'stop-circle',
    title: 'Leave It Intro',
    duration: '3 min',
    instructions:
      'Place a treat in your closed fist and present it to your dog. Let them sniff, lick, or paw without opening your hand. The instant they back off even slightly, mark and reward with a different treat from your other hand. Repeat 8 to 10 reps. This teaches your dog that disengaging from temptation is what earns access to reinforcement.',
  },
  {
    id: 'doorway_wait',
    category: 'manners',
    icon: 'exit',
    title: 'Doorway Wait',
    duration: '3 min',
    instructions:
      'Approach an interior door with your dog on leash or off leash if safe. Reach for the handle. If your dog rushes forward, pause. The moment they hesitate or stop moving, mark and reward. Open the door only when they stay controlled. Repeat several short reps. This builds impulse control around thresholds and makes going through doors calmer and safer.',
  },
  {
    id: 'leash_pressure_game',
    category: 'manners',
    icon: 'git-compare',
    title: 'Leash Pressure Game',
    duration: '3 min',
    instructions:
      'With your dog on leash in a quiet space, apply the lightest possible steady pressure to one side. The instant your dog leans or steps toward the pressure, mark and reward. Practice a few reps to each side and backward. This teaches your dog that moving with leash pressure turns it off, which is far kinder and clearer than dragging or constant tension.',
  },
  { id: 'sniff_walk', category: 'play', icon: 'search', title: 'Sniff Walk', duration: '5 min', instructions: 'Choose a route and let your dog fully lead — wherever their nose goes, you follow. Allow them to sniff every corner, post, and patch of grass for the full duration. No agenda, no cues, no pulling away from smells. This is pure mental enrichment. A 5-minute sniff walk tires a dog as much as a 20-minute regular walk.', }, { id: 'find_it', category: 'play', icon: 'search', title: 'Find It Game', duration: '2 min', instructions: 'Grab 10 pieces of kibble or small treats. Have your dog sit-stay or have someone hold them. Scatter the treats across the floor (or grass) saying "find it!" in an excited voice. Let them sniff and hunt for every piece. Repeat 3 rounds. This nose work game is mentally exhausting and calming — great before a training session or bedtime.', }, { id: 'name_drill', category: 'focus', icon: 'flag', title: 'Name Recognition', duration: '2 min', instructions: 'Grab 10 tiny treats. Stand in a low-distraction space. When your dog is not looking at you, say their name once in a bright tone. The instant they look at you, say "yes!" and toss a treat toward them. Do 10 reps. This 2-minute drill keeps your dog\'s name response sharp and adds daily reinforcement to one of the most critical behaviors in training.', }, { id: 'hand_touch', category: 'focus', icon: 'hand-left', title: 'Hand Touch', duration: '3 min', instructions: 'Hold your palm flat, facing your dog, about 6 inches from their nose. When they sniff or boop your palm, say "yes!" and treat. After 5 reps, add the cue "touch" just before extending your palm. Practice in 3 different spots in your home. Hand touch is useful for recall, re-direction, focus, and as an emergency interrupt behavior.', },
  {
    id: 'find_the_hand',
    category: 'play',
    icon: 'hand-left',
    title: 'Find the Hand',
    duration: '2 min',
    instructions:
      'Hide one hand behind your back with a treat in it and present both hands as fists. Say "find it" and let your dog sniff. When they choose the correct hand, open it and let them have the treat. Repeat 8 to 10 rounds, switching sides often. This is easy mental work, builds confidence, and makes your dog use their nose in a focused way.',
  },
  {
    id: 'scatter_settle',
    category: 'calm',
    icon: 'leaf',
    title: 'Scatter & Settle',
    duration: '5 min',
    instructions:
      'Scatter a small handful of kibble or treats over a snuffle mat, towel, or patch of grass. Let your dog sniff out every piece slowly. When they finish, wait quietly and reward any calm pause or settle that follows. This combines foraging with decompression and works especially well for dogs that are busy, restless, or have trouble winding down.',
  },
  {
    id: 'middle_position',
    category: 'play',
    icon: 'resize',
    title: 'Middle Position',
    duration: '3 min',
    instructions:
      'Stand with your legs slightly apart and lure your dog gently into the space between your legs so they are facing forward with you. Mark and reward several times in position, then release. Repeat 6 to 8 reps. This creates a useful safe parking spot for crowded areas, vet lobbies, or moments when your dog needs structure and closeness.',
  },
  {
    id: 'crate_toss_game',
    category: 'calm',
    icon: 'cube',
    title: 'Crate Toss Game',
    duration: '3 min',
    instructions:
      'Toss a treat into the crate and let your dog go in to get it. As they come back out, calmly toss another one in. After several easy reps, wait a second before tossing the next treat so they begin pausing inside. This keeps crate work positive and low-pressure while building a stronger habit of choosing to enter and remain in the crate.',
  },
  {
    id: 'sit_to_release',
    category: 'manners',
    icon: 'play',
    title: 'Sit to Release',
    duration: '2 min',
    instructions:
      'Ask for a sit before something your dog wants, like a tossed toy, opening the back door, putting down the food bowl, or greeting a person. The sit only needs to last one second. Reward by releasing them to the thing they wanted. Practice 5 to 10 easy reps. This turns real life into training and teaches your dog that self-control unlocks access.',
  },
  {
    id: 'follow_me_game',
    category: 'focus',
    icon: 'footsteps',
    title: 'Follow Me Game',
    duration: '3 min',
    instructions:
      'Walk around your house or yard unpredictably with a few treats ready. Every time your dog chooses to follow and stay near you, mark and reward. Turn often, change pace, and keep it playful. This builds natural orientation and loose leash foundations without formal drilling, especially for dogs who tend to move through life disconnected from their handler.',
  },
  {
    id: 'mat_settle',
    category: 'calm',
    icon: 'square',
    title: 'Mat Settle',
    duration: '5 min',
    instructions:
      'Place a mat or dog bed in a quiet spot. Any time your dog steps on it, lies down, or settles, calmly place a treat between their paws. Stay low-key and avoid exciting praise. Continue for 5 minutes. Over time, the mat becomes a strong cue for relaxation and gives your dog a clear job during dinner, work calls, or visitor arrivals.',
  },
  {
    id: 'engage_disengage',
    category: 'focus',
    icon: 'eye',
    title: 'Look Then Back',
    duration: '3 min',
    instructions:
      'In a low-level distraction environment, let your dog notice something mildly interesting like a toy, sound, or person at distance. The moment they look back at you on their own, mark and reward. Do not lure their attention away. This teaches your dog that noticing the world is fine, but reorienting back to you is what pays.',
  },
  {
    id: 'paw_target_step_up',
    category: 'play',
    icon: 'triangle',
    title: 'Step-Up Target',
    duration: '3 min',
    instructions:
      'Use a low stable object like a book, platform, or upside-down food bowl. Lure your dog to place one or both front paws on it. Mark and reward on the object. Reset and repeat 8 to 10 reps. This builds body awareness, confidence, and rear-end coordination and is a great tiny workout for dogs who need productive mental and physical engagement.',
  },
];
