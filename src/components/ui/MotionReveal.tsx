"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animateRevealItems, prefersReducedMotion } from "@/lib/motion/tokens";

interface MotionRevealProps {
  children: ReactNode;
  className?: string;
}

/**
 * Progressive-enhancement scroll reveal powered by centralized Anime.js v4 tokens.
 * Respects `prefers-reduced-motion: reduce` and never hides content permanently.
 */
export function MotionReveal({ children, className }: MotionRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof window === "undefined") return;

    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
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
        animateRevealItems(targets);
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
