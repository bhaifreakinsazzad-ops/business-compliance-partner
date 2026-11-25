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

const LUMINOUS_GOLD_SLUGS = new Set([
  "income-tax",
  "egp-and-tender",
  "company-secretarial",
]);

const LUMINOUS_EMERALD_SLUGS = new Set([
  "vat-and-mushak",
  "digital-business-ecommerce",
]);

interface CategoryGridProps {
  categories: PublicCategoryDTO[];
  basePath: "/courses" | "/services";
  activeSlug?: string;
  query?: string;
  ariaLabel: string;
  showAllCard?: boolean;
  allLabelBn?: string;
  accent?: "gold" | "navy" | "emerald";
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
  accent = "gold",
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
            "group rounded-[20px] border-2 p-5 sm:p-6 flex flex-col justify-between gap-3 transition-[transform,box-shadow,border-color] duration-200 focus-visible:outline-3 focus-visible:outline-ps-gold focus-visible:outline-offset-2",
            luminousPriority ? "min-h-[168px]" : "min-h-[132px]",
            !activeSlug
              ? "bg-ps-midnight text-ps-white border-ps-gold shadow-md"
              : "bg-ps-white text-ps-navy border-ps-border hover:border-ps-navy/50 hover:-translate-y-0.5 hover:shadow-md",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <span
              className={cn(
                "inline-flex items-center justify-center w-13 h-13 rounded-[14px] shrink-0",
                !activeSlug
                  ? "bg-ps-gold text-ps-midnight"
                  : "bg-ps-ivory text-ps-navy border border-ps-border",
              )}
            >
              <Layers className="w-6 h-6" aria-hidden="true" />
            </span>
            <ArrowRight
              className={cn(
                "w-5 h-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1",
                !activeSlug ? "text-ps-gold" : "text-ps-muted",
              )}
              aria-hidden="true"
            />
          </div>
          <div className="space-y-1">
            <p className="text-lg sm:text-xl font-extrabold leading-snug">
              {allLabelBn}
            </p>
            <p
              className={cn(
                "text-xs sm:text-sm",
                !activeSlug ? "text-white/85" : "text-ps-muted",
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
        const isLuminous = luminousPriority && isPriority;
        const isLuminousGold =
          isLuminous &&
          (LUMINOUS_GOLD_SLUGS.has(cat.slug) ||
            (!LUMINOUS_EMERALD_SLUGS.has(cat.slug) && idx % 2 === 0));
        const isLuminousEmerald = isLuminous && !isLuminousGold;

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
            data-priority-tile={isLuminous ? "true" : undefined}
            data-luminous-tone={
              isLuminousGold ? "gold" : isLuminousEmerald ? "emerald" : undefined
            }
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group relative overflow-hidden rounded-[20px] border-2 flex flex-col justify-between gap-5 transition-[transform,box-shadow,border-color] duration-200 focus-visible:outline-3 focus-visible:outline-ps-gold focus-visible:outline-offset-2",
              showcaseSpanClass,
              isLuminous
                ? "p-6 sm:p-7 min-h-[176px] sm:min-h-[192px]"
                : "p-5 min-h-[136px]",
              isActive
                ? "bg-ps-midnight text-ps-white border-ps-gold ring-2 ring-ps-gold/40 shadow-lg"
                : isLuminousGold
                  ? "bg-gradient-to-br from-[#fde49b] via-[#ebb949] to-[#c9901f] text-ps-midnight border-[#946610] shadow-[0_10px_28px_rgba(197,144,40,0.3)] hover:shadow-[0_16px_36px_rgba(197,144,40,0.42)] hover:-translate-y-1"
                  : isLuminousEmerald
                    ? "bg-gradient-to-br from-[#0ea572] via-[#00865a] to-[#005f3f] text-ps-white border-[#004c32] shadow-[0_10px_28px_rgba(0,134,90,0.3)] hover:shadow-[0_16px_36px_rgba(0,134,90,0.42)] hover:-translate-y-1"
                    : isPriority
                      ? "bg-gradient-to-br from-ps-white to-ps-ivory text-ps-navy border-ps-gold/60 hover:border-ps-gold hover:-translate-y-0.5 hover:shadow-md"
                      : "bg-ps-white text-ps-navy border-ps-border hover:border-ps-navy/45 hover:-translate-y-0.5 hover:shadow-md",
            )}
          >
            {isLuminous && !isActive ? (
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute inset-0",
                  isLuminousGold
                    ? "bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.45),transparent_56%)]"
                    : "bg-[radial-gradient(circle_at_top_right,rgba(167,243,208,0.28),transparent_56%)]",
                )}
              />
            ) : null}

            <div className="relative flex items-start justify-between gap-3">
              <span
                className={cn(
                  "inline-flex items-center justify-center rounded-[15px] shrink-0 transition-transform duration-200 group-hover:scale-105",
                  isLuminous ? "w-14 h-14" : "w-11 h-11",
                  isActive
                    ? "bg-ps-gold text-ps-midnight shadow-sm"
                    : isLuminousGold
                      ? "bg-ps-midnight text-[#fde49b] shadow-md"
                      : isLuminousEmerald
                        ? "bg-ps-ivory text-[#005f3f] shadow-md"
                        : accent === "gold"
                          ? "bg-ps-gold/15 text-ps-midnight border border-ps-gold/40 group-hover:bg-ps-gold"
                          : accent === "emerald"
                            ? "bg-ps-success/10 text-ps-success border border-ps-success/30 group-hover:bg-ps-success group-hover:text-ps-white"
                            : "bg-ps-navy/10 text-ps-navy border border-ps-navy/20 group-hover:bg-ps-navy group-hover:text-ps-white",
                )}
              >
                <Icon
                  className={cn(isLuminous ? "w-7 h-7" : "w-5 h-5")}
                  aria-hidden="true"
                />
              </span>

              <div className="flex items-center gap-2 shrink-0">
                {typeof cat.publishedCount === "number" ? (
                  <span
                    className={cn(
                      "font-extrabold tabular-nums",
                      isLuminous ? "text-sm" : "text-xs",
                      isActive
                        ? "text-[#f0cf7b]"
                        : isLuminousGold
                          ? "text-ps-midnight"
                          : isLuminousEmerald
                            ? "text-ps-ivory"
                            : "text-ps-muted",
                    )}
                  >
                    {cat.publishedCount}টি কোর্স
                  </span>
                ) : null}
                <span
                  className={cn(
                    "inline-flex items-center justify-center rounded-full transition-transform duration-200 group-hover:translate-x-1",
                    isLuminous ? "w-9 h-9" : "w-6 h-6",
                    isActive
                      ? "bg-white/10 text-ps-gold"
                      : isLuminousGold
                        ? "bg-ps-midnight/12 text-ps-midnight"
                        : isLuminousEmerald
                          ? "bg-white/15 text-ps-white"
                          : "text-ps-muted",
                  )}
                >
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </span>
              </div>
            </div>

            <div className="relative space-y-1.5">
              <p
                className={cn(
                  "font-extrabold leading-snug",
                  isLuminous
                    ? "text-xl sm:text-[1.3rem]"
                    : "text-base sm:text-lg",
                )}
              >
                {cat.nameBn}
              </p>
              <p
                className={cn(
                  "font-en font-bold tracking-wide",
                  isLuminous ? "text-xs sm:text-[13px]" : "text-xs",
                  isActive
                    ? "text-ps-gold"
                    : isLuminousGold
                      ? "text-ps-midnight/85"
                      : isLuminousEmerald
                        ? "text-emerald-100"
                        : "text-ps-muted",
                )}
                lang="en"
              >
                {cat.nameEn}
              </p>
              {cat.shortDescBn ? (
                <p
                  className={cn(
                    "leading-relaxed line-clamp-2 pt-0.5",
                    isLuminous ? "text-xs sm:text-sm" : "text-xs",
                    isActive
                      ? "text-white/85"
                      : isLuminousGold
                        ? "text-ps-midnight/90 font-medium"
                        : isLuminousEmerald
                          ? "text-white/95"
                          : "text-ps-ink/75",
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
