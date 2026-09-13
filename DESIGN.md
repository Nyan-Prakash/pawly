# Pawly design system

This file is the source of truth. The tokens in `constants/` implement it. If a screen needs a value that is not here, the answer is to change the screen, not to add a value.

## What Pawly is, and what that decides

Pawly is a daily dog-training companion. The owner opens it for a few minutes a day, usually standing up, often with a leash in one hand and a phone in the other, and does one short session with their dog. The job of the interface is to get them to today's session, keep them calm and focused during it, and show honestly whether it is working.

That decides the system:

- **Warm, not gamified.** Pawly is a fun app with a mascot, and the mascot does the talking: it greets you, reacts to what happened, and celebrates with you. But a dog picks up on a tense owner, so nothing flashes, pulses, or glows on its own. Delight comes from the mascot's expressions and the words, not from motion.
- **One-handed, standing up.** Every control is at least 44 pt. Primary actions sit at the bottom. Text is large enough to read at arm's length.
- **Paper and the mascot's blue.** The light background is warm paper, not screen-white, because the app is read outdoors in daylight. The single accent is the blue behind the mascot on the app icon, darkened one step so white text passes AA on it. Nothing else in the UI is coloured, so the mascot's cream and brown always read as the warmest thing on screen.
- **Native first.** Owners already know how iOS lists, headers, sheets and switches work. Pawly uses them, so the effort goes into the content, not into re-learning a UI.
- **Honest data.** Progress is shown as plain numbers and simple bars on the same surface as everything else, never as a hero banner.

## Colour

Six named roles. Nothing else is allowed in a screen file.

| Role | Light | Dark | Use |
|---|---|---|---|
| `bg.app` | `#F7F2EC` paper | `#151412` | Screen background |
| `bg.surface` | `#FFFDF9` | `#201E1B` | Grouped lists, cards that mean something, sheets |
| `bg.fill` | `#EFE8DE` sand | `#2A2724` | Inputs, chips, secondary fills, skeletons |
| `text.primary` | `#1C1917` | `#F3EFE9` | All headings and body |
| `text.secondary` | `#5C5650` | `#ABA39A` | Captions, labels, metadata (6.5:1 on paper) |
| `border.hairline` | `#E6DED3` | `#35312C` | Row separators only |
| `accent` | `#3F5BD1` icon blue | `#9AAEF7` | The one accent: primary button, selected state, links, progress, active tab |
| `accentSoft` | `#E3E8FB` | `#1F2A55` | Selected row / chip background. Accent text on it passes AA |
| `accentEdge` | `#2F46B0` | `#6F86E0` | The darker edge a filled button stands on |
| `status.danger` / `dangerSoft` | `#B42318` / `#FCE8E6` | `#F08A80` / `#3A1B18` | Errors, destructive buttons |
| `status.warning` / `warningSoft` | `#8A5A00` / `#FBEBC9` | `#F2C069` / `#3A2C12` | Missed sessions, cautions |

Every text/background pair above measures at least 4.7:1 (computed, both themes). `text.onAccent` is white in light and `#0F1735` in dark so primary buttons pass AA in both. The mascot's own colours live under `colors.mascot` and are never used for UI.

Banned: gradients, translucent "glass" surfaces, coloured shadows, per-course colours, purple in any form, any hex literal outside `constants/colors.ts`. Alpha tints are not created by string-concatenating `'80'` onto a token; use `accentSoft` or `bg.fill`.

Courses no longer have their own colour. They are told apart by name and icon. The `courseColors` module keeps its API so stores and mappers keep working, but every course resolves to the accent.

## Type

Two typefaces with assigned roles. **Nunito ExtraBold** is the voice: display, h1, h2 and button labels, and nothing else. Its rounded terminals match the mascot. **The platform system font** (SF Pro / Roboto) is everything readable: body, captions, labels, inputs. A rounded face for body text is the "cute pet app" template; keeping it to headings and buttons is what keeps this from looking generated.

