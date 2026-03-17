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
        "Pawly uses the camera to analyze your dog's pose in real time during training sessions.",
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
      'react-native-vision-camera',
      {
        cameraPermissionText:
          "Pawly uses the camera to analyze your dog's pose in real time during training sessions.",
        enableMicrophonePermission: false
      }
    ],
    'react-native-fast-tflite'
  ],
  // expo-asset bundles extra files so Metro can resolve them at runtime.
  // The TFLite model is gitignored (large binary) — place it at the path below
  // before building. See assets/models/dog_pose/README.md.
  assetBundlePatterns: ['assets/models/**/*'],
  experiments: {
    typedRoutes: true
  },
  extra: {
    eas: {
      projectId: '00000000-0000-0000-0000-000000000000'
    }
  }
});
