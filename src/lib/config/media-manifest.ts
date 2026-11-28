export type MediaProvenance =
  | "BCP_MASTER_BRAND_BOOK_V1"
  | "BCP_SUPPLIED_BRANDED_V83"
  | "BCP_REMEDIATED_BRANDED_V83"
  | "BCP_FRAMED_WIDE_V83"
  | "BCP_GENERATED_EDITORIAL_V82"
  | "BCP_COMPOSED_CONCEPT_V82";

export type MediaApprovalStatus =
  | "APPROVED_BRAND_ASSET"
  | "APPROVED_STATIC"
  | "CONCEPT_PREVIEW";

export type MediaComponentOwner =
  | "BrandHeaderFooter"
  | "PromotionalHeroSlider"
  | "CourseArtworkThumbnail"
  | "ServicesGatewaySection"
  | "BookCard"
  | "BookPreview3D"
  | "InstitutionalProfileSection"
  | "ContactPage"
  | "EmptyState";

export type EmptyStateVariant = "courses" | "services" | "books" | "generic";

export interface GovernedMediaAsset {
  assetId: string;
  component: MediaComponentOwner;
  targetSlug: string;
  publicPath: string;
  width: number;
  height: number;
  altBn: string;
  provenance: MediaProvenance;
  approvalStatus: MediaApprovalStatus;
  commercialNoticeBn?: string;
}

export const MASTER_BRAND_ASSET: GovernedMediaAsset = {
  assetId: "brand-master-logo",
  component: "BrandHeaderFooter",
  targetSlug: "bcp-master-logo",
  publicPath: "/brand/bcp-master-logo.png",
  width: 1024,
  height: 1024,
  altBn: "Business Compliance Partner অফিসিয়াল সিল ও লোগো",
  provenance: "BCP_MASTER_BRAND_BOOK_V1",
  approvalStatus: "APPROVED_BRAND_ASSET",
};

export const HERO_MEDIA_ASSETS: Record<
  "ecosystem-overview" | "professional-courses" | "tax-vat-services" | "books-storefront",
  GovernedMediaAsset
> = {
  "ecosystem-overview": {
    assetId: "hero-slide-01-brand",
    component: "PromotionalHeroSlider",
    targetSlug: "ecosystem-overview",
    publicPath: "/assets/bcp/hero/hero-brand.webp",
    width: 1672,
    height: 941,
    altBn: "Business Compliance Partner — Courses, Services এবং Books এক প্ল্যাটফর্মে",
    provenance: "BCP_REMEDIATED_BRANDED_V83",
    approvalStatus: "APPROVED_BRAND_ASSET",
  },
  "professional-courses": {
    assetId: "hero-slide-02-courses",
    component: "PromotionalHeroSlider",
    targetSlug: "professional-courses",
    publicPath: "/assets/bcp/hero/hero-courses.webp",
    width: 1672,
    height: 941,
    altBn: "পেশাদার কর, ভ্যাট, ই-জিপি এবং কর্পোরেট প্রশিক্ষণ কোর্স সম্ভার",
    provenance: "BCP_SUPPLIED_BRANDED_V83",
    approvalStatus: "APPROVED_BRAND_ASSET",
  },
  "tax-vat-services": {
    assetId: "hero-slide-03-services",
    component: "PromotionalHeroSlider",
    targetSlug: "tax-vat-services",
    publicPath: "/assets/bcp/hero/hero-services.webp",
    width: 1672,
    height: 941,
    altBn: "আয়কর, ভ্যাট, Smart RJSC এবং ব্যবসায়িক লাইসেন্সিং পেশাদার সেবা",
    provenance: "BCP_SUPPLIED_BRANDED_V83",
    approvalStatus: "APPROVED_BRAND_ASSET",
  },
  "books-storefront": {
    assetId: "hero-slide-04-books",
    component: "PromotionalHeroSlider",
    targetSlug: "books-storefront",
    publicPath: "/assets/bcp/hero/hero-books.webp",
    width: 1672,
    height: 941,
    altBn: "ব্যবসা ও কমপ্লায়েন্স বিষয়ে নির্ভরযোগ্য বই ও প্রকাশনা",
    provenance: "BCP_SUPPLIED_BRANDED_V83",
    approvalStatus: "APPROVED_BRAND_ASSET",
  },
};

