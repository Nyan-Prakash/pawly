import { useEffect, useRef, useState, useCallback } from 'react';
import { Audio } from 'expo-av';
import { Vibration } from 'react-native';

const CLICKER_SOUND = require('@/assets/audio/clicker.mp3');
const WHISTLE_SOUND = require('@/assets/audio/whistle.mp3');

export function useTrainingToolAudio() {
  const clickerSoundRef = useRef<Audio.Sound | null>(null);
  const whistleSoundRef = useRef<Audio.Sound | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSounds = useCallback(async () => {
    try {
      // Unload if already loaded
      if (clickerSoundRef.current) await clickerSoundRef.current.unloadAsync();
      if (whistleSoundRef.current) await whistleSoundRef.current.unloadAsync();

      const { sound: clickerSound } = await Audio.Sound.createAsync(CLICKER_SOUND);
      const { sound: whistleSound } = await Audio.Sound.createAsync(WHISTLE_SOUND);

      clickerSoundRef.current = clickerSound;
      whistleSoundRef.current = whistleSound;
      setIsReady(true);
    } catch (err) {
      console.error('Failed to load training sounds:', err);
      setError('Failed to load audio assets');
    }
  }, []);

  useEffect(() => {
    loadSounds();
    return () => {
      clickerSoundRef.current?.unloadAsync();
      whistleSoundRef.current?.unloadAsync();
    };
  }, [loadSounds]);

  const playClicker = useCallback(async () => {
    if (!clickerSoundRef.current) return;
    try {
      await clickerSoundRef.current.stopAsync();
      await clickerSoundRef.current.playAsync();
      Vibration.vibrate(30);
    } catch (err) {
      console.error('Error playing clicker:', err);
    }
  }, []);

  const playWhistle = useCallback(async (isLong = false) => {
    if (!whistleSoundRef.current) return;
    try {
      await whistleSoundRef.current.stopAsync();
      if (isLong) {
        await whistleSoundRef.current.setIsLoopingAsync(true);
        Vibration.vibrate([0, 100, 100], true); // Pattern for continuous vibration
      } else {
        await whistleSoundRef.current.setIsLoopingAsync(false);
        Vibration.vibrate(50);
      }
      await whistleSoundRef.current.playAsync();
    } catch (err) {
      console.error('Error playing whistle:', err);
    }
  }, []);

  const stopWhistle = useCallback(async () => {
    if (!whistleSoundRef.current) return;
    try {
      await whistleSoundRef.current.stopAsync();
      await whistleSoundRef.current.setIsLoopingAsync(false);
      Vibration.cancel();
    } catch (err) {
      console.error('Error stopping whistle:', err);
    }
  }, []);

  return {
    isReady,
    error,
    playClicker,
    playWhistle,
    stopWhistle,
  };
}
