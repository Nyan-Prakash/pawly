# How Pawly sessions should work

A proposal, not yet code. It answers four questions: what makes a dog-training exercise work, how Duolingo structures practice and what to borrow, whether the current exercise copy is too wordy (it is, by about half), and what the exercise screen should look like.

## 1. What makes an exercise work

The training literature and working trainers agree on a small set of rules. Pawly's content should be built from them, and the app should enforce them so the owner cannot get them wrong.

| Rule | What it means for Pawly |
|---|---|
| **Short and frequent beats long.** A controlled study found dogs trained in short sessions learned a task in fewer sessions than dogs trained longer, and the AKC's guidance is 3–5 short sessions a day. | A session is 3–6 minutes, never 15. The Today screen should invite two or three of them a day ("Quick reps") instead of one 10–15 minute block. |
| **One criterion at a time.** Raise only one thing per step: duration, then distance, then distraction (the "three Ds"), never two at once. | Every step names exactly the one thing being raised. Steps that currently change two things ("add distance and wait longer") split in two. |
| **High rate of reinforcement.** 15–30 rewards a minute while learning. If the dog is not getting paid, the criterion is too high. | Reps, not minutes, are the unit of a step. The screen counts reps and every rep is a reward. |
| **The 80 percent rule.** Move up when about 8 of 10 reps succeed; if more than half fail, make it easier. | This is the app's push/drop/stick logic. After each step the owner answers one question; the next step is chosen from the answer. The adaptive engine already has `advance`, `repeat`, `regress`. |
| **End on a win.** Stop while the dog is succeeding, then release. | Every session ends with a "free sniff" or play release step, and the screen never asks for "one more" after a success streak. |
| **Mark, then pay.** A marker word ("yes") the instant the behaviour happens, treat within a second. | The marker and the treat placement are in the session intro once, not repeated inside every step. |

