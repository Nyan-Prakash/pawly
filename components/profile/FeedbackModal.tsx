import { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { submitUserFeedback, type FeedbackType } from '@/lib/feedback';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

const FEEDBACK_OPTIONS: {
  value: FeedbackType;
  icon: AppIconName;
  label: string;
}[] = [
  {
    value: 'bug',
    icon: 'bug',
    label: 'Bug Report',
  },
  {
    value: 'feature_request',
    icon: 'star',
    label: 'Feature Request',
  },
  {
    value: 'general',
    icon: 'chatbubble-ellipses',
    label: 'General Feedback',
  },
];

export function FeedbackModal({ visible, onClose }: FeedbackModalProps) {
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetState() {
    setSelectedType(null);
    setMessage('');
    setError(null);
    setIsSubmitting(false);
    setIsSuccess(false);
  }

  function handleClose() {
    if (isSubmitting) return;
    resetState();
    onClose();
  }

  async function handleSubmit() {
    if (!selectedType) {
      setError('Please select a feedback type.');
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
      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError('Failed to send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}
          onPress={handleClose}
        >
          <Pressable onPress={Keyboard.dismiss}>
            <View
              style={{
                backgroundColor: colors.bg.surface,
                borderTopLeftRadius: radii.lg,
                borderTopRightRadius: radii.lg,
                paddingTop: spacing.sm,
                paddingHorizontal: spacing.lg,
                paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
              }}
            >
              {/* Drag handle */}
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.border.default,
                  alignSelf: 'center',
                  marginBottom: spacing.lg,
                }}
              />

              {isSuccess ? (
                <View style={{ alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.md }}>
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      backgroundColor: colors.brand.primary + '20',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AppIcon name="checkmark" size={32} color={colors.brand.primary} />
                  </View>
                  <Text variant="h2" style={{ textAlign: 'center' }}>Thank you!</Text>
                  <Text color={colors.text.secondary} style={{ textAlign: 'center' }}>
                    Your feedback helps us make Pawly better for everyone.
                  </Text>
                </View>
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <Text variant="h2" style={{ marginBottom: spacing.xs }}>
                    Send Feedback
                  </Text>
                  <Text variant="body" color={colors.text.secondary} style={{ marginBottom: spacing.lg }}>
                    Tell us what's working, what's broken, or what you'd like to see.
                  </Text>

                  {/* Type options */}
                  <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
                    <Text variant="micro" color={colors.text.secondary} style={{ fontWeight: '600' }}>
                      FEEDBACK TYPE
                    </Text>
                    {FEEDBACK_OPTIONS.map((opt) => {
                      const selected = selectedType === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          activeOpacity={0.8}
                          onPress={() => setSelectedType(opt.value)}
                          style={{
                            backgroundColor: selected ? colors.brand.primary + '10' : colors.bg.surface,
                            borderWidth: 1.5,
                            borderColor: selected ? colors.brand.primary : colors.border.default,
                            borderRadius: radii.md,
                            padding: spacing.md,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: spacing.md,
                          }}
                        >
                          <AppIcon
                            name={opt.icon}
                            size={24}
                            color={selected ? colors.brand.primary : colors.text.secondary}
                          />
                          <Text
                            variant="bodyStrong"
                            color={selected ? colors.brand.primary : colors.text.primary}
                          >
                            {opt.label}
                          </Text>
                          {selected && (
                            <View style={{ marginLeft: 'auto' }}>
                              <AppIcon name="checkmark-circle" size={20} color={colors.brand.primary} />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Message input */}
                  <Input
                    label="MESSAGE (OPTIONAL)"
                    placeholder="Tell us more..."
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    numberOfLines={4}
                    maxLength={1000}
                    style={{ marginBottom: spacing.lg }}
                  />

                  {/* Error */}
                  {error && (
                    <Text color={colors.error} variant="caption" style={{ marginBottom: spacing.md }}>
                      {error}
                    </Text>
                  )}

                  {/* Actions */}
                  <View style={{ gap: spacing.sm }}>
                    <Button
                      label={isSubmitting ? 'Sending...' : 'Submit Feedback'}
                      onPress={handleSubmit}
                      loading={isSubmitting}
                      disabled={!selectedType || isSubmitting}
                    />
                    <Button
                      label="Cancel"
                      variant="ghost"
                      onPress={handleClose}
                      disabled={isSubmitting}
                    />
                  </View>
                </ScrollView>
              )}
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
