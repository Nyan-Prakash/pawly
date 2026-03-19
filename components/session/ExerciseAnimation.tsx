import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface ExerciseAnimationProps {
  animationJson: object | null | undefined;
  size?: number;
}

export function ExerciseAnimation({ animationJson, size = 150 }: ExerciseAnimationProps) {
  if (!animationJson) return null;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <LottieView
        source={animationJson}
        autoPlay
        loop
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
});
