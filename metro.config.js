const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Allow Metro to bundle TFLite model files as static assets.
// react-native-fast-tflite loads models via the asset system.
config.resolver.assetExts = [
  ...(config.resolver.assetExts ?? []),
  'tflite',
];

module.exports = withNativeWind(config, { input: './global.css' });
