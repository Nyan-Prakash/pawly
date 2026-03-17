import { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import Animated, { FadeInRight, FadeIn } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { VideoUploadProgress } from '@/components/video/VideoUploadProgress';
import { ExpertReviewRequest } from '@/components/video/ExpertReviewRequest';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useAuthStore } from '@/stores/authStore';
import { useDogStore } from '@/stores/dogStore';
import { uploadVideo, generateThumbnail } from '@/lib/videoUploader';
import type { VideoContext } from '@/types';

// ─── Behavior categories (matching the 8 training goals) ──────────────────

const BEHAVIOR_CATEGORIES = [
  { id: 'leash_pulling', label: 'Leash Pulling' },
  { id: 'jumping_up', label: 'Jumping Up' },
  { id: 'barking', label: 'Barking' },
  { id: 'recall', label: 'Recall / Coming when called' },
  { id: 'potty_training', label: 'Potty Training' },
  { id: 'crate_anxiety', label: 'Crate / Separation Anxiety' },
  { id: 'puppy_biting', label: 'Puppy Biting' },
  { id: 'settling', label: 'Settling / Impulse Control' },
] as const;

type Step = 1 | 2 | 3;

const VIDEO_TIPS = [
  { icon: 'sunny', text: 'Film in good lighting. Outdoors or near a window works great.' },
  { icon: 'phone-landscape', text: 'Hold your phone horizontally for the best view.' },
  { icon: 'paw', text: 'Keep your dog and yourself both in frame.' },
  { icon: 'repeat', text: 'Show 2-3 repetitions of the behavior if possible.' },
];

