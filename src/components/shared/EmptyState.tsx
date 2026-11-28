import Image from "next/image";
import Link from "next/link";
import {
  resolveEmptyStateAsset,
  type EmptyStateVariant,
} from "@/lib/config/media-manifest";

export type EmptyStateScenario = "no-results" | "unpublished" | "unavailable";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  stateType?: EmptyStateScenario;
  titleBn: string;
  descriptionBn: string;
  resetHref?: string;
  resetLabelBn?: string;
  secondaryHref?: string;
  secondaryLabelBn?: string;
}

const DEFAULT_CONSULTANCY_BY_VARIANT: Record<EmptyStateVariant, { href: string; labelBn: string }> = {
  courses: {
    href: "/consultancy?pillar=COURSES",
    labelBn: "কোর্স আগ্রহ জানান",
  },
  services: {
    href: "/consultancy?pillar=SERVICES",
    labelBn: "সরাসরি পরামর্শ অনুরোধ",
  },
  books: {
    href: `/consultancy?pillar=CONSULTANCY&topic=${encodeURIComponent("বই প্রকাশনা আগ্রহ")}`,
    labelBn: "প্রকাশনা আগ্রহ জানান",
  },
  generic: {
    href: "/consultancy",
    labelBn: "পরামর্শের অনুরোধ পাঠান",
  },
};

const SCENARIO_LABEL_BN: Record<EmptyStateScenario, string> = {
  "no-results": "অনুসন্ধান ও ফিল্টার",
  unpublished: "আসন্ন বা নির্ধারিত প্রকাশনা",
  unavailable: "সাময়িক সংযোগ তথ্য",
};

export function EmptyState({
  variant = "generic",
  stateType = "no-results",
  titleBn,
  descriptionBn,
  resetHref,
  resetLabelBn = "সব দেখুন",
  secondaryHref,
  secondaryLabelBn,
}: EmptyStateProps) {
  const asset = resolveEmptyStateAsset(variant);
  const fallbackAction = DEFAULT_CONSULTANCY_BY_VARIANT[variant];
  const resolvedSecondaryHref = secondaryHref ?? fallbackAction.href;
  const resolvedSecondaryLabel = secondaryLabelBn ?? fallbackAction.labelBn;

  return (
    <div
      data-empty-state-variant={variant}
      data-empty-state-type={stateType}
      className="rounded-[18px] border border-[#B8BBFF]/80 bg-white p-7 sm:p-11 text-center space-y-5 shadow-[0_14px_34px_rgba(36,63,186,0.06)]"
    >
      <div className="mx-auto w-60 sm:w-72 overflow-hidden rounded-[14px] border border-[#E1E4F2] bg-[#FBFAFF] shadow-xs">
        <Image
          src={asset.publicPath}
          alt={asset.altBn}
          width={asset.width}
          height={asset.height}
          referrerPolicy="no-referrer"
          className="w-full h-auto object-cover"
        />
      </div>

      <div className="space-y-2 max-w-lg mx-auto">
        <p className="font-en text-[11px] font-bold uppercase tracking-[0.14em] text-[#243FBA]">
          {SCENARIO_LABEL_BN[stateType]}
        </p>
        <h3 className="text-lg sm:text-xl font-extrabold text-[#081838]">
          {titleBn}
        </h3>
        <p className="text-sm text-[#596775] leading-relaxed">
          {descriptionBn}
        </p>
      </div>

      <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
        {resetHref && stateType !== "unavailable" ? (
          <Link href={resetHref} className="ps-secondary-button">
            {resetLabelBn}
          </Link>
        ) : null}
        {stateType === "unavailable" && resetHref ? (
          <Link href={resetHref} className="ps-primary-button">
            পুনরায় লোড করুন
          </Link>
        ) : null}
        <Link
          href={resolvedSecondaryHref}
          className={
            resetHref && stateType === "no-results"
              ? "ps-primary-button"
              : "ps-secondary-button"
          }
        >
          {resolvedSecondaryLabel}
        </Link>
      </div>
    </div>
  );
}
