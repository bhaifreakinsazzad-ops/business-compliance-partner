import Image from "next/image";
import { resolveCourseThumbnailAsset } from "@/lib/config/media-manifest";

interface CourseArtworkThumbnailProps {
  categorySlug: string;
  offeringSlug?: string;
  categoryNameBn: string;
  badgeText?: string;
  codeLabel?: string;
  variant?: "featured" | "catalog";
}

export function CourseArtworkThumbnail({
  categorySlug,
  offeringSlug,
  categoryNameBn,
}: CourseArtworkThumbnailProps) {
  const asset = resolveCourseThumbnailAsset(categorySlug, offeringSlug);

  return (
    <div className="relative aspect-video w-full overflow-hidden border-b border-[#E1E4F2] bg-[#F4F5FF] select-none">
      <Image
        src={asset.publicPath}
        alt={categoryNameBn || asset.altBn}
        width={asset.width}
        height={asset.height}
        referrerPolicy="no-referrer"
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
    </div>
  );
}