export default function UploadVideoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ context?: string }>();
  const videoContext: VideoContext =
    (params.context as VideoContext) ?? 'behavior';

  const user = useAuthStore((s) => s.user);
  const dog = useDogStore((s) => s.dog);

  // Step state
  const [step, setStep] = useState<Step>(1);
  const [tipsExpanded, setTipsExpanded] = useState(false);

  // Video selection
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [thumbUri, setThumbUri] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);

  // Context form
  const [behaviorCategory, setBehaviorCategory] = useState<string>('');
  const [beforeContext, setBeforeContext] = useState('');
  const [goalContext, setGoalContext] = useState('');
  const [isSessionClip, setIsSessionClip] = useState(false);

  // Upload
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadedVideoId, setUploadedVideoId] = useState<string | null>(null);

  // Review
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const [reviewRequested, setReviewRequested] = useState(false);

  // ─── Video picker ────────────────────────────────────────────────────────

  const pickVideo = async (fromCamera: boolean) => {
    let result: ImagePicker.ImagePickerResult;

    if (fromCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Camera access needed', 'Please allow camera access to record a video.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['videos'],
        videoMaxDuration: 300,
        quality: 0.7,
      });
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Photo library access needed', 'Please allow photo library access to pick a video.');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        quality: 0.7,
      });
    }

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const uri = asset.uri;
      const dur = asset.duration ? Math.round(asset.duration / 1000) : 0;
      setVideoUri(uri);
      setDuration(dur);

      // Generate thumbnail preview
      try {
        const thumb = await generateThumbnail(uri);
        setThumbUri(thumb);
      } catch {
        setThumbUri(null);
      }

      setStep(2);
    }
  };

  // ─── Upload handler ──────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!videoUri || !user?.id || !dog?.id) return;
    if (!behaviorCategory) {
      Alert.alert('Required', 'Please select a behavior category before uploading.');
      return;
    }

    setUploading(true);
    setUploadPercent(0);

    try {
      const result = await uploadVideo({
        uri: videoUri,
        userId: user.id,
        dogId: dog.id,
        context: isSessionClip ? 'session' : videoContext,
        behaviorContext: behaviorCategory,
        beforeContext: beforeContext.trim() || undefined,
        goalContext: goalContext.trim() || undefined,
        onProgress: setUploadPercent,
      });

      setUploadedVideoId(result.videoId);
      setStep(3);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      Alert.alert('Upload failed', message);
    } finally {
      setUploading(false);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ─── Step 1 — Choose video ────────────────────────────────────────────────

  const renderStep1 = () => (
    <Animated.View entering={FadeInRight.duration(280)}>
      <Text variant="title" style={{ marginBottom: spacing.xs, color: colors.textPrimary }}>
        Upload a training clip
      </Text>
      <Text variant="body" style={{ marginBottom: spacing.xl, color: colors.textSecondary }}>
        Short clips help trainers give you specific, actionable feedback.
      </Text>

      {/* Pick area */}
      <View
        style={{
          borderWidth: 2,
          borderStyle: 'dashed',
          borderColor: colors.border.default,
          borderRadius: 20,
          height: 200,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.secondary,
          marginBottom: spacing.lg,
          gap: spacing.md,
        }}
      >
        <AppIcon name="videocam" size={44} color={colors.textSecondary} />
        <Text variant="body" style={{ color: colors.textSecondary }}>
          Select a video to get started
        </Text>
      </View>

      <View style={{ gap: 12, marginBottom: spacing.xl }}>
        <Button label="Record new video" leftIcon="camera" onPress={() => pickVideo(true)} />
        <Pressable
          onPress={() => pickVideo(false)}
          style={({ pressed }) => ({
            padding: spacing.md,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: colors.primary,
            backgroundColor: pressed ? `${colors.primary}10` : colors.surface,
            alignItems: 'center',
          })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AppIcon name="images" size={18} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 15 }}>
              Choose from library
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Tips expandable */}
      <Pressable
        onPress={() => setTipsExpanded((v) => !v)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: spacing.sm,
          borderTopWidth: 1,
          borderTopColor: colors.border.default,
        }}
      >
        <Text variant="body" style={{ color: colors.textPrimary, fontWeight: '600' }}>
          Tips for good training videos
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 18 }}>
          {tipsExpanded ? '▲' : '▼'}
        </Text>
      </Pressable>
      {tipsExpanded && (
        <Animated.View entering={FadeIn.duration(200)} style={{ gap: spacing.sm, paddingTop: spacing.sm }}>
          {VIDEO_TIPS.map((tip) => (
            <View key={tip.text} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
              <AppIcon name={tip.icon as AppIconName} size={16} color={colors.primary} />
              <Text variant="body" style={{ color: colors.textSecondary, flex: 1 }}>
                {tip.text}
              </Text>
            </View>
          ))}
        </Animated.View>
      )}
    </Animated.View>
  );

  // ─── Step 2 — Add context ─────────────────────────────────────────────────

  const renderStep2 = () => (
    <Animated.View entering={FadeInRight.duration(280)} style={{ gap: spacing.lg }}>
      <View>
        <Text variant="title" style={{ color: colors.textPrimary, marginBottom: spacing.xs }}>
          Add context
        </Text>
        <Text variant="body" style={{ color: colors.textSecondary }}>
          Help the trainer understand what they're watching.
        </Text>
      </View>

      {/* Thumbnail preview */}
      <View style={{ borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
        {thumbUri ? (
          <Image
            source={{ uri: thumbUri }}
            style={{ width: '100%', height: 180 }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: '100%',
              height: 180,
              backgroundColor: colors.secondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppIcon name="film" size={40} color={colors.textSecondary} />
          </View>
        )}
        {duration > 0 && (
          <View
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              backgroundColor: 'rgba(0,0,0,0.65)',
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
              {formatDuration(duration)}
            </Text>
          </View>
        )}
      </View>

      {/* Behavior category */}
      <View>
        <Text variant="body" style={{ fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm }}>
          What behavior are you showing? *
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -spacing.xl }}>
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: spacing.xl }}>
            {BEHAVIOR_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setBehaviorCategory(cat.id)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: behaviorCategory === cat.id ? colors.primary : colors.border.default,
                  backgroundColor:
                    behaviorCategory === cat.id ? `${colors.primary}15` : colors.surface,
                }}
              >
                <Text
                  style={{
                    color: behaviorCategory === cat.id ? colors.primary : colors.textSecondary,
                    fontWeight: behaviorCategory === cat.id ? '600' : '400',
                    fontSize: 14,
                  }}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Before context */}
      <View>
        <Text variant="body" style={{ fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs }}>
          What happened just before this clip?
        </Text>
        <TextInput
          value={beforeContext}
          onChangeText={setBeforeContext}
          placeholder="e.g. He was calm, then saw another dog across the street…"
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={2}
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1.5,
            borderColor: beforeContext ? colors.primary : colors.border.default,
            borderRadius: 12,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            fontSize: 15,
            color: colors.textPrimary,
            minHeight: 72,
            textAlignVertical: 'top',
          }}
        />
      </View>

      {/* Goal context */}
      <View>
        <Text variant="body" style={{ fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs }}>
          What were you hoping to see?
        </Text>
        <TextInput
          value={goalContext}
          onChangeText={setGoalContext}
          placeholder="e.g. I wanted him to walk loose-leash past other dogs…"
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={2}
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1.5,
            borderColor: goalContext ? colors.primary : colors.border.default,
            borderRadius: 12,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            fontSize: 15,
            color: colors.textPrimary,
            minHeight: 72,
            textAlignVertical: 'top',
          }}
        />
      </View>

      {/* Session / problem toggle */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Text variant="body" style={{ color: colors.textPrimary, flex: 1 }}>
          This is a training session clip
        </Text>
        <Pressable
          onPress={() => setIsSessionClip((v) => !v)}
          style={{
            width: 50,
            height: 28,
            borderRadius: 14,
            backgroundColor: isSessionClip ? colors.primary : colors.border.default,
            justifyContent: 'center',
            paddingHorizontal: 3,
          }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: colors.surface,
              transform: [{ translateX: isSessionClip ? 22 : 0 }],
            }}
          />
        </Pressable>
      </View>

      {/* Remove / change */}
      <Pressable onPress={() => { setVideoUri(null); setThumbUri(null); setStep(1); }}>
        <Text variant="caption" style={{ color: colors.error, textAlign: 'center' }}>
          Remove video and start over
        </Text>
      </Pressable>
    </Animated.View>
  );

  // ─── Step 3 — Success ─────────────────────────────────────────────────────

  const renderStep3 = () => (
    <Animated.View entering={FadeIn.duration(400)} style={{ alignItems: 'center', gap: spacing.lg, paddingTop: spacing.xl }}>
      <AppIcon name="checkmark-circle" size={64} color={colors.success} />
      <Text variant="title" style={{ color: colors.textPrimary, textAlign: 'center' }}>
        Video uploaded!
      </Text>
      <Text variant="body" style={{ color: colors.textSecondary, textAlign: 'center' }}>
        Your clip has been saved to Pawly.
      </Text>

      <View style={{ width: '100%', gap: spacing.sm, marginTop: spacing.md }}>
        {uploadedVideoId && (
          <Button
            label="Request expert review"
            leftIcon="search"
            onPress={() => setShowReviewSheet(true)}
          />
        )}
        <Pressable
          onPress={() => router.replace('/(tabs)/train')}
          style={({ pressed }) => ({
            padding: spacing.md,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: colors.primary,
            backgroundColor: pressed ? `${colors.primary}10` : colors.surface,
            alignItems: 'center',
          })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AppIcon name="paw" size={18} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 15 }}>
              Back to training
            </Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => router.back()}
          style={{ alignItems: 'center', paddingVertical: spacing.sm }}
        >
          <Text variant="caption" style={{ color: colors.textSecondary }}>
            Done
          </Text>
        </Pressable>
      </View>

      {reviewRequested && (
        <Animated.View
          entering={FadeIn}
          style={{
            backgroundColor: `${colors.success}15`,
            borderRadius: 14,
            padding: spacing.md,
            width: '100%',
            flexDirection: 'row',
            gap: spacing.sm,
          }}
        >
          <AppIcon name="checkmark-circle" size={20} color={colors.success} />
          <Text variant="body" style={{ color: colors.textPrimary, flex: 1 }}>
            {"Review requested! You'll be notified within 48 hours."}
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );

  return (
    <SafeScreen>
      <VideoUploadProgress visible={uploading} percent={uploadPercent} />

      {uploadedVideoId && (
        <ExpertReviewRequest
          visible={showReviewSheet}
          videoId={uploadedVideoId}
          onClose={() => setShowReviewSheet(false)}
          onConfirmed={() => {
            setShowReviewSheet(false);
            setReviewRequested(true);
          }}
        />
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border.default,
          }}
        >
          <Pressable onPress={() => router.back()} style={{ marginRight: spacing.md }}>
            <Text style={{ color: colors.primary, fontSize: 28, lineHeight: 32 }}>‹</Text>
          </Pressable>
          <Text variant="title" style={{ color: colors.textPrimary, fontSize: 18 }}>
            {step === 1 ? 'Choose video' : step === 2 ? 'Add context' : 'Done'}
          </Text>
        </View>

        {/* Step indicator */}
        {step < 3 && (
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: spacing.xl,
              paddingTop: spacing.md,
              gap: 6,
            }}
          >
            {[1, 2].map((s) => (
              <View
                key={s}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: step >= s ? colors.primary : colors.border.default,
                }}
              />
            ))}
          </View>
        )}

        <ScrollView
          contentContainerStyle={{ padding: spacing.xl, paddingBottom: step === 2 ? 140 : 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>

        {/* Bottom CTA for step 2 */}
        {step === 2 && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: spacing.xl,
              backgroundColor: colors.background,
              borderTopWidth: 1,
              borderTopColor: colors.border.default,
            }}
          >
            <Button
              label="Upload video"
              onPress={handleUpload}
              disabled={!behaviorCategory || uploading}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
