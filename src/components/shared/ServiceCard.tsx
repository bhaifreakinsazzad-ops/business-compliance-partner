import Link from "next/link";
import { ArrowRight, Landmark } from "lucide-react";
import type { PublicServiceCard } from "@/types/domain";
import { getAvailabilityLabelBn } from "@/lib/content/helpers";
import { WhatsAppEnquiryButton } from "@/components/shared/WhatsAppEnquiryButton";

interface ServiceCardProps {
  service: PublicServiceCard;
  verifiedWhatsapp?: string | null;
  canonicalBaseUrl?: string | null;
}

export function ServiceCard({
  service,
  verifiedWhatsapp = null,
  canonicalBaseUrl = null,
}: ServiceCardProps) {
  const enquiryHref = `/consultancy?pillar=SERVICES&slug=${encodeURIComponent(
    service.slug,
  )}&topic=${encodeURIComponent(service.titleBn)}`;

  const statusTone =
    service.availabilityStatus === "ACTIVE"
      ? "text-[#00865A]"
      : service.availabilityStatus === "INTEREST_ONLY"
        ? "text-[#9A6300]"
        : "text-[#51406F]";

  return (
    <article className="group rounded-[16px] border border-[#D4CCE3] bg-white p-6 flex flex-col justify-between gap-5 shadow-[0_2px_10px_rgba(81,64,111,0.04)] hover:border-[#51406F]/50 hover:shadow-[0_10px_24px_rgba(81,64,111,0.1)] transition-[border-color,box-shadow] duration-200">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold">
          <span className="text-[#596775]">{service.categoryNameBn}</span>
          <span aria-hidden="true" className="text-[#D4CCE3]">
            ·
          </span>
          <span className={statusTone}>
            {getAvailabilityLabelBn(service.availabilityStatus)}
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-[#081838] leading-snug group-hover:text-[#51406F] transition-colors">
          <Link href={`/services/${service.slug}`} className="hover:underline underline-offset-4">
            {service.titleBn}
          </Link>
        </h3>

        {service.titleEn ? (
          <p className="text-xs font-medium text-[#596775]" lang="en">
            {service.titleEn}
          </p>
        ) : null}

        <p className="text-sm text-[#181D26]/85 leading-relaxed line-clamp-3">
          {service.summaryBn}
        </p>

        {service.authorityName ? (
          <p
            className="inline-flex items-center gap-1.5 text-xs text-[#596775] max-w-full"
            lang="en"
          >
            <Landmark className="w-3.5 h-3.5 text-[#51406F] shrink-0" aria-hidden="true" />
            <span className="truncate">{service.authorityName}</span>
          </p>
        ) : null}
      </div>

      <div className="pt-3.5 border-t border-[#D4CCE3]/70 flex flex-col gap-2.5">
        <WhatsAppEnquiryButton
          verifiedWhatsapp={verifiedWhatsapp}
          serviceName={service.titleBn}
          servicePath={`/services/${service.slug}`}
          canonicalBaseUrl={canonicalBaseUrl}
          fallbackHref={enquiryHref}
          size="md"
          fullWidth
        />
        <Link
          href={`/services/${service.slug}`}
          className="inline-flex items-center justify-center gap-1.5 min-h-10 text-sm font-semibold text-[#51406F] hover:text-[#3F315A] hover:underline underline-offset-4 whitespace-nowrap"
        >
          <span>বিস্তারিত দেখুন</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
