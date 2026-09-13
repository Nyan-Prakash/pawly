import { ActivityIndicator, Modal, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

interface Props {
  visible: boolean;
  percent: number; // 0–100
}

/**
 * Full-screen upload state. Shows the measured percentage only; there is no
 * estimated time because throughput is not measured.
 */
export function VideoUploadProgress({ visible, percent }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const finishing = clamped >= 100;

  return (
    <Modal visible={visible} presentationStyle="fullScreen" animationType="fade">
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.app }}>
        <View style={{ flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.lg }}>
          <Text variant="h2">Uploading video</Text>

          <ProgressBar progress={clamped / 100} height={8} accessibilityLabel="Upload progress" />

          {finishing ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <ActivityIndicator color={colors.text.secondary} />
              <Text variant="caption">Finishing up</Text>
            </View>
          ) : (
            <Text variant="caption">{clamped}%</Text>
          )}

          <Text variant="caption">Keep the app open until the upload finishes.</Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
