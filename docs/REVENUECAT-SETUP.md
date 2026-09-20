# RevenueCat setup

The app code is done. Until the steps below are finished the paywall opens and says
"Subscriptions aren't set up in this build yet", and everyone is on the free tier.

The code depends on exactly three names. Keep them as written.

| Thing | Identifier | Where the code reads it |
|---|---|---|
| Entitlement | `pawly_pro` | `PRO_ENTITLEMENT` in `lib/subscription.ts` |
| Offering | whichever is marked **current** | `getProPackages()` in `lib/revenuecat.ts` |
| Packages | `$rc_monthly`, `$rc_annual` (the built-in Monthly / Annual types) | same |

Product identifiers are free to choose. Suggested: `pawly_pro_monthly`, `pawly_pro_annual`.
Prices, trial length and the "% less than monthly" line all come from the store, not from the app.

## 1. App Store Connect

1. Sign the Paid Applications agreement and finish banking and tax (Agreements, Tax, and Banking). Products do not load until this is active.
2. App (`com.nyan.prakash.pawly`) → Subscriptions → create a subscription group, "Pawly Pro".
3. Add two auto-renewable subscriptions in the group: `pawly_pro_monthly` (1 month) and `pawly_pro_annual` (1 year). Set price, display name and description for each.
4. Optional: add an introductory offer of type Free (for example 1 week) to the annual product. The button then reads "Start 7-day free trial" on its own.
5. Users and Access → Integrations → In-App Purchase: generate an In-App Purchase key (`.p8`). Note the Key ID and Issuer ID.

## 2. RevenueCat dashboard

1. Create a project, add an **App Store** app with bundle ID `com.nyan.prakash.pawly`, and upload the `.p8` key from step 1.5.
2. Product catalog → Products: import `pawly_pro_monthly` and `pawly_pro_annual`.
3. Entitlements: create `pawly_pro` and attach both products.
4. Offerings: create one offering (`default`), add the **Monthly** package with the monthly product and the **Annual** package with the annual product, and make the offering current.
5. API keys: copy the **public** Apple key (`appl_…`) into `.env`:

   ```
   EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxxxxx
   ```

   Add the same variable to EAS for builds (`eas env:create`). Never put a secret `sk_` key in the app.

Android is the same with a Play Console app, a service-account JSON, and `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_…`.

## 3. Test

`react-native-purchases` is a native module: rebuild the dev client once (`npx expo run:ios`) after pulling this change.

- Simulator: purchases need a StoreKit configuration file, or use a RevenueCat Test Store key for fake purchases.
- Device: create a Sandbox tester in App Store Connect, log in to it under Settings → Developer → Sandbox Apple Account, then buy from Profile → Pawly Pro. Sandbox yearly subscriptions renew every hour.
- Check: the Profile row switches to "Renews …", Restore purchases works after a reinstall, and the customer appears in RevenueCat under the Supabase user ID.

## Using it in code

```ts
import { canAccess } from '@/lib/subscription';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

const tier = useSubscriptionStore((s) => s.tier);
if (!canAccess('full_plan', tier)) {
  useSubscriptionStore.getState().openPaywall('plan');
}
```

## Free vs Pro

The free tier is defined in one place, `FREE_LIMITS` in `lib/subscription.ts`:
3 completed sessions, 3 coach messages a day, the last 2 weeks of progress.
The coach number is enforced server-side and mirrored as `FREE_DAILY_MESSAGES`
in `supabase/functions/ai-coach-message`; change both together.

- Sessions: `guardSessionStart()` in `lib/proGate.ts` runs at every entry point and as a backstop in the session screen. Completed sessions and quick reps stay free.
- Coach: the edge function answers 429 with `code: 'free_daily_limit'`; `coachStore` opens the paywall.
- Progress: free shows `FREE_LIMITS.progressWeeks` weekly bars and a row that opens the paywall.
- The paywall opens once for everyone after onboarding (`plan_preview`), and can be closed.

## Webhook (RevenueCat → Supabase)

`supabase/functions/revenuecat-webhook` keeps `user_profiles.subscription_tier` in step with the `pawly_pro` entitlement. Without it the coach limit never lifts for subscribers.

1. Pick a long random secret: `openssl rand -hex 32`.
2. `supabase secrets set REVENUECAT_WEBHOOK_SECRET=<secret>`
3. `supabase db push` (migration `20260920140000_revenuecat_webhook.sql`), then `supabase functions deploy revenuecat-webhook ai-coach-message`.
4. RevenueCat → Integrations → Webhooks → add `https://<project-ref>.supabase.co/functions/v1/revenuecat-webhook` with Authorization header value `Bearer <secret>`. Send a test event; it should return 200.

Session and progress limits are client-side only; the coach limit is the one enforced on the server.
