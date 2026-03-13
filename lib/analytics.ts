export function captureEvent(event: string, properties?: Record<string, unknown>) {
  if (__DEV__) {
    console.log(`[analytics] ${event}`, properties ?? {});
  }
}