| Variant | Size / line | Weight | Use |
|---|---|---|---|
| `display` | 32 / 38 | Nunito 800 | One per screen at most: the page title, the session timer |
| `h1` | 24 / 30 | Nunito 800 | Card title, screen title under a plain header |
| `h2` | 20 / 26 | Nunito 800 | Section heading, sheet title |
| `action` | 16 / 22 | Nunito 800 | Button labels only |
| `body` | 16 / 22 | 400 | Everything readable |
| `bodyStrong` | 16 / 22 | 600 | Row titles, button labels |
| `caption` | 14 / 20 | 400 | Secondary line under a row title |
| `captionStrong` | 14 / 20 | 600 | Small emphasised label |
| `label` | 12 / 16 | 600 | Tags, tab labels, tiny metadata |

Rules: letter-spacing is always 0. No uppercase transforms. No size outside the eight. Text never sets `fontSize`, `fontWeight`, or `lineHeight` in a screen; it picks a variant. Alignment is left; centre only inside an empty state or a full-screen completion moment.

## Spacing

A 4-pt grid: `xs 4 · sm 8 · md 12 · lg 16 · xl 24 · xxl 32 · xxxl 48`. Screen gutter is `lg` (16). Gap between rows in a group is 0 (hairline). Gap between groups is `xl`. Nothing else.

## Radius and elevation

| Token | Value | Meaning |
|---|---|---|
| `radii.sm` | 12 | Controls: inputs, chips, tags |
| `radii.md` | 16 | Containers: grouped lists, cards, buttons, sheets |
| `radii.full` | 999 | Avatars, progress bars, dots |

Elevation has two levels. `elevation.flat` is the default for everything that rests on the page: no shadow, no border, just `bg.surface` on `bg.app`. `elevation.raised` is for things that float over the page: sheets, popovers, the one floating button in a live session. Nothing else casts a shadow.

## The layout primitive

Pawly is a list. The signature pattern is the iOS inset grouped list, used everywhere content is grouped:

```
<SectionHeader title="Today" />
<ListGroup>
  <ListRow icon="paw" title="Loose-leash walking" subtitle="12 min · Step 3 of 6" onPress />
  <ListRow icon="walk" title="Log a walk" trailing="chevron" onPress />
</ListGroup>
```

`ListGroup` is `bg.surface`, `radii.md`, no border, no shadow. `ListRow` is 52 pt minimum, `lg` horizontal padding, an optional 22-pt icon in `accent` or `text.secondary`, a `bodyStrong` title, a `caption` subtitle, and an optional trailing chevron, value, switch, or tag. Rows are separated by a hairline inset to the text edge.

A `Card` is only used when the grouping itself carries meaning: today's session, the dog's profile summary, a coach message. It has the same surface treatment as a group. A card never contains another card.

Competing patterns (hero cards, stat tiles, feature grids, glass panels, striped callouts) are deleted, not restyled.

## Motion

Motion answers an action or shows a state change. Nothing animates on mount. Nothing loops except a loading indicator.

- Press feedback: filled buttons stand on a 4-pt darker edge (`accentEdge`) and press down into it; rows and text buttons dim to 0.6. No scale, no glow.
- Screen transitions, sheets, and tab switches use the platform's own.
- One orchestrated moment per screen at most. In Pawly that is session completion: the checkmark draws in, and haptic success fires. Everything else on that screen is still.
- Every animation checks `useReducedMotion()` from `lib/motion` and becomes an instant state change when it is on.
- Haptics (`lib/haptics`) fire on: session complete, rep counted, milestone earned, destructive confirm, and selection in a picker. Nowhere else.

## Navigation

- Native stack headers on every stack with the standard title (large titles are off until react-native-screens is upgraded; they do not render on iOS 26 with 4.1). Back is the system back button and swipe. No custom back buttons.
- The native tab bar with the platform's own height, tinted `accent`, labels in sentence case.
- Sheets are the platform sheet: `BottomSheet` presents as a page sheet on iOS with swipe-to-dismiss and a `Done`/`Close` header; full-screen with a header on Android.
- Modals that need full attention (a live session) are `fullScreenModal`.
- Switches are the platform `Switch`. Pickers are the platform picker in a sheet.

## The mascot