export const COURSE_CATEGORY_MEDIA: Record<string, GovernedMediaAsset> = {
  "income-tax": {
    assetId: "course-cat-income-tax",
    component: "CourseArtworkThumbnail",
    targetSlug: "income-tax",
    publicPath: "/assets/bcp/courses/course-income-tax.webp",
    width: 1672,
    height: 941,
    altBn: "আয়কর ও ট্যাক্স কমপ্লায়েন্স প্রশিক্ষণ বিভাগ",
    provenance: "BCP_REMEDIATED_BRANDED_V83",
    approvalStatus: "APPROVED_BRAND_ASSET",
  },
  "vat-and-mushak": {
    assetId: "course-cat-vat-mushak",
    component: "CourseArtworkThumbnail",
    targetSlug: "vat-and-mushak",
    publicPath: "/assets/bcp/courses/course-vat-and-mushak.webp",
    width: 1672,
    height: 941,
    altBn: "ভ্যাট ও মূসক ৯.১ ব্যবস্থাপনা প্রশিক্ষণ বিভাগ",
    provenance: "BCP_SUPPLIED_BRANDED_V83",
    approvalStatus: "APPROVED_BRAND_ASSET",
  },
  "import-export-customs": {
    assetId: "course-cat-import-export",
    component: "CourseArtworkThumbnail",
    targetSlug: "import-export-customs",
    publicPath: "/assets/bcp/courses/course-import-export-customs.webp",
    width: 960,
    height: 540,
    altBn: "আমদানি-রপ্তানি ও কাস্টমস ক্লিয়ারেন্স প্রশিক্ষণ বিভাগ",
    provenance: "BCP_FRAMED_WIDE_V83",
    approvalStatus: "APPROVED_BRAND_ASSET",
  },
  "egp-and-tender": {
    assetId: "course-cat-egp-tender",
    component: "CourseArtworkThumbnail",
    targetSlug: "egp-and-tender",
    publicPath: "/assets/bcp/courses/course-egp-and-tender.webp",
    width: 1672,
    height: 941,
    altBn: "BPPA e-GP ও সরকারি টেন্ডার প্রশিক্ষণ বিভাগ",
    provenance: "BCP_SUPPLIED_BRANDED_V83",
    approvalStatus: "APPROVED_BRAND_ASSET",
  },
  "digital-business-ecommerce": {
    assetId: "course-cat-ecommerce",
    component: "CourseArtworkThumbnail",
    targetSlug: "digital-business-ecommerce",
    publicPath: "/assets/bcp/courses/course-digital-business-ecommerce.webp",
    width: 1672,
    height: 941,
    altBn: "ডিজিটাল ব্যবসা ও ই-কমার্স কমপ্লায়েন্স প্রশিক্ষণ বিভাগ",
    provenance: "BCP_SUPPLIED_BRANDED_V83",
    approvalStatus: "APPROVED_BRAND_ASSET",
  },
  accounting: {
    assetId: "course-cat-accounting",
    component: "CourseArtworkThumbnail",
    targetSlug: "accounting",
    publicPath: "/assets/bcp/courses/course-accounting.webp",
    width: 960,
    height: 540,
    altBn: "অ্যাকাউন্টিং ও বুককিপিং প্রশিক্ষণ বিভাগ",
    provenance: "BCP_FRAMED_WIDE_V83",
    approvalStatus: "APPROVED_BRAND_ASSET",
  },
  "company-secretarial": {
    assetId: "course-cat-company-secretarial",
    component: "CourseArtworkThumbnail",
    targetSlug: "company-secretarial",
    publicPath: "/assets/bcp/courses/course-company-secretarial.webp",
    width: 1672,
    height: 941,
    altBn: "Smart RJSC ও কর্পোরেট আইন প্রশিক্ষণ বিভাগ",
    provenance: "BCP_REMEDIATED_BRANDED_V83",
    approvalStatus: "APPROVED_BRAND_ASSET",
  },
  "international-trade": {
    assetId: "course-cat-international-trade",
    component: "CourseArtworkThumbnail",
    targetSlug: "international-trade",
    publicPath: "/assets/bcp/courses/course-international-trade.webp",
    width: 960,
    height: 540,
    altBn: "আন্তর্জাতিক বাণিজ্য ও ট্রেড অপারেশন প্রশিক্ষণ বিভাগ",
    provenance: "BCP_FRAMED_WIDE_V83",
    approvalStatus: "APPROVED_BRAND_ASSET",
  },
  "hr-and-labour": {
    assetId: "course-cat-hr-labour",
    component: "CourseArtworkThumbnail",
    targetSlug: "hr-and-labour",
    publicPath: "/assets/bcp/courses/course-hr-and-labour.webp",
    width: 960,
    height: 540,
    altBn: "এইচআর ও বাংলাদেশ শ্রম আইন প্রশিক্ষণ বিভাগ",
    provenance: "BCP_FRAMED_WIDE_V83",
    approvalStatus: "APPROVED_BRAND_ASSET",
  },
  "entrepreneurship-sme": {
    assetId: "course-cat-entrepreneurship",
    component: "CourseArtworkThumbnail",
    targetSlug: "entrepreneurship-sme",
    publicPath: "/assets/bcp/courses/course-entrepreneurship-sme.webp",
    width: 960,
    height: 540,
    altBn: "উদ্যোক্তা উন্নয়ন ও ব্যবসায়িক ব্যবস্থাপনা প্রশিক্ষণ বিভাগ",
    provenance: "BCP_REMEDIATED_BRANDED_V83",
    approvalStatus: "APPROVED_BRAND_ASSET",
  },
};

