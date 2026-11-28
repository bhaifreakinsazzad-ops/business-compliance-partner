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
  navy: "bg-[#243FBA] text-white border-[#243FBA]",
  cool: "bg-[#FBFAFF] text-[#243FBA] border-[#E1E4F2]",
  success: "bg-[#00865A]/10 text-[#00865A] border-[#00865A]/30",
  warning: "bg-[#F5F1E8] text-[#8A5800] border-[#C59028]/50",
  outline: "bg-white text-[#081838] border-[#E1E4F2]",
};

export function Badge({
  children,
  variant = "cool",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[8px] border px-2.5 py-1 text-xs font-semibold leading-none",
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
