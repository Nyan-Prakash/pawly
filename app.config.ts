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
    infoPlist: {
      NSCameraUsageDescription:
        "Pawly uses the camera to provide real-time AI feedback and coaching during your training sessions.",
      NSPhotoLibraryUsageDescription:
        "Pawly uses your photo library so you can choose photos and videos of your dog for avatars and training uploads.",
      NSPhotoLibraryAddUsageDescription:
        "Pawly may save generated dog avatars to your device when you choose to keep them.",
      NSMicrophoneUsageDescription:
        'Microphone access is requested by the camera framework; Pawly does not record audio.'
    }
  },
  android: {
    icon: './assets/app-icon.png',
    permissions: ['android.permission.CAMERA']
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-asset',
    [
      'expo-image-picker',
      {
        photosPermission:
          "Pawly uses your photo library so you can choose photos and videos of your dog for avatars and training uploads.",
        cameraPermission:
          "Pawly uses the camera so you can take photos and videos of your dog for avatars and training uploads."
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
  experiments: {
    typedRoutes: true
  },
  extra: {
    eas: {
      projectId: '541f4302-8758-49d8-acc8-d89c1db3d59c'
    }
  }
});
