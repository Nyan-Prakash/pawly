import { useRef, useState } from 'react';
import { Keyboard, ScrollView, TextInput, View } from 'react-native';

import type { AppIconName } from '@/components/ui/AppIcon';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { haptics } from '@/lib/haptics';

type WalkQuality = 1 | 2 | 3;

interface WalkLogModalProps {
  visible: boolean;
  dogName: string;
  walkGoalText: string;
  onSave: (quality: WalkQuality, notes?: string, durationMinutes?: number) => Promise<void>;
  onSkip: () => void;
  onClose: () => void;
}

const QUALITY_OPTIONS: { value: WalkQuality; icon: AppIconName; label: string }[] = [
  { value: 3, icon: 'thumbs-up-outline', label: 'Better than before' },
  { value: 2, icon: 'remove-circle-outline', label: 'About the same' },
  { value: 1, icon: 'alert-circle-outline', label: 'Harder today' },
];

/** "Log a walk" sheet: how it went, optional notes and minutes. */
export function WalkLogModal({
  visible,
  dogName,
  walkGoalText,
  onSave,
  onSkip,
  onClose,
}: WalkLogModalProps) {
  const [selectedQuality, setSelectedQuality] = useState<WalkQuality | null>(null);
  const [notes, setNotes] = useState('');
  const [durationText, setDurationText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const durationRef = useRef<TextInput>(null);

  function resetState() {
    setSelectedQuality(null);
    setNotes('');
    setDurationText('');
    setError(null);
    setIsSaving(false);
  }

  function handleClose() {
    resetState();
    onClose();
  }

  function handleSkip() {
    resetState();
    onSkip();
  }

  function selectQuality(value: WalkQuality) {
    haptics.selection();
    setSelectedQuality(value);
    setError(null);
  }

  async function handleSave() {
    if (!selectedQuality) {
      setError('Pick how the walk went, then save.');
      return;
    }
    setError(null);
    setIsSaving(true);
    Keyboard.dismiss();

    try {
      const duration = durationText ? parseInt(durationText, 10) : undefined;
      await onSave(selectedQuality, notes.trim() || undefined, duration);
      resetState();
    } catch {
      setError("Couldn't save the walk. Check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Log a walk" padded={false}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: spacing.xs }}>
          <Text variant="captionStrong">{dogName}'s walk goal</Text>
          <Text variant="body">{walkGoalText}</Text>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="captionStrong">How was the walk?</Text>
          <ListGroup>
            {QUALITY_OPTIONS.map((opt) => (
              <ListRow
                key={opt.value}
                icon={opt.icon}
                iconTone={selectedQuality === opt.value ? 'accent' : 'secondary'}
                title={opt.label}
                selected={selectedQuality === opt.value}
                onPress={() => selectQuality(opt.value)}
                accessibilityHint="Selects how the walk went"
              />
            ))}
          </ListGroup>
        </View>

        <Input
          label="What happened? (optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="She pulled a lot near the park gate"
          multiline
          numberOfLines={2}
          maxLength={280}
          returnKeyType="next"
          blurOnSubmit
          onSubmitEditing={() => durationRef.current?.focus()}
        />

        <Input
          ref={durationRef}
          label="Minutes walked (optional)"
          value={durationText}
          onChangeText={(t) => setDurationText(t.replace(/[^0-9]/g, ''))}
          placeholder="20"
          keyboardType="number-pad"
          returnKeyType="done"
          maxLength={3}
          onSubmitEditing={Keyboard.dismiss}
        />

        {error ? (
          <Text variant="caption" color={colors.status.danger} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}
      </ScrollView>

      <View style={{ padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm, backgroundColor: colors.bg.app }}>
        <Button label="Save walk" onPress={handleSave} loading={isSaving} disabled={!selectedQuality} />
        <Button label="Not today" variant="ghost" size="md" onPress={handleSkip} />
      </View>
    </BottomSheet>
  );
}
