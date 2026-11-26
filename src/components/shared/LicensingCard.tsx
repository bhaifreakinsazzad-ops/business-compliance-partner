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
      ? "text-[#00865A]"
      : entry.availabilityStatus === "INTEREST_ONLY"
        ? "text-[#9A6300]"
        : "text-[#51406F]";

  return (
    <article className="bcp-surface-card group p-6 flex flex-col justify-between gap-5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold">
          <span className="text-text-muted">{entry.categoryNameBn}</span>
          <span aria-hidden="true" className="text-border-subtle">
            ·
          </span>
          <span className={statusTone}>
            {getAvailabilityLabelBn(entry.availabilityStatus)}
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-text-primary leading-snug group-hover:text-text-accent transition-colors">
          <Link href={`/licensing/${entry.slug}`} className="hover:underline underline-offset-4">
            {entry.titleBn}
          </Link>
        </h3>

        <p className="text-xs font-semibold text-[#596775] inline-flex items-center gap-1.5" lang="en">
          <Building2 className="w-3.5 h-3.5 text-[#51406F] shrink-0" aria-hidden="true" />
          <span>{entry.authorityName}</span>
        </p>

        <p className="text-sm text-[#181D26]/85 leading-relaxed line-clamp-3">
          {entry.summaryBn}
        </p>
      </div>

      <div className="pt-3.5 border-t border-[#D4CCE3]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
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
          className="inline-flex items-center justify-center sm:justify-end gap-1.5 min-h-10 px-2 text-sm font-semibold text-[#51406F] hover:text-[#3F315A] hover:underline underline-offset-4 whitespace-nowrap shrink-0"
        >
          <span>বিস্তারিত দেখুন</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
