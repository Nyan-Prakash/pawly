import { useState } from 'react';
import { Keyboard, ScrollView, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { submitUserFeedback, type FeedbackType } from '@/lib/feedback';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

const FEEDBACK_OPTIONS: { value: FeedbackType; icon: AppIconName; label: string }[] = [
  { value: 'bug', icon: 'bug-outline', label: 'Something is broken' },
  { value: 'feature_request', icon: 'bulb-outline', label: 'An idea or request' },
  { value: 'general', icon: 'chatbubble-ellipses-outline', label: 'General feedback' },
];

/** Feedback sheet. Sends and closes; nothing else is shown on success. */
export function FeedbackModal({ visible, onClose }: FeedbackModalProps) {
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetState() {
    setSelectedType(null);
    setMessage('');
    setError(null);
    setIsSubmitting(false);
  }

  function handleClose() {
    if (isSubmitting) return;
    resetState();
    onClose();
  }

  async function handleSubmit() {
    if (!selectedType) {
      setError('Pick what the feedback is about.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    Keyboard.dismiss();

    try {
      await submitUserFeedback({
        feedback_type: selectedType,
        message: message.trim(),
        source_screen: 'profile',
      });
      resetState();
      onClose();
    } catch {
      setError("Couldn't send the feedback. Check your connection and try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Send feedback">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: spacing.xl, paddingBottom: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <SectionHeader title="What is it about" />
          <View accessibilityRole="radiogroup" accessibilityLabel="What is it about">
          <ListGroup>
            {FEEDBACK_OPTIONS.map((opt) => {
              const selected = selectedType === opt.value;
              return (
                <ListRow
                  key={opt.value}
                  icon={opt.icon}
                  iconTone={selected ? 'accent' : 'secondary'}
                  title={opt.label}
                  selected={selected}
                  trailing={selected ? <AppIcon name="checkmark" color={colors.accent} /> : undefined}
                  onPress={() => {
                    setSelectedType(opt.value);
                    if (error) setError(null);
                  }}
                />
              );
            })}
          </ListGroup>
          </View>
        </View>

        <Input
          label="Message (optional)"
          placeholder="What happened, or what would help"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
          maxLength={1000}
          returnKeyType="default"
        />

        {error ? (
          <Text variant="caption" color={colors.status.danger} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}

        <Button label="Send feedback" onPress={handleSubmit} loading={isSubmitting} disabled={!selectedType || isSubmitting} />
      </ScrollView>
    </BottomSheet>
  );
}
