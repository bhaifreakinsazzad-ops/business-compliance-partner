import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
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
  BookOpen,
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
  basePath: "/courses" | "/services" | "/licensing" | "/books";
  activeSlug?: string;
  query?: string;
  ariaLabel: string;
  showAllCard?: boolean;
  allLabelBn?: string;
  accent?: "lavender" | "gold" | "navy" | "emerald";
  columns?: 3 | 4 | 5;
  highlightCount?: number;
  luminousPriority?: boolean;
}

export function CategoryGrid({
  categories,
  basePath,
  activeSlug = "",
  query = "",
  ariaLabel,
  showAllCard = false,
  allLabelBn = "সব ক্যাটাগরি",
  columns = 3,
  highlightCount = 0,
  luminousPriority = false,
}: CategoryGridProps) {
  const buildHref = (slug?: string) => {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (query.trim()) params.set("q", query.trim());
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const isFiveTileShowcase =
    luminousPriority && !showAllCard && categories.length === 5;

  const gridColsClass = isFiveTileShowcase
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-6"
    : columns === 5
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
      : columns === 4
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  const countSuffix =
    basePath === "/courses"
      ? "টি কোর্স"
      : basePath === "/services"
        ? "টি সেবা"
        : basePath === "/books"
          ? "টি বই"
          : "টি";

  return (
    <div
      role="navigation"
      aria-label={ariaLabel}
      className={cn("grid gap-4 sm:gap-5", gridColsClass)}
    >
      {showAllCard ? (
        <Link
          href={buildHref()}
          aria-current={!activeSlug ? "page" : undefined}
          className={cn(
            "group rounded-[16px] border p-5 flex flex-col justify-between gap-3 transition-[transform,box-shadow,border-color,background-color] duration-200 min-h-[132px] focus-visible:outline-3 focus-visible:outline-[#C59028] focus-visible:outline-offset-2",
            !activeSlug
              ? "bg-[#51406F] text-white border-[#51406F] shadow-sm"
              : "bg-white text-[#081838] border-[#D4CCE3] hover:border-[#51406F]/55 hover:-translate-y-0.5 hover:shadow-md",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <span
              className={cn(
                "inline-flex items-center justify-center w-11 h-11 rounded-[12px] shrink-0",
                !activeSlug
                  ? "bg-white/15 text-white"
                  : "bg-[#F2EFF8] text-[#51406F] border border-[#D4CCE3]",
              )}
            >
              <Layers className="w-5 h-5" aria-hidden="true" />
            </span>
            <ArrowRight
              className={cn(
                "w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1",
                !activeSlug ? "text-white" : "text-[#596775]",
              )}
              aria-hidden="true"
            />
          </div>
          <div className="space-y-1">
            <p className="text-base sm:text-lg font-extrabold leading-snug">
              {allLabelBn}
            </p>
            <p
              className={cn(
                "text-xs",
                !activeSlug ? "text-white/85" : "text-[#596775]",
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
        const isFeaturedShowcase = luminousPriority && isPriority;

        const showcaseSpanClass = isFiveTileShowcase
          ? idx < 3
            ? "lg:col-span-2"
            : idx === 3
              ? "lg:col-span-3"
              : "sm:col-span-2 lg:col-span-3"
          : "";

        return (
          <Link
            key={cat.slug}
            href={buildHref(cat.slug)}
            data-category-card={cat.slug}
            data-priority-tile={isFeaturedShowcase ? "true" : undefined}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group relative overflow-hidden rounded-[16px] border flex flex-col justify-between gap-4 transition-[transform,box-shadow,border-color,background-color] duration-200 focus-visible:outline-3 focus-visible:outline-[#C59028] focus-visible:outline-offset-2",
              showcaseSpanClass,
              isFeaturedShowcase
                ? "p-5 sm:p-6 min-h-[154px]"
                : "p-5 min-h-[132px]",
              isActive
                ? "bg-[#51406F] text-white border-[#51406F] shadow-md"
                : isFeaturedShowcase
                  ? "bg-gradient-to-br from-white via-[#F9F7FC] to-[#F2EFF8] text-[#081838] border-[#D4CCE3] hover:border-[#51406F]/55 hover:-translate-y-0.5 hover:shadow-md"
                  : isPriority
                    ? "bg-[#F2EFF8]/65 text-[#081838] border-[#D4CCE3] hover:border-[#51406F]/50 hover:-translate-y-0.5 hover:shadow-sm"
                    : "bg-white text-[#081838] border-[#D4CCE3] hover:border-[#51406F]/50 hover:-translate-y-0.5 hover:shadow-sm",
            )}
          >
            <div className="relative flex items-start justify-between gap-3">
              <span
                className={cn(
                  "inline-flex items-center justify-center rounded-[12px] shrink-0 transition-colors duration-200",
                  isFeaturedShowcase ? "w-12 h-12" : "w-11 h-11",
                  isActive
                    ? "bg-white/15 text-white"
                    : "bg-[#F2EFF8] text-[#51406F] border border-[#D4CCE3] group-hover:bg-[#51406F] group-hover:text-white group-hover:border-[#51406F]",
                )}
              >
                <Icon
                  className={cn(isFeaturedShowcase ? "w-6 h-6" : "w-5 h-5")}
                  aria-hidden="true"
                />
              </span>

              <div className="flex items-center gap-2 shrink-0">
                {typeof cat.publishedCount === "number" ? (
                  <span
                    className={cn(
                      "text-xs font-semibold tabular-nums",
                      isActive ? "text-white/90" : "text-[#596775]",
                    )}
                  >
                    {cat.publishedCount}
                    {countSuffix}
                  </span>
                ) : null}
                <ArrowRight
                  className={cn(
                    "w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1",
                    isActive ? "text-white" : "text-[#51406F]",
                  )}
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="relative space-y-1">
              <p
                className={cn(
                  "font-extrabold leading-snug",
                  isFeaturedShowcase
                    ? "text-lg sm:text-[1.15rem]"
                    : "text-base sm:text-lg",
                )}
              >
                {cat.nameBn}
              </p>
              <p
                className={cn(
                  "font-en font-semibold tracking-wide text-xs",
                  isActive ? "text-white/80" : "text-[#51406F]",
                )}
                lang="en"
              >
                {cat.nameEn}
              </p>
              {cat.shortDescBn ? (
                <p
                  className={cn(
                    "text-xs leading-relaxed line-clamp-2 pt-0.5",
                    isActive ? "text-white/85" : "text-[#596775]",
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
