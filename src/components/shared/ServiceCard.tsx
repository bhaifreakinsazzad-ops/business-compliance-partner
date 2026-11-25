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
      ? "text-ps-success"
      : service.availabilityStatus === "INTEREST_ONLY"
        ? "text-ps-warning"
        : "text-ps-navy";

  return (
    <article className="group rounded-[16px] border border-ps-border bg-ps-white p-6 flex flex-col justify-between gap-5 shadow-[0_2px_10px_rgba(11,23,38,0.03)] hover:border-ps-navy/35 hover:shadow-md transition-[border-color,box-shadow] duration-200">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold">
          <span className="text-ps-muted">{service.categoryNameBn}</span>
          <span aria-hidden="true" className="text-ps-border">
            ·
          </span>
          <span className={statusTone}>
            {getAvailabilityLabelBn(service.availabilityStatus)}
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-ps-navy leading-snug">
          <Link href={`/services/${service.slug}`} className="hover:underline underline-offset-4">
            {service.titleBn}
          </Link>
        </h3>

        {service.titleEn ? (
          <p className="text-xs font-medium text-ps-muted" lang="en">
            {service.titleEn}
          </p>
        ) : null}

        <p className="text-sm text-ps-ink/85 leading-relaxed line-clamp-3">
          {service.summaryBn}
        </p>

        {service.authorityName ? (
          <p
            className="inline-flex items-center gap-1.5 text-xs text-ps-muted max-w-full"
            lang="en"
          >
            <Landmark className="w-3.5 h-3.5 text-ps-navy shrink-0" aria-hidden="true" />
            <span className="truncate">{service.authorityName}</span>
          </p>
        ) : null}
      </div>

      <div className="pt-3.5 border-t border-ps-border/70 flex flex-col gap-2.5">
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
          className="inline-flex items-center justify-center gap-1.5 min-h-10 text-sm font-semibold text-ps-navy hover:text-ps-midnight hover:underline underline-offset-4 whitespace-nowrap"
        >
          <span>বিস্তারিত দেখুন</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
