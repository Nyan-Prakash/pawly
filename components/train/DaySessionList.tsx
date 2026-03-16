import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { formatDisplayTime } from '@/lib/scheduleEngine';
import type { PlanSession } from '@/types';

interface DaySessionListProps {
  date: Date;
  sessions: PlanSession[];
}

export const DaySessionList: React.FC<DaySessionListProps> = ({ date, sessions }) => {
  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={{ gap: spacing.md, paddingVertical: spacing.md }}>
      <Text variant="h3" style={{ marginBottom: spacing.xs }}>
        {dateLabel}
      </Text>

      {sessions.length === 0 ? (
        <View
          style={{
            padding: spacing.xl,
            alignItems: 'center',
            backgroundColor: colors.bg.surfaceAlt,
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: colors.border.soft,
            borderStyle: 'dashed',
          }}
        >
          <Text color={colors.text.secondary}>No sessions scheduled for this day</Text>
        </View>
      ) : (
        sessions.map((session) => (
          <TouchableOpacity
            key={session.id}
            activeOpacity={0.8}
            onPress={() => router.push(`/(tabs)/train/session?id=${session.id}`)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.bg.surface,
              borderRadius: radii.lg,
              padding: spacing.md,
              gap: spacing.md,
              borderWidth: 1,
              borderColor: colors.border.default,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: session.isCompleted
                  ? colors.brand.primary + '20'
                  : colors.brand.secondary + '20',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons
                name={session.isCompleted ? 'checkmark' : 'play'}
                size={20}
                color={session.isCompleted ? colors.brand.primary : colors.brand.secondary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{session.title}</Text>
              <Text variant="caption" color={colors.text.secondary}>
                {session.scheduledTime ? formatDisplayTime(session.scheduledTime) : 'Not timed'} · {session.durationMinutes} min
              </Text>
            </View>

            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <View
                style={{
                  backgroundColor: session.isCompleted
                    ? colors.status.successBg
                    : colors.status.warningBg,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: radii.pill,
                }}
              >
                <Text
                  variant="micro"
                  style={{
                    color: session.isCompleted ? colors.brand.primary : colors.brand.secondary,
                    fontWeight: '700',
                  }}
                >
                  {session.isCompleted ? 'COMPLETED' : 'UPCOMING'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};
