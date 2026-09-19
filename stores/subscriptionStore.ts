import { create } from 'zustand';
import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';

import { captureEvent } from '@/lib/analytics';
import {
  getProPackages,
  identify,
  isUserCancelled,
  logOutOfRevenueCat,
  onCustomerInfoUpdated,
  purchase,
  purchaseErrorMessage,
  restore,
  type ProPackages,
} from '@/lib/revenuecat';
import { tierFromCustomerInfo } from '@/lib/subscription';
import type { SubscriptionTier } from '@/types';

/** Where the paywall was opened from, for analytics. */
export type PaywallSource = 'profile' | 'plan_preview' | 'coach' | 'video' | 'progress' | 'plan';

interface SubscriptionStore {
  tier: SubscriptionTier;
  customerInfo: CustomerInfo | null;
  packages: ProPackages;
  isLoadingPackages: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
  /** Shown inline on the paywall. */
  error: string | null;

  isPaywallOpen: boolean;
  paywallSource: PaywallSource | null;
  openPaywall: (source: PaywallSource) => void;
  closePaywall: () => void;

  identify: (userId: string) => Promise<void>;
  reset: () => Promise<void>;
  loadPackages: () => Promise<void>;
  /** Resolves true when Pro is active afterwards. */
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
}

let stopListening: (() => void) | null = null;

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => {
  const applyCustomerInfo = (info: CustomerInfo | null) =>
    set({ customerInfo: info, tier: tierFromCustomerInfo(info) });

  return {
    tier: 'free',
    customerInfo: null,
    packages: { monthly: null, annual: null },
    isLoadingPackages: false,
    isPurchasing: false,
    isRestoring: false,
    error: null,

    isPaywallOpen: false,
    paywallSource: null,
    openPaywall: (source) => {
      captureEvent('paywall_viewed', { source });
      set({ isPaywallOpen: true, paywallSource: source, error: null });
      get().loadPackages();
    },
    closePaywall: () => set({ isPaywallOpen: false, error: null }),

    identify: async (userId) => {
      try {
        applyCustomerInfo(await identify(userId));
        stopListening ??= onCustomerInfoUpdated(applyCustomerInfo);
      } catch (error) {
        // Stay on the last known tier; the listener or the next launch corrects it.
        console.warn('[subscription] identify failed:', error);
      }
    },

    reset: async () => {
      set({ tier: 'free', customerInfo: null, isPaywallOpen: false, error: null });
      await logOutOfRevenueCat().catch(() => {});
    },

    loadPackages: async () => {
      if (get().isLoadingPackages) return;
      set({ isLoadingPackages: true });
      try {
        set({ packages: await getProPackages() });
      } catch (error) {
        console.warn('[subscription] offerings failed:', error);
      } finally {
        set({ isLoadingPackages: false });
      }
    },

    purchase: async (pkg) => {
      const source = get().paywallSource;
      set({ isPurchasing: true, error: null });
      captureEvent('purchase_started', { source, product: pkg.product.identifier });
      try {
        applyCustomerInfo(await purchase(pkg));
        captureEvent('purchase_completed', { source, product: pkg.product.identifier });
        return get().tier === 'pro';
      } catch (error) {
        if (!isUserCancelled(error)) {
          captureEvent('purchase_failed', { source, product: pkg.product.identifier });
          set({ error: purchaseErrorMessage(error) });
        }
        return false;
      } finally {
        set({ isPurchasing: false });
      }
    },

    restore: async () => {
      set({ isRestoring: true, error: null });
      try {
        applyCustomerInfo(await restore());
        const restored = get().tier === 'pro';
        captureEvent('purchases_restored', { restored });
        if (!restored) set({ error: "We couldn't find a Pro subscription for this store account." });
        return restored;
      } catch (error) {
        set({ error: "Couldn't restore purchases. Check your connection and try again." });
        return false;
      } finally {
        set({ isRestoring: false });
      }
    },
  };
});
