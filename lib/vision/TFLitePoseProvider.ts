// ─────────────────────────────────────────────────────────────────────────────
// TFLitePoseProvider
//
// Thin wrapper around a TFLite model for dog pose inference.
//
// The primary path is now the frame-processor pipeline in usePoseSession:
//   frame.toArrayBuffer() → nearest-neighbor downsample → runSync()
//
// This class is kept for any future still-image / URI-based use.
//
// IMPORTANT: Requires a native dev build — will NOT run in Expo Go.
// ─────────────────────────────────────────────────────────────────────────────

// Local mirror of TensorflowModel to avoid top-level fast-tflite import side-effects.
interface TFModel {
  run(inputs: ArrayBufferView[]): Promise<ArrayBufferView[]>;
  runSync(inputs: ArrayBufferView[]): ArrayBufferView[];
}

export class TFLitePoseProvider {
  private model: TFModel | null = null;

  isLoaded(): boolean {
    return this.model !== null;
  }

  setModel(model: TFModel): void {
    this.model = model;
  }

  getModel(): TFModel | null {
    return this.model;
  }
}
