import { View } from 'react-native';
import { router } from 'expo-router';

import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { formatDisplayTime, getBehaviorLabel } from '@/lib/scheduleEngine';
import type { EnrichedPlanSession, PlanSession, SupportSessionType } from '@/types';
import { guardSessionStart } from '@/lib/proGate';

function supportSessionLabel(type: SupportSessionType | null | undefined): string {
  switch (type) {
    case 'foundation':        return 'Added by the coach for foundation practice';
    case 'transition':        return 'Added by the coach for lower-distraction practice';
    case 'duration_building': return 'Added by the coach to build duration';
    case 'calm_reset':        return 'Added by the coach as a calm reset';
    default:                  return 'Added by the coach';
  }
}

function isEnriched(session: PlanSession | EnrichedPlanSession): session is EnrichedPlanSession {
  return 'planId' in session;
}

interface DaySessionListProps {
  date: Date;
  sessions: (PlanSession | EnrichedPlanSession)[];
  /** Name the course on each row (used when multiple plans are active). */
  showCourseBadge?: boolean;
}

/** The selected day's sessions as a grouped list under the calendar. */
export function DaySessionList({ date, sessions, showCourseBadge = false }: DaySessionListProps) {
  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View>
      <SectionHeader title={dateLabel} />

      {sessions.length === 0 ? (
        <Text variant="caption">No sessions</Text>
      ) : (
        <ListGroup>
          {sessions.map((session, idx) => {
            const enriched = isEnriched(session) ? session : null;
            const courseLabel = enriched
              ? enriched.planCourseTitle ?? getBehaviorLabel(enriched.planGoal)
              : null;
            const when = session.scheduledTime ? formatDisplayTime(session.scheduledTime) : 'Not timed';
            const parts = [showCourseBadge && courseLabel ? courseLabel : null, when, `${session.durationMinutes} min`]
              .filter(Boolean)
              .join(', ');
            const subtitle = session.insertedByAdaptation
              ? `${parts}\n${supportSessionLabel(session.supportSessionType)}`
              : parts;

            return (
              <ListRow
                key={enriched ? `${enriched.planId}_${session.id}` : `${idx}_${session.id}`}
                icon={session.isCompleted ? 'checkmark-circle' : 'play-circle-outline'}
                iconTone={session.isCompleted ? 'accent' : 'secondary'}
                title={session.title}
                subtitle={subtitle}
                trailing="chevron"
                onPress={() => {
                  if (!guardSessionStart(enriched?.planId, session.id)) return;
                  router.push(
                    enriched
                      ? `/(tabs)/train/session?id=${session.id}&planId=${enriched.planId}`
                      : `/(tabs)/train/session?id=${session.id}`,
                  );
                }}
              />
            );
          })}
        </ListGroup>
      )}
    </View>
  );
}
