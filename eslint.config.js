// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    rules: {
      // A web rule: apostrophes in <Text> are fine in React Native.
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    ignores: ['node_modules/*', 'dist/*', '.expo/*', 'ios/*', 'android/*', 'supabase/functions/*'],
  },
]);
