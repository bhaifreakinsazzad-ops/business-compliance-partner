import type {
  PublicBookCategoryDTO,
  PublicBookCoverPalette,
  PublicBookPreview,
} from "@/types/domain";
import { fromPaisa } from "@/lib/commerce/payments";
import { matchesSearchQuery } from "@/lib/content/helpers";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { isBooksSchemaReady } from "@/lib/db/schema-ready";

export const BOOK_AVAILABILITY_BADGE_BN = "প্রকাশনা আসন্ন";
export const BOOK_PRICING_NOTICE_BN =
  "প্রস্তাবিত প্রকাশনা প্রিভিউ — মূল্য, সংস্করণ ও প্রকাশের তারিখ ক্লায়েন্ট অনুমোদনের পর নির্ধারিত হবে।";

const RAW_BOOK_CATEGORIES: Omit<PublicBookCategoryDTO, "previewCount">[] = [
  {
    slug: "tax",
    nameBn: "আয়কর ও ট্যাক্স",
    nameEn: "Income Tax",
    shortDescBn:
      "ব্যক্তি ও কর্পোরেট আয়কর রিটার্ন, টিডিএস ও আইনি কমপ্লায়েন্স বিষয়ক ব্যবহারিক প্রকাশনা।",
    sortOrder: 1,
  },
  {
    slug: "vat-mushak",
    nameBn: "ভ্যাট ও মূসক",
    nameEn: "VAT & Mushak",
    shortDescBn:
      "মূসক ৯.১, ক্রয়-বিক্রয় রেজিস্টার, রিবেট ও ভ্যাট অডিট প্রস্তুতিমূলক নির্দেশিকা।",
    sortOrder: 2,
  },
  {
    slug: "egp-tender",
    nameBn: "e-GP ও সরকারি টেন্ডার",
    nameEn: "e-GP & Procurement",
    shortDescBn:
      "BPPA ই-জিপি নিবন্ধন, দরপত্র প্রস্তুতি ও কমপ্লায়েন্স নথিপত্র বিষয়ক হ্যান্ডবুক।",
    sortOrder: 3,
  },
  {
    slug: "rjsc-corporate",
    nameBn: "RJSC ও কর্পোরেট আইন",
    nameEn: "RJSC & Company Law",
    shortDescBn:
      "প্রাইভেট লিমিটেড কোম্পানি গঠন, শেয়ার ট্রান্সফার, AGM ও রিটার্ন ফাইলিং গাইড।",
    sortOrder: 4,
  },
  {
    slug: "accounting",
    nameBn: "অ্যাকাউন্টিং ও আর্থিক হিসাব",
    nameEn: "Accounting & Reporting",
    shortDescBn:
      "এসএমই হিসাবরক্ষণ, ফিন্যান্সিয়াল স্টেটমেন্ট ও অডিট প্রস্তুতি বিষয়ক ব্যবহারিক বই।",
    sortOrder: 5,
  },
  {
    slug: "ecommerce",
    nameBn: "ই-কমার্স ও ডিজিটাল ব্যবসা",
    nameEn: "E-commerce & Digital Business",
    shortDescBn:
      "ডিজিটাল বিজনেস আইডি (DBID), অনলাইন ভ্যাট, পেমেন্ট ও ব্যবসা পরিচালনা নির্দেশিকা।",
    sortOrder: 6,
  },
  {
    slug: "customs",
    nameBn: "কাস্টমস ও আমদানি-রপ্তানি",
    nameEn: "Customs, Import & Export",
    shortDescBn:
      "IRC/ERC নিবন্ধন, HS Code, এলসি ডকুমেন্টেশন ও বন্দর ক্লিয়ারেন্স প্রাকটিস গাইড।",
    sortOrder: 7,
  },
  {
    slug: "labour-law",
    nameBn: "শ্রম আইন ও HR কমপ্লায়েন্স",
    nameEn: "Labour Law & HR Compliance",
    shortDescBn:
      "বাংলাদেশ শ্রম আইন, ফ্যাক্টরি কমপ্লায়েন্স, DIFE ও HR নথিপত্র নির্দেশিকা।",
    sortOrder: 8,
  },
  {
    slug: "business-management",
    nameBn: "ব্যবসা পরিচালনা ও লাইসেন্সিং",
    nameEn: "Business Management & Licensing",
    shortDescBn:
      "ট্রেড লাইসেন্স থেকে ব্যবসা সম্প্রসারণ পর্যন্ত পূর্ণাঙ্গ উদ্যোক্তা হ্যান্ডবুক।",
    sortOrder: 9,
  },
  {
    slug: "corporate-tax-audit",
    nameBn: "কর্পোরেট ট্যাক্স অডিট",
    nameEn: "Corporate Tax Audit",
    shortDescBn:
      "কর্পোরেট কর অডিট নোটিশ, শুনানির প্রস্তুতি, আপিল ও আইনি অ্যাসেসমেন্ট সহায়িকা।",
    sortOrder: 10,
  },
  {
    slug: "internal-compliance-procedures",
    nameBn: "অভ্যন্তরীণ কমপ্লায়েন্স ও এসওপি",
    nameEn: "Internal Compliance Procedures",
    shortDescBn:
      "প্রতিষ্ঠানিক এসওপি (SOP), ইন্টারনাল কন্ট্রোল, অডিট ট্রেইল ও ঝুঁকি ব্যবস্থাপনা ম্যানুয়াল।",
    sortOrder: 11,
  },
];

