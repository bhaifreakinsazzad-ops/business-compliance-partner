import type {
  AvailabilityStatusValue,
  CourseModuleDTO,
  Pillar,
  ProcessStepDTO,
  PublicCategoryDTO,
  PublicCourseCard,
  PublicCourseDetail,
  PublicFaqItem,
  PublicLicensingCard,
  PublicLicensingDetail,
  PublicServiceCard,
  PublicServiceDetail,
} from "@/types/domain";
import { isPubliclyVisible, matchesSearchQuery } from "@/lib/content/helpers";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { SEED_CATEGORIES } from "../../../prisma/seed-data/categories";
import { SEED_COURSES } from "../../../prisma/seed-data/courses";
import { SEED_FAQS } from "../../../prisma/seed-data/faqs";
import { SEED_LICENSING } from "../../../prisma/seed-data/licensing";
import { SEED_SERVICES } from "../../../prisma/seed-data/services";

export const PRIORITY_COURSE_CATEGORY_SLUGS: readonly string[] = [
  "income-tax",
  "vat-and-mushak",
  "egp-and-tender",
  "digital-business-ecommerce",
  "company-secretarial",
];

/**
 * Orders course categories so the 5 client-prioritized tracks appear first
 * (Tax, VAT, e-GP, E-commerce, RJSC/Company Secretarial), preserving canonical
 * sortOrder for the remaining categories.
 */
export function sortCourseCategoriesByClientPriority(
  categories: PublicCategoryDTO[],
): PublicCategoryDTO[] {
  const priorityMap = new Map(
    PRIORITY_COURSE_CATEGORY_SLUGS.map((slug, idx) => [slug, idx]),
  );
  return [...categories].sort((a, b) => {
    const pA = priorityMap.get(a.slug);
    const pB = priorityMap.get(b.slug);
    if (pA !== undefined && pB !== undefined) return pA - pB;
    if (pA !== undefined) return -1;
    if (pB !== undefined) return 1;
    return a.sortOrder - b.sortOrder;
  });
}

function canUseSeedFallback(): boolean {
  // Always permit seed fallback when database is not configured or in transition,
  // guaranteeing high availability and zero blank pages for general usage and advertising.
  return !isDatabaseConfigured() || process.env.NEXT_PUBLIC_APP_ENV !== "production";
}

function getSeedCategoriesByPillar(pillar: Pillar): PublicCategoryDTO[] {
  return SEED_CATEGORIES.filter((c) => c.pillar === pillar)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({
      id: `seed-${c.pillar}-${c.slug}`,
      pillar: c.pillar,
      slug: c.slug,
      nameBn: c.nameBn,
      nameEn: c.nameEn,
      shortDescBn: c.shortDescBn,
      shortDescEn: c.shortDescEn,
      iconName: c.iconName,
      sortOrder: c.sortOrder,
    }));
}

function getSeedCategoryLookup(pillar: Pillar) {
  return new Map(
    SEED_CATEGORIES.filter((c) => c.pillar === pillar).map((c) => [c.slug, c]),
  );
}