Sources: [Foundations of dog training: criteria and reinforcement rate](https://joyofdogsports.fi/2026/03/the-foundations-of-dog-training-part-2-criteria-and-reinforcement-rate), [Rate of reinforcement](https://pvybe.com/dog-training/rate-of-reinforcement/), [AKC: the three Ds](https://www.akc.org/expert-advice/training/dog-training-duration-distance-distraction/), [Whole Dog Journal: fluency and generalization](https://www.whole-dog-journal.com/training/fluency-and-generalization-in-dog-training/), [Effect of frequency and duration of training sessions on acquisition and long-term memory in dogs](https://www.sciencedirect.com/science/article/abs/pii/S016815911100181X), [Dog training sessions per day](https://www.offleashk9training.com/dog-training-sessions-per-day/).

## 2. What Duolingo does, and what to copy

Duolingo's structure is Sections → Units → Lessons, shown as one linear path. A lesson is 5–10 minutes of 10–17 tiny exercises, one per screen, each answered before the next appears, with instant feedback. The daily habit is one lesson; the streak counts days with at least one lesson; a lesson ends on a summary screen. Units have a short "guidebook" of the key ideas. Practice sessions revisit earlier material.

Sources: [The Duolingo learning path](https://duoplanet.com/duolingo-learning-path/), [Duolingo learning path explained](https://www.krioda.com/duolingo-learning-path/), [How the Duolingo streak builds habit](https://blog.duolingo.com/how-duolingo-streak-builds-habit), [App teardown: how Duolingo's streak works](https://apptitude.io/blog/how-duolingos-streak-mechanic-actually-works/).

What maps to Pawly, and what does not:

| Duolingo | Pawly equivalent | Copy it? |
|---|---|---|
| One linear path per course | One path per course: Stage 1 → 2 → 3 → 4, each stage a row of sessions, the next session always highlighted | Yes. The Plan screen becomes a path, not a calendar of weeks. |
| Lesson = many one-screen exercises | Session = 3–5 one-screen steps | Yes. This is the biggest change to the exercise screen. |
| Instant right/wrong per exercise | "It worked" / "Not yet" per step, which decides the next step | Yes. Already half built. |
| Daily goal = one lesson | Daily goal = one 5-minute session | Yes. Drop fixed weekday slots as the primary model; keep a preferred reminder time. |
| Streak | Streak | Already there. Keep it small. |
| Guidebook per unit | "How this course works" sheet per course: marker word, treat placement, the one rule for this behaviour | Yes. Move the repeated explanation out of the steps into this. |
| Practice / review sessions | "Quick reps": 90-second reruns of an earlier step, 2–3 times a day | Yes. This is where "short and frequent" lives. |
| Hearts, gems, leagues, XP | None | No. The dog is the reward. Leaderboards are wrong for a training app where every dog learns at its own pace. |
| Character animations everywhere | The mascot in headers and on the end screen only | Keep what we have. |

## 3. Is the copy too wordy? Yes

Measured over `constants/protocols.ts`: 57 protocols, 227 steps.

| Field | Median words | Over 25 words |
|---|---|---|
| Step instruction | 28 | 152 of 227 |
| Trainer note | 27 | 39 of 57 |
| Tip | 16 | 4 |
| Success look | 11 | 0 |

A typical step reads: "Give the dog a Chew Toy, say your departure cue word ("I'll be back"), step outside, close the door, wait 30 seconds, and return calmly. No big hello." That is six actions in one sentence, read on a phone while holding a leash.

**The rewrite rule.** A step is three lines, in this order, and nothing else:

1. **Do** (≤ 12 words, imperative, one action, the number first): "Say the name once."
2. **Then** (≤ 12 words, what happens next and the reward): "The instant they look, mark and treat at your hip."
3. **Success looks like** (≤ 10 words, already in the data): "Head turns toward you within a second."

Everything else moves out of the step: setup goes to a "Before you start" list at the session start (treats, leash, room); the reason goes to the tip behind a "Why" tap; the schedule-style advice (the potty timetable) becomes a guide in Learn, linked from the session. Reps or seconds become a control on screen, not a sentence ("Do 10 reps" is a counter, not text).

Worked example, Attention Foundation step 2:

| Now (34 words) | After (24 words, three lines) |
|---|---|
| Say your dog's name once. The instant they glance at you, say "yes!" and toss a treat toward you so they take a step in your direction. Do 10 reps. | **Say the name once.** / The instant they glance at you, mark and toss a treat toward yourself. / Success: they glance and step toward you. / [rep counter: 0 of 10] |

Splitting rule: a step that raises two things becomes two steps. "Add distance and wait longer" → "Take two steps back" (distance) then, in a later session, "Wait two seconds before treating" (duration).

This is a content job across 227 steps, and it needs a trainer's eye, not just an editor's. The safest way is a structured pass that produces `do / then / success / why / reps` for each step with the original kept alongside, then a human review of the diffs.

## 4. The exercise screen

One step per screen, like a Duolingo exercise, with the control the step needs and nothing else. Wireframe at iPhone width:

```
┌──────────────────────────────────────┐
│ ✕                ████████░░░░  3 of 5│   close · progress bar · step count
│                                      │
│  Say the name once.                  │   h1, Nunito, ≤ 12 words
│                                      │
│  The instant they glance at you,     │   body, ≤ 12 words
│  mark and toss a treat toward you.   │
│                                      │
│  ✓ They glance and step toward you.  │   caption, success look
│                                      │
│                                      │
│              ┌──────────┐            │
│              │    7     │            │   the ONE control: rep counter
│              │  of 10   │            │   (or a timer ring for timed steps,
│              └──────────┘            │    or nothing for a setup step)
│          ( − )   [ + Rep ]           │   big tap target, haptic tick per rep
│                                      │
│  ? Why this step                     │   ghost link → tip + reason sheet
│                                      │
│ ┌──────────────────────────────────┐ │
│ │        It worked                 │ │   primary
│ └──────────────────────────────────┘ │
│           Not yet                    │   ghost
└──────────────────────────────────────┘
```

Rules for the screen:

- **Three lines of text, maximum.** Do, then, success. If the copy does not fit, the copy is wrong, not the layout.
- **One control.** A rep counter for rep steps (141 of 227 steps), a timer ring for timed steps (28), nothing for setup steps. The counter is the hero of the screen: 64pt number, a 72pt "+ Rep" button, a haptic tick on each rep. When the target is reached, the counter turns accent and the primary button becomes the obvious next move.
- **Two answers.** "It worked" advances (push). "Not yet" opens a one-tap follow-up: "Try this step again" (stick) or "Make it easier" (drop), which the adaptive engine already knows how to serve. The owner never types.
- **No auto-advance.** The dog sets the pace.
- **Help is one tap away, never on screen.** The tip and the reason sit behind "Why this step"; the marker word and treat placement live in the course guide.
- **Setup is a checklist before step 1**, not step 1: "20 tiny treats, a quiet room, 6-foot leash" as three tickable rows. It disappears once ticked.
- **The end screen is the one orchestrated moment** (already built): mascot, "Session complete", reps, time, outcome, then the reflection.

## 5. The plan screen as a path

Replace the week-by-week list with a path per course:

```
Recall
Stage 1  Attention        ●───●───●───◐          3 of 4 done, next highlighted
Stage 2  Indoor recall    ○───○───○───○          locked until Stage 1 check
Stage 3  Distractions     ○───○───○
Stage 4  Outdoors         ○───○───○
```

- Each stage ends with a **check session** (the existing `proofing` kind): the same skill in a slightly harder setting. Passing it unlocks the next stage; not passing repeats the stage's weakest step. This is the 80 percent rule made visible.
- The "Today" card stays the single entry point; the path is where the owner sees why today's session is what it is.
- Weekday scheduling becomes a reminder preference, not the plan's spine. The plan advances by sessions done, not by calendar. Missed days do not "miss" a session; they just delay it. That removes the whole "Move to next slot" flow.

## 6. Quick reps

Between sessions, the Today screen offers 60–90 second reruns of a step the dog already succeeded at, two or three times a day ("Say the name once, 5 reps"). This is what the research means by short and frequent, and it is the honest version of Duolingo's practice sessions. They count toward the streak, they use the same one-step screen, and they never introduce anything new.

## What to do first

1. **Content pass** (biggest lever, no UI change needed): rewrite the 227 steps into do / then / success / why / reps with a trainer review. The session screen already renders `instruction`, `successLook`, and `tip`; a shorter `instruction` and a `then` field fit into it today.
2. **Rep counter as the hero** of the step screen, with the two-answer footer and "Not yet" → stick/drop. Small change to `session.tsx` and `RepCounter`.
3. **Setup checklist** before step 1, from `equipmentNeeded`.
4. **Path view** for the Plan screen and stage checks.
5. **Quick reps** on Today.

Items 2 and 3 can ship this week; 1 is a content project; 4 and 5 change the plan model and deserve their own PR.