export const DEFAULT_COURSE_MEDIA: GovernedMediaAsset = {
  assetId: "course-cat-default",
  component: "CourseArtworkThumbnail",
  targetSlug: "default",
  publicPath: "/assets/bcp/courses/course-default.webp",
  width: 960,
  height: 540,
  altBn: "Business Compliance Partner ব্যবহারিক প্রশিক্ষণ বিভাগ",
  provenance: "BCP_COMPOSED_CONCEPT_V82",
  approvalStatus: "APPROVED_STATIC",
};

export const SERVICE_TRACK_MEDIA: Record<
  "tax" | "vat" | "rjsc" | "licensing",
  GovernedMediaAsset
> = {
  tax: {
    assetId: "service-track-tax",
    component: "ServicesGatewaySection",
    targetSlug: "tax",
    publicPath: "/assets/bcp/services/service-tax.webp",
    width: 1672,
    height: 941,
    altBn: "ব্যক্তিগত ও কর্পোরেট আয়কর কমপ্লায়েন্স সেবা",
    provenance: "BCP_SUPPLIED_BRANDED_V83",
    approvalStatus: "APPROVED_BRAND_ASSET",
  },
  vat: {
    assetId: "service-track-vat",
    component: "ServicesGatewaySection",
    targetSlug: "vat",
    publicPath: "/assets/bcp/services/service-vat.webp",
    width: 1672,
    height: 941,
    altBn: "ভ্যাট (BIN) নিবন্ধন ও মাসিক মূসক ৯.১ সেবা",
    provenance: "BCP_SUPPLIED_BRANDED_V83",
    approvalStatus: "APPROVED_BRAND_ASSET",
  },
  rjsc: {
    assetId: "service-track-rjsc",
    component: "ServicesGatewaySection",
    targetSlug: "rjsc",
    publicPath: "/assets/bcp/services/service-rjsc.webp",
    width: 825,
    height: 221,
    altBn: "Smart RJSC কোম্পানি গঠন ও কর্পোরেট সেক্রেটারিয়াল সেবা",
    provenance: "BCP_SUPPLIED_BRANDED_V83",
    approvalStatus: "APPROVED_BRAND_ASSET",
  },
  licensing: {
    assetId: "service-track-licensing",
    component: "ServicesGatewaySection",
    targetSlug: "licensing",
    publicPath: "/assets/bcp/services/service-licensing.webp",
    width: 825,
    height: 221,
    altBn: "ট্রেড লাইসেন্স, DIFE, ফায়ার, IRC/ERC ও e-GP লাইসেন্সিং সহায়তা",
    provenance: "BCP_SUPPLIED_BRANDED_V83",
    approvalStatus: "APPROVED_BRAND_ASSET",
  },
};