export const BOOK_PREVIEW_CATALOG: PublicBookPreview[] = [
  {
    id: "book-preview-tax-handbook",
    slug: "income-tax-practical-handbook-bangladesh",
    titleBn: "বাংলাদেশ আয়কর ও রিটার্ন প্রস্তুতি: ব্যবহারিক হ্যান্ডবুক",
    titleEn: "Bangladesh Income Tax & Return Preparation: Practical Handbook",
    subtitleBn:
      "ব্যক্তিগত, ফার্ম ও কোম্পানি আয়কর, উৎস কর (TDS) ও অ্যাসেসমেন্ট প্রস্তুতির ধাপে ধাপে গাইড",
    categorySlug: "tax",
    categoryNameBn: "আয়কর ও ট্যাক্স",
    categoryNameEn: "Income Tax",
    summaryBn:
      "উদ্যোক্তা, অ্যাকাউন্ট্যান্ট ও করদাতাদের জন্য আয়কর আইন ২০২৩ অনুযায়ী রিটার্ন ফাইলিং, TDS এবং নথিপত্র সংরক্ষণের প্রস্তাবিত ব্যবহারিক সংকলন।",
    audienceBn:
      "ক্ষুদ্র ও মাঝারি ব্যবসায়ী, কর্পোরেট ফিন্যান্স টিম, কর পেশাজীবী এবং নতুন করদাতা।",
    topicsBn: [
      "ব্যক্তিগত ও কোম্পানি আয়কর রিটার্ন প্রস্তুতির ধাপসমূহ",
      "উৎস কর কর্তন (TDS) ও চালান সমন্বয়ের ব্যবহারিক উদাহরণ",
      "ব্যবসায়িক খরচ অনুমোদন ও আর্থিক বিবরণী মিলিয়ে দেখার কৌশল",
      "ট্যাক্স নোটিশ ও অডিট শুনানির জন্য প্রাথমিক নথিপত্র চেকলিস্ট",
    ],
    editionNoteBn: BOOK_PRICING_NOTICE_BN,
    availabilityState: "UPCOMING_PREVIEW",
    featured: true,
    coverPalette: {
      spineHex: "#081838",
      coverHex: "#152b54",
      accentHex: "#c59028",
      textHex: "#f8f8f8",
    },
    relatedCourseCategorySlug: "income-tax",
    relatedServiceCategorySlug: "income-tax-solutions",
    relatedLicensingCategorySlug: "general-business-registration",
  },
  {
    id: "book-preview-vat-mushak-guide",
    slug: "vat-mushak-9-1-compliance-field-guide",
    titleBn: "ভ্যাট ও মূসক ৯.১: সম্পূর্ণ কমপ্লায়েন্স ও রিটার্ন গাইড",
    titleEn: "VAT & Mushak 9.1: Complete Compliance & Return Guide",
    subtitleBn:
      "BIN নিবন্ধন, মূসক ৬.১–৬.৩ রেজিস্টার, রেয়াত ও মাসিক অনলাইন রিটার্ন দাখিলের সহজ নির্দেশিকা",
    categorySlug: "vat-mushak",
    categoryNameBn: "ভ্যাট ও মূসক",
    categoryNameEn: "VAT & Mushak",
    summaryBn:
      "ব্যবসা প্রতিষ্ঠানের দৈনন্দিন ভ্যাট হিসাব, ইনপুট-আউটপুট ট্যাক্স ক্রেডিট ও মূসক অডিট মোকাবিলায় প্রস্তাবিত রেফারেন্স বই।",
    audienceBn:
      "ভ্যাট কর্মকর্তা, ব্যবসায়ী, ই-কমার্স উদ্যোক্তা এবং কমপ্লায়েন্স প্রশিক্ষণার্থী।",
    topicsBn: [
      "মূসক নিবন্ধন (BIN) ও টার্নওভার ট্যাক্সের কাঠামো",
      "ক্রয় ও বিক্রয় হিসাব পুস্তক (মূসক ৬.১, ৬.২ ও ৬.২.১) সংরক্ষণ",
      "উপকরণ কর রেয়াত গ্রহণের শর্ত ও ভ্যাট ডেবিট/ক্রেডিট নোট",
      "মাসিক মূসক ৯.১ রিটার্ন এবং VDS সার্টিফিকেট সমন্বয়",
    ],
    editionNoteBn: BOOK_PRICING_NOTICE_BN,
    availabilityState: "UPCOMING_PREVIEW",
    featured: true,
    coverPalette: {
      spineHex: "#51406f",
      coverHex: "#3f315a",
      accentHex: "#dfb15b",
      textHex: "#ffffff",
    },
    relatedCourseCategorySlug: "vat-and-mushak",
    relatedServiceCategorySlug: "vat-mushak-solutions",
    relatedLicensingCategorySlug: "general-business-registration",
  },
  {
    id: "book-preview-egp-tender-manual",
    slug: "egp-government-tender-preparation-manual",
    titleBn: "ই-জিপি (e-GP) ও সরকারি টেন্ডার: দরপত্রদাতার ব্যবহারিক ম্যানুয়াল",
    titleEn: "e-GP & Government Procurement: Practical Bidder Manual",
    subtitleBn:
      "BPPA পোর্টালে নিবন্ধন, ডকুমেন্ট ভল্ট, টেন্ডার সিকিউরিটি ও দরপত্র দাখিলের নির্ভুল প্রক্রিয়া",
    categorySlug: "egp-tender",
    categoryNameBn: "e-GP ও সরকারি টেন্ডার",
    categoryNameEn: "e-GP & Procurement",
    summaryBn:
      "সরকারি ক্রয় প্রক্রিয়া (PPR/PPA) অনুসারে দরপত্রদাতাদের প্রোফাইল তৈরি, BoQ যাচাই এবং নন-রেসপনসিভ হওয়া এড়ানোর প্রস্তাবিত ম্যানুয়াল।",
    audienceBn:
      "ঠিকাদার, সরবরাহকারী প্রতিষ্ঠান, প্রকিউরমেন্ট এক্সিকিউটিভ ও নতুন টেন্ডার অংশগ্রহণকারী।",
    topicsBn: [
      "ই-জিপি পোর্টালে প্রতিষ্ঠান নিবন্ধন ও বার্ষিক নবায়ন",
      "টেন্ডার ডকুমেন্ট বিশ্লেষণ, স্পেসিফিকেশন ও যোগ্যতার মানদণ্ড",
      "টেন্ডার সিকিউরিটি, পারফরম্যান্স গ্যারান্টি ও ব্যাংক ডকুমেন্ট",
      "দরপত্র মূল্যায়নে সাধারণ ভুল এড়ানোর চেকলিস্ট",
    ],
    editionNoteBn: BOOK_PRICING_NOTICE_BN,
    availabilityState: "UPCOMING_PREVIEW",
    featured: true,
    coverPalette: {
      spineHex: "#081838",
      coverHex: "#243b67",
      accentHex: "#c59028",
      textHex: "#f8f8f8",
    },
    relatedCourseCategorySlug: "egp-and-tender",
    relatedServiceCategorySlug: "egp-government-tender",
  },
  {
    id: "book-preview-rjsc-corporate-guide",
    slug: "smart-rjsc-company-formation-secretarial-guide",
    titleBn: "Smart RJSC ও কোম্পানি সেক্রেটারিয়াল কমপ্লায়েন্স গাইড",
    titleEn: "Smart RJSC & Company Secretarial Compliance Guide",
    subtitleBn:
      "নাম ছাড়পত্র, MoA/AoA খসড়া, শেয়ার বরাদ্দ, ফরম-১২ ও বার্ষিক রিটার্ন ফাইলিংয়ের ব্যবহারিক সহায়িকা",
    categorySlug: "rjsc-corporate",
    categoryNameBn: "RJSC ও কর্পোরেট আইন",
    categoryNameEn: "RJSC & Company Law",
    summaryBn:
      "প্রাইভেট লিমিটেড কোম্পানি নিবন্ধন থেকে শুরু করে বোর্ড রেজুলেশন, শেয়ার হস্তান্তর ও বিধিবদ্ধ রেজিস্টার পরিচালনার প্রস্তাবিত প্রকাশনা।",
    audienceBn:
      "কোম্পানি পরিচালক, কোম্পানি সেক্রেটারি, কর্পোরেট লিগ্যাল টিম ও স্টার্টআপ প্রতিষ্ঠাতা।",
    topicsBn: [
      "প্রাইভেট লিমিটেড, ওয়ান পারসন কোম্পানি (OPC) ও অংশীদারিত্ব গঠন",
      "Smart RJSC পোর্টালে নামের ছাড়পত্র ও নিবন্ধন ধাপ",
      "Schedule X, Form XII এবং বার্ষিক রিটার্ন জমা",
      "শেয়ার ট্রান্সফার, পরিচালক পরিবর্তন ও বোর্ড সভার কার্যবিবরণী",
    ],
    editionNoteBn: BOOK_PRICING_NOTICE_BN,
    availabilityState: "UPCOMING_PREVIEW",
    featured: true,
    coverPalette: {
      spineHex: "#2c2246",
      coverHex: "#51406f",
      accentHex: "#c59028",
      textHex: "#f8f8f8",
    },
    relatedCourseCategorySlug: "company-secretarial",
    relatedServiceCategorySlug: "company-secretarial-compliance",
    relatedLicensingCategorySlug: "general-business-registration",
  },
  {
    id: "book-preview-accounting-sme",
    slug: "practical-business-accounting-and-audit-readiness",
    titleBn: "ব্যবসায়িক অ্যাকাউন্টিং ও আর্থিক অডিট প্রস্তুতি",
    titleEn: "Practical Business Accounting & Audit Readiness",
    subtitleBn:
      "এসএমই বুককিপিং, ভাউচার নিয়ন্ত্রণ, ব্যাংক রিকনসিলিয়েশন ও আর্থিক বিবরণী প্রস্তুতের সহজ বই",
    categorySlug: "accounting",
    categoryNameBn: "অ্যাকাউন্টিং ও আর্থিক হিসাব",
    categoryNameEn: "Accounting & Reporting",
    summaryBn:
      "ট্যাক্স, ভ্যাট ও ব্যাংক ঋণের জন্য স্বচ্ছ এবং গ্রহণযোগ্য আর্থিক হিসাব সংরক্ষণের বাস্তবমুখী প্রস্তাবিত প্রকাশনা।",
    audienceBn:
      "এসএমই ব্যবসায়ী, জুনিয়র-মিড অ্যাকাউন্ট্যান্ট এবং ফিন্যান্স ম্যানেজার।",
    topicsBn: [
      "দৈনন্দিন বুককিপিং ও চার্ট অব অ্যাকাউন্টস সাজানো",
      "ভাউচার, ইনভয়েস ও ব্যাংক রিকনসিলিয়েশন নিয়মাবলি",
      "লাভ-ক্ষতি হিসাব, ব্যালেন্স শিট ও ক্যাশফ্লো বিশ্লেষণ",
      "বার্ষিক স্ট্যাচুটরি অডিটের আগে অভ্যন্তরীণ প্রস্তুতি",
    ],
    editionNoteBn: BOOK_PRICING_NOTICE_BN,
    availabilityState: "UPCOMING_PREVIEW",
    featured: true,
    coverPalette: {
      spineHex: "#0e2956",
      coverHex: "#1c3f77",
      accentHex: "#dfb15b",
      textHex: "#ffffff",
    },
    relatedCourseCategorySlug: "accounting",
    relatedServiceCategorySlug: "accounting-financial-management",
  },
  {
    id: "book-preview-ecommerce-blueprint",
    slug: "ecommerce-compliance-dbid-digital-business-guide",
    titleBn: "ই-কমার্স ব্যবসা: DBID নিবন্ধন, ভ্যাট ও অপারেশন কমপ্লায়েন্স",
    titleEn: "E-commerce Business: DBID Registration, VAT & Operations Compliance",
    subtitleBn:
      "বাংলাদেশে বৈধভাবে অনলাইন ও এফ-কমার্স ব্যবসা পরিচালনার নীতিমালা ও লাইসেন্সিং নির্দেশিকা",
    categorySlug: "ecommerce",
    categoryNameBn: "ই-কমার্স ও ডিজিটাল ব্যবসা",
    categoryNameEn: "E-commerce & Digital Business",
    summaryBn:
      "ডিজিটাল বিজনেস আইডেন্টিফিকেশন (DBID), ট্রেড লাইসেন্স, পেমেন্ট গেটওয়ে ডকুমেন্ট ও অনলাইন বিক্রি সংক্রান্ত ট্যাক্স-ভ্যাট নীতিমালার প্রস্তাবিত সংকলন।",
    audienceBn:
      "ই-কমার্স ও এফ-কমার্স উদ্যোক্তা, ডিজিটাল মার্কেটিং এজেন্সি ও অনলাইন ব্র্যান্ড প্রতিষ্ঠাতা।",
    topicsBn: [
      "ডিজিটাল বিজনেস আইডি (DBID) ও ই-কমার্স ট্রেড লাইসেন্স প্রক্রিয়া",
      "অনলাইন পেমেন্ট গেটওয়ে ও মার্চেন্ট অ্যাকাউন্ট নথিপত্র",
      "অনলাইন পণ্যে ভ্যাট, ইনভয়েসিং ও কুরিয়ার সিওডি হিসাব",
      "রিটার্ন-রিফান্ড নীতিমালা ও ভোক্তা অধিকার কমপ্লায়েন্স",
    ],
    editionNoteBn: BOOK_PRICING_NOTICE_BN,
    availabilityState: "UPCOMING_PREVIEW",
    featured: true,
    coverPalette: {
      spineHex: "#51406f",
      coverHex: "#644f89",
      accentHex: "#e9c46a",
      textHex: "#ffffff",
    },
    relatedCourseCategorySlug: "digital-business-ecommerce",
    relatedServiceCategorySlug: "digital-business-setup",
    relatedLicensingCategorySlug: "general-business-registration",
  },
  {
    id: "book-preview-customs-import-export",
    slug: "import-export-irc-erc-customs-clearance-guide",
    titleBn: "আমদানি–রপ্তানি, IRC/ERC ও কাস্টমস ক্লিয়ারেন্স প্রাকটিস গাইড",
    titleEn: "Import–Export, IRC/ERC & Customs Clearance Practice Guide",
    subtitleBn:
      "আমদানি-রপ্তানি নিবন্ধন সনদ, HS Code নির্ধারণ, L/C ডকুমেন্ট এবং শুল্কায়ন প্রক্রিয়া",
    categorySlug: "customs",
    categoryNameBn: "কাস্টমস ও আমদানি-রপ্তানি",
    categoryNameEn: "Customs, Import & Export",
    summaryBn:
      "নতুন আমদানিকারক ও রপ্তানিকারকদের জন্য সিসিআইঅ্যান্ডই (CCIE) নিবন্ধন ও কাস্টমস কমপ্লায়েন্সের ধাপে ধাপে প্রস্তাবিত গাইডবুক।",
    audienceBn:
      "আমদানিকারক, রপ্তানিকারক, কমার্শিয়াল এক্সিকিউটিভ ও সাপ্লাই চেইন পেশাজীবী।",
    topicsBn: [
      "IRC ও ERC নিবন্ধনের পূর্বশর্ত ও চেম্বার অব কমার্স সদস্যপদ",
      "HS Code, প্রোফর্মা ইনভয়েস ও L/C ডকুমেন্ট যাচাই",
      "ASYCUDA কাস্টমস অ্যাসেসমেন্ট ও শুল্ক-ভ্যাট হিসাব",
      "রপ্তানি প্রণোদনা ও ক্লিয়ারিং ডকুমেন্ট সংরক্ষণ",
    ],
    editionNoteBn: BOOK_PRICING_NOTICE_BN,
    availabilityState: "UPCOMING_PREVIEW",
    featured: false,
    coverPalette: {
      spineHex: "#081838",
      coverHex: "#152b54",
      accentHex: "#c59028",
      textHex: "#f8f8f8",
    },
    relatedCourseCategorySlug: "import-export-customs",
    relatedServiceCategorySlug: "customs-international-trade",
    relatedLicensingCategorySlug: "import-export-licences",
  },
  {
    id: "book-preview-labour-hr-compliance",
    slug: "bangladesh-labour-law-hr-dife-compliance-handbook",
    titleBn: "বাংলাদেশ শ্রম আইন, DIFE ও HR কমপ্লায়েন্স হ্যান্ডবুক",
    titleEn: "Bangladesh Labour Law, DIFE & HR Compliance Handbook",
    subtitleBn:
      "নিয়োগপত্র, সার্ভিস বুক, ছুটি, মজুরি রেজিস্টার ও কারখানা লাইসেন্সিংয়ের ব্যবহারিক নির্দেশিকা",
    categorySlug: "labour-law",
    categoryNameBn: "শ্রম আইন ও HR কমপ্লায়েন্স",
    categoryNameEn: "Labour Law & HR Compliance",
    summaryBn:
      "প্রতিষ্ঠান ও কারখানায় বাংলাদেশ শ্রম আইন অনুযায়ী মানবসম্পদ নথিপত্র এবং কলকারখানা ও প্রতিষ্ঠান পরিদর্শন অধিদপ্তরের (DIFE) কমপ্লায়েন্স রক্ষার প্রস্তাবিত বই।",
    audienceBn:
      "HR ম্যানেজার, কমপ্লায়েন্স অফিসার, কারখানা ও অফিস প্রশাসক।",
    topicsBn: [
      "নিয়োগপত্র, পরিচয়পত্র ও কর্মসংস্থান নথিপত্রের মানদণ্ড",
      "বেতন, ওভারটাইম, ছুটি ও সার্ভিস বেনিফিট হিসাব",
      "DIFE LIMA লেবার লাইসেন্স ও অডিট চেকলিস্ট",
      "কর্মক্ষেত্রের নিরাপত্তা, ফায়ার ও ফ্যাক্টরি নিয়মাবলি",
    ],
    editionNoteBn: BOOK_PRICING_NOTICE_BN,
    availabilityState: "UPCOMING_PREVIEW",
    featured: false,
    coverPalette: {
      spineHex: "#3f315a",
      coverHex: "#51406f",
      accentHex: "#c59028",
      textHex: "#ffffff",
    },
    relatedCourseCategorySlug: "hr-and-labour",
    relatedServiceCategorySlug: "hr-labour-compliance",
    relatedLicensingCategorySlug: "factory-labour-registration",
  },
  {
    id: "book-preview-business-licensing-handbook",
    slug: "bangladesh-business-licensing-and-startup-roadmap-book",
    titleBn: "ব্যবসা শুরু ও লাইসেন্সিং রোডম্যাপ: উদ্যোক্তা কমপ্লায়েন্স ডাইজেস্ট",
    titleEn: "Business Startup & Licensing Roadmap: Entrepreneur Compliance Digest",
    subtitleBn:
      "ট্রেড লাইসেন্স, ফায়ার, পরিবেশ ছাড়পত্র, BSTI এবং নিয়মিত ব্যবসা নবায়নের সমন্বিত সংকলন",
    categorySlug: "business-management",
    categoryNameBn: "ব্যবসা পরিচালনা ও লাইসেন্সিং",
    categoryNameEn: "Business Management & Licensing",
    summaryBn:
      "নতুন ব্যবসা শুরু থেকে সঠিক লাইসেন্স নির্বাচন, সরকারি কর্তৃপক্ষের প্রক্রিয়া বোঝা ও বার্ষিক কমপ্লায়েন্স ক্যালেন্ডার পরিচালনার প্রস্তাবিত হ্যান্ডবুক।",
    audienceBn:
      "নতুন উদ্যোক্তা, এসএমই মালিক এবং বিজনেস কনসালটেন্ট।",
    topicsBn: [
      "সঠিক ব্যবসায়িক কাঠামো নির্বাচন (প্রোপ্রাইটরশিপ বনাম লিমিটেড)",
      "সিটি কর্পোরেশন ট্রেড লাইসেন্স, ফায়ার ও পরিবেশ ছাড়পত্র",
      "বার্ষিক লাইসেন্স নবায়ন ও কমপ্লায়েন্স ক্যালেন্ডার পরিকল্পনা",
      "ব্যবসায়িক চুক্তি, কর্পোরেট ব্যাংকিং ও নথি ব্যবস্থাপনা",
    ],
    editionNoteBn: BOOK_PRICING_NOTICE_BN,
    availabilityState: "UPCOMING_PREVIEW",
    featured: false,
    coverPalette: {
      spineHex: "#081838",
      coverHex: "#20335c",
      accentHex: "#c59028",
      textHex: "#ffffff",
    },
    relatedCourseCategorySlug: "entrepreneurship-sme",
    relatedServiceCategorySlug: "business-startup-advisory",
    relatedLicensingCategorySlug: "general-business-registration",
  },
  {
    id: "book-preview-corporate-tax-audit",
    slug: "corporate-tax-audit-dispute-resolution-handbook",
    titleBn: "কর্পোরেট ট্যাক্স অডিট ও শুনানি প্রস্তুতি: ব্যবহারিক নির্দেশিকা",
    titleEn: "Corporate Tax Audit & Hearing Preparation: Practical Field Guide",
    subtitleBn:
      "কর আইনের ধারা অনুযায়ী অডিট নোটিশ ব্যবস্থাপনা, শুনানির কার্যবিবরণী, আপিল ও নথিপত্র সমন্বয়ের কৌশল",
    categorySlug: "corporate-tax-audit",
    categoryNameBn: "কর্পোরেট ট্যাক্স অডিট",
    categoryNameEn: "Corporate Tax Audit",
    summaryBn:
      "কর্পোরেট করদাতা ও উপদেষ্টাদের জন্য আয়কর অডিট, বিরোধ নিষ্পত্তি ও কর শুনানি মোকাবিলার প্রস্তাবিত প্র্যাকটিক্যাল হ্যান্ডবুক।",
    audienceBn:
      "সিএফও, ফাইন্যান্স ডিরেক্টর, হেড অব ট্যাক্স, চার্টার্ড অ্যাকাউন্ট্যান্ট ও কর্পোরেট ট্যাক্স পরামর্শক।",
    topicsBn: [
      "কর্পোরেট ট্যাক্স অডিট নোটিশ বিশ্লেষণ ও প্রাথমিক জবাব",
      "শুনানিতে নথিপত্র ও প্রমাণাদি উপস্থাপন কৌশল",
      "ট্যাক্স অ্যাসেসমেন্ট অর্ডার পর্যালোচনা ও রিওপেনিং প্রতিকার",
      "ট্যাক্সেস আপিল ট্রাইব্যুনাল ও রেফারেন্স আবেদনের পূর্বপ্রস্তুতি",
    ],
    editionNoteBn: BOOK_PRICING_NOTICE_BN,
    availabilityState: "UPCOMING_PREVIEW",
    featured: false,
    coverPalette: {
      spineHex: "#081838",
      coverHex: "#182c50",
      accentHex: "#dfb15b",
      textHex: "#ffffff",
    },
    relatedCourseCategorySlug: "income-tax",
    relatedServiceCategorySlug: "income-tax-solutions",
    relatedLicensingCategorySlug: "general-business-registration",
  },
  {
    id: "book-preview-internal-compliance-procedures",
    slug: "internal-compliance-sop-corporate-governance-manual",
    titleBn: "অভ্যন্তরীণ কমপ্লায়েন্স ও এসওপি (SOP): কর্পোরেট গভর্নেন্স ম্যানুয়াল",
    titleEn: "Internal Compliance & SOP: Corporate Governance Field Manual",
    subtitleBn:
      "কোম্পানির অভ্যন্তরীণ নিয়ন্ত্রণ, কমপ্লায়েন্স ট্র্যাকিং, পলিসি ফ্রেমওয়ার্ক ও ঝুঁকি ব্যবস্থাপনা রূপরেখা",
    categorySlug: "internal-compliance-procedures",
    categoryNameBn: "অভ্যন্তরীণ কমপ্লায়েন্স ও এসওপি",
    categoryNameEn: "Internal Compliance Procedures",
    summaryBn:
      "প্রতিষ্ঠানিক সুশাসন ও রেগুলেটরি ঝুঁকি এড়াতে কার্যকর স্ট্যান্ডার্ড অপারেটিং প্রসিডিউর (SOP) এবং অডিট ট্রেইল প্রণয়নের প্রস্তাবিত সংকলন।",
    audienceBn:
      "ম্যানেজিং ডিরেক্টর, চিফ কমপ্লায়েন্স অফিসার, ইন্টারনাল অডিটর ও অপারেশনস ম্যানেজার।",
    topicsBn: [
      "ব্যবসার মূল বিভাগসমূহের স্ট্যান্ডার্ড অপারেটিং প্রসিডিউর (SOP) প্রণয়ন",
      "অভ্যন্তরীণ অডিট চেকলিস্ট ও ডকুমেন্টেড কন্ট্রোল পলিসি",
      "রেগুলেটরি নন-কমপ্লায়েন্স ঝুঁকি শনাক্তকরণ ও মনিটরিং",
      "বোর্ড কমিটি রিপোর্টিং ও তথ্য সংরক্ষণ নীতিমালা",
    ],
    editionNoteBn: BOOK_PRICING_NOTICE_BN,
    availabilityState: "UPCOMING_PREVIEW",
    featured: false,
    coverPalette: {
      spineHex: "#3f315a",
      coverHex: "#4e3c6d",
      accentHex: "#c59028",
      textHex: "#ffffff",
    },
    relatedCourseCategorySlug: "company-secretarial",
    relatedServiceCategorySlug: "company-secretarial-compliance",
    relatedLicensingCategorySlug: "general-business-registration",
  },
];

