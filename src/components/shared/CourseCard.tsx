import Link from "next/link";
import { ArrowRight, Clock, Laptop } from "lucide-react";
import type { PublicCourseCard } from "@/types/domain";
import { getAvailabilityLabelBn } from "@/lib/content/helpers";
import { buildWhatsAppCourseMessage } from "@/lib/contact/whatsapp";
import { WhatsAppEnquiryButton } from "@/components/shared/WhatsAppEnquiryButton";

interface CourseCardProps {
  course: PublicCourseCard;
  verifiedWhatsapp?: string | null;
  canonicalBaseUrl?: string | null;
}

export function CourseCard({
  course,
  verifiedWhatsapp = null,
  canonicalBaseUrl = null,
}: CourseCardProps) {
  const hasVerifiedMeta = Boolean(
    course.deliveryMode || course.duration || course.feeDisplay,
  );

  const statusTone =
    course.availabilityStatus === "ACTIVE"
      ? "text-[#00865A]"
      : course.availabilityStatus === "INTEREST_ONLY"
        ? "text-[#9A6300]"
        : "text-[#51406F]";

  const coursePath = `/courses/${course.slug}`;
  const enquiryHref = `/consultancy?pillar=COURSES&slug=${encodeURIComponent(
    course.slug,
  )}&topic=${encodeURIComponent(course.titleBn)}`;
  const courseWhatsAppMessage = buildWhatsAppCourseMessage({
    courseName: course.titleBn,
    coursePath,
    canonicalBaseUrl,
  });

  return (
    <article className="bcp-surface-card group p-6 flex flex-col justify-between gap-5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold">
          <span className="text-text-muted">{course.categoryNameBn}</span>
          <span aria-hidden="true" className="text-border-subtle">
            ·
          </span>
          <span className={statusTone}>
            {getAvailabilityLabelBn(course.availabilityStatus)}
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-text-primary leading-snug group-hover:text-text-accent transition-colors">
          <Link href={coursePath} className="hover:underline underline-offset-4">
            {course.titleBn}
          </Link>
        </h3>

        {course.titleEn ? (
          <p className="text-xs font-medium text-[#596775]" lang="en">
            {course.titleEn}
          </p>
        ) : null}

        <p className="text-sm text-[#181D26]/85 leading-relaxed line-clamp-3">
          {course.summaryBn}
        </p>

        {hasVerifiedMeta ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 text-xs font-medium text-[#081838]">
            {course.deliveryMode ? (
              <span className="inline-flex items-center gap-1">
                <Laptop className="w-3.5 h-3.5 text-[#51406F]" aria-hidden="true" />
                <span>{course.deliveryMode}</span>
              </span>
            ) : null}
            {course.duration ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#51406F]" aria-hidden="true" />
                <span>{course.duration}</span>
              </span>
            ) : null}
            {course.feeDisplay ? (
              <span className="font-bold text-[#081838] tabular-nums">
                {course.feeDisplay}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="pt-3.5 border-t border-[#D4CCE3]/70 flex flex-wrap items-center justify-between gap-2.5">
        {verifiedWhatsapp ? (
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
        ) : null}
        <Link
          href={coursePath}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#51406F] hover:text-[#3F315A] hover:underline underline-offset-4 whitespace-nowrap shrink-0 ms-auto"
        >
          <span>কোর্স সম্পর্কে জানুন</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
