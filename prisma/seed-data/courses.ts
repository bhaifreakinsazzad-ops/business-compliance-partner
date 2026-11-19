import { AvailabilityStatus, ContentStatus } from "@prisma/client";

export interface CourseModuleSeed {
  titleBn: string;
  topicsBn: string[];
}

export interface SeedCourse {
  slug: string;
  categorySlug: string;
  titleBn: string;
  titleEn: string;
  summaryBn: string;
  summaryEn: string;
  audienceBn: string;
  outcomes: string[];
  syllabus: CourseModuleSeed[];
  aliases: string[];
  contentStatus: ContentStatus;
  availabilityStatus: AvailabilityStatus;
  featured: boolean;
  sortOrder: number;
  verifiedBy: string | null;
  lastVerifiedAt: Date | null;
}

const VERIFIED_DATE = new Date("2026-11-19T00:00:00.000Z");
const REVIEWER = "Draft Candidate Inventory (Client Verification Pending)";

const DRAFT_COURSE_SPECS: Array<{
  slug: string;
  categorySlug: string;
  titleEn: string;
  titleBn: string;
  audienceBn?: string;
}> = [
  // Income Tax (PDF p. 2)
  { slug: "individual-income-tax-return-practical", categorySlug: "income-tax", titleEn: "Individual Income Tax Return Practical Course", titleBn: "ব্যক্তিগত আয়কর রিটার্ন ব্যবহারিক কোর্স" },
  { slug: "corporate-taxation-tax-planning", categorySlug: "income-tax", titleEn: "Corporate Taxation & Tax Planning", titleBn: "কর্পোরেট ট্যাক্সেশন ও ট্যাক্স প্ল্যানিং" },
  { slug: "tds-ait-practical-training", categorySlug: "income-tax", titleEn: "TDS & AIT Practical Training", titleBn: "TDS ও AIT ব্যবহারিক প্রশিক্ষণ" },
  { slug: "etin-registration-to-return-submission", categorySlug: "income-tax", titleEn: "e-TIN Registration to Return Submission", titleBn: "e-TIN নিবন্ধন থেকে রিটার্ন দাখিল" },
  { slug: "tax-calculation-with-excel", categorySlug: "income-tax", titleEn: "Tax Calculation with Excel", titleBn: "এক্সেলের মাধ্যমে আয়কর হিসাব" },
  { slug: "tax-audit-assessment-course", categorySlug: "income-tax", titleEn: "Tax Audit & Assessment", titleBn: "ট্যাক্স অডিট ও অ্যাসেসমেন্ট পরিচিতি" },
  { slug: "tax-law-finance-act-analysis", categorySlug: "income-tax", titleEn: "Tax Law and Finance Act Analysis", titleBn: "আয়কর আইন ও অর্থ আইন বিশ্লেষণ" },
  { slug: "tax-consultant-professional-training", categorySlug: "income-tax", titleEn: "Tax Consultant Professional Training", titleBn: "ট্যাক্স কনসালটেন্ট পেশাদার প্রশিক্ষণ" },

  // VAT & Mushak (PDF p. 2)
  { slug: "practical-bin-registration-course", categorySlug: "vat-and-mushak", titleEn: "Practical BIN Registration", titleBn: "ব্যবহারিক BIN নিবন্ধন প্রশিক্ষণ" },
  { slug: "monthly-vat-return-mushak-9-1", categorySlug: "vat-and-mushak", titleEn: "Monthly VAT Return Submission (Mushak 9.1)", titleBn: "মাসিক ভ্যাট রিটার্ন ও মূসক ৯.১ দাখিল" },
  { slug: "all-mushak-forms-explained", categorySlug: "vat-and-mushak", titleEn: "All Mushak Forms Explained", titleBn: "প্রয়োজনীয় সকল মূসক ফর্ম পরিচিতি" },
  { slug: "vat-vds-management-course", categorySlug: "vat-and-mushak", titleEn: "VAT & VDS Management", titleBn: "ভ্যাট ও VDS ব্যবস্থাপনা" },
  { slug: "vat-audit-assessment-course", categorySlug: "vat-and-mushak", titleEn: "VAT Audit and Assessment", titleBn: "ভ্যাট অডিট ও অ্যাসেসমেন্ট" },
  { slug: "vat-software-practical-training", categorySlug: "vat-and-mushak", titleEn: "VAT Software Practical Training", titleBn: "ভ্যাট সফটওয়্যার ব্যবহারিক প্রশিক্ষণ" },
  { slug: "vat-consultant-professional-course", categorySlug: "vat-and-mushak", titleEn: "VAT Consultant Professional Course", titleBn: "ভ্যাট কনসালটেন্ট পেশাদার কোর্স" },
  { slug: "vat-law-rules-sro-analysis", categorySlug: "vat-and-mushak", titleEn: "VAT Law, Rules & SRO Analysis", titleBn: "ভ্যাট আইন, বিধিমালা ও SRO বিশ্লেষণ" },

  // Import/Export/Customs (PDF p. 2)
  { slug: "complete-import-business-course", categorySlug: "import-export-customs", titleEn: "Complete Import Business Course", titleBn: "সম্পূর্ণ আমদানি ব্যবসা কোর্স" },
  { slug: "complete-export-business-course", categorySlug: "import-export-customs", titleEn: "Complete Export Business Course", titleBn: "সম্পূর্ণ রপ্তানি ব্যবসা কোর্স" },
  { slug: "customs-clearance-practical-course", categorySlug: "import-export-customs", titleEn: "Customs Clearance Practical Course", titleBn: "কাস্টমস ক্লিয়ারেন্স ব্যবহারিক কোর্স" },
  { slug: "hs-code-customs-duty-calculation", categorySlug: "import-export-customs", titleEn: "HS Code & Customs Duty Calculation", titleBn: "HS কোড ও কাস্টমস শুল্ক হিসাব" },
  { slug: "asycuda-world-training", categorySlug: "import-export-customs", titleEn: "ASYCUDA World Training", titleBn: "ASYCUDA World সিস্টেম পরিচিতি" },
  { slug: "cnf-agent-practical-training", categorySlug: "import-export-customs", titleEn: "C&F Agent Practical Training", titleBn: "C&F এজেন্ট ব্যবহারিক প্রশিক্ষণ" },
  { slug: "bond-management-professional-course", categorySlug: "import-export-customs", titleEn: "Bond Management Professional Course", titleBn: "বন্ড ব্যবস্থাপনা পেশাদার কোর্স" },
  { slug: "landed-cost-import-costing-excel", categorySlug: "import-export-customs", titleEn: "Landed Cost & Import Costing with Excel", titleBn: "এক্সেল দিয়ে ল্যান্ডেড কস্ট ও ইমপোর্ট কস্টিং" },

  // e-GP & Tender (PDF p. 3)
  { slug: "practical-government-tender-management", categorySlug: "egp-and-tender", titleEn: "Practical Government Tender Management", titleBn: "ব্যবহারিক সরকারি টেন্ডার ব্যবস্থাপনা" },
  { slug: "tender-document-preparation-evaluation", categorySlug: "egp-and-tender", titleEn: "Tender Document Preparation & Eligibility", titleBn: "দরপত্র নথি প্রস্তুতি ও যোগ্যতা যাচাই" },
  { slug: "ppr-public-procurement-rules-course", categorySlug: "egp-and-tender", titleEn: "PPR & Public Procurement Rules (PPR 2025)", titleBn: "সরকারি ক্রয় বিধিমালা (PPR 2025) বিশ্লেষণ" },
  { slug: "works-goods-services-tender-training", categorySlug: "egp-and-tender", titleEn: "Works, Goods & Services Tender Training", titleBn: "পূর্ত, পণ্য ও সেবা টেন্ডার প্রশিক্ষণ" },
  { slug: "egp-for-new-contractors", categorySlug: "egp-and-tender", titleEn: "e-GP for New Contractors", titleBn: "নতুন ঠিকাদারদের জন্য e-GP নির্দেশিকা" },

  // Digital Business & E-commerce (PDF pp. 3-4)
  { slug: "complete-ecommerce-business-setup-course", categorySlug: "digital-business-ecommerce", titleEn: "Complete E-commerce Business Setup", titleBn: "ই-কমার্স ব্যবসা সেটআপ ও পরিচালনা" },
  { slug: "marketplace-daraz-shopify-operations", categorySlug: "digital-business-ecommerce", titleEn: "Marketplace, Daraz & Online Store Operations", titleBn: "অনলাইন মার্কেটপ্লেস ও স্টোর ব্যবস্থাপনা" },
  { slug: "software-it-consultancy-business-setup", categorySlug: "digital-business-ecommerce", titleEn: "IT, Software & Online Agency Setup", titleBn: "আইটি, সফটওয়্যার ও সার্ভিস এজেন্সি সেটআপ" },
  { slug: "ecommerce-vat-tax-consumer-compliance", categorySlug: "digital-business-ecommerce", titleEn: "E-commerce VAT, Tax & Consumer Rights Compliance", titleBn: "ই-কমার্স ভ্যাট, ট্যাক্স ও ভোক্তা অধিকার কমপ্লায়েন্স" },

  // Accounting (PDF p. 4)
  { slug: "practical-accounting-basic-to-advanced", categorySlug: "accounting", titleEn: "Practical Accounting from Basic to Advanced", titleBn: "বেসিক থেকে অ্যাডভান্সড ব্যবহারিক অ্যাকাউন্টিং" },
  { slug: "complete-bookkeeping-financial-statements", categorySlug: "accounting", titleEn: "Bookkeeping & Financial Statement Preparation", titleBn: "বুককিপিং ও আর্থিক বিবরণী প্রস্তুতি" },
  { slug: "quickbooks-xero-tally-training", categorySlug: "accounting", titleEn: "QuickBooks / Xero / Tally Practical Training", titleBn: "QuickBooks, Xero ও Tally ব্যবহারিক প্রশিক্ষণ" },
  { slug: "internal-audit-cost-accounting", categorySlug: "accounting", titleEn: "Internal Audit & Cost Accounting", titleBn: "ইন্টারনাল অডিট ও কস্ট অ্যাকাউন্টিং" },

  // Company Secretarial (PDF p. 4)
  { slug: "corporate-secretarial-practice-company-law", categorySlug: "company-secretarial", titleEn: "Corporate Secretarial Practice & Company Law", titleBn: "কর্পোরেট সেক্রেটারিয়াল প্র্যাকটিস ও কোম্পানি আইন" },
  { slug: "annual-return-statutory-compliance-course", categorySlug: "company-secretarial", titleEn: "Annual Return & Statutory Compliance", titleBn: "বার্ষিক রিটার্ন ও বিধিবদ্ধ কমপ্লায়েন্স" },

  // International Trade (PDF pp. 4-5)
  { slug: "international-trade-lc-incoterms", categorySlug: "international-trade", titleEn: "International Trade, LC & Incoterms 2020", titleBn: "আন্তর্জাতিক বাণিজ্য, LC ডকুমেন্টেশন ও Incoterms" },
  { slug: "sourcing-supplier-verification-import", categorySlug: "international-trade", titleEn: "Global Sourcing & Supplier Verification", titleBn: "আন্তর্জাতিক সোর্সিং ও সাপ্লায়ার যাচাই" },

  // HR & Labour (PDF p. 5)
  { slug: "practical-hr-bangladesh-labour-law", categorySlug: "hr-and-labour", titleEn: "Practical HR Management & Bangladesh Labour Law", titleBn: "এইচআর ব্যবস্থাপনা ও বাংলাদেশ শ্রম আইন" },
  { slug: "payroll-compensation-factory-compliance", categorySlug: "hr-and-labour", titleEn: "Payroll Management & Factory HR Compliance", titleBn: "পে-রোল ব্যবস্থাপনা ও ফ্যাক্টরি এইচআর কমপ্লায়েন্স" },

  // Entrepreneurship & SME (PDF p. 5)
  { slug: "how-to-start-business-bangladesh-sme", categorySlug: "entrepreneurship-sme", titleEn: "Entrepreneurship & SME Business Management in Bangladesh", titleBn: "বাংলাদেশে ব্যবসা শুরু ও এসএমই ব্যবস্থাপনা" },
  { slug: "business-plan-startup-financial-planning", categorySlug: "entrepreneurship-sme", titleEn: "Business Plan & Startup Financial Planning", titleBn: "ব্যবসায়িক পরিকল্পনা ও স্টার্টআপ ফিন্যান্সিয়াল প্ল্যানিং" },
];

