import Image from "next/image";
import Link from "next/link";
import { EMPTY_STATE_MEDIA } from "@/lib/config/media-manifest";

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
    <div className="rounded-[16px] border border-[#E1E4F2] bg-white p-8 sm:p-12 text-center space-y-5">
      <div className="mx-auto w-48 sm:w-56 overflow-hidden rounded-[12px] border border-[#E1E4F2] bg-[#FBFAFF] shadow-xs">
        <Image
          src={EMPTY_STATE_MEDIA.publicPath}
          alt={EMPTY_STATE_MEDIA.altBn}
          width={EMPTY_STATE_MEDIA.width}
          height={EMPTY_STATE_MEDIA.height}
          referrerPolicy="no-referrer"
          className="w-full h-auto object-cover"
        />
      </div>
      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-lg sm:text-xl font-bold text-[#081838]">{titleBn}</h3>
        <p className="text-sm text-[#596775] leading-relaxed">{descriptionBn}</p>
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