export async function listPublishedCourses(filter?: {
  categorySlug?: string;
  q?: string;
  availability?: AvailabilityStatusValue;
}): Promise<{ categories: PublicCategoryDTO[]; items: PublicCourseCard[] }> {
  if (isDatabaseConfigured()) {
    try {
      const [categories, courses, categoryCounts] = await Promise.all([
        prisma.category.findMany({
          where: { pillar: "COURSES", isActive: true },
          orderBy: { sortOrder: "asc" },
        }),
        prisma.course.findMany({
          where: {
            contentStatus: "PUBLISHED",
            availabilityStatus: filter?.availability
              ? filter.availability
              : { not: "INACTIVE" },
            ...(filter?.categorySlug
              ? { category: { slug: filter.categorySlug } }
              : {}),
          },
          include: { category: true },
          orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
        }),
        prisma.course.groupBy({
          by: ["categoryId"],
          where: {
            contentStatus: "PUBLISHED",
            availabilityStatus: { not: "INACTIVE" },
          },
          _count: { _all: true },
        }),
      ]);

      const countByCatId = new Map(
        categoryCounts.map((row) => [row.categoryId, row._count._all]),
      );

      const mapped: PublicCourseCard[] = courses
        .filter((c) =>
          filter?.q
            ? matchesSearchQuery(filter.q, [
                c.titleBn,
                c.titleEn,
                c.summaryBn,
                c.category.nameBn,
                c.category.nameEn,
                ...c.aliases,
              ])
            : true,
        )
        .map((c) => ({
          id: c.id,
          slug: c.slug,
          titleBn: c.titleBn,
          titleEn: c.titleEn,
          summaryBn: c.summaryBn,
          categorySlug: c.category.slug,
          categoryNameBn: c.category.nameBn,
          categoryNameEn: c.category.nameEn,
          availabilityStatus: c.availabilityStatus,
          featured: c.featured,
          lastVerifiedAt: c.lastVerifiedAt ? c.lastVerifiedAt.toISOString() : null,
          deliveryMode: c.deliveryMode,
          duration: c.duration,
          feeDisplay: c.feeDisplay,
        }));

      return {
        categories: categories.map((c) => ({
          id: c.id,
          pillar: c.pillar,
          slug: c.slug,
          nameBn: c.nameBn,
          nameEn: c.nameEn,
          shortDescBn: c.shortDescBn,
          shortDescEn: c.shortDescEn,
          iconName: c.iconName,
          sortOrder: c.sortOrder,
          publishedCount: countByCatId.get(c.id) ?? 0,
        })),
        items: mapped,
      };
    } catch {
      // Development/staging may use reviewed seed fixtures; production fails closed.
    }
  }

  if (!canUseSeedFallback()) return { categories: [], items: [] };

  const catLookup = getSeedCategoryLookup("COURSES");
  const allVisibleSeedCourses = SEED_COURSES.filter((c) =>
    isPubliclyVisible(c.contentStatus, c.availabilityStatus),
  );
  const seedCourseCounts = new Map<string, number>();
  for (const c of allVisibleSeedCourses) {
    seedCourseCounts.set(
      c.categorySlug,
      (seedCourseCounts.get(c.categorySlug) ?? 0) + 1,
    );
  }
  const categories = getSeedCategoriesByPillar("COURSES").map((cat) => ({
    ...cat,
    publishedCount: seedCourseCounts.get(cat.slug) ?? 0,
  }));
  const items: PublicCourseCard[] = allVisibleSeedCourses
    .filter((c) =>
      filter?.categorySlug ? c.categorySlug === filter.categorySlug : true,
    )
    .filter((c) =>
      filter?.availability ? c.availabilityStatus === filter.availability : true,
    )
    .filter((c) =>
      filter?.q
        ? matchesSearchQuery(filter.q, [
            c.titleBn,
            c.titleEn,
            c.summaryBn,
            catLookup.get(c.categorySlug)?.nameBn,
            catLookup.get(c.categorySlug)?.nameEn,
            ...c.aliases,
          ])
        : true,
    )
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder)
    .map((c) => {
      const cat = catLookup.get(c.categorySlug);
      return {
        id: `seed-course-${c.slug}`,
        slug: c.slug,
        titleBn: c.titleBn,
        titleEn: c.titleEn,
        summaryBn: c.summaryBn,
        categorySlug: c.categorySlug,
        categoryNameBn: cat?.nameBn ?? c.categorySlug,
        categoryNameEn: cat?.nameEn ?? c.categorySlug,
        availabilityStatus: c.availabilityStatus,
        featured: c.featured,
        lastVerifiedAt: c.lastVerifiedAt ? c.lastVerifiedAt.toISOString() : null,
        deliveryMode: null,
        duration: null,
        feeDisplay: null,
      };
    });

  return { categories, items };
}

