"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Search } from "lucide-react";
import type {
  ApiResponse,
  PublicBookPreview,
  PublicCourseCard,
  PublicLicensingCard,
  PublicServiceCard,
} from "@/types/domain";
import { trackEvent } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

interface SearchResultPayload {
  courses: PublicCourseCard[];
  services: PublicServiceCard[];
  licensing: PublicLicensingCard[];
  books?: PublicBookPreview[];
}

type SearchPillarFilter = "all" | "courses" | "services" | "books";

export function UnifiedSearchSection() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<SearchPillarFilter>("all");
  const [loading, setLoading] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResultPayload | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runSearch = async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) {
      setResults(null);
      setSearchedQuery(null);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/catalogue/search?q=${encodeURIComponent(trimmed)}`,
      );
      const json = (await res.json()) as ApiResponse<SearchResultPayload>;
      if (!res.ok || !json.ok || !json.data) {
        setErrorMsg("অনুসন্ধান সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।");
        return;
      }
      setResults(json.data);
      setSearchedQuery(trimmed);
      const total =
        json.data.courses.length +
        json.data.services.length +
        json.data.licensing.length +
        (json.data.books?.length ?? 0);
      trackEvent("search_catalogue", { resultCount: total });
    } catch {
      setErrorMsg("সার্ভারের সাথে সংযোগে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void runSearch(query);
  };

  const booksResults = results?.books ?? [];
  const totalCount = results
    ? results.courses.length +
      results.services.length +
      results.licensing.length +
      booksResults.length
    : 0;

  const filterTabs: Array<{
    id: SearchPillarFilter;
    labelEn: string;
    labelBn: string;
    count?: number;
  }> = [
    { id: "all", labelEn: "All", labelBn: "সব", count: totalCount },
    {
      id: "courses",
      labelEn: "Courses",
      labelBn: "কোর্স",
      count: results?.courses.length,
    },
    {
      id: "services",
      labelEn: "Services",
      labelBn: "সেবা",
      count: results?.services.length,
    },
    {
      id: "books",
      labelEn: "Books",
      labelBn: "বই",
      count: results ? booksResults.length : undefined,
    },
  ];

  const showCourses = activeFilter === "all" || activeFilter === "courses";
  const showServices = activeFilter === "all" || activeFilter === "services";
  const showBooks = activeFilter === "all" || activeFilter === "books";
  const showLicensing = activeFilter === "all";

  return (
    <div
      id="unified-search"
      className="rounded-[16px] bg-white border border-[#D4CCE3] p-6 sm:p-8 shadow-sm space-y-5"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <p
            className="font-en text-xs font-bold uppercase tracking-[0.14em] text-[#51406F]"
            lang="en"
          >
            Search Across Courses · Services · Books
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-[#081838]">
            এক জায়গায় Courses, Services, Books ও লাইসেন্সিং খুঁজুন
          </h2>
          <p className="text-sm text-[#596775]">
            বাংলা বা ইংরেজি কীওয়ার্ড লিখুন (যেমন: VAT, BIN, e-TIN, RJSC, e-GP, ট্রেড লাইসেন্স)।
          </p>
        </div>

        {/* Client-mandated Filter Tabs: All | Courses | Services | Books */}
        <div
          role="tablist"
          aria-label="অনুসন্ধান বিভাগ ফিল্টার"
          className="flex flex-wrap items-center gap-1.5"
        >
          {filterTabs.map((tab) => {
            const isSelected = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                data-search-filter={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 min-h-9 px-3 py-1.5 rounded-[9px] text-xs font-semibold border transition-colors cursor-pointer",
                  isSelected
                    ? "bg-[#51406F] text-white border-[#51406F]"
                    : "bg-[#F2EFF8] text-[#081838] border-[#D4CCE3] hover:bg-[#DDD6EB]",
                )}
              >
                <span className="font-en" lang="en">
                  {tab.labelEn}
                </span>
                <span className="opacity-80">{tab.labelBn}</span>
                {results && typeof tab.count === "number" ? (
                  <span
                    className={cn(
                      "tabular-nums text-[11px]",
                      isSelected ? "text-[#DFB15B]" : "text-[#51406F]",
                    )}
                  >
                    ({tab.count})
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <search>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 items-stretch"
        >
          <label htmlFor="unified-search-input" className="visually-hidden">
            Courses, Services, Books বা লাইসেন্সিং অনুসন্ধান করুন
          </label>
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 text-[#51406F] absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="unified-search-input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="বিষয় বা শব্দের নাম লিখুন (যেমন: Income Tax, BIN, RJSC, Fire)..."
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="search"
              className="w-full min-h-12 ps-11 pe-4 py-2.5 rounded-[12px] border border-[#D4CCE3] bg-[#F2EFF8]/60 text-[#181D26] text-base placeholder:text-[#596775]/80 focus:border-[#51406F]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="ps-primary-button shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>খুঁজছে...</span>
              </>
            ) : (
              <span>অনুসন্ধান করুন</span>
            )}
          </button>
        </form>
      </search>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[#596775] font-medium">জনপ্রিয় অনুসন্ধান:</span>
        {["Income Tax", "VAT", "e-GP", "RJSC", "Fire", "IRC"].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              setQuery(tag);
              void runSearch(tag);
            }}
            className="inline-flex items-center min-h-9 rounded-[8px] border border-[#D4CCE3] bg-[#F2EFF8] px-3 py-1.5 font-semibold text-[#51406F] hover:border-[#51406F] hover:bg-[#DDD6EB] transition-colors cursor-pointer"
          >
            {tag}
          </button>
        ))}
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults(null);
              setSearchedQuery(null);
            }}
            className="inline-flex items-center min-h-9 rounded-[8px] border border-[#D4CCE3] bg-white px-3 py-1.5 font-semibold text-[#596775] hover:text-[#081838] transition-colors cursor-pointer"
          >
            মুছুন
          </button>
        ) : null}
      </div>

      {errorMsg ? (
        <p role="alert" className="text-sm text-ps-danger font-medium">
          {errorMsg}
        </p>
      ) : null}

      {results && searchedQuery ? (
        <div
          className="pt-4 border-t border-[#D4CCE3] space-y-5"
          aria-live="polite"
        >
          {totalCount === 0 ? (
            <div className="rounded-[12px] bg-[#F2EFF8] border border-[#D4CCE3] p-5 text-sm text-[#181D26] flex flex-wrap items-center justify-between gap-3">
              <span>
                “{searchedQuery}” এর জন্য প্রকাশিত কোনো ফলাফল পাওয়া যায়নি। সরাসরি আপনার
                প্রয়োজন লিখে পাঠাতে পারেন।
              </span>
              <Link
                href="/consultancy"
                className="font-semibold text-[#51406F] underline underline-offset-4"
              >
                পরামর্শের অনুরোধ করুন →
              </Link>
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-5",
                activeFilter === "all"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                  : "grid-cols-1",
              )}
            >
              {showCourses ? (
                <div className="space-y-2.5" data-search-group="courses">
                  <h3 className="text-sm font-bold text-[#081838]">
                    <span className="font-en" lang="en">
                      Courses
                    </span>{" "}
                    · কোর্স ({results.courses.length})
                  </h3>
                  {results.courses.length > 0 ? (
                    <ul
                      className={cn(
                        "gap-2",
                        activeFilter === "courses"
                          ? "grid grid-cols-1 md:grid-cols-2"
                          : "space-y-2",
                      )}
                    >
                      {results.courses.map((item) => (
                        <li key={item.slug}>
                          <Link
                            href={`/courses/${item.slug}`}
                            className="flex items-center justify-between gap-2 rounded-[10px] border border-[#D4CCE3] p-3 text-sm text-[#081838] hover:bg-[#F2EFF8]"
                          >
                            <span className="font-medium line-clamp-1">
                              {item.titleBn}
                            </span>
                            <ArrowRight
                              className="w-3.5 h-3.5 text-[#51406F] shrink-0"
                              aria-hidden="true"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-[#596775]">কোনো মিল পাওয়া যায়নি।</p>
                  )}
                </div>
              ) : null}

              {showServices ? (
                <div className="space-y-2.5" data-search-group="services">
                  <h3 className="text-sm font-bold text-[#081838]">
                    <span className="font-en" lang="en">
                      Services
                    </span>{" "}
                    · পেশাদার সেবা ({results.services.length})
                  </h3>
                  {results.services.length > 0 ? (
                    <ul
                      className={cn(
                        "gap-2",
                        activeFilter === "services"
                          ? "grid grid-cols-1 md:grid-cols-2"
                          : "space-y-2",
                      )}
                    >
                      {results.services.map((item) => (
                        <li key={item.slug}>
                          <Link
                            href={`/services/${item.slug}`}
                            className="flex items-center justify-between gap-2 rounded-[10px] border border-[#D4CCE3] p-3 text-sm text-[#081838] hover:bg-[#F2EFF8]"
                          >
                            <span className="font-medium line-clamp-1">
                              {item.titleBn}
                            </span>
                            <ArrowRight
                              className="w-3.5 h-3.5 text-[#51406F] shrink-0"
                              aria-hidden="true"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-[#596775]">কোনো মিল পাওয়া যায়নি।</p>
                  )}
                </div>
              ) : null}

              {showBooks ? (
                <div className="space-y-2.5" data-search-group="books">
                  <h3 className="text-sm font-bold text-[#081838]">
                    <span className="font-en" lang="en">
                      Books
                    </span>{" "}
                    · বইসমূহ ({booksResults.length})
                  </h3>
                  {booksResults.length > 0 ? (
                    <ul
                      className={cn(
                        "gap-2",
                        activeFilter === "books"
                          ? "grid grid-cols-1 md:grid-cols-2"
                          : "space-y-2",
                      )}
                    >
                      {booksResults.map((item) => (
                        <li key={item.slug}>
                          <Link
                            href={`/books/${item.slug}`}
                            className="flex items-center justify-between gap-2 rounded-[10px] border border-[#D4CCE3] p-3 text-sm text-[#081838] hover:bg-[#F2EFF8]"
                          >
                            <span className="font-medium line-clamp-1">
                              {item.titleBn}
                            </span>
                            <ArrowRight
                              className="w-3.5 h-3.5 text-[#51406F] shrink-0"
                              aria-hidden="true"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-[#596775]">কোনো মিল পাওয়া যায়নি।</p>
                  )}
                </div>
              ) : null}

              {showLicensing ? (
                <div className="space-y-2.5" data-search-group="licensing">
                  <h3 className="text-sm font-bold text-[#081838]">
                    লাইসেন্সিং ({results.licensing.length})
                  </h3>
                  {results.licensing.length > 0 ? (
                    <ul className="space-y-2">
                      {results.licensing.map((item) => (
                        <li key={item.slug}>
                          <Link
                            href={`/licensing/${item.slug}`}
                            className="flex items-center justify-between gap-2 rounded-[10px] border border-[#D4CCE3] p-3 text-sm text-[#081838] hover:bg-[#F2EFF8]"
                          >
                            <span className="font-medium line-clamp-1">
                              {item.titleBn}
                            </span>
                            <ArrowRight
                              className="w-3.5 h-3.5 text-[#51406F] shrink-0"
                              aria-hidden="true"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-[#596775]">কোনো মিল পাওয়া যায়নি।</p>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
