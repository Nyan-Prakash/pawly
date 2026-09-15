# Pawly — Phase 2 remediation review

Companion to `DESIGN-AUDIT.md` (Phase 1) and `DESIGN.md` (the system). Screenshots are in `docs/design-review/` (`before-*.png` from commit `80411ff`, `after-*.png` from this branch, both on an iPhone 17 Pro simulator with a logged-in account).

## What changed, in one paragraph

The app now runs on one design system: one accent (park green, AA-verified in both schemes), a warm paper surface system, the platform font at eight sizes, a 4-pt grid, three radii, two elevation levels, native stack headers and the native tab bar, the platform sheet, and one layout primitive (the inset grouped list) repeated on every screen. NativeWind, Nunito, Plus Jakarta, LinearGradient and BlurView are gone. 41 screen and component files were rewritten across 23 commits, one commit per screen or token category.

## Checklist re-run (the 44 tells)

Counted over `app/` + `components/` with the same scanner used in Phase 1.

| # | Tell | Before | After |
|---|---|---|---|
| 1, 5 | Font sizes outside a scale | 25 distinct literals, 291 uses | **0** literals; 8 `Text` variants only |
| 2 | Trendy fonts | Nunito everywhere + unused Plus Jakarta | System font; both packages removed |
| 3 | Coloured accent word in headline | 3 | **0** |
| 4 | Uppercase eyebrows/labels | 23 | **0** |
| 6 | Decorative letter-spacing | 74 | **0** (Text forces 0) |
| 7 | Purple/lavender | 5 sites | **0** |
| 8 | Contrast failures | primary button 2.28:1, secondary text 4.34:1, placeholder 1.94:1 | every pair ≥ 5.0:1, computed |
| 9 | Gradients | 12 files | **0**, package removed |
| 10 | Coloured glows/shadows | 26 shadowColor sites, 3 shadow systems | **0** in screens; one neutral `elevation.raised` for sheets |
| 11 | Tinted near-black dark theme | 4 navy tints | Three-level warm surface system, all text pairs AA |
| 12 | Accent count | ≈32 hues, 3 palettes | 1 accent + 2 status colours, 1 palette |
| 13 | Cards in cards | 9 sites | **0**; `Card` used only for today's session, the dog summary, coach callouts |
| 14 | Uniform radius | 36 literals | 3 tokens, 0 literals |
| 15 | Same shadow under every card | `shadows.card` ×32 | **0** card shadows |
| 16 | Accent stripes | 8 | **0** |
| 17 | Icon-on-top feature grids | 5 | **0** |
| 18 | Fake step numbers | 1 | **0** (real "Step n of N" only) |
| 19 | Stat tiles | 5 | **0**; numbers are trailing values in list rows |
| 20 | Emoji/glyph icons | 5 files + 4 glyph sites | **0** |
| 21 | Pills above headings | 13 | **0**; `Tag` only trailing in rows |
| 22 | Glass | 3 tokens + 12 sites | **0**, `BlurView` removed |
| 23 | Two styling systems | NativeWind for 2 classes | **0**, removed |
| 24 | Centre-aligned by default | 27 files | Only `EmptyState` and session-complete |
| 25 | "→" / "A · B · C" | 11 arrows, 22 dot-string files | **0** |
| 26 | Entrance animations | 23 `entering=` + 5 sequences | **0** |
| 27 | Uniform press-scale | Button + 4 components | **0**; opacity press only |
| 28 | Decorative loops | 16 (6 decorative) | 0 decorative; loaders/typing only, all reduced-motion aware |
| 29–30 | Generated headings, marketing copy | "Built for", "Unlock", "Train smarter…" | **0** |
| 31 | Non-action buttons | "Amazing", "Done", "Submit", "Continue"… | Every button names its action |
| 32 | "Something went wrong" / "Oops" | 12 files | **0**; each error says what happened and what to do |
| 33 | Naming drift | 8 clusters | One name per thing (DESIGN.md "Words"); "Know" → "Learn" |
| 34 | Landing pages in-app | 5 hero screens + hamburger | **0** |
| 35 | Platform conventions | no native headers, 6 back buttons, floating tab bar, custom sheet, custom Apple button, fake switch | Native headers, system back, native tab bar, `pageSheet`, `AppleAuthenticationButton`, native `Switch`, native picker |
| 36 | Touch targets < 44pt | 40+ | Primitives enforce 44; rows 52 |
| 37 | Safe-area misuse | 5 magic bottom paddings, hero under status bar | Native insets; no magic paddings |
| 38 | Loading states | skeletons on 2 screens | `SkeletonBlock` on 13 files, no lone spinners with layout shift |
| 39 | Empty/error states | 4 unstyled | `EmptyState` on 12 files, all with an action |
| 40 | Haptics | none (raw Vibration) | `expo-haptics` at the six defined moments |
| 41 | Keyboard | no return-key chaining, wrong types | `Input` with keyboardType/textContentType/returnKeyType chaining; KAV where needed |
| 42 | Scroll physics | fine | fine |
| 43 | Spacing off-grid | 252 literals, 48% on grid | 2 literals (both `2`, inside `ListRow`), 477 token uses |
| 44 | Distinct values | 25 sizes / 36 radii / 66 hexes / 12 shadow colours / 6 back buttons / 24 row specs | 8 / 3 / 0 / 1 / 0 / 1 |

