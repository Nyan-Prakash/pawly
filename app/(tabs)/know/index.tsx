import { View } from 'react-native';

import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

export default function KnowScreen() {
  return (
    <SafeScreen>
      <View style={{ height: spacing.xs, backgroundColor: colors.primary }} />
      <View className="flex-1 items-center justify-center">
        <Text variant="title">Know</Text>
      </View>
    </SafeScreen>
  );
}
