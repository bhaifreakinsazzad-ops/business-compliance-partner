"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import type { PublicBookCategoryDTO, PublicBookPreview } from "@/types/domain";
import {
  ALL_TAB_SLUG,
  buildPopularBookTabs,
  filterBooksByTab,
} from "@/lib/home/popular-courses";
import { BookCard } from "@/components/books/BookCard";
import { cn } from "@/lib/utils";

interface BooksShowcaseSectionProps {
  books: PublicBookPreview[];
  categories: PublicBookCategoryDTO[];
}

export function BooksShowcaseSection({
  books,
  categories,
}: BooksShowcaseSectionProps) {
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB_SLUG);

  const tabs = useMemo(
    () => buildPopularBookTabs(books, categories, 5),
    [books, categories],
  );

  const visibleBooks = useMemo(
    () => filterBooksByTab(books, activeTab, 8),
    [books, activeTab],
  );

  const activeTabId = `books-storefront-tab-${activeTab}`;

  return (
    <section
      id="pillar-books"
      data-home-pillar="books"
      aria-label="03. Books — আমাদের সকল বইসমূহ"
      className="bcp-periwinkle-soft py-12 sm:py-16 border-b border-[#E1E4F2]"
    >
      <div className="ps-container space-y-8">
        {/* Centered Books Storefront Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="inline-flex items-center gap-1.5 font-en text-xs font-bold uppercase tracking-[0.16em] text-[#243FBA]">
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>03 · Books · Publication Storefront</span>
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-[2.1rem] font-extrabold text-[#202D72] tracking-tight">
            আমাদের সকল বইসমূহ
          </h2>
          <div
            className="mx-auto w-14 h-1 rounded-full bg-[#243FBA]"
            aria-hidden="true"
          />
          <p className="text-sm sm:text-base text-[#596775] leading-relaxed">
            আয়কর, ভ্যাট, e-GP, RJSC ও ই-কমার্স কমপ্লায়েন্স বিষয়ক প্র্যাকটিক্যাল
            হ্যান্ডবুক এবং রেফারেন্স প্রকাশনা।
          </p>
        </div>

        {/* Category Filter Tabs */}
        {tabs.length > 1 ? (
          <div
            role="tablist"
            aria-label="বইয়ের বিভাগ ফিল্টার"
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {tabs.map((tab) => {
              const isSelected = activeTab === tab.slug;
              return (
                <button
                  key={tab.slug}
                  id={`books-storefront-tab-${tab.slug}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls="books-storefront-panel"
                  data-book-tab={tab.slug}
                  onClick={() => setActiveTab(tab.slug)}
                  className={cn(
                    "inline-flex items-center gap-1.5 min-h-10 px-4 py-2 rounded-[10px] text-xs sm:text-sm font-semibold border transition-colors cursor-pointer",
                    isSelected
                      ? "bg-[#243FBA] text-white border-[#243FBA] shadow-xs"
                      : "bg-white text-[#081838] border-[#E1E4F2] hover:bg-[#E2E3FF] hover:border-[#B8BBFF]",
                  )}
                >
                  <span>{tab.labelBn}</span>
                  <span
                    className={cn(
                      "text-[11px] tabular-nums",
                      isSelected ? "text-white/85" : "text-[#596775]",
                    )}
                  >
                    ({tab.count})
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        {/* Unified E-Commerce Portrait Book Product Grid */}
        <div
          id="books-storefront-panel"
          role="tabpanel"
          aria-labelledby={tabs.length > 1 ? activeTabId : undefined}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {visibleBooks.map((book) => (
              <BookCard key={book.slug} book={book} variant="storefront" />
            ))}
          </div>
        </div>

        {/* View All Books Storefront CTA */}
        <div className="text-center pt-1">
          <Link href="/books" className="ps-primary-button max-w-full sm:whitespace-nowrap text-center">
            <span>সকল প্রকাশনা ও বইসমূহ দেখুন</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
