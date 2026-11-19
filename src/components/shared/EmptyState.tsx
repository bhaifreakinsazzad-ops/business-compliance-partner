import Link from "next/link";
import { SearchX } from "lucide-react";

interface EmptyStateProps {
  titleBn: string;
  descriptionBn: string;
  resetHref?: string;
  resetLabelBn?: string;
}

export function EmptyState({
  titleBn,
  descriptionBn,
  resetHref,
  resetLabelBn = "সব দেখুন",
}: EmptyStateProps) {
  return (
    <div className="rounded-[16px] border border-ps-border bg-ps-white p-8 sm:p-12 text-center space-y-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ps-cool text-ps-navy">
        <SearchX className="w-6 h-6" aria-hidden="true" />
      </div>
      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-lg sm:text-xl font-bold text-ps-navy">{titleBn}</h3>
        <p className="text-sm text-ps-ink/80 leading-relaxed">{descriptionBn}</p>
      </div>
      {resetHref ? (
        <div className="pt-1">
          <Link href={resetHref} className="ps-secondary-button">
            {resetLabelBn}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
