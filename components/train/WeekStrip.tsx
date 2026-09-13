import { View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';

export type WeekDayState =
  | 'done'       // all sessions that day completed
  | 'today'      // today, session still open
  | 'todayDone'  // today, already finished
  | 'missed'     // past day with an incomplete session
  | 'scheduled'  // future day with a session
  | 'none';      // nothing planned

export type WeekDay = {
  key: string;
  label: string;      // "M", "T", ...
  dayNumber: number;  // 1–31
  state: WeekDayState;
};

type WeekStripProps = {
  days: WeekDay[];
};

const DOT = 40;

function DayDot({ day }: { day: WeekDay }) {
  let fill = colors.bg.fill;
  let ring: string | null = null;
  let textColor = colors.text.secondary;
  let showCheck = false;

  switch (day.state) {
    case 'done':
      fill = colors.accent;
      showCheck = true;
      break;
    case 'todayDone':
      fill = colors.accent;
      ring = colors.accent;
      showCheck = true;
      break;
    case 'today':
      fill = colors.bg.surface;
      ring = colors.accent;
      textColor = colors.accent;
      break;
    case 'missed':
      fill = colors.status.warningSoft;
      textColor = colors.status.warning;
      break;
    case 'scheduled':
      fill = colors.accentSoft;
      textColor = colors.accent;
      break;
    case 'none':
    default:
      break;
  }

  const isToday = day.state === 'today' || day.state === 'todayDone';

  return (
    <View style={{ alignItems: 'center', gap: spacing.sm, flex: 1 }}>
      <Text variant="label" color={isToday ? colors.text.primary : colors.text.secondary}>
        {day.label}
      </Text>
      <View
        accessibilityLabel={`${day.label} ${day.dayNumber}, ${day.state === 'none' ? 'nothing planned' : day.state}`}
        style={{
          width: DOT,
          height: DOT,
          borderRadius: radii.full,
          backgroundColor: fill,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: ring ? 2 : 0,
          borderColor: ring ?? 'transparent',
        }}
      >
        {showCheck ? (
          <AppIcon name="checkmark" size={20} color={colors.text.onAccent} />
        ) : (
          <Text variant="captionStrong" color={textColor}>
            {day.dayNumber}
          </Text>
        )}
      </View>
    </View>
  );
}

/** Monday to Sunday row of day dots. Not tappable; a glance at the week. */
export function WeekStrip({ days }: WeekStripProps) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      {days.map((day) => (
        <DayDot key={day.key} day={day} />
      ))}
    </View>
  );
}
