import assert from "node:assert/strict";
import test from "node:test";
import {
  clampFrameDelta,
  createDeltaTimer,
  resolveSlideYawOffset,
} from "./timing";

test("clampFrameDelta bounds runaway, negative, and non-finite elapsed seconds", () => {
  assert.equal(clampFrameDelta(0.016), 0.016);
  assert.equal(clampFrameDelta(1.5), 0.08);
  assert.equal(clampFrameDelta(-0.2), 0);
  assert.equal(clampFrameDelta(Number.NaN), 0);
  assert.equal(clampFrameDelta(Number.POSITIVE_INFINITY), 0);
});

test("createDeltaTimer computes delta and elapsed without THREE.Clock", () => {
  const timer = createDeltaTimer(1000, 0.08);
  const f1 = timer.step(1016);
  assert.ok(Math.abs(f1.delta - 0.016) < 1e-9);
  assert.ok(Math.abs(f1.elapsed - 0.016) < 1e-9);

  // Tab switch pause clamps large delta while preserving total elapsed time
  const f2 = timer.step(3016);
  assert.equal(f2.delta, 0.08);
  assert.ok(Math.abs(f2.elapsed - 2.016) < 1e-9);

  timer.reset(5000);
  const f3 = timer.step(5020);
  assert.ok(Math.abs(f3.delta - 0.02) < 1e-9);
  assert.ok(Math.abs(f3.elapsed - 0.02) < 1e-9);
});

test("resolveSlideYawOffset maps hero slide indices deterministically", () => {
  assert.equal(resolveSlideYawOffset(0), 0);
  assert.equal(resolveSlideYawOffset(1), 0.06);
  assert.equal(resolveSlideYawOffset(4), -0.14);
});
