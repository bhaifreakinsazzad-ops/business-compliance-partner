import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import type { PublicCourseCard } from "@/types/domain";
import { Badge, StatusBadge } from "@/components/ui/Badge";

export function CourseCard({ course }: { course: PublicCourseCard }) {
  return (
    <article className="group rounded-[16px] border border-ps-border bg-ps-white p-6 flex flex-col justify-between gap-5 shadow-[0_2px_10px_rgba(11,23,38,0.03)] hover:border-ps-navy/30 hover:shadow-md transition-all duration-200">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="cool">{course.categoryNameBn}</Badge>
          <StatusBadge status={course.availabilityStatus} />
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-ps-navy leading-snug group-hover:text-ps-midnight">
          <Link href={`/courses/${course.slug}`} className="hover:underline underline-offset-4">
            {course.titleBn}
          </Link>
        </h3>

        {course.titleEn ? (
          <p className="text-xs font-medium text-ps-muted" lang="en">
            {course.titleEn}
          </p>
        ) : null}

        <p className="text-sm text-ps-ink/85 leading-relaxed line-clamp-3">
          {course.summaryBn}
        </p>
      </div>

      <div className="pt-3 border-t border-ps-border/70 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-ps-muted">
          <BookOpen className="w-3.5 h-3.5 text-ps-navy" aria-hidden="true" />
          <span>কোর্স ক্যাটালগ ও আগ্রহ নিবন্ধন</span>
        </span>
        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ps-navy hover:text-ps-midnight hover:underline underline-offset-4 shrink-0"
        >
          <span>কোর্স সম্পর্কে জানুন</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
