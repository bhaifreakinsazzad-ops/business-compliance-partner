"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronRight } from "lucide-react";
import type { PublicBookCategoryDTO, PublicBookPreview } from "@/types/domain";
import {
  ALL_TAB_SLUG,
  buildPopularBookTabs,
  filterBooksByTab,
  formatBdtPaisaExact,
} from "@/lib/home/popular-courses";
import { BOOK_AVAILABILITY_BADGE_BN } from "@/lib/books/catalog";
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
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
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

        {/* E-Commerce Portrait Book Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {visibleBooks.map((book) => {
            const bookPath = `/books/${book.slug}`;
            const isPricedPublished =
              book.availabilityState === "PUBLISHED_PRICED" &&
              typeof book.pricePaisa === "number" &&
              book.pricePaisa > 0;

            return (
              <article
                key={book.slug}
                className="bcp-surface-card group flex flex-col justify-between overflow-hidden"
              >
                {/* Portrait Hardcover Display Area */}
                <Link
                  href={bookPath}
                  className="bg-[#FBFAFF] border-b border-[#E1E4F2] p-5 flex items-center justify-center"
                >
                  <div
                    className="relative w-32 sm:w-36 aspect-[3/4] rounded-e-[10px] rounded-s-[4px] p-3.5 flex flex-col justify-between shadow-[0_12px_24px_rgba(8,24,56,0.18)] border border-black/15 transition-transform duration-200 group-hover:-translate-y-1"
                    style={{
                      backgroundColor: book.coverPalette.coverHex,
                      color: book.coverPalette.textHex,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 start-0 w-2.5"
                      style={{ backgroundColor: book.coverPalette.spineHex }}
                    />
                    <span
                      className="ps-2 text-[9px] font-en font-bold uppercase tracking-wider opacity-90 line-clamp-1"
                      lang="en"
                    >
                      {book.categoryNameEn}
                    </span>
                    <span className="ps-2 text-xs sm:text-[13px] font-bold leading-snug line-clamp-3">
                      {book.titleBn}
                    </span>
                    <div className="ps-2 flex items-center justify-between">
                      <Image
                        src="/brand/bcp-master-logo.png"
                        alt="BCP"
                        width={22}
                        height={22}
                        referrerPolicy="no-referrer"
                        className="rounded-full bg-white object-contain"
                      />
                      <span className="font-en text-[9px] font-bold uppercase tracking-widest opacity-80">
                        BCP Edition
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Product Metadata & Action Row */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-[#243FBA]">
                      {book.categoryNameBn}
                    </p>
                    <h3 className="text-[15px] sm:text-base font-bold text-[#081838] leading-snug line-clamp-2 group-hover:text-[#243FBA] transition-colors">
                      <Link
                        href={bookPath}
                        className="hover:underline underline-offset-4"
                      >
                        {book.titleBn}
                      </Link>
                    </h3>
                    <p className="text-xs text-[#596775] line-clamp-2">
                      {book.subtitleBn}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E1E4F2] flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold text-[#202D72] tabular-nums">
                      {isPricedPublished && book.pricePaisa
                        ? formatBdtPaisaExact(book.pricePaisa)
                        : BOOK_AVAILABILITY_BADGE_BN}
                    </span>
                    <Link
                      href={bookPath}
                      className="inline-flex items-center gap-1 rounded-[8px] bg-[#E2E3FF] text-[#243FBA] hover:bg-[#243FBA] hover:text-white px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>{isPricedPublished ? "অর্ডার করুন" : "বিস্তারিত"}</span>
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* View All Books Storefront CTA */}
        <div className="text-center pt-1">
          <Link href="/books" className="ps-primary-button whitespace-nowrap">
            <span>সকল প্রকাশনা ও বইসমূহ দেখুন</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
