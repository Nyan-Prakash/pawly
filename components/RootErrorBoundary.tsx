import { useEffect } from 'react';
import { View } from 'react-native';
import type { ErrorBoundaryProps } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { captureError } from '@/lib/sentry';

/** Shown by expo-router when a screen throws while rendering. */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    captureError(error, { where: 'RootErrorBoundary' });
  }, [error]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg.app,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xxl,
        gap: spacing.lg,
      }}
    >
      <View style={{ alignItems: 'center', gap: spacing.xs }}>
        <Text variant="h2" style={{ textAlign: 'center' }}>
          Something went wrong
        </Text>
        <Text variant="caption" style={{ textAlign: 'center' }}>
          Your training history is safe. Try again, and if it keeps happening, restart the app.
        </Text>
      </View>
      <Button label="Try again" onPress={retry} />
    </View>
  );
}
