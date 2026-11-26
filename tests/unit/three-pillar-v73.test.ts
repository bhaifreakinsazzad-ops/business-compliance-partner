import { describe, expect, it } from "vitest";
import {
  getMasterPillarById,
  MASTER_THREE_PILLARS,
  SUPPORTING_NAVIGATION,
} from "@/lib/config/pillars";
import {
  rankRelatedBooks,
  rankRelatedCourses,
  rankRelatedServices,
} from "@/lib/recommendations/cross-division";
import { loadBookCatalog } from "@/lib/books/catalog";
import {
  listPublishedCourses,
  listPublishedServices,
} from "@/lib/services/catalogue";

describe("V7.3 Master Three-Pillar Architecture", () => {
  it("enforces exact canonical order: 1. Courses -> 2. Services -> 3. Books", () => {
    expect(MASTER_THREE_PILLARS).toHaveLength(3);
    expect(MASTER_THREE_PILLARS.map((p) => p.id)).toEqual([
      "courses",
      "services",
      "books",
    ]);
    expect(MASTER_THREE_PILLARS.map((p) => p.order)).toEqual([1, 2, 3]);
    expect(MASTER_THREE_PILLARS.map((p) => p.labelEn)).toEqual([
      "Courses",
      "Services",
      "Books",
    ]);
    expect(MASTER_THREE_PILLARS.map((p) => p.href)).toEqual([
      "/courses",
      "/services",
      "/books",
    ]);
  });

  it("assigns distinct icons, Bengali labels, customer intents, and analytics events per pillar", () => {
    const courses = getMasterPillarById("courses");
    const services = getMasterPillarById("services");
    const books = getMasterPillarById("books");

    expect(courses.labelBn).toBe("আমাদের সকল কোর্সসমূহ");
    expect(services.labelBn).toBe("আমাদের সকল সেবাসমূহ");
    expect(books.labelBn).toBe("আমাদের সকল বইসমূহ");

    expect(courses.iconName).toBe("GraduationCap");
    expect(services.iconName).toBe("BriefcaseBusiness");
    expect(books.iconName).toBe("BookOpen");

    expect(courses.analyticsEvent).toBe("click_pillar_courses");
    expect(services.analyticsEvent).toBe("click_pillar_services");
    expect(books.analyticsEvent).toBe("click_pillar_books");
  });

  it("associates Licensing and Consultancy cleanly under Services in supporting navigation", () => {
    const licensing = SUPPORTING_NAVIGATION.find(
      (item) => item.id === "licensing",
    );
    const consultancy = SUPPORTING_NAVIGATION.find(
      (item) => item.id === "consultancy",
    );
    expect(licensing?.parentAssociation).toBe("services");
    expect(consultancy?.parentAssociation).toBe("services");
  });

  it("provides bidirectional cross-division recommendations across Courses, Services, and Books", async () => {
    const [coursesRes, servicesRes, booksRes] = await Promise.all([
      listPublishedCourses(),
      listPublishedServices(),
      loadBookCatalog(),
    ]);

    const taxCourse = coursesRes.items.find((c) =>
      c.slug.includes("income-tax"),
    );
    expect(taxCourse).toBeDefined();

    if (taxCourse) {
      const relatedServices = rankRelatedServices(
        servicesRes.items,
        {
          titleBn: taxCourse.titleBn,
          titleEn: taxCourse.titleEn,
          categorySlug: taxCourse.categorySlug,
          categoryNameBn: taxCourse.categoryNameBn,
          summaryBn: taxCourse.summaryBn,
          relatedCourseCategorySlug: taxCourse.categorySlug,
        },
        undefined,
        2,
      );
      expect(relatedServices.length).toBeGreaterThan(0);

      const relatedBooks = rankRelatedBooks(
        booksRes.items,
        {
          titleBn: taxCourse.titleBn,
          titleEn: taxCourse.titleEn,
          categorySlug: taxCourse.categorySlug,
          categoryNameBn: taxCourse.categoryNameBn,
          summaryBn: taxCourse.summaryBn,
          relatedCourseCategorySlug: taxCourse.categorySlug,
        },
        undefined,
        2,
      );
      expect(relatedBooks.length).toBeGreaterThan(0);
    }

    const vatService = servicesRes.items[0];
    expect(vatService).toBeDefined();
    if (vatService) {
      const relatedCourses = rankRelatedCourses(
        coursesRes.items,
        {
          titleBn: vatService.titleBn,
          titleEn: vatService.titleEn,
          categorySlug: vatService.categorySlug,
          categoryNameBn: vatService.categoryNameBn,
          summaryBn: vatService.summaryBn,
          relatedServiceCategorySlug: vatService.categorySlug,
        },
        undefined,
        2,
      );
      expect(relatedCourses.length).toBeGreaterThan(0);
    }
  });
});
