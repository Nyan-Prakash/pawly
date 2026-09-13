import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';

interface CalendarDayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasSessions: boolean;
  allCompleted: boolean;
  hasUpcoming: boolean;
  onPress: () => void;
}

const CIRCLE = 44;

/**
 * One day in the month grid. Selected day is an accentSoft circle with accent
 * text; today wears an accent ring. A small dot marks days with sessions.
 */
export function CalendarDayCell({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  hasSessions,
  allCompleted,
  hasUpcoming,
  onPress,
}: CalendarDayCellProps) {
  const dayNumber = date.getDate();
  const textColor = isSelected || isToday ? colors.accent : colors.text.primary;
  const dotColor = allCompleted ? colors.accent : hasUpcoming ? colors.text.secondary : null;
  const dateLabel = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${dateLabel}${hasSessions ? ', has sessions' : ''}`}
      accessibilityState={{ selected: isSelected }}
      style={({ pressed }) => ({
        flex: 1,
        aspectRatio: 1,
        minHeight: CIRCLE,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.6 : isCurrentMonth ? 1 : 0.4,
      })}
    >
      <View
        style={{
          width: CIRCLE,
          height: CIRCLE,
          borderRadius: radii.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isSelected ? colors.accentSoft : 'transparent',
          borderWidth: isToday ? 2 : 0,
          borderColor: isToday ? colors.accent : 'transparent',
        }}
      >
        <Text variant={isSelected || isToday ? 'bodyStrong' : 'body'} color={textColor}>
          {dayNumber}
        </Text>
        {dotColor ? (
          <View
            style={{
              position: 'absolute',
              bottom: spacing.xs,
              width: 6,
              height: 6,
              borderRadius: radii.full,
              backgroundColor: dotColor,
            }}
          />
        ) : null}
      </View>
    </Pressable>
  );
}
