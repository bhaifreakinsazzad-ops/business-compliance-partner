import Link from "next/link";
import { ChevronRight, Clock, Laptop } from "lucide-react";
import type { PublicCourseCard } from "@/types/domain";
import { getAvailabilityLabelBn } from "@/lib/content/helpers";
import { buildWhatsAppCourseMessage } from "@/lib/contact/whatsapp";
import { getCourseVisualTheme } from "@/lib/home/popular-courses";
import { CourseArtworkThumbnail } from "@/components/shared/CourseArtworkThumbnail";
import { WhatsAppEnquiryButton } from "@/components/shared/WhatsAppEnquiryButton";

interface CourseCardProps {
  course: PublicCourseCard;
  verifiedWhatsapp?: string | null;
  canonicalBaseUrl?: string | null;
  variant?: "featured" | "catalog";
}

export function CourseCard({
  course,
  verifiedWhatsapp = null,
  canonicalBaseUrl = null,
  variant = "catalog",
}: CourseCardProps) {
  const isFeatured = variant === "featured";
  const theme = getCourseVisualTheme(course.categorySlug);
  const coursePath = `/courses/${course.slug}`;
  const enquiryHref = `/consultancy?pillar=COURSES&slug=${encodeURIComponent(
    course.slug,
  )}&topic=${encodeURIComponent(course.titleBn)}`;
  const courseWhatsAppMessage = buildWhatsAppCourseMessage({
    courseName: course.titleBn,
    coursePath,
    canonicalBaseUrl,
  });

  const statusTone =
    course.availabilityStatus === "ACTIVE"
      ? "text-[#00865A]"
      : course.availabilityStatus === "INTEREST_ONLY"
        ? "text-[#9A6300]"
        : "text-[#243FBA]";

  const hasVerifiedMeta = Boolean(course.deliveryMode || course.duration);

  return (
    <article
      data-popular-course-card={isFeatured ? course.slug : undefined}
      data-course-card={course.slug}
      className="bcp-surface-card group flex flex-col justify-between overflow-hidden"
    >
      {/* Shared 16:9 BCP-Branded Course Artwork Thumbnail */}
      <Link href={coursePath} className="block overflow-hidden">
        <CourseArtworkThumbnail
          categorySlug={course.categorySlug}
          categoryNameBn={course.categoryNameBn}
          badgeText={theme.badgeText}
          codeLabel={theme.codeLabel}
          variant={variant}
        />
      </Link>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-1.5">
          {!isFeatured ? (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-semibold">
              <span className="text-[#596775]">{course.categoryNameBn}</span>
              <span aria-hidden="true" className="text-[#E1E4F2]">
                ·
              </span>
              <span className={statusTone}>
                {getAvailabilityLabelBn(course.availabilityStatus)}
              </span>
            </div>
          ) : null}

          <h3 className="text-[15px] sm:text-base font-bold text-[#081838] leading-snug line-clamp-2 group-hover:text-[#243FBA] transition-colors">
            <Link href={coursePath} className="hover:underline underline-offset-4">
              {course.titleBn}
            </Link>
          </h3>

          {!isFeatured && course.titleEn ? (
            <p className="text-xs font-en font-medium text-[#596775] line-clamp-1" lang="en">
              {course.titleEn}
            </p>
          ) : null}

          <p className="text-xs text-[#596775] leading-relaxed line-clamp-2">
            {course.summaryBn}
          </p>

          {!isFeatured && hasVerifiedMeta ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs font-medium text-[#081838]">
              {course.deliveryMode ? (
                <span className="inline-flex items-center gap-1">
                  <Laptop className="w-3.5 h-3.5 text-[#243FBA]" aria-hidden="true" />
                  <span>{course.deliveryMode}</span>
                </span>
              ) : null}
              {course.duration ? (
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#243FBA]" aria-hidden="true" />
                  <span>{course.duration}</span>
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Hairline Divider + Fee/Status + Compact Details Action */}
        <div className="pt-3 border-t border-[#E1E4F2] space-y-2.5">
          <div className="flex items-center justify-between gap-2">
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

          {!isFeatured && verifiedWhatsapp ? (
            <div className="pt-0.5">
              <WhatsAppEnquiryButton
                verifiedWhatsapp={verifiedWhatsapp}
                serviceName={course.titleBn}
                servicePath={coursePath}
                canonicalBaseUrl={canonicalBaseUrl}
                customMessage={courseWhatsAppMessage}
                fallbackHref={enquiryHref}
                labelBn="WhatsApp-এ জানুন"
                size="sm"
                variant="emerald"
              />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
