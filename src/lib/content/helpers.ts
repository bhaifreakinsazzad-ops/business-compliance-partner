import type { AvailabilityStatusValue, ContentStatusValue } from "@/types/domain";

/**
 * Normalizes Bengali Unicode (NFC) and English case/punctuation for search.
 */
export function normalizeSearchText(input: string): string {
  return input
    .normalize("NFC")
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesSearchQuery(
  query: string,
  candidates: ReadonlyArray<string | null | undefined>,
): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const haystack = normalizeSearchText(
    candidates.filter((c): c is string => Boolean(c)).join(" "),
  );
  return haystack.includes(normalizedQuery);
}

export function slugifyTitle(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isPubliclyVisible(
  contentStatus: ContentStatusValue,
  availabilityStatus: AvailabilityStatusValue,
): boolean {
  return (
    contentStatus === "PUBLISHED" && availabilityStatus !== "INACTIVE"
  );
}

export function getAvailabilityLabelBn(status: AvailabilityStatusValue): string {
  switch (status) {
    case "ACTIVE":
      return "চালু রয়েছে";
    case "UPCOMING":
      return "আসন্ন / আগ্রহ নিবন্ধন";
    case "INTEREST_ONLY":
      return "আগ্রহ নিবন্ধন ও পরামর্শ";
    case "INACTIVE":
      return "বর্তমানে বন্ধ";
  }
}

export function getContentStatusLabelBn(status: ContentStatusValue): string {
  switch (status) {
    case "DRAFT":
      return "খসড়া (Draft)";
    case "PENDING_REVIEW":
      return "পর্যালোচনাধীন";
    case "APPROVED":
      return "অনুমোদিত";
    case "PUBLISHED":
      return "প্রকাশিত";
  }
}

export function formatIsoDateBn(isoDate: string | Date | null | undefined): string | null {
  if (!isoDate) return null;
  const date = typeof isoDate === "string" ? new Date(isoDate) : isoDate;
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
