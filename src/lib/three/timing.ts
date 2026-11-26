export function clampFrameDelta(rawSeconds: number, maxDeltaSec = 0.08): number {
  if (!Number.isFinite(rawSeconds) || rawSeconds < 0) return 0;
  return Math.min(rawSeconds, maxDeltaSec);
}

export interface DeltaTimer {
  step: (nowMs?: number) => { delta: number; elapsed: number };
  reset: (nowMs?: number) => void;
}

/**
 * High-resolution timing helper replacing deprecated THREE.Clock.
 * Zero Three.js dependency so pure frame-delta math is deterministically testable.
 */
export function createDeltaTimer(
  initialNowMs?: number,
  maxDeltaSec = 0.08,
): DeltaTimer {
  const readNow = () =>
    typeof performance !== "undefined" && typeof performance.now === "function"
      ? performance.now()
      : Date.now();

  let startMs = initialNowMs ?? readNow();
  let lastMs = startMs;

  return {
    step(nowMs?: number) {
      const current = nowMs ?? readNow();
      const rawDeltaSec = (current - lastMs) / 1000;
      lastMs = current;
      const delta = clampFrameDelta(rawDeltaSec, maxDeltaSec);
      const elapsed = Math.max(0, (current - startMs) / 1000);
      return { delta, elapsed };
    },
    reset(nowMs?: number) {
      const current = nowMs ?? readNow();
      startMs = current;
      lastMs = current;
    },
  };
}

export function resolveSlideYawOffset(slideIndex: number): number {
  if (slideIndex === 4) return -0.14;
  if (slideIndex === 1) return 0.06;
  return 0;
}
