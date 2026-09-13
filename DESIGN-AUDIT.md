# Pawly — Design Credibility Audit

**Phase 1, read-only.** No code was changed.

**Scope:** 95 `.tsx` files under `app/` and `components/`, the six token files under `constants/`, `lib/theme.ts`, `tailwind.config.js`, `global.css`, `app.config.ts`, and `package.json`.
**Method:** every file read in full; a Python scanner over `app/` + `components/` for value distributions; WCAG contrast computed (not eyeballed) for every foreground/background pair the token system produces.
**Platform:** Expo SDK 52 / React Native 0.76 / expo-router 4. iOS is the primary target (Apple Sign-In, EAS iOS profiles, encryption-exemption plist). Android is built but secondary. Findings are graded against the iOS Human Interface Guidelines first, with Material notes where Android behaviour diverges.

Line references are to the files as of commit `80411ff` on `feat/session-flow-overhaul`. Four detailed per-file reports (every instance, with line numbers and snippets) are attached as Appendices A–D. The body below is organised by the 44 tells and cites the strongest instances; the appendices are exhaustive.

---

## 0. One-paragraph verdict

Pawly has a real token layer (`constants/colors.ts`, `typography.ts`, `spacing.ts`, `radii.ts`, `shadows.ts`) and a handful of well-reasoned primitives (`Text`, `Card`, `Button`, `BottomSheet`, `SkeletonBlock`, `EmptyState`). The problem is that the screens do not use them. 291 literal font sizes, 197 literal radii, 181 hard-coded hex colours, 74 letter-spacing overrides, 23 entrance animations, 12 gradient screens, three parallel shadow systems, a floating glass tab bar, six different back buttons, and a green primary button whose white label fails WCAG AA at 2.28:1. The tells cluster exactly where AI-generated UI clusters: uppercase eyebrows above headings, pills above titles, gradient hero banners, stat tiles in threes, colored glows, "→" on CTAs, "A · B · C" meta strings, everything wrapped in the same 24-pt-radius white card. The bones are good. The skin is generated.

---

## 1. Typography tells

### T1. Default font with zero configuration for large headlines
Not the default font, but the equivalent failure: Nunito is loaded, then every headline re-specifies its own size/weight/tracking instead of using the eight named variants in `constants/typography.ts`.

- Zero `Text` variants used in the entire file: `app/(tabs)/train/session.tsx` (1,849 lines, every text node hand-styled), `app/(onboarding)/plan-preview.tsx`, `app/(tabs)/train/plan.tsx` (one variant at L656), `components/session/PostSessionReflectionCard.tsx`, `components/vision/LiveAiTrainerOverlay.tsx`, `components/adaptive/WhyThisChangedSheet.tsx`.
- Display headings hand-rolled at sizes outside the scale: `welcome.tsx:279` (50/800/-1.5), `dog-basics.tsx:961` (42/800/-1.5), `plan-preview.tsx:260` (40/800/-1.5), `coach/index.tsx:303` (44/48 overriding `display`), `login.tsx:97` and `signup.tsx:238` (34/800/-0.5), `progress/index.tsx:685` (26/800/-0.5), `RepCounter.tsx:60` (96pt in raw `RNText`, so it renders in SF Pro, not Nunito).
- The shared `SectionHeader.tsx:26-29` itself bypasses the variants: `fontSize: 20, fontWeight: '800', letterSpacing: -0.3`.
- `Input.tsx:100-101` spreads `typography.body.fontWeight`, a key that does not exist, and never applies `fontFamily`, so **every TextInput in the app renders in the system font**, not Nunito. `QuickSuggestions.tsx:32` uses raw `RNText` for the same reason.

### T2. Overused AI font combos
- Nunito is the brand font (acceptable: rounded humanist, on-subject for a pet app).
- `@expo-google-fonts/plus-jakarta-sans` is declared in `package.json:16` and imported nowhere. Dead dependency, but it is on the list.
- `typography.ts:9-12` scale is 32/28/22/18: steps of 4, 6, 10 with no ratio. `sizes.lg: 20` and `sizes.xl: 24` exist in the legacy table but not in the named scale, which is why 20 and 24 appear as literals 6 and 3 times.

### T3. Serif-italic / coloured accent on one word in a headline
- `progress/index.tsx:685-701`: "{Dog}'s **Progress**" with the second word in brand green.
- `coach/index.tsx:303-306`: greeting rendered in brand green at 44pt.
- `StepCard.tsx:60-64`: 14pt italic secondary line under the instruction.

### T4. All-caps text for labels, eyebrows, buttons
17 `textTransform: 'uppercase'` + 6 `.toUpperCase()` sites. All are eyebrows above a heading, the single most recognisable tell.

- `dog-basics.tsx:1182,1213,1241` "YOUR DOG / TRAINING GOAL / SCHEDULE" (bodyStrong forced to 11pt, tracking 0.8).
- `plan-preview.tsx:243-256` pill "GOAL · STAGE 1"; `:389`; `:539`.
- `progress/index.tsx:768-777` "OVERALL PROGRESS" (11/800/1.4 tracking, on a gradient banner).
- `coach/index.tsx:288-291,481-500` "PAWLY COACH" pill with a green glow.
- `session.tsx:964,973,1004` "TODAY'S GOAL FOR {DOG}", "BEFORE YOU START", "TRAINER NOTE".
- `plan.tsx:508-512` week headers (tracking 1.2).
- `edit-dog.tsx:42-48` every field group label `.toUpperCase()`.
- `delete-account.tsx:218` `TYPE "DELETE" TO CONFIRM` (shouts the phrase in caps while the check is lowercase).
- `FeedbackModal.tsx:129-131,173` "FEEDBACK TYPE", "MESSAGE (OPTIONAL)".
- `MilestoneCard.tsx:96-107,137-150` "ALMOST THERE", "TAP TO SHARE".
- `AdaptationNotice.tsx:97`, `WhyThisChangedSheet.tsx:150`, `StepHelpSheet.tsx:140`, `PostSessionReflectionCard.tsx:182-189`, `ShareCard.tsx:50-61`, `SessionModePicker.tsx:145-156` "NEW".
- `login.tsx:196`, `signup.tsx:335` "OR" divider.

### T5. No real type scale, sizes chosen ad hoc
**25 distinct `fontSize` literals, 291 uses** (scanner). Distribution: 9 ×3, 10 ×12, 11 ×19, 12 ×25, 13 ×36, 14 ×38, **15 ×51**, 16 ×24, 17 ×21, 18 ×13, 19 ×3, 20 ×6, 22 ×8, 24 ×3, 26 ×9, 28 ×8, 30, 32, 34 ×2, 40 ×2, 42, 44, 50, 52, 96.
The most-used literal size in the app (15pt, 51 uses) is not in the type scale at all. 13 (36) and 17 (21) are also off-scale. Sizes 9, 10 and 11 (34 uses) sit below the 12pt `micro` floor: `progress/index.tsx:306,371,374` (9pt), `SessionChangeBadge.tsx:50` (10pt), tab bar labels `_layout.tsx:117` (10pt).
**49** places pass `variant="…"` and then override `fontWeight` in the same element, which makes the variant meaningless (`Button.tsx:134-137` does it in the shared primitive: `bodyStrong` then `fontWeight: '700'`).

### T6. Decorative letter-spacing
**17 distinct `letterSpacing` values, 74 uses.** Negative tracking (-0.5 ×14, -0.4 ×10, -0.3 ×9, -1.5 ×3) on headlines is the Tailwind-landing-page tell; positive tracking (0.5–1.5) is applied to every uppercase eyebrow. Nunito is a rounded humanist face and reads worse tightened. Sites: `SectionHeader.tsx:29`, `train/index.tsx:173,214,539,649,851`, `HeroSessionCard.tsx:109`, `WeekStrip.tsx:141`, `QuickWinCard.tsx:115`, `ActiveCourseCard.tsx:127`, `progress/index.tsx:128,433,686,771`, `delete-account.tsx:125,155,168`, `privacy-policy.tsx:20-36`, plus every eyebrow in T4.

---

## 2. Colour tells

### C7. Lavender / purple accents
Brand is green, yet purple appears in five places:
- `constants/courseColors.ts:13` `'#7C3AED' // Violet`, `:19` `'#4F46E5' // Indigo` in the 10-colour course palette; `:29,38` violet, `:24` indigo, `:34` `'#9333EA'` purple in `GOAL_COLORS`. Any dog whose plan hashes to these gets a purple hero, purple session rows, purple timer ring.
- `components/adaptive/SessionChangeBadge.tsx:34` `bg: '#F3E8FF', fg: '#7C3AED'` for the "changed" badge.
- `components/ui/MascotCallout.tsx:95` `'#A78BFA'` lavender confetti.
- No purple-to-blue gradients found.

### C8. Dark theme text contrast (computed)
Dark palette body text passes. The light palette and both primary buttons do not.

| Pair | Ratio | AA 4.5 | AA-large 3.0 |
|---|---|---|---|
| Light `text.secondary #6B7280` on `bg.app #F7F2EC` | 4.34 | **FAIL** | pass |
| Light `text.secondary` on `bg.sand #F1EBE2` | 4.08 | **FAIL** | pass |
| Light caption at `opacity: 0.65` on bg.app (`_layout.tsx:119`) | 2.38 | **FAIL** | **FAIL** |
| Placeholder `text.secondary + '80'` on `surfaceAlt` (`Input.tsx:77`) | 1.94 | **FAIL** | **FAIL** |
| **White on `brand.primary #22C55E` (every primary button)** | **2.28** | **FAIL** | **FAIL** |
| White on `brand.secondary #F59E0B` (reward button) | 2.15 | **FAIL** | **FAIL** |
| `brand.primary` as text on bg.app (ghost buttons, links, tab active label) | 2.05 | **FAIL** | **FAIL** |
| `brand.coach #3B82F6` as text on surface | 3.62 | **FAIL** | pass |
| `error #EF4444` as text on surface | 3.70 | **FAIL** | pass |
| Tab bar active `#22C55E` on `successBg #DCFCE7` | 2.07 | **FAIL** | **FAIL** |
| Dark: white on `brand.primary #4ADE80` (primary button) | **1.74** | **FAIL** | **FAIL** |
| Dark: placeholder 50% on surfaceAlt | 2.59 | **FAIL** | **FAIL** |
| `GOAL_COLORS.potty_training #EAB308` as text | 1.89 | **FAIL** | **FAIL** |
| `GOAL_COLORS.jumping_up #06B6D4` as text | 2.39 | **FAIL** | **FAIL** |
| Dark `text.secondary #94A3B8` on `#0B1220` | 7.30 | pass | pass |
| Dark `text.primary` on `bg.app` | 17.89 | pass | pass |

Related bug: `courseColors.ts:149-169` `getContrastTextColor` computes luminance and then unconditionally `return '#FFFFFF'`, while `session.tsx:1316,1556`, `StepHelpSheet.tsx:99`, `PostSessionReflectionCard.tsx:602` put near-black `text.primary` on `theme.solid`. There is no rule; both directions fail for some hues.

### C9. Gradients as decoration
`expo-linear-gradient` in **12 files**, none communicating state:
- Full-screen washes: `app/_layout.tsx:93` (PrepLoadingScreen), `coach/index.tsx:111,131,156` (behind every chat state), `tools.tsx:36-39`, `progress/index.tsx:657-663`, `profile/index.tsx:154-160` (320pt), `QuestionScreen.tsx:56-62`, `dog-basics.tsx:899-911,1115-1121`, `plan-preview.tsx:172-178`.
- Hero banners: `welcome.tsx:203-208` (three off-brand greens `#8CC63F/#76B82A/#5F9E22`), `plan-preview.tsx:236-241`, `plan.tsx:57-66`, `progress/index.tsx:758-827`.
- Tool cards: `tools.tsx:14-15` `CLICKER_GRADIENT`, `WHISTLE_GRADIENT` → `TrainingToolCard.tsx:76-81`.
- Footer fades: `dog-basics.tsx:1264`, `QuestionScreen.tsx:154`.
- `ShareCard.tsx:41` off-brand teal `['#2D7D6F','#1A5C52','#0F3D36']` (component is unused).
- A `colors.gradient.app` **token** exists (`colors.ts:40-42`), which institutionalises the tell.

### C10. Coloured glows and coloured box-shadows
Three parallel shadow systems: `shadows.*` (neutral), `softShadows.*`/`tintedShadow(hex)` (tinted, 13 sites), `colors.shadow.success` (green glow). **12 distinct `shadowColor` values, 15 distinct `shadowOpacity` values.**
- Green glows: `welcome.tsx:253-256` (`#315F12`, opacity 0.34, radius 24), `dog-photo.tsx:604-608,717-722`, `SessionModePicker.tsx:117-121`, `MessageBubble.tsx:55-67` (every user chat bubble), `coach/index.tsx:488-491` (eyebrow pill), `HeroSessionCard.tsx:143` (CTA), `QuickWinCard.tsx:60,87` (tile and icon well, nested).
- Course-colour glows: `session.tsx:1204-1208,1309-1313` (timer, opacity 0.3), `PostSessionReflectionCard.tsx:591-595`, `TrainingToolCard.tsx:36-58` (animated glow border on press).
- Hand-rolled `#000` shadows bypassing tokens: `ActiveCourseCard.tsx:38-56` (`#1A2436`), `OptionCard.tsx:76-84`, `tools.tsx:184`, `session.tsx:1531,1613`, `dog-basics.tsx:396-437`, `dog-photo.tsx:560-564`, `edit-dog.tsx:359`, `QuickSuggestions.tsx:53-62`.

### C11. Near-black tinted backgrounds standing in for a surface system
`colors.ts:78-83` dark palette: `app '#0B1220'`, `surface '#121A29'`, `surfaceAlt '#1A2436'`, `sand '#18212F'`. Four navy tints, no elevation semantics, and both `shadow.soft` and `shadow.strong` collapse to `#020617`. Light mode is a considered warm system (`#F7F2EC` paper, `#FFFDF9` surface, `#F1EBE2` sand). Dark mode is that system with the values swapped for "dark blue".
Plus **31 files hard-code light-only colours** that break in dark mode: `PillTag.tsx:16-21` (all five variants), `StreakBadge.tsx:23,29,32`, `MilestoneCard.tsx:63,70,96,137,198,202`, `WalkLogModal.tsx:37-60`, `ArticleCard.tsx:39`, `LearningInsightCard.tsx:74,78`, `coach/index.tsx:335,618-624`, `QuickSuggestions.tsx:67-98` (re-declares the palette by hand), `tools.tsx:14-15`, `RepCounter.tsx:51-55`, `StepCard.tsx:76-86`, `PostSessionReflectionCard.tsx:325-343,641,729`, `courseColors.ts:205-207`.

### C12. More than one accent, or an accent unrelated to the subject
Accent count: `brand.primary` green + `brand.secondary` amber + `brand.coach` blue + 10 `COURSE_COLOR_PALETTE` + 19 `GOAL_COLORS` + `warning #FBBF24` (a second amber) + `error` + `mascot.*` ≈ **32 accent hues**, each generating eight alpha tints at runtime (`courseColors.ts:178-185`). The tab bar is green, notifications are blue (`NotificationBell.tsx:48`, `NotificationItem.tsx:23,36`), "changed" is purple, streaks are amber, the welcome hero is a fourth green.
The token file itself contains the ambiguity: `colors.ts:59` top-level `secondary: '#F5F7F9'` (a grey surface) vs `:6` `brand.secondary: '#F59E0B'` (amber). `session.tsx:987` passes `colors.secondary` as a chip colour and gets a near-invisible grey.
Legacy aliases still in use: `textPrimary` 59, `textSecondary` 75, `primary` 46, `surface` 27, `background` 11, `secondary` 6. `success_old`, `warning_old`, `error_old`, `borderLegacy`: 0 uses, pure dead tokens. `colors.surface` is `#FFFFFF` while `bg.surface` is `#FFFDF9`: two whites, so auth screens are cooler than onboarding.
The `tailwind.config.js:7-22` `pawly.*` palette is a **third** copy with `appBg '#FFF9F4'` (disagrees with `#F7F2EC`) and is referenced by zero class names.

---

## 3. Layout & component tells

### L13. Everything in a card; cards inside cards
`Card` referenced in 28 files. Explicit nesting:
- `train/index.tsx:228-241,588-605` `EmptyState` (padding xl) inside `Card` (padding lg); `:663-673,683-700` sand tile inside white card; `:712-720` WeekStrip + stat row inside a card.
- `know/article/[slug].tsx:123,167-169` hero `Card variant="elevated"` then body `Card`, and `ArticleContentRenderer.tsx:59-85` renders tip/warning blocks as `Card` **inside** that card, all `radii.lg`.
- `QuickSuggestions.tsx:53-77` shadow wrapper around a bordered card.
- `TrainingToolCard.tsx:68-81` four nested rounded containers.
- `StepCard.tsx:74-91` tip tile inside instruction card.
- `plan-preview.tsx:306-558` six sibling cards, identical treatment, no hierarchy.
- `profile/index.tsx:47-100` every settings row is its own shadowed card instead of a grouped inset list (iOS convention).
- `delete-account.tsx:171-212` deletion list card + email card, identical.
- `dog-basics.tsx:1167-1256` three identical review cards.

### L14. One border-radius for everything
`radii` token has four steps; the code uses **36 distinct literal radii, 197 uses** (2, 3, 3.5, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 26, 28, 30, 32, 34, 36, 40, 44, 45, 54, 58, 60, 99, 999). The four most-used are 14 ×20, 16 ×20, 18 ×18, 20 ×17: none is a token. Meanwhile `Card.tsx:28` gives every card `radii.lg` (24) regardless of size, and `Button.tsx:32-34` makes every size a pill. `BottomSheet.tsx:84-85` invents 28; `session.tsx:1608` invents 32.

### L15. Same soft grey shadow under every card
`shadows.card` ×32 + `Card.tsx:29-30` applies it **and** a 1-pt border to every default card. `train/plan.tsx:423` rows, `add-course.tsx:261-281` rows, `profile/index.tsx:47-100` settings rows, `delete-account.tsx`, `progress/index.tsx:866-875,913-922` all get card + border + shadow. Appendix B, "Competing layout patterns", tabulates **24 distinct row/card specs** in the Train tab alone.

### L16. Coloured left/top accent stripes
- Left: `session.tsx:999-1000` (4px, course colour), `StepCard.tsx:80-81` (3px amber), `FormattedCoachMessage.tsx:136,231-238` (4px on every callout), `plan.tsx:431` (4px), `progress/index.tsx:430` (4px on every behaviour card), `ActiveCourseCard.tsx:96-105` (8px).
- Top: `plan-preview.tsx:357` (4px amber), `:423` (4px blue).

### L17. Identical icon-on-top feature cards in a grid
- `dog-photo.tsx:249-269` Camera / Library 2-up.
- `tools.tsx` + `TrainingToolCard.tsx:83-101` clicker / whistle.
- `SessionModePicker.tsx:70-106,111-198` two mode cards, 72pt icon square each.
- `add-course.tsx:457-497` course preview card, centred 72pt icon.
- `welcome.tsx:110-154` and `dog-basics.tsx:986-1023` three icon-left "value rows".

### L18. Numbered 01/02/03 markers on non-sequences
Mostly clean. `FormattedCoachMessage.tsx:163` numbers any model output that starts with "1." regardless of whether it is a sequence. `session.tsx:1106-1117` "Step n of N" pill and `LiveAiTrainerOverlay.tsx:228-233` are real sequences (acceptable).

### L19. Stat banner rows (big number, small label ×3)
- `plan-preview.tsx:273-299` three glass tiles on the hero; two of the three values are **hard-coded** (`'4 weeks'`, `'3–5 days'`) and contradict what the user just chose.
- `WeekStrip.tsx:161-187` three-up with dividers.
- `session.tsx:1522-1541,1562-1572` completion stats.
- `progress/index.tsx:102-131,831-848` two StreakCards side by side; `profile/index.tsx:108-127,254-265` two StatPills.

### L20. Emoji as icons
- `dog-basics.tsx:104-109` and `edit-dog.tsx:28-31` age options `'🐾' '⚡' '🎯' '⭐'`.
- `dog-photo.tsx:295` button label `✨ Create {dog}'s Avatar`; `:350-352` `✨` as the compare arrow.
- `FormattedCoachMessage.tsx:28,72` callout type detected by leading `💡 ⚠️ ✅ 🐶` and the emoji rendered as the callout icon.
- `ArticleContentRenderer.tsx:46` `✓` / `•` glyphs as icons.
- Vestigial: `MilestoneCard.tsx:28` and `progress/index.tsx:85` props named `emoji` carrying icon names.
- Unicode glyphs as icons: `upload-video.tsx:242-244` `▲/▼`, `progress/index.tsx:389-391` `↑ → ↓`, `milestones.tsx:140` `←`, `upload-video.tsx:538` `‹`.

### L21. Badges/pills above headings, repeated across screens
`radii.pill` ×41 + `99/999` ×13. Pills rendered **above** a heading: `plan-preview.tsx:243-256`, `coach/index.tsx:288-291`, `HeroSessionCard.tsx:85-100`, `DaySessionList.tsx:118-146`, `plan.tsx:269`, `know/article/[slug].tsx:124-149` (two), `ArticleCard.tsx:29-70` (up to three), `MilestoneCard.tsx:96-107`, `session.tsx:1106-1117`, `tools.tsx:48-56` (badge claims "Sound + Haptic"; there are no haptics), `welcome.tsx:294-297` feature pills, `SessionModePicker.tsx:145-156` "NEW", `OptionCard.tsx:165-183` corner badge, `StreakBadge` flame pill.

### L22. Glassmorphism
- Token-level: `colors.ts:16-18` `bg.elevated 'rgba(255,255,255,0.88)'`, `elevatedMuted`, `glass`.
- `coach/index.tsx:403-413` header glass panel over a gradient, `:572-590` glass composer pill, `:378-393` glass loading card, `:421-430`.
- `MessageBubble.tsx:101-109` assistant bubbles on `bg.elevated`; `NotificationItem.tsx:23` unread rows.
- `plan-preview.tsx:564-574` sticky footer; `:243-256,273-299` white-alpha pills and tiles on the hero; `progress/index.tsx:793-812`; `welcome.tsx:58-63,241-246,262-272` (glass pill, glass logo container, fake gloss strip).
- `LiveAiTrainerOverlay.tsx:226,247,318` three `BlurView` panels (defensible over live camera; still the pattern).
- 36 distinct `rgba(…)` literals, 68 uses, most of them `rgba(255,255,255,0.15–0.95)`.

### L23. Unmodified component-library defaults
No shadcn/MUI. NativeWind + Tailwind + `global.css` + Babel/Metro plumbing are installed to serve **two utility classes in two files** (`SafeScreen.tsx:14`, `LoadingSpinner.tsx:7`); a second styling system with its own conflicting palette for zero benefit. Ionicons is the only icon set (good), but `Ionicons` is imported directly in 15 files instead of via `AppIcon` (calendar, notifications, add-course, DaySessionList, TrainingCalendar, tabs layout).

### L24. Centred by default
`textAlign: 'center'` in **27 files**; `session.tsx` alone has 10. Whole-screen centring: `welcome.tsx:227-236`, `dog-basics.tsx:698,921-929`, `dog-photo.tsx:477-484`, `plan-preview.tsx:179`, `signup.tsx:173-195`, `coach/index.tsx:286-316` (WelcomeState), `profile/index.tsx:167-267` (entire header), `progress/index.tsx:711-751`, `session.tsx:1393-1403,1502-1512,1623-1645`, `add-course.tsx:385,457-497`, `upload-video.tsx:444`, `MilestoneCard.tsx:73-77,116,130`, `EmptyState.tsx:36,51-52,59` (the primitive centres by default), `SessionModePicker.tsx:70-106`, `tools.tsx:48-56` (centred title with badge beneath), `edit-dog.tsx:312` (centred custom header title).

### L25. "→" on links; "A · B · C" meta strings
- Arrows in text: `dog-basics.tsx:1039` "Let's get started →", `:1277` "Build my plan →", `plan-preview.tsx:587` "Start my first session →", `:590` "Unlock full plan →", `plan.tsx:331` "Full explanation →", `AdaptationNotice.tsx:124` "See why →", `HeroSessionCard.tsx:183` chevron glyph, `forgot-password.tsx:61-65` "← Back", `SessionModePicker.tsx:66`, `PostSessionReflectionCard.tsx:162`, `milestones.tsx:140`.
- Middle-dot meta strings in **22 files**: `plan-preview.tsx:254` "{goal} · Stage 1", `:402,453`; `dog-basics.tsx:1190,1221,1246,1254`; `welcome.tsx:336` "No credit card required · Cancel anytime"; `plan.tsx:84,274,467` "Stage {n} · {w} weeks · {c}/{t} done"; `HeroSessionCard.tsx:61-67,113` "{min} min · Week {n} · Stage {s}"; `DaySessionList.tsx:16-20,150`; `ActiveCourseCard.tsx:151`; `train/index.tsx:175,296,698,801`; `calendar.tsx:86`; `add-course.tsx:494,554-560`; `know/article/[slug].tsx:156-164` "Pawly · N min read · Updated …"; `profile/index.tsx:241` (hand-spaced double-space dot); `PlanReasonCard.tsx:95`; `PostSessionReflectionCard.tsx:174`; `session.tsx`.

---

## 4. Motion tells

### M26. Fade-and-slide-up entrances on every section
**23 Reanimated `entering=` sites + Animated mount choreographies.**
- `plan-preview.tsx`: whole-screen `FadeIn` (L227) then **eleven** staggered `FadeInDown.delay(120…540)` (L243-527).
- `dog-basics.tsx:986-998,1035-1039,1167-1256` staggered `FadeInDown.delay(0/100/200/300/600)`.
- `welcome.tsx:44-49,124-129,178-193` per-pill, per-row, logo/tagline/card sequence.
- `app/_layout.tsx:75-90` PrepLoadingScreen fade + 24pt slide.
- `HeroSessionCard.tsx:54-57,79-80` spring fade + translateY on the daily screen.
- `upload-video.tsx:176,264,247,444,491` `FadeInRight` on every step.
- `PlanReasonCard.tsx:44-45`, `MascotCallout.tsx:189-198` (spring scale-in **on every mount**, so it pops in every EmptyState and loading screen), `progress/index.tsx:502-507`, `BottomSheet.tsx:34-55`.

### M27. Uniform press-scale on every interactive element
- `Button.tsx:87-103` spring to 0.97 on **every** button including ghost links.
- Duplicated per-component: `OptionCard.tsx:56-68` (0.96), `QuickWinCard.tsx:34-42`, `QuickSuggestions.tsx:63-66` (0.97 + opacity 0.88), `TrainingToolCard.tsx:36-58` (scale + pulse loop + glow border, three motions per press).
- Meanwhile press **opacity** values are 0.7 / 0.75 / 0.8 / 0.82 / 0.88 across `IconButton`, `NotificationBell`, `NotificationItem`, `MilestoneCard`, `SettingsRow`, and `ArticleCard` swaps background. Six press affordances in one kit.

