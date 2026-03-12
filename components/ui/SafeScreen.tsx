import type { PropsWithChildren } from 'react';

import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';

export function SafeScreen({ children }: PropsWithChildren) {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {children}
    </SafeAreaView>
  );
}
