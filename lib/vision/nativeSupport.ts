import Constants from 'expo-constants';

function isExpoGo(): boolean {
  return Constants.executionEnvironment === 'storeClient';
}

export function getPoseDebugUnavailableReason(): string | null {
  if (isExpoGo()) {
    return 'Pose Debug requires a development build. Expo Go does not include VisionCamera or TFLite.';
  }
  return null;
}
