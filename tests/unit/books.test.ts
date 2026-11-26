import { describe, expect, it } from "vitest";
import {
  BOOK_AVAILABILITY_BADGE_BN,
  BOOK_PREVIEW_CATALOG,
  BOOK_PRICING_NOTICE_BN,
  getBookPreviewBySlug,
  listBookCatalog,
  listBookCategories,
  listRelatedBooksForCourseCategory,
  listRelatedBooksForLicensingCategory,
  listRelatedBooksForServiceCategory,
  searchBookPreviews,
} from "@/lib/books/catalog";
import {
  listPublishedCourses,
  listPublishedLicensing,
  listPublishedServices,
} from "@/lib/services/catalogue";
import {
  buildWhatsAppBookMessage,
  buildWhatsAppUrl,
  OFFICIAL_ADMIN_WHATSAPP_E164,
} from "@/lib/contact/whatsapp";

describe("Our Books upcoming preview catalog & integrity", () => {
  it("exposes 11 ordered categories with positive preview counts", () => {
    const categories = listBookCategories();
    expect(categories).toHaveLength(11);
    for (const cat of categories) {
      expect(cat.previewCount).toBeGreaterThanOrEqual(1);
    }
    expect(categories.map((c) => c.slug)).toEqual([
      "tax",
      "vat-mushak",
      "egp-tender",
      "rjsc-corporate",
      "accounting",
      "ecommerce",
      "customs",
      "labour-law",
      "business-management",
      "corporate-tax-audit",
      "internal-compliance-procedures",
    ]);
  });

  it("marks every preview book as UPCOMING_PREVIEW without fabricated prices", () => {
    expect(BOOK_PREVIEW_CATALOG.length).toBe(11);
    const fabricatedPricePattern = /(?:৳\s*\d+|BDT\s*\d+|\d+\s*টাকা)/i;

    for (const book of BOOK_PREVIEW_CATALOG) {
      expect(book.availabilityState).toBe("UPCOMING_PREVIEW");
      expect(book.editionNoteBn).toBe(BOOK_PRICING_NOTICE_BN);
      expect(BOOK_AVAILABILITY_BADGE_BN).toBe("প্রকাশনা আসন্ন");
      expect(book.topicsBn.length).toBeGreaterThanOrEqual(3);
      expect(book.coverPalette.spineHex).toMatch(/^#[0-9a-f]{6}$/i);
      expect(book.coverPalette.coverHex).toMatch(/^#[0-9a-f]{6}$/i);
      expect(book.coverPalette.accentHex).toMatch(/^#[0-9a-f]{6}$/i);
      expect(book.coverPalette.textHex).toMatch(/^#[0-9a-f]{6}$/i);

      expect(fabricatedPricePattern.test(book.summaryBn)).toBe(false);
      expect(fabricatedPricePattern.test(book.editionNoteBn)).toBe(false);
      expect(fabricatedPricePattern.test(book.subtitleBn)).toBe(false);
    }
  });

  it("cross-links cleanly to valid published course, service, and licensing categories", async () => {
    const [courses, services, licensing] = await Promise.all([
      listPublishedCourses(),
      listPublishedServices(),
      listPublishedLicensing(),
    ]);

    const courseCategorySlugs = new Set(courses.categories.map((c) => c.slug));
    const serviceCategorySlugs = new Set(services.categories.map((c) => c.slug));
    const licensingCategorySlugs = new Set(licensing.categories.map((c) => c.slug));

    for (const book of BOOK_PREVIEW_CATALOG) {
      if (book.relatedCourseCategorySlug) {
        expect(courseCategorySlugs.has(book.relatedCourseCategorySlug)).toBe(true);
      }
      if (book.relatedServiceCategorySlug) {
        expect(serviceCategorySlugs.has(book.relatedServiceCategorySlug)).toBe(true);
      }
      if (book.relatedLicensingCategorySlug) {
        expect(licensingCategorySlugs.has(book.relatedLicensingCategorySlug)).toBe(true);
      }
    }

    expect(listRelatedBooksForCourseCategory("income-tax", 2).length).toBe(2);
    expect(listRelatedBooksForServiceCategory("vat-mushak-solutions", 2).length).toBe(2);
    expect(listRelatedBooksForLicensingCategory("general-business-registration", 2).length).toBe(2);
  });

  it("filters by category, resolves by slug, and searches accurately", () => {
    const vatFiltered = listBookCatalog({ categorySlug: "vat-mushak" });
    expect(vatFiltered.items).toHaveLength(1);
    expect(vatFiltered.items[0]?.slug).toBe("vat-mushak-9-1-compliance-field-guide");

    const vatSearch = searchBookPreviews("VAT");
    expect(vatSearch.length).toBeGreaterThanOrEqual(1);
    expect(vatSearch.some((b) => b.categorySlug === "vat-mushak")).toBe(true);

    const found = getBookPreviewBySlug("income-tax-practical-handbook-bangladesh");
    expect(found).not.toBeNull();
    expect(found?.categorySlug).toBe("tax");

    expect(getBookPreviewBySlug("non-existent-book-slug")).toBeNull();
  });

  it("builds valid WhatsApp pre-launch inquiry links for official BCP number", () => {
    const msg = buildWhatsAppBookMessage({
      bookTitle: "বাংলাদেশ আয়কর ও রিটার্ন প্রস্তুতি: ব্যবহারিক হ্যান্ডবুক",
      bookPath: "/books/income-tax-practical-handbook-bangladesh",
      canonicalBaseUrl: "https://bcp.com.bd",
    });
    expect(msg).toContain("আসন্ন প্রকাশনা সম্পর্কে আগ্রহী");
    expect(msg).toContain("https://bcp.com.bd/books/income-tax-practical-handbook-bangladesh");

    const url = buildWhatsAppUrl(OFFICIAL_ADMIN_WHATSAPP_E164, msg);
    expect(url).not.toBeNull();
    expect(url!.startsWith(`https://wa.me/${OFFICIAL_ADMIN_WHATSAPP_E164}?text=`)).toBe(true);
  });
});
