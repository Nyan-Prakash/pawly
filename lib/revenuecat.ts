import { Platform } from 'react-native';
import Purchases, {
  INTRO_ELIGIBILITY_STATUS,
  LOG_LEVEL,
  PACKAGE_TYPE,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesPackage,
} from 'react-native-purchases';

const API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
});

/**
 * False until real keys are in `.env`; every call below is then a no-op.
 * Only public SDK keys (`appl_` / `goog_`) are accepted — an `sk_` secret key
 * must never be bundled into the client. A Test Store key (`test_`) works in
 * dev builds only; the SDK refuses it in release.
 */
export const isRevenueCatAvailable =
  !!API_KEY && (/^(appl|goog)_/.test(API_KEY) || (__DEV__ && API_KEY.startsWith('test_')));
if (__DEV__ && API_KEY?.startsWith('sk_')) {
  console.error('[revenuecat] EXPO_PUBLIC_REVENUECAT_*_KEY is a SECRET key. Rotate it and use the public appl_/goog_ SDK key.');
}

export type ProPackages = {
  monthly: PurchasesPackage | null;
  annual: PurchasesPackage | null;
};

let configured = false;

/** Configure once, then keep the RevenueCat user in step with the Supabase user. */
export async function identify(userId: string): Promise<CustomerInfo | null> {
  if (!isRevenueCatAvailable || !API_KEY) return null;

  if (!configured) {
    if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.WARN);
    Purchases.configure({ apiKey: API_KEY, appUserID: userId });
    configured = true;
    return Purchases.getCustomerInfo();
  }

  const { customerInfo } = await Purchases.logIn(userId);
  return customerInfo;
}

export async function logOutOfRevenueCat(): Promise<void> {
  if (!configured) return;
  // Throws when the current user is already anonymous; nothing to do then.
  if (await Purchases.isAnonymous()) return;
  await Purchases.logOut();
}

/** The monthly and annual packages of the current offering. */
export async function getProPackages(): Promise<ProPackages> {
  if (!configured) return { monthly: null, annual: null };
  const { current } = await Purchases.getOfferings();
  const packages = current?.availablePackages ?? [];
  return {
    monthly: current?.monthly ?? packages.find((p) => p.packageType === PACKAGE_TYPE.MONTHLY) ?? null,
    annual: current?.annual ?? packages.find((p) => p.packageType === PACKAGE_TYPE.ANNUAL) ?? null,
  };
}

/**
 * Whether this store account can still use each package's free trial. A lapsed
 * subscriber is charged immediately, so the paywall must not promise a trial.
 * Android reports "unknown" and hides the intro price itself when ineligible.
 */
export async function getTrialEligibility(packages: ProPackages): Promise<Record<string, boolean>> {
  const ids = [packages.monthly, packages.annual]
    .filter((pkg): pkg is PurchasesPackage => !!pkg?.product.introPrice)
    .map((pkg) => pkg.product.identifier);
  if (!configured || ids.length === 0) return {};

  const result = await Purchases.checkTrialOrIntroductoryPriceEligibility(ids);
  const eligible: Record<string, boolean> = {};
  for (const id of ids) {
    const status = result[id]?.status;
    eligible[id] =
      status === INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE ||
      (Platform.OS === 'android' && status === INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_UNKNOWN);
  }
  return eligible;
}

export async function purchase(pkg: PurchasesPackage): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restore(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

export function onCustomerInfoUpdated(listener: (info: CustomerInfo) => void): () => void {
  if (!configured) return () => {};
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => {
    Purchases.removeCustomerInfoUpdateListener(listener);
  };
}

type PurchasesError = { code?: PURCHASES_ERROR_CODE; userCancelled?: boolean | null };

export function isUserCancelled(error: unknown): boolean {
  const e = error as PurchasesError | null;
  return !!e?.userCancelled || e?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
}

/** What happened and what to do, in Pawly's words. */
export function purchaseErrorMessage(error: unknown): string {
  switch ((error as PurchasesError | null)?.code) {
    case PURCHASES_ERROR_CODE.NETWORK_ERROR:
    case PURCHASES_ERROR_CODE.OFFLINE_CONNECTION_ERROR:
      return "Couldn't reach the store. Check your connection and try again.";
    case PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR:
      return "Purchases are turned off on this device. Check Screen Time or your store account, then try again.";
    case PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR:
      return 'The payment is waiting for approval. Pro turns on as soon as it goes through.';
    case PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR:
      return 'This account already has Pro. Use Restore purchases to bring it back.';
    default:
      return "The purchase didn't go through and you weren't charged. Try again in a moment.";
  }
}
