import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Pawly',
  slug: 'pawly',
  scheme: 'pawly',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  icon: './assets/app-icon.png',
  ios: {
    icon: './assets/app-icon.png',
    bundleIdentifier: 'com.nyan.prakash.pawly',
    supportsTablet: false,
    // Adds the Sign in with Apple entitlement; without it the Apple button fails in store builds.
    usesAppleSignIn: true,
    // Required-reason APIs used by React Native, Expo and AsyncStorage.
    privacyManifests: {
      NSPrivacyTracking: false,
      NSPrivacyAccessedAPITypes: [
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults', NSPrivacyAccessedAPITypeReasons: ['CA92.1'] },
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp', NSPrivacyAccessedAPITypeReasons: ['C617.1', '0A2A.1', '3B52.1'] },
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryDiskSpace', NSPrivacyAccessedAPITypeReasons: ['E174.1', '85F4.1'] },
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategorySystemBootTime', NSPrivacyAccessedAPITypeReasons: ['35F9.1'] }
      ]
    },
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSCameraUsageDescription:
        "Pawly uses the camera to provide real-time AI feedback and coaching during your training sessions.",
      NSPhotoLibraryUsageDescription:
        "Pawly uses your photo library so you can choose a photo of your dog to create an avatar.",
      NSPhotoLibraryAddUsageDescription:
        "Pawly may save generated dog avatars to your device when you choose to keep them.",
      NSMicrophoneUsageDescription:
        'Pawly does not record audio. Training sessions use the camera only.'
    }
  },
  android: {
    icon: './assets/app-icon.png',
    package: 'com.nyan.prakash.pawly',
    adaptiveIcon: {
      foregroundImage: './assets/app-icon.png',
      backgroundColor: '#F7F2EC'
    },
    permissions: ['android.permission.CAMERA']
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-asset',
    'expo-apple-authentication',
    [
      'expo-splash-screen',
      {
        image: './assets/mascot.png',
        imageWidth: 160,
        resizeMode: 'contain',
        backgroundColor: '#F7F2EC',
        dark: {
          image: './assets/mascot.png',
          backgroundColor: '#151412'
        }
      }
    ],
    [
      'expo-notifications',
      {
        color: '#F7F2EC'
      }
    ],
    // Uploads source maps during EAS builds when SENTRY_AUTH_TOKEN, SENTRY_ORG
    // and SENTRY_PROJECT are set in the EAS environment; skipped otherwise.
    '@sentry/react-native/expo',
    [
      'expo-image-picker',
      {
        photosPermission:
          "Pawly uses your photo library so you can choose a photo of your dog to create an avatar.",
        cameraPermission:
          "Pawly uses the camera so you can take a photo of your dog to create an avatar."
      }
    ],
    [
      'react-native-vision-camera',
      {
        cameraPermissionText:
          "Pawly uses the camera to provide real-time AI feedback and coaching during your training sessions.",
        enableMicrophonePermission: false
      }
    ]
  ],
  // OTA JavaScript fixes through EAS Update. A new native build gets a new
  // runtime version automatically, so an update never reaches an incompatible binary.
  runtimeVersion: { policy: 'appVersion' },
  updates: {
    url: 'https://u.expo.dev/541f4302-8758-49d8-acc8-d89c1db3d59c',
    fallbackToCacheTimeout: 0
  },
  experiments: {
    typedRoutes: true
  },
  owner: 'nyan.prakash',
  extra: {
    eas: {
      projectId: '541f4302-8758-49d8-acc8-d89c1db3d59c'
    }
  }
});
