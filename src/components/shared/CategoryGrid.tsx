import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Briefcase,
  Building2,
  Calculator,
  ClipboardCheck,
  Compass,
  FileCheck2,
  FileText,
  Globe,
  Landmark,
  Layers,
  ReceiptText,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Ship,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { PublicCategoryDTO } from "@/types/domain";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Calculator,
  ReceiptText,
  Ship,
  Landmark,
  Globe,
  BookOpenCheck,
  Building2,
  Compass,
  Users,
  Briefcase,
  FileCheck2,
  ShieldCheck,
  FileText,
  ShieldAlert,
  ClipboardCheck,
  Scale,
};

function resolveCategoryIcon(iconName: string | null): LucideIcon {
  if (!iconName) return Layers;
  return ICON_MAP[iconName] ?? Layers;
}

interface CategoryGridProps {
  categories: PublicCategoryDTO[];
  basePath: "/courses" | "/services" | "/licensing";
  activeSlug?: string;
  query?: string;
  ariaLabel: string;
  showAllCard?: boolean;
  allLabelBn?: string;
  accent?: "gold" | "navy" | "emerald";
  columns?: 3 | 4 | 5;
  highlightCount?: number;
}

export function CategoryGrid({
  categories,
  basePath,
  activeSlug = "",
  query = "",
  ariaLabel,
  showAllCard = false,
  allLabelBn = "সব ক্যাটাগরি",
  accent = "gold",
  columns = 3,
  highlightCount = 0,
}: CategoryGridProps) {
  const buildHref = (slug?: string) => {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (query.trim()) params.set("q", query.trim());
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const gridColsClass =
    columns === 5
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
      : columns === 4
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div
      role="navigation"
      aria-label={ariaLabel}
      className={cn("grid gap-4", gridColsClass)}
    >
      {showAllCard ? (
        <Link
          href={buildHref()}
          aria-current={!activeSlug ? "page" : undefined}
          className={cn(
            "group rounded-[16px] border-2 p-5 flex flex-col justify-between gap-3 transition-all focus-visible:outline-3 focus-visible:outline-ps-gold focus-visible:outline-offset-2",
            !activeSlug
              ? "bg-ps-midnight text-ps-white border-ps-gold shadow-md"
              : "bg-ps-white text-ps-navy border-ps-border hover:border-ps-navy/50 hover:shadow-sm",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <span
              className={cn(
                "inline-flex items-center justify-center w-11 h-11 rounded-[12px] shrink-0",
                !activeSlug
                  ? "bg-ps-gold text-ps-midnight"
                  : "bg-ps-ivory text-ps-navy border border-ps-border",
              )}
            >
              <Layers className="w-5 h-5" aria-hidden="true" />
            </span>
            <ArrowRight
              className={cn(
                "w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5",
                !activeSlug ? "text-ps-gold" : "text-ps-muted",
              )}
              aria-hidden="true"
            />
          </div>
          <div className="space-y-1">
            <p className="text-base sm:text-lg font-bold leading-snug">
              {allLabelBn}
            </p>
            <p
              className={cn(
                "text-xs",
                !activeSlug ? "text-white/80" : "text-ps-muted",
              )}
            >
              সকল প্রকাশিত আইটেম দেখুন
            </p>
          </div>
        </Link>
      ) : null}

      {categories.map((cat, idx) => {
        const Icon = resolveCategoryIcon(cat.iconName);
        const isActive = cat.slug === activeSlug;
        const isPriority = highlightCount > 0 && idx < highlightCount;

        return (
          <Link
            key={cat.slug}
            href={buildHref(cat.slug)}
            data-category-card={cat.slug}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group rounded-[16px] border-2 p-5 flex flex-col justify-between gap-3 transition-all focus-visible:outline-3 focus-visible:outline-ps-gold focus-visible:outline-offset-2",
              isActive
                ? "bg-ps-midnight text-ps-white border-ps-gold shadow-md"
                : isPriority
                  ? "bg-gradient-to-br from-ps-white to-ps-ivory text-ps-navy border-ps-gold/60 hover:border-ps-gold hover:shadow-md"
                  : "bg-ps-white text-ps-navy border-ps-border hover:border-ps-navy/45 hover:shadow-md",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={cn(
                  "inline-flex items-center justify-center w-11 h-11 rounded-[12px] shrink-0 transition-colors",
                  isActive
                    ? "bg-ps-gold text-ps-midnight"
                    : accent === "gold"
                      ? "bg-ps-gold/15 text-ps-midnight border border-ps-gold/40 group-hover:bg-ps-gold"
                      : accent === "emerald"
                        ? "bg-ps-success/10 text-ps-success border border-ps-success/30 group-hover:bg-ps-success group-hover:text-ps-white"
                        : "bg-ps-navy/10 text-ps-navy border border-ps-navy/20 group-hover:bg-ps-navy group-hover:text-ps-white",
                )}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>

              <div className="flex items-center gap-2">
                {typeof cat.publishedCount === "number" ? (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                      isActive
                        ? "bg-white/15 text-ps-ivory"
                        : "bg-ps-cool text-ps-navy border border-ps-border",
                    )}
                  >
                    {cat.publishedCount}টি
                  </span>
                ) : null}
                <ArrowRight
                  className={cn(
                    "w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5",
                    isActive ? "text-ps-gold" : "text-ps-muted",
                  )}
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-base sm:text-lg font-bold leading-snug">
                {cat.nameBn}
              </p>
              <p
                className={cn(
                  "font-en text-xs font-medium",
                  isActive ? "text-ps-gold" : "text-ps-muted",
                )}
                lang="en"
              >
                {cat.nameEn}
              </p>
              {cat.shortDescBn ? (
                <p
                  className={cn(
                    "text-xs leading-relaxed line-clamp-2 pt-0.5",
                    isActive ? "text-white/80" : "text-ps-ink/75",
                  )}
                >
                  {cat.shortDescBn}
                </p>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