### M28. Decorative animation not answering an action or state
16 infinite loops (`Animated.loop` / `withRepeat`):
- Not state-tied: `welcome.tsx:79-104` FloatingPaw, `dog-basics.tsx:888-892` hero paw pulse, `dog-photo.tsx:77-84` sparkle loop in the *generated* (finished) state, `progress/index.tsx:586-594` mascot float (3.2s, never stopped on unmount), `TrainingToolCard.tsx:36-58` pulse on press, `VideoUploadProgress.tsx:27-37` rotate + pulse with `[]` deps never cancelled.
- State-tied (acceptable): `TypingIndicator`, `SkeletonBlock`, `BouncingDot` (loading), `plan-preview.tsx:65-67`, `add-course.tsx:364-371`, `RepCounter` bounce on count, `TimerRing`.
- Auto-navigation on timers: `session.tsx:1367-1384,1429-1438` advances after 2.5s with a draining bar; `edit-dog.tsx:112-114` `router.back()` 800ms after save; `FeedbackModal.tsx:83-85` auto-close after 2s.
- **Reduced motion: zero handling anywhere** (`isReduceMotionEnabled`, `useReducedMotion`, `AccessibilityInfo`: 0 hits).

---

## 5. Copy tells

### W29. Generated heading shapes
- "Built for {dog}": `plan-preview.tsx:472`, `PlanReasonCard.tsx:6,80,94`.
- "Train smarter. Bond deeper.": `dog-basics.tsx:972-982`. "Start training smarter today.": `signup.tsx:254`. "A trainer who finally knows your dog.": `welcome.tsx:289`.
- Feature-list triplets: `welcome.tsx:323-325` "Plans built for your dog / AI Coach available 24/7 / Track real progress"; `dog-basics.tsx:999-1002` "Personalised AI training plan / Smart scheduling around your life / Track progress week by week".
- Fake staged progress: `plan-preview.tsx:34-38` "Analyzing your dog's profile… / Selecting the right exercises… / Building your personalized plan…"; `add-course.tsx:373-382`; `app/_layout.tsx:303-311` "Crafting a training programme tailored just for them."

### W30. Marketing copy where UI copy belongs
`plan-preview.tsx:551` "Unlock your full plan", `:556`; `coach/index.tsx:142` "unlock personalized coaching", `:300-301`; `dog-photo.tsx:230-237` "Our AI turns your photo into a beautiful illustrated avatar"; `SessionModePicker.tsx:104` "Our expert AI watches and listens…"; `know/index.tsx:88` tagline under tab title; `calendar.tsx:87` "Stay on track with {dog}"; `upload-video.tsx:181`; `FeedbackModal.tsx:112` "helps us make Pawly better for everyone"; `welcome.tsx:336` "No credit card required · Cancel anytime" (there is no payment step); `ExpertReviewRequest.tsx:28` "48-hour turnaround guaranteed".

### W31. Buttons that do not name the action
- Generic: "Continue" is the default for ~14 onboarding steps (`QuestionScreen.tsx:39`); "Get started free" (`welcome.tsx:330`), "Let's get started →", "Got it" ×2, "Done" (`upload-video.tsx:479`), "Next" / "Next step", "Submit Feedback" (`FeedbackModal.tsx:193`, heading says "Send Feedback"), "Go Back", "Close", "Resume".
- Non-actions as buttons: "Amazing" (`train/index.tsx:861`), "Session completed" (`plan.tsx:369`), "Oops, undo" (`session.tsx:1456`), "Do Normally" (`SessionModePicker.tsx:209`).
- Emoji/arrow/em-dash in labels: `dog-photo.tsx:295`, `plan-preview.tsx:578` "Save my plan — Create account".
- Title Case vs sentence case split: "Add This Course", "Save Changes", "Send Feedback", "Delete My Account", "Switch to Manual", "Edit Dog Profile" vs "Start session", "Save walk", "Sign out", "Try again".

### W32. Placeholder error copy
"Something went wrong. Please try again." in **12 files** (`login.tsx:47,65,75,79`, `signup.tsx:81,136,146,153`, `forgot-password.tsx:41,46` (shown as the *email field* error), `edit-dog.tsx:116`, `session.tsx:538`, `add-course.tsx:750`, `WalkLogModal.tsx:109`, `ExpertReviewRequest.tsx:53`). Raw exception JSON shown to users: `signup.tsx:116-118`, `plan-preview.tsx:138`. Generic `Alert.alert('Error', …)`: `delete-account.tsx:88-89`. "Oops, undo": `session.tsx:1456`. Placeholder flows shipped live: `ExpertReviewRequest.tsx:134-135` `Alert.alert('Coming soon', …)` behind a real CTA. Exclamation enthusiasm: "Looking good!", "Changes saved!", "Thank you!", "Video uploaded!", "Review requested!", "Done!", "Target reached!", "{dog} crushed it!".
Error state that discards work: `plan-preview.tsx:213-219` "Try again" restarts onboarding from step 1.

### W33. Inconsistent naming
- **The assistant:** "Pawly Coach" / "training assistant" / "AI Coach" / "AI training coach" / "Live AI Trainer" / "Our expert AI" / "trainer" (`welcome.tsx:289` the product; `dog-basics.tsx:1100` the *user*; `upload-video` human trainers) / "Pawly" ("adjusted by Pawly", "Added by Pawly"). Token is `brand.coach`.
- **plan / course / goal / programme / stage:** "Your courses" + "Add goal" + "View plan" on one screen (`train/index.tsx:769-772`); "My Plan" / "My Courses" (`plan.tsx:722`); "Add Another Goal" → "New Course Preview" → "Add This Course" in one flow; "Stage 1" appears once (`plan-preview.tsx:254`); "programme" (`_layout.tsx:304`).
- **session / lesson / clip / drill / exercise / step / protocol:** UI says "Step", loading copy says "exercises", model says `exerciseId`/`protocol`, comments say "drill".
- **milestone / achievement / badge / earned / achieved / unlock:** five terms across `MilestoneCard`, `milestones.tsx:147`, `delete-account.tsx:23`, `coach/index.tsx:142`.
- **Sign in / Log in / Sign up / Create account:** `welcome.tsx:333` vs `login.tsx:187,217` vs `signup.tsx:223,326,356`.
- **Know / Library:** tab "Know", headings "Library", "Back to library".
- **Try again** means close-and-retry-step in `StepHelpSheet.tsx:99` and retry-the-save in `PostSessionReflectionCard.tsx`.
- **UK vs US spelling:** "Personalised / behaviour / programme" vs "personalized / Analyzing / Behavior".
- **Ellipsis:** "…" vs "..." mixed (`coach`, `delete-account`, `session.tsx:892`).
- **Behaviour labels** differ between `add-course.tsx` and `upload-video.tsx:31-40` ("Won't Come (Recall)" vs "Recall / Coming when called"); goal→icon maps disagree between `ActiveCourseCard.tsx:17-31` and `add-course.tsx`.
- **Step counts:** dog-basics "N of 16" vs dog-photo "2 of 6" (`dog-photo.tsx:427-428`): the progress bar visibly jumps mid-flow.

---

## 6. Mobile-specific tells (iOS primary)

### N34. Web/landing patterns inside the app
- `welcome.tsx` full-bleed gradient hero, glass logo tile with gloss strip, feature pills, three value rows, fake bottom sheet with fake grabber (`:302-319`), "No credit card required".
- `dog-basics.tsx:886-1050` a **second** hero/landing screen inside onboarding.
- `coach/index.tsx:286-316` WelcomeState: eyebrow pill + 44pt greeting + question + description, centred.
- `progress/index.tsx:758-827` gradient stats banner with paw decor; `plan.tsx:57-66` gradient plan hero; `plan-preview.tsx:226-299` gradient hero with stat tiles.
- `coach/index.tsx:323-328` a **hamburger icon** (`menu-outline`) that actually means "leave chat" (the tab bar is hidden on that route, so it is the only exit).

### N35. Ignoring platform conventions
- `headerShown: false` on **every** stack (`(auth)`, `(onboarding)`, and all five tab stacks). No native large titles, no native back button, no title truncation, no scroll-edge behaviour. Consequently **six different hand-rolled back buttons**: 36pt circle + `arrow-back` (`plan.tsx:636`), 44pt `arrow-back` (`calendar`, `notifications`, `add-course`, `notification-settings`), text glyph `‹` (`upload-video.tsx:538`), chevron + "Back"/"Close" text (`session.tsx:1692`), "← Back" text (`SessionModePicker.tsx:66`, `PostSessionReflectionCard.tsx:162`, `forgot-password.tsx:61`, `milestones.tsx:140`), `IconButton` chevron (`tools`, `article`, `edit-dog`, `delete-account`, `privacy`, `terms`).
- `(onboarding)/_layout.tsx:9,11` disables back-swipe **and** native transitions for the whole flow, replaced by a JS slide (`dog-basics.tsx:221-241`). Dead redirect routes (`dog-environment`, `dog-problem`, `video-upload`) render `null` then redirect, leaving blank frames in the back stack.
- Sheets: `BottomSheet.tsx:65` is a custom `Modal` + `Animated.timing`, no drag-to-dismiss, no detents, no `formSheet`. `session.tsx:1602-1685` hand-rolls a *second* sheet. Centred `Modal` dialogs: `train/index.tsx:827-870`, `progress/index.tsx:510`.
- Apple Sign-In uses a custom black `Pressable` (`login.tsx:199-207`, `signup.tsx:338-346`) instead of `AppleAuthentication.AppleAuthenticationButton`, which Apple's review guidelines require.
- Custom floating pill tab bar (`(tabs)/_layout.tsx:38-61`), ~111pt footprint vs native 83pt; not registered as absolute in `screenOptions`, so React Navigation measures a 0-height bar and **no screen is inset automatically** (`useBottomTabBarHeight` used nowhere). Each screen guesses: `spacing.xxl*2` (96), `spacing.xxl*2+lg` (120), `spacing.xl*2` (64: `plan.tsx:764`, `milestones.tsx:170`, `notification-settings.tsx:120` → last row under the bar), `spacing.xxl` (48: `calendar.tsx:95`, `tools.tsx:40`). Returns `null` on the coach route so navigation disappears.
- Fake switch built from two `View`s (`notification-settings.tsx:30-58`); hand-rolled 50×28 toggle (`upload-video.tsx:409-429`); native `Switch` used in `add-course.tsx:586`. Tap-to-cycle 5→15→30 instead of a picker (`notification-settings.tsx:165`); inline spinner `DateTimePicker` that never dismisses on iOS (`:230-242`).
- `TouchableOpacity` mixed with `Pressable` (`plan-preview.tsx:2`, `privacy-policy.tsx:11`, `MilestoneCard`, `progress`).
- Legal screens as a wall of non-selectable `Text` (`privacy-policy.tsx:103-110`, `terms-of-service.tsx:95-102`), email not a `Linking` link.
- Status bar imperatively set to light on welcome and never reset (`welcome.tsx:172-176`) → leaks onto the light login screen.
- `app/_layout.tsx:330` `if (!fontsLoaded) return null` — blank frame instead of holding the splash (`SplashScreen.preventAutoHideAsync` unused).
- Android: `QuestionScreen.tsx:53` KAV `behavior` undefined on Android; patterned `Vibration.vibrate([...])` (`session.tsx:293,437,…`) is Android-only behaviour and ignored on iOS.

### N36. Touch targets under 44×44pt
- `dog-basics.tsx:742-756` seven 28×28 selector dots, 8pt gaps.
- `ScheduleSelector.tsx:57-67` day chips ≈43pt with 4pt gaps.
- `CalendarDayCell.tsx:37-51` ≈42pt; `TrainingCalendar.tsx:62-87` 36×36 month nav, no hitSlop.
- `progress/index.tsx:214-218` bar-chart bars 36pt wide, **4pt** minimum height; `:552-554` "Close" ≈17pt tall.
- `know/index.tsx:123-133` category chips 36pt; `know/article/[slug].tsx:92-106` back 40×40, no hitSlop.
- `coach/index.tsx:230-232` mic 38×38 (and **no `onPress`**), `:234-251` send 42×42, `:343-352` reset 42×42, `:221-223` "+" button with no `onPress`.
- `NotificationBell.tsx:11` default 42×42; `profile/index.tsx:201-219` avatar edit badge 28×28; `milestones.tsx:128-141`, `delete-account.tsx:108-124`, `privacy-policy.tsx:81-97`, `terms-of-service.tsx:73-89`, `plan.tsx:636-650` back buttons 36×36 no hitSlop.
- `plan.tsx:192,738` course pills and "Add goal" `minHeight: 36`; `LiveAiTrainerOverlay.tsx:555-562` "Manual" `minHeight: 32`, `:536-543` cancel 36pt; `tools.tsx:147` 36pt back.
- Text links at caption height (~20–34pt): `login.tsx:173-177,214-219`, `signup.tsx:353-358`, `welcome.tsx:331-335`, `dog-photo.tsx:296-300,410-414,433-437`, `plan-preview.tsx:591-593`, `train/index.tsx:355-357` "Discard", `upload-video.tsx:433-437,479-486`, `WalkLogModal.tsx:267-281` "Skip logging", `SectionHeader.tsx:35` actions (36pt via hitSlop), `forgot-password.tsx:61-65`.
- `Button` `sm` size is 36pt tall (`Button.tsx:34`).

### N37. Safe areas / notches / home indicator
- `plan-preview.tsx:226-241` `SafeScreen` wraps the green hero so a beige band sits **above** the gradient at the status bar; then `paddingTop: 56` literal.
- `dog-basics.tsx:1286-1315` generating screen has no safe-area wrapper.
- `coach/index.tsx:165-169` KAV inside SafeAreaView without subtracting the bottom inset → ~34pt gap above keyboard on notched devices.
- Under the floating tab bar (see N35): `plan.tsx:764`, `milestones.tsx:170`, `notification-settings.tsx:120`, `calendar.tsx:95`, `tools.tsx:40`.
- Magic bottom paddings coupled to unmeasured footers: `QuestionScreen.tsx:96,123` (140), `dog-basics.tsx:1152` (140), `plan-preview.tsx:230` (120), `upload-video.tsx:571` (140/40), `session.tsx:932,1098` (+140/+160), `LiveAiTrainerOverlay.tsx:317,331` (+120/+64), `calendar.tsx:98,102` (top 100).

### N38. Loading states
Skeletons exist in exactly two screens (`train/index.tsx:124-138`, `progress/index.tsx:65-78`, both good). Everywhere else:
- Spinner-only with layout shift: `know/index.tsx:149-152`, `know/article/[slug].tsx:110-113`, `calendar.tsx:99`, `session.tsx:866-909`, `coach/index.tsx:119-122` (spinner in a glass card), `plan-preview.tsx:169-207` (full takeover with fake messages, then the real screen fades in from nothing).
- Text-only: `notifications.tsx:120-131` "Loading notifications…".
- Nothing at all: `plan.tsx:664` `if (!displayPlan) return null`; `notification-settings.tsx` no loading state, toggles flip only after the round trip; `milestones.tsx` none; `app/_layout.tsx:330` blank frame before fonts.
- Fake progress: `VideoUploadProgress.tsx:48-49` ETA invented from a 15-second assumption; `dog-photo.tsx:108-116` 500ms `setInterval` re-rendering the tree for an ellipsis.

### N39. Empty and error states
`EmptyState` used in 7 files (good ones: coach, know, notifications, progress charts, train). Missing or unstyled:
- `plan.tsx:655-659` bare centred caption "No active plan found. Complete onboarding…"; `calendar.tsx:101-108` hand-rolled, Title Case "No Active Plan"; `DaySessionList.tsx:49-61` dashed box with plain text; `milestones.tsx` no loading or empty state; `dog-basics.tsx:219` breed search with no "no matches" state; `know/index.tsx` has both (good).
- Errors: see W32. `plan-preview.tsx:213-219` error action destroys the user's onboarding answers. `dog-photo.tsx:157-160` permission error with no "Open Settings" action, shown twice (banner + Alert). `FeedbackModal.tsx:184-188` error not attached to the field.

### N40. Haptic feedback
`expo-haptics` is not installed; zero `Haptics.` calls. Only raw `Vibration.vibrate` in `session.tsx` (7 sites) and `RepCounter.tsx:35`, which iOS treats as a single fixed buzz. No feedback on: session complete, rep counted, milestone earned, option selected, tab press, send, save, delete confirmation. `tools.tsx:53` badge advertises "Sound + Haptic".

### N41. Keyboard handling
- No `returnKeyType` / `onSubmitEditing` chaining on email→password (`login.tsx:127-159`, `signup.tsx:268-305`), forgot-password (`:91-110`), breed search (`dog-basics.tsx:374-395`, `edit-dog.tsx:155-170`), know search (`know/index.tsx:92-117`, also no `clearButtonMode`), delete confirmation (`delete-account.tsx:217-224`), feedback message, walk notes (`WalkLogModal.tsx:197-216`). No `textContentType` on email/password fields (breaks iOS autofill).
- `coach/index.tsx:226-238` `multiline` + `returnKeyType="send"` + `blurOnSubmit={false}` → on iOS Return inserts a newline and the Send key does nothing.
- No `KeyboardAvoidingView`: `edit-dog.tsx:134-138` (breed field + dropdown under keyboard), `PostSessionReflectionCard.tsx:555-573` (submit under keyboard), `BottomSheet.tsx:71-76` only avoids keyboard when opted in (default off); `WalkLogModal.tsx:116-121` `maxHeight: 560` overflows with keyboard.
- `WalkLogModal.tsx:224-241` `number-pad` with no way to dismiss (no toolbar, no `returnKeyType` possible).
- Inputs re-implemented by hand instead of `Input` (three different recipes across the three auth screens; `dog-basics`, `edit-dog`, `WalkLogModal`, `know/index`).
- Placeholder contrast 1.94:1 (`Input.tsx:77`).

### N42. Scroll physics
Clean: no `bounces={false}`, no `overScrollMode="never"` anywhere. Nits: chat `FlatList` not `inverted`, relies on `scrollToEnd` + 80ms `setTimeout` (`coach/index.tsx:66,182-202`) → visible jump on first load; `milestones.tsx:172` `getItemLayout` hard-codes 150 vs actual ~138 → scroll-position jumps; hand-rolled 2-column grid instead of `numColumns` (`milestones.tsx:58-113`).

### N43. Spacing values off the grid
Token uses are healthy (1,007 uses of `spacing.*`), but **252 numeric padding/margin/gap literals, 27 distinct values; only 48% land on the 4pt grid, 22% on 8pt.** Off-grid values: 1 ×4, 2 ×28, 3 ×19, 5 ×10, 6 ×29, 7 ×5, 9, 10 ×23, 14 ×10, 15, 17, plus token arithmetic like `spacing.sm + 2`, `spacing.xs + 1`, `spacing.sm + 10` (`plan.tsx:156`), `spacing.md + 4`. Magic values: 100, 120, 140 ×3 (footer clearance), `width: '47.5%'` ×3 (`dog-basics.tsx:345,773`, `ScheduleSelector.tsx:94`, `edit-dog.tsx:376`), `height: 2.5` (`progress/index.tsx:342`), `borderWidth: 1.5` (16 sites) and `2.5`, `3`.

---

## 7. Consistency scan (item 44)

Counts over `app/` + `components/` (95 files). A professional codebase has a small deliberate set of each.

| Dimension | Distinct values | Uses | Notes |
|---|---|---|---|
| `fontSize` literals | **25** | 291 | Token scale defines 6. Most-used literal (15) is not in the scale. |
| `fontWeight` literals | 5 numeric (+6 conditional expressions) | 258 | 49 override a `variant` on the same element. |
| `Text` variants | 9 real + 8 misapplied names | 286 | `caption` ×95, `micro` ×46 do most of the work; `display` ×1. |
| `letterSpacing` | **17** | 74 | Should be 0–1. |
| `borderRadius` literals | **36** | 197 | Token defines 4; token uses 135. |
| Hard-coded hex colours | **66** distinct | 181 in 31 files | Plus 3 palettes: `colors.ts`, `courseColors.ts` (29 hues), `tailwind.config.js` (13). |
| `rgba()` literals | **36** | 68 | 25 are white-alpha "glass". |
| `shadowColor` values | **12** | 26 | Three shadow systems + `#000` literals. |
| `shadowOpacity` values | **15** | 25 | 0.05 → 0.34. |
| `elevation` values | **9** | 23 | |
| Spacing literals | **27** | 252 | 48% on 4pt grid. Token uses: 1,007. |
| Icon sets | 1 (Ionicons) | 152 | 49 distinct glyphs; direct `Ionicons` import in 15 files bypassing `AppIcon`. |
| Gradient screens | 12 files | | |
| Entrance animations | 23 `entering=` + 5 Animated sequences | | |
| Infinite loops | 16 | | 6 decorative. |
| Back-button implementations | **6** | | |
| Card/row specs (Train tab alone) | **24** | | Appendix B table. |
| Press-feedback recipes | **6** | | scale 0.96/0.97; opacity 0.7/0.75/0.8/0.82/0.88; bg swap. |
| Input recipes | **5** | | `Input`, login/signup, forgot, breed search ×2, walk notes. |
| Styling systems | 2 | | NativeWind used for 2 classes in 2 files. |
| Legacy colour aliases still used | 8 names | ~225 | `success_old` etc. 0 uses. |
| Screens > 800 lines | 5 | | `session.tsx` 1,849; `dog-basics.tsx` 1,315. |

---

## 8. What already works (protect during remediation)

- The **shape** of `colors.ts` (`brand/bg/text/border/status`, real light/dark pair, read-time Proxy so no prop drilling).
- `spacing.ts` is a correct 4pt scale and 1,007 call sites use it.
- `Text.tsx` weight→family remap guarantees Nunito on iOS.
- `bg.sand` as a deliberate quiet, borderless surface (`colors.ts:13-15`, `train/index.tsx` SoftNote) and the reasoning comment in `HeroSessionCard.tsx:31-37` ("plain white card, brand green spent on one CTA, course colour only as a chip").
- `train/index.tsx` and `progress/index.tsx` skeletons mirror real layout; pull-to-refresh tinted to brand.
- `session.tsx` crash-safe snapshot/resume, background-time correction, truthful abandon copy, outcome buttons that name the action ("It worked" / "Didn't quite work"), 44pt `IconTap`/`BackButton` with labels.
- `PostSessionReflectionCard` state-named submit ("Saving… / Try again / Save session"), honest save error, `accessibilityRole="radio"`.
- `LiveAiTrainerOverlay` permission gates with Settings deep link, `accessibilityLiveRegion`.
- `BottomSheet` scrim/panel separation (documented), keyboard-aware when opted in, home-indicator padding.
- Auth forms: KAV, `keyboardShouldPersistTaps`, `email-address` keyboard, `autoCapitalize="none"`, specific field-level validation copy, email-confirmation-pending state, Apple cancel handling.
- `delete-account` typed confirmation + native destructive Alert. `add-course` native `Switch`. `WalkLogModal` `number-pad` + sanitisation.
- `notifications.tsx` is nearly clean (tokens, `EmptyState`, 44pt back, viewability mark-as-read).
- `TimerRing`, `ProgressBar`, `SkeletonBlock`, `TypingIndicator` animations are state-driven and cleaned up.
- Copy in `WhyThisChangedSheet`, `AdaptationNotice`, legal screens is specific and in Pawly's own voice.
- Mascot and behaviour illustrations are parameterised SVG on `colors.mascot.*`, not PNGs.

---

## 9. Severity-ranked summary

### The five issues that most make Pawly look generated

1. **The "AI hero" kit, repeated on every important screen.** Gradient banner + uppercase tracked eyebrow + pill above the heading + 40–50pt tracked headline + three glass stat tiles + staggered `FadeInDown` + "→" CTA. It appears in full on `welcome`, `dog-basics` (twice), `plan-preview`, `progress`, `plan`, `coach`. This one pattern accounts for tells 3, 4, 6, 9, 10, 19, 21, 22, 24, 25, 26, 29, 34 simultaneously.
2. **No enforced type scale.** 25 literal sizes, 15pt as the most-used size, 74 tracking overrides, 49 weight overrides on variants, entire screens (`session`, `plan`, `plan-preview`, reflection, overlay) using zero variants, and the shared `SectionHeader` and `Input` bypassing the scale themselves (inputs render in SF Pro).
3. **Colour has no discipline: ~32 accents, three palettes, three shadow systems, glass and gradient tokens, 181 hard-coded hexes, purple in a green app, and the primary button fails AA at 2.28:1.** Dark mode is broken in 31 files. The `secondary` token means two different things.
4. **Everything is the same card.** One 24pt radius + border + shadow under every row, tile, section, empty state and settings row; cards nested three deep; 24 competing row specs in one tab; 36 literal radii papering over a 4-step token.
5. **It does not feel like an iOS app.** No native headers anywhere, six hand-rolled back buttons, a custom floating pill tab bar that no screen is inset for, a custom non-draggable sheet plus a second hand-rolled sheet, a custom Apple button, a fake switch, disabled back-swipe in onboarding, a hamburger that means "exit", zero haptics, zero reduced-motion handling, and 40+ touch targets under 44pt.

### Highest credibility per unit of effort

| # | Fix | Effort | Removes |
|---|---|---|---|
| 1 | Fix the token layer once: darken `brand.primary` to an AA-passing green, delete legacy aliases / `gradient` / `glass` / `shadow.success` / `tintedShadow`, add `lineHeight` to the type scale, fix `getContrastTextColor`, collapse course palette to ≤5 on-brand hues, delete `tailwind.config.js` palette + NativeWind, drop Plus Jakarta. | Small (token files only) | C7, C8, C10, C11, C12, T2, T5 root causes; every downstream screen inherits it. |
| 2 | Turn on native stack headers with `headerLargeTitle` per stack, delete the six back-button implementations, re-enable onboarding gestures/transitions, remove the three dead redirect routes, swap the Apple button for `AppleAuthenticationButton`. | Small–medium (7 layout files + delete code) | N35, half of N36, N37, W33 back-label drift. Biggest "feels native" gain. |
| 3 | Delete the hero kit: remove all 12 gradient sites, all uppercase eyebrows, pills-above-headings, glass tiles, `entering=` cascades, and "→" from labels. Replace each hero with a left-aligned h1 + one caption. | Medium (mostly deletion) | T3, T4, T6, C9, C22, L19, L21, L24, L25, M26, W29, N34. Pure subtraction; nothing to design. |
| 4 | Make `Text` variants the only way to set type: add `lineHeight`/`letterSpacing: 0` to tokens, make `SectionHeader`, `Input`, `QuickSuggestions`, `RepCounter` use them, then a mechanical sweep replacing the 291 literals with the nearest variant (15→caption, 13→micro/caption, 17→body, 26/28→h1, 40+→display). | Medium (mechanical, per-screen commits) | T1, T5, T6 entirely. |
| 5 | Replace the floating pill tab bar with the native `BottomTabBar` (or register it absolute + `useBottomTabBarHeight`), fix the 40+ sub-44pt targets with `minHeight/minWidth 44` + `hitSlop`, add `expo-haptics` at the six confirmation moments, add `useReducedMotion` to `Button`, `MascotCallout`, `BottomSheet`, `SkeletonBlock`. | Small–medium | N35 tab bar, N36, N37, N40, M27/M28 reduced-motion. |
| 6 | One layout primitive: collapse the 24 row/card specs onto **one** list-row pattern (`bg.surface`, `radii.lg`, no border, one neutral shadow, 44pt leading icon, chevron trailing) + `bg.sand` as the only secondary surface; convert Profile settings rows and Plan sessions to iOS grouped inset lists. | Medium–large (per-screen) | L13, L14, L15, L16, L17. This is what makes it look like one team built it. |
| 7 | Copy pass: rename the assistant once, plan/course/goal once, milestone once; sentence-case every button; name every action; replace 12 "Something went wrong" with cause + fix; kill exclamation marks and "Built for / Unlock / Train smarter". | Small (strings only) | W29–W33. |
| 8 | Loading/empty/error: `SkeletonBlock` layouts for know, article, calendar, plan, session-intro, milestones; `EmptyState` for plan/calendar/DaySessionList/breed search; make `plan-preview` retry keep the answers; "Open Settings" on permission errors. | Medium | N38, N39. |

