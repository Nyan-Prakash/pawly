import { useState } from 'react';
import { View, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { AppIcon } from '@/components/ui/AppIcon';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

export default function VideoUploadScreen() {
  const router = useRouter();
  const setField = useOnboardingStore((s) => s.setField);
  const nextStep = useOnboardingStore((s) => s.nextStep);
  const storedVideoUri = useOnboardingStore((s) => s.videoUri);
  const storedVideoContext = useOnboardingStore((s) => s.videoContext);
  const userId = useAuthStore((s) => s.user?.id);

  const [videoUri, setVideoUri] = useState<string | null>(storedVideoUri);
  const [videoContext, setVideoContext] = useState(storedVideoContext);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const pickVideo = async (fromCamera: boolean) => {
    let result: ImagePicker.ImagePickerResult;

    if (fromCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Camera permission needed', 'Please allow camera access to record a video.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['videos'],
        videoMaxDuration: 60,
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
      setVideoUri(asset.uri);
      uploadVideo(asset.uri);
    }
  };

  const uploadVideo = async (uri: string) => {
    if (!userId) return;
    setUploading(true);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const path = `videos/${userId}/onboarding_${timestamp}.mp4`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { error } = await supabase.storage
        .from('pawly-videos')
        .upload(path, blob, { contentType: 'video/mp4', upsert: true });

      if (error) throw error;

      setUploadProgress(100);
      setField('videoUri', uri);
      setField('videoUploadPath', path);
    } catch (err) {
      console.warn('Video upload failed:', err);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const removeVideo = () => {
    setVideoUri(null);
    setField('videoUri', null);
    setField('videoUploadPath', null);
    setUploadProgress(0);
  };

  const handleNext = () => {
    setField('videoContext', videoContext);
    nextStep();
    router.push('/(onboarding)/plan-preview');
  };

  const handleSkip = () => {
    setField('videoUri', null);
    setField('videoUploadPath', null);
    setField('videoContext', '');
    nextStep();
    router.push('/(onboarding)/plan-preview');
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Animated.View entering={FadeInRight.duration(300)} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 160 }} keyboardShouldPersistTaps="handled">
            <Text variant="title" style={{ marginBottom: spacing.xs, color: colors.textPrimary }}>
              {"Show us what's happening"}
            </Text>
            <Text variant="body" style={{ marginBottom: spacing.xl, color: colors.textSecondary }}>
              {"A 30-second clip helps us give you a much more relevant plan."}
            </Text>

            {/* Upload area */}
            {!videoUri ? (
              <View style={{
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: colors.border.default,
                borderRadius: 16,
                height: 200,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.secondary,
                marginBottom: spacing.lg,
              }}>
                <View style={{ marginBottom: spacing.sm }}>
                  <AppIcon name="videocam" size={40} color={colors.textSecondary} />
                </View>
                <Text variant="body" style={{ color: colors.textSecondary, textAlign: 'center' }}>
                  No video selected yet
                </Text>
              </View>
            ) : (
              <View style={{
                borderRadius: 16,
                backgroundColor: `${colors.primary}15`,
                borderWidth: 2,
                borderColor: colors.primary,
                padding: spacing.lg,
                alignItems: 'center',
                marginBottom: spacing.lg,
              }}>
                <View style={{ marginBottom: spacing.sm }}>
                  <AppIcon name="checkmark-circle" size={40} color={colors.primary} />
                </View>
                <Text variant="body" style={{ color: colors.primary, fontWeight: '600', marginBottom: 4 }}>
                  Video selected
                </Text>
                {uploading && (
                  <View style={{ width: '100%', marginTop: spacing.sm }}>
                    <View style={{ height: 6, backgroundColor: colors.border.default, borderRadius: 3 }}>
                      <View style={{ height: 6, backgroundColor: colors.primary, borderRadius: 3, width: `${uploadProgress}%` }} />
                    </View>
                    <Text variant="caption" style={{ color: colors.textSecondary, marginTop: 4, textAlign: 'center' }}>
                      Uploading…
                    </Text>
                  </View>
                )}
                {!uploading && uploadProgress === 100 && (
                  <Text variant="caption" style={{ color: colors.success, marginTop: 4 }}>Uploaded successfully</Text>
                )}
                <Pressable onPress={removeVideo} style={{ marginTop: spacing.sm }}>
                  <Text variant="caption" style={{ color: colors.error }}>Remove</Text>
                </Pressable>
              </View>
            )}

            {/* Record / Library buttons */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: spacing.xl }}>
              <Pressable
                onPress={() => pickVideo(true)}
                style={({ pressed }) => ({
                  flex: 1,
                  padding: spacing.md,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: colors.primary,
                  backgroundColor: pressed ? `${colors.primary}15` : colors.surface,
                  alignItems: 'center',
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
              >
                <View style={{ marginBottom: 4 }}>
                  <AppIcon name="camera" size={22} color={colors.primary} />
                </View>
                <Text variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>Record now</Text>
              </Pressable>
              <Pressable
                onPress={() => pickVideo(false)}
                style={({ pressed }) => ({
                  flex: 1,
                  padding: spacing.md,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: colors.primary,
                  backgroundColor: pressed ? `${colors.primary}15` : colors.surface,
                  alignItems: 'center',
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
              >
                <View style={{ marginBottom: 4 }}>
                  <AppIcon name="images" size={22} color={colors.primary} />
                </View>
                <Text variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>Choose from library</Text>
              </Pressable>
            </View>

            {/* Context question */}
            <Text variant="body" style={{ fontWeight: '600', marginBottom: spacing.xs, color: colors.textPrimary }}>
              What happens in this clip?
            </Text>
            <TextInput
              value={videoContext}
              onChangeText={setVideoContext}
              placeholder="e.g. He pulls the moment he sees another dog…"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1.5,
                borderColor: videoContext ? colors.primary : colors.border.default,
                borderRadius: 12,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                fontSize: 15,
                color: colors.textPrimary,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
            />
          </ScrollView>

          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: spacing.xl,
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border.default,
            gap: spacing.sm,
          }}>
            <Button label="Build my plan" rightIcon="arrow-forward" onPress={handleNext} disabled={uploading} />
            <Pressable onPress={handleSkip} style={{ alignItems: 'center', paddingVertical: spacing.sm }}>
              <Text variant="caption" style={{ color: colors.textSecondary }}>Skip for now</Text>
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
