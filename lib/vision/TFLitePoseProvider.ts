// ─────────────────────────────────────────────────────────────────────────────
// TFLitePoseProvider
//
// Loads best_float16.tflite and runs single-image pose inference.
// All preprocessing is done on-device: resize → JPEG → decode → float32.
//
// IMPORTANT: Requires a native dev build — will NOT run in Expo Go.
//            After changing native dependencies, rebuild the binary:
//              iOS:  npx expo run:ios
//              EAS:  eas build --profile development --platform ios
//
// ── react-native-fast-tflite API (v1/v2, same surface) ───────────────────────
//
//   import { loadTensorflowModel } from 'react-native-fast-tflite'
//
//   loadTensorflowModel(source, delegate?): Promise<TensorflowModel>
//     source  – number (Metro require asset ID) or { url: string }
//     delegate – 'default' | 'metal' | 'core-ml' | 'nnapi' | 'android-gpu'
//
//   TensorflowModel:
//     .inputs  : Tensor[]   – [{ name, shape, dataType }]
//     .outputs : Tensor[]   – [{ name, shape, dataType }]
//     .run(inputs: TypedArray[]): Promise<TypedArray[]>
//       – inputs  : one TypedArray per input tensor, in order
//       – outputs : one TypedArray per output tensor, in order
//
//   For our model: one input tensor (float32 [1,640,640,3]),
//                  one output tensor (float32 [1,77,8400]).
//   We pass [inputFloat32] and receive [outputFloat32].
//   The output is flat row-major; we strip the batch dim (offset 0) and
//   forward the 77×8400 slice to poseDecoder.
// ─────────────────────────────────────────────────────────────────────────────

// react-native-fast-tflite calls TensorflowModule.install() at import time,
// which crashes with "TurboModule 'Tflite' not found" if the native binary
// doesn't have it linked yet (e.g. wrong build, or imported before the module
// registers). We defer the require() to loadModel() so the module is only
// touched when the user explicitly opens the pose debug screen.
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import jpeg from 'jpeg-js';

import { decodePoseOutput, type DecodeOptions } from '@/lib/vision/poseDecoder';
import type { PoseObservation } from '@/types/pose';

// Local mirror of TensorflowModel so we have zero top-level imports from
// react-native-fast-tflite (its module runs TensorflowModule.install() as a
// side-effect on require, which crashes if the native binary is stale).
interface TFModel {
  run(inputs: ArrayBufferView[]): Promise<ArrayBufferView[]>;
}

// ── Constants ─────────────────────────────────────────────────────────────────

/** Model input resolution (must match the YOLO export config). */
const MODEL_SIZE = 640;



// ── Preprocessing helpers ─────────────────────────────────────────────────────

/**
 * Resize the image at `uri` to MODEL_SIZE × MODEL_SIZE and return it as a
 * base64-encoded JPEG string.
 */
async function resizeToBase64Jpeg(uri: string): Promise<string> {
  const result = await manipulateAsync(
    uri,
    [{ resize: { width: MODEL_SIZE, height: MODEL_SIZE } }],
    { format: SaveFormat.JPEG, base64: true, compress: 1.0 }
  );

  if (!result.base64) {
    throw new Error('[TFLitePoseProvider] expo-image-manipulator returned no base64 data.');
  }

  return result.base64;
}

/**
 * Decode a base64 JPEG string to a Float32Array of RGB values normalised
 * to [0, 1]. Shape: [MODEL_SIZE * MODEL_SIZE * 3] (no batch dim).
 *
 * jpeg-js decodes to RGBA (4 channels); we extract only R, G, B.
 */
function jpegBase64ToFloat32(base64: string): Float32Array {
  // base64 → Uint8Array
  const binary = globalThis.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  // jpeg-js decode → RGBA Uint8ClampedArray
  const { data: rgba, width, height } = jpeg.decode(bytes, { useTArray: true });

  const numPixels = width * height; // 640 * 640 = 409_600
  const float32 = new Float32Array(numPixels * 3);

  for (let p = 0; p < numPixels; p++) {
    const src = p * 4;
    const dst = p * 3;
    float32[dst + 0] = rgba[src + 0] / 255; // R
    float32[dst + 1] = rgba[src + 1] / 255; // G
    float32[dst + 2] = rgba[src + 2] / 255; // B
  }

  return float32;
}

/**
 * The model output has shape [1, 77, 8400] in row-major order.
 * The library returns a flat TypedArray of length 1*77*8400 = 646_800.
 * Batch dim is always 0 so the useful data starts at offset 0 — we can
 * reinterpret directly without copying.
 */
function toFloat32Array(raw: ArrayBufferView): Float32Array {
  if (raw instanceof Float32Array) return raw;
  // Handles cases where the runtime wraps a different view type.
  return new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
}

// ── Provider class ────────────────────────────────────────────────────────────

/**
 * Loads best_float16.tflite and exposes single-image pose inference.
 *
 * Usage:
 *   const provider = new TFLitePoseProvider();
 *   await provider.loadModel();
 *   const obs = await provider.processImageUri(uri);
 */
export class TFLitePoseProvider {
  private model: TFModel | null = null;

  /** True once the model has been set. */
  isLoaded(): boolean {
    return this.model !== null;
  }

  /** Called by usePoseSession once useTensorflowModel reports state==='loaded'. */
  setModel(model: TFModel): void {
    this.model = model;
  }

  /**
   * Run pose inference on the image at `uri`.
   *
   * @param uri     Local file URI (e.g. from camera.takePhoto()).
   * @param options Optional decode thresholds / metadata.
   * @returns       PoseObservation or null if no dog clears the threshold.
   */
  async processImageUri(
    uri: string,
    options?: Omit<DecodeOptions, 'sourceWidth' | 'sourceHeight'>
  ): Promise<PoseObservation | null> {
    if (!this.model) {
      throw new Error('[TFLitePoseProvider] Model not loaded. Call loadModel() first.');
    }

    // 1. Resize → JPEG base64
    const base64Jpeg = await resizeToBase64Jpeg(uri);

    // 2. Decode JPEG → RGB float32
    const inputTensor = jpegBase64ToFloat32(base64Jpeg);

    // 3. Run inference
    //    model.run() takes TypedArray[] (one per input tensor) and returns
    //    TypedArray[] (one per output tensor).
    let outputs: ArrayBufferView[];
    try {
      outputs = await this.model.run([inputTensor]);
    } catch (err) {
      throw new Error(`[TFLitePoseProvider] Inference failed: ${String(err)}`);
    }

    if (outputs.length === 0) {
      throw new Error('[TFLitePoseProvider] Model returned no output tensors.');
    }

    // 4. Decode — first (and only) output tensor: shape [1, 77, 8400]
    const flatOutput = toFloat32Array(outputs[0]);

    return decodePoseOutput(flatOutput, {
      ...options,
      sourceWidth: MODEL_SIZE,
      sourceHeight: MODEL_SIZE,
    });
  }
}
