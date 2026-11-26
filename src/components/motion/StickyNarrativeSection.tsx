import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StickyNarrativeSectionProps {
  stickyContent: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Two-column narrative scroll choreography band:
 * On large viewports the explanatory column stays anchored smoothly alongside
 * interactive visual scenes or step cards; on mobile it stacks cleanly with
 * normal document flow.
 */
export function StickyNarrativeSection({
  stickyContent,
  children,
  className,
}: StickyNarrativeSectionProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start",
        className,
      )}
    >
      <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
        {stickyContent}
      </div>
      <div className="lg:col-span-7">{children}</div>
    </div>
  );
}
