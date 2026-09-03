import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { Animated, Easing, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

type BottomSheetProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  /** Lift the panel above the keyboard when it contains text inputs. */
  avoidKeyboard?: boolean;
  /**
   * Inset content and pad the safe-area bottom. Pass `false` when the sheet
   * lays out its own scroll region and fixed footer edge-to-edge.
   */
  padded?: boolean;
}>;

const OPEN_MS = 260;
const CLOSE_MS = 200;

/**
 * Bottom sheet with layered motion: the scrim fades in place while the panel
 * springs up from below. (Modal's built-in "slide" moves the scrim with the
 * panel, which reads as the whole screen lurching.)
 */
export function BottomSheet({ visible, onClose, avoidKeyboard = false, padded = true, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(0)).current; // 0 = closed, 1 = open
  const [panelHeight, setPanelHeight] = useState(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: OPEN_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (mounted) {
      Animated.timing(progress, {
        toValue: 0,
        duration: CLOSE_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null;

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [panelHeight || 600, 0],
  });

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      {/* Scrim — fades, never moves */}
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15,23,42,0.5)', opacity: progress }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
      </Animated.View>

      {/* Panel — slides */}
      <KeyboardAvoidingView
        pointerEvents="box-none"
        enabled={avoidKeyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end' }]}
      >
      <Animated.View
        onLayout={(e) => setPanelHeight(e.nativeEvent.layout.height)}
        style={{ transform: [{ translateY }] }}
      >
        <View
          style={{
            backgroundColor: colors.bg.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            overflow: 'hidden',
            padding: padded ? spacing.lg : 0,
            paddingTop: spacing.md,
            paddingBottom: padded ? Math.max(insets.bottom, spacing.md) + spacing.md : 0,
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.border.default,
              alignSelf: 'center',
              marginBottom: padded ? spacing.md : spacing.sm,
            }}
          />
          {children}
        </View>
      </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
