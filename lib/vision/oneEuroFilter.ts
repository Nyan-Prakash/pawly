// ─────────────────────────────────────────────────────────────────────────────
// One Euro Filter
//
// A low-latency, adaptive smoothing filter for scalar signals.
//
// Reference: Géry Casiez, Nicolas Roussel, Daniel Vogel. "1€ Filter: A Simple
// Speed-based Low-pass Filter for Noisy Input in Interactive Systems."
// CHI 2012.
//
// The filter adapts its cutoff frequency based on the current rate of change:
//   - when the signal is slow/static → high smoothing (low cutoff)
//   - when the signal moves fast     → less smoothing (high cutoff) for responsiveness
//
// Each coordinate (x, y) gets its own independent filter instance.
// ─────────────────────────────────────────────────────────────────────────────

/** Tuning parameters for a OneEuroFilter. */
export interface OneEuroParams {
  /** Sampling frequency in Hz (frames per second). Default: 10. */
  freq?: number;
  /** Minimum cutoff frequency in Hz. Lower = more smoothing at rest. Default: 1.0. */
  minCutoff?: number;
  /** Speed coefficient. Higher = more responsive to fast motion. Default: 0.007. */
  beta?: number;
  /** Cutoff for the derivative low-pass filter. Default: 1.0. */
  dCutoff?: number;
}

// ── Internal low-pass filter ──────────────────────────────────────────────────

interface LowPassState {
  y: number;
  initialized: boolean;
}

function lowPassAlpha(cutoff: number, freq: number): number {
  const te = 1.0 / freq;
  const tau = 1.0 / (2 * Math.PI * cutoff);
  return 1.0 / (1.0 + tau / te);
}

function lowPassFilter(state: LowPassState, x: number, alpha: number): number {
  if (!state.initialized) {
    state.y = x;
    state.initialized = true;
    return x;
  }
  state.y = alpha * x + (1 - alpha) * state.y;
  return state.y;
}

// ── One Euro Filter (scalar) ──────────────────────────────────────────────────

export interface OneEuroFilterState {
  freq: number;
  minCutoff: number;
  beta: number;
  dCutoff: number;
  xState: LowPassState;
  dxState: LowPassState;
  lastValue: number | null;
}

/** Create a new filter state with default or custom parameters. */
export function createOneEuroFilter(params: OneEuroParams = {}): OneEuroFilterState {
  return {
    freq:      params.freq      ?? 10,
    minCutoff: params.minCutoff ?? 1.0,
    beta:      params.beta      ?? 0.007,
    dCutoff:   params.dCutoff   ?? 1.0,
    xState:    { y: 0, initialized: false },
    dxState:   { y: 0, initialized: false },
    lastValue: null,
  };
}

/**
 * Feed a new raw value into the filter and return the smoothed value.
 * Mutates the filter state in place.
 */
export function oneEuroFilterStep(state: OneEuroFilterState, rawValue: number): number {
  const dx = state.lastValue === null ? 0 : (rawValue - state.lastValue) * state.freq;
  state.lastValue = rawValue;

  const dAlpha     = lowPassAlpha(state.dCutoff, state.freq);
  const dxHat      = lowPassFilter(state.dxState, dx, dAlpha);
  const cutoff     = state.minCutoff + state.beta * Math.abs(dxHat);
  const alpha      = lowPassAlpha(cutoff, state.freq);
  return lowPassFilter(state.xState, rawValue, alpha);
}

/** Reset filter to uninitialized state (e.g. after tracking loss). */
export function resetOneEuroFilter(state: OneEuroFilterState): void {
  state.xState  = { y: 0, initialized: false };
  state.dxState = { y: 0, initialized: false };
  state.lastValue = null;
}

// ── 2D Filter (x + y pair) ────────────────────────────────────────────────────

export interface OneEuroFilter2DState {
  x: OneEuroFilterState;
  y: OneEuroFilterState;
}

export function createOneEuroFilter2D(params: OneEuroParams = {}): OneEuroFilter2DState {
  return {
    x: createOneEuroFilter(params),
    y: createOneEuroFilter(params),
  };
}

export function oneEuroFilter2DStep(
  state: OneEuroFilter2DState,
  rawX: number,
  rawY: number
): { x: number; y: number } {
  return {
    x: oneEuroFilterStep(state.x, rawX),
    y: oneEuroFilterStep(state.y, rawY),
  };
}

export function resetOneEuroFilter2D(state: OneEuroFilter2DState): void {
  resetOneEuroFilter(state.x);
  resetOneEuroFilter(state.y);
}
