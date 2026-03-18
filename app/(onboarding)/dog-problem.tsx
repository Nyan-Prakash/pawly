import { useEffect } from 'react';
import { useRouter } from 'expo-router';

// This route is no longer used — the full onboarding flow lives in dog-basics.tsx
export default function DogProblemRedirect() {
  const router = useRouter();
  useEffect(() => {
    // Redirect to dog-basics starting from the problem step (index 5)
    router.replace('/(onboarding)/dog-basics?step=5');
  }, [router]);
  return null;
}