export const SERVICE_EDITORIAL_KIT_MEDIA: GovernedMediaAsset = {
  assetId: "service-editorial-kit",
  component: "ServicesGatewaySection",
  targetSlug: "editorial-kit",
  publicPath: "/assets/bcp/services/service-editorial-kit.webp",
  width: 1024,
  height: 768,
  altBn: "কমপ্লায়েন্স, হিসাব ও কর্পোরেট ডকুমেন্টেশন ডেস্ক",
  provenance: "BCP_GENERATED_EDITORIAL_V82",
  approvalStatus: "APPROVED_STATIC",
};

const BOOK_COVER_NOTICE_BN =
  "প্রস্তাবিত কনসেপ্ট প্রচ্ছদ — আসন্ন সংস্করণের চূড়ান্ত তথ্য প্রকাশের সময় হালনাগাদ করা হবে।";

export const BOOK_COVER_MEDIA: Record<string, GovernedMediaAsset> = {
  "income-tax-practical-handbook-bangladesh": {
    assetId: "book-cover-01-tax",
    component: "BookCard",
    targetSlug: "income-tax-practical-handbook-bangladesh",
    publicPath:
      "/assets/bcp/books/book-income-tax-practical-handbook-bangladesh.webp",
    width: 1200,
    height: 1600,
    altBn: "বাংলাদেশ আয়কর ও রিটার্ন প্রস্তুতি: ব্যবহারিক হ্যান্ডবুক — কনসেপ্ট প্রচ্ছদ",
    provenance: "BCP_SUPPLIED_BRANDED_V83",
    approvalStatus: "CONCEPT_PREVIEW",
    commercialNoticeBn: BOOK_COVER_NOTICE_BN,
  },
  "vat-mushak-9-1-compliance-field-guide": {
    assetId: "book-cover-02-vat",
    component: "BookCard",
    targetSlug: "vat-mushak-9-1-compliance-field-guide",
    publicPath:
      "/assets/bcp/books/book-vat-mushak-9-1-compliance-field-guide.webp",
    width: 1200,
    height: 1600,
    altBn: "ভ্যাট ও মূসক ৯.১: সম্পূর্ণ কমপ্লায়েন্স ও রিটার্ন গাইড — কনসেপ্ট প্রচ্ছদ",
    provenance: "BCP_SUPPLIED_BRANDED_V83",
    approvalStatus: "CONCEPT_PREVIEW",
    commercialNoticeBn: BOOK_COVER_NOTICE_BN,
  },
  "egp-government-tender-preparation-manual": {
    assetId: "book-cover-03-egp",
    component: "BookCard",
    targetSlug: "egp-government-tender-preparation-manual",
    publicPath:
      "/assets/bcp/books/book-egp-government-tender-preparation-manual.webp",
    width: 1200,
    height: 1600,
    altBn: "ই-জিপি (e-GP) ও সরকারি টেন্ডার: দরপত্রদাতার ব্যবহারিক ম্যানুয়াল — কনসেপ্ট প্রচ্ছদ",
    provenance: "BCP_SUPPLIED_BRANDED_V83",
    approvalStatus: "CONCEPT_PREVIEW",
    commercialNoticeBn: BOOK_COVER_NOTICE_BN,
  },
  "smart-rjsc-company-formation-secretarial-guide": {
    assetId: "book-cover-04-rjsc",
    component: "BookCard",
    targetSlug: "smart-rjsc-company-formation-secretarial-guide",
    publicPath:
      "/assets/bcp/books/book-smart-rjsc-company-formation-secretarial-guide.webp",
    width: 1200,
    height: 1600,
    altBn: "Smart RJSC ও কোম্পানি সেক্রেটারিয়াল কমপ্লায়েন্স গাইড — কনসেপ্ট প্রচ্ছদ",
    provenance: "BCP_SUPPLIED_BRANDED_V83",
    approvalStatus: "CONCEPT_PREVIEW",
    commercialNoticeBn: BOOK_COVER_NOTICE_BN,
  },
  "practical-business-accounting-and-audit-readiness": {
    assetId: "book-cover-05-accounting",
    component: "BookCard",
    targetSlug: "practical-business-accounting-and-audit-readiness",
    publicPath:
      "/assets/bcp/books/book-practical-business-accounting-and-audit-readiness.webp",
    width: 1200,
    height: 1600,
    altBn: "ব্যবসায়িক অ্যাকাউন্টিং ও আর্থিক অডিট প্রস্তুতি — কনসেপ্ট প্রচ্ছদ",
    provenance: "BCP_SUPPLIED_BRANDED_V83",
    approvalStatus: "CONCEPT_PREVIEW",
    commercialNoticeBn: BOOK_COVER_NOTICE_BN,
  },
  "ecommerce-compliance-dbid-digital-business-guide": {
    assetId: "book-cover-06-ecommerce",
    component: "BookCard",
    targetSlug: "ecommerce-compliance-dbid-digital-business-guide",
    publicPath:
      "/assets/bcp/books/book-ecommerce-compliance-dbid-digital-business-guide.webp",
    width: 1200,
    height: 1600,
    altBn: "ই-কমার্স ব্যবসা: DBID নিবন্ধন, ভ্যাট ও অপারেশন কমপ্লায়েন্স — কনসেপ্ট প্রচ্ছদ",
    provenance: "BCP_SUPPLIED_BRANDED_V83",
    approvalStatus: "CONCEPT_PREVIEW",
    commercialNoticeBn: BOOK_COVER_NOTICE_BN,
  },
  "import-export-irc-erc-customs-clearance-guide": {
    assetId: "book-cover-07-customs",
    component: "BookCard",
    targetSlug: "import-export-irc-erc-customs-clearance-guide",
    publicPath:
      "/assets/bcp/books/book-import-export-irc-erc-customs-clearance-guide.webp",
    width: 1200,
    height: 1600,
    altBn: "আমদানি–রপ্তানি, IRC/ERC ও কাস্টমস ক্লিয়ারেন্স প্রাকটিস গাইড — কনসেপ্ট প্রচ্ছদ",
    provenance: "BCP_SUPPLIED_BRANDED_V83",
    approvalStatus: "CONCEPT_PREVIEW",
    commercialNoticeBn: BOOK_COVER_NOTICE_BN,
  },
  "bangladesh-labour-law-hr-dife-compliance-handbook": {
    assetId: "book-cover-08-labour",
    component: "BookCard",
    targetSlug: "bangladesh-labour-law-hr-dife-compliance-handbook",
    publicPath:
      "/assets/bcp/books/book-bangladesh-labour-law-hr-dife-compliance-handbook.webp",
    width: 1200,
    height: 1600,
    altBn: "বাংলাদেশ শ্রম আইন, DIFE ও HR কমপ্লায়েন্স হ্যান্ডবুক — কনসেপ্ট প্রচ্ছদ",
    provenance: "BCP_SUPPLIED_BRANDED_V83",
    approvalStatus: "CONCEPT_PREVIEW",
    commercialNoticeBn: BOOK_COVER_NOTICE_BN,
  },
  "bangladesh-business-licensing-and-startup-roadmap-book": {
    assetId: "book-cover-09-licensing",
    component: "BookCard",
    targetSlug: "bangladesh-business-licensing-and-startup-roadmap-book",
    publicPath:
      "/assets/bcp/books/book-bangladesh-business-licensing-and-startup-roadmap-book.webp",
    width: 1200,
    height: 1600,
    altBn: "ব্যবসা শুরু ও লাইসেন্সিং রোডম্যাপ: উদ্যোক্তা কমপ্লায়েন্স ডাইজেস্ট — কনসেপ্ট প্রচ্ছদ",
    provenance: "BCP_SUPPLIED_BRANDED_V83",
    approvalStatus: "CONCEPT_PREVIEW",
    commercialNoticeBn: BOOK_COVER_NOTICE_BN,
  },
  "corporate-tax-audit-dispute-resolution-handbook": {
    assetId: "book-cover-10-tax-audit",
    component: "BookCard",
    targetSlug: "corporate-tax-audit-dispute-resolution-handbook",
    publicPath:
      "/assets/bcp/books/book-corporate-tax-audit-dispute-resolution-handbook.webp",
    width: 1200,
    height: 1600,
    altBn: "কর্পোরেট ট্যাক্স অডিট ও শুনানি প্রস্তুতি: ব্যবহারিক নির্দেশিকা — কনসেপ্ট প্রচ্ছদ",
    provenance: "BCP_SUPPLIED_BRANDED_V83",
    approvalStatus: "CONCEPT_PREVIEW",
    commercialNoticeBn: BOOK_COVER_NOTICE_BN,
  },
  "internal-compliance-sop-corporate-governance-manual": {
    assetId: "book-cover-11-sop",
    component: "BookCard",
    targetSlug: "internal-compliance-sop-corporate-governance-manual",
    publicPath:
      "/assets/bcp/books/book-internal-compliance-sop-corporate-governance-manual.webp",
    width: 1200,
    height: 1600,
    altBn: "অভ্যন্তরীণ কমপ্লায়েন্স ও এসওপি (SOP): কর্পোরেট গভর্নেন্স ম্যানুয়াল — কনসেপ্ট প্রচ্ছদ",
    provenance: "BCP_SUPPLIED_BRANDED_V83",
    approvalStatus: "CONCEPT_PREVIEW",
    commercialNoticeBn: BOOK_COVER_NOTICE_BN,
  },
};