export async function getPublishedCourseBySlug(
  slug: string,
): Promise<PublicCourseDetail | null> {
  if (isDatabaseConfigured()) {
    try {
      const c = await prisma.course.findFirst({
        where: {
          slug,
          contentStatus: "PUBLISHED",
          availabilityStatus: { not: "INACTIVE" },
        },
        include: { category: true, instructor: true },
      });

      if (c) {
        return {
          id: c.id,
          slug: c.slug,
          titleBn: c.titleBn,
          titleEn: c.titleEn,
          summaryBn: c.summaryBn,
          summaryEn: c.summaryEn,
          categorySlug: c.category.slug,
          categoryNameBn: c.category.nameBn,
          categoryNameEn: c.category.nameEn,
          availabilityStatus: c.availabilityStatus,
          featured: c.featured,
          lastVerifiedAt: c.lastVerifiedAt ? c.lastVerifiedAt.toISOString() : null,
          audienceBn: c.audienceBn,
          outcomes: c.outcomes,
          syllabus: (c.syllabus as unknown as CourseModuleDTO[]) ?? [],
          deliveryMode: c.deliveryMode,
          duration: c.duration,
          feeDisplay: c.feeDisplay,
          instructor:
            c.instructor && c.instructor.isVerified
              ? {
                  id: c.instructor.id,
                  nameBn: c.instructor.nameBn,
                  nameEn: c.instructor.nameEn,
                  titleBn: c.instructor.titleBn,
                  bioBn: c.instructor.bioBn,
                  credentialsSummaryBn: c.instructor.credentialsSummaryBn,
                }
              : null,
          verifiedBy: c.verifiedBy,
          seoTitle: c.seoTitle,
          seoDescription: c.seoDescription,
        };
      }
    } catch {
      // Fallback below
    }
  }

  if (!canUseSeedFallback()) return null;

  const catLookup = getSeedCategoryLookup("COURSES");
  const c = SEED_COURSES.find(
    (item) =>
      item.slug === slug &&
      isPubliclyVisible(item.contentStatus, item.availabilityStatus),
  );
  if (!c) return null;
  const cat = catLookup.get(c.categorySlug);

  return {
    id: `seed-course-${c.slug}`,
    slug: c.slug,
    titleBn: c.titleBn,
    titleEn: c.titleEn,
    summaryBn: c.summaryBn,
    summaryEn: c.summaryEn,
    categorySlug: c.categorySlug,
    categoryNameBn: cat?.nameBn ?? c.categorySlug,
    categoryNameEn: cat?.nameEn ?? c.categorySlug,
    availabilityStatus: c.availabilityStatus,
    featured: c.featured,
    lastVerifiedAt: c.lastVerifiedAt ? c.lastVerifiedAt.toISOString() : null,
    audienceBn: c.audienceBn,
    outcomes: c.outcomes,
    syllabus: c.syllabus,
    deliveryMode: null,
    duration: null,
    feeDisplay: null,
    instructor: null,
    verifiedBy: c.verifiedBy,
    seoTitle: null,
    seoDescription: null,
  };
}

