import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';

type SafeScreenProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  /** Defaults to every edge. Pass ['bottom'] under a native header. */
  edges?: readonly Edge[];
}>;

export function SafeScreen({ children, style, edges }: SafeScreenProps) {
  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: colors.bg.app }, style]}>
      {children}
    </SafeAreaView>
  );
}