export const DEFAULT_BOOK_COVER_MEDIA: GovernedMediaAsset = {
  assetId: "book-cover-default",
  component: "BookCard",
  targetSlug: "default",
  publicPath: "/assets/bcp/books/book-default.webp",
  width: 720,
  height: 960,
  altBn: "Business Compliance Partner প্রস্তাবিত প্রকাশনা কনসেপ্ট প্রচ্ছদ",
  provenance: "BCP_COMPOSED_CONCEPT_V82",
  approvalStatus: "CONCEPT_PREVIEW",
  commercialNoticeBn: BOOK_COVER_NOTICE_BN,
};

export const INSTITUTIONAL_POSTER_MEDIA: GovernedMediaAsset = {
  assetId: "institutional-poster-v83",
  component: "InstitutionalProfileSection",
  targetSlug: "bcp-institutional-poster",
  publicPath: "/assets/bcp/institutional/bcp-institutional-poster.webp",
  width: 1122,
  height: 1402,
  altBn: "Business Compliance Partner প্রাতিষ্ঠানিক পরিচয় পোস্টার — Courses, Services, Books",
  provenance: "BCP_SUPPLIED_BRANDED_V83",
  approvalStatus: "APPROVED_BRAND_ASSET",
};

export const INSTITUTIONAL_STUDIO_MEDIA: GovernedMediaAsset = {
  assetId: "institutional-studio-editorial",
  component: "InstitutionalProfileSection",
  targetSlug: "bcp-studio-editorial",
  publicPath: "/assets/bcp/institutional/bcp-studio-editorial.webp",
  width: 1024,
  height: 768,
  altBn: "Business Compliance Partner প্রাতিষ্ঠানিক পরামর্শ ও প্রশিক্ষণ কক্ষ",
  provenance: "BCP_GENERATED_EDITORIAL_V82",
  approvalStatus: "APPROVED_STATIC",
};

