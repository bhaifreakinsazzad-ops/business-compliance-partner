import Link from "next/link";
import { ArrowRight, Landmark } from "lucide-react";
import type { PublicServiceCard } from "@/types/domain";
import { Badge, StatusBadge } from "@/components/ui/Badge";

export function ServiceCard({ service }: { service: PublicServiceCard }) {
  return (
    <article className="group rounded-[16px] border border-ps-border bg-ps-white p-6 flex flex-col justify-between gap-5 shadow-[0_2px_10px_rgba(11,23,38,0.03)] hover:border-ps-navy/30 hover:shadow-md transition-all duration-200">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="cool">{service.categoryNameBn}</Badge>
          <StatusBadge status={service.availabilityStatus} />
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
      </div>

      <div className="pt-3 border-t border-ps-border/70 flex flex-wrap items-center justify-between gap-3">
        {service.authorityName ? (
          <span
            className="inline-flex items-center gap-1.5 text-xs text-ps-muted truncate max-w-[60%]"
            lang="en"
          >
            <Landmark className="w-3.5 h-3.5 text-ps-navy shrink-0" aria-hidden="true" />
            <span className="truncate">{service.authorityName}</span>
          </span>
        ) : (
          <span className="text-xs text-ps-muted">পেশাদার সহায়তা</span>
        )}
        <Link
          href={`/services/${service.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ps-navy hover:text-ps-midnight hover:underline underline-offset-4 shrink-0"
        >
          <span>বিস্তারিত দেখুন</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
