import React from 'react';
import { TouchableOpacity, View } from 'react-native';
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
  accentColor: string;
  onPress: () => void;
}

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  hasSessions,
  allCompleted,
  hasUpcoming,
  accentColor,
  onPress,
}) => {
  const dayNumber = date.getDate();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flex: 1,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.md,
        backgroundColor: isSelected
          ? accentColor
          : 'transparent',
        opacity: isCurrentMonth ? 1 : 0.3,
        margin: 2,
        position: 'relative',
        borderWidth: isToday && !isSelected ? 1.5 : 0,
        borderColor: accentColor,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: isToday || isSelected ? '700' : '400',
          color: isSelected
            ? '#FFF'
            : isToday
              ? accentColor
              : colors.text.primary,
        }}
      >
        {dayNumber}
      </Text>

      {hasSessions && (
        <View
          style={{
            position: 'absolute',
            bottom: 4,
            flexDirection: 'row',
            gap: 2
          }}
        >
          {allCompleted ? (
            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: isSelected ? '#FFF' : accentColor
              }}
            />
          ) : hasUpcoming ? (
            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: isSelected ? '#FFF' : colors.brand.secondary
              }}
            />
          ) : null}
        </View>
      )}
    </TouchableOpacity>
  );
};
