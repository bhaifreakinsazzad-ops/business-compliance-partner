import { ChevronDown } from "lucide-react";
import type { PublicFaqItem } from "@/types/domain";
import { formatIsoDateBn } from "@/lib/content/helpers";

interface FAQAccordionProps {
  items: PublicFaqItem[];
  headingId?: string;
}

export function FAQAccordion({ items, headingId }: FAQAccordionProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3" aria-labelledby={headingId}>
      {items.map((faq) => {
        const verifiedDate = formatIsoDateBn(faq.lastVerifiedAt);
        return (
          <details
            key={faq.id}
            className="ps-disclosure group rounded-[16px] border border-ps-border bg-ps-white shadow-[0_1px_6px_rgba(11,23,38,0.03)] open:border-ps-navy/30"
          >
            <summary className="flex items-start justify-between gap-4 p-5 sm:p-6 text-base sm:text-lg font-semibold text-ps-navy select-none hover:bg-ps-cool/50 rounded-[16px] transition-colors">
              <span className="flex-1 leading-snug">{faq.questionBn}</span>
              <ChevronDown
                className="w-5 h-5 text-ps-navy shrink-0 mt-0.5 transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>

            <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 space-y-3 text-sm sm:text-base text-ps-ink/90 leading-relaxed border-t border-ps-border/60">
              <p>{faq.answerBn}</p>
              {faq.isRegulatory ? (
                <div className="flex flex-wrap items-center gap-2 text-xs text-ps-muted">
                  <span className="inline-flex items-center rounded-full bg-ps-cool border border-ps-border px-2.5 py-0.5 font-medium text-ps-navy">
                    রেগুলেটরি তথ্য ও নীতিমালা
                  </span>
                  {verifiedDate ? (
                    <span>সর্বশেষ পর্যালোচনা: {verifiedDate}</span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </details>
        );
      })}
    </div>
  );
}