const FEATURED_COURSES: SeedCourse[] = [
  {
    slug: "complete-income-tax-course-bangladesh",
    categorySlug: "income-tax",
    titleBn: "বাংলাদেশে সম্পূর্ণ আয়কর (Income Tax) ব্যবহারিক কোর্স",
    titleEn: "Complete Income Tax Course — Bangladesh",
    summaryBn: "ব্যক্তি ও কর্পোরেট আয়কর কাঠামো, e-TIN, TDS/AIT এবং রিটার্ন প্রস্তুতির মৌলিক ও ব্যবহারিক ধারণা। (আগ্রহ নিবন্ধন ও সিলেবাস অনুমোদনের অপেক্ষায়)",
    summaryEn: "Structured foundation covering Bangladesh Income Tax framework, e-TIN, TDS/AIT, and return preparation concepts.",
    audienceBn: "নতুন করদাতা, উদ্যোক্তা, অ্যাকাউন্ট্যান্ট ও কর বিষয়ে ব্যবহারিক দক্ষতা অর্জন করতে আগ্রহী পেশাজীবী।",
    outcomes: [
      "বাংলাদেশের আয়কর কাঠামো ও প্রধান ধারাগুলোর স্পষ্ট ধারণা",
      "e-TIN নিবন্ধন ও প্রযোজ্য রিটার্ন প্রস্তুতির ধাপ বোঝা",
      "TDS, AIT ও বেতন-ব্যবসা আয়ের প্রাথমিক কর হিসাব পদ্ধতি",
    ],
    syllabus: [
      { titleBn: "মডিউল ১: আয়কর আইনের মৌলিক কাঠামো ও e-TIN", topicsBn: ["আয়কর পরিচিতি", "e-TIN নিবন্ধন প্রক্রিয়া", "আয়ের খাতসমূহ"] },
      { titleBn: "মডিউল ২: ব্যক্তিগত ও ব্যবসা আয়কর হিসাব", topicsBn: ["বেতন ও ব্যবসা আয়ের হিসাব", "IT-10B ও সম্পদ বিবরণী ধারণা", "রিবেট ও ছাড়"] },
      { titleBn: "মডিউল ৩: TDS, AIT ও রিটার্ন দাখিল প্রস্তুতি", topicsBn: ["উৎসে কর (TDS)", "অগ্রিম আয়কর (AIT)", "রিটার্ন যাচাই ও কমপ্লায়েন্স ক্যালেন্ডার"] },
    ],
    aliases: ["income tax", "tin", "return", "nbr", "ট্যাক্স"],
    contentStatus: ContentStatus.PUBLISHED,
    availabilityStatus: AvailabilityStatus.UPCOMING,
    featured: true,
    sortOrder: 1,
    verifiedBy: REVIEWER,
    lastVerifiedAt: VERIFIED_DATE,
  },
  {
    slug: "complete-vat-mushak-course-bangladesh",
    categorySlug: "vat-and-mushak",
    titleBn: "সম্পূর্ণ ভ্যাট ও মূসক (VAT & Mushak) ব্যবহারিক কোর্স",
    titleEn: "Complete VAT & Mushak Course — Bangladesh",
    summaryBn: "BIN নিবন্ধন, মূসক ৬.৩ চালান, VDS ও মাসিক মূসক ৯.১ রিটার্ন ব্যবস্থাপনার সুসংগঠিত পাঠ্যক্রম।",
    summaryEn: "Practical curriculum covering BIN registration, Mushak 6.3, VDS, and monthly Mushak 9.1 filing workflows.",
    audienceBn: "ব্যবসায়িক প্রতিষ্ঠানের অ্যাকাউন্টস টিম, এসএমই উদ্যোক্তা এবং ভ্যাট কমপ্লায়েন্সে আগ্রহী পেশাজীবী।",
    outcomes: [
      "টার্নওভার ও ভ্যাট নিবন্ধন (BIN) সীমা ও প্রক্রিয়া বোঝা",
      "ক্রয়-বিক্রয় রেজিস্টার (মূসক ৬.১, ৬.২) ও চালান (৬.৩) পরিচালনা",
      "মাসিক মূসক ৯.১ রিটার্ন ও ইনপুট ট্যাক্স ক্রেডিট সমন্বয় ধারণা",
    ],
    syllabus: [
      { titleBn: "মডিউল ১: ভ্যাট আইন ও ১৩-ডিজিট BIN নিবন্ধন", topicsBn: ["মূসক ও সম্পূরক শুল্ক আইন ধারণা", "BIN নিবন্ধন ও নথি"] },
      { titleBn: "মডিউল ২: মূসক রেজিস্টার ও VDS", topicsBn: ["মূসক ৬.১, ৬.২, ৬.৩", "উৎসে ভ্যাট কর্তন (VDS) ও মূসক ৬.৬"] },
      { titleBn: "মডিউল ৩: মূসক ৯.১ ও অডিট প্রস্তুতি", topicsBn: ["মাসিক রিটার্ন ধাপসমূহ", "নথি সংরক্ষণ ও রিকনসিলিয়েশন"] },
    ],
    aliases: ["vat", "mushak", "bin", "vds", "ভ্যাট", "মূসক"],
    contentStatus: ContentStatus.PUBLISHED,
    availabilityStatus: AvailabilityStatus.UPCOMING,
    featured: true,
    sortOrder: 2,
    verifiedBy: REVIEWER,
    lastVerifiedAt: VERIFIED_DATE,
  },
  {
    slug: "complete-egp-registration-tender-submission",
    categorySlug: "egp-and-tender",
    titleBn: "e-GP নিবন্ধন থেকে সরকারি দরপত্র দাখিল কোর্স",
    titleEn: "Complete e-GP Registration to Tender Submission",
    summaryBn: "সরকারি ই-জিপি পোর্টালের নিবন্ধন প্রক্রিয়া, দরপত্র নথি মূল্যায়ন ও প্রযোজ্য PPR 2025 বিধিমালা পরিচিতি।",
    summaryEn: "Step-by-step orientation to e-GP registration, tender documentation, and PPR 2025 procurement compliance.",
    audienceBn: "নতুন ঠিকাদার, সরবরাহকারী প্রতিষ্ঠান ও টেন্ডার ডকুমেন্টেশন পরিচালনাকারী কর্মকর্তা।",
    outcomes: [
      "e-GP নিবন্ধনের প্রাথমিক যোগ্যতা ও নথিপত্র যাচাই",
      "দরপত্রের শর্তাবলি (ITT/TDS) বিশ্লেষণ ও ভুল এড়ানো",
      "PPR 2025 অনুযায়ী কমপ্লায়েন্স ও পে-অর্ডার/সিকিউরিটি ধারণা",
    ],
    syllabus: [
      { titleBn: "মডিউল ১: e-GP ও PPR 2025 পরিচিতি", topicsBn: ["BPPA ও ই-জিপি কাঠামো", "নিবন্ধন ও নবায়ন নিয়ম"] },
      { titleBn: "মডিউল ২: দরপত্র নথি প্রস্তুতি", topicsBn: ["নথি তালিকা ও যোগ্যতা", "টেন্ডার সিকিউরিটি ও সাবমিশন"] },
    ],
    aliases: ["e-gp", "egp", "tender", "bppa", "টেন্ডার"],
    contentStatus: ContentStatus.PUBLISHED,
    availabilityStatus: AvailabilityStatus.UPCOMING,
    featured: true,
    sortOrder: 3,
    verifiedBy: REVIEWER,
    lastVerifiedAt: VERIFIED_DATE,
  },
  {
    slug: "company-formation-rjsc-practical-course",
    categorySlug: "company-secretarial",
    titleBn: "Smart RJSC ও কোম্পানি গঠন ব্যবহারিক কোর্স",
    titleEn: "Company Formation & RJSC Practical Course",
    summaryBn: "প্রাইভেট লিমিটেড ও একক মালিকানাধীন কোম্পানি (OPC) গঠন, নাম ছাড়পত্র এবং MOA/AOA ডকুমেন্টেশন পরিচিতি।",
    summaryEn: "Foundational training on Smart RJSC name clearance, Private Ltd / OPC incorporation, MOA/AOA, and filings.",
    audienceBn: "স্টার্টআপ প্রতিষ্ঠাতা, কর্পোরেট সেক্রেটারিয়াল সহকারী ও আইন-অ্যাকাউন্টিং শিক্ষার্থী।",
    outcomes: [
      "প্রোপ্রাইটরশিপ, পার্টনারশিপ ও প্রাইভেট লিমিটেড কাঠামোর তুলনা",
      "Smart RJSC নাম ছাড়পত্র ও MOA/AOA মূল উপাদান বোঝা",
      "নিবন্ধন-পরবর্তী বার্ষিক রিটার্ন ও বিধিবদ্ধ কমপ্লায়েন্স ধারণা",
    ],
    syllabus: [
      { titleBn: "মডিউল ১: ব্যবসার আইনি কাঠামো ও নাম ছাড়পত্র", topicsBn: ["ব্যবসার ধরন নির্বাচন", "RJSC নেম ক্লিয়ারেন্স নিয়ম"] },
      { titleBn: "মডিউল ২: ইনকর্পোরেশন ও কর্পোরেট ফাইলিং", topicsBn: ["MOA ও AOA", "Form XII, XV ও বার্ষিক রিটার্ন পরিচিতি"] },
    ],
    aliases: ["rjsc", "company", "incorporation", "moa", "aoa", "কোম্পানি"],
    contentStatus: ContentStatus.PUBLISHED,
    availabilityStatus: AvailabilityStatus.INTEREST_ONLY,
    featured: true,
    sortOrder: 4,
    verifiedBy: REVIEWER,
    lastVerifiedAt: VERIFIED_DATE,
  },
  {
    slug: "complete-import-export-customs-foundation",
    categorySlug: "import-export-customs",
    titleBn: "আমদানি-রপ্তানি ব্যবসা ও কাস্টমস শুল্ক পরিচিতি কোর্স",
    titleEn: "Import-Export Business & Customs Essentials",
    summaryBn: "IRC/ERC নিবন্ধন, HS কোড যাচাই, LC ডকুমেন্টেশন ও পোর্ট ক্লিয়ারেন্সের ধাপগুলো সম্পর্কে সুস্পষ্ট গাইড।",
    summaryEn: "Structured foundation on IRC/ERC, HS code tariff analysis, LC documentation, and port clearance workflows.",
    audienceBn: "ট্রেডিং উদ্যোক্তা, সাপ্লাই চেইন ও কমার্শিয়াল এক্সিকিউটিভগণ।",
    outcomes: [
      "আমদানি ও রপ্তানি নিবন্ধন সনদ (IRC/ERC)-এর ভূমিকা বোঝা",
      "HS কোড অনুযায়ী শুল্ক-কর (CD, RD, SD, VAT, AIT) হিসাবের ধারণা",
      "Proforma Invoice, LC ও Bill of Entry নথির সমন্বয়",
    ],
    syllabus: [
      { titleBn: "মডিউল ১: ট্রেড লাইসেন্সিং ও IRC/ERC", topicsBn: ["আমদানি ও রপ্তানি নীতি", "IRC ও ERC প্রস্তুতি"] },
      { titleBn: "মডিউল ২: শুল্ক, HS কোড ও পোর্ট নথি", topicsBn: ["ল্যান্ডেড কস্ট হিসাব", "C&F সমন্বয় ও বিল অব এন্ট্রি"] },
    ],
    aliases: ["import", "export", "customs", "irc", "erc", "hs code", "আমদানি", "রপ্তানি"],
    contentStatus: ContentStatus.PUBLISHED,
    availabilityStatus: AvailabilityStatus.INTEREST_ONLY,
    featured: true,
    sortOrder: 5,
    verifiedBy: REVIEWER,
    lastVerifiedAt: VERIFIED_DATE,
  },
  {
    slug: "practical-sme-bookkeeping-accounting",
    categorySlug: "accounting",
    titleBn: "এসএমই বুককিপিং ও প্র্যাকটিক্যাল অ্যাকাউন্টিং কোর্স",
    titleEn: "SME Bookkeeping & Practical Accounting Course",
    summaryBn: "দৈনন্দিন লেনদেন সংরক্ষণ, ক্যাশ-ব্যাংক রিকনসিলিয়েশন এবং আর্থিক বিবরণী (P&L, Balance Sheet) বোঝার কোর্স।",
    summaryEn: "Practical SME bookkeeping, cash & bank reconciliation, and reading financial statements with Excel.",
    audienceBn: "ক্ষুদ্র ও মাঝারি ব্যবসায়ী, নতুন অ্যাকাউন্টস কর্মকর্তা ও ফিন্যান্স শিক্ষার্থী।",
    outcomes: [
      "দৈনন্দিন হিসাব ও লেজার সংরক্ষণের মানদণ্ড",
      "Profit & Loss এবং Balance Sheet প্রস্তুতি ও বিশ্লেষণ",
      "ব্যাংক স্টেটমেন্ট ও অডিটের জন্য হিসাব সমন্বয়",
    ],
    syllabus: [
      { titleBn: "মডিউল ১: বুককিপিং ও লেজার কাঠামো", topicsBn: ["ক্যাশ ও ব্যাংক বই", "চার্ট অব অ্যাকাউন্টস"] },
      { titleBn: "মডিউল ২: আর্থিক বিবরণী ও রিকনসিলিয়েশন", topicsBn: ["ট্রায়াল ব্যালেন্স", "P&L, ব্যালেন্স শিট ও ক্যাশ ফ্লো"] },
    ],
    aliases: ["accounting", "bookkeeping", "excel", "বুককিপিং", "অ্যাকাউন্টিং"],
    contentStatus: ContentStatus.PUBLISHED,
    availabilityStatus: AvailabilityStatus.INTEREST_ONLY,
    featured: true,
    sortOrder: 6,
    verifiedBy: REVIEWER,
    lastVerifiedAt: VERIFIED_DATE,
  },
];

