"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Search } from "lucide-react";
import type {
  ApiResponse,
  PublicCourseCard,
  PublicLicensingCard,
  PublicServiceCard,
} from "@/types/domain";
import { trackEvent } from "@/lib/analytics/events";

interface SearchResultPayload {
  courses: PublicCourseCard[];
  services: PublicServiceCard[];
  licensing: PublicLicensingCard[];
}

export function UnifiedSearchSection() {
  const [query, setQuery] = useState("");
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
        json.data.licensing.length;
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

  const totalCount = results
    ? results.courses.length +
      results.services.length +
      results.licensing.length
    : 0;

  return (
    <div id="unified-search" className="rounded-[16px] bg-ps-white border border-ps-border p-6 sm:p-8 shadow-sm space-y-6">
      <div className="space-y-2 max-w-2xl">
        <h2 className="text-xl sm:text-2xl font-bold text-ps-navy">
          এক জায়গায় কোর্স, সেবা ও লাইসেন্সিং খুঁজুন
        </h2>
        <p className="text-sm text-ps-ink/85">
          বাংলা বা ইংরেজি কীওয়ার্ড লিখুন (যেমন: VAT, BIN, e-TIN, RJSC, e-GP, ট্রেড লাইসেন্স)।
        </p>
      </div>

      <search>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 items-stretch"
        >
          <label htmlFor="unified-search-input" className="visually-hidden">
            কোর্স, সেবা বা লাইসেন্সিং অনুসন্ধান করুন
          </label>
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 text-ps-muted absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="unified-search-input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="বিষয় বা শব্দের নাম লিখুন (যেমন: Income Tax, BIN, Fire Licence)..."
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="search"
              className="w-full min-h-12 ps-11 pe-4 py-2.5 rounded-[12px] border border-ps-navy/25 bg-ps-ivory/50 text-ps-ink text-base placeholder:text-ps-muted/75"
            />
          </div>
          <button type="submit" disabled={loading} className="ps-primary-button shrink-0">
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

      {/* Quick suggestion chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-ps-muted font-medium">জনপ্রিয় অনুসন্ধান:</span>
        {["Income Tax", "VAT", "e-GP", "RJSC", "Fire", "IRC"].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              setQuery(tag);
              void runSearch(tag);
            }}
            className="rounded-full border border-ps-border bg-ps-cool px-3 py-1 font-medium text-ps-navy hover:border-ps-navy/40 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>

      {errorMsg ? (
        <p role="alert" className="text-sm text-ps-danger font-medium">
          {errorMsg}
        </p>
      ) : null}

      {results && searchedQuery ? (
        <div className="pt-4 border-t border-ps-border space-y-5" aria-live="polite">
          {totalCount === 0 ? (
            <div className="rounded-[12px] bg-ps-cool p-5 text-sm text-ps-ink flex flex-wrap items-center justify-between gap-3">
              <span>
                “{searchedQuery}” এর জন্য প্রকাশিত কোনো ফলাফল পাওয়া যায়নি। সরাসরি আপনার
                প্রয়োজন লিখে পাঠাতে পারেন।
              </span>
              <Link href="/consultancy" className="font-semibold text-ps-navy underline underline-offset-4">
                পরামর্শের অনুরোধ করুন →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2.5">
                <h3 className="text-sm font-bold text-ps-navy">
                  কোর্স ({results.courses.length})
                </h3>
                {results.courses.length > 0 ? (
                  <ul className="space-y-2">
                    {results.courses.map((item) => (
                      <li key={item.slug}>
                        <Link
                          href={`/courses/${item.slug}`}
                          className="flex items-center justify-between gap-2 rounded-[10px] border border-ps-border p-3 text-sm text-ps-navy hover:bg-ps-cool"
                        >
                          <span className="font-medium line-clamp-1">{item.titleBn}</span>
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-ps-muted">কোনো মিল পাওয়া যায়নি।</p>
                )}
              </div>

              <div className="space-y-2.5">
                <h3 className="text-sm font-bold text-ps-navy">
                  পেশাদার সেবা ({results.services.length})
                </h3>
                {results.services.length > 0 ? (
                  <ul className="space-y-2">
                    {results.services.map((item) => (
                      <li key={item.slug}>
                        <Link
                          href={`/services/${item.slug}`}
                          className="flex items-center justify-between gap-2 rounded-[10px] border border-ps-border p-3 text-sm text-ps-navy hover:bg-ps-cool"
                        >
                          <span className="font-medium line-clamp-1">{item.titleBn}</span>
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-ps-muted">কোনো মিল পাওয়া যায়নি।</p>
                )}
              </div>

              <div className="space-y-2.5">
                <h3 className="text-sm font-bold text-ps-navy">
                  লাইসেন্সিং ({results.licensing.length})
                </h3>
                {results.licensing.length > 0 ? (
                  <ul className="space-y-2">
                    {results.licensing.map((item) => (
                      <li key={item.slug}>
                        <Link
                          href={`/licensing/${item.slug}`}
                          className="flex items-center justify-between gap-2 rounded-[10px] border border-ps-border p-3 text-sm text-ps-navy hover:bg-ps-cool"
                        >
                          <span className="font-medium line-clamp-1">{item.titleBn}</span>
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-ps-muted">কোনো মিল পাওয়া যায়নি।</p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
