import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Modal, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from '@/components/ui/IconButton';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

type BottomSheetProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  /** Shown in the sheet header. */
  title?: string;
  /**
   * Inset content with the screen gutter. Pass `false` when the sheet lays
   * out its own scroll region and fixed footer edge-to-edge.
   */
  padded?: boolean;
}>;

/**
 * The platform sheet. On iOS a page sheet with swipe-to-dismiss and a
 * Close button; on Android a full-screen modal with the same header.
 * Keyboard avoidance is always on.
 */
export function BottomSheet({ visible, onClose, title, padded = true, children }: BottomSheetProps) {
  return (
    <Modal
      visible={visible}
      presentationStyle="pageSheet"
      animationType="slide"
      onRequestClose={onClose}
      onDismiss={onClose}
    >
      <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: colors.bg.app }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: spacing.lg,
            paddingRight: spacing.xs,
            paddingTop: Platform.OS === 'android' ? spacing.xl : spacing.sm,
            minHeight: 52,
          }}
        >
          <Text variant="h2" numberOfLines={1} style={{ flex: 1 }}>
            {title ?? ''}
          </Text>
          <IconButton icon="close" accessibilityLabel="Close" tone="secondary" onPress={onClose} />
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View style={{ flex: 1, padding: padded ? spacing.lg : 0, paddingTop: padded ? spacing.sm : 0 }}>
            {children}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
