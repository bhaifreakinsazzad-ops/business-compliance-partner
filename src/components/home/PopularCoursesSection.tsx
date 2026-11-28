"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicCategoryDTO, PublicCourseCard } from "@/types/domain";
import {
  ALL_TAB_SLUG,
  buildPopularCourseTabs,
  filterPopularCourses,
} from "@/lib/home/popular-courses";
import { CourseCard } from "@/components/shared/CourseCard";
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

  // Reference-aligned featured density: 6 featured courses
  const visibleCourses = useMemo(
    () => filterPopularCourses(courses, activeTab, 6),
    [courses, activeTab],
  );

  const activeTabId = `popular-courses-tab-${activeTab}`;

  return (
    <section
      id="pillar-courses"
      data-home-pillar="courses"
      aria-label="01. Courses — আমাদের জনপ্রিয় কোর্সসমূহ"
      className="py-12 sm:py-16 bg-white border-b border-[#E1E4F2]"
    >
      <div className="ps-container space-y-8">
        {/* Centered Section Header matching reference video */}
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

        {/* Centered Category Filter Tabs with complete ARIA tablist/tabpanel wiring */}
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
                  id={`popular-courses-tab-${tab.slug}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls="popular-courses-panel"
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

        {/* Unified 4-Column Product Card Grid */}
        <div
          id="popular-courses-panel"
          role="tabpanel"
          aria-labelledby={tabs.length > 1 ? activeTabId : undefined}
        >
          {visibleCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {visibleCourses.map((course) => (
                <CourseCard
                  key={course.slug}
                  course={course}
                  variant="featured"
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[16px] border border-[#E1E4F2] bg-[#FBFAFF] p-8 text-center text-sm text-[#596775]">
              এই বিভাগে বর্তমানে কোনো প্রকাশিত কোর্স নেই। অনুগ্রহ করে সব কোর্স দেখুন।
            </div>
          )}
        </div>

        {/* View All Courses CTA */}
        <div className="text-center pt-1">
          <Link
            href="/courses"
            className="ps-primary-button max-w-full sm:whitespace-nowrap text-center"
          >
            <span>সকল কোর্স ও ১০টি প্রশিক্ষণ বিভাগ দেখুন</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
