import { useState, useEffect } from 'react';
import {
  View,
  Image,
  Pressable,
  StyleSheet,
  Alert,
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
  withSequence,
  Easing,
} from 'react-native-reanimated';

import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { QuestionScreen } from '@/components/onboarding/QuestionScreen';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { supabase } from '@/lib/supabase';

type State = 'idle' | 'selected' | 'generating' | 'generated' | 'error';

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

  // Animations
  const ringRotation = useSharedValue(0);
  const ringOpacity = useSharedValue(0);
  const imageScale = useSharedValue(1);
  const avatarEntrance = useSharedValue(0);
  const sparkle = useSharedValue(0);

  useEffect(() => {
    if (state === 'generating') {
      ringOpacity.value = withTiming(1, { duration: 300 });
      ringRotation.value = withRepeat(
        withTiming(360, { duration: 2400, easing: Easing.linear }),
        -1,
        false
      );
      imageScale.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      ringOpacity.value = withTiming(0, { duration: 300 });
      ringRotation.value = 0;
      imageScale.value = withTiming(1, { duration: 200 });
    }

    if (state === 'generated') {
      avatarEntrance.value = 0;
      avatarEntrance.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.2)) });
      sparkle.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0, { duration: 800 })
        ),
        -1,
        false
      );
    } else {
      sparkle.value = 0;
    }
  }, [state, ringRotation, ringOpacity, imageScale, avatarEntrance, sparkle]);

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRotation.value}deg` }],
    opacity: ringOpacity.value,
  }));

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }));

  const animatedAvatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarEntrance.value }],
    opacity: avatarEntrance.value,
  }));

  const animatedSparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkle.value,
  }));

  // Loading ellipsis
  const [ellipsis, setEllipsis] = useState('');
  useEffect(() => {
    if (state !== 'generating') return;
    const interval = setInterval(() => {
      setEllipsis((e) => (e === '...' ? '' : e === '' ? '.' : e === '.' ? '..' : '...'));
    }, 500);
    return () => clearInterval(interval);
  }, [state]);

  const handlePickImage = async (useCamera: boolean) => {
    if (pickerOpen) return;
    setPermissionError(null);

    try {
      setPickerOpen(true);
      const result = await (useCamera
        ? ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          }));
      setPickerOpen(false);

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      const resized = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1024, height: 1024 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );
      setPhotoUri(resized.uri);
      setState('selected');
      setErrorMessage(null);
      setPermissionError(null);
    } catch (error) {
      setPickerOpen(false);
      console.error('Image pick failed:', error);
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.toLowerCase().includes('permission')) {
        setPermissionError('Photo library permission required. Enable it in Settings.');
      } else {
        setErrorMessage("Couldn't open your photo library. Try again.");
        Alert.alert('Photo selection failed', "Couldn't open your photo library. Try again.");
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
    } catch (err) {
      console.error('Avatar generation error:', err);
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
    router.push('/(onboarding)/dog-problem');
  };

  const handleSkip = () => {
    router.push('/(onboarding)/dog-problem');
  };

  const renderContent = () => {
    switch (state) {
      case 'idle':
        return (
          <View style={styles.centerContainer}>
            {/* Avatar placeholder — layered rings */}
            <View style={styles.placeholderOuter}>
              <View style={styles.placeholderMiddle}>
                <View style={styles.placeholderInner}>
                  <AppIcon name="paw" size={44} color={colors.brand.primary} />
                  <Text variant="caption" style={styles.placeholderLabel}>
                    No photo yet
                  </Text>
                </View>
              </View>
            </View>

            {/* AI feature highlight — brand green tint */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconCircle}>
                <AppIcon name="sparkles" size={16} color={colors.brand.primary} />
              </View>
              <Text variant="caption" style={styles.infoText}>
                Our AI turns your photo into a beautiful illustrated avatar
              </Text>
            </View>

            {permissionError && (
              <View style={styles.errorBanner}>
                <AppIcon name="alert-circle" size={14} color={colors.error} />
                <Text variant="caption" style={styles.errorBannerText}>
                  {permissionError}
                </Text>
              </View>
            )}

            {/* Action buttons */}
            <View style={styles.photoButtonRow}>
              {[
                { icon: 'camera' as const, label: 'Camera', sub: 'Take a photo', onPress: () => handlePickImage(true) },
                { icon: 'image' as const, label: 'Library', sub: 'From gallery', onPress: () => handlePickImage(false) },
              ].map((btn) => (
                <Pressable
                  key={btn.label}
                  onPress={btn.onPress}
                  style={({ pressed }) => [
                    styles.photoOptionCard,
                    pressed && styles.photoOptionCardPressed,
                  ]}
                >
                  <View style={styles.photoOptionIcon}>
                    <AppIcon name={btn.icon} size={26} color={colors.brand.primary} />
                  </View>
                  <Text style={styles.photoOptionLabel}>{btn.label}</Text>
                  <Text style={styles.photoOptionSub}>{btn.sub}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );

      case 'selected':
        return (
          <View style={styles.centerContainer}>
            <View style={styles.photoPreviewWrapper}>
              <View style={styles.photoPreviewRing}>
                <Image source={{ uri: photoUri! }} style={styles.photoPreviewImage} />
              </View>
              <View style={styles.photoPreviewBadge}>
                <AppIcon name="checkmark" size={14} color="#fff" />
              </View>
            </View>

            <View style={styles.selectedInfo}>
              <Text variant="bodyStrong" style={styles.selectedTitle}>
                Looking good!
              </Text>
              <Text variant="caption" style={styles.selectedSub}>
                We'll use this to generate {dogName}'s custom avatar
              </Text>
            </View>

            <View style={styles.actionsStack}>
              <Button label={`✨ Create ${dogName}'s Avatar`} onPress={generateAvatar} />
              <Pressable onPress={() => handlePickImage(false)} style={styles.textLink}>
                <Text variant="body" style={styles.textLinkLabel}>
                  Choose a different photo
                </Text>
              </Pressable>
            </View>
          </View>
        );

      case 'generating':
        return (
          <View style={styles.centerContainer}>
            <View style={styles.generatingWrapper}>
              {/* Spinning dashed ring */}
              <Animated.View style={[styles.generatingRing, animatedRingStyle]} />
              {/* Photo with pulse */}
              <Animated.View style={[styles.generatingImageWrapper, animatedImageStyle]}>
                {photoUri && (
                  <Image source={{ uri: photoUri }} style={styles.generatingImage} />
                )}
                <View style={styles.generatingOverlay} />
              </Animated.View>
            </View>

            <View style={styles.generatingTextBlock}>
              <Text variant="bodyStrong" style={styles.generatingTitle}>
                Creating {dogName}'s avatar{ellipsis}
              </Text>
              <Text variant="caption" style={styles.generatingSubtitle}>
                This takes about 20–30 seconds
              </Text>
            </View>

            {/* Progress dots */}
            <View style={styles.progressDots}>
              {[0, 1, 2].map((i) => (
                <BounceDot key={i} delay={i * 200} />
              ))}
            </View>
          </View>
        );

      case 'generated':
        return (
          <View style={styles.centerContainer}>
            {/* Before / After */}
            <View style={styles.compareRow}>
              <View style={styles.compareItem}>
                <View style={styles.comparePhotoWrapper}>
                  <Image source={{ uri: photoUri! }} style={styles.comparePhoto} />
                </View>
                <Text variant="caption" style={styles.compareLabel}>Original</Text>
              </View>

              <Animated.View style={[styles.compareArrow, animatedSparkleStyle]}>
                <Text style={styles.compareArrowText}>✨</Text>
              </Animated.View>

              <Animated.View style={[styles.compareItem, animatedAvatarStyle]}>
                <View style={[styles.comparePhotoWrapper, styles.comparePhotoWrapperAccent]}>
                  <Image source={{ uri: avatarUri! }} style={styles.comparePhoto} />
                </View>
                <Text variant="caption" style={styles.compareLabelAccent}>
                  {dogName}'s Avatar
                </Text>
              </Animated.View>
            </View>

            {/* Success badge */}
            <View style={styles.successBadge}>
              <AppIcon name="checkmark-circle" size={16} color={colors.brand.primary} />
              <Text variant="caption" style={styles.successBadgeText}>
                Avatar generated successfully
              </Text>
            </View>

            <View style={styles.actionsStack}>
              <Button label="Use this avatar" onPress={handleUseAvatar} />
              {retryCount < 3 ? (
                <Button label="Try again" onPress={generateAvatar} variant="outline" />
              ) : (
                <Text variant="caption" style={styles.retryNote}>
                  You can regenerate from your profile settings
                </Text>
              )}
            </View>
          </View>
        );

      case 'error':
        return (
          <View style={styles.centerContainer}>
            <View style={styles.photoPreviewWrapper}>
              <View style={styles.photoPreviewRing}>
                <Image source={{ uri: photoUri! }} style={styles.photoPreviewImage} />
              </View>
            </View>

            <View style={styles.errorCard}>
              <AppIcon name="alert-circle" size={20} color={colors.error} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong" style={styles.errorCardTitle}>
                  Generation failed
                </Text>
                <Text variant="caption" style={styles.errorCardText}>
                  {errorMessage}
                </Text>
              </View>
            </View>

            <View style={styles.actionsStack}>
              {retryCount < 3 && (
                <Button label="Try again" onPress={generateAvatar} />
              )}
              <Pressable onPress={() => handlePickImage(false)} style={styles.textLink}>
                <Text variant="body" style={styles.textLinkLabel}>
                  Choose a different photo
                </Text>
              </Pressable>
            </View>
          </View>
        );
    }
  };

  return (
    <QuestionScreen
      title={`Add a photo of ${dogName}`}
      subtitle={`We'll turn it into a custom illustrated avatar`}
      canContinue={false}
      onContinue={() => {}}
      currentStep={2}
      totalSteps={6}
      onBack={() => state !== 'generating' && router.back()}
      scrollable={false}
      footerExtra={
        state !== 'generating' && (
          <Pressable onPress={handleSkip} style={styles.skipLink}>
            <Text variant="body" style={styles.skipLinkLabel}>
              Skip for now
            </Text>
          </Pressable>
        )
      }
    >
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>
    </QuestionScreen>
  );
}

