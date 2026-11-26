import { describe, expect, it } from "vitest";
import {
  scoreCrossDivisionMatch,
  rankRelatedBooks,
  rankRelatedCourses,
  rankRelatedServices,
  rankRelatedLicensing,
} from "@/lib/recommendations/cross-division";
import {
  BOOK_PREVIEW_CATALOG,
  loadBookCatalog,
  getGovernedBookBySlug,
  mapDbBookToPublicPreview,
} from "@/lib/books/catalog";
import {
  bookCoverPaletteSchema,
  bookUpsertSchema,
} from "@/lib/validation/content";
import type { PublicBookPreview } from "@/types/domain";

describe("Cross-Division Recommendation Engine", () => {
  it("scores domain cluster keywords deterministically", () => {
    const taxMatch = scoreCrossDivisionMatch(
      {
        titleBn: "ব্যবহারিক আয়কর রিটার্ন প্রস্তুতি",
        categorySlug: "tax",
        summaryBn: "কর নির্ধারণ ও রিটার্ন ফরম পূরণ",
      },
      {
        titleBn: "ইনকাম ট্যাক্স প্র্যাকটিক্যাল হ্যান্ডবুক বাংলাদেশ",
        categorySlug: "tax",
        topics: ["ট্যাক্স রিটার্ন ফরম প্রস্তুত", "কর অবকাশ"],
      },
    );
    expect(taxMatch).toBeGreaterThan(0);

    const unrelatedMatch = scoreCrossDivisionMatch(
      {
        titleBn: "ফায়ার সার্ভিস ও সিভিল ডিফেন্স লাইসেন্স",
        categorySlug: "licensing-fire",
        summaryBn: "অগ্নি নিরাপত্তা ক্লিয়ারেন্স সনদ",
      },
      {
        titleBn: "ইনকাম ট্যাক্স প্র্যাকটিক্যাল হ্যান্ডবুক",
        categorySlug: "tax",
        topics: ["রিটার্ন অডিট", "উৎস কর কর্তন"],
      },
    );
    expect(taxMatch).toBeGreaterThan(unrelatedMatch);
  });

  it("ranks related books accurately for courses and services", () => {
    const vatRelated = rankRelatedBooks(
      BOOK_PREVIEW_CATALOG,
      {
        titleBn: "ভ্যাট ও মূসক রিটার্ন কমপ্লায়েন্স প্রশিক্ষণ",
        categorySlug: "vat-mushak-solutions",
        topics: ["মূসক ৯.১ রিটার্ন দাখিল", "ইনপুট ট্যাক্স ক্রেডিট"],
        relatedCourseCategorySlug: "vat-mushak-solutions",
      },
      undefined,
      2,
    );

    expect(vatRelated.length).toBe(2);
    expect(vatRelated[0]?.categorySlug).toBe("vat-mushak");
  });

  it("safely handles empty or missing recommendation inputs", () => {
    const emptyRank = rankRelatedBooks([], { titleBn: "টেস্ট" });
    expect(emptyRank).toEqual([]);

    const coursesRank = rankRelatedCourses([], { titleBn: "টেস্ট" });
    expect(coursesRank).toEqual([]);

    const servicesRank = rankRelatedServices([], { titleBn: "টেস্ট" });
    expect(servicesRank).toEqual([]);

    const licensingRank = rankRelatedLicensing([], { titleBn: "টেস্ট" });
    expect(licensingRank).toEqual([]);
  });
});

