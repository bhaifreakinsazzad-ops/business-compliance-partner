import { animate, stagger } from "animejs";

export const MOTION_DURATIONS = {
  instant: 120,
  fast: 180,
  standard: 260,
  reveal: 420,
  hero: 550,
  counter: 1400,
} as const;

export const MOTION_EASES = {
  crisp: "outCubic",
  smooth: "outQuad",
  hero: "outExpo",
} as const;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Staggers a collection of card or category elements on scroll reveal using only
 * transform and opacity. Returns the Anime.js animation instance so callers
 * can cleanly cancel/revert on unmount.
 */
export function animateRevealItems(targets: HTMLElement[]) {
  if (targets.length === 0 || prefersReducedMotion()) return null;
  return animate(targets, {
    translateY: [10, 0],
    opacity: [0.5, 1],
    duration: MOTION_DURATIONS.reveal,
    delay: stagger(42),
    ease: MOTION_EASES.crisp,
  });
}

/**
 * Subtle drawer/panel reveal returning animation instance for cleanup.
 */
export function animatePanelReveal(target: HTMLElement | null) {
  if (!target || prefersReducedMotion()) return null;
  return animate(target, {
    opacity: [0.55, 1],
    translateY: [6, 0],
    duration: MOTION_DURATIONS.standard,
    ease: MOTION_EASES.crisp,
  });
}