Remaining scanner hits, all deliberate: `router.back()` is used only after a completed action or on the onboarding stepper (which has no native header); `elevation.raised` only on sheets; `Animated.loop` only in `SkeletonBlock` (reduced-motion aware).

## Verification

- `npx tsc --noEmit`: 0 errors.
- `npm test`: 380 pass / 15 fail. The 15 are the pre-existing `mergedSchedule` failures (the pre-migration commit has 16 of the same). Course-colour tests were rewritten to the one-accent contract.
- Contrast: every text/background pair in `constants/colors.ts` was computed; the minimum is 5.03:1 (warning text on warning fill, light).
- Reduced motion: `useReducedMotion()` is checked in `SkeletonBlock`, `ProgressBar`, `TypingIndicator`, `RepCounter`, `TimerRing`, session completion, and reflection transitions.
- Press states: every `Pressable` in the primitives has a visible pressed state (opacity 0.6–0.7) and `accessibilityRole`.
- Rendered on device: the five tab roots and the Plan screen were screenshotted after the migration (see below). The session flow, onboarding and auth were verified by typecheck and the reviewer grep only; they were not exercised on the simulator in this pass.

## Before / after, top five screens

**Train (Today).** Before: date + greeting, bell and avatar buttons, a card with a red course pill, "8 min · Week 1 · Stage 1", a pink progress bar, an outlined "View plan ›", a second card with the week strip and a three-up stat row, a floating pill tab bar. After: native "Train" header; one card (course as a caption, title, "8 min, week 1", the schedule line, a progress bar, one green button); "This week" with the strip and a one-line streak; "Also today" as a grouped list; native tab bar. Boldness is spent on exactly one element, the button. Removed one more than felt comfortable: the mascot that used to sit in the card.

**Progress.** Before: gradient wash, two-tone green title, gradient hero banner with paw decor and an uppercase eyebrow, two flame streak tiles, striped behaviour cards. After: four plain rows under "Overall", an eight-week bar chart with the selected week as a caption, walk quality, behaviours as rows with a tag. The chart is the one bold element. Fixed during self-critique: a single session used to render as a full-width block; the chart now always shows eight weeks with capped bar width.

**Coach.** Before: glass header panel with hamburger and refresh, "PAWLY COACH" glowing pill, 44-pt green greeting, centred marketing copy, floating suggestion pills, glass composer with dead "+" and mic buttons, tab bar hidden. After: native header, mascot empty state with one sentence, suggestions as a grouped list, a plain composer above the native tab bar, one send control. The mascot is the one bold element.

**Learn (was Know).** Before: tagline under the title, three pills above each article heading, spinner loading. After: search field, 44-pt category chips, "Featured" and "All guides" as grouped lists with chevrons, skeleton loading. Fixed during self-critique: the "Featured" tag was repeated on rows already under the Featured header; removed.

**Profile.** Before: gradient wash, centred avatar and name, stat pills, every settings row its own shadowed card, Title Case labels. After: one card for the dog with a left-aligned "Edit", then "Stats", "Settings" and "Account" as grouped lists with trailing values. Nothing on this screen is bold on purpose; it is a settings screen.

## Any-app test

- Train: only Pawly has "today's session for Busy, 8 min, week 1" and a walk row under it. Passes.
- Progress: "Sessions by week", "Walk streak", "Walk quality" and behaviour rows are specific to dog training. Passes.
- Coach: the mascot and the four suggested questions are about a dog. Passes.
- Learn: a search-and-list screen could belong to any content app. It is tied to Pawly only by the categories (Barking, Crate training, Leash walking). Acceptable for a reference tab; a next step would be surfacing "Guides for this week's course" at the top.
- Profile: a settings screen is meant to be generic. The dog card at the top is the only Pawly-specific element, which is correct.

## Functionality changes worth knowing

These were deliberate calls under the brief; each is reversible.

- Courses no longer have their own colour. They are told apart by name and icon. `courseColors` keeps its API and returns the accent.
- The onboarding "hero" step, the "Unlock full plan" paywall tease and the profile-tab "unlock" route are gone; the plan preview's retry re-runs generation instead of restarting onboarding.
- The session flow no longer auto-advances on a timer after an outcome; the handler taps "Next step". "Start session" begins manual training; the live coach is behind "Choose how to train".
- The Today screen's greeting, notification bell and avatar shortcut are gone; notifications are a row with an unread count, profile is a tab.
- Quick wins are picked deterministically by date, not shuffled on every mount.
- Native large titles are off: react-native-screens 4.1 does not draw them under iOS 26. Standard titles are used until that dependency is upgraded.

## Primitive gaps reported by the migration (not yet addressed)

- `ListRow` has no `warning` icon tone and no built-in "selected checkmark" trailing; three screens compose it locally.
- `Input` does not expose an inner `TextInput` style (the coach composer's growth cap is applied to the wrapper).
- `SectionHeader` takes only a text action; the Plan screen composes a header with a trailing `Tag` locally.
- `lib/scheduleEngine.formatScheduleLabel` still falls back to "Week n · Day n" for undated sessions.
