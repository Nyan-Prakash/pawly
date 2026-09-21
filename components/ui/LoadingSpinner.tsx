import { ActivityIndicator, View } from 'react-native';

import { colors } from '@/constants/colors';

/** Use only where a skeleton has no shape to mirror. */
export function LoadingSpinner() {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <ActivityIndicator color={colors.text.secondary} />
    </View>
  );
}
