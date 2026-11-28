import test from "node:test";
import assert from "node:assert/strict";
import {
  getCircularSlideOffset,
  getCoverflowSlideGeometry,
  wrapSlideIndex,
} from "./coverflow";

test("getCircularSlideOffset computes symmetric shortest circular deltas for 4 slides", () => {
  assert.equal(getCircularSlideOffset(0, 0, 4), 0);
  assert.equal(getCircularSlideOffset(1, 0, 4), 1);
  assert.equal(getCircularSlideOffset(3, 0, 4), -1);
  assert.equal(getCircularSlideOffset(2, 0, 4), 2);

  // Wrap-around when activeIndex is 3 (last slide)
  assert.equal(getCircularSlideOffset(0, 3, 4), 1);
  assert.equal(getCircularSlideOffset(2, 3, 4), -1);
});

test("getCoverflowSlideGeometry enforces active center dominance over inward-tilted neighbors", () => {
  const active = getCoverflowSlideGeometry(0, false);
  const prev = getCoverflowSlideGeometry(-1, false);
  const next = getCoverflowSlideGeometry(1, false);
  const distant = getCoverflowSlideGeometry(2, false);

  assert.equal(active.role, "active");
  assert.equal(active.scale, 1);
  assert.equal(active.rotateYDeg, 0);
  assert.equal(active.opacity, 1);
  assert.ok(active.zIndex > prev.zIndex && active.zIndex > next.zIndex);

  assert.equal(prev.role, "prev");
  assert.ok(prev.translateXPercent < 0);
  assert.ok(prev.rotateYDeg > 0);
  assert.ok(prev.scale < active.scale);

  assert.equal(next.role, "next");
  assert.ok(next.translateXPercent > 0);
  assert.ok(next.rotateYDeg < 0);
  assert.ok(next.scale < active.scale);

  assert.equal(distant.role, "hidden");
  assert.equal(distant.opacity, 0);
});

test("getCoverflowSlideGeometry adapts cleanly for compact mobile viewports", () => {
  const prevMobile = getCoverflowSlideGeometry(-1, true);
  const nextMobile = getCoverflowSlideGeometry(1, true);
  assert.ok(Math.abs(prevMobile.rotateYDeg) < 12);
  assert.ok(Math.abs(nextMobile.rotateYDeg) < 12);
  assert.equal(wrapSlideIndex(-1, 4), 3);
  assert.equal(wrapSlideIndex(4, 4), 0);
});
