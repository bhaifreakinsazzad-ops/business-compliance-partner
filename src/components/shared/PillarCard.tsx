import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PillarCardProps {
  titleBn: string;
  subtitleEn: string;
  descriptionBn: string;
  href: string;
  ctaLabelBn: string;
  badgeTextBn: string;
  icon: LucideIcon;
  priority?: "primary" | "secondary";
}

export function PillarCard({
  titleBn,
  subtitleEn,
  descriptionBn,
  href,
  ctaLabelBn,
  badgeTextBn,
  icon: Icon,
  priority = "primary",
}: PillarCardProps) {
  const isPrimary = priority === "primary";

  return (
    <article
      className={cn(
        "group rounded-[16px] flex flex-col justify-between gap-5 transition-all duration-200",
        isPrimary
          ? "bg-ps-white border-2 border-ps-navy/15 p-6 sm:p-8 shadow-sm hover:border-ps-navy/35 hover:shadow-md"
          : "bg-ps-cool border border-ps-border p-6 hover:border-ps-navy/30 hover:bg-ps-white",
      )}
    >
      <div className="space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
              isPrimary
                ? "bg-ps-navy text-ps-white"
                : "bg-ps-white text-ps-navy border border-ps-border",
            )}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{badgeTextBn}</span>
          </span>
          <span
            className="font-editorial text-xs uppercase tracking-wider text-ps-muted"
            lang="en"
          >
            {subtitleEn}
          </span>
        </div>

        <h3
          className={cn(
            "font-bold text-ps-navy leading-snug",
            isPrimary ? "text-xl sm:text-2xl" : "text-lg sm:text-xl",
          )}
        >
          {titleBn}
        </h3>

        <p className="text-sm sm:text-base text-ps-ink/85 leading-relaxed">
          {descriptionBn}
        </p>
      </div>

      <div>
        <Link
          href={href}
          className={cn(
            isPrimary ? "ps-primary-button" : "ps-secondary-button",
            "inline-flex items-center gap-2",
          )}
        >
          <span>{ctaLabelBn}</span>
          <ArrowRight
            className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}
