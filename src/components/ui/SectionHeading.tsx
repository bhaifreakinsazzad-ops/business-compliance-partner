import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrowEn?: string;
  titleBn: string;
  descriptionBn?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}

export function SectionHeading({
  eyebrowEn,
  titleBn,
  descriptionBn,
  align = "left",
  dark = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "space-y-2.5",
        align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-2xl",
        className,
      )}
    >
      {eyebrowEn ? (
        <p
          className={cn(
            "font-editorial text-xs sm:text-sm uppercase tracking-[0.16em] font-medium",
            dark ? "text-ps-gold" : "text-ps-muted",
          )}
          lang="en"
        >
          {eyebrowEn}
        </p>
      ) : null}
      <h2
        className={cn(
          "text-2xl sm:text-3xl font-bold leading-snug",
          dark ? "text-ps-white" : "text-ps-navy",
        )}
      >
        {titleBn}
      </h2>
      {descriptionBn ? (
        <p
          className={cn(
            "text-sm sm:text-base leading-relaxed",
            dark ? "text-white/80" : "text-ps-ink/85",
          )}
        >
          {descriptionBn}
        </p>
      ) : null}
    </div>
  );
}