export function listBookCategories(): PublicBookCategoryDTO[] {
  const counts = new Map<string, number>();
  for (const book of BOOK_PREVIEW_CATALOG) {
    counts.set(book.categorySlug, (counts.get(book.categorySlug) ?? 0) + 1);
  }
  return RAW_BOOK_CATEGORIES.map((cat) => ({
    ...cat,
    previewCount: counts.get(cat.slug) ?? 0,
  }));
}

export function listBookCatalog(filter?: {
  categorySlug?: string;
  q?: string;
  limit?: number;
}): { categories: PublicBookCategoryDTO[]; items: PublicBookPreview[] } {
  const categories = listBookCategories();
  const catSlug = filter?.categorySlug?.trim() || "";
  const query = filter?.q?.trim() || "";

  let items = BOOK_PREVIEW_CATALOG.filter((book) =>
    catSlug ? book.categorySlug === catSlug : true,
  ).filter((book) =>
    query
      ? matchesSearchQuery(query, [
          book.titleBn,
          book.titleEn,
          book.subtitleBn,
          book.summaryBn,
          book.categoryNameBn,
          book.categoryNameEn,
          ...book.topicsBn,
        ])
      : true,
  );

  if (typeof filter?.limit === "number" && filter.limit > 0) {
    items = items.slice(0, filter.limit);
  }

  return { categories, items };
}

