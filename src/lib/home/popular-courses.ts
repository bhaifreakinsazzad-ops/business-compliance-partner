import type {
  PublicBookPreview,
  PublicCategoryDTO,
  PublicCourseCard,
  PublicBookCategoryDTO,
} from "@/types/domain";

export interface CourseTabSpec {
  slug: string;
  labelBn: string;
  labelEn: string;
  count: number;
}

export interface CourseVisualTheme {
  accentHex: string;
  surfaceBgClass: string;
  badgeText: string;
  codeLabel: string;
}

export const ALL_TAB_SLUG = "all";

const COURSE_CATEGORY_THEMES: Record<string, CourseVisualTheme> = {
  "income-tax": {
    accentHex: "#243FBA",
    surfaceBgClass: "from-[#E2E3FF] via-[#CFD1FF] to-[#B8BBFF]",
    badgeText: "NBR Income Tax",
    codeLabel: "TAX-101",
  },
  "vat-and-mushak": {
    accentHex: "#202D72",
    surfaceBgClass: "from-[#E2E3FF] via-[#D8DAFF] to-[#B3B6FF]",
    badgeText: "VAT & Mushak 9.1",
    codeLabel: "VAT-201",
  },
  "egp-and-tender": {
    accentHex: "#081838",
    surfaceBgClass: "from-[#081838] via-[#13295B] to-[#243FBA]",
    badgeText: "BPPA e-GP",
    codeLabel: "EGP-301",
  },
  "digital-business-ecommerce": {
    accentHex: "#243FBA",
    surfaceBgClass: "from-[#FBFAFF] via-[#E2E3FF] to-[#CCCEFF]",
    badgeText: "E-Commerce & DBID",
    codeLabel: "ECM-401",
  },
  "company-secretarial": {
    accentHex: "#202D72",
    surfaceBgClass: "from-[#0E224A] via-[#202D72] to-[#243FBA]",
    badgeText: "Smart RJSC",
    codeLabel: "CORP-501",
  },
  "import-export-customs": {
    accentHex: "#081838",
    surfaceBgClass: "from-[#E2E3FF] via-[#CCCEFF] to-[#B8BBFF]",
    badgeText: "Customs & IRC/ERC",
    codeLabel: "IMP-601",
  },
  accounting: {
    accentHex: "#243FBA",
    surfaceBgClass: "from-[#F5F6FA] via-[#E2E3FF] to-[#CFD1FF]",
    badgeText: "SME Accounting",
    codeLabel: "ACC-701",
  },
};

const DEFAULT_COURSE_THEME: CourseVisualTheme = {
  accentHex: "#243FBA",
  surfaceBgClass: "from-[#E2E3FF] via-[#CFD1FF] to-[#B8BBFF]",
  badgeText: "BCP Practical Track",
  codeLabel: "BCP-TRK",
};

export function getCourseVisualTheme(categorySlug: string): CourseVisualTheme {
  return COURSE_CATEGORY_THEMES[categorySlug] ?? DEFAULT_COURSE_THEME;
}

export function isDarkCourseVisualHeader(categorySlug: string): boolean {
  return (
    categorySlug === "egp-and-tender" || categorySlug === "company-secretarial"
  );
}

/**
 * Builds homepage course filter tabs starting with "সব" followed by
 * categories that have at least 1 published course, sorted by priority order.
 */
export function buildPopularCourseTabs(
  courses: PublicCourseCard[],
  categories: PublicCategoryDTO[],
  maxCategoryTabs = 5,
): CourseTabSpec[] {
  const countsBySlug = new Map<string, number>();
  for (const course of courses) {
    countsBySlug.set(
      course.categorySlug,
      (countsBySlug.get(course.categorySlug) ?? 0) + 1,
    );
  }

  const tabs: CourseTabSpec[] = [
    {
      slug: ALL_TAB_SLUG,
      labelBn: "সব",
      labelEn: "All",
      count: courses.length,
    },
  ];

  const categoryTabs = categories
    .filter((cat) => (countsBySlug.get(cat.slug) ?? 0) > 0)
    .slice(0, maxCategoryTabs)
    .map((cat) => ({
      slug: cat.slug,
      labelBn: cat.nameBn,
      labelEn: cat.nameEn,
      count: countsBySlug.get(cat.slug) ?? 0,
    }));

  return [...tabs, ...categoryTabs];
}

export function filterPopularCourses(
  courses: PublicCourseCard[],
  activeTabSlug: string,
  limit = 8,
): PublicCourseCard[] {
  const filtered =
    !activeTabSlug || activeTabSlug === ALL_TAB_SLUG
      ? courses
      : courses.filter((c) => c.categorySlug === activeTabSlug);
  return filtered.slice(0, limit);
}

export interface BookTabSpec {
  slug: string;
  labelBn: string;
  count: number;
}

export function buildPopularBookTabs(
  books: PublicBookPreview[],
  categories: PublicBookCategoryDTO[],
  maxCategoryTabs = 5,
): BookTabSpec[] {
  const counts = new Map<string, number>();
  for (const book of books) {
    counts.set(book.categorySlug, (counts.get(book.categorySlug) ?? 0) + 1);
  }

  const tabs: BookTabSpec[] = [
    {
      slug: ALL_TAB_SLUG,
      labelBn: "সব বই",
      count: books.length,
    },
  ];

  const catTabs = categories
    .filter((cat) => (counts.get(cat.slug) ?? 0) > 0)
    .slice(0, maxCategoryTabs)
    .map((cat) => ({
      slug: cat.slug,
      labelBn: cat.nameBn,
      count: counts.get(cat.slug) ?? 0,
    }));

  return [...tabs, ...catTabs];
}

export function filterBooksByTab(
  books: PublicBookPreview[],
  activeTabSlug: string,
  limit = 8,
): PublicBookPreview[] {
  const filtered =
    !activeTabSlug || activeTabSlug === ALL_TAB_SLUG
      ? books
      : books.filter((b) => b.categorySlug === activeTabSlug);
  return filtered.slice(0, limit);
}

export function formatBdtPaisaExact(pricePaisa: number): string {
  const wholeTaka = Math.round(pricePaisa / 100);
  return `৳${wholeTaka.toLocaleString("en-US")}`;
}
