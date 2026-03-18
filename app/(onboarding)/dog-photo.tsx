import { useState, useEffect } from 'react';
import {
  View,
  Image,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { QuestionScreen } from '@/components/onboarding/QuestionScreen';
import { colors } from '@/constants/colors';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

type State = 'idle' | 'selected' | 'generating' | 'generated' | 'error';

export default function DogPhotoScreen() {
  const router = useRouter();
  const { dogName, setAvatarUrl } = useOnboardingStore();
  const userId = useAuthStore((s) => s.user?.id);

  const [state, setState] = useState<State>('idle');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Animations
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (state === 'generating') {
      pulseScale.value = withRepeat(withTiming(1.05, { duration: 1000 }), -1, true);
      pulseOpacity.value = withRepeat(withTiming(0.7, { duration: 1000 }), -1, true);
      rotation.value = withRepeat(withTiming(360, { duration: 2000 }), -1, false);
    } else {
      pulseScale.value = 1;
      pulseOpacity.value = 1;
      rotation.value = 0;
    }
  }, [state, pulseScale, pulseOpacity, rotation]);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Loading ellipsis
  const [ellipsis, setEllipsis] = useState('...');
  useEffect(() => {
    if (state !== 'generating') return;
    const interval = setInterval(() => {
      setEllipsis((e) => (e === '...' ? '.' : e === '.' ? '..' : '...'));
    }, 600);
    return () => clearInterval(interval);
  }, [state]);

  const requestPermissions = async (type: 'camera' | 'library') => {
    setPermissionError(null);
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setPermissionError('Permission required. Enable it in Settings.');
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setPermissionError('Permission required. Enable it in Settings.');
        return false;
      }
    }
    return true;
  };

  const handlePickImage = async (useCamera: boolean) => {
    const hasPermission = await requestPermissions(useCamera ? 'camera' : 'library');
    if (!hasPermission) return;

    const result = await (useCamera
      ? ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        })
      : ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        }));

    if (!result.canceled && result.assets[0].uri) {
      const resized = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1024, height: 1024 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );
      setPhotoUri(resized.uri);
      setState('selected');
      setErrorMessage(null);
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
    } catch (err) {
      console.error('Avatar generation error:', err);
      setState('error');
      setErrorMessage("Couldn't create the avatar. Check your connection and try again.");
      setRetryCount((c) => c + 1);
    }
  };

  const handleUseAvatar = async () => {
    if (!avatarUri || !userId) return;

    setState('generating'); // Reuse loading state for upload

    try {
      // Create bucket if it doesn't exist (idempotent)
      await supabase.storage.createBucket('avatars', { public: true }).catch(() => {
        // Bucket already exists — ignore error
      });

      // Prepare blob for upload (RN compatible)
      const avatarResponse = await fetch(avatarUri);
      const avatarBlob = await avatarResponse.blob();

      // Path pattern: avatars/temp_{userId}_{timestamp}.png
      // Since dogId is only created at the very end of onboarding, we'll use a temp path
      // The submitOnboarding action in onboardingStore.ts will eventually handle the DB write.
      const path = `avatars/temp_${userId}_${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarBlob, { upsert: true, contentType: 'image/png' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);

      setAvatarUrl(publicUrl);
      router.push('/(onboarding)/dog-problem');
    } catch (err) {
      console.error('Avatar upload error:', err);
      setState('error');
      setErrorMessage('Failed to save avatar. Please try again.');
    }
  };

  const handleSkip = () => {
    router.push('/(onboarding)/dog-problem');
  };

  const renderContent = () => {
    switch (state) {
      case 'idle':
        return (
          <View className="flex-1 items-center justify-center gap-12">
            <View className="w-[180px] h-[180px] rounded-full border-2 border-dashed border-gray-300 items-center justify-center bg-gray-50">
              <AppIcon name="paw" size={48} color={colors.text.secondary} />
              <Text variant="caption" className="mt-2 text-gray-500">
                Your photo goes here
              </Text>
            </View>

            {permissionError && (
              <Text variant="caption" className="text-red-500 text-center">
                {permissionError}
              </Text>
            )}

            <View className="flex-row gap-3 px-6">
              <Button
                label="📷 Take Photo"
                onPress={() => handlePickImage(true)}
                className="flex-1"
                variant="outline"
              />
              <Button
                label="🖼 Choose"
                onPress={() => handlePickImage(false)}
                className="flex-1"
                variant="outline"
              />
            </View>
          </View>
        );

      case 'selected':
        return (
          <View className="flex-1 items-center justify-center gap-12">
            <View className="w-[180px] h-[180px] rounded-full overflow-hidden">
              <Image source={{ uri: photoUri! }} className="w-full h-full" />
            </View>

            <View className="w-full px-6 gap-4">
              <Button label={`✨ Create ${dogName}'s Avatar`} onPress={generateAvatar} />
              <Pressable onPress={() => handlePickImage(false)}>
                <Text variant="body" className="text-center text-[#2D7D6F]">
                  Choose a different photo
                </Text>
              </Pressable>
            </View>
          </View>
        );

      case 'generating':
        return (
          <View className="flex-1 items-center justify-center gap-12">
            <View className="w-[180px] h-[180px] items-center justify-center">
              <Animated.View
                className="absolute w-[200px] h-[200px] rounded-full border-2 border-dashed border-[#2D7D6F]"
                style={animatedRingStyle}
              />
              <Animated.View
                className="w-[180px] h-[180px] rounded-full overflow-hidden bg-gray-50"
                style={animatedPulseStyle}
              >
                {photoUri && (
                  <Image source={{ uri: photoUri }} className="w-full h-full opacity-60" />
                )}
              </Animated.View>
            </View>
            <Text variant="body" className="text-gray-900">
              Creating {dogName}'s avatar{ellipsis}
            </Text>
          </View>
        );

      case 'generated':
        return (
          <View className="flex-1 items-center justify-center gap-12">
            <View className="flex-row items-center gap-4">
              <View className="items-center gap-2">
                <View className="w-[140px] h-[140px] rounded-full overflow-hidden">
                  <Image source={{ uri: photoUri! }} className="w-full h-full" />
                </View>
                <Text variant="caption" className="text-gray-500">Original</Text>
              </View>

              <Text className="text-2xl">✨</Text>

              <View className="items-center gap-2">
                <View className="w-[140px] h-[140px] rounded-full overflow-hidden border-2 border-[#2D7D6F]">
                  <Image source={{ uri: avatarUri! }} className="w-full h-full" />
                </View>
                <Text variant="caption" className="text-[#2D7D6F] font-semibold">{dogName}'s Avatar</Text>
              </View>
            </View>

            <View className="w-full px-6 gap-4">
              <Button label="Use this avatar" onPress={handleUseAvatar} />
              {retryCount < 3 ? (
                <Button label="Try again" onPress={generateAvatar} variant="outline" />
              ) : (
                <Text variant="caption" className="text-center text-gray-500">
                  Try again later from your profile settings
                </Text>
              )}
            </View>
          </View>
        );

      case 'error':
        return (
          <View className="flex-1 items-center justify-center gap-12">
            <View className="w-[180px] h-[180px] rounded-full overflow-hidden">
              <Image source={{ uri: photoUri! }} className="w-full h-full" />
            </View>

            <View className="bg-red-100 p-4 rounded-md mx-6">
              <Text variant="caption" className="text-red-700 text-center">
                {errorMessage}
              </Text>
            </View>

            <View className="w-full px-6 gap-4">
              {retryCount < 3 && <Button label="Try again" onPress={generateAvatar} />}
            </View>
          </View>
        );
    }
  };

  return (
    <QuestionScreen
      title={`Add a photo of ${dogName} 🐾`}
      subtitle={`We'll turn it into a custom illustrated avatar for ${dogName}`}
      canContinue={false}
      onContinue={() => {}}
      currentStep={2}
      totalSteps={6}
      onBack={() => state !== 'generating' && router.back()}
      scrollable={false}
      footerExtra={
        state !== 'generating' && (
          <Pressable onPress={handleSkip}>
            <Text variant="body" className="text-center text-gray-500">
              Skip for now →
            </Text>
          </Pressable>
        )
      }
    >
      <View className="flex-1">
        {renderContent()}
      </View>
    </QuestionScreen>
  );
}
