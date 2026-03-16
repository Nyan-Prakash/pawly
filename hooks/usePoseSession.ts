import { useCallback, useEffect, useRef, useState } from 'react';
import type { Camera } from 'react-native-vision-camera';
import { useTensorflowModel } from 'react-native-fast-tflite';

import { TFLitePoseProvider } from '@/lib/vision/TFLitePoseProvider';
import type { PoseObservation } from '@/types/pose';

const MODEL_SOURCE = require('../assets/models/dog_pose/best_float16.tflite');
const INFERENCE_INTERVAL_MS = 120;

export interface PoseSessionState {
  observation: PoseObservation | null;
  cameraRef: React.RefObject<Camera>;
  isModelLoaded: boolean;
  isRunning: boolean;
  error: string | null;
  startSession: () => void;
  pauseSession: () => void;
  stopSession: () => void;
}

export function usePoseSession(): PoseSessionState {
  const cameraRef = useRef<Camera>(null);
  const providerRef = useRef(new TFLitePoseProvider());

  const [isRunning, setIsRunning] = useState(false);
  const [observation, setObservation] = useState<PoseObservation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inferringRef = useRef(false);
  const mountedRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load model via hook — same pattern as pawTest
  const tfModel = useTensorflowModel(MODEL_SOURCE, 'core-ml');
  const isModelLoaded = tfModel.state === 'loaded';

  // Wire the loaded model into the provider
  useEffect(() => {
    mountedRef.current = true;
    if (tfModel.state === 'loaded') {
      providerRef.current.setModel(tfModel.model);
    } else if (tfModel.state === 'error') {
      setError(tfModel.error?.message ?? 'Failed to load TFLite model');
    }
    return () => {
      mountedRef.current = false;
      clearIntervalIfSet();
    };
  }, [tfModel.state]); // eslint-disable-line react-hooks/exhaustive-deps

  function clearIntervalIfSet() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  const runTick = useCallback(async () => {
    if (inferringRef.current) return;
    if (!providerRef.current.isLoaded()) return;
    if (!cameraRef.current) return;

    inferringRef.current = true;
    try {
      const photo = await cameraRef.current.takePhoto({ flash: 'off' });
      const uri = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`;
      const result = await providerRef.current.processImageUri(uri);
      if (mountedRef.current) {
        setObservation(result);
        setError(null);
      }
    } catch (err: unknown) {
      if (mountedRef.current) setError(String(err));
    } finally {
      inferringRef.current = false;
    }
  }, []);

  const startSession = useCallback(() => {
    if (intervalRef.current !== null) return;
    setIsRunning(true);
    setError(null);
    intervalRef.current = setInterval(runTick, INFERENCE_INTERVAL_MS);
  }, [runTick]);

  const pauseSession = useCallback(() => {
    clearIntervalIfSet();
    setIsRunning(false);
  }, []);

  const stopSession = useCallback(() => {
    clearIntervalIfSet();
    setIsRunning(false);
    setObservation(null);
  }, []);

  return { observation, cameraRef, isModelLoaded, isRunning, error, startSession, pauseSession, stopSession };
}
