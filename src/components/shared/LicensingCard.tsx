import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import type { PublicLicensingCard } from "@/types/domain";
import { getAvailabilityLabelBn } from "@/lib/content/helpers";
import { WhatsAppEnquiryButton } from "@/components/shared/WhatsAppEnquiryButton";

interface LicensingCardProps {
  entry: PublicLicensingCard;
  verifiedWhatsapp?: string | null;
  canonicalBaseUrl?: string | null;
}

export function LicensingCard({
  entry,
  verifiedWhatsapp = null,
  canonicalBaseUrl = null,
}: LicensingCardProps) {
  const enquiryHref = `/consultancy?pillar=LICENSING&slug=${encodeURIComponent(
    entry.slug,
  )}&topic=${encodeURIComponent(entry.titleBn)}`;

  const statusTone =
    entry.availabilityStatus === "ACTIVE"
      ? "text-ps-success"
      : entry.availabilityStatus === "INTEREST_ONLY"
        ? "text-ps-warning"
        : "text-ps-navy";

  return (
    <article className="group rounded-[16px] border border-ps-border bg-ps-white p-6 flex flex-col justify-between gap-5 shadow-[0_2px_10px_rgba(11,23,38,0.03)] hover:border-ps-navy/35 hover:shadow-md transition-[border-color,box-shadow] duration-200">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold">
          <span className="text-ps-muted">{entry.categoryNameBn}</span>
          <span aria-hidden="true" className="text-ps-border">
            ·
          </span>
          <span className={statusTone}>
            {getAvailabilityLabelBn(entry.availabilityStatus)}
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-ps-navy leading-snug">
          <Link href={`/licensing/${entry.slug}`} className="hover:underline underline-offset-4">
            {entry.titleBn}
          </Link>
        </h3>

        <p className="text-xs font-semibold text-ps-navy/80 inline-flex items-center gap-1.5" lang="en">
          <Building2 className="w-3.5 h-3.5 text-ps-navy shrink-0" aria-hidden="true" />
          <span>{entry.authorityName}</span>
        </p>

        <p className="text-sm text-ps-ink/85 leading-relaxed line-clamp-3">
          {entry.summaryBn}
        </p>
      </div>

      <div className="pt-3.5 border-t border-ps-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <WhatsAppEnquiryButton
          verifiedWhatsapp={verifiedWhatsapp}
          serviceName={entry.titleBn}
          servicePath={`/licensing/${entry.slug}`}
          canonicalBaseUrl={canonicalBaseUrl}
          fallbackHref={enquiryHref}
          fallbackLabelBn="সহায়তা চাই"
          size="md"
          className="w-full sm:flex-1"
        />
        <Link
          href={`/licensing/${entry.slug}`}
          className="inline-flex items-center justify-center sm:justify-end gap-1.5 min-h-10 px-2 text-sm font-semibold text-ps-navy hover:text-ps-midnight hover:underline underline-offset-4 whitespace-nowrap shrink-0"
        >
          <span>বিস্তারিত দেখুন</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