describe("Governed Bookstore Catalog & Model Mapping", () => {
  it("maps DB book model with null price to UPCOMING_PREVIEW state", () => {
    const dbMock = {
      id: "book-test-1",
      slug: "corporate-governance-handbook",
      sku: "BCP-BK-010",
      isbn: "978-984-35-9999-1",
      titleBn: "কর্পোরেট সুশাসন ও পরিচালনা পর্ষদ গাইড",
      titleEn: "Corporate Governance & Board Practice",
      subtitleBn: "কোম্পানি আইন ২০২৩ ও সিকিউরিটিজ কমপ্লায়েন্স",
      categoryId: "cat-rjsc",
      category: {
        id: "cat-rjsc",
        slug: "rjsc-corporate",
        nameBn: "আরজেএসসি ও কোম্পানি আইন",
        nameEn: "RJSC & Company Law",
      },
      summaryBn: "কোম্পানির পরিচালনা পর্ষদ সভা, রেজোলিউশন ও রিটার্ন দাখিলের নিয়ম।",
      audienceBn: "কোম্পানি সচিব, পরিচালক ও আইন উপদেষ্টা।",
      topicsBn: ["বোর্ড রেজোলিউশন", "শেয়ার ট্রান্সফার", "ফর্ম XII"],
      editionLabel: "১ম সংস্করণ",
      editionNoteBn: "ক্লায়েন্ট রিভিউ ও মূল্য অনুমোদন সাপেক্ষে।",
      pagesCount: 220,
      languageBnEn: "বাংলা ও ইংরেজি রেফারেন্স",
      deliveryMode: "PRINT",
      pricePaisa: null,
      stockQuantity: 0,
      contentStatus: "DRAFT",
      availabilityStatus: "UPCOMING",
      featured: false,
      sortOrder: 1,
      coverPalette: {
        coverHex: "#0E224A",
        accentHex: "#C59028",
        textHex: "#FFFFFF",
        spineHex: "#081838",
      },
      relatedCourseCategorySlug: "rjsc-corporate-law",
      relatedServiceCategorySlug: "rjsc-incorporation",
      relatedLicensingCategorySlug: "general-business-registration",
      seoTitle: null,
      seoDescription: null,
      lastVerifiedAt: new Date("2026-11-20T00:00:00Z"),
      verifiedBy: "BCP Content Board",
    };

    const mapped = mapDbBookToPublicPreview(dbMock);
    expect(mapped.availabilityState).toBe("UPCOMING_PREVIEW");
    expect(mapped.priceBdt).toBeNull();
    expect(mapped.pricePaisa).toBeNull();
    expect(mapped.inStock).toBe(false);
    expect(mapped.categorySlug).toBe("rjsc-corporate");
  });

  it("maps DB book model with valid paisa price to PUBLISHED_PRICED state", () => {
    const dbPriced = {
      id: "book-test-2",
      slug: "vat-field-handbook",
      sku: "BCP-BK-002",
      isbn: "978-984-35-1234-5",
      titleBn: "ভ্যাট ও মূসক ৯.১ প্র্যাকটিক্যাল গাইড",
      titleEn: "Practical VAT & Mushak 9.1 Handbook",
      subtitleBn: "মূসক চালান, সহগ ঘোষণা ও মাসিক রিটার্ন",
      categoryId: "cat-vat",
      category: {
        id: "cat-vat",
        slug: "vat-mushak",
        nameBn: "ভ্যাট ও মূসক",
        nameEn: "VAT & Mushak",
      },
      summaryBn: "ভ্যাট রিটার্ন প্রস্তুত ও দাখিলের পূর্ণাঙ্গ নির্দেশিকা।",
      audienceBn: "হিসাবরক্ষক, ভ্যাট পরামর্শক ও উদ্যোক্তা।",
      topicsBn: ["মূসক ৬.৩ চালান", "মূসক ৪.৩ সহগ", "মূসক ৯.১ রিটার্ন"],
      editionLabel: "১ম প্রকাশনা সংস্করণ",
      editionNoteBn: "যাচাইকৃত মুদ্রিত সংস্করণ • দেশব্যাপী হোম ডেলিভারি।",
      pagesCount: 350,
      languageBnEn: "বাংলা ও ইংরেজি রেফারেন্স",
      deliveryMode: "PRINT",
      pricePaisa: 125000, // 1250 BDT
      stockQuantity: 45,
      contentStatus: "PUBLISHED",
      availabilityStatus: "AVAILABLE",
      featured: true,
      sortOrder: 2,
      coverPalette: {
        coverHex: "#1B2E59",
        accentHex: "#DFB15B",
        textHex: "#FFFFFF",
        spineHex: "#0E224A",
      },
      relatedCourseCategorySlug: "vat-mushak-solutions",
      relatedServiceCategorySlug: "vat-mushak-solutions",
      relatedLicensingCategorySlug: null,
      seoTitle: "ভ্যাট ও মূসক ৯.১ প্র্যাকটিক্যাল গাইড",
      seoDescription: "ভ্যাট রিটার্ন প্রস্তুত ও দাখিলের পূর্ণাঙ্গ নির্দেশিকা।",
      lastVerifiedAt: new Date("2026-11-20T00:00:00Z"),
      verifiedBy: "BCP Senior VAT Specialist",
    };

    const mapped = mapDbBookToPublicPreview(dbPriced);
    expect(mapped.availabilityState).toBe("PUBLISHED_PRICED");
    expect(mapped.priceBdt).toBe(1250);
    expect(mapped.pricePaisa).toBe(125000);
    expect(mapped.inStock).toBe(true);
    expect(mapped.stockQuantity).toBe(45);
  });

  it("loads governed catalog with preview fallback", async () => {
    const catalog = await loadBookCatalog({ limit: 5 });
    expect(catalog.items.length).toBeGreaterThanOrEqual(1);
    expect(catalog.categories.length).toBe(9);

    const single = await getGovernedBookBySlug("income-tax-practical-handbook-bangladesh");
    expect(single).not.toBeNull();
    expect(single?.slug).toBe("income-tax-practical-handbook-bangladesh");
  });
});

