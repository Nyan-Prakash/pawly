# Pawly

Pawly is a dog training app for iOS (Android to follow). An owner describes their dog and
goals during onboarding, gets a scheduled training plan made of short guided sessions, and
works through it with a step-by-step session player, an AI coach, walk logging, streaks and
milestones. Plans adapt as sessions and walks are logged. Free users get a limited number of
sessions and coach messages; Pawly Pro removes the limits.

`spec.md` is the technical specification. `DESIGN.md` is the binding design system.

## Stack

- Expo SDK 52, React Native 0.76, React 18, TypeScript (strict)
- expo-router v4 for file-based navigation (`app/`)
- zustand v5 for client state (`stores/`), React Query for server state
- Supabase: Postgres, Auth, Storage and Deno edge functions (`supabase/`)
- RevenueCat (`react-native-purchases`) for subscriptions, entitlement `pawly_pro`
- PostHog (`posthog-react-native`) for product analytics
- Sentry (`@sentry/react-native`) for crash and error reporting

## Requirements

- Node.js 22 (the test runner uses `node --test --experimental-strip-types`)
- npm 10+
- Xcode with an iOS simulator
- Supabase CLI and EAS CLI for backend and build work

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`. Variables read by the app:

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (publishable) key |
| `EXPO_PUBLIC_POSTHOG_API_KEY` | PostHog project key |
| `EXPO_PUBLIC_POSTHOG_HOST` | Optional. Defaults to PostHog US cloud |
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry DSN |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | RevenueCat public Apple key (`appl_...`) |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | RevenueCat public Google key (`goog_...`) |
| `APP_ENV` | Environment name |

Only public keys belong here. `EXPO_PUBLIC_*` values are bundled into the app, so never put
a RevenueCat `sk_` key, a Supabase service role key or an OpenAI key in `.env`.

## Running on the iOS simulator

The app uses native modules (RevenueCat, Sentry, notifications), so it needs a development
client. Expo Go will not work.

```bash
npx expo run:ios     # builds and installs the dev client, then starts Metro
npx expo start       # later runs, once the dev client is installed
```

Rebuild the dev client when a native dependency changes. After editing `.env`, restart
Metro with `npx expo start --clear`.

## Tests and typecheck

```bash
npm test             # node --test over tests/*.test.ts
npm run typecheck    # tsc --noEmit
```

Tests cover the pure logic in `lib/` (schedule engine, merged schedule, subscription gates,
adaptive planning, streaks) and run without React Native. CI (`.github/workflows/ci.yml`)
runs the typecheck and the tests on every pull request and on pushes to `main`.

## Project layout

```
app/            expo-router routes: (auth), (onboarding), (tabs)
components/     UI components and primitives
constants/      design tokens, training protocols, breeds
hooks/          shared React hooks
lib/            pure logic and service clients (supabase, revenuecat, analytics, sentry)
stores/         zustand stores
types/          shared TypeScript types
tests/          node:test suites
supabase/       edge functions, migrations, config.toml
docs/           setup and design notes
```

## Supabase

- `supabase/migrations/` holds timestamped SQL migrations. Apply with `supabase db push`.
- `supabase/functions/` holds the edge functions, with shared helpers in `_shared/`:
  `generate-adaptive-plan`, `adapt-plan`, `ai-coach-message`, `live-ai-trainer`,
  `generate-dog-avatar`, `delete-account`, `revenuecat-webhook`.
- `supabase/config.toml` sets `verify_jwt` per function. Functions with it off validate the
  caller themselves; `revenuecat-webhook` is authenticated with a shared secret.
- Deploy with `supabase functions deploy <name>`. Function secrets are set with
  `supabase secrets set`: `OPENAI_API_KEY` and `REVENUECAT_WEBHOOK_SECRET`.
  `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are provided by the
  platform.

## Subscriptions

Gate logic is in `lib/subscription.ts`, the SDK wrapper in `lib/revenuecat.ts`. Store and
dashboard setup is in `docs/REVENUECAT-SETUP.md`. Without a RevenueCat key everyone stays free.

## EAS builds

Profiles are defined in `eas.json`: `development` (simulator dev client),
`development-device`, `preview` (internal distribution) and `production` (auto-incremented
build number, remote app version source).

```bash
eas build --profile development --platform ios
eas build --profile production --platform ios
```

`.env` is not uploaded to EAS. Every `EXPO_PUBLIC_*` variable listed above must also exist
in the matching EAS environment (`eas env:create`, or the project's environment variables
page), otherwise the build ships with the value undefined and that service is silently
disabled. Check this before every production build.
