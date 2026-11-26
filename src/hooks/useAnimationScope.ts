"use client";

import { useEffect, useRef, type DependencyList, type RefObject } from "react";
import { createScope } from "animejs";
import { useMotionPreference } from "@/hooks/useMotionPreference";

type AnimeScopeInstance = ReturnType<typeof createScope>;

/**
 * Lifecycle-safe Anime.js v4 scope hook.
 * Always calls `scope.revert()` on unmount or dependency change so interrupted
 * animations never leak or freeze stale transforms.
 */
export function useAnimationScope<T extends HTMLElement = HTMLElement>(
  setup: (root: T, scope: AnimeScopeInstance) => void,
  deps: DependencyList = [],
): RefObject<T | null> {
  const rootRef = useRef<T | null>(null);
  const setupRef = useRef(setup);
  setupRef.current = setup;
  const { prefersReducedMotion } = useMotionPreference();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === "undefined" || prefersReducedMotion) {
      return;
    }

    const scope = createScope({ root });
    scope.add((self) => {
      if (self) {
        setupRef.current(root, self);
      }
    });

    return () => {
      scope.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion, ...deps]);

  return rootRef;
}
