import React, { useEffect, useMemo, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { getMonthGrid, toDateKey, getDayStatus } from '@/lib/calendarSessions';
import { CalendarDayCell } from './CalendarDayCell';
import type { PlanSession } from '@/types';

interface TrainingCalendarProps {
  groupedSessions: Record<string, PlanSession[]>;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const TrainingCalendar: React.FC<TrainingCalendarProps> = ({
  groupedSessions,
  selectedDate,
  onDateSelect,
}) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  useEffect(() => {
    setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [selectedDate]);

  const monthGrid = useMemo(() => {
    return getMonthGrid(viewDate.getFullYear(), viewDate.getMonth());
  }, [viewDate]);

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const selectedDateKey = toDateKey(selectedDate);

  return (
    <View style={{ backgroundColor: colors.bg.surface, borderRadius: 24, padding: spacing.md }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.lg,
          paddingHorizontal: spacing.xs,
        }}
      >
        <Text variant="h3">{monthLabel}</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <TouchableOpacity
            onPress={prevMonth}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.bg.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={nextMonth}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.bg.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekday labels */}
      <View style={{ flexDirection: 'row', marginBottom: spacing.sm }}>
        {WEEKDAYS.map((day) => (
          <Text
            key={day}
            variant="micro"
            color={colors.text.secondary}
            style={{ flex: 1, textAlign: 'center', fontWeight: '700' }}
          >
            {day}
          </Text>
        ))}
      </View>

      {/* Month grid */}
      <View style={{ gap: 2 }}>
        {monthGrid.map((week, weekIdx) => (
          <View key={weekIdx} style={{ flexDirection: 'row' }}>
            {week.map((day) => {
              const status = getDayStatus(day.dateKey, groupedSessions);
              return (
                <CalendarDayCell
                  key={day.dateKey}
                  date={day.date}
                  isCurrentMonth={day.isCurrentMonth}
                  isToday={day.isToday}
                  isSelected={day.dateKey === selectedDateKey}
                  hasSessions={status.hasSessions}
                  allCompleted={status.allCompleted}
                  hasUpcoming={status.hasUpcoming}
                  onPress={() => onDateSelect(day.date)}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};
