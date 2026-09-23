# Step clip pilot: five Tier 1 clips

Status (2026-09-23): **done.** All five clips generated, reviewed against their accuracy
checks, encoded into `assets/video/` and wired into `constants/stepMedia.ts`. Spend was
$1.83: clean room $0.15, five start frames $0.75, five clips $0.63, one retry of the
turn-your-back clip $0.28 (end frame $0.15 + clip $0.13).

What the pilot taught:
- The five start-frame edits and the four hand-only clips landed first try.
- The one failure was the crouch: given "the owner crouches", H3 Max pulled a full
  character with a face into frame. Pinning an `end_image_url` of the crouched legs and
  one arm fixed it. Use a pinned end frame for any clip where the owner's body has to
  move, not just a hand.
- Stripping audio and encoding at CRF 26 takes a clip from ~1.5 MB to ~160 KB.
- `impulse_s1`[0] is an open palm, not a closed fist; the shortlist was wrong there and
  the mapping was dropped. Check the step text, not the shortlist, before mapping.

Decisions: pilot of 5 before the rest of Tier 1; the owner appears as a partial figure
only (forearm, hand, lower legs entering from the frame edge, same flat palette), never
a full character.

## Pipeline (same as the crate clips, ~$0.28 per clip)

1. Upload the base still `assets/video/crate_s1_1_poster.jpg` (768×768) via
   `upload_file` prepare_upload + `curl -X PUT`.
2. One edit with `fal-ai/nano-banana-pro/edit` ($0.15) to make a reusable **clean room**:
   remove the crate, keep everything else. Save the result URL; every clip starts from it.
3. Per clip: one `nano-banana-pro/edit` ($0.15) to stage the start frame, then
   `minimax/h3-max/image-to-video` at 5 s, 768P, `prompt_expansion_mode: "disabled"`
   ($0.125). Use `submit_job` + `check_job` for the video.
4. Download the mp4, strip audio and re-encode, make the poster:
   ```bash
   ffmpeg -y -i in.mp4 -an -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart assets/video/<name>.mp4
   ffmpeg -y -i assets/video/<name>.mp4 -frames:v 1 -q:v 4 assets/video/<name>_poster.jpg
   ```
5. Add the `STEP_MEDIA` entries listed at the bottom. Check the clip on device before
   committing; a clip that shows the mistake is worse than no clip.

Budget: clean room $0.15 + 5 × $0.28 = $1.55 first pass. Allow $3 for retries.

## Shared prompt fragments

**Style line (append to every edit prompt):** "Keep the exact same flat 2D vector
illustration style, the same puppy (cream face, brown patch over one eye, brown body),
the same room, rug, blue armchair, picture, window and lighting. No new characters.
The owner is shown only as a forearm and hand, or lower legs and feet, entering from the
edge of the frame, in the same flat style with a plain cream sleeve and blue trouser leg."

**Motion line (append to every video prompt):** "Static locked-off camera, no pan, no
zoom, no cuts. Flat 2D cartoon animation, smooth simple motion. Nothing in the room
moves except the puppy and the owner's hand. No text, no sound effects."

## The five clips

### 1. Sit lure → `sit_s1`[0], `obedience_s1`[0]
File: `sit_lure.mp4`. Label: "A treat held at the puppy's nose lifts up and back, and the puppy sits."

- Edit: clean room; puppy standing on the rug facing right; from the right edge an
  owner's forearm and hand reach in, holding a small brown treat right at the puppy's
  nose, level with it. No ball, no bone on the floor.
- Video: "The hand slowly lifts the treat up and back over the puppy's head. The puppy's
  nose follows the treat upward and its rear end lowers until it is sitting. The hand
  then brings the treat down to the puppy's mouth and the puppy eats it."
- Check: treat starts *at the nose*, not above it; rear goes down, puppy does not back up
  or jump; treat delivered while sitting.

### 2. Down lure → `down_s1`[0], `obedience_s1`[3]
File: `down_lure.mp4`. Label: "From a sit, a treat is lowered to the floor and slid forward, and the puppy lies down."

- Edit: clean room; puppy sitting on the rug facing right; owner's forearm and hand from
  the right edge holding a treat at the puppy's nose.
- Video: "The hand lowers the treat straight down between the puppy's front paws, then
  slides it slowly forward along the floor. The puppy's head follows down, its elbows
  touch the floor and it lies down fully. The hand gives the treat."
- Check: treat goes *down first, then out*, not diagonally; elbows land before the hips;
  puppy does not stand up to follow.

### 3. Stay palm → `sit_s2`[0], `obedience_s2`[0], `wait_stay_s1`[1]
File: `stay_palm.mp4`. Label: "The puppy sits while a flat palm is held toward it, then gets a treat without moving."

- Edit: clean room; puppy sitting on the rug facing right, calm; owner's forearm and
  open flat hand, palm facing the puppy, held still at the right edge about a foot from
  the puppy's face.
- Video: "The open palm stays perfectly still. The puppy sits and does not move for a
  few seconds, looking at the hand. Then a second hand enters low from the right and
  places a treat at the puppy's mouth while it is still sitting. The puppy eats it and
  stays sitting."
- Check: palm faces the dog and does not wave; puppy stays seated the whole clip; treat
  arrives *while seated*, not after standing.

### 4. Closed fist → `leave_it_s1`[0], `leave_it_s1`[1], `biting_s3`[0]
File: `closed_fist.mp4`. Label: "The puppy licks and paws at a closed fist, backs off, and gets a treat from the other hand."

- Edit: clean room; puppy sitting on the rug facing right; owner's forearm and closed
  fist at the puppy's nose height, right in front of its nose.