export function getBookPreviewBySlug(slug: string): PublicBookPreview | null {
  return BOOK_PREVIEW_CATALOG.find((book) => book.slug === slug) ?? null;
}

export function searchBookPreviews(query: string): PublicBookPreview[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  return listBookCatalog({ q: trimmed }).items.slice(0, 6);
}

export function listRelatedBooksForCourseCategory(
  courseCategorySlug: string,
  limit = 2,
): PublicBookPreview[] {
  const direct = BOOK_PREVIEW_CATALOG.filter(
    (b) => b.relatedCourseCategorySlug === courseCategorySlug,
  );
  if (direct.length >= limit) return direct.slice(0, limit);
  const seen = new Set(direct.map((b) => b.slug));
  const extras = BOOK_PREVIEW_CATALOG.filter((b) => !seen.has(b.slug));
  return [...direct, ...extras].slice(0, limit);
}

export function listRelatedBooksForServiceCategory(
  serviceCategorySlug: string,
  limit = 2,
): PublicBookPreview[] {
  const direct = BOOK_PREVIEW_CATALOG.filter(
    (b) => b.relatedServiceCategorySlug === serviceCategorySlug,
  );
  if (direct.length >= limit) return direct.slice(0, limit);
  const seen = new Set(direct.map((b) => b.slug));
  const extras = BOOK_PREVIEW_CATALOG.filter((b) => !seen.has(b.slug));
  return [...direct, ...extras].slice(0, limit);
}

