import { useEffect } from 'react';
import { useRouter } from 'expo-router';

// This route is no longer used — the full onboarding flow lives in dog-basics.tsx
export default function VideoUploadRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/(onboarding)/dog-basics');
  }, [router]);
  return null;
}
