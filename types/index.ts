export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type DogProfile = {
  id: string;
  name: string;
};

export type SubscriptionTier = 'free' | 'core' | 'premium';

export interface AppUser {
  id: string;
  email: string;
  subscriptionTier: SubscriptionTier;
  onboardingCompletedAt: string | null;
  householdId: string | null;
  createdAt: string;
}
