"use client";

import { useEffect, useState } from "react";
import { useMotionPreference } from "@/hooks/useMotionPreference";

export type PerformanceTier = "HIGH" | "BALANCED" | "STATIC";

export interface DeviceProfile {
  tier: PerformanceTier;
  isTouchViewport: boolean;
  isCompactViewport: boolean;
  prefersReducedMotion: boolean;
}

/**
 * Classifies client capability into HIGH / BALANCED / STATIC so WebGL scenes
 * and multi-stage scroll choreography scale smoothly on low-power devices
 * without ever hiding core domain content.
 */
export function useDeviceProfile(): DeviceProfile {
  const { prefersReducedMotion } = useMotionPreference();
  const [viewportInfo, setViewportInfo] = useState({
    isTouchViewport: false,
    isCompactViewport: false,
    lowCpu: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const coarseMedia = window.matchMedia("(pointer: coarse)");
    const compactMedia = window.matchMedia("(max-width: 767px)");
    const hardwareThreads =
      typeof navigator !== "undefined" &&
      typeof navigator.hardwareConcurrency === "number"
        ? navigator.hardwareConcurrency
        : 4;

    const sync = () => {
      setViewportInfo({
        isTouchViewport: coarseMedia.matches,
        isCompactViewport: compactMedia.matches,
        lowCpu: hardwareThreads > 0 && hardwareThreads <= 2,
      });
    };

    sync();
    coarseMedia.addEventListener("change", sync);
    compactMedia.addEventListener("change", sync);
    return () => {
      coarseMedia.removeEventListener("change", sync);
      compactMedia.removeEventListener("change", sync);
    };
  }, []);

  const tier: PerformanceTier = prefersReducedMotion
    ? "STATIC"
    : viewportInfo.lowCpu || viewportInfo.isCompactViewport
      ? "BALANCED"
      : "HIGH";

  return {
    tier,
    isTouchViewport: viewportInfo.isTouchViewport,
    isCompactViewport: viewportInfo.isCompactViewport,
    prefersReducedMotion,
  };
}
