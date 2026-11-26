"use client";

import { useEffect, useState } from "react";

/**
 * Reactively tracks the user's `prefers-reduced-motion: reduce` setting.
 * Defaults to `false` during SSR and hydrates cleanly without hydration mismatch.
 */
export function useMotionPreference(): { prefersReducedMotion: boolean } {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(media.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return { prefersReducedMotion };
}