export function listRelatedBooksForLicensingCategory(
  licensingCategorySlug: string,
  limit = 2,
): PublicBookPreview[] {
  const direct = BOOK_PREVIEW_CATALOG.filter(
    (b) => b.relatedLicensingCategorySlug === licensingCategorySlug,
  );
  if (direct.length >= limit) return direct.slice(0, limit);
  const seen = new Set(direct.map((b) => b.slug));
  const extras = BOOK_PREVIEW_CATALOG.filter((b) => !seen.has(b.slug));
  return [...direct, ...extras].slice(0, limit);
}

const DEFAULT_BOOK_PALETTE: PublicBookCoverPalette = {
  spineHex: "#081838",
  coverHex: "#152b54",
  accentHex: "#c59028",
  textHex: "#f8f8f8",
};

function parseCoverPalette(raw: unknown): PublicBookCoverPalette {
  if (!raw || typeof raw !== "object") return DEFAULT_BOOK_PALETTE;
  const record = raw as Record<string, unknown>;
  return {
    spineHex:
      typeof record.spineHex === "string"
        ? record.spineHex
        : DEFAULT_BOOK_PALETTE.spineHex,
    coverHex:
      typeof record.coverHex === "string"
        ? record.coverHex
        : DEFAULT_BOOK_PALETTE.coverHex,
    accentHex:
      typeof record.accentHex === "string"
        ? record.accentHex
        : DEFAULT_BOOK_PALETTE.accentHex,
    textHex:
      typeof record.textHex === "string"
        ? record.textHex
        : DEFAULT_BOOK_PALETTE.textHex,
  };
}

