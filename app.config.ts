import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Pawly',
  slug: 'pawly',
  scheme: 'pawly',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  ios: {
    bundleIdentifier: 'com.nyan.prakash.pawly'
  },
  plugins: ['expo-router', 'expo-secure-store', 'expo-asset'],
  experiments: {
    typedRoutes: true
  },
  extra: {
    eas: {
      projectId: '00000000-0000-0000-0000-000000000000'
    }
  }
});