Items 1, 2, 3 and 7 are largely deletion and token edits and can land in the first few commits. Items 4, 6 and 8 are the per-screen migration.

---

## Appendices

Exhaustive per-file findings with line numbers and snippets. Tell numbers inside the appendices use the eight-category legend each report defines at its top (1 type, 2 colour/gradient/glass, 3 cards/badges/stats/emoji, 4 centring/arrows/meta-dots, 5 motion, 6 copy, 7 mobile-native, 8 off-grid spacing, 9 pattern census), which maps onto the 44 items above.


---

## Appendix A — Auth and onboarding (per-file)

#### Audit: AI-generated UI tells — auth + onboarding surfaces

Scope: 17 files read in full. Repo-wide greps confirm: **no reduced-motion handling anywhere** (`reduceMotion|ReducedMotion|isReduceMotionEnabled` → 0 hits in app/, components/, lib/, hooks/, stores/) and **no haptics anywhere** (`expo-haptics|Haptics.` → 0 hits; not in package.json).

Legend for tell numbers: 1 type, 2 color/gradient/glass, 3 cards/badges/stats/emoji, 4 centering/arrows/meta-dots, 5 motion, 6 copy, 7 mobile-native, 8 off-grid spacing.

---

#### app/(auth)/_layout.tsx
- L9 [7] Native header disabled for the whole auth stack → login/signup/forgot get no native back button/title — `headerShown: false`
- L10 [2] Legacy alias instead of the semantic token used in the onboarding layout — `backgroundColor: colors.background` (onboarding uses `colors.bg.app`)

#### app/(auth)/welcome.tsx
- L24–26 [2] Three off-brand green literals; brand primary is `#22C55E`, these are a different hue — `HERO_GREEN = '#8CC63F'`, `'#76B82A'`, `'#5F9E22'`
- L22 [7] Screen width captured once at module scope; no resize/rotation handling — `Dimensions.get('window')`
- L44–49 [5] Entrance fade + spring slide-up on mount (per pill, staggered) — `Animated.parallel([timing(opacity…), spring(translateY…)])`
- L57 [8] Off-grid gap — `gap: 6`
- L58, L63 [2] Glass pill: translucent white fill + translucent border — `'rgba(255,255,255,0.15)'`, `'rgba(255,255,255,0.22)'`
- L59–60 [8] Off-grid padding — `paddingVertical: 7`
- L66–67 [1][2] Hard-coded size/weight/rgba on a `Text` that has variants — `fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.95)'`
- L79–104 [5] Decorative infinite floating loop, not tied to state/action — `Animated.loop(sequence([… -8 … 0]))` on `FloatingPaw`
- L101 [2] Literal rgba — `color="rgba(255,255,255,0.3)"`
- L124–129 [5] Slide-in-from-left entrance on mount per row — `translateX: -12 → 0`
- L136–138 [3][8] Icon well with non-token radius — `width: 40, height: 40, borderRadius: 12`
- L148–149 [1][8] Hard-coded sizes/weights, 1pt margin — `fontSize: 14, fontWeight: '700'` / `fontSize: 12 … marginTop: 1`
- L110–154 [3] Icon-left feature list ×3 ("value rows") — landing-page pattern
- L172–176 [7] Status bar imperatively set to light-content in `useEffect` and never reset on unmount → leaks a light status bar onto the light-bg login screen after `router.push('/(auth)/login')` — `StatusBar.setBarStyle('light-content')` (also duplicated declaratively at L200)
- L178–193 [5] Staggered entrance choreography on mount: logo scale 0.75→1, tagline slide, card slide-up 50pt — `Animated.sequence([…])`, `cardTranslate` from `50`
- L203–208 [2] Decorative full-bleed `LinearGradient` hero — `colors={[HERO_GREEN, HERO_GREEN_DEEP, HERO_GREEN_SHADOW]}`
- L210–220 [2] "Radial glow" blob — `backgroundColor: 'rgba(255,255,255,0.16)'`, `top: -80`
- L227–236 [4][7] Whole hero is center-aligned landing layout — `alignItems: 'center', justifyContent: 'center'`
- L241–246 [2][8] Glass logo container, off-token radius, 1.5 border — `borderRadius: 34`, `'rgba(255,255,255,0.18)'`, `borderWidth: 1.5`, `'rgba(255,255,255,0.28)'`
- L253–256 [2] Colored (green) shadow glow — `shadowColor: '#315F12', shadowOpacity: 0.34, shadowRadius: 24`
- L262–272 [2][8] Fake gloss highlight strip, off-grid offsets — `top: 10, left: 10, right: 10, height: 28, borderRadius: 18, 'rgba(255,255,255,0.18)'`
- L275 [8] Non-token radius — `borderRadius: 28`
- L279 [1][2] Display type entirely hand-rolled — `fontSize: 50, fontWeight: '800', color: '#FFFFFF', letterSpacing: -1.5, lineHeight: 54`
- L288 [1][2] — `fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: '500', lineHeight: 23` (23 is off any scale)
- L289 [6] Marketing tagline; calls the product a "trainer" (elsewhere "AI Coach") — `A trainer who finally knows your dog.`
- L294–297 [3][6] Feature pills as badges — `label="AI-personalized"`, `label="Tracks progress"`
- L302–317 [3][7] Fake bottom-sheet card (not a sheet; not dismissable) with hand-rolled shadow — `borderTopLeftRadius: 32 … marginTop: -32`, `shadowColor: '#000' … shadowRadius: 14`
- L319 [3][7] Fake grabber handle on a non-draggable panel — `width: 36, height: 4, borderRadius: 2`
- L323–325 [6] Generated feature-list copy; "Built for…" shape; UK spelling ("Personalised", "behaviour") vs US elsewhere — `"Plans built for your dog"`, `"AI Coach available 24/7"`, `"Instant expert advice, any time"`, `"Track real progress"`
- L330 [6][7] Generic CTA; size override breaks Button's size scale — `label="Get started free" … style={{ height: 64 }}`
- L331–335 [1][7] Sign-in link: 14pt text + 8pt padding ≈ 33pt tall (<44) — `paddingVertical: spacing.sm`, `fontSize: 14 … fontWeight: '500'`
- L336–338 [1][4][6][8] Centered legal-style micro copy with " · " meta string and 2pt margin; the claim is odd for a flow with no payment step — `fontSize: 11 … lineHeight: 16, marginTop: 2` / `No credit card required · Cancel anytime`
- L333 [6] "Sign in" here vs "Log in" on login/signup — naming drift

#### app/(auth)/login.tsx
- L47, L65, L75, L79 [6] Placeholder error ×4 — `'Something went wrong. Please try again.'`
- L97–108 [1] Heading hand-rolled instead of `variant="display"` (token is 32/extrabold/40) — `fontSize: 34, fontWeight: '800', letterSpacing: -0.5, lineHeight: 40`
- L101, L111, L122, L135, L146, L157, L174, L186, L215, L217, L234, L240 [2] Legacy flat aliases throughout (`colors.textPrimary`, `colors.textSecondary`, `colors.primary`, `colors.surface`) — note `colors.surface` is `#FFFFFF` while `bg.surface` is `#FFFDF9`, so inputs/buttons are a cooler white than onboarding surfaces
- L117–126, L140–150 [1] Field labels hand-styled with legacy sizes rather than a variant — `fontWeight: '600', fontSize: typography.sizes.sm`
- L127–137 [7] Email input has no `returnKeyType="next"` / `onSubmitEditing` to focus password; no `textContentType="emailAddress"`
- L151–159 [7] Password has no `returnKeyType="go"` / `onSubmitEditing={handleLogin}`; no `textContentType="password"`
- L173–177 [7] "Forgot password?" tap target is caption line-height only (~20pt) — no padding/hitSlop
- L180–189 [7] Hand-rolled primary button (radius 16, minHeight 58) rather than shared `Button` (pill, 56); no pressed feedback — `primaryButtonStyle`
- L187 [1] — `fontWeight: '700', fontSize: typography.sizes.md`
- L196 [1] All-caps divider label — `>OR<`
- L199–207 [7] Custom black Pressable for Apple sign-in rather than `AppleAuthentication.AppleAuthenticationButton` (HIG-required control); L204 `color: '#FFFFFF'`
- L214–219 [7] "Sign up" tap target ≈20pt tall (caption text in bare Pressable)
- L227–255 [2][8] Literal radius/border/heights outside tokens — `borderRadius: 16` (×3), `borderWidth: 1.5`, `minHeight: 58` (×3), `backgroundColor: '#000000'`
- No back affordance at all on this screen (pushed from welcome; relies solely on the iOS back-swipe, which is still enabled here) [7]

#### app/(auth)/signup.tsx
- L81, L136, L146, L153 [6] Placeholder error — `'Something went wrong. Please try again.'`
- L116–118 [6] Raw exception text/JSON shown to the user — `` `Something went wrong: ${err instanceof Error ? err.message : JSON.stringify(err)}` ``
- L173–188 [3][4][8] Centered icon-in-circle empty/success illustration — `width: 88, height: 88, borderRadius: 44`, `size={38}`
- L190–195 [4] Center-aligned title + caption — `textAlign: 'center'` ×2
- L197–216 [3][8] Success message wrapped in a tinted card with non-token radius — `borderRadius: 20`
- L238–249 [1] Same hand-rolled display heading — `fontSize: 34, fontWeight: '800', letterSpacing: -0.5, lineHeight: 40`
- L254 [6] Marketing subtitle — `Start training smarter today.`
- L258–267, L286–295 [1] Hand-styled labels — `fontWeight: '600', fontSize: typography.sizes.sm`
- L268–278, L297–305 [7] No `returnKeyType`/`onSubmitEditing` chaining; no `textContentType`
- L326 [1] — `fontWeight: '700'`
- L335 [1] — `OR`
- L338–346 [7] Custom Apple button again; L343 `color: '#FFFFFF'`
- L353–358 [7] "Log in" link ≈20pt tall target
- L366–405 [2][8] Same literal styles duplicated from login.tsx — `borderRadius: 16` ×4, `borderWidth: 1.5` ×2, `minHeight: 58` ×4, `'#000000'`
- L101, L242, L252, L263, L276… [2] Legacy `colors.textPrimary/textSecondary/primary/surface` throughout
- Copy drift [6]: title "Create your account", button "Create account", footer "Log in", success CTA "Go to log in" — vs welcome's "Sign in"

#### app/(auth)/forgot-password.tsx
- L41, L46 [6] Generic error shown as the *email field* error — `setEmailError('Something went wrong. Please try again.')`
- L61–65 [4][7] Custom text back button with arrow glyph instead of native header; caption-height (~20pt) tap target — `← Back`
- L67 [1] Legacy variant alias — `variant="title"`
- L73–85 [2][3][8] Success state as a card with a literal hex fill not in the palette and off-token radius — `backgroundColor: '#EDF7F5'`, `borderRadius: 12`
- L82 [1] Legacy weight/size aliases — `typography.weights.medium, fontSize: typography.sizes.md`
- L91–110 [7] No `returnKeyType="send"` / `onSubmitEditing={handleSubmit}`
- L100–109 [2][8] Input styled differently from login/signup inputs (border 1 vs 1.5, `border.default` vs `border.soft`, radius 12 vs 16, no minHeight vs 58) — three different input recipes across three auth screens
- L117–130 [8] Hand-rolled button, another size — `borderRadius: 12, minHeight: 52`
- L62, L79, L82, L102, L107, L108, L121 [2] Legacy `colors.primary/textPrimary/textSecondary/surface`

#### app/(onboarding)/_layout.tsx
- L9 [7] iOS back-swipe disabled for the entire onboarding stack — `gestureEnabled: false`
- L11 [7] Native push/pop transitions disabled; replaced by a JS slide in dog-basics — `animation: 'none'`
- L19 [7] Redundant — `options={{ gestureEnabled: false }}` (already false at stack level)
- L15–18 [7] Dead redirect routes still registered as screens (see below)

