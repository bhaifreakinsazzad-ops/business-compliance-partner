import { CalendarCheck2 } from "lucide-react";
import { formatIsoDateBn } from "@/lib/content/helpers";

interface VerificationMetaProps {
  lastVerifiedAt: string | null;
  verifiedBy?: string | null;
}

export function VerificationMeta({
  lastVerifiedAt,
  verifiedBy,
}: VerificationMetaProps) {
  const formatted = formatIsoDateBn(lastVerifiedAt);
  if (!formatted && !verifiedBy) return null;

  return (
    <div className="rounded-[12px] border border-ps-border bg-ps-cool px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-ps-ink">
      {formatted ? (
        <span className="inline-flex items-center gap-1.5 font-medium text-ps-navy">
          <CalendarCheck2 className="w-4 h-4 text-ps-success shrink-0" aria-hidden="true" />
          <span>সর্বশেষ পর্যালোচিত: {formatted}</span>
        </span>
      ) : null}
      {verifiedBy ? (
        <span className="text-ps-muted">অবস্থা: {verifiedBy}</span>
      ) : null}
    </div>
  );
}
