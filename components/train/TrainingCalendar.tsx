import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { IconButton } from '@/components/ui/IconButton';
import { Text } from '@/components/ui/Text';
import { spacing } from '@/constants/spacing';
import { getDayStatus, getMonthGrid, toDateKey } from '@/lib/calendarSessions';
import type { PlanSession } from '@/types';

import { CalendarDayCell } from './CalendarDayCell';

interface TrainingCalendarProps {
  groupedSessions: Record<string, PlanSession[]>;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Month grid with native-feeling month navigation. Sits directly on the page. */
export function TrainingCalendar({ groupedSessions, selectedDate, onDateSelect }: TrainingCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  useEffect(() => {
    setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [selectedDate]);

  const monthGrid = useMemo(
    () => getMonthGrid(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate],
  );

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const selectedDateKey = toDateKey(selectedDate);

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="h2">{monthLabel}</Text>
        <View style={{ flexDirection: 'row' }}>
          <IconButton icon="chevron-back" accessibilityLabel="Previous month" tone="primary" onPress={prevMonth} />
          <IconButton icon="chevron-forward" accessibilityLabel="Next month" tone="primary" onPress={nextMonth} />
        </View>
      </View>

      <View style={{ flexDirection: 'row' }}>
        {WEEKDAYS.map((day) => (
          <Text key={day} variant="label" style={{ flex: 1, textAlign: 'center' }}>
            {day}
          </Text>
        ))}
      </View>

      <View>
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
}