export async function listPublishedServices(filter?: {
  categorySlug?: string;
  q?: string;
}): Promise<{ categories: PublicCategoryDTO[]; items: PublicServiceCard[] }> {
  if (isDatabaseConfigured()) {
    try {
      const [categories, services, categoryCounts] = await Promise.all([
        prisma.category.findMany({
          where: { pillar: "SERVICES", isActive: true },
          orderBy: { sortOrder: "asc" },
        }),
        prisma.service.findMany({
          where: {
            contentStatus: "PUBLISHED",
            availabilityStatus: { not: "INACTIVE" },
            ...(filter?.categorySlug
              ? { category: { slug: filter.categorySlug } }
              : {}),
          },
          include: { category: true },
          orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
        }),
        prisma.service.groupBy({
          by: ["categoryId"],
          where: {
            contentStatus: "PUBLISHED",
            availabilityStatus: { not: "INACTIVE" },
          },
          _count: { _all: true },
        }),
      ]);

      const countByCatId = new Map(
        categoryCounts.map((row) => [row.categoryId, row._count._all]),
      );

      const mapped: PublicServiceCard[] = services
        .filter((s) =>
          filter?.q
            ? matchesSearchQuery(filter.q, [
                s.titleBn,
                s.titleEn,
                s.summaryBn,
                s.authorityName,
                s.category.nameBn,
                s.category.nameEn,
                ...s.aliases,
              ])
            : true,
        )
        .map((s) => ({
          id: s.id,
          slug: s.slug,
          titleBn: s.titleBn,
          titleEn: s.titleEn,
          summaryBn: s.summaryBn,
          categorySlug: s.category.slug,
          categoryNameBn: s.category.nameBn,
          categoryNameEn: s.category.nameEn,
          authorityName: s.authorityName,
          availabilityStatus: s.availabilityStatus,
          requiresSpecialist: s.requiresSpecialist,
          featured: s.featured,
          lastVerifiedAt: s.lastVerifiedAt ? s.lastVerifiedAt.toISOString() : null,
        }));

      return {
        categories: categories.map((c) => ({
          id: c.id,
          pillar: c.pillar,
          slug: c.slug,
          nameBn: c.nameBn,
          nameEn: c.nameEn,
          shortDescBn: c.shortDescBn,
          shortDescEn: c.shortDescEn,
          iconName: c.iconName,
          sortOrder: c.sortOrder,
          publishedCount: countByCatId.get(c.id) ?? 0,
        })),
        items: mapped,
      };
    } catch {
      // Fallback below
    }
  }

  if (!canUseSeedFallback()) return { categories: [], items: [] };

  const catLookup = getSeedCategoryLookup("SERVICES");
  const allVisibleSeedServices = SEED_SERVICES.filter((s) =>
    isPubliclyVisible(s.contentStatus, s.availabilityStatus),
  );
  const seedServiceCounts = new Map<string, number>();
  for (const s of allVisibleSeedServices) {
    seedServiceCounts.set(
      s.categorySlug,
      (seedServiceCounts.get(s.categorySlug) ?? 0) + 1,
    );
  }
  const categories = getSeedCategoriesByPillar("SERVICES").map((cat) => ({
    ...cat,
    publishedCount: seedServiceCounts.get(cat.slug) ?? 0,
  }));
  const items: PublicServiceCard[] = allVisibleSeedServices
    .filter((s) =>
      filter?.categorySlug ? s.categorySlug === filter.categorySlug : true,
    )
    .filter((s) =>
      filter?.q
        ? matchesSearchQuery(filter.q, [
            s.titleBn,
            s.titleEn,
            s.summaryBn,
            s.authorityName,
            catLookup.get(s.categorySlug)?.nameBn,
            catLookup.get(s.categorySlug)?.nameEn,
            ...s.aliases,
          ])
        : true,
    )
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder)
    .map((s) => {
      const cat = catLookup.get(s.categorySlug);
      return {
        id: `seed-service-${s.slug}`,
        slug: s.slug,
        titleBn: s.titleBn,
        titleEn: s.titleEn,
        summaryBn: s.summaryBn,
        categorySlug: s.categorySlug,
        categoryNameBn: cat?.nameBn ?? s.categorySlug,
        categoryNameEn: cat?.nameEn ?? s.categorySlug,
        authorityName: s.authorityName,
        availabilityStatus: s.availabilityStatus,
        requiresSpecialist: s.requiresSpecialist,
        featured: s.featured,
        lastVerifiedAt: s.lastVerifiedAt ? s.lastVerifiedAt.toISOString() : null,
      };
    });

  return { categories, items };
}