- Video: "The puppy sniffs and licks the closed fist and pushes at it with a paw. The
  fist stays closed and still. The puppy gives up and pulls its head back. Then a second
  open hand enters from the right with a treat and gives it to the puppy. The fist never
  opens."
- Check: the fist never opens; the treat comes from the *other* hand; puppy visibly
  backs its nose away before the reward.

### 5. Turn your back → `jumping_s1`[0], `jumping_s1`[1], `jumping_s2`[2]
File: `turn_back.mp4`. Label: "The puppy jumps up on the owner's legs, the owner turns away, and when four paws land the owner crouches and treats."

- Edit: clean room; owner's lower legs and feet (blue trousers, plain shoes) standing
  at the right side of the frame facing the puppy; puppy standing on the rug with its
  front paws up on the owner's shin.
- Video: "The legs turn away so the owner's back is to the puppy. The puppy drops so all
  four paws are on the rug and looks up. The legs turn back and bend as the owner crouches;
  a hand comes down and gives the puppy a treat while all four paws stay on the floor."
- Check: the turn happens *while* paws are up; treat only after four paws are down and
  only from a crouch, never from standing height.

## STEP_MEDIA entries (now in constants/stepMedia.ts)

```ts
// constants/stepMedia.ts
const sitLure = { video: require('@/assets/video/sit_lure.mp4'), aspectRatio: 1, poster: require('@/assets/video/sit_lure_poster.jpg'), label: '…' };
const downLure = { … 'down_lure' … };
const stayPalm = { … 'stay_palm' … };
const closedFist = { … 'closed_fist' … };
const turnBack = { … 'turn_back' … };

sit_s1: { 0: sitLure },
obedience_s1: { 0: sitLure, 3: downLure },
down_s1: { 0: downLure },
sit_s2: { 0: stayPalm },
obedience_s2: { 0: stayPalm },
wait_stay_s1: { 1: stayPalm },
leave_it_s1: { 0: closedFist, 1: closedFist },
biting_s3: { 0: closedFist },
jumping_s1: { 0: turnBack, 1: turnBack },
jumping_s2: { 2: turnBack },
```

## Known layout issue to settle before shipping

A clip replaces the step's rep counter and timer. All five pilot steps are rep steps
(`sit_s1`[0] is 10 reps, and so on), so shipping them as-is removes the counter the
owner uses to log reps. Either stack the counter under the clip or shrink the clip
height; see the shortlist doc.

## Batch 2 (2026-09-23): the remaining 36 clips from the shortlist

User chose to generate all remaining Tier 1 + Tier 2 clips. Prompts, bases and step
mappings live in the session manifest (scratchpad) and the results are in
`constants/stepMedia.ts`. Three new base scenes were made from the clean room: a park
path, a front door, and the room with a grey mat.

Result: **all 36 shipped** after two retry rounds (see below). Total in the app is now 46
clips over 81 steps in 41 courses, which is every clip on the shortlist. Bundle: ~15 MB of mp4, of which the five older crate clips are
9 MB (re-encode them the same way to save ~8 MB).

Passed (26): heel_position, treat_toss_self, foot_over_kibble, drop_it_trade,
redirect_toy, open_flat_hand, name_look_hip, under_threshold, look_back,
crouch_open_arms, hip_roll, frozen_toy, touch_gradient, paw_cup, quiet_at_nose,
clippers, ouch_freeze, crate_ignoring, treat_between_paws, paw_on_mat, down_on_mat,
door_one_inch, ring_bell, and three weak passes worth a second look on device:
step_back (the backward step barely reads), u_turn (owner's shirt turns yellow mid clip,
no face), clap_run_away (a yellow torso flashes mid clip, no face).

Failed, need a retry with a pinned end frame (6): tight_leash_freeze and slack_then_go
(owner's head grew into the top of the frame), lowering_bowl (head in frame),
curved_greeting (a third dog appeared), left_turn_heel (no turn happened), step_behind
(no circle, a stray green sleeve). Their start frames are done; each retry is one end
frame edit ($0.15) plus one clip ($0.13).

Not generated, balance ran out (4): reaction_walk_away (needs its end frame too),
walk_treat_to_mat, doorbell_to_mat, potty_tell (start and end frames all done).

Cost to finish: about $2.50. Spend on this batch so far: about $12.

What the batch taught, on top of the pilot:
- Start frames land first try almost every time (35 of 36; the crate scene drew two
  puppies and needed one fix).
- Clips where the owner is only a hand pass at ~90%. Clips where the legs move pass
  at ~50% even with an end frame; when a start frame has the owner's arm entering
  from the top, H3 Max tends to extend it into a torso and head. Keep arms entering
  from the side, not the top, in leg scenes.
- Two-dog scenes need the second dog described in the video prompt too, or a third
  one can appear.

## Retry round (2026-09-23, later the same day)

All 10 open clips finished for about $2.30. First pass: the six retries with pinned end
frames all passed (tight_leash_freeze used its start frame as the end frame too, which
holds the owner perfectly still), and reaction_walk_away passed. The three fresh mat and
potty clips failed because the owner *bent down* to place a treat or pick up a leash,
and the bend drags a head into frame. Second pass fixed all three by never bending: the
treat is tossed in from the frame edge and the leash is "whisked up" off screen, with
end frames that contain legs only, no arms. Rule for future clips: **the owner never
bends or crouches unless the crouch itself is the lesson**; deliver treats by toss or
from a hand at the side edge.

Total spend across pilot, batch 2 and retries: about $16.50.
