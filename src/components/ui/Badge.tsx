import type { ReactNode } from "react";
import type { AvailabilityStatusValue } from "@/types/domain";
import { getAvailabilityLabelBn } from "@/lib/content/helpers";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  variant?: "navy" | "cool" | "success" | "warning" | "outline";
  className?: string;
}

const VARIANT_CLASSES: Record<NonNullable<BadgeProps["variant"]>, string> = {
  navy: "bg-ps-navy text-ps-white border-ps-navy",
  cool: "bg-ps-cool text-ps-navy border-ps-border",
  success: "bg-ps-success/10 text-ps-success border-ps-success/30",
  warning: "bg-ps-ivory text-ps-warning border-ps-gold/50",
  outline: "bg-ps-white text-ps-navy border-ps-navy/20",
};

export function Badge({
  children,
  variant = "cool",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold leading-none",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: AvailabilityStatusValue }) {
  const variant =
    status === "ACTIVE"
      ? "success"
      : status === "UPCOMING"
        ? "navy"
        : status === "INTEREST_ONLY"
          ? "warning"
          : "outline";

  return <Badge variant={variant}>{getAvailabilityLabelBn(status)}</Badge>;
}