export async function getPublishedServiceBySlug(
  slug: string,
): Promise<PublicServiceDetail | null> {
  if (isDatabaseConfigured()) {
    try {
      const s = await prisma.service.findFirst({
        where: {
          slug,
          contentStatus: "PUBLISHED",
          availabilityStatus: { not: "INACTIVE" },
        },
        include: { category: true },
      });

      if (s) {
        return {
          id: s.id,
          slug: s.slug,
          titleBn: s.titleBn,
          titleEn: s.titleEn,
          summaryBn: s.summaryBn,
          summaryEn: s.summaryEn,
          categorySlug: s.category.slug,
          categoryNameBn: s.category.nameBn,
          categoryNameEn: s.category.nameEn,
          authorityName: s.authorityName,
          availabilityStatus: s.availabilityStatus,
          requiresSpecialist: s.requiresSpecialist,
          featured: s.featured,
          lastVerifiedAt: s.lastVerifiedAt ? s.lastVerifiedAt.toISOString() : null,
          whoNeedsItBn: s.whoNeedsItBn,
          assistanceScopeBn: s.assistanceScopeBn,
          limitationsBn: s.limitationsBn,
          documentsSummary: s.documentsSummary,
          processSteps: (s.processSteps as unknown as ProcessStepDTO[]) ?? [],
          officialSourceLabel: s.officialSourceLabel,
          officialSourceUrl: s.officialSourceUrl,
          serviceFeeNoteBn: s.serviceFeeNoteBn,
          govtFeeNoteBn: s.govtFeeNoteBn,
          verifiedBy: s.verifiedBy,
          seoTitle: s.seoTitle,
          seoDescription: s.seoDescription,
        };
      }
    } catch {
      // Fallback below
    }
  }

  if (!canUseSeedFallback()) return null;

  const catLookup = getSeedCategoryLookup("SERVICES");
  const s = SEED_SERVICES.find(
    (item) =>
      item.slug === slug &&
      isPubliclyVisible(item.contentStatus, item.availabilityStatus),
  );
  if (!s) return null;
  const cat = catLookup.get(s.categorySlug);

  return {
    id: `seed-service-${s.slug}`,
    slug: s.slug,
    titleBn: s.titleBn,
    titleEn: s.titleEn,
    summaryBn: s.summaryBn,
    summaryEn: s.summaryEn,
    categorySlug: s.categorySlug,
    categoryNameBn: cat?.nameBn ?? s.categorySlug,
    categoryNameEn: cat?.nameEn ?? s.categorySlug,
    authorityName: s.authorityName,
    availabilityStatus: s.availabilityStatus,
    requiresSpecialist: s.requiresSpecialist,
    featured: s.featured,
    lastVerifiedAt: s.lastVerifiedAt ? s.lastVerifiedAt.toISOString() : null,
    whoNeedsItBn: s.whoNeedsItBn,
    assistanceScopeBn: s.assistanceScopeBn,
    limitationsBn: s.limitationsBn,
    documentsSummary: s.documentsSummary,
    processSteps: s.processSteps,
    officialSourceLabel: s.officialSourceLabel,
    officialSourceUrl: s.officialSourceUrl,
    serviceFeeNoteBn: s.serviceFeeNoteBn,
    govtFeeNoteBn: s.govtFeeNoteBn,
    verifiedBy: s.verifiedBy,
    seoTitle: null,
    seoDescription: null,
  };
}

