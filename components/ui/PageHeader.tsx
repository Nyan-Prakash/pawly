import { View } from 'react-native';

import { MascotCallout, type MascotState } from '@/components/ui/MascotCallout';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

type PageHeaderProps = {
  title: string;
  /** Small line above the title, e.g. today's date. */
  eyebrow?: string;
  /** What the mascot says about this page. Short, first-person plural, specific. */
  line?: string;
  mascotState?: MascotState;
};

/**
 * The header of every tab root: eyebrow, display title, and the mascot with
 * one line about what is on the page (DESIGN.md, "The mascot"). Replaces the
 * native title on tab roots only; pushed screens keep the native header.
 */
export function PageHeader({ title, eyebrow, line, mascotState = 'happy' }: PageHeaderProps) {
  return (
    <View style={{ gap: spacing.lg, paddingTop: spacing.sm }}>
      <View style={{ gap: spacing.xs }}>
        {eyebrow ? (
          <Text variant="captionStrong" color={colors.text.secondary}>
            {eyebrow}
          </Text>
        ) : null}
        <Text variant="display" accessibilityRole="header">
          {title}
        </Text>
      </View>
      {line ? <MascotCallout state={mascotState} size={72} callout={line} calloutPlacement="right" /> : null}
    </View>
  );
}
