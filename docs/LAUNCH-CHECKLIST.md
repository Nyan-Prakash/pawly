# Launch checklist

What is left after the `feat/launch-hardening` code changes. Everything here
happens outside the repo: dashboards, secrets, deploys and store setup.
Work top to bottom; later steps depend on earlier ones.

## 1. Rebuild the native app

New native modules and config plugins were added (Sign in with Apple
entitlement, splash screen, expo-notifications, Sentry, NetInfo, StoreReview,
expo-updates). The existing dev client does not contain them.

```bash
npx expo prebuild --clean
```

```bash
npx expo run:ios
```

Check on the simulator or a device: the splash shows the mascot, Apple sign-in
works on a real device, the offline banner appears in airplane mode.

## 2. Supabase

Deploy in this order. The functions depend on the migration.

```bash
supabase db push
```

```bash
supabase functions deploy apple-token-exchange delete-account ai-coach-message live-ai-trainer revenuecat-webhook adapt-plan generate-adaptive-plan generate-dog-avatar
```

Secrets (`supabase secrets set NAME=value`):

| Secret | Needed for | Required |
| --- | --- | --- |
| `REVENUECAT_WEBHOOK_SECRET` | Webhook authorization | Yes |
| `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` | Revoking the Apple token on account deletion | Yes, for App Review |
| `APPLE_CLIENT_ID` | Defaults to `com.nyan.prakash.pawly` | No |
| `REVENUECAT_SECRET_API_KEY` | Exact expiry on subscription transfers | No |
| `REVENUECAT_IGNORE_SANDBOX` | Set to `true` after launch if testers should stay on free | No |
| `LIVE_TRAINER_FREE_DAILY_LIMIT`, `LIVE_TRAINER_GLOBAL_DAILY_LIMIT` | Override the 60 and 20000 defaults | No |

Dashboard:

- Authentication, URL Configuration: add `pawly://reset-password` and `pawly://`
  to the redirect allow-list. Password reset and email confirmation return to
  the app through these.
- Authentication, Providers: enable Apple with the bundle id as the client id.
- Authentication, SMTP: set a custom sender. The built-in one is rate-limited
  to a few emails an hour.
- Confirm the plan has daily backups.
- After deploying, generate one avatar during onboarding on a real network and
  confirm the per-IP limit is not shared across users (see the quota note in
  `supabase/functions/_shared/quota.ts`).

## 3. RevenueCat and App Store Connect

Follow `docs/REVENUECAT-SETUP.md`. In short:

- Sign the Paid Apps agreement.
- Create `pawly_pro_monthly` and `pawly_pro_annual` in one subscription group;
  add the 7-day trial to the annual product if wanted.
- Add the App Store app in RevenueCat and copy its `appl_` key.
- Add the webhook URL (`…/functions/v1/revenuecat-webhook`) with the same
  authorization value as `REVENUECAT_WEBHOOK_SECRET`. Send a test event.
- Revoke the old `sk_` key if that has not been done.
- Make a sandbox purchase and confirm `user_profiles.subscription_tier` turns
  to `pro` for that user. The server trusts only this column: if the webhook is
  not syncing, a paying user keeps the free coach limit and cannot save a sixth
  session. Do not ship until this works.

## 4. EAS

Create each variable in the `production` environment (and `preview` if used):

```bash
eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value "…"
```

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_REVENUECAT_IOS_KEY` (the `appl_` key, never `test_` or `sk_`)
- `EXPO_PUBLIC_POSTHOG_API_KEY`
- `EXPO_PUBLIC_SENTRY_DSN`
- `EXPO_PUBLIC_ENABLE_ADAPTIVE_PLANNER` (`true`)
- `EXPO_PUBLIC_ENABLE_LIVE_AI_TRAINER` (leave unset or `false`; live camera coaching is gated off for launch)
- `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` (source map upload)

Then:

- Replace `REPLACE_WITH_APP_STORE_CONNECT_APP_ID` in `eas.json`.
- `eas.json` pins `"image": "latest"` for iOS so the build uses the newest
  Xcode. Run one `preview` build first to confirm SDK 52 archives cleanly on it.
- Run `eas update:configure` once to link the update channels.

## 5. Store listing

- Host `docs/legal/privacy.html`, `terms.html` and `support.html`; paste the
  URLs into App Store Connect (privacy policy URL, support URL, and the terms
  link in the description or the EULA field).
- App Privacy labels: contact info (email), user content (coach messages, dog
  photo, camera frames sent for analysis, not stored), identifiers (user id),
  purchases, usage data, diagnostics. None used for tracking.
- Age rating questionnaire; screenshots at 6.9 inch; a demo account for the
  reviewer, with a note explaining that the Live AI Trainer needs a camera
  pointed at a dog and falls back to manual counting.
- Have someone review the legal text. Two items need a decision: the 30-day
  reply promise for privacy requests, and the statements about how OpenAI
  retains API data.

## 6. Before submitting

- TestFlight build, real sandbox purchase on a device, restore on a second
  device, delete the account and confirm the Apple ID no longer lists Pawly
  under Sign in with Apple.
- Cold start in airplane mode: the last plan shows, with the offline banner.
- Reset a password from the email on the phone.
