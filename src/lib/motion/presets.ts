import type { Transition, Variants } from "motion/react";

export const BCP_EASE_CRISP: [number, number, number, number] = [
  0.22, 1, 0.36, 1,
];

export const BCP_TRANSITIONS = {
  micro: { duration: 0.16, ease: BCP_EASE_CRISP } satisfies Transition,
  standard: { duration: 0.26, ease: BCP_EASE_CRISP } satisfies Transition,
  reveal: { duration: 0.4, ease: BCP_EASE_CRISP } satisfies Transition,
  spring: {
    type: "spring",
    stiffness: 380,
    damping: 30,
    mass: 0.85,
  } satisfies Transition,
} as const;

export const CARD_HOVER_PROPS = {
  whileHover: { y: -2, transition: BCP_TRANSITIONS.micro },
  whileTap: { scale: 0.992, transition: { duration: 0.1 } },
} as const;

export const PANEL_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: BCP_TRANSITIONS.standard,
  },
  exit: {
    opacity: 0,
    y: 4,
    scale: 0.995,
    transition: { duration: 0.14 },
  },
};
