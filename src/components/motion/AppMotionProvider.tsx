"use client";

import type { ReactNode } from "react";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";

interface AppMotionProviderProps {
  children: ReactNode;
}

/**
 * Global Motion.dev configuration honoring user `prefers-reduced-motion`
 * while keeping bundle overhead minimal via `domAnimation`.
 */
export function AppMotionProvider({ children }: AppMotionProviderProps) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>{children}</LazyMotion>
    </MotionConfig>
  );
}
