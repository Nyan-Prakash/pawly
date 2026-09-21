import { useState } from 'react';
import { ActivityIndicator, Image, Linking, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

import { Button } from '@/components/ui/Button';
import { ListGroup, ListRow } from '@/components/ui/ListRow';
import { Text } from '@/components/ui/Text';
import { QuestionScreen } from '@/components/onboarding/QuestionScreen';
import { colors } from '@/constants/colors';
import { radii } from '@/constants/radii';
import { spacing } from '@/constants/spacing';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { supabase } from '@/lib/supabase';

type State = 'idle' | 'selected' | 'generating' | 'generated' | 'error';

const MAX_RETRIES = 3;
const PREVIEW_SIZE = 160;
const COMPARE_SIZE = 140;
// dog-basics step index of the goal question, where the flow resumes.
const RETURN_STEP = 4;

function Photo({ uri, size, label }: { uri: string; size: number; label: string }) {
  return (
    <Image
      source={{ uri }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
      accessibilityIgnoresInvertColors
      style={{ width: size, height: size, borderRadius: radii.md, backgroundColor: colors.bg.fill }}
    />
  );
}

export default function DogPhotoScreen() {
  const router = useRouter();
  const { dogName, setAvatarFileUri } = useOnboardingStore();

  const [state, setState] = useState<State>('idle');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handlePickImage = async (useCamera: boolean) => {
    if (pickerOpen) return;
    setPermissionError(null);
    setErrorMessage(null);

    try {
      setPickerOpen(true);
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      };
      const result = await (useCamera
        ? ImagePicker.launchCameraAsync(options)
        : ImagePicker.launchImageLibraryAsync(options));
      setPickerOpen(false);

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      const resized = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1024, height: 1024 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
      );
      setPhotoUri(resized.uri);
      setState('selected');
    } catch (error) {
      setPickerOpen(false);
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.toLowerCase().includes('permission')) {
        setPermissionError(
          useCamera
            ? 'Pawly needs access to your camera. Allow it in Settings, then try again.'
            : 'Pawly needs access to your photos. Allow it in Settings, then try again.',
        );
      } else {
        setErrorMessage(
          useCamera ? "Couldn't open the camera. Try again." : "Couldn't open your photo library. Try again.",
        );
      }
    }
  };

  const generateAvatar = async () => {
    if (!photoUri) return;

    setState('generating');
    setErrorMessage(null);

    try {
      const base64 = await FileSystem.readAsStringAsync(photoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { data, error } = await supabase.functions.invoke('generate-dog-avatar', {
        body: { imageBase64: base64, dogName },
      });

      if (error || data?.error) {
        throw new Error(error?.message || data?.error || 'Generation failed');
      }

      const cacheUri = `${FileSystem.cacheDirectory}dog_avatar_${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(cacheUri, data.avatarBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setAvatarUri(cacheUri);
      setState('generated');
    } catch {
      setState('error');
      setErrorMessage("Couldn't create the avatar. Check your connection and try again.");
      setRetryCount((c) => c + 1);
    }
  };

  const handleUseAvatar = () => {
    if (!avatarUri) return;
    // Save the file URI — the actual Storage upload happens in submitOnboarding
    // after signup. Storing the URI avoids putting a large base64 string in
    // AsyncStorage which can silently fail due to size limits.
    setAvatarFileUri(avatarUri);
    router.push(`/(onboarding)/dog-basics?step=${RETURN_STEP}`);
  };

  const handleSkip = () => {
    router.push(`/(onboarding)/dog-basics?step=${RETURN_STEP}`);
  };

  const canRetry = retryCount < MAX_RETRIES;
  const isGenerating = state === 'generating';

  const renderContent = () => {
    switch (state) {
      case 'idle':
        return (
          <View style={{ gap: spacing.lg }}>
            <ListGroup>
              <ListRow
                icon="camera-outline"
                title="Take a photo"
                trailing="chevron"
                onPress={() => handlePickImage(true)}
              />
              <ListRow
                icon="images-outline"
                title="Choose from library"
                trailing="chevron"
                onPress={() => handlePickImage(false)}
              />
            </ListGroup>

            {permissionError ? (
              <View style={{ gap: spacing.sm }}>
                <Text variant="caption" color={colors.status.danger} accessibilityLiveRegion="polite">
                  {permissionError}
                </Text>
                <Button
                  label="Open settings"
                  variant="secondary"
                  size="md"
                  onPress={() => Linking.openSettings().catch(() => {})}
                  style={{ alignSelf: 'flex-start' }}
                />
              </View>
            ) : null}

            {errorMessage ? (
              <Text variant="caption" color={colors.status.danger} accessibilityLiveRegion="polite">
                {errorMessage}
              </Text>
            ) : null}
          </View>
        );

      case 'selected':
        return (
          <View style={{ gap: spacing.xl }}>
            {photoUri ? <Photo uri={photoUri} size={PREVIEW_SIZE} label={`Your photo of ${dogName}`} /> : null}
            <Text variant="body">
              The coach will turn this photo into {dogName}'s avatar.
            </Text>
            <View style={{ gap: spacing.sm }}>
              <Button label="Create the avatar" onPress={generateAvatar} />
              <Button
                label="Choose a different photo"
                variant="secondary"
                onPress={() => handlePickImage(false)}
              />
            </View>
          </View>
        );

      case 'generating':
        return (
          <View style={{ gap: spacing.xl }}>
            {photoUri ? <Photo uri={photoUri} size={PREVIEW_SIZE} label={`Your photo of ${dogName}`} /> : null}
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel={`Creating ${dogName}'s avatar. This takes about 30 seconds.`}
              accessibilityState={{ busy: true }}
              accessibilityLiveRegion="polite"
            >
              <ActivityIndicator color={colors.text.secondary} />
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Text variant="bodyStrong">Creating {dogName}'s avatar</Text>
                <Text variant="caption">This takes about 30 seconds.</Text>
              </View>
            </View>
          </View>
        );

      case 'generated':
        return (
          <View style={{ gap: spacing.xl }}>
            <View style={{ flexDirection: 'row', gap: spacing.lg }}>
              <View style={{ gap: spacing.sm }}>
                {photoUri ? <Photo uri={photoUri} size={COMPARE_SIZE} label={`Your photo of ${dogName}`} /> : null}
                <Text variant="caption" accessible={false} accessibilityElementsHidden importantForAccessibility="no">
                  Photo
                </Text>
              </View>
              <View style={{ gap: spacing.sm }}>
                {avatarUri ? <Photo uri={avatarUri} size={COMPARE_SIZE} label={`${dogName}'s new avatar`} /> : null}
                <Text variant="caption" accessible={false} accessibilityElementsHidden importantForAccessibility="no">
                  Avatar
                </Text>
              </View>
            </View>

            {canRetry ? (
              <Button
                label="Make another"
                variant="secondary"
                onPress={generateAvatar}
                style={{ alignSelf: 'flex-start' }}
              />
            ) : (
              <Text variant="caption">You can make a new avatar later from the Profile tab.</Text>
            )}
          </View>
        );

      case 'error':
        return (
          <View style={{ gap: spacing.xl }}>
            {photoUri ? <Photo uri={photoUri} size={PREVIEW_SIZE} label={`Your photo of ${dogName}`} /> : null}
            <Text variant="body" color={colors.status.danger} accessibilityLiveRegion="polite">
              {errorMessage}
            </Text>
            <View style={{ gap: spacing.sm }}>
              {canRetry ? <Button label="Try again" onPress={generateAvatar} /> : null}
              <Button
                label="Choose a different photo"
                variant="secondary"
                onPress={() => handlePickImage(false)}
              />
            </View>
          </View>
        );
    }
  };

  return (
    <QuestionScreen
      title={`Add a photo of ${dogName}`}
      subtitle="The coach turns it into an illustrated avatar. You can skip this."
      onBack={isGenerating ? undefined : () => router.back()}
      continueLabel={state === 'generated' ? 'Use this avatar' : undefined}
      onContinue={state === 'generated' ? handleUseAvatar : undefined}
      footerExtra={
        isGenerating ? null : <Button label="Skip for now" variant="ghost" onPress={handleSkip} />
      }
    >
      {renderContent()}
    </QuestionScreen>
  );
}