The mascot is the app icon's dog, drawn in `MascotCallout` from `colors.mascot`. It has five expressions (`happy`, `encouraging`, `thinking`, `celebrating`, `waiting`) that change only the eyes, mouth and head tilt. It appears in exactly these places: the Today greeting (with a speech bubble in its own voice), empty states, loading, and session completion. It never decorates a list, a card corner, or a button. Its speech-bubble lines are short, first-person plural ("We missed one. No big deal, let's pick it back up."), and never instruct the user to feel something.

The streak is the one small warm flourish outside the mascot: a flame in `status.warning` next to "n-day streak". Nothing else is amber.

## Icons

Ionicons, through `AppIcon` only, at 22 pt in rows and buttons and 24 pt in the tab bar. Outline style for inactive, filled for active. No emoji, no Unicode glyphs as icons, no arrows in text.

## Words

- Buttons name the exact action and keep that name through the flow: `Start session` → `Session saved`. Never "Submit", "Continue", "Get started", "Done", "Amazing".
- Sentence case everywhere. No exclamation marks except one, at most, on a completion screen. No "→".
- The mascot speaks in the first person plural and about the dog by name. The UI outside its bubble does not have a personality; the labels stay plain.
- Errors say what happened and what to do: "Couldn't save the walk. Check your connection and try again." Never "Something went wrong" or "Oops".
- One name per thing, app-wide:
  - The assistant is **the coach**. Tab: Coach. Never "trainer", "AI", "assistant".
  - A dog follows a **plan**, made of **courses** (one per goal), made of **sessions**, made of **steps**. Never "programme", "lesson", "drill", "exercise", "protocol" in UI copy.
  - A **milestone** is **reached**. Never "achievement", "badge", "unlocked", "earned".
  - **Log in** / **Log out** / **Create account**. Never "Sign in" / "Sign up".
  - The reference tab is **Learn**; its content is **guides**.
  - US spelling.

## Migration cheat sheet (old → new)

| Old | New |
|---|---|
| `colors.brand.primary`, `colors.primary`, `colors.success`, `colors.brand.coach` | `colors.accent` |
| `colors.brand.secondary`, `colors.accent`, `colors.warning` | `colors.status.warning` (only if it is a warning; otherwise `colors.accent` or `text.secondary`) |
| `colors.error` | `colors.status.danger` |
| `colors.textPrimary` / `text.primary` | `colors.text.primary` |
| `colors.textSecondary` | `colors.text.secondary` |
| `colors.background`, `colors.bg.app` | `colors.bg.app` |
| `colors.surface`, `colors.bg.surface`, `bg.elevated`, `bg.glass` | `colors.bg.surface` |
| `colors.secondary`, `bg.surfaceAlt`, `bg.sand` | `colors.bg.fill` |
| `colors.border.default/soft/strong`, `borderColor` | `colors.border.hairline` (and ask whether the border is needed at all) |
| `status.successBg/infoBg`, `${accent}10`-style tints | `colors.accentSoft` |
| `status.warningBg/Border` | `colors.status.warningSoft` |
| `status.dangerBg/Border` | `colors.status.dangerSoft` |
| `colors.gradient.*`, `LinearGradient` | delete; use `bg.app` |
| `shadows.card`, `softShadows.*`, `tintedShadow()`, `colors.shadow.*` | delete (flat) or `elevation.raised` for sheets |
| `radii.lg`, `radii.pill` | `radii.md`, `radii.full` |
| `spacing.md/lg/xl/xxl` (old 16/24/32/48) | renamed to `lg/xl/xxl/xxxl`; `spacing.md` is now 12 |
| `variant="title"` / `"h3"` / `"micro"` | `"h2"` / `"bodyStrong"` / `"label"` |
| `fontSize: 15/13/17` | `caption` / `caption` / `body` |
| `letterSpacing`, `textTransform: 'uppercase'` | delete |
| `Ionicons` direct import | `AppIcon` |
| custom back button + `headerShown: false` | remove; set `title` in the stack layout |
| `Vibration.vibrate` | `haptics.success()` etc. from `lib/haptics` |
| `Animated.loop` / `withRepeat` decorative | delete |
| `entering={FadeInDown…}` | delete |
| `PillTag` | `Tag` (same file) with `neutral` / `accent` / `warning` / `danger` |
| stat tile rows | a `ListRow` with the number as the trailing value |
| card-in-card | flatten to one `ListGroup` |
