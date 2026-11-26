import { animate, stagger } from "animejs";

export const MOTION_DURATIONS = {
  instant: 120,
  fast: 180,
  standard: 260,
  reveal: 450,
  hero: 550,
  counter: 1600,
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
 * transform and opacity. Never splits Bengali graphemes or hides content permanently.
 */
export function animateRevealItems(targets: HTMLElement[]): void {
  if (targets.length === 0 || prefersReducedMotion()) return;
  animate(targets, {
    translateY: [10, 0],
    opacity: [0.45, 1],
    duration: MOTION_DURATIONS.reveal,
    delay: stagger(45),
    ease: MOTION_EASES.crisp,
  });
}

/**
 * Subtle drawer/panel reveal for Mega Menus and active tab panels.
 */
export function animatePanelReveal(target: HTMLElement | null): void {
  if (!target || prefersReducedMotion()) return;
  animate(target, {
    opacity: [0.5, 1],
    translateY: [6, 0],
    duration: MOTION_DURATIONS.standard,
    ease: MOTION_EASES.crisp,
  });
}