export const CUSTOMER_SUPPORT_MEDIA: GovernedMediaAsset = {
  assetId: "support-contact-banner",
  component: "ContactPage",
  targetSlug: "customer-support",
  publicPath: "/assets/bcp/support/customer-support.webp",
  width: 825,
  height: 221,
  altBn: "Business Compliance Partner কাস্টমার সাপোর্ট ও পরামর্শ ডেস্ক",
  provenance: "BCP_SUPPLIED_BRANDED_V83",
  approvalStatus: "APPROVED_BRAND_ASSET",
};

export const EMPTY_STATE_MEDIA: GovernedMediaAsset = {
  assetId: "empty-catalogue-illustration",
  component: "EmptyState",
  targetSlug: "empty-catalogue",
  publicPath: "/assets/bcp/empty-states/empty-catalogue.webp",
  width: 640,
  height: 360,
  altBn: "নির্বাচিত অনুসন্ধান অনুযায়ী কোনো তথ্য পাওয়া যায়নি",
  provenance: "BCP_COMPOSED_CONCEPT_V82",
  approvalStatus: "APPROVED_STATIC",
};

export const EMPTY_STATE_MEDIA_BY_VARIANT: Record<
  EmptyStateVariant,
  GovernedMediaAsset
> = {
  courses: {
    assetId: "empty-state-courses",
    component: "EmptyState",
    targetSlug: "courses-empty-state",
    publicPath: "/assets/bcp/empty-states/courses-empty-state.webp",
    width: 960,
    height: 540,
    altBn: "নির্বাচিত ফিল্টার অনুযায়ী কোনো প্রশিক্ষণ কোর্স পাওয়া যায়নি",
    provenance: "BCP_SUPPLIED_BRANDED_V83",
    approvalStatus: "APPROVED_BRAND_ASSET",
  },
  services: {
    assetId: "empty-state-services",
    component: "EmptyState",
    targetSlug: "services-empty-state",
    publicPath: "/assets/bcp/empty-states/services-empty-state.webp",
    width: 960,
    height: 540,
    altBn: "নির্বাচিত বিভাগে কোনো পেশাদার সেবা পাওয়া যায়নি",
    provenance: "BCP_SUPPLIED_BRANDED_V83",
    approvalStatus: "APPROVED_BRAND_ASSET",
  },
  books: {
    assetId: "empty-state-books",
    component: "EmptyState",
    targetSlug: "books-empty-state",
    publicPath: "/assets/bcp/empty-states/books-empty-state.webp",
    width: 960,
    height: 540,
    altBn: "নির্বাচিত অনুসন্ধানে কোনো বই বা প্রকাশনা পাওয়া যায়নি",
    provenance: "BCP_SUPPLIED_BRANDED_V83",
    approvalStatus: "APPROVED_BRAND_ASSET",
  },
  generic: EMPTY_STATE_MEDIA,
};

