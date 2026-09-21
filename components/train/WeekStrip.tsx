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

const STATE_WORDS: Record<WeekDayState, string> = {
  done: 'all sessions done',
  today: 'today',
  todayDone: 'today, all sessions done',
  missed: 'missed session',
  scheduled: 'session planned',
  none: 'nothing planned',
};

/** "Monday, September 14, missed session". `key` is a local YYYY-MM-DD. */
function dayA11yLabel(day: WeekDay): string {
  const [y, m, d] = day.key.split('-').map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  const name = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  return `${name}, ${STATE_WORDS[day.state]}`;
}

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
    <View
      accessible
      accessibilityLabel={dayA11yLabel(day)}
      style={{ alignItems: 'center', gap: spacing.sm, flex: 1 }}
    >
      <Text variant="label" color={isToday ? colors.text.primary : colors.text.secondary}>
        {day.label}
      </Text>
      <View
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
