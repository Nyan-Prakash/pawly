import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { BlurView } from 'expo-blur';

import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { LiveAiTrainerStatus, LiveAiTrainerResponse } from '@/lib/liveCoach/liveAiTrainerTypes';

interface LiveAiTrainerOverlayProps {
  status: LiveAiTrainerStatus;
  lastResponse: LiveAiTrainerResponse | null;
  onExit: () => void;
  onAskCoach: (text: string) => void;
  onAnalyzeFrame: () => void;
  onManualSwitch: () => void;
  cameraRef: React.RefObject<Camera>;
}

export function LiveAiTrainerOverlay({
  status,
  lastResponse,
  onExit,
  onAskCoach,
  onAnalyzeFrame,
  onManualSwitch,
  cameraRef,
}: LiveAiTrainerOverlayProps) {
  const device = useCameraDevice('back');
  const [question, setQuestion] = useState('');
  const [showInput, setShowInput] = useState(false);

  if (!device) return <View style={styles.container}><ActivityIndicator /></View>;

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={onExit} style={styles.iconButton}>
          <AppIcon name="close" size={24} color="#fff" />
        </Pressable>

        <View style={styles.statusPill}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
          <Text style={styles.statusText}>{status.toUpperCase()}</Text>
        </View>

        <Pressable onPress={onManualSwitch} style={styles.manualButton}>
          <Text style={styles.manualButtonText}>Manual</Text>
        </Pressable>
      </View>

      {/* Coach Message Area */}
      {lastResponse?.coachMessage && (
        <View style={styles.messageContainer}>
          <BlurView intensity={80} tint="dark" style={styles.messageBlur}>
            <Text style={styles.messageText}>{lastResponse.coachMessage}</Text>
          </BlurView>
        </View>
      )}

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {showInput ? (
          <View style={styles.inputRow}>
            <Input
              value={question}
              onChangeText={setQuestion}
              placeholder="Ask the coach..."
              style={{ flex: 1 }}
              inputStyle={styles.input}
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
            <Button
              label="Send"
              onPress={() => {
                onAskCoach(question);
                setQuestion('');
                setShowInput(false);
              }}
              size="sm"
            />
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <Pressable style={styles.actionButton} onPress={() => setShowInput(true)}>
              <AppIcon name="chatbubble" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Ask Coach</Text>
            </Pressable>

            <Pressable style={styles.actionButton} onPress={onAnalyzeFrame}>
              <AppIcon name="scan" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Analyze Frame</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Fallback Warning */}
      {status === 'fallback' && (
        <View style={styles.fallbackOverlay}>
          <Text style={styles.fallbackText}>I'm having trouble seeing clearly.</Text>
          <Button label="Switch to Manual" onPress={onManualSwitch} style={{ marginTop: spacing.md }} />
        </View>
      )}
    </View>
  );
}

function getStatusColor(status: LiveAiTrainerStatus) {
  switch (status) {
    case 'idle': return colors.status.successBorder;
    case 'thinking': return colors.status.warningBorder;
    case 'speaking': return colors.brand.primary;
    case 'listening': return colors.status.infoBorder;
    case 'fallback': return colors.status.dangerBorder;
    default: return '#ccc';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  manualButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  manualButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  messageContainer: {
    position: 'absolute',
    top: 140,
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
  messageBlur: {
    padding: spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  messageText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.md,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: spacing.md,
    borderRadius: 16,
    flex: 1,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: spacing.sm,
    borderRadius: 20,
  },
  input: {
    flex: 1,
    color: '#fff',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  fallbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  fallbackText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
});
