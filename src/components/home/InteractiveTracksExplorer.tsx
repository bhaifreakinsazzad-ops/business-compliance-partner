"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Layers, Search } from "lucide-react";
import type { Pillar, PublicCategoryDTO } from "@/types/domain";
import { normalizeSearchText } from "@/lib/content/helpers";
import { cn } from "@/lib/utils";

interface InteractiveTracksExplorerProps {
  courseCategories: PublicCategoryDTO[];
  serviceCategories: PublicCategoryDTO[];
  licensingCategories: PublicCategoryDTO[];
}

export function InteractiveTracksExplorer({
  courseCategories,
  serviceCategories,
  licensingCategories,
}: InteractiveTracksExplorerProps) {
  const [activePillar, setActivePillar] = useState<Exclude<Pillar, "CONSULTANCY">>("COURSES");
  const [query, setQuery] = useState("");

  const activeList = useMemo(() => {
    const source =
      activePillar === "COURSES"
        ? courseCategories
        : activePillar === "SERVICES"
          ? serviceCategories
          : licensingCategories;

    const q = normalizeSearchText(query);
    if (!q) return source;
    return source.filter((cat) =>
      normalizeSearchText(
        `${cat.nameBn} ${cat.nameEn} ${cat.shortDescBn}`,
      ).includes(q),
    );
  }, [activePillar, courseCategories, serviceCategories, licensingCategories, query]);

  const routePrefix =
    activePillar === "COURSES"
      ? "/courses"
      : activePillar === "SERVICES"
        ? "/services"
        : "/licensing";

  return (
    <div className="space-y-6">
      {/* Interactive Pillar Tabs + Instant Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div
          role="tablist"
          aria-label="ক্যাটাগরি বিভাগ নির্বাচন"
          className="inline-flex flex-wrap gap-2 bg-ps-cool p-1.5 rounded-[14px] border border-ps-border"
        >
          {(
            [
              {
                id: "COURSES",
                label: `প্রশিক্ষণ ট্র্যাক (${courseCategories.length})`,
              },
              {
                id: "SERVICES",
                label: `সার্ভিস ক্যাটাগরি (${serviceCategories.length})`,
              },
              {
                id: "LICENSING",
                label: `লাইসেন্সিং বিভাগ (${licensingCategories.length})`,
              },
            ] as const
          ).map((tab) => {
            const selected = tab.id === activePillar;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActivePillar(tab.id)}
                className={cn(
                  "min-h-11 px-4 py-2 rounded-[10px] text-xs sm:text-sm font-semibold transition-all",
                  selected
                    ? "bg-ps-navy text-ps-white shadow-sm"
                    : "text-ps-navy hover:bg-ps-white",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-80">
          <label htmlFor="tracks-quick-filter" className="visually-hidden">
            বিভাগ ফিল্টার করুন
          </label>
          <Search
            className="w-4 h-4 text-ps-muted absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="tracks-quick-filter"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="যেমন: VAT, e-GP, RJSC, ট্যাক্স..."
            className="w-full min-h-11 ps-10 pe-4 py-2 rounded-[12px] border border-ps-border bg-ps-white text-sm text-ps-ink placeholder:text-ps-muted/75"
          />
        </div>
      </div>

      {/* Category Cards Grid */}
      {activeList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {activeList.map((cat) => (
            <Link
              key={cat.slug}
              href={`${routePrefix}?category=${encodeURIComponent(cat.slug)}`}
              className="group rounded-[16px] border border-ps-border bg-ps-white p-5 flex flex-col justify-between gap-3 hover:border-ps-navy/40 hover:shadow-md transition-all duration-200"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] bg-ps-cool text-ps-navy">
                    <Layers className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <ArrowRight
                    className="w-4 h-4 text-ps-muted group-hover:text-ps-navy group-hover:translate-x-0.5 transition-transform"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-base font-bold text-ps-navy leading-snug">
                  {cat.nameBn}
                </h3>
                <p className="text-xs font-medium text-ps-muted" lang="en">
                  {cat.nameEn}
                </p>
              </div>
              <p className="text-xs text-ps-ink/80 leading-relaxed line-clamp-2">
                {cat.shortDescBn}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-[16px] border border-ps-border bg-ps-white p-8 text-center text-sm text-ps-muted">
          “{query}” অনুযায়ী কোনো বিভাগ পাওয়া যায়নি। অন্য কীওয়ার্ড দিয়ে চেষ্টা করুন।
        </div>
      )}
    </div>
  );
}
