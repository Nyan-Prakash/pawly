import type { PropsWithChildren } from 'react';
import { View, type ViewProps } from 'react-native';

import { colors } from '@/constants/colors';
import { elevation } from '@/constants/shadows';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';

type CardProps = PropsWithChildren<
  ViewProps & {
    /** `raised` only for things that float over the page. */
    variant?: 'flat' | 'raised';
  }
>;

/**
 * A surface used only when the grouping carries meaning (today's session,
 * the dog's summary). Same treatment as a ListGroup; a card never contains
 * another card. Prefer ListGroup + ListRow for lists.
 */
export function Card({ children, style, variant = 'flat', ...props }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.bg.surface,
          borderRadius: radii.md,
          padding: spacing.lg,
          ...elevation[variant],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