export async function listPublishedLicensing(filter?: {
  categorySlug?: string;
  q?: string;
}): Promise<{ categories: PublicCategoryDTO[]; items: PublicLicensingCard[] }> {
  if (isDatabaseConfigured()) {
    try {
      const [categories, entries, categoryCounts] = await Promise.all([
        prisma.category.findMany({
          where: { pillar: "LICENSING", isActive: true },
          orderBy: { sortOrder: "asc" },
        }),
        prisma.licensingEntry.findMany({
          where: {
            contentStatus: "PUBLISHED",
            availabilityStatus: { not: "INACTIVE" },
            ...(filter?.categorySlug
              ? { category: { slug: filter.categorySlug } }
              : {}),
          },
          include: { category: true },
          orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
        }),
        prisma.licensingEntry.groupBy({
          by: ["categoryId"],
          where: {
            contentStatus: "PUBLISHED",
            availabilityStatus: { not: "INACTIVE" },
          },
          _count: { _all: true },
        }),
      ]);

      const countByCatId = new Map(
        categoryCounts.map((row) => [row.categoryId, row._count._all]),
      );

      const mapped: PublicLicensingCard[] = entries
        .filter((l) =>
          filter?.q
            ? matchesSearchQuery(filter.q, [
                l.titleBn,
                l.titleEn,
                l.summaryBn,
                l.authorityName,
                l.category.nameBn,
                ...l.aliases,
              ])
            : true,
        )
        .map((l) => ({
          id: l.id,
          slug: l.slug,
          titleBn: l.titleBn,
          titleEn: l.titleEn,
          summaryBn: l.summaryBn,
          categorySlug: l.category.slug,
          categoryNameBn: l.category.nameBn,
          authorityName: l.authorityName,
          authorityType: l.authorityType,
          availabilityStatus: l.availabilityStatus,
          featured: l.featured,
          lastVerifiedAt: l.lastVerifiedAt ? l.lastVerifiedAt.toISOString() : null,
        }));

      return {
        categories: categories.map((c) => ({
          id: c.id,
          pillar: c.pillar,
          slug: c.slug,
          nameBn: c.nameBn,
          nameEn: c.nameEn,
          shortDescBn: c.shortDescBn,
          shortDescEn: c.shortDescEn,
          iconName: c.iconName,
          sortOrder: c.sortOrder,
          publishedCount: countByCatId.get(c.id) ?? 0,
        })),
        items: mapped,
      };
    } catch {
      // Fallback below
    }
  }

  if (!canUseSeedFallback()) return { categories: [], items: [] };

  const catLookup = getSeedCategoryLookup("LICENSING");
  const allVisibleSeedLicensing = SEED_LICENSING.filter((l) =>
    isPubliclyVisible(l.contentStatus, l.availabilityStatus),
  );
  const seedLicensingCounts = new Map<string, number>();
  for (const l of allVisibleSeedLicensing) {
    seedLicensingCounts.set(
      l.categorySlug,
      (seedLicensingCounts.get(l.categorySlug) ?? 0) + 1,
    );
  }
  const categories = getSeedCategoriesByPillar("LICENSING").map((cat) => ({
    ...cat,
    publishedCount: seedLicensingCounts.get(cat.slug) ?? 0,
  }));
  const items: PublicLicensingCard[] = allVisibleSeedLicensing
    .filter((l) =>
      filter?.categorySlug ? l.categorySlug === filter.categorySlug : true,
    )
    .filter((l) =>
      filter?.q
        ? matchesSearchQuery(filter.q, [
            l.titleBn,
            l.titleEn,
            l.summaryBn,
            l.authorityName,
            catLookup.get(l.categorySlug)?.nameBn,
            ...l.aliases,
          ])
        : true,
    )
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder)
    .map((l) => {
      const cat = catLookup.get(l.categorySlug);
      return {
        id: `seed-licensing-${l.slug}`,
        slug: l.slug,
        titleBn: l.titleBn,
        titleEn: l.titleEn,
        summaryBn: l.summaryBn,
        categorySlug: l.categorySlug,
        categoryNameBn: cat?.nameBn ?? l.categorySlug,
        authorityName: l.authorityName,
        authorityType: l.authorityType,
        availabilityStatus: l.availabilityStatus,
        featured: l.featured,
        lastVerifiedAt: l.lastVerifiedAt ? l.lastVerifiedAt.toISOString() : null,
      };
    });

  return { categories, items };
}

