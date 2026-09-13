import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Haptics fire only on: session complete, rep counted, milestone reached,
 * destructive confirm, and selection in a picker. See DESIGN.md.
 */
function safe(fn: () => Promise<void>) {
  if (Platform.OS === 'web') return;
  fn().catch(() => {});
}

export const haptics = {
  /** A rep was counted, an option was picked. */
  selection: () => safe(() => Haptics.selectionAsync()),
  /** Session saved, milestone reached. */
  success: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  /** Something needs attention. */
  warning: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  /** A save failed, a destructive action was confirmed. */
  error: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
  /** A significant control was pressed (start session, stop timer). */
  impact: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
};