// Small animated dot for the generating state
function BounceDot({ delay }: { delay: number }) {
  const y = useSharedValue(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      y.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: 380, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 380, easing: Easing.in(Easing.ease) })
        ),
        -1,
        false
      );
    }, delay);
    return () => clearTimeout(timeout);
  }, [y, delay]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

const PHOTO_SIZE = 172;
const COMPARE_SIZE = 136;

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.md,
    alignSelf: 'stretch',
  },

  // Idle state
  placeholderOuter: {
    width: PHOTO_SIZE + 32,
    height: PHOTO_SIZE + 32,
    borderRadius: (PHOTO_SIZE + 32) / 2,
    backgroundColor: `${colors.brand.primary}08`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderMiddle: {
    width: PHOTO_SIZE + 12,
    height: PHOTO_SIZE + 12,
    borderRadius: (PHOTO_SIZE + 12) / 2,
    backgroundColor: `${colors.brand.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderInner: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: PHOTO_SIZE / 2,
    borderWidth: 2,
    borderColor: `${colors.brand.primary}40`,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bg.surface,
  },
  placeholderLabel: {
    color: colors.text.secondary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: `${colors.brand.primary}0D`,
    borderWidth: 1.5,
    borderColor: `${colors.brand.primary}25`,
    borderRadius: 16,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    alignSelf: 'stretch',
  },
  infoIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${colors.brand.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    color: colors.text.primary,
    lineHeight: 18,
  },
  photoButtonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  photoOptionCard: {
    width: 148,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.bg.surface,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.border.default,
    paddingVertical: 24,
    paddingHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  photoOptionCardPressed: {
    backgroundColor: `${colors.brand.primary}08`,
    borderColor: colors.brand.primary,
    shadowOpacity: 0.12,
  },
  photoOptionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.brand.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  photoOptionLabel: {
    color: colors.text.primary,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  photoOptionSub: {
    color: colors.text.secondary,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 16,
  },

  // Selected state
  photoPreviewWrapper: {
    position: 'relative',
  },
  photoPreviewRing: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: PHOTO_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.brand.primary,
    shadowColor: colors.shadow.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.20,
    shadowRadius: 16,
    elevation: 6,
  },
  photoPreviewImage: {
    width: '100%',
    height: '100%',
  },
  photoPreviewBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg.surface,
  },
  selectedInfo: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  selectedTitle: {
    color: colors.text.primary,
    fontSize: 17,
  },
  selectedSub: {
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // Generating state
  generatingWrapper: {
    width: PHOTO_SIZE + 32,
    height: PHOTO_SIZE + 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generatingRing: {
    position: 'absolute',
    width: PHOTO_SIZE + 28,
    height: PHOTO_SIZE + 28,
    borderRadius: (PHOTO_SIZE + 28) / 2,
    borderWidth: 2.5,
    borderColor: colors.brand.primary,
    borderStyle: 'dashed',
  },
  generatingImageWrapper: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: PHOTO_SIZE / 2,
    overflow: 'hidden',
  },
  generatingImage: {
    width: '100%',
    height: '100%',
  },
  generatingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  generatingTextBlock: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  generatingTitle: {
    color: colors.text.primary,
    fontSize: 17,
  },
  generatingSubtitle: {
    color: colors.text.secondary,
  },
  progressDots: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    height: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.primary,
  },

  // Generated state
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  compareItem: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  comparePhotoWrapper: {
    width: COMPARE_SIZE,
    height: COMPARE_SIZE,
    borderRadius: COMPARE_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border.default,
    shadowColor: colors.shadow.soft,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 3,
  },
  comparePhotoWrapperAccent: {
    borderColor: colors.brand.primary,
    borderWidth: 3,
    shadowColor: colors.shadow.success,
    shadowOpacity: 0.22,
  },
  comparePhoto: {
    width: '100%',
    height: '100%',
  },
  compareLabel: {
    color: colors.text.secondary,
  },
  compareLabelAccent: {
    color: colors.brand.primary,
    fontWeight: '600',
  },
  compareArrow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareArrowText: {
    fontSize: 24,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.status.successBg,
    borderWidth: 1,
    borderColor: colors.status.successBorder,
    borderRadius: 20,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
  },
  successBadgeText: {
    color: colors.brand.primary,
    fontWeight: '600',
  },

  // Error state
  errorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.status.dangerBg,
    borderWidth: 1,
    borderColor: colors.status.dangerBorder,
    borderRadius: 14,
    padding: spacing.md,
    alignSelf: 'stretch',
  },
  errorCardTitle: {
    color: colors.error,
    marginBottom: 2,
  },
  errorCardText: {
    color: colors.text.secondary,
    lineHeight: 18,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.status.dangerBg,
    borderWidth: 1,
    borderColor: colors.status.dangerBorder,
    borderRadius: 10,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    alignSelf: 'stretch',
  },
  errorBannerText: {
    flex: 1,
    color: colors.error,
  },

  // Shared
  actionsStack: {
    alignSelf: 'stretch',
    gap: spacing.md,
  },
  textLink: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  textLinkLabel: {
    color: colors.brand.primary,
    fontWeight: '500',
  },
  retryNote: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
  skipLink: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  skipLinkLabel: {
    color: colors.text.secondary,
  },
});
