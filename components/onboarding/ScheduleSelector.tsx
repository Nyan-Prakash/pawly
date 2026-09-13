import { View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { haptics } from '@/lib/haptics';
import type { Weekday } from '@/types';

const DAYS: { id: Weekday; label: string }[] = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

type TimeOption = {
  id: string;
  label: string;
  subtitle: string;
  icon: AppIconName;
};

const TIME_OPTIONS: TimeOption[] = [
  { id: 'morning', label: 'Morning', subtitle: '6am to 12pm', icon: 'sunny-outline' },
  { id: 'afternoon', label: 'Afternoon', subtitle: '12pm to 5pm', icon: 'partly-sunny-outline' },
  { id: 'evening', label: 'Evening', subtitle: '5pm to 9pm', icon: 'moon-outline' },
  { id: 'flexible', label: 'Flexible', subtitle: 'Whenever there is time', icon: 'time-outline' },
];

type ScheduleSelectorProps = {
  selectedDays: Weekday[];
  onToggleDay: (day: Weekday) => void;
  selectedTimeWindow?: string | null;
  onSelectTimeWindow?: (window: string) => void;
};

function Check() {
  return <AppIcon name="checkmark" size={20} color={colors.accent} />;
}

/** Day and time-of-day pickers as inset grouped lists (44 pt+ rows). */
export function ScheduleSelector({
  selectedDays,
  onToggleDay,
  selectedTimeWindow,
  onSelectTimeWindow,
}: ScheduleSelectorProps) {
  const showTime = Boolean(onSelectTimeWindow);

  return (
    <View style={{ gap: spacing.xl }}>
      <View>
        {showTime ? <SectionHeader title="Days" /> : null}
        <ListGroup>
          {DAYS.map((day) => {
            const isSelected = selectedDays.includes(day.id);
            return (
              <ListRow
                key={day.id}
                title={day.label}
                selected={isSelected}
                trailing={isSelected ? <Check /> : undefined}
                accessibilityHint={isSelected ? 'Selected' : 'Not selected'}
                onPress={() => {
                  haptics.selection();
                  onToggleDay(day.id);
                }}
              />
            );
          })}
        </ListGroup>
      </View>

      {showTime ? (
        <View>
          <SectionHeader title="Time of day" />
          <ListGroup>
            {TIME_OPTIONS.map((opt) => {
              const isSelected = selectedTimeWindow === opt.id;
              return (
                <ListRow
                  key={opt.id}
                  icon={opt.icon}
                  iconTone={isSelected ? 'accent' : 'secondary'}
                  title={opt.label}
                  subtitle={opt.subtitle}
                  selected={isSelected}
                  trailing={isSelected ? <Check /> : undefined}
                  onPress={() => {
                    haptics.selection();
                    onSelectTimeWindow?.(opt.id);
                  }}
                />
              );
            })}
          </ListGroup>
        </View>
      ) : null}
    </View>
  );
}
