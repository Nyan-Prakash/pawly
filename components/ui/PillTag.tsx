import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';

type TagTone = 'neutral' | 'accent' | 'warning' | 'danger';

type TagProps = {
  label: string;
  tone?: TagTone;
};

/**
 * A small status tag: "Missed", "Today", "3 left". Used as trailing content
 * in a row or next to a title. Never stacked above a heading, never decorative.
 */
export function Tag({ label, tone = 'neutral' }: TagProps) {
  const palette: Record<TagTone, { bg: string; text: string }> = {
    neutral: { bg: colors.bg.fill, text: colors.text.secondary },
    accent: { bg: colors.accentSoft, text: colors.accent },
    warning: { bg: colors.status.warningSoft, text: colors.status.warning },
    danger: { bg: colors.status.dangerSoft, text: colors.status.danger },
  };
  const { bg, text } = palette[tone];

  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: radii.sm,
        paddingHorizontal: spacing.sm,
        height: 24,
        justifyContent: 'center',
        alignSelf: 'flex-start',
      }}
    >
      <Text variant="label" color={text}>
        {label}
      </Text>
    </View>
  );
}

/** @deprecated use Tag */
export const PillTag = Tag;
