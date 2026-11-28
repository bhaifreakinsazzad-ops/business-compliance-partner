export type CoverflowRole = "prev" | "active" | "next" | "hidden";

export interface CoverflowSlideGeometry {
  role: CoverflowRole;
  offset: number;
  translateXPercent: number;
  rotateYDeg: number;
  scale: number;
  opacity: number;
  zIndex: number;
}

/**
 * Computes shortest signed circular offset in [-Math.floor(total/2), Math.ceil(total/2)]
 * for smooth wrap-around coverflow transitions without teleportation across the center.
 */
export function getCircularSlideOffset(
  index: number,
  activeIndex: number,
  total: number,
): number {
  if (total <= 1) return 0;
  const raw = (((index - activeIndex) % total) + total) % total;
  const half = Math.floor(total / 2);
  if (raw > half) {
    return raw - total;
  }
  return raw;
}

/**
 * Computes responsive 3D perspective geometry for a coverflow slide at circular `offset`.
 * Desktop keeps prev (-1) and next (+1) visibly peeking on either side with inward Y rotation;
 * mobile keeps the central banner dominant with restrained neighbor peeks.
 */
export function getCoverflowSlideGeometry(
  offset: number,
  isCompactViewport: boolean,
): CoverflowSlideGeometry {
  if (offset === 0) {
    return {
      role: "active",
      offset: 0,
      translateXPercent: 0,
      rotateYDeg: 0,
      scale: 1,
      opacity: 1,
      zIndex: 30,
    };
  }

  if (offset === -1) {
    return isCompactViewport
      ? {
          role: "prev",
          offset,
          translateXPercent: -92,
          rotateYDeg: 8,
          scale: 0.9,
          opacity: 0.42,
          zIndex: 15,
        }
      : {
          role: "prev",
          offset,
          translateXPercent: -70,
          rotateYDeg: 15,
          scale: 0.87,
          opacity: 0.58,
          zIndex: 20,
        };
  }

  if (offset === 1) {
    return isCompactViewport
      ? {
          role: "next",
          offset,
          translateXPercent: 92,
          rotateYDeg: -8,
          scale: 0.9,
          opacity: 0.42,
          zIndex: 15,
        }
      : {
          role: "next",
          offset,
          translateXPercent: 70,
          rotateYDeg: -15,
          scale: 0.87,
          opacity: 0.58,
          zIndex: 20,
        };
  }

  const sign = offset < 0 ? -1 : 1;
  return {
    role: "hidden",
    offset,
    translateXPercent: sign * 124,
    rotateYDeg: sign * -20,
    scale: 0.74,
    opacity: 0,
    zIndex: 1,
  };
}

/**
 * Normalizes a candidate slide index cleanly inside [0, total - 1].
 */
export function wrapSlideIndex(candidate: number, total: number): number {
  if (total <= 0) return 0;
  return ((candidate % total) + total) % total;
}
