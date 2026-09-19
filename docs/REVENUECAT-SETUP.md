# RevenueCat setup

The app code is done. Until the steps below are finished the paywall opens and says
"Subscriptions aren't set up in this build yet", and everyone is on the free tier.

The code depends on exactly three names. Keep them as written.

| Thing | Identifier | Where the code reads it |
|---|---|---|
| Entitlement | `pro` | `PRO_ENTITLEMENT` in `lib/subscription.ts` |
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
3. Entitlements: create `pro` and attach both products.
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

Not built yet (roadmap PR 10): gates wired into the screens, the RevenueCat → Supabase webhook, and server-side enforcement. Until the webhook exists, `users.subscription_tier` in Supabase is not updated; the client reads the tier from RevenueCat directly.
