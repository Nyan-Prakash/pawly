import { useCallback, useEffect, useRef, useState } from 'react';
import type { Camera } from 'react-native-vision-camera';
import { useFrameProcessor, runAtTargetFps } from 'react-native-vision-camera';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import { Worklets } from 'react-native-worklets-core';

import {
  DEFAULT_DETECTION_THRESHOLD,
  DEFAULT_KEYPOINT_THRESHOLD,
} from '@/lib/vision/poseDecoder';
import type { PoseObservation } from '@/types/pose';
import { DOG_KEYPOINT_NAMES } from '@/types/pose';

const MODEL_SOURCE  = require('../assets/models/dog_pose/best_float16.tflite');
const MODEL_SIZE    = 640;
const N_CANDIDATES  = 8400;
const N_DIMS        = 77;
const N_KP          = 24;
const KP_BASE_D     = 5;

// ── Module-level dispatch targets (same pattern as VisionCamera internals) ──
// These are plain vars — updated by the mounted component, called by the
// module-level host functions below.
let _dispatchResult = (_obs: PoseObservation | null) => {};
let _dispatchError  = (_msg: string) => {};

// Stable host functions created once at module load — safe to capture in
// worklet closures because they are module-level constants, not closure vars.
const _notifyResult = Worklets.createRunOnJS((obs: PoseObservation | null) => {
  _dispatchResult(obs);
});
const _notifyError = Worklets.createRunOnJS((msg: string) => {
  _dispatchError(msg);
});

// ────────────────────────────────────────────────────────────────────────────

export interface PoseSessionState {
  observation: PoseObservation | null;
  cameraRef: React.RefObject<Camera>;
  isModelLoaded: boolean;
  isRunning: boolean;
  error: string | null;
  frameProcessor: ReturnType<typeof useFrameProcessor>;
  startSession: () => void;
  pauseSession: () => void;
  stopSession: () => void;
}

export function usePoseSession(): PoseSessionState {
  const cameraRef = useRef<Camera>(null);
  const [isRunning, setIsRunning]     = useState(false);
  const [observation, setObservation] = useState<PoseObservation | null>(null);
  const [error, setError]             = useState<string | null>(null);

  const isRunningShared = useRef(Worklets.createSharedValue(false)).current;

  const tfModel       = useTensorflowModel(MODEL_SOURCE, 'core-ml');
  const isModelLoaded = tfModel.state === 'loaded';
  const model         = tfModel.state === 'loaded' ? tfModel.model : undefined;

  const { resize } = useResizePlugin();

  // Wire component setState into the module-level dispatch targets
  useEffect(() => {
    _dispatchResult = (obs) => setObservation(obs);
    _dispatchError  = (msg) => setError(msg);
    return () => {
      _dispatchResult = () => {};
      _dispatchError  = () => {};
    };
  }, []);

  useEffect(() => {
    if (tfModel.state === 'error') {
      setError(tfModel.error?.message ?? 'Failed to load TFLite model');
    }
  }, [tfModel.state]); // eslint-disable-line react-hooks/exhaustive-deps

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';

      if (!isRunningShared.value) return;
      if (model == null) return;

      // Throttle to 10 FPS — inference is expensive, no need to run at 30/60fps
      runAtTargetFps(10, () => {
        'worklet';
        try {
          // 1. Native C++ resize → 640×640 RGB float32
          const resized = resize(frame, {
            scale:       { width: MODEL_SIZE, height: MODEL_SIZE },
            pixelFormat: 'rgb',
            dataType:    'float32',
            rotation:    '90deg',
          });

          // 2. Run inference
          const outputs = model.runSync([resized]);
          if (outputs.length === 0) return;

          // 3. Copy HostObject output into a plain Float32Array
          const rawOut = outputs[0];
          const total  = N_DIMS * N_CANDIDATES;
          const f32    = new Float32Array(total);
          for (let i = 0; i < total; i++) {
            // @ts-ignore
            f32[i] = rawOut[i];
          }

          // 4. Find best candidate (confidence at dim=4)
          let bestIdx  = -1;
          let bestConf = DEFAULT_DETECTION_THRESHOLD;
          for (let i = 0; i < N_CANDIDATES; i++) {
            const conf = f32[4 * N_CANDIDATES + i];
            if (conf > bestConf) { bestConf = conf; bestIdx = i; }
          }

          if (bestIdx === -1) {
            _notifyResult(null);
            return;
          }

          // 5. Extract bbox + keypoints
          const cx = f32[0 * N_CANDIDATES + bestIdx];
          const cy = f32[1 * N_CANDIDATES + bestIdx];
          const w  = f32[2 * N_CANDIDATES + bestIdx];
          const h  = f32[3 * N_CANDIDATES + bestIdx];

          const keypoints: PoseObservation['keypoints'] = [];
          for (let k = 0; k < N_KP; k++) {
            const x     = f32[(KP_BASE_D + k * 3 + 0) * N_CANDIDATES + bestIdx];
            const y     = f32[(KP_BASE_D + k * 3 + 1) * N_CANDIDATES + bestIdx];
            const score = f32[(KP_BASE_D + k * 3 + 2) * N_CANDIDATES + bestIdx];
            if (score >= DEFAULT_KEYPOINT_THRESHOLD) {
              keypoints.push({
                name:  DOG_KEYPOINT_NAMES[k] as PoseObservation['keypoints'][number]['name'],
                index: k,
                x, y, score,
              });
            }
          }

          _notifyResult({
            confidence: bestConf,
            bbox:       { cx, cy, w, h },
            keypoints,
            timestamp:  Date.now(),
            sourceWidth:  MODEL_SIZE,
            sourceHeight: MODEL_SIZE,
          });
        } catch (e) {
          _notifyError(String(e));
        }
      });
    },
    [model, resize, isRunningShared]
  );

  const startSession = useCallback(() => {
    isRunningShared.value = true;
    setIsRunning(true);
    setError(null);
  }, [isRunningShared]);

  const pauseSession = useCallback(() => {
    isRunningShared.value = false;
    setIsRunning(false);
  }, [isRunningShared]);

  const stopSession = useCallback(() => {
    isRunningShared.value = false;
    setIsRunning(false);
    setObservation(null);
  }, [isRunningShared]);

  return {
    observation,
    cameraRef,
    isModelLoaded,
    isRunning,
    error,
    frameProcessor,
    startSession,
    pauseSession,
    stopSession,
  };
}
