import { useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { ExpertReviewRequest } from '@/components/video/ExpertReviewRequest';
import { VideoUploadProgress } from '@/components/video/VideoUploadProgress';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { haptics } from '@/lib/haptics';
import { generateThumbnail, uploadVideo } from '@/lib/videoUploader';
import { useAuthStore } from '@/stores/authStore';
import { useDogStore } from '@/stores/dogStore';
import type { VideoContext } from '@/types';

// ─── Behavior categories (same labels as the add-course picker) ─────────────

const BEHAVIOR_CATEGORIES: { id: string; label: string; icon: AppIconName }[] = [
  { id: 'leash_pulling', label: 'Leash pulling', icon: 'walk' },
  { id: 'jumping_up', label: 'Jumping up', icon: 'arrow-up-circle' },
  { id: 'barking', label: 'Barking', icon: 'volume-high' },
  { id: 'recall', label: 'Recall', icon: 'return-down-back' },
  { id: 'potty_training', label: 'Potty training', icon: 'sunny' },
  { id: 'crate_anxiety', label: 'Crate anxiety', icon: 'home' },
  { id: 'puppy_biting', label: 'Puppy biting', icon: 'happy' },
  { id: 'settling', label: 'Settling', icon: 'bed' },
];

type Step = 1 | 2 | 3;

const VIDEO_TIPS: { icon: AppIconName; text: string }[] = [
  { icon: 'sunny-outline', text: 'Film in good light, outdoors or near a window.' },
  { icon: 'phone-landscape-outline', text: 'Hold your phone sideways for the widest view.' },
  { icon: 'paw-outline', text: 'Keep your dog and yourself both in frame.' },
  { icon: 'repeat-outline', text: 'Show two or three repetitions if you can.' },
];

export default function UploadVideoScreen() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const params = useLocalSearchParams<{ context?: string }>();
  const videoContext: VideoContext =
    (params.context as VideoContext) ?? 'behavior';

  const user = useAuthStore((s) => s.user);
  const dog = useDogStore((s) => s.dog);

  // Step state
  const [step, setStep] = useState<Step>(1);

  // Video selection
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [thumbUri, setThumbUri] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);

  // Context form
  const [behaviorCategory, setBehaviorCategory] = useState<string>('');
  const [beforeContext, setBeforeContext] = useState('');
  const [goalContext, setGoalContext] = useState('');
  const [isSessionClip, setIsSessionClip] = useState(false);
  const goalInputRef = useRef<TextInput>(null);

  // Upload
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadedVideoId, setUploadedVideoId] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Review
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const [reviewRequested, setReviewRequested] = useState(false);

  // ─── Video picker ────────────────────────────────────────────────────────

  const pickVideo = async (fromCamera: boolean) => {
    let result: ImagePicker.ImagePickerResult;

    if (fromCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Camera access needed', 'Allow camera access in Settings to record a video.');
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
        Alert.alert('Photo library access needed', 'Allow photo library access in Settings to pick a video.');
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
      setCategoryError('Pick the behavior the video shows, then upload.');
      return;
    }
    setCategoryError(null);

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
      console.warn('[upload-video] upload failed:', err);
      Alert.alert('Upload failed', "The video didn't upload. Check your connection and try again.");
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

  const selectCategory = (id: string) => {
    haptics.selection();
    setBehaviorCategory(id);
    setCategoryError(null);
  };

  // ─── Step 1 — Choose video ────────────────────────────────────────────────

  const renderStep1 = () => (
    <View style={{ gap: spacing.xl }}>
      <Text variant="body" color={colors.text.secondary}>
        A short clip is enough. It helps the trainer give feedback on what they see.
      </Text>

      <View style={{ gap: spacing.sm }}>
        <Button label="Record a video" icon="camera" onPress={() => pickVideo(true)} />
        <Button label="Choose from library" icon="images" variant="secondary" onPress={() => pickVideo(false)} />
      </View>

      <View>
        <SectionHeader title="Tips for a useful video" />
        <ListGroup>
          {VIDEO_TIPS.map((tip) => (
            <ListRow key={tip.text} icon={tip.icon} iconTone="secondary" title={tip.text} />
          ))}
        </ListGroup>
      </View>
    </View>
  );

  // ─── Step 2 — Add context ─────────────────────────────────────────────────

  const renderStep2 = () => (
    <View style={{ gap: spacing.xl }}>
      <View style={{ gap: spacing.sm }}>
        {thumbUri ? (
          <Image
            source={{ uri: thumbUri }}
            style={{ width: '100%', height: 180, borderRadius: radii.md }}
            resizeMode="cover"
            accessibilityLabel="Video preview"
          />
        ) : (
          <View
            style={{
              width: '100%',
              height: 180,
              borderRadius: radii.md,
              backgroundColor: colors.bg.fill,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppIcon name="film-outline" size={40} color={colors.text.secondary} />
          </View>
        )}
        {duration > 0 ? <Text variant="caption">{formatDuration(duration)} long</Text> : null}
      </View>

      <View>
        <SectionHeader title="What behavior does it show?" />
        <ListGroup>
          {BEHAVIOR_CATEGORIES.map((cat) => (
            <ListRow
              key={cat.id}
              icon={cat.icon}
              iconTone={behaviorCategory === cat.id ? 'accent' : 'secondary'}
              title={cat.label}
              selected={behaviorCategory === cat.id}
              onPress={() => selectCategory(cat.id)}
            />
          ))}
        </ListGroup>
        {categoryError ? (
          <Text variant="caption" color={colors.status.danger} style={{ marginTop: spacing.sm }} accessibilityLiveRegion="polite">
            {categoryError}
          </Text>
        ) : null}
      </View>

      <Input
        label="What happened just before this clip? (optional)"
        value={beforeContext}
        onChangeText={setBeforeContext}
        placeholder="He was calm, then saw another dog across the street"
        multiline
        numberOfLines={2}
        returnKeyType="next"
        blurOnSubmit
        onSubmitEditing={() => goalInputRef.current?.focus()}
      />

      <Input
        ref={goalInputRef}
        label="What were you hoping to see? (optional)"
        value={goalContext}
        onChangeText={setGoalContext}
        placeholder="I wanted him to walk on a loose leash past other dogs"
        multiline
        numberOfLines={2}
        returnKeyType="done"
        blurOnSubmit
      />

      <ListGroup>
        <ListRow
          title="This is a clip from a session"
          subtitle="Off for a problem behavior filmed outside a session."
          trailing={
            <Switch
              value={isSessionClip}
              onValueChange={setIsSessionClip}
              trackColor={{ false: colors.bg.fill, true: colors.accent }}
              accessibilityLabel="This is a clip from a session"
            />
          }
        />
      </ListGroup>

      <Button
        label="Choose a different video"
        variant="ghost"
        size="md"
        onPress={() => {
          setVideoUri(null);
          setThumbUri(null);
          setStep(1);
        }}
        style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }}
      />
    </View>
  );

  // ─── Step 3 — Uploaded ────────────────────────────────────────────────────

  const renderStep3 = () => (
    <View style={{ alignItems: 'center', gap: spacing.xl, paddingTop: spacing.xxl }}>
      <AppIcon name="checkmark-circle" size={48} color={colors.accent} />
      <View style={{ alignItems: 'center', gap: spacing.xs }}>
        <Text variant="h2" style={{ textAlign: 'center' }}>
          Video uploaded
        </Text>
        <Text variant="body" color={colors.text.secondary} style={{ textAlign: 'center' }}>
          The clip is saved to {dog?.name ? `${dog.name}'s` : "your dog's"} profile.
        </Text>
      </View>

      <View style={{ width: '100%', gap: spacing.sm }}>
        {uploadedVideoId && !reviewRequested ? (
          <Button label="Request expert review" icon="search" onPress={() => setShowReviewSheet(true)} />
        ) : null}
        <Button
          label="Back to Train"
          variant={uploadedVideoId && !reviewRequested ? 'secondary' : 'primary'}
          onPress={() => router.replace('/(tabs)/train')}
        />
      </View>

      {reviewRequested ? (
        <Text variant="body" style={{ textAlign: 'center' }} accessibilityLiveRegion="polite">
          Review requested. You'll get a notification within 48 hours.
        </Text>
      ) : null}
    </View>
  );

  return (
    <>
      <VideoUploadProgress visible={uploading} percent={uploadPercent} />

      {uploadedVideoId ? (
        <ExpertReviewRequest
          visible={showReviewSheet}
          videoId={uploadedVideoId}
          onClose={() => setShowReviewSheet(false)}
          onConfirmed={() => {
            setShowReviewSheet(false);
            setReviewRequested(true);
          }}
        />
      ) : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={headerHeight}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>

        {step === 2 ? (
          <View style={{ padding: spacing.lg, paddingTop: spacing.sm, backgroundColor: colors.bg.app }}>
            <Button
              label="Upload video"
              onPress={handleUpload}
              disabled={!behaviorCategory || uploading}
              loading={uploading}
            />
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </>
  );
}