/**
 * Deterministic fallback hierarchy:
 * 1. Specific offering / category asset
 * 2. Track / category fallback
 * 3. Pillar default fallback
 */
export function resolveCourseThumbnailAsset(
  categorySlug: string,
  offeringSlug?: string,
): GovernedMediaAsset {
  if (offeringSlug && COURSE_CATEGORY_MEDIA[offeringSlug]) {
    return COURSE_CATEGORY_MEDIA[offeringSlug]!;
  }
  return COURSE_CATEGORY_MEDIA[categorySlug] ?? DEFAULT_COURSE_MEDIA;
}

/**
 * Safe exact book-slug resolution:
 * An unknown or newly added book slug NEVER inherits another titled book's cover.
 */
export function resolveBookCoverAsset(
  bookSlug: string,
  categorySlug?: string,
): GovernedMediaAsset {
  void categorySlug;
  return BOOK_COVER_MEDIA[bookSlug] ?? DEFAULT_BOOK_COVER_MEDIA;
}

export function resolveHeroSlideAsset(
  slideId: keyof typeof HERO_MEDIA_ASSETS,
): GovernedMediaAsset {
  return HERO_MEDIA_ASSETS[slideId];
}

export function resolveServiceTrackAsset(
  trackId: keyof typeof SERVICE_TRACK_MEDIA,
): GovernedMediaAsset {
  return SERVICE_TRACK_MEDIA[trackId];
}

export function resolveInstitutionalAsset(
  slideId: "foundation" | "standards" = "foundation",
): GovernedMediaAsset {
  return slideId === "foundation"
    ? INSTITUTIONAL_POSTER_MEDIA
    : INSTITUTIONAL_STUDIO_MEDIA;
}

export function resolveSupportBannerAsset(): GovernedMediaAsset {
  return CUSTOMER_SUPPORT_MEDIA;
}

export function resolveEmptyStateAsset(
  variant: EmptyStateVariant = "generic",
): GovernedMediaAsset {
  return EMPTY_STATE_MEDIA_BY_VARIANT[variant] ?? EMPTY_STATE_MEDIA;
}

export function listAllGovernedMediaAssets(): GovernedMediaAsset[] {
  return [
    MASTER_BRAND_ASSET,
    ...Object.values(HERO_MEDIA_ASSETS),
    ...Object.values(COURSE_CATEGORY_MEDIA),
    DEFAULT_COURSE_MEDIA,
    ...Object.values(SERVICE_TRACK_MEDIA),
    SERVICE_EDITORIAL_KIT_MEDIA,
    ...Object.values(BOOK_COVER_MEDIA),
    DEFAULT_BOOK_COVER_MEDIA,
    INSTITUTIONAL_POSTER_MEDIA,
    INSTITUTIONAL_STUDIO_MEDIA,
    CUSTOMER_SUPPORT_MEDIA,
    EMPTY_STATE_MEDIA_BY_VARIANT.courses,
    EMPTY_STATE_MEDIA_BY_VARIANT.services,
    EMPTY_STATE_MEDIA_BY_VARIANT.books,
    EMPTY_STATE_MEDIA_BY_VARIANT.generic,
  ];
}
