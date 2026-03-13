import { useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';

type WalkQuality = 1 | 2 | 3;

interface WalkLogModalProps {
  visible: boolean;
  dogName: string;
  walkGoalText: string;
  onSave: (quality: WalkQuality, notes?: string, durationMinutes?: number) => Promise<void>;
  onSkip: () => void;
  onClose: () => void;
}

const QUALITY_OPTIONS: {
  value: WalkQuality;
  icon: AppIconName;
  label: string;
  bg: string;
  border: string;
  textColor: string;
}[] = [
  {
    value: 3,
    icon: 'thumbs-up',
    label: 'Better than before',
    bg: '#DCFCE7',
    border: colors.brand.primary,
    textColor: '#166534',
  },
  {
    value: 2,
    icon: 'remove-circle',
    label: 'About the same',
    bg: colors.bg.surfaceAlt,
    border: colors.border.default,
    textColor: colors.text.primary,
  },
  {
    value: 1,
    icon: 'warning',
    label: 'Harder today',
    bg: '#FFF1F2',
    border: '#FECACA',
    textColor: '#9F1239',
  },
];

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

  async function handleSave() {
    if (!selectedQuality) {
      setError('Please select how the walk went.');
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
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
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
                paddingBottom: spacing.xl + spacing.xl,
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

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Header */}
                <Text variant="h2" style={{ marginBottom: spacing.sm }}>
                  How was the walk?
                </Text>

                {/* Walk goal reminder */}
                <View
                  style={{
                    backgroundColor: colors.bg.surfaceAlt,
                    borderRadius: radii.md,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    marginBottom: spacing.lg,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                  }}
                >
                  <AppIcon name="walk" size={16} color={colors.text.primary} />
                  <View style={{ flex: 1 }}>
                    <Text variant="micro" color={colors.text.secondary}>
                      {dogName}'s walk goal
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.text.primary, lineHeight: 18, marginTop: 2 }}>
                      {walkGoalText}
                    </Text>
                  </View>
                </View>

                {/* Quality options */}
                <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
                  {QUALITY_OPTIONS.map((opt) => {
                    const selected = selectedQuality === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        activeOpacity={0.8}
                        onPress={() => setSelectedQuality(opt.value)}
                        style={{
                          backgroundColor: selected ? opt.bg : colors.bg.surface,
                          borderWidth: selected ? 2 : 1,
                          borderColor: selected ? opt.border : colors.border.default,
                          borderRadius: radii.md,
                          padding: spacing.md,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: spacing.md,
                          minHeight: 64,
                        }}
                      >
                        <AppIcon name={opt.icon} size={28} color={selected ? opt.textColor : colors.text.secondary} />
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: selected ? '700' : '500',
                            color: selected ? opt.textColor : colors.text.primary,
                          }}
                        >
                          {opt.label}
                        </Text>
                        {selected && (
                          <View style={{ marginLeft: 'auto' }}>
                            <AppIcon name="checkmark" size={18} color={opt.border} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Notes input */}
                <View style={{ marginBottom: spacing.md }}>
                  <Text variant="micro" color={colors.text.secondary} style={{ marginBottom: 6 }}>
                    What happened? (optional)
                  </Text>
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="e.g. She pulled a lot near the park gate..."
                    placeholderTextColor={colors.text.secondary + '80'}
                    multiline
                    numberOfLines={2}
                    maxLength={280}
                    style={{
                      backgroundColor: colors.bg.surfaceAlt,
                      borderRadius: radii.md,
                      padding: spacing.md,
                      fontSize: 14,
                      color: colors.text.primary,
                      minHeight: 72,
                      textAlignVertical: 'top',
                      borderWidth: 1.5,
                      borderColor: colors.border.default,
                    }}
                  />
                </View>

                {/* Duration input */}
                <View style={{ marginBottom: spacing.lg }}>
                  <Text variant="micro" color={colors.text.secondary} style={{ marginBottom: 6 }}>
                    How long? — minutes (optional)
                  </Text>
                  <TextInput
                    value={durationText}
                    onChangeText={(t) => setDurationText(t.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 20"
                    placeholderTextColor={colors.text.secondary + '80'}
                    keyboardType="number-pad"
                    maxLength={3}
                    style={{
                      backgroundColor: colors.bg.surfaceAlt,
                      borderRadius: radii.md,
                      padding: spacing.md,
                      fontSize: 16,
                      color: colors.text.primary,
                      borderWidth: 1.5,
                      borderColor: colors.border.default,
                      width: 120,
                    }}
                  />
                </View>

                {/* Error */}
                {error && (
                  <Text
                    style={{
                      color: colors.error,
                      fontSize: 13,
                      marginBottom: spacing.sm,
                    }}
                  >
                    {error}
                  </Text>
                )}

                {/* Save button */}
                <Button
                  label={isSaving ? 'Saving…' : 'Save walk'}
                  onPress={handleSave}
                  loading={isSaving}
                  disabled={!selectedQuality}
                  style={{ marginBottom: spacing.md }}
                />

                {/* Skip link */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleSkip}
                  style={{ alignItems: 'center', paddingVertical: spacing.sm }}
                >
                  <Text
                    style={{
                      color: colors.text.secondary,
                      fontSize: 13,
                      textDecorationLine: 'underline',
                    }}
                  >
                    Skip logging
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
