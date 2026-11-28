import test from "node:test";
import assert from "node:assert/strict";
import {
  ALL_TAB_SLUG,
  buildPopularBookTabs,
  buildPopularCourseTabs,
  filterBooksByTab,
  filterPopularCourses,
  formatBdtPaisaExact,
  getCourseVisualTheme,
  isDarkCourseVisualHeader,
} from "./popular-courses";
import type {
  PublicBookCategoryDTO,
  PublicBookPreview,
  PublicCategoryDTO,
  PublicCourseCard,
} from "@/types/domain";

const SAMPLE_CATEGORIES: PublicCategoryDTO[] = [
  {
    id: "cat-1",
    pillar: "COURSES",
    slug: "income-tax",
    nameBn: "আয়কর",
    nameEn: "Income Tax",
    shortDescBn: "আয়কর ও রিটার্ন প্রশিক্ষণ",
    shortDescEn: null,
    iconName: "Calculator",
    sortOrder: 1,
  },
  {
    id: "cat-2",
    pillar: "COURSES",
    slug: "vat-and-mushak",
    nameBn: "ভ্যাট ও মূসক",
    nameEn: "VAT & Mushak",
    shortDescBn: "ভ্যাট ও মূসক প্রশিক্ষণ",
    shortDescEn: null,
    iconName: "ReceiptText",
    sortOrder: 2,
  },
  {
    id: "cat-3",
    pillar: "COURSES",
    slug: "empty-track",
    nameBn: "খালি বিভাগ",
    nameEn: "Empty Track",
    shortDescBn: "খালি বিভাগ বিবরণ",
    shortDescEn: null,
    iconName: null,
    sortOrder: 3,
  },
];

const SAMPLE_COURSES: PublicCourseCard[] = [
  {
    id: "c-1",
    slug: "tax-basics",
    titleBn: "আয়কর রিটার্ন প্রস্তুতি",
    titleEn: "Income Tax Return Preparation",
    summaryBn: "ব্যক্তিগত ও কর্পোরেট রিটার্ন",
    categorySlug: "income-tax",
    categoryNameBn: "আয়কর",
    categoryNameEn: "Income Tax",
    availabilityStatus: "INTEREST_ONLY",
    featured: true,
    lastVerifiedAt: null,
    deliveryMode: null,
    duration: null,
    feeDisplay: null,
  },
  {
    id: "c-2",
    slug: "vat-mushak",
    titleBn: "ভ্যাট ও মূসক ৯.১",
    titleEn: "VAT & Mushak 9.1",
    summaryBn: "মাসিক ভ্যাট রিটার্ন",
    categorySlug: "vat-and-mushak",
    categoryNameBn: "ভ্যাট ও মূসক",
    categoryNameEn: "VAT & Mushak",
    availabilityStatus: "ACTIVE",
    featured: true,
    lastVerifiedAt: null,
    deliveryMode: "Online",
    duration: "6 Weeks",
    feeDisplay: "৳3,500",
  },
];

const SAMPLE_BOOK_CATEGORIES: PublicBookCategoryDTO[] = [
  {
    slug: "tax",
    nameBn: "আয়কর ও ট্যাক্স",
    nameEn: "Income Tax",
    shortDescBn: "ট্যাক্স গাইড",
    sortOrder: 1,
    previewCount: 1,
  },
  {
    slug: "vat-mushak",
    nameBn: "ভ্যাট ও মূসক",
    nameEn: "VAT & Mushak",
    shortDescBn: "ভ্যাট গাইড",
    sortOrder: 2,
    previewCount: 0,
  },
];

const SAMPLE_BOOKS: PublicBookPreview[] = [
  {
    id: "b-1",
    slug: "tax-book",
    titleBn: "বাংলাদেশ আয়কর হ্যান্ডবুক",
    titleEn: "Bangladesh Income Tax Handbook",
    subtitleBn: "রিটার্ন গাইড",
    categorySlug: "tax",
    categoryNameBn: "আয়কর ও ট্যাক্স",
    categoryNameEn: "Income Tax",
    summaryBn: "সংক্ষিপ্তসার",
    audienceBn: "উদ্যোক্তা",
    topicsBn: ["অধ্যায় ১"],
    editionNoteBn: "নোট",
    availabilityState: "UPCOMING_PREVIEW",
    featured: true,
    coverPalette: {
      spineHex: "#081838",
      coverHex: "#152b54",
      accentHex: "#c59028",
      textHex: "#ffffff",
    },
    relatedCourseCategorySlug: "income-tax",
    relatedServiceCategorySlug: "income-tax-solutions",
    relatedLicensingCategorySlug: "general-business-registration",
  },
];

test("buildPopularCourseTabs includes All first and excludes empty categories", () => {
  const tabs = buildPopularCourseTabs(SAMPLE_COURSES, SAMPLE_CATEGORIES);
  assert.equal(tabs.length, 3);
  assert.equal(tabs[0]?.slug, ALL_TAB_SLUG);
  assert.equal(tabs[0]?.labelBn, "সব");
  assert.equal(tabs[0]?.count, 2);
  assert.deepEqual(
    tabs.slice(1).map((t) => t.slug),
    ["income-tax", "vat-and-mushak"],
  );
});

test("filterPopularCourses returns all when tab is 'all' and filters by category slug", () => {
  assert.equal(filterPopularCourses(SAMPLE_COURSES, ALL_TAB_SLUG).length, 2);
  const taxOnly = filterPopularCourses(SAMPLE_COURSES, "income-tax");
  assert.equal(taxOnly.length, 1);
  assert.equal(taxOnly[0]?.slug, "tax-basics");
});

test("buildPopularBookTabs and filterBooksByTab handle upcoming book filtering accurately", () => {
  const tabs = buildPopularBookTabs(SAMPLE_BOOKS, SAMPLE_BOOK_CATEGORIES);
  assert.equal(tabs.length, 2);
  assert.equal(tabs[0]?.slug, ALL_TAB_SLUG);
  assert.equal(tabs[1]?.slug, "tax");
  assert.equal(filterBooksByTab(SAMPLE_BOOKS, "tax").length, 1);
  assert.equal(filterBooksByTab(SAMPLE_BOOKS, "vat-mushak").length, 0);
});

test("course visual theme and dark header checks remain deterministic", () => {
  assert.equal(isDarkCourseVisualHeader("egp-and-tender"), true);
  assert.equal(isDarkCourseVisualHeader("income-tax"), false);
  assert.equal(getCourseVisualTheme("unknown-slug").codeLabel, "BCP-TRK");
  assert.equal(formatBdtPaisaExact(250000), "৳2,500");
});