export function mapDbBookToPublicPreview(dbBook: {
  id: string;
  slug: string;
  sku: string | null;
  isbn: string | null;
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  summaryBn: string;
  audienceBn: string;
  topicsBn: string[];
  editionLabel: string | null;
  editionNoteBn: string;
  pagesCount: number | null;
  languageBnEn: string | null;
  deliveryMode: string | null;
  pricePaisa: number | null;
  stockQuantity: number;
  contentStatus: string;
  availabilityStatus: string;
  featured: boolean;
  coverPalette: unknown;
  relatedCourseCategorySlug: string | null;
  relatedServiceCategorySlug: string | null;
  relatedLicensingCategorySlug: string | null;
  lastVerifiedAt: Date | null;
  verifiedBy: string | null;
  category: {
    slug: string;
    nameBn: string;
    nameEn: string;
  };
}): PublicBookPreview {
  const isPublishedPriced =
    dbBook.contentStatus === "PUBLISHED" &&
    (dbBook.availabilityStatus === "ACTIVE" ||
      dbBook.availabilityStatus === "AVAILABLE") &&
    typeof dbBook.pricePaisa === "number" &&
    dbBook.pricePaisa > 0;

  return {
    id: dbBook.id,
    slug: dbBook.slug,
    sku: dbBook.sku,
    isbn: dbBook.isbn,
    titleBn: dbBook.titleBn,
    titleEn: dbBook.titleEn,
    subtitleBn: dbBook.subtitleBn,
    categorySlug: dbBook.category.slug,
    categoryNameBn: dbBook.category.nameBn,
    categoryNameEn: dbBook.category.nameEn,
    summaryBn: dbBook.summaryBn,
    audienceBn: dbBook.audienceBn,
    topicsBn: dbBook.topicsBn,
    editionLabel: dbBook.editionLabel,
    editionNoteBn: dbBook.editionNoteBn,
    pagesCount: dbBook.pagesCount,
    languageBnEn: dbBook.languageBnEn,
    deliveryMode: dbBook.deliveryMode,
    pricePaisa: isPublishedPriced ? dbBook.pricePaisa : null,
    priceBdt:
      isPublishedPriced && typeof dbBook.pricePaisa === "number"
        ? fromPaisa(dbBook.pricePaisa)
        : null,
    inStock: isPublishedPriced ? dbBook.stockQuantity > 0 : false,
    stockQuantity: isPublishedPriced ? dbBook.stockQuantity : undefined,
    availabilityState: isPublishedPriced
      ? "PUBLISHED_PRICED"
      : "UPCOMING_PREVIEW",
    featured: dbBook.featured,
    coverPalette: parseCoverPalette(dbBook.coverPalette),
    relatedCourseCategorySlug: dbBook.relatedCourseCategorySlug ?? "",
    relatedServiceCategorySlug: dbBook.relatedServiceCategorySlug ?? "",
    relatedLicensingCategorySlug: dbBook.relatedLicensingCategorySlug ?? undefined,
    lastVerifiedAt: dbBook.lastVerifiedAt
      ? dbBook.lastVerifiedAt.toISOString()
      : null,
    verifiedBy: dbBook.verifiedBy,
  };
}