const DRAFT_COURSES: SeedCourse[] = DRAFT_COURSE_SPECS.map((spec, idx) => ({
  slug: spec.slug,
  categorySlug: spec.categorySlug,
  titleBn: spec.titleBn,
  titleEn: spec.titleEn,
  summaryBn: `${spec.titleEn} বিষয়ক প্রস্তাবিত প্রশিক্ষণ মডিউল — চূড়ান্ত সিলেবাস ও সময়সূচি ক্লায়েন্ট অনুমোদনসাপেক্ষ।`,
  summaryEn: `Candidate curriculum topic: ${spec.titleEn}. Pending final operational readiness and syllabus verification.`,
  audienceBn: spec.audienceBn ?? "ব্যবসায়ী, উদ্যোক্তা ও সংশ্লিষ্ট পেশাজীবী।",
  outcomes: [
    "প্রযোজ্য নিয়মাবলি ও ডকুমেন্টেশনের কাঠামোগত ধারণা",
    "বাস্তব ব্যবসার ক্ষেত্রে প্রয়োগযোগ্য কর্মপ্রক্রিয়া বোঝা",
  ],
  syllabus: [
    {
      titleBn: "প্রস্তাবিত প্রাথমিক রূপরেখা (পর্যালোচনাধীন)",
      topicsBn: ["মৌলিক ধারণা ও নীতিমালা", "ডকুমেন্টেশন ও ব্যবহারিক উদাহরণ"],
    },
  ],
  aliases: [spec.titleEn.toLowerCase()],
  contentStatus: ContentStatus.DRAFT,
  availabilityStatus: AvailabilityStatus.INTEREST_ONLY,
  featured: false,
  sortOrder: 100 + idx,
  verifiedBy: null,
  lastVerifiedAt: null,
}));

export const SEED_COURSES: SeedCourse[] = [...FEATURED_COURSES, ...DRAFT_COURSES];