describe("Book Content Validation & Security Safeguards", () => {
  it("validates palette hex codes strictly", () => {
    const valid = bookCoverPaletteSchema.safeParse({
      coverHex: "#081838",
      accentHex: "#C59028",
      textHex: "#FFFFFF",
      spineHex: "#081838",
    });
    expect(valid.success).toBe(true);

    const invalid = bookCoverPaletteSchema.safeParse({
      coverHex: "navy-blue", // not hex
      accentHex: "#C59028",
      textHex: "#FFFFFF",
      spineHex: "#081838",
    });
    expect(invalid.success).toBe(false);
  });

  it("rejects synthetic guarantees and fabricated claims in book descriptions", () => {
    const invalidClaim = bookUpsertSchema.safeParse({
      titleBn: "১০০% ট্যাক্স মাফ ও নিশ্চিত জয় গাইড",
      titleEn: "100% Guaranteed Tax Victory Guide",
      subtitleBn: "১০০% গ্যারান্টি সহ ভ্যাট মুক্তি",
      categoryId: "cat-1",
      summaryBn: "১০০% গ্যারান্টি সহ কোনো ভ্যাট দিতে হবে না।",
      audienceBn: "উদ্যোক্তা",
      topicsBn: ["ট্যাক্স ফাঁকি"],
      editionNoteBn: "অনুমোদিত",
      coverPalette: {
        coverHex: "#081838",
        accentHex: "#C59028",
        textHex: "#FFFFFF",
        spineHex: "#081838",
      },
    });
    expect(invalidClaim.success).toBe(false);
  });

  it("enforces required pricing and non-zero stock when publishing commercial editions", () => {
    const invalidPublish = bookUpsertSchema.safeParse({
      titleBn: "বাংলাদেশ কাস্টমস ক্লিয়ারেন্স ম্যানুয়াল",
      titleEn: "Bangladesh Customs Clearance Manual",
      subtitleBn: "আমদানি-রপ্তানি ও শুল্কায়ন প্রক্রিয়া",
      categoryId: "cat-customs",
      summaryBn: "আমদানি রপ্তানি শুল্কায়ন ও কাস্টমস বন্ড লাইসেন্স নির্দেশিকা।",
      audienceBn: "আমদানিকারক ও সিঅ্যান্ডএফ এজেন্ট",
      topicsBn: ["এইচএস কোড ক্লাসিফিকেশন", "বিল অব এন্ট্রি", "বন্ডেড ওয়্যারহাউস"],
      editionNoteBn: "১ম প্রকাশনা সংস্করণ",
      coverPalette: {
        coverHex: "#0E224A",
        accentHex: "#C59028",
        textHex: "#FFFFFF",
        spineHex: "#081838",
      },
      contentStatus: "PUBLISHED",
      availabilityStatus: "AVAILABLE",
      pricePaisa: null, // PUBLISHED requires pricePaisa
      stockQuantity: 10,
    });
    expect(invalidPublish.success).toBe(false);
  });
});
