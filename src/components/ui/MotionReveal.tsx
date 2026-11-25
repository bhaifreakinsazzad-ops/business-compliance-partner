"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate, stagger } from "animejs";

interface MotionRevealProps {
  children: ReactNode;
  className?: string;
}

/**
 * Progressive-enhancement scroll reveal powered by Anime.js.
 * Respects `prefers-reduced-motion: reduce` and never leaves elements hidden
 * when JS is disabled or reduced motion is requested.
 */
export function MotionReveal({ children, className }: MotionRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      return;
    }

    const targets = Array.from(
      el.querySelectorAll<HTMLElement>("[data-motion-item]"),
    );
    if (targets.length === 0) return;

    let played = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (played || !entries.some((entry) => entry.isIntersecting)) return;
        played = true;
        observer.disconnect();

        animate(targets, {
          translateY: [14, 0],
          opacity: [0.35, 1],
          duration: 550,
          delay: stagger(65),
          ease: "outCubic",
        });
      },
      { threshold: 0.12 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
