"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BookText,
  BriefcaseBusiness,
  FileCheck2,
  Loader2,
  Search,
  X,
} from "lucide-react";
import type {
  ApiResponse,
  PublicBookPreview,
  PublicCourseCard,
  PublicLicensingCard,
  PublicServiceCard,
} from "@/types/domain";

interface SearchResultPayload {
  courses: PublicCourseCard[];
  services: PublicServiceCard[];
  licensing: PublicLicensingCard[];
  books?: PublicBookPreview[];
}

const QUICK_CHIPS = [
  "Income Tax",
  "VAT",
  "e-GP",
  "RJSC",
  "Trade Licence",
  "Fire",
  "IRC",
];

interface QuickSearchDialogProps {
  variant?: "desktop" | "mobile";
}

export function QuickSearchDialog({
  variant = "desktop",
}: QuickSearchDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResultPayload | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openDialog = () => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    setIsOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 40);
  };

  const closeDialog = () => {
    const dialog = dialogRef.current;
    if (!dialog || !dialog.open) return;
    dialog.close();
    setIsOpen(false);
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => {
      setIsOpen(false);
      triggerRef.current?.focus();
    };
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  useEffect(() => {
    if (variant !== "desktop") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialogRef.current?.open) {
          closeDialog();
        } else {
          openDialog();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [variant]);

  useEffect(() => {
    if (!isOpen) return;
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(null);
      setErrorMsg(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch(
          `/api/catalogue/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        const json = (await res.json()) as ApiResponse<SearchResultPayload>;
        if (!res.ok || !json.ok || !json.data) {
          setErrorMsg("অনুসন্ধান সম্পন্ন করা যায়নি।");
          return;
        }
        setResults(json.data);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setErrorMsg("সার্ভারের সাথে সংযোগে সমস্যা হয়েছে।");
        }
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, isOpen]);

  const booksResults = results?.books ?? [];
  const totalCount = results
    ? results.courses.length +
      results.services.length +
      results.licensing.length +
      booksResults.length
    : 0;

  return (
    <>
      {variant === "desktop" ? (
        <button
          ref={triggerRef}
          type="button"
          onClick={openDialog}
          data-quick-search-trigger="desktop"
          title="দ্রুত ক্যাটালগ অনুসন্ধান (Ctrl+K)"
          className="inline-flex items-center gap-2 h-10 px-3 rounded-[10px] border border-[#D4CCE3] bg-[#F2EFF8] text-[#51406F] hover:bg-[#DDD6EB] transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="sr-only xl:not-sr-only text-xs font-semibold text-[#51406F]">
            খুঁজুন
          </span>
        </button>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={openDialog}
          data-quick-search-trigger="mobile"
          aria-label="ক্যাটালগ অনুসন্ধান"
          className="inline-flex items-center justify-center w-11 h-11 rounded-[12px] border border-[#D4CCE3] bg-[#F2EFF8] text-[#51406F] hover:bg-[#DDD6EB] cursor-pointer"
        >
          <Search className="w-5 h-5" aria-hidden="true" />
        </button>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby={`quick-search-title-${variant}`}
        closedby="any"
        className="m-auto w-[min(94vw,720px)] max-h-[85dvh] rounded-[18px] border border-[#D4CCE3] bg-white p-0 text-[#181D26] shadow-2xl backdrop:bg-[#081838]/70 backdrop:backdrop-blur-xs"
      >
        <div className="flex flex-col max-h-[85dvh]">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#D4CCE3] bg-[#F2EFF8]">
            <div>
              <h2
                id={`quick-search-title-${variant}`}
                className="text-base sm:text-lg font-bold text-[#081838]"
              >
                দ্রুত ক্যাটালগ অনুসন্ধান
              </h2>
              <p className="text-xs text-[#596775]">
                কোর্স, পেশাদার সেবা, বই ও লাইসেন্সিং একসাথে খুঁজুন
              </p>
            </div>
            <button
              type="button"
              onClick={closeDialog}
              aria-label="অনুসন্ধান বন্ধ করুন"
              className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] border border-[#D4CCE3] bg-white text-[#51406F] hover:bg-[#DDD6EB] cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="p-5 space-y-3 border-b border-[#D4CCE3]">
            <div className="relative">
              <Search
                className="w-4 h-4 text-[#596775] absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="যেমন: Income Tax, VAT, e-GP, RJSC, Trade Licence..."
                aria-label="অনুসন্ধান শব্দ লিখুন"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                className="w-full min-h-12 ps-11 pe-4 py-2.5 rounded-[12px] border border-[#D4CCE3] bg-[#F8F7FB] text-[#181D26] text-base placeholder:text-[#596775]/75"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#596775] font-medium">জনপ্রিয়:</span>
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setQuery(chip)}
                  className="inline-flex items-center min-h-9 px-3 rounded-[8px] border border-[#D4CCE3] bg-[#F2EFF8] text-xs font-semibold text-[#51406F] hover:bg-[#DDD6EB] transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto p-5 space-y-5"
            aria-live="polite"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-[#596775]">
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>ক্যাটালগ খোঁজা হচ্ছে...</span>
              </div>
            ) : errorMsg ? (
              <p role="alert" className="text-sm text-ps-danger font-medium">
                {errorMsg}
              </p>
            ) : !query.trim() ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <Link
                  href="/courses"
                  onClick={closeDialog}
                  className="rounded-[12px] border border-[#D4CCE3] bg-[#F2EFF8]/70 p-4 hover:bg-[#DDD6EB]/70 transition-colors space-y-1"
                >
                  <BookOpen className="w-4 h-4 text-[#51406F]" aria-hidden="true" />
                  <p className="font-bold text-[#081838]">সকল কোর্সসমূহ</p>
                  <p className="text-xs text-[#596775]">১০টি প্রশিক্ষণ ট্র্যাক</p>
                </Link>
                <Link
                  href="/services"
                  onClick={closeDialog}
                  className="rounded-[12px] border border-[#D4CCE3] bg-[#F2EFF8]/70 p-4 hover:bg-[#DDD6EB]/70 transition-colors space-y-1"
                >
                  <BriefcaseBusiness
                    className="w-4 h-4 text-[#51406F]"
                    aria-hidden="true"
                  />
                  <p className="font-bold text-[#081838]">সকল সেবাসমূহ</p>
                  <p className="text-xs text-[#596775]">১১টি পেশাদার বিভাগ</p>
                </Link>
                <Link
                  href="/books"
                  onClick={closeDialog}
                  className="rounded-[12px] border border-[#D4CCE3] bg-[#F2EFF8]/70 p-4 hover:bg-[#DDD6EB]/70 transition-colors space-y-1"
                >
                  <BookText className="w-4 h-4 text-[#51406F]" aria-hidden="true" />
                  <p className="font-bold text-[#081838]">আমাদের বইসমূহ</p>
                  <p className="text-xs text-[#596775]">আসন্ন প্রকাশনা প্রিভিউ</p>
                </Link>
                <Link
                  href="/licensing"
                  onClick={closeDialog}
                  className="rounded-[12px] border border-[#D4CCE3] bg-[#F2EFF8]/70 p-4 hover:bg-[#DDD6EB]/70 transition-colors space-y-1"
                >
                  <FileCheck2
                    className="w-4 h-4 text-[#51406F]"
                    aria-hidden="true"
                  />
                  <p className="font-bold text-[#081838]">লাইসেন্সিং</p>
                  <p className="text-xs text-[#596775]">নিবন্ধন ও অনুমোদন</p>
                </Link>
              </div>
            ) : results && totalCount === 0 ? (
              <div className="rounded-[12px] bg-[#F2EFF8] p-5 text-sm text-[#181D26] space-y-3">
                <p>
                  “{query.trim()}” এর জন্য প্রকাশিত কোনো ফলাফল পাওয়া যায়নি।
                </p>
                <Link
                  href="/consultancy"
                  onClick={closeDialog}
                  className="inline-flex items-center gap-1.5 font-semibold text-[#51406F] underline underline-offset-4"
                >
                  <span>সরাসরি পরামর্শের অনুরোধ পাঠান</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            ) : results ? (
              <div className="space-y-4">
                {results.courses.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#51406F]">
                      কোর্স ({results.courses.length})
                    </p>
                    <ul className="space-y-1.5">
                      {results.courses.map((item) => (
                        <li key={item.slug}>
                          <Link
                            href={`/courses/${item.slug}`}
                            onClick={closeDialog}
                            className="flex items-center justify-between gap-3 rounded-[10px] border border-[#D4CCE3] px-3.5 py-2.5 text-sm hover:bg-[#F2EFF8] transition-colors"
                          >
                            <span className="font-semibold text-[#081838] line-clamp-1">
                              {item.titleBn}
                            </span>
                            <span className="text-xs text-[#596775] shrink-0">
                              {item.categoryNameBn}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {results.services.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#51406F]">
                      পেশাদার সেবা ({results.services.length})
                    </p>
                    <ul className="space-y-1.5">
                      {results.services.map((item) => (
                        <li key={item.slug}>
                          <Link
                            href={`/services/${item.slug}`}
                            onClick={closeDialog}
                            className="flex items-center justify-between gap-3 rounded-[10px] border border-[#D4CCE3] px-3.5 py-2.5 text-sm hover:bg-[#F2EFF8] transition-colors"
                          >
                            <span className="font-semibold text-[#081838] line-clamp-1">
                              {item.titleBn}
                            </span>
                            <span className="text-xs text-[#596775] shrink-0">
                              {item.categoryNameBn}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {booksResults.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#51406F]">
                      আমাদের বইসমূহ ({booksResults.length})
                    </p>
                    <ul className="space-y-1.5">
                      {booksResults.map((item) => (
                        <li key={item.slug}>
                          <Link
                            href={`/books/${item.slug}`}
                            onClick={closeDialog}
                            className="flex items-center justify-between gap-3 rounded-[10px] border border-[#D4CCE3] px-3.5 py-2.5 text-sm hover:bg-[#F2EFF8] transition-colors"
                          >
                            <span className="font-semibold text-[#081838] line-clamp-1">
                              {item.titleBn}
                            </span>
                            <span className="text-xs text-[#51406F] shrink-0">
                              {item.categoryNameBn} · আসন্ন
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {results.licensing.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#51406F]">
                      লাইসেন্সিং ({results.licensing.length})
                    </p>
                    <ul className="space-y-1.5">
                      {results.licensing.map((item) => (
                        <li key={item.slug}>
                          <Link
                            href={`/licensing/${item.slug}`}
                            onClick={closeDialog}
                            className="flex items-center justify-between gap-3 rounded-[10px] border border-[#D4CCE3] px-3.5 py-2.5 text-sm hover:bg-[#F2EFF8] transition-colors"
                          >
                            <span className="font-semibold text-[#081838] line-clamp-1">
                              {item.titleBn}
                            </span>
                            <span className="text-xs text-[#596775] shrink-0">
                              {item.categoryNameBn}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </dialog>
    </>
  );
}