#### app/(onboarding)/dog-basics.tsx
- L104–109 [3] Emoji as icons — `emoji: '🐾'`, `'⚡'`, `'🎯'`, `'⭐'`
- L221–241 [5][7] Custom JS slide+fade transition (30pt) replacing the native stack transition — `exitX = -30/30`, `withTiming(…180)`, `runOnJS(setCurrentStepIndex)`
- L329 [1][8] Input overrides — `inputStyle={{ fontSize: 22, height: 64 }}`
- L370 [6] Generic label — `continueLabel={breed ? 'Continue' : 'Skip for now'}` (and every other step uses the `'Continue'` default)
- L374–395 [7][8] Inline duplicate of the `Input` recipe; no `returnKeyType`/`onSubmitEditing`/`autoCorrect={false}` on a search field — `paddingHorizontal: 16, height: 52, fontSize: 16`
- L381 [7] Blur-delay hack to keep the dropdown tappable — `setTimeout(() => setBreedFocused(false), 150)`
- L383 [2] Hex-alpha string concat — `` `${colors.text.secondary}80` ``
- L396–437 [7] Absolutely positioned dropdown with zIndex hacks inside a non-scrolling body; hand-rolled shadow — `zIndex: 100`, `shadowColor: '#000' … shadowRadius: 8`, `top: 56`
- L426–431 [8] — `paddingHorizontal: 16, paddingVertical: 14`
- L219 [7] No empty state when a breed query matches nothing (dropdown simply doesn't render)
- L444 [6] Vague step title — `title="Tell us a bit more"`
- L530–537, L566–573 [1] Hand-styled link text — `fontSize: 15, … fontWeight: '600'`
- L656–657 [6] — `title="About your household"`, `"This helps us personalise training advice."`
- L698 [4] Centered layout — `alignItems: 'center'`
- L717 [1] Big number hand-rolled — `fontSize: 52, fontWeight: '800', … lineHeight: 60`
- L742–756 [7][8] Seven 28×28pt tappable dots with 8pt gaps — well under 44pt — `width: 28, height: 28, borderRadius: 14`, `gap: 8`
- L886–1050 [7] Second welcome/hero screen inside onboarding, duplicating the auth welcome — landing-page layout in-app
- L888–892 [5] Decorative infinite pulse on the paw hero — `withRepeat(withTiming(1.08, { duration: 1000 }), -1, true)`
- L899–911 [2] Two stacked decorative `LinearGradient`s — `` [`${colors.brand.primary}10`, colors.bg.app, colors.bg.app] `` and `` ['transparent', `${colors.brand.primary}08`] ``
- L913–919 [7] Custom absolutely positioned back chevron — `position: 'absolute', top: insets.top + spacing.sm`
- L921–929 [4] Centered hero — `alignItems: 'center', justifyContent: 'center'`
- L933–957 [2][3] Concentric ring-in-ring icon well with hex-alpha concat — `` `${colors.brand.primary}10` ``, `` `1A` ``, `` `25` ``, `width: 116 … 88`
- L960 [8] — `gap: 6`
- L961–971 [1] Hand-rolled display type — `fontSize: 42, lineHeight: 50, fontWeight: '800', … letterSpacing: -1.5`
- L972–982 [1][4][6] — `fontSize: 17, … fontWeight: '500', textAlign: 'center', letterSpacing: 0.1` / `Train smarter. Bond deeper.`
- L986–998 [3][5][8] Feature list in a card, entrance animation on mount, non-token radius — `entering={FadeInDown.delay(300).duration(500)}`, `gap: 12`, `borderRadius: 20`, `borderWidth: 1.5`
- L999–1002 [6] Generated feature copy — `'Personalised AI training plan'`, `'Smart scheduling around your life'`, `'Track progress week by week'`
- L1009–1010 [8] — `gap: 14`, `paddingBottom: i < 2 ? 12 : 0`
- L1015–1023 [2][3][8] Icon wells — `width: 38, height: 38, borderRadius: 19`, `` `${colors.brand.primary}15` ``
- L1035–1039 [4][5][6] Entrance animation + arrow appended to CTA + generic label — `entering={FadeInDown.delay(600)…}`, `label="Let's get started →"`
- L1043 [8] — `marginTop: 4` (fine, = xs but literal)
- L1045 [6] — `Takes about 2 minutes`
- L1100 [6] The *user* is called a "trainer" here while the product is a "trainer" on welcome — `experienced: 'Experienced trainer'`
- L1115–1121 [2] Gradient blush duplicated from QuestionScreen — `` [`${colors.brand.primary}0A`, 'transparent'] ``
- L1123–1146 [7][8] Header/progress/back block copy-pasted from QuestionScreen instead of reusing it; `OnboardingProgressBar` component bypassed with an inline static bar — `paddingTop: insets.top + 8, paddingBottom: 4, gap: 10`, `width: '100%', height: 4`
- L1152 [7][8] Magic bottom padding to clear the absolute footer — `paddingBottom: 140`
- L1158 [1] Duplicate of the QuestionScreen h1 override — `fontSize: 28, fontWeight: '800', letterSpacing: -0.5`
- L1162 [6] — `Looks good? Tap below to build your plan.`
- L1167–1256 [3][5] Three identical cards (same `radii.lg`, same border 1.5, same `shadows.card`, same icon well + uppercase eyebrow) with staggered `FadeInDown.delay(0/100/200)` — uniform hierarchy, cascade entrance
- L1178, L1209, L1237 [8] — `marginBottom: 10`
- L1179, L1210, L1238 [2][8] — `width: 32, height: 32, borderRadius: 16`, `` `${colors.brand.primary}15` ``
- L1182, L1213, L1241 [1][3] Uppercase eyebrow labels stacked above the heading, built by overriding `bodyStrong` down to 11pt — `textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.8` / `Your Dog`, `Training Goal`, `Schedule`
- L1186, L1217, L1245 [1][8] — `fontSize: 20, fontWeight: '700' … marginBottom: 4`, `fontSize: 18, fontWeight: '700'`
- L1190, L1221, L1246, L1254 [4] " · " meta strings — `` ` · ${breed}` ``, `` {severity…} · {expLabels…} ``, `` {availableDaysPerWeek}×/week · {availableMinutesPerDay} min ``, `` {timeWindowLabel(timeWindow)} · {styleLabels…} ``
- L1264–1268 [2] Gradient fade under footer — `` [`${colors.bg.app}00`, colors.bg.app] ``
- L1277 [4][6] — `label="Build my plan →"`
- L1286–1315 [5][7] Generating screen: pulse loop (acceptable, loading-tied) but no safe-area wrapper, spinner-only, and it immediately `router.push`es (L300) so this frame flashes — `withRepeat(withTiming(1.12…), -1, true)`
- L453 [7] `dogSexNeutered` step exits to a separate route (`/(onboarding)/dog-photo`) which later pushes `/dog-problem` → a redirect route → back into this screen at `?step=5`. Back-stack accumulates redirect frames; back from step 5 lands on a null-rendering redirect.
- L1039, L1277 [4] Arrow glyph appended to button text (×2 in this file)

#### app/(onboarding)/dog-photo.tsx
- L77–84 [5] Sparkle opacity loop runs forever in the `generated` state (decorative, not loading) — `sparkle.value = withRepeat(withSequence(…800…800), -1, false)`
- L108–116 [5][7] JS `setInterval` re-rendering the tree every 500ms for a text ellipsis — `setEllipsis((e) => …)`
- L126, L132 [7] Deprecated API — `ImagePicker.MediaTypeOptions.Images`
- L157 [6][7] Permission error with no "Open Settings" action (`Linking.openSettings`) — `'Photo library permission required. Enable it in Settings.'`
- L159–160 [7] Same error shown twice: inline banner AND a system `Alert.alert('Photo selection failed', …)`
- L205, L209 [7] Navigates by `push` to a redirect route — `router.push('/(onboarding)/dog-problem')`
- L216–227 [3] Three nested concentric "placeholder" rings — `placeholderOuter > placeholderMiddle > placeholderInner`
- L230–237 [3][6] Tinted info card with marketing copy — `Our AI turns your photo into a beautiful illustrated avatar`
- L249–269 [3] Icon-on-top 2-up feature-card grid for Camera/Library — `photoOptionCard` ×2
- L281 [2] — `color="#fff"`
- L286–288 [6] Exclamation enthusiasm — `Looking good!`
- L295 [3][6] Emoji inside a button label — `` label={`✨ Create ${dogName}'s Avatar`} ``
- L347, L358 [4] Centered compare labels
- L350–352 [3] Emoji as an icon between compare images — `<Text style={styles.compareArrowText}>✨</Text>`
- L365–370 [3][6] Success pill badge with system-speak — `Avatar generated successfully`
- L378 [6] — `You can regenerate from your profile settings`
- L425–428 [7] `canContinue={false} onContinue={() => {}}` renders a permanently disabled "Continue" primary button in the footer on every state; step count hard-coded and inconsistent with dog-basics — `currentStep={2} totalSteps={6}` (dog-basics shows "N of 16")
- L296–300, L410–414, L433–437 [7] Text links with `paddingVertical: spacing.xs` → ~32pt tall targets (<44)
- L477–484 [4] Everything centered — `alignItems: 'center', justifyContent: 'center'`
- L491, L499, L508, L522, L524, L534, L567, L575 [2] Eight hex-alpha string concats — `` `${colors.brand.primary}08` ``, `12`, `40`, `0D`, `25`, `18`, `08`, `15`
- L525, L555, L748, L765, L783 [3][8] Five different non-token radii in one file — `borderRadius: 16`, `24`, `20`, `14`, `10`
- L526, L749, L785 [8] Off-grid arithmetic — `spacing.sm + 2` (=10), `spacing.xs + 2` (=6) ×2
- L523 [8] — `borderWidth: 1.5`
- L541, L775 [1] — `lineHeight: 18`
- L549–565 [7][8] Fixed-width cards: 148×2 + 16 gap + 16 padding + 48 screen padding = 376pt → overflows a 375pt iPhone by 1pt and clips on 320pt SE — `width: 148`, `paddingVertical: 24`
- L560–564 [2] Hand-rolled shadow, no token — `shadowColor: '#000', shadowOffset {0,4}, shadowOpacity: 0.08, shadowRadius: 12`
- L553, L578 [8] — `gap: 8`, `marginBottom: 2`
- L580–591 [1] Hand-rolled type instead of variants — `fontSize: 16, fontWeight: '700'`, `fontSize: 12, lineHeight: 16`
- L602 [8] — `borderWidth: 3`
- L604–608 [2] Green glow shadow — `shadowColor: colors.shadow.success, shadowOpacity: 0.20, shadowRadius: 16`
- L616–617 [8] — `bottom: 6, right: 6`
- L633, L676 [1] — `fontSize: 17` (off the 16/18 scale) ×2
- L652 [8] — `borderWidth: 2.5`
- L668 [2] Translucent white overlay — `'rgba(255,255,255,0.18)'`
- L717–722 [2] Second green glow — `shadowColor: colors.shadow.success, shadowOpacity: 0.22`
- L732, L754, L805 [1] — `fontWeight: '600'`, `'600'`, `'500'`
- L739 [1] — `fontSize: 24` (emoji)
- L771 [8] — `marginBottom: 2`
- L154, L192 [7] `console.error` in production paths

#### app/(onboarding)/dog-environment.tsx
- L5–11 [7] Dead route that renders `null` then redirects; still registered in the stack, so navigating to it flashes a blank frame — `router.replace('/(onboarding)/dog-basics')`

#### app/(onboarding)/dog-problem.tsx
- L9 [7] Same dead-route pattern, plus a magic step index coupled to the `STEPS` array order in dog-basics — `router.replace('/(onboarding)/dog-basics?step=5')`; dog-photo `push`es here, so the redirect frame stays in the back stack

#### app/(onboarding)/video-upload.tsx
- L5–11 [7] Dead redirect route, same as above

#### app/(onboarding)/plan-preview.tsx
- L2 [7] Mixes `TouchableOpacity` with the `Pressable`/`Button` used everywhere else — `import { … TouchableOpacity }`
- L34–38 [6] Fake staged progress messages not tied to actual progress — `"Analyzing your dog's profile…"`, `'Selecting the right exercises…'`, `'Building your personalized plan…'` (US spelling vs UK elsewhere)
- L65–67 [5] Infinite pulse (loading-tied; acceptable) — `withRepeat(withTiming(1.1, …1100), -1, true)`
- L138 [6] Raw error leaked to the user — `` `Something went wrong: ${…JSON.stringify(err)}` ``
- L172–178 [2] Decorative gradient — `LinearGradient colors={[hexToRgba(colors.brand.primary, 0.1), colors.bg.app]}`
- L179 [4] Centered loading layout
- L196 [1] — `fontSize: 22, fontWeight: '800', … letterSpacing: -0.4`
- L200 [1][4] — `fontSize: 15, … textAlign: 'center', lineHeight: 22`
- L213–219 [4][6][7] Error state: centered icon + gray text; "Try again" `router.replace`s to the START of onboarding, discarding all answers — `label="Try again" onPress={() => router.replace('/(onboarding)/dog-basics')}`
- L226–241 [7] `SafeScreen` wraps the green hero, so the gradient stops at the status bar and a warm-beige band sits above it (inverse safe-area misuse); plus magic top padding — `paddingTop: spacing.xl + spacing.lg` (=56)
- L227 [5] Whole-screen fade on mount — `entering={FadeIn.duration(500)}`
- L230 [7][8] Magic padding to clear the sticky footer — `paddingBottom: 120`
- L236–241 [2] Decorative hero gradient with a literal hex not in the palette — `colors={[colors.brand.primary, '#16A34A']}`
- L243–256 [3][4][5] Uppercase pill badge *above* the heading, glass fill, entrance animation, " · " meta — `'rgba(255,255,255,0.2)'`, `paddingVertical: 5`, `fontSize: 12, fontWeight: '700', … letterSpacing: 0.8, textTransform: 'uppercase'`, `{goalLabel} · Stage 1`
- L260–263 [1][5] — `fontSize: 40, fontWeight: '800', color: '#fff', letterSpacing: -1.5, lineHeight: 46` + `FadeInDown.delay(120)`
- L267–270 [1][2] — `fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 24`
- L273–299 [3][6] Stat row ×3 (big number + small label) in glass tiles; two of the three values are hard-coded and contradict what the user just chose (they picked `availableDaysPerWeek` and `preferredDays` in onboarding) — `{ label: 'Duration', value: '4 weeks' }`, `{ label: 'Sessions/wk', value: '3–5 days' }`, `'rgba(255,255,255,0.15)'`, `padding: spacing.sm + 2`
- L291, L294 [1][2][8] — `fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.5`, `fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginTop: 3`
- L306–558 [3] Everything-in-a-card: six sibling cards all `radii.lg`, border 1, `shadows.card` — no hierarchy between "What you'll work on", schedule, why, adaptive, bonus, paywall
- L310, L346, L413, L444, L461, L483, L527 [5] Seven more staggered `FadeInDown.delay(300…540)` entrances (eleven total in the file)
- L320, L360, L425, L471 [1] Card headings hand-rolled — `fontSize: 17, fontWeight: '800'`
- L326, L511 [3][8] Custom 7pt bullet dots — `width: 7, height: 7, borderRadius: 4, … marginTop: 9`
- L327, L363, L432, L474 [1] Body copy at 17/26 instead of `body` (16/24) — `fontSize: 17, … lineHeight: 26`
- L336–337 [1] — `fontSize: 15 … lineHeight: 22`, `fontWeight: '700'`
- L357 [3] Amber accent top stripe on card — `<View style={{ height: 4, backgroundColor: colors.brand.secondary }} />`
- L377–380 [8] — `width: 42, height: 42, borderRadius: 21`
- L389 [1][3] Uppercase eyebrow — `fontSize: 12, fontWeight: '600', … textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3`
- L392, L395 [1][8] — `fontSize: 16, fontWeight: '700'`, `fontSize: 14, … marginTop: 2`
- L402, L453 [4] " · " meta strings — `` ` · ${firstScheduledSession.durationMinutes} min` ``, `.join(' · ')`
- L423 [3] Blue accent top stripe — `height: 4, backgroundColor: colors.brand.coach`
- L431 [8] — `marginTop: 4`
- L472–475 [6] "Built for…" heading + vague AI copy — `Built for {dogName}`, `"This plan was tailored to " + dogName + "'s age, environment, and current training goal."`
- L493–494, L520 [6] "courses" vs "plan" in the same screen — `` `${secondaryGoals.length} courses also included` ``, `These run alongside your main plan. Switch between courses anytime from the Train tab.`
- L512, L519 [1] — `fontSize: 16, fontWeight: '600'`, `fontSize: 14, … lineHeight: 21`
- L538–545 [3] Fake blurred "skeleton" bars as a paywall tease — `[0.5, 0.35, 0.2].map(… height: 42 …)`
- L539 [1][3] Uppercase eyebrow — `fontSize: 13, fontWeight: '700', … letterSpacing: 0.5, textTransform: 'uppercase'`
- L548–556 [4][6] Centered lock + "Unlock your full plan" — `fontSize: 19, fontWeight: '800', … textAlign: 'center', letterSpacing: -0.3`, `All 4 weeks, session-by-session guidance, and progress tracking.`
- L564–574 [2] Translucent (glass) sticky footer — `backgroundColor: colors.bg.elevated` (`rgba(255,255,255,0.88)`)
- L578, L583 [6] Em-dash double-verb CTA and centered helper — `"Save my plan — Create account"`, `Your plan is ready. Create a free account to save it.`
- L587, L590 [4][6] Arrows appended — `"Start my first session →"`, `"Unlock full plan →"`
- L591–593 [7] `TouchableOpacity` link, 15pt text + 4pt padding ≈ 26pt target — `Continue with free plan`
- L152 [7] "Unlock" routes to the profile tab, not a paywall — `router.push('/(tabs)/profile')`
- L169–207 → L225 [7] Loading is a full takeover with fake messages, then the real screen fades in from nothing — layout shift, no skeleton
- L64–162 [7] Zero `Text` variants used in this file; every text node is hand-styled

#### components/onboarding/OptionCard.tsx
- L19, L127–128 [3] Emoji-as-icon API — `emoji?: string`, `<Text style={{ fontSize: … 22 }}>{emoji}</Text>`
- L31–41 [8] Size tables with off-grid value — `MIN_HEIGHT … md: 76`
- L56–68 [5] Press-scale on every option card (Button also scales 0.97 → every pressable in the app scales) — `scale.value = withTiming(0.96, { duration: 80 })`
- L71, L119 [2] Hex-alpha string concat — `` `${colors.brand.primary}12` ``, `` `${colors.brand.primary}20` ``
- L79 [2] Literal fallback — `colors.shadow?.soft ?? '#94A3B8'`
- L76–84 [2] Hand-rolled shadow instead of `shadows.card`/`softShadows.card`
- L80, L82 [8] — `height: 2`, `shadowRadius: 4`
- L97 [3] Same `radii.md` for sm/md/lg cards — radius doesn't track size/hierarchy
- L104–105 [8] — `gap: 8`, `gap: 14`
- L115–117 [8] Icon well — `width: 40, height: 40, borderRadius: 20`
- L144 [1] Redundant override of `bodyStrong` (already 600) — `fontWeight: '600'`
- L152 [8] — `marginTop: 2`
- L165–183 [3][8] Corner badge overlay with mixed radii and off-grid padding — `top: -1, right: -1`, `borderRadius: 8`, `paddingHorizontal: 7, paddingVertical: 2`, `borderTopRightRadius: radii.md - 1`
- L179 [1][2] Micro variant shrunk further — `color="#FFFFFF" style={{ fontWeight: '700', fontSize: 10 }}`
- L88–92 [7] No `accessibilityRole="radio"/"checkbox"`, no `accessibilityState={{ selected }}`; no haptic on select

#### components/onboarding/ProgressBar.tsx
- L25 [8] — `gap: 10`
- L29, L39, L31, L41 [8] — `height: 4`, `borderRadius: 2` (4 is on-grid; 2 is not)
- L46 [8] — `minWidth: 38`
- L26–45 [7] No `accessibilityRole="progressbar"` / `accessibilityValue`
- (Positive: animation is tied to step change only, L16–18)

#### components/onboarding/QuestionScreen.tsx
- L39 [6] Generic default CTA inherited by ~14 steps — `continueLabel = 'Continue'`
- L56–62 [2] Decorative gradient blush — `` colors={[`${colors.brand.primary}0A`, 'transparent'] `` (also hex-alpha concat)
- L67, L69, L70 [8] — `paddingTop: insets.top + 8`, `paddingBottom: 4`, `gap: 10`
- L79–87 [7] Custom chevron back instead of a native header (36×36 + hitSlop 8 = 52pt, OK) — `Ionicons name="chevron-back"`
- L91–142 [7] Entire title/body block duplicated for scrollable vs non-scrollable branches
- L96, L123 [7][8] Magic bottom padding coupled to un-measured footer height (breaks when `footerExtra` is present) — `paddingBottom: 140`
- L103–106, L128–131 [1] `variant="h1"` then re-specifies the same values plus letterSpacing — `fontSize: 28, fontWeight: '800', lineHeight: 36, letterSpacing: -0.5`
- L110, L135 [1] Body line-height override — `lineHeight: 22`
- L154–158 [2][8] Gradient fade with hex-alpha concat — `` [`${colors.bg.app}00`, colors.bg.app] ``, `height: 32`
- L168–173 [7] Disabled opacity stacked on `Button`'s own disabled opacity (0.4 × 0.5 = 0.2 effective) — `style={{ opacity: canContinue ? 1 : 0.4 }}`
- L53 [7] KAV `behavior` is `undefined` on Android — text inputs in scrollable steps can sit under the keyboard there

#### components/onboarding/ScheduleSelector.tsx
- L50 [8] — `gap: 4` (literal, and too tight between 7 tap targets)
- L57–67 [7] Day chips: `flex: 1, aspectRatio: 1, maxWidth: 44` → on a 375pt screen with 48pt horizontal padding: (327 − 6×4)/7 ≈ 43.3pt — just under 44, with only 4pt separation; no pressed state; no `accessibilityState`
- L63 [8] — `borderRadius: 22`
- L65 [8] — `borderWidth: 1.5`
- L72–74 [1][2] Micro variant re-sized — `fontWeight: '700', fontSize: 11, color: isSelected ? '#FFFFFF' : …`
- L94 [8] Magic percentage (also used at dog-basics L345, L773) — `width: '47.5%'`
- L99 [2] Hex-alpha concat — `` `${colors.brand.primary}12` ``
- L102 [8] — `gap: 6`
- L114 [1] Redundant — `fontWeight: '600'` on `bodyStrong`
- L90–104 [7] Time-window cards: `Pressable` with no pressed feedback (inconsistent with OptionCard's scale)

#### app/index.tsx
- No tells. Unconditional `<Redirect href="/(auth)/welcome" />`; auth routing is handled elsewhere.

---

#### Cross-file naming inconsistencies
- **trainer vs coach**: welcome L289 "A trainer who finally knows your dog" (product = trainer) → welcome L324 "AI Coach available 24/7" (product = coach) → dog-basics L1100 "Experienced trainer" (user = trainer). Token is `brand.coach`.
- **plan vs course vs stage**: "plan" everywhere; plan-preview L242 comment "Course chip", L494 "courses also included", L520 "Switch between courses"; L254 "Stage 1" appears nowhere else in the flow.
- **Sign in / Log in / Sign up / Create account**: welcome L333 "Sign in"; login L187 "Log in", L217 "Sign up"; signup L223 "Go to log in", L326 "Create account", L356 "Log in"; plan-preview L578 "Create account".
- **Get started**: welcome L330 "Get started free" vs dog-basics L1039 "Let's get started →".
- **UK vs US spelling**: "Personalised"/"behaviour"/"personalise" (welcome L323, L325; dog-basics L657, L1000) vs "personalized"/"Analyzing"/"Behavior" (plan-preview L35, L37; `getBehaviorLabel`).
- **issue / challenge / goal / problem**: dog-basics L507 "main issue", L508 "challenge", L571 "Back to issues", L1214 "Training Goal"; route is `dog-problem`.
- **Step counts**: dog-basics "N of 16" vs dog-photo L427–428 "2 of 6" (progress bar visibly jumps mid-flow).
- **"Skip for now"**: a primary-button label in dog-basics L370, a footer text link in dog-photo L435.
- **Two whites / two token families**: auth screens use legacy `colors.surface` (#FFFFFF) + `colors.primary/textPrimary`; onboarding uses `colors.bg.surface` (#FFFDF9) + `colors.brand.primary/text.primary`.
- **Three input recipes**: login/signup (1.5 / `border.soft` / r16 / minH 58), forgot-password (1 / `border.default` / r12 / no minH), `Input` component + breed search (1.5 / `border.default` / `radii.md` / h52).
- **Two button recipes**: auth hand-rolled (r16, minH 58) vs shared `Button` (pill, h56) vs welcome override (h64).

#### What's already good (preserve in remediation)
- `components/ui/Text.tsx` maps `fontWeight` → Nunito family, so weight overrides never fall back to SF Pro; variants exist and carry line-heights.
- All auth forms: `KeyboardAvoidingView` + `keyboardShouldPersistTaps="handled"` + tap-to-dismiss; `keyboardType="email-address"`, `autoCapitalize="none"`, `autoComplete`, `autoCorrect={false}` on email fields.
- dog-basics L321–330: dog-name `Input` has `autoFocus`, `returnKeyType="done"`, `onSubmitEditing` → advances — the one correctly chained input.
- Specific, field-level validation copy: signup L57/L62/L79, dog-photo L159/L194, login L42.
- Signup handles the email-confirmation-pending state (L171–235) and Apple cancel (`ERR_REQUEST_CANCELED`).
- `OnboardingProgressBar` animates only on step change; numeric "N of M" label.
- `OptionCard`: selected state uses border + tint + checkmark (not color alone); min heights ≥64pt; disabled state; press feedback is short and press-bound.
- `QuestionScreen` footer respects `insets.bottom`; back button has `hitSlop`; canContinue gating is real.
- dog-photo: genuine state machine (idle/selected/generating/generated/error), permission vs generic error split, retry cap, before/after compare; the ring spin/pulse and bounce dots are tied to `generating`.
- plan-preview: real error state with an action; `shadows.card` / `shadows.modal` tokens used for cards/footer; `hexToRgba` helper used instead of string concat in the hero.
- Auth stack leaves `gestureEnabled` default → iOS back-swipe works on login/signup/forgot.
- Token layer is thoughtful (warm `bg.sand`, `tintedShadow`, `softShadows`) — it's just underused in these files.
---

## Appendix B — Train tab, session, and training components (per-file)

#### Pawly Train-tab AI-tell audit (read-only)

Repo-wide confirmations (verified with grep over `app/`, `components/`, `hooks/`, `lib/`):
- **No reduced-motion handling anywhere** — zero hits for `AccessibilityInfo`, `isReduceMotionEnabled`, `useReducedMotion`.
- **No haptics library** — zero hits for `expo-haptics` / `Haptics.`; all "haptic" feedback is raw `Vibration.vibrate(...)` (session.tsx, RepCounter.tsx). Note: on iOS `Vibration.vibrate` ignores durations, so the patterned arrays are Android-only behavior.
- Every screen in the tab uses `headerShown: false` (`_layout.tsx` L5) and hand-rolls its own back button — 6 different back-button implementations across the files (see cross-file list).
- Legacy flat tokens (`colors.textPrimary`, `colors.primary`, `colors.surface`, `colors.background`, `colors.secondary`) are still used heavily in session.tsx, upload-video.tsx, PostSessionReflectionCard, SessionModePicker, RepCounter instead of the nested `colors.text.*` / `colors.bg.*` tokens.
- `Text` component maps `fontWeight` → Nunito family, so weight literals don't break the font — but every `fontSize`/`fontWeight` literal still bypasses the named variants.

---

#### app/(tabs)/train/_layout.tsx
- L5 [7] Native header disabled for the whole stack; every child screen builds its own header/back — `screenOptions={{ headerShown: false }}`
- L13–15 [7 good] Session is `fullScreenModal` + `slide_from_bottom`; upload-video / add-course are `presentation: 'modal'` (native sheets). Back-swipe is default-enabled on pushed screens (`plan`, `calendar`, `tools`, `notifications`) — nothing disables it here.

#### app/(tabs)/train/index.tsx
- L173, L214, L539, L649, L851 [1] letterSpacing overrides on named headings — `variant="h2" style={{ letterSpacing: -0.4 }}`, `letterSpacing: -0.6, lineHeight: 34`
- L174, L217, L292, L341, L356, L536, L664, L667, L691, L694, L796 [1] fontWeight overrides stacked on variants — `variant="caption" style={{ fontWeight: '700' ...}}`
- L175, L296, L698 [4] "A · B" meta strings — `{cat.label} · {shown.duration}`, `{courseLabel} · {session.durationMinutes} min`
- L801 [4] Middle-dot glyph as bullet — `<Text ...>·</Text>`
- L228–241 + L588–605 [3] `EmptyState` (padding xl) rendered inside `Card` (padding lg) — double-padded card-in-card
- L663–673, L683–700 [3] Sand tile nested inside white `Card` (nested cards)
- L712–720 [3] `WeekStrip` + 3-up `StatRow` inside a card (big number + small label ×3)
- L831 [2] Scrim literal — `backgroundColor: 'rgba(15,23,42,0.55)'`
- L846 [2] Hex literal fed to tintedShadow — `tintedShadow('#0F172A', 'lifted')`
- L827–870 [7][4] Milestone celebration is a centered `Modal` (not a sheet), all text `textAlign: 'center'`
- L861 [6] Button named "Amazing" instead of an action; L185 "Got it"
- L355–357 [7] "Discard" is a caption-sized text tap target (~20pt tall) with only `hitSlop={8}` → ~36pt
- L216 [7] "Calendar"/"All tools" section actions are bare caption text with hitSlop 12 (~44 only via hitSlop)
- L394 [6/UX] Quick wins re-shuffled every mount — `[...QUICK_WINS].sort(() => Math.random() - 0.5)` — order changes each visit
- L654 [6] Copy: "slipped past its slot — move it and keep the streak alive."
- L772 vs L769 [6] "Add goal" action under a "Your courses" heading (goal/course naming split)
- L124–138 [good] Skeleton mirrors real layout; L529 [good] `paddingBottom: spacing.xxl * 2 + spacing.lg` clears the floating tab bar

#### app/(tabs)/train/plan.tsx
- L57–66 [2] Decorative `LinearGradient` hero — `colors={[planColor, hexToRgba(planColor, 0.78)]}`
- L678–684 [2] Decorative gradient "blush" behind header — `colors={[hexToRgba(planColor, 0.07), 'transparent']}`
- L72, L83, L93–94, L101, L113, L115, L123, L125, L128 [2] White/rgba literals — `color: '#fff'`, `'rgba(255,255,255,0.75)'`, `'rgba(255,255,255,0.12)'`
- L327 [2] Hex-alpha string concat — `` `${colors.brand.coach}22` : `${colors.brand.coach}14` ``
- L73–76 [1] `fontSize: 26, fontWeight: '800', letterSpacing: -0.5`; L98 `22/800/-0.5`; L83, L101, L125, L197, L273, L288, L292, L313, L317, L330, L349, L458, L466, L651, L714–718, L742 [1] raw fontSize/weight on every text (no variants used in this file except L656)
- L508–512 [1] All-caps eyebrow — `textTransform: 'uppercase', letterSpacing: 1.2`; L528 `fontSize: 10, fontWeight: '800', letterSpacing: 0.5` "Current" pill
- L84, L274, L467 [4] "Stage {n} · {w} weeks · {c}/{t} done", "{schedule} · {min} min"
- L331 [4] Arrow appended to link — `Full explanation →`
- L431 [3] 4px accent left bar — `<View style={{ width: 4, alignSelf: 'stretch', backgroundColor: barColor }} />`
- L269 [3] `SessionChangeBadge` pill rendered above the title
- L517–530 [3] Pill next to uppercase week header
- L117 `paddingVertical: 10`, L120 `gap: 8`, L156 `spacing.sm+10` (=18), L191 `gap: 6`, L268 `gap: 4`, L292 `marginTop: 6`, L325 `paddingVertical: 8`, L456 `gap: 5`, L464 `gap: 5`, L521–522 `paddingHorizontal: 8, paddingVertical: 3`, L731 `gap: 4`, L733 `paddingVertical: 8` [8]
- L192, L738 [7] Course-switcher pills and "Add goal" `minHeight: 36` (<44)
- L636–650, L697–712 [7] Custom 36×36 back button (<44) replacing native header
- L655–659 [7] Empty state is a bare centered caption, no `EmptyState` component — "No active plan found. Complete onboarding to get your personalized plan."
- L664 [7] `if (!displayPlan) return null;` — while loading, screen renders nothing (no skeleton/spinner)
- L764 [7] `paddingBottom: spacing.xl * 2` (64) — tab bar is `position:'absolute'` in `(tabs)/_layout.tsx` L41, so last row sits under it (index uses 120)
- L369 [6] Button label becomes non-action "Session completed" when done
- L318 [6] Vague fallback — `'Adjusted based on recent training patterns.'`
- L722 [6] "My Courses" / "My Plan" vs index "Your courses"; L129 "adjusted by Pawly"
- L423 `borderWidth: 1.5` + `shadows.card` + `radii.lg` on rows — yet another row spec

#### app/(tabs)/train/calendar.tsx
- L4, L79, L103 [icons] `Ionicons` imported directly instead of `AppIcon`
- L75–80 [7] Custom back button (44 min — OK size) replacing native header
- L82 [1] Legacy `variant="title"` + `fontSize: 20` override
- L86–87 [4][6] "All active courses · {dog}" / marketing-ish "Stay on track with {dog}"
- L98, L102 [8] `paddingTop: 100`
- L99 [7] Spinner-only loading (`LoadingSpinner`), layout shift vs. calendar grid
- L101–108 [7][4] Hand-rolled centered empty state (not `EmptyState`); Title Case "No Active Plan"
- L95 [7] `paddingBottom: spacing.xxl` (48) under an absolute tab bar
- L82 [6] "Training Calendar" here vs "Calendar" link on Today

#### app/(tabs)/train/notifications.tsx
- L4, L96 [icons] `Ionicons` direct
- L95–97 [7] Custom back button replacing native header
- L99 [1] Legacy `variant="title"`
- L120–131 [7] Loading state is a text card "Loading notifications…" — no skeleton
- L100 [6] Subtitle under screen title ("Recent updates to your dog's plan") — descriptive filler
- Otherwise clean: tokens only, 44pt back button, `paddingBottom: spacing.xxl * 2`, `EmptyState` used.

#### app/(tabs)/train/tools.tsx
- L14–15 [2] Gradient hex literals — `CLICKER_GRADIENT = ['#F0FDF4', '#DCFCE7', '#F0FDF4']`, `WHISTLE_GRADIENT = ['#FFFBEB', '#FEF3C7', '#FFFBEB']`
- L36–39 [2] Full-screen `LinearGradient` app background (decorative)
- L139 [2] Alpha-suffix concat — `colors.brand.primary + '15'`
- L184 [2] `shadowColor: '#000'` hand-rolled instead of `shadows.card`
- L48–56 [4][3] Centered title with a badge pill beneath it — `headerCenter: { alignItems: 'center' }`, `headerBadge`
- L53 [6] Badge claims "Sound + Haptic" — no haptics lib exists in repo
- L133 `gap: 4`, L137 `gap: 3`, L141 `paddingVertical: 3` [8]; L145 `letterSpacing: 0.3` [1]; L199 `fontSize: 15` [1]
- L17–30, L175–212 [dead] `TIPS` const and `tipsPanel*`/`tipRow` styles are unused
- L40 [7] `edges={['top']}` + `paddingBottom: spacing.xxl` — pushed screen under floating tab bar
- L147 [7] `headerSpacer: { width: 36 }` implies `IconButton` back is 36pt

#### app/(tabs)/train/add-course.tsx
- L22, L208, L333, L442, L734 [icons] `Ionicons` direct
- L204–209, L438–443, L730–735 [7] Custom back/close buttons (44 min — OK) replacing native header
- L290, L474, L487, L589 [2] Alpha concat — `colors.brand.primary + '18'`, `+ '80'`
- L229 [2] Odd fallback — `colors.status.warningBorder ?? colors.warning`
- L322–323 [8] `paddingHorizontal: 8, paddingVertical: 3`; L312, L550, L582 `marginTop: 2`; L241 `marginTop: 4`
- L327 [1] `fontSize: 10, fontWeight: '700'` "Active" pill; L493 `fontSize: 12, fontWeight: '700'`; L392 redundant `fontSize: 16` on body
- L494 [4] "{n} weeks · {k}×/week"; L554–560 "Mon · 9:00 · 15 min"
- L364–371 [5] Decorative infinite pulse loop on the paw icon while generating — `Animated.loop(... 1.06 ...)`
- L373–382 [5][6] Cycling "Building your new course… / Selecting the right exercises… / Scheduling your sessions…" fake-progress copy
- L457–497 [3][4] Centered course card: icon-on-top, pill *below* heading, `alignItems: 'center'`
- L500–535, L566–592 [3] Everything-in-a-card (bullets card, toggle card, first-session tile)
- L261–281 [9] Goal rows: `radii.md` + `borderWidth: 1` + `shadows.card` (different from every other row)
- L211 / L445 / L610 / L239 [6] "Add Another Goal" → "New Course Preview" → "Add This Course" → "Course limit reached" — goal/course flip inside one flow; Title Case buttons
- L750 [6] Placeholder error — `'Something went wrong. Please try again.'`; L753 "Go Back"
- L604 [2] Legacy `colors.background` in footer
- L385 [4] Generating view fully centered
- L586–591 [good] Native `Switch`

#### app/(tabs)/train/upload-video.tsx
- L176, L264 [5] `entering={FadeInRight.duration(280)}` entrance on every step; L247, L444, L491 `FadeIn`
- L177, L180, L189, L194, L199, L213–214, L239, L242, L250, L287, L292, L330–338, L359–370, L415, L425, L434, L445, L468, L483, L493, L539, L588 [2] Legacy tokens throughout — `colors.textPrimary`, `colors.primary`, `colors.surface`, `colors.secondary`, `colors.background`
- L214, L332, L468, L493 [2] Alpha concat — `` `${colors.primary}10` ``, `` `${colors.success}15` ``; L301 `'rgba(0,0,0,0.65)'`; L307 `'#fff'`
- L190 `borderRadius: 20`, L211/L467/L494 `14`, L275 `16`, L302 `6`, L328 `20`, L366/L392 `12`, L414 `14` [3] radius literals off the `radii` scale
- L205 `gap: 12`, L218/L320/L472 `gap: 8`, L299–300 `bottom: 10, right: 10`, L303–304 `8/3`, L326–327 `14/8`, L417 `paddingHorizontal: 3`, L553 `gap: 6`, L571 `paddingBottom: step === 2 ? 140 : 40` [8]
- L220, L474 `fontSize: 15, fontWeight: '600'`; L242 `fontSize: 18`; L307 `13/600`; L339 `14`; L369/L396 `15`; L539 `fontSize: 28` [1]
- L177, L266, L446, L541 [1] Legacy `variant="title"`, plus `fontSize: 18` override at L541
- L538–540 [7][4] Back button is the glyph "‹" as text, no min size — ~20×32pt tap target
- L242–244 [3] Unicode "▲/▼" as icons
- L207–225, L461–478 [9] Hand-rolled outline button duplicating `Button` (used at L206) — two button systems on one screen
- L409–429 [7] Hand-rolled 50×28 toggle instead of native `Switch` (add-course uses `Switch`)
- L433–437 [7] "Remove video and start over" caption Pressable with no minHeight (~20pt)
- L479–486 [7][6] "Done" text link, `paddingVertical: spacing.sm` (~36pt); label is the non-action "Done"
- L447, L503 [6] Exclamation copy — "Video uploaded!", "Review requested! You'll be notified within 48 hours."
- L181 [6] Marketing copy — "Short clips help trainers give you specific, actionable feedback."; L201 "Select a video to get started"
- L444 [4] Success screen fully centered
- L532, L551, L571, L587 [8/consistency] Screen gutters are `spacing.xl` (32) while every other train screen uses `spacing.md` (16)
- L31–40 [6] Category labels differ from add-course: "Recall / Coming when called" vs "Won't Come (Recall)", "Crate / Separation Anxiety" vs "Crate Anxiety", "Settling / Impulse Control" vs "Settling"
- L526 [7 good] `KeyboardAvoidingView` + L572 `keyboardShouldPersistTaps="handled"`

#### app/(tabs)/train/session.tsx
- L293, L437, L442, L460, L1783, L1794, L1812 [7] Raw `Vibration.vibrate([...])` patterns — no expo-haptics; iOS ignores pattern durations
- L699 [2] `backgroundColor: '#000'`; L673, L737, L884, L1021, L1250, L1402 legacy `colors.background`; L877, L1717 legacy `colors.primary`; L954, L1524, L1607 `colors.surface`
- L987 [2 bug] `Chip color={colors.secondary}` — legacy `secondary` is `#F5F7F9` (a surface), so `hexToRgba('#F5F7F9', 0.12)` yields a near-invisible chip
- L1184 [2] `'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.04)'`; L1211, L1660–1661 `'#FFFFFF'`/`'#fff'`; L1629 `'#FEF3C7'`, L1634 `'#D97706'` (tokens `status.warningBg`/`brand.secondary` exist); L1603 `'rgba(6,10,18,0.72)'`
- L1204–1208, L1309–1313 [2] Colored glow shadows — `shadowColor: timerDone ? colors.success : theme.solid, shadowOpacity: 0.3`, `shadowColor: theme.solid`
- L1531–1535, L1613–1617 [2] Hand-rolled `shadowColor: '#000'` instead of `shadows.card`/`shadows.modal`
- L1316, L1556 [2/a11y] Dark text on saturated course color — `color: colors.text.primary` (#111827) on `theme.solid` (e.g. #2563EB, #7C3AED) — contrast failure on blue/violet/indigo courses
- L940 `28/700/36`, L943 `16/24`, L964 `12/700 uppercase 0.6`, L968 `15`, L973 `13/600 uppercase 0.6`, L980 `15`, L1004 `12/700 uppercase`, L1007, L1114 `13/700/0.3`, L1139, L1166 `40/700/46`, L1170 `13/600`, L1216 `14/600/0.3`, L1233, L1274 `16/600`, L1316 `17/700`, L1411 `26/700/32`, L1414, L1427, L1456 `15/600`, L1516 `30/800/40`, L1519, L1556, L1567, L1568, L1639 `22/800/-0.3`, L1642, L1661 `17/800/0.1`, L1676, L1710, L1732 [1] — no `Text` variants used in the entire file
- L964, L973, L1004 [1] Uppercase eyebrows — "TODAY'S GOAL FOR {DOG}", "BEFORE YOU START", "TRAINER NOTE"
- L955 `borderRadius: 16`, L997 `14`, L1031 `16`, L1111 `99`, L1130 `12`, L1149 `20`, L1267 `14`, L1300 `14`, L1525 `20`, L1548 `14`, L1608 `32`, L1621 `999`, L1651/L1670 `18`, L1725 `99` [3] radius literals (none use `radii`)
- L999–1000 [3] Accent left stripe — `borderLeftWidth: 4, borderLeftColor: theme.solid`
- L1522–1541, L1562–1572 [3] Stat rows ×3 in a card; prop is named `emoji` but carries an icon name
- L1106–1117 [3] "Step n of N" pill above the step card
- L1030 `minHeight: 58`, L1175 `gap: 24`, L1224 `height: 300`, L1653 `paddingVertical: 17`, L1671 `paddingVertical: 15`, L1708 `gap: 4`, L1724 `spacing.xs + 2`, L932 `+ 140`, L1098 `+ 160` [8]
- L1393–1403, L1502–1512, L1623–1645 [4] Fully centered layouts (step-complete, complete, abandon sheet)
- L1367–1384, L1429–1438 [5] Auto-advance after 2.5 s with a draining bar — motion + navigation not initiated by the user
- L1602–1685 [7][9] Hand-rolled `Modal` sheet (radius 32, own scrim/shadow/handle) instead of the shared `BottomSheet` used by every other sheet
- L1692–1714 [7] Custom text "Back"/"Close" + chevron back control (third back-button style in the tab)
- L866–909 [7] Loading is icon + spinner + text, centered — no skeleton
- L892 [6] `'Getting your session ready...'` (three periods; others use "…")
- L1170, L1217 [6] "Done!" / "Time's up"; L1456 "Oops, undo"; L1490 "{dog} crushed it!"
- L1005 "Trainer note" vs L1119 "Help with this step" vs overlay "Coach" [6]
- L1090 [good] Progress bar offset by `insets.top`; L1336–1345, L1699–1706 [good] 44pt min targets with `accessibilityLabel`; L1257–1275 [good] Outcome buttons name the action ("It worked" / "Didn't quite work")

#### components/train/ActiveCourseCard.tsx
- L38–56 [2] Custom shadows with hex `'#1A2436'`, two levels, bypassing `shadows`/`softShadows`
- L82 [3] `borderRadius: 20` (off-scale); L96–105 [3] 8px accent left stripe; L110–112 52×52 icon tile `borderRadius: 15` [8]; L157–160 34pt chevron circle (decorative, off-scale)
- L90 `paddingVertical: 20`, L91 `gap: 14`, L123 `gap: 6` [8]
- L127–131 `fontSize: 19, fontWeight: '800', letterSpacing: -0.4, lineHeight: 23`; L145–149 `13/400/17` [1]
- L151 [4] "Paused · {n} of {m} sessions"
- L17–31 [6] Second goal→icon map that disagrees with add-course.tsx (`potty: 'water'` vs `'sunny'`, `puppy_biting: 'flash'` vs `'happy'`, `settling: 'moon'` vs `'bed'`)
- L119 `as any` icon cast

#### components/train/CalendarDayCell.tsx
- L58, L82, L91 [2] `'#FFF'` literals
- L54–56 [1] `fontSize: 16, fontWeight: isToday || isSelected ? '700' : '400'` (no variant)
- L47 `margin: 2`, L49 `borderWidth: 1.5`, L71 `bottom: 4`, L73 `gap: 2` [8]
- L37–51 [7] Cell = `(390 − 32 − 32)/7 ≈ 46` minus `margin 2` each side → ~42pt on a 390-wide phone (borderline <44)

#### components/train/DaySessionList.tsx
- L4, L109, L161, L173 [icons] `Ionicons` direct
- L16–20 [4][6] "Added by Pawly · Foundation practice" meta strings
- L104 [2] Alpha concat — `colors.brand.secondary + '20'`
- L118–146 [3] Course badge pill rendered *above* the title; L137–141 `fontSize: 10, fontWeight: '700', letterSpacing: 0.3` [1]
- L126–127 `paddingHorizontal: 7, paddingVertical: 2`, L131 `gap: 6`, L128/L157/L172 `4` [8]; L134 stray blank line
- L150 [4] "{time} · {n} min"
- L86–95 [9] Row = `radii.lg` + `borderWidth: 1` + **no** shadow + 40pt icon (vs 44 everywhere else)
- L49–61 [7] Empty state = dashed box with plain text, not `EmptyState`

#### components/train/HeroSessionCard.tsx
- L54–57, L79–80 [5] Entrance spring fade + `translateY 12→0` on mount (comment acknowledges it; still an on-mount animation on a daily screen)
- L61, L64, L67, L113 [4] "Missed · …", "Next · …", "Today · …", "{min} min · Week {n} · Stage {s}"
- L85–100 [3] Course chip pill positioned above the heading
- L143 [2] Green glow under the CTA — `tintedShadow(colors.brand.primary, 'float')`
- L91 `paddingHorizontal: 12`, L92 `spacing.xs + 2` [8]
- L97, L101, L127, L180 [1] fontWeight overrides on variants; L109 `letterSpacing: -0.4, lineHeight: 28`
- L154 [4] Centered row of text links; L183 chevron appended to link text
- L31–37 [good] Documented rationale: plain white card, brand green spent on one CTA, course color only as a chip

#### components/train/QuickWinCard.tsx
- L34–42 [5] Per-card press-scale (duplicates `Button`'s press-scale)
- L60, L87 [2][3] Two colored `tintedShadow(cat.color)` — on the tile and again on the icon well inside it (nested shadowed surfaces)
- L64–75 [2] Decorative corner glow blob — `hexToRgba(cat.color, 0.10)` 120px circle at `right:-40, top:-40`
- L83 `borderRadius: 18` [3 off-scale]; L98 `spacing.sm + 2`, L99 `spacing.xs + 1`, L119 `spacing.xs + 2` [8]
- L115 `fontWeight: '800', lineHeight: 21, letterSpacing: -0.2` [1]; L104, L121 fontWeight overrides
- L18–19 fixed 160×184 tile
- L21–27 [good] `mixHex` real blend rather than rgba wash — dark-mode safe

#### components/train/TrainingCalendar.tsx
- L3, L73, L86 [icons] `Ionicons` direct
- L49 [3] `borderRadius: 24` literal (equals `radii.lg` but bypasses it); no shadow/border — yet another card spec
- L62–71, L75–87 [7] 36×36 month nav buttons (<44) with no hitSlop
- L98 [1] `fontWeight: '700'` on micro; L106 `gap: 2` [8]

#### components/train/WalkGoalRow.tsx
- L48–49 [3] Micro eyebrow "Today's walk" above the heading
- L48, L51, L74 [1] fontWeight overrides on variants
- L62 [7] "Log" button `minHeight: 40` (+ hitSlop 8 → OK, but below 44 visually)
- Otherwise on-token (`softShadows.card`, `radii.lg`, `spacing.*`).

#### components/train/WeekStrip.tsx
- L49 [2] `color="#fff"`
- L39, L56, L64, L72, L89, L146 [1] fontWeight overrides; L141 `letterSpacing: -0.4`
- L161–187 [3] Three-up stat row (big number + small label ×3) with dividers — comment on L160 confirms it's intentional
- L135 [4] Stats centered
- L175 [dead] No-op ternary — `label={streak === 1 ? 'day streak' : 'day streak'}`

#### components/session/PostSessionReflectionCard.tsx
- L91–111 [5] Slide/fade transition between question steps (user-initiated — acceptable, but it's the only screen with it)
- L162 [4][7] Text arrow back control — `← Back` (no icon, ~44 via padding)
- L166–176 [4] Centered "Session complete" badge header; L174 "{duration} · {summary}" [4]
- L182–189 [1] Uppercase eyebrow — `fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8`; L198, L753, L760 `fontSize: 11`
- L325–343 [2] Hard-coded outcome colors — `'#16a34a'`, `'#dcfce7'`, `'#d97706'`, `'#fef3c7'`, `'#dc2626'`, `'#fee2e2'` (all have `colors.status.*` / `brand.*` equivalents)
- L641, L729 [2] `'#E6F4F1'` selected fill — teal-ish, not a token, not the brand green tint
- L416, L671 [2] `'#fff'`; L138 legacy `colors.background`; L392, L562, L644, L732 `colors.surface`; L645, L664–665, L678, L727, L740 legacy `colors.primary`
- L591–595 [2] Colored glow on submit — `shadowColor: theme.solid, shadowOpacity: 0.18`
- L602 [2/a11y] `color: colors.text.primary` on `theme.solid` submit button — same contrast bug as session.tsx
- L352–356, L456–462, L547 `fontSize: 26, fontWeight: '700', lineHeight: 34`; L169 `17/700`; L173, L372, L428 `14`; L421 `19/700`; L495 `13/18`; L537 `15/700`; L540 `13/19`; L550 `15/22`; L567 `15`; L600 `17/700/0.2`; L676 `17`; L739 `18` [1] — no variants used
- L363 `12`, L389 `16`, L409 `14`, L490 `10`, L527 `12`, L563 `14`, L637 `14`, L725 `12` [3] radius literals
- L205 `gap: 3`, L215 `borderRadius: 2`, L365 `spacing.sm + 2`, L428 `marginTop: 3`, L536 `gap: 2`, L587/L653 `spacing.md + 4` [8]
- L391 + L403 [3] `minHeight: 72` outer + `minHeight: 84` inner on the same option (conflicting)
- L555–573 [7] Multiline `TextInput` in a `ScrollView` with no `KeyboardAvoidingView` — submit button can sit behind the keyboard
- L521–545, L606 [good] Honest error ("We couldn't save this session / Your answers are still here") and state-named submit ("Saving…" / "Try again" / "Save session")

#### components/session/RepCounter.tsx
- L60–69 [1] Raw `RNText` (bypasses the Nunito-mapping `Text`) — `fontSize: 96, fontWeight: '700', lineHeight: 110` renders in SF Pro
- L73, L91, L102 [1] `fontSize: 18/600`, `14`, `14 underline`
- L51–55 [2] `'#FEF9C3'`, `'#DCFCE7'`, `'#FEFCE8'` literals; L56 `borderRadius: 24`
- L35 [7] `Vibration.vibrate(30)` (no haptics)
- L78 [6] "Target reached!"
- L40 [4] Whole counter centered; L83 `marginTop: 8`, L90 `marginTop: 16`, L101 `paddingVertical: 12` [8]
- L26–32 [5 ok] Scale bounce is tied to `count` change

#### components/session/SessionModePicker.tsx
- L66 [4][7] `← Back` text arrow (second style, vs session.tsx chevron + "Back")
- L70–106 [4][3] Centered header, icon-on-top in a 72pt rounded square
- L104 [6] Marketing copy — "Our expert AI watches and listens to provide real-time coaching for {dog}."
- L145–156 [1][3] All-caps "NEW" badge — `fontSize: 10, fontWeight: '800', letterSpacing: 0.5`, `paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99` [8]
- L117–121 [2] Colored glow — `shadowColor: colors.shadow.success, shadowOpacity: 0.14`
- L36, L38 [2] Legacy `colors.primary`, `'#fff'`; L114, L184 `colors.surface`; L46 `colors.background`
- L84–91 `26/700/-0.5`; L96–102 `15/22`; L142, L208 `17/700`; L158, L211 `13/19`; L223 `12` [1]
- L75 `24`, L115/L184 `20`, L130/L198 `18`, L167 `10` [3] radius literals; L140, L207 `gap: 4`
- L209 [6] Option label "Do Normally" (vs overlay "Manual" / "Train manually instead")

#### components/session/StepCard.tsx
- L76, L81, L85, L86 [2] `'#FFFBEB'`, `'#F59E0B'` (= `brand.secondary` literal), `'#78350F'` ×2
- L80–81 [3] Accent left stripe — `borderLeftWidth: 3, borderLeftColor: '#F59E0B'`; L74–91 tip tile nested inside the instruction card [3]
- L44–48 `fontSize: 20, lineHeight: 30, fontWeight: '500'`; L60–64 `14/22 italic`; L86 `14/22` [1]
- L79 `spacing.sm + 2` [8]
- L23–26 [dead] `stepNumber`/`totalSteps` props accepted but unused

#### components/session/StepHelpSheet.tsx
- L62, L68 [2] `'#B45309'`, `'#B91C1C'` section colors (no tokens)
- L140 [1] Uppercase section eyebrows — `fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6`
- L49 `22/800/28`; L52, L58, L63, L73, L82 `15/22`; L99 `17/700`; L111 `15/600`; L115 `12/18` [1]
- L99 [2/a11y] `color: colors.text.primary` on `accentColor` button — same contrast issue
- L72 [4] "•" glyph as bullet
- L40–42 [7] Draws its own drag handle inside `BottomSheet` (verify `BottomSheet` with `padded={false}` doesn't also draw one)
- L99 [6] "Try again" here means *close and retry the step*, while "Try again" in PostSessionReflectionCard means *retry the save*
- L39 `maxHeight: 560` literal

#### components/session/TimerRing.tsx
- Clean. L30–39 animation is state-driven (300 ms ease on `currentSeconds`). Only nit: L24 `strokeWidth = 10` literal. Keep as-is.

#### components/training/TrainingToolCard.tsx
- L76–81 [2] Decorative `LinearGradient` fill from hex literals passed by tools.tsx
- L64, L87, L90, L104 [2] Alpha concat — `accentColor + '30'`, `+ 'AA'`, `+ '50'`, `+ '22'`, `+ '18'`, `+ '40'`
- L120 [2] `shadowColor: '#000'` hand-rolled (≈ `shadows.float`)
- L36–58 [5] Press-in starts an infinite pulse loop + animated glow border + scale (three motions per press)
- L68–81 [3] Four nested rounded containers (`wrapper` › `borderShell` › `pressable` › `gradient`), all `radii.lg`
- L83–93, L96–101, L144 [3][4] Icon-on-top, centered feature card with hint pill under text
- L133 `borderWidth: 1.5`, L149–158 90pt pulse ring, L169 `gap: 4`, L181 `spacing.sm + 2` [8]; L188 `letterSpacing: 0.2` [1]

#### components/vision/LiveAiTrainerOverlay.tsx
- L226, L247, L318 [2] Three `BlurView` glass panels (defensible over a live camera, but it is the glass pattern)
- L67 [2] `GREEN = '#4ADE80'` literal (= dark-mode `brand.primary`); L194, L211, L261, L283, L366, L427 `'#fff'`; L301 `'#000'`; L310, L633 `'#FBBF24'`; L332 `'#FCA5A5'`; L350 `'rgba(255,255,255,0.5)'`; L495 `'#9CA3AF'`; L497 `'#ccc'`; L517 `'#000'`; L532, L540, L547, L556, L568–569, L580, L585, L590, L614, L619, L627, L653, L658, L666, L674, L676, L683, L691, L697–698 [2] rgba/hex literals throughout `styles`
- L554 `12/700`, L563 `13/600`, L569 `12/600/0.3`, L570 `16/600/23`, L572 `13/19/500`, L578 `32/800/38`, L580 `15/500`, L591 `13/600`, L594 `32/800/38`, L605 `13/600`, L619 `12/700`, L633 `13/600`, L644 `15/500/22`, L658 `13/600`, L678 `12/600`, L697 `22/700`, L698 `15/22` [1] — no variants
- L548–551 `12/6/20/8`, L557–559 `12/6/12`, L565 `20`, L568 `10/3/99`, L571 `gap: 6, marginTop: 2`, L574–575 `16`, L577 `gap: 6`, L586–588 `14/8/12`, L598–603 `8/14/8/12`, L610 `top: -14`, L613 `gap: 6`, L615–617 `10/5/99`, L624–630 `8/12/8/12`, L637 `16`, L651–656 `8/12/8/12`, L665 `gap: 6`, L669 `16`, L686 `20` [8][3]
- L555–562 [7] "Manual" button `minHeight: 32`; L536–543 36pt cancel button (<44)
- L317, L331 [8] `bottom: insets.bottom + 120`, `top: insets.top + 64`
- L228–233 [3] "Step n of N" pill above the instruction
- L263, L286 [6] "Done!"; L387 first-person AI copy "I'm having trouble seeing clearly"; L371 "Ask Coach" / L302 "Coach counted that rep" vs picker's "Live AI Trainer"; L389 Title Case "Switch to Manual" vs L129 sentence-case "Train manually instead"
- L108–116 [5 ok] Rep pulse tied to `autoRepPulse` state
- L187–221, L249–255, L270–275, L423–425, L197, L317, L331 [good] Thorough `accessibilityRole`/`Label`/`State`/`LiveRegion`; L120–148 [good] Permission/no-device gates with Settings deep-link and manual fallback

---

#### Competing layout patterns (Train tab)

Row / card / section specs currently in play — 24 distinct combinations:

| # | Where | Surface | Radius | Padding | Border | Shadow | Leading element |
|---|---|---|---|---|---|---|---|
| 1 | index `Card` (L228) | `bg.surface` | `radii.lg` 24 | lg 24 | none | `softShadows.card` | — |
| 2 | index `SecondaryRow` (L266) | `bg.surface` | lg | md 16 | none | `softShadows.card` | 44 icon circle (theme.tint) + chevron |
| 3 | index `SoftNote` / sand tiles (L244, L663) | `bg.sand` | lg / md | lg / md | none | none | — |
| 4 | index `ResumeSessionCard` (L328) | `theme.tint` | lg | lg | 1 `selectedBorder` | none | icon + caption |
| 5 | `HeroSessionCard` (L73) | `bg.surface` | lg | lg | none | `softShadows.float` | chip pill row |
| 6 | `QuickWinCard` (L46) | pastel `mixHex` | lg | md | 1 `pastelEdge` | `tintedShadow(cat)` ×2 | 52 icon well r18 |
| 7 | `ActiveCourseCard` (L77) | `bg.surface` | **20** | V 20 / L 24 / R 16 | 1 theme-0.28 or default | custom `#1A2436` ×2 | 8px stripe + 52 tile r15 + 34 chevron circle |
| 8 | `WalkGoalRow` (L23) | `bg.surface` | lg | md | none | `softShadows.card` | 44 icon circle + pill button |
| 9 | plan `SessionRow` (L415) | `bg.surface` | lg | md (via children) | **1.5** theme-0.35 or default | `shadows.card` | 4px bar + 44 icon circle |
| 10 | plan `PlanHeroCard` (L57) | course gradient | lg | lg | none | `shadows.card` | white text |
| 11 | `DaySessionList` row (L76) | `bg.surface` | lg | md | 1 default | **none** | 40 icon circle |
| 12 | `DaySessionList` empty (L49) | `bg.surfaceAlt` | lg | xl | 1 dashed soft | none | — |
| 13 | `TrainingCalendar` (L49) | `bg.surface` | **24 literal** | md | none | none | — |
| 14 | add-course goal row (L261) | surface/surfaceAlt | **md 16** | md | 1 | `shadows.card` | 44 icon circle |
| 15 | add-course preview cards (L457, L501, L566) | `bg.surface` | lg / md | lg / md | 1 default | `shadows.card` | centered 72 icon |
| 16 | `TrainingToolCard` (L68) | gradient | lg ×4 nested | V xl / H lg | 1.5 animated | `#000` float | centered 72 icon + 90 ring |
| 17 | session Intro goal card (L952) | `colors.surface` | **16** | lg | 1 default | none | uppercase eyebrow |
| 18 | session trainer note (L994) | `theme.tint` | **14** | lg | **4px left** | none | uppercase eyebrow |
| 19 | session timer panel (L1146) | theme-0.06 | **20** | V xl / H lg | 1 theme-0.12 | none | 200 ring |
| 20 | session Complete stat card (L1522) | `colors.surface` | **20** | xl | 1 default | `#000` card | 3 stat rows |
| 21 | `StepCard` (L31) | `bg.surface` | lg | lg | 1 soft | `shadows.card` | nested `#FFFBEB` tip r8 + 3px stripe |
| 22 | `SessionModePicker` options (L111, L181) | `colors.surface` | **20** | lg | none / 1.5 strong | colored glow / none | 56 icon square r18 |
| 23 | Reflection option rows (L382, L630, L714) | `colors.surface` | 16 / 14 / 12 | lg / md | **2** | none | 52 icon square r14 / 26 radio |
| 24 | upload-video pick area & outline buttons (L185, L207) | `colors.secondary` / surface | 20 / 14 | — / md | 2 dashed / 1.5 | none | — |

Sheets/modals: shared `BottomSheet` (index QuickWinSheet, plan SessionDetailSheet, StepHelpSheet) vs. hand-rolled `Modal` sheet in session `AbandonSheet` (L1602, radius 32, own scrim/shadow/handle) vs. centered `Modal` for milestones (index L827).

Recommendation basis: patterns 1/2/5/8 (index/Hero/Walk — `bg.surface`, `radii.lg`, `softShadows.card`, no border, 44pt icon circle) are the most coherent and already on-token; 3 (`bg.sand`) is the right secondary surface. Everything else is a candidate to collapse into those.

#### Cross-file naming inconsistencies

- **plan / course / goal**: index "Your courses", "Add goal", "View plan", "Why this schedule", "% of course complete"; plan.tsx "My Plan" / "My Courses", "Add goal"; add-course "Add Another Goal" → "New Course Preview" → "Add This Course", "Course limit reached", "primary course"; calendar "No Active Plan" / "All active courses"; session "Your plan will build on this", "so your plan can adjust".
- **session / training / clip / drill**: "session" (index, plan, session.tsx), "training clip" / "training session clip" (upload-video), "Training Tools", "Training Calendar", index comment calls quick wins "drill"; exit CTAs "Back to today" (session) vs "Back to training" (upload-video).
- **step / exercise / protocol**: UI says "Step n of N" everywhere, add-course loading says "Selecting the right exercises…", data model is `exerciseId` / `protocol`.
- **coach / trainer / AI / Pawly**: "Live AI Trainer", "Our expert AI" (SessionModePicker); "Ask Coach", "Coach counted that rep", "Mute coach voice", "I'm having trouble seeing" (overlay); "Trainer note" (session Intro), "From the trainer" (StepHelpSheet); "trainers give you feedback", "Help the trainer", "Request expert review" (upload-video — human trainers); "adjusted by Pawly" (plan), "Added by Pawly" (DaySessionList); token is `brand.coach`.
- **Back controls (6 styles)**: 36pt circle + arrow-back (plan), 44pt Ionicons arrow-back (calendar/notifications/add-course), "‹" text glyph (upload-video), chevron icon + "Back"/"Close" text (session `BackButton`), "← Back" text (SessionModePicker, PostSessionReflectionCard), `IconButton` chevron-back (tools).
- **Button casing**: Title Case ("Add This Course", "Go Back", "Switch to Manual", "Do Normally", "Open Settings") vs sentence case ("Start session", "It worked", "Train manually instead", "Save session").
- **"Try again"** means close-and-retry-the-step in StepHelpSheet but retry-the-save in PostSessionReflectionCard.
- **Behavior labels**: "Won't Come (Recall)" / "Crate Anxiety" / "Settling" (add-course) vs "Recall / Coming when called" / "Crate / Separation Anxiety" / "Settling / Impulse Control" (upload-video).
- **Goal icons**: `ActiveCourseCard.GOAL_ICONS` vs `add-course.GOAL_OPTIONS` disagree for potty (`water`/`sunny`), biting (`flash`/`happy`), settling (`moon`/`bed`).
- **Icon component**: `Ionicons` direct in calendar, notifications, add-course, DaySessionList, TrainingCalendar; `AppIcon` everywhere else.
- **Legacy vs nested color tokens**: `colors.textPrimary`/`primary`/`surface`/`background`/`secondary` in session.tsx, upload-video, PostSessionReflectionCard, SessionModePicker, RepCounter; nested `colors.text.*`/`bg.*` in the train components. `colors.secondary` is actually a *surface* color, which bites in session.tsx L987.
- **Contrast-on-course-color**: `getContrastTextColor` in courseColors.ts computes luminance then unconditionally returns `'#FFFFFF'`, while session.tsx L1316/L1556, StepHelpSheet L99 and PostSessionReflectionCard L602 put `colors.text.primary` (near-black) on `theme.solid` — pick one rule.

#### What's already good (protect during remediation)

- `index.tsx` L124–138 skeleton mirrors the real layout; L529 bottom padding correctly clears the absolute tab bar; `RefreshControl` tinted to brand.
- The `bg.sand` "quiet surface" idea (`colors.ts` L13–15, index `SoftNote`) — a deliberate escape from everything-is-a-white-card.
- `HeroSessionCard` L31–37 rationale: plain white card, one green CTA, course color only as a chip, mascot for warmth. Keep that.
- `softShadows` / `tintedShadow` warm-tinted shadow rationale in `shadows.ts` L33–39 and its use in index/Hero/Walk/QuickWin.
- `QuickWinCard` `mixHex` real blend for dark-mode-safe pastels.
- `Text` component maps `fontWeight` → Nunito family so weight literals don't silently fall back to SF Pro (RepCounter's raw `RNText` is the one exception).
- `TimerRing`: minimal, state-driven animation, no decoration.
- `BottomSheet`: scrim fades in place while panel slides (documented reasoning), keyboard-aware, safe-area padded.
- `session.tsx`: crash-safe snapshot/resume (L238–267), background-time correction for the timer (L300–316), `AbandonSheet` copy that tells the truth about what gets recorded (L1594–1599), outcome buttons that name the action ("It worked" / "Didn't quite work"), 44pt `IconTap`/`BackButton` with `accessibilityLabel`s, `StatusBar` style switching for the camera mode.
- `PostSessionReflectionCard`: state-named submit ("Saving…" / "Try again" / "Save session"), honest save-error copy, `accessibilityRole="radio"` + `accessibilityState` on options, `keyboardShouldPersistTaps`.
- `StepHelpSheet`: "Skip this step for today" is recorded as a skip and the copy says so.
- `LiveAiTrainerOverlay`: permission/no-device gate screens with Settings deep-link and manual fallback, `accessibilityLiveRegion` on status/coach message/error, 44pt top-bar icon buttons, `KeyboardAvoidingView` around the question input.
- `add-course.tsx` uses the native `Switch`; upload-video uses native `Alert.alert` for permission failures and wraps the form in `KeyboardAvoidingView`.
- `notifications.tsx` is nearly clean: tokens only, `EmptyState`, 44pt back target, viewability-based mark-as-read.
- `WeekStrip` is not tappable, so its 36pt dots are fine; the state-per-day model (done/today/missed/scheduled) is clear.
---

## Appendix C — Progress, Coach, Know, Profile, and shared components (per-file)

I have read every file in scope plus the token files, `Text`, `Button`, `Input`, `Card`, `BottomSheet`, `EmptyState`, `SectionHeader`, the tab layout, and confirmed via grep that there is no `expo-haptics` dependency, no `AccessibilityInfo`/reduce-motion handling, and no consumer of `ShareCard`. Report follows.

#### Pawly UI audit — Progress / Coach / Know / Profile / shared components

Legend for tell numbers: 1 typography literals · 2 colors/gradients/glass · 3 card patterns · 4 alignment/arrows/meta · 5 motion · 6 copy · 7 mobile-native · 8 off-grid spacing · 9 progress-specific.

Global facts established (apply to every file below):
- No haptics anywhere: `expo-haptics` is not in `package.json` and no file imports it.
- No reduced-motion handling anywhere: zero hits for `AccessibilityInfo`, `useReducedMotion`, `isReduceMotionEnabled`.
- Every audited stack sets `headerShown: false` and re-implements a header with a custom back button. Native back-swipe still works (nothing sets `gestureEnabled: false` in these stacks), but there is no native large-title, no automatic title truncation, and back-button hit areas are hand-rolled.
- The tab bar (`app/(tabs)/_layout.tsx`) is `position: 'absolute'`, floats over content, and is ~110pt tall with the home-indicator inset. Screens padding the bottom with `spacing.xxl * 2` (96) are fine; screens using `spacing.xl * 2` (64) will have their last row sit under the bar.
- `Button` (shared) applies a uniform 0.97 press-scale spring to every button in the app.
- `SectionHeader` (shared) hard-codes `fontSize: 20, fontWeight: '800', letterSpacing: -0.3` instead of a variant.

---

#### app/(tabs)/progress/_layout.tsx
- L5 [7] Native header disabled for the whole stack; child screens roll their own — `screenOptions={{ headerShown: false }}`
- L10-11 [7] Explicit `presentation: 'card', animation: 'slide_from_right'` are the defaults; harmless but redundant.

#### app/(tabs)/progress/index.tsx
- L13 [2] Decorative `LinearGradient` import used twice on this screen (wash + hero).
- L44-59 [2][9] `PawDecor` paints white translucent paw shapes as pure decoration inside the hero — `backgroundColor: 'rgba(255,255,255,0.18)'` (L51, L54).
- L85 [3] Prop named `emoji` but typed `AppIconName` — leftover from an emoji-icon design.
- L102-131 [3][9] `StreakCard` = icon-in-circle + big number + small label + pill + dots: the "stat tile" pattern, rendered twice side-by-side (L831-848). Uses `radii.lg`, `borderWidth: 1.5`, `shadows.card` — same treatment as every other card on the screen.
- L123 [8] `marginBottom: 2`
- L128 [1] `fontSize: 28, fontWeight: '800', … lineHeight: 34, letterSpacing: -0.5` — bypasses `typography.h1` (28/extrabold).
- L131 [1] `fontSize: 12 … fontWeight: '600'` instead of `variant="micro"`.
- L139 [8] `gap: 4` (fine) but L142-143 `paddingHorizontal: 8, paddingVertical: 3` — 3 is off-grid.
- L147 [1] `fontSize: 11 … fontWeight: '700'` — 11 is not in the scale.
- L166 [6][9] `Best: {longest}d` — abbreviation `d` inconsistent with "day streak" used at L822.
- L214-218 [7] Bar-chart bars are `TouchableOpacity` with `width: 36` and a min height of 4pt (L211) — touch target far under 44×44; `gap: 6` (L218) off-grid.
- L232 [1][2] `color: '#fff', fontSize: 11, fontWeight: '700'` — hard-coded white + off-scale size.
- L242 [3] `borderRadius: 8` literal (equals `radii.sm` but not tokenized).
- L255 [8] `marginTop: 6`
- L261 [1] `fontSize: 10` axis labels — below `micro` (12); legibility risk.
- L279 [4] Chart is built from rotated `View`s (L335-348) rather than SVG; `height: 2.5` (L342) sub-pixel.
- L304 [8] `marginRight: 6`
- L306, L371, L374 [1] `fontSize: 9` — three instances of a 9pt label.
- L370 [8] `paddingLeft: 32` literal (equals `spacing.xl` but not tokenized).
- L389-391 [4] Trend indicators are Unicode text arrows `'↑' '→' '↓'` (rendered at L448 as `fontSize: 13`) instead of icons.
- L430 [3][9] Accent left stripe on every behavior card — `<View style={{ width: 4, backgroundColor: trend.color, alignSelf: 'stretch' }} />`
- L433 [1] `fontWeight: '800', fontSize: 18 … letterSpacing: -0.3` instead of `variant="h3"`.
- L437-450 [3] Trend pill sits in the card header; `paddingHorizontal: 10, paddingVertical: 5` (L443-444) both off-grid.
- L448-449 [1] `fontSize: 13` and `fontSize: 12 … fontWeight: '700'`
- L455 [8] `gap: 6`
- L468 [1] `fontSize: 13 … fontWeight: '600'`
- L502-507 [5] Entrance spring+fade on mount of the celebration modal (tied to a user tap, so acceptable, but it's an entrance animation with no reduced-motion guard).
- L510 [7] `Modal transparent` centered dialog, not a native sheet/alert; scrim `'rgba(0,0,0,0.6)'` (L514) hard-coded.
- L534, L540 [4] Modal content center-aligned text by default.
- L552-554 [7][1] "Close" is a bare `TouchableOpacity` around 14pt text with no padding or hitSlop — roughly 17pt tall, far below 44pt; `fontSize: 14` literal.
- L586-594 [5][9] Decorative infinite loop on the mascot (`Animated.loop` translateY −4↔0, 3.2s) not tied to any user action or state; never stopped on unmount.
- L657-663 [2] Full-width top gradient "wash" purely decorative — `colors={[hexToRgba(colors.brand.primary, 0.06), 'transparent']}`
- L685-701 [1] Screen title hard-codes `fontSize: 26, fontWeight: '800', letterSpacing: -0.5, lineHeight: 32` twice (L686-691 and L716) instead of a variant; 26 is not in the scale. Two-tone title ("Buddy's **Progress**" in green) is a marketing-hero treatment.
- L720 [8] `marginTop: 2`
- L711-751 [3][4] New-user empty state is a centered card (icon circle 72 + h3 + body + full-width button) — "everything-in-a-card", center-aligned, uses same `radii.lg`/1.5 border/shadow as every other card.
- L747 [6] "Start first session" — good, names the action.
- L758-827 [2][9] **Gradient hero banner**: `LinearGradient colors={[colors.brand.primary, hexToRgba(colors.brand.primary, 0.78)]}` with paw decor, uppercase eyebrow, big number, and translucent white pills.
- L768-777 [1] Eyebrow: `fontSize: 11, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)'` — "OVERALL PROGRESS" all-caps label above a heading.
- L781-785 [1][2] `fontSize: 28, fontWeight: '800', color: '#fff'` — hard-coded white, bypasses h1.
- L793-795, L810-812 [2][8] `backgroundColor: 'rgba(255,255,255,0.2)'` glass pills; `paddingHorizontal: 10, paddingVertical: 5` off-grid.
- L802, L820 [2][9] `color="#fff"` on `flame`/`walk` icons; L803/L821 `color: '#fff', fontSize: 12, fontWeight: '700'`.
- L802/L833 [9] Streak badges use the `flame` icon (AppIcon, not emoji) — flame-streak trope, twice on one screen.
- L866-875, L913-922 [3] Chart cards use identical `radii.lg` + 1.5 `border.soft` + `shadows.card` as StreakCard, BehaviorScoreCard, empty-state card — uniform radius regardless of hierarchy.
- L879-890, L925-936 [3] Icon-in-tinted-circle before each card title (28pt circle, `hexToRgba(…, 0.12)`) — icon-well pattern repeated.
- L891, L937 [1] `fontWeight: '700', fontSize: 15` — 15 not in scale.
- L898-906 [1][8] "N total" pill: `paddingVertical: 3`, `fontSize: 11 … fontWeight: '800'`.
- L967 [6] "See all" — generic link label.
- Missing [7]: no `accessibilityRole`/labels on any pressable in this file; no haptics on milestone share.

#### app/(tabs)/progress/milestones.tsx
- L58-60, L72-113 [7] Hand-rolled two-column grid by pairing even/odd indices and padding with `null` instead of `FlatList numColumns={2}`; `keyExtractor={(_, i) => String(i)}` (L168) index keys.
- L128-141 [7] Custom back button 36×36 with no `hitSlop` — under 44pt.
- L135 [2] `backgroundColor: colors.secondary` — legacy alias token (light `#F5F7F9`), not the semantic `bg.surfaceAlt`.
- L140 [4][1] Back glyph is the Unicode text arrow `'←'` at `fontSize: 18` rather than an icon — inconsistent with `chevron-back` (article, edit-dog, delete, privacy, terms) and `arrow-back` (notification-settings).
- L143 [1] `variant="title"` (legacy alias) then overridden `fontSize: 20` — 20 not in named scale.
- L146 [2] `colors.textSecondary` legacy alias.
- L147 [6] "earned" — a fourth term alongside "achieved" (MilestoneCard), "milestone achievements" (delete-account), "unlock" (coach empty state).
- L154-163 [3][2] Hand-rolled progress bar with `borderRadius: 99` (twice) and `colors.primary` legacy alias (L159), while `progress/index.tsx` uses the shared `ProgressBar` component.
- L170 [7] `paddingBottom: spacing.xl * 2` (64) — last grid row sits under the ~110pt floating tab bar.
- L172 [7] `getItemLayout` hard-codes `150` per row while cards are `minHeight: 130 + margin 4×2` — mismatch causes scroll-position jumps.
- Missing [7]: no loading or empty state; header has no `accessibilityRole`.

#### app/(tabs)/coach/_layout.tsx
- L5 [7] `headerShown: false` — custom header in the screen.

#### app/(tabs)/coach/index.tsx
- L111-116, L131-136, L156-161 [2] Full-screen `LinearGradient colors={colors.gradient.app}` behind every state — decorative gradient background.
- L119-122 [7][2] Loading = spinner inside a translucent floating card (`colors.bg.elevated`, glass-ish) with copy "Preparing your coach..." (L121, three-period ellipsis) — spinner-only, no skeleton.
- L142 [6] "unlock personalized coaching" — marketing verb.
- L165-169 [7] `KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={0}` inside a `SafeAreaView` — workable because the header is custom, but the bottom safe-area inset is not subtracted, so on notched devices there will be an extra ~34pt gap above the keyboard.
- L182-202 [7] FlatList is not `inverted`; relies on `scrollToEnd` in `onContentSizeChange` and an 80ms `setTimeout` (L66) — works but causes a visible jump on first load; `keyboardDismissMode="interactive"` and `keyboardShouldPersistTaps="handled"` are correctly set.
- L206-210 [7] Rate-limit banner dismissed by tapping anywhere on it; `errorBannerText fontSize: 13` (L537); `paddingVertical: 12, borderRadius: 18` (L529-530) off-scale.
- L221-223 [7] Leading `+` button has **no `onPress`** — dead control in the composer.
- L230-232 [7] Mic button has **no `onPress`** — dead control; 38×38 (L608-609), under 44pt.
- L234-251 [7] Send button 42×42 (L616-617) — under 44pt; idle icon `sparkles-outline` (L243) is decorative AI-sparkle iconography.
- L226-238 [7] `multiline` + `returnKeyType="send"` + `blurOnSubmit={false}`: on iOS a multiline input with `blurOnSubmit={false}` inserts a newline on Return and `onSubmitEditing` does not fire, so the "Send" key does nothing.
- L283 [6] Time-of-day greeting ("Good morning/afternoon/evening") — generated-app trope.
- L286-316 [4][6] `WelcomeState` = pill eyebrow + display greeting + h2 question + description, all center-aligned (L478, L502, L509, L513) — the canonical AI hero shape. Copy L300-301 "Get quick guidance for behavior or a clear suggestion on what to work on next." is vague.
- L288-291, L481-500 [1][2][3] Eyebrow pill "PAWLY COACH": `textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700', fontSize: 11` (L494-500); pill has a **green colored glow** `shadowColor: colors.brand.primary, shadowOpacity: 0.18, shadowRadius: 12` (L488-491); pill bg `isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.95)'` (L483) hard-coded; `borderRadius: 999` (L484) literal.
- L303-306, L501-507 [1] Greeting `fontSize: 44, lineHeight: 48` overriding `display` (32) and colored brand green.
- L323-328 [7] Header "menu-outline" hamburger icon actually does `router.replace('/(tabs)/train')` — a hamburger that acts as "leave chat"; because the tab bar is hidden on this route (tabs `_layout.tsx` L34-36) this is the only way out. Non-standard.
- L331-333, L438-441 [1] `headerTitle fontSize: 24, lineHeight: 28` overriding `h2` (22).
- L335, L448-453 [2][6] Fake "online" presence dot with hard-coded `backgroundColor: '#22C55E'` (breaks dark palette which uses `#4ADE80`); `width: 7, height: 7, borderRadius: 3.5` (L449-451) off-grid; `gap: 6, marginTop: 3` (L445-446).
- L337 [6] Subtitle "training assistant" vs title "Pawly Coach" vs privacy "AI training coach" vs delete-account "AI Coach".
- L343-352 [7] Reset button 42×42 (L422-423), under 44pt.
- L378-393 [2] `loadingCard`: `borderRadius: 24` literal, `bg.elevated` translucent, `shadowColor: colors.shadow.strong … shadowRadius: 18`.
- L403-413 [2] Header surface is a **glass panel**: `borderRadius: 28, backgroundColor: colors.bg.glass, shadowRadius: 18` — translucent card with soft glow, floating over a gradient.
- L421-430 [2] `headerIconButton` `bg.elevatedMuted` translucent.
- L541-545 [8] `suggestionTray marginBottom: -10` negative hack; L550 `composerShell marginBottom: 10`.
- L557-571 [2][8] `leadingAction` `borderRadius: 24`, translucent bg, shadow radius 12.
- L572-590 [2] Composer is another translucent glass pill: `borderRadius: 30, minHeight: 58, backgroundColor: colors.bg.elevated, shadowOpacity: 0.12, shadowRadius: 18` — 30/58 off-scale.
- L594-595 [7] `paddingTop: Platform.OS === 'ios' ? 0 : 0` — no-op ternary (dead code).
- L597 [1] Input `fontSize: 17` — not in scale.
- L618-624 [2] `sendButtonIdle: isDark ? colors.bg.surfaceAlt : '#F3F4F6'` — hard-coded light hex behind a theme ternary.
- L92-98 [6] Alert title "Start a new chat?" but confirm button "Reset chat" — two names for one action.
- Missing [7]: no `accessibilityLabel` on any of the four icon-only buttons; no haptic on send.

#### app/(tabs)/know/_layout.tsx
- L5 [7] `headerShown: false`.

#### app/(tabs)/know/index.tsx
- L85 [8] `gap: 4` (on grid, fine) — but header uses `variant="h2"` while Progress/Profile tabs hand-roll 26–28pt/800 titles: inconsistent tab-header hierarchy.
- L88 [6] "Clear, practical dog training guides" — tagline copy under a tab title.
- L92-117 [7] Search field: `TextInput` with no `returnKeyType="search"`, no `clearButtonMode`, no `autoCorrect={false}`, no `accessibilityLabel`; `fontSize: 16` literal (L114); `minHeight: 52` OK.
- L109 [2] `placeholderTextColor={colors.text.secondary + '80'}` — string-concatenated hex alpha hack.
- L119 [8] `gap: 8` literal.
- L123-133 [7][8] Category chips: `paddingHorizontal: 14` (off-grid) + `paddingVertical: 8` + caption lineHeight 20 = **36pt tall** — under 44pt, no hitSlop.
- L149-152 [7] Loading is a lone `ActivityIndicator size="large"` — spinner-only, no skeleton; content pops in with layout shift.
- L164, L174-176 [1] Section labels use `bodyStrong` (16) while other tabs use `SectionHeader` (20/800) — inconsistent section hierarchy.
- Works well: error state with retry (L153-159), no-results state (L178-183), `hasOnlyFeaturedResult` edge case handled (L184-187).

#### app/(tabs)/know/article/[slug].tsx
- L92-106 [7] Custom back button 40×40, no `hitSlop` — under 44pt; label next to it says "Know" not the article/section title.
- L110-113 [7] Spinner-only loading, no skeleton.
- L123 [3] Hero is `Card variant="elevated"` (shadow.modal) containing pills, h1, excerpt, meta — **everything-in-a-card** for a reading screen.
- L124-149 [3] Two pills (category, difficulty) **above the h1** — badges-above-heading; `gap: 8`, `paddingHorizontal: 10, paddingVertical: 4` (L124, L129-130, L141-142) off-grid.
- L128 [2] `backgroundColor: colors.brand.primary + '14'` hex-alpha concat.
- L133, L145 [1] `fontWeight: '700'` / `'600'` overrides on `micro`.
- L152 [1] `lineHeight: 28` literal on body.
- L156-164 [4] Meta row "Pawly · N min read · Updated Mon D, YYYY" (space-separated `gap: 12`) — A·B·C meta string pattern; `gap: 12` off-grid.
- L167-169 [3] Article body wrapped in a second `Card`; `ArticleContentRenderer` then renders `Card`s for tip/warning blocks → **nested cards**.
- L173 [6] "Related in {category}" fine.
- L119 [6] "Back to library" vs tab named "Know" vs L107 label "Know" — library/Know naming split.

#### app/(tabs)/profile/_layout.tsx
- L5 [7] `headerShown: false` for six screens, each re-implementing a header.

#### app/(tabs)/profile/index.tsx
- L47-100 [3] `SettingsRow`: every settings row is its own card (`radii.lg`, 1.5 border, `shadows.card`) — everything-in-a-card instead of a grouped inset list. `paddingVertical: spacing.sm + 2` (=10, L53) off-grid; icon well `borderRadius: 10` (L67) off-scale; `marginTop: 1` (L78).
- L73, L118, L308 [7] `name={icon as any}` — untyped icon names.
- L83 [4] Chevron affordance is an icon (good, not "›" text).
- L108-127 [3] `StatPill` = icon + big number (`fontSize: 16, fontWeight: '800', letterSpacing: -0.3`, L119) + small label — stat-row pattern ×2 (L254-265).
- L154-160 [2] Decorative top gradient wash — `colors={[hexToRgba(colors.brand.primary, 0.07), 'transparent']}` height 320.
- L167-267 [4] Whole profile header is center-aligned (L169, L230, L239).
- L201-219 [7] Avatar edit badge 28×28, no `hitSlop` — under 44pt; `bottom: 2, right: 2` (L206-207) off-grid; `color="#FFFFFF"` (L218).
- L223-235 [1] Dog name `fontSize: 28, fontWeight: '800', lineHeight: 32, letterSpacing: -0.5` — bypasses h1.
- L241 [4] Meta string with hand-spaced dot: `{dog.breed}{ageLabel ? \`  ·  ${ageLabel}\` : ''}` — "A · B" pattern using double spaces.
- L269 [8] `gap: 20` — off-grid.
- L296 [8] `paddingVertical: 10`
- L331 [1] `textTransform: 'capitalize'` on theme option labels.
- L333-367 [3] Non-tappable email row styled identically to tappable `SettingsRow` cards — affordance ambiguity; `borderRadius: 10` (L351).
- L379, L391, L397 [6] Title Case labels ("Send Feedback", "Privacy Policy", "Terms of Service") vs sentence case "Sign out" (L404), "Notifications" — inconsistent casing.
- L380 [6] "Bugs, feature requests, or general thoughts" fine.
- L403-407 [7] "Sign out" fires immediately with no confirmation; and there is **no entry point to `delete-account.tsx`** on this screen (the legal text at privacy L192 says "Settings > Account > Delete Account" — the route exists but isn't linked).

#### app/(tabs)/profile/edit-dog.tsx
- L28-31 [3] Emoji used as icons in age options — `emoji: '🐾'`, `'⚡'`, `'🎯'`, `'⭐'`.
- L42-48, L333-337 [1] `SectionLabel` renders `label.toUpperCase()` with `letterSpacing: 0.5, fontWeight: '600'` — all-caps eyebrows above every field group; `marginBottom: 2` (L336).
- L111 [6] "Changes saved!" — exclamation enthusiasm; then auto-`router.back()` after 800ms (L112-114) — navigation on a timer.
- L116 [6] Placeholder error "Something went wrong. Please try again."
- L126-132 [7] Custom header, title center-aligned (L312) with a spacer view to balance — re-implementing a native header.
- L127 [7] Back 36×36 but `hitSlop={8}` → 52pt effective — the only compliant back button among the custom headers besides notification-settings.
- L130 [6] "Edit Dog Profile" Title Case.
- L134-138 [7] `ScrollView` without any `KeyboardAvoidingView`; the breed field (second card) and its dropdown will be covered by the keyboard.
- L155-170 [7] Breed `TextInput` re-implements `Input` styling by hand (`paddingHorizontal: 16, height: 52, fontSize: 16`, L342-344) instead of reusing `Input`; no `returnKeyType`, no `autoCorrect={false}`.
- L164 [2] `placeholderTextColor={\`${colors.text.secondary}80\`}` hex-alpha concat.
- L171-187 [7] Custom absolute dropdown (`top: 56` L349, `zIndex: 100`) rather than a native picker/sheet; dismiss relies on a 150ms `onBlur` timeout (L162).
- L289 [6] "Save Changes" Title Case; `variant="primary"` explicit default.
- L325-332 [3] Section cards use `radii.md` + 1-px `border.soft` while the rest of the app's cards use `radii.lg` + 1.5-px — inconsistent card treatment.
- L359 [2] `shadowColor: '#000'`.
- L366 [8] `paddingVertical: 14`
- L376 [8] `width: '47.5%'` magic number for a 2-col grid.

#### app/(tabs)/profile/delete-account.tsx
- L23-24 [6] "milestone achievements" and "AI Coach" — naming variants (see cross-file list).
- L46, L51 [6] Alert "Delete Account" / "Delete Forever" — fine (names the action).
- L88-89 [6][7] Fallback copy "An unexpected error occurred. Please try again." shown via `Alert.alert('Error', …)` — generic "Error" title.
- L108-124 [7] Custom back 36×36, no `hitSlop` — under 44pt; card-styled with shadow.
- L125 [1] Header title `fontSize: 18, fontWeight: '800', letterSpacing: -0.3` instead of `h3`.
- L140-164 [3] Warning banner with icon + bold + body; `marginTop: 1` (L152); `fontSize: 14 … letterSpacing: -0.1` (L155); `fontSize: 13, lineHeight: 19` (L159) — 19 off-grid.
- L168 [1] `fontSize: 15, fontWeight: '700', letterSpacing: -0.2` section label.
- L171-190 [3] Deletion list is a card (`radii.lg`, 1.5 border, shadow); `marginTop: 2` (L184); `fontSize: 14, lineHeight: 20` (L185).
- L195-212 [3] Email shown in another identical card; `paddingVertical: spacing.sm + 2` (L201); `marginTop: 2` (L209).
- L218 [1][6] Input label forced upper-case: `` `TYPE "${CONFIRM_PHRASE.toUpperCase()}" TO CONFIRM` `` — all-caps eyebrow, and it shouts the phrase in caps while the check is lowercase.
- L217-224 [7] `Input` has no `returnKeyType="done"`; `marginTop: 2` (L226).
- L234 [6] "Deleting account..." (three periods) vs WalkLogModal "Saving…" (ellipsis glyph); "Delete My Account" Title Case.
- L235-242 [2] Destructive button achieved by overriding a `primary` Button's `backgroundColor` inline — no destructive variant exists.

#### app/(tabs)/profile/notification-settings.tsx
- L30-58 [7] `ToggleRow` is a **fake switch** built from two `View`s (`width: 52, padding: 4`, knob `'#fff'` L56) instead of RN `Switch` — no native feel, no `accessibilityRole="switch"`, no animation; `borderRadius: 999` literal (L51).
- L33-36 [3] Rows use `radii.md` + 1-px `border.default` — a third card style (cf. `radii.lg`/1.5/`border.soft` on Profile, `radii.md`/1/`border.soft` on edit-dog).
- L114-116 [7] Back button correctly `minHeight/minWidth 44` — but uses `arrow-back` (Material glyph) while every other screen uses `chevron-back`.
- L117 [1] `variant="title"` legacy alias.
- L120 [7] `paddingBottom: spacing.xl * 2` (64) — last toggle sits under the floating tab bar.
- L133 [1] `textTransform: 'capitalize'` on raw permission enum string.
- L145-160, L162-184 [7] "Fallback reminder time" and "Reminder lead time" are cards you tap to open a picker / **cycle through 5→15→30** (L165) — hidden-state tap-to-cycle instead of a segmented control or native picker; description literally says "Cycles through 5, 15, and 30 minutes." (L180).
- L230-242 [7] `DateTimePicker display="spinner"` rendered inline at the bottom of the screen (outside the ScrollView) — it pushes layout up when shown, no sheet, no Done button; on iOS it never auto-dismisses (L89-91 only closes on Android).
- L217 [6] "Lifecycle" — opaque label for users; L140/L156/L180 descriptions end in periods while L212/L219/L224 style varies.
- Missing [7]: no loading state while `loadPrefs` runs; toggles flip only after the Supabase round-trip (no optimistic UI).

#### app/(tabs)/profile/privacy-policy.tsx
- L11 [-] `TouchableOpacity` imported separately at the bottom of the import block (lint smell).
- L20-36, L38-50, L52-61 [1] `Section`/`Body`/`Bullet` hard-code `fontSize: 15 … fontWeight: '700' … letterSpacing: -0.2`, `fontSize: 14, lineHeight: 22` instead of `h3`/`caption`; duplicated verbatim in terms-of-service.tsx.
- L81-97 [7] Custom back 36×36, no `hitSlop`.
- L98 [1] Header `fontSize: 18, fontWeight: '800', letterSpacing: -0.3`.
- L103-110 [7] Legal text is a giant `ScrollView` of plain `Text` — no native web view, no anchors, no text selection (`selectable` not set), no large-title header with scroll collapse.
- L269 [7] `Email: support@pawly.app` is plain text, not a `Linking` link.
- L14 [6] `LAST_UPDATED = 'April 16, 2025'` hard-coded.

#### app/(tabs)/profile/terms-of-service.tsx
- L18-53 [1] Same duplicated `Section`/`Body`/`Bullet` with literal sizes 15/14/22.
- L73-89 [7] Custom back 36×36, no `hitSlop`.
- L90 [1] Header `fontSize: 18, fontWeight: '800', letterSpacing: -0.3`.
- L95-102 [7] Plain-Text legal wall (same as privacy); L260 email not linkable.
- L220-236 [1] ALL-CAPS paragraphs — standard for liability clauses, acceptable, but with `fontSize: 14` body they're hard to read.

#### components/progress/MilestoneCard.tsx
- L28 [3] `milestone.emoji` field cast to `AppIconName` — data model still named "emoji".
- L63 [2] `backgroundColor: isLocked ? '#F3F4F6' : …` — **hard-coded light gray; will be a bright block in dark mode.**
- L70-71 [2] `'#FDE68A'` gold border — hard-coded light amber, not a token.
- L73 [2] `opacity: 0.55` for locked — opacity-dimming a whole card.
- L73-77 [4] `alignItems: 'center'` + `textAlign: 'center'` (L116, L130) — centered card by default.
- L90 [2] `color="#B45309"` star.
- L96-107 [1][2][3] "ALMOST THERE" badge above the icon/title: `backgroundColor: '#DCFCE7'` (hard-coded light green, dark-mode break), `paddingVertical: 3`, `marginBottom: 2`, text `fontSize: 10 … fontWeight: '700'` literal caps.
- L113-118 [1] Title `fontSize: 13, fontWeight: '700'`.
- L126-131 [1] Date `fontSize: 11`.
- L137-150 [1][2][6] "TAP TO SHARE" pill: `backgroundColor: '#FEF3C7'`, `color: '#92400E'` (both light-only), `fontSize: 10`, caps, `paddingVertical: 3`, `marginTop: 2` — an instruction rendered as a badge.
- L58-61 [7] Locked/next cards are `TouchableOpacity` with `activeOpacity={1}` and no `onPress` — a pressable that does nothing.
- L198 [2] Grid variant `backgroundColor: isLocked ? '#F9FAFB' : …` — hard-coded light.
- L202 [2] `'#FDE68A'` again.
- L203, L217 [2] Double opacity (card 0.5 × icon 0.4) for locked.
- L222-228 [1] `fontSize: 12, fontWeight: '700'`; L234 `fontSize: 10`.
- L36-39, L172-175 [-] `formatDate` duplicated in both components with different formats (with/without year).

#### components/progress/ShareCard.tsx
- (Whole file) [-] **Unused**: no import of `ShareCard` anywhere in `app/` or `components/`; `react-native-view-shot` flow it documents (L12) isn't wired.
- L41 [2] Off-brand hard-coded gradient `['#2D7D6F', '#1A5C52', '#0F3D36']` (teal, not brand green).
- L37, L44 [8] `borderRadius: 24`, `padding: 32` literals.
- L50-61 [1][2] Dog name `fontSize: 15, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase'`, `color: 'rgba(255,255,255,0.7)'`, `marginBottom: 12`.
- L69-80 [1][4] `fontSize: 26, fontWeight: '800', textAlign: 'center', lineHeight: 32` — 26 off-scale.
- L83-93 [1][2] `fontSize: 14`, `rgba(255,255,255,0.75)`, `marginBottom: 24`.
- L96-104 [1][2][8] `fontSize: 12`, `rgba(255,255,255,0.5)`, `marginBottom: 28`.
- L107-119 [1][2][8] `gap: 6`, `letterSpacing: 1`, `rgba(255,255,255,0.6)`.
- L131-163 [2] Decorative "confetti" dot overlay with ten hard-coded `rgba(255,255,255,…)` positions.

#### components/coach/FormattedCoachMessage.tsx
- L28, L72 [3] **Emoji as semantic icons**: callouts are detected by leading `'💡', '⚠️', '✅', '🐶'` and the emoji is rendered inline as the callout's icon (L137-138 renders `block.content` unmodified).
- L131-133 [2] Callout stripe colors map emoji → `colors.status.warningBorder` / `successBorder` / `brand.secondary` — pastel *border* tokens used as accent stripe colors (low contrast on light bg).
- L136, L231-238 [3] **Left accent stripe** on callouts: `borderLeftWidth: 4`; `borderRadius: 12` (L235) off-scale; `marginVertical: spacing.xs`.
- L163 [3] Numbered-list markers rendered as text `{i + 1}.` in a `width: 22` column (L254) — fine for real sequences, but any 1./2./3. from the model gets numbered markers regardless of whether it's a sequence.
- L222-226 [1] `paragraph fontSize: 15, lineHeight: 22` — 15 off-scale; body is 16.
- L228 [1] `boldText fontWeight: '700'` (Text component maps to Nunito bold — OK) but color hard-pinned to `text.primary` (L229) overriding any `textColor` passed in… actually re-overridden at L199; harmless.
- L240-241 [1] `calloutText fontSize: 14, lineHeight: 20`.
- L246 [8] `marginVertical: 2`; L250 `marginBottom: 6`; L254 `width: 22`.
- L255-258, L262-263 [1] `fontSize: 15, lineHeight: 22, fontWeight: '600'` literals.
- L36, L208 [-] `createStyles()` rebuilt on every render (no args, no memo).
- Missing: no support for links, italics, or code from the model — bold and lists only.

#### components/coach/MessageBubble.tsx
- L55-67 [2][8] User bubble: `borderRadius: 24, borderBottomRightRadius: 8` literals; **green colored glow** `shadowColor: colors.shadow.success, shadowOpacity: 0.18, shadowRadius: 14, elevation: 6`.
- L69-71 [1][2] `color: '#FFFFFF', fontSize: 15, lineHeight: 22`.
- L81-91 [3] Avatar circle 38×38 (`borderRadius: 19`) with `status.successBg` fill — icon-well.
- L37-39, L95-100 [1][6] "Pawly Coach" role label above every assistant bubble: `fontWeight: '700', letterSpacing: 0.2`, `marginBottom: 6` (off-grid).
- L101-109 [2][8] Assistant bubble `borderRadius: 26, borderTopLeftRadius: 10` (both off-scale), `backgroundColor: colors.bg.elevated` (translucent glass) + 1-px `border.soft`.
- L110-114 [-] `assistantText` style is dead (never referenced).
- L17, L49 [-] `createStyles()` rebuilt every render.

#### components/coach/QuickSuggestions.tsx
- L1, L32 [1] Uses raw `RNText` (bypasses the Nunito-mapping `Text` component) — chips render in SF Pro on iOS, the one place in the app not in the brand font.
- L44-47 [8] `height: 108` fixed scroll height; L55 `minHeight: 90`.
- L51 [8] `gap: 12`.
- L53-62 [2][3] `chipOuter`: `width: 220, borderRadius: 22` (off-scale), `shadowColor: isDark ? '#020617' : '#94A3B8'` hard-coded (duplicates `colors.shadow.soft`), `shadowRadius: 16` — floating card.
- L63-66 [5] Press feedback `transform: [{ scale: 0.97 }]` + `opacity: 0.88` — uniform press-scale (same 0.97 as `Button`).
- L67-77 [2][3] `cardInner` **nested inside `chipOuter`** (a shadow wrapper around a bordered card = nested card); `backgroundColor: isDark ? '#1A2436' : '#FFFFFF'`, `borderColor: isDark ? '#243042' : '#E5E7EB'` — palette re-declared by hand instead of `colors.bg.surface`/`colors.border.default`; `borderRadius: 22`; `paddingTop/Bottom: spacing.sm + 4` (=12).
- L78-92 [-][1][2] `iconBadge` and `chipEyebrow` styles are **dead** (never rendered) — and `chipEyebrow` is a hard-coded uppercase eyebrow `fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: isDark ? '#4ADE80' : '#16A34A'`.
- L93-98 [1][2] `chipText fontSize: 15, lineHeight: 21, fontWeight: '600', color: isDark ? '#F1F5F9' : '#111827'` — hard-coded text colors; 15/21 off-scale.
- L25-30 [7] `key={i}` index keys; no `accessibilityRole="button"`.

#### components/coach/TypingIndicator.tsx
- L14-46 [5] Three-dot bounce loop — tied to `isTyping` state (acceptable), properly stopped on unmount. No reduced-motion fallback.
- L51 [2] `colors.primary` legacy alias.
- L73-82 [3] Avatar circle 28×28 (differs from MessageBubble's 38×38 avatar, so the indicator jumps in size vs. the bubble it precedes).
- L87-88 [8] `borderRadius: 18, borderBottomLeftRadius: 4` — a third bubble-radius pair (MessageBubble uses 24/8 and 26/10).
- L91 [8] `paddingVertical: spacing.sm + 4`; L93 `gap: 5`; L96-98 `width: 7, height: 7, borderRadius: 3.5`.
- L99 [2] `colors.textSecondary` legacy alias.
- L86 [2] Bubble uses `bg.surface` while MessageBubble's assistant bubble uses `bg.elevated` — mismatch.

#### components/know/ArticleCard.tsx
- L24 [2] `colors.brand.primary + '40'` hex-alpha concat.
- L29-70 [3] Up to **three pills above the heading** (Featured / category / difficulty) — badges-above-heading; `gap: 8`, `paddingHorizontal: 10, paddingVertical: 4` (L29, L35-36, L49-50, L62-63) off-grid.
- L39 [2] `color: '#B45309'` hard-coded amber text on `status.warningBg` — dark-mode `warningBg` is `#451A03`, so this is unreadable in dark.
- L48 [2] `colors.brand.primary + '14'`.
- L39, L53, L66, L79 [1] `fontWeight` overrides on `micro`/`caption` variants.
- L72 [8] `gap: 6`.
- L19-27 [3] `Pressable` wrapping `Card` — pressed state swaps bg to `surfaceAlt` (fine) but no scale/opacity so it differs from `Button`'s 0.97 scale and QuickSuggestions' 0.97 — three different press feedbacks in one app.

#### components/know/ArticleContentRenderer.tsx
- L16, L48, L82 [1] `lineHeight: 28` / `26` literals on `body` (variant sets 24).
- L36, L40 [8] `gap: 10` ×2.
- L44 [8] `marginTop: 1`; `width: 16`.
- L46 [4] Bullet/checklist markers are text glyphs `'✓'` / `'•'` styled as `bodyStrong` in brand green — glyphs as icons.
- L59-85 [3] Tip/warning/note blocks render as `Card` (`radii.lg`, `padding: spacing.lg`, `shadows.card`) **inside the article `Card`** → nested cards with identical radius; `gap: 6` (L74).
- L78 [1] `fontWeight: '700'` override on `micro` for the callout title.

#### components/profile/FeedbackModal.tsx
- L94, L116-119 [7] `ScrollView` inside a custom `BottomSheet` (custom `Modal`, not `presentation: 'formSheet'` / native sheet); no `maxHeight` so long content + keyboard can exceed the screen.
- L96-114 [4][6] Success state: centered icon circle (`colors.brand.primary + '20'`, L103) + "Thank you!" (L110, exclamation) + "Your feedback helps us make Pawly better for everyone." (L112, marketing) — then auto-closes after 2000ms (L83-85).
- L121, L193 [6] "Send Feedback" heading vs button "Submit Feedback" — two names for one action; "Submit" is the generic verb flagged.
- L124 [6] "Tell us what's working, what's broken, or what you'd like to see." — fine.
- L129-131 [1] "FEEDBACK TYPE" — literal all-caps eyebrow with `fontWeight: '600'`.
- L140 [2] `colors.brand.primary + '10'` hex-alpha concat.
- L135-166 [3] Each option is a bordered card with `radii.md`; selected uses tinted bg + brand border + trailing checkmark — option-card pattern (56pt tall, touch OK).
- L173 [1] `label="MESSAGE (OPTIONAL)"` — second all-caps eyebrow.
- L172-181 [7] Multiline `Input` with no `returnKeyType`; the error message (L184-188) is a plain caption, not attached to the field via `Input`'s `error` prop.
- L87 [6] "Failed to send feedback. Please try again." — OK (specific).
- L69 [6] "Please select a feedback type." — OK.

#### components/notifications/NotificationBell.tsx
- L11 [7] Default `size = 42` → 42×42 button, under 44pt, no `hitSlop`.
- L22 [5] `activeOpacity={0.7}` (vs 0.75/0.8 elsewhere — no single press-opacity value).
- L42-47 [8] Badge `top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 5` — all off-grid.
- L48 [2] Badge is `brand.coach` blue on a green-brand app — unclear why notifications are blue.
- L55-61 [1] `fontSize: 10, fontWeight: '700', lineHeight: 12`.
- Missing [7]: no `accessibilityLabel` announcing unread count.

#### components/notifications/NotificationItem.tsx
- L23, L26 [2] Unread = `bg.elevated` (translucent) + `status.infoBorder` (blue) vs read = `bg.surface` + `border.default` — unread state signalled in blue on a green brand; translucent bg over the warm app bg reads as glass.
- L24 [3] `radii.md` — yet another card radius vs `radii.lg` list cards elsewhere.
- L28 [5] `opacity: pressed ? 0.82 : 1` — fourth distinct press-opacity value.
- L36-44 [8] Unread dot `width: 8, height: 8, borderRadius: 4, marginTop: 4` fine; but `colors.brand.coach` again.
- L51 [2] `opacity: item.isRead ? 0.86 : 1` — dimming text via opacity instead of `text.secondary`.
- L63 [4] Timestamp in `micro` with no color set (defaults to `text.secondary` — OK).
- L65-71 [4][7] "View updated plan" is `micro` bold green text inside the pressable, not a button — text-styled-as-link with no affordance.

#### components/shared/WalkLogModal.tsx
- L37-60 [2] `QUALITY_OPTIONS` hard-code light-only colors: `bg: '#DCFCE7', textColor: '#166534'` (L41, L43), `bg: '#FFF1F2', border: '#FECACA', textColor: '#9F1239'` (L57-59) — **all break in dark mode** (dark `successBg` is `#052E1A`; the rose set has no token at all and is a new hue).
- L109 [6] Placeholder error "Something went wrong. Please try again."
- L116-121 [7] `ScrollView style={{ maxHeight: 560 }}` — magic height inside a custom `BottomSheet`; on small phones with keyboard up the sheet content overflows.
- L145 [1][8] `fontSize: 13 … lineHeight: 18, marginTop: 2`.
- L153-189 [3] Option cards with `radii.md`, `minHeight: 64`, trailing checkmark — option-card pattern (touch target OK).
- L173-179 [1] `fontSize: 16, fontWeight: selected ? '700' : '500'` — weight flips on selection (layout shift in text width).
- L194, L221 [8] `marginBottom: 6` ×2.
- L197-216 [7] Notes `TextInput` re-implements `Input` styles by hand (`fontSize: 14`, `minHeight: 72`, `borderWidth: 1.5`) instead of reusing `Input`; no `returnKeyType`.
- L201, L228 [2] `colors.text.secondary + '80'` hex-alpha concat ×2.
- L222 [6] "How long? — minutes (optional)" — em-dash-joined label.
- L224-241 [7] Duration input `keyboardType="number-pad"` — good; `width: 120` (L239) literal; no `returnKeyType="done"` (number-pad has no return key on iOS, so the user can't dismiss the keyboard without tapping outside).
- L245-255 [1] Error text `fontSize: 13` plain, not attached to a field.
- L259 [6] `'Saving…'` uses the ellipsis glyph while every other screen uses three periods.
- L267-281 [7][1] "Skip logging" is underlined 13pt text with `paddingVertical: spacing.sm` → about 34pt tall, under 44pt; `textDecorationLine: 'underline'` is a web link idiom.

---

#### Cross-file naming inconsistencies

- **The assistant**: "Pawly Coach" (coach/index L290, L332; MessageBubble L38) · "training assistant" (coach L337) · "Behavior support" (coach L337 fallback) · "AI Coach" (delete-account L24) · "AI training coach" (privacy L138) · tab label "Coach" (tabs/_layout L24) · loading copy "your coach" (coach L121).
- **Milestones**: "Milestones" (progress L948, notification-settings L205) · "earned" (milestones L147) · "achieved"/`variant="achieved"` (MilestoneCard) · "milestone achievements" (delete-account L23) · "milestone celebrations" (privacy L248-249) · "unlock" (coach L142) · "badge" only as a code comment (MilestoneCard L93, profile L200).
- **Plan / course**: "training plans" (delete-account L22, terms L125) · "plan day" (notification-settings L156) · "View updated plan" (NotificationItem L70) · "today's plan" (coach L269) — while the color helper lives in `constants/courseColors` (`hexToRgba` imported in progress, profile, delete-account), so the codebase carries both "plan" and "course".
- **Session**: "session" (progress throughout, "Sessions this month", "N Sessions") · "training session" (progress L761) · "coaching thread" (coach L93) · "chat" (coach L92, L97) — chat/thread/conversation used interchangeably for the coach.
- **Library / Know**: tab "Know" (tabs L25, know L86, article L107) · "Library" (know L156, L175; article L119 "Back to library").
- **Casing**: Title Case actions "Send Feedback", "Submit Feedback", "Save Changes", "Edit Dog Profile", "Delete My Account", "Delete Forever", "Privacy Policy", "Bug Report", "Feature Request", "General Feedback" vs sentence case "Sign out", "Save walk", "Start first session", "Share this milestone", "Try again", "Reset chat", "Skip logging", "Back to library". Eyebrows are ALL CAPS in edit-dog, delete-account, FeedbackModal, MilestoneCard, progress hero, coach welcome, ShareCard — but *not* in notification-settings, WalkLogModal ("What happened? (optional)"), or profile.
- **Ellipsis**: "Preparing your coach...", "Deleting account...", "Sending...", "Tell us more..." (three periods) vs "Saving…", "Search breed…" (U+2026).
- **Back icon**: `chevron-back` (article, edit-dog, delete-account, privacy, terms) · `arrow-back` (notification-settings) · text `'←'` (milestones) · `menu-outline` acting as back (coach).
- **Card treatment**: `radii.lg` + 1.5px `border.soft` + `shadows.card` (progress, profile, delete-account, privacy/terms back buttons) · `radii.md` + 1px `border.soft`, no shadow (edit-dog) · `radii.md` + 1px `border.default`, no shadow (notification-settings, NotificationItem) · `radii.lg` + 1px `border.default` + `shadows.card` (`Card` component, ArticleCard) · 22/24/26/28/30 literal radii (coach, QuickSuggestions, MessageBubble).
- **Press feedback**: `activeOpacity` 0.7 / 0.75 / 0.8 / 0.82 / 0.88 and scale 0.97 across `Button`, QuickSuggestions, NotificationItem, ArticleCard (bg swap), MilestoneCard, SettingsRow.
- **Legacy tokens still used**: `colors.primary`, `colors.secondary`, `colors.textSecondary` (milestones.tsx, TypingIndicator.tsx); `variant="title"` (milestones, notification-settings).

#### What's already good (preserve in remediation)

- `components/ui/Text.tsx` maps every `fontWeight` to the correct Nunito face, so the many `fontWeight` literals still render in the brand font — only `QuickSuggestions` (raw `RNText`) escapes this.
- `constants/colors.ts` proxy makes `colors.*` theme-aware at read time; the app is dark-mode-ready everywhere tokens are used. The dark-mode breaks are confined to the literal hexes listed above (MilestoneCard, WalkLogModal, ArticleCard `#B45309`, coach online dot, QuickSuggestions' duplicated palette).
- Progress screen: real `SkeletonBlock` skeleton on first load (L65-78), pull-to-refresh, per-chart `EmptyState`s (L189-196, L291-298), sensible new-user branch (`isNewUser`), `adjustsFontSizeToFit` on the long dog-name title, `contentContainerStyle paddingBottom: spacing.xxl * 2` clearing the floating tab bar.
- Know: error state with retry, no-results state, `hasOnlyFeaturedResult` edge case, pull-to-refresh on both list and article.
- Coach: `keyboardDismissMode="interactive"`, `keyboardShouldPersistTaps="handled"`, `returnKeyType="send"`, `maxLength`, disabled send while typing, specific rate-limit banner, destructive-styled reset confirm via native `Alert`, tab bar hidden on the chat route so the composer sits at the bottom.
- `TypingIndicator` loop is state-bound and cleaned up on unmount; `BottomSheet` animates scrim and panel separately with cubic easing (well-reasoned motion) and pads the home-indicator inset.
- `notification-settings` back button is a proper 44×44; `edit-dog` back uses `hitSlop`.
- `delete-account` requires a typed confirmation plus a native destructive `Alert`, explains what is deleted, and uses `autoCapitalize="none" autoCorrect={false}`.
- `WalkLogModal` uses `keyboardType="number-pad"` with digit-only sanitisation, `Keyboard.dismiss()` before saving, and resets state on close/skip.
- `FeedbackModal` dismisses the keyboard before submit and disables the sheet close while submitting.
- Legal screens are written in the app's own voice (specific to Pawly's data flows) rather than boilerplate, and correctly use a stack push rather than a modal.
- `SectionHeader`, `EmptyState`, `ProgressBar`, `Card`, `Input`, `Button` exist as shared primitives — most findings above are places that *bypass* them (edit-dog breed input, WalkLogModal inputs, milestones progress bar) rather than missing primitives.
---

## Appendix D — UI primitives, adaptive/video components, tab bar, and the token system itself

I have everything I need. Here is the full audit.

#### Pawly UI audit — statistical tells of AI-generated UI

Scope: 17 `components/ui/*`, 5 `components/adaptive/*`, 2 `components/video/*`, `app/(tabs)/_layout.tsx`, `app/_layout.tsx`, NativeWind config, and the token system in `constants/*`. Read-only; nothing was modified. Tell numbers map to the 8 categories in the brief.

#### Cross-cutting facts (verified by grep)

- **Two styling systems**: only **2 of 95** `.tsx` files in `app/` + `components/` use `className=` (`components/ui/SafeScreen.tsx`, `components/ui/LoadingSpinner.tsx`); **82 of 95** use inline `style={}`. Exactly **1 file mixes both** (`SafeScreen.tsx` L14: `className="flex-1" style={[{ backgroundColor: colors.bg.app }, style]}`). NativeWind + Tailwind + `global.css` + `tailwind.config.js` (with its own duplicate `pawly.*` hex palette, incl. `appBg: '#FFF9F4'` which disagrees with `colors.bg.app = '#F7F2EC'`) exist to serve two utility classes. That is dead infrastructure, not a design system.
- **`@expo-google-fonts/plus-jakarta-sans`** is in `package.json` L16 but `grep PlusJakarta|plus-jakarta` across `app/`, `components/`, `constants/`, `lib/`, `hooks/`, `stores/`, `app.json`, `babel.config.js` returns **zero hits**. Unused dependency.
- **Reduced motion**: `grep isReduceMotionEnabled|useReducedMotion|reduceMotion` across `app/ components/ lib/ hooks/` → **zero hits**. No reduced-motion handling anywhere. Confirmed.
- **Decorative loops** across the app: 16 sites (`Animated.loop` / `withRepeat`): `app/_layout.tsx` BouncingDot, `SkeletonBlock`, `TypingIndicator`, `VideoUploadProgress` (2), `TrainingToolCard` pulse, `progress/index.tsx:588`, `add-course.tsx:365`, `welcome.tsx:89`, `dog-photo.tsx` (4), `plan-preview.tsx:66`, `dog-basics.tsx` (2).
- **Reanimated `entering=`** entrance animations: **23** sites.
- **Literal colors**: **116 hex literals in 38 files** and **65 `rgba(` literals** in `app/` + `components/` bypassing `constants/colors.ts`.
- **Hard-coded `fontSize: N`**: **291** occurrences; `letterSpacing`: **74**; `textTransform: 'uppercase'` / `.toUpperCase()`: **23**.
- **Legacy alias usage** (should be zero if the new tokens were real): `colors.textPrimary` 59, `colors.textSecondary` 75, `colors.primary` 46, `colors.surface` 27, `colors.background` 11, `colors.secondary` 6, `colors.accent` 1, `colors.borderColor` 1. `success_old`/`warning_old`/`error_old`/`borderLegacy`: **0 usages** (pure dead tokens).
- **"→" in user-facing text**: `AdaptationNotice` "See why →", `plan.tsx:331` "Full explanation →", `plan-preview.tsx:587/590` "Start my first session →" / "Unlock full plan →", `dog-basics.tsx:1039/1277` "Let's get started →" / "Build my plan →", `progress/index.tsx:390` `arrow: '→'`.

---

#### constants/colors.ts
- L4–8 [2] Three brand accents (green/amber/blue) — `primary: '#22C55E', secondary: '#F59E0B', coach: '#3B82F6'`. Combined with `courseColors.ts` this is 3 + 10 + 19 ≈ **32 accent hues** in one app.
- L16–18 [2] Glass/translucent surface tokens — `elevated: 'rgba(255,255,255,0.88)'`, `elevatedMuted`, `glass: 'rgba(255,255,255,0.66)'`. `bg.glass` is used once app-wide; `bg.elevated` 7×.
- L40–42 [2] Gradient-as-decoration token — `gradient: { app: ['#F7F2EC', '#F2EDE6', '#EEF6F1'] }`; used 5× (PrepLoadingScreen etc.).
- L50–54 [2] Colored shadow tokens — `shadow: { soft: '#94A3B8', strong: '#0F172A', success: '#15803D' }`. `shadow.success` = green glow, used 4×.
- L55–69 [token] Legacy alias block duplicates every semantic token: `success`/`primary`/`success_old` are all `'#22C55E'`; `textPrimary` = `text.primary`; `background` = `bg.app`; `borderColor` = `borderLegacy` = `border.default`. `secondary: '#F5F7F9'` (a surface gray) vs `brand.secondary: '#F59E0B'` (amber) — **the same word means two different things**.
- L67 [token] `surface: '#FFFFFF'` disagrees with `bg.surface: '#FFFDF9'` — two "surface" whites.
- L56 vs L6 [token] `warning: '#FBBF24'` vs `brand.secondary/accent: '#F59E0B'` — two ambers.
- L72–137 [2] Dark palette is tinted near-black, not a surface system: `app '#0B1220'`, `surface '#121A29'`, `surfaceAlt '#1A2436'`, `sand '#18212F'` are four navy tints with no elevation semantics; `text.inverse '#08111D'`; shadows collapse to `'#020617'` for both soft/strong.
- L110–116 [2] Mascot palette (`fur '#F6B66E'`, `furDark`, `earInner`, `nose '#3A3A3A'`) duplicated verbatim across light/dark rather than shared.
- L186–196 [token] Proxy-of-Proxy accessor plus a special-case for `borderColor` — the shim is what lets the legacy aliases live forever.

#### constants/typography.ts
- L9–16 [1] Named scale defines only `fontSize` + `fontFamily`; **no `lineHeight`, no `letterSpacing`** in the token — line heights are hard-coded in `Text.tsx` L56–64 instead, so any file that spreads `typography.body` directly (e.g. `Input.tsx` L100) gets no line height.
- L19–32 [1] Legacy `sizes`/`weights` tables kept "for backward compat"; `weights` returns numeric strings that on iOS revert to SF Pro unless `Text.tsx`'s remapping runs (comment in `Text.tsx` L26 admits this).
- L9–11 [1] `display 32 / h1 28 / h2 22 / h3 18` — arbitrary steps (+10, +6, +4), not a ratio scale; `sizes.lg: 20` and `sizes.xl: 24` don't appear in the named scale at all.

#### constants/spacing.ts
- L1–8 Clean 4-pt scale (4/8/16/24/32/48). Good — but the 291 `fontSize` literals and dozens of `paddingVertical: 3/5/6/7` literals (see below) show it isn't enforced.

#### constants/radii.ts
- L1–6 [3] Only `sm 8 / md 16 / lg 24 / pill 999`. Components then invent `28` (BottomSheet), `20` (Button sm), `14` (ExpertReviewRequest), `12` (SkeletonBlock, VideoUploadProgress), `18/4` (TypingIndicator) — the token set is too coarse so every file rolls its own.

#### constants/shadows.ts
- L4–31 [3] Three neutral shadows; L42–61 `tintedShadow(hex)` factory produces **colored glows on demand** — used 13× app-wide. L65–66 `softShadows` re-tints the same shadow warm-slate. Together with `colors.shadow.success` there are three parallel shadow systems.
- L6 [2] `shadowColor: '#000'` literal while `colors.shadow.*` tokens exist.

#### constants/courseColors.ts
- L10–21 [2] 10-color course palette incl. `'#7C3AED' // Violet` and `'#4F46E5' // Indigo`.
- L23–44 [2] 19 `GOAL_COLORS` incl. violet `#7C3AED` (×2: crate_anxiety, wait_and_stay), indigo `#4F46E5`, purple `#9333EA`; `#DC2626` and `#2563EB` duplicate the course palette; `#15803D` duplicates `colors.shadow.success`.
- L149–169 [bug] `getContrastTextColor` computes `whiteContrast` and `darkContrast` then **unconditionally `return '#FFFFFF'`** — dead math; white text will be placed on `#EAB308` (yellow, ~1.6:1) and `#06B6D4` (cyan).
- L205–207 [2] `backgroundColor: '#F5F7F9'`, `textColor: '#111827'` literals inside a "token" file (should be `colors.bg.surfaceAlt` / `colors.text.primary`; also breaks dark mode).
- L178–185 [2] Eight alpha tints per color (`0.08/0.14/0.2/0.16/0.34/0.9`) generated at runtime — 10 hues × 8 tints = 80 more colors.

#### components/ui/Text.tsx
- L28–36 [1] Font family map hard-codes `'Nunito_*'` strings again instead of importing from `typography.ts` L1–5.
- L56–64 [1] `lineHeight: 40/36/30/26/24/24/20/18` hard-coded per variant (belongs in the typography token).
- L16, L64 [token] `'title'` alias duplicates `h2`.
- Works well: L38–44 weight→family remap prevents SF Pro fallback on iOS.

#### components/ui/Button.tsx
- L32–34 [3] Every size is a **pill** (`radii.pill` ×2, `borderRadius: 20`); `sm` `paddingHorizontal: spacing.sm + 4` = 12 (literal math).
- L57, L81 [2] `textColor: '#FFFFFF'` literal instead of `colors.text.inverse`. **White on `#22C55E` = 2.28:1, fails WCAG AA (4.5:1) and even AA-large (3:1).** Same for `reward` white on `#F59E0B` (≈2.2:1).
- L60–71 [3] `secondary` and `outline` variants are **byte-identical** objects.
- L87–103 [5] Uniform spring press-scale (`toValue: 0.97`, `speed: 50`) applied to **every** button in the app, ghost links included; no reduced-motion gate.
- L120 [7] Disabled state is `opacity: 0.5` only — no color/border change; on a 2.28:1 primary this drops to ~1.5:1.
- L132 [8] `gap: 8` literal (should be `spacing.sm`).
- L134–137 [1] Passes `variant="bodyStrong"` (600) then overrides with `fontWeight: '700'` — the variant is meaningless.
- Works well: `loading` swaps to `ActivityIndicator` and disables; icon slots are typed to Ionicons names.

#### components/ui/Card.tsx
- L28 [3] Uniform `borderRadius: radii.lg` (24) on every card.
- L29–30 [3] Same shadow (`shadows.card`) under every default card **plus** a 1-px border — belt-and-braces surface treatment; `elevated` uses `shadows.modal` (24-px blur) for an inline card.
- Works well: small, tokenised, no literals.

#### components/ui/EmptyState.tsx
- L36, L51–52, L59 [4] `alignItems: 'center'` ×2, `textAlign: 'center'` ×2 — **centered by default**.
- L44 [3] Mascot (`size={100}`) is the default hero when `mascotState` is supplied; L47 icon fallback `size={52}` literal.
- L51 [8] `gap: 8` literal; L46 `minHeight: 64` literal.
- L59 [1] `lineHeight: 24` re-declared although `body` variant already sets 24.
- L73 [8] `minWidth: 160` literal.

#### components/ui/PillTag.tsx
- L16–21 [2] **Five hard-coded hex pairs** (`'#F5F7F9'/'#6B7280'`, `'#DCFCE7'/'#15803D'`, `'#FEF3C7'/'#B45309'`, `'#DBEAFE'/'#1D4ED8'`, `'#E5E7EB'/'#6B7280'`) — bypasses `colors.status.*` and **breaks dark mode** (pale pills on `#121A29`).
- L25–26 [8] `paddingV: 4 / 6`, `paddingH: 10 / 12` — 6 and 10 are off the 4-pt grid.
- L37 [3] `radii.pill` — one more pill.
- L46 [1] `fontWeight: '600'` override on a variant.

#### components/ui/SectionHeader.tsx
- L26–29 [1] Bypasses `Text` variants entirely: `fontSize: 20, fontWeight: '800', letterSpacing: -0.3` — 20 is not in the named scale, and negative tracking on a rounded humanist font (Nunito) is a Tailwind-landing-page tell.
- L36 [1] `fontWeight: '700'` override on `caption`.
- L35 [7] `hitSlop={8}` on a 20-px-tall text link → ~36-pt target, under 44.

#### components/ui/SafeScreen.tsx
- L14 [mixed] `className="flex-1"` **and** `style={[{ backgroundColor: colors.bg.app }, style]}` — the one file mixing NativeWind with inline style; the class could be `{ flex: 1 }`.

#### components/ui/IconButton.tsx
- L23 [7] Default `hitSlop = 4` — fine for the default 44-pt `size`, but nothing prevents `size={32}` callers (grep shows several) from shipping a 40-pt target.
- L49 [3] `borderRadius: size / 2` — always a circle.
- L52 [5] Press feedback is `opacity: 0.7` here vs spring-scale in `Button` — two different press affordances in the same kit.

#### components/ui/StreakBadge.tsx
- L23, L29, L32 [2] `'#FEF3C7'`, `'#92400E'` ×2 literals (there is `colors.status.warningBg`); breaks dark mode.
- L22, L25–26 [8] `gap: 3`, `paddingHorizontal: 8/10`, `paddingVertical: 3/5` — 3, 5, 10 off-grid.
- L24 [3] Pill + flame icon = the canonical gamification badge.
- L33 [1] `fontWeight: '700'` override.

#### components/ui/SkeletonBlock.tsx
- L13 [3] `borderRadius = 12` default literal (not a `radii` token).
- L17–22 [5] Infinite opacity pulse loop (`0.4 ↔ 1`, 700 ms) with no reduced-motion check.

#### components/ui/LoadingSpinner.tsx
- L7 [mixed] `className="flex-1 items-center justify-center"` — one of two NativeWind usages in the app.
- L8 [token] `colors.primary` legacy alias instead of `colors.brand.primary`.

#### components/ui/Input.tsx
- L77 [7] Placeholder = `colors.text.secondary + '80'` → `#6B7280` at 50 % on `#F5F7F9` ≈ **2.0:1 contrast**, fails AA. Also string-concatenating alpha onto a hex token is fragile (breaks if a token is ever `rgba`).
- L98 [7] Fixed `height: 52` (not on 4-pt grid, not a token); L96 `paddingHorizontal: 16`, L97 `paddingVertical: 12`, L67 `gap: 6` literals.
- L100–101 [1/bug] Spreads `typography.body.fontSize` and `typography.body.fontWeight` — **`fontWeight` does not exist on the token** (only `fontSize`/`fontFamily`), and `fontFamily` is never applied, so **every TextInput renders in the system font, not Nunito**.
- L69 [1] `fontWeight: '600'` override on `micro` label.
- L46, L80 [7] `keyboardType` is passed through untouched — no defaults per field (e.g. `email-address`, `autoComplete`, `textContentType`); no `autoCorrect` control.
- L94 [8] `borderWidth: 1.5` (also in Button) — half-pixel borders.
- Works well: focus ring via `brand.primary`, error state via `colors.error`, `multiline` min-height math.

#### components/ui/AppIcon.tsx
- L13 [1] `size = 20` default; otherwise clean. Ionicons as the only icon set is fine.

#### components/ui/ProgressBar.tsx
- L18 [8] `height = 6` default (off-grid); L49, L59 pill radius.
- L26–37 [5] 500 ms width tween on every progress change with `useNativeDriver: false` (JS-driven layout animation); no reduced-motion gate.
- Works well: clamps progress, tokenised colors.

#### components/ui/BottomSheet.tsx
- L65 [7] **Custom `Modal` + `Animated.timing`**, not a native `presentationStyle="formSheet"/"pageSheet"` or `@gorhom/bottom-sheet` — no drag-to-dismiss, no snap points, no native detents, no interactive dismiss; `onRequestClose` covers Android back only.
- L67 [2] Scrim `'rgba(15,23,42,0.5)'` literal.
- L71–76 [7] Keyboard handled via `KeyboardAvoidingView` **only when `avoidKeyboard` is opted in** (default `false`); `behavior="padding"` on iOS wrapped around an absolutely-positioned panel is the classic jittery combo.
- L84–85 [3] `borderTopLeftRadius: 28` — not a radii token (largest is 24).
- L93–101 [3] 40×4 grabber handle drawn even though nothing is draggable — a decorative affordance.
- L61 [8] `panelHeight || 600` magic fallback.
- L34–55 [5] Mount animation (260 ms out-cubic) on every open; no reduced-motion gate.
- Works well: scrim fades while panel slides (comment L24–26 explains why); safe-area bottom padding L89.

#### components/ui/MascotCallout.tsx
- L43–45 [2] `ink '#2B2523'`, `eyeCol '#1F2937'`, `blush '#F59A9A'` literals; L93 `'#F472B6'` (pink), **L95 `'#A78BFA'` (lavender/purple confetti)**, L160–161 `'#F26D6D'`/`'#DC4C4C'`, L167 `'#000'`, `"white"` ×9.
- L189–198 [5] Spring scale-in from 0.8 **on every mount** (`friction: 6, tension: 80`) — the mascot pops in wherever it appears (EmptyState, PrepLoadingScreen, etc.); no reduced-motion gate.
- L201 [4/8] `alignItems: 'center'`, `gap: 8` literal; L212–213 `paddingHorizontal: 14, paddingVertical: 8` (14 off-grid); L217 `textAlign: 'center'`.
- L89–97 [3] Confetti/sparkle state = celebration emoji-equivalent.
- Works well: mascot colors come from `colors.mascot.*`, viewBox geometry is parameterised, no wag/bounce loop (only the mount spring).

#### components/ui/IllustrationPanel.tsx
- L34–35, L64–65, L89–90, L120–121, L159–160 [2] Eye fill `"#111827"` literal ×10 (should be `colors.text.primary` or a mascot token); L39, L69, L93, L124, L163 nose `"#3A3A3A"` ×5 while `colors.mascot.nose` exists with that exact value; `"white"` ×10.
- L190 [4] `alignItems: 'center'` default wrapper.
- L45–46, L95–99, L126–135, L152, L170, L174–175 [2] Brand green (`colors.brand.primary`) used as illustration accent for paw prints, hand, arrows, leash — brand color as decoration.
- Works well: fur/ground colors are tokenised; illustrations are lightweight SVG, not PNG.

#### components/adaptive/AdaptationNotice.tsx
- L97 [1] **Eyebrow label**: `fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase'` — the single most recognisable AI-UI tell; 11 is not on the scale.
- L102, L106, L123 [1] `fontSize: 15`, `fontSize: 13, lineHeight: 19`, `fontSize: 13` — three off-scale sizes in one 40-line component.
- L118–121 [2] Alpha-suffix hex hacks `${colors.brand.coach}22 / 14 / 30` — three ad-hoc tints.
- L124 [4] `See why →` — arrow in text.
- L116 [8] `paddingVertical: 7`.
- L87–90 [3] Tinted info card with border + pill CTA + sparkles icon.
- L96 [3] `sparkles` icon for "AI did a thing".

#### components/adaptive/LearningInsightCard.tsx
- L74, L78 [2] `'#F4FBF6'`, `'#C6E9D4'` — ad-hoc mint tint + border literals (there is `status.successBg/successBorder`); breaks dark mode.
- L85, L90, L114 [1] `fontSize: 15`, `12 / lineHeight 18`, `14 / lineHeight 21` — off-scale, no variants used.
- L104–113 [3] 6-px green dot bullets (`width: 6, height: 6, borderRadius: 3, marginTop: 6`) — bullet-dot list pattern.
- L84 [3] `analytics` icon + "What Pawly is learning about {dog}" header.
- L57 [copy] `.replace('indoors', 'indoors').replace('outdoors', 'outdoors')` — no-op replacements (vestigial code).

#### components/adaptive/PlanReasonCard.tsx
- L44–45 [5] `entering={FadeInDown.delay(delay).duration(400)}` mount animation; no reduced-motion gate.
- L47, L51, L86 [2] `${colors.brand.primary}08 / 28 / 18` alpha-suffix tints — green-tinted card with green border with green divider.
- L56 [3] `sparkles` icon again; L57 `fontSize: 15, fontWeight: '700'`; L74 `fontSize: 13, lineHeight: 19`; L93 `fontSize: 12`.
- L95 [4] `"  ·  ${profileCaption}"` — the `A · B · C` meta string (prop doc L22: `"9 months old · Apartment · 3×/week"`).
- L73 [token] Mixes `colors.success` (legacy) and `colors.brand.primary` (new) for the same green.

#### components/adaptive/SessionChangeBadge.tsx
- L34 [2] **Purple badge**: `bg: '#F3E8FF', fg: '#7C3AED'` literals (violet).
- L29–33 [2] Five alpha-suffix tints (`14/14/12/14/16`) — inconsistent alpha per row.
- L50 [1] `fontSize: 10` — smallest text in the app, below the 12-pt `micro` token; bold 10-pt colored on tint = low legibility.
- L46–47 [8] `paddingVertical: 3`.
- L41–48 [3] Pill badge.

#### components/adaptive/WhyThisChangedSheet.tsx
- L150–151 [1] Eyebrow: `fontSize: 11, fontWeight: '700', letterSpacing: 0.5` + `.toUpperCase()`.
- L154, L160, L163, L179, L183, L202, L206 [1] `fontSize: 11 / 20 (lineHeight 28) / 14 (22) / 13 / 13 (20) / 13 / 13 (20)` — seven inline type specs, no `Text` variant used once.
- L144, L191, L196 [2] `${colors.brand.coach}14`, `${colors.success}10`, `${colors.success}25` alpha hacks.
- L168–209 [3] Two stacked tinted "info cards" each with icon+bold-title+body — the tinted-callout-stack pattern.
- L128–132 [7] `ScrollView` inside a non-draggable custom sheet with `flexGrow: 0` and no `maxHeight` — tall content can push the footer off-screen on small devices.
- L224 [6] `Got it` CTA.
- Works well: L218 safe-area-aware fixed footer; copy in `whyChangedDetail` is specific and trainer-toned.

#### components/video/ExpertReviewRequest.tsx
- L65, L68, L82, L104, L113, L143 [token] Uses **only legacy aliases** (`colors.textPrimary`, `colors.textSecondary`, `colors.primary`, `colors.secondary`, `colors.error`) — none of the new `text.*`/`brand.*` tokens.
- L91 [token] `backgroundColor: colors.secondary` — here "secondary" is the gray surface `#F5F7F9`; two lines earlier the file's Button `reward` variant would treat `brand.secondary` as amber. Live example of the ambiguous token.
- L92 [3] `borderRadius: 14` literal (not a radii token).
- L28 [6] `'48-hour turnaround guaranteed'` — a legal-ish promise hard-coded in a component.
- L53–54 [6] `'Something went wrong'` placeholder error fallback → `Alert.alert`.
- L134–135 [6] `Alert.alert('Coming soon', 'Purchase credits coming in a future update.')` — shipped placeholder flow behind a live CTA, with a `// TODO` at L133.
- L124 [6] `'Requesting…'` label swap instead of `Button`'s own `loading` prop (L127 sets `disabled`, not `loading`).
- L141 [4] Cancel link `alignItems: 'center'`.
- L26–31 [3] Icon + text "what's included" checklist rows.

#### components/video/VideoUploadProgress.tsx
- L27–37 [5] Two infinite loops on mount: 360° rotation (1.8 s linear) **and** 1.0→1.12 scale pulse (900 ms) on a cloud icon in a tinted circle — decorative; no reduced-motion gate; effect deps `[]` never cancel.
- L56 [2] `'rgba(0,0,0,0.75)'` scrim literal (BottomSheet uses a different `rgba(15,23,42,0.5)` scrim — two scrims).
- L64, L91, L100, L108, L115, L118, L136 [token] Legacy aliases throughout (`colors.surface`, `colors.textPrimary`, `colors.secondary`, `colors.primary`, `colors.textSecondary`).
- L80, L127 [2] `${colors.primary}15`, `${colors.warning}15` alpha hacks.
- L65, L79, L101, L109, L128 [3] `borderRadius: 24 / 40 / 4 / 4 / 12` — three non-token radii in one modal.
- L77–78 [3] 80×80 tinted icon circle — the "icon-in-a-soft-circle" hero.
- L91 [4] `textAlign: 'center'`; L69 `alignItems: 'center'`.
- L96–113 [3] Re-implements a progress bar inline instead of using `ProgressBar.tsx`.
- L48–49 [6] Fake ETA: `Math.round(((100 - percent) / 100) * 15)` — "~Ns remaining" invented from a 15-second assumption, not measured throughput; L49 `'Finishing up…'`.
- L118 [1] `fontWeight: '600'` override on `caption`.

#### app/(tabs)/_layout.tsx (custom floating pill tab bar)
- L38–61 [7] **Floating pill tab bar** (`position: 'absolute'`, `radii.pill`, `shadows.float`, `padding: 5`) instead of native `BottomTabBar`. Because the outer `View` is absolutely positioned and `tabBarStyle` isn't declared absolute in `screenOptions`, React Navigation measures a 0-height tab bar → **content is not inset automatically**; each tab screen compensates manually with `paddingBottom: spacing.xxl * 2` (`know:81`, `progress:673`, `profile:164`) or `spacing.xxl * 2 + spacing.lg` (`train:529`) — inconsistent, and `useBottomTabBarHeight` is used nowhere (grep = 0).
- L45–46 [8] `paddingBottom: Math.max(insets.bottom, 8) + 4`, `paddingTop: 8` literals; L58 `padding: 5`, L106 `gap: 3`.
- L99–120 [7] **Touch target**: `paddingVertical 8 + icon 22 + gap 3 + lineHeight 14 + 8 = 55 pt tall`; width ≈ `(390 − 32 − 10) / 5 ≈ 70 pt` on an iPhone 15 → passes 44 pt. Total bar footprint ≈ 8 + 55 + 10 + max(inset,8)+4 ≈ **111 pt** on a notched device, stealing more space than a native 83-pt bar.
- L113–117 [1] Label: `fontSize: 10, lineHeight: 14`, `fontWeight` toggles `'700'/'500'` — **10-pt label** on the `micro` (12) variant; below Apple's 10-pt tab label default only if bold, and 10 is not on the scale.
- L103 [2] `'rgba(74,222,128,0.18)'` literal dark-mode active tint instead of `colors.status.successBg` dark value.
- L34–36 [7] Tab bar returns `null` on the `coach` tab — navigation disappears entirely on one tab; users must use a back affordance.
- L92–94 [7] Good: `accessibilityRole="button"`, `accessibilityState.selected`; L83 long-press forwarded.
- Not present: no `tabBarShowLabel`, no haptics on tab press, no badge support.

#### app/_layout.tsx (PrepLoadingScreen)
- L31–69 [5] `BouncingDot` ×3 — infinite `Animated.loop` bounce (`−8 px`, 400/400 ms + 600 ms rest) staggered 0/150/300 ms; identical to `TypingIndicator`'s loop (dup logic). No reduced-motion gate.
- L75–90 [5] Fade + 24-px slide-up on mount (600 ms).
- L92–95 [2] Full-screen `LinearGradient` from `colors.gradient.app` — gradient as decoration behind a loading state.
- L107 [3] `MascotCallout state="thinking" size={110}` + L109–111 `h2` with `fontWeight: '700'` override (h2 token is already bold) + `textAlign: 'center'`.
- L102, L107, L119 [8] `paddingHorizontal: 40`, `marginBottom: 36`, `marginBottom: 32/8` literals (40 and 36 off the scale).
- L119 [2] `opacity: 0.65` on caption text — alpha instead of the `text.secondary` token.
- L59–64 [8] `width: 7, height: 7, borderRadius: 4, marginHorizontal: 4`.
- L303–304, L310–311 [6] Copy: `"Building ${dogName}'s plan…"` / `"Crafting a training programme tailored just for them."` / `"Preparing things for you"` / `"Just a moment while we get everything ready."` — generic AI-loading filler ("crafting", "tailored just for them"); mixes UK "programme" with US spelling elsewhere.
- L330 [7] `if (!fontsLoaded) return null;` — blank frame instead of keeping the splash screen up (`SplashScreen.preventAutoHideAsync` not used).

#### global.css / tailwind.config.js / NativeWind
- `global.css` L1–3 — the three `@tailwind` directives, nothing else.
- `tailwind.config.js` L7–22 [token] A **third palette** (`pawly.*`) hard-codes 13 hex values that partially disagree with `constants/colors.ts` (`appBg '#FFF9F4'` vs `bg.app '#F7F2EC'`; `surface '#FFFFFF'` vs `'#FFFDF9'`), has no dark values, and is referenced by zero `className`s (the two usages are `flex-1`/`items-center`/`justify-center` only).
- Verdict: NativeWind is installed (`nativewind 4.1.23`, `tailwindcss ^3.4.17`, `global.css` import at `app/_layout.tsx:1`, Babel/Metro plumbing) for **two layout utility classes in two files**. Two styling systems for zero benefit.

---

#### Token system verdict

**Keep**
- `colors.brand.{primary, coach}`, `colors.bg.{app, surface, surfaceAlt, sand}`, `colors.text.{primary, secondary, inverse}`, `colors.border.{default, soft, strong}`, `colors.status.*` (this is the right shape for light/dark), `colors.mascot.*` (hoist to a single shared object, not per-scheme).
- `spacing` (4-pt scale, correct).
- `typography` named scale — but add `lineHeight` (and optionally `letterSpacing: 0`) to each entry and move `Text.tsx` L56–64 into it; delete `sizes`/`weights`.
- `shadows.card` + one of `float`/`modal`. Keep `Text.tsx`'s weight→family remap.

**Delete / merge**
- Legacy flat aliases in `colors.ts` L55–69 / L122–136 (`success`, `warning`, `error`, `primary`, `secondary`, `accent`, `*_old`, `textPrimary`, `textSecondary`, `background`, `surface`, `borderColor`, `borderLegacy`) and the `borderColor` Proxy special-case at L186–196. Migrate the ~225 legacy call sites (`textPrimary` 59, `textSecondary` 75, `primary` 46, `surface` 27, `background` 11, `secondary` 6, `accent` 1, `borderColor` 1); `*_old`/`borderLegacy` have 0 usages and can go today. Keep semantic `error`/`warning` only if re-homed under `brand`/`status`.
- Resolve the `secondary` collision: `brand.secondary` (amber) vs top-level `secondary` (gray surface) — one must be renamed before any migration.
- `colors.shadow.success` (green glow, 4 uses), `tintedShadow()` and `softShadows` (13 uses) → collapse to one neutral shadow set; colored glows are the tell.
- `colors.bg.{elevated, elevatedMuted, glass}` (glass surfaces; `glass` has 1 use, `elevated` 7) and `colors.gradient.app` (5 uses) — replace with flat `bg.surface`/`bg.app`.
- `COURSE_COLOR_PALETTE` (10) + `GOAL_COLORS` (19) → at most 5–6 hues drawn from the existing brand/status set; drop violet `#7C3AED`, indigo `#4F46E5`, purple `#9333EA`, and the duplicates of brand blue/red/green. Fix `getContrastTextColor` (L168 always returns white) or delete it. Move the `'#F5F7F9'`/`'#111827'` literals at L205–207 to tokens.
- `SessionChangeBadge` purple (`#F3E8FF`/`#7C3AED`), `MascotCallout` lavender confetti `#A78BFA`, `PillTag`'s five hex pairs, `StreakBadge` amber pair, `LearningInsightCard` mint pair → `colors.status.*`.
- Alpha-suffix hacks (`${colors.x}14` etc.) → either a `withAlpha(token, a)` helper that survives `rgba` tokens, or dedicated `status.*Bg` tokens.
- `radii`: add `xs: 4` and `xl: 28` (or decide 28 isn't allowed) so `BottomSheet 28`, `Button sm 20`, `ExpertReviewRequest 14`, `Skeleton 12`, `VideoUploadProgress 12/24/40/4` stop inventing values.
- Dark palette: either define real elevation steps (`surface0/1/2` with defined overlays) or drop the four near-identical navy tints to two.
- `tailwind.config.js` palette, `global.css`, NativeWind, `tailwindcss`, and the `className` in `SafeScreen`/`LoadingSpinner` — remove the second styling system.
- `@expo-google-fonts/plus-jakarta-sans` — unused, remove from `package.json`.

#### What's already good

- `constants/colors.ts` has the right *shape* (`brand/bg/text/border/status`) with a true light/dark pair, and `lib/theme.ts` + the Proxy keep every component theme-aware without prop drilling.
- `Text.tsx` guarantees Nunito on iOS by remapping `fontWeight` → `fontFamily`; the variant API is sane.
- `spacing.ts` is a clean 4-pt scale and most component-level padding uses it.
- `BottomSheet.tsx` separates scrim fade from panel slide (with a comment explaining why), pads the home indicator, and `WhyThisChangedSheet` keeps a fixed footer above the inset.
- Tab bar exposes `accessibilityRole`/`accessibilityState` and forwards `tabPress`/`tabLongPress` correctly; touch targets compute to ≥44 pt.
- `Button` has real `loading` handling; `Input` has focus/error borders and a multiline min-height rule.
- `ProgressBar` clamps input; `SkeletonBlock`/`TypingIndicator`/`BouncingDot` all stop their loops on unmount.
- Mascot and behaviour illustrations are parameterised SVG using `colors.mascot.*` (not baked PNGs), and `MascotCallout` has no idle wag/bounce loop — only a mount spring.
- Copy in `WhyThisChangedSheet.whyChangedDetail` and `AdaptationNotice.adaptationBody` is specific, trainer-voiced, and avoids exclamation marks (grep found none in the audited files).
- Tab screens do compensate for the floating bar with bottom padding, even if inconsistently.
---

## Phase 2 result

Remediation landed on `feat/session-flow-overhaul` in 23 commits. The checklist re-run, verification, before/after screenshots and the list of deliberate functionality changes are in `DESIGN-REVIEW.md`; the system itself is in `DESIGN.md`. Headline counts after remediation over `app/` + `components/`: 0 hex/rgba literals, 0 font-size literals, 0 letter-spacing, 0 uppercase transforms, 0 gradients, 0 glass, 0 shadow keys in screens, 0 entrance animations, 0 emoji or glyph icons, 0 legacy tokens, 0 "Something went wrong"; 2 spacing literals (both `2`, inside `ListRow`).
