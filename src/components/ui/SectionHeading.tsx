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
        "space-y-2",
        align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-2xl",
        className,
      )}
    >
      {eyebrowEn ? (
        <p
          className={cn(
            "font-en text-xs uppercase tracking-[0.16em] font-semibold inline-flex items-center gap-2",
            dark ? "text-[#DFB15B]" : "text-[#243FBA]",
          )}
          lang="en"
        >
          <span
            aria-hidden="true"
            className={cn(
              "inline-block w-4 h-0.5 rounded-full",
              dark ? "bg-[#DFB15B]" : "bg-[#C59028]",
            )}
          />
          <span>{eyebrowEn}</span>
        </p>
      ) : null}
      <h2
        className={cn(
          "text-2xl sm:text-3xl font-bold leading-snug",
          dark ? "text-white" : "text-[#081838]",
        )}
      >
        {titleBn}
      </h2>
      {descriptionBn ? (
        <p
          className={cn(
            "text-sm sm:text-base leading-relaxed",
            dark ? "text-white/80" : "text-[#596775]",
          )}
        >
          {descriptionBn}
        </p>
      ) : null}
    </div>
  );
}
