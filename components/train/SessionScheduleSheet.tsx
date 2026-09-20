import { useMemo, useRef } from 'react';
import { ScrollView, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { formatDisplayTime } from '@/lib/scheduleEngine';
import { getMoveDateOptions, parseDateKey, toDateKey, type MoveDateOption } from '@/lib/sessionReschedule';
import type { EnrichedPlanSession } from '@/types';

interface SessionScheduleSheetProps {
  /** The session being changed. The sheet is open while this is set. */
  session: EnrichedPlanSession | null;
  /** Every calendar session by date, to show which days already hold one. */
  groupedSessions: Record<string, EnrichedPlanSession[]>;
  /** A change is being saved; rows are disabled. */
  busy: boolean;
  error?: string;
  onMove: (dateKey: string) => void;
  onSkip: () => void;
  onClose: () => void;
}

function formatDay(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function optionTitle(option: MoveDateOption, tomorrowKey: string): string {
  if (option.isToday) return 'Today';
  if (option.dateKey === tomorrowKey) return 'Tomorrow';
  return formatDay(option.date);
}

/** Move a session to one of the next seven days, or skip it for now. */
export function SessionScheduleSheet({
  session: openSession,
  groupedSessions,
  busy,
  error,
  onMove,
  onSkip,
  onClose,
}: SessionScheduleSheetProps) {
  // Keep the last session on screen while the sheet slides away.
  const lastSession = useRef<EnrichedPlanSession | null>(null);
  if (openSession) lastSession.current = openSession;
  const session = openSession ?? lastSession.current;

  const options = useMemo(() => (session ? getMoveDateOptions(session) : []), [session]);

  const now = new Date();
  const todayKey = toDateKey(now);
  const tomorrowKey = toDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));

  const scheduledDate = session?.scheduledDate ? parseDateKey(session.scheduledDate) : null;
  const isMissed = !!session?.scheduledDate && session.scheduledDate < todayKey;
  const when = scheduledDate
    ? [
        `${isMissed ? 'Missed on' : 'Planned for'} ${formatDay(scheduledDate)}`,
        session?.scheduledTime ? formatDisplayTime(session.scheduledTime) : null,
      ]
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <BottomSheet visible={!!openSession} onClose={onClose} title={session?.title ?? ''} padded={false}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.xl }}>
        <View style={{ gap: spacing.sm }}>
          {when ? <Text variant="caption">{when}</Text> : null}
          {error ? (
            <Text variant="caption" color={colors.status.danger} accessibilityLiveRegion="polite">
              {error}
            </Text>
          ) : null}
        </View>

        <View>
          <SectionHeader title="Move to another day" />
          <ListGroup>
            {options.map((option) => {
              const planned = (groupedSessions[option.dateKey] ?? []).filter((item) => !item.isCompleted).length;
              return (
                <ListRow
                  key={option.dateKey}
                  title={optionTitle(option, tomorrowKey)}
                  subtitle={
                    planned > 0
                      ? `${planned} ${planned === 1 ? 'session' : 'sessions'} already planned`
                      : undefined
                  }
                  disabled={busy}
                  onPress={() => onMove(option.dateKey)}
                  accessibilityHint="Moves the session to this day"
                />
              );
            })}
          </ListGroup>
        </View>

        <ListGroup>
          <ListRow
            icon="play-skip-forward-outline"
            iconTone="secondary"
            title="Skip for now"
            subtitle="Moves to your next training day. Later sessions shift back."
            disabled={busy}
            onPress={onSkip}
          />
        </ListGroup>
      </ScrollView>
    </BottomSheet>
  );
}
