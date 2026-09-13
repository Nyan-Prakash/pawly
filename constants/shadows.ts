import { Platform, type ViewStyle } from 'react-native';

/**
 * Two elevation levels. See DESIGN.md.
 *
 *   flat   everything that rests on the page (default). No shadow, no border.
 *   raised things that float over the page: sheets, popovers, one floating
 *          control in a live session.
 *
 * There are no coloured shadows and no per-card shadows.
 */
export const elevation = {
  flat: {} as ViewStyle,
  raised: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
    },
    android: { elevation: 6 },
    default: {},
  }) as ViewStyle,
} as const;
