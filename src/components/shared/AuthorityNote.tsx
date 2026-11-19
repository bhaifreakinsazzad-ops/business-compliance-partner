import { ExternalLink, ShieldAlert } from "lucide-react";
import { INDEPENDENT_DISCLAIMER_BN } from "@/lib/config/site";

interface AuthorityNoteProps {
  authorityName?: string | null;
  officialSourceLabel?: string | null;
  officialSourceUrl?: string | null;
  limitationsBn?: string | null;
}

export function AuthorityNote({
  authorityName,
  officialSourceLabel,
  officialSourceUrl,
  limitationsBn,
}: AuthorityNoteProps) {
  return (
    <aside
      aria-label="কর্তৃপক্ষ ও স্বাধীন সহায়তা নির্দেশিকা"
      className="rounded-[16px] border border-ps-gold/50 bg-ps-ivory p-5 sm:p-6 space-y-3"
    >
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-ps-navy shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1.5">
          <h3 className="text-sm sm:text-base font-bold text-ps-navy">
            স্বাধীন প্ল্যাটফর্ম ও সরকারি কর্তৃপক্ষ সংক্রান্ত তথ্য
          </h3>
          <p className="text-xs sm:text-sm text-ps-ink/90 leading-relaxed">
            {limitationsBn || INDEPENDENT_DISCLAIMER_BN}
          </p>
        </div>
      </div>

      {authorityName ? (
        <div className="pt-3 border-t border-ps-border flex flex-wrap items-center justify-between gap-2 text-xs text-ps-ink">
          <div>
            <span className="font-semibold text-ps-navy">সংশ্লিষ্ট কর্তৃপক্ষ: </span>
            <span lang="en">{authorityName}</span>
          </div>
          {officialSourceUrl ? (
            <a
              href={officialSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-ps-navy hover:underline underline-offset-4"
              lang="en"
            >
              <span>{officialSourceLabel || "Official Source"}</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          ) : officialSourceLabel ? (
            <span className="text-ps-muted" lang="en">
              {officialSourceLabel}
            </span>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
