import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radii } from '@/constants/radii';
import type { Weekday } from '@/types';

const DAYS: { id: Weekday; label: string }[] = [
  { id: 'monday', label: 'Mo' },
  { id: 'tuesday', label: 'Tu' },
  { id: 'wednesday', label: 'We' },
  { id: 'thursday', label: 'Th' },
  { id: 'friday', label: 'Fr' },
  { id: 'saturday', label: 'Sa' },
  { id: 'sunday', label: 'Su' },
];

type TimeOption = {
  id: string;
  label: string;
  subtitle: string;
  icon: AppIconName;
};

const TIME_OPTIONS: TimeOption[] = [
  { id: 'morning', label: 'Morning', subtitle: '6am – 12pm', icon: 'sunny' },
  { id: 'afternoon', label: 'Afternoon', subtitle: '12 – 5pm', icon: 'partly-sunny' },
  { id: 'evening', label: 'Evening', subtitle: '5 – 9pm', icon: 'moon' },
  { id: 'flexible', label: 'Flexible', subtitle: "I'll train when I can", icon: 'time' },
];

type ScheduleSelectorProps = {
  selectedDays: Weekday[];
  onToggleDay: (day: Weekday) => void;
  selectedTimeWindow?: string | null;
  onSelectTimeWindow?: (window: string) => void;
};

export function ScheduleSelector({
  selectedDays,
  onToggleDay,
  selectedTimeWindow,
  onSelectTimeWindow,
}: ScheduleSelectorProps) {
  return (
    <View style={{ gap: spacing.xl }}>
      {/* Day grid */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 4 }}>
        {DAYS.map((day) => {
          const isSelected = selectedDays.includes(day.id);
          return (
            <Pressable
              key={day.id}
              onPress={() => onToggleDay(day.id)}
              style={{
                flex: 1,
                aspectRatio: 1,
                maxWidth: 44,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 22,
                backgroundColor: isSelected ? colors.brand.primary : colors.bg.surface,
                borderWidth: isSelected ? 0 : 1.5,
                borderColor: colors.border.default,
              }}
            >
              <Text
                variant="micro"
                style={{
                  fontWeight: '700',
                  fontSize: 11,
                  color: isSelected ? '#FFFFFF' : colors.text.secondary,
                }}
              >
                {day.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Time of day grid (optional) */}
      {onSelectTimeWindow && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {TIME_OPTIONS.map((opt) => {
            const isSelected = selectedTimeWindow === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => onSelectTimeWindow(opt.id)}
                style={{
                  width: '47.5%',
                  borderRadius: radii.md,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? colors.brand.primary : colors.border.default,
                  backgroundColor: isSelected
                    ? `${colors.brand.primary}12`
                    : colors.bg.surface,
                  padding: spacing.md,
                  gap: 6,
                  alignItems: 'flex-start',
                }}
              >
                <AppIcon
                  name={opt.icon}
                  size={22}
                  color={isSelected ? colors.brand.primary : colors.text.secondary}
                />
                <Text
                  variant="bodyStrong"
                  style={{
                    fontWeight: '600',
                    color: isSelected ? colors.brand.primary : colors.text.primary,
                  }}
                >
                  {opt.label}
                </Text>
                <Text variant="caption" color={colors.text.secondary}>
                  {opt.subtitle}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
