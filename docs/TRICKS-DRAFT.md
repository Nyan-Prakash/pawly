# Trick courses

Status: wired in (2026-09-20). The content still needs the trainer review listed at the bottom. The file was renamed from `constants/trickProtocolsDraft.ts` to `constants/trickProtocols.ts`; `constants/protocols.ts` imports it and spreads both exports into `PROTOCOLS` and `EXERCISE_TO_PROTOCOL`. The edge function `generate-adaptive-plan` has the matching `GOAL_MAP` and `SEQUENCES` in source but MUST be redeployed before a client with these courses ships: the currently committed function has no `goalOverride` allow-list and falls back to loose leash for any key it does not know, so with adaptive planning on, a trick goal sent to the old function still builds a loose-leash plan.

`tests/goalCoverage.test.ts` now guards the registration lists: every `GOAL_MAP` course has sequences, a title, bullets, protocols and labels; every onboarding option is a `GOAL_MAP` key; the edge function's `GOAL_MAP` and `SEQUENCES` equal the client's.

## What is in the file

`constants/trickProtocols.ts` exports two things:

- `TRICK_PROTOCOLS: Protocol[]`, 18 protocols (6 tricks x 3 stages, 81 steps), typed with the `Protocol` interface imported (type only, so there is no runtime cycle) from `constants/protocols.ts`.
- `TRICK_EXERCISE_TO_PROTOCOL`, plan-exercise ids in the same two-per-stage pattern as `EXERCISE_TO_PROTOCOL`.

| Trick | `behavior` | Protocol ids | Exercise ids | Stage 1 / 2 / 3 |
|---|---|---|---|---|
| Touch (hand target) | `touch` | `touch_s1..s3` | `tc_01..06` | Nose to palm / follow the hand, either hand / new places, distraction, helper |
| Spin | `spin` | `spin_s1..s3` | `sp_01..06` | Lure a circle / word alone / other direction ("twirl") and new places |
| High five | `high_five` | `high_five_s1..s3` | `hf_01..06` | Paw to low palm (a shake) / upright palm and the word / other paw, new places, helper |
| Bow | `bow` | `bow_s1..s3` | `bw_01..06` | Elbows down, rear up / word and a 2-second hold / word alone, distance, audience |
| Roll over | `roll_over` | `roll_over_s1..s3` | `ro_01..06` | Onto one side / full roll, empty hand / word alone, new place |
| Leg weave | `leg_weave` | `leg_weave_s1..s3` | `lw_01..06` | Through and around one leg / figure eight / weave for 4 walking steps |

Decisions taken:

- "Go to mat / park it" was dropped. `settle_s1..s3` already teaches a cued "place" on a mat, from any room and in new places. Leg weave replaces it.
- There is no shake course in `protocols.ts` (grep finds "shake" only as "shake it off"), so the sixth trick is high five rather than wave. Its stage 1 is a shake, so the onboarding `shake` option could point at `high_five_s1` until a separate course exists.
- Ids follow the existing `<behavior>_s<stage>` convention. None of the 18 ids, 6 behavior keys, or 6 exercise prefixes collide with anything in `protocols.ts` (checked by script).

How the copy follows `docs/EXERCISE-DESIGN.md` (also checked by script):

- Instruction 12 words or fewer, `then` 12 or fewer, `tip` 16 or fewer, `successLook` 10 or fewer.
- Three to five steps per session; each step raises exactly one criterion.
- `repCount` equals the sum of step reps. Sessions are 5 to 6 minutes. Roll over is capped at 15 to 18 reps because of the physical load.
- `successCriteria` use the 80 percent rule ("8 times out of 10").
- Every session ends on a 60-second free sniff or play release.
- Marker and treat placement are referred to as "mark and treat", as in the existing courses. Setup lives in `setup`, not in step 1.
- `supportsLiveAiTrainer` is `false` everywhere. `ageMinMonths: 8` and `ageMaxMonths: 999` copy the existing default. Touch, spin and high five are fine for younger puppies if the lead wants to lower that.

## Where a course is registered (done for the six tricks)

A course is registered in several hand-maintained lists. For each new `behavior` key (`touch`, `spin`, `high_five`, `bow`, `roll_over`, `leg_weave`):

1. `constants/protocols.ts`: move (or import and spread) the 18 protocols into `PROTOCOLS`, and merge `TRICK_EXERCISE_TO_PROTOCOL` into `EXERCISE_TO_PROTOCOL`. `PROTOCOLS_BY_ID` and `PROTOCOLS_BY_BEHAVIOR` derive from `PROTOCOLS`.
2. `lib/planGenerator.ts`: add to the `GoalKey` union, `GOAL_MAP` (snake_case key and display label), `GOAL_TITLES`, `SEQUENCES` (six `[exerciseId, title, minutes]` rows per course, using the ids above), and the `bullets` record inside `getPlanBullets`. All are `Record<GoalKey, ...>`, so tsc will flag any that are missed.
3. `supabase/functions/generate-adaptive-plan/index.ts`: the same `GOAL_MAP` and `SEQUENCES` are duplicated server-side. Update both and redeploy the function. `OUTDOOR_GOALS_SERVER` does not need the tricks.
4. `constants/courseColors.ts`: add the keys to `GOAL_KEYS`. Colours need no work; every course resolves to the single accent.
5. `lib/addCourseUtils.ts`: `GOAL_LABEL_MAP` and `GOAL_TITLES`.
6. `lib/scheduleEngine.ts`: the goal label map near line 835. Tricks are indoor, so leave `OUTDOOR_GOALS` alone.
7. `app/(tabs)/train/add-course.tsx`: add a course entry (`key`, `label`, `description`, `icon`) for each trick.
8. `components/train/ActiveCourseCard.tsx`: icon map. `app/(tabs)/progress/index.tsx`: goal label map near line 163.
9. `constants/onboardingGoals.ts`: `ISSUE_OPTIONS` and `TRICK_OPTIONS` for onboarding (moved out of `app/(onboarding)/dog-basics.tsx`). Every `value` must be a `GOAL_MAP` key.
10. Tests: `tests/goalCoverage.test.ts` fails if a course is missing from any of the lists in 1 to 6 or 9, or if the edge function drifts from the client.