/**
 * Loads governed published books from PostgreSQL when migrated & populated,
 * gracefully falling back to verified pre-launch previews when unseeded.
 */
export async function loadBookCatalog(filter?: {
  categorySlug?: string;
  q?: string;
  limit?: number;
}): Promise<{ categories: PublicBookCategoryDTO[]; items: PublicBookPreview[] }> {
  if (isDatabaseConfigured() && (await isBooksSchemaReady())) {
    try {
      const [dbCategories, dbBooks] = await Promise.all([
        prisma.bookCategory.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            books: {
              where: { contentStatus: "PUBLISHED" },
              select: { id: true },
            },
          },
        }),
        prisma.book.findMany({
          where: { contentStatus: "PUBLISHED" },
          orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
          include: {
            category: {
              select: { slug: true, nameBn: true, nameEn: true },
            },
          },
        }),
      ]);

      if (dbBooks.length > 0) {
        const mapped = dbBooks.map(mapDbBookToPublicPreview);
        const catSlug = filter?.categorySlug?.trim() || "";
        const query = filter?.q?.trim() || "";

        let items = mapped
          .filter((book) => (catSlug ? book.categorySlug === catSlug : true))
          .filter((book) =>
            query
              ? matchesSearchQuery(query, [
                  book.titleBn,
                  book.titleEn,
                  book.subtitleBn,
                  book.summaryBn,
                  book.categoryNameBn,
                  book.categoryNameEn,
                  ...book.topicsBn,
                ])
              : true,
          );

        if (typeof filter?.limit === "number" && filter.limit > 0) {
          items = items.slice(0, filter.limit);
        }

        const categories: PublicBookCategoryDTO[] = dbCategories.map((cat) => ({
          slug: cat.slug,
          nameBn: cat.nameBn,
          nameEn: cat.nameEn,
          shortDescBn: cat.shortDescBn,
          sortOrder: cat.sortOrder,
          previewCount: cat.books.length,
        }));

        return { categories, items };
      }
    } catch {
      // Fallback to verified preview catalog below
    }
  }

  if (process.env.DISABLE_SEED_FALLBACK === "true") {
    return { categories: [], items: [] };
  }
  return listBookCatalog(filter);
}

export async function getGovernedBookBySlug(
  slug: string,
): Promise<PublicBookPreview | null> {
  if (isDatabaseConfigured() && (await isBooksSchemaReady())) {
    try {
      const dbBook = await prisma.book.findUnique({
        where: { slug },
        include: {
          category: {
            select: { slug: true, nameBn: true, nameEn: true },
          },
        },
      });
      if (dbBook) {
        if (
          dbBook.contentStatus !== "PUBLISHED" ||
          dbBook.availabilityStatus === "INACTIVE"
        ) {
          return null;
        }
        return mapDbBookToPublicPreview(dbBook);
      }

      const dbHasBooks = (await prisma.book.count()) > 0;
      if (dbHasBooks) {
        return null;
      }
    } catch {
      if (process.env.NODE_ENV === "production") {
        return null;
      }
    }
  }
  if (process.env.DISABLE_SEED_FALLBACK === "true") {
    return null;
  }
  return getBookPreviewBySlug(slug);
}

export async function searchGovernedBooks(
  query: string,
): Promise<PublicBookPreview[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const { items } = await loadBookCatalog({ q: trimmed });
  return items.slice(0, 6);
}
