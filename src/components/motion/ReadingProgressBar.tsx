"use client";

import { m, useScroll, useSpring } from "motion/react";
import { useMotionPreference } from "@/hooks/useMotionPreference";

/**
 * Subtle scroll-linked reading progress hairline across the top of the viewport.
 * Runs exclusively via transform `scaleX` so layout recalculations stay zero.
 */
export function ReadingProgressBar() {
  const { prefersReducedMotion } = useMotionPreference();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 240,
    damping: 32,
    restDelta: 0.001,
  });

  if (prefersReducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 inset-x-0 h-[2.5px] z-[var(--z-toast)] pointer-events-none bg-transparent"
    >
      <m.div
        style={{ scaleX }}
        className="h-full w-full origin-left bg-gradient-to-r from-[#243FBA] via-[#5C73EC] to-[#C59028]"
      />
    </div>
  );
}
