import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';

type SafeScreenProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function SafeScreen({ children, style }: SafeScreenProps) {
  return (
    <SafeAreaView className="flex-1" style={[{ backgroundColor: colors.bg.app }, style]}>
      {children}
    </SafeAreaView>
  );
}
