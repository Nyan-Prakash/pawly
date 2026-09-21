// ─────────────────────────────────────────────────────────────────────────────
// SessionModePicker
//
// Shown from the session intro when the course supports the live coach.
// The handler picks how to train, then starts the session.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { Text } from '@/components/ui/Text';
import { LIVE_COACH_AI_DISCLAIMER } from '@/constants/safety';
import { spacing } from '@/constants/spacing';
import { haptics } from '@/lib/haptics';

type SessionMode = 'live' | 'manual';

interface SessionModePickerProps {
  dogName: string;
  /** Start in manual mode. */
  onNormal: () => void;
  /** Start with the live coach (camera). */
  onCamera: () => void;
  /** Return to the session overview. */
  onBack: () => void;
}

export function SessionModePicker({ dogName, onNormal, onCamera, onBack }: SessionModePickerProps) {
  const [mode, setMode] = useState<SessionMode>('live');

  const select = (next: SessionMode) => {
    if (next !== mode) haptics.selection();
    setMode(next);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm }}>
        <IconButton icon="close" accessibilityLabel="Back to the session overview" tone="secondary" onPress={onBack} />
      </View>

      <View style={{ flex: 1, padding: spacing.lg, gap: spacing.xl }}>
        <View style={{ gap: spacing.sm }}>
          <Text variant="h1" accessibilityRole="header">
            How do you want to train?
          </Text>
          <Text variant="body">
            The coach uses the camera to count reps and give feedback as you train.
          </Text>
        </View>

        <View accessibilityRole="radiogroup">
        <ListGroup>
          <ListRow
            icon="videocam-outline"
            title="Train with the live coach"
            subtitle={`Needs the camera pointed at ${dogName} and a steady spot for your phone`}
            selected={mode === 'live'}
            onPress={() => select('live')}
            accessibilityHint="Uses the camera during the session"
          />
          <ListRow
            icon="list-outline"
            title="Train manually"
            subtitle="Follow the steps and count reps yourself"
            selected={mode === 'manual'}
            onPress={() => select('manual')}
          />
        </ListGroup>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="caption">You can switch to manual at any point in the session.</Text>
          <Text variant="caption">
            Camera frames are sent for analysis while the live coach is on and are not saved. No audio is recorded.
          </Text>
          <Text variant="caption">{LIVE_COACH_AI_DISCLAIMER}</Text>
        </View>
      </View>

      <View style={{ padding: spacing.lg }}>
        <Button label="Start session" onPress={mode === 'live' ? onCamera : onNormal} />
      </View>
    </View>
  );
}