export async function getPublishedLicensingBySlug(
  slug: string,
): Promise<PublicLicensingDetail | null> {
  if (isDatabaseConfigured()) {
    try {
      const l = await prisma.licensingEntry.findFirst({
        where: {
          slug,
          contentStatus: "PUBLISHED",
          availabilityStatus: { not: "INACTIVE" },
        },
        include: { category: true },
      });
      if (l) {
        return {
          id: l.id,
          slug: l.slug,
          titleBn: l.titleBn,
          titleEn: l.titleEn,
          summaryBn: l.summaryBn,
          summaryEn: l.summaryEn,
          categorySlug: l.category.slug,
          categoryNameBn: l.category.nameBn,
          authorityName: l.authorityName,
          authorityType: l.authorityType,
          availabilityStatus: l.availabilityStatus,
          featured: l.featured,
          lastVerifiedAt: l.lastVerifiedAt ? l.lastVerifiedAt.toISOString() : null,
          officialSourceLabel: l.officialSourceLabel,
          officialSourceUrl: l.officialSourceUrl,
          serviceScopeBn: l.serviceScopeBn,
          limitationsBn: l.limitationsBn,
          documentsSummary: l.documentsSummary,
          processSummaryBn: l.processSummaryBn,
          verifiedBy: l.verifiedBy,
          seoTitle: l.seoTitle,
          seoDescription: l.seoDescription,
        };
      }
    } catch {
      // Fallback below
    }
  }

  if (!canUseSeedFallback()) return null;

  const catLookup = getSeedCategoryLookup("LICENSING");
  const l = SEED_LICENSING.find(
    (item) =>
      item.slug === slug &&
      isPubliclyVisible(item.contentStatus, item.availabilityStatus),
  );
  if (!l) return null;
  const cat = catLookup.get(l.categorySlug);

  return {
    id: `seed-licensing-${l.slug}`,
    slug: l.slug,
    titleBn: l.titleBn,
    titleEn: l.titleEn,
    summaryBn: l.summaryBn,
    summaryEn: l.summaryEn,
    categorySlug: l.categorySlug,
    categoryNameBn: cat?.nameBn ?? l.categorySlug,
    authorityName: l.authorityName,
    authorityType: l.authorityType,
    availabilityStatus: l.availabilityStatus,
    featured: l.featured,
    lastVerifiedAt: l.lastVerifiedAt ? l.lastVerifiedAt.toISOString() : null,
    officialSourceLabel: l.officialSourceLabel,
    officialSourceUrl: l.officialSourceUrl,
    serviceScopeBn: l.serviceScopeBn,
    limitationsBn: l.limitationsBn,
    documentsSummary: l.documentsSummary,
    processSummaryBn: l.processSummaryBn,
    verifiedBy: l.verifiedBy,
    seoTitle: null,
    seoDescription: null,
  };
}

export async function listPublishedFaqs(
  pillar?: Pillar,
): Promise<PublicFaqItem[]> {
  if (isDatabaseConfigured()) {
    try {
      const rows = await prisma.faq.findMany({
        where: {
          contentStatus: "PUBLISHED",
          ...(pillar ? { pillar } : {}),
        },
        orderBy: { sortOrder: "asc" },
      });
      return rows.map((f) => ({
        id: f.id,
        questionBn: f.questionBn,
        answerBn: f.answerBn,
        pillar: f.pillar,
        isRegulatory: f.isRegulatory,
        lastVerifiedAt: f.lastVerifiedAt ? f.lastVerifiedAt.toISOString() : null,
      }));
    } catch {
      // Fallback below
    }
  }

  if (!canUseSeedFallback()) return [];

  return SEED_FAQS.filter((f) => f.contentStatus === "PUBLISHED")
    .filter((f) => (pillar ? f.pillar === pillar : true))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((f, idx) => ({
      id: `seed-faq-${idx + 1}`,
      questionBn: f.questionBn,
      answerBn: f.answerBn,
      pillar: f.pillar,
      isRegulatory: f.isRegulatory,
      lastVerifiedAt: f.lastVerifiedAt ? f.lastVerifiedAt.toISOString() : null,
    }));
}

export async function searchPublishedCatalogue(query: string): Promise<{
  courses: PublicCourseCard[];
  services: PublicServiceCard[];
  licensing: PublicLicensingCard[];
}> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { courses: [], services: [], licensing: [] };
  }

  const [coursesRes, servicesRes, licensingRes] = await Promise.all([
    listPublishedCourses({ q: trimmed }),
    listPublishedServices({ q: trimmed }),
    listPublishedLicensing({ q: trimmed }),
  ]);

  return {
    courses: coursesRes.items.slice(0, 6),
    services: servicesRes.items.slice(0, 6),
    licensing: licensingRes.items.slice(0, 6),
  };
}

export async function getPublishedSlugManifest(): Promise<{
  courses: string[];
  services: string[];
  licensing: string[];
}> {
  const [coursesRes, servicesRes, licensingRes] = await Promise.all([
    listPublishedCourses(),
    listPublishedServices(),
    listPublishedLicensing(),
  ]);

  return {
    courses: coursesRes.items.map((c) => c.slug),
    services: servicesRes.items.map((s) => s.slug),
    licensing: licensingRes.items.map((l) => l.slug),
  };
}
