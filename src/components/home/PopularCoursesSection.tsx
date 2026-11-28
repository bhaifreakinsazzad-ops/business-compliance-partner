"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, GraduationCap } from "lucide-react";
import type { PublicCategoryDTO, PublicCourseCard } from "@/types/domain";
import {
  ALL_TAB_SLUG,
  buildPopularCourseTabs,
  filterPopularCourses,
  getCourseVisualTheme,
  isDarkCourseVisualHeader,
} from "@/lib/home/popular-courses";
import { getAvailabilityLabelBn } from "@/lib/content/helpers";
import { cn } from "@/lib/utils";

interface PopularCoursesSectionProps {
  courses: PublicCourseCard[];
  categories: PublicCategoryDTO[];
}

export function PopularCoursesSection({
  courses,
  categories,
}: PopularCoursesSectionProps) {
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB_SLUG);

  const tabs = useMemo(
    () => buildPopularCourseTabs(courses, categories, 5),
    [courses, categories],
  );

  const visibleCourses = useMemo(
    () => filterPopularCourses(courses, activeTab, 8),
    [courses, activeTab],
  );

  return (
    <section
      id="pillar-courses"
      data-home-pillar="courses"
      aria-label="01. Courses — আমাদের জনপ্রিয় কোর্সসমূহ"
      className="py-12 sm:py-16 bg-white border-b border-[#E1E4F2]"
    >
      <div className="ps-container space-y-8">
        {/* Centered Section Header matching reference */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl lg:text-[2.1rem] font-extrabold text-[#202D72] tracking-tight">
            আমাদের জনপ্রিয় কোর্সসমূহ
          </h2>
          <div
            className="mx-auto w-14 h-1 rounded-full bg-[#243FBA]"
            aria-hidden="true"
          />
          <p className="text-sm sm:text-base text-[#596775] leading-relaxed">
            আপনার পেশাদার দক্ষতা সমৃদ্ধ করতে Tax, VAT, e-GP, E-commerce ও RJSC
            বিষয়ক ব্যবহারিক কোর্সগুলোতে অংশ নিন।
          </p>
        </div>

        {/* Centered Category Filter Buttons */}
        {tabs.length > 1 ? (
          <div
            role="tablist"
            aria-label="কোর্স ক্যাটাগরি ফিল্টার"
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5"
          >
            {tabs.map((tab) => {
              const isSelected = activeTab === tab.slug;
              return (
                <button
                  key={tab.slug}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  data-course-tab={tab.slug}
                  onClick={() => setActiveTab(tab.slug)}
                  className={cn(
                    "inline-flex items-center gap-1.5 min-h-10 px-4 py-2 rounded-[10px] text-xs sm:text-sm font-semibold border transition-colors cursor-pointer",
                    isSelected
                      ? "bg-[#243FBA] text-white border-[#243FBA] shadow-xs"
                      : "bg-[#F5F6FA] text-[#081838] border-[#E1E4F2] hover:bg-[#E2E3FF] hover:border-[#B8BBFF]",
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

        {/* 4-Column Reference-Faithful Course Card Grid */}
        {visibleCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {visibleCourses.map((course) => {
              const theme = getCourseVisualTheme(course.categorySlug);
              const isDarkHeader = isDarkCourseVisualHeader(course.categorySlug);
              const coursePath = `/courses/${course.slug}`;

              return (
                <article
                  key={course.slug}
                  data-popular-course-card={course.slug}
                  className="bcp-surface-card group flex flex-col justify-between overflow-hidden"
                >
                  {/* 16:9 BCP Category Banner Graphic */}
                  <Link
                    href={coursePath}
                    className={cn(
                      "relative aspect-video w-full bg-gradient-to-br p-4 flex flex-col justify-between overflow-hidden border-b border-[#E1E4F2]",
                      theme.surfaceBgClass,
                    )}
                  >
                    <div
                      aria-hidden="true"
                      className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/15"
                    />
                    <div className="relative flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "font-en text-[10px] font-bold uppercase tracking-[0.12em]",
                          isDarkHeader ? "text-[#DFB15B]" : "text-[#243FBA]",
                        )}
                        lang="en"
                      >
                        {theme.badgeText}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center justify-center w-7 h-7 rounded-[8px]",
                          isDarkHeader
                            ? "bg-white/12 text-white"
                            : "bg-white/85 text-[#243FBA]",
                        )}
                      >
                        <GraduationCap className="w-4 h-4" aria-hidden="true" />
                      </span>
                    </div>

                    <div className="relative space-y-1">
                      <p
                        className={cn(
                          "text-sm sm:text-base font-extrabold leading-snug line-clamp-2",
                          isDarkHeader ? "text-white" : "text-[#081838]",
                        )}
                      >
                        {course.categoryNameBn}
                      </p>
                      <p
                        className={cn(
                          "font-en text-[10px] font-semibold uppercase tracking-wider",
                          isDarkHeader ? "text-[#CCCEFF]" : "text-[#596775]",
                        )}
                        lang="en"
                      >
                        {theme.codeLabel}
                      </p>
                    </div>
                  </Link>

                  {/* Card Body matching Screenshot 2026-11-26 231321.png */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-1.5">
                      <h3 className="text-[15px] sm:text-base font-bold text-[#081838] leading-snug line-clamp-2 group-hover:text-[#243FBA] transition-colors">
                        <Link
                          href={coursePath}
                          className="hover:underline underline-offset-4"
                        >
                          {course.titleBn}
                        </Link>
                      </h3>
                      <p className="text-xs text-[#596775] line-clamp-2">
                        {course.summaryBn}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E1E4F2] flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[#202D72] tabular-nums">
                        {course.feeDisplay
                          ? course.feeDisplay
                          : getAvailabilityLabelBn(course.availabilityStatus)}
                      </span>
                      <Link
                        href={coursePath}
                        className="inline-flex items-center gap-1 rounded-[8px] bg-[#E2E3FF] text-[#243FBA] hover:bg-[#243FBA] hover:text-white px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>বিস্তারিত</span>
                        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[16px] border border-[#E1E4F2] bg-[#FBFAFF] p-8 text-center text-sm text-[#596775]">
            এই বিভাগে বর্তমানে কোনো প্রকাশিত কোর্স নেই। অনুগ্রহ করে সব কোর্স দেখুন।
          </div>
        )}

        {/* View All Courses CTA */}
        <div className="text-center pt-1">
          <Link
            href="/courses"
            className="ps-primary-button whitespace-nowrap"
          >
            <span>সকল কোর্স ও ১০টি প্রশিক্ষণ বিভাগ দেখুন</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
