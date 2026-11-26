"use client";

import { useAnimationScope } from "@/hooks/useAnimationScope";
import { animateRevealItems } from "@/lib/motion/tokens";

export interface ProcessStepItem {
  stepNumber: number;
  titleBn: string;
  descriptionBn: string;
}

interface ProcessStepsProps {
  steps: ProcessStepItem[];
  columns?: 3 | 4;
}

export function ProcessSteps({ steps, columns = 4 }: ProcessStepsProps) {
  const scopeRef = useAnimationScope<HTMLOListElement>((root) => {
    const items = Array.from(
      root.querySelectorAll<HTMLElement>("[data-process-step]"),
    );
    if (items.length === 0 || typeof IntersectionObserver === "undefined") {
      return;
    }
    let played = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (played || !entries.some((entry) => entry.isIntersecting)) return;
        played = true;
        observer.disconnect();
        animateRevealItems(items);
      },
      { threshold: 0.15 },
    );
    observer.observe(root);
  });

  return (
    <ol
      ref={scopeRef}
      className={`grid grid-cols-1 sm:grid-cols-2 ${
        columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
      } gap-5`}
    >
      {steps.map((step) => (
        <li
          key={step.stepNumber}
          data-process-step={step.stepNumber}
          className="bcp-surface-card p-6 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] bg-action-primary text-white font-en text-sm font-bold tabular-nums">
              0{step.stepNumber}
            </span>
            <span className="h-px flex-1 ms-3 bg-border-subtle" aria-hidden="true" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-text-primary">
            {step.titleBn}
          </h3>
          <p className="text-sm text-text-body/85 leading-relaxed">
            {step.descriptionBn}
          </p>
        </li>
      ))}
    </ol>
  );
}
