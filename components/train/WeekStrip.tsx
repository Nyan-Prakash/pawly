import { View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { hexToRgba } from '@/constants/courseColors';
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

const DOT = 36;

function DayDot({ day }: { day: WeekDay }) {
  const green = colors.brand.primary;
  const amber = colors.brand.secondary;

  let fill = colors.bg.sand;
  let ring: string | null = null;
  let content: React.ReactNode = (
    <Text
      variant="caption"
      style={{ fontWeight: '700', color: colors.text.secondary }}
    >
      {day.dayNumber}
    </Text>
  );

  switch (day.state) {
    case 'done':
    case 'todayDone':
      fill = green;
      content = <AppIcon name="checkmark" size={18} color="#fff" />;
      if (day.state === 'todayDone') ring = green;
      break;
    case 'today':
      fill = colors.bg.surface;
      ring = green;
      content = (
        <Text variant="caption" style={{ fontWeight: '800', color: green }}>
          {day.dayNumber}
        </Text>
      );
      break;
    case 'missed':
      fill = hexToRgba(amber, 0.16);
      content = (
        <Text variant="caption" style={{ fontWeight: '700', color: amber }}>
          {day.dayNumber}
        </Text>
      );
      break;
    case 'scheduled':
      fill = hexToRgba(green, 0.12);
      content = (
        <Text variant="caption" style={{ fontWeight: '700', color: green }}>
          {day.dayNumber}
        </Text>
      );
      break;
    case 'none':
    default:
      break;
  }

  const isToday = day.state === 'today' || day.state === 'todayDone';

  return (
    <View style={{ alignItems: 'center', gap: spacing.sm, flex: 1 }}>
      <Text
        variant="micro"
        style={{
          fontWeight: isToday ? '800' : '600',
          color: isToday ? colors.text.primary : colors.text.secondary,
        }}
      >
        {day.label}
      </Text>
      <View
        style={{
          width: DOT,
          height: DOT,
          borderRadius: DOT / 2,
          backgroundColor: fill,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: ring ? 2 : 0,
          borderColor: ring ?? 'transparent',
        }}
      >
        {content}
      </View>
    </View>
  );
}

/** Mon–Sun row of day dots — the at-a-glance habit calendar. */
export function WeekStrip({ days }: WeekStripProps) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      {days.map((day) => (
        <DayDot key={day.key} day={day} />
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

type StatProps = {
  value: string | number;
  label: string;
  icon?: React.ComponentProps<typeof AppIcon>['name'];
  tint?: string;
};

function Stat({ value, label, icon, tint }: StatProps) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
        {icon ? <AppIcon name={icon} size={18} color={tint ?? colors.text.primary} /> : null}
        {/* Value dominates; the label underneath is deliberately quiet. */}
        <Text
          variant="h2"
          style={{ color: tint ?? colors.text.primary, letterSpacing: -0.4 }}
        >
          {value}
        </Text>
      </View>
      <Text variant="micro" style={{ color: colors.text.secondary, fontWeight: '600' }}>
        {label}
      </Text>
    </View>
  );
}

type StatRowProps = {
  streak: number;
  thisWeekDone: number;
  thisWeekPlanned: number;
  total: number;
};

/** Three-up stat row: streak · this week · all time. */
export function StatRow({ streak, thisWeekDone, thisWeekPlanned, total }: StatRowProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: spacing.md,
        marginTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border.soft,
      }}
    >
      <Stat
        value={streak}
        label={streak === 1 ? 'day streak' : 'day streak'}
        icon="flame"
        tint={streak > 0 ? colors.brand.secondary : colors.text.secondary}
      />
      <Divider />
      <Stat
        value={thisWeekPlanned > 0 ? `${thisWeekDone}/${thisWeekPlanned}` : thisWeekDone}
        label="this week"
      />
      <Divider />
      <Stat value={total} label="sessions" />
    </View>
  );
}

function Divider() {
  return <View style={{ width: 1, height: 28, backgroundColor: colors.border.soft }} />;
}