Two more copies of a goal map exist and were left alone because they pass unknown snake_case keys through or are only a pre-flight check: `supabase/functions/adapt-plan/index.ts` (`GOAL_MAP[plan.goal] ?? plan.goal...`) and `lib/adaptivePlanning/initialPlanner.ts` (original eight goals only; for every later course it looks up the loose-leash skill nodes as its pre-flight check, then sends the real goal to the edge function as `goalOverride`). The second is worth replacing with `resolveGoalKey` from `lib/planGenerator.ts` in a separate change, since it moves the non-graph courses from the server fallback to the client fallback.

Skill graph: no migration is required. `skill_nodes` and `skill_edges` (`supabase/migrations/20260316010200_full_skill_graph.sql`) cover only the original eight behaviors. Every later course (sit, down, heel, door manners and so on) has no nodes and runs on the rules fallback in `generate-adaptive-plan` ("No skill nodes for behavior"). The tricks will do the same. If adaptive graphs are wanted for tricks later, note that `skill_nodes.protocol_id` has a foreign key to the `protocols` table (`20260313100100_protocols.sql`), so the protocol rows would have to be inserted there first. `session_logs.protocol_id` is plain text and needs nothing.

Fixed (2026-09-20): `TRICK_OPTIONS` values are now real course keys (`stay` and `wait` merged into `wait_and_stay`, `shake` folded into `high_five` as "Shake and high five", `leave_it_trick` to `leave_it`, `place` to `settling`; `play_dead`, `fetch` and `speak` removed; `bow` and `leg_weave` added), and `resolveGoalKey` in `lib/planGenerator.ts` and the edge function warn when a goal is not in `GOAL_MAP` instead of falling back silently. The original finding: onboarding `TRICK_OPTIONS` offers `stay`, `shake`, `spin`, `roll_over`, `play_dead`, `fetch`, `high_five`, `speak`, `leave_it_trick`, `touch` and `place`, but none of those keys is in `GOAL_MAP`. Both `generatePlan` and the edge function fall back with `GOAL_MAP[goal] ?? 'leash_pulling'`, so a user who picks "Spin" silently gets a loose-leash plan. Wiring this draft fixes four of the eleven. The rest need either content, a mapping to an existing course (`stay` to `wait_and_stay`, `place` to `settling`, `leave_it_trick` to `leave_it`), or removal from the list.

## What a certified trainer should double-check

- **Roll over safety copy.** The draft says to skip it for dogs with back, hip or neck problems, to ask a vet first for long-backed and deep-chested breeds, to wait 2 hours after a meal, and to use soft ground only. The meal gap is a cautious convention around bloat risk rather than an evidence-based figure; a vet should confirm the wording.
- **Bow and high five load.** Bow is a real shoulder, elbow and spine stretch; high five loads the shoulder and wrist. Both carry "ask your vet" notes and low targets (palm at chest height). Confirm the hold of 2 seconds and the rep counts are sensible for large and older dogs.
- **Bow method.** Lure from a stand, mark before the rear drops, hands off. Many trainers put an arm under the belly; the draft deliberately avoids physical prompting. Confirm that the shaping route is reliable enough for beginners.
- **High five and demand pawing.** Stage 2 tells the owner to pay only cued taps. Confirm this is enough guidance for dogs who already paw at people.
- **Leg weave.** Some dogs are uncomfortable being stood over, and the handler can lose balance or clip the dog. The draft makes passing through the dog's choice, holds each step still, and tells giant-breed owners and unsteady handlers to skip it. Check the size guidance.
- **Spin.** Rep spacing for excitable dogs, and whether to flag compulsive spinning or tail chasing (bull terriers, some herding breeds) as a reason to skip the trick.
- **Helper steps** (`touch_s3`, `high_five_s3`): limited to people the dog already likes, with children supervised and still. Confirm that is conservative enough, or whether child helpers should be removed.
- **Age floor.** `ageMinMonths: 8` is the same floor sit, down and basic obedience use (only puppy biting is lower), so touch, spin and high five already match the basic courses. Nothing in the app reads `ageMinMonths` to gate a course today. Roll over and leg weave for puppies under about 6 months on slippery floors is the main concern; the setup lists require non-slip or soft surfaces.
