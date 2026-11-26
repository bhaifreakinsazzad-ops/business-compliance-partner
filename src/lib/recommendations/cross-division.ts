import type {
  PublicBookPreview,
  PublicCourseCard,
  PublicLicensingCard,
  PublicServiceCard,
} from "@/types/domain";

export interface CrossDivisionContext {
  titleBn: string;
  titleEn?: string | null;
  categorySlug: string;
  categoryNameBn?: string;
  summaryBn?: string;
  topics?: string[];
  relatedCourseCategorySlug?: string | null;
  relatedServiceCategorySlug?: string | null;
  relatedLicensingCategorySlug?: string | null;
}

const DOMAIN_CLUSTERS: Record<string, string[]> = {
  tax: ["tax", "income-tax", "income-tax-solutions", "tds", "return", "nbr"],
  vat: ["vat", "vat-mushak", "vat-and-mushak", "vat-mushak-solutions", "mushak", "bin"],
  egp: ["egp", "egp-tender", "egp-and-tender", "egp-government-tender", "tender", "bppa"],
  rjsc: [
    "rjsc",
    "rjsc-corporate",
    "company-secretarial",
    "company-secretarial-compliance",
    "company",
    "incorporation",
  ],
  accounting: [
    "accounting",
    "accounting-financial-management",
    "audit",
    "bookkeeping",
  ],
  ecommerce: [
    "ecommerce",
    "digital-business-ecommerce",
    "digital-business-setup",
    "dbid",
    "online",
  ],
  customs: [
    "customs",
    "import-export-customs",
    "customs-international-trade",
    "import-export-licences",
    "irc",
    "erc",
  ],
  labour: [
    "labour-law",
    "hr-and-labour",
    "hr-labour-compliance",
    "factory-labour-registration",
    "dife",
    "hr",
  ],
  licensing: [
    "business-management",
    "entrepreneurship-sme",
    "business-startup-advisory",
    "general-business-registration",
    "trade",
    "fire",
  ],
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/[\s-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

function getClusterKeysForText(slugOrText: string): Set<string> {
  const tokens = tokenize(slugOrText);
  const matched = new Set<string>();
  for (const [cluster, terms] of Object.entries(DOMAIN_CLUSTERS)) {
    for (const term of terms) {
      if (
        slugOrText.toLowerCase().includes(term) ||
        tokens.some((tok) => tok === term || term.includes(tok))
      ) {
        matched.add(cluster);
        break;
      }
    }
  }
  return matched;
}

export function scoreCrossDivisionMatch(
  context: CrossDivisionContext,
  candidate: {
    categorySlug: string;
    titleBn: string;
    titleEn?: string | null;
    summaryBn?: string;
    topics?: string[];
    featured?: boolean;
    relatedCourseCategorySlug?: string | null;
    relatedServiceCategorySlug?: string | null;
    relatedLicensingCategorySlug?: string | null;
  },
): number {
  let score = 0;

  if (
    context.relatedCourseCategorySlug &&
    candidate.categorySlug === context.relatedCourseCategorySlug
  ) {
    score += 70;
  }
  if (
    context.relatedServiceCategorySlug &&
    candidate.categorySlug === context.relatedServiceCategorySlug
  ) {
    score += 70;
  }
  if (
    context.relatedLicensingCategorySlug &&
    candidate.categorySlug === context.relatedLicensingCategorySlug
  ) {
    score += 70;
  }

  if (
    candidate.relatedCourseCategorySlug === context.categorySlug ||
    candidate.relatedServiceCategorySlug === context.categorySlug ||
    candidate.relatedLicensingCategorySlug === context.categorySlug
  ) {
    score += 65;
  }

  if (candidate.categorySlug === context.categorySlug) {
    score += 55;
  }

  const contextClusters = getClusterKeysForText(
    [
      context.categorySlug,
      context.relatedCourseCategorySlug ?? "",
      context.relatedServiceCategorySlug ?? "",
      context.relatedLicensingCategorySlug ?? "",
      context.titleEn ?? "",
    ].join(" "),
  );
  const candidateClusters = getClusterKeysForText(
    [
      candidate.categorySlug,
      candidate.relatedCourseCategorySlug ?? "",
      candidate.relatedServiceCategorySlug ?? "",
      candidate.titleEn ?? "",
    ].join(" "),
  );

  for (const cluster of candidateClusters) {
    if (contextClusters.has(cluster)) {
      score += 35;
    }
  }

  const contextTokens = new Set(
    tokenize(
      [
        context.titleBn,
        context.titleEn ?? "",
        context.categoryNameBn ?? "",
        context.summaryBn ?? "",
        ...(context.topics ?? []),
      ].join(" "),
    ),
  );

  const candidateTokens = tokenize(
    [
      candidate.titleBn,
      candidate.titleEn ?? "",
      candidate.summaryBn ?? "",
      ...(candidate.topics ?? []),
    ].join(" "),
  );

  let tokenHits = 0;
  const seenHits = new Set<string>();
  for (const token of candidateTokens) {
    if (contextTokens.has(token) && !seenHits.has(token)) {
      seenHits.add(token);
      tokenHits += 1;
    }
  }
  score += Math.min(32, tokenHits * 8);

  if (candidate.featured) {
    score += 5;
  }

  return score;
}

export function rankRelatedBooks(
  books: PublicBookPreview[],
  context: CrossDivisionContext,
  excludeSlug?: string,
  limit = 3,
): PublicBookPreview[] {
  return books
    .filter((b) => b.slug !== excludeSlug)
    .map((book) => ({
      item: book,
      score: scoreCrossDivisionMatch(context, {
        categorySlug: book.categorySlug,
        titleBn: book.titleBn,
        titleEn: book.titleEn,
        summaryBn: book.summaryBn,
        topics: book.topicsBn,
        featured: book.featured,
        relatedCourseCategorySlug: book.relatedCourseCategorySlug,
        relatedServiceCategorySlug: book.relatedServiceCategorySlug,
        relatedLicensingCategorySlug: book.relatedLicensingCategorySlug,
      }),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}

export function rankRelatedCourses(
  courses: PublicCourseCard[],
  context: CrossDivisionContext,
  excludeSlug?: string,
  limit = 2,
): PublicCourseCard[] {
  return courses
    .filter((c) => c.slug !== excludeSlug)
    .map((course) => ({
      item: course,
      score: scoreCrossDivisionMatch(context, {
        categorySlug: course.categorySlug,
        titleBn: course.titleBn,
        titleEn: course.titleEn,
        summaryBn: course.summaryBn,
        featured: course.featured,
      }),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}

export function rankRelatedServices(
  services: PublicServiceCard[],
  context: CrossDivisionContext,
  excludeSlug?: string,
  limit = 2,
): PublicServiceCard[] {
  return services
    .filter((s) => s.slug !== excludeSlug)
    .map((svc) => ({
      item: svc,
      score: scoreCrossDivisionMatch(context, {
        categorySlug: svc.categorySlug,
        titleBn: svc.titleBn,
        titleEn: svc.titleEn,
        summaryBn: svc.summaryBn,
        featured: svc.featured,
      }),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}

export function rankRelatedLicensing(
  entries: PublicLicensingCard[],
  context: CrossDivisionContext,
  excludeSlug?: string,
  limit = 2,
): PublicLicensingCard[] {
  return entries
    .filter((l) => l.slug !== excludeSlug)
    .map((entry) => ({
      item: entry,
      score: scoreCrossDivisionMatch(context, {
        categorySlug: entry.categorySlug,
        titleBn: entry.titleBn,
        titleEn: entry.titleEn,
        summaryBn: entry.summaryBn,
        featured: entry.featured,
      }),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}
